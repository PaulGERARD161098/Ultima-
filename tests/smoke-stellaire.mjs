// LE THÈME STELLAIRE de RIVEN — mesuré, jamais regardé (2026-08-13).
//
// Critères ① et ② du cadrage CADRAGE-RIVEN-STELLAIRE.md :
//   ① aucun jeton parchemin ne survit — TOUT fond rencontré a une luminance
//      < 0,20, sur les trois espaces PLUS la fiche, le formulaire et un toast
//      ouverts. Un mix ne se voit pas sur l'écran d'accueil : il se voit au
//      premier clic, et c'est là qu'on le cherche ;
//   ② tout couple texte/fond atteint le seuil WCAG AA (4,5:1 ; 3:1 au-delà de
//      24 px, ou 19 px en gras).
//
// La routine de mesure (fond effectif par superposition alpha, pire cas
// construit sur les dégradés) vient de la maquette
// `design/preview-riven-stellaire.js`, écrite pour migrer ici. Elle n'était
// pas jetable, elle a changé de sujet : la maquette, puis la vraie page.
//
// « Ça a l'air bien » n'est pas un critère de réussite : c'est l'absence de
// critère (leçon du 2026-08-01).
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};

// Le pire cas d'un dégradé, c'est sa teinte la plus CLAIRE : c'est là que le
// texte crème a le moins de contraste. On la construit, on ne l'espère pas.
const FONDS_DEGRADE = [
  { selecteur: '.ciel-scene', couleur: [14, 27, 47] },
  { selecteur: 'body', couleur: [14, 26, 46] },
];

const ROUTINE = (fondsDegrade) => {
  const versRGBA = (t) => {
    const m = /rgba?\(([^)]+)\)/.exec(t || '');
    if (!m) return null;
    const n = m[1].split(',').map(Number);
    return { r: n[0], v: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  };
  const superposer = (bas, haut) => ({
    r: haut.a * haut.r + (1 - haut.a) * bas.r,
    v: haut.a * haut.v + (1 - haut.a) * bas.v,
    b: haut.a * haut.b + (1 - haut.a) * bas.b,
    a: 1,
  });
  const fondEffectif = (el) => {
    const couches = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const st = getComputedStyle(n);
      const f = versRGBA(st.backgroundColor);
      if (f && f.a > 0) couches.push(f);
      if (/gradient/.test(st.backgroundImage)) {
        // Un dégradé n'a pas de `backgroundColor` lisible. Première version :
        // une liste blanche, et un fallback « c'est sombre » pour tout le
        // reste. C'était SUPPOSER le résultat qu'on prétend mesurer — et ça a
        // laissé passer le cartouche « ULTIMA », doré sur un parchemin clair,
        // déclaré conforme sur un fond de nuit imaginaire (vu à l'écran, pas
        // par l'instrument).
        // Désormais : on LIT les couleurs écrites dans le dégradé et on retient
        // la plus CLAIRE — le pire cas pour du texte crème. La liste ne sert
        // plus qu'aux dégradés faits de transparences (body, scène), où il n'y
        // a rien à lire.
        let trouve = null;
        for (const e of fondsDegrade) { if (!trouve && n.matches(e.selecteur)) trouve = e.couleur; }
        if (!trouve) {
          const lues = (st.backgroundImage.match(/rgba?\([^)]+\)/g) || [])
            .map(versRGBA).filter((c) => c && c.a > 0.5);
          if (lues.length) {
            const clair = lues.reduce((p, c) =>
              (0.2126 * c.r + 0.7152 * c.v + 0.0722 * c.b) >
              (0.2126 * p.r + 0.7152 * p.v + 0.0722 * p.b) ? c : p);
            trouve = [clair.r, clair.v, clair.b];
          }
        }
        const c = trouve || [10, 18, 32];
        couches.push({ r: c[0], v: c[1], b: c[2], a: 1 });
        break;
      }
      n = n.parentElement;
    }
    if (!couches.length) return { r: 10, v: 18, b: 32, a: 1 };
    let res = couches[couches.length - 1];
    for (let i = couches.length - 2; i >= 0; i--) res = superposer(res, couches[i]);
    return res;
  };
  const canal = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * canal(c.r) + 0.7152 * canal(c.v) + 0.0722 * canal(c.b);
  const contraste = (a, b) => {
    const la = lum(a); const lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  const hexa = (c) => '#' + [c.r, c.v, c.b].map((v) => ('0' + Math.round(v).toString(16)).slice(-2)).join('');

  const resultats = [];
  // TOUT texte réellement rendu, pas une liste choisie d'avance : un mix
  // oublié vit précisément dans l'élément auquel on n'a pas pensé.
  document.querySelectorAll('body *').forEach((el) => {
    if (!el.getClientRects().length) return;
    if (el.closest('svg')) return;                  // le ciel a sa propre géométrie
    const texte = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!texte.length) return;
    const st = getComputedStyle(el);
    let couleur = versRGBA(st.color);
    if (!couleur) return;
    const fond = fondEffectif(el);
    if (couleur.a < 1) couleur = superposer(fond, couleur);
    const taille = parseFloat(st.fontSize);
    const gras = parseInt(st.fontWeight, 10) >= 700;
    const exige = (taille >= 24 || (taille >= 18.66 && gras)) ? 3 : 4.5;
    resultats.push({
      ou: (el.id ? '#' + el.id : el.className && typeof el.className === 'string'
        ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase()),
      extrait: texte[0].textContent.trim().slice(0, 40),
      texte: hexa(couleur), fond: hexa(fond),
      ratio: contraste(couleur, fond), exige,
      conforme: contraste(couleur, fond) >= exige,
      luminanceFond: lum(fond),
    });
  });
  return resultats;
};

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, writable: false,
  });
});
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1200);

