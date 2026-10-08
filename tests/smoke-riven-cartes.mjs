// Harnais — les deux cartes de RIVEN : Tout · Individus · Entreprises
// (Paul, 2026-10-08 : « une carte d'entreprises et une carto d'individus »).
// Mode démonstration, bout à bout. Ce qu'il prouve :
//   1. « Tout » est le défaut et montre les 9 fiches de la démo (verrou de
//      non-vacuité : sans lui, « 1 étoile » pourrait venir d'un ciel vide).
//   2. Entreprises : la seule fiche dont la Nature est « Entreprise »
//      (demo-n2), son orbite, et aucun trait vers une étoile absente.
//   3. Individus : les 8 autres, leurs 2 orbites, les 3 traits entre elles.
//   4. Les deux cartes partitionnent : 1 + 8 = 9, aucune fiche dans les deux.
//   5. Le choix survit au rechargement, et le bouton le DIT (aria-pressed).
//   6. La carte des nébuleuses (à plat) obéit au même choix.
//   7. « + Ajouter » depuis Entreprises propose la Nature À VUE ; pas ailleurs.
//   8. Zéro erreur console.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  // Le volume d'abord (sélecteurs du moteur 3D) ; la section 6 passe à plat.
  try { if (!localStorage.getItem('ultima-ciel-vue')) { localStorage.setItem('ultima-ciel-vue', 'volume'); } } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', { value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false });
});

const verdicts = {};
const details = {};
const volume = () => page.evaluate(() => {
  const svg = document.querySelector('#ciel-scene .ciel-svg');
  if (!svg) { return null; }
  return {
    etoiles: [...svg.querySelectorAll('g.ciel-etoile[data-noeud-id]')].map((g) => g.getAttribute('data-noeud-id')).sort(),
    liens: svg.querySelectorAll('.ciel-liens line').length,
    orbites: svg.querySelectorAll('g.ciel-etoile[data-personne-id]').length
  };
});
const presse = () => page.evaluate(() =>
  [...document.querySelectorAll('.ciel-cartes [data-carte]')].filter((b) => b.getAttribute('aria-pressed') === 'true')
    .map((b) => b.getAttribute('data-carte')));
const choisir = async (carte) => {
  await page.click(`.ciel-cartes [data-carte="${carte}"]`);
  await page.waitForTimeout(400);
};

await page.goto(`${BASE}/riven.html`, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1200);

// 1. Tout, par défaut.
const tout = await volume();
details.tout = tout;
verdicts.toutParDefaut = JSON.stringify(await presse()) === '["tout"]';
verdicts.toutMontreLesNeuf = !!tout && tout.etoiles.length === 9 && tout.liens === 6 && tout.orbites === 3;

// 2. Entreprises.
await choisir('entreprises');
const ent = await volume();
details.entreprises = ent;
verdicts.entreprisesSeulementDemoN2 = !!ent && ent.etoiles.join(',') === 'demo-n2';
verdicts.entreprisesSonOrbiteSansTraitOrphelin = !!ent && ent.orbites === 1 && ent.liens === 0;
verdicts.entreprisesBoutonPresse = JSON.stringify(await presse()) === '["entreprises"]';

// 3. Individus.
await choisir('individus');
const ind = await volume();
details.individus = ind;
verdicts.individusLesHuitAutres = !!ind && ind.etoiles.length === 8 && ind.etoiles.indexOf('demo-n2') === -1;
verdicts.individusOrbitesEtTraits = !!ind && ind.orbites === 2 && ind.liens === 3;

// 4. Partition.
verdicts.partition = !!(tout && ent && ind) &&
  JSON.stringify([...ent.etoiles, ...ind.etoiles].sort()) === JSON.stringify(tout.etoiles);

// 5. Le choix survit au rechargement.
await choisir('entreprises');
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1200);
const apres = await volume();
verdicts.choixRetenuApresRechargement = !!apres && apres.etoiles.join(',') === 'demo-n2' &&
  JSON.stringify(await presse()) === '["entreprises"]';

// 7. « + Ajouter » depuis Entreprises : la Nature proposée, pli ouvert.
await page.click('#ciel-ajouter');
await page.waitForTimeout(300);
const formEnt = await page.evaluate(() => ({
  nature: document.querySelector('#noeud-nature').value,
  ouvert: document.querySelector('#noeud-detail').open
}));
details.formEntreprises = formEnt;
verdicts.ajoutDepuisEntreprisesProposeLaNature = formEnt.nature === 'Entreprise' && formEnt.ouvert === true;
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => { const b = document.querySelector('[data-fermer], .panneau-fermer'); if (b && b.offsetParent) { b.click(); } });
await choisir('tout');
await page.click('#ciel-ajouter');
await page.waitForTimeout(300);
const formTout = await page.evaluate(() => ({
  nature: document.querySelector('#noeud-nature').value,
  ouvert: document.querySelector('#noeud-detail').open
}));
details.formTout = formTout;
verdicts.ajoutDepuisToutNeProposeRien = formTout.nature === '' && formTout.ouvert === false;
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => { const b = document.querySelector('[data-fermer], .panneau-fermer'); if (b && b.offsetParent) { b.click(); } });

// 6. À plat, même choix.
await page.evaluate(() => localStorage.setItem('ultima-ciel-vue', 'plat'));
await page.evaluate(() => localStorage.setItem('ultima-ciel-carte', 'entreprises'));
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1200);
const platEnt = await page.evaluate(() => document.querySelectorAll('#ciel-scene .neb-coeur').length);
await choisir('tout');
const platTout = await page.evaluate(() => document.querySelectorAll('#ciel-scene .neb-coeur').length);
details.plat = { entreprises: platEnt, tout: platTout };
verdicts.aPlatMemeChoix = platTout === 9 && platEnt === 1;

verdicts.zeroErreurConsole = erreurs.length === 0;
details.erreurs = erreurs;

await browser.close();
console.log(JSON.stringify({ verdicts, details }, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE-RIVEN-CARTES OK' : 'SMOKE-RIVEN-CARTES ECHEC');
process.exit(ok ? 0 : 1);
