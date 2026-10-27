// Client réel, HTTP/Auth factices. Aucun navigateur, SQL, modèle ou réseau.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validerCheckpoint} from '../js/leo-interaction.mjs';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const mission=id(1), task=id(2), operation=id(3);
const cp={task_id:task,titre:'Livrer',etapes:['Préparer','Vérifier'],confirmes:[0],rappels:2,etat:'suspendue',revision:7};
const win={crypto:{randomUUID:()=>operation}};
new Function('window',readFileSync(new URL('../js/leo-registre-client.js',import.meta.url),'utf8'))(win);
const api=win.UltimaLeoRegistreClient;
const valid=api.validateCheckpoint;
for(const c of [cp,null,undefined,[],{...cp,rappels:3},{...cp,task_id:'foreign'},
  {...cp,confirmes:[1,0]},{...cp,confirmes:[0,0]},{...cp,etapes:Array(2)},
  {...cp,revision:Number.MAX_SAFE_INTEGER+1},{...cp,rights:'admin'},
  {...cp,titre:' '+cp.titre+' '},...Object.keys(cp).map(k=>{const x={...cp};delete x[k];return x;})])
  assert.deepEqual(valid(c),validerCheckpoint(c),'parité validateur ESM/IIFE');
const raw=structuredClone(cp),projected=valid(raw);raw.etapes[0]='ailleurs';
assert.equal(projected.etapes[0],cp.etapes[0]);
function fixture(options={}) {
  const calls=[],store=new Map();let posted;
  const registry={mission:{id:mission,version:1,state:'in_progress',next_action:'Suite',
    stopped:false,scope:'memory',contract_version:'1.1',skill_version:'1.0',expires_at:'2099-01-01'},
    budget:{max_units:100,max_calls:100,used_units:0,calls:0},operations:[],operations_truncated:false};
  if(!options.legacy){registry.capabilities={checkpoint:1,checkpoint_write:options.writer!==true};registry.mission.checkpoint=null;}
  if(options.existing)registry.mission.checkpoint=structuredClone(cp);
  registry.operations=[{operation_id:'historique',status:'completed',result:{mission_version:1,state:'in_progress',next_action:'Suite'}}];
  if(options.alter)options.alter(registry);
  const response=data=>({ok:true,json:async()=>({ok:true,data:structuredClone(data)})});
  const receipt=()=>({operation_id:options.foreignOp?id(9):posted.operation_id,status:'completed',result:{
    mission_version:2,state:'in_progress',next_action:'Suite',
    ...Object.fromEntries(Object.entries(posted.patch).reverse())}});
  const client=api.create({getToken:async()=>'fixture-token',recoveryKey:'fixture',
    recoveryStore:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},
    fetch:async(url,init)=>{
      calls.push({url,method:init.method});
      if(init.method==='POST'){
        posted=JSON.parse(init.body);
        if(options.refuse)return {ok:false,status:403,json:async()=>({ok:false,error:'Refus fixture'})};
        registry.mission.version=2;
        if(posted.patch.checkpoint)registry.mission.checkpoint=structuredClone(posted.patch.checkpoint);
        if(options.lost)throw Error('Réponse perdue');
        const r=receipt();
        if(options.malformedReceipt)delete r.result.checkpoint_command;
        if(options.divergentReceipt)r.result.checkpoint={...r.result.checkpoint,confirmes:[1]};
        // Ordre des clés inversé jusque dans le checkpoint/commande HTTP.
        for(const k of ['checkpoint','checkpoint_command'])if(r.result[k])r.result[k]=Object.fromEntries(Object.entries(r.result[k]).reverse());
        return response(r);
      }
      if(url.includes('operation_id='))return response({mission_id:options.foreignMission?id(9):mission,operation:options.absent?null:receipt()});
      return response(registry);
    }});
  return {client,calls,store,registry,get posted(){return posted;}};
}
const initial={...cp,confirmes:[],rappels:0,etat:'en_cours',revision:1};
const adoption={checkpoint:initial,checkpoint_command:{kind:'adopt',expected_task_id:null}};
{
  const f=fixture();const s=await f.client.load(mission);
  assert.equal(s.canWriteCheckpoint,true);assert.equal(s.data.mission.checkpoint,null);
  await f.client.write(adoption);assert.equal(f.client.snapshot().uncertain,null);
  assert.equal(f.calls.filter(c=>c.method==='POST').length,1);assert.equal(f.store.size,0);
  assert.deepEqual(f.posted.patch,adoption);f.client.destroy();
}
for(const options of [{legacy:true},{writer:true}]){
  const f=fixture(options),s=await f.client.load(mission);
  assert.equal(s.canWrite,true);assert.equal(s.canWriteCheckpoint,false);
  await assert.rejects(()=>f.client.write(adoption),{code:'denied'});
  assert.equal(f.calls.length,1);f.client.destroy();
}
for(const alter of [r=>{r.capabilities=null;},r=>{r.capabilities.checkpoint=2;},
  r=>{delete r.capabilities.checkpoint_write;},r=>{r.mission.checkpoint={...cp,rappels:3};},
  r=>{delete r.mission.checkpoint;},r=>{delete r.capabilities;}]){
  const f=fixture({alter});await assert.rejects(()=>f.client.load(mission));
  assert.equal(f.client.snapshot().data,null);assert.equal(f.calls.length,1);f.client.destroy();
}
for(const patch of [{checkpoint:cp},{checkpoint_command:adoption.checkpoint_command},
  {...adoption,checkpoint:null},{...adoption,checkpoint_command:{kind:'new_task',expected_task_id:task}},
  {...adoption,checkpoint_command:{kind:'adopt',expected_task_id:null,authority:true}}]){
  const f=fixture();await f.client.load(mission);
  await assert.rejects(()=>f.client.write(patch),{code:'invalid'});assert.equal(f.calls.length,1);f.client.destroy();
}
{
  const f=fixture({existing:true});await f.client.load(mission);
  await assert.rejects(()=>f.client.write(adoption),{code:'conflict'});
  const updated={...cp,confirmes:[0,1]};
  await f.client.write({checkpoint:updated,checkpoint_command:{kind:'update',expected_task_id:task}});
  assert.equal(f.client.snapshot().uncertain,null);f.client.destroy();
}
{
  const f=fixture({existing:true});await f.client.load(mission);
  await assert.rejects(()=>f.client.write({checkpoint:{...cp,task_id:id(8)},checkpoint_command:{kind:'update',expected_task_id:id(8)}}),{code:'conflict'});
  assert.equal(f.calls.length,1);f.client.destroy();
}
for(const options of [{lost:true},{lost:true,foreignOp:true},{lost:true,foreignMission:true},
  {lost:true,absent:true},{malformedReceipt:true},{refuse:true}]){
  const f=fixture(options);await f.client.load(mission);
  await assert.rejects(()=>f.client.write(adoption));
  if(options.refuse){assert.equal(f.store.size,0);f.client.destroy();continue;}
  assert.ok(f.client.snapshot().uncertain);const marker=JSON.parse(f.store.get('fixture'));
  assert.deepEqual(Object.keys(marker).sort(),['missionId','operation_id','kind','expected_version','stopRequested'].sort());
  assert.equal(marker.operation_id,operation);assert.ok(!f.store.get('fixture').includes('Livrer'));
  if(options.foreignOp||options.foreignMission)await assert.rejects(()=>f.client.reconcile());
  else await f.client.reconcile();
  assert.equal(f.calls.filter(c=>c.method==='POST').length,1,'jamais de rejeu automatique');
  if(options.absent||options.foreignOp||options.foreignMission)assert.ok(f.client.snapshot().uncertain);
  else assert.equal(f.client.snapshot().uncertain,null,'reçu exact même ordre JSON différent');
  f.client.destroy();
}
console.log('PASS checkpoint client : parité, capacité/legacy, null/invalide, commande fermée, égalité JSON, réponse perdue et reçu ciblé sans rejeu');

{
  const f=fixture({divergentReceipt:true});await f.client.load(mission);
  await assert.rejects(()=>f.client.write(adoption),{code:'uncertain'});
  assert.ok(f.client.snapshot().uncertain,'différence tableau ne vaut pas accusé');
  assert.equal(f.calls.filter(c=>c.method==='POST').length,1);f.client.destroy();
}

{
 const f=fixture();await f.client.load(mission);
 const nonCanonical={...initial,titre:'  Livrer  ',etapes:[' Préparer ',' Vérifier ']};
 await f.client.write({...adoption,checkpoint:nonCanonical});
 assert.deepEqual(f.posted.patch.checkpoint,initial,'payload canonique avant POST et reçu');
 assert.equal(f.client.snapshot().uncertain,null);assert.equal(f.store.size,0);
 assert.equal(nonCanonical.titre,'  Livrer  ','entrée appelant conservée');f.client.destroy();
}
