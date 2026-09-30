// LV4 — LA COQUE PILOTE AU CIEL (étape ④a de CADRAGE-LV4-CIEL-DEPLIE.md).
//
// `ultima.html` (aujourd'hui `omega.html`, depuis le 2026-09-29) est la première coque à passer de la boussole au ciel. Elle a
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
//   ⑦ L'ISOLEMENT (2026-08-28) : cliquer ce qui CONTIENT n'ouvre plus une page,
//      ça éteint le reste du ciel, ça s'approche, et ça re-dessine sur la seule
//      descendance. Les trois temps sont mesurés SÉPARÉMENT — l'extinction sur
//      l'opacité calculée pendant l'approche, l'approche sur la distance réelle
//      de la caméra, le re-dessin sur ce qui est peint. Un seul chiffre pour
//      les trois ne prouverait aucun des trois.
//      Et les DEUX sorties sont éprouvées (Échap, fil d'Ariane), parce qu'un
//      écran dont on ne sait pas ressortir est un piège.
//
// LE PIRE CAS ICI EST LE PLUS PETIT. `smoke-lv4-ciel` éprouve 3, 12 et 20
// objets ; `ultima-perso` (devenu `omega`) en avait DEUX, et deux objets se
// rangent aux extrémités du cadre — c'était la configuration la plus tendue
// pour le bord. OMEGA en porte TROIS depuis la suppression de GRIMA et NAGA
// (RIVEN, NICOL BOLAS, IMLADRIK) ; le cas à deux objets reste couvert par le
// registre d'essai de la section B et le pire cas construit de la section E.
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
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
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

const CAPS = NOEUDS.omega.enfants;
// Verrou de non-vacuité : la coque pilote a bien ses trois caps.
if (CAPS.length !== 3) { throw new Error('OMEGA devrait porter 3 caps, le registre en a ' + CAPS.length); }

// ===========================================================================
console.log('— A. La coque rend son nœud, sur le téléphone de Paul —');
const page = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(page);
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
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
  (await page.locator('.ciel-legende').textContent()) === NOEUDS.omega.legende);

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

// ---- LE SURVOL NE DÉPLIE PLUS (2026-09-25, arbitrage A1) ----
// Cette assertion disait l'inverse : « le survol déplie ce que le cap
// contient ». Le dépliage redessinait la scène sous le curseur et faisait
// rater le clic (4 gestes sur 5, `smoke-clic-exact`). Inversée, pas
// supprimée : le survol doit maintenant laisser le ciel EXACTEMENT tel quel.
await premier.dispatchEvent('mouseenter');
await page.waitForTimeout(700);
const apresSurvol = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('Le survol ne déplie plus : le ciel garde ses seuls caps',
  apresSurvol.length === CAPS.length,
  `${apresSurvol.length} objets, attendu ${CAPS.length}`);
verifier('Le survol ne quitte PAS l’étage',
  CAPS.every((id) => apresSurvol.includes(id)));
