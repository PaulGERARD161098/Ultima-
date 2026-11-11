# ZOH SHIA : le canal WhatsApp de RénoDevis (plan neutre de réimplantation)

Plan écrit le 11/11/2026, avant le retrait du canal du produit. Il décrit ce que le code FAISAIT réellement, lu dans le dépôt RénoDevis à l'état du commit d'archive `fd168af` (tête de `main` ce jour-là). Il ne porte aucune valeur, aucun secret, aucun nom propre. Les chemins de fichiers dont le nom contient un nom propre s'écrivent `[nom propre]`.

Source de vérité : le code du commit `fd168af`. Ce plan est une carte, pas une copie. Aucun code n'est recopié ici.

## 1. Ce que fait le canal (le parcours du pro)

Un professionnel envoie un message à un numéro WhatsApp dédié : une note vocale, un texte, un bouton de réponse, ou un PDF.

1. Meta (WhatsApp Cloud API) livre le message à un webhook. Le webhook vérifie la signature du corps brut.
2. Le numéro de l'expéditeur est rattaché à un artisan et à un profil par une déclaration posée côté serveur, recoupée avec la base à chaque message. Un numéro inconnu : silence, rien n'est écrit.
3. Le message est enregistré dans `canal_messages` (déduplication par identifiant Meta) AVANT l'accusé 200. Si l'enregistrement échoue, le webhook répond 500 et Meta relivre.
4. Après l'accusé, le traitement tourne : un bail de conversation, un quota de tentatives et un budget en micro-dollars sont vérifiés avant tout appel payant.
5. Une note vocale est téléchargée chez Meta puis transcrite. Un texte est pris tel quel. Un PDF est téléchargé puis lu (import).
6. Une IA de compréhension extrait des besoins ; le chiffrage vient de la bibliothèque de prix de l'artisan, jamais de l'IA. Une revue finale relit le brouillon.
7. Le résultat est un devis au statut « Brouillon », sans client, marqué « recette » : il ne peut ni partir chez un client ni entrer dans la file de relance.
8. Le pro reçoit des réponses dans le fil : résumé, questions, boutons, PDF de travail, lien de reprise vers l'écran.
9. Le pro peut aussi demander dans le fil : récapitulatif, PDF, correction, relances, facture, fiche client, enseignement d'une règle, recherche dans son compte.
10. Un cron de reprise termine les messages acceptés puis interrompus et purge les textes de plus de 48 h.

## 2. Les mécanismes, par fonction

Tous les chemins sont relatifs à la racine du dépôt RénoDevis. Chaque module a, en général, un test voisin `*.test.ts`.

### 2.1 Réception et sécurité
- `app/api/whatsapp/webhook/route.ts` : GET (vérification d'abonnement Meta) et POST (réception). Durée maximale 300 s. Corps limité à 512 Ko.
- `lib/whatsappSignature.ts` : signature HMAC-SHA256 du corps brut (en-tête `x-hub-signature-256`), comparaison à temps constant ; défi de vérification comparé à temps constant.
- `lib/whatsappMessages.ts` : lecture hostile du JSON Meta. Types retenus : texte, audio, bouton (réponse interactive ou liste), document PDF seulement. Le reste devient « autre ». Les accusés (`statuses`) sont ignorés. Un message adressé à un autre numéro de l'application est écarté.
- `lib/garde.ts` (PARTAGÉ, voir 7) : déclare `/api/whatsapp/` public, car Meta ne porte pas de session.
- `lib/whatsappCanal.ts` : assemblage de production (branche toutes les dépendances), liste des variables du canal, configuration Meta.
- `lib/whatsappAgent.ts` : le cœur. Trois temps : `recevoir` (rattacher puis enregistrer), `traiter` (le métier une seule fois, puis les réponses une par une), `reprendre` (reprise et purge). Définit aussi le bail de reprise (6 min), le nombre maximal de tentatives (5), la durée de vie d'un devis en cours (24 h) et la conservation de la charge (48 h).
- `lib/diagnosticAbonnementMeta.ts` : diagnostic de l'abonnement Meta (outil, non appelé par l'application).

