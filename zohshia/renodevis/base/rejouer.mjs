#!/usr/bin/env node
// ZOH SHIA · RénoDevis — REJOUER LA BASE NEUVE, ET PROUVER QU'ELLE EST LA BONNE.
//
// « Fournis-moi une base prête » (Paul, 04/10/2026). Ce script la construit sur
// un Postgres JETABLE, local, sans réseau ni secret, à partir de :
//   00-supabase-local.sql  la plateforme simulée (jamais appliquée ailleurs)
//   01-socle.sql           ce que la techno trouve en base avant sa 1ʳᵉ migration
//   <les migrations>       lues dans le dépôt de référence, au commit demandé,
//                          NEUTRALISÉES (neutraliser.mjs), dans l'ordre relevé
//   99-finition.sql        ce que la référence porte après, hors migrations
//
// Puis il en relève l'EMPREINTE (tables, colonnes, contraintes, index, RLS,
// policies, déclencheurs, droits, vues, fonctions, stockage) et la compare à
// celle de la base de référence (`empreinte-reference.json`). La base neuve
// est prête quand les deux coïncident, aux écarts DÉCLARÉS près.
//
// Les réponses au pre-mortem, une par mode d'échec :
//   · LE SOCLE MASQUE UNE MIGRATION DÉFAILLANTE (il porte déjà ce qu'elle devait
//     créer) → intersection socle ∩ migrations, sur les colonnes et les index
//     « if not exists » : elle doit être VIDE.
//   · UNE MIGRATION NOUVELLE OU DÉPLACÉE → l'ordre relevé doit couvrir toutes les
//     migrations du commit, et coïncider avec leur tri binaire.
//   · LE REJEU « PASSE » EN AVALANT UNE ERREUR → ON_ERROR_STOP, fichier par
//     fichier ; le premier échec arrête tout et le nomme.
//   · LA BASE NEUVE DIVERGE DE LA RÉFÉRENCE SANS QUE PERSONNE LE VOIE → la
//     comparaison d'empreinte ; tout écart non déclaré rougit.
//   · LA COMPARAISON EST VERTE PAR VACUITÉ → verrous : empreintes non vides,
//     nombre minimal de tables, de fonctions et de policies des DEUX côtés.
//   · UN OBJET APPELÉ N'EXISTE PAS (une fonction écrit dans une table que
//     personne ne crée) → chaque `public.<nom>` cité par le SQL rejoué doit
//     exister dans la base neuve.
//   · UN NOM PROPRE PASSE DANS LA BASE NEUVE → le moteur refuse en amont, et
//     l'empreinte locale est relue en entier.
//
// Usage :
//   node zohshia/renodevis/base/rejouer.mjs --depot <chemin> [--ref origin/main]
//   node zohshia/renodevis/base/rejouer.mjs --depot <chemin> --sql-reference [--sortie f]
//     → écrit la requête de VALIDATION, à passer en LECTURE SEULE sur la base de
//       référence : elle embarque l'empreinte de la base neuve et rend les écarts.
//       0 ligne → `--reference-validee --le AAAA-MM-JJ` fait de l'empreinte l'étalon.
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, chmodSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  chargerRecette, neutraliserFichier, nomPropreDans, lireAuCommit, listerAuCommit, commitDe, RACINE,
} from '../neutraliser.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const arg = (nom, defaut) => { const i = process.argv.indexOf(`--${nom}`); return i > 0 ? process.argv[i + 1] : defaut; };
const drapeau = (nom) => process.argv.includes(`--${nom}`);
const DEPOT = arg('depot', join(RACINE, '..', 'RenoDevis'));
const REF = arg('ref', 'origin/main');
const PG = arg('pg', '/usr/lib/postgresql/16/bin');
const DOSSIER_MIG = 'supabase/migrations';

const echecs = [];
const echoue = (msg) => { echecs.push(msg); console.error(`✗ ${msg}`); };
const ok = (msg) => console.log(`✓ ${msg}`);

const recette = chargerRecette();

