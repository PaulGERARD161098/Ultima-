// LV5 / P3 — LE NOM GRAVÉ SUR LA PASSERELLE, et les sept coques au ciel.
//
// LA PERTE QUE CE HARNAIS FERME. L'inventaire LV4 §13.1 listait cinq fonctions
// que la boussole portait et qu'il fallait porter avec : la ④ était « la
// passerelle ET SON NOM GRAVÉ » (`lienLibelle`, ex. « ⇄ rétroplanning »). Le
// trait a bien été porté ; le nom, non. L'adaptateur créait la relation et
// jetait son libellé.
//
// ET LA COQUE PILOTE NE POUVAIT PAS LE VOIR : `ultima-perso` n'a aucun cap
// jumeau. La fonction avait donc été déclarée « portée » sur un écran incapable
// de la contredire. C'est le même piège que le cap « à venir » en LV4 — déclaré
// porté sur un écran qui n'en a pas — et il se referme de la même façon : on
// éprouve la fonction là où elle EXISTE. Un seul écran en a : TAO
// (reshiram ⇄ zekrom).
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
//   5. LES SEPT COQUES ORDINAIRES sont au ciel : chacune monte son canvas, rend
//      ses caps, et n'a plus une seule poussière SVG. **Chaque coque EXIGE son
//      canvas** au lieu de s'en remettre au garde du moteur — c'est la leçon de
//      P1, et sans elle sept coques pourraient passer avec une option morte.
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const erreurs = [];
const verdicts = {};
const chiffres = {};
const BASE = 'http://127.0.0.1:8123/';

// Le registre fait foi : le libellé attendu est LU, jamais recopié ici.
const attendu = await (async () => {
  const page = await browser.newPage();
  await page.goto(BASE + 'tao.html', { waitUntil: 'load' });
  const v = await page.evaluate(async () => {
    const { NOEUDS } = await import('/js/registre-lv3.mjs');
    const parent = NOEUDS.tao;
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
// ① à ④ — LE NOM SUR L'ARC, sur TAO, le seul écran qui en a un.
// ---------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push('tao: ' + m.text()); });
  page.on('pageerror', (e) => erreurs.push('tao: ' + String(e)));
  await page.goto(BASE + 'tao.html', { waitUntil: 'load' });
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
      const x = +t.getAttribute('x'); const y = +t.getAttribute('y');
      surLArc = {
        ecartX: Math.abs(x - (x1 + x2) / 2),
        ecartY: Math.abs(y - (y1 + y2) / 2),
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
  // Sur l'arc : à moins de 12 unités du milieu en x, et au-dessus du trait en y.
  verdicts.leNomEstSurLArc = !!(m.surLArc
    && m.surLArc.ecartX <= 12 && m.surLArc.ecartY <= 14
    && m.surLArc.longueur > 20);

  await page.close();
}

// ---------------------------------------------------------------------------
// ⑤ LES SEPT COQUES ORDINAIRES AU CIEL.
// ---------------------------------------------------------------------------
const COQUES = ['alpha', 'grima', 'naga', 'bcp', 'tao', 'imladrik', 'adramelech'];
for (const nom of COQUES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(nom + ': ' + m.text()); });
  page.on('pageerror', (e) => erreurs.push(nom + ': ' + String(e)));
  await page.goto(BASE + nom + '.html', { waitUntil: 'load' });
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
