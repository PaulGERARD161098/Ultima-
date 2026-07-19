// Carto des idées ADRAMELECH côté client (boucle AD-4c) — module ES.
// Rendu 100 % data-driven depuis GET /api/idees (jeton de session Supabase,
// même mécanique que traveler.html : vendor local + js/config.js). Registre
// visuel : adramelech/carto-idees.html (encre, parchemin, cartouches), styles
// dans css/idees.css (zéro style inline, CSP intacte).
//
// Les fonctions PURES de regroupement/layout sont exportées pour les
// unitaires (tests/unit-idees-carto.mjs) ; le rendu navigateur est gardé
// par un test d'environnement (import Node sans DOM = aucun effet de bord).
//
// Invariants (spec design/spec-ad4c-front.md) :
//   - déterminisme : mêmes données → même rendu (tri par adr_num, zéro aléa) ;
//   - regroupement par thème principal (1er token de `theme` séparé par « · »,
//     null → « À classer ») ;
//   - injection DOM exclusivement createElement(NS)/textContent — jamais
//     d'innerHTML avec des données ;
//   - jamais de contenu d'idée en console/logs (PII) : erreurs génériques.

// ---------- Fonctions pures : regroupement ----------

// Premier token du thème (séparateur « · »), trimé. Vide/absent → null.
export function themePrincipal(theme) {
  if (typeof theme !== 'string') { return null; }
  const premier = theme.split('·')[0].trim();
  return premier.length ? premier : null;
}

// Libellé d'archipel : thème principal capitalisé ; null → « À classer ».
export function libelleArchipel(principal) {
  if (!principal) { return 'À classer'; }
  return principal.charAt(0).toLocaleUpperCase('fr-FR') + principal.slice(1);
}

// Numéro gravé zéro-paddé : 1 → « ADR-001 », 1234 → « ADR-1234 ».
export function numeroAdr(adrNum) {
  return 'ADR-' + String(adrNum).padStart(3, '0');
}

// Troncature déterministe d'un texte d'île (l'ellipse a une largeur finie).
export function tronquer(texte, max) {
  const t = typeof texte === 'string' ? texte : '';
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

// Regroupe les idées en archipels par thème principal. Déterministe :
//   - îles triées par adr_num croissant dans chaque archipel ;
//   - archipels triés par plus petit adr_num membre (« À classer » toujours
//     en dernier), départage par clé alphabétique.
// Clé de groupe insensible à la casse ; le libellé garde la graphie capitalisée.
export function grouperParTheme(idees) {
  const triees = (Array.isArray(idees) ? idees.slice() : [])
    .sort((a, b) => (a.adr_num || 0) - (b.adr_num || 0));
  const parCle = new Map();
  for (const idee of triees) {
    const principal = themePrincipal(idee.theme);
    const cle = principal ? principal.toLocaleLowerCase('fr-FR') : '';
    if (!parCle.has(cle)) {
      parCle.set(cle, { cle, libelle: libelleArchipel(principal), idees: [] });
    }
    parCle.get(cle).idees.push(idee);
  }
  return [...parCle.values()].sort((a, b) => {
    if (a.cle === '' && b.cle !== '') { return 1; }  // « À classer » en dernier
    if (b.cle === '' && a.cle !== '') { return -1; }
    const minA = a.idees[0].adr_num || 0;
    const minB = b.idees[0].adr_num || 0;
    if (minA !== minB) { return minA - minB; }
    return a.cle.localeCompare(b.cle, 'fr-FR');
  });
}

// ---------- Fonctions pures : layout ----------

// Géométrie (unités viewBox). Constantes figées = déterminisme du rendu.
const GEO = {
  MARGE: 30,        // marge latérale du cadre
  ARCH_W: 330,      // largeur de colonne par archipel
  Y_LABEL: 88,      // ligne de base du toponyme d'archipel
  Y0: 172,          // centre de la première île
  PAS_Y: 175,       // pas vertical entre îles d'un archipel
  ILE_RX: 110,      // demi-axes de l'île
  ILE_RY: 66,
  DECALE_X: 28,     // léger louvoiement des îles (pair/impair)
  BAS: 56,          // marge basse
};

// Calcule les positions des archipels, des îles et des ponts. Pur et
// déterministe : mêmes archipels + mêmes liens → même objet. Les liens dont
// une extrémité est inconnue, les auto-liens et les doublons (paire non
// orientée) sont ignorés sans bruit.
export function calculerLayout(archipels, liens) {
  const nb = archipels.length;
  const largeur = Math.max(680, GEO.MARGE * 2 + nb * GEO.ARCH_W);
  let maxIles = 0;
  const colonnes = [];
  const iles = [];
  const parId = new Map();

  archipels.forEach((archipel, j) => {
    const centreX = GEO.MARGE + j * GEO.ARCH_W + GEO.ARCH_W / 2;
    colonnes.push({
      cle: archipel.cle,
      libelle: archipel.libelle,
      x: centreX,
      y: GEO.Y_LABEL,
    });
    archipel.idees.forEach((idee, i) => {
      const ile = {
        idee,
        x: centreX + (i % 2 === 0 ? -GEO.DECALE_X : GEO.DECALE_X),
        y: GEO.Y0 + i * GEO.PAS_Y,
      };
      iles.push(ile);
      if (idee.id !== undefined && idee.id !== null) { parId.set(String(idee.id), ile); }
    });
    maxIles = Math.max(maxIles, archipel.idees.length);
  });

  const hauteur = Math.max(420, GEO.Y0 + Math.max(0, maxIles - 1) * GEO.PAS_Y + GEO.ILE_RY + GEO.BAS);

  const ponts = [];
  const dejaVu = new Set();
  for (const lien of Array.isArray(liens) ? liens : []) {
    if (!lien) { continue; }
    const a = parId.get(String(lien.source_id));
    const b = parId.get(String(lien.target_id));
    if (!a || !b || a === b) { continue; }
    const clePaire = [String(lien.source_id), String(lien.target_id)].sort().join('|');
    if (dejaVu.has(clePaire)) { continue; }
    dejaVu.add(clePaire);
    // Point de contrôle : milieu décalé le long de la normale (arc de route,
    // formule fixe → déterministe).
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const longueur = Math.hypot(dx, dy) || 1;
    const cx = (a.x + b.x) / 2 + (-dy / longueur) * 70;
    const cy = Math.max(36, (a.y + b.y) / 2 + (dx / longueur) * 70);
    ponts.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, cx, cy });
  }

  return { largeur, hauteur, archipels: colonnes, iles, ponts, rx: GEO.ILE_RX, ry: GEO.ILE_RY };
}

