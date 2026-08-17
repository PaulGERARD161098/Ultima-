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
      // Une victoire PORTE sa date (0020) : c'est ce qui l'étaye.
      { id: 'f2', serment_id: 's1', nature: 'victoire', texte: 'j’ai tenu bon tout l’hiver', survenu_le: '2026-07-15' },
      { id: 'f3', serment_id: 's1', nature: 'rappel', texte: 'ne pas perdre la foi' },
    ],
    // Passerelles v2 : une vers un idéal ZEKROM, une vers une page MAEDRETHNIR
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
    if (req.method() === 'POST') {
      postsFlamme.push(Object.assign({}, req.headers(), { corps: req.postData() || '' }));
    }
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
  // Le registre détaillé est REPLIÉ depuis le foyer (2026-08-01) : on l'ouvre,
  // cette section exerce l'écriture.
  await page.locator('#draukhain-registre-detail summary').click();

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

  // 4bis. Passerelles v2 : liens résolus en libellé (idéal ZEKROM / page MAEDRETHNIR).
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
  // « Sceller un serment » est REPLIÉ depuis la voûte (2026-08-04) : on arrive
  // sur DRAUKHAIN pour VOIR, pas pour remplir. On l'ouvre pour écrire.
  await page.locator('summary#draukhain-titre-saisie').click();
  await page.locator('#draukhain-intitule').fill('VIGIE-TEST');
  await page.locator('#draukhain-form-serment button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/serments émis', postsSerment.length >= 1, `${postsSerment.length}`);
  verifier('Bearer transmis (POST serment)',
    ((postsSerment[0] || {}).authorization || '') === 'Bearer jeton-de-test');

  // 7ter. La date de la flamme se LIT — en français, et seulement là où elle
  // existe. Une fonction qu'on ne rencontre pas n'existe pas (leçon 2026-08-04).
  const flammesTexte = (await page.locator('#draukhain-serment-s1').textContent()) || '';
  verifier('La date de la victoire se lit, en français',
    /15\/07\/2026/.test(flammesTexte), flammesTexte.slice(0, 200));
  const datesAffichees = await page.locator('#draukhain-serment-s1 .zekrom-direction .zekrom-retro-note').count();
  verifier('ABSENCE — les flammes sans date n’en affichent aucune',
    datesAffichees === 1, `${datesAffichees}`);

  const formFlamme = page.locator('#draukhain-serment-s1 .zekrom-direction-form');
  await formFlamme.locator('input[name="texte"]').fill('un rappel de test');
  await formFlamme.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  verifier('POST /api/flammes émis', postsFlamme.length >= 1, `${postsFlamme.length}`);
  verifier('Bearer transmis (POST flamme)',
    ((postsFlamme[0] || {}).authorization || '') === 'Bearer jeton-de-test');
  // Sans date saisie, la clé ne part PAS : le contrat d'API refuse les champs
  // inconnus, pas les absents — on n'envoie donc jamais du vide « au cas où ».
  verifier('ABSENCE — aucune date envoyée quand le champ est vide',
    !/survenu_le/.test((postsFlamme[0] || {}).corps || ''), (postsFlamme[0] || {}).corps);

  // 8ter. LA DATE DE CE QUE LA FLAMME RACONTE (0020, dictée Paul 2026-08-04 :
  // « on peut associer une date, une petite histoire, histoire d'étayer »).
  const champDate = formFlamme.locator('input[name="survenu_le"]');
  verifier('Le formulaire de flamme porte un champ de date',
    (await champDate.count()) === 1);
  verifier('La date est OPTIONNELLE (jamais requise)',
    (await champDate.evaluate((el) => el.required)) === false);
  // `max` = aujourd'hui : une flamme raconte ce qui a EU lieu. Garde de confort
  // — le serveur revérifie, un attribut ne protège rien.
  const aujourdhui = new Date().toISOString().slice(0, 10);
  verifier('La date ne se saisit pas dans le futur (max = aujourd’hui)',
    (await champDate.getAttribute('max')) === aujourdhui,
    `${await champDate.getAttribute('max')}`);
  verifier('Tap target du champ de date ≥ 44 px',
    (await champDate.evaluate((el) => el.getBoundingClientRect().height)) >= 44);

  await formFlamme.locator('input[name="texte"]').fill('la fois où j’ai tenu bon');
  await champDate.fill('2026-08-01');
  await formFlamme.locator('button[type="submit"]').click();
  await page.waitForTimeout(200);
  const corpsDate = (postsFlamme[postsFlamme.length - 1] || {}).corps || '';
  verifier('La date part avec la flamme', /"survenu_le":"2026-08-01"/.test(corpsDate), corpsDate);

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
// ============ E. LE FOYER DES SERMENTS (forme A, 2026-08-01) ============
// « Sortir de la fiche textuelle statique : un affichage progressif, dynamique,
// évolutif. » Le serment est un FEU : sa flamme au centre, les flammes posées
// autour, un halo dont l'éclat croît avec leur nombre. Grammaire de VRANESH :
// les noms d'abord, un clic déploie un serment, survol = une ligne, clic = tout.
// Ce qui se prouve ici est autant ce qui s'affiche que ce qui NE s'affiche PAS.
console.log('— E. draukhain.html → le foyer des serments —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE),
  }));
  await page.route('**/api/flammes**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ ok: true, data: {} }),
  }));
  // Cibles des passerelles : sans elles la page émet des 404 (bruit de harnais,
  // pas un défaut produit).
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-voute-dessin .voute-feu', { timeout: 20000 });

  // ---- ① Les serments : les noms, rien d'autre. C'est la VOÛTE qui les
  //      désigne depuis le 2026-08-04 — le foyer n'a plus sa propre rangée.
  const noms = (await page.locator('#draukhain-voute-dessin .voute-nom').allTextContents())
    .filter((n) => n.length > 0);
  verifier('Voûte : un feu par serment',
    (await page.locator('.voute-feu').count()) === 2, JSON.stringify(noms));
  verifier('Voûte : l’étiquette porte le NOM SEUL',
    noms.every((n) => !/\s+[—–-]\s+/.test(n)), JSON.stringify(noms));
  verifier('Voûte : aucun foyer allumé à l’arrivée',
    (await page.locator('.foyer-flamme-g').count()) === 0);
  verifier('Foyer : le retour n’apparaît qu’une fois un serment ouvert',
    await page.locator('#draukhain-foyer-retour').evaluate((el) => el.hidden));

  // Le registre détaillé est replié : plus de mur de texte à l'arrivée.
  verifier('Foyer : le registre détaillé est replié par défaut',
    (await page.locator('#draukhain-registre-detail').evaluate((el) => el.open)) === false);
  verifier('ABSENCE — aucun texte de flamme visible à l’arrivée',
    !(await page.locator('#draukhain-serments').isVisible()));

  // ---- ② Le clic allume le foyer. ----
  const premier = page.locator('.voute-feu').first();
  const nomPremier = 'AURORE';   // fixture : le premier serment de la voûte
  await premier.click();
  await page.waitForSelector('.foyer-flamme-g', { timeout: 5000 });
  verifier('Voûte : le feu ouvert reste marqué',
    (await premier.getAttribute('aria-pressed')) === 'true');
  verifier('Foyer : le nom du serment est gravé sous le foyer',
    (await page.locator('#draukhain-foyer-nom').textContent()) === nomPremier);
  verifier('Foyer : une flamme AU CENTRE (consigne de Paul)',
    (await page.locator('.foyer-flamme-centre').count()) === 1);
  verifier('Foyer : le cercle du foyer est allumé, pas en braise',
    (await page.locator('.foyer-cercle').count()) === 1
    && (await page.locator('.foyer-cercle--braise').count()) === 0);
  verifier('Foyer : un halo est posé quand des flammes brûlent',
    (await page.locator('.foyer-halo').count()) === 1);
  const nbFlammes = await page.locator('.foyer-flamme-g').count();
  verifier('Foyer : une flamme qui gravite par flamme posée', nbFlammes >= 1, `${nbFlammes}`);
  const etiquettes = await page.locator('.foyer-etiquette').allTextContents();
  verifier('Foyer : chaque flamme porte une étiquette COURTE (≤ 23 signes)',
    etiquettes.length === nbFlammes && etiquettes.every((e) => e.length <= 23),
    JSON.stringify(etiquettes));

  // Le halo n'est PAS opaque : l'éclat calculé ne doit pas être écrasé par une
  // animation d'apparition (piège relevé en preview).
  const opacite = await page.locator('.foyer-halo').evaluate((el) =>
    parseFloat(getComputedStyle(el).opacity));
  verifier('Foyer : le halo reste une lueur, jamais un aplat',
    opacite > 0 && opacite <= 0.2, String(opacite));

  // ---- ③ Survol : UNE LIGNE. Clic : TOUT. ----
  await page.locator('.foyer-zone').first().hover();
  await page.waitForSelector('.foyer-flamme-g.is-actif', { timeout: 5000 });
  const survol = (await page.locator('#draukhain-foyer-cote').textContent()) || '';
  verifier('Survol : le côté nomme la flamme et son rang', /flamme 1 sur/.test(survol), survol);
  verifier('Survol : la nature est écrite, pas seulement dessinée',
    /citation|victoire|rappel/.test(survol), survol);
  verifier('ABSENCE — le pourquoi du serment ne sort PAS au simple survol',
    !/Pourquoi ce serment/.test(survol), survol);
  verifier('Survol : une seule flamme s’illumine',
    (await page.locator('.foyer-flamme-g.is-actif').count()) === 1);

  await page.locator('.foyer-zone').first().click();
  await page.waitForSelector('.foyer-flamme-g.is-choisie', { timeout: 5000 });
  const detail = (await page.locator('#draukhain-foyer-cote').textContent()) || '';
  verifier('Clic : le serment entier se déplie', /Pourquoi ce serment|Horizon|Passerelles/.test(detail), detail);
  verifier('Clic : un lien mène au registre de ce serment',
    (await page.locator('#draukhain-foyer-cote a[href^="#draukhain-serment-"]').count()) === 1);

  // ---- Le retour. ----
  await page.locator('#draukhain-foyer-retour').click();
  verifier('Retour : le foyer s’éteint', (await page.locator('.foyer-flamme-g').count()) === 0);
  verifier('Retour : aucun feu n’est plus marqué sur la voûte',
    (await page.locator('.voute-feu[aria-pressed="true"]').count()) === 0);

  // ---- Un serment « à raviver » : braise, invitation, jamais reproche. ----
  const aRaviver = page.locator('.voute-feu[aria-label*="à raviver"]');
  if ((await aRaviver.count()) > 0) {
    await aRaviver.first().click();
    await page.waitForSelector('.foyer-cercle--braise', { timeout: 5000 });
    verifier('À raviver : le foyer est une braise en pointillé',
      (await page.locator('.foyer-cercle--braise').count()) === 1);
    verifier('À raviver : la flamme centrale reste dessinée, jamais éteinte',
      (await page.locator('.foyer-flamme-centre--braise').count()) === 1);
    verifier('À raviver : aucun halo (rien ne l’entretient encore)',
      (await page.locator('.foyer-halo').count()) === 0);
    const braise = (await page.locator('#draukhain-foyer-dessin').textContent() || '')
      + (await page.locator('#draukhain-foyer-cote').textContent() || '');
    verifier('À raviver : une invitation (« un souffle »)', /souffle/.test(braise), braise);
    verifier('À raviver : aucun vocabulaire de reproche',
      !/manqu|retard|néglig|oubli|devrais|faute|échec/i.test(braise), braise);
    await page.locator('#draukhain-foyer-retour').click();
  }

  // ---- Les étiquettes doivent TENIR DANS LE CADRE. ----
  // Constat de Paul (2026-08-01) : elles débordaient à gauche et à droite. La
  // correction ne se juge pas à l'œil — on MESURE la boîte de chaque texte
  // contre le repère, et on le fait sur un thème CHARGÉ, pas sur celui qui
  // passait déjà. `couronne` borne désormais chaque étiquette à la place
  // réellement disponible de son côté.
  await page.locator('.voute-feu').first().click();
  await page.waitForSelector('.foyer-flamme-g', { timeout: 5000 });
  const debords = await page.evaluate(() => {
    const svg = document.getElementById('draukhain-foyer-dessin');
    const vb = svg.viewBox.baseVal;
    return Array.from(svg.querySelectorAll('.foyer-etiquette'))
      .filter((t) => (t.textContent || '').length > 0)
      .map((t) => {
        const b = t.getBBox();
        return { texte: t.textContent, x1: Math.round(b.x), x2: Math.round(b.x + b.width) };
      })
      .filter((e) => e.x1 < vb.x || e.x2 > vb.x + vb.width);
  });
  verifier('Aucune étiquette ne déborde du cadre (mesuré, pas jugé à l’œil)',
    debords.length === 0, JSON.stringify(debords));

  // Le vrai test : un thème très chargé, là où la couronne s'élargit le plus.
  const charge = await page.evaluate(() => {
    const svg = document.getElementById('draukhain-foyer-dessin');
    const vb = svg.viewBox.baseVal;
    const D = window.UltimaDraukhain;
    const trop = [];
    // 12 flammes : le pire cas réaliste. Chaque place doit pouvoir porter un
    // texte sans sortir — ou renoncer à l'étiquette plutôt que de déborder.
    D.couronne(12).forEach((place) => {
      if (place.signes < 6) { return; }   // étiquette omise : rien à mesurer
      const largeur = place.signes * 3.6;
      const gauche = place.ancre === 'end' ? place.x - 6 - largeur
        : (place.ancre === 'start' ? place.x + 6 : place.x - largeur / 2);
      const droite = gauche + largeur;
      if (gauche < vb.x || droite > vb.x + vb.width) { trop.push(place); }
    });
    return trop.length;
  });
  verifier('12 flammes : aucune étiquette ne peut déborder (borne calculée)',
    charge === 0, `${charge} place(s) hors cadre`);

  // ---- Les fonctions pures. ----
  const pur = await page.evaluate(() => {
    const D = window.UltimaDraukhain;
    const c3 = D.couronne(3);
    return {
      nomAvecTiret: D.nomCourt('TENIR LA LIGNE — la constance'),
      nomSansTiret: D.nomCourt('FAIRE FACE'),
      etiquetteCourte: D.etiquetteFlamme('Je tiens.'),
      etiquetteLongue: D.etiquetteFlamme('Ce qui se fait sans effort ne dure jamais bien longtemps'),
      etiquetteVide: D.etiquetteFlamme(''),
      couronneVide: D.couronne(0).length,
      couronne3: c3.length,
      premiereAuNord: Math.abs(c3[0].x - 150) < 0.001 && c3[0].y < 100,
      eclatVide: D.eclat(0),
      eclat1: D.eclat(1).opacite,
      eclat4: D.eclat(4).opacite,
      eclatPlafond: D.eclat(40).opacite,
      rayonCroit: D.eclat(6).rayon > D.eclat(2).rayon,
    };
  });
  verifier('nomCourt : le pourquoi accolé tombe', pur.nomAvecTiret === 'TENIR LA LIGNE', JSON.stringify(pur));
  verifier('nomCourt : un nom sans tiret est gardé entier', pur.nomSansTiret === 'FAIRE FACE');
  verifier('etiquetteFlamme : une phrase courte passe telle quelle',
    pur.etiquetteCourte === 'Je tiens', pur.etiquetteCourte);
  verifier('etiquetteFlamme : une phrase longue est bornée et suspendue',
    pur.etiquetteLongue.length <= 25 && /…$/.test(pur.etiquetteLongue), pur.etiquetteLongue);
  verifier('etiquetteFlamme : un texte vide ne casse rien', pur.etiquetteVide === 'une flamme');
  verifier('couronne : 0 flamme → aucune place', pur.couronneVide === 0);
  verifier('couronne : 3 flammes → 3 places, la première plein Nord',
    pur.couronne3 === 3 && pur.premiereAuNord, JSON.stringify(pur));
  verifier('eclat : sans flamme, aucun halo', pur.eclatVide === null);
  verifier('eclat : la lueur croît avec les flammes', pur.eclat4 > pur.eclat1);
  verifier('eclat : un foyer bien tenu éclaire, il n’aveugle pas (plafond)',
    pur.eclatPlafond <= 0.18, String(pur.eclatPlafond));
  verifier('eclat : le rayon croît lui aussi', pur.rayonCroit);

  verifier('Zéro requête externe (foyer)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (foyer)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-foyer.png`, fullPage: true });
  await page.close();
}

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

  // 2bis. Les YEUX de Léo : l'état du cap part avec la question — des comptes
  // et des intitulés, JAMAIS un contenu ni un identifiant (§5).
  const envoi = JSON.parse((appelsLeo[0] || {}).corps || '{}');
  verifier('État du cap transmis à Léo', Boolean(envoi.etat));
  verifier('État : les comptes réels (2 serments, 1 à raviver, 3 flammes)',
    envoi.etat && envoi.etat.compteurs['serments scellés'] === 2 &&
    envoi.etat.compteurs['serments à raviver'] === 1 &&
    envoi.etat.compteurs['flammes vivantes'] === 3,
    JSON.stringify(envoi.etat && envoi.etat.compteurs));
  const listeEtat = (envoi.etat && envoi.etat.listes &&
    envoi.etat.listes['Les serments de Paul (cap DRAUKHAIN)']) || [];
  verifier('État : les intitulés des serments, avec leur marque',
    listeEtat.length === 2 && listeEtat[0].libelle === 'AURORE' &&
    listeEtat[1].libelle === 'ENCLUME' && listeEtat[1].marque === 'à raviver',
    JSON.stringify(listeEtat));
  const brutEnvoi = (appelsLeo[0] || {}).corps || '';
  verifier('§5 : AUCUN texte de flamme envoyé à Léo',
    !/volonté au-delà du possible|tenu bon tout l’hiver|ne pas perdre la foi/.test(brutEnvoi));
  verifier('§5 : AUCUN identifiant envoyé à Léo', !/"s1"|"s2"|"f1"|"f2"|"f3"/.test(brutEnvoi));
  verifier('§5 : ni pourquoi ni horizon envoyés à Léo',
    !/tenir la parole donnée|chaque matin/.test(brutEnvoi));

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

