// Unitaires de la CI — quand seuls des `.md` changent, le harnais navigateur est sauté.
// Node pur, zéro réseau, zéro navigateur : le script de `tests.yml` est EXÉCUTÉ tel
// quel, sur des dépôts jetables, avec le shell que GitHub lui donne (`bash -e`).
//
// ⛔ Pourquoi ce garde existe. Facture GitHub du 19/10/2026 : Ultima- ≈ 54 % des
// minutes Actions de l'organisation, et le harnais navigateur = 27 des 29 minutes
// facturées par exécution. La moitié des commits, mais un tiers des PR (11 sur 33
// fusionnées, diff NET — ce que la règle lit), sont des `.md` seuls. Le danger
// est d'UN seul côté : sauter un harnais qui aurait dû tourner — une PR de code
// verte sans avoir été testée. Les cas « on exécute » pèsent donc plus lourd que
// les cas « on saute », et chacun est construit sur une réponse connue d'avance.
//
// ⛔ Le cas qui a motivé le diff NET de la PR (et non celui du dernier commit) :
// une PR porte du code (commit 1), puis une note (commit 2). Le passage du commit 1
// est annulé par le suivant (`cancel-in-progress`). Si le commit 2 ne regardait que
// lui-même, il sauterait le harnais — et le code ne serait testé nulle part.
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const verdicts = {};
const yml = readFileSync(new URL('../.github/workflows/tests.yml', import.meta.url), 'utf8');

// ---------- Lecture du workflow ----------
const iUnit = yml.indexOf('\n  unit:');
const iBrowser = yml.indexOf('\n  browser:');
const unit = iUnit >= 0 && iBrowser > iUnit ? yml.slice(iUnit, iBrowser) : '';
const browser = iBrowser >= 0 ? yml.slice(iBrowser) : '';
// Les étapes du job navigateur : chacune commence par « \n      - ».
const etapes = browser.split(/\n(?=      - )/).slice(1);
const etapeDe = (motif) => etapes.find((e) => motif.test(e)) || '';
const SI = "if: steps.portee.outputs.seuls_md != 'true'";

const portee = etapeDe(/- name: Portée du changement/);
const m = /run: \|\n((?: {10}.*(?:\n|$))+)/.exec(portee);
const script = m ? m[1].replace(/^ {10}/gm, '') : '';

// 0. Verrous de non-vacuité : sans job, sans étapes ni script lus, tout le reste est vert à vide.
verdicts.jobsLus = unit.length > 100 && browser.length > 100;
verdicts.etapesLues = etapes.length >= 5;
verdicts.scriptLu = script.includes('git diff --name-only HEAD^1 HEAD') && script.includes('GITHUB_OUTPUT');

// 1. Structure du workflow.
const lourdes = [etapeDe(/actions\/setup-node@v4/), etapeDe(/npm ci --ignore-scripts/), etapeDe(/name: Harnais navigateur isolé/)];
verdicts.troisEtapesLourdesConditionnees = lourdes.every((e) => e.includes(SI));
//    La détection elle-même ne doit JAMAIS être conditionnée (elle se sauterait elle-même),
//    ni le checkout, qui la précède.
verdicts.detectionEtCheckoutInconditionnels = !portee.includes('if:') && !etapeDe(/actions\/checkout@v4/).includes('if:');
verdicts.detectionApresCheckoutAvantLeReste = etapes.findIndex((e) => e === etapeDe(/actions\/checkout@v4/)) <
  etapes.findIndex((e) => e === portee) && etapes.findIndex((e) => e === portee) <
  etapes.findIndex((e) => e === lourdes[0]);
verdicts.historiqueSuffisant = /fetch-depth: 2/.test(etapeDe(/actions\/checkout@v4/));
//    Le job `unit` garde LECONS.md et le sceau : il tourne toujours, sans condition d'étape.
verdicts.jobUnitJamaisSaute = unit.length > 100 && !/seuls_md|portee/.test(unit);

// ---------- Exécution du script réel sur des dépôts jetables ----------
const racine = mkdtempSync(join(tmpdir(), 'ci-md-seuls-'));
const fichierScript = join(racine, 'etape.sh');
writeFileSync(fichierScript, script);

