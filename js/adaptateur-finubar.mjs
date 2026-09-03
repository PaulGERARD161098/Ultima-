/* L'ADAPTATEUR FINUBAR — l'état des huit dépôts → le ciel d'Ultima.

   Module ES PUR : aucune I/O, aucun DOM, aucune donnée personnelle. Il prend
   l'agrégat servi par `/api/finubar` (produit par `finubar/agreger.mjs`) et
   rend deux choses, et deux seulement :
     ① un REGISTRE augmenté — les projets deviennent des astres de l'arbre ;
     ② une table de SIGNAUX par nœud — la couleur d'appel, propagée vers le haut.

   Promu le 2026-09-02 depuis `design/preview-accueil-finubar.js`, où il a été
   éprouvé avant d'exister ici. C'est le chemin qu'a suivi `adaptateur-lv4.mjs`
   (maquette → production) et il a la même contrepartie : à partir de
   maintenant, `tests/unit-adaptateur-finubar.mjs` le tient, sans navigateur.

   ⛔ CE QU'IL NE FAIT PAS, ET C'EST STRUCTUREL : il ne CLASSE rien. L'ordre de
   priorité est calculé une seule fois, par `rangDe` dans `finubar/agreger.mjs`,
   et il est déjà dans l'agrégat. Une deuxième priorisation ici finirait par
   diverger de la première — l'étoile dirait 3 quand le bandeau dirait 2. */

/* LES TROIS DEGRÉS D'APPEL. L'ordre est celui qui gagne quand un parent hérite
   de plusieurs enfants.

   ⛔ AUCUN N'EST UN REPROCHE. Un projet au repos ne pâlit pas, ne rougit pas,
   ne porte aucune marque : l'absence de couleur est un silence, jamais une
   note (règle ③ d'ALTHEA étendue au produit — « Ultima compte, elle ne
   reproche pas »). La couleur dit une seule chose : *il y a quelque chose à
   faire ici*. */
export const DEGRES = { appel: 3, recaler: 2, braise: 1 };

/* `rang` vient de `rangDe` : 0 = a dérivé, 1 = attend un geste de Paul,
   2 = en cours, 3 = au repos, 9 = illisible ou hors séance. On TRADUIT.
   ⚠️ Le 9 ne devient pas un signal : un dépôt qu'on n'a pas pu lire n'a rien
   dit, et peindre son absence en couleur transformerait un angle mort de
   l'observateur en constat sur le projet (la faute réparée le 02/09 sur
   « pas lu » / « illisible »). */
export function degreDuRang(rang) {
  if (rang === 0) return 'recaler';
  if (rang === 1) return 'appel';
  if (rang === 2) return 'braise';
  return null;
}

/* Un identifiant d'astre, dérivé du dépôt. Préfixé pour qu'aucun projet ne
   puisse, même par accident de nommage, écraser un nœud de navigation
   existant : `depot:PaulGERARD161098/RenoBoost` ne collisionne avec rien. */
export function idDeDepot(depot) { return 'depot:' + depot; }

/**
 * LA GREFFE — le registre de navigation, augmenté des projets de Finubar.
 *
 * Rend un NOUVEAU registre : `NOEUDS` n'est jamais modifié en place, sans quoi
 * deux rendus successifs ne partiraient pas du même arbre — et le second
 * porterait les astres en double.
 *
 * Un projet dit où il s'accroche (`ciel`, posé dans `finubar/depots.json`).
 * Trois cas, et ils ne se déduisent pas l'un de l'autre :
 *   — `racine` : le projet EST le ciel qu'on regarde (Ultima). Pas d'étoile —
 *     se peindre soi-même au milieu de sa propre carte ajoute un objet et
 *     n'ajoute aucune information.
 *   — un id connu du registre : l'astre s'y accroche.
 *   — un id inconnu : l'astre tombe sous ALPHA plutôt que de disparaître. Un
 *     projet qu'on ne sait pas ranger doit être VISIBLE quelque part.
 */
