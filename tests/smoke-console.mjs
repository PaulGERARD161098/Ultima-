// Supra-division OMEGA (Ultima Lv3) : omega.html, ses trois caps, et IMLADRIK.
// 2026-09-29 : ex-ULTIMA (ultima.html) → OMEGA (omega.html) ; les MACRO-
// QUADRANTS GRIMA et NAGA sont SUPPRIMÉS (grima.html, naga.html n'existent
// plus, vercel.json les redirige). OMEGA porte RIVEN, NICOL BOLAS et IMLADRIK ;
// IMLADRIK ne porte que DEUX entrées depuis le 2026-09-30 : les CONSTELLATIONS
// (ARMES, DRAGONS). ADRAMELECH et TAO étaient d'abord à côté ; TAO est supprimé
// et ADRAMELECH est descendu sous DRAGONS avec RESHIRAM et ZEKROM (même jour) ;
// MAEDRETHNIR, VRANESH et DRAUKHAIN vivent sous DRAGONS, IFULVIN (étoile
// d'attente) sous ARMES.
// Prouve : bandeau conforme au REGISTRE, 3 caps, navigation OMEGA → RIVEN →
// riven.html (Ciel intact, zéro Leaflet), coque IMLADRIK complète (deux entrées)
// avec retour vers OMEGA, ABSENCE de GRIMA/NAGA, AUCUNE requête réseau externe
// (zéro CDN), zéro erreur console, contraste AA calculé sur les couleurs
// réellement rendues.
// Mode démo forcé, Leaflet/OSM stubés (pour riven.html), zéro erreur tolérée.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');

// LV5 / P3 — les coques sont au ciel (GRIMA et NAGA, supprimés depuis, l'étaient). P4 (2026-08-19) : la racine aussi —
// plus aucune page de navigation en boussole. Le module de lecture double
// support reste : VRANESH porte encore une boussole interne (P5c à venir).
const { attendrePret, lireCaps, lireRepli, naviguerVers } = await import('./_caps.mjs');

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

// ---- Contraste WCAG (mêmes formules que le reste du harnais). ----
function luminance(hex) {
  const m = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = m.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function ratio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
// rgb(...) → #hex (les couleurs calculées reviennent en rgb).
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

async function preparerRoutes(page) {
  await page.addInitScript(() => {
    // Léo (L1) : cartouche d'accueil neutralisé ici — couvert par smoke-leo-accueil.mjs.
    try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
    Object.defineProperty(window, 'ULTIMA_CONFIG', {
      value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
      writable: false,
    });
  });
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const contexte = await navigateur.newContext();
const page = await contexte.newPage();

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));

// Journal des requêtes : tout ce qui n'est pas 127.0.0.1:8123 ni data: est
// une fuite réseau interdite sur la console.
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) requetesExternes.push(url);
});

await preparerRoutes(page);

// ============ A. Le ciel OMEGA (omega.html) : RIVEN, NICOL BOLAS, IMLADRIK ============
console.log('— A. Supra-division OMEGA : RIVEN + NICOL BOLAS + IMLADRIK —');
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
// OMEGA (ex-ULTIMA) EST AU CIEL (étape ④a). Chaque assertion de cette section a
// été reprise et CLASSÉE — portée, remplacée, ou abandonnée avec sa raison.
// Le bandeau, le retour, le cartouche et le repli ne bougent pas : ils
// appartiennent à la coque, pas au moteur.
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });

// Le bandeau ne peut pas dériver du registre sans que ce harnais le voie.
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS.omega.surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS.omega.titre, `lu: ${principal}`);
// Plus de message de Léo affiché au repos (Paul, 2026-08-01) — tests d'ABSENCE.
verifier('Invite « Léo te guide » retirée du bandeau',
  (await page.locator('.console-invite').count()) === 0);
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));

