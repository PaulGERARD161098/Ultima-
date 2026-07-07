# ROADMAP-SECURITE — Ultima

> Mise à jour : 2026-07-02 (P0). Le backlog chiffré (S#) vivra dans
> `AUDIT-<date>.md` généré en P1 — ce fichier ne liste que le cap.

## Couvert en P0 (by design)

- RLS activée dès la migration `0001` sur `network_nodes` / `network_edges`
  (policies `owner_id = auth.uid()`, insert/update `WITH CHECK`).
- API : jamais de service role — clé anon + jeton utilisateur (la RLS s'applique
  de bout en bout) ; validation stricte des entrées ; erreurs génériques client,
  détaillées serveur sans PII (IDs uniquement) ; timeout sortant 5 s ; 405 sur
  méthodes non prévues.
- `middleware.js` : CSP sans `unsafe-inline` script, HSTS, nosniff, frame-deny,
  Referrer-Policy, Permissions-Policy ; rate-limit 60 req/min/IP sur `/api/*`
  (in-memory — limite per-instance documentée).
- Front : CDN épinglés avec SRI (Leaflet), aucun script/style inline, contenu
  dynamique systématiquement échappé (anti-XSS).
- Secrets : uniquement en variables d'env Vercel ; `.env*` ignoré par git ;
  seule la clé anon (publiable) apparaît côté client.

## Prochaines étapes (ordre indicatif, à indexer S# en P1)

1. ✅ 2026-07-06 — projet Supabase `ultima` opérationnel (réutilisation de
   l'existant ex-« tantot », tables héritées vides purgées), migration 0001
   appliquée, `get_advisors` passés (constats consignés dans CADRAGE, à
   indexer S#/U# en P1).
2. ✅ 2026-07-06 — audit P1 livré (`AUDIT-2026-07-06.md`) et P2 exécutée :
   S1-S6 fermés (vendorisation supabase-js, search_path, x-real-ip, plafond
   corps 100 Ko, RLS initplan, CSP connect-src projet). Advisors security :
   0 lint.
3. Rate-limit durable (KV/Upstash ou équivalent) si trafic réel — l'in-memory
   ne protège pas en multi-instance. Idem pour la garde 1 req/s de
   `/api/geocode` (v3-⑤) : per-instance, à durcir au même moment (le quota
   Nominatim est partagé).
3bis. Durcissement auth des endpoints (gated, registre CADRAGE n°7) :
   vérification réelle du jeton (`auth.getUser()`) au lieu de la seule
   présence du Bearer — recommandation spec data v3-⑤ ; à appliquer d'un
   coup sur tous les endpoints (même motif).
4. Politique de rétention / suppression des données réseau (PII : noms,
   adresses, téléphones) + mention RGPD si ouverture à des tiers.
5. Contrôle d'accès multi-utilisateurs (rôles lecture/écriture) si le persona
   « collaborateur » devient réel — aujourd'hui : 1 owner = ses données.
6. `npm audit` à chaque ajout de dépendance (aucune dépendance front, 1 seule
   côté API).

## Règles permanentes

- Migrations : SQL déposé dans `supabase/migrations/`, JAMAIS appliqué en prod
  sans validation Paul explicite.
- Tout correctif touchant auth / middleware / RLS / données → stop + validation
  (et bascule Opus 4.8 conformément au cadrage).
- Jamais de secret committé ; jamais de PII en logs.
