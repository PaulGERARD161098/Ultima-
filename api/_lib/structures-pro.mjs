// Socle multi-structures professionnelles (Option A — Boucle 1).
// Module ES PUR : zéro I/O, zéro PII. Source unique des 3 structures pro
// (Renoboost IA, Sola Air Paris, AMO) et des validations fail-closed de
// l'API `/api/pro-pilotage` ainsi que du cloisonnement de Léo.

import { isUuid } from './validate.js';

export const VUE_DIRECTION = 'direction';

export const STRUCTURES_PRO = Object.freeze({
  'renoboost-ia': Object.freeze({
    id: 'renoboost-ia',
    nom: 'Renoboost IA',
    resume: 'Acquisition chantiers, devis et outils SaaS BTP.',
    rolePaul: 'Fondateur et pilotage produit / commercial.',
    liens: Object.freeze([
      { nom: 'RenoBoost', url: 'https://www.renoboostia.fr' },
      { nom: 'RenoDevis', url: 'https://relance-renoboostia.com/' },
      { nom: 'RenoAgenda', url: 'https://reno-agenda.vercel.app/' }
    ])
  }),
  'sola-air-paris': Object.freeze({
    id: 'sola-air-paris',
    nom: 'Sola Air Paris',
    resume: 'Entreprise de climatisation à Paris (marque SOLA, quatre associés).',
    rolePaul: 'Associé — coordination de chantier et structuration.',
    liens: Object.freeze([])
  }),
  amo: Object.freeze({
    id: 'amo',
    nom: 'AMO',
    resume: 'Assistance à Maîtrise d’Ouvrage — activité indépendante des autres structures.',
    rolePaul: 'Pilote AMO — suivi missions, dossiers et maîtres d’ouvrage.',
    liens: Object.freeze([])
  })
});

export const IDS_STRUCTURES_PRO = Object.freeze(Object.keys(STRUCTURES_PRO));
export const SCOPES_PRO = Object.freeze([VUE_DIRECTION, ...IDS_STRUCTURES_PRO]);

export const TYPES_TACHE = Object.freeze(['tache', 'relance', 'decision']);
export const PRIORITES_TACHE = Object.freeze(['haute', 'normale', 'basse']);
export const STATUTS_TACHE = Object.freeze(['a_faire', 'en_cours', 'bloque', 'fait']);

export const STATUTS_DOSSIER = Object.freeze(['actif', 'en_attente', 'clos']);
export const TYPES_DOCUMENT = Object.freeze([
  'compte_rendu',
  'preparation_reunion',
  'brouillon_mail',
  'synthese'
]);

const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function texteBorne(valeur, min, max) {
  if (typeof valeur !== 'string') return null;
  const propre = valeur.trim();
  if (propre.length < min || propre.length > max) return null;
  return propre;
}

function texteOptionnel(valeur, max) {
  if (valeur === undefined || valeur === null || valeur === '') return '';
  if (typeof valeur !== 'string') return null;
  const propre = valeur.trim();
  return propre.length <= max ? propre : null;
}

function dateOptionnelle(valeur) {
  if (valeur === undefined || valeur === null || valeur === '') return null;
  if (typeof valeur !== 'string') return false;
  const propre = valeur.trim();
  if (!DATE_ISO_RE.test(propre)) return false;
  const [a, m, j] = propre.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, j));
  if (d.getUTCFullYear() !== a || d.getUTCMonth() + 1 !== m || d.getUTCDate() !== j) {
    return false;
  }
  return propre;
}

export function estStructurePro(id) {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(STRUCTURES_PRO, id);
}

export function normaliserScopePro(scope) {
  if (typeof scope !== 'string') return null;
  const propre = scope.trim().toLowerCase();
  return SCOPES_PRO.includes(propre) ? propre : null;
}

export function normaliserStructurePro(id) {
  if (typeof id !== 'string') return null;
  const propre = id.trim().toLowerCase();
  return estStructurePro(propre) ? propre : null;
}

