// Habillage antique R1 (spec design/spec-r1-graphisme.md) : arrivée sur la
// carte, filtre sépia par palier de zoom, classes exclusives, voile Ptolémée
// (opacités 1 / 0,65 / 0), décor muet (RA4), cartouche ULTIMA + hauteurs
// d'entête, marqueurs cerne encre + halo inchangé, contraste mesuré sur
// capture, reduced-motion, zéro requête réseau nouvelle.
// Mode démo forcé, Leaflet/OSM stubés, zéro erreur console tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const leafletJs = readFileSync(`${SCRATCH}/package/dist/leaflet.js`);
const leafletCss = readFileSync(`${SCRATCH}/package/dist/leaflet.css`);
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

const DELCOURT = { lat: 50.6292, lng: 3.0573 };

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
  // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

// ---- Décodeur PNG minimal (captures Playwright : 8 bits, RGB/RGBA, non
// entrelacé) pour mesurer le contraste sur pixels réels sans dépendance. ----
function decoderPng(tampon) {
  let pos = 8;
  let largeur = 0, hauteur = 0, canaux = 4;
  const idat = [];
  while (pos < tampon.length) {
    const taille = tampon.readUInt32BE(pos);
    const type = tampon.toString('ascii', pos + 4, pos + 8);
    const donnees = tampon.subarray(pos + 8, pos + 8 + taille);
    if (type === 'IHDR') {
      largeur = donnees.readUInt32BE(0);
      hauteur = donnees.readUInt32BE(4);
      canaux = donnees[9] === 2 ? 3 : 4;
      if (donnees[8] !== 8 || donnees[12] !== 0 || (donnees[9] !== 2 && donnees[9] !== 6)) {
        throw new Error('format PNG non géré par le harnais');
      }
    } else if (type === 'IDAT') { idat.push(donnees); }
    pos += 12 + taille;
  }
  const brut = inflateSync(Buffer.concat(idat));
  const stride = largeur * canaux;
  const pixels = Buffer.alloc(hauteur * stride);
  for (let y = 0; y < hauteur; y++) {
    const filtre = brut[y * (stride + 1)];
    const ligne = brut.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const gauche = x >= canaux ? pixels[y * stride + x - canaux] : 0;
      const haut = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const hautGauche = (y > 0 && x >= canaux) ? pixels[(y - 1) * stride + x - canaux] : 0;
      let v = ligne[x];
      if (filtre === 1) { v += gauche; }
      else if (filtre === 2) { v += haut; }
      else if (filtre === 3) { v += (gauche + haut) >> 1; }
      else if (filtre === 4) {
        const p = gauche + haut - hautGauche;
        const pa = Math.abs(p - gauche), pb = Math.abs(p - haut), pc = Math.abs(p - hautGauche);
        v += (pa <= pb && pa <= pc) ? gauche : (pb <= pc ? haut : hautGauche);
      }
      pixels[y * stride + x] = v & 0xff;
    }
  }
  return { largeur, hauteur, canaux, stride, pixels };
}

function luminance(r, g, b) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Ratio WCAG entre le pixel le plus sombre (cerne encre) et le plus clair
// (fond adjacent) d'une petite capture centrée sur un marqueur.
function ratioContraste(capture) {
  const png = decoderPng(capture);
  let lMin = 1, lMax = 0;
  for (let y = 0; y < png.hauteur; y++) {
    for (let x = 0; x < png.largeur; x++) {
      const o = y * png.stride + x * png.canaux;
      const l = luminance(png.pixels[o], png.pixels[o + 1], png.pixels[o + 2]);
      if (l < lMin) { lMin = l; }
      if (l > lMax) { lMax = l; }
    }
  }
  return (lMax + 0.05) / (lMin + 0.05);
}

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const verdicts = {};

