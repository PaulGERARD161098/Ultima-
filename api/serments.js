import { readAll } from './_lib/read-all.js';
// /api/serments — la carte des serments DRAUKHAIN (v1), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ serments:[…], flammes:[…], liens:[…], futurs:[…] } }
//            serments = vue serments_etat (chaque serment porte nb_flammes + a_raviver) ;
//            flammes = les flammes de l'utilisateur (rattachées côté front par serment_id) ;
//            liens = passerelles sortantes (serment → idéal ZEKROM | page MAEDRETHNIR) ;
//            futurs = passerelles ENTRANTES depuis VRANESH (un futur qui MENACE
//                     ou qui SERT ce serment), déjà recousues côté serveur.
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

// Le retour de la passerelle : pour chaque lien scénario → serment, la ligne
// que DRAUKHAIN affichera. Fonction PURE (aucun accès réseau) — elle ne fait
// que recoudre trois lectures déjà bornées par RLS.
// Tolérante par construction : une lecture en erreur (table absente, migration
// non appliquée) vaut liste vide, et un lien dont la cible a disparu est
// ignoré plutôt que rendu à moitié.
export function joindreFuturs(liensRes, scenariosRes, situationsRes) {
  const liens = liensRes?.error ? [] : (liensRes?.data || []);
  const scenarios = scenariosRes?.error ? [] : (scenariosRes?.data || []);
  const situations = situationsRes?.error ? [] : (situationsRes?.data || []);
  if (liens.length === 0) return [];

  const parScenario = new Map(scenarios.map((s) => [s.id, s]));
  const parSituation = new Map(situations.map((s) => [s.id, s]));

  return liens
    .filter((l) => l && l.serment_id && l.scenario_id)
    .map((l) => {
      const sc = parScenario.get(l.scenario_id);
      if (!sc) return null;
      const situation = parSituation.get(sc.situation_id) || {};
      return {
        id: l.id,
        serment_id: l.serment_id,
        scenario_id: sc.id,
        situation_id: sc.situation_id,
        rapport: l.rapport || null,
        deroule: sc.deroule || '',
        theme: situation.intitule || '',
        // Ce futur EST celui qui a poussé : le serment a été servi (ou heurté)
        // pour de vrai, ce n'est plus une hypothèse.
        advenu: Boolean(situation.scenario_advenu_id)
          && situation.scenario_advenu_id === sc.id,
      };
    })
    .filter(Boolean);
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
      // Les passerelles sont requises : une panne ne devient pas « aucun lien ».
      const [sermentsRes, flammesRes, liensRes, scLiensRes, scenariosRes, situationsRes] =
        await Promise.all([
          readAll(() => client.from('serments_etat').select('*').order('created_at', { ascending: true })),
          readAll(() => client.from('flammes').select('*').order('created_at', { ascending: true })),
          readAll(() => client.from('serment_liens').select('*').order('created_at', { ascending: true })),
          readAll(() => client.from('scenario_liens').select('*').order('created_at', { ascending: true })),
          readAll(() => client.from('scenarios').select('id, situation_id, deroule')),
          readAll(() => client.from('situations').select('id, intitule, scenario_advenu_id')),
        ]);
      const error = sermentsRes.error || flammesRes.error || liensRes.error
        || scLiensRes.error || scenariosRes.error || situationsRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('serments:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        serments: sermentsRes.data || [],
        flammes: flammesRes.data || [],
        liens: liensRes.data || [],
        // Jointure faite ICI, pas au front : DRAUKHAIN n'a pas à recevoir toute
        // la carte des futurs pour en afficher trois lignes (§5 — on n'envoie
        // que ce qui sera montré).
        futurs: joindreFuturs(scLiensRes, scenariosRes, situationsRes),
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
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
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
