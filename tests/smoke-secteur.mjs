// Secteur d'activité (boucle A2, spec §3-§6) — flux front en mode démo, 390 px.
// Couvre les points VÉRIFIABLES SANS la migration 0006 (gate Paul) :
//   pt 3 (client)  : maxlength=120 sur le champ ;
//   pt 4           : la datalist reflète les secteurs de etat.noeuds ;
//   pt 5           : normalisation/dédoublonnage (« Plomberie »/« plomberie »
//                    → une seule suggestion, première graphie conservée) ;
//   pt 6 (UI)      : champ optionnel (nom seul → pas de ligne secteur) ;
//   affichage fiche : « Secteur d'activité : … » via ligneDetail ;
//   pt 2 (édition) : vider le secteur → la ligne fiche disparaît.
// RESTE GATÉ (post-migration 0006, à prouver avec la vraie base) :
//   pt 1 persistance création réelle, pt 2 persistance édition réelle,
//   pt 3 serveur (POST 121 car. → 400) — couvert en unitaire par
//   unit-secteur.mjs (validateNode), la persistance DB attend la colonne.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

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
await page.addInitScript(() => {
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/#traveller', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });
const secteur = page.locator('#noeud-secteur_activite');

// Helper : crée un contact (nom + secteur optionnel) depuis l'onglet Contacts.
async function creerContact(nom, valeurSecteur) {
  await ongletContacts.click();
  await page.waitForTimeout(150);
  await page.locator('#contacts-ajouter').click();
  await page.waitForTimeout(150);
  await page.locator('#noeud-nom').fill(nom);
  if (valeurSecteur !== undefined) { await secteur.fill(valeurSecteur); }
  await page.locator('#form-noeud button[type="submit"]').click();
  await page.waitForTimeout(250);
}

// 1. Champ présent, optionnel (label sans *), maxlength = borne DB/API 120,
//    branché sur la datalist. Prouve §3 (markup) côté client.
await ongletContacts.click();
await page.waitForTimeout(150);
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(150);
verdicts.champPresent = await secteur.count() === 1;
verdicts.maxlength120 = (await secteur.getAttribute('maxlength')) === '120';
verdicts.brancheDatalist = (await secteur.getAttribute('list')) === 'liste-secteurs';
verdicts.labelSansEtoile = (await page.locator('label[for="noeud-secteur_activite"]').textContent())
  .trim() === "Secteur d'activité";
// À l'ouverture, la datalist reflète les secteurs des fixtures démo (A4 :
// quelques contacts démo portent un secteur pour montrer de vraies branches),
// dédoublonnés par forme normalisée et triés alpha fr.
const optionsDepart = await page.locator('#liste-secteurs option').evaluateAll(
  (opts) => opts.map((o) => o.value));
verdicts.datalistDemoAuDepart = JSON.stringify(optionsDepart) ===
  JSON.stringify(['Courtage', 'Électricité', 'Menuiserie', 'Plomberie', 'Toiture']);
// Ferme le formulaire sans créer (pt 6 optionnel prouvé plus bas autrement).
await ongletContacts.click();
await page.waitForTimeout(150);

// 2. Création AVEC secteur → la fiche affiche « Secteur d'activité : Plomberie »
//    (affichage via ligneDetail, §6).
await creerContact('Alpha Plomberie', 'Plomberie');
verdicts.ficheAlpha = (await page.locator('#panneau-titre').textContent()) === 'Alpha Plomberie';
const detailsAlpha = await page.locator('.fiche-details').innerText();
verdicts.ligneSecteurAffichee = detailsAlpha.includes("Secteur d'activité") &&
  detailsAlpha.includes('Plomberie');

// 3. Deuxième contact « plomberie » (casse différente) + un « Toiture ».
await creerContact('Beta plomberie', 'plomberie');
await creerContact('Gamma Toiture', 'Toiture');

// 4 + 5. Réouverture du formulaire : la datalist reflète l'existant, dédoublonné
//    par forme normalisée. « Plomberie »/« plomberie » → UNE entrée (première
//    graphie « Plomberie » conservée) ; « Toiture » présent. Tri alpha fr.
await ongletContacts.click();
await page.waitForTimeout(150);
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(150);
const optionsSecteur = await page.locator('#liste-secteurs option').evaluateAll(
  (opts) => opts.map((o) => o.value));
// « Plomberie » et « Toiture » préexistent (fixtures démo) : les créations ne
// les redoublent pas. La datalist = union dédoublonnée des secteurs démo et
// saisis (« plomberie » minuscule fusionné sous la 1re graphie « Plomberie »).
verdicts.datalistRefleteExistant = JSON.stringify(optionsSecteur) ===
  JSON.stringify(['Courtage', 'Électricité', 'Menuiserie', 'Plomberie', 'Toiture']);
verdicts.dedoublonnageNormalise = optionsSecteur.filter(
  (v) => v.toLowerCase() === 'plomberie').length === 1;
await ongletContacts.click();
await page.waitForTimeout(150);

// 6. Champ optionnel : contact nom seul → succès, AUCUNE ligne secteur en fiche.
await creerContact('Delta Sans Secteur', undefined);
verdicts.ficheDelta = (await page.locator('#panneau-titre').textContent()) === 'Delta Sans Secteur';
verdicts.pasDeLigneSecteur = !(await page.locator('.fiche-details').innerText())
  .includes("Secteur d'activité");

// 7. Édition — vider le secteur d'Alpha : la ligne fiche disparaît (pt 2, côté
//    UI ; la persistance DB reste gatée). On ré-ouvre Alpha via Contacts.
await ongletContacts.click();
await page.waitForTimeout(150);
await page.locator('.item-contact', { hasText: 'Alpha Plomberie' }).first().click();
await page.waitForTimeout(250);
verdicts.avantVidage = (await page.locator('.fiche-details').innerText()).includes('Plomberie');
await page.locator('.actions-fiche button', { hasText: 'Modifier' }).first().click();
await page.waitForTimeout(200);
verdicts.formEditionOuvert = await page.locator('#form-noeud').isVisible() &&
  (await secteur.inputValue()) === 'Plomberie';
await secteur.fill('');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(250);
verdicts.ligneSecteurDisparue = !(await page.locator('.fiche-details').innerText())
  .includes("Secteur d'activité");

await page.screenshot({ path: `${SCRATCH}/secteur-390.png` });

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-SECTEUR OK' : 'SMOKE-SECTEUR ECHEC');
process.exit(ok ? 0 : 1);
