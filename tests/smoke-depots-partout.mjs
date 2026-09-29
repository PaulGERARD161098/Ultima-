// LES DÉPÔTS PARTOUT — lot 3 de CADRAGE-2026-09-25-carte-celeste.md (§14.3).
//
// Constat M5 (25/09) : un lien partagé vers un dépôt — `alpha.html#renoboost-ia`
// — s'ouvrait sur ALPHA entier. L'adresse est lue au chargement, AVANT que
// `/api/finubar` n'ait greffé les astres : RENOBOOST IA n'a alors aucun enfant,
// la garde de l'adresse répond « rien à isoler », et le lien est perdu.
//
// Ce harnais tient quatre choses :
//   ① LA COURSE : Finubar RETARDÉ de 800 ms, session posée — le lien doit isoler
//     RENOBOOST IA une fois la greffe arrivée, sans ajouter d'entrée
//     d'historique (sinon la première flèche « précédent » ne ferait rien) ;
//   ② FAIL-CLOSED : sans session, aucun astre, aucun isolement — à ne jamais
//     desserrer ;
//   ③ LES ADRESSES FORGÉES : `#__proto__`, un id inconnu, un cap qui n'est pas
//     sous la page — ignorés, sans erreur, greffe comprise ;
//   ④ LES DÉPÔTS RÉELS (l'agrégat collecté, `api/_lib/finubar-macro.mjs`)
//     atteints chacun en deux clics au plus depuis l'accueil — Ultima en zéro,
//     puisqu'il est le ciel lui-même.
//
// ⛔ VU ROUGE SUR LE CODE D'AVANT (①). Verrous : la course est RÉELLE (aucun
// astre avant la réponse retardée), l'agrégat porte bien dix dépôts.
import { chromium } from 'playwright';
import MACRO from '../api/_lib/finubar-macro.mjs';

const BASE = process.env.BASE_ULTIMA || 'http://127.0.0.1:8123';
const RETARD_MS = 800;
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

const TOUS = (MACRO.projets || []).map((p) => ({ id: 'depot:' + p.depot, ciel: p.ciel, nom: (p.grain || {}).projet }));
verifier('Verrou : l\'agrégat réel porte dix dépôts', TOUS.length === 10, `${TOUS.length}`);
// ⚠️ LE DÉPÔT RANGÉ À LA RACINE N'A PAS D'ÉTOILE, ET C'EST VOULU : « le projet
// EST le ciel qu'on regarde » (`js/adaptateur-finubar.mjs`, `greffer`). Ultima
// s'atteint donc en ZÉRO clic — on y est. Premier jet de ce harnais : il le
// cherchait parmi les étoiles et le déclarait manquant.
const DEPOTS = TOUS.filter((d) => d.ciel !== 'racine');
verifier('Verrou : un seul dépôt est le ciel lui-même (Ultima), neuf sont à peindre',
  TOUS.length - DEPOTS.length === 1 && DEPOTS.length === 9, `${DEPOTS.length}`);

async function ouvrir(chemin, { session = true, retard = 0 } = {}) {
  const contexte = await navigateur.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${chemin} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${chemin} console: ${m.text()}`); } });
  // Ordre voulu : Playwright essaie la DERNIÈRE route enregistrée d'abord.
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
  await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', async (r) => {
    if (retard) { await new Promise((ok) => setTimeout(ok, retard)); }
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: MACRO }) });
  });
  await page.goto(`${BASE}/${chemin}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await page.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
  });
  if (session) { await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai')); }
  return { page, contexte };
}

function etat(page) {
  return page.evaluate(() => ({
    hash: location.hash,
    historique: history.length,
    ids: [...document.querySelectorAll('#ciel-noeud-scene g.ciel-etoile[data-noeud-id]')].map((g) => g.dataset.noeudId),
    ici: ((document.querySelector('.ciel-fil:not([hidden]) .ciel-fil-ici') || {}).textContent || '').trim(),
  }));
}

// ---- ① LA COURSE : l'adresse est lue avant la greffe ----
{
  const { page, contexte } = await ouvrir('alpha.html#renoboost-ia', { retard: RETARD_MS });
  await page.waitForTimeout(300);
  const avant = await etat(page);
  await page.waitForTimeout(RETARD_MS + 1800);
  const apres = await etat(page);
  await contexte.close();
  const attendus = DEPOTS.filter((d) => d.ciel === 'renoboost-ia').map((d) => d.id);
  const deposes = apres.ids.filter((id) => id.startsWith('depot:'));
  const autres = apres.ids.filter((id) => !id.startsWith('depot:') && !id.startsWith('porte:'));
  chiffres.course = { avant: avant.ids.length, apres: apres.ids, ici: apres.ici };
  verifier('① verrou — la course est réelle : aucun dépôt avant la réponse retardée',
    !avant.ids.some((id) => id.startsWith('depot:')), `${avant.ids.length} étoiles`);
  verifier('① verrou — cinq dépôts sous RENOBOOST IA dans l\'agrégat', attendus.length === 5, `${attendus.length}`);
  verifier('① le lien isole RENOBOOST IA une fois la greffe arrivée', apres.ici === 'RENOBOOST IA', `« ${apres.ici} »`);
  verifier('① ses cinq dépôts sont au ciel, et aucun autre',
    deposes.length === 5 && attendus.every((id) => deposes.includes(id)), deposes.join(', '));
  verifier('① rien d\'autre qu\'eux et la porte du site', autres.length === 0, autres.join(', '));
  verifier('① l\'adresse reste #renoboost-ia', apres.hash === '#renoboost-ia', apres.hash);
  verifier('① aucune entrée d\'historique ajoutée', apres.historique === avant.historique, `${avant.historique} → ${apres.historique}`);
}

