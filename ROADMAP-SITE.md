# ROADMAP-SITE — Ultima (carte réseau)

> Mise à jour : 2026-07-03 (P1). Le backlog chiffré vit dans
> `AUDIT-2026-07-03.md` (U1-U8) — ce fichier ne liste que le cap.

## Livré en P0 (MVP)

- Carte Leaflet/OSM plein écran, marqueurs colorés par type (artisan,
  partenaire, lead, chantier) + légende, relations en traits typés.
- Filtres type + statut ; fiche nœud en panneau latéral ; ajout de nœud ;
  création de relation depuis la fiche.
- Mode démo (config Supabase vide) avec jeu de données d'exemple — le site est
  visualisable avant même la création du projet Supabase.
- Responsive mobile (filtres repliables, fiche plein écran), contrastes AA,
  tap targets ≥ 44 px, toasts sobres.

## Prochaines étapes (cap v2 — refonte actée le 2026-07-03)

0. **Implémentation v2** (boucle en cours au prochain démarrage) : API sur le
   modèle 0003 (personnes/rapprochements/journal) puis front téléphone-d'abord
   (spec UX dans PRODUIT.md), PWA. Le clic-carte remplace toute saisie lat/lng.
1. Brancher Supabase réel (config js/config.js + env Vercel + déploiement,
   compte Paul invité).
2. Géocodage d'adresse à la saisie (option, après v2) — Nominatim/OSM
   (gratuit), politique d'usage respectée, décision Paul (appel externe).
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
