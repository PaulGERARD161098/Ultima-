// Diffusion Léo sur les 4 quadrants : antichambres racine + console.
// Prouve :
//   A. console : les 4 portes sont des liens actifs (badges conservés) ;
//   B. registre.html SANS session (config vide) : FAIL-CLOSED — aucune idée
//      dans le DOM, cartouche « Authentification requise », lien vers riven,
//      pas de cartouche Léo, zéro fuite réseau ;
//   C. registre.html avec FAUSSE session : le code appelle bien /api/idees
//      avec le Bearer de la session, et un 401 retombe en fail-closed propre
//      (cartouche auth, aucune donnée, zéro appel Supabase direct) ;
//   D. registre.html avec fausse session + API stubée 200 (fixture neutre) :
//      registre rendu (compteurs, idées, ponts) + cartouche Léo réflexif
//      (archipel, volet stratégique, propositions déterministes cliquables) ;
//   E. bcp.html (NICOL BOLAS) : cartouche Léo « majordome de chantier » (§1-2,
//      encore présent) + shell « premier outil ouvert » annonçant le simulateur
//      ABAQUE (§3, badge + lien abaque.html + retour console ≥ 44 px). Incohérence
//      cartouche/shell pré-existante (#75), flaggée sur place.
//      (IMLADRIK n'est plus une antichambre : quadrant bâti — voir smoke-imladrik.)
//   partout : zéro requête externe, zéro erreur console, contrastes AA.
// NOTE : le flux ADRAMELECH avec session RÉELLE n'est pas prouvable en
// harnais (auth vivante) — C/D valident le motif Bearer et le fail-closed.
import { chromium } from 'playwright';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';
import { mkdirSync } from 'node:fs';

// LV5 / P3 — les quadrants sont au ciel : la lecture des caps passe par le
// module partagé, et les `href` n'existent plus (l'étoile n'est pas une ancre).
const { attendrePret, lireCaps, lireRepli } = await import('./_caps.mjs');

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

// Fausse session Supabase posée en localStorage (clé sb-<ref>-auth-token) :
// jeton factice, expiration lointaine (aucun refresh réseau déclenché).
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

// Fixture NEUTRE (aucune idée réelle de Paul — noms inventés pour le harnais).
const FIXTURE = {
  ok: true,
  data: {
    idees: [
      { id: 'i1', adr_num: 1, nom: 'LANTERNE', type: 'essai', theme: 'outillage · lumière', statut: 'à raffiner', epigraphe: 'Une lampe pour les brumes.', updated_at: '2026-07-01T10:00:00Z' },
      { id: 'i2', adr_num: 2, nom: 'CABESTAN', type: 'essai', theme: 'mécanique', statut: 'exploitable', epigraphe: 'Hisser sans se rompre.', updated_at: '2026-07-10T10:00:00Z' },
      { id: 'i3', adr_num: 3, nom: 'SEXTANT', type: 'essai', theme: null, statut: 'brute', epigraphe: null, updated_at: '2026-07-12T10:00:00Z' },
      { id: 'i4', adr_num: 4, nom: 'AMPHORE', type: 'essai', theme: 'réserve', statut: 'close', epigraphe: null, updated_at: '2026-07-14T10:00:00Z' },
    ],
    liens: [{ id: 'l1', source_id: 'i1', target_id: 'i2' }],
  },
};

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// Prépare une page : traque erreurs console + requêtes hors serveur local.
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

