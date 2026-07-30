// TAO — la voie (Ultima Lv3, boucle L3) : tao.html.
// L'arborescence tronc + deux branches a laissé place à la FORME UNIQUE — la
// boussole rendue par le noyau. Prouve : bandeau conforme au REGISTRE, 2 caps
// (RESHIRAM → reshiram.html, ZEKROM → zekrom.html), le cœur yin-yang + sa
// légende, la PASSERELLE tracée en ARC (jamais une corde : elle disparaîtrait
// derrière le médaillon) avec son nom « ⇄ rétroplanning » gravé dessus, le
// rétroplanning dit AUSSI par Léo dans le cartouche (l'arc est décoratif, la
// parole est annoncée), le retour vers ULTIMA, les tap targets, les contrastes
// AA, zéro requête réseau, zéro erreur console.
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

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));
const externes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
});
const appelsApi = [];
await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });

console.log('— TAO : la voie, en boussole —');
await page.goto(`${BASE}/tao.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

// Le bandeau suit le registre (anti-dérive de la coque).
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS.tao.surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS.tao.titre, `lu: ${principal}`);
verifier('Invite « Léo te guide »',
  /Léo te guide/.test((await page.locator('.console-invite').textContent()) || ''));

// Les deux pôles, dans l'ordre du registre.
const attendus = capsDe('tao').map((c) => c.nom);
const noms = (await page.locator('.cap .cap-nom').allTextContents()).map((n) => n.trim());
verifier('2 caps rendus', noms.length === 2, `trouvés: ${JSON.stringify(noms)}`);
verifier('Caps dans l\'ordre du registre', JSON.stringify(noms) === JSON.stringify(attendus),
  `lu: ${JSON.stringify(noms)}`);

for (const [id, cible] of [['reshiram', 'reshiram.html'], ['zekrom', 'zekrom.html']]) {
  const cap = page.locator(`.cap[data-id="${id}"]`);
  verifier(`${id} est un lien`, (await cap.evaluate((el) => el.tagName)) === 'A');
  verifier(`${id} → ${cible}`, (await cap.getAttribute('href')) === cible);
  verifier(`${id} en interne (pas de nouvel onglet)`, (await cap.getAttribute('target')) === null);
}
verifier('Aucun cap « à venir » (les deux pôles sont bâtis)',
  (await page.locator('.cap--avenir, .cap[aria-disabled]').count()) === 0);

// Le cœur yin-yang + sa légende gravée.
verifier('Cœur gravé au centre', (await page.locator('.boussole-coeur svg').count()) === 1);
const legende = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.tao.legende, `lu: ${legende}`);
verifier('2 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 2);

// ---- La passerelle : un ARC, pas une corde. ----
const passerelle = page.locator('.boussole-aiguilles .passerelle');
verifier('1 passerelle tracée', (await passerelle.count()) === 1);
verifier('Passerelle en <path> (et non <line>)',
  (await passerelle.evaluate((el) => el.tagName.toLowerCase())) === 'path');
const d = (await passerelle.getAttribute('d')) || '';
verifier('Passerelle tracée en arc (commande A)', /\sA\s/.test(d), `d: ${d}`);
// Preuve géométrique : le milieu de l'arc est LOIN du centre (une corde entre
// deux caps opposés passerait exactement dessus et serait masquée).
const distanceMilieu = await passerelle.evaluate((el) => {
  const m = el.getPointAtLength(el.getTotalLength() / 2);
  return Math.hypot(m.x - 50, m.y - 50);
});
verifier('Milieu de l\'arc hors du médaillon (> 34 % du plateau)',
  distanceMilieu > 34, `${distanceMilieu.toFixed(1)} unités du centre`);

// Son nom gravé, posé sur l'arc.
const libelle = (await page.locator('.passerelle-libelle').textContent())?.trim();
verifier('Nom gravé « ⇄ rétroplanning » sur l\'arc', /rétroplanning/.test(libelle || ''), `lu: ${libelle}`);
verifier('Le libellé suit le tracé (textPath)',
  (await page.locator('.passerelle-libelle textPath').count()) === 1);

// Retour vers ULTIMA (pièce ① du patron).
const retour = page.locator('.console-retour a[href="ultima.html"]');
verifier('Retour « ↞ ULTIMA » vers ultima.html', (await retour.count()) === 1);
verifier('Retour libellé « ULTIMA »', /ULTIMA/.test((await retour.textContent()) || ''));

// La parole de Léo dit le rétroplanning — l'arc est décor, la parole est annoncée.
await page.locator('.cap[data-id="reshiram"]').hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleR = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol RESHIRAM : le réel + le rétroplanning dits par Léo',
  /RESHIRAM/.test(paroleR) && /talents réels/i.test(paroleR) && /rétroplanning/i.test(paroleR),
  `lu: ${paroleR.slice(0, 140)}`);
await page.locator('.cap[data-id="zekrom"]').hover();
await page.waitForTimeout(150);
const paroleZ = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol ZEKROM : l\'idéal + le rétroplanning dits par Léo',
  /ZEKROM/.test(paroleZ) && /idéal/i.test(paroleZ) && /rétroplanning/i.test(paroleZ),
  `lu: ${paroleZ.slice(0, 140)}`);

// Tap targets ≥ 44 px sur les deux caps.
for (const id of ['reshiram', 'zekrom']) {
  const boite = await page.locator(`.cap[data-id="${id}"]`).boundingBox();
  verifier(`Tap target ${id} ≥ 44 px`, Boolean(boite) && boite.height >= 44 && boite.width >= 44,
    boite ? `${boite.width.toFixed(0)}×${boite.height.toFixed(0)}` : 'introuvable');
}

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

// TAO est une coque : aucune donnée n'y transite (les chiffres vivent sur les
// pages RESHIRAM / ZEKROM, derrière auth).
verifier('Aucun appel /api (coque sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
verifier('Zéro requête réseau externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
verifier('Zéro erreur console (TAO)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE TAO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
