// Ciel du réseau — la vue d'ARRIVÉE de RIVEN depuis le 2026-08-11.
// Flux front en mode démo. Ce que ce harnais prouve :
//   1. Le ciel est l'écran d'arrivée — et depuis le 2026-08-13, la SEULE forme
//      du réseau : l'arbre est supprimé, son onglet aussi.
//   2. N contacts → N étoiles, groupées en constellations par métier principal.
//   3. Une personne rattachée à DEUX fiches orbite les DEUX (notion du 10/08).
//   4. Les relations sont tracées en BLANC, le motif portant le type.
//   5. Tap sur une étoile → la bonne fiche, sans quitter le ciel.
//   6. Clavier : étoiles focusables, Entrée ouvre, et le focus RAMÈNE l'étoile
//      face à la caméra (sans quoi Tab l'enverrait derrière le spectateur).
//   7. La cible tactile MESURÉE tient le plancher WCAG de 24 px.
//   8. La molette fait DÉFILER LA PAGE et ne zoome pas (demande de Paul).
//   9. Quitter l'onglet ARRÊTE la boucle d'animation (batterie).
//  10. Déterminisme : mêmes données → mêmes coordonnées.
//  11. Zéro erreur console.
//
//  REPRIS DE smoke-arbre.mjs, supprimé le 2026-08-13 avec l'arbre (12 à 14).
//  Ces trois-là ne parlaient PAS de l'arbre : elles parlaient d'Ultima, et
//  elles seraient tombées avec lui. L'inventaire a été fait assertion par
//  assertion AVANT la suppression, c'est ce qui les a sauvées.
//  12. Mouvement réduit : `prefers-reduced-motion` coupe la dérive.
//  13. État vide : le message EXACT et le bouton d'ajout.
//  14. Double codage : le type est dit EN TOUTES LETTRES, jamais par la seule
//      couleur (une couleur seule est illisible pour qui ne la distingue pas).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1200);

// ---------- 1. Le ciel est l'écran d'arrivée ----------
verdicts.arriveeCiel = await page.locator('#espace-ciel').isVisible();
verdicts.ongletCielCourant = (await page.locator('.barre-onglets .onglet[data-onglet="ciel"]')
  .getAttribute('aria-current')) === 'page';

// ---------- 2. Une fiche = une étoile, groupées en constellations ----------
const rendu = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  return {
    etoiles: svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').length,
    liens: svg.querySelectorAll('.ciel-liens line').length,
    orbites: svg.querySelectorAll('g.ciel-etoile[data-personne-id]').length,
    constellations: svg.querySelectorAll('.ciel-decor text').length,
    aria: svg.getAttribute('aria-label') || ''
  };
});
// La démo porte 9 nœuds, 6 relations, 3 rattachements.
verdicts.neufEtoiles = rendu.etoiles === 9;
verdicts.sixLiens = rendu.liens === 6;
verdicts.troisOrbites = rendu.orbites === 3;
verdicts.constellationsNommees = rendu.constellations >= 5;
verdicts.ariaDitLeCompte = /9 contacts répartis en \d+ constellations/.test(rendu.aria);

// ---------- 3. Une personne à DEUX rattachements orbite les DEUX ----------
const multi = await page.evaluate(() => {
  const gs = [...document.querySelectorAll('#ciel-scene g.ciel-etoile[data-personne-id]')];
  const compte = {};
  gs.forEach((g) => {
    const id = g.getAttribute('data-personne-id');
    compte[id] = (compte[id] || 0) + 1;
  });
  return compte;
});
// demo-p1 (Karim Roux) est rattachée à demo-n2 ET demo-n8.
verdicts.personneDeuxFichesOrbiteLesDeux = multi['demo-p1'] === 2;
// demo-p3 n'a aucun rattachement : elle ne paraît PAS au ciel (elle vit au
// registre Contacts). L'absence se teste, elle ne se suppose pas.
verdicts.personneSansFicheAbsenteDuCiel = !multi['demo-p3'];

