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

async function ouvrir({ client, api, hash = '' }, viewport = { width: 1280, height: 900 }) {
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
  await page.goto(`${BASE}/zohshia.html${hash}`, { waitUntil: 'load', timeout: 20000 });
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

// Chaque fiche publiée doit fonctionner ; tester seulement la première ne
// prouve ni les nouveaux onglets ni leurs ancres. API et session sont factices.
console.log('§0 — couverture de toutes les fiches, desktop et mobile');
verifier('catalogue non vide et identifiants uniques', donnee.technos.length > 0
  && new Set(donnee.technos.map(t => t.id)).size === donnee.technos.length);
for (const width of [1280, 390]) {
  for (const t of donnee.technos) {
    const { page, journal } = await ouvrir({ client: 'connecte', api: PAUL, hash: '#' + t.id }, { width, height: 900 });
    const fiche = page.locator('#technologie-' + t.id);
    verifier(`${width} ${t.id} : ancre ouverte`, await fiche.locator('.badge-techno').getAttribute('aria-expanded') === 'true');
    verifier(`${width} ${t.id} : tous les onglets publiés`, t.onglets.length > 0
      && JSON.stringify(await fiche.getByRole('tab').allTextContents()) === JSON.stringify(t.onglets.map(o => o.titre)));
    for (const o of t.onglets) {
      await fiche.getByRole('tab', { name: o.titre, exact: true }).click();
      verifier(`${width} ${t.id} ${o.id} : contenu non vide`, (await fiche.locator('.contenu').innerText()).trim().length > 30);
      const deborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      verifier(`${width} ${t.id} ${o.id} : aucune largeur hors écran`, deborde <= 1);
    }
    verifier(`${width} ${t.id} : aucune erreur ni requête externe`, !journal.erreurs.length && !journal.externes.length,
      [...journal.erreurs, ...journal.externes].join(' | '));
    await page.close();
  }
}

console.log('§1 — fermé : la page se tait');
for (const [nom, cas] of [
  ['sans configuration', { client: 'aucun', api: PAUL }],
  ['sans session', { client: 'deconnecte', api: PAUL }],
  ['sans session avec ancre', { client: 'deconnecte', api: PAUL, hash: '#presentations-claires' }],
  ['compte non propriétaire avec ancre (403)', { client: 'connecte', api: { status: 403, body: { ok: false } }, hash: '#presentations-claires' }],
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
    && (await page.locator('#techno-0 .onglet[aria-selected="true"]').textContent()) === 'Ce que fait la techno');
  verifier('les trois onglets', (await page.locator('#techno-0 .onglet').allTextContents()).join('|') === 'Ce que fait la techno|Check-list du pro|Mise en service');
  const nPlan = await page.locator('#techno-0 .contenu > *').count();
  verifier('le plan se rend (titres, tableaux)', nPlan > 20 && (await page.locator('#techno-0 .contenu table').count()) >= 3, String(nPlan));
  await page.locator('#techno-0 .onglet', { hasText: 'Check-list du pro' }).click();
  const check = (await page.locator('#techno-0 .contenu').textContent()) || '';
  verifier('la check-list se rend, avec les règles de prix du schéma', /coefficient_produits/.test(check) && /demi_journee_ht/.test(check) && /Deux voies/.test(check));
  await page.locator('#techno-0 .onglet[aria-selected="true"]').focus();
  await page.keyboard.press('ArrowRight');
  verifier('le clavier passe à l’onglet suivant', (await page.locator('#techno-0 .onglet[aria-selected="true"]').textContent()) === 'Mise en service'
    && /Voie B/.test((await page.locator('#techno-0 .contenu').textContent()) || ''));
  const cBadge = await contraste(page, '.badge-meta');
  const cTable = await contraste(page, '#techno-0 .contenu td');
  const cTexte = await contraste(page, '#techno-0 .contenu p');
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
  verifier('le retour mène aux technologies de ZOH SHIA',
    (await page.locator('a.retour-ultima').getAttribute('href')) === 'imladrik.html#zohshia');
  await page.close();
}

console.log('§2ter — étoile Présentations : ouverture directe et compétences');
for (const width of [1280, 390]) {
  const { page, journal } = await ouvrir({ client: 'connecte', api: PAUL, hash: '#presentations-claires' }, { width, height: 900 });
  const techno = page.locator('#technologie-presentations-claires');
  verifier(width + ' : la fiche liée à l’étoile est ouverte',
    await techno.locator('.badge-techno').getAttribute('aria-expanded') === 'true');
  verifier(width + ' : cinq onglets dont les deux compétences',
    (await techno.locator('.onglet').allTextContents()).join('|')
      === 'Ce que fait la techno|Règles de création|Composition éditoriale|Pitch sourcé|Utilisation et recette');
  await techno.getByRole('tab', { name: 'Composition éditoriale', exact: true }).click();
  verifier(width + ' : les instructions éditoriales sont consultables',
    /Créer les images/.test(await techno.locator('.contenu').textContent()));
  await techno.getByRole('tab', { name: 'Pitch sourcé', exact: true }).click();
  verifier(width + ' : les instructions du pitch sont consultables',
    /Construire l’histoire|Construire l'histoire/.test(await techno.locator('.contenu').textContent()));
  await page.evaluate(() => { location.hash = 'pilotage-back-office'; });
  await page.waitForFunction(() => document.querySelector('#technologie-pilotage-back-office .badge-techno')?.getAttribute('aria-expanded') === 'true');
  verifier(width + ' : une autre technologie reste accessible par ancre',
    await page.locator('#technologie-pilotage-back-office .badge-techno').getAttribute('aria-expanded') === 'true');
  await page.evaluate(() => { location.hash = '%E0%A4%A'; });
  verifier(width + ' : aucune erreur ni requête externe avec une ancre malformée',
    !journal.erreurs.length && !journal.externes.length);
  await page.close();
}


console.log('§2bis — pilotage : le second badge fonctionne indépendamment, desktop et mobile');
for (const width of [1280, 390]) {
  const { page, journal } = await ouvrir({ client: 'connecte', api: PAUL }, { width, height: 900 });
  const index = donnee.technos.findIndex(t => t.id === 'pilotage-back-office');
  verifier('la technologie de pilotage est publiée', index >= 0);
  if (index < 0) { await page.close(); continue; }
  const badge = page.locator('.badge-techno').nth(index);
  const panneau = page.locator('#techno-' + index);
  await badge.click();
  verifier(width + ' : le pilotage s’ouvre seul', (await badge.getAttribute('aria-expanded')) === 'true' && await panneau.isVisible()
    && (await page.locator('.badge-techno').first().getAttribute('aria-expanded')) === 'false');
  verifier(width + ' : ses trois onglets sont propres à la techno', (await panneau.locator('.onglet').allTextContents()).join('|') === 'Ce que fait la techno|Avant livraison|Mise en service');
  verifier(width + ' : la couverture et les droits serveur sont visibles', /droits_serveur/.test((await panneau.textContent()) || ''));
  await panneau.locator('.onglet', { hasText: 'Avant livraison' }).click();
  verifier(width + ' : la checklist se rend', /Recenser toutes les fonctions/.test((await panneau.locator('.contenu').textContent()) || ''));
  await panneau.locator('.onglet[aria-selected="true"]').focus();
  await page.keyboard.press('ArrowRight');
  verifier(width + ' : le clavier ouvre la mise en service', (await panneau.locator('.onglet[aria-selected="true"]').textContent()) === 'Mise en service'
    && /attestations/.test((await panneau.locator('.contenu').textContent()) || ''));
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  verifier(width + ' : aucune largeur hors écran', deborde <= 1);
  await badge.click();
  verifier(width + ' : le badge se referme', await panneau.isHidden());
  verifier(width + ' : aucune erreur ni requête externe', !journal.erreurs.length && !journal.externes.length);
  await page.close();
}

// Les autres badges sont vérifiés indépendamment, sans supposer leur rang.
{
  const { page, journal } = await ouvrir({ client: 'connecte', api: PAUL });
  const index = donnee.technos.findIndex(t => t.id === 'journal-apprentissages');
  verifier('le journal est publié', index >= 0);
  if (index >= 0) {
    const techno = donnee.technos[index];
    const panneau = page.locator(`#techno-${index}`);
    const badge = page.locator('.badge-techno').nth(index);
    verifier('le badge journal porte son nom et son état préparé',
      (await badge.textContent()).includes('Journal d’apprentissages')
      && (await badge.textContent()).includes('non activé'));
    await badge.click();
    verifier('les onglets du journal sont ceux du plan',
      (await panneau.locator('.onglet').allTextContents()).join('|') === techno.onglets.map(o => o.titre).join('|'));
    for (const onglet of techno.onglets) {
      await panneau.locator('.onglet', { hasText: onglet.titre }).click();
      verifier(`journal : ${onglet.titre} se rend`, (await panneau.locator('.contenu > *').count()) >= 3);
    }
    await page.setViewportSize({ width: 390, height: 800 });
    verifier('journal mobile sans débordement',
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1);
  }
  verifier('journal sans erreur ni requête externe', !journal.erreurs.length && !journal.externes.length);
  await page.close();
}

console.log('§3 — 390 px : lisible, sans défilement horizontal de la page');
{
  const { page } = await ouvrir({ client: 'connecte', api: PAUL }, { width: 390, height: 800 });
  await page.locator('.badge-techno').first().click();
  const t0 = page.locator('#techno-0');
  for (const titre of ['Ce que fait la techno', 'Check-list du pro', 'Mise en service']) {
    await page.locator('#techno-0 .onglet', { hasText: titre }).click();
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
    (await page.locator('#techno-0 .contenu img').count()) === 0 && (await page.evaluate(() => window.__pwn)) === undefined
    && /onerror/.test((await page.locator('#techno-0 .contenu p').first().textContent()) || ''));
  await page.close();
}

await navigateur.close();
if (echecs) { console.log(`\n${echecs} échec(s)`); process.exit(1); }
console.log('\nSMOKE-ZOHSHIA OK');

