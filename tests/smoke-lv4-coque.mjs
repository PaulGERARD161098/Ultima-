// LV4 — LA COQUE PILOTE AU CIEL (étape ④a de CADRAGE-LV4-CIEL-DEPLIE.md).
//
// `ultima.html` est la première coque à passer de la boussole au ciel. Elle a
// été choisie parce qu'elle CUMULE le plus de fonctions à porter : cockpit,
// cœur, légende, caps liés, et le repli <noscript>. Si le ciel la porte en
// entier, il porte les huit autres.
//
// Ce que ce harnais prouve — une entrée par fonction de l'inventaire §13.1 :
//   ① LE COCKPIT, avec session ET SANS. Sans session doit donner le texte figé,
//      jamais une erreur ni un vide : le fail-closed est une règle de
//      SÉCURITÉ, et il se teste dans les deux sens.
//   ③ LE CŒUR et sa LÉGENDE gravée survivent — y compris au re-dessin, car le
//      moteur VIDE son conteneur à chaque rendu.
//   ⑤ LE CAP « À VENIR » reste INERTE : il se dit au lecteur d'écran
//      (`aria-disabled`), montre son résumé, et NE NAVIGUE PAS. Éprouvé au
//      CLAVIER, pas à la souris — c'est là qu'il casse.
//   ⑥ LE REPLI <noscript> a survécu au rendu et liste TOUTES les cibles du
//      registre. Le ciel est peint en JavaScript pur : ce jour-là, cette liste
//      EST la navigation.
//   + Aucune cible perdue (registre ↔ DOM), Léo parle, la géométrie tient,
//     la navigation arrive, et le thème est lisible.
//
// LE PIRE CAS ICI EST LE PLUS PETIT. `smoke-lv4-ciel` éprouve 3, 12 et 20
// objets ; `ultima-perso` en a DEUX, et deux objets se rangent aux extrémités
// du cadre — c'est la configuration la plus tendue pour le bord, pas la plus
// détendue. Elle n'était couverte nulle part avant ce harnais.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';
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

// Contraste WCAG — mêmes formules que le reste du patrimoine.
function luminance(hex) {
  const m = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = m.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

function brancher(page) {
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
}

const CAPS = NOEUDS['ultima-perso'].enfants;

// ===========================================================================
console.log('— A. La coque rend son nœud, sur le téléphone de Paul —');
const page = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(page);
await page.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1500);

// ---- Aucune cible perdue : le REGISTRE fait foi, pas la page ----
const rendus = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('Tous les caps du registre sont au ciel',
  JSON.stringify(rendus.slice().sort()) === JSON.stringify(CAPS.slice().sort()),
  `rendus: ${JSON.stringify(rendus)}`);

// ---- Tout objet porte son nom, et LISIBLEMENT (l'option `tousLesNoms`) ----
const nomsLisibles = await page.$$eval('#ciel-noeud-scene text.ciel-nom',
  (ts) => ts.filter((t) => +(t.getAttribute('opacity') || '1') >= 0.5).map((t) => t.textContent));
verifier('Chaque cap porte son nom, lisible',
  nomsLisibles.length === CAPS.length
  && CAPS.every((id) => nomsLisibles.includes(NOEUDS[id].nom)),
  `lus: ${JSON.stringify(nomsLisibles)}`);

// ---- LA GÉOMÉTRIE SE MESURE : rien ne sort du cadre ----
// `getBBox()` de chaque étoile — halo, branches et NOM compris —, comparée au
// viewBox. Mesurer le seul centre laisserait passer un nom coupé, et c'est
// justement ce qu'une capture d'écran a montré ici avant ce contrôle.
const cadre = await page.evaluate(() => {
  const svg = document.querySelector('#ciel-noeud-scene .ciel-svg');
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  let dehors = 0, debordMax = -1e9;
  svg.querySelectorAll('g.ciel-etoile[data-noeud-id]').forEach((g) => {
    const b = g.getBBox();
    const d = Math.max(-b.x, -b.y, (b.x + b.width) - vb[2], (b.y + b.height) - vb[3]);
    if (d > 0.5) { dehors += 1; }
    if (d > debordMax) { debordMax = d; }
  });
  const zs = Array.from(svg.querySelectorAll('.ciel-zone'));
  const ys = zs.map((z) => +z.getAttribute('cy'));
  const xs = zs.map((z) => +z.getAttribute('cx'));
  // LV5 / P2 — LA ZONE UTILE est désormais le dénominateur. Depuis le plein
  // écran, une part du cadre est RÉSERVÉE au mobilier (bandeau, retour,
  // cartouche, légende) et le ciel n'a plus le droit d'y peindre.
  const z = window.UltimaCiel.courant().zoneUtile();
  const etX = Math.max(...xs) - Math.min(...xs);
  const etY = Math.max(...ys) - Math.min(...ys);
  return {
    dehors, debordMax,
    occupation: Math.max(etX / vb[2], etY / vb[3]),
    occupationUtile: Math.max(etX / z.largeur, etY / z.hauteur),
    zone: { haut: Math.round(z.haut), bas: Math.round(z.bas) }
  };
});
chiffres.cadreTel = {
  occupation: +(cadre.occupation * 100).toFixed(1),
  occupationUtile: +(cadre.occupationUtile * 100).toFixed(1),
  margeHaute: cadre.zone.haut, margeBasse: cadre.zone.bas,
  debordMax: +cadre.debordMax.toFixed(1)
};
verifier('Aucun objet hors cadre (boîte réelle, nom compris)', cadre.dehors === 0,
  `débord max: ${cadre.debordMax.toFixed(1)}`);
