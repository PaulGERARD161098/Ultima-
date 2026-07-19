// Vérification boucle AD-4c : carto des idées côté client (idees.html).
// API /api/idees STUBBÉE (fixtures locales = les 4 idées seed + 4 ponts),
// client Supabase factice injecté selon le scénario (motif smoke-connexion.mjs).
// Prouve : rendu des 4 îles (nom, ADR-num zéro-paddé, type, badge statut),
// 4 ponts SVG, archipels par thème principal, états vide / 401 / non connecté /
// démo, zéro erreur console, zéro requête externe, contraste AA mesuré sur les
// couleurs réellement rendues.
import { chromium } from 'playwright';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

// Fixtures : les 4 idées seed ADR-001..004 (thèmes du registre adramelech/IDEES.md).
const U = (n) => `00000000-0000-4000-8000-00000000000${n}`;
const FIXTURES = {
  idees: [
    { id: U(1), adr_num: 1, nom: 'GLANEUR', type: 'business', theme: 'bâtiment · économie circulaire · logistique', statut: 'à raffiner', partenaire: 'Godefroy' },
    { id: U(2), adr_num: 2, nom: 'PROTÉE', type: 'business', theme: 'bâtiment · énergie · organisation', statut: 'à raffiner', partenaire: 'Julien' },
    { id: U(3), adr_num: 3, nom: 'INTENDANT', type: 'pro · business', theme: 'bâtiment · logistique de chantier · approvisionnement', statut: 'à raffiner', partenaire: null },
    { id: U(4), adr_num: 4, nom: 'MYCÉLIUM', type: 'pro · business', theme: 'commercial · data client · fidélisation · recommandation', statut: 'à raffiner', partenaire: null },
  ],
  liens: [
    { source_id: U(1), target_id: U(2) },
    { source_id: U(1), target_id: U(3) },
    { source_id: U(2), target_id: U(4) },
    { source_id: U(3), target_id: U(4) },
  ],
};

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

