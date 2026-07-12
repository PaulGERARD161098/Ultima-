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

- **Brique « rappels/échéanciers » transverse** : BCP (fiscal), ADRAMELECH
  (bilan mensuel), IMLADRIK (quart d'heure quotidien) en ont tous besoin →
  concevoir une seule fois, réutiliser (capitaliser).
- **Capture vocale rapide** dans ADRAMELECH et IMLADRIK : Paul dictera « au fur
  et à mesure » → réutiliser la dictée navigateur v3-④ déjà en place.
- **Stockage de fichiers** (BCP : bulletins, factures) : nouvelle brique
  Supabase Storage → cadrer la sécurité AVANT (uploads = surface d'attaque).
- **Mémoire inter-segment** : prévoir dès la console comment Léo relie une idée
  (ADRAMELECH) à un contact (TRAVELLER) ou un objectif (IMLADRIK) à une dépense
  (BCP) — modèle de données transverse à penser tôt, sans sur-concevoir.
- **Dashboards** : chaque quadrant en a un (exigence explicite de Paul, besoin
  de cadre) → motif de composant à mutualiser.

## Rétrospective 2026-07-12 (pivot plateforme + boucle C1)

- **Plus grand pivot du projet, géré en cadrage pur d'abord** : Ultima → console
  à 4 quadrants (TRAVELLER/BCP/ADRAMELECH/IMLADRIK). C0 = cadrage + mémoire, zéro
  code (PR #37 mergée), PUIS C1 = 1re construction. La discipline « une boucle à
  la fois » a tenu même sur un chantier à 4 fronts : console d'abord (capitalise
  l'existant en TRAVELLER), un quadrant à la fois ensuite. À reproduire.
- **Léo actée féminine** (accords au féminin partout — charte + profil + CLAUDE.md).
- **Chaîne spec → agent → contre-passe reconfirmée sur C1** : `front-carto`
  implémente, régression RB2 (entête mobile 61px) attrapée par le patrimoine
  `smoke-antique`, corrigée, puis `verificateur` GO indépendant. La valeur du
  patrimoine versionné : la régression a été vue AVANT tout merge.
- **Miscount de harnais** : la consigne disait « 16/16 », le réel est **15/15**
  (le patrimoine compte 15 fichiers, tous verts, `smoke-console` inclus).
  Leçon : compter le patrimoine réel (`ls tests/*.mjs`) avant d'annoncer un
  total, ne pas déduire un nombre de tête.
- **Écart spec vs réel réconcilié** : la spec C1 disait onglet TRAVELLER par
  défaut = `accueil` ; le réel = `arbre` (imposé par D2a / non-régression).
  `verificateur` l'a signalé, spec corrigée le jour même. Leçon : quand un agent
  « assume » un écart pour tenir la non-régression, réconcilier le DOC tout de
  suite, sinon la spec ment.
- **Sécurité tenue sur un périmètre qui s'élargit** : C1 = zéro touche
  données/auth malgré le nouveau niveau de navigation ; A4 (`inert`) étendu à
  la console vérifié. Le vrai durcissement (BCP finance, IMLADRIK intime) viendra
  quand ces quadrants ouvriront — provisionné dans `CADRAGE-CONSOLE.md` §5.

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
