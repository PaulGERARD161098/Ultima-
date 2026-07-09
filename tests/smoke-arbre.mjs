// Arbre des contacts (A3, le pivot) — flux front en mode démo, 390 px.
// Couvre les 9 points de design/spec-a3-arbre.md :
//   1. N contacts → N étiquettes, groupées par secteur normalisé.
//   2. Sans-secteur → branche « À classer ».
//   3. Tap sur une feuille → bonne fiche (sans quitter l'arbre).
//   4. Contraste mesuré ≥ 4,5:1 + type en toutes lettres (double codage).
//   5. Navigation clavier : feuilles focusables + activables (Entrée).
//   6. Déterminisme : même jeu de données → même structure.
//   7. Perf : 150 contacts rendus sans erreur, budget de temps attesté.
//   8. Arrivée sur l'arbre ; carte + recherche v3-⑥ toujours accessibles.
//   9. Zéro erreur console (la non-régression globale = lancer.sh vert).
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
await page.goto('http://127.0.0.1:8123/', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

// ===== 8a. Arrivée : l'écran connecté/démo est l'arbre. =====
verdicts.arriveeArbre = await page.locator('#espace-arbre').isVisible();
verdicts.ongletArbreCourant = (await page.locator('.barre-onglets .onglet[data-onglet="arbre"]')
  .getAttribute('aria-current')) === 'page';
verdicts.cartoucheUltima = (await page.locator('#arbre-titre').textContent()).trim() === 'ULTIMA';

// ===== 1. N contacts démo (9) → N étiquettes ; toutes « À classer ». =====
verdicts.neufFeuilles = (await page.locator('.arbre-feuille').count()) === 9;
const bannieres0 = await page.evaluate(() => Array.from(
  document.querySelectorAll('#arbre-scene .arbre-svg text')).map((t) => t.textContent));
verdicts.brancheAClasser = bannieres0.includes('À classer'); // point 2 (démo sans secteur)

// Pas de scroll horizontal de page (viewBox adaptatif, svg borné).
verdicts.pasDeScrollHorizontal = await page.evaluate(() =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

await page.screenshot({ path: `${SCRATCH}/arbre-390.png` });

// ===== 2 + 1 (DOM) : créer « Plomberie » et « plomberie » → UNE branche. =====
async function creerContact(nom, secteur, type) {
  await page.locator('#arbre-ajouter').click();
  await page.waitForTimeout(150);
  if (type) { await page.locator('#noeud-type').selectOption(type); }
  await page.locator('#noeud-nom').fill(nom);
  if (secteur !== undefined) { await page.locator('#noeud-secteur_activite').fill(secteur); }
  await page.locator('#form-noeud button[type="submit"]').click();
  await page.waitForTimeout(250);
  await page.locator('#bouton-fermer-panneau').click();
  await page.waitForTimeout(150);
}
await creerContact('Alpha Tubes', 'Plomberie', 'artisan');
await creerContact('Beta Robinet', 'plomberie', 'lead'); // même secteur, casse ≠

verdicts.onzeFeuilles = (await page.locator('.arbre-feuille').count()) === 11;
const banniereTextes = await page.evaluate(() => Array.from(
  document.querySelectorAll('#arbre-scene .arbre-svg text'))
  .map((t) => t.textContent));
verdicts.uneBranchePlomberie =
  banniereTextes.filter((t) => t.toLowerCase() === 'plomberie').length === 1;
verdicts.grapheiePremiere = banniereTextes.includes('Plomberie'); // 1re graphie conservée

// ===== 3. Tap sur une feuille (contact démo) → bonne fiche, on reste sur l'arbre.
await page.locator('.arbre-feuille[data-noeud-id="demo-n1"]').click();
await page.waitForTimeout(250);
verdicts.ficheOuverte = (await page.locator('#panneau-titre').textContent()) === 'Menuiserie Delcourt';
verdicts.resteSurArbre = await page.locator('#espace-arbre').isVisible() &&
  !(await page.locator('#espace-carte').isVisible());
await page.locator('#bouton-fermer-panneau').click();
await page.waitForTimeout(150);

// ===== 4. Contraste mesuré (texte foncé sur feuille claire) + type en lettres.
const mesure = await page.evaluate(() => {
  const feuille = document.querySelector('.arbre-feuille[data-noeud-id="demo-n1"]');
  const cadre = feuille.querySelector('.arbre-feuille-cadre');
  const textes = feuille.querySelectorAll('text');
  const nomFill = textes[0].getAttribute('fill');
  const typeTexte = textes[1].textContent;
  const bg = cadre.getAttribute('fill');
  const hex = (h) => {
    const n = h.replace('#', '');
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const lum = (rgb) => {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const l1 = lum(hex(nomFill));
  const l2 = lum(hex(bg));
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return { ratio, typeTexte };
});
verdicts.contrasteAA = mesure.ratio >= 4.5;
verdicts.typeEnToutesLettres = mesure.typeTexte === 'Artisan'; // double codage (pas que couleur)

// ===== 5. Clavier : feuilles focusables (tabindex/role) + activation Entrée.
verdicts.feuilleFocusable = await page.evaluate(() => {
  const f = document.querySelector('.arbre-feuille');
  return f.getAttribute('tabindex') === '0' && f.getAttribute('role') === 'button';
});
await page.locator('.arbre-feuille[data-noeud-id="demo-n2"]').focus();
verdicts.focusEffectif = await page.evaluate(() =>
  document.activeElement && document.activeElement.getAttribute('data-noeud-id') === 'demo-n2');
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
verdicts.activationClavier = (await page.locator('#panneau-titre').textContent()) === 'Plomberie Roux & Fils';
await page.locator('#bouton-fermer-panneau').click();
await page.waitForTimeout(150);

// ===== 6. Déterminisme + 7. Perf 150, via la fonction pure calculerLayout. =====
const pur = await page.evaluate(() => {
  const fixtures = [
    { id: 'a', nom: 'Zébulon', type: 'artisan', secteur_activite: 'Plomberie' },
    { id: 'b', nom: 'Alba', type: 'lead', secteur_activite: 'plomberie' },
    { id: 'c', nom: 'Marc', type: 'partenaire', secteur_activite: 'Toiture' },
    { id: 'd', nom: 'Nina', type: 'chantier' },
    { id: 'e', nom: 'Omar', type: 'artisan', secteur_activite: '  PLOMBERIE ' }
  ];
  const projeter = (l) => JSON.stringify({
    viewBox: l.viewBox,
    branches: l.bandes.map((b) => ({
      label: b.label,
      ids: b.contacts.map((c) => c.noeud.id),
      pos: b.contacts.map((c) => [c.x, c.y])
    }))
  });
  const l1 = window.UltimaArbre.calculerLayout(fixtures);
  const l2 = window.UltimaArbre.calculerLayout(fixtures);
  // 150 contacts : rendu réel dans un conteneur détaché, budget de temps.
  const gros = [];
  for (let i = 0; i < 150; i++) {
    gros.push({ id: 'g' + i, nom: 'Contact ' + i, type: ['artisan', 'partenaire', 'lead', 'chantier'][i % 4],
      secteur_activite: 'Secteur ' + (i % 12) });
  }
  const div = document.createElement('div');
  document.body.appendChild(div);
  const t0 = performance.now();
  const l150 = window.UltimaArbre.rendre(div, gros, {
    surClicNoeud: function () {}, libellesType: { artisan: 'Artisan', partenaire: 'Partenaire', lead: 'Lead', chantier: 'Chantier' }
  });
  const ms = performance.now() - t0;
  const nbFeuilles = div.querySelectorAll('.arbre-feuille').length;
  div.remove();
  return {
    deterministe: projeter(l1) === projeter(l2),
    nbBranches: l1.nbBranches,
    nbContacts: l1.nbContacts,
    branche0: l1.bandes[0].label,
    ordre0: l1.bandes[0].contacts.map((c) => c.noeud.nom),
    dernier: l1.bandes[l1.bandes.length - 1].label,
    dernierId: l1.bandes[l1.bandes.length - 1].contacts[0].noeud.id,
    ms, nbFeuilles, nb150: l150.nbContacts
  };
});
verdicts.determinisme = pur.deterministe;
verdicts.groupeParSecteur = pur.nbBranches === 3 && pur.nbContacts === 5;
verdicts.premiereGraphieTri = pur.branche0 === 'Plomberie' &&
  JSON.stringify(pur.ordre0) === JSON.stringify(['Alba', 'Omar', 'Zébulon']);
verdicts.aClasserEnDernier = pur.dernier === 'À classer' && pur.dernierId === 'd';
verdicts.perf150 = pur.nb150 === 150 && pur.nbFeuilles === 150 && pur.ms < 800;

// ===== 8b. Non-régression carte : onglet accessible, recherche v3-⑥ vivante. =====
await page.locator('.barre-onglets .onglet[data-onglet="carte"]').click();
await page.waitForTimeout(400);
verdicts.carteAccessible = await page.locator('#espace-carte').isVisible() &&
  (await page.locator('#carte').count()) === 1;
const rechercheCarte = page.locator('#recherche-carte');
await rechercheCarte.fill('Lyon');
await page.waitForTimeout(300);
verdicts.rechercheCarteVivante =
  (await page.locator('#recherche-resultats .item-resultat[data-resultat]').count()) >= 1;
await rechercheCarte.fill('');

// ===== Retour arbre : recherche (mise en évidence, pas réduction). =====
await page.locator('.barre-onglets .onglet[data-onglet="arbre"]').click();
await page.waitForTimeout(300);
await page.locator('#arbre-recherche').fill('Delcourt');
await page.waitForTimeout(250);
verdicts.rechercheArbreMiseEnEvidence =
  (await page.locator('.arbre-feuille').count()) === 11 && // toujours toutes présentes
  (await page.locator('.arbre-feuille--attenuee').count()) === 10; // 1 mise en évidence
verdicts.messageRecherche = (await page.locator('#arbre-recherche-message').textContent())
  .includes('mis en évidence');
await page.locator('#arbre-recherche').fill('');
await page.waitForTimeout(200);
verdicts.rechercheReset = (await page.locator('.arbre-feuille--attenuee').count()) === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('mesure contraste ~', mesure.ratio.toFixed(2), ':1 | perf 150 ~', pur.ms.toFixed(1), 'ms');
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-ARBRE OK' : 'SMOKE-ARBRE ECHEC');
process.exit(ok ? 0 : 1);
