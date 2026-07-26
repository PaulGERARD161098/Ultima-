// Quadrant VRANESH (v1) : la carte des futurs potentiels, anticiper ce qui PEUT
// advenir — DERRIÈRE AUTH. Miroir de smoke-draukhain.mjs (VRANESH ↔ DRAUKHAIN).
// Prouve :
//   A. vranesh.html SANS session (config vide) : FAIL-CLOSED — aucune situation au
//      DOM, cartouche « Authentification requise », registre caché, retour vers
//      imladrik.html, zéro fuite réseau, zéro erreur console ;
//   B. vranesh.html avec FAUSSE session + /api/situations STUBÉE 200 (fixture
//      NEUTRE inventée) : registre rendu, intitulé/contexte/compte affichés, badge
//      « à explorer » (0 scénario) formulé en INVITATION de Léo (aucun vocabulaire
//      anxiogène / de reproche), scénarios rattachés avec leur vraisemblance,
//      signaux + parade rendus quand présents, vue « mes situations anticipées »
//      n'affiche que les situations anticipées, Bearer transmis à l'API (GET + POST
//      situation + POST scénario + DELETE scénario), contrastes AA, zéro CDN ;
//   C. vranesh.html fausse session + 401 → fail-closed propre.
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

// Fixture NEUTRE — AUCUNE situation réelle de Paul (cas inventés pour le harnais).
// Couvre les 2 états : anticipée (≥ 1 scénario, vraisemblances variées, dont un
// scénario avec signaux + parade) et « à explorer » (0 scénario). a_explorer /
// nb_scenarios viennent de la vue situations_etat ; les scénarios se rattachent
// par situation_id.
const FIXTURE = {
  ok: true,
  data: {
    situations: [
      { id: 's1', intitule: 'TRAVERSÉE', contexte: 'un départ à préparer', nb_scenarios: 3, a_explorer: false, created_at: '2026-07-01T10:00:00Z' },
      { id: 's2', intitule: 'CARREFOUR', contexte: null, nb_scenarios: 0, a_explorer: true, created_at: '2026-07-02T10:00:00Z' },
    ],
    scenarios: [
      { id: 'sc1', situation_id: 's1', deroule: 'le vent tourne au nord et porte la voile', vraisemblance: 'forte', signaux: 'le ciel se dégage à l’aube', parade: 'garder deux jours d’avance' },
      { id: 'sc2', situation_id: 's1', deroule: 'la mer reste étale plus longtemps', vraisemblance: 'moyenne', signaux: null, parade: null },
      { id: 'sc3', situation_id: 's1', deroule: 'un grain passe puis se dissipe', vraisemblance: 'faible', signaux: null, parade: null },
    ],
    // Passerelles v2 (scenario_liens) — cibles NEUTRES inventées : 1 vers un
    // objectif (rapport 'menace'), 1 vers une page ; toutes deux sur sc1.
    liens: [
      { id: 'l1', owner_id: 'o', scenario_id: 'sc1', serment_id: 'serm1', entree_id: null, rapport: 'menace', created_at: '2026-07-03T10:00:00Z' },
      { id: 'l2', owner_id: 'o', scenario_id: 'sc1', serment_id: null, entree_id: 'ent1', rapport: null, created_at: '2026-07-03T11:00:00Z' },
    ],
  },
};

