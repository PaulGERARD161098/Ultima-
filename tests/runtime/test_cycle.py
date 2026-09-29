"""Cycle fictif R09/R21/R25 : aucun accord réel ni merge distant."""
import json
import subprocess
import sys
from pathlib import Path
import unittest
import test_fixture_git
from leo.runtime.broker import Broker, mandate_record
from leo.runtime.policy import Approval, Evidence, Mandate, Refusal


class CycleTests(unittest.TestCase):
    setUp = test_fixture_git.AtomicGitTests.setUp
    tearDown = test_fixture_git.AtomicGitTests.tearDown
    commit = test_fixture_git.AtomicGitTests.commit
    def test_cycle_with_real_patch_lost_response_and_fresh_process(self):
        def check(commit):
            source = self.adapter.git('show', commit + ':fixture.py')
            # Code fictif connu, exécuté uniquement dans le conteneur CI sans réseau.
            return subprocess.run([sys.executable, '-c', source + '\nassert result() == 2'],
                                  capture_output=True, timeout=5).returncode
        self.assertNotEqual(check(self.target), 0, 'le défaut connu doit être détecté')
        self.assertEqual(check(self.source), 0)
        self.assertEqual(check(self.integration), 0)
        mandate = Mandate('cycle', 'paul-fixture', 1, frozenset({'leo'}),
                          frozenset({str(self.repo)}), frozenset({'merge_fixture', 'status'}),
                          expires_at=1000)
        evidence = tuple(Evidence(self.c, kind, True, 'fixture/log', '2026-09-29',
                                 'check(commit): assert result() == 2' if kind == 'tests'
                                 else 'fixture approval only; independent review outside this test')
                         for kind in ('tests', 'review'))
        approval = Approval(self.c, 'paul-fixture', 1, 900)
        db = self.root / 'canonical.sqlite'
        broker = Broker(db, mandate, str(self.repo), clock=lambda: 10,
                        fixture_adapter=self.adapter, context=self.c, evidence=evidence, approval=approval)
        broker.store.create_mission('cycle', 'paul-fixture', 'fiction', mandate_record(mandate),
                                    {'repository': str(self.repo)}, [], ['leo'], authority=True)
        broker.budget.create('cycle', dict(max_units=4, max_calls=2, max_attempts=2,
                                         max_delegates=1, expires_at=1000), authority=True)
        merge = self.adapter.merge
        def lost_response(context):
            merge(context)
            raise TimeoutError('réponse volontairement perdue après effet')
        self.adapter.merge = lost_response
        proposal = dict(action='merge_fixture', operation_id='merge-1', expected_version=1)
        with self.assertRaises(Refusal): broker.execute('leo', proposal)
        self.assertEqual(broker.store.get_operation('cycle', 'leo', 'merge-1')['status'], 'unknown')
        from leo.runtime.fixture_git import FixtureGit
        reopened = Broker(db, mandate, str(self.repo), clock=lambda: 10,
                          fixture_adapter=FixtureGit(self.root, self.repo), context=self.c,
                          evidence=evidence, approval=approval)
        receipt = reopened.reconcile_fixture('leo', 'merge-1')
        self.assertEqual(receipt['status'], 'completed')
        self.assertEqual(reopened.execute('leo', proposal), receipt)
        self.assertEqual(reopened.budget.status('cycle')['calls'], 1)
        self.assertEqual(check('refs/heads/main'), 0)
        code = ('import json,sys; from leo.runtime.memoire import MissionStore; '
                's=MissionStore(sys.argv[1]); '
                'print(json.dumps(s.get_operation("cycle","leo","merge-1")))')
        fresh = subprocess.run([sys.executable, '-c', code, str(db)],
                               check=True, capture_output=True, text=True, timeout=10)
        self.assertEqual(json.loads(fresh.stdout)['result']['commit'], self.integration)
