// Les mains de Léo (boucle L2b) — outils du tool use de /api/leo.
// Briques PURES sauf les exécuteurs (qui reçoivent le client RLS de Paul en
// paramètre — jamais créé ici). Règles du cadrage (CADRAGE-LEO-SITE §2-3bis) :
//  - LECTURE : exécutée en direct dans la boucle serveur (lectures libres) ;
//  - ÉCRITURE : JAMAIS exécutée par l'IA — la route renvoie une proposition
//    d'action, l'exécution n'a lieu que sur confirmation explicite de Paul,
//    revalidée par les MÊMES validateurs que les endpoints CRUD (parité) et
//    sous son JWT (RLS — même autorité que les API directes, aucune escalade).
//  - Aucune suppression en v1.

import {
  validateIdee,
  validateJournal,
  validateBesoinIntendant
} from './validate.js';
import { computeAlertesJ2 } from './intendant.js';

// ---------- Définitions (format tools de l'API Claude) ----------

export const OUTILS_LECTURE = ['lire_idees', 'lire_intendant'];
export const OUTILS_ECRITURE = ['creer_idee', 'ecrire_journal', 'ajouter_besoin'];

export const DEFINITIONS_OUTILS = [
  {
    name: 'lire_idees',
    description: "Lit le registre ADRAMELECH : la liste des idées de Paul " +
      '(numéro, nom, type, thème, statut, essence) et les ponts entre elles. ' +
      'À utiliser avant de parler des idées — jamais de mémoire.',
    input_schema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'lire_intendant',
    description: "Lit le dossier INTENDANT : chantiers pilotés (date de pose), " +
      'besoins avec leur état (couvert / commande en attente / manquant) et ' +
      'alertes J-2 (manquants à moins de 2 jours de la pose).',
    input_schema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'creer_idee',
    description: "Propose la capture d'une idée nouvelle au registre " +
      "ADRAMELECH. L'idée n'est PAS créée directement : Paul confirme " +
      "d'abord. Reformule fidèlement ce qu'il a dicté (la dictée vocale " +
      'déforme des mots). Le numéro (adr_num) est attribué par le serveur.',
    input_schema: {
      type: 'object',
      properties: {
        nom: { type: 'string', description: "Nom court de l'idée (1-120 caractères)" },
        type: { type: 'string', description: "Type (ex. business, produit, perso — 1-60 caractères)" },
        theme: { type: 'string', description: 'Thème (optionnel, ≤ 200 caractères)' },
        essence: { type: 'string', description: "L'idée reformulée en quelques phrases (optionnel, ≤ 2000 caractères)" }
      },
      required: ['nom', 'type'],
      additionalProperties: false
    }
  },
  {
    name: 'ecrire_journal',
    description: 'Propose une entrée au journal « où j\'en suis » de TRAVELER ' +
      'sur un contact (nœud) du réseau, avec éventuellement une relance ' +
      "planifiée. Paul confirme avant écriture. L'identifiant du contact " +
      'vient des lectures — jamais inventé.',
    input_schema: {
      type: 'object',
      properties: {
        node_id: { type: 'string', description: 'UUID du contact (issu des données, jamais inventé)' },
        note: { type: 'string', description: 'La note (1-2000 caractères)' },
        prochaine_etape: { type: 'string', description: 'Prochaine étape (optionnel, ≤ 500 caractères ; requise si relance)' },
        relance_at: { type: 'string', description: 'Date de relance YYYY-MM-DD (optionnel)' }
      },
      required: ['node_id', 'note'],
      additionalProperties: false
    }
  },
  {
    name: 'ajouter_besoin',
    description: "Propose l'ajout d'un besoin (matériel/fourniture) à la " +
      "check-list INTENDANT d'un chantier. Paul confirme avant écriture. " +
      "L'identifiant du chantier vient de lire_intendant — jamais inventé.",
    input_schema: {
      type: 'object',
      properties: {
        chantier_id: { type: 'string', description: 'UUID du chantier INTENDANT (issu de lire_intendant)' },
        designation: { type: 'string', description: 'Le besoin (1-200 caractères)' },
        quantite: { type: 'number', description: 'Quantité (> 0, optionnel)' },
        unite: { type: 'string', description: 'Unité (optionnel, ≤ 20 caractères)' }
      },
      required: ['chantier_id', 'designation'],
      additionalProperties: false
    }
  }
];

