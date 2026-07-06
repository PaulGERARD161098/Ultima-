---
name: securite-max
description: Routine de sécurité maximale d'Ultima — balayage complet (RLS, API, headers, front, secrets, dépendances, logique métier) exécuté par l'agent securite-auditeur puis contre-vérifié par le verificateur. À lancer en fin de boucle, avant tout merge, et à chaque évolution de la surface à risque (auth, middleware, données, RLS).
---

# Routine de sécurité maximale

Exécuter dans l'ordre, sans sauter d'étape. Le résultat alimente
`AUDIT-<date>.md` (constats S#) — jamais de doc parallèle.

## 1. Balayage (agent `securite-auditeur`, adversarial)

Lancer l'agent `securite-auditeur` sur l'ensemble de sa routine (données/RLS,
API, middleware, front, secrets/chaîne, logique métier). Lui transmettre le
diff de la boucle en cours s'il y en a un, sinon la surface complète.

## 2. Advisors Supabase (si MCP disponible)

`get_advisors` type `security` PUIS type `performance` sur le projet ultima
(`leosfqyidgsaescjbfom`). MCP indisponible → le signaler et continuer en statique.

## 3. Contrôles mécaniques (rapides, systématiques)

- `npm audit --omit=dev` (échec = constat, pas un warning).
- Grep secrets committés : motifs `service_role`, `sk-`, `SUPABASE_.*=ey`,
  clés privées, tokens — sur tout le repo, historique récent inclus
  (`git log -p -5 | grep`).
- Vérifier `.gitignore` couvre `.env*`, `node_modules`, `.vercel`.
- Vérifier SRI présent sur chaque `<script src>`/`<link>` CDN de `index.html`.

## 4. Contre-vérification (agent `verificateur`)

Pour chaque constat S# proposé ET chaque correctif appliqué dans la boucle :
rejouer le scénario d'exploitation réel (l'attaque doit échouer, le cas
légitime doit passer). Un correctif non rejoué n'est pas fermé.

## 5. Restitution

- Constats nouveaux → indexés S# dans `AUDIT-<date>.md` avec preuve + correctif
  proposé + test de fermeture.
- Constats existants → annotation ✅/⏭/❌.
- `ROADMAP-SECURITE.md` rafraîchie si le cap bouge.
- Bloc final : 🔒 couverture / angles morts / verdict global.

## Gates (rappel — jamais franchies par cette routine)

Les correctifs touchant auth / middleware / RLS / données sont PROPOSÉS
(diff + test) et attendent la validation de Paul avant application.
