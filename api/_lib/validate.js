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
  'secteur_activite',
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
    ['secteur_activite', 120],
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

// --- ADRAMELECH (AD-4) : idées + ponts. Enums/bornes alignés sur 0007_idees.sql.

// Statuts d'une idée (cycle : capturée → raffinée → exploitable → close).
export const IDEE_STATUTS = ['brute', 'à raffiner', 'exploitable', 'close'];

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const IDEE_FIELDS = ['adr_num', 'nom', 'type', 'theme', 'statut', 'partenaire', 'epigraphe', 'essence'];
const LIEN_FIELDS = ['source_id', 'target_id'];

// Valide une idée. mode 'create' impose adr_num + nom + type ; 'update' les rend
// optionnels. owner_id n'est jamais accepté du client (imposé par la RLS/insert).
export function validateIdee(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, IDEE_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.adr_num !== undefined) {
    if (!Number.isInteger(body.adr_num) || body.adr_num < 1) return { error: "Numéro d'idée invalide" };
    out.adr_num = body.adr_num;
  }

  if (mode === 'create' || body.nom !== undefined) {
    if (typeof body.nom !== 'string') return { error: 'Nom invalide' };
    const nom = body.nom.trim();
    if (nom.length < 1 || nom.length > 120) return { error: 'Nom invalide' };
    out.nom = nom;
  }

  if (mode === 'create' || body.type !== undefined) {
    if (typeof body.type !== 'string') return { error: 'Type invalide' };
    const type = body.type.trim();
    if (type.length < 1 || type.length > 60) return { error: 'Type invalide' };
    out.type = type;
  }

  if (body.statut !== undefined) {
    if (!IDEE_STATUTS.includes(body.statut)) return { error: 'Statut invalide' };
    out.statut = body.statut;
  }

  // Champs texte optionnels : null efface, chaîne bornée sinon.
  for (const [field, label, max] of [
    ['theme', 'Thème', 200],
    ['partenaire', 'Partenaire', 120],
    ['epigraphe', 'Épigraphe', 300],
    ['essence', 'Essence', 2000],
  ]) {
    if (body[field] === null) {
      out[field] = null;
      continue;
    }
    const msg = checkOptionalText(body[field], label, max);
    if (msg) return { error: msg };
    if (body[field] !== undefined) out[field] = body[field];
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }

  return { value: out };
}

// Valide un pont (lien non orienté idée ↔ idée). Création uniquement (un pont se
// crée ou se supprime, il ne se modifie pas). source/target = UUID distincts.
export function validateLien(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, LIEN_FIELDS);
  if (unknown) return { error: unknown };

  if (!isUuid(body.source_id) || !isUuid(body.target_id)) {
    return { error: "Identifiants d'idée invalides" };
  }
  if (body.source_id === body.target_id) {
    return { error: 'Un pont doit relier deux idées distinctes' };
  }
  return { value: { source_id: body.source_id, target_id: body.target_id } };
}

// --- RESHIRAM (v1) : talents + preuves. Enums/bornes en MIROIR EXACT des CHECK
// de supabase/migrations/0009_reshiram_talents.sql (défense en profondeur AU-DESSUS
// de la RLS). Ce que l'API refuse, la base le refuse aussi. owner_id n'est jamais
// accepté du client : il est imposé par le défaut base (auth.uid()).

// Échelle réelle à 3 crans (SANS « expert » — règle cardinale RESHIRAM).
export const TALENT_NIVEAUX = ['notion', 'pratique', 'maitrise'];

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const TALENT_FIELDS = ['nom', 'secteurs', 'niveau', 'plus_value'];
const PREUVE_FIELDS = ['talent_id', 'contenu'];

// Borne PAR élément de `secteurs` : non exprimable en CHECK de table sans
// fonction (0009 le documente) → assurée ici. Alignée sur secteur_activite RIVEN
// (0006 : 120). Cardinalité bornée à 20 (miroir du CHECK array_length ≤ 20).
const SECTEUR_MAX = 120;
const SECTEURS_MAX_CARD = 20;

