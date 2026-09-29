// Route PATCH réelle, client et transport factices ; aucun accès Supabase.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateIdee, isUuid } from '../api/_lib/validate.js';

const source = readFileSync(new URL('../api/idees/items.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
const id = '11111111-1111-4111-8111-111111111111';
async function patch(body, resultat = { data: { id }, error: null }) {
  const appels = [];
  const requete = {};
  for (const nom of ['from', 'update', 'eq', 'is', 'select']) {
    requete[nom] = (...args) => { appels.push([nom, ...args]); return requete; };
  }
  requete.maybeSingle = async () => { appels.push(['maybeSingle']); return resultat; };
  const deps = {
    requireUser: async () => ({ status: 'ok', client: requete }),
    isAuthError: () => false, validateIdee, isUuid,
    readJsonBody: async req => req.body,
    ok: (_, data) => ({ status: 200, data }),
    fail: (_, status, message) => ({ status, message }),
    bodyFail: () => ({ status: 400 }), methodNotAllowed: () => ({ status: 405 }),
    logError: () => {},
  };
  const route = new Function(...Object.keys(deps), source)(...Object.values(deps));
  return { reponse: await route({ method: 'PATCH', body: { id, ...body } }, {}), appels };
}
for (const attendu of [null, '', '  Version exacte  ']) {
  const r = await patch({ essence: 'Nouvelle', essence_attendue: attendu });
  assert.equal(r.reponse.status, 200);
  assert.deepEqual(r.appels, [
    ['from', 'idees'], ['update', { essence: 'Nouvelle' }], ['eq', 'id', id],
    [attendu === null ? 'is' : 'eq', 'essence', attendu], ['select'], ['maybeSingle'],
  ]);
}
const conflit = await patch({ essence: 'Nouvelle', essence_attendue: 'Ancienne' }, { data: null });
assert.equal(conflit.reponse.status, 409);
assert.equal(conflit.appels.filter(a => a[0] === 'update').length, 1);
for (const body of [{ essence: 'N', essence_attendue: 4 },
  { nom: 'Idée', essence_attendue: 'Avant' },
  { essence: 'N', essence_attendue: 'x'.repeat(2001) }]) {
  const r = await patch(body); assert.equal(r.reponse.status, 400); assert.equal(r.appels.length, 0);
}
assert.equal((await patch({ nom: 'Idée' }, { data: null })).reponse.status, 404);
assert.equal((await patch({ essence: 'N', essence_attendue: null }, { error: { code: 'fixture' } })).reponse.status, 500);
console.log('PATCH idées : comparaison atomique, null exact, conflit et métadonnées vérifiés sur client factice.');
