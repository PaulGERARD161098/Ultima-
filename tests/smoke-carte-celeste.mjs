// LA CARTE CÉLESTE EST ALLUMÉE — lot 2b de CADRAGE-2026-09-25-carte-celeste.md (§18.3).
//
// A8 rendu par Paul le 26/09 : V1 — la couronne reste, et chaque constellation
// porte sa FIGURE (un arbre de n − 1 traits, `asterisme`) et son RANG (une tête,
// qui contient quelque chose, plus vive qu'une feuille, `eclatParPoids`).
// Le moteur et la maquette existaient depuis le lot 2 ; ce harnais prouve que
// la PRODUCTION les porte, sur les écrans de navigation réels.
//
// Ce qu'il mesure, écran par écran, au téléphone et au bureau :
//   · les traits : n − (nombre de constellations), aucun vers une étoile absente,
//     au moins un visible, AUCUN qui traverse un nom ;
//   · l'encre : parchemin `#cdc3ad`, jamais l'or de l'appel ; muets au lecteur
//     d'écran (`aria-hidden`) — un trait n'a rien à dire ;
//   · le rang : la plus petite tête plus grande que la plus grosse feuille,
//     là où l'écran a deux rangs ;
//   · l'extinction : quand le ciel s'efface autour d'un choix, la figure
//     s'efface avec lui — sinon des traits pendraient vers des étoiles éteintes ;
//   · `reduced-motion` : rien de ce que le lot ajoute ne bouge.
//
// ⛔ VU ROUGE SUR LA TÊTE D'AVANT (options inactives). Chaque recherche
// d'absence (« aucun trait vers une étoile absente », « aucun trait à travers
// un nom ») est précédée de son verrou : au moins deux étoiles et un trait.
//
// ⚠️ PÉRIMÈTRE, nommément : les coques de navigation (`#ciel-noeud-scene`).
// RIVEN n'active rien — son témoin reste `smoke-ciel`, inchangé.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

const BASE = 'http://127.0.0.1:8123';
const ENCRE = '#cdc3ad';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

// `deuxRangs` : ce que le registre dit de l'écran (§14.2, « Ce que le rang
// change vraiment ») — ULTIMA et NAGA n'ont que des têtes, le rang n'y change
// rien, et exiger qu'il s'y voie serait exiger l'impossible.
const ECRANS = [
  { nom: 'racine', page: 'index.html', porte: true, deuxRangs: true },
  { nom: 'ULTIMA', fil: 'ULTIMA', page: 'ultima.html', deuxRangs: false },
  { nom: 'NAGA', fil: 'NAGA', page: 'ultima.html#naga', deuxRangs: false },
  { nom: 'GRIMA', fil: 'GRIMA', page: 'ultima.html#grima', deuxRangs: true },
  // TAO : les Gémeaux, deux feuilles. C'est là que le premier jet du lot a
  // CÉDÉ — `smoke-tao` l'a vu, pas ce harnais (voir « la cible du doigt »).
  { nom: 'TAO', fil: 'LA VOIE', page: 'tao.html', deuxRangs: false },
  // ⚠️ SANS SESSION, ALPHA n'a qu'UN rang : RENOBOOST IA ne contient ses dépôts
  // qu'après la greffe Finubar. Son rang se prouve plus bas, session ouverte.
  { nom: 'ALPHA', fil: 'ALPHA', page: 'alpha.html', deuxRangs: false },
];
const TAILLES = [[390, 844], [1280, 800]];

