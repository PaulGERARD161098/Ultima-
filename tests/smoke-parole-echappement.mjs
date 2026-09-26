// LA PAROLE ÉCHAPPE CE QUI VIENT DE FINUBAR — audit S1 du 26/09.
//
// Le cartouche de parole se remplit par `innerHTML`. C'était sûr tant que tout
// venait du REGISTRE, statique. Depuis la greffe Finubar (02/09), les astres
// portent `nom` = `grain.projet` et `resume` = `grain.jalon.nom` — du texte écrit
// dans le FINUBAR.md de huit dépôts, que `finubar/agreger.mjs` ne fait que
// borner en longueur. Un nom de projet comme `<a href=…>Reconnecte-toi</a>`
// devenait un lien dans l'interface de confiance de Paul. La CSP bloque les
// scripts ; elle ne bloque ni un lien de hameçonnage ni une balise `meta`.
//
// Ce harnais sert à `/api/finubar` un grain dont le nom et le jalon sont du
// BALISAGE, survole l'étoile du dépôt, et exige que ce balisage soit LU comme
// du texte : aucun élément injecté dans le DOM, et le texte littéral affiché.
// ⛔ Vu rouge sur le code d'avant. Verrou de non-vacuité : le cartouche doit
// porter le nom du projet — sinon « rien d'injecté » serait vert sur un
// cartouche vide.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

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

const NOM = '<img id="pwn-nom" src="x">Piège';
const JALON = '<a id="pwn-jalon" href="https://exemple.invalid/">Reconnecte-toi</a>';
const agregat = JSON.parse(JSON.stringify(AGREGAT));
const p = agregat.projets[0];
p.depot = 'exemple/piege'; p.ciel = 'renoboost-ia';
p.grain = Object.assign({}, p.grain, { projet: NOM, depot: 'exemple/piege' });
p.grain.jalon = Object.assign({}, p.grain.jalon, { nom: JALON });
agregat.projets = [p];

const contexte = await navigateur.newContext({ viewport: { width: 1280, height: 800 } });
const page = await contexte.newPage();
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
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
for (const id of ['alpha', 'renoboost-ia']) {
  await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${id}"] .ciel-zone`).click({ force: true });
  await page.waitForTimeout(2000);
}
const astre = page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="depot:exemple/piege"] .ciel-zone');
verifier('Verrou : l\'étoile du dépôt piégé est au ciel', await astre.count() === 1);
if (await astre.count() === 1) {
  await astre.hover({ force: true });
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => ({
    nom: (document.querySelector('#boussole-parole .parole-nom') || {}).textContent || '',
    texte: (document.querySelector('#boussole-parole .parole-texte') || {}).textContent || '',
    pwn: !!document.querySelector('#pwn-nom, #pwn-jalon'),
    balises: document.querySelectorAll('#boussole-parole img, #boussole-parole a[href], #boussole-parole meta').length,
  }));
  verifier('Verrou : le cartouche porte le nom du projet', r.nom.includes('Piège'), JSON.stringify(r.nom));
  verifier('Aucun élément injecté dans le DOM (#pwn-nom, #pwn-jalon)', r.pwn === false);
  verifier('Aucune balise img / a / meta dans le cartouche', r.balises === 0, String(r.balises));
  verifier('Le nom est affiché LITTÉRALEMENT, balises comprises', r.nom === '<img id="pwn-nom" src="x">Piège', JSON.stringify(r.nom));
  verifier('Le jalon est affiché littéralement', r.texte.includes('<a id="pwn-jalon"'), JSON.stringify(r.texte.slice(0, 60)));
}

verifier('Zéro erreur de page', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE PAROLE-ECHAPPEMENT VERT ===' : '\n=== SMOKE PAROLE-ECHAPPEMENT ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
