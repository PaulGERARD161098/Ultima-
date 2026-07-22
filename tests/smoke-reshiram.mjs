// Quadrant RESHIRAM (v1) : la carte des talents, ancrée sur preuve — DERRIÈRE AUTH.
// Miroir des sections ADRAMELECH de smoke-quadrants.mjs + smoke-idees.mjs. Prouve :
//   A. reshiram.html SANS session (config vide) : FAIL-CLOSED — aucun talent au
//      DOM, cartouche « Authentification requise », lien vers traveler, registre
//      caché, zéro fuite réseau, zéro erreur console ;
//   B. reshiram.html avec FAUSSE session + /api/talents STUBÉE 200 (fixture NEUTRE
//      inventée) : registre rendu (sectoriel multi-secteur, transversal sans
//      secteur, « à étayer » 0 preuve, étayé), badge « à étayer » + défi de Léo,
//      vue « mon offre réelle » n'affiche que les étayés, Bearer transmis à l'API,
//      contrastes AA, zéro CDN ;
//   C. reshiram.html fausse session + 401 → fail-closed propre.
// NOTE : le flux avec session RÉELLE n'est pas prouvable en harnais (auth vivante).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8123';
const CAPTURES = new URL('./.cache/captures', import.meta.url).pathname;
mkdirSync(CAPTURES, { recursive: true });

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

const REF_SUPABASE = 'leosfqyidgsaescjbfom';
function scriptFausseSession() {
  return `try {
    window.localStorage.setItem('sb-${REF_SUPABASE}-auth-token', JSON.stringify({
      access_token: 'jeton-de-test',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'jeton-refresh',
      user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
    }));
  } catch (e) {}`;
}

// Fixture NEUTRE — AUCUN talent réel de Paul (noms inventés pour le harnais).
// Couvre les 4 formes du §7 : sectoriel multi-secteur (étayé), transversal sans
// secteur (étayé), « à étayer » 0 preuve, un autre étayé. a_etayer/nb_preuves
// viennent de la vue talents_etat ; les preuves se rattachent par talent_id.
const FIXTURE = {
  ok: true,
  data: {
    talents: [
      { id: 't1', nom: 'CARTOGRAPHE', secteurs: ['orient', 'levant', 'ponant'], niveau: 'maitrise', plus_value: 'précision', nb_preuves: 2, a_etayer: false, created_at: '2026-07-01T10:00:00Z' },
      { id: 't2', nom: 'ARBITRE', secteurs: [], niveau: 'pratique', plus_value: null, nb_preuves: 1, a_etayer: false, created_at: '2026-07-02T10:00:00Z' },
      { id: 't3', nom: 'FONDEUR', secteurs: ['métaux'], niveau: 'notion', plus_value: null, nb_preuves: 0, a_etayer: true, created_at: '2026-07-03T10:00:00Z' },
      { id: 't4', nom: 'VEILLEUR', secteurs: ['nuit'], niveau: 'pratique', plus_value: 'endurance', nb_preuves: 1, a_etayer: false, created_at: '2026-07-04T10:00:00Z' },
    ],
    preuves: [
      { id: 'p1', talent_id: 't1', contenu: '12 relevés dressés en une saison' },
      { id: 'p2', talent_id: 't1', contenu: '0 erreur de bornage' },
      { id: 'p3', talent_id: 't2', contenu: '3 différends tranchés sans appel' },
      { id: 'p4', talent_id: 't4', contenu: '40 nuits de guet tenues' },
    ],
  },
};

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function nouvellePage(options = {}) {
  const page = await navigateur.newPage({ viewport: options.viewport || { width: 1280, height: 900 } });
  const erreurs = [];
  page.on('console', (msg) => { if (msg.type() === 'error') erreurs.push(msg.text()); });
  page.on('pageerror', (err) => erreurs.push(String(err)));
  const externes = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
  });
  if (options.configVide) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
        writable: false,
      });
    });
  }
  return { page, erreurs, externes };
}

