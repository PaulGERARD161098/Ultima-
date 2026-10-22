// LES DRAGONS PORTENT LEUR ÉPITHÈTE — Paul, 04/10/2026 : « Je veux que ne
// s'affiche comme titre pour les étoiles que ça : VRANESH - Dragon du futur… ».
//
// Ce que ce harnais prouve, sur l'écran réel `imladrik.html#constellation-dragons` :
//   ① chaque étoile porte DEUX lignes — le nom (`text.ciel-nom`, inchangé, que
//      vingt harnais lisent) et l'épithète (`text.ciel-epithete`), mot pour mot
//      celle du registre ;
//   ② la seconde ligne SUIT la première : même x, posée dessous ;
//   ③ rien ne se croise — ni deux lignes entre elles, ni une ligne et le cœur
//      d'une étoile — et rien ne sort du ciel, à 300, 390 et 1280 px ;
//   ④ l'épithète se LIT : jamais sous le plancher de 11 px, contraste ≥ 5,0 ;
//   ⑤ le cartouche de Léo dit l'épithète À LA PLACE de l'état (« Ouvert ») —
//      et, miroir, un cap sans épithète (IFULVIN) dit toujours son état.
//
// ⛔ Chaque recherche d'absence est précédée de son verrou de non-vacuité :
// huit épithètes mesurées (sept, puis AMATSU le 18/10/2026), sinon « aucun croisement » ne veut rien dire.
// ⚠️ ÉPROUVÉ EN LE CASSANT : interligne mise à 0 dans `js/ciel.js` → l'épithète
// recouvre son nom, ③ vire au rouge.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';
const PLANCHER_PX = 11;
const SEUIL = 5.0; // même marge que `smoke-nebuleuses` (la CI lit ~0,5 de moins)
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition !== true) { echecs += 1; }
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

const DRAGONS = NOEUDS['constellation-dragons'].enfants;
const ATTENDU = Object.fromEntries(DRAGONS.map((id) => [id, { nom: NOEUDS[id].nom, epithete: NOEUDS[id].epithete }]));

async function ouvrir(chemin, [largeur, hauteur]) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur } });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${chemin}@${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${chemin}@${largeur} console: ${m.text()}`); } });
  // Agrégats vides : ce harnais ne juge ni Finubar ni le cockpit.
  await page.route('**/api/finubar', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-10-04', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await page.route('**/api/cockpit', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }),
  }));
  await page.goto(`${BASE}/${chemin}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2200); // la caméra se pose
  return { page, contexte };
}

function mesurer(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#ciel-noeud-scene .ciel-svg');
    if (!svg) { return null; }
    const k = svg.getScreenCTM().a;
    const cadre = svg.getBoundingClientRect();
    const etoiles = [...svg.querySelectorAll('g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none');
    const lignes = [];
    const coeurs = [];
    const paires = etoiles.map((g) => {
      const nom = g.querySelector('text.ciel-nom');
      const epi = g.querySelector('text.ciel-epithete');
      const c = g.querySelector('circle[fill="#ffffff"]');
      if (c) { const r = c.getBoundingClientRect(); coeurs.push({ id: g.dataset.noeudId, ...r.toJSON() }); }
      const bn = nom ? nom.getBoundingClientRect().toJSON() : null;
      const be = epi ? epi.getBoundingClientRect().toJSON() : null;
      if (bn) { lignes.push({ id: g.dataset.noeudId, quoi: 'nom', ...bn }); }
      if (be) { lignes.push({ id: g.dataset.noeudId, quoi: 'epithete', ...be }); }
      return {
        id: g.dataset.noeudId,
        nom: nom ? nom.textContent : null,
        epithete: epi ? epi.textContent : null,
        xNom: nom ? +nom.getAttribute('x') : NaN,
        xEpi: epi ? +epi.getAttribute('x') : NaN,
        bn, be,
        pxEpi: epi ? (+epi.getAttribute('font-size') || 0) * k : 0,
        opEpi: epi ? +(epi.getAttribute('opacity') || '1') : 0,
        epiMuette: epi ? epi.getAttribute('aria-hidden') === 'true' : false,
        label: g.getAttribute('aria-label') || '',
      };
    });
    const croise = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    const croisements = [];
    for (let i = 0; i < lignes.length; i++) {
      for (let j = i + 1; j < lignes.length; j++) {
        if (croise(lignes[i], lignes[j])) { croisements.push(`${lignes[i].id}.${lignes[i].quoi}×${lignes[j].id}.${lignes[j].quoi}`); }
      }
      coeurs.forEach((c) => { if (croise(lignes[i], c)) { croisements.push(`${lignes[i].id}.${lignes[i].quoi}×cœur ${c.id}`); } });
    }
    const hors = lignes.filter((b) => b.left < cadre.left - 0.5 || b.right > cadre.right + 0.5
      || b.top < cadre.top - 0.5 || b.bottom > cadre.bottom + 0.5).map((b) => `${b.id}.${b.quoi}`);
    return { paires, croisements, hors, nbLignes: lignes.length };
  });
}

