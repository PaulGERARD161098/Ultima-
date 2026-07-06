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

## Livré le 2026-07-06 (hybride v1×v2, arbitrage Paul)

- Relations pilotables depuis la fiche : statut (idée → contact établi →
  en cours → fructueux / arrêté), arrêt justifié obligatoire, une seule
  relation active par paire/type, traits de la carte modulés par statut.
- Journal « où j'en suis » dans la fiche : entrées datées sur le nœud ou une
  relation, prochaine étape, date de relance, case « relance faite ».

## Prochaines étapes — cap Interface v3 (cadrage dicté 2026-07-06, voir PRODUIT.md)

1. ✅ 2026-07-06 — **Accueil « Bienvenue, Paul »** livré : carte de livre
   d'enfance (parchemin/encre/Caveat auto-hébergée), relances dues en panneaux
   de bois (cocher « Fait » sans quitter l'Accueil), pilotage par statut,
   suggestions R1-R4, raccourcis, barre d'onglets Accueil/Carte/Contacts
   (Contacts provisoire). 43 verdicts navigateur + non-régression, AA prouvé.
2. ✅ 2026-07-06 — **Onglet Contacts** livré : liste triée + recherche
   insensible casse/accents, saisie progressive (nom seul requis, position
   optionnelle, badge « À placer »), harnais smoke-contacts (20 verdicts).
3. **Déploiement Vercel** (projet Hobby gratuit à créer + env).
4. **Saisie vocale** par champ (Web Speech API, sans clé).
5. **Géocodage** d'adresse (Nominatim/OSM).

## Vivier (impact × effort, après le cap v3)

1. ✅ 2026-07-06 — Supabase réel branché côté front (config URL + clé
   publiable, sortie du mode démo) [U4] et écriture connectée réparée [U1-U3].
   Restent 2 actions Paul : env Vercel (API) + Site URL/Redirect auth
   (voir CADRAGE, Actions humaines).
2. Géocodage d'adresse à la saisie (éviter la saisie manuelle lat/lng) —
   Nominatim/OSM d'abord (gratuit), en respectant leur politique d'usage.
3. Recherche texte (nom/ville) + zoom sur résultat.
4. Fiche relation complète (intérêt qualitatif, efforts 1..5 — déjà en base/API).
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
