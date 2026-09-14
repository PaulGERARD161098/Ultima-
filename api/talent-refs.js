import { readAll } from './_lib/read-all.js';
// /api/talent-refs — RESHIRAM → RIVEN (boucle ④), derrière auth (RLS via jeton).
//   GET    → { ok:true, data:{ refs:[…], capital:[…], reseau:[…] } }
//            refs    = les liens talent↔fiche RIVEN de l'utilisateur (talent_refs_reseau) ;
//            capital = vue talents_capital_reseau (par talent : nb_contacts, secteurs_reseau)
//                      — le talent qualitatif devenu preuve chiffrée ;
//            reseau  = PROJECTION MINIMALE des fiches RIVEN de l'utilisateur
//                      (id, nom, secteur_activite, type) pour le sélecteur du front.
//                      Lecture agrégée RIVEN → RESHIRAM ; JAMAIS de copie (aucun
//                      téléphone/email/adresse/note exposé), sens UNIQUE.
//   POST   → crée une référence { talent_id, node_id }. owner_id imposé par le
//            défaut base ; le double scellement empêche de croiser le réseau d'autrui.
//   DELETE → retire une référence (pas de PATCH : un lien nu n'a rien de modifiable).
// RESHIRAM n'écrit JAMAIS dans RIVEN : aucune route ici ne touche network_nodes.
// Mêmes motifs que api/passerelles.js + api/talents.js.

import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  ok,
  fail,
  bodyFail,
  methodNotAllowed,
  logError,
  readJsonBody,
} from './_lib/http.js';
import { validateTalentRef, isUuid } from './_lib/validate.js';

const ALLOWED = ['GET', 'POST', 'DELETE'];

// Colonnes RIVEN exposées au sélecteur — strictement le nécessaire pour choisir
// une fiche (aucune PII de contact : ni téléphone, ni email, ni adresse, ni notes).
const RESEAU_PROJECTION = 'id, nom, secteur_activite, type';

function resolveId(req, body) {
  const fromQuery = req.query?.id;
  if (typeof fromQuery === 'string' && fromQuery) return fromQuery;
  if (body && typeof body.id === 'string') return body.id;
  return null;
}

// Mappe une erreur Supabase vers une réponse client générique (sans PII).
function dbFail(res, error, context) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  // FK : talent ou fiche inexistant (ou d'un autre owner) → 400 générique.
  if (error?.code === '23503') return fail(res, 400, 'Talent ou fiche lié introuvable');
  // Unicité : cette fiche est déjà reliée à ce talent.
  if (error?.code === '23505') return fail(res, 409, 'Fiche déjà reliée à ce talent');
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
      const [refsRes, capitalRes, reseauRes] = await Promise.all([
        readAll(() => client.from('talent_refs_reseau').select('*').order('created_at', { ascending: true })),
        readAll(() => client.from('talents_capital_reseau').select('*'), 'talent_id'),
        readAll(() => client.from('network_nodes').select(RESEAU_PROJECTION).order('nom', { ascending: true })),
      ]);
      const error = refsRes.error || capitalRes.error || reseauRes.error;
      if (error) {
        if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
        logError('talent-refs:get', error.code);
        return fail(res, 500, 'Erreur interne');
      }
      return ok(res, {
        refs: refsRes.data || [],
        capital: capitalRes.data || [],
        reseau: reseauRes.data || [],
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      if (body === null || typeof body !== 'object') return bodyFail(res, body);
      const { value, error } = validateTalentRef(body);
      if (error) return fail(res, 400, error);

      const { data, error: dbError } = await client
        .from('talent_refs_reseau')
        .insert(value)
        .select()
        .single();
      if (dbError) return dbFail(res, dbError, 'talent-refs:post');
      return ok(res, data);
    }

    // DELETE
    const body = await readJsonBody(req);
    if (body === null || body === 'too_large') return bodyFail(res, body);
    const id = resolveId(req, body && typeof body === 'object' ? body : {});
    if (!isUuid(id)) return fail(res, 400, 'Identifiant invalide');

    const { data, error: dbError } = await client
      .from('talent_refs_reseau')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();
    if (dbError) return dbFail(res, dbError, 'talent-refs:delete');
    if (!data) return fail(res, 404, 'Référence introuvable');
    return ok(res, { id: data.id });
  } catch (err) {
    logError('talent-refs:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
