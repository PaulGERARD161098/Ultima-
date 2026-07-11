// GET /api/geocode?q=…&limit=… → { ok:true, data:{ results:[{label,lat,lon,type}] } }
// Proxy Nominatim côté serveur : la CSP du front restreint connect-src à
// 'self' + Supabase, le navigateur ne peut pas appeler Nominatim directement.
// PII : q EST une adresse — jamais loggée (ni label, ni coordonnée).

import { requireUser } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';
import {
  validateGeocodeQuery,
  buildNominatimUrl,
  mapNominatimResults,
  creerGardeDebit,
} from './_lib/geocode.js';

const TIMEOUT_MS = 5000;

// User-Agent identifiant l'app auprès de Nominatim (obligatoire, politique
// d'usage) : env Vercel prioritaire, repli publiable — l'app marche sans env.
const USER_AGENT_DEFAUT = 'Ultima/1.0 (carte reseau commercial; contact: pag.gerard@gmail.com)';

// Fetch avec timeout sortant réel (5 s) — même motif que api/_lib/supabase.js.
function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

// Paramètres de query : req.query (Vercel), repli sur l'URL brute.
function queryParams(req) {
  if (req.query && typeof req.query === 'object') return req.query;
  try {
    const url = new URL(req.url, 'http://localhost');
    return Object.fromEntries(url.searchParams);
  } catch {
    return {};
  }
}

// Garde de débit GLOBALE (per-instance, best-effort) : jamais plus d'un appel
// Nominatim par seconde, tous clients confondus — le rate-limit par IP du
// middleware ne protège pas ce quota global.
const gardeNominatim = creerGardeDebit(1000);

// fetchImpl + authImpl injectables par les tests (défauts : fetchWithTimeout,
// requireUser). authImpl valide RÉELLEMENT le jeton (auth.getUser) : cet
// endpoint n'ouvrant aucune requête base, la RLS ne rattrapait pas un faux
// jeton — un Bearer bidon suffisait à consommer le quota Nominatim.
export default async function handler(req, res, fetchImpl, authImpl = requireUser) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  // Auth durcie : jeton absent/invalide/expiré → 401 (défense en profondeur).
  const result = await authImpl(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { value, error } = validateGeocodeQuery(queryParams(req));
  if (error) return fail(res, 400, 'Requête invalide');

  if (!gardeNominatim()) {
    res.setHeader('Retry-After', '1');
    return fail(res, 429, 'Trop de requêtes');
  }

  const fetcher = fetchImpl || fetchWithTimeout;
  try {
    const reponse = await fetcher(buildNominatimUrl(value.q, value.limit), {
      headers: {
        'User-Agent': process.env.GEOCODE_USER_AGENT || USER_AGENT_DEFAUT,
        Accept: 'application/json',
      },
    });

    if (!reponse.ok) {
      // 429 amont = on approche du quota ; 4xx/5xx : jamais de détail au client.
      logError('geocode:upstream', reponse.status);
      const retryAfter =
        reponse.status === 429 && reponse.headers && typeof reponse.headers.get === 'function'
          ? reponse.headers.get('retry-after')
          : null;
      if (retryAfter) res.setHeader('Retry-After', retryAfter);
      return fail(res, 503, 'Service de géocodage indisponible');
    }

    let corps = null;
    try {
      corps = await reponse.json();
    } catch {
      corps = null;
    }
    const results = mapNominatimResults(corps);
    if (results === null) {
      logError('geocode:parse');
      return fail(res, 503, 'Service de géocodage indisponible');
    }

    // [] est une réponse valide (aucune correspondance), pas une erreur.
    return ok(res, { results: results.slice(0, value.limit) });
  } catch (err) {
    // Timeout (abort), réseau : indisponibilité amont — jamais la query en log.
    logError('geocode:upstream', err?.name);
    return fail(res, 503, 'Service de géocodage indisponible');
  }
}
