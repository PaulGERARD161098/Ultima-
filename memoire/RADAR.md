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

## Signaux de session (2026-09-02)

- ✅ **CONFIRMÉ — Paul tranche vite quand la question est un CHOIX, pas une
  enquête.** Cinq arbitrages posés en tableau avec une recommandation chacun :
  réponse en une ligne (« 1 oui, 2 oui, 3 ta reco… »), et l'exécution des quatre
  paliers a suivi dans la même séance. *La règle du 2026-08-17 se vérifie par
  son endroit : une question se pose quand deux options tiennent également
  debout, et elle se pose alors AVEC la reco.*

- ✅ **CONFIRMÉ — il juge sur une CAPTURE, et il a raison.** Deux défauts de
  cette séance ont été trouvés en regardant une image (la parole de Léo derrière
  le bandeau ; la mer de l'écran de connexion, qu'il a signalée lui-même sur sa
  propre capture). Aucun n'était visible dans le code. *Réflexe à garder :
  produire une capture AVANT de dire qu'un écran est fini.*

- 🔭 **À ANTICIPER — l'accueil vient de gagner un instrument de pilotage, donc
  il va vieillir.** L'agrégat est figé au dernier commit : le jour où Paul
  regarde l'accueil sans qu'aucune séance n'ait tourné depuis trois jours, la
  date « collecté le … » est ce qui l'empêche de croire un état périmé. Si elle
  se met à gêner (elle est petite, sous le nom), la réponse n'est pas de la
  retirer — c'est de rendre la collecte automatique.

- 🔭 **À ANTICIPER — les trois dépôts hors de portée.** `mon-dpe.fr` et
  `artisan-builder` sont attachables à une séance, `ripair` non (autre
  propriétaire). Ils sont rangés sous ALPHA par défaut et n'ont donc pas encore
  de vraie place dans le ciel. Le jour où l'un d'eux redevient actif, il faudra
  l'attacher, lire son grain et lui donner son accroche.

## Signaux de session (2026-07-30)

