// Cartographie IMLADRIK (B1) : imladrik.html = la boussole interne du quadrant
// (modèle LV2), MUETTE et sans donnée intime (§5). Prouve :
//   A. La carto rend 3 caps (MAEDRETHNIR ouvert → maedrethnir.html ; VRANESH +
//      DRAUKHAIN à venir), le cœur Kalamn-talaen, la légende gravée, la parole
//      par défaut ; le survol d'un cap dépose la parole de Léo ; zéro requête
//      externe (aucun CDN, aucune donnée), zéro erreur console ; contrastes AA.
//   B. Fail-safe : la carto ne porte AUCUNE donnée (aucun appel réseau du tout),
//      même config vide → elle s'affiche pareil (rien à protéger, rien à fuir).
// Miroir léger de smoke-boussole.mjs, sans le cockpit/auth (carto muette).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

// LV5 / P3 — IMLADRIK est au ciel. `legendeClasse` (kalamn-legende) et `expose`
// (UltimaImladrikCarto) sont portés par `js/ciel-noeud.mjs` : vérifié dans le
// code avant de réécrire, pas supposé.
const { attendrePret, lireCaps, survoler } = await import('./_caps.mjs');

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

  // 1. Les trois caps.
  const caps = await lireCaps(page);
  verifier('3 caps rendus', caps.length === 3);
  const noms = caps.map((c) => c.nom);
  for (const attendu of ['MAEDRETHNIR', 'VRANESH', 'DRAUKHAIN']) {
    verifier(`Cap ${attendu} présent`, noms.includes(attendu), noms.join(', '));
  }

  // 2. Les 3 caps sont ouvrables (liens internes) — le quadrant est complet.
  const maedrethnir = page.locator('g.ciel-etoile[data-noeud-id="maedrethnir"]');
  // SIX ASSERTIONS REMPLACÉES : « est un lien <a> » et « → cible » lisaient une
  // ancre et son `href`. L'étoile est un `<g role="button">` — l'ancre a été
  // retirée en LV4 ④a parce qu'enveloppée, l'étoile perdait le focus clavier, et
  // le clavier passe avant le clic du milieu. Ce que ces assertions
  // garantissaient — les trois caps mènent quelque part — se lit désormais dans
  // le repli <noscript>, seul endroit où les adresses subsistent.
  // ET C'EST AINSI QU'UN DÉFAUT RÉEL EST SORTI : ce repli annonçait VRANESH et
  // DRAUKHAIN « à venir », SANS LIEN, alors qu'ils sont bâtis. Deux tiers du
  // quadrant étaient inatteignables sans JavaScript. Corrigé le 2026-08-17.
  const cibles = await page.evaluate(() => {
    const n = document.querySelector('#ciel-noeud-plateau noscript');
    return Array.from((n?.textContent || '').matchAll(/href="([^"]+)"/g)).map((m) => m[1]);
  });
  for (const [id, cible] of [
    ['maedrethnir', 'maedrethnir.html'],
    ['draukhain', 'draukhain.html'],
    ['vranesh', 'vranesh.html'],
  ]) {
    verifier(`${id} rendu au ciel`,
      (await page.locator(`g.ciel-etoile[data-noeud-id="${id}"]`).count()) === 1);
    verifier(`${id} → ${cible} (dans le repli sans JavaScript)`, cibles.includes(cible),
      JSON.stringify(cibles));
  }
  verifier('Aucun cap « à venir » restant (quadrant complet)',
    caps.filter((c) => c.avenir).length === 0);

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
  await survoler(page, 'maedrethnir');
  await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
  const parole = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol MAEDRETHNIR : nom dans la parole', /MAEDRETHNIR/.test(parole));
  verifier('Survol MAEDRETHNIR : état « Ouvert »', /Ouvert/.test(parole));
  verifier('Survol MAEDRETHNIR : appel à entrer', /entrer/i.test(parole));
  // « L'aiguille s'illumine » ABANDONNÉE : un ciel n'a pas de moyeu d'où la faire
  // partir. Remplacée par ce qu'elle disait — l'objet visé se signale — et MESURÉE
  // AU FOCUS, pas au survol : la scène glisse sous le curseur immobile (caméra
  // asymptotique), donc le `:hover` s'active et se désactive, et l'opacité lue
  // dépend de l'instant du déclic. Le focus, lui, est stable.
  // LA MODALITÉ CLAVIER DOIT ÊTRE ÉTABLIE AVANT DE MESURER `:focus-visible`.
  // Ce pseudo-sélecteur ne dépend pas seulement du focus mais de la FAÇON dont il
  // a été pris : après un clic souris, un `.focus()` programmatique ne le
  // déclenche pas. D'où un test vert en isolation et rouge dans la séquence
  // complète, où un clic le précède — le patrimoine l'a attrapé, pas moi.
  // Une pression sur Tab rétablit la modalité clavier, et c'est aussi la
  // condition RÉELLE où ce halo compte : quelqu'un qui navigue au clavier.
  await page.keyboard.press('Tab');
  await maedrethnir.focus();
  await page.waitForTimeout(300);
  const opHalo = await page.locator('g.ciel-etoile[data-noeud-id="maedrethnir"] .ciel-halo-focus')
    .evaluate((el) => +getComputedStyle(el).opacity);
  verifier('Halo MAEDRETHNIR allumé (mesuré au focus, stable)', opHalo >= 0.5, `opacité ${opHalo}`);

  // 5. Survol VRANESH (ouvert) : parole « les futurs potentiels » + appel à entrer.
  await survoler(page, 'vranesh');
  await page.waitForTimeout(250);
  const pv = (await page.locator('#boussole-parole').textContent()) || '';
  verifier('Survol VRANESH : futurs potentiels', /futurs potentiels/i.test(pv));
  verifier('Survol VRANESH : appel à entrer', /entrer/i.test(pv));

  // 6. Retour à la console + repli noscript présents.
  verifier('Retour vers naga.html (IMLADRIK vit sous le macro-quadrant NAGA)',
    (await page.locator('.console-retour a[href="naga.html"]').count()) === 1);

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
  verifier('Registre exposé (3 noms)', exposes.length === 3, exposes.join(', '));

  // 9. Muette : AUCUNE requête externe, zéro erreur console.
  verifier('Zéro requête externe (carto muette, aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

  await page.screenshot({ path: `${CAPTURES}/imladrik-carto.png`, fullPage: true });
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

  verifier('3 caps rendus (config vide)',
    (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === 3);
  verifier('Aucun appel /api (carto sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
  verifier('Zéro requête externe (config vide)', externes.length === 0, externes.slice(0, 3).join(', '));
  verifier('Zéro erreur console (config vide)', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));
  await page.close();
}

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE IMLADRIK CARTO VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
