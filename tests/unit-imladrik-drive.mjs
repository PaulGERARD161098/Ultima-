// Unitaires du cœur sécurité de la boucle Drive IMLADRIK (Node pur, zéro réseau).
// Prouve les propriétés de sécurité des fonctions PURES de api/_lib/drive.js :
// PKCE S256, chiffrement AES-256-GCM authentifié, cookie d'état signé (anti-CSRF
// + anti-rejeu), config fail-closed, URL de consentement au scope minimal.
import {
  b64url, b64urlToBuf, generatePkce,
  encryptToken, decryptToken,
  signState, verifyState,
  driveConfig, buildAuthUrl, DRIVE_SCOPE,
  serializeCookie, clearCookie, parseCookies, COOKIE_OAUTH,
  buildEntryFileName, renderEntryText, contentHash, buildMultipartBody,
} from '../api/_lib/drive.js';
import crypto from 'node:crypto';

const verdicts = {};
const KEY = 'a'.repeat(64);          // 32 octets en hex (clé valide)
const KEY2 = 'b'.repeat(64);         // autre clé
const SECRET = 'secret-de-signature-etat';

// ---------- 1. base64url round-trip ----------
{
  const buf = crypto.randomBytes(30);
  verdicts.b64urlRoundTrip = b64urlToBuf(b64url(buf)).equals(buf);
  verdicts.b64urlSansPadding = !/[+/=]/.test(b64url(buf));
}

// ---------- 2. PKCE : challenge = b64url(sha256(verifier)) ----------
{
  const { verifier, challenge } = generatePkce();
  const attendu = b64url(crypto.createHash('sha256').update(Buffer.from(verifier)).digest());
  verdicts.pkceChallengeCorrect = challenge === attendu;
  verdicts.pkceVerifierEntropie = verifier.length >= 43;
  verdicts.pkceAleatoire = generatePkce().verifier !== verifier; // deux tirages diffèrent
}

// ---------- 3. Chiffrement AES-256-GCM authentifié ----------
{
  const clair = 'refresh-token-google-tres-secret-1//abcDEF';
  const chiffre = encryptToken(clair, KEY);
  verdicts.encDechiffre = decryptToken(chiffre, KEY) === clair;
  verdicts.encPasEnClair = !chiffre.includes(clair);
  verdicts.encTroisParties = chiffre.split('.').length === 3;
  // Mauvaise clé → échec (jamais de déchiffrement silencieux).
  try { decryptToken(chiffre, KEY2); verdicts.encMauvaiseCle = false; }
  catch { verdicts.encMauvaiseCle = true; }
  // Altération du ciphertext → le tag GCM rejette.
  {
    const [iv, tag, ct] = chiffre.split('.');
    const ctBuf = b64urlToBuf(ct); ctBuf[0] ^= 0xff;
    const falsifie = `${iv}.${tag}.${b64url(ctBuf)}`;
    try { decryptToken(falsifie, KEY); verdicts.encAntiAlteration = false; }
    catch { verdicts.encAntiAlteration = true; }
  }
  // Clé de mauvaise taille rejetée.
  try { encryptToken('x', 'trop-court'); verdicts.encCleTaille = false; }
  catch { verdicts.encCleTaille = true; }
}

// ---------- 4. Cookie d'état signé (anti-CSRF + anti-rejeu) ----------
{
  const now = 1_000_000_000_000;
  const jeton = signState({ state: 'nonce123', verifier: 'v-abc' }, SECRET, now);
  const ok = verifyState(jeton, SECRET, 600_000, now + 1000);
  verdicts.etatValide = Boolean(ok) && ok.state === 'nonce123' && ok.verifier === 'v-abc';
  // Mauvais secret → null.
  verdicts.etatMauvaisSecret = verifyState(jeton, 'autre-secret', 600_000, now) === null;
  // Payload altéré → signature invalide → null.
  {
    const [body, mac] = jeton.split('.');
    const obj = JSON.parse(b64urlToBuf(body).toString('utf8'));
    obj.state = 'pirate';
    const falsifie = `${b64url(Buffer.from(JSON.stringify(obj)))}.${mac}`;
    verdicts.etatAntiFalsif = verifyState(falsifie, SECRET, 600_000, now) === null;
  }
  // Expiré (au-delà de maxAge) → null.
  verdicts.etatExpire = verifyState(jeton, SECRET, 600_000, now + 600_001) === null;
  // Horodatage futur aberrant → null.
  verdicts.etatFutur = verifyState(jeton, SECRET, 600_000, now - 120_000) === null;
  // Jeton malformé → null (pas de throw).
  verdicts.etatMalforme = verifyState('nimportequoi', SECRET) === null;
}