- ✅ CONFIRMÉ — **Paul pense en MÉTHODES, pas en anecdotes**. Sollicité pour une
  preuve de talent (« un chantier daté »), il répond par la **figure classique**
  et sa **parade** (« l'artisan ne répond plus → avoir déjà le doublon »), en
  précisant lui-même « c'est un cas d'école ». Réflexe à garder : ne pas lui
  arracher un récit ; **chercher la preuve CHIFFRÉE que sa méthode implique**
  (ici : combien d'artisans doublons par secteur → `talents_capital_reseau`).
- ⚠️ **La donnée manque à la racine** : RESHIRAM était vide, **RIVEN l'est aussi**
  (0 fiche, vérifié en prod) — alors que toute la machinerie (0013, vues, API,
  front) attend. Corollaire du cap DONNÉE : **peupler RIVEN est le goulot** ;
  c'est lui qui débloque les preuves chiffrées de RESHIRAM, donc « mon offre
  réelle ». À proposer avant tout nouveau chantier de code.
  - 🔄 **PÉRIMÉ AU 2026-08-10 sur le chiffre, VALIDE sur le fond.** `list_tables`
    donne **5 fiches**, pas 0 : Paul a commencé à peupler entre les deux
    sessions. Le goulot reste réel (5 fiches ne prouvent encore aucun talent),
    mais **le chiffre « 0 » ne doit plus être cité**.
  - 🔻 **Règle de tenue du RADAR, née de cette erreur** : un constat d'**ÉTAT**
    (« la table est vide », « le harnais est rouge ») **se périme** — il se
    **re-mesure** avant d'être re-cité, surtout quand on va en tirer un conseil
    à Paul. Un constat de **DÉCISION** ou de **MÉTHODE**, non. Marquer les
    entrées d'état de leur date de mesure, et les re-vérifier au lieu de les
    relire.

## Signaux de session (2026-07-25)

- ✅ CONFIRMÉ — **le cap « donnée » l'emporte sur le cap « code »** : après un
  quadrant IMLADRIK complet, Paul a coupé net (« assez de code, il faut de la
  donnée »). Réflexe à garder : quand la structure existe, proposer d'abord de la
  **nourrir de réel** (voie A : Léo pilote en direct via connecteurs) plutôt qu'un
  nouveau chantier de code.
- ⚠️ NUANCE apprise — Paul distingue « piloter sur la donnée » (veut) et
  « construire la plomberie de la donnée » (= « chantier technique », a mis en
  pause le cockpit web voie B). Corollaire : privilégier la **valeur immédiate à
  la demande** (briefing live) et ne cadrer la plomberie (OAuth déployé) que sur
  un go explicite « voie B ».
- 🕒 À surveiller (vu en pilotant sa boîte, non consigné en détail — PII) :
  échéance **Google Cloud** (essai gratuit ~fin juillet) qui porte le client Drive
  d'IMLADRIK ; relance YCOME en attente. À reproposer si le sujet revient.

## Signaux de session (2026-08-12)

- 🔻 **Une fonctionnalité VERTE peut être INATTEIGNABLE.** RIVEN avait la
  personne séparée du nœud (0024), livrée et testée — mais avec **0 personne en
  base**, le bouton « Rattacher » refusait d'ouvrir. Aucun harnais ne pouvait le
  voir : la démo livre 3 personnes. **Réflexe à garder : avant de déclarer un
  geste disponible, l'exercer dans l'ÉTAT RÉEL de la base de Paul — mesuré, pas
  supposé.** L'état de départ d'un test est une hypothèse.
- 🔻 **Un harnais peut dépendre d'un bug et le transformer en contrat.**
  `smoke-geocode` atteignait le bouton de la Carte grâce à une bascule d'onglet
  involontaire. Corriger le défaut a rendu le harnais rouge — c'est le harnais
  qui avait tort. **Réflexe : une navigation, dans un harnais, s'écrit
  explicitement ; jamais par effet de bord.**
- 🔻 **Avant de déclarer une protection ABSENTE, chercher TOUS ses lieux.**
  J'ai conclu « aucun header de sécurité » sur un grep limité à `*.html` +
  `vercel.json` — en oubliant `middleware.js` (edge Vercel), qui les pose tous.
  **Une protection peut vivre dans un header de plateforme, un middleware edge,
  une meta : un grep partiel ment.**
- 🔻 **Une CSP se MESURE contre l'app, elle ne se relit pas.** La CSP du
  middleware bloquait 100 % des tuiles (`*.tile.openstreetmap.org` ne matche pas
  le domaine nu `tile.openstreetmap.org`). L'audit statique l'a jugée saine ;
  seul le harnais qui l'injecte et exerce la carte l'a vu. **Même leçon que la
  géométrie : injecter la politique réelle, exercer, compter les violations.**
  Harnais durable : `smoke-csp.mjs`.
- 🔻 **« Le cadre tient-il dans l'écran ? »** — la règle du 01/08 (« une
  géométrie se MESURE ») avait été entendue comme « les éléments tiennent dans
  le viewBox ». Insuffisant : **le viewBox lui-même peut être coupé**. Le ciel
  perdait un quart de sa hauteur derrière `overflow: hidden`, en silence.
  **Réflexe : comparer la boîte du dessin à celle de son conteneur, puis au
  viewport — pas seulement les éléments à leur viewBox.**
- 🔻 **Une hypothèse qui CONFIRME une leçon récente est la plus dangereuse.**
  J'ai diagnostiqué le ciel par analogie avec le foyer DRAUKHAIN — élégant,
  familier, faux. **Mesurer le RÉSULTAT ne suffit pas : il faut mesurer le
  DIAGNOSTIC avant d'écrire le correctif.**
- 🔻 **Un format d'écran non éprouvé est un écran cassé.** Le harnais du ciel
  ne tournait qu'à 390 × 844 ; le défaut ne vivait qu'en large et court. **La
  taille d'écran est une dimension du pire cas, au même titre que le volume de
  données.**
- 🔻 **Un verdict qui dépend d'une attente à l'heure tire au sort.** Deux
  verdicts du ciel étaient verts seuls et rouges en suite chargée. **Toute
  mesure d'un état animé attend la CONVERGENCE, jamais une durée** — sinon un
  vrai rouge finira par être pris pour du flottement.
- 🔻 **Dans une liste PLAFONNÉE, l'ordre des règles est un arbitrage de
  VALEUR.** La règle R5 (proposer un rapprochement inédit) était rangée en
  cinquième position d'un moteur qui n'affiche que **trois** suggestions :
  elle ne s'affichait **jamais**. La seule règle qui apprend quelque chose à
  Paul était affamée par trois règles d'entretien. **Réflexe : à chaque ajout
  dans une file plafonnée (suggestions, alertes, résultats), décider et ÉCRIRE
  la place — sinon la dernière ajoutée est silencieusement morte.**
- 🔻 **« Ce champ porte-t-il l'IDENTITÉ de l'objet ? »** — la bonne question
  avant de rendre un champ modifiable. `type` décrit une relation (modifiable
  depuis le 2026-08-12) ; `source_id`/`target_id` la définissent (figés : les
  changer désignerait un autre objet et le journal adossé deviendrait un faux
  témoignage). Vaut pour tout quadrant.
- ✅ **CONFIRMÉE et FERMÉE — l'entrée n°1 (rapprochement objet pilotable).** Les
  trois champs de 0003 (intérêt qualitatif, efforts chiffrés) sont atteignables
  depuis le 2026-08-12. La contradiction « confirmée en base / démentie en
  usage » notée le matin même est levée.
- 🔻 **Un avertissement d'outil est un SIGNAL, pas un verdict.** J'ai inscrit
  « activer la protection des mots de passe compromis » comme action Paul, sur
  la foi d'un WARN des advisors Supabase. Sa question — « c'est à dire ? » — m'a
  fait vérifier : **Ultima n'a aucune authentification par mot de passe**
  (lien magique + Google). Le WARN était **sans objet**. **Réflexe à garder :
  qualifier un avertissement contre la surface RÉELLE du produit avant de le
  transmettre — relayer un avertissement inapplicable fait faire un geste
  inutile et use la confiance dans les alertes suivantes.**
- ❌ **DÉMENTI le 2026-08-12 — l'ingestion d'une source existante.** Cadrée le
  10/08 comme la voie ① du peuplement, elle est **abandonnée** par Paul :
  *« pour l'instant, je renseigne les contacts à la main »*. La saisie en série
  est la seule voie. **Ne plus proposer d'ingérer contacts / Gmail / tableau /
  devis** tant qu'il ne rouvre pas le sujet.
- ⚠️ **ÉTAT MESURÉ le 2026-08-12** (marqué de sa date, comme l'exige la règle du
  10/08) : RIVEN = **5 fiches, 1 relation, 0 personne, 0 rattachement**. Le
  goulot du peuplement est **entier** : le ciel affiche cinq étoiles et un
  trait. La saisie en série est
  désormais outillée, et c'est **la seule voie retenue** (ingestion abandonnée
  le jour même). *Le goulot n'est plus un manque d'outil : c'est du temps de
  saisie. À reproposer sous cet angle — aider à saisir vite, pas à ingérer.*
