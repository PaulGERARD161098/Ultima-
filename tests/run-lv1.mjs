// À exécuter uniquement dans le conteneur de tests/lancer-lv1-isole.sh.
import { spawnSync } from 'node:child_process';
import './lv1-isolation.mjs';
const suites = ['unit-leo-voix.mjs', 'unit-leo-mains.mjs', 'unit-leo-donnees.mjs',
  'unit-idees-concurrence.mjs', 'unit-finubar.mjs', 'unit-finubar-github.mjs'];
let echecs = 0;
for (const suite of suites) {
  const r = spawnSync(process.execPath, [new URL(suite, import.meta.url).pathname],
    { encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024 });
  console.log(`${r.status === 0 ? 'PASS' : 'FAIL'} ${suite}`);
  if (r.status !== 0) { echecs++; console.error(r.stdout, r.stderr, r.error?.message || ''); }
}
console.log(`${suites.length - echecs}/${suites.length} suites LV1 réussies ; fixtures, aucun service réel.`);
process.exitCode = echecs ? 1 : 0;
