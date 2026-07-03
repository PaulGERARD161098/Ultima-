# ROADMAP-SECURITE — Ultima

> Mise à jour : 2026-07-03 (P1). Le backlog chiffré vit dans
> `AUDIT-2026-07-03.md` (S1-S6, P1) — ce fichier ne liste que le cap.

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

1. ~~Créer le projet Supabase « ultima » + migration 0001~~ — fait le
   2026-07-03 (projet `leosfqyidgsaescjbfom`, RLS vérifiée). Advisors Auth
   restants → S6 de l'audit.
2. ~~Audit P1~~ — fait : `AUDIT-2026-07-03.md`. Exécuter P2 : S1 → S2 →
   S4 → S5 puis P1 (gates : middleware/RLS/auth = validation Paul).
3. Rate-limit durable (KV/Upstash ou équivalent) si trafic réel — l'in-memory
   ne protège pas en multi-instance.
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
