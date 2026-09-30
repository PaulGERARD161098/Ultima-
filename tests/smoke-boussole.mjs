// La RACINE (Ultima Lv3 — index.html), passée AU CIEL le 2026-08-19 (LV5 / P4,
// étape ④c de CADRAGE-LV4 : la dernière coque, sur un module éprouvé huit
// fois). Prouve : bandeau « Ultima Lv3 / Bienvenue » + invite (la racine GARDE
// son invite — les coques ordinaires l'ont retirée, l'accueil est l'écran qui
// pose la question du jour), les caps du registre rendus en étoiles (OMEGA,
// ALPHA, ALTHEA), le filigrane et sa légende, le résumé de Léo qui n'apparaît
// QU'au survol/focus, AUCUNE requête réseau externe (zéro CDN), zéro erreur
// console, contraste AA sur les couleurs réellement rendues.
// Puis navigation : clic OMEGA → /omega.html (le ciel de la supra-division).
// Enfin le verrou d'accueil (déconnecté = scène cachée et inerte) et le
// COCKPIT (les agrégats derrière Bearer, jamais dans le HTML).
// La MIGRATION BOUSSOLE → CIEL a repris chaque assertion UNE PAR UNE, classée
// portée / remplacée / abandonnée avec sa raison — le détail est écrit en
// marge de chacune, comme smoke-console.mjs l'avait fait pour la coque pilote.
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
// riven.relances_dues=2 + reshiram.a_etayer=1 → le cap OMEGA cumule les deux ;
// zekrom.a_orienter=0 → ce terme-là ne doit PAS apparaître (test d'absence).
const COCKPIT = { ok: true, data: {
  reshiram: { talents: 3, a_etayer: 1, offre: 2 },
  zekrom: { ideaux: 3, a_orienter: 0, acquis: 2, a_construire: 1 },
  riven: { relances_dues: 2 },
} };

// ===================== A. La racine au ciel (index.html) =====================
// Scénario CONNECTÉ : session présente → overlay masqué, ciel interactif.
console.log('— A. La racine au ciel : deux supra-divisions et ALTHEA —');
await page.route('**/js/vendor/supabase-js-2.110.0.min.js',
  stubSupabase('{ user: { id: "u-test" }, access_token: "jeton-factice" }'));
// Connecté → le cockpit interroge /api/cockpit : on le stube (sinon 404 = bruit).
await page.route('**/api/cockpit', (route) => route.fulfill({
  status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(COCKPIT),
}));
// … et depuis le 02/09, l'accueil interroge AUSSI /api/finubar (la couleur
// d'appel + le bandeau). Même motif, même raison : un 404 non stubé se
// présenterait ici comme une erreur console, c'est-à-dire comme un défaut du
// produit alors que ce serait un manque du banc d'essai. On rend un agrégat
// VIDE : ce harnais-ci ne juge pas Finubar (c'est smoke-accueil-finubar), il
// exige seulement que sa présence ne casse rien.
await page.route('**/api/finubar', (route) => route.fulfill({
  status: 200, contentType: 'application/json; charset=utf-8',
  body: JSON.stringify({ ok: true, data: { le: '2026-09-02', projets: [], macro: {}, cartouche: { signaux: [] } } }),
}));
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
// REMPLACÉE : on attendait la rose (`.boussole-plateau.is-pret`), on attend les
// étoiles. Même garantie : l'écran est prêt avant la première assertion.
await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });

// PORTÉES telles quelles : le bandeau appartient à la coque, pas au moteur.
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Titre ligne 1 « Ultima Lv3 »', surligne === 'Ultima Lv3', `lu: ${surligne}`);
verifier('Titre ligne 2 = titre du registre', principal === NOEUDS.racine.titre, `lu: ${principal}`);
// PORTÉE, et c'est une SPÉCIFICITÉ DE LA RACINE : les coques ordinaires ont
// retiré l'invite (smoke-console l'éprouve par l'absence) ; l'accueil la garde
// — « le bandeau et l'invite deviennent du HUD » (CADRAGE-LV5 §P4).
const invite = (await page.locator('.console-invite').textContent())?.trim();
verifier('Invite présente', /Sur quoi est-ce qu'on travaille aujourd'hui/.test(invite || ''), `lu: ${invite}`);

