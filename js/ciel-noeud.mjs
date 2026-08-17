// Ultima Lv4 — LE RENDU D'UN NŒUD EN CIEL (moteur de navigation stellaire).
// ---------------------------------------------------------------------------
// L'équivalent de `js/boussole-noyau.mjs`, côté ciel. Un seul module pour tous
// les étages : il rend n'importe quel nœud du registre en constellation, avec
// le dépliage au survol, le zoom à l'entrée, et Léo qui parle à chaque étage.
//
// CE MODULE NE REMPLACE PAS LA BOUSSOLE PARTOUT. Les coques passent au ciel une
// par une (CADRAGE-LV4-CIEL-DEPLIE.md §13.3) ; `boussole-noyau.mjs` sert encore
// toutes celles qui n'ont pas migré, et VRANESH bâtit sur `css/boussole.css`.
// Rien de ce qui est ici ne touche à l'un ou à l'autre.
//
// ---------------------------------------------------------------------------
// CE QUE LA BOUSSOLE PORTAIT ET QU'IL FALLAIT PORTER AVEC (§13.1). L'inventaire
// a été fait sur le code AVANT d'écrire une ligne — la méthode qui, en
// supprimant l'arbre, avait sauvé sept assertions qu'on allait perdre :
//
//   ① LE COCKPIT — comptes vivants derrière Bearer, et surtout FAIL-CLOSED.
//      Réutilisé tel quel depuis `cockpit-parole.mjs`, silences compris.
//   ② LES BLASONS — la gravure de chaque cap. Voir §« les gravures » plus bas.
//   ③ LE CŒUR + SA LÉGENDE — l'identité gravée du nœud.
//   ④ LA PASSERELLE et son nom gravé — le lien entre caps jumeaux.
//   ⑤ LE CAP « À VENIR » — nommé, atteignable au clavier, et INERTE : il
//      montre son résumé et ne navigue nulle part.
//   ⑥ LE REPLI <noscript> — il vit dans la coque, pas ici ; ce module ne doit
//      simplement jamais l'effacer. Le ciel est en JavaScript pur : sans lui,
//      cette liste EST la navigation. Voir la note en bas de fichier.
//
// SÉCURITÉ — mêmes règles que le noyau de la boussole, sans exception : rien
// n'entre en innerHTML qui ne vienne du registre ou du catalogue de gravures
// (statique, aucune donnée utilisateur, jamais de PII) ; le cockpit ne rapatrie
// que des COMPTES entiers et retombe en silence sur le texte figé.

import { NOEUDS } from './registre-lv3.mjs';
import { BLASONS, COEURS } from './blasons.mjs';
import { versCiel } from './adaptateur-lv4.mjs';
import { ligneVivante, signalDe, chargerCockpit } from './cockpit-parole.mjs';

// Le temps que dure l'approche avant que la page suivante s'ouvre. Paul l'a
// dicté : « ça fait une sorte de zoom et ça affiche les projets » — on entre en
// s'approchant, pas en changeant d'écran d'un coup. 220 ms : assez pour que le
// mouvement se lise, trop peu pour qu'on l'attende. Sous
// `prefers-reduced-motion`, il n'y a pas d'approche du tout et on part tout de
// suite : une préférence système n'est pas une option d'affichage.
const APPROCHE_MS = 220;

// Délai avant qu'un survol déplie. Il ne s'agit pas de confort : sans lui, un
// curseur qui TRAVERSE le ciel déplie tout ce qu'il frôle.
const SURVOL_MS = 140;

