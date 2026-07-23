// /api/passerelles — la passerelle R↔Z (LV2-③), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ passerelles:[…], retroplanning:[…] } }
//            passerelles = les liens idéal↔talent de l'utilisateur ;
//            retroplanning = vue ideaux_retroplanning (par idéal : nb_acquis,
//            nb_a_construire) pour le bilan « ce que j'ai / ce qui me manque ».
//   POST   → crée un lien { ideal_id, talent_id, nature, note? }. owner_id imposé
//            par le défaut base ; le double scellement empêche de croiser les
//            données d'un autre owner.
//   PATCH  → met à jour la nature/note d'un lien (les FK sont figées).
//   DELETE → supprime un lien.
// Mêmes motifs que api/ideaux.js + api/reseau/edges.js (update partiel).

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validatePasserelle, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'PATCH', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : idéal ou talent inexistant (ou d'un autre owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Idéal ou talent lié introuvable');
  // Unicité : lien déjà existant sur cette paire (idéal, talent).
  if (error?.code === '23505') return fail(res, 409, 'Lien déjà existant');
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
      const [liensRes, retroRes] = await Promise.all([
        client.from('passerelles').select('*').order('created_at', { ascending: true }),
        client.from('ideaux_retroplanning').select('*'),
      ]);
      const error = liensRes.error || retroRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('passerelles:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        passerelles: liensRes.data || [],
        retroplanning: retroRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validatePasserelle(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('passerelles')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'passerelles:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');
      // id n'est pas un champ modifiable : on le retire avant validation.
      const patch = { ...body };
      delete patch.id;
      const { value, error } = validatePasserelle(patch, 'update');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('passerelles')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'passerelles:patch');
      if (!data) return fail(res, 404, 'Lien introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('passerelles')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'passerelles:delete');
    if (!data) return fail(res, 404, 'Lien introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('passerelles:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