// ── 1. L'ordre ───────────────────────────────────────────────────────────────
const ordre = JSON.parse(readFileSync(join(ICI, 'ordre.json'), 'utf8')).migrations;
const presentes = listerAuCommit(DEPOT, REF, DOSSIER_MIG).filter((c) => c.endsWith('.sql')).map((c) => basename(c));
const triees = [...presentes].sort((a, b) => (Buffer.from(a) < Buffer.from(b) ? -1 : 1));
const absentes = presentes.filter((m) => !ordre.includes(m));
const disparues = ordre.filter((m) => !presentes.includes(m));
if (!presentes.length) echoue('aucune migration lue au commit — dépôt non récupéré ?');
if (absentes.length) echoue(`migrations sans place relevée : ${absentes.join(', ')} — relever leur ordre dans la base de référence`);
if (disparues.length) echoue(`migrations relevées mais absentes du commit : ${disparues.join(', ')}`);
if (JSON.stringify(triees) !== JSON.stringify(ordre.filter((m) => presentes.includes(m)))) echoue('l’ordre relevé ne coïncide plus avec le tri des noms');
if (!echecs.length) ok(`ordre : ${ordre.length} migrations, relevé = tri binaire (commit ${commitDe(DEPOT, REF)})`);

// ── 2. La neutralisation ─────────────────────────────────────────────────────
const neutres = [];
const bilan = { remplaces: 0, retouches: 0, renommages: 0, commentairesRetires: 0 };
for (const m of ordre.filter((x) => presentes.includes(x))) {
  try {
    const { texte, journal } = neutraliserFichier(`${DOSSIER_MIG}/${m}`, lireAuCommit(DEPOT, REF, `${DOSSIER_MIG}/${m}`), recette);
    neutres.push({ nom: m, texte });
    bilan.remplaces += journal.remplace ? 1 : 0;
    for (const k of ['retouches', 'renommages', 'commentairesRetires']) bilan[k] += journal[k];
  } catch (e) { echoue(e.message); }
}
// Une retouche jamais appliquée est une retouche périmée qui ne dit rien.
for (const r of recette.retouches || []) {
  if (r.fichier.startsWith(DOSSIER_MIG) && !neutres.some((n) => `${DOSSIER_MIG}/${n.nom}` === r.fichier)) echoue(`retouche orpheline : ${r.fichier}`);
}
if (!echecs.length) ok(`neutralisation : ${neutres.length} migrations — ${bilan.remplaces} remplacée(s), ${bilan.retouches} retouche(s), ${bilan.renommages} renommage(s), ${bilan.commentairesRetires} ligne(s) de commentaire retirée(s)`);

const lire = (f) => readFileSync(join(ICI, f), 'utf8');
const fichiers = [
  { nom: '00-supabase-local.sql', texte: lire('00-supabase-local.sql') },
  { nom: '01-socle.sql', texte: lire('01-socle.sql') },
  ...neutres,
  { nom: '99-finition.sql', texte: lire('99-finition.sql') },
];
for (const f of fichiers) { const n = nomPropreDans(f.texte, recette); if (n) echoue(`${f.nom} porte un nom propre (« ${n} »)`); }

// ── 3. Le socle ne masque rien ───────────────────────────────────────────────
const sansCommentaires = (s) => s.replace(/--[^\n]*/g, '');
function colonnesDuSocle(sql) {
  const out = new Set();
  for (const m of sansCommentaires(sql).matchAll(/create table public\.(\w+) \(([\s\S]*?)\n\);/g)) {
    for (const l of m[2].split('\n')) { const c = l.trim().match(/^([a-z_]+) [a-z]/); if (c && c[1] !== 'constraint') out.add(`${m[1]}.${c[1]}`); }
  }
  return out;
}
function ajoutsDesMigrations(textes) {
  const cols = new Set(); const index = new Set();
  for (const t of textes) {
    const s = sansCommentaires(t);
    for (const m of s.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?public\.(\w+)([\s\S]*?);/gi)) {
      for (const c of m[2].matchAll(/add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)/gi)) cols.add(`${m[1]}.${c[1]}`);
    }
    for (const m of s.matchAll(/create\s+(?:unique\s+)?index\s+if\s+not\s+exists\s+(\w+)/gi)) index.add(m[1]);
  }
  return { cols, index };
}
const socle = lire('01-socle.sql');
const colsSocle = colonnesDuSocle(socle);
const indexSocle = new Set([...sansCommentaires(socle).matchAll(/create\s+(?:unique\s+)?index\s+(\w+)/gi)].map((m) => m[1]));
const ajouts = ajoutsDesMigrations(neutres.map((n) => n.texte));
const masque = [...colsSocle].filter((c) => ajouts.cols.has(c)).concat([...indexSocle].filter((i) => ajouts.index.has(i)));
if (colsSocle.size < 50) echoue(`socle : ${colsSocle.size} colonnes lues — l’analyse est cassée (vert par vacuité)`);
if (masque.length) echoue(`le socle porte ce que les migrations créent : ${masque.join(', ')}`);
else ok(`socle : ${colsSocle.size} colonnes, aucune ne masque une migration (${ajouts.cols.size} colonnes ajoutées par elles)`);

