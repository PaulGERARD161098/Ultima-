// INTENDANT (AD-5c-δ) — check-list d'approvisionnement de chantier, mode démo.
// Prouve : proposition Léo n°1 = le manquant le plus urgent à J-2 (clic → fiche
// du chantier, section Intendance), bandeau J-2 en tête de fiche, compteur
// « manquants détectés à J-2 » exact à chaque étape, cycle de vie complet d'une
// ligne (naît manquante → commande en attente → livrée + conforme → couverte ;
// contrôle cassé → REPASSE manquante), suppression avec confirmation, date de
// pose modifiable, ouverture d'un dossier sur un chantier vierge, a11y (labels,
// tap targets ≥ 44 px, contraste AA), zéro requête externe, zéro erreur console.
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

// Date locale ISO décalée de N jours (même règle que dateLocaleIso d'app.js —
// le navigateur du harnais partage le fuseau du processus Node).
function dateLocaleIso(decalage) {
  const d = new Date();
  d.setDate(d.getDate() + (decalage || 0));
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0');
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
    // Stub Web Speech API (l'API n'existe pas en headless) : rend déterministe
    // la présence du bouton micro sur le champ Désignation (motif dictée v3-④).
    window.SpeechRecognition = class {
      start() {} stop() {} abort() {}
    };
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// ===================== A. Desktop : Léo → fiche → cycle complet =====================
console.log('— A. INTENDANT (desktop, mode démo) —');
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));
const HOTES_OK = ['127.0.0.1:8123', 'unpkg.com', 'tile.openstreetmap.org'];
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (url.startsWith('data:')) return;
  if (!HOTES_OK.some((h) => new URL(url).host.endsWith(h))) requetesExternes.push(url);
});

await preparerPage(page);
await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });

// 1. Léo : la proposition n°1 EST le manquant le plus urgent à J-2.
await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
const propositions = (await page.locator('.leo-proposition').allTextContents()).map((t) => t.trim());
verifier('Proposition Léo n°1 = manquant J-2 (Voltaire, pose dans 1 jour, 1 manquant)',
  /^Chantier « Réhabilitation immeuble Voltaire » — pose dans 1 jour, 1 manquant\. Compléter l'intendance\.$/
    .test(propositions[0] || ''), `lue: ${propositions[0]}`);
await page.screenshot({ path: `${SCRATCH}/intendant-leo.png` });

// 2. Clic sur la proposition → fiche du chantier, section Intendance.
await page.locator('.leo-proposition').first().click();
await page.waitForSelector('#panneau:not([hidden])', { timeout: 20000 });
const titreFiche = (await page.locator('#panneau-titre').textContent())?.trim();
verifier('Fiche du chantier Voltaire ouverte', /Voltaire/.test(titreFiche || ''), `titre: ${titreFiche}`);
verifier('Section Intendance présente', await page.locator('.section-intendance').count() === 1);

// 3. Bandeau J-2 en tête de fiche + compteur de preuve.
const bandeau = (await page.locator('.bandeau-j2').textContent())?.trim();
verifier('Bandeau J-2 présent : « Pose dans 1 jour — 1 manquant. »',
  bandeau === 'Pose dans 1 jour — 1 manquant.', `lu: ${bandeau}`);
async function compteur() {
  return ((await page.locator('.intendance-compteur').textContent()) || '').trim();
}
verifier('Compteur « Manquants détectés à J-2 : 1 »',
  (await compteur()) === 'Manquants détectés à J-2 : 1', `lu: ${await compteur()}`);

// 4. La check-list de la fixture : 3 lignes, les 3 états visibles.
verifier('3 lignes de besoins (fixture)', await page.locator('.item-besoin').count() === 3);
verifier('1 ligne couverte (stock)', await page.locator('.badge-etat-couvert').count() === 1);
verifier('1 commande en attente', await page.locator('.badge-etat-attente').count() === 1);
verifier('1 manquant visible (badge encre rouge)', await page.locator('.badge-etat-manquant').count() === 1);

// Date de pose de la fixture affichée et modifiable.
verifier('Date de pose affichée (J+1)',
  await page.locator('.intendance-label input[type="date"]').inputValue() === dateLocaleIso(1));

// a11y : labels, micro de dictée, tap targets, contraste AA.
verifier('Champ Désignation étiqueté (aria-label)',
  await page.locator('.form-besoin input[aria-label="Désignation du besoin"]').count() === 1);
