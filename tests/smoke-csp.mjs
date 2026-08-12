// La CSP du middleware tient sans casser Ultima (2026-08-12).
//
// Les en-têtes de sécurité sont posés par `middleware.js` (edge Vercel), pas
// par `vercel.json` — l'audit du 12/08 l'a rappelé. Ce que RIEN ne testait
// jusqu'ici : que la CSP réellement servie N'INTERDIT PAS une ressource dont
// l'app a besoin. Une CSP trop stricte ne lève aucune erreur au build ; elle
// casse en silence dans le navigateur de Paul. C'est exactement le mode de
// défaillance que ce harnais ferme.
//
// La CSP est LUE depuis middleware.js (une seule source de vérité, jamais
// recopiée), injectée en <meta> sur les pages réelles, puis la carte et le
// ciel sont exercés. Le verdict porte sur l'événement natif
// `securitypolicyviolation` — précis, pas un message de console approximatif.
// Les directives ignorées en <meta> (frame-ancestors…) ne bloquent aucune
// ressource : le risque de casse vit dans script/style/img/connect, tous
// exercés ici.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const racine = new URL('..', import.meta.url).pathname;

const middleware = readFileSync(`${racine}/middleware.js`, 'utf8');
const config = readFileSync(`${racine}/js/config.js`, 'utf8');

// --- Extraction de la CSP réelle depuis middleware.js (pas de recopie) ---
const blocCSP = (middleware.match(/const CSP = \[([\s\S]*?)\]\.join/) || [])[1] || '';
const directives = [...blocCSP.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const csp = directives.join('; ');

const verdicts = {};

// ---------- 1. STATIQUE : en-têtes et cohérence des hôtes ----------
verdicts.cspExtraite = directives.length >= 8 && csp.length > 0;
// Les six en-têtes de sécurité sont bien posés par applySecurityHeaders.
const REQUIS = [
  'Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options',
  'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy',
];
verdicts.tousLesEntetesPresents = REQUIS.every((k) =>
  new RegExp("set\\('" + k + "'").test(middleware));
// microphone=(self) : la dictée vocale en dépend — ne jamais le fermer.
verdicts.micPreserve = /microphone=\(self\)/.test(middleware);
// script-src sans 'unsafe-inline' (aucun handler inline dans le produit).
verdicts.scriptSrcSansUnsafeInline = /script-src[^;]*/.test(csp) &&
  !/script-src[^;]*'unsafe-inline'/.test(csp);
verdicts.objectSrcNone = /object-src 'none'/.test(csp);
verdicts.antiClickjacking = /frame-ancestors 'none'/.test(csp);

// Le Supabase réel de config.js doit être atteignable, sinon l'app perd sa base
// une fois la CSP posée (invisible en mode démo).
const urlSupabase = (config.match(/SUPABASE_URL:\s*'([^']+)'/) || [])[1] || '';
verdicts.supabaseAtteignable = !!urlSupabase &&
  new RegExp('connect-src[^;]*' + urlSupabase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(csp);
verdicts.leafletAtteignable = /script-src[^;]*https:\/\/unpkg\.com/.test(csp);

// ---------- 2. DYNAMIQUE : la CSP réelle ne casse rien ----------
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function chargerSousCSP(page) {
  await page.route('**/*.html', async (route) => {
    if (route.request().resourceType() !== 'document') { return route.continue(); }
    const resp = await route.fetch();
    let corps = await resp.text();
    const meta = '<meta http-equiv="Content-Security-Policy" content="' +
      csp.replace(/"/g, '&quot;') + '">';
    corps = corps.replace(/<head(\s[^>]*)?>/i, (m) => m + meta);
    return route.fulfill({ response: resp, body: corps });
  });
  await page.route('**://unpkg.com/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (u.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  const PNG_1PX = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64');
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__csp.push({ directive: e.violatedDirective, uri: e.blockedURI });
    });
    try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
    });
  });
}

const pRiven = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await chargerSousCSP(pRiven);
await pRiven.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await pRiven.waitForTimeout(900);
verdicts.cspActiveSurLaPage = await pRiven.evaluate(() =>
  !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
// Exercer la CARTE (tuiles OSM + styles inline Leaflet) puis le CIEL (SVG).
await pRiven.locator('.barre-onglets button', { hasText: 'Carte' }).click();
await pRiven.waitForTimeout(1400);
verdicts.carteRendueSousCSP = await pRiven.evaluate(() =>
  !!document.querySelector('.leaflet-container'));
await pRiven.locator('.barre-onglets button', { hasText: 'Ciel' }).click();
await pRiven.waitForTimeout(900);
verdicts.cielRenduSousCSP = await pRiven.evaluate(() =>
  document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]').length > 0);
const violRiven = await pRiven.evaluate(() => window.__csp);
// LE verdict qui compte : zéro ressource bloquée. Les tuiles OSM en font partie.
verdicts.rivenZeroViolationCSP = Array.isArray(violRiven) && violRiven.length === 0;
verdicts.tuilesNonBloquees = !violRiven.some((v) =>
  /img-src/.test(v.directive) && /openstreetmap/.test(v.uri));

const pIndex = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await chargerSousCSP(pIndex);
await pIndex.goto('http://127.0.0.1:8123/index.html', { waitUntil: 'load', timeout: 20000 });
await pIndex.waitForTimeout(900);
const violIndex = await pIndex.evaluate(() => window.__csp);
verdicts.indexZeroViolationCSP = Array.isArray(violIndex) && violIndex.length === 0;

await browser.close();

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) { rouge = true; }
}
if (violRiven && violRiven.length) { console.log('Violations riven :', JSON.stringify(violRiven, null, 1)); }
if (violIndex && violIndex.length) { console.log('Violations index :', JSON.stringify(violIndex, null, 1)); }
console.log(rouge ? 'SMOKE CSP ROUGE' : 'SMOKE CSP VERT');
process.exit(rouge ? 1 : 0);
