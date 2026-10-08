// DEUX ÉTOILES D'ATTENTE SOUS ALPHA : DOKLĚS ET SYMPHO (Paul, 27/09).
//
// Cadrage : CADRAGE-2026-09-25-carte-celeste.md §28. DOKLĚS est la marque
// « ECL by DOKLES », SYMPHO un projet professionnel ; les deux s'accrochent sous
// ALPHA, au rang de RENOBOOST IA, en ÉTOILES D'ATTENTE — un nom, un état, une phrase,
// et aucune page promise.
//
// Ce harnais tient :
//   ① LE REGISTRE : deux nœuds sous ALPHA, le nom EXACT « DOKLĚS » (Ě, e caron
//     — jamais « simplifié » en DOKLES), aucune cible ;
//   ② LA PEINTURE : les deux étoiles au ciel d'ALPHA, le texte rendu avec son Ě,
//     marquées `aria-disabled` ;
//   ③ LE TOUCHER N'OUVRE RIEN : ni navigation, ni onglet — la parole dit
//     l'état et la phrase ;
//   ④ LA DENSITÉ : ALPHA porte, une fois connecté, les étoiles du REGISTRE GREFFÉ
//     de l'agrégat réel (huit le 27/09, sept depuis le retrait d'YCOME le 28/09) ;
//     aucun nom ne doit en croiser un autre de 360 à 390 px — mesuré avant le
//     lot sur un prototype : ARTIDISPO et RENOBOOST IA se croisaient.
//
// ⛔ VU ROUGE SUR LE CODE D'AVANT. Verrous : les étoiles attendues réellement peintes,
// au moins deux noms lus avant de chercher un croisement.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';
import MACRO from '../api/_lib/finubar-macro.mjs';
import { greffer } from '../js/adaptateur-finubar.mjs';

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

// ---- ① LE REGISTRE ----
const enfantsAlpha = (NOEUDS.alpha || {}).enfants || [];
verifier('① DOKLĚS et SYMPHO sont sous ALPHA', enfantsAlpha.includes('dokles') && enfantsAlpha.includes('sympho'), enfantsAlpha.join(', '));
verifier('① le nom est « DOKLĚS », Ě compris', (NOEUDS.dokles || {}).nom === 'DOKLĚS', JSON.stringify((NOEUDS.dokles || {}).nom));
verifier('① le nom est « SYMPHO »', (NOEUDS.sympho || {}).nom === 'SYMPHO', JSON.stringify((NOEUDS.sympho || {}).nom));
for (const id of ['dokles', 'sympho']) {
  const n = NOEUDS[id] || {};
  verifier(`① ${id} : étoile d'attente (aucune page, état « À venir »)`, n.cible === null && n.etat === 'À venir' && !(n.enfants || []).length,
    `cible ${JSON.stringify(n.cible)} · ${n.etat}`);
  verifier(`① ${id} : une phrase pour le toucher`, typeof n.resume === 'string' && n.resume.length > 10, n.resume || '');
}
verifier('① le résumé d\'ALPHA les nomme', /DOKLĚS/.test((NOEUDS.alpha || {}).resume || '') && /SYMPHO/.test((NOEUDS.alpha || {}).resume || ''),
  (NOEUDS.alpha || {}).resume || '');

async function ouvrir([largeur, hauteur], { session = true } = {}) {
  const telephone = largeur < 700;
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, isMobile: telephone, hasTouch: telephone });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${largeur} console: ${m.text()}`); } });
  // Ordre voulu : Playwright essaie la DERNIÈRE route enregistrée d'abord.
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: MACRO }) }));
  await page.goto(`${BASE}/alpha.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await page.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
  });
  if (session) {
    await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
    await page.waitForTimeout(800);
    await page.evaluate(async () => {
      const m = await import('/js/leo-navigation.mjs');
      const b = document.createElement('button');
      document.body.appendChild(b);
      m.monterNavigationLeo({ bouton: b });
    });
  }
  await page.waitForTimeout(2200);
  return { page, contexte };
}

