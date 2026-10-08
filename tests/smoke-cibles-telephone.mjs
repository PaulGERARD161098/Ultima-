// AU TÉLÉPHONE, LE CIEL RESPIRE EN PROFONDEUR ET CHAQUE ÉTOILE SE TOUCHE (27/09).
//
// Paul : « diagnostic puis go la suite », sur ce constat du lot 2b : les étoiles
// des coques se touchaient à 25 px au téléphone. Le diagnostic a trouvé plus
// grave, en amont. À la hauteur RÉELLE de Safari (390 × 664), session ouverte et
// dock de Léo monté, l'écran RENOBOOST IA isolé ne laissait au ciel que 205 px :
// six dépôts serrés sur une ellipse, deux voisins à 29 px. Des cibles de 44 px
// s'y seraient recouvertes. La place était prise en haut par l'accueil
// (« Bienvenue / Sur quoi est-ce qu'on travaille aujourd'hui ? », ~140 px), que
// le fil d'Ariane rend redondant dès qu'on est descendu d'un cran.
//
// Ce harnais tient les deux correctifs, sur l'écran le plus dense du produit :
//   (A) au téléphone, sous isolement, l'accueil se replie — le titre reste
//       lisible au lecteur d'écran (masqué visuellement, pas retiré) ;
//   (B) chaque étoile vise une cible de 44 px, bornée par la moitié de la
//       distance à sa voisine : AUCUNE zone n'en recouvre une autre.
//
// ⛔ VU ROUGE SUR LE CODE D'AVANT. Verrous de non-vacuité : dock monté, six
// étoiles sur RENOBOOST IA, au moins deux ailleurs.
//
// ⚠️ LE DOCK EST MONTÉ PAR LE HARNAIS, comme dans `smoke-socle` : il exige une
// vraie session Supabase, que le bac à sable n'a pas.
// ⚠️ PÉRIMÈTRE : les coques (`#ciel-noeud-scene`). RIVEN ne change pas.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

const BASE = process.env.BASE_ULTIMA || 'http://127.0.0.1:8123';
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

// Six dépôts sous RENOBOOST IA, noms de la longueur des vrais — la fixture de
// `smoke-socle`, contenu inventé.
const NOMS = ['Projet Agenda', 'Projet Devis', 'Projet Predict', 'Projet Boost', 'Projet Console-web'];
const agregat = JSON.parse(JSON.stringify(AGREGAT));
agregat.projets = NOMS.map((nom, i) => {
  const p = JSON.parse(JSON.stringify(AGREGAT.projets[i % 4]));
  p.depot = 'exemple/' + i; p.ciel = 'renoboost-ia';
  p.grain = Object.assign({}, p.grain, { projet: nom, depot: 'exemple/' + i });
  return p;
}).concat([AGREGAT.projets[4]]);

async function ouvrir([largeur, hauteur]) {
  const telephone = largeur < 700;
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, isMobile: telephone, hasTouch: telephone });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${largeur} console: ${m.text()}`); } });
  // Ordre voulu : Playwright essaie la DERNIÈRE route enregistrée d'abord.
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: agregat }) }));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await page.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
  });
  await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const m = await import('/js/leo-navigation.mjs');
    const b = document.createElement('button');
    document.body.appendChild(b);
    m.monterNavigationLeo({ bouton: b });
  });
  await page.waitForTimeout(1500);
  return { page, contexte };
}

async function isoler(page, id) {
  await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"] .ciel-zone`).click({ force: true });
  await page.waitForTimeout(2200);
  await page.mouse.move(1, 1);
  await page.waitForTimeout(700);
}

