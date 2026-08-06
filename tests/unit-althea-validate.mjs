// Unitaires de la VALIDATION ALTHEA (Node pur, zéro réseau). 2026-08-06.
//
// Règle de la maison : **une validation s'éprouve par le REFUS**. Vérifier
// qu'un corps correct passe ne prouve presque rien ; ce qui protège Paul, c'est
// ce qui est rejeté. D'où l'ordre de ce fichier : les refus d'abord.
//
// Trois refus comptent plus que les autres, et chacun défend une règle du
// quadrant :
//   ① `tenu` absent ou non booléen est REFUSÉ — le troisième état du quadrant
//      est l'ABSENCE de relevé, pas un relevé vide. Laisser passer un `tenu`
//      indéfini, c'est laisser le silence entrer en base sous forme de faute.
//   ② un jour FUTUR est refusé — le compteur ne ment pas (règle ④).
//   ③ `owner_id` n'est même pas un champ acceptable — il est imposé par le
//      défaut base, jamais choisi par le client.

import { validateAltheaReleve, estJourLocalValide } from '../api/_lib/validate.js';

let echecs = 0;
let total = 0;
function verifier(nom, obtenu, attendu) {
  total += 1;
  const a = JSON.stringify(obtenu);
  const b = JSON.stringify(attendu);
  if (a !== b) {
    echecs += 1;
    console.error(`  ✗ ${nom}\n      attendu ${b}\n      obtenu  ${a}`);
  }
}
function refuse(nom, corps, mode = 'create', jour = '2026-08-06') {
  total += 1;
  const r = validateAltheaReleve(corps, mode, jour);
  if (!r.error) {
    echecs += 1;
    console.error(`  ✗ ${nom} — AURAIT DÛ ÊTRE REFUSÉ, a été accepté : ${JSON.stringify(r.value)}`);
  }
}
function accepte(nom, corps, mode = 'create', jour = '2026-08-06') {
  total += 1;
  const r = validateAltheaReleve(corps, mode, jour);
  if (r.error) {
    echecs += 1;
    console.error(`  ✗ ${nom} — refusé à tort : ${r.error}`);
  }
  return r.value;
}

const UUID = '11111111-2222-4333-8444-555555555555';
const base = () => ({ condition_id: UUID, jour: '2026-08-05', tenu: true });

// ─────────────────── 1. Les refus qui défendent les règles ───────────────────
console.log('1. Les refus — d’abord, parce que c’est eux qui protègent');

// ① Le silence ne doit jamais entrer en base déguisé en relevé.
refuse('tenu absent', { condition_id: UUID, jour: '2026-08-05' });
refuse('tenu à null', { condition_id: UUID, jour: '2026-08-05', tenu: null });
refuse('tenu en chaîne « true »', { condition_id: UUID, jour: '2026-08-05', tenu: 'true' });
refuse('tenu à 1', { condition_id: UUID, jour: '2026-08-05', tenu: 1 });
refuse('tenu à 0', { condition_id: UUID, jour: '2026-08-05', tenu: 0 });

// ② Le jour ne ment pas.
refuse('jour futur', { ...base(), jour: '2026-08-07' });
refuse('jour très futur', { ...base(), jour: '2030-01-01' });
refuse('jour absent', { condition_id: UUID, tenu: true });
refuse('jour au mauvais format', { ...base(), jour: '05/08/2026' });
refuse('jour inexistant (30 février)', { ...base(), jour: '2026-02-30' });
refuse('jour inexistant (31 avril)', { ...base(), jour: '2026-04-31' });
refuse('mois 13', { ...base(), jour: '2026-13-01' });
refuse('timestamp au lieu d’une date', { ...base(), jour: '2026-08-05T23:40:00Z' });

// ③ owner_id n'est pas un champ du client.
refuse('owner_id imposé par le client', { ...base(), owner_id: UUID });
refuse('id imposé par le client', { ...base(), id: UUID });
refuse('champ inventé', { ...base(), bonus: 12 });

// Le reste de la surface.
refuse('condition_id absent', { jour: '2026-08-05', tenu: true });
refuse('condition_id qui n’est pas un uuid', { ...base(), condition_id: 'c1' });
refuse('corps nul', null);
refuse('corps en tableau', [{ ...base() }]);
refuse('corps en chaîne', 'tenu');
refuse('quantité négative', { ...base(), quantite: -1 });
refuse('quantité en chaîne', { ...base(), quantite: '30' });
refuse('quantité infinie', { ...base(), quantite: Infinity });
refuse('quantité NaN', { ...base(), quantite: NaN });
refuse('quantité démesurée', { ...base(), quantite: 1e12 });
refuse('mot trop long', { ...base(), mot: 'x'.repeat(281) });
refuse('mot qui n’est pas du texte', { ...base(), mot: 42 });

// Un relevé ne se DÉPLACE pas : réécrire son jour, c'est réécrire le passé.
refuse('déplacer un relevé d’un jour à l’autre', { jour: '2026-08-04', tenu: true }, 'update');
refuse('changer la condition d’un relevé', { condition_id: UUID, tenu: true }, 'update');
refuse('mise à jour vide', {}, 'update');

// ─────────────────── 2. Ce qui doit passer ───────────────────
console.log('2. Ce qui passe — et exactement ce qui passe');

{
  const v = accepte('un relevé du jour', base());
  verifier('les trois champs, et rien d’autre', Object.keys(v).sort(),
    ['condition_id', 'jour', 'tenu']);
}
{
  const v = accepte('un manqué DÉCLARÉ', { ...base(), tenu: false });
  verifier('le refus assumé est bien enregistré', v.tenu, false);
}
{
  const v = accepte('avec une quantité', { ...base(), quantite: 6.2 });
  verifier('la quantité passe telle quelle', v.quantite, 6.2);
}
{
  const v = accepte('quantité à zéro (courir 0 km, c’est une information)',
    { ...base(), quantite: 0 });
  verifier('zéro n’est pas « absent »', v.quantite, 0);
}
{
  const v = accepte('effacer une quantité', { ...base(), quantite: null });
  verifier('null efface', v.quantite, null);
}
{
  const v = accepte('un mot court', { ...base(), mot: 'dur, mais tenu' });
  verifier('le mot passe', v.mot, 'dur, mais tenu');
}
accepte('le jour même', { ...base(), jour: '2026-08-06' });
accepte('un rattrapage de la semaine passée', { ...base(), jour: '2026-07-30' });
accepte('correction du seul état', { tenu: false }, 'update');

// ─────────────────── 3. Les dates locales ───────────────────
console.log('3. Les dates locales');
verifier('date réelle', estJourLocalValide('2026-08-06'), true);
verifier('29 février bissextile', estJourLocalValide('2024-02-29'), true);
verifier('29 février non bissextile', estJourLocalValide('2026-02-29'), false);
verifier('chaîne vide', estJourLocalValide(''), false);
verifier('undefined', estJourLocalValide(undefined), false);
verifier('objet Date refusé (on veut une chaîne locale)',
  estJourLocalValide(new Date()), false);

// Sans « aujourd'hui » fourni, on ne devine pas : la borne du futur ne
// s'applique que si l'appelant sait quel jour Paul vit.
{
  const r = validateAltheaReleve({ ...base(), jour: '2099-01-01' }, 'create', undefined);
  verifier('sans référence de jour, la borne du futur ne s’invente pas',
    Boolean(r.value), true);
}

console.log(`\nunit-althea-validate : ${total - echecs}/${total} assertions vertes`);
if (echecs > 0) {
  console.error(`${echecs} assertion(s) en échec`);
  process.exit(1);
}