### 2.2 Rattachement du numéro à l'artisan
- `lib/whatsappRattachement.ts` : le numéro est rattaché par une DÉCLARATION serveur (liste JSON dans une variable d'environnement), pas par `artisans.tel`. Elle est recoupée avec la base à chaque message : l'artisan existe, et le profil déclaré est soit le compte de cet artisan, soit un administrateur. Un numéro déclaré deux fois invalide toute la liste. Une variable de correction existe pour rectifier une déclaration.
- `lib/rattachementWhatsApp.ts` : rattachement côté écran d'envoi (PARTAGÉ avec l'envoi de devis, voir 7).
- `lib/whatsappRattachement.ts` produit le type `RattachementVerifie`, seul passeport accepté par le dépôt de données.

### 2.3 Dépôt de données du canal
- `lib/whatsappDepot.ts` : tout ce que le canal lit et écrit en base, en `service_role`. Chaque requête sur `devis` porte trois bornes : propriétaire = profil rattaché, artisan de l'état du canal = artisan rattaché, source = fil. Contient l'interrupteur en base, le bail atomique, l'abandon après les tentatives maximales, la purge.
- `lib/whatsappMessages.ts`, `lib/whatsappDepot.ts` : voir aussi `lib/whatsappDocument.test.ts` et `lib/whatsappDepotOrdre.test.ts` pour l'ordre d'écriture attendu.

### 2.4 Transcription
- `lib/transcriptionNote.ts` : appel au service de transcription (un seul appel amont, partagé avec la dictée au micro : PARTAGÉ, voir 7). Aucun audio ni texte dans les journaux.
- `lib/dureeOpus.ts` : durée d'une note Opus (borne dix minutes).
- `lib/whatsappMeta.ts` : téléchargement de l'audio (plafond 16 Mo) et du document (plafond 23 Mo) ; envoi de messages sortants ; téléversement de PDF ; résultat « ok », « échec » ou « incertain ».