// ---------- 5. Config fail-closed ----------
{
  verdicts.cfgVide = driveConfig({}).ok === false;
  verdicts.cfgPartielle = driveConfig({ GOOGLE_OAUTH_CLIENT_ID: 'x' }).ok === false;
  const complet = driveConfig({
    GOOGLE_OAUTH_CLIENT_ID: 'cid', GOOGLE_OAUTH_CLIENT_SECRET: 'csecret',
    GOOGLE_OAUTH_REDIRECT_URI: 'https://ex/api/imladrik/drive/callback',
    DRIVE_TOKEN_ENC_KEY: KEY,
  });
  verdicts.cfgComplete = complet.ok === true && complet.clientId === 'cid';
}

// ---------- 6. URL de consentement : scope minimal + PKCE + offline ----------
{
  const cfg = { clientId: 'cid', redirectUri: 'https://ex/cb' };
  const url = buildAuthUrl(cfg, { state: 'st', challenge: 'ch' });
  const u = new URL(url);
  verdicts.urlScopeMinimal = u.searchParams.get('scope') === DRIVE_SCOPE &&
    DRIVE_SCOPE.endsWith('drive.file');
  verdicts.urlPkceS256 = u.searchParams.get('code_challenge') === 'ch' &&
    u.searchParams.get('code_challenge_method') === 'S256';
  verdicts.urlOffline = u.searchParams.get('access_type') === 'offline' &&
    u.searchParams.get('prompt') === 'consent';
  verdicts.urlState = u.searchParams.get('state') === 'st' &&
    u.searchParams.get('client_id') === 'cid';
}

// ---------- 7. Cookies (httpOnly / Secure / SameSite=Lax, round-trip) ----------
{
  const c = serializeCookie(COOKIE_OAUTH, 'val eur+/=', { maxAge: 600 });
  verdicts.cookieAttributs = /HttpOnly/.test(c) && /Secure/.test(c) &&
    /SameSite=Lax/.test(c) && /Path=\/api\/imladrik\/drive/.test(c) && /Max-Age=600/.test(c);
  // Valeur encodée (pas de caractères bruts qui casseraient l'en-tête).
  verdicts.cookieEncode = c.includes(encodeURIComponent('val eur+/='));
  // Round-trip parse.
  const brut = `${COOKIE_OAUTH}=${encodeURIComponent('abc.def')}; autre=x`;
  const p = parseCookies(brut);
  verdicts.cookieParse = p[COOKIE_OAUTH] === 'abc.def' && p.autre === 'x';
  verdicts.cookieParseVide = Object.keys(parseCookies('')).length === 0 &&
    Object.keys(parseCookies(undefined)).length === 0;
  // Effacement : Max-Age=0.
  verdicts.cookieClear = /Max-Age=0/.test(clearCookie(COOKIE_OAUTH));
  // Un état signé survit à un aller-retour cookie (sérialise → parse → vérifie).
  const jeton = signState({ state: 'n', verifier: 'v' }, SECRET, 1000);
  const rt = parseCookies(`${COOKIE_OAUTH}=${encodeURIComponent(jeton)}`)[COOKIE_OAUTH];
  verdicts.cookieEtatSurvit = Boolean(verifyState(rt, SECRET, 600_000, 1500));
}

// ---------- 8. Push (sous-boucle ②) : nom, rendu texte, hash, multipart ----------
{
  // Nom : « IMLADRIK — <titre> » ; repli sur la date si pas de titre ; assaini.
  verdicts.nomTitre = buildEntryFileName({ titre: 'Cap tenu' }) === 'IMLADRIK — Cap tenu';
  verdicts.nomDate = buildEntryFileName({ created_at: '2026-07-22T14:05:00Z' }) === 'IMLADRIK — 2026-07-22';
  verdicts.nomAssaini = buildEntryFileName({ titre: 'a\nb\tc' }) === 'IMLADRIK — a b c';
  verdicts.nomBorne = buildEntryFileName({ titre: 'x'.repeat(300) }).length <= 132;

  // Rendu : titre + date + contenu ; sans titre → pas de ligne de titre.
  const t1 = renderEntryText({ titre: 'T', created_at: '2026-07-22', contenu: 'corps' });
  verdicts.renduComplet = /T/.test(t1) && /2026-07-22/.test(t1) && /corps/.test(t1);
  const t2 = renderEntryText({ contenu: 'seul' });
  verdicts.renduSansTitre = t2 === 'seul';

  // Hash : déterministe, sensible, 64 hex.
  const h = contentHash('abc');
  verdicts.hashDeterministe = h === contentHash('abc');
  verdicts.hashSensible = h !== contentHash('abd');
  verdicts.hashHex = /^[0-9a-f]{64}$/.test(h);

  // Multipart : boundary, métadonnées JSON, média texte, clôture.
  const mp = buildMultipartBody({ name: 'N', mimeType: 'm' }, 'texte ici', 'BND');
  verdicts.mpBoundary = mp.startsWith('--BND\r\n') && mp.endsWith('--BND--');
  verdicts.mpMeta = mp.includes('"name":"N"') && mp.includes('application/json');
  verdicts.mpMedia = mp.includes('text/plain') && mp.includes('texte ici');
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-IMLADRIK-DRIVE OK' : 'UNIT-IMLADRIK-DRIVE ECHEC');
process.exit(ok ? 0 : 1);
