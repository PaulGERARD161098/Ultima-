// Harnais — RIVEN en nébuleuses (CADRAGE-RIVEN-NEBULEUSES.md, lots 1 à 3 ;
// le lot 3, « le volume en constellations », est la section 6).
//
// Il mesure sur les boîtes RÉELLEMENT peintes (getBoundingClientRect), jamais
// sur le calcul qui les a posées : un calcul juste peut être mal peint.
//
// ⛔ L'INSTRUMENT S'ÉPROUVE SUR UN CAS DONT ON CONNAÎT LA RÉPONSE : on désactive
// l'évitement des noms (`_sansEvitement`) et on exige que la mesure voie des
// chevauchements. Sans ce sabotage, « 0 chevauchement » pourrait venir d'une
// mesure aveugle. Et chaque recherche d'absence a son verrou de non-vacuité :
// « 0 chevauchement » ne vaut que si des noms sont visibles.
//
// Deux pages : riven.html en mode démonstration (le produit, bout à bout), et
// design/preview-riven-nebuleuses.html (le même module, 54 puis 300 fiches
// fictives — les cas denses).
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const verdicts = {};
const details = {};

const DEMO = async (page) => {
  await page.addInitScript(() => {
    try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
    // L'espion de la couche de fond (même geste que tests/smoke-nebuleuses.mjs) :
    // il garde l'état du fond, qui dit ce qu'il a RÉELLEMENT peint.
    let reel;
    Object.defineProperty(window, 'UltimaCielFond', {
      configurable: true,
      get() { return reel; },
      set(v) {
        const creer = v.creer;
        v.creer = function (o) { const etat = creer.call(v, o); window.__fondEtat = etat; return etat; };
        reel = v;
      }
    });
  });
};

// Les boîtes visibles d'un sélecteur, et leurs chevauchements deux à deux.
function mesurer(page, selecteur, racine) {
  return page.evaluate(([sel, rac]) => {
    const cadre = document.querySelector(rac).getBoundingClientRect();
    const visibles = [...document.querySelectorAll(sel)].filter((t) =>
      !t.closest('[display="none"]') && t.getAttribute('display') !== 'none' && !t.closest('[hidden]'));
    const boites = visibles.map((t) => t.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
    let chevauchements = 0;
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) {
        const a = boites[i], b = boites[j];
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
            Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) { chevauchements++; }
      }
    }
    const dehors = boites.filter((r) => r.left < cadre.left - 1 || r.right > cadre.right + 1 ||
      r.top < cadre.top - 1 || r.bottom > cadre.bottom + 1).length;
    return { visibles: boites.length, chevauchements, dehors };
  }, [selecteur, racine]);
}
// Les noms contre les cœurs d'étoile, SA propre étoile comprise (relecture du
// 30/09 : peints avant, les cœurs rognaient les noms — et « nom contre nom »
// ne le voyait pas).
function nomsContreCoeurs(page, racine) {
  return page.evaluate((rac) => {
    const svg = document.querySelector(rac);
    const noms = [...svg.querySelectorAll('.neb-nom')].filter((t) =>
      !t.closest('[display="none"]') && t.getAttribute('display') !== 'none').map((t) => t.getBoundingClientRect())
      .filter((r) => r.width > 0);
    const coeurs = [...svg.querySelectorAll('.neb-coeur')].map((c) => c.getBoundingClientRect());
    let n = 0;
    noms.forEach((a) => coeurs.forEach((b) => {
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5) { n++; }
    }));
    return { noms: noms.length, contacts: n };
  }, racine);
}
const cles = (page) => page.evaluate(() => window.UltimaNebuleuses.courant().etat().nebuleuses.map((n) => n.cle));
async function approcherAuClavier(page, cle) {
  await page.locator(`.neb-nebuleuse[data-nebuleuse="${cle}"]`).focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction((c) => {
    const v = window.UltimaNebuleuses.courant();
    if (!v || v.etat().active !== c) { return false; }
    return [...document.querySelectorAll(`.neb-nebuleuse[data-nebuleuse="${c}"] .neb-noms`)].some((g) => g.getAttribute('display') !== 'none');
  }, cle, { timeout: 4000 });
}