verifier('On n’a pas changé de page en survolant', /\/omega\.html$/.test(page.url()));

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
// `omega` n'a aujourd'hui que des caps ouverts : le cas « à venir » ne
// s'y présente PAS. On ne l'espère donc pas — on le CONSTRUIT, en rendant un
// registre d'essai dans la vraie coque, par le vrai module. Sans cela, la
// fonction ⑤ serait déclarée portée sans avoir jamais été exercée.
const pageAvenir = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(pageAvenir);
await pageAvenir.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
await pageAvenir.waitForTimeout(1200);
const avenir = await pageAvenir.evaluate(async () => {
  const REG = {
    essai: { nom: 'ESSAI', enfants: ['ouvert', 'futur'], coeur: null, legende: null },
    ouvert: { nom: 'OUVERT', etat: 'Ouvert', resume: 'r', cible: 'omega.html' },
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
  // Depuis le 02/09, TOUTE coque au ciel demande aussi `/api/finubar` (la
  // couleur d'appel des projets). Non stubée, la route rend 404 sur le serveur
  // statique du banc, et ce 404 se présenterait comme une erreur console — donc
  // comme un défaut du produit, alors que c'est un manque de l'instrument. On
  // rend un agrégat VIDE : ce harnais-ci ne juge pas Finubar (c'est
  // `smoke-accueil-finubar`), il exige seulement que sa présence ne change rien.
  await p.route('**/api/finubar', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-02', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await p.route('**/api/cockpit', (route) => {
    if (scenario === 'ok') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: { riven: { relances_dues: 2 }, reshiram: { a_etayer: 1 } } })
      });
    }
    return route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom secret interne' });
  });
  await p.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
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
console.log('— D. ⑦ L\'isolement : ce qui CONTIENT s\'isole, ce qui ne contient rien s\'ouvre —');
// ---- ASSERTION REMPLACÉE le 2026-08-28, pas abandonnée ----
// Elle disait : « clic sur GRIMA → grima.html » (GRIMA a été supprimé le
// 2026-09-29 ; le foyer éprouvé est désormais IMLADRIK). Le geste a changé sur demande
// de Paul (« quand je clique sur une constellation, ça m'affiche uniquement
// cette constellation et plus les autres ») : un nœud qui contient quelque
// chose s'isole SUR PLACE. Exiger la navigation reviendrait à éprouver le
// produit d'hier.
// CE QUI EST PERDU, ET CE QUI LE RATTRAPE : le clic ne prouve plus qu'une page
// s'ouvre. La preuve de la porte est reprise plus bas, sur une FEUILLE (RIVEN),
// qui est désormais le seul cas où une page s'ouvre — donc le seul endroit où
// cette preuve dit encore quelque chose.
const pageNav = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(pageNav);
await pageNav.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
await pageNav.waitForTimeout(1500);

// IMLADRIK est le foyer le plus exigeant : ses deux entrées sont des têtes PLEINES
// (les constellations ARMES et DRAGONS) et le second étage qu'elles portent est
// fait de feuilles (IFULVIN, MAEDRETHNIR, VRANESH, DRAUKHAIN, RESHIRAM, ZEKROM) et
// d'une tête pleine, ADRAMELECH — donc les deux branches de la règle de groupement.
// (30/09 : TAO n'existe plus ; ADRAMELECH est descendu d'un cran.)
// Depuis que l'isolement ne peint plus qu'UN étage (Paul, 2026-08-31), c'est
// justement la tête pleine qui fait d'IMLADRIK le bon cas : il EXISTE un second
// étage sous lui, et il doit rester invisible. Un foyer sans petits-enfants
// aurait passé le contrôle sans rien prouver.
const FOYER = 'imladrik';
const attenduIsole = (NOEUDS[FOYER].enfants || []).slice();
// Ce qui vit un cran plus bas, et qu'on ne doit PAS voir.
const secondEtage = (NOEUDS[FOYER].enfants || [])
  .reduce((liste, id) => liste.concat(NOEUDS[id].enfants || []), []);

const plongee = await pageNav.evaluate(async (foyer) => {
  const scene = document.getElementById('ciel-noeud-scene');
  const idsPeints = () => Array.from(scene.querySelectorAll('g.ciel-etoile[data-noeud-id]'))
    .map((g) => g.getAttribute('data-noeud-id'));
  const opacite = (id) => {
    const g = scene.querySelector('g.ciel-etoile[data-noeud-id="' + id + '"]');
    return g ? +getComputedStyle(g).opacity : null;
  };
  const avant = { ids: idsPeints(), distance: window.UltimaCiel.courant().distance() };
  scene.querySelector('g.ciel-etoile[data-noeud-id="' + foyer + '"]')
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  // ON MESURE PENDANT L'APPROCHE, ET C'EST LE SEUL MOMENT OÙ C'EST POSSIBLE :
  // après le re-dessin, les étoiles éteintes n'existent plus — leur absence ne
  // dirait plus si elles se sont EFFACÉES ou si elles ont simplement été
  // remplacées. 190 ms : dans les 220 ms de l'approche, assez tard pour que la
  // transition de 220 ms ait fait son chemin.
  await new Promise((r) => setTimeout(r, 190));
  const pendant = {
    eteinte: opacite('nicol-bolas'), gardee: opacite(foyer),
    distance: window.UltimaCiel.courant().distance()
  };
  await new Promise((r) => setTimeout(r, 1500));
  return {
    avant, pendant, apres: idsPeints(), url: location.href,
    fil: (document.querySelector('.ciel-fil') || {}).textContent || '',
    filVisible: !(document.querySelector('.ciel-fil') || { hidden: true }).hidden,
    paroleAuRepos: (document.querySelector('#boussole-parole .parole-nom') || {}).textContent || ''
  };
}, FOYER);
chiffres.isolement = {
  distanceAvant: +plongee.avant.distance.toFixed(1),
  distancePendant: +plongee.pendant.distance.toFixed(1),
  opaciteEteinte: +(plongee.pendant.eteinte || 0).toFixed(3),
  opaciteGardee: +(plongee.pendant.gardee || 0).toFixed(3),
  peints: plongee.apres.length
};

