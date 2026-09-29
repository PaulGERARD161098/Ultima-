"""Autorités fictives typées uniquement : ces tests ne sont pas l'accord de Paul."""
from dataclasses import replace
import hashlib
import gzip
import io
import json
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

from leo import trial
from leo.trial_resume import verify, execute, _unpack, PROPOSAL, MAX_BYTES
from leo.runtime.fixture_git import FixtureGit
from leo.runtime.budget import BudgetLedger
from leo.runtime.policy import Approval, Context, Evidence, Mandate, Refusal


class TrialResumeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.root = self.base / 'trial'
        self.provenance = dict(source='a' * 40, target='b' * 40, integration='c' * 40)
        prepared = trial.prepare(self.root, self.provenance)
        self.context = Context(**prepared['fixture_context'])
        self.archive = self.base / 'trial.tar.gz'
        self.digest = hashlib.sha256(self.archive.read_bytes()).hexdigest()
        manifest = json.loads((self.root / 'manifest.json').read_text())
        self.mandate = Mandate(trial.MISSION, trial.OWNER, 1,
            frozenset({trial.ACTOR, 'inspector'}), frozenset({self.context.repository}),
            frozenset({'status', 'merge_fixture', 'read_source'}), quadrants=frozenset({'code'}),
            expires_at=manifest['mandate_expires_at'])
        self.evidence = tuple(Evidence(self.context, kind, True, 'fixture://simulated/' + kind,
                                      '2000-01-01', 'simulated-host-check') for kind in ('tests', 'review'))
        self.approval = Approval(self.context, trial.OWNER, 1, self.mandate.expires_at)

    def tearDown(self):
        self.temp.cleanup()

    def call(self, **kwargs):
        args = dict(mandate=self.mandate, context=self.context, evidence=self.evidence,
                    approval=self.approval, principal=trial.ACTOR)
        args.update(kwargs)
        return execute(self.root, **args)

    def test_exact_package_restored_missing_approval_and_fresh_process(self):
        shutil.rmtree(self.root)  # Explicitly disposable fixture only.
        result = verify(self.archive, self.digest, self.root, self.provenance, self.context.repository)
        self.assertEqual(result['proposal'], PROPOSAL)
        self.assertFalse(result['merge_available'])
        self.assertIn('exact_authenticated_approval', result['missing'])
        before = hashlib.sha256((self.root / 'canonical.sqlite').read_bytes()).hexdigest()
        with self.assertRaisesRegex(Refusal, 'approval_missing_or_stale'):
            self.call(approval=None)
        self.assertEqual(before, hashlib.sha256((self.root / 'canonical.sqlite').read_bytes()).hexdigest())
        child = subprocess.run([sys.executable, '-m', 'leo.trial', 'inspect', str(self.root)],
                                capture_output=True, text=True, check=True, timeout=10)
        self.assertEqual(json.loads(child.stdout)['target_observed'], self.context.target)

    def test_simulated_host_execution_replay_and_fresh_process(self):
        first = self.call()
        self.assertEqual(first['status'], 'completed')
        self.assertEqual(first['result']['commit'], self.context.integration)
        self.assertEqual(self.call(), first)
        child = subprocess.run([sys.executable, '-m', 'leo.trial', 'inspect', str(self.root)],
                                capture_output=True, text=True, check=True, timeout=10)
        observed = json.loads(child.stdout)
        self.assertEqual(observed['target_observed'], self.context.integration)
        self.assertEqual(len(observed['operations']), 3)
        with sqlite3.connect(self.root / 'canonical.sqlite') as db:
            self.assertEqual(db.execute('SELECT SUM(used_units),COUNT(*) FROM budget_operations').fetchone(), (4, 3))

    def test_lost_response_reconciles_without_second_merge(self):
        original = FixtureGit.merge
        def lost(adapter, context):
            original(adapter, context)
            raise TimeoutError('simulated lost response')
        with patch.object(FixtureGit, 'merge', lost):
            with self.assertRaisesRegex(Refusal, 'adapter_result_unknown'):
                self.call()
        with patch.object(FixtureGit, 'merge', side_effect=AssertionError('must not replay')):
            self.assertEqual(self.call()['status'], 'unknown')
            BudgetLedger(self.root / 'canonical.sqlite').stop(trial.MISSION, 'fixture-stop', authority=True)
            self.assertEqual(self.call(reconcile=True, approval=None)['status'], 'completed')
            self.assertEqual(self.call(reconcile=True, approval=None)['status'], 'completed')

    def test_authority_json_changed_context_missing_review_and_expiry_refused(self):
        for changes, expected in [
            ({'approval': {'approved': True}}, 'typed_host_authority_required'),
            ({'mandate': replace(self.mandate, owner='intruder')}, 'trial_authority_mismatch'),
            ({'context': replace(self.context, source='d' * 40)}, 'trial_context_mismatch'),
            ({'evidence': self.evidence[:1]}, 'proof_missing_or_inapplicable'),
            ({'clock': lambda: self.mandate.expires_at + 1}, 'expired')]:
            with self.subTest(expected=expected), self.assertRaisesRegex(Refusal, expected):
                self.call(**changes)

    def test_hash_provenance_canonical_corruption_and_relocation(self):
        destination = self.base / 'restored'
        with self.assertRaisesRegex(Refusal, 'package_sha_mismatch'):
            verify(self.archive, '0' * 64, destination, self.provenance, self.context.repository)
        self.assertFalse(destination.exists())
        result = verify(self.archive, self.digest, destination, self.provenance, self.context.repository)
        self.assertTrue(result['relocated'])
        with self.assertRaisesRegex(Refusal, 'trial_relocation_requires_revalidation'):
            execute(destination, mandate=self.mandate, context=self.context,
                    evidence=self.evidence, approval=self.approval, principal=trial.ACTOR)
        with sqlite3.connect(self.root / 'canonical.sqlite') as db:
            db.execute('UPDATE budget_missions SET max_units=999')
        with self.assertRaisesRegex(Refusal, 'trial_budget_changed'):
            self.call()
        with self.assertRaisesRegex(Refusal, 'trial_provenance_mismatch'):
            verify(self.archive, self.digest, self.base / 'wrong', {**self.provenance, 'source': 'e' * 40}, self.context.repository)

    def test_archive_traversal_links_duplicates_and_existing_destination(self):
        for mode in ('traversal', 'symlink', 'duplicate'):
            archive = self.base / (mode + '.tar.gz')
            with tarfile.open(archive, 'w:gz') as bundle:
                member = tarfile.TarInfo('../escape' if mode == 'traversal' else 'trial/file')
                if mode == 'symlink':
                    member.type, member.linkname = tarfile.SYMTYPE, '/tmp/outside'
                bundle.addfile(member, io.BytesIO(b''))
                if mode == 'duplicate': bundle.addfile(member, io.BytesIO(b''))
            with self.subTest(mode=mode), self.assertRaisesRegex(Refusal, 'unsafe_trial_archive'):
                _unpack(archive, hashlib.sha256(archive.read_bytes()).hexdigest(), self.base / mode)
            self.assertFalse((self.base / mode).exists())
        with self.assertRaises(FileExistsError):
            verify(self.archive, self.digest, self.root, self.provenance, self.context.repository)

    def test_decompression_bound_includes_unparsed_tar_headers(self):
        archive = self.base / 'bomb.tar.gz'
        archive.write_bytes(gzip.compress(b'0' * (MAX_BYTES + 1)))
        with self.assertRaisesRegex(Refusal, 'trial_archive_too_large'):
            _unpack(archive, hashlib.sha256(archive.read_bytes()).hexdigest(), self.base / 'bomb')
        self.assertFalse((self.base / 'bomb').exists())

    def test_cli_no_execution_or_approval_import(self):
        child = subprocess.run([sys.executable, '-m', 'leo.trial_resume', 'execute', '--approved'],
                               capture_output=True, text=True, timeout=5)
        self.assertEqual(child.returncode, 2)
        self.assertIn('invalid choice', child.stderr)
