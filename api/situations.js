import { readAll } from './_lib/read-all.js';
// /api/situations — la carte des situations VRANESH (v1), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ situations:[…], scenarios:[…] } }
//            situations = vue situations_etat (chaque situation porte nb_scenarios + a_explorer) ;
//            scenarios = les scénarios de l'utilisateur (rattachés côté front par situation_id).
//   POST   → crée une situation { intitule, contexte? }. owner_id n'est JAMAIS
//            accepté du client : il est imposé par le défaut base.
//   PATCH  → pose le DÉNOUEMENT (0019) : « la branche qui a poussé ». Désigne le
//            scénario advenu, PUIS supprime les autres branches potentielles de
//            cette situation (décision Paul, geste irréversible confirmé côté
//            front). scenario_advenu_id: null rouvre la situation sans rien
//            supprimer.
//   DELETE → supprime une situation (ses scénarios suivent en cascade).
// Miroir EXACT de api/serments.js (VRANESH ↔ DRAUKHAIN). Données intimes (§5).

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateSituation, validateDenouement, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'PATCH', 'DELETE'];

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
      // Toute lecture en erreur doit rester visible : jamais une liste vide trompeuse.
      const [situationsRes, scenariosRes, liensRes] = await Promise.all([
        readAll(() => client.from('situations_etat').select('*').order('created_at', { ascending: true })),
        readAll(() => client.from('scenarios').select('*').order('created_at', { ascending: true })),
        readAll(() => client.from('scenario_liens').select('*').order('created_at', { ascending: true })),
      ]);
      const error = situationsRes.error || scenariosRes.error || liensRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('situations:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        situations: situationsRes.data || [],
        scenarios: scenariosRes.data || [],
        liens: liensRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateSituation(body, 'create');
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('situations')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'situations:post');
      return ok(res, data);
    }

    if (req.method === 'PATCH') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);

      // 0020 — CHANGER LA NATURE d'un thème (direction ↔ construction). C'est
      // un geste distinct du dénouement, et il n'entraîne AUCUNE suppression :
      // un thème qui bascule garde tous ses plans, simplement pas encore
      // qualifiés. Les deux gestes ne se mélangent pas dans un même corps.
      if ('nature' in body) {
        if (!isUuid(body.id)) return fail(res, 400, 'Identifiant invalide');
        const { id: _ignore, ...champs } = body;
        const nat = validateSituation(champs, 'update');
        if (nat.error) return fail(res, 400, nat.error);
        if (!('nature' in nat.value) || Object.keys(nat.value).length !== 1) {
          return fail(res, 400, 'La nature se change seule');
        }
        const { data: majNature, error: erreurNature } = await client
          .from('situations')
          .update({ nature: nat.value.nature })
          .eq('id', body.id)
          .select('id, nature')
          .maybeSingle();
        if (erreurNature) return dbFail(res, erreurNature, 'situations:patch:nature');
        if (!majNature) return fail(res, 404, 'Situation introuvable');
        return ok(res, majNature);
      }

      const { value, error } = validateDenouement(body);
      if (error) return fail(res, 400, error);

      // Choix + coupe atomiques, sous RLS : aucun succès partiel possible.
      const { data, error: dbError } = await client.rpc('denouer_situation', {
        p_situation: value.id, p_scenario: value.scenario_advenu_id,
      });
      if (dbError) {
        if (dbError.code === 'PGRST202') return fail(res, 503, 'Dénouement temporairement indisponible');
        if (dbError.code === '23503') return fail(res, 400, 'Scénario référencé introuvable');
        return dbFail(res, dbError, 'situations:patch');
      }
      if (!data) return fail(res, 404, 'Situation introuvable');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('situations')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'situations:delete');
    if (!data) return fail(res, 404, 'Situation introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('situations:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