export function greffer(registre, agregat, options) {
  const opts = options || {};
  const defaut = opts.defaut || 'alpha';
  const sortie = {};
  Object.keys(registre).forEach((id) => { sortie[id] = Object.assign({}, registre[id]); });

  const lisibles = ((agregat && agregat.projets) || []).filter((p) => p && p.ok && p.grain);
  lisibles.forEach((p) => {
    if (p.ciel === 'racine') { return; }
    const parent = p.ciel && sortie[p.ciel] ? p.ciel : defaut;
    if (!sortie[parent]) { return; }
    const id = idDeDepot(p.grain.depot || p.grain.projet);

    // ⛔ LA PORTE DU PARENT NE SE PERD PAS. Un nœud qui gagne des enfants
    // devient une constellation, et au ciel « ce qui contient s'isole, ce qui
    // ne contient pas ouvre » (LV4/LV5) : RENOBOOST IA cesserait donc d'ouvrir
    // renoboostia.fr, en silence, le jour où on lui greffe ses briques. On lui
    // rend sa cible sous forme d'un cap à part, AVANT ses projets.
    if (sortie[parent].cible && !Array.isArray(sortie[parent].enfants)) {
      const idPorte = 'porte:' + parent;
      sortie[idPorte] = {
        nom: sortie[parent].externe ? 'LE SITE' : 'LA PAGE',
        etat: sortie[parent].etat || 'Ouvert',
        blason: sortie[parent].blason || 'portail',
        cible: sortie[parent].cible,
        externe: Boolean(sortie[parent].externe),
        resume: sortie[parent].resume || '',
      };
      sortie[parent] = Object.assign({}, sortie[parent], { enfants: [idPorte] });
    }

    sortie[id] = {
      nom: p.grain.projet,
      etat: p.grain.etat === 'en_attente_de_paul' ? 'Attend un geste'
        : p.grain.etat === 'en_cours' ? 'En cours' : 'Au repos',
      blason: 'essor',
      // Un astre est un ÉTAT, pas une porte : il n'a pas de page à lui dans
      // Ultima. Sa cible reste `null` — donc `aria-disabled`, donc aucune
      // promesse faite à qui navigue au clavier.
      cible: null,
      resume: p.grain.jalon && p.grain.jalon.nom ? p.grain.jalon.nom : (p.grain.cap || ''),
    };
    sortie[parent] = Object.assign({}, sortie[parent], {
      enfants: (sortie[parent].enfants || []).concat([id]),
    });
  });

  // Un nœud qui vient de passer de feuille à constellation a besoin de la
  // parure d'un nœud-boussole (titre, invite, cœur, légende) : sans elle,
  // `verifierRegistre` le déclare incohérent et son écran s'ouvre sans titre.
  Object.keys(sortie).forEach((id) => {
    const n = sortie[id];
    if (!Array.isArray(n.enfants) || n.titre) { return; }
    sortie[id] = Object.assign({}, n, {
      titre: n.nom,
      surligne: 'Ultima · ' + n.nom,
      invite: 'Léo te guide — survole un cap.',
      coeur: 'anneau',
      legende: (n.nom || '').toLowerCase(),
    });
  });

  return sortie;
}

/**
 * LES SIGNAUX, PROPAGÉS VERS LE HAUT.
 *
 * Un astre qui appelle fait appeler toute sa lignée : c'est ce qui permet de
 * voir, depuis la racine, QUE quelque chose attend — avant même de savoir quoi.
 *
 * Le compte n'additionne qu'une fois par astre. Un projet compté deux fois
 * ferait un chiffre faux au premier étage, et un chiffre faux dans un
 * instrument de pilotage vaut moins que pas de chiffre du tout.
 *
 * `chemin` est passé en argument (c'est `chemin` de `registre-lv3.mjs`) plutôt
 * qu'importé : ce module reste ainsi testable sur un registre inventé, et la
 * hiérarchie n'est jamais re-déduite ici — une vue qui déduit son propre arbre
 * finit par en déduire un autre que celui du registre.
 */
export function signaux(registre, agregat, chemin) {
  const parNoeud = Object.create(null);
  const poser = (id, degre, projet) => {
    if (!degre || !registre[id]) { return; }
    const e = parNoeud[id] || (parNoeud[id] = { degre: null, compte: 0, projets: [] });
    if (!e.degre || DEGRES[degre] > DEGRES[e.degre]) { e.degre = degre; }
    e.compte += 1;
    if (e.projets.indexOf(projet) === -1) { e.projets.push(projet); }
  };

  ((agregat && agregat.projets) || []).filter((p) => p && p.ok && p.grain).forEach((p) => {
    const degre = degreDuRang(p.rang);
    if (!degre) { return; }
    const id = idDeDepot(p.grain.depot || p.grain.projet);
    if (!registre[id]) { return; }
    // La racine n'est jamais peinte : elle n'a pas d'étoile, et un appel posé
    // sur elle n'orienterait vers rien.
    chemin(id, registre).forEach((etape) => {
      if (etape !== 'racine') { poser(etape, degre, p.grain.projet); }
    });
  });

  return parNoeud;
}

/** Ce que le lecteur d'écran entend — le compte n'est jamais porté par la
 *  seule couleur (une information peinte et pas dite n'existe pas pour tout
 *  le monde). */
export function libelleDegre(degre, compte) {
  const n = Math.max(0, parseInt(compte, 10) || 0);
  const pluriel = n > 1 ? 's' : '';
  if (degre === 'appel') return n + ' projet' + pluriel + ' attend' + (n > 1 ? 'ent' : '') + ' un geste de toi';
  if (degre === 'recaler') return n + ' projet' + pluriel + ' a' + (n > 1 ? 'ont' : '') + ' avancé depuis sa dernière note';
  if (degre === 'braise') return n + ' projet' + pluriel + ' en cours';
  return '';
}

