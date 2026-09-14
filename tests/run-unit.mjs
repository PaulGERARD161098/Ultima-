import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const directory = new URL('.', import.meta.url);
const files = readdirSync(directory).filter((f) => /^unit-.*\.mjs$/.test(f)).sort();
if (!files.length) throw new Error('Aucun test découvert');
let failures = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, [new URL(file, directory).pathname], { encoding: 'utf8', timeout: 120000 });
  console.log(`${result.status === 0 ? 'PASS' : 'FAIL'} ${file}`);
  if (result.status !== 0) {
    failures++;
    console.error(result.stdout, result.stderr, result.error?.message || '');
  }
}
console.log(`${files.length - failures}/${files.length} suites réussies`);
process.exitCode = failures ? 1 : 0;