// ---------- 4. Les liens sont blancs, le motif porte le type ----------
const liens = await page.evaluate(() => {
  const g = document.querySelector('#ciel-scene .ciel-liens');
  const lignes = [...g.querySelectorAll('line')];
  return {
    couleur: g.getAttribute('stroke'),
    motifs: lignes.map((l) => l.getAttribute('stroke-dasharray') || 'plein').sort(),
    // demo-r6 est « arrêtée » : son éclat doit être le plus faible du ciel.
    opacites: lignes.map((l) => +l.getAttribute('opacity'))
  };
});
verdicts.liensBlancs = liens.couleur === '#ffffff';
verdicts.motifDitLeType = liens.motifs.filter((m) => m === 'plein').length === 3 &&
  liens.motifs.includes('7 5') && liens.motifs.includes('1.5 5');
verdicts.eclatDitAvancement = Math.min(...liens.opacites) < Math.max(...liens.opacites);

// ---------- 7. Cible tactile MESURÉE (mobile 390 px) ----------
const ciblePx = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const r = svg.getBoundingClientRect();
  const zones = [...svg.querySelectorAll('g.ciel-etoile[data-noeud-id]')]
    .filter((e) => e.getAttribute('display') !== 'none')
    .map((e) => +e.querySelector('.ciel-zone').getAttribute('r'));
  return +(Math.min(...zones) * 2 * (r.width / vb[2])).toFixed(1);
});
verdicts.cibleTactileTientLePlancher = ciblePx >= 24;

// ---------- 5. Tap sur une étoile → la BONNE fiche ----------
await page.locator('g.ciel-etoile[data-noeud-id="demo-n2"] .ciel-zone').click();
await page.waitForTimeout(500);
verdicts.tapOuvreLaBonneFiche =
  (await page.locator('#panneau-titre').textContent()) === 'Plomberie Roux & Fils';
verdicts.tapNeQuittePasLeCiel = await page.locator('#espace-ciel').isVisible();
await page.locator('#bouton-fermer-panneau').click();
await page.waitForTimeout(300);

// ---------- 6. Clavier : focus, visée, et Entrée ----------
verdicts.etoileFocusable = await page.evaluate(() => {
  const e = document.querySelector('#ciel-scene g.ciel-etoile[data-noeud-id]');
  return e.getAttribute('tabindex') === '0' && e.getAttribute('role') === 'button';
});

// L'étoile la PLUS excentrée : c'est elle qui prouve que le focus la ramène.
const excentree = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const centre = { x: vb[2] / 2, y: vb[3] / 2 };
  const dist = (el) => {
    const z = el.querySelector('.ciel-zone');
    return Math.hypot(+z.getAttribute('cx') - centre.x, +z.getAttribute('cy') - centre.y);
  };
  let pire = null;
  document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]').forEach((e) => {
    if (!pire || dist(e) > dist(pire)) { pire = e; }
  });
  return { id: pire.getAttribute('data-noeud-id'), avant: dist(pire) };
});
// focus() de Playwright, et non element.focus() dans la page : sur un <g> SVG
// le focus programmatique ne prend pas toujours.
await page.locator(`g.ciel-etoile[data-noeud-id="${excentree.id}"]`).focus();
verdicts.focusEffectif = await page.evaluate((id) =>
  document.activeElement && document.activeElement.getAttribute('data-noeud-id') === id,
excentree.id);
await page.waitForTimeout(1300);
const apresVisee = await page.evaluate((id) => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const z = svg.querySelector(`g.ciel-etoile[data-noeud-id="${id}"] .ciel-zone`);
  return Math.hypot(+z.getAttribute('cx') - vb[2] / 2, +z.getAttribute('cy') - vb[3] / 2);
}, excentree.id);
// Ramenée à moins de 60 % de son écart d'origine : le monde a bien pivoté.
verdicts.focusRameneLEtoileFaceALaCamera = apresVisee < excentree.avant * 0.6;