export function rendre(idNoeud, options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  if (!doc) { return null; }
  const registre = options.noeuds || NOEUDS;
  const noeud = registre[idNoeud];
  if (!noeud) { return null; }

  const scene = doc.getElementById('ciel-noeud-scene');
  // LE PLATEAU EST LE PARENT DE LA SCÈNE, ET CE N'EST PAS UN DÉTAIL DE
  // MISE EN PAGE. `UltimaCiel.rendre` VIDE son conteneur (`textContent = ''`)
  // à chaque dessin. Tout ce qui doit survivre au rendu — le filigrane, la
  // légende gravée, et surtout le repli <noscript> de la coque — vit donc
  // À CÔTÉ de la scène, jamais dedans. Trouvé en relisant le moteur avant de
  // lancer la page : posé dans la scène, le repli sans JavaScript aurait été
  // effacé par le premier rendu, et personne ne l'aurait vu disparaître
  // puisqu'on ne le regarde qu'avec JavaScript désactivé.
  const plateau = doc.getElementById('ciel-noeud-plateau');
  const parole = doc.getElementById('boussole-parole');
  if (!scene || !plateau || !parole) { return null; }
  if (!window.UltimaCiel) { return null; } // le moteur n'est pas chargé : on ne casse pas la page

  const paroleDefaut = parole.innerHTML; // le repos, restauré quand on s'éloigne
  const cockpit = { data: null, actif: null };
  let deplie = null;
  let vue = null;
  let idsDuNiveau = [];
  let enRoute = false; // une entrée est engagée : on n'en engage pas une seconde
  // L'étoile à re-focaliser après un re-dessin. DÉPLIER RECONSTRUIT LA SCÈNE :
  // l'élément qui avait le focus est détruit, et le focus retombe sur `body`.
  // Mesuré le 2026-08-13 — au clavier, atteindre un cap qui a du contenu le
  // faisait disparaître sous les doigts. Un menu où la tabulation s'annule
  // elle-même n'est pas navigable au clavier.
  let focusARendre = null;

  const moinsDAnimation = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- ③ LE CŒUR ET SA LÉGENDE ------------------------------------------
  // Sur la boussole, le médaillon siège au centre de la rose et les caps
  // l'orbitent. Dans le ciel, le centre est là où la caméra regarde : y poser
  // un médaillon opaque, c'est le poser sur les étoiles. Il est donc peint
  // DERRIÈRE elles, en filigrane — le ciel reste celui d'ULTIMA, et on lit son
  // nom gravé sans qu'il dispute la place à ce qu'on vient chercher.
  // Décoratif : `aria-hidden`. Ce que le nœud EST se lit dans le titre de la
  // page, qui, lui, est du texte.
  if (noeud.coeur && COEURS[noeud.coeur]) {
    const filigrane = doc.createElement('div');
    filigrane.className = 'ciel-filigrane';
    filigrane.setAttribute('aria-hidden', 'true');
    filigrane.innerHTML = COEURS[noeud.coeur];
    plateau.appendChild(filigrane);
  }
  if (noeud.legende) {
    const legende = doc.createElement('p');
    legende.className = noeud.legendeClasse
      ? 'ciel-legende ' + noeud.legendeClasse
      : 'ciel-legende';
    legende.setAttribute('aria-hidden', 'true');
    legende.textContent = noeud.legende;
    plateau.appendChild(legende);
  }

  // ---- ⑤ LA PAROLE DE LÉO ------------------------------------------------
  // MÊME BALISAGE QUE LA BOUSSOLE, à la classe près. Ce n'est pas de la
  // paresse : c'est ce qui rend le portage AUDITABLE. Les assertions qui
  // tenaient sur `.parole-nom`, `.parole-signal`, `.parole-action` disent
  // encore quelque chose après la migration, au lieu d'être réécrites en même
  // temps que le code qu'elles surveillent — auquel cas elles ne
  // surveilleraient plus rien.
  function afficherResume(cap) {
    cockpit.actif = cap;
    parole.classList.add('is-actif');
    const vivante = noeud.cockpit ? ligneVivante(cap.id, cockpit.data) : null;
    const signal = noeud.cockpit ? signalDe(cap.id, cockpit.data) : null;
    // ② LE BLASON — porté, et DÉPLACÉ. Sur la boussole il était peint sur le
    // cap lui-même. Le poser sur une étoile reviendrait à coller un disque de
    // parchemin clair au milieu d'un ciel de nuit : la gravure y perdrait sa
    // lisibilité et le ciel son registre. Il vient donc dans le cartouche, au
    // moment exact où la boussole montrait l'identité du cap — au survol. Le
    // vocabulaire visuel est conservé, sa place change.
    // `BLASONS` est un catalogue STATIQUE (js/blasons.mjs) : aucune donnée
    // utilisateur n'y transite, l'insertion reste sûre.
    const blason = cap.blason && BLASONS[cap.blason] ? BLASONS[cap.blason] : '';
    parole.innerHTML =
      (blason ? '<span class="parole-blason">' + blason + '</span>' : '')
      + '<p class="parole-nom">' + cap.nom + '</p>'
      + '<p class="parole-etat">' + (cap.etat || '') + '</p>'
      + (signal ? '<p class="parole-signal">À traiter — ' + signal + '</p>' : '')
      + (vivante ? '<p class="parole-cockpit">En cours — ' + vivante + '</p>' : '')
      + '<p class="parole-texte">' + (cap.resume || '') + '</p>'
      + '<p class="parole-action">'
      + (cap.cible
        ? (cap.externe ? 'Clique pour ouvrir (nouvel onglet) ↗' : 'Clique pour entrer ↝')
        : 'Cap en préparation')
      + '</p>';
  }
  function reinitResume() {
    cockpit.actif = null;
    parole.classList.remove('is-actif');
    parole.innerHTML = paroleDefaut;
  }

  // ---- Le dessin d'un étage ----------------------------------------------
  // LV5 / P2 — LA PLACE QUE PREND LE MOBILIER SE MESURE, ELLE NE SE DÉCLARE PAS.
  // Une constante ne peut pas la connaître : elle dépend de la police, de la
  // longueur du titre, de la largeur de l'écran et de la zone sûre de
  // l'encoche. C'est la même leçon que la demi-largeur des noms d'étoiles, qui
  // avait coûté 93,7 unités de débord le 2026-08-13 pour avoir été supposée.
  // On mesure donc les boîtes réelles, et on rend au moteur ce qu'il doit
  // s'interdire de peindre.
  function margesDuMobilier() {
    const bas = [];
    const haut = [];
    const hauteurDe = (el) => {
      if (!el) { return 0; }
      const r = el.getBoundingClientRect();
      return r.height > 0 ? r.height : 0;
    };
    // En haut : le bandeau et le retour cohabitent ; c'est le plus bas des deux
    // qui commande, pas leur somme — ils sont côte à côte, pas empilés.
    const entete = doc.querySelector('body.ciel-noeud .console-entete');
    const retour = doc.querySelector('body.ciel-noeud .console-retour');
    for (const el of [entete, retour]) {
      if (!el) { continue; }
      const r = el.getBoundingClientRect();
      haut.push(r.bottom);
    }
    // En bas : le cartouche de Léo et la légende gravée.
    const legende = doc.querySelector('.ciel-noeud-plateau > .ciel-legende');
    for (const el of [parole, legende]) {
      if (!el) { continue; }
      const r = el.getBoundingClientRect();
      if (r.height > 0) { bas.push(window.innerHeight - r.top); }
    }
    // Une provision de 8 px : une étoile qui affleure le bord d'un cartouche
    // n'est pas recouverte, mais elle est illisible.
    const marge = 8;
    return {
      haut: (haut.length ? Math.max(...haut) : 0) + marge,
      bas: (bas.length ? Math.max(...bas) : 0) + marge,
      gauche: 0,
      droite: 0
    };
  }

  function dessiner() {
    const donnees = versCiel(idNoeud, registre, { deplie });
    if (!donnees) { return; }
    idsDuNiveau = donnees.idsDuNiveau;

    vue = window.UltimaCiel.rendre(scene, donnees, {
      // Le type ne s'annonce pas : sur un menu, tous les objets sont des caps,
      // et le dire à chaque étiquette serait du bruit. L'état, lui, est porté
      // par `statut` et reste dans l'étiquette accessible.
      libellesType: { cap: '' },
      libellesStatut: {},
      // Les deux capacités de l'étape ②, activées ici et nulle part ailleurs.
      cadrerSurLesEtoiles: true,
      tousLesNoms: true,
      // LV5 — LA COUCHE DE FOND (P1). Validée par Paul le 2026-08-16 sur la
      // maquette : « fond avec les étoiles, génial ». Elle remplace les 130
      // grains SVG fixes par un champ dont la densité suit la surface (1 266 à
      // 5 200 grains), avec parallaxe, voiles et filaments.
      // Elle n'est allumée QUE sur les coques de navigation. RIVEN ne l'active
      // pas : son ciel montre un réseau de personnes, pas un menu, et son
      // harnais doit continuer de passer sans une retouche.
      fond: true,
      // LES GÉMEAUX (dicté par Paul le 2026-08-17 : « pour TAO, mets plutôt
      // Zekrom et Reshiram en opposé, visuellement, en mode constellation Castor
      // et Pollux »).
      // La condition n'est PAS « deux caps » mais « deux caps JUMEAUX » : ce que
      // l'opposition raconte, c'est qu'ils sont deux pôles d'une même chose, et
      // c'est le lien du registre qui le dit. ULTIMA a aussi deux caps (GRIMA et
      // NAGA) mais aucun lien entre eux — les opposer y affirmerait une symétrie
      // que le registre ne déclare pas.
      opposition: donnees.noeuds.length === 2
        && (donnees.relations || []).some((r) =>
          donnees.noeuds.some((n) => n.id === r.source_id)
          && donnees.noeuds.some((n) => n.id === r.target_id)),
      // LV5 / P2 — la zone où le ciel n'a pas le droit de peindre. On passe LA
      // FONCTION, pas son résultat : le moteur la rappelle à chaque
      // redimensionnement, et la mesure ne peut donc pas se périmer. Passer une
      // valeur revenait à figer une constante qui n'avait eu raison qu'une fois
      // — pris en défaut par le harnais.
      margesUtiles: margesDuMobilier,
      surClicNoeud: entrer
    });
    if (!vue) { return; }
    vue.derive(false); // un menu ne dérive pas : une cible qui bouge est une cible qu'on rate
    habiller();
    // LE SIGNAL « C'EST PRÊT » (LV5 / P3). `boussole-noyau.mjs` posait
    // `is-pret` sur son plateau, et TOUS les harnais de navigation l'attendent
    // — onze points d'attente comptés. Le ciel doit donc le poser aussi, sur le
    // plateau, au même moment logique : quand les caps sont rendus et habillés.
    // C'est un contrat entre le produit et ses instruments : le changer aurait
    // obligé à réécrire onze attentes pour un gain nul, et un harnais qui
    // n'attend pas le bon signal mesure une page à moitié peinte.
    plateau.classList.add('is-pret');
    // On rend le focus à l'étoile qui l'avait avant le re-dessin.
    if (focusARendre) {
      const revenue = scene.querySelector(
        'g.ciel-etoile[data-noeud-id="' + focusARendre + '"]');
      focusARendre = null;
      if (revenue) { revenue.focus(); }
    }
  }

  // ---- ⑤ LE CAP « À VENIR », et le survol qui déplie ----------------------
  function habiller() {
    let minuteur = null;
    scene.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
      const id = g.getAttribute('data-noeud-id');
      const cap = registre[id] || {};

      // ⑤ Un cap sans cible est ANNONCÉ comme tel au lecteur d'écran. Le moteur
      // pose `role="button"` sur toutes les étoiles ; c'est ici qu'on dit
      // lesquelles n'emmènent nulle part. Sans cela, une promesse est faite à
      // qui n'y voit pas, et elle n'est pas tenue.
      if (!cap.cible) { g.setAttribute('aria-disabled', 'true'); }

      const montrer = () => afficherResume(Object.assign({ id }, cap));
      g.addEventListener('mouseenter', () => {
        montrer();
        if (idsDuNiveau.indexOf(id) === -1) { return; }
        if (!(cap.enfants || []).length) { return; }
        clearTimeout(minuteur);
        minuteur = setTimeout(() => deplier(id), SURVOL_MS);
      });
      g.addEventListener('mouseleave', () => { clearTimeout(minuteur); reinitResume(); });
      // Clavier = souris. Un cap qu'on atteint à la tabulation doit dire la
      // même chose qu'un cap qu'on survole.
      g.addEventListener('focus', () => {
        montrer();
        if (idsDuNiveau.indexOf(id) !== -1 && (cap.enfants || []).length) {
          focusARendre = id; // le re-dessin détruirait le focus : on le lui rend
          deplier(id);
        }
      });
      g.addEventListener('blur', reinitResume);
    });
  }

  // Déplier : montrer ce qu'un cap contient SANS y entrer. Le re-dessin fait
  // naître de nouvelles étoiles ; la garde qui empêche l'emballement vit dans
  // l'adaptateur (`idsDuNiveau`), pas ici — un garde-fou que chaque appelant
  // doit penser à installer n'en est pas un.
  function deplier(id) {
    if (deplie === id || enRoute) { return; }
    deplie = id;
    dessiner();
  }

  // ---- L'entrée : on s'approche, puis la page s'ouvre ---------------------
  function entrer(id) {
    const cap = registre[id] || {};
    // ⑤ LE CAP « À VENIR » EST INERTE. Il montre ce qu'il est et ne navigue
    // pas — au doigt comme au clavier, où Entrée et Espace passent par ici.
    if (!cap.cible) { afficherResume(Object.assign({ id }, cap)); return; }

    if (cap.externe) {
      window.open(cap.cible, '_blank', 'noopener,noreferrer');
      return;
    }
    if (enRoute) { return; }
    enRoute = true;
    if (moinsDAnimation || !vue) { window.location.href = cap.cible; return; }
    vue.zoomerVers(id);
    window.setTimeout(() => { window.location.href = cap.cible; }, APPROCHE_MS);
  }

  dessiner();
  if (!vue) { return null; }

  // ---- ① LE COCKPIT — fail-closed, et c'est la règle qui compte -----------
  if (noeud.cockpit && typeof window !== 'undefined') {
    window.UltimaCielNoeud = {
      poserSession(token) {
        chargerCockpit(token, (data) => {
          cockpit.data = data;
          if (cockpit.actif) { afficherResume(cockpit.actif); }
        });
      },
      ligneVivante,
      signalDe
    };
    // Le pont de session (js/boussole-auth.js) appelle `UltimaBoussole` : on
    // répond au même nom pour ne pas avoir à le modifier. Une coque au ciel et
    // une coque à la boussole ne coexistent jamais dans la même page — c'est
    // `data-noeud` + le script chargé qui décident, et il n'y en a qu'un.
    window.UltimaBoussole = window.UltimaCielNoeud;
  }

  // Introspection pour les harnais : uniquement des noms de caps (statiques).
  // Elle doit survivre au changement de moteur — sinon ce sont les harnais
  // eux-mêmes qui s'aveuglent au moment précis où l'on a besoin qu'ils voient.
  if (noeud.expose && typeof window !== 'undefined') {
    const caps = versCiel(idNoeud, registre);
    window[noeud.expose] = { noms: caps.noeuds.map((c) => c.nom) };
  }

  return { vue, nbEtoiles: vue.nbEtoiles };
}

// ---- Démarrage : la coque déclare son nœud via `<body data-noeud="…">` ----
// LE REPLI <noscript> DE LA COQUE N'EST JAMAIS EFFACÉ : le moteur du ciel
// remplit le conteneur qu'on lui donne, et la coque garde sa liste de liens en
// dehors. Un ciel entièrement peint en JavaScript rend cette liste plus
// nécessaire qu'elle ne l'était du temps de la boussole, pas moins.
function demarrer() {
  const id = document.body && document.body.dataset ? document.body.dataset.noeud : null;
  if (id) { rendre(id); }
}

if (typeof document !== 'undefined') {
  if (typeof window !== 'undefined') {
    window.UltimaCielNoeudNoyau = { rendre };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
}
