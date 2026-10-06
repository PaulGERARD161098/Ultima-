"""Bounded fixture delegation, invoked by a trusted isolated host before transport.

Only dispatch(principal, {action, task, operation_id, expected_version}) accepts
model proposals. The host authenticates principal, owns the SQLite directory,
installs the task catalog, grants, source data, clock and transport. Neither this
constructor nor transport/lookup is a model tool. There is no Work/provider
adapter, API activation, paid call or new budget here. Costs are fixture units.

Catalog tasks contain action (read_source), recipient, record_ids and units.
Records contain quadrant and text; the host must classify/minimize them first.
The transport receives only selected records. Journals contain their digest,
not their contents. Transport results are closed receipts, never instructions.

Reservation is durable BEFORE transmission. The final SQLite write transaction
serializes admission with BudgetLedger.stop and mission CAS. A stop committed
before admission prevents transmission; once admission wins, the operation is
engaged (stop cannot cancel it). The only admitted transport is the closed FixtureInspector: bounded string
inspection and local receipt persistence, without callbacks/network/subprocess.
The lock is held across this local send. The isolated host still enforces the
process deadline/resource limits and owns the receipt directory. A crash leaves pending/unknown
and its reservation; no retry dispatches it. Only transport.lookup can resolve
it, including from a fresh process. These guarantees require all dispatchers
and stops to use the same protected local database.
"""
import hashlib
import json
import math
import time

from .fixture_transport import FixtureInspector
from .broker import mandate_record
from .budget import BudgetLedger, _integer
from .memoire import MissionStore, _identifier, _json, _now, _version
from .policy import Policy, Refusal
from finubar.leo_control import ControlLatch


