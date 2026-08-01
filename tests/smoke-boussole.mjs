// Boussole RACINE (Ultima Lv3, boucle L2) : les DEUX supra-divisions
// (index.html). Prouve : bandeau « Ultima Lv3 / Bienvenue » + invite, 2 caps
// rendus autour de la rose (ULTIMA → ultima.html, ALPHA → alpha.html), le cœur
// gravé + sa légende, 2 aiguilles, le résumé de Léo qui n'apparaît QU'au
// survol/focus, illumination du cap actif, AUCUNE requête réseau externe (zéro
// CDN), zéro erreur console, contraste AA sur les couleurs réellement rendues.
// Puis navigation : clic ULTIMA → /ultima.html, la boussole des 2 macro-quadrants (GRIMA, NAGA) se rend.
// Enfin le verrou d'accueil (déconnecté = boussole cachée) et le COCKPIT (les
// agrégats derrière Bearer, jamais dans le HTML).
//
// Le bandeau est comparé au REGISTRE (js/registre-lv3.mjs) : la coque HTML ne
// peut pas dériver du registre sans que ce harnais le voie.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

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
// jouer les scénarios connecté / déconnecté.
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

// Fixture d'agrégats du cockpit : que des COMPTES, aucun contenu/PII.
// riven.relances_dues=2 + reshiram.a_etayer=1 → le cap ULTIMA cumule les deux ;
// zekrom.a_orienter=0 → ce terme-là ne doit PAS apparaître (test d'absence).
const COCKPIT = { ok: true, data: {
  reshiram: { talents: 3, a_etayer: 1, offre: 2 },
  zekrom: { ideaux: 3, a_orienter: 0, acquis: 2, a_construire: 1 },
  riven: { relances_dues: 2 },
} };

// ===================== A. La boussole racine (index.html) =====================
// Scénario CONNECTÉ : session présente → overlay masqué, boussole interactive.
console.log('— A. Boussole racine : les deux supra-divisions —');
await page.route('**/js/vendor/supabase-js-2.110.0.min.js',
  stubSupabase('{ user: { id: "u-test" }, access_token: "jeton-factice" }'));
// Connecté → la boussole interroge /api/cockpit : on le stube (sinon 404 = bruit).
await page.route('**/api/cockpit', (route) => route.fulfill({
  status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(COCKPIT),
}));
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });

const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Titre ligne 1 « Ultima Lv3 »', surligne === 'Ultima Lv3', `lu: ${surligne}`);
verifier('Titre ligne 2 = titre du registre', principal === NOEUDS.racine.titre, `lu: ${principal}`);
const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite présente', /Sur quoi est-ce qu'on travaille aujourd'hui/.test(invite || ''), `lu: ${invite}`);

// Les 2 caps : les supra-divisions, et rien d'autre à ce niveau.
const noms = (await page.locator('.cap-nom').allTextContents()).map((n) => n.trim());
verifier('2 caps rendus (les supra-divisions)', noms.length === 2, `trouvés: ${JSON.stringify(noms)}`);
for (const attendu of ['ULTIMA', 'ALPHA']) {
  verifier(`Cap ${attendu} présent`, noms.includes(attendu));
}
// Les projets ne sont plus des caps de la racine : ils vivent sous leur supra-division.
for (const parti of ['renoboost-ia', 'ycome', 'tao', 'reshiram', 'zekrom']) {
  verifier(`Plus de cap ${parti} à la racine`, (await page.locator(`.cap[data-id="${parti}"]`).count()) === 0);
}

// ULTIMA et ALPHA sont deux portes internes ouvertes.
const capUltima = page.locator('a.cap[data-id="ultima-perso"]');
verifier('Cap ULTIMA ouvrable (ancre)', (await capUltima.count()) === 1);
verifier('Cap ULTIMA pointe vers ultima.html',
  (await capUltima.getAttribute('href')) === 'ultima.html');
const capAlpha = page.locator('a.cap[data-id="alpha"]');
verifier('Cap ALPHA ouvrable (ancre)', (await capAlpha.count()) === 1);
verifier('Cap ALPHA pointe vers alpha.html',
  (await capAlpha.getAttribute('href')) === 'alpha.html');
verifier('Aucun cap « à venir » à la racine', (await page.locator('.cap--avenir').count()) === 0);
verifier('Aucune passerelle à la racine',
  (await page.locator('.boussole-aiguilles .passerelle').count()) === 0);

