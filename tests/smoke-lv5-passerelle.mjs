// LV5 / P3 — LE NOM GRAVÉ SUR LA PASSERELLE, et les coques ordinaires au ciel (sept jusqu'au 2026-09-29, six depuis
// la suppression de GRIMA et NAGA, CINQ depuis celle de TAO le 2026-09-30).
//
// LA PERTE QUE CE HARNAIS FERME. L'inventaire LV4 §13.1 listait cinq fonctions
// que la boussole portait et qu'il fallait porter avec : la ④ était « la
// passerelle ET SON NOM GRAVÉ » (`lienLibelle`, ex. « ⇄ rétroplanning »). Le
// trait a bien été porté ; le nom, non. L'adaptateur créait la relation et
// jetait son libellé.
//
// ET LA COQUE PILOTE NE POUVAIT PAS LE VOIR : `omega` (ex-`ultima-perso`) n'a aucun cap
// jumeau. La fonction avait donc été déclarée « portée » sur un écran incapable
// de la contredire. C'est le même piège que le cap « à venir » en LV4 — déclaré
// porté sur un écran qui n'en a pas — et il se referme de la même façon : on
// éprouve la fonction là où elle EXISTE. Un seul écran en a : les DRAGONS
// (reshiram ⇄ zekrom), depuis que TAO — qui les portait — est supprimé (30/09) :
// `imladrik.html#constellation-dragons`.
//
// Ce que ce harnais prouve :
//   1. Le nom de la passerelle EXISTE dans le document, et c'est le texte du
//      registre — pas un texte inventé ici.
//   2. Il est LISIBLE : opacité utile, et une couleur qui n'est pas le noir par
//      défaut d'un `<text>` SVG sans `fill` (le défaut qu'il aurait eu si le
//      groupe ne portait pas la sienne — invisible sur fond de nuit, donc
//      indétectable à l'œil).
//   3. Il est ANNONCÉ : il ne vit pas dans le groupe `aria-hidden` des traits.
//      « ⇄ rétroplanning » est une information sur la relation, portée par
//      l'étiquette d'aucune des deux étoiles.
//   4. Il est POSÉ SUR L'ARC, entre les deux étoiles qu'il nomme — mesuré, pas
//      supposé.
//   5. LES COQUES ORDINAIRES (cinq) sont au ciel : chacune monte son canvas, rend
//      ses caps, et n'a plus une seule poussière SVG. **Chaque coque EXIGE son
//      canvas** au lieu de s'en remettre au garde du moteur — c'est la leçon de
//      P1, et sans elle sept coques pourraient passer avec une option morte.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};
const BASE = 'http://127.0.0.1:8123/';
// L'écran de la passerelle : la constellation DRAGONS, isolée (30/09 — TAO, qui
// portait les jumeaux, est supprimé).
const ECRAN_DRAGONS = 'imladrik.html#constellation-dragons';

// Le registre fait foi : le libellé attendu est LU, jamais recopié ici.
const attendu = await (async () => {
  const page = await browser.newPage();
  await page.goto(BASE + 'imladrik.html', { waitUntil: 'load' });
  const v = await page.evaluate(async () => {
    const { NOEUDS } = await import('/js/registre-lv3.mjs');
    const parent = NOEUDS['constellation-dragons'];
    for (const id of parent.enfants) {
      const c = NOEUDS[id];
      if (c && c.lien) { return { source: id, cible: c.lien, libelle: c.lienLibelle || '' }; }
    }
    return null;
  });
  await page.close();
  return v;
})();

verdicts.leRegistreDeclareUnePasserelle = !!attendu && !!attendu.libelle;
chiffres.passerelleAttendue = attendu;

