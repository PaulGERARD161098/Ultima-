// LE SOCLE — rien ne se recouvre au bas de l'accueil (26/09, capture de Paul).
//
// Ce que Paul a vu, sur RENOBOOST IA isolé, session ouverte : le cartouche de
// parole passait SOUS le dock de Léo, et une étoile passait SOUS le cartouche.
// « Beaucoup de chevauchements, je ne suis pas fan. »
//
// La cause, lue dans le code : `css/finubar-bandeau.css` pose la parole à
// « hauteur du bandeau + 12 px », et `css/leo.css` pose le dock… exactement au
// même endroit. Le cadrage du ciel (`margesDuMobilier`) ignorait le dock.
//
// Ce harnais reproduit l'écran de Paul — index, session, greffe Finubar avec
// SIX dépôts sous RENOBOOST IA, dock de Léo monté — et mesure trois choses :
//   ① aucune pièce du mobilier n'en recouvre une autre ;
//   ② aucune étoile, ni son nom, n'est sous une pièce du mobilier ;
//   ③ la recommandation de Léo n'est dite qu'UNE fois (dock OU bandeau).
// Et une quatrième, qui est le garde-fou du lot 1 : survoler une étoile ne
// déplace AUCUNE étoile (sinon le clic exact redevient un clic raté).
//
// ⛔ VU ROUGE SUR LE CODE D'AVANT. Verrous de non-vacuité avant toute recherche
// d'absence : le dock, le bandeau et au moins trois étoiles doivent être là.
//
// ⚠️ LE DOCK EST MONTÉ PAR LE HARNAIS. `js/leo-partout.js` ne le pose qu'avec
// une VRAIE session Supabase, que le bac à sable n'a pas ; on appelle donc
// `monterNavigationLeo` comme lui. Ce qui est éprouvé est la mise en page, pas
// la condition de montage.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  // Un nom déjà pris est une faute du HARNAIS : il écraserait un verdict.
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

// Six astres sous RENOBOOST IA, aux noms de la LONGUEUR des vrais (le plus long
// fait 17 caractères) ; contenu inventé, comme la fixture qu'il réemploie.
const NOMS = ['Projet Agenda', 'Projet Devis', 'Projet Predict', 'Projet Boost', 'Projet Console-web'];
const agregat = JSON.parse(JSON.stringify(AGREGAT));
agregat.projets = NOMS.map((nom, i) => {
  const p = JSON.parse(JSON.stringify(AGREGAT.projets[i % 4]));
  p.depot = 'exemple/' + i; p.ciel = 'renoboost-ia';
  p.grain = Object.assign({}, p.grain, { projet: nom, depot: 'exemple/' + i });
  return p;
}).concat([AGREGAT.projets[4]]);
agregat.cartouche.action.projet = NOMS[0];

async function ouvrir([largeur, hauteur]) {
  const telephone = largeur < 700;
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, hasTouch: telephone, isMobile: telephone });
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
    const s = document.querySelector('.boussole-scene');
    if (s) { s.removeAttribute('inert'); }
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
  await page.mouse.move(2, 2);
  await page.waitForTimeout(600);
}

