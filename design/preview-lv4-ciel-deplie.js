/* Maquette LV4 — le ciel qui se déplie. Étape ① de CADRAGE-LV4-CIEL-DEPLIE.md.

   L'adaptateur `versCiel` n'est PAS réécrit ici : il vit dans son propre
   module, `adaptateur-lv4.mjs`, où la maquette du matin l'a déjà éprouvé sur
   dix écrans. Deux maquettes, un seul adaptateur. */
import { NOEUDS } from '../js/registre-lv3.mjs';
import { versCiel } from './adaptateur-lv4.mjs';

var ETAGES = ['les galaxies', 'les nébuleuses', 'les constellations', 'les étoiles'];

var chemin = ['racine'];          // le fil, de la racine à l'étage courant
var deplie = null;                // l'objet dont on regarde le contenu (survol)
var vue = null;
var modeDoigt = false;            // ⑤ le geste tactile : premier tap = déplier
var attenteTap = null;            // l'objet déplié par le premier tap
var mesures = {};
var gestes = 0;                   // critère 9 : le chemin ne doit pas s'allonger
var idsDuNiveau = [];             // ce qui appartient à l'étage courant

function courant() { return chemin[chemin.length - 1]; }
function noeud(id) { return NOEUDS[id] || {}; }

// ---------------------------------------------------------------------------
// Le rendu d'un étage — et le DÉPLIAGE
// ---------------------------------------------------------------------------
// Déplier, c'est montrer le contenu d'un objet SANS y entrer : ses enfants
// paraissent, rattachés à lui par un lien. On reste à l'étage, on n'engage
// rien — c'est exactement ce que Paul a dicté (« quand je pose le curseur
// dessus, leur propre constellation s'affiche »).
function donneesEtage() {
  var base = versCiel(courant(), NOEUDS);
  if (!base) { return null; }
  // Ce qui appartient à l'étage — par opposition à ce qu'un dépliage a fait
  // apparaître. La distinction n'est pas cosmétique : voir `brancherSurvol`.
  idsDuNiveau = base.noeuds.map(function (n) { return n.id; });
  if (!deplie) { return base; }

  var enfants = noeud(deplie).enfants || [];
  var nomDeplie = noeud(deplie).nom || deplie;
  enfants.forEach(function (idEnfant) {
    var e = noeud(idEnfant);
    base.noeuds.push({
      id: idEnfant, nom: e.nom || idEnfant, type: 'cap',
      statut: e.etat || '', secteur_activite: nomDeplie, cible: e.cible || null
    });
    base.relations.push({
      source_id: deplie, target_id: idEnfant,
      type: 'apport_affaires', statut: 'actif'
    });
  });
  return base;
}

function rendre() {
  var donnees = donneesEtage();
  if (!donnees) { return; }
  var n = noeud(courant());

  document.getElementById('mq-nom').textContent = n.nom || courant();
  document.getElementById('mq-etage').textContent = ETAGES[Math.min(chemin.length - 1, 3)];
  rendreFil();
  rendreLeo();

  vue = window.UltimaCiel.rendre(document.getElementById('ciel-scene'), donnees, {
    libellesType: { cap: '' }, libellesStatut: {},
    surClicNoeud: surClic
  });
  if (vue) { vue.derive(false); }
  brancherSurvol();
  cadrerSurLesObjets();
}

