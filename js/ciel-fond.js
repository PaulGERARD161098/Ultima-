// LE FOND DU CIEL — la couche de finesse (LV5). Exposé en global :
// window.UltimaCielFond
// ---------------------------------------------------------------------------
// Dicté par Paul le 2026-08-16, maquette de référence désignée le même soir :
// le mode « Galaxie » de `design/preview-riven-galaxie.html`, en charge dense —
// un vrai amas, des voiles, des filaments. Mesuré : cette maquette est en 2D
// (aucune perspective, `FOCALE|projeter|yaw|pitch` → 0 occurrence), là où le
// moteur de production est en 3D mais dépouillé (130 grains fixes). Ce module
// est le pont : il porte la DENSITÉ de la maquette dans la PROFONDEUR du
// moteur.
//
// POURQUOI UN CANVAS, ET POURQUOI PAS TOUT EN CANVAS
// --------------------------------------------------
// Un champ stellaire crédible demande des milliers de grains. En SVG, chaque
// grain est un nœud du document que le navigateur re-style et re-peint à
// chaque image : le plafond praticable est de l'ordre du millier d'éléments
// animés sur un ordinateur, nettement moins sur un téléphone de 390 px — et
// c'est le téléphone qui décide, parce que c'est là que Paul travaille.
// Un canvas 2D en avale des milliers sans effort, et il apporte ce que le SVG
// n'a pas : `globalCompositeOperation = 'lighter'`, l'ADDITION lumineuse. Deux
// grains qui se superposent s'additionnent au lieu de se recouvrir — c'est ce
// qui donne son cœur brillant à un amas, et aucune opacité SVG ne l'imite.
//
// Pas de WebGL : il se justifie au-delà de ~50 000 points, on en vise 5 000, et
// il coûterait un shader à maintenir plus une perte de contexte à gérer.
// Pas de bibliothèque : la CSP d'Ultima pose `script-src 'self'`.
//
// ET SURTOUT — LA RÈGLE DURE : **si une information n'existe que dans le
// canvas, elle n'existe pas.** Ce fond est un DÉCOR. Il est `aria-hidden`, il
// ne reçoit aucun événement, il ne porte aucun nom, aucune donnée, aucune PII.
// Tout ce qui se clique, se focalise et se lit reste en SVG, élément du
// document, exactement comme avant.
//
// LA PHASE — le vrai risque de cette couche, et la raison de sa forme
// ------------------------------------------------------------------
// Deux repères qui dérivent (le `viewBox` du SVG d'un côté, les pixels du
// canvas × `devicePixelRatio` de l'autre) donnent un fond qui GLISSE sous les
// étoiles. C'est le mode de défaillance n°1 du cadrage, et il est structurel :
// on ne le corrige pas, on l'empêche.
// D'où la forme de ce module : **il n'a pas de caméra.** Il ne connaît ni yaw,
// ni pitch, ni distance. Le moteur lui passe SA fonction `projeter` à chaque
// image ; le fond ne fait que convertir le résultat en pixels. Il ne peut donc
// pas diverger d'une caméra qu'il n'a pas.
// Reste une seule conversion à faire juste, celle du `viewBox` vers les pixels
// CSS. Le SVG est monté en `preserveAspectRatio="xMidYMid meet"` : l'échelle
// est le MINIMUM des deux rapports, et le reste se répartit en marges égales.
// C'est écrit une fois, dans `poser()`, et le harnais le vérifie contre la
// mesure du navigateur lui-même (`getBoundingClientRect`), jamais contre une
// seconde version de la même formule.
(function () {
  'use strict';

  // Un grain par N pixels CSS de scène. C'est une DENSITÉ, pas un nombre, et
  // c'est la correction du défaut mesuré : 130 grains est une constante, elle
  // sature un écran de 390 px et laisse vide un 1670.
  var PIXELS_PAR_GRAIN = 260;
  // Plafond : au-delà, on paie sans plus rien voir. Atteint vers 3,4 Mpx CSS,
  // soit bien au-delà de l'écran de Paul (1670 × 900 = 1,5 Mpx).
  var GRAINS_MAX = 5200;
  // `devicePixelRatio` plafonné : à 3, on peint 9 fois la surface logique pour
  // un gain invisible sur des grains de deux pixels.
  var DPR_MAX = 2;

  // Les trois teintes du champ. Un ciel monochrome se lit comme du bruit ; la
  // maquette de référence tient sa richesse de ses couleurs. Le bleu froid
  // domine (c'est la nuit d'Ultima), la crème donne les étoiles proches, l'or
  // est celui du produit — et il reste minoritaire, sinon le ciel vire au
  // parchemin et le régime chromatique du 2026-08-13 tombe.
  var TEINTES = [
    { c: '#cfe0f5', part: 0.62 },
    { c: '#f2ead6', part: 0.26 },
    { c: '#d8bd82', part: 0.12 }
  ];

  var TAILLE_SPRITE = 24;   // le grain pré-rendu, en pixels device
  var TAILLE_VOILE = 256;   // le voile de nébuleuse, pré-rendu

  // L'ÉCLAT DU DÉCOR — et c'est le premier enseignement de la maquette, trouvé
  // en REGARDANT le rendu, pas en le calculant. Au premier jet, le fond était
  // peint à pleine puissance : mesures toutes vertes, et sur l'image, ALTHEA
  // était MOINS visible qu'un grain de poussière. Un décor qui rivalise avec
  // l'objet qu'on vient chercher n'est plus un décor, c'est un concurrent.
  // La hiérarchie est une contrainte, pas un réglage de goût : le fond passe
  // derrière, et il y reste.
  var ECLAT_DECOR = 0.58;
  var ECLAT_VOILES = 0.72;

  // Générateur déterministe : même graine, même ciel, à chaque ouverture.
  // C'est la règle du repo depuis le layout d'arbre (A3) — un décor qui change
  // à chaque rafraîchissement n'est pas un décor, c'est du bruit, et aucun
  // harnais ne peut le mesurer deux fois.
  function generateur(graine) {
    var g = graine;
    return function () {
      g = (g * 1103515245 + 12345) % 2147483648;
      return g / 2147483648;
    };
  }

  // ------------------------------------------------------------------
  // Les sprites. Pré-rendus UNE FOIS, puis recopiés des milliers de fois.
  // Un `arc() + fill()` par grain et par image coûte environ dix fois plus :
  // c'est la première des quatre techniques qui séparent « fin » de
  // « grossier », et la moins visible dans le résultat.
  // ------------------------------------------------------------------
  function spriteGrain(couleur) {
    var c = document.createElement('canvas');
    c.width = c.height = TAILLE_SPRITE;
    var x = c.getContext('2d');
    var r = TAILLE_SPRITE / 2;
    var d = x.createRadialGradient(r, r, 0, r, r, r);
    d.addColorStop(0, couleur);
    // Le plateau central était à 0,22 : il donnait des grains à cœur plat et
    // large — des FLOCONS, pas des étoiles. Vu sur capture. Un point stellaire
    // est un cœur minuscule et une décroissance rapide ; c'est là que se joue
    // la différence entre « fin » et « laiteux », et elle tient dans un
    // chiffre.
    d.addColorStop(0.10, couleur);
    d.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = d;
    x.beginPath();
    x.arc(r, r, r, 0, Math.PI * 2);
    x.fill();
    return c;
  }

  function spriteVoile(couleur) {
    var c = document.createElement('canvas');
    c.width = c.height = TAILLE_VOILE;
    var x = c.getContext('2d');
    var r = TAILLE_VOILE / 2;
    var d = x.createRadialGradient(r, r, 0, r, r, r);
    // Un voile est un objet de FAIBLE contraste et de grande surface : s'il est
    // franc au centre, il se lit comme un disque — le défaut exact qui avait
    // fait descendre le médaillon de la boussole dans l'angle le 2026-08-13.
    d.addColorStop(0, couleur.replace('OPACITE', '0.20'));
    d.addColorStop(0.45, couleur.replace('OPACITE', '0.07'));
    d.addColorStop(1, couleur.replace('OPACITE', '0'));
    x.fillStyle = d;
    x.fillRect(0, 0, TAILLE_VOILE, TAILLE_VOILE);
    return c;
  }

  // ------------------------------------------------------------------
  // Le peuplement du monde. Les grains vivent en COORDONNÉES MONDE, en 3D,
  // exactement comme les étoiles — et c'est ce qui donne la parallaxe
  // gratuitement : le moteur projette, les lointains bougent moins que les
  // proches, sans une ligne de code dédiée. Trois nappes de profondeur, parce
  // qu'une seule coquille se lit comme un papier peint qui tourne.
  // ------------------------------------------------------------------
  function peupler(rayonMonde, nombre, graine) {
    var alea = generateur(graine);
    var grains = [];
    var i, seuil, teinte, part;
    for (i = 0; i < nombre; i++) {
      // Nappe : 1 proche, 2 médiane, 3 lointaine. Réparties inégalement — un
      // ciel a plus de fond que d'avant-plan.
      var n = alea();
      var nappe = n < 0.22 ? 1 : (n < 0.55 ? 2 : 3);
      var distance = rayonMonde * (nappe === 1 ? 1.35 : nappe === 2 ? 2.3 : 3.8);
      distance *= 0.82 + alea() * 0.36;

      // Tirage de la teinte selon les parts déclarées.
      var t = alea(); seuil = 0; teinte = 0;
      for (part = 0; part < TEINTES.length; part++) {
        seuil += TEINTES[part].part;
        if (t <= seuil) { teinte = part; break; }
      }

      // Position sphérique. `Math.acos(2u - 1)` et non `u × π` : sans cette
      // correction, les points s'accumulent aux deux pôles et le champ montre
      // deux taches là où il devrait être uniforme.
      var a = alea() * Math.PI * 2;
      var b = Math.acos(2 * alea() - 1);
      grains.push({
        x: Math.cos(a) * Math.sin(b) * distance,
        // Aplati : un amas est une lentille, pas une bille.
        y: Math.cos(b) * distance * 0.62,
        z: Math.sin(a) * Math.sin(b) * distance,
        nappe: nappe,
        teinte: teinte,
        // L'éclat propre du grain, avant tout effet de profondeur.
        eclat: nappe === 1 ? 0.55 + alea() * 0.45
          : nappe === 2 ? 0.30 + alea() * 0.35
            : 0.12 + alea() * 0.22,
        taille: nappe === 1 ? 1.5 + alea() * 1.7 : nappe === 2 ? 1.0 + alea() * 1.0 : 0.7 + alea() * 0.6
      });
    }
    return grains;
  }

  function voiles(rayonMonde, graine) {
    var alea = generateur(graine);
    var liste = [];
    for (var i = 0; i < 6; i++) {
      var a = alea() * Math.PI * 2;
      var d = rayonMonde * (0.9 + alea() * 1.9);
      liste.push({
        x: Math.cos(a) * d,
        y: (alea() - 0.5) * rayonMonde * 0.9,
        z: Math.sin(a) * d,
        rayon: rayonMonde * (0.55 + alea() * 0.85),
        teinte: i % 3,
        eclat: 0.5 + alea() * 0.5
      });
    }
    return liste;
  }

  // Les filaments : la structure de l'amas, pas ses relations. Ils sont PÂLES
  // et jamais blancs purs — c'est délibéré : le blanc franc est déjà pris, il
  // dit « relation » depuis que Paul l'a demandé pour RIVEN. Un décor qui
  // emprunte le vocabulaire d'une donnée ment sur ce qu'il montre.
  function filaments(rayonMonde, graine) {
    var alea = generateur(graine);
    var liste = [];
    for (var i = 0; i < 11; i++) {
      var a = alea() * Math.PI * 2;
      var d = rayonMonde * (1.1 + alea() * 1.6);
      var points = [];
      var x = Math.cos(a) * d, y = (alea() - 0.5) * rayonMonde, z = Math.sin(a) * d;
      var dir = alea() * Math.PI * 2;
      for (var p = 0; p < 5; p++) {
        points.push({ x: x, y: y, z: z });
        var pas = rayonMonde * (0.28 + alea() * 0.3);
        dir += (alea() - 0.5) * 1.1;
        x += Math.cos(dir) * pas;
        y += (alea() - 0.5) * pas * 0.5;
        z += Math.sin(dir) * pas;
      }
      liste.push({ points: points, eclat: 0.05 + alea() * 0.06 });
    }
    return liste;
  }

  // ------------------------------------------------------------------
  // L'ÉTAT. Créé une fois par rendu, dimensionné à chaque redimensionnement,
  // peint à chaque image.
  // ------------------------------------------------------------------
  function creer(options) {
    options = options || {};
    var rayonMonde = options.rayonMonde || 300;

    var canvas = document.createElement('canvas');
    canvas.className = 'ciel-fond';
    // Décor, et rien d'autre : invisible aux technologies d'assistance,
    // transparent aux clics. Une étoile ne doit jamais perdre un geste au
    // profit d'un grain de poussière.
    canvas.setAttribute('aria-hidden', 'true');
    var ctx = canvas.getContext('2d');

    var sprites = TEINTES.map(function (t) { return spriteGrain(t.c); });
    var spritesVoile = [
      spriteVoile('rgba(58,104,168,OPACITE)'),
      spriteVoile('rgba(96,86,150,OPACITE)'),
      spriteVoile('rgba(150,124,74,OPACITE)')
    ];

    var etat = {
      canvas: canvas,
      ctx: ctx,
      largeurCSS: 0, hauteurCSS: 0,
      vbW: 0, vbH: 0,
      k: 1, offX: 0, offY: 0,
      dpr: 1,
      grains: [],
      // Les crans d'allègement déjà pris. Dans l'état et non en fermeture :
      // `poser()` les lit, et il s'exécute avant que la déclaration soit
      // atteinte.
      cransPris: 0,
      voiles: voiles(rayonMonde, 977),
      filaments: filaments(rayonMonde, 401),
      rayonMonde: rayonMonde
    };

    // LA CONVERSION viewBox → PIXELS CSS. Écrite ICI et nulle part ailleurs.
    // `preserveAspectRatio="xMidYMid meet"` : l'échelle est le minimum des deux
    // rapports (le contenu ENTRE en entier, quitte à laisser des marges), et le
    // reste se répartit également des deux côtés. Recopier cette règle « au
    // plus simple » (k = largeur/vbW) marche tant que les proportions
    // coïncident et dérive en silence le jour où elles ne coïncident plus —
    // exactement le mode de défaillance que ce module doit empêcher.
    function poser(largeurCSS, hauteurCSS, vbW, vbH) {
      etat.largeurCSS = largeurCSS;
      etat.hauteurCSS = hauteurCSS;
      etat.vbW = vbW;
      etat.vbH = vbH;
      etat.k = Math.min(largeurCSS / vbW, hauteurCSS / vbH);
      etat.offX = (largeurCSS - vbW * etat.k) / 2;
      etat.offY = (hauteurCSS - vbH * etat.k) / 2;

      etat.dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(largeurCSS * etat.dpr));
      canvas.height = Math.max(1, Math.round(hauteurCSS * etat.dpr));
      canvas.style.width = largeurCSS + 'px';
      canvas.style.height = hauteurCSS + 'px';

      // LA DENSITÉ SUIT LA SURFACE. C'est le correctif du « grossier » : un
      // nombre fixe sature un téléphone et vide un écran large.
      var voulu = Math.round((largeurCSS * hauteurCSS) / PIXELS_PAR_GRAIN);
      voulu = Math.max(300, Math.min(GRAINS_MAX, voulu));
      // Les crans d'allègement déjà pris SURVIVENT au redimensionnement : une
      // machine qui peinait ne cesse pas de peiner parce qu'on a changé la
      // taille de la fenêtre, et repeupler à plein la ferait replonger.
      for (var c = 0; c < etat.cransPris; c++) { voulu = Math.round(voulu * 0.6); }
      if (voulu !== etat.grains.length) {
        etat.grains = peupler(etat.rayonMonde, voulu, 7919);
      }
    }

    // Le point témoin du harnais : ce que CE module croit être la position
    // écran d'un point du monde. Comparé à ce que le navigateur mesure sur
    // l'étoile correspondante — deux chemins indépendants, un seul verdict.
    function versEcran(pr) {
      if (!pr) { return null; }
      return { px: etat.offX + pr.sx * etat.k, py: etat.offY + pr.sy * etat.k };
    }

    function peindre(projeter, opts) {
      if (!etat.largeurCSS || !etat.hauteurCSS) { return 0; }
      opts = opts || {};
      var g = etat.ctx;
      var peints = 0;

      g.setTransform(etat.dpr, 0, 0, etat.dpr, 0, 0);
      g.clearRect(0, 0, etat.largeurCSS, etat.hauteurCSS);
      // L'ADDITION LUMINEUSE — la raison d'être du canvas ici. Tout ce qui suit
      // s'ajoute au lieu de recouvrir : les superpositions font les cœurs
      // brillants, et le vide reste vraiment vide.
      g.globalCompositeOperation = 'lighter';

      // ① Les voiles, en premier : ils sont derrière tout.
      etat.voiles.forEach(function (v) {
        var pr = projeter(v);
        var e = versEcran(pr);
        if (!e) { return; }
        var taille = v.rayon * pr.echelle * etat.k * 2;
        if (taille < 8) { return; }
        if (e.px < -taille || e.px > etat.largeurCSS + taille) { return; }
        if (e.py < -taille || e.py > etat.hauteurCSS + taille) { return; }
        var modulationVoile = 1;
        if (opts.contrasteProfondeur) {
          // Les voiles lointains refroidissent et s'atténuent ; l'or, minoritaire
          // et porteur de sens, est le seul à remonter légèrement.
          modulationVoile = v.teinte === 0 ? 1.08 : (v.teinte === 1 ? 0.88 : 0.72);
        }
        g.globalAlpha = Math.max(0, Math.min(1, v.eclat * ECLAT_VOILES * (opts.eclatVoiles || 1) * modulationVoile));
        g.drawImage(spritesVoile[v.teinte], e.px - taille / 2, e.py - taille / 2, taille, taille);
        peints++;
      });

      // ② Les filaments : la structure, très pâle.
      g.lineCap = 'round';
      etat.filaments.forEach(function (f) {
        var ecran = [];
        for (var i = 0; i < f.points.length; i++) {
          var e = versEcran(projeter(f.points[i]));
          if (!e) { return; } // un filament tronqué est un trait qui part de nulle part
          ecran.push(e);
        }
        g.globalAlpha = f.eclat * (opts.eclatFilaments || 1);
        g.strokeStyle = '#8fb4dd';
        g.lineWidth = Math.max(0.6, 1.4 * etat.k);
        g.beginPath();
        g.moveTo(ecran[0].px, ecran[0].py);
        for (var j = 1; j < ecran.length - 1; j++) {
          var mx = (ecran[j].px + ecran[j + 1].px) / 2;
          var my = (ecran[j].py + ecran[j + 1].py) / 2;
          g.quadraticCurveTo(ecran[j].px, ecran[j].py, mx, my);
        }
        g.stroke();
        peints++;
      });

      // ③ Les grains. Le gros du travail, et le moins cher à l'unité.
      var marge = 6;
      for (var i = 0; i < etat.grains.length; i++) {
        var grain = etat.grains[i];
        var pr = projeter(grain);
        if (!pr) { continue; }
        var px = etat.offX + pr.sx * etat.k;
        var py = etat.offY + pr.sy * etat.k;
        if (px < -marge || px > etat.largeurCSS + marge) { continue; }
        if (py < -marge || py > etat.hauteurCSS + marge) { continue; }
        // 2,6 et non 3,2, plafond 6 et non 9 : mêmes captures, même conclusion.
        // Un grain de neuf pixels n'est plus une étoile lointaine, c'est une
        // étoile — et il entre alors en concurrence avec celles qui portent un
        // nom et une cible.
        var taille = grain.taille * pr.echelle * etat.k * 2.6;
        if (taille < 0.5) { continue; }
        if (taille > 6) { taille = 6; }
        var profondeur = 1;
        if (opts.contrasteProfondeur) {
          profondeur = grain.nappe === 1 ? 1.16 : (grain.nappe === 2 ? 0.92 : 0.68);
        }
        g.globalAlpha = Math.max(0, Math.min(1, grain.eclat * ECLAT_DECOR * (opts.eclat || 1) * profondeur));
        g.drawImage(sprites[grain.teinte], px - taille / 2, py - taille / 2, taille, taille);
        peints++;
      }

      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      return peints;
    }

    // LA DÉGRADATION — le filet de sécurité, et il a été écrit parce que la
    // mesure l'a exigé, pas par précaution. Sur 1670 × 900 avec quarante objets
    // (un pire cas construit ; le produit n'a jamais plus de quatre caps par
    // écran), la cadence est tombée à 44,6 ms — 22 images par seconde — alors
    // que le travail JavaScript ne pesait que 4,67 ms. Le coût n'est donc PAS
    // dans ce module : il est dans ce que le navigateur paie à composer un
    // canvas de six mégapixels et quarante étoiles SVG. On ne peut pas
    // l'optimiser d'ici ; on peut lui rendre de la place.
    // Deux crans, pas davantage : au troisième, ce ne serait plus un ciel.
    function alleger() {
      if (etat.cransPris >= 2) { return false; }
      etat.cransPris += 1;
      // On COUPE dans le champ existant au lieu de le repeupler : les grains
      // restants gardent leur place, donc le ciel s'éclaircit sans se
      // reconfigurer sous les yeux de qui le regarde.
      etat.grains = etat.grains.slice(0, Math.round(etat.grains.length * 0.6));
      return true;
    }

    etat.poser = poser;
    etat.peindre = peindre;
    etat.alleger = alleger;
    etat.crans = function () { return etat.cransPris; };
    etat.versEcran = versEcran;
    // Pour le harnais : la position écran d'un point du monde, selon ce module.
    etat.temoin = function (point, projeter) { return versEcran(projeter(point)); };
    etat.nbGrains = function () { return etat.grains.length; };
    return etat;
  }

  window.UltimaCielFond = {
    creer: creer,
    PIXELS_PAR_GRAIN: PIXELS_PAR_GRAIN,
    GRAINS_MAX: GRAINS_MAX
  };
})();
