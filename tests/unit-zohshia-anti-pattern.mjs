import assert from 'node:assert/strict';
import { controler } from '../zohshia/anti-pattern/collecter.mjs';
import { construire } from '../zohshia/publier.mjs';
const observation = { source: 'fixture locale', constat: 'résultat fictif observé', statut: 'mesuré' };
const dossier = {
  typeSujet: 'tache', complexe: false, resultat: 'résultat fictif', critere: 'concordance des contrôles', tolerance: 'aucun écart accepté pour cette fixture',
  dependancesCommunes: 'les entrées restent communes', limites: 'sources fictives',
  approches: [
    { methode: 'calcul direct', differenceUtile: 'décomposition', observations: [observation] },
    { methode: 'contrôle inverse', differenceUtile: 'invariant', observations: [observation] },
  ], comparaison: { statut: 'convergence', preuve: 'rapprochement fictif' },
};
let n = 0;
const verifier = (d, attendu) => { assert.equal(controler(d).ok, attendu); n++; };
verifier(dossier, true);
verifier(null, false);
verifier({}, false);
verifier({ ...dossier, approches: [dossier.approches[0]] }, false);
verifier({ ...dossier, approches: dossier.approches.map(a => ({ ...a, methode: 'CALCUL DIRECT ' })) }, false);
verifier({ ...dossier, approches: dossier.approches.map(a => ({ ...a, observations: [] })) }, false);
verifier({ ...dossier, comparaison: { statut: 'ecart-ouvert', preuve: 'écart observé' } }, false);
verifier({ ...dossier, comparaison: { statut: 'ecart-resolu', preuve: 'écart observé' } }, false);
verifier({ ...dossier, comparaison: { statut: 'ecart-resolu', preuve: 'nouveau rapprochement', resolution: 'convention clarifiée' } }, true);
verifier({ ...dossier, approches: dossier.approches.map(a => ({ ...a, observations: [{...observation, statut: 'non vérifié'}] })) }, false);
verifier({ ...dossier, approches: dossier.approches.map(a => ({ ...a, observations: {} })) }, false);
const approches = [...dossier.approches,
  { methode: 'référence distincte', differenceUtile: 'observation externe', observations: [observation] },
  { methode: 'scénario défavorable', differenceUtile: 'risques', observations: [observation] }];
verifier({ ...dossier, complexe: true }, false);
verifier({ ...dossier, complexe: true, approches: approches.slice(0, 3) }, true);
verifier({ ...dossier, typeSujet: 'plan', approches: approches.slice(0, 3) }, false);
verifier({ ...dossier, typeSujet: 'plan', approches }, true);
verifier({ ...dossier, typeSujet: 'retroplanning', complexe: true, approches: approches.slice(0, 3) }, false);
verifier({ ...dossier, typeSujet: 'retroplanning', complexe: true, approches }, true);
verifier({ ...dossier, typeSujet: 'inconnu', approches }, false);
verifier({ ...dossier, complexe: undefined }, false);
const catalogue = JSON.parse((await import('node:fs')).readFileSync(new URL('../zohshia/anti-pattern/points-de-vue.json', import.meta.url), 'utf8'));
assert.equal(catalogue.points_de_vue.length, 100);
for (const champ of ['id', 'alias', 'nom', 'question']) assert.equal(new Set(catalogue.points_de_vue.map(p => p[champ])).size, 100);
assert.equal(new Set(catalogue.points_de_vue.map(p => p.famille)).size, 10);
for (const point of catalogue.points_de_vue) for (const champ of ['id', 'alias', 'nom', 'question', 'preuve', 'limite']) assert.ok(point[champ]?.trim());
console.log('Catalogue : 100 fiches non vides, identifiants et alias uniques, 10 familles.');
const { generer } = await import('../zohshia/anti-pattern/publier-leo.mjs');
const { INDEX_POINTS_DE_VUE, EMPREINTE_CATALOGUE } = await import('../api/_lib/leo-points-de-vue.mjs');
const { createHash } = await import('node:crypto');
const { readFileSync } = await import('node:fs');
const sourceCatalogue = readFileSync(new URL('../zohshia/anti-pattern/points-de-vue.json', import.meta.url), 'utf8');
assert.equal(EMPREINTE_CATALOGUE, createHash('sha256').update(sourceCatalogue).digest('hex'));
assert.equal(generer(), readFileSync(new URL('../api/_lib/leo-points-de-vue.mjs', import.meta.url), 'utf8'));
assert.ok(catalogue.points_de_vue.every(p => INDEX_POINTS_DE_VUE.includes(p.id + ' ' + p.alias + ' : ' + p.question)));
const fiche = construire().technos.find(t => t.id === 'anti-pattern');
assert.ok(fiche); assert.equal(fiche.onglets.length, 3); assert.ok(fiche.onglets.every(o => o.blocs.length >= 3));
console.log(`${n} cas structurels et 3 onglets non vides vérifiés ; aucune certification métier.`);