// ============ 1. RIVEN, mode démonstration, deux largeurs ============
for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const L = vp.width;
  const page = await browser.newPage({ viewport: vp });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push('console: ' + m.text()); } });
  await DEMO(page);
  await page.goto(BASE + '/riven.html', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1200);

  // La carte à plat est la vue par défaut, et le bouton le dit.
  const arrivee = await page.evaluate(() => ({
    carte: !!document.querySelector('#ciel-scene .neb-svg'),
    etoiles: document.querySelectorAll('#ciel-scene .neb-svg g.ciel-etoile[data-noeud-id]').length,
    bouton: document.getElementById('ciel-plat').textContent,
    presse: document.getElementById('ciel-plat').getAttribute('aria-pressed'),
    deriveCachee: document.getElementById('ciel-derive').closest('label').hidden
  }));
  verdicts[`${L}_carteParDefaut`] = arrivee.carte && arrivee.bouton === 'En volume' && arrivee.presse === 'true' && arrivee.deriveCachee;
  verdicts[`${L}_toutesLesFiches`] = arrivee.etoiles === 9;

  // C2 — vue d'ensemble : aucun titre recouvert, aucun titre coupé.
  const titres = await mesurer(page, '#ciel-scene .neb-titre', '#ciel-scene .neb-svg');
  verdicts[`${L}_titresSansChevauchement`] = titres.visibles >= 3 && titres.chevauchements === 0 && titres.dehors === 0;

  // C3 + C5 — chaque nébuleuse, au clavier : noms visibles, jamais recouverts, jamais coupés.
  const pire = { chevauchements: 0, dehors: 0, coeurs: 0 };
  let vus = 0;
  for (const cle of await cles(page)) {
    await approcherAuClavier(page, cle);
    const m = await mesurer(page, '#ciel-scene .neb-nom', '#ciel-scene .neb-svg');
    vus += m.visibles; pire.chevauchements += m.chevauchements; pire.dehors += m.dehors;
    pire.coeurs += (await nomsContreCoeurs(page, '#ciel-scene .neb-svg')).contacts;
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.UltimaNebuleuses.courant().etat().active === null, null, { timeout: 3000 });
  }
  verdicts[`${L}_nomsJamaisRecouverts`] = vus === 9 && pire.chevauchements === 0 && pire.dehors === 0 && pire.coeurs === 0;
  details[`${L}_noms`] = { vus, ...pire };

  // C4 — toucher une étoile d'une nébuleuse approchée ouvre SA fiche : le titre
  // de la fiche ouverte est le nom que porte l'étoile touchée.
  await approcherAuClavier(page, 'btp');
  const etoile = page.locator('.neb-nebuleuse[data-nebuleuse="btp"] g.ciel-etoile').nth(1);
  const libelleEtoile = await etoile.getAttribute('aria-label');
  await etoile.click();
  await page.waitForTimeout(500);
  const titreFiche = (await page.locator('#panneau-titre').textContent()) || '';
  verdicts[`${L}_etoileOuvreSaFiche`] = titreFiche.length > 0 && !!libelleEtoile && libelleEtoile.startsWith(titreFiche + ',');

  // S11 — Échap sur la carte ramène la vue d'ensemble SANS fermer la fiche ouverte.
  await etoile.focus();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  verdicts[`${L}_echapNeFermePasLaFiche`] = await page.evaluate(() =>
    window.UltimaNebuleuses.courant().etat().active === null && !document.getElementById('panneau').hidden);

  // S1 — la fiche ouverte ne ramène plus la carte de force : « Tout voir » tient
  // à la frappe suivante, et la recherche va où sont les fiches trouvées.
  // Sur grand écran seulement : sur un téléphone, la fiche ouverte recouvre la
  // barre d'outils, le cas n'existe pas.
  if (L >= 1000) {
  await approcherAuClavier(page, 'btp');
  await page.locator('#ciel-tout-voir').click();
  await page.waitForTimeout(500);
  await page.locator('#ciel-recherche').fill('a');
  await page.waitForTimeout(500);
  const apresToutVoir = await page.evaluate(() => window.UltimaNebuleuses.courant().etat().active);
  await page.locator('#ciel-recherche').fill('Agence Habitat Sud');
  await page.waitForTimeout(500);
  const apresRecherche = await page.evaluate(() => window.UltimaNebuleuses.courant().etat().active);
  verdicts[`${L}_ficheOuverteNeForcePasLaVue`] = apresToutVoir === null && apresRecherche === 'conseil';
  details[`${L}_S1`] = { apresToutVoir, apresRecherche };
  await page.locator('#ciel-recherche').fill('');
  await page.waitForTimeout(400);
  }
  await page.evaluate(() => { const b = document.getElementById('bouton-fermer-panneau'); if (b) { b.click(); } });
  await page.waitForTimeout(300);

  // Cible tactile : au moins 24 px de diamètre sur chaque étoile.
  const cibles = await page.evaluate(() => [...document.querySelectorAll('.neb-svg .ciel-zone')]
    .map((z) => z.getBoundingClientRect().width).filter((w) => w > 0));
  verdicts[`${L}_ciblesTactiles`] = cibles.length > 0 && Math.min(...cibles) >= 23.5;

  // S3 — l'arbre d'accessibilité RÉEL (Chrome) : aucun bouton n'en contient un
  // autre ; hors nébuleuse approchée, aucune étoile n'y est exposée.
  const arbre = async () => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Accessibility.enable');
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    await cdp.detach();
    const parId = new Map(nodes.map((n) => [n.nodeId, n]));
    const role = (n) => n && n.role && n.role.value;
    const nom = (n) => (n && n.name && n.name.value) || '';
    let imbriques = 0;
    const etoiles = nodes.filter((n) => !n.ignored && role(n) === 'button' && nom(n).endsWith('Entrée pour ouvrir la fiche.'));
    nodes.filter((n) => !n.ignored && role(n) === 'button').forEach((b) => {
      const pile = [...(b.childIds || [])];
      while (pile.length) {
        const c = parId.get(pile.pop());
        if (!c) { continue; }
        if (!c.ignored && role(c) === 'button') { imbriques++; }
        pile.push(...(c.childIds || []));
      }
    });
    return { imbriques, etoiles: etoiles.length };
  };
  await page.locator('#ciel-tout-voir').click();
  await page.waitForTimeout(500);
  const axEnsemble = await arbre();
  await approcherAuClavier(page, 'btp');
  const axApproche = await arbre();
  verdicts[`${L}_aucunBoutonDansUnBouton`] = axEnsemble.imbriques === 0 && axApproche.imbriques === 0;
  verdicts[`${L}_etoilesExposeesSeulementApprochees`] = axEnsemble.etoiles === 0 && axApproche.etoiles === 4;
  details[`${L}_ax`] = { axEnsemble, axApproche };

  // S4 — le focus ne tombe jamais sur <body> : Échap depuis une étoile le rend à
  // sa nébuleuse ; une entrée du panneau et le retour le gardent dans le panneau.
  await page.locator('.neb-nebuleuse[data-nebuleuse="btp"] g.ciel-etoile').first().focus();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const focusEchap = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-nebuleuse'));
  await page.locator('.neb-panneau .neb-entree').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const focusEntree = await page.evaluate(() => !!document.activeElement.closest('.neb-panneau'));
  await page.locator('.neb-panneau .neb-retour').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  const focusRetour = await page.evaluate(() => !!document.activeElement.closest('.neb-panneau'));
  verdicts[`${L}_focusNeSePerdPas`] = focusEchap === 'btp' && focusEntree && focusRetour;
  details[`${L}_focus`] = { focusEchap, focusEntree, focusRetour };

  // S5 — l'anneau de focus se mesure en pixels, pas en unités de carte.
  verdicts[`${L}_anneauDeFocusEnPixels`] = await page.evaluate(() => {
    const f = document.querySelector('.neb-focus');
    const s = getComputedStyle(f);
    return s.vectorEffect === 'non-scaling-stroke' && s.strokeWidth === '2px';
  });

  // La recherche : « Lyon » ne trouve qu'une fiche (Plomberie) → la carte s'approche du BTP,
  // les autres étoiles s'éteignent.
  await page.locator('#ciel-recherche').fill('Lyon');
  await page.waitForTimeout(500);
  const recherche = await page.evaluate(() => ({
    active: window.UltimaNebuleuses.courant().etat().active,
    eteintes: document.querySelectorAll('.neb-svg .neb-eteinte').length
  }));
  verdicts[`${L}_rechercheSApproche`] = recherche.active === 'btp' && recherche.eteintes === 8;
  await page.locator('#ciel-recherche').fill('');
  await page.waitForTimeout(300);

  // C9 — la même nébuleuse dans les deux vues, étoile par étoile.
  const aPlat = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.neb-svg g.ciel-etoile')]
    .map((g) => [g.getAttribute('data-noeud-id'), g.closest('.neb-nebuleuse').getAttribute('data-nebuleuse')])));
  // C10 — le bouton bascule en volume, et le choix est retenu.
  await page.locator('#ciel-plat').click();
  await page.waitForTimeout(1200);
  const volume = await page.evaluate(() => {
    const T = window.UltimaNebuleusesRiven;
    // Lot 3 : le titre écrit le nom COURT ; le nom entier est celui que lit le
    // lecteur d'écran (« Nébuleuse X, N contacts »).
    const amas = [...document.querySelectorAll('#ciel-scene .ciel-nom-amas[data-nebuleuse]')]
      .map((t) => (t.getAttribute('aria-label') || '').replace(/^Nébuleuse /, '').replace(/, \d+ contacts?$/, '').toLowerCase());
    const parEtoile = Object.fromEntries([...document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id]')].map((g) => {
      const libelle = g.getAttribute('aria-label') || '';
      const n = T.NEBULEUSES.find((x) => libelle.includes(', nébuleuse ' + x.nom + ','));
      return [g.getAttribute('data-noeud-id'), n ? n.cle : null];
    }));
    return {
      carte: !!document.querySelector('#ciel-scene .neb-svg'),
      amas, parEtoile,
      bouton: document.getElementById('ciel-plat').textContent,
      retenu: localStorage.getItem('ultima-ciel-vue'),
      deriveVisible: !document.getElementById('ciel-derive').closest('label').hidden,
      brumes: window.__fondEtat && typeof window.__fondEtat.nebuleusesPeintes === 'function'
        ? window.__fondEtat.nebuleusesPeintes().length : null
    };
  });
  verdicts[`${L}_basculeEnVolume`] = !volume.carte && volume.bouton === 'À plat' && volume.retenu === 'volume' && volume.deriveVisible;
  verdicts[`${L}_volumeEnNebuleuses`] = volume.amas.length === 3 &&
    volume.amas.every((a) => ['btp & rénovation', 'conseil & services aux entreprises', 'à classer'].includes(a));
  verdicts[`${L}_memeNebuleuseDansLesDeuxVues`] = Object.keys(aPlat).length === 9 &&
    Object.entries(aPlat).every(([id, cle]) => volume.parEtoile[id] === cle);
  details[`${L}_brumesPeintes`] = volume.brumes;
  // Lot 2 — les brumes du volume sont celles des nébuleuses : trois en démonstration.
  verdicts[`${L}_brumesDuVolume`] = volume.brumes === 3;

  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1300);
  verdicts[`${L}_choixRetenuAuRechargement`] = await page.evaluate(() =>
    !document.querySelector('#ciel-scene .neb-svg') && document.getElementById('ciel-plat').textContent === 'À plat');
  await page.locator('#ciel-plat').click();
  await page.waitForTimeout(800);
  verdicts[`${L}_retourALaCarte`] = await page.evaluate(() =>
    !!document.querySelector('#ciel-scene .neb-svg') && localStorage.getItem('ultima-ciel-vue') === 'plat');

  verdicts[`${L}_zeroErreur`] = erreurs.length === 0;
  if (erreurs.length) { details[`${L}_erreurs`] = erreurs; }
  await page.close();
}