function mesurer(page) {
  return page.evaluate(() => {
    const etoiles = [...document.querySelectorAll('#ciel-noeud-scene g.ciel-etoile[data-noeud-id]')]
      .filter((g) => g.getAttribute('display') !== 'none');
    const noms = etoiles.map((g) => g.querySelector('.ciel-nom'))
      .filter((n) => n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05);
    const boites = noms.map((n) => n.getBoundingClientRect());
    const croises = [];
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) {
        const a = boites[i], b = boites[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
          croises.push(`${noms[i].textContent}×${noms[j].textContent}`);
        }
      }
    }
    const svg = document.querySelector('#ciel-noeud-scene .ciel-svg');
    const cadre = svg.getBoundingClientRect();
    const hors = boites.filter((b) => b.left < cadre.left - 0.5 || b.right > cadre.right + 0.5 || b.top < cadre.top - 0.5 || b.bottom > cadre.bottom + 0.5).length;
    // Rien de peint SOUS le mobilier haut : un nom passé au-dessus de son
    // étoile ne doit jamais se glisser sous le fil ou l'en-tête.
    const mobilier = ['body.ciel-noeud .console-entete', '.ciel-fil:not([hidden])']
      .map((s) => document.querySelector(s)).filter(Boolean).map((el) => el.getBoundingClientRect()).filter((r) => r.height > 1);
    const sousMobilier = boites.filter((b) => mobilier.some((m) => b.left < m.right && m.left < b.right && b.top < m.bottom && m.top < b.bottom)).length;
    const g = (id) => document.querySelector(`#ciel-noeud-scene g.ciel-etoile[data-noeud-id="${id}"]`);
    return {
      etoiles: etoiles.length, noms: noms.length, croises, hors, sousMobilier,
      texteDokles: g('dokles') ? g('dokles').querySelector('.ciel-nom').textContent : null,
      texteSympho: g('sympho') ? g('sympho').querySelector('.ciel-nom').textContent : null,
      desactivees: ['dokles', 'sympho'].filter((id) => g(id) && g(id).getAttribute('aria-disabled') === 'true').length,
      etiquetteDokles: g('dokles') ? (g('dokles').getAttribute('aria-label') || '') : '',
      // Combien de noms sont posés AU-DESSUS de leur étoile (ligne de base plus
      // haute que le centre de l'étoile) : le passage qui évite les croisements.
      nomsDessus: etoiles.filter((e) => {
        const n = e.querySelector('.ciel-nom'), z = e.querySelector('.ciel-zone');
        return n && z && +n.getAttribute('y') < +z.getAttribute('cy');
      }).length,
    };
  });
}

// ---- ② et ③ : SANS SESSION, au bureau ----
{
  const { page, contexte } = await ouvrir([1280, 800], { session: false });
  const m = await mesurer(page);
  verifier('② sans session : DOKLĚS peint avec son Ě', m.texteDokles === 'DOKLĚS', JSON.stringify(m.texteDokles));
  verifier('② sans session : SYMPHO peint', m.texteSympho === 'SYMPHO', JSON.stringify(m.texteSympho));
  verifier('② les deux sont marquées aria-disabled', m.desactivees === 2, `${m.desactivees}`);
  // Dry run DR (27/09) : le Ě doit survivre jusque dans ce qu'entend un lecteur
  // d'écran — l'étiquette, pas seulement le texte peint.
  verifier('② l\'étiquette lue par le lecteur d\'écran dit « DOKLĚS »', /DOKLĚS/.test(m.etiquetteDokles), m.etiquetteDokles);
  // Et au CLAVIER, une étoile d'attente ne navigue pas non plus.
  {
    const avantClavier = page.url();
    await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="dokles"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    verifier('② Entrée sur DOKLĚS : aucune navigation', page.url() === avantClavier, page.url());
  }
  // ③ Le toucher n'ouvre rien : ni navigation, ni onglet. La parole dit l'état.
  const avant = page.url();
  let onglets = 0;
  contexte.on('page', () => { onglets += 1; });
  await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="dokles"] .ciel-zone').click({ force: true });
  await page.waitForTimeout(900);
  const parole = ((await page.locator('#boussole-parole').textContent()) || '').replace(/\s+/g, ' ');
  verifier('③ toucher DOKLĚS : aucune navigation', page.url() === avant, page.url());
  verifier('③ toucher DOKLĚS : aucun onglet ouvert', onglets === 0, `${onglets}`);
  verifier('③ la parole dit DOKLĚS et « À venir »', /DOKLĚS/.test(parole) && /À venir/i.test(parole), parole.slice(0, 120));
  await contexte.close();
}

