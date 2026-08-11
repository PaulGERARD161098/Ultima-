// Authentification de l'ACCUEIL (boussole LV2) — porte de connexion unique.
//
// La boussole est le point d'entrée d'Ultima : c'est ici que la connexion se
// fait ET que le retour OAuth Google se termine. Google (comme le lien magique)
// renvoie sur window.location.origin = « / » = cette page ; le client Supabase
// créé ici consomme le jeton du fragment (#access_token=…), établit la session
// et nettoie l'URL (detectSessionInUrl, comportement par défaut de supabase-js).
//
// La session vit dans le localStorage (même origine) : une fois ouverte ici,
// elle vaut pour tous les quadrants (ultima/riven/idees/adramelech) sans
// nouvelle connexion. Verrou : la boussole reste cachée tant qu'aucune session
// n'est ouverte (parité avec l'overlay de riven.html — mêmes id/handlers,
// mêmes styles css/styles.css).
//
// Repli sûr : sans configuration Supabase (mode démo / clés absentes), on
// n'affiche pas d'écran de connexion et la boussole reste visible.
(function () {
  'use strict';

  function $(sel) { return document.querySelector(sel); }

  var etat = { client: null, session: null, modeDemo: false };

  function toast(message, genre) {
    var hote = $('#toasts');
    if (!hote) { return; }
    var el = document.createElement('div');
    el.className = 'toast ' + (genre === 'erreur' ? 'toast-erreur' : 'toast-succes');
    el.textContent = message;
    hote.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  function configPresente() {
    var cfg = window.ULTIMA_CONFIG || {};
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  }

  // Tant que l'overlay couvre l'écran, la boussole derrière ne doit être
  // atteignable ni au clavier ni au lecteur d'écran (parité A4 de riven).
  function majInert(overlayVisible) {
    var scene = $('.boussole-scene');
    if (!scene) { return; }
    if (overlayVisible) { scene.setAttribute('inert', ''); }
    else { scene.removeAttribute('inert'); }
  }

  // Livre la session (ou son absence) au cockpit de la boussole (LV2-⑤) : il en
  // tire les résumés vivants. Fail-closed : token null → la boussole garde le
  // texte figé. Le hook peut ne pas être encore prêt (ordre de scripts) → garde.
  function livrerCockpit() {
    if (!window.UltimaBoussole || typeof window.UltimaBoussole.poserSession !== 'function') { return; }
    var token = (etat.session && etat.session.access_token) || null;
    window.UltimaBoussole.poserSession(token);
  }

  function majAuthUi() {
    if (etat.modeDemo) { return; }
    var connecte = Boolean(etat.session);
    var form = $('#form-connexion');
    if (form) { form.hidden = connecte; }
    var overlayVisible = !connecte;
    var ecran = $('#ecran-connexion');
    if (ecran) { ecran.hidden = !overlayVisible; }
    majInert(overlayVisible);
    livrerCockpit();
  }

  async function envoyerLienMagique(evenement) {
    evenement.preventDefault();
    var champ = $('#champ-email');
    var email = champ ? champ.value.trim() : '';
    if (!email || !etat.client) { return; }
    try {
      var resultat = await etat.client.auth.signInWithOtp({
        email: email,
        // Ultima est mono-utilisateur : jamais de création de compte.
        options: { emailRedirectTo: window.location.origin, shouldCreateUser: false }
      });
      if (resultat.error) { throw resultat.error; }
      toast('Lien de connexion envoyé. Vérifiez votre boîte mail.');
    } catch (e) {
      toast('Envoi du lien impossible.', 'erreur');
    }
  }

  // Connexion Google : redirige vers Google puis revient sur l'accueil, où le
  // jeton est consommé au chargement. Navigation top-level : hors CSP.
  async function seConnecterGoogle() {
    if (!etat.client) { return; }
    try {
      var resultat = await etat.client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (resultat.error) { throw resultat.error; }
    } catch (e) {
      toast('Connexion Google impossible.', 'erreur');
    }
  }

  async function initAuth() {
    // Sans config : mode démo — pas de verrou, la boussole reste visible.
    if (!configPresente() ||
        !window.supabase || typeof window.supabase.createClient !== 'function') {
      etat.modeDemo = true;
      var ecranDemo = $('#ecran-connexion');
      if (ecranDemo) { ecranDemo.hidden = true; }
      return;
    }
    var cfg = window.ULTIMA_CONFIG;
    etat.client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

    // getSession() déclenche la consommation du fragment OAuth/lien-magique et
    // le nettoyage de l'URL (detectSessionInUrl par défaut).
    var resultat = await etat.client.auth.getSession();
    etat.session = (resultat && resultat.data && resultat.data.session) || null;

    etat.client.auth.onAuthStateChange(function (evenement, session) {
      etat.session = session;
      if (evenement === 'SIGNED_IN' || evenement === 'SIGNED_OUT' ||
          evenement === 'TOKEN_REFRESHED') {
        majAuthUi();
      }
    });

    var form = $('#form-connexion');
    if (form) { form.addEventListener('submit', envoyerLienMagique); }
    var boutonGoogle = $('#bouton-google');
    if (boutonGoogle) { boutonGoogle.addEventListener('click', seConnecterGoogle); }

    majAuthUi();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