if (drapeau('sql-reference')) {
  // Il faut la liste des objets : elle sort du rejeu. On rejoue d'abord.
}
if (echecs.length) { console.error(`\n${echecs.length} refus avant rejeu.`); process.exit(1); }

// ── 4. Le rejeu, sur un Postgres jetable ─────────────────────────────────────
const racineTmp = mkdtempSync(join(tmpdir(), 'zohshia-base-'));
chmodSync(racineTmp, 0o755);
const donnees = join(racineTmp, 'donnees'); const prise = join(racineTmp, 'prise'); const sql = join(racineTmp, 'sql');
mkdirSync(prise); mkdirSync(sql);
const enRoot = process.getuid() === 0;
if (enRoot) execFileSync('chown', ['-R', 'postgres:postgres', racineTmp]);
const commeServeur = (cmd, args, opts = {}) => (enRoot
  ? spawnSync('runuser', ['-u', 'postgres', '--', cmd, ...args], { encoding: 'utf8', ...opts })
  : spawnSync(cmd, args, { encoding: 'utf8', ...opts }));
let demarre = false;
const arreter = () => {
  if (demarre) commeServeur(join(PG, 'pg_ctl'), ['-D', donnees, '-m', 'immediate', 'stop']);
  if (!drapeau('garder')) rmSync(racineTmp, { recursive: true, force: true });
};
process.on('exit', arreter);

let r = commeServeur(join(PG, 'initdb'), ['-D', donnees, '--username=postgres', '--auth-local=trust', '--auth-host=reject', '--no-locale', '--encoding=UTF8']);
if (r.status !== 0) { echoue(`initdb : ${r.stderr}`); process.exit(1); }
r = commeServeur(join(PG, 'pg_ctl'), ['-D', donnees, '-l', join(racineTmp, 'serveur.log'), '-w', '-t', '20', '-o', `-k ${prise} -c listen_addresses=''`, 'start']);
if (r.status !== 0) { echoue(`démarrage : ${r.stderr}`); process.exit(1); }
demarre = true;

const psql = (args, opts) => commeServeur(join(PG, 'psql'), ['-X', '-q', '-h', prise, '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', ...args], opts);
let appliques = 0;
for (const [i, f] of fichiers.entries()) {
  const chemin = join(sql, `${String(i).padStart(3, '0')}-${f.nom}`);
  writeFileSync(chemin, f.texte); if (enRoot) execFileSync('chown', ['postgres:postgres', chemin]);
  const res = psql(['-f', chemin]);
  if (res.status !== 0) { echoue(`${f.nom} ne s’applique pas :\n${res.stderr.trim().split('\n').slice(0, 6).join('\n')}`); break; }
  appliques += 1;
}
if (echecs.length) process.exit(1);
ok(`rejeu : ${appliques} fichiers appliqués sur une base vierge (plateforme simulée + socle + ${neutres.length} migrations + finition)`);

// ── 5. Ce que le SQL cite existe ─────────────────────────────────────────────
const lireUn = (requete) => { const res = psql(['-At', '-c', requete]); if (res.status !== 0) throw new Error(res.stderr); return res.stdout.trim(); };
const objets = new Set(lireUn("select string_agg(name, ' ') from (select relname::text name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' union select proname::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public') x").split(' '));
const cites = new Set(fichiers.slice(1).flatMap((f) => [...sansCommentaires(f.texte).matchAll(/public\.([a-z_]+)/g)].map((m) => m[1])));
const introuvables = [...cites].filter((c) => !objets.has(c));
if (cites.size < 20) echoue(`seulement ${cites.size} objets cités — l’analyse est cassée`);
if (introuvables.length) echoue(`cités mais absents de la base neuve : ${introuvables.join(', ')}`);
else ok(`références : les ${cites.size} objets cités par le SQL existent dans la base neuve`);

