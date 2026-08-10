// Supra-division ULTIMA (Ultima Lv3) : ultima.html et ses MACRO-QUADRANTS.
// Depuis la dictée du 2026-08-01, ULTIMA ne montre plus que DEUX cadrans
// cliquables — GRIMA « Ce qui est utile » (RIVEN, NICOL BOLAS) et NAGA « Ce qui
// fait grandir » (IMLADRIK, ADRAMELECH, TAO) — chacun ouvrant sa propre
// boussole. Prouve : bandeau conforme au REGISTRE, 2 caps GRIMA/NAGA avec leur
// devise en badge, navigation ULTIMA → GRIMA → RIVEN → traveler.html (carte
// Leaflet intacte), boussole NAGA complète avec retour vers ULTIMA, AUCUNE
// requête réseau externe (zéro CDN), zéro erreur console, contraste AA calculé
// sur les couleurs réellement rendues.
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

// ============ A. La boussole ULTIMA (ultima.html) : deux macro-quadrants ============
console.log('— A. Supra-division ULTIMA : GRIMA + NAGA —');
await page.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

// Le bandeau ne peut pas dériver du registre sans que ce harnais le voie.
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS['ultima-perso'].surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS['ultima-perso'].titre, `lu: ${principal}`);
// Plus de message de Léo affiché au repos (Paul, 2026-08-01) — tests d'ABSENCE.
verifier('Invite « Léo te guide » retirée du bandeau',
  (await page.locator('.console-invite').count()) === 0);
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));

// Les cadrans d'ULTIMA, dans l'ordre du registre.
//   2026-08-01 : GRIMA « ce qui est utile » et NAGA « ce qui fait grandir ».
//   2026-08-06 : ALTHEA en TROISIÈME, hors des deux devises — Paul l'a voulu
//   « tout seul, c'est un autre système ». Le nombre n'est donc plus figé à
//   deux : ce qu'on vérifie, c'est que le rendu SUIT le registre, quel que
//   soit le nombre de cadrans. Un test qui compte en dur se refait à chaque
//   dictée ; un test qui compare à la source de vérité tient.
const attendus = capsDe('ultima-perso').map((c) => c.nom);
const noms = (await page.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('les cadrans rendus = ceux du registre',
  JSON.stringify(noms) === JSON.stringify(attendus), `trouvés: ${JSON.stringify(noms)}`);
// La ligne du dessus comparait bien au registre — et celle-ci figeait la liste
// juste en dessous, exactement ce que le commentaire ci-dessus interdit. Elle
// est tombée au déplacement d'ALTHEA (2026-08-07). Corrigée : ALTHEA a quitté
// cet étage, on l'éprouve donc par l'ABSENCE.
verifier('ALTHEA n’est plus un cadran d’ULTIMA (il pend à la racine)',
  !attendus.includes('ALTHEA'), `lu: ${JSON.stringify(attendus)}`);

// Chaque cadran est cliquable et ouvre sa porte — celles du registre, pas une
// liste recopiée à la main.
const hrefs = await page.locator('a.cap').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
for (const attendu of capsDe('ultima-perso').map((c) => c.cible)) {
  verifier(`Porte ouverte vers ${attendu}`, hrefs.includes(attendu), JSON.stringify(hrefs));
}
verifier('Aucun cap inerte (aria-disabled / à venir)',
  (await page.locator('.cap[aria-disabled], .cap--avenir').count()) === 0);
verifier('Aucun cap externe à cet étage (tout est interne)',
  (await page.locator('.cap[target="_blank"]').count()) === 0);

// La devise de chaque cadran tient lieu de badge (dictée : le sous-titre).
async function etatDe(id) {
  return (await page.locator(`.cap[data-id="${id}"] .cap-etat`).textContent())?.trim();
}
verifier('GRIMA — badge « Ce qui est utile »', (await etatDe('grima')) === 'Ce qui est utile');
verifier('NAGA — badge « Ce qui fait grandir »', (await etatDe('naga')) === 'Ce qui fait grandir');

// Le cœur gravé + sa légende (pièce ④ du patron).
verifier('Cœur gravé au centre', (await page.locator('.boussole-coeur svg').count()) === 1);
const legende = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS['ultima-perso'].legende, `lu: ${legende}`);
// Une aiguille par cadran — la géométrie suit le registre, pas un nombre écrit.
verifier('une aiguille par cadran',
  (await page.locator('.boussole-aiguilles .aiguille').count()) === attendus.length,
  `${attendus.length} attendues`);

// Retour vers la racine (pièce ① du patron).
verifier('Retour vers la boussole racine',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// La parole de Léo au survol d'un cadran : la devise et le contenu.
const capGrima = page.locator('a.cap[data-id="grima"]');
await capGrima.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const parole = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol GRIMA : la parole de Léo se dépose',
  /GRIMA/.test(parole) && /réseau commercial/i.test(parole) && /pilotage/i.test(parole),
  `lu: ${parole.slice(0, 120)}`);

// Blasons étiquetés (aria-label) — un par cadran, aucun SVG de cap dans la page.
const blasons = await page.locator('.cap-blason-svg').evaluateAll((els) =>
  els.map((e) => e.getAttribute('aria-label')));
verifier('un blason étiqueté par cadran',
  blasons.length === attendus.length && blasons.every((l) => l && /Blason/i.test(l)),
  JSON.stringify(blasons));

