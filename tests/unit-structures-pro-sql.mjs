// Dry Run SQL — migration multi-structures pro éprouvée sur PostgreSQL isolé (PGlite).
// Attaque les garde-fous du côté contournable :
//  1. RLS stricte par propriétaire sur les 4 tables.
//  2. Aucun accès pour `anon`.
//  3. Aucun DELETE pour `authenticated`.
//  4. `owner_id` et `structure_id` figés à la création (impossible de déplacer une tâche d'une structure à une autre).
//  5. FK composite sur `pro_documents` : impossible de rattacher un document `sola-air-paris`
//     à un dossier `amo`, ni à un dossier d'un autre propriétaire.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const migration = readFileSync(
  new URL('../supabase/migrations/20261123180000_structures_pro_direction.sql', import.meta.url),
  'utf8'
);

const paul = '00000000-0000-4000-8000-000000000001';
const autre = '00000000-0000-4000-8000-000000000002';
const identite = (id) => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);

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
  await db.query('insert into auth.users (id) values ($1), ($2)', [paul, autre]);
  await db.exec(migration);

  // Verrou de non-vacuité : 4 tables, RLS active, 3 policies chacune
  for (const table of ['pro_taches', 'pro_dossiers', 'pro_documents', 'pro_fils_leo']) {
    const rls = (await db.query(`select relrowsecurity from pg_class where oid = 'public.${table}'::regclass`)).rows[0];
    assert.equal(rls.relrowsecurity, true, `RLS absente sur ${table}`);
    const pol = (await db.query('select count(*)::int as n from pg_policies where tablename = $1', [table])).rows[0];
    assert.equal(pol.n, 3, `3 policies attendues sur ${table}`);
  }

  // Session Paul
  await db.exec('set role authenticated');
  await identite(paul);

  // Création dans les 3 structures
  const { rows: [tacheRb] } = await db.query(`
    insert into public.pro_taches (structure_id, titre, type, priorite)
    values ('renoboost-ia', 'Relancer pro Lyon', 'relance', 'haute')
    returning id, structure_id
  `);
  assert.equal(tacheRb.structure_id, 'renoboost-ia');

  // Refus d'une structure inconnue ou 'direction'
  await assert.rejects(
    db.query("insert into public.pro_taches (structure_id, titre) values ('direction', 'Interdit')"),
    { code: '23514' }
  );

  // Tentative de déplacer une tâche de renoboost-ia vers amo → refus colonne (42501)
  await assert.rejects(
    db.query("update public.pro_taches set structure_id = 'amo' where id = $1", [tacheRb.id]),
    { code: '42501' }
  );

  // Tentative de DELETE ou changer owner_id → refus (42501)
  await assert.rejects(db.query('delete from public.pro_taches'), { code: '42501' });
  await assert.rejects(db.query('update public.pro_taches set owner_id = $1', [autre]), { code: '42501' });

  // Dossier AMO + document Sola Air Paris tentant de s'y rattacher → FK composite BLOQUE (23503)
  const { rows: [dossierAmo] } = await db.query(`
    insert into public.pro_dossiers (structure_id, titre)
    values ('amo', 'Résidence République')
    returning id
  `);
  await assert.rejects(
    db.query(`
      insert into public.pro_documents (structure_id, dossier_id, type, titre, contenu)
      values ('sola-air-paris', $1, 'compte_rendu', 'CR intrus', 'Contenu')
    `, [dossierAmo.id]),
    { code: '23503' }
  );

  // Même document rattaché au bon dossier AMO → PASS
  const { rows: [docAmo] } = await db.query(`
    insert into public.pro_documents (structure_id, dossier_id, type, titre, contenu)
    values ('amo', $1, 'compte_rendu', 'CR chantier', 'Décidé : validation lot CVC.')
    returning id, structure_id
  `, [dossierAmo.id]);
  assert.equal(docAmo.structure_id, 'amo');

  // Document sans dossier (dossier_id NULL) → PASS
  await db.query(`
    insert into public.pro_documents (structure_id, type, titre, contenu)
    values ('sola-air-paris', 'brouillon_mail', 'Mail Matthieu', 'Bonjour Matthieu...')
  `);

  // Fils Léo cloisonnés (direction + structures)
  await db.query(`
    insert into public.pro_fils_leo (scope, messages)
    values ('direction', '[{"role":"user","content":"Point global"}]'::jsonb)
  `);

  // Autre utilisateur : ne voit aucune ligne et ne peut rien modifier
  await identite(autre);
  assert.equal((await db.query('select * from public.pro_taches')).rows.length, 0);
  assert.equal((await db.query('select * from public.pro_dossiers')).rows.length, 0);
  assert.equal((await db.query('select * from public.pro_documents')).rows.length, 0);
  assert.equal((await db.query('select * from public.pro_fils_leo')).rows.length, 0);

  // Anon : zéro lecture
  await db.exec('reset role; set role anon');
  await assert.rejects(db.query('select * from public.pro_taches'), { code: '42501' });
  await assert.rejects(db.query('select * from public.pro_documents'), { code: '42501' });

  console.log('OK unit-structures-pro-sql (PGlite)');
} finally {
  await db.close();
}
