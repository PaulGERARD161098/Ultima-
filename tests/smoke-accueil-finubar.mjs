// L'ACCUEIL PILOTÉ PAR FINUBAR — P2 (l'appel) + P3 (le bandeau).
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
  bandeau: document.getElementById('finubar-bandeau').textContent.trim(),
  visible: document.getElementById('finubar-bandeau').getBoundingClientRect().height > 0,
}));

// ===========================================================================
console.log('— ① Fail-closed : sans session, puis sur erreur serveur —');
{
  const p = await ouvrir('sans-session');
  const e = await etat(p);
  verifier('sans session : AUCUNE étoile ne porte d\'appel',
    e.appels.every(([, a]) => a === null), JSON.stringify(e.appels));
  verifier('sans session : le bandeau est vide, donc invisible',
    e.bandeau === '' && e.visible === false);
  await p.close();

  const q = await ouvrir('erreur');
  const f = await etat(q);
  verifier('sur erreur serveur : aucun appel non plus',
    f.appels.every(([, a]) => a === null), JSON.stringify(f.appels));
  verifier('sur erreur serveur : le bandeau reste vide', f.bandeau === '');
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
console.log('— ⑥ Le bandeau : ce qu\'il montre, et de quand il date —');
{
  const b = await p.evaluate(() => {
    const el = document.getElementById('finubar-bandeau');
    return {
      texte: el.textContent,
      date: (el.querySelector('.fb-date') || {}).textContent || '',
      signaux: el.querySelectorAll('.fb-signal').length,
      degre: (el.querySelector('.fb-signal') || {}).getAttribute
        ? el.querySelector('.fb-signal').getAttribute('data-appel') : null,
      action: (el.querySelector('.fb-quoi') || {}).textContent || '',
      nature: (el.querySelector('.fb-nature') || {}).textContent || '',
      cible: (el.querySelector('.fb-bouton') || {}).getBoundingClientRect
        ? el.querySelector('.fb-bouton').getBoundingClientRect().height : 0,
    };
  });
  verifier('⑥ la date de collecte est lue à l\'écran', /collecté le 2026-09-02/.test(b.date), b.date);
  verifier('le dépôt hors de portée est DIT (jamais tu)', /hors de portée/.test(b.texte));
  verifier('le signal porte le degré d\'appel de son ciel', b.degre === 'appel');
  verifier('Léo propose UNE action, celle de l\'agrégat', /Projet Alpha/.test(b.action) && /premier jalon/.test(b.action));
  verifier('l\'action suit la main qui l\'a : un geste ne devient pas du code',
    /n’appartient qu’à toi/.test(b.nature), b.nature);
  verifier('la cible du signal tient le plancher tactile (≥ 34 px)', b.cible >= 34, String(b.cible));
}

// ===========================================================================
console.log('— ④ ⛔ Le bandeau est DÉCLARÉ au moteur, et rien n\'est peint dessous —');
{
  // ⚠️ CE QUE CETTE SECTION A APPRIS, ET QUI CORRIGE LA NOTE DE LA MAQUETTE.
  // Le défaut « une étoile peinte sous le bandeau n'est plus cliquable » est
  // réel : il a été mesuré le 02/09 sur `design/preview-accueil-finubar.html`.
  // Mais il ne pouvait PAS se produire ici : la production déclare son mobilier
  // au moteur (`margesUtiles`), là où la maquette réservait la place en
  // rétrécissant son conteneur. Éprouvé : en retirant le bandeau des marges,
  // l'étoile la plus basse d'un pire cas de 12 astres à 390 px passe de 604 à
  // 643 px — et le bandeau commence à 656. Le symptôme ne se déclenche donc
  // jamais, même sans la déclaration.
  //
  // ⛔ Un verdict qui ne peut pas devenir rouge ne mesure rien (règle du
  // 2026-08-20). On garde donc l'invariant produit (④b), mais on mesure le
  // MÉCANISME (④c) : sans la déclaration, retirer le bandeau ne changerait
  // rien au cadrage — avec elle, les étoiles redescendent.
  const geo = await p.evaluate(async () => {
    const bas = () => Math.max(...[...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')]
      .map((g) => g.getBoundingClientRect().bottom));
    const bandeau = document.getElementById('finubar-bandeau');
    const avant = bas();
    const hautDuBandeau = bandeau.getBoundingClientRect().top;
    // Le point du bandeau appartient-il au bandeau ? (personne ne le recouvre)
    const r = bandeau.querySelector('.fb-bouton').getBoundingClientRect();
    const surLeBouton = document.elementFromPoint(r.x + 6, r.y + r.height / 2);
    const auBouton = Boolean(surLeBouton && surLeBouton.closest && surLeBouton.closest('.fb-bouton'));
    // Le mécanisme : on retire le bandeau — ET l'état qu'il pose sur le
    // <body>, qui fait monter la parole de Léo au-dessus de lui. Retirer l'un
    // sans l'autre laisserait la parole en l'air : c'est ELLE qui dominerait
    // alors la marge basse, et la mesure répondrait « aucun écart » sur un
    // dispositif pourtant sain. (Vu en direct le 02/09 : le verdict est passé
    // au rouge à l'ajout du décalage de la parole, sans qu'aucun défaut
    // n'existe. Une mesure se relit chaque fois que ce qu'elle mesure bouge.)
    const garde = bandeau.parentNode;
    garde.removeChild(bandeau);
    document.body.classList.remove('a-finubar');
    window.dispatchEvent(new Event('resize'));
    await new Promise((r2) => setTimeout(r2, 500));
    const sansBandeau = bas();
    garde.appendChild(bandeau);
    document.body.classList.add('a-finubar');
    window.dispatchEvent(new Event('resize'));
    await new Promise((r2) => setTimeout(r2, 500));
    return { avant, hautDuBandeau, sansBandeau, auBouton, apres: bas() };
  });

  verifier('④a le bandeau reçoit bien le doigt sur ses propres boutons',
    geo.auBouton === true);
  verifier('④b aucune étoile n\'est peinte sous le bandeau',
    geo.avant <= geo.hautDuBandeau,
    `étoile la plus basse ${Math.round(geo.avant)} px, bandeau à ${Math.round(geo.hautDuBandeau)} px`);
  verifier('④c le bandeau est DÉCLARÉ au moteur : le retirer fait redescendre le ciel',
    geo.sansBandeau > geo.avant + 4,
    `avec ${Math.round(geo.avant)} px, sans ${Math.round(geo.sansBandeau)} px — un écart nul voudrait dire que le moteur ne le connaît pas`);
  verifier('④c le remettre remonte le ciel là où il était (le cadrage est relu, pas figé)',
    Math.abs(geo.apres - geo.avant) <= 4, `${Math.round(geo.avant)} → ${Math.round(geo.apres)}`);
}

// ===========================================================================
console.log('— ④bis La parole de Léo ne passe pas derrière le bandeau —');
{
  // Trouvé EN REGARDANT une capture, pas en relisant : les deux cartouches sont
  // `fixed` au bas de l'écran et au même `z-index`, donc le dernier arrivé
  // recouvrait l'autre. Un texte à moitié lisible ne lève aucune alerte — il se
  // lit comme un texte.
  const chevauche = await p.evaluate(async () => {
    const g = document.querySelector('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"]');
    g.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((r) => setTimeout(r, 300));
    const parole = document.getElementById('boussole-parole').getBoundingClientRect();
    const bandeau = document.getElementById('finubar-bandeau').getBoundingClientRect();
    return {
      parole: [Math.round(parole.top), Math.round(parole.bottom)],
      bandeau: Math.round(bandeau.top),
      recouvre: parole.bottom > bandeau.top && parole.height > 0,
      classe: document.body.classList.contains('a-finubar'),
    };
  });
  verifier('④bis le bandeau se déclare sur le <body> (la parole sait qu\'elle doit monter)',
    chevauche.classe === true);
  verifier('④bis la parole de Léo reste entièrement au-dessus du bandeau',
    chevauche.recouvre === false,
    `parole ${chevauche.parole.join('→')}, bandeau à ${chevauche.bandeau}`);
}

// ===========================================================================
console.log('— ⑤ Un signal mène quelque part —');
{
  const avant = await p.evaluate(() => document.getElementById('fil-ciel')
    ? document.getElementById('fil-ciel').textContent
    : [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')].map((g) => g.getAttribute('data-noeud-id')).join(','));
  await p.click('#finubar-bandeau .fb-bouton');
  await p.waitForTimeout(900);
  const apres = await p.evaluate(() => [...document.querySelectorAll('#ciel-noeud-scene .ciel-etoile[data-noeud-id]')]
    .map((g) => g.getAttribute('data-noeud-id')));
  verifier('⑤ cliquer le signal isole la branche du projet',
    apres.some((id) => id.startsWith('depot:')) || apres.includes('renoboost-ia'),
    `avant: ${avant} | après: ${apres.join(',')}`);
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
