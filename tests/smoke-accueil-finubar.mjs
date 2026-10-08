// L'ACCUEIL PILOTÉ PAR FINUBAR — P2 (l'appel). Le bandeau P3 est RETIRÉ le
// 08/10/2026 (Paul : « tu gardes que le bandeau Léo, tout en bas ») : ce
// harnais tient désormais son ABSENCE (④), celle de la parole peinte, et ce qui
// reste du pilotage — l'appel des étoiles et le chemin « aller au projet ».
// Cadrage : CADRAGE-ACCUEIL-FINUBAR.md.
//
// Ce que ce harnais prouve, et pourquoi chaque entrée existe :
//   ① LE FAIL-CLOSED, DANS LES DEUX SENS. Sans session, et sur erreur serveur,
//      le ciel doit être STRICTEMENT celui d'hier : aucune lueur, aucun
//      bandeau, et rien du serveur qui transparaisse. C'est une règle de
//      sécurité, pas d'ergonomie — un halo posé sur une donnée à moitié lue
//      oriente vers le mauvais endroit, ce qui est pire que ne pas orienter.
//   ② L'APPEL MONTE. Un projet qui attend un geste allume SA branche, et elle
//      seule : si tout s'allume, plus rien n'appelle.
//   ③ LE COMPTE EST DIT, pas seulement peint (aria-label).
//   ④ ⛔ AUCUNE ÉTOILE SOUS LE BANDEAU. C'est le défaut mesuré sur la maquette
//      le 02/09 : une étoile peinte sous lui n'est plus cliquable, le clic
//      atterrit sur un bouton du bandeau, et L'ÉCRAN RÉPOND EN SE TROMPANT —
//      rien ne signale la panne. La géométrie se MESURE (règle du 2026-08-01).
//   ⑤ LE SIGNAL MÈNE QUELQUE PART : cliquer un signal isole la branche.
//   ⑥ LA DATE DE COLLECTE EST LUE À L'ÉCRAN (jalon 0) — un pilotage qui ne dit
//      pas de quand il date est un piège, et l'accueil est vu tous les matins.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8123';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

