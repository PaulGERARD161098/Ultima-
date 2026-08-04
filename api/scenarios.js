// /api/scenarios — un futur potentiel d'une situation VRANESH (« dérouler le cas »).
//   POST   → ajoute un scénario { situation_id, deroule, vraisemblance?, signaux?, parade? }.
//            owner_id imposé par le défaut base ; le scellement composite
//            (owner_id, situation_id) empêche d'anticiper la situation d'un autre owner.
//   DELETE → supprime un scénario.
// Un scénario se crée ou se supprime — il ne se modifie pas (0017 : pas
// d'updated_at). Miroir EXACT de api/flammes.js (VRANESH ↔ DRAUKHAIN). §5 intime.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateScenario, isUuid } from './_lib/validate.js';

const ALLOWED = ['POST', 'PATCH', 'DELETE'];

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : situation inexistante (ou non visible à l'owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Situation liée introuvable');
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
      const { value, error } = validateScenario(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('scenarios')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'scenarios:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      // 0020 — QUALIFIER un plan dans un thème « construction » : tenu, en
      // réserve, écarté (et alors pourquoi). Le déroulé, lui, ne se modifie
      // toujours pas : un futur écrit reste ce qu'il était (0017, pas
      // d'updated_at). Seule la qualification bouge, parce qu'elle EST le
      // mouvement du plan — c'est ce que la dictée appelle l'adaptation.
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const id = resolveId(req, body);
      if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

      const { id: _ignore, ...champs } = body;
      const { value, error } = validateScenario(champs, 'update');
      if (error) return fail(res, 400, error);
      // Le déroulé n'est pas modifiable : on le refuse explicitement plutôt que
      // de l'écrire en silence (validateScenario l'accepterait en 'update').
      if ('deroule' in value) return fail(res, 400, 'Le déroulé ne se modifie pas');

      const { data, error: dbError } = await client
        .from('scenarios')
        .update(value)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'scenarios:patch');
      if (!data) return fail(res, 404, 'Scénario introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('scenarios')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'scenarios:delete');
    if (!data) return fail(res, 404, 'Scénario introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('scenarios:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
