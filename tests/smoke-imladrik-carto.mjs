// Cartographie IMLADRIK (B1) : imladrik.html = la boussole interne du quadrant
// (modèle LV2), MUETTE et sans donnée intime (§5). Prouve :
//   A. La carto rend DEUX entrées (ARMES, DRAGONS — deux CONSTELLATIONS sans
//      page, dictées le 2026-09-29 ; ADRAMELECH et TAO, à côté d'elles jusqu'au
//      2026-09-30, n'y sont plus : TAO est supprimé, ADRAMELECH est descendu sous
//      DRAGONS), le cœur Kalamn-talaen, la légende gravée, la parole par défaut ; le
//      survol d'un cap dépose la parole de Léo ; zéro requête externe (aucun CDN),
//      zéro erreur console ; contrastes AA. Les six étoiles des DRAGONS n'y sont PLUS
//      au premier niveau (leur absence est exigée) : elles vivent sous DRAGONS
//      (sections A2 à A5).
//   A2. La constellation DRAGONS, isolée (`imladrik.html#constellation-dragons`) :
//      MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM, ZEKROM — leurs
//      paroles, leur halo.
//   A3. DRAGONS n'a AUCUN trait de figure (`asterisme: false`) et UNE SEULE
//      passerelle (RESHIRAM ⇄ ZEKROM, son nom gravé) — à 390 et 1280 px, avec un
//      témoin (imladrik.html a, lui, un trait de figure).
//   A4. Ce que `smoke-tao` garantissait de VIVANT (la page est supprimée le
//      2026-09-30) et qui vit désormais sur les DRAGONS : la parole de Léo au
//      survol des deux pôles, leur porte (clic → page, repli sans JavaScript), le
//      bandeau, la légende, les cibles tactiles, les contrastes AA, la coque muette.
//      `tao.html` n'existe plus : 404, prouvé.
//   A5. Le COCKPIT agrégé (RESHIRAM + ZEKROM) au survol des DRAGONS : fermé sans
//      session, ouvert avec — c'est IMLADRIK, plus TAO, qui le porte.
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

  // 1. Les DEUX entrées (le compte se lit dans le registre ET se verrouille).
  //    2026-09-30 : ARMES et DRAGONS sont deux constellations ; les six étoiles des
  //    DRAGONS ne sont plus au premier niveau, elles sont sous DRAGONS (A2).
  //    Transposé de « 4 entrées » : ADRAMELECH et TAO ont quitté ce niveau.
  const caps = await lireCaps(page);
  verifier('2 entrées rendues (= celles du registre)',
    caps.length === 2 && caps.length === NOEUDS.imladrik.enfants.length,
    `${caps.length} rendues, ${NOEUDS.imladrik.enfants.length} au registre`);
  const noms = caps.map((c) => c.nom);
  for (const attendu of ['ARMES', 'DRAGONS']) {
    verifier(`Entrée ${attendu} présente`, noms.includes(attendu), noms.join(', '));
  }
  // L'ABSENCE, sous verrou de non-vacuité (deux étoiles peintes ci-dessus) : ni les
  // six étoiles des DRAGONS, ni IFULVIN, ni TAO ne sont remis à plat au premier
  // niveau. ADRAMELECH y était EXIGÉ (« caps de premier niveau : rendus ici ») :
  // INVERSION, il y est désormais exigé ABSENT ; RESHIRAM et ZEKROM (ex-TAO) aussi.
  for (const id of ['maedrethnir', 'vranesh', 'draukhain', 'adramelech', 'reshiram', 'zekrom',
    'ifulvin', 'tao']) {
    verifier(`${id} absent du premier niveau (il vit sous sa constellation, ou n'existe plus)`,
      caps.length === 2
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
  // 2026-09-30 : le repli est une liste IMBRIQUÉE (DRAGONS et ses six liens) ;
  // les six adresses y sont, IFULVIN y est DIT sans lien, et TAO n'y est plus.
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
    ['reshiram', 'reshiram.html'],
    ['zekrom', 'zekrom.html'],
    ['zohshia', 'zohshia.html'],
  ]) {
    verifier(`${id} → ${cible} (dans le repli sans JavaScript)`, cibles.includes(cible),
      JSON.stringify(cibles));
  }
  verifier('Le repli sans JavaScript ne mène plus à TAO (sous verrou : sept liens lus)',
    cibles.length === 7 && !cibles.some((c) => /tao/i.test(c)) && !/\btao\b/i.test(repli.texte),
    JSON.stringify(cibles));
  verifier('Le repli sans JavaScript dit IFULVIN, sans lien (étoile d\'attente)',
    /IFULVIN/.test(repli.texte) && !cibles.some((c) => /ifulvin/i.test(c)),
    JSON.stringify(cibles));
  // AMATSU (18/10/2026), même règle qu'IFULVIN : dit, sans lien — une page qui
  // n'existe pas ne se promet pas.
  verifier('Le repli sans JavaScript dit AMATSU, sans lien (étoile d\'attente, 18/10/2026)',
    /AMATSU/.test(repli.texte) && !cibles.some((c) => /amatsu/i.test(c)),
    JSON.stringify(cibles));
  // « Aucun cap à venir restant » N'EST PLUS VRAI DE L'ARBRE : il reste UN cap à
  // venir, IFULVIN, sous ARMES. Au premier niveau il n'y en a toujours aucun (les
  // constellations, qui contiennent, ne sont jamais inertes) ; l'unicité d'IFULVIN
  // dans l'arbre entier est prouvée en section C, sur les trois écrans.
  verifier('Aucun cap inerte au premier niveau (les constellations plongent, elles ne sont pas « à venir »)',
    caps.length === 2 && caps.filter((c) => c.avenir).length === 0);

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
  // TRANSPOSÉ (30/09) : « la parole nomme les trois dragons » ne peut plus tenir —
  // la phrase du registre a CHANGÉ, à dessein : elle ne cite plus MAEDRETHNIR,
  // VRANESH et DRAUKHAIN, elle décrit ce que la constellation contient (le journal,
  // les futurs, la volonté, la bibliothèque d'idées) et nomme le COUPLE qui vient
  // d'y entrer. On exige donc ces cinq contenus, dans la parole lue (et non dans le
  // registre) — l'assertion n'est pas relâchée, elle suit la phrase.
  // REFORMULÉ LE 04/10/2026 : la phrase parle désormais la langue des
  // épithètes (vérité, futur, serment, imagination) et nomme ZOH SHIA par la
  // technologie. Même exigence : chaque contenu, lu dans la parole.
  verifier('Survol DRAGONS : la parole dit ce que la constellation contient (vérité, futur, serment, imagination, RESHIRAM ⇄ ZEKROM, technologie)',
    /vérité/.test(parole) && /futur/.test(parole) && /serment/.test(parole)
    && /imagination/.test(parole) && /RESHIRAM/.test(parole) && /ZEKROM/.test(parole)
    && /technologie/.test(parole),
    parole.slice(0, 220));

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
  verifier('Registre exposé (2 noms : ARMES, DRAGONS ; ni ADRAMELECH ni TAO)',
    exposes.length === 2 && ['ARMES', 'DRAGONS'].every((n) => exposes.includes(n))
    && !exposes.includes('TAO') && !exposes.includes('ADRAMELECH'),
    exposes.join(', '));
  // TAO A DISPARU DU SERVEUR : la page répond 404 (le témoin, imladrik.html, 200 —
  // sinon « 404 » serait vrai d'un serveur qui ne sert plus rien).
  {
    const [tao, taoNu, temoin] = await Promise.all([
      fetch(`${BASE}/tao.html`), fetch(`${BASE}/tao`), fetch(`${BASE}/imladrik.html`)]);
    verifier('tao.html n\'existe plus (404) ; imladrik.html répond 200 (témoin)',
      temoin.status === 200 && tao.status === 404 && taoNu.status === 404,
      `tao.html ${tao.status}, /tao ${taoNu.status}, imladrik.html ${temoin.status}`);
  }

  // 9. Muette : AUCUNE requête externe, zéro erreur console.
  verifier('Zéro requête externe (carto muette, aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${CAPTURES}/imladrik-carto.png`, fullPage: true });
  await page.close();
}

