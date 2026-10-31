// Les deux scripts de vérification que Paul collera dans l'éditeur SQL
// (supabase/verifs/supervision-*.sql) — validés sur un cas dont on connaît la
// réponse : migration intacte → tout vert ; migration sabotée → le script le dit.
// Un instrument jamais vu en rouge ne prouve rien.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const lire = (c) => readFileSync(new URL(c, import.meta.url), 'utf8');
const amorce = lire('./fixtures/leo-appels-bootstrap.sql');
const migration = lire('../supabase/migrations/20261031150000_supervision_decisions.sql');
const etat = lire('../supabase/verifs/supervision-1-etat.sql');
const parcours = lire('../supabase/verifs/supervision-2-parcours-annule.sql');

async function base(sql) {
  const db = new PGlite();
  await db.exec(amorce);
  await db.exec(sql);
  return db;
}
async function lancerParcours(db) {
  try { await db.exec(parcours); return 'aucune exception'; } catch (e) { return String(e.message); }
}

// ── 1. Migration intacte : 12 lignes vraies, parcours OK, rien ne reste ────
{
  const db = await base(migration);
  const r = (await db.query(etat)).rows;
  assert.equal(r.length, 12, 'nombre de vérifications');
  assert.deepEqual(r.filter((l) => l.ok !== true).map((l) => l.verif), []);
  const m = await lancerParcours(db);
  assert.match(m, /^PARCOURS_OK : .*refus tenu même avec une preuve ajoutée, faux ID refusé \(invalid_proof\), invisible pour un autre compte/, m);
  assert.equal((await db.query('select count(*)::int as n from public.supervision_decisions')).rows[0].n, 0, 'le parcours a laissé des lignes');
  // Rejouable : la base est revenue vide.
  assert.match(await lancerParcours(db), /^PARCOURS_OK/);
}

// ── 2. Sabotages : chaque script vire au rouge sur ce qu'il garde ──────────
const sabotages = [
  ['insert direct accordé', 'grant select on public.supervision_decisions to authenticated;',
    'grant select, insert on public.supervision_decisions to authenticated;', 10],
  ['policy en écriture ajoutée', 'alter table public.supervision_decisions enable row level security;',
    'alter table public.supervision_decisions enable row level security;\ncreate policy p on public.supervision_decisions for insert with check (true);', 4],
  ['search_path non figé', "p_preuves text[], p_proposition jsonb\n) returns jsonb\nlanguage plpgsql security definer set search_path = ''",
    'p_preuves text[], p_proposition jsonb\n) returns jsonb\nlanguage plpgsql security definer', 6],
  ['empreinte appelable', "revoke all on function public.supervision_empreinte(text, text, text[]) from public, anon, authenticated;",
    'grant execute on function public.supervision_empreinte(text, text, text[]) to authenticated;', 7],
  ['anon admis', 'revoke all on function public.supervision_retirer(uuid) from public, anon;',
    'grant execute on function public.supervision_retirer(uuid) to anon;', 8],
];
for (const [nom, a, b, ligne] of sabotages) {
  assert.ok(migration.includes(a), `motif absent : ${nom}`);
  const db = await base(migration.replace(a, b));
  const faux = (await db.query(etat)).rows.filter((l) => l.ok !== true).map((l) => l.n);
  assert.ok(faux.includes(ligne), `${nom} : la ligne ${ligne} reste vraie (fausses : ${faux})`);
}
{ // le parcours voit un refus qui ne tient pas (verrou S1 retiré, réouverture sans date)
  const a = "      and d.statut = 'REFUSEE'\n      and (d.prochain_reexamen_le is null";
  assert.ok(migration.includes(a), 'motif du verrou de refus absent');
  const db = await base(migration.replace(a, "      and d.statut = 'JAMAIS'\n      and (d.prochain_reexamen_le is null"));
  assert.match(await lancerParcours(db), /^ECHEC/);
}
{ // et une preuve inventée qui passerait
  const a = "u.id !~ '^(zoh|finubar):";
  const db = await base(migration.replace(a, "u.id !~ '^(zoh|finubar|fake-uuid):|^fake-uuid-123$|^"));
  assert.match(await lancerParcours(db), /^ECHEC/);
}
{ // sans migration : la lecture dit tout faux, sans planter
  const db = await base('select 1;');
  const r = (await db.query(etat)).rows;
  assert.equal(r.length, 12);
  assert.ok(r.every((l) => l.ok === false), 'une vérification vraie sans migration : ' + r.filter((l) => l.ok !== false).map((l) => l.n));
}

console.log('✓ supervision-verifs : scripts de Paul éprouvés, verts sur la migration, rouges sur ses sabotages');
