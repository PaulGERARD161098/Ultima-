// Cœur sécurité de la boucle Drive d'IMLADRIK (sous-boucle ①, connexion).
// Fonctions PURES et testables (unit-imladrik-drive.mjs) — aucune I/O réseau ici.
// Le câblage HTTP live (échange du code OAuth, création du dossier Drive) vit
// dans les endpoints `api/imladrik/drive/*`, construit et vérifié quand le
// client Google Cloud de Paul existe (cadrage securite-auditeur, §5).
//
// Invariants tenus (CADRAGE-CONSOLE §3.4) :
//   - jeton de rafraîchissement Google chiffré AES-256-GCM, clé HORS base
//     (DRIVE_TOKEN_ENC_KEY, env Vercel) ; jamais de secret committé ;
//   - PKCE (S256) : le verifier ne quitte jamais le serveur (cookie httpOnly) ;
//   - cookie d'état SIGNÉ (HMAC-SHA256) + horodaté (anti-CSRF, anti-rejeu) ;
//   - scope MINIMAL drive.file (l'app ne voit que les fichiers qu'elle crée).

import crypto from 'node:crypto';

// Scope minimal : accès par-fichier (dossier dédié), jamais le Drive entier.
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

// ---------- base64url (sans dépendance) ----------
export function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function b64urlToBuf(str) {
  const s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(s, 'base64');
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest();
}

// ---------- PKCE (RFC 7636, méthode S256) ----------
// verifier aléatoire (43..128 chars) ; challenge = b64url(sha256(verifier)).
export function generatePkce() {
  const verifier = b64url(crypto.randomBytes(32)); // 43 chars, entropie 256 bits
  const challenge = b64url(sha256(Buffer.from(verifier)));
  return { verifier, challenge };
}

// ---------- Chiffrement du jeton (AES-256-GCM) ----------
// Clé = 32 octets fournis en HEX (64 hex) ou base64url. Sortie : iv.tag.ct (b64url).
function decodeKey(keyStr) {
  if (typeof keyStr !== 'string' || !keyStr) throw new Error('clé absente');
  let key;
  if (/^[0-9a-fA-F]{64}$/.test(keyStr)) key = Buffer.from(keyStr, 'hex');
  else key = b64urlToBuf(keyStr);
  if (key.length !== 32) throw new Error('clé invalide (32 octets requis)');
  return key;
}

