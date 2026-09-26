// Navigation assistée par Léo — une couche déterministe au-dessus du registre.
// Léo peut suggérer une route, mais elle ne l'invente jamais : toutes les
// destinations de cette surface viennent de NOEUDS.
import { NOEUDS, chemin } from './registre-lv3.mjs';

const CLE_RECENTS = 'ultima-leo-navigation-recents';
const MAX_RECENTS = 5;

function texte(value) { return typeof value === 'string' ? value.trim() : ''; }

export function destinations(noeuds = NOEUDS) {
  return Object.entries(noeuds)
    .filter(([, n]) => n && texte(n.cible))
    .map(([id, n]) => ({
      id,
      nom: texte(n.nom) || id,
      sens: texte(n.etat || n.surligne || n.resume),
      resume: texte(n.resume),
      cible: n.cible,
      externe: Boolean(n.externe),
      chemin: chemin(id, noeuds).map((partie) => (noeuds[partie] || {}).nom || partie).join(' › '),
    }));
}

export function filtrerDestinations(requete, liste = destinations()) {
  const q = texte(requete).toLocaleLowerCase('fr');
  if (!q) { return liste.slice(0, 8); }
  return liste.filter((d) => [d.nom, d.sens, d.resume, d.chemin]
    .join(' ').toLocaleLowerCase('fr').includes(q)).slice(0, 8);
}

export function recommandationDepuisFinubar(agregat, liste = destinations()) {
  const action = agregat && agregat.cartouche && agregat.cartouche.action;
  if (!action || !texte(action.projet) || !texte(action.faire)) { return null; }
  const destination = liste.find((d) => d.nom.toLocaleLowerCase('fr')
    === texte(action.projet).toLocaleLowerCase('fr')) || null;
  return {
    projet: texte(action.projet),
    faire: texte(action.faire),
    le: texte(agregat.le),
    destination,
  };
}

function lireRecents(storage) {
  try {
    const lus = JSON.parse(storage.getItem(CLE_RECENTS) || '[]');
    return Array.isArray(lus) ? lus.filter((r) => r && texte(r.cible)).slice(0, MAX_RECENTS) : [];
  } catch (_) { return []; }
}

function memoriserPage(storage, liste) {
  const ici = liste.find((d) => {
    try { return new URL(d.cible, location.href).pathname === location.pathname; }
    catch (_) { return false; }
  });
  if (!ici) { return lireRecents(storage); }
  const recents = lireRecents(storage).filter((r) => r.id !== ici.id);
  recents.unshift({ id: ici.id, nom: ici.nom, sens: ici.sens, cible: ici.cible, le: Date.now() });
  try { storage.setItem(CLE_RECENTS, JSON.stringify(recents.slice(0, MAX_RECENTS))); } catch (_) { /* privé */ }
  return recents.slice(0, MAX_RECENTS);
}

function element(doc, tag, classe, contenu) {
  const el = doc.createElement(tag);
  if (classe) { el.className = classe; }
  if (contenu !== undefined) { el.textContent = contenu; }
  return el;
}

function aller(destination) {
  if (!destination) { return; }
  // Un projet Finubar n'a pas de page : il vit au ciel, sous son parent. Le
  // ciel sait y aller (`allerAuProjet`, le même chemin que les signaux du
  // bandeau) ; ce module ne recalcule rien.
  if (destination.projet) {
    const ciel = window.UltimaCielNoeud;
    if (ciel && typeof ciel.allerAuProjet === 'function') { ciel.allerAuProjet(destination.projet); }
    return;
  }
  if (destination.externe) { window.open(destination.cible, '_blank', 'noopener,noreferrer'); }
  else { window.location.href = destination.cible; }
}

