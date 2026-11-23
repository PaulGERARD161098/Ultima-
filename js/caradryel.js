// Ultima — CARADRYEL, la porte du scriptorium (boucle C1, CADRAGE-CARADRYEL.md §7).
//   - fail-closed : sans config, sans session ou sur 401, AUCUNE œuvre au DOM ;
//   - avec session : GET /api/caradryel (Bearer) → les œuvres, en boussole ;
//   - « Poser mes quatre œuvres » : POST {action:'initialiser'} (idempotent) ;
//   - « Lier le Doc » : PATCH {id, drive_url} — le serveur ne garde que
//     l'identifiant ; le lien d'ouverture est RECONSTRUIT ici depuis cet
//     identifiant revalidé (jamais l'URL collée).
// Injection DOM : createElement/textContent uniquement (CSP, jamais innerHTML).
// Aucun titre ni lien en console (§5 : intime) : erreurs génériques.
(function () {
  'use strict';

  var ID_DRIVE = /^[A-Za-z0-9_-]{20,128}$/;
  // `client` garde le client Supabase : la session se relit à CHAQUE appel
  // (getSession renouvelle un jeton expiré) — revue Codex sur #475.
  var etat = { client: null, oeuvres: [], cible: null };

  function $(id) { return document.getElementById(id); }
  function el(nom, classe, texte) {
    var e = document.createElement(nom);
    if (classe) { e.className = classe; }
    if (texte !== undefined && texte !== null) { e.textContent = texte; }
    return e;
  }

  // Fonction PURE (exposée aux harnais) : identifiant → lien Docs, ou null.
  function lienDoc(id) {
    return typeof id === 'string' && ID_DRIVE.test(id)
      ? 'https://docs.google.com/document/d/' + id + '/edit' : null;
  }

  // Fonction PURE : position de la i-ème œuvre sur n, en % du plateau.
  // La première au Nord, puis dans le sens des aiguilles d'une montre.
  // Rayon resserré sur petit écran : les cartes Est et Ouest restent dans l'écran.
  function position(i, n, rayon) {
    var angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
    rayon = typeof rayon === 'number' ? rayon : 41;
    return { x: 50 + rayon * Math.cos(angle), y: 50 + rayon * Math.sin(angle) };
  }

  var ETATS = ['caradryel-chargement', 'caradryel-auth', 'caradryel-erreur',
    'caradryel-non-installe', 'caradryel-vide', 'caradryel-porte'];
  function montrer(id) {
    ETATS.forEach(function (x) { var n = $(x); if (n) { n.hidden = x !== id; } });
    if (id !== 'caradryel-porte') { fermerLiaison(); }
  }

  var REPOS = 'Survole une œuvre — un geste l’ouvre dans Google Docs.';
  function parler(texte) { var p = $('caradryel-parole'); if (p) { p.textContent = texte; } }

  // ---------- Appels API (Bearer, fail-closed) ----------
  // Jeton courant, ou null (session refermée) : jamais un jeton figé au démarrage.
  async function jeton() {
    try {
      var r = await etat.client.auth.getSession();
      var s = r && r.data && r.data.session;
      return (s && s.access_token) || null;
    } catch (e) { return null; }
  }

  async function appel(methode, corps) {
    var t = await jeton();
    if (!t) { return { statut: 401, corps: null }; }
    var options = {
      method: methode,
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + t }
    };
    if (corps) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(corps);
    }
    var reponse;
    try { reponse = await fetch('/api/caradryel', options); }
    catch (e) { return { statut: 0, corps: null }; }
    var json = null;
    try { json = await reponse.json(); } catch (e) { json = null; }
    return { statut: reponse.status, corps: json };
  }

  function traiter(r) {
    if (r.statut === 401) { montrer('caradryel-auth'); return false; }
    if (r.statut === 503) { montrer('caradryel-non-installe'); return false; }
    if (r.statut !== 200 || !r.corps || r.corps.ok !== true) { montrer('caradryel-erreur'); return false; }
    etat.oeuvres = (r.corps.data && Array.isArray(r.corps.data.oeuvres)) ? r.corps.data.oeuvres : [];
    rendre();
    return true;
  }

  // ---------- Rendu de la porte ----------
  function rendre() {
    if (!etat.oeuvres.length) { montrer('caradryel-vide'); return; }
    var liste = $('caradryel-oeuvres');
    var aiguilles = $('caradryel-aiguilles');
    liste.replaceChildren();
    aiguilles.replaceChildren();
    var n = etat.oeuvres.length;
    var rayon = window.matchMedia && window.matchMedia('(max-width: 520px)').matches ? 35 : 41;
    etat.oeuvres.forEach(function (o, i) {
      var p = position(i, n, rayon);
      var trait = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      trait.setAttribute('class', 'caradryel-aiguille');
      trait.setAttribute('x1', '50'); trait.setAttribute('y1', '50');
      trait.setAttribute('x2', String(50 + (p.x - 50) * 0.78));
      trait.setAttribute('y2', String(50 + (p.y - 50) * 0.78));
      aiguilles.appendChild(trait);

      var carte = el('li', 'caradryel-oeuvre');
      carte.style.left = p.x + '%';   // CSSOM : permis par la CSP (style-src 'self')
      carte.style.top = p.y + '%';
      carte.appendChild(el('h2', 'caradryel-oeuvre-titre', String(o.titre || '')));
      var lien = o.lie ? lienDoc(o.drive_file_id) : null;
      if (lien) {
        carte.appendChild(el('span', 'caradryel-oeuvre-statut', 'Reliée à son Doc'));
        var a = el('a', 'caradryel-oeuvre-ouvrir', 'Ouvrir dans Docs ↗');
        a.href = lien;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        carte.appendChild(a);
        // Un lien posé par erreur se corrige ici (revue Codex sur #475 : sans ce
        // bouton, seule une requête manuelle ou la base pouvaient le réparer).
        var changer = el('button', 'caradryel-oeuvre-changer', 'Changer le lien');
        changer.type = 'button';
        changer.addEventListener('click', function () { ouvrirLiaison(o); });
        carte.appendChild(changer);
      } else {
        carte.appendChild(el('span', 'caradryel-oeuvre-statut', 'Pas encore reliée'));
        var b = el('button', 'caradryel-oeuvre-lier', 'Lier le Doc');
        b.type = 'button';
        b.addEventListener('click', function () { ouvrirLiaison(o); });
        carte.appendChild(b);
      }
      var dire = function (on) {
        trait.classList.toggle('is-actif', on);
        parler(on ? String(o.titre || '') + (lien ? ' — reliée à son Doc.' : ' — pas encore reliée à son Doc.') : REPOS);
      };
      carte.addEventListener('mouseenter', function () { dire(true); });
      carte.addEventListener('mouseleave', function () { dire(false); });
      carte.addEventListener('focusin', function () { dire(true); });
      carte.addEventListener('focusout', function () { dire(false); });
      liste.appendChild(carte);
    });
    parler(REPOS);
    var liees = etat.oeuvres.filter(function (o) { return o.lie; }).length;
    $('caradryel-pilotage').textContent = liees + '/' + n + ' œuvre' + (n > 1 ? 's' : '') + ' reliée' + (liees > 1 ? 's' : '') + ' à leur Doc.';
    montrer('caradryel-porte');
    lirePilotageDrive();
  }

  // Pilotage : l'état du branchement Drive d'IMLADRIK (déjà construit). Lecture seule.
  async function lirePilotageDrive() {
    var ligne = $('caradryel-pilotage');
    var t = await jeton();
    if (!t) { return; }
    var r;
    try {
      r = await fetch('/api/imladrik/drive/status', {
        headers: { Accept: 'application/json', Authorization: 'Bearer ' + t }
      });
    } catch (e) { return; }
    var j = null;
    try { j = await r.json(); } catch (e) { return; }
    if (!r.ok || !j || j.ok !== true || !j.data) { return; }
    var mot = !j.data.configured ? 'Drive non configuré' : (j.data.connected ? 'Drive connecté' : 'Drive non connecté');
    if (ligne && !/·/.test(ligne.textContent)) { ligne.textContent += ' · ' + mot + '.'; }
  }

  // ---------- Liaison d'une œuvre à son Doc ----------
  function ouvrirLiaison(o) {
    etat.cible = o;
    $('caradryel-lier-titre').textContent = 'Colle le lien du Google Doc de « ' + String(o.titre || '') + ' »';
    $('caradryel-lier-url').value = '';
    $('caradryel-lier-message').textContent = '';
    var form = $('caradryel-lier');
    form.hidden = false;
    // Le dock de Léo est fixé en bas de l'écran : le formulaire vient se poser
    // AU-DESSUS (scroll-margin-bottom, css/caradryel.css), jamais dessous.
    form.scrollIntoView({ block: 'end' });
    $('caradryel-lier-url').focus({ preventScroll: true });
  }
  function fermerLiaison() {
    etat.cible = null;
    var f = $('caradryel-lier');
    if (f) { f.hidden = true; }
  }

  async function lier(evenement) {
    evenement.preventDefault();
    if (!etat.cible) { return; }
    var url = $('caradryel-lier-url').value.trim();
    var message = $('caradryel-lier-message');
    if (!url) { message.textContent = 'Colle d’abord le lien du Doc.'; return; }
    var r = await appel('PATCH', { id: etat.cible.id, drive_url: url });
    if (r.statut === 400) { message.textContent = 'Ce lien n’est pas celui d’un Google Doc. Copie-le depuis la barre d’adresse du Doc.'; return; }
    if (r.statut === 404) { message.textContent = 'Cette œuvre est introuvable. Recharge la page.'; return; }
    if (traiter(r)) { fermerLiaison(); }
  }

  async function initialiser() {
    var bouton = $('caradryel-initialiser');
    bouton.disabled = true;
    traiter(await appel('POST', { action: 'initialiser' }));
    bouton.disabled = false;
  }

  // ---------- Démarrage ----------
  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function demarrer() {
    montrer('caradryel-chargement');
    $('caradryel-lier').addEventListener('submit', lier);
    $('caradryel-lier-annuler').addEventListener('click', fermerLiaison);
    $('caradryel-initialiser').addEventListener('click', initialiser);
    if (!configPresente() || !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('caradryel-auth');
      return;
    }
    var cfg = window.ULTIMA_CONFIG;
    try {
      etat.client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    } catch (e) { montrer('caradryel-auth'); return; }
    if (!(await jeton())) { montrer('caradryel-auth'); return; }
    traiter(await appel('GET'));
  }

  window.UltimaCaradryel = { lienDoc: lienDoc, position: position };
  demarrer().catch(function () { montrer('caradryel-erreur'); });
})();
