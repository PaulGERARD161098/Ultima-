// LA CARTE CÉLESTE EST ALLUMÉE — lot 2b de CADRAGE-2026-09-25-carte-celeste.md (§18.3).
//
// A8 rendu par Paul le 26/09 : V1 — la couronne reste, et chaque constellation
// porte sa FIGURE (un arbre de n − 1 traits, `asterisme`) et son RANG (une tête,
// qui contient quelque chose, plus vive qu'une feuille, `eclatParPoids`).
// Le moteur et la maquette existaient depuis le lot 2 ; ce harnais prouve que
// la PRODUCTION les porte, sur les écrans de navigation réels.
//
// Ce qu'il mesure, écran par écran, au téléphone et au bureau :
//   · les traits : n − (nombre de constellations), aucun vers une étoile absente,
//     au moins un visible, AUCUN qui traverse un nom ;
//   · l'encre : parchemin `#cdc3ad`, jamais l'or de l'appel ; muets au lecteur
//     d'écran (`aria-hidden`) — un trait n'a rien à dire ;
//   · le rang : la plus petite tête plus grande que la plus grosse feuille,
//     là où l'écran a deux rangs ;
//   · l'extinction : quand le ciel s'efface autour d'un choix, la figure
//     s'efface avec lui — sinon des traits pendraient vers des étoiles éteintes ;
//   · `reduced-motion` : rien de ce que le lot ajoute ne s'anime (témoin apparié).
//
// ⛔ VU ROUGE SUR LA TÊTE D'AVANT (options inactives). Chaque recherche
// d'absence (« aucun trait vers une étoile absente », « aucun trait à travers
// un nom ») est précédée de son verrou : au moins deux étoiles et un trait.
//
// ⚠️ PÉRIMÈTRE, nommément : les coques de navigation (`#ciel-noeud-scene`).
// RIVEN n'active rien — son témoin reste `smoke-ciel`, inchangé.
import { chromium } from 'playwright';
import { AGREGAT } from '../design/preview-accueil-finubar-fixture.mjs';

const BASE = process.env.BASE_ULTIMA || 'http://127.0.0.1:8123';
const ENCRE = '#cdc3ad';
const navigateur = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const erreurs = [];
const verdicts = {};
const chiffres = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