// ================= Run 1 : desktop 1280, parcours principal =================

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const erreurs = [];
const requetesEtrangeres = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
// Zéro requête réseau nouvelle : tout le décor est inline/data-URI (constat 10).
page.on('request', (r) => {
  const url = r.url();
  if (!/^http:\/\/127\.0\.0\.1:8123\//.test(url) &&
      !/unpkg\.com/.test(url) && !/openstreetmap\.org/.test(url) &&
      !url.startsWith('data:')) {
    requetesEtrangeres.push(url);
  }
});
await preparerRoutes(page);

const vue = () => page.evaluate(() => window.UltimaCarte.vue());
// État complet du palier courant : classes posées sur #carte, filtre calculé
// du tile-pane, opacité/z-index/pointer-events calculés du pane voile.
const etatPalier = () => page.evaluate(() => {
  const carte = document.getElementById('carte');
  const voile = document.querySelector('.pane-voile');
  const styleVoile = getComputedStyle(voile);
  return {
    classes: ['zoom-pays', 'zoom-large', 'zoom-region', 'zoom-rue']
      .filter((c) => carte.classList.contains(c)),
    filtre: getComputedStyle(carte.querySelector('.leaflet-tile-pane')).filter,
    voileOpacite: parseFloat(styleVoile.opacity),
    voileZ: styleVoile.zIndex,
    voilePointeur: styleVoile.pointerEvents,
  };
});
const zoomVers = async (cible) => {
  for (let garde = 0; garde < 20; garde++) {
    const z = (await vue()).zoom;
    if (z === cible) { break; }
    await page.locator(z < cible ? '.leaflet-control-zoom-in' : '.leaflet-control-zoom-out').click();
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(550); // transition d'opacité du voile (400 ms)
};
const procheDe = (valeur, attendu) => Math.abs(valeur - attendu) <= 0.05;
// Capture 44×44 autour d'un marqueur → ratio cerne/fond mesuré sur pixels.
const contrasteAutour = async (cx, cy) => {
  const capture = await page.screenshot({
    clip: { x: Math.max(0, cx - 22), y: Math.max(0, cy - 22), width: 44, height: 44 },
  });
  return ratioContraste(capture);
};

await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1100);

// 1. Arrivée : l'espace Arbre est visible sans geste (A3, le pivot) ; l'Accueil
// et la Carte restent accessibles par leur onglet (aller-retour réel).
const arbreVisibleArrivee = (await page.locator('#espace-arbre').isVisible()) &&
  (await page.locator('#espace-accueil').isHidden()) &&
  (await page.locator('.barre-onglets .onglet[data-onglet="arbre"][aria-current="page"]').count()) === 1;
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(300);
const accueilAccessible = await page.locator('#espace-accueil').isVisible();
await page.locator('.barre-onglets .onglet[data-onglet="carte"]').click();
await page.waitForTimeout(300);
verdicts.arriveeSurArbre = arbreVisibleArrivee && accueilAccessible &&
  (await page.locator('#espace-carte').isVisible());

// 6a. Cartouche : H1 « ULTIMA » dans l'entête, .entete-titre disparu,
// hauteur d'entête ≤ 72 px à 1280.
verdicts.cartouche = await page.evaluate(() => {
  const titre = document.querySelector('.entete h1.cartouche-titre');
  return Boolean(titre) && titre.textContent === 'ULTIMA' &&
    document.querySelectorAll('.entete-titre').length === 0;
});
verdicts.enteteDesktop = await page.evaluate(() =>
  document.querySelector('.entete').getBoundingClientRect().height <= 72);

// 6b. La barre d'outils reste actionnable sous le cartouche : « + Ajouter »
// reçoit le clic et ouvre le formulaire.
await page.locator('#bouton-ajouter').click();
await page.waitForTimeout(250);
verdicts.boutonAjouterActif = await page.locator('#form-noeud').isVisible();
await page.keyboard.press('Escape');
await page.waitForTimeout(250);

// 4a. Voile : le pane existe, zIndex calculé 300, pointer-events none.
const palierInitial = await etatPalier();
verdicts.paneVoile = palierInitial.voileZ === '300' && palierInitial.voilePointeur === 'none';

