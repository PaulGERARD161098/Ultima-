"""Politique fermée : les propositions ne choisissent ni leur couleur ni leurs droits.

Les mandats, preuves et accords sont fournis par l'hôte de confiance. Ce module
ne transforme pas une clé JSON ``authority: true`` en autorité. Aucun adaptateur
de production n'est installé par ce fichier.
"""
from dataclasses import dataclass, field
from typing import FrozenSet

CONTRACT_VERSION = '1.1'
SKILL_VERSION = '1.0'
READ = frozenset({'read_source', 'read_memory', 'status'})
PREPARE = frozenset({'prepare_patch', 'write_memory', 'run_fixture_tests'})
FORBIDDEN = frozenset({'send_mail', 'send_sms', 'call_phone', 'production_sql',
                      'delete_real_data', 'read_secret', 'change_secret',
                      'publish', 'change_aid_rate', 'paid_call'})


class Refusal(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


@dataclass(frozen=True)
class Context:
    repository: str
    source: str
    target: str
    integration: str
    environment: str
    account: str
    target_ref: str = 'refs/heads/main'
    source_ref: str = 'refs/heads/patch'
    mode: str = 'integration_commit'


@dataclass(frozen=True)
class Evidence:
    context: Context
    requirement: str
    passed: bool
    location: str
    measured_at: str
    command: str


@dataclass(frozen=True)
class Approval:
    context: Context
    approver: str
    mandate_version: int
    expires_at: float


@dataclass(frozen=True)
class Mandate:
    mission: str
    owner: str
    version: int
    actors: FrozenSet[str]
    repositories: FrozenSet[str]
    actions: FrozenSet[str]
    quadrants: FrozenSet[str] = field(default_factory=frozenset)
    required_checks: FrozenSet[str] = field(default_factory=lambda: frozenset({'tests', 'review'}))
    expires_at: float = 0
    stopped: bool = False
    contract_version: str = CONTRACT_VERSION
    skill_version: str = SKILL_VERSION


class Policy:
    def authorize(self, mandate, principal, action, repository, now,
                  *, context=None, evidence=(), approval=None,
                  effects=None, atomic_adapter=False):
        if mandate.contract_version != CONTRACT_VERSION or mandate.skill_version != SKILL_VERSION:
            raise Refusal('version_mismatch')
        if mandate.stopped and action != 'status':
            raise Refusal('stopped')
        if now >= mandate.expires_at and action != 'status':
            raise Refusal('expired')
        if principal not in mandate.actors or repository not in mandate.repositories:
            raise Refusal('scope_denied')
        if action in FORBIDDEN:
            raise Refusal('red_effect')
        if action not in READ | PREPARE | {'merge_fixture'} or action not in mandate.actions:
            raise Refusal('unknown_or_unauthorized_action')
        # L'adaptateur atteste ses effets ; l'absence de mesure n'est pas « aucun effet ».
        if effects is None or not isinstance(effects, frozenset):
            raise Refusal('effects_unknown')
        allowed_effects = {
            'read_source': frozenset({'read_scoped_source'}),
            'read_memory': frozenset({'read_scoped_memory'}),
            'status': frozenset({'read_scoped_memory'}),
            'prepare_patch': frozenset({'write_fixture'}),
            'write_memory': frozenset({'write_scoped_memory'}),
            'run_fixture_tests': frozenset({'execute_isolated_fixture'}),
            'merge_fixture': frozenset({'update_fixture_ref'}),
        }
        if effects != allowed_effects[action]:
            raise Refusal('effects_denied')
        if action != 'merge_fixture':
            return True
        if context is None or context.repository != repository or context.environment != 'fixture':
            raise Refusal('fixture_context_required')
        if not atomic_adapter:
            raise Refusal('atomic_merge_required')
        if approval is None or approval.context != context or approval.approver != mandate.owner:
            raise Refusal('approval_missing_or_stale')
        if approval.mandate_version != mandate.version or now >= approval.expires_at:
            raise Refusal('approval_expired')
        evidence = tuple(evidence)
        if any(not isinstance(p, Evidence) for p in evidence):
            raise Refusal('invalid_evidence')
        valid = {p.requirement for p in evidence if isinstance(p, Evidence)
                 and p.context == context and p.passed is True
                 and p.location and p.measured_at and p.command}
        if not mandate.required_checks or not mandate.required_checks <= valid:
            raise Refusal('proof_missing_or_inapplicable')
        # Un échec explicite ne peut pas être dissimulé derrière une autre preuve verte.
        if any(p.context == context and p.requirement in mandate.required_checks
               and p.passed is not True for p in evidence):
            raise Refusal('required_check_failed')
        return True

    def delegate(self, mandate, principal, recipient, data_quadrants, grants, *, now):
        # grants provient du registre hôte authentifié, jamais du contenu à transmettre.
        if mandate.contract_version != CONTRACT_VERSION or mandate.skill_version != SKILL_VERSION:
            raise Refusal('version_mismatch')
        if mandate.stopped:
            raise Refusal('stopped')
        if now >= mandate.expires_at:
            raise Refusal('expired')
        if principal not in mandate.actors or recipient not in mandate.actors:
            raise Refusal('recipient_denied')
        requested = frozenset(data_quadrants)
        if not requested <= mandate.quadrants or not requested <= frozenset(grants.get(recipient, ())):
            raise Refusal('quadrant_denied')
        return True
