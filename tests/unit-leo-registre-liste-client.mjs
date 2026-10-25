import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../js/leo-registre-client.js',import.meta.url),'utf8');
const window={};new Function('window',source)(window);
const row={id:'11111111-1111-4111-8111-111111111111',label:'Reprendre',state:'in_progress',stopped:false,
  expires_at:'2099-01-01T00:00:00Z',updated_at:'2026-10-25T12:00:00Z'};
const make=(data,token='fixture-token')=>{
  const calls=[];
  const client=window.UltimaLeoRegistreClient.create({getToken:()=>token,fetch:async(url,init)=>{
    calls.push({url,init});return {ok:true,json:async()=>({ok:true,data})};
  }});return {client,calls};
};
{
 const {client,calls}=make({missions:[row],truncated:false});
 const result=await client.listMissions();assert.deepEqual(result.missions,[row]);
 assert.equal(calls[0].url,'/api/leo-registre?list=missions');assert.equal(calls[0].init.method,'GET');
 assert.equal(calls[0].init.headers.Authorization,'Bearer fixture-token');assert.equal(calls[0].init.cache,'no-store');
 assert.equal(client.snapshot().missionId,null,'lister ne choisit ni ne crée une mission');
}
for(const data of [{missions:[],truncated:false},{missions:[row],truncated:true}])
 assert.deepEqual(await make(data).client.listMissions(),data);
for(const data of [{}, {missions:[row],truncated:false,owner:'admin'}, {missions:[row,row],truncated:false},
 {missions:[{...row,id:'invalid'}],truncated:false}, {missions:[{...row,label:'x'.repeat(161)}],truncated:false},
 {missions:[{...row,state:'admin'}],truncated:false}, {missions:Array(51).fill(row),truncated:false}])
 await assert.rejects(make(data).client.listMissions(),e=>e.code==='unavailable');
{
 const {client,calls}=make({missions:[],truncated:false},null);await assert.rejects(client.listMissions(),e=>e.code==='auth');assert.equal(calls.length,0);
 client.destroy();await assert.rejects(client.listMissions(),e=>e.code==='auth');
}
console.log('PASS liste client : identité, GET borné, formes fermées, aucune sélection implicite');
