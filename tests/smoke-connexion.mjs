// Vérification boucle A1 : écran de connexion plein écran « Ultima ».
// Habillage de présentation — aucune touche à la logique auth. unpkg/OSM
// stubés (proxy bloquant), client Supabase factice injecté selon le scénario.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const verdicts = {};
const erreurs = [];

// Hôtes légitimes (tout est stubé/local) : toute autre origine = requête
// externe nouvelle, interdite par la CSP et la spec A1.
const HOTES_OK = ['127.0.0.1:8123', 'localhost:8123', 'unpkg.com',
  'tile.openstreetmap.org', 'a.tile.openstreetmap.org', 'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org', 'openstreetmap.org'];

// client : 'aucun' (démo), 'deconnecte', 'connecte'.
async function ouvrir(viewport, client, requetes) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  if (requetes) {
    page.on('request', (r) => {
      try { requetes.push(new URL(r.url()).host); } catch { /* data: */ }
    });
  }
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));

  if (client === 'aucun') {
    await page.addInitScript(() => {
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  } else {
    const session = client === 'connecte'
      ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }'
      : 'null';
    // Client Supabase factice : mêmes signatures que celles appelées par app.js,
    // aucune requête réseau. signInWithOtp résout sans erreur (flux lien-magique).
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return {
        auth: {
          getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
          onAuthStateChange: function () {},
          signInWithOtp: function () { window.__otpAppele = true; return Promise.resolve({ data: {}, error: null }); },
          signInWithOAuth: function (opts) { window.__oauthAppele = opts && opts.provider; return Promise.resolve({ data: {}, error: null }); },
          signOut: function () { return Promise.resolve({ error: null }); }
        }
      }; } };`
    }));
  }
  await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(900);
  return page;
}

// Contraste WCAG entre la couleur de texte d'un élément et le premier fond
// opaque rencontré en remontant ses ancêtres (background-color solide requis).
function poseContraste(page, sel) {
  return page.evaluate((sel) => {
    function lum(rgb) {
      const c = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function parse(couleur) {
      const m = couleur.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      if (p.length === 4 && p[3] === 0) return null; // transparent
      return [p[0], p[1], p[2]];
    }
    const el = document.querySelector(sel);
    const texte = parse(getComputedStyle(el).color);
    let n = el, fond = null;
    while (n) {
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg) { fond = bg; break; }
      n = n.parentElement;
    }
    if (!texte || !fond) return 0;
    const l1 = lum(texte), l2 = lum(fond);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return Math.round(ratio * 100) / 100;
  }, sel);
}

// ---- 1. Déconnecté (config présente, pas de session) : écran visible. ----
const requetesDeco = [];
const deco = await ouvrir({ width: 390, height: 844 }, 'deconnecte', requetesDeco);
verdicts.ecranVisible = await deco.locator('#ecran-connexion').isVisible();
verdicts.cartouche = (await deco.locator('#ecran-connexion .ecran-titre').textContent())?.trim() === 'ULTIMA';
verdicts.decorSvg = await deco.locator('#ecran-connexion .ecran-decor svg').count() === 1;
verdicts.decorMuet = await deco.locator('#ecran-connexion .ecran-decor').getAttribute('aria-hidden') === 'true';
verdicts.formDansEcran = await deco.locator('#ecran-connexion #form-connexion').isVisible();
// #champ-email focusable et effectivement focus.
await deco.locator('#champ-email').focus();
verdicts.emailFocusable = await deco.evaluate(() => document.activeElement?.id === 'champ-email');
// Tap targets ≥ 44 px (input + bouton submit) et pas de scroll horizontal.
verdicts.tapTargets = await deco.evaluate(() => {
  const input = document.getElementById('champ-email').getBoundingClientRect();
  const btn = document.querySelector('#form-connexion button[type="submit"]').getBoundingClientRect();
  return input.height >= 44 && btn.height >= 44;
});
verdicts.sansScrollHorizontal = await deco.evaluate(() =>
  document.documentElement.scrollWidth <= window.innerWidth);

// ---- 5. Contraste ≥ 4,5:1 sur le formulaire (label, input, bouton). ----
const cLabel = await poseContraste(deco, '.ecran-label');
const cInput = await poseContraste(deco, '#champ-email');
const cBouton = await poseContraste(deco, '.bouton-lien-magique');
const cGoogle = await poseContraste(deco, '.bouton-google');
verdicts.contrasteLabel = cLabel >= 4.5;
verdicts.contrasteInput = cInput >= 4.5;
verdicts.contrasteBouton = cBouton >= 4.5;
verdicts.contrasteGoogle = cGoogle >= 4.5;

// ---- RB2. Aide de la page connexion (.ecran-aide) : texte sépia sur le
// cartouche parchemin. Mesure DÉDIÉE au PIRE CAS de fond = le bas du dégradé
// (--parchemin-carte), le stop le plus sombre du cartouche, là où l'aide est
// posée. Distincte des contrastes label/input/bouton (fonds plus clairs). ----
const cAide = await deco.evaluate(() => {
  function lum(rgb) {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function parse(couleur) {
    const m = couleur.match(/rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2]]; }
    const h = couleur.trim().replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(h)) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    return null;
  }
  const el = document.querySelector('.ecran-aide');
  if (!el) return 0;
  const texte = parse(getComputedStyle(el).color);
  // pire cas = bas du dégradé du cartouche parchemin (le stop le plus sombre).
  const fond = parse(getComputedStyle(document.documentElement)
    .getPropertyValue('--parchemin-carte'));
  if (!texte || !fond) return 0;
  const l1 = lum(texte), l2 = lum(fond);
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
});
verdicts.contrasteAideMesuree = cAide > 0;
verdicts.contrasteAide = cAide >= 4.5; // RB2 : aide lisible AA au pire cas de fond

// ---- A4. Garde-fou a11y : app derrière l'overlay rendue inatteignable. ----
// Déconnecté : une commande de l'app (onglet) a un ancêtre inert et ne peut
// PAS recevoir le focus au clavier (inert bloque focus() dans Chromium).
verdicts.appInerteDeco = await deco.evaluate(() => {
  const c = document.querySelector('.barre-onglets .onglet');
  return !!c && !!c.closest('[inert]');
});
verdicts.controleNonFocusableDeco = await deco.evaluate(() => {
  const c = document.querySelector('.barre-onglets .onglet');
  if (!c) { return false; }
  c.focus();
  return document.activeElement !== c;
});

// ---- 2. Flux lien-magique : soumettre appelle le handler existant. ----
await deco.locator('#champ-email').fill('paul@exemple.fr');
await deco.locator('#form-connexion button[type="submit"]').click();
await deco.waitForTimeout(300);
verdicts.otpAppele = await deco.evaluate(() => window.__otpAppele === true);
// Visible, pas seulement présent : le toast doit passer AU-DESSUS de l'overlay
// de connexion (sinon la confirmation reste cachée derrière — constat A1).
verdicts.toastLienEnvoye = await deco.locator('.toast', { hasText: 'Lien de connexion envoyé' }).first().isVisible();
verdicts.toastAuDessusEcran = await deco.evaluate(() => {
  var toast = document.querySelector('.toasts');
  var ecran = document.getElementById('ecran-connexion');
  if (!toast || !ecran) { return false; }
  var zToast = parseInt(getComputedStyle(toast).zIndex, 10) || 0;
  var zEcran = parseInt(getComputedStyle(ecran).zIndex, 10) || 0;
  return zToast > zEcran;
});

// ---- 2bis. Bouton Google : visible dans l'écran, tap target ≥ 44 px, et le
// clic appelle signInWithOAuth avec provider 'google' (handler seConnecterGoogle).
verdicts.googleVisible = await deco.locator('#ecran-connexion #bouton-google').isVisible();
verdicts.googleTapTarget = await deco.evaluate(() =>
  document.getElementById('bouton-google').getBoundingClientRect().height >= 44);
await deco.locator('#bouton-google').click();
await deco.waitForTimeout(200);
verdicts.oauthGoogleAppele = await deco.evaluate(() => window.__oauthAppele === 'google');

// ---- 6. Zéro requête réseau externe nouvelle à l'affichage de l'écran. ----
verdicts.zeroRequeteExterne = requetesDeco.every((h) => HOTES_OK.includes(h));
await deco.screenshot({ path: `${SCRATCH}/connexion-deconnecte.png` });
await deco.close();

// ---- 3. Connecté (session simulée) : écran masqué, app visible. ----
const conn = await ouvrir({ width: 390, height: 844 }, 'connecte');
verdicts.ecranMasqueConnecte = await conn.locator('#ecran-connexion').isHidden();
// L'arrivée connectée est le CIEL depuis le 2026-08-11 (décision de Paul) ;
// c'était l'arbre depuis A3, et la carte avant lui.
verdicts.appVisibleConnecte = await conn.locator('#espace-ciel').isVisible();
verdicts.deconnexionVisible = await conn.locator('#bouton-deconnexion').isVisible();
// A4 : connecté, aucun inert résiduel — l'app est pleinement focusable.
verdicts.appInteractiveConnecte = await conn.evaluate(() => {
  const c = document.querySelector('.barre-onglets .onglet');
  if (!c || c.closest('[inert]')) { return false; }
  c.focus();
  return document.activeElement === c;
});
await conn.close();

// ---- 4. Mode démo : pas d'écran de connexion, ciel visible (arrivée 11/08). ----
const demo = await ouvrir({ width: 390, height: 844 }, 'aucun');
verdicts.ecranMasqueDemo = await demo.locator('#ecran-connexion').isHidden();
verdicts.cielVisibleDemo = await demo.locator('#espace-ciel').isVisible();
verdicts.bandeauDemo = await demo.locator('#bandeau-demo').isVisible();
// A4 : mode démo (pas d'overlay) — aucun inert, l'app reste interactive.
verdicts.appInteractiveDemo = await demo.evaluate(() => {
  const c = document.querySelector('.barre-onglets .onglet');
  if (!c || c.closest('[inert]')) { return false; }
  c.focus();
  return document.activeElement === c;
});
await demo.close();

console.log(JSON.stringify(verdicts, null, 2));
console.log('contrastes (label / input / bouton / google):', cLabel, cInput, cBouton, cGoogle);
console.log('contraste aide (.ecran-aide, pire cas fond):', cAide);
console.log('erreurs page/console:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-CONNEXION OK' : 'SMOKE-CONNEXION ECHEC');
process.exit(ok ? 0 : 1);
