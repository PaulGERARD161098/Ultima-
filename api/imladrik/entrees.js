// /api/imladrik/entrees — CRUD d'une page de journal IMLADRIK. POST (création),
// PATCH (maj partielle), DELETE. L'owner_id n'est jamais accepté du client : il
// est imposé par le défaut base (auth.uid()) + RLS. Données intimes (§5) :
// aucun contenu en log, erreurs client génériques.

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateEntreeImladrik, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

// Récupère l'id ciblé (query prioritaire, sinon corps).
function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

// Mappe une erreur Supabase vers une réponse client générique (sans détail).
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  try {
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateEntreeImladrik(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('imladrik_entrees')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'imladrik:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateEntreeImladrik(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('imladrik_entrees')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'imladrik:patch');
      if (!data) return fail(res, 404, 'Page introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('imladrik_entrees')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'imladrik:delete');
    if (!data) return fail(res, 404, 'Page introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('imladrik:entrees:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
