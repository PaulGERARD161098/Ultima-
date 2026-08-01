// Ultima Lv3 — LE NOYAU DE LA BOUSSOLE (moteur de rendu unique).
// ---------------------------------------------------------------------------
// Un seul moteur pour TOUS les étages : la racine, les supra-divisions, les
// quadrants. Il rend n'importe quel nœud du registre (js/registre-lv3.mjs) en
// suivant le patron IMLADRIK — la forme voulue par Paul (CADRAGE-LV3.md §2) :
//
//   ① le retour vers le parent        (posé par la page, statique)
//   ② le bandeau : sceau + titre      (posé par la page, statique)
//   ③ le plateau : caps en rose + aiguilles           ← rendus ici
//   ④ le cœur : médaillon + sa LÉGENDE GRAVÉE         ← rendu ici
//   ⑤ le cartouche : la parole de Léo                 ← rendue ici
//
// Une page-nœud n'est donc qu'une coque : `<body data-noeud="…">` + le plateau
// vide + le cartouche. Aucune page ne porte de SVG de cap ni de logique — c'est
// ce qui empêche la forme de dériver d'un écran à l'autre (risque RC-Lv3-3).
//
// SÉCURITÉ — innerHTML n'insère QUE du statique défini dans le registre et le
// catalogue de gravures (aucune donnée utilisateur, jamais de PII). Le cockpit
// ne rapatrie que des COMPTES entiers, derrière Bearer, et seulement sur les
// nœuds qui le déclarent ; sans session ou en cas d'échec, on retombe
// silencieusement sur le texte figé (fail-closed).

import { NOEUDS, capsDe } from './registre-lv3.mjs';
import { BLASONS, COEURS } from './blasons.mjs';

// ============================ GÉOMÉTRIE ============================
const RAYON_CAP = 40;      // distance des caps au centre (% du plateau)
const RAYON_AIGUILLE = 30; // longueur des aiguilles (unités viewBox 0..100)
const DEPART = -90;        // premier cap plein Nord, puis sens horaire
const NS = 'http://www.w3.org/2000/svg';

export function positions(n) {
  // Répartition régulière : n caps → n directions à parts égales.
  const pas = 360 / n;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const rad = (DEPART + i * pas) * Math.PI / 180;
    out.push({ cos: Math.cos(rad), sin: Math.sin(rad) });
  }
  return out;
}

// Macro-quadrants (registre : `groupes`) — chaque groupe reçoit son propre
// secteur du cercle (2 groupes = 2 hémicycles, RIMA à l'ouest / NAGA au
// levant) ; ses caps s'y répartissent à parts égales, en retrait des
// frontières (PAD) pour laisser le nord aux noms gravés. Sur un secteur
// gauche, l'ordre s'inverse pour que le premier cap reste le plus haut —
// la lecture va toujours du haut vers le bas.
const PAD_SECTEUR = 15; // degrés de retrait à chaque frontière de secteur

export function positionsGroupees(comptes) {
  const secteur = 360 / comptes.length;
  const pts = [];
  const ancres = [];
  comptes.forEach((k, i) => {
    const debut = 90 + i * secteur;           // premier secteur : plein ouest
    const centre = (debut + secteur / 2) * Math.PI / 180;
    const arc = secteur - 2 * PAD_SECTEUR;
    const angles = [];
    for (let j = 0; j < k; j += 1) {
      angles.push(debut + PAD_SECTEUR + arc * (j + 1) / (k + 1));
    }
    if (Math.cos(centre) < 0) angles.reverse(); // côté gauche : du haut vers le bas
    for (const a of angles) {
      const rad = a * Math.PI / 180;
      pts.push({ cos: Math.cos(rad), sin: Math.sin(rad) });
    }
    // Le nom gravé du groupe, au-dessus de son hémicycle (en % du plateau).
    ancres.push({ x: 50 + 26 * Math.cos(centre), y: 6 });
  });
  return { pts, ancres };
}

// ======================= COCKPIT (fonctions pures) =======================
// Reprises telles quelles de la boussole LV2 (js/boussole.js), recalées sur les
// identifiants Lv3. N'accueillent QUE des entiers + du texte statique → sûres
// en innerHTML. Testées dans tests/unit-registre-lv3.mjs.

function n(v) { return Math.max(0, parseInt(v, 10) || 0); }
function s(compte) { return compte > 1 ? 's' : ''; }