// Valide un talent. mode 'create' impose le nom ; 'update' rend tout optionnel.
// secteurs : tableau de textes non vides bornés (vide '{}' = talent transversal).
// niveau ∈ TALENT_NIVEAUX. plus_value nullable, bornée. owner_id jamais accepté.
export function validateTalent(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, TALENT_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.nom !== undefined) {
    if (typeof body.nom !== 'string') return { error: 'Nom invalide' };
    const nom = body.nom.trim();
    if (nom.length < 1 || nom.length > 200) return { error: 'Nom invalide' };
    out.nom = nom;
  }

  if (body.secteurs !== undefined) {
    if (!Array.isArray(body.secteurs)) return { error: 'Secteurs invalides' };
    if (body.secteurs.length > SECTEURS_MAX_CARD) return { error: 'Trop de secteurs' };
    const secteurs = [];
    for (const s of body.secteurs) {
      if (typeof s !== 'string') return { error: 'Secteur invalide' };
      const v = s.trim();
      if (v.length < 1 || v.length > SECTEUR_MAX) return { error: 'Secteur invalide' };
      secteurs.push(v);
    }
    out.secteurs = secteurs;
  }

  if (body.niveau !== undefined) {
    if (!TALENT_NIVEAUX.includes(body.niveau)) return { error: 'Niveau invalide' };
    out.niveau = body.niveau;
  }

  // plus_value : null efface, chaîne bornée sinon.
  if (body.plus_value === null) {
    out.plus_value = null;
  } else {
    const msg = checkOptionalText(body.plus_value, 'Plus-value', 2000);
    if (msg) return { error: msg };
    if (body.plus_value !== undefined) out.plus_value = body.plus_value;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// Valide une preuve (le socle factuel d'un talent). mode 'create' impose
// talent_id (UUID) + contenu (1..2000). owner_id imposé par le défaut base ; le
// scellement composite (owner_id, talent_id) empêche d'étayer le talent d'autrui.
export function validatePreuve(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, PREUVE_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.talent_id)) return { error: 'Identifiant de talent invalide' };
    out.talent_id = body.talent_id;
  }

  if (mode === 'create' || body.contenu !== undefined) {
    if (typeof body.contenu !== 'string') return { error: 'Preuve invalide' };
    const contenu = body.contenu.trim();
    if (contenu.length < 1 || contenu.length > 2000) return { error: 'Preuve invalide' };
    out.contenu = contenu;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- ZEKROM (LV2-②) : idéaux + directions. Enums/bornes en MIROIR EXACT des
// CHECK de supabase/migrations/0010_zekrom_ideaux.sql. Miroir de RESHIRAM
// (validateTalent/validatePreuve) : `ideaux` ← `talents`, `directions` ← `preuves`.
// Règle cardinale INVERSE : le réel ne bride pas l'idéal (aucune contrainte
// supplémentaire côté API ; on valide seulement forme/bornes/enum).
export const IDEAL_REGISTRES = ['vision', 'volonte', 'projet'];

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const IDEAL_FIELDS = ['intitule', 'registre', 'horizon'];
const DIRECTION_FIELDS = ['ideal_id', 'formulation'];

// Valide un idéal. mode 'create' impose l'intitulé ; 'update' rend tout optionnel.
// registre ∈ IDEAL_REGISTRES. horizon nullable, borné. owner_id jamais accepté.
export function validateIdeal(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, IDEAL_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.intitule !== undefined) {
    if (typeof body.intitule !== 'string') return { error: 'Intitulé invalide' };
    const intitule = body.intitule.trim();
    if (intitule.length < 1 || intitule.length > 200) return { error: 'Intitulé invalide' };
    out.intitule = intitule;
  }

  if (body.registre !== undefined) {
    if (!IDEAL_REGISTRES.includes(body.registre)) return { error: 'Registre invalide' };
    out.registre = body.registre;
  }

  // horizon : null efface, chaîne bornée sinon.
  if (body.horizon === null) {
    out.horizon = null;
  } else {
    const msg = checkOptionalText(body.horizon, 'Horizon', 2000);
    if (msg) return { error: msg };
    if (body.horizon !== undefined) out.horizon = body.horizon;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// Valide une direction (« un idéal → une direction », le cap). mode 'create'
// impose ideal_id (UUID) + formulation (1..2000). owner_id imposé par le défaut
// base ; le scellement composite (owner_id, ideal_id) empêche d'orienter l'idéal
// d'autrui. Miroir de validatePreuve.
export function validateDirection(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, DIRECTION_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.ideal_id)) return { error: 'Identifiant d’idéal invalide' };
    out.ideal_id = body.ideal_id;
  }

  if (mode === 'create' || body.formulation !== undefined) {
    if (typeof body.formulation !== 'string') return { error: 'Direction invalide' };
    const formulation = body.formulation.trim();
    if (formulation.length < 1 || formulation.length > 2000) return { error: 'Direction invalide' };
    out.formulation = formulation;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- PASSERELLE R↔Z (LV2-③) : liens idéal ↔ talent. Enums/bornes en MIROIR EXACT
// des CHECK de supabase/migrations/0011_passerelle_retroplanning.sql. Le lien porte
// une nature (acquis = talent qui rend l'idéal possible ; a_construire = talent que
// l'idéal appelle et qui manque). owner_id jamais accepté ; le double scellement
// (owner_id, ideal_id)/(owner_id, talent_id) est garanti en base.
export const PASSERELLE_NATURES = ['acquis', 'a_construire'];

// Champs autorisés en écriture. ideal_id/talent_id figés après création (comme
// source/cible d'un edge RIVEN) : seuls nature/note évoluent en update.
const PASSERELLE_FIELDS = ['ideal_id', 'talent_id', 'nature', 'note'];
const PASSERELLE_UPDATE_FIELDS = ['nature', 'note'];

// Valide une passerelle. create : ideal_id + talent_id (UUID) + nature imposés,
// note optionnelle bornée. update : nature/note seulement (les FK sont figées).
export function validatePasserelle(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const allowed = mode === 'update' ? PASSERELLE_UPDATE_FIELDS : PASSERELLE_FIELDS;
  const unknown = rejectUnknown(body, allowed);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.ideal_id)) return { error: 'Identifiant d’idéal invalide' };
    if (!isUuid(body.talent_id)) return { error: 'Identifiant de talent invalide' };
    out.ideal_id = body.ideal_id;
    out.talent_id = body.talent_id;
  }

  if (mode === 'create' || body.nature !== undefined) {
    if (!PASSERELLE_NATURES.includes(body.nature)) return { error: 'Nature invalide' };
    out.nature = body.nature;
  }

  // note : null efface, chaîne bornée sinon.
  if (body.note === null) {
    out.note = null;
  } else {
    const msg = checkOptionalText(body.note, 'Note', 2000);
    if (msg) return { error: msg };
    if (body.note !== undefined) out.note = body.note;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- RESHIRAM → RIVEN (boucle ④) : référence LECTURE SEULE d'un talent vers une
// fiche RIVEN. Bornes en MIROIR EXACT des CHECK/FK de
// supabase/migrations/0013_talent_refs_reseau.sql. Une référence est un lien nu
// (talent_id, node_id) : rien de modifiable → create + delete seulement, PAS
// d'update. owner_id n'est JAMAIS accepté du client (imposé par le défaut base).
// node_id est une RÉFÉRENCE, jamais une copie de la fiche : aucun champ RIVEN ici.

// Champs autorisés en écriture (owner_id/id/created_at gérés serveur ; les deux
// FK sont figées — une référence ne se « déplace » pas, on la retire et on la
// recrée, comme source/cible d'un edge RIVEN).
const TALENT_REF_FIELDS = ['talent_id', 'node_id'];

// Valide une référence talent↔fiche RIVEN (mode 'create' uniquement : les deux
// UUID imposés). Pas de mode 'update' — la table n'a aucun champ mutable.
export function validateTalentRef(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, TALENT_REF_FIELDS);
  if (unknown) return { error: unknown };

  if (!isUuid(body.talent_id)) return { error: 'Identifiant de talent invalide' };
  if (!isUuid(body.node_id)) return { error: 'Identifiant de fiche invalide' };

  return { value: { talent_id: body.talent_id, node_id: body.node_id } };
}

