// Diffusion Léo sur les 4 quadrants : antichambres racine + console.
// Prouve :
//   A. console : les 4 portes sont des liens actifs (badges conservés) ;
//   B. adramelech.html SANS session (config vide) : FAIL-CLOSED — aucune idée
//      dans le DOM, cartouche « Authentification requise », lien vers traveler,
//      pas de cartouche Léo, zéro fuite réseau ;
//   C. adramelech.html avec FAUSSE session : le code appelle bien /api/idees
//      avec le Bearer de la session, et un 401 retombe en fail-closed propre
//      (cartouche auth, aucune donnée, zéro appel Supabase direct) ;
//   D. adramelech.html avec fausse session + API stubée 200 (fixture neutre) :
//      registre rendu (compteurs, idées, ponts) + cartouche Léo réflexif
//      (archipel, volet stratégique, propositions déterministes cliquables) ;
//   E/F. bcp.html et imladrik.html : coquille honnête (bandeau, mission,
//      badge « en chantier ») + cartouche Léo « majordome de chantier »
//      (état + proposition unique), une fois par session PAR quadrant,
//      retour console ≥ 44 px ;
//   partout : zéro requête externe, zéro erreur console, contrastes AA.
// NOTE : le flux ADRAMELECH avec session RÉELLE n'est pas prouvable en
// harnais (auth vivante) — C/D valident le motif Bearer et le fail-closed.
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

