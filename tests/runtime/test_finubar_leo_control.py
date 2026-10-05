"""FINUBAR impose l'arrêt via le registre, pas via une promesse du modèle."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

from dataclasses import replace
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from finubar.leo_control import LeoControl, ControlLatch, CONTROL_REPOSITORY, control_violation
from leo.runtime.broker import Broker, mandate_record
from leo.runtime.budget import BudgetError
from leo.runtime.policy import Mandate, Refusal


class FinubarLeoControlTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / 'canonical.sqlite'
        self.mandate = Mandate('mission', 'paul', 1, frozenset({'leo', 'reader'}),
            frozenset({'fixture/repo', CONTROL_REPOSITORY}),
            frozenset({'status', 'write_memory'}), expires_at=1000)
        self.broker = Broker(self.path, self.mandate, 'fixture/repo', clock=lambda: 10)
        self.broker.store.create_mission('mission', 'paul', 'fiction', mandate_record(self.mandate),
            {'repository': 'fixture/repo'}, ['reader'], ['leo'], authority=True)
        self.broker.budget.create('mission', dict(max_units=20, max_calls=10,
            max_attempts=10, max_delegates=2, expires_at=1000), authority=True)

    def tearDown(self):
        self.tmp.cleanup()

    def request(self, **changes):
        return dict(action='write_memory', operation_id='memory-1', expected_version=1,
                    patch={'state': 'in_progress'}) | changes

    def test_self_control_attempt_stops_before_effect_and_survives_new_broker(self):
        with patch.object(self.broker.store, 'apply_memory_operation') as effect:
            with self.assertRaisesRegex(Refusal, '^leo_self_control_attempt$'):
                self.broker.execute('leo', {'action': 'self_approve'})
            effect.assert_not_called()
        fresh = Broker(self.path, self.mandate, 'fixture/repo', clock=lambda: 10)
        self.assertTrue(fresh.budget.status('mission')['stopped'])
        self.assertEqual(fresh.budget.status('mission')['reason'], 'leo_self_control_attempt')
        with self.assertRaisesRegex(BudgetError, 'mission_stopped'):
            fresh.execute('leo', self.request())
        self.assertEqual(fresh.store.read_mission('mission', 'leo')['version'], 1)
        self.assertEqual(fresh.budget.status('mission')['calls'], 0)
        with self.assertRaisesRegex(Refusal, 'leo_self_control_attempt'):
            fresh.execute('leo', {'action': 'resume_control'})
        self.assertTrue(fresh.budget.status('mission')['stopped'])

    def test_protected_repository_overrides_even_a_broad_mandate(self):
        dangerous = Broker(self.path, self.mandate, CONTROL_REPOSITORY.upper(), clock=lambda: 10)
        with self.assertRaisesRegex(Refusal, 'leo_control_write_attempt'):
            dangerous.execute('leo', self.request())
        self.assertTrue(self.broker.budget.status('mission')['stopped'])
        self.assertEqual(self.broker.budget.status('mission')['calls'], 0)

    def test_paths_symlinks_and_ancestor_mutations_are_protected(self):
        root = Path(self.tmp.name) / 'control'
        root.mkdir()
        alias = Path(self.tmp.name) / 'alias'
        alias.symlink_to(root, target_is_directory=True)
        for target in (str(root), str(root / 'policy.py'), str(alias / 'policy.py'), self.tmp.name):
            with self.subTest(target=target):
                self.assertEqual(control_violation('prepare_patch', target,
                    protected_paths=(root,)), 'leo_control_write_attempt')
        self.assertIsNone(control_violation('prepare_patch', str(Path(self.tmp.name) / 'draft'),
                                           protected_paths=(root,)))

    def test_reader_and_foreign_identity_cannot_stop_another_mission(self):
        for principal in ('reader', 'foreign'):
            with self.subTest(principal=principal), self.assertRaises(Exception):
                self.broker.execute(principal, {'action': 'self_approve'})
        self.assertFalse(self.broker.budget.status('mission')['stopped'])

    def test_normal_memory_write_keeps_existing_receipt_and_status(self):
        result = self.broker.execute('leo', self.request())
        self.assertEqual(result['status'], 'completed')
        self.assertFalse(self.broker.budget.status('mission')['stopped'])
        self.assertEqual(self.broker.execute('leo', self.request()), result)
        self.assertEqual(self.broker.budget.status('mission')['calls'], 1)

    def test_stop_after_reservation_prevents_memory_admission(self):
        original = self.broker.budget.reserve
        def stop_after_reserve(*args, **kwargs):
            result = original(*args, **kwargs)
            self.broker.budget.stop('mission', 'fixture_stop', authority=True)
            return result
        with patch.object(self.broker.budget, 'reserve', side_effect=stop_after_reserve):
            with self.assertRaisesRegex(Refusal, 'memory_stopped_or_expired'):
                self.broker.execute('leo', self.request())
        self.assertEqual(self.broker.store.read_mission('mission', 'leo')['version'], 1)
        self.assertIsNone(self.broker.store.get_operation('mission', 'leo', 'memory-1'))

    def test_shared_latch_stops_other_mission_without_self_reset(self):
        latch_path = Path(self.tmp.name) / 'agent.sqlite'
        latch = ControlLatch(latch_path, initialize=True)
        first = Broker(self.path, self.mandate, 'fixture/repo', clock=lambda:10, control_latch=latch)
        other_mandate = replace(self.mandate, mission='other-mission')
        other = Broker(Path(self.tmp.name)/'other.sqlite', other_mandate, 'fixture/repo',
                       clock=lambda:10, control_latch=ControlLatch(latch_path))
        other.store.create_mission('other-mission', 'paul', 'fiction', mandate_record(other_mandate),
            {'repository':'fixture/repo'}, [], ['leo'], authority=True)
        other.budget.create('other-mission', dict(max_units=20, max_calls=10, max_attempts=10,
            max_delegates=2, expires_at=1000), authority=True)
        with self.assertRaisesRegex(Refusal, 'leo_self_control_attempt'):
            first.execute('leo', {'action':'self_approve'})
        self.assertTrue(ControlLatch(latch_path).stopped())
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            other.execute('leo', self.request())
        self.assertEqual(other.budget.status('other-mission')['calls'], 0)
        self.assertEqual(other.execute('leo', {'action':'status'})['mission']['version'], 1)
        self.assertFalse(hasattr(latch, 'reset'))

    def test_global_stop_waits_for_admitted_effect_then_blocks_next(self):
        import threading
        path = Path(self.tmp.name) / 'agent-race.sqlite'
        latch = ControlLatch(path, initialize=True)
        entered, release, finished = threading.Event(), threading.Event(), threading.Event()
        errors = []
        def effect():
            try:
                with latch.admission():
                    entered.set()
                    if not release.wait(5):
                        raise RuntimeError('fixture_timeout')
            except Exception as error: errors.append(error)
        def stop():
            try:
                ControlLatch(path).trip('leo_self_control_attempt')
                finished.set()
            except Exception as error: errors.append(error)
        worker = threading.Thread(target=effect)
        worker.start()
        self.assertTrue(entered.wait(5))
        stopper = threading.Thread(target=stop)
        stopper.start()
        self.assertFalse(finished.wait(0.1))
        release.set()
        worker.join(5)
        stopper.join(5)
        self.assertEqual(errors, [])
        self.assertTrue(finished.is_set())
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            with ControlLatch(path).admission(): self.fail('forbidden departure')

    def test_known_negative_witness_detects_guard_removal(self):
        self.assertEqual(control_violation('self_approve', 'fixture/repo'), 'leo_self_control_attempt')
        with patch('finubar.leo_control.SELF_CONTROL_ACTIONS', frozenset()):
            with self.assertRaises(AssertionError):
                self.assertEqual(control_violation('self_approve', 'fixture/repo'), 'leo_self_control_attempt')

    def test_missing_stopped_control_or_row_never_rearms_on_reopen(self):
        import sqlite3
        path = Path(self.tmp.name) / 'stopped-control.sqlite'
        latch = ControlLatch(path, initialize=True)
        latch.trip('leo_self_control_attempt')
        with sqlite3.connect(path) as db: db.execute('DELETE FROM control')
        for initialize in (False, True):
            with self.subTest(initialize=initialize), self.assertRaisesRegex(Refusal, 'control_unavailable'):
                ControlLatch(path, initialize=initialize)
        path.unlink()
        with self.assertRaisesRegex(Refusal, 'control_unavailable'): ControlLatch(path)
        self.assertFalse(path.exists())

    def test_mandate_expiry_is_rechecked_under_memory_admission_lock(self):
        now = [10]
        self.broker.clock = lambda: now[0]
        original = self.broker.budget.reserve
        def expire_after_reserve(*args, **kwargs):
            result = original(*args, **kwargs)
            now[0] = 1000
            return result
        with patch.object(self.broker.budget, 'reserve', side_effect=expire_after_reserve):
            with self.assertRaisesRegex(Refusal, '^expired$'):
                self.broker.execute('leo', self.request())
        self.assertEqual(self.broker.store.read_mission('mission', 'leo')['version'], 1)