// Cibles NEUTRES pour résoudre les libellés des passerelles (aucune donnée réelle).
const FIXTURE_SERMENTS = {
  ok: true,
  data: {
    serments: [{ id: 'serm1', intitule: 'GARDER LE CAP' }],
    flammes: [],
    liens: [],
  },
};
const FIXTURE_IMLADRIK = {
  ok: true,
  data: {
    entrees: [{ id: 'ent1', titre: 'La question du départ', contenu: 'texte neutre', created_at: '2026-06-20T09:00:00Z' }],
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
console.log('— A. vranesh.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#vranesh-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien de connexion présent',
    (await page.locator('#vranesh-auth a.retour-console').count()) === 1);
  verifier('Registre caché', await page.locator('#vranesh-registre').evaluate((el) => el.hidden));
  verifier('Aucune situation dans le DOM', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#vranesh-chargement').evaluate((el) => el.hidden));
  verifier('Retour vers la cartographie IMLADRIK',
    (await page.locator('.retour a[href="imladrik.html"]').count()) === 1);

  // Contrastes AA sur l'écran réellement rendu.
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#vranesh-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#vranesh-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  verifier('Contraste titre auth ≥ 4,5:1', ratio(versHex(c.titre), c.parchemin) >= 4.5);
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Contraste mission sur mer ≥ 4,5:1', ratio(versHex(c.mission), c.merProfonde) >= 4.5);

  const hLien = await page.locator('#vranesh-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/vranesh-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== B. Fixture 200 : registre + à explorer + anticipées =====================
console.log('— B. vranesh.html fixture 200 → registre, à explorer, situations anticipées, Bearer —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const appelsGet = [];
  const postsSituation = [];
  const postsScenario = [];
  const deletesScenario = [];
  await page.route('**/api/situations**', (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      appelsGet.push(req.headers());
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(FIXTURE),
      });
    }
    if (req.method() === 'POST') { postsSituation.push(req.headers()); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'nouveau' } }),
    });
  });
  await page.route('**/api/scenarios**', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { postsScenario.push(req.headers()); }
    if (req.method() === 'DELETE') { deletesScenario.push(req.headers()); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'sc-cible' } }),
    });
  });
  // Cibles des passerelles (résolution des libellés + pickers).
  await page.route('**/api/serments**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));
  // Passerelles : POST (relier) + DELETE (détacher) → 200 vide, corps + Bearer captés.
  const postsLien = [];
  const deletesLien = [];
  await page.route('**/api/scenario-liens**', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { postsLien.push({ headers: req.headers(), body: req.postData() }); }
    if (req.method() === 'DELETE') { deletesLien.push({ headers: req.headers(), body: req.postData() }); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'lien-cible' } }),
    });
  });

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-registre:not([hidden])', { timeout: 20000 });

  // 1. Bearer transmis au GET.
  verifier('Un appel GET /api/situations au moins', appelsGet.length >= 1, `${appelsGet.length}`);
  const autorisation = (appelsGet[0] || {}).authorization || '';
  verifier('Bearer de la session transmis (GET)', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);

  // 2. Toute la carte : 2 situations rendues.
  verifier('2 situations rendues (toute la carte)', (await page.locator('.zekrom-ideal').count()) === 2);
  const noms = (await page.locator('.zekrom-ideal-intitule').allTextContents()).map((t) => t.trim());
  for (const attendu of ['TRAVERSÉE', 'CARREFOUR']) {
    verifier(`Situation ${attendu} présente`, noms.includes(attendu));
  }

  // 3. Contexte + compte de scénarios rendus (situation anticipée).
  const s1 = page.locator('#vranesh-situation-s1');
  verifier('Contexte rendu (TRAVERSÉE)', /un départ à préparer/.test((await s1.textContent()) || ''));
  verifier('Compte de scénarios affiché (TRAVERSÉE = 3 scénarios)',
    /3 scénarios/.test((await s1.locator('.zekrom-registre').first().textContent()) || ''));

  // 4. Scénarios rattachés + vraisemblances variées.
  verifier('TRAVERSÉE : 3 scénarios listés', (await s1.locator('.zekrom-direction').count()) === 3);
  verifier('Scénario rendu depuis l’API', /le vent tourne au nord/.test((await s1.textContent()) || ''));
  const vraisS1 = (await s1.locator('.zekrom-direction .zekrom-registre').allTextContents()).map((t) => t.trim());
  verifier('Vraisemblances variées (faible/moyenne/forte)',
    ['faible', 'moyenne', 'forte'].every((n) => vraisS1.includes(n)), JSON.stringify(vraisS1));
  verifier('Bouton « retirer » sur chaque scénario', (await s1.locator('.zekrom-direction > .zekrom-retro-detacher').count()) === 3);

  // 4b. Signaux + parade rendus quand présents (scénario sc1) et absents sinon.
  const sc1txt = (await s1.locator('.zekrom-direction').first().textContent()) || '';
  verifier('Signes avant-coureurs rendus (sc1)', /Signes avant-coureurs\s*:\s*le ciel se dégage/.test(sc1txt), sc1txt);
  verifier('Parade préparée rendue (sc1)', /Parade préparée\s*:\s*garder deux jours/.test(sc1txt), sc1txt);
  const sc2txt = (await s1.locator('.zekrom-direction').nth(1).textContent()) || '';
  verifier('Aucun label signaux/parade quand vides (sc2)',
    !/Signes avant-coureurs|Parade préparée/.test(sc2txt), sc2txt);

  // 5. « à explorer » : le cœur VRANESH, présenté en INVITATION positive.
  const s2 = page.locator('#vranesh-situation-s2');
  verifier('« à explorer » : un seul badge sur toute la carte (CARREFOUR 0 scénario)',
    (await page.locator('.zekrom-aorienter').count()) === 1);
  verifier('CARREFOUR porte le badge « à explorer »', (await s2.locator('.zekrom-aorienter').count()) === 1);
  const invite = (await s2.locator('.zekrom-invite').textContent()) || '';
  verifier('Invitation positive de Léo (« Imagine ses futurs »)', /Imagine ses futurs/.test(invite));
  verifier('Invitation NON culpabilisante (aucun terme de reproche)',
    !/(échec|défaut|manqu|oubli|reproche|abandon)/i.test(invite), invite);
  verifier('Invitation NON anxiogène (aucun terme anxiogène)',
    !/(peur|angoisse|anxi|danger|catastrophe|menace|inquiet|panique|rumin|redoute?r?|craindre|crainte)/i.test(invite), invite);
  verifier('CARREFOUR : aucun scénario listé', (await s2.locator('.zekrom-direction').count()) === 0);
  verifier('Formulaire d’ajout de scénario sur chaque situation',
    (await page.locator('.zekrom-direction-form').count()) === 2);
  verifier('Formulaire de scénario : sélecteur de vraisemblance',
    (await s2.locator('.zekrom-direction-form select[name="vraisemblance"]').count()) === 1);

  await page.screenshot({ path: `${CAPTURES}/vranesh-carte.png`, fullPage: true });

  // 6. Vue « mes situations anticipées » : uniquement les anticipées (a_explorer=false).
  await page.locator('#vranesh-vue-anticipees').click();
  await page.waitForTimeout(150);
  verifier('Situations anticipées : 1 situation anticipée', (await page.locator('.zekrom-ideal').count()) === 1);
  verifier('Situations anticipées : la situation « à explorer » est masquée',
    (await page.locator('#vranesh-situation-s2').count()) === 0);
  verifier('Situations anticipées : aucun badge « à explorer »', (await page.locator('.zekrom-aorienter').count()) === 0);
  verifier('Bascule anticipées : bouton pressé', (await page.locator('#vranesh-vue-anticipees').getAttribute('aria-pressed')) === 'true');

  // Retour à toutes les situations.
  await page.locator('#vranesh-vue-toutes').click();
  await page.waitForTimeout(150);
  verifier('Retour toute la carte : 2 situations', (await page.locator('.zekrom-ideal').count()) === 2);

  await page.screenshot({ path: `${CAPTURES}/vranesh-anticipees.png`, fullPage: true });

  // 7. Filtre PUR exposé pour le harnais.
  const filtre = await page.evaluate((fx) => {
    const s = fx.data.situations;
    return {
      toutes: window.UltimaVranesh.situationsVisibles(s, 'toutes').length,
      anticipees: window.UltimaVranesh.situationsVisibles(s, 'anticipees').length,
    };
  }, FIXTURE);
  verifier('situationsVisibles pur : toutes=2, anticipees=1', filtre.toutes === 2 && filtre.anticipees === 1, JSON.stringify(filtre));

  // 8. Écritures authentifiées : POST situation + POST scénario + DELETE scénario portent le Bearer.
  await page.locator('#vranesh-intitule').fill('CAP-TEST');
  await page.locator('#vranesh-form-situation button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/situations émis', postsSituation.length >= 1, `${postsSituation.length}`);
  verifier('Bearer transmis (POST situation)',
    ((postsSituation[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  const formScenario = page.locator('#vranesh-situation-s1 .zekrom-direction-form');
  await formScenario.locator('input[name="deroule"]').fill('un futur de test');
  await formScenario.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/scenarios émis', postsScenario.length >= 1, `${postsScenario.length}`);
  verifier('Bearer transmis (POST scénario)',
    ((postsScenario[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  await page.locator('#vranesh-situation-s1 .zekrom-direction').first()
    .locator('> .zekrom-retro-detacher').first().click();
  await page.waitForTimeout(200);
  verifier('DELETE /api/scenarios émis', deletesScenario.length >= 1, `${deletesScenario.length}`);
  verifier('Bearer transmis (DELETE scénario)',
    ((deletesScenario[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  // 8bis. PASSERELLES v2 : affichage résolu (objectif + rapport, page), ajout, détachement.
  //   Après le DELETE scénario ci-dessus, le registre s'est rafraîchi (rendu identique
  //   grâce aux stubs 200) : la passerelle sc1 est de nouveau présente.
  const sc1 = page.locator('#vranesh-situation-s1 .zekrom-direction').first();
  const passerelle = sc1.locator('.zekrom-retro');
  verifier('Section « Passerelles » sous le scénario', (await passerelle.locator('.zekrom-retro-entete').textContent()) === 'Passerelles');
  const liensTxt = (await passerelle.locator('.zekrom-retro-item').allTextContents()).map((t) => t.trim());
  verifier('2 passerelles listées sur sc1', (await passerelle.locator('.zekrom-retro-item').count()) === 2, JSON.stringify(liensTxt));
  verifier('Objectif résolu affiché (« Objectif : GARDER LE CAP »)',
    liensTxt.some((t) => /Objectif\s*:\s*GARDER LE CAP/.test(t)), JSON.stringify(liensTxt));
  verifier('Rapport « menace » affiché sur l’objectif',
    liensTxt.some((t) => /GARDER LE CAP/.test(t) && /\(menace\)/.test(t)), JSON.stringify(liensTxt));
  verifier('Page résolue affichée (« Page : La question du départ »)',
    liensTxt.some((t) => /Page\s*:\s*La question du départ/.test(t)), JSON.stringify(liensTxt));

  // Ajout d'une passerelle vers un objectif avec rapport « sert ».
  const formLien = sc1.locator('.zekrom-retro-form');
  await formLien.locator('select[name="cible-type"]').selectOption('serment');
  await formLien.locator('select[name="serment"]').selectOption('serm1');
  await formLien.locator('select[name="rapport"]').selectOption('sert');
  await formLien.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/scenario-liens émis (relier objectif)', postsLien.length >= 1, `${postsLien.length}`);
  verifier('Bearer transmis (POST passerelle)',
    ((postsLien[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');
  const corpsLien = JSON.parse((postsLien[0] || {}).body || '{}');
  verifier('Corps POST objectif : scenario_id + serment_id + rapport',
    corpsLien.scenario_id === 'sc1' && corpsLien.serment_id === 'serm1' && corpsLien.rapport === 'sert'
      && !('entree_id' in corpsLien), JSON.stringify(corpsLien));

  // Ajout d'une passerelle vers une page (aucun rapport dans le corps).
  const sc2 = page.locator('#vranesh-situation-s1 .zekrom-direction').nth(1);
  const formLienPage = sc2.locator('.zekrom-retro-form');
  await formLienPage.locator('select[name="cible-type"]').selectOption('entree');
  await formLienPage.locator('select[name="entree"]').selectOption('ent1');
  await formLienPage.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/scenario-liens émis (relier page)', postsLien.length >= 2, `${postsLien.length}`);
  const corpsPage = JSON.parse((postsLien[postsLien.length - 1] || {}).body || '{}');
  verifier('Corps POST page : scenario_id + entree_id, SANS rapport ni serment_id',
    corpsPage.scenario_id === 'sc2' && corpsPage.entree_id === 'ent1'
      && !('rapport' in corpsPage) && !('serment_id' in corpsPage), JSON.stringify(corpsPage));

  // Détachement d'une passerelle.
  await sc1.locator('.zekrom-retro-item').first().locator('.zekrom-retro-detacher').click();
  await page.waitForTimeout(200);
  verifier('DELETE /api/scenario-liens émis', deletesLien.length >= 1, `${deletesLien.length}`);
  verifier('Bearer transmis (DELETE passerelle)',
    ((deletesLien[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');
  const corpsDetache = JSON.parse((deletesLien[0] || {}).body || '{}');
  verifier('Corps DELETE : l’id de la passerelle', corpsDetache.id === 'l1', JSON.stringify(corpsDetache));

  await page.screenshot({ path: `${CAPTURES}/vranesh-passerelles.png`, fullPage: true });

  // 9. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      parcheminOmbre: cs.getPropertyValue('--parchemin-ombre').trim(),
      intitule: getComputedStyle(document.querySelector('.zekrom-ideal-intitule')).color,
      registre: getComputedStyle(document.querySelector('.zekrom-registre')).color,
      scenario: getComputedStyle(document.querySelector('.zekrom-direction')).color,
    };
  });
  for (const [nom, couleur, fond] of [
    ['intitulé de situation', cr.intitule, cr.parcheminCarte],
    ['pastille de vraisemblance', cr.registre, cr.parcheminOmbre],
    ['texte de scénario', cr.scenario, cr.parcheminCarte],
  ]) {
    const r = ratio(versHex(couleur), fond);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. 401 : fail-closed =====================
console.log('— C. vranesh.html fausse session → 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsGet = [];
  await page.route('**/api/situations**', (route) => {
    appelsGet.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-auth:not([hidden])', { timeout: 20000 });

  verifier('Un appel GET /api/situations (et un seul)', appelsGet.length === 1, `${appelsGet.length}`);
  const autorisation = (appelsGet[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#vranesh-auth').textContent()) || ''));
  verifier('401 → aucune situation rendue', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('401 → registre caché', await page.locator('#vranesh-registre').evaluate((el) => el.hidden));
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE VRANESH VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
