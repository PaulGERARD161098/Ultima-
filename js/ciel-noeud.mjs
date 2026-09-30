// Ultima Lv4 — LE RENDU D'UN NŒUD EN CIEL (moteur de navigation stellaire).
// ---------------------------------------------------------------------------
// L'équivalent de `js/boussole-noyau.mjs`, côté ciel. Un seul module pour tous
// les étages : il rend n'importe quel nœud du registre en constellation, avec
// l'isolement au clic, le zoom à l'entrée, et Léo qui parle à chaque étage.
//
// ⛔ LE DÉPLIAGE AU SURVOL A ÉTÉ RETIRÉ (Paul, 2026-09-25, arbitrage A1 de
// CADRAGE-2026-09-25-carte-celeste.md). Il redessinait la scène sous le
// curseur : NAGA partait de 119 px, GRIMA de 965 px, et le clic tombait dans
// le vide — 4 gestes sur 5, tap compris. Mesuré, pas supposé, par
// `tests/smoke-clic-exact.mjs`, vu rouge sur l'ancien code (15 verdicts sur
// 21). Le survol ne fait plus que parler (le cartouche de Léo) ; on plonge au
// CLIC — c'est déjà ce que faisait l'écran isolé depuis le 2026-08-31.
//
// ---------------------------------------------------------------------------
// L'ISOLEMENT (Paul, 2026-08-28) — LE CLIC NE CHANGE PLUS DE PAGE, IL PLONGE.
// « Quand je clique sur une constellation, ça m'affiche uniquement cette
// constellation et plus les autres : dans le plan 3D, on zoome et on fait
// disparaître ce qui n'a pas été sélectionné. »
//
// Ce que ça déplace, et il faut le dire en toutes lettres : jusqu'ici, cliquer
// un cap qui contient quelque chose OUVRAIT SA PAGE (grima.html, naga.html…).
// Désormais un nœud qui a du contenu s'ISOLE SUR PLACE — les frères s'éteignent,
// la caméra s'approche, et la scène est re-dessinée sur sa seule descendance,
// DEUX ÉTAGES d'un coup. Seules les FEUILLES (les pages de travail : VRANESH,
// ABAQUE, RIVEN…) ouvrent encore une page. Les huit coques ne disparaissent
// pas pour autant : elles restent des points d'entrée valides — on y arrive par
// le repli <noscript>, par un lien direct, ou par leur adresse.
//
// TROIS SORTIES, parce qu'un écran dont on ne sait pas ressortir est un piège :
// le FIL D'ARIANE (chaque étape remonte à son étage), la touche ÉCHAP, et un
// clic dans le vide. Et l'adresse suit (`ultima.html#naga`) : la flèche
// « précédent » du navigateur remonte donc d'un cran au lieu de quitter la
// page — c'est elle qu'on aurait perdue en isolant sans rien écrire dans
// l'historique.
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
// SÉCURITÉ — tout TEXTE qui entre dans le cartouche passe par `echapper()`.
// ⛔ La règle d'avant disait « rien n'entre en innerHTML qui ne vienne du
// registre (statique) » — elle est devenue FAUSSE le 02/09, le jour où la greffe
// Finubar a fait entrer dans le registre des noms et des jalons écrits dans les
// FINUBAR.md de huit dépôts. Mesuré le 26/09 (audit S1, `smoke-parole-
// echappement`) : un nom de projet en balisage devenait un lien dans le
// cartouche. Seul le catalogue de gravures (`BLASONS`, statique) entre brut.
// Le cockpit ne rapatrie que des COMPTES entiers, échappés eux aussi.

import { NOEUDS, chemin } from './registre-lv3.mjs';
import { BLASONS, COEURS, NEBULEUSES } from './blasons.mjs';
import { versCiel, cheminVers, descendDe } from './adaptateur-lv4.mjs';
import { ligneVivante, signalDe, chargerCockpit, chargerFinubar } from './cockpit-parole.mjs';