// ============ 2. Moins de mouvement : la carte s'impose ============
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await DEMO(page);
  await page.addInitScript(() => { try { localStorage.setItem('ultima-ciel-vue', 'volume'); } catch (e) {} });
  await page.goto(BASE + '/riven.html', { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1200);
  const avant = await page.evaluate(() => !!document.querySelector('#ciel-scene .neb-svg'));
  await page.locator('#ciel-plat').click();
  await page.waitForTimeout(600);
  const apres = await page.evaluate(() => ({ carte: !!document.querySelector('#ciel-scene .neb-svg'), toast: document.body.innerText.includes('moins de mouvement') }));
  verdicts.moinsDeMouvement_carteImposee = avant && apres.carte && apres.toast;
  await page.close();
}

// ============ 3. La maquette fictive : 54 puis 300 fiches ============
for (const n of [54, 300]) {
  for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const page = await browser.newPage({ viewport: vp });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?n=${n}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(400);
    const titres = await mesurer(page, '.neb-titre', '.neb-svg');
    let vus = 0, chev = 0, dehors = 0, caches = 0, cachesHorsPanneau = 0, coeurs = 0;
    for (const cle of await cles(page)) {
      await approcherAuClavier(page, cle);
      const m = await mesurer(page, '.neb-nom', '.neb-svg');
      vus += m.visibles; chev += m.chevauchements; dehors += m.dehors;
      coeurs += (await nomsContreCoeurs(page, '.neb-svg')).contacts;
      // Un nom caché sur la carte doit être dans le panneau : c'est la promesse
      // de la règle « s'il n'a pas de place, il se cache, et le panneau le donne ».
      cachesHorsPanneau += await page.evaluate((c) => {
        const panneau = [...document.querySelectorAll('.neb-panneau .neb-fiche')].map((b) => b.textContent);
        return [...document.querySelectorAll(`.neb-nebuleuse[data-nebuleuse="${c}"] .neb-noms text`)]
          .filter((tx) => tx.getAttribute('display') === 'none')
          .filter((tx) => !panneau.includes(tx.textContent)).length;
      }, cle);
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => window.UltimaNebuleuses.courant().etat().active === null, null, { timeout: 3000 });
    }
    caches = await page.evaluate(() => window.UltimaNebuleuses.courant().etat().nebuleuses.reduce((s, x) => s + x.caches, 0));
    const tag = `maquette${n}_${vp.width}`;
    details[tag] = { titres: titres.visibles, nomsVus: vus, caches, chev, dehors, cachesHorsPanneau, coeurs };
    verdicts[`${tag}_titres`] = titres.visibles >= 9 && titres.chevauchements === 0 && titres.dehors === 0;
    // Jamais un nom recouvert ni coupé ; un nom sans place se cache ET se trouve
    // dans le panneau. 54 fiches sur un grand écran : toutes lisibles.
    // ⚠️ 54 fiches sur 390 px : 3 noms cachés, MESURÉ le 2026-09-30, dans les
    // deux nébuleuses les plus denses (11 et 12 fiches) — un nom de 26
    // caractères en 12 px ne tient pas au bord d'un écran de 364 px. C'est un
    // PLAFOND ANTI-RÉGRESSION, pas un objectif : aller plus bas demanderait de
    // passer sous le plancher de 12 px (C5) ou de déplacer les étoiles à
    // l'approche. 300 fiches : la règle tient, c'est tout.
    const plancher = n === 54 ? (vp.width >= 1000 ? vus === 54 : caches <= 3) : vus > 60;
    verdicts[`${tag}_noms`] = chev === 0 && dehors === 0 && coeurs === 0 && plancher && vus + caches === n && cachesHorsPanneau === 0;
    verdicts[`${tag}_zeroErreur`] = erreurs.length === 0;
    await page.close();
  }
}

