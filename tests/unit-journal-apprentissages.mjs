// Consultation et intégrité du journal, sans réseau ni données clients.
import assert from 'node:assert/strict';
import { lire, valider, rechercher } from '../outils/journal-apprentissages/consulter.mjs';
import { collecter } from '../zohshia/journal-apprentissages/collecter.mjs';
import { construire } from '../zohshia/publier.mjs';
import { readFileSync } from 'node:fs';
import { estCheminPrive } from '../middleware.js';

const contenu = lire();
let n = 0;
const verifier = (nom, fn) => { fn(); n++; console.log(`✓ ${nom}`); };
const fixture = () => structuredClone(contenu.journal);
verifier('le journal initial contient des observations et une couverture incomplète explicite', () => {
  assert.equal(contenu.journal.entrees.length, 4);
  assert.ok(contenu.journal.couverture.manquantes.length > 0);
  assert.ok(contenu.journal.entrees.every(e => e.lecon_canonique === null));
});
verifier('une recherche retrouve le problème d’accès avec ses limites et sources', () => {
  const r = rechercher(contenu, 'accès lecture fichier');
  assert.equal(r.observations[0].entree.id, 'JA-20261011-001');
  assert.ok(r.observations[0].entree.sources.length && r.observations[0].entree.limites.length);
});
verifier('une recherche retrouve le problème de reprise', () => {
  assert.equal(rechercher(contenu, 'webhook durable interruption').observations[0].entree.id, 'JA-20261011-003');
});
verifier('un journal vide échoue', () => { const j = fixture(); j.entrees = []; assert.throws(() => valider(j, contenu.lecons), /vide/); });
verifier('des identifiants dupliqués échouent', () => { const j = fixture(); j.entrees[1].id = j.entrees[0].id; assert.throws(() => valider(j, contenu.lecons), /dupliqué/); });
verifier('une clôture sans couverture échoue', () => { const j = fixture(); delete j.couverture; assert.throws(() => valider(j, contenu.lecons), /Couverture/); });
verifier('une observation sans preuve échoue', () => { const j = fixture(); j.entrees[0].sources = []; assert.throws(() => valider(j, contenu.lecons), /incomplète/); });
verifier('une règle adoptée sans source canonique échoue', () => { const j = fixture(); j.entrees[0].statut = 'relie_a_une_lecon'; assert.throws(() => valider(j, contenu.lecons), /canonique/); });
verifier('une référence canonique inventée échoue', () => {
  const j = fixture(); j.entrees[0].statut = 'relie_a_une_lecon';
  j.entrees[0].lecon_canonique = { chemin: 'memoire/LECONS.md', titre: 'TITRE DE LEÇON ABSENT DE LA SOURCE' };
  assert.throws(() => valider(j, contenu.lecons), /canonique/);
});
verifier('une observation retirée n’est pas proposée par la recherche', () => {
  const j = fixture(); j.entrees[0].statut = 'retire';
  assert.ok(!rechercher({ journal: j, lecons: contenu.lecons }, 'accès').observations.some(e => e.entree.id === j.entrees[0].id));
});
verifier('une recherche vide échoue plutôt que prétendre une absence de cas', () => { assert.throws(() => rechercher(contenu, '!?'), /Décrire/); });
verifier('les déclarations et instructions mémorisées restent du texte', () => {
  const j = fixture(); j.entrees[0].constat = 'globalThis.__journal_execution_interdite = true';
  valider(j, contenu.lecons); rechercher({ journal: j, lecons: contenu.lecons }, 'accès');
  assert.equal(globalThis.__journal_execution_interdite, undefined);
});
verifier('une collecte inaccessible annonce les pièces manquantes', () => {
  const inv = collecter('/chemin-fictif-inexistant-journal');
  assert.equal(inv.complet, false); assert.equal(inv.automatique, 'non_recu');
  assert.ok(inv.sources.every(s => s.etat === 'non_accessible'));
});
verifier('la collecte réelle mesure les pièces mais ne publie pas les incidents', () => {
  const inv = collecter(); assert.equal(inv.complet, true);
  assert.ok(inv.sources.every(s => /^[0-9a-f]{64}$/.test(s.sha256)));
  assert.ok(!JSON.stringify(inv).includes(contenu.journal.entrees[0].constat));
});
verifier('le badge expose un plan de préparation sans le journal privé', () => {
  const donnee = construire(); const t = donnee.technos.find(t => t.id === 'journal-apprentissages');
  assert.equal(t.badge, 'Journal d’apprentissages');
  assert.equal(t.etat, 'Préparé — raccordement automatique non activé');
  assert.equal(t.onglets.length, 3); assert.ok(t.onglets.every(o => o.blocs.length >= 3));
  assert.ok(!JSON.stringify(donnee).includes('JA-20261011-001'));
  assert.ok(!JSON.stringify(donnee).includes(contenu.journal.entrees[0].constat));
});
verifier('la mémoire et la consultation restent hors des fichiers servis et du déploiement', () => {
  const ignore = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8');
  for (const prefixe of ['memoire', 'outils', 'zohshia']) assert.ok(new RegExp(`^${prefixe}/$`, 'm').test(ignore));
  for (const chemin of ['/memoire/JOURNAL-APPRENTISSAGES.json', '/outils/journal-apprentissages/consulter.mjs', '/zohshia/journal-apprentissages/inventaire.json']) assert.equal(estCheminPrive(chemin), true);
});
console.log(`Journal d’apprentissages : ${n} vérifications réussies.`);
