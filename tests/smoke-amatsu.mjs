// AMATSU, le dragon de l'air — la rose des vents des lectures (boucle 2b-β,
// CADRAGE-IMLADRIK.md §12.6), DERRIÈRE AUTH. Prouve :
//   A. amatsu.html SANS session : fail-closed — aucun souffle, cartouche
//      « Authentification requise », zéro réseau externe, zéro erreur console ;
//      et le HTML SERVI ne porte aucune lecture (non-vacuité d'abord) ;
//   B. fausse session + /api/amatsu-lectures stubée (lectures INVENTÉES) : au
//      repos, la date et l'objet seulement — AUCUN vent au simple survol ; au clic,
//      les trois vents ; le livre et la rose marquent le même choix ; Échap
//      referme ; Bearer transmis ;
//   C. quatorze lectures : douze souffles, le dernier « 3 plus anciennes » mène au
//      livre ; la géométrie se MESURE (cadre, croisements, rose) et l'instrument
//      est d'abord éprouvé sur un croisement fabriqué ;
//   D. téléphone (390 px) : la rose sans étiquettes, le livre surface de lecture,
//      aucun défilement de côté ;
//   E. 401 → auth ; 500 → erreur ; lectures mal formées écartées ; liste vide →
//      l'invitation à dicter, sans livre.
// NOTE : le flux avec session RÉELLE n'est pas prouvable en harnais (auth vivante).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:8123';
const CAPTURES = new URL('./.cache/captures', import.meta.url).pathname;
mkdirSync(CAPTURES, { recursive: true });

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
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function versHex(rgb) {
  const m = rgb.match(/\d+/g).map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
  return '#' + m.slice(0, 3).join('');
}

const REF_SUPABASE = 'leosfqyidgsaescjbfom';
function scriptFausseSession() {
  return `try {
    window.localStorage.setItem('sb-${REF_SUPABASE}-auth-token', JSON.stringify({
      access_token: 'jeton-de-test',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'jeton-refresh',
      user: { id: '00000000-0000-4000-8000-000000000000', aud: 'authenticated', role: 'authenticated' }
    }));
  } catch (e) {}`;
}

// Lectures INVENTÉES pour le harnais — aucune lecture réelle de Paul (§5).
// Du plus récent au plus ancien, comme les sert la route.
function lecture(i, objet) {
  const jour = String(28 - i).padStart(2, '0');
  return {
    id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    objet,
    bise: `bise-${i} : oui, plus libre`,
    souffle: `souffle-${i} : cohérent`,
    ouragan: `ouragan-${i} : pas emporté`,
    created_at: `2026-09-${jour}T10:00:00Z`,
  };
}
const TROIS = [lecture(1, 'Ouvrir l’atelier du port'), lecture(2, 'Le voyage d’hiver'), lecture(3, 'Rendre la présidence')];
const OBJETS_14 = ['Ouvrir l’atelier du port', 'Le voyage d’hiver', 'Rendre la présidence',
  'Racheter la barque', 'Écrire chaque matin', 'Quitter le cercle des anciens', 'Couper le téléphone le soir',
  'Reprendre l’escrime', 'Signer le bail de la grange', 'Trois mois en montagne', 'Vendre les parts du moulin',
  'Plus de travail le dimanche', 'Apprendre le grec ancien', 'Déménager vers la côte'];
const QUATORZE = OBJETS_14.map((o, i) => lecture(i + 1, o));

const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function nouvellePage(options = {}) {
  const page = await navigateur.newPage({ viewport: options.viewport || { width: 1280, height: 900 } });
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
        value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
        writable: false,
      });
    });
  }
  return { page, erreurs, externes };
}

