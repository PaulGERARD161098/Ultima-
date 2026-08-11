// Vérification boucle ① : Accueil carte d'enfance + navigation par onglets.
// Mode démo forcé (config vidée). unpkg/OSM stubés (proxy bloquant).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

// Cache local préparé par lancer.sh (fixture Leaflet npm, captures).
const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// Mobile 390 px, critère d'acceptation de la spec UX.
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
// Tuiles OSM : réponse PNG 1x1 valide (pas d'erreurs de tuiles en console).
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
await page.waitForTimeout(900);

// 1. Démarrage sur l'Arbre (A3 : l'arbre est le pivot/hub) ; l'Accueil reste
// accessible par son onglet — salutation, barre d'onglets, aria-current.
verdicts.arbreVisibleAuDemarrage = await page.locator('#espace-arbre').isVisible();
verdicts.ongletActifArbreAuDemarrage = await page
  .locator('.barre-onglets .onglet[data-onglet="arbre"][aria-current="page"]').count() === 1;
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(300);
verdicts.accueilVisible = await page.locator('#espace-accueil').isVisible();
verdicts.carteCachee = await page.locator('#espace-carte').isHidden();
verdicts.titreBienvenue = (await page.locator('#accueil-titre').textContent()) === 'Bienvenue, Paul';
verdicts.sousTitre = (await page.locator('.accueil-question').textContent()) === "On fait quoi aujourd'hui ?";
verdicts.ongletActifAccueil = await page
  .locator('.barre-onglets .onglet[data-onglet="accueil"][aria-current="page"]').count() === 1;
verdicts.quatreOnglets = await page.locator('.barre-onglets .onglet').count() === 4;

// 2. Police à l'ancienne (old-style système) sur le titre — registre antique :
// la pile typo résolue est serif, plus aucune écriture manuscrite (« Caveat »
// banni, plus aucune famille cursive, police Caveat plus chargée du tout).
await page.evaluate(() => document.fonts.ready);
verdicts.policeAncienne = await page.evaluate(() => {
  const ff = getComputedStyle(document.getElementById('accueil-titre')).fontFamily;
  return /serif/i.test(ff) && !/caveat/i.test(ff) && !/cursive/i.test(ff);
});
verdicts.caveatMorte = await page.evaluate(() => {
  let declaree = false;
  document.fonts.forEach((f) => { if (/caveat/i.test(f.family)) declaree = true; });
  return !declaree; // plus aucune @font-face « Caveat » enregistrée
});

// 3. Relances dues : 2 en démo (retard 2 j + aujourd'hui), badge de retard.
verdicts.nbRelances = await page.locator('.item-relance').count();
verdicts.badgeRetard = (await page.locator('.badge-retard').first().textContent()) === 'En retard de 2 j';
verdicts.badgeAujourdhui = await page.locator('.badge-echeance', { hasText: "Aujourd'hui" }).count() >= 1;
verdicts.titreCompteur = (await page.locator('#titre-zone-relances').textContent()) === 'Relances à faire (2)';
verdicts.cibleLambert = await page.locator('.panneau-bois-cible', { hasText: 'M. Lambert' }).count() >= 1;

// 4. Rapprochements : groupes En cours → Contact établi → Idée, contenus.
const titresGroupes = await page.locator('.carte-groupe-titre').allTextContents();
verdicts.groupesOrdonnes = /En cours/.test(titresGroupes[0] || '') &&
  /Contact établi/.test(titresGroupes[1] || '') && /Idée/.test(titresGroupes[2] || '');
verdicts.r1NoteDatee = await page.locator('.item-rapprochement-note', { hasText: 'Deux dossiers transmis' }).count() === 1;
verdicts.r3RienNote = await page.locator('.item-rapprochement', { hasText: 'Agence Habitat Sud ↔ Mme Nguyen' })
  .locator('.item-rapprochement-note', { hasText: "Rien de noté pour l'instant." }).count() === 1;
verdicts.fructueuxArreteAbsents = await page.locator('.item-rapprochement', { hasText: 'Menuiserie Delcourt' }).count() === 0 &&
  await page.locator('.item-rapprochement', { hasText: 'Élec Ferrand' }).count() === 0;

// 5. Suggestions : ≤ 3 ; R1 (retard), R2 (idée dormante Agence Habitat Sud ↔ Mme Nguyen), R3.
verdicts.nbSuggestions = await page.locator('.item-suggestion').count();
verdicts.suggestionR1 = await page.locator('.item-suggestion', { hasText: 'relance en retard' }).count() === 1;
verdicts.suggestionR2 = await page.locator('.item-suggestion', { hasText: 'Agence Habitat Sud ↔ Mme Nguyen' }).count() === 1;
verdicts.suggestionR3 = await page.locator('.item-suggestion', { hasText: 'ni téléphone ni e-mail' }).count() === 1;

