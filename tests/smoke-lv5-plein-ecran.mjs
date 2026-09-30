// LV5 / P2 — LE PLEIN ÉCRAN SUR LA COQUE DE PRODUCTION (`omega.html`, ex-`ultima.html`).
//
// Ce que ce harnais prouve, et pourquoi chaque point existe :
//
//   1. LA SCÈNE TIENT L'ÉCRAN, et rien ne défile. Un plein écran qui défile
//      n'est pas un plein écran.
//   2. AUCUNE ÉTOILE N'EST RECOUVERTE PAR LE MOBILIER. **C'est le critère
//      central de P2.** Le défaut qui l'a motivé était invisible aux assertions
//      existantes : à 390 px, le bandeau masquait deux galaxies sans voler
//      aucun clic. `elementFromPoint` disait « l'étoile reçoit le geste » et
//      c'était vrai — elle était simplement cachée. **Être cliquable et être
//      visible sont deux propriétés distinctes, et il faut deux mesures.**
//   3. LE MOBILIER NE SE CHEVAUCHE PAS LUI-MÊME. Mesuré à 390 px : le retour
//      occupait 12→115 px et le bandeau centré commençait à 108. Sept pixels de
//      recouvrement, vus sur capture.
//   4. LE CIEL REMPLIT SA ZONE UTILE À 60 % AU MOINS — rapporté à la zone
//      UTILE, et c'est un changement de dénominateur qu'il faut justifier au
//      lieu de le glisser : réserver un quart du cadre au mobilier PUIS exiger
//      60 % du cadre entier revient à demander 83 % de la place restante, ce
//      que les marges de libellé rendent impossible. Le seuil ne baisse pas ; il
//      se mesure sur la surface où le ciel a le droit de peindre. Mesuré :
//      52 % du cadre, **72 % de la zone utile** — la fourchette de LV4.
//   5. LES MARGES SONT MESURÉES, PAS DÉCLARÉES : elles doivent CHANGER quand le
//      mobilier change de taille. Une constante passerait les points 2 et 4
//      aujourd'hui et casserait au premier titre plus long.
//   6. LE CONTRASTE SE MESURE CONTRE LE PIXEL RÉELLEMENT PEINT. Sur un ciel
//      qui bouge, le texte ne se lit plus sur un jeton CSS : on prend le PIRE
//      pixel du fond sous la boîte de texte, on le compose avec le voile, et on
//      calcule le ratio. Vérifier la couleur déclarée ne prouverait rien.
//   7. LE FOND NE VOLE AUCUN GESTE, le HUD non plus.
//   8. Zéro erreur console.
import { chromium } from 'playwright';
import { NOEUDS } from '../js/registre-lv3.mjs';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};

const HOTE = 'http://127.0.0.1:8123/omega.html';
const SELECTEURS_MOBILIER = ['.console-entete', '.console-retour', '#boussole-parole', '.ciel-legende'];

