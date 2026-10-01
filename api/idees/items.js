// /api/idees/items — CRUD d'une idée. POST (création), PATCH (maj partielle), DELETE.
// L'owner_id n'est jamais accepté du client : il est imposé par la RLS/insert.

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateIdee, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

// Récupère l'id ciblé (query prioritaire, sinon corps).
function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

// Mappe une erreur Supabase vers une réponse client générique.
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // Collision de l'ID métier (owner_id, adr_num) : conflit, message générique.
  if (error?.code === '23505') return fail(res, 409, 'Cette idée existe déjà');
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
      const { value, error } = validateIdee(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('idees')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'idees:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const conditionnelle = Object.hasOwn(body, 'essence_attendue');
      const { id: _ignored, essence_attendue, ...fields } = body;
      if (conditionnelle && (!Object.hasOwn(fields, 'essence') ||
          !(essence_attendue === null ||
            (typeof essence_attendue === 'string' && essence_attendue.length <= 2000)))) {
        return fail(res, 400, 'Essence attendue invalide');
      }
      const { value, error } = validateIdee(fields, 'update');
      if (error) return fail(res, 400, error);

      let mutation = client
        .from('idees')
        .update(value)
        .eq('id', id);
      // Comparaison et écriture dans la même requête ; aucune lecture puis écriture.
      // Le client authentifié et les règles RLS restent applicables.
      if (conditionnelle) mutation = essence_attendue === null
        ? mutation.is('essence', null)
        : mutation.eq('essence', essence_attendue);
      const { data, error: dbError } = await mutation.select().maybeSingle();
      if (dbError) return dbFail(res, dbError, 'idees:patch');
      if (!data) return fail(res, conditionnelle ? 409 : 404,
        conditionnelle ? 'Idée modifiée ou indisponible : rechargez avant de réessayer' : 'Idée introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('idees')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'idees:delete');
    if (!data) return fail(res, 404, 'Idée introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('idees:items:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
