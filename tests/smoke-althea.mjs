// Quadrant ALTHEA (B1) : le Système — le profil, les skills, les stats, le jour.
// DERRIÈRE AUTH. Miroir de smoke-draukhain.mjs. Prouve :
//   A. althea.html SANS session (config vide) : FAIL-CLOSED — aucune donnée au
//      DOM, la page le dit, retour vers la racine (index.html, parent du registre), zéro requête externe,
//      zéro erreur console.
//   B. althea.html avec FAUSSE session + /api/althea STUBÉE 200 (fixture
//      NEUTRE inventée — jamais les gestes réels de Paul) : profil rendu,
//      stats = socle + niveau, skills en lignes, gestes du jour cochables,
//      Bearer et jour local transmis, et **les trois états d'un geste**.
//   C. Les invariants de forme : deux blocs alignés en tête, aucun texte sous
//      9 px, contrastes AA, aucun débordement horizontal à 390 px.
//   D. althea.html + 401 → fail-closed propre.
//
// ⚠️ FIXTURE NEUTRE, ET C'EST VOLONTAIRE : les libellés réels d'ALTHEA sont de
// la donnée de santé (§9). Un harnais est lu, relu et parfois publié — il
// n'héberge pas les gestes de Paul.
import { chromium } from 'playwright';
import { NOEUDS, chemin } from '../js/registre-lv3.mjs';

const BASE = 'http://127.0.0.1:8123';

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs++; }
}

function luminance(hex) {
  const m = hex.replace('#', '').match(/.{2}/g).map((h) => parseInt(h, 16) / 255);
  const lin = m.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function ratio(a, b) {
  const la = luminance(a); const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

// Le jour « aujourd'hui » vu du navigateur, en local — la fixture doit s'y
// caler, sinon les gestes du jour ne seraient jamais cochés.
function jourLocal(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const AUJOURDHUI = jourLocal();
const HIER = jourLocal(new Date(Date.now() - 86400000));

// Fixture NEUTRE : deux skills, trois conditions, deux relevés.
const FIXTURE = {
  avatar: { nom: 'Le Voyageur', titre_code: 'Farsight', socle_niveau: 40 },
  stats: [
    { id: 'st1', code: 'force', socle: 14 },
    { id: 'st2', code: 'intelligence', socle: 21 },
  ],
  skills: [
    { id: 'sk1', nom: 'LANGUE DU NORD', enonce: 'parle une langue de plus', nourriture: 'tous', seuils: [1, 3, 8, 12, 20], actif: true },
    { id: 'sk2', nom: 'MARCHE', enonce: 'marche chaque jour', nourriture: 'tous', seuils: [1, 3, 8, 12, 20], actif: true },
  ],
  conditions: [
    { id: 'c1', skill_id: 'sk1', libelle: 'Étude du soir', nature: 'pratique', cadence: 'quotidien', groupe: 0, actif: true },
    { id: 'c2', skill_id: 'sk2', libelle: 'Sortir marcher', nature: 'pratique', cadence: 'quotidien', groupe: 0, actif: true },
    { id: 'c3', skill_id: 'sk2', libelle: 'Marche longue', nature: 'pratique', cadence: 'volume_semaine', seuil: 10, unite: 'km', groupe: 1, actif: true },
  ],
  releves: [
    { id: 'r1', condition_id: 'c1', jour: HIER, tenu: true },
    { id: 'r2', condition_id: 'c1', jour: AUJOURDHUI, tenu: true },
  ],
};

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function nouvellePage(options = {}) {
  const page = await navigateur.newPage({ viewport: options.viewport || { width: 1440, height: 900 } });
  const erreurs = [];
  page.on('console', (msg) => { if (msg.type() === 'error') erreurs.push(msg.text()); });
  page.on('pageerror', (err) => erreurs.push(String(err)));
  const externes = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
  });
  if (options.configVide) {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'ULTIMA_CONFIG', {
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
      });
    });
  }
  return { page, erreurs, externes };
}