// ============ 4. Le sabotage : l'instrument voit ce qu'il doit voir ============
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?n=54`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.UltimaNebuleuses.courant()._sansEvitement = true; });
  await approcherAuClavier(page, 'btp');
  const m = await mesurer(page, '.neb-nom', '.neb-svg');
  verdicts.sabotage_lInstrumentVoitLesChevauchements = m.chevauchements > 0;
  details.sabotage = m;
  // Second sabotage : les cœurs repassent à leur taille de carte (3,4 unités,
  // ~14 px une fois approchés) — la mesure nom contre cœur doit le voir.
  await page.evaluate(() => { window.UltimaNebuleuses.courant()._sansEvitement = false; });
  await page.keyboard.press('Escape');
  await approcherAuClavier(page, 'btp');
  await page.evaluate(() => document.querySelectorAll('.neb-coeur').forEach((c) => c.setAttribute('r', '3.4')));
  const c = await nomsContreCoeurs(page, '.neb-svg');
  verdicts.sabotage_lInstrumentVoitLesCoeurs = c.noms > 0 && c.contacts > 0;
  details.sabotageCoeurs = c;
  await page.close();
}

// ============ 5. C7 — l'approche ne bloque pas l'écran (émulation mobile) ============
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?n=54`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.__longues = [];
    new PerformanceObserver((l) => { l.getEntries().forEach((e) => window.__longues.push(e.duration)); })
      .observe({ type: 'longtask', buffered: false });
  });
  await page.locator('.neb-nebuleuse[data-nebuleuse="conseil"]').tap();
  await page.waitForTimeout(1200);
  const longues = await page.evaluate(() => window.__longues);
  // Verrou de non-vacuité : « aucune tâche longue » ne vaut que si l'observateur
  // existe ET si l'approche a bien eu lieu.
  const observe = await page.evaluate(() => PerformanceObserver.supportedEntryTypes.includes('longtask') &&
    window.UltimaNebuleuses.courant().etat().active === 'conseil');
  details.approcheTachesLongues = longues.map((d) => Math.round(d));
  verdicts.approcheSansTacheDePlusDe50ms = observe && longues.every((d) => d <= 50);
  await page.close();
}

