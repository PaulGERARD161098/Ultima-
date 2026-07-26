// POST /api/imladrik/drive/finalize — termine la connexion Drive (sous-boucle ①b).
// Appelé en FETCH par le front APRÈS le retour du callback (Bearer présent). Lit
// le cookie d'échange signé (code + verifier PKCE) posé par /callback, échange le
// code contre les jetons Google SERVER-SIDE (le refresh_token ne touche jamais le
// navigateur), crée le dossier Drive dédié (scope drive.file), puis stocke le
// refresh_token CHIFFRÉ (AES-256-GCM) dans imladrik_drive_tokens sous RLS.

import { requireUser } from '../../_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from '../../_lib/http.js';
import {
  driveConfig, verifyState, parseCookies, clearCookie,
  exchangeCodeForTokens, createDriveFolder, encryptToken,
  COOKIE_EXCHANGE, DRIVE_SCOPE,
} from '../../_lib/drive.js';

const NOM_DOSSIER = 'Ultima — Journal IMLADRIK';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client, user } = result;

  const cfg = driveConfig();
  if (!cfg.ok) return fail(res, 503, 'Connexion Drive non configurée');

  // Cookie d'échange signé (code Google + verifier PKCE), posé par /callback.
  const cookies = parseCookies(req.headers?.cookie);
  const relais = verifyState(cookies[COOKIE_EXCHANGE], cfg.stateSecret, 300_000);
  if (!relais || !relais.code || !relais.verifier) {
    return fail(res, 400, 'Session de connexion expirée. Réessaie.');
  }

  const effaceCookie = () => res.setHeader('Set-Cookie', clearCookie(COOKIE_EXCHANGE));

  try {
    const jetons = await exchangeCodeForTokens(cfg, { code: relais.code, verifier: relais.verifier });
    if (!jetons.refresh_token) {
      effaceCookie();
      return fail(res, 502, 'Google n’a pas renvoyé de jeton durable. Réessaie la connexion.');
    }

    // Dossier dédié (scope drive.file : l'app ne voit que ce qu'elle crée).
    let folderId = null;
    try {
      folderId = await createDriveFolder(jetons.access_token, NOM_DOSSIER);
    } catch (e) {
      // Échec non bloquant : la connexion vaut, le dossier sera (re)créé au 1er push.
      logError('imladrik:drive:finalize:folder', e?.message);
    }

    const chiffre = encryptToken(jetons.refresh_token, cfg.encKey);

    // Upsert sous RLS : owner_id posé depuis le JWT vérifié (WITH CHECK impose
    // owner_id = auth.uid()). Une seule ligne par personne (PK owner_id).
    const { error } = await client
      .from('imladrik_drive_tokens')
      .upsert({
        owner_id: user.id,
        refresh_token_chiffre: chiffre,
        scope: jetons.scope || DRIVE_SCOPE,
        drive_folder_id: folderId,
      }, { onConflict: 'owner_id' });

    effaceCookie();
    if (error) { logError('imladrik:drive:finalize:db', error.code); return fail(res, 500, 'Erreur interne'); }
    return ok(res, { connected: true });
  } catch (err) {
    effaceCookie();
    logError('imladrik:drive:finalize:exception', err?.name || err?.message);
    return fail(res, 502, 'La connexion à Google a échoué. Réessaie dans un instant.');
  }
}
