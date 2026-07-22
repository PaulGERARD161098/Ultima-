// Unitaires du moteur ABAQUE (simulateur de lancement NICOL BOLAS, boucle NB-1).
// Node pur, ZÉRO réseau, ZÉRO navigateur — modèle unit-carto-generee.mjs.
// Prouve les invariants du cadrage CADRAGE-NICOL-BOLAS.md §3/§6 :
//   - déterminisme (mêmes entrées → sorties identiques, zéro horloge/aléa),
//   - le STATUT JURIDIQUE est une entrée vivante (le changer recalcule les
//     charges du dirigeant — exigence Paul 2026-07-22),
//   - masse salariale chargée = net + cotisations (part salariale INCLUSE au
//     décaissement URSSAF : réserve de contre-passe corrigée dès NB-1),
//   - BFR, seuil de rentabilité, trésorerie plancher + besoin de financement,
//   - arbitrage achat/location (contrainte de cash prioritaire, coût actualisé),
//   - garde-fou marge ≤ 0 (aucune division, sortie « marge invalide »).
import { simuler, arbitrageAchatLocation, regimeDirigeant } from '../js/abaque.mjs';

const verdicts = {};
const proche = (a, b, eps = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= eps;

// ---------- 1. Masse salariale chargée = net + cotisations ----------
// 1 ETP, brut 2000, patronal 0,42, salarial 0,22 → super-brut 2840,
// net 1560, cotisations (patronales+salariales) 1280 ; 1560+1280 = 2840.
const sm = simuler({
  horizonMois: 3, statutJuridique: 'sasu',
  postes: [{ libelle: 'poseur', nbEtp: 1, brutMensuel: 2000, tauxPatronal: 0.42, tauxSalarial: 0.22 }],
});
verdicts.masseSalariale =
  proche(sm.masseSalariale.chargeeMensuelle, 2840) &&
  proche(sm.masseSalariale.netteMensuelle, 1560) &&
  proche(sm.masseSalariale.cotisationsMensuelles, 1280) &&
  proche(sm.masseSalariale.netteMensuelle + sm.masseSalariale.cotisationsMensuelles, 2840);

// ---------- 2. Le statut juridique est une entrée vivante ----------
// Même dirigeant (rémunération 3000) : SASU (assimilé) vs EI (TNS) → charges
// différentes. SASU : 3000×1,42 = 4260, cotis 3000×0,64 = 1920.
// EI (TNS) : 3000×1,45 = 4350, cotis 3000×0,45 = 1350.
const baseDir = { horizonMois: 3, postes: [{ libelle: 'gérant', nbEtp: 1, brutMensuel: 3000, estDirigeant: true }] };
const sasu = simuler({ ...baseDir, statutJuridique: 'sasu' });
const ei = simuler({ ...baseDir, statutJuridique: 'ei' });
verdicts.statutAdapte =
  regimeDirigeant('sasu') === 'assimile' && regimeDirigeant('ei') === 'tns' &&
  proche(sasu.masseSalariale.chargeeMensuelle, 4260) &&
  proche(ei.masseSalariale.chargeeMensuelle, 4350) &&
  proche(sasu.masseSalariale.cotisationsMensuelles, 1920) &&
  proche(ei.masseSalariale.cotisationsMensuelles, 1350) &&
  // le changement de statut CHANGE réellement les sorties
  !proche(sasu.masseSalariale.chargeeMensuelle, ei.masseSalariale.chargeeMensuelle);

// ---------- 3. BFR positif quand délai client > délai fournisseur ----------
// CA 10000, marge 0,35 → achats 6500 ; encaissement 60 j, fournisseur 30 j.
// créances 10000×2 = 20000 ; dettes fourn 6500×1 = 6500 ; BFR = 13500.
const sb = simuler({
  horizonMois: 6, caMensuel: 10000, margeBruteCible: 0.35,
  delaiEncaissementJours: 60, delaiFournisseurJours: 30, delaiChargesJours: 30,
});
verdicts.bfrPositif = proche(sb.bfrRegime, 13500);

// ---------- 4. Seuil de rentabilité + point mort durable ----------
// 1 poste brut 1000 (super-brut 1420 = CF/mois), marge 0,35.
// CA [3000×3, 5000×3] → résultat [-370×3, 330×3] → point mort au mois 4.
// CA seuil = 1420/0,35 ≈ 4057,14.
const sc = simuler({
  horizonMois: 6, margeBruteCible: 0.35,
  postes: [{ libelle: 'p', nbEtp: 1, brutMensuel: 1000, tauxPatronal: 0.42, tauxSalarial: 0.22 }],
  caMensuel: [3000, 3000, 3000, 5000, 5000, 5000],
});
verdicts.pointMort =
  sc.moisPointMort === 4 &&
  proche(sc.caSeuilMensuel[0], 1420 / 0.35) &&
  proche(sc.resultatExploitation[0], -370) && proche(sc.resultatExploitation[3], 330);

// ---------- 5. Trésorerie plancher + besoin de financement (capex sec) ----------
// Investissement 10000 au mois 1, rien d'autre → plancher -10000 au mois 1,
// besoin 10000, coussin 10000×1,2 = 12000.
const sd = simuler({
  horizonMois: 3, tresorerieInitiale: 0,
  investissements: [{ libelle: 'camion', montantHt: 10000, moisEngagement: 1, dureeAmortMois: 0 }],
});
verdicts.tresorerie =
  proche(sd.tresoreriePlancher, -10000) && sd.moisDuPointBas === 1 &&
  proche(sd.besoinFinancementMin, 10000) && proche(sd.coussinRecommande, 12000);

// ---------- 6. Déterminisme : deux appels → sorties identiques ----------
const e = {
  horizonMois: 12, tresorerieInitiale: 5000, statutJuridique: 'sasu', margeBruteCible: 0.4,
  postes: [{ libelle: 'a', nbEtp: 2, brutMensuel: 2200, estDirigeant: false }],
  investissements: [{ libelle: 'x', montantHt: 8000, moisEngagement: 2, dureeAmortMois: 36, tauxTva: 0.2 }],
  locations: [{ libelle: 'parc', mensualiteHt: 900, moisDebut: 1 }],
  caMensuel: [4000, 6000, 8000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000, 9000],
  saisonnalite: [1.4, 1.3, 1.1, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.1, 1.2, 1.1],
};
verdicts.deterministe = JSON.stringify(simuler(e)) === JSON.stringify(simuler(e));

// ---------- 7. Garde-fou marge ≤ 0 (aucune division, pas de crash) ----------
let margeOk = true;
try {
  const sg = simuler({ horizonMois: 3, margeBruteCible: 0, caMensuel: 5000 });
  margeOk = sg.margeInvalide === true && sg.caSeuilMensuel.every((x) => x === null);
} catch { margeOk = false; }
verdicts.margeInvalideGardee = margeOk;

// ---------- 8. Arbitrage : contrainte de cash prioritaire ----------
const ac = arbitrageAchatLocation({
  montantTtc: 10000, mensualiteLoyerTtc: 500, dureeUsageMois: 12,
  impactPlancherAchat: -5000, impactPlancherLocation: 0,
});
verdicts.arbitrageCash = ac.recommandation === 'louer' && ac.motif === 'contrainte_cash';

// ---------- 9. Arbitrage : moindre coût actualisé (U < U_bascule → louer) ----------
const al = arbitrageAchatLocation({
  montantTtc: 10000, valeurReventeTtc: 0, maintenanceMensuelle: 0,
  mensualiteLoyerTtc: 500, depotGarantieTtc: 0, dureeUsageMois: 12, tauxActualisationAnnuel: 0,
});
const aa = arbitrageAchatLocation({
  montantTtc: 10000, valeurReventeTtc: 0, maintenanceMensuelle: 0,
  mensualiteLoyerTtc: 500, depotGarantieTtc: 0, dureeUsageMois: 24, tauxActualisationAnnuel: 0,
});
verdicts.arbitrageCout =
  al.recommandation === 'louer' && al.motif === 'cout_actualise' && proche(al.uBascule, 20) &&
  aa.recommandation === 'acheter' && proche(aa.uBascule, 20);

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-ABAQUE OK' : 'UNIT-ABAQUE ECHEC');
process.exit(ok ? 0 : 1);
