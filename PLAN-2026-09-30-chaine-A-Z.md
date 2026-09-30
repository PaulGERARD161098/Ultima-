# PLAN — Réaliser la chaîne Rénoboost, de la demande au client fidèle

> **Posé le 30/09/2026 au soir, à la demande de Paul** : *« Je te valide la
> chaîne de la maquette sans modification. Cadrons ça pas à pas. Crée le doc
> pour tout faire ainsi, on le mettra dans Ultima pour une reprise aisée. »*
>
> **Ce document est la ROUTE** : dans quel ordre on réalise la chaîne, boucle
> par boucle, avec Léo, et **où on en est — c'est le seul endroit où l'état
> vit**. Il ne recopie pas le reste :
> - **l'inventaire et le raisonnement** (ce qui existe par maillon, pourquoi cet
>   ordre, comment ça se goupille) : RenoBoost `CADRAGE-2026-09-30-chaine-A-Z.md` ;
> - **la chaîne validée**, dix maillons, un écran chacun, avec ses outils et ce
>   que Réno en suit : la maquette https://claude.ai/artifact/CfxiWNas9FpANxacw3NS5x,
>   et ses sources dans RenoBoost `maquettes/chaine-A-Z/` (`generer.py`). **C'est
>   elle qui fait foi.** L'artefact « La chaîne Rénoboost »
>   (https://claude.ai/artifact/5hSYkMpgkCzvkj5Da66g3B) est l'inventaire illustré
>   du 30/09 après-midi : il n'est plus tenu à jour.
>
> ✅ **Où le lire : sur `main`.** Les trois PR de la séance du 30/09 ont été
> **fusionnées sur le go de Paul le 30/09 au soir**, en mode « merge » : les
> commits de la branche `claude/renobus-supply-chain-d1ftbw` restent dans
> l'historique de `main`.
> - **Ultima #321** : ce plan ;
> - **RenoBoost #563** : le cadrage et `maquettes/chaine-A-Z/` ;
> - **RenoDevis #214** : la dernière version d'un devis gagne (geste A1, ✅).
>
> **Pilote** : Léo, une boucle à la fois. **Aucun code n'est écrit par ce
> document** ; chaque boucle de code s'ouvre avec sa fiche (§4).

## 0. Reprendre en une minute

1. **Partir de `main`, à jour, dans chaque dépôt touché.** Le plan, le cadrage et
   la maquette y sont depuis la fusion du 30/09. ⛔ Ne pas repartir de l'ancienne
   branche `claude/renobus-supply-chain-d1ftbw` : elle est fusionnée, et toute
   nouvelle boucle part d'`origin/main`.
2. **Lire le tableau de bord (§2) et remesurer** avec la colonne « Comment le
   mesurer ». ⛔ La base gagne sur ce document : un état démenti par la mesure se
   corrige ici, il ne se croit pas.
3. **Une seule règle pour choisir quoi faire** :
   - **Léo présente à Paul, en un seul panneau, les gestes A qui l'attendent**
     (⬜), chacun avec sa « part de Claude » déjà faite (§2) ;
   - **pendant qu'ils attendent Paul, Claude ouvre la première boucle B ⬜**
     (décision Q-P4 du 30/09) ;
   - la **fiche du §4 ne vaut que pour une boucle de code** : un geste de Paul se
     présente, il ne se cadre pas en six points.
4. **En fermant une boucle**, mettre à jour sa ligne du §2 **dans le commit du
   travail**, puis le grain `FINUBAR.md` du dépôt touché.

⚠️ **Deux noms qui se croisent.** « B1 » dans le grain Finubar d'Ultima est le
jalon de Léo (« Léo AGIT »), sans rapport avec la boucle B1 d'ici. Et cette
route ne remplace pas ce jalon : une séance ouverte avec le message ci-dessous
travaille la chaîne ; une séance ouverte sans lui suit le grain d'Ultima.

Le message à donner à Léo pour reprendre. Il ne porte aucun chiffre, pour ne
jamais périmer : les chiffres se lisent au §2 et se remesurent.

```
Léo, on reprend la chaîne Rénoboost. La route est dans Ultima-/PLAN-2026-09-30-chaine-A-Z.md, sur main. Lis le §0 et le §2, remesure les preuves, dis-moi en trois phrases où on en est, présente-moi en un panneau les gestes A qui m'attendent, et ouvre en parallèle la première boucle B avec la fiche du §4.
Une boucle de code à la fois. Les gates de chaque dépôt s'appliquent, et rien ne se fusionne sans mon go.
```

## 1. Le but, et comment on saura qu'on y est

**Le but** : les dix maillons de la maquette validée tournent pour de vrai, et
Réno suit chaque dossier du premier contact à la recommandation. C'est la
promesse de la vitrine : *« De votre lead à la signature du devis, Rénoboost
accompagne tout votre suivi commercial. »*

**Le critère de sortie** — ✅ **validé par Paul le 30/09 (§9, Q-P1)** :

| Critère | Au 30/09 | Comment le mesurer |
|---|---|---|
| **Un dossier réel traverse la chaîne** : un vrai client va de la demande (M0) à la demande d'avis (M9) dans les outils, chaque maillon laisse une empreinte en base, rien n'est ressaisi d'un outil à l'autre | aucun | une requête par maillon sur ce dossier, écrite à la boucle qui ferme M9. ⚠️ Il faut pour cela **un identifiant de dossier commun**, qui n'existe pas (§9, Q10) |
| **Réno le suit sur les dix maillons** | 0 en entier · 5 en partie · 5 pas encore | **le code**, pas la maquette : RenoBoost `api/_lib/reno-data.mjs` (`TOOL_DEFS`) et RenoDevis `app/api/reno/route.ts`. La bande Réno de la maquette en est le reflet |
| **Paul contrôle, il ne saisit pas** (Directive IA) | — | chaque boucle se recette à « a-t-elle retiré de la saisie à Paul ? » |

**Les jalons**, dans l'ordre des familles :

| Jalon | Fin de | Ce qui est vrai | Preuve |
|---|---|---|---|
| **J1 — le premier euro** | famille A | un client a payé un acompte sur la plateforme | `select count(*) from paiements` ≥ 1 (base `mwaryfscxgrulauwwque`) |
| **J2 — le chemin critique tient** | famille B | un devis chiffré dans l'application donne un bilan avec son reste à charge | la ligne B1 du §2 |
| **J3 — les maillons manquants existent** | familles C et N | les écrans ① ② ③ tournent sur un vrai dossier ; ④ a sa réponse du terrain ; les boucles N sont fermées | les lignes C et N du §2 |
| **J4 — la 3D** | famille D | seulement si le test D0 dit oui | la ligne D0 |

⚠️ **Le « Jalon 0 » de RenoBoost** (stickers > 0, fiche Google visible,
`stripe_charges_enabled`) recouvre ici A9, A10 et A6b. J1 va plus loin : un
paiement encaissé.

⚠️ **Aucune date n'est posée par Paul.** L'horizon du pre-mortem du cadrage est
le **31/12/2026** : c'est une proposition, pas un engagement. Chaque jalon reçoit
sa date à l'ouverture de sa famille, une fois la précédente mesurée — jamais
avant.

## 2. Le tableau de bord — une ligne par boucle

**Légende** : ✅ fermée (preuve mesurée) · 🔵 en cours · ⏳ attend un tiers ·
⬜ à ouvrir, ou geste qui attend Paul · 🧊 gelée ou reportée à dessein ·
🟣 cadrage seul.

⛔ **Ce tableau est le seul état vivant de la chaîne.** Le §2 et le §4.1 du
cadrage RenoBoost, et les pastilles de la maquette, en sont des photographies
au 30/09. Une boucle fermée se note ici ; la maquette ne change que si l'écran
change.

### Famille A — faire tourner l'existant (gestes de Paul, presque zéro code)

Mesures du 30/09/2026 entre 16:36 et 17:39 UTC, sauf mention contraire. Les
bases : `mwaryfscxgrulauwwque` (partagée) sauf mention.

| # | Geste | Maillon | Qui | Part de Claude | État au 30/09 | Preuve de sortie | Comment le mesurer |
|---|---|---|---|---|---|---|---|
| A1 | Relire et fusionner la PR RenoDevis #214 (la dernière version d'un devis gagne) | M4 | Paul | fait | ✅ **fusionnée le 30/09 sur le go de Paul**, en mode « merge » : `f42aa5b` reste dans l'historique de `main` | PR fusionnée | l'état de la PR sur GitHub |
| A2 | Déposer les 14 PDF SOLA dans le dossier Drive « SOLA devis a lire », trancher 235/201 | M4 | Paul | lire les 14 PDF, donner le total devisé définitif, les verser au corpus | ⬜ **le dossier n'existe pas** : seul un dossier « SOLA » (recherche Drive, 17:4x UTC) | les 14 PDF dans le dossier ; le total inscrit dans RenoBoost `ROADMAP-2026-09-29-fin-de-session.md` | le connecteur Drive : le dossier et ses fichiers |
| A3 | Chiffrer, puis émettre un devis depuis l'application | M4 → M5, M6 | Paul | la requête ci-contre ; la liste des devis sans lignes, par identifiant, jamais par nom | ⬜ **2 devis portent des lignes, sur 15** (17:39 UTC) | plus de 2 | `select count(*) filter (where case when jsonb_typeof(lignes) = 'array' then jsonb_array_length(lignes) > 0 else false end) as chiffres, count(*) as devis from devis` |
| A4 | Rejouer la TVA en production, ensemble | M4 | Paul + Claude | préparer la recette : le devis à créer, les conditions à cocher, ce qu'on lira en base | ⬜ | un devis créé avec ses conditions de TVA | la requête s'écrit avec la recette |
| A5 | Pilote V3, étape 2 : test au téléphone avec Matthieu | M3 | Paul + Matthieu | préparer la fiche de test de la brique 2 | ⬜ | les critères de la brique 2 | RenoDevis `REPRISE-PILOTE-V3.md` |
| A6a | Poser la clé Stripe live en production | M6 | Paul | rappeler où la poser, et ce qu'on vérifie après | ⬜ **clé de test** : battement du 30/09 à 06:30 UTC, `test: true` | `test = false` | `select valeur->>'test' from sentinelle_etat where cle = 'battement:rr-stripe-embarquement'` |
| A6b | Vérification d'identité de SOLA chez Stripe | M6 | SOLA | suivre le battement, relancer SOLA par Paul | ⬜ **après A6a**, puis ⏳ SOLA : `ouverts: 0` sur 2 artisans | au moins un compte ouvert, puis J1 | `select valeur->>'ouverts' from sentinelle_etat where cle = 'battement:rr-stripe-embarquement'` |
| A7 | Classer les sorts des devis dans `/bibliotheque` | M4 | Paul | — | ⬜ **19 sans sort sur 27** | moins de 19 | `select count(*) from corpus_devis where issue = 'inconnu'` |
| A8 | L'événement Calendly du site est actif | M1 | Claude | fait | ✅ **un seul événement actif**, « Votre demande - 15 minutes » : c'est le seul lien Calendly des pages à la racine de RenoBoost (15 occurrences) et d'Artidispo (2) | `active = true` | l'API Calendly, liste des types d'événement |
| A9 | Imprimer un lot de stickers | M8 | Paul | vérifier la destination des QR affichée sur `/Stickers` avant l'impression | ⬜ **0 sticker** | plus de 0 | `select count(*) from stickers` (base `bzblvmmunflxtzamusol`) |
| A10 | Demander la validation de la fiche Google Business | M9 | Paul, puis Google | — | ⬜ non mesurable par Claude | fiche visible publiquement | Paul, depuis Google |
| A11 | DATARENO : preflight puis test à blanc | M0 | Paul | corriger l'ancien lien Calendly dans les deux documents (piège ci-dessous) | ⬜ | test à blanc passé | `datareno-/REPRISE.md` |
| A12 | Agenda Google d'Artidispo : `CRON_SECRET`, pg_net, agenda de test | M1 | Paul | la liste des gestes est dans Artidispo `docs/SECRETS.md` | ⬜ **0 connexion** au 26/09 (Artidispo `FINUBAR.md`, **non remesuré** : sa base est hors de portée du connecteur de cette séance) | au moins 1 connexion en production | `select count(*) from google_calendar_connections` (base Artidispo) |
| A13 | Synchro e-mail : poser les 3 variables Gmail | M6 | Paul | — | ⬜ **inactive** : battement du 30/09 à 04:45 UTC, `actif = false` | `actif = true` | `select valeur from sentinelle_etat where cle = 'battement:rr-sync-email'` |

⚠️ **A11 — un piège déjà visible** : l'ancien lien Calendly
(`rdv-expert-cvc-30-min`), désactivé le 22/09, figure encore dans
`datareno-/deploy/EMAIL_SETUP.md` (ligne 52) et `datareno-/docs/PRELANCEMENT.md`
(lignes 21 et 48). À corriger avant le preflight, et à revérifier avant tout
envoi.

### Famille B — réparer le chemin critique (petites boucles de code)

✅ **Elle avance pendant que les gestes A attendent Paul** (Q-P4, 30/09) : les
gestes A sont les siens, les boucles B sont du code que Claude porte seul.

| # | Boucle | Maillon | Dépôt | État | Preuve de sortie |
|---|---|---|---|---|---|
| B1 | Du chiffrage au reste à charge : le coût TTC du devis alimente la rentabilité de l'audit | M4 → M5 | RenoDevis | ⬜ `rentabilite` vaut null (cadrage §2, M5) ; se recette sur un devis réel, donc après A3 | un audit avec son reste à charge et son temps de retour, sur un devis réel |
| B2 | La double marge (`margeFournitures` à 35 % appliquée par-dessus la bibliothèque) | M4 | RenoDevis + RenoBoost (ligne Réno, Q-B2-3) | 🔵 **ouverte le 30/09** : fiche dans RenoDevis `CADRAGE-2026-09-14-pilote-sola.md` §13 (branche de séance `claude/bold-ride-lz23qg`) ; **les trois décisions de Paul sont rendues à 18:27 UTC** (§13.13 : conversion unique et marquée · le champ marge reste indicateur · Réno dans B2) ; E1 s'ouvre sur la base mesurée (main si #214 y est, sinon la branche de la chaîne) ; un seul site défectueux, le relevé — `DevisLineBuilder` est sain | un harnais qui rougit sur la double application, puis vert · récap = devis sur une même fixture · `devis_relances` dit `chiffre` |
| B3 | Les devis arrivés par e-mail entrent (RR-07), une fois A13 posé | M6 | RenoDevis | ⬜ dépend d'A13 | à fixer à l'ouverture, sur ce qu'A13 aura révélé |
| B4 | Un seul agenda Rénoboost à la place de Calendly, sur le moteur d'Artidispo — **et Réno lit Artidispo** (R1, §5) | M0 + M1 | Artidispo + RenoBoost | ⬜ | le site, le salon et les campagnes pointent vers un seul agenda Rénoboost ; la bande Réno passe M0 et M1 à « le suit » |

### Famille C — construire les maillons manquants de la maquette

| # | Boucle | Maillon | Dépôt | État | Preuve de sortie |
|---|---|---|---|---|---|
| C1 | Le bilan ③ complet : reste à charge, feuille complète, format du rapport (Q6) | M5 | RenoDevis + mon-dpe.fr | ⬜ après B1 | un bilan remis à un vrai client, avec son reste à charge |
| C2 | Notre Kelvin v1 : la fiche d'approche depuis l'adresse, zéro API payante | M2 + M3 | mon-dpe.fr (route) · RenoBoost et RenoDevis (écrans) | ⬜ ; la précision de Paul sur mon-dpe.fr et VITRUVE est attendue (Q12) | une adresse réelle donne sa fiche (DPE, bâtiment, travaux possibles) dans RenoBoost et dans le dossier RenoDevis |
| C3 | Notre Kelvin v2-v3 : le relevé corrige l'estimation, puis la prescription des travaux | M3 | RenoDevis + mon-dpe.fr | ⬜ après C2 | une estimation corrigée au relevé, tracée « auto » ou « manuel » |
| C4 | Ma tournée du jour, et la déchèterie pro la plus proche | M2 | Artidispo + RenoBoost | 🧊 déchèterie reportée par Paul le 30/09 | à fixer à l'ouverture |
| C5 | ④ Commande et suivi | M7 | — | 🟣 **cadrage seul** : les 5 questions aux pros, Matthieu d'abord (cadrage §4) | se rouvre si un pro dit « oui » à la question 5 en citant un chantier retardé. ⚠️ S'il ne se rouvre pas, comment M7 compte pour Q-P1 : Q11 |

### Famille N — les boucles hors des écrans ① à ④ (après C, avant D)

Le tri du 30/09 range les écrans de la maquette ; ces boucles-ci, présentes dans
l'inventaire, n'y avaient pas de place. ✅ **Placées par Paul le 30/09 (§9,
Q-P2) : après C, avant D**, dans cet ordre, parce qu'elles prolongent des
chaînes déjà en service — la 3D, plus incertaine, passe après.

| # | Boucle | Maillon | État |
|---|---|---|---|
| N1 | Formulaire de demande en 3 étapes | M0 | ⬜ cadré le 05/09 |
| N2 | Rappel une heure avant, au pro et au client | M1 | ⬜ |
| N3 | Factures de sous-traitance (client d'origine Rénoboost) | M6 | ⬜ tenue comptable à préciser par Paul |
| N4 | Contrats d'entretien Ripair, leur paiement, le contrat type | M8 | ⬜ arbitrages à rendre ; contrat type chez le juriste |
| N5 | Numéro de série et garanties à la pose | M8 | ⬜ |
| N6 | Avis : J+2 ou J+7 ; témoignages et logos partenaires | M9 | ⬜ témoignages : attendent un deuxième partenaire |

### Famille D — la 3D

| # | Boucle | Maillon | État | Preuve de sortie |
|---|---|---|---|---|
| D0 | Test sans code : une vraie pièce, deux applis gratuites (protocole au cadrage §3.2) | M3 | ⬜ **geste de Paul, hors de la règle 5** : il se fait à la première visite qui s'y prête, sans ouvrir de boucle (cadrage §3.2) | la pièce est reconnaissable et une cote tient à ±10 %, ou non |
| D1 | Famille 1 : poser le produit dans la pièce, en réalité augmentée | M3 | ⬜ après D0 | à fixer à l'ouverture ; il faut un modèle 3D de chaque produit |
| D2 | Famille 2 : reconstruire la pièce | M3 | ⬜ **seulement si D0 dit oui** | à fixer à l'ouverture |
| D3 | Notre Kelvin v4 : la maison en 3D par pièce | M3 | ⬜ jamais avant C3 ; **rangée en D le 30/09** : c'est de la 3D, et VITRUVE la met en dernier. En C, elle aurait retenu la famille N derrière du code 3D | à fixer à l'ouverture |

### Famille E — les idées en réserve

GLANEUR, MYCÉLIUM, IFULVIN, VESTA/PROTÉE, HÉRAUT, Boussole des recherches.
**Raffinage seulement**, dans ADRAMELECH : aucune ne s'ouvre en boucle de code
sans décision de Paul.

## 3. Pas à pas — l'ordre, et les règles qui le fixent

1. **A, puis B, puis C, puis N, puis D.** E reste en réserve. Ordre A → E
   validé par Paul le 30/09 ; N placée entre C et D le même soir (Q-P2).
   Construire des écrans par-dessus des chaînes qui n'ont jamais tourné, c'est
   travailler pour travailler (Directive EB).
2. **Dans une famille, ce qui débloque le plus de maillons passe devant.** D'où
   A1 à A3 d'abord : ils ouvrent le chemin du premier euro ; A6a et A6b le
   franchissent.
3. **Une boucle de code à la fois.** La suivante ne s'ouvre qu'une fois la
   précédente livrée, vérifiée, committée et annotée ici.
4. **Les gestes A sont à Paul ; la famille B avance en parallèle** (Q-P4). Léo
   présente les gestes A, Claude fait leur « part de Claude », puis ouvre une
   boucle B.
5. **C, N et D ne s'ouvrent pas tant qu'un geste A ou une boucle B est ⬜ ou
   🔵.** Seuls peuvent rester derrière : ⏳ (un tiers, pas Paul), 🧊 et 🟣.
   C'est la parade du pre-mortem du cadrage (§10) : « Léo refuse d'ouvrir C tant
   que A a un geste en suspens ». **D0 y échappe** : c'est un geste de Paul, sans
   boucle.
6. **Ce qui se voit se montre avant d'être codé** : la maquette d'abord, l'URL
   de prévisualisation avant et après.

## 4. Ouvrir et fermer une boucle de code — la fiche, avec Léo

Les règles viennent de la charte de Léo (`.claude/agents/leo.md`) et des quatre
directives de `CLAUDE.md` ; leur déroulé raisonné est au §6 du cadrage
RenoBoost. **Voici le geste.** Il vaut pour les boucles B, C, N, D et R — pas
pour les gestes de Paul de la famille A, qui se présentent en panneau (§0).

**À l'ouverture** — gate bloquant (Directive EL) : on ne code pas tant que la
fiche n'est pas remplie.

- **Maillon et écran** de la maquette.
- **L'existant à capitaliser** : les fichiers, lus, pas supposés.
- **Ce qui manque.**
- **Dépendances** : les boucles du §2 qui doivent être fermées avant.
- **Gates** : payant, secret, migration, envoi réel, choix produit.
- **Critère de sortie mesurable**, avec sa requête ou son constat.
- **Ce qu'on ne fait pas** dans cette boucle.
- **Pre-mortem** : « la boucle a échoué, pourquoi ? », trois lignes au moins,
  avec leur parade.
- **Trois points de vue, dont l'adversaire** : celui qui veut casser, exploiter
  ou faire échouer.
- **La ligne Réno** du maillon (§5).
- **Les questions à Paul**, en panneaux à choix, la recommandation en premier.

**À la fermeture** :

1. **La preuve de sortie est mesurée**, pas déclarée.
2. **Dry run** : casser volontairement pour voir le harnais rougir, verrou de
   non-vacuité, vérifier que les vérifications s'exécutent vraiment.
3. **Commit et push** sur la branche de la séance ; une seule PR en fin de
   séance ; fusion sur go de Paul, selon les gates du dépôt.
4. **Annoter** : la ligne du §2 (état, date, PR, commit de `main`), le grain
   `FINUBAR.md` du dépôt touché, et `generer.py` si l'écran change.
5. **Une leçon** dans `memoire/LECONS.md` si une erreur a coûté quelque chose.
6. **Le rapport de Léo** : fait, avec la preuve · décisions attendues ·
   **prochaine action unique**.

## 5. Réno, tout au long de la chaîne

**Où il en est** — lu dans le code (RenoBoost `api/_lib/reno-data.mjs`), détail
au cadrage §3.3 : Réno lit les fiches de Rénoboost, les devis et relances de
RenoDevis, et les visites de RenoAgenda si la clé serveur est posée. Il ne lit
ni Artidispo, ni la base de RenoPredict, ni mon-dpe.fr, ni INTENDANT.

**La règle** — ✅ **validée par Paul le 30/09 (§9, Q-P3)** : **chaque boucle
qui construit ou répare un maillon livre aussi le connecteur Réno de ce
maillon.** Réno ne devient pas un chantier à part, qui prendrait du retard sur
le reste : il avance avec la chaîne, maillon par maillon, et son critère entre
dans la preuve de sortie de chaque boucle.

**R1 — Réno lit Artidispo (demandes et réservations, M0 + M1)** : c'était la
seule boucle Réno à part, parce que M0 et M1 tournent déjà sans lui. Elle est
**portée par B4**, qui touche Artidispo sur les mêmes maillons — c'est la règle
Q-P3 appliquée.

**Les règles de chaque connecteur**, déjà tenues par ceux qui existent :
lecture seule · périmètre fixé par le serveur, jamais par le modèle · noms
pseudonymisés avant l'API · HTTPS et délai · « brique non connectée » plutôt
qu'une panne · un artisan ne voit que ses dossiers, Paul la chaîne entière ·
passage par `reno-coherence` et `secu-sentinel` avant la production.

**Deux questions qui s'ouvrent avec B4, pas avant** : Q9 (Léo, Réno et Vitruve,
qui parle à qui ? — lecture proposée : Léo pour Paul dans Ultima, Réno dans les
produits, Vitruve pour le particulier sur mon-dpe.fr) et Q10 (l'identifiant de
dossier commun, sans lequel le critère Q-P1 ne se mesure pas).

## 6. Ce qui n'attend que Paul

| Nature | Quoi | Boucle |
|---|---|---|
| **Gestes** | les gestes A, sauf A8, déjà fait | A |
| **Secrets** | clé Stripe live · 3 variables Gmail · `CRON_SECRET` d'Artidispo | A6a, A13, A12 |
| **Tiers** | vérification d'identité de SOLA · validation Google · relecture du juriste | A6b, A10, N4 |
| **Payant** | distances routières (Google Routes) · un abonnement kelvin°, si on s'abonne au lieu de construire | C4, C2 |
| **Envoi réel** | la campagne DATARENO | A11 |
| **Fusion** | toute PR : **rien ne se fusionne sans le go de Paul**. #321, #563 et #214 l'ont reçu le 30/09 au soir | toutes |

## 7. Pre-mortem du plan — « le 31/12, la chaîne n'est pas bouclée : pourquoi ? »

Il complète le §10 du cadrage, qui porte sur la chaîne ; celui-ci porte sur la
route.

| Cause probable | Signal précoce | Parade |
|---|---|---|
| **Une séance repart de l'ancienne branche** au lieu de `main` | une boucle ouverte sur `claude/renobus-supply-chain-d1ftbw` après sa fusion | le §0, étape 1 : toute boucle part d'`origin/main` |
| **Ce document a vieilli** : un ✅ que la base dément | une mesure du §2 qui ne tombe pas | la base gagne ; chaque boucle met à jour sa ligne dans son propre commit ; la reprise remesure toujours avant de croire (§0) |
| **Trois vérités** : ce plan, le cadrage (§2, §4.1) et la maquette | un état différent entre eux | l'état ne vit qu'ici ; les deux autres sont des photographies du 30/09, et le disent |
| **On ouvre une famille avant que la précédente soit soldée** | une boucle C, N ou D ouverte alors qu'un geste A ou une boucle B est encore ⬜ ou 🔵 | règle 5 du §3 ; Léo refuse |
| **Réno devient un chantier à part** et prend du retard | une boucle de maillon fermée sans sa ligne Réno | règle du §5 : la ligne Réno fait partie de la preuve de sortie |
| **La famille A ne bouge pas** : elle ne dépend que de Paul | trois reprises de suite sans geste A fermé | Léo le dit en tête de reprise, et présente d'abord le geste dont la part de Claude est déjà faite |
| **Le fil se perd entre les dépôts** | une boucle fermée dont on ne retrouve ni la PR ni le commit | chaque ligne nomme son dépôt, sa PR et le commit de `main` |

## 8. Ce que ce plan ne fait pas

- **Aucun code, aucune migration, aucune fusion, aucun achat.**
- **Il ne crée aucun outil** : tout besoin est l'extension d'un dépôt qui existe
  (Directive JL).
- **Il ne recopie pas l'inventaire** : les sources par maillon et le
  raisonnement restent dans le cadrage RenoBoost.
- **Il ne rouvre pas les reports décidés** : L3/L4, T2-bis, SMS Twilio, L5,
  E7 étapes 2-3, la déchèterie.
- **Il ne porte pas les lignes T du cadrage** (sécurité de RenoBoost et
  d'Artidispo, crons muets, migration vers RenoPredict) : elles sont hors de la
  chaîne et se suivent dans les grains de leurs dépôts.

## 9. Décisions

**Rendues par Paul le 30/09** :

- ordre des familles A → E ;
- ④ Commande et suivi en cadrage seul, avec le terrain ;
- 3D : test sans code d'abord ;
- les onze écrans validés tels quels ;
- chaque écran porte ses outils, réels ou imaginés, et Réno suit tout ;
- la chaîne de la maquette validée sans modification, et ce document pour la
  réaliser ;
- **Q-P1** — le critère de sortie : un dossier réel de M0 à M9 dans les outils,
  sans ressaisie, suivi par Réno sur les dix maillons ;
- **Q-P2** — les boucles hors écrans (famille N) : après C, avant D ;
- **Q-P3** — Réno : chaque boucle livre le connecteur de son maillon ;
- **Q-P4** — la famille B avance pendant que les gestes A attendent Paul ; C, N
  et D restent fermées.

**Ouvertes** — posées à la boucle qui les touche, pas avant. Les réponses de
Paul s'inscrivent dans la liste ci-dessus, datées.

| # | Question | Posée avec | Recommandation |
|---|---|---|---|
| Q4 | Photos du relevé stockées ou non | A5 ou D0 | stockées dans le relevé, 9 Mo max, comme aujourd'hui (cadrage §8) |
| Q6 | Rapport client : 3 pages ou 10 sections | C1 | 3 pages remises, les 10 sections en annexe (cadrage §8) |
| Q9 | Léo, Réno, Vitruve : qui parle à qui | B4 | Léo pour Paul dans Ultima, Réno dans les produits, Vitruve pour le particulier |
| Q10 | L'identifiant de dossier commun, de M0 à M9 | B4 | à instruire à l'ouverture, sans faire voyager de donnée personnelle (cadrage §3.3) |
| Q11 | Si ④ ne se rouvre pas, comment M7 compte pour le critère Q-P1 | C5 | à instruire avec la réponse des pros |
| Q12 | La précision de Paul sur mon-dpe.fr et VITRUVE (attendue dans le grain d'Ultima) | C2 | la correspondance lue dans les fiches (cadrage §3.1), à confirmer |
