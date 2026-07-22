# Mémoire Léo — Radar (anticipation + amélioration continue)

> Ce que Paul va probablement avoir besoin, avant qu'il le demande ; et les
> pistes d'amélioration que Léo doit lui proposer. Revu à chaque session :
> ce qui se confirme monte, ce qui est démenti sort (avec note).

## Besoins anticipés (à confirmer par l'usage)

1. ✅ CONFIRMÉ (go Paul 2026-07-03) — **le rapprochement objet pilotable** :
   modèle conçu et déposé en migration `0003` (statuts, intérêt qualitatif,
   efforts chiffrés, raison d'arrêt obligatoire, journal + relances).
2. **Saisie au pouce en situation** — il ajoutera des contacts après un RDV,
   depuis le téléphone : formulaire ultra-court, le reste plus tard.
3. **Relances** — « où j'en suis » implique des rappels (rapprochements sans
   nouvelle depuis X jours) dans le rapport d'arrière-plan.
4. **Champs d'affinité** — valeurs / état d'esprit devront être des données
   structurées (tags) pour que la carte suggère des passerelles.

## Pistes d'amélioration à proposer (fil continu)

- Routine d'arrière-plan (sécurité + données) : à cadrer puis activer (gate
  coût/fréquence).
- PWA installable (icône téléphone, hors-ligne minimal) plutôt qu'app native.
- Rapport de Léo consultable DANS l'interface (section dédiée) plutôt que
  par un canal externe — cohérent avec « autarcie ».

## Besoins anticipés — plateforme 4 quadrants (2026-07-12)

