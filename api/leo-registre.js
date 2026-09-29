// Registre LV1 : identité vérifiée par requireUser, droits et écritures dans RPC.
// Aucun service_role, SQL libre, création de mandat ou adaptateur externe.
// Sans installation approuvée de la proposition SQL, réponse 503 fermée.
import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, bodyFail, methodNotAllowed, readJsonBody, logError } from './_lib/http.js';
import { isUuid } from './_lib/validate.js';

const METHODS = ['GET', 'POST'];
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const exact = (value, keys) => plain(value) && Object.keys(value).length === keys.length
  && keys.every(key => Object.hasOwn(value, key));

function databaseFailure(res, error) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  if (error?.code === '42501') return fail(res, 403, 'Mission indisponible pour cet accès');
  if (error?.code === '22023') return fail(res, 400, 'Commande invalide');
  if (error?.code === '40001') return fail(res, 409, 'Version ou opération divergente : relisez le registre');
  if (error?.code === 'P0001') return fail(res, 409, 'Action refusée par le mandat ou le budget');
  if (['PGRST202', '42P01', '42883'].includes(error?.code))
    return fail(res, 503, 'Registre non activé');
  logError('leo:registre:rpc', error?.code);
  return fail(res, 503, 'Résultat incertain : consultez le registre avant tout nouvel essai');
}

export default async function handler(req, res) {
  if (!METHODS.includes(req.method)) return methodNotAllowed(res, METHODS);
  const auth = await requireUser(req);
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');
  try {
    let name, args;
    if (req.method === 'GET') {
      if (!exact(req.query, ['mission']) || !isUuid(req.query.mission))
        return fail(res, 400, 'Mission invalide');
      name = 'leo_status'; args = { p_mission: req.query.mission };
    } else {
      const body = await readJsonBody(req);
      if (!plain(body)) return bodyFail(res, body);
      if (body.action === 'stop' && exact(body, ['action', 'mission']) && isUuid(body.mission)) {
        name = 'leo_stop'; args = { p_mission: body.mission };
      } else if (body.action === 'write_memory'
        && exact(body, ['action', 'mission', 'operation_id', 'expected_version', 'patch'])
        && isUuid(body.mission) && typeof body.operation_id === 'string'
        && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(body.operation_id)
        && Number.isSafeInteger(body.expected_version) && body.expected_version > 0
        && plain(body.patch) && Object.keys(body.patch).length > 0
        && Object.keys(body.patch).every(key => ['state', 'next_action'].includes(key))
        && (!Object.hasOwn(body.patch, 'state') || (typeof body.patch.state === 'string'
          && body.patch.state.length > 0 && body.patch.state.length <= 100))
        && (!Object.hasOwn(body.patch, 'next_action') || (typeof body.patch.next_action === 'string'
          && body.patch.next_action.length <= 4000))) {
        name = 'leo_write_memory'; args = { p_mission: body.mission,
          p_operation: body.operation_id, p_expected_version: body.expected_version, p_patch: body.patch };
      } else return fail(res, 400, 'Commande invalide ou non disponible');
    }
    // Une seule RPC : le SQL contrôle et enregistre effet/résultat/budget ensemble.
    // Aucun rejeu réseau à l'intérieur de cette route.
    const { data, error } = await auth.client.rpc(name, args);
    if (error) return databaseFailure(res, error);
    if (!plain(data)) return fail(res, 503, 'Résultat incertain : consultez le registre');
    return ok(res, data);
  } catch (error) {
    logError('leo:registre:exception', error?.name);
    return fail(res, 503, 'Résultat incertain : consultez le registre avant tout nouvel essai');
  }
}
