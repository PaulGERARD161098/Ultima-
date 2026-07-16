// Edge middleware Vercel : headers de sécurité sur toutes les réponses
// + rate-limit basique sur /api/*. Écrit sans dépendance (pas de next/server).
//
// Le passage à la route d'origine se fait via l'en-tête interne Vercel
// `x-middleware-next: 1` ; les en-têtes posés ici sont fusionnés sur la
// réponse finale.

export const config = {
  matcher: '/:path*',
};

const RATE_LIMIT = 60; // requêtes autorisées par fenêtre
const WINDOW_MS = 60_000; // fenêtre de 60 s
// Compteur EN MÉMOIRE, donc PAR INSTANCE edge : protection best-effort, pas un
// quota global. Suffisant pour lisser les abus ; un vrai quota exigerait un store partagé.
const hits = new Map();

// Content-Security-Policy compatible avec le front prévu (Leaflet + supabase-js CDN).
const CSP = [
  "default-src 'self'",
  // Leaflet depuis unpkg (SRI côté front) ; supabase-js vendorisé (self). Pas de 'unsafe-inline'.
  "script-src 'self' https://unpkg.com",
  // Leaflet applique des styles inline via JS (positionnement carte/marqueurs) → 'unsafe-inline' requis.
  "style-src 'self' https://unpkg.com 'unsafe-inline'",
  // Tuiles OSM, icônes marqueurs unpkg, images data:.
  "img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com",
  // Restreint au projet Supabase d'Ultima : pas d'exfiltration possible vers un projet tiers.
  "connect-src 'self' https://leosfqyidgsaescjbfom.supabase.co",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

// Chemins qui ne doivent JAMAIS être servis en public : données personnelles de
// Paul (idées ADRAMELECH, mémoire) et documentation interne (`*.md`). Vercel sert
// tout fichier commité en statique et `cleanUrls` ne retire que `.html` → sans ce
// garde, `/adramelech/IDEES.md`, `/memoire/PROFIL-PAUL.md`, etc. sont publics.
// Le middleware edge NE PEUT PAS authentifier le front (session Supabase en
// localStorage, jamais en cookie visible ici) : le seul contrôle fiable à ce
// niveau est le refus. Correctif durable = servir ces données via une API
// `requireUser` (gate — voir adramelech/CADRAGE-ADRAMELECH.md, AD-4).
const PREFIXES_PRIVES = ['/adramelech', '/memoire'];

export function estCheminPrive(pathname) {
  // Normalisation défensive : décodage répété (variantes %2F / double-encodage)
  // + minuscules + suppression du slash final. URL malformée → refus (fail-closed).
  let p = pathname;
  for (let i = 0; i < 3; i += 1) {
    let decode;
    try {
      decode = decodeURIComponent(p);
    } catch {
      return true;
    }
    if (decode === p) break;
    p = decode;
  }
  p = p.toLowerCase();
  // Durcissement S2 : backslash (même encodé %5c) ≡ séparateur (parité new URL).
  // String.fromCharCode(92) = « \ », sans littéral d'échappement dans la source.
  p = p.split(String.fromCharCode(92)).join('/');
  // Durcissement S1 : retire les octets parasites de fin (espace, point, octets
  // de contrôle : `.md%20`, `.md.`, `.md%00`) qui défairaient le test de suffixe.
  while (p.length > 1) {
    const c = p.charCodeAt(p.length - 1);
    if (c <= 0x20 || c === 0x2e) p = p.slice(0, -1);
    else break;
  }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

  if (p.endsWith('.md')) return true; // registres, cadrages, roadmaps, docs internes
  return PREFIXES_PRIVES.some((prefixe) => p === prefixe || p.startsWith(`${prefixe}/`));
}

function applySecurityHeaders(headers) {
  headers.set('Content-Security-Policy', CSP);
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // microphone=(self) : requis par la dictée vocale (Web Speech API, v3-④/U6) —
  // le document lui-même seulement, jamais d'iframe tierce ; le reste fermé.
  headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(self), payment=()');
}

function clientIp(request) {
  // x-real-ip est posé par Vercel (mono-valeur, non forgeable) : source prioritaire.
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}

// Renvoie true si la requête dépasse la limite.
function isRateLimited(ip) {
  const now = Date.now();

  // Éviction simple des entrées expirées quand la table grossit.
  if (hits.size > 5000) {
    for (const [key, entry] of hits) {
      if (entry.reset <= now) hits.delete(key);
    }
  }

  const entry = hits.get(ip);
  if (!entry || entry.reset <= now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export default function middleware(request) {
  const { pathname } = new URL(request.url);

  // Garde PII : données perso + docs internes jamais servies en public. 404
  // générique (ne confirme pas l'existence), en-têtes sécu posés. Doit précéder
  // le rate-limit et le pass-through, et ne PAS poser `x-middleware-next`
  // (sinon le fichier statique serait quand même servi).
  if (estCheminPrive(pathname)) {
    const headers = new Headers({ 'Content-Type': 'text/plain; charset=utf-8' });
    applySecurityHeaders(headers);
    return new Response('Not Found', { status: 404, headers });
  }

  if (pathname.startsWith('/api/') && isRateLimited(clientIp(request))) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Retry-After': '60',
    });
    applySecurityHeaders(headers);
    return new Response(JSON.stringify({ ok: false, error: 'Trop de requêtes' }), {
      status: 429,
      headers,
    });
  }

  // Poursuite vers la route + injection des en-têtes de sécurité.
  const headers = new Headers({ 'x-middleware-next': '1' });
  applySecurityHeaders(headers);
  return new Response(null, { headers });
}
