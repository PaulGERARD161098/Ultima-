// Géocodage (Nominatim/OSM) — fonctions pures : validation de la requête,
// construction de l'URL amont, projection stricte de la réponse, garde de
// débit. Testables sans réseau (tests/unit-geocode.mjs).

const Q_MIN = 3;
const Q_MAX = 200;
const LIMIT_DEFAUT = 5;
const LIMIT_MAX = 5;

// Caractères de contrôle interdits dans la requête.
const CONTROLE_RE = /[\x00-\x1F]/; // eslint-disable-line no-control-regex

// Validation stricte des paramètres de la query string (chaînes).
// Renvoie { value: { q, limit } } ou { error }.
export function validateGeocodeQuery(params) {
  if (!params || typeof params !== 'object') return { error: 'Requête invalide' };

  if (typeof params.q !== 'string') return { error: 'Adresse requise' };
  const q = params.q.trim();
  if (q.length < Q_MIN || q.length > Q_MAX) return { error: 'Adresse invalide' };
  if (CONTROLE_RE.test(q)) return { error: 'Adresse invalide' };

  let limit = LIMIT_DEFAUT;
  if (params.limit !== undefined && params.limit !== null && params.limit !== '') {
    const brut = params.limit;
    const nombre = typeof brut === 'number' ? brut : Number(String(brut));
    // Rejet franc hors bornes ou non entier : pas de clamp silencieux.
    if (!Number.isInteger(nombre) || nombre < 1 || nombre > LIMIT_MAX) {
      return { error: 'Limite invalide' };
    }
    limit = nombre;
  }

  return { value: { q, limit } };
}

// URL Nominatim : format stable, biais France, libellés français,
// pas de détail d'adresse (payload minimal, addressdetails=0).
export function buildNominatimUrl(q, limit) {
  return (
    'https://nominatim.openstreetmap.org/search?q=' +
    encodeURIComponent(q) +
    '&format=jsonv2&addressdetails=0&limit=' +
    limit +
    '&countrycodes=fr&accept-language=fr'
  );
}

// Projection stricte de la réponse Nominatim : { label, lat, lon, type } —
// tout le reste est jeté (place_id, osm_id, licence, boundingbox…).
// lat/lon coercés en Number et revalidés ; entrée hors bornes écartée.
// Renvoie null si le corps n'est pas un tableau (réponse illisible).
export function mapNominatimResults(brut) {
  if (!Array.isArray(brut)) return null;
  const results = [];
  for (const entree of brut) {
    if (!entree || typeof entree !== 'object') continue;
    const label = typeof entree.display_name === 'string' ? entree.display_name : '';
    if (!label) continue;
    const lat = Number(entree.lat);
    const lon = Number(entree.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) continue;
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) continue;
    const projete = { label, lat, lon };
    const type = entree.type || entree.category;
    if (typeof type === 'string' && type) projete.type = type;
    results.push(projete);
  }
  return results;
}

// Garde de débit globale : au plus un appel par intervalle, tous clients
// confondus (politique Nominatim : 1 req/s pour toute l'application).
// Compteur en mémoire, donc PER-INSTANCE : best-effort, comme le rate-limit
// du middleware. Renvoie une fonction autoriser() → true si l'appel passe.
export function creerGardeDebit(intervalleMs) {
  let dernierAppel = 0;
  return function autoriser(maintenant) {
    const t = typeof maintenant === 'number' ? maintenant : Date.now();
    if (t - dernierAppel < intervalleMs) return false;
    dernierAppel = t;
    return true;
  };
}
