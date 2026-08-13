// Registre antique et sérieux (R1 / 2026-07-08) — ce qui en RESTE après la
// suppression de la carte, le 2026-08-13.
//
// Ce harnais éprouvait deux choses mêlées : l'habillage antique de la CARTE
// (marqueurs cernés d'encre, paliers de zoom, voile de mer, filtre sépia des
// tuiles, contraste mesuré sur pixels réels) et le registre de la PAGE
// (cartouche, hauteur d'entête, typographie ancienne, plaque de parchemin).
// La carte étant supprimée, la première moitié n'a plus d'objet : elle est
// retirée, et avec elle le décodeur PNG qui ne servait qu'à mesurer le
// contraste des marqueurs sur les tuiles.
//
// Ce qui reste, et qui n'a rien perdu :
//   1. Arrivée sur le CIEL, Accueil accessible — et plus AUCUN onglet Carte.
//   2. Cartouche « ULTIMA » dans l'entête, hauteur ≤ 72 px à 1280.
//   3. Typographie ancienne en runtime : jamais de manuscrit (registre du
//      2026-07-08, qui a retiré le « livre d'enfance »).
//   4. Plaque de relance en parchemin : ni poteau, ni clous, ni couleur bois.
//   5. Entête ≤ 60 px à 375, sous-titre masqué.
//   6. ZÉRO requête vers un hôte tiers — et c'est désormais un absolu : avec
//      Leaflet parti, Ultima ne charge plus rien de l'extérieur. Le harnais
//      n'a plus aucun stub à poser ; il exige le vide.
//   7. Zéro erreur console.
import { chromium } from 'playwright';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;

