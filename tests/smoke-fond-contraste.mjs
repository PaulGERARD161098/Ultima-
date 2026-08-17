// LE SOL COMMUN — LE CONTRASTE DES PAGES EMBARQUÉES (étape P5a de
// CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md).
//
// CE QUE CE HARNAIS EXISTE POUR EMPÊCHER. Poser un fond de nuit sous une page
// conçue pour du parchemin, c'est changer le fond de CHAQUE mot de la page. Le
// risque n'est pas esthétique, il est fonctionnel : un libellé de champ en
// crème sur un parchemin clair est un libellé qu'on ne lit plus. C'est arrivé,
// mesuré, sur l'abaque — six libellés à 1,10:1 et un chapeau à 1,38:1 — et
// c'est ce qui a fait livrer P5a inerte une première fois.
//
// COMMENT IL MESURE, et c'est là que tient sa fiabilité. On ne compare PAS la
// couleur d'un texte au jeton CSS supposé être derrière lui : un jeton dit ce
// que le fond DEVRAIT être, et sur un ciel étoilé il se trompe d'un pixel à
// l'autre. On peint donc la page DEUX FOIS — normale, puis tout le texte rendu
// transparent — et la différence des deux images donne LE MASQUE DES LETTRES.
// Le contraste est alors mesuré au pixel, sous les lettres elles-mêmes.
//
//   Premier instrument écrit, et rejeté : il cherchait le pire pixel de la
//   BOÎTE de l'élément. Il accusait des bordures, des liserés et des ornements
//   qu'aucune lettre ne touche jamais — 5 faux échecs sur 7 textes de VRANESH,
//   dont un titre parfaitement lisible à l'écran. Un instrument qui condamne du
//   lisible ne mesure pas le contraste : il mesure la présence de décor.
//   On ne garde que les COEURS de lettre (pixel peint = couleur du texte à 14
//   près) : les bords sont lissés, et un bord lissé a une couleur que le
//   lecteur ne voit nulle part.
//
// LE VERDICT EST DIFFÉRENTIEL, et c'est le seul honnête ici. Ces pages portent
// des défauts de contraste ANTÉRIEURS au fond étoilé — quatre textes en
// `--encre-pale` sur parchemin à 4,29:1, qui ne viennent pas de ce travail et
// ne se corrigent pas en changeant un jeton global au milieu d'une boucle front.
// Exiger zéro échec absolu obligerait donc à élargir la boucle ou à truquer le
// seuil. On exige ce qui est réellement de notre ressort :
//
//     AUCUN TEXTE NE DOIT ÉCHOUER À CAUSE DU FOND ÉTOILÉ.
//
// Concrètement : chaque page est mesurée AVEC le fond et SANS (attribut retiré,
// même page, même instrument), et l'ensemble des textes en échec avec le fond
// doit être INCLUS dans celui des textes déjà en échec sans lui. Un défaut
// nouveau est rouge ; un défaut hérité est compté et affiché, jamais masqué.
//
// IL A ÉTÉ PROUVÉ QU'IL SAIT ROUGIR. Un harnais vert ne vaut rien tant qu'on
// n'a pas vu ce qui le fait rougir. La règle énumérée fautive a donc été
// réinjectée exprès dans la feuille : le harnais est passé ROUGE et a nommé les
// six textes cassés un par un — « ← Ultima », « Statut juridique »,
// « Trésorerie initiale », « Horizon », « CA mensuel prévisionnel »,
// « Marge brute cible », tous à 1,10:1. La sonde a ensuite été retirée.
import { chromium } from 'playwright';

const CIBLES = [
  { page: 'vranesh.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'abaque.html', registre: 'instrument', largeurs: [1280, 390] }
];

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};

// La page de calcul : c'est Chromium qui décode sa propre capture (canvas 2D).
// Aucune dépendance de décodage PNG à installer, et c'est le même moteur qui a
// peint l'image que celui qui la relit.
const juge = await browser.newPage();

