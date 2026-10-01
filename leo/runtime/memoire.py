"""Durable mission bookkeeping, not a second store of personal/business facts.

MissionStore(path) opens only the explicitly supplied, broker-authorized SQLite
file (parent must exist). It does not discover files, contact a service, execute
payloads or delete records. The broker authenticates ``principal`` and checks
the path before calling this module. ``authority=True`` on create_mission is a
trusted broker capability assertion; NEVER copy it from model/tool input.

API (all IDs and principals are nonempty strings):
* create_mission(id, owner, project, mandat, source, readers, writers,
  authority=False) -> mission, version 1. Only the trusted broker can create.
* read_mission(id, principal) -> mission. Owner/writers/readers of THAT mission
  can read; owner/writers can write. Project names grant no inherited access.
* update_mission(id, principal, expected_version, patch) -> updated mission.
  Patch accepts only state and next_action. A state is descriptive, never an
  authorization to execute, spend, merge or publish. Mandate/source/ACL immutable.
* begin_operation(mission, principal, operation_id, payload,
  expected_version=None) -> operation. New operations REQUIRE expected_version;
  exact retries return the existing pending/unknown/completed record, even when
  the mission has since advanced. They never execute an effect.
* get_operation(mission, principal, operation_id) -> operation or None.
* complete_operation(mission, principal, operation_id, result,
  expected_operation_version=None) -> operation. Requires the operation version
  except for an exact already-completed retry. Unknown can be reconciled only
  by explicitly supplying that version and a verified result.
* mark_unknown(mission, principal, operation_id, reason,
  expected_operation_version=None) -> operation. Requires the version except
  for an identical unknown retry. A completed result is never downgraded.
* apply_memory_operation(mission, principal, operation_id, expected_version,
  patch) -> operation. Atomic mission CAS + completed result; no external effect
  or callback. Repeating the exact request returns its original result without
  another write. An existing pending/unknown record is returned, never replayed.

AccessDenied hides both nonexistent and unauthorized missions; Conflict denotes
stale versions/reused IDs with different input; InvalidRecord denotes bad input.
Payload/result/mandate/source are bounded JSON DATA; callers must minimize them
and exclude credentials and personal facts. Retention is declared per mission;
no expiry, deletion or background process is activated by this module.
"""

from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3


class AccessDenied(PermissionError):
    pass


class Conflict(RuntimeError):
    pass


class InvalidRecord(ValueError):
    pass


STATES = frozenset({
    "proposed", "authorized", "in_progress", "ready_for_review",
    "approved_for_merge", "merged", "closed", "blocked", "suspended", "abandoned",
})
RETENTION = "Mission bookkeeping retained until separately authorized disposal; no automatic deletion."
MAX_JSON_BYTES = 65536
_APPLICATION_ID = 0x4C454F31  # LEO1


def _now():
    return datetime.now(timezone.utc).isoformat()


def _identifier(value):
    if (not isinstance(value, str) or not value or len(value) > 200
            or value != value.strip() or any(ord(c) < 32 for c in value)):
        raise InvalidRecord("Invalid identifier")
    return value


def _json(value):
    if type(value) is not dict:
        raise InvalidRecord("A JSON object is required")

    def check(item, depth=0):
        if depth > 20:
            raise InvalidRecord("JSON nesting limit exceeded")
        if type(item) is dict:
            if any(type(key) is not str for key in item):
                raise InvalidRecord("JSON keys must be strings")
            for child in item.values():
                check(child, depth + 1)
        elif type(item) is list:
            for child in item:
                check(child, depth + 1)
        elif item is not None and type(item) not in (str, int, float, bool):
            raise InvalidRecord("Unsupported JSON value")

    check(value)
    try:
        encoded = json.dumps(value, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":"), allow_nan=False)
        if len(encoded.encode("utf-8")) > MAX_JSON_BYTES:
            raise InvalidRecord("JSON size limit exceeded")
    except (TypeError, ValueError, UnicodeError, RecursionError) as error:
        raise InvalidRecord("Invalid bounded JSON") from error
    return encoded


def _version(value):
    if type(value) is not int or value < 1:
        raise InvalidRecord("An explicit positive expected version is required")
    return value


def _patch(value):
    encoded = _json(value)
    value = json.loads(encoded)
    if not value or set(value) - {"state", "next_action"}:
        raise InvalidRecord("Only state and next_action can be updated")
    if "state" in value and (type(value["state"]) is not str or value["state"] not in STATES):
        raise InvalidRecord("Unknown mission state")
    if "next_action" in value and (type(value["next_action"]) is not str
                                   or len(value["next_action"]) > 4000):
        raise InvalidRecord("Invalid next action")
    return value  # snapshot: caller mutation cannot change the write


def _acl(value):
    if type(value) is not list or len(value) > 200:
        raise InvalidRecord("A bounded list of principals is required")
    return json.dumps(sorted(set(_identifier(v) for v in value)), ensure_ascii=False)


