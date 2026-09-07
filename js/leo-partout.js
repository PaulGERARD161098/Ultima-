// Ultima — « parler à Léo partout » (ordre de Paul, 2026-09-03).
//
// Jusqu'ici la voix de Léo n'existait que sur cinq pages, montée à la main par
// le script de chaque quadrant. Ce module la rend disponible sur TOUTE page qui
// le charge, sans rien deviner :
//
//   - la page DÉCLARE son quadrant : <body data-leo-quadrant="riven">.
//     Absent → `ultima`, la Léo d'orientation, qui n'a aucune donnée sous les
//     yeux et le dit. ⛔ Jamais de rattachement déduit d'un nom de fichier ou
//     d'un lien « retour » : un quadrant faux donne une Léo qui parle du mauvais
//     sujet avec aplomb, ce qui est pire que pas de Léo.
//   - PAS d'accueil automatique : un simple bouton « Parler à Léo », que Paul
//     ouvre quand il veut. La décision « rien sur l'accueil » (2026-07-18) reste
//     tenue, et une modale surgissant sur vingt-deux pages serait une régression.
//   - PAS DE BOUTON SANS SESSION (fail-closed) : la session est vérifiée AVANT
//     de poser le bouton. Un bouton qui ouvre un cartouche pour annoncer qu'il
//     faut se connecter est un bouton qui ment.
//
// Sécurité : rien de la page ne part chez le modèle. Ce module n'envoie ni
// contenu, ni identifiant, ni titre — seulement le quadrant et ce que la page
// lui passe explicitement en `etat` (comptes et intitulés bornés, revalidés
// côté serveur par validerEtatQuadrant). Le jeton de session ne sert qu'à
// l'en-tête Authorization de /api/leo, jamais au contenu.

(function () {
  'use strict';

  // Miroir CLIENT de la liste serveur (api/_lib/leo.js). Il ne fait pas
  // autorité — le serveur re-valide et répond 400 — mais il évite d'ouvrir une
  // voix qui échouerait au premier mot sur une déclaration mal orthographiée.
  var QUADRANTS = ['riven', 'bcp', 'adramelech', 'imladrik', 'finubar', 'ultima'];
  var REPLI = 'ultima';

  function quadrantDeLaPage() {
    var declare = document.body && document.body.getAttribute('data-leo-quadrant');
    if (typeof declare !== 'string') { return REPLI; }
    declare = declare.trim();
    return QUADRANTS.indexOf(declare) !== -1 ? declare : REPLI;
  }

  // La session, par le même chemin que le reste du site (js/config.js +
  // supabase-js déjà chargés par la page). Toute anomalie → null, en silence :
  // pas de bouton, pas de message d'erreur sur une page qui n'a rien demandé.
  async function sessionCourante() {
    var cfg = window.ULTIMA_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      return null;
    }
    try {
      var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      var reponse = await client.auth.getSession();
      var session = reponse && reponse.data && reponse.data.session;
      return (session && session.access_token) ? session : null;
    } catch (e) {
      return null;
    }
  }

  // Ouvre le cartouche à la demande. `forcer` court-circuite le verrou
  // « une fois par session » de l'accueil : c'est un bouton, il répond à
  // chaque clic.
  function ouvrir(options) {
    if (!window.UltimaLeo || typeof window.UltimaLeo.accueillirQuadrant !== 'function') { return; }
    window.UltimaLeo.accueillirQuadrant({
      quadrant: options.quadrant,
      blason: options.blason || 'boussole',
      salutation: options.salutation || 'Je t’écoute.',
      sections: Array.isArray(options.sections) ? options.sections : [],
      sansPropositions: true,   // il a cliqué pour parler, pas pour lire « rien d'urgent »
      forcer: true,
      voix: { quadrant: options.quadrant, jeton: options.jeton, etat: options.etat || null }
    });
  }

  function poserBouton(options) {
    if (document.getElementById('leo-appel')) { return; }
    var bouton = document.createElement('button');
    bouton.id = 'leo-appel';
    bouton.type = 'button';
    bouton.className = 'leo-appel';
    bouton.textContent = 'Parler à Léo';
    bouton.setAttribute('aria-label', 'Parler à Léo');
    bouton.addEventListener('click', function () { ouvrir(options); });
    document.body.appendChild(bouton);
    return bouton;
  }

  // Monte la voix sur la page. `etat` et `sections` sont facultatifs : une page
  // qui a des yeux (FINUBAR) les passe, les autres n'ont rien à donner.
  async function monter(config) {
    config = config || {};
    if (!document.body) { return null; }
    // ⛔ DEUX conditions, et la seconde a été oubliée jusqu'au 06/09 au soir.
    // `ouvrir()` vérifie bien `UltimaLeo` — mais au CLIC, trop tard : le bouton
    // était déjà posé. Si `js/leo-accueil.js` n'a pas chargé (ordre des
    // balises, erreur réseau, page qui l'oublie), Paul voyait un bouton qui ne
    // faisait RIEN, en silence. C'est le défaut que ce module interdit dans son
    // propre bandeau — « un bouton qui ment » — entré par l'autre porte.
    // Les deux gardes doivent donc tomber AVANT le bouton, pas après.
    if (!window.UltimaLeo || typeof window.UltimaLeo.accueillirQuadrant !== 'function') { return null; }
    var session = await sessionCourante();
    if (!session) { return null; }        // fail-closed : pas de session, pas de bouton
    return poserBouton({
      quadrant: config.quadrant || quadrantDeLaPage(),
      jeton: session.access_token,
      etat: config.etat || null,
      sections: config.sections || [],
      blason: config.blason,
      salutation: config.salutation
    });
  }

  window.UltimaLeoPartout = { monter: monter, quadrantDeLaPage: quadrantDeLaPage };

  // Auto-montage, sauf si la page s'en charge elle-même (elle a des yeux à
  // calculer d'abord : <body data-leo-manuel="1">).
  if (typeof document !== 'undefined') {
    var demarrer = function () {
      if (document.body && document.body.getAttribute('data-leo-manuel') === '1') { return; }
      monter();
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', demarrer, { once: true });
    } else {
      demarrer();
    }
  }
})();
