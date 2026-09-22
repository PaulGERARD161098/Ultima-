// Import des contacts de l'iPhone dans RIVEN (CADRAGE-RIVEN-IMPORT.md).
// Logique PURE, sans DOM, sans réseau : lecture vCard, normalisation,
// dédoublonnage, préparation des lignes envoyées à /api/reseau/import.
// Chargé en script classique par riven.html (window.UltimaImport) ; les
// harnais Node l'exécutent avec `new Function('window', source)`.
//
// Règles tenues ici, et prouvées au harnais :
//   ① Le fichier est HOSTILE par défaut : jamais d'exception, jamais de HTML
//      (le rendu se fait en textContent côté app.js), bornes sur tout.
//   ② MINIMISATION : seuls FN, N, ORG, TITLE, TEL et EMAIL sont lus. PHOTO,
//      ADR, BDAY, NOTE, URL, X-* … sont ignorés SANS être conservés.
//   ③ Rien n'est jamais écarté en silence : chaque carte illisible est
//      comptée, avec sa raison.
(function (racine) {
  'use strict';

  var LIMITES = {
    octets: 50 * 1024 * 1024, // un export iCloud avec photos pèse ~20 Mo pour 500 contacts
    cartes: 5000,
    nom: 200,
    fonction: 120,
    telephone: 30,
    email: 200,
    notes: 2000,
    lotServeur: 100, // miroir de api/_lib/import-personnes.js
    lotClient: 50    // ~50 × 400 o, très en deçà du plafond de 100 ko du corps
  };

  // Même forme que api/_lib/validate.js (EMAIL_RE) : ce que le serveur refuse,
  // le client ne le propose pas.
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var CHAMPS_LUS = { FN: 1, N: 1, ORG: 1, TITLE: 1, TEL: 1, EMAIL: 1 };

  // ---------- Lecture ----------

  // Caractères de contrôle (hors tab/retour ligne) : jamais utiles dans un
  // nom, parfois présents dans des exports corrompus.
  function nettoyer(texte) {
    return String(texte)
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Découpe sur un séparateur NON échappé (N et ORG sont composés de « ; »).
  function decouper(valeur, separateur) {
    var parts = [];
    var courant = '';
    for (var i = 0; i < valeur.length; i++) {
      var c = valeur[i];
      if (c === '\\' && i + 1 < valeur.length) { courant += c + valeur[i + 1]; i++; continue; }
      if (c === separateur) { parts.push(courant); courant = ''; continue; }
      courant += c;
    }
    parts.push(courant);
    return parts;
  }

  function desechapper(valeur) {
    return valeur.replace(/\\([\\,;nN])/g, function (_, c) {
      return c === 'n' || c === 'N' ? ' ' : c;
    });
  }

  // QUOTED-PRINTABLE (exports vCard 2.1) : =XX → octet, décodé en UTF-8.
  function decoderQP(valeur) {
    var octets = [];
    for (var i = 0; i < valeur.length; i++) {
      var c = valeur[i];
      if (c === '=' && /^[0-9A-Fa-f]{2}$/.test(valeur.substr(i + 1, 2))) {
        octets.push(parseInt(valeur.substr(i + 1, 2), 16));
        i += 2;
      } else {
        var code = valeur.charCodeAt(i);
        if (code < 128) { octets.push(code); } else { return valeur; }
      }
    }
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(octets));
    } catch (e) {
      return String.fromCharCode.apply(null, octets); // latin-1 de secours
    }
  }

  // « item1.TEL;type=CELL;type=pref:+33… » → { nom:'TEL', types:['cell','pref'], qp, valeur }
  function lireLigne(ligne) {
    var deuxPoints = -1;
    var entreGuillemets = false;
    for (var i = 0; i < ligne.length; i++) {
      if (ligne[i] === '"') { entreGuillemets = !entreGuillemets; }
      if (ligne[i] === ':' && !entreGuillemets) { deuxPoints = i; break; }
    }
    if (deuxPoints < 1) { return null; }
    var tete = ligne.slice(0, deuxPoints).split(';');
    var nom = tete[0].replace(/^[^.]*\./, '').toUpperCase();
    var types = [];
    var qp = false;
    for (var j = 1; j < tete.length; j++) {
      var param = tete[j];
      var egal = param.indexOf('=');
      var cle = egal === -1 ? 'TYPE' : param.slice(0, egal).toUpperCase();
      var val = (egal === -1 ? param : param.slice(egal + 1)).replace(/"/g, '');
      if (cle === 'TYPE') {
        val.split(',').forEach(function (t) { if (t) { types.push(t.toLowerCase()); } });
      } else if (cle === 'ENCODING' && /quoted-printable/i.test(val)) {
        qp = true;
      } else if (egal === -1 && /quoted-printable/i.test(val)) {
        qp = true;
      }
    }
    return { nom: nom, types: types, qp: qp, valeur: ligne.slice(deuxPoints + 1) };
  }

  // Déplie le texte en lignes logiques : pliage RFC 6350 (CRLF + espace/tab)
  // et, pour le QUOTED-PRINTABLE 2.1, les lignes terminées par « = ».
  function lignesLogiques(texte) {
    var brutes = texte.replace(/^﻿/, '').split(/\r\n|\r|\n/);
    var sortie = [];
    for (var i = 0; i < brutes.length; i++) {
      var l = brutes[i];
      if ((l[0] === ' ' || l[0] === '\t') && sortie.length) {
        sortie[sortie.length - 1] += l.slice(1);
        continue;
      }
      sortie.push(l);
    }
    // Recoller les continuations QP (« …=\n suite »).
    var fusion = [];
    for (var k = 0; k < sortie.length; k++) {
      var ligne = sortie[k];
      while (/QUOTED-PRINTABLE/i.test(ligne.split(':')[0]) && /=$/.test(ligne) && k + 1 < sortie.length) {
        ligne = ligne.slice(0, -1) + sortie[++k];
      }
      fusion.push(ligne);
    }
    return fusion;
  }

  function carteVersContact(proprietes) {
    var c = { fn: '', n: '', org: '', titre: '', telephones: [], emails: [] };
    proprietes.forEach(function (p) {
      var brut = p.qp ? decoderQP(p.valeur) : p.valeur;
      if (p.nom === 'FN') { c.fn = c.fn || nettoyer(desechapper(brut)); }
      else if (p.nom === 'TITLE') { c.titre = c.titre || nettoyer(desechapper(brut)); }
      else if (p.nom === 'ORG') {
        c.org = c.org || nettoyer(decouper(brut, ';').map(desechapper).filter(Boolean).join(' — '));
      } else if (p.nom === 'N') {
        // N = famille;prénom;autres;préfixe;suffixe → « prénom famille »
        var n = decouper(brut, ';').map(function (x) { return nettoyer(desechapper(x)); });
        c.n = c.n || nettoyer([n[3], n[1], n[2], n[0], n[4]].filter(Boolean).join(' '));
      } else if (p.nom === 'TEL') {
        var tel = nettoyer(desechapper(brut)).replace(/^tel:/i, '');
        if (tel) { c.telephones.push({ valeur: tel, types: p.types }); }
      } else if (p.nom === 'EMAIL') {
        var mail = nettoyer(desechapper(brut)).replace(/^mailto:/i, '');
        if (mail) { c.emails.push({ valeur: mail, types: p.types }); }
      }
    });
    return c;
  }

  // Préférence : mobile, puis pro, puis le premier venu.
  function choisir(liste, preferes) {
    for (var i = 0; i < preferes.length; i++) {
      for (var j = 0; j < liste.length; j++) {
        if (liste[j].types.indexOf(preferes[i]) !== -1) { return liste[j].valeur; }
      }
    }
    return liste.length ? liste[0].valeur : '';
  }

  function tronquer(texte, max) {
    return texte.length > max ? texte.slice(0, max - 1) + '…' : texte;
  }

  // Normalisation téléphone : chiffres seuls, « 00 » → « + », national
  // français à 10 chiffres → +33. Sert de clé de dédoublonnage ET de valeur
  // stockée (une seule écriture par numéro, quelle que soit la saisie).
  function normaliserTelephone(brut) {
    if (typeof brut !== 'string') { return null; }
    var s = brut.trim();
    var plus = s[0] === '+';
    var chiffres = s.replace(/\D/g, '');
    if (!chiffres) { return null; }
    if (!plus && chiffres.indexOf('00') === 0) { plus = true; chiffres = chiffres.slice(2); }
    if (!plus && /^0[1-9]\d{8}$/.test(chiffres)) { return '+33' + chiffres.slice(1); }
    if (plus && /^330[1-9]\d{8}$/.test(chiffres)) { chiffres = '33' + chiffres.slice(3); } // +33 (0)6…
    var sortie = (plus ? '+' : '') + chiffres;
    return sortie.length >= 3 && sortie.length <= LIMITES.telephone ? sortie : null;
  }

  function normaliserEmail(brut) {
    if (typeof brut !== 'string') { return null; }
    var s = brut.trim().toLowerCase();
    return s.length <= LIMITES.email && EMAIL_RE.test(s) ? s : null;
  }

  // Lit un fichier .vcf entier. Ne lève JAMAIS : un fichier mal formé donne
  // des rejets comptés, pas une exception.
  function lireVcard(texte) {
    var resultat = { contacts: [], rejets: [], cartes: 0, tropDeCartes: false };
    if (typeof texte !== 'string') { return resultat; }
    var lignes = lignesLogiques(texte);
    var courante = null;

    function clore() {
      if (!courante) { return; }
      resultat.cartes += 1;
      var index = resultat.cartes;
      if (resultat.cartes > LIMITES.cartes) { resultat.tropDeCartes = true; courante = null; return; }
      var c = carteVersContact(courante);
      courante = null;
      var nom = c.fn || c.n || c.org;
      if (!nom) { resultat.rejets.push({ carte: index, raison: 'sans nom' }); return; }
      var alertes = [];
      if (nom.length > LIMITES.nom) { alertes.push('nom tronqué'); }
      if (c.titre.length > LIMITES.fonction) { alertes.push('fonction tronquée'); }
      var telBrut = choisir(c.telephones, ['cell', 'iphone', 'mobile', 'work']);
      var tel = telBrut ? normaliserTelephone(telBrut) : null;
      if (telBrut && !tel) { alertes.push('téléphone illisible'); }
      var mailBrut = choisir(c.emails, ['work', 'pref']);
      var mail = mailBrut ? normaliserEmail(mailBrut) : null;
      if (mailBrut && !mail) { alertes.push('e-mail invalide'); }
      resultat.contacts.push({
        carte: index,
        nom: tronquer(nom, LIMITES.nom),
        fonction: tronquer(c.titre, LIMITES.fonction),
        organisation: tronquer(c.org, 200),
        telephone: tel || '',
        email: mail || '',
        alertes: alertes
      });
    }

    for (var i = 0; i < lignes.length; i++) {
      var l = lignes[i].trim();
      if (/^BEGIN:VCARD$/i.test(l)) {
        if (courante) { clore(); } // END manquant : la carte précédente est close
        courante = [];
        continue;
      }
      if (/^END:VCARD$/i.test(l)) { clore(); continue; }
      if (!courante) { continue; }
      var p = lireLigne(lignes[i]);
      if (p && CHAMPS_LUS[p.nom]) { courante.push(p); }
      if (resultat.tropDeCartes) { break; }
    }
    clore();
    if (resultat.cartes > LIMITES.cartes) { resultat.tropDeCartes = true; }
    return resultat;
  }

  // ---------- Dédoublonnage ----------

  function cleNom(texte) {
    return String(texte || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  // Regroupe les contacts qui partagent un téléphone normalisé ou un e-mail.
  // Le premier de chaque groupe est gardé ; ses champs VIDES sont complétés par
  // les suivants — jamais écrasés. Puis : marque ceux déjà présents au registre
  // (`existants` = personnes en base) et propose un rattachement quand une
  // fiche porte EXACTEMENT le nom de l'organisation.
  function regrouper(contacts, existants, fiches) {
    var parent = contacts.map(function (_, i) { return i; });
    function racineDe(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
    function unir(a, b) { a = racineDe(a); b = racineDe(b); if (a !== b) { parent[Math.max(a, b)] = Math.min(a, b); } }

    var vus = {};
    contacts.forEach(function (c, i) {
      [c.telephone && 't:' + c.telephone, c.email && 'e:' + c.email].forEach(function (cle) {
        if (!cle) { return; }
        if (vus[cle] === undefined) { vus[cle] = i; } else { unir(vus[cle], i); }
      });
    });

    var groupes = {};
    var ordre = [];
    contacts.forEach(function (c, i) {
      var r = racineDe(i);
      if (!groupes[r]) { groupes[r] = []; ordre.push(r); }
      groupes[r].push(c);
    });

    var enBase = {};
    (existants || []).forEach(function (p) {
      var t = normaliserTelephone(p && p.telephone);
      var e = normaliserEmail(p && p.email);
      if (t) { enBase['t:' + t] = true; }
      if (e) { enBase['e:' + e] = true; }
    });
    var fichesParNom = {};
    (fiches || []).forEach(function (f) {
      if (f && f.id && f.nom) { fichesParNom[cleNom(f.nom)] = { id: f.id, nom: f.nom }; }
    });

    return ordre.map(function (r, rang) {
      var membres = groupes[r];
      var fusion = {
        id: 'c' + rang,
        nom: membres[0].nom,
        fonction: '', organisation: '', telephone: '', email: '',
        cartes: membres.length,
        alertes: []
      };
      membres.forEach(function (m) {
        ['fonction', 'organisation', 'telephone', 'email'].forEach(function (champ) {
          if (!fusion[champ] && m[champ]) { fusion[champ] = m[champ]; }
        });
        m.alertes.forEach(function (a) { if (fusion.alertes.indexOf(a) === -1) { fusion.alertes.push(a); } });
      });
      fusion.dejaEnBase = !!((fusion.telephone && enBase['t:' + fusion.telephone]) ||
                             (fusion.email && enBase['e:' + fusion.email]));
      fusion.fiche = fusion.organisation ? (fichesParNom[cleNom(fusion.organisation)] || null) : null;
      return fusion;
    });
  }

  // ---------- Vers l'API ----------

  // Ligne envoyée à /api/reseau/import : uniquement les champs de `personnes`
  // (+ node_id si le rattachement est demandé). Champs vides OMIS.
  function versPersonne(contact, rattacher) {
    var ligne = { nom: contact.nom };
    if (contact.fonction) { ligne.fonction = contact.fonction; }
    if (contact.telephone) { ligne.telephone = contact.telephone; }
    if (contact.email) { ligne.email = contact.email; }
    if (contact.organisation) { ligne.notes = tronquer('Entreprise : ' + contact.organisation, LIMITES.notes); }
    if (rattacher && contact.fiche && contact.fiche.id) { ligne.node_id = contact.fiche.id; }
    return ligne;
  }

  function enLots(lignes, taille) {
    var lots = [];
    for (var i = 0; i < lignes.length; i += taille) { lots.push(lignes.slice(i, i + taille)); }
    return lots;
  }

  racine.UltimaImport = {
    LIMITES: LIMITES,
    lireVcard: lireVcard,
    normaliserTelephone: normaliserTelephone,
    normaliserEmail: normaliserEmail,
    regrouper: regrouper,
    versPersonne: versPersonne,
    enLots: enLots
  };
})(window);
