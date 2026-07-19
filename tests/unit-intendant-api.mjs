// Unitaires API INTENDANT (Node pur, zéro réseau) : AD-5c-γ.
// Parité API↔base : les enums/bornes/cohérences de validateChantierIntendant /
// validateBesoinIntendant reflètent les CHECK de 0008_intendant.sql. Plus la
// logique pure des alertes J-2 (computeAlertesJ2). Cas de fermeture : champ
// inconnu rejeté, `etat` (colonne générée) jamais accepté, cohérence commande,
// contrôle-sans-livraison refusé, fenêtre d'alerte [today, today+2].
import {
  validateChantierIntendant,
  validateBesoinIntendant,
  INTENDANT_MODES,
  INTENDANT_CONTROLES,
} from '../api/_lib/validate.js';
import { computeAlertesJ2 } from '../api/_lib/intendant.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';

// Décalage de jours par rapport à un pivot fixe (déterminisme total du test).
const TODAY = '2026-07-19';
function jour(offset) {
  const base = Date.UTC(2026, 6, 19) + offset * 86_400_000;
  return new Date(base).toISOString().slice(0, 10);
}

// ---------- CHANTIER : création ----------
{
  const { value, error } = validateChantierIntendant({ node_id: U1 }, 'create');
  verdicts.chantierCreateOk = !error && value.node_id === U1 && !('date_pose' in value);
}
{
  const { value, error } = validateChantierIntendant({ node_id: U1, date_pose: '2026-08-01' }, 'create');
  verdicts.chantierCreateAvecDate = !error && value.date_pose === '2026-08-01';
}
verdicts.chantierSansNode = !!validateChantierIntendant({}, 'create').error;
verdicts.chantierNodeInvalide = !!validateChantierIntendant({ node_id: 'pas-un-uuid' }, 'create').error;
verdicts.chantierDateInvalide = !!validateChantierIntendant({ node_id: U1, date_pose: '2026-13-40' }, 'create').error;
verdicts.chantierRejetOwnerId = !!validateChantierIntendant({ node_id: U1, owner_id: U1 }, 'create').error;
verdicts.chantierRejetInconnu = !!validateChantierIntendant({ node_id: U1, couleur: 'or' }, 'create').error;

// ---------- CHANTIER : mise à jour ----------
verdicts.chantierUpdateDate = !validateChantierIntendant({ date_pose: '2026-08-01' }, 'update').error;
{
  const { value, error } = validateChantierIntendant({ date_pose: null }, 'update');
  verdicts.chantierUpdateNullEfface = !error && value.date_pose === null;
}
verdicts.chantierUpdateVide = !!validateChantierIntendant({}, 'update').error;
verdicts.chantierUpdateNodeRefuse = !!validateChantierIntendant({ node_id: U2 }, 'update').error;

// ---------- BESOIN : création (obligatoires + bornes) ----------
{
  const { value, error } = validateBesoinIntendant({ chantier_id: U1, designation: 'Aile de recouvrement' }, 'create');
  verdicts.besoinCreateOk = !error && value.chantier_id === U1 && value.designation === 'Aile de recouvrement';
}
verdicts.besoinSansChantier = !!validateBesoinIntendant({ designation: 'x' }, 'create').error;
verdicts.besoinSansDesignation = !!validateBesoinIntendant({ chantier_id: U1 }, 'create').error;
verdicts.besoinDesignationVide = !!validateBesoinIntendant({ chantier_id: U1, designation: '   ' }, 'create').error;
verdicts.besoinDesignationTropLongue = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x'.repeat(201) }, 'create').error;
verdicts.besoinDesignation200Ok = !validateBesoinIntendant({ chantier_id: U1, designation: 'x'.repeat(200) }, 'create').error;

// ---------- BESOIN : quantité (mirror CHECK quantite > 0) ----------
verdicts.besoinQuantiteZero = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', quantite: 0 }, 'create').error;
verdicts.besoinQuantiteNegative = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', quantite: -3 }, 'create').error;
verdicts.besoinQuantiteNonNum = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', quantite: '2' }, 'create').error;
verdicts.besoinQuantiteOk = !validateBesoinIntendant({ chantier_id: U1, designation: 'x', quantite: 2.5 }, 'create').error;

// ---------- BESOIN : bornes texte + énums ----------
verdicts.besoinUniteTropLongue = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', unite: 'x'.repeat(21) }, 'create').error;
verdicts.besoinReferenceTropLongue = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', reference: 'x'.repeat(121) }, 'create').error;
verdicts.besoinModeInvalide = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'zzz' }, 'create').error;
verdicts.besoinControleInvalide = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', controle: 'zzz' }, 'create').error;
verdicts.besoinTousModes = INTENDANT_MODES.every((m) =>
  !validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: m }, 'create').error);
// Les 3 contrôles existent comme énum ; leur validité dépend de la cohérence
// (conforme/casse exigent mode commande + livraison), testée séparément ci-dessous.
verdicts.controlesEnumConnus = INTENDANT_CONTROLES.length === 3 && INTENDANT_CONTROLES.includes('en_attente');

// ---------- BESOIN : `etat` (colonne générée) + champ inconnu refusés ----------
verdicts.besoinEtatRefuse = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', etat: 'couvert' }, 'create').error;
verdicts.besoinRejetInconnu = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', foo: 1 }, 'create').error;
verdicts.besoinRejetOwnerId = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', owner_id: U1 }, 'create').error;