// Le texte devient du texte, quelle que soit sa source. Le registre n'est plus
// entièrement statique (greffe Finubar) : on n'essaie pas de deviner quel champ
// est sûr, on les échappe tous.
function echapper(valeur) {
  return String(valeur == null ? '' : valeur).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
import { greffer, signaux, libelleDegre } from './adaptateur-finubar.mjs';
import { poser as poserFinubarBandeau } from './finubar-bandeau.mjs';

// Le temps que dure l'approche avant que la page suivante s'ouvre. Paul l'a
// dicté : « ça fait une sorte de zoom et ça affiche les projets » — on entre en
// s'approchant, pas en changeant d'écran d'un coup. 220 ms : assez pour que le
// mouvement se lise, trop peu pour qu'on l'attende. Sous
// `prefers-reduced-motion`, il n'y a pas d'approche du tout et on part tout de
// suite : une préférence système n'est pas une option d'affichage.
const APPROCHE_MS = 220;

export function rendre(idNoeud, options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  if (!doc) { return null; }
  // LE REGISTRE DE BASE, ET CELUI QU'ON PEINT. Ils diffèrent dès que Finubar
  // a répondu : les projets deviennent alors des astres de l'arbre. La greffe
  // repart TOUJOURS de la base — greffer sur le résultat de la greffe
  // précédente porterait les astres en double au deuxième chargement.
  const registreBase = options.noeuds || NOEUDS;
  let registre = registreBase;
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

  const paroleDefaut = parole.innerHTML; // le repos de l'étage entier
  // CE QUE LÉO DIT QUAND ON NE SURVOLE RIEN. À l'étage, c'est l'invite de la
  // coque ; sous isolement, c'est le foyer où l'on se trouve et la façon d'en
  // ressortir. Un écran isolé qui garderait l'invite de l'étage ne dirait ni
  // où l'on est, ni comment revenir.
  let paroleAuRepos = paroleDefaut;
  const cockpit = { data: null, actif: null };
  // FINUBAR — les signaux d'appel par nœud. Vide tant que la session n'a rien
  // livré : sans jeton, sur erreur réseau ou sur réponse illisible, le ciel est
  // STRICTEMENT celui d'hier. C'est la même règle fail-closed que le cockpit,
  // et elle vaut ici davantage : un halo qui apparaît sur une donnée à moitié
  // lue oriente vers le mauvais endroit, ce qui est pire que ne pas orienter.
  let appels = Object.create(null);
  // LE FOYER ISOLÉ — null tant qu'on regarde l'étage entier. C'est le SEUL
  // état de navigation de ce module : tout le reste (ce qui est peint, ce que
  // dit le fil, ce que Léo raconte au repos) s'en déduit.
  let isole = null;
  // Le geste venait-il du clavier ? On ne peut pas le déduire après coup — au
  // clic, Chromium donne AUSSI le focus à l'étoile. On le note donc au vol, en
  // phase de CAPTURE, avant que le moteur n'ait déclenché l'entrée.
  let viaClavier = false;
  let vue = null;
  let enRoute = false; // une entrée est engagée : on n'en engage pas une seconde
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

  // ---- LE FIL D'ARIANE — où l'on est, et par où l'on remonte -------------
  // IL VIT DANS LE PLATEAU, jamais dans la scène : le moteur vide son
  // conteneur à chaque dessin, et le fil doit survivre à l'isolement qui vient
  // justement de le remplir (même piège que le filigrane et le repli
  // <noscript>, §« LE PLATEAU EST LE PARENT DE LA SCÈNE »).
  const fil = doc.createElement('nav');
  fil.className = 'ciel-fil';
  fil.setAttribute('aria-label', 'Fil du ciel');
  fil.hidden = true;
  plateau.appendChild(fil);

  // SA PLACE SE MESURE. Le bandeau descend sous la ligne du retour à 560 px, sa
  // hauteur dépend de la police et de la longueur du titre : une constante ne
  // peut pas la connaître (même leçon que `margesDuMobilier`). On le pose donc
  // sous la boîte réelle du mobilier haut, et on recommence à chaque
  // redimensionnement.
  function placerFil() {
    let bas = 0;
    for (const sel of ['body.ciel-noeud .console-entete', 'body.ciel-noeud .console-retour']) {
      const el = doc.querySelector(sel);
      if (el) { bas = Math.max(bas, el.getBoundingClientRect().bottom); }
    }
    fil.style.top = Math.round(bas + 8) + 'px';
  }

  // LE BANDEAU SUIT CE QU'ON REGARDE (Paul, 30/09 : « bandeau par
  // constellation — cohérent avec l'affichage et les données »). Sous
  // isolement, le surligne et le titre deviennent ceux du foyer quand le
  // registre les porte ; au retour, ceux de la page. `textContent` : le texte
  // vient du registre, le bandeau n'a aucune raison d'accepter du balisage.
  const bandeauSurligne = doc.querySelector('body.ciel-noeud .console-entete .titre-surligne');
  const bandeauTitre = doc.querySelector('body.ciel-noeud .console-entete .titre-principal');
  const bandeauOrigine = {
    surligne: bandeauSurligne ? bandeauSurligne.textContent : '',
    titre: bandeauTitre ? bandeauTitre.textContent : '',
  };
  function majBandeau() {
    const foyer = isole && registre[isole];
    const avecSien = Boolean(foyer && foyer.titre);
    if (bandeauSurligne) { bandeauSurligne.textContent = avecSien ? (foyer.surligne || foyer.nom || '') : bandeauOrigine.surligne; }
    if (bandeauTitre) { bandeauTitre.textContent = avecSien ? foyer.titre : bandeauOrigine.titre; }
  }

  function majFil() {
    majBandeau();
    // SOUS ISOLEMENT, L'ACCUEIL SE REPLIE AU TÉLÉPHONE (27/09). « Bienvenue /
    // Sur quoi est-ce qu'on travaille aujourd'hui ? » est le propos de la
    // racine ; un cran plus bas, c'est le fil qui dit où l'on est, et l'accueil
    // prenait ~140 px au ciel — 205 px restaient sur RENOBOOST IA à 390 × 664.
    // La règle vit dans `css/ciel-noeud.css` (≤ 560 px) ; la classe se pose
    // AVANT `placerFil` et avant `dessiner()`, qui MESURENT l'en-tête.
    doc.body.classList.toggle('ciel-profond', !!isole);
    fil.textContent = '';
    if (!isole) {
      fil.hidden = true;
      placerFil();
      return;
    }
    // Le chemin se LIT dans le registre (`cheminVers`), il ne s'accumule pas
    // dans une pile : une pile et un registre finissent toujours par diverger,
    // et c'est la pile qui a tort. Repli sur deux étapes si le chemin est vide
    // — un fil incomplet vaut mieux qu'un fil absent le jour où le registre est
    // malade.
    const suite = cheminVers(isole, registre, idNoeud);
    const etapes = suite.length ? suite : [idNoeud, isole];
    etapes.forEach((id, rang) => {
      if (rang) {
        const sep = doc.createElement('span');
        sep.className = 'ciel-fil-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        fil.appendChild(sep);
      }
      const n = registre[id] || {};
      if (id === isole) {
        const ici = doc.createElement('span');
        ici.className = 'ciel-fil-ici';
        ici.setAttribute('aria-current', 'true');
        ici.textContent = n.nom || id;
        fil.appendChild(ici);
        return;
      }
      const bouton = doc.createElement('button');
      bouton.type = 'button';
      bouton.className = 'ciel-fil-etape';
      // LA RACINE S'APPELLE « Accueil » DANS LE FIL (critique impeccable, 26/09).
      // Au registre, la racine et la supra-division personnelle portent le même
      // nom, ULTIMA — le piège des deux « Ultima » du 07/08 : le fil pouvait lire
      // « ULTIMA › ULTIMA › NAGA ». Seul le fil change ; le registre, les
      // étoiles et le titre « Ultima Lv3 » gardent leurs noms.
      bouton.textContent = id === 'racine' ? 'Accueil' : (n.nom || id);
      // `textContent` et non `innerHTML` : le nom vient du registre, mais un
      // bouton de navigation n'a aucune raison d'accepter du balisage.
      bouton.addEventListener('click', () => {
        poserFoyer(id === idNoeud ? null : id);
      });
      fil.appendChild(bouton);
    });
    fil.hidden = false;
    placerFil();
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
      + '<p class="parole-nom">' + echapper(cap.nom) + '</p>'
      + '<p class="parole-etat">' + echapper(cap.etat) + '</p>'
      + (signal ? '<p class="parole-signal">À traiter — ' + echapper(signal) + '</p>' : '')
      + (vivante ? '<p class="parole-cockpit">En cours — ' + echapper(vivante) + '</p>' : '')
      + '<p class="parole-texte">' + echapper(cap.resume) + '</p>'
      + '<p class="parole-action">'
      // MÊME PARTAGE QU'`entrer()` ET QU'`aria-disabled` (30/09) : ce qui
      // CONTIENT s'entre, page ou pas. Une constellation sans page disait « Cap
      // en préparation » alors que le clic y plongeait — la parole contredisait
      // le geste. Les mêmes mots qu'IMLADRIK sur OMEGA : même action.
      + ((cap.enfants || []).length && !cap.externe
        ? 'Clique pour entrer ↝'
        : cap.cible
          ? (cap.externe ? 'Clique pour ouvrir (nouvel onglet) ↗' : 'Clique pour entrer ↝')
          : 'Cap en préparation')
      + '</p>';
  }
  function reinitResume() {
    cockpit.actif = null;
    // Sous isolement, le cartouche n'est jamais « au repos vide » : il porte le
    // foyer. Il garde donc son habillage plein, sinon il clignoterait d'un
    // registre à l'autre chaque fois que le curseur quitte une étoile.
    parole.classList.toggle('is-actif', !!isole);
    parole.innerHTML = paroleAuRepos;
  }

  // Ce que Léo dit quand on ne survole rien — recalculé à chaque changement de
  // foyer, jamais deviné à l'affichage.
  function majParoleAuRepos() {
    if (!isole) { paroleAuRepos = paroleDefaut; return; }
    const foyer = registre[isole] || {};
    // Même règle d'insertion que `afficherResume` : tout texte est ÉCHAPPÉ —
    // le registre porte des astres greffés depuis Finubar, il n'est plus
    // statique. Le fragment d'adresse, lui, vient du dehors : il ne sert que
    // d'identifiant à chercher dans le registre (`idDeLAdresse`, triple garde),
    // et même le repli `isole` passe par `echapper()`.
    paroleAuRepos =
      '<p class="parole-nom">' + echapper(foyer.nom || isole) + '</p>'
      + (foyer.etat ? '<p class="parole-etat">' + echapper(foyer.etat) + '</p>' : '')
      + '<p class="parole-texte">' + echapper(foyer.resume) + '</p>'
      + '<p class="parole-action">Échap — ou un clic dans le vide — pour remonter ↰</p>';
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
    // LE FIL COMPTE COMME LE RESTE DU MOBILIER. Il n'apparaît que sous
    // isolement, donc il est nul la plupart du temps — mais le jour où il est
    // là, une étoile posée dessous serait recouverte par lui, et ce serait
    // exactement le défaut mesuré le 2026-08-17 quand `margesUtiles` avait été
    // perdue. `hidden` rend sa boîte nulle : aucun cas particulier à écrire.
    for (const el of [entete, retour, fil]) {
      if (!el) { continue; }
      const r = el.getBoundingClientRect();
      if (r.height > 0) { haut.push(r.bottom); }
    }
    // En bas : le cartouche de Léo, la légende gravée — et le bandeau Finubar
    // (P3). Le bandeau est la pièce de mobilier la plus HAUTE de l'écran : l'y
    // oublier ferait exactement le défaut mesuré sur la maquette le 02/09 —
    // une étoile peinte sous lui, donc plus cliquable, et un clic qui atterrit
    // sur un bouton du bandeau. L'écran répond, et se trompe.
    const legende = doc.querySelector('.ciel-noeud-plateau > .ciel-legende');
    const bandeau = doc.getElementById('finubar-bandeau');
    // LE DOCK DE LÉO AUSSI (26/09). Il est arrivé après ce calcul, et le calcul
    // ne le connaissait pas : sur la capture de Paul, une étoile était peinte
    // sous le cartouche, lui-même posé sous le dock. Le socle se lit en entier.
    const dock = doc.getElementById('leo-dock');
    for (const el of [parole, legende, bandeau, dock]) {
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

  // LES NÉBULEUSES DE L'ÉCRAN. Deux cas, et seulement deux :
  //  - on a plongé DANS une constellation → sa nébuleuse enveloppe toutes les
  //    étoiles de l'écran (ce sont les siennes) ;
  //  - sinon, chaque étoile qui EST une constellation porte la sienne.
  // Un pigment absent du catalogue n'est pas peint (jamais de couleur libre).
  function nebuleusesDe(donnees) {
    const ids = (donnees.noeuds || []).map((n) => n.id);
    const foyer = isole && registre[isole];
    if (foyer && NEBULEUSES[foyer.nebuleuse]) {
      return [{ ids, teinte: NEBULEUSES[foyer.nebuleuse] }];
    }
    return ids.filter((id) => registre[id] && NEBULEUSES[registre[id].nebuleuse])
      .map((id) => ({ ids: [id], teinte: NEBULEUSES[registre[id].nebuleuse] }));
  }

  function dessiner() {
    const donnees = versCiel(idNoeud, registre, { isole });
    if (!donnees) { return; }

    vue = window.UltimaCiel.rendre(scene, donnees, {
      // Boucle B d'IFULVIN — les nébuleuses, déduites du registre (voir
      // `nebuleusesDe`). Liste vide ⇒ rien n'est peint : les écrans sans
      // constellation restent strictement ceux d'hier.
      nebuleuses: nebuleusesDe(donnees),
      // Le type ne s'annonce pas : sur un menu, tous les objets sont des caps,
      // et le dire à chaque étiquette serait du bruit. L'état, lui, est porté
      // par `statut` et reste dans l'étiquette accessible.
      libellesType: { cap: '' },
      libellesStatut: {},
      // Les deux capacités de l'étape ②, activées ici et nulle part ailleurs.
      cadrerSurLesEtoiles: true,
      tousLesNoms: true,
      // Lot 2a (26/09) — le nom d'un cap ne descend pas sous 11 px D'ÉCRAN.
      // Le plancher du moteur (7,5) est en unités du viewBox : mesuré, il
      // rendait 7,5 px à 360 et 390 px de large. `tests/smoke-noms-lisibles`.
      plancherNomPx: 11,
      // Lot 2b (26/09, A8 rendu par Paul : « V1 ») — LA FIGURE ET LE RANG.
      // Chaque constellation porte son arbre de n − 1 traits, à l'encre
      // parchemin, muet au lecteur d'écran ; et un cap qui CONTIENT est plus
      // vif qu'un cap qui ouvre une page (`rang()`, `js/adaptateur-lv4.mjs`).
      // La couronne ne bouge pas. RIVEN n'active ni l'un ni l'autre.
      // `tests/smoke-carte-celeste.mjs`.
      // EXCEPTION NOMMÉE (30/09) : un écran dont le registre dit
      // `asterisme: false` n'a pas de traits de figure — ses étoiles sont
      // indépendantes (les DRAGONS). Les passerelles du registre, elles,
      // restent tracées : RESHIRAM ⇄ ZEKROM.
      asterisme: (registre[isole || idNoeud] || {}).asterisme !== false,
      eclatParPoids: true,
      // 27/09 — AU DOIGT, UNE ÉTOILE SE TOUCHE À 44 PX, comme tout le reste du
      // socle. Au pointeur précis (souris), le plancher d'hier suffit et le
      // survol ne doit pas s'allumer à distance. `smoke-cibles-telephone`.
      cibleDoigtPx: (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 44 : 0,
      // LV5 — LA COUCHE DE FOND (P1). Validée par Paul le 2026-08-16 sur la
      // maquette : « fond avec les étoiles, génial ». Elle remplace les 130
      // grains SVG fixes par un champ dont la densité suit la surface (1 266 à
      // 5 200 grains), avec parallaxe, voiles et filaments.
      // Elle n'est allumée QUE sur les coques de navigation. RIVEN ne l'active
      // pas : son ciel montre un réseau de personnes, pas un menu, et son
      // harnais doit continuer de passer sans une retouche.
      fond: true,
      // LA COURONNE — la disposition de TOUS les écrans de navigation, sans
      // exception : « il faut les mêmes standards partout » (Paul, 2026-08-17).
      // La veille, l'opposition était réservée aux caps JUMEAUX ; c'était une
      // exception, et un outil qui range ses écrans de plusieurs façons n'a pas
      // de forme. Les Gémeaux de TAO sont désormais le cas n = 2 du même
      // mécanisme.
      couronne: true,
      // LV5 / P2 — la zone où le ciel n'a pas le droit de peindre. LA FONCTION,
      // pas son résultat : le moteur la rappelle à chaque redimensionnement, et
      // la mesure ne peut donc pas se périmer.
      // CETTE LIGNE A ÉTÉ PERDUE UNE FOIS, le 2026-08-17, par un remplacement
      // de bloc fait AUX INDICES plutôt qu'à l'ancre : elle vivait entre les deux
      // options que je remplaçais, et elle est partie avec. Conséquence mesurée :
      // marges nulles, et **une étoile recouverte par le bandeau sur les quatre
      // écrans à trois ou quatre caps**. J'ai d'abord accusé la couronne.
      // *Un remplacement s'ancre sur ce qui est écrit, jamais sur des positions.*
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
  }

  // ---- ⑤ LE CAP « À VENIR », et le survol qui PARLE (sans redessiner) ------
  function habiller() {
    scene.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
      const id = g.getAttribute('data-noeud-id');
      const cap = registre[id] || {};

      // ⑤ Un cap sans cible est ANNONCÉ comme tel au lecteur d'écran. Le moteur
      // pose `role="button"` sur toutes les étoiles ; c'est ici qu'on dit
      // lesquelles n'emmènent nulle part. Sans cela, une promesse est faite à
      // qui n'y voit pas, et elle n'est pas tenue.
      // ⛔ MÊME PARTAGE QU'`entrer()` : ce qui CONTIENT n'est jamais inerte, page
      // ou pas. Les constellations d'IMLADRIK (30/09) n'ont pas de page et
      // s'isolent au clic : les marquer `aria-disabled` les annonçait mortes au
      // lecteur d'écran et les grisait, alors que le clic y plongeait.
      if (!cap.cible && !(cap.enfants || []).length) { g.setAttribute('aria-disabled', 'true'); }

      // ⛔ L'APPEL EST POSÉ PAR UN ATTRIBUT, JAMAIS PAR UNE GÉOMÉTRIE À NOUS.
      // Le moteur repositionne les cercles de chaque étoile à chaque image :
      // un halo dessiné ici serait au bon endroit pendant une image et faux
      // ensuite. `data-appel` + un `drop-shadow` en CSS n'ont pas de
      // coordonnées — ils suivent l'étoile sans rien savoir d'elle. Et
      // `js/ciel.js` n'est pas touché (jurisprudence LV4).
      const appel = appels[id];
      if (appel) {
        g.setAttribute('data-appel', appel.degre);
        // Le compte est DIT, pas seulement peint : une information portée par
        // la seule couleur n'existe pas pour tout le monde.
        const dit = libelleDegre(appel.degre, appel.compte);
        g.setAttribute('aria-label', (g.getAttribute('aria-label') || '') + ', ' + dit);
        const titre = g.querySelector('title');
        if (titre) { titre.textContent = titre.textContent + ' — ' + dit; }
      } else {
        g.removeAttribute('data-appel');
      }

      // LE SURVOL PARLE, IL NE REDESSINE PAS. Tout ce qui redessinerait ici
      // ferait bouger l'étoile sous le curseur — et c'est le clic qui paierait.
      const montrer = () => afficherResume(Object.assign({ id }, cap));
      g.addEventListener('mouseenter', montrer);
      g.addEventListener('mouseleave', reinitResume);
      // Clavier = souris. Un cap qu'on atteint à la tabulation doit dire la
      // même chose qu'un cap qu'on survole — et, comme lui, ne rien redessiner :
      // le re-dessin détruirait l'élément focalisé (défaut du 2026-08-13).
      g.addEventListener('focus', montrer);
      g.addEventListener('blur', reinitResume);
    });
  }

  // ---- L'entrée : on plonge, ou bien la page s'ouvre ----------------------
  function entrer(id) {
    const cap = registre[id] || {};
    // LE PARTAGE, ET IL TIENT EN UNE LIGNE : ce qui CONTIENT s'isole, ce qui ne
    // contient rien s'ouvre. Aucun autre critère — ni la présence d'une cible
    // (GRIMA, NAGA, IMLADRIK en ont une et ne l'ouvrent plus), ni l'étage où
    // l'on se trouve. Un partage qui dépendrait de l'étage rendrait le même
    // clic imprévisible d'un écran à l'autre.
    if ((cap.enfants || []).length) { isoler(id); return; }
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


  // ---- L'ISOLEMENT : on éteint, on s'approche, on re-dessine --------------
  // TROIS TEMPS, ET ILS SONT SÉPARÉS À DESSEIN. Éteindre d'abord (le ciel se
  // vide autour de la cible), approcher ensuite (la caméra plonge), re-dessiner
  // enfin. Faire les trois d'un coup donnerait un CHANGEMENT D'ÉCRAN — ce que
  // Paul avait déjà, et qu'il ne veut plus : « on zoome et on fait disparaître
  // ce qui n'a pas été sélectionné » décrit un mouvement, pas une bascule.
  function isoler(id) {
    if (enRoute || isole === id) { return; }
    // `prefers-reduced-motion` garde la main, ici comme à l'entrée d'une page :
    // une préférence système n'est pas une option d'affichage.
    if (moinsDAnimation || !vue) { poserFoyer(id); return; }
    enRoute = true;
    eteindreSauf(id);
    vue.zoomerVers(id);
    window.setTimeout(() => { enRoute = false; poserFoyer(id); }, APPROCHE_MS);
  }

  // Ce qui n'a pas été choisi s'efface — et ce qui reste, c'est la cible ET ce
  // qu'elle contient. Depuis le retrait du dépliage (2026-09-25), ses enfants ne
  // sont jamais à l'écran avant la plongée : les garder dans la liste est juste
  // et sans effet, et ce sera encore juste le jour où un aperçu reviendrait.
  // La classe est posée sur la SCÈNE et non sur chaque étoile : le moteur
  // ré-écrit `opacity` à chaque image (attribut de présentation), et une règle
  // CSS — n'importe laquelle — l'emporte sur un attribut. C'est ce qui permet
  // d'éteindre un ciel qui continue de se peindre.
  function eteindreSauf(id) {
    const gardees = [id].concat((registre[id] || {}).enfants || []);
    scene.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
      g.classList.toggle('ciel-etoile--gardee',
        gardees.indexOf(g.getAttribute('data-noeud-id')) !== -1);
    });
    scene.classList.add('ciel-scene--isolant');
  }

  // LE SEUL POINT OÙ LE FOYER CHANGE. Tout ce qui dépend de lui est refait ici,
  // dans le même geste : la scène, le fil, la parole au repos, l'adresse. En
  // disperser une partie ailleurs, c'est se garantir qu'un jour l'un des quatre
  // sera oublié — le fil qui annonce un étage que le ciel ne montre plus.
  function poserFoyer(id, options) {
    isole = id || null;
    scene.classList.remove('ciel-scene--isolant');
    // LE MOBILIER SE REMPLIT AVANT QUE LE CIEL NE SE DESSINE, et l'ordre n'est
    // pas un détail : `dessiner()` MESURE la place que le mobilier occupe
    // (`margesUtiles`) pour s'interdire d'y peindre. Or le cartouche est
    // beaucoup plus haut sous isolement — il porte le foyer entier au lieu
    // d'une invite d'une ligne — et le fil n'existe qu'à ce moment-là.
    // Dessiner d'abord revenait à cadrer le ciel sur un mobilier qui n'était
    // pas encore là : mesuré sur capture, LES RAPPROCHEMENTS passait sous le
    // cartouche. Une place se mesure une fois qu'elle est prise.
    majParoleAuRepos();
    reinitResume();
    majFil();
    dessiner();
    if (!(options && options.sansHistorique)) { memoriser(); }
    apparaitre();
    // AU CLAVIER, LE FOCUS NE DOIT PAS TOMBER DANS LE VIDE. Le re-dessin
    // détruit l'étoile qu'on venait d'activer et le focus retombe sur `body` :
    // la tabulation repartirait du haut de la page à chaque plongée.
    if (viaClavier) {
      viaClavier = false;
      const premiere = scene.querySelector('g.ciel-etoile[data-noeud-id]');
      if (premiere && premiere.focus) { premiere.focus(); }
    }
  }

  // Remonter d'un cran : le parent DANS CET ÉCRAN, ou l'étage entier.
  //
  // REMONTER DÉFAIT, IL N'AJOUTE PAS. Premier jet mesuré : Échap EMPILAIT une
  // entrée d'historique, si bien qu'après être remonté de IMLADRIK à NAGA, la
  // flèche « précédent » du navigateur RE-PLONGEAIT dans IMLADRIK. Une sortie
  // qu'on annule en revenant en arrière n'est pas une sortie.
  // On ne recule que si l'entrée courante est CELLE QU'ON A EMPILÉE (son état
  // le dit) : sur un lien direct (`ultima.html#imladrik`), l'entrée d'avant
  // appartient à quelqu'un d'autre et reculer quitterait la page — on remplace
  // alors l'adresse sur place.
  function remonter() {
    if (!isole) { return false; }
    const etat = window.history ? window.history.state : null;
    if (etat && etat.cielFoyer === isole) { window.history.back(); return true; }
    const suite = cheminVers(isole, registre, idNoeud);
    const parent = suite.length >= 2 ? suite[suite.length - 2] : null;
    poserFoyer(parent && parent !== idNoeud ? parent : null, { sansHistorique: true });
    ecrireAdresse('replaceState');
    return true;
  }

  function apparaitre() {
    if (moinsDAnimation) { return; }
    scene.classList.remove('ciel-scene--neuve');
    // Une lecture forcée : sans elle, retirer puis remettre la classe dans le
    // même tour de boucle ne relance pas l'animation (le navigateur ne voit
    // aucun changement). Mesuré : la deuxième plongée n'apparaissait plus.
    void scene.getBoundingClientRect().width;
    scene.classList.add('ciel-scene--neuve');
    window.setTimeout(() => scene.classList.remove('ciel-scene--neuve'), 460);
  }

  // ---- L'ADRESSE SUIT LE FOYER -------------------------------------------
  // Sans cela, la flèche « précédent » du navigateur quitterait la page au lieu
  // de remonter d'un cran, et un ciel isolé ne se partagerait pas. Le fragment
  // n'est JAMAIS peint : il sert d'identifiant à chercher dans le registre, et
  // tout ce qui n'y est pas est ignoré (garde en trois temps, doublée par celle
  // de l'adaptateur — un garde-fou se vérifie du côté où il peut être
  // contourné, règle du 2026-08-21).
  function idDeLAdresse() {
    const brut = (window.location.hash || '').replace(/^#/, '');
    if (!brut || !Object.prototype.hasOwnProperty.call(registre, brut)) { return null; }
    if (!((registre[brut] || {}).enfants || []).length) { return null; }
    return descendDe(idNoeud, brut, registre) ? brut : null;
  }

  function ecrireAdresse(methode) {
    if (!window.history || !window.history[methode]) { return; }
    const url = isole
      ? '#' + isole
      : window.location.pathname + window.location.search;
    try {
      window.history[methode]({ cielFoyer: isole || null }, '', url);
    } catch (err) { /* `file://` refuse l'écriture : le ciel marche quand même */ }
  }
  function memoriser() { ecrireAdresse('pushState'); }

  window.addEventListener('popstate', () => {
    const vise = idDeLAdresse();
    if (vise === isole) { return; }
    poserFoyer(vise, { sansHistorique: true });
  });

  // ---- LES DEUX AUTRES SORTIES : Échap, et le vide ------------------------
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isole) { return; }
    e.preventDefault();
    remonter();
  });

  // Le clic dans le vide remonte — MAIS PAS UN GLISSEMENT. Le ciel se tourne au
  // doigt : sans cette garde, chaque rotation se terminerait par une remontée.
  // Le moteur a la sienne (`aGlisse`) et ne l'expose pas ; on mesure donc la
  // nôtre, sur le même seuil de 4 px, plutôt que de supposer qu'il nous couvre.
  let departPointeur = null;
  scene.addEventListener('pointerdown', (e) => {
    departPointeur = { x: e.clientX, y: e.clientY };
  });
  scene.addEventListener('click', (e) => {
    if (!isole) { return; }
    if (e.target && e.target.closest && e.target.closest('[data-noeud-id]')) { return; }
    if (departPointeur
      && Math.abs(e.clientX - departPointeur.x)
        + Math.abs(e.clientY - departPointeur.y) > 4) { return; }
    remonter();
  });

  // Le geste venait-il du clavier ? En CAPTURE, donc avant que le moteur (qui
  // écoute sur le SVG, plus bas) n'ait déclenché l'entrée. Le lire après coup
  // serait impossible : au clic aussi, l'étoile prend le focus.
  scene.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { viaClavier = true; }
  }, true);

  // Le fil se replace avec le mobilier : le bandeau change de hauteur d'une
  // largeur à l'autre (il descend sous la ligne du retour à 560 px).
  window.addEventListener('resize', placerFil);

  dessiner();
  if (!vue) { return null; }

  // UN LIEN DIRECT OUVRE DÉJÀ ISOLÉ (`ultima.html#naga`). Sans historique : on
  // ne double pas l'entrée courante, sinon la première flèche « précédent »
  // ne ferait rien de visible.
  const foyerInitial = idDeLAdresse();
  if (foyerInitial) { poserFoyer(foyerInitial, { sansHistorique: true }); }

  // ---- LE BANDEAU DE L'ACCUEIL (P3) --------------------------------------
  // Il n'existe que là où la coque en pose le conteneur — l'accueil aujourd'hui.
  // Un clic sur un signal ISOLE la branche du projet : un signal qu'on ne peut
  // pas suivre est une notification, et une notification ne fait rien avancer.
  // ---- LE SOCLE BOUGE : on remesure, et le ciel recadre (26/09) ----
  // Le bandeau change de hauteur APRÈS sa pose (le dock retire sa colonne
  // « Léo » en double), et le dock arrive quand la session est là. Les deux
  // sont des pièces du socle : quand l'une change de taille, la hauteur posée
  // en variable doit suivre, et le ciel doit rendre la place.
  // ⛔ LA PAROLE N'EST PAS OBSERVÉE, À DESSEIN. Son contenu change au survol ;
  // recadrer à ce moment déplacerait l'étoile sous le curseur — exactement le
  // clic raté du lot 1. Sa hauteur est FIXE (`css/leo.css`), sa place est donc
  // réservée une fois pour toutes.
  function mesurerBandeau() {
    const conteneur = doc.getElementById('finubar-bandeau');
    if (!conteneur) { return; }
    doc.documentElement.style.setProperty('--fb-hauteur',
      Math.round(conteneur.getBoundingClientRect().height) + 'px');
  }
  let recadrageDemande = false;
  function socleABouge() {
    if (recadrageDemande) { return; }
    recadrageDemande = true;
    window.requestAnimationFrame(() => {
      recadrageDemande = false;
      mesurerBandeau();
      if (vue && typeof vue.ajusterCadre === 'function') { vue.ajusterCadre(); }
    });
  }
  doc.addEventListener('ultima:mobilier', socleABouge);
  const bandeauObserve = doc.getElementById('finubar-bandeau');
  if (bandeauObserve && typeof ResizeObserver === 'function') {
    new ResizeObserver(socleABouge).observe(bandeauObserve);
  }

  // ALLER AU PROJET — le clic d'un signal du bandeau ET le « Y aller » du dock
  // de Léo passent par ici, et par ici seulement : deux chemins vers le même
  // geste finiraient par diverger. Rend `true` si le ciel a bougé.
  function allerAuProjet(projet) {
    const idAstre = Object.keys(registre).find((k) => registre[k].nom === projet);
    if (!idAstre) { return false; }
    // Le PARENT de l'astre : c'est lui qu'on isole, l'astre lui-même n'ayant
    // pas d'enfants. Le chemin se LIT dans le registre, il ne se devine pas.
    const suite = chemin(idAstre, registre);
    const parent = suite.length > 1 ? suite[suite.length - 2] : null;
    if (parent && parent !== idNoeud && descendDe(idNoeud, parent, registre)) { isoler(parent); return true; }
    return false;
  }

  function poserBandeau(agregat) {
    const conteneur = doc.getElementById('finubar-bandeau');
    if (!conteneur) { return; }
    const peint = poserFinubarBandeau(conteneur, agregat, allerAuProjet);
    // ⛔ LA PAROLE DE LÉO REMONTE AU-DESSUS DU BANDEAU. Les deux cartouches
    // sont `position: fixed` au bas de l'écran, au même `z-index` : le dernier
    // arrivé recouvre l'autre. Constaté en capture le 02/09 — le résumé du cap
    // survolé passait DERRIÈRE le bandeau, à moitié lisible. La hauteur est
    // MESURÉE et posée en variable : une constante serait fausse au premier
    // signal long, et fausse deux fois entre le téléphone et l'écran large.
    doc.body.classList.toggle('a-finubar', peint);
    mesurerBandeau();
    // Les marges utiles du ciel dépendent elles aussi de cette hauteur ; elles
    // sont relues au prochain dessin, qui suit immédiatement (voir l'appelant).
  }

  // ---- ① LE COCKPIT ET FINUBAR — fail-closed, et c'est la règle qui compte -
  // ⚠️ LE PONT DE SESSION N'EST PLUS RÉSERVÉ AUX NŒUDS `cockpit` (02/09/2026).
  // Il l'était parce que seuls eux avaient quelque chose à demander ; Finubar,
  // lui, concerne des écrans qui ne lisent pas le cockpit — ALPHA le premier,
  // c'est-à-dire précisément là où les projets s'accrochent. Le pont garde sa
  // forme exacte (`poserSession`, `ligneVivante`, `signalDe`) : `boussole-auth`
  // et les deux harnais qui s'en servent ne voient rien passer.
  if (typeof window !== 'undefined') {
    window.UltimaCielNoeud = {
      poserSession(token) {
        if (noeud.cockpit) {
          chargerCockpit(token, (data) => {
            cockpit.data = data;
            if (cockpit.actif) { afficherResume(cockpit.actif); }
          });
        }
        chargerFinubar(token, (agregat) => {
          if (!agregat) { return; }
          // La greffe repart de la BASE (voir plus haut), puis la scène est
          // repeinte : les astres neufs n'apparaissent pas tout seuls, et un
          // écran qui aurait la donnée sans la montrer serait le pire des deux.
          registre = greffer(registreBase, agregat);
          appels = signaux(registre, agregat, chemin);
          poserBandeau(agregat);
          // Une seule donnée, deux lectures : Finubar peint le portefeuille et
          // le dock de Léo en reprend l'action sans la recalculer.
          window.UltimaFinubarAgregat = agregat;
          doc.dispatchEvent(new CustomEvent('ultima:finubar', { detail: agregat }));
          if (typeof options.surFinubar === 'function') { options.surFinubar(agregat); }
          // UN LIEN VERS UN DÉPÔT S'OUVRE SUR LUI (lot 3, 27/09). L'adresse est
          // lue au chargement, AVANT cette greffe : `alpha.html#renoboost-ia`
          // trouvait alors un RENOBOOST IA sans enfants, la garde répondait
          // « rien à isoler », et le lien partagé s'ouvrait sur ALPHA entier.
          // On la relit donc ICI, une fois les astres greffés — seulement si
          // aucun foyer n'est posé : un choix déjà fait ne se fait pas voler.
          // Sans historique, comme le lien direct : l'entrée existe déjà.
          // `idDeLAdresse` garde sa triple garde, relue sur le registre greffé.
          // `tests/smoke-depots-partout.mjs`.
          const vise = isole ? null : idDeLAdresse();
          if (vise) {
            poserFoyer(vise, { sansHistorique: true });
            return;
          }
          dessiner();
        });
      },
      ligneVivante,
      signalDe,
      // Pour le dock de Léo (`js/leo-navigation.mjs`) : suivre la recommandation
      // de Finubar quand elle vise un projet greffé, absent du registre statique.
      allerAuProjet
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
