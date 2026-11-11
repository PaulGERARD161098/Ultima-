"""State-machine and transport-fault proofs; CI isolation only, no GitHub I/O.

These tests do not claim a real Docker kill or an installed private controller.
The Store models atomic Git compare/update and faults before/after persistence.
"""
import os

if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

from copy import deepcopy
from dataclasses import replace
import hashlib
import json
import threading
import unittest
from unittest.mock import patch

from leo.control_r21 import pilot_state as p


INSTALL = {'id': 'pilot-1', 'seed': 'a' * 64, 'source_sha': 'b' * 40,
           'code_digest': 'c' * 64, 'image_digest': 'python@sha256:' + 'd' * 64,
           'actor_id': 277032273}
PACKAGE = {'blob_sha': 'e' * 40, 'sha256': 'f' * 64,
           'context_digest': '1' * 64, 'expires_at': 2000.5}
RESULT_PACKAGE = {**PACKAGE, 'blob_sha': '2' * 40, 'sha256': '3' * 64}


class MemoryStore:
    def __init__(self):
        self.lock = threading.Lock()
        self.state = p.new_state(INSTALL)
        self.sha = self._hash(self.state)
        self.history = [(self.sha, deepcopy(self.state))]
        self.before_cas = None
        self.fail_before = 0
        self.fail_after = 0
        self.cas_calls = 0

    @staticmethod
    def _hash(state):
        return hashlib.sha256(p.encode_state(state, INSTALL)).hexdigest()[:40]

    def read(self):
        with self.lock:
            return self.sha, deepcopy(self.state)

    def cas(self, expected, state):
        self.cas_calls += 1
        hook = self.before_cas
        if hook:
            hook(expected, state)
        with self.lock:
            if self.fail_before:
                self.fail_before -= 1
                raise p.AmbiguousWrite()
            if expected != self.sha:
                raise p.CasConflict()
            p.validate_transition(expected, self.state, state)
            self.state = deepcopy(state)
            self.sha = self._hash(state)
            self.history.append((self.sha, deepcopy(state)))
            if self.fail_after:
                self.fail_after -= 1
                raise p.AmbiguousWrite()
            return self.sha


