// /api/reseau/rattachements — le lien PERSONNE × NŒUD × RÔLE (RIVEN 0024).
// POST (rattacher), PATCH (changer le rôle), DELETE (détacher).
//
// C'est ce point d'entrée qui rend vraies les deux demandes de Paul : ne jamais
// l'appeler laisse une personne SANS aucun nœud ; l'appeler N fois pose la même
// personne sur N fiches, avec un rôle différent sur chacune.
//
// Les deux identifiants sont FIGÉS à la création (motif des edges RIVEN : on ne
// déplace pas un lien, on le retire et on le recrée) — seul le rôle est mutable.
// L'owner_id n'est jamais accepté du client ; le double scellement de 0024
// interdit en outre tout lien croisant deux owners.

import { requireUser, isAuthError } from '../_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from '../_lib/http.js';
import { validateRattachement, isUuid } from '../_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

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
      const { value, error } = validateRattachement(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('personne_noeuds')
        .insert(value)
        .select()
        .single();
      // 23505 = doublon (personne déjà rattachée à cette fiche) : ce n'est pas
      // une erreur interne, c'est un geste déjà fait. On le dit clairement.
      if (dbError?.code === '23505') {
        return fail(res, 409, 'Cette personne est déjà rattachée à cette fiche');
      }
      if (dbError) return dbFail(res, dbError, 'rattachements:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignored, ...fields } = body;
      const { value, error } = validateRattachement(fields, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('personne_noeuds')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'rattachements:patch');
      if (!data) return fail(res, 404, 'Rattachement introuvable');
      return ok(res, data);
    }

    // DELETE — détache. Ni la personne ni la fiche ne sont supprimées.
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('personne_noeuds')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'rattachements:delete');
    if (!data) return fail(res, 404, 'Rattachement introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('rattachements:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  logError(context, error.code);
  return fail(res, 500, 'Erreur interne');
}
