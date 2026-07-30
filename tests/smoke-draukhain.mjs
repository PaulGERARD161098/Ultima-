// Quadrant DRAUKHAIN (v1) : la carte des serments, la volonté au-delà du possible
// — DERRIÈRE AUTH. Miroir de smoke-zekrom.mjs (DRAUKHAIN ↔ ZEKROM). Prouve :
//   A. draukhain.html SANS session (config vide) : FAIL-CLOSED — aucun serment au
//      DOM, cartouche « Authentification requise », registre caché, retour vers
//      imladrik.html, zéro fuite réseau, zéro erreur console ;
//   B. draukhain.html avec FAUSSE session + /api/serments STUBÉE 200 (fixture
//      NEUTRE inventée) : registre rendu, intitulé/pourquoi/horizon/compte affichés,
//      badge « à raviver » (0 flamme) formulé en INVITATION de Léo, flammes
//      rattachées avec leur nature, vue « mes serments vivants » n'affiche que les
//      serments entretenus, Bearer transmis à l'API (GET + POST serment + POST
//      flamme + DELETE flamme), contrastes AA, zéro CDN ;
//   C. draukhain.html fausse session + 401 → fail-closed propre.
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

// Fixture NEUTRE — AUCUN serment réel de Paul (intitulés inventés pour le harnais).
// Couvre les 2 états : vivant (≥ 1 flamme, natures variées) et « à raviver »
// (0 flamme). a_raviver/nb_flammes viennent de la vue serments_etat ; les flammes
// se rattachent par serment_id.
const FIXTURE = {
  ok: true,
  data: {
    serments: [
      { id: 's1', intitule: 'AURORE', pourquoi: 'tenir la parole donnée', horizon: 'chaque matin', nb_flammes: 3, a_raviver: false, created_at: '2026-07-01T10:00:00Z' },
      { id: 's2', intitule: 'ENCLUME', pourquoi: null, horizon: null, nb_flammes: 0, a_raviver: true, created_at: '2026-07-02T10:00:00Z' },
    ],
    flammes: [
      { id: 'f1', serment_id: 's1', nature: 'citation', texte: 'la volonté au-delà du possible' },
      { id: 'f2', serment_id: 's1', nature: 'victoire', texte: 'j’ai tenu bon tout l’hiver' },
      { id: 'f3', serment_id: 's1', nature: 'rappel', texte: 'ne pas perdre la foi' },
    ],
    // Passerelles v2 : une vers un idéal ZEKROM, une vers une page MINETHNIR
    // (exactement une des deux cibles renseignée par lien).
    liens: [
      { id: 'l1', owner_id: 'o', serment_id: 's1', ideal_id: 'i1', entree_id: null, created_at: '2026-07-04T10:00:00Z' },
      { id: 'l2', owner_id: 'o', serment_id: 's1', ideal_id: null, entree_id: 'e1', created_at: '2026-07-04T11:00:00Z' },
    ],
  },
};

// Cibles NEUTRES inventées pour résoudre les libellés + peupler les pickers.
const FIXTURE_IDEAUX = {
  ok: true,
  data: {
    ideaux: [{ id: 'i1', intitule: 'CONSTANCE', registre: 'volonte' }],
    directions: [],
  },
};
const FIXTURE_PAGES = {
  ok: true,
  data: {
    entrees: [{ id: 'e1', titre: 'Page du matin', contenu: 'texte neutre', created_at: '2026-07-03T08:00:00Z' }],
  },
};

