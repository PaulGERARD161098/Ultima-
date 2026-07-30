// Supra-division ULTIMA (Ultima Lv3, boucle L2) : ultima.html.
// La grille 2×2 de la console a laissé place à la FORME UNIQUE — la boussole,
// rendue par le noyau à partir du registre. Prouve : bandeau conforme au
// REGISTRE, 5 caps (RIVEN, NICOL BOLAS, ADRAMELECH, IMLADRIK, TAO), blasons
// étiquetés, retour vers la racine, RIVEN qui navigue vers traveler.html,
// AUCUNE requête réseau externe (zéro CDN), zéro erreur console, contraste AA
// calculé sur les couleurs réellement rendues. Puis NON-RÉGRESSION :
// traveler.html s'ouvre et la carte Leaflet s'initialise.
// Mode démo forcé, Leaflet/OSM stubés (pour traveler.html), zéro erreur tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';

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

// ============ A. La boussole ULTIMA (ultima.html) ============
console.log('— A. Supra-division ULTIMA —');
await page.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

// Le bandeau ne peut pas dériver du registre sans que ce harnais le voie.
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS['ultima-perso'].surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS['ultima-perso'].titre, `lu: ${principal}`);
const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite « Léo te guide »', /Léo te guide/.test(invite || ''), `lu: ${invite}`);

// Les 5 caps de la supra-division personnelle, dans l'ordre du registre.
const attendus = capsDe('ultima-perso').map((c) => c.nom);
const noms = (await page.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('5 caps rendus', noms.length === 5, `trouvés: ${JSON.stringify(noms)}`);
verifier('Caps dans l\'ordre du registre', JSON.stringify(noms) === JSON.stringify(attendus),
  `lu: ${JSON.stringify(noms)}`);

// Toutes les portes sont ouvertes (aucun cap « à venir » à cet étage).
const hrefs = await page.locator('a.cap').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
for (const attendu of ['traveler.html', 'bcp.html', 'adramelech.html', 'imladrik.html', 'tao.html']) {
  verifier(`Porte ouverte vers ${attendu}`, hrefs.includes(attendu), JSON.stringify(hrefs));
}
verifier('Aucun cap inerte (aria-disabled / à venir)',
  (await page.locator('.cap[aria-disabled], .cap--avenir').count()) === 0);
verifier('Aucun cap externe à cet étage (tout est interne)',
  (await page.locator('.cap[target="_blank"]').count()) === 0);

// Badges d'état, repris du registre.
async function etatDe(id) {
  return (await page.locator(`.cap[data-id="${id}"] .cap-etat`).textContent())?.trim();
}
verifier('ADRAMELECH marqué « Privé »', /priv/i.test(await etatDe('adramelech') || ''));
verifier('NICOL BOLAS marqué « En chantier »', /chantier/i.test(await etatDe('nicol-bolas') || ''));
verifier('IMLADRIK marqué « Accéder »', /accéder/i.test(await etatDe('imladrik') || ''));

// Le cœur gravé + sa légende (pièce ④ du patron).
verifier('Cœur gravé au centre', (await page.locator('.boussole-coeur svg').count()) === 1);
const legende = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS['ultima-perso'].legende, `lu: ${legende}`);
verifier('5 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 5);

// Retour vers la racine (pièce ① du patron).
verifier('Retour vers la boussole racine',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// La parole de Léo au survol d'un cap.
const traveler = page.locator('a.cap[data-id="riven"]');
await traveler.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const parole = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol RIVEN : la parole de Léo se dépose',
  /RIVEN/.test(parole) && /réseau commercial/i.test(parole), `lu: ${parole.slice(0, 120)}`);

// Blasons étiquetés (aria-label) — un par cap, aucun SVG de cap dans la page.
const blasons = await page.locator('.cap-blason-svg').evaluateAll((els) =>
  els.map((e) => e.getAttribute('aria-label')));
verifier('5 blasons étiquetés (aria-label)', blasons.length === 5 && blasons.every((l) => l && /Blason/i.test(l)),
  JSON.stringify(blasons));

// Focus clavier visible sur un cap ouvrable.
await traveler.focus();
verifier('Cap focusable au clavier', await traveler.evaluate((el) => el === document.activeElement));

// Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const nom = getComputedStyle(document.querySelector('.cap-nom'));
  const t = getComputedStyle(document.querySelector('.console-titre'));
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom.color, titre: t.color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de cap ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (ULTIMA)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ===================== B. Navigation + non-régression traveler.html =====================
console.log('— B. RIVEN → traveler.html (carte) —');
const erreursTraveler = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursTraveler.push(msg.text()); });
await traveler.click();
await page.waitForURL('**/traveler.html', { timeout: 20000 });
verifier('Clic RIVEN → URL traveler.html', /\/traveler\.html$/.test(page.url()), page.url());

// L'app démarre : cartouche ULTIMA visible.
await page.waitForSelector('.cartouche-ultima', { timeout: 20000 });
verifier('App bootée (cartouche ULTIMA)', await page.locator('.cartouche-ultima').isVisible());

// La carte Leaflet s'initialise quand on ouvre l'onglet Carte.
await page.locator('.onglet[data-onglet="carte"]').click();
await page.waitForSelector('.leaflet-container', { timeout: 20000 });
verifier('Carte Leaflet initialisée (zéro régression)', await page.locator('.leaflet-container').count() >= 1);
verifier('Zéro erreur console (traveler.html)', erreursTraveler.length === 0, erreursTraveler.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE ULTIMA (SUPRA-DIVISION) VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