// ---- ASSERTION REMPLACÉE le 2026-08-17 (LV5 / P2), pas abandonnée ----
// Elle disait : « le ciel remplit LE CADRE à 60 % au moins ». Depuis le plein
// écran, une part du cadre est RÉSERVÉE au mobilier — mesuré ici : 119 unités en
// haut, 81 en bas sur 833. Exiger 60 % du cadre entier reviendrait donc à
// demander au ciel 83 % de la place qui lui reste, ce que les marges de libellé
// rendent impossible : l'assertion serait devenue arithmétiquement
// intenable, et la « corriger » en baissant le seuil aurait masqué le fait que
// le ciel remplit très bien ce qu'on lui laisse (51,7 % du cadre, **71,8 % de sa
// zone utile** — la fourchette de LV4).
// LE CONTRÔLE NE CHANGE PAS, SON DÉNOMINATEUR CHANGE. Un seuil qui baisse doit
// se justifier par la géométrie et jamais par l'envie de passer : ici il ne
// baisse pas, il se mesure au bon endroit.
verifier('Le ciel remplit sa ZONE UTILE (≥ 60 %)', cadre.occupationUtile >= 0.6,
  `${(cadre.occupationUtile * 100).toFixed(1)} % de la zone utile · `
  + `${(cadre.occupation * 100).toFixed(1)} % du cadre entier`);

// ---- ③ LE CŒUR ET SA LÉGENDE ont survécu au rendu ----
// Le moteur vide son conteneur à chaque dessin : s'ils avaient été posés DANS
// la scène, ils auraient disparu au premier trait.
verifier('③ Le cœur du nœud est gravé (filigrane)',
  (await page.locator('.ciel-filigrane svg').count()) === 1);
verifier('③ La légende gravée du registre',
  (await page.locator('.ciel-legende').textContent()) === NOEUDS['ultima-perso'].legende);

// ---- ⑥ LE REPLI <noscript> : survivant, et COMPLET ----
verifier('⑥ Le repli <noscript> a survécu au rendu',
  (await page.locator('#ciel-noeud-plateau noscript').count()) === 1);
const noscript = await page.evaluate(() => {
  const n = document.querySelector('#ciel-noeud-plateau noscript');
  return n ? (n.textContent + ' ' + n.innerHTML) : '';
});
verifier('⑥ Le repli liste TOUTES les cibles du registre',
  CAPS.every((id) => !NOEUDS[id].cible || noscript.includes(NOEUDS[id].cible)),
  `attendues: ${JSON.stringify(CAPS.map((id) => NOEUDS[id].cible))}`);

// ---- LÉO PARLE — au survol ET au focus clavier ----
const premier = page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${CAPS[0]}"]`);
await premier.dispatchEvent('mouseenter');
await page.waitForTimeout(200);
verifier('Léo nomme le cap survolé',
  (await page.locator('#boussole-parole .parole-nom').textContent()) === NOEUDS[CAPS[0]].nom);
verifier('Léo dit son état',
  (await page.locator('#boussole-parole .parole-etat').textContent()) === NOEUDS[CAPS[0]].etat);
verifier('Léo dit ce qu’on peut faire',
  (await page.locator('#boussole-parole .parole-action').textContent()) === 'Clique pour entrer ↝');
await premier.dispatchEvent('mouseleave');
await page.waitForTimeout(120);
verifier('La parole revient au repos quand on s’éloigne',
  (await page.locator('#boussole-parole .parole-nom').count()) === 0);

// ---- LE DÉPLIAGE : voir ce qu'un cap contient sans y entrer ----
await premier.dispatchEvent('mouseenter');
await page.waitForTimeout(700);
const apresDepliage = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
const attendusDeplies = CAPS.length + (NOEUDS[CAPS[0]].enfants || []).length;
verifier('Le survol déplie ce que le cap contient',
  apresDepliage.length === attendusDeplies,
  `${apresDepliage.length} objets, attendu ${attendusDeplies}`);
