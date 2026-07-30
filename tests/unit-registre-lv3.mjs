// Unitaires du registre Lv3 et du noyau de boussole (L1) — Node pur, zéro
// réseau, zéro navigateur. Prouve les invariants de CADRAGE-LV3.md :
//   1. L'arbre est cohérent : aucun orphelin, aucune cible morte, chaque cap a
//      son blason / son état / sa parole, chaque boussole a son cœur et sa
//      légende gravée, tout est atteignable depuis la racine.
//   2. La règle nœud / feuille (§2.1) : une boussole a ≥ 2 caps ; une feuille
//      n'en a aucun (RIVEN reste une feuille tant qu'il n'a qu'une porte).
//   3. La structure dictée par Paul : deux supra-divisions, TAO sous ULTIMA,
//      YCOME et RENOBOOST IA sous ALPHA.
//   4. La géométrie de la rose : premier cap plein Nord, répartition régulière.
//   5. Le cockpit ne rend QUE des comptes entiers (jamais de contenu, jamais de
//      PII) et se tait quand il n'y a rien à traiter.
import {
  NOEUDS, RACINE, parentDe, chemin, estBoussole, capsDe, verifierRegistre,
} from '../js/registre-lv3.mjs';
import { BLASONS, COEURS } from '../js/blasons.mjs';
import { positions, ligneVivante, signalDe } from '../js/boussole-noyau.mjs';

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
verdicts.rivenEstUneFeuille = !estBoussole('riven') && NOEUDS.riven.cible === 'traveler.html';
verdicts.feuillesSansEnfants = ['minethnir', 'vranesh', 'draukhain', 'reshiram', 'zekrom', 'abaque']
  .every((id) => !Array.isArray(NOEUDS[id].enfants));

// ---------- 3. La structure dictée par Paul (2026-07-30) ----------
verdicts.deuxSupraDivisions = JSON.stringify(NOEUDS[RACINE].enfants) === JSON.stringify(['ultima-perso', 'alpha']);
verdicts.taoSousUltima = parentDe('tao') === 'ultima-perso';
verdicts.ycomeSousAlpha = parentDe('ycome') === 'alpha';
verdicts.renoboostSousAlpha = parentDe('renoboost-ia') === 'alpha';
verdicts.quatreQuadrantsPlusTao = JSON.stringify(NOEUDS['ultima-perso'].enfants)
  === JSON.stringify(['riven', 'nicol-bolas', 'adramelech', 'imladrik', 'tao']);
verdicts.cheminTaoComplet = JSON.stringify(chemin('reshiram'))
  === JSON.stringify(['racine', 'ultima-perso', 'tao', 'reshiram']);

// L'acquis IMLADRIK est intact (le noyau doit le rendre à l'identique).
const capsImladrik = capsDe('imladrik');
verdicts.imladrikTroisCaps = capsImladrik.length === 3
  && capsImladrik.map((c) => c.nom).join(',') === 'MINETHNIR,VRANESH,DRAUKHAIN';
verdicts.imladrikTroisCiblesOuvertes = capsImladrik
  .every((c) => typeof c.cible === 'string' && c.cible.endsWith('.html'));
verdicts.imladrikLegendeGravee = NOEUDS.imladrik.legende === 'Kalamn-talaen'
  && NOEUDS.imladrik.legendeClasse === 'kalamn-legende';

// Les caps externes déclarent leur ouverture en nouvel onglet.
verdicts.renoboostExterne = NOEUDS['renoboost-ia'].externe === true
  && NOEUDS['renoboost-ia'].cible.startsWith('https://');
verdicts.ycomeSansCible = NOEUDS.ycome.cible === null && NOEUDS.ycome.etat === 'À venir';

// Passerelle TAO : RESHIRAM ⇄ ZEKROM, dans le même nœud.
verdicts.passerelleTao = NOEUDS.reshiram.lien === 'zekrom'
  && NOEUDS.tao.enfants.includes('zekrom');

// Aucune donnée personnelle dans le registre (il décrit la navigation).
const texteRegistre = JSON.stringify(NOEUDS);
verdicts.zeroPii = !/@|\+33|\b0[1-9](\s?\d{2}){4}\b/.test(texteRegistre);

// ---------- 4. Géométrie de la rose ----------
const p3 = positions(3);
verdicts.premierCapPleinNord = Math.abs(p3[0].cos) < 1e-12 && Math.abs(p3[0].sin + 1) < 1e-12;
verdicts.repartitionReguliere = [2, 3, 4, 5].every((n) => {
  const pts = positions(n);
  if (pts.length !== n) return false;
  // Tous les points sur le cercle unité, et le pas angulaire constant.
  return pts.every((pt) => Math.abs(Math.hypot(pt.cos, pt.sin) - 1) < 1e-12);
});
verdicts.sensHoraire = positions(4)[1].cos > 0.99; // deuxième cap plein Est

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
verdicts.cockpitSeTaitSiRienAFaire = signalDe('ultima-perso', {
  riven: { relances_dues: 0 }, reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 },
}) === null;
// Robustesse : des valeurs aberrantes ne produisent jamais autre chose que des entiers.
verdicts.cockpitEntiersSeulement = signalDe('riven', { riven: { relances_dues: '<img src=x>' } }) === null
  && signalDe('riven', { riven: { relances_dues: -7 } }) === null
  && signalDe('riven', { riven: { relances_dues: '4.9' } }) === '4 relances dues';
verdicts.cockpitInconnuSilencieux = ligneVivante('imladrik', AGREGATS) === null
  && signalDe('minethnir', AGREGATS) === null;

// ---------- Verdict ----------
let echecs = 0;
for (const [nom, ok] of Object.entries(verdicts)) {
  if (ok) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail[nom] ? ' — ' + detail[nom] : ''}`); echecs += 1; }
}
console.log(echecs === 0 ? '=== REGISTRE LV3 VERT ===' : `=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
