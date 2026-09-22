// Import iPhone dans RIVEN (CADRAGE-RIVEN-IMPORT.md) — le VRAI geste, en mode
// CONNECTÉ (client Supabase et API factices), à 390 px.
// Critères : C1 (500 cartes avec photos lues vite), C3 (rien de coché, rien
// d'envoyé avant le clic), C4 (doublons fusionnés), C7 (PHOTO/ADR/NOTE/BDAY
// n'atteignent pas la requête), + XSS par le nom et rattachement proposé.
// Fixture GÉNÉRÉE ici : noms inventés, aucun export réel.
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8123';
const N_FICHE = '11111111-2222-4333-8444-555555555555';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || chromium.executablePath() });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) erreurs.push('console: ' + m.text()); });
page.on('dialog', (d) => d.accept());

await page.addInitScript(() => {
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
});
const session = { access_token: 'jeton-test', user: { id: 'aaaaaaaa-1111-4111-8111-111111111111' } };
await page.route('**/js/vendor/supabase-js-*.js', (route) => route.fulfill({
  contentType: 'application/javascript',
  body: `window.supabase={createClient:()=>({auth:{
    getSession:async()=>({data:{session:${JSON.stringify(session)}}}),
    onAuthStateChange(){ return { data: { subscription: { unsubscribe(){} } } }; },
    signOut:async()=>({error:null})}})};`,
}));
await page.route('**/api/**', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: '{"ok":false,"error":"x"}' }));
await page.route('**/api/reseau', (route) => route.fulfill({
  contentType: 'application/json',
  body: JSON.stringify({ ok: true, data: {
    nodes: [{ id: N_FICHE, type: 'artisan', nom: 'Toitures Ferrand', statut: 'actif', ville: 'Lyon', lat: 45.76, lng: 4.83 }],
    edges: [], journal: [],
    personnes: [{ id: 'p-karim', nom: 'Karim Roux', telephone: '06 11 22 33 44' }],
    rattachements: [],
  } }),
}));
const envois = [];
await page.route('**/api/reseau/import', async (route) => {
  const corps = JSON.parse(route.request().postData() || '{}');
  envois.push({ corps, auth: route.request().headers().authorization });
  const lignes = corps.personnes || [];
  await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, data: {
    creees: lignes.length, rattachees: lignes.filter((l) => l.node_id).length, refusees: [], rattachementsEchoues: [],
  } }) });
});

// --- Fixture : 500 cartes « iCloud » avec photo, adresse, note, anniversaire ---
const PHOTO = 'A'.repeat(30000).replace(/(.{74})/g, '$1\r\n ');
function carte(lignes) { return ['BEGIN:VCARD', 'VERSION:3.0', 'PRODID:-//Apple Inc.//iOS 17//EN', ...lignes, 'END:VCARD'].join('\r\n'); }
const cartes = [];
for (let i = 0; i < 494; i++) {
  const num = String(10000000 + i).slice(-8);
  cartes.push(carte([`N:Contact${i};Test;;;`, `FN:Test Contact${i}`, `item1.TEL;type=CELL;type=VOICE;type=pref:06 ${num.replace(/(\d\d)(?=\d)/g, '$1 ')}`,
    'ADR;type=HOME:;;9 rue Inventée;Villefictive;;00000;France', 'NOTE:NOTE-SECRETE', 'BDAY:1970-01-01',
    `PHOTO;ENCODING=b;TYPE=JPEG:${PHOTO}`]));
}
cartes.push(carte(['FN:Aubin Ferrand', 'TEL;type=CELL:06 12 34 56 01']));
cartes.push(carte(['FN:A. Ferrand', 'TEL:+33 6 12 34 56 01', 'ORG:Toitures Ferrand;', 'TITLE:Gérant']));
cartes.push(carte(['FN:Karim R.', 'TEL:+33 6 11 22 33 44']));
cartes.push(carte(['FN:<img src=x onerror="window.__xss=1">', 'EMAIL:xss@exemple.fr']));
cartes.push(carte(['TEL:06 99 99 99 99']));            // sans nom → rejet compté
cartes.push(carte(['FN:Bérénice Lacombe', 'EMAIL;type=WORK:B.Lacombe@Exemple.FR']));
const fichier = Buffer.from(cartes.join('\r\n'), 'utf8');

