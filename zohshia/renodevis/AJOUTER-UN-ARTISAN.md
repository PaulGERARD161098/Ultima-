# ZOH SHIA · RénoDevis — mettre la techno en service pour un nouveau pro

> **L'invocation** (Paul, 04/10/2026) : *« ZOH : j'intègre un nouvel artisan ;
> fournis-moi un code et une base prête, donne-moi la check-list des infos
> nécessaires pour mettre la techno RénoDevis à jour pour lui. »*
>
> ⛔ **Techno pure** : ce guide ne porte ni nom d'artisan, ni valeur propre à un
> pro, ni secret. Il dit QUOI renseigner, jamais AVEC QUOI.
>
> **S'invoque par** la compétence `zohshia`. Avant toute étape : relancer la
> collecte, rejouer la base, faire passer `tests/unit-zohshia.mjs`. Un guide non
> remesuré se lit comme un guide juste.
>
> ⛔ **Aucune étape ne s'exécute sur ce document seul.** Chaque geste qui écrit
> en base réelle, crée un compte, un dépôt, un projet ou une dépense, envoie un
> mail réel ou pose une variable de production est un **effet métier réel** : il
> demande le mandat précis de Paul (contrat LV1, `CLAUDE.md` d'Ultima, §Gates).
> Ce guide dit QUOI faire ; il n'autorise rien.

## 0. Deux voies — à choisir d'abord, avec Paul

| Voie | Ce que le pro reçoit | Quand |
|---|---|---|
| **A — il rejoint la plateforme existante** | un compte sur l'instance en place, cloisonné par la RLS | le cas courant : rien à créer, tout à renseigner |
| **B — une instance à lui** | **son code** (extrait neutre) et **sa base** (reconstruite et prouvée), sur ses propres comptes de service | il exige l'isolement de ses données, ou une marque à lui |

La check-list du §1 sert **aux deux voies**. La voie B ajoute le §3.

## 1. La check-list — ce qu'il faut obtenir du pro

Chaque ligne dit **où l'information va** (table · colonne, ou variable) et si
elle est **obligatoire** pour que la techno tourne. Rien n'est à inventer : une
case vide reste vide, et l'écran le montre.

### 1.1 Son identité — fiche du pro (`artisans`, et `profiles` pour son compte)

| Information | Où | Obligatoire |
|---|---|---|
| Raison sociale | `entreprise` | ✅ |
| Nom du contact, téléphone, e-mail | `contact_nom`, `tel`, `email` | ✅ |
| SIRET (la TVA intracommunautaire s'en déduit) | `siret` → `tva_intra` | ✅ mention légale |
| Adresse du siège | `adresse` | ✅ mention légale |
| Qualification RGE (numéro) | `rge` | si travaux aidés |
| Assurance décennale (assureur, numéro) | `decennale` | ✅ mention légale |
| Forme juridique, capital social | `forme_juridique`, `capital_social` | ✅ forme juridique s'il émet des devis à des professionnels (le devis pro refuse de se générer sans elle) ; capital facultatif |
| Coordonnées bancaires (bénéficiaire, IBAN, BIC) | saisies et contrôlées **à chaque devis pro** (`extra.reglement` du devis) | ✅ pour un devis pro |
| Logo | `logo_url` (stockage `artisan-logos`) | facultatif |
| Site, page professionnelle, page d'avis | `site_url`, `linkedin_url`, `google_page_url` | facultatif |
| Savoir-faire, produits mis en avant | `savoir_faire`, `produits` | facultatif |
| Attestations (assurance, garanties, qualifications) et leur date de validité | `assurance_url`, `garanties_url`, `qualifications_url`, `attestations_valides_jusqu_au` | facultatif — le bloc disparaît seul à expiration |

### 1.2 Ses comptes

| Information | Où | Obligatoire |
|---|---|---|
| E-mail de chaque personne qui se connecte (le pro, ses collaborateurs) | utilisateurs de la base + `profiles` (rôle `pro`) + `artisans.profile_id` | ✅ |

### 1.3 Ses règles de prix — SA marge, elle ne se devine pas (`banques_reno.regles`)

| Information | Champ | Bornes contrôlées |
|---|---|---|
| Coefficient appliqué au prix d'achat | `coefficient_produits` | 1 à 5 |
| Prix HT d'une demi-journée de main-d'œuvre | `demi_journee_ht` | > 0 |
| Âge maximal d'un prix d'achat retenu (jours) | `validite_prix_jours` | 1 à 366 |
| Fraîcheur maximale d'un catalogue (jours) | `validite_catalogue_jours` | 1 à 366 |

La **TVA** n'est pas à fournir : elle se calcule par la règle légale datée
(`TECHNO.md`), sur les conditions relevées au chantier.

Pour le parcours vocal (`TECHNO.md` §3, contrat du 24/10/2026), relever aussi
la distinction entre **achat à transformer** et **forfait de vente final**, les
accessoires couverts par chaque forfait et les bases de prix de secours
explicitement autorisées. Ces paramètres appartiennent au compte du pro :
aucun tarif ni règle d'une autre instance ne sert de valeur par défaut. Un
forfait final ne reçoit pas de seconde majoration ; un accessoire inclus ne
devient pas une seconde ligne facturée. La présence de cette check-list ne
prouve pas que ces paramètres sont déjà raccordés au moteur.

### 1.4 Ses produits et ses fournisseurs

| Information | Où | Obligatoire |
|---|---|---|
| Ses fournisseurs, et pour chaque référence : désignation, catégorie, prix public HT, prix net HT, délai de commande, unité | `catalogue_fournisseur` (le prix net ne descend jamais dans le navigateur) | ✅ pour chiffrer |
| Ses factures d'achat récentes (prix réellement payés) | `banques_reno.banque` · achats | recommandé |
| Ses catalogues fournisseurs (PDF, date d'édition) et fiches techniques | `banques_reno.banque` · catalogues, fiches | recommandé |
| Ses prix fixes (kits, forfaits sans prix d'achat) | `banques_reno.banque` · prix fixes | facultatif |
| Ses prestations (main-d'œuvre, mise en service, déplacement, maintenance, dépose) et leurs prix de vente | `banques_reno.banque` · prestations | recommandé |
| Ses devis passés (PDF) et leur issue (signé, en attente, refusé) | corpus (`corpus_devis`, `corpus_lignes`) — seul l'identifiant client traverse | facultatif — c'est ce qui rend le premier devis « déjà presque prêt » |

Le pro peut dicter directement ses références. En cas de référence manquante ou
approximative, un devis passé fournit un candidat ; sans candidat compatible,
la recherche directe dans son catalogue est permise. Obtenir les documents
constructeur permettant de vérifier combinaisons, limites et accessoires,
distincts de la source fournisseur qui établit le prix d'achat actuel. Un prix
ou une référence retrouvée ne prouve pas la conformité de l'installation.

### 1.5 Ses clients existants (facultatif)

| Information | Où |
|---|---|
| Liste de ses clients à reprendre | `clients` rattachés à sa fiche (`artisan_id`) — un client créé ensuite par lui s'y rattache tout seul |

### 1.6 Ses mails aux clients

| Information | Où | Obligatoire |
|---|---|---|
| Le nom qui signe les mails | identité du pro (voie « au nom du pro », sans rien faire) | ✅ |
| S'il veut envoyer depuis SON domaine : l'adresse d'expédition, et l'accès à sa zone DNS | `email_expediteur`, puis `domaine_verifie` **après** contrôle | facultatif — ⛔ le drapeau se pose après vérification, sinon tous ses mails sont refusés |
| Ses textes de mails (envoi, relances par température, renvoi, communication douce) | `relance_gabarits` (clé · variante · sujet · corps) | facultatif — sinon la banque de textes livrée |
| S'il envoie des devis hors de l'application : son adresse d'envoi | `SYNC_EMAIL_EXPEDITEURS` | si besoin |

### 1.7 Ses relances

| Information | Où |
|---|---|
| Le moteur propose et il valide, ou il envoie seul | `RELANCE_MODE` (`valide` / `auto`) — par instance |
| SMS : oui ou non, à partir de quelle relance ; consentement de ses clients | `RELANCE_SMS_A_PARTIR_DE`, `clients.sms_consent_at` |

### 1.8 Son paiement en ligne

| Information | Où |
|---|---|
| Paiement en ligne : oui ou non | — |
| Le vendeur de référence, client par client : lui, ou la plateforme | `clients.origine` (vide = lui) |
| Son taux de commission (% du HT) | `artisans.commission_pct` — ⛔ sans valeur par défaut : un taux absent se voit |
| Son compte de paiement connecté | créé par lui, sur invitation (`STRIPE_INVITE_ENABLED`) |

### 1.9 Dossier d'implantation de l'agent devis

Le dossier est privé, rattaché au compte du professionnel, et reste hors de cette technologie neutre. Collecter les pièces existantes avant de poser des questions ; rendre une liste unique des manques. Chaque donnée comporte sa source, sa date, son périmètre et sa validation. Une case remplie n'est pas une preuve de bon raccordement.

| Bloc à obtenir | Contenu propre au professionnel | Preuve avant ouverture |
|---|---|---|
| Identité et responsables | Identité légale, coordonnées, établissements, utilisateurs autorisés, valideur métier et opérateur | Compte testé, bon émetteur dans le PDF, accès étranger refusé |
| Bibliothèque commerciale | Catalogue et achats datés, références exactes, conditionnements, unités, quantités, écoparticipations et prix fixes ; devis passés pertinents si disponibles | Références retrouvées et prix rapprochés des pièces ; aucun prix d'un autre compte |
| Calculs et prestations | Méthode de vente, arrondis, assiette de marge, traitement de l'apport, forfaits et leur contenu, main-d'œuvre et déplacements, validité des prix et règles de remises | Calcul direct puis contrôle inverse sur un chantier accepté ; aucun défaut repris d'une autre instance |
| Faits techniques | Caractéristiques et compatibilités, références liées aux documents et pages, exclusions, équivalences expressément permises, limites de prestation | Besoin et faits fabricant distincts ; conflit bloqué, source absente nommée |
| Document et fiscalité | Modèle de devis, logo, mentions, garanties, conditions de règlement, contexte fiscal et règles datées | PDF relu avec totaux, réserves et mentions ; estimation partielle distincte du devis complet |
| Canal et raccords | Canal choisi, comptes et numéros autorisés si nécessaires, transcription/compréhension, accès aux dossiers, stockage, génération et transport du PDF | Parcours réel depuis une demande neuve jusqu'au document reçu ; clés posées par un moyen sécurisé, jamais dans ce dossier |
| Exploitation | Droits de validation et d'envoi, budget et quotas, fenêtre pilote, arrêt, journal, cockpit, traitement des envois d'issue inconnue et rétention | Refus au dépassement, arrêt effectif et reprise sans renvoi automatique d'une issue inconnue |
| Recette du professionnel | Chantiers représentatifs, résultats attendus acceptés, plafond d'interventions et durée cible, cas négatifs et responsable de réception | Mesure de l'effort, de la qualité et du temps réels ; verdict sur la version exacte |

**À distinguer à chaque implantation :**
- **Paramétrage** : les données, règles, documents, accès et limites de ce professionnel.
- **Raccordement** : les fonctions qui doivent réellement lire ce paramétrage et utiliser son canal, son stockage et son modèle. Une configuration écrite ne prouve pas que le moteur la consomme.
- **Capacité manquante** : toute branche encore réservée à l'instance de référence, extraction non reçue ou connecteur absent. L'implanter et la tester avant de dire « il suffit de charger les données ».

La comparaison entre deux agents emploie la même demande, les mêmes sources et règles, les mêmes corrections et le même résultat attendu. Mesurer interventions, questions répétées, postes conservés, erreurs détectées, prix justifiés, coût et temps jusqu'au PDF reçu. Le temps local et le chronométrage du canal réel restent séparés.

Une confirmation groupée est permise pour plusieurs propositions uniques et tarifées, présentées explicitement. Elle conserve le besoin, les quantités et les valeurs demandées ; chaque référence est à nouveau contrôlée au clic sur la banque et la version courantes. Un candidat parmi plusieurs n'est pas choisi par son rang. Un choix périmé, une source manquante ou une ambiguïté ne devient pas un accord implicite.

### 1.10 État de préparation, sans raccourci

La voie A n'exige pas une extraction, mais exige le contrôle du bon compte et des capacités effectivement disponibles pour lui. La voie B exige toujours extraction neutre et base neuve éprouvées. Les constats historiques du plan ne prouvent pas l'état actuel de l'extraction. Le contrat vocal préparé et les évolutions du moteur doivent être intégrés à la série de neutralisation, puis extraits et éprouvés, avant de déclarer la voie B prête.

Chaque dossier d'implantation donne pour chaque bloc : **fourni · vérifié · à raccorder · bloqué**, avec la preuve et son responsable. Ne pas exiger les clients existants, le paiement en ligne, les relances ou la synchronisation de messagerie lorsqu'ils sont hors du périmètre de l'agent demandé. Ne pas ouvrir un canal ni créer une infrastructure facturée pour compléter une case.

## 2. Voie A — il rejoint la plateforme existante

Chaque ligne dit **qui** agit et **comment** : *Auto* (le système le fait),
*Auto partiel*, ou *Manuel*. Les lignes *Manuel* sont la liste de ce qu'il reste
à automatiser (§3).

| # | Étape | Qui | Mode | Gate |
|---|---|---|---|---|
| 1 | **Fiche du pro** : entreprise, contact, logo, savoir-faire, produits, note publique, attestations, identité légale (SIRET, adresse, qualifications, assurance). La TVA intracommunautaire se déduit du SIRET. | Paul (admin) | Manuel — TVA intracom Auto | Écriture en base réelle |
| 2 | **Commission** : le pourcentage du HT prélevé par la plateforme, propre à ce pro. | Paul | Manuel | Décision commerciale |
| 3 | **Compte de connexion** : créer l'utilisateur, lui donner le rôle de pro, rattacher sa fiche à son compte. Aucune fonction ni aucun écran ne le fait aujourd'hui. | Paul | Manuel | ⛔ Comptes et données réelles : mandat précis + revue |
| 4 | **Cloisonnement prouvé sous son identité réelle** : il voit ses clients et le catalogue de vente ; il ne voit ni client d'un autre pro, ni prix d'achat, ni droits d'administration. Ce qu'il voit compte autant que ce qu'il ne voit pas. | Paul / Léo (lecture) | Manuel (mesure) | Lecture seule |
| 5 | **Clients** : un client créé par le pro connecté lui est rattaché tout seul. Les clients existants se rattachent par l'administration. Un pro ne change ni le vendeur ni le pro d'un client. | Système / Paul | Auto (nouveaux) — Manuel (existants) | Écriture en base réelle (existants) |
| 6 | **Expéditeur des mails** : « au nom du pro » sur le domaine de la plateforme, sans rien faire ; depuis son propre domaine, seulement après vérification DNS chez lui **et** validation chez le service d'envoi. | Système / pro / Paul | Auto (nom) — Manuel (domaine) | ⛔ Le drapeau « domaine vérifié » se pose APRÈS le contrôle, sinon tous ses mails sont refusés |
| 7 | **Paiement en ligne** : le compte connecté du pro est créé et relu chaque jour par une tâche planifiée ; l'invitation ne part QUE si `STRIPE_INVITE_ENABLED` est ouvert. | Système / pro | Auto partiel | ⛔ Envoi réel à un tiers : décision de Paul |
| 8 | **Catalogue de ses fournisseurs** : ses références et leurs prix d'achat dans le catalogue fournisseur (`catalogue_[nom propre]`, multi-fournisseur), lues par le pro via la vue de vente, sans prix d'achat. | Paul | Manuel | Écriture en base réelle |
| 9 | **Bibliothèque de ses devis passés** (facultatif) : moissonner, structurer, rattacher, verser. Seul l'identifiant traverse vers la base, aucune donnée personnelle. | Paul | Manuel | Écriture en base réelle |
| 10 | **Ses règles de prix et sa bibliothèque de prix** (§1.3, §1.4 ; `TECHNO.md` §3) : coefficient, demi-journée de main-d'œuvre, validités ; ses produits, achats, prestations. Ce sont SES valeurs : la techno n'en propose aucune. | Paul (décision) | Manuel | Décision commerciale, puis écriture en base réelle |
| 11 | **Synchronisation des devis envoyés par mail** (s'il en envoie hors plateforme) : ajouter son adresse d'envoi à `SYNC_EMAIL_EXPEDITEURS`. Ne jamais compter sur la valeur par défaut du code : la poser explicitement. | Paul | Manuel (variable de production) | Variable de production |
| 12 | **Preuve** : rejouer la requête d'empreinte de la base, puis un devis de bout en bout sur l'écran du pro. | Paul / Léo | Manuel | ⛔ Un essai réel est un effet métier : mandat |
| 13 | **Devis entre professionnels** (s'il en émet) : ajouter son SIREN à `DEVIS_PRO_EMETTEURS` ; sa fiche porte sa forme juridique. Sans cela, ses devis gardent le chemin ordinaire. | Paul | Manuel (variable de production) | Variable de production |

## 3. Voie B — une instance à lui : son code, sa base

| # | Étape | Qui | Mode | Gate |
|---|---|---|---|---|
| B1 | **Le code** : `node zohshia/renodevis/extraire.mjs --depot <dépôt de référence> --sortie <dossier neuf> --verifier --modules <node_modules>`. Il applique la série de neutralisation en 3 voies, neutralise les migrations, ajoute la base, exporte sans historique, refuse au premier nom propre, et prouve typage, tests et build. | Léo | Auto | Lecture seule — aucun effet |
| B2 | **La base, prouvée avant d'être posée** : `node zohshia/renodevis/base/rejouer.mjs --depot <dépôt>` la reconstruit sur un Postgres jetable et la compare à l'étalon validé par la référence. | Léo | Auto | Lecture seule |
| B3 | **Son dépôt de code** : y pousser l'arbre extrait. | Paul | Manuel | ⛔ Création d'un dépôt : mandat |
| B4 | **Son projet de base** (région UE) : appliquer, dans l'ordre de `supabase/base/ordre.txt`, le socle, les migrations, la finition. **Pas** le fichier de plateforme simulée : le projet la fournit. | Paul | Manuel | ⛔ Nouveau projet et écriture en base : mandat, et dépense éventuelle |
| B5 | **Son hébergement** : relier le dépôt, poser TOUTES les variables du §6 avec SES valeurs (clés de ses services), générer un `CRON_SECRET` neuf, vérifier les tâches du §7. | Paul | Manuel | ⛔ Variables de production et dépense : mandat |
| B6 | **Ses services** : domaine d'envoi des mails vérifié, compte de paiement plateforme, SMS si voulu. | Paul / pro | Manuel | ⛔ Comptes tiers, dépense |
| B7 | **Puis la voie A, étapes 1 à 12, sur SON instance** — avec la check-list du §1. | Paul / Léo | voir §2 | voir §2 |
| B8 | **Preuve sur l'instance** : rejouer la requête d'empreinte de la base, puis un devis de bout en bout sur l'écran du pro. | Paul / Léo | Manuel | ⛔ Un essai réel est un effet métier : mandat |

⛔ **Au 10/10/2026, B1 refuse, et c'est attendu.** La série de neutralisation
se rafraîchit juste après le chantier qui fait de la formule de l'instance de
référence des paramètres du pro (`TECHNO.md` §8). Aucune voie B ne s'ouvre
avant ; la voie A reste ouverte.

⚠️ **Le code et la base vont ensemble.** L'extraction note le commit source ; la
base livrée est celle que B2 prouve conforme pour ce même état du dépôt. Une
extraction d'un commit et une base d'un autre ne se mélangent pas.

## 4. Ce qui se décide avec le pro, avant la première ligne

- **Ses règles de prix** (étape 10) — c'est SA marge, elle ne se devine pas.
- **Son vendeur de référence** : la plateforme ou lui, client par client.
- **Son expéditeur** : son nom sur le domaine de la plateforme, ou son domaine.
- **Son paiement en ligne** : oui ou non, et son taux de commission.
- **Ses devis entre professionnels** : en émet-il ? Si oui, étape 13.

**Recette du parcours vocal, à effectuer avant de l'annoncer opérationnel :**

- Note vocale envoyée ou fin annoncée d'une dictée en plusieurs messages : titre et synthèse complète relus une fois, puis lancement de la recherche après accord. Pas de redemande des valeurs connues ; les questions indispensables sont regroupées.
- Référence précise conservée ; modèle manquant recherché puis vérifié ; incompatibilité expliquée sans remplacement silencieux. La somme des longueurs n'est pas une preuve de chaque branche.
- Prix vérifiés séparément de la technique ; forfait final non majoré, accessoires non doublés. Prix absent : provision seulement sur une base autorisée, sinon exclusion visible et total connu qualifié comme partiel.
- Correction ciblée : données non modifiées conservées, configuration dépendante revérifiée, ancien résultat tardif refusé ; PDF rattaché à la dernière version validée.
- Progression fondée sur les événements réellement exécutés et éprouvée dans chaque canal ; interruption et reprise sans faux état « prêt » ni doublon.
- Même scénario fictif sur les canaux concernés ; mesure du délai vocal vers PDF et de l'attente du pro. Le contrat est adopté ; les résultats réels, le raccord des canaux et la performance restent à prouver par version.

Cette recette ne remplace ni la qualification technique ni les gates de mise en
service. Elle n'autorise aucun envoi client, aucune activation ni dépense.

## 5. Ce qui reste manuel — à automatiser

Lu dans la colonne *Mode* du §2 : la fiche (1), la commission (2), le compte (3),
l'expéditeur sur son domaine (6), le catalogue (8), la bibliothèque de devis (9),
les règles de prix (10), la synchronisation mail (11), l'ouverture du devis pro
(13). Le plus fréquent est le 3.
Chacun, automatisé, fait gagner une étape à **tous** les pros suivants.

## 6. Les variables d'environnement (mesurées)

Elles sont **par instance** : en voie A, le pro n'en touche qu'une
(`SYNC_EMAIL_EXPEDITEURS`, étape 11) ; en voie B, **toutes** se posent pour son
instance (§3, étape B5). Les noms
seulement, jamais les valeurs. ⛔ Les clés marquées *serveur* ne portent **jamais**
le préfixe `NEXT_PUBLIC_` : elles seraient publiées dans le navigateur.

| Variable | Rôle |
|---|---|
| `SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet de base |
| `SUPABASE_ANON_KEY` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique de la base (soumise à la RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` · `SUPABASE_SERVICE_KEY` | Clé *serveur* de la base — contourne la RLS |
| `APP_URL` | Adresse publique de l'application (liens des mails) |
| `CRON_SECRET` | Protège les tâches planifiées |
| `RESEND_API_KEY` | Clé *serveur* d'envoi des mails |
| `RR_FROM` | Expéditeur produit — ne se change pas en cours de séquence de relance |
| `FEEDBACK_ADMINS` · `FEEDBACK_NOTIFY_FROM` · `FEEDBACK_NOTIFY_TO` | Retours des utilisateurs |
| `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` | Clés *serveur* du paiement (la seconde accepte une liste) |
| `STRIPE_INVITE_ENABLED` | Interrupteur des invitations de paiement — fermé par défaut, délibérément |
| `GMAIL_CLIENT_ID` · `GMAIL_CLIENT_SECRET` · `GMAIL_REFRESH_TOKEN` | Lecture de la boîte mail pour la synchronisation |
| `SYNC_EMAIL_EXPEDITEURS` | ★ Adresses d'envoi des pros suivis — **à compléter pour chaque pro** |
| `SYNC_EMAIL_INTERNES` | Adresses internes, jamais prises pour un client |
| `SYNC_EMAIL_OWNER_ID` · `SYNC_EMAIL_FENETRE` | Propriétaire des devis synchronisés, fenêtre de recherche |
| `RELANCE_MODE` | `valide` (le moteur propose, le pro tranche) ou `auto` |
| `RELANCE_SMS_A_PARTIR_DE` | Relance à partir de laquelle un SMS s'ajoute ; 0 = jamais |
| `TWILIO_ACCOUNT_SID` · `TWILIO_AUTH_TOKEN` · `TWILIO_FROM` | SMS |
| `TRACK_DEDUPE_SECONDES` · `CHAUD_PAS_JOUR` · `CHAUD_PALIERS_OUVERTURES` | Calibrage du suivi : doublons d'ouverture, alertes « devis chaud » |
| `SILENCE_HEURES` | Devis jamais ouvert au bout de N heures : on prévient le pro que son mail n'est sans doute pas arrivé |
| `ANTHROPIC_API_KEY` | Clé *serveur* de l'assistant |
| `OPENAI_API_KEY` | Clé *serveur* de la dictée (session en temps réel, transcription des notes) — jamais importée par le code du navigateur |
| `DEVIS_PRO_EMETTEURS` | SIREN des émetteurs ouverts au générateur de devis pro, séparés par des virgules — vide = fermé pour tous (étape 13). Un identifiant public, pas un secret |
| `RECETTE_PDF` | **Tests seulement** : chemin local d'un PDF réel pour une recette de lecture des documents. Jamais posée en production ; le fichier ne se committe jamais |
| `AUDIT_PAC_BASE_URL` · `AUDIT_PAC_API_SECRET` | Appel du moteur d'audit énergétique (le second est *serveur*) |
| `RENOBOOST_API_URL` | Service d'extraction des PDF |
| `HUB_DEVIS_URL` · `NEXT_PUBLIC_HUB_URL` | Page devis historique du hub |
| `RENO_CREATION_SECRET` | Clé *serveur* qui signe les propositions de la création assistée |

### 6 bis. Propres au code extrait (voie B)

Le code neutre retire tout défaut d'instance : ce qui avait une valeur écrite en
dur se règle désormais, ou se refuse.

| Variable | Rôle |
|---|---|
| `MATRICES_PRIVEES_COMPTES` | Comptes autorisés à lire les matrices privées — vide = personne |
| `CORPUS_DOMAINE_ARTISAN` | Domaine d'envoi du pro, pour l'outil local de moisson du corpus (facultatif) |
| `SYNC_EMAIL_EXPEDITEURS` · `SYNC_EMAIL_INTERNES` · `SYNC_EMAIL_OWNER_ID` | **Obligatoires** pour la synchronisation mail : sans elles, elle refuse de tourner (plus aucun défaut) |

⚠️ Les tarifs, marges et coefficient du relevé portent des **valeurs d'exemple**,
marquées comme telles dans le code : elles se remplacent par les règles du pro
(§1.3) avant le premier devis.

## 7. Les tâches planifiées (mesurées, heures UTC)

| Tâche | Horaire | Ce qu'elle fait |
|---|---|---|
| `/api/cron/prevenance` | 02:00 | Prévient le pro quelques heures avant le passage du moteur |
| `/api/cron/sync-email` | 04:45 | Synchronise les devis envoyés par mail |
| `/api/cron/stripe-embarquement` | 06:30 | Crée et relit les comptes de paiement connectés ; invite si autorisé |
| `/api/cron/relances` | 08:00 | Le moteur de relance |

Chacune pose un **battement** dans `sentinelle_etat` : la requête d'empreinte dit
si elle tourne, et si elle tourne à vide.


