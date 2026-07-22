// ABAQUE — moteur de calcul du simulateur de lancement d'entreprise (quadrant
// NICOL BOLAS). Boucle NB-1. Cadrage : CADRAGE-NICOL-BOLAS.md ; modèle proposé
// par data-ingenieur (2026-07-22), contre-passe Léo.
//
// Module ES PUR : aucune I/O, aucun DOM, aucune horloge (Date.now), aucun aléa
// (Math.random). `simuler(entrees)` est une fonction pure — mêmes entrées →
// mêmes sorties, prouvé au harnais (tests/unit-abaque.mjs).
//
// C'est une AIDE À LA DÉCISION paramétrique, JAMAIS un conseil comptable
// opposable. Tout taux FR ci-dessous est une HYPOTHÈSE par défaut modifiable,
// horodatée « à vérifier » (la réglementation bouge — esprit HÉRAUT/veille).
// Le front (NB-2) exposera chaque hypothèse en clair ; ici elles ne sont que des
// valeurs de repli si l'appelant ne les fournit pas.

// ————————————————————————————————————————————————————————————————
// Hypothèses par défaut FR — au 2026-07-22, À VÉRIFIER (voir §8 du cadrage)
// ————————————————————————————————————————————————————————————————
export const DEFAUTS = Object.freeze({
  dateHypotheses: '2026-07-22',
  horizonMois: 18,
  tresorerieInitiale: 0,
  statutJuridique: 'sasu',            // pilote le régime social du dirigeant
  tauxChargesPatronales: 0.42,        // assimilé-salarié [hyp. à vérifier]
  tauxChargesSalariales: 0.22,        // brut → net [hyp. à vérifier]
  tauxChargesDirigeantTns: 0.45,      // TNS, sur rémunération nette [hyp.]
  coefAnnualisation: 12.3,            // provisionne congés/13e (12,0 = strict mensuel)
  margeBruteCible: 0.35,              // [hyp. à instruire]
  delaiEncaissementJours: 45,
  delaiFournisseurJours: 30,
  delaiChargesJours: 25,
  chargesStructureMensuelles: 0,      // à saisir (assurances, local, compta…)
  margeSecurite: 0.20,                // coussin au-dessus du besoin de financement
  tauxActualisationAnnuel: 0.08,      // arbitrage achat/location [hyp.]
  moduleTva: false,
  tauxTvaCollectee: 0.20,
  tauxTvaDeductible: 0.20,
});

// Statuts reconnus → régime social du dirigeant. Changer de statut CHANGE la
// formule de charge du dirigeant (exigence Paul 2026-07-22 : « je dois pouvoir
// changer de statut pour voir, les données doivent s'adapter »).
const REGIME_PAR_STATUT = Object.freeze({
  sasu: 'assimile',
  sas: 'assimile',
  eurl_ir: 'tns',
  eurl_is: 'tns',
  ei: 'tns',
});

export function regimeDirigeant(statutJuridique) {
  return REGIME_PAR_STATUT[statutJuridique] || 'assimile';
}

// ————————————————————————————————————————————————————————————————
// Helpers déterministes
// ————————————————————————————————————————————————————————————————
function num(v, defaut) {
  return Number.isFinite(v) ? v : defaut;
}

// Valeur d'une série (tableau 1-indexé logiquement) à l'indice m ; hors bornes
// basses → 0 (aucun flux avant le mois 1). `serie` est indexé de 1 à H.
function valSerie(serie, m) {
  return (m >= 1 && m <= serie.length) ? serie[m - 1] : 0;
}

// Différé déterministe d'un flux de `delaiJours` : interpolation linéaire
// continue (testable), jamais d'horloge. Un flux du mois m arrive m + delai/30.
export function differe(serie, m, delaiJours) {
  const d = delaiJours / 30;
  const k = Math.floor(d);
  const f = d - k;
  return valSerie(serie, m - k) * (1 - f) + valSerie(serie, m - k - 1) * f;
}