// Diagnostic : une requête en lecture sur la base neuve, pour comparer un écart
// à son pendant dans la référence.
if (arg('requete')) { console.log(lireUn(arg('requete'))); process.exit(0); }

// ── 6. L'empreinte ───────────────────────────────────────────────────────────
const liste = (q) => lireUn(q).split(' ').filter(Boolean);
const tables = liste("select string_agg(relname, ' ' order by relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'");
const vues = liste("select string_agg(relname, ' ' order by relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='v'");
const fonctions = liste("select string_agg(distinct proname, ' ') from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'");
const politiquesStockage = liste("select string_agg(policyname, ' ' order by policyname) from pg_policies where schemaname='storage'");
const seaux = liste("select string_agg(id, ' ' order by id) from storage.buckets");

// L'empreinte est faite de CONDENSATS (md5), par table × catégorie et par
// fonction : assez fins pour dire OÙ est l'écart, assez courts pour se relever
// en lecture seule et se recopier. ⚠️ Une erreur de recopie ne peut produire
// qu'un faux ROUGE (deux condensats qui diffèrent), jamais un faux vert.
// `R` neutralise un texte côté référence (renommages de la recette) ; côté base
// neuve il est l'identité. Les corps de fonctions et de vues se condensent sans
// commentaires ni blancs : le rejeu a retiré des lignes de commentaire.
export function sqlEmpreinte({ tables, vues, fonctions, politiquesStockage, seaux }, R = (x) => x) {
  const tab = (a) => `array[${a.map((x) => `'${x}'`).join(',')}]::text[]`;
  const roles = "array['anon','authenticated','service_role']";
  // ⚠️ Après renommage, le texte est REMIS en forme canonique (aller-retour par
  // jsonb) : jsonb range ses clés par LONGUEUR, et un renommage qui change la
  // longueur d'une clé (une colonne renommée) la déplacerait — deux bases
  // identiques rendraient deux condensats différents. Côté base neuve, R est
  // l'identité et l'aller-retour ne change rien.
  const h = (expr) => `md5(coalesce((nullif(${R(`coalesce((${expr})::text, '')`)}, ''))::jsonb::text, ''))`;
  const corps = (expr) => `md5(${R(`trim(regexp_replace(regexp_replace(${expr}, '--[^\\n]*', '', 'g'), '\\s+', '', 'g'))`)})`;
  const droitsTable = (oid) => `(select jsonb_object_agg(r, (select coalesce(jsonb_agg(p order by p), '[]'::jsonb) from unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) p where has_table_privilege(r, ${oid}, p))) from unnest(${roles}) r)`;
  return `select jsonb_build_object(
 'tables', (select jsonb_object_agg(${R('c.relname::text')}, jsonb_build_object(
   'rls', c.relrowsecurity,
   'colonnes', ${h(`(select jsonb_object_agg(a.attname, format_type(a.atttypid, a.atttypmod) || coalesce(' default ' || pg_get_expr(d.adbin, d.adrelid), '') || case when a.attnotnull then ' not null' else '' end || case a.attidentity when 'a' then ' identity always' when 'd' then ' identity by default' else '' end) from pg_attribute a left join pg_attrdef d on d.adrelid = a.attrelid and d.adnum = a.attnum where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped)`)},
   'contraintes', ${h(`(select jsonb_object_agg(conname, pg_get_constraintdef(oid)) from pg_constraint where conrelid = c.oid)`)},
   'index', ${h(`(select jsonb_object_agg(indexname, indexdef) from pg_indexes where schemaname = 'public' and tablename = c.relname)`)},
   'policies', ${h(`(select jsonb_object_agg(policyname, jsonb_build_object('cmd', cmd, 'roles', roles, 'using', qual, 'check', with_check, 'permissive', permissive)) from pg_policies where schemaname = 'public' and tablename = c.relname)`)},
   'declencheurs', ${h(`(select jsonb_object_agg(tgname, pg_get_triggerdef(oid)) from pg_trigger where tgrelid = c.oid and not tgisinternal)`)},
   'droits', ${h(droitsTable('c.oid'))},
   'droits_colonnes', ${h(`(select jsonb_object_agg(r, (select coalesce(jsonb_object_agg(p, (select jsonb_agg(a.attname order by a.attname) from pg_attribute a where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped and has_column_privilege(r, c.oid, a.attname, p))), '{}'::jsonb) from unnest(array['INSERT','UPDATE']) p where not has_table_privilege(r, c.oid, p) and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped and has_column_privilege(r, c.oid, a.attname, p)))) from unnest(${roles}) r)`)},
   'nb_policies', (select count(*) from pg_policies where schemaname = 'public' and tablename = c.relname)
 )) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relname = any(${tab(tables)})),
 'vues', (select jsonb_object_agg(${R('c.relname::text')}, jsonb_build_object('def', ${corps('pg_get_viewdef(c.oid)')}, 'droits', ${h(droitsTable('c.oid'))})) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'v' and c.relname = any(${tab(vues)})),
 'fonctions', (select jsonb_object_agg(${R('p.oid::regprocedure::text')}, jsonb_build_object('def', ${corps('pg_get_functiondef(p.oid)')}, 'execute', (select coalesce(jsonb_agg(r order by r), '[]'::jsonb) from unnest(${roles}) r where has_function_privilege(r, p.oid, 'EXECUTE')))) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = any(${tab(fonctions)})),
 'stockage', jsonb_build_object(
   'seaux', (select jsonb_object_agg(id, public) from storage.buckets where id = any(${tab(seaux)})),
   'policies', ${h(`(select jsonb_object_agg(policyname, jsonb_build_object('cmd', cmd, 'roles', roles, 'using', qual, 'check', with_check)) from pg_policies where schemaname = 'storage' and policyname = any(${tab(politiquesStockage)}))`)})
)::text as empreinte`;
}

