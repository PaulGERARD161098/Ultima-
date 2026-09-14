# Ultima

Espace personnel de travail de Paul : accueil et navigation stellaire, réseau
commercial RIVEN, bibliothèque d’idées ADRAMELECH, journal IMLADRIK/MAEDRETHNIR,
scénarios VRANESH, serments DRAUKHAIN, progression ALTHEA et pilotage FINUBAR.
La carte Leaflet a été retirée ; les positions géographiques restent en base.

## Architecture

- HTML/CSS/JavaScript natif, sans framework front.
- API Node serverless Vercel dans `api/` ; middleware de sécurité à la racine.
- PostgreSQL et Auth Supabase ; client utilisateur, RLS et vues `security_invoker`.
- Voix Léo via Anthropic, sauvegarde Google Drive et digest Resend : fonctions
  optionnelles configurées par variables serveur.

## Développement et tests

Node **22 ou supérieur** est requis par la version verrouillée de Supabase.

```bash
npm ci --ignore-scripts
npm test
npx playwright install chromium
npm run test:browser
```

`npm test` découvre toutes les suites `tests/unit-*.mjs`, y compris les tests
PostgreSQL isolés en mémoire. `test:browser` lance les tests unitaires puis les
parcours Chromium avec données factices et un serveur local sur le port 8123.
Il accepte `PW_CHROMIUM` pour utiliser un navigateur déjà installé. La CI
GitHub exécute ces contrôles sans secret ni accès aux comptes de production.

Pour consulter seulement les pages : `python3 -m http.server 8000`.
Ce serveur statique **n’exécute ni les API ni le middleware**. Pour les routes,
utiliser `vercel dev` avec la configuration appropriée. Ne jamais exposer le
serveur statique du dépôt sur Internet : il contient des documents privés.

## Configuration

La configuration publique se trouve dans `js/config.js`. URL et clé publiable
ne sont pas des secrets ; les droits reposent sur Auth et RLS. Le serveur
accepte `SUPABASE_URL` / `SUPABASE_ANON_KEY`, avec le repli public du projet.
Ne jamais fournir de clé `service_role` au navigateur ou au client utilisateur.

Les variables optionnelles sont utilisées par les routes correspondantes :
`ANTHROPIC_API_KEY`, `LEO_MODELE`, `GOOGLE_OAUTH_CLIENT_ID`,
`GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `DRIVE_TOKEN_ENC_KEY`,
`DRIVE_STATE_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, `FINUBAR_MAIL_A`,
`FINUBAR_MAIL_DE`, `FINUBAR_URL`, `GEOCODE_USER_AGENT`.

## Audit du 14 septembre 2026

Voir `AUDIT-2026-09-14.md` pour les constats, les preuves et les limites.
La migration `20260914142755_audit_integrite_et_denouement.sql` doit être
appliquée **avant** le déploiement du correctif de dénouement. À défaut,
ce geste répond 503 et n’exécute pas l’ancienne suppression en deux opérations.
Les anciennes migrations restent des archives ; ne pas les rejouer sur la base
existante sans réconcilier leur historique avec `supabase_migrations`.
