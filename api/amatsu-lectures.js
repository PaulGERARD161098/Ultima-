// /api/amatsu-lectures — les lectures d'AMATSU, le dragon de l'air (boucle 2a,
// CADRAGE-IMLADRIK.md §12, 18/10/2026).
//   GET    → mes lectures, les plus récentes d'abord (bornées à 200).
//   POST   → enregistre une lecture { objet, bise, souffle, ouragan }. owner_id
//            imposé par le défaut base ; la date par le serveur.
//   DELETE → supprime une lecture (c'est aussi le geste du « défaire » de Léo :
//            api/_lib/leo-execution.js, DEFAIRES).
// Une lecture se crée ou se supprime — elle ne se modifie pas (pas de policy
// UPDATE : le vent retombe, une lecture se relit). Miroir de api/flammes.js.
// §5 intime : erreurs génériques côté client, détail en log SANS contenu.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateLectureAmatsu, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'DELETE'];
const LIMITE_LISTE = 200;

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

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
      const { data, error: dbError } = await client
        .from('amatsu_lectures')
        .select('id, objet, bise, souffle, ouragan, created_at')
        .order('created_at', { ascending: false })
        .limit(LIMITE_LISTE);
      if (dbError) return dbFail(res, dbError, 'amatsu-lectures:get');
      return ok(res, data || []);
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateLectureAmatsu(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('amatsu_lectures')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'amatsu-lectures:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('amatsu_lectures')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'amatsu-lectures:delete');
    if (!data) return fail(res, 404, 'Lecture introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('amatsu-lectures:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
