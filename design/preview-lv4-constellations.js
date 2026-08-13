/* Maquette LV4 — la console en constellations. Étape ① du cadrage du matin.

   L'ADAPTATEUR a été EXTRAIT dans `adaptateur-lv4.mjs` le 2026-08-13 : la
   maquette du dépliage en avait besoin, et l'importer d'ici entraînait tout ce
   harnachement — qui cherche des éléments absents et tue la page. Un composant
   réclamé par un second appelant se déplace, il ne se recopie pas.

   Ne reste ici que le harnachement de maquette, et lui seul est jetable. */
import { NOEUDS } from '../js/registre-lv3.mjs';
import { versCiel } from './adaptateur-lv4.mjs';

// ============================================================================
// ②  Le harnachement de maquette
// ============================================================================

// Les écrans RÉELS du registre (ceux qui ont des enfants), du plus chargé au
// plus pauvre — c'est dans cet ordre qu'on veut les juger.
var ECRANS = Object.keys(NOEUDS)
  .filter(function (id) { return (NOEUDS[id].enfants || []).length > 0; })
  .sort(function (a, b) {
    return (NOEUDS[b].enfants || []).length - (NOEUDS[a].enfants || []).length;
  });

// LE PIRE CAS, CONSTRUIT — il ne s'espère pas (leçon du foyer DRAUKHAIN).
// Le registre plafonne aujourd'hui à QUATRE caps ; rien ne dit qu'il en restera
// là. Douze caps montrent ce qui se passe quand Paul ajoutera des écrans — et
// notamment où le moteur cesse d'afficher tous les noms (six en permanence).
var REGISTRE = Object.assign({}, NOEUDS);
REGISTRE['pire-cas'] = {
  nom: 'PIRE CAS', titre: 'Douze caps', surligne: 'construit, pas observé',
  invite: 'Ce que devient un écran si le registre grossit.',
  enfants: []
};
for (var i = 1; i <= 12; i += 1) {
  var id = 'pire-cap-' + i;
  REGISTRE[id] = { nom: 'Cap numéro ' + i, etat: 'Ouvert', cible: '#' + id };
  REGISTRE['pire-cas'].enfants.push(id);
}
ECRANS.push('pire-cas');

var mesures = {};
var ecranCourant = null;
var vue = null;

function rendreEcran(idEcran) {
  ecranCourant = idEcran;
  var ecran = REGISTRE[idEcran];
  var donnees = versCiel(idEcran, REGISTRE);
  if (!donnees) { return; }

  document.getElementById('mq-nom').textContent = ecran.nom || idEcran;
  document.getElementById('mq-surligne').textContent = ecran.surligne || 'Ultima Lv4';
  document.getElementById('mq-titre').textContent = ecran.titre || '';
  document.getElementById('mq-invite').textContent = ecran.invite || '';
  document.getElementById('mq-etat-cap').textContent = '';

  document.querySelectorAll('#mq-ecrans .mq-bouton').forEach(function (b) {
    if (b.getAttribute('data-ecran') === idEcran) { b.setAttribute('aria-pressed', 'true'); }
    else { b.removeAttribute('aria-pressed'); }
  });

  vue = window.UltimaCiel.rendre(document.getElementById('ciel-scene'), donnees, {
    // L'étiquette accessible dit le TYPE puis le STATUT : ici « cap » et
    // l'état du registre (« Ouvert », « À venir »…). C'est ce qui porte
    // l'information que la couleur ne porte pas.
    libellesType: { cap: 'cap' },
    libellesStatut: {},
    surClicNoeud: function (idCap) {
      var cap = REGISTRE[idCap] || {};
      var message = document.getElementById('mq-etat-cap');
      if (!cap.cible) {
        // ② LE CAP « À VENIR » : visible, nommé, et FERMÉ. Il n'emmène nulle
        // part et le dit — c'est ce que la boussole faisait déjà.
        message.textContent = '« ' + (cap.nom || idCap) +' » — ' + (cap.etat || 'à venir') +
          ' : cet écran n’existe pas encore.';
        return;
      }
      message.textContent = '→ ' + cap.cible + '  (dans le produit, on y va)';
      // Si le cap est lui-même un écran, on y descend : c'est la navigation.
      if (REGISTRE[idCap] && (REGISTRE[idCap].enfants || []).length > 0) {
        rendreEcran(idCap);
        mesurer();
      }
    }
  });
  if (vue) { vue.derive(false); }
}

