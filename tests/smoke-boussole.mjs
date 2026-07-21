// Boussole d'accueil (Ultima LV2-①) : la rose des vents des macro-projets
// (index.html). Prouve : bandeau « Bienvenue sur Ultima » + invite, 3 caps
// rendus autour de la rose (ULTIMA ouvrable, RENAULT BOOST + IKOM « à venir »
// inertes/aria-disabled), rose des vents au cœur, 3 aiguilles, résumé Léo qui
// n'apparaît QU'au survol/focus (cartouche parole), illumination du cap actif,
// AUCUNE requête réseau externe (zéro CDN), zéro erreur console, contraste AA
// sur les couleurs réellement rendues. Puis navigation : clic ULTIMA →
// /ultima.html et la console à 4 quadrants se rend (non-régression du câblage).
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

// ===================== A. La boussole (index.html) =====================
console.log('— A. Boussole d\'accueil —');
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Titre ligne 1 « Ultima LV2 »', surligne === 'Ultima LV2', `lu: ${surligne}`);
verifier('Titre ligne 2 « Bienvenue »', principal === 'Bienvenue', `lu: ${principal}`);
const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite présente', /Sur quoi est-ce qu'on travaille aujourd'hui/.test(invite || ''), `lu: ${invite}`);

// Les 3 caps rendus.
const noms = (await page.locator('.cap-nom').allTextContents()).map((n) => n.trim());
verifier('3 caps rendus', noms.length === 3, `trouvés: ${JSON.stringify(noms)}`);
for (const attendu of ['ULTIMA', 'RENOBOOST IA', 'YCOME']) {
  verifier(`Cap ${attendu} présent`, noms.includes(attendu));
}

// ULTIMA est une porte ouverte interne (ancre vers ultima.html, même onglet).
const capUltima = page.locator('a.cap[data-id="ultima"]');
verifier('Cap ULTIMA ouvrable (ancre)', (await capUltima.count()) === 1);
verifier('Cap ULTIMA pointe vers ultima.html',
  (await capUltima.getAttribute('href')) === 'ultima.html');

// RENOBOOST IA est branché : ancre externe (nouvel onglet, rel noopener).
const capReno = page.locator('a.cap[data-id="renoboost-ia"]');
verifier('Cap RENOBOOST IA ouvrable (ancre)', (await capReno.count()) === 1);
verifier('Cap RENOBOOST IA pointe vers la console renoboostia.fr',
  (await capReno.getAttribute('href') || '').startsWith('https://www.renoboostia.fr'));
verifier('Cap RENOBOOST IA ouvre un nouvel onglet',
  (await capReno.getAttribute('target')) === '_blank');
verifier('Cap RENOBOOST IA en rel noopener',
  /noopener/.test(await capReno.getAttribute('rel') || ''));

// YCOME reste « à venir » : non-lien, aria-disabled.
const capYcome = page.locator('.cap[data-id="ycome"]');
const tagYcome = await capYcome.evaluate((e) => e.tagName.toLowerCase());
verifier('Cap YCOME inerte (pas une ancre)', tagYcome !== 'a', `tag: ${tagYcome}`);
verifier('Cap YCOME aria-disabled', (await capYcome.getAttribute('aria-disabled')) === 'true');
verifier('1 seul cap « à venir »', (await page.locator('.cap--avenir').count()) === 1);

// La rose au cœur + les 3 aiguilles.
verifier('Rose des vents au cœur', (await page.locator('.boussole-coeur svg').count()) === 1);
verifier('3 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 3);

// Le résumé Léo n'apparaît QU'au survol : au repos, invite par défaut.
const paroleRepos = (await page.locator('#boussole-parole').textContent())?.trim();
verifier('Parole au repos : invite au survol', /Léo t'en dit l'essentiel/.test(paroleRepos || ''),
  `lu: ${paroleRepos}`);
verifier('Aucun résumé de projet au repos',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Survol d'ULTIMA → cap illuminé + résumé déposé.
await capUltima.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
verifier('Cap ULTIMA illuminé au survol', await capUltima.evaluate((e) => e.classList.contains('is-actif')));
const paroleNom = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Résumé : nom du cap affiché', paroleNom === 'ULTIMA', `lu: ${paroleNom}`);
const paroleTexte = (await page.locator('#boussole-parole .parole-texte').textContent())?.trim();
verifier('Résumé : essentiel de Léo affiché', /quatre quadrants/i.test(paroleTexte || ''), `lu: ${paroleTexte}`);
verifier('Résumé : appel à l\'action', (await page.locator('#boussole-parole .parole-action').count()) === 1);

// Sortie du survol → retour à l'invite (zéro surcharge).
await page.locator('h1.console-titre').hover();
await page.waitForSelector('#boussole-parole:not(.is-actif)', { timeout: 5000 });
verifier('Sortie du survol → retour à l\'invite',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Accès clavier : focus du cap « à venir » montre aussi son résumé.
await capYcome.focus();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const nomYcome = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Focus clavier d\'un cap montre son résumé', nomYcome === 'YCOME', `lu: ${nomYcome}`);

// Repli sans JS présent dans le document.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

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
verifier('Zéro erreur console (boussole)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ===================== B. Navigation ULTIMA → console =====================
console.log('— B. ULTIMA → /ultima.html (console) —');
await capUltima.click();
await page.waitForURL('**/ultima.html', { timeout: 20000 });
verifier('Clic ULTIMA → URL ultima.html', /\/ultima\.html$/.test(page.url()), page.url());
await page.waitForSelector('h1.console-titre', { timeout: 20000 });
const nomsQuadrants = (await page.locator('.quadrant-nom').allTextContents()).map((n) => n.trim());
verifier('Console à 4 quadrants rendue', nomsQuadrants.length === 4, JSON.stringify(nomsQuadrants));
verifier('Retour boussole présent sur la console',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE BOUSSOLE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
