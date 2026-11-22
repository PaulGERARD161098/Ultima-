// CARADRYEL C1 — la migration éprouvée sur un PostgreSQL isolé (PGlite).
// Prouve : RLS par propriétaire, rien pour anon, pas de DELETE, owner_id figé,
// identifiant Drive en alphabet fermé, initialisation idempotente.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const migration = readFileSync(new URL(
  '../supabase/migrations/20261122220000_caradryel_oeuvres.sql', import.meta.url), 'utf8');
const premier = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const ID = 'AbCdEfGhIjKlMnOpQrStUvWxYz_0123456789-xy';
const identite = (id) => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
const titres = async () => (await db.query('select titre from public.caradryel_oeuvres order by ordre')).rows.map((r) => r.titre);
const initialiser = () => db.query(`
  insert into public.caradryel_oeuvres (titre, ordre)
  values ('Œuvre A', 1), ('Œuvre B', 2), ('Œuvre C', 3), ('Œuvre D', 4)
  on conflict (owner_id, titre) do nothing`);

try {
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
  `);
  await db.query('insert into auth.users (id) values ($1), ($2)', [premier, second]);
  await db.exec(migration);

  // Verrou de non-vacuité : la table existe bien, avec RLS active et 3 policies.
  const rls = (await db.query("select relrowsecurity from pg_class where oid = 'public.caradryel_oeuvres'::regclass")).rows[0];
  assert.equal(rls.relrowsecurity, true);
  const pol = (await db.query("select count(*)::int as n from pg_policies where tablename = 'caradryel_oeuvres'")).rows[0];
  assert.equal(pol.n, 3);

  await db.exec('set role authenticated');
  await identite(premier);
  await initialiser();
  await initialiser(); // idempotent
  assert.deepEqual(await titres(), ['Œuvre A', 'Œuvre B', 'Œuvre C', 'Œuvre D']);

  // Liaison Drive : alphabet fermé.
  await db.query("update public.caradryel_oeuvres set drive_file_id = $1 where titre = 'Œuvre A'", [ID]);
  await assert.rejects(db.query("update public.caradryel_oeuvres set drive_file_id = 'https://evil.tld/x' where titre = 'Œuvre B'"), { code: '23514' });
  await assert.rejects(db.query("update public.caradryel_oeuvres set drive_file_id = 'court' where titre = 'Œuvre B'"), { code: '23514' });
  // Titre : bornes et espaces.
  await assert.rejects(db.query("insert into public.caradryel_oeuvres (titre) values ('   ')"), { code: '23514' });
  await assert.rejects(db.query("insert into public.caradryel_oeuvres (titre) values (' Espacé ')"), { code: '23514' });
  await assert.rejects(db.query(`insert into public.caradryel_oeuvres (titre) values ('${'x'.repeat(121)}')`), { code: '23514' });

  // Le garde-fou, du côté contournable : DELETE, changer owner_id, titre, s'insérer chez l'autre.
  await assert.rejects(db.query('delete from public.caradryel_oeuvres'), { code: '42501' });
  await assert.rejects(db.query('update public.caradryel_oeuvres set owner_id = $1', [second]), { code: '42501' });
  await assert.rejects(db.query("update public.caradryel_oeuvres set titre = 'Renommé'"), { code: '42501' });
  await assert.rejects(db.query(
    "insert into public.caradryel_oeuvres (owner_id, titre) values ($1, 'Intrus')", [second]), { code: '42501' });

  // Un autre compte ne voit rien et ne modifie rien.
  await identite(second);
  assert.deepEqual(await titres(), []);
  const maj = await db.query("update public.caradryel_oeuvres set ordre = 9 where titre = 'Œuvre A' returning id");
  assert.equal(maj.rows.length, 0);
  await initialiser(); // ses propres œuvres, mêmes titres permis
  assert.equal((await titres()).length, 4);
  await identite(premier);
  const a = (await db.query("select drive_file_id, ordre from public.caradryel_oeuvres where titre = 'Œuvre A'")).rows[0];
  assert.deepEqual(a, { drive_file_id: ID, ordre: 1 });

  // Anon : aucun accès.
  await db.exec('reset role; set role anon');
  await assert.rejects(db.query('select * from public.caradryel_oeuvres'), { code: '42501' });

  // Le script de vérification livré à Paul : tout vrai.
  await db.exec('reset role');
  const verif = (await db.query(`select
      not has_table_privilege('anon', 'public.caradryel_oeuvres', 'select') as anon_sans_lecture,
      not has_table_privilege('authenticated', 'public.caradryel_oeuvres', 'delete') as sans_delete,
      not has_column_privilege('authenticated', 'public.caradryel_oeuvres', 'owner_id', 'update') as owner_fige`)).rows[0];
  assert.deepEqual(verif, { anon_sans_lecture: true, sans_delete: true, owner_fige: true });

  console.log('CARADRYEL C1 : migration vérifiée sur PostgreSQL isolé.');
} finally {
  await db.close();
}
