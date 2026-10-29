# Mémoire Léo — Journal des décisions de Paul

> Une décision consignée n'est jamais redemandée ni re-litigée.
> Format : date — décision — conséquence.

- **2026-10-02 (B1 ⑤ — la maquette validée, le code lancé)** — Paul, devant la
  maquette `design/preview-leo-defaire.html` et l'écran sur une page à part
  (`leo.html`) : *« Ok pour tout »*. **Décisions** : la maquette vaut contrat —
  la bulle porte « Défaire » à côté du texte, l'écran liste une ligne par geste
  et ne nomme une cible que tant qu'elle existe, le mail POINTE l'écran par un
  lien de lecture. Code livré le même jour (cadrage §15.5). **Reste à Paul** :
  l'accès du mail au journal (aucune clé serveur aujourd'hui — reco : fonction
  SQL dédiée + secret) et `updated_at` sur `journal`/`scenarios`.

- **2026-10-02 (B1 ⑤ — le défaire : les deux choix du §15.2)** — Paul, devant
  les deux choix et leurs recommandations : *« Ok pour tes recos. Go »*.
  **Décisions** : ① **l'enrichissement d'une idée repasse orange** (la carte
  revient pour lui seul) tant qu'il n'a pas de défaire. L'alternative, une
  table qui garde l'essence d'avant 7 jours, est écartée pour l'instant et non
  fermée : elle se rouvre si le besoin revient. ② **Le bouton « défaire » vit à
  deux endroits** : dans la bulle « Fait sans demander » du cartouche de Léo
  (l'erreur vue sur le moment), puis sur un écran « ce que Léo a fait » que le
  mail du matin POINTE (l'erreur vue le lendemain). ⛔ **Jamais un lien
  « défaire » dans le mail** : un scanner de messagerie qui précharge les liens
  défairait tout seul. **Conséquence** : neuf types verts, chacun avec son
  défaire joué (M3). Cadrage : `CADRAGE-2026-09-22-leo-pilote-tout.md` §15.2
  et §15.3. Aucune ligne de code avant l'accord de Paul sur la maquette.

- **2026-09-30 (les leçons — lever le plafond du rappel, en panneaux)** — Paul,
  devant quatre options chiffrées : **« lever le plafond à tout le fichier »**.
  **Contexte de la décision, mesuré avant de la lui poser** : à 60 000 octets,
  **78 leçons sur 145 n'atteignaient AUCUNE séance**, sur aucun des dix dépôts —
  familles 3 à 6 entièrement muettes, famille 2 servie à 30/49. Parmi les
  muettes : « le lien se pose en fin de message », la règle qu'il a dû redemander
  le 25/09 **puis** le 30/09. **Décisions** : ① `MAX_OCTETS` passe de 60 000 à
  **200 000** — elle reste une borne (un rappel sans plafond noie l'ouverture le
  jour où un script verse en boucle) ; ② le pied du rappel, qui prescrivait
  l'inverse (« c'est le FICHIER qui doit être élagué, jamais cette borne »), est
  corrigé et porte désormais la mesure. **Conséquence** : 146/146 leçons servies,
  134 451 octets, +73 Ko par ouverture de séance sur dix dépôts — coût assumé et
  chiffré. ⛔ **L'option écartée, et pourquoi on ne la rouvre pas** : la passe
  d'archivage a été EXÉCUTÉE avant de toucher à la borne, et elle rend **0** — sur
  145 entrées, 73 citent un mécanisme, 14 en NOMMENT un, 2 ont leur règle tenue
  par une garde prouvée en la cassant, et ces 2 règles portent plus loin que leur
  garde. La route n'existe pas ; le pied du rappel le dit maintenant.

- **2026-09-30 (DATARENO- — on le laisse de côté)** — Paul : *« data reno est
  vraiment à part donc on le laisse de côté »*. **Constat qui a déclenché la
  question** : le déploiement Vercel du projet `datareno` est en `ERROR`
  **en permanence**, `PYTHON_ENTRYPOINT_NOT_FOUND`, y compris sur `main` — le
  dépôt est un pipeline en ligne de commande, il n'a aucune application web à
  servir. **Décision : ne pas traiter, ne pas rouvrir.** Le remède (débrancher le
  projet Vercel, ou déclarer un point d'entrée qui n'existe pas) est une action de
  tableau de bord, pas un correctif de code. **Conséquence** : inscrit comme
  ARBITRÉ dans le grain Finubar d'Ultima, pas comme une action en attente — une
  action listée comme bloquante alors qu'elle est tranchée se rejoue. La cause
  complète reste sur DATARENO-#45.

- **2026-09-30 (mon-dpe.fr — les vulnérabilités attendent)** — Paul : *« on va
  corriger mon dpe plus tard »*. **Constat** : 62 vulnérabilités Dependabot sur
  `main` (4 critiques, 28 hautes), vues au push. **Décision : reporté, séance
  dédiée.** **Conséquence** : inscrit comme ARBITRÉ dans le grain, pas en attente.

- **2026-09-30 (Léo s'appelle par une commande)** — Paul : *« je veux pouvoir
  appeler Léo et toutes ses capa avec "/léo" ou "/leo" »*. **Décisions** : ① la
  commande **POINTE** la charte (`.claude/agents/leo.md`), elle ne la recopie ni
  ne la résume — deux descriptions de Léo finiraient par diverger ; ② `léo.md`
  est un alias mince, sans consigne propre, pour la même raison ; ③ elle vit
  **uniquement dans Ultima** : la charte y est spécifique (les quatre quadrants,
  ses sous-agents), et la copier dans les neuf autres dépôts produirait une Léo
  qui parle de RIVEN en séance RenoBoost, plus une quatrième surface à
  synchroniser. **Conséquence** : `/leo` nu rend l'état + les gates + ses
  capacités en pointant les § de sa charte ; `/leo <demande>` prend la demande et
  la mène en s'arrêtant net aux gates. Le harnais liste bien les DEUX commandes,
  nom accentué compris — constaté, pas déduit.

- **2026-09-22 (RIVEN — importer les contacts de l'iPhone, dictée)** — Paul :
  *« est-ce que je peux importer des contacts de mon iPhone dans Ultima pour
  Riven ? »*, puis *« oui, en boucle suivante, j'ai environ 500 contacts »*,
  *« ok maquette, fusion auto des doublons, go boucle import »* et *« go fusion
  dès que c'est vert »*. **Décisions** : ① l'import passe par la **vCard**
  (export iCloud), pas par un CSV ; il remplit le registre **`personnes`**, jamais
  les fiches (une fiche exige un type) ; ② **rien n'est coché par défaut** ; ③ les
  **doublons du fichier sont fusionnés automatiquement** (même téléphone normalisé
  ou même e-mail, sans écraser) ; ④ la maquette `design/preview-riven-import.html`
  est validée. Livré et fusionné le même soir (#285, `bce6101`), aucune migration.
  **Ordre des boucles suivantes, fixé par Paul** : *« ensuite il faudra faire une
  étude contact par contact pour que je dise ce qu'il en est de chacun, et bien
  les renseigner dans RIVEN ; il faudra ensuite bien sécuriser RIVEN »* —
  **① revue contact par contact, ② sécuriser RIVEN**, dans cet ordre, chacune
  cadrée en 6 points à son ouverture (`CADRAGE-RIVEN-IMPORT.md` §7).
  **Restent à Paul** : importer son vrai fichier ; région Vercel `cdg1` ;
  vérifier que les inscriptions Supabase sont fermées.

- **2026-09-14 (SPC — le premier écran, Paul regarde la preview)** — Paul renverse
  le constat 2 de la critique design (« H1 = métier + ville, marque au-dessus »).
  **Décision : le NOM d'abord, en grand.** Message central dicté mot pour mot :
  *« SPC, votre expert Plomberie, chauffage et rénovation de salle de bain en
  Ile de France »*. La ligne « Solution Plomberie Chauffage » entre le logo et le
  titre est supprimée (« supprime la barre du milieu »), le CTA secondaire
  devient **« Prendre RDV »** — appliqué aux QUATRE endroits où ce libellé vit,
  puis aux quatre liens qui menaient à `#contact` sous trois noms différents —
  et ce bouton reçoit un **contour doré**, l'appel restant en or plein : c'est le
  remplissage qui hiérarchise, pas la teinte. **Ce qui n'est pas perdu** : le
  mot-clé local « plombier-chauffagiste Le Raincy » passe dans le `<title>`,
  reste dans l'en-tête sous la marque, et sous le H1 (« Basés à Le Raincy (93) »).
  **Coordonnées réelles posées le même jour** : 06 22 52 64 11 (deux champs
  cohérents) et proprn@outlook.fr — la garde passe de 8 à **6 blocages**.
  Fusions #68, #69, #70, #71.

- **2026-09-14 (SPC — le registre éditorial du site d'Ezzedine, dictée)** — Paul
  tranche : **« c'est un artisan, pas un dépanneur »**. Conséquence de
  formulation, dictée mot pour mot : *« possible de le contacter pour une
  demande, mais ce n'est pas un dépanneur »* — le site peut inviter à prendre
  contact, il ne peut promettre **aucune disponibilité**. **Décision appliquée
  le jour même à neuf endroits** (elle ne portait à l'écrit que sur
  `site.horaires`, « dépannage urgent 7j/7 ») : FAQ d'accueil, pages Plomberie,
  Chauffage et Électricité, bandeau de confiance, fiche prestation, RC Pro,
  article « Dégât des eaux », et le bloc `export const urgence` supprimé.
  **Ce qui reste autorisé** : dire ce que SPC répare et quand on peut le
  joindre. **Ce qui est interdit** : une astreinte, un délai d'intervention, une
  priorité. Verrouillé par `tests/spc-pas-depanneur.test.mjs` — il interdit les
  **promesses**, pas les mots, parce que le site dit désormais explicitement
  qu'il n'est pas un service de dépannage. Fusionné en `9a0fb06`.
  ⚠️ **Portée à confirmer** : cette décision vaut pour SPC. Reste ouverte la
  question de savoir si elle devient une règle du générateur — un artisan qui
  EST dépanneur doit pouvoir le dire.

- **2026-07-30 (RESHIRAM — premier peuplement réel, dictée)** — Paul ouvre le cap
  **donnée concrète** en commençant par RESHIRAM. **Décision de formulation** :
  ce qu'il propose n'est PAS « résoudre les problèmes » (trop large) mais
  **« on fait appel à moi parce que j'ai toujours des solutions »** — l'énoncé
  d'offre, un chapeau, pas un talent en base. **Deux talents réels posés** (base
  vide avant : 0 talent) : ① **« Toujours avoir un plan B »** (anticipation par
  visualisation des futurs bons comme mauvais → ne jamais rester bloqué),
  ② **« Décortiquer précisément un problème »** (analyse découpée → résolution la
  plus rapide, efficace et la moins chère). Les deux **transversaux**
  (`secteurs='{}'`, il est appelé sur une thématique très large) et
  `niveau='pratique'` par défaut. Les deux naissent **« à étayer »** (0 preuve) :
  la règle cardinale tient, les preuves se saisissent dans `/reshiram`, jamais en
  seed. Seed idempotent `supabase/seed-reshiram-paul.sql` (miroir ZEKROM,
  `owner_id` en paramètre). Dictée : « solutions de revenus » lu **« solutions de
  repli »**. **Talent ③ ajouté dans la foulée** : **« Toujours savoir quoi
  faire »** (ne jamais être pris par surprise). **Frontière tranchée par Léo** :
  ① = AVANT (prévoyance, alternative préparée), ③ = PENDANT (sang-froid, marche
  à suivre immédiate) → deux talents, pas un doublon (à confirmer par Paul).
  **Motif observé** : les trois tournent autour d'un noyau unique — *l'imprévu ne
  gagne jamais* (l'anticiper / le décomposer / y répondre) ; piste de triptyque
  pour la vue « mon offre réelle ». **Liste des talents CLOSE** sur décision de
  Paul (« on ferme la liste »). **Parade type du ①** dictée ensuite (l'artisan qui
  ne répond plus → le doublon déjà prévu) : Paul la qualifie lui-même de « cas
  d'école » → consignée en `plus_value`, **jamais en preuve**. **Fin de session :
  peupler RIVEN REPORTÉ par Paul** (« on s'occupera de RIVEN plus tard ») alors
  que Léo le recommandait comme boucle suivante — c'est le goulot des preuves
  chiffrées. PR #116 et #121 mergées.

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
- **2026-07-24 (cadrage ⑤ cockpit v2 — « partons sur le 5 en cadrage »)** — Paul :
  cadrer le cockpit v2. Deux arbitrages tranchés : **forme = badges discrets au
  survol** (pas de bandeau permanent, cohérent v1 sobre) ; **départ = palier A**
  (« bouclons une boucle à la fois donc go A »). Cadrage figé dans
  `CADRAGE-CONSOLE §2bis.1` : la v2 ÉTEND le cockpit v1 (comptes-seuls, RLS,
  fail-closed), séquencement **A→B→C**. **Palier A** (buildable, AUCUNE gate) =
  signaux sur données déjà en base : RIVEN « N relances dues » (journal
  `relance_at ≤ jour` & `relance_faite=false`, index partiel existant en 0005) +
  RESHIRAM « à étayer » / ZEKROM « à orienter » promus en badges. **B** = cap du
  jour déterministe (relances > à étayer/orienter), après A. **C GATÉ** : signaux
  finance = NICOL BOLAS ; capture-dispatch = clé Anthropic ; RDV/email =
  connecteurs ; le bandeau « état du jour » transversal appartient au palier C.
  Sécu §5 : palier A/B = comptes seuls, zéro PII/finance ; §5 intégral dès qu'un
  signal finance entre. Prochaine boucle : BUILD palier A (solo, go Paul).
- **2026-07-24 (build ⑤ palier A — signaux badges au survol, solo « go A »)** —
  Palier A du cockpit v2 LIVRÉ (PR #107). Extension du cockpit v1 (comptes-seuls) :
  `api/cockpit.js` +`riven.relances_dues` (journal `relance_at ≤ jour UTC` &
  `relance_faite=false`, head+count, RLS, fail-closed) ; `js/boussole.js`
  `signalDe(id,data)` pur (ultima→relances dues, reshiram→à étayer, zekrom→à
  orienter, seulement si compte > 0) + badge `.parole-signal` injecté au survol
  du cap ; CSS badge en encre rouge sobre `--danger-parchemin` (AA vérifié) ;
  `smoke-boussole` enrichi (badge présent Ultima/RESHIRAM, absent ZEKROM 0 /
  YCOME sans data, fonction pure, contraste). Contre-passe Léo : harnais COMPLET
  vert. « La donnée dort, s'allume quand elle compte » respecté. Palier B (cap du
  jour déterministe) = prochaine boucle candidate ; C reste gaté.
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
- **2026-07-24 (boucle Drive ② — « Sauvegarder sur Drive » EN PROD, PR #98)** —
  « go push ». Livré : `api/imladrik/drive/push.js` (POST) — refresh de l'access
  token depuis le refresh_token chiffré, dossier dédié, un Google Doc par page
  (create via multipart/convert, update via media), **idempotent** (hash de
  contenu → saut si inchangé), séquentiel + garde-fou quota 200/run, RLS, zéro
  contenu en log. Helpers purs dans `drive.js` (nom/rendu/hash/multipart) +
  appels Google. Bouton front « Sauvegarder sur Drive ». Migration
  `0015_imladrik_drive_sync` (ancrage `drive_file_id`/`drive_content_hash`/
  `drive_synced_at`) **APPLIQUÉE en prod**. 44 unitaires + smoke push ; patrimoine
  vert. **Connexion Drive vérifiée en vrai par Paul plus tôt (« c'est ok »).**
  IMLADRIK v1 = écrire + Drive (un sens) complet. Reste : retour/deux-sens (boucle
  future). **Idée reportée par Paul : rendre IMLADRIK « plus interactif » — à
  CADRER la prochaine fois (ne rien présumer).** Fin de session.
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
- **2026-07-25 (IMLADRIK B3 — VRANESH v1, « ensuite on avance », GO SOLO)** —
  Enchaîné après la correction Léo/Kalamn-talaen. Construit **VRANESH** (les
  différents futurs potentiels) en **miroir strict de DRAUKHAIN** : **situations**
  (« un cas donné » + contexte) → **scénarios** (le déroulé du futur +
  vraisemblance faible/moyenne/forte + signaux avant-coureurs + parade préparée).
  **Règle cardinale POSITIVE** : situation sans scénario = **« à explorer »** =
  invitation à imaginer ses futurs (anticiper sereinement, PUIS revenir au
  présent — pas de rumination). Livré : migration `0017_vranesh_situations.sql`
  (2 tables + vues `situations_etat`/`situations_anticipees`, RLS + scellement
  AD-4 miroir 0016), API `api/situations.js` + `api/scenarios.js`, validation
  `validateSituation`/`validateScenario`, front `vranesh.html` + `js/vranesh.js`
  (front délégué à `front-carto`, contre-passe sécu Léo). Cap VRANESH ouvert →
  **le quadrant IMLADRIK est complet (MINETHNIR + DRAUKHAIN + VRANESH, 3 caps)**.
  Harnais `unit-vranesh-validate` + `smoke-vranesh`. **GATE §5 : migration `0017`
  ÉCRITE mais NON APPLIQUÉE** (go Paul, comme 0012/0016). Registre ⏳.
- **2026-07-25 (IMLADRIK B4 — passerelles v2, « établis les passerelles v2,
  termine les boucles, laisse-moi ce qui est à ma main », GO SOLO)** — Construit
  la **mémoire inter-cap** du quadrant : deux tables de liens à **cible XOR**
  (motif node_id/edge_id du journal RIVEN) avec **double scellement AD-4** (miroir
  de la passerelle R↔Z 0011). `serment_liens` : serment DRAUKHAIN → idéal ZEKROM
  (lien inter-quadrant) *ou* page MINETHNIR. `scenario_liens` : scénario VRANESH →
  serment DRAUKHAIN (rapport *menace*/*sert*) *ou* page MINETHNIR. **Décision
  d'archi (Léo, solo)** : (1) cible XOR à FK composites nullables (MATCH SIMPLE :
  scellement non vérifié quand NULL, vérifié dès que posé) plutôt que 4 tables ;
  (2) ancrages composites `unique(owner_id,id)` ajoutés sur `imladrik_entrees` +
  `scenarios` (additifs — étaient les seuls sans, cf. 0012/0017) ; (3) liens
  **repliés dans les GET existants** `/api/serments`+`/api/situations` avec
  **dégradation propre à `[]`** si 0018 pas encore appliquée (le front reste
  fonctionnel). Migration `0018_imladrik_passerelles.sql` + API
  `serment-liens`/`scenario-liens` + validation `validateSermentLien`/
  `validateScenarioLien` (XOR + rapport scellé au serment) construites au fil
  principal (§5) ; **fronts délégués à 2 agents front-carto en parallèle**
  (draukhain + vranesh, fichiers disjoints) puis contre-passe sécu Léo. Harnais
  `unit-imladrik-passerelles` + extensions smoke. **GATE §5 : `0018` ÉCRITE, NON
  APPLIQUÉE** (dépend de 0016+0017 ; ordre d'application 0016→0017→0018). « Ce qui
  est à la main de Paul » = appliquer les 3 migrations + go + synchro Notion.
- **2026-07-25 (Cap DONNÉE posé, cockpit connecté exploré puis MIS EN PAUSE)** —
  Paul : « on a assez avancé sur le code, il faut de la donnée maintenant ».
  Cap stratégique acté : le prochain mouvement n'est pas un nouveau quadrant mais
  **nourrir Ultima de données réelles** (directive JL). Léo a posé 2 voies : **A —
  Léo pilote en direct** (lecture des connecteurs Gmail/Agenda en session, rien
  stocké, zéro code/gate) ; **B — cockpit web self-service** (OAuth déployé, gros
  chantier sécu gaté, comme la boucle Drive). Paul a choisi **A** (Gmail + Agenda).
  Preuve livrée : un premier **« Cockpit du jour »** synthétisé en direct depuis
  sa vraie boîte (relances dues, mails importants non lus, une échéance technique)
  — l'agenda étant vide sur 15 j. **Décision Paul (même session)** : « c'est un
  chantier technique, on arrête ce morceau pour le moment ». → **Cockpit connecté
  EN PAUSE.** Acquis à garder : la voie A fonctionne (Léo sait piloter sur le réel
  à la demande) ; rien construit, rien à défaire. **PII : aucune donnée de la
  boîte/agenda n'est consignée** (règle CLAUDE.md — la synthèse est restée dans le
  fil). Reprise = « go cockpit » (voie A à la demande, ou cadrer la voie B).
- **2026-07-26 (recalage des deux fils — « on recale les fils »)** — Après la
  fusion du cockpit ⑤ (mon fil) avec le gros travail IMLADRIK parallèle (#96→#106),
  Paul : « on recale les fils ». Constat clé : **pas de contradiction technique**,
  deux modèles mentaux à fusionner. Le « cockpit EN PAUSE » (07-25) ne vise QUE la
  couche **connecteurs** (Gmail/Agenda, voie A live / voie B OAuth) = **palier C**
  de mon cadrage cockpit v2 ; ce que j'ai livré (07-26) = **palier A** = badges sur
  la **donnée déjà en base** (aucun connecteur) — qui sert le cap stratégique
  « passer à la DONNÉE » en rendant le réel visible. Modèles unifiés : cockpit v2
  A→B→C, où **C = le cockpit connecté en pause**. Tableau de bord (CADRAGE-ULTIMA
  CAP DU JOUR) réécrit en version réconciliée 07-26. **Registre migrations unifié** :
  `0013`+`0014` appliquées ; `0015` (Drive sync) **à confirmer** ; `0016/0017/0018`
  (DRAUKHAIN/VRANESH/passerelles) **écrites, NON appliquées** = gate Paul pour
  activer IMLADRIK. Reste aussi advisors `0013` (run MCP bloqué async) + synchro
  Notion. **Décision de cap laissée à Paul** : cockpit palier B, ou cap DONNÉE pur
  (migrations IMLADRIK + Léo voie A), ou autre — les deux voies sont indépendantes.
- **2026-07-26 (cap DONNÉE « on commence par b » — IMLADRIK ACTIVÉ, solo)** —
  Paul choisit la voie (b). J'applique en prod, dans l'ordre, les 4 migrations
  IMLADRIK laissées en gate par la session parallèle : **`0015`** (Drive sync :
  3 colonnes d'ancrage `add column if not exists` sur `imladrik_entrees`),
  **`0016`** (DRAUKHAIN : serments + flammes + vues, miroir ZEKROM 0010),
  **`0017`** (VRANESH : situations + scénarios + vues, miroir 0016), **`0018`**
  (passerelles v2 : `serment_liens` + `scenario_liens`, cible XOR, double scellement
  AD-4 ; + `add constraint unique (owner_id,id)` sur `imladrik_entrees` et
  `scenarios`). **Garde-fou pré-application** : j'ai lu les 4 fichiers (additifs,
  zéro drop/delete hors rollback) ET vérifié qu'aucune contrainte `owner_id_uniq`
  n'existait déjà sur les tables ciblées par 0018 (piège 0013 évité). **Les 4
  applications : success.** Front + API IMLADRIK déjà en prod (#96→#106) → le
  quadrant est vivant. **Tout le schéma 0001-0018 est en prod.** **Advisors** :
  `get_advisors` reste bloqué par approbation MCP en async (les `apply_migration`,
  eux, sont passés) → consigné : Paul lit Security/Performance au dashboard.
  **⏳ Reste Paul** : advisors dashboard + preuve live (écrire un serment/situation).
- **2026-07-29 (cap TAO — RESHIRAM + ZEKROM réunis en arborescence)** — Paul :
  « regroupe R et Z sous un même cap, TAO, qui s'ouvre en arborescence sur les 2 ».
  **Revient explicitement sur la décision du 21-07** (« deux caps autonomes, jamais
  fusionnés »). Le Tao = la voie qui unit le réel (RESHIRAM) et l'idéal (ZEKROM).
  Livré (solo, dispatch front-carto + contre-passe Léo) : boussole → un cap unique
  `tao` (blasonTao gravé, deux ailes en miroir) qui ouvre `tao.html`, hub
  arborescence statique sur les 2 branches (RESHIRAM aile blanche / ZEKROM aile
  noire → leurs pages). Passerelle réel↔idéal devenue INTERNE à TAO (plus de trait
  inter-caps). Cockpit palier A préservé : `ligneVivante('tao')` + `signalDe('tao')`
  agrègent « à étayer » (RESHIRAM) + « à orienter » (ZEKROM) au survol du cap.
  Retours reshiram/zekrom → tao.html (« ↞ TAO »), tao.html → boussole. Harnais :
  `smoke-tao` + `smoke-boussole` MAJ, patrimoine COMPLET vert. Aucune touche
  API/migrations/données (front pur). Deux autres points de la session tranchés :
  Google Cloud = 0 € pour garder le Drive (OAuth + Drive API gratuits) ; advisors
  rendus automatiques (`.claude/settings.json` auto-approuve les lectures Supabase).
- **2026-07-30 (Ultima Lv3 — deux supra-divisions + la boussole comme forme
  unique)** — Paul dicte : « on passe à Ultima Lv3 ; on regroupe en deux supra
  divisions : **ULTIMA**, les projets personnels ; **ALPHA**, les projets
  professionnels. Dans l'ALPHA on inclut **YCOME** et **RENOBOOST IA**. Dans
  Ultima tu regroupes **TAO**. Chaque supra-division, quadrant et cap devra
  reprendre l'affichage, la forme de la **boussole IMLADRIK** — c'est ça que je
  veux. » Cadré dans `CADRAGE-LV3.md` + preview navigable
  `design/preview-lv3-boussoles.html` (PR #113). **Paul valide tout** (« oui pour
  tout ») : noms ULTIMA/ALPHA gardés avec légendes gravées « le personnel » / « le
  professionnel » ; **RIVEN reste une feuille** (accès direct à la carte tant qu'il
  n'a qu'une porte — règle nœud/feuille §2.1) ; caps proposés de NICOL BOLAS
  (ABAQUE, REVENUS & CHARGES, IMPÔTS, ÉCHÉANCIER) et d'ADRAMELECH (LES ARCHIPELS,
  LES RAPPROCHEMENTS) validés ; blason d'ALPHA = la capitale grecque gravée.
  **Go L1** donné et livré : noyau unique (`js/boussole-noyau.mjs`) + registre de
  l'arbre (`js/registre-lv3.mjs`) + catalogue de gravures (`js/blasons.mjs`) ;
  `imladrik.html` rebranché dessus, `js/imladrik-carto.js` supprimé.
  **Iso-rendu prouvé** : `smoke-imladrik-carto` **inchangé** et vert (29 verdicts),
  patrimoine COMPLET vert, + `unit-registre-lv3` (27 verdicts). Front pur, zéro
  touche auth/API/migrations/données. Reste : L2 (les deux supra-divisions),
  L3 (TAO en boussole), L4 (les deux antichambres).
- **2026-07-30 (le cheminement — l'affichage des projets en cours)** — Paul, dicté :
  ① « est-ce qu'on peut dicter dans Ultima — *ouvre tel projet et renseigne cela* —
  en particulier sur IMLADRIK, et voir où j'en suis depuis l'app ? » ; ② « rebosser
  l'affichage des projets en cours : ce n'était pas très gracieux d'avoir des gros
  quadrants ; pour IMLADRIK surtout, montrer une **progression, un cheminement** —
  aller de l'avant, devenir meilleur ». **Réponse ① (constat, pas une opinion)** :
  non — les mains de Léo (L2b, `api/_lib/leo.js`) ne couvrent que **ADRAMELECH**
  (idées) et **RIVEN** (besoin/journal/relance) ; le micro par champ (Web Speech,
  `js/app.js`) n'est que sur **RIVEN** ; le cartouche Léo n'est monté que sur
  traveler/bcp/adramelech ; `OUTILS_PAR_QUADRANT.imladrik` est **vide** — son
  commentaire « pas d'API de données » date d'avant `0016 → 0018`, appliquées
  depuis. Boucle à ouvrir, gate §5 intime. **Livré ②** (PR #114, draft, branche
  `claude/affichage-projets-cours-fwbgi0`) : `design/preview-imladrik-cheminement.html`
  — **3 formes, zéro code produit**, chiffres fictifs : **A la voie jalonnée**
  (route gravée par projet, bornes franchies → « tu es ici » → l'horizon, la route
  **sort de la carte**, jamais de ligne d'arrivée ; un pavé devient une ligne ;
  repli en colonne sur téléphone) = **reco Léo** ; **B l'ascension** (un sommet =
  une fin → réserve pour la vue de détail d'un serment) ; **C les anneaux**
  (doublon avec la boussole → écarté). Cadre : `CADRAGE-IMLADRIK.md §9` (forme) et
  **§10** (dictée). Patrimoine COMPLET vert. **⏳ Décisions Paul** : la forme, le
  périmètre (IMLADRIK seul ou console + autres quadrants), l'unité de la voie
  (un serment = une voie, reco), et l'ouverture de la boucle « dicter dans IMLADRIK ».
- **2026-07-30 (Lv3 — L2 : les deux supra-divisions en prod)** — PR #113 (cadrage
  + preview + L1) **fusionnée dans `main`** sur go Paul (« go merge and push »),
  branche repartie de `main` (règle post-squash). Puis **L2 livrée** : la racine
  `/` devient la boussole des deux supra-divisions (ULTIMA, ALPHA) ; **nouvelle
  page `alpha.html`** (RENOBOOST IA ouvert, YCOME en attente d'URL) ;
  `ultima.html` perd sa **grille 2×2** pour la boussole à 5 caps (RIVEN, NICOL
  BOLAS, ADRAMELECH, IMLADRIK, TAO) ; retour de `tao.html` repointé vers
  `ultima.html`. `js/boussole.js` **supprimé** (le noyau l'a remplacé) ;
  `.boussole-sceau` / `.boussole-retour` deviennent génériques. Badge cockpit du
  cap ULTIMA = **cumul** RIVEN + TAO. Harnais : `smoke-boussole` réécrit,
  `smoke-console` recalé sur la boussole ULTIMA, **nouveau `smoke-alpha`**,
  `smoke-quadrants` + `smoke-tao` recalés ; les harnais comparent désormais le
  bandeau au **registre** (anti-dérive des coques). Patrimoine COMPLET vert.
  Front pur. Restent L3 (TAO en boussole) et L4 (NICOL BOLAS + ADRAMELECH).
- **2026-07-30 (Lv3 — L3 : TAO en boussole)** — PR #115 (L2) **fusionnée** sur go
  Paul (« Fusion, ensuite enchaîne sur l3 ») ; conflit avec la PR #114 d'une
  session parallèle (cheminement IMLADRIK) **résolu par rebase** — journal des
  décisions réconcilié en gardant les deux entrées (fichier append-only),
  patrimoine repassé vert avant fusion. Puis **L3 livrée** : `tao.html` quitte
  l'arborescence (tronc + 2 branches) pour la boussole — RESHIRAM et ZEKROM
  autour du yin-yang. **La passerelle devient un ARC** dans le noyau (une corde
  entre deux caps opposés passait derrière le médaillon et disparaissait —
  constat de la preview Lv3), avec son nom **gravé sur le tracé** (`lienLibelle`
  → `textPath`) : « ⇄ rétroplanning ». Les deux résumés disent aussi le
  rétroplanning (l'arc est décor, la parole de Léo est annoncée). `css/tao.css`
  **supprimé** (133 lignes). `smoke-tao` réécrit (33 verdicts) avec une preuve
  géométrique que l'arc sort du médaillon. Patrimoine COMPLET vert. Front pur.
  Reste L4 (NICOL BOLAS + ADRAMELECH en boussoles).
- **2026-07-30 (suite — « ok pour tout, fusion et étapes suivantes ok »)** :
  Paul tranche les 4 questions du cheminement — **① forme A** (la voie
  jalonnée), **② IMLADRIK seul**, **③ un serment = une voie**, **④ ouvrir la
  boucle « dicter dans IMLADRIK »** — et autorise la fusion. **PR #114 fusionnée
  dans `main`** (squash) après rebase sur le LV3 (#113) : conflit unique sur ce
  journal, résolu en gardant les deux entrées. **Voie jalonnée en prod** sur
  `draukhain.html` (choix de Léo : la page est déjà derrière auth, alors que la
  carto `imladrik.html` est servie en HTML public — §5 tenue sans compromis).
  Puis **boucle ④ enchaînée le même jour** : 5 outils `imladrik` dans les mains
  de Léo, support `enum` au catalogue (rejet, jamais correction silencieuse),
  cartouche monté sur les 3 pages du quadrant (**comptes seuls**), et le
  composant de **dictée vocale extrait** de `js/app.js` vers **`js/dictee.js`**
  (réutilisation, pas réécriture) pour équiper le champ « Parler à Léo » partout.
  Chaîne prouvée de bout en bout au harnais : micro → `/api/leo` → carte de
  confirmation déterministe → **aucune écriture** → confirmation → POST avec
  Bearer. Patrimoine COMPLET vert (**824**). **⏭ Reste** : Léo ne sait pas encore
  LIRE IMLADRIK en détail pour répondre « où j'en suis » (le cartouche donne les
  comptes) — marche suivante si Paul la veut.
- **2026-07-30 (« go merge and go lecture Léo »)** — **PR #118 fusionnée** (les
  mains + le micro), après **deux rebases** : `main` a bougé deux fois pendant
  la boucle (LV3 L2 #115, puis L3 #117, session parallèle) — conflit à chaque
  fois sur ce seul journal, résolu en gardant les deux entrées. Leçon confirmée :
  quand une autre session pousse vite, **rebaser puis fusionner sans délai**.
  Puis **boucle « lecture » livrée** : les **yeux de Léo**. Le front joint à
  chaque question un **état borné** du cap (comptes + intitulés), calculé sur
  les données déjà chargées ; le serveur le valide **fail-closed**
  (`validerEtatQuadrant`, bornes dures, rejet total sur surnuméraire) et le rend
  en bloc système déterministe (`decrireEtat`) **hors cache**, pour ne pas
  invalider le préfixe stable. **§5 tenue et prouvée au harnais** : ni texte de
  flamme, ni déroulé de scénario, ni pourquoi/horizon, ni identifiant ne quitte
  la page ; MINETHNIR au régime le plus strict (comptes + date de la dernière
  page, jamais un titre). Consigne anti-invention dans le prompt : « ce qui n'y
  figure pas, tu ne le sais pas ». Patrimoine COMPLET vert (**866**).
- **2026-07-30 (clôture de session — « boucler toutes les boucles du jour »)** :
  **#120 fusionnée** (les yeux). Bilan du fil : **3 boucles ouvertes, 3 fermées
  et fusionnées** (#114 la voie jalonnée, #118 les mains + le micro, #120 les
  yeux), patrimoine **779 → 866** assertions, **zéro migration**, zéro touche à
  l'auth/middleware/RLS, zéro travail non poussé. Charte enrichie de 3 règles
  permanentes tirées du jour : ① sessions parallèles → rebaser puis fusionner
  sans délai, conflit du journal = concaténation ; ② extraire plutôt que
  dupliquer quand un harnais couvre (critère : le harnais passe **sans
  retouche**) ; ③ une règle de confidentialité se teste **par l'absence**.
  Lexique enrichi (voie jalonnée, bornes, mains/yeux de Léo, « le cheminement »).
  **⏭ Reporté, prêt à brancher** : les yeux sur RIVEN / ADRAMELECH / NICOL BOLAS
  (forme générique déjà en place). **Signalé, non traité** : le hook de fin a
  pointé `722b2e2` comme « unverified » — c'est le commit de **squash-merge créé
  par GitHub** (auteur : Paul, committer : GitHub), présent sur `main` comme les
  12 précédents ; l'amender réécrirait `main` → **écarté sciemment**, la
  configuration locale (`Claude <noreply@anthropic.com>`) étant déjà correcte.
- **2026-07-30 (Lv3 — L4 : les deux antichambres, Lv3 COMPLET)** — PR #117 (L3)
  fusionnée sur go Paul (« Merge tout et push tout, ensuite go L4 »). **L4
  livrée** : `bcp.html` devient la boussole de NICOL BOLAS (ABAQUE ouvert +
  REVENUS & CHARGES / IMPÔTS / ÉCHÉANCIER à venir) ; `adramelech.html` devient la
  boussole d'ADRAMELECH (LE REGISTRE / LES ARCHIPELS / LES RAPPROCHEMENTS).
  **Arbitrage pris et signalé** : `adramelech.html` n'était PAS une antichambre
  mais une **page de travail** (auth-gate + compteurs + idées + ponts via
  `/api/idees`) — en faire une coque aurait supprimé une vue qui marche. Elle a
  donc **déménagé telle quelle** sur **`registre.html`** (`js/adramelech.js`
  inchangé) et devient un cap à part entière, **LE REGISTRE**, ajouté au registre
  Lv3 en plus des deux caps validés. `js/antichambre.js` **supprimé** (il ne
  servait que le cartouche « majordome de chantier » de bcp). Commentaire
  `middleware.js` rafraîchi : `/adramelech` reste l'exception de chemin exact
  mais n'est plus qu'une coque muette. **Preuve du déménagement** : les sections
  fail-closed de `smoke-quadrants` visent `registre.html` et passent **sans qu'une
  seule assertion change**. Patrimoine COMPLET vert. **Lv3 est complet** : tous
  les nœuds de l'arbre sont rendus par le noyau unique.
- **2026-07-30 (fin du fil Lv3 — trois boucles posées pour la suite)** — Paul :
  « implante-toi ces pistes pour la prochaine session ». Consignées **en tête de
  l'ÉTAT de `CADRAGE-ULTIMA.md`** (le fichier lu au protocole de DÉBUT de
  session), donc reprises sans re-scan ni re-décision : **①** brancher les *yeux
  de Léo* sur les autres quadrants (RIVEN d'abord — la forme `{ compteurs,
  listes }` de #120 est générique, il ne reste qu'un branchement page par page ;
  meilleur rapport valeur/effort en réserve) ; **②** NICOL BOLAS — construire
  REVENUS & CHARGES pour faire entrer la donnée financière **réelle** (ce qui
  manque n'est pas le code mais un **cadrage dicté par Paul** ; gate migration) ;
  **③** RIVEN en boussole, dès qu'un **deuxième cap** est choisi (choix produit de
  Paul : l'arbre des relations, les chantiers, ou les secteurs). Ordre recommandé
  ①→②→③. Aucune n'engage l'auth ; seule ② demande une migration.
- **2026-07-31 (dictée → VRANESH peuplé : LIANDRA et THORIOL)** — Session de
  **dictée pure**, zéro code produit : Paul dicte, Léo reformule, met au propre
  et **grave en base**. VRANESH était **ouvert mais vide** depuis B3 (2026-07-25)
  ; il porte désormais ses **deux premières situations réelles**, chacune
  complète (aucune « à explorer ») :
  - **LIANDRA** — « l'amour et le devoir », **5 scénarios**. Nom dicté par Paul.
  - **THORIOL** — « mes premiers pas dans l'entrepreneuriat », **3 scénarios**
    (Renoboost IA marche → sphères d'expansion / ne marche pas → plan B / voie
    plus souple, registre VERTUMNE). **Nommée FINUBAR puis renommée THORIOL**
    dans la même dictée — les deux noms restent au lexique (la déformation
    vocale porte sur le nom retenu, pas sur l'abandonné).
  - **Règle confirmée par l'usage (à ne plus redécider)** : le contenu intime
    **ne touche jamais le repo**. Il vit en base sous RLS, écrit par les mains de
    Léo. Le repo n'en garde que **le nom** (lexique vocal) — jamais le déroulé
    d'un scénario ni le contexte d'une situation. Seul le lexique a été committé.
  - **Vérification** : `situations_etat` relue après écriture (2 situations,
    5+3 scénarios, `a_explorer = false` partout). Patrimoine COMPLET lancé
    **avant** la fusion : `TOUS LES HARNAIS VERTS`. PR **#125** fusionnée
    (squash `58d3a17`), zéro migration, zéro touche auth/RLS.
  - **Arbitrage pris et signalé** : le futur désiré de LIANDRA (« par la
    discipline, l'exigence, la patience ») est resté **en préambule du contexte**,
    PAS en sixième scénario — VRANESH anticipe ce qui *peut* arriver, la volonté
    relève de DRAUKHAIN. Bascule en serment relié proposée à Paul, non exécutée.
  - **Hook de fin, 2ᵉ occurrence du même faux positif** (déjà consigné le
    2026-07-30 pour `722b2e2`) : `58d3a17` signalé « unverified » — c'est encore
    le **commit de squash créé par GitHub**, présent sur `main`. L'amender
    réécrirait `main` → écarté. **Nouveau, à retenir** : l'alerte se **taisait**
    en alignant la branche distante sur `main` fusionné
    (`git push --force-with-lease`), la branche ne portant que de l'historique
    déjà absorbé par le squash — geste sûr et conforme à la règle de reprise de
    branche post-squash.
  - ⏳ **Registre à la main de Paul** : sort du futur « je m'engage »
    (préambule / scénario / serment DRAUKHAIN) ; pour THORIOL — confirmer
    « Julien », « d'ici janvier » (ou le 16 janvier), et « premiers **pas** » vs
    « premiers **profits** » dans l'intitulé.
- **2026-08-01 (VRANESH : la boussole, l'advenu, puis l'arbre à la demande)** —
  Trois boucles livrées et fusionnées dans la journée (#127, #128), migration
  `0019` appliquée, patrimoine **944 → 959** assertions.
  - **La boussole des futurs** (#127) : un thème = une situation, une branche =
    un scénario. Réutilise la géométrie du noyau Lv3 et l'habillage
    `css/boussole.css` plutôt que d'en refaire un.
  - **L'advenu** (#127 + `0019`) : désigner la branche qui a poussé, ou en créer
    une neuve si l'imprévu est arrivé. **Décision de Paul, redite après réserve
    de Léo : suppression RÉELLE** des branches potentielles. Léo avait proposé
    d'élaguer sans détruire ; Paul a maintenu, sa consigne prime. Contreparties
    tenues : la coupe est **portée par l'API, jamais par la base** (aucune
    cascade), **confirmée en deux temps** avec le nombre de branches annoncé, et
    la branche retenue est **verrouillée par la FK du triplet AVANT** que les
    autres ne tombent.
  - **L'arbre à la demande** (#128) — **la v1 de la boussole a été REJETÉE par
    Paul** : « c'est trop gros, c'est trop général et surtout il y a trop de
    textes ». **Leçon centrale de la journée : sur un cap intime, le défaut
    principal est la DENSITÉ, pas le manque d'information.** Forme retenue,
    choisie **sur preview avant tout code** : la rose porte le **nom seul**, un
    clic ouvre l'**arbre** du thème, le côté donne **une ligne** au survol et
    **tout** au clic ; le registre complet passe en `<details>` replié — on
    l'ouvre pour écrire, pas pour consulter.
  - **Méthode validée par l'usage** : *previews d'abord, code ensuite*. Deux
    formes prototypées côte à côte (`design/preview-vranesh-arbre.html`), Paul
    tranche, on implémente la retenue. Coût du prototype largement inférieur à
    celui d'une deuxième refonte.
  - **Deux pièges techniques consignés** : une pousse en `stroke-dasharray`
    fixe **coupe** les traits plus longs que lui (mesurer avec
    `getTotalLength`) ; le centre de la boîte englobante d'une **courbe** est du
    vide (zone de préhension large obligatoire, le harnais vise le bourgeon).
  - **Confusion à ne pas refaire** : ABAQUE (simulateur de **NICOL BOLAS**)
    avait été pris comme thème d'exemple dans une preview d'IMLADRIK. Repéré par
    Paul. **Les noms d'un quadrant ne servent jamais d'exemple dans un autre.**
  - ⏳ **Registre à la main de Paul** : sort du futur désiré de LIANDRA
    (préambule / scénario / serment DRAUKHAIN) ; THORIOL — « Julien »,
    « d'ici janvier » (ou le 16), « premiers **pas** » vs « premiers **profits** ».
  - ⏳ **Bloqués par une approbation d'outil non accordée** : synchronisation de
    la fiche Notion, advisors Supabase post-DDL (contrôle RLS fait à la main).
- **2026-08-01 (directive EL gravée + MINETHNIR : le diagnostic)** — Paul dicte
  la **troisième directive maîtresse, EL (Edouard Lebrun)** : le COMMENT
  entièrement défini et assumé AVANT la première ligne de travail ; rien au
  hasard, dans les mots comme dans le code ; **gate d'entrée bloquant**.
  Les trois directives (EB le cap, JL le sens et le plan, EL le chemin) passent
  **en tête de `CLAUDE.md`** et leur relecture devient le **point 0** du
  protocole de début de session. Léo a **explicité le format 6 points** que le
  principe 3 invoquait sans le définir (but · étapes · moyens · critères de
  réussite · hors périmètre · pre-mortem) : sans lui, « le cadrage n'est pas
  bon » restait invérifiable et le gate décoratif.
  - **Note de fidélité** : Paul a présenté EL comme « telle que définie dans le
    `CLAUDE.md` du repo ». Elle n'y était **pas** (vérifié : EB et JL y étaient,
    EL nulle part). Elle y entre maintenant, et ce fichier en est la source
    unique — plutôt que de laisser croire à une relecture.
  - **Première application immédiate** : la maquette avant le code, éprouvée le
    jour même sur VRANESH et DRAUKHAIN, cesse d'être une bonne pratique
    optionnelle — c'est EL.
  - **MINETHNIR, boucle ① (diagnostic, zéro code)** : le cap est complet mais le
    journal est **vide**. Trois questions fermées, et la cause nommée en une
    phrase validée par Paul : **le cap n'est pas atteignable au moment où
    l'envie d'écrire arrive** — elle surgit en marchant, au pouce et à la voix.
    **Ce n'est ni la forme ni le contenu : c'est la DISTANCE.** Refaire
    l'affichage aurait masqué le vrai défaut. Acquis pour la forme de lecture
    (boucle ③) : les déclencheurs de Paul sont *une sensation, un jalon, une
    petite victoire, une accumulation*.
- **2026-08-01 (la voix de Léo branchée — gate clé API FERMÉE)** — Paul pose
  `ANTHROPIC_API_KEY` dans les variables d'environnement Vercel. La gate de
  coût ouverte le **2026-07-19** (PR #60) est **fermée**, après six mois… non :
  après treize jours au registre. Le redéploiement provoqué par la fusion de
  **#132** a suffi à la faire prendre — rappel utile : *une variable
  d'environnement Vercel n'agit qu'après un redéploiement*.
  - **Preuve en production** (capture de Paul, `ultima-plum.vercel.app`,
    `minethnir.html`) : Léo répond, et sa réponse démontre **trois** choses à la
    fois — la voix est branchée ; **les YEUX de Léo fonctionnent** (« ton
    journal est vierge — zéro page écrite », plus la connaissance des serments
    et des situations : c'est l'état borné livré le matin même) ; et **la §5
    tient** — elle parle en comptes et en noms de caps, **jamais** en contenu.
    C'est la première preuve EN PROD que les yeux servent à quelque chose.
  - **Ce qui borne la dépense**, rappelé à Paul : un appel toutes les 3 s par
    utilisateur (`gardeVoix`), 60 req/min/IP (middleware), timeout sortant 30 s.
    Ces trois-là **lissent** ; le seul plafond DUR reste la console Anthropic.
  - **Prémisse corrigée en cours de route** : Paul allait ouvrir la dépense en
    croyant la clé nécessaire à **la dictée**. Elle ne l'est pas — sa propre
    capture montrait un texte dicté arrivé dans le champ, et `/ecrire.html`
    dépose en base sans aucune IA. La clé ne sert qu'à ce que Léo **réponde**.
    Léo l'a dit avant qu'il n'engage l'argent, plutôt qu'après.
- **2026-08-01 (dictée affichage Lv3 — supra-divisions nommées + macro-quadrants
  GRIMA / NAGA)** — Deux correctifs d'affichage dictés par Paul, session dédiée
  (parallèle à la session MINETHNIR ; aucun fichier de boucle partagé).
  1. **Les bandeaux des supra-divisions portent leur nom** : « Supra-division
     Ultima » et « Supra-division Alpha » remplacent « Supra-division — le
     personnel / le professionnel » (registre + coques + preview). La légende
     gravée sous le médaillon (« le personnel » / « le professionnel ») n'était
     pas visée par la dictée : conservée, à confirmer par Paul.
  2. **ULTIMA se navigue en deux MACRO-QUADRANTS cliquables** — tranché par
     Paul en deux temps. Première lecture (« petits correctifs d'affichage ») :
     un regroupement purement visuel sur la boussole à cinq caps. Paul, preview
     Vercel en main : « je pensais plutôt des cadrans cliquables, des sortes de
     sous-boussoles — sinon ce n'est pas très clair ». Décision finale :
     **GRIMA — « Ce qui est utile »** (RIVEN, NICOL BOLAS, blason l'ancre) et
     **NAGA — « Ce qui fait grandir »** (IMLADRIK, ADRAMELECH, TAO, blason la
     pousse) sont de **vraies boussoles** (`grima.html`, `naga.html`) ;
     ultima.html ne montre plus que ces deux cadrans, leur devise en badge.
     **Orthographe confirmée par Paul : GRIMA** (pas « Rima » — c'était la
     dictée). Les retours remontent l'arbre : quadrant → macro-quadrant →
     ULTIMA ; le cockpit suit (GRIMA cumule les relances de RIVEN, NAGA les
     comptes de TAO).
  - **Mécanique** : deux entrées de registre + deux coques de 40 lignes —
    exactement le contrat Lv3 (« ajouter un nœud = une entrée + une coque »).
    Le regroupement visuel (`groupes`, `positionsGroupees`, gravures CSS) a
    été **entièrement retiré** : la maquette a servi, on ne garde pas de
    mécanique morte.
  - **Leçon de méthode (EL)** : la preview Vercel a joué le rôle de maquette —
    une interprétation ambiguë (« regrouper » = visuel ou navigation ?) s'est
    tranchée en un aller-retour sur du rendu réel, sans fusion prématurée.
  3. **Les messages de Léo disparaissent des boussoles** (même session) :
     « ça prend de la place et ce n'est pas utile — on garde toutes les
     fonctions, on enlève les messages affichés ». Retirés : l'invite « Léo te
     guide — survole un cap » (8 coques de boussole) et le message au repos
     « Survole un cap — Léo t'en dit l'essentiel » (9 coques, racine incluse).
     **Les fonctions restent** : au survol/focus d'un cap, la parole de Léo
     (résumé, état, signaux du cockpit) se matérialise en **cartouche de coin**
     (bas-droite, surimpression `pointer-events: none` — zéro place réservée,
     zéro occlusion des caps ; pleine largeur en bas sur petit écran).
     Non touchés (hors dictée) : le bandeau d'accueil « Sur quoi est-ce qu'on
     travaille aujourd'hui ? » (c'est la console, pas un message de Léo), les
     invites de mission des feuilles (MINETHNIR, VRANESH…), le cartouche
     propre de VRANESH et l'accueil de Léo à la première visite (L1) — à
     retirer aussi si Paul le veut, consigné.
  - **Leçon d'harnais** : un focus clavier fait défiler la page et un cap qui
    glisse sous une souris immobile déclenche un mouseenter parasite — la
    souris se gare dans un coin neutre avant toute étape clavier.
  - **Décision de clôture (Paul, au go de fusion) : « ne touche plus à Léo ».**
    L'état de Léo au 2026-08-01 est le bon : cartouche de coin au survol,
    accueil de première visite conservé, invites de mission des feuilles
    conservées. Aucune session future ne retire ni ne déplace quoi que ce soit
    d'autre concernant Léo sans nouvelle demande explicite de Paul.
- **2026-08-01 (le foyer DRAUKHAIN mesuré, plus estimé — PR #135)** — Paul :
  « léger débordement des étiquettes sur le foyer DRAUKHAIN, **que tu as validé
  tel quel** ». Le reproche porte juste : la forme A avait été livrée sur un
  contrôle **à l'œil**, sur les seules données du jour (peu de flammes, textes
  courts). Le défaut n'était pas visible là, il l'était chez Paul.
  - **Correctif de fond, pas de symptôme** : `couronne(n)` ne pose plus une
    troncature arbitraire — elle **calcule la place réellement disponible** de
    chaque côté du foyer (`signes = plancher(dispo / largeur_moyenne_du_signe)`)
    et l'étiquette s'y plie. **Deux bornes se disputent, la plus serrée
    l'emporte** : la place protège le cadre, 22 signes protègent l'intention.
    Sous 6 signes utiles, **rien** ne s'affiche — mieux vaut le vide qu'un mot
    coupé. Cadre élargi à `0 0 300 200` pour rendre l'air, pas pour cacher.
  - **Le harnais ne regarde plus, il mesure** : chaque étiquette voit sa
    `getBBox()` comparée au `viewBox`, et un **cas extrême à douze flammes** est
    éprouvé via `couronne(12)` — les données du jour ne sont plus le juge.
    Patrimoine complet au vert : **1071 assertions**.
  - 🔻 **Leçon actée en règle permanente** : **une géométrie ne se valide pas à
    l'œil, elle se mesure au harnais.** « Ça a l'air bien » n'est pas un critère
    de réussite au sens d'EL ④ — c'est l'absence de critère. Vaut pour tout ce
    qui est placé dans un cadre borné : boussole, arbre VRANESH, foyer.
  - **Bouclage MINETHNIR laissé OUVERT et à la main de Paul** : la boucle ③ (la
    forme de lecture) ne se cadre **qu'après** qu'il ait déposé une première
    page sur `/ecrire.html`. Cadrer une lecture sans rien à relire serait
    exactement l'erreur de la boucle ① (refaire l'affichage au lieu de traiter
    la distance). Rien n'est donc « en attente de Léo » ici — c'est voulu.
- **2026-08-04 (VRANESH — le futur advenu se choisit sur la branche, PR #137)** —
  Paul : « je clique sur une branche, ça me donne le choix si je la sélectionne,
  si le futur est advenu. En l'état, ce n'est pas le cas. Il faut que je puisse
  sélectionner le futur qui soit advenu. »
  - **Diagnostic, et c'est là qu'est la leçon** : le geste **existait**. Migration
    `0019` appliquée, `PATCH /api/situations` fonctionnel, formulaire écrit — le
    tout livré et annoté « ✅ l'advenu livré » trois jours plus tôt. Mais il ne
    vivait que dans « Le registre détaillé », **replié par défaut**, en bas de
    page, sous forme de **menu déroulant**. Paul, lui, cherchait le geste sur la
    branche qu'il venait de cliquer. Il ne l'a jamais rencontré.
  - 🔻 **Règle actée** : **une fonction qu'on ne rencontre pas là où on la
    cherche n'existe pas.** Une livraison ne se clôt pas sur « le code marche »
    mais sur « le geste est atteignable **depuis l'endroit où l'utilisateur le
    veut** ». Corollaire pour le cadrage EL ④ : un critère de réussite qui dit
    « le PATCH part avec le bon corps » est incomplet — il doit dire **d'où** le
    geste part. Les harnais D et E de `smoke-vranesh` étaient verts et prouvaient
    un dénouement… que Paul ne pouvait pas atteindre.
  - **Correctif** : le dénouement est porté par la branche (deux temps conservés,
    confirmation qui annonce le compte exact des branches coupées avant la
    coupe — la garde n'a pas été relâchée d'un pouce pour gagner en accès). Un
    thème dénoué **s'ouvre sur son dénouement** : futur advenu déplié d'emblée,
    en grand, sceau sur l'arbre, réouverture au lieu de coupe.
  - **Débord d'étiquettes de l'arbre, trouvé par une capture de vérification**
    (pas par Paul) : les branches de gauche sortaient du cadre. La règle du
    2026-08-01 nommait pourtant « l'arbre VRANESH » — elle n'y avait jamais été
    appliquée. Repère `240 → 300`, budget de signes calculé sur la place réelle
    de chaque côté (motif `couronne` de DRAUKHAIN, réemployé et non réinventé),
    `getBBox()` mesurée contre le `viewBox` + **pire cas construit** à 6 futurs
    interminables. 🔻 **Une règle permanente ne s'applique pas toute seule** :
    quand elle nomme des cibles, la première session qui touche une cible
    l'applique — sinon la règle n'est qu'un souvenir.
  - **Deuxième dictée du jour, boucle NON engagée** : « quand j'arrive sur
    VRANESH il faut m'afficher tout de suite LIANDRA et THORIOL […] réduire le
    texte au maximum, maximiser le visuel — ça me permet de vraiment visualiser
    […] ensuite quand je sélectionne une branche, là je peux avoir du texte,
    mais il y en a trop, c'est purement du texte brut. » Question de **forme** →
    **maquette avant le code** (`design/preview-vranesh-lecture.html`), méthode
    déjà éprouvée le 2026-08-01. Zéro ligne de production touchée tant que Paul
    n'a pas choisi. Reco de Léo : étage ① **forme C** (chaque thème montre SON
    arbre en réduction — l'image porte l'information au lieu de décorer un nom) ;
    étage ③ **forme A** (trois vignettes gravées ; B est plus beau mais coûte un
    clic et rétrécit sur téléphone). Chaque forme affiche **son nombre de mots à
    l'écran** : 48 aujourd'hui, 26 en A, 12 en B — un critère de réussite
    chiffré, pas un jugement esthétique.
- **2026-08-04 (VRANESH — l'image d'abord, le texte ensuite, PR #138)** — Paul,
  sur la maquette comparative : « pour les arbres miniatures option C, mais
  j'aimais bien l'idée d'avoir la rosace. J'arrive sur VRANESH et la rosace,
  **juste** [ses deux thèmes] […] ensuite quand je clique dessus, c'est là où je
  vois les ramifications. […] Option A pour l'étage 3, oui. »
  - **Formes actées** : ① **la rosace** à l'arrivée (les noms seuls) ; ② l'arbre
    au clic (inchangé, tranché le 2026-08-01) ; ③ **la forme A**, une vignette
    par nature d'information avec son icône gravée.
  - **L'arbitrage qui aurait pu se rater** : la première phrase approuvait la
    forme C (les arbres miniatures), la troisième décrivait un flux où ils
    n'apparaissent qu'**au clic**. C'est le mot « **juste** » qui tranche — « la
    rosace, juste tel et tel thème ». 🔻 **Règle** : dans une dictée qui semble
    se contredire, chercher le **quantificateur** (juste, seulement, tout de
    suite, d'abord) — il porte l'intention mieux que le nom de l'option citée.
  - 🔻 **Un dépouillement se MESURE, comme une géométrie.** « Réduire le texte au
    maximum » n'est pas vérifiable ; **47 mots visibles à l'arrivée et aucun bloc
    de plus de 12 mots** le sont. Deux bornes et non une : un total bas peut
    cacher un pavé, un pavé absent peut cacher un total qui enfle. La mesure
    compte le texte **réellement rendu** — `checkVisibility` et non
    `offsetParent`, parce qu'un `<details>` fermé masque son contenu par
    `content-visibility` sous Chromium (première version : 250 mots comptés au
    lieu de 47).
  - **Le harnais a repris son propre auteur** : la règle « une confidentialité se
    teste par l'ABSENCE » a fait échouer un commentaire HTML où Léo avait
    recopié les noms des thèmes de Paul. Gardé tel quel — une règle qui ne mord
    que les autres ne sert à rien.
  - ⭐ **PREUVE PAR L'USAGE RÉEL** : Paul a exercé le dénouement lui-même sur ses
    données depuis la preview — session réelle, RLS réelle, coupe réelle et
    irréversible — et a répondu « c'est exactement ça ». C'est la preuve que le
    harnais déclare hors de sa portée depuis le premier jour.
    ⚠️ **Conséquence à ne plus oublier** : **une preview Vercel écrit dans les
    VRAIES données** (mêmes clés Supabase que la production). Une preview n'est
    pas un brouillon. Le dire à Paul chaque fois qu'elle porte un geste
    destructif, avant qu'il ne l'exerce.
- **2026-08-04 (DRAUKHAIN — état des lieux et cartographie, boucle OUVERTE)** —
  Paul : « d'abord on va faire un état des lieux de ce que ça fait, quel est
  l'objectif, quelles sont les passerelles avec ce qui existe. C'est plutôt un
  souci de forme que de fond, parce que j'aime bien l'outil, mais je pense que
  la forme n'est pas adaptée. Essayons de faire quelque chose de plus visuel —
  comment faire une belle cartographie. »
  - **Gate d'entrée EL tenu, et il a servi** : la dictée ne nommait pas l'outil.
    Quatre candidats plausibles (ADRAMELECH, DRAUKHAIN, VRANESH, l'accueil) →
    question posée au lieu de deviner. Réponse : **DRAUKHAIN**. Sans le gate, la
    boucle partait sur la carto des idées — le mauvais outil, tout le travail
    perdu. 🔻 **Une dictée qui ne nomme pas sa cible est un cadrage incomplet,
    pas une instruction à interpréter.**
  - **L'état des lieux a été CHIFFRÉ, pas raconté** : comptes relevés en base
    (sans lire une ligne d'intime, §5) — **1 serment, 0 flamme, 0 lien sortant,
    1 lien entrant depuis VRANESH**. C'est ce chiffre qui donne le vrai
    diagnostic : le foyer, sa couronne, son halo croissant, ses natures qui
    brûlent plus ou moins haut — **toute la grammaire est du code qui ne
    s'exprime jamais**. 🔻 **Une forme se juge sur le volume RÉEL de données
    qu'elle porte, pas sur celui qu'elle anticipe.**
  - **Constat qui vaut au-delà de DRAUKHAIN** : `GET /api/serments` ne replie
    que les liens **sortants**. Le fil entrant depuis VRANESH existe en base et
    n'a **aucune représentation**. 🔻 **Une passerelle n'est établie que si elle
    se voit des DEUX côtés** — la moitié d'un pont n'est pas un pont. À
    re-vérifier sur les autres passerelles (R↔Z, scénario→page).
  - **Trois formes livrées en maquette** (`design/preview-draukhain-carto.html`,
    zéro production touchée) : **A la voûte** (reco — la seule qui traite à la
    fois l'absence de vue d'ensemble et l'invisibilité des fils), **B le
    brasier** (la plus belle, mais pas de place pour les fils — or c'est
    justement ce qui manque), **C la frise** (la plus solide en volume, mais une
    liste reste une liste).
  - 🔻 **La règle du 2026-08-01 était incomplète, elle est complétée** : mesurer
    la bbox contre le viewBox ne suffit pas. La forme A est passée « au vert »
    alors que **deux étiquettes se croisaient plein Nord** — dans le cadre, donc
    invisibles au critère, et illisibles à l'œil. **Un dessin se mesure aussi en
    CROISEMENTS** : chaque paire d'étiquettes, et chaque étiquette contre les
    cartouches. Critère ajouté à la maquette, éprouvé aux volumes 1/5/12 sur
    desktop et mobile.
  - 🔻 **Trouvaille de dernière minute, et elle vaut pour tout le patrimoine
    `design/`** : le CSP d'Ultima pose `script-src 'self'` **sans**
    `'unsafe-inline'`, et le middleware l'applique à **tous** les chemins servis,
    `/design/*` compris. Une maquette à `<script>` inline s'ouvre donc **muette**
    sur la preview Vercel — le décor s'affiche, le dessin non. La maquette du
    jour a été corrigée (script sorti dans `preview-draukhain-carto.js`) et la
    conformité **prouvée par l'absence** : page rejouée avec l'en-tête CSP réel
    injecté → zéro violation, 12 feux dessinés. **Cinq maquettes antérieures
    sont dans le même cas** (`preview-draukhain-formes`, `preview-imladrik-boussole`,
    `preview-lv3-boussoles`, `preview-vranesh-arbre`, `preview-vranesh-lecture`).
    ⏳ **Registre — à la main de Paul** : une passe d'extraction les remettrait
    toutes en état (hors boucle en cours, discipline EB).
    🔻 **Leçon** : un livrable qu'on demande à Paul d'ouvrir se vérifie **dans
    les conditions où il l'ouvrira**, pas seulement en local — le local n'a pas
    de CSP.
- **2026-08-04 (DRAUKHAIN — la voûte livrée, deux serments réels)** — Paul :
  « on travaille DRAUKHAIN. En fait c'est ça, sur deux serments : on va tester
  cette refonte de l'affichage. Le premier, ne plus jamais perdre mon calme —
  et j'ai un très bon exemple. Ce qu'on peut associer à chaque serment, on peut
  associer une date, une petite histoire, histoire d'étayer. Le deuxième,
  toujours rechercher la vérité et avoir la force et le courage de le dire. »
  - **Arbitrages** : forme **A (la voûte)** ; la date **sur la flamme**.
  - **Réponse au besoin « une date, une petite histoire »** : l'histoire avait
    déjà sa place — la flamme de nature *victoire* (0016), faite pour ça. Le
    manque était **la date de l'ÉVÉNEMENT** : une flamme ne portait que
    `created_at`, la date de son écriture. Migration `0020` écrite (colonne
    `survenu_le date`, additive, RLS inchangée), **non appliquée — gate**.
    🔻 **Réflexe à garder** : quand Paul demande une capacité, chercher d'abord
    ce qui la porte déjà à moitié — le correctif est alors une colonne, pas un
    objet de plus.
  - **COLLISION DE SESSIONS, et ce qu'elle enseigne** : pendant que cette boucle
    tournait, un **autre fil** a livré la PR **#140 — « le retour de la
    passerelle depuis VRANESH »**, c'est-à-dire *le même constat ⑤*, résolu
    autrement : jointure **côté serveur** dans `api/serments.js`, qui sert des
    `futurs` déjà recousus (`rapport`, `deroule`, `theme`, `advenu`). J'avais,
    moi, lu `/api/situations` depuis le front. Au rebase, **j'ai adopté leur
    mécanique et supprimé la mienne** — la leur est meilleure (un appel réseau
    de moins, le thème et l'advenu joints à la source) et surtout elle était
    **déjà dans `main`**. La voûte lit `futursDe()` comme la fiche.
    🔻 **Règle : quand deux sessions résolvent le même constat, celle qui est
    déjà fusionnée gagne — on rebrase dessus, on ne défend pas son code.** Et
    corollaire de méthode : mon constat ⑤ annonçait le défaut sans annoncer que
    quelqu'un d'autre pouvait être en train de le corriger. **Avant d'ouvrir une
    boucle sur un cap, regarder les PR ouvertes du même cap.**
  - **Ce qui reste vraiment de ma part sur la passerelle** : elle se voit
    maintenant **sur la carte** (fil tissé vers VRANESH, rapport dit dans la
    parole, futur advenu signalé), là où #140 la montre **dans la fiche**. Les
    deux sont complémentaires — et les deux sections de harnais ont été gardées,
    par concaténation, jamais par arbitrage.
  - 🔻 **DEUX défauts trouvés par la MESURE, aucun par l'œil** — et c'est la
    leçon du jour :
    ① À douze serments en capitales, une étiquette **débordait de 7 px**. Le
    budget de signes de la couronne *estime* une largeur moyenne ; une capitale
    est plus large. Correctif : après l'estimation, on **mesure le texte
    réellement tracé** et on retire des signes tant qu'il dépasse.
    ② Ce correctif a alors **vidé toutes les étiquettes** : `rendreVoute`
    tournait pendant que le registre était encore `hidden`, où **`getBBox()`
    vaut zéro** — chaque nom était raboté jusqu'au vide. La page se **montre**
    donc avant d'être dessinée. 🔻 **Une mesure prise dans un conteneur masqué
    n'est pas une mesure, c'est un zéro qui a l'air d'une mesure.**
  - 🔻 **Le harnais avait un trou, et il est bouché** : « tout tient dans le
    cadre » et « aucun croisement » passaient **aussi** sur une carte dont
    toutes les étiquettes étaient vides. Un critère de non-débordement ne dit
    rien de la lisibilité. Ajouté : **la carte NOMME ses serments** (≥ 10 sur 12).
    Vaut pour toute mesure future : vérifier qu'on n'a pas satisfait le critère
    en supprimant ce qu'il mesurait.
  - **Chaque vue a désormais UN travail** : la voûte l'ensemble, le foyer un
    serment, le registre l'écriture. La rangée de boutons du foyer disparaît —
    c'était la troisième liste des mêmes noms. « Sceller un serment » passe
    derrière la carte (miroir de « l'image d'abord », VRANESH).
  - **Les deux serments de Paul sont scellés en base.** ⏳ Reste à sa main :
    l'histoire de l'exemple vécu cette semaine, et le go sur `0020`.
- **2026-08-04 (la date de ce que la flamme raconte — « ok go » de Paul)** —
  Migration `0020` **APPLIQUÉE en prod** (gate levée par le go explicite) :
  `flammes.survenu_le date`, optionnelle, additive, RLS inchangée.
  - **Ce que la boucle a refusé de faire** : ni nouvelle table, ni nouvelle
    nature de flamme, ni date de scellement sur le serment. Le besoin de Paul
    (« une date, une petite histoire, histoire d'étayer ») était couvert **aux
    trois quarts** par la flamme de nature *victoire* — il manquait **une
    colonne**. 🔻 **Chercher ce qui porte déjà le besoin à moitié avant
    d'inventer l'objet qui le porterait en entier.**
  - **La validation est le MIROIR EXACT du CHECK**, pas une approximation :
    `estJourPasse` exige `AAAA-MM-JJ` strict, relit la date pour la comparer à
    elle-même (le 31 février tombe là), et borne à **J+1** — la même tolérance
    d'un jour que le CHECK, qui absorbe l'écart de fuseau client/serveur sans
    ouvrir la porte à une date inventée. Une flamme peut raconter l'enfance,
    jamais demain : **une victoire qui n'a pas eu lieu n'étaye rien.**
  - **Preuve par l'ABSENCE aux DEUX bouts** : aucune clé `survenu_le` n'est
    envoyée quand le champ est vide (le contrat refuse les champs inconnus, pas
    les absents), et une flamme sans date n'affiche aucune date. Vérifier la
    présence du permis n'aurait rien prouvé.
  - **La date se LIT là où on la cherche** : posée avant le texte de la flamme,
    en français. Application directe de la leçon du 2026-08-04 (« une fonction
    qu'on ne rencontre pas là où on la cherche n'existe pas ») — le champ de
    saisie sans l'affichage aurait été la même faute que le dénouement VRANESH
    caché dans un menu déroulant.
- **2026-08-04 (la première flamme d'Ultima)** — Paul a dicté sa victoire ; elle
  est consignée en flamme **victoire** datée du **2026-08-03** sur le serment
  « ne plus jamais perdre mon calme ». **Comptes seuls ici (§5)** : le texte de
  la flamme vit en base, derrière RLS, et n'est recopié dans aucun document —
  pas même dans ce journal, qui n'est pourtant pas déployé. La règle ne se
  relâche pas parce que le fichier est privé.
  - **État du cap** : 3 serments, dont **1 vivant** — le tout premier. Les deux
    autres restent « à raviver », c'est-à-dire en attente d'un souffle, pas en
    défaut.
  - **Ce que la boucle du jour a réellement prouvé** : la chaîne complète a
    fonctionné du premier coup sur de la donnée réelle — colonne `0020`, champ
    de saisie, validation miroir, affichage. La date de l'événement (hier) est
    **distincte** de la date d'écriture (aujourd'hui) : c'était tout l'objet de
    la migration, et c'est vérifiable à l'œil sur la fiche.
  - 🔻 **Une ambiguïté de dictée signalée, pas devinée** : « je l'ai accepté, je
    n'ai pas écouté » suivi de « j'ai écouté Liandra jusqu'au bout ». Lecture
    retenue et annoncée à Paul : le premier « écouté » porte sur **la fureur** —
    accueillie sans être suivie. Sur un contenu intime, on annonce
    l'interprétation au lieu de la fondre silencieusement dans le texte.
- **2026-08-04 (THORIOL — la greffe, et un CHECK qui ne mordait pas, PR #142)** —
  Paul : « THORIOL a besoin de se construire […] il correspond à un élément de la
  terre […] ce n'est pas une direction comme LIANDRA, c'est une construction, et
  l'idée c'est de toujours avoir des plans B […] anticiper les causes d'échec,
  mais bien surtout anticiper l'adaptation à un nouveau plan — comment faire
  pousser une nouvelle branche, même projet. »
  - **La FORME SUIT LA NATURE.** VRANESH dessinait tous les thèmes en arbre.
    Deux natures cohabitent : `direction` (un futur t'arrive, l'un pousse) et
    `construction` (le but ne bouge pas, les MOYENS cassent). 🔻 **Ce que l'arbre
    ne savait pas dire : un plan PRÊT MAIS PAS ENCORE EMPLOYÉ.** C'est pourtant
    la définition d'un plan B — et c'est ce vide qui a justifié une forme neuve,
    pas un goût esthétique.
  - ⚠️ **Le piège évité de justesse** : sur une construction, le dénouement
    aurait supprimé les branches non retenues — **c'est-à-dire les plans B**,
    exactement ce que le thème existe pour garder. Vu **en capture de
    vérification**, fermé partout, prouvé par deux assertions d'ABSENCE.
    🔻 **Une fonction juste ailleurs peut être destructrice ici** : toute
    fonction transversale se re-questionne quand on ajoute une nature d'objet.
  - 🔻 **RÈGLE MAJEURE DU JOUR — une contrainte se teste PAR LE REFUS, et sur le
    cas NULL d'abord.** `0020` posait
    `check (cause is null or etat = 'ecarte')`. Sur un plan non qualifié
    (`etat` NULL) : `false OR NULL` = NULL, et **un CHECK ne rejette que sur
    FALSE**. La contrainte ne refusait donc rien, précisément là où elle
    prétendait protéger. Elle **se lit juste** — aucune relecture ne l'attrape.
    Trouvée en jouant, tout de suite après l'application, un UPDATE illégitime
    attendu en échec… qui a réussi. Corrigée par `0021`
    (`is not distinct from`, qui ne renvoie jamais NULL), les DEUX sens éprouvés
    ensuite, sans laisser une écriture (sondes annulées au savepoint).
    C'est l'extension directe de « une règle de confidentialité se teste par
    l'ABSENCE » (2026-07-30) : **la logique ternaire SQL laisse passer en
    silence ce qu'on croit interdire.**
  - 🔻 **Une migration appliquée ne se réécrit pas, elle se corrige par la
    suivante.** `0020` est conservée fautive et ANNOTÉE ; `0021` porte le
    correctif. Sinon le repo ment sur ce qu'est la prod.
  - **Gate advisors fermée** (ouverte depuis le 2026-08-01) : Security et
    Performance sans alerte après `0019`/`0020`/`0021` ; RLS contrôlée par Paul
    (active partout, 4 policies par table).
  - **Deux sessions en parallèle sur DRAUKHAIN, sans un seul conflit** : diffs
    comparés AVANT fusion (aucun fichier commun), et le constat ⑤ du fil voisin
    — « la passerelle est borgne » — s'est trouvé **fermé par la PR #140 du fil
    VRANESH le même jour**. 🔻 **Deux fils qui diagnostiquent la même chose ne se
    doublent pas : le premier qui corrige doit ANNOTER le constat de l'autre**,
    sinon la source de vérité garde une phrase fausse.

- **2026-08-06 (ALTHEA — ouverture du quadrant, cadrage B0)** — Paul dicte un
  **nouveau quadrant Lv3, ALTHEA** : le suivi **ludique** des performances
  physiques et psychiques. Un **cadran unique** (pas une boussole) portant des
  unités qui **montent par paliers** et débloquent des **récompenses** — la garde
  (pas de tabac, pas d'alcool) et la pratique (japonais, espagnol, sport).
  Remplissage quotidien **ou** hebdomadaire, **explicitement non obligatoire**,
  « rigolo à remplir ». Finalité assumée : le jeu est le **moyen**, l'amélioration
  réelle des skills est le but. Cadrage complet : `CADRAGE-ALTHEA.md` — **zéro
  code, zéro migration** (gate EL tenu).
  - 🔻 **Trois collisions relevées AVANT de construire, aucune trouvée en codant.**
    ① **Le mot « talent » est déjà pris** par RESHIRAM (table `talents`, `0009`)
    avec un sens **opposé** : savoir-faire *prouvé et statique* contre unité
    *entraînée et progressive*. Proposition : l'unité d'ALTHEA est **une
    DISCIPLINE**. ② **« Je n'ai pas fumé aujourd'hui » frôle DRAUKHAIN** :
    frontière écrite — DRAUKHAIN est **la volonté** (*pourquoi je tiens*, un
    récit), ALTHEA est **la mesure** (*combien de fois j'ai tenu*, une marque).
    ③ **Un cadran n'est pas une boussole** : ALTHEA reste une **feuille**
    (règle Lv3 §2.1), et son anneau de progression est ce qui le distingue
    visuellement d'une rose de caps.
  - 🔻 **La règle qui décide de la vie du quadrant** : *un jour non renseigné
    n'est pas un échec*. Trois états (nourri / manqué déclaré / non renseigné),
    le troisième ne s'infère jamais dans les deux autres, et **un rang acquis ne
    se perd jamais**. Un *streak* qui remet à zéro punirait exactement ce que
    Paul a posé comme condition (« ce n'est pas obligatoire ») — il se ferait
    abandonner en trois semaines. L'élan respire, il ne détruit rien.
  - 🔻 **Le palier compte des JOURS, pas des points.** Un point est arbitraire et
    se gonfle ; un jour est un fait. Les minutes ornent (« 42 h de japonais »),
    elles ne font pas monter le rang — sinon on récompense qui **déclare** des
    heures, pas qui pratique.
  - 🔻 **ALTHEA porte la donnée la plus sensible d'Ultima** (santé, addictions,
    psychisme). Conséquence sur un contrat existant : **les yeux de Léo**
    (`/api/leo`, champ `etat`) transportent aujourd'hui « comptes **et intitulés**
    bornés » — pour ALTHEA, **les intitulés sont exclus**, seuls des comptes
    partent, parce que l'intitulé *est* l'information (« garde du tabac » dit
    tout). Exception à écrire dans `validerEtatQuadrant`, pas une consigne de
    prudence. Preuve par l'ABSENCE aux quatre sorties (IA, cockpit, HTML, logs).
  - **Décisions attendues de Paul (D1→D4 bloquantes)** : l'accroche (quadrant
    sous **NAGA**, reco) · le mot (**discipline**, reco) · le moteur (**cumul +
    élan**, reco) · le périmètre v1 (**disciplines seules**, les jauges
    physique/psychique sont une courbe et non un rang → boucle suivante).
  - **Deux passages de la dictée signalés au lieu d'être devinés** : « une arme
    de capacité » → lu *arbre de capacités* ; « combien de temps je suis bien en
    ma science de sport » → lu *où j'en suis dans ma pratique du sport*.

- **2026-08-06 (ALTHEA — les quatre décisions, prises le jour même)** —
  ① **L'accroche** : Paul refuse GRIMA (« ce qui est utile ») ET NAGA (« ce qui
  fait grandir ») — *« tout seul : c'est un autre système, car c'est plutôt un
  jeu qu'autre chose »*. ALTHEA ne se range sous aucune devise. **Précision
  encore due** : racine (à côté d'ULTIMA et ALPHA, 1 clic) ou troisième cadran
  d'ULTIMA (à côté de GRIMA et NAGA, 2 clics) — reco Léo : la racine, un jeu
  quotidien se doit d'être à un clic. ② **Le mot : SKILL** (mot de Paul).
  La collision avec les `talents` de RESHIRAM se tranche par le registre —
  *skill* = le jeu, *talent* = le prouvé ; la table `talents` n'est pas touchée.
  **Conséquence de langue actée** : ALTHEA est le SEUL endroit d'Ultima où
  l'anglais est admis, parce que c'est le seul endroit qui est un jeu.
  ③ **Le moteur : cumul + élan** (le rang ne se reperd jamais).
  ④ **Périmètre v1** : *« on livre les skills : leurs noms, et ce qu'il y a
  dedans »*.
  - 🔻 **RÈGLE MAJEURE DU JOUR — une réponse de cadrage peut CORRIGER le modèle,
    et c'est le but du gate.** Le « ce qu'il y a dedans » de la réponse ④ a
    révélé que le premier modèle écrasait **deux étages en un seul**. Relecture
    de la dictée d'ouverture à sa lumière : *« le talent, ce sera peak
    performance […] je n'ai pas fumé, je n'ai pas bu d'alcool »* — **peak
    performance n'est pas un compteur, c'est un contenant**, et les deux
    abstinences sont deux **gestes** qui le nourrissent. D'où : **le SKILL**
    (nom, blason, rang, paliers — le seul étage qui progresse) contient **des
    GESTES** (ce qu'on coche, sans rang). Sans cette question posée, on livrait
    soit un skill par geste (écran de bricoles), soit un skill flou qu'on ne
    sait pas cocher. *Le gate d'entrée EL ne sert pas à valider un plan : il
    sert à ce que le plan change tant que c'est gratuit.*
  - **Corollaire mécanique** : un skill porte une **règle de nourriture** —
    `tous` (le jour compte si TOUS ses gestes sont tenus : le bon réglage pour
    peak performance, une journée sans tabac mais arrosée n'en est pas une) ou
    `un` (au moins un geste : le bon pour « sport », plusieurs portes). Deux
    valeurs, pas de seuil chiffré.
  - 🔻 **Piège trouvé en écrivant le modèle, invisible depuis l'écran** :
    désactiver un geste **réécrirait le passé** (un jour jadis « à moitié tenu »
    deviendrait « tenu »), donc **le rang bougerait tout seul** — violation de la
    règle « un rang acquis ne se perd jamais », dans les deux sens. Parade :
    `actif=false` ne vaut qu'à partir du jour de la désactivation ; le calcul
    d'antériorité ne considère que les gestes actifs **à la date du jour
    considéré**.

- **2026-08-06 (ALTHEA — seconde dictée : le Système)** — Paul change la nature
  du quadrant : ALTHEA devient **un Système, style Solo Leveling**. Un
  **avatar** portant **un titre** qui compte (« j'ai un titre important »), des
  **quêtes principales / secondaires / de fond**, des quêtes **générées** par le
  système avec leurs **allongements** « au fur et à mesure », des
  **récompenses**, des skills qu'on **débloque**, des **quêtes qui donnent des
  skills**, des **rappels automatiques d'entraînement**, des **widgets d'écran
  d'accueil**. Consigne : *« un travail d'étude, analyse et cadre bien tout ça »*,
  *« va chercher loin »*, **« un système complet, à la fois proactif et passif »**.
  Cadrage complet réécrit : `CADRAGE-ALTHEA.md` (5 parties) + maquette
  `design/preview-althea-systeme.html`. **Zéro code produit, zéro migration.**
  - 🔻 **RÈGLE MAJEURE — le Système n'est PAS un personnage, c'est un
    INSTRUMENT.** Le principe verrouillé du 2026-07-16 (« l'agent unique
    d'Ultima est Léo ») allait sauter : un Système qui converse est une seconde
    voix. Résolution : **le Système n'a pas d'avis, il ANNONCE** — des gabarits
    fixes en clair dans le code, `[ RANG ATTEINT — LA CONSTANCE ]`. **Léo
    compose** (elle connaît Paul), **le Système annonce**. Bénéfices non
    anticipés mais décisifs : toutes les annonces deviennent **gratuites,
    hors-ligne et testables au harnais** ; seule la composition d'une quête
    coûte un appel IA, donc **une seule chose est à borner**.
  - 🔻 **La collision la plus dangereuse : « quête principale » contre ZEKROM et
    DRAUKHAIN.** Un grand objectif de vie a DÉJÀ deux maisons dans Ultima.
    Laisser le jeu s'en remplir, c'est reconstruire un tiers d'Ultima dedans et
    obtenir **deux vérités contradictoires** sur ce que Paul veut. Frontière
    écrite : **une quête ALTHEA ne porte QUE de l'entraînement de soi** ; une
    quête principale **référence** un idéal ZEKROM / un serment DRAUKHAIN, elle
    ne le recopie pas. *« Ton idéal entre dans l'arène »* — c'est ce qui donne
    au jeu sa gravité au lieu de le faire flotter à côté du réel.
  - 🔻 **Le widget iPhone n'existe pas — vérifié AVANT d'être promis.** iOS
    n'accorde **aucune tuile-widget** à une application web. Ce qui est réel :
    la PWA installée + **le badge chiffré sur l'icône** (`setAppBadge`), qui est
    presque mot pour mot ce que Paul décrivait (« 4 à continuer »). Voie
    alternative pour un vrai widget : l'app tierce **Scriptable** + une route
    signée — **prix dit franchement** : ce serait la première clé d'Ultima posée
    hors de sa propre session. *Une étude qui promet ce que la plateforme
    refuse n'est pas une étude, c'est une vente.*
  - **Rappels** : faisables (PWA installée + service worker + Web Push VAPID +
    cron). **Rien de tout ça n'existe** aujourd'hui (aucun service worker, aucun
    cron dans `vercel.json`). Le cron est une **gate coût** → décision de Paul.
    Règle absolue posée : **une notification ne nomme JAMAIS un geste** (elle
    s'affiche sur l'écran verrouillé, devant n'importe qui).
  - **Proactif/passif défini au lieu d'être invoqué** : le passif doit être
    **beau à retrouver après deux semaines d'absence**, jamais accusateur ; le
    proactif obéit à une **loi des interpellations** — une par jour maximum,
    toujours actionnable, jamais culpabilisante, coupable en un geste, et le
    silence est une réponse valide.
  - **Graphisme, « chercher loin »** : la vraie trouvaille est que Solo Leveling
    et Ultima **partagent déjà la grammaire** (capitales espacées, cartouche,
    voix rituelle, blocs de stats) — **il ne manquait que l'apparition et la
    nuit**. D'où la thèse **« l'antique vu de nuit »** : ALTHEA est la seule page
    d'Ultima sur fond nocturne ; **l'or reste l'or pour ce qui est GAGNÉ, le bleu
    spectral est réservé à la VOIX du Système** et n'existe nulle part ailleurs.
  - 🔻 **La mesure a encore trouvé ce que l'œil ne pouvait pas voir** : sur la
    maquette, les anneaux de progression se dessinaient **à 700 px hors du
    viewBox de 380** — donc invisibles. Cause : en SVG, `transform-origin:
    center` se rapporte au **viewBox** (valeur initiale de `transform-box`), pas
    à l'élément ; il faut `transform-box: fill-box`. Trouvé par `getBBox()` vs
    `viewBox`, jamais à l'œil. Contrastes des DEUX formes mesurés au passage :
    tous **AA**, y compris le texte secondaire (4.91 au plus bas).
  - **Séquencement acté en CINQ boucles** (B1 le personnage et ses skills · B2
    le journal des quêtes · B3 la composition par Léo · B4 l'interpellation ·
    B5 le widget), parce que les vouloir ensemble, c'est n'en finir aucune.

- **2026-08-06 (ALTHEA — les cinq arbitrages qui ferment B0)** — Paul tranche :
  **forme B** (le Système spectral) · **Léo pilote le Système** · **ALTHEA est
  autonome** · **les skills viennent de Paul OU de Léo en récompense de quête**
  · **endormissement + un peu de sévérité** · **3ᵉ cadran d'ULTIMA Lv3**.
  Cadrage mis à jour, maquette passée en forme unique. B0 **CLOS**.
  - 🔻 **DEUX réponses sur cinq ont CORRIGÉ le cadrage au lieu de le
    confirmer** — et ce sont les deux qui comptent.
    ① **« On garde Léo dans le Système, c'est Léo qui pilote. »** J'avais sauvé
    le principe de l'agent unique en faisant du Système un **instrument**
    impersonnel. Correct sur le fond, **incomplet** : Paul veut Léo **visible et
    aux commandes**, pas cachée derrière une machine. Il écrit lui-même « Léo
    (le système) ». Formulation retenue : **le Système, c'est Léo en tenue de
    jeu** — deux registres de parole (elle *conseille* dans son cartouche, elle
    *proclame* entre crochets), **une seule voix**. Conséquence d'écran : le
    cartouche de Léo est **obligatoire** dans ALTHEA.
    ② **« Je ne veux pas forcément de liens avec le reste d'Ultima : c'est un
    jeu pour la vie quotidienne, très réel et concret. »** J'avais résolu la
    collision « quête principale vs ZEKROM/DRAUKHAIN » par **un lien** (la
    quête référence un idéal). Paul choisit l'inverse : **l'autonomie**. La
    frontière tient désormais par la **nature** de ce qu'on y met, pas par une
    référence — **test d'appartenance : est-ce que ça se coche un soir ?** Si ça
    se médite, c'est ailleurs. Colonnes `ideal_id`/`serment_id` supprimées.
    *Bénéfice non cherché et considérable : **ALTHEA devient livrable seul**,
    sans qu'aucun autre quadrant n'ait à bouger.*
  - 🔻 **LA SÉVÉRITÉ — « ok pour l'endormissement, mais aussi un peu de
    sévérité si je rate trop souvent ».** Le défi : mordre sans violer « le
    silence n'est pas une faute ». **La ligne qui rend les deux compatibles :
    la sévérité ne vient JAMAIS du Système, elle vient d'un engagement que Paul
    a pris.** On ne peut manquer que ce qu'on a **accepté**. Mécanisme : **LE
    GEL** — trois quêtes acceptées puis laissées (ni reprises ni rangées) et le
    Système se ferme : plus aucune quête proposée (*on ne charge pas une table
    déjà pleine*), le titre **suspendu** et remplacé par **« En dette »**, la
    lumière qui tombe. **Rien n'est perdu** : rangs, jours nourris, élan, skills
    débloqués, titres obtenus — intacts. Le gel **touche l'ornement et le flux,
    jamais l'acquis**, et se lève en un geste par quête. *Une sanction dont on
    ne peut pas sortir n'est pas une sanction : c'est une raison d'arrêter de
    jouer.*
  - **L'origine des skills règle un faux bloquant** : puisque Léo peut en offrir
    en récompense, **la liste de départ n'a plus besoin d'être complète**. Quatre
    skills suffisent, **le reste se gagne**. Un skill offert est la plus forte
    récompense du jeu : elle ne se consomme pas, elle **ouvre**.
  - 🔻 **Piège de modèle évité** : la tentation d'une colonne `dette` sur
    l'avatar. Un compteur stocké se désynchronise — et ici il se
    désynchroniserait **en punissant** (gelé sans raison, ou dégelé à tort).
    La dette et le gel sont **entièrement dérivés** de l'état des quêtes.
  - **Place tranchée** : `ultima-perso.enfants = ['grima', 'naga', 'althea']` —
    ALTHEA ne relève ni de « ce qui est utile » ni de « ce qui fait grandir ».

- **2026-08-06 (ALTHEA — les skills RÉELS, et la troisième correction du modèle)** —
  Paul dicte ses cinq skills, son personnage, et signale un défaut d'affichage.
  - 🔻 **LA RÉVÉLATION : un skill n'est pas un compteur, c'est un ÉNONCÉ.**
    Paul n'écrit pas « japonais : 30 min », il écrit **« le joueur sait parler
    au moins 2 langues à haut niveau »**. Un skill est **une phrase au présent,
    sur le joueur**, vraie ou non aujourd'hui. Le compteur n'est plus le but :
    il est **la preuve que l'énoncé tient**. Champ `enonce` de premier rang.
  - **Les cinq skills** : **PEAK PERFORMANCE** (« le joueur est au top de sa
    forme ! » — substance externe, sommeil, écran, alimentation, sport tous les
    2 jours) · **PIEDS LÉGERS** (« court au moins 10 km par semaine ») ·
    **TRADUCTEUR** (« sait parler au moins 2 langues à haut niveau » — italien
    OU espagnol OU japonais, 30 min/jour) · **OMNIVORE** (« peut manger de
    tout » — légumes chaque jour, 4 repas) · **CONSTANCE** (« se relève toujours
    après avoir chuté, ne reste pas au sol »).
  - 🔻 **QUATRE mécaniques qu'aucune spéculation n'avait vues** — cinq exemples
    réels ont suffi là où trois jours de cadrage n'auraient pas suffi :
    ① **les CADENCES** — mon modèle ne savait dire que *quotidien* ; il en faut
    quatre de plus (`tous_les_n_jours`, `volume_semaine`, `duree_jour`,
    `n_par_jour`). ② **les conditions en OU** (italien/espagnol/japonais) : la
    règle `un`/`tous` monte d'un cran, au niveau d'un **groupe**. ③ **l'ÉVOLUTION
    d'un skill** — TRADUCTEUR → TRADUCTEUR UNIVERSEL : c'est **l'arbre de
    capacités** de la première dictée qui apparaît enfin. ④ **le MÉTA-SKILL** :
    CONSTANCE ne lit aucun geste, elle lit **l'état des autres skills**.
  - 🔻 **ACQUIS ≠ TENU — la règle cardinale 2 s'énonce plus précisément.**
    « Le joueur court 10 km par semaine » est vrai ou faux **cette semaine**. Un
    skill peut donc **dormir** sans que rien ne soit perdu : rang, semaines
    tenues, meilleur élan restent gravés. **L'acquis ne se perd jamais ; l'état,
    lui, respire.** Un skill en sommeil n'est pas une faute — c'est une phrase
    qui n'est pas vraie aujourd'hui.
  - ⚠️ **Collision de noms** : le skill **CONSTANCE** contre le rang II **La
    Constance**. Le skill de Paul gagne ; le rang à renommer (**L'Assiduité**
    proposé). ✅ **Convergence heureuse au même endroit** : *Constance* — « se
    relever après avoir chuté » — **est exactement** le titre « Celui qui
    revient » proposé la veille. Les deux fusionnent au lieu de se doubler.
  - **Le personnage** : **Paul Gerard, niveau 48, titre *Farsight — celui qui
    voit loin***. Conséquence : **le titre de départ n'est pas « Sans titre »**
    et le niveau ne part pas de 1 — Paul entre dans le jeu avec un **socle
    déclaré**. On n'entre pas dans sa propre vie au niveau 1.
  - **Les APTITUDES** : Paul annonce un second registre après les skills (« on va
    les faire »). **Non inventé** — la maquette lui réserve un cadre vide et
    ANNONCÉ, et la question est posée. *Un cadre vide assumé vaut mieux qu'un
    remplissage à sa place.*
  - 🔻 **Défaut d'affichage signalé par Paul, puis MESURÉ** : « chevauchement de
    caractères au milieu ». Diagnostic chiffré par comparaison des boîtes
    englobantes — **les chiffres de rang mordaient leur propre anneau de 4 px**
    (le trait compte : `stroke/2` s'ajoute à la `getBBox`). Corrigé, et **le cap
    plein Nord écrit désormais vers l'EXTÉRIEUR** de la rose — le faire écrire
    vers le bas l'amenait sur le cœur. Second défaut trouvé dans la foulée, que
    personne n'aurait vu : le nom du cap Nord sur deux lignes **sortait du cadre
    de 3 px** — le SVG écrête **en silence**. *L'œil de Paul a trouvé le
    symptôme ; seule la mesure a trouvé les deux causes.*

- **2026-08-06 (ALTHEA — Vitruve, et les aptitudes qui trouvent leur place)** —
  Paul dicte quatre ajustements : **avatar en homme de Vitruve schématisé**
  (« fais-moi des propals ») · **enlever les élans** de la fiche · **ajouter les
  aptitudes** · **étiqueter le titre** avant Farsight.
  - 🔻 **LA TROUVAILLE DE LA DICTÉE — Vitruve EST une carte du corps.** Les deux
    demandes (l'avatar et les aptitudes) sont arrivées dans la même phrase, et
    elles se répondent : **l'avatar devient la carte des aptitudes.** Cinq nœuds
    de lumière sur la figure — tête, poitrine, cœur, ventre, membres — chacun
    brillant à la mesure de l'aptitude qui y siège. *Le sceau du personnage
    cesse d'être une illustration : il devient un instrument de lecture.*
    Trois propositions maquettées (A fidèle, B épuré, **C des aptitudes**, reco).
  - **Les cinq aptitudes proposées**, une par skill : **ESPRIT** (tête ←
    Traducteur) · **SOUFFLE** (poitrine ← Pieds légers) · **VOLONTÉ** (cœur ←
    Constance) · **RACINE** (ventre ← Omnivore) · **VIGUEUR** (membres ← Peak
    performance). **Règle qui les distingue des skills : un skill se TIENT, une
    aptitude se DÉRIVE.** Aucune case à cocher, aucune cadence, aucune quête —
    elle monte toute seule. Aucune valeur stockée : dérivée, comme le niveau et
    la dette.
  - 🔻 **La seule chose d'ALTHEA qui ait le droit de BAISSER.** Position posée :
    une aptitude descend, **lentement**. Ce n'est pas une entorse à « l'acquis ne
    se perd jamais » — c'est sa contrepartie exacte : *le rang dit ce que tu as
    FAIT (jamais perdu), l'aptitude dit ce que tu VAUX aujourd'hui.* Un corps
    qui ne court plus perd son souffle ; il ne perd pas les kilomètres courus.
  - 🔻 **Défaut trouvé à la mesure, et sa leçon** : la proposition C portait ses
    libellés **dans** le médaillon — ils se posaient sur le carré et sur le
    corps, et « SOUFFLE » **sortait du cadre de 21 px**. Sortis du dessin.
    *Un médaillon de 66 px ne porte pas de texte* — et chaque proposition est
    désormais montrée **à sa taille réelle ET agrandie** : **un sceau se juge à
    la taille où il sera vu, pas à celle où il est beau.** Règle à réemployer
    pour tout blason d'Ultima.
  - **Les élans quittent la fiche**, sans quitter le jeu : l'élan reste au niveau
    du **skill**, où il a un sens. La fiche porte Niveau · Skills tenus ·
    Aptitudes.
  - **Lecture incertaine signalée, non devinée** : « le titre avant Farsight » lu
    comme *étiqueter la ligne* (clé TITRE au-dessus). Si Paul voulait un titre
    porté antérieur à Farsight, c'est à corriger.

- **2026-08-06 (ALTHEA — l'emblème, les stats, et un seul visuel)** — Trois
  dictées de forme : **« c'est un peu trop gros »** → un seul visuel à deux blocs
  alignés · **« utilise ça pour l'avatar »** (image d'un disque cranté à lame
  traversante) · **« il me faut aussi mes stats : force, endurance, agilité,
  intelligence, charisme »**.
  - **La mise en page arrêtée** : la fiche reste pleine largeur (Paul l'a
    validée) ; en dessous, **deux blocs alignés par le haut** — à gauche
    **l'état des lieux** (cadran, skills, stats : *où j'en suis*), à droite
    **le Système** (annonce, jour, quêtes, Léo, badge : *ce qui m'attend*).
    Ce qui a permis de tenir : **un skill = une ligne** (pas une carte), **une
    stat = UNE ligne de grille** (sa source logée dans la cellule du nom), le
    cadran resserré 470 → 360 px, et `align-items: start` pour que les blocs
    gardent leur hauteur propre.
  - **Les stats de Paul remplacent les cinq aptitudes que Léo proposait**
    (Esprit/Souffle/Volonté/Racine/Vigueur). Le registre RPG classique se
    comprend sans explication. **La règle ne bouge pas : un skill se TIENT, une
    stat se DÉRIVE** — aucune valeur stockée.
  - 🔻 **Le lien skill → stat passe de un-à-un à PLUSIEURS-À-PLUSIEURS.** Mes
    cinq aptitudes épousaient exactement les cinq skills : symétrie confortable,
    et **fausse**. *Pieds légers* nourrit l'endurance **et** l'agilité ; *Peak
    performance* la force **et** l'endurance. Coût : une table de liaison au lieu
    d'une colonne. *Une symétrie trop belle est un signe qu'on a plié le réel.*
  - 🔻 **LE CREUX — la meilleure trouvaille de la dictée.** Aucun des cinq skills
    ne nourrit le **charisme**. Deux options : masquer la stat, ou **la montrer
    vide et le dire**. Retenu : le Système l'affiche à zéro et l'annonce.
    **Un creux visible est une invitation ; un creux masqué est un oubli.**
    C'est peut-être le meilleur usage du Système — il ne compte pas seulement ce
    que Paul fait, **il montre ce qu'il ne fait pas**, sans le lui reprocher.
  - **Le sceau** : les trois Vitruve sont **abandonnés**. L'emblème de Paul est
    **redessiné, pas intégré** — le fichier n'est pas au dépôt et une maquette ne
    charge aucune ressource externe (CSP). Géométrie reprise, palette d'ALTHEA
    (or pour le corps, spectral pour la lame). **L'œil au centre passe DEVANT la
    lame** : c'est le titre qui le dicte — *Farsight, celui qui voit loin*. Le
    sceau dit le titre.
  - 🔻 **DÉFAUT DE MÉTHODE, à retenir** : la compaction des stats avait été
    écrite une première fois **sans effet** — la substitution de texte n'avait
    pas trouvé sa cible et **avait échoué en silence**. Résultat visible :
    « FORCEPEAK PERFORMANCE · OMNIVORE » en capitales collées. **Une substitution
    sans assertion est un changement qui n'a peut-être pas eu lieu.** Deux
    parades adoptées : toute réécriture automatique **assert** que sa cible
    existe, et le harnais vérifie **le résultat rendu** (la source est-elle sur
    sa propre ligne ?) et non la présence de la règle CSS.

- **2026-08-06 (ALTHEA — les stats passent par le NIVEAU, et une trouvaille meurt)** —
  Paul tranche : *« laisse Constance, c'est un skill »* · **« les stats sont
  arbitraires, elles augmentent avec les niveaux — chaque niveau fait gagner un
  point partout »** · *« emblème ok »* · les deux recouvrements validés.
  - 🔻 **UNE RÈGLE DE PAUL TUE UNE MÉCANIQUE DE LÉO, ET C'EST BIEN.** J'avais
    fait **dériver** chaque stat des skills qui la nourrissent, et j'en avais
    tiré une trouvaille dont j'étais content : *« aucun skill ne nourrit ton
    charisme — un creux visible est une invitation »*. **La règle de Paul la tue
    net** : si chaque niveau donne +1 partout, aucune stat ne peut rester à
    zéro. Retirée sans être défendue. *Ce qu'on a trouvé de beau n'est pas un
    argument contre ce que Paul veut.*
  - **Ce que sa règle apporte en échange, et qui vaut mieux** : la lecture est
    immédiate (personne n'a besoin qu'on lui explique « +1 par niveau »), il n'y
    a **rien à calculer donc rien qui puisse mentir**, et surtout — **ce qui
    distingue Paul, c'est son SOCLE**. *Le niveau le fait monter, il ne le
    dessine pas.* Une stat = `socle` (posé par Paul) + `niveau`.
  - 🔻 **Déplacement majeur : le NIVEAU devient le cœur du jeu.** Hier il n'était
    qu'un affichage dérivé ; aujourd'hui **tout passe par lui** — skills et
    quêtes → niveau → +1 à toutes les stats. **D'où une question qui n'existait
    pas et qui est maintenant centrale : qu'est-ce qui fait monter un niveau ?**
    Sans réponse, les stats ne bougeront jamais. Proposition : un palier de skill
    franchi = +1 · une quête accomplie = +1. *Un changement de règle peut créer
    une question centrale là où il n'y avait rien — c'est ça qu'il faut chercher
    après chaque dictée, pas seulement ce qu'elle modifie.*
  - **La table `althea_skill_stat`**, envisagée une heure plus tôt, **n'a plus
    lieu d'être** : aucun skill ne nourrit une stat en particulier.
  - **Le rang II devient L'ASSIDUITÉ** — le skill *Constance* de Paul garde son
    nom. Échelle : L'Éveil · L'Assiduité · L'Endurance · La Maîtrise · Le Renom.
  - **Validés** : le sport apparaît **volontairement** deux fois (cadence chez
    *Peak performance*, volume chez *Pieds légers*) · **« alimentation ok » =
    *Omnivore*** (second méta-lien du jeu, après *Constance*) · **la gravure de
    l'emblème** tient lieu de sceau.

- **2026-08-06 (ALTHEA — « embrassables du même coup d'œil », et la boucle se ferme)** —
  Paul rappelle une consigne **à moitié appliquée** : *« je t'avais pas dit de
  mettre le cadran du profil et celui des quêtes sur la même ligne ? que les deux
  soient embrassables du même coup d'œil »*. Il avait raison sur les deux points :
  ① la fiche restait une **bannière séparée au-dessus**, donc le profil n'était
  pas sur la même ligne que les quêtes ; ② chaque bloc faisait **plus de
  1 200 px** — on ne les embrassait pas, on les déroulait. Et il valide la montée
  de niveau proposée.
  - 🔻 **« Embrassable du même coup d'œil » EST un critère chiffrable** — et tant
    qu'il n'est pas chiffré, il n'est pas tenu. Traduction retenue : *les deux
    blocs commencent à la même ordonnée, et le plus haut tient sous 900 px*.
    Résultat mesuré : **PROFIL 636 px · QUÊTES 872 px**, même ordonnée. Chaque
    coupe a été **mesurée avant d'être décidée** (la fiche en en-tête : −90 ; les
    stats en rangée : −130 ; un skill sur une ligne : −110 ; une quête de 114 à
    72 px : −170 ; la note d'écran d'accueil sortie des blocs : −80).
  - 🔻 **RÈGLE DE FORME NOUVELLE, valable pour tout Ultima — un dessin qu'on
    réduit jusqu'à rendre son texte illisible n'est pas un dessin réduit, c'est
    un dessin perdu.** Le cadran, tassé à 270 px pour entrer dans la colonne,
    rendait ses étiquettes à **5,6 px à l'écran** (mesuré : `taille SVG ×
    échelle`, 9,5 × 0,587). Il est **retiré du visuel principal** — la liste des
    skills disait déjà tout ce qu'il disait, en lisible. **Seuil adopté : 9 px de
    rendu**, vérifié au harnais sur tout le visuel (zéro texte en dessous).
    *On mesure la taille de rendu du TEXTE, pas la largeur du cadre.*
  - ✅ **La boucle du jeu est fermée** (« ok pour tes reco de montée de niv ») :
    les gestes nourrissent les skills · les skills franchissent des paliers ·
    **un palier franchi = +1 niveau · une quête accomplie = +1 niveau** · le
    niveau donne **+1 à toutes les stats**. Plus aucun maillon manquant.
  - **Socles validés** tels que proposés (14 · 10 · 9 · 21 · 16), modifiables.
  - **Deux cadrans nommés** : **LE PROFIL** (qui je suis, où j'en suis) et
    **LES QUÊTES** (ce qui m'attend).

- **2026-08-06 (ALTHEA — B1 LIVRÉ : le personnage, ses skills, ses stats)** —
  Paul dit « go pour la suite » et « propre vue en grand » pour le cadran.
  B1 livré : moteur pur, migration écrite (non appliquée), API, front, la vue du
  cadran, trois harnais neufs. **Le cœur du quadrant est un module ES PUR**
  (`js/althea-progression.mjs`) : cadences, jours tenus, élan, rangs, niveau,
  stats — aucune I/O, donc éprouvable **sans base ni navigateur**. Les règles
  cardinales n'y sont pas commentées, elles y sont **exécutées**.
  - 🔻 **UN TEST A TRANCHÉ UNE SÉMANTIQUE QUE JE N'AVAIS PAS VUE.** Une cadence
    « tous les 2 jours » dont la fenêtre est vide : `false` ou `null` ? J'avais
    écrit le test en attendant `false`. Le code répondait `null` — et **c'est le
    code qui avait raison** : répondre `false` ferait retomber l'élan sur un
    simple silence, exactement ce que la règle ① interdit. *La cadence sert à
    faire COMPTER un jour couvert par une séance récente, jamais à fabriquer un
    échec.* Le test a été corrigé, pas le moteur. *Écrire le harnais force à
    trancher des questions qu'on ne se pose pas en écrivant le code.*
  - 🔻 **UN HARNAIS VERT SUR UNE PAGE MORTE — le piège le plus dangereux.**
    Ma fausse session stubait `window.supabase` en `addInitScript` ; or le
    vendor s'installe **après** et écrasait le stub. Sans la vérification du
    rendu réel, j'aurais eu des verdicts verts sur une page qui n'affichait
    rien. Motif de la maison adopté (semer un jeton en `localStorage`, laisser
    le VRAI client le lire) : *stuber la dépendance ment ; semer l'état exerce.*
  - 🔻 **LA PAGE SE RÉTRACTAIT À 292 px.** `css/styles.css` met le `body` en
    `display:flex` ; sans `width:100%`, ALTHEA se réduisait à la largeur de son
    contenu — et le cadran y tombait à **5,4 px de texte**. Trouvé UNIQUEMENT
    parce que le harnais mesure la **taille de rendu du texte** (`taille SVG ×
    échelle`) et pas la largeur du cadre. La règle du matin a payé le jour même.
  - 🔻 **TROIS HARNAIS EXISTANTS COMPTAIENT EN DUR** (« ULTIMA a 2 cadrans »,
    « 2 aiguilles », « 2 blasons ») et tombaient tous les trois à l'arrivée
    d'ALTHEA. Réécrits pour **se comparer au REGISTRE** au lieu d'un nombre
    écrit à la main. *Un test qui compte en dur se refait à chaque dictée ; un
    test qui compare à la source de vérité tient.* Enrichis, jamais affaiblis.
  - **Le schéma porte les règles**, pas seulement l'interface : `tenu` NOT NULL
    (le troisième état est **l'absence de ligne**), unicité (owner, condition,
    jour), croissance stricte des cinq seuils contrainte en CHECK — un palier IV
    inférieur au III rendrait le rang non monotone et la règle ② tomberait.
  - 🔻 **`check (jour <= current_date)` est IMPOSSIBLE** : `current_date` n'est
    pas immutable, Postgres refuse. La seule voie correcte est un **trigger** —
    documenté en toutes lettres dans la migration pour que la prochaine personne
    qui voudra « simplifier en CHECK » lise pourquoi ça ne peut pas marcher.
  - **Rien n'est stocké qui puisse redescendre** : ni rang, ni élan, ni jours
    tenus, ni valeur de stat, ni niveau. Tout est dérivé du module pur.
  - ⏳ **Actions humaines** : appliquer `0022` (gate) · jouer
    `supabase/seed-althea-paul.sql` avec l'`owner_id` de Paul.

- **2026-08-06 (ALTHEA — migration 0022 APPLIQUÉE, seed joué, et un défaut grave attrapé au dernier moment)** —
  Paul lève la gate : « applique les étapes 1 et 2 ». Migration appliquée, seed
  joué. **ALTHEA est vivant** : 5 tables, RLS sur les cinq, **20 policies toutes
  ancrées sur `(select auth.uid())`**, aucun advisor nouveau. En base : le
  personnage (Paul Gerard, niveau 48, *Farsight*), 5 stats, **6 skills** dont un
  verrouillé (*Traducteur universel*), un méta (*Constance*) et une évolution
  câblée, 10 conditions dont les 3 langues **dans un seul groupe** (le OU).
  - 🔻 **LE DÉFAUT DU JOUR, ET LA RÈGLE QU'IL DONNE.** Le trigger de garde
    écrivait `new.jour > (pg_catalog.current_date)`. Or **`current_date` est un
    MOT-CLÉ SQL, pas une fonction qualifiable** : le trigger levait une erreur
    **à chaque insertion**. Aucun relevé n'entrait — ALTHEA aurait été livré avec
    des cases impossibles à cocher. Le réflexe fautif était juste dans son
    intention (figer le search_path, invariant 0002) mais appliqué à un objet
    qui n'est pas résolu par nom.
  - 🔻 **ET LE TEST « JOUR FUTUR REFUSÉ » PASSAIT AU VERT** — pour la mauvaise
    raison : **tout** était refusé. Seul le test symétrique — *« et le jour
    COURANT, passe-t-il ? »* — l'a démasqué.
    **⚠️ RÈGLE PERMANENTE : TOUT REFUS DOIT ÊTRE ÉPROUVÉ AVEC SON
    CONTRE-EXEMPLE.** Un refus sans contre-exemple ne prouve pas qu'on a fermé
    la bonne porte : il prouve seulement qu'une porte est fermée. C'est la leçon
    0020/0021 (« tester par le refus, cas NULL d'abord ») poussée d'un cran —
    *tester par le refus **ET** par l'acceptation*.
  - **Correctif** : migration **0023**, appliquée dans la foulée. **0022 est
    laissée telle quelle**, avec un avertissement en tête : *une migration
    appliquée ne se réécrit jamais* — on empile, on ne récrit pas l'histoire.
  - **Neuf contraintes éprouvées sur la base RÉELLE**, dans une transaction
    annulée (aucune ligne de test n'a survécu) : jour futur refusé · jour courant
    accepté · rattrapage à 30 jours accepté · doublon du même jour refusé ·
    `tenu` NULL refusé · paliers non croissants refusés · cadence chiffrée sans
    seuil refusée · `quotidien` **avec** seuil refusée · évolution réflexive
    refusée.
  - **Plus aucune action humaine en attente.** Paul peut cocher.

### 2026-08-07 — ALTHEA : la devise du Système

- **Paul dicte la devise** : *« I am the record of your struggles, the evidence
  of your resistance and the reward of your pain »*. Elle s'affiche sous
  l'en-tête « Le Système », au-dessus de la voix de Léo.
- **La phrase parle à la première personne** — c'est le Système qui se nomme.
  Elle tombe donc du bon côté de la règle de couleur du quadrant :
  `--spectre` (ce qui est **annoncé**), jamais `--or` (ce qui est **gagné**).
  Le harnais l'éprouve dans les deux sens : *elle est spectre* **et** *elle
  n'est pas or* — un seul des deux ne prouverait rien.
- **Une devise se cite au mot près.** Le harnais compare la chaîne exacte, pas
  un fragment : un test qui cherche « I am the record » resterait vert sur une
  phrase tronquée.
- **`lang="en"` n'est pas un ornement** : sans lui, un lecteur d'écran
  francophone récite cette phrase anglaise avec la prononciation française.
  Premier cas d'une langue étrangère dans une page d'Ultima — la règle vaut
  pour les suivantes.
- **Épigraphe ≠ rubrique.** `.althea-devise` ne réutilise pas
  `.althea-sous-titre` : l'un est une citation qui se lit d'un trait, l'autre
  une étiquette de section en capitales. Réutiliser la classe aurait été
  « capitaliser sur l'existant » de travers — c'est la forme qui devait suivre
  le sens, pas l'inverse.

### 2026-08-07 — ALTHEA remonte à la racine

- **Paul, écran d'accueil en production** : *« je veux althea ici et ce n'est pas
  le cas »*. Corrigé : `racine.enfants = ['ultima-perso', 'alpha', 'althea']`,
  et ALTHEA quitte `ultima-perso`, qui retrouve ses deux macro-quadrants.
- **La cause n'était PAS le cache**, contrairement à ce que j'avais avancé la
  veille au titre d'hypothèse la plus probable. ALTHEA n'avait jamais été sur
  la racine : je l'avais rangé sous la supra-division ULTIMA. **Le nom ULTIMA
  désigne deux étages** — le produit entier (*Ultima Lv3*, l'accueil) et la
  supra-division personnelle. « 3ᵉ cadran d'Ultima LV3 » visait le premier ;
  j'ai lu le second.
  **Leçon : quand un nom désigne deux étages de l'arbre, une consigne qui
  l'emploie est AMBIGUË — il faut lever l'ambiguïté avant de ranger, pas après.**
  Le doute était levable en une question ; il a coûté une journée d'écart entre
  ce que Paul cherchait et ce que j'avais construit.
- **Et une hypothèse commode a retardé le constat** : « c'est sûrement le cache »
  expliquait le symptôme sans rien vérifier, et fermait l'enquête. Le harnais
  prouvait que la page rendait ses caps — il ne prouvait rien sur l'étage où
  Paul les cherchait. **Un test vert ne réfute pas un constat de Paul : il
  déplace la question.**
- **Sept assertions sont tombées** au déplacement, dans quatre harnais. Trois
  d'entre elles étaient des listes écrites à la main **sous un commentaire qui
  expliquait qu'il ne fallait pas** en écrire (« un test qui compte à la main se
  refait à chaque dictée »). Toutes rebranchées sur le registre.
  **Un commentaire qui énonce la règle ne l'applique pas.**
- ALTHEA est le seul cap de la racine qui soit une **feuille** là où ses deux
  voisins sont des boussoles — et c'est juste : on entre dans le jeu d'un seul
  geste, sans traverser d'étage. `chemin('althea')` vaut `['racine', 'althea']`,
  et le harnais l'éprouve.

### 2026-08-10 — RIVEN en détail : la personne cesse d'être un nœud

- **Paul, en dictée** : *« les catégorisations des contacts ne sont pas assez
  précises […] que je puisse renseigner des contacts sans forcément créer des
  nœuds, que je puisse également créer plusieurs nœuds »*. Trois lectures
  possibles de cette phrase, toutes défendables. **Je n'en ai retenu aucune :
  j'ai posé les trois en question avant d'écrire une ligne.** Réponses de Paul :
  ① séparer la **personne** du **nœud** ; ② les **quatre** axes de détail ;
  ③ le **métier principal fait la branche**.
  C'est l'application directe de la leçon du 2026-08-07, à la première occasion
  qui s'est présentée : *le doute se lève en une question, pas en une journée.*
- **Le modèle** : `personnes` (les gens) + `personne_noeuds` (personne × nœud ×
  rôle). Zéro ligne dans la table de lien = une personne sans aucun nœud, licite ;
  N lignes = la même personne sur N fiches, **avec un rôle différent sur
  chacune**. Les deux phrases de Paul sont vraies pour la même raison : le lien
  ne vit ni sur la personne ni sur la fiche, mais entre les deux.
- **Ce qu'on n'a PAS fait, et c'est le point dur** : `secteur_activite` n'a pas
  été renommé, pas déplacé, pas multiplié. Il reste le métier **principal** et
  l'unique clé de regroupement de l'arbre. `js/arbre.js` et `js/carte.js` ont
  **zéro ligne de diff** — et c'était un **critère de réussite écrit d'avance**,
  pas une chance : `smoke-arbre` et `smoke-secteur` passent **sans retouche**.
  *Un champ qui range et un champ qui décrit ne sont pas le même champ.*
- **Les mots ont été choisis, pas subis.** Le mot juste serait « fiche » pour le
  nœud et « contact » pour la personne — mais renommer « contact » dans toute
  l'interface est exactement le geste qui a laissé `smoke-quadrants` rouge le
  2026-07-22. La notion neuve s'appelle donc **« personne »** : zéro ambiguïté
  avec l'existant, zéro renommage. Choix délibéré et réversible, consigné comme
  tel dans `CADRAGE-RIVEN-DETAIL.md` §5.
- **`CHECK` + tableau = piège Postgres**, prévu au pre-mortem P1 et évité :
  vérifier « chaque élément est borné » demande un `unnest`, donc une
  sous-requête, **interdite en contrainte**. Résolu par une fonction
  `immutable` à `search_path` épinglé, écrite **une fois** pour les deux colonnes.
  *Un pre-mortem qui nomme le mécanisme d'échec, et pas seulement le risque,
  fournit sa parade.*
- **Une seule convention pour « rien »** (pre-mortem P6) : un tableau vide se
  normalise en `null` côté API, jamais `[]` sur le fil. La règle est écrite une
  fois et **éprouvée dans les deux sens** — c'est ce qui empêche base, API et
  front de diverger silencieusement sur la même donnée absente.
- **La démo ne ment pas** (P7) : les personnes de `donneesDemo()` ont la forme
  EXACTE du GET `/api/reseau`. Un harnais qui exerce une donnée que la vraie API
  ne saurait produire ne prouve rien.
- ⚠️ **La migration `0024` n'est PAS appliquée** — gate. En attendant, les
  personnes ne vivent qu'en mode démo : la preview montre le flux complet,
  la production ne les stockera qu'après le go de Paul.

### 2026-08-10 (suite) — 0024 appliquée, et la suite cadrée par Paul

- **Go de Paul, migration `0024` APPLIQUÉE** (projet Ultima, version
  `riven_detail`). Vérifié aussitôt : les deux tables existent, **RLS active**,
  0 ligne ; `network_nodes` garde ses 5 fiches. L'additif n'a rien touché.
- ⚠️ **`get_advisors` n'a PAS pu être joué** — appel refusé faute d'autorisation
  du connecteur. Je le consigne comme **manquant**, je ne le déduis pas de la
  réussite de l'application : *une vérification qu'on n'a pas pu faire n'est pas
  une vérification qui passe.* (Même faute que « c'est sûrement le cache » du
  2026-08-07, si je l'avais présumée verte.)
- 🔻 **Le RADAR m'a fait dire un faux.** Je m'apprêtais à annoncer à Paul que
  « RIVEN est vide, c'est le goulot » — sur la foi d'un constat daté du 30/07.
  `list_tables` a montré **5 fiches** : il avait commencé entre-temps.
  **Leçon : un constat d'ÉTAT vieillit ; une décision, non. Avant de re-citer un
  état consigné, on le re-mesure — surtout quand on va en tirer un conseil.**
  Le RADAR doit distinguer ce qui se périme de ce qui tient.
- **Arbitrage de Paul sur la suite : les DEUX voies pour peupler RIVEN.**
  ① Léo ingère une source existante et propose du pré-rempli à valider ;
  ② Léo construit la saisie en série pour ce qui n'est écrit nulle part.
  J'avais recommandé ① seule (« la vraie question n'est pas *quoi* renseigner,
  mais *si tu dois taper* ») ; Paul a pris les deux. **Il refuse de choisir
  entre l'import et l'outil quand les deux servent** — cohérent avec la
  directive JL : tout besoin devient une extension d'Ultima, jamais un
  contournement ponctuel.
- **Dépendance à ne pas oublier** : la voie ① ne démarre pas sans que Paul
  DISE quelle source il apporte. C'est le premier geste de la prochaine session,
  avant toute ligne de code.

### 2026-08-10 (clôture) — « c'est riven mtn » : la dette de nommage

- **Paul, en fin de session** : *« tu mets encore traveler mais c'est riven
  mtn »*. Il a raison deux fois — dans **mon vocabulaire** (je lui donnais des
  liens `traveler.html` en disant RIVEN) et dans le **repo**.
- **Vérifié avant de répondre, et la vérification a changé la réponse** :
  l'interface n'a **jamais** affiché « Traveler » (le bandeau dit ULTIMA). Ce
  n'est pas un bug d'affichage, c'est un **nom de fichier** qui a survécu au
  renommage du 2026-07-16 — et qui ressort dans **chaque URL** que je lui donne.
  *Sans ce contrôle, j'aurais annoncé un chantier d'interface qui n'existe pas.*
- **Trois couches, dont une seule casse quelque chose de vivant** : le fichier
  et ses liens ; l'identifiant `'traveler'` du contrat front/back de Léo ; et
  **l'URL publique** — sans redirection permanente, le favori de Paul tombe en
  404. **La couche invisible est la plus risquée : c'est celle qui touche à ce
  que l'utilisateur a déjà dans les mains.**
- **Décision de Paul : en OUVERTURE de la prochaine session**, avant le
  peuplement. Le nom doit être juste avant qu'il saisisse en volume et pose ses
  favoris — renommer après aurait cassé les repères qu'il vient de se créer.
- **Je ne l'ai pas lancé à la volée** alors qu'il venait de dire « fin de
  session ». Un renommage large touche le routage, et c'est précisément ce qui a
  laissé `smoke-quadrants` rouge le 2026-07-22. **Un geste qui a déjà cassé
  quelque chose une fois ne se refait pas en fin de session sans cadrage.**

### 2026-08-11 — RIVEN passe au ciel : la 3D devient l'écran d'arrivée

- **Dicté par Paul** : *« peut-être passer de l'arbre à la galaxie/constellation :
  thème sombre, une étoile = un contact, les grands thèmes communs deviennent des
  constellations et des liens entre les étoiles sont en blanc et fins »*, puis
  *« montre moi avant de coder »*, puis, devant la 3D : *« la 3d devient accueil,
  tout me va »*.
- **DÉCISION ACTÉE : la vue 3D devient l'écran d'arrivée de RIVEN.** La vue à
  plat et l'arbre restent accessibles depuis le bandeau. Reste à implanter dans
  `riven.html` — c'est la boucle suivante, la maquette en est le contrat.
- **Les cinq arbitrages, tranchés par Paul** : ① voûte en mosaïque, pas galaxie
  en spirale ; ② l'étoile est la **fiche**, la personne orbite autour (rattachée
  à deux fiches, elle orbite les deux) ; ③ six noms permanents, le reste à la
  demande ; ④ liens blancs, le **motif** dit le type et l'**éclat** l'avancement ;
  ⑤ la nouvelle vue s'ajoute, l'arbre ne se jette pas.
- **Le registre antique tient sur fond noir** : ce n'est pas un « dark mode »
  mais un **atlas céleste gravé** — encre de nuit jamais noire, filets dorés,
  capitales espacées. Le thème sombre demandé n'a donc rien coûté à la charte
  du 2026-07-08.
- **Zéro bibliothèque 3D, et c'est un choix argumenté** : la CSP pose
  `script-src 'self'` (un CDN est bloqué), Three.js vendorisé pèserait ~600 Ko
  pour vingt étoiles, et un canvas WebGL coûterait le focus clavier, le lecteur
  d'écran, le texte réel et la cible tactile mesurée. La perspective tient en
  quinze lignes de trigonométrie et le rendu reste en SVG : **chaque étoile
  demeure un élément du document**.
- **Ce que la 3D apporte, et qu'aucune vue à plat ne pouvait porter** : une
  constellation devient une **région de l'espace** (Fibonacci sur une sphère,
  les métiers les plus fournis plus près du centre : le réseau a un cœur), et
  « voler jusqu'à » fait pivoter le ciel d'une fiche vers son partenaire.

### 2026-08-11 — La leçon de la session : un harnais sans les en-têtes de prod ne prouve rien

- **Constat de Paul devant la preview déployée : « je vois rien ».** La page
  s'affichait, stylée, et restait vide.
- **Cause** : la CSP d'Ultima pose `script-src 'self'` **sans** `'unsafe-inline'`.
  Mes previews portaient leur JS dans un `<script>` en ligne — bloqué en silence.
  `style-src` autorise l'inline, d'où **l'apparence exacte d'un écran qui
  marche**. Le motif correct existait déjà au repo (`preview-draukhain-carto.js`).
- **La faute n'est pas la page, c'est le HARNAIS** : il servait les previews sur
  un serveur nu, sans en-tête. Un script inline y fonctionne alors qu'il est mort
  en production. **Trois passes vertes ne prouvaient rien sur la prod.**
- **Règle permanente qui en naît** : *un harnais qui ne reproduit pas les
  en-têtes de production ne prouve rien sur la production.* Le harnais sert
  désormais les pages avec la **CSP recopiée de `middleware.js`**.
- **Corollaire déjà vérifié deux fois ce jour** : le harnais voit ce que l'œil ne
  voit pas, mais **seulement s'il exerce le vrai geste**. Un `dispatchEvent`
  synthétique ouvrait la fiche là où un vrai clic échouait — c'est le clic réel
  qui a révélé que `setPointerCapture` détournait l'événement.

### 2026-08-11 — « Element is not stable » : quand l'automate dit ce que le doigt dira

- Playwright a refusé de cliquer une étoile en dérive permanente : *« element is
  not stable »*. Première réaction possible : contourner le harnais. **Mauvaise.**
- **Ce qu'un automate ne peut pas viser, un doigt le rate aussi.** La dérive lente
  est donc devenue une **option décochée** : le ciel est fixe pour travailler,
  vivant si Paul le demande. Elle s'arrête en outre dès que la main approche.
- **Règle** : un refus d'outil sur un critère d'ergonomie (stabilité, visibilité,
  taille de cible) est un **constat d'usage**, pas un obstacle technique à
  contourner.

### 2026-08-11 (implantation) — le CIEL est en production dans RIVEN

- **Paul : « vasy implante »**, après avoir tranché « la 3d devient accueil ».
- **Ce que « accueil » voulait dire, vérifié avant d'agir** : l'écran d'arrivée
  de RIVEN n'était PAS l'onglet Accueil (le tableau de Léo) mais **l'arbre**
  (`activerOnglet('arbre')` depuis A3/D2a). La décision se traduit donc par
  *le ciel prend la place de l'arbre à l'arrivée* — **l'Accueil de Léo n'est pas
  touché**, et l'arbre reste entier derrière son onglet. *Sans ce contrôle,
  j'aurais supprimé le tableau de bord de Léo en croyant obéir.*
- **Architecture** : `js/ciel.js` (module autonome `window.UltimaCiel`, même
  contrat que `js/arbre.js` : exposé en global, `createElementNS`/`textContent`
  uniquement), `css/ciel.css`, un `#espace-ciel` dans `riven.html`, un cinquième
  onglet. **Zéro dépendance ajoutée.**
- **`arreter()` en plus du contrat de l'arbre** : une boucle d'animation qui
  tourne sous un onglet caché est une batterie qui se vide pour rien. Quitter le
  ciel l'arrête, y revenir le reconstruit — et le harnais l'exige.
- **Le défaut le plus grave, trouvé par le harnais** : le tri de profondeur
  réordonne les étoiles par `appendChild`, ce qui **détache l'élément focusé du
  document et lui ARRACHE LE FOCUS** — la touche Entrée n'ouvrait plus aucune
  fiche. Le tri est cosmétique, le focus est fonctionnel : **le tri se suspend
  tant qu'une étoile a le focus**.
- **Quatre harnais avaient des assertions PÉRIMÉES**, pas cassées :
  `smoke-accueil`, `smoke-connexion`, `smoke-antique`, `smoke-arbre` affirmaient
  tous « l'arrivée est l'arbre ». Actualisés sans affaiblir leur intention — et
  `smoke-arbre` vérifie désormais que l'arbre reste **accessible par son onglet**,
  ce qui est le vrai sens de « on ne jette rien ».
- **Un effet de bord réel** : l'arbre rendu dans un espace caché mesure une
  largeur nulle et retombe au palier de base. `activerOnglet` le re-rend au bon
  palier ; c'est le harnais qui devait naviguer, pas le code qui devait changer.
- **Contraste** : l'entête et les outils du ciel vivent HORS de la scène, sur le
  parchemin — ils prennent donc l'**encre sépia**. En or pâle (la couleur du
  ciel) le titre était illisible sur fond clair. *Le régime de nuit commence au
  bord de la scène, pas avant.*
- **Vérifié** : `tests/smoke-ciel.mjs` neuf, **31 assertions** — dont la cible
  tactile MESURÉE (25 px à 390 px de large), l'absence au ciel d'une personne
  sans rattachement (une règle se teste par l'ABSENCE), le déterminisme du monde,
  et l'arrêt de la boucle en sortie. Patrimoine COMPLET vert : **53 harnais,
  1310 assertions, sortie 0**.

### 2026-08-12 — RIVEN se remplit : le cul-de-sac que la démo ne pouvait pas voir

- **Dicté par Paul** : *« on reprend, terminons la boucle de la veille sur
  Riven »*. Interprétation retenue et annoncée : **la boucle d'hier**, pas un
  sujet de veille/monitoring.
- **La vérification a corrigé le cadrage AVANT le code.** Le tableau de bord
  annonçait « les trois boutons du panneau de fiche, qui ne font encore rien ».
  Ils fonctionnent **tous les trois** depuis le 10/08 — les boutons inertes
  étaient ceux de la **maquette** (`design/preview-riven-3d.js`, un
  `signaler(...)`). *Sans ce contrôle, la boucle aurait ré-implanté trois
  gestes déjà livrés.* **Règle : un « reste à faire » écrit pendant une boucle
  de maquette décrit la maquette, pas le produit — il se re-mesure sur le
  produit avant d'être exécuté.**
- **Le vrai défaut n'était pas une fonctionnalité manquante, mais une
  fonctionnalité INATTEIGNABLE.** Mesuré en production : 5 fiches, 1 relation,
  **0 personne**. Avec zéro personne, `ouvrirFormRattachement` refusait
  d'ouvrir. Le geste central du 10/08 — la personne séparée du nœud — était
  livré, testé, vert… et **hors d'atteinte dans la base réelle de Paul**.
- **Pourquoi aucun harnais ne l'avait vu** : la démo livre **3 personnes**. Le
  chemin vide n'existait dans aucun état testé. **Règle : un harnais qui ne
  s'exécute que dans l'état CONFORTABLE ne prouve rien sur l'état RÉEL. L'état
  de départ d'un test est une hypothèse — elle se mesure en production.**
  `smoke-serie` vide donc le registre **par les vrais gestes** avant d'exercer
  le bouton, et conclut par l'**ABSENCE** du toast de refus.
- **La parade au doublon est une question d'ORDRE, pas de contrôle** : « ➕
  Créer une nouvelle personne » est offert **en tête** (visible sans dérouler
  cinquante noms) mais **n'est pas la valeur retenue** tant qu'une personne
  existe. Créer reste un geste délibéré. Registre vide, c'est la seule option —
  et le cul-de-sac disparaît de lui-même.
- **Le harnais a trouvé un défaut que je ne cherchais pas** : Playwright a
  refusé de cliquer un contact « not visible ». Cause : « + Ajouter un
  contact » depuis le registre **basculait sur la Carte**
  (`ouvrirFormDepuisAccueil`) — annuler faisait donc **perdre sa liste**. Le
  nom de la fonction disait la faute : elle est juste **depuis l'Accueil** (on
  va quelque part), fausse **depuis le registre** (on y est déjà). Corrigé à la
  source, sur le motif que l'arbre et le ciel appliquaient déjà.
- **Corollaire, et c'est le plus instructif** : `smoke-geocode` **dépendait de
  ce défaut** sans le dire — il atteignait `#bouton-ajouter` (bouton de la
  Carte) grâce à la bascule involontaire. **Un harnais qui s'appuie sur un
  effet de bord non écrit transforme un bug en contrat.** Sa navigation est
  désormais explicite : même intention, plus aucune dépendance cachée.
- **⏳ Fermé** : le connecteur Supabase répond enfin ; passe `get_advisors`
  faite — **zéro alerte sécurité de schéma** sur `personnes` /
  `personne_noeuds`. Reste un WARN de **configuration** (protection des mots de
  passe compromis désactivée) : action Paul, pas action code.
- **Constat neuf, reporté avec sa preuve** : `interet_qualitatif`,
  `effort_temps`, `effort_energie` vivent en base depuis la migration **0003**,
  sont validés par l'API, et **n'ont jamais été branchés à aucune interface**
  (zéro occurrence dans le front, zéro dans les harnais). Un modèle de données
  validé n'est pas un modèle de données **atteignable** — c'est la même leçon
  que le cul-de-sac, un étage plus bas.
- **Vérifié** : `tests/smoke-serie.mjs`, **50 assertions**. Patrimoine COMPLET
  vert : **54 harnais, 1 360 assertions, sortie 0**. `js/ciel.js`,
  `js/arbre.js`, `js/carte.js`, `api/**` : **zéro ligne de diff**, critère
  écrit d'avance et non constat d'après-coup.

### 2026-08-12 (clôture) — l'ingestion abandonnée, et un WARN qui n'avait pas d'objet

- **Dicté par Paul, en réponse aux trois décisions attendues** : ① *« pour
  l'instant, je renseigne les contacts à la main »* ; ② *« c'est à dire ? »* ;
  ③ *« merge »*.
- **DÉCISION ACTÉE : la voie ① du peuplement (ingestion d'une source
  existante) est ABANDONNÉE.** Elle était cadrée depuis le 10/08 et bloquée sur
  une question — « quelle source ? ». **Cette question est close sans réponse :
  elle n'a plus d'objet.** La voie ② (la saisie en série, livrée le jour même)
  est désormais la seule. *Leçon de tenue du tableau : une dépendance bloquante
  peut se lever par ABANDON du besoin, pas seulement par obtention de la
  réponse — et il faut alors le dire explicitement, sinon la question
  ressurgira à chaque ouverture de session.*
- **« C'est à dire ? » — et la question de Paul a bien fait de se poser.**
  J'avais inscrit « activer la protection des mots de passe compromis » comme
  action Paul, sur la foi du WARN des advisors Supabase. **Vérifié avant de lui
  faire cliquer quoi que ce soit : Ultima n'a AUCUNE authentification par mot
  de passe** — `signInWithOtp` (lien magique) et `signInWithOAuth` (Google)
  sont les deux seules voies. Le réglage n'agit que sur un mot de passe
  **saisi**. **Le WARN est sans objet, et l'action Paul n'existait pas.**
- **Ce que ça m'apprend, et qui dépasse ce cas** : *un avertissement d'outil est
  un signal, pas un verdict — il décrit une classe de risque, pas MON produit.
  Le relayer sans le confronter à la surface réelle, c'est faire faire à Paul
  un geste inutile et user sa confiance dans mes alertes.* Un avertissement se
  **qualifie** avant d'être transmis : est-ce que la surface qu'il vise existe
  seulement ici ? Consigné au RADAR.
- **PR #156 fusionnée** en squash (`e1e9144`) au go de Paul ; branche repartie
  de `origin/main` **avant** tout nouveau commit, comme l'exige la règle du
  2026-07-22.

### 2026-08-12 (3ᵉ boucle) — la règle affamée, ou l'ordre comme arbitrage de valeur

- **Dicté par Paul** : *« cadre pour qu'on boucle les 3 boucles ce jour /
  allons y une fois que tu as bien cadré et détaillé les étapes »*. Trois
  boucles fermées dans la foulée : piloter, corriger, proposer.
- **J'avais mal inventorié, et je l'ai vu en mesurant.** J'avais annoncé à Paul
  que « Léo qui fait quelque chose de la donnée » attendait **entièrement**.
  Faux : les relances remontent déjà, le moteur de suggestions existe avec
  **quatre règles**, une section suit les rapprochements créés. Il manquait
  **une** chose : proposer un rapprochement **inédit**. *Règle : avant
  d'annoncer qu'un chantier est à faire, l'ouvrir. J'ai failli réécrire —
  donc dégrader — un moteur qui marchait.*
- **LE constat de la boucle : une règle peut être vraie, testée, et JAMAIS
  ATTEINTE.** R5 (le rapprochement inédit) était rangée en cinquième position.
  Le moteur plafonne à **trois** suggestions, et R1 (relance en retard) + R2
  (idée dormante) + R3 (contact injoignable) remplissent les trois places dans
  n'importe quel réseau réel. **La seule règle qui apprend quelque chose à Paul
  était affamée par trois règles d'entretien.** Le harnais l'a trouvé du
  premier coup, parce qu'il exerçait l'écran et pas la fonction.
  - **Règle permanente qui en naît** : *dans toute liste plafonnée
    (suggestions, alertes, résultats), l'ORDRE des producteurs est un
    **arbitrage de valeur**, pas un détail d'implémentation. Il se décide
    explicitement et s'écrit dans le code — sinon la dernière règle ajoutée est
    silencieusement morte.* Ordre acté : urgence (relance en retard), puis
    **affaire possible**, puis entretien.
  - **C'est la MÊME leçon qu'hier** (le cul-de-sac du rattachement), un étage
    plus haut : une fonctionnalité verte peut être inatteignable. Hier c'était
    l'état de la base ; aujourd'hui c'est la place dans une file.
- **Corriger sans détruire, et pourquoi le `type` dégèle mais pas la cible** :
  `source_id` et `target_id` **définissent** la relation — en changer un ne
  corrige pas cet objet, il en désigne un autre, et le journal adossé
  deviendrait un **faux témoignage**. Le `type`, lui, **décrit** le lien sans
  l'identifier. *La bonne question n'est pas « ce champ est-il modifiable ? »
  mais « ce champ porte-t-il l'IDENTITÉ de l'objet ? ».*
- **La preuve choisie dit ce que Paul veut savoir, pas ce que le code fait** :
  pour prouver « corriger n'a pas détruit », le harnais ne lit aucun `id` — il
  vérifie que **l'entrée de journal adossée à la relation est toujours là**. Un
  supprimer/recréer l'aurait emportée. *Et j'ai refusé d'exposer `etat` en
  global pour les besoins du test : il porte de la PII, et un harnais qui a
  besoin d'un crochet en production mesure autre chose que ce que Paul touche.*
- **Le harnais avait tort avant le produit, une fois de plus** : mon critère C6
  confondait « ne plus proposer le rapprochement » et « ne plus nommer
  l'artisan » — R3 le nomme légitimement (« ni téléphone ni e-mail »). *Un
  critère trop large fait échouer un produit correct : c'est le harnais qu'on
  précise, pas le produit qu'on fait taire.*
- **Un rapprochement écarté, et c'est le pré-mortem qui l'a fait** : j'avais
  cadré « ou bien un partenaire rencontre un artisan ». Sans critère de
  correspondance, ce serait *tous* les partenaires × *tous* les artisans — du
  bruit présenté comme un conseil. **On ne propose que ce dont on peut DIRE la
  raison.** L'amendement est écrit dans le cadrage, pas effacé.
- **Vérifié** : `unit-relation-pilotage.mjs` (23 assertions, Node pur) et
  `smoke-pilotage.mjs` (47, DOM seul). Patrimoine COMPLET : **56 harnais,
  1 430 assertions, sortie 0**. `js/ciel.js`, `js/arbre.js`, `js/carte.js`,
  `supabase/**` : zéro ligne de diff. Aucune migration.

### 2026-08-12 (4ᵉ boucle) — l'hypothèse séduisante que la mesure a tuée

- **Dicté par Paul, capture à l'appui** : *« j'aimerais tout voir sur le même
  écran, toutes mes constellations d'un coup d'œil »*. Arbitrage demandé et
  rendu : **corriger le ciel existant**, pas créer une vue à plat.
- **J'ai eu une hypothèse fausse, et elle était BELLE.** J'avais calculé que le
  monde du ciel atteignait un rayon de **322** là où le cadrage n'en suppose que
  **300** : « le monde déborde par construction », diagnostic élégant, cohérent
  avec la leçon du 01/08 sur le foyer DRAUKHAIN, et **entièrement faux**. J'avais
  pris le rayon d'amas à pleine valeur et oublié la compression verticale.
  **Mesuré sur six configurations dont trois pires cas : 255 à 278, et zéro
  étoile hors du viewBox, jamais.**
  - **Ce que ça m'apprend** : *une hypothèse qui CONFIRME une leçon récente est
    la plus dangereuse de toutes — elle se fait accepter par familiarité. Le
    réflexe « une géométrie se mesure » ne vaut que si on mesure AUSSI le
    diagnostic, pas seulement le résultat.* Corriger sur cette hypothèse aurait
    éloigné la caméra, donc **rapetissé** le ciel : l'exact inverse de la
    demande de Paul, livré avec un cadrage impeccable à l'appui.
- **LE VRAI DÉFAUT, mesuré au navigateur** sur l'écran de la capture
  (1670 × 900) : la scène fait **689 px** de haut, le SVG dedans **934**.
  `overflow: hidden` en coupait **245 — un quart du ciel** — et la page ne
  défilait pas. Le bas du réseau n'était pas hors champ : il était **supprimé,
  en silence**. Cause : `.ciel-svg { height: auto }`, donc une hauteur déduite
  de la **proportion du viewBox** appliquée à la largeur rendue.
- **La règle qui en naît, et qui élargit celle du 01/08** : *« une géométrie se
  mesure » avait été entendu comme « les éléments tiennent dans le viewBox ».
  Insuffisant : **le viewBox lui-même peut être coupé**. La bonne question n'est
  pas « le dessin tient-il dans son cadre ? » mais « **le cadre tient-il dans
  l'écran ?** » — et cela se mesure en comparant la boîte du dessin à celle de
  son conteneur, puis au viewport.*
- **Un écran non éprouvé est un écran cassé** : le harnais du ciel ne tournait
  qu'à 390 × 844, où le défaut n'existe pas. Il tourne désormais **aussi** sur
  1670 × 900. *Le format d'écran est une dimension du pire cas, au même titre
  que le volume de données.*
- **Le harnais a été éprouvé CONTRE l'ancien code** : rétabli, il vire au rouge.
  *Un harnais qui passe aussi sur le code cassé ne prouve rien ; le vérifier
  coûte deux minutes et c'est la seule preuve qu'il mord.*
- **Deux verdicts FLOTTAIENT** — verts lancés seuls, rouges dans la suite
  complète. Ils mesuraient un transitoire d'animation derrière un
  `waitForTimeout` fixe. Ils attendent désormais la **convergence** (deux
  relevés identiques). *Un test qui dépend de la charge machine n'annonce rien :
  il tire au sort, et il finira par faire douter d'un vrai rouge.*
- **Vérifié** : patrimoine COMPLET **56 harnais, 1 430 assertions, sortie 0**.
  `js/arbre.js`, `js/carte.js`, `api/**`, `supabase/**` : zéro ligne de diff.

### 2026-08-12 (fusion) — PR #158, les deux boucles du jour dans main

- **Dicté par Paul** : *« merge »*, après avoir jugé le rendu sur la preview.
- **PR #158 fusionnée** en squash (`fcc9739`). Elle portait **deux boucles** :
  RIVEN (piloter une relation, corriger sans détruire, proposer un
  rapprochement) et le cadrage du ciel (« tout voir d'un coup d'œil »).
- Branche `claude/riven-veille-loop-1er0cs` **repartie de `origin/main`** avant
  tout nouveau commit (règle du squash-merge, 2026-07-22). Contrôle périodique
  de la PR supprimé — une routine qui survit à sa raison d'être devient du bruit.

### 2026-08-12 (sécurité) — la CSP cassait la carte, et l'audit ne l'avait pas vu

- **Dicté par Paul** : « diag complet du travail, corrige les bugs et les
  failles, implante les patchs, sécurise tout ». Routine `securite-max` :
  agent `securite-auditeur` + contrôles mécaniques + advisors (connecteur
  autorisé) + **mesure navigateur de la CSP**.
- **J'ai d'abord conclu FAUX : « aucun header de sécurité ».** Mon grep ne
  cherchait la CSP que dans `*.html` et `vercel.json` — j'avais **oublié
  `middleware.js`**, qui pose déjà toute la panoplie (et mieux : il garde
  `microphone=(self)` pour la dictée, que ma version `vercel.json` aurait
  cassée). L'agent l'a rattrapé. `vercel.json` réverté. *Règle : avant de
  déclarer une protection absente, chercher TOUS ses lieux possibles — header
  de plateforme, middleware edge, meta. Un seul grep partiel ment.*
- **LE constat, trouvé par la MESURE (S3)** : la CSP du middleware autorisait
  `img-src *.tile.openstreetmap.org`, mais `carte.js` charge le domaine **nu**
  `tile.openstreetmap.org` — que le wildcard ne matche pas (spec CSP). Résultat
  mesuré : **18 violations, 100 % des tuiles bloquées, carte sans fond en
  prod**, invisible depuis que le ciel est l'écran d'arrivée. L'agent avait relu
  la CSP et l'avait jugée saine ; seul le harnais qui l'INJECTE et exerce la
  carte l'a vu. *C'est EXACTEMENT la leçon du ciel, deux heures plus tôt : une
  géométrie — ou une politique — se mesure, elle ne se relit pas.*
- **Correctif** : `middleware.js` autorise le domaine nu ET le wildcard. Prouvé
  par `tests/smoke-csp.mjs` (rouge avant, vert après). Surface middleware =
  GATE : committé sur la branche, attend le merge de Paul.
- **Nouveau patrimoine durable** : `smoke-csp.mjs` lit la CSP réelle du
  middleware (source unique), l'injecte en `<meta>`, exerce carte+ciel, exige
  zéro violation. Rien ne testait la COMPATIBILITÉ de la CSP avec l'app — une
  CSP trop stricte ne lève aucune erreur au build, elle casse en silence chez
  Paul. Ce trou est fermé.
- **S1 (gated)** : `network_edges` et `journal` sont les 2 dernières tables sur
  l'ancien motif de FK simple (oracle d'existence d'UUID cross-owner, faible,
  atténué UUIDv4). Migration `0025` écrite avec garde préalable, NON appliquée.
- **S2 fermé** : advisors rejoués (connecteur autorisé). Sécurité = 0 lint réel
  (le WARN mot de passe reste sans objet). Performance = INFO (index FK) →
  registre, non bloquant.
- **Vérifié** : patrimoine COMPLET **57 harnais, 1 444 assertions, sortie 0**.

## 2026-08-12 — RIVEN passe la nuit : la forme se remodèle, l'arbre et la carte tombent

- **Demande de Paul (dictée)** : « remodeling de la forme », thème
  constellation / sombre appliqué à **toute** la page RIVEN, où « il y a un mix
  entre le côté galaxie, le côté sombre et l'ancien affichage de l'arbre » ;
  « on supprime l'arbre, on garde que la constellation et le modèle 3D pour tout
  RIVEN ». Puis, **explicitement en deuxième temps** : le même registre sur
  **Ultima LV4**, avec « les constellations plutôt que la boussole » à
  l'arrivée. « D'abord on termine RIVEN, on voit comment ça rend. »
- **Deux mots de la dictée tranchés** : « la page dagueuse » → **la page RIVEN**
  (seule à porter le mix) ; « nos côtosiers racines » → **les écrans racines**
  (console LV4). Un troisième écarté à dessein : **« l'archipel » n'est pas sur
  RIVEN** — c'est ADRAMELECH, hors périmètre.
- **TROIS ARBITRAGES DE PAUL, pris avant la première ligne (gate EL)** :
  ① la **carte est supprimée** elle aussi — RIVEN sera le ciel et rien d'autre,
  alors que je recommandais de la garder en régime de nuit (elle venait d'être
  réparée la veille) ; ② le noir couvre **toute la page**, pas seulement les
  vues visuelles ; ③ l'arbre part **franchement** (code, CSS, harnais).
  **VRANESH — l'arbre d'IMLADRIK — n'est pas concerné** : autre arbre, autre
  quadrant.
- **Le mix était structurel, pas cosmétique** (mesuré) : 5 espaces dans 2
  registres chromatiques, un seul de nuit. `ciel.css` disait déjà la couture
  dans son propre commentaire — *« l'entête et les outils vivent HORS de la
  scène, sur le parchemin d'Ultima »*. **La frontière était écrite dans le
  code ; Paul demande de la déplacer au bord de la page.**
- **Le retrait de la carte rétrécit la surface d'attaque** : les domaines de
  tuiles OSM et `unpkg` sortent de la CSP — **le correctif S3 de la veille
  devient sans objet**. Vérifié : Leaflet n'est chargé que par `riven.html`.
  Surface middleware = **GATE**.
- **Décision d'architecture, motivée par la phase 2** : le registre de nuit
  n'est pas un patch de `riven.html` mais une **couche de jetons réutilisable**
  (`css/nuit.css`, scopée `body[data-registre="nuit"]`, `styles.css` intouché).
  C'est elle que la console LV4 chargera le jour venu — **zéro thème à
  refaire** (directive EB : capitaliser).
- **Ce qu'on ne supprime PAS, et pourquoi** : `/api/geocode`, les colonnes
  lat/lon et le géocodage à la saisie restent en service sans écran pour les
  montrer. *Une suppression d'écran se revient d'un `git revert` ; un trou de
  données, non.* Le bouton « Trouver sur la carte » devient **« Situer la
  ville »** (EL principe 4).
- **Cadrage livré, code non commencé** : `CADRAGE-RIVEN-NUIT.md` (6 points,
  pre-mortem à 10 entrées, 9 critères de réussite tous mesurables — dont
  luminance de fond, contraste AA calculé, et **preuve de non-fuite** par six
  harnais d'autres quadrants qui doivent passer sans retouche). Prochaine
  action unique : **la maquette**, au go de Paul.

## 2026-08-13 — L'arbre et la carte tombent ; RIVEN n'a plus qu'une forme

- **Décisions de Paul** : « Go — enlève arbre », puis « Ok go / Merge tout /
  Puis diagnostique le tout et cadre la suite ». La question qui bloquait a été
  tranchée avant : « la carte en 2D » de sa phrase du soir désignait **le
  ciel**, pas la carte géographique — celle-ci reste supprimée, et le ciel
  gagnera une **bascule vers une vue à plat** (cadrée, pas exécutée).
- **Le thème s'appelle STELLAIRE, et il n'a pas d'interrupteur.** « Enlève
  registre de nuit, ça doit être comme ça tout le temps » : le mot « registre »
  supposait un choix parmi d'autres, il n'y en a pas. Renommé partout ; la
  couche à naître est `css/stellaire.css`, et une page l'a parce qu'elle charge
  le fichier — l'interrupteur est à la porte, jamais dans le CSS.
- **La 3D ne coûte pas de réseau.** Paul voulait la bascule 2D « si je n'ai pas
  assez de réseau » : le ciel est calculé dans l'appareil, sans une requête. Ce
  qu'il coûte, c'est du **calcul et de la batterie**. Le motif est corrigé dans
  le cadrage, et le critère de réussite avec : le harnais **comptera les images
  d'animation**, sinon le bouton n'économiserait rien de mesurable.
- **DEUX FOIS J'AI INVENTÉ CE QUI EXISTAIT DÉJÀ.** La maquette a écrit des
  couleurs de type et un mot d'état vide qui vivaient déjà dans `js/ciel.js`
  (`COULEURS_NUIT`) et `js/app.js` (« Votre ciel attend sa première étoile »).
  *J'ai présenté à Paul comme un arbitrage à rendre un mot rendu depuis deux
  jours.* **Règle** : avant d'inventer dans une maquette, chercher si le
  produit le porte déjà. C'est la directive EB, appliquée à mon propre travail.
- **UNE MAQUETTE NE REMPLACE PAS LE MOTEUR QU'ELLE MONTRE.** La première
  version dessinait un ciel plat « pour la démonstration » ; Paul a demandé en
  dix secondes où était passé le 3D. Elle charge désormais `js/ciel.js` et
  `css/ciel.css` du produit avec des données inventées — et c'est CE
  chargement qui a révélé les quatre règles de `ciel.css` encore accrochées aux
  jetons du parchemin. Aucune imitation ne l'aurait dit.
- **UN BLOC DE CODE N'APPARTIENT PAS À CE DONT PARLE SON TITRE.**
  `ouvrirFicheDepuisArbre` vivait dans le bloc « Onglet Arbre » alors que le
  CIEL l'appelait : le supprimer a cassé l'ouverture des fiches. De même, le
  ciel EMPRUNTAIT trois classes CSS à l'arbre. **Il appartient à qui l'appelle.**
- **UN ÉCOUTEUR ORPHELIN VIDE UNE PAGE SANS RIEN CASSER À L'ŒIL.**
  `#bouton-ajouter` (bouton de la carte) a levé une TypeError qui a interrompu
  `brancherEvenements` : plus aucune donnée chargée, page parfaitement
  affichée. Suivi d'un **audit complet des identifiants** référencés par
  `app.js` et absents de `riven.html` — geste à refaire à chaque retrait d'écran.
- **UN NETTOYAGE CSS AUTOMATIQUE N'EST PAS SÛR.** Mon motif a mordu sur la
  dernière ligne d'une **liste de sélecteurs partagée** (`:focus-visible`) :
  corps commun emporté, liste orpheline avalant la règle suivante, formulaire
  d'écriture d'IMLADRIK mort. **Cinq verdicts rouges dans un quadrant que je
  n'avais pas touché.** Le reste a été retiré à la main, bloc par bloc, et un
  contrôle d'intégrité (accolades appariées, aucune liste orpheline) entre au
  patrimoine. *Deuxième fois que le patrimoine COMPLET rattrape ce qu'un run
  ciblé aurait laissé passer.*
- **UN CRITÈRE MAL CHOISI INVENTE UN DÉFAUT.** Mon premier contrôle de
  géométrie comparait la `getBBox()` du ciel à son `viewBox` et criait au
  débordement : faux instrument — halos et zones de captation débordent
  volontairement et sont rognés. Le critère du produit (les **centres** des
  étoiles) dit 0 hors cadre.
- **Sécurité, chiffré** : CSP de **3 hôtes tiers à ZÉRO**, `'unsafe-inline'`
  tombé avec Leaflet, plus une seule ressource externe dans Ultima — donc plus
  aucune fixture à mettre en cache pour tester. Prouvé **par l'absence**.
- **Perte fonctionnelle SIGNALÉE, pas compensée en douce** : « 0 résultat →
  création pré-remplie » vivait dans la recherche carte. Décision de Paul
  attendue.
- **Vérifié** : patrimoine COMPLET depuis un cache vierge — **55 harnais,
  742 verdicts, sortie 0**. Fusionné en squash (`9b61993`).

## 2026-08-13 — la migration que je croyais en attente était appliquée depuis la veille

- **Paul : « Applique la migration ».** Vérification faite AVANT d'agir : la
  contrainte `network_edges_source_scelle` **existait déjà**. Interrogation de
  la base : les **quatre FK sont composites** (`network_edges_source_scelle`,
  `network_edges_target_scelle`, `journal_node_scelle`, `journal_edge_scelle`),
  les FK simples ont disparu, et `supabase_migrations` date l'entrée
  `riven_fk_double_scellement` du **2026-08-12 à 14:45:40**.
- **Donc S1 est fermé depuis la veille**, et j'ai répété à Paul pendant une
  journée que la migration « attendait son arbitrage ». *Trois documents le
  disaient — CADRAGE-ULTIMA, AUDIT-2026-08-12, ce journal — tous recopiant la
  même phrase, aucun n'étant allé voir la base.* Corrigés.
- **La leçon, et elle est la même que celle du thème stellaire** : un état qui
  se recopie de document en document n'est pas un état vérifié. La base est la
  source de vérité sur ce qui est appliqué ; le fichier de migration ne dit que
  ce qu'on a écrit, jamais ce qui tourne.
- **Ce qui a sauvé la mise** : ne jamais lancer un SQL sans le relire ET sans
  regarder l'état réel. La tentative d'application a d'ailleurs échoué proprement
  (« constraint already exists »), la transaction a tout annulé : rien de cassé.

## 2026-08-13 (soir) — le moteur cadrait du vide, très correctement

- **Paul : « Go pour étape 2 / Avance autant que tu peux sans moi ».** Livré les
  étapes ② (les trois capacités du moteur) et ③ (l'adaptateur en profondeur).
  Arrêté avant l'étape ④, qui touche neuf écrans de production et attend deux
  arbitrages de Paul.
- **LA CAUSE ANNONCÉE N'ÉTAIT QU'UNE MOITIÉ DE LA CAUSE.** L'étape ① concluait
  « `distanceIdeale()` doit connaître l'étendue réelle des étoiles ». Vrai, et
  insuffisant. La caméra tourne autour de **l'origine**, or un étage LV4 n'a
  qu'un groupe, dont `construireMonde` pose le centre à 228 de là : elle cadrait
  une sphère de 250 pour montrer un nuage de 55, **centré ailleurs qu'où elle
  regardait**. Un diagnostic tiré d'une maquette est une piste, pas un verdict —
  la moitié manquante n'apparaît qu'en écrivant le code.
- **MAJORER LE DANGER COÛTE AUSSI CHER QUE L'IGNORER.** Premier correctif :
  borner par le rayon du nuage, en supposant la pire étoile à la fois la plus
  latérale et la plus avancée. Vrai pour une sphère, **faux pour douze points**.
  Mesuré : 45,8 % d'occupation, sous l'objectif de 60. Écrite sur les étoiles
  réelles, axe par axe, à l'orientation courante, la contrainte donne le cadrage
  le plus serré qui garde tout le monde dedans. **La « contradiction » entre
  remplir le cadre et n'en faire sortir personne n'existait pas** : une formule
  trop naïve d'un côté, trop prudente de l'autre. 7,9 % → 37,6 % → **65 à 75 %**.
- **UN NOM PERMANENT ILLISIBLE N'EST PAS UN NOM PERMANENT.** Rendre les douze
  noms permanents n'en rendait lisibles que quatre : la classe ne fait que
  retirer `--demande`, tandis que l'opacité est repeinte à chaque image et
  retombe à 0,25 au fond. La capacité était à moitié fausse à son premier jet.
  **C'est la mesure qui l'a dit, pas la relecture.**
- **DEUX INSTRUMENTS ONT MENTI AVANT D'ÊTRE REMPLACÉS.** Le rayon de l'étoile
  visée : **saturé** (plafond de 9), il lisait « 21,6 avant, 21,6 après » sur une
  caméra qui avait parcouru un tiers du monde. L'étalement du ciel :
  **confondu** — `zoomerVers` tourne aussi le monde. *Un instrument qui mesure
  deux causes à la fois n'en prouve aucune ; une grandeur saturée ne prouve rien
  du tout.* Retenus : la distance réelle de la caméra et l'écart au centre.
- **UN TROISIÈME DÉFAUT EST VENU D'UNE CAPTURE, PAS DU HARNAIS** : « ULTIMA »
  écrit en 36 px en travers du ciel. Le harnais ne regardait que les
  `g.ciel-etoile` — l'étiquette de constellation n'en est pas une. **Un harnais
  qui ne regarde qu'une partie de ce qui est peint ne dit rien de ce qui est
  peint.** Rebouché des deux côtés : le plafond dans le moteur, la mesure dans
  le harnais. *Deuxième fois de la semaine qu'une capture voit ce que la mesure
  ne regardait pas — la première, c'était le cartouche or sur parchemin.*
- **NUANCE À NE PAS CONFONDRE AVEC LA LEÇON DU 12** (« la `getBBox()` du ciel
  inventait un débordement »). Ce jour-là c'était la boîte du ciel ENTIER, dont
  les halos débordent volontairement et sont rognés. Ici c'est la `getBBox()` de
  **chaque étoile**, et le critère est **plus strict à dessein** : sur un
  RÉSEAU, un halo lointain rogné au bord ne gêne personne ; sur un **MENU**, une
  entrée rognée au bord a l'air cassée. Même outil, deux contextes, deux
  critères — et c'est le contexte qui décide, pas l'outil.
- **L'ÉTALON N'A PAS BOUGÉ.** L'occupation est mesurée par la même fonction, au
  même endroit, avant et après. Changer de yardstick en même temps que de moteur
  aurait rendu la comparaison sans valeur — et flatteuse, ce qui est pire.
- **UN GARDE-FOU QUE L'APPELANT DOIT PENSER À INSTALLER N'EN EST PAS UN.** La
  garde anti-emballement du dépliage vivait dans la maquette ; elle est passée
  dans l'adaptateur avec le dépliage lui-même.
- **Critère 8 tenu** : `smoke-ciel` vert avant la première ligne et après la
  dernière, **sans une retouche**, cible tactile identique (25 px). Les trois
  options sont **inactives par défaut** — c'est ce qui rend la promesse tenable
  plutôt que surveillée.
- **Vérifié** : patrimoine COMPLET — **58 harnais, 836 verdicts, sortie 0**
  (55/742 il y a deux jours).
- **CE QUE JE N'AI PAS TRANCHÉ, ET POURQUOI.** Sur écran large, les trois
  galaxies remplissent 72 % de la hauteur — le critère — mais laissent la
  largeur creuse, parce qu'un groupe de trois se range en colonne. Y remédier,
  c'est choisir une **forme** (couronne, ligne, grille) : un parti pris visuel,
  pas une correction de cadrage. *Le critère est atteint ; le reste appartient à
  Paul.*

## 2026-08-13 (nuit) — cadrer l'étape ④, et deux chiffres de mon propre cadrage étaient faux

- **Paul : « On valide comme ça. Cadre la suite. »** Les deux arbitrages
  ouverts se referment sur l'état livré : geste au doigt **(a)** (premier appui
  déplie, second entre), disposition **en colonne**. Écrits comme tranchés, pas
  laissés en suspens.
- **LE POINT DUR DE L'ÉTAPE ④ N'EST PAS LE RENDU.** Inventaire de
  `js/boussole-noyau.mjs` ligne à ligne : la boussole porte **cinq fonctions
  que le ciel n'a pas** — le **cockpit** (`/api/cockpit`, Bearer, fail-closed),
  les **blasons**, le **cœur + la légende gravée**, la **passerelle avec son
  nom sur l'arc**, et le **cap « à venir »** inerte au clavier. Remplacer la
  boussole par le ciel, c'est **porter cinq fonctions ou les perdre**. *Même
  méthode que pour la suppression de l'arbre : l'inventaire AVANT, c'est ce qui
  avait sauvé sept assertions.*
- **`css/boussole.css` NE PEUT PAS ÊTRE TOUCHÉ**, et mon propre cadrage
  l'annonçait en « modifié ». `vranesh.html` le **charge** et bâtit dessus ;
  son plateau utilise `.cap`. VRANESH n'est pas une des neuf coques et ne passe
  pas au ciel. *C'est le piège du ciel qui avait emprunté trois classes à
  l'arbre, à l'identique — et je l'avais écrit noir sur blanc dans le même
  document.*
- **LE PÉRIMÈTRE DES HARNAIS ÉTAIT SOUS-ESTIMÉ.** Le cadrage nommait trois
  harnais et 170 assertions. Compté : les trois portent bien 170 — le chiffre
  était juste —, mais **trois autres** tiennent aussi sur la structure de la
  boussole (`smoke-tao`, `smoke-alpha`, `smoke-imladrik-carto`). **Six harnais,
  ~236 assertions.**
- **MON GREP A SUR-COMPTÉ AVANT QUE JE NE LE VÉRIFIE.** Une première passe
  annonçait treize harnais : le mot **« passerelle » est surchargé** — l'arc de
  la boussole d'un côté, le pont talent↔idéal de VRANESH / ZEKROM / DRAUKHAIN
  de l'autre. Vérifié en contexte avant d'écrire le chiffre. *Un instrument qui
  sur-compte invente un chantier, exactement comme celui qui sature en cache
  un.*
- **DÉCOUPAGE PROPOSÉ, PAS EXÉCUTÉ** (gate EL) : une **coque pilote**
  (`ultima.html`, celle qui cumule le plus de fonctions à porter), puis les
  sept ordinaires, puis **la racine en dernier** — l'écran le plus particulier
  ne doit pas servir de modèle aux huit autres. Pre-mortem à 12 entrées.

## 2026-08-13 (nuit) — la coque pilote au ciel, et ce qu'un portage n'a pas le droit de payer en douce

- **Paul : « go »** sur le découpage. Livré l'étape ④a — `ultima.html` quitte la
  boussole. Les six fonctions inventoriées sont portées, patrimoine vert
  (**59 harnais**).
- **LE CLAVIER PASSE AVANT LE CLIC DU MILIEU.** La boussole faisait de chaque
  cap un `<a href>` ; l'étoile est un `<g role="button">`. J'ai *essayé* de
  garder le lien en enveloppant l'étoile d'une ancre SVG. **Mesuré : enveloppée,
  l'étoile perd le focus clavier** — il retombe sur `body`, là où le ciel nu le
  garde (comparé sur RIVEN, même geste). L'ancre est tombée, et **la perte est
  ÉCRITE** dans le cadrage, le commit et le code. *Un portage n'a pas le droit
  de payer avec ce qu'il ne mentionne pas.*
- **LE FOCUS SE DÉTRUISAIT LUI-MÊME.** Atteindre un cap au clavier le dépliait ;
  déplier reconstruit la scène ; l'élément focalisé disparaissait. Un menu où la
  tabulation s'annule elle-même n'est pas navigable. Le focus lui est rendu
  après le re-dessin.
- **LE PIRE CAS QUI MANQUAIT ÉTAIT LE PLUS PETIT.** J'éprouvais 3, 12 et 20
  objets ; la coque réelle en a **DEUX**, et deux objets se rangent aux
  extrémités du cadre — la configuration la plus TENDUE pour le bord, pas la
  plus détendue. *Un pire cas ne se cherche pas seulement vers le haut.*
- **UN RAISONNEMENT N'EST PAS UNE MESURE.** « Le nom est centré, donc sa moitié
  suffit » → marge latérale à 52 → le pire cas construit (noms de 20
  caractères) a répondu **93,7 unités de débord**. Une constante ne peut pas
  borner une largeur de texte : elle se **mesure** sur les libellés peints. Et
  sur écran étroit, c'est la **POLICE qui cède avant la caméra** — reculer
  éloigne les étoiles sans jamais rétrécir leurs noms.
- **UN SEUIL QUI BAISSE DOIT SE JUSTIFIER PAR LA GÉOMÉTRIE, PAS PAR L'ENVIE DE
  PASSER.** Douze libellés sur 390 px ne laissent que 45 % d'étalement utile :
  limite physique. Les 60 % restent exigés **là où le produit vit** (4 caps au
  plus) ; au-delà, un plancher mesuré dont la seule fonction est de détecter une
  régression. Écrit en toutes lettres dans le harnais.
- **TROIS DÉFAUTS SUR CAPTURE, DEUX EN RELISANT LE CODE.** Le repli `<noscript>`
  allait être effacé par le premier rendu (trouvé en relisant le moteur AVANT de
  lancer la page) ; `body.boussole` battait `stellaire.css` en spécificité et
  `.boussole-scene` étirait la scène à **2275 px** ; **les jetons de nuit de
  `ciel.css` sont portés par `.espace-ciel`**, si bien qu'une page qui charge la
  feuille sans cette classe perd TOUT le régime chromatique **en silence** —
  elle a l'air sombre grâce au `body`, et rien ne signale la panne.
- **UNE ASSERTION ABANDONNÉE, UNE SEULE, AVEC SA RAISON** : « une aiguille par
  cadran ». L'aiguille joignait le centre de la rose à un cap ; un ciel n'a pas
  de moyeu d'où partir. Remplacée par le contrôle qu'elle approchait. L'ORDRE
  des caps est abandonné partout : une constellation range par géométrie.
- **`css/boussole.css` et `js/boussole-noyau.mjs` INTOUCHÉS**, comme le cadrage
  l'exigeait : VRANESH bâtit sur la première, les huit coques restantes sur le
  second.

## 2026-08-16 (soir) — LV5 cadré : la galaxie prend l'écran, et deux interdits de LV4 tombent

**Cadrage seul, aucune ligne de code.** Paul : « on fait un gros cadrage ce
soir, et demain on s'y met tranquillement. » Livré :
`CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md`.

- **QUATRE DEMANDES, PAS UNE.** Le plein écran (mise en page), la finesse
  (moteur de rendu), le geste (déjà livré en LV4), la propagation aux pages de
  travail (modèle de navigation). *Les confondre était le premier piège : ce
  sont quatre chantiers de natures différentes, et un seul d'entre eux touche
  le moteur.*
- **DEUX INTERDITS DE LV4 TOMBENT, ET C'EST ÉCRIT.** `CADRAGE-LV4 §13.6` disait
  mot pour mot « on ne passe pas VRANESH, DRAUKHAIN ni RIVEN au ciel ». Paul
  demande l'inverse. Son droit le plus strict — mais l'argument de LV4 ne
  devient pas faux pour autant : **un ciel ne remplace pas un formulaire**. Ce
  qui passe au ciel, c'est la boussole INTERNE de la page, pas la page.
- **LE « GROSSIER » A UNE CAUSE MESURABLE : 130 grains fixes, en SVG.** Un champ
  stellaire crédible demande 3 000 à 8 000 points, des voiles et des filaments :
  **hors budget SVG d'un ordre de grandeur**, et c'est le téléphone à 390 px qui
  décide, pas l'écran de bureau. D'où le **ciel à deux couches** — canvas 2D
  décoratif pour le fond, SVG inchangé pour tout ce qui se clique, se focalise
  et se lit. **Règle dure : si une information n'existe que dans le canvas, elle
  n'existe pas.**
- **CANVAS 2D, PAS WEBGL, ET PAS DE BIBLIOTHÈQUE.** WebGL se justifie au-delà de
  ~50 000 points ; on vise 5 000. `globalCompositeOperation = 'lighter'` donne
  l'addition lumineuse — ce qui fait le cœur brillant d'un amas — sans shader à
  maintenir ni 600 Ko sous une CSP `script-src 'self'`.
- **LE VRAI RISQUE N'EST PAS LA PERFORMANCE, C'EST LA PHASE.** Deux repères
  (`viewBox` SVG contre pixels canvas × `devicePixelRatio`) qui dérivent donnent
  un fond qui glisse sous les étoiles. Parade structurelle : **la même fonction
  `projeter()` pour les deux couches**, et un **point témoin** à 1 px près,
  écrit AVANT le premier grain.
- **UN CANVAS QUI N'A PAS PEINT EST NOIR — EXACTEMENT COMME UN BEAU CIEL.** Le
  fond ne se teste donc pas à la luminance mais à la **variance** des pixels.
  Encore un instrument qui aurait supposé ce qu'il mesure.
- **LE CONTRASTE CHANGE DE NATURE EN PLEIN ÉCRAN.** Le texte ne se lit plus sur
  un jeton CSS connu mais sur un **pixel qui varie**. L'instrument doit mesurer
  contre le **pire pixel réellement peint** sous la boîte de texte. C'est un
  harnais neuf, pas un réglage.
- **`100vh` MENT SUR MOBILE**, et `viewport-fit=cover` est absent des trois
  coques vérifiées : l'encoche iOS mangerait le bas du ciel. Trouvé en lisant
  les `<meta>`, pas en supposant.
- **SIX PALIERS DE SAUVEGARDE**, demandés par Paul. Un palier = un point où l'on
  peut s'arrêter net, tout vert, tout fusionné, Ultima meilleur qu'avant. P4 (la
  racine) tient à lui seul la demande prioritaire ; P5 et P6 sont la
  propagation, et **aucune des 16 pages de travail n'est engagée** par ce
  cadrage.
- **LV4 N'EST PAS FINI, ET LV5 L'ABSORBE.** Sept coques ordinaires et la racine
  attendaient encore (④b, ④c). Les traiter à part aurait fait repeindre deux
  fois les mêmes huit écrans.
- **TROIS MOTS DE LA DICTÉE SIGNALÉS AU LIEU D'ÊTRE DEVINÉS** : « surveillance »
  = surbrillance (sans enjeu) ; « nébuleuses » là où LV4 dit galaxies (renommage
  de libellés, pas de modèle) ; et surtout **« place des filands »** = « plein de
  filaments », qui désigne une maquette que Paul a aimée et que je n'ai pas pu
  identifier avec certitude — deux candidates. **Question bloquante avant P0 :
  sans elle, je raffinerais à l'aveugle.**

## 2026-08-16 (nuit) — P0 livrée : deux instruments de performance, et aucun ne suffisait seul

Paul a tranché la question bloquante — la maquette de référence est le mode
**Galaxie** de `preview-riven-galaxie.html` en charge dense — et a ajouté :
« l'étape d'après, c'est le LV5 avec la 3D. Si tu peux faire une étape ce soir
c'est bien aussi. » P0 est livrée.

- **LA COMPARAISON A ÉTÉ VÉRIFIÉE AU `grep`, PAS À L'ŒIL.** La maquette que Paul
  a aimée n'a **aucune** perspective (`FOCALE|projeter|yaw|pitch` → 0) ; le
  moteur de production en a **26**. **La richesse était du côté de la 2D, la
  profondeur du côté de la 3D, et personne n'avait les deux.** C'est ce constat,
  et non une intuition esthétique, qui a défini le travail de la soirée.
- **LE FOND N'A PAS DE CAMÉRA, ET C'EST TOUTE SA CONCEPTION.** Le risque n°1 du
  cadrage était la dérive entre deux repères. Un module qui aurait sa propre
  caméra et la synchroniserait serait à surveiller pour toujours ; celui-ci
  reçoit `projeter` du moteur à chaque image. **Il ne peut pas diverger d'une
  caméra qu'il n'a pas.** Mesuré : **0,00 px** d'écart, à trois orientations et
  après redimensionnement. Un risque qu'on empêche coûte moins cher qu'un risque
  qu'on mesure.
- **MON PREMIER INSTRUMENT DE PERFORMANCE NE MESURAIT RIEN.** Il lisait
  l'intervalle entre images et répondait **16,4 ms partout** — téléphone ou
  bureau, 3 objets ou 40. C'était la cadence de l'écran. Il aurait dit « budget
  tenu » jusqu'au jour où le ciel rame, et ce jour-là il aurait encore dit 16,4.
  *Troisième fois cette semaine qu'un instrument sature ; celui-ci, je l'ai
  attrapé parce que la valeur était trop ronde et trop stable pour être vraie.*
- **ET LE SECOND NON PLUS, PAS TOUT SEUL.** Le remplaçant chronomètre l'intérieur
  de la boucle et discrimine enfin (0,52 → 3,60 ms). Mais à 1670 × 900 et
  quarante objets il annonçait **3,14 ms** pendant que la cadence réelle tombait
  à **44,6 ms** : le coût est dans la **composition** du navigateur, invisible
  au JavaScript. **Les deux instruments sont désormais gardés, et le harnais
  exige les deux.** Un instrument qui remplace un instrument menteur peut être
  menteur autrement.
- **LA DÉGRADATION AUTOMATIQUE MANQUAIT** alors que le cadrage l'exigeait —
  écrite d'après la mesure, pas par précaution, et **éprouvée** : au pire cas,
  le fond prend 1 cran et rend de la place. Le critère sépare *là où le produit
  vit* (le registre ne donne jamais plus de 4 caps à un écran) de *ce qui est
  construit pour casser*. Même logique que le plancher d'occupation de LV4.
- **TOUTES LES MESURES VERTES, ET ALTHEA ÉTAIT MOINS VISIBLE QU'UN GRAIN DE
  POUSSIÈRE.** Vu sur capture, invisible dans les chiffres. Un décor qui
  rivalise avec l'objet qu'on vient chercher n'est plus un décor. Corrigé par
  l'éclat et la taille — et le grain était **laiteux** : son plateau central à
  0,22 en faisait un flocon, à 0,10 c'est une étoile. **La différence entre
  « fin » et « grossier » tenait dans un chiffre de gradient.**
- **UN SEUIL DE PERCEPTION SE FIXE À LA PERCEPTION.** « Le fond reste-t-il
  sombre ? » comptait les pixels au-dessus de 1/255 et trouvait 26,5 % d'allumé
  sur un ciel que l'œil voit noir. Porté à 8/255, **une fois, avec sa raison
  écrite** — et non remonté jusqu'à ce que la mesure passe.
- **MON HARNAIS INTERROGEAIT UN POINT HORS CHAMP** et accusait le moteur : la
  phase revenait `null` dès qu'on tournait le monde, parce que `projeter` rend
  `null` pour ce qui est derrière la caméra — ce qu'on lui demande. *Encore une
  conclusion tirée d'un instrument mal réglé.*
- **CE QUI N'EST PAS RÉSOLU EST ÉCRIT** : sur 390 px, le mobilier **recouvre**
  ULTIMA et ALPHA. Il ne vole aucun clic (le harnais le prouve), il les cache —
  un défaut distinct que le critère ne voyait pas. La cause est structurelle :
  le cadrage serré pousse les objets aux bords, là où le mobilier est posé. La
  solution n'est pas de rétrécir le ciel mais d'apprendre au cadrage qu'une
  partie du cadre est occupée. **C'est P2, pas une retouche de fin de soirée.**
- **RIVEN ET LA COQUE LV4 INTACTS** : `smoke-ciel`, `smoke-lv4-ciel`,
  `smoke-lv4-coque` verts avant la première ligne et après la dernière, sans une
  retouche. L'option est inactive par défaut, comme les trois de LV4.

## 2026-08-16 (nuit) — P1 : un garde qui protège d'une panne masque aussi un oubli

Paul a rendu les deux arbitrages de forme sur la maquette — « **fond avec les
étoiles génial** », « **charge ok** » — puis « **Go** ». L'éclat du décor (0,58)
et la densité sont donc **fixés** et sortent des questions ouvertes. P1 allume
la couche de fond sur `ultima.html`, la seule coque déjà au ciel.

- **UN GARDE QUI PROTÈGE D'UNE PANNE MASQUE AUSSI UN OUBLI.** Premier essai :
  option `fond: true` posée, **aucun canvas**, **zéro erreur console**, page
  parfaitement fonctionnelle. La coque n'avait pas la balise `<script>`, et le
  garde `options.fond && window.UltimaCielFond` avait fait exactement son
  travail — laisser vivre une page sans le module. **Rien ne distinguait « pas
  demandé » de « demandé et introuvable ».** Le harnais EXIGE désormais le
  canvas sur cette coque au lieu de s'en remettre au garde ; sans cette
  assertion, les huit coques de P3 auraient pu passer une à une avec une option
  morte, et le fond n'aurait manqué à personne avant Paul.
- **LE REPÈRE D'UNE MESURE DE POSITION DOIT ÊTRE CELUI DE L'OBJET MESURÉ, PAS
  CELUI DE SON VOISIN.** La maquette annonçait **0,00 px** de phase, la coque de
  production **1,60 px** — pour un code de projection *identique*. Le fond n'y
  était pour rien : la scène de production porte une **bordure d'1 px**,
  `getBoundingClientRect()` la compte (border box) et le canvas commence à
  l'intérieur (padding box). Je mesurais depuis un bord, le fond dessinait
  depuis l'autre. Depuis le repère du canvas : **0,21 px**. *Une bordure d'un
  pixel suffit à faire mentir un instrument juste par ailleurs.*
- **QUATRE INSTRUMENTS MENTEURS EN UNE SOIRÉE**, et c'est le vrai bilan de la
  journée : un chronomètre qui lisait la cadence de l'écran ; son remplaçant
  aveugle à la composition du navigateur ; un seuil de « perception » fixé sur du
  bruit de quantification (1/255) ; un repère décalé d'une bordure. **Aucun
  n'aurait été attrapé par la relecture** — seulement en croisant deux mesures
  indépendantes, ou en regardant une capture. Ce qui a été durci ce soir, c'est
  d'abord l'instrumentation, le rendu ensuite.
- **CE QUE P1 NE DONNE PAS, ET C'EST DIT À PAUL** : sur la coque, le fond est
  **discret** — 1 470 grains dans un plateau de 734 × 524, contre 4 234 en plein
  écran, et le dégradé du plateau l'éclaircit. Le rendu qu'il a validé demande le
  **plein écran** : c'est P2. Livrer P1 en laissant croire qu'elle donne le
  résultat attendu aurait été un mensonge par omission.
- **Patrimoine COMPLET vert, sortie 0** — dont `smoke-vranesh` (232 assertions),
  `smoke-ciel` et `smoke-lv4-ciel`, tous **sans une retouche**.

## 2026-08-17 — P2 : reculer sans décaler le centre, c'eût été reculer pour rien

Paul : « alors on y va ?? » — P2 ouverte et livrée. `ultima.html` est en plein
écran ; le plateau devient le fond de l'écran et le mobilier flotte dessus.

- **LE POINT DUR N'ÉTAIT PAS LA CSS, C'ÉTAIT LE CADRAGE.** Retirer le
  `max-width` n'aurait rien donné : les quatre enfants de la coque s'empilaient
  dans le flux. Et surtout le cadrage remplissait 60 à 75 % du cadre ENTIER,
  donc poussait les objets là où le mobilier est posé. D'où `margesUtiles` : une
  zone où le ciel n'a pas le droit de peindre.
- **ET IL FALLAIT DEUX EFFETS, PAS UN.** Reculer la caméra ET décaler le CENTRE
  OPTIQUE. **Sans le second, on aurait reculé pour rien** — les objets seraient
  restés centrés dans le cadre entier, simplement plus petits, et auraient
  continué d'entrer sous le bandeau. C'est le genre de moitié de correctif qui
  passe les tests de débord et ne règle rien.
- **UNE MESURE PRISE UNE FOIS EST UNE CONSTANTE QUI A EU RAISON UN JOUR.** La
  coque mesurait le mobilier et passait un objet ; le harnais l'a pris en défaut
  en grossissant le titre (marge figée à 119 pendant que le bandeau doublait).
  `margesUtiles` accepte désormais une **fonction**, rappelée par le moteur à
  chaque redimensionnement : **c'est le moteur qui sait quand il a besoin de la
  réponse**, pas l'appelant. Vérifié 119 → 315.
- **ÊTRE CLIQUABLE ET ÊTRE VISIBLE SONT DEUX PROPRIÉTÉS DISTINCTES.** Le défaut
  qui a motivé P2 était invisible aux assertions existantes : `elementFromPoint`
  répondait « l'étoile reçoit le geste », et c'était vrai — elle était cachée
  sous le bandeau. Il a fallu une SECONDE mesure, le chevauchement des boîtes
  peintes. *Aucune assertion de captation ne dira jamais qu'un objet est masqué.*
- **UNE ASSERTION REMPLACÉE, ET LE SEUIL N'A PAS BOUGÉ.** `smoke-lv4-coque`
  exigeait 60 % du CADRE ; un quart du cadre est maintenant rendu au mobilier,
  donc cela revenait à demander 83 % de la place restante. Le contrôle reste, son
  **dénominateur** change : 71,8 % de la ZONE UTILE, dans la fourchette de LV4.
  Baisser le seuil aurait masqué le fait que le ciel remplit très bien ce qu'on
  lui laisse.
- **CINQUIÈME INSTRUMENT FAUTIF DU CHANTIER, ET IL ÉTAIT DE MOI** : je comptais
  l'étiquette de constellation comme un débord alors qu'elle est à `opacity: 0`
  (le moteur la tait en cadrage serré, donc ne la positionne jamais et elle reste
  à l'origine avec son texte). `smoke-lv4-ciel` filtrait déjà sur l'opacité —
  **reprendre sa définition valait mieux que d'en écrire une seconde** : deux
  harnais qui mesurent la même chose de deux façons finissent par se contredire.
- **LE BANDEAU CHEVAUCHAIT LE RETOUR** à 390 px (sept pixels, vus sur capture) :
  un bandeau centré ne cohabite pas avec un bouton d'angle sur un téléphone. Il
  descend sous sa ligne — et la marge, étant mesurée, a suivi sans qu'on la
  touche. C'est le bénéfice concret du choix « mesurer plutôt que déclarer ».
- **CE QUI RESTE OUVERT A MAINTENANT UNE IMAGE** : sur 1670 × 900, deux objets en
  colonne remplissent 69 % de la hauteur utile et laissent la largeur vide. Le
  cadrage est juste ; c'est la FORME qui est en cause — question 3, un parti pris
  visuel que je ne prends pas seul.

## 2026-08-17 — P3 : une fonction déclarée portée sur un écran incapable de la contredire

Paul : « continue à tourner en solo ». Les sept coques ordinaires sont au ciel ;
`boussole-noyau.mjs` ne sert plus qu'à la racine.

- **LE NOM GRAVÉ DE LA PASSERELLE ÉTAIT PERDU DEPUIS LV4**, et le cadrage disait
  la fonction « portée ». Le trait l'était ; le nom, jamais — l'adaptateur
  jetait `lienLibelle`. **La coque pilote ne pouvait pas le voir : elle n'a aucun
  cap jumeau.** *Une fonction déclarée portée sur un écran incapable de la
  contredire n'est pas portée, elle est non testée.* Même piège que le cap « à
  venir » en LV4 — et la même parade : éprouver la fonction là où elle EXISTE.
- **UN DÉFAUT DE PRODUIT ANTÉRIEUR À TOUT LE CHANTIER, démasqué par la reprise
  des assertions** : le repli sans JavaScript d'IMLADRIK annonçait VRANESH et
  DRAUKHAIN « à venir » et sans lien, alors qu'ils sont bâtis. Deux tiers du
  quadrant inatteignables sans JS, invisibles parce qu'on ne regarde ce repli
  qu'avec JS désactivé. Le harnais compare désormais le repli au REGISTRE sur les
  sept coques.
- **UN FAUX VERT QUE J'AVAIS ÉCRIT MOI-MÊME.** « Halo allumé au survol » passait
  par chance de timing : la scène GLISSE sous le curseur immobile (caméra
  asymptotique), donc le `:hover` s'active et se désactive et l'opacité lue
  dépend de l'instant du déclic (0,146 ici, 0 là, pour un `:hover` actif dans les
  deux cas). Mesuré au FOCUS, qui est stable. *Une assertion verte par chance est
  plus dangereuse qu'une assertion rouge.*
- **UN REGEX STRUCTUREL A MANGÉ LE DÉBUT DE DEUX HARNAIS.** Ma faute, et la
  leçon est nette : un remplacement s'ancre sur du TEXTE EXACT, jamais sur une
  structure devinée — surtout pas appliqué à plusieurs fichiers d'un coup.
  Restaurés depuis git, réappliqués proprement.
- **LES ASSERTIONS D'ORDRE SE SCINDENT, elles ne s'abandonnent pas en bloc** :
  « les caps dans l'ordre du registre » portait DEUX garanties. Que le registre
  déclare tel ordre ne dépend d'aucun support — conservé. Que le DOM le respecte,
  non — abandonné (la géométrie range).
- **UN SCRIPT DE CONVERSION QUI REFUSE L'À-PEU-PRÈS** valait mieux que sept
  éditions à la main : il a refusé `imladrik.html` (un attribut de plus au
  `<body>`) au lieu de la convertir à moitié.
- **`hover()` VISE LE CENTRE D'UNE BOÎTE**, et celle d'un groupe englobe le nom
  peint sous l'étoile : le centre tombe sur du vide. On survole la zone de
  captation, faite pour ça.
- **UN VERDICT RENDU PENDANT QU'ON MODIFIE LE CODE NE VAUT RIEN** : j'ai touché
  `ciel.js` pendant un patrimoine en cours. Le run a été refait en entier, sans
  édition, et c'est celui-là qui compte.

## 2026-08-17 — « mets-moi toujours les liens des choses à vérifier »

Demande de Paul, inscrite en **règle permanente** dans `CLAUDE.md` (§Règles
permanentes), en renforcement de la règle « preview Vercel » du 2026-08-01.

- **Ce que la règle exige désormais** : non plus *un* lien de preview en fin de
  boucle, mais **la liste des liens cliquables page par page**, avec pour chacun
  ce qui a changé et ce qui mérite l'œil de Paul. À **chaque** rapport, y compris
  en cours de travail.
- **Pourquoi c'est une faute de ne donner que la preview** : Paul doit alors
  chercher lui-même ce que Léo vient de modifier. Le travail est rendu à moitié —
  la vérification fait partie de la livraison, pas de la charge de Paul.
- **Corollaire** : quand une page n'est pas encore vérifiable (déploiement en
  cours, palier non poussé), le DIRE plutôt que de donner un lien qui ne montrera
  rien. Un lien qui ne prouve pas ce qu'il prétend est pire que pas de lien.

## 2026-08-17 — P5a activé : l'encre s'hérite, elle ne s'énumère pas

Le fond étoilé est **actif** sur VRANESH (atelier) et l'abaque (instrument).
Patrimoine complet vert, 84 sections. Trois leçons, et les trois sont des leçons
de méthode plutôt que de CSS.

- **UN SÉLECTEUR QUI GAGNE CONTRE LE STYLE DE LA PAGE NE LA CORRIGE PAS, IL LA
  REMPLACE EN AVEUGLE.** Pour donner l'encre du ciel à trois textes de VRANESH,
  j'avais élargi la règle à une **liste** (`h1, h2, h3, p, li, label, small, a`
  sous `body[data-fond-etoile]`). Spécificité (0,1,2) : elle écrasait
  `.champ label` (0,1,1) et `.retour-ultima` (0,1,0) — des règles qui, elles,
  savaient sur quel fond leur texte était posé. Résultat mesuré sur l'abaque :
  **treize textes en échec**, six libellés à **1,10:1**. Le correctif fabriquait
  plus de défauts qu'il n'en réparait.
  **Règle tenue désormais** : l'encre de la nuit est posée UNE fois sur `body` et
  se transmet par **héritage** ; chaque surface de parchemin déclare son encre sur
  elle-même. Tout ce que la page colore explicitement garde sa couleur. On
  n'énumère plus ; on ne nomme un sélecteur que si une MESURE a montré le défaut.
- **UN DIAGNOSTIC QUI S'ARRÊTE À LA COULEUR RATE LE SUPPORT.** J'avais conclu que
  l'abaque était « de fait en atelier » parce que ses titres passaient en sépia
  sur la nuit. Faux : sa nappe de parchemin venait de `body.abaque`, que le
  nouveau fichier remplace. La page ne perdait pas trois couleurs, elle perdait
  **son support**. Rendre la nappe à `.feuille` (qui existait déjà) restaure d'un
  seul geste TOUTES ses relations de couleur — douze correctifs remplacés par un.
  L'arbitrage annoncé à Paul était donc un **défaut de diagnostic déguisé en choix
  produit** : il est clos sans l'avoir dérangé.
- **LE CONTRASTE SE MESURE SOUS LES LETTRES, PAS DANS LA BOÎTE.** Mon premier
  instrument cherchait le pire pixel de la boîte de l'élément : il accusait des
  bordures et des ornements qu'aucune lettre ne touche — 5 faux échecs sur 7
  textes, dont un titre parfaitement lisible. *Un instrument qui condamne du
  lisible ne mesure pas le contraste, il mesure la présence de décor.*
  `tests/smoke-fond-contraste.mjs` peint la page deux fois (normale / texte
  transparent), en tire **le masque des lettres**, et ne mesure que les coeurs de
  lettre. Son verdict est **différentiel** — avec le fond ET sans — pour ne
  rougir que sur un défaut NOUVEAU, ces pages portant des défauts antérieurs.
  **Et il a été prouvé qu'il rougit** : la règle fautive réinjectée exprès l'a
  fait passer rouge en nommant les six textes cassés. Un harnais vert ne vaut
  rien tant qu'on n'a pas vu ce qui le fait rougir.

## 2026-08-17 — MINETHNIR devient MAEDRETHNIR

Dicté par Paul en cours de boucle : *« Minethnir doit être changé en MAEDRETHNIR
partout »*. Second renommage de ce cap (il portait MINETHNIR depuis le
2026-07-24). **171 occurrences, 36 fichiers, plus le nom du fichier lui-même.**

- **CE QUI A DÉCIDÉ QUE C'ÉTAIT SANS RISQUE, ET IL FALLAIT LE PROUVER AVANT DE
  TOUCHER.** Un nom présent dans `supabase/migrations/` et dans `api/` peut être
  une **valeur stockée** — le renommer côté code casserait alors la prod en
  silence. Vérifié ligne par ligne : dans le SQL comme dans l'API, MINETHNIR
  n'apparaît qu'en **commentaires et en prose**. Aucun identifiant, aucune
  contrainte, aucune valeur. Puis re-vérifié **sur le diff** après substitution :
  la clé persistée des passerelles reste `'page'`, seul son libellé a changé.
  *Un renommage se prouve front-seul sur le diff, pas sur une intuition.*
- **LE RACCOURCI DE L'IPHONE EST UN APPELANT COMME UN AUTRE.** Le lexique notait
  que Paul a posé `…/minethnir.html` sur son écran d'accueil. Renommer le fichier
  sans plus le tuait. Deux redirections permanentes ajoutées à `vercel.json`, sur
  **le modèle `traveler→riven` déjà présent** (capitaliser plutôt que réinventer).
- **UNE ENTRÉE DATÉE DE JOURNAL NE SE RÉÉCRIT PAS.** « Partout » s'arrête au
  produit : code, interface, nom de fichier, cadrages d'état courant, lexique.
  Les 14 occurrences des entrées **passées** de ce journal restent — une entrée
  datée est un procès-verbal, et la réécrire ferait perdre la mémoire de la
  boucle qui l'avait produite. Le renommage est acté par CETTE entrée. Choix
  délibéré, signalé à Paul.
- **UN MOT PLUS LONG EST UNE GÉOMÉTRIE QUI CHANGE.** MAEDRETHNIR fait deux
  caractères de plus et devient le nom le plus long de l'outil : sur le ciel, un
  nom trop long déborde. Mesuré (`getBBox()` contre le `viewBox`) aux deux
  largeurs : aucun débordement. **Et mon premier instrument était faux** — il
  comparait les étoiles au `viewBox` d'un **blason** (72×72) attrapé par un
  `querySelector('svg')` trop large, et annonçait trois débordements. Corrigé en
  prenant `ownerSVGElement` de l'étoile. *Un sélecteur « le premier svg de la
  page » n'est pas une mesure, c'est un pari.*
- **Le lexique vocal reçoit les déformations du nouveau mot** — long et sans
  appui français, la dictée le cassera en deux (« maître Denir », « Madre
  Thnir »). L'ancien nom y reste, marqué comme ancien, pour que Paul puisse
  encore le dicter sans être mal compris.

Patrimoine COMPLET vert (84 sections) après renommage.

## 2026-08-17 — P5b : le registre atelier au complet, et un angle mort d'instrument

Sept pages embarquées sur le sol étoilé (neuf en tout). Patrimoine complet vert,
84 sections. Cinq des sept n'ont demandé **aucune règle** : les coques `console`
vivaient déjà sur une mer sombre — confirmation que le découpage en registres de
P5a était le bon.

- **SUR UN CIEL ÉTOILÉ, UNE ENCRE DE DEMI-TEINTE EST INTENABLE.** Le surtitre
  d'`idees` était en `rgb(138,113,71)` : 4,30:1 contre la nuit pure, 1,90:1 contre
  le pire pixel peint. La raison est structurelle — **un fond de nuit étoilée n'a
  pas UNE luminance, il en a une plage** : une encre claire reste au-dessus de
  toutes les étoiles, une demi-teinte finira par en croiser une. Corollaire de
  design, désormais tenu : **un surtitre garde sa subordination par sa taille, son
  interlettrage et ses petites capitales, jamais par son assombrissement.**
- **MON INSTRUMENT AVAIT UN ANGLE MORT, ET IL A LAISSÉ PASSER UN DÉFAUT.** À
  densité 1, un petit texte fin en petites capitales n'a aucun pixel pleinement
  opaque : le filtre « coeur de lettre » l'écartait **en silence, dans les deux
  passes**. Le surtitre a traversé le harnais sans être vu, et c'est l'œil sur une
  capture qui l'a rattrapé. Corrigé en doublant la densité (plus aucun texte non
  mesurable sur 9 pages) ET en **comptant et nommant** les textes non mesurables,
  avec un verdict qui borne l'angle mort. *Le texte le plus fin est le plus à
  risque : c'est celui qu'un instrument ne doit pas avoir le droit de sauter.*
- **LIRE LE RGB BRUT D'UN CANVAS TRANSPARENT NE MESURE RIEN.** Pour trouver quelle
  couche décorative éclairait trop le fond, j'ai sondé le canvas pixel par pixel :
  il répondait « blanc pur » à TOUTES les options, `eclat: 0` compris. Le canvas
  est transparent et ses pixels sont du blanc à faible alpha — seule la **capture
  composée** dit ce que l'œil voit. La sonde était fausse, le harnais avait
  raison ; et le premier signe était l'absurdité de `eclat: 0` répondant blanc.
  *Une réponse identique pour toutes les entrées n'est pas un résultat, c'est une
  panne d'instrument.*
- **UNE OMBRE PORTÉE NE RACHÈTE PAS UN FOND TROP CLAIR** : le contraste se mesure
  contre le fond, pas contre un halo. Quand éclaircir l'encre ne suffit plus, on
  assombrit réellement le fond — plaque de nuit translucide (0,82) sous l'en-tête,
  les étoiles se devinant encore au travers.
- **UN HARNAIS DU PATRIMOINE A ATTRAPÉ CE QUE LE MIEN VALIDAIT.** `smoke-idees`
  rougissait à 1,06:1 là où le mien donnait 7,48 : il comparait la devise au jeton
  `--parchemin` écrit en dur — vrai avant, faux depuis que la page vit sur la nuit.
  C'est la faute même que P5a avait inscrite en tête de son propre harnais. Leçon
  de fond : **un test qui nomme une couleur supposée vieillit mal ; un test qui lit
  ce qui est peint survit au changement de sol.**
- **UN SCRIPT DE CONVERSION QUI REFUSE** : il a recalé les deux pilotes déjà
  embarqués au lieu de les convertir deux fois. Une page à demi convertie coûte
  plus cher qu'une page pas convertie, parce qu'elle a l'air faite.

## 2026-08-17 — clôture de session LV5 : état de reprise

Session fermée à la demande de Paul (« fin de session pour le moment / implante
tout mémoire pour reprise »). **Rien en attente de commit**, `main` = `9130ab1`,
patrimoine 84 sections vert.

**Trois boucles fermées et fusionnées** dans cette portion de session :
① **#167 — P5a activé** : le sol étoilé actif sur VRANESH (atelier) et l'abaque
(instrument). L'encre s'hérite au lieu de s'énumérer ; la nappe du registre
instrument rendue à `.feuille`.
② **#168 — MINETHNIR → MAEDRETHNIR** : 171 occurrences, 36 fichiers, le fichier
renommé, prouvé front-seul sur le diff, redirections permanentes pour ne pas tuer
le raccourci iPhone de Paul. **Validé par Paul** (« je valide les 4 liens, c'est
ok pour le changement »).
③ **#169 — P5b** : sept pages embarquées, neuf en tout.

**Où reprendre** : `CADRAGE-ULTIMA.md` §ÉTAT porte désormais l'entrée LV5 complète
— registres, recette d'embarquement en quatre ajouts, reste à faire dans l'ordre
(**P6** althea/althea-cadran, **P4** la racine `index.html`, **P5c** la boussole
interne de VRANESH), et les règles payées cette session. Le détail vit dans
`CADRAGE-LV5-GALAXIE-PLEIN-ECRAN.md` §§16.8 → 16.10.

**Quatre règles remontées dans la charte** (§⚡ Optimisation), parce qu'elles
dépassent LV5 : demander à une mesure ce qu'elle répond sur un cas connu ; compter
et nommer ce qu'un filtre exclut ; ne remonter à Paul qu'un vrai choix, pas une
enquête inachevée ; classer par la mesure plutôt que par le débat.

**Ce qui n'a PAS été vu de mes yeux, et doit être dit tel quel** : aucune page
déployée. Le proxy de l'environnement refuse l'hôte Vercel (403 au CONNECT) —
toute la vérification est locale, sur Chromium réel, aux deux largeurs, plus 18
mesures de contraste et le patrimoine complet. C'est solide, mais ce n'est pas
avoir regardé la production.

## 2026-08-19 — reprise : go de Paul sur le plan de la journée, boucle 0 soldée

Paul donne le **go sur le cadrage de la journée** (boucles dans l'ordre :
⓪ synchro Notion → ① P6 ALTHEA ×2 → ② P4 racine `index.html` → ③ P5c boussole
interne de VRANESH ; réserve non ouverte : jeton `--encre-pale`).

- **TAO tranché** : l'opposition qui bascule en vertical à 390 px est **validée
  telle quelle** (« c'est ok pour TAO »). Sortie du registre ⏳ — rien à changer.
- **Boucle 0 fermée** : la fiche Notion « 📦 Repo Ultima- — Fiche projet » est
  synchronisée jusqu'au 2026-08-17 (entrée LV5 complète en tête + nota renvoyant
  au repo pour les sessions 24/07→14/08, jamais remontées — choix assumé : un
  renvoi, pas une réécriture d'historique). L'approbation d'outil Notion, qui
  avait bloqué deux fois le 17/08, est passée cette fois.
- **Toute la journée vit sur la branche `claude/reprise-travail-003t8b`** (branche
  désignée de la session) : une seule PR portera les boucles du jour, un commit
  atomique par boucle — signalé à Paul, la fusion reste sa gate.

## 2026-08-19 — P6 : ALTHEA sur le sol étoilé, et l'instrument qui déclare son support

Boucle 1 du plan du jour. `althea.html` + `althea-cadran.html` embarquées —
**11 pages au total**. Patrimoine COMPLET vert.

- **LE REGISTRE DIT CE QU'ON PROTÈGE, PAS DE QUOI C'EST FAIT.** ALTHEA lit des
  chiffres → instrument. Mais son support n'est pas le parchemin : c'est
  l'exception actée de Paul (« l'antique vu de nuit », CADRAGE-ALTHEA §10.3).
  L'invariant de l'instrument — des chiffres jamais posés sur les étoiles — se
  satisfait avec SES matériaux : les `.althea-bloc`, sans fond propre jusqu'ici
  (la nuit unie du body suffisait), reçoivent leur plaque de nuit opaque. Le
  harnais gagne un champ `nappe:` par cible, et exige que **TOUS** les supports
  trouvés soient opaques — l'ancien contrôle ne regardait que le premier, un
  seul bloc transparent lui aurait échappé. Éprouvé rouge en retirant la plaque
  (4 verdicts rouges), puis revert.
- **LA SURFACE DÉCLARE SON ENCRE, ÉPISODE 2.** `body[data-fond-etoile]` (0,1,1)
  bat `.althea` (0,1,0) : sans un `color: var(--parch)` posé sur `.althea-page`,
  tout le texte hérité d'ALTHEA passait en crème — contraste encore bon, donc
  **le harnais ne l'aurait jamais dit** : c'est la règle de couleur actée
  (or gagné / spectre annoncé / parchemin bleuté) qui aurait perdu son pilier,
  pas un ratio. Une identité ne se mesure pas en contraste ; elle se protège
  par une décision.
- **Préexistant consigné, pas élargi** : « ↞ Ultima » (`--parch-bas`) à 4,36:1
  en 1280, identique avec et sans le fond → registre ⏳, famille des
  demi-teintes limites de l'abaque.

## 2026-08-19 — P4 : la racine passe au ciel, la porte n'a pas bougé d'une ligne

Boucle 2 du plan du jour — « l'écran que Paul juge » (LV4 ④c), pris en dernier
comme le cadrage l'exigeait, sur un module éprouvé huit fois : **zéro erreur
console au premier rendu, aux deux largeurs.** Patrimoine COMPLET vert.

- **LE PONT ÉTAIT DÉJÀ CONSTRUIT, IL SUFFISAIT DE NE PAS LE REFAIRE.**
  `ciel-noeud.mjs` répondait déjà au nom `window.UltimaBoussole` (« pour ne pas
  avoir à modifier boussole-auth.js », écrit le 2026-08-13) et le registre
  `racine` portait déjà titre, invite, cœur et cockpit. La seule couture
  restante était le sélecteur `.boussole-scene` de l'inertie : la coque GARDE
  cette classe à côté de `ciel-noeud-coque` — poignée d'auth conservée, layout
  neutralisé par la feuille chargée après. **Résultat : la surface auth (sous
  gate) n'a pas été touchée du tout.**
- **UNE MIGRATION DE HARNAIS SE FAIT ASSERTION PAR ASSERTION.** `smoke-boussole`
  section A reclassée : portées (bandeau, cartouche, noscript, zéro CDN),
  remplacées avec la preuve équivalente ou plus forte (href lu → porte
  FRANCHIE ; aiguilles → étoiles ; contrastes mesurés contre le fond qui porte
  réellement l'encre), abandonnées avec raison écrite (l'illumination `is-actif`
  du cap n'existe pas sur une étoile — le dépliage et le cartouche actif la
  remplacent). Les sections verrou (C) et cockpit (D) passent SANS RETOUCHE de
  leurs garanties : le clic Google appelle bien OAuth À TRAVERS le ciel — le
  pre-mortem « le ciel mange les clics de la porte » est réfuté par l'épreuve.
- **L'INVITE EST UNE SPÉCIFICITÉ DE LA RACINE.** Les coques ordinaires l'ont
  retirée (smoke-console l'éprouve par l'absence) ; l'accueil la garde — c'est
  l'écran qui pose « sur quoi est-ce qu'on travaille aujourd'hui ? ». Le
  harnais racine l'éprouve par la présence. Deux tests opposés, deux écrans,
  chacun a raison chez lui.
- **CE QU'ON NE SUPPRIME PAS : `boussole-noyau.mjs`.** La règle de LV4 §13.4
  (« seulement si plus aucune page ne l'appelle — vérifié par recherche, pas
  supposé ») a payé : VRANESH l'appelle encore pour sa boussole des futurs.
  Il tombera avec P5c, pas avant.
- **CE QU'ON NE RENOMME PAS SEUL : « Boussole ».** Le title d'index.html et les
  retours « ↞ Boussole » des coques nomment l'écran d'accueil dans le
  vocabulaire de Paul. L'écran a changé de rendu, pas de rôle ; renommer serait
  un choix produit → il reste, signalé à Paul.

## 2026-08-19 — P5c : la dernière rose s'éteint, et une contre-passe qui a payé

Boucle 3 du plan du jour, dernière de LV5. La « boussole des futurs » de VRANESH
devient un ciel (arbitrage C). Spec déposée AVANT le code (EL ①), implémentée par
`front-carto`, contre-passée par Léo. Patrimoine COMPLET vert.

- **LA CONTRE-PASSE A ROUGI LÀ OÙ LA PASSE ÉTAIT VERTE, ET C'ÉTAIT MON PROPRE
  TRAVAIL.** `smoke-boussole` (mon harnais P4, écrit deux heures plus tôt)
  échouait sur « Cap sans data (ALPHA) : aucun badge » — une fois sur deux.
  Cause : `mouseenter` arme `setTimeout(deplier, SURVOL_MS=140)`. Ma section D
  survolait ULTIMA puis focalisait ALPHA **sans jamais quitter ULTIMA** ; le
  minuteur se déclenchait pendant l'observation d'ALPHA, le re-dessin détruisait
  l'étoile focalisée et `focusARendre` rendait le focus à ULTIMA — dont le badge
  réapparaissait. J'attendais 150 ms après un minuteur de 140 : la course se
  jouait à dix millisecondes. Corrigé par le `mouseleave` qui DÉSARME le
  minuteur, puis prouvé par **trois passages consécutifs**, pas un seul.
  *Un test qui dépend d'un minuteur qu'il n'a pas désarmé ne teste pas ce qu'il
  croit — il teste la vitesse du jour. Et un vert unique ne prouve pas une
  absence de course : seule la répétition le fait.*
- **DEUX ÉCARTS DÉLIBÉRÉS AU MOTIF DES COQUES**, écrits dans la spec avant
  l'implémentation : `fond: false` (la page porte DÉJÀ le sol étoilé de P5b —
  deux ciels sur un écran se disputent le regard, interdit §16.6) et pas de
  `margesUtiles` (le ciel vit dans un cadre borné du cartouche, pas derrière un
  HUD plein écran). Réutiliser un motif, c'est aussi savoir où il ne s'applique
  pas.
- **UNE SECTION CACHÉE MESURE ZÉRO.** L'agent a dû déplacer
  `montrer('vranesh-registre')` AVANT le rendu du ciel : le moteur mesure la
  boîte réelle du plateau, et une section encore masquée lui donne une boîte
  nulle. Écart signalé, raison écrite en commentaire. Même famille que
  `ajusterCadre()` au retour de l'arbre.
- **LE PIRE CAS SE CONSTRUIT, IL NE S'ATTEND PAS** (règle du 2026-08-01, tenue) :
  la géométrie est éprouvée sur `couronne(12)` injecté par la fixture, pas sur
  les deux thèmes du jour. Zéro débordement dans les quatre cas.
- **L'INSTRUMENT A ÉTÉ VALIDÉ SUR UN CAS DE RÉFÉRENCE** (règle du 2026-08-17) :
  `ownerSVGElement` désigne bien `ciel-svg` parmi les **4 SVG** de la page, et
  une étoile poussée hors cadre par le mécanisme réel du moteur est vue. L'angle
  mort restant est nommé au harnais : un débord par `transform` de groupe serait
  invisible à `getBBox()` — sans objet, le moteur n'en pose jamais.
- **`js/boussole-noyau.mjs` supprimé** après vérification par recherche (règle
  LV4 §13.4) : plus aucun appelant. **Plus une seule rose dans Ultima.**

## 2026-08-20 — ADR-009 VITRUVE : capter le potentiel solaire avant de sonner à la porte

**Ce que Paul a dicté** : élargir le spectre du rendez-vous client vers un
**bureau d'études embarqué** (« Réno Conception ») — savoir quel type de
rénovation est possible chez le client et quel est le **meilleur système** ;
moyens ouverts (vidéos, simulation 3D) ; premier terrain : **pavillons et
panneaux solaires** ; question centrale : **comment capter le potentiel solaire
d'une habitation ou d'un bâtiment**. Cadre : Renoboost IA.

**Capturé** en fiche `adramelech/IDEES.md` → **ADR-009 VITRUVE** (l'architecte
romain qui conçoit d'après la course du soleil ; module solaire = **GNOMON**,
la tige qui lit l'ombre). Statut `à raffiner` — grille des 7 blocs différée,
comme JANUS.

**Trois choses tranchées dans la fiche, qui ne se re-décident pas :**

- **LA FRONTIÈRE AVEC CHAMBRE CLAIRE (ADR-005) EST UNE FRONTIÈRE DE QUESTION,
  PAS DE PÉRIMÈTRE.** CHAMBRE CLAIRE demande *« ce produit passe-t-il dans cette
  pièce ? »* (une pièce, le catalogue IceStream, un verdict) ; VITRUVE demande
  *« que peut-on faire de ce bâtiment ? »* (une enveloppe, un gisement, une
  prescription). VITRUVE est **l'amont** : il dit quoi poser, elle dit si ça
  passe. *Les fusionner donnerait un outil qui mesure une pièce pour prescrire
  une toiture.* Ce qui se mutualise : fiche chantier RIVEN, capture photo,
  couche IA — **jamais le moteur**.

- **LE POTENTIEL SOLAIRE NE SE CAPTE PAS CHEZ LE CLIENT, IL S'Y *VÉRIFIE*.**
  L'essentiel est calculable **depuis l'adresse seule**, avant la visite : DPE
  ADEME ouvert (~12 M de diagnostics, gratuit, par adresse) + BAN/cadastre +
  **PVGIS** (JRC, gratuit, sans clé : productible, séries horaires, profil
  d'horizon) ; la toiture en 3D vient du **LiDAR HD IGN** (open data, couverture
  nationale attendue fin 2026) ou, en raccourci payant, de la **Google Solar
  API**. La visite n'apporte que ce que l'aérien ne voit pas : **masques
  proches** (l'arbre du voisin), état de couverture et de charpente, accès,
  vécu du client. *C'est l'inverse de l'intuition « je filme et l'IA comprend »
  — et c'est ce qui rend la v1 faisable sans une seule API payante.*

- **LE LIDAR D'UN TÉLÉPHONE NE MESURE PAS UNE TOITURE** (il porte à quelques
  mètres — c'est un instrument d'intérieur, donc de CHAMBRE CLAIRE). La vidéo
  demandée sert d'**inventaire** (l'IA regarde et remplit la fiche), pas
  d'instrument ; la « simulation 3D » est un **rendu de conviction** posé sur un
  pan reconstruit par la donnée aérienne, jamais une source de mesure. Rendu
  classé **v4, après la prescription** — application directe du prémortem
  « dérive AR prématurée » de CHAMBRE CLAIRE, déjà payé une fois.

**Règle métier posée comme critère de crédibilité** : **l'enveloppe avant le
générateur** — on ne prescrit pas une PAC sur une passoire. Le cœur de VITRUVE
n'est pas de calculer du photovoltaïque mais de **classer les gestes par
€/kWh économisé** et de rendre un ordre de travaux. *Un outil qui sait dire
« isolez d'abord » vend plus, pas moins : il fait de Paul un conseil.*

**Valeurs volatiles (aides, primes, tarifs d'achat) : jamais en dur, toujours en
table datée et sourcée** — elles changent plus vite que le code.

**Rien n'est lancé** : aucune ligne de build, aucun choix d'API arrêté. Les
décisions ouvertes (nom, périmètre v1, place dans la séquence
INTENDANT → MYCÉLIUM → PROTÉE) sont remontées à Paul dans le rapport.

## 2026-08-20 — VITRUVE : le nom est acté, la suite ne l'est pas

**Décision Paul** (dictée, en réponse au rapport ADR-009) : « **appelle le
Vitruve** » → le nom de registre **VITRUVE** est **acté**, avec **GNOMON** pour
le module solaire. « Réno Conception » redevient ce qu'il était : le libellé
parlé de Paul, pas le nom de la fiche.

**Et surtout, ce qui n'est PAS acté** : « on verra pour la suite ». Trois
questions restent ouvertes et **aucune ne s'exécute d'ici là** — la grille des
7 blocs, le périmètre v1 (fiche d'approche depuis l'adresse seule), l'entrée
dans la séquence de build INTENDANT → MYCÉLIUM → PROTÉE. *Un go sur le nom
n'est pas un go sur le chantier : la fiche dort complète, elle n'ouvre rien.*

PR #173 laissée **en brouillon** — la fusion dans `main` reste une gate Paul
(pas de mode solo déclaré cette session).

## 2026-08-20 (soir) — VITRUVE ira vivre ailleurs, et la fiche reste ici

**Décisions Paul** (dictée) : ① **go de fusion** sur la PR #173 ; ② « on
branchera VITRUVE sur un **autre repo** la prochaine fois » ; ③ « on **combinera
VITRUVE avec autre chose**, tu verras » — élément non révélé ; ④ « avec **mon
dpe.fr** » — consigné mot pour mot, **non interprété**.

**Ce que ça change, et ce que ça ne change pas.** Le *build* de VITRUVE sort
d'Ultima ; **la fiche ADR-009 reste dans ADRAMELECH**. C'est la distinction utile :
la bibliothèque d'idées garde l'idée, ses liens inter-segments et son analyse,
quel que soit le dépôt qui portera le code un jour. *Une idée ne déménage pas
parce que son chantier déménage.*

**Réserve signalée une fois à Paul, non bloquante — il a tranché.** La directive
JL veut que tout nouveau besoin soit une extension d'Ultima, jamais un outil à
côté. La lecture qui réconcilie les deux : **Ultima est l'interface de travail de
Paul ; VITRUVE est un outil métier de Renoboost IA** — un produit de l'entreprise,
pas un second poste de pilotage. À reposer au cadrage : ce qui relève du
*pilotage* (fiches, chantiers, décisions) revient dans Ultima et s'y rebranche.

**Conséquence sur la fiche : elle reste volontairement ouverte.** Le périmètre v1
proposé (fiche d'approche depuis l'adresse seule) **n'est pas figé** tant que la
combinaison annoncée n'est pas connue — cadrer un v1 contre une inconnue serait
du cadrage à refaire.

**PR #173 fusionnée** (squash) sur go explicite de Paul. Reprise de branche
obligatoire ensuite : repartir de `origin/main` avant tout nouveau commit
(règle du 2026-07-22).

## 2026-08-20 — la dette des demi-teintes soldée, et trois choses que la mesure a corrigées du registre

Boucle ouverte sur go de Paul (« go là-dessus »), la plus ancienne dette laissée
par LV5 : les textes sous le seuil de 4,5:1, rappelés en vert de rapport en
rapport. **Trois jetons, sept textes, trois pages. Zéro échec après.**

- **LE REGISTRE SE TROMPAIT SUR TROIS POINTS, ET SEULE LA MESURE L'A DIT.** Il
  annonçait « 5 contrastes sur l'abaque + le lien ALTHEA », et « assombrir un
  jeton global ». En réalité : ① **7** textes sur **3** pages — `althea-cadran`
  (« ↞ Le Système », 4,36:1) n'avait jamais été listé ; ② sur ALTHEA il fallait
  **éclaircir**, pas assombrir — texte clair sur fond sombre, l'inverse du
  parchemin ; ③ le jeton n'est **pas global**, il est local à chaque feuille —
  ce qui a rendu la boucle bien plus petite que la note ne le laissait craindre.
  *Une dette décrite de mémoire vieillit comme un test qui nomme une couleur
  supposée : on la relit des semaines plus tard en croyant savoir ce qu'elle
  contient.*

- **UN FOND SUPPOSÉ EST UN FOND FAUX.** Mon calculateur donnait 5,12:1 pour le
  lien d'ALTHEA quand le harnais mesurait 4,36. L'écart n'était pas une erreur
  d'arithmétique : le lien n'est pas posé sur la nuit d'ALTHEA (`--nuit`) mais
  sur le **sol étoilé**, plus clair. J'ai donc **déduit le fond réel du ratio
  mesuré** (L_fond = (L_texte + 0,05)/ratio − 0,05) au lieu de le supposer.
  C'est exactement ce que le harnais lui-même explique en tête : *un jeton dit
  ce que le fond DEVRAIT être.* Le corollaire vaut au-delà du contraste :
  **quand un calcul et une mesure divergent, c'est l'hypothèse cachée du calcul
  qu'il faut aller chercher — pas l'arithmétique.**

- **L'INSTRUMENT A ÉTÉ VALIDÉ AVANT USAGE** (règle du 2026-08-17, tenue) : le
  calculateur WCAG passe d'abord quatre cas connus — noir/blanc 21:1,
  blanc/blanc 1:1, `#777777` sur blanc 4,48:1 et `#767676` 4,54:1, le premier
  gris qui passe. Il a ensuite **concordé au centième** avec le harnais sur
  l'abaque (4,46 sur le parchemin, 4,29 sur la nappe `--ile`) : deux instruments
  indépendants qui tombent d'accord valent mieux qu'un seul qu'on croit.

- **UN VERDICT DIFFÉRENTIEL PARDONNE PAR CONSTRUCTION — IL LUI FAUT UN VERROU.**
  `smoke-fond-contraste.mjs` n'exige que « aucun défaut NOUVEAU » : c'est ce qui
  a laissé sept textes sous le seuil dormir des semaines **dans un rapport
  vert**, poliment listés sous `heritesRappeles`. Les pages soldées portent
  désormais `dettesSoldees: true`, et pour elles le seuil redevient **absolu**.
  Éprouvé rouge (ancienne valeur réinjectée exprès) puis vert. *Un rappel n'est
  pas un garde-fou : tant que rien ne rougit, une dette listée est une dette
  qui reste.*

- **ANGLE MORT NOMMÉ, PAS ENTERRÉ** : `idees.html` était à **3,64:1** en calcul
  — pire que l'abaque — et à **zéro échec** au harnais, parce que ses textes en
  `--encre-pale` ne sont pas rendus sans session. Un défaut réel qu'aucune mesure
  ne voyait. Corrigé à la source par le jeton ; la **couverture des pages
  authentifiées** reste un manque connu du patrimoine, à nommer tant qu'il dure.

- **RÉ-HARMONISATION AU PASSAGE** : `css/idees.css` et `css/abaque.css`
  partagent tous leurs fonds et avaient divergé sur ce seul jeton (#8a7147 vs
  #7c6338). Les deux reçoivent la même valeur **#695430** — ≥ 4,98:1 sur les
  trois fonds parchemin (`--parchemin`, `--ile`, `--mer`), et toujours entre
  `--encre` et `--encre-claire` : la hiérarchie à trois niveaux tient.
  ALTHEA : `--parch-bas` #6d8299 → **#788fa8** (5,17:1 sur le ciel).

**Patrimoine COMPLET vert** (84 sections). Thème sombre déjà conforme partout
(4,80 minimum) : non touché — corriger ce qui va bien est une régression en
puissance.

## 2026-08-20 — KALAMN-TALAEN : un placement hérité d'un monde disparu

Boucle 2 du soir, sur go de Paul. La légende gravée du ciel IMLADRIK sortait de
l'écran par la gauche.

- **LA CAUSE : UN VESTIGE DE LA BOUSSOLE.** `.kalamn-legende`
  (`css/imladrik-carto.css`) portait encore le placement de la boussole —
  `position:absolute; left:50%; top:68.5%; transform:translate(-50%,0)` — écrit
  pour poser le nom sous le médaillon. La boussole a disparu le 2026-08-19
  (« plus une seule rose dans Ultima ») et le ciel LV5 place désormais la légende
  lui-même, **en pleine largeur** : `.ciel-noeud-plateau > .ciel-legende
  { left:0; right:0; bottom:… }`. Les deux règles se cumulaient — le ciel donnait
  au bloc toute la largeur, et le `translate(-50%)` survivant le décalait de **la
  moitié de cette largeur**. *Un positionnement hérité d'un contexte disparu ne
  devient pas inoffensif : il devient invisible, et il agit.*

- **LE REGISTRE DISAIT « EN 390 PX » : C'ÉTAIT LES DEUX LARGEURS.** Mesuré
  −640 px en 1280 et −195 px en 390 — le centre du mot tombait pile sur le bord
  gauche, aux deux tailles. Deuxième note de registre prise en défaut par la
  mesure dans la même session (après « 5 textes sur 2 pages » qui en faisait 7
  sur 3). *Une dette décrite de mémoire se relit des semaines plus tard comme si
  elle était exacte — elle ne l'est pas.*

- **POURQUOI LE HARNAIS NE L'AVAIT PAS VU.** `smoke-imladrik-carto.mjs`
  vérifiait que la légende **existe** (`textContent`) et son **contraste**.
  Jamais sa position. *Un test qui vérifie qu'un texte est là ne dit rien de
  l'endroit où il est.* Deux assertions ajoutées, aux **deux largeurs** : dans le
  cadre, et centrée à 2 % près.

- **ON MESURE LA BOÎTE DU TEXTE, PAS CELLE DU BLOC** (règle neuve, du même sang
  que « une géométrie se mesure »). Le bloc de la légende fait toute la largeur
  du plateau : il « tient » donc **toujours** dans le cadre, et une assertion
  posée sur lui aurait été verte pendant que le mot était à moitié dehors. Un
  `Range` sur le contenu donne la boîte réellement peinte. *Mesurer le conteneur
  d'un texte, c'est mesurer l'endroit où il aurait pu être.*

- **INSTRUMENT ÉPROUVÉ DANS LES DEUX SENS** : sonde validée d'abord sur un cas de
  référence (l'entête, dont on sait qu'il tient), puis le harnais permanent rendu
  **rouge** en réinjectant le `transform`, puis vert après retrait. La sonde
  jetable a été supprimée : l'assertion vit dans le harnais du quadrant.

**Patrimoine COMPLET vert** (84 sections, zéro ❌).
## 2026-08-20 (soir) — LV6 cadré, pas exécuté : « le ciel vivant »

Paul ouvre le chantier suivant à la dictée : les constellations partout, et
une interface proactive « qui me pousse à l'usage et à l'amélioration
continue ». Consigne ferme : **un gros cadrage détaillé pour exécution la
semaine prochaine, aucune exécution avant son top départ.** La boucle du soir
est donc un document, pas du code : `CADRAGE-LV6-CIEL-VIVANT.md`.

- **« PARTOUT » A CHANGÉ DE SENS, ET LE MESURER L'A MONTRÉ.** La navigation
  entière est déjà au ciel (LV4-LV5) : ce qui reste hors du ciel, ce sont les
  **vues de données**. Deux candidates seulement — les idées d'ADRAMELECH
  (nœuds + liens : le modèle du ciel est exactement le leur) et TAO en double
  constellation (les Gémeaux existent déjà dans le moteur). ALTHEA, l'abaque
  et les ateliers ne bougent pas : un formulaire ne devient pas un ciel.

- **LA PROACTIVITÉ SE CADRE DÉTERMINISTE, PAS IA** : cockpit élargi (fraîcheur
  par quadrant, orphelines, élan ALTHEA — que des comptes et des jours),
  lueur d'appel sur les étoiles porteuses de signal, cartouche du matin
  « 3 signaux, 1 action » en module pur unit-testable. Règle ③ d'ALTHEA
  étendue à tout le produit : **Ultima compte, elle ne reproche pas** — liste
  de mots interdits assertée au harnais.

- **LE GOULOT RESTE LA DONNÉE, ET IL EST CHIFFRÉ** (prod, 2026-08-20) :
  `journal` = 0 — la machinerie de relances tourne à vide ; `personnes` = 0 ;
  `preuves` = 0 sur 3 talents ; dernier relevé ALTHEA le 2026-08-10. À la
  question de Paul « les contacts c'est sûr, quoi d'autre ? », la réponse
  tient en quatre gestes de saisie (cadrage §8) : contacts AVEC leur
  `relance_at`, une preuve par talent, reprendre les relevés, les idées au
  fil de l'eau. La proactivité sans donnée est un haut-parleur dans une
  pièce vide.

- **AUCUNE MIGRATION DANS TOUT LV6** : les cinq paliers ne font que lire la
  base — pas une gate Supabase sur le chemin.

Cinq arbitrages posés à Paul (§7 du cadrage) ; exécution palier par palier,
une PR par palier, au top départ.

## 2026-08-28 — LE CIEL S'ISOLE : cliquer une constellation n'ouvre plus une page

**Dicté par Paul** : *« quand je clique sur une constellation, ça m'affiche
uniquement cette constellation et plus les autres. Dans le plan 3D, on zoome et
on fait disparaître ce qui n'a pas été sélectionné. […] Si je clique sur NAGA, je
vois tous les projets de NAGA directement, et pareil pour GRIMA. »*

**Trois mots que la dictée avait abîmés, signalés au lieu d'être devinés** :
« suscription d'agace » → *la sous-division NAGA* ; « la Madrid » → *IMLADRIK*
(il la nomme « sous-division », or MAEDRETHNIR est une feuille et IMLADRIK est
un nœud — c'est le registre qui tranche, pas l'oreille) ; « est-ce qu'on garde la
recherche actuelle dans notre vision » → *la hiérarchie actuelle*, la question
que Paul pose lui-même et à laquelle sa phrase suivante répond.

**Ce qui change, et c'est un renversement** : jusqu'ici, cliquer un cap qui
contient quelque chose OUVRAIT SA PAGE (`grima.html`, `naga.html`…). Désormais
**ce qui contient s'isole sur place** — les frères s'éteignent, la caméra
s'approche, la scène est re-dessinée sur la seule descendance du foyer, **deux
étages d'un coup** (« voir tout d'un coup »). **Seules les FEUILLES ouvrent
encore une page** — ce sont les pages de travail, et c'est le seul endroit où
« ouvrir » veut encore dire quelque chose.

**Trois décisions prises dans la dictée, qui ne se déduisent pas l'une de
l'autre** : ① on ne montre que la descendance (les frères disparaissent, ce
n'est pas un filtre mais un jeu de données qui change) ; ② **le foyer lui-même
n'est pas peint** (« ça n'affiche pas forcément encore NAGA même ») — son nom
est porté par le fil d'Ariane ; ③ deux étages, pas un.

**Trois sorties**, parce qu'un écran dont on ne sait pas ressortir est un piège :
le fil d'Ariane, Échap, un clic dans le vide. **Et l'adresse suit**
(`ultima.html#naga`) : la flèche « précédent » remonte d'un cran au lieu de
quitter la page, et un ciel isolé se partage par un lien.

**CE QUE LES HUIT COQUES DEVIENNENT** : elles ne disparaissent pas — elles
cessent d'être le CHEMIN pour rester des PORTES (repli `<noscript>`, lien
direct, adresse). Cinq assertions de trois harnais disaient « clic → page » :
elles sont **remplacées, jamais supprimées**, et chacune scindée en deux — ce
que le clic fait maintenant, et la porte, éprouvée là où elle a encore un sens.

**LA CAPTURE A TROUVÉ CE QUE LE HARNAIS NE VOYAIT PAS.** Le contrôle « rien ne
sort du cadre » était vert pendant que LES RAPPROCHEMENTS passait **sous le
cartouche de Léo** : un contrôle de viewBox dit qu'une étoile est dans l'image,
il ne dit rien de ce qui est posé PAR-DESSUS. Cause réelle : le mobilier était
rempli APRÈS le dessin, donc le ciel cadrait sur un cartouche qui n'avait pas
encore doublé de hauteur. *Une place se mesure une fois qu'elle est prise.* Le
recouvrement est désormais **mesuré** (boîtes écran, ciel contre mobilier),
éprouvé **rouge sur le défaut puis vert sur le correctif**, et l'instrument
lui-même est vérifié sur un cas connu : il doit voir **quatre** boîtes de
mobilier, sans quoi « aucune étoile recouverte » serait vrai par construction.


## 2026-08-31 — L'ISOLEMENT SE RESSERRE À UN SEUL ÉTAGE

**CE QUE PAUL A DIT**, l'écran ayant vécu trois jours : « quand il montre NAGA,
j'aimerais que tu m'affiches non pas ce qu'il y a dedans — juste ADRAMELECH,
IMLADRIK, les grands thèmes. Et ensuite, quand on clique dessus, la suivante
s'applique ; la sous-vision est **contingente à ce qu'il y a dedans**. » C'est
la réponse à l'arbitrage que j'avais laissé ouvert le 28/08 (deux étages ou un).

**LA DÉCISION** : isoler un nœud ne peint plus que ses **enfants DIRECTS**. La
profondeur cesse d'être un réglage — on descend d'un cran par clic, et chaque
cran se lit d'un coup d'œil. Effet de bord voulu : le geste devient **identique
à tous les étages**, ce qui rend l'écran prévisible où qu'on soit dans l'arbre.

**DEUX CHOSES ONT DÛ SUIVRE, ET ELLES NE SE DÉDUISENT PAS DU CHANGEMENT.**
① La règle de groupement par tête est **retirée** : sans petits-enfants, elle
fabriquait autant d'amas d'UNE étoile que de thèmes, chacun étiqueté du nom de
l'étoile qu'il contient. Une seule constellation demeure, au nom du foyer.
② La passerelle RESHIRAM ⇄ ZEKROM a **changé d'étage** : les jumeaux vivent sous
TAO, donc elle n'apparaît plus en isolant NAGA. La garde « les deux bouts
peints » ne s'est pas contentée de tenir — c'est elle qui a rendu le
déplacement sûr, et le test l'a suivie au lieu de rester au cran d'avant.

**LE PIRE CAS CONSTRUIT A CHANGÉ DE FORME — et c'est la leçon de la boucle.**
Il valait « quatre têtes de cinq projets, 24 étoiles ». À un seul étage, il
n'aurait plus peint que **4** étoiles tout en s'annonçant « 24 » : un pire cas
devenu un cas facile, sous un intitulé rassurant. Il est reconstruit en **24
enfants directs** — la charge maximale RÉELLE d'un écran isolé désormais, la
profondeur n'y entrant plus. *Corollaire à retenir : quand la règle change, un
pire cas ne se relance pas, il se RECALCULE — sinon il mesure l'ancien monde
sous le nom du nouveau, et il est vert pour cette raison-là.*

**LES VERDICTS ONT ÉTÉ ÉPROUVÉS ROUGES AVANT D'ÊTRE CRUS** : les nouveaux tests
lancés contre l'ancien adaptateur donnent **six** échecs (dont
`isoleNeDescendPasAuDeuxiemeEtage`, qui mesure une ABSENCE — sans lui, un retour
aux deux étages passerait vert, les enfants directs y étant aussi présents).
Une mesure NEUVE entre au patrimoine : **la récursion dans le navigateur**
(GRIMA isolé → clic NICOL BOLAS → ses quatre caps, fil d'Ariane à trois crans,
adresse qui suit). L'adaptateur seul ne l'aurait pas prouvée : c'est la coque
qui porte l'état d'isolement, et c'est elle qui aurait pu refuser un second clic
sans que le module pur s'en aperçoive.

**Patrimoine complet relancé en entier : 18 harnais, zéro échec.**

## 2026-08-31 (2) — FINUBAR NE TENAIT QU'À UNE SEULE BARRIÈRE

**Contexte** : PR #179 fusionnée (`64bbb93`) sur le go de Paul, branche repartie
de `main`. J'enchaîne sur les deux vérifications de la fusion du 21/08, jamais
faites. La seconde demandait d'éprouver « en conditions RÉELLES » que
`/finubar/macro.json` et `/api/_lib/finubar-macro.mjs` refusent.

**LA VÉRIFICATION EST IMPOSSIBLE D'ICI, ET ELLE LE RESTERA.** Re-mesuré
aujourd'hui : le proxy du bac à sable refuse le CONNECT vers la production
(**403 sur le tunnel**, pas un timeout — la cause est nommée, pas supposée).
La reporter une troisième fois aurait été la reporter indéfiniment.

**CE QUE J'AI TROUVÉ EN CHERCHANT SUR QUOI LE REFUS REPOSAIT.** Uniquement sur
le middleware (`PREFIXES_PRIVES`). Or `finubar/macro.json` est un fichier
**statique**, et `.vercelignore` — la seconde barrière, dont le commentaire dit
mot pour mot « même si le garde tombait, ces données ne seraient pas sur le CDN
public » — couvrait `memoire/` et `adramelech/` **mais pas `finubar/`**. L'état
de pilotage des huit dépôts de Paul tenait donc à une barrière unique, adossée à
une hypothèse invérifiable : *« le middleware intercepte bien les statiques »*.
C'est **la forme exacte** de l'écart nommé le 21/08 — un contrôle qui a l'air
structurel et ne l'est qu'à une requête près.

**LA DÉCISION : RETIRER L'HYPOTHÈSE, PAS LA DOCUMENTER** (charte §⚡, 21/08).
`finubar/` sort du déploiement. Ce qui n'est pas déployé n'a plus besoin d'être
intercepté — et cela se vérifie **hors ligne**, là où la question posée le 21/08
ne pouvait recevoir aucune réponse. Rien de servi n'en dépendait : la route
`/api/finubar` lit son jumeau `api/_lib/finubar-macro.mjs`.

**LE VERROU QUI MANQUAIT** (`smoke-finubar` §5) : tout préfixe déclaré privé par
le middleware et correspondant à un dossier servable doit AUSSI être hors
déploiement. Il tourne à chaque boucle, alors qu'un test visant la production
n'aurait jamais tourné. Trois précautions, chacune pour une faute déjà payée :
① l'unique exception — `api/_lib`, qui DOIT être déployé puisque la route
l'importe — est **nommée dans le test**, et un verdict compte les cas écartés
(règle du 17/08 : un filtre qui exclut compte et nomme) ; ② un **test de
référence** exige que l'instrument sache dire non sur un cas connu (`js/` est
public), sans quoi une liste vide ou un import raté rendrait tout vert par
construction ; ③ le verdict a été **éprouvé rouge** en retirant le correctif.

**UNE LIGNE DU MIDDLEWARE A CHANGÉ, ET ELLE EST SIGNALÉE** : `PREFIXES_PRIVES`
est désormais exporté — pour être mesurable, et pour rien d'autre. Le lire par
expression régulière depuis le test aurait fabriqué un instrument qui se tait le
jour où la ligne change de forme. Aucun effet sur le comportement du garde ;
signalé à Paul parce que le middleware est sa zone à gates.

**Patrimoine complet : zéro échec.**

---

## 2026-09-02 — L'ACCUEIL PILOTÉ PAR FINUBAR, ET LA PORTE AU CIEL

**Cinq arbitrages rendus par Paul**, tous sur la recommandation, et ils sont
tranchés — les reposer coûtera une séance :

| # | Question | Réponse de Paul |
|---|---|---|
| 1 | L'accroche des dépôts dans le ciel | **Oui** : les 4 briques sous RENOBOOST IA (qui passe de porte à constellation), Ultima à la racine, le reste sous ALPHA |
| 2 | Trois teintes d'appel (or / bleu pâle / braise) | **Oui, et jamais de rouge.** Rien ne pâlit : l'absence de couleur est un silence |
| 3 | Le bandeau Finubar | **Permanent** en bas de l'accueil, pas un cartouche qui s'ouvre une fois par jour |
| 4 | Le dépliage d'office de la branche qui appelle | **Non** — mesuré illisible (cinq étoiles tassées sur un axe à la racine) |
| 5 | P4 (les signaux du cockpit sur le même ciel) | **Après P3**, jamais avant |

**UN ÉCART AU CADRAGE, ASSUMÉ ET DOCUMENTÉ.** L'accroche devait vivre dans les
huit `FINUBAR.md` ; elle vit dans `finubar/depots.json`. `renoboost-ia` est un
identifiant du registre de navigation d'**ULTIMA** : l'écrire dans le grain de
RenoDevis y ferait fuiter une notion étrangère, et il faudrait toucher quatre
dépôts pour déplacer une étoile. `depots.json` est déjà la liste des huit, tenue
par Ultima — y ajouter une colonne ne fabrique aucune seconde vérité.

**QUATRE CHOSES TROUVÉES EN MANIPULANT ET EN REGARDANT, AUCUNE EN RELISANT.**
① La **porte de RENOBOOST IA** se perdait : au ciel, un nœud qui CONTIENT isole
au lieu d'ouvrir, donc lui greffer ses briques lui retirait en silence son lien
vers renoboostia.fr. ② La **parole de Léo passait derrière le bandeau** — deux
cartouches `fixed`, même `z-index` ; vu sur une capture, pas dans le code.
③ Un **verdict qui ne pouvait pas devenir rouge** : la production déclare son
mobilier au moteur (`margesUtiles`) là où la maquette rétrécissait son
conteneur, donc le recouvrement ne s'y déclenche jamais — le verdict mesure
désormais le MÉCANISME. ④ La **mer** de l'écran de connexion devait s'éprouver
par l'ABSENCE : vérifier que le ciel est là ne prouve pas qu'elle est partie.

⛔ **ET UNE ALERTE QUE J'AI RETIRÉE APRÈS VÉRIFICATION — c'est la leçon de la
séance.** J'avais annoncé le matin que l'agrégat Finubar « mentait » sur la
dérive (0 annoncée contre 2–3 commits d'écart). **Faux.** `collecter.mjs` exclut
du décompte les fichiers que Finubar écrit lui-même ; sa mesure était juste,
c'est mon `git rev-list` brut qui comptait mal. *Avant d'accuser une sonde, lui
demander CE qu'elle compte* — c'est le pendant, vu de l'autre bout, de la règle
du 2026-08-17 (« demander à une mesure ce qu'elle répond sur un cas dont on
connaît la réponse »). Une accusation portée dans un fichier versionné aurait
survécu à sa réfutation.

**La porte d'entrée** est passée au ciel dans la foulée, sur une capture de Paul
(« même cette page il faut la changer »). Elle était restée une mer — dégradé
bleu, moirure d'eau et carte antique en SVG, dans `index.html` ET `riven.html`.
Le champ d'étoiles est celui des huit coques ; il ne peint **qu'à la première
ouverture de la porte** (le cas ordinaire est une session déjà ouverte, où
l'écran ne paraît jamais) ; `boussole-auth.js` n'est pas touché.

**Fusionné** : PR #185 (`b4dc35c`) puis #186 (`c9c4587`). Patrimoine complet
vert à chaque palier. Zéro PR ouverte à la clôture.

---

## 2026-09-03 — Léo partout, et FINUBAR lui donne des yeux

**Ordre de Paul, en deux temps** : d'abord « lance la boucle Léo sur finubar »,
puis « je veux parler à Léo partout ». Le second élargit le premier — et c'est
lui qui a demandé l'arbitrage de conception de la séance.

**Le problème que « partout » posait.** La voix vivait sur **cinq** pages,
montée à la main par le script de chaque quadrant, et Léo ne connaissait que
**quatre** quadrants. Les dix-sept autres pages n'ont pas de quadrant évident :
un rattachement deviné (par le nom du fichier, par un lien « retour ») donnerait
une Léo qui parle du mauvais sujet **avec aplomb** — pire que pas de Léo.

**La décision** : la page **déclare** son quadrant (`data-leo-quadrant`), et un
quadrant de **repli** — `ultima`, la Léo d'orientation, qui n'a aucune donnée
sous les yeux et le dit — accueille tout le reste. « Partout » devient vrai dès
le premier palier, sans un seul rattachement supposé. Treize pages sont
déclarées **sur une source lue** (homonymie, script de quadrant chargé, lien
retour unique) ; `naga` et `grima`, qui ont chacune deux liens retour, restent
au repli **exprès** : l'ambiguïté se laisse voir, elle ne se tranche pas au
hasard (EL ②).

**Un bouton, pas une modale.** L'accueil automatique n'a pas été étendu : la
décision « rien sur l'accueil » (2026-07-18) tient, et vingt-deux modales
auraient été une régression. Le bouton n'est posé **qu'après** vérification de
la session — un bouton qui n'ouvre qu'un « connectez-vous » est un bouton qui
ment. Il a fallu ouvrir `ouvrirCartouche` à une ouverture **forcée** : son
verrou « une fois par session » aurait fait un bouton mort au deuxième clic.
Le forçage n'écrit pas la marque, sinon le premier clic supprimerait
silencieusement le cartouche d'accueil du quadrant.

**Les yeux de FINUBAR.** `yeuxDeLeo` passe à Léo ce que l'écran montre déjà :
comptes de la macro, ce qui appelle, la prochaine action, la table de marche,
les gestes qui attendent Paul. Posée dans `js/adaptateur-finubar.mjs` — donc
**pure et éprouvable sans navigateur** — et non dans le module de page. Aucun
calcul neuf : recalculer un signal pour la voix créerait une seconde vérité, et
Paul entendrait un état que la page ne montre pas.

⛔ **DEUX DÉFAUTS TROUVÉS PAR LE HARNAIS, ET C'EST LA LEÇON DE LA SÉANCE.**
① Mon script d'édition posait `data-leo-quadrant` sur la **première** occurrence
de `<body …>` du fichier — qui, dans sept pages, est celle **citée dans un
commentaire de tête**. Résultat : sept commentaires réécrits, et l'attribut
jamais posé. Le smoke l'a vu parce qu'il vérifie **le quadrant réellement
envoyé** à `/api/leo`, pas la présence de l'attribut. *Une édition de masse par
motif se vérifie par son EFFET, jamais par son rapport d'exécution* — le mien
annonçait fièrement « zekrom → riven ». ② Le stub d'API du harnais laissait
passer trois 404 propres à la page ; ils sont désormais **comptés et nommés**
au rapport (règle du 2026-08-17), pas filtrés en silence.

**Éprouvés en rouge avant d'être crus** — miroir client désaligné, borne
desserrée, fuite de SHA, attribut retiré : les quatre sondes virent au rouge.
Un harnais qui n'a jamais échoué ne prouve rien.

**Ce qui reste** : la gate coût. Sans `ANTHROPIC_API_KEY` en env Vercel, le
bouton s'affiche et la zone répond 503 « voix pas encore branchée ». Poser la
clé allume les vingt-deux pages d'un coup.

**Arbitrage de Paul, le même jour** : `naga` et `grima` → **RIVEN** (elles
avaient deux liens retour chacune et étaient au repli), et **le bouton reste
sur l'accueil** — c'est un bouton, pas la modale que « rien sur l'accueil »
(2026-07-18) écartait. Les deux pages sont entrées au harnais : ce qui est
vérifié est le quadrant qu'elles **envoient**, jamais la présence de leur
attribut. C'est la leçon du matin, appliquée le jour même.

---

## 2026-09-06 — Le mail du matin de FINUBAR

**Demande de Paul** : « J'aurais bien mon mail de FINUBAR demain matin ? »

**Premier constat, et il commandait la réponse** : ça n'existait pas. Aucun cron
dans `vercel.json`, aucune brique d'envoi, aucune route. Le « morning-launch »
du nom de branche était le nom d'une séance, pas une fonctionnalité. Répondre
« oui » lui aurait fait ouvrir sa boîte pour rien le lendemain.

**Rien n'a été inventé** : Resend est déjà en place et payé chez lui
(`RESEND_API_KEY`, utilisé par RenoPredict et RenoBoost), RenoPredict fait déjà
tourner trois crons de digest, et l'agrégat Finubar était déjà calculé et mis en
forme. Le lot se réduit à une route, deux crons et une composition.

⛔ **LE PIÈGE POSÉ AVANT, PAS APRÈS.** L'agrégat est FIGÉ AU COMMIT : un digest
quotidien assis dessus annoncerait chaque matin un état vieux de plusieurs jours
avec l'aplomb d'un état frais — précisément ce que Finubar existe pour empêcher.
Le mail dit donc son âge **en tête**, et au-delà de deux jours cet âge devient un
avertissement qui dit quoi faire (« relance `collecter.mjs` »). Un serverless ne
peut pas collecter : il n'a ni les dépôts ni git. Ce n'est pas une limite à
cacher, c'est un fait à afficher.

⏰ **DEUX CRONS POUR UN SEUL MAIL, et c'est délibéré.** Les crons Vercel sont en
UTC : `0 5 * * *` vaut 7 h à Paris l'été et 6 h l'hiver — le mail dériverait
d'une heure deux fois par an, sans que personne ne s'en occupe. Donc deux
réveils (5 h et 6 h UTC) et une garde qui n'envoie que si l'heure RÉELLE à Paris
est 7. Le réveil qui tombe à côté est un no-op déclaré. Le harnais mesure
qu'**exactement un** des deux ouvre la garde, en été comme en hiver : zéro
signifierait aucun mail, deux signifieraient deux mails le même matin.

⛔ **ET LA GARDE A FAILLI NE JAMAIS S'OUVRIR.** Écrite d'abord
`Number(Intl.DateTimeFormat('fr-FR', …).format(d))` — or `fr-FR` rend « 22 h »,
et `Number('22 h')` vaut **NaN**. La garde aurait refusé tous les envois, en
silence et pour toujours : une garde muette et une garde qui marche ont la même
tête en production. Trouvée en interrogeant la fonction sur un instant dont je
connaissais la réponse, avant de l'avoir déployée. On lit désormais la PARTIE
`hour`, on ne parse plus du texte formaté.

**Une deuxième mesure prise en défaut, dans la même séance** : le test qui
cherchait la chaîne `onerror=` dans le HTML criait sur
`&lt;img src=x onerror=alert(1)&gt;` — du texte parfaitement inerte. C'était la
MESURE qui était fausse, pas le code. Elle compte maintenant les **balises
vivantes** issues du grain, qui est la vraie question.

**Le mail est BORNÉ, comme l'écran l'a été le matin même** : cinq gestes
énumérés, le reste compté (« … et 11 autres, sur la table de marche »). Au
6 septembre il y en avait seize — seize lignes dans un mail du matin ne se
lisent pas, elles se scrollent, et un mail qu'on ne lit pas fait tomber tout le
dispositif.

**Ce qui reste à Paul** : trois variables sur le projet Vercel `ultima`
(`RESEND_API_KEY`, `FINUBAR_MAIL_A`, `CRON_SECRET`). Sans elles la route sort en
503 sans rien envoyer — fail-closed, jamais un envoi à moitié configuré.

---

## 2026-09-06 — Directive DR : le dry run devient systématique

**Décision de Paul, dictée en fin de séance** : instaurer une **quatrième
directive maîtresse**, DR, aussi puissante qu'EB, JL et EL. Là où EL exige que
le **comment** soit défini avant, DR exige que le **résultat** soit ré-éprouvé
après. *Rien n'est réputé bon parce que c'était vert au moment où on l'a écrit.*

**Trois déclenchements par jour** : dès qu'une séance dépasse 20 minutes de
travail effectif, puis à 12 h et à 18 h (heure de Paris) en séance autonome.
Routine `trig_0167KbEvowp7FXjpfXUVYQig`, cron `0 10,16 * * *` en UTC,
notification push à Paul.

**Ce qui l'a motivée, et c'est mesuré, pas théorique.** Le même jour, sur
`artisan-builder`, un dry run de fin de séance a trouvé **quatre failles dans du
code livré vert le matin même** :

1. **La CI ne lançait pas les tests.** Trente cas unitaires n'avaient jamais
   tourné en intégration continue ; le job faisait `tsc` puis `build`. Un check
   vert se lisait comme « tout va bien » alors qu'aucune assertion n'avait été
   exercée.
2. **Un résolveur de modules dont la chaîne de repli était décorative.** Un
   `try/catch` **synchrone** n'attrape pas le rejet de promesse que rend un
   crochet de résolution Node. Il passait parce que la première extension
   essayée était la seule dont les harnais avaient besoin : *il marchait par
   accident, du seul côté qui n'était jamais exercé.*
3. **Un champ FACULTATIF faisait exister une section de mentions légales** —
   complète d'apparence, vide de toute obligation. Exactement le défaut corrigé
   le matin sur un autre champ, laissé en place sur celui-là.
4. **Rien ne verrouillait** le fait qu'aucune donnée légale (SIRET, adresse du
   siège, n° de police) ne parte vers le modèle. C'était propre par
   construction — et rien ne l'empêchait de cesser de l'être.

**La leçon que DR met sous déclencheur** — elle recoupe des règles déjà écrites
dans `CLAUDE.md`, ce qui est le signe qu'elles ne suffisaient pas sans horaire :
un garde-fou s'éprouve **du côté où il peut être contourné** ; un instrument se
valide **sur un cas dont on connaît déjà la réponse** ; toute recherche
d'absence exige un **verrou de non-vacuité** ; et **on vérifie que les
vérifications s'exécutent** — leur silence se lit comme une bonne nouvelle,
c'est le pire des deux états.

**Le rapport d'un dry run doit dire ce qui a RÉSISTÉ**, pas seulement ce qui a
cédé : sans cette section, un dry run sans trouvaille ne se distingue pas d'un
dry run non fait.

---

## 2026-09-06 (nuit) — Le mail du matin est vivant, et ce qu'il a coûté

**Reçu pour de vrai à 23 h 40.** Le cron partira demain à 7 h.

⛔ **CINQ CAUSES SUCCESSIVES, ET UNE SEULE ÉTAIT DEVINABLE.** Dans l'ordre où
elles sont tombées : le nom de la variable (`CRON_SERET` — un `C` manquant, que
rien ne signalait) · le marqueur `COLLE_ICI_TON_SECRET` laissé littéralement ·
le domaine `renoboostia.fr` non vérifié dans le compte Resend de cette clé · le
destinataire, que le mode test de Resend restreint à l'adresse propriétaire.
Plus une commande `bash` donnée à quelqu'un qui est sous **PowerShell**, et un
terminal resté bloqué en continuation à cause d'un `\` qui n'a pas de sens là-bas.

**LA LEÇON, ET ELLE VAUT POUR TOUT ENDPOINT DE SERVICE.** Les trois premières
causes rendaient TOUTES le même `{"error":"Envoi refusé"}`. Ma route était
discrète *avec son propre propriétaire* — alors qu'elle n'est atteignable
qu'avec `CRON_SECRET`, donc son seul lecteur possible EST le propriétaire. Trois
allers-retours à deviner, là où une phrase suffisait. Corrigé le soir même
(PR #206) : la réponse porte le statut et le corps rendus par Resend. La cause
réelle est apparue **au premier appel** après ce correctif.
*Un silence poli envers son administrateur n'est pas de la sécurité.*

⛔ **ET LA CAUSE QUE J'AI CHERCHÉE AU MAUVAIS ÉTAGE.** Paul avait déjà un récap
Finubar du matin : une **Routine Claude**, invisible depuis le dépôt. J'ai
vérifié le code (aucun cron, aucune brique d'envoi — c'était juste) et conclu
« ça n'existe pas ». Puis j'ai réparé son *prompt*, deux fois, avant de mesurer
que la session lancée par une Routine a `sources: []` et **ne dispose même pas
de l'outil `add_repo`** (`ListConnectors` ne le liste pas). Aucun prompt ne
rattrape un outil absent. *La première question n'était pas « que lui dire de
faire », c'était « d'où cette session tient-elle ses dépôts ».*

**Conséquence immédiate, à traiter :** les deux Routines **DR** créées le même
jour portent la même `sources: []`. La directive DR tournerait à vide dès son
premier passage. La piste est dans les routines de Paul elles-mêmes : « Veille
BTP » utilise `persist_session: true` sur une session persistante, et ses runs
réussissent — une session liée garde ses sources.

**Ce qui a bien marché, et qui vient de DR** : chaque garde-fou de ce lot a été
éprouvé EN ROUGE avant d'être cru — garde d'heure cassée (7 échecs), échappement
retiré (3), cron unique (3), gouttière retirée (le vrai défaut, à 390 px
seulement). Et deux mesures se sont révélées fausses en cours de route : la
garde d'heure écrite `Number(format())` en `fr-FR` rendait **NaN** (elle aurait
bloqué TOUS les envois, en silence), et un test cherchait la chaîne `onerror=`
dans du HTML où elle était parfaitement inerte. Les deux ont été prises en
défaut en les interrogeant sur un cas dont la réponse était connue.

---

## 2026-09-06 (nuit, solo) — Dry run du travail de la soirée, appliqué à moi-même

Premier passage de la Directive DR sur du code que je venais d'écrire. **Trois
trouvailles, et la troisième est la plus instructive.**

**① UN BOUTON QUI MENT, entré par la porte que je ne surveillais pas.**
`js/leo-partout.js` vérifiait la session avant de poser le bouton — et
`window.UltimaLeo` seulement **au clic**. Si `js/leo-accueil.js` n'avait pas
chargé (ordre des balises, erreur réseau, page qui l'oublie), le bouton
s'affichait et ne faisait **rien**, en silence. C'est exactement le défaut que
le bandeau de ce module interdit en toutes lettres — « un bouton qui ment » —
et je l'avais laissé passer par l'autre porte. Les deux gardes tombent
désormais AVANT le bouton. Verdict `smoke-leo-partout` §8, avec un **verrou de
non-vacuité** : la session y est stubée OUVERTE, sinon l'absence de bouton
viendrait du fail-closed de session et le test serait vert pour la mauvaise
raison.

**② LA GARDE LA PLUS SENSIBLE N'AVAIT AUCUN TEST.** La route du mail déclenche
un ENVOI et n'est protégée que par `CRON_SECRET` — et tous les harnais du lot
portaient sur la composition du message, c'est-à-dire le côté qu'on emprunte
tous les jours. §6 de `unit-finubar-matin` appelle le handler pour de vrai :
variable absente, en-tête absent, mauvais secret, secret sans préfixe, secret
PRÉFIXE du bon, méthode refusée, et les URL approchantes (`?force=12`,
`?xforce=1`, `?force=0`) qui ne doivent pas lever la garde d'heure.

⛔ **③ ET MON PROPRE TEST ÉTAIT FAUX — l'épreuve en rouge n'a rien attrapé.**
En rendant la garde permissive (`if (secret && …)`, le contournement classique),
le harnais restait **VERT**. Raison : la route rend `503` dans DEUX cas
distincts — « Service non configuré » (la garde refuse) et « Envoi non
configuré » (Resend manque) — et je ne regardais que le code HTTP. Une garde
grande ouverte passait donc mon test de garde. Corrigé : on exige le **motif**,
et on pose `RESEND_API_KEY` pour que le second 503 ne puisse pas masquer le
premier. Rejouée, l'épreuve vire au rouge.

*C'est la démonstration la plus nette de la règle du 2026-08-17 : un harnais
qu'on n'a pas vu échouer ne prouve rien — et ici, ce n'est pas le code qui
mentait, c'est l'instrument.*

---

## 2026-09-07 — passage DR de 12 h : cinq défauts, et deux règles que la séance a payées

Premier passage réel de la **Directive DR** (Routine de 12 h, session
persistante). Cinq défauts trouvés dans le code de la veille, tous corrigés dans
le même passage, plus la **boucle n°1 fermée** sur go de Paul. PR #215 fusionnée
(`f927887`), PR #216 ouverte.

### Ce que la séance a appris, et qui vaut au-delà d'elle

**⛔ UNE HYPOTHÈSE NON RETESTÉE APRÈS QUE LE CONTEXTE A CHANGÉ EST UN FAIT
FAUX EN SURSIS.** Le clone des dépôts voisins échouait — mesuré — *avant*
`add_repo`. Je ne l'ai pas rejoué *après*, et j'ai écrit dans le rapport d'un dry
run que « le clone direct échoue toujours ». Il fonctionne. Toute une conclusion
opérationnelle en dépendait : trois dépôts déclarés inexaminables l'étaient.
*Corollaire : quand une action change l'état du monde (attacher un dépôt,
poser une variable, fusionner une PR), les mesures d'avant ne valent plus —
elles se rejouent, elles ne se citent pas.*

**⛔ UNE SONDE QUI RÉPOND TROP UNIFORMÉMENT MESURE LA MAUVAISE CHOSE.** Ma
première sonde du grain annonçait « 2 champs hors borne » en appliquant `180` à
tout champ texte. Faux : le moteur distingue deux régimes (`texteBorne` 400 /
`recit` 180) et **déclare lui-même** la liste `CHAMPS_RECIT`. J'ai réécrit deux
textes sans raison — et appauvri le `cap` d'Ultima au passage, qui a perdu
« avec Léo pour seule interlocutrice ». Rendus à leur état d'origine.
*La bonne version de la règle du 2026-08-17 : ne pas seulement valider
l'instrument sur un cas connu, mais lui demander SUR QUOI il porte — et prendre
cette liste dans le code qui l'applique, jamais dans sa propre tête.*

### Les cinq défauts

① Le motif de refus de Resend porte des adresses : celle de Paul partait dans
les logs Vercel. Caviardée avant le log ET la réponse, et **avant** la coupe à
400 (couper d'abord laisserait la moitié d'une adresse tranchée).

② La porte du cron n'était éprouvée par aucun test. ⚠️ **Une session parallèle
l'a trouvé le même matin (#210), et sa version était meilleure** — elle exigeait
le *motif* du 503, là où la mienne ne regardait que le code. Le rebase a gardé la
sienne, augmentée du seul apport propre de la mienne : le **comptage réel des
envois**, qui transforme son « aucun de ces cas n'atteint l'appel sortant » —
une hypothèse écrite — en mesure. Au cassage : le code dit « 200 », le compteur
dit **2 envois par des anonymes**.

③ La mesure de fraîcheur était **muette** sur un grain jamais rattaché
(`commit: "à renseigner"`) : un `if` sans `else`, bâti pour le squash et pas
pour l'absence. `mesurerGit` **extraite** — enfermée dans un CLI, elle n'était
appelable par aucun harnais, et c'est pour ça que le défaut y a dormi.

④ **La collecte écrasait l'agrégat des huit dépôts** (5 lus → 1), et c'est ce
fichier que lit le mail du matin. #214 avait diagnostiqué le même défaut le matin
même **sans le corriger**. Cran de sûreté d'abord (refus d'écrire), puis le
correctif de fond sur go de Paul.

⑤ Quatre notes du grain sont **coupées au mot** (927, 311, 228 contre 180), donc
tronquées dans `/finubar` et dans le mail. ⛔ Le fait aggravant est un
**enchaînement** : le seul mécanisme qui signale ces coupes est la collecte, que
la boucle n°1 rendait impossible. *Garde-fou muet par construction.* Trois
restent à arbitrer (raccourcir, ou relever `MAX_RECIT`).

### La boucle n°1, et où se joue vraiment ce genre de correctif

Garder les grains a marché du premier coup. **Le travail était ailleurs** :
empêcher qu'un grain gardé se fasse passer pour une mesure du jour — sinon on
remplace une perte franche, visible et corrigible, par un mensonge tranquille.
D'où `mesure_le` qui ne se redate JAMAIS (éprouvé en rejouant deux fois : une
note d'un mois qui se redate paraît fraîche à perpétuité — invisible le premier
jour, totale au bout d'une semaine), les champs dérivés jetés, et **la mention
portée jusque dans le mail** : le pre-mortem n'était couvert qu'à moitié tant
qu'elle n'y était pas.

### Deux défauts de mon propre travail, trouvés en l'exécutant

Le rapport de collecte annonçait « 3 dépôts non attachés » puis en listait
**sept** — le compteur excluait les repris, la liste non. *Un chiffre que sa
propre liste dément apprend à ne croire ni l'un ni l'autre.* Et `--partiel`, que
ma propre garde recommandait, **ne marchait pas** : lu comme la date, il sortait
avant la garde. Attrapé par le verrou de non-vacuité — *une garde se valide
aussi sur ce qu'elle LAISSE PASSER.*

### Sur la Routine DR elle-même

Trois limites annoncées dans sa consigne étaient fausses : les outils MCP sont
présents, `add_repo` fonctionne, et le contrôle du jalon V0 était faisable — il
a été fait (`audits_v0 = 1`, V0 **confirmé franchi** ; mais `audits_avec_aides =
0`, le calcul mergé le matin n'a **aucune preuve d'usage**). *Une consigne qui
énumère des limites se vérifie comme le reste.*

---

## 2026-09-13 — Le radar de recherches Google : DEUX outils, pas un

**Tranché par Paul**, après avoir vu la console admin livrée le jour même :
*« on part bien sûr 2 outils différents »*.

### Ce que la décision sépare

| | Pour qui | Où | Ce qu'il montre |
|---|---|---|---|
| **Le potentiel** | l'artisan prospect | page publique, dans le simulateur de zone existant | un **ordre de grandeur** de la demande exprimée dans SA zone, à côté du marché ADEME — jamais additionné avec |
| **La boussole** | Paul seul | console admin `radar.html` | la **courbe mensuelle** : saisons, effets d'aubaine, pics d'actualité, veille calibrée par région |

⛔ **Pourquoi deux et pas un.** Ils n'ont ni le même public, ni le même niveau
d'accès, ni la même unité de lecture. Le premier doit sous-promettre devant
quelqu'un qui connaît son métier mieux que nous ; le second doit tout montrer, y
compris le bruit, parce que c'est dans le bruit que se voit une recherche qui
monte avant d'avoir un nom. Un seul écran pour les deux aurait forcé un
compromis qui aurait mal servi les deux.

### La contrainte d'exécution qui en découle

Les volumes Google **ne se versent pas** dans `volumes_par_departement` du
référentiel public : ce champ porte des *foyers ayant fait un audit* (ADEME), pas
des *recherches par mois*. Deux unités dans un même champ, que le moteur somme,
produiraient un nombre qui ne veut rien dire. Google prend **son propre champ**.

### Et la consultation, posée dans la foulée

Paul : *« il faut une cohérence par zone et facile à obtenir et à consulter —
mettons que les résultats s'affichent et peuvent se télécharger en 4 clics »*.
Les quatre : **zone** (liste des zones RÉELLEMENT relevées, pas un champ libre)
→ **métier** → **Regarder** → **Télécharger**. Le champ libre actuel laisse
choisir une commune que Google connaît mais qu'on n'a jamais relevée : la liste
supprime le défaut à la racine au lieu de l'expliquer après coup.

### Ce que la même séance a payé

Voir `memoire/LECONS.md` §4 — *la cohérence géographique se vérifie avant de
mesurer*. Le premier import a porté sur l'Oise (0 client) alors que les clients
sont dans le Rhône (106).

## 2026-09-24 — Méthode : une PR par séance, en fin de séance

Paul : *« on bosse, on bosse, et la PR ne passe qu'à la fin ; plus de previews »*.
Décision consignée dans `CLAUDE.md` §Règles permanentes. Pendant la séance :
commit + push de la branche → preview Vercel ; tests en local. En fin de
séance : une PR, fusionnée sur go de Paul.

## 2026-09-24 — RenoBoost : commission 5 % seulement dès 10 000 € HT

Grille inchangée (300 / 600 / 950 € HT/mois). Commission de 5 % du devis HT
uniquement sur les chantiers signés ≥ 10 000 € HT, seuil inclus, jugé chantier
par chantier. Fusionné dans RenoBoost (#544, `26cc92c`) ; règle dans
`RenoBoost/CLAUDE.md` §12.6.

## 2026-09-25 — Carte céleste : A1 et A6 rendus, rien ne se code sans go explicite

Paul, sur `CADRAGE-2026-09-25-carte-celeste.md` §8 : **A1 « go reco »** → le
dépliage au survol est retiré de la racine des coques (cause mesurée du clic
raté sur NAGA : 4 gestes sur 5, l'étoile part de 119 px sous le curseur).
**A6** : *« cadrage d'abord et précision du travail, pas de travail sans mon go
explicite »* → le lot 1 est précisé à la ligne (§11), et **aucune ligne de code
ne s'écrit sans un go explicite**, lot par lot. A2 à A5 restent ouverts.

## 2026-09-26 — Carte céleste : A2 à A5 rendus sur la recommandation

Paul : *« A2 reco, A3 reco, A4 reco, A5 reco — cadre »*. **A2** la figure est un
arbre calculé · **A3** `PRODUCT.md` remplace `PRODUIT.md` pour la vérité
produit · **A4** pas de vue à plat des dépôts · **A5** l'éclat dit le rang et le
signal, jamais la fraîcheur. A6 tient : rien ne se code sans go explicite.
Lots 0, 2, 3 précisés dans `CADRAGE-2026-09-25-carte-celeste.md` §14.

⚠️ **A3 précisée, pas renversée** : `PRODUIT.md` porte aussi le modèle de
données, le contrat d'API et les conventions du front, que quatre agents
déclarent obligatoires. Ils y restent ; seule la vérité produit déménage.
Deux arbitrages nouveaux : **A7** (retirer du lot 3 l'« anneau de Léo » au
survol, qu'aucune donnée ne porte — reco oui) et **A8** (couronne ou figure,
sur capture de la maquette).

## 2026-09-26 — Lot 0 livré : PRODUCT.md, et A7 rendu

Paul, « ok » sur le go du lot 0 et sur A7. **A7** : l'« anneau de Léo » au
survol d'un dépôt sort du lot 3 — aucune donnée ne porte ces droits ; il
reviendra avec J3. **Entretien d'init** : les trois inférences confirmées telles
quelles (Paul seul · l'interface unique avec Léo · quatre engagements : antique
et sérieux, sécurité relevée, compter sans reprocher, le ciel est la
navigation). `PRODUCT.md` écrit ; `PRODUIT.md` réduit à ses contrats techniques.

## 2026-09-26 — Lot 2 : la figure est prête, A8 et A9 attendent Paul

Go de Paul, « go lot 2 ». Moteur prêt en options inactives, maquette V0/V1/V2
critiquée par impeccable (deux évaluations isolées, constats vérifiés par la
mesure avant correction). **Corrigé en production au passage** : le clavier
faisait pivoter la caméra et couchait la constellation (877 px → 0). **A8 :
recommandation V1**, V2 n'égalant pas V1 sur les critères mesurés. **A9 ouvert** :
lisibilité des noms au téléphone (7,5 px), noms en Georgia, cartouche de figure,
caméra 3D. Détail : `CADRAGE-2026-09-25-carte-celeste.md` §17.

**26/09 — A8 et A9 rendus : « A8 reco, A9 reco ».** V1 (couronne + arbre +
éclat par le rang) ; la variante figure sera retirée à l'activation. Lot 2a
(noms ≥ 11 px CSS et en Georgia sur les coques) **avant** le lot 2b
(activation) ; caméra 3D conservée. Mesure qui corrige A9-1 : le plancher 7,5
est en unités de viewBox et rend 6,5 px au téléphone. Détail : §18.

**26/09 (fin d'après-midi) — « sauvegarde de palier ».** Lot 2a et socle livrés sur
la branche. Audit : S1 (noms Finubar injectés en HTML dans le cartouche) corrigé par
`echapper()` — **reste exposé en production jusqu'à la fusion de #293**. Choix fait
seul sur mandat (« résous ça ») : au téléphone, sur l'accueil, la parole se retire ;
le résumé n'y est plus dit. Variante « figure » retirée (A8). Détail : §20–§21.

**26/09 (soir) — « Go merge tout ».** #293 fusionnée en squash (`4244999`) : S1 fermée
en production. Correctifs demandés sur iPhone : bandeau Finubar replié au téléphone
(la date et le compte restent lus), retour « ↞ GRIMA » sur RIVEN (application
installée = pas de bouton retour), retour d'ALTHEA vers la racine. Détail : §22.

## 2026-09-27 — La carte céleste bouclée ; DOKLĚS et SYMPHO sous ALPHA

**Décisions de Paul, dans l'ordre** : « tutoiement » (l'écran de connexion tutoie,
comme Léo) · « go lot 2b » (V1 activée : figure et rang sur les coques) ·
« diagnostic puis go la suite » (au téléphone, l'accueil se replie un cran plus bas
et chaque étoile se touche à 44 px, bornée à mi-chemin de sa voisine) · « go lot 3 »
(un lien vers un dépôt s'ouvre sur lui) · « go PR et merge » (#296, `6b08583`).

**Cadrage DOKLĚS / SYMPHO, rendu sur quatre questions** : DOKLĚS = la marque « ECL by
DOKLES » ; SYMPHO = un projet pro ; les deux **sous ALPHA**, en **étoiles d'attente**
(nom, « À venir », une phrase, aucune page) ; phrases proposées acceptées ; résumé
d'ALPHA complété. Graphie **DOKLĚS** (e caron) — identifiant `dokles`.

**Choix faits seuls, sur mandat, et à savoir** : un nom qui en croiserait un autre
passe au-dessus de son étoile (menus seulement) ; la marge basse du ciel est
plafonnée à 50 % de la hauteur au lieu de 40 % (le socle complet en prend 45 % au
bureau). Détail : `CADRAGE-2026-09-25-carte-celeste.md` §25 à §28.

## 2026-09-28 — Leçons v42 partout ; YCOME abandonné ; LV6 conditionné

**Décisions de Paul** : « go propagation LEÇONS v42 » · « le domaine est déjà
vérifié » (`renoboostia.fr` chez Resend — retiré des bloqueurs) · « abandonné YCOME
[…] je ne travaille plus pour lui — cadre cette possibilité » · « on ne passe à LV6
que quand tout est propre ».

**Fait** : v42 fusionnée sur huit dépôts, identique octet à octet à la source
(RenoDevis #207, RenoAgenda #103, RenoPredict #79, renoboost-console #10,
mon-dpe.fr #219, artisan-builder #89, Artidispo #95, DATARENO- #40).
**RenoBoost retenu** : sa copie v38 porte deux leçons qui ne sont pas dans v42 ;
l'écraser les aurait perdues. **ripair** exclu : hors de `depots.json`, fork
partagé avec un tiers.

**YCOME** : retrait cadré, non exécuté — `CADRAGE-2026-09-28-retrait-ycome.md`.
**Région Vercel** : mesurée, production en `iad1` (Washington), base en
`eu-west-3` (Paris) ; le passage en `cdg1` reste un gate.

**28/09 (après-midi) — « Go » : YCOME retiré d'Ultima.** Nœud, lien d'ALPHA,
phrase de Léo, repli `noscript`, étiquette du blason `portail` (gardé : DOKLĚS
et SYMPHO le portent). Les garanties d'étoile d'attente sont **reciblées** sur
DOKLĚS (SYMPHO en témoin), pas supprimées. Lexique et radar marqués
« abandonné », pas effacés. Dépôt GitHub et projet Vercel : gestes de Paul.

**28/09 (soir) — « go v43 ».** Les deux leçons propres à RenoBoost (lien Calendly,
27/09 ; « quatrième fois », 25/09) absorbées dans la source, avec leur provenance ;
re-scellé v43 (`a5d10eb36b49`) et propagé octet à octet aux neuf autres dépôts,
RenoBoost compris. Avant d'écraser, chaque copie cible a été comparée à v42 :
toutes identiques, aucune leçon locale perdue.

**29/09 — Restructuration OMEGA.** Paul (dictée) : « Ultima, c'est le nom du
projet, pas de la subdivision ». L'écran « Ultima » devient **OMEGA** ; ALPHA
(pro) reste, placé **avant** OMEGA à l'accueil. **GRIMA et NAGA supprimés** : OMEGA
est une carte unique (RIVEN, NICOL BOLAS, IMLADRIK). **IMLADRIK devient
macro-projet** de développement et de gestion des projets personnels : il porte
désormais MAEDRETHNIR, VRANESH, DRAUKHAIN **+ ADRAMELECH + TAO** (arbitrage Paul).
Redirections : /ultima, /grima → /omega ; /naga → /imladrik. Mesuré : 45/45
unitaires, 51 smokes/52 (seul rouge : `cadenceTenue_a1670_charge3`, rouge AVANT
toute modification, cadence chronométrée propre au conteneur).
**IFULVIN** dicté le même jour : constellation des ARMES (IFULVIN, réseau en
cercles concentriques, « Magnum Opus ») + constellation des DRAGONS (les 3 caps).
Cadré, non codé : `CADRAGE-IFULVIN.md`. Graphie **IFULVIN** — « Ifu » n'existe pas.

**30/09 — IFULVIN, boucle A : la règle « ≥ 2 caps » assouplie pour les
constellations (option 1, Paul).** Drapeau explicite `constellation: true` : une
boussole dès UN cap, et seulement sur ce drapeau — un nœud ordinaire qui perd un
enfant reste signalé. IMLADRIK = constellation des ARMES (IFULVIN, étoile
d'attente) + constellation des DRAGONS (MAEDRETHNIR, VRANESH, DRAUKHAIN) +
ADRAMELECH + TAO. Défaut trouvé en vérifiant au navigateur : un cap sans page mais
avec des enfants était marqué `aria-disabled` (annoncé mort, alors qu'on y plonge)
— corrigé, même partage qu'`entrer()`.

## 2026-09-30 — Bouclage transverse des huit dépôts : six réponses de Paul

**Décisions de Paul**, dictées en réponse au registre « ⏳ ce que toi seul peux
faire » de la séance de bouclage (PR Ultima-#312) :

1. **`renoadomicile.fr` expire le 16/10, et la page de désinscription de
   DATARENO est à vérifier en ligne** — « ok » : pris en charge par Paul.
2. **Stripe LIVE côté Artidispo** — « envoie le lien » : le contrôle se fait sur
   `https://artidispo.com/#/espace`, connecté. Le bandeau « Paiement en mode
   TEST » (`Artidispo/src/espace-artisan.js`, `bandeauMode()`) disparaît quand la
   clé live est posée.
3. **Régénérer le refresh token Google Ads (capture du 07/09) et le
   `CRON_SECRET` d'Ultima (06/09)** — « abandonne ». Retirés des grains
   (RenoBoost, Ultima). ⚠️ Le risque demeure tant que les valeurs ne changent
   pas ; il n'est plus suivi, par décision.
4. **Les Routines DR de 12 h et 18 h** (les v2, désactivées le 28/09 au profit
   d'une Routine créée dans l'interface, invisible depuis une séance) —
   « abandonne aussi ». Le rappel du 26/10 (passage à l'heure d'hiver), qui
   visait des Routines inexistantes, est supprimé. ⚠️ Le texte de la Directive DR
   du `CLAUDE.md` n'est PAS modifié : « abandonne » peut viser la vérification
   comme la directive elle-même, et un texte de directive ne se change pas sur
   deux mots dictés.
5. **RénoDevis — rejouer le parcours TVA en production, trancher le jeu de démo
   Batimat** — « il faut qu'on bosse dessus » : ce n'est plus un geste de Paul
   seul, c'est une séance de travail commune (grain RénoDevis, prochaine action).
6. **Le mail à Ezzedine (artisan-builder)** — « c'est déjà parti ». Boucle fermée ;
   ses quatre réponses restent attendues.

**Fait dans la même séance** : #302 intégrée (et la décision du Cercle, qui
n'était écrite que dans sa description, reportée dans
`CADRAGE-RESEAU-CERCLES.md` §4) ; `LECONS.md` v45 (12 leçons rapatriées des
grains) propagée aux huit dépôts ; la CI ne tourne plus deux fois par push
(RenoAgenda, RenoPredict, RenoDevis, DATARENO) ; `main` de RenoBoost remis au
vert (débordement à 320 px venu du calendrier, pas d'un commit) ; la collecte
Finubar ne perd plus les boucles écrites en texte nu.

**30/09 — Boucles B et C d'IFULVIN (#316).** Nébuleuses : ARMES en cinabre, DRAGONS
en vert-de-gris (spéc. `graphisme`), peintes par la couche de fond. Puis, dicté par
Paul : **TAO supprimé partout** (coquille sans donnée) ; RESHIRAM, ZEKROM et
ADRAMELECH rejoignent les DRAGONS ; **étoiles indépendantes**, seule la passerelle
RESHIRAM ⇄ ZEKROM les relie (`asterisme: false`). IMLADRIK = ARMES + DRAGONS.
Défauts trouvés en chemin et corrigés : noms des menus sous 4,5:1 à 390 px
(passés en crème) ; nom de la passerelle traversé par son trait (recul calculé sur
la boîte du texte). ⚠️ Conséquence à arbitrer : RESHIRAM et ZEKROM ne sont plus
« opposés » (souhait du 17/08).

**30/09 (suite) — Arbitrages Paul.** ① Gémeaux RESHIRAM/ZEKROM non opposés :
« pas grave », on garde. ③ **Un bandeau par constellation**, et une règle
générale : *le bandeau est cohérent avec l'affichage et les données, et minimisé
pour ne pas gêner la vue.* Mis en œuvre : sous isolement, le bandeau prend le
surligne et le titre du foyer quand le registre les porte (sinon celui de la
page), et se réduit (sceau 32 px, titre d'un cran). ② Les trois arbitrages
IFULVIN (CADRAGE-IFULVIN.md §⑤) ont été redonnés à Paul : en attente.
**30/09 (suite) — IFULVIN remplace « Le Cercle ».** Arbitrage ① rendu (« oui
remplace ») ; ② entrée dans un cercle et ③ noms des niveaux : « on verra ». Le
numéro ADR-005 de la capture du 21/09 collisionnait avec CHAMBRE CLAIRE : il
n'est plus à saisir.

## 2026-09-30 — La chaîne Rénoboost, de la demande au client fidèle : cadrée, validée, routée

Séance ouverte sur « la chaîne totale » évoquée les jours précédents. **Aucun
code produit, aucune fusion** (Paul : « On ne fusionne rien »).

**Décisions de Paul, dans l'ordre :**
1. Bibliothèque d'abord : `moissonner.py` garde la dernière version d'un devis
   (RenoDevis #214, en relecture). Relevé : reprendre le pilote V3. Déchèterie :
   la plus proche suffit, et reportée.
2. Tri des boucles en familles **A → E**, validé. ④ Commande et suivi reste en
   **cadrage seul**, à valider avec les pros. 3D : **test sans code d'abord**.
3. « Kelvin » = l'outil de la maquette (kelvin°) ; notre version = **VITRUVE sur
   les briques de mon-dpe.fr**.
4. **La maquette des onze écrans validée sans modification.** Chaque écran porte
   ses outils, réels ou imaginés, et **Réno suit toute la chaîne**.
5. La route se tient **dans Ultima** : `PLAN-2026-09-30-chaine-A-Z.md` (PR #321).
   **Q-P1** : la chaîne est bouclée quand un dossier réel va de M0 à M9 dans les
   outils, sans ressaisie, suivi par Réno. **Q-P2** : les boucles hors écrans
   forment la famille **N**, après C, avant D. **Q-P3** : chaque boucle livre le
   connecteur Réno de son maillon. **Q-P4** : la famille **B** avance pendant que
   les gestes A attendent Paul.

**Où c'est écrit** : l'inventaire et le raisonnement dans RenoBoost
`CADRAGE-2026-09-30-chaine-A-Z.md` (#563) ; la maquette dans RenoBoost
`maquettes/chaine-A-Z/` ; la route et l'état vivant dans Ultima (#321).

## 2026-10-04 — Les DRAGONS portent leur épithète ; ZOH SHIA, le dragon de la technologie

Dicté par Paul : *« Je veux que ne s'affiche comme titre pour les étoiles que
ça : VRANESH - Dragon du futur… Et un nouveau : ZOH SHIA - Dragon de la
technologie »*.

**Décisions de Paul :**
1. **MAEDRETHNIR est gardé.** La liste dictée disait « MINETHNIR », l'ancien nom
   renommé le 17/08 (171 occurrences) ; Paul confirme : on garde MAEDRETHNIR.
   ⚠️ « Minethnir » dicté devant « Dragon de la vérité » = MAEDRETHNIR.
2. **Deux lignes** : le NOM, puis « Dragon de… » dessous. L'état (« Ouvert »,
   « Privé ») ne s'affiche plus pour ces étoiles, ni dans le ciel ni dans le
   cartouche de Léo, où l'épithète prend sa place.
3. **ZOH SHIA** regroupe toute la technique de Paul. Premier élément : l'outil
   automatique de création de devis (RénoDevis) et tout son fonctionnement,
   **pour un autre artisan**. ⚠️ J'avais écrit ici « cloner (nouvelle
   instance) » : c'était mon interprétation. Précisé par Paul à la boucle 2 —
   **option A, ajouter l'artisan à la plateforme existante** (entrée suivante).

**Livré (boucle 1)** : le champ `epithete` du registre (sept dragons) ; la
seconde ligne dans le moteur du ciel (`js/ciel.js`, un `<text>` à part — le
texte de `.ciel-nom` reste le nom seul) ; ZOH SHIA en étoile d'attente (sans
page, blason « portail » comme IFULVIN) ; repli sans JavaScript à jour ;
harnais `tests/smoke-dragons-epithetes.mjs` (six largeurs).

**Ce que la mesure a appris, et que la relecture n'aurait pas vu** : à 360–414
px, DRAUKHAIN n'avait AUCUNE place — dessous, sa seconde ligne mordait le cœur
d'ADRAMELECH ; dessus, l'épithète de VRANESH. D'où la pose À CÔTÉ de l'étoile
(convention des cartes gravées), réservée aux noms à deux lignes : les noms
d'une ligne gardent leur comportement au pixel. Et un halo plus épais faisait
BAISSER le contraste mesuré (4,82 → 4,25) ; c'est la lettre blanche qui l'a
relevé (pire 5,79).

**Reste (boucle 2, à cadrer)** : le contenu de ZOH SHIA — la fiche « cloner
RénoDevis chez un autre artisan ». ⛔ Elle POINTE les sources de RénoDevis
(CLAUDE.md, migrations, `lib/`), elle ne les recopie pas.


**Le même jour, devant le cartouche des DRAGONS au repos** : *« Enlève cela,
ça prend de la place »*. Un écran de constellation (DRAGONS, ARMES) n'affiche
plus de cartouche tant qu'on ne survole rien : le fil d'Ariane dit déjà où l'on
est. Le cartouche revient au survol d'une étoile. Sa place en bas reste
réservée — sans elle, le cartouche du survol recouvrirait les étoiles du bas.

## 2026-10-04 — ZOH SHIA, boucle 2 : la techno de RénoDevis vit dans Ultima

**Décisions de Paul :**
1. **Option A** : un nouvel artisan rejoint la plateforme existante, comme SOLA.
   ⚠️ Correctif de l'entrée précédente : j'y avais écrit « cloner (nouvelle
   instance) », ce qui était mon interprétation, pas sa décision.
2. *« La techno, ce qui la compose, doit vivre dans ZOH — toute la techno
   RenoDevis doit y vivre : le but est de pouvoir l'invoquer pour dupliquer
   aisément pour un autre artisan. »*
3. *« Implante réponses aux pré-mortems et aux dangers. »*

**Livré** : `zohshia/` (README, `renodevis/TECHNO.md`, `renodevis/AJOUTER-UN-ARTISAN.md`,
`renodevis/collecter.mjs`, `renodevis/inventaire.json`), la compétence
`zohshia` (l'invocation), `tests/unit-zohshia.mjs`, l'exclusion du déploiement
et le préfixe privé `/zohshia` du middleware.

**Ce que la mesure a appris (RénoDevis `4400cd3`)** :
- **8 tables** lues par le code ne sont créées par aucune migration du dépôt :
  le clonage d'instance (option B) n'est pas possible aujourd'hui.
- **39 fichiers de code** nomment SOLA ou portent un identifiant écrit en dur :
  un deuxième artisan hériterait des règles de SOLA. Les généraliser est le
  vrai chantier de la duplication — à cadrer à part.
- **Aucune fonction ne crée de compte, aucun écran n'écrit `profile_id`** :
  l'étape la plus fréquente est manuelle.
- La collecte rendait d'abord 38 variables pour 39 : un appel `listeEnv(` coupé
  sur deux lignes échappait à `git grep`. Trouvé en comparant à une liste
  connue d'avance ; le test exige désormais cette variable nommément.

**Reste** : une page à l'écran pour ZOH SHIA (route authentifiée nécessaire) ;
la généralisation des règles SOLA ; l'automatisation des étapes manuelles.

**Suite du 04/10, rapporté par Paul** : *« Le lien affiche une erreur »* —
`/zohshia/renodevis/inventaire.json` sur la preview de #344 n'est pas servi
(la session, bloquée par la protection Vercel, n'avait pas pu le constater).
*« Le crédit est rechargé depuis hier soir »* — le blocage Anthropic du 02/10
est levé ; FINUBAR et CADRAGE-ULTIMA mis à jour (non remesuré par la séance).
Direction donnée pour la suite : *« les règles écrites pour SOLA, certaines lui
sont propres : tarifs de son fournisseur, coût de sa main d'œuvre… ce sont des
choses à rendre neutres, garder l'ossature pour rendre la techno aisément
duplicable »*.

## 2026-10-04 (après-midi) — ZOH SHIA devient la techno PURE ; RénoDevis reste tel quel

Paul, dicté : *« dans ZOH SHIA on garde uniquement la technologie en pur — je ne
veux pas de données techniques et je ne veux pas de nom d'artisan ; je veux la
technologie elle-même, avec tout ce qu'elle fait, ce qu'elle comporte. Le cas de
l'artisan avec qui je travaille déjà, je l'ai déjà dans RénoDevis. »* (« Zosia » =
ZOH SHIA, « Zoom » = RénoDevis.)

**Décisions :**
1. **La neutralisation du code de RénoDevis est ABANDONNÉE** (L1 à L4). La PR
   RénoDevis #272 (L1, profil de règles) est **fermée sans fusion**. RénoDevis
   reste l'outil de l'artisan pilote, tel qu'il est. ⚠️ L0 (#271, fusionné) est
   conservé : il empêche les devis modèles d'un artisan d'être proposés aux
   autres comptes — utile quoi qu'il arrive.
2. **ZOH SHIA = le plan de la techno, sans code** (option A), sans aucun nom
   d'artisan, de client, de fournisseur ni de marque, sans aucune valeur propre à
   un pro. Les noms techniques (tables, routes, variables) sont gardés.
3. L'extraction du **code** neutre (option B) viendra après, sur ce plan.

**Livré** : `TECHNO.md` réécrit en plan complet (parcours, mécanismes, données,
routes, services, sécurité) ; le guide de mise en service sans référence à un
artisan existant ; la collecte qui neutralise les noms propres et refuse d'écrire
s'il en survit un ; la liste des noms bannis HORS de `zohshia/`
(`outils/zohshia/noms-propres.json`, non déployé) ; le test qui la fait respecter
partout, éprouvé par sept sabotages et un miroir.

## 2026-10-04 (soir) — ZOH SHIA livre un code et une base prêts ; un badge par techno ; PR #345 fusionnée

Paul : *« ZOH : j'intègre un nouvel artisan ; fournis-moi un code et une base
prête, donne-moi la check-list des infos nécessaires pour mettre la techno
RénoDevis à jour pour lui »* — puis *« dans ZOH je veux un badge par techno […]
et le contenu est dedans »*, et *« vas-y pour ce que tu peux faire »*.

**Décisions :**
1. **ZOH SHIA ne STOCKE pas de code** : il porte le plan, la check-list, la base
   neuve et l'outil qui EXTRAIT le code neutre d'un commit du dépôt de
   référence, à la demande (validé par Paul : « ça me va »). Une techno n'y
   entre que si elle existe déjà et tourne en vrai.
2. **Deux voies** pour un nouveau pro : rejoindre la plateforme existante, ou
   une instance à lui (son code, sa base). La check-list sert aux deux.
3. **La recette de neutralisation vit hors de `zohshia/`** (`outils/`, non
   déployé) : elle nomme ce qu'elle retire. Série = retraits par motifs + diff
   appliqué en 3 voies.
4. **Valeurs d'instance retirées du code neutre**, remplacées par des valeurs
   d'EXEMPLE marquées comme telles (relevé) ; noms de l'équipe retirés aussi.
   RénoBoost, `ria` et mon-dpe.fr gardés (validé).
5. **L'écran ZOH SHIA** : un badge par techno, réservé au PROPRIÉTAIRE ; même
   garde posé sur Finubar (l'inscription au projet d'authentification est
   ouverte — mesuré).
6. **Fusion de #345** sur ordre de Paul (« tu fusionnes la PR 345 »), squash
   `97c3cd1`, tête vérifiée `367fd81`, CI verte — AVANT que
   `ULTIMA_PROPRIETAIRES` soit posée : Paul met de côté la variable Vercel et la
   fermeture des inscriptions. Conséquence assumée : ZOH SHIA et Finubar
   répondent « accès réservé » en production tant que la variable manque.

**Livré et prouvé** : base neuve rejouée et validée par la base de référence en
lecture seule (0 écart) ; extraction complète sur RénoDevis `7d21217` — 492
fichiers sans nom propre, typage sans erreur nouvelle, 931 tests, build vert ;
sabotages au rouge à chaque étage.

## 2026-10-04 (soir) — dry run de la séance ZOH SHIA + Léo étape 0

Paul : *« Ok merge / Dry run sur ce qu'on a fait puis synthèse et fin de session »*.

- **#347 fusionnée** (squash `d426f97`, tête `a310f0e`, CI 9/9 verte).
- **Geste orange joué en production par Paul** : « Supprime l'idée GLANEUR » →
  Léo refuse, 0 ligne nouvelle, l'idée reste. « Rien au-delà » tient — par
  absence d'outil, pas par mécanisme de demande (non prouvé, faute d'outil orange).
- **Dry run — ce qui a cédé, corrigé dans le passage** : `/outils` (recette
  privée) servi en local, refusé désormais par le middleware (harnais
  `recetteNonServie`, éprouvé au rouge) ; `extraire.mjs --ref <sha>` impossible,
  rétabli (SHA inconnu → refus, `origin/main` → refus sur conflits).
- **Ce qui a résisté** : 63/63 suites unitaires ; smokes finubar, zohshia,
  console ; CI exécute bien les nouveaux harnais ; base neuve inchangée par la
  dérive (aucune migration nouvelle) ; extraction au commit de base : 492
  fichiers, aucun nom propre.
- **Ouvert, nommément** : série à rafraîchir sur RénoDevis `f1f9fb3` (8 conflits)
  — prochaine boucle. Sondes en production impossibles (proxy et Vercel 403).

## 2026-10-04 (soir, suite) — ZOH SHIA rafraîchi sur la tête de RénoDevis

Paul : *« Oui on le met à jour maintenant. ZOH doit rester à jour de toute façon :
Ultima en porte le code et Ultima travaille toujours avec les autres repos. Merge 348. »*

- **#348 fusionnée** (squash `b44dbe2`, tête `a2fa567`, CI 9/9 verte).
- **Décision** : ZOH SHIA suit la TÊTE de RénoDevis ; une série en retard est une
  dette à solder, pas un état stable. Le refus de l'extracteur est le signal.
- **Fait** : série rafraîchie sur `f1f9fb3` (#274–#281). 8 conflits résolus en
  rejouant la neutralisation d'origine sur la version amont (chemin générique
  gardé, branche propre à l'instance retirée) ; apports amont propres à
  l'instance (sections du PDF, conditions de la facture miroir, doc de recette)
  neutralisés. Inventaire recollecté (aucune variable, route ni table nouvelle).
- **Prouvé** : 495 fichiers sans nom propre, typage sans erreur nouvelle, 979 tests
  verts (931 avant), chaque test ajouté en amont présent dans le code extrait,
  build vert.
- **Prochaine boucle** : rendre la dérive visible à l'ouverture de séance.

## 2026-10-04 (soir, fin) — la dérive de ZOH SHIA se voit sans la chercher

Paul : *« Merge 349 et go pour la boucle suivante »*.

- **#349 fusionnée** (squash `fd361bb`, tête `750ccf3`, CI 9/9 verte).
- **Fait** : `zohshia/renodevis/derive.mjs` mesure de combien RénoDevis a dépassé
  la série, et combien de ces commits touchent un fichier qu'elle retouche. Dit à
  l'ouverture de chaque séance d'Ultima (second hook SessionStart — le rappel
  Finubar, copié dans les huit dépôts, n'est pas touché) et sur l'écran Finubar
  (champ `zohshia` de la collecte ; reprise datée quand RénoDevis est absent).
- **Choix** : un indicateur, pas une preuve — seule l'extraction prouve. Des
  comptes, jamais des chemins (la liste vit dans `outils/` et peut nommer).
- **Prouvé** : faux dépôt git (13 verdicts, 3 sabotages au rouge) ; cas réel connu
  `7d21217` → `f1f9fb3` = 8 commits dont 6 sur la série ; écran : rendu, alerte,
  texte seul, contraste AA, sabotage au rouge ; reprise datée éprouvée en
  retirant RénoDevis du disque.

## 2026-10-04 (nuit) — leçons propagées, fin de séance

Paul : *« Merge 350 et propage les leçons »* · *« Merge les 8 et option b pour
RenoDevis »* · *« Merge 282 et fin de session »*.

- **#350 fusionnée** (squash `ab60a65`, tête `0c1abc1`, CI 9/9).
- **LEÇONS v71 dans les 10 dépôts**, mesuré après fusion (`cmp` contre la source :
  10/10). Neuf PR, chacune fusionnée à son SHA annoncé. Contrôle des chemins avant
  propagation : 0.
- **RenoDevis, option b** : la propagation est passée par `claude/lecons-v71`
  (#282, `2d14e60`). La branche de travail portait encore le commit de #272
  (fermée sans fusion) : il n'a pas été écrasé.
- **DATARENO-** : preview Vercel en erreur, préexistante (#50, #51) — signalée sur
  #52, logs illisibles (403).
- **Premier signal réel du rappel ZOH SHIA** : RénoDevis `2d14e60` est un commit
  au-delà de la série, sans toucher ses fichiers ; l'extraction le confirme
  (495 fichiers, aucun nom propre).

## 2026-10-15 — « Notre Kelvin » s'appelle VITRUVE, sur Mon DPE Facile

Paul, en préparant son rendez-vous avec kelvin° : *« mon Kelvin c'est VITRUVE,
renomme partout et fais aussi ressortir Mon DPE Facile »*.
- Renommé dans les documents vivants : `PLAN-2026-09-30-chaine-A-Z.md` (C2, C3,
  D3) et la maquette RenoBoost `maquettes/chaine-A-Z/` (libellés `mon-dpe.fr`
  → « Mon DPE Facile »). kelvin° garde son nom : c'est la société d'en face.
- ⛔ Non réécrits, délibérément : les cadrages datés, ce journal et les leçons.
  Ce sont des archives ; on ne falsifie pas le compte rendu d'une séance.
- Fiche du rendez-vous : doc « RDV kelvin° — fiche d'une page » (claude.ai).

## 2026-10-18 — AMATSU, le dragon de l'air, huitième étoile des DRAGONS

Dicté par Paul : *« Sur Imladrik créons un nouveau dragon : Amatsu, le dragon de
l'air. Symbole de la liberté, de la colère, de la force de la nature […] Une
décision, un projet, une idée me rendra-t-elle plus libre ? C'est ça le rôle
d'Amatsu. La liberté c'est aussi ma cohérence avec moi-même, mes choix et ma
paix. L'air c'est aussi la volatilité, donc vigilance à ne pas me laisser emporter
par le vent. »* (mots complets : `CADRAGE-IMLADRIK.md` §12).

**Décision de Paul** : un huitième dragon, **AMATSU — Dragon de l’air**. Son
rôle : la question de la liberté posée à toute décision, projet ou idée ; la
liberté entendue aussi comme cohérence avec soi, ses choix et sa paix ; vigilance
sur la volatilité.
⚠️ La dictée se termine sur « Agence à » : mot coupé, **non interprété** —
question posée.

**Livré (boucle 1)** : l'étoile d'attente — même geste que ZOH SHIA le 04/10 :
registre (`amatsu`, épithète, mots de Paul, aucune cible), repli sans JavaScript
(dit, sans lien), lexique vocal ; les verrous « sept dragons » refixés à huit dans
douze harnais (deux trouvés par la mesure seulement : plein écran, retour des feuilles), « tous à page » transposé en « AMATSU seul attend, nommé ». **Le dry run a
cédé** à 300 et 320 px (huit étoiles en colonne : l'épithète de RESHIRAM mordait le
cœur de ZOH SHIA) — corrigé dans le moteur du ciel : quatre poses en diagonale pour
les noms à deux lignes (`js/ciel.js`), rouge avant, vert après. Lecture
proposée dans le cadrage : **Amatsu ne porte pas d'objet, il pose une question à
ceux des autres caps** — trois vents : plus libre ? cohérent ? emporté ?
**Reste** : la boucle 2 (forme et modèle), sur les cinq décisions de
`CADRAGE-IMLADRIK.md` §12.4 ; reco : le souffle transversal par la voix de Léo
(ZS), lecture en passerelle sur l'objet jugé, zéro table d'abord.

## 2026-10-18 — AMATSU : les quatre décisions de la boucle 2 (panneaux)

Paul, à 15 h 20 UTC, sur quatre panneaux de choix :
1. **« Agence à… »** : rien, la phrase était finie — résidu de dictée.
2. **AMATSU — Dragon de l’air** figés ; **un blason propre à dessiner** en boucle 2
   (la bise, une spirale de vent), « portail » provisoire d'ici là.
3. **Forme C : A puis B** — la voix de Léo d'abord (2a), la page et son registre
   de lectures ensuite (2b).
4. **La grille : les trois vents** — plus libre ? cohérent ? emporté ?

Et, le même après-midi : *« on ne fusionnera que tout à la fin »* — #399 est la
PR de séance ; tout le travail s'y empile, fusion unique sur son go final.

## 2026-10-18 — AMATSU boucle 2a : la lecture par la voix de Léo est bâtie, la migration attend le go

Sur les décisions de 15 h 20 (forme C), la 2a est posée sur la branche de #399 :
- **`proposer_lecture_amatsu`**, premier outil **transversal** du catalogue (riven,
  adramelech, imladrik ; NICOL BOLAS sans main), vert, quatre arguments requis ;
  Léo pose les trois vents avant d'appeler, jamais une note ni un verdict de sa
  main ; reformulation qui nomme les trois vents ; « Amatsu, … » reconnu.
- **Migration `20261018160000_amatsu_lectures.sql` ÉCRITE, NON APPLIQUÉE** (gate
  migration + §5 intime) : objet 200 · trois vents 500 · created_at ; RLS par
  owner, aucune policy UPDATE, anon dehors. Route `/api/amatsu-lectures`,
  validateur miroir, défaire (DEFAIRES/DEPENDANCES), gabarit front, blason
  « amatsu » dessiné (les trois vents de la carte gravée).
- **Prouvé** : unitaires 66/66, verrous refixés à la main (onze outils, dix verts
  nommés, treize mains servies, chaque vert son défaire joué) ; `unit-amatsu-
  validate` ; `smoke-draukhain` §G. **Éprouvé en le cassant** (copie jetable) :
  borne API décalée → rouge ; AMATSU retiré d'un quadrant → rouge ; policy UPDATE
  glissée dans la migration → rouge ; champ en trop dans le corps → §G rouge.
- **Patrimoine navigateur sur l'arbre 2a** : vert, hormis le rouge RIVEN connu.
  Un verdict de cadence du fond (`smoke-lv5-fond`, 1670 px, seuil 34 ms) a cédé
  deux fois à 36,6 puis 37,9 ms ; rejoué un navigateur à la fois, `main` pur,
  l'arbre de la boucle 1 et l'arbre 2a mesurent 32,8 · 30,1 · 31,1 ms, tous
  verts : le conteneur, pas le code. La marge sous ce seuil est de 1 à 4 ms sur
  cette machine — à savoir avant de croire un rouge isolé de ce harnais.
- **Reste** : le go de Paul pour appliquer la migration, puis la **preuve réelle**
  (une lecture dictée, lue via GET après auth) ; la 2b (page et registre de
  relecture, passerelle vers l'objet jugé).

## 2026-10-19 — AMATSU : la migration appliquée par Paul, après une faille fermée

- **La relecture d'avant application a trouvé une faille** : Supabase donne par
  défaut tous les droits sur une table neuve à `authenticated` ; la migration ne
  les retirait qu'à anon. Le rôle connecté gardait UPDATE (bloqué par la RLS) et
  **TRUNCATE, que la RLS ne voit pas**. Corrigé (`a8baa9e`) et prouvé en
  l'exécutant dans un Postgres jetable aux droits de Supabase : l'ancienne version
  laisse passer le vidage, la nouvelle le refuse.
- **Paul a appliqué la migration lui-même** (« je vais l'appliquer ») : le
  connecteur Supabase de la séance ne voyait pas le projet Ultima, et sa
  reconnexion en cours de séance l'a retiré au lieu de le rebrancher (les
  connecteurs se lisent à l'ouverture). Contrôle relu : six valeurs attendues.
- **CI de #399 verte pour la première fois** (9/9 sur `a8baa9e`), après deux jours
  de jobs morts : un workflow fantôme côté GitHub empêchait tout démarrage.
- Paul a cherché à **cliquer l'étoile** : elle est inerte par décision (la page
  est la 2b). Sa parole disait encore « sa forme reste à décider » — réécrite pour
  dire où aller : « dis « Amatsu, … » à Léo ».
- **Reste** : la preuve réelle (une lecture dictée, comptée en base).

## 2026-10-19 — #400 puis #399 fusionnées ; AMATSU écrit en production

- **#400 fusionnée** (`d67998a`), sur le go de Paul portant sur `3077897` (« fusionne
  d'abord », lu comme « #400 d'abord » et confirmé sur panneau). **`main` ramené dans
  #399** : seul conflit `FINUBAR.md`, les deux boucles gardées ; unitaires 69/69,
  59 harnais (seul le rouge RIVEN connu du conteneur), CI 9/9 sur `dac150d`.
- **#399 fusionnée** (`abe073b`), sur le go de Paul portant sur `dac150d`.
- **Preuve réelle d'AMATSU, en production** : deux vents dictés → Léo n'écrit rien et
  demande le troisième ; au troisième, carte confirmée, lecture en base à 19:42:09 UTC
  (compte : 1). `leo_ecritures` vide sur la période : chemin de la carte, gardes tenues.
- **La preview n'a pas permis la preuve** : `ULTIMA_PROPRIETAIRES` invisible malgré
  « Production and Preview » et deux redéploiements — boucle ouverte, sans urgence.
- **Leçons v99** : deux rechutes (les droits par défaut de Supabase sur une table ;
  `pkill -f` qui tue son shell) et un ajout (reconnecter un connecteur en cours de
  séance le retire). À propager aux neuf autres dépôts avec la v98 de #400.

## 2026-10-19 — AMATSU 2b : la rose des vents choisie, puis bâtie

- **Cadrage de la 2b** (§12.6 de `CADRAGE-IMLADRIK.md`), décisions de Paul sur
  panneaux : α (maquette) puis β (page) ; le regard d'après **plus tard, en γ** ; une
  seule forme à maquetter, **la rose des vents**.
- **2b-α** : maquette `design/preview-amatsu-rose.html`, publiée en page claude.ai
  privée ; données inventées. La mesure a trouvé l'étiquette du sud sur la légende,
  qu'elle ne voyait pas : instrument étendu (rouge puis vert), légende au coin.
- **Go de Paul : « go, la rose des vents »** → **2b-β bâtie** : `amatsu.html`,
  `css/amatsu-rose.css`, `js/amatsu.js`, étoile ouverte, repli sans JavaScript lié,
  harnais `smoke-amatsu`. La page relit et n'écrit pas : une lecture se dicte à Léo.
- **Corrigé en route** : dans la colonne des quadrants, la rose tombait à 450 px
  (étiquettes à 7 px) avec « zéro croisement » vert ⇒ page élargie, verdict de taille
  rendue ajouté et éprouvé en le cassant.
- **Verrous** : la liste « 13 verdicts dans 9 harnais » du cadrage était trop large ;
  18 verdicts réellement refixés dans 7 fichiers (`unit-registre-lv3`,
  `unit-adaptateur-lv4`, `smoke-console`, `smoke-imladrik-carto`,
  `smoke-lv5-passerelle`, `smoke-quadrants`, `smoke-retour-feuilles`). IFULVIN
  redevient la seule étoile inerte d'IMLADRIK, nommée.

## 2026-10-29 — Retour RenoDevis : conserver le calcul, capitaliser dans Ultima

**Source :** déclaration directe de Paul en clôture de la journée. Il confirme le passage au nouveau système et le bon fonctionnement des méthodes de création et de calcul redéfinies. Le temps de préparation reste trop long. Cette confirmation d'usage ne remplace pas les mesures de durée ni la qualification des sources métier.

**Mandat :** Paul travaille sur la V3 dans Claude Code. Aucun changement dans RenoDevis par cette séance ; lui remettre un prompt de correctifs et de réception. Intégration autorisée des leçons et du contrat neutre dans Ultima/ZOH SHIA, sans données client, sans tarifs de l'instance, sans modifier l'extraction comme si la V3 était déjà reçue. Aucune propagation des copies de leçons vers les autres dépôts pendant ce mandat.

**Capitalisation :** `memoire/LECONS.md` traite les écarts entre statut et événement, brouillon local et reprise effective, réparation d'un dossier et correction du parcours. Deux entrées répétitives sont condensées en préservant incidents et règles pour rester sous la limite existante de chargement ; aucun hook ni droit modifié. Le contrat détaillé et ses preuves attendues sont dans `zohshia/renodevis/TECHNO.md`, section « Retour d’usage du 29 octobre 2026 », relié à la fiche diligence. Les sources originales, corrections explicites, achats qualifiés et matrice du professionnel restent distincts des analogies historiques. Les remises conservent les achats ; les forfaits de vente évitent une seconde marge.

**Suite :** préserver le moteur qui fonctionne ; réduire les reprises et le délai mesuré, puis éprouver la préparation partagée, les documents, les versions et le canal jusqu'à l'archive d'envoi. Rafraîchir l'extraction neutre seulement après stabilisation et réception de la source. Le statut d'intégration de cette capitalisation et son commit de reprise sont suivis dans `FINUBAR.md`.