verifier('Dictée vocale sur la Désignation (motif existant)',
  await page.locator('.form-besoin .bouton-micro').count() === 1);
verifier('Selects de couverture étiquetés par ligne',
  await page.locator('.item-besoin select[aria-label^="Couverture — "]').count() === 3);
const gabarits = await page.evaluate(() => ({
  bouton: document.querySelector('.form-besoin button[type="submit"]').getBoundingClientRect().height,
  select: document.querySelector('.item-besoin select').getBoundingClientRect().height,
}));
verifier('Tap target « Ajouter le besoin » ≥ 44 px', gabarits.bouton >= 44, `${gabarits.bouton}px`);
verifier('Tap target select de couverture ≥ 44 px', gabarits.select >= 44, `${gabarits.select}px`);
const couleurs = await page.evaluate(() => {
  const m = getComputedStyle(document.querySelector('.badge-etat-manquant'));
  const b = getComputedStyle(document.querySelector('.bandeau-j2'));
  return { mTexte: m.color, mFond: m.backgroundColor, bTexte: b.color, bFond: b.backgroundColor };
});
const rManquant = ratio(versHex(couleurs.mTexte), versHex(couleurs.mFond));
verifier('Contraste badge Manquant ≥ 4,5:1', rManquant >= 4.5, `${rManquant.toFixed(2)}:1`);
const rBandeau = ratio(versHex(couleurs.bTexte), versHex(couleurs.bFond));
verifier('Contraste bandeau J-2 ≥ 4,5:1', rBandeau >= 4.5, `${rBandeau.toFixed(2)}:1`);

// Capture patrimoine : la check-list avec son bandeau J-2.
await page.screenshot({ path: `${SCRATCH}/intendant-fiche.png` });

// 5. Ajout d'une ligne : elle NAÎT manquante, le compteur et le bandeau suivent.
await page.locator('.form-besoin input[aria-label="Désignation du besoin"]').fill('Vis inox 4×40');
await page.locator('.form-besoin input[aria-label="Quantité"]').fill('4');
await page.locator('.form-besoin button[type="submit"]').click();
await page.waitForTimeout(250);
const ligneVis = () => page.locator('.item-besoin', { hasText: 'Vis inox 4×40' });
verifier('Ligne ajoutée (4 lignes)', await page.locator('.item-besoin').count() === 4);
verifier('La ligne ajoutée naît « Manquant »',
  (await ligneVis().locator('.badge-etat').textContent())?.trim() === 'Manquant');
verifier('Compteur → 2 manquants', (await compteur()) === 'Manquants détectés à J-2 : 2');
verifier('Bandeau → « 2 manquants »',
  ((await page.locator('.bandeau-j2').textContent()) || '').includes('2 manquants'));

// 6. Passage en commande : la ligne devient « Commande en attente ».
await ligneVis().locator('select').selectOption('commande');
await page.waitForTimeout(250);
verifier('Mode commande → « Commande en attente »',
  (await ligneVis().locator('.badge-etat').textContent())?.trim() === 'Commande en attente');
verifier('Compteur revient à 1', (await compteur()) === 'Manquants détectés à J-2 : 1');

// 7. Livraison + contrôle conforme : la ligne devient « Couvert ».
await ligneVis().locator('button', { hasText: "Livrée aujourd'hui" }).click();
await page.waitForTimeout(250);
verifier('Boutons de contrôle réception affichés après livraison',
  await ligneVis().locator('button', { hasText: 'Conforme' }).count() === 1 &&
  await ligneVis().locator('button', { hasText: 'Cassé' }).count() === 1);
await ligneVis().locator('button', { hasText: 'Conforme' }).click();
await page.waitForTimeout(250);
verifier('Contrôle conforme → « Couvert »',
  (await ligneVis().locator('.badge-etat').textContent())?.trim() === 'Couvert');

// 8. Contrôle cassé (charnières) : la ligne REPASSE en « Manquant ».
const ligneCharnieres = () => page.locator('.item-besoin', { hasText: 'Charnières laiton' });
await ligneCharnieres().locator('button', { hasText: "Livrée aujourd'hui" }).click();
await page.waitForTimeout(250);
await ligneCharnieres().locator('button', { hasText: 'Cassé' }).click();
await page.waitForTimeout(250);
verifier('Contrôle cassé → la ligne REPASSE en « Manquant »',
  (await ligneCharnieres().locator('.badge-etat').textContent())?.trim() === 'Manquant');
