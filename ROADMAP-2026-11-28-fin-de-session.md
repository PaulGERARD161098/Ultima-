# ROADMAP — fin de séance du 28/11/2026 : planning pour tout terminer

> Planning de la prochaine séance (session neuve), relu par Léo en adversaire et
> validé par Paul le 28/11. **Une seule vérité** : ce fichier + le grain
> `FINUBAR.md`. Les verdicts d'outils vivent dans
> `.claude/leo-complements/README.md` §6–§9, pas ici.

## 0. Ce que la séance du 28/11 a livré (branche `claude/affectionate-ptolemy-d7qlu9`, PR #489)
- Veille de 38 outils → verdicts (§6) ; règle d'absorption (charte §3).
- Skills : `marketing-vente`, `developpement-rigoureux` (+ `scripts/graphe-code.sh`, Graphify épinglé), `trouver-skill`, `creation-visuelle` ; `email-naturel` complété. `regarder-youtube` posé puis **retiré** (clé refusée).
- Léo agent par défaut : `"agent": "leo"` + charte portable scellée `sha256:bac049939979` + rappel d'ouverture ; propagée sur 8 dépôts (PR ci-dessous).
- **Léo lit le web dans l'application** (`api/_lib/leo-web.mjs`), recettée deux fois par Paul sur l'aperçu ; `LEO_WEB` posé en Production et Preview (lu dans Vercel le 28/11) ; bornes 2 recherches + 2 lectures par question.
- Cadrage images avant/après : `CADRAGE-2026-11-28-images-avant-apres.md`.

## 1. Gestes de Paul — une seule passe, dans cet ordre
1. **Fermer le port 3000** du VPS Hostinger (pare-feu) : `http://191.215.46.50:3000` sert un cockpit en HTTP clair, contraire au kit `deploy/hostinger` (80/443 via Caddy). Si l'écran affichait un jeton ou un secret : le changer.
2. **GitHub → Settings → Billing → Actions** : toute la CI est en `startup_failure` depuis le 28/11 (dernière verte : 27/11 14:16 UTC). Lire si c'est le budget (renouvellement du cycle ?) ou un paiement refusé ; payer ou attendre.
3. **Déposer 8 skills au compte claude.ai** (claude.ai/customize/skills) : directive-zs, anti-pattern, developpement-rigoureux, trouver-skill, methode-paul, marketing-vente, creation-visuelle, email-naturel. **Ne pas déposer `regarder-youtube`** (retiré).
4. **Images avant/après** : lire le prix sur ai.google.dev/pricing, fixer un plafond mensuel, fournir 3 photos sans personne ni adresse.

## 2. Dès que la CI repart (agent, puis Paul)
1. Relancer **une fois** la CI des 9 PR ; à défaut de CI, `npm test` en local sur chaque branche mise à jour depuis `main` (gate de fusion : preuve d'intégration actuelle).
2. Paul fusionne **Ultima-#489 d'abord** (source de la charte), puis : RenoBoost#648, RenoDevis#634, RenoAgenda#121, RenoPredict#100, renoboost-console#27, mon-dpe.fr#281 (⚠️ squash : le commit noté dans son Finubar change), artisan-builder#126, DATARENO-#57.
3. Ouvrir une séance neuve : l'en-tête doit afficher `@leo` (effet du réglage `agent` en cloud non documenté) ; le rappel doit annoncer `sha256:bac049939979`.

## 3. Séance suivante — ordre MS (ce qui rapproche d'un client d'abord)
1. **Sirene dans `prospection`** — indicateur : nombre de prospects qualifiés (SIRET actif + code NAF métier) par zone ; l'hôte `recherche-entreprises.api.gouv.fr` est autorisé, l'appel du 28/11 a été coupé par le proxy (à refaire). Brouillons au plus, aucun envoi.
2. **Images avant/après** : maquette à la main (étape ① du cadrage), puis skill + écran de pilotage, si Paul a levé la gate dépense.
3. **Audit du cockpit Hostinger** : après `claude remote-control` lancé par Paul sur le VPS (utilisateur non root, dossier `~/Ultima-`).
4. **Artidispo** : séance ouverte sur ce dépôt, « propage Léo » (`node outils/leo-portable.mjs --propager`).
5. **Cadrage « Léo Jarvis »** (modèle OpenJarvis : résumé du matin parlé, routines plafonnées) — reporté après l'audit, pas coupé (but déclaré de Paul).

## 4. Fermé ou reporté (ne pas rouvrir sans décision)
- `regarder-youtube` : fermé (clé refusée). OmniRoute, Paperclip, Suna, OpenJarvis : refusés (JL, sécurité).
- Connecteurs data.gouv et Context7 : reportés (aucune vente rapprochée ; l'API Sirene n'a pas besoin de clé).
- Boucles antérieures, inchangées : IFULVIN étape ①, CARADRYEL C1 (4 liens Docs), ADR-013.

## 5. Pièges nommés
- La CI rouge en 2 s sans journal = facturation, pas le code.
- Une variable Vercel posée après un déploiement n'est lue qu'au déploiement suivant (commit marqué `[preview]`).
- Le plafond de 100 appels/24 h compte les appels, pas les recherches web (au pire 2 × 100 recherches facturées par jour) ; compter les recherches demanderait une migration (gate).
- La charte portable ne se corrige jamais dans un dépôt : Ultima, `--sceller`, `--propager`.
