// Supra-division ALPHA (Ultima Lv3, boucle L2) : alpha.html.
// Prouve : bandeau conforme au REGISTRE, les caps du registre rendus (RENOBOOST IA ouvert en
// nouvel onglet + rel noopener ; DOKLĚS « à venir », inerte mais parlant), le
// cœur gravé + sa légende, le retour vers la racine, la parole de Léo au
// survol ET au focus clavier, le repli noscript, les contrastes AA, et —
// puisque ALPHA n'héberge aucune donnée — AUCUNE requête réseau (ni CDN, ni
// /api) et zéro erreur console.
import { chromium } from 'playwright';
import { NOEUDS, capsDe } from '../js/registre-lv3.mjs';

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
const page = await navigateur.newPage({ viewport: { width: 1280, height: 900 } });

const erreurs = [];
page.on('console', (msg) => { if (msg.type() === 'error') erreurs.push(msg.text()); });
page.on('pageerror', (err) => erreurs.push(String(err)));
const externes = [];
page.on('request', (req) => {
  const url = req.url();
  if (!url.startsWith(BASE) && !url.startsWith('data:')) externes.push(url);
});
const appelsApi = [];
await page.route('**/api/**', (route) => { appelsApi.push(route.request().url()); return route.abort(); });

console.log('— A. Supra-division ALPHA —');
await page.goto(`${BASE}/alpha.html`, { waitUntil: 'load', timeout: 20000 });
const { attendrePret, lireCaps, survoler } = await import('./_caps.mjs');
await attendrePret(page);

// Le bandeau suit le registre (anti-dérive de la coque).
const surligne = (await page.locator('h1.console-titre .titre-surligne').textContent())?.trim();
const principal = (await page.locator('h1.console-titre .titre-principal').textContent())?.trim();
verifier('Surligne = celle du registre', surligne === NOEUDS.alpha.surligne, `lu: ${surligne}`);
verifier('Titre = celui du registre', principal === NOEUDS.alpha.titre, `lu: ${principal}`);
// Plus de message de Léo affiché au repos (Paul, 2026-08-01) — test d'ABSENCE.
verifier('Invite « Léo te guide » retirée du bandeau',
  (await page.locator('.console-invite').count()) === 0);

// « AU REPOS » SE MESURE AVANT TOUTE INTERACTION, et c'est une correction : cette
// assertion vivait APRÈS le clic sur le cap externe, si bien qu'elle jugeait
// « au repos » un cartouche que le survol venait de remplir. Un état initial ne
// se vérifie qu'une fois, et au début.
verifier('Cartouche invisible et muet au repos',
  await page.locator('#boussole-parole').evaluate((el) =>
    getComputedStyle(el).visibility === 'hidden' && el.textContent.trim() === ''));

// Les caps, tels que le registre les porte.
const attendus = capsDe('alpha').map((c) => c.nom);
const caps = await lireCaps(page);
const noms = caps.map((c) => c.nom);
// ⛔ CE NOMBRE SE LIT AU REGISTRE, il ne se recopie pas (27/09). Le harnais
// écrivait « 2 caps », « 1 seul à venir », « 2 étoiles » : vrai jusqu'à ce
// qu'ALPHA gagne DOKLĚS et SYMPHO — trois rouges sur un écran sain. Même piège
// que `smoke-althea` au §22 du cadrage carte-celeste : un chiffre recopié
// décrit le registre d'un jour. Verrou : ALPHA porte au moins deux caps.
verifier('Verrou : ALPHA porte au moins deux caps au registre', attendus.length >= 2, `${attendus.length}`);
verifier(`${attendus.length} caps rendus (autant qu'au registre)`, noms.length === attendus.length, `trouvés: ${JSON.stringify(noms)}`);
// ORDRE ABANDONNÉ (LV5 / P3), raison écrite en LV4 ④a : une constellation range
// par géométrie, pas par liste. Le contrôle utile est conservé entier.
verifier('Les caps du registre sont tous là (ordre abandonné : la géométrie range)',
  JSON.stringify([...noms].sort()) === JSON.stringify([...attendus].sort()),
  `lu: ${JSON.stringify(noms)}`);

