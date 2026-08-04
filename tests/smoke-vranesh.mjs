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
  // Le registre détaillé est REPLIÉ depuis la v2 (constat de Paul : trop de
  // textes affichés d'un coup). On l'ouvre : cette section exerce l'écriture.
  await page.locator('#vranesh-registre-detail summary').click();

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
  // La saisie est repliée depuis le 2026-08-04 (l'arrivée est faite pour
  // regarder, pas pour écrire) : on ouvre le pli avant d'écrire.
  await page.locator('#vranesh-saisie summary').click();
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

// ====== D. La boussole → l'arbre : affichage À LA DEMANDE (v2, 2026-08-01) ======
// Constat de Paul sur la v1 : « c'est trop gros, trop général, il y a trop de
// textes ». Forme retenue : ① la rose ne porte que les NOMS ; ② un CLIC ouvre
// l'arbre du thème (tronc + branches) et efface la rose ; ③ le côté donne UNE
// LIGNE au survol, TOUT au clic. Le registre détaillé est REPLIÉ.
// Ce qui se prouve ici est autant ce qui s'affiche que ce qui NE s'affiche PAS.
console.log('— D. vranesh.html → la rose (noms seuls), puis l’arbre au clic —');
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
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });

  // ---- ① La rose : les noms, rien d'autre. ----
  verifier('2 thèmes rendus en caps', (await page.locator('#vranesh-plateau .cap').count()) === 2);
  const noms = await page.locator('#vranesh-plateau .cap-nom').allTextContents();
  verifier('Le cap porte le NOM SEUL, pas l’intitulé complet',
    noms.includes('TRAVERSÉE') && noms.includes('CARREFOUR'), JSON.stringify(noms));
  verifier('ABSENCE — aucun sous-titre de thème sur la rose',
    !/un départ à préparer|—\s*l/.test((await page.locator('#vranesh-plateau').textContent()) || ''));
  verifier('Aucune branche tant qu’aucun thème n’est ouvert',
    (await page.locator('.vranesh-branche').count()) === 0);
  verifier('L’arbre est fermé à l’arrivée',
    await page.locator('#vranesh-arbre').evaluate((el) => el.hidden));
  verifier('Médaillon gravé au cœur', (await page.locator('#vranesh-plateau .boussole-coeur svg').count()) === 1);
  verifier('CARREFOUR (0 scénario) porte l’état « à explorer »',
    /à explorer/.test((await page.locator('#vranesh-plateau .cap', { hasText: 'CARREFOUR' }).textContent()) || ''));

  // ---- Le registre détaillé est REPLIÉ : plus de mur de texte à l'arrivée. ----
  const repli = page.locator('#vranesh-registre-detail');
  verifier('Le registre détaillé est replié par défaut',
    (await repli.evaluate((el) => el.open)) === false);
  verifier('ABSENCE — aucun déroulé de scénario visible à l’arrivée',
    !(await page.locator('#vranesh-situations').isVisible()));

  // ---- L'ARRIVÉE DÉPOUILLÉE (dictée Paul 2026-08-04 : « juste LIANDRA,
  //      THORIOL »). Le dépouillement se MESURE en mots réellement visibles,
  //      il ne s'apprécie pas : sinon « épuré » veut dire ce qu'on veut.
  verifier('La saisie d’une situation est repliée à l’arrivée',
    (await page.locator('#vranesh-saisie').evaluate((el) => el.open)) === false);
  verifier('ABSENCE — aucun champ de saisie sur le premier écran',
    !(await page.locator('#vranesh-intitule').isVisible()));
  verifier('ABSENCE — la notice de la boussole a disparu',
    !/Survole une branche pour savoir|Chaque cap est un thème/
      .test((await page.locator('#vranesh-boussole').textContent()) || ''));
  const motsArrivee = await page.evaluate(() => {
    // Tout le texte VISIBLE de la page à l'arrivée, hors éléments repliés.
    // `checkVisibility` et NON `offsetParent` : sous Chromium, un <details>
    // fermé masque son contenu par `content-visibility`, et ses enfants
    // gardent un offsetParent — la mesure aurait compté un texte invisible.
    const vu = (n) => (n.checkVisibility
      ? n.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true })
      : n.offsetParent !== null);
    let mots = 0;
    const blocs = [];
    document.querySelectorAll('.console-conteneur *').forEach((n) => {
      if (n.children.length > 0 || !vu(n)) { return; }
      const compte = (n.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      mots += compte;
      if (compte > 0) { blocs.push(compte); }
    });
    return { mots, plusLongBloc: Math.max(0, ...blocs) };
  });
  // Deux bornes, parce qu'un total bas peut cacher un pavé, et un pavé absent
  // peut cacher un total qui enfle. Composition au 2026-08-04 : 47 mots =
  // titre + mission (9) + « privé » + titre de section + les 2 noms et leur
  // état + la ligne d'amorce (8) + les 2 plis + le retour. Aucune prose.
  verifier('Moins de 50 mots à l’écran en arrivant sur VRANESH',
    motsArrivee.mots < 50, `${motsArrivee.mots} mots`);
  verifier('Aucun pavé à l’arrivée : le plus long bloc tient en 12 mots',
    motsArrivee.plusLongBloc <= 12, `${motsArrivee.plusLongBloc} mots dans le plus long`);
  const nomsVus = await page.locator('#vranesh-plateau .cap-nom').allTextContents();
  verifier('Les deux thèmes sont là, tout de suite, sans un clic',
    nomsVus.length === 2, JSON.stringify(nomsVus));

  // ---- ② Le clic ouvre l'arbre et efface la rose. ----
  await page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });
  verifier('La rose s’efface au profit de l’arbre',
    await page.locator('#vranesh-plateau').evaluate((el) => el.hidden));
  verifier('Le tronc part de la base', (await page.locator('.vranesh-tronc').count()) === 1);
  verifier('3 branches — une par futur de ce thème',
    (await page.locator('.vranesh-branche').count()) === 3);
  verifier('3 bourgeons (un par branche)', (await page.locator('.vranesh-bourgeon').count()) === 3);
  verifier('Le nom du thème est gravé au pied de l’arbre',
    (await page.locator('#vranesh-arbre-nom').textContent()) === 'TRAVERSÉE');
  const etiquettes = await page.locator('.vranesh-etiquette').allTextContents();
  verifier('Chaque branche porte une étiquette COURTE (≤ 35 signes)',
    etiquettes.length === 3 && etiquettes.every((e) => e.length <= 35), JSON.stringify(etiquettes));
  verifier('ABSENCE — le déroulé complet n’est PAS écrit sur l’arbre',
    !/porte la voile/.test((await page.locator('#vranesh-arbre-dessin').textContent()) || ''));
  // ---- Les étiquettes doivent TENIR DANS LE CADRE (constat Paul 2026-08-04 :
  //      « au nord et porte… » sortait par la gauche). Une géométrie se MESURE :
  //      on compare la boîte de chaque texte au repère, on ne la juge pas à l'œil.
  const debords = await page.evaluate(() => {
    const svg = document.getElementById('vranesh-arbre-dessin');
    const vb = svg.viewBox.baseVal;
    return Array.from(svg.querySelectorAll('.vranesh-etiquette'))
      .filter((t) => (t.textContent || '').length > 0)
      .map((t) => {
        const b = t.getBBox();
        return { texte: t.textContent, x1: Math.round(b.x), x2: Math.round(b.x + b.width) };
      })
      .filter((e) => e.x1 < vb.x || e.x2 > vb.x + vb.width);
  });
  verifier('Aucune étiquette ne déborde du cadre (mesuré, pas jugé à l’œil)',
    debords.length === 0, JSON.stringify(debords));

  verifier('Vraisemblances distinguées sur les traits',
    (await page.locator('.vranesh-branche--forte').count()) === 1
    && (await page.locator('.vranesh-branche--faible').count()) === 1);
  const largeurs = await page.evaluate(() => {
    const w = (s) => parseFloat(getComputedStyle(document.querySelector(s)).strokeWidth);
    return { forte: w('.vranesh-branche--forte'), faible: w('.vranesh-branche--faible') };
  });
  verifier('Un futur probable est tracé plus épais qu’un futur improbable',
    largeurs.forte > largeurs.faible, JSON.stringify(largeurs));

  // ---- ③ Survol : UNE LIGNE. Clic : TOUT. ----
  // On vise le bourgeon : le centre de la boîte englobante d'une courbe est du
  // vide, la souris d'un humain vise le trait ou son bout.
  const branche = page.locator('.vranesh-bourgeon').first();
  await branche.hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  const survol = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Survol : le côté nomme la branche et son rang',
    /futur 1 sur 3/.test(survol), survol);
  verifier('Survol : le déroulé du futur est donné', /porte la voile/.test(survol), survol);
  verifier('Survol : la vraisemblance est écrite, pas seulement tracée',
    /vraisemblance/.test(survol), survol);
  verifier('ABSENCE — signaux et parade ne sortent PAS au simple survol',
    !/le ciel se dégage|deux jours d’avance/.test(survol), survol);
  verifier('Survol : la branche s’illumine seule',
    (await page.locator('.vranesh-branche-g.is-actif').count()) === 1);

  await page.locator('.vranesh-bourgeon').first().click();
  await page.waitForSelector('.vranesh-branche-g.is-choisie', { timeout: 5000 });
  const detail = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Clic : les signes avant-coureurs s’affichent',
    /le ciel se dégage/.test(detail), detail);
  verifier('Clic : la parade s’affiche', /deux jours d’avance/.test(detail), detail);
  verifier('Clic : les passerelles s’affichent', /GARDER LE CAP/.test(detail), detail);
  verifier('Clic : un lien mène au registre de ce thème',
    (await page.locator('#vranesh-parole a[href="#vranesh-situation-s1"]').count()) === 1);

  // ---- LE DÉTAIL EN TROIS VIGNETTES (forme A, tranchée par Paul 2026-08-04).
  //      Constat qu'elles corrigent : « c'est purement du texte brut », et le
  //      déroulé était écrit DEUX fois (titre tronqué, puis corps).
  const vignettes = page.locator('#vranesh-parole .vranesh-vignette');
  verifier('Trois vignettes : ce qui l’annonce, ce que j’ai prévu, ce que ça touche',
    (await vignettes.count()) === 3, `${await vignettes.count()}`);
  const natures = await page.locator('#vranesh-parole .vranesh-vignette-quoi').allTextContents();
  verifier('Chaque vignette annonce sa NATURE d’information',
    natures.join('|') === 'Ce qui l’annonce|Ce que j’ai prévu|Ce que ça touche',
    JSON.stringify(natures));
  verifier('Chaque vignette porte son icône gravée',
    (await page.locator('#vranesh-parole .vranesh-vignette-icone').count()) === 3);
  const fois = (detail.match(/porte la voile/g) || []).length;
  verifier('Le déroulé n’est écrit QU’UNE FOIS (il l’était deux)', fois === 1, `${fois} fois`);
  verifier('ABSENCE — plus de liste de définitions empilée',
    (await page.locator('#vranesh-parole dl').count()) === 0);

  // Un futur sans rien de noté ne dresse pas trois cases vides.
  await page.locator('.vranesh-bourgeon').nth(1).click();
  await page.waitForTimeout(120);
  verifier('Futur sans notes : aucune vignette vide, une seule ligne',
    (await page.locator('#vranesh-parole .vranesh-vignette').count()) === 0
    && (await page.locator('#vranesh-parole .vranesh-vignettes-vide').count()) === 1);
  await page.locator('.vranesh-bourgeon').first().click();
  await page.waitForTimeout(120);

  // ---- Retour : on retrouve la rose intacte. ----
  await page.locator('#vranesh-arbre-retour').click();
  verifier('Retour : la rose revient',
    (await page.locator('#vranesh-plateau').evaluate((el) => el.hidden)) === false);
  verifier('Retour : l’arbre se referme',
    await page.locator('#vranesh-arbre').evaluate((el) => el.hidden));

  // ---- Un thème sans futur : une base qui attend, jamais un reproche. ----
  await page.locator('#vranesh-plateau .cap', { hasText: 'CARREFOUR' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });
  verifier('Thème nu : aucune branche', (await page.locator('.vranesh-branche').count()) === 0);
  const nu = (await page.locator('#vranesh-arbre-dessin').textContent()) || '';
  verifier('Thème nu : la base attend ses branches (invitation)',
    /attend ses branches/.test(nu), nu);
  verifier('Thème nu : aucun vocabulaire de reproche',
    !/manque|retard|néglig|oubli|devrais|faute/i.test(nu + (await page.locator('#vranesh-parole').textContent())));

  // ---- Les réductions de texte, fonctions pures. ----
  const pur = await page.evaluate(() => {
    const V = window.UltimaVranesh;
    return {
      nomAvecTiret: V.nomCourt('LIANDRA — l’amour et le devoir'),
      nomSansTiret: V.nomCourt('CARREFOUR'),
      nomVide: V.nomCourt(''),
      etiquetteCourte: V.etiquetteBranche('Je referme.'),
      etiquetteLongue: V.etiquetteBranche('Le vent tourne au nord et porte la voile jusqu’au bout du détroit'),
      etiquetteVide: V.etiquetteBranche(''),
      charpenteVide: V.charpente(0).length,
      charpente3: V.charpente(3).branches.length,
      alternance: V.charpente(3).branches.map((b) => b.sens).join(','),
      surTronc: V.charpente(3).branches.every((b) => b.ax === 150),
      // La place disponible est calculée branche par branche : positive des
      // deux côtés, et jamais plus large que le demi-cadre.
      dispos: V.charpente(6).branches.map((b) => Math.round(b.dispo)),
      signes: V.charpente(6).branches.map((b) => b.signes),
    };
  });
  verifier('charpente : chaque branche connaît la place réelle de son étiquette',
    pur.dispos.length === 6 && pur.dispos.every((d) => d > 0 && d < 150),
    JSON.stringify(pur.dispos));
  verifier('charpente : le budget de signes en découle, jamais nul',
    pur.signes.every((s) => s >= 6), JSON.stringify(pur.signes));
  verifier('nomCourt : le sous-titre tombe', pur.nomAvecTiret === 'LIANDRA', JSON.stringify(pur));
  verifier('nomCourt : un nom sans sous-titre est gardé entier', pur.nomSansTiret === 'CARREFOUR');
  verifier('nomCourt : un intitulé vide ne casse rien', pur.nomVide === '');
  verifier('etiquetteBranche : une phrase courte passe telle quelle',
    pur.etiquetteCourte === 'Je referme', pur.etiquetteCourte);
  verifier('etiquetteBranche : une phrase longue est bornée et suspendue',
    pur.etiquetteLongue.length <= 35 && /…$/.test(pur.etiquetteLongue), pur.etiquetteLongue);
  verifier('etiquetteBranche : un déroulé vide ne casse rien', pur.etiquetteVide === 'un futur');
  verifier('charpente : 0 futur → aucune branche', pur.charpenteVide === 0);
  verifier('charpente : 3 futurs → 3 branches alternées, toutes sur le tronc',
    pur.charpente3 === 3 && pur.alternance === '-1,1,-1' && pur.surTronc, JSON.stringify(pur));

  // ---- Hygiène (de retour sur la rose : un cap n'a de taille que visible). ----
  await page.locator('#vranesh-arbre-retour').click();
  const hCap = await page.locator('#vranesh-plateau .cap').first().evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target cap ≥ 44 px', hCap >= 44, `${hCap}px`);
  verifier('Zéro requête externe (arbre)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (arbre)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/vranesh-arbre.png`, fullPage: true });
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
  // Le registre est replié par défaut : on l'ouvre pour écrire.
  await page.locator('#vranesh-registre-detail summary').click();

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
  await page.locator('#vranesh-registre-detail summary').click();
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
  await page.locator('#vranesh-registre-detail summary').click();
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

  const capAdvenu = page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' });
  verifier('Le cap porte l’état « advenu »', /advenu/.test((await capAdvenu.textContent()) || ''));
  verifier('Le cap est marqué scellé', await capAdvenu.evaluate((el) => el.classList.contains('cap--advenu')));

  // L'arbre du thème advenu : une seule branche, tracée comme telle.
  await capAdvenu.click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });
  verifier('Une seule branche subsiste sur le thème advenu',
    (await page.locator('.vranesh-branche').count()) === 1);
  verifier('La branche qui a poussé est tracée comme advenue',
    (await page.locator('.vranesh-branche--advenue').count()) === 1);
  verifier('Le groupe de la branche est marqué advenu',
    (await page.locator('.vranesh-branche-g.is-advenue').count()) === 1);

  // Le trait advenu est plus affirmé que n'importe quelle hypothèse (forte = 2,2).
  const epaisseurs = await page.evaluate(() => ({
    advenue: parseFloat(getComputedStyle(document.querySelector('.vranesh-branche--advenue')).strokeWidth),
  }));
  verifier('La branche advenue est plus épaisse que le plus probable des futurs (2,2)',
    epaisseurs.advenue > 2.2, JSON.stringify(epaisseurs));

  // Le côté : cette branche est celle qui a poussé.
  await page.locator('.vranesh-bourgeon').first().hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Côté : la branche est annoncée comme celle qui a poussé',
    /la branche qui a poussé/.test(parole), parole);
  verifier('Côté : aucune vraisemblance affichée pour un futur advenu',
    !/vraisemblance/.test(parole), parole);

  // Le registre : la branche qui a poussé, sa date, et la possibilité de rouvrir.
  await page.locator('#vranesh-registre-detail summary').click();
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

