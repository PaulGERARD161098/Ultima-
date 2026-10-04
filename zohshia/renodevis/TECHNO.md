# ZOH SHIA · RénoDevis — la techno, à l'état pur

> **Premier élément de ZOH SHIA, le dragon de la technologie.** Paul, 04/10/2026 :
> *« dans ZOH SHIA on garde uniquement la technologie en pur — pas de données
> techniques, pas de nom d'artisan : la technologie elle-même, avec tout ce
> qu'elle fait, ce qu'elle comporte »*.
>
> Ce document est le **plan** de la techno : ce qu'elle fait, maillon par maillon,
> les mécanismes qui la tiennent, les données qu'elle manipule et ce qu'elle exige
> de l'extérieur. Il ne porte **aucune valeur** (prix, taux, coefficient, durée
> propre à un pro), **aucun nom** d'artisan, de client, de fournisseur ou de marque,
> **aucun secret**. Les noms techniques (tables, routes, variables) sont gardés :
> ils décrivent la machine, pas ses données.
>
> ⛔ **Les listes sont mesurées, pas écrites de mémoire** : `inventaire.json`, par
> `collecter.mjs`, sur le dépôt de référence. Un nom technique qui portait un nom
> propre y est remplacé par `[nom propre]`. `tests/unit-zohshia.mjs` rougit si ce
> plan oublie une pièce mesurée, ou si un nom propre y entre.

## 1. Ce que fait la techno, en une phrase

Un pro du bâtiment passe d'une **visite de chantier** à un **devis signé et payé**,
puis à la **facture**, sans ressaisie : la techno relève, chiffre, contrôle, envoie,
suit, relance, fait signer, encaisse et facture — et c'est le pro qui valide, pas
qui saisit.

## 2. Le parcours, maillon par maillon

Un dossier est **un devis**, qui naît brouillon et avance d'état en état.

| Maillon | Ce que fait la techno |
|---|---|
| **Relevé** | Visite sur place, sur téléphone, **hors réseau** : le métré, les équipements, les conditions de TVA réduite. L'appareil est seul propriétaire du relevé jusqu'à sa **remontée explicite** — jamais de synchronisation dans les deux sens. |
| **Chiffrage** | Les lignes se construisent depuis la **bibliothèque de prix du pro** (produits, achats datés, prestations) et le **catalogue fournisseur**. Le prix de vente se calcule par les **règles du pro** (§3). Le prix d'achat ne quitte jamais le serveur. |
| **Devis** | Création à la main, **à la voix**, ou **depuis un devis proche** déjà réalisé (bibliothèque de devis passés, rapprochement par type de chantier). Ce qui se recopie d'un devis proche : structure, équipements, libellés ; ce qui se **recalcule toujours** : le taux de TVA. |
| **Contrôles avant devis** | Coordonnées, mentions légales de l'émetteur, garanties, moyens de paiement, TVA : vérifiés **avant** validation. Toute modification qui invalide une confirmation la fait retomber. |
| **Audit énergétique** | Simulation pompe à chaleur et aides, **calculée ailleurs**, appelée par HTTP serveur à serveur. Le moteur ne se recopie jamais dans cette techno ; hors réseau, on garde la dernière réponse datée. |
| **Envoi** | Le devis part **au nom du pro** : soit avec son nom sur le domaine de la plateforme (réponse directe au pro), soit depuis **son propre domaine**, une fois son DNS vérifié. |
| **Suivi** | Le client ouvre son devis par un **lien à jeton révocable**. Chaque ouverture est tracée ; les devis « chauds » (consultés souvent, ou par paliers) alertent le pro ; un devis jamais ouvert au bout d'un délai signale un mail sans doute perdu. |
| **Signature** | Par le jeton, **côté serveur** : le jeton est résolu en devis sur le serveur, jamais exposé comme une capacité permanente. |
| **Paiement** | Acompte ou totalité, au choix du client, carte ou virement. **Aucune détention de fonds** : la plateforme encaisse pour le compte du pro et prélève sa commission au passage ; la confirmation (y compris le virement, asynchrone) vient du prestataire de paiement, jamais d'un formulaire. |
| **Relance** | Tant que le devis n'est pas signé, un **moteur** prépare les relances selon le comportement du client et le temps écoulé. Par défaut, il **propose** et le pro tranche ; un seul brouillon en attente par devis. Une **prévenance** passe quelques heures avant le moteur. |
| **Synchronisation mail** | Les devis envoyés **hors plateforme** (par la messagerie du pro) sont retrouvés dans la boîte mail et entrent dans le suivi. |
| **Facture** | Une facture client **miroir** du devis se prépare dès sa création et devient définitive après signature, sur action du pro. Les **factures fournisseurs** se rattachent à chaque devis émis (pièce déposée, montant d'achat). |
| **Assistant** | Un assistant conversationnel répond au pro sur ses dossiers, et recueille ses retours. |

## 3. Les mécanismes qui tiennent la techno

### Les règles de prix — l'ossature commune, les détails au pro

Ce qu'il faut savoir d'**un pro** pour calculer la marge d'un chantier — chaque
pro y met **ses** valeurs, la techno n'en impose aucune. Mesuré dans le schéma
qui les valide (`banques_reno.regles`, 04/10/2026) :

| Champ | Rôle | Bornes |
|---|---|---|
| `coefficient_produits` | Prix de vente = achat × coefficient, arrondi **au centime supérieur** | 1 à 5 |
| `demi_journee_ht` | Prix HT d'une demi-journée de main-d'œuvre | > 0 |
| `validite_prix_jours` | Âge maximal d'un prix d'achat retenu | 1 à 366 jours |
| `validite_catalogue_jours` | Fraîcheur maximale d'un catalogue | 1 à 366 jours |

À côté, la **bibliothèque de prix** du pro (`banques_reno.banque`) : ses produits
et leurs prix d'achat sourcés, ses catalogues, ses fiches techniques, ses prix
fixes (kits, forfaits), ses prestations et leurs prix de vente historiques. Elle
n'accepte aucune donnée personnelle (refus à l'import).

