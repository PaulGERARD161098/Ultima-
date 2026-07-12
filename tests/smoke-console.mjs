// Vérification boucle C1 : console d'accueil à 4 quadrants (design/spec-c1-console.md).
// Prouve les 6 points du §7. Mode démo (config vide injectée) sauf le sous-cas
// « connecté » du point 1 (client Supabase factice, aucune requête réseau).
// unpkg/OSM stubés (proxy bloquant) ; tout local, zéro CDN.
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

async function ouvrir({ hash = '', client = 'demo', reducedMotion = 'no-preference' } = {}) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion });
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));

  if (client === 'demo') {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  } else {
    // Client Supabase factice avec session : aucune requête réseau (auth seule).
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return {
        auth: {
          getSession: function () { return Promise.resolve({ data: { session: { user: { id: "u-test" }, access_token: "jeton-factice" } } }); },
          onAuthStateChange: function () {},
          signInWithOtp: function () { return Promise.resolve({ data: {}, error: null }); },
          signOut: function () { return Promise.resolve({ error: null }); }
        }
      }; } };`
    }));
  }
  await page.goto(`http://127.0.0.1:8123/${hash}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(700);
  return page;
}

// Contraste WCAG texte / premier fond opaque (repris des smoke existants).
function poseContraste(page, sel) {
  return page.evaluate((sel) => {
    function lum(rgb) {
      const c = rgb.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function parse(couleur) {
      const m = couleur.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x));
      if (p.length === 4 && p[3] === 0) return null;
      return [p[0], p[1], p[2]];
    }
    const el = document.querySelector(sel);
    if (!el) return 0;
    const texte = parse(getComputedStyle(el).color);
    let n = el, fond = null;
    while (n) { const bg = parse(getComputedStyle(n).backgroundColor); if (bg) { fond = bg; break; } n = n.parentElement; }
    if (!texte || !fond) return 0;
    const l1 = lum(texte), l2 = lum(fond);
    return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
  }, sel);
}

// ================= 1. Console d'abord ; coque TRAVELLER masquée. =================
const page = await ouvrir({}); // démo, sans hash
verdicts.consoleVisibleDemo = await page.locator('#espace-console').isVisible();
verdicts.coqueMasqueeDemo =
  (await page.locator('header.entete').isHidden()) &&
  (await page.locator('main.espaces').isHidden()) &&
  (await page.locator('nav.barre-onglets').isHidden());
verdicts.placeholdersMasques =
  (await page.locator('#espace-bcp').isHidden()) &&
  (await page.locator('#espace-adramelech').isHidden()) &&
  (await page.locator('#espace-imladrik').isHidden());
verdicts.titreBienvenue = (await page.locator('#console-titre').textContent()).trim() === 'Bienvenue sur Ultima';
verdicts.invitePresente = (await page.locator('.console-invite').textContent()).includes("aujourd'hui");
verdicts.quatreQuadrants = (await page.locator('.console-quadrant').count()) === 4;
verdicts.sansScrollHorizontal = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

// Sous-cas connecté (§7.1 « Connecté → console visible en premier »).
const conn = await ouvrir({ client: 'connecte' });
verdicts.consoleVisibleConnecte = await conn.locator('#espace-console').isVisible();
verdicts.coqueMasqueeConnecte =
  (await conn.locator('main.espaces').isHidden()) &&
  (await conn.locator('#ecran-connexion').isHidden());
await conn.close();

// ================= 2. Clic TRAVELLER → app existante ; onglets OK. =================
await page.locator('[data-quadrant="traveller"]').click();
verdicts.travellerCoqueVisible =
  (await page.locator('header.entete').isVisible()) &&
  (await page.locator('main.espaces').isVisible()) &&
  (await page.locator('nav.barre-onglets').isVisible());
