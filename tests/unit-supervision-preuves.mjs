// Supervision et réemploi — sas de matière (api/_lib/supervision-preuves.mjs).
// Recette du 31/10/2026 : « hallucination d'ID » et les défauts n° 2 et 3.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { indexerCatalogues, verifierMatiere, FRAICHEUR_MAX_MS } from '../api/_lib/supervision-preuves.mjs';
import { verifierForme } from '../zohshia/supervision-valeur/forme.mjs';
import { examinerProposition } from '../zohshia/supervision-valeur/supervision-valeur.mjs';
import zohReel from '../api/_lib/zohshia-technos.mjs';
import finubarReel from '../api/_lib/finubar-macro.mjs';
import { OUTILS_PAR_QUADRANT } from '../api/_lib/leo.js';

const JOUR = 86_400_000;
const zoh = { publie_le: '2026-10-29', technos: [{ id: 'alpha' }, { id: 'beta' }] };
const finubar = { projets: [
  { depot: 'Proprio/Depot-A', ok: true, mesure_le: '2026-10-30' },
  { depot: 'Proprio/Depot-B', ok: false, mesure_le: '2026-10-30' },   // collecte en échec
  { depot: 'Proprio/Depot-C', ok: true, mesure_le: 'hier' },          // date illisible
] };
const index = indexerCatalogues(zoh, finubar, ['proposer_fixture']);

const source = (id, obs = '2026-10-29T08:00:00Z') => ({ id, reference: 'Fiche', statut: 'mesure', dateLecture: '2026-10-31T09:00:00Z', dateObservation: obs });
const proposition = (extra = {}) => ({
  id: 'p1', objetId: 'zoh:alpha', recommandation: 'conserver', typeBenefice: 'indirect',
  besoin: 'b', beneficiaire: 'b', constat: 'c', consequence: 'c', alternativeMinimale: 'a', gainAttendu: 'g', preuveAttendue: 'p',
  sources: [source('zoh:alpha'), source('finubar:Proprio/Depot-A', '2026-10-30T08:00:00Z')],
  reexamen: { responsable: 'r', declencheur: 'd', criterePoursuite: 'p', critereArret: 'a' },
  ...extra,
});

// ── 0. Verrous de non-vacuité ───────────────────────────────────────────────
assert.equal(index.size, 4, 'index fixture : 2 technos + 1 dépôt valide + 1 outil');
assert.ok(!index.has('finubar:Proprio/Depot-B'), 'un dépôt en échec de collecte ne prouve rien');
assert.ok(!index.has('finubar:Proprio/Depot-C'), 'une date de mesure illisible ne prouve rien');
assert.throws(() => indexerCatalogues({}, {}, []), /aucun catalogue/);
assert.throws(() => indexerCatalogues({ publie_le: 'x', technos: [{ id: 'a' }] }, {}, []), /aucun catalogue/);
{ // les vrais catalogues versionnés sont lisibles et non vides
  const outils = [...new Set(Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name))];
  const reel = indexerCatalogues(zohReel, finubarReel, outils);
  const compte = (t) => [...reel.values()].filter((e) => e.type === t).length;
  assert.equal(compte('zoh'), zohReel.technos.length);
  assert.ok(compte('zoh') >= 6, 'catalogue ZOH vide ?');
  assert.ok(compte('finubar') >= 1, 'aucun dépôt Finubar indexé ?');
  assert.ok(compte('leo') >= 12, 'catalogue des outils de Léo vide ?');
  assert.ok(reel.has('zoh:renodevis') && reel.has('finubar:PaulGERARD161098/Ultima-') && reel.has('leo:proposer_contact'));
}

// ── 1. Le cas nominal : objet et preuves retrouvés ──────────────────────────
{
  const r = verifierMatiere(proposition(), index);
  assert.deepEqual(r, {
    valide: true, erreurs: [],
    preuvesIds: ['finubar:Proprio/Depot-A', 'zoh:alpha'],
    fraicheurMaxMsParSource: { 'zoh:alpha': FRAICHEUR_MAX_MS.zoh, 'finubar:Proprio/Depot-A': FRAICHEUR_MAX_MS.finubar },
  });
}
// Un outil de Léo est un objet admissible…
assert.equal(verifierMatiere(proposition({ objetId: 'leo:proposer_fixture' }), index).valide, true);
// …mais jamais une preuve (décision 1 : rien de ce que Léo produit ne prouve).
assert.deepEqual(verifierMatiere(proposition({ sources: [source('leo:proposer_fixture')] }), index).erreurs, ['/sources/0/id : type non admis comme preuve']);