// Session factice + route stubée. `reponse` : { status, corps }.
async function pageAvecLectures(reponse, options = {}) {
  const { page, erreurs, externes } = await nouvellePage(options);
  await page.addInitScript(scriptFausseSession());
  await page.route(`**://${REF_SUPABASE}.supabase.co/**`, (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  const appels = [];
  await page.route('**/api/amatsu-lectures**', (route) => {
    const req = route.request();
    appels.push({ methode: req.method(), headers: req.headers() });
    return route.fulfill({
      status: reponse.status,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(reponse.corps),
    });
  });
  await page.goto(`${BASE}/amatsu.html`, { waitUntil: 'load', timeout: 20000 });
  return { page, erreurs, externes, appels };
}

// La mesure de la rose (portée de la maquette) : cadre, croisements, rose.
async function mesurerRose(page) {
  return page.evaluate(() => {
    const visibles = [...document.querySelectorAll('#amatsu-souffles .amatsu-etiquette')]
      .filter((t) => t.getBoundingClientRect().width > 0);
    const boites = visibles.map((t) => t.getBBox());
    const dehors = boites.filter((b) => b.x < 0 || b.y < 0 || b.x + b.width > 900 || b.y + b.height > 720).length;
    let croisements = 0;
    for (let i = 0; i < boites.length; i++) {
      for (let j = i + 1; j < boites.length; j++) {
        const a = boites[i], c = boites[j];
        if (a.x < c.x + c.width - 1 && c.x < a.x + a.width - 1 && a.y < c.y + c.height - 1 && c.y < a.y + a.height - 1) croisements += 1;
      }
    }
    const empiete = boites.filter((b) => {
      const px = Math.max(b.x, Math.min(450, b.x + b.width)), py = Math.max(b.y, Math.min(360, b.y + b.height));
      return Math.hypot(px - 450, py - 360) < 202;
    }).length;
    return { n: boites.length, dehors, croisements, empiete };
  });
}

// La taille RENDUE des étiquettes, en pixels d'écran (15 et 12 unités de viewBox).
async function taillesRendues(page) {
  return page.evaluate(() => {
    const rose = document.getElementById('amatsu-rose');
    const echelle = rose.getBoundingClientRect().width / 900;
    return { rosePx: Math.round(rose.getBoundingClientRect().width), objet: +(15 * echelle).toFixed(1), date: +(12 * echelle).toFixed(1) };
  });
}

// ===================== A. SANS session : fail-closed, HTML servi muet =====================
console.log('— A. amatsu.html SANS session (fail-closed) —');
{
  const brut = await (await fetch(`${BASE}/amatsu.html`)).text();
  // Verrou de non-vacuité : l'absence ne se lit que sur une page réellement servie.
  verifier('HTML servi non vide et bien celui de la rose (verrou de non-vacuité)',
    brut.length > 2000 && brut.includes('id="amatsu-souffles"') && brut.includes('js/amatsu.js'), `${brut.length} o`);
  verifier('Le HTML servi ne porte aucune lecture (ni objet, ni vent)',
    !QUATORZE.some((l) => brut.includes(l.objet)) && !/bise-\d|souffle-\d|ouragan-\d/.test(brut)
    && !/class="amatsu-souffle/.test(brut));

  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/amatsu.html`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#amatsu-auth:not([hidden])', { timeout: 20000 });
  verifier('Cartouche « Authentification requise »',
    /Authentification requise/.test((await page.locator('#amatsu-auth').textContent()) || ''));
  verifier('Registre caché', await page.locator('#amatsu-registre').evaluate((el) => el.hidden));
  verifier('Chargement effacé', await page.locator('#amatsu-chargement').evaluate((el) => el.hidden));
  verifier('Aucun souffle dans le DOM', (await page.locator('.amatsu-souffle').count()) === 0);
  verifier('Retour vers la constellation DRAGONS',
    (await page.locator('.retour a[href="imladrik.html#constellation-dragons"]').count()) === 1);
  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      texte: getComputedStyle(document.querySelector('#amatsu-auth p')).color,
    };
  });
  verifier('Contraste texte auth ≥ 4,5:1', ratio(versHex(c.texte), c.parchemin) >= 4.5);
  verifier('Zéro requête externe (fail-closed)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (fail-closed)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== B. Trois lectures : repos, survol, clic, livre, Échap =====================
console.log('— B. amatsu.html, trois lectures → au repos, au survol, au clic —');
{
  const { page, erreurs, externes, appels } = await pageAvecLectures({ status: 200, corps: { ok: true, data: TROIS } });
  await page.waitForSelector('#amatsu-registre:not([hidden])', { timeout: 20000 });

  verifier('Un GET, Bearer transmis',
    appels.length === 1 && appels[0].methode === 'GET' && appels[0].headers.authorization === 'Bearer jeton-de-test',
    JSON.stringify(appels.map((a) => a.methode)));
  verifier('Trois souffles, trois lignes au livre',
    (await page.locator('#amatsu-souffles .amatsu-souffle').count()) === 3
    && (await page.locator('#amatsu-livre button').count()) === 3);
  const etiquettes = await page.locator('#amatsu-souffles .amatsu-etiquette').allTextContents();
  verifier('Au repos, chaque étiquette dit sa date et son objet',
    etiquettes.length === 3 && /sept\./.test(etiquettes[0]) && etiquettes[0].includes('Ouvrir l’atelier du port'),
    etiquettes.join(' | '));
  verifier('La plus récente souffle au nord (premier souffle au-dessus du centre)',
    await page.locator('#amatsu-souffles .amatsu-souffle').first().evaluate((g) => {
      const c = g.querySelector('.amatsu-point');
      return Math.abs(Number(c.getAttribute('cx')) - 450) < 0.5 && Number(c.getAttribute('cy')) < 360;
    }));

  // Verrou de non-vacuité AVANT l'absence : la parole existe et dit l'état de repos.
  const repos = (await page.locator('#amatsu-parole').textContent()) || '';
  verifier('La parole est là, au repos (verrou de non-vacuité)', /Choisis un souffle/.test(repos), repos);
  verifier('Au repos : aucun vent rendu', (await page.locator('.amatsu-vents li').count()) === 0
    && !/bise-1|souffle-1|ouragan-1/.test(await page.locator('main').textContent()));
  await page.locator('#amatsu-souffles .amatsu-souffle').first().hover();
  await page.waitForTimeout(200);
  verifier('Au simple survol : toujours aucun vent', (await page.locator('.amatsu-vents li').count()) === 0
    && !/bise-1/.test(await page.locator('main').textContent()));

  await page.locator('#amatsu-souffles .amatsu-souffle').first().click();
  const vents = await page.locator('.amatsu-vents li').allTextContents();
  verifier('Au clic : les trois vents de la lecture, nommés',
    vents.length === 3 && /La bise — Plus libre \?/.test(vents[0]) && vents[0].includes('bise-1')
    && /Le souffle/.test(vents[1]) && vents[1].includes('souffle-1') && /L’ouragan/.test(vents[2]) && vents[2].includes('ouragan-1'),
    vents.join(' | '));
  verifier('Au clic : la date longue et l’objet entier',
    /27 septembre 2026/.test(await page.locator('#amatsu-parole').textContent())
    && (await page.locator('#amatsu-parole h3').textContent()) === 'Ouvrir l’atelier du port');
  verifier('La rose et le livre marquent le même choix',
    (await page.locator('#amatsu-souffles .amatsu-souffle[aria-pressed="true"]').count()) === 1
    && (await page.locator('#amatsu-livre-0').getAttribute('aria-pressed')) === 'true'
    && (await page.locator('#amatsu-livre-1').getAttribute('aria-pressed')) === 'false');

  await page.locator('#amatsu-livre-2').click();
  verifier('Le livre ouvre la troisième lecture, et la rose suit',
    (await page.locator('#amatsu-parole h3').textContent()) === 'Rendre la présidence'
    && (await page.locator('#amatsu-souffles .amatsu-souffle[data-i="2"]').getAttribute('aria-pressed')) === 'true'
    && (await page.locator('#amatsu-souffles .amatsu-souffle[data-i="0"]').getAttribute('aria-pressed')) === 'false');
  verifier('Le focus reste sur la ligne du livre (rien n’est redessiné)',
    await page.evaluate(() => document.activeElement && document.activeElement.id === 'amatsu-livre-2'));

  await page.keyboard.press('Escape');
  verifier('Échap referme : retour au repos, plus aucun vent',
    (await page.locator('.amatsu-vents li').count()) === 0
    && (await page.locator('[aria-pressed="true"]').count()) === 0);

  await page.locator('#amatsu-souffles .amatsu-souffle[data-i="1"]').focus();
  await page.keyboard.press('Enter');
  verifier('Au clavier : Entrée sur un souffle ouvre ses vents',
    (await page.locator('#amatsu-parole h3').textContent()) === 'Le voyage d’hiver');

  const c = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      q: getComputedStyle(document.querySelector('.amatsu-vents .amatsu-q')).color,
      r: getComputedStyle(document.querySelector('.amatsu-vents .amatsu-r')).color,
    };
  });
  verifier('Contraste des questions ≥ 4,5:1', ratio(versHex(c.q), c.parchemin) >= 4.5);
  verifier('Contraste des réponses ≥ 4,5:1', ratio(versHex(c.r), c.parchemin) >= 4.5);
  const hLivre = await page.locator('#amatsu-livre-0').evaluate((el) => el.getBoundingClientRect().height);
  verifier('Tap target d’une ligne du livre ≥ 44 px', hLivre >= 44, `${hLivre}px`);
  verifier('Zéro requête externe', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/amatsu-trois.png`, fullPage: true });
  await page.close();
}

// ===================== C. Quatorze lectures : douze aires, la mesure =====================
console.log('— C. amatsu.html, quatorze lectures → douze souffles, géométrie mesurée —');
{
  const { page, erreurs } = await pageAvecLectures({ status: 200, corps: { ok: true, data: QUATORZE } });
  await page.waitForSelector('#amatsu-registre:not([hidden])', { timeout: 20000 });
  verifier('Douze souffles sur la rose, quatorze lignes au livre',
    (await page.locator('#amatsu-souffles .amatsu-souffle').count()) === 12
    && (await page.locator('#amatsu-livre button').count()) === 14);
  const dernier = page.locator('#amatsu-souffles .amatsu-souffle').last();
  verifier('Le douzième souffle résume « 3 plus anciennes »',
    /3 plus anciennes/.test((await dernier.textContent()) || '') && (await dernier.getAttribute('data-i')) === null);

  // L'instrument d'abord, sur un cas dont on connaît la réponse : une étiquette
  // dupliquée sur elle-même DOIT compter un croisement.
  await page.evaluate(() => {
    const t = document.querySelector('#amatsu-souffles .amatsu-etiquette');
    const copie = t.cloneNode(true);
    copie.setAttribute('data-fabrique', '1');
    t.parentNode.appendChild(copie);
  });
  const fabrique = await mesurerRose(page);
  verifier('La mesure voit un croisement fabriqué (l’instrument mord)', fabrique.croisements >= 1, JSON.stringify(fabrique));
  await page.evaluate(() => document.querySelector('[data-fabrique]').remove());

  const m = await mesurerRose(page);
  verifier('Douze étiquettes mesurées (verrou de non-vacuité)', m.n === 12, JSON.stringify(m));
  verifier('Cadre : toutes les étiquettes dans la carte', m.dehors === 0, JSON.stringify(m));
  verifier('Aucun croisement d’étiquettes', m.croisements === 0, JSON.stringify(m));
  verifier('Aucune étiquette sur la rose', m.empiete === 0, JSON.stringify(m));

  // La LISIBILITÉ, que « zéro croisement » ne dit pas : mesuré en viewBox, un
  // dessin rétréci à 450 px restait vert avec des objets à 7 px (19/10).
  verifier('À 1280 px, l’objet d’une étiquette se lit à 12 px au moins',
    (await taillesRendues(page)).objet >= 12, JSON.stringify(await taillesRendues(page)));
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.waitForTimeout(200);
  const m1000 = await mesurerRose(page);
  verifier('À 1000 px, l’objet se lit à 12 px au moins, sans croisement',
    (await taillesRendues(page)).objet >= 12 && m1000.n === 12 && m1000.croisements === 0 && m1000.dehors === 0,
    JSON.stringify([await taillesRendues(page), m1000]));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(200);

  await dernier.click();
  verifier('« Plus anciennes » mène au livre : le focus sur la douzième ligne',
    await page.evaluate(() => document.activeElement && document.activeElement.id === 'amatsu-livre-11'));
  await page.locator('#amatsu-livre-13').click();
  verifier('La plus ancienne s’ouvre depuis le livre, sans souffle à marquer',
    (await page.locator('#amatsu-parole h3').textContent()) === 'Déménager vers la côte'
    && (await page.locator('#amatsu-souffles [aria-pressed="true"]').count()) === 0);
  verifier('Zéro erreur console (quatorze)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/amatsu-quatorze.png`, fullPage: true });
  await page.close();
}

// ===================== D. Téléphone : le livre, surface de lecture =====================
console.log('— D. amatsu.html à 390 px —');
{
  const { page, erreurs } = await pageAvecLectures({ status: 200, corps: { ok: true, data: QUATORZE } },
    { viewport: { width: 390, height: 844 } });
  await page.waitForSelector('#amatsu-registre:not([hidden])', { timeout: 20000 });
  verifier('Les souffles sont là (verrou de non-vacuité)',
    (await page.locator('#amatsu-souffles .amatsu-souffle').count()) === 12);
  verifier('À 390 px, aucune étiquette visible sur la rose', (await mesurerRose(page)).n === 0);
  verifier('Le livre porte les quatorze lectures, visibles',
    (await page.locator('#amatsu-livre button:visible').count()) === 14);
  const debord = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  verifier('Aucun défilement de côté', debord <= 0, `${debord}px`);
  await page.locator('#amatsu-livre-4').click();
  verifier('Le livre ouvre les vents sur téléphone',
    (await page.locator('.amatsu-vents li').count()) === 3
    && (await page.locator('#amatsu-parole h3').textContent()) === 'Écrire chaque matin');
  verifier('Zéro erreur console (téléphone)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.screenshot({ path: `${CAPTURES}/amatsu-telephone.png`, fullPage: true });
  await page.close();
}

// ===================== E. 401, 500, mal formées, vide =====================
console.log('— E. amatsu.html : 401, 500, lectures mal formées, liste vide —');
{
  // On attend N'IMPORTE QUEL état final, puis on exige le bon : un mauvais état
  // se lit alors comme un verdict nommé, pas comme un délai dépassé.
  const ETAT_FINAL = '#amatsu-auth:not([hidden]), #amatsu-erreur:not([hidden]), #amatsu-registre:not([hidden])';
  const a = await pageAvecLectures({ status: 401, corps: { ok: false, error: 'Authentification requise' } });
  await a.page.waitForSelector(ETAT_FINAL, { timeout: 20000 });
  verifier('401 → authentification, aucun souffle',
    await a.page.locator('#amatsu-auth').isVisible()
    && (await a.page.locator('.amatsu-souffle').count()) === 0
    && await a.page.locator('#amatsu-registre').evaluate((el) => el.hidden));
  await a.page.close();

  const b = await pageAvecLectures({ status: 500, corps: { ok: false, error: 'Erreur interne' } });
  await b.page.waitForSelector(ETAT_FINAL, { timeout: 20000 });
  verifier('500 → « Rose indisponible », aucun souffle',
    await b.page.locator('#amatsu-erreur').isVisible()
    && (await b.page.locator('.amatsu-souffle').count()) === 0
    && /Rose indisponible/.test(await b.page.locator('#amatsu-erreur').textContent()));
  await b.page.close();

  const mal = [TROIS[0], { id: 'x', objet: 42, bise: 'a', souffle: 'b', ouragan: 'c', created_at: '2026-09-01T00:00:00Z' },
    { id: 'y', objet: 'sans date', bise: 'a', souffle: 'b', ouragan: 'c', created_at: 'pas une date' }, null];
  const c = await pageAvecLectures({ status: 200, corps: { ok: true, data: mal } });
  await c.page.waitForSelector('#amatsu-registre:not([hidden])', { timeout: 20000 });
  verifier('Les lectures mal formées sont écartées, la bonne reste',
    (await c.page.locator('#amatsu-livre button').count()) === 1
    && (await c.page.locator('#amatsu-souffles .amatsu-souffle').count()) === 1);
  verifier('Zéro erreur console (mal formées)', c.erreurs.length === 0, c.erreurs.slice(0, 3).join(' | '));
  await c.page.close();

  const d = await pageAvecLectures({ status: 200, corps: { ok: true, data: [] } });
  await d.page.waitForSelector('#amatsu-registre:not([hidden])', { timeout: 20000 });
  verifier('Liste vide : l’invitation à dicter « Amatsu, … » à Léo',
    await d.page.locator('#amatsu-vide').isVisible()
    && /Amatsu, …/.test(await d.page.locator('#amatsu-vide').textContent()));
  verifier('Liste vide : la rose sans souffle, le livre masqué, la parole qui attend',
    (await d.page.locator('.amatsu-souffle').count()) === 0
    && !(await d.page.locator('.amatsu-livre').isVisible())
    && /premier vent/.test(await d.page.locator('#amatsu-parole').textContent()));
  // Seize aires : huit pointes principales en deux moitiés, huit demi-pointes.
  verifier('Liste vide : la rose est dessinée (seize aires, vingt-quatre facettes)',
    (await d.page.locator('#amatsu-rose-fond polygon').count()) === 24);
  await d.page.close();
}

// ===================== F. Fonctions pures =====================
console.log('— F. fonctions pures (window.UltimaAmatsu) —');
{
  const { page } = await nouvellePage({ configVide: true });
  await page.goto(`${BASE}/amatsu.html`, { waitUntil: 'load', timeout: 20000 });
  const r = await page.evaluate(() => {
    const A = window.UltimaAmatsu;
    return {
      zero: A.disposer(0).length,
      douze: A.disposer(12).map((s) => s.type).join(),
      treize: A.disposer(13),
      memeAnnee: A.dateCourte('2026-10-17T10:00:00Z', new Date('2026-10-19T10:00:00Z')),
      autreAnnee: A.dateCourte('2025-10-17T10:00:00Z', new Date('2026-10-19T10:00:00Z')),
      court: A.court('abcdefghij', 5),
    };
  });
  verifier('disposer(0) : aucun souffle', r.zero === 0);
  verifier('disposer(12) : douze lectures, aucun résumé', r.douze === Array(12).fill('lecture').join());
  verifier('disposer(13) : onze lectures puis « 2 plus anciennes » à partir de la douzième',
    r.treize.length === 12 && r.treize[11].type === 'anciennes' && r.treize[11].nombre === 2 && r.treize[11].premier === 11);
  verifier('dateCourte : l’année seulement quand elle diffère', r.memeAnnee === '17 oct.' && /2025/.test(r.autreAnnee),
    `${r.memeAnnee} / ${r.autreAnnee}`);
  verifier('court : coupe avec une ellipse', r.court === 'abcd…');
  await page.close();
}

await navigateur.close();
if (echecs > 0) {
  console.log(`\n❌ smoke-amatsu : ${echecs} verdict(s) en échec`);
  process.exit(1);
}
console.log('\n✅ smoke-amatsu : tous les verdicts tiennent');
