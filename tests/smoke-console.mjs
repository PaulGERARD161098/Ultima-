// Console d'accueil (boucle C1-a) : coque à 4 quadrants (index.html).
// Prouve : rendu de la console (accueil + invite + 4 cartouches), blasons
// étiquetés, TRAVELER actif qui navigue vers traveler.html, 3 quadrants
// « à venir » inertes (aria-disabled, non-liens), AUCUNE requête réseau
// externe (zéro CDN), zéro erreur console, contraste AA calculé sur les
// couleurs réellement rendues. Puis NON-RÉGRESSION : traveler.html s'ouvre
// et la carte Leaflet s'initialise.
// Mode démo forcé, Leaflet/OSM stubés (pour traveler.html), zéro erreur tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

// ---- Contraste WCAG (mêmes formules que le reste du harnais). ----
function luminance(hex) {
  const m = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = m.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function ratio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
// rgb(...) → #hex (les couleurs calculées reviennent en rgb).
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

async function preparerRoutes(page) {
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  await page.addInitScript(() => {
    // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
    try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const contexte = await navigateur.newContext();
const page = await contexte.newPage();

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));

// Journal des requêtes : tout ce qui n'est pas 127.0.0.1:8123 ni data: est
// une fuite réseau interdite sur la console.
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) requetesExternes.push(url);
});

await preparerRoutes(page);

// ===================== A. La console (index.html) =====================
console.log('— A. Console d\'accueil —');
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });

const titre = (await page.locator('h1.console-titre').textContent())?.trim();
verifier('Bandeau « Bienvenue sur Ultima »', titre === 'Bienvenue sur Ultima', `lu: ${titre}`);

const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite présente', /Sur quoi est-ce qu'on travaille aujourd'hui/.test(invite || ''), `lu: ${invite}`);

const noms = await page.locator('.quadrant-nom').allTextContents();
verifier('4 quadrants présents', noms.length === 4, `trouvés: ${noms.length}`);
for (const attendu of ['TRAVELER', 'BCP', 'ADRAMELECH', 'IMLADRIK']) {
  verifier(`Quadrant ${attendu} présent`, noms.map((n) => n.trim()).includes(attendu));
}

// TRAVELER = lien actif vers traveler.html.
const traveler = page.locator('a.quadrant-actif');
verifier('TRAVELER est un lien (une seule ancre active)', (await traveler.count()) === 1);
const href = await traveler.getAttribute('href');
verifier('TRAVELER pointe vers traveler.html', href === 'traveler.html', `href: ${href}`);

// Les 3 « à venir » : non-liens, aria-disabled.
const avenir = page.locator('.quadrant-avenir');
verifier('3 quadrants « à venir »', (await avenir.count()) === 3);
const avenirSontDiv = await avenir.evaluateAll((els) =>
  els.every((e) => e.tagName === 'DIV' && e.getAttribute('aria-disabled') === 'true'));
verifier('« à venir » = <div> aria-disabled, jamais de lien', avenirSontDiv);
const adraEtat = (await page.locator('.quadrant-avenir', { hasText: 'ADRAMELECH' }).locator('.quadrant-etat').textContent())?.trim();
verifier('ADRAMELECH marqué privé', /priv/i.test(adraEtat || ''), `état: ${adraEtat}`);

// Blasons étiquetés (aria-label).
const blasons = await page.locator('.blason-svg').evaluateAll((els) =>
  els.map((e) => e.getAttribute('aria-label')));
verifier('4 blasons étiquetés (aria-label)', blasons.length === 4 && blasons.every((l) => l && /Blason/i.test(l)),
  JSON.stringify(blasons));

// Focus clavier visible sur le quadrant actif (il est focusable).
await traveler.focus();
const estFocalise = await traveler.evaluate((el) => el === document.activeElement);
verifier('Quadrant actif focusable au clavier', estFocalise);

// Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const nom = getComputedStyle(document.querySelector('.quadrant-nom'));
  const desc = getComputedStyle(document.querySelector('.quadrant-desc'));
  const t = getComputedStyle(document.querySelector('.console-titre'));
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom.color, desc: desc.color, titre: t.color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de quadrant ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rDesc = ratio(versHex(styles.desc), styles.parcheminCarte);
verifier('Contraste description ≥ 4,5:1', rDesc >= 4.5, `${rDesc.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (console)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ===================== B. Navigation + non-régression traveler.html =====================
console.log('— B. TRAVELER → traveler.html (carte) —');
const erreursTraveler = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursTraveler.push(msg.text()); });
await traveler.click();
await page.waitForURL('**/traveler.html', { timeout: 20000 });
verifier('Clic TRAVELER → URL traveler.html', /\/traveler\.html$/.test(page.url()), page.url());

// L'app démarre : cartouche ULTIMA visible.
await page.waitForSelector('.cartouche-ultima', { timeout: 20000 });
verifier('App bootée (cartouche ULTIMA)', await page.locator('.cartouche-ultima').isVisible());

// La carte Leaflet s'initialise quand on ouvre l'onglet Carte.
await page.locator('.onglet[data-onglet="carte"]').click();
await page.waitForSelector('.leaflet-container', { timeout: 20000 });
verifier('Carte Leaflet initialisée (zéro régression)', await page.locator('.leaflet-container').count() >= 1);
verifier('Zéro erreur console (traveler.html)', erreursTraveler.length === 0, erreursTraveler.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE CONSOLE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