// RENOBOOST IA : porte externe, nouvel onglet, rel noopener.
// LE CAP EXTERNE — QUATRE ASSERTIONS REMPLACÉES PAR UNE PREUVE PAR LE GESTE.
// Elles lisaient `href`, `target="_blank"` et `rel="noopener"` sur une ancre.
// L'étoile n'est plus une ancre (LV4 ④a : enveloppée, elle perdait le focus
// clavier), donc ces trois attributs n'existent plus. Ce qu'ils PROMETTAIENT,
// lui, doit tenir : un cap externe ouvre un NOUVEL ONGLET sur la bonne adresse,
// sans donner la main à la page ouverte.
// On l'éprouve donc en cliquant et en regardant l'onglet qui naît. C'est plus
// fort qu'un attribut lu : un `target="_blank"` peut être présent et neutralisé.
const reno = page.locator('g.ciel-etoile[data-noeud-id="renoboost-ia"]');
verifier('RENOBOOST IA rendu', (await reno.count()) === 1);
{
  // ON MESURE L'APPEL, PAS SON ABOUTISSEMENT. Premier jet : on ouvrait vraiment
  // l'onglet et on lisait son URL — le harnais a répondu
  // `chrome-error://chromewebdata/`, parce que renoboostia.fr n'est pas joignable
  // depuis le banc d'essai (et ne DOIT pas l'être : ce harnais exige zéro
  // requête externe). L'instrument mesurait donc la connectivité du réseau, pas
  // la promesse du produit.
  // Un espion sur `window.open` mesure exactement ce qui compte : l'adresse
  // demandée et les options passées avec.
  await page.evaluate(() => {
    window.__ouvertures = [];
    const vrai = window.open;
    window.open = (url, cible, options) => {
      window.__ouvertures.push({ url, cible, options });
      return null; // on n'ouvre rien : le harnais éprouve l'intention, pas le web
    };
    window.__vraiOpen = vrai;
  });
  await page.locator('g.ciel-etoile[data-noeud-id="renoboost-ia"] .ciel-zone')
    .dispatchEvent('click');
  await page.waitForTimeout(250);
  const ouvertures = await page.evaluate(() => window.__ouvertures);
  verifier('Cliquer RENOBOOST IA demande un NOUVEL onglet', ouvertures.length === 1,
    JSON.stringify(ouvertures));
  verifier('Le nouvel onglet pointe vers renoboostia.fr',
    !!ouvertures[0] && String(ouvertures[0].url).startsWith('https://www.renoboostia.fr'),
    JSON.stringify(ouvertures[0]));
  verifier('Nouvel onglet demandé en _blank',
    !!ouvertures[0] && ouvertures[0].cible === '_blank');
  // `noopener` testé PAR SA PRÉSENCE dans les options passées : sans lui, la page
  // ouverte pourrait manipuler Ultima par `window.opener`.
  verifier('Nouvel onglet en noopener,noreferrer',
    !!ouvertures[0] && /noopener/.test(String(ouvertures[0].options || ''))
      && /noreferrer/.test(String(ouvertures[0].options || '')),
    String(ouvertures[0] && ouvertures[0].options));
  // Et la page d'origine n'a pas bougé : un cap externe ne fait pas quitter Ultima.
  verifier('ALPHA reste ouverte derrière (le cap externe ne fait pas quitter)',
    page.url().endsWith('alpha.html'), page.url());
}

// L'ÉTOILE D'ATTENTE : « à venir » — non-lien, aria-disabled, mais atteignable
// au clavier. Ces garanties étaient écrites sur YCOME, retiré le 28/09 ; elles
// sont REPORTÉES sur DOKLĚS (SYMPHO en témoin), jamais supprimées avec lui —
// sinon une étoile sans page pourrait redevenir cliquable sans qu'un test rougisse.
const attente = page.locator('g.ciel-etoile[data-noeud-id="dokles"]');
verifier('Verrou : l\'étoile DOKLĚS est rendue', (await attente.count()) === 1);
verifier('YCOME retiré : aucune étoile ycome sur ALPHA',
  (await page.locator('g.ciel-etoile[data-noeud-id="ycome"]').count()) === 0);
verifier('DOKLĚS inerte (pas une ancre)',
  (await attente.evaluate((e) => e.tagName.toLowerCase())) !== 'a');
verifier('DOKLĚS aria-disabled', (await attente.getAttribute('aria-disabled')) === 'true');
verifier('SYMPHO aria-disabled (témoin)',
  (await page.locator('g.ciel-etoile[data-noeud-id="sympho"]').getAttribute('aria-disabled')) === 'true');
