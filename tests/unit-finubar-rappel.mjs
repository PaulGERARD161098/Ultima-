// Unitaires du rappel Finubar (Node pur, zéro réseau, zéro navigateur).
//
// Pourquoi ce harnais existe : le rappel lisait `x.quoi` sur des boucles
// ouvertes écrites en CHAÎNE dans les huit grains. Il rendait
// « BOUCLES OUVERTES :  ·  ·  » — des séparateurs sans contenu — et le lecteur
// suivant y lisait « aucune boucle ouverte ». Un rappel muet passe pour une
// bonne nouvelle : c'est le pire des deux états.
//
// Chaque contrôle d'absence est précédé de son verrou de non-vacuité.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(ICI, '../finubar/rappel.mjs');
const verdicts = {};

// Rend le contexte produit par le rappel pour un grain donné, dans un dépôt jetable.
function rappelPour(grain) {
  const racine = mkdtempSync(join(tmpdir(), 'finubar-'));
  try {
    mkdirSync(join(racine, '.claude'));
    copyFileSync(SOURCE, join(racine, '.claude', 'rappel.mjs'));
    writeFileSync(join(racine, 'FINUBAR.md'),
      `<!-- finubar:debut -->\n\`\`\`json\n${JSON.stringify(grain, null, 2)}\n\`\`\`\n<!-- finubar:fin -->\n`);
    const sortie = execFileSync(process.execPath, [join(racine, '.claude', 'rappel.mjs')],
      { encoding: 'utf8', timeout: 10000 });
    if (!sortie.trim()) return '';
    return JSON.parse(sortie).hookSpecificOutput.additionalContext;
  } finally {
    rmSync(racine, { recursive: true, force: true });
  }
}

const GRAIN = (boucles) => ({
  projet: 'depot-temoin',
  depot: 'exemple/depot-temoin',
  cap: 'Le cap du dépôt témoin.',
  boucles_ouvertes: boucles,
  maj: '2026-09-07',
});

// ---------- Verrou de non-vacuité : le rappel produit bien quelque chose ----------
const chaines = rappelPour(GRAIN(['DETTE ALPHA — le lint est mort', 'DETTE BETA — quota localStorage']));
verdicts.rappelNonVide = chaines.length > 50 && chaines.includes('depot-temoin');

// ---------- Boucles écrites en CHAÎNE : le cas réel des huit grains ----------
verdicts.chainesRendues = chaines.includes('DETTE ALPHA') && chaines.includes('DETTE BETA');

// ---------- Contrôle par l'absence : plus de séparateurs vides ----------
const ligne = chaines.split('\n').find((l) => l.startsWith('BOUCLES OUVERTES'));
verdicts.ligneBouclesPresente = typeof ligne === 'string' && ligne.length > 25;
verdicts.pasDeSeparateursVides = !!ligne && !/BOUCLES OUVERTES\s*:\s*(·|\s)*$/.test(ligne);

// ---------- Forme OBJET : l'ancienne écriture reste lue, rien n'est cassé ----------
const objets = rappelPour(GRAIN([{ quoi: 'DETTE GAMMA — forme objet' }]));
verdicts.objetsRendus = objets.includes('DETTE GAMMA');

// ---------- Entrées vides : écartées, sans laisser de séparateur orphelin ----------
const mixte = rappelPour(GRAIN(['DETTE DELTA — vraie dette', '', null, { quoi: '' }]));
verdicts.videsEcartees = mixte.includes('DETTE DELTA')
  && !/DETTE DELTA[^\n]*·/.test(mixte.split('\n').find((l) => l.startsWith('BOUCLES OUVERTES')) ?? '');

// ---------- Le rappel ne doit JAMAIS faire échouer une ouverture de séance ----------
const casse = rappelPour({ projet: 'depot-temoin', boucles_ouvertes: 'pas un tableau' });
verdicts.grainMalFormeToleré = typeof casse === 'string';

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-FINUBAR-RAPPEL OK' : 'UNIT-FINUBAR-RAPPEL ECHEC');
process.exit(ok ? 0 : 1);
