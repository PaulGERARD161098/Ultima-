"""Raccord réellement composé sur fixture ; accords et identité simulés."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

from dataclasses import replace
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from leo import trial
from leo.control_r21.admission import AdmissionHost, RequestJournal
from leo.trial_host import Binding, GoTrueIdentity, TrialHost, server
from leo.runtime.budget import BudgetLedger
from leo.runtime.policy import Approval, Context, Evidence, Mandate, Refusal
from finubar.leo_control import ControlLatch


class ControlR21AdmissionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / 'trial'
        prepared = trial.prepare(self.root, dict(source='a'*40, target='b'*40, integration='c'*40))
        self.context = Context(**prepared['fixture_context'])
        expires = json.loads((self.root / 'manifest.json').read_text())['mandate_expires_at']
        self.mandate = Mandate(trial.MISSION, trial.OWNER, 1,
            frozenset({trial.ACTOR, 'inspector'}), frozenset({self.context.repository}),
            frozenset({'status', 'merge_fixture', 'read_source'}),
            quadrants=frozenset({'code'}), expires_at=expires)
        proofs = tuple(Evidence(self.context, name, True, 'fixture-proof', 'fiction-date', 'fixture')
                       for name in ('tests', 'review'))
        self.binding = Binding(self.root, trial.ACTOR, self.mandate, self.context, proofs,
                               Approval(self.context, trial.OWNER, 1, expires))
        self.identity = GoTrueIdentity('http://127.0.0.1:9999', 'fiction')
        self.latch = ControlLatch(Path(self.tmp.name) / 'agent-control.sqlite', initialize=True)
        self.raw_host = TrialHost(self.identity, {'owner': self.binding}, control_latch=self.latch)
        self.journal_path = Path(self.tmp.name) / 'requests.sqlite'
        self.host = AdmissionHost(self.raw_host, RequestJournal(self.journal_path, initialize=True))

    def tearDown(self):
        self.tmp.cleanup()

    def body(self, **changes):
        return json.dumps(dict(protocol_version=1, request_id='request-1', mission_id=trial.MISSION,
            operation_id='r21-merge-1', command='status', expected_version=2) | changes).encode()

    def call(self, **changes):
        with patch.object(self.identity, 'authenticate', return_value='owner'):
            return self.host.call('Bearer fiction', self.body(**changes))

    def test_all_identifiers_and_version_are_checked_before_effect(self):
        for changes, reason in [({'mission_id':'foreign'}, 'request_context_mismatch'),
                ({'operation_id':'foreign'}, 'request_context_mismatch'),
                ({'expected_version':1}, 'mission_version_conflict')]:
            with self.subTest(changes=changes), self.assertRaisesRegex(Refusal, reason):
                self.call(command='execute', **changes)
        self.assertEqual(trial.inspect(self.root)['target_observed'], self.context.target)

    def test_response_lost_new_host_recovers_same_receipt_without_second_effect(self):
        result = self.call(command='execute')
        self.assertEqual(result['state'], 'completed')
        self.assertFalse(result['replayed'])
        self.host = AdmissionHost(TrialHost(self.identity, {'owner':self.binding}, control_latch=self.latch), RequestJournal(self.journal_path))
        replay = self.call(command='execute')
        self.assertTrue(replay['replayed'])
        self.assertEqual(replay['result'], result['result'])
        self.assertEqual(trial.inspect(self.root)['target_observed'], self.context.integration)
        self.assertEqual(BudgetLedger(self.root/'canonical.sqlite').status(trial.MISSION)['calls'], 3)
        with self.assertRaisesRegex(Refusal, 'request_conflict'):
            self.call(command='stop')

    def test_cut_after_effect_before_journal_commit_requires_reconciliation(self):
        with patch.object(self.host.journal, 'complete', side_effect=RuntimeError('fixture-cut')):
            with self.assertRaisesRegex(RuntimeError, 'fixture-cut'):
                self.call(command='execute')
        self.host = AdmissionHost(TrialHost(self.identity, {'owner':self.binding}, control_latch=self.latch), RequestJournal(self.journal_path))
        replay = self.call(command='execute')
        self.assertEqual(replay['state'], 'unknown')
        self.assertIsNone(replay['result'])
        receipt = self.call(command='reconcile', request_id='reconcile-1', expected_version=3)
        self.assertEqual(receipt['result']['status'], 'completed')
        self.assertEqual(BudgetLedger(self.root/'canonical.sqlite').status(trial.MISSION)['calls'], 3)

    def test_stop_blocks_next_admission_and_status_remains_readable(self):
        self.assertTrue(self.call(command='stop')['result']['stopped'])
        with self.assertRaises(Exception):
            self.call(command='execute', request_id='execute-after-stop')
        status = self.call(request_id='status-after-stop')
        self.assertTrue(status['result']['budget']['stopped'])
        self.assertEqual(trial.inspect(self.root)['target_observed'], self.context.target)

    def test_wrong_identity_cannot_read_replay_or_write_journal(self):
        self.call()
        before = self.journal_path.read_bytes()
        with patch.object(self.identity, 'authenticate', return_value='foreign'):
            with self.assertRaisesRegex(Refusal, 'access_denied'):
                self.host.call('Bearer fiction', self.body())
        self.assertEqual(self.journal_path.read_bytes(), before)

    def test_finubar_control_target_stops_through_host_before_effect(self):
        raw = TrialHost(self.identity, {'owner':self.binding}, protected_control_paths=(self.root/'fixture.git',), control_latch=self.latch)
        self.host = AdmissionHost(raw, RequestJournal(self.journal_path))
        with self.assertRaisesRegex(Refusal, 'leo_control_write_attempt'):
            self.call(command='execute')
        self.assertTrue(self.call(request_id='status-after-trip')['result']['budget']['stopped'])
        self.assertEqual(trial.inspect(self.root)['target_observed'], self.context.target)
        self.assertEqual(BudgetLedger(self.root/'canonical.sqlite').status(trial.MISSION)['calls'], 2)

    def test_journal_concurrent_reservations_are_single_admission(self):
        data = json.loads(self.body())
        results, errors = [], []
        def reserve():
            try:
                results.append(RequestJournal(self.journal_path).reserve('owner', data)[0])
            except Exception as error:
                errors.append(error)
        workers = [threading.Thread(target=reserve) for _ in range(2)]
        for worker in workers: worker.start()
        for worker in workers: worker.join(timeout=10)
        self.assertTrue(all(not worker.is_alive() for worker in workers))
        self.assertEqual(errors, [])
        self.assertEqual(sorted(results), [False, True])

    def test_http_uses_closed_protocol_without_legacy_or_duplicate_key_fallback(self):
        http = server(self.host)
        worker = threading.Thread(target=http.serve_forever, daemon=True)
        worker.start()
        try:
            with patch.object(self.identity, 'authenticate', return_value='owner'):
                url = 'http://127.0.0.1:' + str(http.server_port) + '/r21'
                headers = {'Content-Type':'application/json', 'Authorization':'Bearer fiction'}
                with urlopen(Request(url, data=self.body(), headers=headers), timeout=3) as response:
                    self.assertEqual(json.load(response)['state'], 'completed')
                from leo.control_r21.client import call
                status, value = call('http://127.0.0.1:'+str(http.server_port), json.loads(self.body()), 'fiction')
                self.assertEqual(status, 200)
                self.assertTrue(value['replayed'])
                for data in (b'{"command":"status"}', self.body()[:-1]+b',"command":"execute"}'):
                    with self.assertRaises(HTTPError) as raised:
                        urlopen(Request(url, data=data, headers=headers), timeout=3)
                    self.assertEqual(raised.exception.code, 400)
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)

    def test_client_rejects_false_receipt_without_retry(self):
        import io
        from leo.control_r21.client import call
        for changes in ({'request_id':'foreign'}, {'agent_stopped':1}, {'result':{}}, {'publication':True}):
            value = self.call() | changes
            response = io.BytesIO(json.dumps(value).encode())
            response.status = 200
            with patch('leo.control_r21.client.build_opener') as opener:
                opener.return_value.open.return_value = response
                self.assertEqual(call('http://127.0.0.1:9998', json.loads(self.body()), 'fiction')[0], 503)
                self.assertEqual(opener.return_value.open.call_count, 1)

    def test_missing_journal_never_erases_replay_history_by_implicit_creation(self):
        self.call()
        self.journal_path.unlink()
        with self.assertRaisesRegex(Refusal, 'journal_unavailable'):
            RequestJournal(self.journal_path)
        self.assertFalse(self.journal_path.exists())

    def test_new_admission_host_requires_global_control(self):
        host = TrialHost(self.identity, {'owner': self.binding})
        with self.assertRaisesRegex(TypeError, 'global_control_latch_required'):
            AdmissionHost(host, RequestJournal(self.journal_path))
