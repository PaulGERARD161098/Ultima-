// Compléments : haut de l'Accueil mobile, desktop 1280, état non connecté (§2.1).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const verdicts = {};
const erreurs = [];

async function pageStub(viewport, demo) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  const PNG_1PX = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64');
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  if (demo) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  } else {
    // Config présente + client supabase factice sans session (§2.1).
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return {
        auth: {
          getSession: function () { return Promise.resolve({ data: { session: null } }); },
          onAuthStateChange: function () {}
        }
      }; } };`
    }));
  }
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(800);
  // R1 : l'arrivée se fait sur la Carte — ces vérifications portent sur
  // l'Accueil, on y va par son onglet (parcours réel). En non-démo sans
  // session (A1), l'écran de connexion couvre l'app : on ne navigue pas.
  if (demo) {
    await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
    await page.waitForTimeout(300);
  }
  return page;
}

// Mobile 390 : haut de page.
const mobile = await pageStub({ width: 390, height: 844 }, true);
await mobile.evaluate(() => document.fonts.ready);
await mobile.screenshot({ path: `${SCRATCH}/accueil-haut-390.png` });
// Chevauchement titre / rose des vents ?
verdicts.titreSansChevauchement = await mobile.evaluate(() => {
  const t = document.getElementById('accueil-titre').getBoundingClientRect();
  const r = document.querySelector('.rose-des-vents').getBoundingClientRect();
  const range = document.createRange();
  const h2 = document.getElementById('accueil-titre');
  range.selectNodeContents(h2);
  const texte = range.getBoundingClientRect();
  return texte.right <= r.left || texte.bottom <= r.top || t.right <= r.left;
});
// Pas de défilement horizontal.
verdicts.sansScrollHorizontal = await mobile.evaluate(() =>
  document.documentElement.scrollWidth <= window.innerWidth);
await mobile.close();

// Desktop 1280 : deux colonnes.
const desktop = await pageStub({ width: 1280, height: 900 }, true);
await desktop.evaluate(() => document.fonts.ready);
verdicts.desktopDeuxColonnes = await desktop.evaluate(() => {
  const rel = document.querySelector('.zone-relances').getBoundingClientRect();
  const rap = document.querySelector('.zone-rapprochements').getBoundingClientRect();
  return rap.left > rel.right; // côte à côte
});
await desktop.screenshot({ path: `${SCRATCH}/accueil-desktop-1280.png` });
await desktop.close();

// Non connecté (config présente, pas de session) → écran de connexion A1
// plein écran (le pivot D1 remplace l'app en lecture par la page de connexion).
const nc = await pageStub({ width: 390, height: 844 }, false);
verdicts.ecranConnexionVisible = await nc.locator('#ecran-connexion').isVisible();
verdicts.cartoucheUltima = (await nc.locator('#ecran-connexion .ecran-titre').textContent())?.trim() === 'ULTIMA';
verdicts.formConnexionVisible = await nc.locator('#ecran-connexion #form-connexion').isVisible();
await nc.locator('#champ-email').focus();
verdicts.focusEmail = await nc.evaluate(() => document.activeElement?.id === 'champ-email');
await nc.screenshot({ path: `${SCRATCH}/accueil-non-connecte.png` });
await nc.close();

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-ETATS OK' : 'SMOKE-ETATS ECHEC');
process.exit(ok ? 0 : 1);
