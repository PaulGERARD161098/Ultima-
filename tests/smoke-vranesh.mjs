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
  } catch (e) {}
  // Boucle ④ : le cartouche de Léo s'ouvre désormais à l'entrée du quadrant.
  // Les sections qui exercent la PAGE le neutralisent (marqueur de session PAR
  // quadrant, convention smoke-quadrants) ; un bloc dédié le prouve à part.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu-imladrik', '1'); } catch (e) {}`;
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

  // La boussole des futurs est DONNÉE : sans session, elle n'existe pas.
  verifier('Boussole des futurs absente sans session',
    (await page.locator('#vranesh-plateau .cap').count()) === 0);
  verifier('Aucune branche tracée sans session',
    (await page.locator('.vranesh-branche-trait').count()) === 0);

  // Règle de charte : une règle de confidentialité se teste par l'ABSENCE.
  // Le HTML SERVI ne doit contenir aucun intitulé de thème — les caps de cette
  // boussole sont des données intimes, jamais du statique de page.
  const htmlServi = await (await fetch(`${BASE}/vranesh.html`)).text();
  verifier('HTML servi : aucun intitulé de thème en dur',
    !/TRAVERSÉE|CARREFOUR|LIANDRA|THORIOL/i.test(htmlServi));

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

// ============ D. La boussole des futurs (thèmes en caps + ramifications) ============
// Forme dictée par Paul (2026-08-01) : un cap = un THÈME de futurs (une
// situation), une branche qui pousse = un SCÉNARIO. Prouve la géométrie, le
// rattachement des branches au bon thème, l'état « à explorer » sans branche,
// et — par l'ABSENCE — qu'aucun déroulé de scénario ne fuit dans le cartouche.
console.log('— D. vranesh.html fixture 200 → boussole des futurs + ramifications —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/situations**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE),
  }));
  await page.route('**/api/scenarios**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ ok: true, data: {} }),
  }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-boussole:not([hidden])', { timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });

  // 1. Un cap par thème de futurs.
  verifier('2 thèmes rendus en caps', (await page.locator('#vranesh-plateau .cap').count()) === 2);
  const noms = await page.locator('#vranesh-plateau .cap-nom').allTextContents();
  verifier('Les caps portent les intitulés des thèmes',
    noms.includes('TRAVERSÉE') && noms.includes('CARREFOUR'), JSON.stringify(noms));
  verifier('2 aiguilles (une par thème)', (await page.locator('.vranesh-branches .aiguille').count()) === 2);
  verifier('Médaillon gravé au cœur', (await page.locator('#vranesh-plateau .boussole-coeur svg').count()) === 1);

  // 2. Les ramifications : un scénario = une branche, rattachée à SON thème.
  const capTraversee = page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' });
  const capCarrefour = page.locator('#vranesh-plateau .cap', { hasText: 'CARREFOUR' });
  verifier('3 branches au total (les 3 scénarios de TRAVERSÉE)',
    (await page.locator('.vranesh-branche-trait').count()) === 3);
  verifier('3 bourgeons (un par branche)',
    (await page.locator('.vranesh-bourgeon').count()) === 3);
  const parGroupe = await page.evaluate(() => Array.from(
    document.querySelectorAll('.vranesh-branches-groupe'),
    (g) => g.querySelectorAll('.vranesh-branche-trait').length));
  verifier('Les branches sont rattachées au bon thème (3 et 0)',
    parGroupe.length === 2 && parGroupe.includes(3) && parGroupe.includes(0), JSON.stringify(parGroupe));

  // 3. La vraisemblance se lit sur l'épaisseur (jamais la couleur seule).
  verifier('Une branche « forte » et une branche « faible » distinguées',
    (await page.locator('.vranesh-branche-trait--forte').count()) === 1
    && (await page.locator('.vranesh-branche-trait--faible').count()) === 1);
  const largeurs = await page.evaluate(() => {
    const w = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).strokeWidth);
    return { forte: w('.vranesh-branche-trait--forte'), faible: w('.vranesh-branche-trait--faible') };
  });
  verifier('Un futur probable est tracé plus épais qu’un futur improbable',
    largeurs.forte > largeurs.faible, JSON.stringify(largeurs));

  // 4. Le thème « à explorer » : un cap NU, invitation et non manque.
  verifier('CARREFOUR (0 scénario) porte l’état « à explorer »',
    /à explorer/.test((await capCarrefour.textContent()) || ''));
  verifier('CARREFOUR marqué comme cap sans futur déroulé',
    (await capCarrefour.evaluate((el) => el.classList.contains('cap--avenir'))) === true);
  verifier('TRAVERSÉE affiche son compte de scénarios',
    /3 scénarios/.test((await capTraversee.textContent()) || ''));

  // 5. Un cap ouvre son thème dans le registre en dessous.
  verifier('Le cap pointe la fiche du thème', (await capTraversee.getAttribute('href')) === '#vranesh-situation-s1');

  // 6. La parole de Léo au survol — et l'ABSENCE de tout déroulé de scénario.
  await capTraversee.hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Parole : le thème survolé est nommé', /TRAVERSÉE/.test(parole), parole);
  verifier('Parole : la vraisemblance est écrite, pas seulement tracée',
    /probable/.test(parole), parole);
  verifier('Parole : posture VRANESH rappelée (revenir au présent)',
    /revenir au présent/.test(parole), parole);
  verifier('ABSENCE — aucun déroulé de scénario dans le cartouche',
    !/le vent tourne au nord|la mer reste étale|un grain passe/.test(parole), parole);
  verifier('Le thème survolé illumine SES branches (et elles seules)',
    (await page.locator('.vranesh-branches-groupe.is-actif').count()) === 1);

  // 7. Le thème nu parle en invitation, jamais en reproche.
  await capCarrefour.hover();
  await page.waitForFunction(() => /CARREFOUR/.test(document.getElementById('vranesh-parole').textContent || ''), null, { timeout: 5000 });
  const paroleNue = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Thème nu : invitation positive', /rien ne manque/i.test(paroleNue), paroleNue);
  verifier('Thème nu : aucun vocabulaire de reproche',
    !/manqu(e|es|ement)\b(?! )|retard|néglig|oubli|devrais|faute/i.test(paroleNue.replace(/rien ne manque/i, '')), paroleNue);

  // 8. La géométrie de l'éventail — fonction pure exposée aux harnais.
  const geo = await page.evaluate(() => {
    const e = window.UltimaVranesh.eventail;
    const une = e(0, 1);
    const trois = e(0, 3);
    return {
      uneLongueur: une.length,
      uneDansLAxe: Math.abs(une[0].by - 50) < 0.001,
      troisLongueur: trois.length,
      // symétrie : la 1re et la 3e branche s'écartent également de l'axe
      symetrique: Math.abs((trois[0].by - 50) + (trois[2].by - 50)) < 0.001,
      mediane: Math.abs(trois[1].by - 50) < 0.001,
      aucune: e(0, 0).length,
    };
  });
  verifier('Éventail : 1 scénario → 1 branche dans l’axe du cap',
    geo.uneLongueur === 1 && geo.uneDansLAxe, JSON.stringify(geo));
  verifier('Éventail : 3 scénarios → 3 branches symétriques autour de l’axe',
    geo.troisLongueur === 3 && geo.symetrique && geo.mediane, JSON.stringify(geo));
  verifier('Éventail : 0 scénario → aucune branche', geo.aucune === 0);

  // 9. Lisibilité et hygiène.
  const cc = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      nom: getComputedStyle(document.querySelector('#vranesh-plateau .cap-nom')).color,
      etat: getComputedStyle(document.querySelector('#vranesh-plateau .cap-etat')).color,
    };
  });
  verifier('Contraste nom de thème ≥ 4,5:1', ratio(versHex(cc.nom), cc.parchemin) >= 4.5);
  verifier('Contraste état de thème ≥ 4,5:1', ratio(versHex(cc.etat), cc.parchemin) >= 4.5);
  const hCap = await capTraversee.evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target cap ≥ 44 px', hCap >= 44, `${hCap}px`);
  verifier('Zéro requête externe (boussole)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (boussole)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${CAPTURES}/vranesh-boussole.png`, fullPage: true });
  await page.close();
}

