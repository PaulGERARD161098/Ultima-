// Unitaires validation ADRAMELECH (Node pur, zéro réseau) : AD-4b.
// Parité API↔base : les enums/bornes de validateIdee/validateLien reflètent
// les CHECK de supabase/migrations/0007_idees.sql. Cas de fermeture :
// champ inconnu rejeté, owner_id jamais accepté, bornes respectées.
import { validateIdee, validateLien, IDEE_STATUTS } from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';

// ---------- 1. Création valide ----------
{
  const { value, error } = validateIdee(
    { adr_num: 5, nom: 'GLANEUR', type: 'business', theme: 'bâtiment · logistique', statut: 'à raffiner' },
    'create',
  );
  verdicts.createOk = !error && value.adr_num === 5 && value.nom === 'GLANEUR' &&
    value.type === 'business' && value.statut === 'à raffiner';
}

// ---------- 2. Création : champs obligatoires manquants ----------
verdicts.createSansNum = !!validateIdee({ nom: 'X', type: 'business' }, 'create').error;
verdicts.createSansNom = !!validateIdee({ adr_num: 1, type: 'business' }, 'create').error;
verdicts.createSansType = !!validateIdee({ adr_num: 1, nom: 'X' }, 'create').error;

// ---------- 3. owner_id / id jamais acceptés (champ inconnu rejeté) ----------
verdicts.rejetOwnerId = !!validateIdee({ adr_num: 1, nom: 'X', type: 't', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateIdee({ adr_num: 1, nom: 'X', type: 't', couleur: 'or' }, 'create').error;

// ---------- 4. Bornes (miroir CHECK) ----------
verdicts.numZero = !!validateIdee({ adr_num: 0, nom: 'X', type: 't' }, 'create').error;
verdicts.nomTropLong = !!validateIdee({ adr_num: 1, nom: 'x'.repeat(121), type: 't' }, 'create').error;
verdicts.typeTropLong = !!validateIdee({ adr_num: 1, nom: 'X', type: 'x'.repeat(61) }, 'create').error;
verdicts.typeVide = !!validateIdee({ adr_num: 1, nom: 'X', type: '' }, 'create').error;
verdicts.statutInvalide = !!validateIdee({ adr_num: 1, nom: 'X', type: 't', statut: 'zzz' }, 'create').error;
verdicts.essenceTropLongue = !!validateIdee({ adr_num: 1, nom: 'X', type: 't', essence: 'x'.repeat(2001) }, 'create').error;

// ---------- 5. Statuts : les 4 valeurs de la migration passent ----------
verdicts.tousStatuts = IDEE_STATUTS.every((s) =>
  !validateIdee({ adr_num: 1, nom: 'X', type: 't', statut: s }, 'create').error);

// ---------- 6. Update : partiel autorisé, vide refusé, null efface ----------
verdicts.updatePartiel = !validateIdee({ statut: 'exploitable' }, 'update').error;
verdicts.updateVide = !!validateIdee({}, 'update').error;
{
  const { value, error } = validateIdee({ partenaire: null }, 'update');
  verdicts.updateNullEfface = !error && value.partenaire === null;
}

// ---------- 7. Liens : paire valide, self-loop refusé, UUID exigés ----------
{
  const { value, error } = validateLien({ source_id: U1, target_id: U2 });
  verdicts.lienOk = !error && value.source_id === U1 && value.target_id === U2;
}
verdicts.lienSelfLoop = !!validateLien({ source_id: U1, target_id: U1 }).error;
verdicts.lienUuidInvalide = !!validateLien({ source_id: 'pas-un-uuid', target_id: U2 }).error;
verdicts.lienChampInconnu = !!validateLien({ source_id: U1, target_id: U2, owner_id: U1 }).error;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-IDEES-VALIDATE OK' : 'UNIT-IDEES-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