// ============ 6. Lot 3 — le volume en constellations (§8 du cadrage) ============
// Ce qui se mesure, sur ce qui est RÉELLEMENT peint : les noms (opacité
// calculée), les titres (boîtes), les brumes (disques relus dans la couche de
// fond), les étoiles (cœurs). Chaque absence a son verrou de non-vacuité, et
// trois sabotages du moteur (section 6 ter) prouvent que l'instrument voit.
//
// ⚠️ LE RECOUVREMENT DE DEUX BRUMES se juge sur leur partie VISIBLE : un lobe
// est un dégradé radial dont l'opacité tombe à 0,05 à mi-rayon et à 0,01 aux
// trois quarts (`spriteNebuleuse`). Deux brumes « se touchent » quand deux
// lobes de nébuleuses différentes sont à moins de la moitié de la somme de
// leurs rayons. Choix consigné au §8 du cadrage, pas un seuil réglé pour passer.
async function etatVolume(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('#ciel-scene');
    const sr = scene.getBoundingClientRect();
    const canvas = scene.querySelector('canvas.ciel-fond');
    const cr = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
    const T = window.UltimaNebuleusesRiven;
    const parTeinte = Object.fromEntries(T.NEBULEUSES.map((n) => [T.teinte(n), n.nom]));
    const peintes = window.__fondEtat && typeof window.__fondEtat.nebuleusesPeintes === 'function'
      ? window.__fondEtat.nebuleusesPeintes() : [];
    const brumes = peintes.map((b) => ({
      nom: parTeinte[b.teinte] || b.teinte,
      disques: (b.disques || []).map((d) => ({ x: cr.left + d.px, y: cr.top + d.py, r: d.r }))
    }));
    let touches = 0;
    for (let i = 0; i < brumes.length; i++) {
      for (let j = i + 1; j < brumes.length; j++) {
        brumes[i].disques.forEach((a) => brumes[j].disques.forEach((b) => {
          if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) / 2) { touches++; }
        }));
      }
    }
    const etoiles = [...scene.querySelectorAll('g.ciel-etoile[data-noeud-id]')].map((g) => {
      const c = g.querySelector('circle[fill="#ffffff"]').getBoundingClientRect();
      const libelle = g.getAttribute('aria-label') || '';
      const neb = T.NEBULEUSES.find((n) => libelle.includes(', nébuleuse ' + n.nom + ','));
      return { x: c.left + c.width / 2, y: c.top + c.height / 2, nom: neb ? neb.nom : null };
    });
    const horsDeSaBrume = etoiles.filter((e) => {
      const b = brumes.find((x) => x.nom === e.nom);
      return !b || !b.disques.some((d) => Math.hypot(d.x - e.x, d.y - e.y) <= d.r);
    }).length;
    const nomsVisibles = [...scene.querySelectorAll('.ciel-nom')]
      .filter((n) => parseFloat(getComputedStyle(n).opacity) > 0.05 && parseFloat(n.getAttribute('opacity') || '1') > 0.05).length;
    const titres = [...scene.querySelectorAll('.ciel-titres-nebuleuses .ciel-nom-amas[role="button"]')];
    return {
      cote: Math.min(sr.width, sr.height), etoiles: etoiles.length, titres: titres.length,
      titresTabulables: titres.filter((t) => t.getAttribute('tabindex') === '0' && /^Nébuleuse .+, \d+ contacts?$/.test(t.getAttribute('aria-label') || '')).length,
      brumes: brumes.length, disques: brumes.reduce((n, b) => n + b.disques.length, 0),
      touches, horsDeSaBrume, nomsVisibles,
      approchee: window.UltimaCiel.courant() ? window.UltimaCiel.courant().approchee() : 'absent'
    };
  });
}
// La nébuleuse approchée : ses noms (visibles, sans chevauchement, sans cœur
// sous eux) et l'étendue de ses étoiles rapportée à la scène.
async function etatApproche(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('#ciel-scene');
    const sr = scene.getBoundingClientRect();
    const noms = [...scene.querySelectorAll('.ciel-nom--approche')]
      .filter((n) => parseFloat(getComputedStyle(n).opacity) > 0.05).map((n) => n.getBoundingClientRect());
    const coeurs = [...scene.querySelectorAll('g.ciel-etoile--approchee > circle[fill="#ffffff"]')].map((c) => c.getBoundingClientRect());
    let chevauchements = 0, surUnCoeur = 0, dehors = 0;
    for (let i = 0; i < noms.length; i++) {
      const a = noms[i];
      if (a.left < sr.left - 1 || a.right > sr.right + 1) { dehors++; }
      for (let j = i + 1; j < noms.length; j++) {
        const b = noms[j];
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) { chevauchements++; }
      }
      coeurs.forEach((c) => {
        if (Math.min(a.right, c.right) - Math.max(a.left, c.left) > 0.5 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 0.5) { surUnCoeur++; }
      });
    }
    const xs = coeurs.map((c) => c.left + c.width / 2), ys = coeurs.map((c) => c.top + c.height / 2);
    const etendue = coeurs.length > 1 ? Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) : 0;
    return {
      noms: noms.length, chevauchements, surUnCoeur, dehors, etoiles: coeurs.length,
      occupation: +(etendue / Math.min(sr.width, sr.height)).toFixed(2),
      approchee: window.UltimaCiel.courant().approchee(),
      focus: document.activeElement && document.activeElement.getAttribute('data-nebuleuse')
    };
  });
}
// La caméra glisse (≈ 11 % du chemin par image) : à 300 fiches, une durée fixe
// mesurait parfois une image EN MOUVEMENT, où un nom qui s'efface croisait
// encore son remplaçant. On attend donc qu'elle soit posée, pas qu'un délai passe.
async function attendreImmobile(page) {
  let avant = -1;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(150);
    const d = await page.evaluate(() => window.UltimaCiel.courant().distance());
    if (Math.abs(d - avant) < 0.05) { await page.waitForTimeout(200); return true; }
    avant = d;
  }
  return false;
}
const vueEnsembleSaine = (e, n) => e.etoiles === n && e.titres > 0 && e.brumes === e.titres && e.disques > 0 &&
  e.nomsVisibles === 0 && e.touches === 0 && e.horsDeSaBrume === 0 && e.titresTabulables === e.titres && e.approchee === null;