export function validerCreationTache(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return { erreur: 'Corps de tâche invalide' };
  }
  const structure_id = normaliserStructurePro(corps.structure_id);
  if (!structure_id) return { erreur: 'Structure professionnelle requise et reconnue' };

  const titre = texteBorne(corps.titre, 1, 160);
  if (!titre) return { erreur: 'Titre requis (1 à 160 caractères)' };

  const type = corps.type === undefined ? 'tache' : corps.type;
  if (!TYPES_TACHE.includes(type)) return { erreur: 'Type de tâche invalide' };

  const priorite = corps.priorite === undefined ? 'normale' : corps.priorite;
  if (!PRIORITES_TACHE.includes(priorite)) return { erreur: 'Priorité invalide' };

  const statut = corps.statut === undefined ? 'a_faire' : corps.statut;
  if (!STATUTS_TACHE.includes(statut)) return { erreur: 'Statut invalide' };

  const echeance = dateOptionnelle(corps.echeance);
  if (echeance === false) return { erreur: 'Échéance invalide (AAAA-MM-JJ)' };

  const contact_ref = texteOptionnel(corps.contact_ref, 120);
  if (contact_ref === null) return { erreur: 'Référence contact invalide (120 caractères max)' };

  const notes = texteOptionnel(corps.notes, 2000);
  if (notes === null) return { erreur: 'Notes invalides (2000 caractères max)' };

  return {
    donnees: {
      structure_id,
      titre,
      type,
      priorite,
      statut,
      echeance,
      contact_ref,
      notes
    }
  };
}

export function validerMajTache(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return { erreur: 'Corps de mise à jour invalide' };
  }
  if (!isUuid(corps.id)) return { erreur: 'Identifiant de tâche invalide' };
  const structure_id = normaliserStructurePro(corps.structure_id);
  if (!structure_id) return { erreur: 'Structure professionnelle requise' };

  const patch = {};
  if (Object.hasOwn(corps, 'titre')) {
    const titre = texteBorne(corps.titre, 1, 160);
    if (!titre) return { erreur: 'Titre invalide (1 à 160 caractères)' };
    patch.titre = titre;
  }
  if (Object.hasOwn(corps, 'type')) {
    if (!TYPES_TACHE.includes(corps.type)) return { erreur: 'Type de tâche invalide' };
    patch.type = corps.type;
  }
  if (Object.hasOwn(corps, 'priorite')) {
    if (!PRIORITES_TACHE.includes(corps.priorite)) return { erreur: 'Priorité invalide' };
    patch.priorite = corps.priorite;
  }
  if (Object.hasOwn(corps, 'statut')) {
    if (!STATUTS_TACHE.includes(corps.statut)) return { erreur: 'Statut invalide' };
    patch.statut = corps.statut;
  }
  if (Object.hasOwn(corps, 'echeance')) {
    const echeance = dateOptionnelle(corps.echeance);
    if (echeance === false) return { erreur: 'Échéance invalide (AAAA-MM-JJ)' };
    patch.echeance = echeance;
  }
  if (Object.hasOwn(corps, 'contact_ref')) {
    const contact_ref = texteOptionnel(corps.contact_ref, 120);
    if (contact_ref === null) return { erreur: 'Référence contact invalide' };
    patch.contact_ref = contact_ref;
  }
  if (Object.hasOwn(corps, 'notes')) {
    const notes = texteOptionnel(corps.notes, 2000);
    if (notes === null) return { erreur: 'Notes invalides' };
    patch.notes = notes;
  }

  if (Object.keys(patch).length === 0) {
    return { erreur: 'Aucun champ modifiable fourni' };
  }
  return { id: corps.id, structure_id, patch };
}

export function validerCreationDossier(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return { erreur: 'Corps de dossier invalide' };
  }
  const structure_id = normaliserStructurePro(corps.structure_id);
  if (!structure_id) return { erreur: 'Structure professionnelle requise et reconnue' };

  const titre = texteBorne(corps.titre, 1, 160);
  if (!titre) return { erreur: 'Titre de dossier requis (1 à 160 caractères)' };

  const statut = corps.statut === undefined ? 'actif' : corps.statut;
  if (!STATUTS_DOSSIER.includes(statut)) return { erreur: 'Statut de dossier invalide' };

  const synthese = texteOptionnel(corps.synthese, 4000);
  if (synthese === null) return { erreur: 'Synthèse invalide (4000 caractères max)' };

  const prochaine_action = texteOptionnel(corps.prochaine_action, 300);
  if (prochaine_action === null) return { erreur: 'Prochaine action invalide (300 caractères max)' };

  return {
    donnees: {
      structure_id,
      titre,
      statut,
      synthese,
      prochaine_action
    }
  };
}