export function estOutilLecture(nom) {
  return OUTILS_LECTURE.includes(nom);
}

export function estOutilEcriture(nom) {
  return OUTILS_ECRITURE.includes(nom);
}

// ---------- Validation d'une action d'écriture (parité CRUD) ----------

// Ne garde QUE les champs du schéma (strip) puis passe le validateur de
// l'endpoint correspondant. → { ok:true, valeurs } | { ok:false, erreur }.
export function validerAction(outil, args) {
  if (!args || typeof args !== 'object' || Array.isArray(args)) {
    return { ok: false, erreur: 'arguments_invalides' };
  }
  if (outil === 'creer_idee') {
    const garde = {};
    for (const champ of ['nom', 'type', 'theme', 'essence']) {
      if (args[champ] !== undefined) garde[champ] = args[champ];
    }
    // adr_num serveur : validé ici avec un jeton provisoire, réattribué à
    // l'exécution (numéro suivant réel du registre).
    const { value, error } = validateIdee({ ...garde, adr_num: 1 }, 'create');
    if (error) return { ok: false, erreur: error };
    delete value.adr_num;
    return { ok: true, valeurs: value };
  }
  if (outil === 'ecrire_journal') {
    const garde = {};
    for (const champ of ['node_id', 'note', 'prochaine_etape', 'relance_at']) {
      if (args[champ] !== undefined) garde[champ] = args[champ];
    }
    const { value, error } = validateJournal(garde, 'create');
    if (error) return { ok: false, erreur: error };
    return { ok: true, valeurs: value };
  }
  if (outil === 'ajouter_besoin') {
    const garde = {};
    for (const champ of ['chantier_id', 'designation', 'quantite', 'unite']) {
      if (args[champ] !== undefined) garde[champ] = args[champ];
    }
    const { value, error } = validateBesoinIntendant(garde, 'create');
    if (error) return { ok: false, erreur: error };
    return { ok: true, valeurs: value };
  }
  return { ok: false, erreur: 'outil_inconnu' };
}

// ---------- Résumé humain d'une action (la plaque de confirmation) ----------

function tronque(texte, max) {
  return texte.length > max ? texte.slice(0, max) + '…' : texte;
}

// La plaque doit montrer TOUT ce qui sera écrit, cible comprise (S-L2b-1) :
// c'est le seul point de contrôle humain. `cibles` (optionnel) porte les
// libellés résolus SOUS RLS par resoudreCible — affichés à Paul seulement,
// jamais renvoyés vers l'IA (minimisation : les noms du réseau ne partent
// pas chez Anthropic). Sans libellé, l'UUID brut est montré (jamais rien).
export function resumerAction(outil, valeurs, cibles) {
  cibles = cibles || {};
  if (outil === 'creer_idee') {
    return 'Capturer l\'idée « ' + valeurs.nom + ' » (' + valeurs.type +
      (valeurs.theme ? ' · ' + valeurs.theme : '') + ') au registre ADRAMELECH.' +
      (valeurs.essence ? ' Contenu : « ' + tronque(valeurs.essence, 160) + ' ».' : '');
  }
  if (outil === 'ecrire_journal') {
    return 'Écrire au journal de « ' + (cibles.cible || valeurs.node_id) + ' » : « ' +
      tronque(valeurs.note, 120) + ' »' +
      (valeurs.prochaine_etape ? ' — étape : ' + tronque(valeurs.prochaine_etape, 80) : '') +
      (valeurs.relance_at ? ' — relance le ' + valeurs.relance_at + '.' : '.');
  }
  if (outil === 'ajouter_besoin') {
    return 'Ajouter au chantier « ' + (cibles.cible || valeurs.chantier_id) + ' » : ' +
      valeurs.designation +
      (valeurs.quantite ? ' × ' + valeurs.quantite + (valeurs.unite ? ' ' + valeurs.unite : '') : '') + '.';
  }
  return '';
}

