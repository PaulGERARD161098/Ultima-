import assert from 'node:assert/strict';
import { controler } from '../zohshia/anti-pattern/collecter.mjs';
import { construire } from '../zohshia/publier.mjs';
const observation = { source: 'fixture locale', constat: 'résultat fictif observé', statut: 'mesuré' };
const dossier = {
  resultat: 'résultat fictif', critere: 'concordance des contrôles', tolerance: 'aucun écart accepté pour cette fixture',
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
const fiche = construire().technos.find(t => t.id === 'anti-pattern');
assert.ok(fiche); assert.equal(fiche.onglets.length, 3); assert.ok(fiche.onglets.every(o => o.blocs.length >= 3));
console.log(`${n} cas structurels et 3 onglets non vides vérifiés ; aucune certification métier.`);
