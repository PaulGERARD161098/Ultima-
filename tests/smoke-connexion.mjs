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

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
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
          signOut: function () { return Promise.resolve({ error: null }); }
        }
      }; } };`
    }));
  }
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
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
verdicts.contrasteLabel = cLabel >= 4.5;
verdicts.contrasteInput = cInput >= 4.5;
verdicts.contrasteBouton = cBouton >= 4.5;

// ---- 2. Flux lien-magique : soumettre appelle le handler existant. ----
await deco.locator('#champ-email').fill('paul@exemple.fr');
await deco.locator('#form-connexion button[type="submit"]').click();
await deco.waitForTimeout(300);
verdicts.otpAppele = await deco.evaluate(() => window.__otpAppele === true);
verdicts.toastLienEnvoye = await deco.locator('.toast', { hasText: 'Lien de connexion envoyé' }).count() >= 1;

// ---- 6. Zéro requête réseau externe nouvelle à l'affichage de l'écran. ----
verdicts.zeroRequeteExterne = requetesDeco.every((h) => HOTES_OK.includes(h));
await deco.screenshot({ path: `${SCRATCH}/connexion-deconnecte.png` });
await deco.close();

// ---- 3. Connecté (session simulée) : écran masqué, app visible. ----
const conn = await ouvrir({ width: 390, height: 844 }, 'connecte');
verdicts.ecranMasqueConnecte = await conn.locator('#ecran-connexion').isHidden();
verdicts.appVisibleConnecte = await conn.locator('#espace-carte').isVisible();
verdicts.deconnexionVisible = await conn.locator('#bouton-deconnexion').isVisible();
await conn.close();

// ---- 4. Mode démo : pas d'écran de connexion, carte visible. ----
const demo = await ouvrir({ width: 390, height: 844 }, 'aucun');
verdicts.ecranMasqueDemo = await demo.locator('#ecran-connexion').isHidden();
verdicts.carteVisibleDemo = await demo.locator('#espace-carte').isVisible();
verdicts.bandeauDemo = await demo.locator('#bandeau-demo').isVisible();
await demo.close();

console.log(JSON.stringify(verdicts, null, 2));
console.log('contrastes (label / input / bouton):', cLabel, cInput, cBouton);
console.log('erreurs page/console:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-CONNEXION OK' : 'SMOKE-CONNEXION ECHEC');
process.exit(ok ? 0 : 1);