// 5. Décor muet (RA4) : pointer-events calculé none sur cadre et voile ;
// elementFromPoint au centre de la carte ne retourne ni l'un ni l'autre.
verdicts.decorMuet = await page.evaluate(() => {
  const cadre = document.querySelector('.cadre-carte');
  const voile = document.querySelector('.pane-voile');
  const r = document.getElementById('carte').getBoundingClientRect();
  const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return getComputedStyle(cadre).pointerEvents === 'none' &&
    getComputedStyle(voile).pointerEvents === 'none' &&
    Boolean(el) && !el.closest('.cadre-carte') && !el.closest('.pane-voile');
});

// 7a. Marqueurs : cerne encre #5a4118, fill-opacity 1, les 4 fills de
// COULEURS_TYPE inchangés (9 nœuds de démo positionnés).
verdicts.marqueursEncres = await page.evaluate(() => {
  const chemins = Array.from(document.querySelectorAll(
    '#carte .leaflet-overlay-pane path[stroke="#5a4118"][fill-opacity="1"]'));
  const fills = new Set(chemins.map((p) => p.getAttribute('fill')));
  return chemins.length === 9 &&
    ['#e8781e', '#1e6fb8', '#1f8a4c', '#7a3fb5'].every((c) => fills.has(c));
});

// 2a + 3 + 4b. Zoom 6 (arrivée) : régime plein, classe zoom-large seule,
// voile à 0,65.
const palier6 = await etatPalier();
verdicts.filtrePleinZoom6 = palier6.filtre.includes('sepia(0.9)');
verdicts.palierLarge = palier6.classes.length === 1 && palier6.classes[0] === 'zoom-large' &&
  procheDe(palier6.voileOpacite, 0.65);

