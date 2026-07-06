// GET /api/reseau → { ok:true, data:{ nodes, edges } } de l'utilisateur (RLS via jeton).

import { createUserClient, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = createUserClient(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { client } = result;

  try {
    const [nodesRes, edgesRes, journalRes] = await Promise.all([
      client.from('network_nodes').select('*').order('created_at', { ascending: true }),
      client.from('network_edges').select('*').order('created_at', { ascending: true }),
      // Journal : entrées les plus récentes d'abord (affichage fiche).
      client
        .from('journal')
        .select('*')
        .order('date_entree', { ascending: false })
        .order('created_at', { ascending: false }),
    ]);

    const error = nodesRes.error || edgesRes.error || journalRes.error;
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('reseau:get', error.code);
      return fail(res, 500, 'Erreur interne');
    }

    return ok(res, {
      nodes: nodesRes.data || [],
      edges: edgesRes.data || [],
      journal: journalRes.data || [],
    });
  } catch (err) {
    logError('reseau:get:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
