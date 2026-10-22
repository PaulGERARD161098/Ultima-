// LE CLIC EXACT — lot 1 de CADRAGE-2026-09-25-carte-celeste.md (§11).
//
// Ce que Paul voyait : « quand je clique sur NAGA, sur GRIMA, parfois la
// sélection n'est pas bonne ». Mesuré le 25/09 : le clic échouait dans QUATRE
// gestes sur cinq. La cause n'était pas la cible (zones de 13-18 px, aucun
// chevauchement) mais le DÉPLIAGE AU SURVOL : survoler redessinait la scène,
// le cadrage se recentrait, et l'étoile visée partait de 119 px sous le
// curseur. Le clic tombait dans le vide — et rien ne le disait.
//
// 2026-09-29 : NAGA et GRIMA sont SUPPRIMÉS (incident ci-dessus = historique).
// Les mêmes gestes s'éprouvent sur les deux têtes d'OMEGA qui contiennent
// quelque chose : IMLADRIK (ex-NAGA, qui porte désormais deux constellations —
// ARMES et DRAGONS ; TAO est supprimé depuis le 30/09) et NICOL BOLAS (ex-membre
// de GRIMA). RIVEN, feuille, ouvre sa page : hors sujet.
//
// Ce harnais rejoue les GESTES RÉELS, pas un `dispatchEvent('click')` qui
// atterrit toujours sur l'élément qu'on lui nomme : ici la souris se déplace
// vraiment, et c'est le navigateur qui décide ce qu'il y a sous elle.
//
// ⛔ IL A ÉTÉ VU ROUGE SUR LE CODE D'AVANT LE CORRECTIF (4 gestes sur 5 sur
// NAGA, déplacement de 119 px) — un harnais qui n'a jamais rougi ne prouve
// rien. Et son TÉMOIN (l'écran isolé, où le dépliage était déjà coupé depuis
// le 31/08) doit rester vert dans les deux états : un harnais qui ne saurait
// que rougir ne prouverait pas davantage.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

// L'agrégat Finubar VIDE et un cockpit vide : ce harnais ne juge ni l'un ni
// l'autre, il exige seulement qu'une route non stubée ne se présente pas
// comme une erreur du produit (leçon de `smoke-lv4-coque`).
async function ouvrir(options = {}) {
  const contexte = await navigateur.newContext(Object.assign({ viewport: { width: 1280, height: 860 } }, options));
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  await page.route('**/api/finubar', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-25', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await page.route('**/api/cockpit', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }),
  }));
  await page.goto(`${BASE}/omega.html${options.fragment || ''}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1500);
  return { page, contexte };
}
// Le centre de la ZONE de captation, en pixels d'écran — c'est là qu'un doigt
// ou une souris vise, pas le centre du cœur.
function centre(page, id) {
  return page.evaluate((id) => {
    const z = document.querySelector(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"] .ciel-zone`);
    if (!z) { return null; }
    const bb = z.getBoundingClientRect();
    return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
  }, id);
}
function etat(page) {
  return page.evaluate(() => ({
    hash: location.hash,
    ids: Array.from(document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]'))
      .map((g) => g.getAttribute('data-noeud-id')).sort(),
  }));
}
// « Isolé sur X » = l'adresse porte X et le ciel ne peint QUE ses enfants.
function isoleSur(id, e) {
  const enfants = (NOEUDS[id].enfants || []).slice().sort();
  return e.hash === '#' + id && JSON.stringify(e.ids) === JSON.stringify(enfants);
}