function mesurer(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      if (!el) { return null; }
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) { return null; }
      const r = el.getBoundingClientRect();
      return r.height > 1 && r.width > 1 ? r : null;
    };
    const haut = ['body.ciel-noeud .console-entete', '.ciel-fil'].map((s) => visible(document.querySelector(s))).filter(Boolean);
    const bas = [document.getElementById('boussole-parole'), document.getElementById('leo-dock'), document.getElementById('finubar-bandeau')]
      .map(visible).filter(Boolean);
    const etoiles = [...document.querySelectorAll('#ciel-noeud-scene g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none')
      .map((g) => { const z = g.querySelector('.ciel-zone').getBoundingClientRect(); return { x: z.left + z.width / 2, y: z.top + z.height / 2, d: Math.min(z.width, z.height) }; });
    let recouvrements = 0, dmin = Infinity;
    for (let i = 0; i < etoiles.length; i++) {
      for (let j = i + 1; j < etoiles.length; j++) {
        const d = Math.hypot(etoiles[i].x - etoiles[j].x, etoiles[i].y - etoiles[j].y);
        dmin = Math.min(dmin, d);
        // Tolérance d'un demi-pixel : deux disques TANGENTS ne se recouvrent pas.
        if (d < (etoiles[i].d + etoiles[j].d) / 2 - 0.5) { recouvrements += 1; }
      }
    }
    // LES NOMS PEINTS (même règle que la maquette : tout nom à plus de 0,05).
    const noms = [...document.querySelectorAll('#ciel-noeud-scene g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none')
      .map((g) => g.querySelector('.ciel-nom'))
      .filter((n) => n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05)
      .map((n) => n.getBoundingClientRect());
    let nomsCroises = 0;
    for (let i = 0; i < noms.length; i++) {
      for (let j = i + 1; j < noms.length; j++) {
        const a = noms[i], b = noms[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) { nomsCroises += 1; }
      }
    }
    const titre = document.querySelector('body.ciel-noeud .console-titre');
    const invite = document.querySelector('body.ciel-noeud .console-invite');
    const rt = titre ? titre.getBoundingClientRect() : null;
    return {
      ciel: Math.round((bas.length ? Math.min(...bas.map((r) => r.top)) : innerHeight) - (haut.length ? Math.max(...haut.map((r) => r.bottom)) : 0)),
      dock: !!visible(document.getElementById('leo-dock')),
      fil: !!visible(document.querySelector('.ciel-fil')),
      etoiles: etoiles.length,
      cibleMin: etoiles.length ? Math.min(...etoiles.map((e) => e.d)) : 0,
      dmin: isFinite(dmin) ? dmin : 0,
      recouvrements,
      noms: noms.length, nomsCroises,
      // Le titre : VISIBLE à l'œil (boîte > 2 px) ou seulement au lecteur
      // d'écran (présent, texte non vide, boîte réduite à un point).
      titreVu: !!rt && rt.height > 2 && rt.width > 2,
      titreLu: !!titre && getComputedStyle(titre).display !== 'none' && titre.textContent.trim().length > 0,
      inviteVue: !!visible(invite),
    };
  });
}

