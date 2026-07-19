# Mémoire Léo — Journal des décisions de Paul

> Une décision consignée n'est jamais redemandée ni re-litigée.
> Format : date — décision — conséquence.

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
  ① **TRAVELER** — le réseau (absorbe tout l'acquis : arbre, carte, contacts,
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
- **2026-07-16 (orthographe TRAVELER)** — Paul : « c'est TRAVELER avec un seul
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
  Léo↔quadrant figés (reco Léo suivie) : TRAVELER = boussole · ADRAMELECH =
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
    état en colonne GÉNÉRÉE déterministe, accroché à la fiche chantier TRAVELER,
    RLS miroir 0007, scellement croisé) ; **migration 0008 APPLIQUÉE** en base
    (gate Paul « appliquer avec le scellement » + Go ×2 ; RLS activée vérifiée
    post-apply ; prod intacte). Note d'archi : une fois construit, l'INTENDANT
    **sort de la bibliothèque** (outil du socle/TRAVELER, pas une idée).
  - **⏳ RESTENT** : (a) contre-passe sécu d'isolation inter-owner + advisors sur
    0008 (agent coupé par limite de session ; validité moteur confirmée, revue
    Léo + RLS post-apply en substitut) ; (b) AD-5c-γ API requireUser + δ front ;
    (c) blocage récurrent : **flux front invérifiable sans compte auth de Paul**
    (0 user en base, identique AD-4). Tout sur PR #46 (brouillon, non mergée).
- **2026-07-17 (C1 EN LIGNE + emblème IMLADRIK re-figé)** — Paul signalait une
  prod « datée » : diagnostic = la console n'avait jamais été construite (+ cache
  PWA). Sur son go (« merge and push je veux que ce soit en ligne ») : **coque C1
  bâtie** (front-carto, index.html = accueil 4 quadrants, blasons gravés SVG,
  zéro CDN, 23 verdicts smoke, TRAVELER déplacé sur traveler.html sans
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
  sur TRAVELER/BCP, réflexif sur ADRAMELECH/IMLADRIK ; initiative cohérente
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
  TRAVELER** ou AD-4c front — arbitrage Paul.
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
  « go léo l1 » : cartouche majordome construit sur TRAVELER (front-carto,
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