async function ouvrir(ecran, [largeur, hauteur], options = {}) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, ...options });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${ecran.nom}@${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${ecran.nom}@${largeur} console: ${m.text()}`); } });
  // Agrégat Finubar et cockpit vides : ce harnais ne juge ni l'un ni l'autre.
  // ⚠️ La route générique d'ABORD : Playwright essaie la dernière posée en premier.
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-26', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await page.goto(`${BASE}/${ecran.page}`, { waitUntil: 'load', timeout: 20000 });
  if (ecran.porte) {
    await page.evaluate(() => {
      const el = document.getElementById('ecran-connexion');
      if (el) { el.hidden = true; el.style.display = 'none'; }
      document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
    });
  }
  // La caméra doit être POSÉE (§17 : mesurer à 0,9 s mentait).
  await page.waitForTimeout(2000);
  return { page, contexte };
}

function mesurer(page, tetesImposees = null) {
  return page.evaluate(async (tetesImposees) => {
    const { NOEUDS } = await import('/js/registre-lv3.mjs');
    const scene = document.getElementById('ciel-noeud-scene');
    const svg = scene && scene.querySelector('.ciel-svg');
    if (!svg) { return null; }
    const etoiles = [...svg.querySelectorAll('g.ciel-etoile[data-noeud-id]')];
    const ids = new Set(etoiles.map((g) => g.dataset.noeudId));
    const groupe = svg.querySelector('.ciel-asterisme');
    const lignes = groupe ? [...groupe.querySelectorAll('line')] : [];
    const visibles = lignes.filter((l) => l.getAttribute('display') !== 'none');
    const orphelins = lignes.filter((l) => !ids.has(l.dataset.a) || !ids.has(l.dataset.b)).length;
    const amas = [...svg.querySelectorAll('text.ciel-nom-amas')];
    // TRAITS × NOMS : la mesure de la maquette (§17), sur les noms PEINTS.
    const noms = etoiles.map((g) => g.querySelector('.ciel-nom'))
      .filter((n) => n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05)
      .map((n) => n.getBoundingClientRect());
    let traitsNoms = 0;
    for (const l of visibles) {
      const m = l.getScreenCTM(); const pt = svg.createSVGPoint();
      const P = (x, y) => { pt.x = x; pt.y = y; return pt.matrixTransform(m); };
      const a = P(+l.getAttribute('x1'), +l.getAttribute('y1')), c = P(+l.getAttribute('x2'), +l.getAttribute('y2'));
      for (const n of noms) {
        let dedans = false;
        for (let s = 0.02; s < 0.98 && !dedans; s += 0.01) {
          const x = a.x + (c.x - a.x) * s, y = a.y + (c.y - a.y) * s;
          dedans = x > n.left && x < n.right && y > n.top && y < n.bottom;
        }
        if (dedans) { traitsNoms += 1; }
      }
    }
    // LE RANG : lu dans le REGISTRE, comme le moteur (`rang()`), jamais deviné
    // de la taille qu'on veut mesurer.
    const rayons = etoiles.map((g) => ({
      r: +(g.querySelector('circle[fill="#ffffff"]') || {}).getAttribute?.('r') || 0,
      tete: tetesImposees ? tetesImposees.includes(g.dataset.noeudId)
        : !!((NOEUDS[g.dataset.noeudId] || {}).enfants || []).length,
    }));
    const tetes = rayons.filter((x) => x.tete).map((x) => x.r);
    const feuilles = rayons.filter((x) => !x.tete).map((x) => x.r);
    // LES NOMS DE CONSTELLATION (A9-3) : peints, et dans le cadre ?
    const cadre = svg.getBoundingClientRect();
    const amasLus = amas.filter((t) => {
      const b = t.getBoundingClientRect();
      const op = +getComputedStyle(t).opacity * +(t.getAttribute('opacity') || 1);
      return t.getAttribute('display') !== 'none' && b.width > 0 && op > 0.05
        && b.left >= cadre.left - 1 && b.right <= cadre.right + 1 && b.top >= cadre.top - 1 && b.bottom <= cadre.bottom + 1;
    }).map((t) => t.textContent);
    return {
      etoiles: etoiles.length, groupes: amas.length, traits: lignes.length, visibles: visibles.length,
      orphelins, traitsNoms,
      encre: groupe ? (groupe.getAttribute('stroke') || '').toLowerCase() : '',
      muet: groupe ? groupe.getAttribute('aria-hidden') : '',
      tetes: tetes.length, feuilles: feuilles.length,
      teteMin: tetes.length ? Math.min(...tetes) : 0, feuilleMax: feuilles.length ? Math.max(...feuilles) : 0,
      amasLus,
      // LA CIBLE DU DOIGT : la plus petite zone de captation, en px d'écran.
      cibleMin: Math.min(...etoiles.map((g) => { const z = g.querySelector('.ciel-zone'); const b = z && z.getBoundingClientRect(); return b ? Math.min(b.width, b.height) : 0; })),
      // Ce qui NOMME l'écran : le fil quand on est descendu d'un cran, le titre
      // de la page à sa racine (le fil n'y a rien à dire, il n'y a rien au-dessus).
      ici: (((document.querySelector('.ciel-fil-ici') || {}).textContent || '').trim()
        || ((document.querySelector('.console-titre .titre-principal') || {}).textContent || '').trim()),
    };
  }, tetesImposees);
}

function juger(cle, m, ecran) {
  verifier(`${cle} : verrou — au moins deux étoiles`, m.etoiles >= 2, `${m.etoiles}`);
  verifier(`${cle} : la figure existe (n − constellations traits)`,
    m.etoiles >= 2 && m.traits === m.etoiles - m.groupes && m.traits >= 1, `${m.traits} pour ${m.etoiles} étoiles, ${m.groupes} constellation(s)`);
  verifier(`${cle} : au moins un trait visible`, m.visibles >= 1, `${m.visibles}`);
  verifier(`${cle} : aucun trait vers une étoile absente`, m.traits >= 1 && m.orphelins === 0, `${m.orphelins}`);
  verifier(`${cle} : aucun trait à travers un nom`, m.visibles >= 1 && m.traitsNoms === 0, `${m.traitsNoms}`);
  verifier(`${cle} : encre parchemin, pas l'or`, m.encre === ENCRE, m.encre || 'aucun groupe');
  verifier(`${cle} : la figure est muette au lecteur d'écran`, m.muet === 'true', String(m.muet));
  // ⛔ LE RANG CHANGE L'ÉCLAT, JAMAIS LA CIBLE DU DOIGT. Premier jet : la zone
  // de captation suivait le rayon, donc une feuille rapetissée devenait plus
  // dure à toucher — TAO passé de 45 à 30 px au bureau. Trouvé par `smoke-tao`
  // dans le patrimoine, pas par ce harnais ; il le tient désormais ici.
  // Deux seuils, chacun lu à sa source, aucun inventé :
  //   · 24 px partout — le plancher que le moteur PROMET (`RAYON_CAPTATION_MIN`,
  //     WCAG 2.5.8). ⚠️ Mesuré sur le TÉMOIN d'avant le lot : 25 à 31 px sur
  //     presque tous les écrans. 44 px n'est donc PAS tenu aujourd'hui par les
  //     étoiles, et ce lot ne prétend pas le tenir (constat consigné au §25) ;
  //   · 44 px sur TAO au bureau — ce que `smoke-tao` exige, et ce que le témoin
  //     y mesurait (45).
  const plancher = ecran.nom === 'TAO' && cle.endsWith('@1280') ? 44 : 24;
  verifier(`${cle} : chaque étoile se touche du doigt (≥ ${plancher} px)`, m.etoiles >= 2 && m.cibleMin >= plancher, `${m.cibleMin.toFixed(0)} px`);
  if (ecran.deuxRangs) {
    verifier(`${cle} : verrou — l'écran a deux rangs`, m.tetes >= 1 && m.feuilles >= 1, `${m.tetes} tête(s), ${m.feuilles} feuille(s)`);
    // UN RANG QUI SE VOIT, pas un rang qui se mesure : l'écart doit dépasser
    // ce que la perspective et le nombre de liens donnaient déjà sans lui
    // (mesuré sur la tête d'avant : 2,25 contre 1,91 sur GRIMA — 18 %).
    verifier(`${cle} : le rang se voit (tête ≥ 1,3 × feuille)`, m.tetes >= 1 && m.feuilles >= 1 && m.teteMin >= 1.3 * m.feuilleMax,
      `${m.teteMin.toFixed(2)} contre ${m.feuilleMax.toFixed(2)}`);
  }
  // A9-3 (§18.3) — LA FIGURE EST NOMMÉE, PAR LE FIL OU LE TITRE, PAS PAR UN CARTOUCHE.
  // Mesuré avant de construire : sur un menu, le moteur tait les noms de
  // constellation (`amasMuet`, `js/ciel.js`) parce que le titre et le fil les
  // disent mieux. Ils nomment donc la figure ; un cartouche de plus serait un
  // troisième nom pour la même chose.
  verifier(`${cle} : aucun nom de constellation peint sur un menu`, m.amasLus.length === 0, m.amasLus.join(','));
  if (ecran.fil) {
    verifier(`${cle} : le fil ou le titre nomme la figure`, m.ici.toUpperCase() === ecran.fil, `« ${m.ici} »`);
  }
}

