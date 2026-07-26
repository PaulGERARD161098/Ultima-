// Cartographie IMLADRIK (B1) : imladrik.html = la boussole interne du quadrant
// (modèle LV2), MUETTE et sans donnée intime (§5). Prouve :
//   A. La carto rend 3 caps (MINETHNIR ouvert → minethnir.html ; VRANESH +
//      DRAUKHAIN à venir), le cœur Kalamn-talaen, la légende gravée, la parole
//      par défaut ; le survol d'un cap dépose la parole de Léo ; zéro requête
//      externe (aucun CDN, aucune donnée), zéro erreur console ; contrastes AA.
//   B. Fail-safe : la carto ne porte AUCUNE donnée (aucun appel réseau du tout),
//      même config vide → elle s'affiche pareil (rien à protéger, rien à fuir).
// Miroir léger de smoke-boussole.mjs, sans le cockpit/auth (carto muette).
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

// ===================== A. La carto rend et guide =====================
console.log('— A. imladrik.html : la cartographie Kalamn-talaen —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#boussole-plateau.is-pret', { timeout: 20000 });

  // 1. Les trois caps.
  verifier('3 caps rendus', (await page.locator('.cap').count()) === 3);
  const noms = (await page.locator('.cap .cap-nom').allTextContents()).map((t) => t.trim());
  for (const attendu of ['MINETHNIR', 'VRANESH', 'DRAUKHAIN']) {
    verifier(`Cap ${attendu} présent`, noms.includes(attendu), noms.join(', '));
  }

  // 2. Les 3 caps sont ouvrables (liens internes) — le quadrant est complet.
  const minethnir = page.locator('.cap[data-id="minethnir"]');
  for (const [id, cible] of [
    ['minethnir', 'minethnir.html'],
    ['draukhain', 'draukhain.html'],
    ['vranesh', 'vranesh.html'],
  ]) {
    const cap = page.locator(`.cap[data-id="${id}"]`);
    verifier(`${id} est un lien`, (await cap.evaluate((el) => el.tagName)) === 'A');
    verifier(`${id} → ${cible}`, (await cap.getAttribute('href')) === cible);
  }
  verifier('Aucun cap « à venir » restant (quadrant complet)',
    (await page.locator('.cap[aria-disabled="true"], .cap--avenir').count()) === 0);

  // 3. Le cœur Kalamn-talaen + sa légende gravée.
  verifier('Cœur Kalamn-talaen présent', (await page.locator('.boussole-coeur svg').count()) === 1);
  const legende = (await page.locator('.kalamn-legende').textContent()) || '';
  verifier('Légende « Kalamn-talaen » gravée', /Kalamn-talaen/.test(legende), legende);

  // 4. Parole par défaut (Léo, l'agent unique), puis parole au survol d'un cap.
  verifier('Parole par défaut affichée (Léo)',
    /Léo/.test((await page.locator('#boussole-parole').textContent()) || ''));
  await minethnir.hover();
  await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol MINETHNIR : nom dans la parole', /MINETHNIR/.test(parole));
  verifier('Survol MINETHNIR : état « Ouvert »', /Ouvert/.test(parole));
  verifier('Survol MINETHNIR : appel à entrer', /entrer/i.test(parole));
  verifier('Aiguille MINETHNIR illuminée',
    (await page.locator('.aiguille.is-actif').count()) >= 1);

  // 5. Survol VRANESH (ouvert) : parole « les futurs potentiels » + appel à entrer.
  await page.locator('.cap[data-id="vranesh"]').hover();
  await page.waitForTimeout(150);
  const pv = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol VRANESH : futurs potentiels', /futurs potentiels/i.test(pv));
  verifier('Survol VRANESH : appel à entrer', /entrer/i.test(pv));

  // 6. Retour à la console + repli noscript présents.
  verifier('Retour « Console » vers ultima.html',
    (await page.locator('.boussole-retour a[href="ultima.html"]').count()) === 1);

  // 7. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const capNom = document.querySelector('.cap-nom');
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
      capNom: getComputedStyle(capNom).color,
      capNomFond: cs.getPropertyValue('--parchemin-carte').trim(),
      invite: getComputedStyle(document.querySelector('.console-invite')).color,
      legende: getComputedStyle(document.querySelector('.kalamn-legende')).color,
    };
  });
  verifier('Contraste nom de cap ≥ 4,5:1',
    ratio(versHex(cr.capNom), cr.capNomFond) >= 4.5, `${ratio(versHex(cr.capNom), cr.capNomFond).toFixed(2)}:1`);
  verifier('Contraste invite sur mer ≥ 4,5:1',
    ratio(versHex(cr.invite), cr.merProfonde) >= 4.5, `${ratio(versHex(cr.invite), cr.merProfonde).toFixed(2)}:1`);
  // La légende (or antique) est posée sous le médaillon, sur le fond de mer du
  // plateau (comme .titre-surligne) → contraste mesuré contre la mer profonde.
  verifier('Contraste légende sur mer ≥ 4,5:1',
    ratio(versHex(cr.legende), cr.merProfonde) >= 4.5, `${ratio(versHex(cr.legende), cr.merProfonde).toFixed(2)}:1`);

  // 8. Registre exposé pour introspection (donnée statique, aucune PII).
  const exposes = await page.evaluate(() => (window.UltimaImladrikCarto || {}).noms || []);
  verifier('Registre exposé (3 noms)', exposes.length === 3, exposes.join(', '));

  // 9. Muette : AUCUNE requête externe, zéro erreur console.
  verifier('Zéro requête externe (carto muette, aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${CAPTURES}/imladrik-carto.png`, fullPage: true });
  await page.close();
}

// ===================== B. Config vide : aucune donnée, aucune fuite =====================
console.log('— B. imladrik.html config vide : carto identique, zéro appel —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  const appelsApi = [];
  await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#boussole-plateau.is-pret', { timeout: 20000 });

  verifier('3 caps rendus (config vide)', (await page.locator('.cap').count()) === 3);
  verifier('Aucun appel /api (carto sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe (config vide)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (config vide)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IMLADRIK CARTO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