// Les caps d'OMEGA, dans l'ordre du registre.
//   2026-08-01 : deux macro-quadrants (GRIMA, NAGA) — supprimés le 2026-09-29 :
//   OMEGA porte maintenant RIVEN, NICOL BOLAS et IMLADRIK.
//   2026-08-06 : ALTHEA en TROISIÈME, hors des deux devises — Paul l'a voulu
//   « tout seul, c'est un autre système ». Le nombre n'est donc plus figé à
//   deux : ce qu'on vérifie, c'est que le rendu SUIT le registre, quel que
//   soit le nombre de cadrans. Un test qui compte en dur se refait à chaque
//   dictée ; un test qui compare à la source de vérité tient.
const attendus = capsDe('omega').map((c) => c.nom);
// REMPLACÉE : les noms se lisent sur les étoiles. L'ORDRE est abandonné avec
// sa raison — une constellation range par géométrie, l'ordre du DOM y suit la
// profondeur et non le registre. On compare des ensembles ; la garantie qui
// comptait (les cadrans du registre, tous et rien qu'eux) est intacte.
const noms = (await page.locator('#ciel-noeud-scene text.ciel-nom').allTextContents())
  .map((n) => n.trim());
verifier('les cadrans rendus = ceux du registre',
  JSON.stringify(noms.slice().sort()) === JSON.stringify(attendus.slice().sort()),
  `trouvés: ${JSON.stringify(noms)}`);
// La ligne du dessus comparait bien au registre — et celle-ci figeait la liste
// juste en dessous, exactement ce que le commentaire ci-dessus interdit. Elle
// est tombée au déplacement d'ALTHEA (2026-08-07). Corrigée : ALTHEA a quitté
// cet étage, on l'éprouve donc par l'ABSENCE.
verifier('ALTHEA n’est plus un cadran d’OMEGA (il pend à la racine)',
  !attendus.includes('ALTHEA'), `lu: ${JSON.stringify(attendus)}`);
// Éprouvé par l'ABSENCE, sur le RENDU (pas seulement sur le registre) : les
// macro-quadrants supprimés n'ont ni étoile ni nom peint sur cet étage.
verifier('OMEGA : trois caps, ni GRIMA ni NAGA, ni l\'ancien nom ULTIMA',
  noms.length === 3 && !noms.some((n) => /^(GRIMA|NAGA|ULTIMA)$/.test(n)),
  JSON.stringify(noms));

// Chaque cadran est cliquable et ouvre sa porte — celles du registre, pas une
// liste recopiée à la main.
// REMPLACÉE — et c'est le portage le plus coûteux de la migration, alors il
// est écrit noir sur blanc. La boussole faisait de chaque cap un `<a href>` ;
// l'étoile du ciel est un `<g role="button">`. On a ESSAYÉ l'ancre SVG pour
// garder l'href : mesuré, elle FAIT PERDRE LE FOCUS CLAVIER à l'étoile. Le
// clavier passe avant, l'ancre est tombée.
// Ce qui est PERDU, et que personne ne doit découvrir plus tard : le clic du
// milieu, « ouvrir dans un nouvel onglet », « copier l'adresse du lien ». Ce
// qui est CONSERVÉ : le repli <noscript> liste toutes les portes, et chaque
// étoile mène bien où le registre dit — ce qu'on ne lit plus dans un attribut,
// on l'éprouve donc en CLIQUANT, ce qui est une preuve plus forte.
// ---- REMPLACÉE UNE SECONDE FOIS le 2026-08-28 (l'isolement) ----
// Depuis que ce qui CONTIENT s'isole au lieu d'ouvrir une page (Paul : « ça
// m'affiche uniquement cette constellation »), les têtes (NICOL BOLAS, IMLADRIK)
// ne naviguent plus ; seule la FEUILLE (RIVEN) ouvre sa page — section B.
// La preuve se scinde donc en deux, et AUCUNE des deux moitiés n'est perdue :
//   — ce que le clic fait maintenant : il montre la descendance SUR PLACE ;
//   — ce que la porte devient : une adresse, servie par le repli <noscript>,
//     qui reste la navigation le jour où le ciel ne se peint pas.
const tetesOmega = capsDe('omega').filter((c) => (c.enfants || []).length > 0);
verifier('OMEGA : deux têtes à isoler (NICOL BOLAS, IMLADRIK) et une feuille (RIVEN)',
  tetesOmega.map((c) => c.id).join(',') === 'nicol-bolas,imladrik'
  && !(NOEUDS.riven.enfants || []).length);
