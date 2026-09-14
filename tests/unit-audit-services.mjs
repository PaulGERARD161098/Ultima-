import assert from 'node:assert/strict';
import { encryptToken, renderEntryText, contentHash, parseCookies, COOKIE_OAUTH, COOKIE_EXCHANGE, verifyState } from '../api/_lib/drive.js';
import authorize from '../api/imladrik/drive/authorize.js';
import callback from '../api/imladrik/drive/callback.js';
import push from '../api/imladrik/drive/push.js';
import matin from '../api/finubar-matin.mjs';

const user='11111111-1111-4111-8111-111111111111';
const out=()=>({headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},end(s){this.body=s?JSON.parse(s):null;}});
const req={method:'GET',headers:{authorization:'Bearer test'}};
Object.assign(process.env,{GOOGLE_OAUTH_CLIENT_ID:'test-client',GOOGLE_OAUTH_CLIENT_SECRET:'test-secret',
  GOOGLE_OAUTH_REDIRECT_URI:'https://example.test/api/imladrik/drive/callback',DRIVE_TOKEN_ENC_KEY:'a'.repeat(64),
  DRIVE_STATE_SECRET:'test-state',CRON_SECRET:'test-cron',RESEND_API_KEY:'test-resend',FINUBAR_MAIL_A:'test@example.test'});
const entries=Array.from({length:201},(_,i)=>{
  const e={id:String(i),titre:'Test',contenu:String(i),created_at:'2026-01-01T00:00:00Z'};
  if(i<200){e.drive_file_id='file-'+i;e.drive_content_hash=contentHash(renderEntryText(e));}
  return e;
});
const original=globalThis.fetch;let uploads=0;const mailKeys=[];
globalThis.fetch=async(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url || String(input));
  const respond=(data)=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
  if(url.pathname==='/auth/v1/user')return respond({id:user,aud:'authenticated'});
  if(url.pathname==='/rest/v1/imladrik_drive_tokens')return respond({refresh_token_chiffre:encryptToken('fake-token',process.env.DRIVE_TOKEN_ENC_KEY),drive_folder_id:'folder'});
  if(url.pathname==='/rest/v1/imladrik_entrees'){
    if(options.method==='PATCH')return respond([]);
    const from=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||1000);
    return respond(entries.slice(from,from+limit));
  }
  if(url.href==='https://oauth2.googleapis.com/token')return respond({access_token:'fake-google'});
  if(url.hostname==='www.googleapis.com' && url.pathname==='/upload/drive/v3/files'){uploads++;return respond({id:'new-file'});}
  if(url.href==='https://api.resend.com/emails'){mailKeys.push(options.headers['Idempotency-Key']);return respond({id:'same-mail'});}
  throw new Error('Unexpected external request');
};
try {
  const authResponse=out();await authorize(req,authResponse);assert.equal(authResponse.statusCode,200);
  const cookie=authResponse.headers['set-cookie'].split(';')[0];
  const state=verifyState(parseCookies(cookie)[COOKIE_OAUTH],process.env.DRIVE_STATE_SECRET);
  assert.equal(state.owner_id,user);
  const cb=out();await callback({method:'GET',headers:{cookie},query:{state:state.state,code:'google-code'}},cb);
  assert.equal(cb.statusCode,302);
  const relayCookie=cb.headers['set-cookie'].find(c=>c.startsWith(COOKIE_EXCHANGE+'='));
  const relay=verifyState(parseCookies(relayCookie.split(';')[0])[COOKIE_EXCHANGE],process.env.DRIVE_STATE_SECRET);
  assert.equal(relay.owner_id,user);assert.equal(relay.code,'google-code');
  const invalid=out();await callback({method:'GET',headers:{cookie},query:{state:state.state,code:['one','two']}},invalid);
  assert.equal(invalid.headers.location,'/imladrik.html?drive=error');

  // La 201e page doit être sauvegardée même si les 200 premières sont inchangées.
  const sync=out();await push({...req,method:'POST'},sync);
  assert.equal(sync.statusCode,200);assert.equal(uploads,1);
  assert.equal(sync.body.data.pousses,1);assert.equal(sync.body.data.inchanges,200);
  assert.equal(sync.body.data.tronque,false);

  const RealDate=globalThis.Date;
  globalThis.Date=class extends RealDate{constructor(...a){super(...(a.length?a:['2026-09-14T05:15:00Z']));}static now(){return new RealDate('2026-09-14T05:15:00Z').getTime();}};
  try {
    for(let i=0;i<2;i++){const r=out();await matin({method:'GET',headers:{authorization:'Bearer test-cron'},url:'/api/finubar-matin'},r);assert.equal(r.statusCode,200);}
    assert.deepEqual(mailKeys,['finubar-matin/2026-09-14','finubar-matin/2026-09-14']);
  } finally {globalThis.Date=RealDate;}
  console.log('SERVICES audit OK : liaison OAuth au compte, page Drive 201 et clé quotidienne anti-doublon');
} finally {globalThis.fetch=original;}