- ⚠️ **Du modèle validé mais débranché** : `interet_qualitatif`, `effort_temps`,
  `effort_energie` (migration 0003, go de Paul le 2026-07-03 — entrée n°1
  ci-dessus) sont validés par l'API et **atteignables depuis aucune interface**.
  L'entrée n°1 est donc **CONFIRMÉE en base, DÉMENTIE en usage**. À proposer :
  c'est une boucle à soi seule (piloter une relation : intérêt, efforts, notes).

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
  dans une chaîne source (sentinelle `'\0a-classer'`) → git a classé le
  module comme BINAIRE, diffs invisibles en revue. Attrapé par la contre-passe
  sécu (constat S1), pas par les harnais (qui restaient verts). Règle : se
  méfier des `\0`/caractères invisibles dans les littéraux d'agents ; un
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

- 2026-07-24 — **Migration : ne pas recréer une cible de scellement AD-4 déjà
  existante.** 0013 recréait `network_nodes_owner_id_uniq` déjà posé par 0008
  (intendant) → échec 42P07 à l'application. Réflexe : avant d'ajouter une clé
  unique (owner_id, id) sur une table ANCIENNE (0001) comme cible de FK composite,
  vérifier qu'une migration antérieure ne l'a pas déjà créée. Corollaire prouvé en
  prod : **Postgres accepte un index unique comme cible de FK** (pas besoin d'une
  contrainte de table) — 0008 le fait déjà. Bon réflexe tenu : appliquer PUIS
  vérifier (l'erreur a été vue et corrigée, rien de partiel appliqué grâce à la
  transaction).