// ---------- Données d'exemple (mode démo, config Supabase vide) ----------
// Les 4 idées seed ADR-001..004 et leurs 4 ponts, thèmes du registre
// adramelech/IDEES.md — la page reste utilisable en démo, sans réseau.

export const DONNEES_DEMO = {
  idees: [
    { id: 'demo-adr-001', adr_num: 1, nom: 'GLANEUR', type: 'business', theme: 'bâtiment · économie circulaire · logistique', statut: 'à raffiner', partenaire: 'Godefroy' },
    { id: 'demo-adr-002', adr_num: 2, nom: 'PROTÉE', type: 'business', theme: 'bâtiment · énergie · organisation', statut: 'à raffiner', partenaire: 'Julien' },
    { id: 'demo-adr-003', adr_num: 3, nom: 'INTENDANT', type: 'pro · business', theme: 'bâtiment · logistique de chantier · approvisionnement', statut: 'à raffiner', partenaire: null },
    { id: 'demo-adr-004', adr_num: 4, nom: 'MYCÉLIUM', type: 'pro · business', theme: 'commercial · data client · fidélisation · recommandation', statut: 'à raffiner', partenaire: null },
  ],
  liens: [
    { source_id: 'demo-adr-001', target_id: 'demo-adr-002' },
    { source_id: 'demo-adr-001', target_id: 'demo-adr-003' },
    { source_id: 'demo-adr-002', target_id: 'demo-adr-004' },
    { source_id: 'demo-adr-003', target_id: 'demo-adr-004' },
  ],
};

// ---------- Rendu navigateur (gardé : jamais exécuté sous Node) ----------

const EST_NAVIGATEUR = typeof document !== 'undefined' && typeof window !== 'undefined';

