// GET /api/idees → { ok:true, data:{ idees, liens } } de l'utilisateur (RLS via jeton).
// Quadrant ADRAMELECH (AD-4) : la bibliothèque d'idées en base, privée par owner.

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { client } = result;

  try {
    const [ideesRes, liensRes] = await Promise.all([
      client.from('idees').select('*').order('adr_num', { ascending: true }),
      client.from('idees_liens').select('*').order('created_at', { ascending: true }),
    ]);

    const error = ideesRes.error || liensRes.error;
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('idees:get', error.code);
      return fail(res, 500, 'Erreur interne');
    }

    return ok(res, {
      idees: ideesRes.data || [],
      liens: liensRes.data || [],
    });
  } catch (err) {
    logError('idees:get:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
