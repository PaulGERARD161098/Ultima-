// LES NÉBULEUSES D'IMLADRIK — boucle B d'IFULVIN (CADRAGE-IFULVIN.md §⑦).
//
// CE QUE CE HARNAIS EMPÊCHE, dans l'ordre du pre-mortem :
//   ① une nébuleuse ABSENTE qu'on croit là (option perdue, pigment inconnu) ;
//   ② deux nébuleuses de la MÊME couleur — elles ne distinguent plus rien ;
//   ③ une nébuleuse qui DÉBORDE sur un écran qui n'en a pas ;
//   ④ une nébuleuse qui ÉCRASE les noms (contraste sous 4,5:1) ;
//   ⑤ une nébuleuse qui GLISSE : peinte là où l'étoile était, pas où elle est.
//
// COMMENT IL MESURE, sans se fier à ce qu'il cherche :
//   - la COUCHE DE FOND est espionnée à la source (`UltimaCielFond.creer`,
//     intercepté avant tout script) : on lit les nébuleuses qu'elle REÇOIT, et
//     l'absence se constate sur une liste NON VIDE ailleurs (verrou de
//     non-vacuité : « rien ici » ne vaut que si « quelque chose là-bas ») ;
//   - la COULEUR se lit dans le canvas, pondérée par son alpha (un pixel
//     transparent a une couleur, et elle ne se voit pas) — et se compare à un
//     TÉMOIN : la même page, le catalogue des pigments vidé par interception ;
//   - le CONTRASTE se mesure au pixel sous les lettres : la page est peinte
//     deux fois, noms visibles puis noms transparents, et la différence donne
//     le masque des lettres (méthode de `smoke-fond-contraste`).
import { chromium } from 'playwright';

const PORT = process.env.ULTIMA_PORT || '8123';
const BASE = `http://127.0.0.1:${PORT}/`;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const verdicts = {};
const detail = {};
const erreurs = [];

// L'espion : chaque appel à `peindre` note les nébuleuses reçues.
function espion() {
  let reel;
  window.__nebuleusesVues = [];
  Object.defineProperty(window, 'UltimaCielFond', {
    configurable: true,
    get() { return reel; },
    set(v) {
      const creer = v.creer;
      v.creer = function (o) {
        const etat = creer.call(v, o);
        window.__fondEtat = etat;
        const peindre = etat.peindre;
        etat.peindre = function (projeter, opts) {
          window.__nebuleusesVues = ((opts && opts.nebuleuses) || []).map((n) => ({
            teinte: n.teinte, membres: n.membres.length
          }));
          return peindre.call(etat, projeter, opts);
        };
        return etat;
      };
      reel = v;
    }
  });
}

async function ouvrir(url, { temoin = false, largeur = 1280, hauteur = 860 } = {}) {
  const page = await browser.newPage({ viewport: { width: largeur, height: hauteur } });
  page.on('pageerror', (e) => erreurs.push(url + ': ' + e));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(url + ': ' + m.text()); });
  await page.addInitScript(espion);
  if (temoin) {
    // Le témoin : même page, pigments retirés du catalogue. Tout le reste —
    // étoiles, voiles, grains, caméra — est identique.
    await page.route('**/js/blasons.mjs', async (route) => {
      const r = await route.fetch();
      const src = (await r.text()).replace(/export const NEBULEUSES = \{[\s\S]*?\};/, 'export const NEBULEUSES = {};');
      await route.fulfill({ response: r, body: src });
    });
  }
  await page.goto(BASE + url, { waitUntil: 'load' });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 15000 });
  await page.waitForTimeout(900);
  return page;
}