// Focus clavier visible sur un cadran ouvrable.
await capGrima.focus();
verifier('Cadran focusable au clavier', await capGrima.evaluate((el) => el === document.activeElement));

// Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const nom = getComputedStyle(document.querySelector('.cap-nom'));
  const t = getComputedStyle(document.querySelector('.console-titre'));
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom.color, titre: t.color,
    etat: getComputedStyle(document.querySelector('.cap-etat')).color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de cadran ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rEtat = ratio(versHex(styles.etat), styles.parcheminCarte);
verifier('Contraste devise (badge) ≥ 4,5:1', rEtat >= 4.5, `${rEtat.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (ULTIMA)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ============ B. Navigation ULTIMA → GRIMA → RIVEN (traveler.html) ============
console.log('— B. GRIMA → grima.html, puis RIVEN → traveler.html (carte) —');
await capGrima.click();
await page.waitForURL('**/grima.html', { timeout: 20000 });
verifier('Clic GRIMA → URL grima.html', /\/grima\.html$/.test(page.url()), page.url());
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

const surligneGrima = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const titreGrima = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('GRIMA : surligne = celle du registre', surligneGrima === NOEUDS.grima.surligne, `lu: ${surligneGrima}`);
verifier('GRIMA : titre = celui du registre', titreGrima === NOEUDS.grima.titre, `lu: ${titreGrima}`);

const attendusGrima = capsDe('grima').map((c) => c.nom);
const nomsGrima = (await page.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('GRIMA : RIVEN + NICOL BOLAS dans l\'ordre',
  JSON.stringify(nomsGrima) === JSON.stringify(attendusGrima)
    && JSON.stringify(attendusGrima) === JSON.stringify(['RIVEN', 'NICOL BOLAS']),
  `lu: ${JSON.stringify(nomsGrima)}`);
const hrefsGrima = await page.locator('a.cap').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
for (const attendu of ['traveler.html', 'bcp.html']) {
  verifier(`GRIMA : porte ouverte vers ${attendu}`, hrefsGrima.includes(attendu), JSON.stringify(hrefsGrima));
}
const legendeGrima = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('GRIMA : légende gravée « ce qui est utile »', legendeGrima === NOEUDS.grima.legende, `lu: ${legendeGrima}`);
verifier('GRIMA : retour « ↞ ULTIMA »',
  (await page.locator('.console-retour a[href="ultima.html"]').count()) === 1);

// RIVEN navigue toujours vers la carte : zéro régression sur l'acquis.
const erreursTraveler = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursTraveler.push(msg.text()); });
await page.locator('a.cap[data-id="riven"]').click();
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

// ============ C. La boussole NAGA (naga.html) ============
console.log('— C. NAGA → naga.html (ce qui fait grandir) —');
const erreursNaga = [];
const pageNaga = await contexte.newPage();
pageNaga.on('console', (msg) => { if (msg.type() === 'error') erreursNaga.push(msg.text()); });
pageNaga.on('pageerror', (err) => erreursNaga.push(String(err)));
await preparerRoutes(pageNaga);
await pageNaga.goto(`${BASE}/naga.html`, { waitUntil: 'load', timeout: 20000 });
await pageNaga.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

const surligneNaga = (await pageNaga.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const titreNaga = (await pageNaga.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('NAGA : surligne = celle du registre', surligneNaga === NOEUDS.naga.surligne, `lu: ${surligneNaga}`);
verifier('NAGA : titre = celui du registre', titreNaga === NOEUDS.naga.titre, `lu: ${titreNaga}`);

const attendusNaga = capsDe('naga').map((c) => c.nom);
const nomsNaga = (await pageNaga.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('NAGA : IMLADRIK + ADRAMELECH + TAO dans l\'ordre',
  JSON.stringify(nomsNaga) === JSON.stringify(attendusNaga)
    && JSON.stringify(attendusNaga) === JSON.stringify(['IMLADRIK', 'ADRAMELECH', 'TAO']),
  `lu: ${JSON.stringify(nomsNaga)}`);
const hrefsNaga = await pageNaga.locator('a.cap').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
for (const attendu of ['imladrik.html', 'adramelech.html', 'tao.html']) {
  verifier(`NAGA : porte ouverte vers ${attendu}`, hrefsNaga.includes(attendu), JSON.stringify(hrefsNaga));
}
verifier('NAGA : 3 aiguilles tracées', (await pageNaga.locator('.boussole-aiguilles .aiguille').count()) === 3);
const legendeNaga = (await pageNaga.locator('.boussole-legende').textContent())?.trim();
verifier('NAGA : légende gravée « ce qui fait grandir »', legendeNaga === NOEUDS.naga.legende, `lu: ${legendeNaga}`);
verifier('NAGA : retour « ↞ ULTIMA »',
  (await pageNaga.locator('.console-retour a[href="ultima.html"]').count()) === 1);

// ADRAMELECH garde son état « Privé » sur son nouveau cadran.
verifier('NAGA : ADRAMELECH marqué « Privé »',
  /priv/i.test((await pageNaga.locator('.cap[data-id="adramelech"] .cap-etat').textContent()) || ''));

verifier('Zéro erreur console (NAGA)', erreursNaga.length === 0, erreursNaga.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE ULTIMA (SUPRA-DIVISION) VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
