// SUPERVISION ET RÉEMPLOI — la chaîne serveur d'une proposition (étape 5).
//
// Léo ne remplit QUE ce qu'elle sait dire : l'objet, la recommandation, le
// dossier en mots, et les identifiants des preuves. Tout ce qui se mesure est
// posé par le SERVEUR, jamais déclaré par elle (zéro confiance) :
//   · `id` de la proposition — tiré au hasard ici ;
//   · pour chaque preuve, `statut: 'mesure'`, la date de LECTURE (maintenant) et
//     la date d'OBSERVATION (le jour de mesure de la source, lu dans l'index) ;
//   · `transfertDonnees: false` pour une mutualisation — le transfert de
//     données est interdit par le contrat, il n'y a donc rien à lui demander ;
//   · la fraîcheur maximale par source (supervision-preuves.mjs).
//
// Puis les trois sas, dans l'ordre, et le premier refus arrête tout :
//   forme (contrat) → matière (preuves retrouvées) → logique (juge).
// Seul le statut `presentable` produit les arguments de `supervision_soumettre`.
// `a_instruire` (une réserve, par exemple une preuve périmée) est RENDU à Léo
// avec ses réserves, pas enregistré : c'est la règle du guide reçu.
//
// Pur : catalogues, horloge et tirage sont injectables ; aucun réseau, aucune base.
import { randomUUID } from 'node:crypto';
import schema from './supervision-contrat.mjs';
import { verifierForme } from './supervision-forme.mjs';
import { examinerProposition } from './supervision-juge.mjs';
import { verifierMatiere } from './supervision-preuves.mjs';

// L'INTERRUPTEUR — fermé par défaut, même règle que `LEO_ECRITURES_AUTO` : seule
// la valeur exacte 'active' sert l'outil à Léo et ouvre la soumission. Absente,
// vide ou mal tapée : coupé. Il ne s'ouvre qu'une fois la migration appliquée et
// le cockpit d'arbitrage en place (pilotage en back-office : le contrôle précède).
export function supervisionActive(env = process.env) {
  return env?.LEO_SUPERVISION === 'active';
}

// Les arguments de l'outil, à plat. `max` borne chaque texte comme le catalogue
// de Léo le fait pour tous ses outils. Les noms suivent le contrat.
export const ARGS_SUPERVISION = Object.freeze({
  objet: { max: 140, requis: true },
  recommandation: { max: 20, requis: true, enum: schema.properties.recommandation.enum },
  type_benefice: { max: 12, requis: true, enum: schema.properties.typeBenefice.enum },
  besoin: { max: 600, requis: true },
  beneficiaire: { max: 200, requis: true },
  constat: { max: 800, requis: true },
  consequence: { max: 600, requis: true },
  alternative_minimale: { max: 600, requis: true },
  gain_attendu: { max: 400, requis: true },
  preuve_attendue: { max: 400, requis: true },
  preuves: { max: 1200, requis: true },
  contrefactuel: { max: 600 },
  preuve_dependances: { max: 140 },
  preuve_protections: { max: 140 },
  retour_arriere: { max: 600 },
  capacite_commune: { max: 400 },
  compatibilite_verifiee: { max: 400 },
  reexamen_responsable: { max: 120, requis: true },
  reexamen_declencheur: { max: 300, requis: true },
  critere_poursuite: { max: 300, requis: true },
  critere_arret: { max: 300, requis: true },
});

const VERS_CONTRAT = {
  objet: 'objetId', recommandation: 'recommandation', type_benefice: 'typeBenefice',
  besoin: 'besoin', beneficiaire: 'beneficiaire', constat: 'constat', consequence: 'consequence',
  alternative_minimale: 'alternativeMinimale', gain_attendu: 'gainAttendu', preuve_attendue: 'preuveAttendue',
  contrefactuel: 'contrefactuel', preuve_dependances: 'preuveDependancesId', preuve_protections: 'preuveProtectionsId',
  retour_arriere: 'retourArriere', capacite_commune: 'capaciteCommune', compatibilite_verifiee: 'compatibiliteVerifiee',
};
const VERS_REEXAMEN = {
  reexamen_responsable: 'responsable', reexamen_declencheur: 'declencheur',
  critere_poursuite: 'criterePoursuite', critere_arret: 'critereArret',
};
const MAX_PREUVES = 20;
// Tabulation (\t), saut de ligne (\n) et retour chariot (\r) restent admis : on dicte des paragraphes.
const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

