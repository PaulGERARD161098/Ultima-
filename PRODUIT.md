# Ultima — Cadrage produit (P0, 1 page)

## Vision

Carte interactive du réseau commercial de Paul : visualiser en un coup d'œil
**qui** (artisans, partenaires, leads, chantiers), **où** (carte France), et
**comment ils sont reliés** (apport d'affaires, sous-traitance, chantier commun).

**Hybride v1×v2 (arbitrage Paul 2026-07-06)** : la carte v1 reste le socle, et
porte les fonctionnalités du pivot v2 — chaque relation est un **rapprochement
pilotable** (cycle idée → contact établi → en cours → fructueux / arrêté, arrêt
toujours justifié), et un **journal « où j'en suis »** avec relances est
rattachable à un nœud ou à une relation.

## Personas

- **Paul (admin/commercial)** : pilote le réseau, ajoute des contacts, trace les
  relations, prépare ses tournées par zone.
- ~~Collaborateur (lecture)~~ — hors périmètre : Ultima est **mono-utilisateur**
  (décision Paul 2026-07-03), seul Paul se connecte.

## User stories (5 max)

1. En tant que Paul, je vois tous les nœuds de mon réseau sur une carte, colorés
   par type (artisan / partenaire / lead / chantier).
2. Je filtre la carte par type et par statut pour préparer une tournée.
3. Je clique sur un nœud et j'ouvre sa fiche (coordonnées, statut, notes,
   relations) dans un panneau latéral.
4. J'ajoute un nœud depuis la carte (clic ou formulaire) et il apparaît
   immédiatement.
5. Je relie deux nœuds (type de relation + note) et la relation s'affiche en
   trait sur la carte.

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

## Hors périmètre P0

Multi-utilisateurs avancé (rôles), import CSV, géocodage automatique d'adresses,
mobile natif, temps réel. → ROADMAP-SITE.md.