// ---------------------------------------------------------------------------
// ③ LE CADRAGE — la réponse au défaut des 5 %
// ---------------------------------------------------------------------------
// Le moteur cadre LE MONDE (sphère de rayon 300) et non LES ÉTOILES : trois
// caps occupaient 5 % de la largeur. Ici on approche la caméra jusqu'à ce que
// les objets occupent vraiment le cadre — en n'utilisant QUE l'API publique
// (`zoomer`). VERDICT, mesuré le 2026-08-13 sur un état propre : ça aide, et
// ça NE SUFFIT PAS. Sans rien faire, les trois galaxies occupent 7,9 % du
// cadre ; ce cadrage automatique les porte à 37,6 % ; et pousser l'API à son
// plafond d'approche n'ajoute plus RIEN (37,6 % — le zoom bute sur ZOOM_MIN).
// L'objectif est 60 %. C'est l'argument chiffré de l'étape ② : le dernier
// tiers ne s'obtient QUE dans le moteur, où `distanceIdeale()` doit connaître
// l'étendue réelle des étoiles au lieu du rayon du monde.
function occupation() {
  var svg = document.querySelector('#ciel-scene .ciel-svg');
  if (!svg) { return 0; }
  var vb = svg.getAttribute('viewBox').split(' ').map(Number);
  var zones = Array.prototype.slice.call(svg.querySelectorAll('g.ciel-etoile[data-noeud-id] .ciel-zone'));
  if (zones.length < 2) { return 1; } // un objet seul occupe ce qu'il veut
  var xs = zones.map(function (z) { return +z.getAttribute('cx'); });
  var ys = zones.map(function (z) { return +z.getAttribute('cy'); });
  var l = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / vb[2];
  var h = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / vb[3];
  return Math.max(l, h);
}

// La caméra GLISSE vers sa cible : elle n'y est pas à la ligne suivante. Une
// première version bouclait en synchrone et mesurait avant que rien n'ait
// bougé — elle « cadrait » sur une image qui n'existait pas encore. On avance
// donc par pas, en laissant chaque pas s'accomplir.
function cadrerSurLesObjets(tours) {
  if (!vue) { return; }
  tours = tours || 0;
  if (tours > 12) { return; }
  if (occupation() >= 0.6) { return; }
  // APPROCHER = delta NÉGATIF (js/app.js : le bouton « + » appelle
  // `zoomer(-0.18)`). Ma première version poussait +0,25 : elle s'ÉLOIGNAIT en
  // croyant approcher. Vérifié dans le produit avant de conclure quoi que ce
  // soit sur le moteur.
  vue.zoomer(-0.25);
  window.setTimeout(function () { cadrerSurLesObjets(tours + 1); mesurer(); }, 180);
}

// ---------------------------------------------------------------------------
// Les gestes
// ---------------------------------------------------------------------------
function surClic(id) {
  gestes += 1;
  var n = noeud(id);
  var message = document.getElementById('mq-etat');

  // ⑤ AU DOIGT : premier tap = déplier, second = entrer. C'est le candidat (a)
  // du cadrage. Il est là pour être ESSAYÉ, pas pour être cru : le survol
  // n'existe pas sur un téléphone, et Paul travaille sur 390 px.
  if (modeDoigt && attenteTap !== id && (n.enfants || []).length > 0) {
    attenteTap = id;
    deplier(id);
    message.textContent = 'Touchez à nouveau « ' + (n.nom || id) + ' » pour y entrer.';
    return;
  }
  attenteTap = null;

  if ((n.enfants || []).length > 0) {
    chemin.push(id);
    deplie = null;
    message.textContent = '';
    rendre();
    mesurer();
    return;
  }
  // ④ Une feuille — ou une galaxie sans contenu, comme ALTHEA.
  message.textContent = n.cible
    ? '→ ' + n.cible + '  (dans le produit, la page s’ouvre)'
    : '« ' + (n.nom || id) + ' » — ' + (n.etat || 'à venir') + ' : cet écran n’existe pas encore.';
}

function deplier(id) {
  if (deplie === id) { return; }
  deplie = id;
  rendre();
}