// ── 2. Hallucination d'ID : refus par le CONTRÔLE, jamais par une exception ─
for (const faux of ['fake-uuid-123', '00000000-0000-0000-0000-000000000000', 'zoh:gamma', 'finubar:Proprio/Depot-Z', 'ZOH:alpha', 'zoh:', 'zoh:alpha ', 'zoh:../alpha', 'journal:42', '', null, 7, { id: 'zoh:alpha' }]) {
  let r;
  assert.doesNotThrow(() => { r = verifierMatiere(proposition({ sources: [source(faux)] }), index); }, String(faux));
  assert.equal(r.valide, false, `preuve inventée acceptée : ${JSON.stringify(faux)}`);
  assert.deepEqual(r.preuvesIds, [], 'aucune preuve transmise quand le sas refuse');
}
// Le format est verrouillé, pas seulement l'index : casse, espace, longueur.
for (const horsFormat of ['ZOH:alpha', 'zoh:al pha', `zoh:${'a'.repeat(129)}`]) {
  assert.deepEqual(verifierMatiere(proposition({ sources: [source(horsFormat)] }), index).erreurs,
    ['/sources/0/id : identifiant typé attendu (zoh: ou finubar:)'], horsFormat.slice(0, 20));
}
assert.equal(verifierMatiere(proposition({ objetId: `zoh:${'a'.repeat(128)}` }), index).erreurs[0], '/objetId : objet introuvable', '128 caractères : format admis');
assert.deepEqual(verifierMatiere(proposition({ objetId: 'zoh:gamma' }), index).erreurs, ['/objetId : objet introuvable']);
assert.deepEqual(verifierMatiere(proposition({ objetId: 'riven:contact-1' }), index).erreurs, ['/objetId : type d’objet inconnu']);
// Les dépendances et protections sont contrôlées comme les sources.
assert.deepEqual(verifierMatiere(proposition({ preuveDependancesId: 'zoh:gamma', preuveProtectionsId: 'leo:proposer_fixture' }), index).erreurs,
  ['/preuveDependancesId : preuve introuvable', '/preuveProtectionsId : type non admis comme preuve']);

// ── 3. Défaut n° 3 : une preuve répétée ne gonfle pas le dossier ────────────
assert.deepEqual(verifierMatiere(proposition({ sources: [source('zoh:alpha'), source('zoh:alpha')] }), index).erreurs, ['/sources/1/id : preuve répétée']);
// Dépendances = une source déjà citée : admis, compté une fois pour l'empreinte.
assert.deepEqual(verifierMatiere(proposition({ preuveDependancesId: 'zoh:alpha', preuveProtectionsId: 'zoh:beta' }), index).preuvesIds,
  ['finubar:Proprio/Depot-A', 'zoh:alpha', 'zoh:beta']);

// ── 4. Fraîcheur inventée : observer après la mesure est impossible ─────────
assert.deepEqual(verifierMatiere(proposition({ sources: [source('zoh:alpha', '2026-10-30T00:00:00Z')] }), index).erreurs,
  ['/sources/0/dateObservation : postérieure à la mesure de la source'], 'publié le 29 : observé le 30 = inventé');
assert.equal(verifierMatiere(proposition({ sources: [source('zoh:alpha', '2026-10-29T23:59:59Z')] }), index).valide, true, 'le jour même : admis');
assert.equal(verifierMatiere(proposition({ sources: [source('zoh:alpha', '2026-09-01T00:00:00Z')] }), index).valide, true, 'plus ancien : admis');

// ── 5. Les erreurs ne recopient pas l'identifiant reçu ──────────────────────
{
  const marque = 'zoh:identifiant-confidentiel';
  const r = verifierMatiere(proposition({ objetId: marque, sources: [source(marque)] }), index);
  assert.ok(r.erreurs.length === 2 && r.erreurs.every((e) => !e.includes('confidentiel')));
}

// ── 6. Les trois sas enchaînés, fraîcheur fournie par le SERVEUR ────────────
{
  const schema = JSON.parse(readFileSync(new URL('../zohshia/supervision-valeur/CONTRAT.schema.json', import.meta.url), 'utf8'));
  const p = proposition();
  assert.equal(verifierForme(p, schema).valide, true);
  const m = verifierMatiere(p, index);
  const contexte = { maintenant: '2026-10-31T12:00:00Z', fraicheurMaxMsParSource: m.fraicheurMaxMsParSource };
  assert.equal(examinerProposition(p, contexte).statut, 'presentable');
  // La même preuve Finubar, mesurée il y a 9 jours (> 7) : réserve, pas refus.
  const vieux = indexerCatalogues(zoh, { projets: [{ depot: 'Proprio/Depot-A', ok: true, mesure_le: '2026-10-22' }] }, []);
  const p2 = proposition({ sources: [source('finubar:Proprio/Depot-A', '2026-10-22T08:00:00Z')] });
  const m2 = verifierMatiere(p2, vieux);
  assert.equal(m2.valide, true);
  const r2 = examinerProposition(p2, { maintenant: '2026-10-31T12:00:00Z', fraicheurMaxMsParSource: m2.fraicheurMaxMsParSource });
  assert.equal(r2.statut, 'a_instruire');
  assert.deepEqual(r2.reserves, ['Périmée: finubar:Proprio/Depot-A']);
  assert.ok(9 * JOUR > FRAICHEUR_MAX_MS.finubar);
}

console.log('✓ supervision-preuves : sas de matière éprouvé');
