// Cartographie IMLADRIK (B1) : imladrik.html = la boussole interne du quadrant
// (modèle LV2), MUETTE et sans donnée intime (§5). Prouve :
//   A. La carto rend QUATRE entrées (ARMES, DRAGONS — deux CONSTELLATIONS sans
//      page, dictées le 2026-09-29 — puis ADRAMELECH et TAO), le cœur
//      Kalamn-talaen, la légende gravée, la parole par défaut ; le survol d'un cap
//      dépose la parole de Léo ; zéro requête externe (aucun CDN), zéro erreur
//      console ; contrastes AA. Les trois dragons n'y sont PLUS au premier niveau
//      (leur absence est exigée) : ils vivent sous DRAGONS (section A2).
//   A2. La constellation DRAGONS, isolée (`imladrik.html#constellation-dragons`) :
//      MAEDRETHNIR, VRANESH, DRAUKHAIN, leurs paroles, leur halo.
//   B. Fail-safe : la carto ne porte AUCUNE donnée (aucun appel réseau du tout),
//      même config vide → elle s'affiche pareil (rien à protéger, rien à fuir).
//   C. Les CONSTELLATIONS : elles ne sont JAMAIS inertes (elles s'isolent au clic ;
//      un clic NORMAL — pas forcé — y plonge) ; IFULVIN, seul cap « à venir » de
//      l'arbre, l'est, et son clic ne mène nulle part.
// Miroir léger de smoke-boussole.mjs, sans le cockpit/auth (carto muette).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { NOEUDS } from '../js/registre-lv3.mjs';

// LV5 / P3 — IMLADRIK est au ciel. `legendeClasse` (kalamn-legende) et `expose`
// (UltimaImladrikCarto) sont portés par `js/ciel-noeud.mjs` : vérifié dans le
// code avant de réécrire, pas supposé.
const { attendrePret, lireCaps, survoler, naviguerVers } = await import('./_caps.mjs');

const BASE = 'http://127.0.0.1:8123';
const CAPTURES = new URL('./.cache/captures', import.meta.url).pathname;
mkdirSync(CAPTURES, { recursive: true });

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

