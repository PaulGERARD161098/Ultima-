// /api/intendant/besoins — lignes de besoin d'un chantier. POST (ajouter),
// PATCH (maj partielle : couverture `mode`, contrôle réception `controle`…),
// DELETE. L'état (`etat`) est une colonne GÉNÉRÉE : jamais accepté en entrée.
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
import { validateBesoinIntendant, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK / scellement : chantier inexistant ou d'un autre owner, ou fournisseur
  // introuvable → 400 générique (pas de fuite de l'existence d'une ressource).
  if (error?.code === '23503') return fail(res, 400, 'Chantier ou fournisseur introuvable');
  // CHECK : incohérence rattrapée par la base (backstop de la validation API).
  if (error?.code === '23514') return fail(res, 400, 'Données de besoin invalides');
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
      const { value, error } = validateBesoinIntendant(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('intendant_besoins')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'intendant:besoins:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateBesoinIntendant(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('intendant_besoins')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'intendant:besoins:patch');
      if (!data) return fail(res, 404, 'Besoin introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('intendant_besoins')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'intendant:besoins:delete');
    if (!data) return fail(res, 404, 'Besoin introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('intendant:besoins:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
