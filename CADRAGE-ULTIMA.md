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
  2. ✅ **FAIT (2026-07-07)** — Vercel : projet `ultima` créé par import Git
     (équipe paggerard-boops-projects), déploiements actifs — le bot Vercel
     commente les PR avec des previews « Ready ». Les previews de branche
     sont protégées par l'authentification Vercel (bien). Restent à
     vérifier depuis un navigateur de Paul : l'URL de production, et le
     header `Permissions-Policy: … microphone=(self) …` (U6) — l'accès
     sortant vers vercel.app est bloqué par la politique réseau de
     l'environnement de Léo. Nota : le connecteur Vercel de Léo ne voit pas
     encore le projet `ultima` (périmètre d'autorisation à rafraîchir si on
     veut que Léo lise logs/déploiements).
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
- ✅ **Boucle v3-④ dictée vocale (2026-07-07)** : fusionnée dans `main`
  (PR #16, go Paul). Micro sur les 4 champs de texte libre, harnais
  smoke-dictee 17 verdicts, contre-passe GO (28 indépendants). Inclut U6
  (`microphone=(self)` au middleware). Backlog : U7, U8 (AUDIT).
- 🟡 **Boucle v3-⑤ géocodage (2026-07-07)** : livrée et vérifiée — bouton
  « Trouver sur la carte » (fiche nœud), endpoint `/api/geocode` (Nominatim
  fr, garde 1 req/s, timeout 5 s, réponse projetée, q jamais loggé),
  suggestions ≤3, aperçu carte, lat/lng repliés « avancé » [U10+U11].
  Harnais unit-geocode (18) + smoke-geocode (16) ; contre-passe GO
  (52 verdicts indépendants, injection HTML testée). Commits `b3eb9d2` +
  `bfd5570`. **PR en attente du go de fusion de Paul.** Vivier : U12
  (clic-carte), U13 (dictée adresse) — AUDIT.
- ⏳ **Actions humaines ajoutées (v3-⑤)** :
  6. Env Vercel `GEOCODE_USER_AGENT` (User-Agent Nominatim dédié ; le repli
     committé, publiable, expose l'email de contact de Paul vers Nominatim).
  7. Décision gated : durcir l'auth de `/api/geocode` (et des autres
     endpoints, même motif) par vérification réelle du jeton
     (`auth.getUser()`) — recommandation spec data v3-⑤.
  8. Après mise en ligne : confirmer l'usage réel Nominatim (l'amont n'a été
     exercé qu'en stub ; URL/User-Agent conformes à la politique OSM).
- ✅ **Boucle v3-⑥ recherche & zoom (2026-07-07)** : fusionnée dans `main`
  (PR #18, go Paul). U14-U17 fermés, U18 au vivier (→ R2). 8/8 harnais +
  contre-passe GO. **Le cap v3 ①-⑥ est terminé.**
- ✅ **Boucle R1 — habillage antique (2026-07-07)** : fusionnée dans `main`
  (PR #20, go anticipé de Paul consigné le 2026-07-07). Implémentation
  intégrale de `design/spec-r1-graphisme.md` : sépia 2 régimes par paliers
  de zoom (classes exclusives sur `#carte`), voile Ptolémée `L.svgOverlay`
  (pane 300, 100 % inline), cadre parchemin muet (z 640), cartouche ULTIMA,
  cernes encre #5a4118 + fillOpacity 1, arrivée au boot sur la Carte
  (Accueil v3-① par onglet). Harnais patrimoine `smoke-antique.mjs`
  (22 verdicts, contraste mesuré sur capture : 14,68:1 z6, 4,05:1 z13) ;
  9/9 harnais verts (161 verdicts) ; contre-passe GO (adversariale :
  rafales de zoom, angle sous coin, tuile factice couleurs OSM → « Lyon »
  8,25:1 z9 / 6,51:1 z6 sous voile). Vivier → R4 : table z-index du §2 de
  la spec fausse (transform du map-pane : tooltips/popups passeraient sous
  le vignettage en bord — sans impact actuel, aucun popup dans l'app),
  trait sous-traitance 2,06:1 à recaler, rose des vents, anneau crème
  décoratif. À prouver après déploiement : RA1/RA2 sur vraies tuiles OSM
  (proxy de l'env bloque tile.openstreetmap.org). **Prochaine boucle : R2
  — volet « Aujourd'hui »** (REFONTE-ACCUEIL.md §4, U18 au vivier).
- ✅ **Refonte Accueil — cadrage acté (2026-07-07)** : vision dictée par
  Paul (carte de France antique = entrée d'Ultima). Direction visuelle B
  « Age of Mythology » choisie sur previews ; **auth invisible** actée
  (session persistante — la suppression de connexion est refusée, sécurité).
  Cadrage complet : `REFONTE-ACCUEIL.md` (4 boucles R1-R4, risques RA1-RA5) ;
  référence visuelle : `design/preview-accueil-mythologie.html`. Prochaine
  boucle après v3-⑥ : **R1 habillage antique**.
- ✅ **Pivot Entrée + Arbre — cadrage fusionné (2026-07-08, go merge Paul)** :
  dictée Paul — page de connexion « Ultima » (carte-anneau fantastique
  originale, sans toponyme, bandeau ULTIMA) puis, connecté, **un arbre
  remplace la carte** (branche commune = secteur d'activité, une
  ramification par contact, croissance à l'ajout). Cadrage complet :
  `REFONTE-ARBRE.md` (boucles A1-A4, risques RB1-RB6) + 2 previews
  `design/preview-connexion-ultima.html` et
  `design/preview-arbre-contacts.html`, retravaillées en **registre
  antique et sérieux** (décision style 2026-07-08 : retrait du registre
  enfantin — CLAUDE.md et journal mis à jour). **Suspend REFONTE-ACCUEIL
  R2-R4** (registre R1 réutilisé, rien de jeté). PR #22 fusionnée sur go
  explicite de Paul (« merge and push »).
  **✅ Arbitrages D1-D5 rendus (2026-07-09, « je suis toutes tes recos »)** :
  D1 session persistante + belle page vue 1×/appareil ; D2a carte en onglet
  secondaire (rien de jeté) ; D3 secteur texte libre + suggestions ; D4 go
  previews ; D5 go ordre A1→A4.
- ✅ **Pivot Arbre A1→A4 livré (2026-07-09, solo)** — PR #24 (ready, fusion
  = go Paul). Chaque boucle : agent implémente → contre-passe sécu +
  verificateur indépendants → commit atomique.
  - **A1** page de connexion « Ultima » : overlay plein écran (carte-anneau
    SVG inline, cartouche ULTIMA), formulaire lien-magique rebranché à
    l'identique — **zéro touche auth** (RB5 vérifié). Fix toast au-dessus de
    l'overlay. Double-GO.
  - **A2** secteur d'activité : champ texte libre + datalist (dédoublonnage
    normalisé), validation 3 couches (HTML/API/CHECK, borne 120). Migration
    `0006_secteur_activite.sql` **déposée, NON appliquée — GATE Paul**.
    Double-GO.
  - **A3** l'arbre des contacts (`js/arbre.js`) : rendu SVG déterministe
    depuis `etat.noeuds`, branche « À classer », zéro chevauchement par
    construction ; arrivée connecté = l'arbre, carte en onglet secondaire ;
    tap/clavier → fiche existante, panneau sorti en overlay global ;
    recherche v3-⑥ conservée. Fix sécu S1 (octet NUL → module diffable).
    150 contacts ~5 ms. Double-GO.
  - **A4** croissance & vie : pousse animée (`prefers-reduced-motion`), état
    vide, finitions décor-only (déterminisme préservé), garde-fou `inert`
    derrière l'overlay de connexion, fixtures démo avec secteur (6 branches).
    Double-GO.
  - Patrimoine : 15 harnais verts (2 unit + 13 smoke), 0 erreur console.
  **⏳ Registre Actions humaines (solo — non bloquant) :** ① appliquer
  migration `0006` (puis harnais + `get_advisors`) ; ② Vercel env
  `GEOCODE_USER_AGENT` + URL prod + header `Permissions-Policy` (U6) ;
  ③ Supabase Auth : inviter Paul, couper signups, Site/Redirect URLs ;
  ④ gate `auth.getUser()` endpoints ; ⑤ preuves live après déploiement
  (tuiles OSM réelles RA1/RA2, Nominatim réel, login). **Fusion PR #24 =
  go Paul.**
  **Vivier (passes ultérieures) :** fidélité visuelle « arbre-registre en
  bandes » vs dessin peint (arbitrage esthétique Paul) ; assertions de
  contraste dédiées (aide connexion + bannière secteur) ; relations v2 en
  lianes/greffes entre branches (A3 vivier).
- ✅ **Outillage skills + Léo (2026-07-11, solo)** — recherche GitHub de skills
  utiles à la construction d'Ultima, filtrés au stack vanilla + registre
  antique (pas de landing → marketing écarté). Installés dans `.claude/skills/`
  (anthropics/skills, Apache 2.0, licence conservée) : `frontend-design`,
  `theme-factory`, `algorithmic-art`, `webapp-testing`, `skill-creator`.
  Charte de Léo enrichie (dispatch des skills par agent + mandat recruteur
  étendu aux skills, repère agent vs skill). PR #26, #27 fusionnées.
- ✅ **Boucle « antique et sérieux » (2026-07-11, solo)** — exécution de la
  décision style 2026-07-08 : purge des derniers résidus « enfantins » du
  front. Police manuscrite Caveat → pile old-style 100 % système
  (`--police-ancienne`, zéro asset) ; panneaux de bois (poteau/clous) →
  plaques de parchemin gravées (classes conservées, `app.js` intact) ;
  2 `@font-face` + 2 woff2 (~100 Ko) supprimés, tokens `--bois*` purgés.
  11 harnais verts, AA reconfirmé, contre-passe verificateur GO. PR #28.
- ✅ **Boucle RB2 — verrouillage contrastes (2026-07-11, solo)** — assertions
  de contraste dédiées (bannière secteur 9,34:1 ; aide connexion 5,50:1),
  vidées du vivier ci-dessus. Verrouillage pur (aucune couleur changée).
  PR #29. ⏳ Consigné : sous-titre décoratif du cartouche (`.cartouche-sous`)
  à 4,594:1 (AA mais marge fine) → micro-arbitrage graphisme si Paul le veut.
- ✅ **Gates préparées (2026-07-11, solo — « prépare toutes les gates »)** —
  runbook actionnable dans `RUNBOOK-GATES.md`. **Correction du registre :**
  la **migration `0006` est en réalité DÉJÀ APPLIQUÉE** (vérifié en base :
  version `20260709121710`, colonne `secteur_activite` présente ; advisors
  sécu = 0 lint bloquant, perf = INFO base vide) → gate ① close, le registre
  antérieur qui la disait « à appliquer » est périmé. Restent, préparées :
  ② Vercel env `GEOCODE_USER_AGENT` + URL prod + confirmation header U6 ;
  ③ Supabase Auth (inviter Paul, couper signups, Site/Redirect URLs) ;
  ④ ✅ **durcir `auth.getUser()` — CLOSE** (PR #32 mergée sur go Paul le
  2026-07-11 : `requireUser` valide le jeton sur les 5 endpoints, fail-closed,
  arbitrages geocode-401 + panne-Auth-401 validés ; securite-auditeur +
  verificateur GO) ; ⑤ preuves live post-déploiement ;
  ⑥ optionnels (protection mots de passe compromis WARN — sans objet en
  lien-magique ; sous-titre cartouche ; connecteur Vercel de Léo qui ne voit
  pas encore `ultima`).
- ✅ **Boucle « Arbre responsive en largeur » (2026-07-11, solo)** — réponse à
  la question de Paul (« la carte grandit-elle avec les contacts ? ») :
  l'Arbre grandissait déjà en HAUTEUR avec les contacts, mais sa LARGEUR était
  bloquée (~640 px, colonne étroite). Il s'élargit désormais par paliers de
  colonnes selon la largeur d'écran : 3 col (vb 620, <820) → 4 (820) → 5
  (1040) → 6 (1240) ; mobile pixel-identique. Layout rendu fonction pure
  `calculerLayout(noeuds, largeurCible)` + `choisirPalier` en escalier ;
  `data-palier` (attribut, CSP OK) ; resize débouncé 150 ms re-rendant au seul
  changement de palier. 14 harnais verts, contre-passe verificateur GO
  (déterminisme aux seuils, zéro scroll-X, mobile non régressé). PR #34.
  ⏳ Réserves cosmétiques négligeables : 1 re-render idempotent au 1ᵉʳ resize ;
  `data-palier` non nettoyé en état vide (sans effet). Spec :
  `design/spec-arbre-responsive.md`.
- ✅ **PIVOT PLATEFORME — cadrage acté (2026-07-12)** : dicté par Paul, tournant
  majeur. Ultima devient sa **plateforme personnelle en console à 4 quadrants**
  (TRAVELER réseau · BALTHAZAR GELD finances · ADRAMELECH idées · IMLADRIK dév. perso),
  pilotée par la seule Léo (désormais **féminine**), un repo, mémoire
  inter-segment. Le réseau existant (v1→A4) devient le quadrant TRAVELER — rien
  de jeté. Livré en **cadrage pur** (zéro code produit) : `CADRAGE-CONSOLE.md`
  (console, 4 quadrants, sécurité relevée §5, carte agents/skills §7, roadmap
  C0→C5 §8, risques RC1-RC5, arbitrages §10). Mémoire implantée (journal, profil,
  lexique, radar), charte Léo + CLAUDE.md étendus. **Prochaine boucle : C1 — la
  console** (coque réutilisant l'existant) OU le mini-cadrage du quadrant que
  Paul veut voir en premier. **Arbitrages ouverts (décisions Paul)** : ordre des
  quadrants (reco : le moins dépendant d'un service externe d'abord) ; niveau de
  chiffrement au repos BALTHAZAR GELD/IMLADRIK ; périmètre v1 par quadrant.
- ✅ **ADRAMELECH — premières captures (2026-07-16)** : registre de capture
  `adramelech/IDEES.md` ouvert (format prêt pour l'import en base à la boucle
  ADRAMELECH). Deux idées dictées par Paul, nommées et enrichies :
  **ADR-001 GLANEUR** (récupération invendus/rebuts bâtiment — tournée Leroy
  Merlin, mise à la benne facturée aux artisans, entrepôt achat-revente ;
  avec Godefroy) et **ADR-002 PROTÉE** (entreprise flexible bâtiment/énergie —
  clim/PAC/photovoltaïque selon saisons et modes, équipes polyvalentes,
  subventions captées proprement ; avec Julien), puis **ADR-003 INTENDANT**
  (pilotage d'approvisionnement de chantier — matching besoins client ⟷
  commandes ⟷ stock propre, livraison J-1/J-2 contrôlée, manquants vus avant
  la pose ; besoin propre de Paul, cas d'école : l'aile de recouvrement
  manquante qui a foutu un chantier de fenêtres), puis **ADR-004 MYCÉLIUM**
  (1 client → 2 clients : pilotage par la data client, relances au bon
  moment, séquence post-chantier satisfaction → avis Google → recommandation
  nominative ; maxime « frappez après une victoire »). Lexique vocal enrichi.
  **Fusionné dans `main`** (PR #40, go Paul « Allons-y », 2026-07-16 ; inclut
  la correction globale TRAVELER à un seul L). **Carto des idées livrée** :
  `adramelech/carto-idees.html` (archipel gravé — 4 îles, routes de synergie,
  ancrages TRAVELER, cartouches de précision ; thèmes clair/sombre, zéro JS,
  vérifiée en navigateur) + artifact Claude pour consultation immédiate.
  ⏳ Sécurité à trancher à la boucle ADRAMELECH : le contenu `adramelech/`
  (idées = données personnelles, §5 CADRAGE-CONSOLE) est servi statiquement
  par Vercel sans auth — à gater (middleware) ou sortir de la racine web.
  **Fusionnée (PR #41, go Paul « merge et push »).**
- ✅ **Verrou architecture agent + blasons (2026-07-16, PR #41)** : un seul
  agent (Léo) pilote tout Ultima — seule en cross-plateforme, seule
  interlocutrice, mémoire unique ; les autres `.claude/agents/` sont ses
  sous-agents. Blasons de quadrant figés : TRAVELER = boussole · ADRAMELECH =
  dragon · BALTHAZAR GELD = balance · IMLADRIK = étoile · Console = sceau ULTIMA.
- 🟡 **Boucle ADRAMELECH — mini-cadrage (2026-07-16, directive EB « on boucle
  Adramelech »)** : `adramelech/CADRAGE-ADRAMELECH.md` déposé (cadrage pur).
  Périmètre v1 recommandé = « bibliothèque vivante sans base » (générateur de
  carto depuis le registre AD-1, `agent-idees` + bilan AD-2, sécurité du
  quadrant AD-3 ; passage en base AD-4 reporté derrière gate). Point sécurité
  résolu au cadrage (idées derrière l'auth). **Décisions Paul en attente** :
  périmètre v1, option sécurité, ordre vs console C1 (voir §6 du cadrage).
  Prochaine sous-boucle constructible sans gate : **AD-1**.
- ✅ **Boucle ADRAMELECH v1 livrée (2026-07-16, solo)** — les 3 sous-boucles
  bouclées :
  - **AD-0 sécuriser** (PR #42 mergée) : garde middleware `estCheminPrive` +
    `.vercelignore` retirent `/adramelech/*`, `/memoire/*` (PII de Paul) et tout
    `*.md` de la surface publique ; contre-passe adversariale GO ; durcissements
    S1/S2/S3 différés à AD-4. Conséquence actée : quadrant « noir en prod » en v1.
  - **AD-1 carto générée** (PR #43 mergée) : `adramelech/generer-carto.mjs`
    déterministe (archipels par thème, ponts, ancrages TRAVELER data-driven),
    parseur zéro-perte, harnais de fermeture.
  - **AD-2 agent-idees + bilan** (PR en cours) : sous-agent `agent-idees` recruté
    + bilan chiffré (dashboard statique) dans la carto.
  Chaque brique : agent implémente → Léo vérifie indépendamment (harnais +
  navigateur) → commit → gate/merge Paul.
- 🟡 **AD-4 idées en base (2026-07-16, GO SOLO)** — AD-4a migration `0007`
  (tables `idees`/`idees_liens`, RLS mono-owner) **appliquée en base** (contre-
  passe securite-auditeur GO, `rls_enabled` confirmé) ; AD-4b API idees
  (`requireUser`, validation stricte, 20 verdicts) ; AD-4c durcissements
  S1/S2/S3 du garde PII fermés. **⏳ Gaté (invérifiable sans compte auth Paul)** :
  front carto client-side après auth (fin du « noir en prod ») + seed des 4
  idées (`importer-idees.mjs` prêt). Détail : `adramelech/CADRAGE-ADRAMELECH.md`.
- ✅ **Boucle AD-4c front — « on termine AD » (2026-07-19)** : la carto des
  idées consultable en prod après auth — `idees.html` sur `/idees` (motif
  traveler, middleware et garde AD-0 INTOUCHÉS), `js/idees.js` data-driven
  depuis `GET /api/idees` (archipels par thème, ponts, badges statut, états
  401/vide/erreur/démo), ouverte depuis l'antichambre du quadrant
  (adramelech.html, diffusion Léo PR #55) — réconciliation des deux sessions :
  l'antichambre est la porte, la carte est sa vue « archipels ».
  Harnais `unit-idees-carto` (20) + `smoke-idees` (45) ; suite patrimoine
  verte ×2 (front-carto + contre-passe Léo indépendante, captures vérifiées).
  **Fin du « noir en prod » — le quadrant ADRAMELECH est bouclé** (AD-0→AD-4).
  PR #54, fusion = go Paul. ⏳ Preuve du flux authentifié réel en prod = geste
  Paul (se connecter, ouvrir /idees). Anti-télescopage : session parallèle L1
  identifiée, zones interdites respectées (leo-accueil, traveler, middleware).
- ✅ **DIRECTIVE JL actée (2026-07-18)** : dictée et nommée par Paul — à terme,
  **Ultima = son unique interface de travail** (au sens large), absorbant toute
  sa data (pro et perso), Léo seule interlocutrice qui oriente, dispatche et
  navigue tout ; outil souple qui apprend et s'adapte ; **rien d'autre ne sera
  créé**. Tous les travaux doivent y être conformes. Gravée dans CLAUDE.md (🎯),
  CADRAGE-CONSOLE §1, charte Léo, journal des décisions, lexique. EB = la
  discipline de route, JL = la destination.
- ✅ **Boucle L2 — la voix de Léo (2026-07-19, « Focus Léo »)** : sur ordre de
  Paul (« les projets on verra plus tard, focus Léo » — MYCÉLIUM/PROTÉE
  reportés au registre), la voix conversationnelle est construite :
  `POST /api/leo` (requireUser fail-closed → API Claude, clé env Vercel
  uniquement, timeout 30 s, bornes historique/réponse, garde de débit
  1 appel/3 s/utilisateur [S-L2-1], prompt Jarvis par quadrant sans PII) +
  zone « Parler à Léo » dans le cartouche (TRAVELER + ADRAMELECH, session
  réelle exigée ; 503 sincère tant que la clé n'est pas posée). Contre-passe
  securite-auditeur **GO** (S-L2-1 fermé même boucle ; S-L2-2 injection =
  angle mort consigné pour L2b) ; harnais complet vert (24 verdicts unit +
  smoke conversation stubée). **PR #60 (draft, porte aussi le front
  INTENDANT AD-5c-δ), fusion = go Paul.** Détail : CADRAGE-LEO-SITE §4.
  ⏳ Gate coût : clé API + plafond mensuel + env `ANTHROPIC_API_KEY` = Paul.
- ✅ **Boucle L2b — les mains de Léo (2026-07-20)** : tool use sur /api/leo —
  lectures (lire_idees, lire_intendant) exécutées sous RLS, minimisées et
  plafonnées ; écritures (creer_idee, ecrire_journal, ajouter_besoin)
  JAMAIS exécutées par l'IA : proposition → plaque de confirmation (cible
  résolue SOUS RLS en libellé humain + contenu complet) → exécution sur
  {confirme:true} seul, revalidée par les validateurs CRUD sous le JWT de
  Paul. Aucune suppression v1. Ré-audit S-L2-2 : **GO**, ses 3 constats
  (S-L2b-1 plaque incomplète [modéré], S-L2b-2 lectures non plafonnées,
  S-L2b-3 durée) fermés même boucle. Harnais 27/27 verts. **PR #67
  (draft), fusion = go Paul.**
- ✅ **L3-① — cadrage mémoire + migration 0009 RÉDIGÉE (2026-07-20, go
  Paul, escalade Opus signalée)** : cadrage v1 gravé (CADRAGE-LEO-SITE §4 —
  table unique leo_memoire à 3 genres, écritures 100 % déterministes
  serveur, l'IA sans aucun outil mémoire) ; SQL rédigé par data-ingenieur
  (Opus), contre-passe de relecture Léo GO — **JAMAIS appliquée** :
  application = gate Paul + contre-passe securite-auditeur (séquence ②),
  puis branchement route (trace/résumé/bloc mémoire) et boucle preference.
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
