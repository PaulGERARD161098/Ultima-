#!/usr/bin/env node
// ZOH SHIA · RénoDevis — EXTRAIRE LE CODE NEUTRE, prêt pour un nouveau pro.
//
// « Fournis-moi un code et une base prête » (Paul, 04/10/2026). Ce script
// fabrique, à partir du dépôt de référence À UN COMMIT DONNÉ, un arbre de code
// sans aucun nom propre ni valeur d'instance, accompagné de la base neuve :
//
//   1. clone jetable du dépôt de référence, au commit demandé ;
//   2. application de la SÉRIE de neutralisation (privée, hors zohshia/ :
//      `outils/zohshia/renodevis/neutre/` — retraits par motifs, puis un diff
//      appliqué en 3 VOIES, qui encaisse les évolutions du dépôt ne touchant pas
//      les mêmes lignes) ; tout chemin portant un nom propre part d'office ;
//   3. neutralisation des migrations SQL par la recette (même moteur que la base) ;
//   4. ajout de la base neuve : socle, finition, ordre d'application ;
//   5. export SANS historique (l'historique porte l'instance) ;
//   6. scan complet : un seul nom propre, dans un chemin ou un contenu = refus ;
//   7. (option --verifier) typage, tests et build sur l'arbre extrait.
//
// Les réponses au pre-mortem, une par mode d'échec :
//   · LE DÉPÔT A BOUGÉ SOUS LA SÉRIE → l'application en 3 voies absorbe ce qui
//     ne se chevauche pas ; un vrai conflit ARRÊTE tout et nomme les fichiers.
//     Jamais de résolution automatique.
//   · UNE NOUVEAUTÉ DU DÉPÔT RÉINTRODUIT UN NOM PROPRE (nouveau fichier, nouvelle
//     branche « si c'est ce pro-là ») → le scan final la trouve et refuse.
//   · LE CODE NEUTRE NE MARCHE PLUS → --verifier : typage (aucune erreur hors de
//     la liste préexistante tolérée), tests 0 échec, build vert.
//   · L'EXTRACTION ÉCRASE QUELQUE CHOSE → le dossier de sortie doit être absent
//     ou vide ; sinon refus.
//   · LE CODE ET LA BASE DIVERGENT → la base livrée est celle que `base/rejouer.mjs`
//     prouve conforme à la référence ; l'extraction note le commit des deux.
//
// Usage :
//   node zohshia/renodevis/extraire.mjs --depot <dépôt de référence> --sortie <dossier neuf>
//        [--ref origin/main] [--verifier --modules <node_modules à lier>]
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, existsSync, rmSync, symlinkSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chargerRecette, neutraliserFichier, RACINE } from './neutraliser.mjs';
import { scanner } from './scanner.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const arg = (nom, defaut) => { const i = process.argv.indexOf(`--${nom}`); return i > 0 ? process.argv[i + 1] : defaut; };
const drapeau = (nom) => process.argv.includes(`--${nom}`);
const DEPOT = arg('depot');
const REF = arg('ref', 'origin/main');
const SORTIE = arg('sortie');
const SERIE = join(RACINE, 'outils', 'zohshia', 'renodevis', 'neutre');
// Identité des commits du clone jetable : ni nom, ni adresse de personne.
const identite = { GIT_AUTHOR_NAME: 'zohshia', GIT_AUTHOR_EMAIL: 'zohshia', GIT_COMMITTER_NAME: 'zohshia', GIT_COMMITTER_EMAIL: 'zohshia' };

const refus = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const ok = (msg) => console.log(`✓ ${msg}`);
const git = (cwd, args, env = {}) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 256 * 1024 * 1024 });

if (!DEPOT || !SORTIE) refus('usage : extraire.mjs --depot <dépôt> --sortie <dossier neuf> [--ref origin/main] [--verifier --modules <node_modules>]');
if (existsSync(SORTIE) && readdirSync(SORTIE).length) refus(`${SORTIE} n'est pas vide — l'extraction n'écrase rien`);
// Le code extrait ne porte pas non plus les noms de l'équipe de référence.
const recette = chargerRecette(undefined, { equipe: true });