// 8a. Contraste (RA1) mesuré sur capture à zoom 6 : ratio cerne/fond ≥ 3:1
// autour d'un marqueur (tuiles stubées : le fond est le parchemin + voile).
const posMarqueur6 = await page.evaluate(() => {
  const p = document.querySelector('#carte .leaflet-overlay-pane path[stroke="#5a4118"]');
  const r = p.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
const ratio6 = await contrasteAutour(posMarqueur6.x, posMarqueur6.y);
verdicts.contrasteZoom6 = ratio6 >= 3;

// 3 + 4c. Zoom 5 : zoom-pays seule, voile plein (opacité 1), régime plein.
await zoomVers(5);
const palier5 = await etatPalier();
verdicts.palierPays = palier5.classes.length === 1 && palier5.classes[0] === 'zoom-pays' &&
  procheDe(palier5.voileOpacite, 1) && palier5.filtre.includes('sepia(0.9)');

// 3 + 4d. Zoom 9 : zoom-region seule, voile disparu (opacité 0).
await zoomVers(9);
const palier9 = await etatPalier();
verdicts.palierRegion = palier9.classes.length === 1 && palier9.classes[0] === 'zoom-region' &&
  procheDe(palier9.voileOpacite, 0) && palier9.filtre.includes('sepia(0.9)');

// 2b + 3 + 4e. Zoom 13 : zoom-rue seule, régime allégé sepia(0.75), voile absent.
await zoomVers(13);
const palier13 = await etatPalier();
verdicts.palierRue = palier13.classes.length === 1 && palier13.classes[0] === 'zoom-rue' &&
  procheDe(palier13.voileOpacite, 0);
verdicts.filtreAllegeZoom13 = palier13.filtre.includes('sepia(0.75)');

// 7b. Halo de recherche inchangé : sélection d'un résultat → path.halo-resultat
// en stroke #1f2937 (v3-⑥ non régressé).
await page.locator('#recherche-carte').fill('delcourt');
await page.waitForTimeout(150);
await page.locator('#recherche-resultats .item-resultat[data-resultat]').first().click();
await page.waitForTimeout(1500); // flyTo 0.8 s
verdicts.haloInchange = await page.evaluate(() => {
  const halo = document.querySelector('#carte path.halo-resultat');
  return Boolean(halo) && halo.getAttribute('stroke') === '#1f2937';
});
await page.locator('#bouton-fermer-panneau').click();
await page.waitForTimeout(250);

// 5b + 8b. Clic sur un marqueur PROCHE DU BORD (sous le vignettage du cadre) :
// la fiche s'ouvre quand même — le décor ne vole aucun geste. On mesure aussi
// le contraste sur capture à zoom 13 au passage.
// Décale le centre de +0,1° de longitude : à zoom 13 le marqueur Delcourt
// passe à ≈ 58 px du bord gauche (0,1° ≈ 583 px).
await page.evaluate((p) => window.UltimaCarte.centrer(p.lat, p.lng + 0.1), DELCOURT);
await page.waitForTimeout(1000);
const cibleBord = await page.evaluate(() => {
  const carte = document.getElementById('carte').getBoundingClientRect();
  const chemins = Array.from(document.querySelectorAll(
    '#carte .leaflet-overlay-pane path[stroke="#5a4118"]'));
  for (const p of chemins) {
    const r = p.getBoundingClientRect();
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    if (cx - carte.x > 8 && cx - carte.x < 90 &&
        cy - carte.y > 90 && cy - carte.y < carte.height - 90) {
      return { x: cx, y: cy };
    }
  }
  return null;
});
let clicBordOuvreFiche = false;
let ratio13 = 0;
if (cibleBord) {
  ratio13 = await contrasteAutour(cibleBord.x, cibleBord.y);
  await page.mouse.click(cibleBord.x, cibleBord.y);
  await page.waitForTimeout(400);
  clicBordOuvreFiche = (await page.locator('#panneau').isVisible()) &&
    (await page.locator('#panneau-titre').textContent()) === 'Menuiserie Delcourt';
}
verdicts.clicMarqueurBord = clicBordOuvreFiche;
verdicts.contrasteZoom13 = ratio13 >= 3;

// 9a. Sans préférence reduced-motion : le fondu du voile est bien de 400 ms.
verdicts.transitionVoile = await page.evaluate(() =>
  getComputedStyle(document.querySelector('.pane-voile')).transitionDuration === '0.4s');

// ===== Registre antique sérieux : purge des résidus enfantins (Caveat +
// panneaux de bois) sur l'Accueil. Trois preuves ciblées : (a) typo à
// l'ancienne en runtime, (b) plaque de parchemin sans poteau ni clous, (c) la
// non-régression de l'habillage R1 est portée par les verdicts ci-dessus. =====
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(350);
await page.evaluate(() => document.fonts.ready);

// (a) Aucune écriture manuscrite en runtime : la pile typo résolue des titres
// d'Accueil est old-style (serif), jamais « Caveat » ni « cursive », et plus
// aucune @font-face « Caveat » n'est enregistrée (blocs @font-face supprimés).
verdicts.typoAncienneRuntime = await page.evaluate(() => {
  const idsTitres = ['accueil-titre'];
  const titresOk = idsTitres.every((id) => {
    const el = document.getElementById(id);
    if (!el) return false;
    const ff = getComputedStyle(el).fontFamily;
    return /serif/i.test(ff) && !/caveat/i.test(ff) && !/cursive/i.test(ff);
  });
  let caveatDeclaree = false;
  document.fonts.forEach((f) => { if (/caveat/i.test(f.family)) caveatDeclaree = true; });
  return titresOk && !caveatDeclaree;
});

// (b) Plaque de relance : plus de poteau (::before) ni de clous (::after) —
// aucun pseudo-élément décoratif —, fond parchemin en dégradé (rgb --parchemin),
// texte encre sépia (#3b2f1c), plus aucune couleur bois (#6b4a2b = rgb 107,74,43).
verdicts.plaqueParcheminSansBois = await page.evaluate(() => {
  const plaque = document.querySelector('.panneau-bois');
  const texte = document.querySelector('.panneau-bois-texte');
  if (!plaque || !texte) return false;
  const avant = getComputedStyle(plaque, '::before').content;
  const apres = getComputedStyle(plaque, '::after').content;
  const st = getComputedStyle(plaque);
  const ffTexte = getComputedStyle(texte).fontFamily;
  const sansPseudo = (avant === 'none' || avant === 'normal') &&
    (apres === 'none' || apres === 'normal');
  return sansPseudo &&
    st.backgroundImage.includes('linear-gradient') &&
    st.backgroundImage.includes('rgb(246, 238, 217)') &&   // --parchemin, plus le bois
    !st.backgroundImage.includes('rgb(107, 74, 43)') &&     // --bois disparu
    !st.backgroundColor.includes('rgb(107, 74, 43)') &&
    st.color === 'rgb(59, 47, 28)' &&                        // --encre-sepia
    /serif/i.test(ffTexte) && !/cursive/i.test(ffTexte);
});

await page.locator('.barre-onglets .onglet[data-onglet="carte"]').click();
await page.waitForTimeout(300);

await page.screenshot({ path: `${SCRATCH}/antique-1280.png` });
await page.close();

// ================= Run 2 : mobile 375, hauteur d'entête ====================

const page2 = await browser.newPage({ viewport: { width: 375, height: 700 } });
const erreurs2 = [];
page2.on('pageerror', (e) => erreurs2.push('pageerror: ' + e.message));
page2.on('console', (m) => { if (m.type() === 'error') erreurs2.push('console: ' + m.text()); });
await preparerRoutes(page2);
await page2.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page2.waitForTimeout(900);

// 6c. Entête ≤ 60 px à 375 (pastille démo visible incluse), sous-titre masqué.
verdicts.enteteMobile = await page2.evaluate(() => {
  const entete = document.querySelector('.entete').getBoundingClientRect();
  const sous = getComputedStyle(document.querySelector('.cartouche-sous')).display;
  return entete.height <= 60 && sous === 'none';
});
await page2.screenshot({ path: `${SCRATCH}/antique-375.png` });
await page2.close();

// ================= Run 3 : prefers-reduced-motion: reduce ===================

const page3 = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'reduce',
});
const erreurs3 = [];
page3.on('pageerror', (e) => erreurs3.push('pageerror: ' + e.message));
page3.on('console', (m) => { if (m.type() === 'error') erreurs3.push('console: ' + m.text()); });
await preparerRoutes(page3);
await page3.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page3.waitForTimeout(900);