// `deuxRangs` : ce que le registre dit de l'écran (§14.2, « Ce que le rang
// change vraiment ») — un écran qui n'a que des têtes, ou que des feuilles, n'a
// pas de rang à montrer, et exiger qu'il s'y voie serait exiger l'impossible.
// 2026-09-29 : GRIMA et NAGA sont supprimés. OMEGA porte RIVEN (feuille) +
// NICOL BOLAS et IMLADRIK (têtes) ; NICOL BOLAS isolé n'a que des feuilles
// (ABAQUE + trois caps à venir).
// 2026-09-30 : IMLADRIK isolé N'A PLUS DEUX RANGS. Il porte DEUX entrées, TOUTES
// des têtes (ARMES et DRAGONS, deux constellations qui contiennent) et AUCUNE
// feuille : les trois dragons, ADRAMELECH, RESHIRAM et ZEKROM sont descendus sous
// DRAGONS, et TAO est supprimé. Exiger « la tête plus vive que la feuille » sur un
// écran sans feuille serait exiger l'impossible — l'assertion du rang n'est donc PAS
// relâchée, elle reste portée par les écrans qui ont réellement deux rangs : la
// RACINE (ALPHA, OMEGA + ALTHEA, feuille), OMEGA (RIVEN, feuille, + deux têtes) et
// ALPHA session. IMLADRIK reçoit à la place un VERROU qui constate qu'il est à UN
// seul rang — le jour où une feuille y reviendra, ce verrou virera et rendra le rang
// exigible.
// La constellation DRAGONS isolée est un écran de plus, et PAS un écran comme les
// autres : ses six étoiles sont INDÉPENDANTES (`asterisme: false` — Paul, 30/09,
// « pas obligé de relier les étoiles entre elles, sauf RESHIRAM et ZEKROM »). Elle
// n'a donc AUCUN trait de figure, et c'est son ABSENCE qu'on lui exige
// (`sansFigure: true`, ci-dessous), sous le verrou d'un témoin : les autres écrans,
// mesurés avec le MÊME instrument dans le même passage, en ont. Elle a en
// revanche DEUX RANGS — cinq feuilles et une tête (ADRAMELECH, qui porte ses trois
// caps) : le rang s'y exige, et se lit dans le registre.
// Le drapeau est DÉRIVÉ du registre plus bas (verrou de cohérence), pas seulement
// déclaré ici.
const ECRANS = [
  { nom: 'racine', page: 'index.html', porte: true, deuxRangs: true },
  { nom: 'OMEGA', fil: 'OMEGA', page: 'omega.html', deuxRangs: true },
  { nom: 'IMLADRIK', fil: 'IMLADRIK', page: 'omega.html#imladrik', deuxRangs: false },
  { nom: 'NICOL BOLAS', fil: 'NICOL BOLAS', page: 'omega.html#nicol-bolas', deuxRangs: false },
  // (TAO — les Gémeaux, deux feuilles, où le premier jet du lot avait CÉDÉ sur la
  // cible du doigt — est SUPPRIMÉ le 30/09 ; la page n'existe plus, ses deux pôles
  // sont mesurés avec les DRAGONS ci-dessous.)
  // ⚠️ SANS SESSION, ALPHA n'a qu'UN rang : RENOBOOST IA ne contient ses dépôts
  // qu'après la greffe Finubar. Son rang se prouve plus bas, session ouverte.
  { nom: 'ALPHA', fil: 'ALPHA', page: 'alpha.html', deuxRangs: false },
  // LA CONSTELLATION DES DRAGONS, isolée (30/09) : MAEDRETHNIR, VRANESH, DRAUKHAIN,
  // RESHIRAM, ZEKROM — cinq feuilles — et ADRAMELECH, une tête. SANS FIGURE (voir
  // plus haut). (ARMES, isolée, n'a qu'IFULVIN : une étoile ne porte ni figure ni
  // rang, elle est mesurée par smoke-lv5-plein-ecran.)
  { nom: 'DRAGONS', fil: 'DRAGONS', page: 'imladrik.html#constellation-dragons',
    deuxRangs: true, sansFigure: true },
  { nom: 'ZOH SHIA', fil: 'ZOH SHIA', page: 'imladrik.html#zohshia', deuxRangs: false, iphone: true },
  // LES SOUS-CONSTELLATIONS DE ZOH SHIA (02/11/2026) : c'est sur ces écrans que vivent
  // les technos, et c'est là que la couronne a cédé à neuf étoiles. Chacune est
  // mesurée comme les autres écrans — traits, noms, cibles, encre.
  { nom: 'DEVIS & PAIEMENT', fil: 'DEVIS & PAIEMENT', page: 'imladrik.html#zoh-groupe-devis', deuxRangs: false, iphone: true },
  { nom: 'MÉTHODES', fil: 'MÉTHODES', page: 'imladrik.html#zoh-groupe-methodes', deuxRangs: false, iphone: true },
  { nom: 'VENTE', fil: 'VENTE', page: 'imladrik.html#zoh-groupe-vente', deuxRangs: false, iphone: true },
];
const TAILLES = [[390, 844], [1280, 800]];
// VERROU DE COHÉRENCE : `deuxRangs` se lit dans le registre, il ne se croit pas.
// Un écran déclaré à deux rangs qui n'en aurait qu'un ferait passer à vide (ou
// échouer à tort) l'assertion « le rang se voit ».
{
  const { NOEUDS } = await import('../js/registre-lv3.mjs');
  const FOYER = { OMEGA: 'omega', IMLADRIK: 'imladrik', 'NICOL BOLAS': 'nicol-bolas',
    DRAGONS: 'constellation-dragons', 'ZOH SHIA': 'zohshia', 'DEVIS & PAIEMENT': 'zoh-groupe-devis',
    'MÉTHODES': 'zoh-groupe-methodes', VENTE: 'zoh-groupe-vente' };
  for (const e of ECRANS.filter((x) => FOYER[x.nom])) {
    const caps = NOEUDS[FOYER[e.nom]].enfants;
    const tetes = caps.filter((id) => (NOEUDS[id].enfants || []).length > 0).length;
    verifier(`${e.nom} : deuxRangs déclaré = deux rangs dans le registre`,
      e.deuxRangs === (tetes >= 1 && caps.length - tetes >= 1), `${tetes} tête(s) sur ${caps.length}`);
  }
  // IMLADRIK est à UN SEUL RANG — dit à voix haute, avec ses chiffres. C'est ce
  // que l'ancienne déclaration `deuxRangs: true` aurait contredit en silence.
  const capsImladrik = NOEUDS.imladrik.enfants;
  const tetesImladrik = capsImladrik.filter((id) => (NOEUDS[id].enfants || []).length > 0);
  verifier('IMLADRIK : un seul rang — deux têtes, aucune feuille',
    capsImladrik.length === 2 && tetesImladrik.length === 2,
    `${tetesImladrik.length} tête(s) sur ${capsImladrik.length}`);
  // DRAGONS : DEUX rangs — cinq feuilles, UNE tête (ADRAMELECH). TRANSPOSÉ : c'était
  // « un seul rang — trois feuilles, aucune tête » ; ADRAMELECH, arrivé chez les
  // DRAGONS avec ses trois caps, est la tête, et le rang s'y exige désormais.
  const capsDragons = NOEUDS['constellation-dragons'].enfants;
  const tetesDragons = capsDragons.filter((id) => (NOEUDS[id].enfants || []).length > 0);
  verifier('DRAGONS : deux rangs — six feuilles et deux têtes (ADRAMELECH, ZOH SHIA)',
    capsDragons.length === 8 && tetesDragons.join() === 'adramelech,zohshia',
    `${tetesDragons.join()} sur ${capsDragons.length}`);
  // NON-VACUITÉ DE CE QUI RESTE : l'assertion du rang n'a pas disparu, elle a
  // changé d'écrans. Il en reste au moins deux (racine, OMEGA) qui l'exigent, et
  // aucun d'eux n'est IMLADRIK.
  const exigeantLeRang = ECRANS.filter((x) => x.deuxRangs).map((x) => x.nom);
  verifier('Le rang reste exigé sur au moins trois écrans (racine, OMEGA, DRAGONS), pas sur IMLADRIK',
    exigeantLeRang.length >= 3 && exigeantLeRang.includes('racine') && exigeantLeRang.includes('OMEGA')
    && exigeantLeRang.includes('DRAGONS') && !exigeantLeRang.includes('IMLADRIK'), exigeantLeRang.join(','));
  // La figure, elle, n'est retirée qu'aux DRAGONS — lu dans le registre, pas
  // seulement déclaré : un `sansFigure` sur un écran dont le registre garde
  // l'astérisme ferait passer « aucun trait » à vide.
  const sansFigure = ECRANS.filter((x) => x.sansFigure).map((x) => x.nom);
  verifier('Seul l\'écran DRAGONS est déclaré sans figure, et le registre le dit (asterisme === false)',
    sansFigure.join() === 'DRAGONS' && NOEUDS['constellation-dragons'].asterisme === false
    && Object.keys(NOEUDS).filter((id) => NOEUDS[id].asterisme === false).join() === 'constellation-dragons');
}