verifier('Le dépliage ne quitte PAS l’étage',
  CAPS.every((id) => apresDepliage.includes(id)));
verifier('On n’a pas changé de page en dépliant', /\/ultima\.html$/.test(page.url()));

// ---- Lisibilité : le thème stellaire tient sur cette coque ----
const lisibilite = await page.evaluate(() => {
  const lire = (sel) => {
    const el = document.querySelector(sel);
    if (!el) { return null; }
    const s = getComputedStyle(el);
    return { couleur: s.color, taille: s.fontSize };
  };
  return {
    titre: lire('.titre-principal'),
    surligne: lire('.titre-surligne'),
    legende: lire('.ciel-legende'),
    fond: getComputedStyle(document.body).backgroundColor
  };
});
// LE FOND DE NUIT SE MESURE, ET CE CONTRÔLE A TROUVÉ MIEUX QU'UN FOND.
// `ciel.css` déclare son régime chromatique sur `.espace-ciel` — la coque de
// RIVEN — et non sur `:root`. Une page qui charge la feuille sans porter cette
// classe voit TOUS ses `var(--ciel-*)` devenir invalides : le fond de la scène
// ne peint plus, et RIEN ne le signale, puisque la page a l'air sombre grâce au
// `body`. On vérifie donc que le dégradé est peint ET que le jeton résout.
const fondNuit = await page.evaluate(() => {
  const plateau = document.getElementById('ciel-noeud-plateau');
  const jeton = getComputedStyle(plateau).getPropertyValue('--ciel-nuit-haute').trim();
  return {
    degrade: getComputedStyle(plateau).backgroundImage.includes('gradient'),
    jeton,
    scene: getComputedStyle(document.getElementById('ciel-noeud-scene'))
      .backgroundImage.includes('gradient')
  };
});
chiffres.fondNuit = fondNuit;
verifier('Le fond de la coque est bien un ciel (dégradé de nuit)', fondNuit.degrade === true);
verifier('Les jetons de nuit de ciel.css résolvent sur cette coque',
  fondNuit.jeton !== '', `--ciel-nuit-haute: « ${fondNuit.jeton} »`);
verifier('La scène du ciel peint son propre fond', fondNuit.scene === true);
for (const [nom, v] of Object.entries(lisibilite)) {
  if (!v || !v.couleur) { continue; }
  const lum = luminance(versHex(v.couleur));
  chiffres['lum_' + nom] = +lum.toFixed(3);
  verifier(`Texte « ${nom} » clair sur nuit`, lum > 0.25, `luminance ${lum.toFixed(3)}`);
}
await page.close();

// ===========================================================================
console.log('— B. ⑤ Le cap « à venir » : nommé, atteignable, et INERTE —');
// `ultima-perso` n'a aujourd'hui que des caps ouverts : le cas « à venir » ne
// s'y présente PAS. On ne l'espère donc pas — on le CONSTRUIT, en rendant un
// registre d'essai dans la vraie coque, par le vrai module. Sans cela, la
// fonction ⑤ serait déclarée portée sans avoir jamais été exercée.
const pageAvenir = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(pageAvenir);
await pageAvenir.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
await pageAvenir.waitForTimeout(1200);
const avenir = await pageAvenir.evaluate(async () => {
  const REG = {
    essai: { nom: 'ESSAI', enfants: ['ouvert', 'futur'], coeur: null, legende: null },
    ouvert: { nom: 'OUVERT', etat: 'Ouvert', resume: 'r', cible: 'grima.html' },
    futur: { nom: 'FUTUR', etat: 'À venir', resume: 'pas encore' }
  };
  window.UltimaCiel.arreter();
  document.getElementById('ciel-noeud-scene').textContent = '';
  window.UltimaCielNoeudNoyau.rendre('essai', { noeuds: REG });
  await new Promise((r) => setTimeout(r, 900));
  const g = document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="futur"]');
  const gOuvert = document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="ouvert"]');
  const avantUrl = location.href;
  // Le CLAVIER : c'est par là qu'un cap inerte devient cliquable sans qu'on
  // s'en aperçoive. Entrée passe par le même chemin que le doigt.
  g.focus();
  g.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await new Promise((r) => setTimeout(r, 500));
  return {
    present: !!g,
    nomme: (g.querySelector('title') || {}).textContent,
    ariaDisabled: g.getAttribute('aria-disabled'),
    ouvrableSansAria: gOuvert.getAttribute('aria-disabled'),
    focusable: g.getAttribute('tabindex') === '0',
    action: (document.querySelector('#boussole-parole .parole-action') || {}).textContent,
    urlInchangee: location.href === avantUrl
  };
});
chiffres.capAvenir = avenir;
verifier('⑤ Le cap « à venir » est présent et nommé', avenir.present && avenir.nomme === 'FUTUR');
verifier('⑤ Il est atteignable au clavier', avenir.focusable === true);
verifier('⑤ Il se DIT infranchissable (aria-disabled)', avenir.ariaDisabled === 'true');
verifier('⑤ Un cap ouvrable, lui, ne porte PAS aria-disabled',
  avenir.ouvrableSansAria === null);