// Fausse session — motif de la maison (smoke-draukhain) : on SÈME un jeton dans
// le localStorage et on laisse le VRAI client supabase-js le lire. C'est plus
// juste que de stuber `window.supabase` : le vendor s'installe après nos
// scripts d'init et écraserait le stub — un piège qui donne un harnais vert sur
// une page morte.
const REF_SUPABASE = 'leosfqyidgsaescjbfom';
async function fausseSession(page) {
  await page.addInitScript(`try {
    window.localStorage.setItem('sb-${REF_SUPABASE}-auth-token', JSON.stringify({
      access_token: 'JETON-TEST',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'jeton-refresh',
      user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
    }));
  } catch (e) {}`);
  // Aucun appel réel vers Supabase ne doit sortir du harnais.
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) => route.fulfill({
    status: 503, contentType: 'application/json', body: '{}',
  }));
}

// ===================== A. SANS session : fail-closed =====================
console.log('— A. althea.html SANS session (fail-closed) —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/althea.html`);
  await page.waitForTimeout(400);

  const corps = await page.evaluate(() => document.body.textContent);
  verifier('la page le dit au lieu de mentir', /Ouvre ta session/.test(corps));
  verifier('aucun chiffre de niveau au DOM',
    (await page.textContent('#althea-niveau')) === '—');
  verifier('aucun skill rendu',
    (await page.locator('.althea-skill').count()) === 0);
  // Le retour mène au PARENT DU REGISTRE : ALTHEA est une étoile de la RACINE
  // (Paul, 07/08 : « je veux althea ici »), donc `index.html`. Ce contrôle
  // exigeait `ultima.html` depuis le 14/09 — la supra-division ULTIMA, une
  // constellation SŒUR : le piège des deux « Ultima » que le journal du 07/08
  // décrit mot pour mot. Lu dans le registre, il ne peut plus diverger de lui.
  const parentAlthea = chemin('althea', NOEUDS).slice(-2, -1)[0];
  verifier('retour vers le parent du registre (la racine → index.html)',
    parentAlthea === 'racine' && (await page.getAttribute('.retour-althea', 'href')) === 'index.html');
  // Un écran qui dit « ouvre ta session » DOIT donner la porte : constater sans
  // proposer le geste, c'est obliger Paul à le chercher (leçon VRANESH).
  verifier('la porte de connexion est offerte, pas seulement nommée',
    (await page.locator('.althea-porte a[href="/"]').count()) === 1);
  verifier('zéro requête externe', externes.length === 0, externes.join(', '));
  verifier('zéro erreur console', erreurs.length === 0, erreurs.join(' | '));

  // §9 — le HTML SERVI est muet : la preuve par l'ABSENCE, sur la source brute.
  const source = (await (await fetch(`${BASE}/althea.html`)).text())
    .replace(/<!--[\s\S]*?-->/g, '');
  // PREUVE PAR L'ABSENCE : on cherche les VALEURS de la fixture dans ce qui est
  // servi, et on exige de ne pas les y trouver. Chercher des mots statiques de
  // la page (« socle », « niveau ») ne prouverait rien — ce sont ses libellés.
  const fuites = ['Le Voyageur', 'Farsight', 'Étude du soir', 'Sortir marcher',
    'LANGUE DU NORD', 'MARCHE'].filter((v) => source.includes(v));
  verifier('aucune donnée dans le HTML servi', fuites.length === 0, fuites.join(', '));
  await page.close();
}

