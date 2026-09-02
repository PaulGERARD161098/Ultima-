/* MAQUETTE — l'accueil piloté par FINUBAR (dicté par Paul le 2026-09-02).
   Cadrage : CADRAGE-ACCUEIL-FINUBAR.md. Elle ne juge que la FORME ; l'état
   réel se lit sur /finubar, derrière authentification.

   TROIS CHOSES, ET RIEN D'AUTRE :
     ① le VRAI moteur (js/ciel.js) et le VRAI registre (js/registre-lv3.mjs) —
        une maquette qui redessine le ciel qu'elle prétend montrer ne montre
        plus rien (leçon preview-riven-stellaire, 2026-08-16) ;
     ② la GREFFE : les projets de Finubar deviennent des astres de l'arbre ;
     ③ L'APPEL : la couleur monte des astres vers leurs constellations, et le
        bandeau du bas dit par quoi commencer.

   Les deux fonctions pures ci-dessous (`greffer`, `signaux`) sont les
   CANDIDATES à devenir `js/adaptateur-finubar.mjs` le jour du go — c'est le
   chemin qu'a suivi `adaptateur-lv4.mjs`, qui a vécu ici avant d'être du code
   de production. Elles sont écrites pour ça : aucune I/O, aucun DOM. */
import { NOEUDS, chemin } from '../js/registre-lv3.mjs';
import { versCiel, cheminVers } from '../js/adaptateur-lv4.mjs';
import { AGREGAT } from './preview-accueil-finubar-fixture.mjs';

// ---------------------------------------------------------------- pur ①

/* LES TROIS DEGRÉS D'APPEL, et l'ordre compte : c'est lui qui gagne quand un
   parent hérite de plusieurs enfants.

   ⛔ AUCUN N'EST UN REPROCHE. Un projet au repos ne pâlit pas, ne rougit pas,
   ne porte aucune marque : l'absence de couleur est un silence, pas un
   jugement (règle ③ d'ALTHEA, étendue au produit — « Ultima compte, elle ne
   reproche pas »). La couleur ne dit qu'une chose : *il y a quelque chose à
   faire ici*. C'est un appel, jamais une note. */
export const DEGRES = { appel: 3, recaler: 2, braise: 1 };

/* `rang` vient de `finubar/agreger.mjs` (`rangDe`) et il est déjà l'ordre
   d'appel : 0 dérive, 1 attend un geste de Paul, 2 en cours, 3 au repos, 9
   illisible ou hors séance. On le TRADUIT, on ne le recalcule pas — deux
   priorisations du même état finiraient par diverger. */
export function degreDuRang(rang) {
  if (rang === 0) return 'recaler';
  if (rang === 1) return 'appel';
  if (rang === 2) return 'braise';
  return null;
}

/* LA GREFFE — le registre de navigation, augmenté des projets de Finubar.
   Rend un NOUVEAU registre : on ne modifie jamais `NOEUDS` en place, sans quoi
   deux rendus successifs ne partiraient pas du même arbre. */
export function greffer(registre, agregat) {
  const sortie = {};
  Object.keys(registre).forEach((id) => { sortie[id] = { ...registre[id] }; });

  (agregat.projets || []).filter((p) => p.ok).forEach((p) => {
    // Un projet raccroché à la racine EST le ciel qu'on regarde (Ultima) : il
    // n'a pas d'étoile à lui. Se peindre soi-même au milieu de sa propre carte
    // ajoute un objet et n'ajoute aucune information.
    const parent = p.ciel && p.ciel !== 'racine' ? p.ciel : (p.ciel === 'racine' ? null : 'alpha');
    if (!parent || !sortie[parent]) return;
    const id = 'depot:' + p.depot;
    sortie[id] = {
      nom: p.grain.projet,
      etat: p.grain.etat === 'en_attente_de_paul' ? 'Attend un geste'
        : p.grain.etat === 'en_cours' ? 'En cours' : 'Au repos',
      blason: 'essor',
      cible: null,
      resume: p.grain.jalon.nom || p.grain.cap || '',
    };
    sortie[parent] = { ...sortie[parent], enfants: (sortie[parent].enfants || []).concat([id]) };
  });

  // Un nœud greffé peut faire d'une FEUILLE une boussole (RENOBOOST IA n'avait
  // pas d'enfants). Il lui faut alors la parure d'un nœud-boussole, sinon le
  // registre est incohérent — `verifierRegistre` le dirait, et le ciel
  // afficherait un écran sans titre.
  Object.keys(sortie).forEach((id) => {
    const n = sortie[id];
    if (!Array.isArray(n.enfants) || n.titre) return;
    sortie[id] = { ...n, titre: n.nom, surligne: 'Ultima · ' + n.nom,
      invite: 'Léo te guide — survole un cap.', coeur: 'anneau', legende: (n.nom || '').toLowerCase() };
  });
  return sortie;
}