if (EST_NAVIGATEUR) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const etat = { client: null, session: null };

  const $ = (sel) => document.querySelector(sel);

  // Élément SVG avec attributs (et texte via textContent — jamais innerHTML).
  function svgEl(nom, attrs, texte) {
    const el = document.createElementNS(SVG_NS, nom);
    for (const cle of Object.keys(attrs || {})) { el.setAttribute(cle, attrs[cle]); }
    if (texte !== undefined) { el.textContent = texte; }
    return el;
  }

  function htmlEl(nom, classe, texte) {
    const el = document.createElement(nom);
    if (classe) { el.className = classe; }
    if (texte !== undefined) { el.textContent = texte; }
    return el;
  }

  // ----- États dessinés (chargement / non connecté / vide / erreur) -----

  function poserEtat(construire) {
    const zone = $('#carto-etat');
    zone.replaceChildren();
    construire(zone);
    zone.hidden = false;
    $('#carto-figure').hidden = true;
  }

  function afficherChargement() {
    poserEtat((zone) => {
      zone.appendChild(htmlEl('p', 'etat-titre', 'Relevé en cours…'));
      zone.appendChild(htmlEl('p', 'etat-texte', 'La carte des idées se dresse depuis la base.'));
    });
  }

  function afficherNonConnecte() {
    poserEtat((zone) => {
      zone.appendChild(htmlEl('p', 'etat-titre', 'Archipel sous scellés'));
      zone.appendChild(htmlEl('p', 'etat-texte',
        'La bibliothèque d’idées est privée : connectez-vous pour lever la carte.'));
      const lien = htmlEl('a', 'bouton-parchemin', 'Se connecter');
      lien.href = 'traveler.html'; // l'écran de connexion existant (lien magique)
      zone.appendChild(lien);
    });
  }

  function afficherVide() {
    poserEtat((zone) => {
      zone.appendChild(htmlEl('p', 'etat-titre', 'Aucune île levée'));
      zone.appendChild(htmlEl('p', 'etat-texte',
        'Aucune idée au registre pour l’instant — la première dictée dressera la première île.'));
    });
  }

  function afficherErreur() {
    poserEtat((zone) => {
      zone.appendChild(htmlEl('p', 'etat-titre', 'Relevé impossible'));
      zone.appendChild(htmlEl('p', 'etat-texte',
        'La carte des idées est momentanément indisponible. Réessayez dans un instant.'));
      const bouton = htmlEl('button', 'bouton-parchemin', 'Réessayer');
      bouton.type = 'button';
      bouton.addEventListener('click', () => {
        if (etat.session) { charger(); } else { afficherNonConnecte(); }
      });
      zone.appendChild(bouton);
    });
  }

  // ----- La carte gravée -----

  function dessinerIle(groupe, ile, rx, ry) {
    const idee = ile.idee;
    const g = svgEl('g', { class: 'ile' });
    // Double trait gravé : halo externe léger + île pleine.
    g.appendChild(svgEl('ellipse', {
      class: 'ile-halo', cx: ile.x, cy: ile.y, rx: rx + 7, ry: ry + 6,
    }));
    g.appendChild(svgEl('ellipse', {
      class: 'ile-terre', cx: ile.x, cy: ile.y, rx, ry,
    }));
    g.appendChild(svgEl('text', {
      class: 'ile-nom', x: ile.x, y: ile.y - 24, 'text-anchor': 'middle',
    }, tronquer(idee.nom, 20)));
    const num = numeroAdr(idee.adr_num);
    g.appendChild(svgEl('text', {
      class: 'ile-num', x: ile.x, y: ile.y - 7, 'text-anchor': 'middle',
    }, idee.partenaire ? num + ' · avec ' + tronquer(idee.partenaire, 18) : num));
    g.appendChild(svgEl('text', {
      class: 'ile-type', x: ile.x, y: ile.y + 10, 'text-anchor': 'middle',
    }, tronquer(idee.type, 30)));
    // Badge de statut : sceau de cire (pilule gravée).
    const statut = typeof idee.statut === 'string' ? idee.statut : '';
    const largeurSceau = Math.max(52, 18 + statut.length * 6.2);
    g.appendChild(svgEl('rect', {
      class: 'sceau-fond', x: ile.x - largeurSceau / 2, y: ile.y + 19,
      width: largeurSceau, height: 17, rx: 8.5,
    }));
    g.appendChild(svgEl('text', {
      class: 'sceau-texte', x: ile.x, y: ile.y + 31, 'text-anchor': 'middle',
    }, statut));
    groupe.appendChild(g);
  }

  function construireSvg(donnees) {
    const archipels = grouperParTheme(donnees.idees);
    const layout = calculerLayout(archipels, donnees.liens);
    const resume = {
      nbIdees: donnees.idees.length,
      nbArchipels: archipels.length,
      nbPonts: layout.ponts.length,
    };

    const svg = svgEl('svg', {
      viewBox: '0 0 ' + layout.largeur + ' ' + layout.hauteur,
      role: 'img',
      'aria-label': 'Carte de l’archipel d’Adramelech : ' + resume.nbIdees +
        ' idée(s) regroupée(s) en ' + resume.nbArchipels +
        ' archipel(s) par thème, ' + resume.nbPonts + ' pont(s) de synergie.',
    });

    // Fond marin + filets de bordure gravée.
    svg.appendChild(svgEl('rect', { class: 'fond-mer', width: layout.largeur, height: layout.hauteur }));
    svg.appendChild(svgEl('rect', {
      class: 'filet-fort', x: 10, y: 10, width: layout.largeur - 20, height: layout.hauteur - 20,
    }));
    svg.appendChild(svgEl('rect', {
      class: 'filet-fin', x: 18, y: 18, width: layout.largeur - 36, height: layout.hauteur - 36,
    }));

    // Toponymes d'archipels (thème principal), soulignés d'un filet.
    for (const archipel of layout.archipels) {
      svg.appendChild(svgEl('text', {
        class: 'arch-nom', x: archipel.x, y: archipel.y, 'text-anchor': 'middle',
      }, archipel.libelle));
      svg.appendChild(svgEl('line', {
        class: 'arch-filet', x1: archipel.x - 62, y1: archipel.y + 8,
        x2: archipel.x + 62, y2: archipel.y + 8,
      }));
    }

    // Ponts (routes de synergie, pointillés de cire) SOUS les îles :
    // les extrémités s'ancrent aux centres et disparaissent sous la terre.
    for (const pont of layout.ponts) {
      svg.appendChild(svgEl('path', {
        class: 'pont',
        d: 'M' + pont.x1 + ',' + pont.y1 + ' Q' + pont.cx + ',' + pont.cy +
          ' ' + pont.x2 + ',' + pont.y2,
      }));
    }

    for (const ile of layout.iles) { dessinerIle(svg, ile, layout.rx, layout.ry); }

    return { svg, resume };
  }

  function rendre(donnees) {
    const idees = (donnees && Array.isArray(donnees.idees)) ? donnees.idees : [];
    const liens = (donnees && Array.isArray(donnees.liens)) ? donnees.liens : [];
    if (!idees.length) { afficherVide(); return; }

    const { svg, resume } = construireSvg({ idees, liens });
    const conteneur = $('#carto-carte');
    conteneur.replaceChildren(svg);
    $('#carto-devise').textContent =
      resume.nbIdees + ' idée' + (resume.nbIdees > 1 ? 's' : '') +
      ' · ' + resume.nbArchipels + ' archipel' + (resume.nbArchipels > 1 ? 's' : '') +
      ' · ' + resume.nbPonts + ' pont' + (resume.nbPonts > 1 ? 's' : '') +
      ' — aucune perdue';
    $('#carto-etat').hidden = true;
    $('#carto-figure').hidden = false;
  }

  // ----- Chargement des données (mode connecté) -----

  async function charger() {
    if (!etat.session || !etat.session.access_token) { afficherNonConnecte(); return; }
    afficherChargement();
    try {
      const reponse = await fetch('/api/idees', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token,
        },
      });
      if (reponse.status === 401) { afficherNonConnecte(); return; }
      let corps = null;
      try { corps = await reponse.json(); } catch (e) { corps = null; }
      if (!reponse.ok || !corps || corps.ok !== true || !corps.data) {
        afficherErreur();
        return;
      }
      rendre(corps.data);
    } catch (e) {
      // Message générique uniquement — jamais de détail (ni de donnée) en console.
      afficherErreur();
    }
  }

  // ----- Amorçage : même chaîne que traveler.html (config → client → session) -----

  function modeDemo() {
    $('#bandeau-demo').hidden = false;
    rendre(DONNEES_DEMO);
  }

  async function init() {
    const cfg = window.ULTIMA_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) { modeDemo(); return; }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      // Vendor indisponible : repli démo propre (jamais d'erreur console).
      modeDemo();
      return;
    }
    etat.client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const resultat = await etat.client.auth.getSession();
    etat.session = (resultat && resultat.data && resultat.data.session) || null;

    etat.client.auth.onAuthStateChange((evenement, session) => {
      etat.session = session;
      if (evenement === 'SIGNED_IN' || evenement === 'TOKEN_REFRESHED') { charger(); }
      if (evenement === 'SIGNED_OUT') { afficherNonConnecte(); }
    });

    if (etat.session) { charger(); } else { afficherNonConnecte(); }
  }

  init();
}
