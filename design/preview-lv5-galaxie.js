/* Maquette LV5 — la galaxie prend l'écran. Étape P0 de
   CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md.

   Trois choses, et rien d'autre :
     ① le vrai registre donné au vrai moteur, en PLEIN ÉCRAN ;
     ② la COUCHE DE FOND allumée (elle est inactive par défaut dans le moteur) ;
     ③ le BANDEAU DE MESURE — la géométrie se mesure, elle ne se regarde pas.

   Elle ne dessine aucun ciel elle-même. Une maquette qui remplace le moteur
   qu'elle prétend montrer ne montre plus rien : la leçon a été payée sur
   preview-riven-stellaire, où Paul a immédiatement demandé où était passé le
   3D. */
import { NOEUDS } from '../js/registre-lv3.mjs';
import { versCiel } from '../js/adaptateur-lv4.mjs';

var scene = document.getElementById('lv5-scene');
var bMesure = document.getElementById('lv5-mesure');
var bFond = document.getElementById('lv5-fond');
var bCharge = document.getElementById('lv5-charge');

var avecFond = true;
// Les charges à éprouver. 3 est le réel (les trois galaxies de la racine) ;
// 12 et 40 sont des PIRES CAS CONSTRUITS. On ne juge pas une géométrie sur les
// seules données du jour, qui sont un échantillon favorable (règle du
// 2026-08-01) — et pour le fond, la charge haute est ce qui dira si le budget
// d'image tient quand le ciel est plein.
var CHARGES = [3, 12, 40];
var iCharge = 0;
var vue = null;

// Le pire cas se CONSTRUIT sur le vrai adaptateur, jamais sur des données
// inventées à côté : ce qu'on éprouve doit être ce qui tournera.
function donnees() {
  var base = versCiel('racine', NOEUDS);
  var n = CHARGES[iCharge];
  if (n <= base.noeuds.length) {
    return { noeuds: base.noeuds.slice(0, n), relations: base.relations || [] };
  }
  var noeuds = base.noeuds.slice();
  for (var i = noeuds.length; i < n; i++) {
    noeuds.push({
      id: 'construit-' + i,
      // Vingt caractères : le pire cas LATÉRAL. C'est lui qui avait répondu
      // 93,7 unités de débord le 2026-08-13, quand une constante prétendait
      // borner une largeur de texte.
      nom: 'CONSTELLATION ' + String(i).padStart(2, '0') + 'XX',
      type: 'cap',
      statut: 'Ouvert',
      secteur_activite: 'ULTIMA',
      cible: null
    });
  }
  return { noeuds: noeuds, relations: [] };
}

function rendre() {
  vue = window.UltimaCiel.rendre(scene, donnees(), {
    // Les trois capacités de LV4, plus celle de LV5.
    cadrerSurLesEtoiles: true,
    tousLesNoms: true,
    fond: avecFond,
    atmosphere: { eclat: 0.94, eclatVoiles: 0.82, eclatFilaments: 0.72, contrasteProfondeur: 1 }
  });
  bFond.setAttribute('aria-pressed', String(avecFond));
  bCharge.textContent = 'Charge : ' + CHARGES[iCharge];
}

bFond.addEventListener('click', function () { avecFond = !avecFond; rendre(); });
bCharge.addEventListener('click', function () {
  iCharge = (iCharge + 1) % CHARGES.length;
  rendre();
});

// ---------------------------------------------------------------------------
// LE BANDEAU DE MESURE. Chaque ligne applique un critère du §7 du cadrage.
// ---------------------------------------------------------------------------
function verdict(ok, texte) {
  return '<span class="' + (ok ? 'ok' : 'ko') + '">' + (ok ? '✔' : '✘') + '</span> ' + texte;
}