await page.keyboard.press('Enter');
await page.waitForTimeout(400);
verdicts.entreeOuvreLaFiche = !(await page.locator('#panneau').isHidden());
await page.locator('#bouton-fermer-panneau').click();
await page.waitForTimeout(300);

// ---------- Recherche : mise en évidence, jamais réduction ----------
await page.fill('#ciel-recherche', 'plomberie');
await page.waitForTimeout(400);
const recherche = await page.evaluate(() => ({
  message: document.getElementById('ciel-message').textContent,
  // Les étoiles restent TOUTES en place : on atténue, on ne retire pas.
  presentes: document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]').length,
  attenuees: [...document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]')]
    .filter((e) => +e.getAttribute('opacity') < 0.2).length
}));
verdicts.rechercheMetEnEvidence = /1 contact mis en évidence/.test(recherche.message) &&
  recherche.presentes === 9 && recherche.attenuees > 0;
await page.fill('#ciel-recherche', 'zzzzz');
await page.waitForTimeout(400);
verdicts.rechercheSansResultatLeDit =
  /Aucun contact ne correspond/.test(await page.locator('#ciel-message').textContent());
await page.fill('#ciel-recherche', '');
await page.waitForTimeout(400);

// ---------- 8. La molette LAISSE la page défiler ----------
// On ne mesure PAS scrollY : la mise en page de RIVEN tient en pleine hauteur,
// il n'y a donc rien à faire défiler et le test passerait pour de mauvaises
// raisons. Ce qui décide, c'est que la scène n'ANNULE pas l'événement — le
// jour où du contenu s'ajoutera sous elle, la page descendra.
const molette = await page.evaluate(() => {
  const scene = document.getElementById('ciel-scene');
  const jouer = (avecCtrl) => {
    const e = new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true, ctrlKey: avecCtrl });
    scene.dispatchEvent(e);
    return e.defaultPrevented;
  };
  return { sansCtrl: jouer(false), avecCtrl: jouer(true) };
});
verdicts.moletteLaissePasserLeDefilement = molette.sansCtrl === false;
verdicts.ctrlMoletteZoomeEtRetientLevenement = molette.avecCtrl === true;
verdicts.sceneLaisseDefilerAuDoigt =
  (await page.evaluate(() => getComputedStyle(document.getElementById('ciel-scene')).touchAction)) === 'pan-y';
await page.evaluate(() => window.scrollTo(0, 0));

// ---------- 9. Quitter le ciel ARRÊTE la boucle ----------
// On sortait par l'onglet Carte ; il n'existe plus. On sort par Contacts —
// n'importe quelle sortie prouve la même chose : la boucle d'animation ne
// tourne pas sous un écran caché.
await page.locator('.barre-onglets .onglet[data-onglet="contacts"]').click();
await page.waitForTimeout(500);
verdicts.sortieArreteLaBoucle = await page.evaluate(() => window.UltimaCiel.courant() === null);

// ---------- 1bis. RIVEN n'a plus qu'une forme ----------
// L'arbre et la carte sont supprimés (2026-08-13). Les verdicts
// `arbreAccessible` et `carteAccessible` qui vivaient ici tombent avec eux :
// on prouve désormais leur ABSENCE, et le compte exact des onglets.
verdicts.plusDOngletArbre =
  (await page.locator('.barre-onglets .onglet[data-onglet="arbre"]').count()) === 0;
verdicts.plusDEspaceArbre = (await page.locator('#espace-arbre').count()) === 0;
verdicts.plusDOngletCarte =
  (await page.locator('.barre-onglets .onglet[data-onglet="carte"]').count()) === 0;
verdicts.plusDEspaceCarte = (await page.locator('#espace-carte').count()) === 0;
verdicts.plusDeLeaflet = await page.evaluate(() => typeof window.L === 'undefined');
verdicts.troisOnglets = (await page.locator('.barre-onglets .onglet').count()) === 3;

// Retour au ciel : il se reconstruit entièrement.
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(700);
verdicts.retourAuCielLeReconstruit = await page.evaluate(() =>
  window.UltimaCiel.courant() !== null &&
  document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]').length === 9);

