"""R27: durable shared reservations, standard library only.

Trusted broker owns this database, clock, mission, actor and cost upper bounds.
Models must not obtain database access or pass ``authority``. This ledger cannot
stop an external provider or prove its invoice: reserve conservatively BEFORE
dispatch; an unknown result stays reserved. Each new operation consumes one call
and one attempt. Retries use new operation IDs. actor='root' is the coordinator;
every other distinct actor consumes one cumulative delegation slot.

reserve returns new_reservation=False on replay: this is a receipt, NEVER a new
dispatch permission. settle requires a trusted final usage report, is immutable
and idempotent. Over-reservation usage is recorded and stops the entire mission.
Limits cannot be changed. All processes must share the same local SQLite file;
filesystem ownership/isolation is a broker responsibility (not a network DB).
"""
from contextlib import contextmanager
import math
import os
from pathlib import Path
import sqlite3
import stat
import time


class BudgetError(RuntimeError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def _identifier(value):
    if not isinstance(value, str) or not value or len(value) > 200:
        raise BudgetError('invalid_identifier')
    return value


def _integer(value):
    if type(value) is not int or not 0 <= value <= 2**53 - 1:
        raise BudgetError('invalid_units_or_limit')
    return value


class BudgetLedger:
    def __init__(self, db_path, clock=time.time):
        try:
            raw = os.fspath(db_path)
        except TypeError:
            raise BudgetError('durable_path_required') from None
        if not isinstance(raw, str) or not raw or raw == ':memory:' or raw.startswith('file:') or '\0' in raw:
            raise BudgetError('durable_path_required')
        path = Path(raw).absolute()
        if not path.parent.is_dir() or path.is_symlink():
            raise BudgetError('durable_path_required')
        # Exclusive creation fixes permissions regardless of process umask.
        # Never chmod a preexisting file; its ownership belongs to the broker.
        try:
            descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o600)
        except FileExistsError:
            if not stat.S_ISREG(path.lstat().st_mode):
                raise BudgetError('durable_path_required') from None
        else:
            os.close(descriptor)
        self.db_path = str(path)
        self.clock = clock
        with self._transaction() as db:
            application = db.execute('PRAGMA application_id').fetchone()[0]
            tables = {row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            version = db.execute('PRAGMA user_version').fetchone()[0]
            allowed = {'missions', 'operations', 'budget_missions', 'budget_operations'}
            if application != 0x4C454F31 and (application != 0 or tables):
                raise BudgetError('foreign_database')
            if not tables <= allowed or version not in (0, 1):
                raise BudgetError('unsupported_schema')
            if application == 0x4C454F31 and version != 1:
                raise BudgetError('unsupported_schema')
            db.execute('PRAGMA application_id=1279610673')  # LEO1, shared with MissionStore.
            db.execute('PRAGMA user_version=1')
            db.execute('''CREATE TABLE IF NOT EXISTS budget_missions (
                mission TEXT PRIMARY KEY, max_units INTEGER NOT NULL,
                max_calls INTEGER NOT NULL, max_attempts INTEGER NOT NULL,
                max_delegates INTEGER NOT NULL, expires_at REAL NOT NULL,
                stopped INTEGER NOT NULL DEFAULT 0, reason TEXT)''')
            db.execute('''CREATE TABLE IF NOT EXISTS budget_operations (
                mission TEXT NOT NULL REFERENCES budget_missions(mission),
                operation TEXT NOT NULL, actor TEXT NOT NULL,
                reserved_units INTEGER NOT NULL, used_units INTEGER,
                created_at REAL NOT NULL, settled_at REAL,
                PRIMARY KEY(mission, operation))''')

    @contextmanager
    def _transaction(self):
        # The broker must also prevent directory replacement by other users;
        # a path check alone is not a filesystem capability boundary.
        path = Path(self.db_path)
        if path.is_symlink() or not path.is_file():
            raise BudgetError('durable_path_required')
        db = sqlite3.connect(self.db_path, timeout=10, isolation_level=None)
        db.row_factory = sqlite3.Row
        try:
            db.execute('PRAGMA foreign_keys=ON')
            db.execute('PRAGMA synchronous=FULL')
            db.execute('BEGIN IMMEDIATE')
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()

    def _now(self):
        now = self.clock()
        if type(now) not in (int, float) or not math.isfinite(now):
            raise BudgetError('invalid_clock')
        return now

    def _mission(self, db, mission):
        row = db.execute('SELECT * FROM budget_missions WHERE mission=?',
                         (_identifier(mission),)).fetchone()
        if row is None:
            raise BudgetError('mission_not_found')
        return dict(row)

    def _status(self, db, mission):
        result = self._mission(db, mission)
        rows = db.execute('SELECT * FROM budget_operations WHERE mission=?',
                          (mission,)).fetchall()
        # Sum in Python: no SQLite integer overflow can release capacity.
        result.update(
            committed_units=sum(r['reserved_units'] if r['used_units'] is None
                                else r['used_units'] for r in rows),
            reserved_units=sum(r['reserved_units'] for r in rows if r['used_units'] is None),
            used_units=sum(r['used_units'] or 0 for r in rows),
            calls=len(rows), attempts=len(rows),
            delegates=len({r['actor'] for r in rows if r['actor'] != 'root'}),
            pending_operations=[r['operation'] for r in rows if r['used_units'] is None],
            expired=self._now() >= result['expires_at'],
        )
        result['available_units'] = max(0, result['max_units'] - result['committed_units'])
        result['stopped'] = bool(result['stopped'])
        return result

    def create(self, mission, limits, authority=False):
        if authority is not True:
            raise BudgetError('authority_required')
        _identifier(mission)
        names = ('max_units', 'max_calls', 'max_attempts', 'max_delegates')
        if not isinstance(limits, dict) or set(limits) != {*names, 'expires_at'}:
            raise BudgetError('invalid_limits')
        values = [_integer(limits[k]) for k in names]
        expiry = limits['expires_at']
        if type(expiry) not in (int, float) or not math.isfinite(expiry):
            raise BudgetError('invalid_expiry')
        with self._transaction() as db:
            if db.execute('SELECT 1 FROM budget_missions WHERE mission=?', (mission,)).fetchone():
                raise BudgetError('mission_exists')
            db.execute('INSERT INTO budget_missions '
                       '(mission,max_units,max_calls,max_attempts,max_delegates,expires_at) '
                       'VALUES (?,?,?,?,?,?)', (mission, *values, expiry))

    def reserve(self, mission, operation, actor, units):
        _identifier(operation)
        _identifier(actor)
        _integer(units)
        with self._transaction() as db:
            state = self._status(db, mission)
            prior = db.execute('SELECT * FROM budget_operations WHERE mission=? AND operation=?',
                               (mission, operation)).fetchone()
            if prior is not None:
                if prior['actor'] != actor or prior['reserved_units'] != units:
                    raise BudgetError('operation_conflict')
                return {**dict(prior), 'new_reservation': False}
            if state['stopped']:
                raise BudgetError('mission_stopped')
            if state['expired']:
                raise BudgetError('mission_expired')
            # Zero budget cannot dispatch even a falsely labelled zero-cost call.
            if state['committed_units'] >= state['max_units'] or state['committed_units'] + units > state['max_units']:
                raise BudgetError('units_exhausted')
            if state['calls'] >= state['max_calls']:
                raise BudgetError('calls_exhausted')
            if state['attempts'] >= state['max_attempts']:
                raise BudgetError('attempts_exhausted')
            known = actor == 'root' or db.execute(
                'SELECT 1 FROM budget_operations WHERE mission=? AND actor=?',
                (mission, actor)).fetchone() is not None
            if not known and state['delegates'] >= state['max_delegates']:
                raise BudgetError('delegates_exhausted')
            db.execute('INSERT INTO budget_operations '
                       '(mission,operation,actor,reserved_units,created_at) VALUES (?,?,?,?,?)',
                       (mission, operation, actor, units, self._now()))
            row = db.execute('SELECT * FROM budget_operations WHERE mission=? AND operation=?',
                             (mission, operation)).fetchone()
            return {**dict(row), 'new_reservation': True}

    def settle(self, mission, operation, used_units):
        _identifier(operation)
        _integer(used_units)
        with self._transaction() as db:
            self._mission(db, mission)
            prior = db.execute('SELECT * FROM budget_operations WHERE mission=? AND operation=?',
                               (mission, operation)).fetchone()
            if prior is None:
                raise BudgetError('operation_not_found')
            if prior['used_units'] is not None:
                if prior['used_units'] != used_units:
                    raise BudgetError('settlement_conflict')
                return self._status(db, mission)
            db.execute('UPDATE budget_operations SET used_units=?, settled_at=? '
                       'WHERE mission=? AND operation=?',
                       (used_units, self._now(), mission, operation))
            if used_units > prior['reserved_units']:
                db.execute("UPDATE budget_missions SET stopped=1, reason='usage_exceeded_reservation' "
                           'WHERE mission=?', (mission,))
            return self._status(db, mission)

    def stop(self, mission, reason, authority=False):
        if authority is not True:
            raise BudgetError('authority_required')
        _identifier(reason)  # Trusted short reason code, never model content or secrets.
        with self._transaction() as db:
            self._mission(db, mission)
            db.execute('UPDATE budget_missions SET stopped=1, reason=COALESCE(reason,?) WHERE mission=?',
                       (reason, mission))
            return self._status(db, mission)

    def status(self, mission):
        with self._transaction() as db:
            return self._status(db, mission)
