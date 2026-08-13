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
// LE DÉPLIAGE A DÉMÉNAGÉ DANS L'ADAPTATEUR (étape ③, 2026-08-13). Il était
// écrit ici ; il est désormais rendu par `versCiel(…, { deplie })`, avec sa
// garde — on ne déplie que ce qui appartient à l'étage. Une maquette qui garde
// pour elle la logique dont la production aura besoin fait le travail deux
// fois, et la seconde fois autrement.
function donneesEtage() {
  var base = versCiel(courant(), NOEUDS, { deplie: deplie });
  if (!base) { return null; }
  idsDuNiveau = base.idsDuNiveau;
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
    // ÉTAPE ② — les deux options du moteur, à la place du rattrapage par
    // l'API publique qui plafonnait à 37,6 %. Ce n'est plus la maquette qui
    // corrige le cadrage à coups de `zoomer` : c'est le moteur qui cadre juste
    // du premier coup, parce qu'il connaît enfin l'étendue réelle des étoiles.
    cadrerSurLesEtoiles: true,
    tousLesNoms: true,
    surClicNoeud: surClic
  });
  if (vue) { vue.derive(false); }
  brancherSurvol();
}

// ---------------------------------------------------------------------------
// ③ LE CADRAGE — la mesure, gardée telle quelle
// ---------------------------------------------------------------------------
// L'ÉTALON N'A PAS BOUGÉ D'UN IOTA entre l'étape ① et l'étape ② : c'est la même
// fonction, au même endroit, qui a dit 7,9 % avant et qui dit 65 à 75 %
// maintenant. Changer de yardstick en même temps que de moteur aurait rendu la
// comparaison sans valeur — et flatteuse, ce qui est pire.
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

// CE QUI A REMPLACÉ LE RATTRAPAGE — trace de l'étape ②, gardée parce qu'elle
// explique le chiffre. La maquette approchait elle-même la caméra par pas de
// `zoomer(-0.25)` : elle portait les trois galaxies de 7,9 % à 37,6 %, puis
// butait sur ZOOM_MIN sans jamais atteindre les 60 % exigés. Le rattrapage a
// disparu au profit des options `cadrerSurLesEtoiles` / `tousLesNoms` : le
// dernier tiers ne s'obtenait pas depuis l'extérieur du moteur, et il ne se
// négociait pas — il se corrigeait à la source.

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
    // ÉTAPE ② — la troisième capacité : on ENTRE en s'approchant, pas en
    // changeant d'écran. La caméra vient sur l'objet touché, et l'étage suivant
    // s'ouvre au bout de ce mouvement. C'est ce que Paul a dicté : « ça fait
    // une sorte de zoom et ça affiche les projets », pas un changement de page.
    if (vue) { vue.zoomerVers(id); }
    window.setTimeout(function () {
      chemin.push(id);
      deplie = null;
      rendre();
      mesurer();
    }, 260);
    message.textContent = '';
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