// Le « vrai en cours » d'un cap. null s'il n'y a pas d'agrégat pour ce cap.
export function ligneVivante(id, data) {
  if (!data) return null;
  // TAO — cap agrégé (RESHIRAM + ZEKROM réunis) : le réel ET l'idéal en une ligne.
  if (id === 'tao' && (data.reshiram || data.zekrom)) {
    const rt = data.reshiram || {};
    const zt = data.zekrom || {};
    const tt = n(rt.talents);
    const it = n(zt.ideaux);
    return tt + ' talent' + s(tt) + ' réel' + s(tt) + ' · ' + n(rt.a_etayer) + ' à étayer'
      + ' — ' + it + ' ' + (it > 1 ? 'idéaux' : 'idéal') + ' · ' + n(zt.a_orienter) + ' à orienter.';
  }
  if (id === 'reshiram' && data.reshiram) {
    const r = data.reshiram;
    const t = n(r.talents);
    return t + ' talent' + s(t) + ' réel' + s(t) + ' · ' + n(r.a_etayer) + ' à étayer.';
  }
  if (id === 'zekrom' && data.zekrom) {
    const z = data.zekrom;
    const i = n(z.ideaux);
    const a = n(z.acquis);
    return i + ' ' + (i > 1 ? 'idéaux' : 'idéal') + ' · ' + n(z.a_orienter)
      + ' à orienter · ' + a + ' talent' + s(a) + ' relié' + s(a)
      + ' (acquis), ' + n(z.a_construire) + ' à construire.';
  }
  return null;
}

// Le signal « à traiter » d'un cap : un badge discret qui ne s'allume QUE quand
// un compte actionnable est > 0 (la donnée dort, s'allume quand elle compte).
export function signalDe(id, data) {
  if (!data) return null;
  const relances = n((data.riven || {}).relances_dues);
  const aEtayer = n((data.reshiram || {}).a_etayer);
  const aOrienter = n((data.zekrom || {}).a_orienter);

  function morceaux(avecRelances, avecTao) {
    const parts = [];
    if (avecRelances && relances > 0) parts.push(relances + ' relance' + s(relances) + ' due' + s(relances));
    if (avecTao && aEtayer > 0) parts.push(aEtayer + ' talent' + s(aEtayer) + ' à étayer');
    if (avecTao && aOrienter > 0) parts.push(aOrienter + ' ' + (aOrienter > 1 ? 'idéaux' : 'idéal') + ' à orienter');
    return parts.length ? parts.join(' · ') : null;
  }

  // La supra-division cumule ce que ses quadrants ont à traiter.
  if (id === 'ultima-perso') return morceaux(Boolean(data.riven), Boolean(data.reshiram || data.zekrom));
  if (id === 'riven') return morceaux(Boolean(data.riven), false);
  if (id === 'tao') return morceaux(false, Boolean(data.reshiram || data.zekrom));
  if (id === 'reshiram') return aEtayer > 0 ? aEtayer + ' talent' + s(aEtayer) + ' à étayer' : null;
  if (id === 'zekrom') {
    return aOrienter > 0 ? aOrienter + ' ' + (aOrienter > 1 ? 'idéaux' : 'idéal') + ' à orienter' : null;
  }
  return null;
}

