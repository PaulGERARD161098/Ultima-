# CADRAGE-ULTIMA — audit → patch → améliorations, adapté au réel du projet

## ÉTAT (2026-07-03 — soir)

- ✅ **P0 Fondations** — livrée, vérifiée en navigateur, fusionnée dans `main`
  via PR #1 (7 commits atomiques : cadrage, migration RLS, API, middleware,
  front, docs).
- ✅ **Gate Supabase fermée** (go Paul 2026-07-03) : projet « ultima »
  (`leosfqyidgsaescjbfom`, eu-west-3) actif, migration `0001` appliquée,
  8 policies RLS vérifiées en base, tables vides. Advisors MCP bloqués
  (approbation) → lints répliqués en SQL, reste S6 (paramètres Auth) ⏭.
- ✅ **P1 Audit** — livrée : `AUDIT-2026-07-03.md` = backlog unique
  (6 S / 1 P / 8 U, rien d'appliqué). Bloquants : S1 (CDN sans SRI),
  S3 (inscription ouverte — décision Paul), U1 (création sans e-mail = 400).
- ✅ **P2 Exécution sécu — fermée côté code** (« go pour tout » Paul) :
  S1 (supabase-js v2.110.0 auto-hébergé, jsdelivr hors CSP), S2+P1
  (migration `0002` appliquée), S3 (mono-utilisateur), S4 (connect-src
  épinglé env), S5 (x-real-ip). ⏭ S6 + 2 actions dashboard Paul
  (inviter son compte, fermer les signups).
- 🟡 **Refondation v2 — en cours** (« go pour tout ») : migration `0003`
  pivot personnes/rapprochements/journal **déposée, NON appliquée**
  (gate : DROP des tables v1 — go Paul requis) ; spec UX v2
  téléphone-d'abord consignée dans PRODUIT.md ; socle PWA posé
  (manifeste, icône, theme-color). Reste : appliquer 0003 → refondre
  l'API (validate/personnes/rapprochements/journal) → refondre le front
  (hub carte + feuilles + barre de pouce) → vérification complète.
- ⏭ **Routine d'arrière-plan quotidienne** (sécurité + données, 05:30 UTC,
  session fraîche) : cadrée, mais création du déclencheur bloquée par les
  approbations MCP de la session — à armer dès que l'outil répond.
- ✅ **Équipe d'agents complète** (`.claude/agents/`), pilotée par **Léo** —
  master agent et interlocuteur unique de Paul (charte `leo.md`, ancré dans
  `CLAUDE.md` ; remplace `ultima-pilote`). Spécialistes : `securite-auditeur`,
  `data-ingenieur`, `front-carto`, `interface-ux` (interface, aide,
  navigation), `graphisme`, `verificateur` + skill `/securite-max`.
  La PR #2 devient redondante côté agents.
- 📌 Objectifs finaux du produit actés et consignés dans `PRODUIT.md` :
  cartographier toutes les relations pro ; par relation — centraliser les
  données, journal « où j'en suis », créer du lien pertinent entre elles.
- 🔜 Ensuite : fin de P2 (S1/S4/S5), branchement front (config + env Vercel),
  puis P3 (U1 en tête) et le socle « journal + suggestions de lien » (P4 à
  cadrer — objectif final n°2).
- Protocoles permanents de session : voir `CLAUDE.md`.
- Sauvegarde permanente : fiche Notion « 📦 Repo Ultima- — Fiche projet ».

> Adapté du prompt RénoBoost (2026-07-02). Source unique de vérité du pilotage.
> Décisions produit actées avec Paul : **Ultima = carte interactive du réseau
> commercial** (artisans, partenaires, leads, chantiers) · **greenfield**.

## DIFFÉRENCES vs prompt RénoBoost (pourquoi ce cadrage est inversé)

Vérifié le 2026-07-02 :

| Prérequis RénoBoost | Réel Ultima | Conséquence |
|---|---|---|
| `AUDIT-2026-07-02.md` (S1-S6 / U1-U19) | absent — repo = 1 README | l'audit devient un **livrable** (P1), pas une entrée |
| ~16,5k lignes, 13 endpoints `api/`, `middleware.js` | aucun code | phase **P0 Fondations** ajoutée en préalable |
| ROADMAP-SECURITE/SITE/DASHBOARD | absents | initialisés en P0 |
| PR draft #129 | aucune PR sur le repo | PR draft **créée** par ce cadrage |
| Projet Supabase lié | aucun projet « Ultima » | création = **validation Paul** (coût) |
| Fiche Notion | aucune | à créer en fin de P0 si Paul le souhaite |

Principe conservé : construire **sécurisé d'abord**, auditer ensuite, patcher par
gravité, améliorer par impact×effort. On ne re-scanne jamais ce qui est déjà
consigné : `AUDIT-<date>.md` reste le tableau de bord unique.

## CONTEXTE

