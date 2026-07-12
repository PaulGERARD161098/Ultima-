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
await page.goto('http://127.0.0.1:8123/#traveller', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

// ===== 8a. Arrivée : l'écran connecté/démo est l'arbre. =====
verdicts.arriveeArbre = await page.locator('#espace-arbre').isVisible();
verdicts.ongletArbreCourant = (await page.locator('.barre-onglets .onglet[data-onglet="arbre"]')
  .getAttribute('aria-current')) === 'page';
verdicts.cartoucheUltima = (await page.locator('#arbre-titre').textContent()).trim() === 'ULTIMA';

// ===== 1. N contacts démo (9) → N étiquettes ; branches réelles + « À classer ».
// A4 : quelques fixtures démo portent un secteur (vraies branches) ; les leads/
// chantiers sans secteur (demo-n7/8/9) restent sous « À classer ».
verdicts.neufFeuilles = (await page.locator('.arbre-feuille').count()) === 9;
const bannieres0 = await page.evaluate(() => Array.from(
  document.querySelectorAll('#arbre-scene .arbre-svg text')).map((t) => t.textContent));
verdicts.brancheAClasser = bannieres0.includes('À classer'); // point 2
verdicts.branchesReellesDemo = ['Menuiserie', 'Plomberie', 'Électricité', 'Courtage', 'Toiture']
  .every((s) => bannieres0.includes(s)); // A4 : l'arbre démo montre de vraies branches

// Pas de scroll horizontal de page (viewBox adaptatif, svg borné).
verdicts.pasDeScrollHorizontal = await page.evaluate(() =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

// Mobile inchangé (A3 responsive) : à 390 px (clientWidth ~377 < 820), palier
// base -> data-palier "3" et viewBox '0 0 620 …', rendu strictement identique à
// avant. Le run desktop 1280 (plus bas) prouve l'élargissement symétrique.
verdicts.mobileInchange = await page.evaluate(() => {
  const scene = document.querySelector('#arbre-scene');
  const svg = scene && scene.querySelector('.arbre-svg');
  return !!svg && scene.getAttribute('data-palier') === '3' &&
    svg.getAttribute('viewBox').startsWith('0 0 620 ');
});

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
  const typeFill = textes[1].getAttribute('fill');
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
  const ratioContre = (fill) => {
    const l1 = lum(hex(fill));
    const l2 = lum(hex(bg));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  // ratio = nom foncé ; ratioType = type italique (le plus tendu, ~6,5:1 en A3 :
  // A4 vérifie qu'aucune finition ne l'a fait retomber sous AA).
  return { ratio: ratioContre(nomFill), ratioType: ratioContre(typeFill), typeTexte };
});
verdicts.contrasteAA = mesure.ratio >= 4.5;
verdicts.contrasteTypeAA = mesure.ratioType >= 4.5; // A4 : type italique conforme
verdicts.typeEnToutesLettres = mesure.typeTexte === 'Artisan'; // double codage (pas que couleur)

// ===== RB2. Bannière de secteur : le libellé (l'info portée par le texte, cf.
// REFONTE-ARBRE §4 « l'arbre décoratif qui cache l'outil ») doit être AA sur son
// propre fond. Mesure DÉDIÉE, distincte du contraste des feuilles : texte de la
// bannière vs. fond effectif du rectangle-bannière (fond plat, pas un dégradé).
const mesureBanniere = await page.evaluate(() => {
  // La bannière « Menuiserie » (secteur démo) : rect + texte dans un même <g>,
  // le rect est le frère précédent immédiat du texte (cf. dessinerBannieres).
  const textes = Array.from(document.querySelectorAll('#arbre-scene .arbre-svg text'));
  const label = textes.find((t) => t.textContent === 'Menuiserie');
  if (!label) return null;
  const rect = label.previousElementSibling; // le rectangle-bannière du secteur
  const textFill = label.getAttribute('fill');
  const rectFill = rect ? rect.getAttribute('fill') : null;
  const hex = (h) => {
    const n = (h || '').replace('#', '');
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const lum = (rgb) => {
    const c = rgb.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  if (!textFill || !rectFill) return { textFill, rectFill, ratio: 0 };
  const l1 = lum(hex(textFill)), l2 = lum(hex(rectFill));
  return { textFill, rectFill, ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) };
});
verdicts.banniereMesuree = !!mesureBanniere && mesureBanniere.ratio > 0;
verdicts.contrasteBanniereAA = !!mesureBanniere && mesureBanniere.ratio >= 4.5; // RB2 : ≥ AA

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
  // Pin explicite du palier base (620) : le groupement, les totaux et le tri par
  // nom sont invariants du nombre de colonnes -> attentes inchangées, mais
  // désormais indépendantes de la largeur ambiante du body.
  const l1 = window.UltimaArbre.calculerLayout(fixtures, 620);
  const l2 = window.UltimaArbre.calculerLayout(fixtures, 620);
  // Déterminisme desktop : même entrée (fixtures, 1240) -> même sortie (réutilise
  // le projeter défini ci-dessus).
  const d1 = window.UltimaArbre.calculerLayout(fixtures, 1240);
  const d2 = window.UltimaArbre.calculerLayout(fixtures, 1240);
  // Rangées selon palier : une branche de 6 contacts -> ceil(6/3)=2 rangées à la
  // base (3 col), ceil(6/6)=1 rangée en P6 (6 col). LE verdict qui diffère par
  // largeur (les fixtures démo, branches <= 3, ne l'exercent pas).
  const six = Array.from({ length: 6 }, (_, i) => (
    { id: 'r' + i, nom: 'R' + i, type: 'artisan', secteur_activite: 'Toiture' }));
  const rangeesBase = window.UltimaArbre.calculerLayout(six, 620).bandes[0].rangees;
  const rangeesP6 = window.UltimaArbre.calculerLayout(six, 1240).bandes[0].rangees;
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
    ms, nbFeuilles, nb150: l150.nbContacts,
    deterministeDesktop: projeter(d1) === projeter(d2),
    rangeesBase, rangeesP6
  };
});
verdicts.determinisme = pur.deterministe;
verdicts.determinismeDesktop = pur.deterministeDesktop;
verdicts.groupeParSecteur = pur.nbBranches === 3 && pur.nbContacts === 5;
verdicts.premiereGraphieTri = pur.branche0 === 'Plomberie' &&
  JSON.stringify(pur.ordre0) === JSON.stringify(['Alba', 'Omar', 'Zébulon']);
