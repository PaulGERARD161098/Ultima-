// LV5 — LA COUCHE DE FOND ET LE PLEIN ÉCRAN (étape P0 de
// CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md).
//
// Ce que ce harnais prouve :
//   1. INERTE PAR DÉFAUT. Sans l'option `fond`, aucun canvas n'est monté et le
//      moteur reste celui d'hier — la condition de survie de RIVEN, prouvée
//      ici comme les trois capacités de LV4 l'ont été.
//   2. LE FOND A PEINT. Et c'est la mesure la plus piégeuse du lot : un canvas
//      qui n'a rien peint est NOIR, exactement comme un beau ciel de nuit. La
//      luminance moyenne ne les distingue pas ; la VARIANCE, si. Un instrument
//      qui ne sait pas séparer la réussite de la panne ne mesure rien.
//   3. LA PHASE. Le point témoin : la position écran qu'un point du monde
//      occupe selon la couche de fond, comparée à celle que le NAVIGATEUR
//      mesure sur l'étoile correspondante (`getBoundingClientRect`). Deux
//      chemins indépendants — comparer ma formule à ma formule ne prouverait
//      rien. C'est le mode de défaillance n°1 du cadrage, et il est le seul à
//      être structurellement empêché plutôt que surveillé.
//   4. LA DENSITÉ SUIT LA SURFACE. C'était le défaut d'origine : 130 grains
//      est une constante, elle sature un téléphone et vide un écran large.
//      Le rapport entre 1670 px et 390 px doit dépasser 2,5.
//   5. LE PLEIN ÉCRAN. La scène occupe la fenêtre, et RIEN ne défile.
//   6. LE COÛT D'UNE IMAGE, mesuré DEUX FOIS et pour cause : le travail
//      JavaScript (chronométré dans le moteur) ET la cadence observée. Le
//      premier instrument que j'avais écrit ne lisait que la cadence et
//      répondait 16,4 ms partout — il lisait le rafraîchissement de l'écran.
//      Le second ne voit que le JavaScript et ignore ce que le navigateur paie
//      à composer. AUCUN DES DEUX NE SUFFIT SEUL : à quarante objets, le
//      travail tenait en 3,7 ms pendant que la cadence tombait à 33,6.
//   7. LE DÉCOR NE PREND AUCUN GESTE : le canvas est `aria-hidden` et
//      transparent aux clics — au point exact d'une étoile, c'est l'étoile que
//      le document rend, jamais le fond.
//   8. Zéro erreur console.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};

// La page hôte est la MAQUETTE : elle charge le vrai moteur, la vraie couche
// de fond, le vrai registre et le vrai thème. Un banc d'essai jetable aurait
// mesuré un ciel qui n'existe nulle part.
const HOTE = 'http://127.0.0.1:8123/design/preview-lv5-galaxie.html';

