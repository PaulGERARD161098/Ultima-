// /api/flammes — un rappel de foi d'un serment DRAUKHAIN (« entretenir la flamme »).
//   POST   → ajoute une flamme { serment_id, texte, nature? }. owner_id imposé par
//            le défaut base ; le scellement composite (owner_id, serment_id) empêche
//            d'entretenir le serment d'un autre owner.
//   DELETE → supprime une flamme.
// Une flamme se crée ou se supprime — elle ne se modifie pas (0016 : pas
// d'updated_at). Miroir EXACT de api/directions.js (DRAUKHAIN ↔ ZEKROM). §5 intime.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateFlamme, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : serment inexistant (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Serment lié introuvable');
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
      const { value, error } = validateFlamme(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('flammes')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'flammes:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('flammes')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'flammes:delete');
    if (!data) return fail(res, 404, 'Flamme introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('flammes:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
