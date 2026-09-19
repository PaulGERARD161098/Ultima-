// Unitaires de la collecte des specs (Node pur, zéro réseau, zéro navigateur).
//
// Pourquoi ce harnais existe : un index de specs est un instrument qui se lit
// comme un constat. S'il rend « aucune spec » là où il n'a rien pu mesurer, ou
// « vivante » là où il n'a pas pu dater, il ne se trompe pas tout seul — il
// fait se tromper celui qui le lit, et rien ne le signale.
//
// Chaque contrôle d'absence est précédé de son verrou de non-vacuité, et chaque
// garde est prouvée DEUX FOIS : qu'elle refuse ce qu'elle doit refuser, et
// qu'elle laisse passer ce qu'elle doit laisser passer.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(ICI, '../specs/collecter.mjs');
const verdicts = {};
function verifier(nom, condition, detail = '') {
  verdicts[nom] = condition;
  console.log(`${condition ? 'ok  ' : 'ÉCHEC'} ${nom}${detail && !condition ? ` — ${detail}` : ''}`);
}

function git(dossier, ...arguments_) {
  execFileSync('git', ['-C', dossier, ...arguments_], { stdio: 'ignore', env: { ...process.env, ...HORLOGE } });
}

/* ⛔ LA FIXTURE A SA PROPRE HORLOGE, ET C'EST LA CORRECTION DU 19/09/2026.
   Ce harnais gelait « aujourd'hui » au 2026-09-18 (les cinq appels à `lancer`
   ci-dessous) pendant que son dépôt factice, lui, se commitait à la date réelle
   de la machine. Tant que la machine était au 18, tout concordait. Le 19, la
   collecte a rendu `2026-09-19 (-1 j)` — un âge NÉGATIF — et le contrôle
   « la date est mesurée, pas supposée », qui attend `\d+ j`, est passé au rouge.

   ⚠️ AUCUNE LIGNE DE CODE N'AVAIT BOUGÉ. Le test s'est cassé tout seul en
   changeant de jour, et il aurait été lu comme une régression du collecteur par
   la première séance qui l'aurait vu rouge. Une bombe à retardement de calendrier
   est pire qu'un test absent : elle accuse le code au moment où elle explose.

   ⛔ ET LA DÉTENTE N'EST PAS DE RELÂCHER LE MOTIF en acceptant `-?\d+`. L'âge
   négatif n'est pas un format à tolérer, c'est un non-sens : il dit qu'un fichier
   a été touché APRÈS la date de référence. Le contrôle a raison de le refuser.
   Ce qui avait tort, c'est la fixture, qui n'était pas maîtresse de son temps.

   Le commit est donc anchoré la veille de la date de référence : âge = 1 jour,
   état « vivante », et le harnais rend le même verdict dans dix ans. */
const REFERENCE = '2026-09-18';
const VEILLE = '2026-09-17T12:00:00Z';
const HORLOGE = { GIT_AUTHOR_DATE: VEILLE, GIT_COMMITTER_DATE: VEILLE };

// Un dépôt git réel et minuscule : la collecte dérive ses dates de `git log`,
// un faux dossier sans `.git` ne prouverait donc rien de ce qui compte.
function depotFactice(racine, nom, fichiers) {
  const d = join(racine, nom);
  mkdirSync(d, { recursive: true });
  git(d.replace(/\/[^/]*$/, ''), 'init', '--quiet', nom);
  for (const [chemin, contenu] of Object.entries(fichiers)) {
    const complet = join(d, chemin);
    mkdirSync(dirname(complet), { recursive: true });
    writeFileSync(complet, contenu);
  }
  git(d, 'config', 'user.email', 'harnais@local');
  git(d, 'config', 'user.name', 'harnais');
  git(d, 'add', '-A');
  git(d, 'commit', '--quiet', '-m', 'socle');
  return d;
}