- 2026-07-30 (cheminement + mains + yeux de Léo) — une friction **nouvelle**,
  deux motifs **confirmés** :
  ① **NOUVEAU — deux sessions en parallèle sur le même repo.** `main` a bougé
  **quatre fois** pendant la session (LV3 L1/L2/L3 + peuplement RESHIRAM,
  session parallèle). Chaque fusion a exigé un rebase, et le conflit tombait
  **toujours au même endroit** : `memoire/JOURNAL-DECISIONS.md`, où les deux
  sessions écrivent le même jour, en fin de fichier. Résolution invariable :
  garder les DEUX entrées. → Leçon actée en charte : quand un autre fil pousse,
  **rebaser puis fusionner sans délai** (une PR qui dort se refait doubler), et
  traiter un conflit du journal comme une **concaténation**, jamais un arbitrage.
  ② **Confirmé — réutiliser plutôt que réécrire paie.** Le micro n'a pas été
  redéveloppé : le composant a été **extrait** de `js/app.js` vers
  `js/dictee.js`. Preuve que l'extraction était saine : `smoke-dictee` (le
  harnais le plus fin du repo) est passé **sans une seule retouche**. Réflexe à
  garder : une extraction couverte par un harnais dédié est peu risquée — c'est
  l'absence de harnais qui rend un refactor dangereux, pas le refactor.
  ③ **Confirmé — la règle « §5 comptes seuls » se teste par l'ABSENCE.** Les
  harnais ne vérifient pas seulement ce qui part vers Léo, ils cherchent les
  contenus intimes et les identifiants dans le corps envoyé et exigent de ne
  **pas** les trouver. Motif à reproduire pour toute donnée sensible.


- 2026-08-01 (le foyer débordait) — une friction **nouvelle**, une **confirmée** :
  ① **NOUVEAU — la validation à l'œil est un angle mort structurel.** La forme A
  de DRAUKHAIN a été livrée « validée » sur un rendu contrôlé visuellement, avec
  les données du jour. Paul a vu le débordement, pas moi : mon échantillon était
  favorable et je n'avais pas de cas extrême. → **Toute géométrie dans un cadre
  borné se mesure au harnais** (bbox contre viewBox) et s'éprouve sur un **pire
  cas construit**, jamais sur les données réelles seules. À surveiller : le même
  angle mort guette la boussole et l'arbre VRANESH quand ils se peupleront.
  ② **Confirmé — l'ordre « prémisse d'abord, dépense ensuite ».** Paul allait
  payer une clé API en croyant qu'elle débloquait la dictée. La prémisse a été
  corrigée **avant** l'engagement, sur la foi de sa propre capture. Réflexe à
  garder : quand Paul s'apprête à dépenser, vérifier ce qu'il croit acheter.


- 2026-08-06/07 (ALTHEA, un quadrant en une session) — **deux frictions
  nouvelles, deux confirmées** :
  ① **NOUVEAU — un test peut être vert POUR LA MAUVAISE RAISON.** Le refus du
  jour futur passait, alors que le trigger refusait *tout* (mot-clé SQL pris
  pour une fonction). Un refus sans contre-exemple ne prouve pas qu'on a fermé
  la bonne porte : seulement qu'une porte est fermée. → **Tout garde-fou
  s'éprouve dans les deux sens.** À surveiller : chaque CHECK et chaque trigger
  déjà en base a-t-il son contre-exemple ? (0016, 0017, 0019, 0020 : à repasser
  au crible à la prochaine boucle sécurité.)
  ② **NOUVEAU — un test qu'on oublie de brancher est un test qui n'existe pas.**
  `tests/lancer.sh` énumère ses harnais à la main ; mes trois fichiers ALTHEA
  tournaient vert isolément et le patrimoine complet les ignorait. À surveiller :
  vérifier le branchement **à la création** du harnais, pas à la fusion.
  ③ **Confirmé, et étendu — la mesure trouve ce que la relecture ne voit pas.**
  Quatre défauts de plus par la mesure seule, dont une page rétractée à 292 px où
  le texte tombait à **5,4 px de rendu**. Extension de la règle du 2026-08-01 :
  on mesure la **taille de rendu du texte** (`taille SVG × échelle`), pas la
  largeur du cadre. Seuil : **9 px**.
  ④ **Confirmé — un cadrage se corrige par les réponses de Paul.** Quatre
  corrections successives du modèle, toutes venues de ses dictées, aucune d'une
  relecture. Corollaire nouveau : **ce que Léo a trouvé de beau n'est pas un
  argument contre ce que Paul veut** — la règle « les stats montent avec les
  niveaux » a tué le « creux du charisme », et c'était la bonne décision.
  ⑤ **À surveiller — un compteur écrit en dur dans un harnais est une dette.**
  Cinq assertions comptaient les cadrans d'ULTIMA à la main et sont tombées
  ensemble. Réflexe à généraliser : **comparer au registre**, jamais à un nombre.

