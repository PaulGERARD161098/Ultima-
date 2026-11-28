// Charte portable de Léo (agent par défaut des dix dépôts, Paul 28/11/2026) :
// source scellée, propagation qui conserve les réglages du dépôt cible,
// vérification qui vire au rouge sur une copie altérée.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { SOURCE, empreinte, sceller, estScelle, fusionnerReglages } from '../outils/leo-portable.mjs';

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const source = readFileSync(SOURCE, 'utf8');

ok(estScelle(source), 'source non scellée : node outils/leo-portable.mjs --sceller');
ok(!estScelle(source.replace('Tu es **Léo**', 'Tu es **Léa**')), 'une altération doit casser le sceau');
ok(sceller(source) === source, 're-sceller sans changement ne doit rien modifier');
ok(/^name: leo$/m.test(source), 'name: leo attendu');

// mêmes skills préchargés que la charte complète d'Ultima
const liste = (t) => [.../^skills:\n((?:  - .+\n)+)/m.exec(t)[1].matchAll(/  - (.+)/g)].map((m) => m[1]);
ok(JSON.stringify(liste(source)) === JSON.stringify(liste(readFileSync('.claude/agents/leo.md', 'utf8'))), 'skills préchargés ≠ charte d\'Ultima');

// fusion des réglages : agent ajouté, le reste conservé, valeur d'avant écrasée
const avant = JSON.stringify({ $schema: 's', agent: 'autre', hooks: { SessionStart: [1] }, permissions: { deny: ['x'] } });
const apres = JSON.parse(fusionnerReglages(avant));
ok(apres.agent === 'leo' && apres.$schema === 's', 'agent leo et $schema attendus');
ok(JSON.stringify(apres.hooks) === '{"SessionStart":[1]}' && apres.permissions.deny[0] === 'x', 'hooks et permissions conservés');
ok(JSON.parse(fusionnerReglages('')).agent === 'leo', 'fichier absent → créé');
assert.throws(() => fusionnerReglages('[]')); n++;

// propagation puis vérification dans un faux dépôt ; une copie altérée doit échouer
const depot = mkdtempSync(join(tmpdir(), 'leo-portable-'));
mkdirSync(join(depot, '.claude'));
writeFileSync(join(depot, '.claude/settings.json'), avant);
execFileSync('node', ['outils/leo-portable.mjs', '--propager', depot]);
execFileSync('node', ['outils/leo-portable.mjs', '--verifier', depot]); n++;
writeFileSync(join(depot, '.claude/agents/leo.md'), source + ' ');
assert.throws(() => execFileSync('node', ['outils/leo-portable.mjs', '--verifier', depot], { stdio: 'pipe' })); n++;
ok(empreinte(source).length === 12, 'empreinte de 12 caractères');
console.log(`unit-leo-portable : ${n} vérifications vertes`);