class DispatchBroker:
    def __init__(self, db_path, mandate, source, *, tasks, records, grants,
                 transport, control_latch, clock=time.time):
        # C12 : une délégation est un effet ; l'arrêt global FINUBAR la gouverne.
        if type(control_latch) is not ControlLatch:
            raise TypeError('global_control_latch_required')
        self.latch = control_latch
        self.store = MissionStore(db_path)
        self.budget = BudgetLedger(db_path, clock=clock)
        if type(transport) is not FixtureInspector:
            raise Refusal('fixture_transport_required')
        self.mandate, self.clock, self.transport = mandate, clock, transport
        self.policy = Policy()
        # Private snapshots: caller/model mutation cannot expand a running task.
        self.source = json.loads(_json(source))
        self.tasks = json.loads(_json(tasks))
        self.records = json.loads(_json(records))
        self.grants = json.loads(_json(grants))
        if (set(self.source) != {'repository', 'commit'}
                or not isinstance(self.source['commit'], str)
                or len(self.source['commit']) != 40
                or any(c not in '0123456789abcdef' for c in self.source['commit'])):
            raise Refusal('invalid_host_source')
        _identifier(self.source['repository'])
        for recipient, quadrants in self.grants.items():
            _identifier(recipient)
            if type(quadrants) is not list or any(type(q) is not str for q in quadrants):
                raise Refusal('invalid_host_grants')
        for key, record in self.records.items():
            _identifier(key)
            if (type(record) is not dict or set(record) != {'quadrant', 'text'}
                    or type(record['quadrant']) is not str
                    or type(record['text']) is not str):
                raise Refusal('invalid_host_record')
        for key, task in self.tasks.items():
            _identifier(key)
            if (type(task) is not dict or set(task) != {'action', 'recipient', 'record_ids', 'units'}
                    or task['action'] != 'read_source' or task['recipient'] == 'root'
                    or type(task['record_ids']) is not list or not task['record_ids']
                    or any(type(r) is not str or r not in self.records for r in task['record_ids'])
                    or len(set(task['record_ids'])) != len(task['record_ids'])):
                raise Refusal('invalid_host_task')
            _identifier(task['recipient'])
            if _integer(task['units']) < 1:
                raise Refusal('invalid_host_cost')

    def _time(self):
        now = self.clock()
        if type(now) not in (int, float) or not math.isfinite(now):
            raise Refusal('invalid_clock')
        return now

    def _gate(self, mission, principal, task, data):
        if mission['mandat'] != mandate_record(self.mandate):
            raise Refusal('canonical_mandate_mismatch')
        if mission['source'] != self.source:
            raise Refusal('canonical_source_mismatch')
        if principal not in {mission['owner'], *mission['writers']}:
            raise Refusal('writer_required')
        now = self._time()
        self.policy.authorize(self.mandate, principal, task['action'],
                              self.source['repository'], now,
                              effects=frozenset({'read_scoped_source'}))
        self.policy.delegate(self.mandate, principal, task['recipient'],
                             [record['quadrant'] for record in data.values()],
                             self.grants, now=now)

    @staticmethod
    def _receipt(result, envelope):
        names = {'mission', 'operation_id', 'source', 'task', 'recipient', 'digest', 'outcome'}
        if type(result) is not dict or set(result) != names:
            raise Refusal('invalid_transport_receipt')
        for key in names - {'outcome'}:
            if result[key] != envelope[key]:
                raise Refusal('invalid_transport_receipt')
        if result['outcome'] not in ('passed', 'failed'):
            raise Refusal('invalid_transport_receipt')
        return json.loads(_json(result))

    def _request(self, proposal):
        if (type(proposal) is not dict
                or set(proposal) != {'action', 'task', 'operation_id', 'expected_version'}
                or proposal['action'] != 'delegate_fixture'
                or type(proposal['task']) is not str or proposal['task'] not in self.tasks):
            raise Refusal('invalid_proposal')
        _identifier(proposal['operation_id'])
        _version(proposal['expected_version'])
        task = self.tasks[proposal['task']]
        data = {key: self.records[key] for key in task['record_ids']}
        # Fingerprint includes task cost/config and exact content; the content
        # itself never enters the durable operational record.
        digest = hashlib.sha256(_json({'task': task, 'records': data}).encode()).hexdigest()
        envelope = {'mission': self.mandate.mission, 'operation_id': proposal['operation_id'],
                    'source': self.source, 'task': proposal['task'],
                    'recipient': task['recipient'], 'digest': digest}
        payload = {**envelope, 'kind': 'delegate_fixture',
                   'expected_version': proposal['expected_version'], 'units': task['units']}
        return task, data, envelope, payload

    def dispatch(self, principal, proposal):
        task, data, envelope, payload = self._request(proposal)
        mid, oid = self.mandate.mission, proposal['operation_id']
        # Refus précoce, sans réservation orpheline ; l'admission ci-dessous fait foi.
        if self.latch.stopped():
            raise Refusal('leo_agent_stopped')
        mission = self.store.read_mission(mid, principal)
        self._gate(mission, principal, task, data)
        operation = self.store.begin_operation(mid, principal, oid, payload,
                                               proposal['expected_version'])
        if operation['status'] == 'completed':
            self.budget.settle(mid, oid, task['units'])
            return operation
        reservation = self.budget.reserve(mid, oid, task['recipient'], task['units'])
        if not reservation['new_reservation']:
            return operation  # pending/unknown is NEVER a dispatch permission.
        # Reservation survived before this lock. Even process death in send
        # cannot erase the charge and enable another transmitter.
        with self.latch.admission(), self.store._transaction() as db:
            row = self.store._authorized(db, mid, principal, write=True)
            self._gate(self.store._mission(row), principal, task, data)
            self.store._assert_version(row, proposal['expected_version'])
            state = self.budget._status(db, mid)
            if state['stopped'] or state['expired']:
                raise Refusal('dispatch_stopped_or_expired')
            op = self.store._find_operation(db, mid, oid)
            self.store._same_request(op, _json(payload))
            if op['status'] != 'pending':
                return self.store._operation(op)
            try:
                request = json.loads(_json({**envelope, 'records': data}))
                result = self._receipt(FixtureInspector.send(self.transport, request), envelope)
            except Exception:
                # No raw exception/provider text in the journal.
                db.execute("UPDATE operations SET status='unknown', reason='transport_result_unknown', "
                           'version=version+1, updated_at=? WHERE mission_id=? AND operation_id=?',
                           (_now(), mid, oid))
            else:
                db.execute("UPDATE operations SET status='completed', result=?, reason=NULL, "
                           'version=version+1, updated_at=? WHERE mission_id=? AND operation_id=?',
                           (_json(result), _now(), mid, oid))
            operation = self.store._operation(self.store._find_operation(db, mid, oid))
        if operation['status'] == 'completed':
            self.budget.settle(mid, oid, task['units'])
        return operation

    def reconcile(self, principal, proposal):
        """Read the host transport receipt without resending, also after stop/expiry."""
        task, data, envelope, payload = self._request(proposal)
        mid, oid = self.mandate.mission, proposal['operation_id']
        mission = self.store.read_mission(mid, principal)
        if (mission['mandat'] != mandate_record(self.mandate) or mission['source'] != self.source
                or principal not in self.mandate.actors
                or principal not in {mission['owner'], *mission['writers']}):
            raise Refusal('reconciliation_scope_denied')
        op = self.store.get_operation(mid, principal, oid)
        if op is None or op['payload'] != payload:
            raise Refusal('operation_context_mismatch')
        if op['status'] != 'completed':
            result = FixtureInspector.lookup(self.transport, json.loads(_json(envelope)))
            if result is None:
                return op
            result = self._receipt(result, envelope)
            op = self.store.complete_operation(mid, principal, oid, result,
                                               expected_operation_version=op['version'])
        self.budget.settle(mid, oid, task['units'])
        return op
