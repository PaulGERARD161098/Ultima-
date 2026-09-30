// Harnais — RIVEN en nébuleuses (CADRAGE-RIVEN-NEBULEUSES.md, lots 1 et 2).
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

await browser.close();
console.log(JSON.stringify({ verdicts, details }, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE RIVEN-NEBULEUSES VERT' : 'SMOKE RIVEN-NEBULEUSES ROUGE');
process.exit(ok ? 0 : 1);
