// Quadrant IMLADRIK (v1) : le journal intime « pouvoir écrire » — DERRIÈRE AUTH.
// Miroir de smoke-reshiram.mjs. Prouve :
//   A. imladrik.html SANS session (config vide) : FAIL-CLOSED — aucune page au
//      DOM, cartouche « Authentification requise », lien vers la boussole,
//      registre caché, zéro fuite réseau, zéro erreur console ;
//   B. imladrik.html avec FAUSSE session + /api/imladrik STUBÉE 200 (fixture
//      NEUTRE inventée) : journal rendu (titre, date, corps multi-ligne),
//      atelier d'écriture présent, écriture (POST + refresh) et effacement
//      (DELETE avec confirmation) transmettent le Bearer, contrastes AA, zéro CDN ;
//   C. imladrik.html fausse session + 401 → fail-closed propre.
// AUCUNE donnée intime réelle : tout est inventé pour le harnais.
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

// Fixture NEUTRE — AUCUNE page intime réelle (contenu inventé pour le harnais).
// Deux pages : l'une avec titre + corps multi-ligne, l'autre sans titre.
const FIXTURE = {
  ok: true,
  data: {
    entrees: [
      { id: 'e1', titre: 'Cap tenu', contenu: 'Première ligne.\nSeconde ligne.', created_at: '2026-07-22T14:05:00Z' },
      { id: 'e2', titre: null, contenu: 'Une page sans titre.', created_at: '2026-07-20T09:30:00Z' },
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
console.log('— A. imladrik.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#imladrik-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#imladrik-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien vers la boussole (connexion)',
    (await page.locator('#imladrik-auth a[href="/"]').count()) === 1);
  verifier('Registre caché', await page.locator('#imladrik-registre').evaluate((el) => el.hidden));
  verifier('Aucune page dans le DOM', (await page.locator('.imladrik-entree').count()) === 0);
  verifier('Aucun atelier d’écriture exposé', (await page.locator('#imladrik-form').count()) === 1 &&
    await page.locator('#imladrik-registre').evaluate((el) => el.hidden));
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#imladrik-chargement').evaluate((el) => el.hidden));

  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#imladrik-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#imladrik-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  verifier('Contraste titre auth ≥ 4,5:1', ratio(versHex(c.titre), c.parchemin) >= 4.5);
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Contraste mission sur mer ≥ 4,5:1', ratio(versHex(c.mission), c.merProfonde) >= 4.5);

  const hLien = await page.locator('#imladrik-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/imladrik-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== B. Fixture 200 : journal + écriture + effacement =====================
console.log('— B. imladrik.html fixture 200 → journal, écriture (POST), effacement (DELETE), Bearer —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  // window.confirm auto-accepté (l'effacement demande confirmation).
  await page.addInitScript(() => { window.confirm = () => true; });
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const appelsGet = [];
  await page.route('**/api/imladrik', (route) => {
    appelsGet.push(route.request().headers());
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(FIXTURE),
    });
  });
  const appelsEcriture = [];
  await page.route('**/api/imladrik/entrees**', (route) => {
    const req = route.request();
    appelsEcriture.push({ methode: req.method(), url: req.url(), headers: req.headers(), corps: req.postData() });
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'e-nouveau' } }),
    });
  });
  // Statut Drive : configuré ET connecté (section visible, boutons Sauvegarder + Déconnecter).
  const appelsDriveStatut = [];
  await page.route('**/api/imladrik/drive/status', (route) => {
    appelsDriveStatut.push(route.request().headers());
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { configured: true, connected: true } }),
    });
  });
  // Push : sauvegarde à la demande (fixture neutre).
  const appelsPush = [];
  await page.route('**/api/imladrik/drive/push', (route) => {
    appelsPush.push({ methode: route.request().method(), headers: route.request().headers() });
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { pousses: 2, inchanges: 0, echoues: 0, total: 2 } }),
    });
  });

  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#imladrik-registre:not([hidden])', { timeout: 20000 });

  // 1. Bearer transmis au GET.
  verifier('Un GET /api/imladrik au moins', appelsGet.length >= 1, `${appelsGet.length}`);
  verifier('Bearer de la session transmis (GET)',
    (appelsGet[0] || {}).authorization === 'Bearer jeton-de-test', `lu: ${(appelsGet[0] || {}).authorization}`);

  // 2. Journal rendu : 2 pages, titre, date, corps multi-ligne.
  verifier('2 pages rendues', (await page.locator('.imladrik-entree').count()) === 2);
  const e1 = page.locator('#imladrik-entree-e1');
  verifier('Titre de page rendu (Cap tenu)',
    (await e1.locator('.imladrik-entree-titre').textContent())?.trim() === 'Cap tenu');
  verifier('Date lisible gravée', /2026/.test((await e1.locator('.imladrik-entree-date').textContent()) || ''));
  verifier('Corps multi-ligne : 2 paragraphes',
    (await e1.locator('.imladrik-entree-corps p').count()) === 2);
  const e2 = page.locator('#imladrik-entree-e2');
  verifier('Page sans titre : aucun titre rendu', (await e2.locator('.imladrik-entree-titre').count()) === 0);
  verifier('Page sans titre : corps présent',
    /sans titre/.test((await e2.locator('.imladrik-entree-corps').textContent()) || ''));

  // 2bis. Section Drive : configurée ET connectée → section visible, statut lu
  // avec Bearer, « Connecter » caché, « Sauvegarder » + « Déconnecter » visibles.
  await page.waitForSelector('#imladrik-drive:not([hidden])', { timeout: 5000 });
  verifier('Section Drive visible (configurée)',
    !(await page.locator('#imladrik-drive').evaluate((el) => el.hidden)));
  verifier('GET /drive/status avec Bearer', appelsDriveStatut.length >= 1 &&
    (appelsDriveStatut[0] || {}).authorization === 'Bearer jeton-de-test');
  verifier('Bouton « Connecter » caché (déjà connecté)',
    await page.locator('#imladrik-drive-connecter').evaluate((el) => el.hidden));
  verifier('Bouton « Sauvegarder sur Drive » visible',
    !(await page.locator('#imladrik-drive-sauver').evaluate((el) => el.hidden)));
  verifier('Bouton « Déconnecter » visible (connecté)',
    !(await page.locator('#imladrik-drive-deconnecter').evaluate((el) => el.hidden)));

  // 2ter. Clic « Sauvegarder sur Drive » → POST /push avec Bearer + message de succès.
  await page.locator('#imladrik-drive-sauver').click();
  await page.waitForTimeout(250);
  const push = appelsPush.find((a) => a.methode === 'POST');
  verifier('POST /api/imladrik/drive/push émis', Boolean(push));
  verifier('Push : Bearer transmis', push && push.headers.authorization === 'Bearer jeton-de-test');
  verifier('Message de sauvegarde affiché',
    /sauvegard/i.test((await page.locator('#imladrik-drive-etat').textContent()) || ''));

  // 3. Atelier d'écriture présent.
  verifier('Champ titre présent', (await page.locator('#imladrik-titre').count()) === 1);
  verifier('Zone d’écriture présente', (await page.locator('#imladrik-contenu').count()) === 1);
  verifier('Bouton « Consigner » présent',
    /Consigner/.test((await page.locator('#imladrik-form button[type="submit"]').textContent()) || ''));

  await page.screenshot({ path: `${CAPTURES}/imladrik-journal.png`, fullPage: true });

  // 4. Écriture : POST avec Bearer + corps, puis refresh (GET rejoué).
  const getAvant = appelsGet.length;
  await page.fill('#imladrik-titre', 'Nouvelle page');
  await page.fill('#imladrik-contenu', 'Ce que je consigne aujourd’hui.');
  await page.locator('#imladrik-form button[type="submit"]').click();
  await page.waitForTimeout(250);
  const post = appelsEcriture.find((a) => a.methode === 'POST');
  verifier('POST /api/imladrik/entrees émis', Boolean(post), JSON.stringify(appelsEcriture.map((a) => a.methode)));
  verifier('POST : Bearer transmis', post && post.headers.authorization === 'Bearer jeton-de-test');
  verifier('POST : corps titre + contenu', post && /Nouvelle page/.test(post.corps || '') && /consigne aujourd/.test(post.corps || ''));
  verifier('Refresh après écriture (GET rejoué)', appelsGet.length > getAvant, `${getAvant}→${appelsGet.length}`);
  verifier('Message de succès affiché',
    /consignée/i.test((await page.locator('#imladrik-form-message').textContent()) || ''));

  // 5. Effacement : DELETE avec l'id en query + Bearer (confirmation auto-acceptée).
  await page.locator('#imladrik-entree-e1 .imladrik-bouton-effacer').click();
  await page.waitForTimeout(250);
  const del = appelsEcriture.find((a) => a.methode === 'DELETE');
  verifier('DELETE /api/imladrik/entrees émis', Boolean(del));
  verifier('DELETE : id ciblé en query', del && /id=e1/.test(del.url), del && del.url);
  verifier('DELETE : Bearer transmis', del && del.headers.authorization === 'Bearer jeton-de-test');

  // 6. Fonction pure formaterDate exposée.
  const dates = await page.evaluate(() => ({
    valide: window.UltimaImladrik.formaterDate('2026-07-22T14:05:00Z'),
    vide: window.UltimaImladrik.formaterDate('pas-une-date'),
  }));
  verifier('formaterDate pur : ISO → lisible', /2026/.test(dates.valide) && dates.valide.length > 8, dates.valide);
  verifier('formaterDate pur : invalide → vide', dates.vide === '', `lu: ${dates.vide}`);

  // 7. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      titre: getComputedStyle(document.querySelector('.imladrik-entree-titre')).color,
      corps: getComputedStyle(document.querySelector('.imladrik-entree-corps p')).color,
    };
  });
  for (const [nom, couleur] of [['titre de page', cr.titre], ['corps de page', cr.corps]]) {
    const r = ratio(versHex(couleur), cr.parcheminCarte);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. 401 : fail-closed =====================
console.log('— C. imladrik.html fausse session → 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsGet = [];
  await page.route('**/api/imladrik', (route) => {
    appelsGet.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#imladrik-auth:not([hidden])', { timeout: 20000 });

  verifier('Un GET /api/imladrik (et un seul)', appelsGet.length === 1, `${appelsGet.length}`);
  verifier('Bearer de la session transmis',
    (appelsGet[0] || {}).authorization === 'Bearer jeton-de-test', `lu: ${(appelsGet[0] || {}).authorization}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#imladrik-auth').textContent()) || ''));
  verifier('401 → aucune page rendue', (await page.locator('.imladrik-entree').count()) === 0);
  verifier('401 → registre caché', await page.locator('#imladrik-registre').evaluate((el) => el.hidden));
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IMLADRIK VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
