// Supervision et réemploi — sas de forme (forme.mjs) et de logique
// (supervision-valeur.mjs), recette du 31/10/2026, exécutée et non relue.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { verifierForme, estDateHeure, SchemaNonPrisEnCharge } from '../zohshia/supervision-valeur/forme.mjs';
import { examinerProposition } from '../zohshia/supervision-valeur/supervision-valeur.mjs';

const lire = (f) => readFileSync(new URL(`../zohshia/supervision-valeur/${f}`, import.meta.url), 'utf8');
const sha = (t) => createHash('sha256').update(t).digest('hex');
const schema = JSON.parse(lire('CONTRAT.schema.json'));
const cloner = (o) => JSON.parse(JSON.stringify(o));

// ── 0. Le contrat et le juge sont ceux reçus, octet pour octet ──────────────
assert.equal(sha(lire('CONTRAT.schema.json')), '07172e5eb8200ac53464c9b77f0f2a9c4df20aa198e5ade8fee54706f041f650', 'contrat modifié');
assert.equal(sha(lire('supervision-valeur.mjs')), '98b8afb4dfe6d0cfd82a25afe52ef53644f6050c1493d4bef0ef4be0242b4d89', 'juge modifié');

// Verrou de non-vacuité : un schéma vide accepterait tout.
assert.equal(schema.required.length, 13);
assert.equal(Object.keys(schema.properties).length, 20);
assert.equal(schema.additionalProperties, false);

const MAINTENANT = '2026-10-31T12:00:00Z';
const JOUR = 86_400_000;
const valide = () => ({
  id: 'prop-1',
  objetId: 'zoh:fixture',
  recommandation: 'conserver',
  typeBenefice: 'indirect',
  besoin: 'Besoin fictif',
  beneficiaire: 'Responsable fictif',
  constat: 'Constat fictif',
  consequence: 'Conséquence fictive',
  alternativeMinimale: 'Ne rien changer',
  gainAttendu: 'Gain fictif',
  preuveAttendue: 'Preuve fictive',
  sources: [{ id: 'zoh:fixture', reference: 'Fiche fictive', statut: 'mesure', dateLecture: '2026-10-31T10:00:00Z', dateObservation: '2026-10-30T10:00:00Z' }],
  reexamen: { responsable: 'Responsable', declencheur: 'Mensuel', criterePoursuite: 'Gain constaté', critereArret: 'Aucun usage' },
});
const contexte = { maintenant: MAINTENANT, fraicheurMaxMsParSource: { 'zoh:fixture': 7 * JOUR } };
const forme = (p) => verifierForme(p, schema);

// ── 1. La proposition de référence passe les deux sas ───────────────────────
assert.deepEqual(forme(valide()), { valide: true, erreurs: [] });
assert.equal(examinerProposition(valide(), contexte).statut, 'presentable');
assert.equal(examinerProposition(valide(), contexte).executionAutorisee, false);

// ── 2. Le piège du guide reçu : Date.now() est un nombre → tout est refusé ──
// Défaut n° 1. L'hôte DOIT passer une date ISO ; ce test rougit si le juge
// changeait de comportement sans que l'hôte le sache.
const piege = examinerProposition(valide(), { ...contexte, maintenant: Date.now() });
assert.equal(piege.statut, 'a_completer');
assert.match(piege.erreurs[0], /Date contrôle/);
assert.equal(examinerProposition(valide(), { ...contexte, maintenant: new Date(MAINTENANT).toISOString() }).statut, 'presentable');