// ---------------------------------------------------------------- pur ②

/* LES SIGNAUX, PROPAGÉS VERS LE HAUT. Un astre qui appelle fait appeler toute
   sa lignée — c'est ce qui permet de voir depuis la racine QUE quelque chose
   attend, sans encore savoir quoi. Le compte, lui, ne s'additionne qu'une fois
   par astre : un projet compté deux fois ferait un chiffre faux au premier
   étage, et un chiffre faux dans un instrument de pilotage vaut moins que pas
   de chiffre du tout. */
export function signaux(registre, agregat) {
  const parNoeud = {};
  const poser = (id, degre, projet) => {
    if (!degre || !registre[id]) return;
    const e = parNoeud[id] || (parNoeud[id] = { degre: null, compte: 0, projets: [] });
    if (!e.degre || DEGRES[degre] > DEGRES[e.degre]) e.degre = degre;
    e.compte += 1;
    if (e.projets.indexOf(projet) === -1) e.projets.push(projet);
  };
  (agregat.projets || []).filter((p) => p.ok).forEach((p) => {
    const degre = degreDuRang(p.rang);
    if (!degre) return;
    const id = 'depot:' + p.depot;
    if (!registre[id]) return;
    chemin(id, registre).forEach((etape) => { if (etape !== 'racine') poser(etape, degre, p.grain.projet); });
  });
  return parNoeud;
}

// ---------------------------------------------------------------- la scène

const scene = document.getElementById('scene');
const fil = document.getElementById('fil');
const titre = document.getElementById('titre');
const parole = document.getElementById('parole');
const bandeau = document.getElementById('bandeau');
const REGISTRE = greffer(NOEUDS, AGREGAT);
const SIGNAUX = signaux(REGISTRE, AGREGAT);

let foyer = null;      // le nœud isolé, null = la racine
let couleur = true;    // l'interrupteur de la maquette : avec / sans appel
// ⛔ ÉTEINT PAR DÉFAUT, ET C'EST UNE MESURE, PAS UN GOÛT. Mesuré le 2026-09-02
// à 1440 × 900 : déplié à la racine, le moteur tasse les cinq étoiles sur un
// même axe vertical et le nom de la branche se pose SUR son étoile. Trois
// étoiles, il les dispose bien ; cinq sur deux étages, non. L'interrupteur
// reste pour que Paul voie les deux — mais on ne livre pas une orientation qui
// rend le ciel moins lisible que sans elle.
let ouvrir = false;    // le ciel s'ouvre-t-il de lui-même sur le chemin qui appelle ?
let vue = null;

function libelleDegre(degre) {
  return degre === 'appel' ? 'attend un geste de toi'
    : degre === 'recaler' ? 'a avancé depuis sa dernière note'
      : 'en cours';
}

/* LE CHEMIN QUI APPELLE, DÉPLIÉ D'OFFICE — c'est la réponse à « le ciel
   m'oriente ». La racine ne montre que trois étoiles ; l'arborescence ne se
   voit qu'après un clic, et une orientation qui exige un clic n'oriente pas.
   On déplie donc, à l'ouverture, LA branche de tête — celle que Finubar a
   classée première (`cartouche.action`), pas une branche choisie ici : deux
   priorisations du même état finiraient par diverger.
   ⚠️ Le dépliage est BORNÉ À UN ÉTAGE par l'adaptateur (`versCiel` n'ouvre que
   les enfants directs d'un nœud DU niveau) : le ciel ne se déroule pas tout
   entier, il entrouvre une porte. */
function brancheQuiAppelle() {
  const projet = ((AGREGAT.cartouche || {}).action || {}).projet;
  const id = Object.keys(REGISTRE).find((k) => REGISTRE[k].nom === projet);
  if (!id) return null;
  const suite = chemin(id, REGISTRE); // racine › … › astre
  return suite.length > 1 ? suite[1] : null; // l'enfant direct de la racine
}

