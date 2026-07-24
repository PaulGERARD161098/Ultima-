// Ultima — quadrant IMLADRIK (v1) : l'outil intime de progression, « pouvoir
// écrire ». Le journal DERRIÈRE AUTH, données réelles uniquement (§5 : intime) :
//   - fail-closed : sans config, sans session ou sur échec API (401), la page
//     n'affiche AUCUNE donnée — seul le cartouche « Authentification requise »
//     est montré (le flux de connexion vit sur la boussole « / ») ;
//   - avec session : GET /api/imladrik (Bearer) → entrées (RLS, privées par
//     owner), la plus récente en tête. AUCUNE page en dur : les données intimes
//     ne viennent QUE de l'API authentifiée. Pas de mode démo (rien de simulé) ;
//   - écrire : POST /api/imladrik/entrees {titre?, contenu} ; effacer :
//     DELETE (avec confirmation — un écrit intime ne se perd pas par mégarde).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
// Aucun contenu de page en console/log (PII intime) : erreurs génériques.
(function () {
  'use strict';

  var etat = { session: null, entrees: [] };

  function el(nom, classe, texte) {
    var element = document.createElement(nom);
    if (classe) { element.className = classe; }
    if (texte !== undefined && texte !== null) { element.textContent = texte; }
    return element;
  }

  // ---------- Fonction PURE (testable) : date lisible « carte savante » ----------
  // ISO → « 23 juillet 2026 à 14:05 ». Entrée invalide → chaîne vide (jamais NaN).
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
    'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function formaterDate(iso) {
    if (typeof iso !== 'string' || !iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear() + ' à ' + h + ':' + m;
  }

  // ---------- États de la page (un seul visible à la fois) ----------

  function montrer(id) {
    ['imladrik-chargement', 'imladrik-auth', 'imladrik-erreur', 'imladrik-registre']
      .forEach(function (nom) {
        var bloc = document.getElementById(nom);
        if (bloc) { bloc.hidden = (nom !== id); }
      });
  }

  // ---------- Rendu d'une page de journal ----------

  function rendreCorps(contenu, carte) {
    // Préserve les sauts de ligne du texte intime : un <p> par ligne non vide.
    var lignes = String(contenu || '').split('\n');
    var corps = el('div', 'imladrik-entree-corps');
    var aQuelqueChose = false;
    lignes.forEach(function (ligne) {
      var t = ligne.trim();
      if (!t) { return; }
      corps.appendChild(el('p', null, t));
      aQuelqueChose = true;
    });
    if (!aQuelqueChose) { corps.appendChild(el('p', null, String(contenu || ''))); }
    carte.appendChild(corps);
  }

  function rendreEntree(entree) {
    var carte = el('article', 'imladrik-entree');
    carte.id = 'imladrik-entree-' + entree.id;

    var entete = el('header', 'imladrik-entree-entete');
    if (entree.titre) {
      entete.appendChild(el('h3', 'imladrik-entree-titre', String(entree.titre)));
    }
    entete.appendChild(el('time', 'imladrik-entree-date', formaterDate(entree.created_at)));
    carte.appendChild(entete);

    rendreCorps(entree.contenu, carte);

    // Effacement (confirmé) — un écrit intime ne se perd pas par mégarde.
    var actions = el('div', 'imladrik-entree-actions');
    var effacer = el('button', 'imladrik-bouton-effacer', 'Effacer');
    effacer.type = 'button';
    effacer.setAttribute('aria-label', 'Effacer cette page du journal');
    effacer.addEventListener('click', function () { demanderEffacement(entree); });
    actions.appendChild(effacer);
    carte.appendChild(actions);

    return carte;
  }

  function rendreEntrees() {
    var conteneur = document.getElementById('imladrik-entrees');
    if (!conteneur) { return; }
    conteneur.textContent = '';
    var liste = Array.isArray(etat.entrees) ? etat.entrees : [];
    if (liste.length === 0) {
      conteneur.appendChild(el('p', 'adr-vide',
        'Ton journal est vide — écris ta première page ci-dessus.'));
      return;
    }
    liste.forEach(function (e) { conteneur.appendChild(rendreEntree(e)); });
  }

  // ---------- Écritures (Bearer, erreurs génériques) ----------

  function messageForm(texte, estErreur) {
    var zone = document.getElementById('imladrik-form-message');
    if (!zone) { return; }
    zone.textContent = texte || '';
    zone.classList.toggle('reshiram-form-message--erreur', Boolean(estErreur));
  }

  async function appelApi(chemin, methode, corps) {
    if (!etat.session || !etat.session.access_token) { return { ok: false, status: 401 }; }
    var options = {
      method: methode,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + etat.session.access_token
      }
    };
    if (corps !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(corps);
    }
    var reponse;
    try {
      reponse = await fetch(chemin, options);
    } catch (e) {
      return { ok: false, status: 0 };
    }
    var data = null;
    try { data = await reponse.json(); } catch (e) { data = null; }
    return { ok: reponse.ok && data && data.ok === true, status: reponse.status, data: data };
  }

  async function soumettreEntree(form) {
    var contenu = (form.elements.contenu.value || '').trim();
    if (!contenu) { messageForm('Écris quelque chose avant de consigner.', true); return; }
    var titre = (form.elements.titre.value || '').trim();
    var corps = { contenu: contenu };
    if (titre) { corps.titre = titre; }

    messageForm('Enregistrement…', false);
    var res = await appelApi('/api/imladrik/entrees', 'POST', corps);
    if (res.status === 401) { montrer('imladrik-auth'); return; }
    if (!res.ok) { messageForm('Enregistrement impossible. Réessaie.', true); return; }
    form.reset();
    messageForm('Page consignée.', false);
    await rafraichir();
  }

  async function demanderEffacement(entree) {
    var titre = entree.titre ? '« ' + entree.titre + ' »' : 'cette page';
    if (typeof window.confirm === 'function' &&
        !window.confirm('Effacer ' + titre + ' du journal ? Cet écrit sera perdu.')) {
      return;
    }
    var res = await appelApi('/api/imladrik/entrees?id=' + encodeURIComponent(entree.id), 'DELETE');
    if (res.status === 401) { montrer('imladrik-auth'); return; }
    if (!res.ok) { messageForm('Effacement impossible. Réessaie.', true); return; }
    await rafraichir();
  }

  // ---------- Flux : session → API → journal (fail-closed partout) ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  async function chargerJournal() {
    var reponse;
    try {
      reponse = await fetch('/api/imladrik', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        }
      });
    } catch (e) {
      montrer('imladrik-erreur');
      return false;
    }
    if (reponse.status === 401) { montrer('imladrik-auth'); return false; } // fail-closed
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (!reponse.ok || !corps || corps.ok !== true) {
      montrer('imladrik-erreur');
      return false;
    }
    etat.entrees = (corps.data && corps.data.entrees) || [];
    rendreEntrees();
    montrer('imladrik-registre');
    // Section Drive : traite un éventuel retour de connexion, sinon peint le statut.
    var params = new URLSearchParams(window.location.search);
    if (params.get('drive')) { traiterRetourDrive(); } else { initDrive(); }
    return true;
  }

  async function rafraichir() {
    await chargerJournal();
  }

  // ----- Sauvegarde Google Drive (sous-boucle ①b) -----

  function driveEtat(texte) {
    var z = document.getElementById('imladrik-drive-etat');
    if (z) { z.textContent = texte || ''; }
  }
  function driveBouton(id, visible) {
    var b = document.getElementById(id);
    if (b) { b.hidden = !visible; }
  }

  // Lit le statut de connexion Drive et peint la section (cachée si non configurée).
  async function initDrive() {
    var section = document.getElementById('imladrik-drive');
    if (!section) { return; }
    var res = await appelApi('/api/imladrik/drive/status', 'GET');
    var payload = res.data && res.data.data; // appelApi renvoie le corps complet {ok,data}
    if (!res.ok || !payload || payload.configured !== true) {
      section.hidden = true; // pas de connexion Drive configurée côté serveur
      return;
    }
    section.hidden = false;
    if (payload.connected) {
      driveEtat('Connecté ✓ — tes pages pourront être sauvegardées dans ton Drive.');
      driveBouton('imladrik-drive-connecter', false);
      driveBouton('imladrik-drive-deconnecter', true);
    } else {
      driveEtat('Ton journal n’est pas encore relié à ton Google Drive.');
      driveBouton('imladrik-drive-connecter', true);
      driveBouton('imladrik-drive-deconnecter', false);
    }
  }

  async function connecterDrive() {
    driveEtat('Redirection vers Google…');
    var res = await appelApi('/api/imladrik/drive/authorize', 'GET');
    if (res.status === 401) { montrer('imladrik-auth'); return; }
    var payload = res.data && res.data.data;
    if (!res.ok || !payload || !payload.url) {
      driveEtat('Connexion Drive indisponible pour l’instant. Réessaie.');
      return;
    }
    // Navigation top-level vers le consentement Google (hors CSP connect-src).
    window.location.href = payload.url;
  }

  async function deconnecterDrive() {
    if (typeof window.confirm === 'function' &&
        !window.confirm('Déconnecter ton Google Drive d’Ultima ?')) { return; }
    var res = await appelApi('/api/imladrik/drive/disconnect', 'POST', {});
    if (res.status === 401) { montrer('imladrik-auth'); return; }
    await initDrive();
  }

  // Retour du callback OAuth : le front (authentifié) déclenche l'échange final.
  async function traiterRetourDrive() {
    var params = new URLSearchParams(window.location.search);
    var drive = params.get('drive');
    if (!drive) { return; }
    // Nettoie l'URL quoi qu'il arrive (pas de paramètre qui traîne).
    try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) { /* noop */ }
    if (drive === 'error') {
      driveEtat('La connexion à Google a été interrompue. Tu peux réessayer.');
      return;
    }
    if (drive === 'callback') {
      driveEtat('Finalisation de la connexion…');
      var res = await appelApi('/api/imladrik/drive/finalize', 'POST', {});
      if (res.status === 401) { montrer('imladrik-auth'); return; }
      if (!res.ok) { driveEtat('La connexion n’a pas pu être finalisée. Réessaie.'); return; }
    }
    await initDrive();
  }

  function brancherFormulaire() {
    var form = document.getElementById('imladrik-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        soumettreEntree(form);
      });
    }
    var bConn = document.getElementById('imladrik-drive-connecter');
    if (bConn) { bConn.addEventListener('click', connecterDrive); }
    var bDeco = document.getElementById('imladrik-drive-deconnecter');
    if (bDeco) { bDeco.addEventListener('click', deconnecterDrive); }
  }

  async function demarrer() {
    montrer('imladrik-chargement');
    brancherFormulaire();
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('imladrik-auth'); // pas de mode démo : données intimes uniquement
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
      montrer('imladrik-auth');
      return;
    }
    etat.session = session;
    await chargerJournal();
  }

  // Fonction pure exposée pour les unitaires/harnais (aucune donnée réelle).
  window.UltimaImladrik = { formaterDate: formaterDate };

  demarrer().catch(function () { montrer('imladrik-erreur'); });
})();
