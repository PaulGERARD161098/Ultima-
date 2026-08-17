// TAO — la voie (Ultima Lv3, boucle L3) : tao.html.
// L'arborescence tronc + deux branches a laissé place à la FORME UNIQUE — la
// boussole rendue par le noyau. Prouve : bandeau conforme au REGISTRE, 2 caps
// (RESHIRAM → reshiram.html, ZEKROM → zekrom.html), le cœur yin-yang + sa
// légende, la PASSERELLE tracée en ARC (jamais une corde : elle disparaîtrait
// derrière le médaillon) avec son nom « ⇄ rétroplanning » gravé dessus, le
// rétroplanning dit AUSSI par Léo dans le cartouche (l'arc est décoratif, la
// parole est annoncée), le retour vers ULTIMA, les tap targets, les contrastes
// AA, zéro requête réseau, zéro erreur console.
import { chromium } from 'playwright';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';

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
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });

// LV5 / P3 — la lecture des caps passe par le module partagé : TAO est au ciel
// depuis le 2026-08-17, et six harnais posaient la même question.
const { attendrePret, lireCaps, naviguerVers, survoler, lireRepli } =
  await import('./_caps.mjs');

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));
const externes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
});
const appelsApi = [];
await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });

console.log('— TAO : la voie, AU CIEL (LV5 / P3) —');
await page.goto(`${BASE}/tao.html`, { waitUntil: 'load', timeout: 20000 });
await attendrePret(page);

// Le bandeau suit le registre (anti-dérive de la coque).
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS.tao.surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS.tao.titre, `lu: ${principal}`);
// Plus de message de Léo affiché au repos (Paul, 2026-08-01) — test d'ABSENCE.
verifier('Invite « Léo te guide » retirée du bandeau',
  (await page.locator('.console-invite').count()) === 0);

// Les deux pôles, dans l'ordre du registre.
const attendus = capsDe('tao').map((c) => c.nom);
const caps = await lireCaps(page);
const noms = caps.map((c) => c.nom);
verifier('2 caps rendus', noms.length === 2, `trouvés: ${JSON.stringify(noms)}`);
// ASSERTION REMPLACÉE (LV5 / P3) : « les caps DANS L'ORDRE du registre » devient
// « les caps du registre, tous présents ». L'ordre est ABANDONNÉ, avec sa raison,
// déjà écrite en LV4 ④a : une constellation range par GÉOMÉTRIE, pas par liste.
// Le contrôle utile — aucune cible perdue, aucune inventée — est conservé
// entier ; c'est le tri alphabétique de la liste qui disparaît, pas la vérité.
verifier('Les caps du registre sont tous là (ordre abandonné : la géométrie range)',
  JSON.stringify([...noms].sort()) === JSON.stringify([...attendus].sort()),
  `lu: ${JSON.stringify(noms)} / attendu: ${JSON.stringify(attendus)}`);

// ASSERTIONS REMPLACÉES (LV5 / P3) — « est un lien <a> » est ABANDONNÉE, et sa
// raison est écrite depuis LV4 ④a : l'étoile est un `<g role="button">`, et
// l'ancre a été RETIRÉE parce qu'enveloppée, l'étoile perdait le focus clavier
// (mesuré : le focus retombait sur `body`). Le clavier passe avant le clic du
// milieu, et la perte est assumée en toutes lettres.
// Ce qui la remplace est une preuve PLUS FORTE qu'un attribut lu : on CLIQUE, et
// l'on vérifie où l'on arrive. Plus le repli <noscript>, qui est désormais le
// seul endroit où les `href` vivent — donc la navigation du jour où le
// JavaScript manque.
const cibles = await lireRepli(page);
for (const [id, cible] of [['reshiram', 'reshiram.html'], ['zekrom', 'zekrom.html']]) {
  verifier(`${id} : sa cible est dans le repli sans JavaScript`, cibles.includes(cible),
    `repli: ${JSON.stringify(cibles)}`);
}
{
  const pageClic = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });
  await pageClic.goto(`${BASE}/tao.html`, { waitUntil: 'load' });
  await attendrePret(pageClic);
  const arrivee = await naviguerVers(pageClic, 'reshiram');
  verifier('Cliquer RESHIRAM mène à reshiram.html (preuve par le geste)',
    !!arrivee && arrivee.endsWith('reshiram.html'), String(arrivee));
  await pageClic.close();
}
verifier('Aucun cap « à venir » (les deux pôles sont bâtis)',
  caps.filter((c) => c.avenir).length === 0);