// Le contraste des épithètes, mesuré à l'œil : capture avec, puis sans le texte
// (même méthode que `smoke-nebuleuses`, sur `text.ciel-epithete`).
async function contrasteEpithetes(page) {
  const boites = await page.$$eval('text.ciel-epithete', (ts) => ts
    .filter((t) => t.getBoundingClientRect().width > 4)
    .map((t) => { const r = t.getBoundingClientRect(); return { nom: t.textContent, x: r.left, y: r.top, w: r.width, h: r.height }; }));
  if (!boites.length) { return { pire: null, nb: 0 }; }
  const avec = await page.screenshot({ type: 'png' });
  await page.addStyleTag({ content: 'text.ciel-epithete{fill:transparent!important;stroke:transparent!important}' });
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
      coeurs.sort((p, q) => q.diff - p.diff);
      const garde = coeurs.slice(0, Math.max(1, Math.floor(coeurs.length / 3)));
      garde.sort((p, q) => p.ratio - q.ratio);
      return { nom: bx.nom, ratio: garde.length ? garde[Math.floor(garde.length / 2)].ratio : null, pixels: coeurs.length };
    });
  }, { a: 'data:image/png;base64,' + avec.toString('base64'), b: 'data:image/png;base64,' + sans.toString('base64'), boites });
  const mesures = r.filter((m) => m.ratio !== null && m.pixels >= 12);
  const pire = mesures.reduce((m, x) => (m === null || x.ratio < m.ratio ? x : m), null);
  return { pire, nb: mesures.length };
}

// ---- Le registre, d'abord : sans lui, tout le reste comparerait du vide ----
console.log('— Le registre —');
// REFIXÉ À HUIT (18/10/2026) : AMATSU, le dragon de l'air — étoile d'attente, mais
// une épithète comme les autres. Ni sept, ni neuf.
verifier('Verrou : huit dragons, chacun avec son épithète',
  DRAGONS.length === 8 && DRAGONS.every((id) => typeof ATTENDU[id].epithete === 'string' && ATTENDU[id].epithete.startsWith('Dragon ')),
  DRAGONS.join(','));

// ---- ①②③④ Le ciel, à trois largeurs ----
// 360 et 414 : là où le défaut de la pose à côté a été trouvé (04/10).
for (const taille of [[300, 640], [320, 700], [360, 780], [390, 844], [414, 896], [1280, 860]]) {
  const cle = `DRAGONS@${taille[0]}`;
  console.log(`— ${cle} —`);
  const { page, contexte } = await ouvrir('imladrik.html#constellation-dragons', taille);
  const m = await mesurer(page);
  if (!m) { verifier(`${cle} : la scène est peinte`, false); await contexte.close(); continue; }
  const p = m.paires;
  verifier(`${cle} : verrou — huit étoiles, huit épithètes, seize lignes`,
    p.length === 8 && p.every((x) => x.epithete !== null) && m.nbLignes === 16, `${p.length} étoiles, ${m.nbLignes} lignes`);
  verifier(`${cle} : chaque épithète est celle du registre, mot pour mot`,
    p.length === 8 && p.every((x) => ATTENDU[x.id] && x.epithete === ATTENDU[x.id].epithete),
    p.map((x) => `${x.id}=${x.epithete}`).join(' | '));
  verifier(`${cle} : le nom reste le nom SEUL (ce que lisent les autres harnais)`,
    p.length === 8 && p.every((x) => x.nom === ATTENDU[x.id].nom));
  verifier(`${cle} : l'épithète suit son nom — même x, posée dessous`,
    p.length === 8 && p.every((x) => Number.isFinite(x.xNom) && Math.abs(x.xNom - x.xEpi) < 0.05
      && x.bn && x.be && x.be.top >= x.bn.top + x.bn.height * 0.5),
    p.map((x) => `${x.id}: Δx ${(x.xEpi - x.xNom).toFixed(2)}`).join(', '));
  verifier(`${cle} : rien ne se croise (lignes entre elles, lignes et cœurs d'étoile)`,
    m.nbLignes === 16 && m.croisements.length === 0, m.croisements.join(', '));
  verifier(`${cle} : rien ne sort du ciel`, m.nbLignes === 16 && m.hors.length === 0, m.hors.join(', '));
  const pxMin = Math.min(...p.map((x) => x.pxEpi));
  verifier(`${cle} : aucune épithète sous ${PLANCHER_PX} px`, p.length === 8 && pxMin >= PLANCHER_PX - 0.05, `min ${pxMin.toFixed(1)} px`);
  verifier(`${cle} : les épithètes sont peintes pleinement (menu)`,
    p.length === 8 && p.every((x) => x.opEpi >= 0.85), p.map((x) => x.opEpi).join(','));
  verifier(`${cle} : l'épithète est DITE par l'étoile, et pas deux fois`,
    p.length === 8 && p.every((x) => x.epiMuette && x.label.includes(ATTENDU[x.id].epithete)));
  const c = await contrasteEpithetes(page);
  verifier(`${cle} : les épithètes se lisent (contraste ≥ ${SEUIL})`,
    c.nb === 8 && c.pire && c.pire.ratio >= SEUIL, c.pire ? `${c.nb} mesurées, pire ${c.pire.nom} ${c.pire.ratio.toFixed(2)}` : `${c.nb} mesurées`);
  await contexte.close();
}

