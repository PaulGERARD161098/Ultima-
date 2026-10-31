// Supervision et réemploi — la chaîne serveur (api/_lib/supervision.mjs), de
// l'appel d'outil à plat jusqu'à la fonction SQL, exécutée sur PGlite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';
import { ARGS_SUPERVISION, validerArgs, decouperPreuves, construireProposition, preparerSoumission } from '../api/_lib/supervision.mjs';
import { indexerCatalogues } from '../api/_lib/supervision-preuves.mjs';
import schemaGenere from '../api/_lib/supervision-contrat.mjs';

const lire = (c) => readFileSync(new URL(c, import.meta.url), 'utf8');

// ── 0. Les copies déployables sont celles de la techno neutre ───────────────
{
  const r = spawnSync(process.execPath, [new URL('../zohshia/supervision-valeur/publier.mjs', import.meta.url).pathname, '--verifier'], { encoding: 'utf8' });
  assert.equal(r.status, 0, `copies périmées : ${r.stderr}`);
  assert.deepEqual(schemaGenere, JSON.parse(lire('../zohshia/supervision-valeur/CONTRAT.schema.json')));
  for (const [copie, source] of [['supervision-forme.mjs', 'forme.mjs'], ['supervision-juge.mjs', 'supervision-valeur.mjs']]) {
    const c = lire(`../api/_lib/${copie}`);
    assert.ok(c.startsWith('// GÉNÉRÉ'), copie);
    assert.ok(c.endsWith(lire(`../zohshia/supervision-valeur/${source}`)), `${copie} diverge de ${source}`);
  }
}
// Les noms d'arguments couvrent tout le contrat, sauf ce que le serveur pose.
{
  const poses = new Set(['id', 'sources', 'transfertDonnees', 'reexamen']);
  const attendus = Object.keys(schemaGenere.properties).filter((k) => !poses.has(k)).length + 1 /* preuves */ + 4 /* réexamen */;
  assert.equal(Object.keys(ARGS_SUPERVISION).length, attendus);
}

const MAINTENANT = Date.parse('2026-10-31T12:00:00Z');
const index = indexerCatalogues(
  { publie_le: '2026-10-29', technos: [{ id: 'alpha' }, { id: 'beta' }] },
  { projets: [{ depot: 'P/Frais', ok: true, mesure_le: '2026-10-30' }, { depot: 'P/Vieux', ok: true, mesure_le: '2026-10-18' }] },
  ['proposer_fixture']);
const tirer = () => '00000000-0000-4000-8000-000000000001';
const args = (extra = {}) => ({
  objet: 'zoh:alpha', recommandation: 'conserver', type_benefice: 'indirect',
  besoin: 'Besoin', beneficiaire: 'Paul', constat: 'Constat', consequence: 'Conséquence',
  alternative_minimale: 'Ne rien changer', gain_attendu: 'Gain', preuve_attendue: 'Mesure',
  preuves: 'zoh:alpha, finubar:P/Frais',
  reexamen_responsable: 'Paul', reexamen_declencheur: 'Mensuel', critere_poursuite: 'Usage', critere_arret: 'Aucun usage',
  ...extra,
});
const preparer = (a, o = {}) => preparerSoumission(a, { index, maintenant: MAINTENANT, tirer, ...o });

// ── 1. Nominal : le serveur pose ce qui se mesure ───────────────────────────
{
  const r = preparer(args());
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.proposition.id, 'sup-00000000-0000-4000-8000-000000000001');
  assert.deepEqual(r.proposition.sources.map((s) => [s.id, s.statut, s.dateObservation, s.dateLecture]), [
    ['zoh:alpha', 'mesure', '2026-10-29T00:00:00.000Z', '2026-10-31T12:00:00.000Z'],
    ['finubar:P/Frais', 'mesure', '2026-10-30T00:00:00.000Z', '2026-10-31T12:00:00.000Z'],
  ]);
  assert.deepEqual(r.rpc.p_preuves, ['finubar:P/Frais', 'zoh:alpha']);
  assert.equal(r.rpc.p_objet_id, 'zoh:alpha');
  assert.equal(r.rpc.p_proposition, r.proposition);
  assert.equal('transfertDonnees' in r.proposition, false);
}
assert.deepEqual(decouperPreuves(' zoh:a ;finubar:b,  zoh:c\n'), ['zoh:a', 'finubar:b', 'zoh:c']);

