// tests/unit-finubar-mesure-git.mjs — la MESURE DE FRAÎCHEUR, éprouvée sur un
// dépôt git jetable dont on connaît déjà toutes les réponses.
//
// Ajouté par le dry run DR du 2026-09-07, qui a trouvé la mesure MUETTE sur le
// grain d'Ultima (`commit: "à renseigner"`) : la collecte annonçait le dépôt
// comme n'importe quel dépôt à jour.
//
// ⛔ CE QUE CE HARNAIS MESURE, ET POURQUOI CE N'EST PAS « EST-CE QUE ÇA COMPTE
// BIEN ». Le compte des commits est le côté qu'on emprunte tous les jours, et
// il marchait. Ce qui manquait est le côté par où l'on entre : les trois façons
// dont la mesure peut CESSER d'être possible — SHA détruit par un squash, SHA
// jamais renseigné, champ vide. Les trois doivent DIRE qu'elles ne mesurent
// plus. Le silence, lui, se lit « tout va bien » : c'est le pire des deux états.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mesurerGit } from '../finubar/mesure-git.mjs';

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✔ ${nom}`); return; }
  echecs += 1;
  console.log(`  ✘ ${nom}${detail ? ` — ${detail}` : ''}`);
}

// Un dépôt de laboratoire : trois commits, dont on connaît d'avance l'écart.
const depot = mkdtempSync(join(tmpdir(), 'finubar-mesure-'));
const git = (...a) => execFileSync('git', ['-C', depot, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
git('init', '-q', '-b', 'main');
git('config', 'user.email', 'labo@exemple.test');
git('config', 'user.name', 'labo');
const poser = (nom, texte) => { writeFileSync(join(depot, nom), texte); git('add', '-A'); git('commit', '-qm', `pose ${nom}`); return git('log', '-1', '--format=%h'); };
const socle = poser('a.txt', 'un');
poser('b.txt', 'deux');
poser('c.txt', 'trois');

console.log('\n§1 — le côté qu’on emprunte : compter, sur un écart connu d’avance');

const deuxDeRetard = mesurerGit(depot, socle);
verifier('deux commits de contenu depuis le socle', deuxDeRetard && deuxDeRetard.commits_depuis === 2,
  JSON.stringify(deuxDeRetard));
verifier('  ↳ et ce n’est pas signalé comme non mesurable', deuxDeRetard && deuxDeRetard.commit_inconnu === false);

const aJour = mesurerGit(depot, git('log', '-1', '--format=%h'));
verifier('sur la tête même : aucun écart', aJour && !aJour.commits_depuis);
verifier('  ↳ et la tête n’est pas conservée quand il n’y a rien à dire',
  aJour && aJour.tete === null, 'sinon chaque collecte resalit macro.json');

// ⛔ VERROU DE NON-VACUITÉ. Sans ces deux cas, tout le §2 serait vert sur une
// fonction qui répondrait « non mesurable » à TOUT — l'exacte panne uniforme
// contre laquelle la règle du 2026-08-17 met en garde.
console.log('\n§2 — le côté par où l’on entre : la mesure DIT quand elle s’arrête');

for (const [nom, note] of [
  ['un SHA valide mais introuvable ici (le cas du squash)', 'deadbee'],
  ['⛔ « à renseigner » — le grain jamais rattaché (défaut du 07/09)', 'à renseigner'],
  ['une chaîne vide', ''],
  ['le champ absent', undefined],
  ['un texte quelconque', 'voir la roadmap'],
]) {
  const m = mesurerGit(depot, note);
  verifier(nom, m && m.commit_inconnu === true, `commit_inconnu = ${m && m.commit_inconnu}`);
  verifier('  ↳ et la fraîcheur est rendue NON mesurable, pas « 0 d’écart »',
    m && m.commits_depuis === null, `commits_depuis = ${m && m.commits_depuis}`);
  verifier('  ↳ et la tête est gardée : c’est elle qui sert à recaler',
    m && typeof m.tete === 'string' && m.tete.length > 0);
}

console.log('\n§3 — un dossier qui n’est pas un dépôt : la mesure s’abstient');
const vide = mkdtempSync(join(tmpdir(), 'finubar-pasgit-'));
verifier('rend null plutôt qu’un fait inventé', mesurerGit(vide, socle) === null);
rmSync(vide, { recursive: true, force: true });
rmSync(depot, { recursive: true, force: true });

console.log(echecs === 0
  ? '\n=== unit-finubar-mesure-git : TOUT VERT ==='
  : `\n=== unit-finubar-mesure-git : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