// Un nom de la base neuve → son nom dans la base de référence (renommages inversés).
const versReference = (nom) => (recette.renommer || []).reduce((n, [avant, apres]) => n.split(apres).join(avant), nom);
// Côté référence, chaque texte passe par les renommages de la recette AVANT
// d'être condensé : c'est ainsi que les deux bases deviennent comparables.
const litteral = (x) => `'${x.replace(/'/g, "''")}'`;
const R_REFERENCE = (expr) => (recette.renommer || []).reduce((e, [avant, apres]) => `replace(${e}, ${litteral(avant)}, ${litteral(apres)})`, expr);

const portee = { tables, vues, fonctions, politiquesStockage, seaux };
const locale = JSON.parse(lireUn(sqlEmpreinte(portee)));
if (arg('ecrire-locale')) writeFileSync(arg('ecrire-locale'), JSON.stringify(locale, null, 1));
const compter = (e) => ({
  tables: Object.keys(e.tables || {}).length,
  fonctions: Object.keys(e.fonctions || {}).length,
  policies: Object.values(e.tables || {}).reduce((n, t) => n + Number(t.nb_policies || 0), 0),
});
const cl = compter(locale);
if (cl.tables < 15 || cl.fonctions < 15 || cl.policies < 30) echoue(`empreinte locale trop maigre (${JSON.stringify(cl)}) — vert par vacuité refusé`);
const nLocal = nomPropreDans(JSON.stringify(locale), recette);
if (nLocal) echoue(`la base neuve porte un nom propre : « ${nLocal} »`);

