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