⛔ Le dépôt de référence porte en plus une **formule propre à un pro** (son
modèle de prix, sa présentation, ses contrôles). Ce n'est pas la techno : la
**série de neutralisation** (§8) la retire, et le code extrait n'en contient rien.

### La TVA — la règle légale, datée, jamais recopiée

- Une **table datée et sourcée** des règles, et une fonction pure qui rend le taux
  applicable pour un type de chantier, **à la date du devis** (obligatoire, sans
  valeur par défaut : un devis rouvert plus tard ne change pas de taux).
- **Repli vers le taux plein** : une condition inconnue ne donne jamais le taux
  réduit. Une condition « inconnue » se distingue d'une condition « non » : seule
  la première se répare.
- La table se modifie **dans le code relu**, jamais depuis un écran ; sa péremption
  se **signale**, elle ne casse rien.

### La vente, le vendeur, la commission

- **Vendeur de référence** décidé par client (la plateforme ou le pro), avec un
  repli vers le pro — un repli se choisit sur ce qu'il coûte quand il se trompe.
- **Commission** en pourcentage **du HT** du devis entier, par pro, prélevée sur
  le paiement.

### La donnée

- **Achat côté serveur, vente embarquée** : le prix d'achat n'existe pas dans le
  navigateur ; le pro lit une **vue de vente** qui ne le porte pas.
- **Le manuel gagne, l'auto propose** : une correction humaine est marquée et
  aucune synchronisation ne l'écrase.
- **La base prouve** : chaque lot laisse une **empreinte** vérifiable par requête ;
  chaque tâche planifiée pose un **battement**, et un second signal dit si elle
  tourne **à vide**.

## 4. Les données

**Les tables** que le code lit (mesurées) et leur rôle :

