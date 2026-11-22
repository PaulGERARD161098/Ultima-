// CARADRYEL — la porte du scriptorium (boucle C1, CADRAGE-CARADRYEL.md §7).
// Prouve, dans le navigateur, avec l'API SIMULÉE (fixture NEUTRE inventée) :
//   A. sans session : fail-closed — 0 œuvre au DOM, cartouche de session visible
//      (verrou de non-vacuité : la page s'est bien chargée), zéro CDN ;
//      et aucun titre réel dans le code SERVI (HTML, JS, CSS, registre) ;
//   B. avec session : 4 cartes en boussole (la 1ʳᵉ au Nord), liens Docs
//      reconstruits, rel="noopener noreferrer", Bearer transmis, pilotage n/4 ;
//      un titre hostile est rendu comme du TEXTE ;
//   C. liaison : lien refusé (400) → message ; lien accepté → la carte s'ouvre ;
//   D. liste vide → « Poser mes quatre œuvres » → POST initialiser ;
//   E. 503 (migration absente) et 401 : états propres, 0 œuvre ;
//   F. téléphone (390 px) : toutes les cartes dans l'écran.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8123';
const RACINE = new URL('../', import.meta.url);
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

const REF_SUPABASE = 'leosfqyidgsaescjbfom';
const FAUSSE_SESSION = `try {
  window.localStorage.setItem('sb-${REF_SUPABASE}-auth-token', JSON.stringify({
    access_token: 'jeton-de-test', token_type: 'bearer', expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'jeton-refresh',
    user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
  }));
} catch (e) {}`;

const ID_A = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const ID_B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
const ID_C = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';
const uuid = (n) => `00000000-0000-4000-8000-00000000000${n}`;
// Fixture NEUTRE : aucun titre réel. La 4ᵉ est hostile (injection HTML).
const OEUVRES = () => [
  { id: uuid(1), titre: 'Œuvre du Nord', ordre: 1, lie: true, drive_file_id: ID_A },
  { id: uuid(2), titre: 'Œuvre de l’Est', ordre: 2, lie: false, drive_file_id: null },
  { id: uuid(3), titre: 'Œuvre du Sud', ordre: 3, lie: true, drive_file_id: ID_B },
  { id: uuid(4), titre: '<img src=x onerror="window.__xss=1">', ordre: 4, lie: false, drive_file_id: null },
];

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function ouvrir({ session = true, configVide = false, routeur, viewport } = {}) {
  const page = await navigateur.newPage({ viewport: viewport || { width: 1280, height: 900 } });
  const erreurs = [];
  const externes = [];
  const appels = [];
  page.on('pageerror', (e) => erreurs.push(String(e)));
  page.on('console', (m) => {
    // Les réponses HTTP en erreur voulues par le scénario (401/400/503) sont
    // journalisées par le navigateur : ce n'est pas une erreur de la page.
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text());
  });
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !u.startsWith('data:')) externes.push(u); });
  if (configVide) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    });
  }
  if (session) await page.addInitScript(FAUSSE_SESSION);
  // Tout appel sortant vers Supabase est coupé : aucune donnée réelle, aucun réseau.
  await page.route(/supabase\.co/, (r) => r.abort());
  await page.route('**/api/imladrik/drive/status', (r) => r.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { configured: true, connected: true } }) }));
  await page.route('**/api/caradryel', async (r) => {
    const req = r.request();
    const corps = req.postData() ? JSON.parse(req.postData()) : null;
    appels.push({ methode: req.method(), auth: req.headers().authorization || '', corps });
    const [statut, json] = routeur ? routeur(req.method(), corps) : [200, { ok: true, data: { oeuvres: OEUVRES() } }];
    await r.fulfill({ status: statut, contentType: 'application/json', body: JSON.stringify(json) });
  });
  return { page, erreurs, externes, appels };
}
const nbCartes = (page) => page.locator('.caradryel-oeuvre').count();