// ---------- 10. Déterminisme : mêmes données → mêmes coordonnées ----------
verdicts.mondeDeterministe = await page.evaluate(() => {
  const noeuds = [
    { id: 'a', nom: 'A', secteur_activite: 'Plomberie' },
    { id: 'b', nom: 'B', secteur_activite: 'Plomberie' },
    { id: 'c', nom: 'C', secteur_activite: 'Toiture' },
    { id: 'd', nom: 'D', secteur_activite: '' }
  ];
  const cle = (m) => m.etoiles.map((e) =>
    e.noeud.id + ':' + e.x.toFixed(6) + ',' + e.y.toFixed(6) + ',' + e.z.toFixed(6)).join('|');
  return cle(window.UltimaCiel.construireMonde(noeuds)) ===
         cle(window.UltimaCiel.construireMonde(noeuds));
});

// Le sans-secteur va bien dans « À classer », et en dernier.
verdicts.sansSecteurAClasser = await page.evaluate(() => {
  const groupes = window.UltimaCiel.grouper([
    { id: 'a', nom: 'A', secteur_activite: 'Plomberie' },
    { id: 'b', nom: 'B', secteur_activite: '' }
  ]);
  return groupes[groupes.length - 1].label === window.UltimaCiel.LABEL_A_CLASSER;
});

// La magnitude compte bien relations ET rattachements.
verdicts.magnitudeCompteLesDeux = await page.evaluate(() => {
  const m = window.UltimaCiel.magnitudes(
    [{ id: 'x' }, { id: 'y' }],
    [{ source_id: 'x', target_id: 'y' }],
    [{ personne_id: 'p', node_id: 'x' }]);
  return m.x === 2 && m.y === 1;
});

// ---------- 12. LE CIEL TIENT DANS L'ÉCRAN (2026-08-12) ----------
// Paul : « je veux tout voir d'un coup d'œil », capture à l'appui.
//
// LE DÉFAUT, MESURÉ : la hauteur du SVG se déduisait de la proportion du
// viewBox (vbH = vbW × 0,56) appliquée à la largeur rendue. Sur l'écran de
// Paul — 1670 × 900 — cela réclamait 934 px de haut dans une scène qui n'en
// offre que 689. `overflow: hidden` en coupait 245, soit UN QUART DU CIEL, et
// la page ne défilait pas : le bas du réseau n'était pas hors champ, il était
// SUPPRIMÉ. Rien ne le disait.
//
// Rien ici ne pouvait le voir : ce harnais mesurait les couleurs, les cibles
// tactiles et le clavier, jamais le RAPPORT ENTRE LE DESSIN ET SA BOÎTE. Et le
// seul écran éprouvé était 390 × 844, où le défaut n'existe pas — l'échantillon
// favorable, encore.
//
// Le verdict porte donc sur le seul critère qui traduise la demande de Paul :
// le SVG tient dans sa scène, et la scène tient dans l'écran.
const tientDansLaBoite = () => page.evaluate(() => {
  const sc = document.getElementById('ciel-scene');
  const svg = sc.querySelector('.ciel-svg');
  const b = sc.getBoundingClientRect(), s = svg.getBoundingClientRect();
  return {
    coupeEnHaut: +(b.top - s.top).toFixed(1),
    coupeEnBas: +(s.bottom - b.bottom).toFixed(1),
    coupeAGauche: +(b.left - s.left).toFixed(1),
    coupeADroite: +(s.right - b.right).toFixed(1),
    sceneDansEcran: b.top >= -1 && b.bottom <= window.innerHeight + 1,
    hauteurScene: +b.height.toFixed(0)
  };
});

const boite390 = await tientDansLaBoite();
// Tolérance de 1 px : arrondi sous-pixel du navigateur, pas une troncature.
verdicts.cielEntierDansSaBoite390 = boite390.coupeEnHaut <= 1 && boite390.coupeEnBas <= 1 &&
  boite390.coupeAGauche <= 1 && boite390.coupeADroite <= 1;
