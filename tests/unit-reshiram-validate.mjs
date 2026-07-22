// Unitaires validation RESHIRAM (Node pur, zéro réseau) : v1.
// Parité API↔base : les enums/bornes de validateTalent/validatePreuve reflètent
// les CHECK de supabase/migrations/0009_reshiram_talents.sql. Cas de fermeture :
// champ inconnu rejeté, owner_id jamais accepté, bornes respectées, niveau enum,
// secteurs (tableau borné, éléments non vides), talent_id = uuid.
import { validateTalent, validatePreuve, TALENT_NIVEAUX } from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Création talent valide (sectoriel multi-secteur) ----------
{
  const { value, error } = validateTalent(
    { nom: 'Sourcing d’artisans rapide', secteurs: ['CVC', 'cuisine', 'rénovation'], niveau: 'maitrise', plus_value: 'rapidité' },
    'create',
  );
  verdicts.createOk = !error && value.nom === 'Sourcing d’artisans rapide' &&
    Array.isArray(value.secteurs) && value.secteurs.length === 3 &&
    value.niveau === 'maitrise' && value.plus_value === 'rapidité';
}

// ---------- 2. Talent transversal : secteurs vide accepté ----------
{
  const { value, error } = validateTalent({ nom: 'Trancher les situations floues', secteurs: [] }, 'create');
  verdicts.transversalOk = !error && Array.isArray(value.secteurs) && value.secteurs.length === 0;
}

// ---------- 3. Nom obligatoire à la création ----------
verdicts.createSansNom = !!validateTalent({ secteurs: ['x'] }, 'create').error;
verdicts.nomVide = !!validateTalent({ nom: '   ' }, 'create').error;
verdicts.nomTropLong = !!validateTalent({ nom: 'x'.repeat(201) }, 'create').error;

// ---------- 4. owner_id / id / champ inconnu jamais acceptés ----------
verdicts.rejetOwnerId = !!validateTalent({ nom: 'X', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateTalent({ nom: 'X', couleur: 'or' }, 'create').error;

// ---------- 5. niveau : enum strict (miroir CHECK) ----------
verdicts.niveauInvalide = !!validateTalent({ nom: 'X', niveau: 'expert' }, 'create').error;
verdicts.tousNiveaux = TALENT_NIVEAUX.every((n) =>
  !validateTalent({ nom: 'X', niveau: n }, 'create').error);

// ---------- 6. secteurs : bornes (cardinalité ≤ 20, élément non vide/borné, tableau) ----------
verdicts.secteursPasTableau = !!validateTalent({ nom: 'X', secteurs: 'CVC' }, 'create').error;
verdicts.secteursTropNombreux = !!validateTalent(
  { nom: 'X', secteurs: Array.from({ length: 21 }, (_, i) => 's' + i) }, 'create').error;
verdicts.secteurVide = !!validateTalent({ nom: 'X', secteurs: ['CVC', '  '] }, 'create').error;
verdicts.secteurTropLong = !!validateTalent({ nom: 'X', secteurs: ['x'.repeat(121)] }, 'create').error;
verdicts.secteurNonTexte = !!validateTalent({ nom: 'X', secteurs: ['CVC', 42] }, 'create').error;

// ---------- 7. plus_value : nullable, bornée ----------
{
  const { value, error } = validateTalent({ nom: 'X', plus_value: null }, 'create');
  verdicts.plusValueNull = !error && value.plus_value === null;
}
verdicts.plusValueTropLongue = !!validateTalent({ nom: 'X', plus_value: 'x'.repeat(2001) }, 'create').error;

// ---------- 8. Update : partiel autorisé, vide refusé ----------
verdicts.updatePartiel = !validateTalent({ niveau: 'pratique' }, 'update').error;
verdicts.updateVide = !!validateTalent({}, 'update').error;

// ---------- 9. Preuve : valide, talent_id uuid exigé, contenu borné ----------
{
  const { value, error } = validatePreuve({ talent_id: U1, contenu: '3 artisans trouvés en 48 h' }, 'create');
  verdicts.preuveOk = !error && value.talent_id === U1 && value.contenu === '3 artisans trouvés en 48 h';
}
verdicts.preuveSansTalent = !!validatePreuve({ contenu: 'un fait' }, 'create').error;
verdicts.preuveTalentPasUuid = !!validatePreuve({ talent_id: 'pas-un-uuid', contenu: 'un fait' }, 'create').error;
verdicts.preuveContenuVide = !!validatePreuve({ talent_id: U1, contenu: '   ' }, 'create').error;
verdicts.preuveContenuTropLong = !!validatePreuve({ talent_id: U1, contenu: 'x'.repeat(2001) }, 'create').error;
verdicts.preuveChampInconnu = !!validatePreuve({ talent_id: U1, contenu: 'ok', owner_id: U1 }, 'create').error;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-RESHIRAM-VALIDATE OK' : 'UNIT-RESHIRAM-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