// ---------------------------------------------------------------------------
// ① à ④ — LE NOM SUR L'ARC, sur les DRAGONS, le seul écran qui en a un.
// ---------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('dragons: ' + m.text()); });
  page.on('pageerror', (e) => erreurs.push('dragons: ' + String(e)));
  await page.goto(BASE + ECRAN_DRAGONS, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const m = await page.evaluate((att) => {
    const t = document.querySelector('text.ciel-nom-lien');
    if (!t) { return { present: false }; }
    const groupe = t.closest('g');
    const style = getComputedStyle(t);
    // La ligne du lien, pour vérifier que le nom est bien SUR l'arc.
    const ligne = document.querySelector(
      `.ciel-liens line[data-a="${att.source}"][data-b="${att.cible}"]`)
      || document.querySelector('.ciel-liens line');
    let surLArc = null;
    if (ligne) {
      const x1 = +ligne.getAttribute('x1'); const y1 = +ligne.getAttribute('y1');
      const x2 = +ligne.getAttribute('x2'); const y2 = +ligne.getAttribute('y2');
      // En coordonnées d'ÉCRAN, sur la BOÎTE du texte (30/09) : le nom reste
      // au milieu LE LONG du trait, et s'en écarte de ce que sa boîte exige.
      const m = ligne.getScreenCTM(); const pt = ligne.ownerSVGElement.createSVGPoint();
      const P = (px, py) => { pt.x = px; pt.y = py; return pt.matrixTransform(m); };
      const a = P(x1, y1); const b = P(x2, y2);
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / L; const uy = (b.y - a.y) / L;
      const r = t.getBoundingClientRect();
      const bx = (r.left + r.right) / 2 - (a.x + b.x) / 2;
      const by = (r.top + r.bottom) / 2 - (a.y + b.y) / 2;
      surLArc = {
        leLong: Math.abs(bx * ux + by * uy),
        aCote: Math.abs(bx * uy - by * ux),
        requis: Math.abs(uy) * r.width / 2 + Math.abs(ux) * r.height / 2,
        longueur: Math.hypot(x2 - x1, y2 - y1)
      };
    }
    return {
      present: true,
      texte: t.textContent,
      opacite: +(t.getAttribute('opacity') || '1'),
      couleur: style.fill,
      dansUnGroupeMuet: !!t.closest('[aria-hidden="true"]'),
      classeGroupe: groupe ? groupe.getAttribute('class') : null,
      surLArc,
      police: style.fontFamily
    };
  }, attendu);

  chiffres.nomDePasserelle = m;
  verdicts.leNomDePasserelleExiste = m.present === true;
  verdicts.leNomEstCeluiDuRegistre = m.present && m.texte === attendu.libelle;
  verdicts.leNomEstLisible = m.present && m.opacite >= 0.4;
  // Un `<text>` SVG sans `fill` est peint en NOIR : sur fond de nuit, il
  // existerait dans le document et ne se verrait nulle part. On exige donc une
  // couleur claire, mesurée sur le style calculé.
  verdicts.leNomNEstPasNoir = m.present
    && m.couleur !== 'rgb(0, 0, 0)' && m.couleur !== '#000000';
  verdicts.leNomEstAnnonce = m.present && m.dansUnGroupeMuet === false;
  verdicts.leNomEstGrave = m.present && /Georgia|Times/.test(m.police || '');
  // Sur l'arc, au milieu, et À CÔTÉ du trait. TRANSPOSÉ LE 30/09 : l'ancien
  // contrôle (« ancre à ≤ 12 / 14 unités du milieu ») supposait un nom posé à 8
  // unités du trait, ce qui le faisait traverser dès que le trait est vertical
  // (les DRAGONS). Le nom reste au milieu le long du trait (≤ 12 px), et s'en
  // écarte d'au moins ce que sa boîte exige, sans s'envoler (≤ exigé + 14 px).
  verdicts.leNomEstSurLArc = !!(m.surLArc
    && m.surLArc.leLong <= 12
    && m.surLArc.aCote >= m.surLArc.requis && m.surLArc.aCote <= m.surLArc.requis + 14
    && m.surLArc.longueur > 20);

  await page.close();
}