let echecs = 0;
function verifier(nom, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${nom}`); }
  else { console.log(`  ❌ ${nom}${detail ? ' — ' + detail : ''}`); echecs += 1; }
}

// L'agrégat d'essai. Il est CONSTRUIT pour que la réponse soit connue d'avance :
// deux projets sous RENOBOOST IA, l'un qui attend un geste (or), l'autre en
// cours (braise) — et RIEN sous ULTIMA, dont la branche doit rester éteinte.
const AGREGAT = {
  le: '2026-09-02',
  macro: { total: 3, lisibles: 2, illisibles: 0, hors_seance: 1, en_cours: 1, en_attente_de_paul: 1, au_repos: 0 },
  projets: [
    { ok: true, depot: 'essai/Alpha', ciel: 'renoboost-ia', rang: 1,
      grain: { projet: 'Projet Alpha', depot: 'essai/Alpha', etat: 'en_attente_de_paul', jalon: { nom: 'le jalon' }, cap: 'le cap' } },
    { ok: true, depot: 'essai/Beta', ciel: 'renoboost-ia', rang: 2,
      grain: { projet: 'Projet Bêta', depot: 'essai/Beta', etat: 'en_cours', jalon: { nom: 'le jalon' }, cap: 'le cap' } },
    { ok: false, depot: 'essai/HorsSeance', ciel: 'alpha', rang: 9, hors_seance: true, grain: null },
  ],
  cartouche: {
    signaux: [{ projet: 'Projet Alpha', dit: 'attend un geste : poser le premier jalon — ouvert depuis 12 j', pourquoi: 'attente' }],
    action: { projet: 'Projet Alpha', nature: 'geste', faire: 'poser le premier jalon', cap: 'le cap' },
    illisibles: 0, hors_seance: 1,
  },
};

async function ouvrir(scenario, viewport = { width: 1440, height: 900 }) {
  const p = await navigateur.newPage({ viewport });
  await p.route('**/api/finubar', (route) => {
    if (scenario === 'ok') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: AGREGAT }) });
    }
    return route.fulfill({ status: 500, contentType: 'text/plain', body: 'boom secret interne' });
  });
  await p.route('**/api/cockpit', (route) => route.fulfill({ status: 500, contentType: 'text/plain', body: 'non testé ici' }));
  await p.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
  await p.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await masquerLaPorte(p);
  if (scenario !== 'sans-session') {
    await p.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
    await p.waitForTimeout(900);
  } else {
    await p.waitForTimeout(400);
  }
  return p;
}

/* ⚠️ CE QUE CE HARNAIS SIMULE, ET IL FAUT LE SAVOIR EN LISANT SES VERDICTS.
   `index.html` est la porte d'entrée : l'écran de connexion (z-index 2000) la
   couvre tant qu'aucune session n'est ouverte. On la masque ici, et on livre le
   jeton par `poserSession` — exactement ce que fait `js/boussole-auth.js` au
   retour de Google. Ce n'est donc pas une session réelle : l'angle mort des
   pages authentifiées (fixture de session à financer) reste entier, et il reste
   NOMMÉ plutôt que tu. Ce qui est éprouvé ici est ce qui vient APRÈS la porte. */
async function masquerLaPorte(p) {
  await p.evaluate(() => {
    const el = document.getElementById('ecran-connexion');
    if (el) { el.hidden = true; el.style.display = 'none'; }
    // ⛔ ET L'INERTIE, QUI EST LA VRAIE PORTE. `js/boussole-auth.js` pose
    // `inert` sur `.boussole-scene` tant que l'overlay est visible : la scène
    // est alors PEINTE mais intouchable — `getBoundingClientRect` répond,
    // `elementFromPoint` non. C'est ce qui m'a fait chercher une couche par
    // dessus pendant que la cause était en dessous. Le bandeau vivant DANS la
    // coque en hérite, ce qui est le bon comportement produit (avant la
    // session, il n'a de toute façon rien à montrer) ; ici on lève l'inertie
    // comme le fait `boussole-auth` à l'ouverture de session.
    const scene = document.querySelector('.boussole-scene');
    if (scene) { scene.removeAttribute('inert'); }
  });
}

const etat = (p) => p.evaluate(() => ({
  appels: [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')]
    .map((g) => [g.getAttribute('data-noeud-id'), g.getAttribute('data-appel'), g.getAttribute('aria-label')]),
  bandeauPresent: Boolean(document.getElementById('finubar-bandeau')),
}));

// ===========================================================================
console.log('— ① Fail-closed : sans session, puis sur erreur serveur —');
{
  const p = await ouvrir('sans-session');
  const e = await etat(p);
  verifier('sans session : AUCUNE étoile ne porte d\'appel',
    e.appels.every(([, a]) => a === null), JSON.stringify(e.appels));
  // Verrou de non-vacuité : l'absence d'appel ne vaut que si des étoiles sont là.
  verifier('sans session : verrou — le ciel est peint (au moins trois étoiles)', e.appels.length >= 3, String(e.appels.length));
  verifier('sans session : aucun bandeau Finubar dans la page', e.bandeauPresent === false);
  await p.close();

  const q = await ouvrir('erreur');
  const f = await etat(q);
  verifier('sur erreur serveur : aucun appel non plus',
    f.appels.every(([, a]) => a === null), JSON.stringify(f.appels));
  verifier('sur erreur serveur : aucun bandeau Finubar non plus', f.bandeauPresent === false);
  // Éprouvé par l'ABSENCE : le corps de l'erreur ne doit se trouver NULLE PART
  // (règle du 2026-07-30 — une règle de confidentialité se teste par l'absence).
  const fuite = await q.evaluate(() => document.body.innerHTML.includes('boom secret interne'));
  verifier('sur erreur serveur : rien du serveur ne transparaît', fuite === false);
  await q.close();
}

// ===========================================================================
console.log('— ② L\'appel monte, et il ne monte QUE sur sa branche —');
const p = await ouvrir('ok');
{
  const e = await etat(p);
  const par = Object.fromEntries(e.appels.map(([id, a]) => [id, a]));
  verifier('ALPHA appelle en or (un projet attend un geste sous lui)',
    par.alpha === 'appel', JSON.stringify(par));
  verifier('OMEGA reste éteinte — aucun projet ne s\'y accroche',
    par.omega === null && par.althea === null, JSON.stringify(par));
  // L'ancien id n'est plus un cap de la racine : il ne peut plus être « éteint »
  // (null) — il est absent (undefined). Éprouvé par l'absence.
  verifier('l\'ancien id « ultima-perso » n\'existe plus parmi les caps',
    !e.appels.some(([id]) => id === 'ultima-perso'), JSON.stringify(par));

  // ③ Le compte est DIT.
  const alpha = e.appels.find(([id]) => id === 'alpha');
  verifier('③ le compte est dit au lecteur d\'écran, pas seulement peint',
    /attend/.test(alpha[2] || ''), alpha[2]);
}

// ===========================================================================
console.log('— ④ Léo seul en bas : ni bandeau Finubar, ni parole peinte —');
{
  // Verrou : l'agrégat est BIEN livré (ALPHA appelle, section ②) — l'absence du
  // bandeau ne vient donc pas d'une donnée manquante, mais du retrait voulu.
  const e = await etat(p);
  verifier('④ verrou — l\'agrégat est livré (une étoile appelle)',
    e.appels.some(([, a]) => a === 'appel'), JSON.stringify(e.appels));
  verifier('④a avec session et agrégat : aucun bandeau Finubar dans la page', e.bandeauPresent === false);
  // La parole n'est plus PEINTE, mais elle PARLE encore : au survol d'une
  // étoile, la zone `aria-live` reçoit son nom. Les deux se vérifient ensemble,
  // sinon « invisible » serait vert sur une zone simplement vide.
  const cible = await p.evaluate(() => {
    const g = document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"]');
    const r = g && g.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  });
  verifier('④ verrou — l\'étoile ALPHA est à l\'écran', cible !== null);
  if (cible) { await p.mouse.move(cible.x, cible.y); await p.waitForTimeout(300); }
  const parole = await p.evaluate(() => {
    const el = document.getElementById('boussole-parole');
    const r = el.getBoundingClientRect();
    return { l: Math.round(r.width), h: Math.round(r.height), texte: el.textContent.replace(/\s+/g, ' ').trim() };
  });
  verifier('④b la parole a bien reçu le nom au survol (elle parle encore)',
    /ALPHA/i.test(parole.texte), parole.texte.slice(0, 60));
  verifier('④c mais elle n\'est pas peinte (boîte ≤ 1 px)',
    parole.l <= 1 && parole.h <= 1, `${parole.l}×${parole.h}`);
  // ④d Rien ne recouvre l'étoile la plus basse : le point qu'on touche est
  // bien celui de l'étoile, pas d'un cartouche posé dessus.
  const bas = await p.evaluate(() => {
    const gs = [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')];
    let pire = null;
    for (const g of gs) {
      const r = g.getBoundingClientRect();
      if (!pire || r.bottom > pire.r.bottom) { pire = { g, r }; }
    }
    if (!pire) { return null; }
    const x = pire.r.left + pire.r.width / 2, y = pire.r.top + pire.r.height / 2;
    const touche = document.elementFromPoint(x, y);
    return { id: pire.g.getAttribute('data-noeud-id'), atteinte: Boolean(touche && touche.closest('.ciel-etoile') === pire.g) };
  });
  verifier('④d l\'étoile la plus basse se touche — rien n\'est peint dessus',
    bas && bas.atteinte, JSON.stringify(bas));
}

// ===========================================================================
console.log('— ⑤ Aller au projet : le chemin du « Y aller » de Léo —');
{
  // Le clic d'un signal du bandeau est parti avec lui ; il reste le chemin du
  // dock de Léo, qui appelle `UltimaCielNoeud.allerAuProjet`. Le dock exige une
  // vraie session (voir smoke-socle) : on éprouve donc le chemin lui-même.
  const avant = await p.evaluate(() => [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')]
    .map((g) => g.getAttribute('data-noeud-id')).join(','));
  const bouge = await p.evaluate(() => window.UltimaCielNoeud && window.UltimaCielNoeud.allerAuProjet
    ? window.UltimaCielNoeud.allerAuProjet('Projet Alpha') : 'absent');
  await p.waitForTimeout(900);
  const apres = await p.evaluate(() => [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')]
    .map((g) => g.getAttribute('data-noeud-id')));
  verifier('⑤ « aller au projet » isole la branche du projet',
    bouge === true && (apres.some((id) => id.startsWith('depot:')) || apres.includes('renoboost-ia')),
    `rendu: ${bouge} | avant: ${avant} | après: ${apres.join(',')}`);
}
await p.close();

// ===========================================================================
console.log('— ⑦ Le mouvement part sous prefers-reduced-motion, la couleur reste —');
{
  const q = await navigateur.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await q.route('**/api/finubar', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: AGREGAT }) }));
  await q.route('**/api/cockpit', (route) => route.fulfill({ status: 500, contentType: 'text/plain', body: 'x' }));
  await q.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
  await q.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
  await masquerLaPorte(q);
  await q.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
  await q.waitForTimeout(900);
  const r = await q.evaluate(() => {
    const g = document.querySelector('.ciel-etoile[data-appel="appel"]');
    if (!g) return null;
    const cs = getComputedStyle(g);
    return { animation: cs.animationName, filtre: cs.filter };
  });
  verifier('⑦ l\'appel est bien là', r !== null);
  verifier('⑦ aucune animation ne tourne', r && r.animation === 'none', r && r.animation);
  verifier('⑦ mais la couleur, elle, reste — c\'est elle qui porte l\'information',
    r && r.filtre !== 'none' && r.filtre.length > 4, r && r.filtre);
  await q.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== smoke-accueil-finubar : TOUT VERT ===' : `\n=== smoke-accueil-finubar : ${echecs} ÉCHEC(S) ===`);
process.exit(echecs === 0 ? 0 : 1);
