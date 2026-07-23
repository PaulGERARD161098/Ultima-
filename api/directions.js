// /api/directions — le cap d'un idéal ZEKROM (« un idéal → une direction »).
//   POST   → ajoute une direction { ideal_id, formulation }. owner_id imposé par
//            le défaut base ; le scellement composite (owner_id, ideal_id) empêche
//            d'orienter l'idéal d'un autre owner.
//   DELETE → supprime une direction.
// Une direction se crée ou se supprime — elle ne se modifie pas (0010 : pas
// d'updated_at). Miroir EXACT de api/preuves.js (ZEKROM ↔ RESHIRAM).

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateDirection, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : idéal inexistant (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Idéal lié introuvable');
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
      const { value, error } = validateDirection(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('directions')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'directions:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('directions')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'directions:delete');
    if (!data) return fail(res, 404, 'Direction introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('directions:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