// ====== LE RETOUR DE LA PASSERELLE : les futurs VRANESH sur un serment ======
// Jusqu'au 2026-08-04 le pont était à SENS UNIQUE : VRANESH savait quel
// objectif un futur menace ou sert, DRAUKHAIN n'en savait rien. Prouve :
// le retour s'affiche sur le BON serment, le rapport se lit, un futur ADVENU
// est marqué et passe en tête — et surtout ce retour n'écrit RIEN (le lien se
// pose et se détache depuis VRANESH, là où le futur se pense).
console.log('— Le retour de la passerelle : les futurs qui touchent un serment —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));

  const ecritures = [];
  const FIXTURE_FUTURS = {
    ok: true,
    data: {
      ...FIXTURE.data,
      // Recousus côté serveur (api/serments.js) : le front ne reçoit que ce
      // qu'il affiche. s1 porte deux futurs, s2 aucun.
      futurs: [
        { id: 'x1', serment_id: 's1', scenario_id: 'sc2', situation_id: 'si1',
          rapport: 'menace', deroule: 'le vent tombe et la traversée s’allonge',
          theme: 'TRAVERSÉE — un départ à préparer', advenu: false },
        { id: 'x2', serment_id: 's1', scenario_id: 'sc1', situation_id: 'si1',
          rapport: 'sert', deroule: 'le vent tourne au nord et porte la voile',
          theme: 'TRAVERSÉE — un départ à préparer', advenu: true },
      ],
    },
  };
  await page.route('**/api/serments**', (route) => {
    const req = route.request();
    if (req.method() !== 'GET') { ecritures.push({ methode: req.method(), url: req.url() }); }
    return route.fulfill({
      status: 200, contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(FIXTURE_FUTURS),
    });
  });
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-registre:not([hidden])', { timeout: 20000 });
  const repli = page.locator('#draukhain-registre-detail');
  if ((await repli.count()) === 1 && (await repli.evaluate((el) => el.open)) === false) {
    await page.locator('#draukhain-registre-detail summary').click();
  }

  const s1 = page.locator('#draukhain-serment-s1');
  const futurs = s1.locator('.draukhain-futurs');
  verifier('Le serment montre les futurs qui le touchent', (await futurs.count()) === 1);
  const txt = (await futurs.textContent()) || '';
  verifier('Le titre dit d’où ça vient (VRANESH)', /depuis VRANESH/.test(txt), txt);
  verifier('Un futur qui SERT est annoncé comme tel', /sert/.test(txt), txt);
  verifier('Un futur qui MENACE est annoncé comme tel', /menace/.test(txt), txt);
  verifier('Le déroulé du futur est lisible', /porte la voile/.test(txt), txt);
  verifier('Le thème d’origine est nommé, sans son sous-titre',
    /TRAVERSÉE/.test(txt) && !/un départ à préparer/.test(txt), txt);

  // L'ADVENU passe devant : ce n'est plus une hypothèse qui pèse, c'est arrivé.
  const items = await futurs.locator('.zekrom-retro-item').allTextContents();
  verifier('Le futur ADVENU est marqué d’un sceau',
    (await futurs.locator('.draukhain-futur-sceau').count()) === 1);
  verifier('Le futur ADVENU passe en tête de liste',
    /porte la voile/.test(items[0] || ''), JSON.stringify(items));

  // ABSENCE : un serment sans futur relié n'ouvre pas une section vide.
  verifier('ABSENCE — aucun bloc « futurs » sur un serment qui n’en a pas',
    (await page.locator('#draukhain-serment-s2 .draukhain-futurs').count()) === 0);

  // Le retour MONTRE, il n'écrit pas : aucune commande de lien de ce côté-ci.
  verifier('ABSENCE — aucun formulaire d’écriture dans le retour',
    (await futurs.locator('form, select, input').count()) === 0);
  verifier('Le retour renvoie vers VRANESH pour agir',
    (await futurs.locator('a[href="vranesh.html"]').count()) === 1);
  await page.waitForTimeout(200);
  verifier('Aucune écriture émise par l’affichage du retour',
    ecritures.length === 0, JSON.stringify(ecritures));

  verifier('Zéro requête externe (retour passerelle)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (retour passerelle)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-futurs.png`, fullPage: true });
  await page.close();
}

// ===================== F. LA VOÛTE DES SERMENTS (2026-08-04) =====================
// Forme A retenue par Paul sur preview. La section du dessus prouve le retour de
// la passerelle DANS LA FICHE d'un serment ; celle-ci le prouve SUR LA CARTE, et
// prouve en plus ce qu'aucune autre ne pouvait prouver avant elle :
//   ① les serments COEXISTENT (on ne voyait jamais qu'un serment à la fois) ;
//   ② le fil vers chaque cap voisin se VOIT, entrant compris ;
//   ③ le déroulé du futur, lui, RESTE dans la fiche (§5, vérifié par l'ABSENCE) ;
//   ④ la carte se MESURE : cadre ET croisements d'étiquettes — la règle du
//      2026-08-01 ne regardait que le cadre, et deux noms se croisaient sans
//      qu'elle s'en aperçoive (constat de la maquette du jour).
console.log('— F. draukhain.html : la voûte des serments —');

// La mesure, faite DANS la page : emprise du dessin contre son viewBox, et
// croisement de chaque paire d'étiquettes (noms + cartouches des caps).
function mesurerVoute() {
  const svg = document.getElementById('draukhain-voute-dessin');
  const vb = svg.viewBox.baseVal;
  let min = { x: Infinity, y: Infinity }, max = { x: -Infinity, y: -Infinity };
  svg.querySelectorAll('text, path, circle, rect').forEach((n) => {
    const b = n.getBBox();
    if (!b || (b.width === 0 && b.height === 0)) return;
    min.x = Math.min(min.x, b.x); min.y = Math.min(min.y, b.y);
    max.x = Math.max(max.x, b.x + b.width); max.y = Math.max(max.y, b.y + b.height);
  });
  const boites = [];
  svg.querySelectorAll('.voute-nom, .voute-cartouche').forEach((n) => {
    const b = n.getBBox();
    if (b && b.width > 0) boites.push(b);
  });
  let croisements = 0;
  for (let i = 0; i < boites.length; i += 1) {
    for (let j = i + 1; j < boites.length; j += 1) {
      const a = boites[i], c = boites[j];
      if (a.x < c.x + c.width - 1 && c.x < a.x + a.width - 1
        && a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1) croisements += 1;
    }
  }
  return {
    dedans: min.x >= vb.x - 0.5 && min.y >= vb.y - 0.5
      && max.x <= vb.x + vb.width + 0.5 && max.y <= vb.y + vb.height + 0.5,
    cadre: [Math.round(min.x), Math.round(max.x), Math.round(min.y), Math.round(max.y)],
    croisements,
  };
}

{
  const { page, erreurs, externes } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  // Le fil entrant arrive AVEC les serments (jointure serveur, api/serments.js) :
  // la voûte s'éprouve donc sur la même donnée que la fiche, pas sur une autre.
  const FIXTURE_VOUTE = {
    ok: true,
    data: {
      ...FIXTURE.data,
      futurs: [
        { id: 'x1', serment_id: 's1', scenario_id: 'sc1', situation_id: 'si1',
          rapport: 'menace', deroule: 'un déroulé qui doit rester dans la fiche',
          theme: 'LIANDRA — un cap à tenir', advenu: false },
      ],
    },
  };
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_VOUTE) }));
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-voute-dessin .voute-feu', { timeout: 20000 });

  // ---- ① L'ARRIVÉE : la carte d'abord, l'écriture derrière. ----
  verifier('Voûte : les deux serments coexistent',
    (await page.locator('.voute-feu').count()) === 2);
  verifier('Voûte : un feu allumé et une braise (3 flammes / 0 flamme)',
    (await page.locator('.voute-feu-trace').count()) === 1
    && (await page.locator('.voute-braise').count()) === 1);
  verifier('Voûte : le cœur du cap brûle au centre',
    (await page.locator('.voute-coeur').count()) === 1);
  verifier('Voûte : les trois caps voisins sont en bord de carte',
    (await page.locator('.voute-cartouche').count()) === 3);
  verifier('Arrivée : « Sceller un serment » est REPLIÉ (l’image d’abord)',
    !(await page.locator('#draukhain-form-serment').isVisible()));
  verifier('Arrivée : le registre détaillé reste replié',
    (await page.locator('#draukhain-registre-detail').evaluate((el) => el.open)) === false);

  // ---- ② LES FILS : sortants ET entrant, sur la carte. ----
  const capsTexte = (await page.locator('#draukhain-voute-dessin').textContent()) || '';
  verifier('Voûte : ZEKROM, VRANESH et MAEDRETHNIR comptent chacun leur fil',
    /ZEKROM/.test(capsTexte) && /VRANESH/.test(capsTexte) && /MAEDRETHNIR/.test(capsTexte), capsTexte);
  verifier('Voûte : trois fils tissés (2 sortants + 1 entrant)',
    (await page.locator('.voute-fil').count()) === 3,
    `${await page.locator('.voute-fil').count()}`);

  await page.locator('.voute-feu').first().locator('.voute-zone').hover();
  await page.waitForSelector('.voute-feu.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#draukhain-voute-parole').textContent()) || '';
  verifier('Survol : UNE ligne — le nom et ce qui l’entretient',
    /AURORE/.test(parole) && /flamme/.test(parole), parole);
  // La langue se soigne comme le code (directive EL ④) : une énumération se dit
  // « A, B et C », jamais « A et B et C ».
  verifier('Survol : les caps s’énumèrent en français',
    /relié à ZEKROM, VRANESH et MAEDRETHNIR/.test(parole), parole);
  verifier('Survol : le futur qui MENACE le serment est dit sur la carte',
    /un futur menace ce serment/.test(parole), parole);
  verifier('Survol : le thème d’où vient ce futur est nommé, sans son sous-titre',
    /LIANDRA/.test(parole) && !/un cap à tenir/.test(parole), parole);
  verifier('Survol : seuls les fils du serment visé s’allument',
    (await page.locator('.voute-fil.is-vif').count()) === 3
    && (await page.locator('.voute-feu.is-actif').count()) === 1);

  // ---- ③ ABSENCE (§5) : le déroulé du futur reste dans la fiche. ----
  const domVoute = await page.locator('#draukhain-voute').textContent();
  verifier('ABSENCE — le déroulé du futur ne fuit pas sur la voûte',
    !/déroulé qui doit rester dans la fiche/.test(domVoute || ''), (domVoute || '').slice(0, 120));

  // ---- ④ Le clic ouvre le foyer du serment visé. ----
  await page.locator('.voute-feu').first().click();
  await page.waitForSelector('.foyer-flamme-g', { timeout: 5000 });
  verifier('Clic : le foyer s’ouvre sur le serment choisi',
    (await page.locator('#draukhain-foyer-nom').textContent()) === 'AURORE');
  verifier('Clic : le feu choisi reste marqué sur la voûte',
    (await page.locator('.voute-feu[aria-pressed="true"]').count()) === 1);

  // ---- ⑤ LA MESURE, sur les données du jour. ----
  const m2 = await page.evaluate(mesurerVoute);
  verifier('Mesure (2 serments) : tout tient dans le cadre', m2.dedans, JSON.stringify(m2.cadre));
  verifier('Mesure (2 serments) : aucune étiquette ne se croise',
    m2.croisements === 0, `${m2.croisements}`);
  const nommes2 = (await page.locator('#draukhain-voute-dessin .voute-nom').allTextContents())
    .filter((n) => n.length > 0);
  verifier('Mesure (2 serments) : la carte NOMME ses serments',
    nommes2.length === 2, JSON.stringify(nommes2));

  verifier('Zéro erreur console (voûte)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  verifier('Zéro ressource externe (voûte)', externes.length === 0, externes.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-voute.png`, fullPage: true });
  await page.close();
}