// Le cœur gravé + sa légende + les 2 aiguilles.
verifier('Cœur gravé au centre', (await page.locator('.boussole-coeur svg').count()) === 1);
const legende = (await page.locator('.boussole-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.racine.legende, `lu: ${legende}`);
verifier('2 aiguilles tracées', (await page.locator('.boussole-aiguilles .aiguille').count()) === 2);

// Le résumé Léo n'apparaît QU'au survol : au repos, le cartouche est
// invisible et muet (plus de messages affichés — Paul, 2026-08-01).
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));
verifier('Aucun résumé de projet au repos',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Survol d'ULTIMA → cap illuminé + résumé déposé.
await capUltima.hover();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
verifier('Cap ULTIMA illuminé au survol', await capUltima.evaluate((e) => e.classList.contains('is-actif')));
const paroleNom = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Résumé : nom du cap affiché', paroleNom === 'ULTIMA', `lu: ${paroleNom}`);
const paroleTexte = (await page.locator('#boussole-parole .parole-texte').textContent())?.trim();
verifier('Résumé : essentiel de Léo affiché', /supra-division personnelle/i.test(paroleTexte || ''), `lu: ${paroleTexte}`);
verifier('Résumé : appel à l\'action', (await page.locator('#boussole-parole .parole-action').count()) === 1);

// Sortie du survol → le cartouche s'efface entièrement (zéro surcharge).
await page.locator('h1.console-titre').hover();
await page.waitForSelector('#boussole-parole:not(.is-actif)', { state: 'attached', timeout: 5000 });
verifier('Sortie du survol → cartouche effacé',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0
  && await page.locator('#boussole-parole').evaluate((el) => getComputedStyle(el).visibility === 'hidden'));

// Accès clavier : le focus montre aussi le résumé (clavier = souris).
// La souris se gare dans un coin neutre AVANT : le focus fait défiler la page
// et un cap qui glisse sous un curseur immobile déclencherait un mouseenter
// parasite qui réécrirait le cartouche après celui du focus.
await page.mouse.move(5, 5);
await capAlpha.focus();
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const nomAlpha = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Focus clavier d\'un cap montre son résumé', nomAlpha === 'ALPHA', `lu: ${nomAlpha}`);

// Repli sans JS présent dans le document.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

// Contraste AA sur les couleurs réellement rendues.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const nom = getComputedStyle(document.querySelector('.cap-nom'));
  const t = getComputedStyle(document.querySelector('.console-titre'));
  const l = getComputedStyle(document.querySelector('.boussole-legende'));
  return {
    parcheminCarte: cs.getPropertyValue('--parchemin-carte').trim(),
    merProfonde: cs.getPropertyValue('--mer-profonde').trim(),
    nom: nom.color, titre: t.color, legende: l.color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.parcheminCarte);
verifier('Contraste nom de cap ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.merProfonde);
verifier('Contraste titre sur fond mer ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
const rLeg = ratio(versHex(styles.legende), styles.merProfonde);
verifier('Contraste légende sur mer ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (boussole)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ============ B. Navigation racine → ULTIMA (supra-division) ============
console.log('— B. ULTIMA → /ultima.html (la supra-division) —');
await capUltima.click();
await page.waitForURL('**/ultima.html', { timeout: 20000 });
verifier('Clic ULTIMA → URL ultima.html', /\/ultima\.html$/.test(page.url()), page.url());
await page.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });
const capsUltima = (await page.locator('.cap-nom').allTextContents()).map((n) => n.trim());
verifier('Boussole ULTIMA : les 2 macro-quadrants (GRIMA, NAGA)',
  JSON.stringify(capsUltima) === JSON.stringify(['GRIMA', 'NAGA']), JSON.stringify(capsUltima));
verifier('Retour vers la racine présent',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// ============ C. Verrou d'accueil : déconnecté = boussole cachée ============
// La racine est la porte de connexion unique : sans session, l'écran de
// connexion couvre tout, la boussole est inerte, Google / lien magique offerts.
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
await pageDeco.locator('#bouton-google').click();
await pageDeco.waitForTimeout(200);
verifier('Clic Google → signInWithOAuth(\'google\')',
  await pageDeco.evaluate(() => window.__oauthAppele === 'google'));
verifier('Zéro erreur console (accueil déconnecté)', erreursDeco.length === 0, erreursDeco.slice(0, 3).join(' | '));

// ============ D. Connecté : le verrou se lève + le COCKPIT ============
const ctxCo = await navigateur.newContext();
const pageCo = await ctxCo.newPage();
const erreursCo = [];
pageCo.on('console', (msg) => { if (msg.type() === 'error') erreursCo.push(msg.text()); });
pageCo.on('pageerror', (err) => erreursCo.push(String(err)));
await pageCo.route('**/js/vendor/supabase-js-2.110.0.min.js',
  stubSupabase('{ user: { id: "u-test" }, access_token: "jeton-factice" }'));
let bearerCockpit = '';
await pageCo.route('**/api/cockpit', (route) => {
  bearerCockpit = route.request().headers().authorization || '';
  return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(COCKPIT) });
});
await pageCo.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await pageCo.waitForSelector('.boussole-plateau.is-pret', { timeout: 20000 });
verifier('Connecté : écran de connexion masqué', await pageCo.locator('#ecran-connexion').isHidden());
verifier('Connecté : boussole non inerte', await pageCo.evaluate(() => {
  const scene = document.querySelector('.boussole-scene');
  return !!scene && !scene.hasAttribute('inert');
}));

// Cockpit : le Bearer de la session est transmis à /api/cockpit.
await pageCo.waitForResponse('**/api/cockpit', { timeout: 10000 }).catch(() => {});
verifier('Cockpit : Bearer transmis à /api/cockpit', bearerCockpit === 'Bearer jeton-factice', `lu: ${bearerCockpit}`);

