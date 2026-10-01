"""Paquet R21 préparé en CI. Ces tests ne constituent aucun accord réel."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest.mock import patch

from leo.trial import prepare, inspect, MISSION
from leo.runtime.policy import Refusal


class TrialTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.trial = self.root / 'trial'
        self.provenance = {'source': 'a' * 40, 'target': 'b' * 40, 'integration': 'c' * 40}

    def tearDown(self):
        self.tmp.cleanup()

    def test_preparation_real_red_green_and_fresh_readonly_process(self):
        result = prepare(self.trial, self.provenance)
        self.assertFalse(result['merge_available'])
        self.assertFalse(result['global_v1_accepted'])
        self.assertEqual(len(result['operations']), 2)
        self.assertTrue(all(op['status'] == 'completed' for op in result['operations']))
        self.assertEqual(result['target_observed'], result['fixture_context']['target'])
        self.assertEqual(result['state'], 'ready_for_review')
        self.assertEqual(result['version'], 2)
        proofs = json.loads((self.trial / 'proofs.json').read_text())
        self.assertEqual([p['returncode'] for p in proofs['checks']], [1, 0, 0])
        self.assertEqual(proofs['review'], 'pending')
        self.assertEqual(proofs['approval'], 'pending')
        self.assertIn('-    return 1', (self.trial / 'change.patch').read_text())
        self.assertIn('+    return 2', (self.trial / 'change.patch').read_text())
        db = self.trial / 'canonical.sqlite'
        before = hashlib.sha256(db.read_bytes()).hexdigest()
        child = subprocess.run([sys.executable, '-m', 'leo.trial', 'inspect', str(self.trial)],
                               capture_output=True, text=True, timeout=10, check=True)
        self.assertEqual(json.loads(child.stdout), result)
        self.assertEqual(hashlib.sha256(db.read_bytes()).hexdigest(), before)
        with sqlite3.connect(db) as conn:
            budget = conn.execute('SELECT count(*) FROM budget_operations WHERE mission=?', (MISSION,)).fetchone()
        self.assertEqual(budget[0], 2, 'two inspections; approval refusal adds no reservation')
        controlled = json.loads((self.trial / 'controlled-inspection.json').read_text())
        self.assertEqual([r['result']['outcome'] for r in controlled['receipts']], ['failed', 'passed'])
        archive = self.root / 'trial.tar.gz'
        self.assertEqual(archive.stat().st_mode & 0o777, 0o644)
        with tarfile.open(archive) as bundle:
            names = bundle.getnames()
            self.assertIn('trial/canonical.sqlite', names)
            self.assertIn('trial/fixture.git/config', names)
            self.assertTrue(all(not p.issym() and not p.islnk() for p in bundle.getmembers()))

    def test_commit_ids_stable_and_relocation_requires_new_host_context(self):
        first = prepare(self.trial, self.provenance)
        second = prepare(self.root / 'second', self.provenance)
        for key in ('source', 'target', 'integration'):
            self.assertEqual(first['fixture_context'][key], second['fixture_context'][key])
        relocated = self.root / 'relocated'
        shutil.copytree(self.trial, relocated)
        read = inspect(relocated)
        self.assertTrue(read['relocated'])
        self.assertFalse(read['merge_available'])
        self.assertEqual(len(read['operations']), 2)

    def test_existing_output_is_preserved(self):
        self.trial.mkdir()
        (self.trial / 'other-session').write_text('preserve')
        with self.assertRaises(FileExistsError): prepare(self.trial, self.provenance)
        self.assertEqual((self.trial / 'other-session').read_text(), 'preserve')

    def test_missing_isolation_and_bad_provenance_refuse_before_writes(self):
        with patch.dict(os.environ, {'LV1_ISOLATED': '0'}):
            with self.assertRaisesRegex(Refusal, 'isolated_ci_required'):
                prepare(self.trial, self.provenance)
        self.assertFalse(self.trial.exists())
        with patch.dict(os.environ, {'LV1_ISOLATED': '0'}):
            with self.assertRaisesRegex(Refusal, 'isolated_ci_required'):
                inspect(self.trial)
        with self.assertRaisesRegex(Refusal, 'invalid_ultima_provenance'):
            prepare(self.trial, {**self.provenance, 'source': 'main'})
        self.assertFalse(self.trial.exists())

    def test_modified_proof_and_hostile_git_config_fail_without_execution(self):
        prepare(self.trial, self.provenance)
        proof = self.trial / 'proofs.json'
        original = proof.read_bytes()
        proof.write_text('{}')
        with self.assertRaisesRegex(Refusal, 'trial_proof_changed'): inspect(self.trial)
        proof.write_bytes(original)
        config = self.trial / 'fixture.git' / 'config'
        config.write_text(config.read_text() + '\n[diff]\n external = sh -c "touch /tmp/never-run-r21"\n')
        with self.assertRaisesRegex(Refusal, 'trial_git_config_changed'): inspect(self.trial)

    def test_symlinked_repository_is_not_consumed(self):
        prepare(self.trial, self.provenance)
        repo = self.trial / 'fixture.git'
        repo.rename(self.root / 'outside.git')
        repo.symlink_to(self.root / 'outside.git', target_is_directory=True)
        with self.assertRaisesRegex(Refusal, 'trial_symlink_denied'): inspect(self.trial)

    def test_cli_has_no_merge_or_approval_import(self):
        result = subprocess.run([sys.executable, '-m', 'leo.trial', 'merge', '--approved', 'true'],
                                capture_output=True, text=True, timeout=5)
        self.assertEqual(result.returncode, 2)
        self.assertIn('invalid choice', result.stderr)