function mesurer(page) {
  return page.evaluate(() => {
    const boite = (el) => {
      if (!el) { return null; }
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) { return null; }
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 ? { x: b.left, y: b.top, r: b.right, b: b.bottom } : null;
    };
    const mobilier = {
      entete: boite(document.querySelector('body.ciel-noeud .console-entete')),
      fil: boite(document.querySelector('.ciel-fil')),
      parole: boite(document.getElementById('boussole-parole')),
      dock: boite(document.getElementById('leo-dock')),
      bandeau: boite(document.getElementById('finubar-bandeau')),
    };
    const pieces = Object.keys(mobilier).filter((k) => mobilier[k]);
    const inter = (a, b) => a.x < b.r - 0.5 && b.x < a.r - 0.5 && a.y < b.b - 0.5 && b.y < a.b - 0.5;
    const entre = [];
    for (let i = 0; i < pieces.length; i++) {
      for (let j = i + 1; j < pieces.length; j++) {
        if (inter(mobilier[pieces[i]], mobilier[pieces[j]])) { entre.push(pieces[i] + '×' + pieces[j]); }
      }
    }
    const sous = [];
    const etoiles = [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')];
    etoiles.forEach((g) => {
      const c = g.querySelector('.ciel-coeur, circle[fill="#ffffff"]') || g.querySelector('.ciel-zone');
      const cb = c.getBoundingClientRect();
      const coeur = { x: cb.left, y: cb.top, r: cb.right, b: cb.bottom };
      const t = g.querySelector('text.ciel-nom');
      const nb = t ? t.getBoundingClientRect() : null;
      const nom = nb && nb.width ? { x: nb.left, y: nb.top, r: nb.right, b: nb.bottom } : null;
      pieces.forEach((k) => {
        if (inter(coeur, mobilier[k]) || (nom && inter(nom, mobilier[k]))) { sous.push(g.dataset.noeudId + '×' + k); }
      });
    });
    // ③ La recommandation, dite combien de fois À L'ÉCRAN ?
    const action = document.querySelector('#finubar-bandeau .fb-action');
    const dock = document.getElementById('leo-dock');
    const dites = (boite(action) ? 1 : 0) + (dock && dock.classList.contains('leo-dock--proactif') && boite(dock) ? 1 : 0);
    const centres = etoiles.map((g) => {
      const z = g.querySelector('.ciel-zone').getBoundingClientRect();
      return [g.dataset.noeudId, Math.round(z.x + z.width / 2), Math.round(z.y + z.height / 2)];
    });
    const haut = Math.max(0, ...['entete', 'fil'].filter((k) => mobilier[k]).map((k) => mobilier[k].b));
    const bas = Math.min(innerHeight, ...['parole', 'dock', 'bandeau'].filter((k) => mobilier[k]).map((k) => mobilier[k].y));
    return { pieces, entre, sous, dites, etoiles: etoiles.length, centres, ciel: Math.round(bas - haut), hash: location.hash };
  });
}

const TAILLES = [[1872, 850], [1280, 800], [390, 844]];
for (const taille of TAILLES) {
  const { page, contexte } = await ouvrir(taille);
  for (const ecran of ['racine', 'alpha', 'renoboost-ia']) {
    if (ecran !== 'racine') { await isoler(page, ecran); }
    const cle = `${ecran}@${taille[0]}`;
    const m = await mesurer(page);
    chiffres[cle] = { ciel: m.ciel, etoiles: m.etoiles, pieces: m.pieces.join(',') };
    verifier(`${cle} : verrou — dock, bandeau et ≥ 2 étoiles présents`,
      m.pieces.includes('dock') && m.pieces.includes('bandeau') && m.etoiles >= 2, `${m.pieces.join(',')} · ${m.etoiles} étoiles`);
    if (ecran === 'renoboost-ia') {
      verifier(`${cle} : verrou — l'écran de Paul (RENOBOOST IA isolé, ≥ 5 dépôts)`,
        m.hash === '#renoboost-ia' && m.etoiles >= 6, `${m.hash} · ${m.etoiles}`);
    }
    verifier(`${cle} : aucune pièce du mobilier n'en recouvre une autre`, m.entre.length === 0, m.entre.join(' ') || '0');
    verifier(`${cle} : aucune étoile ni aucun nom sous le mobilier`, m.sous.length === 0, m.sous.join(' ') || '0');
    verifier(`${cle} : la recommandation de Léo n'est dite qu'une fois`, m.dites === 1, `${m.dites}`);
  }
  // ④ Le survol ne déplace rien — au bureau seulement : un téléphone ne survole pas.
  if (taille[0] > 700) {
    const avant = await mesurer(page);
    const [id, x, y] = avant.centres[0];
    await page.mouse.move(x, y);
    await page.waitForTimeout(900);
    const apres = await mesurer(page);
    const bouge = apres.centres.filter((c, i) => Math.hypot(c[1] - avant.centres[i][1], c[2] - avant.centres[i][2]) > 2).length;
    verifier(`survol@${taille[0]} : survoler ${id} ne déplace aucune étoile`, bouge === 0, `${bouge} déplacée(s)`);
    verifier(`survol@${taille[0]} : le cartouche du survol ne recouvre rien`,
      apres.entre.length === 0 && apres.sous.length === 0, [...apres.entre, ...apres.sous].join(' ') || '0');
  }
  await contexte.close();
}

