// Supra-division ALPHA (Ultima Lv3, boucle L2) : alpha.html.
// Prouve : bandeau conforme au REGISTRE, 2 caps rendus (RENOBOOST IA ouvert en
// nouvel onglet + rel noopener ; YCOME « à venir », inerte mais parlant), le
// cœur gravé + sa légende, le retour vers la racine, la parole de Léo au
// survol ET au focus clavier, le repli noscript, les contrastes AA, et —
// puisque ALPHA n'héberge aucune donnée — AUCUNE requête réseau (ni CDN, ni
// /api) et zéro erreur console.
import { chromium } from 'playwright';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';

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

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });

const erreurs = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreurs.push(msg.text()); });
page.on('pageerror', (err) => erreurs.push(String(err)));
const externes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
});
const appelsApi = [];
await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });

console.log('— A. Supra-division ALPHA —');
await page.goto(`${BASE}/alpha.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

// Le bandeau suit le registre (anti-dérive de la coque).
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS.alpha.surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS.alpha.titre, `lu: ${principal}`);
// Plus de message de Léo affiché au repos (Paul, 2026-08-01) — test d'ABSENCE.
verifier('Invite « Léo te guide » retirée du bandeau',
  (await page.locator('.console-invite').count()) === 0);

// Les 2 caps, dans l'ordre du registre.
const attendus = capsDe('alpha').map((c) => c.nom);
const noms = (await page.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('2 caps rendus', noms.length === 2, `trouvés: ${JSON.stringify(noms)}`);
verifier('Caps dans l\'ordre du registre', JSON.stringify(noms) === JSON.stringify(attendus),
  `lu: ${JSON.stringify(noms)}`);

// RENOBOOST IA : porte externe, nouvel onglet, rel noopener.
const reno = page.locator('a.cap[data-id="renoboost-ia"]');
verifier('RENOBOOST IA ouvrable (ancre)', (await reno.count()) === 1);
verifier('RENOBOOST IA pointe vers renoboostia.fr',
  ((await reno.getAttribute('href')) || '').startsWith('https://www.renoboostia.fr'));
verifier('RENOBOOST IA ouvre un nouvel onglet', (await reno.getAttribute('target')) === '_blank');
verifier('RENOBOOST IA en rel noopener', /noopener/.test((await reno.getAttribute('rel')) || ''));

// YCOME : « à venir » — non-lien, aria-disabled, mais atteignable au clavier.
const ycome = page.locator('.cap[data-id="ycome"]');
verifier('YCOME inerte (pas une ancre)',
  (await ycome.evaluate((e) => e.tagName.toLowerCase())) !== 'a');
verifier('YCOME aria-disabled', (await ycome.getAttribute('aria-disabled')) === 'true');
verifier('1 seul cap « à venir »', (await page.locator('.cap--avenir').count()) === 1);

// Le cœur gravé + sa légende + les aiguilles.
verifier('Cœur gravé au centre', (await page.locator('.boussole-coeur svg').count()) === 1);
const legende = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.alpha.legende, `lu: ${legende}`);
verifier('2 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 2);

// Retour vers la racine.
verifier('Retour vers la boussole racine',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// La parole de Léo : rien d'affiché au repos, le cartouche ne se matérialise
// qu'au survol (fonctions conservées, messages retirés — Paul, 2026-08-01).
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));
await reno.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleReno = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol RENOBOOST IA : nom + résumé', /RENOBOOST IA/.test(paroleReno) && /socle rémunérateur/i.test(paroleReno),
  `lu: ${paroleReno.slice(0, 120)}`);
verifier('Survol : le cartouche se matérialise (visible)',
  await page.locator('#boussole-parole').evaluate((el) => getComputedStyle(el).visibility === 'visible'));
verifier('Survol RENOBOOST IA : action « nouvel onglet »', /nouvel onglet/i.test(paroleReno), `lu: ${paroleReno}`);
verifier('Aiguille illuminée au survol', (await page.locator('.aiguille.is-actif').count()) === 1);

// Clavier = souris : le focus d'un cap « à venir » parle aussi.
await ycome.focus();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleYcome = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Focus YCOME : le cap parle', /YCOME/.test(paroleYcome) && /URL/.test(paroleYcome),
  `lu: ${paroleYcome.slice(0, 120)}`);
verifier('Focus YCOME : « cap en préparation »', /préparation/i.test(paroleYcome), `lu: ${paroleYcome}`);

// Repli sans JS.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

// Contrastes AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: getComputedStyle(document.querySelector('.cap-nom')).color,
    titre: getComputedStyle(document.querySelector('.console-titre')).color,
    legende: getComputedStyle(document.querySelector('.boussole-legende')).color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de cap ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
const rLeg = ratio(versHex(styles.legende), styles.merProfonde);
verifier('Contraste légende sur mer ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

// ALPHA ne porte aucune donnée : rien ne sort de la page.
verifier('Aucun appel /api (coque sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ALPHA VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
