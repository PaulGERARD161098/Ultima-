// Les chemins cités dans les leçons portent-ils leur dépôt ? — à lancer AVANT
// de propager `memoire/LECONS.md` (procédure : `memoire/LECONS-PROCEDURE.md`).
//
// Le fichier est recopié dans les dix dépôts. Un chemin qui n'existe que dans
// UN dépôt, écrit sans son préfixe (`app/releve/ui.tsx` au lieu de
// `RenoDevis/app/releve/ui.tsx`), se lit depuis les neuf autres comme un fichier
// du dépôt courant : un renvoi mort qui a l'air valide. La règle est écrite en
// tête des leçons ; ce script la MESURE, par `git ls-tree` sur la tête de main
// de chaque dépôt — jamais de mémoire. Payé le 02/10 : sept chemins nus trouvés
// un par un par la relecture Codex, sur deux tours de propagation.
//
//   node finubar/lecons-chemins.mjs <dossier des clones> [memoire/LECONS.md]
//
// <dossier des clones> contient un dossier par dépôt, aux noms de `dossier` de
// `finubar/depots.json` (un miroir de liens symboliques convient).
// Code de sortie : 0 aucun chemin nu propre à un dépôt · 1 il y en a ·
// 2 un clone manque — on ne conclut pas sur une partie des dépôts.
// ⚠️ Ce qu'il ne voit pas : un NOM DE FICHIER SEUL (`lignes.js`, sans dossier)
// ne s'attribue pas à un dépôt — trop de noms se répètent. Le préfixer reste à
// la relecture (v61 : `RenoDevis/releve/lignes.js`).
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const depots = JSON.parse(readFileSync(join(ICI, 'depots.json'), 'utf8')).map((d) => d.dossier);

export function cheminsCites(texte) {
  // Un exemple de chemin nu, montré comme tel, s'écrit entre doubles accents
  // graves (`` `x` ``) : il n'est pas un renvoi, on ne le compte pas.
  const sansExemples = texte.replace(/`` `[^`]*` ``/g, '');
  const cites = new Map();
  for (const m of sansExemples.matchAll(/`([^`\n]*(?:\n[^`\n]*)?)`/g)) {
    const ligne = sansExemples.slice(0, m.index).split('\n').length;
    for (const brut of m[1].replace(/\s+/g, ' ').split(' ')) {
      const p = brut.replace(/^[(\["'«]+|[)\],;"'»]+$/g, '').replace(/:\d+(-\d+)?$/, '');
      if (!/\/|\.(md|mjs|js|ts|tsx|jsx|py|sql|ya?ml|json|html|css|sh)$/.test(p)) continue;
      if (/^(https?:|\/|~|\*)/.test(p) || p.includes('://')) continue;
      if (!cites.has(p)) cites.set(p, ligne);
    }
  }
  return cites;
}

export function cheminsNus(cites, contenus) {
  const prefixes = Object.keys(contenus).map((d) => `${d}/`);
  const nus = [];
  for (const [p, ligne] of cites) {
    if (prefixes.some((x) => p.startsWith(x))) continue;
    const ou = Object.entries(contenus)
      .filter(([, { fichiers, dossiers }]) => fichiers.has(p) || dossiers.has(p.replace(/\/$/, '')))
      .map(([d]) => d);
    if (ou.length === 1) nus.push({ chemin: p, depot: ou[0], ligne });
  }
  return nus;
}

function contenuDe(clone) {
  const sortie = execFileSync('git', ['-C', clone, 'ls-tree', '-r', '--name-only', 'origin/main'], { encoding: 'utf8' });
  const fichiers = new Set(sortie.split('\n').filter(Boolean));
  const dossiers = new Set();
  for (const f of fichiers) {
    const parts = f.split('/');
    for (let i = 1; i < parts.length; i++) dossiers.add(parts.slice(0, i).join('/'));
  }
  return { fichiers, dossiers };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const racine = process.argv[2];
  const lecons = process.argv[3] ?? join(ICI, '..', 'memoire', 'LECONS.md');
  if (!racine) { console.error('Usage : node finubar/lecons-chemins.mjs <dossier des clones> [LECONS.md]'); process.exit(2); }
  const manquants = depots.filter((d) => !existsSync(join(resolve(racine), d, '.git')));
  if (manquants.length) { console.error(`Clones absents : ${manquants.join(', ')} — mesure refusée.`); process.exit(2); }
  const contenus = Object.fromEntries(depots.map((d) => [d, contenuDe(join(resolve(racine), d))]));
  const cites = cheminsCites(readFileSync(lecons, 'utf8'));
  const nus = cheminsNus(cites, contenus);
  console.log(`${cites.size} chemins cités · ${depots.length} dépôts lus · ${nus.length} chemin(s) nu(s) propre(s) à un seul dépôt`);
  for (const n of nus) console.log(`  l.${n.ligne}  ${n.chemin}  → ${n.depot}/${n.chemin}`);
  process.exit(nus.length ? 1 : 0);
}
