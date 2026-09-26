# Ultima — Contrats techniques (données, API, front)

> ⚠️ **Réduit le 2026-09-26 à ses seuls contrats techniques** (arbitrage A3,
> `CADRAGE-2026-09-25-carte-celeste.md` §14.1). La **vérité produit** — qui
> utilise Ultima, pour quoi, ce qui doit durer — vit désormais dans
> **`PRODUCT.md`**. Les anciennes sections Vision, Personas, User stories,
> « Interface v3 » (boussole, 2026-07-06) et Hors périmètre P0 sont retirées ;
> elles restent lisibles dans l'historique git.
>
> ⚠️ Ces contrats décrivent le **socle RIVEN de juillet** (trois tables, l'API
> `reseau`). La base réelle compte bien davantage : pour le schéma, les
> migrations de `supabase/migrations/` font foi.

## Modèle de données (contrat — Supabase, RLS dès la migration 0001)

`network_nodes` : `id uuid pk`, `owner_id uuid not null` (→ `auth.users`),
`type text` ∈ {artisan, partenaire, lead, chantier}, `nom text not null`,
`ville`, `adresse`, `telephone`, `email`, `statut text` ∈ {actif, prospect,
en_cours, termine, inactif}, `lat/lng double precision`, `notes`,
`created_at/updated_at`.

`network_edges` : `id uuid pk`, `owner_id uuid not null`, `source_id/target_id`
(→ `network_nodes`, cascade), `type text` ∈ {apport_affaires, sous_traitance,
chantier_commun}, `notes`, `created_at`. **Pilotage (0005)** : `statut` ∈
{idee, contact_etabli, en_cours, fructueux, arrete}, `interet_qualitatif`,
`effort_temps/effort_energie` (1..5), `raison_arret` (obligatoire si arrêté),
`updated_at` ; une seule relation **active** par paire (non orientée) et par
type.

`journal` (0005) : `id uuid pk`, `owner_id` (défaut `auth.uid()`), cible
exclusive `node_id` XOR `edge_id` (cascade), `date_entree`, `note not null`,
`prochaine_etape`, `relance_at` (exige une prochaine étape), `relance_faite`.

RLS : activée sur les 3 tables ; select/insert/update/delete limités à
`owner_id = (select auth.uid())` (insert/update `with check`).

## Contrat API (serverless Vercel, `api/`)

- `GET  /api/reseau` → `{ ok: true, data: { nodes, edges, journal } }` (RLS via jeton).
- `POST/PATCH/DELETE /api/reseau/nodes` — CRUD nœud, entrées validées.
- `POST/PATCH/DELETE /api/reseau/edges` — CRUD relation ; PATCH = pilotage
  (statut/efforts/raison d'arrêt), 409 si une relation active du même type
  existe déjà sur la paire.
- `POST/PATCH/DELETE /api/reseau/journal` — entrées « où j'en suis »
  (cible nœud XOR relation, relances).
- Auth : `Authorization: Bearer <jeton Supabase>` passé au client supabase-js
  (clé anon + jeton utilisateur → la RLS s'applique, jamais de service role).
- Erreurs : client générique (`{ ok:false, error:"…" }` + code HTTP), détail
  côté serveur sans PII (IDs uniquement). Timeout sortant 5 s.
- `middleware.js` : headers sécu (CSP, HSTS, nosniff, frame-deny, referrer) +
  rate-limit 60 req/min/IP sur `/api/*` (in-memory, limite documentée).

## Front (vanilla, français)

`index.html` + `css/styles.css` + `js/config.js` (URL/clé anon Supabase,
vides = **mode démo** avec données d'exemple) + `js/carte.js` (Leaflet/OSM via
CDN + SRI, marqueurs colorés par type, traits pour relations, filtres,
panneau fiche) + `js/app.js` (état, appels API, formulaires).