async function ouvrir(ecran, [largeur, hauteur], options = {}) {
  const contexte = await navigateur.newContext({ viewport: { width: largeur, height: hauteur }, ...options });
  const page = await contexte.newPage();
  page.on('pageerror', (e) => erreurs.push(`${ecran.nom}@${largeur} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${ecran.nom}@${largeur} console: ${m.text()}`); } });
  // Agrégat Finubar et cockpit vides : ce harnais ne juge ni l'un ni l'autre.
  // ⚠️ La route générique d'ABORD : Playwright essaie la dernière posée en premier.
  await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
  await page.route('**/api/finubar', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, data: { le: '2026-09-26', projets: [], macro: {}, cartouche: { signaux: [] } } }),
  }));
  await page.goto(`${BASE}/${ecran.page}`, { waitUntil: 'load', timeout: 20000 });
  if (ecran.porte) {
    await page.evaluate(() => {
      const el = document.getElementById('ecran-connexion');
      if (el) { el.hidden = true; el.style.display = 'none'; }
      document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
    });
  }
  // La caméra doit être POSÉE (§17 : mesurer à 0,9 s mentait).
  await page.waitForTimeout(2000);
  return { page, contexte };
}

function mesurer(page, tetesImposees = null) {
  return page.evaluate(async (tetesImposees) => {
    const { NOEUDS } = await import('/js/registre-lv3.mjs');
    const scene = document.getElementById('ciel-noeud-scene');
    const svg = scene && scene.querySelector('.ciel-svg');
    if (!svg) { return null; }
    const etoiles = [...svg.querySelectorAll('g.ciel-etoile[data-noeud-id]')];
    const ids = new Set(etoiles.map((g) => g.dataset.noeudId));
    const groupe = svg.querySelector('.ciel-asterisme');
    const lignes = groupe ? [...groupe.querySelectorAll('line')] : [];
    const visibles = lignes.filter((l) => l.getAttribute('display') !== 'none');
    const orphelins = lignes.filter((l) => !ids.has(l.dataset.a) || !ids.has(l.dataset.b)).length;
    const amas = [...svg.querySelectorAll('text.ciel-nom-amas')];
    // UN TRAIT NE PREND PAS LE DOIGT : au MILIEU de chaque trait visible, le
    // navigateur ne doit jamais répondre « le trait » (dry run DR du 27/09 —
    // les traits captaient les touchers posés à côté d'une étoile).
    let traitsPrenants = 0, traitsSondes = 0;
    for (const l of visibles) {
      const b = l.getBoundingClientRect();
      const x = b.left + b.width / 2, y = b.top + b.height / 2;
      if (x <= 0 || y <= 0 || x >= innerWidth || y >= innerHeight) { continue; }
      traitsSondes += 1;
      const el = document.elementFromPoint(x, y);
      if (el && el.closest('.ciel-asterisme')) { traitsPrenants += 1; }
    }
    // TRAITS × NOMS : la mesure de la maquette (§17), sur les noms PEINTS.
    const noms = etoiles.map((g) => g.querySelector('.ciel-nom'))
      .filter((n) => n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05)
      .map((n) => n.getBoundingClientRect());
    let traitsNoms = 0;
    for (const l of visibles) {
      const m = l.getScreenCTM(); const pt = svg.createSVGPoint();
      const P = (x, y) => { pt.x = x; pt.y = y; return pt.matrixTransform(m); };
      const a = P(+l.getAttribute('x1'), +l.getAttribute('y1')), c = P(+l.getAttribute('x2'), +l.getAttribute('y2'));
      for (const n of noms) {
        let dedans = false;
        for (let s = 0.02; s < 0.98 && !dedans; s += 0.01) {
          const x = a.x + (c.x - a.x) * s, y = a.y + (c.y - a.y) * s;
          dedans = x > n.left && x < n.right && y > n.top && y < n.bottom;
        }
        if (dedans) { traitsNoms += 1; }
      }
    }
    // LES NOMS ENTRE EUX (03/11/2026, capture de Paul sur DEVIS & PAIEMENT à 390 px :
    // une étoile posée dans le nom de sa voisine, des noms empilés, un nom coupé).
    // « Aucun trait à travers un nom » était vert sur cet écran : il ne regardait que
    // les traits. Trois mesures de plus, sur les noms PEINTS de chaque étoile.
    const peints = etoiles.map((g) => {
      const n = g.querySelector('.ciel-nom');
      const c = g.querySelector('circle[fill="#ffffff"]');
      const visible = n && +(n.getAttribute('opacity') || getComputedStyle(n).opacity) > 0.05;
      const bc = c ? c.getBoundingClientRect() : null;
      return { id: g.dataset.noeudId, nom: visible ? n.getBoundingClientRect() : null,
        texte: visible ? (n.textContent || '').trim() : '',
        x: bc ? bc.left + bc.width / 2 : NaN, y: bc ? bc.top + bc.height / 2 : NaN };
    });
    const avecNom = peints.filter((p) => p.nom && p.nom.width > 0);
    let etoilesSurNom = 0, nomsChevauches = 0;
    const detailsNoms = [];
    for (const p of peints) {
      for (const q of avecNom) {
        if (q.id === p.id || !Number.isFinite(p.x)) continue;
        const b = q.nom;
        if (p.x > b.left - 2 && p.x < b.right + 2 && p.y > b.top - 2 && p.y < b.bottom + 2) {
          etoilesSurNom += 1; detailsNoms.push(`${p.id} sur le nom de ${q.id}`);
        }
      }
    }
    for (let i = 0; i < avecNom.length; i++) {
      for (let j = i + 1; j < avecNom.length; j++) {
        const a = avecNom[i].nom, b = avecNom[j].nom;
        const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        // Écart vertical de moins de 4 px = noms empilés (capture du 03/11 : 3 px).
        if (ix > 1 && iy > -4) { nomsChevauches += 1; detailsNoms.push(`${avecNom[i].id} × ${avecNom[j].id}`); }
      }
    }
    const nomsTronques = avecNom.filter((p) => p.texte.endsWith('…')).map((p) => p.id);
    // LE RANG : lu dans le REGISTRE, comme le moteur (`rang()`), jamais deviné
    // de la taille qu'on veut mesurer.
    const rayons = etoiles.map((g) => ({
      r: +(g.querySelector('circle[fill="#ffffff"]') || {}).getAttribute?.('r') || 0,
      tete: tetesImposees ? tetesImposees.includes(g.dataset.noeudId)
        : !!((NOEUDS[g.dataset.noeudId] || {}).enfants || []).length,
    }));
    const tetes = rayons.filter((x) => x.tete).map((x) => x.r);
    const feuilles = rayons.filter((x) => !x.tete).map((x) => x.r);
    // LES NOMS DE CONSTELLATION (A9-3) : peints, et dans le cadre ?
    const cadre = svg.getBoundingClientRect();
    const amasLus = amas.filter((t) => {
      const b = t.getBoundingClientRect();
      const op = +getComputedStyle(t).opacity * +(t.getAttribute('opacity') || 1);
      return t.getAttribute('display') !== 'none' && b.width > 0 && op > 0.05
        && b.left >= cadre.left - 1 && b.right <= cadre.right + 1 && b.top >= cadre.top - 1 && b.bottom <= cadre.bottom + 1;
    }).map((t) => t.textContent);
    return {
      etoiles: etoiles.length, groupes: amas.length, traits: lignes.length, visibles: visibles.length,
      groupeFigure: !!groupe, traitsFigure: svg.querySelectorAll('.ciel-trait-figure').length,
      orphelins, traitsNoms, traitsPrenants, traitsSondes,
      nomsPeints: avecNom.length, etoilesSurNom, nomsChevauches, nomsTronques, detailsNoms,
      encre: groupe ? (groupe.getAttribute('stroke') || '').toLowerCase() : '',
      muet: groupe ? groupe.getAttribute('aria-hidden') : '',
      tetes: tetes.length, feuilles: feuilles.length,
      teteMin: tetes.length ? Math.min(...tetes) : 0, feuilleMax: feuilles.length ? Math.max(...feuilles) : 0,
      amasLus,
      // LA CIBLE DU DOIGT : la plus petite zone de captation, en px d'écran.
      cibleMin: Math.min(...etoiles.map((g) => { const z = g.querySelector('.ciel-zone'); const b = z && z.getBoundingClientRect(); return b ? Math.min(b.width, b.height) : 0; })),
      // Ce qui NOMME l'écran : le fil quand on est descendu d'un cran, le titre
      // de la page à sa racine (le fil n'y a rien à dire, il n'y a rien au-dessus).
      ici: (((document.querySelector('.ciel-fil-ici') || {}).textContent || '').trim()
        || ((document.querySelector('.console-titre .titre-principal') || {}).textContent || '').trim()),
    };
  }, tetesImposees);
}