verdicts.aClasserEnDernier = pur.dernier === 'À classer' && pur.dernierId === 'd';
verdicts.perf150 = pur.nb150 === 150 && pur.nbFeuilles === 150 && pur.ms < 800;
verdicts.rangeesSelonPalier = pur.rangeesBase === 2 && pur.rangeesP6 === 1;

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

// ===== A4-1. Pousse animée à l'ajout, coupée sous prefers-reduced-motion. =====
// Mouvement autorisé : la feuille créée porte la classe pousse et anime.
await page.emulateMedia({ reducedMotion: 'no-preference' });
await creerContact('Gamma Pousse', 'Plomberie', 'artisan');
verdicts.uneSeulePousse = (await page.locator('.arbre-feuille--pousse').count()) === 1;
verdicts.pousseAnimee = await page.evaluate(() => {
  const f = document.querySelector('.arbre-feuille--pousse');
  return !!f && getComputedStyle(f).animationName === 'arbre-pousse';
});
// Mouvement réduit : la MÊME feuille ne s'anime plus (apparition immédiate).
await page.emulateMedia({ reducedMotion: 'reduce' });
const reduit = await page.evaluate(() => {
  const f = document.querySelector('.arbre-feuille--pousse');
  const cs = getComputedStyle(f);
  return { nom: cs.animationName, opacite: cs.opacity };
});
verdicts.pousseCoupeeReduce = reduit.nom === 'none';
verdicts.feuilleVisibleReduce = reduit.opacite === '1';
await page.emulateMedia({ reducedMotion: 'no-preference' });

