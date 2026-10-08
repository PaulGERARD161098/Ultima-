// Vérification de ZOH SHIA à l'écran (zohshia.html + js/zohshia.js), 04/10/2026.
//
// Prouve : sans configuration, sans session, en 401/403/503, la page SE TAIT
// (aucun badge, aucun contenu) ; connectée, le badge porte le libellé exact,
// s'ouvre sur trois onglets dont le contenu se rend ; le clavier passe d'un
// onglet à l'autre ; aucune requête externe, aucune erreur ; lisible à 390 px
// sans défilement horizontal de la page ; contraste AA mesuré sur les textes
// rendus APRÈS authentification ; une balise dans la donnée reste du TEXTE.
import { chromium } from 'playwright';
import donnee from '../api/_lib/zohshia-technos.mjs';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function ouvrir({ client, api }, viewport = { width: 1280, height: 900 }) {
  const page = await navigateur.newPage({ viewport });
  const journal = { erreurs: [], externes: [], appels: 0 };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  // Le navigateur journalise LUI-MÊME une réponse 4xx/5xx du stub (« Failed to load
  // resource … status of 403 ») : c'est le cas éprouvé, pas une erreur de la page.
  // Seul ce message exact, pour le seul statut stubé, est écarté.
  const attendu = api && api.status >= 400 ? new RegExp(`^Failed to load resource: .*status of ${api.status}\\b`) : null;
  page.on('console', (m) => { if (m.type() === 'error' && !(attendu && attendu.test(m.text()))) journal.erreurs.push(m.text()); });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
    if (url.includes('/api/zohshia')) journal.appels += 1;
  });
  await page.route('**/api/zohshia', (r) => r.fulfill(api
    ? { status: api.status, contentType: 'application/json', body: JSON.stringify(api.body) }
    : { status: 500, contentType: 'application/json', body: '{"ok":false}' }));
  if (client === 'aucun') {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  } else {
    const session = client === 'connecte' ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }' : 'null';
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return { auth: {
        getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
        onAuthStateChange: function () {} } }; } };`,
    }));
  }
  await page.goto(`${BASE}/zohshia.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(500);
  return { page, journal };
}

function contraste(page, sel) {
  return page.evaluate(([s]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (p) => 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]);
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
    const el = document.querySelector(s);
    if (!el) return NaN;
    const t = parse(getComputedStyle(el).color);
    let n = el, fond = null;
    while (n && n.nodeType === 1) { const bg = parse(getComputedStyle(n).backgroundColor); if (bg && bg.a >= 0.5) { fond = bg; break; } n = n.parentNode; }
    if (!t || !fond) return NaN;
    const a = lum(t.rgb), b = lum(fond.rgb);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, [sel]);
}

const PAUL = { status: 200, body: { ok: true, data: donnee } };

console.log('§1 — fermé : la page se tait');
for (const [nom, cas] of [
  ['sans configuration', { client: 'aucun', api: PAUL }],
  ['sans session', { client: 'deconnecte', api: PAUL }],
  ['session expirée (401)', { client: 'connecte', api: { status: 401, body: { ok: false } } }],
  ['compte qui n’est pas le propriétaire (403)', { client: 'connecte', api: { status: 403, body: { ok: false } } }],
  ['réglage du propriétaire absent (503)', { client: 'connecte', api: { status: 503, body: { ok: false } } }],
]) {
  const { page, journal } = await ouvrir(cas);
  const texte = (await page.locator('#technos').textContent()) || '';
  verifier(`${nom} : aucun badge, un message`, (await page.locator('.badge-techno').count()) === 0 && texte.trim().length > 10, texte.trim());
  verifier(`${nom} : aucune erreur, aucune requête externe`, !journal.erreurs.length && !journal.externes.length,
    [...journal.erreurs, ...journal.externes].join(' | '));
  if (nom.startsWith('sans')) verifier(`${nom} : l'API n'est même pas appelée`, journal.appels === 0, String(journal.appels));
  await page.close();
}

