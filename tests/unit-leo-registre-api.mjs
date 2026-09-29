// Route réelle, Auth et transport RPC factices ; aucune base réelle appelée.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isUuid } from '../api/_lib/validate.js';
const source = readFileSync(new URL('../api/leo-registre.js', import.meta.url), 'utf8')
  .replace(/^import[^\n]*\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
const mission = '11111111-1111-4111-8111-111111111111';
async function invoke(req, options = {}) {
  const calls = [];
  const deps = { isUuid, isAuthError: error => error?.code === 'PGRST301',
    requireUser: async () => ({ status: options.auth || 'ok', client: { rpc: async (name, args) => {
      calls.push({ name, args });
      if (options.throw) throw new Error('fixture transport');
      return options.result || { data: { status: 'completed' }, error: null };
    }, from: table => {
      const query = { table, filters: [] };
      const builder = { select: columns => { query.columns = columns; return builder; },
        eq: (key, value) => { query.filters.push([key, value]); return builder; },
        maybeSingle: async () => { calls.push(query); return options.result || { data: null, error: null }; } };
      return builder;
    } } }),
    ok: (_, data) => ({ status: 200, data }),
    fail: (_, status, message) => ({ status, message }),
    bodyFail: (_, body) => ({ status: body === 'too_large' ? 413 : 400 }),
    methodNotAllowed: () => ({ status: 405 }), readJsonBody: async request => request.body,
    logError: () => {},
  };
  const route = new Function(...Object.keys(deps), source)(...Object.values(deps));
  return { response: await route(req, {}), calls };
}
const request = { method: 'POST', body: { action: 'write_memory', mission,
  operation_id: 'op-1', expected_version: 1, patch: { state: 'in_progress', next_action: 'review' } } };
const positive = await invoke(request);
assert.equal(positive.response.status, 200);
assert.deepEqual(positive.calls, [{ name: 'leo_write_memory', args: { p_mission: mission,
  p_operation: 'op-1', p_expected_version: 1, p_patch: request.body.patch } }]);
const status = await invoke({ method: 'GET', query: { mission } });
assert.equal(status.calls[0].name, 'leo_status');
assert.equal((await invoke({ method: 'POST', body: { action: 'stop', mission } })).calls[0].name, 'leo_stop');
for (const field of ['authority', 'owner_id', 'principal', 'approval', 'budget', 'effects']) {
  const result = await invoke({ ...request, body: { ...request.body, [field]: true } });
  assert.equal(result.response.status, 400); assert.equal(result.calls.length, 0);
}
for (const patch of [{ writers: ['intruder'] }, { state: null }, [], {}, { next_action: 'x'.repeat(4001) },
  JSON.parse('{"__proto__":{"authority":true}}')]) {
  const result = await invoke({ ...request, body: { ...request.body, patch } });
  assert.equal(result.response.status, 400); assert.equal(result.calls.length, 0);
}
for (const action of ['send_mail', 'paid_call', 'merge_fixture', 'create_mission']) {
  const result = await invoke({ ...request, body: { ...request.body, action } });
  assert.equal(result.response.status, 400); assert.equal(result.calls.length, 0);
}
for (const auth of ['unauthenticated', 'unconfigured']) {
  const result = await invoke(request, { auth });
  assert.equal(result.response.status, auth === 'unconfigured' ? 503 : 401); assert.equal(result.calls.length, 0);
}
for (const [code, expected] of [['42501', 403], ['22023', 400], ['40001', 409], ['P0001', 409],
  ['PGRST202', 503], ['PGRST301', 401], ['unexpected', 503]]) {
  const result = await invoke(request, { result: { error: { code, message: 'secret fixture' } } });
  assert.equal(result.response.status, expected); assert.equal(result.calls.length, 1);
  assert.ok(!result.response.message.includes('secret'));
}
const lost = await invoke(request, { throw: true });
assert.equal(lost.response.status, 503); assert.equal(lost.calls.length, 1);
assert.match(lost.response.message, /incertain/);
const receiptRequest = { method: 'GET', query: { mission, operation_id: 'old-op' } };
const receipt = { operation_id: 'old-op', status: 'completed', result: { mission_version: 2 },
  payload: { private: 'ne pas transmettre' }, owner: 'ne pas transmettre' };
const targeted = await invoke(receiptRequest, { result: { data: receipt, error: null } });
assert.deepEqual(targeted.calls, [{ table: 'leo_operations', columns: 'operation_id,status,result',
  filters: [['mission_id', mission], ['operation_id', 'old-op']] }]);
assert.deepEqual(targeted.response, { status: 200, data: { mission_id: mission,
  operation: { operation_id: receipt.operation_id, status: receipt.status, result: receipt.result } } });
assert.deepEqual((await invoke(receiptRequest)).response.data, { mission_id: mission, operation: null });
for (const query of [{ mission, operation_id: '' }, { mission, operation_id: ['old-op'] },
  { mission, operation_id: 'x'.repeat(129) }, { mission: 'invalid', operation_id: 'old-op' },
  { mission, operation_id: 'old-op', owner: 'foreign' }]) {
  const result = await invoke({ method: 'GET', query });
  assert.equal(result.response.status, 400); assert.equal(result.calls.length, 0);
}
for (const auth of ['unauthenticated', 'unconfigured']) {
  const result = await invoke(receiptRequest, { auth });
  assert.equal(result.response.status, auth === 'unconfigured' ? 503 : 401);
  assert.equal(result.calls.length, 0);
}
const deniedReceipt = await invoke(receiptRequest, { result: { error: { code: '42501' } } });
assert.equal(deniedReceipt.response.status, 403);
assert.equal((await invoke(receiptRequest, { result: { data: [], error: null } })).response.status, 503);
console.log('Registre API : authentification, commandes fermées, RPC unique et issue inconnue vérifiées sur fixtures.');
console.log('Reçu ciblé : projection minimale, filtres exacts, absence neutre, auth et entrées refusées.');