// Couleur moyenne VUE autour d'une étoile, dans le canvas du fond : chaque
// canal pondéré par l'alpha du pixel. Anneau de 18 à 44 px CSS.
async function teinteAutour(page, id) {
  return page.evaluate((id) => {
    const c = document.querySelector('canvas');
    const g = document.querySelector(`g.ciel-etoile[data-noeud-id="${id}"] circle`);
    if (!c || !g) { return null; }
    const ctx = c.getContext('2d');
    const bc = c.getBoundingClientRect();
    const k = c.width / bc.width;
    const rr = g.getBoundingClientRect();
    const cx = (rr.left + rr.width / 2 - bc.left) * k;
    const cy = (rr.top + rr.height / 2 - bc.top) * k;
    const s = [0, 0, 0]; let n = 0;
    for (let dy = -44; dy <= 44; dy += 2) {
      for (let dx = -44; dx <= 44; dx += 2) {
        const d = Math.hypot(dx, dy);
        if (d < 18 || d > 44) { continue; }
        const px = ctx.getImageData(Math.round(cx + dx * k), Math.round(cy + dy * k), 1, 1).data;
        const a = px[3] / 255;
        s[0] += px[0] * a; s[1] += px[1] * a; s[2] += px[2] * a; n += 1;
      }
    }
    return s.map((v) => v / n);
  }, id);
}

// OÙ EST LE NUAGE ? Centre de gravité de l'EXCÈS de canal (page − témoin),
// dans un disque de 60 px CSS autour de l'étoile, rendu en px relatifs à
// l'étoile. Le cœur et le lobe principal sont centrés sur elle : un nuage
// ancré donne un décalage de quelques px ; un nuage figé ou décalé le tire.
async function lireCanal(page, id, canal) {
  return page.evaluate(({ id, canal }) => {
    const c = document.querySelector('canvas');
    const g = document.querySelector(`g.ciel-etoile[data-noeud-id="${id}"] circle`);
    if (!c || !g) { return null; }
    const ctx = c.getContext('2d'); const bc = c.getBoundingClientRect(); const k = c.width / bc.width;
    const rr = g.getBoundingClientRect();
    const cx = (rr.left + rr.width / 2 - bc.left) * k; const cy = (rr.top + rr.height / 2 - bc.top) * k;
    const R = 60; const pts = [];
    const img = ctx.getImageData(Math.round(cx - R * k), Math.round(cy - R * k), Math.round(2 * R * k), Math.round(2 * R * k)).data;
    const L = Math.round(2 * R * k);
    for (let dy = -R; dy <= R; dy += 2) {
      for (let dx = -R; dx <= R; dx += 2) {
        if (Math.hypot(dx, dy) > R) { continue; }
        const ix = Math.round((dx + R) * k); const iy = Math.round((dy + R) * k);
        if (ix >= L || iy >= L) { continue; }
        const i = (iy * L + ix) * 4;
        pts.push([dx, dy, img[i + canal] * img[i + 3] / 255]);
      }
    }
    return pts;
  }, { id, canal });
}
async function decalageDuNuage(page, temoinPage, id, canal) {
  const a = await lireCanal(page, id, canal); const t = await lireCanal(temoinPage, id, canal);
  if (!a || !t || a.length !== t.length) { return null; }
  let sx = 0; let sy = 0; let sw = 0;
  a.forEach((p, i) => { const w = Math.max(0, p[2] - t[i][2]); sx += p[0] * w; sy += p[1] * w; sw += w; });
  return sw > 0 ? { dx: sx / sw, dy: sy / sw, px: Math.hypot(sx / sw, sy / sw), poids: sw } : null;
}

// LA PHASE : pour chaque cœur de nébuleuse peint, l'écart en px CSS au centre
// de l'étoile SVG la plus proche (dans le repère du canvas).
async function ecartDesCoeurs(page) {
  return page.evaluate(() => {
    const etat = window.__fondEtat;
    if (!etat || typeof etat.nebuleusesPeintes !== 'function') { return null; }
    const c = document.querySelector('canvas').getBoundingClientRect();
    const etoiles = [...document.querySelectorAll('g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none')
      .map((g) => { const r = g.querySelector('circle').getBoundingClientRect(); return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top }; });
    const coeurs = etat.nebuleusesPeintes().flatMap((n) => n.coeurs);
    if (!coeurs.length || !etoiles.length) { return { nb: coeurs.length, pire: null }; }
    const ecarts = coeurs.map((k) => Math.min(...etoiles.map((e) => Math.hypot(e.x - k.px, e.y - k.py))));
    return { nb: coeurs.length, pire: Math.max(...ecarts) };
  });
}

