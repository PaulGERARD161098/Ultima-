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
  "connect-src 'self' https://*.supabase.co",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join('; ');

function applySecurityHeaders(headers) {
  headers.set('Content-Security-Policy', CSP);
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=()');
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
