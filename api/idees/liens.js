// /api/idees/liens — ponts entre idées. POST (création), DELETE. Un pont se crée
// ou se supprime, il ne se modifie pas. L'owner_id est imposé par la RLS/insert.

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateLien, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // Paire déjà reliée (unicité non orientée) → conflit générique.
  if (error?.code === '23505') return fail(res, 409, 'Ce pont existe déjà');
  // FK : idée source/cible inexistante (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Idée liée introuvable');
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
      const { value, error } = validateLien(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('idees_liens')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'liens:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('idees_liens')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'liens:delete');
    if (!data) return fail(res, 404, 'Pont introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('liens:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