// ---------- FINUBAR vu par Léo (2026-09-03) ----------
// Ces deux-là vivent ICI, et pas dans js/finubar.js, pour la raison qui vaut
// pour tout cet adaptateur : ce sont des fonctions PURES, donc éprouvables
// sous Node sans navigateur. `ETIQUETTES` les suit — l'écran et la voix
// doivent nommer un état avec LE MÊME mot, sinon Paul lit « en cours » et
// entend « au repos ».

export const ETIQUETTES = {
  en_cours: 'en cours',
  en_attente_de_paul: 'attend un geste',
  au_repos: 'au repos',
};

// ---------- Les yeux de Léo sur FINUBAR (2026-09-03) ----------
// Ce que Léo VOIT quand Paul lui parle depuis cette page : les comptes de la
// macro et les intitulés déjà affichés à l'écran — rien de plus.
//
// ⛔ Trois règles, et ce sont elles qui rendent la voix honnête ici :
//   1. AUCUN calcul neuf. Tout ce qui part vient de l'agrégat déjà rendu par
//      `rendre()`. Recalculer un signal pour Léo créerait une seconde vérité,
//      et Paul entendrait un état que la page ne montre pas.
//   2. AUCUN identifiant, aucun contenu de dépôt, aucun commit. Le nom d'un
//      dépôt et une prochaine action suffisent à répondre « où on en est » ;
//      le reste ne ferait qu'augmenter la surface pour rien.
//   3. Bornes TENUES ICI, pas seulement côté serveur : 12 compteurs, 4 listes,
//      40 entrées, 200 caractères. Le serveur rejette tout dépassement en bloc
//      (400) — un état trop gros ne dégraderait pas la réponse, il la
//      SUPPRIMERAIT, et la voix deviendrait muette sans dire pourquoi.
const MAX_ENTREES = 40;
const MAX_LIBELLE = 200;

function borner(texte) {
  const t = String(texte === undefined || texte === null ? '' : texte).trim();
  return t.length > MAX_LIBELLE ? t.slice(0, MAX_LIBELLE) : t;
}

export function yeuxDeLeo(donnees) {
  const m = (donnees.macro && typeof donnees.macro === 'object') ? donnees.macro : {};
  const entier = (v) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : 0);

  const compteurs = {
    depots: entier(m.total),
    en_cours: entier(m.en_cours),
    en_attente_de_paul: entier(m.en_attente_de_paul),
    au_repos: entier(m.au_repos),
    boucles_ouvertes: entier(m.boucles_ouvertes),
  };

  const listes = {};

  // Ce qui appelle ce matin — exactement les signaux affichés en haut de page.
  const brut = donnees.cartouche;
  const signaux = (brut && Array.isArray(brut.signaux)) ? brut.signaux : [];
  const dits = signaux
    .map((s) => borner(`${s && s.projet ? s.projet : '?'} — ${s && s.dit ? s.dit : ''}`))
    .filter((t) => t.length > 0)
    .slice(0, MAX_ENTREES);
  if (dits.length) listes.ce_qui_appelle = dits.map((libelle) => ({ libelle }));

  // La prochaine action, et sa nature (un geste de Paul se distingue d'une
  // tâche de code : c'est la seule chose que Léo ne doit pas confondre).
  const action = brut && brut.action;
  if (action && action.faire) {
    listes.prochaine_action = [{
      libelle: borner(`${action.projet || '?'} — ${action.faire}`),
      marque: action.nature === 'geste' ? 'geste de Paul' : 'travail',
    }];
  }

  // La table de marche : un dépôt, son état, sa prochaine action.
  const projets = Array.isArray(donnees.projets) ? donnees.projets : [];
  const marche = projets.slice(0, MAX_ENTREES).map((p) => {
    const grain = (p && p.grain && typeof p.grain === 'object') ? p.grain : {};
    const suite = grain.prochaine_action || (p && p.motif) || '';
    const etat = ETIQUETTES[grain.etat] || (p && p.hors_seance ? 'hors séance' : '');
    const item = { libelle: borner(`${(p && p.depot) || '?'} — ${suite}`) };
    if (etat) item.marque = borner(etat).slice(0, 60);
    return item;
  }).filter((i) => i.libelle.length > 0);
  if (marche.length) listes.table_de_marche = marche;

  // Les gestes qui n'attendent que Paul — la question qu'il posera le plus
  // souvent, et la seule à laquelle la page répond aujourd'hui en le faisant
  // dérouler huit fiches. `bloque_par` est la source, telle quelle.
  const gestes = [];
  projets.forEach((p) => {
    const grain = (p && p.grain && typeof p.grain === 'object') ? p.grain : null;
    const bloques = (grain && Array.isArray(grain.bloque_par)) ? grain.bloque_par : [];
    bloques.forEach((geste) => {
      if (gestes.length >= MAX_ENTREES) return;
      const libelle = borner(`${(p && p.depot) || '?'} — ${geste}`);
      if (libelle) gestes.push({ libelle });
    });
  });
  if (gestes.length) listes.gestes_en_attente = gestes;

  return { compteurs, listes };
}
