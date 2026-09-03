// Vérification de « parler à Léo partout » — navigateur réel, session stubée.
//
// Prouve, sur DEUX pages de nature différente (une qui déclare son quadrant,
// une qui retombe sur le repli) :
//   §1 pas de session → PAS DE BOUTON. Un bouton qui ouvre un cartouche pour
//      annoncer qu'il faut se connecter est un bouton qui ment ;
//   §2 session → bouton présent, et le clic ouvre réellement la voix ;
//   §3 le bouton répond à CHAQUE clic, et n'a pas consommé l'accueil du
//      quadrant (le verrou sessionStorage ne borne que l'accueil automatique) ;
//   §4 ce qui part vers /api/leo porte le quadrant DÉCLARÉ et rien de la page ;
//   §5 390 px : le bouton ne provoque aucun débordement horizontal.
//
// ⛔ §4 se teste par l'ABSENCE (leçon 2026-07-30) : on met dans la page un
// contenu reconnaissable et on exige de NE PAS le trouver dans le corps envoyé.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

// Deux pages, deux cas. `zekrom` déclare `riven` (lien retour unique vers
// riven.html) ; `tao` ne déclare rien et doit retomber sur `ultima`.
const PAGES = [
  { fichier: 'zekrom.html', quadrant: 'riven' },
  { fichier: 'tao.html', quadrant: 'ultima' },
  // Tranchées par Paul le 2026-09-03 : elles avaient DEUX liens retour chacune
  // (riven et bcp pour grima, imladrik et adramelech pour naga) et étaient donc
  // restées au repli. Elles sont ici pour la même raison que les autres — on
  // vérifie le quadrant RÉELLEMENT ENVOYÉ, jamais la présence de l'attribut :
  // sept attributs posés dans un commentaire ont déjà passé une relecture.
  { fichier: 'naga.html', quadrant: 'riven' },
  { fichier: 'grima.html', quadrant: 'riven' },
];

async function ouvrir(navigateur, fichier, { connecte, finubar }) {
  const page = await navigateur.newPage();
  const journal = { erreurs: [], externes: [], corpsLeo: [], apiDeLaPage: new Set() };
  page.on('pageerror', (e) => journal.erreurs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') journal.erreurs.push(m.text()); });
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) journal.externes.push(url);
  });

  // Les API PROPRES à la page (zekrom appelle /api/ideaux, /api/talents,
  // /api/passerelles) : servies à vide par le serveur statique, elles
  // rendraient 404 et pollueraient le journal d'erreurs. On les stube — et on
  // les COMPTE, pour que l'exclusion soit visible au rapport plutôt que muette
  // (leçon du 2026-08-17 : un `continue` silencieux transforme un angle mort
  // en bonne nouvelle).
  await page.route('**/api/**', (r) => {
    const url = r.request().url();
    if (url.includes('/api/leo')) return r.fallback();
    if (finubar && url.includes('/api/finubar')) {
      return r.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: finubar }) });
    }
    journal.apiDeLaPage.add(url.replace(BASE, ''));
    return r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: [] }) });
  });

  await page.route('**/api/leo', (r) => {
    journal.corpsLeo.push(r.request().postData() || '');
    return r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ ok: true, data: { reponse: 'Je t’écoute.' } }),
    });
  });

  const session = connecte
    ? '{ user: { id: "u-test" }, access_token: "jeton-factice" }'
    : 'null';
  await page.route('**/js/vendor/supabase-js-2.110.0.min.js', (r) => r.fulfill({
    contentType: 'application/javascript',
    body: `window.supabase = { createClient: function () { return { auth: {
      getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
      onAuthStateChange: function () {}
    } }; } };`,
  }));

  await page.goto(`${BASE}/${fichier}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(500);
  return { page, journal };
}

// Même binaire que le reste du patrimoine : le headless shell de Playwright
// n'est pas dans cette image, seul chromium-1194 l'est.
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

console.log('§1 — sans session : aucun bouton (fail-closed)');
for (const { fichier } of PAGES) {
  const { page, journal } = await ouvrir(navigateur, fichier, { connecte: false });
  verifier(`${fichier} : pas de bouton « Parler à Léo »`,
    (await page.locator('#leo-appel').count()) === 0);
  verifier(`${fichier} : aucune erreur de page`, journal.erreurs.length === 0,
    journal.erreurs[0]);
  verifier(`${fichier} : aucune requête externe`, journal.externes.length === 0,
    journal.externes[0]);
  await page.close();
}

console.log('\n§2 — avec session : le bouton est là et ouvre la voix');
for (const { fichier } of PAGES) {
  const { page, journal } = await ouvrir(navigateur, fichier, { connecte: true });
  if (journal.apiDeLaPage.size) {
    console.log(`     (API propres à la page, stubées : ${[...journal.apiDeLaPage].join(', ')})`);
  }
  verifier(`${fichier} : le bouton est posé`, (await page.locator('#leo-appel').count()) === 1);
  await page.locator('#leo-appel').click();
  await page.waitForTimeout(300);
  verifier(`${fichier} : le cartouche s'ouvre`, (await page.locator('#leo-cartouche').count()) === 1);
  verifier(`${fichier} : la zone de parole est là`,
    (await page.locator('.leo-voix-formulaire').count()) === 1);
  verifier(`${fichier} : pas de « Rien d'urgent » parasite`,
    (await page.locator('.leo-section-propositions').count()) === 0,
    'ouvert pour PARLER : la section propositions vide n’a rien à y faire');
  verifier(`${fichier} : aucune erreur de page`, journal.erreurs.length === 0, journal.erreurs[0]);
  await page.close();
}