// 9b. Reduced-motion : transition calculée none sur le voile (l'opacité saute).
verdicts.reducedMotionVoile = await page3.evaluate(() => {
  const style = getComputedStyle(document.querySelector('.pane-voile'));
  return style.transitionDuration === '0s' && parseFloat(style.opacity) === 0.65;
});
await page3.close();

// 10. Non-régression réseau + console : aucun hôte nouveau, zéro erreur.
verdicts.zeroRequeteNouvelle = requetesEtrangeres.length === 0;
verdicts.zeroErreurConsole = erreurs.length === 0 && erreurs2.length === 0 && erreurs3.length === 0;

// ================= Bilan ====================================================

console.log(JSON.stringify(verdicts, null, 2));
console.log('ratios contraste mesurés : zoom 6 =', ratio6.toFixed(2), '· zoom 13 =', ratio13.toFixed(2));
console.log('erreurs:', (erreurs.length || erreurs2.length || erreurs3.length)
  ? erreurs.concat(erreurs2, erreurs3) : 'aucune');
console.log('requêtes étrangères:', requetesEtrangeres.length ? requetesEtrangeres : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true);
await browser.close();
console.log(ok ? 'SMOKE-ANTIQUE OK' : 'SMOKE-ANTIQUE ECHEC');
process.exit(ok ? 0 : 1);