async function mesurer(cible, largeur, avecFond) {
  const page = await browser.newPage({ viewport: { width: largeur, height: 900 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' && avecFond) { erreurs.push(cible.page + ' — ' + m.text()); } });
  await page.goto('http://127.0.0.1:8123/' + cible.page, { waitUntil: 'load' });
  if (!avecFond) { await page.evaluate(() => document.body.removeAttribute('data-fond-etoile')); }
  await page.waitForTimeout(800);

  const textes = await page.evaluate(() => {
    const out = [];
    const sel = 'h1,h2,h3,h4,p,li,label,small,a,button,th,td,span,strong,em,legend,summary,figcaption';
    document.querySelectorAll(sel).forEach((el, i) => {
      let propre = '';
      el.childNodes.forEach((n) => { if (n.nodeType === 3) { propre += n.textContent; } });
      if (!propre.trim()) { return; }
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) { return; }
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) { return; }
      out.push({
        cle: (el.id || el.className || el.tagName) + '|' + propre.trim().slice(0, 30).replace(/\s+/g, ' '),
        texte: propre.trim().slice(0, 38).replace(/\s+/g, ' '),
        couleur: cs.color, taille: parseFloat(cs.fontSize), gras: cs.fontWeight,
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)
      });
    });
    return out;
  });

  // L'état de la couche, relevé pendant qu'on y est : un fond qui n'est pas
  // monté rendrait le contraste trivialement bon, et une mesure qui réussit
  // parce que rien n'a été fait est le pire des faux verts (leçon du
  // `<script>` manquant sur ultima.html, 2026-08-16).
  const couche = await page.evaluate(() => ({
    canvas: !!document.querySelector('canvas.ciel-fond-page'),
    registre: document.body.getAttribute('data-fond-etoile'),
    // La nappe du registre instrument : elle doit être OPAQUE, sinon les
    // chiffres se lisent sur les étoiles.
    nappeOpaque: (() => {
      const n = document.querySelector('.feuille, main.quadrant-page, main');
      if (!n) { return null; }
      const bg = getComputedStyle(n).backgroundColor;
      const m = /rgba?\([^)]*?(?:,\s*([\d.]+))?\)$/.exec(bg);
      return bg !== 'rgba(0, 0, 0, 0)' && (!m || !m[1] || +m[1] > 0.98);
    })()
  }));

  const avant = (await page.screenshot()).toString('base64');
  await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important;}' });
  await page.waitForTimeout(220);
  const apres = (await page.screenshot()).toString('base64');
  await page.close();

  const resultats = await juge.evaluate(async ([b1, b2, liste]) => {
    async function pixels(b64) {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return { d: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
    }
    const A = await pixels(b1), F = await pixels(b2);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (r, g, bl) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
    const rap = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const out = [];
    for (const t of liste) {
      const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(t.couleur);
      if (!m) { continue; }
      const tr = +m[1], tg = +m[2], tb = +m[3];
      const lt = lum(tr, tg, tb);
      let pire = Infinity, fond = null, coeurs = 0;
      for (let y = Math.max(0, t.y); y < Math.min(t.y + t.h, A.h); y++) {
        for (let x = Math.max(0, t.x); x < Math.min(t.x + t.w, A.w); x++) {
          const i = (A.w * y + x) << 2;
          // Le pixel a-t-il bougé quand le texte a disparu ? Sinon, aucune
          // lettre ne l'occupe : il ne dit rien du contraste de ce texte.
          if (Math.max(Math.abs(A.d[i] - F.d[i]), Math.abs(A.d[i + 1] - F.d[i + 1]), Math.abs(A.d[i + 2] - F.d[i + 2])) < 24) { continue; }
          // Coeur de lettre seulement (voir l'en-tête) : les bords sont lissés.
          if (Math.abs(A.d[i] - tr) > 14 || Math.abs(A.d[i + 1] - tg) > 14 || Math.abs(A.d[i + 2] - tb) > 14) { continue; }
          coeurs++;
          const r = rap(lt, lum(F.d[i], F.d[i + 1], F.d[i + 2]));
          if (r < pire) { pire = r; fond = [F.d[i], F.d[i + 1], F.d[i + 2]]; }
        }
      }
      if (!coeurs) { continue; }
      // Le seuil AA dépend de la taille : 3:1 pour le grand texte, 4,5:1 sinon.
      const grand = t.taille >= 24 || (t.taille >= 18.66 && +t.gras >= 700);
      out.push({ cle: t.cle, texte: t.texte, couleur: t.couleur, fond, taille: t.taille, ratio: Math.round(pire * 100) / 100, seuil: grand ? 3 : 4.5 });
    }
    return out.sort((a, b) => a.ratio - b.ratio);
  }, [avant, apres, textes]);

  return { resultats, couche };
}

for (const cible of CIBLES) {
  for (const largeur of cible.largeurs) {
    const nom = cible.page.replace('.html', '') + '_' + largeur;
    const avec = await mesurer(cible, largeur, true);
    const sans = await mesurer(cible, largeur, false);

    const echecsAvec = avec.resultats.filter((r) => r.ratio < r.seuil);
    const echecsSans = sans.resultats.filter((r) => r.ratio < r.seuil);
    const dejaLa = new Set(echecsSans.map((r) => r.cle));
    // Le coeur du verdict : un échec NOUVEAU est un échec causé par le fond.
    const nouveaux = echecsAvec.filter((r) => !dejaLa.has(r.cle));

    chiffres[nom] = {
      textesMesures: avec.resultats.length,
      echecsAvecLeFond: echecsAvec.length,
      echecsSansLeFond: echecsSans.length,
      pireRatio: avec.resultats.length ? avec.resultats[0].ratio : null,
      heritesRappeles: echecsAvec.filter((r) => dejaLa.has(r.cle)).map((r) => r.ratio + ':1 ' + r.texte),
      nouveaux: nouveaux.map((r) => r.ratio + ':1 « ' + r.texte + ' » ' + r.couleur + ' sur rgb(' + r.fond + ')')
    };

    verdicts['leFondNIntroduitAucunDefaut_' + nom] = nouveaux.length === 0;
    // Une page dont on ne mesure rien passerait tous les tests : on exige que
    // l'instrument ait bien trouvé du texte à mesurer.
    verdicts['ilYAvaitDuTexteAMesurer_' + nom] = avec.resultats.length >= 5;
    // La couche est-elle réellement là ? Sans cette exigence, un `<script>`
    // oublié rendrait le harnais vert pour la pire des raisons.
    verdicts['laCoucheEstMontee_' + nom] = avec.couche.canvas === true;
    verdicts['leRegistreEstDeclare_' + nom] = avec.couche.registre === cible.registre;
    if (cible.registre === 'instrument') {
      verdicts['laNappeEstOpaque_' + nom] = avec.couche.nappeOpaque === true;
    }
  }
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE FOND-CONTRASTE VERT' : 'SMOKE FOND-CONTRASTE ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