// ---------- BESOIN : cohérence commande (mirror CHECK) ----------
verdicts.besoinCommandeHorsMode = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'stock', commande_ref: 'BC-1' }, 'create').error;
verdicts.besoinFournisseurHorsMode = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'aucune', fournisseur_node_id: U2 }, 'create').error;
verdicts.besoinCommandeOk = !validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', commande_ref: 'BC-1', fournisseur_node_id: U2 }, 'create').error;

// ---------- BESOIN : contrôle exige livraison (mirror CHECK) ----------
verdicts.besoinControleSansLivraison = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', controle: 'conforme' }, 'create').error;
{
  const { error } = validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', livree_le: '2026-08-01', controle: 'conforme' }, 'create');
  verdicts.besoinControleConformeOk = !error;
}
{
  const { error } = validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', livree_le: '2026-08-01', controle: 'casse' }, 'create');
  verdicts.besoinControleCasseOk = !error;
}
verdicts.besoinLivreeInvalide = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', livree_le: 'pas-une-date' }, 'create').error;
verdicts.besoinFournisseurUuidInvalide = !!validateBesoinIntendant({ chantier_id: U1, designation: 'x', mode: 'commande', fournisseur_node_id: 'zzz' }, 'create').error;

// ---------- BESOIN : mise à jour (geste clé contrôle + couverture) ----------
{
  // Geste clé du contrôle réception : PATCH { controle } seul (ligne déjà livrée
  // en base) — la livraison n'est pas re-soumise → autorisé (déféré à la base).
  const { value, error } = validateBesoinIntendant({ controle: 'conforme' }, 'update');
  verdicts.besoinUpdateControle = !error && value.controle === 'conforme';
}
verdicts.besoinUpdateControleLivreeNulleRefuse = !!validateBesoinIntendant({ controle: 'conforme', livree_le: null }, 'update').error;
verdicts.besoinUpdateMode = !validateBesoinIntendant({ mode: 'stock' }, 'update').error;
{
  const { value, error } = validateBesoinIntendant({ unite: null }, 'update');
  verdicts.besoinUpdateNullEfface = !error && value.unite === null;
}
verdicts.besoinUpdateVide = !!validateBesoinIntendant({}, 'update').error;

// ---------- ALERTES J-2 (logique pure) ----------
const chManquantJ1 = { id: 'c1', node_id: U1, date_pose: jour(1) };
const chManquantJ3 = { id: 'c2', node_id: U2, date_pose: jour(3) };
const chCouvertJ1 = { id: 'c3', node_id: U1, date_pose: jour(1) };
const chSansDate = { id: 'c4', node_id: U2, date_pose: null };
const bManquant = (cid) => ({ chantier_id: cid, etat: 'manquant' });
const bCouvert = (cid) => ({ chantier_id: cid, etat: 'couvert' });

// manquant à J-1 (pose demain) → alerte.
{
  const a = computeAlertesJ2([chManquantJ1], [bManquant('c1')], TODAY);
  verdicts.alerteManquantProche = a.length === 1 && a[0].chantier_id === 'c1' && a[0].manquants === 1;
}
// manquant à J+3 (pose dans 3 jours) → hors fenêtre, pas d'alerte.
verdicts.alerteManquantLointain = computeAlertesJ2([chManquantJ3], [bManquant('c2')], TODAY).length === 0;
// couvert à J-1 → pas d'alerte (aucun manquant).
verdicts.alerteCouvertProche = computeAlertesJ2([chCouvertJ1], [bCouvert('c3')], TODAY).length === 0;
// date_pose null → jamais d'alerte.
verdicts.alerteDateNulle = computeAlertesJ2([chSansDate], [bManquant('c4')], TODAY).length === 0;
// Bornes de la fenêtre : J (aujourd'hui) et J+2 inclus, J+3 exclu.
verdicts.alerteBorneJ0 = computeAlertesJ2([{ id: 'x', node_id: U1, date_pose: jour(0) }], [bManquant('x')], TODAY).length === 1;
verdicts.alerteBorneJ2 = computeAlertesJ2([{ id: 'y', node_id: U1, date_pose: jour(2) }], [bManquant('y')], TODAY).length === 1;
verdicts.alerteBorneJ3Exclu = computeAlertesJ2([{ id: 'z', node_id: U1, date_pose: jour(3) }], [bManquant('z')], TODAY).length === 0;
// Compte des manquants (métrique preuve de valeur) + couverts ignorés.
{
  const a = computeAlertesJ2([chManquantJ1], [bManquant('c1'), bManquant('c1'), bCouvert('c1')], TODAY);
  verdicts.alerteCompteManquants = a.length === 1 && a[0].manquants === 2;
}
// Pose passée (hier) → hors fenêtre (spec stricte [today, today+2]).
verdicts.alertePosePassee = computeAlertesJ2([{ id: 'p', node_id: U1, date_pose: jour(-1) }], [bManquant('p')], TODAY).length === 0;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const total = Object.keys(verdicts).length;
const passes = Object.values(verdicts).filter((v) => v === true).length;
console.log(`${passes}/${total} verdicts`);
const okAll = passes === total;
console.log(okAll ? 'UNIT-INTENDANT-API OK' : 'UNIT-INTENDANT-API ECHEC');
process.exit(okAll ? 0 : 1);
