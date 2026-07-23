// Quadrant ZEKROM (v1) : la carte des idéaux, tournée vers le cap — DERRIÈRE AUTH.
// Miroir de smoke-reshiram.mjs (ZEKROM ↔ RESHIRAM). Prouve :
//   A. zekrom.html SANS session (config vide) : FAIL-CLOSED — aucun idéal au DOM,
//      cartouche « Authentification requise », lien vers traveler, registre caché,
//      zéro fuite réseau, zéro erreur console ;
//   B. zekrom.html avec FAUSSE session + /api/ideaux STUBÉE 200 (fixture NEUTRE
//      inventée) : registre rendu, badge « à orienter » (0 direction) + invitation
//      de Léo, directions rattachées, vue « mon cap directionnel » n'affiche que
//      les idéaux orientés, Bearer transmis à l'API, contrastes AA, zéro CDN ;
//   C. zekrom.html fausse session + 401 → fail-closed propre.
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

// Fixture NEUTRE — AUCUN idéal réel de Paul (intitulés inventés pour le harnais).
// Couvre les 3 registres + les 2 états : orienté (au moins une direction) et
// « à orienter » (0 direction). a_orienter/nb_directions viennent de la vue
// ideaux_etat ; les directions se rattachent par ideal_id.
const FIXTURE = {
  ok: true,
  data: {
    ideaux: [
      { id: 'i1', intitule: 'PHARE', registre: 'projet', horizon: 'guider', nb_directions: 2, a_orienter: false, created_at: '2026-07-01T10:00:00Z' },
      { id: 'i2', intitule: 'ARCHIPEL', registre: 'vision', horizon: null, nb_directions: 1, a_orienter: false, created_at: '2026-07-02T10:00:00Z' },
      { id: 'i3', intitule: 'COMÈTE', registre: 'volonte', horizon: null, nb_directions: 0, a_orienter: true, created_at: '2026-07-03T10:00:00Z' },
      { id: 'i4', intitule: 'SILLAGE', registre: 'projet', horizon: 'durer', nb_directions: 1, a_orienter: false, created_at: '2026-07-04T10:00:00Z' },
    ],
    directions: [
      { id: 'd1', ideal_id: 'i1', formulation: 'dresser la tour sur le cap' },
      { id: 'd2', ideal_id: 'i1', formulation: 'tenir la flamme chaque nuit' },
      { id: 'd3', ideal_id: 'i2', formulation: 'relier les îles une à une' },
      { id: 'd4', ideal_id: 'i4', formulation: 'garder le sillage droit' },
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
console.log('— A. zekrom.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/zekrom.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#zekrom-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#zekrom-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien vers RIVEN (flux lien-magique)',
    (await page.locator('#zekrom-auth a[href="traveler.html"]').count()) === 1);
  verifier('Registre caché', await page.locator('#zekrom-registre').evaluate((el) => el.hidden));
  verifier('Aucun idéal dans le DOM', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#zekrom-chargement').evaluate((el) => el.hidden));

  // Contrastes AA sur l'écran réellement rendu.
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#zekrom-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#zekrom-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  verifier('Contraste titre auth ≥ 4,5:1', ratio(versHex(c.titre), c.parchemin) >= 4.5);
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Contraste mission sur mer ≥ 4,5:1', ratio(versHex(c.mission), c.merProfonde) >= 4.5);

  const hLien = await page.locator('#zekrom-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/zekrom-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== B. Fixture 200 : registre + à orienter + cap =====================
console.log('— B. zekrom.html fixture 200 → registre, à orienter, cap directionnel, Bearer —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsApi = [];
  await page.route('**/api/ideaux', (route) => {
    appelsApi.push(route.request().headers());
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(FIXTURE),
    });
  });
  await page.goto(`${BASE}/zekrom.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#zekrom-registre:not([hidden])', { timeout: 20000 });

  // 1. Bearer transmis à l'API.
  verifier('Un appel /api/ideaux (GET) au moins', appelsApi.length >= 1, `${appelsApi.length}`);
  const autorisation = (appelsApi[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);

  // 2. Toute la carte : 4 idéaux rendus.
  verifier('4 idéaux rendus (toute la carte)', (await page.locator('.zekrom-ideal').count()) === 4);
  const noms = (await page.locator('.zekrom-ideal-intitule').allTextContents()).map((t) => t.trim());
  for (const attendu of ['PHARE', 'ARCHIPEL', 'COMÈTE', 'SILLAGE']) {
    verifier(`Idéal ${attendu} présent`, noms.includes(attendu));
  }

  // 3. Registre gravé + horizon rendu.
  const i1 = page.locator('#zekrom-ideal-i1');
  verifier('Registre gravé (PHARE = projet)', /projet/.test((await i1.locator('.zekrom-registre').textContent()) || ''));
  verifier('Horizon rendu (PHARE)', /guider/.test((await i1.textContent()) || ''));
  const i2 = page.locator('#zekrom-ideal-i2');
  verifier('Registre vision (ARCHIPEL)', /vision/.test((await i2.locator('.zekrom-registre').textContent()) || ''));

  // 4. Directions rattachées + « à orienter » (le cœur ZEKROM, invitation).
  verifier('Idéal orienté : 2 directions listées (PHARE)', (await i1.locator('.zekrom-direction').count()) === 2);
  verifier('Direction rendue depuis l’API', /dresser la tour/.test((await i1.textContent()) || ''));
  const i3 = page.locator('#zekrom-ideal-i3');
  verifier('« à orienter » : un seul badge sur toute la carte (COMÈTE 0 direction)',
    (await page.locator('.zekrom-aorienter').count()) === 1);
  verifier('COMÈTE porte le badge « à orienter »', (await i3.locator('.zekrom-aorienter').count()) === 1);
  verifier('Léo invite : « vers quoi ce rêve t’emmène ? »',
    /Vers quoi ce rêve/.test((await i3.locator('.zekrom-invite').textContent()) || ''));
  verifier('COMÈTE : aucune direction listée', (await i3.locator('.zekrom-direction').count()) === 0);
  verifier('Formulaire d’ajout de direction sur chaque idéal',
    (await page.locator('.zekrom-direction-form').count()) === 4);

  await page.screenshot({ path: `${CAPTURES}/zekrom-carte.png`, fullPage: true });

  // 5. Vue « mon cap directionnel » : uniquement les idéaux orientés (a_orienter=false).
  await page.locator('#zekrom-vue-cap').click();
  await page.waitForTimeout(150);
  verifier('Cap directionnel : 3 idéaux orientés', (await page.locator('.zekrom-ideal').count()) === 3);
  verifier('Cap directionnel : l’idéal « à orienter » est masqué',
    (await page.locator('#zekrom-ideal-i3').count()) === 0);
  verifier('Cap directionnel : aucun badge « à orienter »', (await page.locator('.zekrom-aorienter').count()) === 0);
  verifier('Bascule cap : bouton pressé', (await page.locator('#zekrom-vue-cap').getAttribute('aria-pressed')) === 'true');

  // Retour à tous les idéaux.
  await page.locator('#zekrom-vue-tous').click();
  await page.waitForTimeout(150);
  verifier('Retour toute la carte : 4 idéaux', (await page.locator('.zekrom-ideal').count()) === 4);

  await page.screenshot({ path: `${CAPTURES}/zekrom-cap.png`, fullPage: true });

  // 6. Filtre PUR exposé pour le harnais.
  const filtre = await page.evaluate((fx) => {
    const i = fx.data.ideaux;
    return {
      tous: window.UltimaZekrom.ideauxVisibles(i, 'tous').length,
      cap: window.UltimaZekrom.ideauxVisibles(i, 'cap').length,
    };
  }, FIXTURE);
  verifier('ideauxVisibles pur : tous=4, cap=3', filtre.tous === 4 && filtre.cap === 3, JSON.stringify(filtre));

  // 7. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      parcheminOmbre: cs.getPropertyValue('--parchemin-ombre').trim(),
      intitule: getComputedStyle(document.querySelector('.zekrom-ideal-intitule')).color,
      registre: getComputedStyle(document.querySelector('.zekrom-registre')).color,
      direction: getComputedStyle(document.querySelector('.zekrom-direction')).color,
    };
  });
  for (const [nom, couleur, fond] of [
    ['intitulé d’idéal', cr.intitule, cr.parcheminCarte],
    ['badge registre', cr.registre, cr.parcheminOmbre],
    ['direction', cr.direction, cr.parcheminCarte],
  ]) {
    const r = ratio(versHex(couleur), fond);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. 401 : fail-closed =====================
console.log('— C. zekrom.html fausse session → 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsApi = [];
  await page.route('**/api/ideaux', (route) => {
    appelsApi.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/zekrom.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#zekrom-auth:not([hidden])', { timeout: 20000 });

  verifier('Un appel /api/ideaux (et un seul)', appelsApi.length === 1, `${appelsApi.length}`);
  const autorisation = (appelsApi[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#zekrom-auth').textContent()) || ''));
  verifier('401 → aucun idéal rendu', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('401 → registre caché', await page.locator('#zekrom-registre').evaluate((el) => el.hidden));
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ZEKROM VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
