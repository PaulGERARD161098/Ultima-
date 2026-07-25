# Mémoire Léo — Journal des décisions de Paul

> Une décision consignée n'est jamais redemandée ni re-litigée.
> Format : date — décision — conséquence.

- **2026-07-23 (NICOL BOLAS amélioré — GO SOLO « améliorons le »)** — Paul :
  « passons sur NB, améliorons-le » puis « quel est ton ordre ? » → Léo fixe
  l'ordre (valeur ↑, risque/dépendance ↓) et enchaîne en solo les 3 boucles
  non-gatées d'ABAQUE : **NB-2b arbitrage achat/location** (#89 — surface
  `arbitrageAchatLocation`, impact cash calculé en re-simulant le scénario ; règle
  « louer si l'achat casse le plancher » = cas VERTUMNE), **NB-2c export/import
  JSON** (#90 — sauver/recharger un scénario en fichier local, sans base),
  **NB-2d saisonnalité + module TVA** (#91 — 12 coefficients + TVA optionnelle,
  params déjà dans le moteur figé). Toutes **front-only** (zéro migration/base/
  réseau, finance jamais en logs), patrimoine complet vert, mergées en solo.
  **NB-3 persistance en base NON exécutée** : c'est une **décision produit ouverte
  (§9.4) + gate finance (RC2)** — réservée à un go explicite de Paul (migration
  `0013`, `0012` étant pris par IMLADRIK). Contexte : une autre session a mergé
  IMLADRIK (#86, journal intime, migration `0012`) pendant la session — intégré
  sans conflit (fichiers disjoints).

- **2026-07-23 (LV2-⑤ cockpit — résumés vivants v1, GO SOLO « go la suite »)** —
  La boussole devient un **cockpit** (§2bis « pas un menu ») : au survol d'un cap
  data, le vrai « en cours » (agrégats) remplace le texte figé. Endpoint
  `api/cockpit.js` = **comptes uniquement, derrière auth, zéro PII** (RESHIRAM :
  talents/à étayer ; ZEKROM : idéaux/à orienter, liens acquis/à construire).
  Front : `boussole.js` (fetch + `ligneVivante` pure), `boussole-auth.js` livre la
  session. **Décision d'archi (Léo, solo)** : `boussole.js` chargé AVANT
  `boussole-auth.js` — le hook cockpit doit exister avant que l'auth ne le
  sollicite (bug de timing microtask corrigé : sinon le fetch est sauté au 1er
  chargement). Fail-closed : sans session → texte figé. Patrimoine complet vert.
  v2 différé (par valeur, §2bis) : signaux/badges, cap du jour, état transversal,
  capture-dispatch — dépendent de NICOL BOLAS + connecteurs data réels.

- **2026-07-23 (LV2-③ passerelle R↔Z v1 — GO SOLO, « go la suite »)** — À la
  suite de ZEKROM, construit le **cœur du doublet** : la table de liaison
  `passerelles` (idéal ZEKROM ↔ talent RESHIRAM) porteuse d'une **nature**
  (`acquis` = talent que j'ai qui rend l'idéal possible ; `a_construire` = talent
  que l'idéal appelle et qui me manque) + note libre. **Rétroplanning** rendu par
  idéal sur `zekrom.html` (« ce que j'ai déjà / ce qui me manque »), **manuel v1**
  (Paul crée/valide les liens). **Chiffrage du coût délégué à NICOL BOLAS** (hors
  v1 ; la note amorce le besoin). Migration `0011` + vue `ideaux_retroplanning`,
  RLS **double scellement AD-4** (un lien ne relie qu'un idéal ET un talent du
  même owner). API `api/passerelles.js` (owner_id serveur-only, FK figées en
  PATCH). Décisions v1 tranchées par Léo (cadré §9 R/Z) : lien depuis l'idéal
  (côté ZEKROM) ; miroir RESHIRAM = v2. Patrimoine complet vert. Le doublet réel
  ↔ idéal devient **agissant**.

- **2026-07-23 (ZEKROM v1 construite)** — Paul (dictée) : « implante mes 3 rêves
  dans ZEKROM ». Boucle LV2-② livrée = miroir de RESHIRAM. Ses **3 objectifs de
  vie** actés comme idéaux seed : ① prendre soin du domaine/terres du moulin
  (projet) ; ② partir avec une femme aimée, un moment dans un village de pêcheurs
  (vision) ; ③ travailler d'où il veut, libre de voyager et d'ouvrir des business
  partout, sans contrainte géographique (projet). **Modèle** : `ideaux`
  (`intitule, registre ∈ vision/volonte/projet, horizon`) + `directions` (« un
  idéal → une direction », le cap). **Règle cardinale inverse de RESHIRAM** : un
  idéal sans direction = « à orienter » (INVITATION, jamais une dévaluation ; le
  réel ne censure pas). Vue « mon cap directionnel » = enrichissement, pas un
  filtre. **GO SOLO (2026-07-23)** : migration `0010` **appliquée en prod**
  (Supabase Ultima), **seed exécuté** pour l'owner de Paul (d25b59aa…) → 3 idéaux
  + 5 directions vivants (vérif `ideaux_etat`), **advisors post-DDL propres**
  (parité RESHIRAM ; seul warning sécu = `leaked_password_protection` global/
  pré-existant, sans objet — pas d'auth mot de passe), **PR #83 mergée** (squash).
  Patrimoine complet vert + contre-passe sécu CONFORME. Doublet réel ↔ idéal
  complet et vivant. Dette annexe resynchronisée (test-only) : `smoke-quadrants`
  rouge depuis #75 (bcp.html/ABAQUE). Discipline post-squash : branche repartie de
  `origin/main`.

- **2026-07-21 (renommage)** — **BALTHAZAR GELD → NICOL BOLAS** (dicté Paul).
  Quadrant financier renommé partout (UI `ultima.html`/`bcp.html`, code
  `api/_lib/leo.js` + js, tests, cadrages, charte). Emblème inchangé (balance),
  fichier `bcp.html` conservé (id stable). Orthographe **« NICOL BOLAS »**
  (réf. MTG confirmée par Paul ; le premier jet avait écrit « NICOLE » tel que
  dicté, corrigé ensuite). Chaîne : BCP → BALTHAZAR GELD (07-19) → NICOL BOLAS.
- **2026-07-22 (feuille de route LV2 cadrée)** — Paul : « on fait le restant sur
  LV2, cadre bien proprement ». Reste LV2 ordonné par dépendances dans
  `CADRAGE-ULTIMA.md` (bloc 🗺️ RESTE LV2) : ① débloqueur = finaliser LV2-② Auth
  (config Google/Supabase, action Paul, verrou d'usage) ; ② ZEKROM v1 (mini-
  cadrage → migration 0010 → console) ; ③ passerelle données R↔Z (liaison
  talent↔idéal + rétroplanning, manuel v1) ; ④ connexions v2 RESHIRAM→RIVEN
  (talent_refs_reseau + capital réseau) ; ⑤ cockpit LV2-③ + résumés vivants.
  Autres : YCOME (URL), NICOL BOLAS finance (grande boucle §3.2). Gates :
  migrations 0010+, fusions, OAuth ; zéro ressource facturée. Cadrage seul.
- **2026-07-22 (RESHIRAM v1 implémentée)** — console livrée (agent + contre-passe
  Léo + patrimoine 100% vert). API `api/talents.js` (GET/POST/DELETE) +
  `api/preuves.js` (POST/DELETE) : `requireUser` réel, **owner_id jamais du
  client** (`rejectUnknown` + défaut base), validation miroir des CHECK 0009,
  scellement composite cross-owner, erreurs génériques/logs sans PII. Front
  `reshiram.html` + `js/reshiram.js` : shell fail-closed, carte des talents,
  badge « à étayer » + défi de Léo sur la preuve, bascule « Mon offre réelle »
  (filtre `a_etayer=false`). Cap boussole RESHIRAM ouvert (interne, `reshiram.html`).
  Harnais `unit-reshiram-validate` (27) + `smoke-reshiram` (A/B/C). Correctif
  contre-passe : retour → **boussole** `/` (pas la console Ultima, car RESHIRAM
  est un cap boussole). Rien à migration/RLS/middleware. **Fusion = gate Paul.**
- **2026-07-22 (hébergement RESHIRAM)** — Paul : **RESHIRAM vit DANS Ultima,
  rien de plus.** Même repo, même déploiement Vercel `ultima`, même projet
  Supabase `leosfqyidgsaescjbfom` ; console = **page interne** (même onglet,
  `externe: false` — déjà le cas dans le registre boussole), PAS un lien externe.
  **Aucune ressource facturée en plus** (pas de nouveau Vercel/Supabase/domaine).
  ZEKROM idem. Consigné `CADRAGE-RESHIRAM-ZEKROM.md §7 Hébergement`.
- **2026-07-22 (modèle données RESHIRAM v1)** — conception par data-ingénieur +
  contre-passe Léo (validée). Migration **`0009_reshiram_talents.sql` déposée,
  NON appliquée (gate Paul)**. 2 tables (`talents`, `preuves`) + 2 vues
  (`talents_etat` avec `a_etayer` dérivé, `talents_offre_reelle` = talents
  étayés). Conventions respectées : RLS `(select auth.uid())` initplan, owner_id
  default, trigger `set_updated_at` réutilisé, vues security_invoker, scellement
  AD-4 (owner_id,id), index justifiés, zéro GRANT (cohérent), zéro seed.
  **Décisions validées Paul 2026-07-22** : ① `niveau` = notion/pratique/maitrise
  (sans « expert ») ② secteurs = texte libre `text[]` ③ `plus_value` bornée 2000.
  Le fichier 0009 reflète déjà ces choix. **✅ Appliquée 2026-07-22 sur « Go »
  de Paul** (escalade Opus, gate fermée) : `talents` + `preuves` créées, **RLS
  activée** confirmée (`list_tables`), 2 vues. ⏳ Auto-check advisors non lançable
  (approbation MCP indisponible en async) — schéma conçu 0-lint (RLS on, vues
  security_invoker, trigger réutilisé) ; à reconfirmer au dashboard/prochaine
  session. Fichier fusionné dans `main`.
- **2026-07-22 (emblèmes R/Z)** — blasons des caps changés (dicté Paul, réf.
  dragons) : **RESHIRAM = aile blanche**, **ZEKROM = aile noire** (même aile
  plumée, en miroir → les deux se font face de part et d'autre de la passerelle).
  Remplace ancre/flambeau. `js/boussole.js` (fonctions `aile()` +
  `blasonAileBlanche/Noire`). smoke-boussole vert.
- **2026-07-22 (renommage)** — **TRAVELER → RIVEN** (dicté Paul, « implante
  partout »). Nom affiché du quadrant réseau renommé partout (UI, code, tests,
  cadrages, charte, mémoire, commentaires migration/validate). **Identifiants
  structurels conservés** : `traveler.html`, hrefs, clé quadrant `traveler`,
  classes/ids, sessionStorage — inchangés (zéro risque). Lexique : Traveller/
  Traveler → RIVEN.
- **2026-07-22 (v2 RESHIRAM finalisée)** — connexions détaillées (§7 v2) :
  **RESHIRAM → RIVEN** = lecture seule (refs de fiches réseau, vue « capital
  réseau » chiffrée par secteur, jamais de copie, RIVEN = source de vérité) ;
  **RESHIRAM → ZEKROM** = passerelle manuelle (talent↔idéal), rétroplanning
  « quels talents j'ai / manquent » → besoin chiffré (coût délégué NICOL BOLAS),
  enrichissement bidirectionnel. Modèle de données v2 : `talent_refs_reseau`
  (lecture) + liaison `talent↔idéal`. Migration = gate. Cadrage seul.
- **2026-07-21 (mini-cadrage RESHIRAM)** — v1 **validé** par Paul : carte des
  **talents ancrés sur preuve** (`nom, secteurs[], niveau, preuve, plus-value?` ;
  sans preuve → « à étayer »), écran unique + Léo challenge, vue « mon offre
  réelle ». 3 talents réels seed donnés : ① sourcing artisans rapide (CVC,
  cuisine, SdB, réno ; plus-value rapidité) ② trancher le flou (analytique/
  décisionnel, transversal) ③ réseau de contacts + capacité à en trouver
  (capital + capacité → RIVEN). v2 cadrée : vue réseau depuis RIVEN,
  capacités/moyens, plus-values chiffrées, passerelle ZEKROM. Modèle de données
  = gate migration. Consigné en `CADRAGE-RESHIRAM-ZEKROM.md §7`. Cadrage seul.
- **2026-07-21 (forks R/Z tranchés)** — **Fork 1 (frontières)** : RESHIRAM =
  **présent/terrain/concret**, ZEKROM = **futur/idéal** (point de départ du
  rétroplanning), **IMLADRIK = la personne** (dév perso, plus large, « rien à
  voir » avec R/Z — Paul corrige la reco Léo qui craignait un recouvrement).
  Trois plans distincts, pas de doublon. RESHIRAM lit RIVEN sans copier ✅.
  **Fork 2 (passerelle)** : **manuel pour l'instant** (Paul valide les
  rapprochements), auto plus tard. **Fork 3 (ordre)** : ✅ **RESHIRAM d'abord**,
  ZEKROM ensuite. **Cadrage R/Z complet.** Cadrage seul.
- **2026-07-21 (cadrage consoles)** — **Cadrage des consoles RESHIRAM & ZEKROM
  ouvert** (Paul : « go cadrage console pour Z et R ») → `CADRAGE-RESHIRAM-ZEKROM.md`.
  RESHIRAM = carto du réel (talents/capacités/plus-values/réalisations, vue
  réseau lue depuis RIVEN sans copie, ancrage sur preuve). ZEKROM = idéaux/
  volontés/cap directionnel (expression libre, faire rêver). Passerelle =
  rétroplanning idéal→réel + enrichissement bidirectionnel + besoin chiffré
  (coût délégué à BALTHAZAR GELD, reco). Arbitrages ouverts : frontières
  ZEKROM↔IMLADRIK↔ADRAMELECH, modèle de données (gate migration), passerelle
  manuelle vs auto, ordre (reco RESHIRAM d'abord). Cadrage seul, aucun code.
- **2026-07-21 (posés)** — **RESHIRAM & ZEKROM posés sur la boussole** (Paul :
  « pose Z et R et ensuite merge ») : 2 caps autonomes « à venir » (ancre /
  flambeau) + passerelle pointillée réel↔idéal. Boussole = 5 caps, harnais
  40 verts. Puis merge du cadrage + pose (PR #70).
- **2026-07-21 (précisions Paul)** — **RESHIRAM & ZEKROM = deux caps
  AUTONOMES** de la boussole, liés par la passerelle data mais **jamais dans une
  seule division** (ni sous-caps, ni sous IMLADRIK). Sous-titres figés :
  RESHIRAM « le travail de la réalité », ZEKROM « la quête de l'idéal ». Lecture
  « projets idéaux » confirmée. Passage brouillé de la dictée : à ignorer.
- **2026-07-21** — **Caps RESHIRAM & ZEKROM cadrés** (dicté Paul) : doublet
  **réel ↔ idéal** ajouté au registre boussole (§2bis). **RESHIRAM** = carto de
  la **réalité concrète des talents/capacités** (faits, chiffres, data ; rien
  d'idéalisé ; lien fort RIVEN), sous-titre figé **« le travail de la
  réalité »**. **ZEKROM** = sous-titre figé **« la quête de l'idéal »**
  (volontés, idéaux, cap directionnel, « faire rêver »). Les deux en
  **concurrence pas opposition**, **passerelle data bidirectionnelle** (« qu'est-ce
  qui nourrit quoi »), support du **rétroplanning** idéal→réel + analyse de
  besoin/coût long terme. Ouverts (§10) : sous-caps d'un même macro-projet
  (reco Léo) vs caps séparés ; rattachement IMLADRIK vs autonome ; confirmer
  « projets idéaux » (dictée « vidéo ») + passage brouillé. Cadrage seul.
- **2026-07-21** — **Cadre LV2-cockpit consigné** (Paul : « consigne », posture
  expert accompagnement auto-entrepreneur + pilotage data). Ajout de `§2bis` à
  `CADRAGE-CONSOLE.md` : la boussole = **cockpit** (pas un menu) — signaux au
  survol, cap du jour, état du jour transversal, capture-dispatch, résumés
  vivants ; évolution de Léo (ingestion data réelle via connecteurs, briefing
  quotidien, pilote fiscal/tréso = `agent-finances`, signaux faibles, rédaction
  assistée). §3.2 (finance) et §5 (sécu) inchangés, restent valables. Arbitrages
  LV2 reportés en §10 (périmètre cockpit, statut fiscal, data réelle vs saisie,
  URL YCOME). **On reste en cadrage : rien codé.**
- **2026-07-21** — **Ultima LV2 lancé** (cap dicté par Paul) : une boussole
  d'accueil (rose des vents, carte savante) où chaque cap est un macro-projet ;
  la console à 4 quadrants devient le macro-projet « Ultima ». Défauts tranchés
  par Léo, réversibles, à ne pas re-litiger sauf changement de cap de Paul :
  ① **la boussole devient l'accueil `/`** (console reléguée sur `/ultima`) ;
  ② **auth inchangée** pour LV2-① (lien magique Gmail conservé ; le « mot de
  passe » évoqué = gate LV2-② dédiée) ; ③ **registre extensible** — les
  macro-projets sans URL (Renault Boost, Ikom) sont des caps « à venir »,
  ajouter/brancher = une ligne dans `MACRO_PROJETS`. LV2-① coque livrée +
  vérifiée le jour même (Paul avait coupé le questionnaire → Léo a tranché et
  construit).
- **2026-07-02** — Ultima = carte interactive du réseau commercial, greenfield,
  Leaflet/OSM (pas de Google Maps sans décision coût), vanilla sans framework.
- **2026-07-03** — Go création projet Supabase « ultima » (10 $/mois, Paris).
- **2026-07-03** — Go application migration `0001` (RLS) puis `0002`
  (advisors : search_path + RLS initplan).
- **2026-07-03** — **Mono-utilisateur** : seul Paul se connecte (Gmail perso).
  Inscription fermée [S3]. Persona « collaborateur » hors périmètre.
- **2026-07-03** — Équipe d'agents + **Léo master agent, interlocuteur unique**
  (remplace ultima-pilote), ancré dans `CLAUDE.md`.
- **2026-07-03** — **Vision produit précisée** (annule et remplace) :
  cartographier les **individus** du réseau pro ; passerelles entre business
  via les individus ; méthode qualitatif → chiffré → pilotage ; **autarcie
  complète** du projet (pas de passerelles vers les autres projets de Paul —
  l'idée inverse était une erreur d'interprétation de Léo, supprimée) ;
  **mobile-first** (« pilotage au bout des pouces »), ordinateur ensuite ;
  autonomie de Léo en arrière-plan : sécurité + tenue des données.
- **2026-07-03 (go pour tout)** — ① Pivot du modèle acté : personne = seul
  nœud, rapprochement = objet pilotable (statuts + raison d'arrêt requise),
  journal avec relances → migration `0003` déposée (application = gate).
  ② Arrière-plan Léo = relances + hygiène + advisors (lecture seule,
  quotidien). ③ PWA validée (pas d'app native). ④ P2 sécu S1/S4/S5
  appliqués dans la foulée du go global.
- **2026-07-03 (clôture)** — Go application `0003` : appliquée et vérifiée
  (3 tables RLS/12 policies/index GIN, v1 supprimée). Fin de session dans la
  foulée ; prochaine boucle = implémentation v2 (API puis front, spec UX).
- **2026-07-06** — Protocole **GO SOLO** ancré dans `CLAUDE.md` (déclencheur
  « solo ») : autonomie maximale, merge/push autorisés, registre « ⏳ Actions
  humaines » ; restent bloquants : payant, suppression de données non
  vérifiées vides, secrets, choix produit ambigu.
- **2026-07-06** — ⚠️ **Conflit de cap détecté a posteriori** : la session du
  03 (PR #3, jamais fusionnée ni synchronisée Notion) avait acté le pivot v2
  et appliqué son schéma ; la session du 06, partant des docs de `main`
  (v1 seule), a purgé les tables v2 (vérifiées vides — zéro donnée perdue),
  réappliqué et durci le schéma v1 (migrations 0001-0004, advisors 0 lint),
  branché le front réel et fusionné (PR #4). **Arbitrage Paul requis :
  reprendre le pivot v2 (migration prête dans la branche de l'ex-PR #3) ou
  continuer la v1 carte réseau.** Aucune des deux voies n'est perdue.
- **2026-07-06** — Portés de l'ex-PR #3 (indépendants du cap, actés le 03) :
  mono-utilisateur (`shouldCreateUser: false`), PWA (manifest + icône),
  mémoire Léo (`memoire/`), équipe d'agents (`.claude/`), Léo ancré dans
  `CLAUDE.md`. Non portés (dépendants du cap) : PRODUIT v2, AUDIT du 03,
  migration pivot.
- **2026-07-06 (arbitrage)** — « On continue la carte réseau tout en liant
  les fonctionnalités au pivot v2 » → **hybride v1×v2** : la carte v1 reste le
  socle ; relations = rapprochements pilotables (cycle de vie v2, arrêt
  justifié obligatoire, une active par paire/type — résout U5) ; journal
  « où j'en suis » avec relances sur nœud XOR relation. Migration 0005
  appliquée. Pivot intégral archivé en branche, non supprimé.
- **2026-07-06 (interface v3)** — Cadrage dicté par Paul : app en 3 onglets —
  **Accueil « Bienvenue, Paul »** piloté par Léo (« on fait quoi
  aujourd'hui ? » : relances dues, pilotage, suggestions par règles locales),
  **Carte** (existant), **Contacts** (saisie progressive, nom seul requis,
  saisie vocale navigateur pour les champs longs ; structuration complexe =
  dicter à Léo en session). Pas de Vercel existant pour Ultima → création
  Hobby (gratuit) à la livraison de l'Accueil. IA conversationnelle DANS
  l'app = clé API + coût → gate Paul, au registre.
- **2026-07-06 (style de l'Accueil)** — Image de référence envoyée par Paul :
  carte de la Forêt des Rêves Bleus (Winnie l'Ourson, E.H. Shepard). L'Accueil
  sera une **carte de livre d'enfance** : parchemin, encre, lettrage manuscrit,
  contacts = lieux dessinés, relances = panneaux. Style inspiré, œuvre non
  reproduite. Police manuscrite libre auto-hébergée (CSP).
- **2026-07-06 (capacités de Léo élargies)** — ① Créer/mobiliser des agents
  supplémentaires si l'équipe ne suffit pas (déjà en charte, confirmé).
  ② Messagerie : « envoie cela à Godefroy » → Léo rédige et dépose ; état
  réel : Gmail = brouillon complet possible, envoi direct non branché
  (dernier geste à Paul) ; si envoi branché un jour : uniquement sur
  instruction explicite. ③ Léo peut créer des rapprochements en base et
  interroger Paul sur les rapprochements potentiels (méthode qualitatif →
  chiffré → pilotage). ④ Idée maîtresse ancrée : conseiller, aider à
  piloter, faire réfléchir, donner des idées — proactivement.
- **2026-07-06 (état d'esprit + optimisation)** — ① Principe acté : Ultima =
  sérieux ET ludique (« donne envie comme à un enfant ») — gravé dans
  CLAUDE.md et le profil. ② Retours ⚡ implantés en règles permanentes :
  harnais navigateur versionnés dans `tests/` (lancer.sh), conception/implé
  par agents avec contre-passe Léo, réutilisation systématique, économie de
  contexte.
- **2026-07-06 (solo, v3-②/③)** — v3-② Contacts livré (4 harnais verts,
  double passe ; fusion réparée après incident de branche, cf. RADAR).
  v3-③ : décision technique Léo — repli API sur URL + clé publiable (pas des
  secrets, env prioritaires) → zéro env à saisir. Limite d'outillage : la
  création du projet Vercel exige l'import Git dashboard (ou jeton CLI =
  secret) → action Paul au registre (2 min, gratuit).
- **2026-07-08 (style — antique et sérieux)** : sur revue des previews du
  pivot, Paul retire le registre enfantin/ludique (« enlevons le style
  enfantin pour un style sérieux, style antique et sérieux »). Remplace le
  principe « sérieux ET ludique / comme à un enfant » du 2026-07-06 —
  CLAUDE.md mis à jour. Conséquences : plus d'annotations manuscrites
  (Caveat) ni de clins d'œil enjoués dans les interfaces ; registre carte
  savante (gravure, parchemin, cartouches, petites capitales). Les acquis
  R1 (sépia, cartouche, voile) sont déjà dans ce registre et restent.
- **2026-07-08 (pivot entrée + arbre — dicté, arbitrages ouverts)** :
  ① Vision dictée : page de connexion « Ultima » = carte de monde
  fantastique type île-anneau (référence Ulthuan/Warhammer → œuvre non
  reproduite, création originale, règle 2026-07-06 réappliquée), sans nom
  de monde, bandeau « Ultima ». ② Connecté : **plus de carte, un arbre**
  — branche commune = secteur d'activité, ramification = contact,
  croissance à l'ajout. ③ Méthode exigée : « cadre bien avant tout » →
  REFONTE-ARBRE.md livré AVANT tout code. ④ Non re-litigé : l'auth
  invisible reste actée (la page de connexion sera belle mais vue une
  fois par appareil) ; le sort de la carte existante reste à arbitrer
  (D2) — suspension de REFONTE-ACCUEIL R2-R4 consignée, pas de
  suppression.
- **2026-07-07 (refonte accueil)** — ① Vision dictée : la carte de France
  antique devient l'entrée d'Ultima (Ptolémée / Age of Mythology), points =
  contacts, « Ultima » stylisé en cartouche, ludique et imaginaire mais
  géographie réelle. ② Direction visuelle **B « Age of Mythology »** actée
  sur 3 previews (A Ptolémée / B mythologie / C hybride) — référence :
  design/preview-accueil-mythologie.html. ③ **Auth invisible** actée :
  session persistante, une connexion par appareil ; la suppression de la
  connexion demandée à l'oral est refusée après explication sécurité (URL
  jamais secrète, réseau = PII, RLS fondée sur le compte) — Paul a validé
  l'alternative. ④ Cadrage en 4 boucles R1-R4 : REFONTE-ACCUEIL.md.
- **2026-07-09 (arbitrages pivot + go solo)** — Paul : « je suis toutes tes
  recos » → D1-D5 actés aux options recommandées : D1 session persistante +
  belle page vue 1×/appareil ; **D2a la carte reste en onglet secondaire**
  (l'arbre devient l'écran connecté, rien de jeté) ; D3 secteur = texte libre
  + suggestions ; D4 go previews ; D5 go ordre A1→A4. Puis « cadre à fond
  pour travailler tout seul » → **GO SOLO** : pivot Arbre A1→A4 déroulé en
  autonomie (agent → contre-passe sécu + verificateur → commit), PR #24.
  Migration `0006` (secteur) déposée mais **non appliquée** (gate maintenue
  même en solo : migration de feature ≠ durcissement). Fusion PR = go Paul.
  Arbitrage esthétique laissé ouvert (arbre-registre en bandes déterministe
  vs dessin peint) — consigné, non tranché seul.
- **2026-07-12 (PIVOT PLATEFORME — Ultima devient une console à 4 quadrants)** —
  dicté par Paul, tournant majeur. Ultima cesse d'être un outil unique (carte/
  arbre du réseau) pour devenir sa **plateforme personnelle en console** (même
  structure que la console de Rennes Boost) : accueil = bandeau « Bienvenue sur
  Ultima » + « sur quoi on travaille aujourd'hui ? » + **4 quadrants** cliquables.
  Un seul pilote (Léo), un seul repo, **mémoire inter-segment**. Les 4 outils
  (noms de code **confirmés par écrit** par Paul) :
  ① **RIVEN** — le réseau (absorbe tout l'acquis : arbre, carte, contacts,
  relations, journal, relances) + un agent de liaison de contacts productif ;
  ② **BCP** — pilotage financier long terme (upload bulletins/factures, revenus
  vs charges, mois par mois, prévision impôts, échéancier avec rappels) ;
  ③ **ADRAMELECH** — bibliothèque d'idées (capture immédiate surtout vocale,
  classement par thème, rapprochements, enrichissement → concret/exécutable, tri
  pro/perso/business, cohérence avec le reste d'Ultima, dashboard hebdo/mensuel) ;
  ④ **IMLADRIK** — développement personnel (objectifs de vie, journal, valeurs/
  principes, prise de recul, rappels sans jugement, citations philo/chevaleresques,
  quart d'heure quotidien culture/religions comparées, curation culturelle web).
  Directive maîtresse rappelée par Paul = **directive EB** (boucler avant de
  passer à autre chose + capitaliser sur l'existant). **Léo est féminine** (une
  femme) — accords au féminin partout. Cadrage complet : `CADRAGE-CONSOLE.md`
  (console, 4 quadrants, sécurité relevée, carte agents/skills, roadmap C0→C5,
  risques RC1-RC5). Discipline tenue : livré en **cadrage pur** (zéro code
  produit), quadrants construits ensuite un par un, chacun cadré avant.
  **Arbitrages ouverts** : ordre des quadrants après la console (reco : le moins
  dépendant d'un service externe d'abord — ADRAMELECH/IMLADRIK — BCP ensuite) ;
  niveau de chiffrement au repos BCP/IMLADRIK ; périmètre v1 par quadrant.
- **2026-07-11 (skills, registre, gates, arbre — go solo)** — session dense :
  ① Paul : « va chercher des skills utiles… tout ce qui concerne Ultima » puis
  « récupère et installe ce qui sert à CONSTRUIRE Ultima » + « **pas de
  landing** » → 5 skills installés (frontend-design, theme-factory,
  algorithmic-art, webapp-testing, skill-creator ; anthropics/skills, Apache
  2.0), marketing/landing écarté ; charte de Léo enrichie (dispatch skills +
  recruteur de skills). ② « améliorer Léo » : agent vs skill acté (expert qui
  raisonne vs procédé réutilisable). ③ « 1 puis 2 » → boucle **antique et
  sérieux** (purge Caveat + panneaux de bois, exécution de la déc. 2026-07-08)
  puis boucle **Arbre responsive**. ④ **GO SOLO** ré-armé (« go solo »). ⑤
  « **prépare toutes les gates** » : découverte que la migration **0006 était
  DÉJÀ appliquée** (registre périmé — leçon RADAR) ; gate ④ **durcissement
  `auth.getUser()`** mergée sur go Paul avec 2 arbitrages tranchés :
  `/api/geocode` rejette un Bearer invalide (401), et **panne Auth = 401
  fail-closed** (pas 503). ⑥ « la carte grandit-elle avec les contacts ? » →
  réponse : l'Arbre grandissait déjà en hauteur ; la largeur était bloquée →
  **Arbre responsive en largeur** (paliers 3→6 col), **validé tel quel** par
  Paul (« je valide ainsi »). Reste esthétique non tranché : sous-titre du
  cartouche à 4,594:1 (AA mais marge fine) — micro-arbitrage laissé ouvert.
- **2026-07-16 (orthographe RIVEN)** — Paul : « c'est RIVEN avec un seul
  L, je te l'avais déjà dit ». Correction appliquée partout (CLAUDE.md, cadrages,
  mémoire, charte Léo, registre ADRAMELECH) ; lexique vocal mis à jour. Leçon :
  la graphie avait été figée à deux L au cadrage console (RC5) sans retrouver
  la consigne antérieure — les noms propres dictés se vérifient dans la mémoire
  avant d'être figés.
- **2026-07-16 (vision carto ADRAMELECH)** — Paul : la carto actuelle est OK
  « pour l'instant » ; à l'échelle, l'agent `agent-idees` devra faire des
  **regroupements automatiques par thème** (archipels cohérents), du **tri
  pertinent, pas de la donnée brute**, et des **ponts entre idées** — zéro
  perte. Provisionné dans le cadrage (CADRAGE-CONSOLE §3.3) et l'en-tête du
  registre ; implémentation différée à l'ouverture de la boucle ADRAMELECH.
  Le champ Thème d'IDEES.md est l'axe de regroupement de départ.
- **2026-07-16 (architecture agent — VERROUILLÉE)** — Paul : « je veux un seul
  agent qui pilote tout sur Ultima… un seul interlocuteur numérique qui a toute
  la mémoire et qui garde tout ». Confirmé : c'était déjà le modèle (Léo =
  interlocutrice unique, Paul ne lit jamais de sortie brute). Précisions
  verrouillées : ① Léo est le SEUL agent cross-plateforme ; ② les autres
  `.claude/agents/` sont ses SOUS-agents, pas des rivaux — elle peut les
  appeler (maximiser l'existant, ne pas bosser pour rien) mais garde tout ;
  ③ Léo se décline par quadrant en reprenant le sigle du projet (dragon,
  boussole…), un seul agent plusieurs blasons — mapping sigle↔quadrant à figer
  avec le graphisme. Gravé dans la charte (leo.md) et CADRAGE-CONSOLE §6/§7.
- **2026-07-16 (blasons de quadrant — FIGÉS)** — Paul « go a et b ». Sigles
  Léo↔quadrant figés (reco Léo suivie) : RIVEN = boussole · ADRAMELECH =
  dragon · BCP = balance · IMLADRIK = étoile · Console = sceau ULTIMA. Sens
  figé, exécution visuelle (emblèmes gravés) laissée au graphisme. PR #41
  fusionnée sur go Paul (« merge et push »).
- **2026-07-16 (directive EB — on boucle Adramelech)** — Paul rappelle EB
  (boucler avant d'avancer) et demande de boucler ADRAMELECH. Léo distingue :
  la boucle capture+carto+charte est close (PR #40/#41 mergées) ; « boucler le
  quadrant » est une nouvelle boucle de construction qui, par EB même, s'ouvre
  par un mini-cadrage. Livré : `adramelech/CADRAGE-ADRAMELECH.md` (cadrage pur).
  v1 recommandé sans base ni gate (AD-1 générateur de carto depuis le registre,
  AD-2 agent-idees + bilan, AD-3 sécurité du quadrant ; AD-4 base = report/gate).
  Point sécurité (idées servies sans auth) résolu au cadrage. Décisions Paul en
  attente : périmètre v1, option sécurité, ordre vs console C1.
- **2026-07-16 (AD-0 sécuriser la data — bouclé, GO)** — sur go Paul « on
  sécurise la data », diagnostic securite-auditeur : Vercel servait TOUT fichier
  commité (cleanUrls ne retire que .html) → /adramelech/*.md ET /memoire/*.md
  (PII de Paul) ET docs racine étaient PUBLICS. Correctif (fil principal, Opus) :
  garde middleware `estCheminPrive` (404 sur /adramelech, /memoire, *.md) +
  .vercelignore (défense en profondeur) + test de fermeture unit-adramelech-guard.
  Contre-passe adversariale = GO (aucun contournement servable). 3 durcissements
  (S1 octet parasite, S2 backslash, S3 fingerprint) non exploitables auj.
  (backstoppés par .vercelignore) différés à AD-4. Conséquence produit actée :
  quadrant ADRAMELECH « noir en prod » en v1 (carto = artifact privé). Leçon
  RADAR : « tout fichier commité = servi » — la doc interne et la mémoire NE
  doivent jamais être sur la surface web sans garde.
- **2026-07-16 (ADRAMELECH v1 AD-1/AD-2 — livré)** — sur « attaque AD-1 » puis
  « attaque la suite » : AD-1 carto générée depuis le registre (générateur
  déterministe, archipels par thème, ponts, zéro-perte ; PR #43 mergée sur
  « c'est good pour moi ») ; AD-2 sous-agent agent-idees recruté + bilan chiffré
  (dashboard statique) dans la carto. Chaque brique vérifiée indépendamment par
  Léo (harnais + navigateur) avant commit. Boucle ADRAMELECH v1 (AD-0→AD-2)
  complète. Reste AD-4 (base, gate). Points de goût laissés à Paul (granularité
  thème, épigraphes du registre, ancrages data-driven) : validés « c'est good ».
- **2026-07-16 (GO SOLO — AD-4 idées en base)** — Paul « go solo, boucle AD-4
  en base ». En solo : AD-4a migration 0007 (tables idees + idees_liens, RLS
  mono-owner) rédigée par data-ingenieur, contre-passe securite-auditeur GO,
  **APPLIQUÉE en base** (additif/non destructif, rls_enabled confirmé — signalé
  au registre solo). AD-4b API idees (GET/CRUD/liens, requireUser, validation
  stricte, 20 verdicts). AD-4c durcissements S1/S2/S3 du garde PII fermés.
  RESTENT GATÉS (invérifiables sans compte auth Paul + choix archi) : front
  carto client-side après auth (fin du « noir en prod »), et seed des 4 idées
  (importer-idees.mjs prêt). Durcissement FK-composite inter-owner consigné
  (migration transversale dédiée). Leçon : une couche data+API se livre et se
  vérifie sans user (advisors/RLS/unit) ; le flux authentifié de bout en bout,
  non — il attend le compte de Paul.
- **2026-07-16 (AD-5 — volet ANALYSE STRATÉGIQUE d'ADRAMELECH)** — Paul ouvre le
  2ᵉ volet d'ADRAMELECH (le visuel/carto reste intact) : décortiquer chaque idée
  jusqu'au business model, scorer /10, mettre en concurrence mécanique avec le
  socle rémunérateur, ne retenir que 3 max. **Grille en 7 blocs** (les 5 modèles
  moyen-long terme = ERRC/Océan · Porter · TOWS · Lean Canvas · Prémortem) +
  scoring /10 + benchmark obligatoire + provision agents/autos. Décisions Paul
  actées : stockage **dans IDEES.md par idée** ; benchmark = **Renoboost IA**
  (socle chantiers + installations à domicile — « Renault Boost » était la
  déformation vocale, au lexique) ; **pondération Temps ×2 + Rému ×2** (dén. 7).
  - **AD-5a** ✅ grille gravée + fiche pilote GLANEUR (dispatch agent-idees) —
    test concluant, la grille élimine (GLANEUR 5,0/10, satellite).
  - **AD-5b** ✅ généralisation aux 3 autres (3 agents parallèles) + classement.
    **Top 3 = MYCÉLIUM 8,1 · INTENDANT 7,9 · PROTÉE 6,3 ; GLANEUR 5,0 hors.**
    Insight maître : ce n'est pas 4 paris mais **un moteur** (PROTÉE industrialise
    le socle → INTENDANT fabrique les victoires → MYCÉLIUM les démultiplie →
    surplus alimentent GLANEUR). Séquence de démarrage validée : **INTENDANT →
    MYCÉLIUM → PROTÉE bridée**.
  - **AD-5c** (build du 1ᵉʳ retenu, INTENDANT v1 outil interne) : cadrage §9 (la
    check-list PAS l'ERP) ; **contrat de données** data-ingenieur (2 tables,
    état en colonne GÉNÉRÉE déterministe, accroché à la fiche chantier RIVEN,
    RLS miroir 0007, scellement croisé) ; **migration 0008 APPLIQUÉE** en base
    (gate Paul « appliquer avec le scellement » + Go ×2 ; RLS activée vérifiée
    post-apply ; prod intacte). Note d'archi : une fois construit, l'INTENDANT
    **sort de la bibliothèque** (outil du socle/RIVEN, pas une idée).
  - **⏳ RESTENT** : (a) contre-passe sécu d'isolation inter-owner + advisors sur
    0008 (agent coupé par limite de session ; validité moteur confirmée, revue
    Léo + RLS post-apply en substitut) ; (b) AD-5c-γ API requireUser + δ front ;
    (c) blocage récurrent : **flux front invérifiable sans compte auth de Paul**
    (0 user en base, identique AD-4). Tout sur PR #46 (brouillon, non mergée).
- **2026-07-17 (C1 EN LIGNE + emblème IMLADRIK re-figé)** — Paul signalait une
  prod « datée » : diagnostic = la console n'avait jamais été construite (+ cache
  PWA). Sur son go (« merge and push je veux que ce soit en ligne ») : **coque C1
  bâtie** (front-carto, index.html = accueil 4 quadrants, blasons gravés SVG,
  zéro CDN, 23 verdicts smoke, RIVEN déplacé sur traveler.html sans
  régression) et **PR #46 fusionnée dans main** → console en prod. Page accueil
  validée par Paul. Puis **emblème IMLADRIK re-figé : épée au soleil** (décision
  antérieure de Paul, trace perdue — session non poussée ; recherche exhaustive
  repo/git/Notion vaine, Paul re-confirme, on applique). Dragon ADRAMELECH
  inchangé. ⏳ : 11 smokes app à repointer vers /traveler.html ; « agent Léo en
  ligne » évoqué par Paul (zone de dialogue sur le site ?) = à clarifier, gate
  coût si service IA.
- **2026-07-18 (emblèmes clos + vision LÉO-AU-SITE cadrée)** — ① Emblème
  ADRAMELECH : Paul écarte le dragon d'après image peinte puis le dragon
  éployé ; sur planche de 3 ouroboros (design/preview-blason-ouroboros.html),
  **choix B : l'ouroboros ailé** — fusionné en ligne (PR #48). **Les 5 emblèmes
  sont définitifs** : boussole · ouroboros ailé · balance · épée au soleil ·
  sceau. ② **Léo dans le site — vision dictée et cadrée** (`CADRAGE-LEO-SITE.md`) :
  agent ACTIF à l'initiative ; rien sur l'accueil ; **pop-up d'accueil de Léo à
  l'entrée de chaque quadrant** (récap état + travaux en cours) ; opérationnel
  sur RIVEN/BCP, réflexif sur ADRAMELECH/IMLADRIK ; initiative cohérente
  avec les objectifs du quadrant ; ton **Jarvis (Iron Man)** ; s'adapte et
  apprend. Visuel + fonctionnement étendu : différés. Architecture en 4 étages
  (auth → contexte data → voix IA → mémoire apprenante), proactivité = règles
  déterministes sur données réelles + IA qui formule. Boucles L0 (compte auth
  Paul — LE bloquant) → L1 (pop-up sans IA) → L2 (IA, gate coût) → L3 (mémoire).
- **2026-07-18 (L0 CONSTATÉ FAIT + SEED APPLIQUÉ)** — sur « go » de Paul :
  cadrage Léo fusionné (PR #49), puis ouverture de L0 → découverte que le
  compte auth de Paul **existait depuis le 2026-07-09** (dernière connexion
  la veille ; le registre disait 0 user — 2ᵉ occurrence de la leçon « vérifier
  l'état RÉEL en base, pas le registre »). Gate du seed tombée de fait → SQL
  d'`importer-idees.mjs` généré avec l'owner_id réel, audité (upserts seuls),
  **appliqué et vérifié : 4 idées + 4 ponts en base**. Débloqués d'un coup :
  AD-4c front (fin du « noir en prod »), front INTENDANT (AD-5c-δ), et Léo L1
  (pop-up par quadrant). Prochaine boucle recommandée : **Léo L1 pilote
  RIVEN** ou AD-4c front — arbitrage Paul.
- **2026-07-18 (LÉO AGIT SUR DICTÉE — complément de vision)** — Paul précise :
  Léo-au-site doit aussi **faire avancer le travail sur dictée** (« ouvrir
  Ultima, parler à Léo, ça fait avancer les choses ») et **tourner sur
  Claude**. Cadré en **L2b (les mains)** : tool use de l'API Claude branché
  sur les API du site (idées, INTENDANT, journal, relances), exécution avec la
  session authentifiée de Paul uniquement (JWT → RLS, jamais de clé service),
  **reformulation + confirmation avant toute écriture** (protocole vocal),
  suppression doublement confirmée ; Léo-au-site agit sur les DONNÉES, pas sur
  le code (le dev reste à Léo-en-session).
- **2026-07-18 (DIRECTIVE JL — Ultima, unique interface de travail)** — dictée
  et nommée par Paul, directive fondatrice au-dessus de tout le backlog : à
  terme, **Ultima est son unique interface de travail** (travail au sens
  large) — dès qu'il faut bosser sur quelque chose, il ouvre Ultima et **Léo
  l'oriente sur toute sa data**. L'outil visé : **unique, sécurisé, propre**,
  qui **absorbe toute la data** (projets pro et perso, tout), la **dispatche**
  et **navigue tout**, avec **un seul interlocuteur** (Léo), **souple**,
  capable de tout faire ou d'**apprendre et s'adapter**. Corollaire explicite :
  « je ne veux rien créer d'autre » — aucun outil parallèle, tout nouveau
  besoin = extension d'Ultima. **Tous les travaux doivent y coller et y être
  conformes.** Articulation : la directive EB reste la discipline de route
  (boucler + capitaliser), la directive JL est la destination. Gravée dans
  CLAUDE.md (🎯), CADRAGE-CONSOLE §1, charte Léo, lexique. Elle ne change pas
  la boucle en cours ; elle cadre tous les choix d'architecture à venir
  (absorption de data externe = nouvelles boucles cadrées, gates inchangées).
- **2026-07-18 (LÉO L1 LIVRÉE PUIS DIFFUSÉE — 4 quadrants en ligne)** — sur
  « go léo l1 » : cartouche majordome construit sur RIVEN (front-carto,
  js/leo-accueil.js, calcul pur testable, dialog accessible, 1×/session,
  fail-closed ; 19/19 harnais ; 12 smokes historiques repointés
  /traveler.html) — **fusionné PR #52 sur go Paul**. Puis « diffuse sur tout
  Ultima, les 4 chantiers à la fois » : module généralisé par quadrant,
  **antichambre ADRAMELECH derrière auth** (registre d'idées via /api/idees,
  Léo réflexive, fail-closed), **BCP/IMLADRIK en majordome de chantier**,
  **console à 4 portes actives** ; middleware allowlist du chemin exact
  /adramelech (cleanUrls) → **contre-passe securite-auditeur GO** (29
  attaques, zéro contournement) — **fusionné PR #55 sur go Paul**. 20/20
  harnais. La frustration fondatrice (« je n'ai pas mes 4 projets ») est
  réparée : la plateforme vit, Léo accueille partout.
- **2026-07-19 (BOUCLAGE de la boucle d'hier — sur « on boucle la boucle »)** —
  queues fermées : ① **dette sécurité 0008** : contrôles advisors-équivalents
  en SQL prod (RLS 7/7, 4 policies/table, zéro search_path mutable, zéro
  security definer, scellements croisés présents) — l'outil advisors MCP
  reste bloqué en approbation (3 tentatives), contourné par le catalogue.
  ② **Réserves de la contre-passe middleware figées au harnais**
  (unit-adramelech-guard 12/12 : /adramelech.md bloqué avant allowlist ;
  trailing-collapse simple → page racine, double séparateur → fail-closed
  assumé). ③ Annotations cadrages (L1 diffusée ✅, AD-5c-β clos) + Notion.
- **2026-07-19 (« on termine AD » — AD-4c front livré, quadrant bouclé)** —
  Paul : reprendre et boucler la boucle d'hier, sans télescoper la session
  parallèle. Livré : la CARTE des idées — `idees.html` sur `/idees` (motif
  traveler, hors garde AD-0, zéro touche middleware par cette boucle) ;
  `js/idees.js` (archipels par thème principal, ponts, badges, états, zéro
  innerHTML, zéro PII en logs). Suite patrimoine verte ×2 (implémentation
  front-carto + contre-passe Léo). Incident consigné : l'agent coupé en vol
  par la limite de session, repris par SendMessage sans perte. **Réconciliation
  des deux sessions (rebase PR #54 sur main)** : les deux boucles avaient
  activé le quadrant chacune à sa façon — l'ANTICHAMBRE de la diffusion Léo
  (adramelech.html, PR #55) reste la porte du quadrant depuis la console, et
  la CARTE (idees.html) s'ouvre depuis l'antichambre (« Ouvrir la carte des
  archipels ») — rien de jeté, les deux vues servent le même registre via la
  même API. ADRAMELECH v1 est COMPLET (AD-0 garde → AD-1 carto → AD-2 agent →
  AD-4 base+API+front antichambre+carte). Restent au registre : preuve du
  flux authentifié en prod (geste Paul) ; AD-5c-δ (front INTENDANT).
- **2026-07-19 (console épurée + BALTHAZAR GELD)** — dicté par Paul sur revue
  de la console : ① les 4 cartouches de quadrant perdent leur sous-titre
  descriptif (nom seul, épure) ; ② le quadrant financier est **renommé
  BALTHAZAR GELD** (ex-BCP ; graphie « GELD » retenue telle qu'entendue, à
  reconfirmer si autre orthographe voulue). Renommage appliqué partout dans
  les documents vivants (CLAUDE.md, cadrages, chartes, profil, radar, registre
  ADRAMELECH) — leçon RIVEN appliquée d'office ; les entrées HISTORIQUES de
  ce journal gardent « BCP » (fidélité du registre). Blason balance inchangé.
  Livré sur la PR #54 (smoke-console adapté, suite verte).
- **2026-07-19 (« Focus Léo » — L2 la voix, construite)** — Paul : « les
  projets on verra plus tard, focus Léo ». MYCÉLIUM/PROTÉE reportés au
  registre ; la boucle L2 du cadrage Léo-au-site est construite : route
  `POST /api/leo` (requireUser fail-closed → API Claude, clé env Vercel
  uniquement, timeout 30 s, bornes d'historique et de réponse, prompt
  système Jarvis par quadrant sans PII) + zone « Parler à Léo » dans le
  cartouche (RIVEN + ADRAMELECH, session réelle exigée ; antichambres
  muettes tant que sans auth — fail-closed voulu). Décisions techniques :
  modèle par défaut Opus côté serveur, surclassable par l'env `LEO_MODELE`
  sans code ; l'historique du cartouche est la SEULE donnée envoyée à l'IA
  (minimisation) ; 503 sincère « voix pas encore branchée » tant que la
  gate coût n'est pas levée. La voix vit dans le pop-up d'accueil (une fois
  par session de navigation) — une présence persistante de Léo dans la page
  relève du volet « présence visuelle » différé. ⏳ Gate Paul : clé API +
  plafond de dépense + env Vercel `ANTHROPIC_API_KEY`.
- **2026-07-21 (ADR-006 HÉRAUT — veille juridique, gardée en stock)** — Paul
  dicte une idée pour ADRAMELECH : un agent « plug-and-play » branché sur les
  sources officielles à API, qui lit chaque jour les textes du Journal
  officiel/bulletins et **détecte le signal utile aux chantiers** (typiquement
  une TVA à 5,5 % pour tel projet, un dispositif qui s'ouvre/s'arrête), bruit
  filtré. Consigne explicite : **cadrer et garder en stock**, pas de build.
  Livré : fiche `ADR-006 HÉRAUT` dans `IDEES.md` (capture + enrichissement —
  sources réelles Légifrance/PISTE·JORF, BOFiP pour la TVA, BO ministériels,
  EUR-Lex ; cœur de valeur = filtre de pertinence métier, brique Claude ;
  séquencement v1 digest→v3 Léo proactive ; liens BALTHAZAR GELD/RIVEN).
  Statut **à raffiner**, **analyse stratégique différée** sur demande de Paul.
  Sur « renseigne bien dans l'archipel » : carto régénérée → nouvel archipel
  « Veille juridique » (HÉRAUT seul), 3 ponts vers GLANEUR/INTENDANT/CHAMBRE
  CLAIRE ; test `unit-carto-generee` mis à jour (ponts 6→9). PR draft #68.
- **2026-07-22 (ADR-007 VERTUMNE + ADR-008 JANUS — deux projets « stars »)** —
  Paul dicte deux projets à consigner dans ADRAMELECH, montés de zéro.
  (1) **VERTUMNE — l'entreprise souple** : ni mono-produit ni mono-service,
  capte tous les besoins d'un même client par 3 voies (compétences propres /
  sous-traitance à partenaires validés / apport d'affaires) ; joue le saisonnier
  météo (clim l'été, en vente **ou location**) ET le patrimonial long terme
  (cuisine, salle de bain, valorisation de bien) ; moteur « chaque client/projet
  en amène 1-2 autres » **explicitement relié par Paul à MYCÉLIUM** (« Muselium »
  = MYCÉLIUM, décodage vocal confirmé par le sens). Accompagnement outil demandé :
  un **simulateur de lancement d'entreprise sur NICOL BOLAS** (audit complet à la
  façon d'un expert-comptable : main d'œuvre, masse salariale, URSSAF, matériel,
  cash, seuil de rentabilité) → besoin consigné, à cadrer en boucle propre du
  quadrant financier. (2) **JANUS — le pont générationnel** : mettre en réseau les
  45-50 ans qui ont le réseau/les connexions (mais plus tout à fait « in ») et les
  jeunes qui ont la faim/l'énergie/les idées (mais pas le réseau) ; échange à
  double sens (deux visages de Janus) ; à travailler avec **Anselme** (partenaire
  à confirmer, mot dicté). Noms attribués dans le registre antique et sérieux
  (Vertumne = dieu des saisons + métamorphose ; Janus = dieu des seuils, deux
  visages). Statut des deux : **à raffiner, analyse stratégique différée** (modèle
  HÉRAUT), donc **hors classement AD-5b** tant que la grille n'est pas passée.
  Livré : fiches `ADR-007`/`ADR-008` dans `IDEES.md` ; carto régénérée → 8 idées,
  5 archipels (+ « Stratégie d'entreprise » et « Réseau »), **ponts 9→14** (liens
  VERTUMNE↔MYCÉLIUM/PROTÉE/INTENDANT/JANUS, JANUS↔MYCÉLIUM) ; test
  `unit-carto-generee` mis à jour ; suite ADRAMELECH verte (unit-carto-generee
  16/16, unit-idees-carto, unit-idees-validate, unit-adramelech-guard).
  ⏳ Ambiguïtés vocales consignées : nom de marque « Souqt » ? et partenaire
  « Anselme » — à confirmer par Paul.
- **2026-07-22 (confirmations + analyse VERTUMNE)** — Paul tranche : nom
  **VERTUMNE** retenu (« Souqt » abandonné), **Anselme confirmé** comme partenaire
  de JANUS, et « ensuite je suis tes reco » → j'instruis VERTUMNE en premier.
  Fiches mises à jour (confirmations) puis **analyse stratégique complète de
  VERTUMNE (ADR-007)** dispatchée à `agent-idees`, contre-passe Léo (calcul de
  score revérifié 34/7=4,9 ; cohérence charte). **Verdict clé (bloc F)** :
  VERTUMNE n'est **ni concurrent ni satellite** du socle Renoboost IA — elle en
  est l'**enveloppe souple qui le contient** (Renoboost IA = son 1er métier en
  propre ; INTENDANT/MYCÉLIUM/PROTÉE/JANUS tiennent dedans). **Score pondéré
  4,9/10** (rang 6) = non pas « faible valeur » mais « **prématuré comme
  chantier** » (Temps 2/10, capex + masse salariale + BFR lourds). **Discipline
  EB actée : build différé** derrière le socle ; VERTUMNE reste hors séquence de
  build active (comme CHAMBRE CLAIRE). Enjeu chiffré n°1 [hyp.] : le **BFR ≈
  50-90 k€** (4-6 mois de charges, décalage paie/URSSAF vs encaissement 30-60 j).
  Seul chantier court terme ouvert : le **simulateur de lancement NICOL BOLAS**
  (bloc G), dont VERTUMNE est le cas d'usage fondateur — à cadrer en boucle propre
  du quadrant financier. Livré : `IDEES.md` (analyse 7 blocs sous ADR-007 +
  VERTUMNE au classement AD-5b rang 6 + note d'actualisation) ; carto régénérée
  (**ponts 14→16** : +ADR-001|ADR-007, +ADR-005|ADR-007) ; test `unit-carto-generee`
  MAJ (16) ; suite ADRAMELECH verte (4/4). PR #75.
- **2026-07-22 (go Paul « ok pour les 2 » → cadrage simulateur NICOL BOLAS =
  ABAQUE)** — Paul acte : VERTUMNE = enveloppe-cadre / build différé, ET on
  ouvre la boucle cadrage du simulateur. Modèle de calcul déterministe dispatché
  à `data-ingenieur` (entrées paramétrables, formules MS chargée/URSSAF/BFR/seuil/
  échéancier de trésorerie, arbitrage achat-vs-location avec contrainte de cash,
  recommandation persistance), contre-passe Léo (déterminisme OK ; réserve
  relevée : part salariale non décaissée en v1 = léger optimisme tréso, à raffiner
  NB-2). Livré : `CADRAGE-NICOL-BOLAS.md` (nom de code proposé **ABAQUE**,
  l'instrument de calcul antique). **Décisions actées dans le cadrage** : v1
  **SANS base** (finance ultra-sensible §5 → surface minimale ; draft `0009`
  décrit mais NON écrit sur disque tant que NB-3 non ouverte) ; découpage
  NB-1 (moteur pur, non gaté) → NB-2 (front) → NB-3 (persistance, GATE). ⏳
  Décisions Paul : nom ABAQUE ? statut juridique défaut (SASU proposé) ? go NB-1 ?
  persistance ou non. Cadrage pur, rien codé, rien gaté ouvert. PR #75.
- **2026-07-22 (ABAQUE NB-1 livré — moteur de calcul)** — Paul : « ok pour abaque ;
  ok pour le statut par défaut mais je dois pouvoir changer de statut pour voir,
  les données doivent s'adapter ; ok pour la prochaine boucle ». Décisions actées
  (ABAQUE, SASU par défaut + switch, go NB-1) et **NB-1 construit** : `js/abaque.mjs`
  (module ES pur, déterministe, zéro I/O/DOM/horloge/aléa) — `simuler(entrées)` +
  `arbitrageAchatLocation`. Le **statut juridique est une entrée vivante** (SASU/SAS
  assimilé ↔ EURL/EI TNS → charges dirigeant recalculées, exigence Paul). Contre-passe
  Léo : **réserve URSSAF corrigée dès NB-1** (part salariale intégrée au décaissement
  → optimisme tréso levé). Harnais `tests/unit-abaque.mjs` (9 verdicts chiffrés
  vérifiés main : masse salariale, statut adaptatif, BFR, point mort durable,
  trésorerie plancher/besoin de financement, déterminisme, garde-fou marge ≤ 0,
  arbitrage cash + coût actualisé), ajouté à `lancer.sh`. Non gaté. Cadrage MAJ
  (NB-1 ✅, décisions ✅). Prochaine boucle proposée : NB-2 (front). PR #75.
- **2026-07-22 (ABAQUE NB-2 livré — le front, « go suite logique »)** — Paul :
  « oui go suite logique » → front du simulateur. Dispatch `front-carto` (spec Léo,
  moteur `abaque.mjs` = seule source de calcul), contre-passe Léo (smoke rejoué au
  navigateur = vert). Livré : `abaque.html` + `js/abaque-ui.js` + `css/abaque.css`
  (registre antique, CSP stricte, zéro inline/CDN/réseau, DOM createElement/
  textContent, finance jamais en logs) ; **statut juridique vivant** (SASU↔EI
  recalcule les charges à l'écran — exigence Paul prouvée au smoke) ; **courbe de
  trésorerie SVG déterministe** (point bas + besoin de financement + coussin en
  évidence) ; presets prudent/médian/volontariste ; garde-fou marge ≤ 0.
  Accès depuis `bcp.html` (antichambre → « premier outil : ABAQUE »). Harnais
  `tests/smoke-abaque.mjs` (~40 verdicts, contrastes AA clair+sombre) ajouté à
  `lancer.sh`. Non gaté. Reports non bloquants consignés (NB-2b) : export JSON,
  UI arbitrage achat/location, saisonnalité/TVA. Le simulateur MARCHE à l'écran.
  PR #75.
- **2026-07-22 (premier chiffrage VERTUMNE par ABAQUE — gardé pour le lancement)** —
  Ma reco (option 1 : chiffrer VERTUMNE) lancée. Les hypothèses d'ADR-007 bloc C
  passées dans `abaque.mjs` → masse chargée ≈ 9 800 €/mois (~120 k€/an), seuil
  ≈ 42 k€ CA/mois, point mort mois 9, **besoin de financement ≈ 100 600 €**
  (tréso encore −85 k€ à 18 mois) : **plus lourd que l'estimation « 50-90 k€ »**,
  cohérent avec « capex lourd, build différé ». Paul : « je n'ai pas ces éléments
  pour le moment, garde-les pour le lancement, pour l'instant on cadre tout ».
  **Décision : chiffres parkés**, consignés dans ADR-007 bloc C comme premier
  passage [hyp.] à instruire au lancement (rejouable dans `abaque.html`). Aucun
  build supplémentaire ouvert ; on reste en cadrage. PR #75.
- **2026-07-23 (IMLADRIK ouvert — « pouvoir écrire »)** — Paul : « rendons
  IMLADRIK opérationnel, je veux pouvoir écrire et le connecter à mon Google
  Drive perso ». Deux questions Léo (fondation + accès Drive) → **décisions Paul :
  (1) synchro DEUX SENS entre Ultima et Drive ; (2) c'est l'APP Ultima elle-même
  qui se connecte au Drive** (pas Léo-en-session). Découpé par Léo en boucles
  (une à la fois) : **Boucle 1 LIVRÉE = « pouvoir écrire »** — le journal intime
  en base, calqué sur ADRAMELECH/RESHIRAM, **fail-closed** (aucune donnée simulée,
  pas de mode démo — §5 intime). Livré : migration `0012_imladrik_journal.sql`
  (renumérotée 0010→0012 après merge ZEKROM ; table `imladrik_entrees`, RLS par
  owner, **APPLIQUÉE en prod le 2026-07-23 sur go Paul**), API
  `/api/imladrik` (GET) + `/api/imladrik/entrees` (POST/PATCH/DELETE),
  `validateEntreeImladrik` (miroir CHECK), `imladrik.html` refondu (atelier
  d'écriture + journal, chrome quadrant) + `js/imladrik.js` + styles quadrant.
  Harnais `tests/unit-imladrik-validate.mjs` + `tests/smoke-imladrik.mjs`
  (fail-closed / écriture POST+refresh / effacement DELETE / 401), ajoutés à
  `lancer.sh`. IMLADRIK retiré des antichambres (`js/antichambre.js`).
  **Boucle Drive = SUIVANTE, gatée** : synchro deux sens + app connectée exige
  un projet Google Cloud + secret client en env Vercel (**actions Paul**) et une
  contre-passe `securite-auditeur` AVANT tout code (§5 : jetons Google = surface
  intime nouvelle). Correctif adjacent : `smoke-quadrants.mjs` §E réaligné sur
  `bcp.html` réel (badge « premier outil ouvert » + lien ABAQUE) — échec
  **pré-existant** du #75 (le simulateur avait fait évoluer bcp sans MAJ du test).
- **2026-07-24 (reprise Zekrom — housekeeping + boucle ④ RESHIRAM→RIVEN)** — Paul :
  « Reprise sur Zekrom. Plus de boucle à boucler ? » → constat : branche propre sur
  main, aucune boucle en cours, mais 3 PR draft périmées traînaient. Paul : « on fait
  les reliquats et on lance ④ ». **Housekeeping** : PR #62 (docs clôture 20/07,
  superseded), #67 (L2b les mains, déjà en prod sous api/leo.js + unit-leo-mains),
  #88 (cadrage Drive, absorbé dans CADRAGE-CONSOLE §3.4) **fermées**. Branche repartie
  propre de origin/main. **Boucle ④ CONSTRUITE (PR #93 draft)** : connexion RESHIRAM
  → RIVEN, le « capital réseau ». Cœur données/API gardé au fil principal (escalade
  Opus signalée, RLS/auth) : migration `0013_talent_refs_reseau.sql` (référence
  lecture seule talent↔fiche RIVEN, double scellement AD-4, RLS ; vue
  `talents_capital_reseau` par talent : nb contacts + secteurs ; + contrainte
  d'unicité (owner_id,id) sur network_nodes), `api/talent-refs.js` (owner_id
  serveur-only, projection RIVEN minimale ZÉRO PII de contact), `validateTalentRef`,
  `unit-reshiram-reseau` (12 verts). Front dispatché à **front-carto** (spec déposée
  en fichier) : panneau « capital réseau » par talent (relier/détacher, compteur
  chiffré par secteur, fail-closed), enrichissement `smoke-reshiram`. Contre-passe
  Léo INDÉPENDANTE : `bash tests/lancer.sh` COMPLET, exit 0, tous harnais verts ;
  contrôle CSP/PII manuel (0 innerHTML, 0 log). Deux commits atomiques (données puis
  front). **Règle cardinale tenue** : RESHIRAM lit RIVEN, ne copie jamais, sens
  unique. **Gates non franchies (hors solo)** : application `0013` = Paul ; fusion
  PR #93 = Paul ; contre-passe advisors securite-auditeur recommandée après appli.
- **2026-07-24 (solo — fermeture ④ : fusion + application 0013, correctif §0)** —
  Paul : « go solo pour la suite ». Fermeture end-to-end de la boucle ④ : **PR #93
  fusionnée** (squash) dans main ; branche repartie de origin/main. **Migration
  `0013` APPLIQUÉE en prod (solo)** — précédent 0010/0011. **Constat à
  l'application** : le §0 de 0013 (create `network_nodes_owner_id_uniq`) échoue en
  42P07 « already exists » — l'index unique existe DÉJÀ depuis **0008** (intendant),
  qui s'en sert comme cible de sa FK composite `intendant_chantiers_node_scelle`.
  Leçon : Postgres accepte un **index unique** comme cible de FK (pas besoin d'une
  contrainte de table) — prouvé en prod par 0008 ; donc 0013 n'avait rien à créer
  sur network_nodes. 0013 réappliquée SANS le §0 (success), et le fichier de
  migration corrigé (renvois + rollback) pour rester rejouable à neuf. **Advisors
  non repassés** : Paul a décliné le run get_advisors cette session → consigné au
  registre (à repasser). RADAR : ajouter « vérifier l'existant AD-4 sur une table
  déjà ciblée avant de recréer la clé unique » aux réflexes migration.
- **2026-07-24 (boucle Drive ①a+①b LIVRÉES + EN PROD)** — « on reprend pour
  boucler la boucle » puis config Google Cloud + 4 env Vercel posées par Paul.
  Livré : cœur sécurité `api/_lib/drive.js` (AES-256-GCM des jetons hors base,
  PKCE, cookie d'état signé anti-CSRF, scope `drive.file`) + endpoints OAuth
  `api/imladrik/drive/*` (authorize/callback/finalize/status/disconnect, flux
  séparé server-side, refresh_token chiffré sous RLS jamais au navigateur,
  dossier Drive dédié) + section front « Sauvegarde Google Drive » (bouton
  Connecter/Déconnecter). Migration `0014_imladrik_drive_tokens` (renumérotée
  0013→0014) **APPLIQUÉE en prod**. 30 unitaires + smoke Drive verts. PR #94 (①a)
  + #96 (①b) mergées. **v1 = un seul sens** (sauvegarde) ; sous-boucle ② = push à
  la demande (prochaine) ; deux-sens/retour = plus tard. Vérif LIVE (clic
  « Connecter » → Google → dossier) = à faire par Paul sur la prod. Rappels :
  re-consent Google ~7 j (mode Test) ; le contenu poussé quittera la RLS (acté).
- **2026-07-24 (IMLADRIK — la cartographie boussole, dictée + GO SOLO)** —
  Paul dicte la nouvelle carto du quadrant : IMLADRIK devient une **boussole
  interne** (modèle LV2, registre dév. perso). Noms dictés : **MINETHNIR** =
  le journal intime (renommage de l'acquis boucle 1, rien n'est reconstruit) ;
  **VRANESH** = les différents futurs potentiels (anticiper « dans un cas
  donné » : scénarios, signaux, parades) ; **DRAUKHAIN** = la volonté au-delà
  du possible (objectifs, volonté inébranlable, foi — absorbe « objectifs de
  vie ») ; au centre, **KALAMN-TALAEN**, boussole au symbole épée + dragon =
  **le guide, l'agent d'IMLADRIK** (successeur nommé d'« agent-devperso »,
  sous-agent de Léo — principe verrouillé 2026-07-16 respecté). **B0 livré en
  solo** : `CADRAGE-IMLADRIK.md` + prototype statique
  `design/preview-imladrik-boussole.html` (« montre-moi un prototype sans
  coder » → zéro code produit). Restent à Paul (registre) : valider les
  4 noms/orthographes, le maintien du sigle « épée au soleil » sur la console,
  l'ordre DRAUKHAIN→VRANESH, le go B1.
- **2026-07-24 (IMLADRIK B1 — la cartographie en prod, « ok pour tes recos, go
  b1 », GO SOLO)** — Paul valide les recos (sigle console « épée au soleil »
  conservé, la boussole épée+dragon reste interne au quadrant ; ordre
  **DRAUKHAIN (B2) avant VRANESH (B3)**) et donne le go B1. Livré : `imladrik.html`
  devient la **boussole Kalamn-talaen** (3 caps autour du médaillon épée+dragon,
  légende gravée) ; le journal migre vers **`minethnir.html`**. **Renommage front
  seul** — `js/imladrik.js`, API `/api/imladrik*`, migrations `0012`/`0014`, RLS
  **intacts** (zéro migration, zéro touche auth/données). Capitalisation :
  réutilise `css/boussole.css` ; `js/imladrik-carto.js` = clone du cœur de
  `boussole.js` **sans le cockpit** (carto muette, aucune donnée intime dans le
  HTML §5). Console : IMLADRIK « Accéder ». Harnais : `smoke-imladrik` reciblé sur
  MINETHNIR + **`smoke-imladrik-carto`** créé + `smoke-console` MàJ ; **patrimoine
  COMPLET (21 harnais) vert**. Décision d'archi (Léo, solo) : la carto est muette
  et publique (comme la console `ultima.html`) ; le fail-closed reste porté par
  `minethnir.html` (client) + l'API `requireUser` (serveur) — inchangés. Prochaine
  boucle : **B2 — DRAUKHAIN v1** (migration + API + front, gate intime).
- **2026-07-25 (IMLADRIK B2 — DRAUKHAIN v1, « ok go », GO SOLO)** — Paul valide
  les recos et lance B2. Construit **DRAUKHAIN** (la volonté au-delà du possible)
  en **miroir strict de ZEKROM** : **serments** (le quoi + le pourquoi profond +
  l'horizon) → **flammes** (rappels de foi : nature citation/victoire/rappel +
  texte). **Règle cardinale POSITIVE** (miroir du « à orienter » ZEKROM) : un
  serment sans flamme = **« à raviver »** = INVITATION à nourrir la foi, jamais un
  reproche — DRAUKHAIN « rappelle, ne juge pas » (CADRAGE-CONSOLE §3.4). Livré :
  migration `0016_draukhain_serments.sql` (2 tables + vues `serments_etat`/
  `serments_vivants`, RLS + scellement AD-4 miroir 0010), API `api/serments.js` +
  `api/flammes.js`, validation `validateSerment`/`validateFlamme` (miroir CHECK),
  front `draukhain.html` + `js/draukhain.js`, cap DRAUKHAIN ouvert dans la carto.
  **Décision d'archi / méthode (Léo, solo)** : couche à risque (migration +
  validation + API) construite au fil principal (§5 intime + escalade Opus) ;
  **front délégué à l'agent `front-carto`** (miroir ZEKROM), puis **contre-passe
  sécu Léo** (zéro innerHTML de données, Bearer, fail-closed) — pattern optim
  CLAUDE.md (contexte de Léo préservé). Harnais `unit-draukhain-validate` +
  `smoke-draukhain` ; **patrimoine COMPLET (22 harnais) vert**. **GATE §5 tenue :
  migration `0016` ÉCRITE mais NON APPLIQUÉE** — l'application en prod des données
  intimes reste un go explicite de Paul (comme le journal `0012`), consignée au
  registre ⏳. Prochaine boucle : **B3 — VRANESH v1**.
- **2026-07-25 (IMLADRIK — Kalamn-talaen = boussole, pas agent ; Léo guide)** —
  Paul : « remplace l'agent Kalamn-talaen par Léo, l'agent unique sur Ultima ;
  garde cependant les mots sur la boussole centrale ». Correction du cadre B0 :
  **KALAMN-TALAEN n'est PAS un agent** — c'est le **nom gravé de la boussole
  centrale** d'IMLADRIK (emblème épée+dragon). L'**agent unique reste Léo**
  (renfort du principe verrouillé 2026-07-16 ; l'« agent-devperso » §7 console
  est abandonné, Léo couvre le quadrant). **Les mots « Kalamn-talaen » restent
  gravés** sous le médaillon (demande explicite de Paul). Front : la parole et
  l'invite de la carto sont désormais attribuées à **Léo** (« Léo te guide »,
  « Léo t'en dit l'essentiel ») ; la légende centrale inchangée. Patch front +
  docs + harnais (parole par défaut = Léo, légende toujours vérifiée), zéro
  surface à risque. Puis « ensuite on avance » → enchaîner B3.