// --- IMLADRIK (v1) : journal intime « pouvoir écrire ». Bornes en MIROIR EXACT
// des CHECK de supabase/migrations/0012_imladrik_journal.sql (défense en
// profondeur AU-DESSUS de la RLS). Ce que l'API refuse, la base le refuse aussi.
// owner_id n'est JAMAIS accepté du client : il est imposé par le défaut base
// (auth.uid()). Données intimes (§5) : erreurs génériques, aucun contenu en log.

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const IMLADRIK_FIELDS = ['titre', 'contenu'];

// Valide une entrée de journal IMLADRIK. mode 'create' impose le contenu
// (1..20000, non vide) ; 'update' rend tout optionnel (au moins un champ).
// titre : optionnel, null efface (mirror colonne nullable, borne 1..200).
export function validateEntreeImladrik(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, IMLADRIK_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  // titre : null efface ; sinon chaîne trimée non vide bornée à 200.
  if (body.titre === null) {
    out.titre = null;
  } else if (body.titre !== undefined) {
    if (typeof body.titre !== 'string') return { error: 'Titre invalide' };
    const titre = body.titre.trim();
    if (titre.length < 1 || titre.length > 200) return { error: 'Titre invalide' };
    out.titre = titre;
  }

  // contenu : obligatoire en création, trimé non vide, borné à 20000.
  if (mode === 'create' || body.contenu !== undefined) {
    if (typeof body.contenu !== 'string') return { error: 'Contenu invalide' };
    const contenu = body.contenu.trim();
    if (contenu.length < 1 || contenu.length > 20000) return { error: 'Contenu invalide' };
    out.contenu = contenu;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- DRAUKHAIN (IMLADRIK B2) : serments + flammes. Enums/bornes en MIROIR EXACT
// des CHECK de supabase/migrations/0016_draukhain_serments.sql (défense en
// profondeur AU-DESSUS de la RLS). Miroir de ZEKROM (validateIdeal/validateDirection) :
// `serments` ← `ideaux`, `flammes` ← `directions`. Règle cardinale POSITIVE : un
// serment sans flamme n'est jamais dévalué (aucune contrainte supplémentaire ;
// on valide seulement forme/bornes/enum). owner_id n'est JAMAIS accepté du client.
// Données intimes (§5) : erreurs génériques, aucun contenu en log.
export const FLAMME_NATURES = ['citation', 'victoire', 'rappel'];

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const SERMENT_FIELDS = ['intitule', 'pourquoi', 'horizon'];
const FLAMME_FIELDS = ['serment_id', 'nature', 'texte'];

// Valide un serment. mode 'create' impose l'intitulé (le quoi) ; 'update' rend
// tout optionnel. pourquoi (le pourquoi profond) nullable borné 2000 ; horizon
// (l'échéance) nullable borné 200. owner_id jamais accepté.
export function validateSerment(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, SERMENT_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.intitule !== undefined) {
    if (typeof body.intitule !== 'string') return { error: 'Intitulé invalide' };
    const intitule = body.intitule.trim();
    if (intitule.length < 1 || intitule.length > 200) return { error: 'Intitulé invalide' };
    out.intitule = intitule;
  }

  // pourquoi / horizon : null efface, chaîne bornée sinon.
  if (body.pourquoi === null) {
    out.pourquoi = null;
  } else {
    const msg = checkOptionalText(body.pourquoi, 'Pourquoi', 2000);
    if (msg) return { error: msg };
    if (body.pourquoi !== undefined) out.pourquoi = body.pourquoi;
  }

  if (body.horizon === null) {
    out.horizon = null;
  } else {
    const msg = checkOptionalText(body.horizon, 'Horizon', 200);
    if (msg) return { error: msg };
    if (body.horizon !== undefined) out.horizon = body.horizon;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// Valide une flamme (« rappel de foi » rattaché à un serment). mode 'create'
// impose serment_id (UUID) + texte (1..2000) ; nature optionnelle (défaut base
// 'rappel'). owner_id imposé par le défaut base ; le scellement composite
// (owner_id, serment_id) empêche d'entretenir le serment d'autrui. Miroir de
// validateDirection (create/delete seulement — une flamme ne se modifie pas).
export function validateFlamme(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, FLAMME_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.serment_id)) return { error: 'Identifiant de serment invalide' };
    out.serment_id = body.serment_id;
  }

  if (body.nature !== undefined) {
    if (!FLAMME_NATURES.includes(body.nature)) return { error: 'Nature invalide' };
    out.nature = body.nature;
  }

  if (mode === 'create' || body.texte !== undefined) {
    if (typeof body.texte !== 'string') return { error: 'Flamme invalide' };
    const texte = body.texte.trim();
    if (texte.length < 1 || texte.length > 2000) return { error: 'Flamme invalide' };
    out.texte = texte;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- VRANESH (IMLADRIK B3) : situations + scénarios. Enums/bornes en MIROIR
// EXACT des CHECK de supabase/migrations/0017_vranesh_situations.sql (défense en
// profondeur AU-DESSUS de la RLS). Miroir de DRAUKHAIN/ZEKROM : `situations` ←
// `serments`/`ideaux`, `scenarios` ← `flammes`/`directions`. VRANESH explore ce
// qui PEUT arriver (jamais ce qu'on veut) ; aucune contrainte de « validité » sur
// un futur — on valide seulement forme/bornes/enum. owner_id jamais accepté.
// Données intimes (§5) : erreurs génériques, aucun contenu en log.
export const SCENARIO_VRAISEMBLANCES = ['faible', 'moyenne', 'forte'];

// 0020 — les deux NATURES d'un thème. `direction` : un futur t'arrive, l'un
// pousse et les autres tombent (le modèle d'origine). `construction` : le but ne
// bouge pas, ce sont les MOYENS qui cassent et se remplacent.
export const SITUATION_NATURES = ['direction', 'construction'];
// 0020 — l'état d'un plan dans une construction. `reserve` est le plan B : prêt,
// pas encore employé — précisément ce que le modèle d'origine ne savait pas dire.
export const SCENARIO_ETATS = ['tenu', 'reserve', 'ecarte'];

// Champs autorisés en écriture (owner_id/id/dates gérés serveur).
const SITUATION_FIELDS = ['intitule', 'contexte', 'nature'];
const SCENARIO_FIELDS = ['situation_id', 'deroule', 'vraisemblance', 'signaux', 'parade',
  'etat', 'cause'];

// Valide une situation. mode 'create' impose l'intitulé (le cas) ; 'update' rend
// tout optionnel. contexte nullable borné 2000. owner_id jamais accepté.
export function validateSituation(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, SITUATION_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create' || body.intitule !== undefined) {
    if (typeof body.intitule !== 'string') return { error: 'Intitulé invalide' };
    const intitule = body.intitule.trim();
    if (intitule.length < 1 || intitule.length > 200) return { error: 'Intitulé invalide' };
    out.intitule = intitule;
  }

  // contexte : null efface, chaîne bornée sinon.
  if (body.contexte === null) {
    out.contexte = null;
  } else {
    const msg = checkOptionalText(body.contexte, 'Contexte', 2000);
    if (msg) return { error: msg };
    if (body.contexte !== undefined) out.contexte = body.contexte;
  }

  // 0020 — la nature du thème : elle décide de la FORME. Jamais null (le CHECK
  // et le défaut base l'imposent) : on refuse plutôt que d'effacer.
  if (body.nature !== undefined) {
    if (!SITUATION_NATURES.includes(body.nature)) return { error: 'Nature de thème invalide' };
    out.nature = body.nature;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// Valide un DÉNOUEMENT (0019) : « la branche qui a poussé ».
//   { id, scenario_advenu_id }        → ce futur-là est advenu ;
//   { id, scenario_advenu_id: null }  → rouvrir la situation (le futur n'a
//                                       finalement pas tranché).
// Volontairement SÉPARÉ de validateSituation : le dénouement déclenche une
// suppression irréversible des autres branches (décision Paul), il ne doit
// jamais pouvoir voyager en passager clandestin d'une simple modification
// d'intitulé ou de contexte. `advenu_le` n'est PAS accepté du client : la date
// est posée par le serveur (une horloge cliente ne fait pas foi).
const DENOUEMENT_FIELDS = ['id', 'scenario_advenu_id'];

export function validateDenouement(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, DENOUEMENT_FIELDS);
  if (unknown) return { error: unknown };

  if (!isUuid(body.id)) return { error: 'Identifiant invalide' };
  if (!('scenario_advenu_id' in body)) return { error: 'Futur advenu manquant' };
  if (body.scenario_advenu_id !== null && !isUuid(body.scenario_advenu_id)) {
    return { error: 'Futur advenu invalide' };
  }
  return { value: { id: body.id, scenario_advenu_id: body.scenario_advenu_id } };
}

// Valide un scénario (« un futur potentiel » d'une situation). mode 'create'
// impose situation_id (UUID) + deroule (1..2000) ; vraisemblance optionnelle
// (défaut base 'moyenne'), signaux/parade optionnels bornés. owner_id imposé par
// le défaut base ; le scellement (owner_id, situation_id) empêche d'anticiper la
// situation d'autrui. Miroir de validateFlamme (create/delete seulement).
export function validateScenario(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, SCENARIO_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.situation_id)) return { error: 'Identifiant de situation invalide' };
    out.situation_id = body.situation_id;
  }

  if (mode === 'create' || body.deroule !== undefined) {
    if (typeof body.deroule !== 'string') return { error: 'Scénario invalide' };
    const deroule = body.deroule.trim();
    if (deroule.length < 1 || deroule.length > 2000) return { error: 'Scénario invalide' };
    out.deroule = deroule;
  }

  if (body.vraisemblance !== undefined) {
    if (!SCENARIO_VRAISEMBLANCES.includes(body.vraisemblance)) return { error: 'Vraisemblance invalide' };
    out.vraisemblance = body.vraisemblance;
  }

  // signaux / parade : null efface, chaîne bornée sinon.
  for (const [field, label] of [['signaux', 'Signaux'], ['parade', 'Parade']]) {
    if (body[field] === null) {
      out[field] = null;
    } else {
      const msg = checkOptionalText(body[field], label, 2000);
      if (msg) return { error: msg };
      if (body[field] !== undefined) out[field] = body[field];
    }
  }

  // 0020 — l'état d'un plan, et sa cause. La cause n'existe QUE sur un plan
  // écarté : miroir EXACT du CHECK `scenarios_cause_scope`, refusé ici pour que
  // le client reçoive un 400 lisible au lieu d'une 500 de contrainte.
  if (body.etat !== undefined) {
    if (body.etat === null) {
      out.etat = null;
    } else {
      if (!SCENARIO_ETATS.includes(body.etat)) return { error: 'État de plan invalide' };
      out.etat = body.etat;
    }
  }
  if (body.cause === null) {
    out.cause = null;
  } else if (body.cause !== undefined) {
    const msg = checkOptionalText(body.cause, 'Cause', 2000);
    if (msg) return { error: msg };
    out.cause = body.cause;
  }
  // Portée : une cause posée sans dire dans le même geste que le plan est écarté
  // est refusée. On ne peut pas prouver ici l'état en base — et une cause qui
  // atterrit sur un plan tenu serait lue de travers pour toujours.
  if (out.cause !== undefined && out.cause !== null && out.etat !== 'ecarte') {
    return { error: 'Une cause ne vaut que pour un plan écarté' };
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// --- IMLADRIK passerelles v2 (B4) : liens inter-cap. Enums/cibles en MIROIR EXACT
// des CHECK de supabase/migrations/0018_imladrik_passerelles.sql. Cible XOR : un
// lien pointe EXACTEMENT un objet parmi deux types (motif node_id/edge_id du
// journal). owner_id jamais accepté ; le double scellement composite (owner_id,
// source)/(owner_id, cible) est garanti en base. Un lien se crée ou se supprime
// (pas d'update). Données intimes (§5) : erreurs génériques.
export const SCENARIO_RAPPORTS = ['menace', 'sert'];

const SERMENT_LIEN_FIELDS = ['serment_id', 'ideal_id', 'entree_id'];
const SCENARIO_LIEN_FIELDS = ['scenario_id', 'serment_id', 'entree_id', 'rapport'];

// Compte les cibles renseignées (UUID) parmi une liste ; renvoie { error } si
// une valeur présente n'est pas un UUID, sinon { champs } = les champs cibles posés.
function collectCibleXor(body, champs) {
  const poses = {};
  for (const f of champs) {
    if (body[f] === undefined || body[f] === null) continue;
    if (!isUuid(body[f])) return { error: `Identifiant ${f} invalide` };
    poses[f] = body[f];
  }
  const n = Object.keys(poses).length;
  if (n !== 1) return { error: 'Une passerelle vise exactement une cible' };
  return { poses };
}

// Valide un lien serment → (idéal XOR page). create uniquement.
export function validateSermentLien(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, SERMENT_LIEN_FIELDS);
  if (unknown) return { error: unknown };
  if (!isUuid(body.serment_id)) return { error: 'Identifiant de serment invalide' };

  const cible = collectCibleXor(body, ['ideal_id', 'entree_id']);
  if (cible.error) return { error: cible.error };

  return { value: { serment_id: body.serment_id, ...cible.poses } };
}

