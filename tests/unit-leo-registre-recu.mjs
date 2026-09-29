// Reprise du client réel ; statut et reçu ciblé fictifs, aucun réseau ni SQL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const window = { crypto: { randomUUID } };
new Function('window', readFileSync(new URL('../js/leo-registre-client.js', import.meta.url), 'utf8'))(window);
const mission = '11111111-1111-4111-8111-111111111111';
const operation = '22222222-2222-4222-8222-222222222222';
const receipt = { operation_id: operation, status: 'completed', result: {
  mission_version: 2, state: 'in_progress', next_action: 'Ancienne écriture confirmée',
} };
function fixture(options = {}) {
  const calls = [], saved = new Map([['fixture', JSON.stringify({ missionId: mission,
    kind: 'write_memory', operation_id: operation, expected_version: 1,
    stopRequested: !!options.stopRequested })]]);
  const registry = { mission: { id: mission, version: options.version || 102,
    state: 'in_progress', next_action: 'Action courante', stopped: !!options.stopped,
    scope: 'memory', contract_version: '1.1', skill_version: '1.0', expires_at: '2099-01-01T00:00:00Z' },
    budget: { max_units: 1000, max_calls: 1000, used_units: 101, calls: 101 },
    operations_truncated: true,
    operations: Array.from({length:100}, (_,i) => ({operation_id:'recent-'+i,status:'completed',
      result:{mission_version:i+3,state:'in_progress',next_action:'Récente '+i}})),
  };
  const client = window.UltimaLeoRegistreClient.create({ getToken: async () => 'fixture-token',
    recoveryKey: 'fixture', recoveryStore: {getItem:k=>saved.get(k)??null,
      setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)},
    fetch: async (url, init) => {
      assert.equal(init.method,'GET','aucun POST de reprise'); calls.push(url);
      const query=new URL(url,'https://fixture.invalid').searchParams;
      assert.equal(query.get('mission'),mission);
      if (!query.has('operation_id')) return {ok:true,json:async()=>({ok:true,data:structuredClone(registry)})};
      assert.equal(query.get('operation_id'),operation);
      if(options.fail) return {ok:false,status:403,json:async()=>({ok:false,error:'fixture refusal'})};
      return {ok:true,json:async()=>({ok:true,data:{mission_id:options.foreignMission?'foreign':mission,
        operation:Object.hasOwn(options,'receipt')?options.receipt:structuredClone(receipt)}})};
    },
  });
  return {client,calls,saved,registry};
}
{
  const f=fixture(), state=await f.client.reconcile();
  assert.equal(state.uncertain,null,'retrouver un reçu sorti des 100 dernières opérations');
  assert.equal(f.calls.length,2,'une lecture statut et une recherche exacte');
  assert.equal(f.saved.size,0); assert.equal(state.data.budget.calls,101);
  assert.equal(state.data.mission.version,102);
  assert.equal(state.data.mission.next_action,'Action courante','ancien reçu ne remplace pas le statut courant');
  f.client.destroy();
  console.log('PASS reçu ancien : recherche ciblée, aucune écriture, statut et budget préservés');
}
for (const options of [ {receipt:null}, {receipt:{...receipt,status:'pending',result:null}},
  {receipt:{...receipt,result:{...receipt.result,mission_version:3}}},
  {stopRequested:true}, {version:1} ]) {
  const f=fixture(options), state=await f.client.reconcile();
  assert.ok(state.uncertain,'preuve absente/incohérente ou arrêt manquant : verrou conservé');
  assert.equal(state.canWrite,false); assert.equal(f.saved.size,1);
  await assert.rejects(()=>f.client.write({next_action:'Rejeu interdit'}),{code:'uncertain'});
  assert.equal(f.calls.length,2); f.client.destroy();
}
for (const options of [{fail:true},{foreignMission:true},{receipt:{...receipt,operation_id:'foreign'}}]) {
  const f=fixture(options);
  await assert.rejects(()=>f.client.reconcile());
  assert.ok(f.client.snapshot().uncertain); assert.equal(f.saved.size,1);
  assert.equal(f.client.snapshot().data,null); f.client.destroy();
}
{
  const f=fixture({stopRequested:true,stopped:true}),state=await f.client.reconcile();
  assert.equal(state.uncertain,null);assert.equal(state.canWrite,false);f.client.destroy();
}
console.log('PASS refus, reçu absent/étranger/pending, version divergente et arrêt concomitant : aucun rejeu');