class MissionStore:
    def __init__(self, db_path):
        raw = os.fspath(db_path)
        if not isinstance(raw, str) or not raw or raw == ":memory:" or raw.startswith("file:"):
            raise InvalidRecord("An explicit durable database path is required")
        self.path = Path(raw).absolute()
        if not self.path.parent.is_dir() or self.path.is_symlink():
            raise InvalidRecord("Authorized database parent must already exist")
        # New registers must not inherit a permissive process umask. Existing
        # files remain subject to the broker's path/ownership authorization.
        try:
            descriptor = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o600)
        except FileExistsError:
            if not self.path.is_file():
                raise InvalidRecord("Regular database file required")
        else:
            os.close(descriptor)
        with self._transaction() as db:
            application = db.execute("PRAGMA application_id").fetchone()[0]
            tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            if application != _APPLICATION_ID and (application != 0 or tables):
                raise InvalidRecord("Database does not belong to the mission register")
            version = db.execute("PRAGMA user_version").fetchone()[0]
            if version not in (0, 1) or (application == _APPLICATION_ID and version != 1):
                raise InvalidRecord("Unsupported mission register schema")
            table_names = {r[0] for r in tables}
            required_tables = {"missions", "operations"}
            allowed_tables = required_tables | {"budget_missions", "budget_operations"}
            if application == _APPLICATION_ID and (
                    not required_tables <= table_names or not table_names <= allowed_tables):
                raise InvalidRecord("Unexpected mission register schema; reconciliation required")
            db.execute("""CREATE TABLE IF NOT EXISTS missions (
                id TEXT PRIMARY KEY, owner TEXT NOT NULL, project TEXT NOT NULL,
                mandat TEXT NOT NULL, source TEXT NOT NULL,
                readers TEXT NOT NULL, writers TEXT NOT NULL,
                state TEXT NOT NULL, next_action TEXT NOT NULL,
                version INTEGER NOT NULL CHECK(version > 0),
                retention TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
            )""")
            db.execute("""CREATE TABLE IF NOT EXISTS operations (
                mission_id TEXT NOT NULL REFERENCES missions(id),
                operation_id TEXT NOT NULL, fingerprint TEXT NOT NULL,
                payload TEXT NOT NULL, base_version INTEGER NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending','unknown','completed')),
                result TEXT, reason TEXT,
                version INTEGER NOT NULL CHECK(version > 0),
                created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                PRIMARY KEY(mission_id, operation_id)
            )""")
            db.execute(f"PRAGMA application_id={_APPLICATION_ID}")
            db.execute("PRAGMA user_version=1")

    @contextmanager
    def _transaction(self, write=True):
        if self.path.is_symlink() or not self.path.is_file():
            raise InvalidRecord("Regular database file required")
        db = sqlite3.connect(self.path, timeout=10, isolation_level=None)
        db.row_factory = sqlite3.Row
        try:
            db.execute("PRAGMA foreign_keys=ON")
            db.execute("PRAGMA synchronous=FULL")
            db.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()

    @staticmethod
    def _mission(row):
        data = dict(row)
        for name in ("mandat", "source", "readers", "writers"):
            data[name] = json.loads(data[name])
        return data

    @staticmethod
    def _operation(row):
        if row is None:
            return None
        data = dict(row)
        data["payload"] = json.loads(data["payload"])
        data["result"] = json.loads(data["result"]) if data["result"] is not None else None
        return data

    @staticmethod
    def _authorized(db, mission, principal, write=False):
        _identifier(mission)
        _identifier(principal)
        row = db.execute("SELECT * FROM missions WHERE id=?", (mission,)).fetchone()
        if row is None:
            raise AccessDenied("Mission unavailable for this principal")
        allowed = {row["owner"], *json.loads(row["writers"])}
        if not write:
            allowed.update(json.loads(row["readers"]))
        if principal not in allowed:
            raise AccessDenied("Mission unavailable for this principal")
        return row

    @staticmethod
    def _find_operation(db, mission, operation_id):
        _identifier(operation_id)
        return db.execute("SELECT * FROM operations WHERE mission_id=? AND operation_id=?",
                          (mission, operation_id)).fetchone()

    @staticmethod
    def _same_request(row, payload):
        fingerprint = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        if row["fingerprint"] != fingerprint or row["payload"] != payload:
            raise Conflict("Operation identifier already belongs to a different request")

    @staticmethod
    def _assert_version(row, expected):
        if row["version"] != _version(expected):
            raise Conflict("Version changed; reconcile before writing")

    @staticmethod
    def _insert_operation(db, mission, operation_id, payload, base_version,
                          status="pending", result=None):
        now = _now()
        db.execute("""INSERT INTO operations
            (mission_id,operation_id,fingerprint,payload,base_version,status,result,reason,
             version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,NULL,1,?,?)""",
                   (mission, operation_id, hashlib.sha256(payload.encode("utf-8")).hexdigest(),
                    payload, base_version, status, result, now, now))

    def create_mission(self, id, owner, project, mandat, source, readers, writers, authority=False):
        if authority is not True:
            raise AccessDenied("Trusted broker authority required")
        values = (_identifier(id), _identifier(owner), _identifier(project),
                  _json(mandat), _json(source), _acl(readers), _acl(writers))
        now = _now()
        with self._transaction() as db:
            try:
                db.execute("""INSERT INTO missions
                    (id,owner,project,mandat,source,readers,writers,state,next_action,version,
                     retention,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'proposed','',1,?,?,?)""",
                           (*values, RETENTION, now, now))
            except sqlite3.IntegrityError as error:
                raise Conflict("Mission identifier already exists") from error
            return self._mission(self._authorized(db, id, owner))

    def read_mission(self, id, principal):
        with self._transaction(write=False) as db:
            return self._mission(self._authorized(db, id, principal))

    def _update(self, db, row, expected_version, patch):
        self._assert_version(row, expected_version)
        cursor = db.execute("""UPDATE missions SET state=?, next_action=?,
            version=version+1, updated_at=? WHERE id=? AND version=?""",
                            (patch.get("state", row["state"]),
                             patch.get("next_action", row["next_action"]),
                             _now(), row["id"], expected_version))
        if cursor.rowcount != 1:
            raise Conflict("Version changed; reconcile before writing")
        return db.execute("SELECT * FROM missions WHERE id=?", (row["id"],)).fetchone()

    def update_mission(self, id, principal, expected_version, patch):
        patch = _patch(patch)
        with self._transaction() as db:
            row = self._authorized(db, id, principal, write=True)
            return self._mission(self._update(db, row, expected_version, patch))

    def begin_operation(self, mission, principal, operation_id, payload, expected_version=None):
        payload = _json(payload)
        with self._transaction() as db:
            row = self._authorized(db, mission, principal, write=True)
            existing = self._find_operation(db, mission, operation_id)
            if existing is not None:
                self._same_request(existing, payload)
                return self._operation(existing)
            self._assert_version(row, expected_version)
            self._insert_operation(db, mission, operation_id, payload, expected_version)
            return self._operation(self._find_operation(db, mission, operation_id))

    def get_operation(self, mission, principal, operation_id):
        with self._transaction(write=False) as db:
            self._authorized(db, mission, principal)
            return self._operation(self._find_operation(db, mission, operation_id))

    def complete_operation(self, mission, principal, operation_id, result,
                           expected_operation_version=None):
        result = _json(result)
        with self._transaction() as db:
            self._authorized(db, mission, principal, write=True)
            row = self._find_operation(db, mission, operation_id)
            if row is None:
                raise Conflict("Operation must be registered before completion")
            if row["status"] == "completed":
                if row["result"] != result:
                    raise Conflict("Completed operation has a different result")
                return self._operation(row)
            self._assert_version(row, expected_operation_version)
            db.execute("""UPDATE operations SET status='completed', result=?, reason=NULL,
                version=version+1, updated_at=? WHERE mission_id=? AND operation_id=?""",
                       (result, _now(), mission, operation_id))
            return self._operation(self._find_operation(db, mission, operation_id))

    def mark_unknown(self, mission, principal, operation_id, reason,
                     expected_operation_version=None):
        if type(reason) is not str or not reason.strip() or len(reason) > 1000:
            raise InvalidRecord("A bounded explanation of uncertainty is required")
        with self._transaction() as db:
            self._authorized(db, mission, principal, write=True)
            row = self._find_operation(db, mission, operation_id)
            if row is None:
                raise Conflict("Operation must be registered before reconciliation")
            if row["status"] == "completed":
                raise Conflict("A completed result cannot be downgraded")
            if row["status"] == "unknown" and row["reason"] == reason:
                return self._operation(row)
            self._assert_version(row, expected_operation_version)
            db.execute("""UPDATE operations SET status='unknown', reason=?,
                version=version+1, updated_at=? WHERE mission_id=? AND operation_id=?""",
                       (reason, _now(), mission, operation_id))
            return self._operation(self._find_operation(db, mission, operation_id))

    def apply_memory_operation(self, mission, principal, operation_id, expected_version, patch):
        patch = _patch(patch)
        expected_version = _version(expected_version)
        payload = _json({"kind": "memory_patch", "expected_version": expected_version, "patch": patch})
        with self._transaction() as db:
            row = self._authorized(db, mission, principal, write=True)
            existing = self._find_operation(db, mission, operation_id)
            if existing is not None:
                self._same_request(existing, payload)
                return self._operation(existing)
            updated = self._update(db, row, expected_version, patch)
            result = _json({"mission_version": updated["version"],
                            "state": updated["state"], "next_action": updated["next_action"]})
            self._insert_operation(db, mission, operation_id, payload, expected_version,
                                   status="completed", result=result)
            return self._operation(self._find_operation(db, mission, operation_id))