// ===================== B. Avec session + API stubée =====================
console.log('— B. althea.html avec session et Système peuplé —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await fausseSession(page);

  const appels = [];
  await page.route('**/api/althea*', async (route) => {
    const req = route.request();
    appels.push({
      methode: req.method(),
      bearer: req.headers().authorization,
      jour: req.headers()['x-jour-local'],
      corps: req.postData(),
    });
    if (req.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: FIXTURE }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: { id: 'neuf' } }) });
  });

  await page.goto(`${BASE}/althea.html`);
  await page.waitForTimeout(500);

  verifier('le nom du personnage', (await page.textContent('#althea-nom')) === 'Le Voyageur');
  verifier('le titre porté', (await page.textContent('#althea-titre')) === 'Farsight');

  // LANGUE DU NORD : 2 jours tenus, seuils [1,3,…] → rang 1. MARCHE : 0 → rang 0.
  // Niveau = socle 40 + (1 + 0) = 41.
  verifier('niveau = socle + les rangs', (await page.textContent('#althea-niveau')) === '41');
  // Chaque niveau donne un point PARTOUT : 14+41 = 55, 21+41 = 62.
  const stats = await page.locator('.althea-st .val').allTextContents();
  verifier('stat = socle + niveau (force)', stats[0] === '55', stats.join(','));
  verifier('stat = socle + niveau (intelligence)', stats[1] === '62', stats.join(','));

  verifier('deux skills rendus', (await page.locator('.althea-skill').count()) === 2);
  const badges = await page.locator('.althea-skill .etat').allTextContents();
  verifier('un skill tenu, un en sommeil',
    badges.includes('Tenu') && badges.includes('Sommeil'), badges.join(','));
  // ⚠️ RÈGLE ① À L'ÉCRAN : un skill non renseigné se dit « Sommeil », JAMAIS
  // « raté », « manqué » ni « échec ». Le vocabulaire est la règle.
  const texteBloc = await page.textContent('.althea-visuel');
  verifier('aucun vocabulaire de faute à l’écran',
    !/rat[ée]|échec|manqué|perdu/i.test(texteBloc), texteBloc.slice(0, 80));

  verifier('trois gestes du jour', (await page.locator('.althea-geste').count()) === 3);
  // Trois états : c1 est tenu aujourd'hui → aria-pressed=true ; c2 et c3 n'ont
  // aucun relevé → PAS d'attribut du tout (non renseigné, le troisième état).
  const etats = await page.locator('.althea-case').evaluateAll(
    (n) => n.map((b) => b.getAttribute('aria-pressed')));
  verifier('le geste tenu est marqué tenu', etats[0] === 'true', JSON.stringify(etats));
  verifier('les gestes non renseignés n’ont AUCUN état (ni vrai ni faux)',
    etats[1] === null && etats[2] === null, JSON.stringify(etats));

  // Le clic parle au serveur, avec le Bearer et le jour local.
  await page.locator('.althea-case').nth(1).click();
  await page.waitForTimeout(300);
  const post = appels.find((a) => a.methode === 'POST');
  verifier('le clic envoie un POST', Boolean(post));
  verifier('avec le Bearer', post && post.bearer === 'Bearer JETON-TEST');
  verifier('avec le jour LOCAL', post && post.jour === AUJOURDHUI, post && post.jour);
  const corpsPost = post && JSON.parse(post.corps || '{}');
  verifier('le POST pose « tenu », jamais un owner_id',
    corpsPost && corpsPost.tenu === true && !('owner_id' in corpsPost),
    JSON.stringify(corpsPost));
  verifier('le POST porte le jour du navigateur', corpsPost && corpsPost.jour === AUJOURDHUI);

  verifier('Léo parle', ((await page.textContent('#althea-leo')) || '').length > 10);
  verifier('zéro requête externe', externes.length === 0, externes.join(', '));
  verifier('zéro erreur console', erreurs.length === 0, erreurs.join(' | '));

  // ---- C. Les invariants de FORME (mesurés, jamais estimés) ----
  console.log('— C. La forme : un coup d’œil, et rien d’illisible —');
  const forme = await page.evaluate(() => {
    const blocs = [...document.querySelectorAll('.althea-visuel > .althea-bloc')];
    const petits = [...document.querySelectorAll('.althea-visuel *')]
      .filter((e) => e.children.length === 0 && e.textContent.trim())
      .map((e) => parseFloat(getComputedStyle(e).fontSize))
      .filter((t) => t < 9);
    return {
      nbBlocs: blocs.length,
      memeLigne: blocs.length === 2
        && Math.round(blocs[0].getBoundingClientRect().top) === Math.round(blocs[1].getBoundingClientRect().top),
      plusHaut: Math.max(...blocs.map((b) => Math.round(b.getBoundingClientRect().height))),
      textesSous9px: petits.length,
    };
  });
  verifier('deux blocs', forme.nbBlocs === 2);
  verifier('alignés par le haut', forme.memeLigne);
  // « Embrassable du même coup d'œil » (Paul) traduit en nombre.
  verifier('le plus haut tient sous 900 px', forme.plusHaut <= 900, `${forme.plusHaut} px`);
  // Règle de forme 2026-08-06 : un texte sous 9 px de rendu n'est pas petit,
  // il est illisible.
  verifier('aucun texte sous 9 px', forme.textesSous9px === 0, `${forme.textesSous9px} occurrence(s)`);

  const couleurs = await page.evaluate(() => {
    const s = getComputedStyle(document.querySelector('.althea'));
    const t = getComputedStyle(document.querySelector('.althea-skill .nom'));
    const b = getComputedStyle(document.querySelector('.althea-skill .dit'));
    return { fond: s.backgroundColor, texte: t.color, second: b.color };
  });
  const cTexte = ratio(versHex(couleurs.fond), versHex(couleurs.texte));
  const cSecond = ratio(versHex(couleurs.fond), versHex(couleurs.second));
  verifier('contraste du texte courant AA', cTexte >= 4.5, cTexte.toFixed(2));
  verifier('contraste du texte secondaire AA', cSecond >= 4.5, cSecond.toFixed(2));

  // La devise du Système. On l'éprouve sur les TROIS choses qui peuvent casser
  // sans qu'on le voie : le texte exact (une devise se cite, elle ne se
  // paraphrase pas), la couleur (la règle --or/--spectre n'a d'exception
  // nulle part), et la langue déclarée (sinon un lecteur d'écran francophone
  // récite de l'anglais à la française).
  // On lit les couleurs sur des éléments RENDUS (l'en-tête porte var(--or), le
  // gras de la note porte var(--spectre)) : getPropertyValue rendrait le hex
  // brut de la variable, que versHex ne sait pas lire.
  const devise = await page.evaluate(() => {
    const d = document.querySelector('.althea-devise');
    if (!d) return null;
    const s = getComputedStyle(d);
    return {
      texte: d.textContent.replace(/\s+/g, ' ').trim(),
      langue: d.getAttribute('lang'),
      couleur: s.color,
      spectre: getComputedStyle(document.querySelector('.althea-note b')).color,
      or: getComputedStyle(document.querySelector('.althea-entete')).color,
      fond: getComputedStyle(document.querySelector('.althea')).backgroundColor,
      italique: s.fontStyle,
    };
  });
  verifier('la devise est là', devise !== null);
  verifier('la devise est citée AU MOT PRÈS',
    devise && devise.texte === 'I am the record of your struggles, '
      + 'the evidence of your resistance and the reward of your pain',
    devise && devise.texte);
  verifier('la devise déclare sa langue', devise && devise.langue === 'en', devise && devise.langue);
  verifier('la devise est en italique', devise && devise.italique === 'italic');
  // La voix du Système est ANNONCÉE, jamais GAGNÉE : spectre, et surtout pas or.
  verifier('la devise porte la couleur du spectre',
    devise && versHex(devise.couleur) === versHex(devise.spectre),
    devise && `${versHex(devise.couleur)} ≠ ${versHex(devise.spectre)}`);
  verifier('la devise n’est PAS en or',
    devise && versHex(devise.couleur) !== versHex(devise.or));
  const cDevise = devise ? ratio(versHex(devise.fond), versHex(devise.couleur)) : 0;
  verifier('contraste de la devise AA', cDevise >= 4.5, cDevise.toFixed(2));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const deborde = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  verifier('aucun débordement horizontal à 390 px', !deborde);

  // Stellar V2 — le contrat instrument doit rester mesurable, pas seulement
  // visible sur une capture. Desktop compact, mobile tactile, données opaques.
  const stellarMobile = await page.evaluate(() => {
    const racine = getComputedStyle(document.documentElement);
    const bloc = getComputedStyle(document.querySelector('.althea-bloc'));
    const cible = document.querySelector('.althea-case').getBoundingClientRect();
    const html = document.documentElement;
    return {
      tokenOr: racine.getPropertyValue('--stellar-accent-gold').trim(),
      blocFond: bloc.backgroundColor,
      cibleW: cible.width,
      cibleH: cible.height,
      deborde: html.scrollWidth > html.clientWidth,
    };
  });
  verifier('Stellar V2 fournit ses tokens à ALTHEA', Boolean(stellarMobile.tokenOr), stellarMobile.tokenOr);
  verifier('un instrument garde un fond quasi opaque',
    /rgba?\(/.test(stellarMobile.blocFond) && !/, 0\.[0-8]\d*\)/.test(stellarMobile.blocFond),
    stellarMobile.blocFond);
  verifier('la case tactile Stellar tient 44×44 sur mobile',
    stellarMobile.cibleW >= 44 && stellarMobile.cibleH >= 44,
    `${stellarMobile.cibleW.toFixed(1)}×${stellarMobile.cibleH.toFixed(1)}`);
  verifier('Stellar V2 ne crée aucun débordement mobile', !stellarMobile.deborde);
  await page.close();
}

