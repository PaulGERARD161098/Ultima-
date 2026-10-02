// Ultima — Léo, cartouche d'accueil des quadrants (boucles L1/diffusion, L2).
// Le majordome « juste » : à l'entrée dans un quadrant, un cartouche au
// registre antique récapitule l'état avec des règles déterministes, nourri de
// l'état déjà chargé par la page (jamais d'un second fetch de données).
// Boucle L2 (la voix) : si l'appelant fournit une session réelle via
// config.voix = { quadrant, jeton }, une zone « Parler à Léo » s'ajoute —
// appel réseau vers POST /api/leo (IA côté serveur).
// Boucle « lecture » (les yeux, 2026-07-30) : config.voix.etat — comptes et
// intitulés bornés, calculés par le quadrant appelant, joints à chaque tour
// pour que Léo sache répondre « où j'en suis ». Jamais de contenu (page de
// journal, texte de flamme, déroulé de scénario), jamais d'identifiant.
// Boucle L2b (les mains) : config.voix.candidats ({ cibles, chantiers,
// idees, prochainAdrNum } — tableaux { id, libelle } minimaux, données déjà
// chargées par le quadrant) permet d'exécuter, APRÈS confirmation explicite
// de Paul sur une carte au rendu déterministe (reformulation serveur), la
// proposition d'action de Léo via les API d'écriture EXISTANTES (Bearer de
// session). L'IA ne fait que proposer ; aucun outil de suppression.
// Fail-closed : pas de session → cartouche muet, comportement L1 inchangé.
//
// Deux entrées publiques :
//   - accueillir(donnees, actions)  — RIVEN, comportement historique intact
//     (clé sessionStorage d'origine, mêmes règles, même DOM) ;
//   - accueillirQuadrant({quadrant, blason, salutation, sections,
//     propositions}) — le même rendu (dialog accessible, une fois par session
//     PAR quadrant, focus piégé, Échap, fail-closed) pour les autres
//     quadrants ; le CALCUL du récap reste à la charge de chaque quadrant.
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  var CLE_SESSION = 'ultima-leo-accueil-vu'; // RIVEN — clé historique, gardée
  var SVG_NS = 'http://www.w3.org/2000/svg';
  // B1 ④ : forme d'une trace et d'une cible de journal (mêmes motifs que
  // api/_lib/leo-journal.js — le serveur re-vérifie, ceci n'est qu'un tri).
  var UUID_MOTIF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // ---------- Fonctions PURES (testables via window.UltimaLeo) ----------

  // Date locale au format ISO 'YYYY-MM-DD' (même règle que js/app.js).
  function dateLocaleIso() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // Écart en jours entre une échéance ISO et aujourd'hui (positif = retard).
  function joursDeRetard(echeanceIso, aujourdHuiIso) {
    var a = new Date(echeanceIso + 'T00:00:00');
    var b = new Date(aujourdHuiIso + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function tronquer(texte, max) {
    texte = texte || '';
    return texte.length > max ? texte.slice(0, max) + '…' : texte;
  }

  // 'YYYY-MM-DD' → 'JJ/MM/AAAA' (même forme que dateLisible de js/app.js).
  function dateLisible(iso) {
    if (!iso) { return ''; }
    var morceaux = iso.split('-');
    return morceaux.length === 3 ? morceaux[2] + '/' + morceaux[1] + '/' + morceaux[0] : iso;
  }

  function trouverNoeud(donnees, id) {
    return (donnees.noeuds || []).find(function (n) { return n.id === id; }) || null;
  }

  function nomNoeud(donnees, id) {
    var noeud = trouverNoeud(donnees, id);
    return (noeud && noeud.nom) || 'nœud supprimé';
  }

  function trouverRelation(donnees, id) {
    return (donnees.relations || []).find(function (r) { return r.id === id; }) || null;
  }

  // Libellé court de la cible d'une entrée (même règle que libelleCibleEntree).
  function libelleCible(donnees, entree) {
    if (entree.node_id) { return nomNoeud(donnees, entree.node_id); }
    var relation = trouverRelation(donnees, entree.edge_id);
    if (!relation) { return 'nœud supprimé'; }
    return nomNoeud(donnees, relation.source_id) + ' ↔ ' + nomNoeud(donnees, relation.target_id);
  }

  // Nœud à ouvrir pour une relation : source, repli cible (même règle qu'app.js).
  function noeudCibleRelation(donnees, relation) {
    if (trouverNoeud(donnees, relation.source_id)) { return relation.source_id; }
    if (trouverNoeud(donnees, relation.target_id)) { return relation.target_id; }
    return null;
  }

  function noeudCibleEntree(donnees, entree) {
    if (entree.node_id && trouverNoeud(donnees, entree.node_id)) { return entree.node_id; }
    var relation = trouverRelation(donnees, entree.edge_id);
    return relation ? noeudCibleRelation(donnees, relation) : null;
  }

  // Tri des relances : échéance la plus ancienne d'abord (règle de l'Accueil).
  function trierRelances(a, b) {
    if (a.relance_at !== b.relance_at) { return a.relance_at < b.relance_at ? -1 : 1; }
    var da = a.date_entree || '';
    var db = b.date_entree || '';
    return da < db ? -1 : (da > db ? 1 : 0);
  }

  // Récapitulatif déterministe de Léo, calculé sur l'état chargé (PUR : aucune
  // lecture du DOM ni du réseau). `aujourdHui` est injectable pour les tests.
  // → { dernierJournal, retard, duJour, leadsActifs, propositions }
  function calculerRecap(donnees, aujourdHui) {
    donnees = donnees || {};
    var journal = donnees.journal || [];
    var noeuds = donnees.noeuds || [];
    var relations = donnees.relations || [];
    aujourdHui = aujourdHui || dateLocaleIso();

    // Où on en est : la dernière entrée de journal.
    var derniere = null;
    journal.forEach(function (j) {
      if (!derniere || (j.date_entree || '') > (derniere.date_entree || '')) { derniere = j; }
    });
    var dernierJournal = derniere ? {
      date: derniere.date_entree || '',
      note: tronquer(derniere.note || '', 140),
      cible: libelleCible(donnees, derniere)
    } : null;

    // Relances dues (mêmes règles que relancesDues de l'Accueil), scindées
    // en « en retard » (strictement avant aujourd'hui) et « du jour ».
    var dues = journal.filter(function (j) {
      return j.relance_at && j.relance_at <= aujourdHui && !j.relance_faite;
    }).sort(trierRelances);
    var enRetard = dues.filter(function (j) { return j.relance_at < aujourdHui; });
    var duJour = dues.filter(function (j) { return j.relance_at === aujourdHui; });

    // Leads à suivre : type lead, ni terminé ni inactif.
    var leadsActifs = noeuds.filter(function (n) {
      return n.type === 'lead' && n.statut !== 'termine' && n.statut !== 'inactif';
    }).length;

    // Propositions (1-3), priorisées et déterministes.
    var propositions = [];

    // 0. INTENDANT (AD-5c-δ) : s'il existe des alertes J-2, le manquant le
    //    plus urgent passe en tête, avant les relances. Fail-soft : pas de
    //    données intendant → comportement historique inchangé.
    var alertesJ2 = (donnees.intendant && Array.isArray(donnees.intendant.alertes_j2))
      ? donnees.intendant.alertes_j2.slice() : [];
    if (alertesJ2.length > 0) {
      alertesJ2.sort(function (a, b) {
        if (a.date_pose !== b.date_pose) { return a.date_pose < b.date_pose ? -1 : 1; }
        if (a.manquants !== b.manquants) { return b.manquants - a.manquants; }
        return nomNoeud(donnees, a.node_id).localeCompare(nomNoeud(donnees, b.node_id), 'fr');
      });
      var urgente = alertesJ2[0];
      var joursPose = -joursDeRetard(urgente.date_pose, aujourdHui);
      var quandPose = joursPose <= 0 ? "aujourd'hui"
        : 'dans ' + joursPose + (joursPose > 1 ? ' jours' : ' jour');
      propositions.push({
        genre: 'intendance',
        message: 'Chantier « ' + nomNoeud(donnees, urgente.node_id) + ' » — pose ' +
          quandPose + ', ' + urgente.manquants +
          (urgente.manquants > 1 ? ' manquants' : ' manquant') + ". Compléter l'intendance.",
        nodeId: urgente.node_id
      });
    }

    // 1. La relance la plus en retard.
    if (enRetard.length > 0) {
      var pire = enRetard[0];
      var retardJours = joursDeRetard(pire.relance_at, aujourdHui);
      propositions.push({
        genre: 'retard',
        message: 'Relancer « ' + libelleCible(donnees, pire) + ' » — en retard de ' +
          retardJours + (retardJours > 1 ? ' jours.' : ' jour.'),
        nodeId: noeudCibleEntree(donnees, pire)
      });
    }

    // 2. La relance du jour.
    if (duJour.length > 0 && propositions.length < 3) {
      var jour = duJour[0];
      var etape = jour.prochaine_etape || tronquer(jour.note || '', 80);
      propositions.push({
        genre: 'jour',
        message: "Aujourd'hui : « " + etape + ' » (' + libelleCible(donnees, jour) + ').',
        nodeId: noeudCibleEntree(donnees, jour)
      });
    }

    // 3. Idée dormante (règle U9 de l'Accueil : statut « idée », aucune
    //    entrée de journal depuis 14 jours).
    if (propositions.length < 3) {
      var seuil = new Date(aujourdHui + 'T00:00:00');
      seuil.setDate(seuil.getDate() - 14);
      var seuilIso = seuil.getFullYear() + '-' +
        String(seuil.getMonth() + 1).padStart(2, '0') + '-' +
        String(seuil.getDate()).padStart(2, '0');
      var dormantes = relations.filter(function (r) {
        if (r.statut !== 'idee') { return false; }
        return !journal.some(function (j) {
          return j.edge_id === r.id && j.date_entree >= seuilIso;
        });
      }).sort(function (a, b) {
        return nomNoeud(donnees, a.source_id).localeCompare(nomNoeud(donnees, b.source_id), 'fr');
      });
      if (dormantes.length > 0) {
        var dormante = dormantes[0];
        propositions.push({
          genre: 'dormante',
          message: "L'idée « " + nomNoeud(donnees, dormante.source_id) + ' ↔ ' +
            nomNoeud(donnees, dormante.target_id) + ' » dort depuis plus de 14 jours.',
          nodeId: noeudCibleRelation(donnees, dormante)
        });
      }
    }

    return {
      dernierJournal: dernierJournal,
      retard: enRetard.length,
      duJour: duJour.length,
      leadsActifs: leadsActifs,
      propositions: propositions.slice(0, 3)
    };
  }

  // ---------- Les mains de Léo (L2b) : résolution et gabarits (PURS) ----------

  // Normalisation d'une référence dictée : accents ôtés, casse pliée,
  // espaces réduits — comparaison tolérante mais DÉTERMINISTE.
  function normaliserRef(texte) {
    return String(texte || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Résolution déterministe d'une référence dictée vers un candidat local
  // ({ id, libelle }) : égalité exacte d'abord, sinon inclusion UNIQUE.
  // Plusieurs libellés d'un MÊME id (nom + numéro ADR-n) comptent pour un.
  // 0 candidat → introuvable ; >1 → ambigu (jamais de choix hasardeux).
  // → { ok:true, candidat } | { ok:false, raison:'introuvable'|'ambigu' }
  function resoudreRef(ref, candidats) {
    var cible = normaliserRef(ref);
    if (!cible || !Array.isArray(candidats)) { return { ok: false, raison: 'introuvable' }; }
    var valides = candidats.filter(function (c) {
      return c && typeof c === 'object' &&
        typeof c.id === 'string' && c.id.length > 0 &&
        typeof c.libelle === 'string' && c.libelle.length > 0;
    });
    function departager(liste) {
      var parId = {};
      liste.forEach(function (c) { if (!parId[c.id]) { parId[c.id] = c; } });
      var ids = Object.keys(parId);
      if (ids.length === 1) { return { ok: true, candidat: parId[ids[0]] }; }
      return { ok: false, raison: ids.length === 0 ? 'introuvable' : 'ambigu' };
    }
    var exacts = valides.filter(function (c) { return normaliserRef(c.libelle) === cible; });
    if (exacts.length > 0) { return departager(exacts); }
    var inclus = valides.filter(function (c) {
      return normaliserRef(c.libelle).indexOf(cible) !== -1;
    });
    return departager(inclus);
  }

  // Écho d'issue renvoyé au MODÈLE : borné. Une page du journal intime va
  // jusqu'à 20 000 caractères ; son écho entier dépassait MAX_MESSAGE_CHARS
  // (4 000, api/_lib/leo.js) et faisait refuser le tour suivant (400) jusqu'au
  // rechargement — sur la carte depuis L2b, et désormais sans clic (B1 ④).
  // La bulle montre TOUT à Paul ; le modèle n'a besoin que de savoir ce qui a
  // été fait. Relevé par la revue du 30/09. PUR.
  var MAX_ECHO_ISSUE = 1000;
  function echoBorne(message) {
    var texte = String(message || '');
    return texte.length <= MAX_ECHO_ISSUE ? texte : texte.slice(0, MAX_ECHO_ISSUE - 2) + '…]';
  }

  // S1 (revue du 30/09) : sans carte, plus rien ne NOMME la cible résolue
  // avant l'acte. Une résolution par INCLUSION (« Marc » → « Jean-Marc
  // Petit ») exige donc l'œil de Paul : seule l'égalité exacte (modulo casse
  // et accents) s'exécute sans clic. Une proposition sans *_ref (création)
  // n'a pas de cible à confondre. PUR.
  function cibleExacte(proposition, plan) {
    var args = (proposition && proposition.args) || {};
    var refs = Object.keys(args).filter(function (cle) { return /_ref$/.test(cle); });
    if (refs.length === 0) { return true; }
    if (!plan || typeof plan.cible !== 'string' || !plan.cible) { return false; }
    return refs.every(function (cle) {
      return normaliserRef(args[cle]) === normaliserRef(plan.cible);
    });
  }

  // Garde-fou client : une proposition serveur doit porter outil (string),
  // reformulation (string non vide) et args (objet de strings). Toute forme
  // douteuse est IGNORÉE (fail-safe : jamais de carte douteuse).
  function propositionRecevable(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) { return false; }
    if (typeof p.outil !== 'string' || !p.outil) { return false; }
    if (typeof p.reformulation !== 'string' || !p.reformulation.trim()) { return false; }
    if (!p.args || typeof p.args !== 'object' || Array.isArray(p.args)) { return false; }
    return Object.keys(p.args).every(function (cle) {
      return typeof p.args[cle] === 'string';
    });
  }

  function messageEchecEcriture(resultat) {
    if (resultat && resultat.statut === 409) {
      return '[Action en conflit avec les données existantes. Rechargez la cible et réconciliez les ajouts avant une nouvelle confirmation.]';
    }
    if (resultat && resultat.statut >= 400 && resultat.statut < 500 &&
        resultat.corps && resultat.corps.ok === false) {
      return '[Action refusée par le serveur. Vérifiez les données et les droits avant une nouvelle proposition.]';
    }
    return '[Résultat de l’action inconnu : elle a peut-être été enregistrée. Vérifiez la cible avant toute nouvelle tentative ; si le doute persiste, ne rejouez pas l’action.]';
  }

  // Les refus du serveur, dits à Paul. ⛔ Liste FERMÉE, alignée sur
  // `REFUS_DEFAIRE` (api/_lib/leo-execution.js) : un message inconnu tombe
  // sur la phrase prudente, jamais sur le texte brut du serveur.
  var NE_SUR_LA_CIBLE = {
    flammes: 'une flamme y est née depuis',
    idees_liens: 'un lien a été tissé avec une autre idée',
    serment_liens: 'une passerelle y a été posée',
    scenario_liens: 'une passerelle y a été posée',
    scenarios: 'un scénario y est né',
    situations: 'il a été marqué « advenu »'
  };
  function messageRefusDefaire(resultat) {
    var erreur = resultat && resultat.corps && typeof resultat.corps.error === 'string'
      ? resultat.corps.error : '';
    var propre = function (table, cle) { return Object.prototype.hasOwnProperty.call(table, cle); };
    if (erreur.indexOf('Lié : ') === 0 && propre(NE_SUR_LA_CIBLE, erreur.slice(6))) {
      return 'Je ne peux pas le défaire : ' + NE_SUR_LA_CIBLE[erreur.slice(6)] +
        '. Le défaire l’effacerait avec. Rien n’a été retiré.';
    }
    var connus = {
      'Retouchée depuis': 'Je ne peux pas le défaire : tu l’as retouché depuis, et le défaire effacerait ta retouche. Rien n’a été retiré.',
      'Déjà défait': 'C’est déjà défait.',
      'Cible introuvable': 'Il n’existe plus : rien à défaire.',
      'Rien à défaire': 'Le journal ne l’a pas noté comme fait : je ne peux pas le défaire d’ici. Rien n’a été retiré.',
      'Ce geste ne se défait pas': 'Ce geste ne se défait pas. Rien n’a été retiré.'
    };
    if (resultat && resultat.statut >= 400 && resultat.statut < 500 && propre(connus, erreur)) { return connus[erreur]; }
    if (resultat && resultat.statut >= 400 && resultat.statut < 500) {
      return 'Je n’ai pas pu le défaire. Rien n’a été retiré.';
    }
    // Une réponse perdue ne prouve rien : la suppression a pu avoir lieu.
    return 'Je ne sais pas si c’est défait : la réponse s’est perdue. Regarde « Ce que Léo a fait » avant de recommencer.';
  }

  // Gabarits d'exécution (L2b) : traduit une proposition confirmable en appel
  // EXACT vers l'API d'écriture existante (contrats /api/idees/items,
  // /api/intendant/besoins, /api/reseau/journal). PUR : aucun réseau ici.
  // candidats = { cibles?, chantiers?, idees?, prochainAdrNum? } fournis par
  // le quadrant appelant (données déjà chargées — jamais refetchées).
  // → { ok:true, url, methode, corps } | { ok:false, raison } (raison
  //   générique : 'introuvable' | 'ambigu' | 'invalide' — jamais de détail).
  function construirePlanExecution(proposition, candidats) {
    candidats = candidats || {};
    var args = (proposition && proposition.args) || {};
    var outil = proposition && proposition.outil;

    if (outil === 'proposer_idee') {
      // adr_num : imposé localement (prochain numéro du registre chargé).
      var prochain = candidats.prochainAdrNum;
      if (typeof prochain !== 'number' || !isFinite(prochain) ||
          prochain < 1 || prochain !== Math.floor(prochain)) {
        return { ok: false, raison: 'invalide' };
      }
      // Borne alignée sur l'API (nom ≤ 120) : jamais de troncature silencieuse —
      // ce que la carte affiche est exactement ce qui sera stocké [S-L2b-3].
      if (typeof args.titre !== 'string' || !args.titre || args.titre.length > 119) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsIdee = { adr_num: prochain, nom: args.titre, type: 'capture' };
      if (args.theme) { corpsIdee.theme = args.theme; }
      if (args.resume) { corpsIdee.essence = args.resume; }
      return { ok: true, url: '/api/idees/items', methode: 'POST', corps: corpsIdee };
    }

    if (outil === 'proposer_enrichissement_idee') {
      var idee = resoudreRef(args.idee_ref, candidats.idees);
      if (!idee.ok) { return idee; }
      if (typeof args.ajout !== 'string' || !args.ajout) { return { ok: false, raison: 'invalide' }; }
      // ENRICHIR = ajouter à l'essence existante, jamais l'écraser (le
      // catalogue L2b n'a aucun outil destructeur, l'écrasement en serait un).
      var attendue = idee.candidat.essence;
      if (attendue !== null && typeof attendue !== 'string') {
        return { ok: false, raison: 'invalide' };
      }
      var existante = attendue === null ? '' : attendue;
      var essence = existante ? existante + '\n\n' + args.ajout : args.ajout;
      if (essence.length > 2000) { return { ok: false, raison: 'invalide' }; }
      return {
        ok: true, url: '/api/idees/items', methode: 'PATCH',
        corps: { id: idee.candidat.id, essence: essence, essence_attendue: attendue },
        cible: idee.candidat.libelle
      };
    }

    if (outil === 'proposer_besoin') {
      var chantier = resoudreRef(args.chantier_ref, candidats.chantiers);
      if (!chantier.ok) { return chantier; }
      if (typeof args.libelle !== 'string' || !args.libelle) { return { ok: false, raison: 'invalide' }; }
      var corpsBesoin = { chantier_id: chantier.candidat.id };
      var designation = args.libelle;
      // Quantité dictée : « 12 sacs » → quantité numérique + unité si
      // lisibles ; sinon la mention rejoint la désignation (jamais perdue,
      // jamais devinée). Règle déterministe, visible avant confirmation.
      if (args.quantite) {
        var morceaux = args.quantite.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
        var nombre = morceaux ? Number(morceaux[1].replace(',', '.')) : NaN;
        if (morceaux && isFinite(nombre) && nombre > 0 && morceaux[2].length <= 20) {
          corpsBesoin.quantite = nombre;
          if (morceaux[2]) { corpsBesoin.unite = morceaux[2]; }
        } else {
          designation += ' — ' + args.quantite;
        }
      }
      // L'API des besoins n'a pas de champ d'échéance libre : la date dictée
      // reste portée par la désignation (déterministe, lisible).
      if (args.echeance) { designation += ' (pour le ' + dateLisible(args.echeance) + ')'; }
      if (designation.length > 200) { return { ok: false, raison: 'invalide' }; }
      corpsBesoin.designation = designation;
      return {
        ok: true, url: '/api/intendant/besoins', methode: 'POST',
        corps: corpsBesoin, cible: chantier.candidat.libelle
      };
    }

    if (outil === 'proposer_journal' || outil === 'proposer_relance') {
      var cible = resoudreRef(args.cible_ref, candidats.cibles);
      if (!cible.ok) { return cible; }
      if (outil === 'proposer_journal') {
        if (typeof args.texte !== 'string' || !args.texte) { return { ok: false, raison: 'invalide' }; }
        return {
          ok: true, url: '/api/reseau/journal', methode: 'POST',
          corps: { node_id: cible.candidat.id, note: args.texte },
          cible: cible.candidat.libelle
        };
      }
      if (typeof args.echeance !== 'string' || !args.echeance) { return { ok: false, raison: 'invalide' }; }
      // Contrat journal : une relance exige note + prochaine étape. La note
      // dictée nourrit les deux ; à défaut, libellés déterministes sobres.
      return {
        ok: true, url: '/api/reseau/journal', methode: 'POST',
        corps: {
          node_id: cible.candidat.id,
          note: args.note || ('Relance programmée pour le ' + dateLisible(args.echeance) + '.'),
          prochaine_etape: args.note || 'Relancer',
          relance_at: args.echeance
        },
        cible: cible.candidat.libelle
      };
    }

    // ---- IMLADRIK (boucle ④, 2026-07-30) : les 3 caps. Mêmes règles que
    // ci-dessus — bornes alignées sur les validateurs serveur (jamais de
    // troncature silencieuse : ce que la carte affiche est ce qui sera
    // stocké), résolution des *_ref côté front, aucun outil destructeur.
    if (outil === 'proposer_page_journal') {
      if (typeof args.contenu !== 'string' || !args.contenu || args.contenu.length > 20000) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsPage = { contenu: args.contenu };
      if (args.titre) {
        if (args.titre.length > 200) { return { ok: false, raison: 'invalide' }; }
        corpsPage.titre = args.titre;
      }
      return { ok: true, url: '/api/imladrik/entrees', methode: 'POST', corps: corpsPage };
    }

    if (outil === 'proposer_serment') {
      if (typeof args.intitule !== 'string' || !args.intitule || args.intitule.length > 200) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsSerment = { intitule: args.intitule };
      if (args.pourquoi) {
        if (args.pourquoi.length > 2000) { return { ok: false, raison: 'invalide' }; }
        corpsSerment.pourquoi = args.pourquoi;
      }
      if (args.horizon) {
        // Borne serveur de `horizon` = 200 (et non 2000) : on refuse plutôt
        // que de tronquer ce que Paul a dicté.
        if (args.horizon.length > 200) { return { ok: false, raison: 'invalide' }; }
        corpsSerment.horizon = args.horizon;
      }
      return { ok: true, url: '/api/serments', methode: 'POST', corps: corpsSerment };
    }

    if (outil === 'proposer_flamme') {
      var serment = resoudreRef(args.serment_ref, candidats.serments);
      if (!serment.ok) { return serment; }
      if (typeof args.texte !== 'string' || !args.texte || args.texte.length > 2000) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsFlamme = { serment_id: serment.candidat.id, texte: args.texte };
      if (args.nature) {
        if (['citation', 'victoire', 'rappel'].indexOf(args.nature) === -1) {
          return { ok: false, raison: 'invalide' };
        }
        corpsFlamme.nature = args.nature;
      }
      return {
        ok: true, url: '/api/flammes', methode: 'POST',
        corps: corpsFlamme, cible: serment.candidat.libelle
      };
    }

    if (outil === 'proposer_situation') {
      if (typeof args.intitule !== 'string' || !args.intitule || args.intitule.length > 200) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsSituation = { intitule: args.intitule };
      if (args.contexte) {
        if (args.contexte.length > 2000) { return { ok: false, raison: 'invalide' }; }
        corpsSituation.contexte = args.contexte;
      }
      return { ok: true, url: '/api/situations', methode: 'POST', corps: corpsSituation };
    }

    if (outil === 'proposer_scenario') {
      var situation = resoudreRef(args.situation_ref, candidats.situations);
      if (!situation.ok) { return situation; }
      if (typeof args.deroule !== 'string' || !args.deroule || args.deroule.length > 2000) {
        return { ok: false, raison: 'invalide' };
      }
      var corpsScenario = { situation_id: situation.candidat.id, deroule: args.deroule };
      if (args.vraisemblance) {
        if (['faible', 'moyenne', 'forte'].indexOf(args.vraisemblance) === -1) {
          return { ok: false, raison: 'invalide' };
        }
        corpsScenario.vraisemblance = args.vraisemblance;
      }
      if (args.signaux) {
        if (args.signaux.length > 2000) { return { ok: false, raison: 'invalide' }; }
        corpsScenario.signaux = args.signaux;
      }
      if (args.parade) {
        if (args.parade.length > 2000) { return { ok: false, raison: 'invalide' }; }
        corpsScenario.parade = args.parade;
      }
      return {
        ok: true, url: '/api/scenarios', methode: 'POST',
        corps: corpsScenario, cible: situation.candidat.libelle
      };
    }

    return { ok: false, raison: 'invalide' };
  }

  // ---------- Briques DOM (createElement/textContent uniquement) ----------

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte) { element.textContent = texte; }
    return element;
  }

  function svgEl(nom, attributs) {
    var element = document.createElementNS(SVG_NS, nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      element.setAttribute(cle, attributs[cle]);
    });
    return element;
  }

  // ---------- Blasons des quadrants (repris des emblèmes de la console),
  // muets : le nom « Léo » est porté par le titre du cartouche. ----------

  function socleBlason() {
    var svg = svgEl('svg', {
      'class': 'leo-blason', viewBox: '0 0 72 72', 'aria-hidden': 'true', focusable: 'false'
    });
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '33', fill: '#f9f1dc', stroke: '#a9884a', 'stroke-width': '2.4' }));
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '28.5', fill: 'none', stroke: '#5a4118', 'stroke-width': '1' }));
    return svg;
  }

  // RIVEN : la boussole.
  function svgBoussole() {
    var svg = socleBlason();
    svg.appendChild(svgEl('path', {
      d: 'M36 12 L40.5 31.5 L60 36 L40.5 40.5 L36 60 L31.5 40.5 L12 36 L31.5 31.5 Z', fill: '#3b2f1c'
    }));
    var traits = svgEl('g', { stroke: '#5a4118', 'stroke-width': '1.3', 'stroke-linecap': 'round' });
    traits.appendChild(svgEl('path', { d: 'M36 36 L50 22 M36 36 L50 50 M36 36 L22 50 M36 36 L22 22' }));
    svg.appendChild(traits);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '36', r: '2.4', fill: '#f9f1dc', stroke: '#5a4118', 'stroke-width': '1' }));
    return svg;
  }

  // ADRAMELECH : l'ouroboros ailé (mêmes tracés que le blason de la console).
  function svgOuroboros() {
    var svg = socleBlason();
    var aile = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '1.4', 'stroke-linejoin': 'round' });
    aile.appendChild(svgEl('path', {
      d: 'M30 24.5 C 26.5 17.5, 21 12.8, 13.5 12.3 C 15.7 15.2, 15.1 17.8, 12.8 19.6 ' +
         'C 16.3 20, 18.4 22.2, 17.6 25.3 C 20.7 24.3, 23.6 25.7, 25 28.6 ' +
         'C 26.5 26.5, 28.3 25.3, 30 25.5 Z'
    }));
    svg.appendChild(aile);
    var nervures = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '0.9', opacity: '0.85' });
    nervures.appendChild(svgEl('path', { d: 'M29.4 24.8 C 25 20.6, 19.8 16.2, 14.4 13.8' }));
    nervures.appendChild(svgEl('path', { d: 'M29.4 25.4 C 24.6 22.8, 19.4 20.8, 13.8 19.8' }));
    svg.appendChild(nervures);
    svg.appendChild(svgEl('path', {
      d: 'M34.78 22.05 A14 14 0 1 0 37.22 22.05',
      fill: 'none', stroke: '#3b2f1c', 'stroke-width': '3', 'stroke-linecap': 'round'
    }));
    svg.appendChild(svgEl('path', { d: 'M37.2 20.9 L41.2 23 L37.6 23.7 Z', fill: '#3b2f1c' }));
    svg.appendChild(svgEl('path', {
      d: 'M31.4 21.8 C 32.4 19.5, 35.4 18.7, 38 19.9 L 40.6 21.3 L 38.8 22.1 ' +
         'L 40.4 23.5 L 36.8 23.9 C 33.9 24.3, 31.9 23.4, 31.4 21.8 Z',
      fill: '#3b2f1c'
    }));
    svg.appendChild(svgEl('path', { d: 'M32.8 20.2 L 33.6 17.4 L 34.9 19.8 Z', fill: '#3b2f1c' }));
    svg.appendChild(svgEl('circle', { cx: '34.3', cy: '21.3', r: '0.9', fill: '#e0c48a' }));
    svg.appendChild(svgEl('path', {
      d: 'M43 47.5 A14 14 0 0 0 49.8 39',
      fill: 'none', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.6'
    }));
    return svg;
  }

  // NICOL BOLAS (ex-BCP) : la balance.
  function svgBalance() {
    var svg = socleBlason();
    var traits = svgEl('g', {
      stroke: '#5a4118', 'stroke-width': '1.9', fill: 'none',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    traits.appendChild(svgEl('path', { d: 'M36 22 V49' }));
    traits.appendChild(svgEl('path', { d: 'M20 27 H52' }));
    traits.appendChild(svgEl('path', { d: 'M28 51 Q36 47.5 44 51' }));
    traits.appendChild(svgEl('path', { d: 'M22 27 L17 37 M22 27 L27 37 M15 37 Q22 45 29 37' }));
    traits.appendChild(svgEl('path', { d: 'M50 27 L45 37 M50 27 L55 37 M43 37 Q50 45 57 37' }));
    svg.appendChild(traits);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '22', r: '2.6', fill: '#3b2f1c' }));
    return svg;
  }

  // IMLADRIK : l'épée dressée devant le soleil.
  function svgEpee() {
    var svg = socleBlason();
    var soleil = svgEl('g', { fill: 'none', stroke: '#3b2f1c', 'stroke-width': '1.6' });
    soleil.appendChild(svgEl('circle', { cx: '36', cy: '29', r: '9.5' }));
    soleil.appendChild(svgEl('path', { d: 'M20.5 29 H 24.5' }));
    soleil.appendChild(svgEl('path', { d: 'M47.5 29 H 51.5' }));
    soleil.appendChild(svgEl('path', { d: 'M25.2 18.2 l 2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M43.9 36.9 l 2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M46.8 18.2 l -2.9 2.9' }));
    soleil.appendChild(svgEl('path', { d: 'M28.1 36.9 l -2.9 2.9' }));
    svg.appendChild(soleil);
    svg.appendChild(svgEl('circle', { cx: '36', cy: '29', r: '6.5', fill: 'none', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.7' }));
    var epee = svgEl('g', { fill: '#3b2f1c' });
    epee.appendChild(svgEl('path', { d: 'M36 11.5 L38.2 16.5 L38.2 48 L33.8 48 L33.8 16.5 Z' }));
    epee.appendChild(svgEl('rect', { x: '26.5', y: '48', width: '19', height: '3.4', rx: '1.7' }));
    epee.appendChild(svgEl('rect', { x: '34.2', y: '51.4', width: '3.6', height: '7' }));
    epee.appendChild(svgEl('circle', { cx: '36', cy: '61', r: '2.9' }));
    svg.appendChild(epee);
    svg.appendChild(svgEl('path', { d: 'M36 15.5 V 46.5', stroke: '#e0c48a', 'stroke-width': '0.8', opacity: '0.7' }));
    return svg;
  }

  var BLASONS = {
    boussole: svgBoussole,
    ouroboros: svgOuroboros,
    balance: svgBalance,
    epee: svgEpee
  };

  function sousTitre(texte) {
    return el('h3', 'leo-sous-titre', texte);
  }

  // Phrase des travaux en cours, toujours dessinée (états vides compris).
  function lignesTravaux(recap) {
    var lignes = [];
    if (recap.retard > 0) {
      lignes.push(recap.retard + (recap.retard > 1 ? ' relances en retard' : ' relance en retard'));
    }
    if (recap.duJour > 0) {
      lignes.push(recap.duJour + (recap.duJour > 1 ? " relances aujourd'hui" : " relance aujourd'hui"));
    }
    if (lignes.length === 0) {
      lignes.push('Aucune relance en attente');
    }
    lignes.push(recap.leadsActifs > 0
      ? recap.leadsActifs + (recap.leadsActifs > 1 ? ' leads à suivre' : ' lead à suivre')
      : 'Aucun lead en cours');
    return lignes;
  }

  // ---------- Rendu COMMUN du cartouche (tous quadrants) ----------
  // config = {
  //   cleSession   : clé sessionStorage « déjà vu » (distincte par quadrant),
  //   blason       : 'boussole' | 'ouroboros' | 'balance' | 'epee',
  //   salutation   : phrase d'accueil,
  //   sections     : [{ titre, classe?, noeud? | lignes? | vide? }],
  //   propositions : [{ message, action? }] (l'action s'exécute après fermeture),
  //   propositionsVide : texte de l'état vide de la section Propositions.
  // }
  // Une fois par session de navigation (sessionStorage) ; fail-closed :
  // stockage indisponible ou config invalide → pas de cartouche, en silence.
  function ouvrirCartouche(config) {
    config = config || {};
    if (!config.cleSession || !Array.isArray(config.sections)) { return; }
    // `forcer` (2026-09-03) : ouverture À LA DEMANDE, sur clic de Paul.
    // Le verrou sessionStorage ne borne QUE l'accueil automatique — un bouton
    // « Parler à Léo » qui ne répondrait qu'une fois par onglet serait un
    // bouton cassé. Il ne POSE pas non plus la marque : ouvrir la voix à la
    // main ne doit pas consommer l'accueil du quadrant, sinon le premier clic
    // supprime silencieusement le cartouche d'entrée.
    if (!config.forcer) {
      try {
        if (window.sessionStorage.getItem(config.cleSession)) { return; }
        window.sessionStorage.setItem(config.cleSession, '1');
      } catch (e) {
        return; // stockage indisponible (navigation privée stricte) : fail-closed
      }
    }

    var focusAvant = document.activeElement;

    var voile = el('div', 'leo-voile');
    var cartouche = el('div', 'leo-cartouche');
    cartouche.id = 'leo-cartouche';
    cartouche.setAttribute('role', 'dialog');
    cartouche.setAttribute('aria-modal', 'true');
    cartouche.setAttribute('aria-labelledby', 'leo-titre');

    function fermer() {
      document.removeEventListener('keydown', surTouche, true);
      voile.remove();
      if (focusAvant && typeof focusAvant.focus === 'function' &&
          document.contains(focusAvant)) {
        focusAvant.focus();
      }
    }

    // Échap ferme ; Tab reste piégé dans le cartouche (aria-modal).
    function surTouche(evenement) {
      if (evenement.key === 'Escape') {
        evenement.stopPropagation(); // l'app derrière ne réagit pas
        fermer();
        return;
      }
      if (evenement.key !== 'Tab') { return; }
      var focusables = cartouche.querySelectorAll('button, input');
      if (focusables.length === 0) { return; }
      var premier = focusables[0];
      var dernier = focusables[focusables.length - 1];
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      } else if (!cartouche.contains(document.activeElement)) {
        evenement.preventDefault();
        premier.focus();
      }
    }

    // En-tête : blason du quadrant + « Léo » + salutation sobre.
    var entete = el('header', 'leo-entete');
    var blason = BLASONS[config.blason] || svgBoussole;
    entete.appendChild(blason());
    var titres = el('div', 'leo-titres');
    var titre = el('h2', 'leo-titre', 'Léo');
    titre.id = 'leo-titre';
    titres.appendChild(titre);
    titres.appendChild(el('p', 'leo-salutation', config.salutation || 'Bienvenue, Paul.'));
    entete.appendChild(titres);
    cartouche.appendChild(entete);

    // Sections fournies par le quadrant (contenu déjà calculé, jamais fetché ici).
    config.sections.forEach(function (section) {
      var bloc = el('section', 'leo-section' + (section.classe ? ' ' + section.classe : ''));
      bloc.appendChild(sousTitre(section.titre || ''));
      if (section.noeud) {
        bloc.appendChild(section.noeud);
      } else if (Array.isArray(section.lignes)) {
        var liste = el('ul', 'leo-travaux');
        section.lignes.forEach(function (ligne) {
          liste.appendChild(el('li', 'leo-travail', ligne));
        });
        bloc.appendChild(liste);
      } else {
        bloc.appendChild(el('p', 'leo-vide', section.vide || '—'));
      }
      cartouche.appendChild(bloc);
    });

    // Propositions (déterministes) : chacune ferme, puis mène à sa cible.
    var propositions = Array.isArray(config.propositions) ? config.propositions : [];
    var posePropositions = true;
    // Ouvert à la demande depuis un bouton, sans proposition à faire : la
    // section entière se retire. Sinon Paul, qui a cliqué pour PARLER, lit
    // « Rien d'urgent aujourd'hui » sur chacune des vingt-deux pages — du bruit
    // qui prend la place de la seule chose qu'il est venu chercher.
    if (config.sansPropositions === true && propositions.length === 0) {
      posePropositions = false;
    }
    var sectionPropositions = el('section', 'leo-section leo-section-propositions');
    sectionPropositions.appendChild(sousTitre('Propositions'));
    if (propositions.length === 0) {
      sectionPropositions.appendChild(el('p', 'leo-vide',
        config.propositionsVide || "Rien d'urgent aujourd'hui."));
    } else {
      var liste = el('ul', 'leo-propositions');
      propositions.forEach(function (proposition) {
        var item = el('li');
        var bouton = el('button', 'leo-proposition', proposition.message);
        bouton.type = 'button';
        bouton.addEventListener('click', function () {
          fermer();
          if (typeof proposition.action === 'function') { proposition.action(); }
        });
        item.appendChild(bouton);
        liste.appendChild(item);
      });
      sectionPropositions.appendChild(liste);
    }
    if (posePropositions) { cartouche.appendChild(sectionPropositions); }

    // Voix de Léo (L2, opt-in) : uniquement avec une session réelle.
    if (config.voix && typeof config.voix.quadrant === 'string' &&
        typeof config.voix.jeton === 'string' && config.voix.jeton) {
      cartouche.appendChild(construireVoix(config.voix));
    }

    // Pied : fermeture (focus initial dessus).
    var pied = el('footer', 'leo-pied');
    var partir = el('button', 'leo-partir', "C'est parti");
    partir.type = 'button';
    partir.id = 'leo-partir';
    partir.addEventListener('click', fermer);
    pied.appendChild(partir);
    cartouche.appendChild(pied);

    voile.addEventListener('click', function (evenement) {
      if (evenement.target === voile) { fermer(); }
    });
    document.addEventListener('keydown', surTouche, true);

    voile.appendChild(cartouche);
    document.body.appendChild(voile);
    partir.focus();
  }

  // ---------- Voix de Léo (boucle L2) ----------

  // Zone de conversation branchée sur POST /api/leo (le seul appel réseau du
  // module). L'historique reste local au cartouche et repart en entier à
  // chaque tour (l'API est sans état). Erreurs : 503 = voix pas encore
  // branchée (gate coût) → la zone se retire proprement ; autre échec →
  // message générique, le texte dicté est restitué dans le champ.
  function construireVoix(voix) {
    var section = el('section', 'leo-section leo-section-voix');
    section.appendChild(sousTitre('Parler à Léo'));

    var dialogue = el('div', 'leo-dialogue');
    dialogue.setAttribute('aria-live', 'polite');
    section.appendChild(dialogue);

    var formulaire = document.createElement('form');
    formulaire.className = 'leo-voix-formulaire';
    var champ = document.createElement('input');
    champ.type = 'text';
    champ.className = 'leo-voix-champ';
    champ.maxLength = 4000;
    champ.placeholder = 'Dictez ou écrivez à Léo…';
    champ.setAttribute('aria-label', 'Votre message à Léo');
    var envoyer = el('button', 'leo-voix-envoyer', 'Envoyer');
    envoyer.type = 'submit';
    formulaire.appendChild(champ);
    formulaire.appendChild(envoyer);
    section.appendChild(formulaire);

    // Le micro (composant partagé js/dictee.js) : progressive enhancement —
    // module absent ou navigateur sans Web Speech → champ nu, aucune erreur.
    // Il enveloppe le champ dans .champ-vocal, d'où la règle de flex dédiée.
    if (window.UltimaDictee && window.UltimaDictee.disponible()) {
      window.UltimaDictee.attacher(champ, 'votre message à Léo');
    }

    var historique = [];
    var enCours = false;

    function bulle(genre, texte) {
      var p = el('p', 'leo-bulle leo-bulle-' + genre, texte);
      dialogue.appendChild(p);
      dialogue.scrollTop = dialogue.scrollHeight;
      return p;
    }

    // La gate coût n'est pas levée : la zone se retire, sans casser le cartouche.
    function couperVoix(message) {
      formulaire.remove();
      section.appendChild(el('p', 'leo-vide', message));
    }

    function rearmer() {
      enCours = false;
      if (document.contains(formulaire)) {
        champ.disabled = false;
        envoyer.disabled = false;
        champ.focus();
      }
    }

    // L2b — carte de confirmation d'une action proposée. Rendu DÉTERMINISTE :
    // la reformulation vient du serveur (gabarit, jamais la prose du modèle).
    // Tant que la carte est ouverte, la saisie reste coupée (un seul fil,
    // pas d'actions empilées). L'issue (exécutée / échouée / annulée) rejoint
    // l'historique comme message utilisateur : le modèle l'apprend au tour
    // suivant — jamais de tool_result dans la même requête.
    function afficherCarte(proposition) {
      var carte = el('div', 'leo-carte-action');
      carte.setAttribute('role', 'group');
      carte.setAttribute('aria-label', 'Action proposée par Léo — confirmation requise');
      carte.appendChild(el('p', 'leo-carte-texte', proposition.reformulation));

      // Résolution locale des cibles dictées + gabarit d'exécution (PUR).
      var plan = construirePlanExecution(proposition, voix.candidats);
      // S-L2b-1 : la référence dictée peut différer du libellé de
      // l'enregistrement résolu (résolution par inclusion unique). La carte
      // nomme TOUJOURS la cible réelle avant que « Confirmer » n'existe.
      if (plan.ok && plan.cible) {
        carte.appendChild(el('p', 'leo-carte-cible', '→ Cible : « ' + plan.cible + ' »'));
      }
      if (!plan.ok) {
        carte.appendChild(el('p', 'leo-carte-blocage',
          plan.raison === 'ambigu'
            ? 'Cible ambiguë — précisez le nom, puis redictez l’action.'
            : plan.raison === 'introuvable'
              ? 'Cible introuvable — vérifiez le nom, puis redictez l’action.'
              : 'Action impossible en l’état — reformulez-la.'));
      }

      var boutons = el('div', 'leo-carte-boutons');
      var enTraitement = false;

      // Ferme la carte et consigne l'issue (bulle sous aria-live + historique).
      function clore(message) {
        carte.remove();
        historique.push({ role: 'user', content: echoBorne(message) });
        bulle('issue', message);
        rearmer();
      }

      var annuler = el('button', 'leo-carte-annuler', 'Annuler');
      annuler.type = 'button';
      annuler.addEventListener('click', function () {
        if (enTraitement) { return; }
        clore('[Action annulée par Paul]');
      });

      // « Confirmer » n'existe que si le plan est exécutable : cible
      // introuvable/ambiguë → seul « Annuler » reste actif (aucun choix
      // hasardeux). L'exécution passe par l'API existante, Bearer de session.
      if (plan.ok) {
        var confirmer = el('button', 'leo-carte-confirmer', 'Confirmer');
        confirmer.type = 'button';
        confirmer.addEventListener('click', function () {
          if (enTraitement) { return; }
          enTraitement = true;
          confirmer.disabled = true;
          annuler.disabled = true;
          fetch(plan.url, {
            method: plan.methode,
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + voix.jeton
            },
            body: JSON.stringify(plan.corps)
          }).then(function (reponse) {
            return reponse.json().then(function (corps) {
              return { httpOk: reponse.ok, statut: reponse.status, corps: corps };
            }, function () {
              return { httpOk: false, corps: null };
            });
          }).then(function (resultat) {
            if (resultat.httpOk && resultat.corps && resultat.corps.ok === true) {
              apresEcriture(proposition, plan, resultat.corps.data);
              if (typeof voix.notifier === 'function') {
                try { voix.notifier('Action de Léo exécutée.'); } catch (e) { /* fail-soft */ }
              }
              clore('[Action exécutée : ' + proposition.reformulation + ']');
            } else {
              // Un refus explicite se distingue d'une réponse perdue après écriture.
              clore(messageEchecEcriture(resultat));
            }
          }, function () {
            clore(messageEchecEcriture(null));
          });
        });
        boutons.appendChild(confirmer);
      }
      boutons.appendChild(annuler);
      carte.appendChild(boutons);
      dialogue.appendChild(carte);
      dialogue.scrollTop = dialogue.scrollHeight;
      (plan.ok ? boutons.firstChild : annuler).focus();
    }

    // S4 (revue du 30/09) : les candidats sont une copie FIGÉE au chargement.
    // Sans cette mise à jour, un second enrichissement repartirait de
    // l'essence d'avant le premier — et l'effacerait sans bruit ; une seconde
    // idée reprendrait le même numéro ADR (409). Appelée sur les deux chemins.
    function apresEcriture(proposition, plan, data) {
      var c = voix.candidats;
      if (!c || typeof c !== 'object') { return; }
      if (plan.methode === 'PATCH' && plan.corps && Array.isArray(c.idees)) {
        c.idees.forEach(function (i) {
          if (i && i.id === plan.corps.id) { i.essence = plan.corps.essence; }
        });
      }
      if (proposition.outil === 'proposer_idee' && typeof c.prochainAdrNum === 'number') {
        c.prochainAdrNum += 1;
      }
      // La création confirmée peut servir de cible au tour suivant.
      if (plan.methode !== 'POST' || !data || !UUID_MOTIF.test(data.id)) { return; }
      var liste = { proposer_idee: 'idees', proposer_serment: 'serments', proposer_situation: 'situations' }[proposition.outil];
      if (!liste) { return; }
      if (!Array.isArray(c[liste])) { c[liste] = []; }
      if (c[liste].some(function (item) { return item.id === data.id; })) { return; }
      var item = { id: data.id, libelle: plan.corps.nom || plan.corps.intitule };
      if (liste === 'idees') { item.essence = plan.corps.essence || null; }
      c[liste].push(item);
    }

    // B1 ⑤ (cadrage §15) : le défaire d'un geste fait sans demander. Retire de
    // la mémoire de la page ce que `apresEcriture` y avait ajouté — sans quoi
    // le tour suivant viserait une cible qui n'existe plus.
    function apresDefaire(proposition, cibleId) {
      var c = voix.candidats;
      if (!c || typeof c !== 'object') { return; }
      var liste = { proposer_idee: 'idees', proposer_serment: 'serments', proposer_situation: 'situations' }[proposition.outil];
      if (liste && Array.isArray(c[liste])) {
        c[liste] = c[liste].filter(function (item) { return !item || item.id !== cibleId; });
      }
    }

    // Le bouton « Défaire » sur la bulle « Fait sans demander » (choix ② de
    // Paul). ⛔ Il n'existe que là : jamais sur une carte confirmée, jamais
    // dans un mail. Un clic, une requête — le serveur relit la trace et décide.
    function ajouterDefaire(bulleIssue, traceId, proposition, cibleId, cloture) {
      var bouton = el('button', 'leo-defaire', 'Défaire');
      bouton.type = 'button';
      bouton.setAttribute('aria-label', 'Défaire : ' + proposition.reformulation);
      // Le texte passe dans son propre élément : le bouton vit À CÔTÉ, et
      // remplacer le texte au défaire ne doit pas emporter le bouton.
      var texteBulle = el('span', 'leo-bulle-texte', bulleIssue.textContent);
      bulleIssue.textContent = '';
      bulleIssue.appendChild(texteBulle);
      bulleIssue.className += ' leo-bulle-defaisable';
      bulleIssue.setAttribute('data-etat', 'fait');
      bulleIssue.appendChild(bouton);

      function conclure(etat, texte, bulleLeo) {
        if (bouton.parentNode) { bouton.parentNode.removeChild(bouton); }
        bulleIssue.setAttribute('data-etat', etat);
        var cibleFocus = bulleIssue;
        if (texte) {
          if (bulleLeo) { cibleFocus = bulle('leo', texte); }
          else { texteBulle.textContent = texte; }
        }
        // ⛔ Le bouton disparaît : le focus ne doit pas tomber sur la page. Il
        // va à ce que la bulle est devenue (critère du dry run du 02/10).
        cibleFocus.setAttribute('tabindex', '-1');
        cibleFocus.focus();
      }

      bouton.addEventListener('click', function () {
        if (bouton.disabled) { return; }
        bouton.disabled = true;
        bouton.setAttribute('aria-busy', 'true');
        // La clôture part sans attendre ; le défaire, lui, l'attend — sinon un
        // clic rapide trouverait la trace sans issue (« rien à défaire »).
        Promise.resolve(cloture).then(null, function () { /* fail-soft */ }).then(function () {
          return appelJson('/api/leo/ecritures', 'POST', { etape: 'defaire', traceId: traceId });
        }).then(function (r) {
          if (r.httpOk && r.corps && r.corps.ok === true) {
            apresDefaire(proposition, cibleId);
            var note = r.corps.data && r.corps.data.journalise === false
              ? ' (le journal n’a pas pu le noter)' : '';
            var texte = '[Défait : ' + proposition.reformulation + ' — retiré, rien d’autre n’a bougé' + note + '.]';
            historique.push({ role: 'user', content: echoBorne('[Paul a défait : ' + proposition.reformulation + ']') });
            conclure('defait', texte, false);
            return;
          }
          conclure('refuse', messageRefusDefaire(r), true);
        }, function () {
          conclure('inconnu', messageRefusDefaire(null), true);
        });
      });
    }

    // Appel JSON authentifié → { httpOk, statut, corps } ; rejette sur panne réseau.
    function appelJson(url, methode, corps) {
      return fetch(url, {
        method: methode,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + voix.jeton
        },
        body: JSON.stringify(corps)
      }).then(function (reponse) {
        return reponse.json().then(function (c) {
          return { httpOk: reponse.ok, statut: reponse.status, corps: c };
        }, function () {
          return { httpOk: false, statut: reponse.status, corps: null };
        });
      });
    }

    // B1 ④ (cadrage §13) : une proposition VERTE s'exécute sans clic — mais
    // seulement DERRIÈRE une trace que le serveur a posée ('tentee') après
    // avoir re-jugé l'outil et consulté le plafond. ⛔ Tout refus (outil
    // re-jugé orange, plafond atteint, journal indisponible, cible non
    // résolue) retombe sur la carte : Paul décide, jamais une écriture sans
    // trace. L'acte n'existe que dans la suite d'un `ouvrir` réussi.
    function executerSansDemander(proposition) {
      // S3 (revue du 30/09) : Paul a fermé le cartouche pendant que Léo
      // réfléchissait — il ne verrait pas l'acte. Rien ne part.
      if (!document.contains(formulaire)) { return; }
      var plan = construirePlanExecution(proposition, voix.candidats);
      if (!plan.ok || !cibleExacte(proposition, plan)) { afficherCarte(proposition); return; }

      appelJson('/api/leo/ecritures', 'POST', {
        etape: 'ouvrir',
        outil: proposition.outil,
        args: proposition.args,
        quadrant: voix.quadrant
      }).then(function (ouverture) {
        var data = ouverture.httpOk && ouverture.corps && ouverture.corps.ok === true
          ? ouverture.corps.data : null;
        var traceId = data && typeof data.traceId === 'string' && UUID_MOTIF.test(data.traceId)
          ? data.traceId : null;
        if (!traceId) { afficherCarte(proposition); return; }
        // S3 : fermé entre-temps → pas d'acte. La 'tentee' reste seule, et
        // c'est VRAI : l'écriture a été interrompue avant d'avoir lieu.
        if (!document.contains(formulaire)) { return; }

        // Clôture : issue posée APRÈS l'acte. Son échec laisse la 'tentee'
        // seule — « issue inconnue », ce qui est VRAI du point de vue du
        // journal. Jamais de seconde tentative d'acte.
        function issue(reussie, cibleId, motif, data, resultat) {
          var cloture = { etape: 'clore', traceId: traceId, issue: reussie ? 'reussie' : 'echouee' };
          var cibleValide = reussie && typeof cibleId === 'string' && UUID_MOTIF.test(cibleId);
          if (cibleValide) { cloture.cibleId = cibleId; }
          if (!reussie) { cloture.motif = motif; }
          var clotureEnVol = appelJson('/api/leo/ecritures', 'POST', cloture);
          clotureEnVol.then(null, function () { /* fail-soft */ });
          if (reussie) { apresEcriture(proposition, plan, data); }
          // La cible RÉSOLUE est nommée : c'est ce que la carte montrait.
          var message = reussie
            ? '[Fait sans demander : ' + proposition.reformulation +
              (plan.cible ? ' → Cible : « ' + plan.cible + ' »' : '') + ']'
            : messageEchecEcriture(resultat);
          if (reussie && typeof voix.notifier === 'function') {
            try { voix.notifier('Léo a agi sans demander.'); } catch (e) { /* fail-soft */ }
          }
          historique.push({ role: 'user', content: echoBorne(message) });
          var bulleIssue = bulle('issue', message);
          // B1 ⑤ : ce qui a été fait sans demander se défait d'un clic. Sans
          // cible lisible, pas de bouton — le serveur refuserait de toute façon.
          if (cibleValide) { ajouterDefaire(bulleIssue, traceId, proposition, cibleId, clotureEnVol); }
          rearmer();
        }

        function inconnue(resultat) {
          // Une réponse perdue ne prouve pas l'échec : conserver la tentative
          // seule et demander une lecture, sans clôture ni nouvel envoi.
          var message = messageEchecEcriture(resultat);
          historique.push({ role: 'user', content: echoBorne(message) });
          bulle('issue', message);
          rearmer();
        }

        appelJson(plan.url, plan.methode, plan.corps).then(function (acte) {
          var reussie = acte.httpOk && acte.corps && acte.corps.ok === true;
          // La cible : l'objet modifié (PATCH) ou créé (POST). Un identifiant,
          // jamais un libellé — le journal ne porte aucun contenu dicté.
          var cible = plan.methode === 'PATCH'
            ? plan.corps && plan.corps.id
            : acte.corps && acte.corps.data && acte.corps.data.id;
          if (reussie) { issue(true, cible, null, acte.corps.data); }
          else if (acte.statut >= 400 && acte.statut < 500 && acte.corps && acte.corps.ok === false) {
            issue(false, null, 'statut ' + acte.statut, null, acte);
          } else { inconnue(acte); }
        }, function () {
          inconnue(null);
        });
      }, function () {
        afficherCarte(proposition);
      });
    }

    formulaire.addEventListener('submit', function (evenement) {
      evenement.preventDefault();
      var texte = champ.value.trim();
      if (!texte || enCours) { return; }
      enCours = true;
      champ.value = '';
      champ.disabled = true;
      envoyer.disabled = true;
      historique.push({ role: 'user', content: texte });
      bulle('paul', texte);
      var attente = bulle('leo', 'Léo réfléchit…');
      attente.className += ' leo-bulle-attente';

      fetch('/api/leo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + voix.jeton
        },
        // Les yeux de Léo : l'état du quadrant part avec la question, calculé
        // par la page appelante sur des données DÉJÀ chargées (aucun second
        // fetch). Absent → l'appel repart exactement comme avant (L2 intact).
        body: JSON.stringify(voix.etat
          ? { quadrant: voix.quadrant, messages: historique, etat: voix.etat }
          : { quadrant: voix.quadrant, messages: historique })
      }).then(function (reponse) {
        return reponse.json().then(function (corps) {
          return { statut: reponse.status, corps: corps };
        }, function () {
          return { statut: reponse.status, corps: null };
        });
      }).then(function (resultat) {
        attente.remove();
        var data = resultat.corps && resultat.corps.ok === true ? resultat.corps.data : null;
        var texteLeo = data && typeof data.reponse === 'string' ? data.reponse : null;
        // L2b : proposition d'action — fail-safe : toute forme douteuse est
        // ignorée (seule la bulle texte s'affiche, jamais de carte douteuse).
        var proposition = data && propositionRecevable(data.proposition) ? data.proposition : null;
        if (typeof texteLeo === 'string' && texteLeo) {
          historique.push({ role: 'assistant', content: texteLeo });
          bulle('leo', texteLeo);
        }
        if (proposition) {
          // La saisie reste coupée tant que la carte attend Paul (pas de rearmer).
          // B1 ④ : un vert tente l'exécution directe, qui retombe elle-même
          // sur la carte au moindre refus.
          if (proposition.anneau === 'vert') {
            executerSansDemander(proposition);
          } else {
            afficherCarte(proposition);
          }
          return;
        }
        if (typeof texteLeo === 'string' && texteLeo) {
          // Réponse texte simple : comportement L2 inchangé (bulle déjà rendue).
        } else if (resultat.statut === 503) {
          historique.pop();
          couperVoix("La voix de Léo n'est pas encore branchée (clé API en attente).");
        } else {
          historique.pop();
          champ.value = texte;
          bulle('erreur', "Léo n'a pas pu répondre — réessayez.");
        }
        rearmer();
      }, function () {
        attente.remove();
        historique.pop();
        champ.value = texte;
        bulle('erreur', "Léo n'a pas pu répondre — réessayez.");
        rearmer();
      });
    });

    return section;
  }

  // ---------- RIVEN (comportement historique, inchangé) ----------

  // Ouvre le cartouche. `donnees` = { noeuds, relations, journal } (l'état
  // déjà chargé par app.js) ; `actions.ouvrirCible(nodeId)` mène à la fiche ;
  // `voix` = { quadrant, jeton } optionnel (L2, session réelle uniquement).
  // Fail-closed : pas de données → pas de cartouche, en silence.
  function accueillir(donnees, actions, voix) {
    actions = actions || {};
    if (!donnees || !Array.isArray(donnees.noeuds) || donnees.noeuds.length === 0) { return; }

    var recap = calculerRecap(donnees);

    // 1. Où on en est : la dernière note du journal.
    var noeudEtat;
    if (recap.dernierJournal) {
      noeudEtat = el('p', 'leo-journal');
      noeudEtat.appendChild(el('span', 'leo-journal-date',
        'Le ' + dateLisible(recap.dernierJournal.date) + ' — '));
      noeudEtat.appendChild(document.createTextNode('« ' + recap.dernierJournal.note + ' »'));
      noeudEtat.appendChild(el('span', 'leo-journal-cible', ' (' + recap.dernierJournal.cible + ')'));
    } else {
      noeudEtat = el('p', 'leo-vide', 'Aucune note au journal pour l’instant.');
    }

    ouvrirCartouche({
      cleSession: CLE_SESSION,
      blason: 'boussole',
      salutation: 'Bienvenue, Paul. Voici où nous en sommes.',
      sections: [
        { titre: 'Où on en est', classe: 'leo-section-etat', noeud: noeudEtat },
        { titre: 'Travaux en cours', classe: 'leo-section-travaux', lignes: lignesTravaux(recap) }
      ],
      propositions: recap.propositions.map(function (proposition) {
        return {
          message: proposition.message,
          action: (proposition.nodeId && typeof actions.ouvrirCible === 'function')
            ? function () { actions.ouvrirCible(proposition.nodeId); }
            : null
        };
      }),
      propositionsVide: "Rien d'urgent aujourd'hui — votre réseau est à jour.",
      voix: voix
    });
  }

  // ---------- Les autres quadrants (diffusion Léo) ----------

  // accueillirQuadrant({ quadrant, blason, salutation, sections, propositions,
  // propositionsVide }) : rendu commun, clé sessionStorage distincte par
  // quadrant. Le contenu (sections/propositions) est calculé par le quadrant
  // appelant — jamais ici. Fail-closed sur config invalide.
  function accueillirQuadrant(options) {
    options = options || {};
    if (!options.quadrant || typeof options.quadrant !== 'string') { return; }
    ouvrirCartouche({
      cleSession: CLE_SESSION + '-' + options.quadrant,
      blason: options.blason,
      salutation: options.salutation,
      sections: Array.isArray(options.sections) ? options.sections : [],
      propositions: options.propositions,
      propositionsVide: options.propositionsVide,
      voix: options.voix,
      forcer: options.forcer === true,
      sansPropositions: options.sansPropositions === true
    });
  }

  window.UltimaLeo = {
    calculerRecap: calculerRecap,
    accueillir: accueillir,
    accueillirQuadrant: accueillirQuadrant,
    // L2b (pures, testables) : résolution des références dictées + gabarits
    // d'exécution vers les API existantes.
    resoudreRef: resoudreRef,
    construirePlanExecution: construirePlanExecution,
    messageEchecEcriture: messageEchecEcriture,
    // B1 ⑤ : la même phrase de refus pour la bulle et l'écran leo.html.
    messageRefusDefaire: messageRefusDefaire
  };
})();