// ⑤ UNE COQUE SANS BANDEAU, et un redimensionnement (dry run du 26/09).
// Le socle n'a pas toujours trois étages : hors de l'accueil, pas de bandeau
// Finubar, et la parole doit alors se poser au-dessus du dock SEUL. Ce cas ne
// passait par aucun contrôle — il tenait, mais personne ne le savait.
// Puis 1280 → 390 → 1280 : la hauteur du dock change (58 → 68 px mesurés),
// sa variable doit suivre, et la parole avec elle.
{
  const contexte = await navigateur.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`naga pageerror: ${e.message}`));
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.goto(`${BASE}/ultima.html#naga`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await page.evaluate(async () => {
    const m = await import('/js/leo-navigation.mjs');
    const b = document.createElement('button');
    document.body.appendChild(b);
    m.monterNavigationLeo({ bouton: b });
  });
  // ⚠️ L'ÉTAPE EST DANS LE NOM, et c'est un garde-fou : les verdicts vivent
  // dans un objet indexé par leur nom. Deux passages à 1280 sous le même nom,
  // et le second ÉCRASAIT le premier — un rouge à l'aller effacé par un vert
  // au retour. Trouvé au dry run du 26/09 : 3 lignes ❌, « 2 rouges ».
  const etapes = [[1280, 800], [390, 844], [1280, 800]];
  for (const [rang, [largeur, hauteur]] of etapes.entries()) {
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.waitForTimeout(1500);
    const m = await mesurer(page);
    const cle = `NAGA sans bandeau, étape ${rang + 1} @${largeur}`;
    verifier(`${cle} : verrou — parole et dock présents, pas de bandeau`,
      m.pieces.includes('parole') && m.pieces.includes('dock') && !m.pieces.includes('bandeau') && m.etoiles >= 2,
      m.pieces.join(','));
    verifier(`${cle} : rien ne se recouvre, aucune étoile sous le socle`,
      m.entre.length === 0 && m.sous.length === 0, [...m.entre, ...m.sous].join(' ') || '0');
  }
  await contexte.close();
}

