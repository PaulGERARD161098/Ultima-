#!/usr/bin/env node
// ZOH SHIA · RénoDevis — RANGER LA NEUTRALISATION DU CODE dans la recette privée.
//
// La neutralisation se fait UNE fois, à la main et prouvée, dans un clone de
// travail (branche `neutre`). Ce script la range pour qu'elle se REJOUE sur tout
// commit futur du dépôt de référence :
//   · `retirer.txt` — ce qui part : des MOTIFS (tout `*.md`, des dossiers) plutôt
//     que des fichiers, pour qu'un fichier du même genre ajouté demain parte aussi ;
//     plus les fichiers retirés qu'aucun motif ne couvre, nommés un par un ;
//   · `neutre.diff` — ce qui change ou s'ajoute, appliqué en 3 VOIES par
//     `extraire.mjs` : il encaisse les évolutions du dépôt qui ne touchent pas les
//     mêmes lignes, et s'arrête sur un vrai conflit.
// Les deux vivent dans `outils/zohshia/renodevis/neutre/` : ils NOMMENT ce qu'ils
// retirent, donc hors de zohshia/, comme la recette.
//
// Usage : node zohshia/renodevis/serie.mjs --clone <clone> [--base source/main] [--branche neutre]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { RACINE } from './neutraliser.mjs';

const arg = (nom, defaut) => { const i = process.argv.indexOf(`--${nom}`); return i > 0 ? process.argv[i + 1] : defaut; };
const CLONE = arg('clone');
const BASE = arg('base', 'source/main');
const BRANCHE = arg('branche', 'neutre');
if (!CLONE) { console.error('usage : serie.mjs --clone <clone> [--base source/main] [--branche neutre]'); process.exit(2); }
const git = (args) => execFileSync('git', ['-C', CLONE, ...args], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });

// Les motifs : ce qui, par nature, porte l'histoire de l'instance.
export const MOTIFS = ['**/*.md', '.claude/**', 'docs/**', 'outils/demo/**'];
const correspond = (chemin) => MOTIFS.some((m) => {
  const re = new RegExp('^' + m.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '(?:.*/)?').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');
  return re.test(chemin);
});

const sha = git(['rev-parse', BASE]).trim();
const retires = git(['diff', '--name-only', '--no-renames', '--diff-filter=D', BASE, BRANCHE]).split('\n').filter(Boolean);
const nommes = retires.filter((c) => !correspond(c));
const diff = git(['diff', '--binary', '--no-renames', '--diff-filter=AM', BASE, BRANCHE]);
if (!retires.length || !diff.trim()) { console.error('✗ série vide — refus (vert par vacuité)'); process.exit(1); }

const dossier = join(RACINE, 'outils', 'zohshia', 'renodevis', 'neutre');
mkdirSync(dossier, { recursive: true });
writeFileSync(join(dossier, 'retirer.txt'), [
  '# Ce que la neutralisation retire. Une ligne = un motif (glob) ou un chemin.',
  '# En plus : tout chemin qui porte un nom propre part d’office (extraire.mjs).',
  `# Base : ${sha}`,
  ...MOTIFS,
  ...nommes,
].join('\n') + '\n');
writeFileSync(join(dossier, 'neutre.diff'), diff);
writeFileSync(join(dossier, 'BASE'), sha + '\n');
console.log(`✓ série rangée : ${retires.length} retraits (${MOTIFS.length} motifs + ${nommes.length} chemins nommés), diff de ${diff.split('\n').length} lignes, base ${sha.slice(0, 7)}`);
