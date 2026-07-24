// GET /api/imladrik/drive/status — état de la connexion Drive de l'utilisateur.
// Renvoie { configured, connected } — jamais de jeton, jamais de secret. Sert le
// front pour afficher « Connecter mon Drive » ou « Connecté ✓ ».

import { requireUser, isAuthError } from '../../_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from '../../_lib/http.js';
import { driveConfig } from '../../_lib/drive.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  const configured = driveConfig().ok;
  if (!configured) return ok(res, { configured: false, connected: false });

  try {
    const { data, error } = await client
      .from('imladrik_drive_tokens')
      .select('drive_folder_id, connected_at')
      .maybeSingle();
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('imladrik:drive:status', error.code);
      return fail(res, 500, 'Erreur interne');
    }
    return ok(res, { configured: true, connected: Boolean(data) });
  } catch (err) {
    logError('imladrik:drive:status:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
