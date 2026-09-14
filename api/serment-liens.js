// /api/serment-liens — passerelle v2 : un serment DRAUKHAIN relié à un idéal
// ZEKROM XOR une page MAEDRETHNIR (« un serment naît d'un idéal / se suit dans le journal »).
//   POST   → crée un lien { serment_id, ideal_id? , entree_id? } (exactement une cible).
//            owner_id imposé serveur ; double scellement (owner, source)/(owner, cible).
//   DELETE → supprime un lien { id }.
// Un lien se crée ou se supprime — il ne se modifie pas. Miroir de api/flammes.js.
// §5 intime : erreurs génériques, aucun contenu en log.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok, fail, bodyFail, methodNotAllowed, logError, readJsonBody,
} from './_lib/http.js';
import { validateSermentLien, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : cible/source inexistante (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Objet lié introuvable');
  // Unique : lien déjà posé sur cette cible.
  if (error?.code === '23505') return fail(res, 409, 'Lien déjà établi');
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
      const { value, error } = validateSermentLien(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('serment_liens').insert(value).select().single();
      if (dbError) return dbFail(res, dbError, 'serment-liens:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('serment_liens').delete().eq('id', id).select().maybeSingle();
    if (dbError) return dbFail(res, dbError, 'serment-liens:delete');
    if (!data) return fail(res, 404, 'Lien introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('serment-liens:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