// ① CE QUI N'A PAS ÉTÉ CHOISI S'EFFACE — mesuré sur l'opacité CALCULÉE, la
//    seule qui dise ce que l'écran montre : le moteur ré-écrit l'attribut
//    `opacity` à chaque image, et le lire renverrait la valeur du moteur, pas
//    celle que la règle CSS impose par-dessus.
verifier('⑦ Le ciel s’éteint autour de ce qu’on a choisi',
  plongee.pendant.eteinte !== null && plongee.pendant.eteinte < 0.25,
  `NICOL BOLAS (frère) à ${(plongee.pendant.eteinte || 0).toFixed(3)} pendant l’approche`);
// …et l'élu, lui, ne s'éteint PAS. Sans cette moitié-là, un ciel entièrement
// noir passerait le contrôle précédent.
verifier('⑦ …et ce qu’on a choisi reste allumé',
  plongee.pendant.gardee >= 0.5
  && plongee.pendant.eteinte < plongee.pendant.gardee / 3,
  `IMLADRIK à ${(plongee.pendant.gardee || 0).toFixed(3)}`);
// ② LA CAMÉRA S'APPROCHE VRAIMENT. Mesurée sur sa distance réelle (le rayon de
//    l'étoile SATURE — instrument écarté le 2026-08-13).
verifier('⑦ La caméra plonge vers le foyer',
  plongee.pendant.distance < plongee.avant.distance * 0.9,
  `${plongee.avant.distance.toFixed(0)} → ${plongee.pendant.distance.toFixed(0)}`);
// ③ LE RE-DESSIN : la descendance, toute la descendance, et rien qu'elle.
// REMPLACE « Les deux étages du foyer sont peints d'un coup » (2026-08-28) :
// Paul a resserré la règle le 31/08 — un seul étage, « juste les grands
// thèmes ». L'exigence est INVERSÉE, pas retirée : ce que l'ancien verdict
// réclamait, le suivant l'interdit.
verifier('⑦ Seuls les enfants DIRECTS du foyer sont peints',
  attenduIsole.every((id) => plongee.apres.includes(id))
  && plongee.apres.length === attenduIsole.length,
  JSON.stringify(plongee.apres));
verifier('⑦ …et le second étage reste invisible (éprouvé par l’ABSENCE)',
  secondEtage.length > 0 && secondEtage.every((id) => !plongee.apres.includes(id)),
  JSON.stringify(secondEtage));
verifier('⑦ Les frères ont disparu (éprouvé par l’ABSENCE)',
  !plongee.apres.includes('nicol-bolas') && !plongee.apres.includes('riven'));
verifier('⑦ Le foyer lui-même n’est plus peint', !plongee.apres.includes(FOYER));
verifier('⑦ On n’a PAS changé de page', /\/omega\.html#imladrik$/.test(plongee.url),
  plongee.url);
// ④ ON SAIT OÙ L'ON EST, ET LÉO LE DIT.
verifier('⑦ Le fil d’Ariane nomme le chemin', plongee.filVisible
  && plongee.fil.includes(NOEUDS.omega.nom) && plongee.fil.includes(NOEUDS[FOYER].nom),
  `lu: « ${plongee.fil} »`);
