// TOUTE PAGE EN BOUT DE CHAÎNE A UN RETOUR (26/09, Paul sur iPhone).
//
// « J'étais sur RIVEN, impossible de faire un retour arrière. » Ultima est
// installée comme application (`manifest.webmanifest` : `display: standalone`) :
// il n'y a PAS de bouton retour du navigateur. Une page qui ne porte pas son
// propre retour est donc une impasse — on n'en sort qu'en tuant l'application.
//
// Ce harnais lit le REGISTRE (`js/registre-lv3.mjs`), pas une liste écrite à la
// main : chaque FEUILLE (une cible, aucun enfant, pas externe) doit porter, au
// téléphone, un lien VISIBLE vers un de ses ancêtres. Une feuille ajoutée
// demain est contrôlée sans une ligne de plus ici.
// Et pour RIVEN, plus strict : le lien mène à son parent EXACT, OMEGA (GRIMA, son ancien parent, est supprimé
// depuis le 2026-09-29), et se
// touche du doigt (≥ 40 px).
//
// ⛔ Vu rouge sur le code d'avant (RIVEN). Verrou de non-vacuité : au moins
// cinq feuilles contrôlées — sinon « aucune impasse » serait vert sur un
// registre mal lu.
import { chromium } from 'playwright';
import { NOEUDS, chemin } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

const feuilles = Object.entries(NOEUDS)
  .filter(([, n]) => n.cible && !n.externe && !(n.enfants || []).length)
  .map(([id, n]) => ({ id, cible: n.cible }));
verifier('Verrou : au moins cinq feuilles lues dans le registre', feuilles.length >= 5, `${feuilles.length}`);

// Ouvre `cible` au téléphone, lève la porte de connexion et son inertie, et
// rend les liens de la page avec ce que le doigt y atteint réellement.
async function sonder(id, cible) {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${id} pageerror: ${e.message}`));
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.goto(`${BASE}/${cible}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1200);
  // L'écran de connexion couvre certaines pages sans session : on mesure la
  // page qu'on atteint une fois connecté, pas la porte.
  // ⚠️ ET SON INERTIE, qui est la vraie porte : `js/app.js` pose `inert` sur
  // l'en-tête, les espaces et les onglets tant que l'écran de connexion est
  // visible, et la retire à l'ouverture de session. Masquer l'écran sans lever
  // l'inertie mesurerait une page qui n'existe pour personne — le lien y a une
  // boîte, mais `elementFromPoint` y répond BODY.
  await page.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
  });
  await page.waitForTimeout(300);
  const liens = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    // « Visible » veut dire QUE LE DOIGT L'ATTEINT, pas qu'il a une boîte : le
    // premier jet du retour de RIVEN avait une boîte parfaite… sous le
    // cartouche ULTIMA (vu sur capture, 26/09). On demande donc au navigateur
    // ce qu'il y a au centre du lien.
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dessus = r.width > 0 && cy > 0 && cy < innerHeight && cx > 0 && cx < innerWidth
      ? document.elementFromPoint(cx, cy) : null;
    const vu = r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
      && !!dessus && (dessus === a || a.contains(dessus));
    return { href: new URL(a.getAttribute('href'), location.href).pathname.replace(/^\//, ''), vu, h: Math.round(r.height), texte: a.textContent.trim().slice(0, 24) };
  }));
  await contexte.close();
  return liens;
}

for (const f of feuilles) {
  // Les cibles des ancêtres (sans la feuille elle-même). La racine n'a pas de
  // cible dans le registre : elle vit à `index.html`.
  const ancetres = chemin(f.id, NOEUDS).slice(0, -1)
    .map((id) => (NOEUDS[id] || {}).cible || (id === 'racine' ? 'index.html' : null))
    .filter(Boolean);
  const liens = await sonder(f.id, f.cible);
  const retours = liens.filter((l) => l.vu && ancetres.includes(l.href));
  verifier(`${f.id} (${f.cible}) : un retour visible vers un ancêtre`, retours.length > 0,
    retours.length ? retours.map((l) => `${l.texte} → ${l.href}`).join(' · ') : `aucun parmi ${ancetres.join(', ')}`);
  if (f.id === 'riven') {
    const parent = ancetres[ancetres.length - 1];
    const auParent = retours.filter((l) => l.href === parent);
    verifier('riven : le retour mène au parent EXACT (OMEGA)', parent === 'omega.html' && auParent.length > 0, parent);
    verifier('riven : le retour se touche du doigt (≥ 40 px)', auParent.some((l) => l.h >= 40), auParent.map((l) => l.h).join(','));
  }
}

// ---------------------------------------------------------------------------
// 2026-09-29 — LES RETOURS APRÈS LA RESTRUCTURATION OMEGA / IMLADRIK.
// Cette table n'est PAS lue dans le registre : elle dit ce que Paul a décidé
// que chaque page ouvre en « retour », et c'est ce que la restructuration
// pouvait casser en silence (une page qui pointe encore vers naga.html ou
// grima.html est une impasse — 404). Le registre ne suffit pas à le dire :
// IDEES, ABAQUE et FINUBAR reviennent à OMEGA, pas à leur parent d'arbre.
// Chaque page doit porter un lien VISIBLE (touchable) vers le bon parent, et
// AUCUN lien vers une page qui n'existe plus.
const RETOURS_ATTENDUS = [
  ['riven', 'riven.html', 'omega.html'],
  ['nicol-bolas', 'bcp.html', 'omega.html'],
  ['imladrik', 'imladrik.html', 'omega.html'],
  ['adramelech', 'adramelech.html', 'imladrik.html'],
  ['tao', 'tao.html', 'imladrik.html'],
  ['idees', 'idees.html', 'omega.html'],
  ['abaque', 'abaque.html', 'omega.html'],
  ['finubar', 'finubar.html', 'omega.html'],
];
verifier('Verrou : huit pages à retour explicite', RETOURS_ATTENDUS.length === 8);
for (const [id, fichier, parent] of RETOURS_ATTENDUS) {
  const liens = await sonder(id, fichier);
  const versLeParent = liens.filter((l) => l.vu && l.href === parent);
  verifier(`${fichier} : retour visible vers ${parent}`, versLeParent.length > 0,
    liens.filter((l) => l.vu).map((l) => `${l.texte} → ${l.href}`).join(' · ').slice(0, 200));
  verifier(`${fichier} : aucun lien vers une page disparue (grima / naga / ultima)`,
    liens.length > 0 && !liens.some((l) => /^(grima|naga|ultima)\.html$/.test(l.href)),
    liens.filter((l) => /^(grima|naga|ultima)\.html$/.test(l.href)).map((l) => l.href).join(','));
}
// Le parent attendu existe bel et bien (un retour vers une page absente serait
// vert sur le seul texte du lien).
for (const parent of new Set(RETOURS_ATTENDUS.map((r) => r[2]))) {
  const rep = await fetch(`${BASE}/${parent}`);
  verifier(`${parent} : la page répond 200`, rep.status === 200, String(rep.status));
}

verifier('Zéro erreur de page', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE RETOUR-FEUILLES VERT ===' : '\n=== SMOKE RETOUR-FEUILLES ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
