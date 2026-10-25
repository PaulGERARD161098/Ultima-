// Banc PostgreSQL WASM jetable, sans Supabase/service reel. A executer uniquement
// dans le runner isole. Ne prouve pas Auth/PostgREST ou la concurrence multi-session.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const lire=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const snapshot=JSON.parse(lire('../leo/proposals/registre-checkpoint-snapshot.json'));
const sql=lire('../leo/proposals/registre-checkpoint.sql');
const db=new PGlite();
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const owner=id(1),writer=id(2),reader=id(3),stranger=id(4),mission=id(10);
const initial={task_id:id(100),titre:'Mission de fixture',etapes:['Préparer','Vérifier'],confirmes:[],rappels:0,etat:'en_cours',revision:1};
const clone=v=>JSON.parse(JSON.stringify(v));
let op=0;
async function actor(uid,role='authenticated'){
  await db.exec(`reset role; set role ${role};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);
}
async function status(mid=mission){return (await db.query('select public.leo_status($1) as value',[mid])).rows[0].value;}
async function write(oid,version,patch,mid=mission){
  return (await db.query('select public.leo_write_memory($1,$2,$3,$4::jsonb) as value',[mid,oid,version,JSON.stringify(patch)])).rows[0].value;
}
const command=(kind,expected_task_id)=>({kind,expected_task_id});
const patch=(checkpoint,kind='update',expected_task_id=initial.task_id)=>({checkpoint,checkpoint_command:command(kind,expected_task_id)});
async function save(checkpoint,kind='update',expected_task_id=initial.task_id){
  const before=await status();return write('cp-'+(++op),before.mission.version,patch(checkpoint,kind,expected_task_id));
}
async function refuses(fn,code,message){await assert.rejects(fn,e=>e.code===code&&(!message||e.message.includes(message)));}
async function unchanged(fn,code,message){
  const before=await status();await refuses(fn,code,message);assert.deepEqual(await status(),before,'refus sans mutation/version/debit/recu');
}
async function invalidPatch(p,code='22023',message){
  const version=(await status()).mission.version;
  await unchanged(()=>write('bad-'+(++op),version,p),code,message);
}
async function seed(mid,options={}){
  await db.query(`insert into public.leo_missions(id,owner,readers,writers,expires_at,max_units,max_calls,contract_version,version)
    values($1,$2,array[$3::uuid],array[$4::uuid],clock_timestamp()+$5::interval,$6,$6,$7,$8)`,
  [mid,owner,reader,writer,options.expiry||'1 day',options.limit??80,options.contract||'1.1',options.version||1]);
}
try{
  await db.exec(lire('./fixtures/leo-registre-bootstrap.sql'));
  await db.exec(lire('../leo/proposals/registre-postgres.sql'));
  // Installer les definitions effectivement observees, pas une approximation
  // du SQL historique : la garde verifie ensuite pg_get_functiondef exact.
  for(const f of snapshot.functions)await db.exec(f.definition);
  // Policies observees : le brouillon historique possede une ancienne
  // definition du SELECT operations. Aligner explicitement la fixture avant
  // d'eprouver la garde metadata ; ne jamais contourner celle-ci.
  for(const p of snapshot.metadata.find(m=>m.kind==='policies').items){
    await db.exec(`drop policy ${p.policyname} on ${p.schemaname}.${p.tablename}`);
    await db.exec(`create policy ${p.policyname} on ${p.schemaname}.${p.tablename}
      as ${p.permissive} for ${p.cmd} to ${p.roles.join(',')} using (${p.qual})`);
  }
  for(const uid of [owner,writer,reader,stranger])await db.query('insert into auth.users(id) values($1)',[uid]);
  await seed(mission);
  await actor(writer);
  const legacyPatch={state:'in_progress',next_action:'Mémo historique'};
  const legacy=await write('legacy',1,legacyPatch);
  assert.deepEqual(Object.keys(legacy.result).sort(),['mission_version','next_action','state']);
  await db.exec('reset role');
  const originalStatus=snapshot.functions.find(f=>f.proname==='leo_status').definition;
  await db.exec("create or replace function public.leo_status(p_mission uuid) returns jsonb language sql set search_path='' as $$ select '{}'::jsonb $$");
  await refuses(()=>db.exec(sql),'P0001','checkpoint_snapshot_drift');
  await db.exec('rollback');
  assert.equal((await db.query("select count(*)::int as n from pg_attribute where attrelid='public.leo_missions'::regclass and attname='checkpoint' and not attisdropped")).rows[0].n,0,'garde avant colonne');
  assert.equal((await db.query("select to_regprocedure('leo_private.checkpoint_valid(jsonb)') as value")).rows[0].value,null,'garde avant helper');
  await db.exec(originalStatus);
  await db.exec('grant execute on function public.leo_status(uuid) to anon');
  await refuses(()=>db.exec(sql),'P0001','checkpoint_authority_drift');await db.exec('rollback');
  await db.exec('revoke execute on function public.leo_status(uuid) from anon');
  await db.exec('grant update on public.leo_missions to public');
  await refuses(()=>db.exec(sql),'P0001','checkpoint_grants_drift');await db.exec('rollback');
  await db.exec('revoke update on public.leo_missions from public');
  await db.exec('alter table public.leo_missions force row level security');
  await refuses(()=>db.exec(sql),'P0001','checkpoint_schema_drift');await db.exec('rollback');
  await db.exec('alter table public.leo_missions no force row level security');
  await db.exec('create policy unwanted on public.leo_missions for select to authenticated using (true)');
  await refuses(()=>db.exec(sql),'P0001','checkpoint_policy_drift');await db.exec('rollback');
  await db.exec('drop policy unwanted on public.leo_missions');
  assert.equal((await db.query("select to_regprocedure('leo_private.checkpoint_valid(jsonb)') as value")).rows[0].value,null,'derives metadata avant tout DDL checkpoint');
  await db.exec(sql);
  await actor(owner);
  let observed=await status();
  assert.equal(observed.mission.checkpoint,null);
  assert.deepEqual(observed.capabilities,{checkpoint:1,checkpoint_write:true});
  assert.deepEqual((await write('legacy',1,legacyPatch)).result,legacy.result,'ancien recu non enrichi');
  await invalidPatch(patch(initial,'new_task',null),'22023','invalid_checkpoint_command');
  for(const p of [{checkpoint:initial},{checkpoint_command:command('adopt',null)},patch(null,'adopt',null),
    patch({...initial,droits:true},'adopt',null),{...patch(initial,'adopt',null),checkpoint_command:{kind:'adopt',expected_task_id:null,owner:true}},
    patch(initial,'adopt',initial.task_id),patch(initial,'update',null)])await invalidPatch(p);
  for(const change of [{task_id:'invalid'},{titre:'<script>'},{etapes:['A','a']},{etapes:[]},{etapes:Array(11).fill('A')},
    {titre:'😀'.repeat(81)},{titre:'x'.repeat(161)},{titre:'   '},{titre:' '.repeat(10000)+'x'},{titre:'bad\u001f'},
    {confirmes:[0,0]},{confirmes:[1,0]},{confirmes:[2]},{confirmes:[0.5]},{confirmes:['0']},
    {rappels:3},{rappels:1.5},{rappels:'0'},{etat:'closed'},{revision:0},{revision:9007199254740992}])
    await invalidPatch(patch({...initial,...change},'adopt',null));
  const adoptVersion=(await status()).mission.version;
  const adoptPatch=patch(initial,'adopt',null);
  const adopted=await write('adopt',adoptVersion,adoptPatch);
  assert.deepEqual(adopted.result.checkpoint,initial);
  assert.deepEqual(adopted.result.checkpoint_command,command('adopt',null));
  assert.equal(adopted.result.mission_version,adoptVersion+1);
  assert.equal((await status()).budget.calls,2);
  await unchanged(()=>write('stale',adoptVersion,patch({...initial,confirmes:[0]})),'PT409','version_conflict');
  const reordered=Object.fromEntries(Object.entries(adoptPatch).reverse());
  reordered.checkpoint=Object.fromEntries(Object.entries(initial).reverse());
  const replay=await write('adopt',adoptVersion,reordered);
  assert.equal(replay.replayed,true);assert.deepEqual(replay.result,adopted.result);
  await unchanged(()=>write('adopt',adoptVersion,patch({...initial,titre:'Autre'},'adopt',null)),'PT409','operation_conflict');
  await unchanged(()=>write('adopt',adoptVersion+1,adoptPatch),'PT409','operation_conflict');
  await invalidPatch(patch({...initial,confirmes:[0]},'update',id(999)),'PT409');
  await invalidPatch(patch({...initial,task_id:id(101)},'update'),'PT409');
  await invalidPatch(patch({...initial,titre:'Autre'},'update'),'PT409');
  await invalidPatch(patch({...initial,revision:2},'update'),'PT409');
  await invalidPatch(patch(initial,'adopt',null),'PT409');
  await invalidPatch(patch({...initial,rappels:2}),'PT409');
  let cp={...initial,confirmes:[0],rappels:1};
  await save(cp);
  await invalidPatch(patch({...cp,confirmes:[]}),'PT409');
  await invalidPatch(patch({...cp,rappels:0}),'PT409');
  await save({...cp,etat:'suspendue'});
  await invalidPatch(patch({...cp,etat:'suspendue',rappels:2}),'PT409');
  await invalidPatch(patch({...cp,etat:'en_cours',rappels:2}),'PT409','checkpoint_transition_conflict');
  await save(cp); // Reprise declarative, aucun nouveau rappel.
  const revise={...cp,etapes:['Vérifier','Préparer','Clore'],confirmes:[1],revision:2};
  await invalidPatch(patch({...revise,confirmes:[0]},'revise_plan'),'PT409');
  await invalidPatch(patch({...revise,revision:3},'revise_plan'),'PT409');
  await invalidPatch(patch({...revise,rappels:0},'revise_plan'),'PT409');
  await invalidPatch(patch({...cp,revision:2},'revise_plan'),'PT409','checkpoint_transition_conflict');
  await save(revise,'revise_plan');
  cp={...revise,confirmes:[0,1,2]};await save(cp);
  await invalidPatch(patch({...cp,rappels:2}),'PT409','checkpoint_transition_conflict');
  await actor(writer);
  assert.equal((await status()).capabilities.checkpoint_write,false);
  await refuses(()=>save(cp),'42501','checkpoint_owner_required');
  await refuses(()=>write('adopt',adoptVersion,adoptPatch),'42501','checkpoint_owner_required');
  const legacyAfter=await write('writer-still-allowed',(await status()).mission.version,{next_action:'Writer historique'});
  assert.equal(Object.hasOwn(legacyAfter.result,'checkpoint'),false);
  assert.deepEqual((await status()).mission.checkpoint,cp,'ancien write ne detruit pas le checkpoint');
  await actor(reader);
  assert.deepEqual((await status()).mission.checkpoint,cp);
  assert.equal((await status()).capabilities.checkpoint_write,false);
  await refuses(()=>save(cp),'42501','writer_required');
  await refuses(()=>db.exec('update public.leo_missions set checkpoint=null'),'42501');
  await actor(stranger);
  await refuses(()=>status(),'42501');
  await refuses(()=>write('foreign',1,adoptPatch),'42501');
  assert.equal((await db.query('select * from public.leo_operations')).rows.length,0);
  await actor(null);await refuses(()=>status(),'42501','authentication_required');
  for(const role of ['anon','service_role']){await actor(owner,role);await refuses(()=>write('forbidden',1,adoptPatch),'42501');}
  await actor(owner);
  await db.query('select public.leo_stop($1)',[mission]);
  await invalidPatch(patch(cp),'P0001','mission_stopped');
  assert.deepEqual((await write('adopt',adoptVersion,adoptPatch)).result,adopted.result,'recu checkpoint original apres evolution et stop');
  assert.deepEqual((await write('legacy',1,legacyPatch)).result,legacy.result,'recu ancien apres stop');
  await db.exec('reset role');
  for(const [n,options] of [[20,{limit:0}],[21,{expiry:'-1 day'}],[22,{contract:'old'}],[23,{version:9007199254740991}]])await seed(id(n),options);
  await seed(id(24));
  await db.query(`insert into public.leo_operations(mission_id,operation_id,base_version,payload,status)
    values($1,'unknown',1,$2::jsonb,'unknown')`,[id(24),JSON.stringify({expected_version:1,patch:adoptPatch})]);
  await db.query("update public.leo_missions set expires_at=clock_timestamp()-interval '1 day' where id=$1",[mission]);
  await actor(owner);
  assert.equal((await write('adopt',adoptVersion,adoptPatch)).replayed,true,'recu conserve apres expiration');
  for(const [n,version,message] of [[20,1,'budget_exhausted'],[21,1,'mission_expired'],[22,1,'version_scope_denied'],[23,9007199254740991,'version_exhausted']]){
    const before=await status(id(n));
    await refuses(()=>write('refused',version,adoptPatch,id(n)),'P0001',message);
    assert.deepEqual(await status(id(n)),before);
  }
  const beforeUnknown=await status(id(24));
  await refuses(()=>write('unknown',1,adoptPatch,id(24)),'P0001','operation_unresolved');
  assert.deepEqual(await status(id(24)),beforeUnknown,'issue inconnue jamais rejouee');
  console.log('Checkpoint SQL fixture : garde de derive, recus anciens/nouveaux, owner/RLS, CAS sequentiel, transitions, arret, expiration et budget.');
}finally{await db.close();}
