// Onglet Contacts (v3-②) : liste triée, recherche (casse/accents), états,
// tap → fiche, saisie progressive (position optionnelle). Mode démo, 390 px.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
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
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
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

// ===========================================================================
// RIVEN 0024 — le détail des fiches, et les PERSONNES séparées des nœuds.
// Critères ①/②/③ de CADRAGE-RIVEN-DETAIL.md §4.
// ===========================================================================

const registreFiches = page.locator('#registre-fiches');
const registrePersonnes = page.locator('#registre-personnes');

// Ouvre la fiche d'un nœud depuis le registre des fiches.
async function ouvrirFicheDepuisRegistre(nomFiche) {
  await ongletContacts.click();
  await page.waitForTimeout(200);
  await registreFiches.click();
  await page.waitForTimeout(200);
  await page.locator('.item-contact', { hasText: nomFiche }).click();
  await page.waitForTimeout(300);
}

// 8. Les onze champs de détail atteignent la fiche (fixture demo-n2).
await ouvrirFicheDepuisRegistre('Plomberie Roux');
const detailsRoux = await page.locator('.fiche-details').innerText();
verdicts.detailAutresMetiers = detailsRoux.includes('Autres métiers') &&
  detailsRoux.includes('Chauffage · Pompe à chaleur');
verdicts.detailCapacites = detailsRoux.includes('Rhône et Ain') &&
  detailsRoux.includes('60 km') && detailsRoux.includes('RGE · QualiPAC');
verdicts.detailRelation = detailsRoux.includes('5/5') && detailsRoux.includes('sous 48 h');
// Le métier principal reste seul en tête : les autres métiers ne le remplacent
// pas et ne rangent la fiche nulle part ailleurs.
verdicts.metierPrincipalIntact = detailsRoux.includes("Secteur d'activité") &&
  detailsRoux.includes('Plomberie');

// 9. Le pli « Détail » existe et s'ouvre FERMÉ : le flux court n'est pas allongé.
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(200);
verdicts.pliDetailFerme = await page.evaluate(() => {
  const d = document.querySelector('#noeud-detail');
  return Boolean(d) && d.open === false;
});
verdicts.champsDetailPresents = (await page.locator('#noeud-metiers_secondaires').count()) === 1 &&
  (await page.locator('#noeud-fiabilite').count()) === 1 &&
  (await page.locator('#noeud-rayon_km').count()) === 1;

// 10. Le registre des personnes : trois personnes de démo, dont UNE sans nœud.
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);
verdicts.troisPersonnes = (await page.locator('.item-personne').count()) === 3;
verdicts.compteurPersonnes =
  (await page.locator('#contacts-compteur').textContent()).trim() === '3 personnes';
verdicts.boutonSuitLeRegistre =
  (await page.locator('#contacts-ajouter').textContent()).trim() === '+ Ajouter une personne';
// Zéro fiche est un état NORMAL, écrit en toutes lettres.
verdicts.badgeARattacher = (await page.locator('.item-personne', { hasText: 'Godefroy Aubert' })
  .locator('.badge-a-rattacher').textContent()) === 'À rattacher';
verdicts.aucuneFicheAnnoncee = (await page.locator('.item-personne', { hasText: 'Godefroy Aubert' })
  .locator('.item-contact-detail').textContent()).includes('aucune fiche');
// Une personne DÉJÀ sur deux fiches : la demande « plusieurs nœuds », en démo.
verdicts.deuxFichesAnnoncees = (await page.locator('.item-personne', { hasText: 'Karim Roux' })
  .locator('.item-contact-detail').textContent()).includes('2 fiches');
await page.screenshot({ path: `${SCRATCH}/personnes-390.png` });

// 11. C2 — créer une personne NE CRÉE AUCUN NŒUD. Le compte de fiches, mesuré
//     dans le DOM avant et après, ne bouge pas d'une unité.
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(200);
verdicts.formPersonneOuvert = await page.locator('#form-personne').isVisible();
verdicts.formNoeudNonOuvert = !(await page.locator('#form-noeud').isVisible());
await page.locator('#personne-nom').fill('Mireille Vasseur');
await page.locator('#personne-fonction').fill('Architecte');
await page.locator('#form-personne button[type="submit"]').click();
await page.waitForTimeout(300);
verdicts.fichePersonneOuverte =
  (await page.locator('#panneau-titre').textContent()) === 'Mireille Vasseur';