verdicts.sceneEntiereDansLEcran390 = boite390.sceneDansEcran;

// Le rayon du monde est désormais MESURÉ sur les étoiles construites, non
// supposé. Il est plus PETIT que l'ancienne constante (300) : cadrer sur la
// donnée réelle rapproche la caméra au lieu de l'éloigner.
verdicts.rayonMesurePlusPetitQueLaConstante = await page.evaluate(() => {
  const noeuds = [];
  for (let i = 0; i < 14; i++) {
    noeuds.push({ id: 'w' + i, nom: 'Fiche ' + i, type: 'artisan', secteur_activite: 'Metier' + i });
  }
  const r = window.UltimaCiel.construireMonde(noeuds).rayon;
  return r > 200 && r < 300;
});

// Un réseau à UNE fiche ne doit pas produire un rayon nul (pre-mortem P5).
verdicts.reseauMinusculeGardeUnPlancher = await page.evaluate(() =>
  window.UltimaCiel.construireMonde([{ id: 'u', nom: 'Seul', secteur_activite: 'Toiture' }]).rayon >= 80);

// Rend le pire cas dans le VRAI conteneur, par la VRAIE fonction publique, et
// mesure chaque étoile et chaque libellé contre le viewBox.
async function mesurerDebordement() {
  return page.evaluate(() => {
    const noeuds = [];
    for (let i = 0; i < 14; i++) {
      noeuds.push({ id: 'w' + i, nom: 'Fiche numéro ' + i, type: 'artisan', secteur_activite: 'Metier' + i });
    }
    window.UltimaCiel.rendre(document.getElementById('ciel-scene'),
      { noeuds, personnes: [], rattachements: [], relations: [] },
      { libellesType: {}, libellesStatut: {} });
    const svg = document.querySelector('#ciel-scene .ciel-svg');
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const dedans = (x, y) => x >= 0 && x <= vb[2] && y >= 0 && y <= vb[3];
    let etoilesDehors = 0, etoilesVues = 0;
    svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
      const z = g.querySelector('.ciel-zone');
      if (!z) { return; }
      etoilesVues++;
      if (!dedans(+z.getAttribute('cx'), +z.getAttribute('cy'))) { etoilesDehors++; }
    });
    let libellesDehors = 0, libellesVus = 0;
    svg.querySelectorAll('.ciel-nom-amas').forEach((t) => {
      libellesVus++;
      if (!dedans(+t.getAttribute('x'), +t.getAttribute('y'))) { libellesDehors++; }
    });
    return { etoilesVues, etoilesDehors, libellesVus, libellesDehors };
  });
}

// L'animation lisse la distance : on laisse la caméra atteindre sa cible —
// par convergence mesurée, jamais par une attente à l'heure (voir plus bas).
async function geoStable() {
  let precedent = await mesurerDebordement();
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(250);
    const actuel = await mesurerDebordement();
    if (actuel.etoilesDehors === precedent.etoilesDehors &&
        actuel.libellesDehors === precedent.libellesDehors) { return actuel; }
    precedent = actuel;
  }
  return precedent;
}
const geoMobile2 = await geoStable();
verdicts.pireCasRendu = geoMobile2.etoilesVues === 14 && geoMobile2.libellesVus >= 10;
// C1 — 100 % des étoiles dans le cadre, à 390 px.
verdicts.aucuneEtoileHorsCadre390 = geoMobile2.etoilesDehors === 0;
// C2 — les libellés aussi : c'est le nom que Paul lit en premier.
verdicts.aucunLibelleHorsCadre390 = geoMobile2.libellesDehors === 0;

// L'ÉCRAN DE LA CAPTURE DE PAUL — large et court. C'est là, et seulement là,
// que le défaut vivait : jamais éprouvé, donc jamais vu.
await page.setViewportSize({ width: 1670, height: 900 });
await page.waitForTimeout(900);
const boiteLarge = await tientDansLaBoite();
verdicts.cielEntierDansSaBoiteLarge = boiteLarge.coupeEnHaut <= 1 && boiteLarge.coupeEnBas <= 1 &&
  boiteLarge.coupeAGauche <= 1 && boiteLarge.coupeADroite <= 1;