// ===========================================================================
for (const ecran of ECRANS) {
  for (const taille of TAILLES) {
    const cle = `${ecran.nom}@${taille[0]}`;
    const { page, contexte } = await ouvrir(ecran, taille);
    const m = await mesurer(page);
    if (!m) { await contexte.close(); verifier(`${cle} : la scène est peinte`, false, 'aucun .ciel-svg'); continue; }
    chiffres[cle] = { etoiles: m.etoiles, groupes: m.groupes, traits: `${m.visibles}/${m.traits}`,
      rang: m.tetes && m.feuilles ? `${m.teteMin.toFixed(2)}>${m.feuilleMax.toFixed(2)}` : '—', amas: m.amasLus };
    juger(cle, m, ecran);
    // L'EXTINCTION : l'état isolant éteint étoiles, liens et noms d'amas ; la
    // figure doit s'éteindre avec eux. Éprouvé sur la classe réelle, posée à la
    // main — l'état est transitoire (0,22 s) et un clic le raterait.
    if (taille[0] === 390) {
      const op = await page.evaluate(async () => {
        const scene = document.getElementById('ciel-noeud-scene');
        const g = scene.querySelector('.ciel-asterisme');
        if (!g) { return null; }
        scene.classList.add('ciel-scene--isolant');
        await new Promise((r) => setTimeout(r, 400));
        const o = +getComputedStyle(g).opacity;
        scene.classList.remove('ciel-scene--isolant');
        return o;
      });
      verifier(`${cle} : la figure s'éteint quand le ciel s'efface`, op === 0, String(op));
    }
    await contexte.close();
  }
}

