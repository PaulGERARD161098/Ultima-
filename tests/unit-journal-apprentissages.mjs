// Consultation et intégrité du journal, sans réseau ni données clients.
import assert from 'node:assert/strict';
import { lire, valider, rechercher } from '../outils/journal-apprentissages/consulter.mjs';
import { collecter } from '../zohshia/journal-apprentissages/collecter.mjs';
import { construire } from '../zohshia/publier.mjs';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { estCheminPrive } from '../middleware.js';

// ⛔ Le journal RÉEL vit dans memoire/, masqué par l'isolation LV1 de la CI (seul
// memoire/LECONS.md y est monté) : ce test ne le lit JAMAIS. La logique s'éprouve sur
// un journal FICTIF (tests/fixtures/journal-apprentissages.json) ; l'intégrité du
// journal réel se contrôle hors CI : `node outils/journal-apprentissages/consulter.mjs --verifier`.
const RACINE_DEPOT = new URL('../', import.meta.url).pathname;
const FIXTURE = readFileSync(new URL('./fixtures/journal-apprentissages.json', import.meta.url), 'utf8');
function racineFictive({ avecJournal = true } = {}) {
  const r = mkdtempSync(join(tmpdir(), 'journal-'));
  const ecrire = (chemin, texte) => { mkdirSync(dirname(join(r, chemin)), { recursive: true }); writeFileSync(join(r, chemin), texte); };
  ecrire('memoire/LECONS.md', readFileSync(join(RACINE_DEPOT, 'memoire/LECONS.md'), 'utf8'));
  if (avecJournal) ecrire('memoire/JOURNAL-APPRENTISSAGES.json', FIXTURE);
  return r;
}
const racine = racineFictive();
const contenu = lire(racine);
let n = 0;
const verifier = (nom, fn) => { fn(); n++; console.log(`✓ ${nom}`); };
const fixture = () => structuredClone(contenu.journal);
verifier('le journal fictif contient des observations et une couverture incomplète explicite', () => {
  assert.equal(contenu.journal.entrees.length, 4);
  assert.ok(contenu.journal.couverture.manquantes.length > 0);
  assert.ok(contenu.journal.entrees.every(e => e.lecon_canonique === null));
});
verifier('une recherche retrouve le problème d’accès avec ses limites et sources', () => {
  const r = rechercher(contenu, 'accès lecture fichier');
  assert.equal(r.observations[0].entree.id, 'JA-20990101-001');
  assert.ok(r.observations[0].entree.sources.length && r.observations[0].entree.limites.length);
});
verifier('une recherche retrouve le problème de reprise', () => {
  assert.equal(rechercher(contenu, 'webhook durable interruption').observations[0].entree.id, 'JA-20990101-003');
});
verifier('un journal absent fait échouer la lecture au lieu de passer pour vide', () => {
  const r = racineFictive({ avecJournal: false });
  try { assert.throws(() => lire(r), /ENOENT/); } finally { rmSync(r, { recursive: true, force: true }); }
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
verifier('la collecte mesure toutes les pièces lisibles mais ne publie pas les incidents', () => {
  const r = racineFictive();
  try {
    // Les pièces hors mémoire sont celles du dépôt ; LECONS-PROCEDURE est remplacée par un
    // texte neutre, car le reste de memoire/ est masqué en CI.
    for (const chemin of ['zohshia/journal-apprentissages/badge.json', 'zohshia/journal-apprentissages/TECHNO.md',
      'zohshia/journal-apprentissages/UTILISER.md', 'zohshia/journal-apprentissages/MISE-EN-SERVICE.md',
      'finubar/lecons-rappel.mjs', 'outils/journal-apprentissages/consulter.mjs']) {
      mkdirSync(dirname(join(r, chemin)), { recursive: true });
      writeFileSync(join(r, chemin), readFileSync(join(RACINE_DEPOT, chemin)));
    }
    writeFileSync(join(r, 'memoire/LECONS-PROCEDURE.md'), 'Procédure fictive de test.\n');
    const inv = collecter(r); assert.equal(inv.complet, true);
    assert.ok(inv.sources.every(s => /^[0-9a-f]{64}$/.test(s.sha256)));
    assert.ok(!JSON.stringify(inv).includes(contenu.journal.entrees[0].constat));
    // Le journal retiré (cas de la CI isolée) : la collecte le dit, elle ne se déclare pas complète.
    rmSync(join(r, 'memoire/JOURNAL-APPRENTISSAGES.json'));
    const sans = collecter(r); assert.equal(sans.complet, false);
    assert.equal(sans.sources.find(s => s.chemin === 'memoire/JOURNAL-APPRENTISSAGES.json').etat, 'non_accessible');
  } finally { rmSync(r, { recursive: true, force: true }); }
});
verifier('le badge expose un plan de préparation sans le journal privé', () => {
  const donnee = construire(); const t = donnee.technos.find(t => t.id === 'journal-apprentissages');
  assert.equal(t.badge, 'Journal d’apprentissages');
  assert.equal(t.etat, 'Préparé — raccordement automatique non activé');
  assert.equal(t.onglets.length, 3); assert.ok(t.onglets.every(o => o.blocs.length >= 3));
  // Structurel : aucun identifiant d'entrée de journal, réel ou fictif, ne traverse vers l'écran.
  assert.ok(!/JA-\d{8}-\d{3}/.test(JSON.stringify(donnee)));
  assert.ok(!JSON.stringify(donnee).includes(contenu.journal.entrees[0].constat));
});
verifier('la mémoire et la consultation restent hors des fichiers servis et du déploiement', () => {
  const ignore = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8');
  for (const prefixe of ['memoire', 'outils', 'zohshia']) assert.ok(new RegExp(`^${prefixe}/$`, 'm').test(ignore));
  for (const chemin of ['/memoire/JOURNAL-APPRENTISSAGES.json', '/outils/journal-apprentissages/consulter.mjs', '/zohshia/journal-apprentissages/inventaire.json']) assert.equal(estCheminPrive(chemin), true);
});
rmSync(racine, { recursive: true, force: true });
console.log(`Journal d’apprentissages : ${n} vérifications réussies.`);
