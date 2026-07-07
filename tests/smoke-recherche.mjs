// Recherche texte + zoom sur résultat (v3-⑥, U14-U17) : champ dans la barre
// d'outils Carte, résultats en direct (seuil 2, plafond 5, tri déterministe),
// sélection = zoom ≥ 13 + halo « compas » + fiche, nœud « À placer », 0
// résultat → création pré-remplie, Échap trois temps, filtres ignorés,
// dictée en mode remplacement, prefers-reduced-motion.
// Mode démo forcé, Leaflet/OSM stubés, zéro erreur console tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const DELCOURT = { lat: 50.6292, lng: 3.0573 };
const FERRAND = { lat: 47.2184, lng: -1.5536 };

async function preparerRoutes(page) {
  await page.route('**://unpkg.com/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
    if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
  // Force le mode démo malgré la config réelle.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

// Stub Web Speech API (motif smoke-dictee) : pilotable via window.__stubReco.
function stubSpeechRecognition() {
  window.__stubReco = { instances: [] };
  class FauxSpeechRecognition {
    constructor() {
      this.lang = '';
      this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null;
      this.termine = false;
      window.__stubReco.instances.push(this);
    }
    start() { setTimeout(() => { if (this.onstart) this.onstart(); }, 0); }
    stop() { setTimeout(() => this.emettreFin(), 0); }
    abort() { setTimeout(() => this.emettreFin(), 0); }
    emettreResultat(texte, estFinal) {
      const segment = [{ transcript: texte }];
      segment.isFinal = estFinal;
      if (this.onresult) this.onresult({ resultIndex: 0, results: [segment] });
    }
    emettreFin() {
      if (this.termine) return;
      this.termine = true;
      if (this.onend) this.onend();
    }
  }
  window.SpeechRecognition = FauxSpeechRecognition;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const verdicts = {};

// ================= Run 1 : parcours principal (stub dictée présent) =========

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
await preparerRoutes(page);
await page.addInitScript(stubSpeechRecognition);

const champ = page.locator('#recherche-carte');
const liste = page.locator('#recherche-resultats');
const items = page.locator('#recherche-resultats .item-resultat[data-resultat]');
const message = () => page.locator('#recherche-message[role="status"]').textContent();
const focusId = () => page.evaluate(() => document.activeElement && document.activeElement.id);
const vue = () => page.evaluate(() => window.UltimaCarte.vue());
const surbrillance = () => page.evaluate(() => window.UltimaCarte.surbrillancePosition());
const proche = (a, b) => a !== null && b !== null && Math.abs(a - b) < 1e-3;
const fermerPanneau = async () => {
  await page.locator('#bouton-fermer-panneau').click();
  await page.waitForTimeout(150);
};

await page.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);
await page.locator('.barre-onglets button', { hasText: 'Carte' }).click();
await page.waitForTimeout(300);

// Début de scénario : création du nœud « À placer » via le formulaire
// (nom seul, mode démo en mémoire — motif smoke-contacts). « Fontaine
// Rénovation » matche aussi les termes larges du verdict plafondEtTri.
await page.locator('#bouton-ajouter').click();
await page.waitForTimeout(200);
await page.locator('#noeud-nom').fill('Fontaine Rénovation');
await page.locator('#form-noeud button[type="submit"]').click();
await page.waitForTimeout(300);
const fontaineCreee = (await page.locator('#panneau-titre').textContent()) === 'Fontaine Rénovation';
await fermerPanneau();

// 1. champVisible — placeholder exact, pleine ligne au viewport mobile, ≥ 44 px.
const bboxChamp = await champ.boundingBox();
verdicts.champVisible = (await champ.isVisible()) &&
  (await champ.getAttribute('placeholder')) === 'Rechercher un nom ou une ville…' &&
  bboxChamp.width >= 350 && bboxChamp.height >= 44;

// 2 + 7. seuilDeuxCaracteres et pasDeVolFocus.
await champ.click();
await champ.pressSequentially('d');
await page.waitForTimeout(100);
const unCaractereFerme = await liste.isHidden();
await champ.pressSequentially('e');
await page.waitForTimeout(100);
verdicts.seuilDeuxCaracteres = unCaractereFerme && (await liste.isVisible()) &&
  (await champ.getAttribute('aria-expanded')) === 'true';
verdicts.pasDeVolFocus = (await focusId()) === 'recherche-carte';

// 3. insensibleCasseAccents — « elec » → Élec Ferrand ; « LILLE » → Delcourt.
await champ.fill('elec');
await page.waitForTimeout(100);
const trouveFerrand = (await items.allTextContents()).some((t) => t.includes('Élec Ferrand'));
await champ.fill('LILLE');
await page.waitForTimeout(100);
verdicts.insensibleCasseAccents = trouveFerrand &&
  (await items.allTextContents()).some((t) => t.includes('Menuiserie Delcourt'));

// 4. resultatComplet — vrai bouton, nom, « Type · Ville », pastille, ≥ 44 px.
await champ.fill('delcourt');
await page.waitForTimeout(100);
const bboxItem = await items.first().boundingBox();
verdicts.resultatComplet = (await items.count()) === 1 &&
  (await page.evaluate(() => {
    const item = document.querySelector('#recherche-resultats .item-resultat[data-resultat]');
    return item.tagName === 'BUTTON' && item.type === 'button' &&
      item.textContent.includes('Menuiserie Delcourt') &&
      item.textContent.includes('Artisan · Lille') &&
      Boolean(item.querySelector('.pastille.pastille-artisan'));
  })) && bboxItem.height >= 44;

// 5. plafondEtTri — « on » : 6 correspondances → 5 boutons + ligne « et 1
// autre » non cliquable ; « re » : le nom commençant classé avant le contenant.
await champ.fill('on');
await page.waitForTimeout(100);
const plafondCinq = (await items.count()) === 5;
const ligneReste = await page.locator('#recherche-resultats .liste-resultats-vide').textContent();
const resteNonCliquable = await page.evaluate(() =>
  document.querySelector('#recherche-resultats .liste-resultats-vide').tagName === 'LI');
await champ.fill('re');
await page.waitForTimeout(100);
const textesTri = await items.allTextContents();
verdicts.plafondEtTri = plafondCinq &&
  ligneReste === 'et 1 autre — précisez votre recherche' && resteNonCliquable &&
  textesTri[0].includes('Réhabilitation immeuble Voltaire') &&
  textesTri.findIndex((t) => t.includes('M. Lambert')) > 0;

// 6. annonceStatus — pluriel et singulier corrects, role=status.
await champ.fill('lle');
await page.waitForTimeout(100);
const annoncePluriel = (await message()) === '2 contacts trouvés.';
await champ.fill('lil');
await page.waitForTimeout(100);
verdicts.annonceStatus = annoncePluriel && (await message()) === '1 contact trouvé.';

// 8. selectionZoomHaloFiche — zoom ≥ 13, halo posé (pulsation), fiche ouverte,
// focus titre, liste fermée, champ conservé ; le halo survit à la fermeture.
await champ.fill('delcourt');
await page.waitForTimeout(100);
await items.first().click();
await page.waitForTimeout(1300); // flyTo 0.8 s
const vue8 = await vue();
const halo8 = await surbrillance();
const animation8 = await page.evaluate(() => {
  const p = document.querySelector('#carte path.halo-resultat');
  return p ? getComputedStyle(p).animationName : 'absent';
});
const fiche8 = (await page.locator('#panneau').isVisible()) &&
  (await page.locator('#panneau-titre').textContent()) === 'Menuiserie Delcourt' &&
  (await focusId()) === 'panneau-titre';
await fermerPanneau();
verdicts.selectionZoomHaloFiche = proche(vue8.lat, DELCOURT.lat) && proche(vue8.lng, DELCOURT.lng) &&
  vue8.zoom >= 13 && halo8 && proche(halo8.lat, DELCOURT.lat) && proche(halo8.lng, DELCOURT.lng) &&
  animation8 === 'pulsation-resultat' && fiche8 &&
  (await liste.isHidden()) && (await champ.inputValue()) === 'delcourt' &&
  (await surbrillance()) !== null; // fermeture de la fiche : halo conservé

// 9. jamaisDezoomer — zoom manuel à 15, sélection : le zoom reste 15.
await page.locator('.leaflet-control-zoom-in').click();
await page.waitForTimeout(400);
await page.locator('.leaflet-control-zoom-in').click();
await page.waitForTimeout(400);
const zoomManuel = (await vue()).zoom === 15;
await champ.fill('roux');
await page.waitForTimeout(100);
await items.first().click();
await page.waitForTimeout(1300);
verdicts.jamaisDezoomer = zoomManuel && (await vue()).zoom === 15;
await fermerPanneau();

// 10. entreePremierResultat — Entrée dans le champ = sélection du 1er résultat.
await champ.fill('elec');
await page.waitForTimeout(100);
await page.keyboard.press('Enter');
await page.waitForTimeout(1300);
const halo10 = await surbrillance();
verdicts.entreePremierResultat = (await page.locator('#panneau').isVisible()) &&
  (await page.locator('#panneau-titre').textContent()) === 'Élec Ferrand' &&
  (await focusId()) === 'panneau-titre' &&
  halo10 && proche(halo10.lat, FERRAND.lat) && proche(halo10.lng, FERRAND.lng) &&
  (await liste.isHidden()) && (await champ.inputValue()) === 'elec';
await fermerPanneau();

// 11. flechesListe — ↓ champ → 1er item ; ↓ → 2e ; ↑↑ → retour au champ.
await champ.fill('lle');
await page.waitForTimeout(100);
const focusItem = (n) => page.evaluate((i) => {
  const boutons = document.querySelectorAll('#recherche-resultats button');
  return document.activeElement === boutons[i];
}, n);
await page.keyboard.press('ArrowDown');
const surPremier = await focusItem(0);
await page.keyboard.press('ArrowDown');
const surDeuxieme = await focusItem(1);
await page.keyboard.press('ArrowUp');
const retourPremier = await focusItem(0);
await page.keyboard.press('ArrowUp');
verdicts.flechesListe = surPremier && surDeuxieme && retourPremier &&
  (await focusId()) === 'recherche-carte';

// 12. aPlacer — badge visible, sélection : fiche ouverte, carte immobile,
// aucun halo.
await champ.fill('fontaine');
await page.waitForTimeout(100);
const badgeAPlacer = (await items.first().locator('.badge-a-placer').textContent()) === 'À placer';
const vueAvant = await vue();
await items.first().click();
await page.waitForTimeout(400);
const vueApres = await vue();
verdicts.aPlacer = fontaineCreee && badgeAPlacer &&
  (await page.locator('#panneau-titre').textContent()) === 'Fontaine Rénovation' &&
  vueAvant.lat === vueApres.lat && vueAvant.lng === vueApres.lng &&
  vueAvant.zoom === vueApres.zoom &&
  (await surbrillance()) === null;
await fermerPanneau();

// 13. zeroResultatCreation — « zzz » : ligne dédiée + bouton d'ajout qui ouvre
// le formulaire avec le Nom pré-rempli.
await champ.fill('zzz');
await page.waitForTimeout(100);
const ligneAucun = (await page.locator('#recherche-resultats .liste-resultats-vide').textContent()) ===
  'Aucun contact ne correspond à “zzz”.';
const messageAucun = (await message()) === 'Aucun contact trouvé.';
const boutonAjout = page.locator('#recherche-resultats .item-resultat-ajouter');
const libelleAjout = (await boutonAjout.textContent()) === '+ Ajouter “zzz” comme contact';
await boutonAjout.click();
await page.waitForTimeout(300);
verdicts.zeroResultatCreation = ligneAucun && messageAucun && libelleAjout &&
  (await page.locator('#form-noeud').isVisible()) &&
  (await page.locator('#noeud-nom').inputValue()) === 'zzz';
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);

// 14. echapTroisTemps — liste fermée (texte conservé, panneau intact) →
// champ vidé (halo effacé, panneau intact) → panneau fermé.
await champ.fill('delcourt');
await page.waitForTimeout(100);
await items.first().click();
await page.waitForTimeout(1000);
await champ.fill('de'); // la fiche couvre l'écran mobile : saisie directe
await page.waitForTimeout(100);
const listeOuverte14 = await liste.isVisible();
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const temps1 = (await liste.isHidden()) && (await page.locator('#panneau').isVisible()) &&
  (await champ.inputValue()) === 'de';
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const temps2 = (await champ.inputValue()) === '' && (await surbrillance()) === null &&
  (await page.locator('#panneau').isVisible());
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
verdicts.echapTroisTemps = listeOuverte14 && temps1 && temps2 &&
  (await page.locator('#panneau').isHidden());

// 15. rechercheIgnoreFiltres — Artisan décoché : « delcourt » trouve quand
// même ; sélection → halo présent malgré le marqueur absent + annonce dédiée.
await page.locator('#bouton-filtres').click();
await page.locator('input[data-filtre="type"][value="artisan"]').uncheck();
await page.locator('#bouton-filtres').click();
await page.waitForTimeout(200);
await champ.fill('delcourt');
await page.waitForTimeout(100);
const trouveMasque = (await items.count()) === 1;
await items.first().click();
await page.waitForTimeout(1000);
const marqueurAbsent = await page.evaluate(() =>
  document.querySelectorAll('#carte path[fill="#e8781e"]').length === 0);
const haloPresent = await page.evaluate(() =>
  document.querySelectorAll('#carte path.halo-resultat').length === 1);
const halo15 = await surbrillance();
verdicts.rechercheIgnoreFiltres = trouveMasque && marqueurAbsent && haloPresent &&
  halo15 && proche(halo15.lat, DELCOURT.lat) &&
  (await message()) === 'Ce contact est masqué par vos filtres — le repère montre son emplacement.';
await fermerPanneau();
await page.locator('#bouton-filtres').click(); // remise en état des filtres
await page.locator('input[data-filtre="type"][value="artisan"]').check();
await page.locator('#bouton-filtres').click();
await page.waitForTimeout(200);

// 16. nouvelleFrappeEffaceHalo — une frappe efface le halo, liste mise à jour.
const haloAvantFrappe = await surbrillance();
await champ.fill('ro');
await page.waitForTimeout(100);
verdicts.nouvelleFrappeEffaceHalo = haloAvantFrappe !== null &&
  (await surbrillance()) === null && (await liste.isVisible());

// 17. changementOnglet — halo effacé, liste fermée, texte conservé.
await champ.fill('delcourt');
await page.waitForTimeout(100);
await items.first().click();
await page.waitForTimeout(1000);
await fermerPanneau();
const ongletAccueil = page.locator('.barre-onglets button', { hasText: 'Accueil' });
const ongletCarte = page.locator('.barre-onglets button', { hasText: 'Carte' });
await ongletAccueil.click();
await page.waitForTimeout(200);
await ongletCarte.click();
await page.waitForTimeout(200);
const haloEffaceOnglet = (await surbrillance()) === null &&
  (await champ.inputValue()) === 'delcourt';
await champ.fill('lle'); // liste ouverte, puis aller-retour d'onglet
await page.waitForTimeout(100);
await ongletAccueil.click();
await page.waitForTimeout(200);
await ongletCarte.click();
await page.waitForTimeout(200);
verdicts.changementOnglet = haloEffaceOnglet && (await liste.isHidden()) &&
  (await champ.inputValue()) === 'lle';

// 18a. dicteeRemplace — la dictée REMPLACE (« lyon » → « Lille »), la liste
// suit (Delcourt visible).
const microRecherche = page.locator('.champ-recherche-carte .bouton-micro');
const microPresent = (await microRecherche.count()) === 1;
await champ.fill('lyon');
await page.waitForTimeout(100);
await microRecherche.click();
await page.waitForTimeout(80);
await page.evaluate(() => {
  const i = window.__stubReco.instances;
  i[i.length - 1].emettreResultat('Lille', true);
  i[i.length - 1].emettreFin();
});
await page.waitForTimeout(150);
const dicteeRemplacee = (await champ.inputValue()) === 'Lille' &&
  (await items.allTextContents()).some((t) => t.includes('Menuiserie Delcourt'));

await page.screenshot({ path: `${SCRATCH}/recherche-390.png` });
await page.close();

// ===== Run 2 : API dictée absente + prefers-reduced-motion: reduce ==========

const page2 = await browser.newPage({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const erreurs2 = [];
page2.on('pageerror', (e) => erreurs2.push('pageerror: ' + e.message));
page2.on('console', (m) => { if (m.type() === 'error') erreurs2.push('console: ' + m.text()); });
await preparerRoutes(page2);
await page2.addInitScript(() => {
  window.SpeechRecognition = undefined;
  window.webkitSpeechRecognition = undefined;
});
await page2.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
await page2.waitForTimeout(1000);
await page2.locator('.barre-onglets button', { hasText: 'Carte' }).click();
await page2.waitForTimeout(300);

// 18b. Sans API : aucun bouton micro dans le champ de recherche.
verdicts.dicteeRemplace = microPresent && dicteeRemplacee &&
  (await page2.locator('.champ-recherche-carte .bouton-micro').count()) === 0;

// 19. reducedMotion — halo posé sans pulsation, recentrage sans vol.
await page2.locator('#recherche-carte').fill('delcourt');
await page2.waitForTimeout(100);
await page2.locator('#recherche-resultats .item-resultat[data-resultat]').first().click();
await page2.waitForTimeout(250); // setView animate:false : immédiat
const vue19 = await page2.evaluate(() => window.UltimaCarte.vue());
const halo19 = await page2.evaluate(() => window.UltimaCarte.surbrillancePosition());
const animation19 = await page2.evaluate(() => {
  const p = document.querySelector('#carte path.halo-resultat');
  return p ? getComputedStyle(p).animationName : 'absent';
});
verdicts.reducedMotion = proche(vue19.lat, DELCOURT.lat) && proche(vue19.lng, DELCOURT.lng) &&
  vue19.zoom >= 13 && halo19 && proche(halo19.lat, DELCOURT.lat) &&
  animation19 === 'none';
await page2.close();

// 20. zeroErreurConsole — sur tout le scénario (les deux contextes).
verdicts.zeroErreurConsole = erreurs.length === 0 && erreurs2.length === 0;

// ================= Bilan ====================================================

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', erreurs.length || erreurs2.length ? erreurs.concat(erreurs2) : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true);
await browser.close();
console.log(ok ? 'SMOKE-RECHERCHE OK' : 'SMOKE-RECHERCHE ECHEC');
process.exit(ok ? 0 : 1);
