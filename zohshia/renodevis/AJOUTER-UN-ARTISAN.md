# ZOH SHIA · RénoDevis — ajouter un artisan

> **Ce qu'on invoque pour dupliquer RénoDevis chez un autre artisan** (Paul,
> 04/10/2026 : *« le but est de pouvoir l'invoquer pour dupliquer aisément pour
> un autre artisan »*). Option **A**, arbitrée le même jour : l'artisan rejoint
> la **plateforme existante**, comme SOLA GROUPE. On ne clone pas l'instance —
> `TECHNO.md` §5 dit pourquoi ce n'est pas possible aujourd'hui.
>
> **S'invoque par** la compétence `zohshia` (`.claude/skills/zohshia/SKILL.md`).
> Avant toute étape : relancer la collecte, lire la dérive, faire passer
> `tests/unit-zohshia.mjs`. Un guide non remesuré se lit comme un guide juste.
>
> ⛔ **Aucune étape ne s'exécute sur ce document seul.** Chaque geste qui écrit
> en base réelle, envoie un mail réel ou touche un compte est un **effet métier
> réel** : il demande le mandat précis de Paul (contrat LV1, `CLAUDE.md`
> d'Ultima, §Gates). Ce guide dit QUOI faire ; il n'autorise rien.
>
> ⛔ **Des noms, jamais des valeurs** : ni secret, ni adresse, ni identifiant.

## 1. Les étapes

Chaque ligne dit **qui** agit et **comment** : *Auto* (le système le fait),
*Auto partiel*, ou *Manuel*. Les lignes *Manuel* sont la liste de ce qu'il reste
à automatiser (Directive IA, §3).

| # | Étape | Qui | Mode | Gate | Où |
|---|---|---|---|---|---|
| 1 | **Fiche de l'artisan** : entreprise, contact, logo (≤ 2 Mo), savoir-faire, produits, note Google, attestations, identité légale (SIRET, adresse, RGE, décennale). La TVA intracommunautaire se déduit du SIRET. | Paul (admin) | Manuel — TVA intracom Auto | Écriture en base réelle | écran `/artisans`, `app/artisans/actions.ts` |
| 2 | **Commission** : 5 ou 10 % du HT (arbitrage A3), sur la fiche | Paul | Manuel | Décision commerciale | `app/artisans/actions.ts` (`commission_pct`) |
| 3 | **Compte de connexion** : créer l'utilisateur, lui donner le rôle `pro`, puis rattacher `artisans.profile_id`. Mesuré le 04/10 : **aucune fonction du code ne crée de compte, aucun écran n'écrit `profile_id`**. | Paul | Manuel (Supabase) | ⛔ Auth et données réelles : mandat précis + revue | Supabase Auth, table `profiles`, `artisans.profile_id` |
| 4 | **Cloisonnement prouvé sous son identité réelle** : il voit ses clients et le catalogue de VENTE ; il ne voit ni client d'un autre artisan, ni prix d'achat, ni `is_admin`. Le miroir compte autant que les zéros. | Paul / Léo (lecture) | Manuel (mesure) | Lecture seule | sondes « RLS · » de la requête d'empreinte, `CLAUDE.md` de RénoDevis |
| 5 | **Clients** : un client créé par l'artisan connecté porte son `artisan_id` tout seul. Les clients existants se rattachent par l'admin. Un pro ne peut changer ni le vendeur ni l'artisan d'un client (garde A1-G). | Système / Paul | Auto (nouveaux) — Manuel (existants) | Écriture en base réelle (existants) | `app/devis/nouveau/actions.ts`, trigger `trg_clients_garde_vendeur` |
| 6 | **Expéditeur des mails** : voie A (« au nom de » l'artisan, notre domaine) sans rien faire ; voie C (son domaine) seulement après vérification DNS chez lui **et** « Verified » chez Resend. `email_expediteur` n'est éditable par aucun écran (mesuré). | Système / artisan / Paul | Auto (A) — Manuel (C) | ⛔ Le drapeau `domaine_verifie` se pose APRÈS le contrôle, sinon tous ses mails sont refusés | `lib/expediteur.ts`, `docs/EXPEDITEUR-ARTISAN.md` |
| 7 | **Paiement Stripe Connect** : le compte connecté est créé et son état relu chaque jour par la tâche planifiée ; l'invitation ne part QUE si `STRIPE_INVITE_ENABLED` est ouvert. | Système / artisan | Auto partiel | ⛔ Envoi réel à un tiers : décision de Paul | `lib/stripe.ts`, `/api/cron/stripe-embarquement` |
| 8 | **Catalogue de ses fournisseurs** : références dans `catalogue_icestream` (nom hérité de SOLA ; la colonne `fournisseur` le rend multi-fournisseur), lues par l'artisan via la vue `catalogue_vente`, sans prix d'achat. Les voies d'alimentation existantes ont été construites pour SOLA. | Paul | Manuel | Écriture en base réelle | `app/api/bibliotheque/catalogues`, migrations `*_catalogue_*` |
| 9 | **Corpus de ses devis passés** (facultatif) : moissonner → structurer → rattacher → verser. Seul l'identifiant traverse vers la base, aucune donnée personnelle. | Paul | Manuel | Écriture en base réelle | `outils/corpus/README.md` |
| 10 | **Règles de chiffrage** : coefficient produits, prix de la demi-journée, validité des prix, TVA par défaut. **Aujourd'hui codées pour SOLA** (§2) : pour un deuxième artisan, c'est du CODE à généraliser, pas un réglage. | Paul (décision) puis code | Manuel (code) | PR relue | `lib/reglesSola.ts`, `lib/creationReno.ts` |
| 11 | **Synchro des devis envoyés par mail** (s'il en envoie hors plateforme) : ajouter son adresse d'envoi à `SYNC_EMAIL_EXPEDITEURS`. La valeur par défaut codée est celle de SOLA. | Paul | Manuel (Vercel) | Variable de production | `lib/config.ts`, `docs/SYNC-DEVIS-EMAIL.md` |
| 12 | **Preuve** : rejouer la requête d'empreinte de RénoDevis, puis un devis de bout en bout sur l'écran de l'artisan. | Paul / Léo | Manuel | ⛔ Un essai réel est un effet métier : mandat | `CLAUDE.md` de RénoDevis |

## 2. Le code écrit pour SOLA — le vrai coût de la duplication

Mesuré par `collecter.mjs` (lignes de code seulement, commentaires exclus) :
**ces fichiers nomment SOLA ou portent un identifiant écrit en dur**. Tant
qu'ils le font, un deuxième artisan hérite des règles, de la matrice et des
contrôles de SOLA. Généraliser ce code (des règles PAR ARTISAN, lues en base)
est le chantier qui rend la duplication « aisée » ; il ne se fait pas dans ce
guide, il se cadre à part.

| Famille | Fichiers |
|---|---|
| Règles, tarification, marge, TVA | `lib/reglesSola.ts` · `lib/creationReno.ts` · `lib/creationRenoServeur.ts` · `lib/tarificationSola.ts` · `lib/margeSola.ts` · `lib/margeSolaHistorique.ts` · `lib/tvaSola.ts` · `lib/tva.ts` · `lib/config.ts` |
| Matrice, présentation, PDF | `lib/matriceSola.ts` · `lib/matricesPrivees.ts` · `lib/presentationSola.ts` · `lib/pdfSola.ts` · `lib/pdfDevis.ts` · `lib/specimenSola.ts` · `lib/versionDocuments.ts` · `app/api/bibliotheque/matrices/sola-air/route.ts` · `app/bibliotheque/matrices/sola-air/page.tsx` · `app/bibliotheque/MatriceSola.tsx` |
| Contrôles et validation | `lib/controleDevis.ts` · `lib/controleRejeuSola.ts` · `lib/validationSola.ts` · `app/devis/nouveau/controle.ts` · `components/ControleAvantDevis.tsx` |
| Création et modification de devis | `app/devis/nouveau/actions.ts` · `app/devis/[id]/modifier/actions.ts` · `app/devis/[id]/modifier/page.tsx` · `app/devis/[id]/envoi/actions.ts` · `app/api/devis/proposer/route.ts` · `components/DevisLineBuilder.tsx` · `components/PropositionIA.tsx` · `lib/modeles.ts` |
| Bibliothèque | `app/bibliotheque/Accueil.tsx` · `app/bibliotheque/devis/page.tsx` · `app/bibliotheque/produits/page.tsx` · `app/bibliotheque/produits/ui.tsx` |
| Page client et relevé | `app/d/[token]/page.tsx` · `releve/calcul/dictee.js` · `releve/ui/ReleveChantier_v2.jsx` |

## 3. Ce qui reste manuel — à automatiser (Directive IA)

Lu dans la colonne *Mode* du §1 : le compte (3), l'expéditeur voie C (6), le
catalogue (8), le corpus (9), les règles de chiffrage (10), la synchro mail (11).
Le plus lourd est le 10 ; le plus fréquent est le 3. Chacun, automatisé, fait
gagner une étape à **tous** les artisans suivants.

## 4. Les variables d'environnement (mesurées)

Elles sont **par instance** : ajouter un artisan n'en touche qu'une
(`SYNC_EMAIL_EXPEDITEURS`, étape 11). Les autres sont listées pour qu'aucune ne
soit oubliée le jour où l'on montera une seconde instance. ⛔ Les clés marquées
*serveur* ne portent **jamais** le préfixe `NEXT_PUBLIC_` : elles seraient
publiées dans le navigateur.

| Variable | Rôle |
|---|---|
| `SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase |
| `SUPABASE_ANON_KEY` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (soumise à la RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` · `SUPABASE_SERVICE_KEY` | Clé *serveur* Supabase — contourne la RLS |
| `APP_URL` | Adresse publique de l'application (liens des mails) |
| `CRON_SECRET` | Protège les tâches planifiées |
| `RESEND_API_KEY` | Clé *serveur* d'envoi des mails |
| `RR_FROM` | Expéditeur produit — ne se change pas en cours de séquence de relance |
| `FEEDBACK_ADMINS` · `FEEDBACK_NOTIFY_FROM` · `FEEDBACK_NOTIFY_TO` | Retours des utilisateurs (`/api/reno/retour`) |
| `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` | Clés *serveur* Stripe (le second accepte une liste) |
| `STRIPE_INVITE_ENABLED` | Interrupteur des invitations Stripe — fermé par défaut, délibérément |
| `GMAIL_CLIENT_ID` · `GMAIL_CLIENT_SECRET` · `GMAIL_REFRESH_TOKEN` | Lecture de la boîte pro pour la synchro |
| `SYNC_EMAIL_EXPEDITEURS` | ★ Adresses d'envoi des artisans suivis — **à compléter pour chaque artisan** |
| `SYNC_EMAIL_INTERNES` | Adresses internes, jamais prises pour un client |
| `SYNC_EMAIL_OWNER_ID` · `SYNC_EMAIL_FENETRE` | Propriétaire des devis synchronisés, fenêtre de recherche |
| `RELANCE_MODE` | `valide` (Réno prépare, l'artisan tranche) ou `auto` |
| `RELANCE_SMS_A_PARTIR_DE` | Relance (1 à 3) à partir de laquelle un SMS s'ajoute ; 0 = jamais (canal muet) |
| `TWILIO_ACCOUNT_SID` · `TWILIO_AUTH_TOKEN` · `TWILIO_FROM` | SMS — canal muet |
| `TRACK_DEDUPE_SECONDES` · `CHAUD_PAS_JOUR` · `CHAUD_PALIERS_OUVERTURES` | Calibrage du suivi : doublons d'ouverture, alertes « devis chaud » |
| `SILENCE_HEURES` | Devis jamais ouvert au bout de N heures : on prévient l'artisan que son mail n'est sans doute pas arrivé |
| `ANTHROPIC_API_KEY` | Clé *serveur* de l'assistant Réno |
| `AUDIT_PAC_BASE_URL` · `AUDIT_PAC_API_SECRET` | Appel de l'audit PAC de mon-dpe.fr (le second est *serveur*) |
| `RENOBOOST_API_URL` | Extraction des PDF par RénoBoost |
| `HUB_DEVIS_URL` · `NEXT_PUBLIC_HUB_URL` | Page devis du hub RénoBoost |
| `RENO_CREATION_SECRET` | Clé *serveur* qui signe les propositions de devis de la création assistée ; à défaut, la clé de service Supabase sert (`lib/creationRenoServeur.ts`) |

## 5. Les tâches planifiées (mesurées, heures UTC)

| Tâche | Horaire | Ce qu'elle fait |
|---|---|---|
| `/api/cron/prevenance` | 02:00 | Prévient l'artisan six heures avant le passage du moteur |
| `/api/cron/sync-email` | 04:45 | Synchronise les devis envoyés par mail |
| `/api/cron/stripe-embarquement` | 06:30 | Crée et relit les comptes Stripe connectés ; invite si autorisé |
| `/api/cron/relances` | 08:00 | Le moteur de relance |

Chacune pose un **battement** dans `sentinelle_etat` : la requête d'empreinte
de RénoDevis dit si elle tourne, et si elle tourne à vide.