// ============ A. OMEGA : ses 3 caps, puis les 5 portes historiques ============
// 2026-09-29 : les macro-quadrants GRIMA et NAGA sont SUPPRIMÉS. OMEGA (ex-
// ULTIMA) ouvre directement RIVEN, NICOL BOLAS et IMLADRIK ; IMLADRIK porte
// ADRAMELECH et TAO. Les cinq portes historiques (riven, bcp, imladrik,
// adramelech, tao) restent toutes atteignables, réparties sur DEUX boussoles.
console.log('— A. OMEGA : 3 caps, puis les 5 portes via OMEGA / IMLADRIK —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
  // OMEGA (ex-ULTIMA) EST AU CIEL (étape ④a, coque pilote). Les assertions de cette
  // section sont PORTÉES, pas affaiblies : les étoiles du ciel portent de
  // VRAIES ancres, si bien qu'on continue de lire des `href`. Seul l'ORDRE est
  // abandonné, avec sa raison — une constellation range par géométrie, et
  // l'ordre du DOM y suit la profondeur, pas le registre. La garantie qui
  // comptait (les portes du registre, toutes et rien qu'elles) est intacte.
  await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
  // Les étoiles ne sont pas des ancres : l'ancre SVG a été essayée puis retirée
  // parce qu'elle faisait perdre le focus clavier (mesuré). On éprouve donc les
  // portes en CLIQUANT — une preuve plus forte qu'un attribut lu.
  // ---- REPRISE le 2026-08-28 : L'ISOLEMENT ----
  // Le clic sur un cadran n'ouvre plus sa page — il ISOLE sa descendance sur
  // place (Paul : « ça m'affiche uniquement cette constellation »). La liste
  // qu'on remplissait en cliquant se remplit donc en OUVRANT les portes par
  // leur adresse : c'est exactement ce que fait un lecteur sans JavaScript
  // depuis le repli <noscript>, et c'est la seule preuve de porte qui garde un
  // sens maintenant. Ce que le clic fait, lui, est éprouvé juste en dessous —
  // et en détail par `smoke-lv4-coque` §D.
  const hrefs = [];
  for (const c of capsDe('omega')) {
    await page.goto(`${BASE}/${c.cible}`, { waitUntil: 'load', timeout: 20000 });
    if (page.url().endsWith(c.cible)) { hrefs.push(c.cible); }
  }
  // Et le geste, mesuré là où il se produit : chaque cadran montre sa
  // descendance sans quitter l'accueil de la supra-division.
  const tetesOmega = capsDe('omega').filter((c) => (c.enfants || []).length > 0);
  verifier('OMEGA : NICOL BOLAS et IMLADRIK sont les deux têtes (RIVEN est une feuille)',
    tetesOmega.map((c) => c.id).join(',') === 'nicol-bolas,imladrik');
  for (const c of tetesOmega) {
    await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
    await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${c.id}"]`)
      .dispatchEvent('click');
    await page.waitForTimeout(1400);
    const peints = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
      (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
    verifier(`Clic ${c.nom} : isolement sur place, sans changer de page`,
      (NOEUDS[c.id].enfants || []).every((id) => peints.includes(id))
      && !peints.includes(c.id) && page.url().endsWith(`omega.html#${c.id}`),
      `${page.url()} — ${JSON.stringify(peints)}`);
  }
  // La FEUILLE (RIVEN) ne s'isole pas : son clic ouvre sa page.
  await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="riven"]').dispatchEvent('click');
  await page.waitForURL('**/riven.html', { timeout: 8000 }).catch(() => {});
  verifier('Clic RIVEN (feuille) : ouvre riven.html, sans isolement', page.url().endsWith('riven.html'), page.url());
  await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
  // ALTHEA rejoint GRIMA et NAGA le 2026-08-06, puis REMONTE À LA RACINE le
  // 2026-08-07 (« je veux althea ici »). On compare au REGISTRE plutôt qu'à un
  // nombre écrit en dur : un test qui compte à la main se refait à chaque
  // dictée de Paul — et la boucle ci-dessous, elle, était encore écrite à la
  // main sous un commentaire qui disait le contraire. Elle est tombée.
  const portesAttendues = capsDe('omega').map((c) => c.cible);
  verifier('les portes du registre s’ouvrent toutes',
    JSON.stringify(hrefs.slice().sort()) === JSON.stringify(portesAttendues.slice().sort()),
    JSON.stringify(hrefs));
  for (const attendu of portesAttendues) {
    verifier(`Porte ${attendu}`, hrefs.includes(attendu));
  }
  // Le repli <noscript> doit lister TOUS les caps du registre. ALTHEA y avait
  // été oublié à son arrivée : sans JS, il était inatteignable. On compare donc
  // à la source de vérité, pas à une liste écrite à la main.
  const noscript = await page.evaluate(() => {
    const n = document.querySelector('#ciel-noeud-plateau noscript') || document.querySelector('noscript');
    if (!n) return [];
    const d = document.createElement('div');
    d.innerHTML = n.textContent;
    return [...d.querySelectorAll('a')].map((a) => a.getAttribute('href'));
  });
  verifier('Repli <noscript> : tous les caps du registre y sont',
    portesAttendues.every((c) => noscript.includes(c)),
    `noscript: ${JSON.stringify(noscript)}`);
  // PORTÉE : « aucun cap inerte » se lisait sur `.cap--avenir` ; au ciel, c'est
  // `aria-disabled` que porte une étoile sans cible. Même garantie, même preuve
  // par l'absence.
  verifier('Aucun cap inerte restant',
    (await page.locator('#ciel-noeud-scene .ciel-etoile[aria-disabled]').count()) === 0);
  // Le focus clavier tient sur l'étoile — c'est ce qui a fait renoncer à
  // l'ancre SVG, donc c'est ce qu'on surveille désormais ici.
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id]').first().focus();
  verifier('Une étoile garde le focus clavier',
    await page.evaluate(() => document.activeElement
      && document.activeElement.hasAttribute
      && document.activeElement.hasAttribute('data-noeud-id')));

  const portes = {};
  for (const cadran of ['omega.html', 'imladrik.html']) {
    await page.goto(`${BASE}/${cadran}`, { waitUntil: 'load', timeout: 20000 });
    await attendrePret(page);
    // LES PORTES SE LISENT DANS LE REPLI <noscript>, et c'est le seul endroit où
    // elles VIVENT désormais : l'étoile est un `<g role="button">`, pas une
    // ancre (LV4 ④a — enveloppée, elle perdait le focus clavier). Ce repli
    // compte donc davantage qu'au temps de la boussole, pas moins : le jour où
    // le JavaScript manque, cette liste EST la navigation.
    portes[cadran] = await lireRepli(page);
    if (cadran === 'imladrik.html') {
      verifier('Retour « ↞ OMEGA » depuis imladrik.html',
        (await page.locator('.console-retour a[href="omega.html"]').count()) === 1);
    }
    await page.screenshot({ path: `${CAPTURES}/${cadran.replace('.html', '')}-portes.png`, fullPage: true });
  }
  const toutes = [...portes['omega.html'], ...portes['imladrik.html']];
  for (const attendu of ['riven.html', 'bcp.html', 'adramelech.html', 'imladrik.html', 'tao.html']) {
    verifier(`Porte ${attendu} (via OMEGA ou IMLADRIK)`, toutes.includes(attendu), JSON.stringify(toutes));
  }
  verifier('OMEGA porte le personnel (RIVEN + NICOL BOLAS + IMLADRIK)',
    JSON.stringify(portes['omega.html']) === JSON.stringify(['riven.html', 'bcp.html', 'imladrik.html']),
    JSON.stringify(portes['omega.html']));
  verifier('IMLADRIK porte ses cinq caps (dont ADRAMELECH + TAO)',
    JSON.stringify(portes['imladrik.html']) === JSON.stringify(
      ['maedrethnir.html', 'vranesh.html', 'draukhain.html', 'adramelech.html', 'tao.html']),
    JSON.stringify(portes['imladrik.html']));
  // Éprouvé par l'ABSENCE : aucun repli ne mène plus à une page supprimée.
  verifier('Aucune porte vers grima.html / naga.html / ultima.html',
    toutes.length > 0 && !toutes.some((h) => /^(grima|naga|ultima)\.html/.test(h)), JSON.stringify(toutes));
  verifier('Zéro requête externe (OMEGA + IMLADRIK)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (OMEGA + IMLADRIK)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== B. ADRAMELECH sans session : fail-closed =====================
console.log('— B. registre.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/registre.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#adr-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#adr-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien vers RIVEN (flux lien-magique)',
    (await page.locator('#adr-auth a[href="riven.html"]').count()) === 1);
  verifier('Registre caché', await page.locator('#adr-registre').evaluate((el) => el.hidden));
  verifier('Aucune idée dans le DOM', (await page.locator('.adr-idee').count()) === 0 &&
    (await page.locator('#adr-idees').evaluate((el) => el.childNodes.length)) === 0);
  verifier('Pas de cartouche Léo sans données', (await page.locator('#leo-cartouche').count()) === 0);
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#adr-chargement').evaluate((el) => el.hidden));

  // Contrastes AA sur l'écran réellement rendu.
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#adr-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#adr-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  const rTitre = ratio(versHex(c.titre), c.parchemin);
  verifier('Contraste titre auth ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
  const rTexte = ratio(versHex(c.texte), c.parchemin);
  verifier('Contraste texte auth ≥ 4,5:1', rTexte >= 4.5, `${rTexte.toFixed(2)}:1`);
  const rMission = ratio(versHex(c.mission), c.merProfonde);
  verifier('Contraste mission sur mer ≥ 4,5:1', rMission >= 4.5, `${rMission.toFixed(2)}:1`);

  // Tap target du lien de connexion.
  const hLien = await page.locator('#adr-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/adramelech-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== C. ADRAMELECH fausse session : Bearer + 401 fail-closed =====================
console.log('— C. registre.html fausse session → /api/idees Bearer, 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  const appelsSupabase = [];
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) => {
    appelsSupabase.push(route.request().url());
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  const appelsApi = [];
  await page.route('**/api/idees', (route) => {
    appelsApi.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/registre.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#adr-auth:not([hidden])', { timeout: 20000 });

  verifier('Un appel /api/idees (et un seul)', appelsApi.length === 1, `${appelsApi.length}`);
  const autorisation = (appelsApi[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#adr-auth').textContent()) || ''));
  verifier('401 → aucune donnée rendue', (await page.locator('.adr-idee').count()) === 0);
  verifier('401 → pas de cartouche Léo', (await page.locator('#leo-cartouche').count()) === 0);
  verifier('Aucun appel direct Supabase (getSession local)', appelsSupabase.length === 0,
    appelsSupabase.slice(0, 3).join(', '));
  // Le navigateur journalise lui-même le 401 réseau (« Failed to load
  // resource ») : c'est le comportement testé, pas une erreur de l'app.
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/adramelech-fausse-session-401.png`, fullPage: true });
  await page.close();
}

// ===================== D. ADRAMELECH fixture 200 : registre + Léo réflexif =====================
console.log('— D. registre.html fixture 200 → registre + cartouche Léo réflexif —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/idees', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(FIXTURE),
  }));
  await page.goto(`${BASE}/registre.html`, { waitUntil: 'load', timeout: 20000 });

  // 1. Cartouche Léo réflexif à l'entrée.
  await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
  verifier('Cartouche Léo (dialog accessible)', await page.locator('#leo-cartouche').evaluate((el) =>
    el.getAttribute('role') === 'dialog' && el.getAttribute('aria-modal') === 'true'));
  verifier('Blason muet présent', (await page.locator('.leo-blason[aria-hidden="true"]').count()) === 1);
  const salutation = (await page.locator('.leo-salutation').textContent()) || '';
  verifier('Salutation réflexive (archipel)', /l'état de l'archipel/.test(salutation), `lue: ${salutation}`);
  const lignes = (await page.locator('.leo-travail').allTextContents()).map((t) => t.trim());
  verifier('Bilan : « L\'archipel compte 4 idées (1 à raffiner, 1 exploitable). »',
    lignes.some((l) => l === "L'archipel compte 4 idées (1 à raffiner, 1 exploitable)."), JSON.stringify(lignes));
  verifier('Travaux : volet stratégique (top 3, ligne statique)',
    lignes.some((l) => /MYCÉLIUM, INTENDANT, PROTÉE/.test(l)));
  const propositions = (await page.locator('.leo-proposition').allTextContents()).map((t) => t.trim());
  verifier('Proposition n°1 = raffiner la plus ancienne « à raffiner »',
    /^Raffiner « LANTERNE » \(à raffiner depuis le 01\/07\/2026\)\.$/.test(propositions[0] || ''),
    `lue: ${propositions[0]}`);
  verifier('Proposition capture (dictée en session)',
    propositions.some((p) => /Capturer une idée neuve — dictez-la à Léo en session\./.test(p)));
  verifier('Focus initial sur « C\'est parti »', await page.evaluate(() =>
    document.activeElement && document.activeElement.id === 'leo-partir'));

  await page.screenshot({ path: `${CAPTURES}/adramelech-leo-reflexif.png`, fullPage: true });

  // 2. La proposition mène à l'idée visée dans le registre.
  await page.locator('.leo-proposition').first().click();
  verifier('Clic proposition → cartouche fermé', (await page.locator('#leo-cartouche').count()) === 0);
  verifier('Clic proposition → focus sur l\'idée LANTERNE', await page.evaluate(() =>
    document.activeElement && document.activeElement.id === 'adr-idee-1'));
  verifier('Marqueur de session PAR quadrant posé', await page.evaluate(() =>
    window.sessionStorage.getItem('ultima-leo-accueil-vu-adramelech') === '1'));

  // 3. Le registre rendu depuis l'API (jamais du HTML).
  verifier('Registre visible', await page.locator('#adr-registre').evaluate((el) => !el.hidden));
  const compteurs = (await page.locator('.adr-compteur').allTextContents()).map((t) => t.replace(/\s+/g, ' ').trim());
  verifier('Compteur total : 4 idées', compteurs.some((c) => /^4\s?idées$/.test(c)), JSON.stringify(compteurs));
  verifier('Compteurs par statut (1 à raffiner, 1 exploitable)',
    compteurs.some((c) => /^1\s?À raffiner$/i.test(c)) && compteurs.some((c) => /^1\s?Exploitables$/i.test(c)));
  verifier('4 idées listées', (await page.locator('.adr-idee').count()) === 4);
  const idee1 = (await page.locator('#adr-idee-1').textContent()) || '';
  verifier('Idée : numéro + nom + statut + épigraphe', /ADR-001/.test(idee1) && /LANTERNE/.test(idee1) &&
    /à raffiner/.test(idee1) && /Une lampe pour les brumes\./.test(idee1));
  verifier('Thème rendu', /outillage · lumière/.test(idee1));
  const ponts = (await page.locator('.adr-pont').allTextContents()).map((t) => t.trim());
  verifier('Pont rendu (LANTERNE ↔ CABESTAN)', ponts.length === 1 && ponts[0] === 'LANTERNE ↔ CABESTAN',
    JSON.stringify(ponts));

  // 4. Contraste AA sur le registre.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      parcheminOmbre: cs.getPropertyValue('--parchemin-ombre').trim(),
      nom: getComputedStyle(document.querySelector('.adr-idee-nom')).color,
      libelle: getComputedStyle(document.querySelector('.adr-compteur-libelle')).color,
      epigraphe: getComputedStyle(document.querySelector('.adr-idee-epigraphe')).color,
    };
  });
  for (const [nom, couleur, fond] of [
    ['nom d\'idée', cr.nom, cr.parcheminCarte],
    ['libellé de compteur', cr.libelle, cr.parcheminOmbre],
    ['épigraphe', cr.epigraphe, cr.parcheminCarte],
  ]) {
    const r = ratio(versHex(couleur), fond);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  // 5. Pureté du bilan (exposé pour le harnais).
  const bilanVide = await page.evaluate(() => window.UltimaAdramelech.calculerBilan([]));
  verifier('calculerBilan pur : vide → 0 idée, pas de cible',
    bilanVide.total === 0 && bilanVide.aRaffiner === null);

  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/adramelech-fixture-registre.png`, fullPage: true });
  await page.close();
}

// ============ E. Les deux quadrants devenus BOUSSOLES (Lv3, L4) ============
// bcp.html et adramelech.html ne sont plus des antichambres en colonne : ce sont
// des coques de boussole rendues par le noyau. Le cartouche Léo « majordome de
// chantier » disparaît avec elles — Léo parle désormais cap par cap dans le
// cartouche de la boussole. Vérifié pour chacune : bandeau conforme au REGISTRE,
// caps dans l'ordre, portes ouvertes, cœur + légende, retour vers leur parent,
// parole au survol, zéro requête réseau, zéro erreur console.
for (const noeud of [
  { id: 'nicol-bolas', fichier: 'bcp.html', ouvertes: ['abaque.html'], avenir: 3, retour: 'omega.html' },
  { id: 'adramelech', fichier: 'adramelech.html', ouvertes: ['registre.html', 'idees.html'], avenir: 1, retour: 'imladrik.html' },
]) {
  console.log(`— ${NOEUDS[noeud.id].nom} en boussole (${noeud.fichier}) —`);
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  const appelsApi = [];
  await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });
  await page.goto(`${BASE}/${noeud.fichier}`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);

  // Le bandeau suit le registre (anti-dérive de la coque).
  const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
  const titre = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
  verifier('Surligne = celle du registre', surligne === NOEUDS[noeud.id].surligne, `lu: ${surligne}`);
  verifier('Titre = celui du registre', titre === NOEUDS[noeud.id].titre, `lu: ${titre}`);

  // Les caps, dans l'ordre du registre.
  const attendus = capsDe(noeud.id).map((c) => c.nom);
  const caps = await lireCaps(page);
  const noms = caps.map((c) => c.nom);
  // ORDRE ABANDONNÉ (LV5 / P3), raison déjà écrite en LV4 ④a : une constellation
  // range par GÉOMÉTRIE, pas par liste. Le contrôle utile — tous les caps du
  // registre, aucun de plus — est conservé entier.
  verifier('Les caps du registre sont tous là (ordre abandonné : la géométrie range)',
    JSON.stringify([...noms].sort()) === JSON.stringify([...attendus].sort()),
    `lu: ${JSON.stringify(noms)}`);

  // Les portes : lues dans le repli, faute d'ancres (voir plus haut).
  const cibles = await lireRepli(page);
  for (const cible of noeud.ouvertes) {
    verifier(`Porte ouverte vers ${cible}`, cibles.includes(cible), JSON.stringify(cibles));
  }
  verifier(`${noeud.avenir} cap(s) « à venir »`,
    caps.filter((c) => c.avenir).length === noeud.avenir);

  // Cœur + légende. Le cœur descend en SCEAU dans l'angle : au centre, un
  // médaillon clair lisait comme un disque plus gros que les étoiles, et le
  // centre est précisément là où le cadrage serré ramène les étoiles.
  verifier('Cœur gravé (en sceau dans l\'angle)',
    (await page.locator('.ciel-filigrane svg').count()) === 1);
  const legende = (await page.locator('.ciel-legende').textContent())?.trim();
  verifier('Légende gravée = celle du registre', legende === NOEUDS[noeud.id].legende, `lu: ${legende}`);
  // « Autant d'aiguilles que de caps » ABANDONNÉE : un ciel n'a pas de moyeu
  // d'où les faire partir. Remplacée par le contrôle qu'elle approchait.
  verifier('Autant d\'étoiles que de caps (ce que les aiguilles approchaient)',
    (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === attendus.length);

  // Retour vers le macro-quadrant parent (pièce ① du patron, arbre 2026-08-01).
  verifier(`Retour vers ${noeud.retour}`,
    (await page.locator(`.console-retour a[href="${noeud.retour}"]`).count()) === 1);

  // Léo parle au survol du premier cap.
  // Le survol d'un cap fait parler Léo. « LE PREMIER » n'a plus de sens quand
  // l'ordre est celui de la géométrie : on survole une étoile NOMMÉE et on
  // vérifie que c'est bien d'elle que Léo parle.
  const premier = caps[0];
  await page.locator(`g.ciel-etoile[data-noeud-id="${premier.id}"]`).dispatchEvent('mouseenter');
  await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
  const paroleNom = (await page.locator('.parole-nom').textContent())?.trim();
  verifier('Parole de Léo au survol d\'un cap', paroleNom === premier.nom,
    `survolé: ${premier.nom} / lu: ${paroleNom}`);

  // Plus de cartouche « majordome de chantier » : la forme unique l'a remplacé.
  verifier('Plus de cartouche d\'antichambre', (await page.locator('#leo-cartouche').count()) === 0);

  // Une coque ne porte aucune donnée.
  verifier('Aucun appel /api (coque muette)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/${noeud.id}-boussole.png`, fullPage: true });
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE QUADRANTS VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