### 2.5 Compréhension
- `lib/comprehensionWhatsApp.ts` : appel au modèle de compréhension (sortie structurée), hypothèses affichées, questions, reformulation.
- `lib/commandesWhatsApp.ts`, `lib/dialogueWhatsApp.ts` : reconnaissance des commandes texte (récapitulatif, PDF, reprise, correction).
- `lib/correctionWhatsApp.ts`, `lib/correctionAppareilExplicite.ts`, `lib/confirmationQuantiteWhatsApp.ts`, `lib/reprisePrecisions[nom propre].ts` : corrections et précisions.
- `lib/nettoyageConsignesWhatsApp.ts`, `lib/consignesCanal.ts` : nettoyage du texte métier.
- `lib/libellesRecette[nom propre].ts` : libellés de la recette (branché dans l'assemblage).
- `lib/rechercheCompteAgent.ts`, `lib/rechercheProNomme.ts` : recherche dans le compte et consultation ponctuelle d'un professionnel nommé ; `app/accueil-actions.ts` les appelle aussi (PARTAGÉ, voir 7).

### 2.6 Brouillon et import
- Création du brouillon : `lib/whatsappCanal.ts` et `lib/whatsappDepot.ts`, avec `lib/banqueChantierWhatsApp.ts`, `lib/creationRenoServeur.ts` (PARTAGÉ), `lib/propositionBanque.ts` (PARTAGÉ), `lib/estimationAgent.ts` (PARTAGÉ), `lib/revueBrouillon.ts` (revue finale, à vérifier avant retrait).
- Import d'un PDF reçu sur le fil : `lib/importDepuisFil.ts`, `lib/importDepuisFilServeur.ts`. Un PDF relivré ne crée jamais un second devis (empreinte d'import). Rattachement du client par une commande dans la légende.
- `lib/originalDevis.ts`, `lib/originalImportEligible.ts` (PARTAGÉS) : reconnaissent un original importé du fil.
- Marque « recette » : tout brouillon né sur le fil est en recette. Les refus correspondants vivent dans `lib/whatsappAgent.ts` (constante de refus et fonction d'erreur) et sont lus par l'envoi (PARTAGÉ).

### 2.7 Réponses et envoi sortant
- `lib/whatsappMeta.ts` : construction du corps sortant (texte, boutons, liste, document) et envoi.
- `lib/documentWhatsApp.ts` : PDF de travail au professionnel sur prix recalculés. Aucun lien public, aucune action vers un client.
- `lib/repriseWhatsApp.ts` et `app/api/reno/reprise/route.ts` : lien de reprise signé (quinze minutes), navigation seulement, session obligatoire.
- `lib/accordWhatsApp.ts`, `lib/accordWhatsAppChamps.ts` : accord signé pour un envoi (PARTAGÉ avec les pièces jointes de mail et l'écran d'envoi).
- `lib/envoiWhatsApp.ts`, `lib/operationsWhatsApp.ts`, `lib/operationsWhatsAppServeur.ts`, `lib/clientWhatsApp.ts`, `lib/factureWhatsApp.ts`, `lib/commerceWhatsApp.ts`, `lib/commerceWhatsAppServeur.ts`, `lib/recuEnvoiFil.ts` : opérations demandées depuis le fil (envoi, fiche client, facture, relances), chacune avec un ticket et une transition atomique côté base.
- Chaque réponse partie est retirée de la file AVANT la suivante ; une réponse à issue inconnue n'est jamais rejouée.

### 2.8 Reprise
- `app/api/cron/whatsapp-reprise/route.ts` : protégée par le secret de cron (en-tête Bearer). Appelle `reprendre` (vingt lignes) puis la conservation, écrit un battement.
- `reprendre` dans `lib/whatsappAgent.ts` : purge d'abord (même canal fermé), puis traite les lignes acceptées non finies dont le bail est libre ou périmé.
- Reprise opportuniste : chaque appel du webhook relance aussi cinq traitements en souffrance.
- Option : `docs/whatsapp/reprise-pg-cron.sql` (non appliqué, hors migrations) planifierait la reprise chaque minute avec pg_cron et pg_net ; le secret se lirait dans le coffre de Supabase.

### 2.9 Leçons (apprentissage)
- `lib/leconsWhatsApp.ts` : registre de leçons par compte (règles apprises, grammaire bornée).
- `lib/leconsWhatsAppServeur.ts`, `lib/serviceLeconsWhatsApp.ts` : lecture, modification, installation, via une fonction de base à comparaison atomique.
- `lib/leconsCommunes.ts` : registre commun ; filtre conservateur, aucune promotion automatique d'une leçon privée, attestation humaine requise.
- `lib/enseignementWhatsApp.ts` : commande « enseigner » dans le fil, proposition présentée au pro avant mémorisation.
- Routes : `app/api/reno/lecons/route.ts`, `app/api/reno/lecons/communes/route.ts`, `app/api/reno/lecons/installations/route.ts`.
- Écran : `components/ApprentissagesWhatsApp.tsx`, `components/AccesWhatsApp.tsx`, `lib/accueilWhatsApp.ts`.
- Outils de mesure : `outils/corpus/whatsapp/` (cas, mesure, audit de lexique) et `docs/whatsapp/apprentissage-pro-commun.md`.

### 2.10 Quotas et budget
- `lib/quotaWhatsApp.ts` : quota de tentatives de traitement par compte et par jour (pas un budget en euros), mis à jour par comparaison atomique. Fermé si la configuration est absente.
- `lib/budgetWhatsApp.ts` : budget en micro-dollars (plafond par jour, par dossier, et un total optionnel), réservations rapprochées, validité datée. Fermé si la configuration est absente ou périmée.
- `lib/appelsWhatsApp.ts` : transport unique des appels payants ; seul arbitre avant CHAQUE appel ; liste fermée de modèles et de cibles ; tarifs datés.
- `lib/autorisationBudgetWhatsApp.ts` : une réponse déjà calculée ne réserve pas un nouveau cycle.
- `lib/verrouConversation.ts` : bail de conversation par compte, plus long que l'exécution (PARTAGÉ : aussi lu par le moteur de relances).
- `lib/limiteIA.ts` (PARTAGÉ) : limite souple par instance.
- Le quota, le budget et les leçons se configurent en posant des lignes dans `sentinelle_etat` (voir 3). Aucune ligne n'est posée par le code.

### 2.11 Interrupteurs
- Un canal ne traite que si les DEUX sont ouverts : la variable d'environnement d'armement du déploiement, ET la clé `canal:whatsapp` de `sentinelle_etat` contenant un état actif (avec une date de validité facultative). Toute erreur de lecture = fermé. Code : `lib/whatsappDepot.ts` (fonction d'interrupteur) et `lib/whatsappCanal.ts`.
- L'interrupteur est relu avant chaque effet externe ; un arrêt laisse la ligne en attente et la reprend à la réouverture.
- Canal fermé : le webhook répond 200 (Meta cesse de relivrer) mais n'enregistre ni ne traite rien.
- Hors canal mais lié : l'interrupteur des relances automatiques `lib/interrupteurRelances.ts` (PARTAGÉ, voir 7) et l'envoi sans clic (clé d'autonomie + variable), fermé par défaut.

### 2.12 Purge et conservation
- `reprendre` efface la charge et les réponses de plus de 48 h, canal ouvert ou fermé.
- `lib/conservationWhatsApp.ts` : efface les sources privées (dictée, extraits) des brouillons du canal selon une politique stockée en base (clé `conservation:whatsapp`) ET une variable d'autorisation d'effacement. Sans les deux : lecture seule (dry run). Elle supprime les sources, pas les lignes du devis.

### 2.13 Écrans et anomalies liés au canal
- `components/AccesWhatsApp.tsx` (vérification d'accès sur l'écran « Créer »), `components/CreerChoix.tsx` (choix de création, PARTAGÉ), `components/ApprentissagesWhatsApp.tsx`.
- `components/RegistreAnomalies.tsx`, `lib/serviceAnomalies.ts`, `lib/registreAnomaliesServeur.ts`, `lib/raccordementRetour.ts`, routes `app/api/reno/anomalies/route.ts` et `app/api/reno/retour/route.ts` : registre des anomalies de brouillons du fil, aussi alimenté par le bouton de retour utilisateur (PARTAGÉ avec les retours, à examiner).
- `app/devis/[id]/page.tsx` : affichage « brouillon préparé par l'agent » (PARTAGÉ).

## 3. Les données

### 3.1 Migrations (dans `supabase/migrations/`)
- `20261009b_rd_canal_messages.sql` : crée la table de déduplication du canal (W0).
- `20261011_rd_canal_messages_reprise.sql` : ajoute la reprise (charge, réponses, bail, profil, tentatives).
- Autres migrations qui touchent le canal sans lui être propres : `20261006_rd_clients_rattache_artisan.sql` (rattachement de fiches à l'artisan, PARTAGÉE, à ne pas retirer).

### 3.2 Table `canal_messages`
- Colonnes d'origine : identifiant interne, canal (valeur unique permise : whatsapp), identifiant Meta du message, artisan, devis, type, date de réception, date de traitement, résultat.
- Colonnes de reprise : profil, charge (JSON), réponses (JSON), date de prise (bail), date de réponse, tentatives.
- Contraintes : unicité sur (canal, identifiant Meta) = le dédoublonnage ; longueur de l'identifiant ; types permis (texte, audio, image, document, bouton, statut, autre) ; résultats permis (devis_cree, piece_deposee, envoi, facture, refuse, ignore, erreur) ; forme de la charge (objet) et des réponses (tableau) ; tentatives entre 0 et 20 ; une ligne finie ne garde ni charge ni réponses.
- Index : par artisan et date ; index partiel des lignes en attente.
- Droits : sécurité par ligne activée ; aucun droit pour `anon` ; aucune écriture pour les comptes connectés ; lecture pour l'artisan sur ses lignes et pour l'administrateur ; écriture par le serveur seul.
- Aucun contenu, aucun numéro, aucun nom dans les colonnes permanentes. Le texte du message n'existe que dans la charge, le temps du traitement.

### 3.3 Table `sentinelle_etat` (partagée) : clés utilisées par le canal
Noms de clés seulement, aucune valeur :
- `canal:whatsapp` : interrupteur d'exécution.
- `conservation:whatsapp` : politique de conservation des sources.
- `admission:lecons:whatsapp` : admission du registre de leçons.
- `reno:autonomie` : envoi sans clic (fermé par défaut).
- Préfixes de clés par compte (suffixe = empreinte tronquée) : `quota:whatsapp:`, `budget:wa:`, `lecons:wa:`, `fil:whatsapp:` (bail de conversation).
- Battements (préfixe `battement:`) : `rr-whatsapp-entree` (après signature valide), `rr-whatsapp` (traitements), `rr-whatsapp-reprise` (cron).

### 3.4 Autres données touchées
- Table `devis` : colonne `extra` porte `source` = fil, l'état du canal (`extra.whatsapp`), la marque `recette_whatsapp`, la marque d'import, l'empreinte d'import, et un ticket d'opération. Le statut reste « Brouillon » pendant la recette.
- Stockage de fichiers `devis-pdf` : PDF importés du fil.
- Table `clients` : fiche créée ou rattachée par une commande du fil.

### 3.5 SQL préparés hors migrations (`docs/whatsapp/` et `docs/v2/`)
Leurs en-têtes disent « préparé, jamais appliqué sur une base métier ». Leur état réel en base n'a pas été vérifié ici.
- `docs/whatsapp/installer-pilote-complet.sql` (assemble les autres), `installer-cas-etat.sql` (fonction de comparaison atomique d'état), `installer-operations-fil.sql`, `installer-actions-relances.sql`, `installer-facture-atomique.sql`, `docs/v2/raccord-envoi-whatsapp.sql`.
- Contrôles : `controle-installation.sql`, `controle-pilote-preactivation.sql`, `controle-limites-pilote.sql`, `controle-revue-finale.sql`.
- Fonctions de base appelées par le code : `whatsapp_cas_etat`, `whatsapp_proposer_relance`, `whatsapp_action_relance`, et les fonctions d'opération (client, envoi, proposition).

### 3.6 Règles de conservation
- Charge et réponses : effacées dès que le message est fini ; sinon purgées après 48 h.
- Tentatives : abandon après cinq, charge effacée.
- Aucun contenu de message, numéro ou nom n'est conservé dans `canal_messages`.
- Sources privées des brouillons : effacées seulement sur politique + autorisation.
- Journaux : compteurs et causes seulement, jamais de texte, de numéro ni d'identifiant Meta.

## 4. Routes HTTP, crons et workflows

Routes :
- GET et POST `/api/whatsapp/webhook`.
- GET `/api/cron/whatsapp-reprise`.
- GET `/api/reno/reprise` (lien de reprise).
- GET et POST `/api/reno/lecons`, `/api/reno/lecons/communes`, `/api/reno/lecons/installations`.
- Partagées, liées aux anomalies : `/api/reno/anomalies`, `/api/reno/retour`.
- Partagée : `/api/dictee/transcrire` (dictée au micro, même transcription).

Crons (`vercel.json`) : la ligne `/api/cron/whatsapp-reprise` (une fois par jour, en filet). Les autres crons du fichier ne sont pas du canal (synchro e-mail, relances, embarquement de paiement, prévenances, souhaits de pose). Retirer seulement la ligne de reprise.

`next.config.ts` : l'inclusion de fichiers (polices et images) pour les deux routes du canal ; à retirer avec elles.

Workflows GitHub :
- `.github/workflows/whatsapp-concurrence.yml` : recette de concurrence SQL isolée (base et PostgREST jetables), déclenchée sur modification des fichiers du canal et de `tests/whatsapp-isole/`. Propre au canal.
- `.github/workflows/ci.yml` : deux étapes mentionnent le canal (corpus WhatsApp proposé ; qualification des anomalies WhatsApp). PARTAGÉ : retirer seulement ces deux étapes.
- `.github/workflows/relances-reprise.yml` : mentionne `lib/envoiWhatsApp*` dans ses chemins surveillés ; PARTAGÉ avec les relances.

Tests et outils propres au canal : `tests/whatsapp-isole/`, `tests/signature-isole/raccord-whatsapp*.sql`, `outils/whatsapp/`, `outils/corpus/whatsapp/`, `scripts/whatsapp-simuler.mjs`, `scripts/recette-anomalies-whatsapp.mjs`, les `lib/*WhatsApp*.test.ts` et `lib/whatsapp*.test.ts`.

## 5. Services externes et variables d'environnement (noms seulement)

Services :
- WhatsApp Cloud API de Meta (webhook entrant, téléchargement de médias, envoi, téléversement de PDF). Version de l'API Graph configurable ; une valeur par défaut est codée dans l'assemblage et doit être relue sur la documentation de Meta au raccordement.
- Anthropic (compréhension et revue finale ; deux modèles permis par le transport budgété).
- OpenAI (transcription des notes vocales).
- Supabase (base, stockage de PDF).
- Vercel (hébergement, crons, `after` pour le traitement après l'accusé).
- Optionnel : pg_cron et pg_net sur Supabase pour une reprise chaque minute.

Variables propres au canal : `WHATSAPP_CANAL_ACTIF`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_RATTACHEMENTS`, `WHATSAPP_GRAPH_VERSION`, `WHATSAPP_CORRECTION_RATTACHEMENT`, `WHATSAPP_PURGE_SOURCES_AUTORISEE`.

Variables partagées lues par le canal : `CRON_SECRET` (cron de reprise), `RENO_CREATION_SECRET` (signature des liens de reprise et des accords), `RENO_SERVER_SECRET` (lecture de PDF côté serveur, import), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RENO_RECETTE_BESOINS_SEULEMENT` (mode recette).

## 6. Sécurité

- Signature Meta vérifiée AVANT de parser, sur les octets reçus. Secret absent : refus 401. Signature invalide : refus 401. Corps trop long : 413.
- Vérification d'abonnement (GET) : défi renvoyé seulement si le jeton fourni est le bon ; sinon 403. Elle n'ouvre pas le canal.
- Numéro de destination attendu : un message adressé à un autre numéro est ignoré.
- Rattachement vérifié à chaque message ; un numéro inconnu ou ambigu = silence, aucune écriture.
- Deux interrupteurs nécessaires ; fermé par défaut ; toute erreur de lecture = fermé.
- Quota, budget et bail : fermés en cas de configuration absente ou de panne, avant tout appel payant.
- Déduplication en base : un message relivré ne crée pas un second devis ni un second envoi.
- Tout est en recette : un brouillon du fil ne sort pas de « Brouillon », l'envoi à un client et les relances sont refusés.
- Aucun prix ni libellé ne vient de l'IA : elle extrait des besoins, la bibliothèque de l'artisan chiffre. Aucun taux de TVA choisi par l'agent.
- Lien de reprise : signé, quinze minutes, navigation seulement, session obligatoire, sans cache, sans référent.
- Entrées bornées : audio 16 Mo, document 23 Mo, PDF seulement, liste fermée de modèles et de cibles d'appel.
- Jamais stocké : contenu de message au-delà du traitement, numéro de téléphone dans `canal_messages`, secrets, texte ou audio dans les journaux.

## 7. Modules PARTAGÉS : à ne pas supprimer aveuglément

Ils mentionnent ou importent le canal mais servent aussi la création classique, l'envoi, le PDF, Devis express, les relances, la dictée au micro. Les retirer casse le produit. Pour chacun : retirer seulement les références au canal.

- Envoi et pièces : `lib/serviceEnvoiDevis.ts`, `lib/piecesMail.ts`, `app/devis/[id]/envoi/actions.ts`, `app/devis/[id]/envoi/ui.tsx`, `app/devis/[id]/envoi/page.tsx`, `lib/accordWhatsApp.ts`, `lib/accordWhatsAppChamps.ts`, `lib/rattachementWhatsApp.ts`, `lib/operationsWhatsApp.ts` (ces quatre derniers sont importés par l'envoi), `lib/expediteurDelegue.ts`, `lib/identiteMail.ts`.
- Préparation et PDF : `lib/preparationDevis.ts`, `lib/pdf[nom propre].ts`, `lib/marge[nom propre].ts`, `lib/regles[nom propre].ts` (et ses variantes), `lib/presentationAgent[nom propre].ts`, `lib/versionDocuments.ts`, `lib/originalDevis.ts`, `lib/originalImportEligible.ts`, `app/devis/[id]/modifier/actions.ts`, `app/devis/[id]/page.tsx`, `app/devis/nouveau/actions.ts`.
- Création et chiffrage : `lib/creationReno.ts`, `lib/creationRenoServeur.ts`, `lib/propositionBanque.ts`, `lib/fichesInstallation.ts`, `lib/estimationAgent.ts`, `lib/revueBrouillon.ts`, `lib/limiteIA.ts`, `lib/battement.ts`, `lib/config.ts`.
- Dictée au micro : `lib/transcriptionNote.ts`, `app/api/dictee/transcrire/route.ts`, `lib/limitesDictee.ts`.
- Relances et interrupteurs : `lib/relances.ts` (utilise le bail de conversation de `lib/verrouConversation.ts`), `lib/interrupteurRelances.ts`, `.github/workflows/relances-reprise.yml`.
- Garde d'accès : `lib/garde.ts` (liste des routes publiques) et le middleware.
- Écrans : `app/creer/page.tsx`, `components/CreerChoix.tsx`, `app/_suivi/Cockpit.tsx`, `components/ARegler.tsx`, `app/aide/page.tsx`, `app/accueil-actions.ts`, `lib/gesteDossier.ts`, `components/RegistreAnomalies.tsx`, `app/_accueil/` et `components/AccueilQuatreBlocs.tsx` (à relire pour les mentions).
- Données : `supabase/migrations/20261006_rd_clients_rattache_artisan.sql`, tables `devis`, `clients`, `artisans`, `profiles`, `sentinelle_etat`, `feedbacks`.
- Configuration : `vercel.json` (autres crons), `.github/workflows/ci.yml` (autres étapes), `next.config.ts` (autres inclusions).
- Compléments à examiner avant retrait (mentionnent le canal, usage non tranché dans cette lecture) : `scripts/preparer-comparaison-[nom propre].ts`, `outils/CONTROLE-CHIFFRAGE-[nom propre].md`, `tests/creer-reprendre.mjs`, `tests/ecrans-vitrine.mts`, `tests/fixtures/cockpit.tsx`, `tests/fixtures/tableau-clients.tsx`, `scripts/fixtures/devis-assiste.tsx`, `scripts/recette-v2-connectee.mjs`, `tests/sabotage/envoi-client.json`, `lib/serviceAnomalies.ts`.

## 8. Pour réimplanter

### 8.1 Archive
Le dépôt RénoDevis (`PaulGERARD161098/RenoDevis`) à l'état du commit `fd168af` (SHA complet : `fd168afde2a31ee5c68cf3af7be4181a6ca73975`, vérifié ancêtre de `main` le 11/11/2026). Ce commit est la tête de `main` au jour du retrait ; il doit rester atteignable (il l'est tant que `main` n'est pas réécrit ; une étiquette de conservation reste recommandée, posée par Paul).

### 8.2 Lister les fichiers du canal depuis l'archive
Depuis une copie du dépôt RénoDevis :

```
git ls-tree -r --name-only fd168af | grep -iE 'whatsapp|canal_messages|leconsCommunes|recuEnvoiFil|importDepuisFil|rechercheCompteAgent|rechercheProNomme|dureeOpus|consignesCanal|api/reno/(reprise|lecons)'
git grep -il whatsapp fd168af -- lib app components supabase scripts outils tests .github vercel.json next.config.ts
```

La première commande donne les fichiers propres au canal (environ 150, hors images de recette). La seconde donne aussi les fichiers PARTAGÉS (section 7), à fusionner à la main, pas à écraser.

### 8.3 Restaurer
Fichiers propres au canal, un par un ou par lot :

```
git restore --source=fd168af --worktree --staged -- <chemin> [<chemin> ...]
```

Pour un lot, passer la liste filtrée de la première commande (hors fichiers de la section 7) à `git restore --source=fd168af`. Pour les fichiers partagés : comparer avec `git diff fd168af -- <chemin>` et réappliquer seulement les lignes du canal.

Une fois restauré : rétablir la ligne de cron de reprise dans `vercel.json`, les inclusions de `next.config.ts`, la route publique dans `lib/garde.ts`, les deux étapes de `ci.yml` et le workflow de concurrence. Puis lancer le typage, les tests et le build du dépôt avant toute mise en ligne.

### 8.4 Ordre de remise en service
1. Code : restaurer, typer, tester, construire. Aucun effet métier à ce stade.
2. Base : appliquer les deux migrations de `canal_messages`, puis les SQL préparés de `docs/whatsapp/` (cas d'état, opérations, actions de relance) après relecture, puis rejouer les contrôles SQL. Relire d'abord l'état réel de la base : ces objets peuvent avoir été retirés ou rester.
3. Configuration en base : poser le quota, le budget (avec date de validité) et l'admission des leçons dans `sentinelle_etat`, avec des plafonds explicites. Ne pas poser l'interrupteur du canal à ce stade.
4. Variables : poser les variables de la section 5 dans l'hébergeur ; garder l'armement du canal fermé.
5. Meta : créer ou rouvrir l'application, le numéro dédié, le jeton, puis déclarer l'URL du webhook et le jeton de vérification ; s'abonner au champ des messages. Relire la version de l'API Graph sur la documentation actuelle.
6. Rattachement : poser la déclaration numéro / artisan / profil, vérifier sur un testeur connu.
7. Recette fermée : envoyer un vocal, un texte et un PDF de test ; contrôler le brouillon en recette, les réponses, la reprise (couper volontairement un traitement) et la purge.
8. Interrupteurs : armer la variable d'environnement, puis ouvrir la clé `canal:whatsapp` en base. L'arrêt d'urgence est la clé en base à faux.
9. Optionnel : reprise chaque minute (pg_cron).

### 8.5 Gates
Chacun de ces gestes est un effet métier réel et exige un mandat précis de Paul, donné pour ce geste :
- toute écriture en base réelle (migration, SQL préparé, ligne de configuration) ;
- toute variable de production posée ou modifiée ;
- tout branchement chez Meta (application, numéro, webhook, abonnement) ;
- l'ouverture des interrupteurs, l'envoi sans clic, la levée de la recette ;
- toute nouvelle dépense (appels payants, numéro WhatsApp).
Une préparation de code sur branche, sans effet réel, reste libre.

## 9. Ce qui n'a pas donné satisfaction

Retiré le 11/11/2026 sur décision de Paul : le canal n'a pas donné satisfaction ; le devis se fait désormais à l'écrit (Devis express).

## 10. Limites de ce plan

- Lu dans le code du commit `fd168af` ; aucun appel en base, chez Meta ni chez l'hébergeur n'a été fait.
- L'état réel en base des migrations et des SQL préparés (section 3) n'est pas vérifié ici.
- Les rôles de quelques modules secondaires sont déduits de leur en-tête et de leurs importeurs, sans lecture intégrale.