// LA VALIDATION CONTRE LA BASE DE RÉFÉRENCE. La requête embarque l'empreinte de
// la base neuve et c'est la RÉFÉRENCE qui calcule la différence : rien n'est
// recopié à la main, donc rien ne peut être mal recopié. Elle se passe en
// LECTURE SEULE ; zéro ligne = les deux bases coïncident.
function sqlValidation() {
  const pourReference = Object.fromEntries(Object.entries(portee).map(([k, v]) => [k, v.map(versReference)]));
  const aplatir = (src) => `select 'tables/' || t.key || '/' || c.key k, c.value v from ${src} s, jsonb_each(s.j -> 'tables') t, jsonb_each(t.value) c
  union all select 'vues/' || t.key || '/' || c.key, c.value from ${src} s, jsonb_each(s.j -> 'vues') t, jsonb_each(t.value) c
  union all select 'fonctions/' || t.key || '/' || c.key, c.value from ${src} s, jsonb_each(s.j -> 'fonctions') t, jsonb_each(t.value) c
  union all select 'stockage/' || c.key, c.value from ${src} s, jsonb_each(s.j -> 'stockage') c`;
  return `with neuve as (select ${litteral(JSON.stringify(locale))}::jsonb j),
reference as (select (q.empreinte)::jsonb j from (${sqlEmpreinte(pourReference, R_REFERENCE)}) q),
fn as (${aplatir('neuve')}),
fr as (${aplatir('reference')})
select coalesce(fn.k, fr.k) as chemin, fn.v::text as neuve, fr.v::text as reference
  from fn full join fr on fn.k = fr.k
 where fn.v is distinct from fr.v
 order by 1`;
}

const cheminRef = join(ICI, 'empreinte-reference.json');
if (drapeau('sql-reference')) {
  const sortie = arg('sortie', join(tmpdir(), 'zohshia-validation-reference.sql'));
  writeFileSync(sortie, sqlValidation() + ';\n');
  ok(`requête de validation écrite : ${sortie} — à passer en LECTURE SEULE sur la base de référence ; 0 ligne = base neuve conforme`);
  process.exit(echecs.length ? 1 : 0);
}
if (drapeau('reference-validee')) {
  // À n'utiliser QU'APRÈS que la requête de validation a rendu 0 ligne (ou
  // seulement des écarts déclarés). L'empreinte de la base neuve devient alors
  // l'étalon : les rejeux suivants doivent la retrouver à l'identique.
  writeFileSync(cheminRef, JSON.stringify({
    pourquoi: 'Étalon de « la base neuve est prête » : l’empreinte (condensats md5 par table × catégorie et par fonction) de la base reconstruite, VALIDÉE contre la base de référence par une requête en lecture seule qui a calculé elle-même la différence. Ne porte ni nom propre ni donnée. Se renouvelle avec `rejouer.mjs --sql-reference`, puis `--reference-validee` une fois la validation passée.',
    validee_le: arg('le', new Date().toISOString().slice(0, 10)),
    commit_techno: commitDe(DEPOT, REF),
    ecarts_constates: Number(arg('ecarts', '0')),
    empreinte: locale,
  }, null, 1) + '\n');
  ok('étalon enregistré');
}

if (!existsSync(cheminRef)) { echoue('aucune empreinte de référence — relever avec --sql-reference'); process.exit(1); }
const reference = JSON.parse(readFileSync(cheminRef, 'utf8'));
const cr = compter(reference.empreinte);
if (cr.tables < 15 || cr.fonctions < 15 || cr.policies < 30) echoue(`empreinte de référence trop maigre (${JSON.stringify(cr)})`);

const ecarts = existsSync(join(ICI, 'ecarts.json')) ? JSON.parse(readFileSync(join(ICI, 'ecarts.json'), 'utf8')).ecarts : {};
const differences = [];
(function comparer(a, b, chemin) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) comparer(a[k], b[k], `${chemin}/${k}`);
    return;
  }
  differences.push({ chemin, neuve: a, reference: b });
}(locale, reference.empreinte, ''));
const nonDeclarees = differences.filter((d) => !ecarts[d.chemin]);
const declareesVues = new Set(differences.map((d) => d.chemin));
const declareesPerimees = Object.keys(ecarts).filter((c) => !declareesVues.has(c));
for (const d of nonDeclarees) echoue(`écart ${d.chemin}\n    neuve     : ${JSON.stringify(d.neuve)}\n    référence : ${JSON.stringify(d.reference)}`);
for (const c of declareesPerimees) echoue(`écart déclaré qui n’existe plus : ${c} — le retirer de ecarts.json`);
if (!nonDeclarees.length && !declareesPerimees.length) {
  ok(`empreinte : base neuve = référence (${cl.tables} tables, ${cl.fonctions} fonctions, ${cl.policies} policies), ${differences.length} écart(s) déclaré(s)`);
}

if (echecs.length) { console.error(`\n✗ ${echecs.length} refus — la base n’est PAS prête.`); process.exit(1); }
console.log('\n✓ La base neuve est prête et prouvée.');