// « 1 seul cap à venir » se lisait sur `.cap--avenir`, une classe de STYLE. Au
// ciel, l'état se lit sur `aria-disabled`, ce qui est la source de vérité pour
// qui n'y voit pas — donc un meilleur endroit pour le mesurer.
const aVenir = capsDe('alpha').filter((c) => !c.cible).length;
verifier(`${aVenir} caps « à venir » (ceux sans page au registre)`, aVenir >= 1 && caps.filter((c) => c.avenir).length === aVenir,
  `${caps.filter((c) => c.avenir).length} lus`);
// ET IL NE NAVIGUE PAS : la promesse d'inertie, éprouvée AU CLAVIER.
{
  const avant = page.url();
  await attente.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  verifier('DOKLĚS : Entrée ne navigue pas (le cap reste inerte)', page.url() === avant);
}

// Le cœur gravé + sa légende + les aiguilles.
// Le cœur descend en SCEAU dans l'angle (au centre, il disputait la place aux
// étoiles — vu sur capture le 2026-08-13). Le contrôle reste : la gravure est là.
verifier('Cœur gravé (en sceau dans l\'angle)',
  (await page.locator('.ciel-filigrane svg').count()) === 1);
const legende = (await page.locator('.ciel-legende').textContent())?.trim();
verifier('Légende gravée = celle du registre', legende === NOEUDS.alpha.legende, `lu: ${legende}`);
// « 2 aiguilles » ABANDONNÉE : un ciel n'a pas de moyeu d'où partir. Remplacée
// par le contrôle qu'elle approchait.
verifier(`${attendus.length} étoiles (ce que les aiguilles approchaient)`,
  (await page.locator('g.ciel-etoile[data-noeud-id]').count()) === attendus.length);

// Retour vers la racine.
verifier('Retour vers la boussole racine',
  (await page.locator('.console-retour a[href="/"]').count()) === 1);

// La parole de Léo : rien d'affiché au repos, le cartouche ne se matérialise
// qu'au survol (fonctions conservées, messages retirés — Paul, 2026-08-01).
await survoler(page, 'renoboost-ia');
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
const paroleReno = (await page.locator('#boussole-parole').textContent()) || '';
verifier('Survol RENOBOOST IA : nom + résumé', /RENOBOOST IA/.test(paroleReno) && /socle rémunérateur/i.test(paroleReno),
  `lu: ${paroleReno.slice(0, 120)}`);
verifier('Survol : le cartouche se matérialise (visible)',
  await page.locator('#boussole-parole').evaluate((el) => getComputedStyle(el).visibility === 'visible'));
verifier('Survol RENOBOOST IA : action « nouvel onglet »', /nouvel onglet/i.test(paroleReno), `lu: ${paroleReno}`);
// REMPLACÉE : « l'aiguille s'illumine au survol » devient « le halo de l'étoile
// s'allume ». Même intention — le survol doit se VOIR sur l'objet visé — sur le
// support qui existe. Mesuré sur l'opacité calculée, pas sur une classe.
{
  // LE SIGNAL SE MESURE SUR LE FOCUS, PAS SUR LE SURVOL — correction d'instrument.
  // Mesuré le 2026-08-17 : l'opacité du halo lue après un `hover()` valait 0,146
  // ici et 0 sur IMLADRIK, pour un `:hover` pourtant ACTIF dans les deux cas. Le
  // halo a une transition de 120 ms, et surtout LA SCÈNE GLISSE SOUS LE CURSEUR
  // IMMOBILE (la caméra approche de façon asymptotique) : le survol s'active et
  // se désactive au fil du mouvement, si bien que la valeur lue dépend de
  // l'instant du déclic. **Cette assertion passait par chance de timing : un
  // faux vert.** Le FOCUS est stable — il ne dépend d'aucune position de souris —
  // et il porte la garantie qui compte le plus : qui navigue au clavier doit VOIR
  // où il est. La même règle CSS allume le halo dans les deux cas.
  await page.locator('g.ciel-etoile[data-noeud-id="renoboost-ia"]').focus();
  await page.waitForTimeout(300);
  const op = await page.locator('g.ciel-etoile[data-noeud-id="renoboost-ia"] .ciel-halo-focus')
    .evaluate((el) => +getComputedStyle(el).opacity);
  verifier('Halo allumé sur l\'objet visé (mesuré au focus, stable)', op >= 0.5,
    `opacité ${op}`);
}