verifier('⑦ Léo nomme le foyer au repos', plongee.paroleAuRepos === NOEUDS[FOYER].nom,
  `lu: « ${plongee.paroleAuRepos} »`);

// ---- LA RÉCURSION — « ensuite, quand on clique dessus, la suivante
//      s'applique » (Paul, 2026-08-31). Le geste doit être le MÊME à tous les
//      étages : depuis IMLADRIK isolé, cliquer ADRAMELECH descend d'un cran de
//      plus. Mesuré dans le NAVIGATEUR et pas seulement sur l'adaptateur : la
//      coque a son propre état (`isole`, le fil, l'adresse), et c'est lui qui
//      pourrait refuser un second clic sans que le module pur s'en aperçoive.
const DEUXIEME = 'adramelech';
const recursion = await pageNav.evaluate(async (cible) => {
  const scene = document.getElementById('ciel-noeud-scene');
  scene.querySelector('g.ciel-etoile[data-noeud-id="' + cible + '"]')
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 1600));
  const fil = document.querySelector('.ciel-fil');
  return {
    peints: Array.from(scene.querySelectorAll('g.ciel-etoile[data-noeud-id]'))
      .map((el) => el.getAttribute('data-noeud-id')),
    fil: fil ? fil.textContent.replace(/\s+/g, ' ').trim() : '',
    url: location.href
  };
}, DEUXIEME);
verifier('⑦ Un second clic descend encore d’un cran',
  (NOEUDS[DEUXIEME].enfants || []).every((id) => recursion.peints.includes(id))
  && recursion.peints.length === (NOEUDS[DEUXIEME].enfants || []).length,
  JSON.stringify(recursion.peints));
verifier('⑦ …et l’étage qu’on vient de quitter a disparu',
  !recursion.peints.includes('maedrethnir') && !recursion.peints.includes(DEUXIEME),
  JSON.stringify(recursion.peints));
verifier('⑦ …le fil d’Ariane compte les trois crans',
  recursion.fil.includes(NOEUDS.omega.nom)
  && recursion.fil.includes(NOEUDS[FOYER].nom)
  && recursion.fil.includes(NOEUDS[DEUXIEME].nom),
  `lu: « ${recursion.fil} »`);
verifier('⑦ …et l’adresse suit la descente',
  recursion.url.endsWith('/omega.html#' + DEUXIEME), recursion.url);
// On remonte d'un cran pour éprouver les sorties depuis l'état où elles ont été
// conçues : les mesurer depuis DEUX crans serait un autre cas, pas celui-ci.
await pageNav.keyboard.press('Escape');
await pageNav.waitForTimeout(900);

// ---- LES DEUX SORTIES. Un écran dont on ne sait pas ressortir est un piège :
//      on les éprouve toutes les deux, séparément.
await pageNav.keyboard.press('Escape');
await pageNav.waitForTimeout(900);
const apresEchap = await pageNav.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('⑦ Échap remonte à l’étage',
  CAPS.every((id) => apresEchap.includes(id)) && apresEchap.length === CAPS.length,
  JSON.stringify(apresEchap));
verifier('⑦ …et le fil se referme avec lui',
  (await pageNav.locator('.ciel-fil').isVisible()) === false);
// ---- AU CLAVIER, LE MÊME GESTE, ET LE FOCUS NE TOMBE PAS DANS LE VIDE ----
// C'est là que ça casse : le re-dessin DÉTRUIT l'étoile qu'on vient d'activer,
// et le focus retombe sur `body` — la tabulation repartirait du haut de la
// page à chaque plongée. Éprouvé au clavier et pas à la souris, pour la même
// raison que le cap « à venir » de la section B.
const auClavier = await pageNav.evaluate(async (foyer) => {
  const scene = document.getElementById('ciel-noeud-scene');
  const g = scene.querySelector('g.ciel-etoile[data-noeud-id="' + foyer + '"]');
  g.focus();
  // Le focus DÉPLIE (aperçu du contenu) : on laisse ce re-dessin-là se faire,
  // sinon on éprouverait l'isolement depuis un état que le clavier ne connaît
  // jamais.
  await new Promise((r) => setTimeout(r, 700));
  const vise = scene.querySelector('g.ciel-etoile[data-noeud-id="' + foyer + '"]');
  vise.focus();
  vise.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await new Promise((r) => setTimeout(r, 1500));
  const actif = document.activeElement;
  return {
    peints: Array.from(scene.querySelectorAll('g.ciel-etoile[data-noeud-id]'))
      .map((el) => el.getAttribute('data-noeud-id')),
    focusDansLeCiel: !!(actif && actif.hasAttribute && actif.hasAttribute('data-noeud-id')),
    focusSur: actif && actif.getAttribute ? actif.getAttribute('data-noeud-id') : null
  };
}, FOYER);
verifier('⑦ Entrée isole comme le clic',
  attenduIsole.every((id) => auClavier.peints.includes(id))
  && !auClavier.peints.includes('nicol-bolas'), JSON.stringify(auClavier.peints));
