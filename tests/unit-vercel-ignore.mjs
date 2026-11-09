// Unitaires — l'`ignoreCommand` de `vercel.json` : un commit dont TOUS les fichiers sont déjà
// exclus du déploiement par `.vercelignore` n'ouvre pas de build. Node pur, zéro réseau : la
// VRAIE chaîne de `vercel.json` est exécutée telle quelle, dans de vrais dépôts git jetables,
// avec le `.vercelignore` RÉEL du dépôt.
//
// ⛔ Pourquoi (19/10/2026). Cycle Vercel 25/09–25/10 : `ultima` = 30 h 52 de Build CPU (15,6 %),
// un build par push, documentation comprise. Mesuré sur `main` depuis le 25/09 : 76 commits sur
// 127 (hors fusions) ne touchent que des fichiers que `.vercelignore` retire du déploiement
// (documentation, tests, supabase/, finubar/, zohshia/…). Un build dont les entrées déployées
// n'ont pas bougé ne change rien en production.
//
// ⛔ Le repli va TOUJOURS vers le build : un build de trop coûte quelques secondes, un build
// sauté à tort laisse la production sur un code périmé sans que rien ne le dise. Donc : seul le
// code de sortie 1 de `grep` (« aucune ligne hors de la liste ») saute ; une erreur de `grep`,
// de `git`, un `.vercelignore` absent ou un diff vide construisent.
//
// ⚠️ Limite connue : la chaîne juge le diff du DERNIER commit (`HEAD^ → HEAD`). Dans un push
// groupé, un commit « exclu » poussé en dernier, après du code dans le même push, saute le
// build de la tête. Règle de conduite : le dernier commit d'un push porte du code, ou est mixte.
//
// Mêmes preuves que `RenoBoost` (aperçus Vercel « Ignored » sur trois commits de documentation)
// et `RenoDevis#395` (19/10 : commit de code « Ready », commits de documentation « Ignored »).
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const verdicts = {};
const racine = new URL('..', import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(racine, 'vercel.json'), 'utf8'));
const chaine = config.ignoreCommand;
const vercelignore = readFileSync(join(racine, '.vercelignore'), 'utf8');