// ⚠️ 320 ET 300 PX NE SONT PAS UN LUXE : c'est là seulement que deux voisins
// passent sous 44 px, donc là seulement que la BORNE par la demi-distance
// s'exerce. Au-dessus, une cible de 44 px ne rencontre jamais sa voisine, et
// « aucun recouvrement » serait vert que la borne existe ou non. Sur ces deux
// tailles, on exige la plus grande cible qui ne recouvre rien : min(44, voisin).
// ⚠️ 300 × 560 AJOUTÉ LE 08/10/2026 : la parole ne réserve plus de place au
// bas du ciel (Léo seul en bas), le ciel a grandi, et à 300 × 640 les voisins
// les plus proches passaient à 52 px — le verrou de la borne ne pouvait plus
// rougir. Le cas dense se cherche donc un cran plus bas ; il porte le verrou.
const TAILLES = [[375, 667], [390, 664], [360, 740], [390, 844], [320, 568], [300, 640], [300, 560], [1280, 800]];
for (const taille of TAILLES) {
  const { page, contexte } = await ouvrir(taille);
  const telephone = taille[0] < 700;
  for (const ecran of ['racine', 'alpha', 'renoboost-ia']) {
    if (ecran !== 'racine') { await isoler(page, ecran); }
    const cle = `${ecran}@${taille[0]}×${taille[1]}`;
    const m = await mesurer(page);
    chiffres[cle] = { ciel: m.ciel, etoiles: m.etoiles, cible: Math.round(m.cibleMin), dmin: Math.round(m.dmin), rec: m.recouvrements };
    verifier(`${cle} : verrou — dock monté et au moins deux étoiles`, m.dock && m.etoiles >= 2, `dock ${m.dock} · ${m.etoiles} étoiles`);
    if (taille[0] === 300 && taille[1] === 560 && ecran === 'renoboost-ia') {
      // LE VERROU DE LA BORNE : elle ne s'éprouve que si deux voisins sont
      // sous 44 px. Sans ce cas, le contrôle de recouvrement ne peut pas rougir.
      verifier(`${cle} : verrou — des voisins sous 44 px (la borne s'exerce)`, m.dmin < 44, `${Math.round(m.dmin)} px`);
    }
    if (ecran === 'renoboost-ia') {
      verifier(`${cle} : verrou — l'écran le plus dense (six dépôts)`, m.etoiles >= 6, `${m.etoiles}`);
    }
    // (B) Aucune zone n'en recouvre une autre — sur TOUS les écrans, toutes tailles.
    verifier(`${cle} : aucune cible n'en recouvre une autre`, m.etoiles >= 2 && m.recouvrements === 0, `${m.recouvrements} (voisins à ${Math.round(m.dmin)} px)`);
    // (B) 44 px au doigt. Au bureau, le pointeur est précis : le plancher du
    // moteur (24 px, WCAG 2.5.8) suffit et ne change pas.
    const exigeant = telephone && taille[0] >= 360;
    // LES NOMS NE SE CROISENT PAS. Avant ce lot, PROJET PREDICT et PROJET
    // AGENDA se chevauchaient sur cet écran à 390 × 664 — et aucun harnais ne
    // le voyait : `smoke-noms-lisibles` ne monte pas la session à cette hauteur.
    if (exigeant || !telephone) {
      verifier(`${cle} : verrou — au moins deux noms peints`, m.noms >= 2, `${m.noms}`);
      verifier(`${cle} : aucun nom n'en croise un autre`, m.noms >= 2 && m.nomsCroises === 0, `${m.nomsCroises}`);
    }
    // Sous 360 px, l'écran le plus dense n'a pas la place de 44 px ni même de
    // 24 : chaque étoile y reçoit TOUTE la demi-distance à sa voisine — la plus
    // grande cible qui ne vole rien à personne. Limite consignée, pas masquée.
    const vise = !telephone ? 24 : (exigeant ? 44 : Math.min(44, m.dmin));
    verifier(`${cle} : chaque étoile se touche (≥ ${vise.toFixed(0)} px)`, m.etoiles >= 2 && m.cibleMin >= vise - 0.5, `${m.cibleMin.toFixed(1)} px`);
    if (telephone && ecran !== 'racine') {
      // (A) L'accueil se replie sous isolement : le fil dit où l'on est.
      verifier(`${cle} : verrou — le fil est affiché`, m.fil);
      verifier(`${cle} : l'accueil est replié (ni titre ni invite à l'œil)`, m.fil && !m.titreVu && !m.inviteVue,
        `titre ${m.titreVu ? 'vu' : 'replié'} · invite ${m.inviteVue ? 'vue' : 'repliée'}`);
      verifier(`${cle} : le titre reste lu par le lecteur d'écran`, m.titreLu);
      // ⛔ PREMIER JET : « le ciel a au moins 300 px » — un seuil INVENTÉ, qui a
      // rougi à 296 sur un écran sain. La valeur attendue se DÉRIVE : pour que
      // deux cibles pleines de 44 px ne se recouvrent pas, deux voisins doivent
      // être à 44 px au moins. C'est la place que l'accueil replié doit rendre.
      if (exigeant) {
        verifier(`${cle} : les voisins sont à ≥ 44 px (des cibles pleines tiennent)`, m.etoiles >= 2 && m.dmin >= 44,
          `${Math.round(m.dmin)} px · ciel ${m.ciel} px`);
      }
    }
    if (ecran === 'racine') {
      // À la racine, l'accueil EST le propos de l'écran : il ne se replie jamais.
      verifier(`${cle} : à la racine, l'accueil reste affiché`, m.titreVu && m.inviteVue);
    }
    if (!telephone && ecran !== 'racine') {
      verifier(`${cle} : au bureau, l'accueil ne bouge pas`, m.titreVu && m.inviteVue);
    }
  }
  await contexte.close();
}