// Les caps de la racine : les deux supra-divisions ET ALTHEA (Paul, 2026-08-07).
// On compte d'après le REGISTRE, jamais d'après un nombre écrit à la main.
// REMPLACÉE : les noms se lisent sur les étoiles. L'ORDRE est abandonné avec sa
// raison — une constellation range par géométrie, l'ordre du DOM y suit la
// profondeur et non le registre. On compare des ensembles ; la garantie qui
// comptait (les caps du registre, tous et rien qu'eux) est intacte.
const attendus = NOEUDS.racine.enfants.map((id) => NOEUDS[id].nom);
const noms = (await page.locator('#ciel-noeud-scene text.ciel-nom').allTextContents())
  .map((n) => n.trim());
verifier('les caps rendus = ceux du registre',
  JSON.stringify(noms.slice().sort()) === JSON.stringify(attendus.slice().sort()),
  `trouvés: ${JSON.stringify(noms)}`);
// REMPLACÉE : « une aiguille par cap » vérifiait que la géométrie suit le
// registre ; le ciel n'a pas d'aiguilles, l'étoile est ce que l'aiguille
// approchait. LE COMPTE SE LIT SUR UN CIEL AU REPOS (un survol déplie).
verifier('une étoile par cap, ni plus ni moins',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id]').count()) === attendus.length,
  `${attendus.length} attendues`);
// Les projets ne sont plus des caps de la racine : ils vivent sous leur
// supra-division. PORTÉE, nouveau sélecteur, même preuve par l'ABSENCE.
for (const parti of ['renoboost-ia', 'dokles', 'sympho', 'ycome', 'tao', 'reshiram', 'zekrom']) {
  verifier(`Plus de cap ${parti} à la racine`,
    (await page.locator(`#ciel-noeud-scene .ciel-etoile[data-noeud-id="${parti}"]`).count()) === 0);
}
// PORTÉES : aucun cap « à venir » ni passerelle à la racine — sélecteurs du
// ciel (aria-disabled pour l'inertie, `.ciel-liens line` pour les arcs).
verifier('Aucun cap « à venir » à la racine',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[aria-disabled]').count()) === 0);
verifier('Aucune passerelle à la racine',
  (await page.locator('#ciel-noeud-scene .ciel-liens line').count()) === 0);

// REMPLACÉES : le cœur gravé devient le filigrane du plateau, la légende garde
// son mot du registre — mêmes garanties, sélecteurs du ciel.
verifier('Cœur gravé (filigrane)', (await page.locator('.ciel-filigrane svg').count()) === 1);
const legende = (await page.locator('.ciel-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.racine.legende, `lu: ${legende}`);

// PORTÉES telles quelles : le cartouche de parole appartient à la coque.
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));
verifier('Aucun résumé de projet au repos',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0);

// Survol d'OMEGA → résumé déposé. REMPLACÉE dans sa mécanique : `hover()`
// expire sur le ciel (la caméra glisse de façon asymptotique, rien n'est
// jamais « stable » au sens de Playwright) — on envoie l'événement, comme
// partout ailleurs dans le patrimoine.
const etoileOmega = page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="omega"]');
await etoileOmega.dispatchEvent('mouseenter');
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleNom = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Résumé : nom du cap affiché', paroleNom === 'OMEGA', `lu: ${paroleNom}`);
const paroleTexte = (await page.locator('#boussole-parole .parole-texte').textContent())?.trim();
verifier('Résumé : essentiel de Léo affiché', /supra-division personnelle/i.test(paroleTexte || ''), `lu: ${paroleTexte}`);
verifier('Résumé : appel à l\'action', (await page.locator('#boussole-parole .parole-action').count()) === 1);
// ABANDONNÉE avec sa raison : « cap illuminé au survol » lisait la classe
// `is-actif` du cap de la boussole. Au ciel, l'approche d'une étoile se voit
// par le DÉPLIAGE (ses enfants naissent) et le cartouche actif — deux effets
// déjà éprouvés, ici et dans smoke-lv4-ciel. Une classe d'illumination n'existe
// pas sur l'étoile, et en inventer une pour le test serait tester le test.

