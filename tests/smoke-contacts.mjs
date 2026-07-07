// Onglet Contacts (v3-②) : liste triée, recherche (casse/accents), états,
// tap → fiche, saisie progressive (position optionnelle). Mode démo, 390 px.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });

await page.route('**://unpkg.com/**', (route) => {
  const url = route.request().url();
  if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
  if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
  return route.fulfill({ status: 404, body: '' });
});
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');
await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
// Force le mode démo malgré la config réelle.
await page.addInitScript(() => {
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });

// 1. Onglet Contacts : 9 contacts démo, triés par nom (locale fr), compteur.
await ongletContacts.click();
await page.waitForTimeout(200);
verdicts.neufContacts = (await page.locator('.item-contact').count()) === 9;
verdicts.compteur = (await page.locator('#contacts-compteur').textContent()).trim() === '9 contacts';
const noms = await page.locator('.item-contact-nom').allTextContents();
verdicts.triAlphabetique = await page.evaluate((liste) => {
  const tries = liste.slice().sort((a, b) => a.localeCompare(b, 'fr'));
  return JSON.stringify(liste) === JSON.stringify(tries);
}, noms);
verdicts.premierContact = noms[0] === 'Agence Habitat Sud';
verdicts.aucunBadgeAPlacer = (await page.locator('.badge-a-placer').count()) === 0;
await page.screenshot({ path: `${SCRATCH}/contacts-390.png` });

// 2. Recherche : ville (casse), nom avec/sans accent.
const recherche = page.locator('#contacts-recherche');
await recherche.fill('lyon');
await page.waitForTimeout(150);
verdicts.rechercheVille = (await page.locator('.item-contact').count()) === 1 &&
  (await page.locator('.item-contact-nom').first().textContent()).includes('Plomberie Roux');
await recherche.fill('élec');
await page.waitForTimeout(150);
verdicts.rechercheAvecAccent = (await page.locator('.item-contact').count()) === 1 &&
  (await page.locator('.item-contact-nom').first().textContent()) === 'Élec Ferrand';
await recherche.fill('Elec');
await page.waitForTimeout(150);
verdicts.rechercheSansAccent = (await page.locator('.item-contact').count()) === 1 &&
  (await page.locator('.item-contact-nom').first().textContent()) === 'Élec Ferrand';

// 3. Recherche sans résultat : message avec le terme.
await recherche.fill('zzz');
await page.waitForTimeout(150);
verdicts.aucunResultat = (await page.locator('.contacts-aucun').textContent()) ===
  'Aucun contact ne correspond à “zzz”.';
await recherche.fill('');
await page.waitForTimeout(150);

// 4. Tap sur un contact → onglet Carte + fiche ouverte + focus sur le titre.
await page.locator('.item-contact').first().click();
await page.waitForTimeout(300);
verdicts.bascueleCarte = await page.locator('#espace-carte').isVisible();
verdicts.ficheOuverte = (await page.locator('#panneau-titre').textContent()) === 'Agence Habitat Sud';
verdicts.focusTitre = await page.evaluate(() =>
  document.activeElement && document.activeElement.id === 'panneau-titre');

// 5. Retour Contacts.
await ongletContacts.click();
await page.waitForTimeout(200);
verdicts.retourContacts = await page.locator('#espace-contacts').isVisible();

// 6. Création SANS position (nom seul) : listé avec badge « À placer »,
//    absent de la carte (aucun tracé Leaflet supplémentaire).
const tracesAvant = await page.locator('path.leaflet-interactive').count();
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(200);
verdicts.formOuvert = await page.locator('#form-noeud').isVisible();
await page.locator('#noeud-nom').fill('Zoé Sans Position');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
verdicts.ficheNouveauContact = (await page.locator('#panneau-titre').textContent()) === 'Zoé Sans Position';
verdicts.pasSurLaCarte = (await page.locator('path.leaflet-interactive').count()) === tracesAvant;
await ongletContacts.click();
await page.waitForTimeout(200);
verdicts.dixContacts = (await page.locator('.item-contact').count()) === 10;
verdicts.badgeAPlacer = (await page.locator('.item-contact', { hasText: 'Zoé Sans Position' })
  .locator('.badge-a-placer').textContent()) === 'À placer';
await page.screenshot({ path: `${SCRATCH}/contacts-a-placer-390.png` });

// 7. Création avec UNE SEULE coordonnée → toast erreur, rien de créé.
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-nom').fill('Coordonnée Seule');
// v3-⑤ : lat/lng vivent dans le details « Coordonnées précises (avancé) ».
await page.locator('#geo-details summary').click();
await page.locator('#noeud-lat').fill('48');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
verdicts.toastCoordonnees = (await page.locator('.toast-erreur').last().textContent())
  .includes('Latitude et longitude vont ensemble');
await ongletContacts.click();
await page.waitForTimeout(200);
verdicts.rienCree = (await page.locator('.item-contact').count()) === 10;

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-CONTACTS OK' : 'SMOKE-CONTACTS ECHEC');
process.exit(ok ? 0 : 1);
