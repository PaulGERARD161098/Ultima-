// Boussole d'accueil (Ultima LV2-①) : la rose des vents des macro-projets
// (index.html). Prouve : bandeau « Bienvenue sur Ultima » + invite, 3 caps
// rendus autour de la rose (ULTIMA ouvrable, RENAULT BOOST + IKOM « à venir »
// inertes/aria-disabled), rose des vents au cœur, 3 aiguilles, résumé Léo qui
// n'apparaît QU'au survol/focus (cartouche parole), illumination du cap actif,
// AUCUNE requête réseau externe (zéro CDN), zéro erreur console, contraste AA
// sur les couleurs réellement rendues. Puis navigation : clic ULTIMA →
// /ultima.html et la console à 4 quadrants se rend (non-régression du câblage).
import { chromium } from 'playwright';

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
const contexte = await navigateur.newContext();
const page = await contexte.newPage();

const erreursConsole = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreursConsole.push(msg.text()); });
page.on('pageerror', (err) => erreursConsole.push(String(err)));

// Toute requête hors 127.0.0.1:8123 / data: est une fuite réseau interdite.
const requetesExternes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) requetesExternes.push(url);
});

// Stub du client Supabase (js/boussole-auth.js) : mêmes signatures que celles
// appelées, zéro réseau. `session` = littéral JS injecté dans getSession, pour
// jouer les scénarios connecté / déconnecté. Sans stub, l'accueil verrouillé
// afficherait l'overlay et masquerait la boussole (et getSession tenterait un
// appel externe) : ici tout reste local.
function stubSupabase(session) {
  return (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.supabase = { createClient: function () { return {
      auth: {
        getSession: function () { return Promise.resolve({ data: { session: ${session} } }); },
        onAuthStateChange: function () {},
        signInWithOtp: function () { window.__otpAppele = true; return Promise.resolve({ data: {}, error: null }); },
        signInWithOAuth: function (opts) { window.__oauthAppele = opts && opts.provider; return Promise.resolve({ data: {}, error: null }); },
        signOut: function () { return Promise.resolve({ error: null }); }
      }
    }; } };`,
  });
}

// ===================== A. La boussole (index.html) =====================
// Scénario CONNECTÉ : session présente → overlay masqué, boussole pleinement
// interactive (non-régression de tout l'existant ci-dessous).
console.log('— A. Boussole d\'accueil —');
await page.route('**/js/vendor/supabase-js-2.110.0.min.js',
  stubSupabase('{ user: { id: "u-test" }, access_token: "jeton-factice" }'));
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Titre ligne 1 « Ultima LV2 »', surligne === 'Ultima LV2', `lu: ${surligne}`);
verifier('Titre ligne 2 « Bienvenue »', principal === 'Bienvenue', `lu: ${principal}`);
const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite présente', /Sur quoi est-ce qu'on travaille aujourd'hui/.test(invite || ''), `lu: ${invite}`);

// Les 5 caps rendus.
const noms = (await page.locator('.cap-nom').allTextContents()).map((n) => n.trim());
verifier('5 caps rendus', noms.length === 5, `trouvés: ${JSON.stringify(noms)}`);
for (const attendu of ['ULTIMA', 'RENOBOOST IA', 'YCOME', 'RESHIRAM', 'ZEKROM']) {
  verifier(`Cap ${attendu} présent`, noms.includes(attendu));
}

// ULTIMA est une porte ouverte interne (ancre vers ultima.html, même onglet).
const capUltima = page.locator('a.cap[data-id="ultima"]');
verifier('Cap ULTIMA ouvrable (ancre)', (await capUltima.count()) === 1);
verifier('Cap ULTIMA pointe vers ultima.html',
  (await capUltima.getAttribute('href')) === 'ultima.html');

// RENOBOOST IA est branché : ancre externe (nouvel onglet, rel noopener).
const capReno = page.locator('a.cap[data-id="renoboost-ia"]');
verifier('Cap RENOBOOST IA ouvrable (ancre)', (await capReno.count()) === 1);
verifier('Cap RENOBOOST IA pointe vers la console renoboostia.fr',
  (await capReno.getAttribute('href') || '').startsWith('https://www.renoboostia.fr'));
verifier('Cap RENOBOOST IA ouvre un nouvel onglet',
  (await capReno.getAttribute('target')) === '_blank');
verifier('Cap RENOBOOST IA en rel noopener',
  /noopener/.test(await capReno.getAttribute('rel') || ''));

// RESHIRAM est désormais un cap OUVRABLE interne (page reshiram.html, même
// onglet, PAS un lien externe façon Renoboost/YCOME).
const capReshiram = page.locator('a.cap[data-id="reshiram"]');
verifier('Cap RESHIRAM ouvrable (ancre)', (await capReshiram.count()) === 1);
verifier('Cap RESHIRAM pointe vers reshiram.html (interne)',
  (await capReshiram.getAttribute('href')) === 'reshiram.html');
verifier('Cap RESHIRAM en interne (pas de nouvel onglet)',
  (await capReshiram.getAttribute('target')) === null);

// ZEKROM est désormais un cap OUVRABLE interne (page zekrom.html, même onglet,
// miroir de RESHIRAM — complète le doublet réel ↔ idéal).
const capZekrom = page.locator('a.cap[data-id="zekrom"]');
verifier('Cap ZEKROM ouvrable (ancre)', (await capZekrom.count()) === 1);
verifier('Cap ZEKROM pointe vers zekrom.html (interne)',
  (await capZekrom.getAttribute('href')) === 'zekrom.html');
verifier('Cap ZEKROM en interne (pas de nouvel onglet)',
  (await capZekrom.getAttribute('target')) === null);

// YCOME reste « à venir » : non-lien, aria-disabled.
{
  const cap = page.locator('.cap[data-id="ycome"]');
  const tag = await cap.evaluate((e) => e.tagName.toLowerCase());
  verifier('Cap ycome inerte (pas une ancre)', tag !== 'a', `tag: ${tag}`);
  verifier('Cap ycome aria-disabled', (await cap.getAttribute('aria-disabled')) === 'true');
}
verifier('1 cap « à venir » (YCOME seul)', (await page.locator('.cap--avenir').count()) === 1);

// Passerelle visuelle RESHIRAM ↔ ZEKROM tracée.
verifier('Passerelle RESHIRAM ↔ ZEKROM tracée',
  (await page.locator('.boussole-aiguilles .passerelle').count()) === 1);

// La rose au cœur + les 5 aiguilles.
verifier('Rose des vents au cœur', (await page.locator('.boussole-coeur svg').count()) === 1);
verifier('5 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 5);

// Le résumé Léo n'apparaît QU'au survol : au repos, invite par défaut.
const paroleRepos = (await page.locator('#boussole-parole').textContent())?.trim();
verifier('Parole au repos : invite au survol', /Léo t'en dit l'essentiel/.test(paroleRepos || ''),
  `lu: ${paroleRepos}`);
verifier('Aucun résumé de projet au repos',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Survol d'ULTIMA → cap illuminé + résumé déposé.
await capUltima.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
verifier('Cap ULTIMA illuminé au survol', await capUltima.evaluate((e) => e.classList.contains('is-actif')));
const paroleNom = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Résumé : nom du cap affiché', paroleNom === 'ULTIMA', `lu: ${paroleNom}`);
const paroleTexte = (await page.locator('#boussole-parole .parole-texte').textContent())?.trim();
verifier('Résumé : essentiel de Léo affiché', /quatre quadrants/i.test(paroleTexte || ''), `lu: ${paroleTexte}`);
verifier('Résumé : appel à l\'action', (await page.locator('#boussole-parole .parole-action').count()) === 1);

// Sortie du survol → retour à l'invite (zéro surcharge).
await page.locator('h1.console-titre').hover();
await page.waitForSelector('#boussole-parole:not(.is-actif)', { timeout: 5000 });
verifier('Sortie du survol → retour à l\'invite',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Accès clavier : focus du cap « à venir » montre aussi son résumé.
await page.locator('.cap[data-id="ycome"]').focus();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const nomYcome = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Focus clavier d\'un cap montre son résumé', nomYcome === 'YCOME', `lu: ${nomYcome}`);

// Repli sans JS présent dans le document.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

// Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const nom = getComputedStyle(document.querySelector('.cap-nom'));
  const t = getComputedStyle(document.querySelector('.console-titre'));
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom.color, titre: t.color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de cap ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (boussole)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ===================== B. Navigation ULTIMA → console =====================
console.log('— B. ULTIMA → /ultima.html (console) —');
await capUltima.click();
await page.waitForURL('**/ultima.html', { timeout: 20000 });
verifier('Clic ULTIMA → URL ultima.html', /\/ultima\.html$/.test(page.url()), page.url());
await page.waitForSelector('h1.console-titre', { timeout: 20000 });
const nomsQuadrants = (await page.locator('.quadrant-nom').allTextContents()).map((n) => n.trim());
verifier('Console à 4 quadrants rendue', nomsQuadrants.length === 4, JSON.stringify(nomsQuadrants));
verifier('Retour boussole présent sur la console',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// ============ C. Verrou d'accueil : déconnecté = boussole cachée ============
// La boussole est la porte de connexion unique : sans session, l'écran de
// connexion couvre tout, la boussole est inerte, et Google / lien magique sont
// offerts. C'est aussi ici que le retour OAuth Google se termine (jeton
// consommé au chargement — non observable en stub, mais le câblage l'est).
console.log('— C. Verrou d\'accueil (déconnecté) —');
const ctxDeco = await navigateur.newContext();
const pageDeco = await ctxDeco.newPage();
const erreursDeco = [];
pageDeco.on('console', (m) => { if (m.type() === 'error') erreursDeco.push(m.text()); });
pageDeco.on('pageerror', (e) => erreursDeco.push(String(e)));
await pageDeco.route('**/js/vendor/supabase-js-2.110.0.min.js', stubSupabase('null'));
await pageDeco.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await pageDeco.waitForSelector('#ecran-connexion:not([hidden])', { timeout: 10000 });

verifier('Déconnecté : écran de connexion visible', await pageDeco.locator('#ecran-connexion').isVisible());
verifier('Déconnecté : formulaire de connexion visible', await pageDeco.locator('#form-connexion').isVisible());
verifier('Déconnecté : boussole rendue inerte', await pageDeco.evaluate(() => {
  const scene = document.querySelector('.boussole-scene');
  return !!scene && scene.hasAttribute('inert');
}));
verifier('Bouton Google présent et visible', await pageDeco.locator('#bouton-google').isVisible());
verifier('Lien magique (champ e-mail) présent', await pageDeco.locator('#champ-email').isVisible());
// Clic Google → signInWithOAuth('google') (handler seConnecterGoogle).
await pageDeco.locator('#bouton-google').click();
await pageDeco.waitForTimeout(200);
verifier('Clic Google → signInWithOAuth(\'google\')',
  await pageDeco.evaluate(() => window.__oauthAppele === 'google'));
verifier('Zéro erreur console (accueil déconnecté)', erreursDeco.length === 0, erreursDeco.slice(0, 3).join(' | '));

// Scénario CONNECTÉ (2e passe isolée) : session présente → overlay masqué, la
// boussole n'est plus inerte (le verrou se lève bien).
const ctxCo = await navigateur.newContext();
const pageCo = await ctxCo.newPage();
await pageCo.route('**/js/vendor/supabase-js-2.110.0.min.js',
  stubSupabase('{ user: { id: "u-test" }, access_token: "jeton-factice" }'));
await pageCo.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await pageCo.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });
verifier('Connecté : écran de connexion masqué', await pageCo.locator('#ecran-connexion').isHidden());
verifier('Connecté : boussole non inerte', await pageCo.evaluate(() => {
  const scene = document.querySelector('.boussole-scene');
  return !!scene && !scene.hasAttribute('inert');
}));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE BOUSSOLE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
