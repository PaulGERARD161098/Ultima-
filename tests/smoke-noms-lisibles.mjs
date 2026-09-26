// LES NOMS SE LISENT AU TÉLÉPHONE — lot 2a de CADRAGE-2026-09-25-carte-celeste.md (§18).
//
// Ce que la revue impeccable a trouvé (§17, A9) : sur les écrans de navigation,
// les noms des caps tombaient à 7,5 unités — le plancher de `js/ciel.js`, écrit
// en unités du viewBox et non en pixels. Mesuré en production le 26/09 : 8 à
// 9,2 px CSS à 390 px de large. Et ils étaient en sans-serif gris, quand ce sont
// les noms propres du produit.
//
// Ce harnais mesure ce que l'ŒIL reçoit : la taille RENDUE (attribut
// `font-size` × `getScreenCTM().a`), pas l'attribut seul — un plancher juste en
// unités de dessin peut être faux en pixels dès que le viewBox ne vaut plus
// l'écran (c'est ce que la maquette, dans un cadre de 356, a montré à 0,87).
//
// ⛔ VU ROUGE SUR LE CODE D'AVANT LE LOT. Et chaque recherche d'absence
// (« aucun chevauchement », « rien hors cadre ») est précédée de son verrou de
// non-vacuité : au moins deux noms mesurés sur l'écran, sinon le vert ne veut
// rien dire.
//
// ⚠️ PÉRIMÈTRE, nommément : les écrans de navigation (`#ciel-noeud-scene`).
// RIVEN n'est pas mesuré ici — son témoin est `smoke-ciel`, qui doit rester
// inchangé. Le pire cas à 24 étoiles vit dans la maquette, pas en production.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const PLANCHER_PX = 11;
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

const ECRANS = [
  { nom: 'racine', page: 'index.html', porte: true },
  { nom: 'ULTIMA', page: 'ultima.html' },
  { nom: 'NAGA', page: 'ultima.html#naga' },
  { nom: 'GRIMA', page: 'ultima.html#grima' },
  { nom: 'ALPHA', page: 'alpha.html' },
];
const LARGEURS = [[360, 780], [390, 844], [1280, 800]];

async function ouvrir(ecran, [largeur, hauteur]) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur } });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${ecran.nom}@${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${ecran.nom}@${largeur} console: ${m.text()}`); } });
  // Agrégat Finubar vide et cockpit vide : ce harnais ne juge ni l'un ni
  // l'autre (leçon de `smoke-lv4-coque`).
  await page.route('**/api/finubar', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-26', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await page.route('**/api/cockpit', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }),
  }));
  await page.goto(`${BASE}/${ecran.page}`, { waitUntil: 'load', timeout: 20000 });
  if (ecran.porte) {
    // La porte d'entrée couvre la racine tant qu'aucune session n'est ouverte ;
    // on la masque comme `smoke-accueil-finubar` (ce qu'on mesure est derrière).
    await page.evaluate(() => {
      const el = document.getElementById('ecran-connexion');
      if (el) { el.hidden = true; el.style.display = 'none'; }
      const scene = document.querySelector('.boussole-scene');
      if (scene) { scene.removeAttribute('inert'); }
    });
  }
  // La caméra doit être POSÉE : mesurée trop tôt, la taille suit encore le
  // cadrage (la maquette l'a payé à 0,9 s, §17).
  await page.waitForTimeout(2000);
  return { page, contexte };
}

function mesurer(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#ciel-noeud-scene .ciel-svg');
    if (!svg) { return null; }
    const k = svg.getScreenCTM().a;
    const cadre = svg.getBoundingClientRect();
    // Un nom LU : permanent (pas « à la demande ») et peint à ≥ 0,5.
    const noms = [...svg.querySelectorAll('text.ciel-nom')].filter((t) =>
      !t.classList.contains('ciel-nom--demande') && +(t.getAttribute('opacity') || '1') >= 0.5);
    const boites = noms.map((t) => t.getBoundingClientRect());
    let chevauchements = 0;
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) {
        const a = boites[i], b = boites[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) { chevauchements += 1; }
      }
    }
    const hors = boites.filter((b) => b.left < cadre.left - 0.5 || b.right > cadre.right + 0.5
      || b.top < cadre.top - 0.5 || b.bottom > cadre.bottom + 0.5).length;
    const px = noms.map((t) => (+t.getAttribute('font-size') || 0) * k);
    const style = noms.length ? getComputedStyle(noms[0]) : null;
    return {
      n: noms.length,
      pxMin: px.length ? Math.min(...px) : 0,
      police: style ? style.fontFamily : '',
      casse: style ? style.textTransform : '',
      chevauchements, hors,
    };
  });
}

// ===========================================================================
for (const ecran of ECRANS) {
  for (const taille of LARGEURS) {
    const cle = `${ecran.nom}@${taille[0]}`;
    const { page, contexte } = await ouvrir(ecran, taille);
    const m = await mesurer(page);
    await contexte.close();
    if (!m) { verifier(`${cle} : la scène est peinte`, false, 'aucun .ciel-svg'); continue; }
    chiffres[cle] = { noms: m.n, pxMin: +m.pxMin.toFixed(1), police: m.police.split(',')[0], casse: m.casse };
    // Verrou de non-vacuité AVANT toute recherche d'absence.
    verifier(`${cle} : au moins deux noms lus`, m.n >= 2, `${m.n}`);
    verifier(`${cle} : aucun nom sous ${PLANCHER_PX} px`, m.n >= 2 && m.pxMin >= PLANCHER_PX - 0.05,
      `min ${m.pxMin.toFixed(1)} px`);
    verifier(`${cle} : noms en Georgia`, /^\s*Georgia/i.test(m.police), m.police.split(',')[0]);
    verifier(`${cle} : noms en capitales`, m.casse === 'uppercase', m.casse);
    verifier(`${cle} : aucun nom n'en chevauche un autre`, m.n >= 2 && m.chevauchements === 0, `${m.chevauchements}`);
    verifier(`${cle} : aucun nom hors cadre`, m.n >= 2 && m.hors === 0, `${m.hors}`);
  }
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE NOMS-LISIBLES VERT ===' : '\n=== SMOKE NOMS-LISIBLES ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