// Sortie du survol → le cartouche s'efface entièrement (zéro surcharge).
// La sortie se dit à l'ÉTOILE (mouseleave) : au ciel, c'est elle qui écoute —
// survoler un autre élément ne la quitte pas pour Playwright, qui n'anime pas
// de vrai curseur quand on dispatch des événements.
await etoileOmega.dispatchEvent('mouseleave');
await page.waitForSelector('#boussole-parole:not(.is-actif)', { state: 'attached', timeout: 5000 });
verifier('Sortie du survol → cartouche effacé',
  (await page.locator('#boussole-parole .parole-texte').count()) === 0
  && await page.locator('#boussole-parole').evaluate((el) => getComputedStyle(el).visibility === 'hidden'));

// PORTÉE : le focus vit sur le GROUPE de l'étoile (tabindex="0", nom
// accessible, touche Entrée) — clavier = souris.
await page.mouse.move(5, 5);
const etoileAlpha = page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"]');
await etoileAlpha.evaluate((el) => el.focus());
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const nomAlpha = (await page.locator('#boussole-parole .parole-nom').textContent())?.trim();
verifier('Focus clavier d\'un cap montre son résumé', nomAlpha === 'ALPHA', `lu: ${nomAlpha}`);

// PORTÉE : repli sans JS présent dans le document.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