const verdicts = {};
// Un parcours qui casse en route ne doit pas masquer les verdicts déjà acquis.
page.setDefaultTimeout(8000);
try {
await page.goto(base + '/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1200);
await page.locator('.barre-onglets button', { hasText: 'Contacts' }).click();
await page.waitForTimeout(200);

// Le bouton suit le registre : absent des fiches, présent chez les personnes.
verdicts.boutonAbsentRegistreFiches = await page.locator('#contacts-importer').isHidden();
await page.locator('#registre-personnes').click();
await page.waitForTimeout(200);
verdicts.boutonPresentRegistrePersonnes = await page.locator('#contacts-importer').isVisible();
await page.locator('#contacts-importer').click();
verdicts.panneauImportOuvert = await page.locator('#vue-import').isVisible() &&
  await page.locator('#import-etape-fichier').isVisible();

// --- C1 : lecture de ~15 Mo ---
// Chronométré DANS la page, de l'événement « change » (fichier choisi) à la
// liste affichée : lecture + analyse + rendu. Le transfert du fichier par
// Playwright (CDP) n'est pas ce que Paul vivra — il est exclu de la mesure.
await page.evaluate(() => {
  document.querySelector('#import-fichier').addEventListener('change', () => {
    window.__t0 = performance.now();
    new MutationObserver((_, obs) => {
      if (!document.querySelector('#import-etape-tri').hidden) { window.__duree = performance.now() - window.__t0; obs.disconnect(); }
    }).observe(document.querySelector('#import-etape-tri'), { attributes: true });
  }, { capture: true, once: true });
});
await page.setInputFiles('#import-fichier', { name: 'contacts.vcf', mimeType: 'text/vcard', buffer: fichier });
await page.locator('#import-etape-tri').waitFor({ state: 'visible', timeout: 15000 });
await page.waitForFunction(() => window.__duree !== undefined);
const duree = Math.round(await page.evaluate(() => window.__duree));
console.log(`   (lecture de ${(fichier.length / 1e6).toFixed(1)} Mo : ${duree} ms)`);
verdicts.lectureRapide = duree < 2000 * (process.env.CI ? 3 : 1);

// Verrou de non-vacuité AVANT toute recherche d'absence.
const nbLignes = await page.locator('#import-liste li').count();
verdicts.nonVacuite = nbLignes === 498; // 494 + Aubin fusionné + Karim + XSS + Bérénice
const lu = await page.locator('#import-lu').textContent();
verdicts.bilanLecture = /500 cartes lues/.test(lu) && /1 doublons fusionnés/.test(lu) && /1 illisibles/.test(lu) && /1 déjà dans RIVEN/.test(lu);

// --- C3 : rien de coché, rien envoyé ---
verdicts.rienCocheParDefaut = (await page.locator('#import-liste input[type=checkbox]:checked').count()) === 0;
verdicts.importerDesactive = await page.locator('#import-envoyer').isDisabled();
verdicts.rienEnvoyeAvantClic = envois.length === 0;

// XSS par le nom : du texte, jamais du HTML.
verdicts.xssNeSExecutePas = (await page.evaluate(() => window.__xss)) === undefined &&
  (await page.locator('#import-liste img').count()) === 0 &&
  (await page.locator('#import-liste .import-nom', { hasText: '<img src=x' }).count()) === 1;

// Déjà en base : marqué et non cochable.
const karim = page.locator('#import-liste li', { hasText: 'Karim R.' });
verdicts.dejaEnBaseVerrouille = (await karim.locator('.import-marque.base').count()) === 1 &&
  await karim.locator('input[type=checkbox]').first().isDisabled();

// --- C4 : Aubin fusionné, rattachement proposé ---
const aubin = page.locator('#import-liste li', { hasText: 'Aubin Ferrand' });
verdicts.doublonFusionne = (await aubin.locator('.import-marque.doublon', { hasText: '2 cartes fusionnées' }).count()) === 1;
verdicts.rattachementPropose = (await aubin.locator('.import-ratt', { hasText: 'Toitures Ferrand' }).count()) === 1;

// Filtre + « cocher les affichés » + compteur des masqués.
await page.locator('#import-filtre').fill('ferrand');
await page.locator('#import-tout').click();
await aubin.locator('.import-ratt input').check();
await page.locator('#import-filtre').fill('');
await page.locator('#import-filtre').fill('Bérénice');
await page.locator('#import-tout').click();
const compte = await page.locator('#import-compte').textContent();
verdicts.masquesSignales = /2 contacts cochés/.test(compte) && /dont 1 masqué par le filtre/.test(compte);
await page.locator('#import-filtre').fill('');
await page.locator('#import-liste li', { hasText: '<img src=x' }).locator('input[type=checkbox]').check();
await page.locator('#import-liste li', { hasText: 'Test Contact7' }).first().locator('input[type=checkbox]').check();
await page.screenshot({ path: new URL('./.cache/import-tri-390.png', import.meta.url).pathname });

await page.locator('#import-envoyer').click();
await page.locator('#import-etape-bilan').waitFor({ state: 'visible', timeout: 10000 });

// --- Ce qui est parti ---
const lignes = envois.flatMap((e) => e.corps.personnes || []);
verdicts.unSeulLotAuthentifie = envois.length === 1 && envois[0].auth === 'Bearer jeton-test' &&
  JSON.stringify(Object.keys(envois[0].corps)) === '["personnes"]';
verdicts.seulementLesCoches = lignes.length === 4;
const CHAMPS = ['nom', 'fonction', 'telephone', 'email', 'notes', 'node_id'];
verdicts.champsAutorisesSeuls = lignes.every((l) => Object.keys(l).every((k) => CHAMPS.includes(k)));
const brut = JSON.stringify(envois);
verdicts.minimisationC7 = brut.length > 50 && !/NOTE-SECRETE|1970-01-01|Villefictive|AAAAAAAAAA/.test(brut);
const ligneAubin = lignes.find((l) => l.nom === 'Aubin Ferrand');
verdicts.aubinComplet = !!ligneAubin && ligneAubin.telephone === '+33612345601' && ligneAubin.fonction === 'Gérant' &&
  ligneAubin.notes === 'Entreprise : Toitures Ferrand' && ligneAubin.node_id === N_FICHE;
verdicts.emailNormalise = lignes.some((l) => l.email === 'b.lacombe@exemple.fr');
const bilan = await page.locator('#import-bilan').textContent();
verdicts.bilanAffiche = /Personnes créées\s*4/.test(bilan) && /Rattachées à une fiche\s*1/.test(bilan);

// Fichier refusé : pas une vCard.
await page.locator('#import-recommencer').click();
await page.setInputFiles('#import-fichier', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
await page.waitForTimeout(200);
verdicts.pasUneVcardRefusee = await page.locator('#import-etape-fichier').isVisible() &&
  /pas une vCard/.test(await page.locator('.toasts').textContent());

} catch (e) {
  verdicts.parcoursComplet = false;
  erreurs.push('exception : ' + String(e.message).split('\n')[0]);
}
verdicts.zeroErreurConsole = erreurs.length === 0;
await browser.close();

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) rouge = true;
}
if (erreurs.length) { console.log('--- erreurs ---'); erreurs.forEach((e) => console.log(e)); }
if (rouge) process.exit(1);