export function encryptToken(plaintext, keyStr) {
  const key = decodeKey(keyStr);
  const iv = crypto.randomBytes(12); // GCM : nonce 96 bits
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${b64url(iv)}.${b64url(tag)}.${b64url(ct)}`;
}

export function decryptToken(payload, keyStr) {
  const key = decodeKey(keyStr);
  const parts = String(payload).split('.');
  if (parts.length !== 3) throw new Error('format chiffré invalide');
  const [iv, tag, ct] = parts.map(b64urlToBuf);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag); // rejette toute altération (intégrité GCM)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// ---------- Cookie d'état signé (anti-CSRF, lie l'aller-retour OAuth) ----------
// Le callback Google est une navigation top-level GET SANS Bearer : l'état de la
// requête (nonce `state`, `code_verifier` PKCE) voyage dans un cookie httpOnly
// SIGNÉ posé à l'`authorize`, jamais dans l'URL. Format : b64url(json).b64url(hmac).
export function signState(payloadObj, secret, now = Date.now()) {
  if (typeof secret !== 'string' || !secret) throw new Error('secret absent');
  const body = { ...payloadObj, iat: now };
  const json = Buffer.from(JSON.stringify(body), 'utf8');
  const mac = crypto.createHmac('sha256', secret).update(json).digest();
  return `${b64url(json)}.${b64url(mac)}`;
}

// Renvoie le payload si signature valide ET non expiré, sinon null (fail-closed).
export function verifyState(token, secret, maxAgeMs = 600_000, now = Date.now()) {
  try {
    if (typeof token !== 'string' || typeof secret !== 'string' || !secret) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const json = b64urlToBuf(parts[0]);
    const mac = b64urlToBuf(parts[1]);
    const expected = crypto.createHmac('sha256', secret).update(json).digest();
    // Comparaison à temps constant ; longueurs différentes → rejet sans throw.
    if (mac.length !== expected.length || !crypto.timingSafeEqual(mac, expected)) return null;
    const payload = JSON.parse(json.toString('utf8'));
    if (typeof payload.iat !== 'number' || now - payload.iat > maxAgeMs || payload.iat > now + 60_000) {
      return null; // expiré, ou horodatage futur aberrant
    }
    return payload;
  } catch {
    return null;
  }
}

// ---------- Configuration (env Vercel uniquement, jamais committée) ----------
// Renvoie { ok, clientId, clientSecret, redirectUri, encKey, stateSecret }.
// ok=false si une variable manque → les endpoints répondent « non configuré »
// (fail-closed), aucun secret n'est jamais exposé au client ni loggé.
export function driveConfig(env = process.env) {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID || '';
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || '';
  const redirectUri = env.GOOGLE_OAUTH_REDIRECT_URI || '';
  const encKey = env.DRIVE_TOKEN_ENC_KEY || '';
  // Secret de signature du cookie d'état : réutilise la clé de chiffrement si un
  // secret dédié n'est pas posé (dérivé, jamais la même utilisation directe).
  const stateSecret = env.DRIVE_STATE_SECRET || (encKey ? `state:${encKey}` : '');
  const ok = Boolean(clientId && clientSecret && redirectUri && encKey);
  return { ok, clientId, clientSecret, redirectUri, encKey, stateSecret };
}

// ---------- URL de consentement Google (navigation top-level) ----------
export function buildAuthUrl(cfg, { state, challenge }) {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: DRIVE_SCOPE,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'offline',   // exige un refresh_token
    prompt: 'consent',        // force le refresh_token même après 1re autorisation
    state,
    include_granted_scopes: 'true',
  });
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

// ---------- Cookies (fonctions PURES, testables) ----------
// Cookie de transport de l'état OAuth : httpOnly, Secure, SameSite=Lax (envoyé
// sur la navigation top-level de retour Google), Path restreint au sous-arbre Drive.
export const COOKIE_OAUTH = 'imladrik_drive_oauth';      // état aller (state+verifier)
export const COOKIE_EXCHANGE = 'imladrik_drive_exchange'; // code à échanger (finalize)

export function serializeCookie(name, value, { maxAge = 600 } = {}) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/api/imladrik/drive; ` +
    'HttpOnly; Secure; SameSite=Lax';
}
// Cookie d'effacement (Max-Age=0).
export function clearCookie(name) {
  return `${name}=; Max-Age=0; Path=/api/imladrik/drive; HttpOnly; Secure; SameSite=Lax`;
}
export function parseCookies(header) {
  const out = {};
  if (typeof header !== 'string' || !header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k) continue;
    try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); }
    catch { out[k] = part.slice(i + 1).trim(); }
  }
  return out;
}

// ---------- Appels Google server-side (bornés, jamais côté client) ----------
const TIMEOUT_MS = 8000;
export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
export const DRIVE_FILES_ENDPOINT = 'https://www.googleapis.com/drive/v3/files';

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// Échange le code d'autorisation contre les jetons (Authorization Code + PKCE).
// Renvoie { refresh_token, access_token, scope }. Lève en cas d'échec (borné).
export async function exchangeCodeForTokens(cfg, { code, verifier }) {
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  });
  const r = await fetchWithTimeout(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok || !data) throw new Error('token_exchange_failed');
  return { refresh_token: data.refresh_token, access_token: data.access_token, scope: data.scope };
}

// Révoque un jeton côté Google (best-effort : on n'échoue pas la déconnexion).
export async function revokeToken(token) {
  try {
    await fetchWithTimeout(`${GOOGLE_REVOKE_ENDPOINT}?token=${encodeURIComponent(token)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch { /* silencieux : la purge en base reste la source de vérité */ }
}

// Crée le dossier dédié (scope drive.file) et renvoie son id. Borné.
export async function createDriveFolder(accessToken, name) {
  const r = await fetchWithTimeout(DRIVE_FILES_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok || !data || !data.id) throw new Error('folder_create_failed');
  return data.id;
}
