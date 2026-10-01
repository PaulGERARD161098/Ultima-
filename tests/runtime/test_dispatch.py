import json
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from pathlib import Path

from leo.runtime.broker import mandate_record
from leo.runtime.budget import BudgetError
from leo.runtime.dispatch import DispatchBroker
from leo.runtime.fixture_transport import FixtureInspector
from leo.runtime.memoire import AccessDenied, Conflict
from leo.runtime.policy import Mandate, Refusal


class DispatchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.db = self.root / 'register.sqlite'
        self.receipts = self.root / 'receipts'
        self.receipts.mkdir()
        self.now = 10
        self.m = Mandate('mission', 'paul', 1,
                         frozenset({'leo', 'reader', 'inspector'}),
                         frozenset({'fixture/repo'}), frozenset({'read_source', 'status'}),
                         quadrants=frozenset({'code', 'intime'}), expires_at=100)
        self.source = {'repository': 'fixture/repo', 'commit': 'a' * 40}
        self.tasks = {'inspect': {'action': 'read_source', 'recipient': 'inspector',
                                  'record_ids': ['needed'], 'units': 2}}
        self.records = {'needed': {'quadrant': 'code', 'text': 'synthetic safe sample'},
                        'secret': {'quadrant': 'intime', 'text': 'NEVER_TRANSMIT_PERSONAL_DATA'}}
        self.grants = {'inspector': ['code']}
        self.b = self.broker()
        self.b.store.create_mission('mission', 'paul', 'fixture', mandate_record(self.m),
                                    self.source, ['reader'], ['leo'], authority=True)
        self.b.budget.create('mission', dict(max_units=10, max_calls=5, max_attempts=5,
                                           max_delegates=1, expires_at=100), authority=True)
        self.req = dict(action='delegate_fixture', task='inspect', operation_id='op', expected_version=1)

    def broker(self, lose=False, **kwargs):
        return DispatchBroker(self.db, self.m, self.source, tasks=self.tasks,
                              records=self.records, grants=self.grants,
                              transport=FixtureInspector(self.receipts, lose_response=lose),
                              clock=lambda: self.now, **kwargs)

    def tearDown(self):
        self.tmp.cleanup()

    def count(self):
        return len(list(self.receipts.glob('*.json')))

    def test_success_minimal_payload_and_reservation(self):
        result = self.b.dispatch('leo', self.req)
        self.assertEqual(result['status'], 'completed')
        self.assertEqual(result['result']['outcome'], 'passed')
        self.assertEqual(self.count(), 1)
        self.assertEqual(self.b.budget.status('mission')['calls'], 1)
        self.assertEqual(self.b.budget.status('mission')['used_units'], 2)
        # Known defect in an unselected quadrant must not affect the inspector.
        self.assertNotIn('NEVER_TRANSMIT', json.dumps(result))
        self.assertNotIn('synthetic safe sample', json.dumps(result))
        self.assertNotIn('records', result['payload'])
        self.assertEqual(self.b.dispatch('leo', self.req), result)
        self.assertEqual(self.count(), 1)

    def test_instrument_red_and_unselected_content(self):
        self.records['secret']['text'] = 'KNOWN_DEFECT'
        self.b = self.broker()
        self.assertEqual(self.b.dispatch('leo', self.req)['result']['outcome'], 'passed')
        self.records['needed']['text'] = 'KNOWN_DEFECT'
        other = self.broker()
        req = {**self.req, 'operation_id': 'red'}
        self.assertEqual(other.dispatch('leo', req)['result']['outcome'], 'failed')
        self.assertEqual(self.count(), 2)

    def test_closed_proposal_rights_and_source(self):
        for key in ('records', 'grants', 'recipient', 'authority', 'source', 'units', 'transport'):
            with self.assertRaises(Refusal):
                self.b.dispatch('leo', {**self.req, key: True})
        for actor in ('reader', 'outsider'):
            with self.assertRaises((AccessDenied, Refusal)):
                self.b.dispatch(actor, self.req)
        self.source['commit'] = 'b' * 40
        with self.assertRaises(Refusal):
            self.broker().dispatch('leo', self.req)
        self.assertEqual(self.count(), 0)
        self.assertEqual(self.b.budget.status('mission')['calls'], 0)

    def test_recipient_quadrant_denied_and_host_snapshot(self):
        self.tasks['inspect']['record_ids'] = ['secret']
        with self.assertRaises(Refusal):
            self.broker().dispatch('leo', self.req)
        # Caller mutation did not alter the already constructed host catalog.
        self.assertEqual(self.b.dispatch('leo', self.req)['status'], 'completed')

    def test_stop_expiry_and_stale_version_zero_transport(self):
        self.now = 101
        with self.assertRaises(Refusal): self.b.dispatch('leo', self.req)
        self.now = 10
        self.b.store.update_mission('mission', 'leo', 1, {'state': 'in_progress'})
        with self.assertRaises(Conflict): self.b.dispatch('leo', self.req)
        self.b.budget.stop('mission', 'operator_stop', authority=True)
        with self.assertRaises(BudgetError):
            self.b.dispatch('leo', {**self.req, 'expected_version': 2})
        self.assertEqual(self.count(), 0)

    def test_stop_wins_between_reservation_and_admission(self):
        reserve = self.b.budget.reserve
        def stop_after_reserve(*args):
            result = reserve(*args)
            self.b.budget.stop('mission', 'operator_stop', authority=True)
            return result
        self.b.budget.reserve = stop_after_reserve
        with self.assertRaises(Refusal): self.b.dispatch('leo', self.req)
        self.assertEqual(self.count(), 0)
        self.assertEqual(self.b.budget.status('mission')['reserved_units'], 2)
        self.assertEqual(self.b.store.get_operation('mission', 'leo', 'op')['status'], 'pending')

    def test_lost_response_fresh_host_reconcile_after_stop_no_replay(self):
        b = self.broker(lose=True)
        result = b.dispatch('leo', self.req)
        self.assertEqual(result['status'], 'unknown')
        self.assertEqual(b.budget.status('mission')['reserved_units'], 2)
        fresh = self.broker()
        self.assertEqual(fresh.dispatch('leo', self.req)['status'], 'unknown')
        fresh.budget.stop('mission', 'operator_stop', authority=True)
        self.now = 101
        with self.assertRaises(Refusal): fresh.reconcile('reader', self.req)
        self.assertEqual(fresh.reconcile('leo', self.req)['status'], 'completed')
        self.assertEqual(self.count(), 1)
        self.assertEqual(fresh.budget.status('mission')['reserved_units'], 0)
        self.assertEqual(fresh.budget.status('mission')['calls'], 1)

    def test_orphan_reservation_never_transmits(self):
        self.b.budget.reserve('mission', 'op', 'inspector', 2)
        self.assertEqual(self.b.dispatch('leo', self.req)['status'], 'pending')
        self.assertEqual(self.b.reconcile('leo', self.req)['status'], 'pending')
        self.assertEqual(self.count(), 0)
        self.assertEqual(self.b.budget.status('mission')['reserved_units'], 2)

    def test_concurrent_same_operation_transmits_once(self):
        brokers = [self.broker(), self.broker()]
        barrier = threading.Barrier(2)
        def call(b):
            barrier.wait(timeout=5)
            return b.dispatch('leo', self.req)
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(call, brokers))
        self.assertTrue(all(r['status'] in ('pending', 'completed') for r in results))
        self.assertEqual(self.b.reconcile('leo', self.req)['status'], 'completed')
        self.assertEqual(self.count(), 1)
        self.assertEqual(self.b.budget.status('mission')['calls'], 1)

    def test_shared_limit_concurrent_distinct_operations(self):
        self.b.budget.reserve('mission', 'other-consumer', 'root', 8)
        brokers = [self.broker(), self.broker()]
        barrier = threading.Barrier(2)
        def call(pair):
            b, oid = pair
            barrier.wait(timeout=5)
            try:
                return b.dispatch('leo', {**self.req, 'operation_id': oid})['status']
            except BudgetError:
                return 'refused'
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(call, zip(brokers, ('one', 'two'))))
        self.assertEqual(sorted(results), ['completed', 'refused'])
        self.assertEqual(self.count(), 1)
        self.assertEqual(self.b.budget.status('mission')['committed_units'], 10)

    def test_arbitrary_transport_refused(self):
        with self.assertRaises(Refusal):
            DispatchBroker(self.db, self.m, self.source, tasks=self.tasks, records=self.records,
                           grants=self.grants, transport=object())


if __name__ == '__main__': unittest.main()