// ===== A4-2. État vide : vider le réseau → message exact + bouton d'ajout. =====
page.on('dialog', (d) => d.accept()); // confirmations de suppression
let garde = 0;
while ((await page.locator('.arbre-feuille').count()) > 0 && garde < 80) {
  await page.locator('.arbre-feuille').first().click();
  await page.waitForTimeout(110);
  await page.locator('.actions-fiche button', { hasText: 'Supprimer' }).first().click();
  await page.waitForTimeout(140);
  garde += 1;
}
verdicts.arbreVide = (await page.locator('.arbre-feuille').count()) === 0;
const blocVide = page.locator('#arbre-scene .arbre-bloc-etat');
verdicts.messageVideExact = (await blocVide.locator('.arbre-etat-texte').textContent())
  .replace(/\s+/g, ' ').trim() === 'Votre arbre attend sa première pousse — touchez +';
verdicts.boutonEtatVide = (await blocVide.locator('button').count()) === 1 &&
  await blocVide.locator('button').isVisible();
verdicts.boutonFlottantVisibleVide = await page.locator('#arbre-ajouter').isVisible();
await page.screenshot({ path: `${SCRATCH}/arbre-vide-390.png` });

// ===== A3 responsive — run desktop 1280×800 : prouve l'élargissement. =====
// Page neuve (état démo restauré, 9 contacts) à 1280 : clientWidth ~1267 ≥ 1240
// -> palier 6 (6 col, VB_W 1240). Les mêmes routes/CDN épinglés que le mobile.
const pageD = await browser.newPage({ viewport: { width: 1280, height: 800 } });
pageD.on('pageerror', (e) => erreurs.push('pageerror(D): ' + e.message));
pageD.on('console', (m) => { if (m.type() === 'error') erreurs.push('console(D): ' + m.text()); });
await pageD.route('**://unpkg.com/**', (route) => {
  const url = route.request().url();
  if (url.endsWith('leaflet.js')) return route.fulfill({ body: leafletJs, contentType: 'application/javascript' });
  if (url.endsWith('leaflet.css')) return route.fulfill({ body: leafletCss, contentType: 'text/css' });
  return route.fulfill({ status: 404, body: '' });
});
await pageD.route('**://*.openstreetmap.org/**', (r) => r.fulfill({ body: PNG_1PX, contentType: 'image/png' }));
await pageD.addInitScript(() => {
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
  });
});
await pageD.goto('http://127.0.0.1:8123/#traveller', { waitUntil: 'load', timeout: 20000 });
await pageD.waitForTimeout(1000);

verdicts.elargissementDesktop = await pageD.evaluate(() => {
  const scene = document.querySelector('#arbre-scene');
  const svg = scene && scene.querySelector('.arbre-svg');
  return !!svg && scene.getAttribute('data-palier') === '6' &&
    svg.getAttribute('viewBox').startsWith('0 0 1240 ');
});
verdicts.pasDeScrollHorizontalDesktop = await pageD.evaluate(() =>
  document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
const bannieresD = await pageD.evaluate(() => Array.from(
  document.querySelectorAll('#arbre-scene .arbre-svg text')).map((t) => t.textContent));
verdicts.branchesDemoDesktop =
  (await pageD.locator('.arbre-feuille').count()) === 9 &&
  ['Menuiserie', 'Plomberie', 'Électricité', 'Courtage', 'Toiture', 'À classer']
    .every((s) => bannieresD.includes(s));
await pageD.screenshot({ path: `${SCRATCH}/arbre-1280.png` });
await pageD.close();

console.log(JSON.stringify(verdicts, null, 2));
console.log('mesure contraste feuille ~', mesure.ratio.toFixed(2), ':1 | bannière secteur ~',
  (mesureBanniere ? mesureBanniere.ratio.toFixed(2) : '?'), ':1 | perf 150 ~', pur.ms.toFixed(1), 'ms');
console.log('erreurs:', erreurs.length ? erreurs : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true) && erreurs.length === 0;
await browser.close();
console.log(ok ? 'SMOKE-ARBRE OK' : 'SMOKE-ARBRE ECHEC');
process.exit(ok ? 0 : 1);
