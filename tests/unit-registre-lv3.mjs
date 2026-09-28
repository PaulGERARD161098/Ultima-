// Unitaires du registre Lv3 et du cockpit — Node pur, zéro réseau, zéro
// navigateur. Prouve les invariants de CADRAGE-LV3.md :
//   1. L'arbre est cohérent : aucun orphelin, aucune cible morte, chaque cap a
//      son blason / son état / sa parole, chaque boussole a son cœur et sa
//      légende gravée, tout est atteignable depuis la racine.
//   2. La règle nœud / feuille (§2.1) : une boussole a ≥ 2 caps ; une feuille
//      n'en a aucun (RIVEN reste une feuille tant qu'il n'a qu'une porte).
//   3. La structure dictée par Paul : deux supra-divisions, TAO sous ULTIMA,
//      RENOBOOST IA, DOKLĚS et SYMPHO sous ALPHA (YCOME retiré le 28/09).
//   4. (Géométrie de la rose : ABANDONNÉE le 2026-08-19 — voir la section 4.)
//   5. Le cockpit ne rend QUE des comptes entiers (jamais de contenu, jamais de
//      PII) et se tait quand il n'y a rien à traiter.
import {
  NOEUDS, RACINE, parentDe, chemin, estBoussole, capsDe, verifierRegistre,
} from '../js/registre-lv3.mjs';
import { BLASONS, COEURS } from '../js/blasons.mjs';
// `ligneVivante`/`signalDe` vivent dans js/cockpit-parole.mjs depuis leur
// extraction du noyau (2026-08-13) ; l'import passait encore par le ré-export
// du noyau, supprimé en P5c — on importe désormais À LA SOURCE.
import { ligneVivante, signalDe } from '../js/cockpit-parole.mjs';

const verdicts = {};
const detail = {};

// ---------- 1. Cohérence globale de l'arbre ----------
const anomalies = verifierRegistre(NOEUDS, BLASONS, COEURS);
verdicts.registreSain = anomalies.length === 0;
detail.registreSain = anomalies.slice(0, 5).join(' | ');

// ---------- 2. Règle nœud / feuille ----------
verdicts.boussolesOntAuMoinsDeuxCaps = Object.keys(NOEUDS)
  .filter((id) => Array.isArray(NOEUDS[id].enfants))
  .every((id) => estBoussole(id));
verdicts.rivenEstUneFeuille = !estBoussole('riven') && NOEUDS.riven.cible === 'riven.html';
verdicts.feuillesSansEnfants = ['maedrethnir', 'vranesh', 'draukhain', 'reshiram', 'zekrom', 'abaque']
  .every((id) => !Array.isArray(NOEUDS[id].enfants));

// ---------- 3. La structure dictée par Paul (2026-07-30) ----------
// 2026-08-07 : la racine porte les deux supra-divisions ET ALTHEA. Paul l'a
// corrigé de vive voix (« je veux althea ici ») : « 3ᵉ cadran d'Ultima Lv3 »
// désignait cet écran-ci, pas la supra-division qui porte le même nom.
verdicts.racineDeuxSupraPlusAlthea = JSON.stringify(NOEUDS[RACINE].enfants)
  === JSON.stringify(['ultima-perso', 'alpha', 'althea']);
verdicts.taoSousNaga = parentDe('tao') === 'naga'
  && chemin('tao')[1] === 'ultima-perso'; // TAO reste sous ULTIMA, via NAGA
// YCOME RETIRÉ (Paul, 28/09 : « je ne travaille plus pour lui ») — cadrage
// CADRAGE-2026-09-28-retrait-ycome.md. Le nœud disparaît, ALPHA garde trois
// caps, et plus aucune phrase de Léo n'en parle.
verdicts.ycomeRetire = !('ycome' in NOEUDS) && !NOEUDS.alpha.enfants.includes('ycome');
verdicts.alphaTroisCaps = JSON.stringify(NOEUDS.alpha.enfants)
  === JSON.stringify(['renoboost-ia', 'dokles', 'sympho']);
verdicts.alphaNeParlePlusDYcome = !/ycome/i.test(JSON.stringify(NOEUDS));
verdicts.renoboostSousAlpha = parentDe('renoboost-ia') === 'alpha';
verdicts.cheminTaoComplet = JSON.stringify(chemin('reshiram'))
  === JSON.stringify(['racine', 'ultima-perso', 'naga', 'tao', 'reshiram']);

