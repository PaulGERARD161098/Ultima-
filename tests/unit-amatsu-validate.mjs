// AMATSU, le dragon de l'air — boucle 2a (CADRAGE-IMLADRIK.md §12, 18/10/2026).
// Node pur, zéro réseau. Ce que ce harnais prouve :
//   ① `validateLectureAmatsu` est le MIROIR des CHECK de la migration
//      `20261018160000_amatsu_lectures.sql` — les bornes sont LUES dans le SQL,
//      pas recopiées ; une borne changée d'un seul côté fait rougir ;
//   ② la migration tient les invariants du dépôt : RLS activée, une policy par
//      opération permise (select, insert, delete), AUCUNE policy UPDATE (une
//      lecture se relit, ne se corrige pas), anon sans droit, owner_id scellé ;
//   ③ le défaire sait la défaire : DEFAIRES pointe `amatsu_lectures` sans
//      retouche, DEPENDANCES la connaît (vide : rien ne naît dessus en 2a) ;
//   ④ la main est transversale EXACTEMENT sur RIVEN, ADRAMELECH, IMLADRIK.
// ⛔ Chaque recherche d'absence est précédée de son verrou de non-vacuité.
import { readFileSync } from 'node:fs';
import { validateLectureAmatsu, LECTURE_AMATSU_BORNES } from '../api/_lib/validate.js';
import { DEFAIRES, DEPENDANCES } from '../api/_lib/leo-execution.js';
import { OUTILS_PAR_QUADRANT, anneauDe } from '../api/_lib/leo.js';

const verdicts = {};
const SQL = readFileSync(new URL('../supabase/migrations/20261018160000_amatsu_lectures.sql', import.meta.url), 'utf8');
// Le CODE seul : les commentaires de la migration nomment `updated_at` et
// l'initplan pour dire pourquoi ils sont absents — on ne les compte pas.
const CODE = SQL.replace(/--[^\n]*/g, '');
const BON = { objet: 'Reprendre la boutique', bise: 'oui', souffle: 'oui, c’est moi', ouragan: 'non' };

// ---------- 1. Nominal : détouré, les quatre champs, rien de plus ----------
{
  const { value, error } = validateLectureAmatsu({ ...BON, objet: '  Reprendre la boutique  ' });
  verdicts.nominal = !error && JSON.stringify(value) === JSON.stringify(BON);
}
// ---------- 2. Les quatre sont requis, non vides ----------
verdicts.quatreRequis = Object.keys(BON).every((champ) => {
  const sans = { ...BON }; delete sans[champ];
  return !!validateLectureAmatsu(sans).error && !!validateLectureAmatsu({ ...BON, [champ]: '  ' }).error &&
    !!validateLectureAmatsu({ ...BON, [champ]: 42 }).error;
});
// ---------- 3. Rien de plus : ni owner_id, ni note, ni date ----------
verdicts.rejetSurnumeraire = !!validateLectureAmatsu({ ...BON, owner_id: 'u' }).error &&
  !!validateLectureAmatsu({ ...BON, note: '7/10' }).error &&
  !!validateLectureAmatsu({ ...BON, created_at: '2026-10-18' }).error &&
  !!validateLectureAmatsu(null).error && !!validateLectureAmatsu([BON]).error;
// ---------- 4. Les erreurs ne portent aucun contenu dicté ----------
verdicts.erreursSansContenu = !/boutique/.test(validateLectureAmatsu({ ...BON, bise: '' }).error);

// ---------- 5. Bornes : LUES dans la migration, égales à l'API, tenues à la limite ----------
{
  const lues = {};
  for (const m of SQL.matchAll(/char_length\((\w+)\) between 1 and (\d+)/g)) lues[m[1]] = Number(m[2]);
  verdicts.bornesNonVides = Object.keys(lues).length === 4;
  verdicts.bornesMiroir = JSON.stringify(lues) === JSON.stringify(LECTURE_AMATSU_BORNES);
  verdicts.bornesTenues = Object.entries(LECTURE_AMATSU_BORNES).every(([champ, max]) =>
    !validateLectureAmatsu({ ...BON, [champ]: 'x'.repeat(max) }).error &&
    !!validateLectureAmatsu({ ...BON, [champ]: 'x'.repeat(max + 1) }).error);
}

// ---------- 6. La migration : RLS, trois policies, pas d'UPDATE, anon dehors ----------
{
  const policies = [...CODE.matchAll(/create policy (\w+) on public\.amatsu_lectures\s+for (\w+)/g)].map((m) => m[2]);
  verdicts.rlsActivee = /alter table public\.amatsu_lectures enable row level security/.test(CODE);
  verdicts.troisPolicies = policies.sort().join() === 'delete,insert,select';
  verdicts.aucuneRetouche = !policies.includes('update') && !/updated_at/.test(CODE);
  verdicts.ownerScelle = /owner_id\s+uuid not null default auth\.uid\(\)/.test(CODE) &&
    /unique \(owner_id, id\)/.test(CODE);
  // Tout retirer à public, anon ET authenticated (défauts Supabase), puis ne
  // donner que select, insert, delete. Le défaut laissait UPDATE et TRUNCATE au
  // rôle connecté — TRUNCATE passe sous la RLS (relu le 19/10, avant application).
  verdicts.toutRetireAvantDeDonner =
    /revoke all on public\.amatsu_lectures from public, anon, authenticated;/.test(CODE) &&
    CODE.indexOf('revoke all on public.amatsu_lectures') < CODE.indexOf('grant select, insert, delete on public.amatsu_lectures to authenticated;');
  verdicts.grantFerme = (CODE.match(/grant [^;]+ on public\.amatsu_lectures/g) || []).join('|') ===
    'grant select, insert, delete on public.amatsu_lectures';
  verdicts.ni_update_ni_truncate = !/grant[^;]*\b(update|truncate|all)\b[^;]*amatsu_lectures/i.test(CODE);
  verdicts.initplan = (CODE.match(/\(select auth\.uid\(\)\)/g) || []).length === 3;
  verdicts.nonAppliquee = /NON APPLIQUÉE/.test(SQL);
}

