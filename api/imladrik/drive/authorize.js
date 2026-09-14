// GET /api/imladrik/drive/authorize — démarre la connexion Drive (sous-boucle ①b).
// Appelé en FETCH par le front (Bearer présent) : on authentifie l'utilisateur,
// on génère PKCE + un nonce d'état, on pose un cookie httpOnly SIGNÉ (state +
// code_verifier) et on renvoie l'URL de consentement Google. Le front y navigue
// en top-level. Aucun secret ni jeton n'est jamais exposé au client.

import crypto from 'node:crypto';
import { requireUser } from '../../_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from '../../_lib/http.js';
import {
  driveConfig, generatePkce, signState, buildAuthUrl,
  serializeCookie, COOKIE_OAUTH, b64url,
} from '../../_lib/drive.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  const cfg = driveConfig();
  if (!cfg.ok) return fail(res, 503, 'Connexion Drive non configurée');

  try {
    const { verifier, challenge } = generatePkce();
    const state = b64url(crypto.randomBytes(16));
    // Cookie signé (HMAC) : le callback Google (GET top-level sans Bearer) le
    // relira pour prouver l'origine de la requête et récupérer le verifier PKCE.
    const cookie = signState({ state, verifier, owner_id: result.user.id }, cfg.stateSecret);
    res.setHeader('Set-Cookie', serializeCookie(COOKIE_OAUTH, cookie, { maxAge: 600 }));
    return ok(res, { url: buildAuthUrl(cfg, { state, challenge }) });
  } catch (err) {
    logError('imladrik:drive:authorize:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