// LE TÉMOIN DE L'ABSENCE DE FIGURE. « Aucun trait sur DRAGONS » ne vaut que si
// l'instrument qui compte les traits en voit AILLEURS : on garde, écran après
// écran, le plus grand nombre de traits de figure lu (`temoinTraits`). DRAGONS est le
// dernier de la liste : tous les autres ont été mesurés avant lui, avec la même
// fonction `mesurer`, dans le même passage.
let temoinTraits = 0;
function juger(cle, m, ecran) {
  verifier(`${cle} : verrou — au moins deux étoiles`, m.etoiles >= 2, `${m.etoiles}`);
  if (ecran.sansFigure) {
    // ÉCRAN SANS FIGURE : les six assertions de la figure (elle existe, un trait
    // visible, aucun vers l'absent, aucun à travers un nom, aucun ne prend le doigt,
    // encre, muette) sont INVERSÉES EN BLOC en une seule exigence, l'absence — et
    // celle-ci est éprouvée des deux côtés, sur le groupe ET sur les traits.
    verifier(`${cle} : verrou — l'instrument voit des traits de figure sur les autres écrans`,
      temoinTraits >= 3, `${temoinTraits} au plus, ailleurs`);
    verifier(`${cle} : AUCUN trait de figure (asterisme: false), ni groupe de figure`,
      m.etoiles >= 2 && m.traits === 0 && m.traitsFigure === 0 && m.groupeFigure === false,
      `${m.traits} trait(s), ${m.traitsFigure} .ciel-trait-figure, groupe ${m.groupeFigure}`);
  } else {
    temoinTraits = Math.max(temoinTraits, m.traits);
    verifier(`${cle} : la figure existe (n − constellations traits)`,
      m.etoiles >= 2 && m.traits === m.etoiles - m.groupes && m.traits >= 1, `${m.traits} pour ${m.etoiles} étoiles, ${m.groupes} constellation(s)`);
    verifier(`${cle} : au moins un trait visible`, m.visibles >= 1, `${m.visibles}`);
    verifier(`${cle} : aucun trait vers une étoile absente`, m.traits >= 1 && m.orphelins === 0, `${m.orphelins}`);
    verifier(`${cle} : aucun trait à travers un nom`, m.visibles >= 1 && m.traitsNoms === 0, `${m.traitsNoms}`);
    verifier(`${cle} : aucun trait ne prend le doigt`, m.traitsSondes >= 1 && m.traitsPrenants === 0,
      `${m.traitsPrenants} sur ${m.traitsSondes} sondés`);
    verifier(`${cle} : encre parchemin, pas l'or`, m.encre === ENCRE, m.encre || 'aucun groupe');
    verifier(`${cle} : la figure est muette au lecteur d'écran`, m.muet === 'true', String(m.muet));
  }
  // Les noms se lisent : verrou de non-vacuité d'abord (des noms sont peints), puis
  // aucune étoile dans le nom d'une autre, aucun nom sur un autre, aucun nom coupé.
  verifier(`${cle} : verrou — des noms sont peints`, m.nomsPeints >= 2, `${m.nomsPeints}`);
  verifier(`${cle} : aucune étoile posée sur le nom d'une autre`, m.nomsPeints >= 2 && m.etoilesSurNom === 0,
    `${m.etoilesSurNom} ${m.detailsNoms.filter((d) => d.includes(' sur ')).join(' · ')}`);
  verifier(`${cle} : aucun nom sur un autre ni collé à moins de 4 px`, m.nomsPeints >= 2 && m.nomsChevauches === 0,
    `${m.nomsChevauches} ${m.detailsNoms.filter((d) => d.includes(' × ')).join(' · ')}`);
  verifier(`${cle} : aucun nom coupé (…)`, m.nomsPeints >= 2 && m.nomsTronques.length === 0, m.nomsTronques.join(', ') || '0');
  // ⛔ LE RANG CHANGE L'ÉCLAT, JAMAIS LA CIBLE DU DOIGT. Premier jet : la zone
  // de captation suivait le rayon, donc une feuille rapetissée devenait plus
  // dure à toucher — TAO passé de 45 à 30 px au bureau. Trouvé par `smoke-tao`
  // dans le patrimoine, pas par ce harnais ; il le tenait ici aussi.
  // (30/09 : TAO et son `smoke-tao` sont supprimés. Le plancher de 44 px sur les
  // DEUX PÔLES au bureau est repris par `smoke-imladrik-carto` (RESHIRAM et ZEKROM
  // sur `imladrik.html#constellation-dragons`), là où il se mesure étoile par
  // étoile — ici, `cibleMin` est le MINIMUM de l'écran, et sur six étoiles c'est
  // VRANESH ou DRAUKHAIN qui le fixent, pas les jumeaux.)
  // Deux seuils, chacun lu à sa source, aucun inventé :
  //   · 24 px partout — le plancher que le moteur PROMET (`RAYON_CAPTATION_MIN`,
  //     WCAG 2.5.8). ⚠️ Mesuré sur le TÉMOIN d'avant le lot : 25 à 31 px sur
  //     presque tous les écrans. 44 px n'est donc PAS tenu aujourd'hui par les
  //     étoiles, et ce lot ne prétend pas le tenir (constat consigné au §25) ;
  //   · (44 px sur TAO au bureau — ce que `smoke-tao` exigeait, et ce que le témoin
  //     y mesurait (45) — n'a plus d'écran ici : voir la note ci-dessus. Le seuil
  //     de 44 px n'est donc plus exigé DANS ce harnais, et n'est pas perdu : il est
  //     exigé, sur RESHIRAM et ZEKROM, dans `smoke-imladrik-carto`.)
  const plancher = 24;
  verifier(`${cle} : chaque étoile se touche du doigt (≥ ${plancher} px)`, m.etoiles >= 2 && m.cibleMin >= plancher, `${m.cibleMin.toFixed(0)} px`);
  if (ecran.deuxRangs) {
    verifier(`${cle} : verrou — l'écran a deux rangs`, m.tetes >= 1 && m.feuilles >= 1, `${m.tetes} tête(s), ${m.feuilles} feuille(s)`);
    // UN RANG QUI SE VOIT, pas un rang qui se mesure : l'écart doit dépasser
    // ce que la perspective et le nombre de liens donnaient déjà sans lui
    // (mesuré sur la tête d'avant : 2,25 contre 1,91 sur GRIMA — 18 %).
    verifier(`${cle} : le rang se voit (tête ≥ 1,3 × feuille)`, m.tetes >= 1 && m.feuilles >= 1 && m.teteMin >= 1.3 * m.feuilleMax,
      `${m.teteMin.toFixed(2)} contre ${m.feuilleMax.toFixed(2)}`);
  }
  // A9-3 (§18.3) — LA FIGURE EST NOMMÉE, PAR LE FIL OU LE TITRE, PAS PAR UN CARTOUCHE.
  // Mesuré avant de construire : sur un menu, le moteur tait les noms de
  // constellation (`amasMuet`, `js/ciel.js`) parce que le titre et le fil les
  // disent mieux. Ils nomment donc la figure ; un cartouche de plus serait un
  // troisième nom pour la même chose.
  verifier(`${cle} : aucun nom de constellation peint sur un menu`, m.amasLus.length === 0, m.amasLus.join(','));
  if (ecran.fil) {
    verifier(`${cle} : le fil ou le titre nomme la figure`, m.ici.toUpperCase() === ecran.fil, `« ${m.ici} »`);
  }
}

