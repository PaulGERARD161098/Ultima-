// Répartit les harnais navigateur en lots, pour la CI (tests.yml, matrice `lot`).
// Sans lot, `lancer.sh` les joue tous : c'est la suite locale, inchangée.
//
// ⛔ Chaque harnais tombe dans UN lot et UN seul. Un harnais qu'aucun lot ne
// prend ne tourne plus nulle part, et son silence se lit comme un vert.
// `unit-lots.mjs` le prouve, et vérifie que la matrice de tests.yml couvre
// bien les lots 1 à N.
//
//   node tests/lots.mjs 2/4   → les harnais du 2ᵉ lot sur 4, un par ligne
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function harnais(dossier) {
  return readdirSync(dossier).filter((f) => /^smoke-.*\.mjs$/.test(f)).sort();
}

// « 2/4 » → un harnais sur quatre, à tour de rôle, en partant du deuxième.
export function lot(fichiers, spec) {
  const m = /^([1-9]\d*)\/([1-9]\d*)$/.exec(String(spec ?? ''));
  if (!m) throw new Error(`LOT invalide : « ${spec} » (attendu i/N, par exemple 2/4)`);
  const i = Number(m[1]);
  const n = Number(m[2]);
  if (i > n) throw new Error(`LOT invalide : « ${spec} » (${i} dépasse ${n})`);
  return fichiers.filter((_, k) => k % n === i - 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const choisis = lot(harnais(new URL('.', import.meta.url)), process.argv[2]);
    // Un lot vide sortirait vert sans avoir rien joué.
    if (!choisis.length) throw new Error(`le lot ${process.argv[2]} ne contient aucun harnais`);
    console.log(choisis.join('\n'));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