function brancherSurvol() {
  var scene = document.getElementById('ciel-scene');
  var minuteur = null;
  scene.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach(function (g) {
    var id = g.getAttribute('data-noeud-id');
    // Le survol ne déplie que ce qui a un contenu — et pas un objet déjà
    // déplié (sans quoi le re-rendu tournerait en boucle).
    g.addEventListener('mouseenter', function () {
      if (modeDoigt) { return; }
      // LE DÉPLIAGE S'EMBALLAIT. Déplier re-rend la scène : l'étoile qui vient
      // d'apparaître tombe sous le curseur immobile, reçoit un `mouseenter` et
      // se déplie à son tour — on descendait ainsi tout l'arbre sans avoir
      // bougé la main. Seuls les objets DE L'ÉTAGE peuvent déplier ; ce qu'un
      // dépliage a fait naître se regarde, il ne déplie pas.
      // (Trouvé en manipulant la maquette, pas en la relisant.)
      if (idsDuNiveau.indexOf(id) === -1) { return; }
      if (!(noeud(id).enfants || []).length) {
        // ④ ALTHEA : elle le DIT au lieu de déplier un vide.
        document.getElementById('mq-etat').textContent =
          '« ' + (noeud(id).nom || id) + ' » ne contient rien — elle mène droit à sa page.';
        return;
      }
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { deplier(id); mesurer(); }, 140);
    });
    g.addEventListener('focus', function () {
      if ((noeud(id).enfants || []).length) { deplier(id); mesurer(); }
    });
  });
}

function remonter() {
  if (chemin.length <= 1) { return; }
  gestes += 1;
  chemin.pop();
  deplie = null;
  rendre();
  mesurer();
}