// Un faux Ultima : le collecteur se situe par rapport à lui-même, il suffit
// donc de le copier dans `<tmp>/Ultima-/specs/` avec son `finubar/depots.json`.
function faireUltima(racine, depots) {
  const u = join(racine, 'Ultima-');
  mkdirSync(join(u, 'specs'), { recursive: true });
  mkdirSync(join(u, 'finubar'), { recursive: true });
  copyFileSync(SOURCE, join(u, 'specs', 'collecter.mjs'));
  writeFileSync(join(u, 'finubar', 'depots.json'), JSON.stringify(depots));
  return u;
}

function lancer(ultima, ...arguments_) {
  try {
    const sortie = execFileSync(process.execPath, [join(ultima, 'specs', 'collecter.mjs'), ...arguments_], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, sortie, erreur: '' };
  } catch (e) {
    return { code: e.status ?? -1, sortie: e.stdout || '', erreur: e.stderr || '' };
  }
}

const bac = mkdtempSync(join(tmpdir(), 'specs-collecte-'));
try {
  // ── 1. Le laisse-passer : un dépôt normal est recensé, et daté. ───────────
  {
    const racine = join(bac, 'nominal');
    mkdirSync(racine, { recursive: true });
    depotFactice(racine, 'Projet', {
      'CADRAGE-truc.md': '# cadrage\nune ligne\n',
      'REPRISE-2026-01-01-seance.md': '# journal\n',
      'docs/SPEC-machin.md': '# spec\n',
    });
    const ultima = faireUltima(racine, [{ dossier: 'Projet', depot: 'x/Projet' }]);
    const r = lancer(ultima, REFERENCE);
    const index = existsSync(join(ultima, 'specs', 'INDEX.md')) ? readFileSync(join(ultima, 'specs', 'INDEX.md'), 'utf8') : '';
    verifier('un dépôt normal sort en 0', r.code === 0, `code ${r.code} ${r.erreur}`);
    verifier('la spec retenue figure dans l\'index', index.includes('CADRAGE-truc.md') && index.includes('docs/SPEC-machin.md'));
    // ⛔ Le verrou de non-vacuité du contrôle suivant : sans lui, « le journal
    // est absent » serait vert sur un index vide, ou sur un index non écrit.
    verifier('VERROU non-vacuité — l\'index n\'est pas vide', index.length > 200 && index.includes('Projet'));
    verifier('le journal de séance est écarté', !index.includes('REPRISE-2026-01-01-seance.md'));
    // Un filtre qui écarte en silence se lit comme une absence : il doit COMPTER.
    verifier('le filtre dit ce qu\'il a écarté', /écartées sur \d+ fichiers lus/.test(index) && index.includes('journal de reprise'));
    verifier('la date est mesurée, pas supposée', /\d{4}-\d{2}-\d{2} \(\d+ j\)/.test(index));
  }

  // ── 2. Verrou nº1 : aucun dépôt lisible → refus, et RIEN écrit. ───────────
  {
    const racine = join(bac, 'vide');
    mkdirSync(racine, { recursive: true });
    const ultima = faireUltima(racine, [{ dossier: 'Absent', depot: 'x/Absent' }]);
    const r = lancer(ultima, REFERENCE);
    verifier('aucun dépôt lisible → sortie 3', r.code === 3, `code ${r.code}`);
    verifier('aucun dépôt lisible → aucun index écrit', !existsSync(join(ultima, 'specs', 'INDEX.md')));
  }

  // ── 3. Verrou nº2 : des dépôts lus, zéro spec retenue → refus. ────────────
  // C'est le filtre qui est cassé, pas le rayonnage qui est vide. Un index
  // écrit dans ce cas se lirait « ce dépôt n'a pas de spec » — un mensonge.
  {
    const racine = join(bac, 'filtre');
    mkdirSync(racine, { recursive: true });
    depotFactice(racine, 'Projet', { 'REPRISE-2026-01-01.md': '# journal\n', 'README.md': '# rien\n' });
    const ultima = faireUltima(racine, [{ dossier: 'Projet', depot: 'x/Projet' }]);
    const r = lancer(ultima, REFERENCE);
    verifier('dépôt lu mais zéro spec → sortie 4', r.code === 4, `code ${r.code}`);
    verifier('dépôt lu mais zéro spec → aucun index écrit', !existsSync(join(ultima, 'specs', 'INDEX.md')));
  }

  // ── 4. Le piège nommé : absent ≠ vide. ───────────────────────────────────
  {
    const racine = join(bac, 'absent');
    mkdirSync(racine, { recursive: true });
    depotFactice(racine, 'Present', { 'CADRAGE-a.md': '# a\n' });
    const ultima = faireUltima(racine, [
      { dossier: 'Present', depot: 'x/Present' },
      { dossier: 'Jamais', depot: 'x/Jamais' },
    ]);
    const r = lancer(ultima, REFERENCE);
    const index = readFileSync(join(ultima, 'specs', 'INDEX.md'), 'utf8');
    const bloc = index.slice(index.indexOf('## Jamais'));
    verifier('VERROU non-vacuité — le dépôt absent a bien un bloc', bloc.startsWith('## Jamais') && bloc.length > 50);
    verifier('un dépôt absent est « non mesuré »', bloc.includes('Non mesuré'));
    verifier('un dépôt absent n\'est JAMAIS « 0 spec »', !/Aucune spec retenue/.test(bloc));
    verifier('le compte de dépôts lus est honnête', index.includes('sur **1** dépôts lus (sur 2)'), r.sortie);
  }

  // ── 5. Clone superficiel : on ne date pas, et on le dit. ─────────────────
  // `git log` sur un clone `--depth 1` rend la date du HEAD pour TOUS les
  // fichiers : daté ainsi, tout serait « vivante ». La collecte doit s'abstenir.
  {
    const racine = join(bac, 'superficiel');
    mkdirSync(racine, { recursive: true });
    const source = depotFactice(racine, 'Source', { 'CADRAGE-a.md': '# a\n' });
    const cible = join(racine, 'Projet');
    execFileSync('git', ['clone', '--quiet', '--depth', '1', `file://${source}`, cible], { stdio: 'ignore' });
    const ultima = faireUltima(racine, [{ dossier: 'Projet', depot: 'x/Projet' }]);
    lancer(ultima, REFERENCE);
    const index = readFileSync(join(ultima, 'specs', 'INDEX.md'), 'utf8');
    // ⛔ On lit le BLOC DU DÉPÔT, pas l'index entier : l'en-tête porte la
    // légende des états, donc « 🟢 » y figure toujours. Cherché sur l'index
    // entier, ce contrôle échouait sur un collecteur pourtant juste — un test
    // qui accuse à tort finit par être désactivé, et il ne garde plus rien.
    const bloc = index.slice(index.indexOf('## Projet'));
    verifier('VERROU non-vacuité — la spec est bien recensée', bloc.includes('CADRAGE-a.md'));
    verifier('clone superficiel → la collecte le signale', bloc.includes('Clone superficiel'));
    verifier('clone superficiel → aucune fraîcheur inventée', !bloc.includes('🟢') && bloc.includes('❔'));
  }

  // ── 6. La garde de date refuse ET laisse passer. ─────────────────────────
  {
    const racine = join(bac, 'date');
    mkdirSync(racine, { recursive: true });
    depotFactice(racine, 'Projet', { 'CADRAGE-a.md': '# a\n' });
    const ultima = faireUltima(racine, [{ dossier: 'Projet', depot: 'x/Projet' }]);
    verifier('une date malformée est refusée', lancer(ultima, 'hier').code === 2);
    verifier('une option n\'est pas prise pour une date', lancer(ultima, '--partiel').code === 0);
  }
} finally {
  rmSync(bac, { recursive: true, force: true });
}

const echecs = Object.entries(verdicts).filter(([, ok]) => !ok);
console.log(`${Object.keys(verdicts).length - echecs.length}/${Object.keys(verdicts).length} contrôles verts`);
process.exitCode = echecs.length ? 1 : 0;
