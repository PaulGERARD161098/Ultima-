#!/usr/bin/env node
// SUPERVISION ET RÉEMPLOI — copier la techno neutre là où la production la lit.
//
// `zohshia/` n'est pas déployé (`.vercelignore`) et le traceur de Vercel
// n'embarque que les imports STATIQUES depuis `api/_lib/` (voir api/finubar.js).
// Ce script écrit donc trois copies, précédées d'un en-tête « GÉNÉRÉ » :
//   zohshia/supervision-valeur/CONTRAT.schema.json  → api/_lib/supervision-contrat.mjs
//   zohshia/supervision-valeur/forme.mjs            → api/_lib/supervision-forme.mjs
//   zohshia/supervision-valeur/supervision-valeur.mjs → api/_lib/supervision-juge.mjs
// Le corps est recopié octet pour octet : une copie qui dériverait de sa source
// ferait juger la production par une autre règle que celle éprouvée.
//
// Usage : node zohshia/supervision-valeur/publier.mjs [--verifier]
//   --verifier : n'écrit rien ; code 1 si une copie n'est plus à jour.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const LIB = join(ICI, '..', '..', 'api', '_lib');
const entete = (source) =>
  `// GÉNÉRÉ par \`node zohshia/supervision-valeur/publier.mjs\` depuis\n` +
  `// zohshia/supervision-valeur/${source} — ne pas modifier à la main.\n`;

export function copies() {
  const lire = (f) => readFileSync(join(ICI, f), 'utf8');
  const schema = JSON.parse(lire('CONTRAT.schema.json'));
  return [
    { cible: join(LIB, 'supervision-contrat.mjs'),
      contenu: entete('CONTRAT.schema.json') + 'export default ' + JSON.stringify(schema, null, 2) + ';\n' },
    { cible: join(LIB, 'supervision-forme.mjs'), contenu: entete('forme.mjs') + lire('forme.mjs') },
    { cible: join(LIB, 'supervision-juge.mjs'), contenu: entete('supervision-valeur.mjs') + lire('supervision-valeur.mjs') },
  ];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const verifier = process.argv.includes('--verifier');
  let ecarts = 0;
  for (const { cible, contenu } of copies()) {
    const actuel = existsSync(cible) ? readFileSync(cible, 'utf8') : null;
    if (actuel === contenu) continue;
    if (verifier) { console.error(`✗ copie périmée : ${cible}`); ecarts += 1; }
    else { writeFileSync(cible, contenu); console.log(`✓ ${cible}`); }
  }
  if (verifier && !ecarts) console.log('✓ copies de supervision à jour');
  process.exitCode = ecarts ? 1 : 0;
}
