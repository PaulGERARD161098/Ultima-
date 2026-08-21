#!/usr/bin/env node
// Finubar — la collecte. Lit les FINUBAR.md des dépôts voisins, MESURE l'écart
// avec ce que git montre, et écrit `finubar/macro.json`.
//
// ⛔ Pourquoi la mesure git est le cœur de ce fichier, et pas un bonus.
// Un FINUBAR.md décrit un état ; il ne le dérive pas. Il est juste à la minute
// où il est écrit et faux au geste suivant — c'est la leçon payée le 05/08 sur
// RénoDevis, où un doc de reprise a vieilli en vingt minutes. On ne peut pas
// empêcher un fichier de vieillir ; on peut l'obliger à DIRE qu'il a vieilli.
// D'où : tout ce qui se dérive de git n'est PAS écrit à la main, et la collecte
// compare `dernier_arret.commit` à la tête réelle. Un projet qui a avancé
// depuis sa note remonte en tête de l'agrégat avec la mention de son écart.
// C'est la directive IA appliquée au pilotage : l'auto propose, le manuel gagne.
//
// Aucune écriture ailleurs que dans `finubar/macro.json`. Aucun réseau.
// `git` est appelé par execFileSync en tableau d'arguments (jamais de shell).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extraireBloc, lireGrain, agreger, cartoucheDuMatin, versConstellation } from './agreger.mjs';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE_ULTIMA = resolve(ICI, '..');
const FICHIER_DEPOTS = join(ICI, 'depots.json');
const SORTIE = join(ICI, 'macro.json');
// ⚠️ DEUX ÉCRITURES, UNE SEULE SOURCE. `macro.json` est la forme lisible (jq,
// relecture, diff en revue) ; `macro.mjs` est la MÊME donnée en module ES,
// parce que c'est le seul motif d'import que le traceur de fichiers de Vercel
// suit à coup sûr pour embarquer un fichier dans une fonction serverless.
// Les deux sont écrits dans le même souffle et RELUS avant de sortir : deux
// fichiers écrits ensemble ne peuvent diverger que si quelqu'un en édite un à
// la main — d'où l'avertissement en tête du module, et la relecture ci-dessous.
const SORTIE_MODULE = join(ICI, 'macro.mjs');

// La date du jour est un ARGUMENT, jamais une lecture implicite : c'est ce qui
// rend la collecte rejouable et le résultat comparable d'un jour à l'autre.
const aujourdhui = (process.argv[2] || new Date().toISOString().slice(0, 10)).slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(aujourdhui)) {
  console.error('Date attendue au format AAAA-MM-JJ.');
  process.exit(2);
}

const depots = JSON.parse(readFileSync(FICHIER_DEPOTS, 'utf8'));

// Mesure git d'un dépôt. Toute anomalie rend `null` — une mesure absente se dit,
// elle ne se remplace pas par une valeur par défaut qui aurait l'air d'un fait.
function mesurerGit(chemin, commitNote) {
  const git = (args) => execFileSync('git', ['-C', chemin, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10_000,
  }).trim();
  try {
    const tete = git(['log', '-1', '--format=%h']);
    const teteLe = git(['log', '-1', '--format=%aI']);
    let commitsDepuis = null;
    if (commitNote && /^[0-9a-f]{7,40}$/i.test(commitNote)) {
      try {
        // `A..B` = les commits atteignables depuis B et pas depuis A.
        // ⛔ EN EXCLUANT LES FICHIERS DE FINUBAR LUI-MÊME. Sans cette exclusion,
        // le commit qui CRÉE la note la déclarerait aussitôt périmée, et les huit
        // dépôts s'afficheraient « dérivés » le jour de la pose. Un signal qui
        // s'allume partout dès le premier jour n'est plus un signal : on apprend
        // à l'ignorer, et il ne servira plus le jour où il aura raison.
        // Ce qui est mesuré est donc : « le dépôt a-t-il avancé sur du CONTENU
        // depuis cette note ? » — la seule question dont la réponse compte.
        commitsDepuis = Number(git(['rev-list', '--count', `${commitNote}..HEAD`,
          '--', ':(exclude)FINUBAR.md', ':(exclude).claude/finubar-rappel.mjs']));
      } catch {
        // Le commit noté n'existe pas dans ce clone (branche non récupérée,
        // historique réécrit) : on le DIT au lieu de compter 0.
        commitsDepuis = null;
      }
    }
    return { tete, tete_le: teteLe, commits_depuis: commitsDepuis };
  } catch {
    return null;
  }
}

const entrees = depots.map((d) => {
  const chemin = resolve(RACINE_ULTIMA, '..', d.dossier);
  const fichier = join(chemin, 'FINUBAR.md');
  if (!existsSync(fichier)) {
    return { ok: false, motif: 'FINUBAR.md absent', depot: d.depot, grain: null, derive: null };
  }
  let entree;
  try {
    entree = lireGrain(extraireBloc(readFileSync(fichier, 'utf8')), d.depot);
  } catch {
    entree = { ok: false, motif: 'fichier illisible', depot: d.depot, grain: null };
  }
  const derive = mesurerGit(chemin, entree.ok ? entree.grain.dernier_arret.commit : '');
  return { ...entree, derive };
});

const agregat = agreger(entrees, aujourdhui);
const sortie = {
  ...agregat,
  cartouche: cartoucheDuMatin(agregat),
  constellation: versConstellation(agregat),
};

const texte = JSON.stringify(sortie, null, 2);
writeFileSync(SORTIE, texte + '\n', 'utf8');
writeFileSync(SORTIE_MODULE,
  '// ⛔ FICHIER GÉNÉRÉ — ne pas éditer à la main.\n'
  + '// Source : `node finubar/collecter.mjs`. Jumeau lisible : `finubar/macro.json`.\n'
  + '// Il existe parce que `api/finubar.js` doit l\'IMPORTER pour que Vercel\n'
  + '// l\'embarque dans le paquet de la fonction (un readFileSync ne serait pas tracé).\n'
  + 'export default ' + texte + ';\n', 'utf8');

// Relecture immédiate : une écriture qui échoue à moitié et une écriture réussie
// ont la même tête côté appel. On relit les deux fichiers et on exige qu'ils
// disent la même chose — sinon on sort en erreur au lieu de laisser passer.
{
  const relu = JSON.parse(readFileSync(SORTIE, 'utf8'));
  const reluModule = readFileSync(SORTIE_MODULE, 'utf8');
  const dedans = reluModule.slice(reluModule.indexOf('export default ') + 15, -2);
  if (JSON.stringify(relu) !== JSON.stringify(JSON.parse(dedans))) {
    console.error('Finubar : macro.json et macro.mjs divergent — collecte annulée.');
    process.exit(1);
  }
}

const m = sortie.macro;
console.log(`Finubar — ${m.total} projets · ${m.en_cours} en cours · ${m.en_attente_de_paul} en attente de Paul · ${m.au_repos} au repos`);
if (m.derives) console.log(`⚠️  ${m.derives} projet(s) ont avancé depuis leur dernière note.`);
if (m.illisibles) console.log(`⚠️  ${m.illisibles} projet(s) sans grain lisible : ${sortie.projets.filter((p) => !p.ok).map((p) => `${p.depot} (${p.motif})`).join(', ')}`);
sortie.cartouche.signaux.forEach((s) => console.log(`  • ${s.projet} — ${s.dit}`));
if (sortie.cartouche.action) console.log(`  ▶ ${sortie.cartouche.action.projet} : ${sortie.cartouche.action.faire}`);
