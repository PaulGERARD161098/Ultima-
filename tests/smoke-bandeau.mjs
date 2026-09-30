// LE BANDEAU SUIT CE QU'ON REGARDE (Paul, 30/09 : « bandeau par constellation
// — cohérent avec l'affichage et les données ; affichage minimisé pour ne pas
// gêner la vue »).
//
// Il empêche :
//   ① un bandeau qui dit IMLADRIK alors que l'écran montre les DRAGONS ;
//   ② un bandeau qui garde le texte du foyer après être remonté ;
//   ③ un bandeau qui reprend la place du ciel sous isolement.
// Le texte attendu se LIT dans le registre, jamais en dur : un titre renommé
// ne doit pas faire rougir ce harnais, un bandeau désaccordé si.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
let echecs = 0;
function verifier(nom, ok, detail = '') {
  console.log(`  ${ok ? '✅' : '❌'} ${nom}${!ok && detail ? ' — ' + detail : ''}`);
  if (!ok) { echecs += 1; }
}
const lire = (page) => page.evaluate(() => ({
  surligne: document.querySelector('.console-entete .titre-surligne')?.textContent || '',
  titre: document.querySelector('.console-entete .titre-principal')?.textContent || '',
  hauteur: document.querySelector('.console-entete')?.getBoundingClientRect().height || 0,
}));
async function ouvrir(url, largeur, hauteur) {
  const page = await navigateur.newPage({ viewport: { width: largeur, height: hauteur } });
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.goto(`${BASE}/${url}`, { waitUntil: 'load' });
  await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 15000 });
  await page.waitForTimeout(1000);
  return { page, erreurs };
}

for (const [largeur, hauteur] of [[1280, 860], [390, 844]]) {
  console.log(`— imladrik.html à ${largeur} px —`);
  const { page, erreurs } = await ouvrir('imladrik.html', largeur, hauteur);
  const repos = await lire(page);
  verifier(`${largeur} : au repos, le bandeau est celui d'IMLADRIK (registre)`,
    repos.titre === NOEUDS.imladrik.titre && repos.surligne === NOEUDS.imladrik.surligne,
    JSON.stringify(repos));
  for (const id of ['constellation-dragons', 'constellation-armes']) {
    await page.evaluate((h) => { window.location.hash = h; }, id);
    await page.waitForTimeout(1200);
    const b = await lire(page);
    verifier(`${largeur} : #${id} → le bandeau dit ${NOEUDS[id].titre} (registre)`,
      b.titre === NOEUDS[id].titre && b.surligne === NOEUDS[id].surligne, JSON.stringify(b));
    // Verrou : la mesure « plus petit » n'a de sens que si le repos a une hauteur.
    verifier(`${largeur} : #${id} → le bandeau est plus bas qu'au repos (minimisé)`,
      repos.hauteur > 20 && b.hauteur > 0 && b.hauteur < repos.hauteur,
      `${Math.round(b.hauteur)} px contre ${Math.round(repos.hauteur)} px au repos`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const retour = await lire(page);
  verifier(`${largeur} : Échap → le bandeau redevient celui d'IMLADRIK`,
    retour.titre === NOEUDS.imladrik.titre && retour.surligne === NOEUDS.imladrik.surligne,
    JSON.stringify(retour));
  verifier(`${largeur} : zéro erreur page`, erreurs.length === 0, erreurs.join(' | '));
  await page.close();
}

// Un foyer SANS titre au registre ne vide pas le bandeau : il garde celui de la
// page (RENOBOOST IA, isolé depuis ALPHA, n'a pas de titre propre).
{
  const sansTitre = Object.keys(NOEUDS).find((id) => NOEUDS.alpha.enfants.includes(id)
    && (NOEUDS[id].enfants || []).length && !NOEUDS[id].titre);
  const { page } = await ouvrir('alpha.html', 1280, 860);
  const repos = await lire(page);
  if (sansTitre) {
    await page.evaluate((h) => { window.location.hash = h; }, sansTitre);
    await page.waitForTimeout(1200);
  }
  const b = await lire(page);
  verifier('Un foyer sans titre garde le bandeau de la page (jamais vide)',
    b.titre !== '' && b.titre === repos.titre, `${sansTitre || 'aucun foyer sans titre'} → ${JSON.stringify(b)}`);
  await page.close();
}

await navigateur.close();
console.log(echecs ? `=== ${echecs} VERDICT(S) EN ÉCHEC ===` : '=== SMOKE BANDEAU VERT ===');
process.exit(echecs ? 1 : 0);
