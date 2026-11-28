// Léo lit le web (28/11/2026) : ses sources s'affichent sous sa réponse.
// Prouve : liens http(s) rendus, ouverts dans un nouvel onglet sans fuite
// (noopener noreferrer) ; un lien javascript: est écarté ; un titre en HTML
// reste du TEXTE ; sans sources, rien n'est ajouté ; zéro erreur de page.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

const SOURCES = [
  { titre: 'Service-public — TVA travaux', url: 'https://www.service-public.fr/x' },
  { titre: '<img src=x onerror="window.__pirate=1">', url: 'https://exemple.fr/y' },
  { titre: 'piège', url: 'javascript:window.__pirate=2' },
];

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await navigateur.newPage({ viewport: { width: 1280, height: 860 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(String(e)));
await page.addInitScript(() => {
  Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
});
let tour = 0;
await page.route('**/api/leo', (route) => {
  tour++;
  const data = tour === 1 ? { reponse: 'Le taux réduit s’applique sous conditions.', sources: SOURCES } : { reponse: 'Sans source.' };
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data }) });
});
await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
await page.evaluate(() => {
  document.querySelectorAll('.leo-voile').forEach((v) => v.remove());
  window.sessionStorage.clear();
  window.UltimaLeo.accueillirQuadrant({
    quadrant: 'sources-web', blason: 'boussole', salutation: 'Scénario sources.',
    sections: [{ titre: 'Où on en est', lignes: ['—'] }],
    voix: { quadrant: 'riven', jeton: 'jeton-de-test' },
  });
});
const champ = page.locator('.leo-voix-champ');
await champ.fill('Quel taux de TVA pour une rénovation ?');
await champ.press('Enter');
await page.waitForSelector('.leo-bulle-leo .leo-sources', { timeout: 5000 }).catch(() => {});
const liens = await page.$$eval('.leo-bulle-leo .leo-sources a', (as) => as.map((a) => ({ href: a.getAttribute('href'), cible: a.target, rel: a.rel, texte: a.textContent })));
verifier('deux sources sûres affichées (javascript: écarté)', liens.length === 2, JSON.stringify(liens));
verifier('liens https, nouvel onglet, noopener noreferrer',
  liens.every((l) => /^https:\/\//.test(l.href) && l.cible === '_blank' && l.rel === 'noopener noreferrer'), JSON.stringify(liens));
verifier('un titre en HTML reste du texte', liens.some((l) => l.texte.startsWith('<img')) && await page.evaluate(() => !window.__pirate));
verifier('le titre « Sources » est posé', (await page.locator('.leo-sources-titre').count()) === 1);

await champ.fill('Et ensuite ?');
await champ.press('Enter');
await page.waitForFunction(() => document.querySelectorAll('.leo-bulle-leo').length >= 2, null, { timeout: 5000 }).catch(() => {});
verifier('sans sources, aucune liste ajoutée', (await page.locator('.leo-sources').count()) === 1);
verifier('zéro erreur de page', erreurs.length === 0, erreurs.join(' | '));

await navigateur.close();
if (echecs) { console.log(`SMOKE-LEO-SOURCES : ${echecs} échec(s)`); process.exit(1); }
console.log('SMOKE-LEO-SOURCES OK');