// CA mensuel de base : scalaire → constant, vecteur → tel quel (complété/coupé
// à l'horizon). Saisonnalité normalisée (moyenne = 1) appliquée par mois civil.
function serieCa(entrees, H) {
  const base = entrees.caMensuel;
  const saison = normaliserSaison(entrees.saisonnalite);
  const out = [];
  for (let m = 1; m <= H; m++) {
    const caBase = Array.isArray(base) ? num(base[m - 1], 0) : num(base, 0);
    const coef = saison[(m - 1) % 12];
    out.push(caBase * coef);
  }
  return out;
}

function normaliserSaison(saison) {
  if (!Array.isArray(saison) || saison.length !== 12) { return Array(12).fill(1); }
  const somme = saison.reduce((s, x) => s + num(x, 0), 0);
  const moy = somme / 12;
  if (!(moy > 0)) { return Array(12).fill(1); }
  return saison.map((x) => num(x, 0) / moy);
}

// ————————————————————————————————————————————————————————————————
// Main d'œuvre : coût employeur, net, cotisations — dépend du STATUT
// ————————————————————————————————————————————————————————————————
// Retourne, par mois, les agrégats de main d'œuvre. Un poste dirigeant en régime
// TNS est chargé différemment d'un poste salarié / dirigeant assimilé-salarié.
export function mainDoeuvre(entrees) {
  const p = { ...DEFAUTS, ...entrees };
  const regime = regimeDirigeant(p.statutJuridique);
  const postes = Array.isArray(p.postes) ? p.postes : [];
  let coutEmployeur = 0;  // super-brut mensuel (= net + cotisations)
  let brut = 0;           // masse brute salariale (postes salariés + dirigeant assimilé)
  let net = 0;            // décaissé aux personnes (paie nette)
  let cotisations = 0;    // reversé à l'URSSAF/caisses (patronales + salariales, ou TNS)

  for (const poste of postes) {
    const nb = num(poste.nbEtp, 1);
    const mensuel = num(poste.brutMensuel, 0);
    const dirigeantTns = poste.estDirigeant === true && regime === 'tns';

    if (dirigeantTns) {
      // `brutMensuel` interprété comme rémunération NETTE du dirigeant TNS.
      const remun = nb * mensuel;
      const cot = remun * num(p.tauxChargesDirigeantTns, DEFAUTS.tauxChargesDirigeantTns);
      coutEmployeur += remun + cot;
      net += remun;
      cotisations += cot;
      // pas de « brut » salarial pour un TNS
    } else {
      const tauxPat = num(poste.tauxPatronal, p.tauxChargesPatronales);
      const tauxSal = num(poste.tauxSalarial, p.tauxChargesSalariales);
      const b = nb * mensuel;
      brut += b;
      net += b * (1 - tauxSal);
      cotisations += b * (tauxPat + tauxSal);   // TOUT ce qui part à l'URSSAF
      coutEmployeur += b * (1 + tauxPat);        // super-brut
    }
  }
  return {
    brutMensuel: brut,
    netMensuel: net,
    cotisationsMensuel: cotisations,   // URSSAF+caisses (patronales + salariales / TNS)
    coutEmployeurMensuel: coutEmployeur,
    chargeeAnnuelle: coutEmployeur * num(p.coefAnnualisation, DEFAUTS.coefAnnualisation),
  };
}

// Charges fixes du mois m (amortissements et loyers s'activent selon le mois).
function chargesFixes(entrees, mo, moisM) {
  const struct = num(entrees.chargesStructureMensuelles, DEFAUTS.chargesStructureMensuelles);
  let amort = 0;
  for (const inv of (entrees.investissements || [])) {
    const debut = num(inv.moisEngagement, 1);
    const duree = num(inv.dureeAmortMois, 0);
    if (duree > 0 && moisM >= debut && moisM < debut + duree) {
      amort += num(inv.montantHt, 0) / duree;
    }
  }
  let loyers = 0;
  for (const loc of (entrees.locations || [])) {
    if (moisM >= num(loc.moisDebut, 1)) { loyers += num(loc.mensualiteHt, 0); }
  }
  return mo.coutEmployeurMensuel + struct + amort + loyers;
}