// ===========================================================================
// LE CADRE D'UN IPHONE (03/11/2026) : Safari laisse environ 390 × 664 px à la page.
// La capture de Paul sur DEVIS & PAIEMENT n'était reproduite QU'À ce format (étoile de
// PAIEMENT ARTISAN posée dans « GÉNÉRATEUR DE DEVIS ») ; en 390 × 844 tout passait.
// Appliqué aux écrans ZOH, ceux dont cette capture a révélé le défaut.
const IPHONE = [390, 664, 'iphone'];
for (const ecran of ECRANS) {
  for (const taille of (ecran.iphone ? [...TAILLES, IPHONE] : TAILLES)) {
    const cle = taille[2] ? `${ecran.nom}@${taille[0]}x${taille[1]}` : `${ecran.nom}@${taille[0]}`;
    const { page, contexte } = await ouvrir(ecran, taille.slice(0, 2),
      taille[2] ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {});
    const m = await mesurer(page);
    if (!m) { await contexte.close(); verifier(`${cle} : la scène est peinte`, false, 'aucun .ciel-svg'); continue; }
    chiffres[cle] = { etoiles: m.etoiles, groupes: m.groupes, traits: `${m.visibles}/${m.traits}`,
      rang: m.tetes && m.feuilles ? `${m.teteMin.toFixed(2)}>${m.feuilleMax.toFixed(2)}` : '—', amas: m.amasLus };
    juger(cle, m, ecran);
    // L'EXTINCTION : l'état isolant éteint étoiles, liens et noms d'amas ; la
    // figure doit s'éteindre avec eux. Éprouvé sur la classe réelle, posée à la
    // main — l'état est transitoire (0,22 s) et un clic le raterait.
    if (taille[0] === 390 && !taille[2]) {
      const op = await page.evaluate(async () => {
        const scene = document.getElementById('ciel-noeud-scene');
        const g = scene.querySelector('.ciel-asterisme');
        if (!g) { return null; }
        scene.classList.add('ciel-scene--isolant');
        await new Promise((r) => setTimeout(r, 400));
        const o = +getComputedStyle(g).opacity;
        scene.classList.remove('ciel-scene--isolant');
        return o;
      });
      if (ecran.sansFigure) {
        // Pas de figure, donc rien à éteindre : `op === null` (aucun groupe). Le
        // témoin de l'instrument est la même branche sur les écrans à figure, où
        // `op` vaut 0 — un `null` ne se lit comme « absent » que parce qu'ailleurs
        // le groupe existe et s'éteint.
        verifier(`${cle} : aucune figure à éteindre (le groupe n'existe pas)`, op === null, String(op));
      } else {
        verifier(`${cle} : la figure s'éteint quand le ciel s'efface`, op === 0, String(op));
      }
    }
    await contexte.close();
  }
}

