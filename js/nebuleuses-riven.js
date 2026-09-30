// Table des nébuleuses de RIVEN — exposée en global : window.UltimaNebuleusesRiven
//
// Une nébuleuse est un GRAND SECTEUR : elle regroupe les secteurs saisis sur les
// fiches (« Conseil - direction financière », « Tuyautiste »…), qu'on appelle
// ici ses domaines. Décision de Paul, 2026-09-30 (CADRAGE-RIVEN-NEBULEUSES.md) :
// quarante secteurs donnaient quarante amas illisibles ; neuf nébuleuses les
// rangent.
//
// ⛔ UNE SEULE TABLE POUR LES DEUX VUES. La carte à plat (js/ciel-nebuleuses.js)
// et le volume 3D (js/ciel.js, option `regrouper`) la lisent toutes les deux :
// une étoile est dans la même nébuleuse quelle que soit la vue. Deux tables
// finiraient par diverger, et Paul chercherait une étoile au mauvais endroit.
//
// La correspondance se fait sur le DÉBUT du secteur saisi, sans casse ni
// espaces de bord. Un secteur que la table ne reconnaît pas ne se perd pas : il
// tombe dans « À classer », qui est visible et compté. Module pur, sans DOM : il
// se teste seul (tests/unit-riven-nebuleuses.mjs).
(function (racine) {
  'use strict';

  // L'ordre de ce tableau est l'ordre d'affichage : il ne suit pas les effectifs,
  // pour qu'une nébuleuse garde sa place quand le réseau grandit.
  // `rgb` : la teinte, en composantes — la couche de fond du volume n'accepte
  // qu'un `rgb(r,g,b)` littéral (js/ciel-fond.js, RGB_VALIDE).
  var NEBULEUSES = [
    { cle: 'conseil', nom: 'Conseil & services aux entreprises', court: 'Conseil & services', rgb: [201, 164, 92] },
    { cle: 'finance', nom: 'Finance & banque', court: 'Finance & banque', rgb: [127, 167, 201] },
    { cle: 'medias', nom: 'Médias & édition', court: 'Médias & édition', rgb: [184, 122, 158] },
    { cle: 'industrie', nom: 'Industrie & technologie', court: 'Industrie & tech', rgb: [154, 143, 208] },
    { cle: 'btp', nom: 'BTP & rénovation', court: 'BTP & rénovation', rgb: [208, 138, 85] },
    { cle: 'energie', nom: 'Énergie & environnement', court: 'Énergie & env.', rgb: [111, 168, 154] },
    { cle: 'institutions', nom: 'Institutions & associatif', court: 'Institutions', rgb: [196, 106, 106] },
    { cle: 'commerce', nom: 'Commerce, luxe & arts', court: 'Commerce & arts', rgb: [212, 154, 138] },
    { cle: 'aclasser', nom: 'À classer', court: 'À classer', rgb: [138, 143, 153] }
  ];
  var CLE_A_CLASSER = 'aclasser';

  // Les règles, dans l'ordre : la première qui reconnaît le début du secteur
  // l'emporte. Les corps d'état du bâtiment sont nommés un par un : ce sont les
  // métiers des artisans de Paul, et une fiche d'artisan ne doit jamais tomber
  // dans « À classer » parce qu'elle dit « Plomberie » au lieu de « BTP ».
  // « Art » exige l'espace qui suit (« Art - peinture ») : sans lui, il
  // avalerait « artisanat ».
  var REGLES = [
    [/^(conseil|audit|recouvrement|recrutement|services - finances|courtage)/, 'conseil'],
    [/^(banque|finance)/, 'finance'],
    [/^(médias|medias|édition|edition)/, 'medias'],
    [/^(aéronautique|aeronautique|holding industrielle|ingénierie|ingenierie|logiciel|technologie)/, 'industrie'],
    [/^(btp|tuyaut|isolation|cvc|ventilation|rénovation|renovation|menuiserie|plomberie|électricité|electricite|toiture|couverture|charpente|maçonnerie|maconnerie|chauffage|climatisation|carrelage|plâtrerie|platrerie|serrurerie|terrassement|étanchéité|etancheite)/, 'btp'],
    [/^(énergie|energie|environnement)/, 'energie'],
    [/^(politique|études|etudes|associatif|médico-social|medico-social)/, 'institutions'],
    [/^(retail|luxe|art )/, 'commerce']
  ];

  var parCle = Object.create(null);
  NEBULEUSES.forEach(function (n) { parCle[n.cle] = n; });

  function cleDe(secteur) {
    var s = typeof secteur === 'string' ? secteur.trim().toLowerCase() : '';
    if (!s) { return CLE_A_CLASSER; }
    for (var i = 0; i < REGLES.length; i++) {
      if (REGLES[i][0].test(s)) { return REGLES[i][1]; }
    }
    return CLE_A_CLASSER;
  }

  function nebuleuseDe(secteur) { return parCle[cleDe(secteur)]; }

  function teinte(n) { return 'rgb(' + n.rgb[0] + ',' + n.rgb[1] + ',' + n.rgb[2] + ')'; }

  // Les fiches rangées par nébuleuse, dans l'ordre de la table, nébuleuses
  // vides écartées. Chaque groupe porte aussi ses domaines (secteurs distincts,
  // dans l'ordre de première apparition).
  function repartir(noeuds) {
    var groupes = NEBULEUSES.map(function (n) { return { nebuleuse: n, noeuds: [], domaines: [] }; });
    var index = Object.create(null);
    groupes.forEach(function (g) { index[g.nebuleuse.cle] = g; });
    (noeuds || []).forEach(function (noeud) {
      var g = index[cleDe(noeud && noeud.secteur_activite)];
      g.noeuds.push(noeud);
      var d = noeud && typeof noeud.secteur_activite === 'string' ? noeud.secteur_activite.trim() : '';
      if (d && g.domaines.indexOf(d) === -1) { g.domaines.push(d); }
    });
    return groupes.filter(function (g) { return g.noeuds.length > 0; });
  }

  racine.UltimaNebuleusesRiven = {
    NEBULEUSES: NEBULEUSES,
    CLE_A_CLASSER: CLE_A_CLASSER,
    cleDe: cleDe,
    nebuleuseDe: nebuleuseDe,
    teinte: teinte,
    repartir: repartir
  };
})(typeof window !== 'undefined' ? window : this);