// ── 3. Adversité : rejet contrôlé, jamais d'exception ───────────────────────
for (const hostile of [null, undefined, 42, 'texte', [], [valide()]]) {
  const r = forme(hostile);
  assert.equal(r.valide, false, `entrée hostile acceptée : ${typeof hostile}`);
}
{ // source null / undefined dans la liste
  const p = valide(); p.sources = [null];
  assert.equal(forme(p).valide, false);
  assert.ok(forme(p).erreurs.some((e) => e.startsWith('/sources/0 : type object')));
  assert.equal(examinerProposition(p, contexte).statut, 'a_completer');
}
{ // champ non prévu, y compris __proto__ venu d'un JSON
  const p = JSON.parse(JSON.stringify(valide()).replace('{', '{"__proto__":{"admin":true},"executionAutorisee":true,'));
  const r = forme(p);
  assert.equal(r.valide, false);
  assert.ok(r.erreurs.includes('/__proto__ : champ non prévu'));
  assert.ok(r.erreurs.includes('/executionAutorisee : champ non prévu'));
}
{ // champ non prévu dans une source et dans le réexamen
  const p = valide(); p.sources[0].confiance = 'totale'; p.reexamen.auto = true;
  const r = forme(p);
  assert.ok(r.erreurs.includes('/sources/0/confiance : champ non prévu'));
  assert.ok(r.erreurs.includes('/reexamen/auto : champ non prévu'));
}
{ // mutualisation sauvage : transfertDonnees true refusé par les deux sas
  const p = { ...valide(), recommandation: 'mutualiser', capaciteCommune: 'c', compatibiliteVerifiee: 'v', transfertDonnees: true };
  assert.ok(forme(p).erreurs.includes('/transfertDonnees : valeur imposée non respectée'));
  assert.ok(examinerProposition(p, contexte).erreurs.includes('Transfert données interdit.'));
}
{ // type faux : un booléen en texte, un texte en booléen
  const p = { ...valide(), besoin: true, transfertDonnees: 'false' };
  const r = forme(p);
  assert.ok(r.erreurs.includes('/besoin : type string attendu'));
  assert.ok(r.erreurs.includes('/transfertDonnees : type boolean attendu'));
}
{ // valeurs hors liste
  const p = valide(); p.recommandation = 'supprimer'; p.sources[0].statut = 'certain';
  const r = forme(p);
  assert.ok(r.erreurs.includes('/recommandation : valeur hors liste'));
  assert.ok(r.erreurs.includes('/sources/0/statut : valeur hors liste'));
}
{ // aucune source
  const p = { ...valide(), sources: [] };
  assert.ok(forme(p).erreurs.includes('/sources : liste trop courte'));
}

// Chaque champ requis, retiré un par un, est exigé (racine, source, réexamen).
for (const champ of schema.required) {
  const p = valide(); delete p[champ];
  assert.ok(forme(p).erreurs.includes(`/${champ} : requis`), `requis non exigé : ${champ}`);
}
for (const champ of schema.properties.sources.items.required) {
  const p = valide(); delete p.sources[0][champ];
  assert.ok(forme(p).erreurs.includes(`/sources/0/${champ} : requis`), `requis non exigé : source.${champ}`);
}
for (const champ of schema.properties.reexamen.required) {
  const p = valide(); delete p.reexamen[champ];
  assert.ok(forme(p).erreurs.includes(`/reexamen/${champ} : requis`), `requis non exigé : reexamen.${champ}`);
}
// Chaque texte requis vide est refusé.
for (const champ of ['id', 'objetId', 'besoin', 'beneficiaire', 'constat', 'consequence', 'alternativeMinimale', 'gainAttendu', 'preuveAttendue']) {
  assert.ok(forme({ ...valide(), [champ]: '' }).erreurs.includes(`/${champ} : texte trop court`), `vide accepté : ${champ}`);
}

// ── 4. Dates : RFC 3339 réelle, pas une chaîne que Date.parse « devine » ────
for (const ok of ['2026-10-31T12:00:00Z', '2026-10-31T12:00:00.123Z', '2026-10-31T12:00:00+01:00', '2024-02-29T00:00:00Z']) {
  assert.equal(estDateHeure(ok), true, ok);
}
for (const ko of ['2026-02-30T00:00:00Z', '2026-13-01T00:00:00Z', '2026-10-31', '31/10/2026', '2026-10-31 12:00:00Z', '2026-10-31T24:00:00Z', '2026-10-31T12:00:00', '2026-10-31T12:00:00+25:00', 1793452347381, '']) {
  assert.equal(estDateHeure(ko), false, String(ko));
}
{
  const p = valide(); p.sources[0].dateObservation = '2026-02-30T00:00:00Z';
  assert.ok(forme(p).erreurs.includes('/sources/0/dateObservation : date-heure RFC 3339 attendue'));
}