// ===========================================================================
for (const id of ['imladrik', 'nicol-bolas']) {
  console.log(`— ${id.toUpperCase()} : les cinq gestes, depuis la racine —`);

  // ① Le clic instantané, au centre mesuré AVANT tout survol.
  {
    const { page, contexte } = await ouvrir();
    const c = await centre(page, id);
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(900);
    verifier(`${id} · ① clic instantané → isolé`, isoleSur(id, await etat(page)), JSON.stringify(await etat(page)));
    await contexte.close();
  }
  // ② Survoler d'abord (c'est ce qu'une souris fait TOUJOURS avant de
  //    cliquer), puis cliquer là où l'étoile ÉTAIT. Si elle a bougé, on rate.
  {
    const { page, contexte } = await ouvrir();
    const avant = await centre(page, id);
    await page.mouse.move(avant.x, avant.y);
    await page.waitForTimeout(400);
    const apres = await centre(page, id);
    const deplacement = Math.hypot(apres.x - avant.x, apres.y - avant.y);
    chiffres[`${id}.deplacementApresSurvolPx`] = +deplacement.toFixed(1);
    verifier(`${id} · l'étoile survolée ne bouge pas (0 px)`, deplacement < 0.5, `${deplacement.toFixed(1)} px`);
    await page.mouse.click(avant.x, avant.y);
    await page.waitForTimeout(900);
    verifier(`${id} · ② survol puis clic à la position d'avant → isolé`, isoleSur(id, await etat(page)));
    await contexte.close();
  }
  // ③ L'appui humain : 150 ms entre l'appui et le relâchement.
  {
    const { page, contexte } = await ouvrir();
    const c = await centre(page, id);
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(900);
    verifier(`${id} · ③ appui de 150 ms → isolé`, isoleSur(id, await etat(page)));
    await contexte.close();
  }
  // ④ Le clic de Playwright sur l'ÉLÉMENT : il se déplace dessus, puis clique.
  {
    const { page, contexte } = await ouvrir();
    await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"]`).click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
    verifier(`${id} · ④ locator.click → isolé`, isoleSur(id, await etat(page)));
    await contexte.close();
  }
  // ⑤ Sans animation (préférence système) : le même clic, sans approche.
  {
    const { page, contexte } = await ouvrir({ reducedMotion: 'reduce' });
    const c = await centre(page, id);
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(600);
    verifier(`${id} · ⑤ clic sans animation → isolé`, isoleSur(id, await etat(page)));
    await contexte.close();
  }
}

// ===========================================================================
console.log('— Le déplacement image par image, sur IMLADRIK —');
{
  const { page, contexte } = await ouvrir();
  const p0 = await centre(page, 'imladrik');
  await page.mouse.move(p0.x, p0.y);
  const releves = {};
  let cumul = 0;
  for (const palier of [16, 100, 250, 500]) {
    await page.waitForTimeout(palier - cumul); cumul = palier;
    const p = await centre(page, 'imladrik');
    releves[palier + 'ms'] = p ? +Math.hypot(p.x - p0.x, p.y - p0.y).toFixed(1) : null;
  }
  chiffres['imladrik.deplacementParPalier'] = releves;
  verifier('IMLADRIK ne bouge à aucun palier (16 · 100 · 250 · 500 ms)',
    Object.values(releves).every((d) => d !== null && d < 0.5), JSON.stringify(releves));
  await contexte.close();
}

// ===========================================================================
console.log('— Le doigt : tap, et tap glissé —');
{
  const { page, contexte } = await ouvrir({ hasTouch: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const c = await centre(page, 'imladrik');
  await page.touchscreen.tap(c.x, c.y);
  await page.waitForTimeout(900);
  verifier('Tap sur IMLADRIK → isolé', isoleSur('imladrik', await etat(page)), JSON.stringify(await etat(page)));
  await contexte.close();
}
{
  // Le POV adversaire du cadrage : un doigt qui glisse de 6 px sur un tap.
  // Le seuil du moteur est de 4 px (`ciel.js`) : au-delà, c'est une rotation,
  // pas un clic. On MESURE ce qu'il se passe ; on n'invente pas de règle.
  const { page, contexte } = await ouvrir({ hasTouch: true, viewport: { width: 390, height: 844 }, isMobile: true });
  const c = await centre(page, 'imladrik');
  const glisse = await page.evaluate(({ x, y }) => new Promise((resoudre) => {
    const cible = document.elementFromPoint(x, y);
    const t = (type, px) => cible.dispatchEvent(new PointerEvent(type, {
      bubbles: true, clientX: px, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true,
    }));
    t('pointerdown', x); t('pointermove', x + 3); t('pointermove', x + 6); t('pointerup', x + 6);
    cible.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x + 6, clientY: y }));
    setTimeout(() => resoudre({ hash: location.hash }), 900);
  }), c);
  chiffres.tapGlisse6px = glisse;
  verifier('Un tap glissé de 6 px ne plonge pas (c\'est une rotation, seuil 4 px)', glisse.hash === '');
  await contexte.close();
}

