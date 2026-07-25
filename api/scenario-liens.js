// /api/scenario-liens — passerelle v2 : un scénario VRANESH relié à un serment
// DRAUKHAIN XOR une page MINETHNIR (« ce futur menace/sert un objectif / vient d'une page »).
//   POST   → crée un lien { scenario_id, serment_id?, entree_id?, rapport? }.
//            rapport ('menace'|'sert') réservé à la cible serment. owner_id imposé
//            serveur ; double scellement (owner, source)/(owner, cible).
//   DELETE → supprime un lien { id }.
// Un lien se crée ou se supprime. Miroir de api/serment-liens.js. §5 intime.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok, fail, bodyFail, methodNotAllowed, logError, readJsonBody,
} from './_lib/http.js';
import { validateScenarioLien, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  if (error?.code === '23503') return fail(res, 400, 'Objet lié introuvable');
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
      const { value, error } = validateScenarioLien(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('scenario_liens').insert(value).select().single();
      if (dbError) return dbFail(res, dbError, 'scenario-liens:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('scenario_liens').delete().eq('id', id).select().maybeSingle();
    if (dbError) return dbFail(res, dbError, 'scenario-liens:delete');
    if (!data) return fail(res, 404, 'Lien introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('scenario-liens:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
