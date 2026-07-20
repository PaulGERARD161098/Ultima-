// Ultima — antichambre du quadrant ADRAMELECH (diffusion Léo).
// Le registre des idées DERRIÈRE AUTH, données réelles uniquement :
//   - fail-closed : sans config, sans session ou sur échec API (401), la page
//     n'affiche AUCUNE donnée — seul le cartouche « Authentification requise »
//     est montré (le flux lien-magique vit sur traveler.html) ;
//   - avec session : GET /api/idees (Bearer, même motif qu'appelApi d'app.js)
//     → compteurs par statut, liste des idées, ponts. AUCUNE idée en dur ici :
//     les données personnelles ne viennent QUE de l'API authentifiée (RLS) ;
//   - cartouche Léo réflexif (js/leo-accueil.js, accueillirQuadrant) nourri du
//     bilan déterministe calculé sur la réponse — aucune IA, aucun coût.
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var STATUTS = ['brute', 'à raffiner', 'exploitable', 'close'];
  var LIBELLES_STATUT = {
    'brute': 'Brutes',
    'à raffiner': 'À raffiner',
    'exploitable': 'Exploitables',
    'close': 'Closes'
  };

  function $(selecteur) { return document.querySelector(selecteur); }

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte) { element.textContent = texte; }
    return element;
  }

  // 'YYYY-MM-DD…' (ISO, timestamptz compris) → 'JJ/MM/AAAA'.
  function dateLisible(iso) {
    var jour = String(iso || '').slice(0, 10);
    var morceaux = jour.split('-');
    return morceaux.length === 3 ? morceaux[2] + '/' + morceaux[1] + '/' + morceaux[0] : jour;
  }

  // ---------- Bilan PUR du registre (testable via window.UltimaAdramelech) ----------
  // → { total, parStatut, aRaffiner: { nom, adr_num, depuis } | null }
  function calculerBilan(idees) {
    idees = Array.isArray(idees) ? idees : [];
    var parStatut = {};
    STATUTS.forEach(function (s) { parStatut[s] = 0; });
    idees.forEach(function (idee) {
      if (Object.prototype.hasOwnProperty.call(parStatut, idee.statut)) {
        parStatut[idee.statut] += 1;
      }
    });
    // La plus ancienne idée « à raffiner » (par updated_at) : cible du raffinage.
    var candidates = idees.filter(function (i) { return i.statut === 'à raffiner'; })
      .slice().sort(function (a, b) {
        return String(a.updated_at || '') < String(b.updated_at || '') ? -1 : 1;
      });
    var cible = candidates.length > 0 ? {
      nom: candidates[0].nom || '',
      adr_num: candidates[0].adr_num,
      depuis: String(candidates[0].updated_at || '').slice(0, 10)
    } : null;
    return { total: idees.length, parStatut: parStatut, aRaffiner: cible };
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['adr-chargement', 'adr-auth', 'adr-erreur', 'adr-registre'].forEach(function (nom) {
      var bloc = document.getElementById(nom);
      if (bloc) { bloc.hidden = (nom !== id); }
    });
  }

  // ---------- Rendu du registre (données API uniquement) ----------

  function rendreCompteurs(bilan) {
    var conteneur = $('#adr-compteurs');
    conteneur.textContent = '';
    var total = el('li', 'adr-compteur adr-compteur-total');
    total.appendChild(el('span', 'adr-compteur-nombre', String(bilan.total)));
    total.appendChild(el('span', 'adr-compteur-libelle', bilan.total > 1 ? 'idées' : 'idée'));
    conteneur.appendChild(total);
    STATUTS.forEach(function (statut) {
      var item = el('li', 'adr-compteur');
      item.appendChild(el('span', 'adr-compteur-nombre', String(bilan.parStatut[statut])));
      item.appendChild(el('span', 'adr-compteur-libelle', LIBELLES_STATUT[statut]));
      conteneur.appendChild(item);
    });
  }

  function rendreIdees(idees) {
    var conteneur = $('#adr-idees');
    conteneur.textContent = '';
    if (idees.length === 0) {
      conteneur.appendChild(el('p', 'adr-vide',
        'Le registre est vierge — la première idée dictée l’inaugurera.'));
      return;
    }
    idees.forEach(function (idee) {
      var article = el('article', 'adr-idee');
      article.id = 'adr-idee-' + idee.adr_num;
      article.tabIndex = -1; // cible des propositions de Léo (focus programmatique)
      var entete = el('header', 'adr-idee-entete');
      var titre = el('h3', 'adr-idee-nom');
      titre.appendChild(el('span', 'adr-idee-num', 'ADR-' + String(idee.adr_num).padStart(3, '0')));
      titre.appendChild(document.createTextNode(' ' + (idee.nom || '')));
      entete.appendChild(titre);
      entete.appendChild(el('span', 'adr-idee-statut', idee.statut || ''));
      article.appendChild(entete);
      if (idee.theme) {
        article.appendChild(el('p', 'adr-idee-theme', 'Thème : ' + idee.theme));
      }
      if (idee.epigraphe) {
        article.appendChild(el('p', 'adr-idee-epigraphe', '« ' + idee.epigraphe + ' »'));
      }
      conteneur.appendChild(article);
    });
  }

  function rendrePonts(idees, liens) {
    var conteneur = $('#adr-ponts');
    conteneur.textContent = '';
    if (!Array.isArray(liens) || liens.length === 0) {
      var vide = el('li', 'adr-vide');
      vide.textContent = 'Aucun pont tracé pour l’instant.';
      conteneur.appendChild(vide);
      return;
    }
    function nomIdee(id) {
      var idee = idees.find(function (i) { return i.id === id; });
      return (idee && idee.nom) || 'idée retirée';
    }
    liens.forEach(function (lien) {
      conteneur.appendChild(el('li', 'adr-pont',
        nomIdee(lien.source_id) + ' ↔ ' + nomIdee(lien.target_id)));
    });
  }

  // ---------- Cartouche Léo réflexif (registre ADRAMELECH) ----------

  function saluerParLeo(idees, session) {
    if (!window.UltimaLeo || typeof window.UltimaLeo.accueillirQuadrant !== 'function') { return; }
    var bilan = calculerBilan(idees);

    var archipel = "L'archipel compte " + bilan.total + (bilan.total > 1 ? ' idées' : ' idée') +
      ' (' + bilan.parStatut['à raffiner'] + ' à raffiner, ' +
      bilan.parStatut.exploitable + (bilan.parStatut.exploitable > 1 ? ' exploitables' : ' exploitable') + ').';

    var propositions = [];
    if (bilan.aRaffiner) {
      var cible = bilan.aRaffiner;
      propositions.push({
        message: 'Raffiner « ' + cible.nom + ' » (à raffiner depuis le ' +
          dateLisible(cible.depuis) + ').',
        action: function () {
          var article = document.getElementById('adr-idee-' + cible.adr_num);
          if (article) {
            article.scrollIntoView({ block: 'center' });
            article.focus();
          }
        }
      });
    }
    propositions.push({
      message: 'Capturer une idée neuve — dictez-la à Léo en session.',
      action: null
    });

    window.UltimaLeo.accueillirQuadrant({
      quadrant: 'adramelech',
      blason: 'ouroboros',
      salutation: "Bienvenue, Paul. Voici l'état de l'archipel.",
      sections: [
        { titre: 'Où on en est', classe: 'leo-section-etat', lignes: [archipel] },
        {
          titre: 'Travaux en cours', classe: 'leo-section-travaux',
          // État statique sincère du volet stratégique (registre adramelech/,
          // servi ici sans détail : les données fines restent derrière l'API).
          lignes: ['Volet stratégique : top 3 tranché — MYCÉLIUM, INTENDANT, PROTÉE.']
        }
      ],
      propositions: propositions,
      propositionsVide: 'Rien à trancher aujourd’hui — l’archipel est en ordre.',
      // L2 : la voix (session déjà exigée par le flux — antichambre auth).
      voix: (session && session.access_token)
        ? { quadrant: 'adramelech', jeton: session.access_token }
        : null
    });
  }

  // ---------- Flux : session → API → registre (fail-closed partout) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function chargerRegistre(session) {
    var reponse;
    try {
      reponse = await fetch('/api/idees', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + session.access_token
        }
      });
    } catch (e) {
      montrer('adr-erreur');
      return;
    }
    if (reponse.status === 401) { montrer('adr-auth'); return; } // fail-closed
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      montrer('adr-erreur');
      return;
    }
    var idees = (corps.data && corps.data.idees) || [];
    var liens = (corps.data && corps.data.liens) || [];
    rendreCompteurs(calculerBilan(idees));
    rendreIdees(idees);
    rendrePonts(idees, liens);
    montrer('adr-registre');
    saluerParLeo(idees, session);
  }

  async function demarrer() {
    montrer('adr-chargement');
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('adr-auth'); // pas de mode démo ici : données perso uniquement
      return;
    }
    var cfg = window.ULTIMA_CONFIG;
    var session = null;
    try {
      var client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      var resultat = await client.auth.getSession();
      session = (resultat && resultat.data && resultat.data.session) || null;
    } catch (e) {
      session = null;
    }
    if (!session || !session.access_token) {
      montrer('adr-auth');
      return;
    }
    await chargerRegistre(session);
  }

  window.UltimaAdramelech = { calculerBilan: calculerBilan };

  demarrer().catch(function () { montrer('adr-erreur'); });
})();