// ---- ⑥ LE PIRE CAS CONSTRUIT : douze serments aux noms interminables. ----
// Les données du jour sont un échantillon favorable — elles ne sont pas le juge
// (règle du 2026-08-01). Douze serments, tous reliés aux trois caps : c'est la
// carte la plus chargée qu'on puisse lui demander de tenir.
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  const DOUZE = { ok: true, data: { serments: [], flammes: [], liens: [], futurs: [] } };
  for (let i = 0; i < 12; i += 1) {
    const id = `p${i}`;
    DOUZE.data.serments.push({
      id, intitule: `SERMENT INTERMINABLE NUMÉRO ${i} DONT LE NOM NE FINIT PAS`,
      pourquoi: null, horizon: null, nb_flammes: i % 7, a_raviver: (i % 7) === 0,
      created_at: '2026-07-01T10:00:00Z',
    });
    for (let f = 0; f < i % 7; f += 1) {
      DOUZE.data.flammes.push({ id: `${id}f${f}`, serment_id: id, nature: 'rappel', texte: 'flamme de mesure' });
    }
    DOUZE.data.liens.push({ id: `${id}l1`, owner_id: 'o', serment_id: id, ideal_id: 'i1', entree_id: null });
    DOUZE.data.liens.push({ id: `${id}l2`, owner_id: 'o', serment_id: id, ideal_id: null, entree_id: 'e1' });
    DOUZE.data.futurs.push({
      id: `${id}x`, serment_id: id, scenario_id: 'sc1', situation_id: 'si1',
      rapport: 'sert', deroule: 'neutre', theme: 'LIANDRA — un cap à tenir', advenu: false,
    });
  }
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(DOUZE) }));
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-voute-dessin .voute-feu', { timeout: 20000 });

  verifier('Pire cas : les douze feux sont là',
    (await page.locator('.voute-feu').count()) === 12);
  verifier('Pire cas : trente-six fils tissés',
    (await page.locator('.voute-fil').count()) === 36,
    `${await page.locator('.voute-fil').count()}`);
  const m12 = await page.evaluate(mesurerVoute);
  verifier('Mesure (12 serments) : tout tient dans le cadre', m12.dedans, JSON.stringify(m12.cadre));
  verifier('Mesure (12 serments) : aucune étiquette ne se croise',
    m12.croisements === 0, `${m12.croisements}`);
  // Sous 6 signes une étiquette ne reconnaît plus rien : on préfère le vide au
  // moignon. La parole sous la carte, elle, dit toujours tout.
  const etiquettes12 = await page.locator('#draukhain-voute-dessin .voute-nom').allTextContents();
  const courtes = etiquettes12.filter((n) => n.length > 0 && n.length < 6);
  verifier('Pire cas : aucun moignon d’étiquette', courtes.length === 0, JSON.stringify(courtes));
  // Le piège que les deux mesures ci-dessus ne voient PAS : une carte dont
  // toutes les étiquettes ont été rabotées à vide « tient dans le cadre » et
  // « ne croise rien ». Elle est pourtant illisible. Une carte se juge aussi à
  // ce qu'elle NOMME. (Défaut réel : la mesure tournait dans un conteneur
  // masqué, où getBBox vaut zéro — chaque nom y était raboté jusqu'au vide.)
  const nommes12 = etiquettes12.filter((n) => n.length >= 6).length;
  verifier('Pire cas : la carte NOMME ses serments (≥ 10 sur 12)',
    nommes12 >= 10, `${nommes12} nommés sur ${etiquettes12.length}`);

  verifier('Zéro erreur console (pire cas)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-voute-12.png`, fullPage: true });
  await page.close();
}