// ---------------------------------------------------------------------------
// Le bandeau de mesure — le registre fait foi
// ---------------------------------------------------------------------------
function mesurer() {
  var ecran = REGISTRE[ecranCourant];
  var attendus = (ecran.enfants || []).length;
  var svg = document.querySelector('#ciel-scene .ciel-svg');
  if (!svg) { return; }

  var etoiles = svg.querySelectorAll('g.ciel-etoile[data-noeud-id]');
  var vb = svg.getAttribute('viewBox').split(' ').map(Number);
  var dehors = 0;
  var minCible = Infinity;
  var boiteScene = document.getElementById('ciel-scene').getBoundingClientRect();

  etoiles.forEach(function (g) {
    var z = g.querySelector('.ciel-zone');
    if (!z) { return; }
    var x = +z.getAttribute('cx'), y = +z.getAttribute('cy');
    if (!(x >= 0 && x <= vb[2] && y >= 0 && y <= vb[3])) { dehors += 1; }
    // Le rayon est en unités de viewBox : on le ramène en pixels réels, sans
    // quoi on mesurerait une grandeur qui n'existe pas à l'écran.
    var rayonPx = (+z.getAttribute('r')) * (boiteScene.width / vb[2]);
    if (rayonPx * 2 < minCible) { minCible = rayonPx * 2; }
  });

  // Les noms VISIBLES en permanence : sur un menu, un cap sans nom est perdu.
  var noms = svg.querySelectorAll('.ciel-nom[data-permanent="oui"], .ciel-nom-permanent').length ||
    Array.prototype.filter.call(svg.querySelectorAll('text'), function (t) {
      return t.getAttribute('opacity') !== '0' && !t.classList.contains('ciel-nom-amas');
    }).length;

  mesures[ecranCourant] = {
    ecran: ecran.nom || ecranCourant,
    attendus: attendus,
    rendues: etoiles.length,
    noms: noms,
    cible: isFinite(minCible) ? Math.round(minCible) : 0,
    dehors: dehors,
    conforme: etoiles.length === attendus && dehors === 0 &&
      isFinite(minCible) && minCible >= 24 && noms >= attendus
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
    tr.innerHTML = '<td>' + m.ecran + '</td><td>' + m.attendus + '</td><td>' + m.rendues +
      '</td><td>' + m.noms + '</td><td>' + m.cible + ' px</td><td>' + m.dehors +
      '</td><td class="' + (m.conforme ? 'mq-ok' : 'mq-defaut') + '">' +
      (m.conforme ? 'conforme' : 'DÉFAUT') + '</td>';
    corps.appendChild(tr);
  });
  var verdict = document.getElementById('mq-verdict');
  verdict.textContent = lignes.length + ' écran(s) mesuré(s) · ' +
    (defauts === 0 ? '0 défaut' : defauts + ' DÉFAUT' + (defauts > 1 ? 'S' : ''));
  verdict.className = 'mq-verdict ' + (defauts === 0 ? 'mq-verdict--ok' : 'mq-verdict--defaut');
  window.MAQUETTE_LV4 = { mesures: lignes, defauts: defauts };
}

// ---------------------------------------------------------------------------
function amorcer() {
  var barre = document.getElementById('mq-ecrans');
  ECRANS.forEach(function (id) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mq-bouton';
    b.setAttribute('data-ecran', id);
    b.textContent = (REGISTRE[id].nom || id) + ' (' + (REGISTRE[id].enfants || []).length + ')';
    b.addEventListener('click', function () { rendreEcran(id); setTimeout(mesurer, 700); });
    barre.appendChild(b);
  });

  var corps = document.getElementById('mq-mesure-corps');
  document.getElementById('mq-replier').addEventListener('click', function () {
    var replie = corps.hidden;
    corps.hidden = !replie;
    this.textContent = replie ? 'Replier' : 'Déplier';
  });

  document.getElementById('mq-tout-voir').addEventListener('click', function () {
    if (vue) { vue.toutVoir(); }
  });
  document.getElementById('ciel-plat').addEventListener('click', function () {
    if (!vue) { return; }
    var versPlat = !vue.estPlat();
    vue.plat(versPlat);
    this.setAttribute('aria-pressed', vue.estPlat() ? 'true' : 'false');
    this.textContent = vue.estPlat() ? 'En volume' : 'À plat';
  });

  // On mesure TOUS les écrans à l'ouverture — un écran non éprouvé est un
  // écran cassé —, puis on revient à la racine, là où Paul arrive.
  var suite = Promise.resolve();
  ECRANS.forEach(function (id) {
    suite = suite.then(function () {
      return new Promise(function (resoudre) {
        rendreEcran(id);
        setTimeout(function () { mesurer(); resoudre(); }, 420);
      });
    });
  });
  suite.then(function () { rendreEcran('racine'); setTimeout(mesurer, 500); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', amorcer);
} else {
  amorcer();
}
