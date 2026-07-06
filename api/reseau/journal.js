// /api/reseau/journal — entrées « où j'en suis ». POST (création sur un nœud
// OU une relation), PATCH (édition / relance faite), DELETE (id requis).

import { createUserClient, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateJournal, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

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
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateJournal(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('journal')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'journal:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateJournal(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('journal')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'journal:patch');
      if (!data) return fail(res, 404, 'Entrée introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('journal')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'journal:delete');
    if (!data) return fail(res, 404, 'Entrée introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('journal:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK vers un nœud/relation inexistant ou non possédé → 400.
  if (error.code === '23503') return fail(res, 400, 'Cible introuvable');
  // Violation de CHECK (cible exclusive, relance sans étape) → 400 générique.
  if (error.code === '23514') return fail(res, 400, 'Données invalides');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