// ---------- 7. Le défaire et le relevé ----------
verdicts.defaireConnu = DEFAIRES.proposer_lecture_amatsu &&
  DEFAIRES.proposer_lecture_amatsu.table === 'amatsu_lectures' &&
  DEFAIRES.proposer_lecture_amatsu.retouche === false &&
  DEFAIRES.proposer_lecture_amatsu.libelle.colonne === 'objet';
verdicts.releveConnu = Array.isArray(DEPENDANCES.amatsu_lectures) && DEPENDANCES.amatsu_lectures.length === 0;

// ---------- 8. Transversal : exactement trois quadrants, vert ----------
{
  const porteurs = Object.keys(OUTILS_PAR_QUADRANT)
    .filter((q) => OUTILS_PAR_QUADRANT[q].some((o) => o.name === 'proposer_lecture_amatsu')).sort();
  verdicts.transversalTroisQuadrants = porteurs.join() === 'adramelech,imladrik,riven';
  verdicts.vert = anneauDe('proposer_lecture_amatsu') === 'vert';
  const schema = OUTILS_PAR_QUADRANT.imladrik.find((o) => o.name === 'proposer_lecture_amatsu');
  verdicts.schemaQuatreRequis = schema && schema.input_schema.required.sort().join() === 'bise,objet,ouragan,souffle' &&
    schema.input_schema.additionalProperties === false &&
    Object.entries(schema.input_schema.properties).every(([k, p]) => p.maxLength === LECTURE_AMATSU_BORNES[k]);
}

// ---------- 9. LA MIGRATION EXÉCUTÉE, du côté où elle peut céder ----------
// Un Postgres jetable (PGlite, en mémoire) qui reproduit ce que Supabase fait
// d'une table neuve : TOUS les droits par défaut à anon et authenticated. La
// migration y est jouée telle quelle, puis attaquée : un autre compte, anon, une
// modification, un vidage. Rien ne touche la base réelle.
{
  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const A = '00000000-0000-4000-8000-0000000000a1';
  const B = '00000000-0000-4000-8000-0000000000b2';
  const tente = async (sql) => { try { return { ok: true, r: await db.query(sql) }; } catch (e) { return { ok: false, e: String(e.message || e) }; } };
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');`);
  await db.exec(SQL.replace(/^begin;$/m, '').replace(/^commit;$/m, ''));
  const droit = async (role, quoi) => (await db.query(
    `select has_table_privilege('${role}', 'public.amatsu_lectures', '${quoi}') as d`)).rows[0].d;
  verdicts.pg_authentifieSansUpdate = (await droit('authenticated', 'update')) === false;
  verdicts.pg_authentifieSansTruncate = (await droit('authenticated', 'truncate')) === false;
  verdicts.pg_authentifieLitEcritSupprime = (await droit('authenticated', 'select')) === true &&
    (await droit('authenticated', 'insert')) === true && (await droit('authenticated', 'delete')) === true;
  verdicts.pg_anonSansRien = (await Promise.all(['select', 'insert', 'update', 'delete', 'truncate']
    .map((q) => droit('anon', q)))).every((d) => d === false);
  // Paul (A) écrit une lecture ; B ne la voit pas ; A ne peut pas la modifier.
  await db.exec(`set role authenticated; set request.jwt.claim.sub = '${A}';
    insert into public.amatsu_lectures (objet, bise, souffle, ouragan) values ('x', 'b', 's', 'o');`);
  const vueParA = (await db.query('select count(*)::int as n from public.amatsu_lectures')).rows[0].n;
  const modif = await tente(`update public.amatsu_lectures set objet = 'retouche'`);
  const vidage = await tente('truncate public.amatsu_lectures');
  await db.exec(`set request.jwt.claim.sub = '${B}';`);
  const vueParB = (await db.query('select count(*)::int as n from public.amatsu_lectures')).rows[0].n;
  const usurpation = await tente(`insert into public.amatsu_lectures (owner_id, objet, bise, souffle, ouragan) values ('${A}', 'y', 'b', 's', 'o')`);
  await db.exec('reset role;');
  const intacte = (await db.query(`select count(*)::int as n from public.amatsu_lectures where objet = 'x'`)).rows[0].n;
  // Verrou de non-vacuité : la lecture existe bien, sinon « B ne voit rien » ne prouve rien.
  verdicts.pg_verrouUneLecture = vueParA === 1 && intacte === 1;
  verdicts.pg_cloisonnement = vueParB === 0;
  verdicts.pg_pasDeModification = modif.ok === false && /permission denied/i.test(modif.e);
  verdicts.pg_pasDeVidage = vidage.ok === false && /permission denied/i.test(vidage.e);
  verdicts.pg_pasDUsurpation = usurpation.ok === false && /row-level security/i.test(usurpation.e);
  await db.close();
}

let echecs = 0;
for (const [nom, v] of Object.entries(verdicts)) {
  if (v !== true) echecs += 1;
  console.log(`  ${v === true ? '✅' : '❌'} ${nom}`);
}
console.log(echecs === 0 ? 'UNIT AMATSU VALIDATE OK' : `${echecs} verdict(s) en échec`);
process.exit(echecs === 0 ? 0 : 1);