/** Arguments à plat → { ok, propres } ; même règle que validerProposition : rejet total. */
export function validerArgs(args) {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return { ok: false, erreurs: ['/ : objet attendu'] };
  const erreurs = [];
  const propres = {};
  for (const cle of Object.keys(args)) {
    const spec = Object.hasOwn(ARGS_SUPERVISION, cle) ? ARGS_SUPERVISION[cle] : undefined;
    // Le nom d'un champ inconnu n'est pas recopié : c'est une valeur reçue (revue S du 31/10).
    if (!spec) { erreurs.push('/ : champ non prévu'); continue; }
    const v = args[cle];
    if (typeof v !== 'string') { erreurs.push(`/${cle} : texte attendu`); continue; }
    if (v.length > spec.max) { erreurs.push(`/${cle} : texte trop long`); continue; }
    // Caractères de contrôle (dont U+0000, que PostgreSQL refuse en 22P05) : refusés ICI,
    // sinon la base répond en panne et le front croit l'écriture peut-être faite (revue S3).
    if (CONTROLE.test(v)) { erreurs.push(`/${cle} : caractère interdit`); continue; }
    const net = v.trim();
    if (!net) continue;
    if (spec.enum && !spec.enum.includes(net)) { erreurs.push(`/${cle} : valeur hors liste`); continue; }
    propres[cle] = net;
  }
  for (const [cle, spec] of Object.entries(ARGS_SUPERVISION)) {
    if (spec.requis && !propres[cle] && !erreurs.some((e) => e.startsWith(`/${cle} `))) erreurs.push(`/${cle} : requis`);
  }
  return erreurs.length ? { ok: false, erreurs } : { ok: true, propres };
}

/** Les identifiants de preuve dictés : séparés par espace, virgule ou point-virgule. */
export function decouperPreuves(texte) {
  return String(texte || '').split(/[\s,;]+/).filter(Boolean);
}

/**
 * Arguments validés → la proposition au format du contrat, complétée par le serveur.
 * Une preuve absente de l'index reçoit les dates de l'instant : le sas de
 * matière la refusera comme introuvable, sans qu'aucune date ne soit inventée.
 */
export function construireProposition(propres, { index, maintenant, tirer = randomUUID }) {
  const iso = new Date(maintenant).toISOString();
  const p = { id: `sup-${tirer()}` };
  for (const [cle, champ] of Object.entries(VERS_CONTRAT)) if (propres[cle] !== undefined) p[champ] = propres[cle];
  p.sources = decouperPreuves(propres.preuves).slice(0, MAX_PREUVES + 1).map((id) => {
    const entree = index.get(id);
    return {
      id,
      reference: entree ? `${entree.type === 'zoh' ? 'Fiche ZOH' : 'Grain Finubar'} ${id.slice(id.indexOf(':') + 1)}` : id,
      statut: 'mesure',
      dateLecture: iso,
      dateObservation: entree?.mesureLe ? `${entree.mesureLe}T00:00:00.000Z` : iso,
    };
  });
  if (p.recommandation === 'mutualiser') p.transfertDonnees = false;
  p.reexamen = {};
  for (const [cle, champ] of Object.entries(VERS_REEXAMEN)) if (propres[cle] !== undefined) p.reexamen[champ] = propres[cle];
  return p;
}

/**
 * La chaîne complète. → { ok: true, statut: 'presentable', rpc, proposition }
 *                     | { ok: false, etape, statut?, erreurs, reserves }
 * `rpc` : les arguments exacts de `public.supervision_soumettre`.
 */
export function preparerSoumission(args, { index, maintenant = Date.now(), tirer } = {}) {
  if (!index || typeof index.get !== 'function') throw new Error('supervision : index des preuves requis');
  const a = validerArgs(args);
  if (!a.ok) return { ok: false, etape: 'arguments', erreurs: a.erreurs, reserves: [] };
  const proposition = construireProposition(a.propres, { index, maintenant, tirer });

  const forme = verifierForme(proposition, schema);
  if (!forme.valide) return { ok: false, etape: 'forme', erreurs: forme.erreurs, reserves: [] };

  const matiere = verifierMatiere(proposition, index);
  if (!matiere.valide) return { ok: false, etape: 'matiere', erreurs: matiere.erreurs, reserves: [] };

  // ⛔ La date du contrôle est une chaîne ISO : `Date.now()` (un nombre) ferait
  // tout refuser — défaut n° 1 du guide reçu, verrouillé par test.
  const examen = examinerProposition(proposition, {
    maintenant: new Date(maintenant).toISOString(),
    fraicheurMaxMsParSource: matiere.fraicheurMaxMsParSource,
  });
  if (examen.statut !== 'presentable') {
    return { ok: false, etape: 'logique', statut: examen.statut, erreurs: examen.erreurs, reserves: examen.reserves };
  }
  return {
    ok: true,
    statut: 'presentable',
    proposition,
    rpc: {
      p_proposition_id: proposition.id,
      p_objet_id: proposition.objetId,
      p_recommandation: proposition.recommandation,
      p_preuves: matiere.preuvesIds,
      p_proposition: proposition,
    },
  };
}
