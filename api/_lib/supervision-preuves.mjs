// SUPERVISION ET RÉEMPLOI — le sas de MATIÈRE (étape 3).
//
// Léo cite des identifiants ; ce module les RETROUVE dans des sources qu'il ne
// peut pas écrire. Décisions de Paul du 31/10/2026 (zohshia/supervision-valeur/
// TECHNO.md §3) :
//   · preuves typées par préfixe : `zoh:<techno>`, `finubar:<propriétaire/dépôt>` ;
//   · objets supervisables : technos ZOH, dépôts Finubar, outils de Léo
//     (`leo:<outil>`) — un outil est un OBJET possible, jamais une preuve ;
//   · journaux écrits par Léo exclus : citer ses traces = fabriquer ses preuves.
//
// Ce qui est prouvé : l'EXISTENCE de chaque preuve et sa date de mesure côté
// serveur. Ce qui ne l'est pas : sa PERTINENCE pour l'objet. Paul reste le juge.
//
// Pur : les catalogues sont passés en argument (les routes les importent
// statiquement depuis `api/_lib/`, seul motif que le traceur Vercel embarque).
// Les erreurs ne recopient jamais un identifiant reçu : chemin et raison seuls.

const ID = /^(zoh|finubar|leo):([A-Za-z0-9][A-Za-z0-9._/-]{0,127})$/;
const TYPES_PREUVE = new Set(['zoh', 'finubar']);
const TYPES_OBJET = new Set(['zoh', 'finubar', 'leo']);
const JOUR_MS = 86_400_000;
const DATE_JOUR = /^\d{4}-\d{2}-\d{2}$/;

// Fraîcheur maximale par type, valeurs initiales (hypothèse du 31/10, à ajuster
// sur mesure) : un grain Finubar se lit à la semaine ; une fiche ZOH change au
// rythme de ses publications, au mois. Au-delà : RÉSERVE (`a_instruire`), pas
// refus — une preuve ancienne se présente, elle ne s'efface pas.
export const FRAICHEUR_MAX_MS = Object.freeze({ zoh: 30 * JOUR_MS, finubar: 7 * JOUR_MS });

const jourValide = (v) => typeof v === 'string' && DATE_JOUR.test(v) && Number.isFinite(Date.parse(`${v}T00:00:00Z`));

/**
 * Construit l'index des sources consultables, à partir des modules versionnés.
 * Une entrée sans date de mesure lisible n'est pas indexée : une preuve dont on
 * ignore l'âge ne peut pas être jugée fraîche.
 * @param {{ technos: {id:string}[], publie_le: string }} zoh   api/_lib/zohshia-technos.mjs
 * @param {{ projets: {depot:string, ok:boolean, mesure_le:string}[] }} finubar  api/_lib/finubar-macro.mjs
 * @param {string[]} outilsLeo  noms des outils du catalogue de Léo
 */
export function indexerCatalogues(zoh, finubar, outilsLeo) {
  const index = new Map();
  if (jourValide(zoh?.publie_le)) {
    for (const t of zoh?.technos ?? []) {
      if (typeof t?.id === 'string') index.set(`zoh:${t.id}`, { type: 'zoh', mesureLe: zoh.publie_le });
    }
  }
  for (const p of finubar?.projets ?? []) {
    if (p?.ok === true && typeof p.depot === 'string' && jourValide(p.mesure_le)) {
      index.set(`finubar:${p.depot}`, { type: 'finubar', mesureLe: p.mesure_le });
    }
  }
  for (const nom of outilsLeo ?? []) {
    if (typeof nom === 'string') index.set(`leo:${nom}`, { type: 'leo', mesureLe: null });
  }
  if (!index.size) throw new Error('supervision : aucun catalogue indexé');
  return index;
}

function typeDe(id) {
  const m = typeof id === 'string' ? ID.exec(id) : null;
  return m ? m[1] : null;
}

/**
 * Sas de matière. À appeler APRÈS le sas de forme (la proposition est un objet
 * conforme au contrat) et AVANT toute écriture.
 * @returns {{ valide: boolean, erreurs: string[], preuvesIds: string[],
 *             fraicheurMaxMsParSource: Record<string, number> }}
 *   `preuvesIds` : identifiants uniques triés (sources + dépendances +
 *   protections), tels que la base les recevra pour l'empreinte.
 */
export function verifierMatiere(proposition, index) {
  const erreurs = [];
  const fraicheur = Object.create(null);
  const p = proposition ?? {};

  const objet = typeDe(p.objetId);
  if (!objet || !TYPES_OBJET.has(objet)) erreurs.push('/objetId : type d’objet inconnu');
  else if (!index.has(p.objetId)) erreurs.push('/objetId : objet introuvable');

  const vus = new Set();
  const sources = Array.isArray(p.sources) ? p.sources : [];
  sources.forEach((s, i) => {
    const chemin = `/sources/${i}/id`;
    const id = s?.id;
    if (vus.has(id)) { erreurs.push(`${chemin} : preuve répétée`); return; }
    vus.add(id);
    const entree = controlerPreuve(id, chemin, erreurs, index);
    if (!entree) return;
    fraicheur[id] = FRAICHEUR_MAX_MS[entree.type];
    // Léo ne peut pas avoir observé un fait plus récent que sa mesure : une
    // observation déclarée après la fin du jour de mesure est une fraîcheur
    // inventée. (Plus ancienne : plus sévère pour lui, donc admise.)
    const obs = Date.parse(s.dateObservation);
    const finDuJour = Date.parse(`${entree.mesureLe}T00:00:00Z`) + JOUR_MS;
    if (!Number.isFinite(obs) || obs >= finDuJour) erreurs.push(`/sources/${i}/dateObservation : postérieure à la mesure de la source`);
  });

  for (const champ of ['preuveDependancesId', 'preuveProtectionsId']) {
    if (p[champ] === undefined) continue;
    if (controlerPreuve(p[champ], `/${champ}`, erreurs, index)) vus.add(p[champ]);
  }

  const preuvesIds = erreurs.length ? [] : [...vus].sort();
  return { valide: erreurs.length === 0, erreurs, preuvesIds, fraicheurMaxMsParSource: { ...fraicheur } };
}

function controlerPreuve(id, chemin, erreurs, index) {
  const type = typeDe(id);
  if (!type) { erreurs.push(`${chemin} : identifiant typé attendu (zoh: ou finubar:)`); return null; }
  if (!TYPES_PREUVE.has(type)) { erreurs.push(`${chemin} : type non admis comme preuve`); return null; }
  const entree = index.get(id);
  if (!entree) { erreurs.push(`${chemin} : preuve introuvable`); return null; }
  return entree;
}