// ======================= A. Sans session =======================
console.log('— A. caradryel.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await ouvrir({ session: false, configVide: true });
  await page.goto(`${BASE}/caradryel.html`, { waitUntil: 'load' });
  await page.waitForSelector('#caradryel-auth:not([hidden])', { timeout: 15000 });
  const texte = (await page.locator('#caradryel-auth').textContent()) || '';
  verifier('Verrou de non-vacuité : cartouche de session visible et rédigé', /session/.test(texte) && texte.length > 40);
  verifier('Aucune œuvre au DOM', (await nbCartes(page)) === 0);
  verifier('Porte cachée', await page.locator('#caradryel-porte').evaluate((e) => e.hidden));
  verifier('Chargement effacé', await page.locator('#caradryel-chargement').evaluate((e) => e.hidden));
  verifier('Zéro requête externe (CDN)', externes.length === 0, externes.join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.join(' | '));
  await page.close();

  // Le code servi ne porte aucun titre réel (régime §5). Verrou : les fichiers sont lus et non vides.
  const servis = ['caradryel.html', 'js/caradryel.js', 'css/caradryel.css', 'js/registre-lv3.mjs', 'js/blasons.mjs']
    .map((f) => readFileSync(new URL(f, RACINE), 'utf8'));
  verifier('Verrou : les cinq fichiers servis sont lus (non vides)', servis.every((t) => t.length > 500));
  verifier('Le registre porte bien CARADRYEL', servis[3].includes("caradryel: {"));
  const titresReels = ['Lettres à Léo', 'Vies volées', 'Catabasis', 'Anabasis'];
  verifier('Aucun titre d’œuvre réel dans le code servi',
    servis.every((t) => titresReels.every((titre) => !t.includes(titre))));
}

// ======================= B. Avec session : la porte =======================
console.log('— B. caradryel.html avec session : la porte —');
{
  const { page, erreurs, externes, appels } = await ouvrir();
  await page.goto(`${BASE}/caradryel.html`, { waitUntil: 'load' });
  await page.waitForSelector('#caradryel-porte:not([hidden])', { timeout: 15000 });
  verifier('Quatre cartes', (await nbCartes(page)) === 4);
  verifier('Bearer transmis', appels[0] && appels[0].auth === 'Bearer jeton-de-test');
  const boites = await page.locator('.caradryel-oeuvre').evaluateAll((els) => els.map((e) => {
    const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }));
  verifier('La 1ʳᵉ au Nord, la 3ᵉ au Sud, la 2ᵉ à l’Est, la 4ᵉ à l’Ouest',
    boites[0].y < boites[1].y && boites[2].y > boites[1].y && boites[1].x > boites[3].x
    && Math.abs(boites[0].x - boites[2].x) < 2);
  const liens = await page.locator('.caradryel-oeuvre-ouvrir').evaluateAll((els) => els.map((a) => ({
    href: a.getAttribute('href'), rel: a.getAttribute('rel'), target: a.getAttribute('target') })));
  verifier('Deux liens Docs reconstruits depuis l’identifiant', JSON.stringify(liens.map((l) => l.href)) === JSON.stringify([
    `https://docs.google.com/document/d/${ID_A}/edit`, `https://docs.google.com/document/d/${ID_B}/edit`]));
  verifier('rel="noopener noreferrer" et nouvel onglet', liens.every((l) => l.rel === 'noopener noreferrer' && l.target === '_blank'));
  verifier('Deux boutons « Lier le Doc »', (await page.locator('.caradryel-oeuvre-lier').count()) === 2);
  verifier('Titre hostile rendu en TEXTE (aucune image injectée)',
    (await page.locator('.caradryel-oeuvre img').count()) === 0
    && (await page.evaluate(() => window.__xss)) === undefined
    && /<img/.test((await page.locator('.caradryel-oeuvre-titre').nth(3).textContent()) || ''));
  await page.waitForFunction(() => /Drive connecté/.test(document.getElementById('caradryel-pilotage').textContent));
  verifier('Pilotage : 2/4 reliées · Drive connecté',
    (await page.locator('#caradryel-pilotage').textContent()) === '2/4 œuvres reliées à leur Doc. · Drive connecté.');
  await page.locator('.caradryel-oeuvre').nth(0).hover();
  verifier('Survol : la parole nomme l’œuvre', /Œuvre du Nord — reliée/.test(await page.locator('#caradryel-parole').textContent()));
  verifier('Survol : l’aiguille s’allume', (await page.locator('.caradryel-aiguille.is-actif').count()) === 1);
  verifier('Zéro requête externe', externes.length === 0, externes.join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.join(' | '));

  // ======================= C. Liaison =======================
  console.log('— C. Lier une œuvre à son Doc —');
  let liste = OEUVRES();
  await page.unroute('**/api/caradryel');
  const patchs = [];
  await page.route('**/api/caradryel', async (r) => {
    const corps = JSON.parse(r.request().postData() || 'null');
    patchs.push(corps);
    if (!/^https:\/\/docs\.google\.com\//.test(corps.drive_url)) {
      return r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Lien Google Docs non reconnu' }) });
    }
    liste = liste.map((o) => (o.id === corps.id ? { ...o, lie: true, drive_file_id: ID_C } : o));
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { oeuvres: liste } }) });
  });
  await page.locator('.caradryel-oeuvre-lier').first().click();
  verifier('Le formulaire s’ouvre, titré par l’œuvre', /Œuvre de l’Est/.test(await page.locator('#caradryel-lier-titre').textContent()));
  await page.fill('#caradryel-lier-url', 'https://evil.tld/document/d/x');
  await page.locator('#caradryel-lier button[type=submit]').click();
  await page.waitForFunction(() => /pas celui d’un Google Doc/.test(document.getElementById('caradryel-lier-message').textContent));
  verifier('Lien refusé : message clair, formulaire toujours ouvert', !(await page.locator('#caradryel-lier').evaluate((e) => e.hidden)));
  await page.fill('#caradryel-lier-url', `https://docs.google.com/document/d/${ID_C}/edit`);
  await page.locator('#caradryel-lier button[type=submit]').click();
  await page.waitForFunction(() => document.getElementById('caradryel-lier').hidden);
  verifier('PATCH {id, drive_url} pour la bonne œuvre', patchs.at(-1).id === uuid(2) && Object.keys(patchs.at(-1)).sort().join() === 'drive_url,id');
  verifier('La carte est désormais reliée (3 liens)', (await page.locator('.caradryel-oeuvre-ouvrir').count()) === 3);
  await page.close();
}

