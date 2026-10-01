// Sonde exécutée DANS le conteneur avant le code applicatif.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const sonde = `
const fs = require('node:fs');
const net = require('node:net');
try { fs.writeFileSync('/lv1-ecriture-interdite', 'fixture'); process.exit(1); }
catch (e) { if (!['EROFS','EACCES'].includes(e.code)) process.exit(2); }
const s = net.connect({ host: '192.0.2.1', port: 9 });
s.setTimeout(1000, () => { s.destroy(); process.exit(3); });
s.on('connect', () => process.exit(4));
s.on('error', e => process.exit(['ENETUNREACH','EHOSTUNREACH','EPERM','EACCES'].includes(e.code) ? 0 : 5));
`;
const r = spawnSync(process.execPath, ['-e', sonde], { timeout: 3000 });
assert.equal(r.status, 0, `Isolation non prouvée dans le processus enfant (code ${r.status})`);
for (const nom of ['ANTHROPIC_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'FINUBAR_GITHUB_TOKEN', 'GITHUB_TOKEN']) {
  assert.equal(process.env[nom], undefined, 'Un secret a été transmis au conteneur');
}
console.log('Sonde isolation : écriture racine et réseau extérieur refusés dans un enfant.');