// ⑥ LE TÉLÉPHONE À LA HAUTEUR RÉELLE DE SAFARI (capture de Paul, 26/09, 16:19).
// 844 px est la hauteur de l'ÉCRAN, pas de la page : barres de Safari
// déduites, il en reste ~664 (667 sur un petit iPhone). À cette hauteur, le
// bandeau Finubar déplié prenait 200 px et le ciel n'en gardait que ~180.
// Au téléphone, le bandeau se REPLIE donc sur son en-tête (nom, date,
// compte) : les signaux s'ouvrent d'un toucher, et le ciel reprend sa place.
// Sur ordinateur, rien ne change — la liste reste ouverte, sans bouton.
for (const taille of [[390, 664], [375, 667]]) {
  const { page, contexte } = await ouvrir(taille);
  const cle = `téléphone ${taille[0]}×${taille[1]}`;
  const etat = () => page.evaluate(() => {
    const b = document.querySelector('#finubar-bandeau .fb-deplier');
    const l = document.querySelector('#finubar-bandeau .fb-signaux');
    const vu = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
    return {
      bouton: vu(b), attendu: b ? b.getAttribute('aria-expanded') : null,
      controle: b ? b.getAttribute('aria-controls') : null, idListe: l ? l.id : null,
      cible: b ? Math.round(b.getBoundingClientRect().height) : 0,
      liste: vu(l), bandeau: Math.round(document.getElementById('finubar-bandeau').getBoundingClientRect().height),
    };
  });
  const replie = await etat();
  const m1 = await mesurer(page);
  chiffres[cle] = { replie: replie.bandeau, ciel: m1.ciel };
  verifier(`${cle} : verrou — bandeau, dock et ≥ 3 étoiles`, m1.pieces.includes('bandeau') && m1.pieces.includes('dock') && m1.etoiles >= 3,
    `${m1.pieces.join(',')} · ${m1.etoiles}`);
  verifier(`${cle} : le bandeau s'ouvre REPLIÉ (bouton visible, liste cachée)`,
    replie.bouton && replie.attendu === 'false' && !replie.liste, JSON.stringify(replie));
  verifier(`${cle} : le bouton dit ce qu'il ouvre (aria-controls = la liste)`,
    !!replie.controle && replie.controle === replie.idListe, `${replie.controle} / ${replie.idListe}`);
  verifier(`${cle} : cible tactile ≥ 40 px`, replie.cible >= 40, `${replie.cible}`);
  verifier(`${cle} : le ciel garde au moins 260 px`, m1.ciel >= 260, `${m1.ciel} px`);
  verifier(`${cle} : replié, rien ne se recouvre`, m1.entre.length === 0 && m1.sous.length === 0, [...m1.entre, ...m1.sous].join(' ') || '0');
  await page.locator('#finubar-bandeau .fb-deplier').tap();
  await page.waitForTimeout(1200);
  const deplie = await etat();
  const m2 = await mesurer(page);
  verifier(`${cle} : un toucher déplie les signaux`, deplie.attendu === 'true' && deplie.liste, JSON.stringify(deplie));
  verifier(`${cle} : déplié, rien ne se recouvre`, m2.entre.length === 0 && m2.sous.length === 0, [...m2.entre, ...m2.sous].join(' ') || '0');
  // Une chose à la fois : les signaux ouverts mettent le dock de côté — mesuré
  // le 26/09, avec les deux, une étoile passait sous le dock (signaux à 44 px).
  verifier(`${cle} : déplié, le dock se met de côté`, !m2.pieces.includes('dock'), m2.pieces.join(','));
  await page.locator('#finubar-bandeau .fb-deplier').tap();
  await page.waitForTimeout(800);
  const rereplie = await etat();
  verifier(`${cle} : un second toucher replie`, rereplie.attendu === 'false' && !rereplie.liste, JSON.stringify(rereplie));
  const m3 = await mesurer(page);
  verifier(`${cle} : replié, le dock revient et rien ne se recouvre`,
    m3.pieces.includes('dock') && m3.entre.length === 0 && m3.sous.length === 0, `${m3.pieces.join(',')} ${[...m3.entre, ...m3.sous].join(' ')}`);
  await contexte.close();
}
// Et l'ordinateur, témoin : la liste ouverte, aucun bouton.
{
  const { page, contexte } = await ouvrir([1280, 800]);
  const r = await page.evaluate(() => {
    const b = document.querySelector('#finubar-bandeau .fb-deplier');
    const l = document.querySelector('#finubar-bandeau .fb-signaux');
    return { bouton: !!b && getComputedStyle(b).display !== 'none', liste: !!l && getComputedStyle(l).display !== 'none' };
  });
  await contexte.close();
  verifier('ordinateur : la liste reste ouverte et le bouton n\'existe pas à l\'écran', r.liste && !r.bouton, JSON.stringify(r));
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE SOCLE VERT ===' : '\n=== SMOKE SOCLE ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