// Ouvre idees.html selon le scénario.
//   client : 'aucun' (config vide → démo) | 'deconnecte' | 'connecte'.
//   api    : null (aucun stub → l'appel serait une erreur) | { status, body }.
async function ouvrir({ client, api }) {
  const page = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
  const journal = {
    erreurs: [], externes: [], appelsApi: 0,
  };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') journal.erreurs.push(m.text()); });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
    if (url.includes('/api/idees')) journal.appelsApi++;
  });

  await page.route('**/api/idees', (r) => {
    if (!api) return r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Erreur interne' }) });
    return r.fulfill({ status: api.status, contentType: 'application/json', body: JSON.stringify(api.body) });
  });

  if (client === 'aucun') {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
      });
    });
  } else {
    const session = client === 'connecte'
      ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }'
      : 'null';
    await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
      contentType: 'application/javascript',
      body: `window.supabase = { createClient: function () { return {
        auth: {
          getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
          onAuthStateChange: function () {}
        }
      }; } };`,
    }));
  }

  await page.goto(`${BASE}/idees.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(600);
  return { page, journal };
}

// Contraste WCAG entre une couleur rendue (fill/color) et un jeton de fond.
function contraste(page, selecteur, propriete, jetonFond) {
  return page.evaluate(([sel, prop, jeton]) => {
    function lum(rgb) {
      const c = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }
    function parse(couleur) {
      const m = couleur.match(/rgba?\(([^)]+)\)/);
      if (m) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2]]; }
      const h = couleur.trim().replace('#', '');
      if (/^[0-9a-f]{6}$/i.test(h)) {
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      return null;
    }
    const el = document.querySelector(sel);
    if (!el) return 0;
    const texte = parse(getComputedStyle(el)[prop]);
    const fond = parse(getComputedStyle(document.documentElement).getPropertyValue(jeton));
    if (!texte || !fond) return 0;
    const l1 = lum(texte), l2 = lum(fond);
    return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
  }, [selecteur, propriete, jetonFond]);
}

// ============ 1. Connecté : rendu des 4 idées seed + ponts + badges ============
console.log('— 1. Connecté : archipels, îles, ponts, badges —');
{
  const { page, journal } = await ouvrir({
    client: 'connecte', api: { status: 200, body: { ok: true, data: FIXTURES } },
  });
  await page.waitForSelector('#carto-figure:not([hidden])', { timeout: 10000 });

  verifier('Cartouche du quadrant (H1)', /Archipel d'Adramelech/.test((await page.locator('h1').textContent()) || ''));
  // Visibilité RÉELLE (pas le seul attribut hidden) : l'état de chargement doit
  // avoir disparu et la carte être affichée.
  verifier('État de chargement effacé une fois la carte levée', await page.locator('#carto-etat').isHidden());
  verifier('Carte réellement visible', await page.locator('#carto-figure svg').isVisible());
  verifier('Emblème ouroboros dans le cartouche', (await page.locator('header.cartouche .blason-svg').count()) === 1);
  verifier('Lien retour « ← Ultima » présent', /Ultima/.test((await page.locator('.retour-ultima').textContent()) || ''));
  const boiteRetour = await page.locator('.retour-ultima').boundingBox();
  verifier('Tap target retour ≥ 44 px', Boolean(boiteRetour) && boiteRetour.height >= 44, `h: ${boiteRetour && boiteRetour.height}`);

  verifier('4 îles rendues', (await page.locator('.ile').count()) === 4);
  const noms = (await page.locator('.ile-nom').allTextContents()).map((t) => t.trim());
  for (const nom of ['GLANEUR', 'PROTÉE', 'INTENDANT', 'MYCÉLIUM']) {
    verifier(`Île ${nom} présente`, noms.includes(nom));
  }
  const nums = (await page.locator('.ile-num').allTextContents()).join(' ');
  verifier('ADR-num zéro-paddés (001..004)', ['ADR-001', 'ADR-002', 'ADR-003', 'ADR-004'].every((n) => nums.includes(n)), nums);
  const types = (await page.locator('.ile-type').allTextContents()).map((t) => t.trim());
  verifier('Type gravé sur chaque île', types.length === 4 && types.filter((t) => t === 'business').length === 2 &&
    types.filter((t) => t === 'pro · business').length === 2, JSON.stringify(types));
  const sceaux = (await page.locator('.sceau-texte').allTextContents()).map((t) => t.trim());
  verifier('Badge de statut sur chaque île', sceaux.length === 4 && sceaux.every((s) => s === 'à raffiner'), JSON.stringify(sceaux));

  verifier('4 ponts SVG entre îles liées', (await page.locator('.pont').count()) === 4);

  const archs = (await page.locator('.arch-nom').allTextContents()).map((t) => t.trim());
  verifier('Archipels par thème principal (Bâtiment puis Commercial)',
    JSON.stringify(archs) === JSON.stringify(['Bâtiment', 'Commercial']), JSON.stringify(archs));

  const devise = (await page.locator('#carto-devise').textContent()) || '';
  verifier('Devise data-driven (4 idées · 2 archipels · 4 ponts)',
    devise.includes('4 idées') && devise.includes('2 archipels') && devise.includes('4 ponts'), devise);

  // Rendu déterministe : recharger → même SVG octet pour octet.
  const svg1 = await page.evaluate(() => document.querySelector('#carto-carte svg').outerHTML);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('#carto-figure:not([hidden])', { timeout: 10000 });
  const svg2 = await page.evaluate(() => document.querySelector('#carto-carte svg').outerHTML);
  verifier('Rendu déterministe (deux relevés identiques)', svg1 === svg2 && svg1.length > 0);

  // Contraste AA mesuré sur les couleurs réellement rendues.
  const cNom = await contraste(page, '.ile-nom', 'fill', '--ile');
  verifier('Contraste nom d’île ≥ 4,5:1', cNom >= 4.5, `${cNom}:1`);
  const cArch = await contraste(page, '.arch-nom', 'fill', '--mer');
  verifier('Contraste toponyme d’archipel ≥ 4,5:1', cArch >= 4.5, `${cArch}:1`);
  const cType = await contraste(page, '.ile-type', 'fill', '--ile');
  verifier('Contraste type d’île ≥ 4,5:1', cType >= 4.5, `${cType}:1`);
  const cSceau = await contraste(page, '.sceau-texte', 'fill', '--parchemin');
  verifier('Contraste badge statut ≥ 4,5:1', cSceau >= 4.5, `${cSceau}:1`);
  const cDevise = await contraste(page, '.devise', 'color', '--parchemin');
  verifier('Contraste devise ≥ 4,5:1', cDevise >= 4.5, `${cDevise}:1`);

  verifier('Pas de scroll horizontal (mobile 390 px)', await page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth + 1));
  verifier('Zéro requête externe', journal.externes.length === 0, journal.externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${SCRATCH}/idees-connecte.png`, fullPage: true });
  await page.close();
}

