// Projection compacte du catalogue neutre vers le prompt serveur. Aucun appel externe.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const source = new URL('./points-de-vue.json', import.meta.url);
const cible = new URL('../../api/_lib/leo-points-de-vue.mjs', import.meta.url);
export function generer() {
  const texte = readFileSync(source, 'utf8');
  const catalogue = JSON.parse(texte);
  const points = catalogue.points_de_vue;
  if (!Array.isArray(points) || points.length !== 100 || new Set(points.map(p => p.id)).size !== 100) throw new Error('Catalogue incomplet ou dupliqué');
  if (points.some(p => !p.id || !p.alias || !p.question || /[\r\n]/.test(p.question))) throw new Error('Fiche incomplète ou multiligne');
  const index = points.map(p => `${p.id} ${p.alias} : ${p.question}`).join('\n');
  if (index.length > 16000) throw new Error('Index trop volumineux');
  return '// GÉNÉRÉ par zohshia/anti-pattern/publier-leo.mjs ; ne pas modifier à la main.\n'
    + `export const EMPREINTE_CATALOGUE = '${createHash('sha256').update(texte).digest('hex')}';\n`
    + `export const INDEX_POINTS_DE_VUE = ${JSON.stringify(index)};\n`;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const attendu = generer();
  if (process.argv.includes('--verifier')) {
    if (readFileSync(cible, 'utf8') !== attendu) throw new Error('Projection Léo périmée');
    console.log('Projection Léo à jour');
  } else {
    writeFileSync(cible, attendu);
    console.log('100 questions projetées vers Léo');
  }
}