// Le pire contraste des noms de l'écran, mesuré sous les lettres.
async function pireContraste(page) {
  const boites = await page.$$eval('text.ciel-nom', (ts) => ts
    .filter((t) => t.getBoundingClientRect().width > 4 && t.closest('g[display="none"]') === null)
    .map((t) => { const r = t.getBoundingClientRect(); return { nom: t.textContent, x: r.left, y: r.top, w: r.width, h: r.height }; }));
  if (!boites.length) { return { pire: null, nb: 0 }; }
  const avec = await page.screenshot({ type: 'png' });
  await page.addStyleTag({ content: 'text.ciel-nom{fill:transparent!important;stroke:transparent!important}' });
  await page.waitForTimeout(80);
  const sans = await page.screenshot({ type: 'png' });
  const r = await page.evaluate(async ({ a, b, boites }) => {
    const charger = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const [ia, ib] = await Promise.all([charger(a), charger(b)]);
    const lire = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const da = lire(ia); const db = lire(ib); const W = ia.width;
    const lum = (r, g, b2) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2); };
    return boites.map((bx) => {
      const coeurs = [];
      for (let y = Math.floor(bx.y); y < bx.y + bx.h; y++) {
        for (let x = Math.floor(bx.x); x < bx.x + bx.w; x++) {
          const i = (y * W + x) * 4;
          const diff = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
          if (diff < 60) { continue; }
          const l1 = lum(da[i], da[i + 1], da[i + 2]); const l2 = lum(db[i], db[i + 1], db[i + 2]);
          coeurs.push({ diff, ratio: (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) });
        }
      }
      // Les COEURS de lettre seulement : le tiers le plus contrasté du masque
      // (un bord lissé a une couleur que personne ne lit).
      coeurs.sort((p, q) => q.diff - p.diff);
      const garde = coeurs.slice(0, Math.max(1, Math.floor(coeurs.length / 3)));
      garde.sort((p, q) => p.ratio - q.ratio);
      return { nom: bx.nom, ratio: garde.length ? garde[Math.floor(garde.length / 2)].ratio : null, pixels: coeurs.length };
    });
  }, { a: 'data:image/png;base64,' + avec.toString('base64'), b: 'data:image/png;base64,' + sans.toString('base64'), boites });
  const mesures = r.filter((m) => m.ratio !== null && m.pixels >= 12);
  const pire = mesures.reduce((m, x) => (m === null || x.ratio < m.ratio ? x : m), null);
  return { pire, nb: mesures.length, tous: mesures };
}

const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

// LE SEUIL DES NOMS EST 5,0 ET NON 4,5 — une MARGE, pas un durcissement de la
// norme. Mesuré le 30/09 : la CI (polices plus fines) lit ~0,5 de moins que ce
// conteneur (ZEKROM 4,83 ici, 4,23 là-bas). Un seuil à 4,5 laissait passer en
// local ce qui rougissait en CI ; à 5,0, le vert local vaut vert partout.
const SEUIL_NOMS = 5.0;

