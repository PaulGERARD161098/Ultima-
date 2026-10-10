"""Inert read candidate: trusted snapshot, no network or model adapter.

The operator constructs this host OUTSIDE worker rights. No production
activation, credential loading, skill migration or paid call is implemented.
Snapshots and reports are data, including text that looks like instructions.
"""
from dataclasses import dataclass
from contextlib import contextmanager
import hashlib
import json
from pathlib import Path
import re

from leo.runtime.broker import Broker, mandate_record
from leo.runtime.policy import Refusal
from finubar.leo_control import assert_host_private

REPOSITORY = 'PaulGERARD161098/Ultima-'
MAX_SNAPSHOT_BYTES = 32768
MAX_PRS = 20
SHA = re.compile(r'[a-f0-9]{40}', re.ASCII)


def snapshot_bytes(value):
    """Validate a trusted acquisition; never interpret PR text as authority."""
    if type(value) is not dict or set(value) != {'repository', 'measured_at', 'prs'}:
        raise Refusal('invalid_read_snapshot')
    if value['repository'] != REPOSITORY:
        raise Refusal('read_repository_denied')
    if (type(value['measured_at']) is not str or
            not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z', value['measured_at'])):
        raise Refusal('invalid_read_timestamp')
    from datetime import datetime
    try:
        datetime.strptime(value['measured_at'], '%Y-%m-%dT%H:%M:%SZ')
    except ValueError:
        raise Refusal('invalid_read_timestamp') from None
    rows = value['prs']
    if type(rows) is not list or not 1 <= len(rows) <= MAX_PRS:
        raise Refusal('read_coverage_required')
    numbers = set()
    for row in rows:
        if type(row) is not dict or set(row) != {'number', 'head_sha', 'title', 'state', 'checks'}:
            raise Refusal('invalid_read_pr')
        if type(row['number']) is not int or not 1 <= row['number'] <= 2**31 - 1 or row['number'] in numbers:
            raise Refusal('invalid_read_pr')
        numbers.add(row['number'])
        if type(row['head_sha']) is not str or not SHA.fullmatch(row['head_sha']):
            raise Refusal('invalid_read_pr')
        if type(row['title']) is not str or not 1 <= len(row['title']) <= 500 or any(ord(c) < 32 for c in row['title']):
            raise Refusal('invalid_read_pr')
        if row['state'] not in ('open', 'closed') or row['checks'] not in ('passed', 'failed', 'pending', 'unverified'):
            raise Refusal('invalid_read_pr')
    try:
        encoded = json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8')
    except (ValueError, TypeError, UnicodeError):
        raise Refusal('invalid_read_snapshot') from None
    if len(encoded) > MAX_SNAPSHOT_BYTES:
        raise Refusal('read_snapshot_too_large')
    return encoded


class SnapshotAdapter:
    """Only host-supplied immutable data. One dispatch reads the entire scope."""
    effects = frozenset({'read_scoped_source'})

    def __init__(self, value):
        self._encoded = snapshot_bytes(value)

    def _receipt(self):
        return {'snapshot': json.loads(self._encoded),
                'snapshot_sha256': hashlib.sha256(self._encoded).hexdigest(),
                'environment': 'fixture', 'publication': False,
                'autonomous_agent': False, 'coverage': 'selected_prs_only'}

    def read(self):
        return self._receipt()


class ReadBroker(Broker):
    """Extends the existing broker; uses its latch, ledger and durable receipts.

No call accepts a repository, path, URL, credentials, principal or mandate
chosen by a worker. principal must be resolved by a future trusted transport.
The adapter is exact-type checked: this candidate cannot inject live callbacks.
"""
    def __init__(self, db_path, mandate, *, snapshot_adapter, clock, control_latch,
                 launch_config=None):
        if type(snapshot_adapter) is not SnapshotAdapter or mandate.repositories != frozenset({REPOSITORY}) or mandate.actions != frozenset({'read_source', 'status'}):
            raise Refusal('read_only_host_required')
        super().__init__(db_path, mandate, REPOSITORY, clock=clock, control_latch=control_latch)
        self.snapshot_adapter = snapshot_adapter
        assert_host_private(self.store.path, (self.store.path.parent,), 'read_register_permissions_unsafe')
        if launch_config is not None:
            if type(launch_config) is not ReadLaunchConfig:
                raise Refusal('trusted_read_launch_config_required')
            launch_config.validate()
        self.launch_config = launch_config

    def execute(self, principal, proposal):
        if self.launch_config is None or type(proposal) is not dict or proposal.get('action') != 'read_source':
            return super().execute(principal, proposal)
        # The parent holds global admission across a synchronous snapshot read.
        # A worker needs short gates plus polling, so FINUBAR can stop it live.
        if set(proposal) != {'action', 'operation_id', 'expected_version'}:
            raise Refusal('unexpected_argument')
        if self.control.latch is None:
            raise Refusal('global_control_latch_required')
        assert_host_private(self.store.path, (self.store.path.parent,), 'read_register_permissions_unsafe')
        canonical = self.store.read_mission(self.mandate.mission, principal)
        self._launch_authority(canonical, principal)
        self.control.before_effect('read_source', REPOSITORY)
        payload = self._launch_payload(proposal)
        with self.control.latch.admission():
            prior = self.store.get_operation(self.mandate.mission, principal, proposal['operation_id'])
            if prior is not None:
                if prior['payload'] != payload:
                    raise Refusal('operation_conflict')
                if prior['status'] == 'completed':
                    self._validate_launch_receipt(prior['result'])
                    self.budget.settle(self.mandate.mission, proposal['operation_id'], 1)
                return prior
            from leo.runtime.memoire import _version
            if _version(proposal['expected_version']) != canonical['version']:
                raise Refusal('read_version_changed')
            reservation = self.budget.reserve(self.mandate.mission, proposal['operation_id'], principal, 1)
            if not reservation['new_reservation']:
                return {'status': 'unknown', 'reason': 'read_reservation_without_receipt'}
            operation = self.store.begin_operation(self.mandate.mission, principal,
                proposal['operation_id'], payload, proposal['expected_version'])

        @contextmanager
        def admission():
            # Shared SQLite transaction linearizes mission stop/revocation with
            # the exact container create/start call, never the whole worker.
            with self.store._transaction() as db:
                self._launch_guard(db, principal, proposal, payload, operation['version'])
                yield

        def check():
            with self.store._transaction(write=False) as db:
                self._launch_guard(db, principal, proposal, payload, operation['version'])

        from leo.control_r21.read_launcher import ReadLauncher
        config = self.launch_config
        claim_id = hashlib.sha256(json.dumps([self.mandate.mission, proposal['operation_id']],
                                             separators=(',', ':')).encode()).hexdigest()
        try:
            launcher = ReadLauncher(config.plan, self.control.latch, config.claim_directory / (claim_id + '.claim'),
                worker_sha256=config.worker_sha256, snapshot_sha256=payload['snapshot_sha256'],
                max_seconds=config.max_seconds, _host_admission=admission, _host_check=check)
            result = launcher.run()
            self._validate_launch_receipt(result)
            # Bookkeeping may persist a completed fact after stop; it launches
            # nothing. A lost response after this commit is recoverable.
            finished = self.store.complete_operation(self.mandate.mission, principal,
                proposal['operation_id'], result, expected_operation_version=operation['version'])
        except BaseException:
            # No implicit replay or settlement on uncertainty. Even SIGINT is
            # conservative; SIGKILL may leave pending, likewise never replayed.
            current = self.store.get_operation(self.mandate.mission, principal, proposal['operation_id'])
            if current is not None and current['status'] != 'completed':
                self.store.mark_unknown(self.mandate.mission, principal, proposal['operation_id'],
                    'read_launch_result_unknown', expected_operation_version=current['version'])
            raise
        self.budget.settle(self.mandate.mission, proposal['operation_id'], 1)
        return finished

    def _launch_authority(self, mission, principal):
        if mission['mandat'] != mandate_record(self.mandate) or mission['source'].get('repository') != REPOSITORY:
            raise Refusal('canonical_mandate_or_source_mismatch')
        if principal not in self.mandate.actors or principal not in {mission['owner'], *mission['writers']}:
            raise Refusal('writer_required')
        self.policy.authorize(self.mandate, principal, 'read_source', REPOSITORY, self.clock(),
                              effects=self.snapshot_adapter.effects)

    def _launch_context(self):
        config = self.launch_config
        namespace = hashlib.sha256(json.dumps([str(self.store.path.absolute()),
            str(config.claim_directory), self.mandate.mission], separators=(',', ':')).encode()).hexdigest()
        return {'kind': 'offline_docker', 'image': config.plan.image,
                'worker_sha256': config.worker_sha256, 'max_seconds': config.max_seconds,
                'claim_namespace_sha256': namespace}

    def _launch_payload(self, proposal):
        return {**proposal, 'snapshot_sha256': hashlib.sha256(self.snapshot_adapter._encoded).hexdigest(),
                'execution': self._launch_context()}

    def _launch_guard(self, db, principal, proposal, payload, operation_version):
        assert_host_private(self.store.path, (self.store.path.parent,), 'read_register_permissions_unsafe')
        row = self.store._authorized(db, self.mandate.mission, principal, write=True)
        self._launch_authority(self.store._mission(row), principal)
        self.store._assert_version(row, proposal['expected_version'])
        state = self.budget._status(db, self.mandate.mission)
        if state['stopped'] or state['expired']:
            raise Refusal('read_stopped_or_expired')
        registered = self.store._operation(self.store._find_operation(db, self.mandate.mission, proposal['operation_id']))
        if (registered is None or registered['payload'] != payload or registered['status'] != 'pending'
                or registered['version'] != operation_version):
            raise Refusal('read_operation_changed')
        reserve = db.execute('SELECT * FROM budget_operations WHERE mission=? AND operation=?',
                             (self.mandate.mission, proposal['operation_id'])).fetchone()
        if (reserve is None or reserve['actor'] != principal or reserve['reserved_units'] != 1
                or reserve['used_units'] is not None or state['committed_units'] > state['max_units']
                or state['calls'] > state['max_calls'] or state['attempts'] > state['max_attempts']
                or state['delegates'] > state['max_delegates']):
            raise Refusal('read_reservation_invalid')

    def _validate_launch_receipt(self, result):
        from leo.control_r21.read_worker import report
        expected = {'report': json.loads(report(self.snapshot_adapter._encoded)), 'container_removed': True,
                    'autonomous_agent': False, 'worker_sha256': self.launch_config.worker_sha256,
                    'snapshot_sha256': hashlib.sha256(self.snapshot_adapter._encoded).hexdigest()}
        if type(result) is not dict or result != expected:
            raise Refusal('read_launch_receipt_mismatch')

    def _execute(self, principal, proposal):
        if proposal['action'] != 'read_source':
            return super()._execute(principal, proposal)
        if set(proposal) != {'action', 'operation_id', 'expected_version'}:
            raise Refusal('unexpected_argument')
        assert_host_private(self.store.path, (self.store.path.parent,), 'read_register_permissions_unsafe')
        mission = self.store.read_mission(self.mandate.mission, principal)
        if mission['mandat'] != mandate_record(self.mandate) or mission['source'].get('repository') != REPOSITORY:
            raise Refusal('canonical_mandate_or_source_mismatch')
        self.policy.authorize(self.mandate, principal, 'read_source', REPOSITORY, self.clock(), effects=self.snapshot_adapter.effects)
        payload = {**proposal, 'snapshot_sha256': hashlib.sha256(self.snapshot_adapter._encoded).hexdigest()}
        prior = self.store.get_operation(self.mandate.mission, principal, proposal['operation_id'])
        if prior is not None:
            if prior['payload'] != payload:
                raise Refusal('operation_conflict')
            if prior['status'] == 'completed':
                self.budget.settle(self.mandate.mission, proposal['operation_id'], 1)
            return prior
        from leo.runtime.memoire import _version
        if _version(proposal['expected_version']) != mission['version']:
            raise Refusal('read_version_changed')
        reservation = self.budget.reserve(self.mandate.mission, proposal['operation_id'], principal, 1)
        if not reservation['new_reservation']:
            return {'status': 'unknown', 'reason': 'read_reservation_without_receipt'}
        operation = self.store.begin_operation(self.mandate.mission, principal, proposal['operation_id'], payload, proposal['expected_version'])
        # Recheck budget just before the bounded snapshot read. No network call
        # can be substituted here. A failure leaves pending, never redispatches.
        with self.store._transaction() as db:
            row = self.store._authorized(db, self.mandate.mission, principal, write=True)
            current = self.store._mission(row)
            self.store._assert_version(row, proposal['expected_version'])
            if current['mandat'] != mandate_record(self.mandate) or current['source'].get('repository') != REPOSITORY:
                raise Refusal('canonical_mandate_or_source_mismatch')
            state = self.budget._status(db, self.mandate.mission)
            if state['stopped'] or state['expired']:
                raise Refusal('read_stopped_or_expired')
            self.policy.authorize(self.mandate, principal, 'read_source', REPOSITORY, self.clock(), effects=self.snapshot_adapter.effects)
            result = self.snapshot_adapter.read()
        finished = self.store.complete_operation(self.mandate.mission, principal, proposal['operation_id'], result, expected_operation_version=operation['version'])
        self.budget.settle(self.mandate.mission, proposal['operation_id'], 1)
        return finished

    def reconcile_completed(self, principal, operation_id):
        """Retrieve and settle a completed receipt after stop; no dispatch."""
        assert_host_private(self.store.path, (self.store.path.parent,), 'read_register_permissions_unsafe')
        canonical = self.store.read_mission(self.mandate.mission, principal)
        if canonical['mandat'] != mandate_record(self.mandate) or canonical['source'].get('repository') != REPOSITORY:
            raise Refusal('canonical_mandate_or_source_mismatch')
        if principal not in self.mandate.actors or principal not in {canonical['owner'], *canonical['writers']}:
            raise Refusal('scope_denied')
        operation = self.store.get_operation(self.mandate.mission, principal, operation_id)
        if operation is None or operation['status'] != 'completed':
            raise Refusal('completed_receipt_required')
        expected = hashlib.sha256(self.snapshot_adapter._encoded).hexdigest()
        payload = operation['payload']
        if self.launch_config is not None:
            if (set(payload) != {'action', 'operation_id', 'expected_version', 'snapshot_sha256', 'execution'}
                    or payload['action'] != 'read_source' or payload['operation_id'] != operation_id
                    or payload != self._launch_payload({key: payload[key]
                        for key in ('action', 'operation_id', 'expected_version')})):
                raise Refusal('operation_context_mismatch')
            self._validate_launch_receipt(operation['result'])
            self.budget.settle(self.mandate.mission, operation_id, 1)
            return operation
        if (set(payload) != {'action', 'operation_id', 'expected_version', 'snapshot_sha256'} or
                payload['action'] != 'read_source' or payload['operation_id'] != operation_id or
                payload['snapshot_sha256'] != expected or
                operation['result'] != self.snapshot_adapter._receipt()):
            raise Refusal('operation_context_mismatch')
        self.budget.settle(self.mandate.mission, operation_id, 1)
        return operation


@dataclass(frozen=True)
class WorkerPlan:
    image: str
    worker_file: Path
    snapshot_file: Path

    def argv(self):
        """Build only; no subprocess launch, CLI or activation in this module."""
        if type(self.image) is not str or not re.fullmatch(r'python@sha256:[a-f0-9]{64}', self.image):
            raise Refusal('pinned_read_image_required')
        paths = (self.worker_file, self.snapshot_file)
        for path in paths:
            if (not isinstance(path, Path) or not path.is_absolute() or path.is_symlink() or
                    not path.is_file() or any(c in str(path) for c in (',', '\n', '\r'))):
                raise Refusal('fixed_read_input_required')
            if any(parent.is_symlink() for parent in path.parents):
                raise Refusal('fixed_read_input_required')
        if paths[0] == paths[1]:
            raise Refusal('separate_read_inputs_required')
        return ('docker', 'run', '--rm', '--pull', 'never', '--network', 'none', '--read-only',
                '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
                '--user', '65534:65534', '--pids-limit', '32', '--memory', '128m', '--cpus', '1',
                '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=8m,mode=0700,uid=65534,gid=65534',
                '--mount', f'type=bind,src={paths[0]},dst=/read_worker.py,readonly',
                '--mount', f'type=bind,src={paths[1]},dst=/snapshot.json,readonly',
                '--entrypoint', 'python', self.image, '-I', '-B', '/read_worker.py')


@dataclass(frozen=True)
class ReadLaunchConfig:
    """Operator-owned launch configuration, never accepted in a proposal."""
    plan: WorkerPlan
    worker_sha256: str
    claim_directory: Path
    max_seconds: float = 30

    def validate(self):
        import math
        import os
        if type(self.plan) is not WorkerPlan:
            raise Refusal('trusted_read_plan_required')
        self.plan.argv()
        if type(self.worker_sha256) is not str or not re.fullmatch('[a-f0-9]{64}', self.worker_sha256):
            raise Refusal('reviewed_worker_hash_required')
        root = self.claim_directory
        if (not isinstance(root, Path) or not root.is_absolute() or not root.is_dir()
                or root.is_symlink() or any(p.is_symlink() for p in root.parents)
                or root.stat().st_uid != os.geteuid() or root.stat().st_mode & 0o077):
            raise Refusal('private_read_claim_required')
        if type(self.max_seconds) not in (int, float) or not math.isfinite(self.max_seconds) or not 0 < self.max_seconds <= 120:
            raise Refusal('bounded_read_deadline_required')
