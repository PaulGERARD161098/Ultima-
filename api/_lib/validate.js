// Validation stricte des entrées API. Enums alignés sur la migration 0001.

export const NODE_TYPES = ['artisan', 'partenaire', 'lead', 'chantier'];
export const NODE_STATUTS = ['actif', 'prospect', 'en_cours', 'termine', 'inactif'];
export const EDGE_TYPES = ['apport_affaires', 'sous_traitance', 'chantier_commun'];
// Cycle de vie d'un rapprochement (hybride v1×v2, migration 0005).
export const EDGE_STATUTS = ['idee', 'contact_etabli', 'en_cours', 'fructueux', 'arrete'];

// Champs autorisés en écriture pour un nœud (owner_id/id/dates gérés serveur).
const NODE_FIELDS = [
  'type',
  'nom',
  'ville',
  'adresse',
  'telephone',
  'email',
  'statut',
  'lat',
  'lng',
  'notes',
];
const EDGE_FIELDS = [
  'source_id',
  'target_id',
  'type',
  'notes',
  'statut',
  'interet_qualitatif',
  'effort_temps',
  'effort_energie',
  'raison_arret',
];
// Champs de pilotage modifiables après création (source/cible/type sont figés).
const EDGE_UPDATE_FIELDS = [
  'statut',
  'interet_qualitatif',
  'effort_temps',
  'effort_energie',
  'raison_arret',
  'notes',
];
const JOURNAL_FIELDS = ['node_id', 'edge_id', 'note', 'prochaine_etape', 'relance_at', 'relance_faite'];
const JOURNAL_UPDATE_FIELDS = ['note', 'prochaine_etape', 'relance_at', 'relance_faite'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

// Rejette tout champ inconnu présent dans le corps.
function rejectUnknown(body, allowed) {
  const extra = Object.keys(body).filter((k) => !allowed.includes(k));
  return extra.length ? `Champ non autorisé : ${extra[0]}` : null;
}

// Valide une chaîne optionnelle (max longueur). Renvoie un message ou null.
function checkOptionalText(value, label, max) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return `${label} invalide`;
  if (value.length > max) return `${label} trop long`;
  return null;
}

// Valide une coordonnée optionnelle bornée.
function checkOptionalCoord(value, label, min, max) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || Number.isNaN(value)) return `${label} invalide`;
  if (value < min || value > max) return `${label} hors bornes`;
  return null;
}

// Validation d'un nœud. mode 'create' impose type + nom ; 'update' les rend optionnels.
export function validateNode(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, NODE_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.type !== undefined) {
    if (!NODE_TYPES.includes(body.type)) return { error: 'Type invalide' };
    out.type = body.type;
  }

  if (mode === 'create' || body.nom !== undefined) {
    if (typeof body.nom !== 'string') return { error: 'Nom invalide' };
    const nom = body.nom.trim();
    if (nom.length < 1 || nom.length > 200) return { error: 'Nom invalide' };
    out.nom = nom;
  }

  if (body.statut !== undefined) {
    if (!NODE_STATUTS.includes(body.statut)) return { error: 'Statut invalide' };
    out.statut = body.statut;
  }

  for (const [field, max] of [
    ['ville', 200],
    ['adresse', 500],
    ['notes', 2000],
  ]) {
    const msg = checkOptionalText(body[field], field, max);
    if (msg) return { error: msg };
    if (body[field] !== undefined) out[field] = body[field];
  }

  const telMsg = checkOptionalText(body.telephone, 'Téléphone', 30);
  if (telMsg) return { error: telMsg };
  if (body.telephone !== undefined) out.telephone = body.telephone;

  if (body.email !== undefined && body.email !== null) {
    if (typeof body.email !== 'string' || body.email.length > 200 || !EMAIL_RE.test(body.email)) {
      return { error: 'Email invalide' };
    }
    out.email = body.email;
  } else if (body.email === null) {
    out.email = null;
  }

  const latMsg = checkOptionalCoord(body.lat, 'Latitude', -90, 90);
  if (latMsg) return { error: latMsg };
  if (body.lat !== undefined) out.lat = body.lat;

  const lngMsg = checkOptionalCoord(body.lng, 'Longitude', -180, 180);
  if (lngMsg) return { error: lngMsg };
  if (body.lng !== undefined) out.lng = body.lng;

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }

  return { value: out };
}

// Valide un entier optionnel borné (efforts 1..5).
function checkOptionalInt(value, label, min, max) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || value < min || value > max) return `${label} invalide`;
  return null;
}