| Table | Rôle |
|---|---|
| `artisans` | La fiche du pro : identité commerciale et légale, commission, compte de paiement, expéditeur |
| `profiles` | Les comptes (admin, pro) |
| `clients` | Les clients finaux, rattachés à leur pro, avec leur vendeur de référence |
| `devis` | Le dossier, ses lignes, ses états |
| `devis_events` | Le journal du dossier (envoi, ouverture, relance, paiement…) |
| `relance_queue` | Les échéances du moteur de relance |
| `relance_brouillons` | Les relances proposées, une seule en attente par dossier |
| `relance_gabarits` | Les textes de relance, modifiables par l'administration |
| `relance_liens` | Les jetons de lien client, révocables |
| `relance_etat_par_client` | L'état de relance agrégé par client |
| `messages_envoyes` | La trace de chaque mail parti, constatée par le serveur |
| `paiements` | Les paiements, constatés par le prestataire, jamais déclarés |
| `banques_reno` | La bibliothèque de prix d'un pro et ses règles |
| `catalogue_[nom propre]` · `catalogue_vente` | Le catalogue fournisseur (achat réservé à l'administration) et sa vue de vente |
| `corpus_devis` | La bibliothèque de devis passés, sans donnée personnelle |
| `realisations` | Les réalisations du pro, montrées au client |
| `feedbacks` | Les retours des utilisateurs |
| `sentinelle_etat` | Les battements des tâches planifiées |

**Les tables que le dépôt de référence ne sait pas créer** — nées dans une base
partagée, ailleurs : `catalogue_[nom propre]` (le catalogue fournisseur, nommé
`catalogue_fournisseur` dans la techno) · `clients` · `devis` · `devis_events` ·
`feedbacks` · `profiles` · `relance_queue` · `sentinelle_etat` · `stock` (que la
signature décrémente).

✅ **Depuis le 04/10/2026, une base neuve se reconstruit quand même** : ZOH SHIA
porte leur **socle** (leur état avant la première migration de la techno), et la
**finition** que la référence porte après (droits par colonne, gardes de
sécurité). `base/rejouer.mjs` reconstruit le tout sur un Postgres jetable et le
compare à un **étalon validé par la base de référence elle-même**, en lecture
seule — §8.

## 5. Les routes serveur (mesurées)

| Route | Rôle |
|---|---|
| `/api/bibliotheque/catalogues` | Dépôt d'un catalogue fournisseur : envoi direct au stockage par URL signée, puis relecture et empreinte côté serveur |
| `/api/bibliotheque/documents` | Dépôt d'un document de la bibliothèque, après autorisation sur le pro |
| `/api/bibliotheque/matrices/neutre-court` | La matrice de devis neutre, en PDF |
| `/api/bibliotheque/matrices/[nom propre]` | La matrice de devis propre à un pro, en PDF spécimen |
| `/api/bibliotheque/reno` | Lecture et écriture de la bibliothèque de prix d'un pro |
| `/api/bibliotheque/reno/fiche` | Fiche technique d'un produit, par lien signé de courte durée |
| `/api/corpus/[id]/pdf` | Le PDF d'un devis de la bibliothèque, sous contrôle d'accès |
| `/api/devis/[id]/documents` | Les documents d'un devis (dont le PDF d'origine d'un devis importé) |
| `/api/devis/[id]/facture-fournisseur` | La pièce d'achat d'un devis, par lien privé |
| `/api/devis/extraire` | Extraction des lignes d'un devis PDF importé |
| `/api/devis/proposer` | Proposition assistée de lignes à partir d'une demande de travaux |
| `/api/reno` | L'assistant conversationnel |
| `/api/reno/retour` | Les retours des utilisateurs |
| `/api/stripe/webhook` | L'état des paiements et des comptes de paiement, dit par le prestataire |
| `/api/sms/stop` | Le désabonnement SMS, rendu effectif côté produit |
| `/api/cron/prevenance` · `/api/cron/relances` · `/api/cron/stripe-embarquement` · `/api/cron/sync-email` | Les tâches planifiées (`AJOUTER-UN-ARTISAN.md` §4) |

## 6. Ce que la techno exige de l'extérieur

| Service | Pour quoi | Sans lui |
|---|---|---|
| Supabase | Base, comptes, fichiers | Rien ne tourne |
| Vercel | Hébergement et tâches planifiées | Rien ne tourne |
| Stripe Connect | Paiement en ligne, un compte connecté par pro | Pas de paiement ; le reste fonctionne |
| Resend | Envoi des mails | Aucun mail ne part |
| Gmail | Synchronisation des devis envoyés hors plateforme | Synchronisation arrêtée, rien ne casse |
| Twilio | SMS de relance | Canal muet, dégradation propre |
| Anthropic | L'assistant | Il répond « non configuré » |
| Moteur d'audit énergétique | Simulation pompe à chaleur et aides | L'écran d'audit s'annonce indisponible |
| Service d'extraction PDF | Lecture des devis importés | Extraction indisponible |

Chaque service absent **dégrade proprement** : la fonction s'annonce indisponible,
le reste du produit ne bouge pas.

## 7. Sécurité et cloisonnement

- **Chaque pro ne voit que ses dossiers**, par la RLS de la base ; l'administration
  voit tout. Un pro ne supprime rien et ne change pas le vendeur d'un client.
- **Les fonctions de la base** ne sont ouvertes qu'à qui en a besoin : les
  fonctions de déclencheur ne sont pas des RPC ; la voie publique passe par jeton.
- **Les secrets ne vont jamais au navigateur** (jamais de préfixe public sur une
  clé serveur) ; aucune donnée personnelle dans les journaux.
- **Aucune policy d'écriture** sur ce qui doit être constaté (paiements, messages
  partis) : le silence des policies est la règle.