verdicts.consoleMasqueeApresTraveller = await page.locator('#espace-console').isHidden();
verdicts.ongletInterneActif = (await page.locator('.barre-onglets .onglet[aria-current="page"]').count()) === 1;
// Non-régression : les 4 onglets basculent toujours.
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
verdicts.ongletAccueil = await page.locator('#espace-accueil').isVisible();
await page.locator('.barre-onglets .onglet[data-onglet="arbre"]').click();
verdicts.ongletArbre = await page.locator('#espace-arbre').isVisible();
await page.locator('.barre-onglets .onglet[data-onglet="carte"]').click();
verdicts.ongletCarte = await page.locator('#espace-carte').isVisible();
await page.locator('.barre-onglets .onglet[data-onglet="contacts"]').click();
verdicts.ongletContacts = await page.locator('#espace-contacts').isVisible();

// ================= 3. « ← Ultima » depuis TRAVELLER → retour console. =================
await page.locator('.entete-retour[data-retour-console]').click();
verdicts.retourConsole =
  (await page.locator('#espace-console').isVisible()) &&
  (await page.locator('main.espaces').isHidden());

// ================= 4. BCP / ADRAMELECH / IMLADRIK → placeholder + retour. =============
for (const q of ['bcp', 'adramelech', 'imladrik']) {
  await page.locator(`[data-quadrant="${q}"]`).click();
  const visible = await page.locator(`#espace-${q}`).isVisible();
  const construction = (await page.locator(`#espace-${q}`).textContent()).includes('En construction');
  const resteMasque =
    (await page.locator('main.espaces').isHidden()) &&
    (await page.locator('#espace-console').isHidden());
  await page.locator(`#espace-${q} [data-retour-console]`).click();
  const retour = await page.locator('#espace-console').isVisible();
  verdicts[`${q}Visible`] = visible;
  verdicts[`${q}Construction`] = construction;
  verdicts[`${q}ResteMasque`] = resteMasque;
  verdicts[`${q}Retour`] = retour;
}

// ================= 5. Focus sur le titre de chaque vue ; clavier OK. =================
await page.locator('[data-quadrant="traveller"]').click();
verdicts.focusTraveller = await page.evaluate(() => document.activeElement && document.activeElement.id === 'cartouche-titre-traveller');
await page.locator('.entete-retour').click();
verdicts.focusRetourConsole = await page.evaluate(() => document.activeElement && document.activeElement.id === 'console-titre');
await page.locator('[data-quadrant="bcp"]').click();
verdicts.focusBcp = await page.evaluate(() => document.activeElement && document.activeElement.id === 'bcp-titre');
await page.locator('#espace-bcp [data-retour-console]').click();
// Cartouche focusable au clavier + activable par Entrée (vrai <button>).
await page.locator('[data-quadrant="adramelech"]').focus();
verdicts.quadrantFocusable = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-quadrant') === 'adramelech');
await page.keyboard.press('Enter');
verdicts.clavierEntree = await page.locator('#espace-adramelech').isVisible();
await page.locator('#espace-adramelech [data-retour-console]').click();

// ---- Contrastes AA (§8) sur les nouveaux textes (retour console au préalable). ----
const cInvite = await poseContraste(page, '.console-invite');
const cDesc = await poseContraste(page, '.console-quadrant-desc');
const cPastille = await poseContraste(page, '.console-etat-construction');
verdicts.contrasteInvite = cInvite >= 4.5;
verdicts.contrasteDesc = cDesc >= 4.5;
verdicts.contrastePastille = cPastille >= 4.5;

await page.screenshot({ path: `${SCRATCH}/console.png` });
await page.close();

// ================= 6. Zéro erreur console ; prefers-reduced-motion respecté. =========
const rm = await ouvrir({ reducedMotion: 'reduce' });
verdicts.reducedMotionSansAnimation = await rm.evaluate(() => {
  const el = document.querySelector('.console-quadrant');
  if (!el) return false;
  const t = getComputedStyle(el).transitionDuration;
  return t === '0s' || t === '' || parseFloat(t) === 0;
});
await rm.close();

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('contrastes (invite / desc / pastille):', cInvite, cDesc, cPastille);
console.log('erreurs page/console:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-CONSOLE OK' : 'SMOKE-CONSOLE ECHEC');
process.exit(ok ? 0 : 1);