// Clavier = souris : le focus d'un cap « à venir » parle aussi.
// LA SOURIS SORT DU CIEL AVANT DE TESTER LE CLAVIER. Sans cela, elle reste
// posée sur le cap précédent, son survol continue de parler, et l'on croit lire
// la parole du cap focalisé alors qu'on lit celle du cap survolé. Le harnais
// l'avait dit : « Focus YCOME » retournait le texte de RENOBOOST IA (le cap
// d'attente d'alors ; DOKLĚS a pris sa place le 28/09).
await page.mouse.move(4, 4);
await page.waitForTimeout(250);
await attente.focus();
// ÉVÉNEMENT DÉCLENCHÉ DIRECTEMENT, comme partout ailleurs sur ce moteur : la
// caméra ne se pose jamais tout à fait et l'état du survol précédent peut encore
// se défaire pendant qu'on mesure. Vérifié en isolation : `focus()` seul suffit
// sur une page fraîche (parole « <cap> · À venir »), mais l'enchaînement
// survol → clic → focus laissait la course ouverte. Un harnais ne doit pas
// dépendre de qui gagne.
await attente.dispatchEvent('focus');
await page.waitForSelector('#boussole-parole.is-actif', { timeout: 5000 });
await page.waitForTimeout(200);
const paroleAttente = (await page.locator('#boussole-parole').textContent()) || '';
// SA propre parole, pas celle du cap survolé avant : le nom ET sa phrase.
verifier('Focus DOKLĚS : le cap parle de lui', /DOKLĚS/.test(paroleAttente) && /ECL by DOKLES/.test(paroleAttente)
  && !/RENOBOOST/.test(paroleAttente), `lu: ${paroleAttente.slice(0, 120)}`);
verifier('Focus DOKLĚS : « cap en préparation »', /préparation/i.test(paroleAttente), `lu: ${paroleAttente}`);

// Repli sans JS.
verifier('Repli <noscript> présent', (await page.locator('noscript').count()) >= 1);

// CONTRASTES REMPLACÉS — LE SUPPORT A CHANGÉ. Les noms ne se lisent plus sur le
// parchemin d'une rose mais sur la NUIT du ciel, et le titre sur le voile de son
// cartouche. Le premier jet de cette reprise a d'ailleurs planté ici
// (`getComputedStyle` sur `.cap-nom`, qui n'existe plus) : mieux vaut un
// instrument qui tombe qu'un instrument qui mesure une encre contre un fond
// qui n'est plus derrière elle.
const styles = await page.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('.ciel-noeud-coque'));
  return {
    nuit: cs.getPropertyValue('--ciel-nuit-basse').trim() || '#03070e',
    nom: document.querySelector('text.ciel-nom').getAttribute('fill'),
    titre: getComputedStyle(document.querySelector('.console-titre')).color,
    voile: getComputedStyle(document.querySelector('.console-entete')).backgroundColor,
    legende: getComputedStyle(document.querySelector('.ciel-legende')).color
  };
});
const rNom = ratio(styles.nom, styles.nuit);
verifier('Contraste nom d\'étoile sur la nuit ≥ 4,5:1', rNom >= 4.5, `${rNom.toFixed(2)}:1`);
const rTitre = ratio(versHex(styles.titre), versHex(styles.voile));
verifier('Contraste titre sur son voile ≥ 4,5:1', rTitre >= 4.5, `${rTitre.toFixed(2)}:1`);
const rLeg = ratio(versHex(styles.legende), styles.nuit);
verifier('Contraste légende sur la nuit ≥ 4,5:1', rLeg >= 4.5, `${rLeg.toFixed(2)}:1`);

// ALPHA ne porte aucune donnée : rien ne sort de la page.
verifier('Aucun appel /api (coque sans donnée)', appelsApi.length === 0, appelsApi.slice(0, 3).join(', '));
verifier('Zéro requête externe (aucun CDN)', externes.length === 0, externes.slice(0, 3).join(', '));
verifier('Zéro erreur console', erreurs.length === 0, erreurs.slice(0, 3).join(' | '));

await navigateur.close();
console.log(echecs === 0 ? '\n=== SMOKE ALPHA VERT ===' : `\n=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