// ===================== A. Console : 4 portes actives =====================
console.log('— A. Console : les 4 portes —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  // LV2 : « / » est la boussole ; la console à 4 quadrants vit sur /ultima.html.
  await page.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
  const hrefs = await page.locator('a.quadrant-actif').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href')));
  verifier('4 liens actifs sur la console', hrefs.length === 4, JSON.stringify(hrefs));
  for (const attendu of ['traveler.html', 'bcp.html', 'adramelech.html', 'imladrik.html']) {
    verifier(`Porte ${attendu}`, hrefs.includes(attendu));
  }
  verifier('Aucun quadrant inerte restant',
    (await page.locator('.quadrant[aria-disabled], .quadrant-avenir').count()) === 0);
  verifier('Zéro requête externe (console)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (console)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/console-4-portes.png`, fullPage: true });
  await page.close();
}

// ===================== B. ADRAMELECH sans session : fail-closed =====================
console.log('— B. adramelech.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/adramelech.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#adr-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#adr-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien vers RIVEN (flux lien-magique)',
    (await page.locator('#adr-auth a[href="traveler.html"]').count()) === 1);
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
console.log('— C. adramelech.html fausse session → /api/idees Bearer, 401 fail-closed —');
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
  await page.goto(`${BASE}/adramelech.html`, { waitUntil: 'load', timeout: 20000 });
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
console.log('— D. adramelech.html fixture 200 → registre + cartouche Léo réflexif —');
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
  await page.goto(`${BASE}/adramelech.html`, { waitUntil: 'load', timeout: 20000 });

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

// ===================== E/F. NICOL BOLAS et IMLADRIK : antichambres de chantier =====================
// La coquille (étape 3) est paramétrée par quadrant : IMLADRIK reste une
// antichambre vierge (« En chantier / pas encore bâti », retour unique) ; NICOL
// BOLAS a ouvert son premier outil ABAQUE (#75) — badge « Premier outil ouvert »,
// cartouche ABAQUE, et un second lien vers abaque.html. Le cartouche Léo (étapes
// 1-2) reste identique pour les deux (chantier encore à cadrer).
for (const quadrant of [
  { fichier: 'bcp.html', nom: 'NICOL BOLAS', cle: 'ultima-leo-accueil-vu-bcp',
    badge: 'Premier outil ouvert', cartoucheRe: /ABAQUE/, retours: 2 },
  { fichier: 'imladrik.html', nom: 'IMLADRIK', cle: 'ultima-leo-accueil-vu-imladrik',
    badge: 'En chantier', cartoucheRe: /pas encore bâti/, retours: 1 },
]) {
  console.log(`— ${quadrant.nom} : antichambre de chantier (${quadrant.fichier}) —`);
  const { page, erreurs, externes } = await nouvellePage();
  await page.goto(`${BASE}/${quadrant.fichier}`, { waitUntil: 'load', timeout: 20000 });

  // 1. Cartouche Léo « majordome de chantier ».
  await page.waitForSelector('#leo-cartouche', { timeout: 20000 });
  const salutation = (await page.locator('.leo-salutation').textContent()) || '';
  verifier('Salutation de chantier sincère',
    /pas encore bâti/.test(salutation) && /où en est le chantier/.test(salutation), `lue: ${salutation}`);
  const etatChantier = (await page.locator('.leo-travail').allTextContents()).join(' ');
  verifier('État : en attente du mini-cadrage', /mini-cadrage/.test(etatChantier), etatChantier);
  const propositions = (await page.locator('.leo-proposition').allTextContents()).map((t) => t.trim());
  verifier('Proposition unique : ouvrir le chantier', propositions.length === 1 &&
    /^Ouvrir le chantier : dictez le cadrage à Léo en session\.$/.test(propositions[0]), JSON.stringify(propositions));
  const hProposition = await page.locator('.leo-proposition').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target proposition ≥ 44 px', hProposition >= 44, `${hProposition}px`);
  await page.screenshot({ path: `${CAPTURES}/${quadrant.fichier.replace('.html', '')}-antichambre.png`, fullPage: true });

  // 2. Échap ferme ; marqueur PAR quadrant ; pas de réapparition.
  await page.keyboard.press('Escape');
  verifier('Échap ferme le cartouche', (await page.locator('#leo-cartouche').count()) === 0);
  verifier(`Marqueur de session « ${quadrant.cle} »`, await page.evaluate((cle) =>
    window.sessionStorage.getItem(cle) === '1', quadrant.cle));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(400);
  verifier('Pas de réapparition (même session)', (await page.locator('#leo-cartouche').count()) === 0);

  // 3. La coquille : bandeau, mission, badge, chantier, retour console.
  const titre = (await page.locator('h1.console-titre').textContent())?.trim();
  verifier(`Bandeau ${quadrant.nom}`, titre === quadrant.nom, `lu: ${titre}`);
  verifier('Blason du quadrant étiqueté', (await page.locator('.quadrant-bandeau .blason-svg[role="img"]').count()) === 1);
  const mission = (await page.locator('.quadrant-mission').textContent())?.trim();
  verifier('Ligne de mission présente (cadrage)', Boolean(mission) && mission.length > 20);
  const badge = (await page.locator('.quadrant-bandeau .quadrant-etat').textContent())?.trim();
  verifier(`Badge « ${quadrant.badge} »`, badge === quadrant.badge, `lu: ${badge}`);
  verifier('Cartouche honnête (état réel du quadrant)',
    quadrant.cartoucheRe.test((await page.locator('.cartouche-page').textContent()) || ''));
  // Retour vers la console (toujours présent) ; NICOL BOLAS porte en plus le lien
  // vers son premier outil (ABAQUE). Le retour console est le dernier lien.
  const retours = page.locator('a.retour-console');
  verifier('Nombre de liens retour attendu', (await retours.count()) === quadrant.retours,
    `${await retours.count()} vs ${quadrant.retours}`);
  const retourConsole = page.locator('a.retour-console[href="ultima.html"]');
  verifier('Retour console présent', (await retourConsole.count()) === 1);
  const hRetour = await retourConsole.evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target retour ≥ 44 px', hRetour >= 44, `${hRetour}px`);

  // 4. Contrastes AA (mission sur mer, texte sur parchemin).
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
      texte: getComputedStyle(document.querySelector('.cartouche-page p')).color,
    };
  });
  const rMission = ratio(versHex(c.mission), c.merProfonde);
  verifier('Contraste mission ≥ 4,5:1', rMission >= 4.5, `${rMission.toFixed(2)}:1`);
  const rTexte = ratio(versHex(c.texte), c.parchemin);
  verifier('Contraste cartouche ≥ 4,5:1', rTexte >= 4.5, `${rTexte.toFixed(2)}:1`);

  verifier('Zéro requête externe', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/${quadrant.fichier.replace('.html', '')}-coquille.png`, fullPage: true });
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE QUADRANTS VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
