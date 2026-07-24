// Unitaires validation RESHIRAM → RIVEN (boucle ④, Node pur, zéro réseau).
// Parité API↔base : validateTalentRef reflète les FK/CHECK de
// supabase/migrations/0013_talent_refs_reseau.sql. Cas de fermeture :
// les deux UUID exigés, champ inconnu rejeté, owner_id jamais accepté,
// non-uuid refusé, pas de mode update (lien nu, rien de modifiable).
import { validateTalentRef } from '../api/_lib/validate.js';

const verdicts = {};
const T1 = '11111111-1111-4111-8111-111111111111'; // talent
const N1 = '22222222-2222-4222-8222-222222222222'; // fiche RIVEN (network_node)

// ---------- 1. Référence valide : talent_id + node_id ----------
{
  const { value, error } = validateTalentRef({ talent_id: T1, node_id: N1 });
  verdicts.createOk = !error && value.talent_id === T1 && value.node_id === N1;
}

// ---------- 2. Les deux UUID sont obligatoires ----------
verdicts.sansTalent = !!validateTalentRef({ node_id: N1 }).error;
verdicts.sansNode = !!validateTalentRef({ talent_id: T1 }).error;
verdicts.corpsVide = !!validateTalentRef({}).error;

// ---------- 3. UUID mal formés refusés (miroir FK, pas de requête aveugle) ----------
verdicts.talentPasUuid = !!validateTalentRef({ talent_id: 'pas-un-uuid', node_id: N1 }).error;
verdicts.nodePasUuid = !!validateTalentRef({ talent_id: T1, node_id: 'pas-un-uuid' }).error;

// ---------- 4. owner_id / champ inconnu jamais acceptés (owner_id = défaut base) ----------
verdicts.rejetOwnerId = !!validateTalentRef({ talent_id: T1, node_id: N1, owner_id: T1 }).error;
verdicts.rejetInconnu = !!validateTalentRef({ talent_id: T1, node_id: N1, secteur: 'CVC' }).error;
// nature/note (champs d'une passerelle) n'ont RIEN à faire ici : une référence est un lien nu.
verdicts.rejetNature = !!validateTalentRef({ talent_id: T1, node_id: N1, nature: 'acquis' }).error;

// ---------- 5. Corps non-objet refusé ----------
verdicts.rejetTableau = !!validateTalentRef([T1, N1]).error;
verdicts.rejetNull = !!validateTalentRef(null).error;

// ---------- 6. Aucune donnée de fiche recopiée : seuls les deux ids sortent ----------
{
  const { value } = validateTalentRef({ talent_id: T1, node_id: N1 });
  verdicts.sortieMinimale = value && Object.keys(value).length === 2 &&
    'talent_id' in value && 'node_id' in value;
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-RESHIRAM-RESEAU OK' : 'UNIT-RESHIRAM-RESEAU ECHEC');
process.exit(ok ? 0 : 1);