console.log('\n§3 — le bouton répond à CHAQUE clic, sans consommer l’accueil');
{
  const { page } = await ouvrir(navigateur, 'zekrom.html', { connecte: true });
  await page.locator('#leo-appel').click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  verifier('après Échap, le cartouche est refermé',
    (await page.locator('#leo-cartouche').count()) === 0);
  await page.locator('#leo-appel').click();
  await page.waitForTimeout(200);
  verifier('le DEUXIÈME clic rouvre le cartouche',
    (await page.locator('#leo-cartouche').count()) === 1,
    'sans `forcer`, le verrou « une fois par session » ferait un bouton mort');
  const marques = await page.evaluate(() => Object.keys(window.sessionStorage)
    .filter((c) => c.indexOf('leo') !== -1));
  verifier("l'accueil du quadrant n'a PAS été consommé", marques.length === 0,
    `sessionStorage: ${JSON.stringify(marques)}`);
  await page.close();
}

console.log('\n§4 — ce qui part vers /api/leo : le quadrant, et rien de la page');
for (const { fichier, quadrant } of PAGES) {
  const { page, journal } = await ouvrir(navigateur, fichier, { connecte: true });
  // Un contenu reconnaissable, planté dans la page : il ne doit PAS partir.
  await page.evaluate(() => {
    const p = document.createElement('p');
    p.textContent = 'SECRET-DE-LA-PAGE-42';
    document.body.appendChild(p);
  });
  await page.locator('#leo-appel').click();
  await page.waitForTimeout(200);
  await page.locator('.leo-voix-formulaire input, .leo-voix-formulaire textarea').first()
    .fill('où en est-on ?');
  await page.locator('.leo-voix-formulaire button[type="submit"], .leo-voix-formulaire button')
    .first().click();
  await page.waitForTimeout(500);

  const corps = journal.corpsLeo.join('\n');
  verifier(`${fichier} : un appel a bien eu lieu`, corps.length > 0);
  verifier(`${fichier} : le quadrant envoyé est « ${quadrant} »`,
    corps.includes(`"quadrant":"${quadrant}"`), corps.slice(0, 160));
  verifier(`${fichier} : le contenu de la page ne part PAS`,
    !corps.includes('SECRET-DE-LA-PAGE-42'));
  verifier(`${fichier} : l'URL de la page ne part PAS`, !corps.includes(fichier));
  verifier(`${fichier} : la question de Paul part bien (pas un test à vide)`,
    corps.includes('où en est-on ?'));
  await page.close();
}