// ---------------------------------------------------------------------------
// ⑤ Le fil, et ⑥ Léo
// ---------------------------------------------------------------------------
function rendreFil() {
  var fil = document.getElementById('mq-fil');
  fil.innerHTML = '';
  chemin.forEach(function (id, rang) {
    if (rang > 0) {
      var sep = document.createElement('span');
      sep.className = 'fil-sep';
      sep.textContent = '›';
      fil.appendChild(sep);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fil-etape';
    b.textContent = noeud(id).nom || id;
    if (rang === chemin.length - 1) { b.setAttribute('aria-current', 'true'); }
    b.addEventListener('click', function () {
      gestes += 1;
      chemin = chemin.slice(0, rang + 1);
      deplie = null;
      rendre();
      mesurer();
    });
    fil.appendChild(b);
  });
}

function rendreLeo() {
  var n = noeud(courant());
  var enfants = n.enfants || [];
  var parole = document.getElementById('mq-leo');
  var conseil = document.getElementById('mq-leo-conseil');

  // Où l'on est, et ce qu'il y a dedans. Le registre porte déjà les mots de
  // Léo (`resume`, `invite`) : on les DIT, on n'en invente pas d'autres.
  var ou = 'Vous êtes dans ' + (n.nom || courant()) + ' — ' +
    ETAGES[Math.min(chemin.length - 1, 3)] + '.';
  var contenu = enfants.length
    ? ' ' + enfants.length + (enfants.length > 1 ? ' objets à explorer.' : ' objet à explorer.')
    : ' Rien en dessous : cet objet mène droit à sa page.';
  parole.textContent = ou + contenu + (n.resume ? ' ' + n.resume : '');

  // Ce qui mérite l'attention. Sur l'écran d'arrivée, Léo nomme une chose à
  // faire — c'est le critère 4bis : un ciel muet serait beau et inutilisable.
  if (courant() === 'racine') {
    conseil.textContent = 'Léo vous conseille : RIVEN a trois relances qui dorment. ' +
      (n.invite || 'Sur quoi est-ce qu’on travaille aujourd’hui ?');
  } else if (deplie) {
    conseil.textContent = 'Léo : vous regardez « ' + (noeud(deplie).nom || deplie) +
      ' » sans y être entré. Touchez-la pour y aller.';
  } else {
    conseil.textContent = n.invite || 'Léo vous guide — survolez un objet.';
  }
}

// ---------------------------------------------------------------------------
// La mesure
// ---------------------------------------------------------------------------
function mesurer() {
  var svg = document.querySelector('#ciel-scene .ciel-svg');
  if (!svg) { return; }
  var attendus = (noeud(courant()).enfants || []).length +
    (deplie ? (noeud(deplie).enfants || []).length : 0);
  var etoiles = svg.querySelectorAll('g.ciel-etoile[data-noeud-id]');
  var vb = svg.getAttribute('viewBox').split(' ').map(Number);
  var dehors = 0;
  etoiles.forEach(function (g) {
    var z = g.querySelector('.ciel-zone');
    if (!z) { return; }
    var x = +z.getAttribute('cx'), y = +z.getAttribute('cy');
    if (!(x >= 0 && x <= vb[2] && y >= 0 && y <= vb[3])) { dehors += 1; }
  });
  var noms = Array.prototype.filter.call(svg.querySelectorAll('text'), function (t) {
    return !t.classList.contains('ciel-nom-amas');
  }).length;
  var occ = occupation();
  var leoParle = (document.getElementById('mq-leo').textContent || '').length > 20 &&
    (document.getElementById('mq-leo-conseil').textContent || '').length > 10;

  var cle = chemin.join('/') + (deplie ? ' + ' + deplie : '');
  mesures[cle] = {
    etage: cle, attendus: attendus, rendues: etoiles.length, noms: noms,
    occupation: occ, dehors: dehors, leo: leoParle,
    conforme: etoiles.length === attendus && dehors === 0 && noms >= attendus &&
      occ >= 0.6 && leoParle
  };
  rendreMesures();
}

function rendreMesures() {
  var lignes = Object.keys(mesures).map(function (k) { return mesures[k]; });
  var corps = document.getElementById('mq-lignes');
  corps.innerHTML = '';
  var defauts = 0;
  lignes.forEach(function (m) {
    if (!m.conforme) { defauts += 1; }
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + m.etage + '</td><td>' + m.attendus + '</td><td>' + m.rendues +
      '</td><td>' + m.noms + '</td><td>' + Math.round(m.occupation * 100) + ' %</td><td>' +
      m.dehors + '</td><td>' + (m.leo ? 'oui' : 'NON') + '</td><td class="' +
      (m.conforme ? 'mq-ok' : 'mq-defaut') + '">' + (m.conforme ? 'conforme' : 'DÉFAUT') + '</td>';
    corps.appendChild(tr);
  });
  var v = document.getElementById('mq-verdict');
  v.textContent = lignes.length + ' étage(s) · ' +
    (defauts === 0 ? '0 défaut' : defauts + ' DÉFAUT' + (defauts > 1 ? 'S' : '')) +
    ' · ' + gestes + ' geste(s)';
  v.className = 'mq-verdict ' + (defauts === 0 ? 'mq-verdict--ok' : 'mq-verdict--defaut');
  window.MAQUETTE_DEPLIE = { mesures: lignes, defauts: defauts, gestes: gestes };
}

// ---------------------------------------------------------------------------
function amorcer() {
  document.getElementById('mq-remonter').addEventListener('click', remonter);
  document.getElementById('mq-racine').addEventListener('click', function () {
    chemin = ['racine']; deplie = null; rendre(); mesurer();
  });
  document.getElementById('mq-tactile').addEventListener('click', function () {
    modeDoigt = !modeDoigt;
    this.setAttribute('aria-pressed', modeDoigt ? 'true' : 'false');
    this.textContent = modeDoigt ? 'Mode doigt (actif)' : 'Mode doigt';
    document.getElementById('mq-etat').textContent = modeDoigt
      ? 'Au doigt : un premier appui déplie, un second entre.'
      : 'À la souris : le survol déplie, le clic entre.';
    attenteTap = null;
  });
  var corps = document.getElementById('mq-mesure-corps');
  document.getElementById('mq-replier').addEventListener('click', function () {
    var replie = corps.hidden;
    corps.hidden = !replie;
    this.textContent = replie ? 'Replier' : 'Déplier';
  });
  document.getElementById('ciel-plat').addEventListener('click', function () {
    if (!vue) { return; }
    vue.plat(!vue.estPlat());
    this.setAttribute('aria-pressed', vue.estPlat() ? 'true' : 'false');
    this.textContent = vue.estPlat() ? 'En volume' : 'À plat';
  });

  rendre();
  setTimeout(mesurer, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', amorcer);
} else {
  amorcer();
}
