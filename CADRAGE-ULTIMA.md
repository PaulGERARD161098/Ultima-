# CADRAGE-ULTIMA — audit → patch → améliorations, adapté au réel du projet

## ÉTAT (2026-07-06, après arbitrage)

- ✅ **P0 Fondations** — livrée, vérifiée en navigateur, fusionnée dans `main`
  via PR #1 (7 commits atomiques : cadrage, migration RLS, API, middleware,
  front, docs).
- ✅ **Gate Supabase** — fermée le 2026-07-06 sur go Paul. Pas de création :
  réutilisation du projet existant `ultima` (ref `leosfqyidgsaescjbfom`,
  eu-west-3), ex-« tantot » ; ses 3 tables héritées (`personnes`,
  `rapprochements`, `journal`), vérifiées vides (0 lignes), purgées par
  migration `drop_legacy_tantot_tables`. Migration `0001` appliquée
  (`init_network_schema_rls`). Advisors passés — entrées pour P1 :
  - sécu WARN : `search_path` mutable sur `public.set_updated_at` (lint 0011) ;
  - perf WARN ×8 : policies RLS — remplacer `auth.uid()` par
    `(select auth.uid())` (lint 0003, initplan) ;
  - perf INFO : index inutilisés (base neuve, non actionnable) + stratégie
    connexions Auth en absolu (à revoir si montée en charge).
- ✅ **P1 Audit** — `AUDIT-2026-07-06.md` généré (S1-S6 / U1-U5, advisors
  intégrés). Voir son BILAN : tableau de bord unique.
- ✅ **P2 Sécu** — S1-S6 tous fermés (commits atomiques, migrations 0002/0003
  appliquées, advisors security = 0 lint).
- ✅ **P3 UX (audit)** — U1-U4 fermés (migration 0004 appliquée, smoke
  navigateur vert) ; U5 ⏭ arbitrage Paul. Les évolutions produit (géocodage,
  recherche, clustering…) restent dans ROADMAP-SITE.
- ⏳ **Actions humaines en attente** (mode solo — consignées, non bloquantes) :
  1. ✅ **ARBITRAGE RENDU (2026-07-06)** : « on continue la carte réseau tout
     en liant les fonctionnalités au pivot v2 » → **hybride v1×v2** livré
     (migration 0005 : relations pilotables + journal/relances). La branche
     du pivot intégral reste archivée (`claude/session-protocol-start-opwcmp`).
  2. **Vercel — dernier geste pour mettre Ultima en ligne** : sur
     vercel.com/new, importer le repo GitHub `Ultima-` (intégration Git) et
     cliquer Deploy. Rien d'autre : pas de build, pas d'env à saisir (repli
     publiable dans l'API depuis PR #13), chaque push sur `main` redéploiera
     ensuite tout seul. (L'outil Vercel branché côté Léo ne crée pas de
     projet ; la CLI exigerait un jeton = secret.)
  3. Supabase Auth (dashboard) : inviter le compte de Paul (0 utilisateur en
     base), désactiver « Allow new signups » (complément serveur du
     `shouldCreateUser: false`), configurer Site URL + Redirect URLs sur le
     domaine Vercel.
  4. ✅ U5 résolu par la règle v2 (0005) : une seule relation ACTIVE par paire
     et par type ; les relations closes restent en historique.
  5. Advisor INFO : stratégie de connexions Auth en pourcentage (dashboard,
     utile seulement en montée d'instance).
- ✅ **Hybride v1×v2 (2026-07-06, arbitrage Paul)** : relations = rapprochements
  pilotables (cycle de vie, arrêt justifié, paire active unique) + journal
  « où j'en suis » avec relances (nœud XOR relation). Migration 0005 appliquée,
  API PATCH edges + endpoint journal, fiche enrichie, traits modulés par
  statut. Vérifié en navigateur (flux complets), advisors security = 0 lint.
- ✅ **Boucle v3-① Accueil (2026-07-06)** : Accueil « Bienvenue, Paul » en
  carte de livre d'enfance (specs graphisme + UX par agents, arbitrages
  consignés), relances dues actionnables, pilotage, suggestions R1-R4,
  onglets. Vérifié 2 fois (43 verdicts front-carto + contre-passe Léo,
  non-régression incluse).
- ✅ **Boucle v3-② Contacts (2026-07-06, solo)** : liste + recherche +
  saisie progressive, 4 harnais verts (contre-passe Léo incluse). Incident
  consigné : première fusion vide (commit sur main local), détecté aux stats
  de merge, récupéré au reflog — leçon au RADAR.
- 🟡 **Boucle v3-③ déploiement** : repo prêt (repli publiable PR #13, zéro
  build, zéro env) — reste UNE action Paul : importer le repo sur
  vercel.com/new (registre n°2), puis dashboard Supabase Auth (registre n°3)
  avec l'URL obtenue.
- 🟡 **Boucle v3-④ dictée vocale (2026-07-07)** : livrée et vérifiée — micro
  sur les 4 champs de texte libre (notes nœud/relation, journal), fr-FR,
  ajout sans remplacement, clavier prioritaire, progressive enhancement,
  aria + 44px. Harnais smoke-dictee (17 verdicts) ; contre-passe GO
  (28 verdicts indépendants). Inclut U6 (`microphone=(self)` au middleware —
  surface gated). **PR draft #16 en attente du go de fusion de Paul.**
  Backlog consigné : U7 (`window.prompt` raison d'arrêt), U8 (annonce live
  à la bascule) — voir AUDIT-2026-07-06.md.
- 🔜 **Boucle suivante (v3-⑤)** : géocodage d'adresse (Nominatim/OSM).
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
