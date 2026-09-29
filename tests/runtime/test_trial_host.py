"""Cas adverses unitaires ; l'Auth réelle est éprouvée par leo-host-auth.py."""
from dataclasses import replace
import hashlib
import io
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from leo import trial
from leo.trial_host import Binding, GoTrueIdentity, TrialHost, server, loopback_url
from leo.trial_client import call
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
