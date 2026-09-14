// /api/reseau/personnes — CRUD d'une PERSONNE (RIVEN 0024). POST, PATCH, DELETE.
// Une personne existe par elle-même : sa création n'implique AUCUN nœud
// (« renseigner des contacts sans forcément créer des nœuds »). Ses liens vers
// les fiches vivent dans /api/reseau/rattachements, jamais ici.
// L'owner_id n'est jamais accepté du client : il est imposé par la RLS/insert.
// Miroir strict de nodes.js (mêmes gardes, mêmes codes, mêmes messages).

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validatePersonne, isUuid } from '../_lib/validate.js';

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

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  try {
    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validatePersonne(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('personnes')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'personnes:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      // On retire id du corps avant validation (champ non modifiable).
      const { id: _ignored, ...fields } = body;
      const { value, error } = validatePersonne(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('personnes')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'personnes:patch');
      if (!data) return fail(res, 404, 'Personne introuvable');
      return ok(res, data);
    }

    // DELETE — retire la personne ET ses rattachements (ON DELETE CASCADE de
    // 0024). Aucune fiche RIVEN n'est touchée : le lien disparaît, pas le nœud.
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('personnes')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'personnes:delete');
    if (!data) return fail(res, 404, 'Personne introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('personnes:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}

// Mappe une erreur Supabase vers une réponse client générique.
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