// Champs de pilotage communs création/mise à jour d'une relation.
// Copie les champs présents dans out ; renvoie un message d'erreur ou null.
function collectEdgePilotage(body, out) {
  if (body.statut !== undefined) {
    if (!EDGE_STATUTS.includes(body.statut)) return 'Statut de relation invalide';
    out.statut = body.statut;
  }

  for (const [field, label, max] of [
    ['interet_qualitatif', 'Intérêt qualitatif', 2000],
    ['raison_arret', "Raison d'arrêt", 1000],
    ['notes', 'Notes', 2000],
  ]) {
    const msg = checkOptionalText(body[field], label, max);
    if (msg) return msg;
    if (body[field] !== undefined) out[field] = body[field];
  }

  for (const field of ['effort_temps', 'effort_energie']) {
    const msg = checkOptionalInt(body[field], 'Effort', 1, 5);
    if (msg) return msg;
    if (body[field] !== undefined) out[field] = body[field];
  }

  // Miroir de la contrainte SQL : un arrêt doit être justifié.
  if (out.statut === 'arrete' && !out.raison_arret) {
    return "Un arrêt doit être justifié (raison d'arrêt requise)";
  }
  return null;
}

// Validation d'une relation. mode 'create' impose source/cible/type ;
// 'update' n'accepte que les champs de pilotage (le lien lui-même est figé).
export function validateEdge(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }

  if (mode === 'update') {
    const unknown = rejectUnknown(body, EDGE_UPDATE_FIELDS);
    if (unknown) return { error: unknown };
    const out = {};
    const msg = collectEdgePilotage(body, out);
    if (msg) return { error: msg };
    if (Object.keys(out).length === 0) return { error: 'Aucun champ à mettre à jour' };
    return { value: out };
  }

  const unknown = rejectUnknown(body, EDGE_FIELDS);
  if (unknown) return { error: unknown };

  if (!isUuid(body.source_id) || !isUuid(body.target_id)) {
    return { error: 'Identifiants de nœud invalides' };
  }
  if (body.source_id === body.target_id) {
    return { error: 'Une relation doit relier deux nœuds distincts' };
  }
  if (!EDGE_TYPES.includes(body.type)) return { error: 'Type de relation invalide' };

  const out = {
    source_id: body.source_id,
    target_id: body.target_id,
    type: body.type,
  };

  const msg = collectEdgePilotage(body, out);
  if (msg) return { error: msg };

  return { value: out };
}

// Valide une date optionnelle AAAA-MM-JJ.
function checkOptionalDate(value, label) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    return `${label} invalide`;
  }
  return null;
}

// Validation d'une entrée de journal. mode 'create' impose la note et une
// cible exclusive (node_id XOR edge_id) ; 'update' rend tout optionnel.
export function validateJournal(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, mode === 'update' ? JOURNAL_UPDATE_FIELDS : JOURNAL_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    const cibleNode = body.node_id !== undefined && body.node_id !== null;
    const cibleEdge = body.edge_id !== undefined && body.edge_id !== null;
    if (cibleNode === cibleEdge) {
      return { error: 'Une entrée vise soit un nœud, soit une relation' };
    }
    if (cibleNode) {
      if (!isUuid(body.node_id)) return { error: 'Identifiant invalide' };
      out.node_id = body.node_id;
    } else {
      if (!isUuid(body.edge_id)) return { error: 'Identifiant invalide' };
      out.edge_id = body.edge_id;
    }
  }

  if (mode === 'create' || body.note !== undefined) {
    if (typeof body.note !== 'string') return { error: 'Note invalide' };
    const note = body.note.trim();
    if (note.length < 1 || note.length > 2000) return { error: 'Note invalide' };
    out.note = note;
  }

  const etapeMsg = checkOptionalText(body.prochaine_etape, 'Prochaine étape', 500);
  if (etapeMsg) return { error: etapeMsg };
  if (body.prochaine_etape !== undefined) out.prochaine_etape = body.prochaine_etape;

  const dateMsg = checkOptionalDate(body.relance_at, 'Date de relance');
  if (dateMsg) return { error: dateMsg };
  if (body.relance_at !== undefined) out.relance_at = body.relance_at;

  if (body.relance_faite !== undefined) {
    if (typeof body.relance_faite !== 'boolean') return { error: 'Relance invalide' };
    out.relance_faite = body.relance_faite;
  }

  // Miroir de la contrainte SQL : une relance suppose une prochaine étape.
  if (out.relance_at && out.prochaine_etape === undefined && mode === 'create') {
    return { error: 'Une relance nécessite une prochaine étape' };
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }

  return { value: out };
}
