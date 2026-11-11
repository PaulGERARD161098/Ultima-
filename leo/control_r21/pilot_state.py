"""Durable admission for ONE deterministic fixture; never a model authority.

The trusted host supplies the installation and the authenticated GitHub event.
Its Store reads the CURRENT private ref and performs an atomic compare/update.
Every proposed write has a fresh non-secret mutation nonce, so two equivalent
children cannot collapse to one Git commit and both win a fast-forward update.
The store must use exactly the expected commit as parent, never force a ref,
and must report an uncertain response as AmbiguousWrite, not an absent write.

No initialization on read, reset, network, effect execution or secret handling.
Only a Decision with launch=True admits the caller's one fixed fixture worker.
After losing that Decision, a new caller gets a receipt/status, NEVER a launch.
"""
from copy import deepcopy
from dataclasses import dataclass
import json
import math
import re
import uuid


MAX_BYTES = 64 * 1024
MAX_RECEIPT_BYTES = 16 * 1024
SHA = re.compile(r'[0-9a-f]{40}')
DIGEST = re.compile(r'[0-9a-f]{64}')
NONCE = re.compile(r'[0-9a-f]{32}')
ID = re.compile(r'[A-Za-z0-9][A-Za-z0-9_-]{0,127}')
RUN = re.compile(r'[1-9][0-9]{0,19}')
IMAGE = re.compile(r'[A-Za-z0-9][A-Za-z0-9._/:\-]{0,200}@sha256:[0-9a-f]{64}')
INSTALL_FIELDS = frozenset({'id', 'seed', 'source_sha', 'code_digest',
                            'image_digest', 'actor_id'})
PACKAGE_FIELDS = frozenset({'blob_sha', 'sha256', 'context_digest', 'expires_at'})
STATE_FIELDS = frozenset({'schema_version', 'installation', 'sequence',
                         'previous_sha', 'mutation_id', 'stopped', 'stop_reason',
                         'phase', 'package', 'operations'})
OP_FIELDS = frozenset({'request_id', 'run_id', 'request_digest', 'lease_id',
                      'status', 'receipt', 'input_package'})
STOP_REASONS = frozenset({'owner_stop', 'leo_self_control_attempt',
                         'leo_control_write_attempt', 'leo_control_target_unknown',
                         'control_unavailable', 'worker_timeout'})