function mesurer() {
  var lignes = [];
  var svg = scene.querySelector('svg');
  var boite = scene.getBoundingClientRect();

  // ① Critère 1 — la scène occupe l'écran.
  var partL = boite.width / window.innerWidth;
  var partH = boite.height / window.innerHeight;
  lignes.push(verdict(partL >= 0.98 && partH >= 0.98,
    'plein écran : <b>' + Math.round(partL * 100) + ' %</b> × <b>' +
    Math.round(partH * 100) + ' %</b> de la fenêtre (exigé ≥ 98)'));

  // ② Critère 2 — rien ne déborde.
  var deborde = document.documentElement.scrollHeight - window.innerHeight;
  lignes.push(verdict(deborde <= 1, 'débordement vertical : <b>' + deborde + ' px</b> (exigé ≤ 1)'));

  // ③ Critère 5 — LE FOND A-T-IL PEINT ? Un canvas qui n'a rien peint est
  //    noir, exactement comme un beau ciel : c'est la VARIANCE qui tranche,
  //    pas la luminance. Un fond éteint donne une variance nulle.
  var canvas = scene.querySelector('canvas.ciel-fond');
  if (!canvas) {
    lignes.push(verdict(!avecFond, 'fond : <b>absent</b> (attendu, il est éteint)'));
  } else {
    var ctx = canvas.getContext('2d');
    var zone = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    var somme = 0, somme2 = 0, n = 0;
    for (var i = 0; i < zone.length; i += 4 * 37) { // un pixel sur 37 : assez pour une variance
      var l = (zone[i] * 0.2126 + zone[i + 1] * 0.7152 + zone[i + 2] * 0.0722) * (zone[i + 3] / 255);
      somme += l; somme2 += l * l; n++;
    }
    var moyenne = somme / n;
    var variance = somme2 / n - moyenne * moyenne;
    lignes.push(verdict(variance > 0.05,
      'le fond a peint : variance <b>' + variance.toFixed(3) + '</b> (exigé > 0,05), ' +
      '<b>' + vue.nbGrains() + '</b> grains'));

    // ④ Critère 6 — LA PHASE. Le point témoin : ce que la couche de fond croit
    //    être la position écran d'une étoile, contre ce que le NAVIGATEUR
    //    mesure sur cette même étoile. Deux chemins indépendants — comparer ma
    //    formule à ma formule ne prouverait rien.
    //    LE REPÈRE EST CELUI DU CANVAS, pas celui de la scène : une bordure
    //    d'1 px sur la scène suffit à faire lire 1,60 px d'écart là où il n'y
    //    en a que 0,21 (constaté sur la coque de production, qui en a une).
    var repere = canvas.getBoundingClientRect();
    var etoile = svg && svg.querySelector('.ciel-etoile');
    var id = etoile && etoile.getAttribute('data-noeud-id');
    var t = id && vue.temoin(id);
    if (t) {
      var r = etoile.querySelector('circle').getBoundingClientRect();
      var cx = r.left + r.width / 2 - repere.left;
      var cy = r.top + r.height / 2 - repere.top;
      var ecart = Math.sqrt(Math.pow(cx - t.px, 2) + Math.pow(cy - t.py, 2));
      lignes.push(verdict(ecart <= 1,
        'phase fond ↔ étoiles : <b>' + ecart.toFixed(2) + ' px</b> d’écart (exigé ≤ 1)'));
    }

    // ⑤ Critère 7 — la densité suit la surface, elle n'est pas une constante.
    var attendu = Math.round((boite.width * boite.height) / window.UltimaCielFond.PIXELS_PAR_GRAIN);
    attendu = Math.max(300, Math.min(window.UltimaCielFond.GRAINS_MAX, attendu));
    lignes.push(verdict(vue.nbGrains() === attendu,
      'densité : <b>' + vue.nbGrains() + '</b> grains pour ' +
      Math.round(boite.width) + '×' + Math.round(boite.height) + ' (attendu ' + attendu + ')'));
  }

  // ⑥ Critère 6 du LV4, tenu — aucune étoile hors cadre. La `getBBox()`
  //    entière, halo et nom compris : mesurer le seul centre laisserait passer
  //    un nom coupé.
  var dehors = 0;
  if (svg) {
    var vb = svg.viewBox.baseVal;
    svg.querySelectorAll('.ciel-etoile').forEach(function (g) {
      var b = g.getBBox();
      if (b.x < 0 || b.y < 0 || b.x + b.width > vb.width || b.y + b.height > vb.height) { dehors++; }
    });
  }
  lignes.push(verdict(dehors === 0, 'hors cadre : <b>' + dehors + '</b> étoile(s)'));

  // ⑦ Critère 8 — LE BUDGET D'IMAGE, pris DANS le moteur.
  //    Le premier instrument mesurait l'intervalle entre deux images et
  //    répondait 16,4 ms partout : il lisait la cadence de l'écran, pas le
  //    travail. Celui-ci lit le temps réellement passé à dessiner — la seule
  //    grandeur qui dise s'il reste de la marge.
  var t0 = performance.now(), images = 0;
  function tic() {
    images++;
    if (images < 60) { requestAnimationFrame(tic); return; }
    var cadence = (performance.now() - t0) / images;
    var cout = vue.coutImage();
    lignes.push(verdict(cout < 16.7,
      'coût d’une image : <b>' + cout.toFixed(2) + ' ms</b> de travail (exigé < 16,7) — ' +
      'cadence observée ' + cadence.toFixed(1) + ' ms'));
    bMesure.innerHTML = lignes.join('<br>');
  }
  bMesure.innerHTML = lignes.join('<br>') + '<br>… mesure du budget d’image en cours';
  requestAnimationFrame(tic);
}

document.getElementById('lv5-mesurer').addEventListener('click', mesurer);

rendre();
// Exposé pour le harnais : il pilote la maquette au lieu de la deviner.
window.LV5 = {
  rendre: rendre,
  mesurer: mesurer,
  vue: function () { return vue; },
  charge: function (n) { iCharge = CHARGES.indexOf(n); rendre(); },
  fond: function (actif) { avecFond = !!actif; rendre(); }
};