- **Brique « rappels/échéanciers » transverse** : NICOL BOLAS (fiscal), ADRAMELECH
  (bilan mensuel), IMLADRIK (quart d'heure quotidien) en ont tous besoin →
  concevoir une seule fois, réutiliser (capitaliser).
- **Capture vocale rapide** dans ADRAMELECH et IMLADRIK : Paul dictera « au fur
  et à mesure » → réutiliser la dictée navigateur v3-④ déjà en place.
- **Stockage de fichiers** (NICOL BOLAS : bulletins, factures) : nouvelle brique
  Supabase Storage → cadrer la sécurité AVANT (uploads = surface d'attaque).
- **Mémoire inter-segment** : prévoir dès la console comment Léo relie une idée
  (ADRAMELECH) à un contact (RIVEN) ou un objectif (IMLADRIK) à une dépense
  (NICOL BOLAS) — modèle de données transverse à penser tôt, sans sur-concevoir.
- **Dashboards** : chaque quadrant en a un (exigence explicite de Paul, besoin
  de cadre) → motif de composant à mutualiser.
- **Simulateur de lancement d'entreprise sur NICOL BOLAS** (consigné 2026-07-22,
  dépendance de VERTUMNE / ADR-007) : outil « expert-comptable » qui chiffre un
  audit de lancement complet — main d'œuvre, masse salariale, URSSAF/charges,
  matériel, trésorerie de démarrage, seuil de rentabilité — pour un projet donné.
  ✅ **Cadré (2026-07-22)** dans `CADRAGE-NICOL-BOLAS.md` sous le nom **ABAQUE** :
  moteur de calcul déterministe (masse salariale chargée, URSSAF, BFR, seuil,
  échéancier de trésorerie, arbitrage achat/location), v1 sans base. Reste à
  builder : NB-1 (moteur pur, non gaté) → NB-2 (front) → NB-3 (persistance, gate).
  Premier vrai pont ADRAMELECH→NICOL BOLAS. ⏳ Go NB-1 = décision Paul.

## Rétrospective (erreurs → corrections)

- 2026-07-03 — Léo a inventé des « passerelles inter-projets » non demandées
  → correction : autarcie consignée partout ; leçon : ne jamais extrapoler
  la vision produit sans la faire valider.
- 2026-07-03 — Léo a annoté l'audit « corrigé+commit » avant d'avoir corrigé
  → repris avant commit ; leçon : un statut ✅ n'existe qu'avec commit + preuve.
- 2026-07-03 (clôture) — Approbations MCP en panne toute la session pour
  certaines écritures (Notion, création de routine) alors que Supabase a fini
  par passer → leçon : toujours re-tenter en fin de session, et consigner
  dans le repo AVANT de dépendre d'un outil externe. Synchro Notion à
  rattraper à la prochaine session (rien de perdu : le repo fait foi).

## Rétrospective 2026-07-08 (session « pivot arbre » — cadrage fusionné)

- **« Cadre bien avant tout » respecté à la lettre** : pivot produit majeur
  (connexion habillée + arbre à la place de la carte) livré en cadrage pur
  (REFONTE-ARBRE.md, D1-D5) + previews, ZÉRO code produit — les tensions
  avec les décisions actées (auth invisible, carte-hub, droit d'auteur
  Ulthuan) ont été mises en arbitrage au lieu d'être écrasées. À reproduire
  pour tout pivot dicté.
- **Le style est une décision de premier ordre** : la revue des previews a
  fait tomber le principe « comme à un enfant » (2026-07-06) → « antique et
  sérieux » (2026-07-08). Leçon : re-présenter le REGISTRE visuel à chaque
  grande vue nouvelle, une préférence de style n'est pas éternelle ;
  consigner le remplacement dans CLAUDE.md + journal le jour même (fait).
- **Boucle interrompue par un go de fusion** : Paul a demandé merge + fin
  de session pendant le retravail graphisme → ordre tenu : attendre le
  livrable, contre-passe, commit, PUIS merge — jamais fusionner un état
  que Paul a refusé (les previews enfantines) sous prétexte d'aller vite.
- **D1-D5 restent OUVERTES à la clôture** : la reprise doit commencer par
  les recueillir (pas de boucle A1 sans D4 confirmée sur les previews
  retravaillées).

## Rétrospective 2026-07-07 (session « reprise » — boucle R1 fermée)

- **La consignation de reprise a fonctionné à 100 %** : PR de clôture #19
  fusionnée à froid, spec R1 relue depuis le repo, boucle déroulée sans
  re-décision (implé → contre-passe GO → fusion #20 sur le go anticipé
  consigné). Le protocole « committer ce qui conditionne la reprise » est
  validé par l'épreuve — à maintenir tel quel.
- **Contre-passe > harnais** : le vérificateur a corrigé une erreur de la
  SPEC (table z-index invalidée par le transform du map-pane) que
  l'implémenteur avait détectée et divulguée honnêtement — la chaîne à
  double regard attrape aussi les erreurs de conception, pas seulement de
  code. Constat consigné au vivier R4 dans CADRAGE.
- **Limite d'environnement confirmée** : proxy sortant bloque
  tile.openstreetmap.org ET vercel.app → la preuve pixel sur vraies tuiles
  (RA1/RA2) et la vérification de la prod restent des actions à faire
  depuis un navigateur de Paul ou après ouverture réseau ; contournement
  éprouvé : tuile factice aux couleurs OSM de référence (écart ≤ 1 niveau
  RGB vs simulation).

## Rétrospective 2026-07-07 (session « go reprise » — v3-④⑤⑥ + refonte cadrée)

- **Confirmé ×3** : la chaîne specs parallèles → arbitrage Léo → implé →
  contre-passe a livré 3 boucles fusionnées en une session (dictée,
  géocodage, recherche) sans un seul NO-GO ; les previews AVANT code
  (refonte accueil) ont permis à Paul de trancher en une question.
- **Événement majeur** : Ultima est EN LIGNE (import Vercel fait par Paul,
  bot actif sur les PR, previews protégées). Limites consignées : réseau de
  l'environnement bloque vercel.app, connecteur Vercel sans accès au projet.
- **Friction → leçon** : une session peut fermer pendant qu'une spec est en
  vol → tout livrable d'agent qui conditionne la reprise doit être committé
  dès réception ; à la clôture, consigner précisément quoi relancer (fait
  pour R1). Les cadrages multi-sessions vont dans le repo (REFONTE-ACCUEIL.md),
  jamais seulement en scratchpad.
- **Sécurité tenue face à une demande orale** : « pas besoin de connexion »
  → alternative « auth invisible » proposée et validée — refuser en
  expliquant + offrir mieux fonctionne.

## Rétrospective 2026-07-06 (session solo)

- **Confirmé** : la chaîne agents (spec → implé → contre-passe) tient la
  qualité ET préserve le contexte de Léo ; les harnais patrimoine rendent la
  contre-passe quasi gratuite.
- 2026-07-07 (v3-④) : la chaîne spec (ux ∥ graphisme) → implé → contre-passe
  reconfirmée ; la spec UX a découvert un bloquant hors périmètre (U6
  Permissions-Policy) AVANT le code — valeur des specs par agents. Ordre
  commit-puis-contre-passe imposé par le stop-hook (environnement éphémère) :
  acceptable si le vérificateur confirme que le contenu committé est
  byte-identique à ce qu'il a testé (fait ici) ; la fusion reste le vrai gate.
- 2026-07-07 (v3-⑤) : conflit de specs (déclencheur géocodage : bouton
  libellé UX vs épingle in-field graphisme) arbitré par Léo AVANT dispatch
  d'implémentation — plus propre que « l'implémenteur choisit » ; à
  reproduire : toute contradiction inter-specs remonte à Léo, pas au codeur.
- **Friction corrigée → règle** : commit parti sur le main local (branche non
  recréée en début de boucle) → PR fusionnée VIDE, travail récupéré au
  reflog. Règles : ① toujours `git checkout -B <branche> origin/main` AVANT
  toute boucle ; ② après chaque merge, vérifier les stats (un merge à
  0 fichier = alerte rouge) ; ③ le stop-hook « unverified committer » est un
  symptôme de branche/config — le traiter, pas l'ignorer.
- 2026-07-09 (pivot A1→A4, solo) — ① Un agent front a committé un **octet NUL**
  dans une chaîne source (sentinelle `' a-classer'`) → git a classé le
  module comme BINAIRE, diffs invisibles en revue. Attrapé par la contre-passe
  sécu (constat S1), pas par les harnais (qui restaient verts). Règle : se
  méfier des ` `/caractères invisibles dans les littéraux d'agents ; un
  `Bin x -> y bytes` sur un fichier source = alerte. ② Le stop-hook exige un
  commit à chaque fin de tour : en solo j'ai committé PENDANT que les
  contre-passes tournaient (elles lisent, ne modifient pas → pas de course),
  et corrigé en commit suivant si NO-GO. Confirmé viable, la fusion reste le
  vrai gate. ③ Confirmé (besoin anticipé n°2 « saisie au pouce ») : le champ
  secteur en texte libre + suggestions colle à l'usage — pas de liste fermée
  à re-migrer. ④ Bruit : le bot Vercel poste ~2 events (Building/Ready) par
  push — purement informatif, à ignorer en boucle.
- 2026-07-11 (session skills/gates/arbre, solo) — ① **Friction → règle** : le
  registre « Actions humaines » disait la migration 0006 « à appliquer »
  alors qu'elle était **déjà en base** (appliquée le 2026-07-09). Leçon :
  avant de « préparer/dérouler » une gate d'état base, **vérifier l'état RÉEL
  via Supabase MCP** (`list_migrations`, `list_tables`), ne jamais se fier au
  seul registre — et corriger le registre au passage. ② Le connecteur Vercel
  de Léo ne voit toujours QUE renoboost-ia/reno-agenda/artisan-builder — **pas
  `ultima`** : périmètre d'autorisation à rafraîchir si on veut que Léo lise
  logs/URL prod (bloque la lecture auto de l'URL de prod). ③ Anticipé : Paul a
  demandé si l'arbre « grandit avec les contacts » → il pense au dimensionnement
  à l'usage ; une fois qu'il aura plusieurs contacts par secteur, prévoir un
  **ajustement des paliers de colonnes** (plus/moins) et surveiller RB1
  (broussaille) — proposer proactivement. ④ Confirmé : Paul délègue largement
  en go solo et valide en bloc (« je suis toutes tes recos », « je valide
  ainsi ») → la valeur de Léo = recommander une option nette + prouver, pas
  étaler des choix. ⑤ Les 2 réserves cosmétiques de l'arbre responsive
  (re-render idempotent au 1ᵉʳ resize ; `data-palier` non nettoyé en état
  vide) sont un **vivier de polissage zéro-défaut** si une passe UX repasse.
- 2026-07-16 (session AD-5 volet analyse stratégique) — ① **Confirmé** :
  « Renault Boost » = **Renoboost IA**, le socle rémunérateur (chantiers +
  installations à domicile), désormais au lexique et ligne de base du benchmark
  ADRAMELECH. Il y a d'ailleurs **5 projets Supabase** dans l'orga (RenoboostIA,
  RenoPredict, RenoAgenda, RenoLeads, Ultima) — l'écosystème « Reno » est réel,
  pas une lubie. ② **Friction → règle** : un agent (securite-auditeur) a été
  **coupé net par une limite de session** en pleine contre-passe, laissant un
  verdict incomplet. Leçon : sur une gate sécu (RLS), séquencer la contre-passe
  AVANT d'engager d'autres gros agents dans le même tour, et toujours prévoir un
  substitut de vérif au fil principal (revue Léo + RLS post-apply) si l'agent
  meurt. ③ **Confirmé (attendu)** : le mur « pas de compte auth en base » revient
  à chaque couche data (AD-4 puis AD-5c) — le schéma + l'API se livrent sans user,
  le flux front non. À anticiper : **créer le compte auth de Paul** est la clé qui
  débloque tous les fronts gatés (seed idées, front INTENDANT, fin du « noir en
  prod »). ④ **Confirmé** : Paul pilote au « Go » serré et délègue la conception
  lourde — la valeur de Léo = une reco nette + la preuve, dispatch massif en
  parallèle (3 fiches simultanées ont bien tenu). ⑤ **Bruit** : les approbations
  d'outils MCP (Supabase get_advisors, send_later) ont échoué par intermittence
  (« requires approval » / stream coupé) — non bloquant pour les lectures
  essentielles (list_tables a confirmé la RLS), mais à re-tenter à froid.
- 2026-07-17 (session console C1 en ligne) — ① **Friction → règle** : Paul se
  souvenait d'un travail « de l'autre jour » (emblème IMLADRIK = épée + soleil)
  dont AUCUNE trace n'existe (repo, historique git toutes branches, Notion) —
  travail vraisemblablement fait dans une session jamais poussée, donc perdu
  (environnement éphémère). Leçon double : (a) le protocole FIN de session
  (tout committer/pousser) n'est pas négociable, même sur du « petit » travail
  de design ; (b) quand Paul affirme une décision passée introuvable, chercher
  partout PUIS le croire — c'est lui la source de vérité des décisions, le
  registre n'est que sa trace. ② Confirmé : la cause du « site daté » vécue par
  Paul = console jamais construite + cache PWA — pas un bug de déploiement.
  Vercel côté Léo reste sans permission sur le projet ultima (403, à faire
  rafraîchir par Paul pour lire les déploiements de prod).
- 2026-07-19 (bouclage) — ① **Friction → règle** : l'outil MCP `get_advisors`
  est bloqué « requires approval » de façon persistante (3 sessions) là où
  `execute_sql`/`list_tables` passent — ne plus s'y acharner : rejouer les
  contrôles advisors en SQL catalogue (RLS, policies, search_path, secdef),
  c'est équivalent et fiable. ② Nuance figée au harnais : la normalisation du
  garde n'effondre qu'UN séparateur final — `/adramelech//` reste bloqué
  (fail-closed sain, canonique servie) ; asserter le comportement réel, pas
  l'intuition. ③ **Confirmé** : le rythme « une PR par boucle, go Paul,
  squash » tient bien, MAIS toujours re-fetcher origin/main juste avant le
  checkout -B (un fetch précoce a pris un main en retard d'une fusion —
  conflit évité de justesse une fois, subi une fois). ④ Reste ouvert côté
  produit : L2 voix (gate coût), L2b mains, L3 mémoire ; AD-5c-γ/δ INTENDANT ;
  AD-5b généralisation à de nouvelles idées ; fiche Notion à re-synchroniser
  si le connecteur retombe.
- 2026-07-18 (session emblèmes + vision Léo-au-site) — ① **Confirmé** : sur le
  visuel, Paul décide par ITÉRATION D'IMAGES, pas par description — lui montrer
  des planches de choix (A/B/C) converge en un tour là où deux propositions
  uniques ont été rejetées. Règle : pour toute décision de goût, produire une
  planche comparative d'emblée. ② **Anticipé** : la vision Jarvis (agent actif,
  pop-up par quadrant, apprentissage) fait du **compte auth de Paul (L0) le
  verrou de TOUT le produit** — seed idées, front INTENDANT, Léo-au-site. À la
  prochaine session, proposer L0 en premier geste (flux magic-link existe déjà
  dans traveler.html ; il faut créer le user et prouver le flux). ③ Rappel
  registre : « ce cas de figure précis » de Paul distingue bien Léo-en-session
  (moi, ici) de Léo-au-site (le produit) — ne pas les confondre dans les
  cadrages ; la charte .claude/agents/leo.md reste la mienne, CADRAGE-LEO-SITE
  décrit le produit.
- 2026-07-19 (session « on termine AD » — 2 sessions en parallèle) —
  ① **Confirmé durement** : la leçon « re-fetcher origin/main juste avant la
  fusion » — le merge de la PR #54 a échoué en 405 (conflits) parce que la
  session parallèle avait fusionné 3 PR entre mon dernier fetch et le go de
  Paul. Règle gravée : en travail parallèle, `git fetch origin main` +
  rebase AVANT toute tentative de merge, systématiquement. ② **Nouveau
  motif — réconciliation de doublon produit** : deux sessions peuvent
  activer la même surface chacune à sa façon (antichambre vs carte) ; le
  bon geste n'est ni d'écraser ni de dupliquer mais d'EMBOÎTER (la porte de
  l'un ouvre la vue de l'autre), puis de consigner la réconciliation au
  journal. ③ **Confirmé** : un agent coupé (limite de session) se reprend
  par message sans re-dispatcher — zéro travail perdu ; vérifier l'arbre de
  travail avant de relancer pour lui dire ce qui existe déjà. ④ Prochaine
  session : proposer d'abord la preuve prod de Paul (/idees connecté),
  puis AD-5c-δ (front INTENDANT). Notion : la synchro a demandé une
  approbation d'outil en fin de session — entrée préparée, à rejouer.
