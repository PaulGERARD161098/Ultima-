import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from leo.runtime.fixture_git import FixtureGit
from leo.runtime.policy import Context, Refusal


class AtomicGitTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.repo = self.root / 'epreuve.git'
        subprocess.run(['git', 'init', '--bare', str(self.repo)], check=True, capture_output=True)
        (self.repo / 'LV1_FIXTURE').write_text('isolated-fiction-only\n')
        self.adapter = FixtureGit(self.root, self.repo)
        self.target = self.commit('base')
        self.source = self.commit('patch', [self.target])
        self.integration = self.commit('integration', [self.target, self.source])
        self.adapter.git('update-ref', 'refs/heads/main', self.target)
        self.adapter.git('update-ref', 'refs/heads/patch', self.source)
        self.c = Context(str(self.repo), self.source, self.target, self.integration, 'fixture', 'fixture-account')

    def tearDown(self): self.tmp.cleanup()

    def commit(self, message, parents=()):
        env = {'PATH': '/usr/bin:/bin', 'GIT_CONFIG_NOSYSTEM': '1', 'GIT_CONFIG_GLOBAL': '/dev/null',
               'GIT_AUTHOR_NAME': 'Fixture', 'GIT_AUTHOR_EMAIL': 'fixture@example.invalid',
               'GIT_COMMITTER_NAME': 'Fixture', 'GIT_COMMITTER_EMAIL': 'fixture@example.invalid'}
        content = 'def result():\n    return ' + ('1' if message == 'base' else '2') + '\n'
        blob = subprocess.run(['git', '--git-dir', str(self.repo), 'hash-object', '-w', '--stdin'],
                              input=content, text=True, capture_output=True, check=True, env=env).stdout.strip()
        tree = subprocess.run(['git', '--git-dir', str(self.repo), 'mktree'],
                              input=f'100644 blob {blob}\tfixture.py\n', text=True,
                              capture_output=True, check=True, env=env).stdout.strip()
        cmd = ['git', '--git-dir', str(self.repo), 'commit-tree', tree, '-m', message]
        for parent in parents: cmd += ['-p', parent]
        return subprocess.run(cmd, text=True, capture_output=True, check=True, env=env).stdout.strip()

    def test_positive_merge_and_lost_response_lookup(self):
        self.adapter.merge(self.c)
        # Réouverture de l'adaptateur sans rejouer la mutation après perte de réponse.
        reopened = FixtureGit(self.root, self.repo)
        self.assertEqual(reopened.lookup(self.c)['status'], 'completed')

    def test_target_changed_during_final_gate(self):
        other = self.commit('concurrent target', [self.target])
        def race(): self.adapter.git('update-ref', 'refs/heads/main', other)
        with self.assertRaises(Refusal): self.adapter.merge(self.c, pre_transaction=race)
        self.assertEqual(self.adapter.git('rev-parse', 'refs/heads/main').strip(), other)

    def test_source_changed_during_final_gate(self):
        other = self.commit('concurrent source', [self.source])
        def race(): self.adapter.git('update-ref', 'refs/heads/patch', other)
        with self.assertRaises(Refusal): self.adapter.merge(self.c, pre_transaction=race)
        self.assertEqual(self.adapter.git('rev-parse', 'refs/heads/main').strip(), self.target)

    def test_remote_denied(self):
        self.adapter.git('remote', 'add', 'forbidden', 'https://example.invalid/no-call')
        with self.assertRaises(Refusal): FixtureGit(self.root, self.repo)

    def _symbolic_ref_case(self, ref, expected, during_transaction):
        third = 'refs/heads/third-party'
        self.adapter.git('update-ref', third, expected)
        def replace_ref(): self.adapter.git('symbolic-ref', ref, third)
        if not during_transaction:
            replace_ref()
        with self.assertRaises(Refusal):
            self.adapter.merge(self.c, pre_transaction=replace_ref if during_transaction else None)
        self.assertEqual(self.adapter.git('rev-parse', third).strip(), expected)
        self.assertEqual(self.adapter.git('symbolic-ref', ref).strip(), third)
        self.assertEqual(self.adapter.git('rev-parse', 'refs/heads/main').strip(), self.target)
        # A rejected transaction must release its locks and preserve legitimate use.
        self.adapter.git('update-ref', '--no-deref', ref, expected)
        self.adapter.merge(self.c)
        self.assertEqual(self.adapter.git('rev-parse', third).strip(), expected)

    def test_symbolic_source_rejected(self):
        self._symbolic_ref_case('refs/heads/patch', self.source, False)

    def test_symbolic_target_rejected(self):
        self._symbolic_ref_case('refs/heads/main', self.target, False)

    def test_source_becomes_symbolic_during_gate(self):
        self._symbolic_ref_case('refs/heads/patch', self.source, True)

    def test_target_becomes_symbolic_during_gate(self):
        self._symbolic_ref_case('refs/heads/main', self.target, True)


if __name__ == '__main__': unittest.main()