verifier('Compteur → 2 (la casse est re-détectée)', (await compteur()) === 'Manquants détectés à J-2 : 2');

// 9. Suppression avec confirmation.
page.once('dialog', (d) => d.accept());
await ligneVis().locator('.bouton-lien-danger', { hasText: 'Retirer' }).click();
await page.waitForTimeout(250);
verifier('Ligne retirée après confirmation (3 lignes)', await page.locator('.item-besoin').count() === 3);

// 10. Date de pose modifiable (PATCH) : le bandeau suit.
await page.locator('.intendance-label input[type="date"]').fill(dateLocaleIso(2));
await page.waitForTimeout(250);
verifier('Date de pose décalée à J+2 (persistée au re-rendu)',
  await page.locator('.intendance-label input[type="date"]').inputValue() === dateLocaleIso(2));
verifier('Bandeau recalculé : « Pose dans 2 jours — 2 manquants. »',
  ((await page.locator('.bandeau-j2').textContent()) || '').trim() === 'Pose dans 2 jours — 2 manquants.');

// 11. Chantier vierge (Garonne) : ouverture d'un dossier d'intendance.
await page.locator('.barre-onglets button', { hasText: 'Contacts' }).click();
await page.locator('#contacts-recherche').fill('Garonne');
await page.locator('.item-contact').first().click();
await page.waitForSelector('#panneau:not([hidden])', { timeout: 20000 });
verifier('Chantier sans dossier : bouton « Ouvrir l\'intendance »',
  await page.locator('.form-intendance button', { hasText: "Ouvrir l'intendance" }).count() === 1);
verifier('Pas de bandeau J-2 sans dossier', await page.locator('.bandeau-j2').count() === 0);
await page.locator('.form-intendance input[type="date"]').fill(dateLocaleIso(10));
await page.locator('.form-intendance button[type="submit"]').click();
await page.waitForTimeout(250);
verifier('Dossier ouvert : date de pose posée (J+10)',
  await page.locator('.intendance-label input[type="date"]').inputValue() === dateLocaleIso(10));
verifier('Check-list vide dessinée (état vide)',
  ((await page.locator('.section-intendance').textContent()) || '').includes('Aucun besoin noté pour le moment.'));
verifier('Compteur à 0 hors fenêtre J-2', (await compteur()) === 'Manquants détectés à J-2 : 0');
verifier('Formulaire d\'ajout disponible', await page.locator('.form-besoin').count() === 1);

verifier('Zéro requête réseau hors app', requetesExternes.length === 0, requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (desktop)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));
await page.close();

// ===================== B. Mobile : la check-list au pouce =====================
console.log('— B. INTENDANT (mobile 375×700) —');
const pageM = await navigateur.newPage({ viewport: { width: 375, height: 700 } });
const erreursMobile = [];
pageM.on('console', (msg) => { if (msg.type() === 'error') erreursMobile.push(msg.text()); });
pageM.on('pageerror', (err) => erreursMobile.push(String(err)));
await preparerPage(pageM);
await pageM.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
await pageM.waitForSelector('#leo-cartouche', { timeout: 20000 });
await pageM.locator('.leo-proposition').first().click();
await pageM.waitForSelector('#panneau:not([hidden])', { timeout: 20000 });
verifier('Mobile : bandeau J-2 et check-list rendus',
  await pageM.locator('.bandeau-j2').count() === 1 && await pageM.locator('.item-besoin').count() === 3);
const gabaritM = await pageM.evaluate(() => ({
  bouton: document.querySelector('.form-besoin button[type="submit"]').getBoundingClientRect().height,
  select: document.querySelector('.item-besoin select').getBoundingClientRect().height,
  retirer: document.querySelector('.item-besoin .bouton-lien-danger').getBoundingClientRect().height,
}));
verifier('Mobile : tap targets ≥ 44 px (ajout, couverture, retrait)',
  gabaritM.bouton >= 44 && gabaritM.select >= 44 && gabaritM.retirer >= 44,
  JSON.stringify(gabaritM));
verifier('Zéro erreur console (mobile)', erreursMobile.length === 0, erreursMobile.slice(0, 3).join(' | '));
await pageM.close();

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE INTENDANT VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