Ultima : carte interactive du réseau commercial — nœuds (artisans, partenaires,
leads, chantiers) + relations (apport d'affaires, sous-traitance, chantier commun),
filtres métier, fiche au clic. Stack alignée sur l'écosystème existant
(renoboost-leads, systeme-commercial) : HTML/CSS/JS vanilla, endpoints serverless
`api/`, `middleware.js`, Supabase, Vercel.
Repo : `paulgerard161098/Ultima-` · branche : `claude/renobost-audit-remediation-dxv8ql`.

## OBJECTIF — 4 phases

**P0 FONDATIONS (nouveau, préalable)**
- Cadrage produit 1 page : personas, 5 user stories max, modèle de données
  (tables `network_nodes`, `network_edges`, typage des relations).
- Squelette sécurisé : `index.html` + module carte (Leaflet/OSM par défaut —
  gratuit, pas de clé exposée ; bascule Google Maps = décision Paul, coût API),
  `api/` minimal (auth, CRUD réseau), `middleware.js` (headers sécu, rate-limit),
  `vercel.json`.
- Supabase : schéma + **RLS dès la première migration**, SQL déposé dans
  `supabase/migrations/`, **JAMAIS appliqué sans validation Paul explicite**.
  La création du projet Supabase « ultima » elle-même = validation Paul (coût).
- Livrables : MVP déployable en preview Vercel + `ROADMAP-SECURITE.md` +
  `ROADMAP-SITE.md` initialisées.

**P1 AUDIT (détection + solution, sans appliquer)**
- Générer `AUDIT-<date>.md` sur le code P0 : constats indexés **S1-Sn** (sécu,
  gravité décroissante) / **U1-Un** (UX, impact×effort), croisés avec les
  advisors Supabase (`get_advisors`) une fois le projet créé.
- Pour chaque constat : correctif précis (diff proposé + test de fermeture),
  regroupé par fichier. Rien n'est appliqué en P1.

**P2 EXÉCUTION SÉCU** — appliquer par gravité S1 → S2 → S3 → S4/S5.
1 commit atomique + 1 test par faille : `fix(sec): <faille> [S#]`.

**P3 EXÉCUTION UX** — top 5 puis le reste par impact×effort.
1 commit par item : `feat(ux): <item> [U#]`.

## STRATÉGIE MODÈLE (tiering coût/qualité — levier d'optim n°1)

- **Fable 5 par DÉFAUT** : P0 squelette front/CSS, P1 entière (lecture, détection,
  rédaction correctifs + tests), P3 mécanique (responsive, contraste, tap targets,
  favicon, toasts).
- **Escalade Opus 4.8 UNIQUEMENT** sur surface à risque : modèle de données +
  RLS (P0/S1), auth/secrets/`middleware.js` (S2/S3), toute décision d'archi
  (choix lib carte si structurant). Chaque bascule Fable→Opus est signalée
  explicitement avec sa raison.
- **Sous-agents parallèles** sur axes indépendants (levier n°2) : en P0
  front-carte ∥ api ∥ SQL ; en P2/P3 sécu ∥ UX. Temps mur = le plus long,
  pas la somme.

## ENTRÉES / SORTIES

IN : ce fichier (CADRAGE-ULTIMA.md), décisions Paul, style de l'écosystème
existant comme référence, advisors Supabase (après création projet).
OUT : commits atomiques poussés + **PR draft du repo mise à jour** (pas de #129 :
inexistante ici) ; `AUDIT-<date>.md` annoté par constat (✅ corrigé+commit /
⏭ reporté+raison / ❌ non reproduit) — tableau de bord unique, pas de doc
parallèle (levier n°3) ; roadmaps rafraîchies ; rapport final :
fermées / restantes / livrées.

## CONTRAINTES

- Périmètre : code + config du repo. Après P0 : patchs minimaux, style existant,
  pas de refonte.
- Migrations Supabase : SQL dans `supabase/`, jamais appliqué en prod sans
  validation Paul explicite.
- Jamais de secret committé (env Vercel uniquement). Vanilla d'abord : pas de
  dépendance lourde sans justification ; mises à jour seulement si `npm audit`
  le justifie.
- Économe en tokens : P1+ consomme les IDs S#/U# comme backlog, pas de re-audit.

## POINTS DE VALIDATION PAUL (bloquants)

1. Go P0 sur ce cadrage (personas/stories inclus).
2. Création du projet Supabase « ultima » (coût).
3. Application de toute migration (RLS incluse).
4. Leaflet/OSM (défaut) vs Google Maps (clé + coût).
5. Go P0→P1 (MVP validé en preview).

## GESTION D'ERREURS

- Test rouge après patch → corriger avant le suivant.
- Constat non reproductible → ❌ + preuve, pas de patch aveugle.
- Correctif touchant auth/middleware/données/RLS → stop + demande Paul
  (déclenche aussi la bascule Opus 4.8).
- MCP indisponible → continuer en statique et le signaler.
- Décision produit ambiguë → question à Paul, pas d'invention.

## STYLE

Production défensive : validation d'entrées sur tous les endpoints, erreurs
génériques côté client / détaillées côté serveur, timeout sortant sur tout appel
externe, pas de PII en logs (le réseau commercial EST de la PII : noms, adresses,
téléphones → logs = IDs uniquement).
Fin de chaque livraison : blocs 🔒 Retour sécurité + ⚡ Retour optimisation +
`/verify` sur les flux touchés.