// ======================= D. Liste vide → initialiser =======================
console.log('— D. Liste vide → poser les quatre œuvres —');
{
  let pose = false;
  const { page, appels } = await ouvrir({ routeur: (m, corps) => {
    if (m === 'POST' && corps && corps.action === 'initialiser') { pose = true; }
    return [200, { ok: true, data: { oeuvres: pose ? OEUVRES() : [] } }];
  } });
  await page.goto(`${BASE}/caradryel.html`, { waitUntil: 'load' });
  await page.waitForSelector('#caradryel-vide:not([hidden])', { timeout: 15000 });
  verifier('État vide : 0 carte, bouton présent', (await nbCartes(page)) === 0 && (await page.locator('#caradryel-initialiser').isVisible()));
  await page.click('#caradryel-initialiser');
  await page.waitForSelector('#caradryel-porte:not([hidden])');
  verifier('POST {action:"initialiser"} envoyé', appels.some((a) => a.methode === 'POST' && a.corps.action === 'initialiser'));
  verifier('Quatre cartes après initialisation', (await nbCartes(page)) === 4);
  await page.close();
}

// ======================= E. 503 et 401 =======================
console.log('— E. Migration absente (503) et session refusée (401) —');
for (const [statut, etat] of [[503, '#caradryel-non-installe'], [401, '#caradryel-auth']]) {
  const { page, erreurs } = await ouvrir({ routeur: () => [statut, { ok: false, error: 'x' }] });
  await page.goto(`${BASE}/caradryel.html`, { waitUntil: 'load' });
  await page.waitForSelector(`${etat}:not([hidden])`, { timeout: 15000 });
  verifier(`${statut} : état dédié visible, 0 œuvre`, (await nbCartes(page)) === 0
    && (await page.locator('#caradryel-porte').evaluate((e) => e.hidden)));
  verifier(`${statut} : zéro erreur de page`, erreurs.length === 0, erreurs.join(' | '));
  await page.close();
}

// ======================= F. Téléphone =======================
console.log('— F. Téléphone 390 px —');
{
  const { page } = await ouvrir({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/caradryel.html`, { waitUntil: 'load' });
  await page.waitForSelector('#caradryel-porte:not([hidden])', { timeout: 15000 });
  const bords = await page.locator('.caradryel-oeuvre').evaluateAll((els) => els.map((e) => {
    const b = e.getBoundingClientRect(); return [b.left, b.right];
  }));
  // Marge ≥ 8 px : une carte collée au bord se lit mal et se touche mal (sabotage « rayon » du 22/11).
  verifier('Quatre cartes, dans l’écran avec une marge', bords.length === 4 && bords.every(([g, d]) => g >= 8 && d <= 382),
    JSON.stringify(bords));
  await page.close();
}

await navigateur.close();
if (echecs) { console.log(`=== ${echecs} VERDICT(S) EN ÉCHEC ===`); process.exit(1); }
console.log('=== CARADRYEL : tous les verdicts sont verts ===');