// ===================== A. La carto rend et guide =====================
console.log('— A. imladrik.html : la cartographie Kalamn-talaen —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);

  // 1. Les QUATRE entrées (le compte se lit dans le registre ET se verrouille).
  //    2026-09-30 : ARMES et DRAGONS sont deux constellations ; les trois dragons
  //    ne sont plus au premier niveau, ils sont sous DRAGONS (section A2).
  const caps = await lireCaps(page);
  verifier('4 entrées rendues (= celles du registre)',
    caps.length === 4 && caps.length === NOEUDS.imladrik.enfants.length,
    `${caps.length} rendues, ${NOEUDS.imladrik.enfants.length} au registre`);
  const noms = caps.map((c) => c.nom);
  for (const attendu of ['ARMES', 'DRAGONS', 'ADRAMELECH', 'TAO']) {
    verifier(`Entrée ${attendu} présente`, noms.includes(attendu), noms.join(', '));
  }
  // L'ABSENCE, sous verrou de non-vacuité (quatre étoiles peintes ci-dessus) :
  // ni les dragons ni IFULVIN ne sont remis à plat au premier niveau.
  for (const id of ['maedrethnir', 'vranesh', 'draukhain', 'ifulvin']) {
    verifier(`${id} absent du premier niveau (il vit sous sa constellation)`,
      caps.length === 4
      && (await page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`).count()) === 0);
  }

  // 2. Les pages restent ouvrables — le quadrant est complet.
  // SIX ASSERTIONS REMPLACÉES : « est un lien <a> » et « → cible » lisaient une
  // ancre et son `href`. L'étoile est un `<g role="button">` — l'ancre a été
  // retirée en LV4 ④a parce qu'enveloppée, l'étoile perdait le focus clavier, et
  // le clavier passe avant le clic du milieu. Ce que ces assertions
  // garantissaient — les caps mènent quelque part — se lit désormais dans
  // le repli <noscript>, seul endroit où les adresses subsistent.
  // ET C'EST AINSI QU'UN DÉFAUT RÉEL EST SORTI : ce repli annonçait VRANESH et
  // DRAUKHAIN « à venir », SANS LIEN, alors qu'ils sont bâtis. Deux tiers du
  // quadrant étaient inatteignables sans JavaScript. Corrigé le 2026-08-17.
  // 2026-09-30 : le repli est une liste IMBRIQUÉE (DRAGONS et ses trois liens) ;
  // les cinq adresses y sont toujours, IFULVIN y est DIT sans lien.
  const repli = await page.evaluate(() => {
    const n = document.querySelector('#ciel-noeud-plateau noscript');
    const texte = n?.textContent || '';
    return {
      cibles: Array.from(texte.matchAll(/href="([^"]+)"/g)).map((m) => m[1]),
      texte,
    };
  });
  const cibles = repli.cibles;
  for (const [id, cible] of [
    ['maedrethnir', 'maedrethnir.html'],
    ['draukhain', 'draukhain.html'],
    ['vranesh', 'vranesh.html'],
    ['adramelech', 'adramelech.html'],
    ['tao', 'tao.html'],
  ]) {
    verifier(`${id} → ${cible} (dans le repli sans JavaScript)`, cibles.includes(cible),
      JSON.stringify(cibles));
  }
  verifier('Le repli sans JavaScript dit IFULVIN, sans lien (étoile d\'attente)',
    /IFULVIN/.test(repli.texte) && !cibles.some((c) => /ifulvin/i.test(c)),
    JSON.stringify(cibles));
  // ADRAMELECH et TAO sont des caps de premier niveau : rendus ici.
  for (const id of ['adramelech', 'tao']) {
    verifier(`${id} rendu au ciel (premier niveau)`,
      (await page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`).count()) === 1);
  }
  // « Aucun cap à venir restant » N'EST PLUS VRAI DE L'ARBRE : il reste UN cap à
  // venir, IFULVIN, sous ARMES. Au premier niveau il n'y en a toujours aucun (les
  // constellations, qui contiennent, ne sont jamais inertes) ; l'unicité d'IFULVIN
  // dans l'arbre entier est prouvée en section C, sur les trois écrans.
  verifier('Aucun cap inerte au premier niveau (les constellations plongent, elles ne sont pas « à venir »)',
    caps.length === 4 && caps.filter((c) => c.avenir).length === 0);

  // 3. Le cœur Kalamn-talaen + sa légende gravée.
  // Le cœur descend en SCEAU dans l'angle : au centre, il disputait la place aux
  // étoiles (vu sur capture le 2026-08-13). La gravure reste exigée.
  verifier('Cœur Kalamn-talaen présent (en sceau)',
    (await page.locator('.ciel-filigrane svg').count()) === 1);
  const legende = (await page.locator('.kalamn-legende').textContent()) || '';
  verifier('Légende « Kalamn-talaen » gravée', /Kalamn-talaen/.test(legende), legende);

  // ELLE EST GRAVÉE — MAIS OÙ ? Cette assertion manquait, et son absence a laissé
  // la légende peinte À MOITIÉ HORS DE L'ÉCRAN pendant des semaines : un
  // `transform: translate(-50%)` hérité de la boussole disparue décalait le bloc
  // que le ciel pose désormais en pleine largeur (−640 px en 1280, −195 en 390).
  // Un test qui vérifie qu'un texte EXISTE ne dit rien de l'endroit où il est.
  //
  // ON MESURE LA BOÎTE DU TEXTE, PAS CELLE DU BLOC : le bloc fait toute la
  // largeur du plateau, il « tient » donc toujours dans le cadre et ne prouve
  // rien. Un Range sur le contenu donne la boîte réellement peinte.
  const mesurerLegende = () => page.evaluate(() => {
    const e = document.querySelector('.ciel-noeud-plateau > .ciel-legende');
    if (!e) { return null; }
    const r = document.createRange(); r.selectNodeContents(e);
    const b = r.getBoundingClientRect();
    return { g: b.left, d: b.right, h: b.top, bas: b.bottom,
             vp: window.innerWidth, vh: window.innerHeight };
  });
  // LES DEUX LARGEURS, parce que le défaut se lisait aux deux et que Paul est
  // sur un téléphone : un cadrage prouvé sur un seul écran n'est pas prouvé.
  for (const largeur of [1280, 390]) {
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.waitForTimeout(300);
    const m = await mesurerLegende();
    verifier(`Légende DANS le cadre en ${largeur} px (boîte du texte, pas du bloc)`,
      !!m && m.g >= 0 && m.d <= m.vp && m.h >= 0 && m.bas <= m.vh,
      m ? `g=${Math.round(m.g)} d=${Math.round(m.d)} / ${m.vp}` : 'absente');
    verifier(`Légende centrée en ${largeur} px`,
      !!m && Math.abs((m.g + m.d) / 2 - m.vp / 2) <= m.vp * 0.02,
      m ? `centre=${Math.round((m.g + m.d) / 2)} attendu≈${m.vp / 2}` : 'absente');
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);

  // 4. Au repos, plus AUCUN message affiché (Paul, 2026-08-01) ; la parole de
  //    Léo ne se matérialise qu'au survol d'un cap — test d'ABSENCE puis survol.
  verifier('Cartouche invisible et muet au repos',
    await page.locator('#boussole-parole').evaluate((el) =>
      getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));
  // 2026-09-30 : le survol de référence n'est plus MAEDRETHNIR (il n'est plus au
  // premier niveau — ses survols sont éprouvés en section A2, sous DRAGONS) mais
  // la CONSTELLATION DRAGONS : sa parole est celle du registre, mot pour mot.
  await survoler(page, 'constellation-dragons');
  await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol DRAGONS : nom dans la parole', /DRAGONS/.test(parole));
  verifier('Survol DRAGONS : état « Constellation »', /Constellation/.test(parole));
  verifier('Survol DRAGONS : la phrase du registre, mot pour mot',
    parole.includes(NOEUDS['constellation-dragons'].resume), parole.slice(0, 160));
  verifier('Survol DRAGONS : la parole nomme les trois dragons',
    ['MAEDRETHNIR', 'VRANESH', 'DRAUKHAIN'].every((n) => parole.includes(n)));

  // 6. Retour à la console + repli noscript présents.
  verifier('Retour vers omega.html (IMLADRIK vit sous la supra-division OMEGA ; naga.html n\'existe plus)',
    (await page.locator('.console-retour a[href="omega.html"]').count()) === 1
    && (await page.locator('.console-retour a[href="naga.html"]').count()) === 0);

  // 7. Contrastes AA sur les couleurs réellement rendues.
  const cr = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    // LE SUPPORT A CHANGÉ : les noms se lisent sur la NUIT, plus sur le parchemin
    // d'une rose. Mesurer contre `--parchemin-carte` comparerait une encre à un
    // fond qui n'est plus derrière elle — un vert franc sur un rapport faux.
    const nuit = getComputedStyle(document.querySelector('.ciel-noeud-coque'))
      .getPropertyValue('--ciel-nuit-basse').trim() || '#03070e';
    return {
      parchemin: cs.getPropertyValue('--parchemin').trim(),
      nuit,
      capNom: document.querySelector('text.ciel-nom').getAttribute('fill'),
      capNomFond: nuit,
      legende: getComputedStyle(document.querySelector('.kalamn-legende')).color,
    };
  });
  verifier('Contraste nom d\'étoile sur la nuit ≥ 4,5:1',
    ratio(cr.capNom, cr.capNomFond) >= 4.5, `${ratio(cr.capNom, cr.capNomFond).toFixed(2)}:1`);
  // (l'invite « Léo te guide » a été retirée le 2026-08-01 — plus rien à mesurer ici)
  // La légende (or antique) est posée sous le médaillon, sur le fond de mer du
  // plateau (comme .titre-surligne) → contraste mesuré contre la mer profonde.
  verifier('Contraste légende sur la nuit ≥ 4,5:1',
    ratio(versHex(cr.legende), cr.nuit) >= 4.5, `${ratio(versHex(cr.legende), cr.nuit).toFixed(2)}:1`);

  // 8. Registre exposé pour introspection (donnée statique, aucune PII).
  const exposes = await page.evaluate(() => (window.UltimaImladrikCarto || {}).noms || []);
  verifier('Registre exposé (4 noms : ARMES, DRAGONS, ADRAMELECH, TAO)',
    exposes.length === 4 && ['ARMES', 'DRAGONS', 'ADRAMELECH', 'TAO'].every((n) => exposes.includes(n)),
    exposes.join(', '));

  // 9. Muette : AUCUNE requête externe, zéro erreur console.
  verifier('Zéro requête externe (carto muette, aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${CAPTURES}/imladrik-carto.png`, fullPage: true });
  await page.close();
}

