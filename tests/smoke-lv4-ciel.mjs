// LV4 — les trois capacités du moteur (étape ② de CADRAGE-LV4-CIEL-DEPLIE.md).
//
// Ce que ce harnais prouve :
//   1. INERTES PAR DÉFAUT. Sans option, le moteur cadre le monde comme hier,
//      plafonne les noms à six et n'a pas de plafond de libellé. C'est la
//      condition de survie de RIVEN, et elle se PROUVE ici plutôt que de se
//      supposer (smoke-ciel.mjs la prouve de son côté, sur le vrai produit).
//   2. CADRAGE SERRÉ — l'occupation du cadre atteint les 60 % du cadrage.
//      Mesuré sur trois configurations, dont le PIRE CAS CONSTRUIT à 12 objets
//      (règle du 2026-08-01 : un pire cas se construit, il ne s'espère pas).
//   3. ET PERSONNE NE SORT. La géométrie se MESURE : `getBBox()` de chaque
//      étoile — halo, branches et nom compris, pas le seul centre — comparée au
//      `viewBox`. C'est la levée de la contradiction relevée par la maquette.
//   4. TOUS LES NOMS sous le seuil ; retour aux six au-dessus. Un menu dont la
//      moitié des entrées est muette n'est pas un menu.
//   5. APPROCHER un nœud réduit RÉELLEMENT la distance de la caméra, et un
//      identifiant inconnu ne bouge rien et le DIT (false).
//   6. Le téléphone de Paul (390 px) est éprouvé comme le bureau : le cadrage
//      se déduit du cadre, donc il doit tenir sur les deux.
//   7. Zéro erreur console.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};

// La page hôte est la MAQUETTE : elle charge déjà le vrai moteur, le vrai
// thème et la vraie feuille du ciel. Un banc d'essai jetable en plus aurait
// mesuré un ciel qui n'existe nulle part.
const HOTE = 'http://127.0.0.1:8123/design/preview-lv4-ciel-deplie.html';

// Le jeu d'essai : n objets d'un même écran — donc UN seul groupe, la
// configuration exacte d'un étage LV4, et celle où le cadrage d'hier échouait.
function donnees(n) {
  const noeuds = [];
  for (let i = 1; i <= n; i += 1) {
    noeuds.push({ id: 'o' + i, nom: 'OBJET ' + i, type: 'cap', statut: 'Ouvert',
      secteur_activite: 'ÉCRAN' });
  }
  return { noeuds, personnes: [], rattachements: [], relations: [] };
}

// ---------------------------------------------------------------------------
// L'instrument. Il rend, laisse la caméra ARRIVER, puis mesure.
// ---------------------------------------------------------------------------
// La caméra glisse de façon asymptotique (distance += (cible − distance) × 0,11)
// : elle n'est jamais tout à fait posée. On attend donc un temps MESURÉ suffisant
// pour que l'écart résiduel soit sous le pour-cent, au lieu d'attendre une
// stabilité qui n'arrive pas — c'est aussi pourquoi `hover()` expire ici.
async function mesurer(page, jeu, options) {
  await page.evaluate(([jeu, options]) => {
    window.UltimaCiel.arreter();
    const scene = document.getElementById('ciel-scene');
    window.__vue = window.UltimaCiel.rendre(scene, jeu, options);
    window.__vue.derive(false);
  }, [jeu, options]);
  await page.waitForTimeout(1400);

  return page.evaluate(() => {
    const svg = document.querySelector('#ciel-scene .ciel-svg');
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const gs = Array.from(svg.querySelectorAll('g.ciel-etoile[data-noeud-id]'));

    // ① L'ÉTENDUE — sur les centres, comme la maquette la mesurait, pour que
    //    le chiffre d'avant et celui d'après se comparent au même étalon.
    const zones = gs.map((g) => g.querySelector('.ciel-zone'));
    const xs = zones.map((z) => +z.getAttribute('cx'));
    const ys = zones.map((z) => +z.getAttribute('cy'));
    const occupation = Math.max(
      (Math.max(...xs) - Math.min(...xs)) / vb[2],
      (Math.max(...ys) - Math.min(...ys)) / vb[3]);

    // ② LA SORTIE DE CADRE — sur la BOÎTE RÉELLE de chaque objet peint, halo et
    //    nom compris. Mesurer le seul centre laisserait passer un nom coupé.
    //
    //    LES ÉTIQUETTES DE CONSTELLATION SONT DEDANS DEPUIS LE 2026-08-13, et
    //    elles n'y étaient pas d'abord : ce harnais ne regardait que les
    //    `g.ciel-etoile`, or l'étiquette d'amas n'en est pas une. Résultat, il
    //    déclarait « 0 hors cadre » pendant qu'une CAPTURE montrait « ULTIMA »
    //    écrit en 36 px en travers du ciel. Un harnais qui ne regarde qu'une
    //    partie de ce qui est peint ne dit rien de ce qui est peint.
    const peints = gs.concat(Array.from(svg.querySelectorAll('text.ciel-nom-amas'))
      .filter((t) => +(t.getAttribute('opacity') || '1') > 0.02));
    let dehors = 0, debordMax = 0;
    peints.forEach((g) => {
      const b = g.getBBox();
      const d = Math.max(-b.x, -b.y, (b.x + b.width) - vb[2], (b.y + b.height) - vb[3]);
      if (d > 0.5) { dehors += 1; }
      if (d > debordMax) { debordMax = d; }
    });

    // ③ LES NOMS RÉELLEMENT LISIBLES — un nom présent dans le document mais
    //    posé à l'opacité 0,25 n'est pas un nom lu. On compte ce qui se voit.
    const nomsLisibles = Array.from(svg.querySelectorAll('text.ciel-nom'))
      .filter((t) => +(t.getAttribute('opacity') || '1') >= 0.5).length;
    const policeMax = Math.max(...Array.from(svg.querySelectorAll('text.ciel-nom'))
      .map((t) => +(t.getAttribute('font-size') || 0)));

    return {
      etoiles: gs.length, occupation, dehors, debordMax,
      nomsLisibles, policeMax,
      nbNomsPermanents: window.__vue.nbNomsPermanents,
      cadrageSerre: window.__vue.cadrageSerre,
      rayonEtoiles: window.__vue.rayonEtoiles,
      cadre: Math.min(vb[2], vb[3])
    };
  });
}

