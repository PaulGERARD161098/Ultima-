// Unitaires validation IMLADRIK passerelles v2 (Node pur, zéro réseau).
// Parité API↔base : validateSermentLien/validateScenarioLien reflètent les CHECK
// de supabase/migrations/0018_imladrik_passerelles.sql (cible XOR, rapport réservé
// au serment). Cas de fermeture : source requise, exactement une cible, owner_id
// et champ inconnu rejetés, rapport enum + scope.
import {
  validateSermentLien,
  validateScenarioLien,
  SCENARIO_RAPPORTS,
} from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111'; // serment / scénario (source)
const U2 = '22222222-2222-4222-8222-222222222222'; // idéal / serment (cible)
const U3 = '33333333-3333-4333-8333-333333333333'; // page MAEDRETHNIR (cible)

// ===== serment_liens : serment → idéal XOR page =====
{
  const { value, error } = validateSermentLien({ serment_id: U1, ideal_id: U2 });
  verdicts.sermentVersIdeal = !error && value.serment_id === U1 && value.ideal_id === U2 && value.entree_id === undefined;
}
{
  const { value, error } = validateSermentLien({ serment_id: U1, entree_id: U3 });
  verdicts.sermentVersPage = !error && value.entree_id === U3 && value.ideal_id === undefined;
}
verdicts.sermentSansSource = !!validateSermentLien({ ideal_id: U2 }).error;
verdicts.sermentSourcePasUuid = !!validateSermentLien({ serment_id: 'x', ideal_id: U2 }).error;
verdicts.sermentSansCible = !!validateSermentLien({ serment_id: U1 }).error;         // 0 cible → refusé
verdicts.sermentDeuxCibles = !!validateSermentLien({ serment_id: U1, ideal_id: U2, entree_id: U3 }).error; // 2 → refusé
verdicts.sermentCiblePasUuid = !!validateSermentLien({ serment_id: U1, ideal_id: 'x' }).error;
verdicts.sermentRejetOwner = !!validateSermentLien({ serment_id: U1, ideal_id: U2, owner_id: U1 }).error;
verdicts.sermentRejetInconnu = !!validateSermentLien({ serment_id: U1, ideal_id: U2, talent_id: U3 }).error;

// ===== scenario_liens : scénario → serment XOR page, rapport réservé au serment =====
{
  const { value, error } = validateScenarioLien({ scenario_id: U1, serment_id: U2, rapport: 'menace' });
  verdicts.scenarioVersSerment = !error && value.scenario_id === U1 && value.serment_id === U2 && value.rapport === 'menace';
}
{
  const { value, error } = validateScenarioLien({ scenario_id: U1, serment_id: U2, rapport: 'sert' });
  verdicts.scenarioRapportSert = !error && value.rapport === 'sert';
}
{
  // vers une page : pas de rapport
  const { value, error } = validateScenarioLien({ scenario_id: U1, entree_id: U3 });
  verdicts.scenarioVersPage = !error && value.entree_id === U3 && value.rapport === undefined;
}
{
  // serment sans rapport = ok (rapport optionnel)
  const { value, error } = validateScenarioLien({ scenario_id: U1, serment_id: U2 });
  verdicts.scenarioSermentSansRapport = !error && value.serment_id === U2 && value.rapport === undefined;
}
verdicts.scenarioSansSource = !!validateScenarioLien({ serment_id: U2 }).error;
verdicts.scenarioSansCible = !!validateScenarioLien({ scenario_id: U1 }).error;
verdicts.scenarioDeuxCibles = !!validateScenarioLien({ scenario_id: U1, serment_id: U2, entree_id: U3 }).error;
verdicts.scenarioRapportSurPage = !!validateScenarioLien({ scenario_id: U1, entree_id: U3, rapport: 'menace' }).error; // rapport sans serment → refusé
verdicts.scenarioRapportInvalide = !!validateScenarioLien({ scenario_id: U1, serment_id: U2, rapport: 'aide' }).error;
verdicts.scenarioTousRapports = SCENARIO_RAPPORTS.every((r) =>
  !validateScenarioLien({ scenario_id: U1, serment_id: U2, rapport: r }).error);
verdicts.scenarioRejetOwner = !!validateScenarioLien({ scenario_id: U1, serment_id: U2, owner_id: U1 }).error;

// ===== Bilan =====
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-IMLADRIK-PASSERELLES OK' : 'UNIT-IMLADRIK-PASSERELLES ECHEC');
process.exit(ok ? 0 : 1);