verifier('⑦ …et le focus reste DANS le ciel isolé',
  auClavier.focusDansLeCiel && auClavier.peints.includes(auClavier.focusSur),
  `focus: ${auClavier.focusSur}`);
await pageNav.keyboard.press('Escape');
await pageNav.waitForTimeout(900);

// Le fil : on replonge, et on ressort par lui.
await pageNav.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${FOYER}"]`)
  .dispatchEvent('click');
await pageNav.waitForTimeout(1500);
await pageNav.locator('.ciel-fil .ciel-fil-etape').first().click();
await pageNav.waitForTimeout(900);
const apresFil = await pageNav.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('⑦ Le fil d’Ariane ramène à l’étage', apresFil.length === CAPS.length,
  JSON.stringify(apresFil));

// ---- LA PORTE, LÀ OÙ ELLE EXISTE ENCORE : une FEUILLE ouvre bien sa page ----
// C'est ce que l'ancienne assertion garantissait, reprise à l'endroit où elle
// dit maintenant quelque chose. RIVEN est une feuille : il n'a rien à isoler,
// donc il s'ouvre. (2026-09-29 : RIVEN est désormais un cap DIRECT d'OMEGA — il
// n'est plus sous le foyer isolé —, on le clique donc depuis l'étage, où le
// fil vient de nous ramener.)
verifier('⑦ Verrou : RIVEN est bien une feuille de l\'étage OMEGA',
  !(NOEUDS.riven.enfants || []).length && CAPS.includes('riven'));
await pageNav.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="riven"]')
  .dispatchEvent('click');
await pageNav.waitForURL('**/riven.html', { timeout: 8000 }).catch(() => {});
verifier('⑦ Une FEUILLE ouvre toujours sa page (RIVEN → riven.html)',
  pageNav.url().endsWith('riven.html'), pageNav.url());
await pageNav.close();

// ===========================================================================
console.log('— E. ⑦ La géométrie SOUS isolement, et son pire cas construit —');
// Isoler change le nombre d'étoiles (3 → 5 sur IMLADRIK ; 2 → 11 sur NAGA avant
// sa suppression, le 2026-09-29) : le contrôle « rien
// ne sort du cadre » doit donc être REFAIT dans cet état, et sur un pire cas
// qu'on CONSTRUIT au lieu de l'espérer (règle du 2026-08-01) — le registre du
// jour est un échantillon favorable, et il grandira.
const pageGeo = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
brancher(pageGeo);
// Le lien direct : `omega.html#imladrik` doit ouvrir DÉJÀ isolé. C'est ce qui
// rend un ciel isolé partageable — et c'est aussi l'entrée par laquelle un
// identifiant venu du dehors atteint le module (voir la garde ci-dessous).
await pageGeo.goto(`${BASE}/omega.html#imladrik`, { waitUntil: 'load', timeout: 20000 });
await pageGeo.waitForTimeout(2200);
const parLien = await pageGeo.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('⑦ Un lien direct (#imladrik) ouvre déjà isolé',
  NOEUDS.imladrik.enfants.every((id) => parLien.includes(id))
  && parLien.length === NOEUDS.imladrik.enfants.length
  && !parLien.includes('riven') && !parLien.includes('nicol-bolas')
  && !parLien.includes('reshiram'),
  JSON.stringify(parLien));