// ===========================================================================
for (const largeur of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width: largeur, height: largeur === 390 ? 844 : 800 } });
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
  await page.goto(HOTE, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(900);
  const suffixe = largeur === 390 ? 'Tel' : 'Bureau';

  // ---------- 1. INERTES PAR DÉFAUT ----------
  const sansOption = await mesurer(page, donnees(12), { libellesType: { cap: '' } });
  verdicts['defautPasDeCadrageSerre' + suffixe] = sansOption.cadrageSerre === false;
  verdicts['defautSixNoms' + suffixe] = sansOption.nbNomsPermanents === 6;
  // Le rayon rendu sans option est celui du monde (planché à 80), jamais
  // l'étendue recentrée : la preuve que `recentrerSurLesEtoiles` n'a pas tourné.
  verdicts['defautRayonDuMonde' + suffixe] = sansOption.rayonEtoiles >= 80;
  chiffres['sansOption_' + suffixe] = {
    occupation: +(sansOption.occupation * 100).toFixed(1),
    nomsLisibles: sansOption.nomsLisibles
  };

  // ---------- 2 et 3. CADRAGE SERRÉ : il remplit, et personne ne sort ----------
  for (const n of [3, 12]) {
    const m = await mesurer(page, donnees(n), {
      libellesType: { cap: '' }, cadrerSurLesEtoiles: true, tousLesNoms: true
    });
    const cle = n + 'objets' + suffixe;
    chiffres['serre_' + cle] = {
      occupation: +(m.occupation * 100).toFixed(1),
      debordMax: +m.debordMax.toFixed(1),
      policeMax: m.policeMax, nomsLisibles: m.nomsLisibles, cadre: m.cadre
    };
    verdicts['serreRemplitLeCadre_' + cle] = m.occupation >= 0.6;
    verdicts['serrePersonneDehors_' + cle] = m.dehors === 0;
    verdicts['serreToutRendu_' + cle] = m.etoiles === n;
    // ---------- 4. TOUS LES NOMS, et tous LISIBLES ----------
    verdicts['tousLesNomsPermanents_' + cle] = m.nbNomsPermanents === n;
    verdicts['tousLesNomsLisibles_' + cle] = m.nomsLisibles === n;
    // Le plafond de libellé tient : sans lui, `10 × échelle` écrirait en 30 px.
    verdicts['nomPlafonne_' + cle] = m.policeMax <= 20.01;
  }

  // ---------- 4bis. AU-DESSUS DU SEUIL, on DÉGRADE au lieu de casser ----------
  const trop = await mesurer(page, donnees(20), {
    libellesType: { cap: '' }, cadrerSurLesEtoiles: true, tousLesNoms: true
  });
  verdicts['auDelaDuSeuilRetourASix' + suffixe] = trop.nbNomsPermanents === 6;
  verdicts['auDelaDuSeuilPersonneDehors' + suffixe] = trop.dehors === 0;

  // ---------- 5. APPROCHER un nœud ----------
  const approche = await page.evaluate(async () => {
    window.UltimaCiel.arreter();
    const jeu = { noeuds: [], personnes: [], rattachements: [], relations: [] };
    for (let i = 1; i <= 6; i += 1) {
      jeu.noeuds.push({ id: 'o' + i, nom: 'OBJET ' + i, type: 'cap', statut: '',
        secteur_activite: 'ÉCRAN' });
    }
    const vue = window.UltimaCiel.rendre(document.getElementById('ciel-scene'), jeu,
      { libellesType: { cap: '' }, cadrerSurLesEtoiles: true, tousLesNoms: true });
    vue.derive(false);
    // CE QU'ON MESURE, ET POURQUOI PAS AUTRE CHOSE. `zoomerVers` promet DEUX
    // choses : venir plus près, et mettre le nœud face à la caméra. On mesure
    // les deux séparément, parce qu'elles se confondent si on n'y prend garde.
    //
    // Deux instruments ont été écartés avant celui-ci, chacun pour une raison
    // mesurée, pas devinée :
    //   — le rayon de l'étoile visée : SATURÉ (il plafonne à 9, la zone tactile
    //     à 21,6) ; il lisait 21,6 avant ET après une caméra qui avait pourtant
    //     parcouru un tiers du monde ;
    //   — l'étalement horizontal du ciel : CONFONDU ; `zoomerVers` tourne aussi
    //     le monde, et la rotation change l'étendue latérale pour une raison
    //     qui n'est pas l'approche. Un instrument qui mesure deux causes à la
    //     fois ne prouve aucune des deux.
    const ecartAuCentre = () => {
      const svg = document.querySelector('#ciel-scene .ciel-svg');
      const vb = svg.getAttribute('viewBox').split(' ').map(Number);
      const z = svg.querySelector('.ciel-etoile[data-noeud-id="o3"] .ciel-zone');
      return Math.hypot(+z.getAttribute('cx') - vb[2] / 2,
        +z.getAttribute('cy') - vb[3] / 2) / Math.min(vb[2], vb[3]);
    };
    await new Promise((r) => setTimeout(r, 1200));
    const avant = vue.distance(), ecartAvant = ecartAuCentre();
    const retour = vue.zoomerVers('o3');
    const inconnu = vue.zoomerVers('jamais-vu');
    await new Promise((r) => setTimeout(r, 1400));
    return { avant: +avant.toFixed(1), apres: +vue.distance().toFixed(1),
      ecartAvant: +ecartAvant.toFixed(3), ecartApres: +ecartAuCentre().toFixed(3),
      retour, inconnu };
  });
  chiffres['approche_' + suffixe] = approche;
  // La caméra s'est RÉELLEMENT rapprochée, et ça SE VOIT. On mesure l'effet,
  // pas l'appel — une caméra qui « a reçu l'ordre » sans bouger passerait un
  // test écrit sur l'intention.
  verdicts['approcheRapprocheLaCamera' + suffixe] = approche.apres < approche.avant * 0.95;
  // …et le nœud visé vient AU CENTRE : c'est l'autre moitié de la promesse.
  // On l'énonce en absolu (moins d'un dixième du cadre) parce que c'est
  // exactement ce que « face à la caméra » veut dire — pas « un peu mieux
  // qu'avant », qui serait vrai d'un nœud déjà centré par hasard.
  verdicts['approcheCentreLeNoeud' + suffixe] = approche.ecartApres < 0.10;
  verdicts['approcheDitOui' + suffixe] = approche.retour === true;
  verdicts['approcheRefuseLInconnu' + suffixe] = approche.inconnu === false;

  await page.close();
}

