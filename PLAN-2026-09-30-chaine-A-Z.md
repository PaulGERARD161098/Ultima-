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
   - ⛔ **Depuis le 13/10, C, N et D sont gelés** (§3, règle 5 et sa note) :
     aucune nouvelle boucle C, N ou D tant qu'un geste A ou une boucle B est
     ⬜ ou 🔵. Priorité MS : A6a (Stripe live), puis B3 (35 devis e-mail) ;
   - **Léo présente à Paul, en un seul panneau, les gestes A qui l'attendent**
     (⬜), chacun avec sa « part de Claude » déjà faite (§2) ;
   - **pendant qu'ils attendent Paul, Claude ouvre la première boucle B ⬜ qui
     n'attend aucun geste A ouvert** (décision Q-P4 du 30/09). Au 30/09, c'était
     **B2** — fermée le 01/10 (RenoDevis #218, mesuré au §2) ; au 01/10, c'est
     **B4** : B1 se recette sur un devis émis (après A3), B3 attend A13 ;
   - la **fiche du §4 ne vaut que pour une boucle de code** : un geste de Paul se
     présente, il ne se cadre pas en six points.
4. **En fermant une boucle**, mettre à jour le grain `FINUBAR.md` du dépôt
   touché dans le commit du travail, puis **sa ligne du §2 dans un commit
   d'Ultima, dans la même séance**, juste après : elle cite le dépôt, la PR et
   le commit. Quand la boucle vit dans Ultima, c'est le même commit. Ce commit
   d'Ultima part avec la PR d'Ultima de la séance.

⚠️ **Deux noms qui se croisent.** « B1 » dans le grain Finubar d'Ultima est le
jalon de Léo (« Léo AGIT »), sans rapport avec la boucle B1 d'ici. Et cette
route ne remplace pas ce jalon : une séance ouverte avec le message ci-dessous
travaille la chaîne ; une séance ouverte sans lui suit le grain d'Ultima.

Le message à donner à Léo pour reprendre. Il ne porte aucun chiffre, pour ne
jamais périmer : les chiffres se lisent au §2 et se remesurent.

```
Léo, on reprend la chaîne Rénoboost. La route est dans Ultima-/PLAN-2026-09-30-chaine-A-Z.md, sur main. Lis le §0 et le §2, remesure les preuves, dis-moi en trois phrases où on en est, présente-moi en un panneau les gestes A qui m'attendent, et ouvre en parallèle la première boucle B qui n'attend aucun geste A avec la fiche du §4. Respecte le gel du §3 (règle 5) : aucune boucle C, N ou D.
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
| **Un dossier réel traverse la chaîne** : un vrai client va de la demande (M0) à la demande d'avis (M9) dans les outils, chaque maillon laisse une empreinte en base, rien n'est ressaisi d'un outil à l'autre | aucun | une requête par maillon sur ce dossier, écrite à la boucle qui ferme M9. L'identifiant de dossier commun est posé en production depuis le 06/10 (`clients.id` de la base partagée + devis signé), mais **pas encore éprouvé** par une pose réelle (ligne Q10 du §2, ⏳) |
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
| A3 | Chiffrer, puis émettre un devis depuis l'application | M4 → M5, M6 | Paul | la requête ci-contre ; la liste des devis sans lignes, par identifiant, jamais par nom | ⬜ **1 devis chiffré ET émis depuis l'application, sur 33** (remesuré le 23/10 à 07:56 UTC ; le total est passé de 53 le 13/10 à 33 parce que les dossiers e-mail factices ont été supprimés les 20–21/10, RenoDevis #400 — le numérateur, lui, n'a pas bougé ; « 1 sur 53 » du 13/10 et « 2 sur 15 » du 30/09 sont périmés) | plus de 1 | `select count(*) filter (where case when jsonb_typeof(d.lignes) = 'array' then jsonb_array_length(d.lignes) > 0 else false end and coalesce(d.extra->>'source','') <> 'email' and exists (select 1 from devis_events e where e.devis_id = d.id and e.type = 'sent')) as chiffres_emis, count(*) as devis from devis d` — un devis à lignes mais importé ou resté brouillon ne compte pas |
| A4 | Rejouer la TVA en production, ensemble | M4 | Paul + Claude | préparer la recette : le devis à créer, les conditions à cocher, ce qu'on lira en base | ⬜ **fiche prête le 14/10** : RenoDevis `docs/RECETTE-SOLA-LUNDI-MARDI.md` § A4 (3 passages, requête). Mesuré : 0 condition répondue sur 57 devis. Défaut trouvé et corrigé en la préparant : « Appliquer X % au devis » n'alignait pas les lignes SOLA (`1383510`) | un devis créé avec ses conditions de TVA | la requête s'écrit avec la recette |
| A5 | Pilote V3, étape 2 : test au téléphone avec Matthieu | M3 | Paul + Matthieu | préparer la fiche de test de la brique 2 | ⬜ **fiche prête le 14/10** : même document, § A5 (6 gestes). Mesuré : compte rattaché, jamais connecté — mot de passe en main propre | les critères de la brique 2 | RenoDevis `REPRISE-PILOTE-V3.md` |
| A6a | Poser la clé Stripe live en production | M6 | Paul | rappeler où la poser, et ce qu'on vérifie après | 🔵 **geste fait par Paul le 22/10 au soir** (clé `sk_live_` et deux destinations de webhook réelles en Production, Preview restée en test) ; **production redéployée le 23/10 à 10:09 UTC** (`dpl_Dd48n5HoKLKg3syWw7q4TTXEHp4h`, `main` `c139e64`, alias `relance-renoboostia.com`) après un premier redéploiement tombé sur un aperçu. **Preuve NON atteinte** : battement du 23/10 06:30 UTC `test: true`, `remplaces: 0` ; attendue au battement du 24/10 06:30 UTC (ou au lancement manuel du cron) : `test = false`, puis les deux artisans avec un `stripe_account_id` réel en base (non nul, différent de l'ancien compte de test) — `remplaces` seul ne suffit pas, il compte aussi un remplacement suivi d'une erreur. Historique : **fiche prête le 14/10** : RenoDevis `docs/STRIPE-CONNECT.md` § A6a. **Clé de test** : `test: true`, remesuré le 14/10 (battement 06:30 UTC) ; 0 paiement en base. Piège corrigé : l'ancienne répartition des webhooks (`.env.example`) aurait fait payer sans confirmer | `test = false` | `select valeur->>'test' from sentinelle_etat where cle = 'battement:rr-stripe-embarquement'` |
| A6b | Vérification d'identité de SOLA chez Stripe | M6 | SOLA | suivre le battement, relancer SOLA par Paul | ⬜ **après A6a**, puis ⏳ SOLA : `ouverts: 0` sur 2 artisans | au moins un compte ouvert, puis J1 | `select valeur->>'ouverts' from sentinelle_etat where cle = 'battement:rr-stripe-embarquement'` |
| A7 | Classer les sorts des devis dans `/bibliotheque` | M4 | Paul | — | ⬜ **20 sans sort** (remesuré le 13/10 vers 11:40 UTC ; 19 le 30/09) | moins de 20 | `select count(*) from corpus_devis where issue = 'inconnu'` |
| A8 | L'événement Calendly du site est actif | M1 | Claude | fait | ✅ **un seul événement actif**, « Votre demande - 15 minutes » : c'est le seul lien Calendly des pages à la racine de RenoBoost (15 occurrences) et d'Artidispo (2) | `active = true` | l'API Calendly, liste des types d'événement |
| A9 | Imprimer un lot de stickers | M8 | Paul | vérifier la destination des QR affichée sur `/Stickers` avant l'impression | ⬜ **0 sticker** | plus de 0 | `select count(*) from stickers` (base `bzblvmmunflxtzamusol`) |
| A10 | Demander la validation de la fiche Google Business | M9 | Paul, puis Google | — | ⬜ non mesurable par Claude | fiche visible publiquement | Paul, depuis Google |
| A11 | DATARENO : preflight puis test à blanc | M0 | Paul | corriger l'ancien lien Calendly dans les deux documents (piège ci-dessous) | ⬜ | test à blanc passé | `datareno-/REPRISE.md` |
| A12 | Agenda Google d'Artidispo : `CRON_SECRET`, pg_net, agenda de test | M1 | Paul | la liste des gestes est dans Artidispo `docs/SECRETS.md` | ⬜ **0 connexion** au 26/09 (Artidispo `FINUBAR.md`, **non remesuré** : sa base est hors de portée du connecteur de cette séance) | au moins 1 connexion en production | `select count(*) from google_calendar_connections` (base Artidispo) |
| A13 | Synchro e-mail : poser les 3 variables Gmail | M6 | Paul | — | ✅ **active** (mesuré le 12/10 : battement 04:45 UTC, `actif = true`, 1 boîte) ; premiers devis e-mail créés le 10/10 | `actif = true` | `select valeur from sentinelle_etat where cle = 'battement:rr-sync-email'` |

🔁 **Remesuré le 02/10 entre 06:37 et 06:38 UTC, avec les requêtes de la
colonne « Comment le mesurer » : aucun geste A n'a bougé.** A2 : toujours un seul
dossier « SOLA », pas de « SOLA devis a lire » · A3 : 2 chiffrés et émis, mais
**sur 13 devis, contre 15 le 30/09**. ✅ **Écart expliqué, mesuré dans les journaux
de l'API Supabase (`edge_logs`) du 01/10** : deux devis créés (08:37 et 15:39 UTC),
puis quatre supprimés entre 17:13 et 17:14 UTC par l'action « supprimer » de
l'accueil RenoDevis (`RenoDevis/app/actions.ts` : contrôle des paiements, puis
`delete`), donc depuis une session administrateur ; 15 + 2 − 4 = 13. ⚠️ « 0 ligne
orpheline » ne prouvait rien : les cinq clés vers `devis` sont en `CASCADE` · A6a : `test = true`
(battement 06:30) · A6b : `ouverts = 0` · A7 : 19 sans sort sur 27 · A9 :
0 sticker · A13 : `actif = false` (battement 04:45).

🔁 **Remesuré le 05/10 à 19:11 UTC.** A6a : `test = true` (battement 06:30) ·
A6b : `ouverts = 0` · A13 : `actif = false`, motif `gmail_non_configure` · J1 :
0 paiement · A7 : **20** sans sort sur 27 (19 le 02/10).
⛔ **A3 est tombé à 0 chiffré et émis, sur 14 devis** (2 sur 13 le 02/10). Les
quatre devis envoyés depuis le 02/10 l'ont été **sans aucune ligne** : ils sont
partis hors du chiffrage de l'application. B1 n'a donc toujours aucun devis réel
où se recetter. A12 (Artidispo) : non mesurable d'ici ; le geste `CRON_SECRET`
attend Paul dans la séance « Chaîne Rénoboost : demande à avis », arrêtée depuis
le 02/10 (PowerShell, pas `openssl`).

🔁 **Remesuré le 12/10, avant 10:00 UTC**, mêmes requêtes. A3 : **1**
chiffré et émis, **sur 53 devis** (0 sur 14 le 05/10) — la hausse du total vient
de la synchro e-mail : 47 devis `source = email` (35 `Envoyé` créés du 10 au
12/10, 6 `Signé`, 6 `Perdu`), 6 devis de l'application · A6a : `test = true`
(battement 06:30) · A6b : `ouverts = 0` sur `artisans = 2` · A7 : 20 sans sort,
**sur 28** · A9 : 0 sticker · **A13 : `actif = true`** — fermé, voir sa ligne ·
Q10 : 0 pose rattachée · J1 : 0 paiement. Non mesurés d'ici : A2 (Drive), A10,
A12. B4 non remesuré.

🔁 **Remesuré le 22/10 entre 19:38 et 19:45 UTC** — audit complet dans
`AUDIT-2026-10-22-chaine-RB.md` (mêmes requêtes, base `mwaryfscxgrulauwwque` en
lecture seule). A3 : **1** chiffré et émis, **sur 33 devis** (53 le 12/10 : les
dossiers e-mail factices ont été supprimés les 20–21/10, RenoDevis #400 ; restent
12 devis `source = email`, tous Signé ou Perdu) — les 4 devis `Envoyé` portent
**0 ligne** · A6a : `test = true` (battement 06:30) · A6b : `ouverts = 0` sur 2,
`charges_enabled` faux pour les deux · A7 : **20** sans sort, sur **31** · A13 :
`actif = true`, 43 lignes `gmail:` sur les fiches RB · J1 : **0** paiement · Q10 :
`email_renopredict` nul pour les 2 artisans, 0 pose · 0 devis avec `extra.releve`,
0 `extra.audit_pac` (B1, C3 sans preuve réelle) · relances automatiques **bloquées**
depuis le 21/10 (battement `bloque: true`, 16 échéances en attente à partir du 23/10,
0 échue). Non mesurés d'ici : A2 (Drive), A9 et les contrats (base RenoPredict),
A10, A12. ✅ **Ultima #394 fusionnée le 22/10 au soir** (`fc24de7`, go de Paul sur `36a1a62`) :
la ligne C1 ci-dessous et les fiches A4/A5/A6a sont à jour. **RenoDevis #372 (le code
de C1) fusionnée le même soir** (`c139e64`, go de Paul sur `59c7e99`, CI verte
39844807685) ; mon-dpe.fr #250 (le `pac=` du lien 3D) **fusionnée le 23/10** (squash
`85998b0`, go de Paul sur `bb8e4b4`, production READY sur mondpe-facile.fr). ⚠️ **B3 a changé de forme le 20/10** (RenoDevis
`CADRAGE-2026-10-20-sync-email-vers-rb.md`) : un mail-devis devient une ligne de
journal sur la fiche RB, plus un dossier ; l'écran `/devis/email` est retiré. Sa
ligne est à réécrire (fermée par changement de forme), pas à recetter.

🔁 **Remesuré le 23/10 à 07:56 UTC** (mêmes requêtes) : rien n'a bougé sur le chemin
du premier euro — J1 **0** paiement · A3 **1** sur 33 · A6a `test = true` à 06:30 UTC
(voir sa ligne) · A6b `ouverts = 0` · A7 **20** sur 31 · 0 relevé, 0 audit · 6 mails-devis
sans fiche RB · relances bloquées à dessein, 2 échéances désormais échues. Un client a
rouvert un devis dans la nuit (1 événement `opened`). Benjamin ESCALES retiré des pros
(RenoBoost #617, #618, 22/10) : restent SOLA, DOKLÈS, SPC.

⚠️ **La consigne de paiement a changé le 11/10** (RenoDevis `CLAUDE.md`,
« Paiement en ligne », source canonique : `docs/STRIPE-CONNECT.md`) : Checkout
sur le compte Stripe connecté de l'artisan (direct charge), commission
RenoBoost prélevée en `application_fee_amount` — SOLA et DOKLES : 10 % du HT net
de remises, TVA 20 % en plus. Ce que ça change ici : **J1 exige toujours A6a puis
un compte artisan ouvert (A6b)**, et le premier paiement encaissera la
commission en même temps. Aucune ligne du tableau n'est à réécrire pour autant ;
le live reste interdit sans mandat (contrat LV1).

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
| B1 | Du chiffrage au reste à charge : le coût TTC du devis alimente la rentabilité de l'audit | M4 → M5 | RenoDevis | 🔵 **moteur verrouillé le 13/10, recette réelle à faire** : packs air/eau et air/air corrigés et sourcés (mon-dpe.fr #245 `59003ee`, #247 `6486dae` ; RenoDevis #359 `c16af14`, #363 `a1b6568` — étude PDF ouverte à l'air/air ; cadrage `mon-dpe.fr/CADRAGE-2026-10-13-audit-pac-verrou.md`). Constaté le 12/10 : `app/releve/audit/page.tsx:113` préremplit le coût par `coutDepuisDevis(montant, totaux.ttc)`. Le seul devis chiffré et émis (`RR-20261006-8926`) n'a ni relevé ni étude : la recette attend un devis réel fait de bout en bout dans l'application (A3/A4) | un audit avec son reste à charge et son temps de retour, sur un devis réel |
| B2 | La double marge (`margeFournitures` à 35 % appliquée par-dessus la bibliothèque) | M4 | RenoDevis + RenoBoost (ligne Réno) | ✅ **corrigée le 01/10 par RenoDevis #218** (fusionnée 08:26 UTC) et RenoBoost (`main` `62fa3ef`, #566 d'après #218) — mesuré à 17:45 UTC sur `main` de RenoDevis (`64211da`) : `releve/prix.js` convertit la bibliothèque une fois sous `meta.prixVente` et marque `vente: true` ; `releve/lignes.js:51-56` lit un prix de vente, `coefVente` a disparu ; 680/680, `tsc` 0, CI 36899869045 verte. Réno : `reno-data.mjs:250` sélectionne `lignes`, `:266` étale `etatChiffrage` (`chiffre`, `nb_lignes`, `origine_lignes` ∈ relevé/manuel/mixte). La fiche §13 de #217 (cadrage de la nuit du 30/09 : onze décisions, maquette, aucun code) est **historique** — son prompt E2 ne se rejoue pas (grain RenoDevis `64211da`) | ✅ `releve/lignes.test.js:51` « aucune seconde marge » (712 reste 712 ; rougit sur l'ancien code à 961,20) · ✅ « le total du devis vaut le total du récap » (même fichier) · ✅ `devis_relances` dit `chiffre` (`api/_lib/devis-chiffre.mjs`) |
| B3 | Les devis arrivés par e-mail entrent (RR-07), une fois A13 posé | M6 | RenoDevis | 🔵 **fusionnée le 12/10** (RenoDevis #348, `main` `3078a28`) : écran `/devis/email`, une relance unique à J+2, aucune première relance avant J+2, un mail par client. **Attend le geste de Paul** : lire les montants et valider sur `/devis/email`. Mesuré avant : 35 `Envoyé`, 0 montant, 0 en file ; moteur en `auto`. **Remesuré le 13/10 vers 11:40 UTC : toujours 35 devis e-mail `Envoyé`** | 0 devis e-mail `Envoyé` avec PDF hors de `relance_queue` (requête au §8 du cadrage), après fusion et validation par Paul |
| B4 | **Réno lit Artidispo** (R1, §5). ~~Un seul agenda Rénoboost à la place de Calendly~~ : écarté par Paul le 02/10, Calendly gardé (flux mesuré ≈ 0) | M0 + M1 | Artidispo + RenoBoost | 🟨 R1 seule (Calendly gardé, Paul 02/10) : fonction `reno-lecture` + outil `artidispo_activite`, Artidispo #114 (`8473dc3`) et RenoBoost #571 (`b59037b`) en production. ⛔ Pas prouvée de bout en bout : le premier appel de Réno (02/10, 16:43:28 UTC) a rendu 502, crédit API Anthropic épuisé ; aucun appel n'a atteint Artidispo. · **12/10** : `tests/reno-artidispo.test.mjs` 9/9 ; la preuve ne peut pas venir de la séance — la question est réservée au compte de Paul (`reno-data.mjs:367`) et le projet Supabase d'Artidispo n'est pas dans ce compte. Geste de Paul : demander « Où en est Artidispo ? » à Réno depuis le dashboard | Réno répond à « Où en est Artidispo ? » avec les huit totaux de la base, ET un GET 200 sur `reno-lecture` figure dans `function_edge_logs` du projet Artidispo ; la bande Réno de M0 et M1 dit « lit Artidispo » et reste « partiel » |
| Q10 | **Le fil d'un dossier** : un identifiant commun de M0 à M9 (décision du §9) | M0 → M9 | RenoBoost + RenoPredict | ⏳ **code et schéma en production le 06/10, preuve de sortie NON atteinte** (0 pose rattachée : aucun sticker, Matthieu non inscrit). Base partagée `mwaryfscxgrulauwwque` : migrations `rdv_client_id` (29/29 rdv reliés) et `artisans_email_renopredict` (lien manuel, garde prouvée côté artisan) ; base RenoPredict `bzblvmmunflxtzamusol` : migration `dossier_ref`. Code : RenoBoost #584 (`ccde23c`) + #585 (`c14e30f`), RenoPredict #92 (`4f3ad4d`) + #93 (`cd83dc1`). **Attend un tiers** : l'inscription RenoPredict de Matthieu et un sticker (A9) ; secret `CHAINE_POSE_SECRET` posé par Paul, non vérifiable depuis la séance (proxy). Activation : cadrage RenoBoost §3.3 quater | une pose rattachée **vérifiée sur les deux bases** — aucune clé étrangère ne tient ce lien d'une base à l'autre, un `devis_ref` simplement non nul ne prouve rien. ① base RenoPredict : `select i.devis_ref, c.dossier_ref from interventions i join clients c on c.id = i.client_id where i.type = 'installation' and i.devis_ref is not null` → au moins une ligne ; ② base partagée, pour chaque couple lu : `select count(*) from devis d join clients c on c.id = d.client_id where d.id = '<devis_ref>' and c.id = '<dossier_ref>' and d.statut = 'Signé'` → 1. La suite du même dossier jusqu'à M9 est le critère du §1, pas celui de Q10 |

### Famille C — construire les maillons manquants de la maquette

| # | Boucle | Maillon | Dépôt | État | Preuve de sortie |
|---|---|---|---|---|---|
| C1 | Le bilan ③ complet : reste à charge, feuille complète, format du rapport (Q6) | M5 | RenoDevis + mon-dpe.fr | 🔵 **ouverte le 14/10 par exception au gel** (§3, règle 5). **Code fini le 14/10**, relecture adverse faite et corrigée ; RenoDevis#372 **fusionnée le 22/10** (`c139e64`, après fusion de `main` : 2 021 tests, 0 échec) ; mon-dpe.fr#250 **fusionnée le 23/10** (squash `85998b0` ; intégrée avec Vitruve #256, deux défauts relevés par la revue Codex corrigés avant fusion). Attend la recette unique de Paul (avec B1). PDF : 3 pages, une 4e seulement si le moteur signale beaucoup d'avertissements (arbitrage de Paul : aucun avertissement retiré) | un bilan remis à un vrai client, avec son reste à charge |
| C2 | VITRUVE v1 (sur Mon DPE Facile) : la fiche d'approche depuis l'adresse, zéro API payante | M2 + M3 | mon-dpe.fr (route) · RenoBoost et RenoDevis (écrans) | ✅ **v1 « zone pro » fusionnée le 12/10** (décisions Z1–Z4, cadrage `mon-dpe.fr/CADRAGE-2026-10-12-zone-pro.md`) : mon-dpe.fr `/pro/zone` (#237 `c81183d`, #238 `73ced35`) — adresses E/F/G du rayon (une ligne par adresse, DPE le plus récent), vue aérienne + cadastre IGN, logement en maquette, **maquette 3D three.js** (étages, fenêtres, toit estimés ; intérieur pièce par pièce **indicatif** ; choix de l'étage) ; RenoDevis : bouton « Logement en 3D et zone » (#351 `41cd179`). Rendu 3D jugé « pas fou » par Paul (12/10) : plafond d'une maquette procédurale ; le photoréaliste (Google 3D Tiles) est payant. **Boucle 6 « les jumeaux du chantier » fusionnée le 13/10** : mon-dpe.fr #242 `b5ec3fa` (fiche du chantier depuis le DPE à 8 m, recherche 300 m élargie à 500 m puis 1 km si moins de 5 jumeaux — J2 révisé par Paul le 13/10 —, rues à taper, onglet `mode=jumeaux`) ; RenoDevis #355 `91cbc74` (bouton « Jumeaux du chantier »). Essai sur les 5 chantiers SOLA signés : 3 en immeuble (32 à 51 jumeaux à 300 m), 2 sans DPE (saisie sur place) ; test 6 de bout en bout validé par Paul. Reste : le premier boîtage réel, source tracée | une adresse réelle donne sa fiche (DPE, bâtiment, travaux possibles) dans RenoBoost et dans le dossier RenoDevis |
| C3 | VITRUVE v2-v3 : le relevé corrige l'estimation, puis la prescription des travaux | M3 | RenoDevis + mon-dpe.fr | 🔵 **v2 fusionnée le 13/10** (cadrage `RenoDevis/CADRAGE-2026-10-13-C3-releve-corrige.md`) : mon-dpe.fr #244 `358121a` (DPE trouvé depuis le point du dossier, provenance juste, `ecarts`, noms ADEME v3 corrigés) ; RenoDevis #358 `5f05e92` (estimé et retenu côte à côte, choix du DPE, immeuble jamais cliquable), suite de revue Codex en RenoDevis #359 (fusionnée le 13/10, `c16af14`). **Preuve réelle NON atteinte : 0 devis avec relevé, 0 audit tracé** (13/10, 11:40 UTC) — elle attend la prochaine visite SOLA. **v3 (prescription) fusionnée le 13/10** : mon-dpe.fr #245 `59003ee` ; 5 constats Codex d'après fusion corrigés sur `claude/happy-mccarthy-b213bq` (dont P1 : jamais de prescription sur une adresse à plusieurs logements) | une estimation corrigée au relevé, tracée « auto » ou « manuel » |
| C4 | Ma tournée du jour | M2 | Artidispo + RenoBoost | ⬜ moteur partiel dans Artidispo (vue sans appelant) | à fixer à l'ouverture |
| C5 | La déchèterie pro la plus proche du chantier | M2 | **à confirmer à la réouverture** (le cadrage ne nomme aucun dépôt ; faisabilité notée dans le grain RenoDevis : base ADEME SINOE, sans créneau) | 🧊 reportée par Paul le 30/09 | à fixer à la réouverture |
| C6 | ④ Commande et suivi | M7 | — | 🟣 **cadrage seul** : les 5 questions aux pros, Matthieu d'abord (cadrage §4) | se rouvre si un pro dit « oui » à la question 5 en citant un chantier retardé. ⚠️ S'il ne se rouvre pas, comment M7 compte pour Q-P1 : Q11 |

### Famille N — les boucles hors des écrans ① à ④ (après C, avant D)

Le tri du 30/09 range les écrans de la maquette ; ces boucles-ci, présentes dans
l'inventaire, n'y avaient pas de place. ✅ **Placées par Paul le 30/09 (§9,
Q-P2) : après C, avant D**, dans cet ordre, parce qu'elles prolongent des
chaînes déjà en service — la 3D, plus incertaine, passe après.

| # | Boucle | Maillon | Dépôt | État |
|---|---|---|---|---|
| N1 | Formulaire de demande en 3 étapes | M0 | RenoBoost | ⬜ cadré le 05/09 |
| N2 | Rappel une heure avant, au pro et au client | M1 | Artidispo | ⬜ |
| N3 | Factures de sous-traitance (client d'origine Rénoboost) | M6 | RenoBoost + RenoDevis | ⬜ tenue comptable à préciser par Paul |
| N4 | Contrats d'entretien Ripair, leur paiement, le contrat type | M8 | RenoPredict ; contrat type : RenoBoost | ⬜ arbitrages à rendre ; contrat type chez le juriste |
| N5 | Numéro de série et garanties à la pose | M8 | RenoPredict, **à confirmer à l'ouverture** (le cadrage ne nomme aucun dépôt) | ⬜ |
| N6 | Avis : J+2 ou J+7 ; témoignages et logos partenaires | M9 | RenoPredict (avis) ; RenoBoost (témoignages et logos) | ⬜ témoignages : attendent un deuxième partenaire |

### Famille D — la 3D

| # | Boucle | Maillon | Dépôt | État | Preuve de sortie |
|---|---|---|---|---|---|
| D0 | Test sans code : une vraie pièce, deux applis gratuites (protocole au cadrage §3.2) | M3 | aucun (geste de Paul) | ⬜ **geste de Paul, hors de la règle 5** : il se fait à la première visite qui s'y prête, sans ouvrir de boucle (cadrage §3.2) | la pièce est reconnaissable et une cote tient à ±10 %, ou non |
| D1 | Famille 1 : poser le produit dans la pièce, en réalité augmentée | M3 | RenoDevis (relevé, catalogue), **à confirmer à l'ouverture** | ⬜ après D0 | à fixer à l'ouverture ; il faut un modèle 3D de chaque produit |
| D2 | Famille 2 : reconstruire la pièce | M3 | RenoDevis (relevé), **à confirmer à l'ouverture** | ⬜ **seulement si D0 dit oui** | à fixer à l'ouverture |
| D3 | VITRUVE v4 : la maison en 3D par pièce | M3 | mon-dpe.fr | 🔵 **3D Avant/Après des travaux fusionnée le 13/10 avec la prescription, sur décision de Paul** (même boucle que C3 v3, mon-dpe.fr #245 `59003ee` ; cadrage `mon-dpe.fr/CADRAGE-2026-10-13-simulation-3d.md`). ⚠️ Ouverte en écart à la règle 5 du §3 (voir la note sous la règle). Rendu photoréaliste ChatGPT : prise cadrée, non posée (payant, gate) · **seconde exception de Paul, 14/10** : la 3D propose la PAC du devis (`pac=air_air` ou `air_eau`) — RenoDevis `8651f98` **fusionnée le 22/10 avec #372** (`c139e64`) ; mon-dpe.fr #250 **fusionnée le 23/10** (squash `85998b0`, production READY) — revue Codex de #394, 22/10 | **fixée le 13/10 (revue Codex #389)** : sur `/pro/zone` d'un chantier SOLA réel en maison, DPE retenu à adresse unique, la maquette montre Avant/Après avec la proposition de l'automate, la classe « avant → après » et aucun travail refusé par le simulateur ; Paul la juge lisible devant l'artisan |

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

   ⛔ **ÉCART CONSTATÉ ET CORRIGÉ LE 13/10/2026.** C2 (zone pro, jumeaux), C3
   (v2 fusionnée, v3 en revue) et la 3D Avant/Après (D3) ont été ouverts alors
   que tous les gestes A restaient ⬜ — sauf A8 et A13 — et que B1, B3 et B4
   restaient 🔵 ou 🟨. Le code est en avance sur l'usage réel : au 13/10,
   0 paiement, 1 devis chiffré et émis sur 53, 0 relevé en base. **Correction
   décidée par Paul (« on corrige cela », 13/10)** : C et D sont **gelés**. Les
   PR déjà ouvertes (mon-dpe.fr #245, RenoDevis #359) vont au bout de leur
   revue, mais **aucune nouvelle boucle C, N ou D ne s'ouvre** tant que la
   condition de la règle 5 n'est pas remplie : plus aucun geste A ni boucle B
   ⬜ ou 🔵 (les attentes d'un tiers ⏳, comme A6b chez SOLA, n'en bloquent
   pas la levée). On reprend dans l'ordre de la Directive MS : A6a
   (Stripe live) et B3 (35 devis e-mail) d'abord, parce qu'ils rapprochent
   d'un encaissement.

   ✅ **EXCEPTION DÉCIDÉE PAR PAUL LE 14/10/2026** (panneau : « chemin audit
   RR/RO » · « lever pour ce chemin seul »). Paul : *« on termine le chemin en
   code d'abord, je testerai tout d'un coup à la fin »*. Le gel est levé pour
   **C1 seul** (le bilan ③ complet du chemin relevé → devis chiffré → étude →
   reste à charge), sans recette intermédiaire : Paul recette le parcours
   entier en une fois. **Tout le reste de C, N et D reste gelé**, et A6a puis
   B3 restent prioritaires sous MS. La recette unique de Paul ferme B1 et C1
   ensemble.

   ✅ **SECONDE EXCEPTION, PAUL LE 14/10/2026** (panneaux « Corriger la 3D pour le
   RR » · « celle du devis » · « −50 %, affiché indicatif ») : la 3D (D3) propose
   la PAC du devis — air/air pour un RR, air/eau pour un RO — au lieu d'une
   « PAC air/eau qui remplace la chaudière » sur une maison à convecteurs.
   mon-dpe.fr `1b570ee` · RenoDevis `8651f98` (branche de séance ; fusionnés : RenoDevis
   le 22/10 avec #372, mon-dpe.fr le 23/10 avec #250, `85998b0`). Rien d'autre
   ne se dégèle. ⚠️ Cette seconde exception corrige le **même chemin RR/RO** que
   C1 (le lien 3D du devis) : elle vaut **exception explicite à la règle 3** (une boucle de
   code à la fois), C1 et D3 avançant dans la même PR RenoDevis (#372) et la même PR
   mon-dpe.fr (#250). Relevé par la revue Codex de #394 (22/10).
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
4. **Annoter** : le grain `FINUBAR.md` du dépôt touché et `generer.py` si
   l'écran change, dans le commit du travail ; puis la ligne du §2 (état, date,
   dépôt, PR, commit) dans un commit d'Ultima de la même séance (§0, étape 4).
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
- **Q10** (05/10) — le fil d'un dossier prolonge `clients.id` de la base
  partagée (`dossier_ref`), sans nouvelle table ; granularité **client + devis
  signé** pour M7 à M9. Instruction et requête à blanc : cadrage RenoBoost
  §3.3 bis. Les migrations qui en découlent restent des gates.
  Étape 2 (rdv → `client_id`) ✅ **appliquée le 06/10 sur le go de Paul** :
  RenoBoost `supabase/migrations/20261006120000_rdv_client_id.sql`, éprouvée en
  local (`tests/rdv-client-id.pg.sh`) ; mesuré 29/29 rdv reliés, 0 au client
  d'un autre propriétaire. Étape 3 (la pose rattachée au dossier) **préparée le
  06/10, non appliquée** : RenoPredict `supabase/migrations/20261006150000_dossier_ref.sql`,
  flux au cadrage RenoBoost §3.3 ter. ⛔ Mesuré : le pivot e-mail ne relie aucun
  artisan entre RenoPredict et la base partagée. ✅ Tranché par Paul le 06/10 :
  artisans reliés par **e-mail exact + lien manuel en secours** ; pilote **SOLA
  (Matthieu)**. ✅ Migration RenoPredict **appliquée le 06/10** ; ✅ **code écrit**
  (RénoBoost `api/chaine-pose.mjs`, RenoPredict `api/pose-dossiers.mjs` + « Fin de
  pose »), testé, inerte sans secret. ⬜ **Gestes restants : `CHAINE_POSE_SECRET`
  sur les deux projets Vercel, compte RenoPredict de Matthieu (même e-mail),
  stickers (A9, plus tard).** ✅ Fusionné le 06/10 (RenoBoost `ccde23c`,
  RenoPredict `4f3ad4d`) ; route en production (405 en lecture), secret non
  vérifiable depuis la séance (proxy). Lien manuel de secours ✅ **appliqué le 06/10** sur
  le go de Paul (`20261006170000_artisans_email_renopredict.sql`, garde prouvée côté artisan) ;
  plomberie d'activation de Matthieu au cadrage RenoBoost §3.3 quater.

**Rendues par Paul le 22/10** (audit `AUDIT-2026-10-22-chaine-RB.md` §10, panneaux) :

- fusionner **maintenant** Ultima #394 et RenoDevis #372 : faites le soir même
  (`fc24de7`, `c139e64`), chacune sur un go portant le SHA de sa tête ;
- la **V2 RenoDevis** (#413 → #419, Codex, 21–22/10) est **gelée** : aucune ligne au
  §2, aucune revue, tant que J1 n'est pas atteint (règle 5 du §3) ;
- les **relances automatiques restent fermées jusqu'à A3** (premier devis chiffré
  dans l'application), puis relecture de la file avec Paul avant réouverture ;
- les **PR périmées sont fermées** : RenoDevis #390 et #387, RenoBoost #606 et #602,
  Ultima #396.

**Rendue par Paul le 23/10** (corps de RenoDevis #419) : la **V2 RenoDevis est publiée**
(#419 fusionnée le 23/10 à 10:33 UTC, « Paul a demandé explicitement la publication »).
Elle lève le gel du 22/10 pour la V2 seule ; C, N et D restent gelés (règle 5 du §3).

**Ouvertes** — posées à la boucle qui les touche, pas avant. Les réponses de
Paul s'inscrivent dans la liste ci-dessus, datées.

| # | Question | Posée avec | Recommandation |
|---|---|---|---|
| Q4 | Photos du relevé stockées ou non | A5 ou D0 | stockées dans le relevé, 9 Mo max, comme aujourd'hui (cadrage §8) |
| Q6 | Rapport client : 3 pages ou 10 sections | C1 | 3 pages remises, les 10 sections en annexe (cadrage §8) |
| Q9 | Léo, Réno, Vitruve : qui parle à qui | B4 | Léo pour Paul dans Ultima, Réno dans les produits, Vitruve pour le particulier |
| Q11 | Si ④ ne se rouvre pas, comment M7 compte pour le critère Q-P1 | C6 | à instruire avec la réponse des pros |
| Q12 | La précision de Paul sur mon-dpe.fr et VITRUVE (attendue dans le grain d'Ultima) | C2 | la correspondance lue dans les fiches (cadrage §3.1), à confirmer |