// ————————————————————————————————————————————————————————————————
// simuler : la fonction pure principale
// ————————————————————————————————————————————————————————————————
export function simuler(entreesBrutes) {
  const entrees = { ...DEFAUTS, ...entreesBrutes };
  const H = Math.max(1, Math.min(24, Math.floor(num(entrees.horizonMois, DEFAUTS.horizonMois))));
  const marge = num(entrees.margeBruteCible, DEFAUTS.margeBruteCible);
  const mo = mainDoeuvre(entrees);

  const caHt = serieCa(entrees, H);
  const tvaCol = entrees.moduleTva ? num(entrees.tauxTvaCollectee, 0) : 0;
  const tvaDed = entrees.moduleTva ? num(entrees.tauxTvaDeductible, 0) : 0;
  const caTtc = caHt.map((x) => x * (1 + tvaCol));
  const achatsHt = caHt.map((x) => x * (1 - marge));
  const achatsTtc = achatsHt.map((x) => x * (1 + tvaDed));

  // Séries mensuelles de flux et d'exploitation.
  const cotisSerie = Array(H).fill(mo.cotisationsMensuel);
  const cf = [];
  const resultatExploitation = [];
  const caSeuil = [];
  const tresorerie = [];
  let treso = num(entrees.tresorerieInitiale, 0);
  let plancher = treso;
  let moisPointBas = 0;
  const margeInvalide = !(marge > 0);

  for (let m = 1; m <= H; m++) {
    const cfm = chargesFixes(entrees, mo, m);
    cf.push(cfm);
    const margeBrute = valSerie(caHt, m) * marge;
    resultatExploitation.push(margeBrute - cfm);
    caSeuil.push(margeInvalide ? null : cfm / marge);

    // Décaissements du mois m.
    const decaissPaie = mo.netMensuel;                                  // paie nette, J+0
    const decaissCotis = differe(cotisSerie, m, num(entrees.delaiChargesJours, 25));
    const decaissFourn = differe(achatsTtc, m, num(entrees.delaiFournisseurJours, 30));
    const decaissStruct = num(entrees.chargesStructureMensuelles, 0);
    let decaissLoyers = 0;
    for (const loc of (entrees.locations || [])) {
      if (m >= num(loc.moisDebut, 1)) {
        decaissLoyers += num(loc.mensualiteHt, 0) * (1 + (entrees.moduleTva ? num(loc.tauxTva, 0) : 0));
      }
    }
    let decaissInvest = 0;
    for (const inv of (entrees.investissements || [])) {
      if (m === num(inv.moisEngagement, 1)) {
        decaissInvest += num(inv.montantHt, 0) * (1 + (entrees.moduleTva ? num(inv.tauxTva, 0) : 0));
      }
    }
    // TVA nette due (module optionnel), décalée d'un mois (simplification v1).
    let decaissTva = 0;
    if (entrees.moduleTva) {
      const tvaNette = valSerie(caTtc, m - 1) - valSerie(caHt, m - 1)
        - (valSerie(achatsTtc, m - 1) - valSerie(achatsHt, m - 1));
      decaissTva = Math.max(0, tvaNette);
    }

    const encaissements = differe(caTtc, m, num(entrees.delaiEncaissementJours, 45));
    const decaissements = decaissPaie + decaissCotis + decaissFourn
      + decaissStruct + decaissLoyers + decaissInvest + decaissTva;

    treso += encaissements - decaissements;
    tresorerie.push(treso);
    if (treso < plancher) { plancher = treso; moisPointBas = m; }
  }

  // BFR de régime (indicateur de tension, au CA du dernier mois plein).
  const caHtFin = valSerie(caHt, H);
  const caTtcFin = valSerie(caTtc, H);
  const achatsTtcFin = valSerie(achatsTtc, H);
  const creancesClients = caTtcFin * (num(entrees.delaiEncaissementJours, 45) / 30);
  const dettesFournisseurs = achatsTtcFin * (num(entrees.delaiFournisseurJours, 30) / 30);
  const dettesSociales = mo.cotisationsMensuel * (num(entrees.delaiChargesJours, 25) / 30);
  const bfrRegime = creancesClients - dettesFournisseurs - dettesSociales;

  // Point mort d'exploitation : premier mois à partir duquel le résultat est
  // DURABLEMENT positif (≥ 0 pour tout mois suivant), pas un pic ponctuel.
  let moisPointMort = null;
  for (let m = 1; m <= H; m++) {
    let durable = true;
    for (let k = m; k <= H; k++) { if (resultatExploitation[k - 1] < 0) { durable = false; break; } }
    if (durable) { moisPointMort = m; break; }
  }

  const besoinFinancementMin = Math.max(0, -plancher);
  const coussinRecommande = besoinFinancementMin * (1 + num(entrees.margeSecurite, DEFAUTS.margeSecurite));

  return {
    horizonMois: H,
    margeInvalide,
    masseSalariale: {
      bruteMensuelle: mo.brutMensuel,
      chargeeMensuelle: mo.coutEmployeurMensuel,
      chargeeAnnuelle: mo.chargeeAnnuelle,
      cotisationsMensuelles: mo.cotisationsMensuel,   // URSSAF affiché à part
      netteMensuelle: mo.netMensuel,
    },
    chargesFixesMensuelles: cf,
    resultatExploitation,
    caSeuilMensuel: caSeuil,
    bfrRegime,
    tresorerie,
    tresoreriePlancher: plancher,
    moisDuPointBas: moisPointBas,
    besoinFinancementMin,
    coussinRecommande,
    moisPointMort,     // null = non atteint sur l'horizon
    avertissement: 'Aide à la décision non contractuelle — ne remplace pas un expert-comptable. '
      + `Hypothèses au ${entrees.dateHypotheses || DEFAUTS.dateHypotheses}, à vérifier.`,
  };
}