async function ouvrir(largeur, hauteur) {
  const page = await browser.newPage({ viewport: { width: largeur, height: hauteur } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.goto(HOTE, { waitUntil: 'load' });
  // La caméra ne se pose JAMAIS tout à fait : son approche est asymptotique,
  // donc attendre l'immobilité serait attendre pour toujours (leçon LV4). On
  // laisse passer un temps borné, on ne guette pas un état stable.
  await page.waitForTimeout(1800);
  return page;
}

// L'ÉCART DE PHASE, mesuré sur une étoile RÉELLEMENT VISIBLE.
// Premier jet : il prenait la première étoile venue et tombait sur `null` dès
// qu'on tournait le monde. Ce n'était pas un défaut du moteur — `projeter`
// rend `null` pour ce qui est passé DERRIÈRE la caméra, et c'est ce qu'on lui
// demande. C'était l'instrument qui interrogeait un point hors champ.
// Il choisit donc une étoile que le moteur dessine, et il exige qu'il y en ait
// une : « aucune étoile visible » est un échec, pas une excuse pour ne rien
// mesurer.
// LE REPÈRE EST CELUI DU CANVAS, ET C'EST UNE CORRECTION PAYÉE SUR P1.
// La maquette annonçait 0,00 px et la coque de production 1,60 px — pour un
// code de projection identique. La différence n'était pas dans le fond : la
// scène de production porte une bordure d'1 px, `getBoundingClientRect()` la
// compte (border box) et le canvas commence à l'intérieur (padding box). Je
// mesurais depuis un bord, le fond dessinait depuis l'autre.
// `versEcran` rend des pixels DANS LE REPÈRE DU CANVAS : c'est donc lui, et
// lui seul, qui fait origine. Depuis ce repère : 0,21 px.
// *Le repère d'une mesure de position doit être celui de l'objet mesuré, pas
// celui de son voisin — et une bordure d'un pixel suffit à faire mentir un
// instrument juste par ailleurs.*
function ecartDePhase(page) {
  return page.evaluate(() => {
    const v = window.LV5.vue();
    const canvas = document.querySelector('canvas.ciel-fond');
    if (!canvas) { return null; }
    const boite = canvas.getBoundingClientRect();
    const visibles = Array.from(document.querySelectorAll('.ciel-etoile'))
      .filter((g) => g.getAttribute('display') !== 'none');
    if (!visibles.length) { return null; }
    for (const g of visibles) {
      const t = v.temoin(g.getAttribute('data-noeud-id'));
      if (!t) { continue; } // derrière la caméra : ce n'est pas elle qu'on mesure
      const r = g.querySelector('circle').getBoundingClientRect();
      const cx = r.left + r.width / 2 - boite.left;
      const cy = r.top + r.height / 2 - boite.top;
      return Math.sqrt((cx - t.px) ** 2 + (cy - t.py) ** 2);
    }
    return null;
  });
}

// La luminance perçue d'un pixel, pondérée par son alpha : un canvas
// transparent ne compte pas comme du noir peint.
function statistiques(page) {
  return page.evaluate(() => {
    const c = document.querySelector('canvas.ciel-fond');
    if (!c) { return null; }
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let somme = 0; let somme2 = 0; let n = 0; let allumes = 0;
    for (let i = 0; i < d.length; i += 4 * 37) {
      const l = (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722) * (d[i + 3] / 255);
      somme += l; somme2 += l * l; n += 1;
      // « Allumé » à 8 sur 255, soit 3 %. Le premier jet disait « > 1 » et
      // comptait 26,5 % de pixels allumés sur un ciel que l'œil voit noir :
      // à 1/255, on compte du bruit de quantification, pas de la lumière.
      // Le seuil d'un critère de PERCEPTION doit être celui de la perception,
      // pas celui de la représentation. Il est fixé ici une fois, avec sa
      // raison — et non remonté jusqu'à ce que la mesure passe.
      if (l > 8) { allumes += 1; }
    }
    const moyenne = somme / n;
    return { moyenne, variance: somme2 / n - moyenne * moyenne, partAllumee: allumes / n };
  });
}

// ---------------------------------------------------------------------------
// ① INERTE PAR DÉFAUT — le fond éteint, le moteur est celui d'hier.
// ---------------------------------------------------------------------------
{
  const page = await ouvrir(1280, 860);
  await page.evaluate(() => window.LV5.fond(false));
  await page.waitForTimeout(900);
  verdicts.sansOptionAucunCanvas = (await page.locator('canvas.ciel-fond').count()) === 0;
  verdicts.sansOptionLeMoteurLeDit = (await page.evaluate(() => window.LV5.vue().aUnFond)) === false;
  verdicts.sansOptionZeroGrain = (await page.evaluate(() => window.LV5.vue().nbGrains())) === 0;
  // La poussière SVG d'hier revient quand le fond est éteint : le décor n'a pas
  // disparu, il a changé de support.
  verdicts.sansOptionLaPoussiereSvgRevient =
    (await page.evaluate(() => document.querySelectorAll('.ciel-decor circle').length)) === 130;
  await page.close();
}

// ---------------------------------------------------------------------------
// ② LE FOND A PEINT — variance, pas luminance.
// ---------------------------------------------------------------------------
{
  const page = await ouvrir(1280, 860);
  const s = await statistiques(page);
  chiffres.fondDesktop = s && {
    moyenne: +s.moyenne.toFixed(3),
    variance: +s.variance.toFixed(3),
    partAllumee: +s.partAllumee.toFixed(4)
  };
  verdicts.leFondAPeint = !!s && s.variance > 0.05;
  // ET IL RESTE UN FOND. Une variance élevée pourrait aussi bien décrire un
  // canvas entièrement blanc : on exige qu'il demeure très majoritairement
  // sombre. Le décor éclaire le vide, il ne le remplace pas.
  verdicts.leFondResteUnFond = !!s && s.partAllumee < 0.25;

  // ③ LA PHASE, sur trois orientations de caméra ET après redimensionnement.
  const ecarts = [];
  for (const geste of ['rien', 'tourner', 'tourner-encore']) {
    if (geste !== 'rien') {
      await page.evaluate(() => {
        const v = window.LV5.vue();
        // On vise une étoile au hasard : cela tourne le monde, donc change
        // l'orientation à laquelle la projection est évaluée.
        const g = document.querySelectorAll('.ciel-etoile');
        v.viser(g[Math.floor(g.length / 2)].getAttribute('data-noeud-id'));
      });
      await page.waitForTimeout(700);
    }
    ecarts.push(await ecartDePhase(page));
  }
  // Puis un redimensionnement : c'est là que deux repères se désolidarisent.
  await page.setViewportSize({ width: 900, height: 700 });
  await page.waitForTimeout(800);
  ecarts.push(await ecartDePhase(page));

  chiffres.ecartsDePhase = ecarts.map((e) => (e === null ? null : +e.toFixed(3)));
  verdicts.phaseTenueAToutesLesOrientations = ecarts.every((e) => e !== null && e <= 1);
  await page.close();
}

// ---------------------------------------------------------------------------
// ④ LA DENSITÉ SUIT LA SURFACE — le correctif du « grossier ».
// ---------------------------------------------------------------------------
{
  const petite = await ouvrir(390, 844);
  const grainsPetite = await petite.evaluate(() => window.LV5.vue().nbGrains());
  const statPetite = await statistiques(petite);
  await petite.close();

  const grande = await ouvrir(1670, 900);
  const grainsGrande = await grande.evaluate(() => window.LV5.vue().nbGrains());
  await grande.close();

  chiffres.grains = { a390: grainsPetite, a1670: grainsGrande, rapport: +(grainsGrande / grainsPetite).toFixed(2) };
  verdicts.laDensiteSuitLaSurface = grainsGrande / grainsPetite >= 2.5;
  // Une constante aurait donné un rapport de 1,00 : le test échouerait, et
  // c'est exactement ce qu'on lui demande de savoir faire.
  verdicts.leFondAPeintAussiSurLeTelephone = !!statPetite && statPetite.variance > 0.05;
}

// ---------------------------------------------------------------------------
// ⑤ LE PLEIN ÉCRAN, ⑥ LE COÛT, ⑦ LE DÉCOR NE PREND AUCUN GESTE.
// ---------------------------------------------------------------------------
for (const [largeur, hauteur, nom] of [[390, 844, 'a390'], [1670, 900, 'a1670']]) {
  const page = await ouvrir(largeur, hauteur);

  const cadre = await page.evaluate(() => {
    const b = document.getElementById('lv5-scene').getBoundingClientRect();
    return {
      partL: b.width / window.innerWidth,
      partH: b.height / window.innerHeight,
      deborde: document.documentElement.scrollHeight - window.innerHeight
    };
  });
  chiffres['cadre_' + nom] = {
    partL: +cadre.partL.toFixed(3), partH: +cadre.partH.toFixed(3), deborde: cadre.deborde
  };
  verdicts['pleinEcran_' + nom] = cadre.partL >= 0.98 && cadre.partH >= 0.98;
  verdicts['rienNeDefile_' + nom] = cadre.deborde <= 1;

  // Le coût : les deux instruments, à charge réelle puis à charge construite.
  for (const charge of [3, 40]) {
    await page.evaluate((n) => window.LV5.charge(n), charge);
    await page.waitForTimeout(1500);
    const mesure = await page.evaluate(() => new Promise((resoudre) => {
      const v = window.LV5.vue();
      const t0 = performance.now();
      let images = 0;
      const tic = () => {
        images += 1;
        if (images < 60) { requestAnimationFrame(tic); return; }
        resoudre({
          travail: v.coutImage(),
          cadence: (performance.now() - t0) / images,
          crans: v.cransDeFond()
        });
      };
      requestAnimationFrame(tic);
    }));
    chiffres['cout_' + nom + '_charge' + charge] = {
      travailMs: +mesure.travail.toFixed(2), cadenceMs: +mesure.cadence.toFixed(1)
    };
    verdicts['travailSousBudget_' + nom + '_charge' + charge] = mesure.travail < 16.7;
    // La cadence est le second instrument, et le seul qui voie ce que le
    // navigateur paie à composer. 34 ms : la barre des 30 images par seconde,
    // le plancher en deçà duquel un ciel qu'on fait tourner au doigt accroche.
    //
    // LÀ OÙ LE PRODUIT VIT, ELLE EST EXIGÉE. Au-delà, ce qui est exigé n'est
    // plus la cadence mais la RÉACTION : le registre ne donne jamais plus de
    // quatre caps à un écran ; quarante est un pire cas construit, et sur
    // 1670 × 900 il a fait tomber la cadence à 44,6 ms pour un travail
    // JavaScript de 4,67 ms — le coût est dans la composition, pas dans le
    // code, et on ne l'optimise pas d'ici. Ce qu'on peut exiger, et qu'on
    // exige, c'est que le fond l'ait VU et ait rendu de la place.
    // C'est la même logique que le plancher d'occupation de LV4 : un seuil qui
    // baisse doit se justifier par la physique, jamais par l'envie de passer.
    if (charge <= 12) {
      verdicts['cadenceTenue_' + nom + '_charge' + charge] = mesure.cadence < 34;
    } else {
      verdicts['pireCasLeFondRendDeLaPlace_' + nom] = mesure.cadence < 34 || mesure.crans > 0;
      chiffres['crans_' + nom + '_charge' + charge] = mesure.crans;
    }
  }
  await page.evaluate(() => window.LV5.charge(3));
  await page.waitForTimeout(1200);

  // ⑦ Le décor ne prend aucun geste. Éprouvé PAR L'ABSENCE, comme une règle de
  // confidentialité : au point exact d'une étoile, ce que le document rend ne
  // doit PAS être le canvas.
  const capte = await page.evaluate(() => {
    const g = document.querySelector('.ciel-etoile');
    const r = g.querySelector('.ciel-zone').getBoundingClientRect();
    const cible = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      estUnCanvas: !!cible && cible.tagName.toLowerCase() === 'canvas',
      dansUneEtoile: !!cible && !!cible.closest('.ciel-etoile')
    };
  });
  verdicts['leFondNeVolePasLeGeste_' + nom] = capte.estUnCanvas === false;
  verdicts['letoileRecoitLeGeste_' + nom] = capte.dansUneEtoile === true;
  verdicts['leFondEstMuet_' + nom] =
    (await page.getAttribute('canvas.ciel-fond', 'aria-hidden')) === 'true';

  await page.close();
}

// ---------------------------------------------------------------------------
// ⑧ P1 — LE FOND SUR LA COQUE DE PRODUCTION (`ultima.html`).
//
// CE BLOC EXISTE À CAUSE D'UN OUBLI, et il est écrit pour qu'il ne se répète
// pas. Le moteur ne monte le fond que si `window.UltimaCielFond` existe : ce
// garde évite qu'une page sans le module se casse. Mais au premier essai de
// P1, `ultima.html` n'avait pas la balise `<script>` — option activée, aucun
// canvas, ZÉRO erreur console, page parfaitement fonctionnelle. Un garde qui
// protège d'une panne masque aussi un oubli.
// Le harnais EXIGE donc le canvas ici, au lieu de s'en remettre au garde.
// ---------------------------------------------------------------------------
for (const [largeur, hauteur, nom] of [[390, 844, 'coque390'], [1280, 860, 'coque1280']]) {
  const page = await browser.newPage({ viewport: { width: largeur, height: hauteur } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.goto('http://127.0.0.1:8123/ultima.html', { waitUntil: 'load' });
  await page.waitForTimeout(1800);

  const r = await page.evaluate(() => {
    const c = document.querySelector('canvas.ciel-fond');
    const v = window.UltimaCiel.courant();
    let stats = null;
    if (c) {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let s = 0; let s2 = 0; let n = 0;
      for (let i = 0; i < d.length; i += 4 * 37) {
        const l = (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722) * (d[i + 3] / 255);
        s += l; s2 += l * l; n += 1;
      }
      const m = s / n;
      stats = { moyenne: m, variance: s2 / n - m * m };
    }
    // La phase, dans le repère du canvas (voir la note plus haut).
    let phase = null;
    if (c && v && v.temoin) {
      const boite = c.getBoundingClientRect();
      for (const g of document.querySelectorAll('.ciel-etoile')) {
        if (g.getAttribute('display') === 'none') { continue; }
        const t = v.temoin(g.getAttribute('data-noeud-id'));
        if (!t) { continue; }
        const rr = g.querySelector('circle').getBoundingClientRect();
        phase = Math.sqrt((rr.left + rr.width / 2 - boite.left - t.px) ** 2
          + (rr.top + rr.height / 2 - boite.top - t.py) ** 2);
        break;
      }
    }
    // Le geste va-t-il bien à l'étoile ?
    const g0 = document.querySelector('.ciel-etoile');
    const z = g0 && g0.querySelector('.ciel-zone').getBoundingClientRect();
    const cible = z && document.elementFromPoint(z.left + z.width / 2, z.top + z.height / 2);
    return {
      canvas: !!c,
      stats,
      phase,
      grains: v ? v.nbGrains() : 0,
      cout: v ? v.coutImage() : null,
      // La poussière SVG d'hier ne doit PLUS être là : deux champs de grains
      // superposés seraient deux vérités sur le même décor.
      poussiereSvg: document.querySelectorAll('.ciel-decor circle').length,
      etoiles: document.querySelectorAll('.ciel-etoile').length,
      gesteVaALEtoile: !!cible && !!cible.closest('.ciel-etoile')
    };
  });

  chiffres[nom] = {
    grains: r.grains,
    variance: r.stats ? +r.stats.variance.toFixed(3) : null,
    phasePx: r.phase === null ? null : +r.phase.toFixed(2),
    coutMs: r.cout === null ? null : +r.cout.toFixed(2)
  };
  verdicts['coqueLeFondEstMonte_' + nom] = r.canvas === true;
  verdicts['coqueLeFondAPeint_' + nom] = !!r.stats && r.stats.variance > 0.05;
  verdicts['coquePhaseTenue_' + nom] = r.phase !== null && r.phase <= 1;
  verdicts['coquePlusDePoussiereSvg_' + nom] = r.poussiereSvg === 0;
  verdicts['coqueLesCapsSontLa_' + nom] = r.etoiles === 2; // ULTIMA n'a que GRIMA et NAGA
  verdicts['coqueLeGesteVaALEtoile_' + nom] = r.gesteVaALEtoile === true;
  await page.close();
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE LV5-FOND VERT' : 'SMOKE LV5-FOND ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