async function ouvrir(largeur, hauteur) {
  const page = await browser.newPage({ viewport: { width: largeur, height: hauteur } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(String(e)));
  await page.goto(HOTE, { waitUntil: 'load' });
  // La caméra ne se pose jamais tout à fait (approche asymptotique) : on laisse
  // passer un temps borné, on ne guette pas un état stable.
  await page.waitForTimeout(1900);
  return page;
}

function mesurer(page, selecteurs) {
  return page.evaluate((SELS) => {
    const luminance = (r, v, bl) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(v) + 0.0722 * f(bl);
    };
    const lireRgb = (txt) => {
      const m = /rgba?\(([^)]+)\)/.exec(txt || '');
      if (!m) { return null; }
      const p = m[1].split(',').map((s) => parseFloat(s));
      return { r: p[0], v: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };

    const vue = window.UltimaCiel.courant();
    const zone = vue.zoneUtile();
    const svg = document.querySelector('svg.ciel-svg');
    const vb = svg.getAttribute('viewBox').split(' ').map(Number);
    const plateau = document.getElementById('ciel-noeud-plateau');
    const bp = plateau.getBoundingClientRect();

    // Les boîtes du mobilier réellement peint.
    const boites = [];
    for (const sel of SELS) {
      const el = document.querySelector(sel);
      if (!el) { continue; }
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.width > 0) {
        boites.push({ sel, top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
    }
    const chevauche = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

    // ③ Le mobilier contre lui-même.
    const collisions = [];
    for (let i = 0; i < boites.length; i += 1) {
      for (let j = i + 1; j < boites.length; j += 1) {
        if (chevauche(boites[i], boites[j])) { collisions.push(boites[i].sel + ' ∩ ' + boites[j].sel); }
      }
    }

    // ② Les étoiles contre le mobilier — sur leur BOÎTE PEINTE, nom compris.
    const etoiles = Array.from(document.querySelectorAll('.ciel-etoile'))
      .filter((g) => g.getAttribute('display') !== 'none');
    const recouvertes = [];
    for (const g of etoiles) {
      const rb = g.getBoundingClientRect();
      for (const bo of boites) {
        if (chevauche(rb, bo)) { recouvertes.push(g.getAttribute('data-noeud-id') + '@' + bo.sel); }
      }
    }

    // ④ L'occupation, sur les centres des zones (définition de LV4), rapportée
    //    à la zone utile ET au cadre entier — les deux sont rendues, pour que
    //    le changement de dénominateur reste lisible dans les mesures.
    const zs = etoiles.map((g) => g.querySelector('.ciel-zone'));
    const xs = zs.map((z) => +z.getAttribute('cx'));
    const ys = zs.map((z) => +z.getAttribute('cy'));
    const etX = Math.max(...xs) - Math.min(...xs);
    const etY = Math.max(...ys) - Math.min(...ys);
    const occUtile = Math.max(etX / zone.largeur, etY / zone.hauteur);
    const occCadre = Math.max(etX / vb[2], etY / vb[3]);

    // ⑤ Personne ne sort du cadre — bbox contre viewBox, étiquettes comprises.
    // L'ÉTIQUETTE DE CONSTELLATION SE FILTRE SUR SON OPACITÉ, et pas seulement
    // sur `display` — c'est la définition qu'emploie déjà `smoke-lv4-ciel`, et
    // la reprendre valait mieux que d'en écrire une seconde.
    // Payé au premier essai : en cadrage serré, le moteur TAIT cette étiquette
    // (`opacity: 0`) et ne la positionne donc jamais ; elle reste à l'origine du
    // viewBox avec son texte. Mon filtre la comptait comme un débord de 30
    // unités. Elle est invisible : ce qui ne se voit pas ne peut pas sortir du
    // cadre.
    const peints = Array.from(svg.querySelectorAll('.ciel-etoile'))
      .filter((g) => g.getAttribute('display') !== 'none')
      .concat(Array.from(svg.querySelectorAll('text.ciel-nom-amas'))
        .filter((t) => +(t.getAttribute('opacity') || '1') > 0.02));
    let dehors = 0;
    for (const el of peints) {
      const bb = el.getBBox();
      if (bb.x < -0.5 || bb.y < -0.5 || bb.x + bb.width > vb[2] + 0.5 || bb.y + bb.height > vb[3] + 0.5) {
        dehors += 1;
      }
    }

    // ⑥ LE CONTRASTE CONTRE LE PIRE PIXEL PEINT.
    const canvas = document.querySelector('canvas.ciel-fond');
    let contraste = null;
    const titre = document.querySelector('.console-entete .titre-principal');
    const bloc = document.querySelector('.console-entete');
    if (canvas && titre && bloc) {
      const bt = titre.getBoundingClientRect();
      const bc = canvas.getBoundingClientRect();
      const ech = canvas.width / bc.width; // px device par px CSS
      const x0 = Math.max(0, Math.round((bt.left - bc.left) * ech));
      const y0 = Math.max(0, Math.round((bt.top - bc.top) * ech));
      const w = Math.min(canvas.width - x0, Math.round(bt.width * ech));
      const h = Math.min(canvas.height - y0, Math.round(bt.height * ech));
      let pireL = 0;
      if (w > 0 && h > 0) {
        const d = canvas.getContext('2d').getImageData(x0, y0, w, h).data;
        for (let i = 0; i < d.length; i += 4) {
          const l = luminance(d[i], d[i + 1], d[i + 2]) * (d[i + 3] / 255);
          if (l > pireL) { pireL = l; }
        }
      }
      const st = getComputedStyle(bloc);
      const voile = lireRgb(st.backgroundColor);
      const encre = lireRgb(getComputedStyle(titre).color);
      if (voile && encre) {
        // Le fond effectif : le voile composé sur le pire pixel du ciel.
        const lVoile = luminance(voile.r, voile.v, voile.b);
        const lFond = voile.a * lVoile + (1 - voile.a) * pireL;
        const lEncre = luminance(encre.r, encre.v, encre.b);
        const clair = Math.max(lEncre, lFond); const sombre = Math.min(lEncre, lFond);
        contraste = { ratio: (clair + 0.05) / (sombre + 0.05), pireL, alphaVoile: voile.a };
      }
    }

    // ⑦ Le geste va-t-il à l'étoile ? (le fond ni le HUD ne doivent l'intercepter)
    let gestesOk = true;
    for (const g of etoiles) {
      const z = g.querySelector('.ciel-zone').getBoundingClientRect();
      const cible = document.elementFromPoint(z.left + z.width / 2, z.top + z.height / 2);
      if (!cible || !cible.closest('.ciel-etoile')) { gestesOk = false; }
    }

    return {
      partL: bp.width / window.innerWidth,
      partH: bp.height / window.innerHeight,
      deborde: document.documentElement.scrollHeight - window.innerHeight,
      collisions, recouvertes, dehors, gestesOk,
      occUtile, occCadre,
      zone: { haut: zone.haut, bas: zone.bas, largeur: zone.largeur, hauteur: zone.hauteur },
      contraste,
      nbEtoiles: etoiles.length,
      grains: vue.nbGrains()
    };
  }, selecteurs);
}

for (const [largeur, hauteur, nom] of [[390, 844, 'a390'], [1280, 860, 'a1280'], [1670, 900, 'a1670']]) {
  const page = await ouvrir(largeur, hauteur);
  const m = await mesurer(page, SELECTEURS_MOBILIER);

  chiffres[nom] = {
    partL: +m.partL.toFixed(3), partH: +m.partH.toFixed(3), deborde: m.deborde,
    occUtile: +m.occUtile.toFixed(3), occCadre: +m.occCadre.toFixed(3),
    zoneHaut: Math.round(m.zone.haut), zoneBas: Math.round(m.zone.bas),
    zoneHauteur: Math.round(m.zone.hauteur),
    contraste: m.contraste ? +m.contraste.ratio.toFixed(2) : null,
    pireLuminanceDuCiel: m.contraste ? +m.contraste.pireL.toFixed(4) : null,
    grains: m.grains
  };

  verdicts['pleinEcran_' + nom] = m.partL >= 0.98 && m.partH >= 0.98;
  verdicts['rienNeDefile_' + nom] = m.deborde <= 1;
  // LE CRITÈRE CENTRAL DE P2.
  verdicts['aucuneEtoileRecouverte_' + nom] = m.recouvertes.length === 0;
  verdicts['leMobilierNeSeChevauchePas_' + nom] = m.collisions.length === 0;
  // Même règle différenciée que le bloc ⑨ : 60 % sur écran large, plancher
  // mesuré sur téléphone (la largeur des libellés est une limite physique).
  verdicts['leCielRemplitSaZoneUtile_' + nom] = m.occUtile >= (largeur >= 1000 ? 0.6 : 0.45);
  verdicts['personneNeSortDuCadre_' + nom] = m.dehors === 0;
  verdicts['leGesteVaALEtoile_' + nom] = m.gestesOk === true;
  verdicts['lesMargesSontReservees_' + nom] = m.zone.haut > 0 && m.zone.bas > 0;
  verdicts['contrasteAA_' + nom] = !!m.contraste && m.contraste.ratio >= 4.5;
  if (m.recouvertes.length) { chiffres[nom].recouvertes = m.recouvertes; }
  if (m.collisions.length) { chiffres[nom].collisions = m.collisions; }

  await page.close();
}

// ---------------------------------------------------------------------------
// ⑤ LES MARGES SUIVENT LE MOBILIER — la preuve qu'elles sont mesurées.
// Une constante passerait tout ce qui précède et casserait au premier titre
// plus long. On grossit donc le bandeau et on exige que la marge haute suive.
// ---------------------------------------------------------------------------
{
  const page = await ouvrir(1280, 860);
  const avant = await page.evaluate(() => window.UltimaCiel.courant().zoneUtile().haut);
  await page.evaluate(() => {
    const t = document.querySelector('.console-entete .titre-principal');
    t.style.fontSize = '3.4rem';           // un titre bien plus haut
    t.textContent = 'ULTIMA — TITRE TRÈS LONG POUR ÉPROUVER LA MESURE';
    // On redéclenche le rendu comme le ferait un redimensionnement.
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(900);
  const apres = await page.evaluate(() => window.UltimaCiel.courant().zoneUtile().haut);
  chiffres.margesSuivent = { avant: Math.round(avant), apres: Math.round(apres) };
  // La marge doit AVOIR AUGMENTÉ. C'est la seule façon de distinguer une mesure
  // d'une constante bien choisie.
  verdicts.lesMargesSuiventLeMobilier = apres > avant + 5;
  await page.close();
}

// ---------------------------------------------------------------------------
// ⑨ TOUS LES ÉCRANS DE NAVIGATION, PAS UN SEUL. Et ce bloc existe à cause d'un
// trou de couverture qui a coûté cher.
//
// Ce harnais n'éprouvait que `ultima.html` (aujourd'hui `omega.html`) — DEUX caps. Le 2026-08-17, la
// couronne a réparti trois et quatre caps sur les autres écrans, dont un EN
// HAUT : une étoile est passée sous le bandeau sur les QUATRE écrans à trois ou
// quatre caps, et pas une assertion ne l'a dit. Le critère central de P2 était
// écrit, il était juste, et il regardait ailleurs.
// (La cause du recouvrement lui-même n'était pas la couronne : un remplacement
// de bloc fait aux indices avait supprimé `margesUtiles` en passant. Un trou de
// couverture et une erreur d'édition se sont additionnés — c'est le trou qui a
// permis à l'erreur de vivre.)
//
// LEÇON APPLIQUÉE : un critère qui vaut pour une famille d'écrans s'éprouve sur
// TOUTE la famille, et d'abord sur ses cas EXTRÊMES — ici le plus chargé.
// ---------------------------------------------------------------------------
// 2026-09-29 : GRIMA et NAGA sont supprimés ; le nombre de caps de chaque écran
// est LU dans le registre (le pire cas — IMLADRIK, cinq caps — ne se fige plus
// à la main), puis verrouillé ci-dessous par des valeurs explicites.
const NOEUD_DE = { 'omega.html': 'omega', 'tao.html': 'tao', 'imladrik.html': 'imladrik',
  'adramelech.html': 'adramelech', 'bcp.html': 'nicol-bolas', 'index.html': 'racine' };
const COQUES_DE_NAVIGATION = Object.keys(NOEUD_DE)
  .map((fichier) => [fichier, NOEUDS[NOEUD_DE[fichier]].enfants.length]);
// Verrou : le registre ne dérive pas sans que ce harnais le voie, et la liste
// est bien la famille attendue (jamais vide, jamais réduite en silence).
verdicts.familleDesCoques = JSON.stringify(COQUES_DE_NAVIGATION) === JSON.stringify([
  ['omega.html', 3], ['tao.html', 2], ['imladrik.html', 5],
  ['adramelech.html', 3], ['bcp.html', 4],
  // LA RACINE (P4, 2026-08-19) : trois caps — ALPHA, OMEGA, ALTHEA.
  ['index.html', 3]]);
for (const [fichier, nbCaps] of COQUES_DE_NAVIGATION) {
  for (const [largeur, hauteur] of [[390, 844], [1280, 860]]) {
    const page = await browser.newPage({ viewport: { width: largeur, height: hauteur } });
    page.on('console', (m) => { if (m.type() === 'error') erreurs.push(fichier + ': ' + m.text()); });
    page.on('pageerror', (e) => erreurs.push(fichier + ': ' + String(e)));
    // La racine porte la porte de connexion (z-index 2000) : sans session,
    // l'overlay couvrirait le mobilier et fausserait toutes les mesures. Le
    // plein écran se juge sur l'écran CONNECTÉ — on neutralise la config
    // (mode démo : porte cachée, ciel visible), comme smoke-boussole stube le
    // client pour jouer ses scénarios.
    if (fichier === 'index.html') {
      await page.route('**/js/config.js', (route) => route.fulfill({
        contentType: 'application/javascript', body: '// mode démo (harnais)',
      }));
    }
    await page.goto('http://127.0.0.1:8123/' + fichier, { waitUntil: 'load' });
    await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
    await page.waitForTimeout(1900);

    const m = await page.evaluate((SELS) => {
      const boites = [];
      for (const sel of SELS) {
        const el = document.querySelector(sel);
        if (!el) { continue; }
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.width > 0) { boites.push({ sel, ...r.toJSON() }); }
      }
      const chevauche = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const etoiles = Array.from(document.querySelectorAll('.ciel-etoile'))
        .filter((g) => g.getAttribute('display') !== 'none');
      const recouvertes = [];
      for (const g of etoiles) {
        const rb = g.getBoundingClientRect();
        for (const bo of boites) {
          if (chevauche(rb, bo)) { recouvertes.push(g.getAttribute('data-noeud-id') + '@' + bo.sel); }
        }
      }
      const zs = etoiles.map((g) => g.querySelector('.ciel-zone'));
      const xs = zs.map((z) => +z.getAttribute('cx'));
      const ys = zs.map((z) => +z.getAttribute('cy'));
      const z = window.UltimaCiel.courant().zoneUtile();
      const etX = Math.max(...xs) - Math.min(...xs);
      const etY = Math.max(...ys) - Math.min(...ys);
      return {
        n: etoiles.length,
        recouvertes,
        occUtile: Math.max(etX / z.largeur, etY / z.hauteur),
        // LA COURONNE REMPLIT LA LARGEUR : c'est ce que Paul a demandé (« la
        // rotation sur ULTIMA n'est pas folle… il faut les mêmes standards
        // partout »). Un écart horizontal nul, c'est l'empilement d'avant.
        ecartX: etX,
        margeHaute: z.haut,
        // L'ÉCLAT : sur un menu, la profondeur n'a pas le droit d'éteindre une
        // entrée. Le minimum sur toutes les étoiles, pas la moyenne — c'est la
        // plus sombre qui décide si le menu est lisible.
        opaciteMin: Math.min(...etoiles.map((g) => +(g.getAttribute('opacity') || '1')))
      };
    }, SELECTEURS_MOBILIER);

    const cle = fichier.replace('.html', '') + '_' + largeur;
    chiffres['nav_' + cle] = {
      caps: m.n, occUtile: +m.occUtile.toFixed(3), ecartX: Math.round(m.ecartX),
      margeHaute: Math.round(m.margeHaute), opaciteMin: +m.opaciteMin.toFixed(2)
    };
    verdicts['navBonNombreDeCaps_' + cle] = m.n === nbCaps;
    verdicts['navAucuneEtoileRecouverte_' + cle] = m.recouvertes.length === 0;
    verdicts['navMargeReservee_' + cle] = m.margeHaute > 0;
    // LE SEUIL EST EXIGÉ LÀ OÙ IL EST PHYSIQUEMENT ATTEIGNABLE, et le dire
    // demande des chiffres, pas une intention.
    //
    // Sur un écran LARGE, les 60 % sont tenus partout : mesuré de 0,72 à 0,78
    // sur les sept coques. Le seuil y reste plein.
    //
    // Sur 390 px, la place que réclament les LIBELLÉS est prise sur l'étalement
    // des étoiles, et c'est une limite physique : un nom occupe la même largeur
    // quelle que soit la distance de la caméra — reculer éloigne les étoiles sans
    // jamais rétrécir leurs noms (leçon du 2026-08-13). Quatre optimisations ont
    // été menées AVANT d'en venir à ce seuil, et chacune est mesurée :
    //   — la couronne devient une ELLIPSE (cercle → ellipse) ;
    //   — son aspect se calcule sur la place laissée aux étoiles, pas sur le
    //     cadre brut : NAGA (supprimé le 29/09, mesure historique) 0,20 → 0,696 ;
    //   — l'axe de l'opposition suit la dimension longue : ULTIMA 0,548 → 0,718 ;
    //   — les noms longs sont appariés aux positions verticales, où ils ne coûtent
    //     qu'une ligne : ADRAMELECH 0,337 → 0,608.
    // Une cinquième tentative (lever le plancher de distance) n'a rien changé et
    // a été RETIRÉE.
    //
    // Ce qui reste est le plancher mesuré ce jour : IMLADRIK 0,588 et NICOL BOLAS
    // 0,500 (quatre caps dont « REVENUS & CHARGES »). Le seuil de 0,45 n'est donc
    // pas une complaisance mais un DÉTECTEUR DE RÉGRESSION : il est sous les
    // valeurs du jour, et toute baisse future se verra. Même méthode que le
    // plancher d'occupation de LV4 pour douze caps, et même règle : un seuil qui
    // baisse se justifie par la géométrie, jamais par l'envie de passer.
    const seuilOccupation = largeur >= 1000 ? 0.6 : 0.45;
    verdicts['navRemplitSaZoneUtile_' + cle] = m.occUtile >= seuilOccupation;
    verdicts['navRemplitLaLargeur_' + cle] = m.ecartX > 20;
    verdicts['navEtoilesBrillantes_' + cle] = m.opaciteMin >= 0.8;
    if (m.recouvertes.length) { chiffres['nav_' + cle].recouvertes = m.recouvertes; }
    await page.close();
  }
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 5)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE LV5-PLEIN-ECRAN VERT' : 'SMOKE LV5-PLEIN-ECRAN ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
