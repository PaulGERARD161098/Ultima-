// GET /api/intendant → { ok:true, data:{ chantiers, besoins, alertes_j2 } }.
// Le dossier complet d'approvisionnement de l'owner (RLS via jeton) : chantiers
// pilotés + besoins (avec l'état généré `etat`) + alertes J-2 calculées côté
// serveur. Une seule réponse, zéro N+1 (deux SELECT parallèles + agrégat pur).

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';
import { computeAlertesJ2 } from './_lib/intendant.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { client } = result;

  try {
    const [chantiersRes, besoinsRes] = await Promise.all([
      client.from('intendant_chantiers').select('*').order('created_at', { ascending: true }),
      client.from('intendant_besoins').select('*').order('created_at', { ascending: true }),
    ]);

    const error = chantiersRes.error || besoinsRes.error;
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('intendant:get', error.code);
      return fail(res, 500, 'Erreur interne');
    }

    const chantiers = chantiersRes.data || [];
    const besoins = besoinsRes.data || [];

    return ok(res, {
      chantiers,
      besoins,
      alertes_j2: computeAlertesJ2(chantiers, besoins),
    });
  } catch (err) {
    logError('intendant:get:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