// ---- ⑧ LE NOM DU SERMENT OUVERT NE RECOUVRE PAS SON DESSIN. ----
// Défaut RÉEL vu par Paul (2026-08-04, capture) : la légende du foyer était
// posée en absolu au bas du cadre, exactement là où le SVG écrit « braise — il
// ne demande qu'un souffle ». Avec un intitulé long (73 signes, un de ses vrais
// serments), les deux textes se superposaient — illisibles.
// Le harnais mesurait la géométrie DANS le SVG ; il ne regardait pas ce que le
// HTML posait PAR-DESSUS. Une mesure qui s'arrête au bord du dessin ne prouve
// rien de ce qui vient se coucher dessus.
{
  const { page, erreurs } = await nouvellePage();
  await page.addInitScript(scriptFausseSession());
  const LONG = 'Toujours rechercher la vérité, et avoir la force et le courage de la dire';
  const FIXTURE_LONG = {
    ok: true,
    data: {
      serments: [
        { id: 'L1', intitule: LONG, pourquoi: null, horizon: null, nb_flammes: 0, a_raviver: true, created_at: '2026-07-01T10:00:00Z' },
        { id: 'L2', intitule: 'Ne plus jamais perdre mon calme', pourquoi: null, horizon: null, nb_flammes: 1, a_raviver: false, created_at: '2026-07-02T10:00:00Z' },
      ],
      flammes: [{ id: 'Lf1', serment_id: 'L2', nature: 'victoire', texte: 'une victoire', survenu_le: '2026-08-03' }],
      liens: [], futurs: [],
    },
  };
  await page.route('**/api/serments**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_LONG) }));
  await page.route('**/api/ideaux**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_IDEAUX) }));
  await page.route('**/api/imladrik**', (route) => route.fulfill({
    status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(FIXTURE_PAGES) }));

  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#draukhain-voute-dessin .voute-feu', { timeout: 20000 });
  await page.locator(`.voute-feu[aria-label*="Toujours"]`).click();
  await page.waitForTimeout(300);

  const foyer = await page.evaluate(() => {
    const nom = document.getElementById('draukhain-foyer-nom');
    const svg = document.getElementById('draukhain-foyer-dessin');
    const cadre = svg.closest('.foyer-cadre');
    const rn = nom.getBoundingClientRect();
    const rs = svg.getBoundingClientRect();
    const rc = cadre.getBoundingClientRect();
    return {
      texte: nom.textContent,
      surLeDessin: rn.left < rs.right && rs.left < rn.right && rn.top < rs.bottom && rs.top < rn.bottom,
      dansLeCadre: rn.left >= rc.left - 1 && rn.right <= rc.right + 1
        && rn.top >= rc.top - 1 && rn.bottom <= rc.bottom + 1,
    };
  });
  verifier('Foyer : le nom du serment ouvert est ENTIER',
    foyer.texte === 'Toujours rechercher la vérité, et avoir la force et le courage de la dire',
    foyer.texte);
  verifier('Foyer : le nom NE RECOUVRE PAS le dessin (défaut vu par Paul)',
    foyer.surLeDessin === false);
  verifier('Foyer : le nom reste dans le cadre', foyer.dansLeCadre);

  // Le clic ne peint aucun anneau (il désigne déjà) ; le CLAVIER en reçoit un.
  const apresClic = await page.locator('.voute-feu[aria-pressed="true"]')
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  verifier('Voûte : aucun anneau noir après un clic (défaut vu par Paul)',
    apresClic === 'none', apresClic);
  // Chromium n'accorde `:focus-visible` que si la DERNIÈRE interaction fut au
  // clavier — un `.focus()` posé juste après un clic n'y a pas droit. On frappe
  // donc une touche d'abord : c'est le vrai scénario du clavier, pas un artifice.
  await page.keyboard.press('Tab');
  const auClavier = await page.locator('.voute-feu').first().evaluate((el) => {
    el.focus();
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, largeur: cs.outlineWidth, focusVisible: el.matches(':focus-visible') };
  });
  verifier('Voûte : le clavier, lui, reçoit un anneau visible',
    auClavier.focusVisible && auClavier.style === 'solid' && parseFloat(auClavier.largeur) >= 2,
    JSON.stringify(auClavier));

  verifier('Zéro erreur console (nom long)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/draukhain-nom-long.png`, fullPage: true });
  await page.close();
}


// ---- ⑦ La couronne de la voûte, fonction PURE. ----
{
  const { page } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/draukhain.html`, { waitUntil: 'load', timeout: 20000 });
  const pur = await page.evaluate(() => {
    const c = window.UltimaDraukhain.couronneVoute;
    return {
      vide: c(0).length,
      seul: c(1).length,
      seulAuCentre: c(1)[0].x === 330 && c(1)[0].y === 214,
      douze: c(12).length,
      // Un nom plein Nord se pose AU-DESSUS, plein Sud EN DESSOUS : sinon il
      // croise les étiquettes de ses deux voisins.
      nordAuDessus: c(12)[0].ancre === 'middle' && c(12)[0].dy < 0,
      sudEnDessous: c(12)[6].ancre === 'middle' && c(12)[6].dy > 0,
      // Le budget de signes se calcule sur la place réelle, jamais à l'aveugle.
      budgetsPositifs: c(12).every((p) => p.signes > 0),
    };
  });
  verifier('couronneVoute pure : 0 → rien, 1 → au centre',
    pur.vide === 0 && pur.seul === 1 && pur.seulAuCentre, JSON.stringify(pur));
  verifier('couronneVoute pure : 12 places, Nord au-dessus, Sud en dessous',
    pur.douze === 12 && pur.nordAuDessus && pur.sudEnDessous, JSON.stringify(pur));
  verifier('couronneVoute pure : chaque place a un budget de signes mesuré',
    pur.budgetsPositifs, JSON.stringify(pur));
  await page.close();
}


await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE DRAUKHAIN VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