export function monterNavigationLeo({ bouton, ouvrirLeo, doc = document } = {}) {
  if (!bouton || !doc.body || doc.getElementById('leo-dock')) { return null; }
  const liste = destinations();
  const recents = memoriserPage(window.localStorage, liste);
  const page = liste.find((d) => {
    try { return new URL(d.cible, location.href).pathname === location.pathname; }
    catch (_) { return false; }
  });

  const dock = element(doc, 'aside', 'leo-dock');
  dock.id = 'leo-dock';
  dock.setAttribute('aria-label', 'Léo, copilote de navigation');
  const identite = element(doc, 'span', 'leo-dock-identite', 'LÉO');
  const contexte = element(doc, 'span', 'leo-dock-contexte', page
    ? `${page.nom} · ${page.resume || page.sens || 'je vois cette page'}`
    : 'Je vois Ultima · où allons-nous ?');
  bouton.className = 'leo-dock-parler';
  bouton.textContent = 'Parler';
  bouton.setAttribute('aria-label', 'Parler à Léo dans le contexte actuel');
  let actionRapide = recents[1] || null;
  const reprendre = element(doc, 'button', 'leo-dock-action', 'Reprendre');
  reprendre.type = 'button';
  reprendre.disabled = !recents[1];
  reprendre.title = recents[1] ? `Reprendre ${recents[1].nom}` : 'Aucun autre contexte récent';
  reprendre.addEventListener('click', () => {
    // Un bouton ne répond jamais par le silence : si le projet recommandé
    // n'est pas au ciel de cette page, on ouvre la recherche au lieu de rien.
    if (actionRapide && actionRapide.projet) {
      const ciel = window.UltimaCielNoeud;
      const bouge = ciel && typeof ciel.allerAuProjet === 'function' && ciel.allerAuProjet(actionRapide.projet);
      if (!bouge) { ouvrirPanneau(); }
      return;
    }
    aller(actionRapide);
  });
  const chercher = element(doc, 'button', 'leo-dock-action leo-dock-action--primaire', 'Aller à…');
  chercher.type = 'button';
  // Le nom reste lu quand, au téléphone, le bouton se replie en loupe.
  chercher.setAttribute('aria-label', 'Aller à… — chercher une destination');

  dock.append(identite, contexte, reprendre, chercher, bouton);
  doc.body.appendChild(dock);
  // LE DOCK DIT OÙ IL EST (26/09). Il se pose au bas de l'écran, là où vivent
  // déjà le cartouche de parole et le bandeau Finubar : sans cette annonce, la
  // parole se posait EXACTEMENT sur lui (capture de Paul) et le ciel peignait
  // des étoiles dessous. La hauteur est MESURÉE (elle change avec la largeur),
  // posée en variable pour la feuille, et l'événement dit au ciel de recadrer.
  // Ni l'un ni l'autre ne bouge au survol : le dock ne change pas de taille.
  doc.body.classList.add('a-leo-dock');
  function annoncer() {
    const h = Math.round(dock.getBoundingClientRect().height);
    doc.documentElement.style.setProperty('--leo-dock-hauteur', h + 'px');
    doc.dispatchEvent(new CustomEvent('ultima:mobilier'));
  }
  annoncer();
  if (typeof ResizeObserver === 'function') { new ResizeObserver(annoncer).observe(dock); }

  const voile = element(doc, 'div', 'leo-nav-voile');
  voile.hidden = true;
  const panneau = element(doc, 'section', 'leo-nav-panneau');
  panneau.setAttribute('role', 'dialog');
  panneau.setAttribute('aria-modal', 'true');
  panneau.setAttribute('aria-labelledby', 'leo-nav-titre');
  const haut = element(doc, 'header', 'leo-nav-entete');
  const titre = element(doc, 'h2', '', 'Où allons-nous ?'); titre.id = 'leo-nav-titre';
  const fermer = element(doc, 'button', 'leo-nav-fermer', 'Fermer'); fermer.type = 'button';
  haut.append(titre, fermer);
  const saisie = element(doc, 'input', 'leo-nav-recherche');
  saisie.type = 'search'; saisie.placeholder = 'Projet, constellation ou intention…';
  saisie.setAttribute('aria-label', 'Chercher dans Ultima');
  const onglets = element(doc, 'div', 'leo-nav-onglets');
  const tabRoutes = element(doc, 'button', 'is-actif', 'Destinations');
  const tabProjets = element(doc, 'button', '', 'Mes projets');
  const tabCiel = element(doc, 'button', '', 'Vue du ciel');
  [tabRoutes, tabProjets, tabCiel].forEach((b) => { b.type = 'button'; onglets.appendChild(b); });
  const resultats = element(doc, 'div', 'leo-nav-resultats');
  panneau.append(haut, saisie, onglets, resultats); voile.appendChild(panneau); doc.body.appendChild(voile);

  let vue = 'routes';
  function rendre() {
    resultats.textContent = '';
    [tabRoutes, tabProjets, tabCiel].forEach((b) => b.classList.remove('is-actif'));
    if (vue === 'ciel') {
      tabCiel.classList.add('is-actif');
      resultats.appendChild(element(doc, 'p', 'leo-nav-explication', 'La géographie reste fixe ; seule la lumière change.'));
      ['structure', 'appels', 'en-cours'].forEach((mode) => {
        const b = element(doc, 'button', 'leo-nav-mode', mode === 'en-cours' ? 'En cours' : mode[0].toUpperCase() + mode.slice(1));
        b.type = 'button'; b.addEventListener('click', () => { doc.body.dataset.cielMode = mode; fermerPanneau(); });
        resultats.appendChild(b);
      });
      return;
    }
    const projets = vue === 'projets';
    (projets ? tabProjets : tabRoutes).classList.add('is-actif');
    const trouves = filtrerDestinations(saisie.value, liste)
      .filter((d) => !projets || !['racine', 'ultima-perso', 'alpha', 'grima', 'naga'].includes(d.id));
    if (!trouves.length) { resultats.appendChild(element(doc, 'p', 'leo-nav-vide', 'Aucune route connue. Demande autrement à Léo.')); }
    trouves.forEach((d) => {
      const b = element(doc, 'button', 'leo-nav-resultat'); b.type = 'button';
      b.append(element(doc, 'strong', '', d.nom), element(doc, 'span', '', d.sens || d.chemin));
      b.addEventListener('click', () => aller(d)); resultats.appendChild(b);
    });
  }
  function ouvrirPanneau() { voile.hidden = false; rendre(); saisie.focus(); }
  // LE FOCUS RESTE DANS LA BOÎTE (critique impeccable, 26/09). Le panneau se
  // déclare `aria-modal` ; sans piège, la 12ᵉ tabulation en sortait vers les
  // étoiles cachées derrière le voile (mesuré). Tab et Maj+Tab bouclent sur
  // ce qui est focalisable DANS le panneau, relu à chaque frappe : la liste
  // des résultats change à chaque lettre tapée.
  panneau.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') { return; }
    const focalisables = [...panneau.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')]
      .filter((el) => !el.disabled && el.getClientRects().length);
    if (!focalisables.length) { return; }
    const premier = focalisables[0], dernier = focalisables[focalisables.length - 1];
    if (e.shiftKey && (doc.activeElement === premier || !panneau.contains(doc.activeElement))) {
      e.preventDefault(); dernier.focus();
    } else if (!e.shiftKey && doc.activeElement === dernier) {
      e.preventDefault(); premier.focus();
    }
  });
  function fermerPanneau() { voile.hidden = true; chercher.focus(); }
  chercher.addEventListener('click', ouvrirPanneau);
  fermer.addEventListener('click', fermerPanneau);
  voile.addEventListener('click', (e) => { if (e.target === voile) { fermerPanneau(); } });
  saisie.addEventListener('input', rendre);
  tabRoutes.addEventListener('click', () => { vue = 'routes'; rendre(); });
  tabProjets.addEventListener('click', () => { vue = 'projets'; rendre(); });
  tabCiel.addEventListener('click', () => { vue = 'ciel'; rendre(); });
  doc.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ouvrirPanneau(); }
    else if (e.key === 'Escape' && !voile.hidden) { e.preventDefault(); fermerPanneau(); }
  });
  // Finubar reste la seule source de priorité. Quand son agrégat arrive, Léo
  // transforme le résumé en invitation située ; aucun second calcul ici.
  function appliquerFinubar(agregat) {
    const recommandation = recommandationDepuisFinubar(agregat, liste);
    if (!recommandation) { return; }
    // Espace INSÉCABLE avant « : » (typographie française) : sans elle, la
    // ligne pouvait se couper entre « propose » et ses deux-points.
    contexte.textContent = `Je te propose\u00a0: ${recommandation.projet} · ${recommandation.faire}`;
    // Le texte est souvent tronqué (points de suspension) : il reste entier au
    // survol, et entier pour le lecteur d'écran.
    contexte.title = contexte.textContent;
    dock.classList.add('leo-dock--proactif');
    // UNE VOIX, UNE FOIS. Le bandeau Finubar porte la même recommandation dans
    // sa colonne « Léo — commençons par ça » : la dire deux fois à l'écran,
    // c'est demander à Paul laquelle lire. Le dock la porte avec son bouton
    // « Commencer » ; la classe permet au bandeau de retirer son double.
    doc.body.classList.add('a-leo-propose');
    doc.dispatchEvent(new CustomEvent('ultima:mobilier'));
    // LA RECOMMANDATION SE LANCE (critique impeccable, 26/09). Elle vise le
    // plus souvent un projet Finubar — greffé au ciel, absent du registre
    // statique : `destination` y est nulle, et Léo proposait une action
    // qu'aucun bouton ne lançait (« Reprendre » restait grisé). Quand le ciel
    // de la page sait aller au projet, le bouton devient « Y aller ».
    const ciel = window.UltimaCielNoeud;
    const auCiel = !recommandation.destination && ciel && typeof ciel.allerAuProjet === 'function';
    if (recommandation.destination || auCiel) {
      actionRapide = recommandation.destination || { projet: recommandation.projet };
      reprendre.disabled = false;
      reprendre.textContent = recommandation.destination ? 'Commencer' : 'Y aller';
      reprendre.classList.add('leo-dock-action--propose');
      dock.classList.add('leo-dock--propose');
      reprendre.title = recommandation.le
        ? `Priorité issue de Finubar, collectée le ${recommandation.le}`
        : 'Commencer la priorité proposée par Léo';
    }
  }
  doc.addEventListener('ultima:finubar', (e) => appliquerFinubar(e.detail));
  // Le dock et l'agrégat sont tous deux asynchrones : ce repli évite de perdre
  // l'événement si Finubar a fini de charger une fraction de seconde avant Léo.
  appliquerFinubar(window.UltimaFinubarAgregat);
  if (typeof ouvrirLeo === 'function') { bouton.addEventListener('click', ouvrirLeo); }
  return { dock, ouvrir: ouvrirPanneau };
}