// ---- ⑤ Le cartouche de Léo ----
console.log('— Le cartouche —');
{
  const { page, contexte } = await ouvrir('imladrik.html#constellation-dragons', [1280, 860]);
  const lire = async (id) => {
    await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"]`).dispatchEvent('mouseenter');
    await page.waitForTimeout(200);
    const r = await page.evaluate(() => ({
      nom: (document.querySelector('#boussole-parole .parole-nom') || {}).textContent || '',
      etat: (document.querySelector('#boussole-parole .parole-etat') || {}).textContent || '',
      etats: document.querySelectorAll('#boussole-parole .parole-etat').length,
    }));
    await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"]`).dispatchEvent('mouseleave');
    await page.waitForTimeout(120);
    return r;
  };
  // AU REPOS, LE CARTOUCHE SE TAIT (Paul, 04/10 : « enlève cela, ça prend de la
  // place »). Lu sur le style calculé ET le contenu — un cartouche vide mais
  // visible serait un cadre doré sans texte.
  const repos = () => page.evaluate(() => {
    const el = document.getElementById('boussole-parole');
    return { visible: getComputedStyle(el).visibility === 'visible', texte: el.textContent.trim() };
  });
  const r0 = await repos();
  verifier('Au repos, sur les DRAGONS, le cartouche est invisible et vide',
    r0.visible === false && r0.texte === '', JSON.stringify(r0));
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="vranesh"]').dispatchEvent('mouseenter');
  await page.waitForTimeout(200);
  const r1 = await repos();
  verifier('Miroir : au survol, il réapparaît', r1.visible === true && /VRANESH/.test(r1.texte), JSON.stringify(r1).slice(0, 120));
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="vranesh"]').dispatchEvent('mouseleave');
  await page.waitForTimeout(150);
  const r2 = await repos();
  verifier('…et se tait de nouveau quand on s\'éloigne', r2.visible === false && r2.texte === '', JSON.stringify(r2));
  const vus = [];
  for (const id of DRAGONS) { vus.push({ id, ...(await lire(id)) }); }
  verifier('Verrou : Léo a parlé pour les huit dragons', vus.filter((v) => v.nom).length === 8);
  verifier('Léo dit l\'épithète À LA PLACE de l\'état, une seule ligne',
    vus.length === 8 && vus.every((v) => v.nom === ATTENDU[v.id].nom && v.etat === ATTENDU[v.id].epithete && v.etats === 1),
    vus.map((v) => `${v.id}: ${v.etat}`).join(' | '));
  verifier('Plus aucun « Ouvert » / « Privé » / « À venir » sur un dragon',
    vus.length === 8 && vus.every((v) => !/^(Ouvert|Privé|À venir)$/.test(v.etat)));
  await contexte.close();
}
{
  // MIROIR : un cap SANS épithète garde son état — sans ce contrôle, un cartouche
  // qui aurait perdu toute ligne d'état passerait pour un cartouche réussi.
  const { page, contexte } = await ouvrir('imladrik.html#constellation-armes', [1280, 860]);
  const visibleAuRepos = await page.evaluate(() => getComputedStyle(document.getElementById('boussole-parole')).visibility === 'visible');
  verifier('ARMES aussi : au repos, le cartouche se tait (même écran de constellation)', visibleAuRepos === false);
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="ifulvin"]').dispatchEvent('mouseenter');
  await page.waitForTimeout(200);
  const etat = await page.evaluate(() => (document.querySelector('#boussole-parole .parole-etat') || {}).textContent || '');
  const epis = await page.locator('#ciel-noeud-scene text.ciel-epithete').count();
  verifier('Miroir : IFULVIN, sans épithète, dit toujours son état', etat === NOEUDS.ifulvin.etat, etat);
  verifier('Miroir : aucune épithète peinte hors des DRAGONS', epis === 0, `${epis}`);
  await contexte.close();
}

verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE DRAGONS ÉPITHÈTES VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