// ====== G. CHOISIR LA BRANCHE DEPUIS L'ARBRE (dictée Paul 2026-08-04) ======
// Constat de Paul : « je clique sur une branche, ça me donne le choix si je la
// sélectionne, si le futur est advenu. En l'état ce n'est pas le cas. » Le
// dénouement existait, mais seulement au fond du registre replié : hors du
// regard, donc hors d'usage.
// Prouve : ① le clic sur une branche OFFRE le choix ; ② le survol seul ne
// l'offre pas (un geste irréversible ne s'attrape pas à la volée) ; ③ deux
// temps — le premier clic ne coupe rien et annonce le nombre exact de branches
// coupées ; ④ annuler ne coupe rien ; ⑤ confirmer émet le PATCH de CETTE
// branche, avec le Bearer, sans poser la date ; ⑥ un thème dénoué s'ouvre SUR
// son futur advenu, en grand, sans le moindre clic — et n'offre plus de couper.
console.log('— G. vranesh.html → choisir la branche qui a poussé depuis l’arbre —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const patchs = [];
  await page.route('**/api/situations**', (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      patchs.push({ headers: req.headers(), body: req.postData() });
      return route.fulfill({
        status: 200, contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ ok: true, data: { id: 's1', scenario_advenu_id: 'sc1', coupees: 2 } }),
      });
    }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE),
    });
  });
  await page.route('**/api/scenarios**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });
  await page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });

  const cote = page.locator('#vranesh-parole');

  // ---- ① L'invitation est annoncée AVANT tout clic : le geste existe et se sait.
  verifier('Le côté annonce qu’on peut désigner la branche qui a poussé',
    /désigner celle qui a poussé/.test((await cote.textContent()) || ''),
    (await cote.textContent()) || '');

  // ---- ② Survol seul : le choix n'est PAS offert (rien d'irréversible à la volée).
  await page.locator('.vranesh-bourgeon').first().hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  verifier('ABSENCE — le survol seul n’offre pas de trancher',
    (await cote.locator('.vranesh-cote-choisir').count()) === 0);

  // ---- ③ Le clic sur la branche OFFRE le choix — c'est le constat de Paul.
  await page.locator('.vranesh-bourgeon').first().click();
  await page.waitForSelector('.vranesh-branche-g.is-choisie', { timeout: 5000 });
  const choisir = cote.locator('.vranesh-cote-choisir');
  verifier('Clic sur une branche : « Cette branche a poussé » est proposé',
    (await choisir.count()) === 1);
  verifier('Le bouton nomme la branche visée pour les lecteurs d’écran',
    /futur advenu/.test((await choisir.getAttribute('aria-label')) || ''),
    (await choisir.getAttribute('aria-label')) || '');
  const hChoisir = await choisir.evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target du choix ≥ 44 px', hChoisir >= 44, `${hChoisir}px`);
  verifier('Le choix est offert sans dérouler le registre',
    (await page.locator('#vranesh-registre-detail').evaluate((el) => el.open)) === false);

  // ---- ④ DEUX TEMPS : le premier clic ne coupe rien, il annonce ce qui tombe.
  await choisir.click();
  await page.waitForSelector('#vranesh-parole .vranesh-cote-confirmation:not([hidden])', { timeout: 5000 });
  verifier('Premier clic : AUCUN PATCH émis (rien n’est coupé)', patchs.length === 0, `${patchs.length}`);
  const txtConf = (await cote.locator('.vranesh-cote-confirmation').textContent()) || '';
  verifier('La confirmation annonce le nombre exact de branches coupées (3 − 1 = 2)',
    /Les 2 autres branches potentielles seront supprimées définitivement/.test(txtConf), txtConf);

  // ---- ⑤ Annuler ne coupe rien.
  await cote.locator('.vranesh-cote-annuler').click();
  verifier('Annuler : toujours aucun PATCH', patchs.length === 0, `${patchs.length}`);
  verifier('Annuler : la confirmation se referme',
    await cote.locator('.vranesh-cote-confirmation').evaluate((el) => el.hidden));

  await page.screenshot({ path: `${CAPTURES}/vranesh-choix-branche.png`, fullPage: true });

  // ---- ⑥ Confirmer : le dénouement part, sur CETTE branche, avec le Bearer.
  await choisir.click();
  await page.waitForSelector('#vranesh-parole .vranesh-cote-confirmation:not([hidden])', { timeout: 5000 });
  await cote.locator('.vranesh-confirmer').click();
  await page.waitForTimeout(400);
  verifier('Confirmer : un PATCH /api/situations émis', patchs.length === 1, `${patchs.length}`);
  const corps = JSON.parse((patchs[0] || {}).body || '{}');
  verifier('Le dénouement porte le thème ouvert et la branche CLIQUÉE',
    corps.id === 's1' && corps.scenario_advenu_id === 'sc1', JSON.stringify(corps));
  verifier('Le client ne pose PAS la date de l’advenu (serveur seul)',
    !('advenu_le' in corps), JSON.stringify(corps));
  verifier('Bearer transmis (choix depuis l’arbre)',
    ((patchs[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');

  verifier('Zéro requête externe (choix depuis l’arbre)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (choix depuis l’arbre)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ====== H. Un thème DÉNOUÉ s'ouvre sur son futur, en grand, sans un clic ======
// « Peut-être d'avoir un méga affichage ensuite, ouvrir le futur… comme ça ça
// oriente tout. » Une fois le futur tranché, il n'y a plus rien à comparer : il
// occupe la place, et on ne propose plus de couper mais de rouvrir.
console.log('— H. vranesh.html thème dénoué → le futur advenu occupe la place —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const patchs = [];
  const FIXTURE_DENOUEE = {
    ok: true,
    data: {
      situations: [
        { id: 's1', intitule: 'TRAVERSÉE', contexte: 'un départ à préparer', nb_scenarios: 1,
          a_explorer: false, advenue: true, scenario_advenu_id: 'sc1',
          advenu_le: '2026-07-20T09:00:00Z', created_at: '2026-07-01T10:00:00Z' },
      ],
      scenarios: [
        { id: 'sc1', situation_id: 's1', deroule: 'le vent tourne au nord et porte la voile',
          vraisemblance: 'forte', signaux: null, parade: null },
      ],
      liens: [],
    },
  };
  await page.route('**/api/situations**', (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      patchs.push({ body: req.postData() });
      return route.fulfill({
        status: 200, contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ ok: true, data: { id: 's1', scenario_advenu_id: null, coupees: 0 } }),
      });
    }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_DENOUEE) });
  });
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });
  await page.locator('#vranesh-plateau .cap', { hasText: 'TRAVERSÉE' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });

  const cote = page.locator('#vranesh-parole');
  const texteCote = (await cote.textContent()) || '';

  // Le futur advenu est déplié D'EMBLÉE : aucun survol, aucun clic.
  verifier('Sans un clic : le déroulé du futur advenu est affiché',
    /le vent tourne au nord/.test(texteCote), texteCote);
  verifier('Sans un clic : il est annoncé comme la branche qui a poussé',
    /la branche qui a poussé/.test(texteCote), texteCote);
  verifier('Sans un clic : la date du constat est lisible', /constaté le/.test(texteCote), texteCote);
  verifier('ABSENCE — aucune invitation à survoler sur un thème dénoué',
    !/Survole une branche/.test(texteCote), texteCote);
  verifier('ABSENCE — aucune vraisemblance sur un futur advenu',
    !/vraisemblance/.test(texteCote), texteCote);

  // Le méga affichage : le cartouche et l'arbre passent en registre « dénoué ».
  verifier('Le cartouche passe en affichage majeur',
    await cote.evaluate((el) => el.classList.contains('is-advenu')));
  verifier('L’arbre porte le sceau du dénouement',
    (await page.locator('#vranesh-arbre-sceau').isVisible())
    && /La branche qui a poussé/.test((await page.locator('#vranesh-arbre-sceau').textContent()) || ''));
  const tailles = await page.evaluate(() => ({
    deroule: parseFloat(getComputedStyle(document.querySelector('#vranesh-parole .parole-nom')).fontSize),
    corps: parseFloat(getComputedStyle(document.body).fontSize),
    trait: parseFloat(getComputedStyle(document.querySelector('.vranesh-branche--advenue')).strokeWidth),
  }));
  verifier('Le déroulé advenu est écrit plus grand que le corps de texte',
    tailles.deroule > tailles.corps, JSON.stringify(tailles));
  verifier('La branche advenue est tracée plus épaisse que tout futur hypothétique (2,2)',
    tailles.trait > 2.2, JSON.stringify(tailles));

  // La capture se prend ICI : sur le thème dénoué ouvert, pas après le retour.
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${CAPTURES}/vranesh-futur-advenu.png`, fullPage: true });

  // On ne propose plus de couper — on propose de rouvrir.
  verifier('ABSENCE — plus aucune proposition de couper sur un thème dénoué',
    (await cote.locator('.vranesh-cote-choisir').count()) === 0);
  const rouvrir = cote.locator('.vranesh-cote-rouvrir');
  verifier('Le thème peut être rouvert depuis l’arbre', (await rouvrir.count()) === 1);
  await rouvrir.click();
  await page.waitForTimeout(300);
  verifier('Rouvrir : un PATCH qui remet le futur à NULL (aucune coupe)',
    patchs.length === 1 && JSON.parse(patchs[0].body || '{}').scenario_advenu_id === null,
    JSON.stringify(patchs.map((p) => p.body)));

  // Retour à la rose : le sceau ne survit pas au thème.
  await page.locator('#vranesh-arbre-retour').click();
  verifier('Retour : le sceau du dénouement disparaît',
    await page.locator('#vranesh-arbre-sceau').evaluate((el) => el.hidden));

  // Le futur advenu écrit PLUS GROS : c'est là qu'un débord passerait inaperçu.
  const debordAdvenu = await page.evaluate(() => {
    const svg = document.getElementById('vranesh-arbre-dessin');
    const vb = svg.viewBox.baseVal;
    return Array.from(svg.querySelectorAll('.vranesh-etiquette'))
      .filter((t) => (t.textContent || '').length > 0)
      .map((t) => {
        const b = t.getBBox();
        return { texte: t.textContent, x1: Math.round(b.x), x2: Math.round(b.x + b.width) };
      })
      .filter((e) => e.x1 < vb.x || e.x2 > vb.x + vb.width);
  });
  verifier('L’étiquette agrandie du futur advenu tient dans le cadre (mesuré)',
    debordAdvenu.length === 0, JSON.stringify(debordAdvenu));

  verifier('Zéro erreur console (thème dénoué)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ====== I. PIRE CAS CONSTRUIT : un thème chargé de futurs très longs ======
// Règle de charte (2026-08-01) : une géométrie s'éprouve sur un pire cas
// CONSTRUIT, jamais sur les seules données du jour qui sont un échantillon
// favorable. 6 futurs, déroulés interminables, des deux côtés du tronc.
console.log('— I. vranesh.html arbre chargé → aucune étiquette hors cadre —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const LONG = 'un enchaînement interminable de conséquences qui se déroulent sans jamais rien conclure';
  const FIXTURE_CHARGEE = {
    ok: true,
    data: {
      situations: [
        { id: 's1', intitule: 'PIRE CAS', contexte: null, nb_scenarios: 6, a_explorer: false,
          advenue: false, scenario_advenu_id: null, advenu_le: null, created_at: '2026-07-01T10:00:00Z' },
      ],
      scenarios: Array.from({ length: 6 }, (_, i) => ({
        id: `sc${i + 1}`, situation_id: 's1', deroule: `${LONG} — variante ${i + 1}`,
        vraisemblance: ['faible', 'moyenne', 'forte'][i % 3], signaux: null, parade: null,
      })),
      liens: [],
    },
  };
  await page.route('**/api/situations**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_CHARGEE) }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });
  await page.locator('#vranesh-plateau .cap', { hasText: 'PIRE CAS' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });

  verifier('6 branches tracées', (await page.locator('.vranesh-branche').count()) === 6);
  // La pousse dure ~560 ms + 90 ms de retard par branche : on mesure l'arbre
  // FINI, pas un arbre à mi-course (et la capture montre alors le vrai rendu).
  await page.waitForTimeout(1200);
  const mesures = await page.evaluate(() => {
    const svg = document.getElementById('vranesh-arbre-dessin');
    const vb = svg.viewBox.baseVal;
    const etiquettes = Array.from(svg.querySelectorAll('.vranesh-etiquette'));
    const boites = etiquettes.map((t) => {
      const b = t.getBBox();
      return { texte: t.textContent, x1: b.x, x2: b.x + b.width, y1: b.y, y2: b.y + b.height };
    });
    return {
      ecrites: boites.filter((b) => b.texte.length > 0).length,
      horsCadreX: boites.filter((b) => b.texte.length > 0)
        .filter((b) => b.x1 < vb.x || b.x2 > vb.x + vb.width)
        .map((b) => ({ texte: b.texte, x1: Math.round(b.x1), x2: Math.round(b.x2) })),
      horsCadreY: boites.filter((b) => b.texte.length > 0)
        .filter((b) => b.y1 < vb.y || b.y2 > vb.y + vb.height).length,
      // Le tronc et les branches vivent dans le même cadre : eux aussi se mesurent.
      traitsHorsCadre: Array.from(svg.querySelectorAll('.vranesh-branche, .vranesh-tronc'))
        .map((t) => t.getBBox())
        .filter((b) => b.x < vb.x || b.x + b.width > vb.x + vb.width
          || b.y < vb.y || b.y + b.height > vb.y + vb.height).length,
    };
  });
  verifier('6 futurs très longs : aucune étiquette ne sort du cadre (mesuré)',
    mesures.horsCadreX.length === 0, JSON.stringify(mesures.horsCadreX));
  verifier('6 futurs très longs : aucune étiquette ne sort par le haut ni le bas',
    mesures.horsCadreY === 0, `${mesures.horsCadreY}`);
  verifier('6 futurs très longs : tronc et branches restent dans le cadre',
    mesures.traitsHorsCadre === 0, `${mesures.traitsHorsCadre}`);
  verifier('Chaque branche garde une étiquette lisible (aucune n’est sacrifiée ici)',
    mesures.ecrites === 6, `${mesures.ecrites}/6`);

  verifier('Zéro erreur console (arbre chargé)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/vranesh-arbre-charge.png`, fullPage: true });
  await page.close();
}

