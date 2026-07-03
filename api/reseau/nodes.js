// /api/reseau/nodes — CRUD nœud. POST (création), PATCH (maj partielle), DELETE.
// L'owner_id n'est jamais accepté du client : il est imposé par la RLS/insert.

import { createUserClient, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateNode, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

// Récupère l'id ciblé (query prioritaire, sinon corps).
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
      const { value, error } = validateNode(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('network_nodes')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'nodes:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null) return fail(res, 400, 'JSON invalide');
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      // On retire id du corps avant validation (champ non modifiable).
      const { id: _ignored, ...fields } = body;
      const { value, error } = validateNode(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('network_nodes')
        .update(value)
        .eq('id', id)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'nodes:patch');
      if (!data) return fail(res, 404, 'Nœud introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body || {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('network_nodes')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'nodes:delete');
    if (!data) return fail(res, 404, 'Nœud introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('nodes:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}

// Mappe une erreur Supabase vers une réponse client générique.
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
