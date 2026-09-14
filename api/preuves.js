// /api/preuves — le socle factuel d'un talent RESHIRAM (une réalisation, un chiffre).
//   POST   → ajoute une preuve { talent_id, contenu }. owner_id imposé par le
//            défaut base ; le scellement composite (owner_id, talent_id) empêche
//            d'étayer le talent d'un autre owner.
//   DELETE → supprime une preuve.
// Une preuve se crée ou se supprime — elle ne se modifie pas (0009 : pas d'updated_at).
// Mêmes motifs que api/idees/liens.js.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validatePreuve, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : talent inexistant (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Talent lié introuvable');
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
      const { value, error } = validatePreuve(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('preuves')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'preuves:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('preuves')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'preuves:delete');
    if (!data) return fail(res, 404, 'Preuve introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('preuves:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