const toutes = [];
async function mesurer(etiquette) {
  const r = await page.evaluate(ROUTINE, FONDS_DEGRADE);
  r.forEach((m) => toutes.push({ ...m, etat: etiquette }));
}

// --- Les trois espaces ---
await mesurer('ciel');
await page.locator('.barre-onglets .onglet[data-onglet="accueil"]').click();
await page.waitForTimeout(400);
await mesurer('accueil');
await page.locator('.barre-onglets .onglet[data-onglet="contacts"]').click();
await page.waitForTimeout(400);
await mesurer('contacts');

// --- La fiche ouverte : c'est au premier clic qu'un mix se voit ---
await page.locator('.item-contact').first().click();
await page.waitForTimeout(400);
verdicts.ficheOuverte = await page.locator('#vue-fiche').isVisible();
await mesurer('fiche');

// --- Le formulaire ---
await page.locator('.actions-fiche button', { hasText: 'Modifier' }).click();
await page.waitForTimeout(400);
verdicts.formulaireOuvert = await page.locator('#form-noeud').isVisible();
await mesurer('formulaire');
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(300);

// --- L'ÉCRAN DE CONNEXION ---
// Il ne s'affiche pas en mode démo : il est donc RÉVÉLÉ pour être mesuré. Ce
// n'est pas un artifice — c'est le seul écran que ce harnais ne traversait
// pas, et c'est exactement là que le premier défaut de contraste a survécu à
// la première passe (trouvé par smoke-connexion, pas par moi).
await page.evaluate(() => {
  // L'écran ET son formulaire : le premier essai n'avait révélé que le second,
  // resté invisible sous un parent caché — le harnais l'a dit (`false`), pas
  // une relecture.
  const e = document.getElementById('ecran-connexion');
  const f = document.getElementById('form-connexion');
  if (e) { e.hidden = false; }
  if (f) { f.hidden = false; }
});
await page.waitForTimeout(300);
verdicts.connexionMesuree = await page.locator('#form-connexion').isVisible();
await mesurer('connexion');
await page.evaluate(() => {
  const e = document.getElementById('ecran-connexion');
  const f = document.getElementById('form-connexion');
  if (e) { e.hidden = true; }
  if (f) { f.hidden = true; }
});

// --- Un toast ---
await page.locator('.barre-onglets .onglet[data-onglet="contacts"]').click();
await page.waitForTimeout(300);
await page.evaluate(() => {
  const t = document.createElement('p');
  t.className = 'toast';
  t.textContent = 'Fiche enregistrée.';
  document.getElementById('toasts').appendChild(t);
});
await page.waitForTimeout(200);
await mesurer('toast');

// ---------- ① Aucun fond de parchemin ne survit ----------
const fondLePlusClair = toutes.reduce((max, m) => Math.max(max, m.luminanceFond), 0);
verdicts.aucunFondClair = fondLePlusClair < 0.2;

// ---------- ② Le contraste tient partout ----------
const defauts = toutes.filter((m) => !m.conforme);
verdicts.contrasteAAPartout = defauts.length === 0;
verdicts.mesuresSuffisantes = toutes.length >= 40; // une mesure vide serait verte pour rien