class PilotError(RuntimeError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


class CasConflict(PilotError):
    def __init__(self, code='state_conflict'):
        super().__init__(code)


class AmbiguousWrite(PilotError):
    def __init__(self, code='write_outcome_unknown'):
        super().__init__(code)


def _require(condition, code='invalid_pilot_state'):
    if not condition:
        raise PilotError(code)


def _matches(pattern, value):
    return type(value) is str and pattern.fullmatch(value) is not None


def _keys(value, fields):
    return type(value) is dict and set(value) == fields


def validate_installation(value):
    _require(_keys(value, INSTALL_FIELDS), 'invalid_installation')
    _require(_matches(ID, value['id']) and _matches(DIGEST, value['seed'])
             and _matches(SHA, value['source_sha'])
             and _matches(DIGEST, value['code_digest'])
             and _matches(IMAGE, value['image_digest'])
             and type(value['actor_id']) is int
             and 0 < value['actor_id'] <= (1 << 53) - 1, 'invalid_installation')
    return deepcopy(value)


def _package(value):
    _require(_keys(value, PACKAGE_FIELDS), 'invalid_package_metadata')
    _require(_matches(SHA, value['blob_sha']) and _matches(DIGEST, value['sha256'])
             and _matches(DIGEST, value['context_digest'])
             and type(value['expires_at']) in (int, float)
             and math.isfinite(value['expires_at'])
             and 0 < value['expires_at'] <= (1 << 53) - 1,
             'invalid_package_metadata')
    return deepcopy(value)


def _json_data(value, depth=0):
    _require(depth <= 8, 'invalid_receipt')
    if value is None or type(value) in (str, bool):
        return
    if type(value) is int:
        _require(abs(value) <= (1 << 53) - 1, 'invalid_receipt')
        return
    if type(value) is float:
        _require(math.isfinite(value), 'invalid_receipt')
        return
    if type(value) is list:
        _require(len(value) <= 128, 'invalid_receipt')
        for item in value:
            _json_data(item, depth + 1)
        return
    _require(type(value) is dict and len(value) <= 128, 'invalid_receipt')
    for key, item in value.items():
        _require(type(key) is str and 0 < len(key) <= 128, 'invalid_receipt')
        _json_data(item, depth + 1)


def _receipt(value):
    _require(type(value) is dict, 'invalid_receipt')
    _json_data(value)
    _require(len(_encode(value)) <= MAX_RECEIPT_BYTES, 'receipt_too_large')
    return deepcopy(value)


def _encode(value):
    try:
        return json.dumps(value, sort_keys=True, separators=(',', ':'),
                          ensure_ascii=True, allow_nan=False).encode('ascii')
    except (TypeError, ValueError, RecursionError):
        raise PilotError('invalid_pilot_state') from None


def validate_state(state, installation):
    """Strict closed envelope. Expected installation is pinned OUTSIDE it."""
    expected = validate_installation(installation)
    _require(_keys(state, STATE_FIELDS))
    _require(state['installation'] == expected, 'installation_mismatch')
    validate_installation(state['installation'])
    _require(type(state['schema_version']) is int and state['schema_version'] == 1)
    _require(type(state['sequence']) is int and 0 <= state['sequence'] < (1 << 53))
    _require(_matches(NONCE, state['mutation_id']))
    _require((state['sequence'] == 0 and state['previous_sha'] is None)
             or (state['sequence'] > 0 and _matches(SHA, state['previous_sha'])))
    _require(type(state['stopped']) is bool)
    _require((state['stopped'] and type(state['stop_reason']) is str
              and state['stop_reason'] in STOP_REASONS)
             or (not state['stopped'] and state['stop_reason'] is None))
    operations = state['operations']
    _require(_keys(operations, {'prepare', 'execute'}))
    for kind, op in operations.items():
        if op is None:
            continue
        _require(_keys(op, OP_FIELDS))
        _require(_matches(ID, op['request_id']) and _matches(RUN, op['run_id'])
                 and _matches(DIGEST, op['request_digest'])
                 and _matches(NONCE, op['lease_id']))
        _require(op['status'] in ('running', 'completed', 'unknown'))
        if op['status'] == 'completed':
            _receipt(op['receipt'])
        else:
            _require(op['receipt'] is None)
        if kind == 'prepare':
            _require(op['input_package'] is None)
        else:
            _package(op['input_package'])
    prep, execute = operations['prepare'], operations['execute']
    if prep is None:
        _require(execute is None and state['package'] is None and state['phase'] == 'empty')
    elif prep['status'] != 'completed':
        _require(execute is None and state['package'] is None
                 and state['phase'] == prep['status'])
    else:
        package = _package(state['package'])
        if execute is None:
            _require(state['phase'] == 'prepared')
        else:
            _require(state['phase'] == execute['status'])
            initial = execute['input_package']
            _require(all(package[k] == initial[k] for k in ('context_digest', 'expires_at')),
                     'approval_context_changed')
            if execute['status'] != 'completed':
                _require(package == initial, 'unfinished_checkpoint_changed')
    if state['sequence'] == 0:
        _require(state['phase'] == 'empty' and state['stopped'] is False)
    _require(len(_encode(state)) <= MAX_BYTES, 'state_too_large')
    return deepcopy(state)


def _unique(pairs):
    result = {}
    for key, value in pairs:
        _require(key not in result, 'duplicate_json_key')
        result[key] = value
    return result


def _constant(_):
    raise PilotError('invalid_json')


def decode_state(raw, installation):
    _require(type(raw) is bytes and 0 < len(raw) <= MAX_BYTES, 'state_size')
    try:
        state = json.loads(raw.decode('utf-8', errors='strict'),
                           object_pairs_hook=_unique, parse_constant=_constant)
    except (ValueError, UnicodeError, RecursionError):
        raise PilotError('invalid_json') from None
    return validate_state(state, installation)


def encode_state(state, installation):
    return _encode(validate_state(state, installation))


def validate_transition(previous_sha, previous, current):
    """Check a CURRENT Git commit against its actual parent, not its own claim.

Called by Store.read while walking the chain back to the operator's seed.
An old valid document copied into a new commit cannot resurrect permissions.
"""
    _require(type(previous) is dict, 'invalid_pilot_state')
    before = validate_state(previous, previous.get('installation'))
    after = validate_state(current, before['installation'])
    _require(_matches(SHA, previous_sha)
             and after['previous_sha'] == previous_sha
             and after['sequence'] == before['sequence'] + 1
             and after['mutation_id'] != before['mutation_id'], 'state_chain_mismatch')
    if before['stopped']:
        _require(after['stopped'] and after['stop_reason'] == before['stop_reason'],
                 'stop_rollback_denied')
    for kind in ('prepare', 'execute'):
        old, new = before['operations'][kind], after['operations'][kind]
        if old is None:
            if new is not None:
                _require(new['status'] == 'running' and new['receipt'] is None,
                         'reservation_required')
                if kind == 'execute':
                    _require(before['phase'] == 'prepared'
                             and new['input_package'] == before['package'],
                             'reservation_context_mismatch')
                else:
                    _require(before['phase'] == 'empty', 'phase_conflict')
                _require(not before['stopped'], 'pilot_stopped')
            continue
        _require(new is not None, 'operation_rollback_denied')
        _require(all(new[key] == old[key] for key in OP_FIELDS - {'status', 'receipt'}),
                 'reservation_changed')
        allowed = {'running': {'running', 'unknown', 'completed'},
                   'unknown': {'unknown', 'completed'}, 'completed': {'completed'}}
        _require(new['status'] in allowed[old['status']], 'operation_rollback_denied')
        if old['status'] == 'completed':
            _require(new['receipt'] == old['receipt'], 'receipt_conflict')
    if before['package'] is not None and after['package'] != before['package']:
        old, new = before['operations']['execute'], after['operations']['execute']
        _require(old is not None and old['status'] in ('running', 'unknown')
                 and new is not None and new['status'] == 'completed',
                 'checkpoint_rollback_denied')
    return after


def new_state(installation):
    """Operator installation generator ONLY. Runtime never calls this on loss."""
    state = {'schema_version': 1, 'installation': validate_installation(installation),
             'sequence': 0, 'previous_sha': None, 'mutation_id': uuid.uuid4().hex,
             'stopped': False, 'stop_reason': None, 'phase': 'empty',
             'package': None, 'operations': {'prepare': None, 'execute': None}}
    return validate_state(state, installation)


@dataclass(frozen=True)
class Reservation:
    installation_id: str
    seed: str
    kind: str
    request_id: str
    run_id: str
    request_digest: str
    lease_id: str


@dataclass(frozen=True)
class Decision:
    state_sha: str
    state: dict
    launch: bool = False
    replayed: bool = False
    receipt: dict | None = None
    reservation: Reservation | None = None


def _reservation(state, kind):
    op = state['operations'][kind]
    return Reservation(state['installation']['id'], state['installation']['seed'], kind,
                       op['request_id'], op['run_id'], op['request_digest'], op['lease_id'])


def _bound(state, reservation):
    _require(type(reservation) is Reservation and reservation.kind in ('prepare', 'execute'),
             'invalid_reservation')
    _require(reservation.installation_id == state['installation']['id']
             and reservation.seed == state['installation']['seed'], 'reservation_mismatch')
    op = state['operations'][reservation.kind]
    _require(op is not None and _reservation(state, reservation.kind) == reservation,
             'reservation_mismatch')
    return op


def reserve_state(state, kind, request_id, run_id, request_digest, lease_id,
                  *, approval_digest=None, now=None):
    """Pure transition; caller must CAS it durably BEFORE starting a worker."""
    _require(kind in ('prepare', 'execute'), 'invalid_operation')
    _require(_matches(ID, request_id) and _matches(RUN, run_id)
             and _matches(DIGEST, request_digest) and _matches(NONCE, lease_id),
             'invalid_request')
    _require(not state['stopped'], 'pilot_stopped')
    _require(state['operations'][kind] is None, 'operation_already_reserved')
    _require(state['phase'] == ('empty' if kind == 'prepare' else 'prepared'),
             'phase_conflict')
    if kind == 'execute':
        _require(type(now) in (int, float) and math.isfinite(now), 'invalid_clock')
        _require(_matches(DIGEST, approval_digest)
                 and approval_digest == state['package']['context_digest'],
                 'approval_digest_mismatch')
        _require(now < state['package']['expires_at'], 'approval_expired')
    result = deepcopy(state)
    result['operations'][kind] = {
        'request_id': request_id, 'run_id': run_id, 'request_digest': request_digest,
        'lease_id': lease_id, 'status': 'running', 'receipt': None,
        'input_package': deepcopy(state['package']) if kind == 'execute' else None}
    result['phase'] = 'running'
    return result


def finish_state(state, reservation, receipt, package=None):
    """Attach a verified receipt; a concurrent stop is always preserved."""
    op = _bound(state, reservation)
    receipt = _receipt(receipt)
    if op['status'] == 'completed':
        _require(op['receipt'] == receipt, 'receipt_conflict')
        _require(package is None or package == state['package'], 'checkpoint_conflict')
        return deepcopy(state)
    result = deepcopy(state)
    if reservation.kind == 'prepare':
        result['package'] = _package(package)
        result['phase'] = 'prepared'
    else:
        if package is not None:
            package = _package(package)
            _require(all(package[k] == op['input_package'][k]
                         for k in ('context_digest', 'expires_at')), 'approval_context_changed')
            result['package'] = package
        result['phase'] = 'completed'
    result['operations'][reservation.kind].update(status='completed', receipt=receipt)
    return result


def unknown_state(state, reservation):
    op = _bound(state, reservation)
    _require(op['status'] != 'completed', 'completed_result_cannot_be_lost')
    result = deepcopy(state)
    result['operations'][reservation.kind]['status'] = 'unknown'
    result['phase'] = 'unknown'
    return result


def stop_state(state, reason='owner_stop'):
    _require(type(reason) is str and reason in STOP_REASONS, 'invalid_stop_reason')
    result = deepcopy(state)
    if not result['stopped']:
        result.update(stopped=True, stop_reason=reason)
    return result


class Coordinator:
    """Trusted-host Store: read()->(commit_sha, dict), cas(expected, dict)->sha.

Writes after CAS conflicts are bounded and concern only metadata reconciliation.
The coordinator NEVER retries or executes a fixture side effect.
"""
    def __init__(self, store, installation, *, nonce=None):
        self.store = store
        self.installation = validate_installation(installation)
        self.nonce = nonce or (lambda: uuid.uuid4().hex)

    def _read(self):
        try:
            sha, state = self.store.read()
        except PilotError:
            raise
        except Exception:
            raise PilotError('state_unavailable') from None
        _require(_matches(SHA, sha), 'invalid_state_anchor')
        return sha, validate_state(state, self.installation)

    def _stamp(self, state, sha):
        value = deepcopy(state)
        value.update(sequence=value['sequence'] + 1, previous_sha=sha,
                     mutation_id=self.nonce())
        return validate_state(value, self.installation)

    def _cas(self, sha, state):
        try:
            result = self.store.cas(sha, deepcopy(state))
        except (CasConflict, AmbiguousWrite):
            raise
        except Exception:
            # A generic transport exception is never proof of no write.
            raise AmbiguousWrite() from None
        _require(_matches(SHA, result), 'invalid_state_anchor')
        return result

    @staticmethod
    def _decision(sha, state, *, kind=None, launch=False, replayed=False):
        op = state['operations'][kind] if kind else None
        return Decision(sha, deepcopy(state), launch, replayed,
                        deepcopy(op['receipt']) if op else None,
                        _reservation(state, kind) if op else None)

    def status(self):
        sha, state = self._read()
        kind = 'execute' if state['operations']['execute'] else 'prepare'
        return self._decision(sha, state, kind=kind)

    def _existing(self, sha, state, kind, request_id, request_digest, approval_digest):
        op = state['operations'][kind]
        if op is None:
            return None
        if op['request_id'] == request_id:
            _require(op['request_digest'] == request_digest, 'request_conflict')
        if kind == 'execute':
            _require(approval_digest == op['input_package']['context_digest'],
                     'approval_digest_mismatch')
        _require(op['status'] != 'unknown', 'operation_unknown_reconcile_required')
        if op['status'] == 'running':
            _require(op['request_id'] == request_id
                     and op['request_digest'] == request_digest, 'operation_already_reserved')
        # A new request can observe a completed operation, never create another.
        return self._decision(sha, state, kind=kind, replayed=True)

    def _reserve(self, kind, request_id, run_id, request_digest, *, approval_digest=None, now=None):
        sha, state = self._read()
        # Validate scalar inputs even on a receipt-only replay.
        _require(_matches(ID, request_id) and _matches(RUN, run_id)
                 and _matches(DIGEST, request_digest), 'invalid_request')
        existing = self._existing(sha, state, kind, request_id, request_digest, approval_digest)
        if existing is not None:
            return existing
        proposed = reserve_state(state, kind, request_id, run_id, request_digest,
                                 self.nonce(), approval_digest=approval_digest, now=now)
        proposed = self._stamp(proposed, sha)
        reservation = _reservation(proposed, kind)
        conflict = False
        try:
            self._cas(sha, proposed)
        except CasConflict:
            conflict = True
        except AmbiguousWrite:
            pass  # Resolve OUR unique lease from the CURRENT ref before any launch.
        current_sha, current = self._read()
        op = current['operations'][kind]
        ours = op is not None and _reservation(current, kind) == reservation
        if ours and not conflict:
            # A stop winning after reservation prevents this launch too.
            return self._decision(current_sha, current, kind=kind,
                                  launch=op['status'] == 'running' and not current['stopped'])
        existing = self._existing(current_sha, current, kind, request_id,
                                  request_digest, approval_digest)
        if existing is not None:
            return existing
        raise PilotError('pilot_stopped' if current['stopped'] else
                         'state_conflict' if conflict else 'write_outcome_unknown')

    def prepare(self, request_id, run_id, request_digest):
        return self._reserve('prepare', request_id, run_id, request_digest)

    def execute(self, request_id, run_id, request_digest, approval_digest, now):
        return self._reserve('execute', request_id, run_id, request_digest,
                             approval_digest=approval_digest, now=now)

    def _mutate(self, transition, *, kind=None):
        for _ in range(3):
            sha, state = self._read()
            changed = transition(state)
            if changed == state:
                return self._decision(sha, state, kind=kind, replayed=True)
            changed = self._stamp(changed, sha)
            try:
                new_sha = self._cas(sha, changed)
            except (CasConflict, AmbiguousWrite):
                continue  # reread, recompute, preserve stop; no worker call here.
            return self._decision(new_sha, changed, kind=kind)
        # Last response may be lost although the update succeeded.
        sha, state = self._read()
        if transition(state) == state:
            return self._decision(sha, state, kind=kind, replayed=True)
        raise PilotError('state_write_unconfirmed')

    def finish(self, reservation, receipt, package=None):
        _require(type(reservation) is Reservation, 'invalid_reservation')
        return self._mutate(lambda state: finish_state(state, reservation, receipt, package),
                            kind=reservation.kind)

    def unknown(self, reservation):
        _require(type(reservation) is Reservation, 'invalid_reservation')
        return self._mutate(lambda state: unknown_state(state, reservation), kind=reservation.kind)

    def stop(self, reason='owner_stop'):
        return self._mutate(lambda state: stop_state(state, reason))