verdicts.sceneEntiereDansLEcranLarge = boiteLarge.sceneDansEcran;

const geoLarge2 = await geoStable();
verdicts.aucuneEtoileHorsCadreLarge = geoLarge2.etoilesDehors === 0;
verdicts.aucunLibelleHorsCadreLarge = geoLarge2.libellesDehors === 0;
// Et le pire cas tient AUSSI dans la boîte, pas seulement la démo.
const boiteLargePireCas = await tientDansLaBoite();
verdicts.pireCasEntierDansSaBoiteLarge = boiteLargePireCas.coupeEnBas <= 1 &&
  boiteLargePireCas.coupeEnHaut <= 1;

// ---------- 13. « Tout voir » ramène le réseau entier ----------
// P6 — on ZOOME d'abord, sans quoi le bouton n'a rien à défaire et le verdict
// serait vrai sans rien prouver.
const ecartMax = () => page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  let pire = 0;
  svg.querySelectorAll('g.ciel-etoile[data-noeud-id] .ciel-zone').forEach((z) => {
    pire = Math.max(pire, Math.hypot(+z.getAttribute('cx') - vb[2] / 2,
      +z.getAttribute('cy') - vb[3] / 2));
  });
  return pire;
});
// La caméra rejoint sa cible par interpolation, image par image : attendre une
// durée FIXE, c'est mesurer un transitoire — vert seul, rouge quand la machine
// est chargée par la suite complète. On attend donc la STABILITÉ, pas l'heure.
async function ecartStable() {
  let precedent = await ecartMax();
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(200);
    const actuel = await ecartMax();
    if (Math.abs(actuel - precedent) < 0.4) { return actuel; }
    precedent = actuel;
  }
  return precedent;
}

const ecartOuverture = await ecartStable();
for (let i = 0; i < 6; i++) { await page.locator('#ciel-approcher').click(); }
const ecartZoome = await ecartStable();
verdicts.zoomAvantEcarteBien = ecartZoome > ecartOuverture * 1.15;
await page.locator('#ciel-tout-voir').click();
const ecartRevenu = await ecartStable();
// C4 — on retrouve le cadrage d'ouverture (tolérance d'animation : 8 %).
verdicts.toutVoirRamèneAuCadrageDOuverture =
  Math.abs(ecartRevenu - ecartOuverture) < ecartOuverture * 0.08;

// C5 — cible tactile de « Tout voir » MESURÉE, à 390 px.
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);
const boiteToutVoir = await page.locator('#ciel-tout-voir').boundingBox();
verdicts.cibleTactileToutVoir = !!boiteToutVoir &&
  boiteToutVoir.height >= 24 && boiteToutVoir.width >= 24;

// ---------- 16. LA VUE À PLAT (2026-08-13) ----------
// Le mode ne vaut que par ce qu'il ÉCONOMISE : on compte donc les images
// d'animation réellement demandées, on ne se fie pas au nom du bouton. Et il ne
// vaut que s'il ne perd RIEN : mêmes étoiles, mêmes libellés, mêmes liens.
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(700);

// Le moteur pose `image = null` quand il cesse de demander des images : c'est
// le signal qu'on interroge. Une première version comptait aussi les frames du
// navigateur — inutile : elles mesuraient MA boucle de comptage, pas celle du
// ciel. Un instrument qui mesure l'instrument ne mesure rien.
const boucleEnVol = () => page.evaluate(() => new Promise((resolve) => {
  setTimeout(() => resolve(!!(window.UltimaCiel.courant() || {}).image), 700);
}));

verdicts.volumeAnimeEnContinu = (await boucleEnVol()) === true;

