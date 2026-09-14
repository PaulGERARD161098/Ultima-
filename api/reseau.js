import { readAll } from './_lib/read-all.js';
// GET /api/reseau → { ok:true, data:{ nodes, edges, journal, personnes,
// rattachements } } de l'utilisateur (RLS via jeton).
// Les personnes (0024) sont chargées en entier comme le reste : le front filtre
// en mémoire (motif inchangé depuis 0001) — c'est ce qui justifie l'absence
// d'index de recherche côté base.

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const { client } = result;

  try {
    const [nodesRes, edgesRes, journalRes, personnesRes, rattachementsRes] = await Promise.all([
      readAll(() => client.from('network_nodes').select('*').order('created_at', { ascending: true })),
      readAll(() => client.from('network_edges').select('*').order('created_at', { ascending: true })),
      // Journal : entrées les plus récentes d'abord (affichage fiche).
      readAll(() => client
        .from('journal')
        .select('*')
        .order('date_entree', { ascending: false })
        .order('created_at', { ascending: false })),
      // Personnes (0024) : triées par nom, l'ordre du registre.
      readAll(() => client.from('personnes').select('*').order('nom', { ascending: true })),
      readAll(() => client.from('personne_noeuds').select('*').order('created_at', { ascending: true })),
    ]);

    const error = nodesRes.error || edgesRes.error || journalRes.error
      || personnesRes.error || rattachementsRes.error;
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('reseau:get', error.code);
      return fail(res, 500, 'Erreur interne');
    }

    return ok(res, {
      nodes: nodesRes.data || [],
      edges: edgesRes.data || [],
      journal: journalRes.data || [],
      personnes: personnesRes.data || [],
      rattachements: rattachementsRes.data || [],
    });
  } catch (err) {
    logError('reseau:get:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