- **Les données d'un pro ne servent qu'à lui** : sa bibliothèque, ses devis passés,
  ses prix ne sont jamais proposés à un autre.

## 8. Le code et la base neutres — ce que ZOH SHIA fabrique

| Pièce | Ce qu'elle fait | Ce qui la garde |
|---|---|---|
| `neutraliser.mjs` | Le moteur : applique la recette privée (renommages, remplacements épinglés par empreinte, retouches exactes) ; retire les lignes de commentaire porteuses d'un nom propre | Refus si une retouche a périmé, si un original a changé, si un nom propre survit hors commentaire |
| `scanner.mjs` | Lit un arbre entier, chemins et contenus | Refus sur un arbre vide ; même détecteur que le test d'Ultima |
| `base/` + `base/rejouer.mjs` | La base neuve : plateforme simulée (local seulement), socle, migrations neutralisées dans l'ordre relevé, finition | Socle qui ne masque aucune migration ; chaque objet cité existe ; empreinte = étalon validé par la référence. Éprouvé en cassant : 6 sabotages sur 6 au rouge |
| `extraire.mjs` | Le code : série de neutralisation appliquée **en 3 voies** (elle encaisse les évolutions du dépôt), migrations neutralisées, base ajoutée, export **sans historique** | Conflit réel = arrêt ; un nom propre = sortie effacée ; `--verifier` : typage, tests, build |

⚠️ **État de la série au 04/10/2026, 19 h (mesuré)** : rafraîchie sur RénoDevis
`f1f9fb3` (tête du jour, PR #274 à #281 comprises). Extraction prouvée sur
`--ref origin/main` : 495 fichiers sans nom propre, typage sans erreur nouvelle,
**979 tests verts** (931 sur `7d21217`), build vert. Les apports amont propres à
l'instance de référence (regroupement des sections du PDF, conditions de paiement
de la facture miroir) sont neutralisés comme le reste : seul le chemin générique
demeure. Un SHA nu est accepté par `--ref` depuis le dry run du 04/10.

⛔ **ZOH SHIA SE TIENT À JOUR DE LA TÊTE** *(Paul, 04/10 : « ZOH doit rester à
jour de toute façon : Ultima en porte le code et travaille toujours avec les
autres dépôts »)*. Quand RénoDevis avance sur des fichiers que la série
retouche, l'extraction refuse : c'est le signal. La série se rafraîchit alors
(fusion de la tête dans le clone neutre, apports neutralisés, `serie.mjs`,
`extraire.mjs --verifier`) — jamais en corrigeant l'arbre extrait.

⛔ **Ce qui reste hors de ZOH SHIA, délibérément** : la recette et la série de
neutralisation **nomment** ce qu'elles retirent ; elles vivent donc dans
`outils/zohshia/renodevis/`, hors du dossier, comme la liste des noms propres.
