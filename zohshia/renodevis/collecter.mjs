#!/usr/bin/env node
// ZOH SHIA — l'inventaire MESURÉ de la techno RénoDevis.
//
// Paul, 04/10/2026 : « la techno, ce qui la compose, doit vivre dans ZOH —
// toute la techno RenoDevis doit y vivre : le but est de pouvoir l'invoquer
// pour dupliquer aisément pour un autre artisan ».
//
// Ce script lit le dépôt RénoDevis À UNE RÉFÉRENCE GIT (par défaut
// `origin/main`, jamais l'arbre de travail : une copie locale en retard
// donnerait un inventaire faux qui se lirait comme juste) et écrit
// `inventaire.json` à côté de lui. Le fichier dit d'où il vient (dépôt,
// commit, date du commit) : la dérive se MESURE, comme dans Finubar.
//
// ⛔ DES NOMS, JAMAIS DES VALEURS. Le script ne lit que des NOMS de variables,
// de routes, de tables et de fichiers. Il n'ouvre aucun `.env`, ne lit aucune
// valeur par défaut, et ne recopie aucun identifiant. `tests/unit-zohshia.mjs`
// le vérifie sur tout le dossier `zohshia/`.
//
// ⛔ IL ÉCHOUE PLUTÔT QUE DE MENTIR. Une lecture dynamique de variable
// (`process.env[nom]`) hors des aides connues rendrait l'inventaire incomplet
// sans que rien ne le dise : le script s'arrête alors en erreur.
//
// Usage : node zohshia/renodevis/collecter.mjs [--depot ../RenoDevis] [--ref origin/main]
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SORTIE = join(ICI, 'inventaire.json');

function option(nom, defaut) {
  const i = process.argv.indexOf('--' + nom);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : defaut;
}
const DEPOT = resolve(option('depot', join(ICI, '..', '..', '..', 'RenoDevis')));
const REF = option('ref', 'origin/main');

