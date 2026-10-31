// Supervision et réemploi — le registre EXÉCUTÉ sur PostgreSQL en mémoire (PGlite).
// Migration `20261031150000_supervision_decisions.sql` (non appliquée : gate de Paul).
// Recette du 31/10/2026, §1 et §3 : spam, résilience aux refus, déblocage,
// plus les défauts n° 3 à 9. Même montage que `unit-leo-appels-sql.mjs`.
// ⚠️ La course entre deux sessions (verrou consultatif) ne se prouve pas ici —
// PGlite n'a qu'une connexion.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), 'utf8');
const migration = process.env.SUPERVISION_MIGRATION
  ? readFileSync(process.env.SUPERVISION_MIGRATION, 'utf8')
  : lire('../supabase/migrations/20261031150000_supervision_decisions.sql');
const amorce = lire('./fixtures/leo-appels-bootstrap.sql');

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const C = '33333333-3333-4333-8333-333333333333';
const v = {};
const db = new PGlite();

async function en(uid, role = 'authenticated') {
  await db.exec(`reset role; set role ${role};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid || '']);
}
async function superuser() { await db.exec('reset role;'); }
async function code(fn) {
  try { await fn(); return null; } catch (e) { return e.code || `?${String(e.message).slice(0, 60)}`; }
}
const dossier = (extra = {}) => ({ id: 'p1', objetId: 'zoh:alpha', recommandation: 'conserver', ...extra });
async function soumettre(objet, rec, preuves, prop = dossier()) {
  const r = await db.query('select public.supervision_soumettre($1,$2,$3,$4,$5) as r',
    [prop.id ?? 'p1', objet, rec, preuves, JSON.stringify(prop)]);
  return r.rows[0].r;
}
const arbitrer = async (id, decision, notes = null) =>
  (await db.query('select public.supervision_arbitrer($1,$2,$3) as r', [id, decision, notes])).rows[0].r;
const retirer = async (id) => (await db.query('select public.supervision_retirer($1) as r', [id])).rows[0].r;
async function lignes(uid) {
  await superuser();
  return Number((await db.query('select count(*)::int as n from public.supervision_decisions where owner_id=$1', [uid])).rows[0].n);
}
// L'oracle de l'empreinte, indépendant de la base (défaut n° 4).
const SEP_U = String.fromCharCode(31), SEP_R = String.fromCharCode(30);
const empreinte = (objet, rec, preuves) =>
  createHash('sha256').update(`${objet}${SEP_U}${rec}${SEP_U}${[...preuves].sort().join(SEP_R)}`, 'utf8').digest('hex');

await db.exec(amorce);
await db.exec(migration);

// ── 0. Non-vacuité, et un fait doublé gardé : le format des identifiants ───
// Une fonction SQL n'importe pas le JS : le motif vit dans la migration ET dans
// `api/_lib/supervision-preuves.mjs`. S'ils divergent, l'un accepte ce que
// l'autre refuse.
{
  const js = lire('../api/_lib/supervision-preuves.mjs').match(/const ID = \/\^\(zoh\|finubar\|leo\):(.+?)\$\/;/);
  const corps = js && js[1];
  v.formatJsLu = corps === '([A-Za-z0-9][A-Za-z0-9._/-]{0,127})';
  const sansGroupe = corps && corps.slice(1, -1);
  v.formatObjetIdentique = migration.includes(`'^(zoh|finubar|leo):${sansGroupe}$'`);
  v.formatPreuveIdentique = migration.includes(`'^(zoh|finubar):${sansGroupe}$'`);
}
v.tableVide = (await lignes(A)) === 0;
{
  const f = await db.query(`select proname, prosecdef, proconfig from pg_proc
    where proname in ('supervision_soumettre','supervision_arbitrer','supervision_retirer','supervision_empreinte') order by proname`);
  v.quatreFonctions = f.rows.length === 4;
  v.searchPathFigePartout = f.rows.every((r) => (r.proconfig || []).some((c) => /^search_path=("")?$/.test(c)));
  v.troisDefinerUnInvoker = f.rows.filter((r) => r.prosecdef).length === 3;
}

// ── 1. Soumission nominale : empreinte calculée par la base ─────────────────
await en(A);
const r1 = await soumettre('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D']);
v.inseree = r1.resultat === 'inseree' && r1.statut === 'EN_ATTENTE';
await superuser();
{
  const l = (await db.query('select * from public.supervision_decisions where id=$1', [r1.id])).rows[0];
  v.empreinteConformeOracle = l.empreinte_materielle === empreinte('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D']);
  v.preuvesTriees = JSON.stringify(l.preuves_ids) === JSON.stringify(['finubar:P/D', 'zoh:alpha']);
  v.proprietaireImpose = l.owner_id === A;
  v.horlogeDeLaBase = Math.abs(Date.now() - new Date(l.cree_le).getTime()) < 60_000;
}

// ── 2. Spam d'agent : trois fois la même → une ligne, et Léo le SAIT ────────
await en(A);
const r2 = await soumettre('zoh:alpha', 'conserver', ['finubar:P/D', 'zoh:alpha']);   // ordre inversé
const r3 = await soumettre('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D']);
v.spamUneLigne = (await lignes(A)) === 1;
v.spamDitDejaEnAttente = r2.resultat === 'deja_en_attente' && r3.resultat === 'deja_en_attente' && r2.id === r1.id;

// ── 3. Défaut n° 4 : la concaténation naïve ne fabrique pas de collision ────
// Deux défenses. (a) Le format : `:` est exclu après le préfixe, donc une preuve
// ne peut pas en contenir deux — « zoh:azoh:b » est refusé à la soumission.
// (b) Les séparateurs : même hors format, la fonction d'empreinte distingue les
// découpages qu'une concaténation brute confondrait.
await en(A);
const c1 = await soumettre('zoh:x', 'mesurer', ['zoh:a', 'zoh:b']);
const c2 = await soumettre('zoh:x', 'mesurer', ['zoh:c']);
v.deuxPropositionsDistinctes = c1.resultat === 'inseree' && c2.resultat === 'inseree' && c1.id !== c2.id;
v.preuveDoubleRefuseeAuFormat = (await code(() => soumettre('zoh:x', 'mesurer', ['zoh:azoh:b']))) === '22023';
await superuser();
{
  const e = async (o, r, p) => (await db.query('select public.supervision_empreinte($1,$2,$3) as h', [o, r, p])).rows[0].h;
  const naif = (o, r, p) => createHash('sha256').update(o + r + p.join('')).digest('hex');
  const d1 = ['zoh:x', 'mesurer', ['zoh:a', 'zoh:b']], d2 = ['zoh:x', 'mesurer', ['zoh:azoh:b']];
  const d3 = ['zoh:xm', 'esurer', ['zoh:a', 'zoh:b']];
  v.naifConfondrait = naif(...d1) === naif(...d2) && naif(...d1) === naif(...d3);
  v.separateursDistinguent = new Set([await e(...d1), await e(...d2), await e(...d3)]).size === 3;
}

// ── 4. Résilience aux refus, puis déblocage par un élément nouveau ──────────
await en(A);
const ref = await arbitrer(r1.id, 'REFUSEE', 'Pas maintenant');
v.arbitrageRefus = ref.statut === 'REFUSEE';
const apres = await soumettre('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D']);
v.refusTient = apres.resultat === 'deja_tranchee' && apres.statut === 'REFUSEE';
const avant = await lignes(A);
await en(A);
const neuf = await soumettre('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D', 'zoh:beta']);
v.nouvellePreuveDebloque = neuf.resultat === 'inseree' && (await lignes(A)) === avant + 1;
await en(A);
v.memeObjetAutreRecommandation = (await soumettre('zoh:alpha', 'simplifier', ['zoh:alpha', 'finubar:P/D'])).resultat === 'inseree';

// ── 5. Arbitrage : une fois, une décision valide, rien d'autre ──────────────
await en(A);
v.doubleArbitrageRefuse = (await code(() => arbitrer(r1.id, 'ACCEPTEE'))) === 'P0001';
v.decisionObsoleteRefusee = (await code(() => arbitrer(neuf.id, 'OBSOLETE'))) === '22023';
v.decisionEnAttenteRefusee = (await code(() => arbitrer(neuf.id, 'EN_ATTENTE'))) === '22023';
v.notesTropLongues = (await code(() => arbitrer(neuf.id, 'ACCEPTEE', 'x'.repeat(2001)))) === '22023';
v.idInexistant = (await code(() => arbitrer('99999999-9999-4999-8999-999999999999', 'ACCEPTEE'))) === 'P0002';
v.accepte = (await arbitrer(neuf.id, 'ACCEPTEE')).statut === 'ACCEPTEE';
await superuser();
v.trancheDate = (await db.query('select tranche_le is not null as t from public.supervision_decisions where id=$1', [neuf.id])).rows[0].t === true;

// ── 6. Retirer (défaire) : seulement en attente ; la même peut revenir ──────
await en(A);
const ret = await retirer(c1.id);
v.retiree = ret.statut === 'OBSOLETE';
v.retirerUneTrancheeRefuse = (await code(() => retirer(neuf.id))) === 'P0001';
const revient = await soumettre('zoh:x', 'mesurer', ['zoh:a', 'zoh:b']);
v.retireePeutRevenir = revient.resultat === 'reouverte' && revient.id === c1.id && revient.statut === 'EN_ATTENTE';

// ── 7. Cloisonnement : autrui ne voit rien, ne tranche rien ─────────────────
await en(B);
v.autruiNeVoitRien = Number((await db.query('select count(*)::int as n from public.supervision_decisions')).rows[0].n) === 0;
v.autruiNeTranchePas = (await code(() => arbitrer(c2.id, 'ACCEPTEE'))) === 'P0002';
v.autruiNeRetirePas = (await code(() => retirer(c2.id))) === 'P0002';
await en(B);
v.memePropositionAutreCompte = (await soumettre('zoh:alpha', 'conserver', ['zoh:alpha', 'finubar:P/D'])).resultat === 'inseree';
await superuser();
v.c2Intacte = (await db.query('select statut from public.supervision_decisions where id=$1', [c2.id])).rows[0].statut === 'EN_ATTENTE';

// ── 8. Aucune écriture directe, aucun anonyme, aucune session vide ──────────
await en(A);
v.insertDirectRefuse = (await code(() => db.query(`insert into public.supervision_decisions
  (proposition_id,objet_id,recommandation,empreinte_materielle,preuves_ids,proposition)
  values ('x','zoh:a','conserver',repeat('a',64),'{zoh:a}','{}')`))) === '42501';
v.updateDirectRefuse = (await code(() => db.query(`update public.supervision_decisions set statut='ACCEPTEE'`))) === '42501';
v.deleteDirectRefuse = (await code(() => db.query('delete from public.supervision_decisions'))) === '42501';
await superuser();
{ // Les DROITS eux-mêmes, pas seulement leur effet : la RLS refuserait aussi un
  // insert sans policy — deux couches, chacune vérifiée séparément.
  const droit = async (role, priv) => (await db.query(
    "select has_table_privilege($1,'public.supervision_decisions',$2) as d", [role, priv])).rows[0].d;
  v.aucunDroitEcritureAuthentifie = !(await droit('authenticated', 'INSERT')) && !(await droit('authenticated', 'UPDATE'))
    && !(await droit('authenticated', 'DELETE')) && !(await droit('authenticated', 'TRUNCATE')) && (await droit('authenticated', 'SELECT'));
  v.aucunDroitAnon = !(await droit('anon', 'SELECT')) && !(await droit('anon', 'INSERT'));
  const pol = await db.query("select cmd from pg_policies where tablename='supervision_decisions'");
  v.uneSeulePolicyLecture = pol.rows.length === 1 && pol.rows[0].cmd === 'SELECT';
}
await en(A);
v.empreinteNonAppelable = (await code(() => db.query(`select public.supervision_empreinte('a','b','{c}')`))) === '42501';
await en(A, 'anon');
v.anonNeSoumetPas = (await code(() => soumettre('zoh:a', 'conserver', ['zoh:a']))) === '42501';
v.anonNeLitPas = (await code(() => db.query('select * from public.supervision_decisions'))) === '42501';
await en('', 'authenticated');
v.sessionVideRefusee = (await code(() => soumettre('zoh:a', 'conserver', ['zoh:a']))) === '42501';

// ── 9. Entrées hostiles : refus contrôlé 22023, jamais un plantage de cast ──
await en(C);
const hostiles = {
  fauxUuid: () => soumettre('zoh:a', 'conserver', ['fake-uuid-123']),
  preuveLeo: () => soumettre('zoh:a', 'conserver', ['leo:proposer_contact']),
  preuveRepetee: () => soumettre('zoh:a', 'conserver', ['zoh:a', 'zoh:a']),
  preuvesVides: () => soumettre('zoh:a', 'conserver', []),
  vingtTroisPreuves: () => soumettre('zoh:a', 'conserver', Array.from({ length: 23 }, (_, i) => `zoh:p${i}`)),
  preuveNulle: () => soumettre('zoh:a', 'conserver', ['zoh:a', null]),
  objetHorsFormat: () => soumettre('riven:1', 'conserver', ['zoh:a']),
  recommandationInconnue: () => soumettre('zoh:a', 'supprimer', ['zoh:a']),
  dossierTableau: () => db.query('select public.supervision_soumettre($1,$2,$3,$4,$5)', ['p', 'zoh:a', 'conserver', ['zoh:a'], '[]']),
  dossierTropLourd: () => soumettre('zoh:a', 'conserver', ['zoh:a'], dossier({ besoin: 'x'.repeat(33000) })),
  idPropositionVide: () => soumettre('zoh:a', 'conserver', ['zoh:a'], dossier({ id: '' })),
  argumentNul: () => db.query('select public.supervision_soumettre($1,$2,$3,$4,$5)', ['p', null, 'conserver', ['zoh:a'], '{}']),
};
for (const [nom, fn] of Object.entries(hostiles)) v[`hostile_${nom}`] = (await code(fn)) === '22023';
v.hostilesSansTrace = (await lignes(C)) === 0;

// ── 10. Plafond de volume : 50 par 24 h, la 51ᵉ refusée PT429 ────────────────
await en(C);
let passent = true;
for (let i = 0; i < 50; i += 1) {
  if ((await soumettre('zoh:a', 'mesurer', [`zoh:v${i}`], dossier({ id: `v${i}` }))).resultat !== 'inseree') passent = false;
}
v.cinquanteSoumissions = passent && (await lignes(C)) === 50;
await en(C);
v.cinquanteEtUniemeRefusee = (await code(() => soumettre('zoh:a', 'mesurer', ['zoh:v50']))) === 'PT429' && (await lignes(C)) === 50;

console.log(JSON.stringify(v, null, 2));
const ok = Object.keys(v).length >= 50 && Object.values(v).every((x) => x === true);
console.log(ok ? 'UNIT-SUPERVISION-SQL OK' : 'UNIT-SUPERVISION-SQL ECHEC');
process.exit(ok ? 0 : 1);