// Valide un lien scénario → (serment XOR page), avec rapport (menace/sert) réservé
// à la cible serment. create uniquement.
export function validateScenarioLien(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, SCENARIO_LIEN_FIELDS);
  if (unknown) return { error: unknown };
  if (!isUuid(body.scenario_id)) return { error: 'Identifiant de scénario invalide' };

  const cible = collectCibleXor(body, ['serment_id', 'entree_id']);
  if (cible.error) return { error: cible.error };

  const out = { scenario_id: body.scenario_id, ...cible.poses };

  if (body.rapport !== undefined && body.rapport !== null) {
    if (!SCENARIO_RAPPORTS.includes(body.rapport)) return { error: 'Rapport invalide' };
    // rapport n'a de sens qu'avec une cible serment (miroir CHECK scope).
    if (!out.serment_id) return { error: 'Le rapport ne vaut que pour un serment' };
    out.rapport = body.rapport;
  }

  return { value: out };
}

// --- INTENDANT (AD-5c) : chantiers pilotés + besoins. Enums/bornes en MIROIR
// EXACT des CHECK de supabase/migrations/0008_intendant.sql. Ce que l'API refuse,
// la base le refuse aussi (et vice versa) ; la base reste le backstop ultime pour
// les cohérences croisant l'état existant d'une ligne lors d'une mise à jour
// partielle (l'API valide alors le sous-ensemble soumis, jamais plus laxiste).

