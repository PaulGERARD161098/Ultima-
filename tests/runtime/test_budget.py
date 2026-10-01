"""R27 fixtures only; run inside the CI isolation container, never against live state."""
import concurrent.futures
import multiprocessing
import os
from pathlib import Path
import sqlite3
import stat
import tempfile
import unittest

from leo.runtime.budget import BudgetError, BudgetLedger


def competing_reservation(args):
    path, operation, actor = args
    ledger = BudgetLedger(path, clock=lambda: 100)
    try:
        return ledger.reserve('mission', operation, actor, 3)['new_reservation']
    except BudgetError as error:
        return error.code


class BudgetTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = str(Path(self.tmp.name) / 'budget.sqlite')
        self.now = 100
        self.ledger = BudgetLedger(self.path, clock=lambda: self.now)
        self.limits = dict(max_units=10, max_calls=10, max_attempts=10,
                           max_delegates=10, expires_at=200)
        self.ledger.create('mission', self.limits, authority=True)

    def denied(self, code, call, *args, **kwargs):
        with self.assertRaises(BudgetError) as context:
            call(*args, **kwargs)
        self.assertEqual(context.exception.code, code)

    def test_new_file_private_and_existing_permissions_preserved(self):
        private_path = str(Path(self.tmp.name) / 'private.sqlite')
        previous_umask = os.umask(0)
        try:
            BudgetLedger(private_path)
        finally:
            os.umask(previous_umask)
        self.assertEqual(stat.S_IMODE(os.stat(private_path).st_mode), 0o600)
        os.chmod(private_path, 0o640)  # Fixture only: reopening must not chmod it.
        BudgetLedger(private_path)
        self.assertEqual(stat.S_IMODE(os.stat(private_path).st_mode), 0o640)

    def test_non_durable_symlink_and_foreign_database_refused(self):
        for path in (':memory:', 'file:fixture?mode=memory', '', None, b'fixture'):
            self.denied('durable_path_required', BudgetLedger, path)
        link = Path(self.tmp.name) / 'link.sqlite'
        link.symlink_to(self.path)
        self.denied('durable_path_required', BudgetLedger, link)
        foreign = str(Path(self.tmp.name) / 'foreign.sqlite')
        with sqlite3.connect(foreign) as db:
            db.execute('CREATE TABLE foreign_data(value TEXT)')
        self.denied('foreign_database', BudgetLedger, foreign)
        with sqlite3.connect(foreign) as db:
            tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertEqual(tables, {'foreign_data'})

    def test_shared_mission_register_accepted(self):
        from leo.runtime.memoire import MissionStore
        shared = str(Path(self.tmp.name) / 'shared.sqlite')
        MissionStore(shared)
        ledger = BudgetLedger(shared, clock=lambda: 100)
        ledger.create('shared', self.limits, authority=True)
        self.assertTrue(ledger.reserve('shared', 'op', 'root', 1)['new_reservation'])

    def test_authority_and_immutable_caps(self):
        self.denied('authority_required', self.ledger.create, 'other', self.limits)
        self.denied('authority_required', self.ledger.create, 'other', self.limits, authority=1)
        self.denied('mission_exists', self.ledger.create, 'mission',
                    {**self.limits, 'max_units': 999}, authority=True)
        self.denied('authority_required', self.ledger.stop, 'mission', 'stop')
        self.assertEqual(self.ledger.status('mission')['max_units'], 10)

    def test_unknown_stays_reserved_across_process_restart(self):
        self.assertTrue(self.ledger.reserve('mission', 'first', 'root', 7)['new_reservation'])
        reopened = BudgetLedger(self.path, clock=lambda: 100)
        self.assertEqual(reopened.status('mission')['pending_operations'], ['first'])
        self.assertEqual(reopened.status('mission')['committed_units'], 7)
        self.denied('units_exhausted', reopened.reserve, 'mission', 'retry', 'root', 4)
        receipt = reopened.reserve('mission', 'first', 'root', 7)
        self.assertFalse(receipt['new_reservation'])
        self.assertEqual(reopened.status('mission')['calls'], 1)
        self.denied('operation_conflict', reopened.reserve, 'mission', 'first', 'other', 7)
        self.denied('operation_conflict', reopened.reserve, 'mission', 'first', 'root', 6)

    def test_settlement_is_final_and_idempotent(self):
        self.ledger.reserve('mission', 'op', 'root', 7)
        state = self.ledger.settle('mission', 'op', 2)
        self.assertEqual((state['used_units'], state['reserved_units'], state['available_units']), (2, 0, 8))
        self.assertEqual(self.ledger.settle('mission', 'op', 2), state)
        self.denied('settlement_conflict', self.ledger.settle, 'mission', 'op', 1)
        self.denied('operation_not_found', self.ledger.settle, 'mission', 'unknown', 0)
        self.assertFalse(self.ledger.reserve('mission', 'op', 'root', 7)['new_reservation'])

    def test_overrun_blocks_even_if_global_cap_not_reached(self):
        self.ledger.reserve('mission', 'op', 'root', 1)
        state = self.ledger.settle('mission', 'op', 2)
        self.assertTrue(state['stopped'])
        self.assertEqual(state['committed_units'], 2)
        self.assertEqual(state['reason'], 'usage_exceeded_reservation')
        self.denied('mission_stopped', self.ledger.reserve, 'mission', 'next', 'root', 0)

    def test_overrun_accounts_more_than_cap(self):
        self.ledger.reserve('mission', 'op', 'root', 10)
        state = self.ledger.settle('mission', 'op', 20)
        self.assertEqual(state['used_units'], 20)
        self.assertEqual(state['available_units'], 0)
        self.assertTrue(state['stopped'])

    def test_stop_and_expiry_preserve_pending_and_allow_settlement(self):
        self.ledger.reserve('mission', 'op', 'root', 5)
        self.now = 200
        self.denied('mission_expired', self.ledger.reserve, 'mission', 'next', 'root', 1)
        self.assertFalse(self.ledger.reserve('mission', 'op', 'root', 5)['new_reservation'])
        self.ledger.stop('mission', 'operator_stop', authority=True)
        self.denied('mission_stopped', self.ledger.reserve, 'mission', 'next', 'root', 1)
        state = self.ledger.settle('mission', 'op', 4)
        self.assertEqual(state['used_units'], 4)
        self.assertTrue(state['stopped'])

    def test_zero_budget_no_dispatch_and_validation(self):
        self.ledger.create('zero', {**self.limits, 'max_units': 0}, authority=True)
        for units in (0, 1):
            self.denied('units_exhausted', self.ledger.reserve, 'zero', 'op', 'root', units)
        for units in (-1, True, 1.5, 2**63):
            self.denied('invalid_units_or_limit', self.ledger.reserve, 'mission', 'op', 'root', units)
        self.assertEqual(self.ledger.status('zero')['calls'], 0)
        self.ledger.reserve('mission', 'full', 'root', 10)
        self.denied('units_exhausted', self.ledger.reserve, 'mission', 'zero-cost', 'root', 0)

    def test_each_retry_consumes_call_and_attempt(self):
        for name, key, expected in [('calls', 'max_calls', 'calls_exhausted'),
                                    ('attempts', 'max_attempts', 'attempts_exhausted')]:
            self.ledger.create(name, {**self.limits, key: 1}, authority=True)
            self.ledger.reserve(name, 'first', 'root', 1)
            self.ledger.settle(name, 'first', 0)
            self.denied(expected, self.ledger.reserve, name, 'retry', 'root', 1)
            self.assertEqual(self.ledger.status(name)['attempts'], 1)

    def test_delegates_share_budget_and_cumulative_slots(self):
        self.ledger.create('delegates', {**self.limits, 'max_delegates': 1}, authority=True)
        self.ledger.reserve('delegates', 'one', 'child', 6)
        self.denied('units_exhausted', self.ledger.reserve, 'delegates', 'root-op', 'root', 5)
        self.ledger.settle('delegates', 'one', 1)
        self.denied('delegates_exhausted', self.ledger.reserve, 'delegates', 'two', 'child2', 1)
        self.ledger.reserve('delegates', 'three', 'child', 1)
        self.ledger.reserve('delegates', 'four', 'root', 1)
        self.assertEqual(self.ledger.status('delegates')['delegates'], 1)

    def test_threads_cannot_oversubscribe(self):
        inputs = [(self.path, f'op-{i}', f'actor-{i}') for i in range(16)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(competing_reservation, inputs))
        self.assertEqual(results.count(True), 3)
        self.assertEqual(results.count('units_exhausted'), 13)
        self.assertEqual(self.ledger.status('mission')['committed_units'], 9)

    def test_processes_cannot_oversubscribe(self):
        inputs = [(self.path, f'op-{i}', f'actor-{i}') for i in range(12)]
        context = multiprocessing.get_context('spawn')
        with concurrent.futures.ProcessPoolExecutor(max_workers=4, mp_context=context) as pool:
            results = list(pool.map(competing_reservation, inputs))
        self.assertEqual(results.count(True), 3)
        self.assertEqual(self.ledger.status('mission')['calls'], 3)
        self.assertEqual(self.ledger.status('mission')['committed_units'], 9)

    def test_concurrent_duplicate_only_one_dispatch_receipt(self):
        inputs = [(self.path, 'same-operation', 'root')] * 12
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(competing_reservation, inputs))
        self.assertEqual(results.count(True), 1)
        self.assertEqual(results.count(False), 11)
        self.assertEqual(self.ledger.status('mission')['calls'], 1)


if __name__ == '__main__':
    unittest.main()
