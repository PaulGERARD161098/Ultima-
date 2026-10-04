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

// Content-Security-Policy du front. Elle s'est RÉTRÉCIE le 2026-08-13 avec la
// suppression de la carte : Leaflet (unpkg) et les tuiles OpenStreetMap étaient
// les SEULS tiers autorisés. Plus de carte, plus de tiers — il ne reste que
// 'self' et le projet Supabase d'Ultima. Le correctif S3 de la veille (le
// domaine nu des tuiles, qui bloquait 100 % du fond de carte) devient sans
// objet : il n'y a plus de tuile à charger.
// `smoke-csp.mjs` cherche désormais ces domaines et exige de NE PAS les y
// trouver — une règle de confidentialité, comme une politique, se teste par
// l'ABSENCE (règle du 2026-07-30).
const CSP = [
  "default-src 'self'",
  // supabase-js est vendorisé (self). Aucun script tiers, pas de 'unsafe-inline'.
  "script-src 'self'",
  // 'unsafe-inline' était exigé par Leaflet, qui posait des styles inline sur
  // les marqueurs. Leaflet parti, il tombe : plus aucun style inline dans
  // Ultima (la règle « aucun style inline dans le HTML » tenait déjà).
  "style-src 'self'",
  "img-src 'self' data:",
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
// `/finubar` s'ajoute le 2026-08-21 pour une raison précise : le dossier
// `finubar/` contient `macro.json`, c'est-à-dire l'état agrégé
// des huit dépôts — jalons, blocages, ce qui n'a jamais tourné. Vercel sert TOUT
// fichier commité en statique : sans cette ligne, `/finubar/macro.json` est
// publiquement lisible, à côté d'une route `/api/finubar` soigneusement placée
// derrière `requireUser`. Le contrôle n'aurait alors été qu'à une requête près
// — exactement le défaut corrigé côté RénoDevis le 17/08 sur le prix d'achat du
// catalogue. Le `.md` du grain, lui, était déjà couvert par la règle des `.md`.
//
// `/api/_lib` s'y ajoute aussi, et c'est un durcissement DÉFENSIF assumé.
// Vercel ne route pas les fichiers préfixés `_` sous `api/` : `_lib` n'est donc
// en principe pas atteignable par HTTP, et le dépôt vivait déjà sur cette
// hypothèse (`_lib/supabase.js` est là depuis l'origine). Ce qui change le
// 2026-08-21, c'est ce qu'on y met : `_lib/finubar-macro.mjs` n'est pas du code,
// c'est la feuille de route des huit dépôts. Une convention de plateforme qu'on
// ne peut pas tester d'ici — l'egress est bloqué dans le bac à sable — ne suffit
// pas à protéger cette donnée-là. Aucune requête légitime ne demande jamais
// `/api/_lib/…` : les fonctions l'IMPORTENT depuis le disque, elles ne vont pas
// la chercher par le réseau. Refuser ce chemin ne coûte donc rien et retire une
// hypothèse de la chaîne.
// EXPORTÉ (2026-08-31) pour être MESURABLE, et pour rien d'autre : le harnais
// `tests/smoke-finubar.mjs` §5 exige que tout préfixe déclaré privé ici soit
// AUSSI hors déploiement (`.vercelignore`), sauf l'exception nommée `/api/_lib`.
// Le lire par expression régulière depuis le test aurait fabriqué un instrument
// qui se tait le jour où la ligne change de forme. Aucun effet sur le
// comportement du garde.
// `/zohshia` (2026-10-04) : la techno de RénoDevis — la carte du système. Non
// déployée (`.vercelignore`) ET refusée ici : si l'un des deux tombait, l'autre
// tient. Aucune page publique ne vit sous ce chemin ; le jour où ZOH SHIA aura
// sa coque, elle entrera dans `CHEMINS_ANTICHAMBRE`, comme `/finubar`.
export const PREFIXES_PRIVES = ['/adramelech', '/memoire', '/finubar', '/api/_lib', '/supabase', '/design', '/tests', '/zohshia'];

// Boussole publique du quadrant : la page RACINE adramelech.html est servie par
// `cleanUrls` sur le chemin EXACT '/adramelech' (la visite de /adramelech.html y
// est 308-redirigée par Vercel). Depuis Lv3-L4 c'est une COQUE DE BOUSSOLE : elle
// ne porte plus aucune donnée ni aucun appel réseau (la vue registre a déménagé
// sur /registre, toujours fail-closed côté client — js/adramelech.js, les idées
// ne viennent QUE de /api/idees authentifiée). Seul ce chemin exact passe : tout
// ce qui vit SOUS /adramelech/ (IDEES.md, cadrages, scripts d'import) reste
// bloqué, *.md compris.
// `/finubar` y figure pour la même raison qu'`/adramelech` : `cleanUrls` sert
// `finubar.html` sur le chemin EXACT `/finubar`, et cette page-là est publique
// dans sa coque (elle ne porte AUCUNE donnée : tout vient de `/api/finubar`,
// authentifiée, et sans session elle se tait). Seul ce chemin exact passe ; tout
// ce qui vit SOUS `/finubar/` reste bloqué.
// `/zohshia` (04/10/2026), même motif : `zohshia.html` est une coque sans donnée ;
// le plan des technos vient de `/api/zohshia`, réservée au PROPRIÉTAIRE. Le
// dossier `zohshia/` (sources, outils) reste non déployé et non servi.
const CHEMINS_ANTICHAMBRE = ['/adramelech', '/finubar', '/zohshia'];

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
  // Encodage encore présent après trois passes : ambigu, donc refusé.
  if (p.includes('%')) return true;
  p = p.toLowerCase();
  // Durcissement S2 : backslash (même encodé %5c) ≡ séparateur (parité new URL).
  // String.fromCharCode(92) = « \ », sans littéral d'échappement dans la source.
  p = p.split(String.fromCharCode(92)).join('/');
  if (p.endsWith('//')) return true;
  // Résoudre aussi les séparateurs et segments apparus APRÈS décodage.
  const segments = [];
  for (const segment of p.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') { segments.pop(); continue; }
    if (segment.startsWith('.')) return true;
    segments.push(segment);
  }
  p = '/' + segments.join('/');
  // Durcissement S1 : retire les octets parasites de fin (espace, point, octets
  // de contrôle : `.md%20`, `.md.`, `.md%00`) qui défairaient le test de suffixe.
  while (p.length > 1) {
    const c = p.charCodeAt(p.length - 1);
    if (c <= 0x20 || c === 0x2e) p = p.slice(0, -1);
    else break;
  }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

  if (p.endsWith('.md')) return true; // registres, cadrages, roadmaps, docs internes
  if (CHEMINS_ANTICHAMBRE.includes(p)) return false; // page racine publique (clean URL)
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
  if (hits.size >= 5000) {
    for (const [key, entry] of hits) {
      if (entry.reset <= now) hits.delete(key);
    }
  }

  const entry = hits.get(ip);
  if (!entry && hits.size >= 5000) return true;
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
      'Cache-Control': 'private, no-store',
    });
    applySecurityHeaders(headers);
    return new Response(JSON.stringify({ ok: false, error: 'Trop de requêtes' }), {
      status: 429,
      headers,
    });
  }

  // Poursuite vers la route + injection des en-têtes de sécurité.
  const headers = new Headers({ 'x-middleware-next': '1' });
  if (pathname.startsWith('/api/')) headers.set('Cache-Control', 'private, no-store');
  applySecurityHeaders(headers);
  return new Response(null, { headers });
}