// ============ 2. État vide : 0 idée → état vide gravé ============
console.log('— 2. État vide —');
{
  const { page, journal } = await ouvrir({
    client: 'connecte', api: { status: 200, body: { ok: true, data: { idees: [], liens: [] } } },
  });
  await page.waitForSelector('#carto-etat:not([hidden])', { timeout: 10000 });
  const etat = (await page.locator('#carto-etat').textContent()) || '';
  verifier('État vide dessiné (« Aucune île levée »)', etat.includes('Aucune île levée'), etat.slice(0, 80));
  verifier('Figure masquée (pas de carte fantôme)', await page.locator('#carto-figure').isHidden());
  verifier('Zéro erreur console (vide)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ 3. 401 : jeton refusé → invite de connexion, rien en console ============
console.log('— 3. 401 API → invite de connexion —');
{
  const { page, journal } = await ouvrir({
    client: 'connecte', api: { status: 401, body: { ok: false, error: 'Authentification requise' } },
  });
  await page.waitForSelector('#carto-etat:not([hidden])', { timeout: 10000 });
  const etat = (await page.locator('#carto-etat').textContent()) || '';
  verifier('Invite de connexion (« Archipel sous scellés »)', etat.includes('Archipel sous scellés'), etat.slice(0, 80));
  const lien = page.locator('#carto-etat a.bouton-parchemin');
  verifier('Lien « Se connecter » → écran existant (traveler.html)',
    (await lien.getAttribute('href')) === 'traveler.html');
  const boite = await lien.boundingBox();
  verifier('Tap target connexion ≥ 44 px', Boolean(boite) && boite.height >= 44, `h: ${boite && boite.height}`);
  // Seule trace tolérée : le log RESSOURCE natif du navigateur sur le statut
  // HTTP 401 (aucun contenu d'idée, aucun jeton). Tout autre message échoue.
  const parasites = journal.erreurs.filter((e) => !/Failed to load resource.*401|401.*Failed to load resource/.test(e));
  verifier('Aucune erreur console applicative (401)', parasites.length === 0, parasites.slice(0, 3).join(' | '));
  await page.close();
}

// ============ 4. Non connecté : invite SANS appel API ============
console.log('— 4. Non connecté (pas de session) —');
{
  const { page, journal } = await ouvrir({ client: 'deconnecte', api: null });
  await page.waitForSelector('#carto-etat:not([hidden])', { timeout: 10000 });
  const etat = (await page.locator('#carto-etat').textContent()) || '';
  verifier('Invite de connexion affichée', etat.includes('Archipel sous scellés'), etat.slice(0, 80));
  verifier('AUCUN appel /api/idees sans session', journal.appelsApi === 0, `appels: ${journal.appelsApi}`);
  verifier('Zéro erreur console (non connecté)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ============ 5. Mode démo (config vide) : utilisable, signalé, sans réseau ============
console.log('— 5. Mode démo —');
{
  const { page, journal } = await ouvrir({ client: 'aucun', api: null });
  await page.waitForSelector('#carto-figure:not([hidden])', { timeout: 10000 });
  verifier('Bandeau démo visible', await page.locator('#bandeau-demo').isVisible());
  verifier('4 îles d’exemple rendues', (await page.locator('.ile').count()) === 4);
  verifier('4 ponts d’exemple rendus', (await page.locator('.pont').count()) === 4);
  verifier('AUCUN appel /api/idees en démo', journal.appelsApi === 0, `appels: ${journal.appelsApi}`);
  verifier('Zéro requête externe (démo)', journal.externes.length === 0, journal.externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (démo)', journal.erreurs.length === 0, journal.erreurs.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IDEES VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