// ===================== D. 401 : fail-closed propre =====================
console.log('— D. althea.html et une API qui refuse —');
{
  const { page, erreurs } = await nouvellePage();
  await fausseSession(page);
  await page.route('**/api/althea*', (route) => route.fulfill({
    status: 401, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Authentification requise' }),
  }));
  await page.goto(`${BASE}/althea.html`);
  await page.waitForTimeout(400);
  const corps = await page.evaluate(() => document.body.textContent);
  verifier('le refus est dit, pas masqué', /Ouvre ta session/.test(corps));
  verifier('aucun skill rendu', (await page.locator('.althea-skill').count()) === 0);
  // Le 401 lui-même est journalisé par Chromium comme « failed to load
  // resource » : c'est le refus ATTENDU, pas un défaut de la page. Ce qu'on
  // exige ici, c'est qu'aucune erreur de SCRIPT ne s'ajoute — un fail-closed
  // qui plante n'est pas un fail-closed.
  const defauts = erreurs.filter((e) => !/Failed to load resource/i.test(e));
  verifier('aucune erreur de script (le 401 attendu mis à part)',
    defauts.length === 0, defauts.join(' | '));
  await page.close();
}

// ===================== E. La vue du cadran en grand =====================
console.log('— E. althea-cadran.html : la vue en grand —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await fausseSession(page);
  await page.route('**/api/althea*', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: FIXTURE }),
  }));
  await page.goto(`${BASE}/althea-cadran.html`);
  await page.waitForTimeout(500);

  verifier('le cadran est dessiné', (await page.locator('.althea-cadran').count()) === 1);
  verifier('un anneau par skill', (await page.locator('.althea-cadran .anneau-fond').count()) === 2);
  // LA MESURE, pas l'œil : tout tient dans le cadre, et le texte est lisible.
  const geo = await page.evaluate(() => {
    const svg = document.querySelector('.althea-cadran');
    const b = svg.getBBox(); const v = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const echelle = r.width / v.width;
    const t = svg.querySelector('.nom-skill');
    return {
      tient: b.x >= 0 && b.y >= 0 && b.x + b.width <= v.width && b.y + b.height <= v.height,
      tailleTexteEcran: parseFloat(getComputedStyle(t).fontSize) * echelle,
    };
  });
  verifier('le cadran tient dans son viewBox', geo.tient);
  verifier('ses étiquettes sont lisibles (≥ 9 px)', geo.tailleTexteEcran >= 9,
    `${geo.tailleTexteEcran.toFixed(1)} px`);
  verifier('retour vers le Système',
    (await page.getAttribute('.retour-althea', 'href')) === 'althea.html');
  verifier('zéro requête externe', externes.length === 0, externes.join(', '));
  verifier('zéro erreur console', erreurs.length === 0, erreurs.join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ALTHEA VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