// ── 5. Chronologie et fraîcheur (recette §2) ────────────────────────────────
{ // voyage dans le temps : observation future
  const p = valide(); p.sources[0].dateObservation = '2026-11-02T00:00:00Z'; p.sources[0].dateLecture = '2026-11-03T00:00:00Z';
  assert.equal(forme(p).valide, true, 'la forme ne juge pas la chronologie');
  assert.ok(examinerProposition(p, contexte).erreurs.includes('Chronologie future/inversée.'));
}
{ // lecture antérieure à l'observation
  const p = valide(); p.sources[0].dateLecture = '2026-10-29T00:00:00Z';
  assert.ok(examinerProposition(p, contexte).erreurs.includes('Chronologie future/inversée.'));
}
{ // preuve périmée : 15 jours pour 7 autorisés → réserve, pas erreur
  const p = valide(); p.sources[0].dateObservation = '2026-10-16T12:00:00Z';
  const r = examinerProposition(p, contexte);
  assert.equal(r.statut, 'a_instruire');
  assert.deepEqual(r.reserves, ['Périmée: zoh:fixture']);
}
{ // fraîcheur non fournie par l'hôte → réserve
  const r = examinerProposition(valide(), { maintenant: MAINTENANT });
  assert.equal(r.statut, 'a_instruire');
  assert.deepEqual(r.reserves, ['Fraîcheur NC: zoh:fixture']);
}
{ // source déclarée, pas mesurée → réserve
  const p = valide(); p.sources[0].statut = 'declare';
  assert.deepEqual(examinerProposition(p, contexte).reserves, ['Non mesurée: zoh:fixture']);
}

// ── 6. Preuves exigées par la recommandation ────────────────────────────────
for (const rec of ['suspendre', 'proposer_retrait']) {
  const r = examinerProposition({ ...valide(), recommandation: rec }, contexte);
  assert.equal(r.statut, 'a_completer');
  for (const e of ['Contrefactuel requis.', 'ID preuve dépendances manquant.', 'ID preuve protections manquant.', 'Réversibilité requise.']) {
    assert.ok(r.erreurs.includes(e), `${rec} : ${e}`);
  }
  const complet = { ...valide(), recommandation: rec, contrefactuel: 'c', preuveDependancesId: 'zoh:dep', preuveProtectionsId: 'zoh:prot', retourArriere: 'r' };
  assert.equal(examinerProposition(complet, contexte).statut, 'presentable');
}
{
  const r = examinerProposition({ ...valide(), recommandation: 'mutualiser' }, contexte);
  assert.ok(r.erreurs.includes('Compatibilité non étayée.'));
  assert.ok(r.erreurs.includes('Transfert données interdit.'), 'transfertDonnees absent doit être refusé');
}

// ── 7. Limites d'hôte : une entrée hostile ne coûte pas cher ────────────────
assert.deepEqual(forme({ ...valide(), besoin: 'x'.repeat(40000) }), { valide: false, erreurs: ['/ : charge trop lourde'] });
assert.ok(forme({ ...valide(), besoin: 'x'.repeat(4001) }).erreurs.includes('/besoin : texte trop long'));
{
  const p = valide(); p.sources = Array.from({ length: 21 }, () => cloner(valide().sources[0]));
  assert.ok(forme(p).erreurs.includes('/sources : liste trop longue'));
}
{ // un objet circulaire n'est pas une proposition et ne fait pas tomber le sas
  const p = valide(); p.boucle = p;
  assert.deepEqual(forme(p), { valide: false, erreurs: ['/ : non sérialisable'] });
}
{ // les erreurs ne recopient jamais une VALEUR reçue (seuls chemin et raison)
  const secret = 'donnee-metier-confidentielle';
  const p = valide(); p.recommandation = secret; p.besoin = 7; p.sources[0].dateLecture = secret;
  const r = forme(p);
  assert.equal(r.erreurs.length, 3);
  assert.ok(r.erreurs.every((e) => !e.includes(secret)), 'valeur recopiée dans une erreur');
}

// ── 8. Mode strict : un schéma hors sous-ensemble lève, il ne passe pas ─────
for (const intrus of [{ pattern: '^a' }, { type: 'integer' }, { format: 'email', type: 'string' }, { additionalProperties: true }, { oneOf: [] }]) {
  assert.throws(() => verifierForme('a', intrus), SchemaNonPrisEnCharge, JSON.stringify(intrus));
}

console.log('✓ supervision-valeur : sas de forme et de logique éprouvés');
