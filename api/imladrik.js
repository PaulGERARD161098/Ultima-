// GET /api/imladrik → { ok:true, data:{ entrees } } de l'utilisateur (RLS via jeton).
// Quadrant IMLADRIK (v1) : le journal intime en base, privé par owner. Page la
// plus récente en tête (order created_at desc). Données intimes (§5) : jamais de
// contenu en log, erreurs client génériques.

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { client } = result;

  try {
    const { data, error } = await client
      .from('imladrik_entrees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('imladrik:get', error.code);
      return fail(res, 500, 'Erreur interne');
    }

    return ok(res, { entrees: data || [] });
  } catch (err) {
    logError('imladrik:get:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