// ====== J. LA GREFFE : un thème qui se CONSTRUIT (forme B, 0020) ======
// Dictée Paul (2026-08-04) : « THORIOL n'est pas une direction comme LIANDRA,
// c'est une construction. Le but ne bouge pas, ce sont les moyens qui cassent —
// toujours avoir des plans B, et surtout anticiper l'adaptation : comment faire
// pousser une nouvelle branche, même projet. »
// Prouve : la FORME SUIT LA NATURE (greffe et non arbre), les trois états d'un
// plan se distinguent, la CAUSE d'un plan écarté est rendue, la qualification
// s'écrit avec le bon corps, la cause est effacée quand on quitte « écarté »,
// et un thème « direction » n'est PAS touché.
console.log('— J. vranesh.html → la greffe (thème « construction ») —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const patchsScenario = [];
  const patchsSituation = [];
  const FIXTURE_CONSTRUCTION = {
    ok: true,
    data: {
      situations: [
        { id: 's1', intitule: 'CHANTIER — le premier client', contexte: null, nb_scenarios: 4,
          a_explorer: false, advenue: false, scenario_advenu_id: null, advenu_le: null,
          nature: 'construction', created_at: '2026-07-01T10:00:00Z' },
        { id: 's2', intitule: 'CARREFOUR', contexte: null, nb_scenarios: 1, a_explorer: false,
          advenue: false, scenario_advenu_id: null, advenu_le: null,
          nature: 'direction', created_at: '2026-07-02T10:00:00Z' },
      ],
      scenarios: [
        { id: 'p1', situation_id: 's1', deroule: 'le bouche-à-oreille du réseau', etat: 'tenu', cause: null },
        { id: 'p2', situation_id: 's1', deroule: 'la recommandation d’un pair', etat: 'reserve', cause: null },
        { id: 'p3', situation_id: 's1', deroule: 'la prospection directe', etat: 'ecarte',
          cause: 'trop lente pour la trésorerie' },
        // Un plan NON qualifié : la dégradation doit le traiter en réserve,
        // jamais le faire disparaître du dessin.
        { id: 'p4', situation_id: 's1', deroule: 'le salon professionnel', etat: null, cause: null },
        { id: 'd1', situation_id: 's2', deroule: 'le vent tourne au nord', vraisemblance: 'forte' },
      ],
      liens: [],
    },
  };
  await page.route('**/api/situations**', (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') {
      patchsSituation.push({ body: req.postData() });
      return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ ok: true, data: { id: 's1', nature: 'direction' } }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(FIXTURE_CONSTRUCTION) });
  });
  await page.route('**/api/scenarios**', (route) => {
    const req = route.request();
    if (req.method() === 'PATCH') { patchsScenario.push({ headers: req.headers(), body: req.postData() }); }
    return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: {} }) });
  });
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_SERMENTS) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IMLADRIK) }));

  await page.goto(`${BASE}/vranesh.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#vranesh-plateau .cap', { timeout: 20000 });
  await page.locator('#vranesh-plateau .cap', { hasText: 'CHANTIER' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });

  // ---- La FORME SUIT LA NATURE : une greffe, pas un arbre. ----
  verifier('Le thème qui se construit est dessiné en GREFFE, pas en arbre',
    (await page.locator('.vranesh-tronc-greffe').count()) === 1
    && (await page.locator('.vranesh-tronc').count()) === 0);
  verifier('La terre est là — l’élément du thème',
    (await page.locator('.vranesh-sol').count()) === 1
    && (await page.locator('.vranesh-hachure').count()) > 4);
  verifier('Les racines disent les appuis', (await page.locator('.vranesh-racine').count()) === 6);

  // ---- Les trois états se distinguent par la FORME, pas par la couleur seule. ----
  verifier('La branche qui porte est feuillue',
    (await page.locator('.vranesh-branche--tenue').count()) === 1
    && (await page.locator('.vranesh-feuille').count()) === 3);
  verifier('Le plan non qualifié est traité en réserve (dégradation), jamais perdu',
    (await page.locator('.vranesh-branche--reserve').count()) === 2);
  verifier('Une greffe porte sa ligature — prête, pas encore employée',
    (await page.locator('.vranesh-ligature').count()) === 2);
  verifier('Le plan écarté est un moignon cicatrisé',
    (await page.locator('.vranesh-branche--ecarte').count()) === 1
    && (await page.locator('.vranesh-cicatrice').count()) === 1);

  const dessin = (await page.locator('#vranesh-arbre-dessin').textContent()) || '';
  verifier('La cause du plan écarté est gravée sur le dessin',
    /trop lente/.test(dessin), dessin);
  verifier('ABSENCE — aucune vraisemblance sur un thème qui se construit',
    !/vraisemblance/.test(dessin), dessin);

  // ---- La géométrie se MESURE, elle ne se juge pas à l'œil. ----
  const debords = await page.evaluate(() => {
    const svg = document.getElementById('vranesh-arbre-dessin');
    const vb = svg.viewBox.baseVal;
    return Array.from(svg.querySelectorAll('text'))
      .filter((t) => (t.textContent || '').length > 0)
      .map((t) => {
        const b = t.getBBox();
        return { texte: t.textContent, x1: Math.round(b.x), x2: Math.round(b.x + b.width) };
      })
      .filter((e) => e.x1 < vb.x || e.x2 > vb.x + vb.width);
  });
  verifier('Greffe : aucune étiquette ne déborde du cadre (mesuré)',
    debords.length === 0, JSON.stringify(debords));
  const croisements = await page.evaluate(() => {
    const svg = document.getElementById('vranesh-arbre-dessin');
    const boites = Array.from(svg.querySelectorAll('text'))
      .filter((t) => (t.textContent || '').length > 0)
      .map((t) => t.getBBox());
    let n = 0;
    for (let i = 0; i < boites.length; i += 1) {
      for (let j = i + 1; j < boites.length; j += 1) {
        const a = boites[i], c = boites[j];
        if (a.x < c.x + c.width - 1 && c.x < a.x + a.width - 1
          && a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1) { n += 1; }
      }
    }
    return n;
  });
  verifier('Greffe : aucune étiquette n’en croise une autre (mesuré)',
    croisements === 0, `${croisements} croisement(s)`);

  // ---- Le côté parle en PLANS, pas en futurs probables. ----
  await page.locator('.vranesh-branche-g.is-tenu .vranesh-zone-pleine').first().hover();
  await page.waitForSelector('#vranesh-parole.is-actif', { timeout: 5000 });
  const cote = (await page.locator('#vranesh-parole').textContent()) || '';
  verifier('Côté : on parle de PLAN, et de celui qui porte',
    /plan 1 sur 4/.test(cote) && /le plan tenu/.test(cote), cote);
  verifier('ABSENCE — aucune vraisemblance dans le cartouche d’une construction',
    !/vraisemblance/.test(cote), cote);

  // ---- La cause passe en tête des vignettes au clic. ----
  await page.locator('.vranesh-branche-g.is-ecarte .vranesh-zone-pleine').first().click();
  await page.waitForSelector('.vranesh-branche-g.is-choisie', { timeout: 5000 });
  const natures = await page.locator('#vranesh-parole .vranesh-vignette-quoi').allTextContents();
  verifier('Clic sur un plan écarté : la CAUSE est la première vignette',
    natures[0] === 'Pourquoi ça a cassé', JSON.stringify(natures));

  // ---- La qualification s'écrit, avec le bon corps. ----
  await page.locator('#vranesh-registre-detail summary').click();
  const s1 = page.locator('#vranesh-situation-s1');
  // LE POINT DE SÉCURITÉ DE CETTE BOUCLE : le dénouement SUPPRIME les branches
  // non retenues. Sur une construction, ce sont les PLANS B — c'est-à-dire tout
  // ce que le thème existe pour garder. Il ne doit être offert NULLE PART.
  verifier('ABSENCE — aucune coupe proposée sur un thème qui se construit',
    (await s1.locator('.vranesh-denouement').count()) === 0);
  verifier('ABSENCE — aucune coupe proposée non plus depuis le dessin',
    (await page.locator('#vranesh-parole .vranesh-cote-choisir').count()) === 0);
  verifier('Le registre marque la nature du thème',
    /construction/.test((await s1.locator('.vranesh-nature-marque').textContent()) || ''));
  const qualif = s1.locator('.vranesh-qualif').first();
  verifier('Chaque plan porte son formulaire de qualification',
    (await s1.locator('.vranesh-qualif').count()) === 4);
  verifier('Le champ « cause » est masqué tant que le plan n’est pas écarté',
    await qualif.locator('input[name="cause"]').evaluate((el) => el.hidden));

  await qualif.locator('select').selectOption('ecarte');
  verifier('Choisir « écarté » ouvre le champ de la cause',
    (await qualif.locator('input[name="cause"]').evaluate((el) => el.hidden)) === false);
  await qualif.locator('input[name="cause"]').fill('le carnet ne suffit pas');
  await qualif.locator('button[type="submit"]').click();
  await page.waitForTimeout(250);
  verifier('Qualifier : un PATCH /api/scenarios est émis', patchsScenario.length === 1,
    `${patchsScenario.length}`);
  const corpsQ = JSON.parse((patchsScenario[0] || {}).body || '{}');
  verifier('Corps : le plan, son état et sa cause',
    corpsQ.id === 'p1' && corpsQ.etat === 'ecarte' && corpsQ.cause === 'le carnet ne suffit pas',
    JSON.stringify(corpsQ));
  verifier('Bearer transmis (qualification)',
    ((patchsScenario[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');

  // Quitter « écarté » EFFACE la cause : une cause sur un plan qui porte serait
  // lue de travers pour toujours (et l'API la refuserait).
  const qualif2 = page.locator('#vranesh-situation-s1 .vranesh-qualif').nth(2);
  await qualif2.locator('select').selectOption('tenu');
  await qualif2.locator('button[type="submit"]').click();
  await page.waitForTimeout(250);
  const corpsQ2 = JSON.parse((patchsScenario[1] || {}).body || '{}');
  verifier('Quitter « écarté » efface la cause dans le corps émis',
    corpsQ2.etat === 'tenu' && corpsQ2.cause === null, JSON.stringify(corpsQ2));

  // ---- La nature se change, et ce geste ne supprime rien. ----
  await page.locator('#vranesh-situation-s1 .vranesh-nature').click();
  await page.waitForTimeout(250);
  const corpsN = JSON.parse((patchsSituation[0] || {}).body || '{}');
  verifier('Basculer la nature : un PATCH avec la seule nature',
    corpsN.id === 's1' && corpsN.nature === 'direction' && Object.keys(corpsN).length === 2,
    JSON.stringify(corpsN));
  verifier('ABSENCE — aucun scénario supprimé en changeant de nature',
    !patchsScenario.some((p) => /"deroule"/.test(p.body || '')));

  // ---- Un thème « direction » n'est PAS touché : il garde son arbre. ----
  await page.locator('#vranesh-arbre-retour').click().catch(() => {});
  await page.locator('#vranesh-plateau .cap', { hasText: 'CARREFOUR' }).click();
  await page.waitForSelector('#vranesh-arbre:not([hidden])', { timeout: 5000 });
  verifier('Un thème « direction » garde l’arbre, intact',
    (await page.locator('.vranesh-tronc').count()) === 1
    && (await page.locator('.vranesh-tronc-greffe').count()) === 0);

  verifier('Zéro requête externe (greffe)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (greffe)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/vranesh-greffe.png`, fullPage: true });
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE VRANESH VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
