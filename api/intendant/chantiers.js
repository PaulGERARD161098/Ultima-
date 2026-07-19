// /api/intendant/chantiers — dossier chantier de l'INTENDANT. POST (ouvrir),
// PATCH (renseigner/décaler la pose), DELETE (fermer + cascade des besoins).
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
import { validateChantierIntendant, isUuid } from '../_lib/validate.js';

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
  // Un dossier existe déjà pour ce chantier (unicité owner_id, node_id).
  if (error?.code === '23505') return fail(res, 409, 'Un dossier existe déjà pour ce chantier');
  // FK / scellement croisé : node inexistant ou d'un autre owner.
  if (error?.code === '23503') return fail(res, 400, 'Chantier introuvable');
  // CHECK : incohérence rattrapée par la base (backstop de la validation API).
  if (error?.code === '23514') return fail(res, 400, 'Données de chantier invalides');
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
      const { value, error } = validateChantierIntendant(body, 'create');
      if (error) return fail(res, 400, error);

      // Contrôle non exprimable en FK : le node référencé doit exister, appartenir
      // à l'owner ET être de type 'chantier'. Le client est RLS-scopé (owner_id =
      // auth.uid()) → un node d'un autre owner est invisible, donc traité comme
      // introuvable. On ne lit que les colonnes utiles (jamais select *).
      const { data: node, error: nodeError } = await client
        .from('network_nodes')
        .select('id, type')
        .eq('id', value.node_id)
        .maybeSingle();
      if (nodeError) return dbFail(res, nodeError, 'intendant:chantiers:post:node');
      if (!node || node.type !== 'chantier') {
        return fail(res, 400, 'Chantier introuvable ou de type invalide');
      }

      const { data, error: dbError } = await client
        .from('intendant_chantiers')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'intendant:chantiers:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateChantierIntendant(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('intendant_chantiers')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'intendant:chantiers:patch');
      if (!data) return fail(res, 404, 'Dossier chantier introuvable');
      return ok(res, data);
    }

    // DELETE — supprime le dossier ET ses besoins (cascade en base).
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('intendant_chantiers')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'intendant:chantiers:delete');
    if (!data) return fail(res, 404, 'Dossier chantier introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('intendant:chantiers:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
