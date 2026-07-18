// Cartouche d'accueil de Léo (boucle L1) — mode démo (fixture de test).
// Prouve : le cartouche apparaît après le boot des données, porte les 3
// sections (Où on en est / Travaux en cours / Propositions), la proposition
// n°1 correspond à la relance EN RETARD du jeu de démo (M. Lambert, 2 jours),
// fermeture par Échap et par « C'est parti », NON-réapparition dans la même
// session (sessionStorage), focus initial + piège de focus, propositions
// cliquables (fiche ouverte), fail-closed sans données, contraste AA calculé,
// mobile plein écran doux, zéro requête externe, zéro erreur console.
// Leaflet/OSM stubés, config Supabase vide (mode démo), zéro erreur tolérée.
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
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

async function preparerPage(page) {
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// ===================== A. Desktop : apparition, contenu, fermetures =====================
console.log('— A. Cartouche de Léo (desktop, mode démo) —');
const page = await navigateur.newPage({ viewport: { width: 1280, height: 800 } });

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));
// Hôtes attendus de l'app (tous stubés par preparerPage) : le cartouche de
// Léo, lui, ne doit déclencher AUCUNE requête supplémentaire (zéro IA, zéro
// coût). Tout autre hôte est une fuite réseau interdite.
const HOTES_OK = ['127.0.0.1:8123', 'unpkg.com', 'tile.openstreetmap.org'];
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (url.startsWith('data:')) return;
  if (!HOTES_OK.some((h) => new URL(url).host.endsWith(h))) requetesExternes.push(url);
});

await preparerPage(page);
await page.goto(`${BASE}/traveler.html`, { waitUntil: 'load', timeout: 20000 });