// ---- ④ LA DENSITÉ : les étoiles attendues, connecté ----
// ⛔ LE COMPTE SE DÉRIVE, IL NE SE RECOPIE PAS (28/09). Ce verrou disait « huit » :
// vrai le 27/09, faux le lendemain quand YCOME est parti — cinq rouges sur un
// écran sain, le piège déjà payé par smoke-alpha la veille. Le nombre attendu
// est celui que le produit calcule lui-même : le registre GREFFÉ de l'agrégat
// servi au navigateur (`greffer`, la fonction de la coque). Plancher : les
// trois caps d'ALPHA au registre, pour qu'un agrégat vide ne rende pas ce
// verrou vacant.
const ETOILES_ALPHA = (greffer(NOEUDS, MACRO).alpha.enfants || []).length;
verifier('④ verrou : le compte attendu couvre au moins les caps du registre',
  ETOILES_ALPHA >= NOEUDS.alpha.enfants.length && NOEUDS.alpha.enfants.length >= 3, `${ETOILES_ALPHA}`);
// ⚠️ 320 × 568 AJOUTÉ LE 08/10/2026 : la parole ne réserve plus de place au
// bas du ciel (Léo seul en bas) et, à 390 × 664, plus aucun nom n'a besoin de
// passer au-dessus de son étoile — le verrou ne pouvait plus rougir. Le cas
// serré se cherche un cran plus bas ; il porte le verrou.
for (const taille of [[390, 664], [375, 667], [360, 740], [390, 844], [320, 568], [1280, 800]]) {
  const cle = `${taille[0]}×${taille[1]}`;
  const { page, contexte } = await ouvrir(taille);
  const m = await mesurer(page);
  await contexte.close();
  chiffres[cle] = { etoiles: m.etoiles, croises: m.croises, nomsDessus: m.nomsDessus };
  if (cle === '320×568') {
    // LE VERROU DU PASSAGE AU-DESSUS : c'est à 390 × 664 que le croisement a été
    // mesuré avant le lot. Si aucun nom n'y passe au-dessus, « aucun nom croisé »
    // serait vert par une autre voie que celle qu'on croit avoir construite.
    verifier(`④ ${cle} : verrou — au moins un nom passé au-dessus de son étoile`, m.nomsDessus >= 1, `${m.nomsDessus}`);
  }
  verifier(`④ ${cle} : verrou — ${ETOILES_ALPHA} étoiles au ciel d'ALPHA (registre greffé)`, m.etoiles === ETOILES_ALPHA, `${m.etoiles}`);
  verifier(`④ ${cle} : verrou — au moins deux noms lus`, m.noms >= 2, `${m.noms}`);
  verifier(`④ ${cle} : aucun nom n'en croise un autre`, m.noms >= 2 && m.croises.length === 0, m.croises.join(', ') || '0');
  verifier(`④ ${cle} : aucun nom hors cadre`, m.noms >= 2 && m.hors === 0, `${m.hors}`);
  verifier(`④ ${cle} : aucun nom sous le mobilier haut`, m.noms >= 2 && m.sousMobilier === 0, `${m.sousMobilier}`);
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE DOKLES-SYMPHO VERT ===' : '\n=== SMOKE DOKLES-SYMPHO ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
