#!/usr/bin/env node
// ZOH SHIA · RénoDevis — LE SCANNER : un arbre de fichiers porte-t-il encore un
// nom propre ? Même détecteur que le moteur (neutraliser.mjs) : mot entier, bosse
// de chameau, identifiants de l'instance de référence. Chemins ET contenus.
//
// Usage : node zohshia/renodevis/scanner.mjs <dossier> [--resume] [--equipe]
// Sortie : une ligne par occurrence (chemin:ligne · jeton · extrait) ; code 1 si
// l'arbre n'est pas neutre, 0 sinon. ⛔ Un dossier vide n'est PAS neutre : il
// est refusé (vert par vacuité).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { chargerRecette } from './neutraliser.mjs';

import { pathToFileURL } from 'node:url';

const IGNORES = new Set(['node_modules', '.git', '.next']);
const GENERES = /\.tsbuildinfo$/;
const BINAIRE = /\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|otf|zip|gz)$/i;

/** Rend { lus, trouves[] } pour un arbre. Réutilisé par l'extracteur. */
export function scanner(racine, recette = chargerRecette()) {
  const trouves = [];
  let lus = 0;
  (function parcourir(d) {
    for (const n of readdirSync(d)) {
      if (IGNORES.has(n) || GENERES.test(n)) continue;
      const p = join(d, n);
      const rel = relative(racine, p);
      const st = statSync(p, { throwIfNoEntry: false });
      if (!st) continue;
      if (st.isDirectory()) { parcourir(p); continue; }
      lus += 1;
      const m = recette.motif.match(rel);
      if (m) trouves.push({ rel, ligne: 0, jeton: m[2], extrait: '(chemin)' });
      if (BINAIRE.test(n)) continue;
      readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        const x = recette.motif.match(l);
        if (x) trouves.push({ rel, ligne: i + 1, jeton: x[2], extrait: l.trim().slice(0, 110) });
      });
    }
  }(racine));
  return { lus, trouves };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const racine = process.argv[2];
  if (!racine) { console.error('usage : scanner.mjs <dossier> [--resume]'); process.exit(2); }
  const resume = process.argv.includes('--resume');
  // --equipe : ajoute les noms de l'équipe de l'instance de référence (code extrait).
  const { lus, trouves } = scanner(racine, chargerRecette(undefined, { equipe: process.argv.includes('--equipe') }));
  if (lus === 0) { console.error('✗ aucun fichier lu — refus (vert par vacuité)'); process.exit(1); }
  if (resume) {
    const parFichier = new Map();
    for (const t of trouves) parFichier.set(t.rel, (parFichier.get(t.rel) || 0) + 1);
    for (const [f, n] of [...parFichier].sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), f);
  } else {
    for (const t of trouves) console.log(`${t.rel}:${t.ligne} · ${t.jeton} · ${t.extrait}`);
  }
  console.log(trouves.length ? `✗ ${trouves.length} occurrence(s) dans ${new Set(trouves.map((t) => t.rel)).size} fichier(s) sur ${lus}` : `✓ ${lus} fichiers lus, aucun nom propre`);
  process.exit(trouves.length ? 1 : 0);
}