// 1. Apparition après le boot des données.
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
const cartouche = page.locator('#leo-cartouche');
verifier('Cartouche visible après le boot', await cartouche.isVisible());
verifier('role="dialog" + aria-modal', await cartouche.evaluate((el) =>
  el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true'));
verifier('Titre « Léo » (aria-labelledby)', await cartouche.evaluate((el) => {
  const t = document.getElementById(el.getAttribute('aria-labelledby'));
  return Boolean(t) && t.textContent.trim() === 'Léo';
}));
verifier('Blason boussole présent (SVG muet)', await page.locator('.leo-blason[aria-hidden="true"]').count() === 1);
const salutation = (await page.locator('.leo-salutation').textContent())?.trim();
verifier('Salutation sobre', /Bienvenue, Paul/.test(salutation || ''), `lu: ${salutation}`);

// 2. Les 3 sections.
const sousTitres = (await page.locator('.leo-sous-titre').allTextContents()).map((t) => t.trim());
verifier('3 sections présentes', sousTitres.length === 3, JSON.stringify(sousTitres));
verifier('Section « Où on en est »', sousTitres.includes('Où on en est'));
verifier('Section « Travaux en cours »', sousTitres.includes('Travaux en cours'));
verifier('Section « Propositions »', sousTitres.includes('Propositions'));

// Où on en est : la dernière entrée du jeu de démo (demo-j3, hier).
const journal = (await page.locator('.leo-journal').textContent()) || '';
verifier('Dernière note du journal restituée', /Plans reçus de l’architecte/.test(journal), `lu: ${journal}`);
verifier('Cible de la note nommée', /Mme Nguyen/.test(journal));

// Travaux en cours : comptes du jeu de démo (1 retard, 1 du jour, 2 leads).
const travaux = (await page.locator('.leo-travail').allTextContents()).map((t) => t.trim());
verifier('1 relance en retard comptée', travaux.some((t) => /^1 relance en retard$/.test(t)), JSON.stringify(travaux));
verifier('1 relance du jour comptée', travaux.some((t) => /^1 relance aujourd'hui$/.test(t)));
verifier('2 leads à suivre comptés', travaux.some((t) => /^2 leads à suivre$/.test(t)));

// 3. Propositions : la n°1 EST la relance en retard du jeu de démo.
const propositions = (await page.locator('.leo-proposition').allTextContents()).map((t) => t.trim());
verifier('1 à 3 propositions', propositions.length >= 1 && propositions.length <= 3, `${propositions.length}`);
verifier('Proposition n°1 = relance la plus en retard (M. Lambert, 2 jours)',
  /^Relancer/.test(propositions[0] || '') && /M\. Lambert/.test(propositions[0] || '') &&
  /en retard de 2 jours/.test(propositions[0] || ''), `lue: ${propositions[0]}`);
verifier('La relance du jour est proposée (Mme Nguyen)',
  propositions.some((p) => /Aujourd'hui/.test(p) && /Mme Nguyen/.test(p)), JSON.stringify(propositions));
verifier("L'idée dormante (U9) est proposée",
  propositions.some((p) => /dort depuis plus de 14 jours/.test(p)));

// 4. Accessibilité : focus initial sur « C'est parti », Tab piégé.
verifier("Focus initial sur « C'est parti »", await page.evaluate(() =>
  document.activeElement && document.activeElement.id === 'leo-partir'));
await page.keyboard.press('Tab');
verifier('Tab reste piégé dans le cartouche', await page.evaluate(() =>
  document.getElementById('leo-cartouche').contains(document.activeElement)));

// 5. Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    parchemin: cs.getPropertyValue('--parchemin').trim(),
    titre: getComputedStyle(document.querySelector('.leo-titre')).color,
    salutation: getComputedStyle(document.querySelector('.leo-salutation')).color,
    travail: getComputedStyle(document.querySelector('.leo-travail')).color,
    proposition: getComputedStyle(document.querySelector('.leo-proposition')).color,
    partir: getComputedStyle(document.querySelector('.leo-partir')).color,
  };
});
for (const [nom, couleur] of [['titre', styles.titre], ['salutation', styles.salutation],
  ['travail', styles.travail], ['proposition', styles.proposition]]) {
  const r = ratio(versHex(couleur), styles.parchemin);
  verifier(`Contraste ${nom} sur parchemin ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
}
const rPartir = ratio(versHex(styles.partir), '#1a5a78'); // haut (le plus clair) du dégradé
verifier('Contraste « C\'est parti » ≥ 4,5:1', rPartir >= 4.5, `${rPartir.toFixed(2)}:1`);

// 6. Échap ferme.
await page.keyboard.press('Escape');
verifier('Échap ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);

// 7. Non-réapparition dans la même session de navigation (sessionStorage).
verifier('Marqueur de session posé', await page.evaluate(() =>
  window.sessionStorage.getItem('ultima-leo-accueil-vu') === '1'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('.cartouche-ultima', { timeout: 20000 });
await page.waitForTimeout(600); // le boot démo est synchrone : marge large
verifier('Pas de réapparition après rechargement (même session)',
  await page.locator('#leo-cartouche').count() === 0);

// 8. Proposition cliquable → fiche concernée (endroit existant de l'app).
await page.evaluate(() => window.sessionStorage.removeItem('ultima-leo-accueil-vu'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
await page.locator('.leo-proposition').first().click();
verifier('Le clic ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);
await page.waitForSelector('#panneau:not([hidden])', { timeout: 20000 });
const titreFiche = (await page.locator('#panneau-titre').textContent())?.trim();
verifier('La fiche de M. Lambert est ouverte', /M\. Lambert/.test(titreFiche || ''), `titre: ${titreFiche}`);

// 9. Fermeture par le bouton « C'est parti ».
await page.evaluate(() => window.sessionStorage.removeItem('ultima-leo-accueil-vu'));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
await page.locator('#leo-partir').click();
verifier('« C\'est parti » ferme le cartouche', await page.locator('#leo-cartouche').count() === 0);

// 10. Fail-closed : sans données, jamais de cartouche (et le marqueur reste vierge).
const failClosed = await page.evaluate(() => {
  window.sessionStorage.removeItem('ultima-leo-accueil-vu');
  window.UltimaLeo.accueillir({ noeuds: [], relations: [], journal: [] }, {});
  return {
    cartouche: document.getElementById('leo-cartouche') === null,
    marqueur: window.sessionStorage.getItem('ultima-leo-accueil-vu') === null,
  };
});
verifier('Fail-closed : pas de données → pas de cartouche', failClosed.cartouche && failClosed.marqueur);

// 11. Pureté du calcul : calculerRecap est exposée et déterministe.
const recapVide = await page.evaluate(() =>
  window.UltimaLeo.calculerRecap({ noeuds: [], relations: [], journal: [] }, '2026-07-18'));
verifier('calculerRecap pure : état vide → récap vide', recapVide.dernierJournal === null &&
  recapVide.retard === 0 && recapVide.duJour === 0 && recapVide.propositions.length === 0);

verifier('Zéro requête réseau hors app (le cartouche ne fait aucun appel)',
  requetesExternes.length === 0, requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (desktop)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));
await page.close();

// ===================== B. Mobile : plein écran doux, tap targets =====================
console.log('— B. Cartouche de Léo (mobile 375×700) —');
const pageM = await navigateur.newPage({ viewport: { width: 375, height: 700 } });
const erreursMobile = [];
pageM.on('console', (msg) => { if (msg.type() === 'error') erreursMobile.push(msg.text()); });
pageM.on('pageerror', (err) => erreursMobile.push(String(err)));
await preparerPage(pageM);
await pageM.goto(`${BASE}/traveler.html`, { waitUntil: 'load', timeout: 20000 });
await pageM.waitForSelector('#leo-cartouche', { timeout: 20000 });

const gabarit = await pageM.evaluate(() => {
  const c = document.getElementById('leo-cartouche').getBoundingClientRect();
  const p = document.getElementById('leo-partir').getBoundingClientRect();
  const prop = document.querySelector('.leo-proposition').getBoundingClientRect();
  return { largeur: c.width, boutonH: p.height, propositionH: prop.height, viewport: window.innerWidth };
});
verifier('Mobile : cartouche plein écran doux (pleine largeur)',
  Math.round(gabarit.largeur) === gabarit.viewport, `${gabarit.largeur}px / ${gabarit.viewport}px`);
verifier('Tap target « C\'est parti » ≥ 44 px', gabarit.boutonH >= 44, `${gabarit.boutonH}px`);
verifier('Tap target proposition ≥ 44 px', gabarit.propositionH >= 44, `${gabarit.propositionH}px`);

await pageM.locator('#leo-partir').click();
verifier('Fermeture au doigt (mobile)', await pageM.locator('#leo-cartouche').count() === 0);
verifier('Zéro erreur console (mobile)', erreursMobile.length === 0, erreursMobile.slice(0, 3).join(' | '));
await pageM.close();

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE LÉO ACCUEIL VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