export const INTENDANT_MODES = ['stock', 'commande', 'aucune'];
export const INTENDANT_CONTROLES = ['en_attente', 'conforme', 'casse'];

// node_id figé à la création (l'accroche RIVEN ne se déplace pas) ; seule la
// date de pose se renseigne/décale ensuite. owner_id/id/etat jamais acceptés.
const CHANTIER_CREATE_FIELDS = ['node_id', 'date_pose'];
const CHANTIER_UPDATE_FIELDS = ['date_pose'];

// chantier_id figé à la création. `etat` est une colonne GÉNÉRÉE : absente des
// listes → rejetée d'office par rejectUnknown (jamais acceptée en entrée).
const BESOIN_CREATE_FIELDS = [
  'chantier_id', 'designation', 'quantite', 'unite', 'reference',
  'mode', 'commande_ref', 'fournisseur_node_id', 'livree_le', 'controle',
];
const BESOIN_UPDATE_FIELDS = [
  'designation', 'quantite', 'unite', 'reference',
  'mode', 'commande_ref', 'fournisseur_node_id', 'livree_le', 'controle',
];

// Valide un dossier chantier de l'INTENDANT. mode 'create' impose node_id (UUID) ;
// 'update' n'accepte que date_pose (null autorisé pour l'effacer). Le contrôle
// « node de type chantier appartenant à l'owner » n'est pas exprimable ici (ni en
// FK) : il est fait côté endpoint contre network_nodes (RLS-scopé à l'owner).
export function validateChantierIntendant(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, mode === 'update' ? CHANTIER_UPDATE_FIELDS : CHANTIER_CREATE_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.node_id)) return { error: 'Identifiant de chantier invalide' };
    out.node_id = body.node_id;
  }

  // date_pose : optionnelle, null efface (mirror colonne nullable).
  if (body.date_pose === null) {
    out.date_pose = null;
  } else if (body.date_pose !== undefined) {
    const msg = checkOptionalDate(body.date_pose, 'Date de pose');
    if (msg) return { error: msg };
    out.date_pose = body.date_pose;
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}

