// Unitaires validation VRANESH (Node pur, zéro réseau) : v1. Miroir de
// unit-draukhain-validate.mjs. Parité API↔base : les bornes/enum de
// validateSituation/validateScenario reflètent les CHECK de
// supabase/migrations/0017_vranesh_situations.sql. Cas de fermeture : champ
// inconnu rejeté, owner_id jamais accepté, bornes respectées, vraisemblance
// enum, situation_id = uuid.
import {
  validateSituation,
  validateScenario,
  SCENARIO_VRAISEMBLANCES,
} from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Création situation valide (le cas + contexte) ----------
{
  const { value, error } = validateSituation(
    { intitule: 'Un client hésite à signer', contexte: 'devis envoyé, silence depuis 10 jours' },
    'create',
  );
  verdicts.createOk = !error && value.intitule === 'Un client hésite à signer' &&
    value.contexte === 'devis envoyé, silence depuis 10 jours';
}

// ---------- 2. Situation minimale : contexte absent ----------
{
  const { value, error } = validateSituation({ intitule: 'Un imprévu de chantier' }, 'create');
  verdicts.minimalOk = !error && value.intitule === 'Un imprévu de chantier' && value.contexte === undefined;
}

// ---------- 3. Intitulé obligatoire à la création ----------
verdicts.createSansIntitule = !!validateSituation({ contexte: 'x' }, 'create').error;
verdicts.intituleVide = !!validateSituation({ intitule: '   ' }, 'create').error;
verdicts.intituleTropLong = !!validateSituation({ intitule: 'x'.repeat(201) }, 'create').error;

// ---------- 4. owner_id / champ inconnu jamais acceptés ----------
verdicts.rejetOwnerId = !!validateSituation({ intitule: 'X', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateSituation({ intitule: 'X', couleur: 'or' }, 'create').error;

// ---------- 5. contexte : nullable, borné ----------
{
  const { value, error } = validateSituation({ intitule: 'X', contexte: null }, 'create');
  verdicts.contexteNull = !error && value.contexte === null;
}
verdicts.contexteTropLong = !!validateSituation({ intitule: 'X', contexte: 'x'.repeat(2001) }, 'create').error;

// ---------- 6. Update : partiel autorisé, vide refusé ----------
verdicts.updatePartiel = !validateSituation({ contexte: 'nouveau détail' }, 'update').error;
verdicts.updateVide = !!validateSituation({}, 'update').error;

// ---------- 7. Scénario : valide (déroulé + vraisemblance + signaux + parade) ----------
{
  const { value, error } = validateScenario(
    { situation_id: U1, deroule: 'il signe avec un concurrent', vraisemblance: 'faible',
      signaux: 'il ne répond plus au téléphone', parade: 'relancer par un appel court dès demain' },
    'create',
  );
  verdicts.scenarioOk = !error && value.situation_id === U1 &&
    value.deroule === 'il signe avec un concurrent' && value.vraisemblance === 'faible' &&
    value.signaux === 'il ne répond plus au téléphone' &&
    value.parade === 'relancer par un appel court dès demain';
}
// vraisemblance optionnelle (défaut base 'moyenne') → absente = ok ; signaux/parade absents = ok
{
  const { value, error } = validateScenario({ situation_id: U1, deroule: 'il finit par signer' }, 'create');
  verdicts.scenarioMinimalOk = !error && value.vraisemblance === undefined &&
    value.signaux === undefined && value.parade === undefined;
}
verdicts.scenarioSansSituation = !!validateScenario({ deroule: 'un futur' }, 'create').error;
verdicts.scenarioSituationPasUuid = !!validateScenario({ situation_id: 'x', deroule: 'un futur' }, 'create').error;
verdicts.scenarioDerouleVide = !!validateScenario({ situation_id: U1, deroule: '   ' }, 'create').error;
verdicts.scenarioDerouleTropLong = !!validateScenario({ situation_id: U1, deroule: 'x'.repeat(2001) }, 'create').error;
verdicts.scenarioVraisemblanceInvalide = !!validateScenario({ situation_id: U1, deroule: 'ok', vraisemblance: 'certaine' }, 'create').error;
verdicts.scenarioToutesVraisemblances = SCENARIO_VRAISEMBLANCES.every((v) =>
  !validateScenario({ situation_id: U1, deroule: 'ok', vraisemblance: v }, 'create').error);
verdicts.scenarioParadeTropLongue = !!validateScenario({ situation_id: U1, deroule: 'ok', parade: 'x'.repeat(2001) }, 'create').error;
{
  const { value, error } = validateScenario({ situation_id: U1, deroule: 'ok', signaux: null, parade: null }, 'create');
  verdicts.scenarioSignauxNull = !error && value.signaux === null && value.parade === null;
}
verdicts.scenarioChampInconnu = !!validateScenario({ situation_id: U1, deroule: 'ok', owner_id: U1 }, 'create').error;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-VRANESH-VALIDATE OK' : 'UNIT-VRANESH-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
