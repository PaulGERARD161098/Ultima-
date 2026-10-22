// Unitaires — le plafond d'appels de Léo, EXÉCUTÉ sur PostgreSQL en mémoire (PGlite).
// Pourquoi en plus de `tests/leo-appels-postgres.sh` : ce script-là exige un PostgreSQL
// installé et un utilisateur non-root — il ne tourne pas dans `run-unit.mjs`, donc pas
// dans le job `unit` de la CI. Celui-ci rejoue en Node pur ce qu'un PGlite séquentiel
// peut prouver : le 101ᵉ appel refusé, une rafale dans UN SEUL ordre refusée, les droits
// par colonnes, l'unicité d'une trace, et le couplage plafond ⇄ policy SELECT.
// ⚠️ La COURSE entre deux sessions (verrou consultatif) ne se prouve pas ici — PGlite n'a
// qu'une connexion — elle reste au harnais PostgreSQL réel.
// Aucune base réelle : des identifiants de test, rien d'autre.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8');
const migration = process.env.LEO_APPELS_MIGRATION
  ? readFileSync(process.env.LEO_APPELS_MIGRATION, 'utf8')
  : lire('../supabase/migrations/20261019160000_leo_appels.sql');
const amorce = lire('./fixtures/leo-appels-bootstrap.sql');

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const C = '33333333-3333-4333-8333-333333333333';
const verdicts = {};
const db = new PGlite();

