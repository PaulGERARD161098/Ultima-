# Ultima — Cadrage produit (P0, 1 page)

## Vision

Carte interactive du réseau commercial de Paul : visualiser en un coup d'œil
**qui** (artisans, partenaires, leads, chantiers), **où** (carte France), et
**comment ils sont reliés** (apport d'affaires, sous-traitance, chantier commun).

## Objectifs finaux (actés avec Paul, 2026-07-03 — version précisée, fait foi)

1. **Cartographier les contacts professionnels de Paul** — des **individus**,
   pas des entreprises (« ce sont les individus qui font tout » ; la structure
   n'est qu'un attribut de la personne). Visualiser son réseau pro complet.
2. **Se servir de la carte pour créer des passerelles entre les business via
   les individus** — selon sa méthode :
   - rapprocher des personnes qui ont des points communs **professionnels ET
     personnels** (valeurs, état d'esprit, manière de vivre — pour des
     relations où l'on peut compter les uns sur les autres) ;
   - **qualitatif d'abord** (intérêt entre profils et projets), **chiffré
     ensuite** (un rapprochement coûte du temps et de l'énergie, deux
     ressources qui ne reviennent jamais) ;
   - **piloter chaque rapprochement** lancé : journal « où j'en suis »,
     jusqu'au succès ou l'échec pour de bonnes raisons.

Cadre structurant :
- **Autarcie complète** : Ultima est un projet à part des autres projets de
  Paul — non pollué, non perméable, autosuffisant. Données saisies de zéro
  par Paul ; aucune passerelle technique vers d'autres systèmes.
- **Mobile d'abord** : interface pensée pour le téléphone (« pilotage rapide
  au bout des pouces »), accessible ensuite par ordinateur.
- **Mono-utilisateur** : seul Paul (compte Gmail perso) se connecte. Pas
  d'inscription ouverte [S3] ; persona « collaborateur » hors périmètre.
- **Léo en arrière-plan** : autonomie sur la sécurité et la tenue des données ;
  Paul consulte via l'interface. Mémoire de travail : `memoire/`.

## Personas

- **Paul (admin/commercial)** : pilote le réseau, ajoute des contacts, trace les
  relations, prépare ses tournées par zone.
- **Collaborateur (lecture)** : consulte la carte et les fiches avant un RDV.

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
chantier_commun}, `notes`, `created_at`.

RLS : activée sur les 2 tables ; select/insert/update/delete limités à
`owner_id = auth.uid()` (insert `with check`).

## Contrat API (serverless Vercel, `api/`)

- `GET  /api/reseau` → `{ ok: true, data: { nodes, edges } }` (RLS via jeton).
- `POST/PATCH/DELETE /api/reseau/nodes` — CRUD nœud, entrées validées.
- `POST/DELETE /api/reseau/edges` — CRUD relation, entrées validées.
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

## Parcours v2 — spécification UX téléphone-d'abord (2026-07-03, fait foi pour la refonte)

### Architecture de navigation
- **Un seul écran hôte : la carte Leaflet plein écran (hub).** Tout le reste =
  **feuilles montantes** (bottom sheets) par-dessus, jamais de page qui remplace
  la carte. Chaque feuille : titre en tête, bouton « Fermer », fermeture par
  Échap et geste retour système — jamais de piège.
- **Barre d'action basse fixe** (zone de pouce, 3 boutons ≥ 44 px) :
  `Pilotage` (badge chiffré des relances dues), `+ Personne`, `Rechercher`
  (par nom → tap → fiche centrée sur la carte). Filtres carte : bouton
  flottant discret au-dessus de la barre.
- **Hiérarchie** : Carte → Fiche personne → (Journal | Rapprochements) →
  Fiche rapprochement. Profondeur max 2 feuilles.
- **États vides** — carte vide : « Votre carte est vide. Touchez + Personne
  pour ajouter votre premier contact. » ; configuré mais déconnecté :
  « Connectez-vous pour voir votre réseau. »