// ===================== A2. La constellation DRAGONS, isolée =====================
// Les six étoiles ont quitté le premier niveau : c'est ICI qu'on les exige, et par
// les deux portes (l'adresse partagée, puis le clic — section C).
console.log('— A2. imladrik.html#constellation-dragons : les six étoiles —');
{
  const { page, erreurs, externes } = await nouvellePage();
  await page.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(1200);

  const dragonsAttendus = NOEUDS['constellation-dragons'].enfants;
  const capsD = await lireCaps(page);
  // SEPT depuis le 04/10/2026 (ZOH SHIA), HUIT depuis le 18/10/2026 (AMATSU, le dragon de l'air).
  verifier('DRAGONS (par l\'adresse) : huit étoiles, celles du registre',
    capsD.length === 8 && dragonsAttendus.length === 8
    && JSON.stringify(capsD.map((c) => c.id).sort()) === JSON.stringify([...dragonsAttendus].sort()),
    capsD.map((c) => c.id).join(','));
  verifier('DRAGONS : MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM, ZEKROM, ZOH SHIA et AMATSU sont là, par leur nom',
    JSON.stringify(capsD.map((c) => c.nom).sort())
      === JSON.stringify(['ADRAMELECH', 'AMATSU', 'DRAUKHAIN', 'MAEDRETHNIR', 'RESHIRAM', 'VRANESH', 'ZEKROM', 'ZOH SHIA']),
    capsD.map((c) => c.nom).join(','));
  // L'ABSENCE, sous le verrou ci-dessus (six étoiles peintes) : ni les frères de la
  // constellation, ni ce qui vit ailleurs sous IMLADRIK, ni le foyer lui-même, ni
  // TAO. INVERSÉ : `adramelech` figurait dans cette liste d'absents ; il est
  // maintenant l'une des six étoiles, exigée PRÉSENTE ci-dessus et par son nom.
  for (const id of ['constellation-dragons', 'constellation-armes', 'ifulvin', 'tao']) {
    verifier(`DRAGONS isolée : ${id} n'est pas peint`,
      capsD.length === 8
      && (await page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`).count()) === 0);
  }
  // TRANSPOSÉ (18/10/2026) : AMATSU, le dragon de l'air, est une étoile d'attente —
  // la seule inerte sous DRAGONS, NOMMÉE : « aucune » ne reviendrait vrai que si
  // l'on retirait l'étoile, et une deuxième inerte ferait rougir la ligne.
  verifier('DRAGONS : une seule étoile inerte, AMATSU (18/10/2026) — les sept autres ont leur page',
    capsD.length === 8 && capsD.filter((c) => c.avenir).map((c) => c.id).join() === 'amatsu');
  verifier('DRAGONS : le fil nomme le foyer (IMLADRIK › DRAGONS)',
    ((await page.locator('.ciel-fil-ici').textContent()) || '').trim() === 'DRAGONS');
  verifier('DRAGONS : retour vers omega.html toujours présent',
    (await page.locator('.console-retour a[href="omega.html"]').count()) === 1);

  // Les survols et le halo — ce que la carto éprouvait sur le premier niveau avant
  // que les dragons ne descendent d'un étage.
  const maedrethnir = page.locator('g.ciel-etoile[data-noeud-id="maedrethnir"]');
  await survoler(page, 'maedrethnir');
  await page.waitForFunction(() => /MAEDRETHNIR/.test(document.getElementById('boussole-parole').textContent), null, { timeout: 5000 }).catch(() => {});
  const parole = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol MAEDRETHNIR : nom dans la parole', /MAEDRETHNIR/.test(parole));
  // L'ÉPITHÈTE REMPLACE L'ÉTAT (Paul, 04/10/2026) — et l'état ne doit plus y être.
  verifier('Survol MAEDRETHNIR : épithète « Dragon de la vérité », plus d\'état « Ouvert »',
    /Dragon de la vérité/.test(parole) && !/Ouvert/.test(parole));
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

  // Sortir de la constellation : Échap remonte au premier niveau (DEUX entrées),
  // et l'adresse perd son fragment — la plongée est réversible.
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelectorAll('g.ciel-etoile[data-noeud-id]').length === 2, null, { timeout: 5000 }).catch(() => {});
  const apresEchap = await lireCaps(page);
  verifier('Échap sur DRAGONS : retour au premier niveau (2 entrées, plus de fragment)',
    apresEchap.length === 2 && !/#/.test(page.url()), `${apresEchap.length} · ${page.url()}`);

  verifier('Zéro requête externe (DRAGONS isolée)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (DRAGONS isolée)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== A3. DRAGONS : aucune figure, une seule passerelle =====================
// Paul, 30/09 : « pas obligé de relier les étoiles entre elles, sauf RESHIRAM et
// ZEKROM ». Le registre le dit (`asterisme: false`), le moteur l'applique
// (`js/ciel-noeud.mjs`) : AUCUN `.ciel-trait-figure` sur cet écran, et la seule arête
// est la passerelle du registre, RESHIRAM ⇄ ZEKROM, avec son nom gravé.
// L'ABSENCE des traits est éprouvée avec son témoin : sur `imladrik.html` (deux
// entrées), le MÊME instrument compte au moins un trait de figure — sans quoi « zéro »
// serait vrai d'un compteur qui ne verrait jamais rien.
console.log('— A3. DRAGONS : six étoiles indépendantes, une seule passerelle (390 et 1280) —');
const lireFigure = (page) => page.evaluate(() => ({
  etoiles: [...document.querySelectorAll('g.ciel-etoile[data-noeud-id]')].map((g) => g.getAttribute('data-noeud-id')),
  traitsFigure: document.querySelectorAll('.ciel-trait-figure').length,
  groupeFigure: !!document.querySelector('.ciel-asterisme'),
  liens: [...document.querySelectorAll('.ciel-liens line')].map((l) => ({
    a: l.dataset.a, b: l.dataset.b, dash: l.getAttribute('stroke-dasharray') || '' })),
  nomsLien: [...document.querySelectorAll('text.ciel-nom-lien')].map((t) => t.textContent.trim()),
}));
// La géométrie du nom de la passerelle, mesurée dans DEUX repères — car les deux
// répondent à deux questions distinctes :
//   · repère du SVG : l'ancre du nom est-elle au milieu de l'arc, et à quelle
//     distance PERPENDICULAIRE du trait (la mesure qu'utilisait `smoke-tao`) ;
//   · repère de l'écran : le TRAIT traverse-t-il la boîte peinte du texte ? Une ancre
//     à 8 unités du trait ne dit rien d'un texte de 70 px de large centré sur elle.
// `croise` est validée in situ sur deux cas dont on connaît la réponse : une boîte
// posée AU MILIEU du segment (elle doit être croisée), et la même envoyée à 400 px
// (elle ne doit pas l'être).
const geometrieNom = (page) => page.evaluate(() => {
  const t = document.querySelector('text.ciel-nom-lien');
  const l = document.querySelector('.ciel-liens line[data-a="reshiram"][data-b="zekrom"]');
  if (!t || !l) { return null; }
  const x1 = +l.getAttribute('x1'); const y1 = +l.getAttribute('y1');
  const x2 = +l.getAttribute('x2'); const y2 = +l.getAttribute('y2');
  const tx = +t.getAttribute('x'); const ty = +t.getAttribute('y');
  const perp = Math.abs((y2 - y1) * tx - (x2 - x1) * ty + x2 * y1 - y2 * x1) / Math.hypot(x2 - x1, y2 - y1);
  const m = l.getScreenCTM(); const pt = l.ownerSVGElement.createSVGPoint();
  const P = (x, y) => { pt.x = x; pt.y = y; return pt.matrixTransform(m); };
  const a = P(x1, y1); const b = P(x2, y2);
  const croise = (r) => {
    for (let s = 0; s <= 1.0001; s += 0.002) {
      const x = a.x + (b.x - a.x) * s; const y = a.y + (b.y - a.y) * s;
      if (x > r.left && x < r.right && y > r.top && y < r.bottom) { return true; }
    }
    return false;
  };
  const r = t.getBoundingClientRect();
  const cx = (a.x + b.x) / 2; const cy = (a.y + b.y) / 2;
  // LA POSITION DE LA BOÎTE RAPPORTÉE AU TRAIT (30/09) : le long du trait (le
  // nom doit rester au MILIEU) et perpendiculairement (il s'écarte d'autant que
  // sa boîte l'exige pour ne pas être traversée).
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / L; const uy = (b.y - a.y) / L;
  const bx = (r.left + r.right) / 2 - cx; const by = (r.top + r.bottom) / 2 - cy;
  const leLong = Math.abs(bx * ux + by * uy);
  const aCote = Math.abs(bx * uy - by * ux);
  const requis = Math.abs(uy) * r.width / 2 + Math.abs(ux) * r.height / 2;
  return {
    leLong, aCote, requis,
    ecartX: Math.abs(tx - (x1 + x2) / 2), ecartY: Math.abs(ty - (y1 + y2) / 2), perp,
    traverse: croise(r), largeurNom: r.width,
    temoinCroise: croise({ left: cx - 5, right: cx + 5, top: cy - 5, bottom: cy + 5 }),
    temoinLoin: croise({ left: cx + 400, right: cx + 410, top: cy - 5, bottom: cy + 5 }),
    opacite: +(t.getAttribute('opacity') || '1'), texte: t.textContent.trim(),
  };
});
for (const largeur of [1280, 390]) {
  const hauteur = largeur === 390 ? 844 : 900;
  const { page, erreurs, externes } = await nouvellePage({ viewport: { width: largeur, height: hauteur } });
  await page.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(2200);
  const f = await lireFigure(page);
  const cle = `DRAGONS@${largeur}`;

  verifier(`${cle} : huit étoiles, celles du registre`,
    f.etoiles.length === 8
    && JSON.stringify([...f.etoiles].sort()) === JSON.stringify([...NOEUDS['constellation-dragons'].enfants].sort()),
    f.etoiles.join(','));
  // L'ABSENCE, sous le verrou des six étoiles peintes.
  verifier(`${cle} : ZÉRO .ciel-trait-figure, et pas même le groupe de la figure`,
    f.etoiles.length === 8 && f.traitsFigure === 0 && f.groupeFigure === false,
    `${f.traitsFigure} trait(s), groupe ${f.groupeFigure}`);
  // La passerelle : UNE ligne, RESHIRAM → ZEKROM, en pointillés (le motif dit le type).
  verifier(`${cle} : exactement une ligne .ciel-liens line, data-a=reshiram data-b=zekrom`,
    f.liens.length === 1 && f.liens[0].a === 'reshiram' && f.liens[0].b === 'zekrom',
    JSON.stringify(f.liens));
  verifier(`${cle} : la passerelle est en pointillés (le motif dit le type de lien)`,
    f.liens.length === 1 && f.liens[0].dash !== '', JSON.stringify(f.liens));
  verifier(`${cle} : le nom « ⇄ rétroplanning » est gravé, et c'est celui du registre`,
    f.nomsLien.length === 1 && /rétroplanning/.test(f.nomsLien[0]) && f.nomsLien[0] === NOEUDS.reshiram.lienLibelle,
    JSON.stringify(f.nomsLien));

  // LE TÉMOIN : sur imladrik.html, le même instrument voit un trait de figure.
  {
    const { page: pageT } = await nouvellePage({ viewport: { width: largeur, height: hauteur } });
    await pageT.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
    await attendrePret(pageT);
    await pageT.waitForTimeout(1500);
    const t = await lireFigure(pageT);
    verifier(`${cle} : témoin — sur imladrik.html (2 entrées), l'instrument voit ≥ 1 trait de figure`,
      t.etoiles.length === 2 && t.traitsFigure >= 1 && t.groupeFigure === true,
      `${t.etoiles.length} étoiles, ${t.traitsFigure} trait(s)`);
    await pageT.close();
  }

  // LE NOM DE LA PASSERELLE, mesuré.
  const g = await geometrieNom(page);
  // TRANSPOSÉ LE 30/09. L'ancien contrôle (« ancre à ≤ 12 / 14 unités du
  // milieu ») supposait un nom posé À 8 UNITÉS du trait ; c'est ce qui le
  // faisait traverser dès que le trait est vertical. Le nom reste au MILIEU le
  // long du trait (≤ 12 px) et s'en écarte de ce que sa boîte exige, sans
  // s'envoler (≤ exigé + 14 px).
  verifier(`${cle} : le nom est posé au milieu de la passerelle, et à côté d'elle (mesuré)`,
    !!g && g.leLong <= 12 && g.aCote >= g.requis && g.aCote <= g.requis + 14,
    g ? `le long ${g.leLong.toFixed(1)} px, à côté ${g.aCote.toFixed(1)} px (exigé ${g.requis.toFixed(1)})` : 'introuvable');
  verifier(`${cle} : le nom est LISIBLE (opacité utile ≥ 0,4)`, !!g && g.opacite >= 0.4,
    g ? String(g.opacite) : 'introuvable');
  // TRANSPOSÉ TEL QUEL de smoke-tao : « le nom n'est pas barré par le trait (≥ 4
  // unités, mesuré perpendiculairement) ». Il mesure l'ANCRE, pas le texte.
  verifier(`${cle} : l'ancre du nom est à ≥ 4 unités du trait (mesure de smoke-tao, transposée)`,
    !!g && g.perp >= 4, g ? `${g.perp.toFixed(2)} unités` : 'introuvable');
  // LA MESURE QUE `smoke-tao` NE POUVAIT PAS FAIRE (et que sa géométrie rendait
  // superflue) : les deux pôles y étaient en DIAGONALE, de part et d'autre du
  // centre ; ils sont ici l'un sur l'autre, presque à la verticale, et un trait
  // vertical traverse un texte horizontal de 70 px centré à 8 unités de lui. On
  // mesure donc la BOÎTE du texte contre le SEGMENT, et on valide l'instrument
  // d'abord (la boîte posée sur le segment est croisée, la boîte lointaine non).
  verifier(`${cle} : verrou — l'instrument « le trait traverse la boîte » distingue croisé et non croisé`,
    !!g && g.temoinCroise === true && g.temoinLoin === false && g.largeurNom > 20,
    g ? `témoin croisé ${g.temoinCroise}, lointain ${g.temoinLoin}, nom ${g.largeurNom.toFixed(0)} px` : 'introuvable');
  verifier(`${cle} : le trait ne TRAVERSE PAS le nom « ⇄ rétroplanning » (boîte du texte, pas point d'ancrage)`,
    !!g && g.temoinCroise === true && g.traverse === false,
    g ? `traverse: ${g.traverse}` : 'introuvable');

  verifier(`${cle} : zéro requête externe`, externes.length === 0, externes.slice(0, 3).join(', '));
  verifier(`${cle} : zéro erreur console`, erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== A4. Ce que TAO garantissait, sur les DRAGONS =====================
// `smoke-tao` est supprimé avec sa page (30/09). Chacune de ses garanties qui porte
// encore sur quelque chose de vivant est reprise ICI, sur
// `imladrik.html#constellation-dragons` ; celles qui ne portaient que sur la page
// disparue sont listées dans le rapport de la boucle, avec leur raison.
console.log('— A4. DRAGONS : la parole, les portes, le bandeau, les contrastes (repris de smoke-tao) —');
{
  const appelsApi = [];
  const { page, erreurs, externes } = await nouvellePage();
  await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });
  await page.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(2000);

  // Le BANDEAU. Sur un écran isolé, il reste celui d'IMLADRIK (le foyer se nomme
  // dans le fil « IMLADRIK › DRAGONS ») : la surligne et le titre du nœud
  // `constellation-dragons` ne sont pas peints ici — c'est la seule chose de
  // `Surligne/Titre = ceux du registre` qui reste vraie, et on l'exige telle quelle.
  const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
  const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
  // TRANSPOSÉ LE 30/09 — « un bandeau par constellation » (Paul). Le bandeau
  // porte désormais le FOYER isolé, lu au registre ; il portait IMLADRIK.
  verifier('DRAGONS : surligne = celle du registre (la constellation isolée)',
    surligne === NOEUDS['constellation-dragons'].surligne, `lu: ${surligne}`);
  verifier('DRAGONS : titre = celui du registre (la constellation isolée)',
    principal === NOEUDS['constellation-dragons'].titre, `lu: ${principal}`);
  verifier('DRAGONS : le fil nomme le foyer (IMLADRIK › DRAGONS)',
    ((await page.locator('.ciel-fil').innerText()) || '').replace(/\s+/g, ' ').trim() === 'IMLADRIK › DRAGONS');
  // Plus de message de Léo affiché au repos (Paul, 2026-08-01) — test d'ABSENCE, sous
  // le verrou d'un bandeau réellement lu (surligne/titre ci-dessus).
  verifier('DRAGONS : invite « Léo te guide » retirée du bandeau',
    !!principal && (await page.locator('.console-invite').count()) === 0);
  // Le cœur gravé (sceau dans l'angle) et sa légende : celle du registre d'IMLADRIK.
  verifier('DRAGONS : cœur gravé (en sceau dans l\'angle)',
    (await page.locator('.ciel-filigrane svg').count()) === 1);
  const legende = (await page.locator('.ciel-legende').textContent())?.trim();
  verifier('DRAGONS : légende gravée = celle du registre (Kalamn-talaen)',
    legende === NOEUDS.imladrik.legende, `lu: ${legende}`);
  verifier('DRAGONS : une étoile par cap (ce que les aiguilles approchaient) — huit',
    (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 8);
  // Retour vers OMEGA, et plus AUCUN lien vers une page disparue (TAO, NAGA, GRIMA, ULTIMA).
  verifier('DRAGONS : retour « ↞ OMEGA » vers omega.html, aucun lien vers tao / naga / grima / ultima',
    (await page.locator('.console-retour a[href="omega.html"]').count()) === 1
    && (await page.locator('a[href="tao.html"], a[href="naga.html"], a[href="grima.html"], a[href="ultima.html"]').count()) === 0);

  // LA PAROLE DE LÉO dit le rétroplanning — l'arc est décor, la parole est annoncée.
  await survoler(page, 'reshiram');
  await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
  const paroleR = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol RESHIRAM : le réel + le rétroplanning dits par Léo',
    /RESHIRAM/.test(paroleR) && /talents réels/i.test(paroleR) && /rétroplanning/i.test(paroleR),
    `lu: ${paroleR.slice(0, 140)}`);
  await survoler(page, 'zekrom');
  await page.waitForFunction(() => /ZEKROM/.test(document.getElementById('boussole-parole').textContent), null, { timeout: 5000 }).catch(() => {});
  const paroleZ = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol ZEKROM : l\'idéal + le rétroplanning dits par Léo',
    /ZEKROM/.test(paroleZ) && /idéal/i.test(paroleZ) && /rétroplanning/i.test(paroleZ),
    `lu: ${paroleZ.slice(0, 140)}`);
  // Ils s'entrent : leur parole invite à entrer (ils ont une page).
  verifier('Survol ZEKROM : appel à entrer (il a sa page)', /entrer/i.test(paroleZ));

  // Cibles tactiles ≥ 44 px sur les deux pôles, AU BUREAU (1280) — la zone de
  // captation du disque, pas une boîte de mise en page.
  for (const id of ['reshiram', 'zekrom']) {
    const boite = await page.locator(`g.ciel-etoile[data-noeud-id="${id}"] .ciel-zone`).boundingBox();
    verifier(`Cible tactile ${id} ≥ 44 px (bureau)`, Boolean(boite) && boite.height >= 44 && boite.width >= 44,
      boite ? `${boite.width.toFixed(0)}×${boite.height.toFixed(0)}` : 'introuvable');
  }

  // CONTRASTES AA sur les couleurs réellement rendues : les noms d'étoile et de
  // passerelle se lisent sur la NUIT du ciel, le titre sur le voile de son bandeau.
  const styles = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.ciel-noeud-coque'));
    const nuit = cs.getPropertyValue('--ciel-nuit-basse').trim() || '#03070e';
    return {
      nuit,
      noms: [...document.querySelectorAll('text.ciel-nom')].map((t) => t.getAttribute('fill')),
      lien: getComputedStyle(document.querySelector('text.ciel-nom-lien')).fill,
      titre: getComputedStyle(document.querySelector('.console-titre')).color,
      voile: getComputedStyle(document.querySelector('.console-entete')).backgroundColor,
      legende: getComputedStyle(document.querySelector('.ciel-legende')).color,
    };
  });
  const rNoms = styles.noms.map((c) => ratio(c, styles.nuit));
  verifier('Contraste des huit noms d\'étoile sur la nuit ≥ 4,5:1',
    rNoms.length === 8 && Math.min(...rNoms) >= 4.5, `${Math.min(...rNoms).toFixed(2)}:1 (${rNoms.length} noms)`);
  const rLien = ratio(versHex(styles.lien), styles.nuit);
  verifier('Contraste nom de passerelle sur la nuit ≥ 4,5:1', rLien >= 4.5, `${rLien.toFixed(2)}:1`);
  const rTitre = ratio(versHex(styles.titre), versHex(styles.voile));
  verifier('Contraste titre sur son voile ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
  const rLeg = ratio(versHex(styles.legende), styles.nuit);
  verifier('Contraste légende sur la nuit ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

  // LA COQUE EST MUETTE : aucune donnée n'y transite (les chiffres vivent sur les pages
  // RESHIRAM / ZEKROM, derrière auth). Sans session, rien ne part vers /api.
  verifier('Aucun appel /api (coque sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe (aucun CDN) — DRAGONS', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console — DRAGONS', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}
// LES PORTES DES DEUX PÔLES, par le geste : on CLIQUE (une preuve plus forte qu'un
// attribut lu — l'étoile n'est pas une ancre). Une page neuve par clic : le premier
// quitte la page. Témoin de l'instrument : `naviguerVers` voit bien une navigation
// (section C) ; ici, l'arrivée est exigée sur la bonne page.
for (const [id, fichier] of [['reshiram', 'reshiram.html'], ['zekrom', 'zekrom.html']]) {
  const { page } = await nouvellePage();
  await page.goto(`${BASE}/imladrik.html#constellation-dragons`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(1500);
  const arrivee = await naviguerVers(page, id);
  verifier(`Cliquer ${id.toUpperCase()} depuis les DRAGONS mène à ${fichier} (preuve par le geste)`,
    !!arrivee && new URL(arrivee).pathname.endsWith('/' + fichier), String(arrivee));
  await page.close();
}

// ===================== A5. Le COCKPIT agrégé des DRAGONS =====================
// Ce que TAO faisait en agrégeant RESHIRAM et ZEKROM au survol (ligne « En cours » +
// badge « À traiter »), la constellation DRAGONS le fait, et c'est IMLADRIK — plus
// TAO — qui porte le drapeau `cockpit`. Éprouvé AU NAVIGATEUR, à la source réelle
// (`/api/cockpit`, fixture de comptes entiers) :
//   · SANS session : fail-closed — aucune ligne « En cours », aucun badge ;
//   · AVEC session, sur la MÊME page : la ligne et le badge paraissent (c'est le
//     témoin qui donne son sens à l'absence de la première mesure) ;
//   · ARMES, la constellation sœur, n'en reçoit rien (absence, sous verrou) ;
//   · sur l'écran isolé DRAGONS, RESHIRAM dit SA ligne et MAEDRETHNIR aucune.
console.log('— A5. DRAGONS : le cockpit agrégé (RESHIRAM + ZEKROM), fermé sans session —');
{
  const COCKPIT = { ok: true, data: {
    reshiram: { talents: 3, a_etayer: 1, offre: 2 },
    zekrom: { ideaux: 3, a_orienter: 0, acquis: 2, a_construire: 1 },
    riven: { relances_dues: 2 },
  } };
  const { page, erreurs, externes } = await nouvellePage();
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-30', projets: [], macro: {}, cartouche: { signaux: [] } } }) }));
  let bearer = '';
  await page.route('**/api/cockpit', (r) => {
    bearer = r.request().headers().authorization || '';
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(COCKPIT) });
  });
  await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
  await attendrePret(page);
  await page.waitForTimeout(1500);
  const lireParole = async (id, nom) => {
    await survoler(page, id);
    await page.waitForFunction((n) => document.getElementById('boussole-parole').textContent.includes(n), nom, { timeout: 5000 }).catch(() => {});
    return page.evaluate(() => ({
      texte: document.getElementById('boussole-parole').textContent || '',
      cockpit: (document.querySelector('#boussole-parole .parole-cockpit') || {}).textContent || null,
      signal: (document.querySelector('#boussole-parole .parole-signal') || {}).textContent || null,
    }));
  };
  // ① sans session : rien.
  const sans = await lireParole('constellation-dragons', 'DRAGONS');
  verifier('Sans session : la parole des DRAGONS est lue (nom présent), sans ligne « En cours » ni badge',
    /DRAGONS/.test(sans.texte) && sans.cockpit === null && sans.signal === null,
    JSON.stringify({ cockpit: sans.cockpit, signal: sans.signal }));
  // ② avec session, sur la même page.
  await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
  await page.waitForResponse('**/api/cockpit', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  verifier('Avec session : le Bearer est transmis à /api/cockpit', bearer === 'Bearer jeton-d-essai', bearer);
  await survoler(page, 'constellation-armes');
  await page.waitForTimeout(300);
  const dragons = await lireParole('constellation-dragons', 'DRAGONS');
  verifier('Avec session, survol DRAGONS : « En cours — 3 talents réels · 1 à étayer — 3 idéaux · 0 à orienter. »',
    dragons.cockpit !== null
    && /3 talents réels · 1 à étayer — 3 idéaux · 0 à orienter\./.test(dragons.cockpit),
    String(dragons.cockpit));
  verifier('Avec session, survol DRAGONS : badge « À traiter — 1 talent à étayer » (sans « à orienter », sans les relances de RIVEN)',
    dragons.signal !== null && /1 talent à étayer/.test(dragons.signal)
    && !/à orienter/.test(dragons.signal) && !/relance/.test(dragons.signal),
    String(dragons.signal));
  // ③ ARMES : rien, sous le verrou de la lecture réussie ci-dessus.
  await page.locator('g.ciel-etoile[data-noeud-id="constellation-dragons"]').dispatchEvent('mouseleave');
  const armes = await lireParole('constellation-armes', 'ARMES');
  verifier('Avec session, survol ARMES : aucune ligne « En cours », aucun badge (le cockpit ne fuit pas)',
    dragons.cockpit !== null && /ARMES/.test(armes.texte) && armes.cockpit === null && armes.signal === null,
    JSON.stringify({ cockpit: armes.cockpit, signal: armes.signal }));
  // ④ l'écran isolé : on plonge (clic normal), puis RESHIRAM dit sa ligne.
  await page.locator('g.ciel-etoile[data-noeud-id="constellation-dragons"] .ciel-zone').click({ timeout: 8000 });
  await page.waitForFunction(() => window.location.hash === '#constellation-dragons', null, { timeout: 5000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll('g.ciel-etoile[data-noeud-id]').length === 6, null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(700);
  const reshiram = await lireParole('reshiram', 'RESHIRAM');
  verifier('DRAGONS isolée, survol RESHIRAM : sa propre ligne « 3 talents réels · 1 à étayer. »',
    reshiram.cockpit !== null && /^3 talents réels · 1 à étayer\.$/.test(reshiram.cockpit.replace(/^En cours — /, '').trim()),
    String(reshiram.cockpit));
  await page.locator('g.ciel-etoile[data-noeud-id="reshiram"]').dispatchEvent('mouseleave');
  const maedrethnir = await lireParole('maedrethnir', 'MAEDRETHNIR');
  verifier('DRAGONS isolée, survol MAEDRETHNIR : aucune ligne « En cours » (pas d\'agrégat pour lui)',
    reshiram.cockpit !== null && /MAEDRETHNIR/.test(maedrethnir.texte) && maedrethnir.cockpit === null,
    String(maedrethnir.cockpit));
  verifier('Zéro requête externe (cockpit)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (cockpit)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
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

  verifier('2 entrées rendues (config vide)',
    (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 2);
  verifier('Aucun appel /api (carto sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe (config vide)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (config vide)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

// ===================== C. Les constellations : on plonge, jamais inertes =====================
// LE DÉFAUT QUE CETTE SECTION FERME (30/09). Les constellations n'ont pas de cible
// (elles ne portent pas de page) ; la règle « un cap sans cible est à venir »
// posait donc `aria-disabled="true"` sur ARMES et DRAGONS — annoncées mortes au
// lecteur d'écran, grisées, et Playwright refusait même de cliquer — alors que le
// clic les isole. Le partage exact, le même qu'`entrer()` dans js/ciel-noeud.mjs :
//   INERTE = pas de cible ET pas d'enfants. Ce qui CONTIENT plonge, page ou pas.
//
// ⛔ LE CLIC EST NORMAL, PAS FORCÉ. `dispatchEvent('click')` ignore l'actionnabilité
// (visible, stable, ACTIVÉ) : il aurait cliqué une étoile `aria-disabled` sans
// broncher et laissé le défaut vert. `locator.click()` attend « enabled » — et
// c'est précisément ce contrôle, qu'aucun utilisateur ne peut contourner, qui
// le rattrape. Le garde-fou s'éprouve du côté où il peut être contourné.
console.log('— C. ARMES et DRAGONS plongent ; IFULVIN, seul cap « à venir », est inerte —');
{
  const inerteAttendu = (id) => !NOEUDS[id].cible && !(NOEUDS[id].enfants || []).length;
  // La règle se lit sur CHAQUE étoile peinte : aria-disabled ⇔ inerte attendu.
  const reglesTenues = (caps) => caps.length >= 1
    && caps.every((c) => c.avenir === inerteAttendu(c.id));
  const surLesTroisEcrans = {};

  // ---- C1. Le premier niveau : les deux constellations ne sont pas inertes ----
  {
    const { page, erreurs, externes } = await nouvellePage();
    await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
    await attendrePret(page);
    await page.waitForTimeout(1500);
    const etoile = (id) => page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`);
    const premier = await lireCaps(page);
    surLesTroisEcrans.premier = premier;
    for (const id of ['constellation-armes', 'constellation-dragons']) {
      verifier(`${id} : peinte (verrou) et SANS aria-disabled`,
        (await etoile(id).count()) === 1 && (await etoile(id).getAttribute('aria-disabled')) === null,
        String(await etoile(id).getAttribute('aria-disabled')));
    }
    verifier('Premier niveau : aria-disabled ⇔ (pas de cible ET pas d\'enfants), sur chaque étoile',
      reglesTenues(premier), JSON.stringify(premier.map((c) => [c.id, c.avenir])));

    // LA PAROLE NE CONTREDIT PAS LE GESTE (30/09). Au survol, ARMES et DRAGONS
    // disaient « Cap en préparation » alors que le clic y plonge : même partage
    // que l'aria-disabled, oublié dans `afficherResume`. Verrou : la parole a
    // bien été lue (le nom y est) avant de juger son action.
    for (const [id, nom] of [['constellation-armes', 'ARMES'], ['constellation-dragons', 'DRAGONS']]) {
      await survoler(page, id);
      await page.waitForFunction((n) => document.getElementById('boussole-parole').textContent.includes(n), nom, { timeout: 5000 }).catch(() => {});
      const action = (await page.locator('#boussole-parole .parole-action').textContent().catch(() => '')) || '';
      const lue = ((await page.locator('#boussole-parole').textContent()) || '').includes(nom);
      verifier(`Survol ${nom} : la parole invite à entrer, jamais « en préparation »`,
        lue && action === 'Clique pour entrer ↝' && !/préparation/i.test(action), `lue=${lue} action=${action}`);
    }

    // CLIC NORMAL sur DRAGONS — pas de `force`, pas de `dispatchEvent`.
    let clicNormal = true; let raison = '';
    try {
      await page.locator('g.ciel-etoile[data-noeud-id="constellation-dragons"] .ciel-zone').click({ timeout: 8000 });
    } catch (e) { clicNormal = false; raison = String(e.message).split('\n')[0]; }
    verifier('Clic NORMAL (non forcé) sur la zone de DRAGONS : Playwright clique', clicNormal, raison);
    await page.waitForFunction(() => window.location.hash === '#constellation-dragons', null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
    verifier('… et l\'adresse devient #constellation-dragons',
      new URL(page.url()).hash === '#constellation-dragons', page.url());
    const dragons = await lireCaps(page);
    surLesTroisEcrans.dragons = dragons;
    verifier('… et huit étoiles paraissent : MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM, ZEKROM, ZOH SHIA, AMATSU',
      dragons.length === 8
      && JSON.stringify(dragons.map((c) => c.id).sort()) === JSON.stringify([...NOEUDS['constellation-dragons'].enfants].sort()),
      dragons.map((c) => c.id).join(','));
    // ZOH SHIA a sa page depuis le 04/10/2026 ; AMATSU (18/10/2026) attend la sienne :
    // UNE inerte sous DRAGONS, nommée.
    verifier('DRAGONS : aria-disabled ⇔ inerte attendu (une seule : AMATSU)',
      reglesTenues(dragons) && dragons.filter((c) => c.avenir).map((c) => c.id).join() === 'amatsu');

    // Zéro requête externe / zéro erreur : mesurés AVANT de quitter imladrik.html —
    // la page de destination du témoin (ci-dessous) n'est pas le sujet de cette
    // section, et ses propres chargements ne doivent pas se mêler au verdict.
    verifier('Zéro requête externe (C1)', externes.length === 0, externes.slice(0, 3).join(', '));
    verifier('Zéro erreur console (C1)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

    // Le TÉMOIN de l'instrument de navigation : le même `naviguerVers`, au même
    // délai, DOIT voir un dragon ouvrir sa page. Sans lui, « le clic sur IFULVIN
    // ne change pas l'URL » serait vert d'un instrument qui ne voit rien bouger.
    const atteinte = await naviguerVers(page, 'maedrethnir', 3000);
    verifier('Témoin : un clic sur MAEDRETHNIR (isolée) ouvre maedrethnir.html',
      !!atteinte && /\/maedrethnir\.html/.test(atteinte), String(atteinte));
    await page.close();
  }

  // ---- C2. ARMES : IFULVIN, l'étoile d'attente — inerte, et son clic n'ouvre rien ----
  {
    const { page, erreurs, externes } = await nouvellePage();
    await page.goto(`${BASE}/imladrik.html`, { waitUntil: 'load', timeout: 20000 });
    await attendrePret(page);
    await page.waitForTimeout(1500);
    let clicNormal = true; let raison = '';
    try {
      await page.locator('g.ciel-etoile[data-noeud-id="constellation-armes"] .ciel-zone').click({ timeout: 8000 });
    } catch (e) { clicNormal = false; raison = String(e.message).split('\n')[0]; }
    verifier('Clic NORMAL (non forcé) sur la zone de ARMES : Playwright clique', clicNormal, raison);
    await page.waitForFunction(() => window.location.hash === '#constellation-armes', null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
    verifier('… et l\'adresse devient #constellation-armes',
      new URL(page.url()).hash === '#constellation-armes', page.url());
    const armes = await lireCaps(page);
    surLesTroisEcrans.armes = armes;
    verifier('… et UNE étoile paraît : IFULVIN, nom exact',
      armes.length === 1 && armes[0].id === 'ifulvin' && armes[0].nom === 'IFULVIN',
      JSON.stringify(armes));
    const ifulvin = page.locator('g.ciel-etoile[data-noeud-id="ifulvin"]');
    verifier('IFULVIN : aria-disabled="true" (étoile d\'attente)',
      (await ifulvin.getAttribute('aria-disabled')) === 'true');
    verifier('IFULVIN : aucun lien (ni ancre, ni href) dans son étoile',
      (await ifulvin.locator('a[href], [href], [xlink\\:href]').count()) === 0);
    verifier('ARMES : aria-disabled ⇔ inerte attendu', reglesTenues(armes));
    // Sa parole dit ce qu'il est — et ne promet PAS d'y entrer.
    await survoler(page, 'ifulvin');
    await page.waitForFunction(() => /IFULVIN/.test(document.getElementById('boussole-parole').textContent), null, { timeout: 5000 }).catch(() => {});
    const parole = (await page.locator('#boussole-parole').textContent()) || '';
    verifier('Survol IFULVIN : nom, « À venir », et la phrase du registre mot pour mot',
      /IFULVIN/.test(parole) && /À venir/.test(parole) && parole.includes(NOEUDS.ifulvin.resume), parole.slice(0, 200));
    verifier('Survol IFULVIN : aucun appel à entrer (il n\'a pas de page)', !/entrer|ouvrir/i.test(parole), parole);
    // LE CLIC NE CHANGE PAS L'URL — et le témoin (C1) a prouvé que l'instrument
    // voit un changement quand il y en a un. Même délai (3000 ms).
    const avant = page.url();
    const apres = await naviguerVers(page, 'ifulvin', 3000);
    verifier('Clic sur IFULVIN : l\'URL ne change pas (aucune page promise)',
      apres === null && page.url() === avant, `${avant} → ${page.url()}`);
    const encore = await lireCaps(page);
    verifier('Clic sur IFULVIN : le ciel reste sur ARMES (une étoile, IFULVIN)',
      encore.length === 1 && encore[0].id === 'ifulvin');
    verifier('Zéro requête externe (C2)', externes.length === 0, externes.slice(0, 3).join(', '));
    verifier('Zéro erreur console (C2)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
    await page.close();
  }

  // ---- C3. « AUCUN CAP À VENIR RESTANT » devient « EXACTEMENT UN, IFULVIN » ----
  // Périmètre dit sans ambiguïté : ce qu'on atteint depuis imladrik.html en
  // descendant PAR LES CONSTELLATIONS (premier niveau, DRAGONS, ARMES). ADRAMELECH y
  // est désormais une des six étoiles des DRAGONS — sa page et ses trois caps ne
  // sont toujours pas dans ce périmètre. ⚠️ Plus
  // profond, ADRAMELECH porte son propre « à venir » (RAPPROCHEMENTS) : c'est un
  // autre écran, une autre page — l'unicité ne vaut pas pour tout l'arbre, et le
  // prétendre serait vrai sur les trois écrans et faux du registre.
  {
    const vus = ['premier', 'dragons', 'armes'].flatMap((k) => surLesTroisEcrans[k] || []);
    const avenirsVus = vus.filter((c) => c.avenir).map((c) => c.id);
    // Verrou de non-vacuité : les trois écrans ont bien été lus (2 + 8 + 1 étoiles).
    verifier('Verrou : les trois écrans ont été lus (2 + 8 + 1 étoiles)',
      (surLesTroisEcrans.premier || []).length === 2 && (surLesTroisEcrans.dragons || []).length === 8
      && (surLesTroisEcrans.armes || []).length === 1);
    // UN depuis que ZOH SHIA a sa page (04/10/2026) : IFULVIN (ARMES). DEUX depuis le
    // 18/10/2026 : AMATSU (DRAGONS) attend la sienne.
    verifier('Exactement DEUX caps à venir sur les trois écrans : AMATSU et IFULVIN',
      [...avenirsVus].sort().join() === 'amatsu,ifulvin', avenirsVus.join(','));
    // La même chose lue dans le REGISTRE, par la même descente (constellations seules).
    const feuillesSansPage = [];
    const descendre = (id) => (NOEUDS[id].enfants || []).forEach((e) => {
      if (NOEUDS[e].constellation === true) { descendre(e); }
      else if (!NOEUDS[e].cible && !(NOEUDS[e].enfants || []).length) { feuillesSansPage.push(e); }
    });
    descendre('imladrik');
    verifier('Le registre dit la même chose : deux caps sans page sous les constellations, AMATSU et IFULVIN',
      [...feuillesSansPage].sort().join() === 'amatsu,ifulvin', feuillesSansPage.join(','));
  }
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IMLADRIK CARTO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
