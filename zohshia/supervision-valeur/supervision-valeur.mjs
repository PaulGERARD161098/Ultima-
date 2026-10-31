const RECOMMANDATIONS = new Set(["conserver", "mesurer", "ameliorer", "mutualiser", "simplifier", "suspendre", "proposer_retrait"]);
const TYPES_BENEFICE = new Set(["direct", "indirect", "protection", "personnel"]);
const STATUTS_SOURCE = new Set(["mesure", "declare", "infere", "non_verifie"]);
const texte = (v) => typeof v === "string" && v.trim().length > 0;
const liste = (v) => Array.isArray(v) ? v : [];
const dateValide = (v) => texte(v) && Number.isFinite(Date.parse(v));

export function examinerProposition(proposition, contexte) {
  const erreurs = []; const reserves = [];
  if (!proposition || typeof proposition !== "object") return { statut: "a_completer", erreurs: ["Proposition invalide."], reserves, executionAutorisee: false };
  const p = proposition; const c = contexte ?? {}; const maintenant = Date.parse(c.maintenant);
  if (!Number.isFinite(maintenant)) return { statut: "a_completer", erreurs: ["Date contrôle absente/invalide."], reserves: [], executionAutorisee: false };
  if (!texte(p.id) || !texte(p.objetId)) erreurs.push("ID proposition/objet requis.");
  for (const champ of ["besoin", "beneficiaire", "constat", "consequence", "alternativeMinimale", "gainAttendu", "preuveAttendue"]) {
    if (!texte(p[champ])) erreurs.push(`Requis: ${champ}`);
  }
  if (!RECOMMANDATIONS.has(p.recommandation)) erreurs.push("Recommandation inconnue.");
  if (!TYPES_BENEFICE.has(p.typeBenefice)) erreurs.push("Bénéfice à préciser.");
  const sources = liste(p.sources);
  if (sources.length === 0) erreurs.push("Aucune source.");
  for (const source of sources) {
    if (!source || typeof source !== "object") { erreurs.push("Source null/invalide."); continue; }
    if (!texte(source.id) || !texte(source.reference)) erreurs.push("Source sans ID/ref.");
    if (!STATUTS_SOURCE.has(source.statut)) erreurs.push("Statut source invalide.");
    if (!dateValide(source.dateLecture) || !dateValide(source.dateObservation)) { erreurs.push("Dates invalides."); continue; }
    const obs = Date.parse(source.dateObservation); const lect = Date.parse(source.dateLecture);
    if (obs > lect || lect > maintenant) erreurs.push("Chronologie future/inversée.");
    const maxAge = c.fraicheurMaxMsParSource?.[source.id];
    if (!Number.isFinite(maxAge) || maxAge < 0) reserves.push(`Fraîcheur NC: ${source.id}`);
    else if (maintenant - obs > maxAge) reserves.push(`Périmée: ${source.id}`);
    if (source.statut !== "mesure") reserves.push(`Non mesurée: ${source.id}`);
  }
  if (["suspendre", "proposer_retrait"].includes(p.recommandation)) {
    if (!texte(p.contrefactuel)) erreurs.push("Contrefactuel requis.");
    if (!texte(p.preuveDependancesId)) erreurs.push("ID preuve dépendances manquant.");
    if (!texte(p.preuveProtectionsId)) erreurs.push("ID preuve protections manquant.");
    if (!texte(p.retourArriere)) erreurs.push("Réversibilité requise.");
  }
  if (p.recommandation === "mutualiser") {
    if (!texte(p.capaciteCommune) || !texte(p.compatibiliteVerifiee)) erreurs.push("Compatibilité non étayée.");
    if (p.transfertDonnees !== false) erreurs.push("Transfert données interdit.");
  }
  const decision = p.reexamen;
  if (!decision || !texte(decision.responsable) || !texte(decision.declencheur) || !texte(decision.criterePoursuite) || !texte(decision.critereArret)) erreurs.push("Réexamen incomplet.");
  return { statut: erreurs.length ? "a_completer" : reserves.length ? "a_instruire" : "presentable", erreurs: [...new Set(erreurs)], reserves: [...new Set(reserves)], executionAutorisee: false };
}