// Les ANCIENNES adresses (#naga, #grima) ne désignent plus aucun nœud : elles
// ne doivent ni isoler quoi que ce soit ni casser la page — le ciel d'OMEGA
// s'ouvre entier (éprouvé par l'absence, sur des adresses forgées).
for (const ancien of ['naga', 'grima']) {
  const pAncien = await navigateur.newPage({ viewport: { width: 390, height: 844 } });
  brancher(pAncien);
  await pAncien.goto(`${BASE}/omega.html#${ancien}`, { waitUntil: 'load', timeout: 20000 });
  await pAncien.waitForTimeout(1800);
  const ids = await pAncien.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
    (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
  verifier(`⑦ L'ancienne adresse #${ancien} n'isole rien : le ciel d'OMEGA s'ouvre entier`,
    ids.length === CAPS.length && CAPS.every((id) => ids.includes(id)), JSON.stringify(ids));
  await pAncien.close();
}

function mesurerCadre(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#ciel-noeud-scene .ciel-svg');
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const gs = Array.from(svg.querySelectorAll('g.ciel-etoile[data-noeud-id]'));
    // Les étiquettes de constellation sont DEDANS : elles ne sont pas des
    // étoiles, et c'est en les oubliant qu'un harnais avait déclaré « 0 hors
    // cadre » pendant qu'une capture montrait un nom en travers du ciel.
    const peints = gs.concat(Array.from(svg.querySelectorAll('text.ciel-nom-amas'))
      .filter((t) => +(t.getAttribute('opacity') || '1') > 0.02));
    let dehors = 0, debordMax = -1e9;
    const coupables = [];
    peints.forEach((g) => {
      const b = g.getBBox();
      const d = Math.max(-b.x, -b.y, (b.x + b.width) - vb[2], (b.y + b.height) - vb[3]);
      if (d > 0.5) { dehors += 1; coupables.push(g.getAttribute('data-noeud-id') || g.textContent); }
      if (d > debordMax) { debordMax = d; }
    });
    // ---- LE RECOUVREMENT, et il ne se déduit PAS du cadre ----
    // Le contrôle du viewBox dit qu'une étoile est DANS l'image ; il ne dit
    // rien de ce qui est posé PAR-DESSUS. Le défaut trouvé le 2026-08-28 est
    // exactement là : sous isolement, le cartouche de Léo double de hauteur
    // (il porte le foyer entier), et LES RAPPROCHEMENTS passait dessous — avec
    // un « 0 hors cadre » parfaitement vert. On mesure donc les boîtes
    // ÉCRAN (`getBoundingClientRect`), les seules où le ciel et le mobilier
    // partagent un repère.
    const mobilier = [];
    for (const sel of ['#boussole-parole', '.ciel-fil', '.console-entete', '.console-retour']) {
      const el = document.querySelector(sel);
      if (el && !el.hidden) {
        const r = el.getBoundingClientRect();
        if (r.height > 0) { mobilier.push({ sel, r }); }
      }
    }
    const recouvertes = [];
    gs.forEach((g) => {
      const b = g.getBoundingClientRect();
      mobilier.forEach(({ sel, r }) => {
        const ox = Math.min(b.right, r.right) - Math.max(b.left, r.left);
        const oy = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
        // 2 px de tolérance : un affleurement n'est pas un recouvrement.
        if (ox > 2 && oy > 2) { recouvertes.push(g.getAttribute('data-noeud-id') + ' sous ' + sel); }
      });
    });
    return { etoiles: gs.length, dehors, debordMax, coupables, recouvertes,
      mobilierMesure: mobilier.length,
      noms: Array.from(svg.querySelectorAll('text.ciel-nom'))
        .filter((t) => +(t.getAttribute('opacity') || '1') >= 0.5).length };
  });
}
const geoReelle = await mesurerCadre(pageGeo);
chiffres.isolementReel = { etoiles: geoReelle.etoiles, noms: geoReelle.noms,
  debordMax: +geoReelle.debordMax.toFixed(1) };
