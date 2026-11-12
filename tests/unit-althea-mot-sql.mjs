import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const migration = readFileSync(new URL(
  '../supabase/migrations/20261112210737_althea_mots_du_jour.sql', import.meta.url), 'utf8');
const premier = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const lire = () => db.query('select mot from public.althea_mots_du_jour order by jour');
const ecrire = (mot) => db.query(`
  insert into public.althea_mots_du_jour (jour, mot) values ('2026-11-12', $1)
  on conflict (owner_id, jour) do update set mot = excluded.mot returning mot`, [mot]);
const identite = (id) => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated;
  `);
  await db.query('insert into auth.users (id) values ($1), ($2)', [premier, second]);
  await db.exec(migration);
  await db.exec('set role authenticated');
  await identite(premier);
  assert.deepEqual((await ecrire('Premier mot')).rows, [{ mot: 'Premier mot' }]);
  await ecrire('Mot corrigé');
  assert.deepEqual((await lire()).rows, [{ mot: 'Mot corrigé' }]);
  await assert.rejects(ecrire(' '.repeat(3)), { code: '23514' });
  await assert.rejects(ecrire('x'.repeat(281)), { code: '23514' });

  await identite(second);
  assert.deepEqual((await lire()).rows, []);
  await assert.rejects(db.query(`
    insert into public.althea_mots_du_jour (owner_id, jour, mot)
    values ($1, '2026-11-13', 'écriture refusée')`, [premier]), { code: '42501' });
  await ecrire('Autre compte, même date');
  assert.deepEqual((await lire()).rows, [{ mot: 'Autre compte, même date' }]);
  await identite(premier);
  assert.deepEqual((await lire()).rows, [{ mot: 'Mot corrigé' }]);
  await db.exec('reset role; set role anon');
  await assert.rejects(lire(), { code: '42501' });

  await db.exec(`
    reset role;
    create temp table releves (jour date);
    create trigger garde_avant_insert
      before insert on releves for each row execute function public.althea_refuse_jour_futur();
  `);
  const dateParis = "(statement_timestamp() at time zone 'Europe/Paris')::date";
  // Au moins un des deux fuseaux doit différer de Paris quelle que soit l'heure.
  await db.exec("set time zone 'Pacific/Kiritimati'");
  if ((await db.query(`select current_date = ${dateParis} as pareil`)).rows[0].pareil) {
    await db.exec("set time zone 'Etc/GMT+12'");
  }
  assert.equal((await db.query(`select current_date = ${dateParis} as pareil`)).rows[0].pareil, false);
  await db.query(`insert into releves values (${dateParis} - 1), (${dateParis})`);
  await assert.rejects(db.query(`insert into releves values (${dateParis} + 1)`), { code: '23514' });
  assert.equal((await db.query('select count(*)::int as total from releves')).rows[0].total, 2);
  console.log('Mot du jour et garde de date vérifiés sur PostgreSQL isolé.');
} finally {
  await db.close();
}