// Le cœur yin-yang + sa légende gravée.
// ASSERTION REMPLACÉE : le cœur ne siège plus AU CENTRE. Au ciel, le centre est
// là où la caméra regarde, et un médaillon clair y lisait comme un disque gris
// plus gros que les étoiles — vu sur capture le 2026-08-13. Il descend en sceau
// dans l'angle, l'idiome de la carte savante. Le contrôle reste : la gravure du
// nœud est là.
verifier('Cœur gravé (en sceau dans l\'angle, plus au centre)',
  (await page.locator('.ciel-filigrane svg').count()) === 1);
const legende = (await page.locator('.ciel-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.tao.legende, `lu: ${legende}`);
// ASSERTION ABANDONNÉE, avec sa raison : « 2 aiguilles tracées ». L'aiguille
// joignait le moyeu de la rose à un cap ; UN CIEL N'A PAS DE MOYEU. Même
// abandon qu'en LV4 ④a, remplacé par le contrôle qu'elle approchait — une
// étoile par cap.
verifier('2 étoiles (ce que les aiguilles approchaient)',
  (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 2);

// ---- LA PASSERELLE AU CIEL : un trait entre deux étoiles, et SON NOM ----
// TROIS ASSERTIONS ABANDONNÉES ICI, avec leur raison, et c'est la même :
// « en <path> », « tracée en arc (commande A) », « milieu de l'arc hors du
// médaillon ». L'arc n'était pas un choix esthétique — il CONTOURNAIT le
// médaillon central, parce qu'une corde entre deux caps opposés passait derrière
// lui et disparaissait. **Il n'y a plus de médaillon au centre** (il est descendu
// en sceau dans l'angle) : le détour n'a plus d'objet, et le lien est le trait
// droit que le moteur tire entre deux étoiles en volume.
// Ce qui RESTE exigé, et qui était le fond de ces trois assertions : la
// passerelle existe, et elle relie les deux bons caps.
const passerelle = page.locator('.ciel-liens line[data-a="reshiram"][data-b="zekrom"]');
verifier('1 passerelle tracée entre RESHIRAM et ZEKROM', (await passerelle.count()) === 1);
verifier('Passerelle en pointillés (le motif dit le type de lien)',
  !!(await passerelle.getAttribute('stroke-dasharray')));

// SON NOM GRAVÉ — ASSERTION PORTÉE, et elle est la raison d'être de cette reprise.
// Le nom avait été PERDU au passage au ciel : l'adaptateur créait le lien et
// jetait `lienLibelle`. La fonction ④ de l'inventaire LV4 §13.1 n'était donc
// portée qu'à moitié, et la coque pilote ne pouvait pas le voir — elle n'a aucun
// cap jumeau. Rendu à sa place le 2026-08-17 (LV5 / P3).
const libelle = (await page.locator('text.ciel-nom-lien').textContent())?.trim();
verifier('Nom gravé « ⇄ rétroplanning » sur la passerelle',
  /rétroplanning/.test(libelle || ''), `lu: ${libelle}`);
// ASSERTION ABANDONNÉE : « le libellé suit le tracé (textPath) ». Un `textPath`
// sur un segment qui TOURNE en volume s'écrirait à l'envers dès que la caméra
// passe derrière — un nom illisible la moitié du temps n'est pas un nom. Il est
// posé horizontalement au milieu de l'arc, et son placement est MESURÉ ci-dessous
// au lieu d'être délégué au tracé.
const surLArc = await page.evaluate(() => {
  const t = document.querySelector('text.ciel-nom-lien');
  const l = document.querySelector('.ciel-liens line[data-a="reshiram"]');
  if (!t || !l) { return null; }
  const mx = (+l.getAttribute('x1') + +l.getAttribute('x2')) / 2;
  const my = (+l.getAttribute('y1') + +l.getAttribute('y2')) / 2;
  return { ecartX: Math.abs(+t.getAttribute('x') - mx), ecartY: Math.abs(+t.getAttribute('y') - my) };
});
verifier('Le nom est posé au milieu de la passerelle (mesuré)',
  !!surLArc && surLArc.ecartX <= 12 && surLArc.ecartY <= 14,
  surLArc ? `écart ${surLArc.ecartX.toFixed(1)} / ${surLArc.ecartY.toFixed(1)}` : 'introuvable');
// ---- LES GÉMEAUX : deux pôles EN OPPOSITION (Paul, 2026-08-17) ----
// « Mets plutôt Zekrom et Reshiram en opposé, visuellement, en mode
// constellation Castor et Pollux. » Avant, l'amas de réseau les EMPILAIT l'un
// au-dessus de l'autre — ce qui disait « une liste » là où le registre dit
// « deux pôles reliés ».
// La mesure porte sur l'ÉCART HORIZONTAL rapporté à l'écart vertical : c'est ce
// qui distingue une opposition d'un empilement, et aucune capture ne le dirait
// avec un chiffre.
const gemeaux = await page.evaluate(() => {
  const gs = Array.from(document.querySelectorAll('.ciel-etoile'))
    .filter((g) => g.getAttribute('display') !== 'none');
  if (gs.length !== 2) { return null; }
  const p = gs.map((g) => ({
    id: g.getAttribute('data-noeud-id'),
    x: +g.querySelector('.ciel-zone').getAttribute('cx'),
    y: +g.querySelector('.ciel-zone').getAttribute('cy')
  }));
  const c = window.UltimaCiel.courant().zoneUtile();
  return {
    ecartX: Math.abs(p[0].x - p[1].x),
    ecartY: Math.abs(p[0].y - p[1].y),
    // De part et d'autre du centre optique : c'est la définition de « opposé ».
    dePartEtDAutre: (p[0].x - c.centreX) * (p[1].x - c.centreX) < 0,
    largeur: c.largeur
  };
});
verifier('Les deux pôles sont OPPOSÉS, pas empilés (écart horizontal dominant)',
  !!gemeaux && gemeaux.ecartX > gemeaux.ecartY * 2,
  gemeaux ? `écart X ${gemeaux.ecartX.toFixed(0)} contre Y ${gemeaux.ecartY.toFixed(0)}` : 'introuvable');
verifier('Un pôle de chaque côté du centre',
  !!gemeaux && gemeaux.dePartEtDAutre === true);
// L'INCLINAISON EST VOULUE : parfaitement alignées, deux étoiles font un
// diagramme, pas une constellation. On exige donc qu'elles NE soient PAS sur la
// même horizontale — un critère qui interdit autant l'empilement que l'alignement.
verifier('Les pôles sont inclinés (une constellation, pas un axe)',
  !!gemeaux && gemeaux.ecartY > 8,
  gemeaux ? `écart Y ${gemeaux.ecartY.toFixed(0)}` : '');

// LE NOM N'EST PAS BARRÉ PAR LE TRAIT — mesuré perpendiculairement.
// Le premier jet décalait le nom « de 5 unités vers le haut », ce qui suffit
// pour un lien horizontal et échoue dès qu'il est incliné : depuis les Gémeaux,
// le trait traversait « ⇄ rétroplanning » au milieu des lettres (vu sur capture).
const ecartAuTrait = await page.evaluate(() => {
  const t = document.querySelector('text.ciel-nom-lien');
  const l = document.querySelector('.ciel-liens line');
  if (!t || !l) { return null; }
  const x1 = +l.getAttribute('x1'); const y1 = +l.getAttribute('y1');
  const x2 = +l.getAttribute('x2'); const y2 = +l.getAttribute('y2');
  const tx = +t.getAttribute('x'); const ty = +t.getAttribute('y');
  return Math.abs((y2 - y1) * tx - (x2 - x1) * ty + x2 * y1 - y2 * x1)
    / Math.hypot(x2 - x1, y2 - y1);
});
verifier('Le nom de la passerelle n\'est pas barré par le trait (≥ 4 unités)',
  ecartAuTrait !== null && ecartAuTrait >= 4,
  ecartAuTrait === null ? 'introuvable' : `${ecartAuTrait.toFixed(2)} unités`);

verifier('Le nom de la passerelle est LISIBLE (opacité utile)',
  +(await page.locator('text.ciel-nom-lien').getAttribute('opacity') || '1') >= 0.4);

// Retour vers ULTIMA (pièce ① du patron).
const retour = page.locator('.console-retour a[href="naga.html"]');
verifier('Retour « ↞ NAGA » vers naga.html (TAO vit sous le macro-quadrant)', (await retour.count()) === 1);
verifier('Retour libellé « NAGA »', /NAGA/.test((await retour.textContent()) || ''));

// La parole de Léo dit le rétroplanning — l'arc est décor, la parole est annoncée.
await survoler(page, 'reshiram');
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleR = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol RESHIRAM : le réel + le rétroplanning dits par Léo',
  /RESHIRAM/.test(paroleR) && /talents réels/i.test(paroleR) && /rétroplanning/i.test(paroleR),
  `lu: ${paroleR.slice(0, 140)}`);
await survoler(page, 'zekrom');
await page.waitForTimeout(200);
const paroleZ = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol ZEKROM : l\'idéal + le rétroplanning dits par Léo',
  /ZEKROM/.test(paroleZ) && /idéal/i.test(paroleZ) && /rétroplanning/i.test(paroleZ),
  `lu: ${paroleZ.slice(0, 140)}`);

// Tap targets ≥ 44 px sur les deux caps.
// ASSERTIONS REMPLACÉES : la cible du doigt n'est plus la boîte du cap mais la
// ZONE DE CAPTATION de l'étoile — un disque que le moteur maintient au-dessus
// d'un plancher, précisément pour qu'une étoile lointaine reste touchable
// (sans ce plancher, la moitié d'un réseau devient intouchable). On mesure donc
// ce disque, pas un rectangle de mise en page.
for (const id of ['reshiram', 'zekrom']) {
  const boite = await page.locator(`g.ciel-etoile[data-noeud-id="${id}"] .ciel-zone`).boundingBox();
  verifier(`Cible tactile ${id} ≥ 44 px`, Boolean(boite) && boite.height >= 44 && boite.width >= 44,
    boite ? `${boite.width.toFixed(0)}×${boite.height.toFixed(0)}` : 'introuvable');
}

// Contrastes AA sur les couleurs réellement rendues.
// CONTRASTES REMPLACÉS : le SUPPORT a changé. Les noms ne se lisent plus sur le
// parchemin d'une rose mais sur la NUIT du ciel, et le titre sur le voile de son
// cartouche. Mesurer contre `--parchemin-carte` aurait comparé une encre à un
// fond qui n'est plus derrière elle : un vert franc sur un rapport faux.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('.ciel-noeud-coque'));
  const nuit = cs.getPropertyValue('--ciel-nuit-basse').trim() || '#03070e';
  return {
    nuit,
    nom: document.querySelector('text.ciel-nom').getAttribute('fill'),
    lien: getComputedStyle(document.querySelector('text.ciel-nom-lien')).fill,
    titre: getComputedStyle(document.querySelector('.console-titre')).color,
    voile: getComputedStyle(document.querySelector('.console-entete')).backgroundColor,
    legende: getComputedStyle(document.querySelector('.ciel-legende')).color
  };
});
const rNom = ratio(styles.nom, styles.nuit);
verifier('Contraste nom d\'étoile sur la nuit ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rLien = ratio(versHex(styles.lien), styles.nuit);
verifier('Contraste nom de passerelle sur la nuit ≥ 4,5:1', rLien >= 4.5, `${rLien.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), versHex(styles.voile));
verifier('Contraste titre sur son voile ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
const rLeg = ratio(versHex(styles.legende), styles.nuit);
verifier('Contraste légende sur la nuit ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

// TAO est une coque : aucune donnée n'y transite (les chiffres vivent sur les
// pages RESHIRAM / ZEKROM, derrière auth).
verifier('Aucun appel /api (coque sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
verifier('Zéro requête réseau externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
verifier('Zéro erreur console (TAO)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE TAO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
