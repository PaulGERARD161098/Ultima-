// Géocodage d'adresse (v3-⑤) : bouton « Trouver sur la carte », champs vides,
// requête unique + cadence, liste de 3, sélection, résultat unique, aperçu
// carte, « Changer », introuvable, erreur (enregistrer sans position marche
// toujours), enregistrement, saisie manuelle, édition avec position, clavier,
// tap targets. /api/geocode stubé par interception de route, mode démo forcé.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

// ---------- Fixtures /api/geocode ----------

const corps = (results) => JSON.stringify({ ok: true, data: { results } });
const FIXTURES = {
  trois: { status: 200, contentType: 'application/json', body: corps([
    { label: '12 Rue Nationale, 59000 Lille, France', lat: 50.6301, lon: 3.0562, type: 'house' },
    { label: '12 Rue Nationale, 59350 Saint-André-lez-Lille, France', lat: 50.66, lon: 3.045, type: 'house' },
    { label: '12 Rue Nationale, 59110 La Madeleine, France', lat: 50.655, lon: 3.07, type: 'house' },
  ]) },
  un: { status: 200, contentType: 'application/json', body: corps([
    { label: 'Lille, Nord, France', lat: 50.6365, lon: 3.0635, type: 'city' },
  ]) },
  vide: { status: 200, contentType: 'application/json', body: corps([]) },
  erreur: { status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Erreur interne' }) },
};

const stub = { reponse: FIXTURES.trois, delaiMs: 0, compteur: 0 };

// ---------- Page ----------

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() !== 'error') { return; }
  // Seul bruit toléré : le log réseau natif du navigateur pour la fixture 500
  // de /api/geocode (erreur volontaire du scénario geocodeErreur).
  const url = (m.location() && m.location().url) || '';
  if (url.includes('/api/geocode') && m.text().includes('500')) { return; }
  erreurs.push('console: ' + m.text());
});