// Stub minimal de la Web Speech API (absente en headless) : suffit à prouver
// que le micro s'installe et qu'une transcription atterrit dans le champ.
// Le cycle complet de la dictée est couvert par smoke-dictee.mjs.
function stubSpeechRecognition() {
  window.__stubReco = { instances: [] };
  class FauxSpeechRecognition {
    constructor() {
      this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null;
      window.__stubReco.instances.push(this);
    }
    start() { setTimeout(() => { if (this.onstart) this.onstart(); }, 0); }
    stop() { setTimeout(() => { if (this.onend) this.onend(); }, 0); }
    abort() { setTimeout(() => { if (this.onend) this.onend(); }, 0); }
    emettre(texte) {
      const segment = [{ transcript: texte }];
      segment.isFinal = true;
      if (this.onresult) this.onresult({ resultIndex: 0, results: [segment] });
    }
  }
  window.SpeechRecognition = FauxSpeechRecognition;
}

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
console.log('— A. draukhain.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-auth:not([hidden])', { timeout: 20000 });

  const auth = (await page.locator('#draukhain-auth').textContent()) || '';
  verifier('Cartouche « Authentification requise »', /Authentification requise/.test(auth));
  verifier('Lien de connexion présent',
    (await page.locator('#draukhain-auth a.retour-console').count()) === 1);
  verifier('Registre caché', await page.locator('#draukhain-registre').evaluate((el) => el.hidden));
  verifier('Aucun serment dans le DOM', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('Chargement effacé (état auth seul visible)',
    await page.locator('#draukhain-chargement').evaluate((el) => el.hidden));
  verifier('Retour vers la cartographie IMLADRIK',
    (await page.locator('.retour a[href="imladrik.html"]').count()) === 1);

  // Contrastes AA sur l'écran réellement rendu.
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      titre: getComputedStyle(document.querySelector('#draukhain-auth h2')).color,
      texte: getComputedStyle(document.querySelector('#draukhain-auth p')).color,
      mission: getComputedStyle(document.querySelector('.quadrant-mission')).color,
    };
  });
  verifier('Contraste titre auth ≥ 4,5:1', ratio(versHex(c.titre), c.parchemin) >= 4.5);
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Contraste mission sur mer ≥ 4,5:1', ratio(versHex(c.mission), c.merProfonde) >= 4.5);

  const hLien = await page.locator('#draukhain-auth .retour-console').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target lien connexion ≥ 44 px', hLien >= 44, `${hLien}px`);

  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-sans-session.png`, fullPage: true });
  await page.close();
}

// ===================== B. Fixture 200 : registre + à raviver + vivants =====================
console.log('— B. draukhain.html fixture 200 → registre, à raviver, serments vivants, Bearer —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const appelsGet = [];
  const postsSerment = [];
  const postsFlamme = [];
  const deletesFlamme = [];
  await page.route('**/api/serments**', (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      appelsGet.push(req.headers());
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(FIXTURE),
      });
    }
    if (req.method() === 'POST') { postsSerment.push(req.headers()); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'nouveau' } }),
    });
  });
  await page.route('**/api/flammes**', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { postsFlamme.push(req.headers()); }
    if (req.method() === 'DELETE') { deletesFlamme.push(req.headers()); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'f-cible' } }),
    });
  });
  // Cibles des passerelles (résolution des libellés + pickers).
  await page.route('**/api/ideaux**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));
  // Écritures de passerelles : POST (relier) + DELETE (détacher).
  const postsLien = [];
  const deletesLien = [];
  await page.route('**/api/serment-liens**', (route) => {
    const req = route.request();
    if (req.method() === 'POST') { postsLien.push({ headers: req.headers(), corps: req.postDataJSON() }); }
    if (req.method() === 'DELETE') { deletesLien.push({ headers: req.headers(), corps: req.postDataJSON() }); }
    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'lien-cible' } }),
    });
  });

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-registre:not([hidden])', { timeout: 20000 });

  // 1. Bearer transmis au GET.
  verifier('Un appel GET /api/serments au moins', appelsGet.length >= 1, `${appelsGet.length}`);
  const autorisation = (appelsGet[0] || {}).authorization || '';
  verifier('Bearer de la session transmis (GET)', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);

  // 2. Toute la carte : 2 serments rendus.
  verifier('2 serments rendus (toute la carte)', (await page.locator('.zekrom-ideal').count()) === 2);
  const noms = (await page.locator('.zekrom-ideal-intitule').allTextContents()).map((t) => t.trim());
  for (const attendu of ['AURORE', 'ENCLUME']) {
    verifier(`Serment ${attendu} présent`, noms.includes(attendu));
  }

  // 3. Pourquoi + horizon + compte de flammes rendus (serment vivant).
  const s1 = page.locator('#draukhain-serment-s1');
  verifier('Pourquoi rendu (AURORE)', /tenir la parole donnée/.test((await s1.textContent()) || ''));
  verifier('Horizon rendu (AURORE)', /chaque matin/.test((await s1.textContent()) || ''));
  verifier('Compte de flammes affiché (AURORE = 3 flammes)',
    /3 flammes/.test((await s1.locator('.zekrom-registre').first().textContent()) || ''));

  // 4. Flammes rattachées + natures variées.
  verifier('AURORE : 3 flammes listées', (await s1.locator('.zekrom-direction').count()) === 3);
  verifier('Flamme rendue depuis l’API', /volonté au-delà du possible/.test((await s1.textContent()) || ''));
  const naturesS1 = (await s1.locator('.zekrom-direction .zekrom-registre').allTextContents()).map((t) => t.trim());
  verifier('Natures variées (citation/victoire/rappel)',
    ['citation', 'victoire', 'rappel'].every((n) => naturesS1.includes(n)), JSON.stringify(naturesS1));
  verifier('Bouton « retirer » sur chaque flamme',
    (await s1.locator('.zekrom-direction .zekrom-retro-detacher').count()) === 3);

  // 4bis. Passerelles v2 : liens résolus en libellé (idéal ZEKROM / page MINETHNIR).
  const passerelles1 = s1.locator('.zekrom-retro');
  verifier('Section « Passerelles » sur AURORE', (await passerelles1.count()) === 1);
  verifier('En-tête « Passerelles » présent',
    /Passerelles/.test((await passerelles1.locator('.zekrom-retro-entete').textContent()) || ''));
  const libellesLiens = (await s1.locator('.zekrom-retro-item .zekrom-retro-talent').allTextContents()).map((t) => t.trim());
  verifier('AURORE : 2 passerelles listées', libellesLiens.length === 2, JSON.stringify(libellesLiens));
  verifier('Passerelle idéal résolue (« Idéal : CONSTANCE »)', libellesLiens.includes('Idéal : CONSTANCE'), JSON.stringify(libellesLiens));
  verifier('Passerelle page résolue (« Page : Page du matin »)', libellesLiens.includes('Page : Page du matin'), JSON.stringify(libellesLiens));
  verifier('Bouton « détacher » sur chaque passerelle',
    (await s1.locator('.zekrom-retro-item .zekrom-retro-detacher').count()) === 2);
  verifier('Picker d’ajout de passerelle (2 sélecteurs : type + cible)',
    (await s1.locator('.zekrom-retro-form select').count()) === 2);
  verifier('Picker type : Idéal + Page',
    (await s1.locator('.zekrom-retro-form select[name="type"] option').count()) === 2);
  // Le serment « à raviver » (ENCLUME) porte aussi une section passerelles (vide).
  verifier('ENCLUME : section passerelles présente (état vide)',
    (await page.locator('#draukhain-serment-s2 .zekrom-retro .zekrom-retro-vide').count()) === 1);

  // 5. « à raviver » : le cœur DRAUKHAIN, présenté en INVITATION positive.
  const s2 = page.locator('#draukhain-serment-s2');
  verifier('« à raviver » : un seul badge sur toute la carte (ENCLUME 0 flamme)',
    (await page.locator('.zekrom-aorienter').count()) === 1);
  verifier('ENCLUME porte le badge « à raviver »', (await s2.locator('.zekrom-aorienter').count()) === 1);
  const invite = (await s2.locator('.zekrom-invite').textContent()) || '';
  verifier('Invitation positive de Léo (« Ravive la foi »)', /Ravive la foi/.test(invite));
  verifier('Invitation NON culpabilisante (aucun terme de reproche)',
    !/(échec|défaut|manqu|oubli|reproche|abandon)/i.test(invite), invite);
  verifier('ENCLUME : aucune flamme listée', (await s2.locator('.zekrom-direction').count()) === 0);
  verifier('Formulaire d’ajout de flamme sur chaque serment',
    (await page.locator('.zekrom-direction-form').count()) === 2);
  verifier('Formulaire de flamme : sélecteur de nature',
    (await s2.locator('.zekrom-direction-form select[name="nature"]').count()) === 1);

  // 5bis. LA VOIE JALONNÉE (forme A, 2026-07-30) : le cheminement du serment.
  // Règle cardinale de la forme : jamais de ligne d'arrivée — la route sort de
  // la carte (queue) et l'horizon reste « devant ».
  verifier('Une voie par serment', (await page.locator('.voie').count()) === 2);
  const bornes1 = s1.locator('.borne');
  // AURORE : départ + 3 flammes (la dernière = « tu es ici ») + horizon = 5 bornes.
  verifier('AURORE : 5 bornes (départ + 3 flammes + horizon)',
    (await bornes1.count()) === 5, `${await bornes1.count()}`);
  verifier('AURORE : un seul « tu es ici »', (await s1.locator('.borne--ici').count()) === 1);
  verifier('AURORE : le « tu es ici » est la dernière flamme, pas l’horizon',
    /Tu es ici/.test((await bornes1.nth(3).textContent()) || ''));
  verifier('AURORE : 3 bornes franchies (départ + 2 flammes)',
    (await s1.locator('.borne--franchie').count()) === 3);
  verifier('AURORE : horizon rendu depuis le serment (« chaque matin »)',
    /chaque matin/.test((await s1.locator('.borne--horizon').textContent()) || ''));
  verifier('AURORE : l’horizon reste devant (jamais franchi)',
    (await s1.locator('.borne--horizon.borne--devant').count()) === 1);
  verifier('AURORE : « la route continue » gravé à l’horizon',
    /la route continue/.test((await s1.locator('.borne--horizon').textContent()) || ''));
  // ENCLUME (0 flamme) : on se tient AU DÉPART, « à raviver » est la borne devant.
  const bornes2 = s2.locator('.borne');
  verifier('ENCLUME : 3 bornes (départ + à raviver + horizon)',
    (await bornes2.count()) === 3, `${await bornes2.count()}`);
  verifier('ENCLUME : « tu es ici » posé sur le départ',
    /Le serment prêté/.test((await s2.locator('.borne--ici').textContent()) || ''));
  verifier('ENCLUME : « À raviver » est la borne devant soi',
    /À raviver/.test((await s2.locator('.borne--devant').first().textContent()) || ''));
  // Le tracé : décor muet, part parcourue proportionnelle, queue toujours là.
  const voie1 = s1.locator('.voie-route');
  verifier('Tracé SVG muet (aria-hidden)', (await voie1.getAttribute('aria-hidden')) === 'true');
  verifier('Liste des bornes annoncée au lecteur d’écran',
    /cheminement/i.test((await s1.locator('.voie-bornes').getAttribute('aria-label')) || ''));
  const parcourue = await s1.locator('.route-faite').getAttribute('stroke-dasharray');
  verifier('AURORE : part parcourue = 3 bornes sur 4 intervalles (75 %)',
    parcourue === '75.0 100', `lu: ${parcourue}`);
  verifier('La route sort de la carte (queue présente sur chaque voie)',
    (await page.locator('.route-queue').count()) === 2);
  verifier('Aucune barre de progression ni pourcentage affiché',
    !/%/.test((await page.locator('#draukhain-serments').textContent()) || ''));

  await page.screenshot({ path: `${CAPTURES}/draukhain-carte.png`, fullPage: true });

  // 6. Vue « mes serments vivants » : uniquement les serments entretenus (a_raviver=false).
  await page.locator('#draukhain-vue-vivants').click();
  await page.waitForTimeout(150);
  verifier('Serments vivants : 1 serment entretenu', (await page.locator('.zekrom-ideal').count()) === 1);
  verifier('Serments vivants : le serment « à raviver » est masqué',
    (await page.locator('#draukhain-serment-s2').count()) === 0);
  verifier('Serments vivants : aucun badge « à raviver »', (await page.locator('.zekrom-aorienter').count()) === 0);
  verifier('Bascule vivants : bouton pressé', (await page.locator('#draukhain-vue-vivants').getAttribute('aria-pressed')) === 'true');

  // Retour à tous les serments.
  await page.locator('#draukhain-vue-tous').click();
  await page.waitForTimeout(150);
  verifier('Retour toute la carte : 2 serments', (await page.locator('.zekrom-ideal').count()) === 2);

  await page.screenshot({ path: `${CAPTURES}/draukhain-vivants.png`, fullPage: true });

  // 7. Filtre PUR exposé pour le harnais.
  const filtre = await page.evaluate((fx) => {
    const s = fx.data.serments;
    return {
      tous: window.UltimaDraukhain.sermentsVisibles(s, 'tous').length,
      vivants: window.UltimaDraukhain.sermentsVisibles(s, 'vivants').length,
    };
  }, FIXTURE);
  verifier('sermentsVisibles pur : tous=2, vivants=1', filtre.tous === 2 && filtre.vivants === 1, JSON.stringify(filtre));

  // 8. Écritures authentifiées : POST serment + POST flamme + DELETE flamme portent le Bearer.
  await page.locator('#draukhain-intitule').fill('VIGIE-TEST');
  await page.locator('#draukhain-form-serment button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/serments émis', postsSerment.length >= 1, `${postsSerment.length}`);
  verifier('Bearer transmis (POST serment)',
    ((postsSerment[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  const formFlamme = page.locator('#draukhain-serment-s1 .zekrom-direction-form');
  await formFlamme.locator('input[name="texte"]').fill('un rappel de test');
  await formFlamme.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/flammes émis', postsFlamme.length >= 1, `${postsFlamme.length}`);
  verifier('Bearer transmis (POST flamme)',
    ((postsFlamme[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  await page.locator('#draukhain-serment-s1 .zekrom-direction .zekrom-retro-detacher').first().click();
  await page.waitForTimeout(200);
  verifier('DELETE /api/flammes émis', deletesFlamme.length >= 1, `${deletesFlamme.length}`);
  verifier('Bearer transmis (DELETE flamme)',
    ((deletesFlamme[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  // 8bis. Passerelles v2 : relier un idéal, relier une page, détacher.
  const formLien = page.locator('#draukhain-serment-s1 .zekrom-retro-form');
  // Type par défaut = Idéal → cible par défaut = i1 (CONSTANCE).
  await formLien.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/serment-liens émis (idéal)', postsLien.length >= 1, `${postsLien.length}`);
  verifier('Bearer transmis (POST lien idéal)',
    ((postsLien[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');
  verifier('Corps POST lien idéal { serment_id, ideal_id }',
    JSON.stringify((postsLien[0] || {}).corps) === JSON.stringify({ serment_id: 's1', ideal_id: 'i1' }),
    JSON.stringify((postsLien[0] || {}).corps));

  // Basculer le type sur Page → cible = e1, puis relier.
  const formLien2 = page.locator('#draukhain-serment-s1 .zekrom-retro-form');
  await formLien2.locator('select[name="type"]').selectOption('page');
  await page.waitForTimeout(50);
  await formLien2.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/serment-liens émis (page)', postsLien.length >= 2, `${postsLien.length}`);
  verifier('Corps POST lien page { serment_id, entree_id }',
    JSON.stringify((postsLien[1] || {}).corps) === JSON.stringify({ serment_id: 's1', entree_id: 'e1' }),
    JSON.stringify((postsLien[1] || {}).corps));

  // Détacher la première passerelle (l1, vers l'idéal).
  await page.locator('#draukhain-serment-s1 .zekrom-retro-item .zekrom-retro-detacher').first().click();
  await page.waitForTimeout(200);
  verifier('DELETE /api/serment-liens émis', deletesLien.length >= 1, `${deletesLien.length}`);
  verifier('Bearer transmis (DELETE lien)',
    ((deletesLien[0] || {}).headers || {}).authorization === 'Bearer jeton-de-test');
  verifier('Corps DELETE lien { id: l1 }',
    JSON.stringify((deletesLien[0] || {}).corps) === JSON.stringify({ id: 'l1' }),
    JSON.stringify((deletesLien[0] || {}).corps));

  // 9. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
      parcheminOmbre: cs.getPropertyValue('--parchemin-ombre').trim(),
      intitule: getComputedStyle(document.querySelector('.zekrom-ideal-intitule')).color,
      registre: getComputedStyle(document.querySelector('.zekrom-registre')).color,
      flamme: getComputedStyle(document.querySelector('.zekrom-direction')).color,
    };
  });
  for (const [nom, couleur, fond] of [
    ['intitulé de serment', cr.intitule, cr.parcheminCarte],
    ['étiquette de nature', cr.registre, cr.parcheminOmbre],
    ['texte de flamme', cr.flamme, cr.parcheminCarte],
  ]) {
    const r = ratio(versHex(couleur), fond);
    verifier(`Contraste ${nom} ≥ 4,5:1`, r >= 4.5, `${r.toFixed(2)}:1`);
  }

  verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fixture)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. 401 : fail-closed =====================
console.log('— C. draukhain.html fausse session → 401 fail-closed —');
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appelsGet = [];
  await page.route('**/api/serments**', (route) => {
    appelsGet.push(route.request().headers());
    return route.fulfill({
      status: 401,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
    });
  });
  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-auth:not([hidden])', { timeout: 20000 });

  verifier('Un appel GET /api/serments (et un seul)', appelsGet.length === 1, `${appelsGet.length}`);
  const autorisation = (appelsGet[0] || {}).authorization || '';
  verifier('Bearer de la session transmis', autorisation === 'Bearer jeton-de-test', `lu: ${autorisation}`);
  verifier('401 → fail-closed (cartouche auth)',
    /Authentification requise/.test((await page.locator('#draukhain-auth').textContent()) || ''));
  verifier('401 → aucun serment rendu', (await page.locator('.zekrom-ideal').count()) === 0);
  verifier('401 → registre caché', await page.locator('#draukhain-registre').evaluate((el) => el.hidden));
  const erreursApp = erreurs.filter((e) => !/Failed to load resource.*401/.test(e));
  verifier('Zéro erreur console applicative (401)', erreursApp.length === 0, erreursApp.slice(0, 3).join(' | '));
  await page.close();
}

// ============ D. Le cartouche de Léo + ses MAINS sur le cap (boucle ④) ============
// Prouve : le cartouche s'ouvre à l'entrée du quadrant (marqueur de session PAR
// quadrant), il ne dit que des COMPTES (§5 : jamais un intitulé, jamais un
// contenu), la zone « Parler à Léo » est branchée avec le Bearer, et la
// proposition d'action de Léo n'écrit RIEN avant confirmation explicite de Paul.
console.log('— D. draukhain.html : cartouche de Léo + mains sur IMLADRIK —');
{
  const { page, erreurs } = await nouvellePage();
  // Fausse session SANS le marqueur : on veut le cartouche.
  await page.addInitScript(`try {
    window.localStorage.setItem('sb-${REF_SUPABASE}-auth-token', JSON.stringify({
      access_token: 'jeton-de-test', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r',
      user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
    }));
  } catch (e) {}`);
  await page.addInitScript(stubSpeechRecognition);
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE),
  }));
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX),
  }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES),
  }));

  // La voix de Léo : une proposition d'outil, jamais exécutée par le serveur.
  const appelsLeo = [];
  await page.route('**/api/leo**', (route) => {
    appelsLeo.push({ headers: route.request().headers(), corps: route.request().postData() });
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        ok: true,
        data: {
          reponse: 'Je te propose de raviver ce serment.',
          proposition: {
            outil: 'proposer_flamme',
            args: { serment_ref: 'AURORE', texte: 'tenu bon', nature: 'victoire' },
            reformulation: 'Raviver le serment « AURORE » d’une flamme (victoire) : « tenu bon »',
          },
        },
      }),
    });
  });
  // Toute écriture de flamme est comptée : elle ne doit partir QU'après confirmation.
  const ecrituresFlamme = [];
  await page.route('**/api/flammes**', (route) => {
    ecrituresFlamme.push({ methode: route.request().method(), headers: route.request().headers() });
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ok: true, data: { id: 'f-neuve' } }),
    });
  });

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#leo-cartouche', { timeout: 20000 });

  // 1. Le cartouche : comptes seulement, aucune donnée intime.
  const cartouche = (await page.locator('#leo-cartouche').textContent()) || '';
  verifier('Cartouche de Léo ouvert sur DRAUKHAIN', (await page.locator('#leo-cartouche').count()) === 1);
  verifier('État en COMPTES (2 serments, 1 à raviver)',
    /2 serments scellés/.test(cartouche) && /1 attend/.test(cartouche), cartouche.slice(0, 200));
  verifier('§5 : aucun intitulé de serment dans le cartouche',
    !/AURORE|ENCLUME/.test(cartouche));
  verifier('§5 : aucun contenu de flamme dans le cartouche',
    !/volonté au-delà du possible|tenu bon tout/.test(cartouche));
  verifier('Zone « Parler à Léo » présente', (await page.locator('.leo-voix-champ').count()) === 1);

  // 1bis. Le micro (composant partagé js/dictee.js) : Paul dicte, il n'écrit pas.
  const micro = page.locator('.leo-voix-formulaire .bouton-micro');
  verifier('Micro adjoint au champ de Léo', (await micro.count()) === 1);
  const tailleMicro = await micro.evaluate((el) => el.getBoundingClientRect());
  verifier('Tap target micro ≥ 44 px',
    tailleMicro.width >= 44 && tailleMicro.height >= 44,
    `${tailleMicro.width}×${tailleMicro.height}`);
  verifier('Micro annoncé au lecteur d’écran',
    /Dicter/.test((await micro.getAttribute('aria-label')) || ''));
  await micro.click();
  await page.waitForTimeout(60);
  await page.evaluate(() => {
    const i = window.__stubReco.instances;
    i[i.length - 1].emettre('ravive AURORE : tenu bon');
    i[i.length - 1].stop();
  });
  await page.waitForTimeout(120);
  verifier('La dictée atterrit dans le champ de Léo',
    /ravive AURORE/.test(await page.locator('.leo-voix-champ').inputValue()));

  // 2. La dictée part vers /api/leo avec le Bearer et le bon quadrant.
  await page.locator('.leo-voix-envoyer').click();
  await page.waitForSelector('.leo-carte-action', { timeout: 20000 });
  verifier('Un appel POST /api/leo', appelsLeo.length === 1, `${appelsLeo.length}`);
  verifier('Bearer transmis à Léo',
    (appelsLeo[0] || {}).headers.authorization === 'Bearer jeton-de-test');
  verifier('Quadrant « imladrik » transmis', /"quadrant"\s*:\s*"imladrik"/.test((appelsLeo[0] || {}).corps || ''));

  // 3. La carte de confirmation : le texte DÉTERMINISTE du serveur, et RIEN d'écrit.
  const carte = (await page.locator('.leo-carte-action').textContent()) || '';
  verifier('Carte de confirmation = reformulation serveur',
    /Raviver le serment « AURORE » d’une flamme \(victoire\)/.test(carte), carte.slice(0, 160));
  verifier('AUCUNE écriture avant confirmation', ecrituresFlamme.length === 0,
    JSON.stringify(ecrituresFlamme));

  // 4. Confirmation → l'écriture part, avec le Bearer, vers l'API existante.
  await page.locator('.leo-carte-confirmer').click();
  await page.waitForTimeout(300);
  verifier('Après confirmation : une écriture de flamme', ecrituresFlamme.length === 1,
    JSON.stringify(ecrituresFlamme));
  verifier('Écriture en POST', (ecrituresFlamme[0] || {}).methode === 'POST');
  verifier('Bearer transmis à l’écriture',
    (ecrituresFlamme[0] || {}).headers.authorization === 'Bearer jeton-de-test');

  verifier('Zéro erreur console (cartouche)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-leo-mains.png`, fullPage: true });
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE DRAUKHAIN VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