verifier('⑤ Entrée montre son résumé au lieu de naviguer',
  avenir.action === 'Cap en préparation', `lu: ${avenir.action}`);
verifier('⑤ Entrée n’a PAS changé de page', avenir.urlInchangee === true);
await pageAvenir.close();

// ===========================================================================
console.log('— C. ① Le cockpit : avec session, et SANS (fail-closed) —');
// Le fail-closed est une règle de SÉCURITÉ, pas d'ergonomie : un cockpit qui,
// en tombant, laisserait paraître une erreur serveur ou un état à moitié
// rempli serait un défaut. On l'éprouve donc dans les DEUX sens.
async function cockpit(scenario) {
  const p = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
  brancher(p);
  await p.route('**/api/cockpit', (route) => {
    if (scenario === 'ok') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { riven: { relances_dues: 2 }, reshiram: { a_etayer: 1 } } })
      });
    }
    return route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom secret interne' });
  });
  await p.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });
  await p.waitForTimeout(1200);
  const res = await p.evaluate(async (cap) => {
    window.UltimaBoussole.poserSession('jeton-d-essai');
    await new Promise((r) => setTimeout(r, 600));
    const g = document.querySelector(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${cap}"]`);
    g.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((r) => setTimeout(r, 250));
    const par = document.getElementById('boussole-parole');
    return {
      signal: (par.querySelector('.parole-signal') || {}).textContent || null,
      texte: (par.querySelector('.parole-texte') || {}).textContent || null,
      tout: par.textContent
    };
  }, CAPS[0]);
  await p.close();
  return res;
}
const avecSession = await cockpit('ok');
chiffres.cockpitOk = avecSession.signal;
verifier('① Avec session : le signal vivant paraît',
  /relance/.test(avecSession.signal || ''), `lu: ${avecSession.signal}`);

const sansSession = await cockpit('erreur');
chiffres.cockpitErreur = { signal: sansSession.signal, texte: sansSession.texte };
verifier('① Sur erreur serveur : AUCUN signal vivant (fail-closed)',
  sansSession.signal === null);
verifier('① Sur erreur serveur : le texte figé du registre est là',
  (sansSession.texte || '') === NOEUDS[CAPS[0]].resume);
// Et surtout : RIEN du serveur ne transparaît. Éprouvé par l'ABSENCE.
verifier('① Aucune bribe de l’erreur serveur n’atteint la page',
  !/boom|secret|500|interne/i.test(sansSession.tout || ''));

// ===========================================================================
console.log('— D. La navigation arrive quelque part —');
const pageNav = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(pageNav);
await pageNav.goto(`${BASE}/ultima.html`, { waitUntil: 'load', timeout: 20000 });

await pageNav.waitForTimeout(1400);
await pageNav.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${CAPS[0]}"]`)
  .dispatchEvent('click');
await pageNav.waitForURL(`**/${NOEUDS[CAPS[0]].cible}`, { timeout: 8000 }).catch(() => {});
verifier(`Clic sur ${NOEUDS[CAPS[0]].nom} → ${NOEUDS[CAPS[0]].cible}`,
  pageNav.url().endsWith(NOEUDS[CAPS[0]].cible), pageNav.url());
await pageNav.close();

// LE 500 DU SCÉNARIO FAIL-CLOSED EST LE NÔTRE : c'est le harnais qui le
// provoque pour prouver que la page n'en dit rien. Le compter comme un défaut
// reviendrait à reprocher au test d'avoir fait son travail. On l'écarte
// NOMMÉMENT — pas en assouplissant le contrôle, qui reste strict sur tout le
// reste, `pageerror` en tête.
const erreursReelles = erreurs.filter((e) => !/500 \(Internal Server Error\)/.test(e));
chiffres.erreursEcartees = erreurs.length - erreursReelles.length;
verifier('Zéro erreur console (hors le 500 que ce harnais provoque lui-même)',
  erreursReelles.length === 0, JSON.stringify(erreursReelles.slice(0, 3)));

console.log('Mesures :', JSON.stringify(chiffres, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? '\n=== SMOKE LV4-COQUE VERT ===' : '\n=== SMOKE LV4-COQUE ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