verdicts.personneNeuveSansFiche =
  (await page.locator('.aucune-personne').textContent()).includes('aucune fiche');
await ongletContacts.click();
await page.waitForTimeout(200);
await registreFiches.click();
await page.waitForTimeout(200);
verdicts.aucunNoeudCree = (await page.locator('.item-contact').count()) === 10;
await registrePersonnes.click();
await page.waitForTimeout(200);
verdicts.quatrePersonnes = (await page.locator('.item-personne').count()) === 4;

// 12. C3 — la MÊME personne sur DEUX fiches, avec DEUX rôles distincts.
async function rattacherMireille(nomFiche, role) {
  await ouvrirFicheDepuisRegistre(nomFiche);
  await page.locator('#fiche-rattacher').click();
  await page.waitForTimeout(200);
  const valeur = await page.locator('#rattachement-personne option').evaluateAll(
    (opts) => (opts.find((o) => o.textContent.startsWith('Mireille')) || {}).value);
  await page.locator('#rattachement-personne').selectOption(valeur);
  await page.locator('#rattachement-role').fill(role);
  await page.locator('#form-rattachement button[type="submit"]').click();
  await page.waitForTimeout(300);
}

await rattacherMireille('Élec Ferrand', 'Architecte conseil');
verdicts.ficheApresRattachement =
  (await page.locator('#panneau-titre').textContent()) === 'Élec Ferrand';
verdicts.personneVisibleSurLaFiche = (await page.locator('.liste-personnes').innerText())
  .includes('Mireille Vasseur');
verdicts.roleVisibleSurLaFiche = (await page.locator('.liste-personnes').innerText())
  .includes('Architecte conseil');

await rattacherMireille('Zoé Sans Position', 'Suivi de chantier');

// Depuis la seconde fiche, on ouvre la personne : elle porte bien SES DEUX
// fiches, chacune avec SON rôle. C'est la preuve de « plusieurs nœuds ».
await page.locator('.liste-personnes .item-personne-texte').first().click();
await page.waitForTimeout(300);
verdicts.retourFichePersonne =
  (await page.locator('#panneau-titre').textContent()) === 'Mireille Vasseur';
const fichesDeMireille = await page.locator('.liste-personnes .item-personne-nom').allTextContents();
const rolesDeMireille = await page.locator('.liste-personnes .item-personne-detail').allTextContents();
verdicts.deuxFichesRattachees = fichesDeMireille.length === 2 &&
  fichesDeMireille.includes('Élec Ferrand') && fichesDeMireille.includes('Zoé Sans Position');
verdicts.deuxRolesDistincts = rolesDeMireille.length === 2 &&
  rolesDeMireille.some((t) => t.includes('Architecte conseil')) &&
  rolesDeMireille.some((t) => t.includes('Suivi de chantier'));
await page.screenshot({ path: `${SCRATCH}/personne-deux-fiches-390.png` });

// 13. Détacher retire le LIEN, jamais la personne : elle reste au registre.
page.once('dialog', (d) => d.accept());
await ouvrirFicheDepuisRegistre('Élec Ferrand');
await page.locator('.item-personne-liee .bouton-detacher').first().click();
await page.waitForTimeout(300);
verdicts.detacheDeLaFiche = (await page.locator('.aucune-personne').textContent())
  .includes('Aucune personne rattachée');
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);
verdicts.personneToujoursAuRegistre = (await page.locator('.item-personne').count()) === 4 &&
  (await page.locator('.item-personne', { hasText: 'Mireille Vasseur' })
    .locator('.item-contact-detail').textContent()).includes('1 fiche');

// 14. La recherche du registre porte sur le nom ET la fonction, et ne traverse
//     pas les registres (le terme est remis à zéro au changement).
await recherche.fill('architecte');
await page.waitForTimeout(150);
verdicts.rechercheParFonction = (await page.locator('.item-personne').count()) === 1 &&
  (await page.locator('.item-personne-nom').first().textContent()) === 'Mireille Vasseur';
await registreFiches.click();
await page.waitForTimeout(200);
verdicts.rechercheRemiseAZero = (await recherche.inputValue()) === '' &&
  (await page.locator('.item-contact').count()) === 10;

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-CONTACTS OK' : 'SMOKE-CONTACTS ECHEC');
process.exit(ok ? 0 : 1);
