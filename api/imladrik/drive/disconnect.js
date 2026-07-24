// POST /api/imladrik/drive/disconnect — coupe la connexion Drive.
// Révoque le jeton côté Google (best-effort) PUIS purge la ligne en base (RLS).
// Après ça, Ultima n'a plus aucun accès au Drive de l'utilisateur.

import { requireUser, isAuthError } from '../../_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from '../../_lib/http.js';
import { driveConfig, decryptToken, revokeToken } from '../../_lib/drive.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client, user } = result;

  try {
    const cfg = driveConfig();
    // Lit le jeton chiffré (RLS → propre ligne) pour tenter la révocation Google.
    const { data } = await client
      .from('imladrik_drive_tokens')
      .select('refresh_token_chiffre')
      .maybeSingle();

    if (data?.refresh_token_chiffre && cfg.ok) {
      try { await revokeToken(decryptToken(data.refresh_token_chiffre, cfg.encKey)); }
      catch (e) { logError('imladrik:drive:disconnect:revoke', e?.name); } // non bloquant
    }

    // Purge la ligne (RLS : ne touche que la sienne ; filtre explicite sur le JWT).
    const { error } = await client.from('imladrik_drive_tokens').delete().eq('owner_id', user.id);
    if (error) {
      if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
      logError('imladrik:drive:disconnect:db', error.code);
      return fail(res, 500, 'Erreur interne');
    }
    return ok(res, { connected: false });
  } catch (err) {
    logError('imladrik:drive:disconnect:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
