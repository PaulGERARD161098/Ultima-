# ZOH SHIA · RénoDevis — mettre la techno en service pour un pro

> **Ce qu'on invoque pour dupliquer la techno chez un autre artisan** (Paul,
> 04/10/2026). Le pro rejoint la plateforme existante ; on ne clone pas
> l'instance — `TECHNO.md` §4 dit pourquoi ce n'est pas possible aujourd'hui.
>
> ⛔ **Techno pure** : ce guide ne porte ni nom d'artisan, ni valeur propre à un
> pro, ni secret. Il dit QUOI renseigner, jamais AVEC QUOI.
>
> **S'invoque par** la compétence `zohshia`. Avant toute étape : relancer la
> collecte, lire la dérive, faire passer `tests/unit-zohshia.mjs`. Un guide non
> remesuré se lit comme un guide juste.
>
> ⛔ **Aucune étape ne s'exécute sur ce document seul.** Chaque geste qui écrit
> en base réelle, envoie un mail réel ou touche un compte est un **effet métier
> réel** : il demande le mandat précis de Paul (contrat LV1, `CLAUDE.md`
> d'Ultima, §Gates). Ce guide dit QUOI faire ; il n'autorise rien.

## 1. Les étapes

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
| 10 | **Ses règles de prix** : son profil (`TECHNO.md` §3) — formule, coefficient, main-d'œuvre et son unité, validités, TVA par défaut ou règle légale, confirmation de la TVA, remise. Ce sont SES valeurs : la techno n'en propose aucune. | Paul (décision) | Manuel | Décision commerciale, puis écriture en base réelle |
| 11 | **Synchronisation des devis envoyés par mail** (s'il en envoie hors plateforme) : ajouter son adresse d'envoi à `SYNC_EMAIL_EXPEDITEURS`. Ne jamais compter sur la valeur par défaut du code : la poser explicitement. | Paul | Manuel (variable de production) | Variable de production |
| 12 | **Preuve** : rejouer la requête d'empreinte de la base, puis un devis de bout en bout sur l'écran du pro. | Paul / Léo | Manuel | ⛔ Un essai réel est un effet métier : mandat |

## 2. Ce qui se décide avec le pro, avant la première ligne

- **Ses règles de prix** (étape 10) — c'est SA marge, elle ne se devine pas.
- **Son vendeur de référence** : la plateforme ou lui, client par client.
- **Son expéditeur** : son nom sur le domaine de la plateforme, ou son domaine.
- **Son paiement en ligne** : oui ou non, et son taux de commission.

## 3. Ce qui reste manuel — à automatiser

Lu dans la colonne *Mode* du §1 : la fiche (1), la commission (2), le compte (3),
l'expéditeur sur son domaine (6), le catalogue (8), la bibliothèque de devis (9),
les règles de prix (10), la synchronisation mail (11). Le plus fréquent est le 3.
Chacun, automatisé, fait gagner une étape à **tous** les pros suivants.

## 4. Les variables d'environnement (mesurées)

Elles sont **par instance** : mettre la techno en service pour un pro n'en touche
qu'une (`SYNC_EMAIL_EXPEDITEURS`, étape 11). Les autres sont listées pour
qu'aucune ne soit oubliée le jour où l'on montera une seconde instance. Les noms
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
| `AUDIT_PAC_BASE_URL` · `AUDIT_PAC_API_SECRET` | Appel du moteur d'audit énergétique (le second est *serveur*) |
| `RENOBOOST_API_URL` | Service d'extraction des PDF |
| `HUB_DEVIS_URL` · `NEXT_PUBLIC_HUB_URL` | Page devis historique du hub |
| `RENO_CREATION_SECRET` | Clé *serveur* qui signe les propositions de la création assistée |

## 5. Les tâches planifiées (mesurées, heures UTC)

| Tâche | Horaire | Ce qu'elle fait |
|---|---|---|
| `/api/cron/prevenance` | 02:00 | Prévient le pro quelques heures avant le passage du moteur |
| `/api/cron/sync-email` | 04:45 | Synchronise les devis envoyés par mail |
| `/api/cron/stripe-embarquement` | 06:30 | Crée et relit les comptes de paiement connectés ; invite si autorisé |
| `/api/cron/relances` | 08:00 | Le moteur de relance |

Chacune pose un **battement** dans `sentinelle_etat` : la requête d'empreinte dit
si elle tourne, et si elle tourne à vide.