const git = (cwd, ...args) => execFileSync(
  'git', ['-c', 'user.email=t@t.t', '-c', 'user.name=t', '-c', 'commit.gpgsign=false', ...args],
  { cwd, stdio: 'pipe' },
);
const ecrire = (cwd, fichiers) => {
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    mkdirSync(dirname(join(cwd, chemin)), { recursive: true });
    writeFileSync(join(cwd, chemin), contenu);
  }
};
const commit = (cwd, fichiers) => { ecrire(cwd, fichiers); git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', 'c'); };

/** Un dépôt jetable : base (avec le VRAI .vercelignore), puis `preparer` ; rend le code de sortie de la chaîne. */
function decision(preparer, { env = process.env, sansVercelignore = false } = {}) {
  const cwd = mkdtempSync(join(tmpdir(), 'ult-vignore-'));
  try {
    git(cwd, 'init', '-q', '-b', 'main');
    ecrire(cwd, {
      '.vercelignore': vercelignore,
      'api/leo.js': 'a', 'js/app.js': 'a', 'index.html': 'a', 'package.json': '{}', 'vercel.json': '{}',
      'README.md': 'a', 'memoire/LECONS.md': 'a', 'tests/unit-a.mjs': 'a', 'supabase/migrations/a.sql': 'a',
      'finubar/macro.json': '{}', 'zohshia/z.mjs': 'a', 'outils/o.py': 'a', '.github/workflows/t.yml': 'a',
      'js/README.md.js': 'a',
    });
    git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', 'base');
    preparer(cwd);
    if (sansVercelignore) rmSync(join(cwd, '.vercelignore'));
    const r = spawnSync('sh', ['-c', chaine], { cwd, stdio: 'pipe', env });
    return r.status === null ? -1 : r.status;
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}
const SAUTE = 0;
const saute = (...a) => decision(...a) === SAUTE;

// 0. Verrous de non-vacuité : sans chaîne lue ni .vercelignore réel, tout le reste est vert à vide.
verdicts.chaineLue = typeof chaine === 'string' && chaine.includes('git diff --name-only HEAD^ HEAD');
verdicts.vercelignoreLu = /^\*\.md$/m.test(vercelignore) && /^tests\/$/m.test(vercelignore);
verdicts.tientDansLaLimiteVercel = typeof chaine === 'string' && chaine.length > 0 && chaine.length <= 256;
// Le fichier qui sert de liste doit survivre au nettoyage de Vercel : il ne se liste pas lui-même.
verdicts.vercelignoreNeSeListePasLuiMeme = !/^\/?\.vercelignore\s*$/m.test(vercelignore);

// 1. Les commits « exclus du déploiement » sautent (une réponse connue d'avance chacun).
for (const [nom, fichiers] of Object.entries({
  documentation: { 'README.md': 'b', 'memoire/LECONS.md': 'b', 'CLAUDE.md': 'x' },
  tests: { 'tests/unit-a.mjs': 'b' },
  supabase: { 'supabase/migrations/a.sql': 'b' },
  finubar: { 'finubar/macro.json': '{"a":1}' },
  zohshia: { 'zohshia/z.mjs': 'b' },
  outilsEtCi: { 'outils/o.py': 'b', '.github/workflows/t.yml': 'b' },
})) verdicts[`saute_${nom}`] = saute((d) => commit(d, fichiers));

// 2. Tout fichier déployé construit — le danger est de CE côté : sauter ce qui aurait dû partir.
for (const f of ['api/leo.js', 'js/app.js', 'index.html', 'package.json', 'vercel.json', '.vercelignore']) {
  verdicts[`construit_${f.replace(/[^a-z]/gi, '_')}`] = !saute((d) => commit(d, { [f]: 'changed' }));
}
verdicts.construit_commitMixte = !saute((d) => commit(d, { 'README.md': 'b', 'api/leo.js': 'b' }));
verdicts.construit_fichierNeuf = !saute((d) => commit(d, { 'page-neuve.html': 'x' }));
// Le piège de la sous-chaîne : sans `-x`, `README.md` (exclu) « contient » ce chemin déployé.
verdicts.construit_cheminContenantUnExclu = !saute((d) => commit(d, { 'js/README.md.js': 'changed' }));

// 3. Les replis vont vers le build.
{
  const cwd = mkdtempSync(join(tmpdir(), 'ult-vignore-'));
  try {
    git(cwd, 'init', '-q', '-b', 'main');
    ecrire(cwd, { '.vercelignore': vercelignore, 'README.md': 'a' });
    git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', 'seul');
    verdicts.construit_sansCommitParent = spawnSync('sh', ['-c', chaine], { cwd, stdio: 'pipe' }).status !== SAUTE;
  } finally { rmSync(cwd, { recursive: true, force: true }); }
}
verdicts.construit_vercelignoreAbsent = !saute((d) => commit(d, { 'README.md': 'b' }), { sansVercelignore: true });
verdicts.construit_diffVide = !saute((d) => { git(d, 'commit', '-q', '--allow-empty', '-m', 'vide'); });
{
  // Un faux `grep` qui échoue hors 0 et 1 : un lien vers `node` (refuse `-qvxFf`, sort en 9).
  // Un lien et non un script : un /tmp monté `noexec` refuse d'exécuter un script posé dedans.
  const ombre = mkdtempSync(join(tmpdir(), 'ult-faux-grep-'));
  try {
    symlinkSync(process.execPath, join(ombre, 'grep'));
    const env = { ...process.env, PATH: `${ombre}:${process.env.PATH}` };
    const sonde = spawnSync('grep', ['-qvE', 'x'], { env, stdio: 'pipe' });
    verdicts.fauxGrepMord = sonde.status !== null && sonde.status !== 0 && sonde.status !== 1; // non-vacuité
    verdicts.construit_grepEnErreur = !saute((d) => commit(d, { 'README.md': 'b' }), { env });
  } finally { rmSync(ombre, { recursive: true, force: true }); }
}

// 4. Une fusion se juge sur le diff du premier parent.
const fusion = (fichiers) => saute((d) => {
  git(d, 'checkout', '-q', '-b', 'branche'); commit(d, fichiers);
  git(d, 'checkout', '-q', 'main'); commit(d, { 'memoire/autre.md': 'x' });
  git(d, 'merge', '--no-ff', '-q', '-m', 'merge', 'branche');
});
verdicts.fusion_codeConstruit = !fusion({ 'api/leo.js': 'b' });
verdicts.fusion_documentationSaute = fusion({ 'tests/unit-b.mjs': 'b' });


// 5. Les previews ne se construisent que sur DEMANDE (Paul, 09/11/2026). Cycle Vercel 25/10 → 09/11 :
// ≈ 30 $ projetés pour 20 $ visés, 92 % en build CPU, et les previews de branches d'agents en première
// cause (un build complet par commit poussé, facturé une minute pleine × vCPU). Sur une branche de
// preview, le build ne part que si le DERNIER commit poussé porte `[preview]` dans son message (titre ou
// corps, casse indifférente). Production et VERCEL_ENV inconnu : inchangés — le repli va vers le build.
const commitMsg = (cwd, message, fichiers) => { ecrire(cwd, fichiers); git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', message); };
const PREVIEW = { ...process.env, VERCEL_ENV: 'preview' };
const PRODUCTION = { ...process.env, VERCEL_ENV: 'production' };
verdicts.preview_codeSansMarqueurSaute = saute((d) => commitMsg(d, 'feat: bouton', { 'api/leo.js': 'b' }), { env: PREVIEW });
verdicts.preview_codeAvecMarqueurConstruit = !saute((d) => commitMsg(d, 'fix [preview]', { 'api/leo.js': 'b' }), { env: PREVIEW });
verdicts.preview_marqueurEnCorpsConstruit = !saute((d) => commitMsg(d, 'fix\n\n[preview] mobile', { 'api/leo.js': 'b' }), { env: PREVIEW });
verdicts.preview_marqueurMajusculesConstruit = !saute((d) => commitMsg(d, 'fix [PREVIEW]', { 'api/leo.js': 'b' }), { env: PREVIEW });
verdicts.preview_marqueurDocumentationSeuleSaute = saute((d) => commitMsg(d, 'docs [preview]', { 'README.md': 'b' }), { env: PREVIEW });
verdicts.production_codeSansMarqueurConstruit = !saute((d) => commitMsg(d, 'feat', { 'api/leo.js': 'b' }), { env: PRODUCTION });
{
  const env = { ...process.env }; delete env.VERCEL_ENV;
  verdicts.envInconnu_codeConstruit = !saute((d) => commitMsg(d, 'feat', { 'api/leo.js': 'b' }), { env });
}
verdicts.chaineLitVercelEnvEtMarqueur = chaine.includes('VERCEL_ENV') && chaine.includes('[preview]');

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.keys(verdicts).length >= 26 && Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-VERCEL-IGNORE OK' : 'UNIT-VERCEL-IGNORE ECHEC');
process.exit(ok ? 0 : 1);