// ---------------------------------------------------------------------------
// ⑤ LES COQUES ORDINAIRES AU CIEL.
// ---------------------------------------------------------------------------
// 2026-09-29 : GRIMA et NAGA sont supprimés, OMEGA (ex-ULTIMA) les remplace :
// six coques ordinaires, plus sept. 2026-09-30 : `tao.html` n'existe plus (la
// page est supprimée, `goto` y rendrait un 404 — et le canvas n'y monterait
// jamais) : CINQ coques. La passerelle, qui vivait sur la sixième, est éprouvée
// ci-dessus sur son nouvel écran ; et l'écran qui HÉRITE des deux pôles de TAO —
// les DRAGONS isolés — rejoint ici la liste des écrans qui doivent monter leur
// canvas (sous forme d'adresse à fragment), pour que la famille ne perde pas un
// écran en changeant d'adresse.
const COQUES = ['alpha', 'omega', 'bcp', 'imladrik', 'adramelech', 'constellation-dragons'];
verdicts.coquesSansTao = COQUES.length === 6 && !COQUES.includes('tao');
// Une coque « sans page » (une constellation isolée) s'ouvre par son adresse à
// fragment ; les autres par leur fichier. Sa clé reste celle du registre.
const urlDeCoque = (nom) => (nom === 'constellation-dragons' ? ECRAN_DRAGONS : nom + '.html');
for (const nom of COQUES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(nom + ': ' + m.text()); });
  page.on('pageerror', (e) => erreurs.push(nom + ': ' + String(e)));
  await page.goto(BASE + urlDeCoque(nom), { waitUntil: 'load' });
  await page.waitForTimeout(1700);

  const r = await page.evaluate(async (id) => {
    const { NOEUDS } = await import('/js/registre-lv3.mjs');
    const vue = window.UltimaCiel && window.UltimaCiel.courant();
    const attendus = (NOEUDS[id] && NOEUDS[id].enfants) || [];
    const rendus = Array.from(document.querySelectorAll('.ciel-etoile[data-noeud-id]'))
      .map((g) => g.getAttribute('data-noeud-id'));
    const plateau = document.getElementById('ciel-noeud-plateau');
    return {
      canvas: !!document.querySelector('canvas.ciel-fond'),
      grains: vue ? vue.nbGrains() : 0,
      poussiereSvg: document.querySelectorAll('.ciel-decor circle').length,
      attendus: attendus.length,
      // Le registre fait foi : aucune cible perdue, aucune cible inventée.
      manquants: attendus.filter((a) => rendus.indexOf(a) === -1),
      pleinEcran: plateau
        ? (plateau.getBoundingClientRect().height / window.innerHeight)
        : 0,
      // Le repli sans JavaScript doit avoir SURVÉCU au rendu : le moteur vide la
      // scène à chaque dessin, donc il doit vivre à côté d'elle, pas dedans.
      repli: document.querySelectorAll('#ciel-noeud-plateau noscript').length,
      // ET IL DOIT ÊTRE À JOUR. Trouvé le 2026-08-17 sur IMLADRIK : le repli y
      // annonçait VRANESH et DRAUKHAIN « à venir » et SANS LIEN — vrai le jour
      // où la liste fut écrite, faux depuis qu'ils sont bâtis. Deux tiers du
      // quadrant étaient inatteignables sans JavaScript, et personne ne
      // pouvait le voir : on ne regarde ce repli qu'avec JS désactivé.
      // Le registre fait foi, la liste doit le suivre.
      cellesDuRepli: (() => {
        const n = document.querySelector('#ciel-noeud-plateau noscript');
        return Array.from((n?.textContent || '').matchAll(/href="([^"]+)"/g)).map((m) => m[1]);
      })(),
      // 2026-09-30 : LE REPLI SE PROLONGE SOUS LES CONSTELLATIONS. IMLADRIK n'a plus
      // ses trois dragons pour enfants directs : ils vivent sous DRAGONS, qui n'a
      // pas de page, et dont le repli est une SOUS-LISTE. Lire les seules cibles
      // des enfants directs aurait rendu ce verdict vert en oubliant MAEDRETHNIR,
      // VRANESH et DRAUKHAIN — un affaiblissement silencieux, pas une
      // transposition. On descend donc, mais PAR LES CONSTELLATIONS seulement :
      // ADRAMELECH a des enfants sur sa propre page, pas dans le repli d'IMLADRIK.
      ciblesDuRegistre: (function portees(parent) {
        return ((NOEUDS[parent] && NOEUDS[parent].enfants) || []).flatMap((a) => (
          (NOEUDS[a] || {}).constellation === true ? portees(a) : [(NOEUDS[a] || {}).cible]));
      })(id).filter((c) => c && !/^https?:/.test(c)),
      plusDeBoussole: !document.querySelector('.boussole-plateau')
        && !document.body.classList.contains('boussole')
    };
  }, nom);

  chiffres['coque_' + nom] = {
    grains: r.grains, caps: r.attendus, pleinEcran: +r.pleinEcran.toFixed(3)
  };
  verdicts['canvasMonte_' + nom] = r.canvas === true;
  verdicts['aucuneCiblePerdue_' + nom] = r.manquants.length === 0;
  verdicts['plusDePoussiereSvg_' + nom] = r.poussiereSvg === 0;
  verdicts['pleinEcran_' + nom] = r.pleinEcran >= 0.98;
  verdicts['leRepliSurvit_' + nom] = r.repli === 1;
  // LE REPLI LISTE TOUTES LES CIBLES INTERNES DU REGISTRE. Les externes en sont
  // exclues volontairement : sans JavaScript, une porte vers un autre domaine
  // reste un lien ordinaire et n'a pas à figurer dans cette liste.
  const repliComplet = r.ciblesDuRegistre.every((c) => r.cellesDuRepli.includes(c));
  verdicts['leRepliEstAJour_' + nom] = repliComplet;
  if (!repliComplet) {
    chiffres['coque_' + nom].repliIncomplet = {
      attendu: r.ciblesDuRegistre, trouve: r.cellesDuRepli
    };
  }
  // Verrou de non-vacuité : « aucune cible perdue » est vert sur une liste vide.
  // OMEGA, IMLADRIK, ALPHA et les DRAGONS portent des caps ; ils doivent en compter.
  if (['alpha', 'omega', 'constellation-dragons', 'imladrik', 'adramelech'].includes(nom)) {
    verdicts['coqueNonVide_' + nom] = r.attendus >= 2;
  }
  if (nom === 'omega') { verdicts.omegaTroisCaps = r.attendus === 3; }
  // IMLADRIK : DEUX entrées (ARMES, DRAGONS) — le repli, lui, porte SIX pages (la
  // descente est prouvée : sans elle, `ciblesDuRegistre` n'en compterait aucune,
  // les deux entrées étant sans page). TRANSPOSÉ (30/09) : quatre entrées + cinq
  // pages → deux + six ; TAO n'est plus nulle part.
  if (nom === 'imladrik') {
    verdicts.imladrikDeuxEntrees = r.attendus === 2;
    verdicts.imladrikRepliAttenduProfond = r.ciblesDuRegistre.length === 6
      && ['maedrethnir.html', 'vranesh.html', 'draukhain.html', 'adramelech.html',
        'reshiram.html', 'zekrom.html']
        .every((c) => r.ciblesDuRegistre.includes(c) && r.cellesDuRepli.includes(c))
      && !r.cellesDuRepli.some((c) => /tao/i.test(c));
  }
  // LES DRAGONS, ISOLÉS : sept étoiles (ZOH SHIA, 04/10/2026, sans page), six
  // pages dans le repli (le repli de la page porte les six, isolement ou non).
  if (nom === 'constellation-dragons') {
    verdicts.dragonsSeptEtoiles = r.attendus === 7 && r.manquants.length === 0;
    verdicts.dragonsRepliSixPages = r.ciblesDuRegistre.length === 6
      && r.ciblesDuRegistre.every((c) => r.cellesDuRepli.includes(c));
  }
  verdicts['plusDeBoussole_' + nom] = r.plusDeBoussole === true;
  if (r.manquants.length) { chiffres['coque_' + nom].manquants = r.manquants; }

  await page.close();
}

verdicts.zeroErreurConsole = erreurs.length === 0;

console.log(JSON.stringify(verdicts, null, 2));
console.log('Mesures :', JSON.stringify(chiffres, null, 2));
if (erreurs.length) { console.log('Erreurs :', erreurs.slice(0, 6)); }
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'SMOKE LV5-PASSERELLE VERT' : 'SMOKE LV5-PASSERELLE ROUGE');
await browser.close();
process.exit(ok ? 0 : 1);