// ---------- 3 bis. Les cadrans d'ULTIMA ----------
// 2026-08-01 : deux macro-quadrants — GRIMA « Ce qui est utile » (RIVEN, NICOL
// BOLAS) et NAGA « Ce qui fait grandir » (IMLADRIK, ADRAMELECH, TAO), chacun
// une vraie boussole avec sa coque.
// 2026-08-06 : Paul ajoute ALTHEA — « tout seul : c'est un autre système, c'est
// plutôt un jeu qu'autre chose ».
// 2026-08-07 : il le REMONTE À LA RACINE. Sous ULTIMA, il était subordonné au
// personnel ; à la racine il n'est subordonné à rien, ce qui est exactement ce
// que « tout seul » voulait dire. ULTIMA retrouve donc ses DEUX macro-quadrants.
verdicts.ultimaDeuxCadrans = JSON.stringify(NOEUDS['ultima-perso'].enfants)
  === JSON.stringify(['grima', 'naga']);
// Éprouvé par l'ABSENCE autant que par la présence : ALTHEA pend à la racine, et
// ne se retrouve sous AUCUN autre nœud. Vérifier son seul parent ne suffirait
// pas — un doublon ailleurs dans l'arbre passerait au travers.
verdicts.altheaNePendQuALaRacine = parentDe('althea') === RACINE
  && Object.keys(NOEUDS)
    .filter((id) => id !== RACINE && Array.isArray(NOEUDS[id].enfants))
    .every((id) => !NOEUDS[id].enfants.includes('althea'));
// ALTHEA n'a qu'une porte → il reste une FEUILLE (règle §2.1 : est une boussole
// tout nœud qui a au moins DEUX enfants). Le jour où un second cap naît (le
// cadran en grand, le palmarès), il prendra la forme boussole sans rien casser.
verdicts.altheaEstUneFeuille = !NOEUDS.althea.enfants
  && NOEUDS.althea.cible === 'althea.html'
  && Boolean(NOEUDS.althea.blason);
// Un seul geste depuis l'accueil : c'est la raison d'être de la remontée.
verdicts.cheminAlthea = JSON.stringify(chemin('althea'))
  === JSON.stringify(['racine', 'althea']);
verdicts.grimaRegroupeUtile = JSON.stringify(NOEUDS.grima.enfants)
  === JSON.stringify(['riven', 'nicol-bolas'])
  && NOEUDS.grima.cible === 'grima.html' && estBoussole('grima');
verdicts.nagaRegroupeCroissance = JSON.stringify(NOEUDS.naga.enfants)
  === JSON.stringify(['imladrik', 'adramelech', 'tao'])
  && NOEUDS.naga.cible === 'naga.html' && estBoussole('naga');
verdicts.devisesDesCadrans = NOEUDS.grima.etat === 'Ce qui est utile'
  && NOEUDS.grima.surligne === 'Ce qui est utile'
  && NOEUDS.naga.etat === 'Ce qui fait grandir'
  && NOEUDS.naga.surligne === 'Ce qui fait grandir';
verdicts.cheminsParMacroQuadrant = parentDe('riven') === 'grima'
  && parentDe('nicol-bolas') === 'grima'
  && parentDe('imladrik') === 'naga'
  && parentDe('adramelech') === 'naga'
  && parentDe('tao') === 'naga';

// Le surligné des supra-divisions porte leur nom, plus « le personnel /
// le professionnel » (dicté par Paul le 2026-08-01).
verdicts.surlignesSupraDivisions = NOEUDS['ultima-perso'].surligne === 'Supra-division Ultima'
  && NOEUDS.alpha.surligne === 'Supra-division Alpha';

// L'acquis IMLADRIK est intact (le noyau doit le rendre à l'identique).
const capsImladrik = capsDe('imladrik');
verdicts.imladrikTroisCaps = capsImladrik.length === 3
  && capsImladrik.map((c) => c.nom).join(',') === 'MAEDRETHNIR,VRANESH,DRAUKHAIN';
verdicts.imladrikTroisCiblesOuvertes = capsImladrik
  .every((c) => typeof c.cible === 'string' && c.cible.endsWith('.html'));
verdicts.imladrikLegendeGravee = NOEUDS.imladrik.legende === 'Kalamn-talaen'
  && NOEUDS.imladrik.legendeClasse === 'kalamn-legende';

