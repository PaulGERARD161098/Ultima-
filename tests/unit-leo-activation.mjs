// Léo est le fil principal de chaque séance (`"agent": "leo"` dans
// .claude/settings.json, décision de Paul du 28/11/2026) et ses skills
// préchargés existent. Sans ce garde, un renommage casse l'activation en
// silence : la séance repart sur l'agent par défaut sans le dire.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = resolve(process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..'));
const lire = (p) => readFileSync(join(racine, p), 'utf8');
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

const reglages = JSON.parse(lire('.claude/settings.json'));
ok(reglages.agent === 'leo', 'settings.json : "agent" doit valoir "leo"');
const charte = lire(`.claude/agents/${reglages.agent}.md`);
const fm = /^---\n([\s\S]*?)\n---\n/.exec(charte);
ok(fm, 'charte : frontmatter absent');
ok(/^name: leo$/m.test(fm[1]), 'charte : name ≠ leo');
const bloc = /^skills:\n((?:  - .+\n?)+)/m.exec(fm[1] + '\n');
ok(bloc, 'charte : liste skills absente');
const noms = [...bloc[1].matchAll(/  - (.+)/g)].map((m) => m[1].trim());
ok(noms.length >= 1 && noms.length <= 32, 'charte : 1 à 32 skills préchargés');
for (const nom of noms) {
  const f = `.claude/skills/${nom}/SKILL.md`;
  ok(existsSync(join(racine, f)), `skill préchargé introuvable : ${nom}`);
  const t = lire(f);
  ok(new RegExp(`^name: ${nom}$`, 'm').test(t), `skill ${nom} : name ≠ dossier`);
  ok(!/^disable-model-invocation: true$/m.test(t), `skill ${nom} : non préchargeable`);
}
console.log(`unit-leo-activation : ${n} vérifications vertes`);