// ── 1. Le clone jetable, au commit demandé ───────────────────────────────────
const sha = git(DEPOT, ['rev-parse', REF]).trim();
const travail = mkdtempSync(join(tmpdir(), 'zohshia-extraction-'));
process.on('exit', () => rmSync(travail, { recursive: true, force: true }));
git(travail, ['init', '-q']);
// La référence est récupérée par son NOM complet (un dépôt local ne sert pas un
// commit demandé par son seul identifiant), puis on se place sur le commit lu.
const nomComplet = git(DEPOT, ['rev-parse', '--symbolic-full-name', REF]).trim() || REF;
git(travail, ['fetch', '-q', DEPOT, `+${nomComplet}:refs/source/ref`]);
git(travail, ['checkout', '-q', '-b', 'neutre', sha]);
ok(`dépôt de référence au commit ${sha.slice(0, 7)}`);

// ── 2. La série de neutralisation : retraits, puis diff en 3 voies ─────────
const retirer = join(SERIE, 'retirer.txt');
const diff = join(SERIE, 'neutre.diff');
if (!existsSync(retirer) || !existsSync(diff)) refus(`série absente dans ${SERIE} — l'extraction sans neutralisation du code est refusée (ranger la série : zohshia/renodevis/serie.mjs)`);
const motifs = readFileSync(retirer, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
// Les fichiers que le diff modifie ne sont jamais retirés avant lui (un README
// réécrit, par exemple) : retirer puis modifier ferait échouer l'application.
const touches = new Set([...readFileSync(diff, 'utf8').matchAll(/^diff --git a\/(\S+) b\//gm)].map((m) => m[1]));
const versRe = (m) => new RegExp('^' + m.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '(?:.*/)?').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$');
const motifsRe = motifs.map(versRe);
const suivis = git(travail, ['ls-files']).split('\n').filter(Boolean);
const aRetirer = suivis.filter((c) => !touches.has(c) && (motifsRe.some((re) => re.test(c)) || recette.motif.test(c)));
for (let i = 0; i < aRetirer.length; i += 200) git(travail, ['rm', '-q', '--', ...aRetirer.slice(i, i + 200)]);
const ap = spawnSync('git', ['-C', travail, 'apply', '--3way', '--binary', '--whitespace=nowarn', diff], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
if (ap.status !== 0) {
  const conflits = spawnSync('git', ['-C', travail, 'diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8' }).stdout.trim();
  refus(`la série ne s'applique plus en 3 voies — conflit réel à résoudre DANS LA SÉRIE (jamais dans l'arbre extrait) :\n${conflits || ap.stderr.trim().split('\n').slice(0, 8).join('\n')}`);
}
const correctifs = ['retirer.txt', 'neutre.diff'];
const base = existsSync(join(SERIE, 'BASE')) ? readFileSync(join(SERIE, 'BASE'), 'utf8').trim() : '';
ok(`série appliquée : ${aRetirer.length} fichier(s) retiré(s), diff en 3 voies${base && base !== sha ? ` (série faite sur ${base.slice(0, 7)}, appliquée sur ${sha.slice(0, 7)})` : ''}`);

// ── 3. Les migrations, par la recette ────────────────────────────────────────
const dossierMig = join(travail, 'supabase', 'migrations');
let migrations = 0;
for (const f of readdirSync(dossierMig).filter((x) => x.endsWith('.sql'))) {
  const chemin = `supabase/migrations/${f}`;
  try {
    const { texte } = neutraliserFichier(chemin, readFileSync(join(dossierMig, f), 'utf8'), recette);
    writeFileSync(join(dossierMig, f), texte);
    migrations += 1;
  } catch (e) { refus(e.message); }
}
ok(`migrations neutralisées : ${migrations}`);

// ── 4. La base neuve ─────────────────────────────────────────────────────────
const dossierBase = join(travail, 'supabase', 'base');
mkdirSync(dossierBase, { recursive: true });
copyFileSync(join(ICI, 'base', '01-socle.sql'), join(dossierBase, '01-socle.sql'));
copyFileSync(join(ICI, 'base', '99-finition.sql'), join(dossierBase, '99-finition.sql'));
const ordre = JSON.parse(readFileSync(join(ICI, 'base', 'ordre.json'), 'utf8')).migrations;
writeFileSync(join(dossierBase, 'ordre.txt'), ['01-socle.sql', ...ordre.map((m) => `../migrations/${m}`), '99-finition.sql'].join('\n') + '\n');
git(travail, ['add', '-A']);
git(travail, ['commit', '-q', '-m', 'base neuve'], identite);
ok('base neuve ajoutée : socle, migrations dans l’ordre relevé, finition');

// ── 5. L'export, sans historique ─────────────────────────────────────────────
mkdirSync(SORTIE, { recursive: true });
execFileSync('sh', ['-c', `git -C "${travail}" archive HEAD | tar -x -C "${SORTIE}"`]);

// ── 6. Le scan ───────────────────────────────────────────────────────────────
const { lus, trouves } = scanner(SORTIE, recette);
if (lus < 100) refus(`seulement ${lus} fichiers extraits — extraction cassée (vert par vacuité refusé)`);
if (trouves.length) {
  for (const t of trouves.slice(0, 20)) console.error(`  ${t.rel}:${t.ligne} · ${t.jeton} · ${t.extrait}`);
  rmSync(SORTIE, { recursive: true, force: true });
  refus(`${trouves.length} nom(s) propre(s) dans l'arbre extrait — sortie effacée ; compléter la série de correctifs`);
}
ok(`scan : ${lus} fichiers, aucun nom propre`);

// ── 7. La preuve que le code neutre marche ───────────────────────────────────
const preuves = {};
if (drapeau('verifier')) {
  const modules = arg('modules');
  if (!modules || !existsSync(modules)) refus('--verifier exige --modules <node_modules> (aucune installation réseau ici)');
  symlinkSync(modules, join(SORTIE, 'node_modules'));
  const lancer = (cmd, args) => spawnSync(cmd, args, { cwd: SORTIE, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  const tolerees = JSON.parse(readFileSync(join(ICI, 'extraction-tolerances.json'), 'utf8')).erreurs_typage_preexistantes;
  const tsc = lancer('npx', ['tsc', '--noEmit']);
  const erreurs = (tsc.stdout.match(/^[^\s].*error TS\d+.*$/gm) || []).map((l) => l.replace(/\(\d+,\d+\)/, ''));
  const nouvelles = erreurs.filter((e) => !tolerees.some((t) => e.startsWith(t)));
  preuves.typage = { erreurs: erreurs.length, nouvelles: nouvelles.length };
  if (nouvelles.length) refus(`typage : ${nouvelles.length} erreur(s) nouvelle(s)\n${nouvelles.slice(0, 5).join('\n')}`);
  ok(`typage : ${erreurs.length} erreur(s), toutes préexistantes et listées`);
  const tests = lancer('npm', ['test']);
  const n = (k) => Number((tests.stdout.match(new RegExp(`^# ${k} (\\d+)`, 'm')) || [])[1] ?? NaN);
  preuves.tests = { total: n('tests'), echecs: n('fail') };
  if (!Number.isFinite(preuves.tests.total) || preuves.tests.total < 100) refus(`tests : total illisible ou trop maigre (${preuves.tests.total})`);
  if (preuves.tests.echecs !== 0) refus(`tests : ${preuves.tests.echecs} échec(s)`);
  ok(`tests : ${preuves.tests.total} verts`);
  const build = lancer('npm', ['run', 'build']);
  preuves.build = build.status === 0;
  if (!preuves.build) refus(`build en échec :\n${(build.stdout + build.stderr).trim().split('\n').slice(-12).join('\n')}`);
  ok('build : vert');
  rmSync(join(SORTIE, 'node_modules'));
  rmSync(join(SORTIE, '.next'), { recursive: true, force: true });
  // Les produits de la vérification ne font pas partie du code livré.
  for (const f of readdirSync(SORTIE).filter((x) => x.endsWith('.tsbuildinfo'))) rmSync(join(SORTIE, f));
}

writeFileSync(join(SORTIE, 'zohshia-extraction.json'), JSON.stringify({
  extrait_le: new Date().toISOString(),
  commit_source: sha,
  correctifs,
  migrations,
  fichiers: lus,
  preuves,
}, null, 2) + '\n');
console.log(`\n✓ Code neutre extrait dans ${SORTIE}${drapeau('verifier') ? ', prouvé (typage, tests, build)' : ' (non vérifié : relancer avec --verifier)'}.`);