const approcheSaine = (a, cle) => a.approchee === cle && a.noms > 0 && a.chevauchements === 0 && a.surUnCoeur === 0 &&
  a.dehors === 0 && a.occupation >= 0.5;

for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const L = vp.width;
  // 6a. Le produit : RIVEN en démonstration, ouvert en volume.
  {
    const page = await browser.newPage({ viewport: vp });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await DEMO(page);
    await page.addInitScript(() => { try { localStorage.setItem('ultima-ciel-vue', 'volume'); } catch (e) {} });
    await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(1800);
    const ens = await etatVolume(page);
    details[`lot3_${L}_demo_ensemble`] = ens;
    verdicts[`lot3_${L}_demo_seulsLesNomsDesNebuleuses`] = vueEnsembleSaine(ens, 9) && ens.titres === 3;
    const t = await mesurer(page, '.ciel-titres-nebuleuses .ciel-nom-amas', '#ciel-scene');
    details[`lot3_${L}_demo_titres`] = t;
    verdicts[`lot3_${L}_demo_titresSansChevauchement`] = t.visibles === 3 && t.chevauchements === 0 && t.dehors === 0;
    // L'arbre d'accessibilité : trois boutons nommés « Nébuleuse … ».
    const cdp = await page.context().newCDPSession(page);
    const { nodes } = await cdp.send('Accessibility.getFullAXTree');
    const boutons = nodes.filter((n) => n.role && n.role.value === 'button' && n.name && /^Nébuleuse /.test(n.name.value || ''));
    verdicts[`lot3_${L}_demo_titresSontDesBoutons`] = boutons.length === 3;
    // La souris : un clic sur le titre s'approche.
    await page.locator('.ciel-nom-amas[data-nebuleuse="neb-btp"]').click();
    await page.waitForTimeout(300);
    await attendreImmobile(page);
    const app = await etatApproche(page);
    details[`lot3_${L}_demo_approche`] = app;
    verdicts[`lot3_${L}_demo_clicSApproche`] = approcheSaine(app, 'neb-btp');
    // Relecture du 30/09 — pendant l'approche : ① les titres effacés sortent de
    // la tabulation ; ② survoler une étoile ne rallume pas les autres
    // nébuleuses ; ③ les personnes rattachées suivent leur étoile.
    await page.locator('g.ciel-etoile--approchee[data-noeud-id]').first().hover();
    await page.waitForTimeout(300);
    const pendant = await page.evaluate(() => {
      const sc = document.querySelector('#ciel-scene');
      const titres = [...sc.querySelectorAll('.ciel-nom-amas[data-nebuleuse]')];
      const autres = [...sc.querySelectorAll('g.ciel-etoile[data-noeud-id]:not(.ciel-etoile--approchee)')].map((g) => parseFloat(getComputedStyle(g).opacity));
      const personnes = [...sc.querySelectorAll('g.ciel-personne.ciel-etoile--approchee')].map((g) => parseFloat(getComputedStyle(g).opacity));
      return {
        titresEffacesTabulables: titres.filter((t) => t.getAttribute('opacity') === '0.00' && t.getAttribute('tabindex') === '0' && t !== document.activeElement).length,
        autresMax: autres.length ? Math.max(...autres) : null, autres: autres.length,
        personnes: personnes.length, personnesMin: personnes.length ? Math.min(...personnes) : null
      };
    });
    details[`lot3_${L}_demo_pendant`] = pendant;
    verdicts[`lot3_${L}_demo_titresEffacesHorsTabulation`] = pendant.titresEffacesTabulables === 0;
    verdicts[`lot3_${L}_demo_survolNeRallumePas`] = pendant.autres > 0 && pendant.autresMax <= 0.25;
    verdicts[`lot3_${L}_demo_personnesSuiventLeurEtoile`] = pendant.personnes > 0 && pendant.personnesMin > 0.5;
    await page.mouse.move(2, 2);
    // Échap : retour à l'ensemble, le focus revient au titre quitté.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await attendreImmobile(page);
    const retour = await etatVolume(page);
    const focus = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-nebuleuse'));
    verdicts[`lot3_${L}_demo_echapRevientALEnsemble`] = vueEnsembleSaine(retour, 9) && focus === 'neb-btp';
    // Le clavier. À l'ensemble, seuls les titres sont tabulables (relecture :
    // il fallait 301 Tab pour atteindre le premier). Entrée sur un titre ENTRE
    // dans la nébuleuse — focus sur sa première étoile — sans faire pivoter la
    // grille (relecture : viser la couchait, 39 étoiles hors cadre).
    const tabulables = await page.evaluate(() => [...document.querySelectorAll('#ciel-scene [tabindex="0"]')]
      .every((el) => el.matches('.ciel-nom-amas[data-nebuleuse][role="button"]')));
    await page.locator('.ciel-nom-amas[data-nebuleuse="neb-conseil"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await attendreImmobile(page);
    const clavier = await page.evaluate(() => {
      const a = document.activeElement;
      const o = window.UltimaCiel.courant().orientation();
      return { approchee: window.UltimaCiel.courant().approchee(), focusEtoile: !!(a && a.matches('g.ciel-etoile--approchee[data-noeud-id]')), yaw: o.yaw, pitch: o.pitch };
    });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(600);
    const apresTab = await page.evaluate(() => window.UltimaCiel.courant().orientation());
    details[`lot3_${L}_demo_clavier`] = { tabulables, clavier, apresTab };
    verdicts[`lot3_${L}_demo_aLEnsembleSeulsLesTitresSeTabulent`] = tabulables;
    verdicts[`lot3_${L}_demo_entreeEntreDansLaNebuleuse`] = clavier.approchee === 'neb-conseil' && clavier.focusEtoile &&
      Math.abs(clavier.yaw - 0.6) < 0.01 && Math.abs(apresTab.yaw - 0.6) < 0.01 && Math.abs(apresTab.pitch + 0.28) < 0.01;
    // Échap depuis le mobilier du ciel (« + ») ressort aussi.
    await page.locator('#ciel-approcher').click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    verdicts[`lot3_${L}_demo_echapDepuisLesBoutons`] = (await page.evaluate(() => window.UltimaCiel.courant().approchee())) === null;
    // La recherche re-rend le ciel à chaque frappe : la nébuleuse approchée survit.
    await page.locator('.ciel-nom-amas[data-nebuleuse="neb-conseil"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await page.locator('#ciel-recherche').fill('a');
    await page.waitForTimeout(600);
    verdicts[`lot3_${L}_demo_rechercheGardeLApproche`] = (await page.evaluate(() => window.UltimaCiel.courant().approchee())) === 'neb-conseil';
    await page.locator('#ciel-recherche').fill('');
    await page.waitForTimeout(600);
    // « Tout voir » (le bouton de la page) ramène aussi à l'ensemble.
    await page.locator('#ciel-tout-voir').click();
    await page.waitForTimeout(300);
    await attendreImmobile(page);
    verdicts[`lot3_${L}_demo_toutVoirRevient`] = vueEnsembleSaine(await etatVolume(page), 9);
    verdicts[`lot3_${L}_demo_zeroErreur`] = erreurs.length === 0;
    await page.close();
  }
  // 6b. La maquette fictive, 54 puis 300 fiches : les cas denses.
  for (const n of [54, 300]) {
    const page = await browser.newPage({ viewport: vp });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await DEMO(page);
    await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?vue=volume&n=${n}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(2200);
    const ens = await etatVolume(page);
    details[`lot3_${L}_${n}_ensemble`] = ens;
    const t = await mesurer(page, '.ciel-titres-nebuleuses .ciel-nom-amas', '#ciel-scene');
    verdicts[`lot3_${L}_${n}_ensemble`] = vueEnsembleSaine(ens, n) && ens.titres === 9 &&
      t.visibles === 9 && t.chevauchements === 0 && t.dehors === 0;
    await page.locator('.ciel-nom-amas[data-nebuleuse="neb-btp"]').click();
    await page.waitForTimeout(300);
    await attendreImmobile(page);
    const app = await etatApproche(page);
    details[`lot3_${L}_${n}_approche`] = app;
    verdicts[`lot3_${L}_${n}_approche`] = approcheSaine(app, 'neb-btp');
    verdicts[`lot3_${L}_${n}_zeroErreur`] = erreurs.length === 0;
    await page.close();
  }
}

// 6 bis. Les cas limites : une seule fiche, donc une seule nébuleuse et une
// seule étoile — le moteur ne doit ni se taire ni planter.
{
  const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(e.message));
  await DEMO(page);
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?vue=volume&n=1`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1500);
  const ens = await etatVolume(page);
  await page.locator('.ciel-nom-amas[role="button"]').first().click();
  await page.waitForTimeout(1500);
  const app = await etatApproche(page);
  details.lot3_uneFiche = { ens, app };
  verdicts.lot3_uneFicheUneNebuleuse = vueEnsembleSaine(ens, 1) && ens.titres === 1 && app.approchee !== null && app.noms === 1 && erreurs.length === 0;
  await page.close();
}

// 6 quater. Relecture du 30/09 — l'écran étroit, la rotation, la dérive.
{
  // ① 320 px : les titres tiennent (la taille CSS écrasait celle du moteur),
  // et le titre de la nébuleuse approchée est réellement peint à 13 px.
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await DEMO(page);
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?vue=volume&n=54`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1500);
  await attendreImmobile(page);
  const t320 = await mesurer(page, '.ciel-titres-nebuleuses .ciel-nom-amas', '#ciel-scene');
  const e320 = await etatVolume(page);
  await page.locator('.ciel-nom-amas[data-nebuleuse="neb-btp"]').click();
  await page.waitForTimeout(300);
  await attendreImmobile(page);
  const police = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.ciel-nom-amas[data-nebuleuse="neb-btp"]')).fontSize));
  details.lot3_320 = { titres: t320, ensemble: e320, police };
  verdicts.lot3_320_titresTiennent = t320.visibles === 9 && t320.chevauchements === 0 && t320.dehors === 0 && vueEnsembleSaine(e320, 54);
  verdicts.lot3_320_titreApprochePeintA13 = Math.abs(police - 13) < 0.5;
  await page.close();
}
{
  // ② Le téléphone tourne : la grille se recompose (figée, elle laissait les
  // amas sur 12 % de la largeur et quatre titres l'un sur l'autre).
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await DEMO(page);
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?vue=volume&n=54`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);
  await attendreImmobile(page);
  const t = await mesurer(page, '.ciel-titres-nebuleuses .ciel-nom-amas', '#ciel-scene');
  const e = await etatVolume(page);
  const largeur = await page.evaluate(() => {
    const sr = document.querySelector('#ciel-scene').getBoundingClientRect();
    const xs = [...document.querySelectorAll('#ciel-scene g.ciel-etoile[data-noeud-id] > circle[fill="#ffffff"]')].map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2; });
    return +((Math.max(...xs) - Math.min(...xs)) / sr.width).toFixed(2);
  });
  details.lot3_rotation = { titres: t, ensemble: e, largeur };
  verdicts.lot3_rotationRecomposeLaGrille = t.visibles === 9 && t.chevauchements === 0 && t.dehors === 0 &&
    e.touches === 0 && e.horsDeSaBrume === 0 && largeur >= 0.5;
  await page.close();
}
{
  // ③ La dérive balance, elle ne tourne pas sans fin : 100 s d'animation
  // jouées sur une horloge simulée — une rotation continue y ferait plus
  // d'un tour ; le balancement reste à ± 0,3 rad de l'ouverture.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await DEMO(page);
  await page.addInitScript(() => { try { localStorage.setItem('ultima-ciel-vue', 'volume'); } catch (e) {} });
  await page.clock.install();
  await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
  await page.clock.runFor(2000);
  await page.locator('#ciel-derive').check();
  const lacets = [];
  for (let i = 0; i < 10; i++) {
    await page.clock.runFor(10000);
    lacets.push(await page.evaluate(() => window.UltimaCiel.courant().orientation().yaw));
  }
  details.lot3_derive = lacets.map((y) => +y.toFixed(3));
  const bouge = Math.max(...lacets) - Math.min(...lacets) > 0.05; // verrou : la dérive tourne vraiment
  verdicts.lot3_deriveBalanceSansFin = bouge && lacets.every((y) => Math.abs(y - 0.6) <= 0.32);
  await context.close();
}

// 6 ter. Les sabotages : on casse le moteur, l'instrument doit le voir.
// Le moteur servi à la maquette est réécrit à la volée — le code du dépôt,
// lui, n'est pas touché.
async function avecMoteurSabote(remplacer, faire) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await DEMO(page);
  await page.route('**/js/ciel.js', async (route) => {
    const r = await route.fetch();
    const texte = await r.text();
    const sabote = remplacer(texte);
    await route.fulfill({ response: r, body: sabote, headers: { ...r.headers(), 'content-type': 'application/javascript' } });
    page.__sabotageApplique = sabote !== texte;
  });
  await page.goto(`${BASE}/design/preview-riven-nebuleuses.html?vue=volume&n=54`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2200);
  const res = await faire(page);
  const applique = page.__sabotageApplique === true;
  await page.close();
  return { applique, ...res };
}
{
  // ① Les noms permanents rallumés : la vue d'ensemble doit en voir.
  const s1 = await avecMoteurSabote(
    (t) => t.replace('    if (modeNebuleuses) {\n      // Lot 3 — « je ne veux que les noms des nébuleuses »', '    if (false) {\n      //'),
    async (page) => ({ ens: await etatVolume(page) }));
  details.lot3_sabotageNoms = s1;
  verdicts.lot3_sabotage_lInstrumentVoitLesNomsPermanents = s1.applique && s1.ens.nomsVisibles > 0;
  // ② Les amas resserrés sur la grille : brumes et titres doivent se toucher.
  const s2 = await avecMoteurSabote(
    (t) => t.replace('var pasY = rMax * PAS_NEBULEUSES;', 'var pasY = rMax * 0.9;'),
    async (page) => ({ ens: await etatVolume(page), titres: await mesurer(page, '.ciel-titres-nebuleuses .ciel-nom-amas', '#ciel-scene') }));
  details.lot3_sabotageGrille = s2;
  verdicts.lot3_sabotage_lInstrumentVoitLesBrumesQuiSeTouchent = s2.applique && s2.ens.touches > 0;
  // ③ L'évitement des noms de la nébuleuse approchée coupé : noms croisés.
  const s3 = await avecMoteurSabote(
    (t) => t.replace('if (approchee) { eviterNomsApproches(projetes); }', ''),
    async (page) => {
      await page.locator('.ciel-nom-amas[data-nebuleuse="neb-btp"]').click();
      await page.waitForTimeout(2200);
      return { app: await etatApproche(page) };
    });
  details.lot3_sabotageEvitement = s3;
  verdicts.lot3_sabotage_lInstrumentVoitLesNomsCroises = s3.applique && (s3.app.chevauchements > 0 || s3.app.surUnCoeur > 0);
}

await browser.close();
console.log(JSON.stringify({ verdicts, details }, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE RIVEN-NEBULEUSES VERT' : 'SMOKE RIVEN-NEBULEUSES ROUGE');
process.exit(ok ? 0 : 1);