// ===================== A. SANS session : fail-closed =====================
console.log('— A. reshiram.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/reshiram.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#reshiram-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#reshiram-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien vers RIVEN (flux lien-magique)',
    (await page.locator('#reshiram-auth a[href="traveler.html"]').count()) === 1);
  verifier('Registre caché', await page.locator('#reshiram-registre').evaluate((el) => el.hidden));
  verifier('Aucun talent dans le DOM', (await page.locator('.reshiram-talent').count()) === 0);
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#reshiram-chargement').evaluate((el) => el.hidden));

  // Contrastes AA sur l'écran réellement rendu.
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#reshiram-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#reshiram-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  verifier('Contraste titre auth ≥ 4,5:1', ratio(versHex(c.titre), c.parchemin) >= 4.5);
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Contraste mission sur mer ≥ 4,5:1', ratio(versHex(c.mission), c.merProfonde) >= 4.5);

  const hLien = await page.locator('#reshiram-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/reshiram-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== B. Fixture 200 : registre + à étayer + offre réelle =====================
console.log('— B. reshiram.html fixture 200 → registre, à étayer, offre réelle, Bearer —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsApi = [];
  await page.route('**/api/talents', (route) => {
    appelsApi.push(route.request().headers());
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(FIXTURE),
    });
  });
  await page.goto(`${BASE}/reshiram.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#reshiram-registre:not([hidden])', { timeout: 20000 });

  // 1. Bearer transmis à l'API.
  verifier('Un appel /api/talents (GET) au moins', appelsApi.length >= 1, `${appelsApi.length}`);
  const autorisation = (appelsApi[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);

  // 2. Toute la carte : 4 talents rendus.
  verifier('4 talents rendus (toute la carte)', (await page.locator('.reshiram-talent').count()) === 4);
  const noms = (await page.locator('.reshiram-talent-nom').allTextContents()).map((t) => t.trim());
  for (const attendu of ['CARTOGRAPHE', 'ARBITRE', 'FONDEUR', 'VEILLEUR']) {
    verifier(`Talent ${attendu} présent`, noms.includes(attendu));
  }

  // 3. Sectoriel multi-secteur : puces de secteurs ; transversal : badge.
  const t1 = page.locator('#reshiram-talent-t1');
  verifier('Sectoriel : 3 puces de secteurs (CARTOGRAPHE)',
    (await t1.locator('.reshiram-secteur').count()) === 3);
  verifier('Sectoriel : niveau gravé', /maîtrise/.test((await t1.locator('.reshiram-niveau').textContent()) || ''));
  verifier('Sectoriel : plus-value rendue', /précision/.test((await t1.textContent()) || ''));
  const t2 = page.locator('#reshiram-talent-t2');
  verifier('Transversal : badge « transversal » (ARBITRE sans secteur)',
    (await t2.locator('.reshiram-transversal').count()) === 1);
  verifier('Transversal : aucune puce de secteur', (await t2.locator('.reshiram-secteur').count()) === 0);

  // 4. Preuves rattachées + « à étayer » (le cœur RESHIRAM).
  verifier('Sectoriel étayé : 2 preuves listées', (await t1.locator('.reshiram-preuve').count()) === 2);
  verifier('Preuve rendue depuis l’API', /12 relevés dressés/.test((await t1.textContent()) || ''));
  const t3 = page.locator('#reshiram-talent-t3');
  verifier('« à étayer » : un seul badge sur toute la carte (FONDEUR 0 preuve)',
    (await page.locator('.reshiram-aetayer').count()) === 1);
  verifier('FONDEUR porte le badge « à étayer »', (await t3.locator('.reshiram-aetayer').count()) === 1);
  verifier('Léo challenge : « sur quoi tu bases ça ? »',
    /Sur quoi tu bases ça/.test((await t3.locator('.reshiram-defi').textContent()) || ''));
  verifier('FONDEUR : aucune preuve listée', (await t3.locator('.reshiram-preuve').count()) === 0);
  verifier('Formulaire d’ajout de preuve sur chaque talent',
    (await page.locator('.reshiram-preuve-form').count()) === 4);

  await page.screenshot({ path: `${CAPTURES}/reshiram-carte.png`, fullPage: true });

  // 5. Vue « mon offre réelle » : uniquement les étayés (a_etayer=false).
  await page.locator('#reshiram-vue-offre').click();
  await page.waitForTimeout(150);
  verifier('Offre réelle : 3 talents étayés', (await page.locator('.reshiram-talent').count()) === 3);
  verifier('Offre réelle : le talent « à étayer » est masqué',
    (await page.locator('#reshiram-talent-t3').count()) === 0);
  verifier('Offre réelle : aucun badge « à étayer »', (await page.locator('.reshiram-aetayer').count()) === 0);
  verifier('Bascule offre : bouton pressé', (await page.locator('#reshiram-vue-offre').getAttribute('aria-pressed')) === 'true');

  // Retour à toute la carte.
  await page.locator('#reshiram-vue-tous').click();
  await page.waitForTimeout(150);
  verifier('Retour toute la carte : 4 talents', (await page.locator('.reshiram-talent').count()) === 4);

  await page.screenshot({ path: `${CAPTURES}/reshiram-offre-reelle.png`, fullPage: true });

  // 6. Filtre PUR exposé pour le harnais.
  const filtre = await page.evaluate((fx) => {
    const t = fx.data.talents;
    return {
      tous: window.UltimaReshiram.talentsVisibles(t, 'tous').length,
      offre: window.UltimaReshiram.talentsVisibles(t, 'offre').length,
    };
  }, FIXTURE);
  verifier('talentsVisibles pur : tous=4, offre=3', filtre.tous === 4 && filtre.offre === 3, JSON.stringify(filtre));

  // 7. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      parcheminOmbre: cs.getPropertyValue('--parchemin-ombre').trim(),
      nom: getComputedStyle(document.querySelector('.reshiram-talent-nom')).color,
      niveau: getComputedStyle(document.querySelector('.reshiram-niveau')).color,
      preuve: getComputedStyle(document.querySelector('.reshiram-preuve')).color,
    };
  });
  for (const [nom, couleur, fond] of [
    ['nom de talent', cr.nom, cr.parcheminCarte],
    ['badge niveau', cr.niveau, cr.parcheminOmbre],
    ['preuve', cr.preuve, cr.parcheminCarte],
  ]) {
    const r = ratio(versHex(couleur), fond);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. 401 : fail-closed =====================
console.log('— C. reshiram.html fausse session → 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsApi = [];
  await page.route('**/api/talents', (route) => {
    appelsApi.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/reshiram.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#reshiram-auth:not([hidden])', { timeout: 20000 });

  verifier('Un appel /api/talents (et un seul)', appelsApi.length === 1, `${appelsApi.length}`);
  const autorisation = (appelsApi[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#reshiram-auth').textContent()) || ''));
  verifier('401 → aucun talent rendu', (await page.locator('.reshiram-talent').count()) === 0);
  verifier('401 → registre caché', await page.locator('#reshiram-registre').evaluate((el) => el.hidden));
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE RESHIRAM VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