verifier('⑦ Sous isolement, personne ne sort du cadre (IMLADRIK, 5 étoiles)',
  geoReelle.dehors === 0, JSON.stringify(geoReelle.coupables));
verifier('⑦ Sous isolement, chaque étoile porte son nom',
  geoReelle.noms === geoReelle.etoiles, `${geoReelle.noms}/${geoReelle.etoiles}`);
// L'instrument se vérifie sur un cas dont on connaît la réponse (règle du
// 2026-08-17) : sous isolement, le mobilier compte QUATRE boîtes — cartouche,
// fil, bandeau, retour. S'il en comptait zéro, « aucune étoile recouverte »
// serait vrai par construction et ne dirait rien.
verifier('⑦ L’instrument de recouvrement voit bien tout le mobilier',
  geoReelle.mobilierMesure === 4, `${geoReelle.mobilierMesure} boîtes mesurées`);
verifier('⑦ Aucune étoile recouverte par le mobilier',
  geoReelle.recouvertes.length === 0, JSON.stringify(geoReelle.recouvertes));

// LE PIRE CAS CONSTRUIT : un nœud à VINGT-QUATRE enfants directs — plus du
// double de ce que le registre porte aujourd'hui. Le pire cas a CHANGÉ DE FORME
// avec la règle : tant qu'on peignait deux étages, c'était « quatre têtes de
// cinq projets » ; à un seul étage, la charge maximale d'un écran isolé est le
// nombre d'enfants DIRECTS, et un arbre profond ne l'aggrave plus. Garder
// l'ancienne forme aurait mesuré 4 étoiles en croyant en mesurer 24. On le rend
// par le VRAI module dans la VRAIE coque, comme la section B pour le cap à venir.
const pire = await pageGeo.evaluate(async () => {
  // Vingt-quatre caps nommés de vingt caractères en majuscules — les plus larges
  // que le moteur accepte (il tronque à vingt). Chacun porte lui-même un enfant :
  // c'est ce qui prouve que la profondeur n'entre PLUS dans la charge de l'écran.
  const REG = { essai: { nom: 'ESSAI', enfants: ['gros', 'autre'], coeur: null, legende: null },
    gros: { nom: 'GROS', etat: 'Ouvert', resume: 'r', cible: 'omega.html', enfants: [] },
    autre: { nom: 'AUTRE', etat: 'Ouvert', resume: 'r', cible: 'omega.html' } };
  for (let t = 1; t <= 24; t += 1) {
    const idT = 'tete' + t;
    REG.gros.enfants.push(idT);
    REG[idT] = { nom: 'WWWWWWWWWWWWWWWWWWWW', etat: 'Ouvert', resume: 'r',
      cible: 'omega.html', enfants: ['sous' + t] };
    REG['sous' + t] = { nom: 'CACHE ' + t, etat: 'Ouvert', resume: 'r', cible: 'omega.html' };
  }
  window.UltimaCiel.arreter();
  document.getElementById('ciel-noeud-scene').textContent = '';
  // Le fil du rendu précédent est du mobilier orphelin : le laisser fausserait
  // la place que le nouveau ciel croit avoir.
  document.querySelectorAll('.ciel-fil').forEach((f) => f.remove());
  window.UltimaCielNoeudNoyau.rendre('essai', { noeuds: REG });
  await new Promise((r) => setTimeout(r, 700));
  document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="gros"]')
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 1800));
  return Array.from(document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')).length;
});
const geoPire = await mesurerCadre(pageGeo);
chiffres.isolementPireCas = { etoiles: pire, dehors: geoPire.dehors,
  debordMax: +geoPire.debordMax.toFixed(1) };
verifier('⑦ Pire cas construit : 24 étoiles isolées, noms de 20 caractères', pire === 24,
  `${pire} étoiles`);
verifier('⑦ Pire cas construit : personne ne sort du cadre', geoPire.dehors === 0,
  JSON.stringify(geoPire.coupables));
verifier('⑦ Pire cas construit : personne sous le mobilier',
  geoPire.recouvertes.length === 0, JSON.stringify(geoPire.recouvertes));
await pageGeo.close();

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