class PilotStateTests(unittest.TestCase):
    def setUp(self):
        self.store = MemoryStore()
        self.coordinator = p.Coordinator(self.store, INSTALL)

    def refused(self, code, function, *args, **kwargs):
        with self.assertRaises(p.PilotError) as caught:
            function(*args, **kwargs)
        self.assertEqual(caught.exception.code, code)

    def prepare(self):
        first = self.coordinator.prepare('prepare-1', '101', '4' * 64)
        self.assertTrue(first.launch)
        return self.coordinator.finish(first.reservation, {'prepared': True}, PACKAGE)

    def execute(self):
        return self.coordinator.execute('execute-1', '102', '5' * 64,
                                        PACKAGE['context_digest'], 1000)

    def test_seed_is_explicit_and_read_returns_no_launch(self):
        result = self.coordinator.status()
        self.assertEqual(result.state['phase'], 'empty')
        self.assertFalse(result.launch)
        self.assertEqual(self.store.cas_calls, 0)
        self.assertFalse(hasattr(self.coordinator, 'reset'))
        self.assertFalse(hasattr(self.coordinator, 'resume'))

    def test_missing_state_never_initializes(self):
        class Missing:
            def read(self):
                raise FileNotFoundError('private path must not be echoed')
            def cas(self, *_):
                raise AssertionError('must not initialize')
        with patch.object(p, 'new_state', side_effect=AssertionError('must not seed')):
            self.refused('state_unavailable', p.Coordinator(Missing(), INSTALL).status)

    def test_canonical_roundtrip_and_isolation_of_returned_copies(self):
        result = self.coordinator.status()
        raw = p.encode_state(result.state, INSTALL)
        self.assertEqual(p.decode_state(raw, INSTALL), result.state)
        result.state['installation']['actor_id'] = 1
        self.assertEqual(self.coordinator.status().state['installation']['actor_id'], 277032273)

    def test_closed_schema_and_duplicate_json_keys(self):
        state = self.coordinator.status().state
        self.refused('invalid_pilot_state', p.validate_state, {**state, 'approved': True}, INSTALL)
        raw = p.encode_state(state, INSTALL)
        self.refused('duplicate_json_key', p.decode_state,
                     raw[:-1] + b',"schema_version":1}', INSTALL)
        self.refused('invalid_json', p.decode_state, b'{"x":NaN}', INSTALL)
        self.refused('invalid_json', p.decode_state, b'\xff', INSTALL)
        self.refused('state_size', p.decode_state, b' ' * (p.MAX_BYTES + 1), INSTALL)

    def test_installation_is_pinned_outside_state(self):
        state = self.coordinator.status().state
        for key, other in [('id', 'foreign'), ('seed', '0' * 64),
                           ('source_sha', '0' * 40), ('code_digest', '0' * 64),
                           ('image_digest', 'python@sha256:' + '0' * 64), ('actor_id', 1)]:
            changed = deepcopy(state)
            changed['installation'][key] = other
            self.refused('installation_mismatch', p.validate_state, changed, INSTALL)

    def test_installation_and_package_scalars_are_strict(self):
        for changes in ({'actor_id': True}, {'actor_id': '277032273'},
                        {'seed': 'a' * 32}, {'image_digest': 'python:latest'}):
            self.refused('invalid_installation', p.new_state, {**INSTALL, **changes})
        first = self.coordinator.prepare('p', '101', '4' * 64)
        for expiry in (True, float('nan'), float('inf'), -1, '2000'):
            self.refused('invalid_package_metadata', self.coordinator.finish,
                         first.reservation, {'ok': True}, {**PACKAGE, 'expires_at': expiry})
        self.coordinator.finish(first.reservation, {'ok': True}, PACKAGE)

    def test_prepare_execute_complete_receipt_replay_in_new_coordinator(self):
        self.prepare()
        begin = self.execute()
        self.assertTrue(begin.launch)
        self.assertEqual(begin.state['operations']['execute']['status'], 'running')
        final = self.coordinator.finish(begin.reservation, {'commit': '6' * 40}, RESULT_PACKAGE)
        self.assertEqual(final.state['phase'], 'completed')
        fresh = p.Coordinator(self.store, INSTALL)
        observed = fresh.execute('different-request', '900', '7' * 64,
                                 PACKAGE['context_digest'], 3000)  # expired receipt still readable
        self.assertFalse(observed.launch)
        self.assertTrue(observed.replayed)
        self.assertEqual(observed.receipt, final.receipt)
        self.assertEqual(len(self.store.history), 5)

    def test_same_request_different_digest_conflicts_without_mutation(self):
        self.prepare()
        self.execute()
        before = self.store.read()
        self.refused('request_conflict', self.coordinator.execute,
                     'execute-1', '999', '8' * 64, PACKAGE['context_digest'], 1000)
        self.assertEqual(self.store.read(), before)

    def test_repeated_running_request_does_not_start_again(self):
        self.prepare()
        first = self.execute()
        repeated = self.execute()
        self.assertTrue(first.launch)
        self.assertFalse(repeated.launch)
        self.assertIsNone(repeated.receipt)
        self.assertEqual(repeated.reservation, first.reservation)

    def test_new_request_cannot_duplicate_pending_operation(self):
        self.prepare()
        self.execute()
        self.refused('operation_already_reserved', self.coordinator.execute,
                     'execute-2', '103', '8' * 64, PACKAGE['context_digest'], 1000)

    def test_bad_approval_expiry_or_clock_refuses_before_reservation(self):
        self.prepare()
        before = self.store.read()
        self.refused('approval_digest_mismatch', self.coordinator.execute,
                     'e', '102', '5' * 64, '0' * 64, 1000)
        self.refused('approval_expired', self.coordinator.execute,
                     'e', '102', '5' * 64, PACKAGE['context_digest'], 2000.5)
        for clock in (True, float('nan'), float('inf'), '1000'):
            self.refused('invalid_clock', self.coordinator.execute,
                         'e', '102', '5' * 64, PACKAGE['context_digest'], clock)
        self.assertEqual(self.store.read(), before)

    def test_stop_before_start_is_durable_and_has_no_reset(self):
        self.coordinator.stop()
        fresh = p.Coordinator(self.store, INSTALL)
        self.refused('pilot_stopped', fresh.prepare, 'p', '101', '4' * 64)
        before = self.store.read()
        again = fresh.stop('worker_timeout')
        self.assertTrue(again.replayed)
        self.assertEqual(again.state['stop_reason'], 'owner_stop')
        self.assertEqual(self.store.read(), before)

    def test_stop_during_reservation_prevents_worker_launch(self):
        self.prepare()
        def stop_first(_sha, _state):
            self.store.before_cas = None
            p.Coordinator(self.store, INSTALL).stop()
        self.store.before_cas = stop_first
        self.refused('pilot_stopped', self.execute)
        state = self.coordinator.status().state
        self.assertTrue(state['stopped'])
        self.assertIsNone(state['operations']['execute'])

    def test_stop_between_reservation_write_and_return_prevents_launch(self):
        self.prepare()
        original = self.store.cas
        fired = False
        def cas(expected, state):
            nonlocal fired
            sha = original(expected, state)
            if not fired:
                fired = True
                self.coordinator.stop()
            return sha
        with patch.object(self.store, 'cas', side_effect=cas):
            result = self.execute()
        self.assertFalse(result.launch)
        self.assertTrue(result.state['stopped'])

    def test_stop_wins_completion_race_and_survives_returned_receipt(self):
        self.prepare()
        begin = self.execute()
        def stop_first(_sha, _state):
            self.store.before_cas = None
            p.Coordinator(self.store, INSTALL).stop()
        self.store.before_cas = stop_first
        final = self.coordinator.finish(begin.reservation, {'commit': '6' * 40}, RESULT_PACKAGE)
        self.assertTrue(final.state['stopped'])
        self.assertEqual(final.state['phase'], 'completed')
        self.assertTrue(p.Coordinator(self.store, INSTALL).status().state['stopped'])
        self.assertEqual(final.state['package'], RESULT_PACKAGE)

    def test_completion_wins_then_stop_keeps_receipt(self):
        self.prepare()
        begin = self.execute()
        final = self.coordinator.finish(begin.reservation, {'commit': '6' * 40}, RESULT_PACKAGE)
        self.coordinator.stop()
        state = self.coordinator.status().state
        self.assertTrue(state['stopped'])
        self.assertEqual(state['operations']['execute']['receipt'], final.receipt)

    def test_lost_reservation_response_is_resolved_by_own_unique_lease(self):
        self.prepare()
        self.store.fail_after = 1
        begin = self.execute()
        self.assertTrue(begin.launch)
        self.assertFalse(self.execute().launch)
        self.assertEqual(len(self.store.history), 4)

    def test_ambiguous_reservation_without_persistence_never_launches(self):
        self.prepare()
        before = self.store.read()
        self.store.fail_before = 1
        self.refused('write_outcome_unknown', self.execute)
        self.assertEqual(self.store.read(), before)

    def test_lost_completion_response_finds_durable_receipt_without_second_effect(self):
        self.prepare()
        begin = self.execute()
        self.store.fail_after = 1
        final = self.coordinator.finish(begin.reservation, {'commit': '6' * 40}, RESULT_PACKAGE)
        fresh = p.Coordinator(self.store, INSTALL)
        again = fresh.execute('execute-again', '999', '7' * 64, PACKAGE['context_digest'], 1000)
        self.assertFalse(again.launch)
        self.assertEqual(again.receipt, final.receipt)
        self.assertEqual(len(self.store.history), 5)

    def test_lost_checkpoint_before_persistence_remains_unknown_no_reexecute(self):
        self.prepare()
        begin = self.execute()
        # The runner could have produced its effect but lost its workspace here.
        self.coordinator.unknown(begin.reservation)
        fresh = p.Coordinator(self.store, INSTALL)
        self.assertEqual(fresh.status().state['phase'], 'unknown')
        self.refused('operation_unknown_reconcile_required', fresh.execute,
                     'new-request', '999', '7' * 64, PACKAGE['context_digest'], 1000)
        self.assertIsNone(fresh.status().receipt)

    def test_unknown_can_only_attach_original_reservations_verified_result(self):
        self.prepare()
        begin = self.execute()
        self.coordinator.unknown(begin.reservation)
        forged = replace(begin.reservation, lease_id='0' * 32)
        self.refused('reservation_mismatch', self.coordinator.finish, forged, {'ok': True})
        final = self.coordinator.finish(begin.reservation, {'commit': '6' * 40}, RESULT_PACKAGE)
        self.assertEqual(final.state['phase'], 'completed')
        self.assertFalse(final.launch)

    def test_immutable_receipt_and_consent_survive_checkpoint_replacement(self):
        self.prepare()
        begin = self.execute()
        self.refused('approval_context_changed', self.coordinator.finish,
                     begin.reservation, {'ok': True}, {**RESULT_PACKAGE, 'context_digest': '0' * 64})
        self.coordinator.finish(begin.reservation, {'ok': True}, RESULT_PACKAGE)
        self.refused('receipt_conflict', self.coordinator.finish, begin.reservation, {'ok': False})
        self.refused('completed_result_cannot_be_lost', self.coordinator.unknown, begin.reservation)

    def test_receipts_are_bounded_and_data_only(self):
        first = self.coordinator.prepare('p', '101', '4' * 64)
        for receipt, code in (({'x': object()}, 'invalid_receipt'),
                              ({'x': float('nan')}, 'invalid_receipt'),
                              ({'x': 'a' * p.MAX_RECEIPT_BYTES}, 'receipt_too_large')):
            self.refused(code, self.coordinator.finish, first.reservation, receipt, PACKAGE)

    def test_two_simultaneous_equivalent_requests_have_one_launch(self):
        self.prepare()
        barrier = threading.Barrier(2)
        self.store.before_cas = lambda *_: barrier.wait(timeout=5)
        decisions, failures = [], []
        def reserve():
            try:
                decisions.append(p.Coordinator(self.store, INSTALL).execute(
                    'execute-1', '102', '5' * 64, PACKAGE['context_digest'], 1000))
            except Exception as error:
                failures.append(error)
        threads = [threading.Thread(target=reserve) for _ in range(2)]
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join(timeout=6)
        self.assertTrue(all(not thread.is_alive() for thread in threads))
        self.assertEqual(failures, [])
        self.assertEqual(len(decisions), 2)
        self.assertEqual(sum(decision.launch for decision in decisions), 1)
        self.assertEqual(len(self.store.history), 4)

    def test_real_parent_and_monotone_chain_are_required(self):
        self.prepare()
        previous_sha, previous = self.store.history[-2]
        _, current = self.store.history[-1]
        p.validate_transition(previous_sha, previous, current)
        self.refused('state_chain_mismatch', p.validate_transition, '0' * 40, previous, current)
        forged = deepcopy(current)
        forged['sequence'] += 1
        self.refused('state_chain_mismatch', p.validate_transition, previous_sha, previous, forged)

    def test_old_snapshot_copied_into_new_commit_cannot_clear_stop(self):
        self.prepare()
        self.coordinator.stop()
        sha, stopped = self.store.read()
        revived = deepcopy(stopped)
        revived.update(sequence=stopped['sequence'] + 1, previous_sha=sha,
                       mutation_id='0' * 32, stopped=False, stop_reason=None)
        self.refused('stop_rollback_denied', p.validate_transition, sha, stopped, revived)

    def test_operation_or_receipt_rollback_is_rejected(self):
        self.prepare()
        prepared = deepcopy(self.store.state)
        begin = self.execute()
        self.coordinator.finish(begin.reservation, {'ok': True}, RESULT_PACKAGE)
        sha, complete = self.store.read()
        forged = deepcopy(prepared)
        forged.update(sequence=complete['sequence'] + 1, previous_sha=sha,
                      mutation_id='0' * 32)
        self.refused('operation_rollback_denied', p.validate_transition, sha, complete, forged)

    def test_known_stop_guard_mutant_is_caught_then_nominal_restored(self):
        self.prepare()
        self.coordinator.stop()
        state = self.coordinator.status().state
        def witness():
            self.refused('pilot_stopped', p.reserve_state, state, 'execute',
                         'execute-1', '102', '5' * 64, '0' * 32,
                         approval_digest=PACKAGE['context_digest'], now=1000)
        witness()
        real = p.reserve_state
        def mutant(state, *args, **kwargs):
            state = deepcopy(state)
            state.update(stopped=False, stop_reason=None)
            return real(state, *args, **kwargs)
        # The pure transition's stop guard is deliberately disabled in memory;
        # the witness must actually fail, not just run without an effect.
        with patch.object(p, 'reserve_state', side_effect=mutant):
            with self.assertRaises(AssertionError):
                witness()
        witness()


if __name__ == '__main__':
    unittest.main()