// ---- ① bis : la greffe qui arrive SANS retard (l'ordre inverse) ----
{
  const { page, contexte } = await ouvrir('alpha.html#renoboost-ia');
  await page.waitForTimeout(2200);
  const m = await etat(page);
  await contexte.close();
  verifier('① bis sans retard : le lien isole aussi RENOBOOST IA', m.ici === 'RENOBOOST IA', `« ${m.ici} »`);
}

// ---- ① ter : UNE SECONDE GREFFE NE RAMÈNE PAS DE FORCE (dry run DR, 27/09) ----
// La session se rafraîchit seule (`TOKEN_REFRESHED`, `js/boussole-auth.js`) et
// chaque rafraîchissement relance la greffe. Remonté d'un cran par le fil, on
// ne doit PAS être renvoyé sur RENOBOOST IA par la greffe suivante.
{
  const { page, contexte } = await ouvrir('alpha.html#renoboost-ia');
  await page.waitForTimeout(2200);
  const isole = await etat(page);
  await page.locator('.ciel-fil .ciel-fil-etape').last().click();
  await page.waitForTimeout(1500);
  const remonte = await etat(page);
  await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-rafraichi'));
  await page.waitForTimeout(2200);
  const apres = await etat(page);
  await contexte.close();
  verifier('① ter verrou — isolé, puis remonté par le fil', isole.ici === 'RENOBOOST IA' && remonte.ici === '',
    `« ${isole.ici} » → « ${remonte.ici} » (${remonte.hash || 'sans fragment'})`);
  verifier('① ter la greffe suivante ne ramène pas sur RENOBOOST IA', apres.ici === '' && apres.hash === '',
    `« ${apres.ici} » ${apres.hash}`);
}

// ---- ② FAIL-CLOSED : sans session, rien ----
{
  const { page, contexte } = await ouvrir('alpha.html#renoboost-ia', { session: false });
  await page.waitForTimeout(RETARD_MS + 1500);
  const m = await etat(page);
  await contexte.close();
  verifier('② verrou — la page est peinte', m.ids.length >= 2, `${m.ids.length}`);
  verifier('② sans session : aucun dépôt au ciel', !m.ids.some((id) => id.startsWith('depot:')), m.ids.join(', '));
  verifier('② sans session : aucun isolement', m.ici === '', `« ${m.ici} »`);
}

// ---- ③ LES ADRESSES FORGÉES ----
for (const chemin of ['alpha.html#__proto__', 'alpha.html#constructor', 'alpha.html#inexistant', 'omega.html#renoboost-ia']) {
  const { page, contexte } = await ouvrir(chemin, { retard: RETARD_MS });
  await page.waitForTimeout(RETARD_MS + 1800);
  const m = await etat(page);
  await contexte.close();
  verifier(`③ ${chemin} : verrou — la page est peinte`, m.ids.length >= 2, `${m.ids.length}`);
  verifier(`③ ${chemin} : ignorée, aucun isolement`, m.ici === '', `« ${m.ici} »`);
}

// ---- ④ LES DÉPÔTS RÉELS, EN DEUX CLICS AU PLUS DEPUIS L'ACCUEIL ----
{
  const { page, contexte } = await ouvrir('index.html');
  await page.waitForTimeout(1800);
  const vus = new Map();
  const noter = async (clics) => {
    for (const id of (await etat(page)).ids) { if (id.startsWith('depot:') && !vus.has(id)) { vus.set(id, clics); } }
  };
  await noter(0);
  for (const [clics, cap] of [[1, 'alpha'], [2, 'renoboost-ia']]) {
    await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${cap}"] .ciel-zone`).click({ force: true });
    await page.waitForTimeout(2200);
    await noter(clics);
  }
  await contexte.close();
  const manquants = DEPOTS.filter((d) => !vus.has(d.id)).map((d) => d.nom);
  chiffres.clics = Object.fromEntries(DEPOTS.map((d) => [d.nom, vus.has(d.id) ? vus.get(d.id) : null]));
  verifier('④ les neuf dépôts peints sont atteints', manquants.length === 0, manquants.join(', ') || '9/9');
  verifier('④ chacun en deux clics au plus', DEPOTS.every((d) => vus.has(d.id) && vus.get(d.id) <= 2),
    DEPOTS.map((d) => `${d.nom}:${vus.has(d.id) ? vus.get(d.id) : '—'}`).join(' · '));
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE DEPOTS-PARTOUT VERT ===' : '\n=== SMOKE DEPOTS-PARTOUT ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