### Flux 1 — Consulter/piloter (ouverture d'app)
1. Ouverture → carte + badge sur `Pilotage` : ce qui demande attention est
   visible **sans aucun geste**.
2. Tap `Pilotage` → feuille « À suivre » : **« Relances dues »** (nom ou
   rapprochement, prochaine étape, date échue en rouge) puis
   **« Rapprochements en cours »** (statut + dernière note du journal).
3. Par ligne : `Fait` (ouvre le journal rapide pré-rempli) et `Reporter`
   (Demain / Dans 1 semaine / Choisir une date). Tap sur la ligne → fiche.
- État vide : « Rien à relancer. Tout est à jour. »

### Flux 2 — Saisie au pouce post-RDV (< 30 s)
1. Tap `+ Personne` → feuille « Nouvelle personne », **3 champs seulement** :
   `Nom` (focus + clavier ouverts), `Comment on se connaît` (placeholder :
   « Ex. : présenté par Marc au salon BTP »), `Où` = `Placer sur la carte`
   **ou** `Ville`.
2. `Placer sur la carte` : la feuille se réduit en bandeau « Touchez la carte
   pour placer {Nom} » ; le tap pose le point et rouvre la feuille.
   **Aucun champ latitude/longitude n'existe dans l'interface.**
3. `Enregistrer` → bouton désactivé + « Enregistrement… » ; succès → toast
   « {Nom} ajouté » et ouverture de la fiche.
- Le reste (métier, entreprise, tags valeurs/état d'esprit, téléphone,
  e-mail) se complète **plus tard** (bouton `Compléter la fiche`).

### Flux 3 — Journal rapide (< 20 s)
1. Sur toute fiche, bouton primaire en tête : **« Noter où j'en suis »**
   (1 tap depuis la fiche, 2 depuis la carte).
2. Feuille « Où j'en suis avec {Nom} » : texte (focus auto, placeholder :
   « Ex. : déjeuner fait, il attend mon devis ») + `Prochaine étape`
   (optionnel) + `Me relancer` (Demain / 1 semaine / 1 mois / date —
   optionnel).
3. `Enregistrer` → entrée datée du jour en tête du journal ; la relance
   alimente le badge `Pilotage`.

### Flux 4 — Créer/piloter un rapprochement
1. Fiche de A : **« Rapprocher de… »** → sélecteur de B (nom + métier +
   ville). Aussi via `Pilotage` → `+ Rapprochement`.
2. Feuille « Rapprochement {A} ↔ {B} » : champ requis unique **« Pourquoi
   les rapprocher ? »** (= intérêt qualitatif) ; statut initial `Idée`.
3. Fiche rapprochement : 2 personnes (tap → fiche), **frise de statut
   tapable** `Idée → Contact pris → En cours → Fructueux / Arrêté`, journal
   propre. **« Validation chiffrée »** n'apparaît qu'à partir de `En cours`
   (méthode : qualitatif d'abord).
4. `Arrêté` : champ requis **« Raison de l'arrêt »** ; si vide : « Indiquez
   pourquoi vous arrêtez — un arrêt documenté est une bonne décision. »
   Sur la carte, trait entre A et B, apparence selon statut (graphisme).

### Critères d'acceptation (verificateur)
1. ≥ 1 relance échue → badge visible sans geste ; fiche atteinte en 2 taps.
2. Personne créée en 1 saisie texte + ≤ 5 taps, < 30 s ; zéro champ lat/lng.
3. Journal en 1 tap depuis toute fiche ; relance → badge incrémenté.
4. Double-tap `Enregistrer` → une seule entité créée.
5. Toute feuille fermable (Fermer, Échap, retour) ; jamais d'impasse.
6. `Arrêté` refusé sans raison, message exact ci-dessus.
7. Les 4 flux jouables en mode démo ; tap targets ≥ 44 px ; feuilles
   `role="dialog"` + focus géré.