// ---------------------------------------------------------------------------
// ① ② IMLADRIK : deux nébuleuses, deux couleurs, et un témoin qui n'en a pas.
// ---------------------------------------------------------------------------
{
  const page = await ouvrir('imladrik.html');
  const vues = await page.evaluate(() => window.__nebuleusesVues);
  detail.imladrikRecues = vues;
  verdicts.imladrikDeuxNebuleusesRecues = vues.length === 2 && vues.every((n) => n.membres === 1)
    && new Set(vues.map((n) => n.teinte)).size === 2;
  const armes = await teinteAutour(page, 'constellation-armes');
  const dragons = await teinteAutour(page, 'constellation-dragons');
  const temoinPage = await ouvrir('imladrik.html', { temoin: true });
  const vuesTemoin = await temoinPage.evaluate(() => window.__nebuleusesVues);
  const armesT = await teinteAutour(temoinPage, 'constellation-armes');
  const dragonsT = await teinteAutour(temoinPage, 'constellation-dragons');
  detail.teintes = { armes, dragons, armesTemoin: armesT, dragonsTemoin: dragonsT };
  verdicts.temoinSansNebuleuse = Array.isArray(vuesTemoin) && vuesTemoin.length === 0;
  verdicts.armesSeVoitContreLeTemoin = !!(armes && armesT) && dist(armes, armesT) >= 6;
  verdicts.dragonsSeVoitContreLeTemoin = !!(dragons && dragonsT) && dist(dragons, dragonsT) >= 6;
  // Le pigment : l'ARMES tire au rouge, le DRAGONS au vert — l'écart entre
  // les deux est la preuve qu'on n'a pas peint deux fois la même nébuleuse.
  verdicts.armesTireAuRouge = !!armes && (armes[0] - armesT[0]) > (armes[1] - armesT[1]);
  verdicts.dragonsTireAuVert = !!dragons && (dragons[1] - dragonsT[1]) > (dragons[0] - dragonsT[0]);
  // « Une étoile sans constellation n'est pas teintée plus que son témoin » —
  // `adramelechSansNebuleuse`, qui lisait ADRAMELECH au premier niveau d'IMLADRIK.
  // INVERSÉ (30/09) : ADRAMELECH n'est plus au premier niveau, il est UNE DES SIX
  // ÉTOILES DES DRAGONS — donc DANS la nébuleuse verte. La garantie a deux moitiés
  // qui survivent, chacune éprouvée là où elle peut encore mentir :
  //   · l'étoile est bien absente de ce ciel (verrou : sans elle, « teinte null »
  //     se lirait comme « pas teintée ») ;
  //   · chez les DRAGONS (plus bas, § isolement), ADRAMELECH SE VOIT contre le
  //     témoin ET tire au vert — la nébuleuse enveloppe toutes les étoiles de
  //     l'écran, pas seulement les trois d'hier.
  verdicts.adramelechAbsentDuPremierNiveau = (await teinteAutour(page, 'adramelech')) === null
    && (await page.locator('g.ciel-etoile[data-noeud-id="adramelech"]').count()) === 0
    && (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 2;
  const c = await pireContraste(page);
  detail.contrasteImladrik = c.tous;
  // TRANSPOSÉ : « au moins quatre noms » → EXACTEMENT deux (ARMES, DRAGONS), les
  // seules étoiles du premier niveau — le compte suit le registre, sans jeu.
  verdicts.imladrikNomsLisibles = c.nb === 2 && c.pire.ratio >= SEUIL_NOMS;
  await page.close(); await temoinPage.close();
}

// ---------------------------------------------------------------------------
// ① ④ LES DEUX ISOLEMENTS : la nébuleuse enveloppe les étoiles de l'écran.
// ---------------------------------------------------------------------------
// TRANSPOSÉ (30/09) : DRAGONS enveloppe SIX étoiles (les trois dragons, ADRAMELECH,
// RESHIRAM, ZEKROM), plus trois : la nébuleuse, elle, reste UNE, et TOUS les noms
// se lisent dessus (`nb === attendus` : le compte des noms mesurés est verrouillé).
// SEPT depuis le 04/10/2026 : ZOH SHIA rejoint les DRAGONS.
for (const [foyer, attendus] of [['constellation-dragons', 7], ['constellation-armes', 1]]) {
  for (const largeur of [390, 1280]) {
    const page = await ouvrir('imladrik.html#' + foyer, { largeur, hauteur: largeur === 390 ? 844 : 860 });
    const vues = await page.evaluate(() => window.__nebuleusesVues);
    verdicts[`isole_${foyer}_${largeur}_uneNebuleuseSurTout`] = vues.length === 1 && vues[0].membres === attendus;
    const c = await pireContraste(page);
    detail[`contraste_${foyer}_${largeur}`] = c.tous;
    verdicts[`isole_${foyer}_${largeur}_nomsLisibles`] = c.nb === attendus && c.pire.ratio >= SEUIL_NOMS;
    await page.close();
  }
}
// ADRAMELECH DANS LA NÉBULEUSE DES DRAGONS (inversion de `adramelechSansNebuleuse`,
// voir plus haut) : sur l'écran isolé, sa teinte se distingue du témoin (pigments
// retirés) et tire au VERT — comme celle des dragons d'origine, pas comme un
// hors-constellation. On lit aussi MAEDRETHNIR : l'étalon dont on connaît la réponse.
{
  const page = await ouvrir('imladrik.html#constellation-dragons');
  const temoinPage = await ouvrir('imladrik.html#constellation-dragons', { temoin: true });
  const lu = {};
  for (const id of ['adramelech', 'maedrethnir', 'reshiram', 'zekrom']) {
    lu[id] = { avec: await teinteAutour(page, id), sans: await teinteAutour(temoinPage, id) };
  }
  detail.teintesDragons = lu;
  const vuesT = await temoinPage.evaluate(() => window.__nebuleusesVues);
  verdicts.dragonsTemoinSansNebuleuse = Array.isArray(vuesT) && vuesT.length === 0;
  for (const id of Object.keys(lu)) {
    const { avec, sans } = lu[id];
    verdicts[`dragons_${id}_seVoitContreLeTemoin`] = !!(avec && sans) && dist(avec, sans) >= 6;
    verdicts[`dragons_${id}_tireAuVert`] = !!(avec && sans)
      && (avec[1] - sans[1]) > (avec[0] - sans[0]);
  }
  await page.close(); await temoinPage.close();
}

// ---------------------------------------------------------------------------
// ④ bis LES NOMS DES MENUS À 390 PX. Trouvé en mesurant ce harnais : à l'opacité
// 0,85, NICOL BOLAS (OMEGA) lisait 3,86:1 et ZEKROM (TAO) 3,72:1 — défaut
// antérieur aux nébuleuses. Corrigé dans le moteur (nom de menu à pleine
// opacité) ; ce contrôle empêche le retour.
// TRANSPOSÉ (30/09) : `tao.html` n'existe plus ; ZEKROM et RESHIRAM — les noms qui
// avaient fait rougir ce contrôle, et qui rougissent EN CI (polices plus fines :
// ZEKROM 4,23:1 contre 4,83 en local) — vivent sur `imladrik.html#constellation-
// dragons`, et c'est CET écran qui les remplace ici. ⚠️ Ce n'est plus « sans
// nébuleuse » : les DRAGONS ont la leur, et le nom se lit dessus — c'est une
// mesure plus dure que celle de TAO, pas plus douce. `c.nb >= 6` : les SIX noms
// sont mesurés (pas seulement deux), sinon un nom illisible pourrait se cacher
// parmi ceux qu'on n'a pas lus.
// ---------------------------------------------------------------------------
for (const [url, minNoms] of [['omega.html', 2], ['imladrik.html#constellation-dragons', 6]]) {
  const page = await ouvrir(url, { largeur: 390, hauteur: 844 });
  const c = await pireContraste(page);
  detail['contraste390_' + url] = c.tous;
  verdicts['nomsLisibles390_' + url] = c.nb >= minNoms && c.pire.ratio >= SEUIL_NOMS;
  await page.close();
}

// ---------------------------------------------------------------------------
// ③ AUCUN DÉBORDEMENT. Verrou de non-vacuité : l'espion A VU des nébuleuses
// sur IMLADRIK (ci-dessus) ; ici il doit voir une liste vide.
// ---------------------------------------------------------------------------
// (`tao.html` sort de la liste : la page n'existe plus, `ouvrir` y attendrait un
// plateau qui ne viendra jamais. `adramelech.html`, sa propre page, y reste : la
// nébuleuse des DRAGONS n'y déborde pas.)
for (const url of ['index.html', 'omega.html', 'alpha.html', 'adramelech.html', 'bcp.html']) {
  const page = await ouvrir(url);
  const vues = await page.evaluate(() => window.__nebuleusesVues);
  verdicts['aucuneNebuleuse_' + url] = Array.isArray(vues) && vues.length === 0
    && verdicts.imladrikDeuxNebuleusesRecues === true;
  await page.close();
}

// ---------------------------------------------------------------------------
// ⑤ ELLE SUIT SON ÉTOILE. On mesure OÙ est le nuage (centre de gravité de
// l'excès de rouge sur le témoin) par rapport à l'étoile, avant et après un
// passage du bureau au téléphone qui déplace l'étoile DANS le canvas.
// Deux premiers jets de ce contrôle n'ont pas mordu, et c'est à retenir :
//   1. attendre que la caméra dérive — un menu ne dérive pas
//      (`vue.derive(false)`) : déplacement 0 px, vu par le verrou ;
//   2. « du rouge autour de l'étoile » après redimensionnement, puis son
//      centre de gravité — le nuage (≈ 150 px de rayon) est plus large que le
//      déplacement (55 px dans le canvas) : le sabotage qui FIGEAIT le nuage
//      passait vert, décalage 3 px contre 1,6. D'où l'instrument exact : la
//      couche de fond dit où elle a peint chaque cœur (`nebuleusesPeintes`),
//      et l'écart à l'étoile SVG se lit au pixel, comme la phase des grains.
// ---------------------------------------------------------------------------
{
  const page = await ouvrir('imladrik.html');
  const temoinPage = await ouvrir('imladrik.html', { temoin: true });
  const loc = (p) => p.locator('g.ciel-etoile[data-noeud-id="constellation-armes"] circle').first();
  detail.decalageAvant = await decalageDuNuage(page, temoinPage, 'constellation-armes', 0);
  const phaseAvant = await ecartDesCoeurs(page);
  detail.phaseAvant = phaseAvant;
  verdicts.lesCoeursSontSurLesEtoilesAvant = !!phaseAvant && phaseAvant.nb === 2 && phaseAvant.pire !== null && phaseAvant.pire <= 1.5;
  const p0 = await loc(page).boundingBox();
  const c0 = await page.evaluate(() => {
    const c = document.querySelector('canvas').getBoundingClientRect();
    const r = document.querySelector('g.ciel-etoile[data-noeud-id="constellation-armes"] circle').getBoundingClientRect();
    return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
  });
  // Du bureau au téléphone : la couronne se recompose ENTIÈREMENT. Premier jet
  // à 900 px : l'étoile ne bougeait que de 50 px DANS le canvas, moins que le
  // rayon du nuage — un voile figé restait « autour » d'elle, et le sabotage
  // qui le figeait passait vert. Un contrôle qui ne mord pas n'est pas un
  // contrôle.
  for (const p of [page, temoinPage]) { await p.setViewportSize({ width: 390, height: 844 }); }
  await page.waitForTimeout(1200); await temoinPage.waitForTimeout(1200);
  const p1 = await loc(page).boundingBox();
  // Le déplacement qui compte est celui DANS le canvas (le canvas aussi a
  // changé de taille) : position relative au canvas, avant et après.
  const dansCanvas = (p) => p.evaluate(() => {
    const c = document.querySelector('canvas').getBoundingClientRect();
    const r = document.querySelector('g.ciel-etoile[data-noeud-id="constellation-armes"] circle').getBoundingClientRect();
    return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
  });
  const c1 = await dansCanvas(page);
  const avantResize = detail.decalageAvant;
  const apres = await decalageDuNuage(page, temoinPage, 'constellation-armes', 0);
  detail.deplacement = { page: p0 && p1 ? Math.hypot(p1.x - p0.x, p1.y - p0.y) : null, canvas: Math.hypot(c1.x - c0.x, c1.y - c0.y), avant: avantResize, apres };
  // Verrou : l'étoile a bougé DANS le canvas de plus que la tolérance — sans
  // quoi un nuage figé passerait pour ancré.
  verdicts.lEtoileABougeDansLeCanvas = detail.deplacement.canvas >= 30;
  verdicts.leNuageEstSurSonEtoileAvant = !!avantResize && avantResize.px <= 10;
  verdicts.leNuageSuitSonEtoileApres = !!apres && apres.px <= 10;
  // L'instrument EXACT : les cœurs peints sont sur les étoiles, à 1,5 px près,
  // après le passage au téléphone. Verrou : il y a bien des cœurs à comparer.
  const phase = await ecartDesCoeurs(page);
  detail.deplacement.phase = phase;
  verdicts.lesCoeursSontSurLesEtoilesApres = !!phase && phase.nb === 2 && phase.pire !== null && phase.pire <= 1.5;
  await page.close(); await temoinPage.close();
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(detail, null, 1));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE NÉBULEUSES VERT' : 'SMOKE NÉBULEUSES ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
