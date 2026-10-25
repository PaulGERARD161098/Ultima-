// Route réelle, Auth et transport RPC factices ; aucune base réelle appelée.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validerCheckpoint } from '../js/leo-interaction.mjs';
import { isUuid } from '../api/_lib/validate.js';
const source = readFileSync(new URL('../api/leo-registre.js', import.meta.url), 'utf8')
  .replace(/^import[^\n]*\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
const mission = '11111111-1111-4111-8111-111111111111';
async function invoke(req, options = {}) {
  const calls = [];
  const deps = { validerCheckpoint, isUuid, isAuthError: error => error?.code === 'PGRST301',
    requireUser: async () => ({ status: options.auth || 'ok', client: { rpc: async (name, args) => {
      calls.push({ name, args });
      if (options.throw) throw new Error('fixture transport');
      return options.result || { data: { status: 'completed' }, error: null };
    }, from: table => {
      const query = { table, filters: [] };
      const builder = { select: columns => { query.columns = columns; return builder; },
        order: (key, options) => { (query.order ||= []).push([key, options]); return builder; },
        limit: async value => { query.limit = value; calls.push(query); return options.result || { data: [], error: null }; },
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
for (const [code, expected] of [['42501', 403], ['22023', 400], ['PT409', 409], ['40001', 409], ['P0001', 409],
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


const cp = {task_id:mission,titre:'Plan',etapes:['Vérifier'],confirmes:[],rappels:0,etat:'en_cours',revision:1};
for(const kind of ['adopt','update','revise_plan']) {
  const patch={checkpoint:cp,checkpoint_command:{kind,expected_task_id:kind==='adopt'?null:mission}};
  const result=await invoke({...request,body:{...request.body,patch}});
  assert.equal(result.response.status,200);assert.equal(result.calls.length,1);
  assert.deepEqual(result.calls[0].args.p_patch,patch);
}
for(const patch of [
  {checkpoint:cp}, {checkpoint_command:{kind:'adopt',expected_task_id:null}},
  {checkpoint:null,checkpoint_command:{kind:'adopt',expected_task_id:null}},
  ...[{kind:'new_task',expected_task_id:mission},{kind:'update',expected_task_id:null},
    {kind:'adopt',expected_task_id:mission},{kind:'adopt',expected_task_id:null,owner:true},
    {kind:'revise_plan',expected_task_id:'22222222-2222-4222-8222-222222222222'}]
    .map(checkpoint_command=>({checkpoint:cp,checkpoint_command})),
  {checkpoint:{...cp,rappels:3},checkpoint_command:{kind:'adopt',expected_task_id:null}},
]) {
  const result=await invoke({...request,body:{...request.body,patch}});
  assert.equal(result.response.status,400);assert.equal(result.calls.length,0);
}
console.log('PASS checkpoint API fermé : paires, commande, identité et RPC unique');

{
  const req = { method: 'GET', query: { list: 'missions' } };
  const row = { id: mission, state: 'in_progress', stopped: false, expires_at: '2099-01-01T00:00:00Z',
    updated_at: '2026-10-25T12:00:00Z', next_action: '  Reprendre le dossier  ', owner: 'secret', checkpoint: { secret: true } };
  const result = await invoke(req, { result: { data: [row], error: null } });
  assert.equal(result.response.status, 200);
  assert.deepEqual(result.calls, [{ table: 'leo_missions', columns: 'id,state,stopped,expires_at,updated_at,next_action',
    filters: [], order: [['updated_at', { ascending: false }], ['id', { ascending: true }]], limit: 51 }]);
  assert.deepEqual(result.response.data, { missions: [{ id: mission, state: row.state, stopped: false,
    expires_at: row.expires_at, updated_at: row.updated_at, label: 'Reprendre le dossier' }], truncated: false });
  assert.deepEqual((await invoke(req)).response.data, { missions: [], truncated: false });
  const many = await invoke(req, { result: { data: Array.from({length:51},()=>row), error: null } });
  assert.equal(many.response.data.missions.length, 50); assert.equal(many.response.data.truncated, true);
  for (const auth of ['unauthenticated', 'unconfigured']) {
    const denied = await invoke(req, {auth}); assert.equal(denied.calls.length, 0);
    assert.equal(denied.response.status, auth === 'unconfigured' ? 503 : 401);
  }
  for (const query of [{ list: 'missions', owner: mission }, { list: ['missions'] }, { list: 'all' },
    { list: 'missions', mission }, { list: 'missions', limit: '99999' }]) {
    const bad = await invoke({ method: 'GET', query }); assert.equal(bad.response.status,400); assert.equal(bad.calls.length,0);
  }
  for (const data of [null, {}, [null], [{...row,id:'invalid'}], [{...row,updated_at:'invalid'}]])
    assert.equal((await invoke(req,{result:{data,error:null}})).response.status,503);
  assert.equal((await invoke(req,{result:{error:{code:'42501',message:'secret'}}})).response.status,403);
  console.log('PASS liste : JWT requis, projection fermée, borne 50, liste vide et filtres étrangers refusés');
}

{
 const patch={checkpoint:{...cp,titre:' Plan ',etapes:[' Vérifier ']},checkpoint_command:{kind:'adopt',expected_task_id:null}};
 const result=await invoke({...request,body:{...request.body,patch}});
 assert.equal(result.response.status,200);assert.deepEqual(result.calls[0].args.p_patch.checkpoint,cp,'API directe canonique');
 assert.equal(patch.checkpoint.titre,' Plan ','requête appelante conservée');
}