function rendre() {
  const deplie = !foyer && ouvrir && couleur ? brancheQuiAppelle() : null;
  const donnees = versCiel('racine', REGISTRE, { isole: foyer, deplie });
  vue = window.UltimaCiel.rendre(scene, donnees, {
    cadrerSurLesEtoiles: true, tousLesNoms: true, fond: true,
    libellesType: { cap: 'cap' },
  });

  // LA COULEUR EST POSÉE APRÈS COUP, PAR UNE CLASSE — jamais par une géométrie
  // à nous. Le moteur repositionne ses cercles à chaque image ; un halo dessiné
  // ici serait au bon endroit pendant une image et faux ensuite. Une classe et
  // un `drop-shadow` n'ont pas de coordonnées : ils suivent l'étoile sans rien
  // savoir d'elle. (Et `js/ciel.js` n'est pas touché — jurisprudence LV4.)
  scene.querySelectorAll('.ciel-etoile[data-noeud-id]').forEach((g) => {
    const id = g.getAttribute('data-noeud-id');
    const s = couleur ? SIGNAUX[id] : null;
    if (!s) { g.removeAttribute('data-appel'); return; }
    g.setAttribute('data-appel', s.degre);
    const t = g.querySelector('title');
    if (t) t.textContent = t.textContent + ' — ' + s.compte + ' ' + libelleDegre(s.degre);
    // Le compte est DIT au lecteur d'écran, pas seulement peint : une
    // information portée par la seule couleur n'existe pas pour tout le monde.
    g.setAttribute('aria-label', (g.getAttribute('aria-label') || '') +
      ', ' + s.compte + ' ' + libelleDegre(s.degre));
  });

  // Le fil d'Ariane, LU dans le registre (jamais accumulé au fil des clics).
  const suite = foyer ? cheminVers(foyer, REGISTRE, 'racine') : ['racine'];
  fil.textContent = suite.map((id) => (REGISTRE[id] || {}).nom || id).join('  ›  ');
  const n = REGISTRE[foyer || 'racine'] || {};
  titre.textContent = foyer ? n.nom : 'Bienvenue sur Ultima';
  parole.textContent = foyer ? (n.resume || n.invite || '') : 'Sur quoi est-ce qu’on travaille aujourd’hui ?';

  dernierRendu = Date.now();
}

/* LE CLIC EST DÉLÉGUÉ À LA SCÈNE, ET IL EST BORNÉ DANS LE TEMPS. Délégué :
   le moteur vide et repeint la scène à chaque isolement, donc un écouteur posé
   sur chaque étoile serait à reposer à chaque fois — et un garde-fou qu'il faut
   penser à reposer n'est pas un garde-fou. Borné : le rendu se fait DANS le
   gestionnaire, l'étoile qui naît sous le curseur immobile ne doit pas recevoir
   la fin du même geste (c'est l'emballement trouvé en LV4 §③ sur le dépliage,
   et il se voit en manipulant, jamais en relisant).
   ⚠️ La production a un hook prévu pour ça — `options.surClicNoeud` de
   `js/ciel.js`. La maquette délègue à la main pour rester lisible d'un bloc ;
   le jour du go, c'est le hook qui sera branché, pas ce raccourci. */
let dernierRendu = 0;
scene.addEventListener('click', (e) => {
  if (Date.now() - dernierRendu < 300) return;
  const g = e.target.closest ? e.target.closest('.ciel-etoile[data-noeud-id]') : null;
  if (!g) return;
  const id = g.getAttribute('data-noeud-id');
  if ((REGISTRE[id] || {}).enfants) { foyer = id; rendre(); }
});

// ---------------------------------------------------------------- le bandeau

/* LE BANDEAU DU BAS — Finubar, et la parole de Léo par-dessus.
   Il ne calcule RIEN : il affiche `cartouche`, produit par `cartoucheDuMatin`
   dans `finubar/agreger.mjs` et servi tel quel par `/api/finubar`. Une
   deuxième règle de priorité écrite ici serait une deuxième vérité — et
   l'étoile dirait 3 quand le bandeau dirait 2 (pre-mortem LV6, n° 8). */