async function en(uid, role = 'authenticated') {
  await db.exec(`reset role; set role ${role};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid || '']);
}
async function superuser() { await db.exec('reset role;'); }
/** Le code SQLSTATE de l'échec, ou null si l'ordre a réussi. */
async function code(fn) {
  try { await fn(); return null; } catch (e) { return e.code || `?${String(e.message).slice(0, 40)}`; }
}
/** Le message de l'échec (pour distinguer un droit de colonne d'une RLS), ou ''. */
async function message(fn) {
  try { await fn(); return ''; } catch (e) { return String(e.message); }
}
const poser = (phase = 'tentee', trace = null) => db.query(
  'insert into public.leo_appels(trace_id,quadrant,modele,phase) values (coalesce($1::uuid, gen_random_uuid()),$2,$3,$4)',
  [trace, 'riven', 'test', phase]);
async function lignes(uid) {
  await superuser();
  return Number((await db.query('select count(*)::int as n from public.leo_appels where owner_id=$1', [uid])).rows[0].n);
}

await db.exec(amorce);
await db.exec(migration);

// ── 0. Verrou de non-vacuité ─────────────────────────────────────────────────
verdicts.tableEtComptes = (await lignes(A)) === 0 &&
  Number((await db.query('select count(*)::int as n from auth.users')).rows[0].n) === 4;

// ── 1. Le plafond : 100 passent, la 101ᵉ est refusée PT429 ───────────────────
await en(A);
let toutesPassent = true;
for (let i = 0; i < 100; i += 1) { if (await code(() => poser())) toutesPassent = false; }
verdicts.centTentativesPassent = toutesPassent && (await lignes(A)) === 100;
await en(A);
verdicts.centUniemeRefusee = (await code(() => poser())) === 'PT429' && (await lignes(A)) === 100;
{
  await en(A);
  let message = '';
  try { await poser(); } catch (e) { message = e.message; }
  verdicts.messagePlafond = message.includes('leo_calls_quota_exhausted');
}
await en(B);
verdicts.autreProprietairePasTouche = (await code(() => poser())) === null && (await lignes(B)) === 1;
await en(A);
verdicts.uneIssueNeComptePas = (await code(() => poser('reussie'))) === null && (await lignes(A)) === 101;

// ── 2. Une RAFALE dans un seul ordre ne passe pas sous le seuil ──────────────
// 150 lignes d'un coup pour un propriétaire neuf : le plafond mord DANS l'ordre
// (les lignes précédentes de la même instruction sont comptées), rien n'est posé.
await en(C);
const rafale = await code(() => db.query(
  `insert into public.leo_appels(trace_id,quadrant,modele,phase)
   select gen_random_uuid(),'riven','test','tentee' from generate_series(1,150)`));
verdicts.rafaleRefusee = rafale === 'PT429' && (await lignes(C)) === 0;

// ── 3. Les droits : par colonnes, journal non corrigeable, RLS ───────────────
await en(A);
verdicts.leChoisiParLeClientRefuse = (await code(() => db.query(
  `insert into public.leo_appels(trace_id,quadrant,modele,phase,le)
   values (gen_random_uuid(),'riven','test','reussie', now() - interval '3 days')`))) === '42501';
verdicts.idChoisiRefuse = (await code(() => db.query(
  `insert into public.leo_appels(id,trace_id,quadrant,modele,phase)
   values (gen_random_uuid(),gen_random_uuid(),'riven','test','reussie')`))) === '42501';
const auNomDAutrui = () => db.query(
  `insert into public.leo_appels(owner_id,trace_id,quadrant,modele,phase)
   values ($1,gen_random_uuid(),'riven','test','reussie')`, [B]);
verdicts.ecritureAuNomDAutruiRefuseeParLeDroitDeColonne =
  (await code(auNomDAutrui)) === '42501' && (await message(auNomDAutrui)).includes('permission denied');
// Le « upsert » est un UPDATE déguisé : refusé aussi (le droit UPDATE est retiré).
verdicts.upsertRefuse = (await code(() => db.query(
  `insert into public.leo_appels(trace_id,quadrant,modele,phase) values (gen_random_uuid(),'riven','test','reussie')
   on conflict (id) do update set quadrant = 'x'`))) === '42501';
verdicts.updateDeleteTruncateRefuses =
  (await code(() => db.exec("update public.leo_appels set quadrant = 'x'"))) === '42501' &&
  (await code(() => db.exec('delete from public.leo_appels'))) === '42501' &&
  (await code(() => db.exec('truncate public.leo_appels'))) === '42501';
verdicts.fonctionDuPlafondInappelable = (await code(() => db.query('select leo_private.appels_plafond()'))) === '42501';
await en(A, 'anon');
verdicts.aucunAccesAnonyme = (await code(() => db.query('select count(*) from public.leo_appels'))) === '42501';
await en(B);
{
  const vus = (await db.query('select count(*)::int as n, count(*) filter (where owner_id <> $1)::int as autres from public.leo_appels', [B])).rows[0];
  verdicts.unProprietaireNeLitQueSesLignes = vus.n === 1 && vus.autres === 0;
}

// Défense en profondeur : la RLS d'INSERT tient SEULE. On rouvre temporairement le droit
// de colonne sur owner_id — l'écriture au nom d'autrui doit alors tomber sur la RLS.
await superuser();
await db.exec('grant insert (owner_id) on public.leo_appels to authenticated');
await en(A);
verdicts.rlsInsertTientSeule = (await message(auNomDAutrui)).includes('row-level security');
await superuser();
await db.exec('revoke insert (owner_id) on public.leo_appels from authenticated');

// L'horloge est celle de la base, MÊME pour un chemin privilégié qui fournit « le ».
await superuser();
await db.query(
  `insert into public.leo_appels(owner_id,trace_id,quadrant,modele,phase,le)
   values ($1,gen_random_uuid(),'riven','test','reussie', now() - interval '3 days')`, [C]);
verdicts.horlogeDeLaBase = Number((await db.query(
  `select extract(epoch from (clock_timestamp() - max(le)))::int as age
   from public.leo_appels where owner_id=$1 and phase='reussie'`, [C])).rows[0].age) < 60;

// ── 4. Une trace = UNE tentative et UNE issue ────────────────────────────────
const TRACE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
await en(C);
verdicts.premiereTentee = (await code(() => poser('tentee', TRACE))) === null;
verdicts.tenteeRejoueeRefusee = (await code(() => poser('tentee', TRACE))) === '23505';
verdicts.issueDeLaTrace = (await code(() => poser('reussie', TRACE))) === null;
verdicts.secondeIssueRefusee = (await code(() => poser('echouee', TRACE))) === '23505';

// ── 5. Le plafond COMPTE à travers la policy SELECT ──────────────────────────
// Preuve de la consigne écrite dans la migration : un SELECT restreint rend le compte
// faux, donc le plafond muet. On restreint la policy, on constate que le 101ᵉ passe,
// puis on la rétablit et on constate que le plafond mord de nouveau.
await superuser();
await db.exec('alter policy leo_appels_select on public.leo_appels using (false)');
await en(A);
const muet = await code(() => poser());
await superuser();
await db.exec('alter policy leo_appels_select on public.leo_appels using (owner_id = (select auth.uid()))');
await en(A);
verdicts.selectRestreintRendLePlafondMuet = muet === null;
verdicts.selectRetabliLePlafondMord = (await code(() => poser())) === 'PT429';

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.keys(verdicts).length >= 22 && Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-LEO-APPELS-SQL OK' : 'UNIT-LEO-APPELS-SQL ECHEC');
process.exit(ok ? 0 : 1);