// ---- ALPHA, SESSION OUVERTE : le seul écran où le rang dit quelque chose de neuf ----
// RENOBOOST IA ne devient une tête qu'une fois la greffe Finubar posée (ses
// dépôts). On ouvre donc la racine avec l'agrégat de la maquette (contenu
// inventé), on pose une session d'essai, puis on isole ALPHA — le parcours de
// `smoke-socle`. La tête est IMPOSÉE par la fixture, qu'un verrou vérifie.
{
  const sousRenoboost = AGREGAT.projets.filter((p) => p.ciel === 'renoboost-ia').length;
  verifier('ALPHA session : verrou — la fixture greffe des dépôts sous RENOBOOST IA', sousRenoboost >= 1, `${sousRenoboost}`);
  for (const taille of TAILLES) {
    const cle = `ALPHA session@${taille[0]}`;
    const ecran = { nom: 'ALPHA session', fil: 'ALPHA', deuxRangs: true };
    const contexte = await navigateur.newContext({ viewport: { width: taille[0], height: taille[1] } });
    const page = await contexte.newPage();
    page.on('pageerror', (e) => erreurs.push(`${cle} pageerror: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') { erreurs.push(`${cle} console: ${m.text()}`); } });
    await page.route('**/api/**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: [] }) }));
    await page.route('**/api/cockpit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: {} }) }));
    await page.route('**/api/finubar', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, data: AGREGAT }) }));
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('.ciel-noeud-plateau.is-pret', { timeout: 20000 });
    await page.evaluate(() => {
      const el = document.getElementById('ecran-connexion');
      if (el) { el.hidden = true; el.style.display = 'none'; }
      document.querySelectorAll('[inert]').forEach((n) => n.removeAttribute('inert'));
    });
    await page.evaluate(() => window.UltimaBoussole.poserSession('jeton-d-essai'));
    await page.waitForTimeout(1200);
    await page.locator('#ciel-noeud-scene .ciel-etoile[data-noeud-id="alpha"] .ciel-zone').click({ force: true });
    await page.waitForTimeout(2200);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(600);
    const m = await mesurer(page, ['renoboost-ia']);
    await contexte.close();
    if (!m) { verifier(`${cle} : la scène est peinte`, false, 'aucun .ciel-svg'); continue; }
    chiffres[cle] = { etoiles: m.etoiles, traits: `${m.visibles}/${m.traits}`,
      rang: `${m.teteMin.toFixed(2)}>${m.feuilleMax.toFixed(2)}`, ici: m.ici };
    juger(cle, m, ecran);
  }
}

// ---- REDUCED-MOTION : rien de ce que le lot ajoute ne s'anime ----
// ⛔ PREMIER JET, VERT POUR RIEN (trouvé au dry run DR du 26/09) : il relevait
// les extrémités des traits à 1,5 s d'écart et concluait « immobile » — mais
// elles le sont AUSSI sans la préférence, la caméra une fois posée. Le contrôle
// ne pouvait pas échouer. Le seul mouvement que le lot ajoute est l'EXTINCTION
// de la figure (0,22 s) ; on la lit donc sous les DEUX préférences, et le
// témoin sans préférence doit voir la transition — sinon l'instrument est aveugle.
// (Choisis PAR NOM : l'index a glissé une fois quand un écran s'est inséré, et
// la boucle aurait éprouvé un autre écran sans le dire.)
for (const ecran of ['IMLADRIK', 'ALPHA'].map((n) => ECRANS.find((e) => e.nom === n))) {
  const lu = {};
  for (const rm of ['no-preference', 'reduce']) {
    const { page, contexte } = await ouvrir(ecran, [390, 844], { reducedMotion: rm });
    lu[rm] = await page.evaluate(async () => {
      const scene = document.getElementById('ciel-noeud-scene');
      const g = scene && scene.querySelector('.ciel-asterisme');
      if (!g) { return null; }
      scene.classList.add('ciel-scene--isolant');
      const cs = getComputedStyle(g);
      const r = { transition: cs.transitionDuration, animation: cs.animationName,
        traits: [...g.querySelectorAll('line')].map((l) => getComputedStyle(l).animationName) };
      scene.classList.remove('ciel-scene--isolant');
      return r;
    });
    await contexte.close();
  }
  const cle = `${ecran.nom} reduced-motion`;
  const t = lu['no-preference'], r = lu.reduce;
  verifier(`${cle} : témoin — sans la préférence, l'extinction s'anime`, !!t && t.transition !== '0s', t ? t.transition : 'aucune figure');
  verifier(`${cle} : avec la préférence, elle ne s'anime plus`, !!r && r.transition === '0s', r ? r.transition : 'aucune figure');
  verifier(`${cle} : aucune animation sur la figure ni ses traits`,
    !!r && r.traits.length >= 1 && r.animation === 'none' && r.traits.every((a) => a === 'none'),
    r ? `${r.animation} · ${r.traits.join(',')}` : 'aucune figure');
}

verifier('Zéro erreur console', erreurs.length === 0, JSON.stringify(erreurs.slice(0, 3)));
console.log('Mesures :', JSON.stringify(chiffres));
const ok = Object.values(verdicts).every((v) => v === true);
const rouges = Object.entries(verdicts).filter(([, v]) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
console.log(ok ? '\n=== SMOKE CARTE-CELESTE VERT ===' : '\n=== SMOKE CARTE-CELESTE ROUGE ===');
await navigateur.close();
process.exit(ok ? 0 : 1);
