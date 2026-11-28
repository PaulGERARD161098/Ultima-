// Charte portable de Léo : la sceller, vérifier une copie, la propager.
// Source unique : .claude/leo-portable/leo.md (Ultima). Même principe que
// finubar/lecons-empreinte.mjs : sha256 du corps hors ligne de sceau.
// Usage :
//   node outils/leo-portable.mjs --sceller
//   node outils/leo-portable.mjs --verifier <racine d'un dépôt>
//   node outils/leo-portable.mjs --propager <racine d'un dépôt>
//     → écrit .claude/agents/leo.md (copie) et "agent": "leo" dans
//       .claude/settings.json en conservant tout le reste du fichier.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ULTIMA = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = join(ULTIMA, '.claude/leo-portable/leo.md');
const SCEAU = /<!-- leo-portable:empreinte [^>]* -->/;

export function empreinte(texte) {
  return createHash('sha256').update(texte.replace(SCEAU, '<!-- leo-portable:empreinte -->'), 'utf8').digest('hex').slice(0, 12);
}
export function sceller(texte) {
  if (!SCEAU.test(texte)) throw new Error('ligne de sceau absente');
  return texte.replace(SCEAU, `<!-- leo-portable:empreinte sha256:${empreinte(texte)} -->`);
}
export function estScelle(texte) {
  const m = /<!-- leo-portable:empreinte sha256:([0-9a-f]{12}) -->/.exec(texte);
  return Boolean(m) && m[1] === empreinte(texte);
}
export function fusionnerReglages(json) {
  const r = json ? JSON.parse(json) : {};
  if (typeof r !== 'object' || Array.isArray(r) || r === null) throw new Error('settings.json : objet attendu');
  const { $schema, ...reste } = r;
  delete reste.agent;
  return JSON.stringify({ ...($schema ? { $schema } : {}), agent: 'leo', ...reste }, null, 2) + '\n';
}

function principal() {
  const [mode, cible] = process.argv.slice(2);
  const source = readFileSync(SOURCE, 'utf8');
  if (mode === '--sceller') {
    const s = sceller(source);
    if (s !== source) writeFileSync(SOURCE, s);
    console.log(`charte portable scellée : sha256:${empreinte(s)}`);
    return;
  }
  if (!estScelle(source)) { console.error('source non scellée : lancer --sceller'); process.exit(1); }
  if (!cible) { console.error('usage : --sceller | --verifier <dépôt> | --propager <dépôt>'); process.exit(2); }
  const agent = join(cible, '.claude/agents/leo.md');
  const reglages = join(cible, '.claude/settings.json');
  if (mode === '--verifier') {
    const ecarts = [];
    if (!existsSync(agent) || readFileSync(agent, 'utf8') !== source) ecarts.push('copie de la charte absente ou différente');
    if (!existsSync(reglages) || JSON.parse(readFileSync(reglages, 'utf8')).agent !== 'leo') ecarts.push('"agent": "leo" absent');
    if (ecarts.length) { console.error(`${cible} : ${ecarts.join(' ; ')}`); process.exit(1); }
    console.log(`${cible} : Léo par défaut, copie identique (sha256:${empreinte(source)})`);
    return;
  }
  if (mode === '--propager') {
    mkdirSync(dirname(agent), { recursive: true });
    writeFileSync(agent, source);
    writeFileSync(reglages, fusionnerReglages(existsSync(reglages) ? readFileSync(reglages, 'utf8') : ''));
    console.log(`${cible} : charte copiée, agent par défaut posé`);
    return;
  }
  console.error(`mode inconnu : ${mode}`); process.exit(2);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