// ============ E. Le dénouement : « la branche qui a poussé » (0019) ============
// Dictée Paul : quand le futur est advenu, désigner la branche qui a poussé —
// l'une des anticipées ou une neuve — et les autres branches potentielles sont
// SUPPRIMÉES. Prouve : le geste est en DEUX temps (jamais de coupe au premier
// clic), la confirmation ANNONCE combien de branches tombent, le PATCH part
// avec le bon corps, la branche neuve est écrite AVANT d'être désignée, et
// annuler ne coupe rien.
console.log('— E. vranesh.html → dénouement (la branche qui a poussé) —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const patchs = [];
  const postsScenario = [];
  await page.route('**/api/situations**', (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      patchs.push({ headers: req.headers(), body: req.postData() });
      return route.fulfill({
        status: 200, contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ ok: true, data: { id: 's1', scenario_advenu_id: 'sc2', coupees: 2 } }),
      });
    }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE),
    });
  });
  await page.route('**/api/scenarios**', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { postsScenario.push({ headers: req.headers(), body: req.postData() }); }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'sc-neuve' } }),
    });
  });
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-registre:not([hidden])', { timeout: 20000 });

  const s1 = page.locator('#vranesh-situation-s1');
  const s2 = page.locator('#vranesh-situation-s2');
  const deno = s1.locator('.vranesh-denouement');

  // 1. Le dénouement n'est proposé que là où il y a des branches à trancher.
  verifier('Dénouement proposé sur un thème doté de futurs', (await deno.count()) === 1);
  verifier('Aucun dénouement sur un thème « à explorer »',
    (await s2.locator('.vranesh-denouement').count()) === 0);
  verifier('Le caractère définitif est annoncé AVANT tout clic',
    /supprimées — le geste est définitif/.test((await deno.textContent()) || ''));

  // 2. Le choix propose les branches anticipées ET la branche neuve.
  const options = await deno.locator('select option').allTextContents();
  verifier('Les 3 futurs anticipés sont proposés',
    options.filter((o) => !/Autre chose/.test(o)).length === 3, JSON.stringify(options));
  verifier('« Autre chose est arrivé » proposé (branche neuve)',
    options.some((o) => /Autre chose est arrivé/.test(o)));
  verifier('Le champ de branche neuve est masqué par défaut',
    await deno.locator('.vranesh-branche-neuve').evaluate((el) => el.hidden));

  // 3. DEUX TEMPS : le premier clic ne coupe rien, il demande confirmation.
  await deno.locator('select').selectOption('sc2');
  await deno.locator('button[type="submit"]').click();
  await page.waitForSelector('#vranesh-situation-s1 .vranesh-confirmation:not([hidden])', { timeout: 5000 });
  verifier('Premier clic : AUCUN PATCH émis (rien n’est coupé)', patchs.length === 0, `${patchs.length}`);
  verifier('La confirmation annonce le nombre exact de branches coupées (3 − 1 = 2)',
    /Les 2 autres branches potentielles seront supprimées/.test(
      (await deno.locator('.vranesh-confirmation').textContent()) || ''),
    (await deno.locator('.vranesh-confirmation').textContent()) || '');

  // 4. Annuler ne coupe rien.
  await deno.locator('.vranesh-confirmation button:not(.vranesh-confirmer)').click();
  verifier('Annuler : toujours aucun PATCH', patchs.length === 0, `${patchs.length}`);
  verifier('Annuler : la confirmation se referme',
    await deno.locator('.vranesh-confirmation').evaluate((el) => el.hidden));

  // 5. Confirmer émet le dénouement, avec le bon corps et le Bearer.
  await deno.locator('button[type="submit"]').click();
  await page.waitForSelector('#vranesh-situation-s1 .vranesh-confirmation:not([hidden])', { timeout: 5000 });
  await deno.locator('.vranesh-confirmer').click();
  await page.waitForFunction(() => true, null, { timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(300);
  verifier('Confirmer : un PATCH /api/situations émis', patchs.length === 1, `${patchs.length}`);
  const corpsPatch = JSON.parse((patchs[0] || {}).body || '{}');
  verifier('Corps du dénouement : id du thème + branche retenue',
    corpsPatch.id === 's1' && corpsPatch.scenario_advenu_id === 'sc2', JSON.stringify(corpsPatch));
  verifier('Le client ne pose PAS la date de l’advenu (serveur seul)',
    !('advenu_le' in corpsPatch), JSON.stringify(corpsPatch));
  verifier('Bearer transmis (dénouement)',
    ((patchs[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');

  // 6. La branche neuve : écrite d'abord, désignée ensuite.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#vranesh-registre:not([hidden])', { timeout: 20000 });
  const deno2 = page.locator('#vranesh-situation-s1 .vranesh-denouement');
  await deno2.locator('select').selectOption('');
  verifier('Branche neuve choisie : le champ de saisie s’ouvre',
    (await deno2.locator('.vranesh-branche-neuve').evaluate((el) => el.hidden)) === false);
  await deno2.locator('.vranesh-branche-neuve input').fill('rien de ce qui était prévu');
  await deno2.locator('button[type="submit"]').click();
  await page.waitForSelector('#vranesh-situation-s1 .vranesh-confirmation:not([hidden])', { timeout: 5000 });
  verifier('Branche neuve : les 3 branches anticipées seront coupées',
    /Les 3 autres branches potentielles seront supprimées/.test(
      (await deno2.locator('.vranesh-confirmation').textContent()) || ''));
  await deno2.locator('.vranesh-confirmer').click();
  await page.waitForTimeout(400);
  verifier('Branche neuve : POST /api/scenarios émis AVANT le dénouement',
    postsScenario.length === 1, `${postsScenario.length}`);
  const corpsNeuf = JSON.parse((postsScenario[0] || {}).body || '{}');
  verifier('Branche neuve : corps = situation + déroulé constaté',
    corpsNeuf.situation_id === 's1' && corpsNeuf.deroule === 'rien de ce qui était prévu',
    JSON.stringify(corpsNeuf));
  verifier('Branche neuve : le dénouement désigne la branche fraîchement écrite',
    patchs.length === 2 && JSON.parse(patchs[1].body).scenario_advenu_id === 'sc-neuve',
    JSON.stringify(patchs.map((p) => p.body)));

  // 7. Saisie vide : rien ne part.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#vranesh-registre:not([hidden])', { timeout: 20000 });
  const deno3 = page.locator('#vranesh-situation-s1 .vranesh-denouement');
  await deno3.locator('select').selectOption('');
  await deno3.locator('button[type="submit"]').click();
  verifier('Branche neuve vide : aucune confirmation ouverte',
    await deno3.locator('.vranesh-confirmation').evaluate((el) => el.hidden));
  verifier('Branche neuve vide : aucun appel supplémentaire',
    patchs.length === 2 && postsScenario.length === 1);

  verifier('Zéro requête externe (dénouement)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (dénouement)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ F. Un thème ADVENU : la branche qui a poussé se voit ============
console.log('— F. vranesh.html thème advenu → une seule branche, scellée —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  // Après un dénouement, la base ne garde qu'UNE branche pour ce thème : celle
  // qui a poussé (les autres ont été supprimées). C'est cet état-là qu'on rend.
  const FIXTURE_ADVENUE = {
    ok: true,
    data: {
      situations: [
        { id: 's1', intitule: 'TRAVERSÉE', contexte: 'un départ à préparer', nb_scenarios: 1,
          a_explorer: false, advenue: true, scenario_advenu_id: 'sc1',
          advenu_le: '2026-07-20T09:00:00Z', created_at: '2026-07-01T10:00:00Z' },
        { id: 's2', intitule: 'CARREFOUR', contexte: null, nb_scenarios: 0, a_explorer: true,
          advenue: false, scenario_advenu_id: null, advenu_le: null, created_at: '2026-07-02T10:00:00Z' },
      ],
      scenarios: [
        { id: 'sc1', situation_id: 's1', deroule: 'le vent tourne au nord et porte la voile',
          vraisemblance: 'forte', signaux: null, parade: null },
      ],
      liens: [],
    },
  };
  await page.route('**/api/situations**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_ADVENUE) }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });

  // La boussole : une seule branche, tracée comme advenue.
  verifier('Une seule branche subsiste sur le thème advenu',
    (await page.locator('.vranesh-branche-trait').count()) === 1);
  verifier('La branche qui a poussé est tracée comme advenue',
    (await page.locator('.vranesh-branche-trait--advenue').count()) === 1);
  verifier('Son bourgeon est devenu fruit',
    (await page.locator('.vranesh-bourgeon--advenu').count()) === 1);
  const capAdvenu = page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' });
  verifier('Le cap porte l’état « advenu »', /advenu/.test((await capAdvenu.textContent()) || ''));
  verifier('Le cap est marqué scellé', await capAdvenu.evaluate((el) => el.classList.contains('cap--advenu')));

  // Le trait advenu est plus affirmé que n'importe quelle hypothèse.
  const epaisseurs = await page.evaluate(() => ({
    advenue: parseFloat(getComputedStyle(document.querySelector('.vranesh-branche-trait--advenue')).strokeWidth),
    forte: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--x') || '0'),
  }));
  verifier('La branche advenue est plus épaisse que le plus probable des futurs (0,8)',
    epaisseurs.advenue > 0.8, JSON.stringify(epaisseurs));

  // La parole : ce thème ne s'anticipe plus.
  await capAdvenu.hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Parole : le futur a tranché', /a tranché/.test(parole), parole);
  verifier('Parole : plus d’invitation à anticiper', !/anticiper sereinement/i.test(parole), parole);

  // Le registre : la branche qui a poussé, sa date, et la possibilité de rouvrir.
  const deno = page.locator('#vranesh-situation-s1 .vranesh-denouement');
  verifier('Registre : le bloc du dénouement est celui d’un thème advenu',
    await deno.evaluate((el) => el.classList.contains('vranesh-denouement--advenu')));
  verifier('Registre : la branche qui a poussé est rendue',
    /le vent tourne au nord/.test((await deno.locator('.vranesh-advenu-deroule').textContent()) || ''));
  verifier('Registre : la date du constat est lisible',
    /constaté le/.test((await deno.textContent()) || ''));
  verifier('Registre : aucun formulaire de dénouement sur un thème déjà advenu',
    (await deno.locator('form').count()) === 0);
  verifier('Registre : le thème peut être rouvert',
    (await deno.locator('button').count()) === 1
    && /Rouvrir/.test((await deno.locator('button').textContent()) || ''));

  verifier('Zéro erreur console (thème advenu)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/vranesh-advenu.png`, fullPage: true });
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE VRANESH VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
