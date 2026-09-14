import { readAll } from './_lib/read-all.js';
// /api/ideaux — la carte des idéaux ZEKROM (v1), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ ideaux:[…], directions:[…] } }
//            ideaux = vue ideaux_etat (chaque idéal porte nb_directions + a_orienter) ;
//            directions = les directions de l'utilisateur (rattachées côté front par ideal_id).
//   POST   → crée un idéal { intitule, registre?, horizon? }. owner_id n'est
//            JAMAIS accepté du client : il est imposé par le défaut base.
//   DELETE → supprime un idéal (ses directions suivent en cascade).
// Miroir EXACT de api/talents.js (ZEKROM ↔ RESHIRAM).

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateIdeal, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'DELETE'];

// Récupère l'id ciblé (query prioritaire, sinon corps).
function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

// Mappe une erreur Supabase vers une réponse client générique (sans PII).
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
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
    if (req.method === 'GET') {
      const [ideauxRes, directionsRes] = await Promise.all([
        readAll(() => client.from('ideaux_etat').select('*').order('created_at', { ascending: true })),
        readAll(() => client.from('directions').select('*').order('created_at', { ascending: true })),
      ]);
      const error = ideauxRes.error || directionsRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('ideaux:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        ideaux: ideauxRes.data || [],
        directions: directionsRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateIdeal(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('ideaux')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'ideaux:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('ideaux')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'ideaux:delete');
    if (!data) return fail(res, 404, 'Idéal introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('ideaux:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
