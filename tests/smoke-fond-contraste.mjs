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

// Les pages embarquées, avec le registre qu'elles DÉCLARENT. Le harnais vérifie
// que la déclaration est bien celle attendue : une page qui bascule de registre
// sans qu'on l'ait voulu est un changement d'ergonomie silencieux.
const CIBLES = [
  // ② ATELIER — on saisit, on relie, on écrit. Cartouches posés sur la nuit.
  { page: 'vranesh.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'draukhain.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'maedrethnir.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'registre.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'reshiram.html', registre: 'atelier', largeurs: [1280, 390] },
  { page: 'zekrom.html', registre: 'atelier', largeurs: [1280, 390] },
  // `ecrire.html` est la CAPTURE : « une seule chose à l'écran », décidé par Paul
  // le 2026-08-01. Sans session elle n'affiche qu'un état d'ouverture — un seul
  // texte, et c'est voulu. Le minimum est donc DÉCLARÉ ICI plutôt que le seuil
  // global abaissé : baisser le seuil pour une page le rendrait aveugle sur les
  // huit autres, où « presque rien à mesurer » signifierait vraiment une panne.
  { page: 'ecrire.html', registre: 'atelier', largeurs: [1280, 390], minTextes: 1 },
  { page: 'idees.html', registre: 'atelier', largeurs: [1280, 390] },
  // ③ INSTRUMENT — on lit des chiffres. Le parchemin domine, la nuit borde.
  { page: 'abaque.html', registre: 'instrument', largeurs: [1280, 390] },
  // ALTHEA (P6) : instrument aussi (rangs, jauges), mais son support n'est pas
  // le parchemin — exception actée « l'antique vu de nuit » : ses blocs de nuit
  // opaques portent les chiffres (css/althea.css). Sans session, la page montre
  // ses libellés statiques et ses états vides — assez de texte pour mesurer.
  { page: 'althea.html', registre: 'instrument', largeurs: [1280, 390], nappe: '.althea-bloc' },
  { page: 'althea-cadran.html', registre: 'instrument', largeurs: [1280, 390], minTextes: 2, nappe: '.althea-bloc' }
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
  // DENSITÉ DOUBLÉE, ET C'EST UNE CORRECTION PAYÉE PAR UN DÉFAUT MANQUÉ.
  // À `deviceScaleFactor: 1`, un petit texte fin en petites capitales n'a AUCUN
  // pixel pleinement opaque : tout son tracé est du lissage. Le filtre « coeur
  // de lettre » l'écartait donc en silence, dans les deux passes — et le
  // surtitre d'`idees.html` (4,30:1 pour un seuil de 4,5) a traversé le harnais
  // sans être vu. À 2, le même glyphe reçoit quatre fois plus de pixels et
  // retrouve un coeur. *Le texte le plus fin est le plus à risque : c'est
  // exactement celui qu'un instrument ne doit pas avoir le droit de sauter.*
  const DPR = 2;
  const page = await browser.newPage({ viewport: { width: largeur, height: 900 }, deviceScaleFactor: DPR });
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
  const couche = await page.evaluate((selNappe) => ({
    canvas: !!document.querySelector('canvas.ciel-fond-page'),
    registre: document.body.getAttribute('data-fond-etoile'),
    // Le support du registre instrument : il doit être OPAQUE, sinon les
    // chiffres se lisent sur les étoiles. Le sélecteur par défaut présume le
    // parchemin (`.feuille`, `main`) ; une page dont le support est AUTRE
    // le déclare dans sa cible (`nappe`) — ALTHEA porte ses chiffres sur ses
    // propres blocs de nuit (« l'antique vu de nuit », exception actée).
    // TOUS les supports trouvés doivent être opaques, pas seulement le
    // premier : un seul bloc transparent suffit à poser un rang sur les
    // étoiles, et un contrôle qui s'arrête au premier ne l'aurait jamais vu.
    nappeOpaque: ((sel) => {
      const ns = [...document.querySelectorAll(sel)];
      if (!ns.length) { return null; }
      return ns.every((n) => {
        const bg = getComputedStyle(n).backgroundColor;
        const m = /rgba?\([^)]*?(?:,\s*([\d.]+))?\)$/.exec(bg);
        return bg !== 'rgba(0, 0, 0, 0)' && (!m || !m[1] || +m[1] > 0.98);
      });
    })(selNappe)
  }), cible.nappe || '.feuille, main.quadrant-page, main');

  const avant = (await page.screenshot()).toString('base64');
  await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important;}' });
  await page.waitForTimeout(220);
  const apres = (await page.screenshot()).toString('base64');
  await page.close();

  const resultats = await juge.evaluate(async ([b1, b2, liste, dpr]) => {
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
      // Les boîtes sont en pixels CSS, l'image en pixels physiques.
      const y0 = t.y * dpr, y1 = (t.y + t.h) * dpr, x0 = t.x * dpr, x1 = (t.x + t.w) * dpr;
      for (let y = Math.max(0, y0); y < Math.min(y1, A.h); y++) {
        for (let x = Math.max(0, x0); x < Math.min(x1, A.w); x++) {
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
      // Le seuil AA dépend de la taille : 3:1 pour le grand texte, 4,5:1 sinon.
      const grand = t.taille >= 24 || (t.taille >= 18.66 && +t.gras >= 700);
      // Sans coeur de lettre, le texte est RENDU (ratio null) au lieu d'être
      // sauté : un texte non mesurable doit se voir dans le rapport, sinon
      // l'angle mort de l'instrument devient un silence rassurant.
      out.push({ cle: t.cle, texte: t.texte, couleur: t.couleur, fond, taille: t.taille,
        ratio: coeurs ? Math.round(pire * 100) / 100 : null, seuil: grand ? 3 : 4.5 });
    }
    return out.sort((a, b) => (a.ratio === null ? 999 : a.ratio) - (b.ratio === null ? 999 : b.ratio));
  }, [avant, apres, textes, DPR]);

  return { resultats, couche };
}