// ===================== A2. La constellation DRAGONS, isolée =====================
// Les trois dragons ont quitté le premier niveau : c'est ICI qu'on les exige,
// et par les deux portes (l'adresse partagée, puis le clic — section C).
console.log('— A2. imladrik.html#constellation-dragons : MAEDRETHNIR, VRANESH, DRAUKHAIN —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(1200);

  const dragonsAttendus = NOEUDS['constellation-dragons'].enfants;
  const capsD = await lireCaps(page);
  verifier('DRAGONS (par l\'adresse) : trois étoiles, celles du registre',
    capsD.length === 3 && dragonsAttendus.length === 3
    && JSON.stringify(capsD.map((c) => c.id).sort()) === JSON.stringify([...dragonsAttendus].sort()),
    capsD.map((c) => c.id).join(','));
  verifier('DRAGONS : MAEDRETHNIR, VRANESH et DRAUKHAIN sont là, par leur nom',
    JSON.stringify(capsD.map((c) => c.nom).sort()) === JSON.stringify(['DRAUKHAIN', 'MAEDRETHNIR', 'VRANESH']),
    capsD.map((c) => c.nom).join(','));
  // L'ABSENCE, sous le verrou ci-dessus (trois étoiles peintes) : ni les frères de
  // la constellation, ni ce qui vit ailleurs sous IMLADRIK, ni le foyer lui-même.
  for (const id of ['constellation-dragons', 'constellation-armes', 'ifulvin', 'adramelech', 'tao']) {
    verifier(`DRAGONS isolée : ${id} n'est pas peint`,
      capsD.length === 3
      && (await page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`).count()) === 0);
  }
  verifier('DRAGONS : aucun dragon inerte (les trois ont leur page)',
    capsD.length === 3 && capsD.every((c) => !c.avenir));
  verifier('DRAGONS : le fil nomme le foyer (IMLADRIK › DRAGONS)',
    ((await page.locator('.ciel-fil-ici').textContent()) || '').trim() === 'DRAGONS');
  verifier('DRAGONS : retour vers omega.html toujours présent',
    (await page.locator('.console-retour a[href="omega.html"]').count()) === 1);

  // Les survols et le halo — ce que la carto éprouvait sur le premier niveau avant
  // que les dragons ne descendent d'un étage.
  const maedrethnir = page.locator('g.ciel-etoile[data-noeud-id="maedrethnir"]');
  await survoler(page, 'maedrethnir');
  await page.waitForFunction(() => /MAEDRETHNIR/.test(document.getElementById('boussole-parole').textContent), null, { timeout: 5000 });
  const parole = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol MAEDRETHNIR : nom dans la parole', /MAEDRETHNIR/.test(parole));
  verifier('Survol MAEDRETHNIR : état « Ouvert »', /Ouvert/.test(parole));
  verifier('Survol MAEDRETHNIR : appel à entrer', /entrer/i.test(parole));
  // (Mesuré AU FOCUS, pas au survol, et Tab d'abord : voir la note de la section A
  // d'origine — `:focus-visible` dépend de la façon dont le focus a été pris.)
  await page.keyboard.press('Tab');
  await maedrethnir.focus();
  await page.waitForTimeout(300);
  const opHalo = await page.locator('g.ciel-etoile[data-noeud-id="maedrethnir"] .ciel-halo-focus')
    .evaluate((el) => +getComputedStyle(el).opacity);
  verifier('Halo MAEDRETHNIR allumé (mesuré au focus, stable)', opHalo >= 0.5, `opacité ${opHalo}`);
  await survoler(page, 'vranesh');
  await page.waitForTimeout(250);
  const pv = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol VRANESH : futurs potentiels', /futurs potentiels/i.test(pv));
  verifier('Survol VRANESH : appel à entrer', /entrer/i.test(pv));

  // Sortir de la constellation : Échap remonte au premier niveau (quatre entrées),
  // et l'adresse perd son fragment — la plongée est réversible.
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelectorAll('g.ciel-etoile[data-noeud-id]').length === 4, null, { timeout: 5000 }).catch(() => {});
  const apresEchap = await lireCaps(page);
  verifier('Échap sur DRAGONS : retour au premier niveau (4 entrées, plus de fragment)',
    apresEchap.length === 4 && !/#/.test(page.url()), `${apresEchap.length} · ${page.url()}`);

  verifier('Zéro requête externe (DRAGONS isolée)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (DRAGONS isolée)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== B. Config vide : aucune donnée, aucune fuite =====================
console.log('— B. imladrik.html config vide : carto identique, zéro appel —');
{
  const { page, erreurs, externes } = await nouvellePage({ configVide: true });
  const appelsApi = [];
  await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);

  verifier('4 entrées rendues (config vide)',
    (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 4);
  verifier('Aucun appel /api (carto sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe (config vide)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (config vide)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IMLADRIK CARTO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