// ---------- La couche est bien la SEULE cause ----------
verdicts.stellaireCharge = await page.evaluate(() =>
  Array.from(document.styleSheets).some((f) => (f.href || '').endsWith('/css/stellaire.css')));
verdicts.aucunAttributConditionnel = await page.evaluate(() =>
  !document.body.hasAttribute('data-registre') && !document.body.hasAttribute('data-theme'));

// ---------- Les quatre règles de ciel.css suivent les jetons ----------
// Elles s'appuyaient sur `--encre-sepia` : redéfini par la couche, il les
// emmène sans qu'une seule ligne de ciel.css ait été touchée.
verdicts.cartoucheCielLisible = await page.evaluate(() => {
  const t = document.getElementById('ciel-titre');
  return !!t && getComputedStyle(t).color === 'rgb(242, 234, 214)';
});

// ---------- Stellar V2 : planche QA autonome ----------
// Pas de compte, pas d'API, pas de données personnelles : cette page existe
// précisément pour rendre la forme testable même quand la preview protégée
// n'est pas accessible à l'agent.
const qa = await browser.newPage({ viewport: { width: 390, height: 844 } });
const qaErreurs = [];
qa.on('pageerror', (e) => qaErreurs.push('pageerror: ' + e.message));
qa.on('console', (m) => { if (m.type() === 'error') qaErreurs.push('console: ' + m.text()); });
await qa.goto('http://127.0.0.1:8123/stellar-qa.html', { waitUntil: 'load', timeout: 20000 });
const qaMesure = await qa.evaluate(() => ({
  deborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  boutons: [...document.querySelectorAll('button')].map((b) => {
    const r = b.getBoundingClientRect(); return [r.width, r.height];
  }),
  instruments: document.querySelectorAll('.qa-instrument').length,
  liens: document.querySelectorAll('.qa-links a').length,
  tokenOr: getComputedStyle(document.documentElement).getPropertyValue('--stellar-accent-gold').trim(),
}));
verdicts.qaStellarSansErreur = qaErreurs.length === 0;
verdicts.qaStellarSansDebordement390 = !qaMesure.deborde;
verdicts.qaStellarDeuxInstruments = qaMesure.instruments === 2;
verdicts.qaStellarCibles44 = qaMesure.boutons.every(([w, h]) => w >= 44 && h >= 44);
verdicts.qaStellarTroisLiens = qaMesure.liens === 3;
verdicts.qaStellarTokensCharges = Boolean(qaMesure.tokenOr);
await qa.close();

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log(`couples mesurés : ${toutes.length} · défauts : ${defauts.length} · ` +
  `fond le plus clair : luminance ${fondLePlusClair.toFixed(4)} (plancher 0,20)`);
if (defauts.length) {
  // Groupés par SÉLECTEUR : vingt badges identiques sont UN défaut, pas vingt.
  // Une liste brute ferait croire à vingt corrections à écrire.
  const parSelecteur = new Map();
  defauts.forEach((d) => {
    const cle = d.ou + ' | ' + d.texte + ' sur ' + d.fond;
    const e = parSelecteur.get(cle) || { ...d, n: 0 };
    e.n += 1;
    parSelecteur.set(cle, e);
  });
  console.log(`DÉFAUTS — ${parSelecteur.size} distincts, ${defauts.length} occurrences :`);
  [...parSelecteur.values()].sort((a, b) => a.ratio - b.ratio).forEach((d) => console.log(
    `  ${d.ou} ×${d.n} [${d.etat}] « ${d.extrait} » — ${d.ratio.toFixed(2)}:1 ` +
    `(exigé ${d.exige}) — ${d.texte} sur ${d.fond}`));
}
// Le fond le plus clair : lequel, et où ? Un chiffre sans son porteur ne se
// corrige pas.
const pireFond = toutes.reduce((p, m) => (m.luminanceFond > p.luminanceFond ? m : p), toutes[0]);
if (fondLePlusClair >= 0.2) {
  console.log(`FOND LE PLUS CLAIR : ${pireFond.ou} [${pireFond.etat}] ` +
    `« ${pireFond.extrait} » — ${pireFond.fond} (luminance ${pireFond.luminanceFond.toFixed(4)})`);
}
if (erreurs.length) console.log('Erreurs :', erreurs.slice(0, 5));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE STELLAIRE VERT' : 'SMOKE STELLAIRE ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