function git(args) {
  return execFileSync('git', ['-C', DEPOT, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}
// `git grep` rend 1 quand il ne trouve rien : ce n'est pas une erreur ici.
function grep(args) {
  try { return git(['grep', ...args]); } catch (e) { if (e.status === 1) { return ''; } throw e; }
}
const sansRef = (l) => l.startsWith(REF + ':') ? l.slice(REF.length + 1) : l;
const unique = (xs) => [...new Set(xs)].sort();

if (!existsSync(DEPOT)) { console.error(`Dépôt RénoDevis introuvable : ${DEPOT}`); process.exit(2); }

// Le CODE QUI TOURNE — pas les tests, pas les scripts d'outillage.
const CHEMINS_CODE = ['app', 'lib', 'components', 'middleware.ts', 'releve'];
const PAS_UN_TEST = (f) => !/\.test\.|\/tests?\//.test(f);

const commit = git(['rev-parse', REF]).trim();
const dateCommit = git(['log', '-1', '--format=%cI', REF]).trim();

// ---- Les variables d'environnement -----------------------------------------
const statiques = grep(['-ohE', 'process\\.env\\.[A-Z_][A-Z0-9_]*', REF, '--', ...CHEMINS_CODE])
  .split('\n').filter(Boolean).map((l) => sansRef(l).replace('process.env.', ''));
// Les aides qui lisent une variable dont le nom est passé en argument. Chacune
// est NOMMÉE : une lecture dynamique hors de cette liste arrête la collecte.
const AIDES = [{ fichier: 'lib/config.ts', fonction: 'listeEnv' }];
// Lues sur le FICHIER ENTIER, pas ligne à ligne : un appel coupé après sa
// parenthèse (`listeEnv(\n  "SYNC_EMAIL_INTERNES",`) échappait à `git grep`.
// Mesuré le 04/10 — la collecte rendait 38 variables pour 39, et restait verte.
const viaAides = AIDES.flatMap((a) => [...git(['show', `${REF}:${a.fichier}`])
  .matchAll(new RegExp(`${a.fonction}\\(\\s*["']([A-Z_][A-Z0-9_]*)["']`, 'g'))].map((m) => m[1]));
const dynamiques = grep(['-nE', 'process\\.env\\[', REF, '--', ...CHEMINS_CODE])
  .split('\n').filter(Boolean).map(sansRef).filter((l) => PAS_UN_TEST(l.split(':')[0]));
const nonResolues = dynamiques.filter((l) => !AIDES.some((a) => l.startsWith(a.fichier + ':')));
if (nonResolues.length) {
  console.error('Lecture dynamique de variable non résolue — inventaire incomplet, collecte refusée :');
  nonResolues.forEach((l) => console.error('  ' + l.split(':').slice(0, 2).join(':')));
  process.exit(1);
}
const variables = unique([...statiques, ...viaAides]);

// Où chaque variable est lue (fichiers, hors tests) : c'est ce qui permet à la
// fiche de dire « voir lib/config.ts » sans recopier le code.
const lueDans = Object.fromEntries(variables.map((v) => [v, unique(
  grep(['-lE', `(process\\.env\\.${v}\\b|"${v}")`, REF, '--', ...CHEMINS_CODE])
    .split('\n').filter(Boolean).map(sansRef).filter(PAS_UN_TEST))]));

// ---- Les tâches planifiées, les routes, les migrations ---------------------
const vercel = JSON.parse(git(['show', `${REF}:vercel.json`]));
const crons = (vercel.crons || []).map((c) => ({ chemin: c.path, horaire: c.schedule }));
const fichiers = git(['ls-tree', '-r', '--name-only', REF]).split('\n').filter(Boolean);
const routes = fichiers.filter((f) => /^app\/api\/.+\/route\.ts$/.test(f))
  .map((f) => '/' + f.replace(/^app\//, '').replace(/\/route\.ts$/, '')).sort();
const migrations = fichiers.filter((f) => /^supabase\/migrations\/.+\.sql$/.test(f))
  .map((f) => f.replace('supabase/migrations/', '')).sort();

// ---- Les tables : celles que le code lit, celles que le dépôt sait créer ---
const lues = unique(grep(['-ohE', "\\.from\\(['\"][a-z_]+['\"]\\)", REF, '--', 'app', 'lib', 'releve'])
  .split('\n').filter(Boolean).map((l) => sansRef(l).replace(/^\.from\(['"]/, '').replace(/['"]\)$/, '')));
const creees = unique(grep(['-ohiE', 'create (or replace )?(table|view)( if not exists)? (public\\.)?[a-z_]+', REF, '--', 'supabase/migrations'])
  .split('\n').filter(Boolean).map((l) => sansRef(l).toLowerCase().split(/\s+/).pop().replace('public.', '')));
// ⛔ LE VERROU DE L'OPTION « CLONER » : une table que le code lit mais que le
// dépôt ne sait pas créer vit dans la base PARTAGÉE (créée par RénoBoost ou le
// hub). Tant que cette liste n'est pas vide, une instance neuve ne se
// reconstruit pas depuis le seul dépôt RénoDevis.
const tablesHorsDepot = lues.filter((t) => !creees.includes(t));

// ---- Ce qui est CODÉ POUR SOLA ---------------------------------------------
// Fichiers du code qui tournent (hors tests) et nomment SOLA, ou portent un
// identifiant (UUID) écrit en dur. On rend des FICHIERS, jamais les valeurs.
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
// Lignes de CODE seulement : un commentaire qui cite SOLA (« mesuré sur SOLA
// le 15/09 ») n'est pas une dépendance. Sans ce tri, 52 fichiers sortaient, et
// une liste que tout remplit ne désigne plus rien.
const COMMENTAIRE = /^\s*(\/\/|\*|\/\*|\{\s*\/\*|#)/;
const parMotif = (motif) => unique(grep(['-nE', motif, REF, '--', ...CHEMINS_CODE])
  .split('\n').filter(Boolean).map(sansRef)
  .filter((l) => { const [f, , ...reste] = l.split(':'); return PAS_UN_TEST(f) && !COMMENTAIRE.test(reste.join(':')); })
  .map((l) => l.split(':')[0]));
const nommentSola = parMotif('(SOLA|Sola)');
const uuidEnDur = parMotif(UUID);
const codePourSola = unique([...nommentSola, ...uuidEnDur]).map((f) => ({
  fichier: f,
  motifs: [nommentSola.includes(f) ? 'nomme SOLA' : null, uuidEnDur.includes(f) ? 'identifiant écrit en dur' : null].filter(Boolean),
}));

// ---- Les services externes, déduits des NOMS de variables ------------------
const SERVICES = [
  ['Supabase (base, authentification, stockage)', /^(NEXT_PUBLIC_)?SUPABASE_/],
  ['Stripe Connect (paiement en ligne)', /^STRIPE_/],
  ['Resend (envoi des mails)', /^(RESEND_|RR_FROM$|FEEDBACK_NOTIFY_)/],
  ['Gmail (synchro des devis envoyés par mail)', /^(GMAIL_|SYNC_EMAIL_)/],
  ['Twilio (SMS — canal muet)', /^TWILIO_/],
  ['Anthropic (assistant Réno)', /^ANTHROPIC_/],
  ['mon-dpe.fr (audit PAC)', /^AUDIT_PAC_/],
  ['RénoBoost / hub (extraction PDF, page devis)', /^(RENOBOOST_|HUB_|NEXT_PUBLIC_HUB_)/],
];
const services = SERVICES.map(([nom, re]) => ({ nom, variables: variables.filter((v) => re.test(v)) }))
  .filter((s) => s.variables.length);

const inventaire = {
  source: { depot: 'PaulGERARD161098/RenoDevis', ref: REF, commit, date_commit: dateCommit },
  variables: variables.map((nom) => ({ nom, lue_dans: lueDans[nom] })),
  crons, routes, migrations, services,
  tables: { lues_par_le_code: lues, creees_par_le_depot: creees, hors_depot: tablesHorsDepot },
  code_pour_sola: codePourSola,
};

// La dérive : si l'inventaire existant vient d'un autre commit, on le dit.
if (existsSync(SORTIE)) {
  try {
    const avant = JSON.parse(readFileSync(SORTIE, 'utf8')).source.commit;
    if (avant !== commit) {
      const n = git(['rev-list', '--count', `${avant}..${commit}`]).trim();
      console.log(`Dérive : RénoDevis a avancé de ${n} commit(s) depuis la dernière mesure (${avant.slice(0, 7)} → ${commit.slice(0, 7)}).`);
    }
  } catch { /* inventaire illisible ou commit inconnu : on réécrit */ }
}
writeFileSync(SORTIE, JSON.stringify(inventaire, null, 2) + '\n');
console.log(`Inventaire écrit — RénoDevis ${commit.slice(0, 7)} (${dateCommit}) : ${variables.length} variables, `
  + `${crons.length} tâches planifiées, ${routes.length} routes, ${migrations.length} migrations, `
  + `${tablesHorsDepot.length} tables hors dépôt, ${codePourSola.length} fichiers codés pour SOLA.`);