await page.route('**://unpkg.com/**', (route) => {
  const url = route.request().url();
  if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
  if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
  return route.fulfill({ status: 404, body: '' });
});
await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
await page.route('**/api/geocode*', async (route) => {
  stub.compteur += 1;
  if (stub.delaiMs) { await new Promise((r) => setTimeout(r, stub.delaiMs)); }
  return route.fulfill(stub.reponse);
});
// Force le mode démo malgré la config réelle.
await page.addInitScript(() => {
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
const bboxes = {};
const focusId = () => page.evaluate(() => document.activeElement && document.activeElement.id);
const messageStatut = () => page.locator('#geo-message[role="status"]').textContent();
const apercuPosition = () => page.evaluate(() => window.UltimaCarte.apercuPosition());

await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

// Ouvre le formulaire nœud comme Paul : Contacts → + Ajouter un contact.
const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(300);

const bouton = page.locator('#geo-bouton');
const libelle = page.locator('#geo-bouton-libelle');
const listeItems = page.locator('#geo-suggestions .item-resultat');
const confirmation = page.locator('#geo-confirmation');

// 1. geocodeBoutonPresent — bouton entre Adresse et Téléphone, lat/lng repliés.
verdicts.geocodeBoutonPresent = (await bouton.isVisible()) &&
  (await libelle.textContent()) === 'Trouver sur la carte' &&
  (await page.evaluate(() => {
    const adresse = document.getElementById('noeud-adresse');
    const geo = document.getElementById('geo-bouton');
    const tel = document.getElementById('noeud-telephone');
    const apres = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return apres(adresse, geo) && apres(geo, tel);
  })) &&
  !(await page.locator('#noeud-lat').isVisible()) &&
  (await page.locator('#geo-details summary').textContent()) === 'Coordonnées précises (avancé)' &&
  (await page.evaluate(() => !document.getElementById('geo-details').open));
bboxes.bouton = await bouton.boundingBox();

// 2. geocodeChampsVides — 0 requête, message inline, bouton toujours actif.
await bouton.click();
await page.waitForTimeout(100);
verdicts.geocodeChampsVides = stub.compteur === 0 &&
  (await messageStatut()) === "Indiquez d'abord une ville ou une adresse." &&
  !(await bouton.isDisabled());

// 3. geocodeRequeteUnique — double-tap = 1 requête ; état « Recherche… ».
stub.reponse = FIXTURES.trois;
stub.delaiMs = 600;
await page.locator('#noeud-ville').fill('Lille');
await page.evaluate(() => {
  const b = document.getElementById('geo-bouton');
  b.click(); b.click(); // double-tap nerveux
});
await page.waitForTimeout(150); // requête en vol (fixture retardée)
const pendantRequete = (await bouton.isDisabled()) &&
  (await libelle.textContent()) === 'Recherche…' &&
  (await page.locator('#geo-zone').getAttribute('aria-busy')) === 'true';
await page.locator('#geo-suggestions .item-resultat').first().waitFor({ timeout: 3000 });
verdicts.geocodeRequeteUnique = pendantRequete && stub.compteur === 1;
stub.delaiMs = 0;

// 4. geocodeCadence — encore désactivé juste après la réponse, actif après ~1 s.
const encoreDesactive = await bouton.isDisabled();
await page.waitForTimeout(1200);
verdicts.geocodeCadence = encoreDesactive && !(await bouton.isDisabled());

// 5. geocodeListeTrois — 3 suggestions, intitulé, annonce, focus 1ʳᵉ suggestion.
verdicts.geocodeListeTrois = (await listeItems.count()) === 3 &&
  (await page.locator('.liste-resultats-titre').textContent()) === 'Choisissez la bonne adresse :' &&
  (await messageStatut()) === '3 adresses trouvées.' &&
  (await page.evaluate(() => {
    const items = document.querySelectorAll('#geo-suggestions .item-resultat');
    return document.activeElement === items[0];
  }));
bboxes.item = await listeItems.first().boundingBox();

// 15. geocodeClavier — Tab circule, Échap ferme la liste sans fermer le
// panneau (focus rendu au bouton), Entrée sélectionne.
await page.keyboard.press('Tab');
const tabDeuxieme = await page.evaluate(() => {
  const items = document.querySelectorAll('#geo-suggestions .item-resultat');
  return document.activeElement === items[1];
});
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const echapFerme = (await listeItems.count()) === 0 &&
  (await page.locator('#panneau').isVisible()) &&
  (await focusId()) === 'geo-bouton';
await bouton.click(); // relance : cache local, aucune nouvelle requête
await page.waitForTimeout(150);
const cacheSansRequete = stub.compteur === 1 && (await listeItems.count()) === 3;
await page.keyboard.press('Enter'); // focus est sur la 1ʳᵉ suggestion
await page.waitForTimeout(100);
verdicts.geocodeClavier = tabDeuxieme && echapFerme && cacheSansRequete &&
  (await page.locator('#noeud-lat').inputValue()) === '50.6301';

// 6. geocodeSelection — suggestion n°2 : champs remplis, ligne + Changer, focus.
await page.locator('#geo-changer').click();
await page.waitForTimeout(1100); // repos anti-rafale de la recherche précédente
await bouton.click();
await listeItems.first().waitFor({ timeout: 2000 });
await listeItems.nth(1).click();
await page.waitForTimeout(100);
verdicts.geocodeSelection = (await page.locator('#noeud-lat').inputValue()) === '50.66' &&
  (await page.locator('#noeud-lng').inputValue()) === '3.045' &&
  (await listeItems.count()) === 0 &&
  (await confirmation.textContent()).includes('Position : 12 Rue Nationale, 59350 Saint-André-lez-Lille') &&
  !(await confirmation.textContent()).includes('France') &&
  (await page.locator('#geo-changer').isVisible()) &&
  (await focusId()) === 'geo-confirmation';
bboxes.changer = await page.locator('#geo-changer').boundingBox();
await page.screenshot({ path: `${SCRATCH}/geocode-selection-390.png` });

// 8a. geocodeApercuCarte — 1 marqueur provisoire (pointillés) aux coordonnées.
const apercuApresSelection = await apercuPosition();
const marqueurPointille = await page.locator('path[stroke-dasharray="4 4"]').count();
await page.locator('#bouton-annuler-noeud').click(); // Annuler le formulaire
await page.waitForTimeout(200);
verdicts.geocodeApercuCarte = apercuApresSelection && apercuApresSelection.lat === 50.66 &&
  apercuApresSelection.lng === 3.045 && marqueurPointille === 1 &&
  (await apercuPosition()) === null &&
  (await page.locator('path[stroke-dasharray="4 4"]').count()) === 0;

// 9. geocodeChanger — champs vidés, ligne disparue, aperçu effacé, focus Adresse.
await page.locator('#bouton-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-ville').fill('Lille');
await bouton.click(); // cache
await listeItems.first().waitFor({ timeout: 2000 });
await listeItems.first().click();
await page.waitForTimeout(100);
await page.locator('#geo-changer').click();
await page.waitForTimeout(100);
verdicts.geocodeChanger = (await page.locator('#noeud-lat').inputValue()) === '' &&
  (await page.locator('#noeud-lng').inputValue()) === '' &&
  (await confirmation.isHidden()) &&
  (await apercuPosition()) === null &&
  (await focusId()) === 'noeud-adresse';

// 7. geocodeResultatUnique — position posée sans tap supplémentaire.
stub.reponse = FIXTURES.un;
await page.locator('#noeud-adresse').fill('Grand Place');
await page.waitForTimeout(1100); // repos anti-rafale
await bouton.click();
await page.waitForTimeout(400);
verdicts.geocodeResultatUnique = (await page.locator('#noeud-lat').inputValue()) === '50.6365' &&
  (await page.locator('#noeud-lng').inputValue()) === '3.0635' &&
  (await listeItems.count()) === 0 &&
  (await confirmation.textContent()).includes('Position : Lille, Nord') &&
  (await messageStatut()) === 'Adresse trouvée.';

// 10. geocodeIntrouvable — message dédié, position inchangée.
stub.reponse = FIXTURES.vide;
await page.locator('#noeud-adresse').fill('xyz introuvable');
await page.waitForTimeout(1100);
await bouton.click();
await page.waitForTimeout(400);
verdicts.geocodeIntrouvable = (await messageStatut()) ===
  "Adresse introuvable. Essayez avec la ville seule, ou vérifiez l'orthographe." &&
  (await page.locator('#noeud-lat').inputValue()) === '50.6365';

// 11. geocodeErreur — 500 : message, puis Enregistrer SANS position réussit.
stub.reponse = FIXTURES.erreur;
await page.locator('#noeud-adresse').fill('rue en panne');
await page.waitForTimeout(1100);
await bouton.click();
await page.waitForTimeout(400);
const messageErreur = (await messageStatut()).startsWith("La recherche d'adresse ne répond pas.");
await page.locator('#geo-changer').click(); // enregistrer sans position
await page.locator('#noeud-nom').fill('Sans Position Géo');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
const ficheSansPosition = (await page.locator('#panneau-titre').textContent()) === 'Sans Position Géo';
await ongletContacts.click();
await page.waitForTimeout(200);
verdicts.geocodeErreur = messageErreur && ficheSansPosition &&
  (await page.locator('.item-contact', { hasText: 'Sans Position Géo' })
    .locator('.badge-a-placer').textContent()) === 'À placer';

// 12 + 14. geocodeEnregistrement / geocodeEditionPosition.
stub.reponse = FIXTURES.trois;
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-nom').fill('Position Stub');
await page.locator('#noeud-ville').fill('Lille');
await bouton.click(); // cache : liste immédiate
await listeItems.first().waitFor({ timeout: 2000 });
await listeItems.first().click();
await page.waitForTimeout(100);
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
const fichePositionStub = (await page.locator('#panneau-titre').textContent()) === 'Position Stub';
const apercuEfface = (await apercuPosition()) === null;
// Édition du nœud fraîchement positionné : ligne dédiée, zéro requête émise.
const requetesAvantEdition = stub.compteur;
await page.locator('.actions-fiche button', { hasText: 'Modifier' }).click();
await page.waitForTimeout(200);
const ligneEdition = (await confirmation.textContent()).includes('Position enregistrée sur la carte');
verdicts.geocodeEditionPosition = ligneEdition &&
  (await page.locator('#geo-changer').isVisible()) &&
  stub.compteur === requetesAvantEdition;
bboxes.summary = await page.locator('#geo-details summary').boundingBox();
await page.locator('#geo-details summary').click(); // valeurs visibles à l'ouverture
verdicts.geocodeEnregistrement = fichePositionStub && apercuEfface &&
  (await page.locator('#noeud-lat').inputValue()) === '50.6301' &&
  (await page.locator('#noeud-lng').inputValue()) === '3.0562';
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
await page.locator('#bouton-fermer-panneau').click(); // la fiche couvre l'écran mobile
await page.waitForTimeout(200);

// 13. geocodeManuel — saisie à la main : ligne dédiée, valeurs conservées,
// validation « les deux ou aucun » intacte.
await page.locator('#bouton-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-nom').fill('Manuel Direct');
await page.locator('#geo-details summary').click();
await page.locator('#noeud-lat').fill('48.85');
await page.locator('#noeud-lng').fill('2.35');
await page.waitForTimeout(100);
const ligneManuel = (await confirmation.textContent()).includes('Position saisie à la main');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
const ficheManuel = (await page.locator('#panneau-titre').textContent()) === 'Manuel Direct';
await page.locator('.actions-fiche button', { hasText: 'Modifier' }).click();
await page.waitForTimeout(200);
await page.locator('#geo-details summary').click();
const valeursManuelles = (await page.locator('#noeud-lat').inputValue()) === '48.85' &&
  (await page.locator('#noeud-lng').inputValue()) === '2.35';
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
// Paire incomplète → toast existant, rien de créé.
await page.locator('#bouton-fermer-panneau').click();
await page.locator('#bouton-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-nom').fill('Paire Incomplète');
await page.locator('#geo-details summary').click();
await page.locator('#noeud-lat').fill('48');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
verdicts.geocodeManuel = ligneManuel && ficheManuel && valeursManuelles &&
  (await page.locator('.toast-erreur').last().textContent())
    .includes('Latitude et longitude vont ensemble');

// 16. geocodeTapTargets — bouton, suggestion, « Changer », summary ≥ 44 px.
verdicts.geocodeTapTargets = ['bouton', 'item', 'changer', 'summary'].every((n) =>
  bboxes[n] && bboxes[n].height >= 44);

// ---------- Bilan ----------

await page.screenshot({ path: `${SCRATCH}/geocode-390.png` });
console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-GEOCODE OK' : 'SMOKE-GEOCODE ECHEC');
process.exit(ok ? 0 : 1);
