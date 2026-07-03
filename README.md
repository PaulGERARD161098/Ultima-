# Ultima — Carte réseau

Carte interactive du réseau commercial : artisans, partenaires, leads et
chantiers positionnés sur une carte de France, avec leurs relations
(apport d'affaires, sous-traitance, chantier commun), filtres par type et
statut, et fiche détaillée au clic.

## Stack

- Front : HTML/CSS/JS vanilla (aucun framework, aucune dépendance npm côté front)
- Carte : [Leaflet](https://leafletjs.com/) 1.9.4 + tuiles OpenStreetMap (CDN avec SRI)
- Données : Supabase (PostgreSQL + RLS), auth par lien magique (magic link)
- API : fonctions serverless Vercel (`api/`), protégées par `middleware.js`

## Démarrage local

Sans configuration, l'application démarre en **mode démo** avec des données
d'exemple (bandeau affiché en haut de page) :

```bash
# au choix :
python3 -m http.server 8000   # puis http://localhost:8000
vercel dev                    # avec les endpoints api/
```

Ou simplement ouvrir `index.html` dans un navigateur.

## Configuration

- **Front** : renseigner `js/config.js` (`SUPABASE_URL` et `SUPABASE_ANON_KEY`).
  La clé *anon* est publiable ; ne jamais y mettre de clé `service_role` ni
  aucun autre secret. Champs vides = mode démo.
- **Back (Vercel)** : variables d'environnement `SUPABASE_URL` et
  `SUPABASE_ANON_KEY` définies dans le projet Vercel (jamais committées).

## Documentation

- [PRODUIT.md](PRODUIT.md) — cadrage produit P0 (personas, user stories, modèle de données, contrat API)
- [CADRAGE-ULTIMA.md](CADRAGE-ULTIMA.md) — pilotage du projet (phases P0 → P3)