// ---- ALPHA, SESSION OUVERTE : le seul écran où le rang dit quelque chose de neuf ----
// RENOBOOST IA ne devient une tête qu'une fois la greffe Finubar posée (ses
// dépôts). On ouvre donc la racine avec l'agrégat de la maquette (contenu
// inventé), on pose une session d'essai, puis on isole ALPHA — le parcours de
// `smoke-socle`. La tête est IMPOSÉE par la fixture, qu'un verrou vérifie.
{
  const sousRenoboost = AGREGAT.projets.filter((p) => p.ciel === 'renoboost-ia').length;
  verifier('ALPHA session : verrou — la fixture greffe des dépôts sous RENOBOOST IA', sousRenoboost >= 1, `${sousRenoboost}`);
  for (const taille of TAILLES) {
    const cle = `ALPHA session@${taille[0]}`;
    const ecran = { nom: 'ALPHA session', fil: 'ALPHA', deuxRangs: true };
    const contexte = await navigateur.newContext({ viewport: { width: taille[0], height: taille[1] } });
    const page = await contexte.newPage();
    page.on('pageerror', (e) => erreurs.push(`${cle} pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${cle} console: ${m.text()}`); } });
    await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
    await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
    await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: AGREGAT }) }));
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
    await page.evaluate(() => {
      const el = document.getElementById('ecran-connexion');
      if (el) { el.hidden = true; el.style.display = 'none'; }
      document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
    });
    await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
    await page.waitForTimeout(1200);
    await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"] .ciel-zone').click({ force: true });
    await page.waitForTimeout(2200);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(600);
    const m = await mesurer(page, ['renoboost-ia']);
    await contexte.close();
    if (!m) { verifier(`${cle} : la scène est peinte`, false, 'aucun .ciel-svg'); continue; }
    chiffres[cle] = { etoiles: m.etoiles, traits: `${m.visibles}/${m.traits}`,
      rang: `${m.teteMin.toFixed(2)}>${m.feuilleMax.toFixed(2)}`, ici: m.ici };
    juger(cle, m, ecran);
  }
}

// ---- REDUCED-MOTION : rien de ce que le lot ajoute ne bouge ----
// Deux relevés à 1,5 s d'écart des extrémités de chaque trait. Verrou : des
// traits existent, sinon « rien ne bouge » serait vrai de rien.
for (const ecran of [ECRANS[2], ECRANS[4]]) {
  const cle = `${ecran.nom} reduced-motion`;
  const { page, contexte } = await ouvrir(ecran, [390, 844], { reducedMotion: 'reduce' });
  const releve = () => page.evaluate(() => [...document.querySelectorAll('#ciel-noeud-scene .ciel-asterisme line')]
    .map((l) => ['x1', 'y1', 'x2', 'y2'].map((k) => l.getAttribute(k)).join(',')).join('|'));
  const avant = await releve();
  await page.waitForTimeout(1500);
  const apres = await releve();
  await contexte.close();
  verifier(`${cle} : verrou — des traits sont peints`, avant.length > 0, `${avant.split('|').filter(Boolean).length}`);
  verifier(`${cle} : aucun trait ne bouge`, avant.length > 0 && avant === apres);
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE CARTE-CELESTE VERT ===' : '\n=== SMOKE CARTE-CELESTE ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
