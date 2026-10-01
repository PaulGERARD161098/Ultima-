"""Cas adverses unitaires ; l'Auth réelle est éprouvée par leo-host-auth.py."""
from dataclasses import replace
import hashlib
import io
import json
from pathlib import Path
import sqlite3
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from leo import trial
from leo.trial_host import Binding, GoTrueIdentity, TrialHost, server, loopback_url
from leo.trial_client import call, main, valid_success
from leo.runtime.budget import BudgetLedger, BudgetError
from leo.runtime.policy import Context, Mandate, Refusal


class HostTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'trial'
        prepared = trial.prepare(self.root, dict(source='a' * 40, target='b' * 40, integration='c' * 40))
        self.context = Context(**prepared['fixture_context'])
        expires = json.loads((self.root / 'manifest.json').read_text())['mandate_expires_at']
        mandate = Mandate(trial.MISSION, trial.OWNER, 1, frozenset({trial.ACTOR, 'inspector'}),
            frozenset({self.context.repository}), frozenset({'status', 'merge_fixture', 'read_source'}),
            quadrants=frozenset({'code'}), expires_at=expires)
        self.binding = Binding(self.root, trial.ACTOR, mandate, self.context, ())
        self.identity = GoTrueIdentity('http://127.0.0.1:9999', 'fiction')
        self.host = TrialHost(self.identity, {'owner': self.binding})
        self.digest = hashlib.sha256((self.root / 'canonical.sqlite').read_bytes()).hexdigest()

    def tearDown(self):
        self.assertEqual(self.digest, hashlib.sha256((self.root / 'canonical.sqlite').read_bytes()).hexdigest())
        self.temp.cleanup()

    def test_proposal_cannot_supply_authority_or_target(self):
        with patch.object(self.identity, 'authenticate', return_value='owner'):
            for proposal in ({'command': 'execute', 'approval': True}, {'command': 'status', 'root': '/tmp'},
                             {'command': 'shell'}, {'command': ['status']}, {}, []):
                with self.subTest(proposal=proposal), self.assertRaisesRegex(Refusal, 'invalid_command'):
                    self.host.call('Bearer fixture', proposal)
            with self.assertRaisesRegex(Refusal, 'approval_missing_or_stale'):
                self.host.call('Bearer fixture', {'command': 'execute'})

    def test_identity_scope_and_canonical_acl_before_output(self):
        with patch.object(self.identity, 'authenticate', return_value='other'), patch('leo.trial.inspect') as inspect:
            with self.assertRaisesRegex(Refusal, 'access_denied'):
                self.host.call('Bearer fixture', {'command': 'status'})
            inspect.assert_not_called()
        host = TrialHost(self.identity, {'owner': replace(self.binding, principal='inspector')})
        with patch.object(self.identity, 'authenticate', return_value='owner'), patch('leo.trial.inspect') as inspect:
            with self.assertRaisesRegex(Refusal, 'access_denied'):
                host.call('Bearer fixture', {'command': 'status'})
            inspect.assert_not_called()

    def test_auth_failure_never_opens_canonical_state(self):
        with patch.object(self.identity, 'authenticate', side_effect=Refusal('authentication_required')):
            with patch('leo.trial_resume._canonical') as canonical:
                with self.assertRaisesRegex(Refusal, 'authentication_required'):
                    self.host.call('Bearer fixture', {'command': 'execute'})
                canonical.assert_not_called()

    def test_stop_denials_leave_database_bytes_unchanged(self):
        for principal, subject, expected in [('inspector', 'owner', 'access_denied'),
                                             (trial.ACTOR, 'other', 'access_denied')]:
            host = TrialHost(self.identity, {'owner': replace(self.binding, principal=principal)})
            with patch.object(self.identity, 'authenticate', return_value=subject), \
                    patch('leo.trial_host.BudgetLedger') as writable:
                with self.assertRaisesRegex(Refusal, expected):
                    host.call('Bearer fixture', {'command': 'stop'})
                writable.assert_not_called()
        host = TrialHost(self.identity, {'owner': replace(self.binding,
            context=replace(self.context, integration='d' * 40))})
        with patch.object(self.identity, 'authenticate', return_value='owner'), \
                patch('leo.trial_host.BudgetLedger') as writable:
            with self.assertRaisesRegex(Refusal, 'trial_authority_mismatch'):
                host.call('Bearer fixture', {'command': 'stop'})
            writable.assert_not_called()
        with patch.object(self.identity, 'authenticate', side_effect=Refusal('authentication_required')), \
                patch('leo.trial_resume._canonical') as canonical:
            with self.assertRaisesRegex(Refusal, 'authentication_required'):
                self.host.call('Bearer fixture', {'command': 'stop'})
            canonical.assert_not_called()

    def test_stop_persists_preserves_reservations_and_is_idempotent_after_expiry(self):
        path = self.root / 'canonical.sqlite'
        ledger = BudgetLedger(path)
        ledger.reserve(trial.MISSION, 'r21-merge-1', trial.ACTOR, 2)
        def preserved():
            with sqlite3.connect(path) as db:
                return tuple(db.execute('SELECT * FROM ' + table).fetchall()
                             for table in ('missions', 'operations', 'budget_operations'))
        before = preserved()
        host = TrialHost(self.identity, {'owner': self.binding},
                         clock=lambda: self.binding.mandate.expires_at + 1)
        expected = {'mission_id': trial.MISSION, 'stopped': True,
            'pending_operations': ['r21-merge-1'], 'reserved_units': 2,
            'environment': 'fixture', 'publication': False, 'global_v1_accepted': False}
        with patch.object(self.identity, 'authenticate', return_value='owner'):
            self.assertEqual(host.call('Bearer fixture', {'command': 'stop'}), expected)
            fresh = TrialHost(self.identity, {'owner': self.binding}, clock=host.clock)
            self.assertEqual(fresh.call('Bearer fixture', {'command': 'stop'}), expected)
        self.assertEqual(preserved(), before)
        with sqlite3.connect(path) as db:
            self.assertEqual(db.execute('SELECT stopped,reason FROM budget_missions').fetchone(),
                             (1, 'authenticated_stop'))
        with self.assertRaisesRegex(BudgetError, 'mission_stopped'):
            ledger.reserve(trial.MISSION, 'never-dispatched', trial.ACTOR, 0)
        self.digest = hashlib.sha256(path.read_bytes()).hexdigest()

    def test_stop_revalidates_canonical_authority_under_write_lock(self):
        path = self.root / 'canonical.sqlite'
        def changed_before_lock(*args, **kwargs):
            ledger = BudgetLedger(*args, **kwargs)
            with sqlite3.connect(path) as db:
                db.execute("UPDATE missions SET writers='[]'")
            return ledger
        with patch.object(self.identity, 'authenticate', return_value='owner'), \
                patch('leo.trial_host.BudgetLedger', side_effect=changed_before_lock):
            with self.assertRaisesRegex(Refusal, 'trial_authority_mismatch'):
                self.host.call('Bearer fixture', {'command': 'stop'})
        with sqlite3.connect(path) as db:
            self.assertEqual(db.execute('SELECT stopped,reason FROM budget_missions').fetchone(), (0, None))
        self.digest = hashlib.sha256(path.read_bytes()).hexdigest()

    def test_client_stop_rejects_false_success_and_cli_only_accepts_closed_shape(self):
        good = {'mission_id': trial.MISSION, 'stopped': True, 'pending_operations': [],
                'reserved_units': 0, 'environment': 'fixture', 'publication': False,
                'global_v1_accepted': False}
        self.assertTrue(valid_success('stop', good))
        bad = [{}, {**good, 'stopped': 1}, {**good, 'reserved_units': True},
               {**good, 'pending_operations': ['same', 'same']},
               {**good, 'pending_operations': [{}]}, {**good, 'publication': True},
               {**good, 'mission_id': 'foreign'}, {**good, 'extra': True}]
        for value in bad:
            with self.subTest(value=value):
                self.assertFalse(valid_success('stop', value))
                response = io.BytesIO(json.dumps(value).encode())
                response.status = 200
                with patch('leo.trial_client.build_opener') as opener:
                    opener.return_value.open.return_value = response
                    self.assertEqual(call('http://127.0.0.1:9998', 'stop', 'fixture')[0], 503)
                    self.assertEqual(opener.return_value.open.call_count, 1)
        for value, exit_code in [(good, 0), ({**good, 'stopped': False}, 1)]:
            with patch('sys.argv', ['client', 'stop', '--host', 'http://127.0.0.1:9998']), \
                    patch('sys.stdin', io.StringIO('fixture\n')), patch('sys.stdout', io.StringIO()), \
                    patch('leo.trial_client.call', return_value=(200, value)):
                self.assertEqual(main(), exit_code)

    def test_endpoint_fixed_and_no_secret_in_error(self):
        for url in ('https://example.com', 'http://localhost:9999', 'http://127.0.0.1:9999@other:80',
                    'http://127.0.0.1:9999/?url=other', 'http://127.0.0.1:9999/secret'):
            with self.subTest(url=url), self.assertRaises(ValueError):
                loopback_url(url)
        with self.assertRaisesRegex(Refusal, '^authentication_required$'):
            self.identity.authenticate('Bearer secret\r\nOther: value')

    def test_bad_or_oversized_response_means_unknown_without_retry(self):
        for body in (b'not json', b'x' * 65537, b'[]', b'{}', b'{"error":"false-success"}',
                     b'{"mission_id":"r21-two-items","operation_id":"r21-merge-1","status":[]}',
                     b'{"mission_id":"r21-two-items","operation_id":"r21-merge-1","status":"completed","result":{}}'):
            response = io.BytesIO(body)
            response.status = 200
            with patch('leo.trial_client.build_opener') as opener:
                opener.return_value.open.return_value = response
                self.assertEqual(call('http://127.0.0.1:9998', 'execute', 'fixture'),
                                 (503, {'error': 'result_unknown_reconcile_required'}))
                self.assertEqual(opener.return_value.open.call_count, 1)

    def test_http_rejects_duplicate_keys_excess_body_and_browser_origin(self):
        http = server(self.host)
        worker = threading.Thread(target=http.serve_forever, daemon=True)
        worker.start()
        try:
            with patch.object(self.identity, 'authenticate') as authenticate:
                for data, extra in [(b'{"command":"status","command":"execute"}', {}),
                                    (b'x' * 257, {}), (b'{"command":"status"}', {'Origin': 'https://other.invalid'})]:
                    request = Request('http://127.0.0.1:' + str(http.server_port) + '/r21', data=data,
                        headers={'Content-Type': 'application/json', 'Authorization': 'Bearer fixture', **extra})
                    with self.assertRaises(HTTPError) as raised:
                        urlopen(request, timeout=3)
                    self.assertEqual(raised.exception.code, 400)
                authenticate.assert_not_called()
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)
