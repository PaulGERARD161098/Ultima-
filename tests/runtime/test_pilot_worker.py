"""Fixture authority simulation only; CI's no-network container is mandatory."""
import copy
import hashlib
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

from leo import trial
from leo.control_r21 import pilot_worker as worker
from leo.control_r21.pilot_host import consent_for
from leo.runtime.fixture_git import FixtureGit
from leo.runtime.policy import Refusal


class PilotWorkerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'trial'
        self.provenance = {'source': 'a' * 40, 'target': 'b' * 40, 'integration': 'c' * 40}
        self.prepared = worker.run('prepare', {'provenance': self.provenance}, self.root)
        self.package = self.prepared['package']
        self.config = {'installation': {'source_sha': 'a' * 40},
                      'review': {'location': 'fixture://independent-test-review',
                                 'measured_at': '2000-01-01', 'code_digest': 'b' * 64}}
        self.consent = consent_for(self.package, self.config)
        self.payload = {'provenance': self.provenance, 'package': self.package,
                        'consent': self.consent, 'approval_digest': worker.digest(self.consent),
                        'review_location': self.config['review']['location'],
                        'review_measured_at': self.config['review']['measured_at']}
        shutil.rmtree(self.root)

    def tearDown(self):
        self.temp.cleanup()

    def test_fixed_worker_prepare_restore_execute_receipt_and_no_false_full_acceptance(self):
        result = worker.run('execute', self.payload, self.root)
        self.assertEqual(result['receipt']['status'], 'completed')
        self.assertEqual(result['receipt']['result']['commit'], self.package['context']['integration'])
        self.assertEqual(trial.inspect(self.root)['state'], 'merged')
        self.assertFalse(trial.inspect(self.root)['global_v1_accepted'])
        self.assertEqual(result['package']['expires_at'], self.package['expires_at'])
        # The original synthetic inspection still does not claim review authority.
        self.assertEqual(json.loads((self.root / 'proofs.json').read_text())['review'], 'pending')

    def test_wrong_exact_approval_refuses_before_unpack_or_effect(self):
        self.payload['approval_digest'] = '0' * 64
        with patch.object(FixtureGit, 'merge', side_effect=AssertionError('effect forbidden')):
            with self.assertRaisesRegex(Refusal, 'host_consent_mismatch'):
                worker.run('execute', self.payload, self.root)
        self.assertFalse(self.root.exists())

    def test_review_absent_or_tampered_package_refuses(self):
        for change in ('review', 'package'):
            payload = copy.deepcopy(self.payload)
            if change == 'review':
                payload['review_location'] = ''
            else:
                payload['package']['context']['target'] = 'd' * 40
            with self.assertRaisesRegex(Refusal, 'host_consent_mismatch'):
                worker.run('execute', payload, self.root)
        self.assertFalse(self.root.exists())

    def test_fresh_oracle_really_executed_and_failed_witness_refuses(self):
        # Deliberate broken witness; static green archive evidence cannot hide it.
        import subprocess
        original = subprocess.run
        def sabotage(argv, **kwargs):
            if '-I' in argv:
                return subprocess.CompletedProcess(argv, 0, b'', b'')
            return original(argv, **kwargs)
        with patch('subprocess.run', side_effect=sabotage), patch.object(
                FixtureGit, 'merge', side_effect=AssertionError('effect forbidden')):
            with self.assertRaisesRegex(Refusal, 'fresh_oracle_failed'):
                worker.run('execute', self.payload, self.root)


if __name__ == '__main__':
    unittest.main()
