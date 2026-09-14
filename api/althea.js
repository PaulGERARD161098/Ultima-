import { readAll } from './_lib/read-all.js';
// /api/althea — le Système d'ALTHEA (B1), derrière auth (RLS via jeton).
//
//   GET    → { ok:true, data:{ avatar, stats:[…], skills:[…], conditions:[…],
//                              releves:[…] } }
//            Les lignes BRUTES. Le calcul (jours tenus, élan, rang, niveau,
//            valeur des stats) vit dans un module ES PUR partagé
//            (js/althea-progression.mjs) — il est ainsi éprouvé au harnais sans
//            base ni navigateur, et le serveur n'a pas à le refaire.
//
//   POST   → pose ou corrige le relevé du jour :
//            { condition_id, jour, tenu, quantite?, mot? }.
//            Un jour = une ligne (unicité en base) → on fait un UPSERT sur
//            (owner_id, condition_id, jour). owner_id n'est JAMAIS accepté du
//            client : il est imposé par le défaut base.
//
//   DELETE → efface un relevé. **Ce n'est pas « déclarer manqué »** : c'est
//            revenir à « non renseigné », le troisième état du quadrant. Le
//            geste existe parce que se tromper de case ne doit pas laisser une
//            trace fausse — et l'absence de ligne est la seule façon de dire
//            « je n'en sais rien » (règle cardinale ①).
//
// SÉCURITÉ (CADRAGE-ALTHEA.md §9) — ALTHEA porte la donnée la plus sensible
// d'Ultima : tabac, alcool, corps, psychisme. Cette route ne sert QUE le
// propriétaire authentifié (RLS), ne journalise QUE des codes d'erreur, et ne
// renvoie jamais rien qui n'ait été demandé. Le libellé d'une condition ne sort
// d'ici que vers Paul lui-même — jamais vers l'IA, jamais vers le cockpit.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok, fail, bodyFail, methodNotAllowed, logError, readJsonBody,
} from './_lib/http.js';
import { validateAltheaReleve, estJourLocalValide, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'DELETE'];

// Le « aujourd'hui » de Paul. Le client l'envoie en date LOCALE ; on ne
// l'accepte que s'il est plausible — au plus un jour d'écart avec la date UTC
// du serveur, ce qui couvre tous les fuseaux réels sans laisser passer une
// date arbitraire. Sans en-tête valable, on retombe sur la date serveur.
// C'est le compromis honnête : le serveur ne peut pas CONNAÎTRE le fuseau de
// Paul, mais il peut refuser une valeur qui n'a aucun sens.
export function resoudreAujourdhui(entete, maintenantUTC) {
  const utc = maintenantUTC.toISOString().slice(0, 10);
  if (!estJourLocalValide(entete)) return utc;
  const ecart = Math.abs(Date.parse(`${entete}T00:00:00Z`) - Date.parse(`${utc}T00:00:00Z`));
  return ecart <= 86400000 ? entete : utc;
}

function dbFail(res, error, contexte) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  logError(contexte, error.code);
  return fail(res, 500, 'Erreur interne');
}

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
    if (req.method === 'GET') {
      const [avatarRes, statsRes, skillsRes, conditionsRes, relevesRes] = await Promise.all([
        client.from('althea_avatar').select('*').maybeSingle(),
        readAll(() => client.from('althea_stats').select('*').order('created_at', { ascending: true })),
        readAll(() => client.from('althea_skills').select('*').order('rang_affichage', { ascending: true })),
        readAll(() => client.from('althea_conditions').select('*').order('rang_affichage', { ascending: true })),
        readAll(() => client.from('althea_releves').select('*').order('jour', { ascending: true })),
      ]);

      const erreurs = [avatarRes, statsRes, skillsRes, conditionsRes, relevesRes]
        .map((r) => r.error).filter(Boolean);
      const erreurAuth = erreurs.find(isAuthError);
      if (erreurAuth) return fail(res, 401, 'Authentification requise');
      if (erreurs.length) return dbFail(res, erreurs[0], 'althea:get');
      const liste = (r) => r.data || [];
      return ok(res, {
        avatar: avatarRes.data || null,
        stats: liste(statsRes),
        skills: liste(skillsRes),
        conditions: liste(conditionsRes),
        releves: liste(relevesRes),
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);

      const aujourdhui = resoudreAujourdhui(req.headers?.['x-jour-local'], new Date());
      const { value, error } = validateAltheaReleve(body, 'create', aujourdhui);
      if (error) return fail(res, 400, error);

      // Un jour = une ligne : on écrase le relevé du jour au lieu d'en empiler
      // un second (l'unicité en base le refuserait de toute façon — autant que
      // corriger une case soit un geste naturel, pas une erreur 409).
      const { data, error: dbError } = await client
        .from('althea_releves')
        .upsert(value, { onConflict: 'owner_id,condition_id,jour' })
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'althea:post');
      return ok(res, data);
    }

    // DELETE — revenir à « non renseigné ».
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('althea_releves')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'althea:delete');
    if (!data) return fail(res, 404, 'Relevé introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('althea:handler', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