const git = (cwd, ...a) => execFileSync('git',
  ['-c', 'user.name=t', '-c', 'user.email=t@t.test', '-c', 'commit.gpgsign=false', ...a],
  { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

let n = 0;
function depot() {
  const d = join(racine, `d${n += 1}`);
  mkdirSync(d);
  git(d, 'init', '-q', '-b', 'main');
  ecrire(d, 'README.md'); ecrire(d, 'js/a.js');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'base');
  return d;
}
function ecrire(d, f) {
  mkdirSync(dirname(join(d, f)), { recursive: true });
  writeFileSync(join(d, f), `v${Math.random()}\n`);
}
/** Fusion d'une PR comme la voit GitHub : HEAD = fusion, HEAD^1 = base, HEAD^2 = tête de la PR. */
function fusion(d, commits, { supprimer = [], vide = false } = {}) {
  git(d, 'switch', '-q', '-c', 'pr');
  for (const fichiers of commits) {
    fichiers.forEach((f) => ecrire(d, f));
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'c');
  }
  if (supprimer.length) { git(d, 'rm', '-q', ...supprimer); git(d, 'commit', '-q', '-m', 'rm'); }
  if (vide) git(d, 'commit', '-q', '--allow-empty', '-m', 'vide');
  git(d, 'switch', '-q', 'main');
  git(d, 'merge', '-q', '--no-ff', 'pr', '-m', 'fusion');
  return d;
}
/** Joue l'étape comme GitHub : `bash -e fichier`, GITHUB_OUTPUT en variable. */
function joue(d, env = {}) {
  const sortie = join(racine, `out${n += 1}`);
  writeFileSync(sortie, '');
  const r = spawnSync('/bin/bash', ['-e', fichierScript], { cwd: d, encoding: 'utf8', env: { ...process.env, ...env, GITHUB_OUTPUT: sortie } });
  const lignes = readFileSync(sortie, 'utf8').split('\n').filter((l) => l.startsWith('seuls_md='));
  return { code: r.status, valeur: lignes.length === 1 ? lignes[0].slice('seuls_md='.length) : `lignes:${lignes.length}` };
}
const saute = (r) => r.code === 0 && r.valeur === 'true';
const execute = (r) => r.code === 0 && r.valeur === 'false';

try {
  if (verdicts.scriptLu) {
    // 2. SAUTE — l'instrument répond « oui » sur un cas dont on connaît la réponse.
    verdicts.sauteMdSeuls = saute(joue(fusion(depot(), [['NOTES.md', 'memoire/x.md']])));
    verdicts.sauteMdSupprime = saute(joue(fusion(depot(), [], { supprimer: ['README.md'] })));

    // 3. EXÉCUTE — le côté dangereux. Chaque cas est « non » et doit le rester.
    verdicts.executeCodeSeul = execute(joue(fusion(depot(), [['js/b.js']])));
    verdicts.executeMdEtCode = execute(joue(fusion(depot(), [['NOTES.md', 'js/b.js']])));
    //    Le cas du diff NET : code d'abord, note ensuite — la PR entière porte du code.
    verdicts.executeCodePuisNoteSurLaPR = execute(joue(fusion(depot(), [['js/b.js'], ['NOTES.md']])));
    //    Suffixes voisins : seul `.md` exact (minuscules, en fin de nom) saute.
    verdicts.executeSuffixesVoisins = ['NOTE.MD', 'a.mdx', 'a.md.bak', 'docs.md/x.js', 'md', 'LISEZMOI']
      .every((f) => execute(joue(fusion(depot(), [[f]]))));
    //    Diff vide : le garde `[ -n "$fichiers" ]` du script est REDONDANT avec la ligne vide que
    //    `printf '%s\n'` envoie à grep (cette ligne ne finit pas par .md → exécute). Il reste, comme
    //    intention lisible ; ce verdict verrouille le COMPORTEMENT. Éprouvé en retirant le garde ET la
    //    fin de ligne : rouge (19/10) — retirer le garde seul ne change rien, et c'est normal.
    verdicts.executeDiffVide = execute(joue(fusion(depot(), [], { vide: true })));
    //    Pas de parent (premier commit, historique tronqué) : le diff est impossible → on exécute.
    const seul = join(racine, 'seul'); mkdirSync(seul); git(seul, 'init', '-q', '-b', 'main');
    ecrire(seul, 'NOTES.md'); git(seul, 'add', '-A'); git(seul, 'commit', '-q', '-m', 'seul');
    verdicts.executeSansParent = execute(joue(seul));

    // 4. Les erreurs ne valent JAMAIS « tout est .md ».
    //    grep en erreur (code 2) : `! grep` ou `[ $? -ne 0 ]` l'aurait lu comme « rien d'autre qu'un .md ».
    const ombre = join(racine, 'ombre'); mkdirSync(ombre);
    writeFileSync(join(ombre, 'grep'), '#!/bin/sh\nexit 2\n'); chmodSync(join(ombre, 'grep'), 0o755);
    verdicts.executeGrepEnErreur = execute(joue(fusion(depot(), [['NOTES.md']]), { PATH: `${ombre}:${process.env.PATH}` }));
    //    git introuvable.
    verdicts.executeGitAbsent = execute(joue(fusion(depot(), [['NOTES.md']]), { PATH: '/nonexistent' }));

    // 5. L'étape elle-même ne casse jamais le job : code 0 dans tous les cas ci-dessus
    //    (déjà vérifié par saute()/execute()), et une seule ligne de sortie (`lignes:1` sinon).
  }
} finally {
  rmSync(racine, { recursive: true, force: true });
}

console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-CI-MD-SEULS OK' : 'UNIT-CI-MD-SEULS ECHEC');
process.exit(ok ? 0 : 1);
