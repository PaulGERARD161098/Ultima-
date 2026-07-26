// GET /api/imladrik/drive/callback — retour du consentement Google.
// Navigation top-level SANS Bearer : on ne peut ni authentifier l'utilisateur ni
// écrire en base ici. On se contente de VALIDER l'aller-retour (cookie d'état
// signé vs `state` renvoyé par Google, anti-CSRF), puis on repasse le relais au
// front via un cookie d'échange SIGNÉ (code + verifier), et on redirige vers
// IMLADRIK. C'est le front (authentifié) qui appellera /finalize pour échanger
// le code server-side et stocker le jeton chiffré sous RLS. Le refresh_token ne
// transite JAMAIS par le navigateur ; le code de Google vit dans un cookie
// httpOnly (jamais dans l'URL, jamais lisible en JS).

import { methodNotAllowed } from '../../_lib/http.js';
import {
  driveConfig, verifyState, signState, parseCookies,
  serializeCookie, clearCookie, COOKIE_OAUTH, COOKIE_EXCHANGE,
} from '../../_lib/drive.js';

function redirect(res, dest, cookies) {
  if (cookies) res.setHeader('Set-Cookie', cookies);
  res.statusCode = 302;
  res.setHeader('Location', dest);
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const cfg = driveConfig();
  const erreur = () => redirect(res, '/imladrik.html?drive=error', [clearCookie(COOKIE_OAUTH)]);
  if (!cfg.ok) return erreur();

  const q = req.query || {};
  // Google a refusé / erreur amont.
  if (q.error || !q.code || !q.state) return erreur();

  const cookies = parseCookies(req.headers?.cookie);
  const etat = verifyState(cookies[COOKIE_OAUTH], cfg.stateSecret, 600_000);
  // Anti-CSRF : le nonce du cookie signé DOIT correspondre au state renvoyé.
  if (!etat || etat.state !== q.state) return erreur();

  // Relais signé vers le front (durée courte). Le code Google est à usage unique.
  const relais = signState({ code: String(q.code), verifier: etat.verifier }, cfg.stateSecret);
  return redirect(res, '/imladrik.html?drive=callback', [
    clearCookie(COOKIE_OAUTH),
    serializeCookie(COOKIE_EXCHANGE, relais, { maxAge: 300 }),
  ]);
}
