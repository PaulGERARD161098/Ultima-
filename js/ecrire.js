// Ultima — LA CAPTURE (boucle ② MAEDRETHNIR, dictée Paul 2026-08-01).
// ---------------------------------------------------------------------------
// Diagnostic de la boucle ① : le journal est vide non parce que sa forme est
// mauvaise ou son contenu absent, mais parce que le cap n'est pas ATTEIGNABLE
// au moment où l'envie d'écrire arrive — elle surgit en marchant, au pouce et
// à la voix. Cette page répond à ça, et à rien d'autre :
//   - une seule chose à l'écran, le champ prêt et focalisé ;
//   - un seul appui pour déposer ;
//   - un BROUILLON LOCAL écrit AVANT tout appel réseau : ce qui a été dicté en
//     marchant ne se perd jamais, même sans réseau, même si la session a
//     expiré. Il repart tout seul au retour du réseau ou à la prochaine venue.
// Écriture via l'API existante POST /api/imladrik (aucune API nouvelle).
// Injection DOM : createElement/textContent uniquement (CSP — jamais innerHTML).
(function () {
  'use strict';

  // Le brouillon survit à la fermeture de l'onglet, à la perte de réseau et à
  // l'expiration de session. C'est la seule promesse qu'on doit à quelqu'un qui
  // vient de dicter trois phrases en marchant.
  var CLE_BROUILLON = 'ultima-maedrethnir-brouillon';

  var etat = { session: null, envoiEnCours: false };

  function $(id) { return document.getElementById(id); }

  function montrer(id) {
    ['ecrire-chargement', 'ecrire-auth', 'ecrire-form'].forEach(function (nom) {
      var bloc = $(nom);
      if (bloc) { bloc.hidden = (nom !== id); }
    });
  }

  function message(texte, ton) {
    var zone = $('ecrire-message');
    if (!zone) { return; }
    zone.textContent = texte || '';
    zone.classList.toggle('ecrire-message--erreur', ton === 'erreur');
    zone.classList.toggle('ecrire-message--garde', ton === 'garde');
  }

  // ---------- Le brouillon local ----------

  function lireBrouillon() {
    try { return window.localStorage.getItem(CLE_BROUILLON) || ''; } catch (e) { return ''; }
  }
  function poserBrouillon(texte) {
    try {
      if (texte) { window.localStorage.setItem(CLE_BROUILLON, texte); }
      else { window.localStorage.removeItem(CLE_BROUILLON); }
    } catch (e) { /* stockage indisponible : on continue sans filet, sans bruit */ }
  }

  // ---------- L'envoi ----------

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG;
    return Boolean(cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  // Renvoie 'depose' | 'garde' (réseau/serveur indisponible) | 'session'.
  async function deposer(contenu) {
    if (!etat.session || !etat.session.access_token) { return 'session'; }
    var reponse;
    try {
      reponse = await fetch('/api/imladrik', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + etat.session.access_token
        },
        // Pas de titre : décision de Paul. Une capture au pouce ne demande rien
        // avant le premier mot ; le titre vit dans l'atelier posé.
        body: JSON.stringify({ contenu: contenu })
      });
    } catch (e) {
      return 'garde';   // hors réseau : le brouillon reste, il repartira
    }
    if (reponse.status === 401) { return 'session'; }
    var corps = null;
    try { corps = await reponse.json(); } catch (e) { corps = null; }
    if (reponse.ok && corps && corps.ok === true) { return 'depose'; }
    return 'garde';
  }

  async function soumettre() {
    if (etat.envoiEnCours) { return; }
    var champ = $('ecrire-contenu');
    if (!champ) { return; }
    var contenu = (champ.value || '').trim();
    if (!contenu) {
      message('Rien à déposer pour l’instant.', 'erreur');
      champ.focus();
      return;
    }

    // ORDRE VOLONTAIRE : le brouillon est écrit AVANT l'appel réseau. Si tout
    // échoue ensuite — réseau, serveur, session — le texte est déjà à l'abri.
    poserBrouillon(contenu);

    etat.envoiEnCours = true;
    var bouton = $('ecrire-envoyer');
    if (bouton) { bouton.disabled = true; }
    message('Dépôt…');

    var issue = await deposer(contenu);

    etat.envoiEnCours = false;
    if (bouton) { bouton.disabled = false; }

    if (issue === 'depose') {
      poserBrouillon('');
      champ.value = '';
      message('Déposé. Continue si tu veux.');
      champ.focus();
      return;
    }
    if (issue === 'session') {
      // Le texte reste au brouillon : il repartira dès la reconnexion.
      message('Ta session s’est refermée — ton texte est gardé ici.', 'garde');
      montrer('ecrire-auth');
      return;
    }
    message('Pas de réseau — ton texte est gardé ici, il repartira tout seul.', 'garde');
  }

  // Le brouillon en attente repart dès que le réseau revient, sans rien
  // demander. Silencieux si ça échoue encore : le texte reste au chaud.
  async function reprendreBrouillon() {
    var champ = $('ecrire-contenu');
    var enAttente = lireBrouillon();
    if (!champ || !enAttente) { return; }
    // On ne repart que si le champ est vide OU s'il ne contient QUE le brouillon
    // restauré : sinon on écraserait une saisie en cours. Comparer au brouillon
    // (et pas seulement « champ vide ») est indispensable — après un
    // rechargement, le champ affiche justement ce qui attend d'être envoyé.
    var saisie = (champ.value || '').trim();
    if (saisie && saisie !== enAttente.trim()) { return; }
    var issue = await deposer(enAttente);
    if (issue === 'depose') {
      poserBrouillon('');
      message('Ce que tu avais dicté hors réseau est parti.');
    }
  }

  // ---------- Démarrage ----------

  function brancher() {
    var form = $('ecrire-form');
    if (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); soumettre(); });
    }
    var champ = $('ecrire-contenu');
    if (champ) {
      // À chaque frappe (ou dictée), le brouillon suit. Pas de débounce : le
      // coût est nul et la promesse doit tenir même si l'app est tuée d'un coup.
      champ.addEventListener('input', function () { poserBrouillon(champ.value); });
    }
    // Retour du réseau : ce qui attendait repart.
    window.addEventListener('online', function () { reprendreBrouillon(); });
  }

  async function demarrer() {
    montrer('ecrire-chargement');
    brancher();

    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      montrer('ecrire-auth');
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
      montrer('ecrire-auth');
      return;
    }
    etat.session = session;
    montrer('ecrire-form');

    var champ = $('ecrire-contenu');
    if (champ) {
      // Le champ reprend ce qui attendait, puis se donne le focus : arriver ici
      // doit suffire à pouvoir parler. Certains navigateurs refusent le focus
      // sans geste — le tap sur l'icône en est un ; si le refus tombe quand
      // même, le champ reste à un appui, on n'a rien perdu.
      var enAttente = lireBrouillon();
      if (enAttente && !champ.value) { champ.value = enAttente; }
      // La dictée RÉ-EMBOÎTE le champ dans son enveloppe : poser le focus avant
      // le ferait perdre. On attache d'abord, on focalise ensuite.
      if (window.UltimaDictee && typeof window.UltimaDictee.attacher === 'function') {
        // `signaler` vaut function(){} PAR DÉFAUT dans js/dictee.js : sans cette
        // configuration, TOUT ce que la dictée a à dire est avalé en silence —
        // « je n'ai rien entendu », « micro refusé », « la dictée n'a pas
        // abouti ». C'était le défaut : le bouton répondait, mais muet.
        if (typeof window.UltimaDictee.configurer === 'function') {
          window.UltimaDictee.configurer({
            signaler: function (texte, ton) { message(texte, ton === 'erreur' ? 'erreur' : ''); }
          });
        }
        window.UltimaDictee.attacher(champ, 'ce qui vient');
      }
      try { champ.focus(); } catch (e) { /* focus refusé : sans conséquence */ }
    }
    reprendreBrouillon();
  }

  // Fonctions exposées pour les harnais (aucune donnée réelle).
  window.UltimaEcrire = { CLE_BROUILLON: CLE_BROUILLON };

  demarrer().catch(function () { montrer('ecrire-auth'); });
})();