console.log('§2 — ouvert au propriétaire : un badge par techno, son contenu dedans');
{
  const { page, journal } = await ouvrir({ client: 'connecte', api: PAUL });
  const badges = page.locator('.badge-techno');
  // Une techno par badge : chaque vérification se cible sur SON badge (#techno-N).
  const t0 = page.locator('#techno-0');
  verifier('autant de badges que de technos publiées (verrou : au moins une)',
    donnee.technos.length >= 1 && (await badges.count()) === donnee.technos.length);
  verifier('le libellé exact du premier badge', ((await page.locator('.badge-nom').first().textContent()) || '').trim()
    === 'Outil de création de devis / relance automatique');
  verifier('fermé tant qu’on ne l’ouvre pas', (await badges.first().getAttribute('aria-expanded')) === 'false'
    && await page.locator('.techno-ouverte').first().isHidden());
  await badges.first().click();
  verifier('ouvert au clic, premier onglet choisi', (await badges.first().getAttribute('aria-expanded')) === 'true'
    && (await t0.locator('.onglet[aria-selected="true"]').textContent()) === 'Ce que fait la techno');
  verifier('les trois onglets', (await t0.locator('.onglet').allTextContents()).join('|') === 'Ce que fait la techno|Check-list du pro|Mise en service');
  const nPlan = await t0.locator('.contenu > *').count();
  verifier('le plan se rend (titres, tableaux)', nPlan > 20 && (await t0.locator('.contenu table').count()) >= 3, String(nPlan));
  await t0.locator('.onglet', { hasText: 'Check-list du pro' }).click();
  const check = (await t0.locator('.contenu').textContent()) || '';
  verifier('la check-list se rend, avec les règles de prix du schéma', /coefficient_produits/.test(check) && /demi_journee_ht/.test(check) && /Deux voies/.test(check));
  await t0.locator('.onglet[aria-selected="true"]').focus();
  await page.keyboard.press('ArrowRight');
  verifier('le clavier passe à l’onglet suivant', (await t0.locator('.onglet[aria-selected="true"]').textContent()) === 'Mise en service'
    && /Voie B/.test((await t0.locator('.contenu').textContent()) || ''));
  const cBadge = await contraste(page, '.badge-meta');
  const cTable = await contraste(page, '.contenu td');
  const cTexte = await contraste(page, '.contenu p');
  verifier('contraste AA mesuré (méta du badge, cellule, paragraphe)',
    [cBadge, cTable, cTexte].every((c) => Number.isFinite(c) && c >= 4.5), [cBadge, cTable, cTexte].map((c) => c.toFixed(2)).join(' · '));
  verifier('aucune erreur, aucune requête externe', !journal.erreurs.length && !journal.externes.length,
    [...journal.erreurs, ...journal.externes].join(' | '));
  const devis = donnee.technos.findIndex((t) => t.id === 'devis');
  verifier('la deuxième étoile est publiée : le générateur de devis', devis >= 0);
  if (devis >= 0) {
    const tD = page.locator(`#techno-${devis}`);
    await badges.nth(devis).click();
    verifier('son badge porte le libellé exact', ((await badges.nth(devis).locator('.badge-nom').textContent()) || '').trim() === 'Générateur de devis');
    verifier('ses deux onglets', (await tD.locator('.onglet').allTextContents()).join('|') === 'Ce que fait la techno|Faire un devis');
    verifier('son plan se rend, règles de calcul comprises', /centimes entiers/.test((await tD.locator('.contenu').textContent()) || ''));
  }
  verifier('le retour mène à la constellation des DRAGONS',
    (await page.locator('a.retour-ultima').getAttribute('href')) === 'imladrik.html#constellation-dragons');
  await page.close();
}

console.log('§3 — 390 px : lisible, sans défilement horizontal de la page');
{
  const { page } = await ouvrir({ client: 'connecte', api: PAUL }, { width: 390, height: 800 });
  await page.locator('.badge-techno').first().click();
  const t0 = page.locator('#techno-0');
  for (const titre of ['Ce que fait la techno', 'Check-list du pro', 'Mise en service']) {
    await t0.locator('.onglet', { hasText: titre }).click();
    const deborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    verifier(`${titre} : la page ne déborde pas (${deborde}px)`, deborde <= 1);
  }
  const cible = await page.locator('.badge-techno').first().boundingBox();
  verifier('le badge se touche au doigt (≥ 44 px)', cible && cible.height >= 44);
  await page.close();
}

console.log('§4 — une balise dans la donnée reste du texte');
{
  const hostile = JSON.parse(JSON.stringify(donnee));
  hostile.technos[0].onglets[0].blocs.unshift({ t: 'p', r: [['<img src=x onerror="window.__pwn=1">', '']] });
  const { page } = await ouvrir({ client: 'connecte', api: { status: 200, body: { ok: true, data: hostile } } });
  await page.locator('.badge-techno').first().click();
  await page.waitForTimeout(200);
  verifier('aucune image injectée, aucun script exécuté',
    (await page.locator('.contenu img').count()) === 0 && (await page.evaluate(() => window.__pwn)) === undefined
    && /onerror/.test((await page.locator('.contenu p').first().textContent()) || ''));
  await page.close();
}

await navigateur.close();
if (echecs) { console.log(`\n${echecs} échec(s)`); process.exit(1); }
console.log('\nSMOKE-ZOHSHIA OK');
