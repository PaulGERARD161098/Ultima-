// PostgreSQL isolé en mémoire. Aucun accès au projet Supabase réel.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const db=new PGlite();
const uuid=(n)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const A=uuid(1),B=uuid(2),S=uuid(10),C1=uuid(11),C2=uuid(12);
try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;`);
  const dir=new URL('../supabase/migrations/',import.meta.url);
  for(const file of readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()) {
    // Seule adaptation du moteur : gen_random_uuid est natif en PostgreSQL,
    // PGlite ne fournit pas le paquet pgcrypto, inutilisé par les migrations.
    const sql=readFileSync(new URL(file,dir),'utf8').replace('create extension if not exists pgcrypto;','');
    await db.exec(sql);
  }
  await db.exec(`grant usage on schema public to authenticated, anon;
    grant select,insert,update,delete on all tables in schema public to authenticated, anon;
    insert into auth.users values ('${A}'),('${B}');
    insert into public.situations(id,owner_id,intitule) values ('${S}','${A}','Situation test');
    insert into public.scenarios(id,owner_id,situation_id,deroule) values
      ('${C1}','${A}','${S}','Branche 1'),('${C2}','${A}','${S}','Branche 2');
    insert into public.idees(id,owner_id,adr_num,nom,type) values
      ('${uuid(20)}','${A}',1,'Idée A','test'),('${uuid(21)}','${B}',1,'Idée B','test');
    insert into public.network_nodes(id,owner_id,type,nom) values
      ('${uuid(30)}','${A}','chantier','Chantier'),('${uuid(31)}','${B}','partenaire','Fournisseur B'),
      ('${uuid(32)}','${A}','partenaire','Fournisseur A');
    insert into public.intendant_chantiers(id,owner_id,node_id) values ('${uuid(40)}','${A}','${uuid(30)}');
    insert into public.althea_skills(id,owner_id,nom) values
      ('${uuid(50)}','${A}','Départ'),('${uuid(51)}','${A}','Évolution');
    update public.althea_skills set evolue_en='${uuid(51)}' where id='${uuid(50)}';
    set role authenticated; set request.jwt.claim.sub='${A}';`);

  await assert.rejects(db.exec(`insert into public.idees_liens(owner_id,source_id,target_id)
    values ('${A}','${uuid(20)}','${uuid(21)}')`),e=>e.code==='23503');
  await assert.rejects(db.exec(`insert into public.intendant_besoins(owner_id,chantier_id,designation,fournisseur_node_id,mode,commande_ref)
    values ('${A}','${uuid(40)}','test','${uuid(31)}','commande','BC-test')`),e=>e.code==='23503');
  await db.exec(`insert into public.intendant_besoins(id,owner_id,chantier_id,designation,fournisseur_node_id,mode,commande_ref)
    values ('${uuid(41)}','${A}','${uuid(40)}','test','${uuid(32)}','commande','BC-test');
    delete from public.network_nodes where id='${uuid(32)}';`);
  const besoin=(await db.query(`select owner_id,fournisseur_node_id from public.intendant_besoins where id='${uuid(41)}'`)).rows[0];
  assert.equal(besoin.owner_id,A);assert.equal(besoin.fournisseur_node_id,null);
  await db.exec(`delete from public.althea_skills where id='${uuid(51)}'`);
  const skill=(await db.query(`select owner_id,evolue_en from public.althea_skills where id='${uuid(50)}'`)).rows[0];
  assert.equal(skill.owner_id,A);assert.equal(skill.evolue_en,null);

  // L'absence d'accès n'est pas seulement vérifiée par inspection de policies.
  await db.exec(`set request.jwt.claim.sub='${B}'`);
  assert.equal((await db.query('select * from public.situations')).rows.length,0);
  assert.equal((await db.query(`select public.denouer_situation('${S}','${C1}') as result`)).rows[0].result,null);
  await db.exec(`set role anon; reset request.jwt.claim.sub`);
  assert.equal((await db.query('select * from public.idees')).rows.length,0);
  await assert.rejects(db.query(`select public.denouer_situation('${S}','${C1}')`),e=>e.code==='42501');

  // Provoquer un refus lors de la coupe : le choix doit lui aussi être annulé.
  await db.exec(`reset role;
    create function public.test_refus_coupe() returns trigger language plpgsql as $$
      begin raise exception 'test refus coupe'; end; $$;
    create trigger test_refus_coupe before delete on public.scenarios
      for each row execute function public.test_refus_coupe();
    set role authenticated; set request.jwt.claim.sub='${A}';`);
  await assert.rejects(db.query(`select public.denouer_situation('${S}','${C1}')`));
  const stillOpen=(await db.query(`select scenario_advenu_id from public.situations where id='${S}'`)).rows[0];
  assert.equal(stillOpen.scenario_advenu_id,null);
  assert.equal((await db.query(`select * from public.scenarios where situation_id='${S}'`)).rows.length,2);
  await db.exec(`reset role; drop trigger test_refus_coupe on public.scenarios;
    set role authenticated; set request.jwt.claim.sub='${A}';`);
  const result=(await db.query(`select public.denouer_situation('${S}','${C1}') as result`)).rows[0].result;
  assert.equal(result.coupees,1);assert.equal(result.scenario_advenu_id,C1);
  await db.exec(`delete from public.scenarios where id='${C1}'`);
  const reopened=(await db.query(`select id,owner_id,scenario_advenu_id,advenu_le from public.situations where id='${S}'`)).rows[0];
  assert.equal(reopened.id,S);assert.equal(reopened.owner_id,A);
  assert.equal(reopened.scenario_advenu_id,null);assert.equal(reopened.advenu_le,null);
  console.log('DATABASE audit OK : migrations, RLS de deux comptes, références, suppressions et rollback du dénouement');
} finally {await db.close();}
