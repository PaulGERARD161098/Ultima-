// Unitaires — les chemins de Finubar cités dans les leçons portent leur dépôt.
// ⛔ `memoire/LECONS.md` est recopié dans les dix dépôts, et `finubar/` n'existe
// que dans Ultima. Un chemin nu (`node finubar/collecter.mjs`) se lit depuis les
// neuf copies comme un fichier du dépôt courant : la commande de secours qu'il
// donne échoue là où on en a besoin. C'est la règle d'en-tête du fichier (« les
// chemins cités portent leur dépôt en préfixe »), restée sans garde jusqu'au
// 02/10 — quatre chemins nus y étaient entrés, trouvés par la relecture Codex
// d'Artidispo #111.
import { readFileSync } from 'node:fs';

const verdicts = {};
const texte = readFileSync(new URL('../memoire/LECONS.md', import.meta.url), 'utf8');

// Un « chemin » : la suite de caractères de chemin qui entoure `finubar/`.
const chemins = [...texte.matchAll(/[\w.\-/]*finubar\/[\w.\-/]*/g)].map((m) => m[0]);
const nus = chemins.filter((c) => !c.startsWith('Ultima-/'));

// 0. Verrou de non-vacuité : sans chemin trouvé, « aucun chemin nu » serait vert à vide.
verdicts.cheminsTrouves = chemins.length >= 5;

// 1. Aucun chemin vers finubar/ sans le préfixe de son dépôt.
verdicts.aucunCheminNu = nus.length === 0;
if (nus.length) console.error('Chemins sans préfixe :', nus);

console.log(JSON.stringify({ ...verdicts, chemins: chemins.length }, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LECONS-CHEMINS OK' : 'UNIT-LECONS-CHEMINS ECHEC');
process.exit(ok ? 0 : 1);