// ============================== RENDU ==============================
export function rendre(idNoeud, options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  if (!doc) return null;
  const noeud = (options.noeuds || NOEUDS)[idNoeud];
  if (!noeud) return null;

  const plateau = doc.getElementById('boussole-plateau');
  const parole = doc.getElementById('boussole-parole');
  if (!plateau || !parole) return null;

  let caps = capsDe(idNoeud, options.noeuds || NOEUDS);
  if (!caps.length) return null;

  // Macro-quadrants : les caps se rangent par groupe (ordre du registre),
  // chaque groupe sur son hémicycle, son nom gravé au-dessus.
  const groupes = Array.isArray(noeud.groupes) && noeud.groupes.length >= 2 ? noeud.groupes : null;
  let ancres = null;
  let pts;
  if (groupes) {
    const parId = {};
    caps.forEach((c) => { parId[c.id] = c; });
    caps = [];
    groupes.forEach((g) => g.caps.forEach((cid) => { if (parId[cid]) caps.push(parId[cid]); }));
    const geo = positionsGroupees(groupes.map((g) => g.caps.length));
    pts = geo.pts;
    ancres = geo.ancres;
  } else {
    pts = positions(caps.length);
  }

  const paroleDefaut = parole.innerHTML; // conservé pour le retour au repos
  const cockpit = { data: null, actif: null };

  // ---- ③ Aiguilles (SVG en fond, sous les caps) + passerelles ----
  const svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'boussole-aiguilles');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const aiguilles = caps.map((cap, i) => {
    const x = 50 + RAYON_AIGUILLE * pts[i].cos;
    const y = 50 + RAYON_AIGUILLE * pts[i].sin;
    const g = doc.createElementNS(NS, 'g');
    g.setAttribute('class', 'aiguille');
    const trait = doc.createElementNS(NS, 'line');
    trait.setAttribute('x1', '50'); trait.setAttribute('y1', '50');
    trait.setAttribute('x2', String(x)); trait.setAttribute('y2', String(y));
    trait.setAttribute('class', 'aiguille-trait');
    const pointe = doc.createElementNS(NS, 'circle');
    pointe.setAttribute('cx', String(x)); pointe.setAttribute('cy', String(y));
    pointe.setAttribute('r', '2.1');
    pointe.setAttribute('class', 'aiguille-pointe');
    g.appendChild(trait); g.appendChild(pointe);
    svg.appendChild(g);
    return g;
  });

  // Passerelle : lien pointillé entre deux caps jumeaux, DERRIÈRE les aiguilles.
  // Tracée en ARC le long du cercle des caps, jamais en corde : une corde entre
  // deux caps opposés passerait derrière le médaillon et disparaîtrait (constat
  // de la preview Lv3, CADRAGE-LV3 §4.4). `lienLibelle` grave son nom sur l'arc.
  caps.forEach((cap, i) => {
    if (!cap.lien) return;
    const j = caps.findIndex((c) => c.id === cap.lien);
    if (j < 0) return;
    const x1 = 50 + RAYON_CAP * pts[i].cos, y1 = 50 + RAYON_CAP * pts[i].sin;
    const x2 = 50 + RAYON_CAP * pts[j].cos, y2 = 50 + RAYON_CAP * pts[j].sin;
    // Sens de l'arc : on suit le cercle dans l'ordre des caps (i → j horaire si
    // j suit i), toujours par le petit côté ; l'arc reste hors du médaillon.
    const horaire = ((j - i) + caps.length) % caps.length <= caps.length / 2;
    const pont = doc.createElementNS(NS, 'path');
    pont.setAttribute('d', `M ${x1} ${y1} A ${RAYON_CAP} ${RAYON_CAP} 0 0 ${horaire ? 1 : 0} ${x2} ${y2}`);
    pont.setAttribute('class', 'passerelle');
    pont.setAttribute('id', `passerelle-${cap.id}-${cap.lien}`);
    svg.insertBefore(pont, svg.firstChild);

    if (cap.lienLibelle) {
      const texte = doc.createElementNS(NS, 'text');
      texte.setAttribute('class', 'passerelle-libelle');
      const chemin = doc.createElementNS(NS, 'textPath');
      chemin.setAttribute('href', `#passerelle-${cap.id}-${cap.lien}`);
      chemin.setAttribute('startOffset', '50%');
      chemin.setAttribute('text-anchor', 'middle');
      chemin.textContent = cap.lienLibelle;
      texte.appendChild(chemin);
      svg.insertBefore(texte, svg.firstChild.nextSibling);
    }
  });
  plateau.appendChild(svg);

  // ---- ④ Le cœur + sa légende gravée ----
  const coeur = doc.createElement('div');
  coeur.className = 'boussole-coeur';
  coeur.setAttribute('aria-hidden', 'true');
  coeur.innerHTML = COEURS[noeud.coeur] || '';
  plateau.appendChild(coeur);

  if (noeud.legende) {
    const legende = doc.createElement('p');
    legende.className = noeud.legendeClasse
      ? 'boussole-legende ' + noeud.legendeClasse
      : 'boussole-legende';
    legende.setAttribute('aria-hidden', 'true');
    legende.textContent = noeud.legende;
    plateau.appendChild(legende);
  }

  // ---- ⑤ La parole de Léo (cartouche sous la boussole) ----
  function afficherResume(cap) {
    cockpit.actif = cap;
    parole.classList.add('is-actif');
    const vivante = noeud.cockpit ? ligneVivante(cap.id, cockpit.data) : null;
    const signal = noeud.cockpit ? signalDe(cap.id, cockpit.data) : null;
    parole.innerHTML =
      '<p class="parole-nom">' + cap.nom + '</p>'
      + '<p class="parole-etat">' + cap.etat + '</p>'
      + (signal ? '<p class="parole-signal">À traiter — ' + signal + '</p>' : '')
      + (vivante ? '<p class="parole-cockpit">En cours — ' + vivante + '</p>' : '')
      + '<p class="parole-texte">' + cap.resume + '</p>'
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

  // ---- ③ Les caps, disposés autour de la rose ----
  // Avec des macro-quadrants, le nom gravé de chaque groupe précède ses caps
  // dans le DOM : la lecture (écran comme lecteur d'écran) va « RIMA puis ses
  // portes, NAGA puis les siennes ».
  const debuts = [];
  if (groupes) {
    let idx = 0;
    groupes.forEach((g) => { debuts.push(idx); idx += g.caps.length; });
  }

  caps.forEach((cap, i) => {
    if (groupes && debuts.indexOf(i) !== -1) {
      const gi = debuts.indexOf(i);
      const domaine = doc.createElement('p');
      domaine.className = 'boussole-domaine';
      domaine.style.left = ancres[gi].x + '%';
      domaine.style.top = ancres[gi].y + '%';
      domaine.innerHTML = '<span class="domaine-nom">' + groupes[gi].nom + '</span>'
        + '<span class="domaine-sous-titre">' + groupes[gi].sousTitre + '</span>';
      plateau.appendChild(domaine);
    }

    const ouvrable = Boolean(cap.cible);
    const el = doc.createElement(ouvrable ? 'a' : 'div');
    el.className = 'cap' + (ouvrable ? '' : ' cap--avenir');
    el.dataset.id = cap.id;
    el.style.left = (50 + RAYON_CAP * pts[i].cos) + '%';
    el.style.top = (50 + RAYON_CAP * pts[i].sin) + '%';
    el.setAttribute('aria-label', cap.nom + ' — ' + cap.etat);

    if (ouvrable) {
      el.setAttribute('href', cap.cible);
      if (cap.externe) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    } else {
      el.setAttribute('role', 'button');
      el.setAttribute('aria-disabled', 'true');
      el.tabIndex = 0;
    }

    el.innerHTML =
      '<span class="cap-blason">' + (BLASONS[cap.blason] || '') + '</span>'
      + '<span class="cap-corps">'
      + '<span class="cap-nom">' + cap.nom + '</span>'
      + '<span class="cap-etat">' + cap.etat + '</span>'
      + '</span>';

    // Illumination + résumé au survol ET au focus clavier (clavier = souris).
    function activer() {
      el.classList.add('is-actif');
      aiguilles[i].classList.add('is-actif');
      afficherResume(cap);
    }
    function desactiver() {
      el.classList.remove('is-actif');
      aiguilles[i].classList.remove('is-actif');
      reinitResume();
    }
    el.addEventListener('mouseenter', activer);
    el.addEventListener('mouseleave', desactiver);
    el.addEventListener('focus', activer);
    el.addEventListener('blur', desactiver);

    // Cap « à venir » : Entrée/Espace ne navigue pas, montre juste le résumé.
    if (!ouvrable) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activer(); }
      });
    }

    plateau.appendChild(el);
  });

  plateau.classList.add('is-pret');

  // ---- Cockpit : les agrégats n'arrivent qu'après connexion, jamais dans le HTML ----
  if (noeud.cockpit && typeof window !== 'undefined') {
    async function chargerCockpit(token) {
      if (!token) {
        cockpit.data = null;
        if (cockpit.actif) afficherResume(cockpit.actif);
        return;
      }
      let rep;
      try {
        rep = await fetch('/api/cockpit', {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        });
      } catch (e) { return; } // silencieux : dégradation au texte figé
      if (!rep.ok) return;
      let corps = null;
      try { corps = await rep.json(); } catch (e) { corps = null; }
      if (corps && corps.ok === true) {
        cockpit.data = corps.data || null;
        if (cockpit.actif) afficherResume(cockpit.actif);
      }
    }
    // Hook attendu par js/boussole-auth.js (livraison de la session).
    window.UltimaBoussole = {
      poserSession(token) { chargerCockpit(token); },
      ligneVivante,
      signalDe,
    };
  }

  // Introspection pour les harnais : uniquement des noms de caps (statiques).
  if (noeud.expose && typeof window !== 'undefined') {
    window[noeud.expose] = { noms: caps.map((c) => c.nom) };
  }

  return { caps, aiguilles };
}

// ---- Démarrage : la coque déclare son nœud via `<body data-noeud="…">` ----
function demarrer() {
  const id = document.body && document.body.dataset ? document.body.dataset.noeud : null;
  if (id) rendre(id);
}

if (typeof document !== 'undefined') {
  if (typeof window !== 'undefined') {
    window.UltimaBoussoleNoyau = { rendre, positions, positionsGroupees, ligneVivante, signalDe };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
}
