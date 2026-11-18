import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { collecter } from '../zohshia/analyse-energetique-logement/collecter.mjs';
import { chargerRecette, nomPropreDans } from '../zohshia/renodevis/neutraliser.mjs';
import publication from '../api/_lib/zohshia-technos.mjs';

const root = new URL('../', import.meta.url).pathname;
const folder = join(root, 'zohshia/analyse-energetique-logement');
const inv = JSON.parse(readFileSync(join(folder, 'inventaire.json')));
const techno = readFileSync(join(folder, 'TECHNO.md'), 'utf8');
assert.equal(inv.capacites.length, 6);
assert.match(inv.source.commit, /^[0-9a-f]{40}$/);
for (const c of inv.capacites) { assert(techno.includes(c.id)); assert(c.modules.length > 0); }
const badge = publication.technos.find((t) => t.id === 'analyse-energetique-logement');
assert(badge && badge.onglets.length === 3 && badge.onglets.every((o) => o.blocs.length >= 3));
const recette = chargerRecette(root);
for (const name of ['TECHNO.md', 'MISE-EN-SERVICE.md', 'badge.json', 'inventaire.json', 'collecter.mjs']) {
  const text = readFileSync(join(folder, name), 'utf8');
  assert.equal(nomPropreDans(text, recette), null);
  assert(!/(sk_live|sk_test|whsec_|eyJhbGciOi|-----BEGIN)/.test(text));
  assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text));
}
const tmp = mkdtempSync(join(tmpdir(), 'analyse-collecte-'));
try {
  const bytes = Buffer.from('source fictive non vide');
  writeFileSync(join(tmp, 'source.txt'), bytes);
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  const ref = { commit: 'a'.repeat(40), date_commit: '2026-11-18T00:00:00Z', capacites: inv.capacites.map((c) => ({ id: c.id, fichiers: [{ chemin: 'source.txt', blob: hash }] })) };
  assert.equal(collecter(tmp, ref).capacites.length, 6); // Positive witness before the negative case.
  writeFileSync(join(tmp, 'source.txt'), 'source altérée');
  assert.throws(() => collecter(tmp, ref), /modifiée/);
  assert.throws(() => collecter(tmp, { ...ref, capacites: [] }), /vide/);
} finally { rmSync(tmp, { recursive: true, force: true }); }
console.log('✓ Inventaire, couverture, neutralité, publication et dérive vérifiés.');