console.log('\n§5 — 390 px : le bouton ne fait pas déborder la page');
for (const { fichier } of PAGES) {
  const { page } = await ouvrir(navigateur, fichier, { connecte: true });
  await page.setViewportSize({ width: 390, height: 780 });
  await page.waitForTimeout(200);
  const debord = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  verifier(`${fichier} : aucun débordement horizontal`, debord <= 0, `${debord}px`);
  const boite = await page.locator('#leo-appel').boundingBox();
  verifier(`${fichier} : le bouton reste dans le cadre`,
    boite !== null && boite.x >= 0 && boite.x + boite.width <= 390,
    boite ? `x=${Math.round(boite.x)} w=${Math.round(boite.width)}` : 'absent');
  await page.close();
}

console.log('\n§6 — FINUBAR : la voix voit la table de marche, et rien d’autre');
{
  // L'agrégat porte un SHA de commit et un chemin interne — ils ne doivent pas
  // franchir le pas vers le modèle. Test par l'absence, cette fois in vivo :
  // l'unitaire éprouve la fonction, celui-ci éprouve LE CHEMIN COMPLET.
  const SHA = 'ceb9af4de5cb9bc76181b8713754192e63658e86';
  const AGREGAT = {
    le: '2026-09-03',
    macro: { total: 8, lisibles: 8, illisibles: 0, hors_seance: 0, en_cours: 3,
      en_attente_de_paul: 2, au_repos: 3, derives: 0, boucles_ouvertes: 6, gestes_de_paul: [] },
    cartouche: {
      signaux: [{ projet: 'Ultima', dit: 'attend un geste depuis 3 j' }],
      action: { projet: 'Ultima', faire: 'poser la clé', nature: 'geste', cap: 'brancher Léo' },
    },
    projets: [{
      ok: true, motif: '', depot: 'x/Ultima', rang: 0, jours_depuis_maj: 0, jours_en_attente: 3,
      derive: { tete: SHA, tete_le: '2026-09-03T10:00:00Z', commits_depuis: 0 },
      grain: {
        projet: 'Ultima', depot: 'x/Ultima', cap: 'le cap', rattache_a: 'ROADMAP.md',
        etat: 'en_attente_de_paul', jalon: { nom: 'J', critere_de_sortie: 'c' },
        dernier_arret: { le: '2026-09-03', quoi: 'la fusion', commit: SHA },
        prochaine_action: 'brancher Léo sur finubar',
        bloque_par: ['ANTHROPIC_API_KEY en env Vercel'],
        en_attente_depuis: '2026-08-31', boucles_ouvertes: [], maj: '2026-09-03',
      },
    }],
  };

  const { page, journal } = await ouvrir(navigateur, 'finubar.html',
    { connecte: true, finubar: AGREGAT });
  verifier('finubar.html : le bouton est posé APRÈS le rendu (montage manuel)',
    (await page.locator('#leo-appel').count()) === 1);

  await page.locator('#leo-appel').click();
  await page.waitForTimeout(200);
  await page.locator('.leo-voix-formulaire input, .leo-voix-formulaire textarea').first()
    .fill('qu’est-ce qui attend un geste ?');
  await page.locator('.leo-voix-formulaire button').first().click();
  await page.waitForTimeout(500);

  const corps = journal.corpsLeo.join('\n');
  verifier('finubar.html : le quadrant envoyé est « finubar »',
    corps.includes('"quadrant":"finubar"'), corps.slice(0, 120));
  verifier('Léo reçoit les COMPTES de la table de marche',
    corps.includes('"boucles_ouvertes":6') && corps.includes('"depots":8'));
  verifier('Léo reçoit le geste qui attend Paul',
    corps.includes('ANTHROPIC_API_KEY en env Vercel'));
  verifier('⛔ le SHA de commit ne franchit PAS le pas', !corps.includes(SHA));
  verifier('⛔ aucun jeton de session dans le corps', !corps.includes('jeton-factice'));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0
  ? '\n=== smoke-leo-partout : TOUT VERT ==='
  : `\n=== smoke-leo-partout : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
