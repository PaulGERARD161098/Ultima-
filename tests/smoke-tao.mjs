// TAO (Ultima LV2) : le hub arborescence qui réunit RESHIRAM (le réel) et
// ZEKROM (l'idéal) sous une seule voie. Prouve : la racine TAO (blason des deux
// ailes réunies, titre, devise), les 2 branches cliquables vers reshiram.html
// et zekrom.html (1 lien chacune), leurs blasons gravés, la passerelle
// (rétroplanning) discrète, le retour vers la boussole (/), les tap targets
// ≥ 44 px, le contraste AA sur les couleurs réellement rendues, AUCUNE requête
// réseau externe (zéro CDN, page statique) et zéro erreur console.
import { chromium } from 'playwright';

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
const contexte = await navigateur.newContext();
const page = await contexte.newPage();

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));

// Toute requête hors 127.0.0.1:8123 / data: est une fuite réseau interdite.
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) requetesExternes.push(url);
});

console.log('— TAO : la voie (arborescence RESHIRAM ⇄ ZEKROM) —');
await page.goto(`${BASE}/tao.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.tao-arbre', { timeout: 20000 });

// ---- La racine TAO : titre + devise + blason des deux ailes réunies. ----
const titre = (await page.locator('h1.console-titre').textContent())?.trim();
verifier('Racine : titre « TAO »', titre === 'TAO', `lu: ${titre}`);
const devise = (await page.locator('.console-invite').textContent())?.trim();
verifier('Racine : devise « La voie — le réel et l\'idéal »',
  /La voie/.test(devise || '') && /réel/.test(devise || '') && /idéal/.test(devise || ''), `lu: ${devise}`);
verifier('Racine : blason gravé présent (bandeau)',
  (await page.locator('.console-entete .blason-svg').count()) === 1);
verifier('Racine : blason TAO = les deux ailes réunies',
  /deux ailes réunies/.test(await page.locator('.console-entete .blason-svg').getAttribute('aria-label') || ''));

// ---- L'arbre : un tronc gravé + deux branches. ----
verifier('Tronc gravé (une racine, deux ramifications)', (await page.locator('.tao-tronc').count()) === 1);
verifier('Deux branches rendues', (await page.locator('a.tao-branche').count()) === 2);

// Branche RESHIRAM → reshiram.html (1 lien exact), blason + libellé.
const bReshiram = page.locator('a.tao-branche[href="reshiram.html"]');
verifier('Branche RESHIRAM : 1 lien exact vers reshiram.html', (await bReshiram.count()) === 1);
verifier('Branche RESHIRAM : nom affiché',
  (await bReshiram.locator('.tao-branche-nom').textContent())?.trim() === 'RESHIRAM');
verifier('Branche RESHIRAM : sous-titre « Le travail de la réalité »',
  /Le travail de la réalité/.test(await bReshiram.locator('.tao-branche-sous').textContent() || ''));
verifier('Branche RESHIRAM : blason gravé présent',
  (await bReshiram.locator('.blason-svg').count()) === 1);

// Branche ZEKROM → zekrom.html (1 lien exact), blason + libellé.
const bZekrom = page.locator('a.tao-branche[href="zekrom.html"]');
verifier('Branche ZEKROM : 1 lien exact vers zekrom.html', (await bZekrom.count()) === 1);
verifier('Branche ZEKROM : nom affiché',
  (await bZekrom.locator('.tao-branche-nom').textContent())?.trim() === 'ZEKROM');
verifier('Branche ZEKROM : sous-titre « La quête de l\'idéal »',
  /La quête de l'idéal/.test(await bZekrom.locator('.tao-branche-sous').textContent() || ''));
verifier('Branche ZEKROM : blason gravé présent',
  (await bZekrom.locator('.blason-svg').count()) === 1);

// La passerelle réel ↔ idéal (rétroplanning), mention discrète et statique.
const pont = (await page.locator('.tao-lien-chip').textContent()) || '';
verifier('Passerelle rétroplanning mentionnée (statique, sans donnée)',
  /rétroplanning/.test(pont) && (await page.locator('.tao-lien-chip').count()) === 1, `lu: ${pont}`);

// Retour vers la boussole d'accueil (/).
const retour = page.locator('.console-retour a[href="/"]');
verifier('Retour « ↞ Boussole » vers /', (await retour.count()) === 1);
verifier('Retour libellé « ↞ Boussole »', /Boussole/.test(await retour.textContent() || ''));

// ---- Tap targets ≥ 44 px sur les deux branches cliquables. ----
for (const [nom, loc] of [['RESHIRAM', bReshiram], ['ZEKROM', bZekrom]]) {
  const h = await loc.evaluate((el) => el.getBoundingClientRect().height);
  verifier(`Tap target branche ${nom} ≥ 44 px`, h >= 44, `${h.toFixed(1)} px`);
}

// ---- Contraste AA sur les couleurs réellement rendues. ----
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: getComputedStyle(document.querySelector('.tao-branche-nom')).color,
    sous: getComputedStyle(document.querySelector('.tao-branche-sous')).color,
    titre: getComputedStyle(document.querySelector('.console-titre')).color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de branche ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rSous = ratio(versHex(styles.sous), styles.parcheminCarte);
verifier('Contraste sous-titre de branche ≥ 4,5:1', rSous >= 4.5, `${rSous.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre TAO sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (page statique, aucun CDN)',
  requetesExternes.length === 0, requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (TAO)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE TAO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