## 2026-08-10 — ALTHEA : sa place, sa devise

**Friction nouvelle — un nom qui désigne deux étages rend toute consigne
ambiguë.** *ULTIMA* nomme à la fois le produit entier (*Ultima Lv3*, l'écran
d'accueil) et la supra-division personnelle. « 3ᵉ cadran d'Ultima LV3 » visait
le premier ; j'ai rangé sous le second, et Paul a cherché ALTHEA pendant une
journée là où il n'était pas. **Quand un mot du lexique désigne deux nœuds de
l'arbre, la consigne qui l'emploie doit être levée AVANT d'agir — une question
coûte trente secondes, le mauvais rangement a coûté une journée.** À vérifier
sur les autres noms du lexique : ULTIMA n'est peut-être pas le seul.

**Friction nouvelle — une hypothèse commode ferme l'enquête.** J'ai écrit « c'est
sûrement le cache navigateur » : ça expliquait le symptôme sans rien vérifier,
et ça a suffi à ne pas chercher. **Un harnais vert ne réfute pas un constat de
Paul — il déplace la question.** Le mien prouvait que la page rendait ses caps ;
il ne prouvait rien sur l'étage où Paul les cherchait. Prochaine fois : nommer
ce que le test prouve ET ce qu'il ne prouve pas, avant de proposer une cause.

**Friction nouvelle — un commentaire qui énonce la règle ne l'applique pas.**
Trois des sept assertions tombées étaient des listes écrites à la main **juste
sous** un commentaire disant « un test qui compte à la main se refait à chaque
dictée ». La règle était écrite, comprise, et pas appliquée deux lignes plus
bas. **Ce qui protège, c'est le code qui lit la source de vérité — pas la phrase
qui dit qu'il faudrait le faire.**

**Confirmé** — le patrimoine complet fait son travail sur un changement de
routage : sept assertions rouges d'un coup, aucune régression passée au travers.

**Confirmé** — la règle du contre-exemple (2026-08-06) tient : les deux
contrôles ajoutés cette fois sont des contrôles **par l'absence** (ALTHEA ne
pend sous aucun autre nœud ; il a bien quitté l'étage d'ULTIMA).

**À surveiller** — Paul juge le rendu sur la **production** (`ultima-plum`), pas
sur les previews de branche. Deux allers-retours perdus pour ça. Conséquence
pratique : lui donner le lien de preview ne suffit pas, il faut soit fusionner
tôt, soit dire explicitement que le domaine est différent du sien.

## 2026-08-17 — session LV5 (galaxie plein écran → sol étoilé partout)

**Confirmé, et c'est le fait le plus utile de la session** — *un harnais vert ne
vaut rien tant qu'on n'a pas vu ce qui le fait rougir.* La sonde adversariale
(réinjecter exprès la règle fautive) a été passée **deux fois** et a servi les
deux fois : la première a validé l'instrument, la seconde — après que j'aie
modifié l'instrument — a prouvé qu'il rougissait encore. Sans ce geste, la
modification de densité aurait pu casser silencieusement le garde-fou.

**Friction nouvelle, et grave — MON INSTRUMENT A LAISSÉ PASSER UN DÉFAUT, ET C'EST
L'ŒIL QUI L'A RATTRAPÉ.** Le surtitre d'`idees` était à 4,30:1 ; le harnais l'a
déclaré vert. Cause : à densité 1, un petit texte fin en petites capitales n'a
**aucun pixel pleinement opaque**, donc aucun « coeur de lettre » à mesurer — le
filtre l'écartait **en silence, dans les deux passes**. C'est une capture regardée
qui a levé le doute.
**Ce qu'il faut en retenir au-delà du contraste** : un filtre qui *exclut* des cas
doit **compter et nommer ce qu'il exclut**. Un `continue` silencieux transforme un
angle mort en verdict rassurant. Le harnais compte désormais les exclus et borne
leur nombre par un verdict.