// ---------- 6. Le recentrage est une fonction PURE et il recentre ----------
{
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  await page.goto(HOTE, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(600);
  const pur = await page.evaluate(() => {
    const noeuds = [];
    for (let i = 1; i <= 5; i += 1) {
      noeuds.push({ id: 'o' + i, nom: 'O' + i, type: 'cap', secteur_activite: 'ÉCRAN' });
    }
    const brut = window.UltimaCiel.construireMonde(noeuds);
    const distanceOrigine = Math.max(...brut.etoiles.map(
      (e) => Math.hypot(e.x, e.y, e.z)));
    const recentre = window.UltimaCiel.recentrerSurLesEtoiles(
      window.UltimaCiel.construireMonde(noeuds));
    const bary = recentre.etoiles.reduce((a, e) => ({
      x: a.x + e.x / 5, y: a.y + e.y / 5, z: a.z + e.z / 5 }), { x: 0, y: 0, z: 0 });
    // Deux appels, mêmes chiffres : la fonction ne garde rien entre deux passes.
    const bis = window.UltimaCiel.recentrerSurLesEtoiles(
      window.UltimaCiel.construireMonde(noeuds));
    return {
      distanceOrigine, rayonReel: recentre.rayonReel, rayonBrut: brut.rayon,
      barycentre: Math.hypot(bary.x, bary.y, bary.z),
      deterministe: bis.rayonReel === recentre.rayonReel
    };
  });
  chiffres.recentrage = {
    rayonAvant: +pur.rayonBrut.toFixed(1), rayonApres: +pur.rayonReel.toFixed(1),
    barycentre: +pur.barycentre.toFixed(3)
  };
  // Le barycentre TOMBE sur l'origine — c'est la définition de l'opération.
  verdicts.recentrageMetLeBarycentreALOrigine = pur.barycentre < 0.001;
  // Et l'étendue retenue est PLUS PETITE que le rayon du monde : c'est tout le
  // gain. Si elle ne l'était pas, la caméra n'aurait aucune raison d'avancer.
  verdicts.recentrageResserreLEtendue = pur.rayonReel < pur.rayonBrut;
  verdicts.recentrageDeterministe = pur.deterministe;
  await page.close();
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE LV4-CIEL VERT' : 'SMOKE LV4-CIEL ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