for (const cible of CIBLES) {
  for (const largeur of cible.largeurs) {
    const nom = cible.page.replace('.html', '') + '_' + largeur;
    const avec = await mesurer(cible, largeur, true);
    const sans = await mesurer(cible, largeur, false);

    const mesurables = (l) => l.filter((r) => r.ratio !== null);
    const echecsAvec = mesurables(avec.resultats).filter((r) => r.ratio < r.seuil);
    const echecsSans = mesurables(sans.resultats).filter((r) => r.ratio < r.seuil);
    const muets = avec.resultats.filter((r) => r.ratio === null);
    const dejaLa = new Set(echecsSans.map((r) => r.cle));
    // Le coeur du verdict : un échec NOUVEAU est un échec causé par le fond.
    const nouveaux = echecsAvec.filter((r) => !dejaLa.has(r.cle));

    chiffres[nom] = {
      textesMesures: mesurables(avec.resultats).length,
      nonMesurables: muets.map((r) => r.texte),
      echecsAvecLeFond: echecsAvec.length,
      echecsSansLeFond: echecsSans.length,
      pireRatio: mesurables(avec.resultats).length ? mesurables(avec.resultats)[0].ratio : null,
      heritesRappeles: echecsAvec.filter((r) => dejaLa.has(r.cle)).map((r) => r.ratio + ':1 ' + r.texte),
      nouveaux: nouveaux.map((r) => r.ratio + ':1 « ' + r.texte + ' » ' + r.couleur + ' sur rgb(' + r.fond + ')')
    };

    verdicts['leFondNIntroduitAucunDefaut_' + nom] = nouveaux.length === 0;
    // Une page dont on ne mesure rien passerait tous les tests : on exige que
    // l'instrument ait bien trouvé du texte à mesurer. Le minimum vaut 5 par
    // défaut, et se déclare page par page quand la page est sobre par dessein.
    verdicts['ilYAvaitDuTexteAMesurer_' + nom] = mesurables(avec.resultats).length >= (cible.minTextes || 5);
    // L'ANGLE MORT EST BORNÉ. Un texte sans coeur de lettre échappe à la mesure ;
    // en laisser passer un ou deux est le prix du lissage, en laisser passer la
    // moitié voudrait dire que le harnais ne regarde plus la page.
    verdicts['peuDeTexteEchappeALaMesure_' + nom] = muets.length <= Math.max(2, Math.round(avec.resultats.length * 0.15));
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