// Valide une ligne de besoin. mode 'create' impose chantier_id (UUID) + designation.
// Miroir des CHECK : designation 1..200, quantite > 0, unite ≤ 20, reference ≤ 120,
// mode ∈ MODES, commande_ref ≤ 120, controle ∈ CONTROLES, cohérence commande
// (hors mode 'commande', aucun attribut de commande) et contrôle-après-livraison
// (controle ≠ en_attente exige livree_le).
export function validateBesoinIntendant(body, mode) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Corps de requête invalide' };
  }
  const unknown = rejectUnknown(body, mode === 'update' ? BESOIN_UPDATE_FIELDS : BESOIN_CREATE_FIELDS);
  if (unknown) return { error: unknown };

  const out = {};

  if (mode === 'create') {
    if (!isUuid(body.chantier_id)) return { error: 'Identifiant de chantier invalide' };
    out.chantier_id = body.chantier_id;
  }

  if (mode === 'create' || body.designation !== undefined) {
    if (typeof body.designation !== 'string') return { error: 'Désignation invalide' };
    const designation = body.designation.trim();
    if (designation.length < 1 || designation.length > 200) return { error: 'Désignation invalide' };
    out.designation = designation;
  }

  // quantite : numérique fini strictement positif (mirror CHECK quantite > 0).
  if (body.quantite !== undefined) {
    if (typeof body.quantite !== 'number' || !Number.isFinite(body.quantite) || body.quantite <= 0) {
      return { error: 'Quantité invalide' };
    }
    out.quantite = body.quantite;
  }

  // Textes optionnels bornés : null efface, chaîne bornée sinon.
  for (const [field, label, max] of [
    ['unite', 'Unité', 20],
    ['reference', 'Référence', 120],
    ['commande_ref', 'Référence de commande', 120],
  ]) {
    if (body[field] === null) {
      out[field] = null;
      continue;
    }
    const msg = checkOptionalText(body[field], label, max);
    if (msg) return { error: msg };
    if (body[field] !== undefined) out[field] = body[field];
  }

  if (body.mode !== undefined) {
    if (!INTENDANT_MODES.includes(body.mode)) return { error: 'Mode invalide' };
    out.mode = body.mode;
  }

  // fournisseur_node_id : UUID optionnel, null efface (FK set null en base).
  if (body.fournisseur_node_id === null) {
    out.fournisseur_node_id = null;
  } else if (body.fournisseur_node_id !== undefined) {
    if (!isUuid(body.fournisseur_node_id)) return { error: 'Identifiant de fournisseur invalide' };
    out.fournisseur_node_id = body.fournisseur_node_id;
  }

  // livree_le : date optionnelle, null efface.
  if (body.livree_le === null) {
    out.livree_le = null;
  } else if (body.livree_le !== undefined) {
    const msg = checkOptionalDate(body.livree_le, 'Date de livraison');
    if (msg) return { error: msg };
    out.livree_le = body.livree_le;
  }

  if (body.controle !== undefined) {
    if (!INTENDANT_CONTROLES.includes(body.controle)) return { error: 'Contrôle invalide' };
    out.controle = body.controle;
  }

  // Cohérence commande (mirror intendant_besoins_commande_coherence). En 'create'
  // les défauts base sont connus (mode='aucune', controle='en_attente') ; en
  // 'update' un mode non soumis reste inconnu → cohérence déférée à la base.
  const modeEff = out.mode !== undefined ? out.mode : (mode === 'create' ? 'aucune' : undefined);
  if (modeEff !== undefined && modeEff !== 'commande') {
    if (
      out.commande_ref != null ||
      out.fournisseur_node_id != null ||
      ('livree_le' in out && out.livree_le != null) ||
      (out.controle !== undefined && out.controle !== 'en_attente')
    ) {
      return { error: 'Attributs de commande interdits hors mode commande' };
    }
  }

  // Contrôle après livraison (mirror intendant_besoins_controle_apres_livraison).
  // controle ≠ en_attente exige une livree_le. En 'update', une livree_le non
  // soumise reste inconnue → autorisée (geste clé PATCH { controle:'conforme' } sur
  // une ligne déjà livrée) ; seule une livree_le explicitement nulle est bloquée.
  const controleEff = out.controle !== undefined ? out.controle : (mode === 'create' ? 'en_attente' : undefined);
  if (controleEff !== undefined && controleEff !== 'en_attente') {
    const livreePresente = ('livree_le' in out)
      ? out.livree_le != null
      : mode !== 'create';
    if (!livreePresente) return { error: 'Un contrôle exige une livraison' };
  }

  if (mode === 'update' && Object.keys(out).length === 0) {
    return { error: 'Aucun champ à mettre à jour' };
  }
  return { value: out };
}
