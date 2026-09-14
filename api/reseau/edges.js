// /api/reseau/edges — CRUD relation. POST (création), PATCH (pilotage :
// statut/efforts/raison d'arrêt), DELETE (id requis).

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateEdge, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
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
      const { value, error } = validateEdge(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('network_edges')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'edges:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateEdge(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('network_edges')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'edges:patch');
      if (!data) return fail(res, 404, 'Relation introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
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
  // Unicité de la paire active (0005) → 409 explicite.
  if (error.code === '23505') {
    return fail(res, 409, 'Une relation active de ce type existe déjà entre ces deux nœuds');
  }
  // Violation de CHECK (ex. arrêt non justifié) → 400 générique.
  if (error.code === '23514') return fail(res, 400, 'Données invalides');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