// Résout la cible d'une écriture en libellé humain, SOUS le client RLS de
// Paul (prouve au passage que la cible existe et lui appartient AVANT la
// plaque). → { ok:true, cibles:{cible?} } | { ok:false } (cible introuvable).
// creer_idee n'a pas de cible. Erreur réseau → fail-closed ({ ok:false }).
export async function resoudreCible(outil, valeurs, client) {
  try {
    if (outil === 'ecrire_journal') {
      const { data, error } = await client
        .from('network_nodes').select('nom').eq('id', valeurs.node_id).maybeSingle();
      if (error || !data) return { ok: false };
      return { ok: true, cibles: { cible: data.nom } };
    }
    if (outil === 'ajouter_besoin') {
      const { data, error } = await client
        .from('intendant_chantiers').select('node_id').eq('id', valeurs.chantier_id).maybeSingle();
      if (error || !data) return { ok: false };
      const noeud = await client
        .from('network_nodes').select('nom').eq('id', data.node_id).maybeSingle();
      if (noeud.error || !noeud.data) return { ok: false };
      return { ok: true, cibles: { cible: noeud.data.nom } };
    }
    return { ok: true, cibles: {} }; // creer_idee : pas de cible à résoudre
  } catch (e) {
    return { ok: false };
  }
}

// ---------- Exécuteurs (client RLS de Paul fourni par la route) ----------

// Lectures : résultats MINIMISÉS pour l'IA (champs utiles, jamais de dump)
// et PLAFONNÉS (S-L2b-2 : le tool_result repart à chaque tour de boucle —
// bornes de lignes + essence tronquée = coût d'entrée borné).
export const LECTURE_MAX_LIGNES = 200;
export const LECTURE_ESSENCE_MAX = 300;

export async function executerLecture(outil, client) {
  if (outil === 'lire_idees') {
    const [ideesRes, liensRes] = await Promise.all([
      client.from('idees').select('id, adr_num, nom, type, theme, statut, essence')
        .order('adr_num', { ascending: true }).limit(LECTURE_MAX_LIGNES),
      client.from('idees_liens').select('source_id, target_id').limit(LECTURE_MAX_LIGNES)
    ]);
    if (ideesRes.error || liensRes.error) throw ideesRes.error || liensRes.error;
    const idees = (ideesRes.data || []).map((i) => ({
      ...i,
      essence: typeof i.essence === 'string' && i.essence.length > LECTURE_ESSENCE_MAX
        ? i.essence.slice(0, LECTURE_ESSENCE_MAX) + '…'
        : i.essence
    }));
    return { idees, ponts: liensRes.data || [] };
  }
  if (outil === 'lire_intendant') {
    const [chantiersRes, besoinsRes] = await Promise.all([
      client.from('intendant_chantiers').select('id, node_id, date_pose')
        .limit(LECTURE_MAX_LIGNES),
      client.from('intendant_besoins')
        .select('id, chantier_id, designation, quantite, unite, mode, etat')
        .limit(LECTURE_MAX_LIGNES)
    ]);
    if (chantiersRes.error || besoinsRes.error) throw chantiersRes.error || besoinsRes.error;
    const chantiers = chantiersRes.data || [];
    const besoins = besoinsRes.data || [];
    return { chantiers, besoins, alertes_j2: computeAlertesJ2(chantiers, besoins) };
  }
  throw new Error('outil_inconnu');
}

// Écritures : appelées UNIQUEMENT sur le chemin confirmé de la route.
// `valeurs` sort de validerAction (revalidé au moment de la confirmation).
export async function executerEcriture(outil, valeurs, client) {
  if (outil === 'creer_idee') {
    // adr_num serveur : numéro suivant du registre (jamais choisi par l'IA).
    const { data: maxRows, error: maxError } = await client
      .from('idees').select('adr_num').order('adr_num', { ascending: false }).limit(1);
    if (maxError) throw maxError;
    const adrNum = ((maxRows && maxRows[0] && maxRows[0].adr_num) || 0) + 1;
    const { data, error } = await client
      .from('idees').insert({ ...valeurs, adr_num: adrNum }).select().single();
    if (error) throw error;
    return { id: data.id, adr_num: data.adr_num, nom: data.nom };
  }
  if (outil === 'ecrire_journal') {
    const { data, error } = await client
      .from('journal').insert(valeurs).select().single();
    if (error) throw error;
    return { id: data.id };
  }
  if (outil === 'ajouter_besoin') {
    const { data, error } = await client
      .from('intendant_besoins').insert(valeurs).select().single();
    if (error) throw error;
    return { id: data.id, etat: data.etat };
  }
  throw new Error('outil_inconnu');
}
