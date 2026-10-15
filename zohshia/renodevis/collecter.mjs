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
// ⛔ LA TECHNO PURE (Paul, 04/10/2026) : aucun nom propre dans ZOH SHIA. La liste
// des noms à retirer vit HORS de zohshia/ (`outils/zohshia/noms-propres.json`),
// pour que ce dossier n'en porte aucun — ce script compris.
const { jetons: JETONS } = JSON.parse(readFileSync(join(ICI, '..', '..', 'outils', 'zohshia', 'noms-propres.json'), 'utf8'));
const echapper = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const NOM_PROPRE = new RegExp(`(^|[^a-z])(${JETONS.map(echapper).join('|')})([^a-z]|$)`, 'i');
// Un segment de route ou un morceau de nom de table qui porte un nom propre
// devient « [nom propre] » : la forme reste lisible, le nom disparaît.
const neutreRoute = (r) => r.split('/').map((seg) => (NOM_PROPRE.test(seg) ? '[nom propre]' : seg)).join('/');
const neutreNom = (n) => n.split('_').map((m) => (NOM_PROPRE.test(m) ? '[nom propre]' : m)).join('_');

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
  .map((f) => neutreRoute('/' + f.replace(/^app\//, '').replace(/\/route\.ts$/, ''))).sort();
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
const tablesHorsDepot = lues.filter((t) => !creees.includes(t)).map(neutreNom);

// (Le relevé du code écrit pour un artisan particulier a été RETIRÉ le 04/10 :
// ZOH SHIA décrit la techno pure, pas une instance. Cette instance-là vit dans
// son propre dépôt, et y reste telle quelle — décision de Paul.)

// ---- Les services externes, déduits des NOMS de variables ------------------
const SERVICES = [
  ['Supabase (base, authentification, stockage)', /^(NEXT_PUBLIC_)?SUPABASE_/],
  ['Stripe Connect (paiement en ligne)', /^STRIPE_/],
  ['Resend (envoi des mails)', /^(RESEND_|RR_FROM$|FEEDBACK_NOTIFY_)/],
  ['Gmail (synchro des devis envoyés par mail)', /^(GMAIL_|SYNC_EMAIL_)/],
  ['Twilio (SMS — canal muet)', /^TWILIO_/],
  ['Anthropic (assistant Réno)', /^ANTHROPIC_/],
  ['WhatsApp (conversation et réception des messages)', /^WHATSAPP_/],
  ['OpenAI (transcription vocale)', /^OPENAI_/],
  ['mon-dpe.fr (audit PAC)', /^AUDIT_PAC_/],
  ['RénoBoost / hub (extraction PDF, page devis)', /^(RENOBOOST_|HUB_|NEXT_PUBLIC_HUB_)/],
];
const services = SERVICES.map(([nom, re]) => ({ nom, variables: variables.filter((v) => re.test(v)) }))
  .filter((s) => s.variables.length);

const inventaire = {
  source: { depot: 'PaulGERARD161098/RenoDevis', ref: REF, commit, date_commit: dateCommit },
  variables: variables.map((nom) => ({ nom, lue_dans: lueDans[nom] })),
  crons, routes, migrations, services,
  tables: { lues_par_le_code: lues.map(neutreNom), creees_par_le_depot: creees.map(neutreNom), hors_depot: tablesHorsDepot },
};
// ⛔ LE DERNIER MOT : si un nom propre a survécu (une variable, un fichier lu,
// une migration), on n'écrit RIEN. Un inventaire qui en porte un ne sort pas.
const sortie = JSON.stringify(inventaire, null, 2) + '\n';
const fuite = sortie.split('\n').find((l) => NOM_PROPRE.test(l));
if (fuite) {
  console.error('Un nom propre a survécu à la neutralisation — inventaire refusé :');
  console.error('  ' + fuite.trim().slice(0, 160));
  process.exit(1);
}

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
writeFileSync(SORTIE, sortie);
console.log(`Inventaire écrit — RénoDevis ${commit.slice(0, 7)} (${dateCommit}) : ${variables.length} variables, `
  + `${crons.length} tâches planifiées, ${routes.length} routes, ${migrations.length} migrations, `
  + `${tablesHorsDepot.length} tables hors dépôt.`);
