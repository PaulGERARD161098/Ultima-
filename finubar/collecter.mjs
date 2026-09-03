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
import { extraireBloc, lireGrain, agreger, cartoucheDuMatin, versConstellation, MAX_RECIT } from './agreger.mjs';

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
// ⛔ L'ACCROCHE AU CIEL VIT ICI, ET PAS DANS LES HUIT GRAINS — arbitrage n° 1 de
// Paul, 2026-09-02, et le cadrage disait d'abord l'inverse. La raison de ce
// changement tient en une phrase : `renoboost-ia` est un identifiant du
// REGISTRE DE NAVIGATION D'ULTIMA (`js/registre-lv3.mjs`), et RenoDevis n'a
// aucune raison de connaître l'arbre d'Ultima. Écrire l'accroche dans le grain
// de chaque dépôt y ferait fuiter une notion étrangère, et il faudrait toucher
// quatre dépôts pour déplacer une étoile. `depots.json` est déjà LA liste des
// huit, tenue par Ultima : y ajouter une colonne n'invente aucune seconde
// vérité, ça complète la seule qui existe.
//
// Le format est un identifiant nu, jamais un chemin : c'est une clé du registre.
const ID_CIEL = /^[a-z0-9][a-z0-9-]{0,63}$/;
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
  let commitInconnu = false;
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
        // Le commit noté est introuvable : branche non récupérée, historique
        // réécrit — et surtout **fusion en squash**, qui est le cas NORMAL ici.
        // Quand une PR est fusionnée en squash, les commits de la branche
        // disparaissent au profit d'un seul commit neuf : tous les grains
        // pointent alors dans le vide, et la mesure de fraîcheur s'arrête.
        //
        // ⛔ Elle doit s'arrêter EN LE DISANT. Rendre `null` sans rien annoncer
        // ferait taire le seul garde-fou contre une note périmée, au moment
        // précis où il devient inopérant — et personne ne s'en apercevrait,
        // puisque l'absence d'avertissement se lit « tout va bien ». C'est
        // exactement la faute de forme qu'on traque depuis le début du lot.
        commitsDepuis = null;
        commitInconnu = true;
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
    // Un commit introuvable GARDE la tête : c'est elle qui sert à recaler.
    if (commitInconnu) return { tete, tete_le: teteLe, commits_depuis: null, commit_inconnu: true };
    if (!commitsDepuis) return { tete: null, tete_le: null, commits_depuis: commitsDepuis, commit_inconnu: false };
    return { tete, tete_le: teteLe, commits_depuis: commitsDepuis, commit_inconnu: false };
  } catch {
    return null;
  }
}

// ⛔ DEUX ABSENCES QUI NE VEULENT PAS DIRE LA MÊME CHOSE, ET LES CONFONDRE COÛTE.
// La collecte lit le DISQUE. Or une séance Claude Code ne clone que les dépôts
// qui lui sont attachés : les autres n'ont pas de dossier du tout. Jusqu'au
// 02/09/2026 ils tombaient dans la même branche que « le fichier manque » et
// ressortaient en « FINUBAR.md absent » — un CONSTAT SUR LE DÉPÔT, alors que
// c'est un angle mort de l'observateur. Ce matin-là la collecte a annoncé
// « 3 projets sans grain lisible » ; les trois grains existaient, intacts, et
// leurs dépôts n'avaient même pas bougé depuis. Le message invitait à aller
// semer un grain déjà semé.
//
// La règle du dépôt (2026-08-21) le dit d'ailleurs déjà : quand on ne PEUT pas
// vérifier de ce côté-là, on retire l'hypothèse au lieu de la maquiller en fait.
// D'où deux issues distinctes — et surtout deux COMPTEURS distincts en aval :
// un dépôt hors séance n'a rien à voir avec un grain cassé, et les additionner
// ferait tomber une alerte réelle dans le bruit d'un angle mort connu.
//
// ⚠️ Ce qu'on ne fait PAS : le faire disparaître. Il reste dans l'agrégat, à sa
// place, avec son motif — règle ⑤ du mode d'emploi. Un dépôt qu'on n'a pas
// regardé ne doit jamais se lire comme un dépôt sans problème.
// L'accroche, résolue une fois pour toutes. Une valeur absente ou malformée
// retombe sur ALPHA — un projet sans accroche doit apparaître QUELQUE PART,
// jamais disparaître du ciel — mais le repli est ANNONCÉ plus bas : un défaut
// silencieux se lirait comme un choix.
const sansAccroche = [];
function accrocheDe(d) {
  if (typeof d.ciel === 'string' && ID_CIEL.test(d.ciel)) return d.ciel;
  sansAccroche.push(d.depot + (d.ciel === undefined ? '' : ` (valeur refusée : ${JSON.stringify(d.ciel)})`));
  return 'alpha';
}