// Contraste AA sur les couleurs réellement rendues.
// REMPLACÉES : ces mesures lisaient des encres posées sur du parchemin et de
// la mer. La racine est passée au ciel : le nom du cap est peint sur une
// étoile, le titre et la légende sur la nuit. Les mêmes grandeurs sont donc
// mesurées CONTRE LE FOND QUI LES PORTE RÉELLEMENT — changer d'étalon sans
// changer de fond aurait donné un chiffre flatteur et faux. Le seuil ne bouge
// pas : AA, 4,5:1.
const styles = await page.evaluate(() => {
  const plateau = getComputedStyle(document.getElementById('ciel-noeud-plateau'));
  const nom = document.querySelector('#ciel-noeud-scene text.ciel-nom');
  const t = getComputedStyle(document.querySelector('.console-titre'));
  const l = getComputedStyle(document.querySelector('.ciel-legende'));
  return {
    nuit: plateau.getPropertyValue('--ciel-nuit-haute').trim(),
    nom: nom ? getComputedStyle(nom).fill : null,
    titre: t.color, legende: l.color,
  };
});
const rNom = ratio(versHex(styles.nom), styles.nuit);
verifier('Contraste nom de cap ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), styles.nuit);
verifier('Contraste titre sur fond de nuit ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
const rLeg = ratio(versHex(styles.legende), styles.nuit);
verifier('Contraste légende sur la nuit ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

verifier('Zéro requête réseau externe (aucun CDN)', requetesExternes.length === 0,
  requetesExternes.slice(0, 3).join(', '));
verifier('Zéro erreur console (racine au ciel)', erreursConsole.length === 0, erreursConsole.slice(0, 3).join(' | '));

// ALTHEA s'ouvre d'un seul geste depuis l'accueil — c'est la raison d'être de
// sa place ici. REMPLACÉE par une preuve PLUS FORTE : la boussole exposait un
// href qu'on lisait ; l'étoile est un `<g role="button">` (l'ancre SVG fait
// perdre le focus clavier — mesuré sur la coque pilote), on prouve donc la
// porte en la FRANCHISSANT. Ce qui est perdu : clic du milieu / nouvel onglet ;
// ce qui le rattrape : le repli <noscript> liste toutes les portes.
await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="althea"]').dispatchEvent('click');
await page.waitForURL('**/althea.html', { timeout: 8000 }).catch(() => {});
verifier('ALTHEA s\'ouvre en un geste depuis l\'accueil',
  /\/althea\.html$/.test(page.url()), page.url());
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
// ---- ASSERTION REMPLACÉE le 2026-08-28 (l'isolement), pas abandonnée ----
// Elle disait : « cliquer ALPHA ouvre alpha.html ». Depuis que ce qui CONTIENT
// s'isole au lieu de changer de page (Paul : « ça m'affiche uniquement cette
// constellation et plus les autres »), ce clic ne navigue plus — l'exiger
// reviendrait à éprouver le geste d'hier sur le produit d'aujourd'hui.
// CE QUI COMPTAIT EST TENU AUTREMENT : le clic donne accès au CONTENU d'ALPHA,
// sur place ; et la porte `alpha.html` reste servie par le repli <noscript> —
// qui est, le jour où le ciel ne se peint pas, la navigation elle-même.
await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"]').dispatchEvent('click');
await page.waitForTimeout(1400);
const dansAlpha = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('Clic ALPHA : son contenu paraît SUR PLACE (isolement)',
  NOEUDS.alpha.enfants.every((id) => dansAlpha.includes(id)),
  JSON.stringify(dansAlpha));
// Éprouvé par l'ABSENCE, qui est la moitié de la demande : les frères ont
// disparu. Vérifier seulement que le contenu d'ALPHA est là ne dirait rien de
// ce qui devait s'éteindre.
verifier('Clic ALPHA : les frères ont disparu du ciel',
  !dansAlpha.includes('omega') && !dansAlpha.includes('althea'),
  JSON.stringify(dansAlpha));
verifier('Clic ALPHA : on n’a PAS changé de page', /\/#alpha$/.test(page.url()), page.url());
verifier('La porte alpha.html reste servie par le repli <noscript>',
  (await page.evaluate(() => {
    const n = document.querySelector('#ciel-noeud-plateau noscript');
    return n ? (n.textContent + ' ' + n.innerHTML).includes('alpha.html') : false;
  })) === true);
await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });

// ============ B. Navigation racine → OMEGA (supra-division) ============
console.log('— B. OMEGA → /omega.html (la supra-division) —');
// REMPLACÉE une première fois (le clic passe par l'étoile, le cap-ancre
// n'existe plus), puis le 2026-08-28 : le clic ISOLE au lieu d'ouvrir la page.
// Le geste est éprouvé pour ce qu'il fait maintenant — OMEGA montre ses trois
// caps sur place —, et la PORTE, elle, s'éprouve en l'ouvrant par son
// adresse : c'est celle que sert le repli <noscript> et que porte tout lien
// direct. Les deux moitiés de l'ancienne assertion sont donc tenues, chacune
// là où elle a désormais un sens.
await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="omega"]')
  .dispatchEvent('click');
await page.waitForTimeout(1400);
const dansOmega = await page.$$eval('#ciel-noeud-scene .ciel-etoile[data-noeud-id]',
  (gs) => gs.map((g) => g.getAttribute('data-noeud-id')));
verifier('Clic OMEGA : ses trois caps paraissent sur place',
  NOEUDS['omega'].enfants.every((id) => dansOmega.includes(id))
  && !dansOmega.includes('alpha'), JSON.stringify(dansOmega));