// ===========================================================================
console.log('— Le témoin : l\'écran isolé, où le dépliage était déjà coupé —');
{
  const { page, contexte } = await ouvrir({ fragment: '#imladrik' });
  // TRANSPOSÉ (30/09) : le témoin était TAO, tête d'IMLADRIK qui contenait deux
  // pôles ; TAO n'existe plus. La tête qui contient quelque chose sous IMLADRIK est
  // désormais la constellation DRAGONS (six étoiles) : même geste, même verdict.
  // Verrou : la cible existe au ciel (`centre` rend autre chose que null) — sans
  // lui, `avant.x` lèverait, et un ciel vide ne se distinguerait pas d'un cap qui ne
  // bouge pas.
  const avant = await centre(page, 'constellation-dragons');
  verifier('Témoin · verrou — DRAGONS est peinte sous #imladrik', avant !== null);
  await page.mouse.move(avant.x, avant.y);
  await page.waitForTimeout(400);
  const apres = await centre(page, 'constellation-dragons');
  const d = Math.hypot(apres.x - avant.x, apres.y - avant.y);
  verifier('Témoin · DRAGONS ne bouge pas au survol sous #imladrik', d < 0.5, `${d.toFixed(1)} px`);
  await page.mouse.click(avant.x, avant.y);
  await page.waitForTimeout(900);
  verifier('Témoin · clic sur DRAGONS depuis #imladrik → #constellation-dragons',
    isoleSur('constellation-dragons', await etat(page)) && (await etat(page)).ids.length === 8,
    JSON.stringify(await etat(page)));
  await contexte.close();
}

// ===========================================================================
console.log('— Le clavier : Tab jusqu\'à IMLADRIK, Entrée —');
{
  const { page, contexte } = await ouvrir();
  await page.focus('#ciel-noeud-scene .ciel-etoile[data-noeud-id="imladrik"]');
  await page.waitForTimeout(400);
  const bouge = await page.evaluate(() => {
    const g = document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="imladrik"]');
    return { focusTenu: document.activeElement === g,
      etoiles: document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]').length };
  });
  verifier('Le focus clavier ne redessine pas le ciel (les trois caps d\'OMEGA, focus tenu)',
    bouge.focusTenu && bouge.etoiles === NOEUDS.omega.enfants.length, JSON.stringify(bouge));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const e = await etat(page);
  const focusApres = await page.evaluate(() => {
    const a = document.activeElement; return a && a.getAttribute ? a.getAttribute('data-noeud-id') : null;
  });
  verifier('Entrée sur IMLADRIK → isolé', isoleSur('imladrik', e), JSON.stringify(e));
  verifier('Après la plongée, le focus est sur une étoile d\'IMLADRIK',
    NOEUDS.imladrik.enfants.includes(focusApres), String(focusApres));
  await contexte.close();
}

// ===========================================================================
console.log('— Le clavier ne couche pas la constellation (critique impeccable, 26/09) —');
// Mesuré par la revue de design du lot 2 : une tabulation faisait VISER
// l'étoile, la caméra pivotait, et sur une couronne toutes les étoiles
// tombaient sur la même verticale (étendue 799 px → 0 sur RENOBOOST IA).
// La figure n'existait que pour la souris. Ici : OMEGA isolé sur IMLADRIK, puis
// Tab jusqu'à une étoile — l'étendue horizontale ne doit pas s'effondrer.
{
  const { page, contexte } = await ouvrir({ fragment: '#imladrik' });
  const etendue = () => page.evaluate(() => {
    const xs = [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id] .ciel-zone')]
      .map((z) => { const r = z.getBoundingClientRect(); return r.x + r.width / 2; });
    return xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
  });
  const avant = await etendue();
  let atteinte = false;
  for (let i = 0; i < 15 && !atteinte; i++) {
    await page.keyboard.press('Tab');
    atteinte = await page.evaluate(() => !!(document.activeElement
      && document.activeElement.closest && document.activeElement.closest('#ciel-noeud-scene .ciel-etoile')));
  }
  await page.waitForTimeout(1500);
  const apres = await etendue();
  chiffres.etendueAvantTab = Math.round(avant); chiffres.etendueApresTab = Math.round(apres);
  verifier('Verrou : la tabulation atteint bien une étoile', atteinte);
  verifier('Tab garde la figure : l\'étendue ne perd pas plus de 5 %', avant > 50 && apres >= avant * 0.95,
    `${Math.round(avant)} px → ${Math.round(apres)} px`);
  await contexte.close();
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE CLIC-EXACT VERT ===' : '\n=== SMOKE CLIC-EXACT ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