export function validerMajDossier(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return { erreur: 'Corps de mise à jour invalide' };
  }
  if (!isUuid(corps.id)) return { erreur: 'Identifiant de dossier invalide' };
  const structure_id = normaliserStructurePro(corps.structure_id);
  if (!structure_id) return { erreur: 'Structure professionnelle requise' };

  const patch = {};
  if (Object.hasOwn(corps, 'titre')) {
    const titre = texteBorne(corps.titre, 1, 160);
    if (!titre) return { erreur: 'Titre de dossier invalide' };
    patch.titre = titre;
  }
  if (Object.hasOwn(corps, 'statut')) {
    if (!STATUTS_DOSSIER.includes(corps.statut)) return { erreur: 'Statut de dossier invalide' };
    patch.statut = corps.statut;
  }
  if (Object.hasOwn(corps, 'synthese')) {
    const synthese = texteOptionnel(corps.synthese, 4000);
    if (synthese === null) return { erreur: 'Synthèse invalide' };
    patch.synthese = synthese;
  }
  if (Object.hasOwn(corps, 'prochaine_action')) {
    const prochaine_action = texteOptionnel(corps.prochaine_action, 300);
    if (prochaine_action === null) return { erreur: 'Prochaine action invalide' };
    patch.prochaine_action = prochaine_action;
  }

  if (Object.keys(patch).length === 0) {
    return { erreur: 'Aucun champ modifiable fourni' };
  }
  return { id: corps.id, structure_id, patch };
}

export function validerCreationDocument(corps) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return { erreur: 'Corps de document invalide' };
  }
  const structure_id = normaliserStructurePro(corps.structure_id);
  if (!structure_id) return { erreur: 'Structure professionnelle requise et reconnue' };

  const type = corps.type;
  if (!TYPES_DOCUMENT.includes(type)) return { erreur: 'Type de document invalide' };

  const titre = texteBorne(corps.titre, 1, 160);
  if (!titre) return { erreur: 'Titre de document requis (1 à 160 caractères)' };

  const contenu = texteBorne(corps.contenu, 1, 20000);
  if (!contenu) return { erreur: 'Contenu requis (1 à 20000 caractères)' };

  let dossier_id = null;
  if (corps.dossier_id !== undefined && corps.dossier_id !== null && corps.dossier_id !== '') {
    if (!isUuid(corps.dossier_id)) return { erreur: 'Identifiant de dossier invalide' };
    dossier_id = corps.dossier_id;
  }

  return {
    donnees: {
      structure_id,
      dossier_id,
      type,
      titre,
      contenu
    }
  };
}

// Garde-fou défensif côté serveur : aucune ligne d'une autre structure ne sort
// jamais en vue structure, même en cas d'anomalie du client de stockage.
export function filtrerParStructure(lignes, structureId) {
  if (!estStructurePro(structureId) || !Array.isArray(lignes)) return [];
  return lignes.filter((ligne) => ligne && ligne.structure_id === structureId);
}

const POIDS_PRIORITE = { haute: 0, normale: 1, basse: 2 };

export function synthetiserDirection({ taches = [], dossiers = [], documents = [] } = {}, aujourdHui = new Date().toISOString().slice(0, 10)) {
  const parStructure = {};
  for (const id of IDS_STRUCTURES_PRO) {
    const meta = STRUCTURES_PRO[id];
    const t = taches.filter((x) => x && x.structure_id === id);
    const d = dossiers.filter((x) => x && x.structure_id === id);
    const doc = documents.filter((x) => x && x.structure_id === id);
    const ouvertes = t.filter((x) => x.statut !== 'fait');
    const relancesDues = ouvertes.filter(
      (x) => x.type === 'relance' && x.echeance && x.echeance <= aujourdHui
    );
    const bloquees = ouvertes.filter((x) => x.statut === 'bloque');
    const hautes = ouvertes.filter((x) => x.priorite === 'haute');

    parStructure[id] = {
      id: meta.id,
      nom: meta.nom,
      resume: meta.resume,
      compteurs: {
        taches_ouvertes: ouvertes.length,
        priorites_hautes: hautes.length,
        relances_dues: relancesDues.length,
        bloquees: bloquees.length,
        dossiers_actifs: d.filter((x) => x.statut === 'actif').length,
        documents: doc.length
      }
    };
  }

  // Top 10 des priorités transverses ouvertes, toujours explicitement étiquetées par structure.
  const prioritesTransverses = taches
    .filter((x) => x && estStructurePro(x.structure_id) && x.statut !== 'fait')
    .sort((a, b) => {
      const pa = POIDS_PRIORITE[a.priorite] ?? 9;
      const pb = POIDS_PRIORITE[b.priorite] ?? 9;
      if (pa !== pb) return pa - pb;
      const ea = a.echeance || '9999-12-31';
      const eb = b.echeance || '9999-12-31';
      return ea.localeCompare(eb);
    })
    .slice(0, 10)
    .map((x) => ({
      id: x.id,
      structure_id: x.structure_id,
      structure_nom: STRUCTURES_PRO[x.structure_id].nom,
      titre: x.titre,
      type: x.type,
      priorite: x.priorite,
      statut: x.statut,
      echeance: x.echeance || null
    }));

  return {
    scope: VUE_DIRECTION,
    structures: IDS_STRUCTURES_PRO.map((id) => parStructure[id]),
    priorites_transverses: prioritesTransverses
  };
}