**Friction nouvelle — J'AI ANNONCÉ UN ARBITRAGE À PAUL QUI ÉTAIT UN DÉFAUT DE
DIAGNOSTIC.** J'avais écrit « l'abaque est de fait en atelier, à trancher avec
Paul ». Faux : sa nappe venait de `body.abaque`, elle perdait son **support**, pas
trois couleurs. Un geste (`.feuille`) l'a réglé et l'arbitrage s'est évaporé.
**Avant de remonter une question à Paul, vérifier qu'elle n'est pas une enquête
non terminée.** Un choix produit se pose quand deux options tiennent également
debout ; ici une seule tenait.

**Friction nouvelle — TROIS SONDES FAUSSES DANS UNE SEULE SESSION**, et le même
signe d'alerte à chaque fois : *une réponse trop uniforme.* (a) Le premier
instrument de contraste mesurait la boîte de l'élément → 5 faux échecs sur 7,
dont un titre lisible. (b) La mesure de géométrie comparait les étoiles au
`viewBox` d'un **blason** attrapé par un `querySelector('svg')` trop large → trois
débordements annoncés, dont deux sur des noms non touchés. (c) La sonde du canvas
répondait « blanc pur » à **toutes** les options, `eclat: 0` compris — parce qu'un
canvas transparent a des pixels blancs à faible alpha.
**Règle à tenir : avant de croire une mesure, se demander ce qu'elle répondrait
sur un cas où la réponse est connue d'avance.** Les trois se seraient effondrées
en une ligne sous ce test.

**Confirmé** — la mesure tranche mieux que le raisonnement sur le classement des
pages. J'ai converti les 7 pages en « atelier » **sans décider**, puis laissé le
harnais désigner celles qui résistaient : 5 étaient bonnes du premier coup, une
seule a demandé du travail. Débattre du registre de chaque page en amont aurait
coûté plus cher et se serait trompé.

**Confirmé** — un script de conversion qui **refuse** (2026-08-16) : il a recalé
les deux pilotes déjà embarqués. Une page à demi convertie coûte plus cher qu'une
page pas convertie, *parce qu'elle a l'air faite.*

**À surveiller — LÉO NE PEUT PLUS VOIR LA PREVIEW.** Le proxy de l'environnement
refuse l'hôte Vercel (403 au CONNECT). Toute vérification est locale (Chromium
réel), ce qui est solide mais n'est pas la même chose que regarder la page
déployée. **Le dire à chaque rapport** au lieu de laisser croire que la preview a
été vue. Se combine avec la friction du 2026-08-14 (Paul juge sur la production) :
il faut donc **fusionner tôt** et être explicite sur ce qui a été réellement
regardé.


**Confirmé — LA MESURE D'ABORD, LA NOTE ENSUITE** (2026-08-20). Deux dettes
rouvertes le même soir, deux descriptions fausses : « 5 textes sur 2 pages »
en valait 7 sur 3, et « coupée en 390 px » l'était aux deux largeurs. Aucune
des deux erreurs n'était grave — mais toutes deux auraient conduit à un travail
incomplet livré comme complet. *Le registre dit où chercher, il ne dit pas ce
qu'on trouvera.*

**Confirmé — UN DÉFAUT SURVIT À L'ENDROIT PRÉCIS OÙ L'INSTRUMENT NE REGARDE
PAS** (2026-08-20). Les deux défauts du soir avaient la même explication de
fond : verdict différentiel qui pardonne l'hérité d'un côté, test de présence
aveugle à la position de l'autre. Ni l'un ni l'autre n'était un bug du harnais —
les deux mesuraient **fidèlement autre chose que ce qui était cassé**. Quand un
défaut visible dure, la question n'est pas « pourquoi le test échoue-t-il à le
voir » mais « **que teste-t-il en réalité** ».