// ————————————————————————————————————————————————————————————————
// Arbitrage acheter vs louer un actif (ex. parc de clim VERTUMNE)
// ————————————————————————————————————————————————————————————————
// La CONTRAINTE DE CASH prime : si l'achat fait plonger la trésorerie plancher
// (option `impactPlancherAchat`/`impactPlancherLocation` fournis par l'appelant)
// alors que la location non, on loue quel que soit le coût actualisé.
export function arbitrageAchatLocation(actif) {
  const a = actif || {};
  const U = Math.max(1, Math.floor(num(a.dureeUsageMois, 12)));
  const i = Math.pow(1 + num(a.tauxActualisationAnnuel, DEFAUTS.tauxActualisationAnnuel), 1 / 12) - 1;

  const montant = num(a.montantTtc, 0);
  const revente = num(a.valeurReventeTtc, 0);
  const maintenance = num(a.maintenanceMensuelle, 0);
  const loyer = num(a.mensualiteLoyerTtc, 0);
  const depot = num(a.depotGarantieTtc, 0);

  let vanAchat = montant - revente / Math.pow(1 + i, U);
  let vanLocation = depot - depot / Math.pow(1 + i, U);
  for (let m = 1; m <= U; m++) {
    vanAchat += maintenance / Math.pow(1 + i, m);
    vanLocation += loyer / Math.pow(1 + i, m);
  }

  const denom = loyer - maintenance;
  const uBascule = denom > 0 ? (montant - revente) / denom : null;

  // 1) Contrainte de cash prioritaire (si l'appelant a chiffré les impacts).
  let reco;
  let motif;
  if (Number.isFinite(a.impactPlancherAchat) && Number.isFinite(a.impactPlancherLocation)
      && a.impactPlancherAchat < 0 && a.impactPlancherLocation >= 0) {
    reco = 'louer';
    motif = 'contrainte_cash';
  } else {
    // 2) Sinon, moindre coût actualisé sur la durée d'usage réelle.
    reco = vanLocation < vanAchat ? 'louer' : 'acheter';
    motif = 'cout_actualise';
  }

  return {
    vanAchat, vanLocation, uBascule, dureeUsageMois: U,
    recommandation: reco, motif,
  };
}