async function preparerRoutes(page) {
  // Plus aucun stub : ni Leaflet, ni tuiles OSM. Les interceptions qui
  // vivaient ici masquaient les seules requêtes tierces d'Ultima ; il n'y en a
  // plus, et le verdict `zeroRequeteTierce` le prouve au lieu de le supposer.
  await page.addInitScript(() => {
    // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
    try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const verdicts = {};

// ================= Run 1 : desktop 1280, parcours principal =================

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const erreurs = [];
const requetesEtrangeres = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
// Tout le décor est inline ou en data-URI : aucune requête ne doit sortir du
// serveur local. La liste des exceptions tolérées est VIDE, désormais.
page.on('request', (r) => {
  const url = r.url();
  if (!/^http:\/\/127\.0\.0\.1:8123\//.test(url) && !url.startsWith('data:')) {
    requetesEtrangeres.push(url);
  }
});
await preparerRoutes(page);

await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1100);

// 1. Arrivée : l'espace CIEL est visible sans geste (décision de Paul du
// 2026-08-11), l'Accueil reste accessible par son onglet (aller-retour réel),
// et l'onglet Carte n'existe plus (2026-08-13).
const cielVisibleArrivee = (await page.locator('#espace-ciel').isVisible()) &&
  (await page.locator('#espace-accueil').isHidden()) &&
  (await page.locator('.barre-onglets .onglet[data-onglet="ciel"][aria-current="page"]').count()) === 1;
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(300);
const accueilAccessible = await page.locator('#espace-accueil').isVisible();
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(300);
verdicts.arriveeSurCiel = cielVisibleArrivee && accueilAccessible &&
  (await page.locator('#espace-ciel').isVisible());
verdicts.plusDOngletCarte =
  (await page.locator('.barre-onglets .onglet[data-onglet="carte"]').count()) === 0 &&
  (await page.locator('#espace-carte').count()) === 0;

// 2. Cartouche : H1 « ULTIMA » dans l'entête, .entete-titre disparu,
// hauteur d'entête ≤ 72 px à 1280.
verdicts.cartouche = await page.evaluate(() => {
  const titre = document.querySelector('.entete h1.cartouche-titre');
  return Boolean(titre) && titre.textContent === 'ULTIMA' &&
    document.querySelectorAll('.entete-titre').length === 0;
});
verdicts.enteteDesktop = await page.evaluate(() =>
  document.querySelector('.entete').getBoundingClientRect().height <= 72);

// ===== Registre antique sérieux : purge des résidus enfantins (Caveat +
// panneaux de bois) sur l'Accueil. =====
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(350);
await page.evaluate(() => document.fonts.ready);

// 3. Aucune écriture manuscrite en runtime : la pile typo résolue des titres
// d'Accueil est old-style (serif), jamais « Caveat » ni « cursive », et plus
// aucune @font-face « Caveat » n'est enregistrée.
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

// 4. Plaque de relance : plus de poteau (::before) ni de clous (::after) —
// aucun pseudo-élément décoratif —, fond en dégradé de --parchemin, texte en
// --encre-sepia, plus aucune couleur bois (#6b4a2b), police à empattements.
//
// CE VERDICT NE CONNAÎT PLUS LA PALETTE (2026-08-13). Il exigeait littéralement
// `rgb(246, 238, 217)` et `rgb(59, 47, 28)` : les valeurs du parchemin, gravées
// dans le test. Le thème stellaire les a redéfinies et le harnais est passé au
// rouge — alors que la plaque suivait EXACTEMENT ce qu'on lui demande, ses
// jetons. Il lit désormais les jetons et vérifie que la plaque les respecte.
// Ce qu'il protège n'a pas changé d'un mot : le registre gravé, sans bois,
// sans cursive. Un test doit tenir sur ce qui ne doit pas changer, pas sur ce
// qui a le droit de changer.
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
  // Les jetons tels que la page les résout, quels qu'ils soient.
  const sonde = document.createElement('span');
  sonde.style.display = 'none';
  document.body.appendChild(sonde);
  const rgbDuJeton = (nom) => {
    sonde.style.color = `var(${nom})`;
    return getComputedStyle(sonde).color;
  };
  const parchemin = rgbDuJeton('--parchemin');
  const encre = rgbDuJeton('--encre-sepia');
  sonde.remove();
  return sansPseudo &&
    st.backgroundImage.includes('linear-gradient') &&
    st.backgroundImage.includes(parchemin) &&   // le dégradé suit son jeton
    !st.backgroundImage.includes('rgb(107, 74, 43)') &&     // --bois disparu
    !st.backgroundColor.includes('rgb(107, 74, 43)') &&
    st.color === encre &&                                    // l'encre suit le sien
    /serif/i.test(ffTexte) && !/cursive/i.test(ffTexte);
});

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

// 5. Entête ≤ 60 px à 375 (pastille démo visible incluse), sous-titre masqué.
verdicts.enteteMobile = await page2.evaluate(() => {
  const entete = document.querySelector('.entete').getBoundingClientRect();
  const sous = getComputedStyle(document.querySelector('.cartouche-sous')).display;
  return entete.height <= 60 && sous === 'none';
});
await page2.screenshot({ path: `${SCRATCH}/antique-375.png` });
await page2.close();

// 6 + 7. Non-régression réseau + console : aucun hôte tiers, zéro erreur.
verdicts.zeroRequeteTierce = requetesEtrangeres.length === 0;
verdicts.zeroErreurConsole = erreurs.length === 0 && erreurs2.length === 0;

// ================= Bilan ====================================================

console.log(JSON.stringify(verdicts, null, 2));
console.log('erreurs:', (erreurs.length || erreurs2.length) ? erreurs.concat(erreurs2) : 'aucune');
console.log('requêtes tierces:', requetesEtrangeres.length ? requetesEtrangeres : 'aucune');
const ok = Object.values(verdicts).every((v) => v === true);
await browser.close();
console.log(ok ? 'SMOKE-ANTIQUE OK' : 'SMOKE-ANTIQUE ECHEC');
process.exit(ok ? 0 : 1);
