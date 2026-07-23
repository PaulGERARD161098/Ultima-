// Unitaires validation ZEKROM (Node pur, zéro réseau) : v1. Miroir de
// unit-reshiram-validate.mjs. Parité API↔base : les enums/bornes de
// validateIdeal/validateDirection reflètent les CHECK de
// supabase/migrations/0010_zekrom_ideaux.sql. Cas de fermeture : champ inconnu
// rejeté, owner_id jamais accepté, bornes respectées, registre enum, ideal_id = uuid.
import {
  validateIdeal,
  validateDirection,
  validatePasserelle,
  IDEAL_REGISTRES,
  PASSERELLE_NATURES,
} from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Création idéal valide (projet + horizon) ----------
{
  const { value, error } = validateIdeal(
    { intitule: 'Prendre soin du domaine du moulin', registre: 'projet', horizon: 'enraciner, transmettre' },
    'create',
  );
  verdicts.createOk = !error && value.intitule === 'Prendre soin du domaine du moulin' &&
    value.registre === 'projet' && value.horizon === 'enraciner, transmettre';
}

// ---------- 2. Idéal minimal : registre par défaut côté base, horizon absent ----------
{
  const { value, error } = validateIdeal({ intitule: 'Partir avec une femme aimée' }, 'create');
  verdicts.minimalOk = !error && value.intitule === 'Partir avec une femme aimée' &&
    value.registre === undefined && value.horizon === undefined;
}

// ---------- 3. Intitulé obligatoire à la création ----------
verdicts.createSansIntitule = !!validateIdeal({ registre: 'vision' }, 'create').error;
verdicts.intituleVide = !!validateIdeal({ intitule: '   ' }, 'create').error;
verdicts.intituleTropLong = !!validateIdeal({ intitule: 'x'.repeat(201) }, 'create').error;

// ---------- 4. owner_id / id / champ inconnu jamais acceptés ----------
verdicts.rejetOwnerId = !!validateIdeal({ intitule: 'X', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateIdeal({ intitule: 'X', couleur: 'or' }, 'create').error;

// ---------- 5. registre : enum strict (miroir CHECK) ----------
verdicts.registreInvalide = !!validateIdeal({ intitule: 'X', registre: 'utopie' }, 'create').error;
verdicts.tousRegistres = IDEAL_REGISTRES.every((r) =>
  !validateIdeal({ intitule: 'X', registre: r }, 'create').error);

// ---------- 6. horizon : nullable, bornée ----------
{
  const { value, error } = validateIdeal({ intitule: 'X', horizon: null }, 'create');
  verdicts.horizonNull = !error && value.horizon === null;
}
verdicts.horizonTropLong = !!validateIdeal({ intitule: 'X', horizon: 'x'.repeat(2001) }, 'create').error;

// ---------- 7. Update : partiel autorisé, vide refusé ----------
verdicts.updatePartiel = !validateIdeal({ registre: 'volonte' }, 'update').error;
verdicts.updateVide = !!validateIdeal({}, 'update').error;

// ---------- 8. Direction : valide, ideal_id uuid exigé, formulation bornée ----------
{
  const { value, error } = validateDirection({ ideal_id: U1, formulation: 'restaurer et entretenir le domaine' }, 'create');
  verdicts.directionOk = !error && value.ideal_id === U1 && value.formulation === 'restaurer et entretenir le domaine';
}
verdicts.directionSansIdeal = !!validateDirection({ formulation: 'un cap' }, 'create').error;
verdicts.directionIdealPasUuid = !!validateDirection({ ideal_id: 'pas-un-uuid', formulation: 'un cap' }, 'create').error;
verdicts.directionFormulationVide = !!validateDirection({ ideal_id: U1, formulation: '   ' }, 'create').error;
verdicts.directionFormulationTropLongue = !!validateDirection({ ideal_id: U1, formulation: 'x'.repeat(2001) }, 'create').error;
verdicts.directionChampInconnu = !!validateDirection({ ideal_id: U1, formulation: 'ok', owner_id: U1 }, 'create').error;

// ---------- 9. Passerelle R↔Z (LV2-③) : lien idéal ↔ talent ----------
const U2 = '22222222-2222-4222-8222-222222222222';
{
  const { value, error } = validatePasserelle(
    { ideal_id: U1, talent_id: U2, nature: 'acquis', note: 'délai court' }, 'create');
  verdicts.passerelleOk = !error && value.ideal_id === U1 && value.talent_id === U2 &&
    value.nature === 'acquis' && value.note === 'délai court';
}
// create : ideal_id + talent_id (uuid) + nature imposés
verdicts.passerelleSansIdeal = !!validatePasserelle({ talent_id: U2, nature: 'acquis' }, 'create').error;
verdicts.passerelleSansTalent = !!validatePasserelle({ ideal_id: U1, nature: 'acquis' }, 'create').error;
verdicts.passerelleIdealPasUuid = !!validatePasserelle({ ideal_id: 'x', talent_id: U2, nature: 'acquis' }, 'create').error;
verdicts.passerelleSansNature = !!validatePasserelle({ ideal_id: U1, talent_id: U2 }, 'create').error;
verdicts.passerelleNatureInvalide = !!validatePasserelle({ ideal_id: U1, talent_id: U2, nature: 'peut-etre' }, 'create').error;
verdicts.passerelleToutesNatures = PASSERELLE_NATURES.every((n) =>
  !validatePasserelle({ ideal_id: U1, talent_id: U2, nature: n }, 'create').error);
// owner_id / champ inconnu rejetés
verdicts.passerelleRejetOwner = !!validatePasserelle({ ideal_id: U1, talent_id: U2, nature: 'acquis', owner_id: U1 }, 'create').error;
// note : nullable, bornée
{
  const { value, error } = validatePasserelle({ ideal_id: U1, talent_id: U2, nature: 'acquis', note: null }, 'create');
  verdicts.passerelleNoteNull = !error && value.note === null;
}
verdicts.passerelleNoteTropLongue = !!validatePasserelle(
  { ideal_id: U1, talent_id: U2, nature: 'acquis', note: 'x'.repeat(2001) }, 'create').error;
// update : nature/note seulement ; les FK sont figées (rejetées en update)
verdicts.passerelleUpdateNature = !validatePasserelle({ nature: 'a_construire' }, 'update').error;
verdicts.passerelleUpdateFkRejetee = !!validatePasserelle({ ideal_id: U1 }, 'update').error;
verdicts.passerelleUpdateVide = !!validatePasserelle({}, 'update').error;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-ZEKROM-VALIDATE OK' : 'UNIT-ZEKROM-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
