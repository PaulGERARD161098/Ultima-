// /api/reseau/edges — CRUD relation. POST (création), DELETE (id requis).

import { createUserClient, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateEdge, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const result = createUserClient(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  try {
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null) return fail(res, 400, 'JSON invalide');
      const { value, error } = validateEdge(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('network_edges')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'edges:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body || {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('network_edges')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'edges:delete');
    if (!data) return fail(res, 404, 'Relation introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('edges:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // Violation de FK (nœud inexistant / non possédé) → 400 côté client.
  if (error.code === '23503') return fail(res, 400, 'Nœud référencé introuvable');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