- 2026-07-19 (« Focus Léo » — L2 la voix) — ① **Friction MCP élargie** : après
  `get_advisors`, c'est `send_later` (pointage de veille PR) et la fiche
  Notion qui restent bloqués « requires approval » — règle inchangée : ne pas
  s'acharner, consigner au registre ; la veille de PR reste assurée par les
  webhooks de la souscription. ② **Leçon harnais (garde de débit)** : un
  garde à horodatage piégé au froid-démarrage — « jamais vu » doit être
  distingué de « vu à t=0 » (`Map.get() === undefined`, pas `|| 0`), sinon
  tout premier appel sous l'intervalle est refusé ; et les graines de test à
  t=0 se refusent elles-mêmes. Asserter le comportement réel, aux bornes.
  ③ **Confirmé** : le motif « brique pure dans api/_lib + route mince +
  unitaires Node purs + smoke à API stubée » a porté L2 sans friction — le
  reproduire pour L2b (outils) et L3 (mémoire). ④ Angle mort consigné :
  S-L2-2 (injection de prompt via l'historique) devient un VRAI vecteur dès
  que la voix aura des outils — ré-audit obligatoire à l'ouverture de L2b.
- 2026-07-20 (reprise + L2b les mains) — ① **Confirmé (2×)** : fetch+rebase
  avant merge — la fusion de #60 a buté en 405 sur le RADAR annoté des deux
  côtés ; réconciliation = garder les deux entrées, zéro perte. ② **Motif
  validé** : « l'IA propose, le front exécute après confirmation via les API
  déjà auditées » — zéro nouvelle surface d'écriture serveur ; à reproduire
  pour tout futur outil de Léo (L3 mémoire incluse). ③ **Leçon de
  contre-passe** : une carte de confirmation doit nommer la CIBLE RÉSOLUE,
  pas la référence dictée (S-L2b-1 : « Marc » peut résoudre vers
  « Jean-Marc Petit ») ; et une lecture indexée `obj[cle]` remonte le
  prototype — toujours `hasOwnProperty` pour juger un champ (S-L2b-2).
  ④ S-L2-2 : mitigation centrale fermée en L2b (proposition déterministe +
  confirmation + cible affichée + RLS mono-owner) ; S-L2b-4 en vivier
  (carte auto-vérifiante client si le serveur devenait hostile).
- 2026-07-22 (Ultima LV2 : boussole → RESHIRAM v1) — deux frictions **confirmées**
  et transformées en pratiques permanentes (charte §Optimisation) :
  ① **Run partiel = régression manquée** : le repointage des liens « retour »
  en LV2-① a laissé `smoke-quadrants` rouge, non vu car seuls boussole+console
  avaient été relancés — détecté bien plus tard, au renommage RIVEN. → Leçon :
  **`lancer.sh` en entier** avant toute fusion front/routage/renommage large.
  ② **Conflit de merge post-squash (récurrent)** : après chaque squash, la
  branche locale gardait le commit pré-squash et empilait dessus → 405 « merge
  conflicts » / non-fast-forward. Résolu à chaque fois par
  `git rebase --onto origin/main` + force-with-lease. → Leçon : **repartir la
  branche de `origin/main` avant tout nouveau commit** après un squash-merge.
  ③ **Confirmé (motif réutilisé sans friction)** : RESHIRAM v1 a repris tel quel
  le motif idees/adramelech (brique + route mince + validate miroir des CHECK +
  fail-closed + unit purs + smoke à API stubée) — 0 surprise. À reproduire pour
  ZEKROM. ④ Angle mort environnement : `get_advisors`/`send_later`/subscribe MCP
  demandent une approbation indisponible en async → advisors 0009 à reconfirmer
  au dashboard (action Paul), ne pas considérer l'auto-check comme fait.
