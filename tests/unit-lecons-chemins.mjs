// Unitaires — les chemins de Finubar cités dans les leçons portent leur dépôt.
// ⛔ `memoire/LECONS.md` est recopié dans les dix dépôts, et `finubar/` n'existe
// que dans Ultima. Un chemin nu (`node finubar/collecter.mjs`) se lit depuis les
// neuf copies comme un fichier du dépôt courant : la commande de secours qu'il
// donne échoue là où on en a besoin. C'est la règle d'en-tête du fichier (« les
// chemins cités portent leur dépôt en préfixe »), restée sans garde jusqu'au
// 02/10 — quatre chemins nus y étaient entrés, trouvés par la relecture Codex
// d'Artidispo #111.
// L'outil complet, qui lit les dix dépôts, ne tourne pas en CI (un seul dépôt y
// est cloné) : il se lance à la propagation, et sa logique est éprouvée ici.
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

// 1bis. Une COMMANDE qui cite un chemin préfixé dit d'où elle se lance : depuis la
//    racine d'un dépôt, `node Ultima-/finubar/x.mjs` ne résout pas (Codex, 02/10,
//    sur quatre copies). On exige « miroir » ou « dossier qui contient » juste avant.
const commandes = [...texte.matchAll(/`node [^`]*Ultima-\/[^`]*`/g)];
const nonSituees = commandes.filter((m) => !/miroir|dossier qui contient/.test(texte.slice(Math.max(0, m.index - 160), m.index)));
verdicts.commandesSituees = nonSituees.length === 0;
if (nonSituees.length) console.error('Commandes sans lieu de lancement :', nonSituees.map((m) => m[0]));

// 2. L'outil de propagation (`finubar/lecons-chemins.mjs`), sur un cas dont la
//    réponse est connue : il ne garde QUE le chemin nu propre à un seul dépôt.
const { cheminsCites, cheminsNus } = await import('../finubar/lecons-chemins.mjs');
const depot = (...f) => ({ fichiers: new Set(f), dossiers: new Set(f.flatMap((x) => x.split('/').slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join('/')))) });
const contenus = { A: depot('CLAUDE.md', 'x/y.md'), B: depot('CLAUDE.md', 'app/ui.tsx') };
const extrait = 'Voir `app/ui.tsx:302`, `A/x/y.md`, `CLAUDE.md`, et l\'exemple `` `x/y.md` `` montré nu.';
const nusSynth = cheminsNus(cheminsCites(extrait), contenus);
verdicts.outilGardeLeSeulNu = nusSynth.length === 1 && nusSynth[0].chemin === 'app/ui.tsx' && nusSynth[0].depot === 'B';

// 3. Le chemin présent dans PLUSIEURS dépôts mais pas dans tous est nu aussi
//    (10/10 : `lib/` visait RenoDevis/lib/ et l'outil rendait 0). Celui qui est
//    dans TOUS les dépôts reste légitime.
const trois = { A: depot('CLAUDE.md', 'lib/a.ts'), B: depot('CLAUDE.md', 'lib/b.ts'), C: depot('CLAUDE.md', 'src/c.ts') };
const nusTrois = cheminsNus(cheminsCites('Chercher dans `lib/`, puis lire `CLAUDE.md`.'), trois);
verdicts.outilVoitLeCheminPartiel = nusTrois.length === 1 && nusTrois[0].chemin === 'lib/' && nusTrois[0].depot === 'A | B';

console.log(JSON.stringify({ ...verdicts, chemins: chemins.length }, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LECONS-CHEMINS OK' : 'UNIT-LECONS-CHEMINS ECHEC');
process.exit(ok ? 0 : 1);