// 6. Tap targets ≥ 44 px sur tous les actionnables de l'Accueil + onglets.
verdicts.tapTargets = await page.evaluate(() => {
  const cibles = document.querySelectorAll(
    '.panneau-bois, .case-fait, .item-rapprochement, .item-suggestion, .accueil-raccourcis .bouton, .onglet');
  return Array.from(cibles).every((el) => el.getBoundingClientRect().height >= 44);
});

// 7. Tap sur une relance → onglet Carte + fiche ouverte + focus + tuiles OK.
await page.locator('.panneau-bois', { hasText: 'Relancer M. Lambert' }).click();
await page.waitForTimeout(600);
verdicts.ongletCarteActif = await page
  .locator('.barre-onglets .onglet[data-onglet="carte"][aria-current="page"]').count() === 1;
verdicts.ficheLambert = ((await page.locator('#panneau-titre').textContent()) || '').includes('M. Lambert');
verdicts.focusPanneauTitre = await page.evaluate(() => document.activeElement?.id === 'panneau-titre');
// Carte correctement dimensionnée : le conteneur Leaflet couvre la zone
// (invalidateSize effectif → des tuiles chargées sur toute la largeur).
verdicts.carteDimensionnee = await page.evaluate(() => {
  const carte = document.getElementById('carte');
  const r = carte.getBoundingClientRect();
  const tuiles = carte.querySelectorAll('.leaflet-tile-loaded');
  return r.width > 300 && r.height > 300 && tuiles.length >= 4;
});

// 8. Échap ferme la fiche, l'onglet Accueil ramène au pilotage.
await page.keyboard.press('Escape');
verdicts.echapFerme = await page.locator('#panneau').isHidden();
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(200);
verdicts.retourAccueil = await page.locator('#espace-accueil').isVisible() &&
  await page.locator('#espace-carte').isHidden();

// 9. Cocher « Fait » retire l'item SANS changer d'onglet + toast.
const relancesAvant = await page.locator('.item-relance').count();
// Clic natif unique : la liste se re-rend (item retiré), pas de retry Playwright.
await page.evaluate(() => document.querySelector('.case-fait input').click());
await page.waitForTimeout(400);
verdicts.faitRetireItem = (await page.locator('.item-relance').count()) === relancesAvant - 1;
verdicts.resteSurAccueil = await page.locator('#espace-accueil').isVisible();
verdicts.toastRelanceCochee = await page.locator('.toast', { hasText: 'Relance cochée.' }).count() >= 1;

// 10. Suggestion R3 → onglet Carte + formulaire Modifier pré-rempli.
await page.locator('.item-suggestion', { hasText: 'ni téléphone ni e-mail' }).click();
await page.waitForTimeout(300);
verdicts.r3OuvreFormulaire = await page.locator('#form-noeud').isVisible() &&
  ((await page.locator('#noeud-nom').inputValue()) === 'Maison Garonne');
await page.keyboard.press('Escape');

// 11. Onglet Contacts (v3-②) : le registre s'affiche, tap contact → carte.
await page.locator('.barre-onglets .onglet[data-onglet="contacts"]').click();
verdicts.contactsListe = (await page.locator('.item-contact').count()) === 9;
await page.locator('.item-contact').first().click();
verdicts.contactsVersCarte = await page.locator('#espace-carte').isVisible();
await page.keyboard.press('Escape');

// 12. Raccourcis : + Ajouter un contact → carte + formulaire d'ajout.
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.locator('.accueil-raccourcis .bouton-primaire').click();
await page.waitForTimeout(200);
verdicts.raccourciAjout = await page.locator('#espace-carte').isVisible() &&
  await page.locator('#form-noeud').isVisible() &&
  ((await page.locator('#noeud-nom').inputValue()) === '');
await page.keyboard.press('Escape');

// 13. Aucun mot de jargon anglais à l'écran sur l'Accueil.
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
verdicts.sansJargon = await page.evaluate(() => {
  const texte = document.getElementById('espace-accueil').textContent;
  return !/\b(edge|node)\b/i.test(texte);
});

await page.screenshot({ path: `${SCRATCH}/smoke-accueil.png`, fullPage: false });
console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs page/console:', erreurs.length ? erreurs : 'aucune');

const attendus = {
  nbRelances: 2, nbSuggestions: 3,
};
const ok = Object.entries(verdicts).every(([k, v]) =>
  k in attendus ? v === attendus[k] : v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-ACCUEIL OK' : 'SMOKE-ACCUEIL ECHEC');
process.exit(ok ? 0 : 1);
