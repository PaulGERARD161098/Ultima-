// Node pur : projection réellement raccordée au prompt, sans modèle ni réseau.
import assert from 'node:assert/strict';
import stock from '../api/_lib/zohshia-technos.mjs';
import { decrireStockZoh, MAX_STOCK_ZOH_CHARS } from '../api/_lib/leo-zohshia.mjs';
import { construireSysteme, outilsPour } from '../api/_lib/leo.js';

const projection = decrireStockZoh();
const catalogue = JSON.parse(projection);
assert.ok(stock.technos.length > 0, 'verrou : catalogue source non vide');
assert.equal(catalogue.couverture, 'complete');
assert.equal(catalogue.date_publication, stock.publie_le);
assert.deepEqual(catalogue.technos.map(t => t.id), stock.technos.map(t => t.id));
for (const [i, t] of catalogue.technos.entries()) {
  assert.equal(t.nom, stock.technos[i].badge);
  assert.equal(t.etat_declare, stock.technos[i].etat);
  assert.deepEqual(t.onglets, stock.technos[i].onglets.map(o => o.titre));
  assert.equal(t.fiche, 'zohshia.html#' + t.id);
  assert.deepEqual(Object.keys(t), ['id','nom','etat_declare','capacites_apercu','onglets','fiche']);
  assert.ok(t.capacites_apercu?.texte.length > 0, 'capacités issues de la fiche publiée');
}
assert.ok(projection.length <= MAX_STOCK_ZOH_CHARS);
const fixture = { id: 'nouvelle-brique', badge: 'Essai fictif', etat: 'À éprouver',
  onglets: [{ titre: 'Capacités', blocs: [
    { t: 'p', r: [['Une capacité fictive venant de la source.', '']] },
    { t: 'code', texte: 'CONTENU_PRIVE_INTERDIT' }
  ] }],
  secret: 'SECRET_INTERDIT' };
const futur = JSON.parse(decrireStockZoh({ publie_le: '2026-10-25', technos: [...stock.technos, fixture] }));
assert.equal(futur.couverture, 'complete');
assert.equal(futur.technos.at(-1).id, 'nouvelle-brique', 'une nouvelle techno entre sans modifier Léo');
assert.equal(futur.technos.at(-1).capacites_apercu.texte, 'Une capacité fictive venant de la source.');
assert.ok(!JSON.stringify(futur).includes('INTERDIT'), 'ni guides complets ni champs supplémentaires dans le prompt');
const doublon = JSON.parse(decrireStockZoh({ technos: [fixture, fixture] }));
assert.equal(doublon.couverture, 'partielle');
assert.equal(doublon.nombre_declare, 2);
assert.equal(doublon.technos.length, 1);
for (const source of [null, {}, { technos: 'absent' }]) {
  const c = JSON.parse(decrireStockZoh(source));
  assert.equal(c.couverture, 'indisponible');
  assert.equal(c.nombre_declare, null);
}
const incomplet = JSON.parse(decrireStockZoh({ technos: [fixture, { ...fixture, id: '../invalide' }] }));
assert.equal(incomplet.couverture, 'partielle');
assert.equal(incomplet.technos.length, 1);
const sansResume = JSON.parse(decrireStockZoh({ technos: [{ ...fixture, onglets: [{ titre: 'Plan' }] }] }));
assert.equal(sansResume.technos[0].capacites_apercu, null, 'pas de capacité inventée si la source ne la décrit pas');
const borneResume = JSON.parse(decrireStockZoh({ technos: [{ ...fixture,
  onglets: [{ titre: 'Capacités', blocs: [{ t: 'p', r: [['A'.repeat(1200), '']] }] }]
}] }));
assert.equal(borneResume.technos[0].capacites_apercu.texte.length, 900);
assert.equal(borneResume.technos[0].capacites_apercu.tronque, true);
const volumineux = decrireStockZoh({ technos: Array.from({ length: 100 }, (_, i) => ({
  ...fixture, id: 'brique-' + i, badge: 'X'.repeat(200), etat: 'E'.repeat(240)
})) });
assert.ok(volumineux.length <= MAX_STOCK_ZOH_CHARS);
assert.equal(JSON.parse(volumineux).couverture, 'partielle');
assert.equal(JSON.parse(volumineux).nombre_declare, 100);

for (const q of ['ultima','riven','bcp','adramelech','imladrik','finubar']) {
  const outilsAvant = JSON.stringify(outilsPour(q));
  for (const avecOutils of [false, true]) {
    const prompt = construireSysteme(q, avecOutils);
    assert.ok(prompt.includes('catalogue_zoh_non_autoritatif=' + projection), q);
    assert.ok(prompt.includes('AVANT de proposer un développement'), q);
    assert.ok(prompt.includes('pas une lecture en direct du dépôt'), q);
    assert.ok(prompt.includes('adéquation est conditionnelle'), q);
    assert.ok(prompt.includes('ni invoquer leurs compétences'), q);
    assert.ok(prompt.includes('jamais « rien en stock »'), q);
    assert.ok(prompt.includes('aucun droit ni outil supplémentaire'), q);
    assert.ok(!prompt.includes('CONTENU_PRIVE_INTERDIT'));
  }
  assert.equal(JSON.stringify(outilsPour(q)), outilsAvant, 'la consultation ne modifie pas les outils');
}
assert.equal(construireSysteme('inconnu'), null);
console.log('UNIT-LEO-ZOHSHIA OK : catalogue vivant, projection bornée, cas incomplets et six quadrants raccordés');