await page.goto(`${BASE}/omega.html`, { waitUntil: 'load', timeout: 20000 });
verifier('La porte OMEGA s’ouvre (omega.html)', /\/omega\.html$/.test(page.url()), page.url());
// OMEGA EST PASSÉE AU CIEL le 2026-08-13 (étape ④a) : c'est la coque pilote.
// Les assertions de cette section ont été reprises UNE PAR UNE et classées.
//   — « Clic OMEGA → URL omega.html » : PORTÉE (la racine est passée au ciel
//     à son tour le 2026-08-19 — P4, la dernière coque).
//   — L'attente du plateau : REMPLACÉE — on attend les étoiles au lieu de la
//     rose. Même garantie : l'écran est prêt.
//   — « les caps du registre » : REMPLACÉE, et l'ORDRE est abandonné avec sa
//     raison. Une boussole range ses caps en liste ; une constellation les pose
//     par géométrie, et l'ordre du DOM y suit la profondeur, pas le registre.
//     On compare donc des ENSEMBLES. La garantie qui comptait — tous les caps
//     du registre, et rien qu'eux — est intégralement tenue ; celle qu'on lâche
//     est un ordre que le nouveau support ne porte pas.
//   — « ALTHEA n'est plus un cap » : PORTÉE, nouveau sélecteur, même preuve par
//     l'ABSENCE.
//   — « Retour vers la racine » : PORTÉE telle quelle.
await page.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
const capsOmega = (await page.locator('#ciel-noeud-scene text.ciel-nom').allTextContents())
  .map((n) => n.trim());
const attendusOmega = NOEUDS['omega'].enfants.map((id) => NOEUDS[id].nom);
// 2026-08-01 : deux macro-quadrants. 2026-08-06 : ALTHEA s'y ajoute.
// 2026-08-07 : Paul remonte ALTHEA à la racine. 2026-09-29 : GRIMA et NAGA
// sont supprimés, OMEGA porte RIVEN, NICOL BOLAS et IMLADRIK.
verifier('Ciel OMEGA : les caps du registre, tous et rien qu\'eux',
  JSON.stringify(capsOmega.slice().sort()) === JSON.stringify(attendusOmega.slice().sort()),
  JSON.stringify(capsOmega));
// Éprouvé par l'ABSENCE : ALTHEA a quitté cet étage. Sans ce contrôle, un
// doublon de nœud laisserait le cap ici sans qu'aucune assertion ne bronche.
verifier('ALTHEA n’est PLUS un cap d’OMEGA',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="althea"]').count()) === 0
    && !capsOmega.includes('ALTHEA'), JSON.stringify(capsOmega));
// Les macro-quadrants supprimés (29/09) n'ont plus d'étoile : absence éprouvée.
verifier('GRIMA et NAGA ne sont PLUS des caps d\'OMEGA',
  (await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="grima"], #ciel-noeud-scene .ciel-etoile[data-noeud-id="naga"]').count()) === 0
    && capsOmega.length === 3 && !capsOmega.includes('GRIMA') && !capsOmega.includes('NAGA'),
  JSON.stringify(capsOmega));
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
await pageCo.route('**/api/finubar', (route) => route.fulfill({
  status: 200, contentType: 'application/json; charset=utf-8',
  body: JSON.stringify({ ok: true, data: { le: '2026-09-02', projets: [], macro: {}, cartouche: { signaux: [] } } }),
}));
let bearerCockpit = '';
await pageCo.route('**/api/cockpit', (route) => {
  bearerCockpit = route.request().headers().authorization || '';
  return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: JSON.stringify(COCKPIT) });
});
await pageCo.goto(`${BASE}/`, { waitUntil: 'load', timeout: 20000 });
await pageCo.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
await pageCo.waitForSelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id]', { timeout: 20000 });
verifier('Connecté : écran de connexion masqué', await pageCo.locator('#ecran-connexion').isHidden());
verifier('Connecté : boussole non inerte', await pageCo.evaluate(() => {
  const scene = document.querySelector('.boussole-scene');
  return !!scene && !scene.hasAttribute('inert');
}));

// Cockpit : le Bearer de la session est transmis à /api/cockpit.
await pageCo.waitForResponse('**/api/cockpit', { timeout: 10000 }).catch(() => {});
verifier('Cockpit : Bearer transmis à /api/cockpit', bearerCockpit === 'Bearer jeton-factice', `lu: ${bearerCockpit}`);