for (const attendu of tetesOmega) {
  await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
  await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${attendu.id}"]`)
    .dispatchEvent('click');
  await page.waitForTimeout(1400);
  const peints = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
    (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
  // ---- RESSERRÉE le 2026-08-31 : UN étage, pas deux ----
  // Paul, l'écran ayant vécu : « affiche-moi juste ADRAMELECH, IMLADRIK — les
  // grands thèmes ; ensuite, quand on clique dessus, la suivante s'applique ».
  // Ce qui se prouve ici change donc de forme, sans rien perdre : les enfants
  // DIRECTS sont peints, et ce qu'ils contiennent ne l'est pas — mesuré par
  // l'absence, sans quoi un retour à deux étages passerait vert.
  const themes = (NOEUDS[attendu.id].enfants || []);
  const dedans = themes.reduce((liste, id) => liste.concat(NOEUDS[id].enfants || []), []);
  verifier(`Clic ${attendu.nom} : ses grands thèmes paraissent sur place`,
    themes.every((id) => peints.includes(id)) && peints.length === themes.length,
    JSON.stringify(peints));
  verifier(`Clic ${attendu.nom} : ce qu’ils contiennent reste caché`,
    dedans.every((id) => !peints.includes(id)), JSON.stringify(dedans));
  // La moitié qui se prouve par l'ABSENCE : le frère a bien disparu.
  for (const frere of capsDe('omega').filter((c) => c.id !== attendu.id)) {
    verifier(`Clic ${attendu.nom} : ${frere.nom} a disparu du ciel`,
      !peints.includes(frere.id), JSON.stringify(peints));
  }
}
{
  await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
  const portes = await lireRepli(page);
  for (const attendu of capsDe('omega')) {
    verifier(`Porte ${attendu.cible} servie par le repli <noscript>`,
      portes.includes(attendu.cible), JSON.stringify(portes));
  }
}
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
verifier('Aucun cap inerte (aria-disabled / à venir)',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[aria-disabled]').count()) === 0);
// Éprouvé sur le REGISTRE : aucun cap de cet étage ne se déclare externe. Au
// ciel, « externe » n'est plus un attribut du DOM mais une branche du code
// (`window.open`), donc c'est la source qui fait foi.
verifier('Aucun cap externe à cet étage (tout est interne)',
  capsDe('omega').every((c) => !c.externe));

// La devise de chaque cadran tient lieu de badge (dictée : le sous-titre).
// REMPLACÉE : la devise était un badge peint en permanence sous le cap ; au
// ciel elle est DITE par Léo quand on approche l'étoile. Même information, même
// source (le registre), autre moment. On la lit donc là où elle se donne.
async function etatDe(id) {
  await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"]`)
    .dispatchEvent('mouseenter');
  await page.waitForTimeout(150);
  return (await page.locator('#boussole-parole .parole-etat').textContent())?.trim();
}
// 2026-09-29 : les devises « Ce qui est utile » / « Ce qui fait grandir »
// allaient avec GRIMA et NAGA — elles disparaissent avec eux. Chaque cap dit
// désormais l'état de son registre, et aucune ancienne devise ne subsiste.
for (const c of capsDe('omega')) {
  verifier(`${c.nom} — badge = état du registre (« ${c.etat} »)`, (await etatDe(c.id)) === c.etat);
}
verifier('Aucune ancienne devise de macro-quadrant dans le registre',
  !/Ce qui est utile|Ce qui fait grandir/.test(JSON.stringify(NOEUDS)));

// Le cœur gravé + sa légende (pièce ④ du patron).
// REMPLACÉE : le cœur n'est plus au centre du plateau — le centre, au ciel,
// est là où la caméra regarde. Il est gravé en sceau dans l'angle. La fonction
// (l'identité gravée du nœud est présente) est tenue, sa place change.
verifier('Cœur gravé au centre', (await page.locator('.ciel-filigrane svg').count()) === 1);
const legende = (await page.locator('.ciel-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.omega.legende, `lu: ${legende}`);
// ABANDONNÉE, ET VOICI POURQUOI. L'aiguille joignait le CENTRE de la rose à
// chaque cap : elle disait « ceci part d'ici ». Un ciel n'a pas de centre d'où
// partir — les étoiles ne rayonnent pas d'un moyeu, elles occupent un volume.
// L'assertion ne perd aucune garantie de navigation : « une aiguille par
// cadran » vérifiait que la géométrie suit le registre, et c'est exactement ce
// que fait, plus directement, « les cadrans rendus = ceux du registre »
// ci-dessus. On la remplace donc par le contrôle qu'elle approchait.
// LE COMPTE SE LIT SUR UN CIEL AU REPOS. Un survol DÉPLIE le cap approché et
// fait naître ses enfants : compter après avoir survolé, c'est compter deux
// étages. On repart donc d'une page neuve — trouvé en voyant ce contrôle
// tomber juste après les contrôles de devise, qui survolent.
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
verifier('une étoile par cadran, ni plus ni moins',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id]').count()) === attendus.length,
  `${attendus.length} attendues`);

// Retour vers la racine (pièce ① du patron).
verifier('Retour vers la boussole racine',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// La parole de Léo au survol d'un cadran : la devise et le contenu.
// `hover()` EXPIRE sur le ciel : la caméra glisse de façon asymptotique, donc
// aucun élément n'est jamais « stable » au sens de Playwright. On envoie
// l'événement, comme partout ailleurs dans le patrimoine.
const capNicol = page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="nicol-bolas"]');
await capNicol.dispatchEvent('mouseenter');
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const parole = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol NICOL BOLAS : la parole de Léo se dépose',
  /NICOL BOLAS/.test(parole) && /pilotage financier/i.test(parole) && /échéancier/i.test(parole),
  `lu: ${parole.slice(0, 120)}`);

// REMPLACÉE : le blason était peint en permanence sur chaque cap ; au ciel il
// est gravé dans le cartouche au moment où l'on approche l'étoile — un ciel de
// nuit ne porte pas de disques de parchemin clair sans cesser d'être un ciel.
// La garantie tenue est la même et se vérifie cap par cap : CHACUN a sa
// gravure, et chacune est étiquetée pour le lecteur d'écran.
const blasons = [];
for (const c of capsDe('omega')) {
  await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${c.id}"]`)
    .dispatchEvent('mouseenter');
  await page.waitForTimeout(150);
  blasons.push(await page.locator('#boussole-parole .parole-blason svg')
    .getAttribute('aria-label').catch(() => null));
}
verifier('un blason étiqueté par cadran',
  blasons.length === attendus.length && blasons.every((l) => l && /Blason/i.test(l)),
  JSON.stringify(blasons));

// PORTÉE. Le focus vit sur le GROUPE de l'étoile : c'est lui qui porte
// `tabindex="0"`, le nom accessible et la touche Entrée. L'ancre qui l'enveloppe
// est en `tabindex="-1"` exprès — sans quoi la tabulation s'arrêterait deux
// fois sur le même cadran.
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
const etoileImladrik = page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="imladrik"]');
await etoileImladrik.evaluate((el) => el.focus());
verifier('Cadran focusable au clavier',
  await etoileImladrik.evaluate((el) => el === document.activeElement));

// Contraste AA sur les couleurs réellement rendues.
// REMPLACÉ : ce bloc lisait `.cap-nom` et `.cap-etat` sur du PARCHEMIN. La
// coque est passée au ciel : le nom du cadran est peint sur une étoile, la
// devise se lit dans le cartouche, et le fond est une nuit. Les mêmes
// grandeurs sont donc mesurées, contre le fond qui les porte réellement —
// changer d'étalon sans changer de fond aurait donné un chiffre flatteur et
// faux. Le seuil, lui, ne bouge pas : AA, 4,5:1.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const plateau = getComputedStyle(document.getElementById('ciel-noeud-plateau'));
  const nom = document.querySelector('#ciel-noeud-scene text.ciel-nom');
  const etat = document.querySelector('#boussole-parole .parole-etat');
  const t = getComputedStyle(document.querySelector('.console-titre'));
  return {
    nuit: plateau.getPropertyValue('--ciel-nuit-haute').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom ? getComputedStyle(nom).fill : null,
    titre: t.color,
    etat: etat ? getComputedStyle(etat).color : null,
  };
});
const rNom = ratio(versHex(styles.nom), styles.nuit);
verifier('Contraste nom de cadran ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rEtat = ratio(versHex(styles.etat), styles.nuit);
verifier('Contraste devise (cartouche) ≥ 4,5:1', rEtat >= 4.5, `${rEtat.toFixed(2)}:1`);
// Le titre est désormais posé sur la nuit, plus sur la mer.
const rTitre = ratio(versHex(styles.titre), styles.nuit);
verifier('Contraste titre sur fond de nuit ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (OMEGA)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ============ B. Navigation OMEGA → RIVEN (riven.html) ============
console.log('— B. La coque OMEGA, puis RIVEN → riven.html (carte) —');
// REMPLACÉE le 2026-09-29 : la coque `grima.html` n'existe plus. RIVEN, qui en
// était le premier cap, est désormais un cap direct d'OMEGA : c'est depuis
// `omega.html` que son clic est éprouvé. La coque est rouverte par son ADRESSE
// (celle que sert le repli <noscript>), pour un état neuf.
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
verifier('La coque OMEGA s’ouvre (omega.html)', /\/omega\.html$/.test(page.url()), page.url());
await attendrePret(page);

const surligneOmega = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const titreOmega = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('OMEGA : surligne = celle du registre (« Supra-division Omega »)',
  surligneOmega === NOEUDS.omega.surligne && surligneOmega === 'Supra-division Omega', `lu: ${surligneOmega}`);
verifier('OMEGA : titre = celui du registre', titreOmega === NOEUDS.omega.titre, `lu: ${titreOmega}`);

const attendusOmega = capsDe('omega').map((c) => c.nom);
const capsOmega = await lireCaps(page);
const nomsOmega = capsOmega.map((c) => c.nom);
// Même scission que pour IMLADRIK plus bas : la déclaration du registre est
// conservée, l'ordre du DOM est abandonné (la géométrie range).
verifier('OMEGA : le registre déclare RIVEN + NICOL BOLAS + IMLADRIK dans cet ordre',
  JSON.stringify(attendusOmega) === JSON.stringify(['RIVEN', 'NICOL BOLAS', 'IMLADRIK']),
  `registre: ${JSON.stringify(attendusOmega)}`);
verifier('OMEGA : les trois caps sont rendus (ordre abandonné)',
  JSON.stringify([...nomsOmega].sort()) === JSON.stringify([...attendusOmega].sort()),
  `lu: ${JSON.stringify(nomsOmega)}`);
// Les portes se lisent dans le repli <noscript> : au ciel, l'étoile n'est pas
// une ancre et c'est là que les `href` vivent désormais.
const hrefsOmega = await lireRepli(page);
for (const attendu of ['riven.html', 'bcp.html', 'imladrik.html']) {
  verifier(`OMEGA : porte ouverte vers ${attendu}`, hrefsOmega.includes(attendu), JSON.stringify(hrefsOmega));
}
verifier('OMEGA : aucune porte vers une page disparue (grima / naga / ultima)',
  hrefsOmega.length > 0 && !hrefsOmega.some((h) => /^(grima|naga|ultima)\.html/.test(h)),
  JSON.stringify(hrefsOmega));
const legendeOmega = (await page.locator('.ciel-legende').textContent())?.trim();
verifier('OMEGA : légende gravée « le personnel »', legendeOmega === NOEUDS.omega.legende && legendeOmega === 'le personnel', `lu: ${legendeOmega}`);
verifier('OMEGA : retour vers la racine (« ↞ » vers /)',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// RIVEN navigue toujours vers la carte : zéro régression sur l'acquis.
const erreursRiven = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursRiven.push(msg.text()); });
// LE CLIC, pas l'attribut : c'est la preuve qui reste quand l'ancre disparaît.
await naviguerVers(page, 'riven');
await page.waitForURL('**/riven.html', { timeout: 20000 });
verifier('Clic RIVEN → URL riven.html', /\/riven\.html$/.test(page.url()), page.url());

// L'app démarre : cartouche Ultima visible (classe CSS du produit, inchangée).
await page.waitForSelector('.cartouche-ultima', { timeout: 20000 });
verifier('App bootée (cartouche Ultima)', await page.locator('.cartouche-ultima').isVisible());

// LA CARTE EST SUPPRIMÉE (2026-08-13) : ce qui s'ouvrait ici était l'onglet
// Carte et sa Leaflet. Le CIEL est la seule forme du réseau — c'est lui qui
// doit se peupler, et aucune trace de Leaflet ne doit subsister dans la page.
await page.locator('.onglet[data-onglet="ciel"]').click();
await page.waitForSelector('#ciel-scene .ciel-svg', { timeout: 20000 });
verifier('Ciel rendu depuis la console (zéro régression)',
  await page.locator('#ciel-scene .ciel-etoile').count() >= 1);
verifier('Plus aucune Leaflet dans la page',
  await page.locator('.leaflet-container').count() === 0 &&
  await page.evaluate(() => typeof window.L === 'undefined'));
verifier('Zéro erreur console (riven.html)', erreursRiven.length === 0, erreursRiven.slice(0, 3).join(' | '));

// ============ C. La coque IMLADRIK (imladrik.html) — deux entrées ============
console.log('— C. IMLADRIK → imladrik.html (deux entrées : ARMES, DRAGONS) —');
const erreursImladrik = [];
const pageImladrik = await contexte.newPage();
pageImladrik.on('console', (msg) => { if (msg.type() === 'error') erreursImladrik.push(msg.text()); });
pageImladrik.on('pageerror', (err) => erreursImladrik.push(String(err)));
await preparerRoutes(pageImladrik);
await pageImladrik.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
await attendrePret(pageImladrik);

const surligneImladrik = (await pageImladrik.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const titreImladrik = (await pageImladrik.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('IMLADRIK : surligne = celle du registre', surligneImladrik === NOEUDS.imladrik.surligne, `lu: ${surligneImladrik}`);
verifier('IMLADRIK : titre = celui du registre', titreImladrik === NOEUDS.imladrik.titre, `lu: ${titreImladrik}`);

const attendusImladrik = capsDe('imladrik').map((c) => c.nom);
const capsImladrik = await lireCaps(pageImladrik);
const nomsImladrik = capsImladrik.map((c) => c.nom);
// ASSERTION SCINDÉE (LV5 / P3), et c'est plus juste que de l'abandonner en bloc :
// elle portait DEUX garanties de natures différentes.
//   ① Le REGISTRE déclare bien ces deux entrées, dans cet ordre. Cela ne dépend
//      d'aucun support de rendu : la garantie reste entière et elle protège
//      contre une modification involontaire du registre. **Conservée.**
//   ② Le DOM les rend dans le même ordre. Au ciel, l'ordre est celui de la
//      GÉOMÉTRIE, pas celui de la liste (abandon acté en LV4 ④a). **Abandonnée**,
//      remplacée par « tous présents, aucun de plus ».
// 2026-09-30 : cinq caps à plat → QUATRE entrées (deux constellations sans page,
// ADRAMELECH, TAO) → DEUX entrées le même jour (les constellations ARMES et
// DRAGONS ; TAO supprimé, ADRAMELECH descendu sous DRAGONS avec RESHIRAM et
// ZEKROM). Les trois dragons n'ont pas disparu : ils sont exigés plus bas, sous la
// constellation DRAGONS.
verifier('IMLADRIK : le registre déclare ARMES + DRAGONS dans cet ordre, et rien d\'autre',
  JSON.stringify(attendusImladrik) === JSON.stringify(['ARMES', 'DRAGONS']),
  `registre: ${JSON.stringify(attendusImladrik)}`);
verifier('IMLADRIK : les deux entrées sont rendues (ordre abandonné : la géométrie range)',
  JSON.stringify([...nomsImladrik].sort()) === JSON.stringify([...attendusImladrik].sort())
  && nomsImladrik.length === 2,
  `lu: ${JSON.stringify(nomsImladrik)}`);
const hrefsImladrik = await lireRepli(pageImladrik);
// Le repli sans JavaScript porte TOUJOURS les pages — SIX désormais : les dragons y
// sont dans une sous-liste, mais ils y sont (les trois historiques, ADRAMELECH, et
// les deux pôles de l'ex-TAO). TAO, lui, n'y est plus : son ABSENCE est exigée sous
// le verrou de ces six lectures.
for (const attendu of ['maedrethnir.html', 'vranesh.html', 'draukhain.html', 'adramelech.html',
  'reshiram.html', 'zekrom.html']) {
  verifier(`IMLADRIK : porte ouverte vers ${attendu}`, hrefsImladrik.includes(attendu), JSON.stringify(hrefsImladrik));
}
verifier('IMLADRIK : plus aucune porte vers tao.html (sous verrou : six portes lues)',
  hrefsImladrik.length === 6 && !hrefsImladrik.some((h) => /tao/i.test(h)), JSON.stringify(hrefsImladrik));
// « aiguilles » ABANDONNÉES — un ciel n'a pas de moyeu (même abandon qu'en LV4
// ④a). Remplacées par ce qu'elles approchaient : une étoile par entrée.
verifier('IMLADRIK : 2 étoiles (ce que les aiguilles approchaient)',
  (await pageImladrik.locator('g.ciel-etoile[data-noeud-id]').count()) === 2);
const legendeImladrik = (await pageImladrik.locator('.ciel-legende').textContent())?.trim();
verifier('IMLADRIK : légende gravée « Kalamn-talaen »', legendeImladrik === NOEUDS.imladrik.legende, `lu: ${legendeImladrik}`);
verifier('IMLADRIK : retour « ↞ OMEGA » vers omega.html',
  (await pageImladrik.locator('.console-retour a[href="omega.html"]').count()) === 1);
verifier('IMLADRIK : plus aucun retour vers naga.html ni ultima.html',
  (await pageImladrik.locator('a[href="naga.html"], a[href="ultima.html"], a[href="grima.html"]').count()) === 0);

// LES SIX ÉTOILES DES DRAGONS, SOUS LEUR CONSTELLATION. Ils ne sont plus des
// enfants directs d'IMLADRIK : on les exige là où ils vivent —
// `imladrik.html#constellation-dragons`, l'adresse même que leurs pages reprennent
// en « retour ».
await pageImladrik.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
await attendrePret(pageImladrik);
await pageImladrik.waitForTimeout(1200);
const capsDragons = await lireCaps(pageImladrik);
verifier('IMLADRIK#constellation-dragons : MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM, ZEKROM paraissent (et eux seuls)',
  JSON.stringify(capsDragons.map((c) => c.nom).sort())
    === JSON.stringify(['ADRAMELECH', 'DRAUKHAIN', 'MAEDRETHNIR', 'RESHIRAM', 'VRANESH', 'ZEKROM'])
  && capsDragons.length === NOEUDS['constellation-dragons'].enfants.length,
  JSON.stringify(capsDragons.map((c) => c.nom)));
verifier('IMLADRIK#constellation-dragons : 6 étoiles au ciel',
  (await pageImladrik.locator('g.ciel-etoile[data-noeud-id]').count()) === 6);
// ADRAMELECH garde son état « Privé » sur son nouveau cadran (déplacé du premier
// niveau d'IMLADRIK, où il vivait, vers les DRAGONS — la garantie suit l'étoile).
verifier('IMLADRIK#constellation-dragons : ADRAMELECH marqué « Privé »',
  // L'ÉTAT NE S'ÉCRIT PLUS SOUS LE CAP : au ciel, il vit dans l'étiquette
  // accessible de l'étoile (`aria-label`), qui est la source de vérité pour qui
  // n'y voit pas. C'est un meilleur endroit pour le mesurer qu'un `<span>` de
  // style — et le seul qui existe encore.
  /priv/i.test((await pageImladrik.locator('g.ciel-etoile[data-noeud-id="adramelech"]')
    .getAttribute('aria-label')) || ''));

verifier('Zéro erreur console (IMLADRIK)', erreursImladrik.length === 0, erreursImladrik.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE OMEGA (SUPRA-DIVISION) VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
