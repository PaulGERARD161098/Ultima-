// Ultima — LA DICTÉE VOCALE (Web Speech API), composant partagé.
// Extrait tel quel de js/app.js (v3-④/v3-⑥) le 2026-07-30 (boucle ④) pour être
// réutilisé par le cartouche de Léo sur les autres quadrants : le code du
// composant est INCHANGÉ, seules ses deux dépendances au shell de RIVEN sont
// découplées (la région d'annonce se crée à la demande ; le toast devient un
// signal injectable, muet par défaut).
//
// Progressive enhancement : API absente (Firefox…) → aucun bouton, zéro bruit.
// Règles : la dictée AJOUTE (jamais ne remplace, sauf option), le champ n'est
// jamais bloqué (le clavier a toujours le dernier mot), une seule écoute à la
// fois. Vie privée : aucune transcription ni valeur de champ en console/logs.
//
// API publique (window.UltimaDictee) :
//   disponible()                       → true si le navigateur sait dicter ;
//   configurer({ signaler })           → branche un toast (optionnel) ;
//   attacher(champ, libelle, options)  → adjoint le micro au champ.
(function () {
  'use strict';

  // Signal utilisateur : injecté par le shell qui en a un (RIVEN), muet ailleurs.
  var signaler = function () {};

  // Fabrique SVG (reprise de js/app.js : le composant doit être autonome).
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgElement(nom, attributs) {
    var noeud = document.createElementNS(SVG_NS, nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      noeud.setAttribute(cle, attributs[cle]);
    });
    return noeud;
  }

  // Région d'annonce partagée (aria-live), créée à la première dictée.
  function assurerRegion() {
    var region = document.getElementById('statut-dictee');
    if (region) { return region; }
    region = document.createElement('div');
    region.id = 'statut-dictee';
    region.className = 'visuellement-cache';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
    return region;
  }


  var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  var dicteeCourante = null;     // une seule écoute globale, jamais de doublon
  var DICTEE_TIMEOUT_MS = 30000; // filet : 30 s sans un mot → arrêt, jamais d'écoute fantôme
  // RELANCE (08/10/2026) : le navigateur coupe l'écoute après chaque phrase. Une
  // coupure qui suit des mots est une PAUSE : l'écoute est rouverte aussitôt et la
  // dictée continue à la suite. Une écoute qui n'a rien entendu est la vraie fin.
  // Plafond : jamais de boucle si le navigateur rend la main aussitôt ouverte.
  var RELANCES_MAX = 40;

  // Concatène deux morceaux dictés : une espace entre eux, jamais deux.
  function joindre(a, b) {
    if (!a || !b) { return a + b; }
    return /\s$/.test(a) || /^\s/.test(b) ? a + b : a + ' ' + b;
  }

  function annoncerDictee(message) {
    var region = assurerRegion();
    if (region) { region.textContent = message; }
  }

  // Icône micro (spec graphisme) : capsule + arc de captation + pied.
  function svgMicro() {
    var svg = svgElement('svg', {
      viewBox: '0 0 24 24', width: '22', height: '22', 'aria-hidden': 'true',
      fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    svg.appendChild(svgElement('rect', { x: '9', y: '3.5', width: '6', height: '11', rx: '3' }));
    svg.appendChild(svgElement('path', { d: 'M5.5 11.5 a6.5 6.5 0 0 0 13 0' }));
    svg.appendChild(svgElement('path', { d: 'M12 18 v2.5 M9 20.5 h6' }));
    return svg;
  }

  // Composant unique : enveloppe un champ texte et lui adjoint le bouton micro.
  // options.remplacer (v3-⑥, champ de recherche) : chaque dictée REMPLACE le
  // contenu du champ — une recherche est UNE intention, pas un texte composé.
  // Défaut (sans option) : ajout, comportement v3-④ inchangé.
  function attacherDictee(champ, libelle, options) {
    if (!Reco || !champ || champ.dataset.dicteeAttachee === 'oui') { return; }
    champ.dataset.dicteeAttachee = 'oui';
    if (options && options.remplacer) { champ.dataset.dicteeMode = 'remplacement'; }
    if (!libelle) {
      libelle = champ.getAttribute('aria-label') || '';
      if (!libelle && champ.id) {
        var etiquette = document.querySelector('label[for="' + champ.id + '"]');
        libelle = etiquette ? etiquette.textContent.replace(/\s*\*\s*$/, '').trim() : '';
      }
    }

    var enveloppe = document.createElement('div');
    enveloppe.className = 'champ-vocal';
    champ.parentNode.insertBefore(enveloppe, champ);
    enveloppe.appendChild(champ);

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'bouton-micro';
    bouton.title = 'Dicter';
    bouton.setAttribute('aria-label', 'Dicter — ' + libelle);
    bouton.setAttribute('aria-pressed', 'false');
    bouton.appendChild(svgMicro());
    enveloppe.appendChild(bouton);

    // Ligne d'état visible : double codage couleur + texte pendant l'écoute.
    var etatLigne = document.createElement('p');
    etatLigne.className = 'etat-vocal';
    etatLigne.hidden = true;
    enveloppe.insertAdjacentElement('afterend', etatLigne);

    bouton.addEventListener('click', function () {
      basculerDictee(champ, bouton, etatLigne);
    });

    // Le clavier a toujours le dernier mot : frappe pendant l'écoute → arrêt,
    // interim retiré, texte finalisé et frappe conservés (isTrusted écarte
    // l'évènement input que le composant émet lui-même à la fin).
    champ.addEventListener('keydown', function (evenement) {
      if (evenement.isTrusted && dicteeCourante && dicteeCourante.champ === champ) {
        dicteeCourante.annuler(false);
      }
    });
    champ.addEventListener('input', function (evenement) {
      // Collage, autocomplétion… : la valeur posée par Paul reste telle quelle.
      if (evenement.isTrusted && dicteeCourante && dicteeCourante.champ === champ) {
        dicteeCourante.annuler(true);
      }
    });
  }

  function basculerDictee(champ, bouton, etatLigne) {
    if (dicteeCourante) {
      // Phase de démarrage (entre start() et onstart) : taps ignorés.
      if (!dicteeCourante.demarree) { return; }
      if (dicteeCourante.bouton === bouton) {
        // Re-tap : arrêt, le résultat déjà prononcé est conservé et inséré.
        dicteeCourante.arreter();
        return;
      }
      // Autre champ : l'écoute en cours s'arrête proprement, puis celle-ci démarre.
      dicteeCourante.arreter();
    }
    demarrerDictee(champ, bouton, etatLigne);
  }

  function demarrerDictee(champ, bouton, etatLigne) {

    var remplacer = champ.dataset.dicteeMode === 'remplacement';
    var base = champ.value;
    var separateur = base && !/\s$/.test(base) ? ' ' : '';

    var session = {
      champ: champ,
      bouton: bouton,
      demarree: false,
      terminee: false,
      finalise: '',
      interim: '',
      plafondSignale: false,
      minuteur: null,
      reco: null,          // l'écoute en cours ; une nouvelle à chaque relance
      relances: 0,
      finDemandee: false   // re-tap de Paul : la coupure qui suit ne relance pas
    };

    // Le filet se réarme à chaque mot : il borne le silence, pas la longueur de la dictée.
    function armerMinuteur() {
      if (session.minuteur) { clearTimeout(session.minuteur); }
      session.minuteur = setTimeout(function () { session.arreter(); }, DICTEE_TIMEOUT_MS);
    }

    // Tronque au maxlength du champ (l'affectation programmatique l'ignore).
    function plafonner(valeur) {
      var max = champ.maxLength;
      if (max > 0 && valeur.length > max) {
        valeur = valeur.slice(0, max);
        if (!session.plafondSignale) {
          session.plafondSignale = true;
          signaler('Limite de texte atteinte.', 'erreur');
        }
      }
      return valeur;
    }

    // Valeur affichée. Mode ajout (défaut) : base + séparateur + dicté.
    // Mode remplacement : le texte dicté remplace tout — mais tant que rien
    // n'est dicté (ou en cas d'erreur), la valeur d'origine reste intacte.
    function afficher() {
      var texte = joindre(session.finalise, session.interim);
      if (remplacer) {
        champ.value = texte ? plafonner(texte) : base;
      } else {
        champ.value = texte ? plafonner(base + separateur + texte) : base;
      }
    }

    function curseurEnFin() {
      var fin = champ.value.length;
      try { champ.setSelectionRange(fin, fin); } catch (e) { /* champ non sélectionnable */ }
    }

    function reposUi() {
      bouton.setAttribute('aria-pressed', 'false');
      bouton.classList.remove('ecoute');
      etatLigne.hidden = true;
      etatLigne.textContent = '';
      if (dicteeCourante === session) { dicteeCourante = null; }
    }

    function clore() {
      if (session.minuteur) { clearTimeout(session.minuteur); session.minuteur = null; }
      session.terminee = true;
      reposUi();
    }

    // Fin nominale : texte posé, curseur en fin, écouteurs du champ prévenus.
    function finaliser() {
      if (session.terminee) { return; }
      clore();
      afficher(); // un interim sans final est conservé (mieux qu'une perte)
      curseurEnFin();
      annoncerDictee('Dictée terminée.');
      champ.dispatchEvent(new Event('input', { bubbles: true }));
    }

    session.arreter = function () {
      if (session.terminee) { return; }
      session.finDemandee = true;
      reposUi(); // repos immédiat : jamais deux écoutes affichées à la fois
      try { session.reco.stop(); } catch (e) { finaliser(); }
    };

    session.annuler = function (garderValeur) {
      if (session.terminee) { return; }
      clore();
      try { session.reco.abort(); } catch (e) { /* déjà arrêté */ }
      if (!garderValeur) {
        session.interim = ''; // l'interim est retiré, le finalisé est conservé
        afficher();
        curseurEnFin();
      }
      annoncerDictee('Dictée terminée.');
    };

    function nouvelleEcoute() {
      var reco = new Reco();
      var entenduIci = false;
      session.reco = reco;
      reco.lang = 'fr-FR';
      reco.continuous = false;      // le navigateur coupe sur silence ; la relance prend le relais
      reco.interimResults = true;   // les mots apparaissent pendant que Paul parle
      reco.maxAlternatives = 1;

      reco.onstart = function () { session.demarree = true; };

      reco.onresult = function (evenement) {
        if (session.terminee || reco !== session.reco) { return; }
        var interim = '';
        for (var i = evenement.resultIndex; i < evenement.results.length; i++) {
          var resultat = evenement.results[i];
          var transcription = (resultat[0] && resultat[0].transcript) || '';
          if (transcription.trim()) { entenduIci = true; }
          if (resultat.isFinal) { session.finalise = joindre(session.finalise, transcription); } else { interim += transcription; }
        }
        session.interim = interim;
        armerMinuteur();
        afficher();
      };

      reco.onerror = function (evenement) {
        var code = (evenement && evenement.error) || '';
        if (session.terminee || code === 'aborted' || reco !== session.reco) { return; }
        // Silence après une relance : ce n'est pas une erreur, c'est la fin de la dictée.
        if (code === 'no-speech' && (session.finalise || session.interim)) { finaliser(); return; }
        clore();
        session.interim = ''; // jamais d'interim fantôme
        afficher();
        curseurEnFin();
        bouton.classList.add('erreur');
        setTimeout(function () { bouton.classList.remove('erreur'); }, 1200);
        if (code === 'no-speech') {
          signaler("Je n'ai rien entendu. Touchez le micro et réessayez.", 'erreur');
        } else if (code === 'not-allowed' || code === 'service-not-allowed') {
          signaler('Micro refusé. Autorisez le micro dans les réglages du navigateur, ou tapez votre texte.', 'erreur');
        } else if (code === 'network') {
          signaler('Pas de réseau : la dictée du navigateur en a besoin. Votre texte est gardé ; utilisez le micro du clavier.', 'erreur');
        } else {
          signaler("La dictée n'a pas abouti. Réessayez, ou tapez votre texte.", 'erreur');
        }
      };

      reco.onend = function () {
        if (session.terminee || reco !== session.reco) { return; }
        if (!session.finDemandee && entenduIci && session.relances < RELANCES_MAX) {
          session.relances += 1;
          // L'interim non finalisé de l'écoute close est gardé : la suite s'écrit derrière.
          if (session.interim) { session.finalise = joindre(session.finalise, session.interim); session.interim = ''; }
          try { nouvelleEcoute().start(); return; } catch (e) { /* le navigateur refuse : fin nominale */ }
        }
        finaliser();
      };
      return reco;
    }

    dicteeCourante = session;
    bouton.setAttribute('aria-pressed', 'true');
    bouton.classList.add('ecoute');
    etatLigne.textContent = 'Je vous écoute…';
    etatLigne.hidden = false;
    annoncerDictee('Je vous écoute…');
    armerMinuteur();
    try {
      nouvelleEcoute().start(); // la demande d'autorisation micro n'arrive qu'ici, jamais au chargement
    } catch (e) {
      clore();
      signaler("La dictée n'a pas abouti. Réessayez, ou tapez votre texte.", 'erreur');
    }
  }

  window.UltimaDictee = {
    disponible: function () { return Boolean(Reco); },
    configurer: function (options) {
      if (options && typeof options.signaler === 'function') { signaler = options.signaler; }
    },
    attacher: attacherDictee
  };
})();
