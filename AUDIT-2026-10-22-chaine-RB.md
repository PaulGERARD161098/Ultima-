# AUDIT — la chaîne Rénoboost de A à Z, mesurée le 22/10/2026

> **Demande de Paul, 22/10 au soir** : *« audit complet de la chaîne RB — boucles
> ouvertes — ce qu'il reste à faire pour avoir de A à Z 100 % opé — cadre bien »*.
>
> **Ce document ne crée pas une vérité de plus.** La route et son état vivant
> restent `PLAN-2026-09-30-chaine-A-Z.md` (§2) ; l'inventaire et le raisonnement
> restent RenoBoost `CADRAGE-2026-09-30-chaine-A-Z.md`. Cet audit **remesure** le
> §2 du plan à la date du jour, **consolide** les boucles ouvertes éparpillées dans
> les trois grains Finubar, et **ordonne** ce qui reste. Le §2 du plan porte le
> relevé du jour en une ligne « 🔁 Remesuré le 22/10 » ; le détail est ici.
>
> ⛔ **Chaque chiffre a sa source et son heure.** Ce qui n'a pas pu être lu depuis
> la séance est dit **avant** la valeur (Directive EL), jamais après.

## 0. Cadrage — format 6 points (Directive EL)

| | |
|---|---|
| ① **Le but** | Paul sait, maillon par maillon, ce qui tourne pour de vrai, ce qui est écrit mais n'a jamais tourné, et ce qui manque pour qu'un dossier réel traverse la chaîne de la demande (M0) à l'avis (M9) sans ressaisie — le critère Q-P1 du plan. **MS** : la boucle rapproche du **premier euro encaissé** (J1), parce qu'elle remet en tête les quatre gestes qui le séparent de nous. |
| ② **Les étapes** | (1) relire les six directives et les grains ; (2) lire la route (plan §2) et l'inventaire (cadrage §2) ; (3) **remesurer** chaque ligne du §2 à sa source : base partagée, GitHub, Vercel ; (4) consolider les boucles ouvertes des trois grains et des PR ouvertes ; (5) ordonner ce qui reste, par famille et sous MS ; (6) pre-mortem et trois points de vue ; (7) annoter le plan et le grain, une PR en fin de séance. |
| ③ **Les moyens** | Base `mwaryfscxgrulauwwque` en **lecture seule** (REST PostgREST, rôle serveur, 19:38 → 19:45 UTC) · API GitHub (PR ouvertes, exécutions CI de `main`) · API Vercel (projets, déploiements de `renoboost-ia`) · les fichiers des trois dépôts attachés : Ultima-, RenoBoost, RenoDevis. **ZS** : aucun outil nouveau, aucune dépendance — des requêtes sur ce qui existe. |
| ④ **Les critères de réussite** | Chaque ligne du §2 du plan a une valeur **datée du 22/10** ou la mention « non mesurable d'ici » ; chaque boucle ouverte a un propriétaire (Paul, Claude, un tiers) et une preuve de sortie ; le chemin critique vers J1 tient en moins de dix gestes ; ce qui a **périmé** est nommé (§6). |
| ⑤ **Ce qu'on ne fait PAS** | Aucun code, aucune migration, aucun envoi, aucune fusion. On ne rouvre pas les reports décidés (L3/L4, T2-bis, Twilio, L5, E7 étapes 2-3, déchèterie). On ne réécrit ni le plan ni le cadrage : on les annote. On ne touche pas aux grains de RenoBoost et RenoDevis (leurs périmés sont listés au §6 pour leur prochaine séance). |
| ⑥ **Pre-mortem** | « L'audit a échoué : pourquoi ? » — (a) *il a recopié des états au lieu de mesurer* → chaque valeur porte sa requête ou sa source ; (b) *il a pris une PR ouverte pour du livré* → seul `main` et la base comptent, les PR sont listées à part (§4.3) ; (c) *il a créé une quatrième vérité* → il pointe le plan et y pose une seule ligne datée ; (d) *il a tout mis au même niveau* → le §5 ordonne sous MS, J1 d'abord ; (e) *il a oublié ce qui n'est pas lisible d'ici* → §7, nommément. |

## 1. Le verdict en cinq lignes

1. **Tout est construit, rien ne tourne encore de bout en bout.** Le constat du
   21/08 (`ROADMAP-MASTER.md`) reste vrai le 22/10 : `paiements` = **0**,
   stickers = 0 (dernière lecture 12/10), 0 devis avec relevé, 0 audit tracé.
