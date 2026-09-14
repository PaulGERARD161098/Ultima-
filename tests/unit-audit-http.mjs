import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createServer } from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { readJsonBody, ok } from '../api/_lib/http.js';
import { fetchWithTimeout } from '../api/_lib/fetch.js';
import { readAll } from '../api/_lib/read-all.js';
import { requireUser } from '../api/_lib/supabase.js';
import { mapNominatimResults } from '../api/_lib/geocode.js';
import { estCheminPrive } from '../middleware.js';
import { signState, COOKIE_EXCHANGE } from '../api/_lib/drive.js';

const res = () => ({ headers: {}, setHeader(k,v) { this.headers[k.toLowerCase()]=v; }, end(s) { this.body=s ? JSON.parse(s) : null; } });
assert.equal(await readJsonBody({body:{text:'é'.repeat(50001)}}),'too_large');
assert.equal(await readJsonBody({body:JSON.stringify({text:'a'.repeat(100001)})}),'too_large');
assert.equal(await readJsonBody({body:Buffer.from('null')}),null);
for (const body of [null, [], 1, true, 'null', '[]', '{']) assert.equal(await readJsonBody({body}), null);
assert.deepEqual(await readJsonBody({body:{contenu:'texte normal'}}),{contenu:'texte normal'});
assert.equal(await readJsonBody(Readable.from(['{"texte":"', 'é'.repeat(50001), '"}'])),'too_large');
assert.equal(await readJsonBody(Readable.from((async function*(){yield '{'; throw new Error('interrupted');})())),null);
const response=res();ok(response,[]);assert.equal(response.headers['cache-control'],'private, no-store');
assert.deepEqual(mapNominatimResults([{display_name:'adresse',lat:null,lon:''}]),[]);
assert.deepEqual(mapNominatimResults([{display_name:'adresse',lat:'0',lon:0}]),[{label:'adresse',lat:0,lon:0}]);

for (const path of ['//api/_lib/finubar-macro.mjs','/x/%2e%2e%2fapi/_lib/finubar-macro.mjs',
  '/supabase/seed-althea-paul.sql','/design/preview-accueil-finubar-fixture.mjs','/.claude/settings.json',
  '/memoire//LECONS.md','/%252525252fapi/_lib/a.js','/memoire/x.md/']) {
  assert.equal(estCheminPrive(path),true,path);
}
for (const path of ['/','/finubar','/adramelech','/api/reseau','/js/app.js']) assert.equal(estCheminPrive(path),false,path);

// Une réponse dont les en-têtes arrivent mais dont le corps reste bloqué.
const server=createServer((_req,r)=>{r.writeHead(200,{'Content-Type':'application/json'});r.flushHeaders();r.write('{');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
  await assert.rejects(async()=>{ const r=await fetchWithTimeout(`http://127.0.0.1:${server.address().port}`,{},80);await r.json(); });
} finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}

// Un cap serveur inférieur à la taille demandée ne doit pas tronquer la liste.
const rows=Array.from({length:1207},(_,id)=>({id}));let pages=0;
const all=await readAll(()=>({order(){return this;},async range(from,to){pages++;return {data:rows.slice(from,Math.min(to+1,from+73)),error:null};}}));
assert.equal(all.data.length,1207);assert.ok(pages>16);
let reads=0;
const failure=await readAll(()=>({order(){return this;},async range(){return ++reads===1 ? {data:[{id:1}],error:null}:{data:null,error:{code:'42501'}};}}));
assert.equal(failure.data,null);assert.equal(failure.error.code,'42501');
assert.equal((await requireUser({headers:{}},()=>{throw new Error('bad config');})).status,'unconfigured');
assert.equal((await requireUser({headers:{authorization:'Bearer test'}},()=>({status:'ok',client:{auth:{getUser:async()=>({data:{user:{id:'a',is_anonymous:true}}})}}}))).status,'unauthenticated');

// Exécuter les vraies routes et le vrai client Supabase contre un transport
// factice strict : aucun secret et aucun appel réseau sortant.
const originalFetch=globalThis.fetch;
const user='11111111-1111-4111-8111-111111111111';
let dbCalls=0, mode='empty';
globalThis.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url || String(input));
  if(url.pathname==='/auth/v1/user') return new Response(JSON.stringify({id:user,aud:'authenticated'}),{status:200});
  if(url.pathname.startsWith('/rest/v1/')) {
    dbCalls++;
    if(mode==='error') return new Response(JSON.stringify({code:'42501',message:'denied'}),{status:403});
    return new Response('[]',{status:200,headers:{'Content-Type':'application/json'}});
  }
  throw new Error('Unexpected outbound request');
};
try {
  // Un id valide en URL ne permet jamais de contourner un corps invalide.
  const files=[];
  function collect(dir){for(const e of readdirSync(dir,{withFileTypes:true})){if(e.name==='_lib')continue;const u=new URL(e.name+(e.isDirectory()?'/':''),dir);if(e.isDirectory())collect(u);else if(e.name.endsWith('.js'))files.push(u);}}
  collect(new URL('../api/',import.meta.url));
  let tested=0;
  for(const file of files){
    if(!readFileSync(file,'utf8').includes("// DELETE"))continue;
    const {default:handler}=await import(file);
    for(const body of ['{',{text:'x'.repeat(100001)}]){
      const out=res();const before=dbCalls;
      await handler({method:'DELETE',headers:{authorization:'Bearer test'},query:{id:user},body},out);
      assert.ok([400,413].includes(out.statusCode),file.pathname);
      assert.equal(dbCalls,before,file.pathname);
    }
    tested++;
  }
  assert.ok(tested>=20);
  mode='error';
  for(const name of ['althea','situations','serments']){
    const {default:handler}=await import(`../api/${name}.js`);const out=res();
    await handler({method:'GET',headers:{authorization:'Bearer test'}},out);
    assert.equal(out.statusCode,500,name);assert.equal(out.body.ok,false);
  }
  // Le cookie d'un autre compte doit être refusé AVANT échange Google.
  Object.assign(process.env,{GOOGLE_OAUTH_CLIENT_ID:'test',GOOGLE_OAUTH_CLIENT_SECRET:'test',
    GOOGLE_OAUTH_REDIRECT_URI:'https://example.test/api/imladrik/drive/callback',DRIVE_TOKEN_ENC_KEY:'a'.repeat(64),DRIVE_STATE_SECRET:'audit-test-secret'});
  const {default:finalize}=await import('../api/imladrik/drive/finalize.js');
  const token=signState({code:'test',verifier:'test',owner_id:'other'},process.env.DRIVE_STATE_SECRET);
  const out=res();const before=dbCalls;
  await finalize({method:'POST',headers:{authorization:'Bearer test',cookie:`${COOKIE_EXCHANGE}=${token}`}},out);
  assert.equal(out.statusCode,400);assert.equal(dbCalls,before);
  console.log(`HTTP audit OK : ${tested} routes DELETE, limites, timeout corps, pagination, refus OAuth et erreurs de lecture`);
} finally {globalThis.fetch=originalFetch;}
