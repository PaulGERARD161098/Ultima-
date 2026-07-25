// /api/serments — la carte des serments DRAUKHAIN (v1), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ serments:[…], flammes:[…] } }
//            serments = vue serments_etat (chaque serment porte nb_flammes + a_raviver) ;
//            flammes = les flammes de l'utilisateur (rattachées côté front par serment_id).
//   POST   → crée un serment { intitule, pourquoi?, horizon? }. owner_id n'est
//            JAMAIS accepté du client : il est imposé par le défaut base.
//   DELETE → supprime un serment (ses flammes suivent en cascade).
// Miroir EXACT de api/ideaux.js (DRAUKHAIN ↔ ZEKROM). Données intimes (§5).

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateSerment, isUuid } from './_lib/validate.js';

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
      const [sermentsRes, flammesRes] = await Promise.all([
        client.from('serments_etat').select('*').order('created_at', { ascending: true }),
        client.from('flammes').select('*').order('created_at', { ascending: true }),
      ]);
      const error = sermentsRes.error || flammesRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('serments:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        serments: sermentsRes.data || [],
        flammes: flammesRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateSerment(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('serments')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'serments:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('serments')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'serments:delete');
    if (!data) return fail(res, 404, 'Serment introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('serments:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