// ── 2. Léo ne peut rien déclarer de ce que le serveur pose ──────────────────
for (const intrus of ['statut', 'dateObservation', 'date_observation', 'id', 'transfertDonnees', 'transfert_donnees', 'executionAutorisee', '__proto__', 'constructor']) {
  const brut = JSON.parse(JSON.stringify(args()).replace('{', `{"${intrus}":"x",`));
  const r = preparer(brut);
  assert.equal(r.ok, false, `champ ${intrus} accepté`);
  assert.equal(r.etape, 'arguments');
}
{ // types et bornes
  assert.deepEqual(preparer(args({ besoin: 42 })).erreurs, ['/besoin : texte attendu']);
  assert.deepEqual(preparer(args({ besoin: 'x'.repeat(601) })).erreurs, ['/besoin : texte trop long']);
  assert.deepEqual(preparer(args({ recommandation: 'supprimer' })).erreurs, ['/recommandation : valeur hors liste']);
  assert.deepEqual(preparer(args({ constat: '   ' })).erreurs, ['/constat : requis']);
  assert.equal(validerArgs(null).ok, false);
  assert.equal(validerArgs([]).ok, false);
}
// Chaque argument requis est exigé.
for (const [cle, spec] of Object.entries(ARGS_SUPERVISION)) {
  if (!spec.requis) continue;
  const a = args(); delete a[cle];
  assert.deepEqual(preparer(a).erreurs, [`/${cle} : requis`], cle);
}

// ── 3. Les sas s'enchaînent, chacun à sa place ──────────────────────────────
assert.equal(preparer(args({ preuves: 'fake-uuid-123' })).etape, 'matiere');
assert.equal(preparer(args({ preuves: 'zoh:gamma' })).etape, 'matiere');
assert.equal(preparer(args({ preuves: 'zoh:alpha zoh:alpha' })).etape, 'matiere');
assert.equal(preparer(args({ preuves: 'leo:proposer_fixture' })).etape, 'matiere');
assert.equal(preparer(args({ objet: 'riven:contact' })).etape, 'matiere');
assert.equal(preparer(args({ preuves: Array.from({ length: 21 }, (_, i) => `zoh:p${i}`).join(' ') })).etape, 'forme');
{ // suspendre sans dossier de retrait : refus du juge, et il dit pourquoi
  const r = preparer(args({ recommandation: 'suspendre' }));
  assert.equal(r.etape, 'logique');
  assert.equal(r.statut, 'a_completer');
  assert.ok(r.erreurs.includes('Contrefactuel requis.') && r.erreurs.includes('Réversibilité requise.'));
  const complet = preparer(args({ recommandation: 'suspendre', contrefactuel: 'Sans elle : rien ne manque', preuve_dependances: 'zoh:beta', preuve_protections: 'zoh:alpha', retour_arriere: 'Réactiver' }));
  assert.equal(complet.ok, true, JSON.stringify(complet));
  assert.deepEqual(complet.rpc.p_preuves, ['finubar:P/Frais', 'zoh:alpha', 'zoh:beta']);
}
{ // mutualiser : le serveur pose transfertDonnees à false ; la compatibilité reste exigée
  assert.ok(preparer(args({ recommandation: 'mutualiser' })).erreurs.includes('Compatibilité non étayée.'));
  const r = preparer(args({ recommandation: 'mutualiser', capacite_commune: 'c', compatibilite_verifiee: 'v' }));
  assert.equal(r.ok, true);
  assert.equal(r.proposition.transfertDonnees, false);
}
{ // preuve périmée (mesurée il y a 13 jours, 7 admis) : rendue avec sa réserve, pas enregistrée
  const r = preparer(args({ preuves: 'zoh:alpha finubar:P/Vieux' }));
  assert.equal(r.ok, false);
  assert.equal(r.statut, 'a_instruire');
  assert.deepEqual(r.reserves, ['Périmée: finubar:P/Vieux']);
  assert.equal(r.rpc, undefined);
}
assert.throws(() => preparerSoumission(args(), {}), /index des preuves requis/);
{ // l'horloge en nombre est convertie : le piège n° 1 ne peut pas revenir par ici
  assert.equal(preparerSoumission(args(), { index, maintenant: MAINTENANT, tirer }).ok, true);
}

// ── 4. De bout en bout : la sortie de la chaîne est acceptée par la base ────
{
  const db = new PGlite();
  await db.exec(lire('./fixtures/leo-appels-bootstrap.sql'));
  await db.exec(lire('../supabase/migrations/20261031150000_supervision_decisions.sql'));
  await db.exec('set role authenticated');
  await db.query("select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false)");
  const soumettre = async (rpc) => (await db.query('select public.supervision_soumettre($1,$2,$3,$4,$5) as r',
    [rpc.p_proposition_id, rpc.p_objet_id, rpc.p_recommandation, rpc.p_preuves, JSON.stringify(rpc.p_proposition)])).rows[0].r;
  const r1 = await soumettre(preparer(args()).rpc);
  assert.equal(r1.resultat, 'inseree');
  // Même dossier, nouvel identifiant tiré : même empreinte → déjà en attente.
  const r2 = await soumettre(preparerSoumission(args(), { index, maintenant: MAINTENANT }).rpc);
  assert.equal(r2.resultat, 'deja_en_attente');
  assert.equal(r2.id, r1.id);
  // La retenue d'une preuve de dépendance change l'empreinte.
  const r3 = await soumettre(preparer(args({ recommandation: 'suspendre', contrefactuel: 'c', preuve_dependances: 'zoh:beta', preuve_protections: 'zoh:alpha', retour_arriere: 'r' })).rpc);
  assert.equal(r3.resultat, 'inseree');
}

console.log('✓ supervision-chaine : arguments, trois sas et base éprouvés bout à bout');
