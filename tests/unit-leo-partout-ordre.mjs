// Toute page qui charge js/leo-partout.js doit charger js/leo-accueil.js AVANT :
// leo-partout.js ne pose son bouton « Parler à Léo » que s'il trouve
// window.UltimaLeo.accueillirQuadrant, fourni par leo-accueil.js.
// Payé le 23/11/2026 : caradryel.html l'avait oublié, le bouton n'apparaissait
// jamais et AUCUN harnais ne l'a vu (trouvé par la revue Codex de Ultima-#475).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const racine = new URL('../', import.meta.url);
const pages = readdirSync(racine).filter((f) => f.endsWith('.html'));
const avecLeo = pages.filter((f) => readFileSync(new URL(f, racine), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').includes('src="js/leo-partout.js"'));
// Verrou de non-vacuité : la règle porte sur des pages réelles, dont CARADRYEL.
assert.ok(avecLeo.length >= 15, `trop peu de pages lues : ${avecLeo.length}`);
assert.ok(avecLeo.includes('caradryel.html'));
const fautives = avecLeo.filter((f) => {
  const html = readFileSync(new URL(f, racine), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const accueil = html.indexOf('src="js/leo-accueil.js"');
  return accueil === -1 || accueil > html.indexOf('src="js/leo-partout.js"');
});
assert.deepEqual(fautives, [], `leo-accueil.js absent ou chargé après leo-partout.js : ${fautives.join(', ')}`);
console.log(`Léo partout : ${avecLeo.length} pages chargent son runtime avant le bouton.`);
