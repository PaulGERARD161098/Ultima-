// CARADRYEL — le registre des œuvres de Paul (boucle C1, CADRAGE-CARADRYEL.md §7).
//   GET                              → { oeuvres } du propriétaire, par ordre.
//   POST  { action: 'initialiser' }  → crée les quatre œuvres manquantes (idempotent).
//   PATCH { id, drive_url }          → lie une œuvre à son Google Doc (identifiant seul).
// Pas de DELETE : une suppression réelle est rouge (gate), elle se fait dans Supabase.
// Données intimes (§5) : erreurs génériques côté client, codes seuls dans les logs,
// jamais un titre ni un lien. Table absente (migration non appliquée) → 503 distinct.

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';
import { OEUVRES_INITIALES, validerLiaison, versPublic } from './_lib/caradryel.js';

const TABLE = 'caradryel_oeuvres';
const COLONNES = 'id, titre, ordre, drive_file_id, updated_at';
// PostgREST : table inconnue du cache de schéma (PGRST205) ; Postgres : relation absente.
const TABLE_ABSENTE = new Set(['PGRST205', '42P01']);

function erreurBase(res, contexte, error) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  if (TABLE_ABSENTE.has(error?.code)) {
    logError(`${contexte}:table-absente`, error.code);
    return fail(res, 503, 'Service non configuré', { cause: 'caradryel non installé' });
  }
  logError(contexte, error?.code);
  return fail(res, 500, 'Erreur interne');
}

async function lister(client) {
  return client.from(TABLE).select(COLONNES)
    .order('ordre', { ascending: true }).order('titre', { ascending: true });
}

export function creerHandler({ authentifier = requireUser } = {}) {
  return async function handler(req, res) {
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
      return methodNotAllowed(res, ['GET', 'POST', 'PATCH']);
    }
    const auth = await authentifier(req);
    if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
    if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');
    const { client } = auth;

    try {
      if (req.method === 'POST') {
        const corps = await readJsonBody(req);
        if (corps === null || typeof corps !== 'object') return bodyFail(res, corps);
        if (corps.action !== 'initialiser') return fail(res, 400, 'Action inconnue');
        const { error } = await client.from(TABLE)
          .upsert(OEUVRES_INITIALES.map((o) => ({ titre: o.titre, ordre: o.ordre })),
            { onConflict: 'owner_id,titre', ignoreDuplicates: true });
        if (error) return erreurBase(res, 'caradryel:initialiser', error);
      }

      if (req.method === 'PATCH') {
        const corps = await readJsonBody(req);
        if (corps === null || typeof corps !== 'object') return bodyFail(res, corps);
        const v = validerLiaison(corps);
        if (v.erreur) return fail(res, 400, v.erreur);
        const { data, error } = await client.from(TABLE)
          .update({ drive_file_id: v.driveFileId }).eq('id', v.id).select('id');
        if (error) return erreurBase(res, 'caradryel:lier', error);
        // RLS : une œuvre d'un autre compte ou inexistante = 0 ligne → 404 générique.
        if (!Array.isArray(data) || data.length !== 1) return fail(res, 404, 'Œuvre inconnue');
      }

      const { data, error } = await lister(client);
      if (error) return erreurBase(res, 'caradryel:lister', error);
      return ok(res, { oeuvres: (data || []).map(versPublic) });
    } catch (err) {
      logError('caradryel:exception', err?.name);
      return fail(res, 500, 'Erreur interne');
    }
  };
}

export default creerHandler();
