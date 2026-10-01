"""Point de passage fermé pour un hôte de confiance, sans accès de production.

L'hôte authentifie principal et fournit le mandat/les preuves/adaptateurs. La
proposition du modèle n'accepte aucune de ces données d'autorité. Ne pas exposer
directement ce constructeur ou les registres SQLite à un modèle ou une API web.
"""
import time
from dataclasses import asdict
from .budget import BudgetLedger
from .memoire import MissionStore, _patch, _version
from .policy import Policy, Refusal


def mandate_record(mandate):
    return {key: sorted(value) if isinstance(value, frozenset) else value
            for key, value in asdict(mandate).items()}


class Broker:
    def __init__(self, db_path, mandate, repository, *, clock=time.time,
                 fixture_adapter=None, context=None, evidence=(), approval=None):
        self.store = MissionStore(db_path)
        self.budget = BudgetLedger(db_path, clock=clock)
        self.mandate, self.repository, self.clock = mandate, repository, clock
        self.policy = Policy()
        self.adapter, self.context = fixture_adapter, context
        self.evidence, self.approval = tuple(evidence), approval

    def execute(self, principal, proposal):
        if type(proposal) is not dict or not isinstance(proposal.get('action'), str):
            raise Refusal('invalid_proposal')
        action = proposal['action']
        canonical = self.store.read_mission(self.mandate.mission, principal)
        if canonical['mandat'] != mandate_record(self.mandate):
            raise Refusal('canonical_mandate_mismatch')
        if action == 'status':
            if set(proposal) - {'action', 'operation_id'}:
                raise Refusal('unexpected_argument')
            self.policy.authorize(self.mandate, principal, action, self.repository, self.clock(),
                                  effects=frozenset({'read_scoped_memory'}))
            mission = self.store.read_mission(self.mandate.mission, principal)
            operation = self.store.get_operation(self.mandate.mission, principal, proposal['operation_id']) \
                if 'operation_id' in proposal else None
            return {'mission': mission, 'budget': self.budget.status(self.mandate.mission),
                    'operation': operation}
        if action not in {'write_memory', 'merge_fixture'}:
            raise Refusal('adapter_unavailable')
        allowed = {'action', 'operation_id', 'expected_version'} | ({'patch'} if action == 'write_memory' else set())
        if set(proposal) != allowed:
            raise Refusal('unexpected_argument')
        mission = self.store.read_mission(self.mandate.mission, principal)
        if principal not in {mission['owner'], *mission['writers']}:
            raise Refusal('writer_required')
        if mission['source'].get('repository') != self.repository:
            raise Refusal('canonical_source_mismatch')
        effects = frozenset({'write_scoped_memory'}) if action == 'write_memory' else \
            (self.adapter.effects if self.adapter else None)
        self.policy.authorize(self.mandate, principal, action, self.repository, self.clock(),
                              effects=effects, context=self.context, evidence=self.evidence,
                              approval=self.approval, atomic_adapter=bool(self.adapter and self.adapter.atomic))
        operation_id, version = proposal['operation_id'], proposal['expected_version']
        _version(version)
        payload = {'kind': 'memory_patch', 'expected_version': version, 'patch': _patch(proposal['patch'])} \
            if action == 'write_memory' else {**proposal, 'context': asdict(self.context)}
        prior = self.store.get_operation(self.mandate.mission, principal, operation_id)
        if prior is not None:
            if prior['payload'] != payload:
                raise Refusal('operation_conflict')
            if prior['status'] == 'completed':
                self.budget.settle(self.mandate.mission, operation_id, 1 if action == 'write_memory' else 2)
            # Aucun effet n'est rejoué pour pending/unknown/completed.
            return prior
        units = 1 if action == 'write_memory' else 2  # unités de travail fictives, jamais un prix fournisseur
        receipt = self.budget.reserve(self.mandate.mission, operation_id, principal, units)
        if not receipt['new_reservation']:
            return {'status': 'unknown', 'operation_id': operation_id,
                    'reason': 'reservation_exists_without_result; reconcile_before_retry'}
        if action == 'write_memory':
            result = self.store.apply_memory_operation(self.mandate.mission, principal, operation_id,
                                                       version, proposal['patch'])
            self.budget.settle(self.mandate.mission, operation_id, units)
            return result
        operation = self.store.begin_operation(self.mandate.mission, principal, operation_id, payload, version)
        failed = False
        # Dernière admission sous le même verrou que BudgetLedger.stop : un
        # arrêt déjà committé interdit le départ, une admission gagnante engage
        # l'effet. L'adaptateur Git hôte est borné et ne rappelle pas cette DB.
        with self.store._transaction() as db:
            row = self.store._authorized(db, self.mandate.mission, principal, write=True)
            current = self.store._mission(row)
            self.store._assert_version(row, version)
            if current['mandat'] != mandate_record(self.mandate) or current['source'].get('repository') != self.repository:
                raise Refusal('canonical_mandate_or_source_mismatch')
            state = self.budget._status(db, self.mandate.mission)
            if state['stopped'] or state['expired']:
                raise Refusal('merge_stopped_or_expired')
            self.policy.authorize(self.mandate, principal, action, self.repository, self.clock(),
                                  effects=effects, context=self.context, evidence=self.evidence,
                                  approval=self.approval, atomic_adapter=bool(self.adapter and self.adapter.atomic))
            try:
                result = self.adapter.merge(self.context)
            except Exception:
                failed = True
        if failed:
            self.store.mark_unknown(self.mandate.mission, principal, operation_id,
                                    'adapter_result_unknown', expected_operation_version=operation['version'])
            # La réserve reste engagée ; même une réponse perdue ne déclenche pas de retry.
            raise Refusal('adapter_result_unknown') from None
        finished = self.store.complete_operation(self.mandate.mission, principal, operation_id, result,
                                                 expected_operation_version=operation['version'])
        self.budget.settle(self.mandate.mission, operation_id, units)
        return finished

    def reconcile_completed(self, principal, operation_id):
        """Solder un résultat durable après arrêt, sans créer un nouvel effet."""
        canonical = self.store.read_mission(self.mandate.mission, principal)
        if canonical['mandat'] != mandate_record(self.mandate):
            raise Refusal('canonical_mandate_mismatch')
        if principal not in self.mandate.actors or principal not in {canonical['owner'], *canonical['writers']}:
            raise Refusal('scope_denied')
        operation = self.store.get_operation(self.mandate.mission, principal, operation_id)
        if operation is None or operation['status'] != 'completed':
            raise Refusal('completed_receipt_required')
        payload = operation['payload']
        if payload.get('kind') == 'memory_patch':
            units = 1
        elif payload.get('action') == 'merge_fixture' and self.context is not None \
                and payload.get('context') == asdict(self.context):
            units = 2
        else:
            raise Refusal('operation_context_mismatch')
        self.budget.settle(self.mandate.mission, operation_id, units)
        return operation

    def reconcile_fixture(self, principal, operation_id):
        # Lecture du résultat réel par l'adaptateur hôte ; jamais une déclaration du modèle.
        if principal not in self.mandate.actors or self.repository not in self.mandate.repositories:
            raise Refusal('scope_denied')
        canonical = self.store.read_mission(self.mandate.mission, principal)
        if canonical['mandat'] != mandate_record(self.mandate):
            raise Refusal('canonical_mandate_mismatch')
        if principal not in {canonical['owner'], *canonical['writers']}:
            raise Refusal('writer_required')
        operation = self.store.get_operation(self.mandate.mission, principal, operation_id)
        if operation is None or operation['payload'].get('action') != 'merge_fixture' or not self.adapter:
            raise Refusal('operation_unavailable')
        if self.context is None or operation['payload'].get('context') != asdict(self.context):
            raise Refusal('operation_context_mismatch')
        if operation['status'] == 'completed':
            self.budget.settle(self.mandate.mission, operation_id, 2)
            return operation
        observed = self.adapter.lookup(self.context)
        if observed['status'] != 'completed': return operation
        result = {'commit': observed['commit'], 'environment': 'fixture', 'publication': False}
        finished = self.store.complete_operation(self.mandate.mission, principal, operation_id, result,
                                                 expected_operation_version=operation['version'])
        self.budget.settle(self.mandate.mission, operation_id, 2)
        return finished
