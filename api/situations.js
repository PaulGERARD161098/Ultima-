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
      // liens = passerelles v2 (scénario → serment DRAUKHAIN / page MAEDRETHNIR,
      // migration 0018). Tant que 0018 n'est pas appliquée, la table n'existe pas
      // → dégradation propre à [] (les autres lectures restent servies).
      const [situationsRes, scenariosRes, liensRes] = await Promise.all([
        client.from('situations_etat').select('*').order('created_at', { ascending: true }),
        client.from('scenarios').select('*').order('created_at', { ascending: true }),
        client.from('scenario_liens').select('*').order('created_at', { ascending: true }),
      ]);
      const error = situationsRes.error || scenariosRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('situations:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        situations: situationsRes.data || [],
        scenarios: scenariosRes.data || [],
        liens: liensRes.error ? [] : (liensRes.data || []),
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

      // ORDRE VOLONTAIRE — la branche retenue est protégée AVANT que les autres
      // ne soient coupées. La FK du triplet (owner_id, situation_id, id) rejette
      // ici tout scénario qui n'appartiendrait pas à CETTE situation ou à un
      // autre owner : si l'écriture passe, la cible est certaine. Un échec après
      // ce point laisse la situation dénouée mais complète — jamais l'inverse.
      const advenu = value.scenario_advenu_id;
      const { data, error: dbError } = await client
        .from('situations')
        .update({
          scenario_advenu_id: advenu,
          // La date vient du serveur, jamais du client.
          advenu_le: advenu === null ? null : new Date().toISOString(),
        })
        .eq('id', value.id)
        .select()
        .maybeSingle();
      if (dbError) return dbFail(res, dbError, 'situations:patch');
      if (!data) return fail(res, 404, 'Situation introuvable');

      // Rouvrir une situation ne supprime rien : on s'arrête là.
      if (advenu === null) return ok(res, { id: data.id, scenario_advenu_id: null, coupees: 0 });

      // Le futur a tranché : les autres branches potentielles sont supprimées
      // (décision Paul). RLS + le filtre situation_id bornent la coupe à cette
      // situation ; la branche retenue en est exclue explicitement.
      const { data: coupees, error: coupeError } = await client
        .from('scenarios')
        .delete()
        .eq('situation_id', value.id)
        .neq('id', advenu)
        .select('id');
      if (coupeError) return dbFail(res, coupeError, 'situations:patch:coupe');

      return ok(res, {
        id: data.id,
        scenario_advenu_id: advenu,
        advenu_le: data.advenu_le,
        coupees: (coupees || []).length,
      });
    }

    // DELETE
    const body = await readJsonBody(req).catch(() => ({}));
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
