// Validation stricte des entrées API. Enums alignés sur la migration 0001.

export const NODE_TYPES = ['artisan', 'partenaire', 'lead', 'chantier'];
export const NODE_STATUTS = ['actif', 'prospect', 'en_cours', 'termine', 'inactif'];
export const EDGE_TYPES = ['apport_affaires', 'sous_traitance', 'chantier_commun'];

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
const EDGE_FIELDS = ['source_id', 'target_id', 'type', 'notes'];

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

// Validation d'une relation (création).
export function validateEdge(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
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

  const notesMsg = checkOptionalText(body.notes, 'Notes', 2000);
  if (notesMsg) return { error: notesMsg };
  if (body.notes !== undefined) out.notes = body.notes;

  return { value: out };
}