const entrees = depots.map((d) => {
  const ciel = accrocheDe(d);
  const chemin = resolve(RACINE_ULTIMA, '..', d.dossier);
  const fichier = join(chemin, 'FINUBAR.md');
  if (!existsSync(chemin)) {
    return {
      ok: false, hors_seance: true, motif: 'dépôt non attaché à cette séance',
      depot: d.depot, ciel, grain: null, derive: null,
    };
  }
  if (!existsSync(fichier)) {
    return {
      ok: false, hors_seance: false, motif: 'FINUBAR.md absent',
      depot: d.depot, ciel, grain: null, derive: null,
    };
  }
  let entree;
  try {
    entree = lireGrain(extraireBloc(readFileSync(fichier, 'utf8')), d.depot);
  } catch {
    entree = { ok: false, motif: 'fichier illisible', depot: d.depot, grain: null };
  }
  const derive = mesurerGit(chemin, entree.ok ? entree.grain.dernier_arret.commit : '');
  return { ...entree, ciel, hors_seance: false, derive };
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
    // Même distinction qu'au-dessus, et pour la même raison : un dépôt qui n'est
    // pas là n'a pas « perdu son rappel », on ne l'a pas regardé. L'annoncer
    // absent enverrait re-copier un fichier déjà en place.
    const racine = resolve(RACINE_ULTIMA, '..', d.dossier);
    if (!existsSync(racine)) return;
    const copie = join(racine, '.claude', 'finubar-rappel.mjs');
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
if (m.commits_inconnus) {
  const noms = sortie.projets.filter((p) => p.derive && p.derive.commit_inconnu).map((p) => p.depot);
  console.log(`⚠️  ${m.commits_inconnus} grain(s) pointent un commit introuvable (fusion en squash ?) : ${noms.join(', ')}`);
  console.log('    Leur fraîcheur n\'est plus mesurable tant qu\'ils ne sont pas recalés sur la tête courante.');
}
// La coupe des récits est DITE, nommément. Sans ce cri, un grain qui regonfle
// se fait rogner en silence par le moteur, et l'écran affiche une phrase
// coupée que personne ne rattache à sa cause — l'état trouvé le 2026-09-03,
// où `dernier_arret.quoi` était à la borne sur les CINQ grains lus.
const coupes = sortie.projets.filter((p) => (p.recits || []).length);
if (coupes.length) {
  console.log(`⚠️  ${coupes.length} grain(s) dont un texte dépasse ${MAX_RECIT} caractères et a été coupé :`);
  coupes.forEach((p) => console.log(`    ${p.depot} — ${p.recits.join(', ')}`));
  console.log('    Un grain INDEXE : la phrase longue va dans le fichier que pointe `rattache_a`, pas ici.');
}
if (m.illisibles) console.log(`⚠️  ${m.illisibles} projet(s) sans grain lisible : ${sortie.projets.filter((p) => !p.ok && !p.hors_seance).map((p) => `${p.depot} (${p.motif})`).join(', ')}`);
// Dit sur le ton d'un fait, pas d'une alerte — parce que c'en est un : ces
// dépôts vont bien, on ne les a simplement pas ouverts. Mais il est DIT, et
// nommément : un angle mort tu se lirait comme « rien à signaler » (règle du
// 2026-08-17 — tout cas écarté est compté et nommé au rapport).
if (m.hors_seance) {
  const noms = sortie.projets.filter((p) => p.hors_seance).map((p) => p.depot);
  console.log(`ℹ️  ${m.hors_seance} dépôt(s) non attaché(s) à cette séance : ${noms.join(', ')}`);
  console.log('    Ni leur grain ni leur rappel n\'ont pu être lus ici — c\'est un angle mort de la collecte, pas un constat sur ces dépôts.');
}
// Le repli d'accroche est ANNONCÉ. Un projet rangé sous ALPHA faute de mieux
// est indiscernable, à l'écran, d'un projet rangé sous ALPHA exprès — et c'est
// exactement le genre de défaut qui ne se voit jamais parce qu'il ressemble à
// un choix (même famille que le « pas lu / illisible » du 02/09).
if (sansAccroche.length) {
  console.log(`ℹ️  ${sansAccroche.length} dépôt(s) sans accroche au ciel, rangé(s) sous ALPHA par défaut : ${sansAccroche.join(', ')}`);
  console.log('    L\'accroche se pose dans finubar/depots.json (champ « ciel » = un identifiant de js/registre-lv3.mjs).');
}
sortie.cartouche.signaux.forEach((s) => console.log(`  • ${s.projet} — ${s.dit}`));
if (sortie.cartouche.action) console.log(`  ▶ ${sortie.cartouche.action.projet} : ${sortie.cartouche.action.faire}`);
