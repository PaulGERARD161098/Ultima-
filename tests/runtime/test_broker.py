import tempfile
from pathlib import Path
import unittest
from finubar.leo_control import ControlLatch
from leo.runtime.broker import Broker, mandate_record
from leo.runtime.budget import BudgetLedger
from leo.runtime.memoire import MissionStore
from leo.runtime.policy import Approval, Context, Evidence, Mandate, Refusal


class BrokerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / 'canonical.sqlite'
        self.latch = ControlLatch(Path(self.tmp.name) / 'control.sqlite', initialize=True)
        self.m = Mandate('mission', 'paul-fixture', 1, frozenset({'leo', 'reader'}),
                         frozenset({'fixture/repo'}), frozenset({'write_memory', 'merge_fixture', 'status'}),
                         expires_at=1000)
        self.b = Broker(self.db, self.m, 'fixture/repo', clock=lambda: 10, control_latch=self.latch)
        self.b.store.create_mission('mission', 'paul-fixture', 'project', mandate_record(self.m),
                                    {'repository': 'fixture/repo'}, ['reader'], ['leo'], authority=True)
        self.b.budget.create('mission', dict(max_units=100, max_calls=20, max_attempts=20,
                                           max_delegates=2, expires_at=1000), authority=True)

    def tearDown(self): self.tmp.cleanup()

    def test_effect_without_global_control_fails_closed(self):
        # Audit C6 : sans verrou global, aucun effet ; le statut reste lisible.
        bare = Broker(self.db, self.m, 'fixture/repo', clock=lambda: 10)
        request = dict(action='write_memory', operation_id='no-latch', expected_version=1,
                       patch={'state': 'in_progress'})
        with self.assertRaisesRegex(Refusal, '^global_control_latch_required$'):
            bare.execute('leo', request)
        self.assertEqual(bare.execute('leo', {'action': 'status'})['mission']['version'], 1)
        self.assertEqual(self.b.budget.status('mission')['calls'], 0)

    def test_actor_cannot_write_approval_like_states(self):
        # Audit C11 : « approuvée pour fusion » ou « fusionnée » n'est jamais
        # écrit par l'acteur ; un état descriptif ordinaire reste admis.
        for state in ('approved_for_merge', 'merged'):
            with self.assertRaisesRegex(Refusal, '^owner_state_required$'):
                self.b.execute('leo', dict(action='write_memory', operation_id='forge-' + state,
                                           expected_version=1, patch={'state': state}))
        self.assertEqual(self.b.budget.status('mission')['calls'], 0)
        done = self.b.execute('leo', dict(action='write_memory', operation_id='ok', expected_version=1,
                                          patch={'state': 'ready_for_review'}))
        self.assertEqual(done['result']['state'], 'ready_for_review')

    def test_write_response_lost_then_new_broker(self):
        request = {'action': 'write_memory', 'operation_id': 'op-1', 'expected_version': 1,
                   'patch': {'state': 'in_progress', 'next_action': 'review'}}
        self.b.execute('leo', request)  # réponse délibérément jetée
        reopened = Broker(self.db, self.m, 'fixture/repo', clock=lambda: 10, control_latch=self.latch)
        recovered = reopened.execute('leo', request)
        self.assertEqual(recovered['status'], 'completed')
        self.assertEqual(reopened.store.read_mission('mission', 'leo')['version'], 2)
        self.assertEqual(reopened.budget.status('mission')['calls'], 1)

    def test_reconcile_completed_after_budget_stop(self):
        request = dict(action='write_memory', operation_id='crash-stop', expected_version=1,
                       patch={'state': 'in_progress'})
        def crash(*args): raise RuntimeError('trusted failpoint')
        self.b.budget.settle = crash
        with self.assertRaises(RuntimeError): self.b.execute('leo', request)
        reopened = Broker(self.db, self.m, 'fixture/repo', clock=lambda: 10, control_latch=self.latch)
        reopened.budget.stop('mission', 'stop-before-reconciliation', authority=True)
        self.assertEqual(reopened.reconcile_completed('leo', 'crash-stop')['status'], 'completed')
        self.assertEqual(reopened.budget.status('mission')['reserved_units'], 0)
        self.assertTrue(reopened.budget.status('mission')['stopped'])
        with self.assertRaises(Refusal):
            reopened.execute('leo', {**request, 'patch': {'state': 'closed'}})

    def test_readers_and_model_authority_rejected(self):
        request = {'action': 'write_memory', 'operation_id': 'op-1', 'expected_version': 1,
                   'patch': {'state': 'in_progress'}}
        with self.assertRaises(Refusal): self.b.execute('reader', request)
        for injected in ['authority', 'principal', 'budget', 'effects', 'approval', 'repository']:
            with self.assertRaises(Refusal): self.b.execute('leo', {**request, injected: True})
        self.assertEqual(self.b.budget.status('mission')['calls'], 0)

    def test_crash_after_memory_commit_before_settle(self):
        request = dict(action='write_memory', operation_id='crash', expected_version=1,
                       patch={'state': 'in_progress'})
        def crash(*args): raise RuntimeError('trusted failpoint')
        self.b.budget.settle = crash
        with self.assertRaises(RuntimeError): self.b.execute('leo', request)
        reopened = Broker(self.db, self.m, 'fixture/repo', clock=lambda: 10, control_latch=self.latch)
        self.assertEqual(reopened.budget.status('mission')['reserved_units'], 1)
        with self.assertRaises(Refusal): reopened.reconcile_completed('reader', 'crash')
        with self.assertRaises(Refusal) as denied:
            reopened.reconcile_fixture('reader', 'crash')
        self.assertEqual(denied.exception.code, 'writer_required')
        self.assertEqual(reopened.budget.status('mission')['reserved_units'], 1)
        self.assertEqual(reopened.execute('leo', request)['status'], 'completed')
        self.assertEqual(reopened.budget.status('mission')['reserved_units'], 0)
        self.assertEqual(reopened.budget.status('mission')['calls'], 1)

    def test_stop_and_orphan_reservation(self):
        self.b.budget.reserve('mission', 'orphan', 'leo', 1)
        req = {'action': 'write_memory', 'operation_id': 'orphan', 'expected_version': 1,
               'patch': {'state': 'in_progress'}}
        self.assertEqual(self.b.execute('leo', req)['status'], 'unknown')
        self.assertEqual(self.b.store.read_mission('mission', 'leo')['version'], 1)
        self.b.budget.stop('mission', 'operator_stop', authority=True)
        from leo.runtime.budget import BudgetError
        with self.assertRaises(BudgetError): self.b.execute('leo', {**req, 'operation_id': 'other'})
        self.assertTrue(self.b.execute('leo', {'action': 'status'})['budget']['stopped'])

    def test_stop_after_reservation_prevents_merge_admission(self):
        context = Context('fixture/repo', 'a' * 40, 'b' * 40, 'c' * 40,
                          'fixture', 'fixture-account')
        calls = []
        class Adapter:
            effects = frozenset({'update_fixture_ref'})
            atomic = True
            def merge(self, supplied):
                calls.append(supplied)
                return {'commit': supplied.integration, 'environment': 'fixture', 'publication': False}
        self.b.adapter, self.b.context = Adapter(), context
        self.b.approval = Approval(context, 'paul-fixture', 1, 900)
        self.b.evidence = tuple(Evidence(context, kind, True, 'fixture/log',
                                       '2026-09-29', 'simulated host evidence')
                                for kind in ('tests', 'review'))
        reserve = self.b.budget.reserve
        def stop_before_admission(*args):
            receipt = reserve(*args)
            self.b.budget.stop('mission', 'operator_stop', authority=True)
            return receipt
        self.b.budget.reserve = stop_before_admission
        with self.assertRaisesRegex(Refusal, 'merge_stopped_or_expired'):
            self.b.execute('leo', dict(action='merge_fixture', operation_id='race-stop', expected_version=1))
        self.assertEqual(calls, [], 'un arrêt gagné interdit réellement le départ de l’adaptateur')
        self.assertEqual(self.b.store.get_operation('mission', 'leo', 'race-stop')['status'], 'pending')
        self.assertEqual(self.b.budget.status('mission')['reserved_units'], 2)


if __name__ == '__main__': unittest.main()