const avantPlat = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  return {
    etoiles: svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').length,
    libelles: svg.querySelectorAll('.ciel-nom-amas').length,
    liens: svg.querySelectorAll('line, path.ciel-lien').length,
  };
});

await page.locator('#ciel-plat').click();
await page.waitForTimeout(900);
verdicts.boutonPlatDitSonEtat =
  (await page.locator('#ciel-plat').getAttribute('aria-pressed')) === 'true' &&
  (await page.locator('#ciel-plat').textContent()) === 'En volume';

verdicts.platArreteLaBoucle = (await boucleEnVol()) === false;

const apresPlat = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  return {
    etoiles: svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').length,
    libelles: svg.querySelectorAll('.ciel-nom-amas').length,
    liens: svg.querySelectorAll('line, path.ciel-lien').length,
  };
});
verdicts.platNePerdRien = apresPlat.etoiles === avantPlat.etoiles &&
  apresPlat.libelles === avantPlat.libelles && apresPlat.liens === avantPlat.liens &&
  apresPlat.etoiles > 0;

// Toutes les étoiles restent DANS le cadre : à plat aussi, la géométrie se mesure.
verdicts.platTientDansLeCadre = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  let dehors = 0;
  svg.querySelectorAll('g.ciel-etoile[data-noeud-id] .ciel-zone').forEach((z) => {
    const x = +z.getAttribute('cx'); const y = +z.getAttribute('cy');
    if (!(x >= 0 && x <= vb[2] && y >= 0 && y <= vb[3])) { dehors += 1; }
  });
  return dehors === 0;
});

// Le réglage survit au rechargement : c'est un réglage, pas un état d'écran.
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1400);
verdicts.platSurvitAuRechargement =
  (await page.locator('#ciel-plat').getAttribute('aria-pressed')) === 'true' &&
  (await page.evaluate(() => window.UltimaCiel.courant().estPlat())) === true;

// Retour au volume, pour ne pas laisser le reste du harnais dans un mode figé.
await page.locator('#ciel-plat').click();
await page.waitForTimeout(700);
verdicts.retourAuVolume =
  (await page.locator('#ciel-plat').getAttribute('aria-pressed')) === 'false' &&
  (await page.evaluate(() => window.UltimaCiel.courant().estPlat())) === false;

// ---------- 15. Zéro résultat → création pré-remplie ----------
// Fonction portée depuis la recherche de la carte le 2026-08-13 (elle était la
// SEULE perte fonctionnelle du démontage, signalée au diagnostic et arbitrée
// par Paul). Le terme cherché devient le nom du contact à créer.
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(500);
await page.locator('#ciel-recherche').fill('zzz');
await page.waitForTimeout(300);
verdicts.zeroResultatLeDit =
  ((await page.locator('#ciel-message').textContent()) || '').includes('Aucun contact ne correspond');
const boutonCreer = page.locator('#ciel-creer-depuis-recherche');
verdicts.zeroResultatOffreLaCreation = (await boutonCreer.count()) === 1 &&
  ((await boutonCreer.textContent()) || '').includes('“zzz”');
await boutonCreer.click();
await page.waitForTimeout(300);
verdicts.creationPreRemplie = (await page.locator('#form-noeud').isVisible()) &&
  (await page.locator('#noeud-nom').inputValue()) === 'zzz';
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
await page.locator('#ciel-recherche').fill('');
await page.waitForTimeout(300);

// ---------- 14. Double codage : le type en toutes lettres ----------
// Repris de smoke-arbre (`typeEnToutesLettres`). Dans le ciel, la couleur de
// l'étoile dit le type — elle ne peut pas le dire SEULE. L'étiquette
// accessible doit le porter en clair, sinon l'information n'existe que pour
// qui distingue quatre teintes sur fond de nuit.
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(600);
const etiquettes = await page.evaluate(() => Array.from(
  document.querySelectorAll('#ciel-scene .ciel-etoile[data-noeud-id]'))
  .map((g) => g.getAttribute('aria-label') || ''));