// Les caps externes déclarent leur ouverture en nouvel onglet.
verdicts.renoboostExterne = NOEUDS['renoboost-ia'].externe === true
  && NOEUDS['renoboost-ia'].cible.startsWith('https://');
// Les ÉTOILES D'ATTENTE (sans page) : la garantie portée jadis par YCOME est
// reportée sur DOKLĚS et SYMPHO — elle ne part pas avec lui.
verdicts.etoilesDAttenteSansCible = ['dokles', 'sympho']
  .every((id) => NOEUDS[id] && NOEUDS[id].cible === null && NOEUDS[id].etat === 'À venir');

// Passerelle TAO : RESHIRAM ⇄ ZEKROM, dans le même nœud.
verdicts.passerelleTao = NOEUDS.reshiram.lien === 'zekrom'
  && NOEUDS.tao.enfants.includes('zekrom');

// Aucune donnée personnelle dans le registre (il décrit la navigation).
const texteRegistre = JSON.stringify(NOEUDS);
verdicts.zeroPii = !/@|\+33|\b0[1-9](\s?\d{2}){4}\b/.test(texteRegistre);

// ---------- 4. Géométrie de la rose — ABANDONNÉE (P5c, 2026-08-19) ----------
// `positions()` vivait dans js/boussole-noyau.mjs, SUPPRIMÉ avec la dernière
// rose : VRANESH, son ultime appelant, est passé au ciel (arbitrage C du
// cadrage LV5 §3.3) — vérifié par grep avant suppression, plus aucune page ne
// chargeait le noyau. La trigonométrie de la rose est morte avec elle : le
// ciel a sa PROPRE géométrie, éprouvée par tests/smoke-lv4-ciel.mjs (cadrage
// serré, couronne, débordements) et par le pire cas construit couronne(12) de
// tests/smoke-vranesh.mjs §K. Verdicts retirés : premierCapPleinNord,
// repartitionReguliere, sensHoraire.

// ---------- 5. Cockpit : des comptes, rien d'autre ----------
const AGREGATS = {
  riven: { relances_dues: 3 },
  reshiram: { talents: 5, a_etayer: 2 },
  zekrom: { ideaux: 3, a_orienter: 1, acquis: 4, a_construire: 2 },
};
verdicts.cockpitMuetSansDonnee = ligneVivante('tao', null) === null && signalDe('tao', null) === null;
verdicts.cockpitTaoAgrege = /5 talents réels · 2 à étayer — 3 idéaux · 1 à orienter\./.test(ligneVivante('tao', AGREGATS));
verdicts.cockpitSupraCumule = signalDe('ultima-perso', AGREGATS)
  === '3 relances dues · 2 talents à étayer · 1 idéal à orienter';
verdicts.cockpitRivenSeul = signalDe('riven', AGREGATS) === '3 relances dues';
// Chaque macro-quadrant ne cumule que les siens : GRIMA les relances de RIVEN,
// NAGA les comptes de TAO (RESHIRAM + ZEKROM).
verdicts.cockpitGrimaCumuleUtile = signalDe('grima', AGREGATS) === '3 relances dues';
verdicts.cockpitNagaCumuleCroissance = signalDe('naga', AGREGATS)
  === '2 talents à étayer · 1 idéal à orienter';
verdicts.cockpitSeTaitSiRienAFaire = signalDe('ultima-perso', {
  riven: { relances_dues: 0 }, reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 },
}) === null;
// Robustesse : des valeurs aberrantes ne produisent jamais autre chose que des entiers.
verdicts.cockpitEntiersSeulement = signalDe('riven', { riven: { relances_dues: '<img src=x>' } }) === null
  && signalDe('riven', { riven: { relances_dues: -7 } }) === null
  && signalDe('riven', { riven: { relances_dues: '4.9' } }) === '4 relances dues';
verdicts.cockpitInconnuSilencieux = ligneVivante('imladrik', AGREGATS) === null
  && signalDe('maedrethnir', AGREGATS) === null;

// ---------- Verdict ----------
let echecs = 0;
for (const [nom, ok] of Object.entries(verdicts)) {
  if (ok) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail[nom] ? ' — ' + detail[nom] : ''}`); echecs += 1; }
}
console.log(echecs === 0 ? '=== REGISTRE LV3 VERT ===' : `=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