// ---- CE QUE LE DOIGT ATTEINT (dry run DR du 27/09) ----
// Une zone mesurée n'est pas une zone touchée : on demande au navigateur ce
// qu'il y a SOUS le doigt. ⛔ C'est ce contrôle qui a trouvé que les TRAITS de
// la figure (lot 2b) prenaient le doigt : 5 touchers sur 12 perdus à 390 × 664
// (le contrôle DÉTERMINISTE de ce défaut vit dans `smoke-carte-celeste`).
// Pour chaque étoile de l'écran le plus dense, deux points au bord de sa
// cible : à l'OPPOSÉ de sa voisine et VERS elle. Les deux doivent répondre :
// cette étoile-là.
for (const taille of [[390, 664], [320, 568]]) {
  const { page, contexte } = await ouvrir(taille);
  await isoler(page, 'alpha');
  await isoler(page, 'renoboost-ia');
  const r = await page.evaluate(() => {
    const et = [...document.querySelectorAll('#ciel-noeud-scene g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none')
      .map((g) => { const z = g.querySelector('.ciel-zone').getBoundingClientRect(); return { id: g.dataset.noeudId, x: z.left + z.width / 2, y: z.top + z.height / 2 }; });
    const sous = (x, y) => { const el = document.elementFromPoint(x, y); const g = el && el.closest('g.ciel-etoile[data-noeud-id]'); return g ? g.dataset.noeudId : null; };
    let points = 0, justes = 0; const fautes = [];
    for (const a of et) {
      let v = null, d = Infinity;
      for (const b of et) { if (b !== a) { const k = Math.hypot(a.x - b.x, a.y - b.y); if (k < d) { d = k; v = b; } } }
      if (!v) { continue; }
      const ux = (v.x - a.x) / d, uy = (v.y - a.y) / d;
      // ⚠️ PREMIER JET : le point « vers la voisine » était à 45 % du chemin
      // SANS borne — à 60 px de la voisine, 27 px du centre, hors d'une cible
      // de 44 px : le ciel vide y répondait, à raison. Les deux points restent
      // donc DANS la cible (21 px) et DANS la borne (45 % du chemin).
      const k = Math.min(21, d * 0.45);
      const essais = [[a.x - ux * k, a.y - uy * k], [a.x + ux * k, a.y + uy * k]];
      for (const [x, y] of essais) {
        points += 1;
        const id = sous(x, y);
        if (id === a.id) { justes += 1; } else { fautes.push(`${a.id}→${id}`); }
      }
    }
    return { points, justes, fautes };
  });
  await contexte.close();
  const cle = `doigt ${taille[0]}×${taille[1]}`;
  verifier(`${cle} : verrou — douze points essayés (six étoiles)`, r.points >= 12, `${r.points}`);
  verifier(`${cle} : chaque toucher atteint l'étoile la plus proche`, r.points >= 12 && r.justes === r.points,
    `${r.justes}/${r.points}${r.fautes.length ? ' · ' + r.fautes.slice(0, 3).join(', ') : ''}`);
}

// ---- LA CONVERSION SE RELIT AU REDIMENSIONNEMENT ----
// La cible est mise en cache en unités ; ouverte à 390 puis rétrécie à 300 px,
// où l'échelle écran tombe sous 1, elle doit se reconvertir — sinon elle
// garderait les unités de l'écran d'ouverture (~41 px au lieu de 44).
{
  const { page, contexte } = await ouvrir([390, 844]);
  await page.setViewportSize({ width: 300, height: 640 });
  await page.waitForTimeout(2200);
  const m = await mesurer(page);
  await contexte.close();
  verifier('Rétréci de 390 à 300 px (racine) : cibles à 44 px, sans recouvrement',
    m.etoiles >= 2 && m.cibleMin >= 43.5 && m.recouvrements === 0, `${m.cibleMin.toFixed(1)} px · ${m.recouvrements}`);
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE CIBLES-TELEPHONE VERT ===' : '\n=== SMOKE CIBLES-TELEPHONE ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
