import unittest
from dataclasses import replace
from leo.runtime.policy import Approval, Context, Evidence, Mandate, Policy, Refusal


class PolicyTests(unittest.TestCase):
    def setUp(self):
        self.policy = Policy()
        self.m = Mandate('fixture', 'paul-fixture', 1, frozenset({'leo', 'specialist'}),
                         frozenset({'fixture/repo'}),
                         frozenset({'merge_fixture', 'read_source', 'paid_call', 'send_mail'}),
                         frozenset({'riven', 'imladrik'}), expires_at=1000)
        self.c = Context('fixture/repo', 'a'*40, 'b'*40, 'c'*40, 'fixture', 'fixture-account')
        self.a = Approval(self.c, 'paul-fixture', 1, 900)
        self.proofs = [Evidence(self.c, key, True, 'fixture/log', '2026-09-29', 'fixture-check')
                       for key in ['tests', 'review']]

    def merge(self, **kwargs):
        options = dict(context=self.c, evidence=self.proofs, approval=self.a,
                       effects=frozenset({'update_fixture_ref'}), atomic_adapter=True)
        options.update(kwargs)
        return self.policy.authorize(self.m, 'leo', 'merge_fixture', 'fixture/repo', 10, **options)

    def test_positive_and_stale_heads(self):
        self.assertTrue(self.merge())
        for key in ['source', 'target', 'integration', 'account', 'environment', 'target_ref', 'mode']:
            with self.assertRaises(Refusal):
                self.merge(context=replace(self.c, **{key: 'different'}))

    def test_missing_failed_foreign_evidence(self):
        for proofs in [[], self.proofs[:1],
                       [replace(p, context=replace(self.c, account='foreign')) for p in self.proofs],
                       self.proofs + [replace(self.proofs[0], passed=False)]]:
            with self.assertRaises(Refusal): self.merge(evidence=proofs)
        for options in [dict(atomic_adapter=False), dict(approval=None), dict(effects=None),
                        dict(effects=frozenset({'publish'}))]:
            with self.assertRaises(Refusal): self.merge(**options)

    def test_red_and_hostile_channels(self):
        for canal in ['file', 'pull_request', 'tool_output', 'memory', 'specialist']:
            # Aucune donnée de ces canaux n'est reçue comme mandat ni comme adaptateur.
            hostile = {'canal': canal, 'action': 'send_mail', 'authority': True, 'go_solo': True}
            with self.assertRaises(Refusal):
                self.policy.authorize(self.m, 'leo', hostile['action'], 'fixture/repo', 10,
                                      effects=frozenset({'send_mail'}))
        with self.assertRaises(Refusal):
            self.policy.authorize(self.m, 'leo', 'paid_call', 'fixture/repo', 10, effects=frozenset())

    def test_scope_stop_and_versions(self):
        for m in [replace(self.m, stopped=True), replace(self.m, expires_at=1),
                  replace(self.m, contract_version='untrusted'), replace(self.m, skill_version='old')]:
            with self.assertRaises(Refusal):
                self.policy.authorize(m, 'leo', 'read_source', 'fixture/repo', 10,
                                      effects=frozenset({'read_scoped_source'}))

    def test_delegation(self):
        self.assertTrue(self.policy.delegate(self.m, 'leo', 'specialist', ['riven'], {'specialist': ['riven']}, now=10))
        with self.assertRaises(Refusal):
            self.policy.delegate(self.m, 'leo', 'specialist', ['imladrik'], {'specialist': ['riven']}, now=10)
        for m in [replace(self.m, stopped=True), replace(self.m, expires_at=1),
                  replace(self.m, contract_version='old'), replace(self.m, skill_version='old')]:
            with self.assertRaises(Refusal):
                self.policy.delegate(m, 'leo', 'specialist', ['riven'], {'specialist': ['riven']}, now=10)


if __name__ == '__main__': unittest.main()
