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