2. **Le goulot n'est pas dans le code, il est dans quatre gestes** qui n'ont pas
   bougé depuis le 30/09 : A6a (clé Stripe live), A6b (KYC SOLA), A3 (un devis
   chiffré ET émis depuis l'application : **1 sur 33**), A7 (20 sorts à classer).
3. **L'état de la route est en retard sur les décisions** : la levée du gel pour
   C1 (14/10) et les fiches A4/A5/A6a vivent dans **deux PR non fusionnées**
   depuis huit jours (Ultima #394, RenoDevis #372). Le plan sur `main` dit
   « C1 ⬜ » alors que son code est fini.
4. **Deux chantiers avancent hors de la route** : la « V2 » de RenoDevis
   (#413 → #419, 118 fichiers, 21–22/10) et l'agent WhatsApp SOLA (recadrage
   de conception le 22/10, pilote expiré à 19:04 Paris). Ni l'un ni l'autre
   n'a de ligne au §2 du plan.
5. **Ce qui est sain** : la CI est verte sur `main` des trois dépôts (le blocage
   Actions du 18/10 est levé), les crons battent (11 battements du jour), la
   synchro Gmail tourne (A13 ✅), le profil SPC est en base trois heures après
   l'incident, les relances automatiques sont **bloquées à dessein** et la file
   ne porte aucune échéance échue.

## 2. L'état mesuré le 22/10 (19:38 → 19:45 UTC)

Base partagée `mwaryfscxgrulauwwque`, lecture seule. « Au 13/10 » = dernière
mesure du plan (§2). Les requêtes du plan ont été rejouées telles quelles ;
le détail des comptages intermédiaires est au §3.

| Compteur | 22/10 | Au 13/10 | Source |
|---|---|---|---|
| **J1 — `paiements`** | **0** | 0 | `select count(*) from paiements` |
| **A3 — devis chiffrés ET émis depuis l'application, hors e-mail** | **1 sur 33** | 1 sur 53 | requête de la ligne A3 du plan ; le total a baissé parce que les dossiers e-mail factices ont été supprimés les 20–21/10 (RenoDevis #400) |
| `devis` par source | renorelance 18 · email 12 · whatsapp 3 | — | `extra->>'source'` |
| `devis` par statut | Signé 11 · Envoyé 4 · Brouillon 3 · Annulé 8 · Perdu 7 | — | `statut` |
| Les 4 `Envoyé` | **0 ligne chacun** (02/10, 06/10, 15/10 ×2) | — | `jsonb_array_length(lignes)` — partis hors du chiffrage de l'application |
| Devis avec relevé (`extra.releve`) · avec audit (`extra.audit_pac`) | **0 · 0** | 0 · 0 | B1, C3 : toujours sans preuve réelle |
| **A6a — clé Stripe** | `test: true` | `test: true` | `battement:rr-stripe-embarquement`, 06:30 UTC |
| **A6b — comptes artisans ouverts** | `ouverts: 0` sur 2 ; `stripe_charges_enabled` **faux** pour SOLA GROUPE et DOKLES | 0 sur 2 | même battement + `artisans` |
| **A7 — sorts inconnus du corpus** | **20 sur 31** | 20 sur 28 | `corpus_devis where issue = 'inconnu'` (9 signés, 2 perdus) |
| **A13 — synchro e-mail** | `actif: true`, 1 boîte, 5 mails sans fiche, 0 journalisé ce matin ; **43** lignes `gmail:` sur les fiches RB | `actif: true` | `battement:rr-sync-email` 04:45 UTC · `contacts_journal` |
| **Q10 — lien artisan ↔ RenoPredict** | `email_renopredict` **nul** pour les 2 artisans ; 0 pose | 0 pose | `artisans` ; la base RenoPredict n'est pas lisible d'ici |
| Relances automatiques | **bloquées** (`bloque: true`, 0 relance) — voulu depuis le 21/10 ; clé `relances:envoi-auto` absente = fermé | moteur en `auto` | `battement:rr-relances` 08:00 UTC |
| File de relance | 80 lignes : 16 `pending` (14 relances + 2 renvois), **toutes ≥ 23/10, 0 échue** ; 9 `sent` (historique) ; 40 `skipped` ; 15 `cancelled` | — | `relance_queue` |
| Brouillons de relance en attente | 1 | — | `relance_brouillons where statut = 'propose'` |
| `clients` · `rdv` · `artisans` | 208 · 36 · 2 | 206 · 34 · 2 (19/10) | comptages |
| RDV par pro et issue | SOLA 29 `honore` (historique GHL) · **SPC 2 `honore` + 1 `annule`** · **DOKLÈS 4 `a_venir`, dont 2 passés** (21/10, 22/10) non renseignés | — | `rdv` ; aucun écran de saisie de l'issue (roadmap RenoBoost 19/10 §4.2) |
| Canal WhatsApp SOLA | 53 messages traités (33 → devis créé, 13 refusés, 6 ignorés, 1 erreur) ; 3 brouillons de recette ; quota du jour 11/20 ; **pilote expiré le 22/10 à 17:04 UTC** (`canal:whatsapp.valide_jusque`) | — | `canal_messages` · `sentinelle_etat` |
| Profil SPC (`rb_pros_overrides`) | **présent** à 19:40 UTC (`profil_accord` : accord, source, objectif, entreprise) — trois heures après l'effacement de 16:41 et après la fusion de #616 (19:32) | — | `kv_store`, clés seules lues |
| Rail « mail → fiche client » | **jamais alimenté** : aucune clé `rb_mail_propositions` dans `kv_store` | — | `ACTIONS-PAUL.md` ⛔ 1 (3 gestes de Paul) toujours ouvert |
| Sondes de sécurité | `secu-bilan` 19:07 UTC : 47 testées, 0 fuite, **14 aveugles** (« PostgREST 401 — la sonde ne peut pas conclure », **1 080 occurrences depuis le 18/09**) | — | `angles-morts` |
| Courrier et crons RenoBoost | recap 18:00 envoyé (0 brique en erreur) · ghl-sync 19:31 · sentinelle 19:35 · digest 06:00 · alerte du 21/10 : « des champs personnalisés GHL ne remontent pas » | — | `sentinelle_etat` |

**GitHub (lu à 19:40 UTC)** — CI de `main` **verte** sur les trois dépôts :
RenoBoost `tests.yml` #1866 (fusion de #616, 19:38) · RenoDevis `ci.yml` #1786
(fusion de #420, 19:14) · Ultima `tests.yml` #557 (21/10). ⛔ Le `startup_failure`
généralisé du 18/10 (facturation) est **levé** : la note d'Ultima `CLAUDE.md`
« BUDGET FIXE » qui le dit en cours est périmée sur ce point.

**Vercel (lu à 19:40 UTC)** — `renoboost-ia` : production **READY** sur
`db62c43` (#616). `reno-devis-final` : le dernier déploiement de production est
**CANCELED** (créé à 19:10 UTC — la même minute que le commit de documentation
`a5b21be`, `[skip ci]`, 19:10:38 UTC : un build sauté par l'`ignoreCommand`, comportement
attendu ; la correspondance est lue sur les heures, le détail du déploiement étant refusé) ; la production servie reste `7c63bb5`
(#420), READY d'après `memoire/APPRENTISSAGES-SOLA.md` du 22/10 — **la liste des
déploiements de ce projet est refusée à la séance (403)**, comme ses variables
d'environnement. Le projet `ultima` n'apparaît pas dans la liste lisible (3 projets
sur 11) : non vérifié.

## 3. La chaîne, maillon par maillon

Légende : ✅ tourne et prouvé · 🟡 écrit, jamais tourné pour de vrai · 🔴 ouvert
· 🧊 gelé à dessein · 🟣 cadrage seul. « Pour 100 % opé » = ce qui manque pour
que **ce maillon** laisse son empreinte sur un dossier réel.

| Maillon | État | Ce qui tourne (preuve du 22/10) | Pour 100 % opé | Qui |
|---|---|---|---|---|
| **M0 Acquisition** | 🟡 | Vitrine en ligne (production READY) · synchro GHL bat toutes les 15 min · 10 leads helloArtisan importés **à la main** par script (19/10) · Calendly : 1 seul événement actif (A8 ✅, mesuré le 30/09, non remesuré) | le rail mail → fiche n'a jamais reçu un mail (3 gestes : Resend, 2 variables Vercel, filtre Gmail) · l'arrivée des leads reste manuelle (cadrage « Gmail → proposition de fiche » à écrire) · N1 formulaire 3 étapes ⬜ · DATARENO 0 envoi (dépôt non attaché) · alerte GHL du 21/10 (champs perso) non traitée | Paul (3 gestes) · Claude (cadrage) |
| **M1 Rendez-vous** | 🟡 | 36 RDV en base, SPC 2 tenus · agenda Google de Paul tenu à la main (19/10) | **l'issue d'un RDV n'a pas d'écran** : 2 RDV DOKLÈS passés restent `a_venir` → les deux taux de Paul (RDV ÷ leads, signés ÷ tenus) sont faux tant que ça dure · Calendly gratuit = un événement de plus coupe le site · Artidispo agenda (A12) : 0 connexion au 26/09, non mesurable d'ici | Claude (route de clôture + rappel post-RDV, roadmap 19/10 §4.2) · Paul (A12) |
| **M2 Zone, tournée** | 🧊 | C2 « zone pro » et jumeaux livrés sur mon-dpe.fr (12–13/10), gelés depuis | C4 tournée ⬜ (Google Routes payant, gate) · hors chemin critique | — |
| **M3 Visite, relevé** | 🔴 | relevé complet et pilote V3 brique 1 en production · **0 devis avec relevé en base** · agent WhatsApp SOLA : 33 brouillons nés du canal, calcul et PDF prouvés **sur copie** (2 724 € TTC), contrat appareils #420 fusionné 19:08 | A5 brique 2 au téléphone avec Matthieu : fiche prête (RenoDevis `docs/RECETTE-SOLA-LUNDI-MARDI.md` §A5, sur `main`), **compte jamais connecté, mot de passe en main propre** · WhatsApp : un parcours **neuf** vocal → PDF chronométré sous 10 min, dans une **nouvelle fenêtre pilote** autorisée (la précédente a expiré à 19:04 Paris) ; le recadrage du 22/10 (fiche de besoins structurée) reste à implanter | Paul + Matthieu (A5) · Paul (fenêtre pilote) · Claude (lot cohérent WhatsApp) |
| **M4 Chiffrage, devis** | 🔴 **goulot** | bibliothèque, devis en 3 clics, double marge corrigée (B2 ✅), conditions TVA à l'écran, corpus 31 devis | **A3 = 1 sur 33** : les 4 derniers `Envoyé` sont partis sans ligne · A4 TVA en production : fiche prête (§A4 du même document) · A7 : 20 sorts à classer dans `/bibliotheque` · A2 : 14 PDF SOLA sur Drive (non mesurable d'ici, jamais remesuré depuis le 02/10) · 112 prix d'achat SOLA sans date | Paul (A3, A4, A7, A2) |
| **M5 Bilan client** | 🟡 | audit PAC V0–V5 en production · B1 : moteur verrouillé le 13/10, le coût TTC du devis prérempli par `coutDepuisDevis` · **C1 code fini le 14/10** (3 pages + annexe, RenoDevis #372 + mon-dpe.fr #250) | **#372 non fusionnée depuis 8 jours** · recette unique de Paul : un devis RR et un devis RO, l'étude, le PDF, l'annexe (fiche F6) · 0 audit tracé en base | Paul (fusion sur SHA, puis recette) |
| **M6 Envoi, relance, signature, paiement** | 🔴 **J1** | moteur de relance prouvé (9 envois historiques), signature par jeton, voie UUID fermée · synchro Gmail ✅ (A13) · relances **bloquées à dessein** depuis le 21/10, 16 échéances à partir du 23/10 · consigne de paiement du 11/10 : Checkout sur le compte connecté de l'artisan, commission 10 % HT + TVA | **A6a** clé `sk_live_` en Production + destination de webhook « comptes connectés » (`docs/STRIPE-CONNECT.md` §Configuration, étapes 2–3) + redéploiement → `test = false` · **A6b** KYC SOLA → `charges_enabled` vrai · décision de **réouverture des relances** après relecture de la file · **abonnement SPC 1 000 € HT/mois dès le 01/01/2027 : aucun mécanisme de facturation** (roadmap 22/10 §5.3) · commission à dater sur la signature, pas sur le devis (§5.4) | Paul (A6a, décision relances) · SOLA (A6b) · Claude (facturation SPC, date de commission : à cadrer) |
| **M7 Commande, suivi** | 🟣 | cadrage seul (C6), 5 questions aux pros | se rouvre si un pro cite un chantier retardé (Q11) | Paul (terrain) |
| **M8 Pose, SAV, entretien** | 🔴 | Q10 en production (code + schéma, 06/10) · historique RenoPredict | **0 sticker** (A9, dernière lecture 12/10 ; base RenoPredict non lisible d'ici) · **`email_renopredict` nul pour les 2 artisans** : le fil Q10 n'est posé sur personne · inscription RenoPredict de Matthieu (« plus tard », 06/10) · 0 contrat Ripair (21/08) | Paul (A9, inscription Matthieu) |
| **M9 Avis, recommandation** | 🔴 | cron d'avis J+7 écrit, tourne à vide | **fiche Google non validée** (A10, ouverte depuis le 04/08) · témoignages 0, `PARTENAIRES` vide (message prêt depuis le 20/08) · bandeau partenaires : > 1 partenaire, logo + accord | Paul (A10, témoignages) |
| **T Réno** | 🟡 | lit RB, RenoDevis, RenoAgenda · B4 : code vert (9/9), outil `artidispo_activite` en production | **Réno rend 502 depuis le 02/10** (crédit API Anthropic épuisé, grain RenoBoost — **non remesuré** : aucune route lisible d'ici) · preuve B4 = Paul demande « Où en est Artidispo ? » · Q9 (qui parle à qui) ouverte | Paul (recharge = dépense, gate · B4) |
| **T Sécurité** | 🟡 | 0 fuite, 33 sondes étanches | **14 sondes aveugles depuis le 18/09** (PostgREST 401 ×1 080) : un angle mort qui se lit comme du vert · ruleset de `main` inactif, CSP en report-only (gestes Paul, 11/09) · RenoDevis #388 (retrait de droits SQL hors RLS) en brouillon | Claude (cause du 401, prochaine séance RenoBoost) · Paul (ruleset, CSP) |
| **T Données, coûts** | 🟡 | leviers L1–L3 posés dans tous les dépôts rentables (21/10) · CI verte | deux comptes admin (fiches SPC chez `e2d5813c`, fiche pro chez `0fb7b984`) à unifier · capture Usage Vercel du cycle 25/10 → 25/11 (aucun gain promis avant) · limite de dépense Anthropic « 30 $ » non relue | Paul (captures, décision comptes) |

## 4. Les boucles ouvertes — consolidées

### 4.1 Les gestes de Paul (famille A du plan) — rien n'a bougé depuis le 30/09, sauf A8 et A13

| # | Geste | Part de Claude | État 22/10 |
|---|---|---|---|
| A2 | 14 PDF SOLA sur Drive, trancher 235/201 | lire et verser | ⬜ non mesurable d'ici (Drive), jamais remesuré depuis le 02/10 |
| A3 | chiffrer puis émettre un devis depuis l'application | requête prête | ⬜ **1 sur 33** |
| A4 | rejouer la TVA en production | fiche prête (`docs/RECETTE-SOLA-LUNDI-MARDI.md` §A4, sur `main`) | ⬜ |
| A5 | pilote V3 brique 2 avec Matthieu | fiche prête (§A5) | ⬜ compte jamais connecté |
| A6a | clé Stripe live + webhook comptes connectés | fiche prête (`docs/STRIPE-CONNECT.md`) | ⬜ `test: true` |
| A6b | KYC SOLA | suivre le battement | ⬜ 0 sur 2 |
| A7 | classer 20 sorts dans `/bibliotheque` | — | ⬜ 20 sur 31 |
| A9 | imprimer un lot de stickers | vérifier l'URL du QR avant | ⬜ 0 (12/10) |
| A10 | valider la fiche Google Business | — | ⬜ depuis le 04/08 |
| A11 | DATARENO preflight et test à blanc | corriger l'ancien lien Calendly dans 2 documents | ⬜ dépôt non attaché |
| A12 | Artidispo : `CRON_SECRET`, pg_net, agenda de test | liste dans Artidispo `docs/SECRETS.md` | ⬜ non mesurable d'ici |
| — | rail mail → fiche : Resend, 2 variables, filtre Gmail (`ACTIONS-PAUL.md` ⛔ 1) | code fusionné (#467) | ⬜ aucune clé en base |
| — | ruleset de `main` actif · CSP en enforce (`ACTIONS-PAUL.md` ⛔ 2, 3) | — | ⬜ depuis le 11/09 |
| — | témoignages Benjamin et Matthieu (message prêt) | — | ⬜ depuis le 20/08 |
| — | inscription RenoPredict de Matthieu (Q10) | lien manuel SQL prêt sur go | ⬜ « plus tard » (06/10) |

### 4.2 Le code livré qui n'a jamais tourné pour de vrai

| Boucle | Dépôt | Ce qui manque | Preuve de sortie |
|---|---|---|---|
| B1 reste à charge | RenoDevis | un devis réel chiffré dans l'application (A3) | un audit avec reste à charge et temps de retour sur un devis réel |
| C1 bilan 3 pages | RenoDevis #372 + mon-dpe.fr #250 | fusion, puis recette unique de Paul (avec B1) | PDF 3 pages + annexe remis sur un vrai devis |
| B4 Réno lit Artidispo | RenoBoost | un appel réel depuis le dashboard de Paul ; crédit API | GET 200 dans les journaux d'Artidispo |
| Q10 le fil du dossier | RenoBoost + RenoPredict | `email_renopredict`, inscription de Matthieu, un sticker | une pose rattachée, vérifiée sur les deux bases |
| Agent WhatsApp SOLA | RenoDevis | nouvelle fenêtre pilote ; lot « fiche de besoins structurée » (recadrage du 22/10) | un parcours neuf vocal → PDF sous 10 min, chronométré |
| Rail mail → fiche | RenoBoost | 3 gestes de Paul | `rb_mail_propositions` > 0 |
| Chaîne sticker → pose → contrat Ripair | RenoPredict | A9 | `stickers` > 0 puis `contracts` = 1 |
| Avis J+7 | RenoPredict | A10 | un lien d'avis réel dans un brouillon |
| Q10 — issue des RDV helloArtisan | RenoBoost | route de clôture + rappel post-RDV (à cadrer) | 0 RDV passé en `a_venir` |

### 4.3 Les PR ouvertes — 24 sur les trois dépôts (lu à 19:40 UTC)

⛔ **Une PR ouverte n'est pas du livré.** Deux d'entre elles portent l'état de la
chaîne et le plan ment tant qu'elles ne sont pas sur `main`.

| Dépôt | PR | Quoi | Depuis | Sort proposé |
|---|---|---|---|---|
| Ultima- | **#394** (brouillon) | plan A→Z : C1 ouverte par exception, fiches A4/A5/A6a, 2 leçons | 14/10 | **fusionner** (go sur SHA) : c'est l'état de la route |
| RenoDevis | **#372** (brouillon) | C1 : bilan 3 pages + annexe, TVA « Appliquer X % » corrigée, fiches A4/A5 | 14/10 | **fusionner** après la recette unique de Paul, ou avant si Paul veut recetter sur la production |
| RenoDevis | #413 · #414 · #415 · #417 · **#419** (brouillons, Codex) | « V2 — intégrer la maquette V6 » : pilotage, signature par code SMS/e-mail, suivi, paramètres ; 118 fichiers, +3 395 / −903 ; « intégration à qualifier, pas une mise en production » | 21–22/10 | **décision de Paul** : rattacher à la route (quelle ligne du §2 ?) ou geler — la règle 5 du plan gèle tout ce qui n'est ni A ni B tant que A6a et A3 sont ⬜ |
| RenoDevis | #388 (brouillon, Codex) | retrait des droits SQL hors RLS sur six tables | 17/10 | gate base partagée : contrôle des 4 dépôts avant toute fusion |
| RenoDevis | #374 · #362 · #356 · #343 · #323 (brouillons, Codex) | préparation contrôlée des envois · atelier 3D · cockpit des agents · application artisan maquette · recette SQL | 09–15/10 | à trier : C/D gelées ; ce qui n'aide ni A ni B attend |
| RenoDevis | #390 (brouillon) | Finubar : cadrage du nettoyage des dossiers e-mail | 18/10 | périmé par #400 (fait le 20/10) : **fermer** |
| RenoDevis · RenoBoost · Ultima- | #387 · #606 · #396 | leçons v94 (Codex, 15/10) | 15/10 | Ultima est en v103 : **fermer**, la propagation se fait depuis la source |
| RenoBoost | #602 (brouillon, Codex) | chaîne A→Z : Vitruve 3D en M3 (documentation, 15 lignes) | 13/10 | C/D gelées : **fermer ou geler** |
| RenoBoost | #603 · #599 (brouillons, Codex) | SOLA parcours terrain · démo RenoDevis depuis la vitrine | 12–14/10 | M0/M3, hors route : décision de Paul |
| Ultima- | #381 · #365 · #364 · #351 (brouillons) | ZOH journal · Léo raccord réel · ZOH devis · fondation R21 | 04–10/10 | hors chaîne RB (jalon Léo) : non traités ici |

### 4.4 Les décisions qui n'attendent que Paul (hors gestes)

- **Réouvrir ou non les relances automatiques** (bloquées depuis le 21/10) : 16
  échéances partiront au premier passage après réouverture, la plus ancienne le
  23/10 à 08:00 UTC. ⚠️ Les 4 devis `Envoyé` concernés n'ont **aucune ligne** :
  relancer un client sur un devis sans montant est le cas que B3 voulait éviter.
- **La V2 RenoDevis** : route ou gel (§4.3).
- **La part fixe** s'ajoute-t-elle à la commission ou s'en déduit-elle
  (`ACTIONS-PAUL.md` ⛔ 5, depuis le 19/09) — 300 € d'écart par mois sur le
  simulateur, qui n'affiche donc aucun total.
- **Facturation de l'abonnement SPC** (1 000 € HT/mois dès le 01/01/2027) :
  Stripe (abonnement sur le compte plateforme) ou facture manuelle — à cadrer
  avant le 31/12.
- **Base légale et durée de conservation** des leads helloArtisan (ouvert depuis
  le 19/10).
- **Unifier les deux comptes admin** (`e2d5813c` fiches, `0fb7b984` pros).
- **Recharger le crédit API Anthropic** (dépense) pour que Réno réponde.
- **Twilio/SMS** : reste reporté, mais la V2 (#419) propose une signature par
  code SMS — incompatible avec le report tant qu'il tient.

### 4.5 Les dettes nommées, à ne pas perdre

- 14 sondes de sécurité aveugles depuis le 18/09 (PostgREST 401) — un vert qui
  ne prouve rien ; cause à lire côté RenoBoost (`api/sentinelle.mjs`).
- Revue Codex de RenoBoost #611 (9 constats P2, 21/10) : aucun traité ; à trier
  avant le prochain lot de leads.
- 112 prix d'achat SOLA sans date (RenoDevis, 08/10).
- 101 branches mortes dans RenoDevis (08/10) ; branche `claude/aides-ecran`.
- RenoDevis : 42 `.update()` sans `.select()`, ESLint absent (dette assumée).
- Contradictions documentaires du cadrage §7 (12 lignes) : aucune soldée depuis
  le 30/09 ; `ROADMAP-MASTER.md` dit toujours « 0.3 : plus rien à faire » et
  garde la grille 1 000 / 765 €.

## 5. Ce qu'il reste pour « de A à Z, 100 % opé » — le chemin, dans l'ordre

**L'ordre est celui de la Directive MS** : ce qui rapproche d'un encaissement
passe devant. Les quatre phases s'enchaînent ; dans une phase, les lignes sans
dépendance se font en parallèle. **Aucune ligne n'exige de code nouveau avant la
phase 3.**

### Phase 1 — le premier euro (J1). Tout le code existe.

| # | Geste | Qui | Preuve de sortie |
|---|---|---|---|
| 1 | Fusionner Ultima **#394** et RenoDevis **#372** (+ mon-dpe.fr #250) : la route et les fiches A4/A5/A6a arrivent sur `main` | Paul (go sur SHA) | PR fusionnées ; plan §2 lisible à jour |
| 2 | **A6a** : clé `sk_live_` en Production de `reno-devis-final`, destination de webhook « comptes connectés » avec les 7 événements, `STRIPE_WEBHOOK_SECRET`, redéploiement (`docs/STRIPE-CONNECT.md` §Configuration 2–3) | Paul | `battement:rr-stripe-embarquement` → `test = false` le lendemain 06:30 UTC |
| 3 | **A6b** : SOLA termine identité, IBAN, conditions (KYC, obligation LCB-FT — pas le travail de Paul) | SOLA, relancé par Paul | `ouverts ≥ 1`, `stripe_charges_enabled = true` |
| 4 | **A3 + A4** : un devis réel chiffré dans l'application, ses conditions de TVA cochées, émis au client (fiche §A4) | Paul (+ Claude pour lire la base) | A3 passe à **2** ; la recette B1 + C1 devient possible |
| 5 | Le client paie l'acompte par Checkout | le client | **`paiements` = 1 → J1** ; déclenche 3.2 (mentions légales RenoAgenda) et 3.3 (juriste) du `ROADMAP-MASTER.md` |

### Phase 2 — le chemin critique tient (J2)

| # | Quoi | Qui | Preuve |
|---|---|---|---|
| 6 | Recette unique de Paul : relevé → devis chiffré → étude (B1) → bilan 3 pages + annexe (C1), sur le devis de l'étape 4 ou sur la fiche F6 | Paul | un `extra.audit_pac` en base ; reste à charge et temps de retour affichés |
| 7 | **Relances** : relire la file (16 échéances), compléter ou annuler les 4 `Envoyé` sans ligne, puis décider la réouverture (`{"actif": true}` sur `relances:envoi-auto`) | Paul décide, Claude prépare la liste | premier battement avec `bloque: false` et `relances = n` attendu |
| 8 | **B3** : réécrire sa ligne au plan — fermée par changement de forme le 20/10 (un mail-devis = une ligne de journal sur la fiche RB, plus un dossier ; écran retiré) | Claude (commit d'Ultima) | ligne B3 ✅ avec sa preuve (43 lignes `gmail:`, 0 dossier e-mail créé après le 20/10) |
| 9 | **B4** : Paul demande « Où en est Artidispo ? » à Réno — après recharge du crédit API | Paul | GET 200 dans `function_edge_logs` d'Artidispo |

### Phase 3 — l'amont et l'aval laissent leur empreinte

| # | Quoi | Qui | Preuve |
|---|---|---|---|
| 10 | **Issue des RDV** : route serveur de clôture + rappel post-RDV (cadrage 6 points d'abord) ; les 2 RDV DOKLÈS passés renseignés | Claude (cadrage puis code) · Paul (valide) | 0 RDV passé en `a_venir` |
| 11 | **Rail mail → fiche** : les 3 gestes, puis un mail d'artisan transféré | Paul | `rb_mail_propositions` > 0 |
| 12 | **Leads automatiques** : cadrage « Gmail → proposition de fiche validée par Paul » (ZS : connecteur déjà en place, mandat de lecture à poser) | Claude (cadrage) · Paul (mandat) | un lead entré sans script |
| 13 | **A5** : brique 2 du pilote V3 avec Matthieu (fiche §A5, mot de passe en main propre) | Paul + Matthieu | un relevé réel en base (`extra.releve` ≥ 1) |
| 14 | **WhatsApp SOLA** : nouvelle fenêtre pilote explicite, puis le lot « fiche de besoins structurée » du recadrage du 22/10, puis un parcours neuf chronométré | Paul (fenêtre) · Claude (lot, cadré) | vocal → PDF reçu sous 10 min, nombre de questions mesuré |
| 15 | **A9 + Q10** : stickers imprimés (URL du QR vérifiée avant), inscription RenoPredict de Matthieu, `email_renopredict` posé | Paul | `stickers` > 0 ; une pose rattachée sur les deux bases |
| 16 | **A10 + témoignages** : fiche Google validée, message envoyé à Benjamin et Matthieu | Paul | lien d'avis réel ; `PARTENAIRES` non vide |
| 17 | **SPC** : facturation de l'abonnement de janvier (à cadrer, décision Paul), commission datée sur la signature, comptes admin unifiés | Claude (cadrage) · Paul (décisions) | une facture SPC émise avant le 31/12 ; `ca-pros-core.js` lit la date de signature |

### Phase 4 — ce qui est gelé, et ne se dégèle qu'après A et B soldées

C4 tournée · N1 formulaire · N2 rappel H-1 · N3 sous-traitance · N4 Ripair ·
N5 garanties · N6 avis J+2 ou J+7 · D0 test 3D sans code (geste de Paul, hors
règle 5) · D1/D2 · la V2 RenoDevis si Paul la rattache. **Et le gel se lit comme
une règle, pas comme une opinion** : le 13/10, C2, C3 et D3 avaient été ouvertes
pendant que `paiements` restait à 0 ; Paul a corrigé.

### Le critère de sortie, inchangé

Un dossier réel traverse M0 → M9 dans les outils, chaque maillon laisse une
empreinte en base, rien n'est ressaisi, Réno le suit sur les dix maillons
(Q-P1, 30/09). **Au 22/10 : 0 dossier sur ce chemin.** Le premier qui le fera
sera celui de l'étape 4.

## 6. Ce qui a PÉRIMÉ — à ne plus croire

| Où | Ce qui est écrit | Ce qui est vrai le 22/10 |
|---|---|---|
| Ultima `PLAN-2026-09-30-chaine-A-Z.md` §2 (sur `main`) | C1 ⬜ « après B1 » ; A4/A5/A6a sans fiche | C1 🔵 code fini, exception de Paul du 14/10 ; fiches prêtes — tout dans #394, non fusionnée |
| Ultima `CLAUDE.md` « BUDGET FIXE » | « toutes les Actions en `startup_failure` depuis le 18/10 » | CI verte sur `main` des 3 dépôts les 21 et 22/10 |
| RenoDevis `FINUBAR.md` `prochaine_action` | « fusionner la PR de l'interrupteur des relances avant le 23/10 08:00 » | fait : le battement du 22/10 08:00 porte `bloque: true` |
| RenoDevis `FINUBAR.md` boucles | « corpus : 19 devis sur 27 au sort inconnu (30/09) » | 20 sur 31 |
| RenoBoost `CADRAGE-2026-09-30-chaine-A-Z.md` M4 | « GOULOT : 2 devis chiffrés sur 13 » | 1 sur 33 |
| RenoBoost `ROADMAP-MASTER.md` 0.3 | « ✅ plus rien à faire à la main » | `test: true`, `ouverts: 0`, 0 paiement (contradiction §7-5 du cadrage, jamais soldée) |
| RenoBoost `ROADMAP-MASTER.md` décisions | grille 1 000 / 765 € | 300 / 600 / 950 € (cadrage §7-4) |
| Plan §2 ligne B3 | « 🔵 attend le geste de Paul sur `/devis/email` » | l'écran est retiré (21/10) ; un mail-devis = une ligne de journal : la ligne est à réécrire |
| RenoBoost `FINUBAR.md` boucles | « CA par artisan : branche `claude/dazzling-brahmagupta-vrbbin`, reste la recette » | onglet « Devis & CA » fusionné (#615, 22/10) |
| RenoDevis #390 | cadrage du nettoyage des dossiers e-mail | fait le 20/10 (#400) : PR à fermer |

## 7. Ce que cette séance n'a PAS pu lire — nommément

- La base **RenoPredict** `bzblvmmunflxtzamusol` (stickers, contrats, profils
  Stripe) : hors du connecteur. Dernières valeurs connues : 0 sticker (12/10),
  0 contrat (21/08).
- Les bases d'**Artidispo** et de **mon-dpe.fr** ; les dépôts Artidispo, RenoPredict,
  RenoAgenda, mon-dpe.fr, DATARENO ne sont pas attachés : leurs états sont cités
  d'après le plan et le cadrage, avec leur date.
- **Vercel** : les déploiements et les variables de `reno-devis-final` (403), le
  projet `ultima` (absent de la liste lisible). La présence des clés Stripe en
  Production est citée d'après `docs/STRIPE-CONNECT.md` (11/10).
- **Drive** (A2), **Google Business** (A10), **Calendly** (A8, lu le 30/09).
- **Réno en production** (502 depuis le 02/10 d'après le grain RenoBoost) :
  aucune route lisible d'ici sans compte.
- **Les factures** Vercel, GitHub, Anthropic : captures de Paul seulement.

## 8. Pre-mortem — « le 31/12, la chaîne n'est toujours pas bouclée »

| # | Cause probable | Signal précoce | P × I | Parade |
|---|---|---|---|---|
| 1 | **Les gestes A ne sont toujours pas faits** : A6a/A6b depuis le 30/09, A10 depuis le 04/08 | une reprise de plus sans geste A fermé (c'est la 4ᵉ : 02/10, 05/10, 12–13/10, 22/10) | haute × haute | Léo ouvre chaque séance de chaîne par le panneau des gestes A ; **dater** A6a et A3, pas les « prévoir » |
| 2 | **Le code court devant l'usage** : V2 RenoDevis, Vitruve, cockpits — 24 PR ouvertes | une PR de plus sans ligne au §2 | haute × moyenne | règle 5 du plan ; toute PR nouvelle cite sa ligne du §2 ou se ferme |
| 3 | **La route ment** : #394 jamais fusionnée, le plan sur `main` reste au 13/10 | une séance ouvre C1 « ⬜ » et la recode | moyenne × haute | étape 1 de la phase 1 ; une ligne « 🔁 Remesuré » par séance |
| 4 | **Les relances rouvrent sur des devis sans ligne** : 4 `Envoyé` à 0 ligne, 16 échéances | `bloque: false` sans relecture de la file | moyenne × haute | étape 7 : compléter ou annuler avant d'ouvrir |
| 5 | **SPC n'est pas facturé en janvier** : aucun mécanisme | 02/01 sans facture | haute × haute | étape 17, cadrée avant le 31/12 |
| 6 | **Un vert qui ne prouve rien** : 14 sondes aveugles depuis le 18/09, `test: true` lu comme « Stripe configuré » | `secu-bilan` reste à 14 aveugles | moyenne × moyenne | lire la cause du 401 ; le battement Stripe dit `test`, le relire après A6a |
| 7 | **Le fil Q10 n'est posé sur personne** : `email_renopredict` nul ×2 | un sticker imprimé avant le lien | basse × haute | poser le lien (SQL sur go) avant A9 |

## 9. Trois points de vue — Paul arbitre lesquels creuser

1. **L'adversaire** (celui qui veut que la chaîne ne tourne jamais) : *« Il suffit
   de ne rien faire — les quatre gestes A ne dépendent que de Paul, et personne
   ne les date. Pendant ce temps je fais ouvrir une V2, un atelier 3D, un cockpit :
   24 PR, toutes vertes, aucune sur le chemin du premier euro. »* Question :
   **quelle date pour A6a ?** Et : **qui ferme les PR qui ne citent aucune ligne
   du §2 ?**
2. **Le client final de SOLA** (celui qui reçoit le devis et paie) : *« Mon devis
   est arrivé sans ligne ; la relance que je recevrai le 23/10 ne portera aucun
   montant ; mon acompte, je le paie par virement à SOLA, pas sur votre page. »*
   Question : **le premier Checkout réel se fait-il sur un devis qui a été chiffré
   dans l'application, ou sur un devis importé ?** (A3 avant A6a, ou l'inverse.)
3. **Le mainteneur de janvier 2027** (celui qui reprend après les fêtes) :
   *« Trois grains, un plan, un cadrage, une roadmap maîtresse de août, 24 PR
   ouvertes, deux comptes admin, et un abonnement SPC à facturer que rien ne
   facture. Laquelle de ces vérités je crois ? »* Question : **ferme-t-on les PR
   périmées et solde-t-on les 12 contradictions du cadrage §7 avant d'ouvrir quoi
   que ce soit en C ?**

## 10. Décisions attendues de Paul, et la prochaine action unique

**Décisions** (panneaux à la prochaine séance) :
1. Fusionner Ultima #394 et RenoDevis #372 maintenant, ou après la recette unique.
2. La V2 RenoDevis (#413 → #419) : rattacher à la route avec sa ligne, ou geler.
3. Relances automatiques : rouvrir après relecture de la file, ou garder fermé
   jusqu'au premier devis chiffré.
4. Fermer les PR périmées (#390, les trois « leçons v94 », #602).

**Prochaine action unique** : **A6a** — poser la clé Stripe live et la destination
de webhook « comptes connectés » sur `reno-devis-final`, puis lire le battement
du lendemain (`test = false`). C'est le geste dont la part de Claude est faite
depuis le 14/10 et qui ouvre J1.

## 11. Dry run de cet audit — ce qui a été sondé, ce qui a cédé, ce qui a résisté

- **Sondé** : chaque requête du §2 du plan rejouée ; les comptages par source,
  statut, issue ; les battements de la journée ; les PR ouvertes des 3 dépôts ;
  les exécutions CI de `main` ; les déploiements lisibles.
- **A cédé, corrigé sur place** : trois premières lectures ont échoué sur un nom
  de colonne (`updated_at` → `maj_le`, `statut` → `status`, `due_at` →
  `scheduled_for`) — relues avec le bon nom, jamais déduites · le comptage
  `Signé` a d'abord rendu vide (accent non encodé) → 11 après encodage · la
  liste des déploiements de `reno-devis-final` est refusée → la production
  servie est citée d'après le document du jour, et dite telle.
- **A résisté** : A3 = 1, comme le 12 et le 13/10 ; `paiements` = 0 ; `test: true` ;
  `ouverts: 0` ; la file sans échéance échue ; le profil SPC présent trois
  heures après l'incident.
- **Reste ouvert, nommément** : tout le §7.