// Le cap ULTIMA cumule ce que ses quadrants ont à traiter : RIVEN (2 relances
// dues) + TAO (1 talent à étayer). a_orienter=0 → ce terme reste masqué.
await pageCo.locator('.cap[data-id="ultima-perso"]').hover();
await pageCo.waitForSelector('.parole-signal', { timeout: 5000 }).catch(() => {});
const signalU = (await pageCo.locator('.parole-signal').textContent()) || '';
verifier('Badge ULTIMA « À traiter — 2 relances dues · 1 talent à étayer »',
  /À traiter/.test(signalU) && /2 relances dues/.test(signalU) && /1 talent à étayer/.test(signalU)
    && !/à orienter/.test(signalU), `lu: ${signalU}`);

// Contraste AA du badge (encre rouge sobre sur parchemin ombré).
const cSig = await pageCo.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    fond: cs.getPropertyValue('--parchemin-ombre').trim(),
    texte: getComputedStyle(document.querySelector('.parole-signal')).color,
  };
});
verifier('Contraste badge signal ≥ 4,5:1', ratio(versHex(cSig.texte), cSig.fond) >= 4.5,
  `${ratio(versHex(cSig.texte), cSig.fond).toFixed(2)}:1`);

// ALPHA n'a aucune donnée interne : ni ligne vivante, ni badge (texte figé seul).
await pageCo.locator('.cap[data-id="alpha"]').focus();
await pageCo.waitForTimeout(150);
verifier('Cap sans data (ALPHA) : aucune ligne vivante',
  (await pageCo.locator('.parole-cockpit').count()) === 0);
verifier('Cap sans data (ALPHA) : aucun badge',
  (await pageCo.locator('.parole-signal').count()) === 0);

// Fonctions pures exposées (aucune donnée réelle) — le cap TAO agrège
// RESHIRAM + ZEKROM ; les branches restent pures et testables ici aussi.
const pur = await pageCo.evaluate((d) => ({
  tao: window.UltimaBoussole.ligneVivante('tao', d),
  r: window.UltimaBoussole.ligneVivante('reshiram', d),
  z: window.UltimaBoussole.ligneVivante('zekrom', d),
  vide: window.UltimaBoussole.ligneVivante('alpha', d),
  sansData: window.UltimaBoussole.ligneVivante('tao', null),
}), COCKPIT.data);
verifier('ligneVivante pure : TAO agrège R+Z',
  /3 talents réels · 1 à étayer — 3 idéaux · 0 à orienter\./.test(pur.tao || ''), `lu: ${pur.tao}`);
verifier('ligneVivante pure : RESHIRAM', /3 talents réels · 1 à étayer\./.test(pur.r || ''), `lu: ${pur.r}`);
verifier('ligneVivante pure : ZEKROM', /3 idéaux · 0 à orienter · 2 talents reliés \(acquis\), 1 à construire\./.test(pur.z || ''), `lu: ${pur.z}`);
verifier('ligneVivante pure : cap sans data → null', pur.vide === null && pur.sansData === null);

const sig = await pageCo.evaluate((d) => ({
  supra: window.UltimaBoussole.signalDe('ultima-perso', d),
  riven: window.UltimaBoussole.signalDe('riven', d),
  tao: window.UltimaBoussole.signalDe('tao', d),           // a_etayer=1, a_orienter=0
  taoDouble: window.UltimaBoussole.signalDe('tao', { reshiram: { a_etayer: 2 }, zekrom: { a_orienter: 3 } }),
  taoZero: window.UltimaBoussole.signalDe('tao', { reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 } }),
  alpha: window.UltimaBoussole.signalDe('alpha', d),        // pas de signal défini
  sansData: window.UltimaBoussole.signalDe('tao', null),
}), COCKPIT.data);
verifier('signalDe pur : ULTIMA cumule RIVEN + TAO',
  sig.supra === '2 relances dues · 1 talent à étayer', `lu: ${sig.supra}`);
verifier('signalDe pur : RIVEN seul → « 2 relances dues »', sig.riven === '2 relances dues', `lu: ${sig.riven}`);
verifier('signalDe pur : TAO (1 à étayer, 0 à orienter) → « 1 talent à étayer »',
  sig.tao === '1 talent à étayer', `lu: ${sig.tao}`);
verifier('signalDe pur : TAO (2 à étayer · 3 à orienter) → cumul des deux termes',
  sig.taoDouble === '2 talents à étayer · 3 idéaux à orienter', `lu: ${sig.taoDouble}`);
verifier('signalDe pur : TAO (cumul 0) → null', sig.taoZero === null);
verifier('signalDe pur : cap sans signal / sans data → null', sig.alpha === null && sig.sansData === null);

verifier('Zéro erreur console (accueil connecté + cockpit)', erreursCo.length === 0, erreursCo.slice(0, 3).join(' | '));

await navigateur.close();

console.log(echecs === 0 ? '\n=== SMOKE BOUSSOLE VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
