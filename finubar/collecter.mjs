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
// relecture, diff en revue) ; le module ES est la MÊME donnée, importable par
// la fonction serverless. Les deux sont écrits dans le même souffle et RELUS
// avant de sortir : deux fichiers écrits ensemble ne peuvent diverger que si
// quelqu'un en édite un à la main — d'où l'avertissement en tête du module.
//
// ⛔ ET IL VIT DANS `api/_lib/`, PAS DANS `finubar/`. Ce n'est pas un rangement,
// c'est une question de déploiement. Le traceur de fichiers de Vercel embarque
// ce qu'une fonction importe ; les dix autres routes de ce dépôt importent
// toutes depuis `api/_lib/`, et ce motif est éprouvé en production. Un import
// qui SORT de l'arbre `api/` ne l'était pas — il passe la revue locale et rend
// 500 en production si le fichier n'est pas embarqué. On ne livre pas la seule
// chose qu'on ne peut pas tester ici sur le seul motif non éprouvé du dépôt.
// Bonus : `api/_lib/` n'est pas routé (préfixe `_`), donc pas servi non plus.
const SORTIE_MODULE = resolve(RACINE_ULTIMA, 'api', '_lib', 'finubar-macro.mjs');

// La date du jour est un ARGUMENT, jamais une lecture implicite : c'est ce qui
// rend la collecte rejouable et le résultat comparable d'un jour à l'autre.
//
// ⚠️ Et à défaut d'argument, elle est LOCALE, pas UTC. `toISOString()` aurait
// rendu la veille pour toute collecte lancée entre minuit et 2 h en France
// (UTC+2 l'été) : les « ouvert depuis N j » auraient été faux d'un jour, et
// silencieusement — le pire genre de faux. Même règle que `dateLocaleIso()`
// dans `js/app.js` et `js/leo-accueil.js`, et pour la même raison.
function dateLocaleIso() {
  const d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}
const aujourdhui = (process.argv[2] || dateLocaleIso()).slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(aujourdhui)) {
  console.error('Date attendue au format AAAA-MM-JJ.');
  process.exit(2);
}

// `depots.json` s'édite à la main, donc il est hostile par défaut (§8.2). Un
// `dossier` valant « ../.. » ferait sortir la collecte de l'arborescence des
// dépôts et lui ferait lire — puis publier dans macro.json — n'importe quel
// FINUBAR.md de la machine. Le nom de dossier est donc un NOM, pas un chemin.
const NOM_DOSSIER = /^[A-Za-z0-9._-]{1,64}$/;
const depots = JSON.parse(readFileSync(FICHIER_DEPOTS, 'utf8'))
  .filter((d) => {
    if (d && typeof d.dossier === 'string' && NOM_DOSSIER.test(d.dossier) && d.dossier !== '..') return true;
    // Un filtre qui écarte doit NOMMER ce qu'il écarte (règle du 2026-08-17) :
    // une entrée rejetée en silence se lirait comme un dépôt sans problème.
    console.error(`Finubar : entrée ignorée dans depots.json — nom de dossier invalide : ${JSON.stringify(d && d.dossier)}`);
    return false;
  });

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
        // Sont exclus : le grain, le rappel de séance, et les DEUX FICHIERS
        // GÉNÉRÉS par la collecte. Les deux derniers ont été oubliés à la
        // première écriture, et le défaut s'est vu tout de suite : le commit
        // qui recalait le grain d'Ultima sur sa tête réelle le déclarait
        // périmé dans la seconde qui suivait. Tout fichier que Finubar écrit
        // lui-même s'ajoute ici — sinon l'outil se signale à lui-même.
        commitsDepuis = Number(git(['rev-list', '--count', `${commitNote}..HEAD`,
          '--', ':(exclude)FINUBAR.md', ':(exclude).claude/finubar-rappel.mjs',
          ':(exclude)finubar/macro.json', ':(exclude)api/_lib/finubar-macro.mjs']));
      } catch {
        // Le commit noté n'existe pas dans ce clone (branche non récupérée,
        // historique réécrit) : on le DIT au lieu de compter 0.
        commitsDepuis = null;
      }
    }
    // ⚠️ La tête n'est CONSERVÉE que s'il y a quelque chose à dire.
    // Sans ça, chaque commit change `tete` et `tete_le`, donc chaque collecte
    // qui suit resalit `macro.json` — pour une information qui ne sert à rien
    // quand l'écart est nul. Résultat : un fichier généré jamais propre après un
    // push, qu'on finit par commiter sans le lire. Un bruit permanent finit
    // toujours par masquer un signal ; ici on le supprime à la racine.
    // Quand la dérive existe, en revanche, la tête est ce qui permet d'aller
    // voir CE qui a bougé — elle est donc gardée exactement dans ce cas.
    if (!commitsDepuis) return { tete: null, tete_le: null, commits_depuis: commitsDepuis };
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

// ⑤ LES HUIT COPIES DU RAPPEL DOIVENT ÊTRE IDENTIQUES À LEUR SOURCE.
// Le mode d'emploi le dit — « toute évolution se fait dans Ultima, puis se
// re-copie » — mais une règle que rien ne vérifie n'est pas une règle, c'est un
// vœu. Le jour où quelqu'un corrige une copie sur place, les huit dépôts se
// mettent à dire des choses différentes à l'ouverture d'une séance, et le
// symptôme (un rappel qui n'affiche pas la même chose selon le dépôt) est
// beaucoup plus difficile à relier à sa cause que ce message-ci.
// La collecte est le SEUL endroit où les huit dépôts sont ouverts ensemble :
// c'est donc ici que ça se vérifie, et nulle part ailleurs.
{
  const source = readFileSync(join(ICI, 'rappel.mjs'), 'utf8');
  const divergentes = [];
  const absentes = [];
  depots.forEach((d) => {
    const copie = resolve(RACINE_ULTIMA, '..', d.dossier, '.claude', 'finubar-rappel.mjs');
    if (!existsSync(copie)) { absentes.push(d.dossier); return; }
    if (readFileSync(copie, 'utf8') !== source) divergentes.push(d.dossier);
  });
  if (absentes.length) {
    console.error(`⚠️  Rappel d'ouverture de séance ABSENT dans : ${absentes.join(', ')} — ces dépôts ne se présenteront pas.`);
  }
  if (divergentes.length) {
    console.error(`⚠️  Rappel DIVERGENT de sa source dans : ${divergentes.join(', ')}.`);
    console.error('    La source unique est finubar/rappel.mjs. Re-copier depuis elle, ne jamais corriger une copie.');
  }
}

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
  + '// Il vit ICI, et non dans `finubar/`, parce que `api/finubar.js` doit\n'
  + '// l\'IMPORTER pour que Vercel l\'embarque dans le paquet de la fonction, et\n'
  + '// que `api/_lib/` est le seul motif d\'import éprouvé en production ici.\n'
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
