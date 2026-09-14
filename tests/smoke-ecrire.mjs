// LA CAPTURE (ecrire.html, boucle ② MAEDRETHNIR, 2026-08-01) — au POUCE.
// Diagnostic de la boucle ① : le journal est vide parce que le cap n'est pas
// atteignable au moment où l'envie d'écrire arrive — elle surgit en marchant,
// au pouce et à la voix. Cette page est la réponse ; ce harnais vérifie les
// CRITÈRES DE RÉUSSITE annoncés au cadrage 6 points, pas des intentions :
//   A. sans session : fail-closed, rien du journal au DOM, zéro fuite réseau ;
//   B. avec session (375×700, le seul écran qui compte) : le champ est prêt et
//      FOCALISÉ sans autre geste, l'envoi part en UN appui avec le Bearer, sans
//      titre, le champ se vide et reprend le focus ; cibles ≥ 44 px ; le champ
//      fait ≥ 16 px (en dessous, iOS zoome à la mise au point) ;
//   C. la promesse du brouillon : le texte est écrit EN LOCAL AVANT l'appel
//      réseau, il survit à une panne, à une session expirée et à un
//      rechargement, et il repart tout seul au retour du réseau ;
//   D. la retenue : rien d'autre que le champ à l'écran.
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
      access_token: 'jeton-de-test', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'jeton-refresh',
      user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
    }));
  } catch (e) {}`;
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// 375×700 : le téléphone. C'est là que la boucle ② se joue, pas au bureau.
async function nouvellePage(options = {}) {
  const page = await navigateur.newPage({
    viewport: options.viewport || { width: 375, height: 700 },
    hasTouch: true,
  });
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
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
      });
    });
  }
  return { page, erreurs, externes };
}

// ===================== A. SANS session : fail-closed =====================
console.log('— A. ecrire.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/ecrire.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ecrire-auth:not([hidden])', { timeout: 20000 });

  verifier('Cartouche de reconnexion affiché',
    /session s’est refermée/.test((await page.locator('#ecrire-auth').textContent()) || ''));
  verifier('Le champ d’écriture est caché',
    await page.locator('#ecrire-form').evaluate((el) => el.hidden));
  verifier('Chargement effacé', await page.locator('#ecrire-chargement').evaluate((el) => el.hidden));
  verifier('Lien de reconnexion présent', (await page.locator('#ecrire-auth a').count()) === 1);
  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ B. Avec session : deux gestes du pouce ============
console.log('— B. ecrire.html avec session → le champ prêt, l’envoi en un appui —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const posts = [];
  await page.route('**/api/imladrik/entrees', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { posts.push({ headers: req.headers(), body: req.postData() }); }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'p1' } }),
    });
  });

  await page.goto(`${BASE}/ecrire.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ecrire-form:not([hidden])', { timeout: 20000 });

  // ---- Le critère central : arriver ici suffit pour pouvoir parler. ----
  const focalise = await page.evaluate(() =>
    document.activeElement === document.getElementById('ecrire-contenu'));
  verifier('Le champ est FOCALISÉ sans autre geste (critère ④ du cadrage)', focalise);

  // ---- La retenue : rien d'autre à l'écran. ----
  verifier('Aucun champ de titre (décision de Paul)',
    (await page.locator('input[type="text"]').count()) === 0);
  verifier('Un seul bouton d’envoi', (await page.locator('#ecrire-envoyer').count()) === 1);
  const champsVisibles = await page.locator('#ecrire-form textarea, #ecrire-form input').count();
  verifier('Un seul champ à remplir', champsVisibles === 1, `${champsVisibles}`);

  // ---- Le pouce : les cibles, et le zoom iOS. ----
  const bouton = await page.locator('#ecrire-envoyer').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { h: r.height, l: r.width };
  });
  verifier('Bouton d’envoi ≥ 44 px de haut', bouton.h >= 44, `${bouton.h}px`);
  verifier('Bouton d’envoi pleine largeur (sous le pouce)', bouton.l > 300, `${bouton.l}px`);
  const tailleTexte = await page.locator('#ecrire-contenu').evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize));
  verifier('Champ ≥ 16 px (sinon iOS zoome à la mise au point)', tailleTexte >= 16, `${tailleTexte}px`);
  const hChamp = await page.locator('#ecrire-contenu').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Le champ occupe la hauteur utile', hChamp >= 250, `${hChamp}px`);
  verifier('Aucun défilement horizontal',
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  // ---- L'envoi en un appui. ----
  await page.locator('#ecrire-contenu').fill('une petite victoire, en marchant');
  await page.locator('#ecrire-envoyer').click();
  await page.waitForFunction(() => /Déposé/.test(
    document.getElementById('ecrire-message').textContent || ''), null, { timeout: 5000 });

  verifier('Un POST /api/imladrik/entrees émis', posts.length === 1, `${posts.length}`);
  const corps = JSON.parse((posts[0] || {}).body || '{}');
  verifier('Corps : le contenu seul, AUCUN titre',
    corps.contenu === 'une petite victoire, en marchant' && !('titre' in corps),
    JSON.stringify(corps));
  verifier('Bearer de la session transmis',
    ((posts[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');
  verifier('Le champ se vide après dépôt',
    (await page.locator('#ecrire-contenu').inputValue()) === '');
  verifier('Le champ reprend le focus (on peut enchaîner)',
    await page.evaluate(() => document.activeElement === document.getElementById('ecrire-contenu')));
  verifier('Le brouillon est effacé une fois déposé',
    await page.evaluate(() => !window.localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON)));

  // ---- Rien à déposer : on ne part pas pour rien. ----
  await page.locator('#ecrire-envoyer').click();
  verifier('Champ vide : aucun appel supplémentaire', posts.length === 1, `${posts.length}`);
  verifier('Champ vide : on le dit sans drame',
    /Rien à déposer/.test((await page.locator('#ecrire-message').textContent()) || ''));

  // ---- Lisibilité. ----
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      champ: getComputedStyle(document.getElementById('ecrire-contenu')).color,
      bouton: getComputedStyle(document.getElementById('ecrire-envoyer')).color,
    };
  });
  verifier('Contraste du texte écrit ≥ 4,5:1', ratio(versHex(c.champ), c.parchemin) >= 4.5);
  verifier('Contraste du bouton ≥ 4,5:1', ratio(versHex(c.bouton), c.parchemin) >= 4.5);

  verifier('Zéro requête externe', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/ecrire-mobile.png`, fullPage: true });
  await page.close();
}

// ====== C. La promesse du brouillon : rien de ce qui est dicté ne se perd ======
// C'est la seule promesse qu'on doit à quelqu'un qui vient de dicter trois
// phrases en marchant. Elle se prouve en cassant le réseau, pas en l'affirmant.
console.log('— C. ecrire.html → le brouillon survit au réseau, à la session, au rechargement —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  // 1. Réseau coupé : l'envoi échoue, le texte reste.
  let coupe = true;
  const posts = [];
  await page.route('**/api/imladrik/entrees', (route) => {
    if (coupe) { return route.abort(); }
    posts.push(route.request().postData());
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'p1' } }),
    });
  });

  await page.goto(`${BASE}/ecrire.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ecrire-form:not([hidden])', { timeout: 20000 });
  await page.locator('#ecrire-contenu').fill('dicté sans réseau, en marchant');
  await page.locator('#ecrire-envoyer').click();
  await page.waitForFunction(() => /gardé ici/.test(
    document.getElementById('ecrire-message').textContent || ''), null, { timeout: 5000 });

  verifier('Hors réseau : le texte est GARDÉ, pas perdu',
    (await page.evaluate(() =>
      window.localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON))) === 'dicté sans réseau, en marchant');
  verifier('Hors réseau : le champ conserve le texte à l’écran',
    (await page.locator('#ecrire-contenu').inputValue()) === 'dicté sans réseau, en marchant');
  verifier('Hors réseau : le message rassure, il n’alarme pas',
    /repartira tout seul/.test((await page.locator('#ecrire-message').textContent()) || ''));
  verifier('Hors réseau : le bouton reste utilisable',
    (await page.locator('#ecrire-envoyer').isEnabled()) === true);

  // 2. Rechargement : le brouillon revient dans le champ.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#ecrire-form:not([hidden])', { timeout: 20000 });
  verifier('Après rechargement : le texte est retrouvé dans le champ',
    (await page.locator('#ecrire-contenu').inputValue()) === 'dicté sans réseau, en marchant');

  // 3. Le réseau revient : ce qui attendait repart tout seul.
  coupe = false;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.waitForFunction(() => !window.localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON),
    null, { timeout: 5000 });
  verifier('Retour du réseau : le brouillon est parti tout seul', posts.length >= 1, `${posts.length}`);
  const repris = JSON.parse(posts[0] || '{}');
  verifier('Retour du réseau : c’est bien le texte gardé qui part',
    repris.contenu === 'dicté sans réseau, en marchant', JSON.stringify(repris));

  const erreursApp = erreurs.filter((e) => !/Failed to (load|fetch)/i.test(e));
  verifier('Zéro erreur console applicative', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

// ====== D. Session expirée en déplacement : le texte est à l'abri d'abord ======
console.log('— D. ecrire.html → session expirée : le texte est gardé avant tout —');
{
  const { page } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/imladrik/entrees', (route) => route.fulfill({
    status: 401, contentType: 'application/json; charset=utf-8',
    body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
  }));

  await page.goto(`${BASE}/ecrire.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ecrire-form:not([hidden])', { timeout: 20000 });
  await page.locator('#ecrire-contenu').fill('une sensation, notée trop tard');
  await page.locator('#ecrire-envoyer').click();
  await page.waitForSelector('#ecrire-auth:not([hidden])', { timeout: 5000 });

  verifier('Session expirée : le texte est gardé en local',
    (await page.evaluate(() =>
      window.localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON))) === 'une sensation, notée trop tard');
  verifier('Session expirée : on propose la reconnexion',
    /session s’est refermée/.test((await page.locator('#ecrire-auth').textContent()) || ''));
  await page.close();
}

// ====== E. LA DICTÉE : elle doit PARLER quand elle échoue ======
// Défaut trouvé le 2026-08-01 par un test de Paul sur son iPhone : « un micro,
// mais rien ne se passe ». Cause : `signaler` vaut `function () {}` PAR DÉFAUT
// dans js/dictee.js — sans configuration, tout ce que la dictée a à dire est
// avalé. Et la ligne « Je vous écoute… » est écrite en `--accent-fonce`, un
// bleu sombre invisible sur la mer de cet écran.
// Deux défauts d'INTÉGRATION, pas du composant. Ce bloc les cloue.
console.log('— E. ecrire.html → la dictée parle, en écoute comme en échec —');
{
  const { page } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  // Une API de reconnaissance FACTICE, pilotable : aucun micro réel, aucun
  // réseau. On veut éprouver ce que l'écran DIT, pas ce que le système entend.
  await page.addInitScript(() => {
    function Faux() { this.lang = ''; this.continuous = false; this.interimResults = false; }
    Faux.prototype.start = function () {
      window.__recoVivante = this;
      if (this.onstart) { this.onstart(); }
    };
    Faux.prototype.stop = function () { if (this.onend) { this.onend(); } };
    Faux.prototype.abort = function () {};
    window.SpeechRecognition = Faux;
    window.webkitSpeechRecognition = Faux;
  });
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/imladrik/entrees', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8',
    body: JSON.stringify({ ok: true, data: { id: 'p1' } }),
  }));

  await page.goto(`${BASE}/ecrire.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ecrire-form:not([hidden])', { timeout: 20000 });

  verifier('Le micro est adjoint au champ quand le navigateur sait écouter',
    (await page.locator('.bouton-micro').count()) === 1);
  const hMicro = await page.locator('.bouton-micro').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { h: r.height, l: r.width };
  });
  verifier('Micro ≥ 44 px (cible tactile)', hMicro.h >= 44 && hMicro.l >= 44, JSON.stringify(hMicro));

  // ---- L'écoute doit SE VOIR. ----
  await page.locator('.bouton-micro').click();
  await page.waitForSelector('.etat-vocal:not([hidden])', { timeout: 5000 });
  verifier('En écoute : la page le dit',
    /écoute/.test((await page.locator('.etat-vocal').textContent()) || ''));
  const lisible = await page.evaluate(() => {
    const ligne = document.querySelector('.etat-vocal');
    const fond = getComputedStyle(document.body).backgroundColor;
    return { couleur: getComputedStyle(ligne).color, fond };
  });
  // La mer est très sombre : le texte d'état doit être CLAIR pour exister.
  const clarte = lisible.couleur.match(/\d+/g).slice(0, 3).map(Number)
    .reduce((a, b) => a + b, 0) / 3;
  verifier('En écoute : la ligne d’état est LISIBLE sur la mer (pas un bleu sombre)',
    clarte > 180, JSON.stringify(lisible));
  verifier('En écoute : le micro se marque enfoncé',
    (await page.locator('.bouton-micro').getAttribute('aria-pressed')) === 'true');

  // ---- L'échec doit PARLER. C'est le défaut trouvé par Paul. ----
  await page.evaluate(() => {
    window.__recoVivante.onerror({ error: 'no-speech' });
  });
  const dit = (await page.locator('#ecrire-message').textContent()) || '';
  verifier('Échec « rien entendu » : la page le DIT (défaut du 2026-08-01)',
    /rien entendu/i.test(dit), dit || '(muet)');
  verifier('Échec : le message est marqué comme tel',
    await page.locator('#ecrire-message').evaluate((el) =>
      el.classList.contains('ecrire-message--erreur')));

  // ---- Micro refusé : on dit quoi faire, on ne laisse pas dans le noir. ----
  await page.locator('.bouton-micro').click();
  await page.waitForSelector('.etat-vocal:not([hidden])', { timeout: 5000 });
  await page.evaluate(() => { window.__recoVivante.onerror({ error: 'not-allowed' }); });
  const refus = (await page.locator('#ecrire-message').textContent()) || '';
  verifier('Micro refusé : la page dit quoi faire',
    /Autorisez le micro|tapez votre texte/i.test(refus), refus || '(muet)');

  // ---- Ce qui est dicté arrive dans le champ ET dans le brouillon. ----
  await page.locator('.bouton-micro').click();
  await page.waitForSelector('.etat-vocal:not([hidden])', { timeout: 5000 });
  await page.evaluate(() => {
    const r = window.__recoVivante;
    r.onresult({ resultIndex: 0, results: [
      Object.assign([{ transcript: 'une petite victoire' }], { isFinal: true }),
    ] });
    r.stop();
  });
  verifier('Dicté : le texte arrive dans le champ',
    /une petite victoire/.test(await page.locator('#ecrire-contenu').inputValue()));
  verifier('Dicté : le brouillon suit (rien ne se perd si l’app est tuée)',
    /une petite victoire/.test(await page.evaluate(() =>
      window.localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON) || '')));

  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ECRIRE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