function poserBandeau() {
  const c = AGREGAT.cartouche;
  bandeau.textContent = '';
  const frag = document.createDocumentFragment();

  const entete = document.createElement('div');
  entete.className = 'fb-entete';
  const nom = document.createElement('p');
  nom.className = 'fb-nom';
  nom.textContent = 'FINUBAR · ce matin';
  const compte = document.createElement('p');
  compte.className = 'fb-compte';
  // ⛔ LA DATE EST AU PREMIER PLAN, PAS EN NOTE DE BAS DE PAGE (jalon 0 du
  // cadrage). L'agrégat est figé au dernier commit ; vu chaque matin en pleine
  // page, il se lirait comme l'état de l'instant. Un pilotage qui ne dit pas
  // de quand il date est un piège.
  compte.textContent = 'collecté le ' + AGREGAT.le + ' · '
    + AGREGAT.macro.lisibles + ' projets lus · '
    + AGREGAT.macro.en_attente_de_paul + ' attendent un geste · '
    + AGREGAT.macro.en_cours + ' en cours'
    + (AGREGAT.macro.hors_seance ? ' · ' + AGREGAT.macro.hors_seance + ' hors de portée' : '');
  entete.appendChild(nom); entete.appendChild(compte);
  frag.appendChild(entete);

  const liste = document.createElement('ul');
  liste.className = 'fb-signaux';
  c.signaux.forEach((s) => {
    const li = document.createElement('li');
    li.className = 'fb-signal';
    li.setAttribute('data-appel', s.pourquoi === 'attente' ? 'appel' : s.pourquoi === 'derive' ? 'recaler' : 'braise');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fb-bouton';
    const p = document.createElement('span');
    p.className = 'fb-projet'; p.textContent = s.projet;
    const d = document.createElement('span');
    d.className = 'fb-dit'; d.textContent = s.dit;
    b.appendChild(p); b.appendChild(d);
    // Le clic MÈNE À L'ENDROIT : un signal qu'on ne peut pas suivre est une
    // notification, et une notification ne fait rien avancer.
    b.addEventListener('click', () => {
      const cible = Object.keys(REGISTRE).find((id) => REGISTRE[id].nom === s.projet);
      const parent = cible ? (chemin(cible, REGISTRE).slice(-2)[0]) : null;
      if (parent && parent !== 'racine') { foyer = parent; rendre(); }
    });
    li.appendChild(b);
    liste.appendChild(li);
  });
  frag.appendChild(liste);

  const action = document.createElement('div');
  action.className = 'fb-action';
  const leo = document.createElement('p');
  leo.className = 'fb-leo';
  leo.textContent = 'Léo — commençons par ça';
  const quoi = document.createElement('p');
  quoi.className = 'fb-quoi';
  quoi.textContent = c.action.projet + ' · ' + c.action.faire;
  const nature = document.createElement('p');
  nature.className = 'fb-nature';
  // « L'action suit la main qui l'a » (agreger.mjs) : quand le goulot est un
  // geste de Paul, Léo ne propose pas d'aller coder à côté.
  nature.textContent = c.action.nature === 'geste'
    ? 'C’est un geste qui n’appartient qu’à toi — rien ne se code à sa place.'
    : 'C’est du code — je peux m’y mettre.';
  action.appendChild(leo); action.appendChild(quoi); action.appendChild(nature);
  frag.appendChild(action);

  bandeau.appendChild(frag);
}

// ---------------------------------------------------------------- outils

document.getElementById('b-couleur').addEventListener('click', (e) => {
  couleur = !couleur;
  e.currentTarget.setAttribute('aria-pressed', String(couleur));
  e.currentTarget.textContent = couleur ? 'Appel : allumé' : 'Appel : éteint';
  rendre();
});
document.getElementById('b-ouvrir').addEventListener('click', (e) => {
  ouvrir = !ouvrir;
  e.currentTarget.setAttribute('aria-pressed', String(ouvrir));
  e.currentTarget.textContent = ouvrir ? 'Chemin d’appel : ouvert' : 'Chemin d’appel : fermé';
  rendre();
});
document.getElementById('b-racine').addEventListener('click', () => { foyer = null; rendre(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && foyer) { foyer = null; rendre(); }
});

/* ⛔ LE CIEL S'ARRÊTE AU-DESSUS DU BANDEAU — et ce n'est pas un réglage
   esthétique, c'est un défaut MESURÉ le 2026-09-02 sur cette maquette. Le ciel
   occupait l'écran entier, le bandeau était posé par-dessus : une étoile tombée
   dans le tiers bas était PEINTE mais plus CLIQUABLE — le clic atterrissait sur
   le bouton du bandeau, qui isolait un tout autre nœud. L'écran répondait, donc
   rien ne signalait la panne : le pire des cas.
   La bande se MESURE (le bandeau grandit avec son contenu et avec la largeur),
   elle ne se devine pas — une constante serait fausse au premier signal long. */
function reserverLaBande() {
  const h = bandeau.getBoundingClientRect().height + 34; // + la mention et la marge
  document.documentElement.style.setProperty('--bas', Math.round(h) + 'px');
}

poserBandeau();
reserverLaBande();
rendre();
window.addEventListener('resize', () => { reserverLaBande(); rendre(); });
window.UltimaMaquetteFinubar = { registre: REGISTRE, signaux: SIGNAUX, foyer: () => foyer, vue: () => vue };