// Le cap OMEGA cumule ce que ses quadrants ont à traiter : RIVEN (2 relances
// dues) + TAO (1 talent à étayer). a_orienter=0 → ce terme reste masqué.
await pageCo.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="omega"]')
  .dispatchEvent('mouseenter');
await pageCo.waitForSelector('.parole-signal', { timeout: 5000 }).catch(() => {});
const signalU = (await pageCo.locator('.parole-signal').textContent()) || '';
verifier('Badge OMEGA « À traiter — 2 relances dues · 1 talent à étayer »',
  /À traiter/.test(signalU) && /2 relances dues/.test(signalU) && /1 talent à étayer/.test(signalU)
    && !/à orienter/.test(signalU), `lu: ${signalU}`);

// Contraste AA du badge. REMPLACÉ dans son étalon : le cartouche du ciel est
// une plaque de nuit, plus un parchemin ombré — on mesure contre le fond qui
// porte réellement l'encre (même règle que les contrastes de la section A).
const cSig = await pageCo.evaluate(() => {
  const plateau = getComputedStyle(document.getElementById('ciel-noeud-plateau'));
  return {
    fond: plateau.getPropertyValue('--ciel-nuit-haute').trim(),
    texte: getComputedStyle(document.querySelector('.parole-signal')).color,
  };
});
verifier('Contraste badge signal ≥ 4,5:1', ratio(versHex(cSig.texte), cSig.fond) >= 4.5,
  `${ratio(versHex(cSig.texte), cSig.fond).toFixed(2)}:1`);

// ALPHA n'a aucune donnée interne : ni ligne vivante, ni badge (texte figé seul).
// ON QUITTE D'ABORD OMEGA, ET CE N'EST PAS DE LA POLITESSE — c'est ce qui
// ANNULE SON MINUTEUR DE DÉPLIAGE. `mouseenter` arme `setTimeout(deplier)` :
// sans `mouseleave`, ce minuteur se déclenche pendant qu'on regarde ALPHA, le
// re-dessin détruit l'étoile focalisée, et `focusARendre` rend le focus à
// OMEGA — dont le badge réapparaît. Le verdict « aucun badge » tombait alors,
// de façon INTERMITTENTE (la course dépend de la charge de la machine).
// Trouvé par une contre-passe qui a rougi là où la passe précédente était
// verte : *un test qui dépend d'un minuteur qu'il n'a pas désarmé ne teste pas
// ce qu'il croit — il teste la vitesse du jour.*
await pageCo.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="omega"]')
  .dispatchEvent('mouseleave');
await pageCo.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"]')
  .evaluate((el) => el.focus());
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
  supra: window.UltimaBoussole.signalDe('omega', d),
  riven: window.UltimaBoussole.signalDe('riven', d),
  imladrik: window.UltimaBoussole.signalDe('imladrik', d),
  grima: window.UltimaBoussole.signalDe('grima', d),
  tao: window.UltimaBoussole.signalDe('tao', d),           // a_etayer=1, a_orienter=0
  taoDouble: window.UltimaBoussole.signalDe('tao', { reshiram: { a_etayer: 2 }, zekrom: { a_orienter: 3 } }),
  taoZero: window.UltimaBoussole.signalDe('tao', { reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 } }),
  alpha: window.UltimaBoussole.signalDe('alpha', d),        // pas de signal défini
  sansData: window.UltimaBoussole.signalDe('tao', null),
}), COCKPIT.data);
verifier('signalDe pur : OMEGA cumule RIVEN + TAO',
  sig.supra === '2 relances dues · 1 talent à étayer', `lu: ${sig.supra}`);
verifier('signalDe pur : IMLADRIK ne cumule que TAO (pas les relances de RIVEN)',
  sig.imladrik === '1 talent à étayer', `lu: ${sig.imladrik}`);
verifier('signalDe pur : GRIMA (supprimé) → null', sig.grima === null);
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