**À surveiller — SESSIONS PARALLÈLES, DEUXIÈME OCCURRENCE** (2026-08-20). `main`
a avancé pendant la boucle (cadrage LV6, PR #175) et la fusion a été refusée
pour conflit sur `JOURNAL-DECISIONS.md`. Résolu par concaténation, comme la règle
l'exige. La règle du 2026-07-30 tient : **rebaser et fusionner sans délai**.

## 2026-09-13 — deux constats hors du dépôt où ils ont été trouvés

Relevés pendant la séance qui a fermé le chantier multi-activité d'artisan-builder
(lots AB0 → AB5, plus l'application de la migration `0004`). Ils sont consignés
**ici** parce qu'ils n'appartiennent pas à artisan-builder : les écrire dans son
grain les aurait rendus invisibles à qui travaille sur le dépôt concerné.

**À TRAITER — RenoBoost, un advisor Supabase en ERROR.** Le projet
`RenoboostIA` (`mwaryfscxgrulauwwque`) porte une vue `public.catalogue_vente`
définie en `SECURITY DEFINER` : elle applique les permissions et la RLS de son
créateur, pas de celui qui interroge. Signalée **ERROR** par le linter Supabase.
S'y ajoutent, en WARN, quatre fonctions `SECURITY DEFINER` exécutables par `anon`
ou `authenticated` via `/rest/v1/rpc/` — `get_devis_par_jeton`,
`log_devis_open_par_jeton`, `sign_devis_par_jeton`, `is_admin`. Certaines sont
sans doute voulues (l'accès par jeton d'un devis public), mais **aucune n'a été
vérifiée** dans cette séance : elle n'avait pas RenoBoost sous la main, et
toucher à l'authentification d'un autre dépôt sans pouvoir l'éprouver aurait été
pire que de le signaler. `mcp__Supabase__get_advisors` les redonne en une requête.

**À SURVEILLER — les leçons divergent sur six dépôts.** `memoire/LECONS.md` est
passé au sceau **v13** le 2026-09-13 (quinze entrées neuves), propagé dans les
deux seuls dépôts attachés à la séance : Ultima et artisan-builder. **Les six
autres portent un sceau antérieur.** Ce n'est pas un oubli silencieux —
`head -1 memoire/LECONS.md` le montre en une commande, et c'est exactement ce que
la ligne d'empreinte existe pour rendre visible. La propagation demande une
séance qui les attache.

⛔ **Et une leçon de cette propagation, déjà écrite dans `LECONS.md` :** le
fichier a été lu au sceau v9, enrichi, scellé v10 — pendant qu'une autre séance
fusionnait sa propre leçon et scellait v11. Pousser tel quel aurait **effacé sa
leçon**. Sur tout fichier à copies multiples : relire la base juste avant de
pousser, comparer les sceaux, et **reconstruire** ses ajouts dessus — jamais
écraser. La vérification se fait sur le CONTENU des deux apports, pas sur le fait
que le sceau a changé.

## Signaux terrain (2026-09-24) — deux rendez-vous prospects

**SPC (entreprise d'artisan, rendez-vous avec la personne qui tient le back-office).**
- ✅ Ce qui a porté : l'offre **simple et clé en main** — « on prend tout en
  charge, vous nous transmettez vos demandes ». Résumé par la prospecte :
  *« vous êtes un petit Leroy Merlin en termes de service »*.
- Le bon interlocuteur est **celle ou celui qui tient le back-office** (souvent
  le conjoint), pas forcément le poseur : c'est lui/elle qui suit à la main ce
  qui est payé ou non.
- ⛔ Ne pas surestimer l'aisance numérique : un système de plus les lasse vite.
  Schéma d'accompagnement très simple, pas de data impossible à absorber.
- Prix : voir la décision commission du même jour (JOURNAL-DECISIONS).

**MDH — MyDeliHome (Aïtem, dirigeant, et son associé Mohamed).**
- Très intéressés par le **pilotage de données** → traitement et restitution
  des données à soigner.
- Intérêt pour **RénoDevis** et pour la **récurrence** de **RénoPrédict**
  (entretien, dépannage — « Repair », à préciser par Paul).
- ⛔ **L'interface de devis doit encore se simplifier** (Paul l'a retestée le
  24/09) : bibliothèque + création de devis plus sommaire, plus rapide, plus
  instinctive — aujourd'hui « encore un peu obscur ». Chantier à ouvrir dans
  RenoDevis, **pas encore cadré**.