verdicts.typeEnToutesLettres = etiquettes.length > 0 &&
  etiquettes.every((l) => /Artisan|Partenaire|Lead|Chantier/.test(l));

// ---------- 12. Mouvement réduit : la dérive s'arrête ----------
// Repris de smoke-arbre (`pousseCoupeeReduce`). Mesure par CONSTAT du
// mouvement, pas par lecture du code : on active la dérive, on relève la
// position d'une étoile, on attend, on la relève à nouveau. Sans préférence,
// elle doit avoir bougé ; avec `reduce`, elle doit être immobile.
async function positionEtoile() {
  return page.evaluate(() => {
    const z = document.querySelector('#ciel-scene .ciel-etoile[data-noeud-id] .ciel-zone');
    return z ? Number(z.getAttribute('cx')) : null;
  });
}
await page.locator('#ciel-derive').check();
await page.waitForTimeout(400);
const avantDerive = await positionEtoile();
await page.waitForTimeout(900);
const apresDerive = await positionEtoile();
verdicts.deriveBougeSansPreference = avantDerive !== null && apresDerive !== null &&
  Math.abs(apresDerive - avantDerive) > 0.5;

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(200);
await page.locator('.barre-onglets .onglet[data-onglet="ciel"]').click();
await page.waitForTimeout(700); // la caméra finit sa mise en place
await page.locator('#ciel-derive').check();
await page.waitForTimeout(600);
const avantReduit = await positionEtoile();
await page.waitForTimeout(900);
const apresReduit = await positionEtoile();
verdicts.deriveCoupeeSousReduce = avantReduit !== null && apresReduit !== null &&
  Math.abs(apresReduit - avantReduit) < 0.01;
await page.emulateMedia({ reducedMotion: 'no-preference' });

// ---------- 13. État vide : le message EXACT et le bouton ----------
// Repris de smoke-arbre (`messageVideExact`, `boutonEtatVide`). En DERNIER :
// il vide le réseau de démo, donc il détruit ce dont tout le reste a besoin.
page.on('dialog', (d) => d.accept()); // confirmations de suppression
// La dérive activée deux blocs plus haut fait BOUGER les étoiles : on ne
// clique pas une cible en mouvement (Playwright refuse, et Paul aussi).
await page.locator('#ciel-derive').uncheck();
await page.waitForTimeout(700);
let garde = 0;
while ((await page.locator('#ciel-scene .ciel-etoile[data-noeud-id]').count()) > 0 && garde < 80) {
  // `dispatchEvent` et non `click` : dans un VOLUME, les zones de captation
  // des étoiles se chevauchent — une étoile devant en masque une autre, et
  // Playwright refuse alors le clic. Ce chevauchement n'est pas un défaut,
  // c'est la perspective. Ici on veut vider le réseau, pas éprouver le
  // pointage : celui-ci est déjà couvert par `tapOuvreLaBonneFiche`.
  await page.locator('#ciel-scene .ciel-etoile[data-noeud-id]').first().dispatchEvent('click');
  await page.waitForTimeout(120);
  const bouton = page.locator('.actions-fiche button', { hasText: 'Supprimer' }).first();
  if (await bouton.count() === 0) { break; }
  await bouton.click();
  await page.waitForTimeout(160);
  garde += 1;
}
verdicts.cielVide = (await page.locator('#ciel-scene .ciel-etoile[data-noeud-id]').count()) === 0;
const blocVide = page.locator('#ciel-scene .ciel-bloc-etat');
verdicts.messageVideExact = (await blocVide.first().textContent())
  .replace(/\s+/g, ' ').trim() === 'Votre ciel attend sa première étoile — touchez +';
verdicts.outilsCachesQuandVide = await page.locator('#ciel-outils').isHidden();
verdicts.boutonAjouterVisibleQuandVide = await page.locator('#ciel-ajouter').isVisible();

// ---------- 11. Zéro erreur console ----------
verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
console.log(`Cible tactile mesurée à 390 px : ${ciblePx} px (plancher 24)`);
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE CIEL VERT' : 'SMOKE CIEL ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
