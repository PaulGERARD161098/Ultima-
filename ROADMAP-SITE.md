# ROADMAP-SITE — Ultima (carte réseau)

> Mise à jour : 2026-07-02 (P0). Le backlog chiffré (U#) vivra dans
> `AUDIT-<date>.md` généré en P1 — ce fichier ne liste que le cap.

## Livré en P0 (MVP)

- Carte Leaflet/OSM plein écran, marqueurs colorés par type (artisan,
  partenaire, lead, chantier) + légende, relations en traits typés.
- Filtres type + statut ; fiche nœud en panneau latéral ; ajout de nœud ;
  création de relation depuis la fiche.
- Mode démo (config Supabase vide) avec jeu de données d'exemple — le site est
  visualisable avant même la création du projet Supabase.
- Responsive mobile (filtres repliables, fiche plein écran), contrastes AA,
  tap targets ≥ 44 px, toasts sobres.

## Prochaines étapes (impact × effort, à indexer U# en P1)

1. Brancher Supabase réel (config + auth magic link) — dépend de la gate coût.
2. Géocodage d'adresse à la saisie (éviter la saisie manuelle lat/lng) —
   Nominatim/OSM d'abord (gratuit), en respectant leur politique d'usage.
3. Recherche texte (nom/ville) + zoom sur résultat.
4. Édition/suppression de relation depuis la fiche ; fiche relation.
5. Regroupement de marqueurs (clustering) au-delà de ~100 nœuds.
6. Import CSV de contacts existants (mapping colonnes → contrat).
7. Filtrage par zone dessinée (préparation de tournée).
8. Vue liste synchronisée à côté de la carte (survol croisé — motif
   systeme-commercial).

## Hors périmètre assumé (revoir plus tard)

Temps réel multi-postes, rôles avancés, app mobile native, analytics.

## Décisions actées

- Leaflet/OSM (gratuit, pas de clé exposée). Bascule Google Maps = décision
  Paul (clé + coût API).
- Vanilla HTML/CSS/JS, zéro framework — cohérence avec l'écosystème existant.
