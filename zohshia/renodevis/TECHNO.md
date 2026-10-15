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
| **Devis** | Création à la main, **à la voix** (dictée en temps réel, ou note vocale transcrite), ou **depuis un devis proche** déjà réalisé (bibliothèque de devis passés, rapprochement par type de chantier). Ce qui se recopie d'un devis proche : structure, équipements, libellés ; ce qui se **recalcule toujours** : le taux de TVA. En création assistée, la techno propose la configuration, les références produit et les quantités ; le pro confirme ou corrige chaque proposition, contrôlée côté serveur. Un **aperçu PDF** s'affiche pendant la création, rendu par le même générateur que les vrais devis, sans rien écrire. |
| **Devis entre professionnels** | Quand le client est une entreprise identifiée par son SIREN, le devis emprunte un **gabarit dédié** : numéro `D-AAAA-MM-NNN` (pour les devis futurs seulement, les références déjà émises ne se renomment jamais), tableau des lignes, détail de la TVA par taux, coordonnées bancaires saisies et contrôlées à chaque devis, mentions obligatoires entre professionnels tirées d'**une seule table sourcée et datée**, forme juridique et capital de l'émetteur. Le générateur n'est ouvert qu'aux émetteurs listés ; une liste vide le ferme pour tous. |
| **Contrôles avant devis** | Coordonnées, mentions légales de l'émetteur, garanties, moyens de paiement, TVA : vérifiés **avant** validation. Toute modification qui invalide une confirmation la fait retomber. |
| **Audit énergétique** | Simulation pompe à chaleur et aides, **calculée ailleurs**, appelée par HTTP serveur à serveur. Le moteur ne se recopie jamais dans cette techno ; hors réseau, on garde la dernière réponse datée. |
| **Envoi** | Le devis part **au nom du pro** : soit avec son nom sur le domaine de la plateforme (réponse directe au pro), soit depuis **son propre domaine**, une fois son DNS vérifié. Le mail ne part que sur **la version affichée** : si le devis a changé depuis l'aperçu, l'envoi est refusé et l'écran demande de relire. Un envoi en cours ne se rejoue pas (opération réservée, puis acceptée). |
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

### Contrat de chiffrage versionné — apprentissage du matin

Exigences à conserver lors de la neutralisation et à éprouver dans chaque instance :

- Rattacher la règle au professionnel, à sa source, à sa date d’effet et à sa version.
  Une correction de formule invalide les propositions de cette ancienne version,
  sans recalculer les documents envoyés ou acceptés.
- Distinguer **achat fournisseur vérifié**, **vente historique** et **prix final dicté**.
  Seul l’achat confirmé reçoit le coefficient de calcul. Une observation de vente
  ou une correspondance incertaine ne constitue jamais un achat actuel.
- Séparer prix des produits et structure facturée ; le mode de répartition est un
  paramètre du professionnel. Une structure facturée n’est pas un coût réel mesuré.
- Un lot accepté repris sur mandat conserve son périmètre, ses libellés, ses
  quantités et ses prix. Tracer sa source et vérifier le mandat côté serveur ; un
  drapeau fourni par le navigateur ne doit pas créer une exemption de contrôle.
- Conserver les forfaits explicitement finaux, contrôler unités et durée, comparer
  cible agrégée et somme des lignes arrondies. L’écart d’arrondi reste visible.
- Une acceptation hors plateforme se distingue d’une signature électronique et
  d’un encaissement. Tracer qui la déclare et sur quelle version ; arrêter les
  relances, sans fabriquer de preuve de signature ni de paiement.
- Conserver les anciennes alternatives comme historique identifiable, sans les
  compter comme nouvelles ventes. Un import répété ne crée pas une nouvelle vente.

Ce contrat décrit les exigences issues de la reprise ; il ne prouve ni une
nouvelle extraction ni l’activation de ces comportements. La formule et les valeurs
propres à l’instance restent hors du code neutre. La collecte et le rejeu suivent
le protocole existant ; aucun résultat de recette nouveau n’est déduit de ce texte.

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
| `canal_messages` | **En construction** : le dédoublonnage des messages reçus par un canal de messagerie (identifiant du message, pro résolu, type, résultat). Aucun contenu, aucun numéro, aucun nom. Écrite par le serveur seul ; le pro lit ses lignes. Le canal lui-même n'est pas encore branché |

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
| `/api/devis/[id]/fiches` | Les fiches techniques de la bibliothèque du pro, listées et jointes au devis tant qu'il est modifiable ; lecture par lien signé de courte durée |
| `/api/devis/apercu` | L'aperçu PDF d'un devis en création : rien n'est écrit, l'émetteur est résolu côté serveur, jamais pris du navigateur |
| `/api/devis/choisir-reference` | Création assistée : rechercher et confirmer les références produit et la configuration comprises, ajuster les quantités |
| `/api/devis/confirmer-quantite` | Création assistée : confirmer une quantité corrigée, y compris avant le choix du client |
| `/api/devis/depot-document` | Dépôt d'un document à importer, par envoi direct au stockage (URL signée) ; format réel et taille contrôlés, débit borné ; retrait limité aux dépôts du compte |
| `/api/devis/extraire` | Extraction des lignes d'un devis PDF importé |
| `/api/devis/proposer` | Proposition assistée de lignes à partir d'une demande de travaux |
| `/api/dictee/session` | Ouvre une session de dictée en temps réel auprès du service de transcription, par un secret éphémère ; la clé serveur ne quitte jamais le serveur |
| `/api/dictee/transcrire` | Transcrit une note vocale enregistrée ; en cas d'échec, la note reste à l'écran pour réessayer |
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
| OpenAI | La dictée : session en temps réel et transcription des notes vocales | La dictée s'annonce indisponible ; la saisie au clavier reste |
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
| `derive.mjs` | Dit de combien la tête du dépôt de référence a dépassé la série, et combien de ces commits touchent un fichier qu'elle retouche — à l'ouverture de chaque séance d'Ultima (hook) et sur l'écran Finubar (collecte) | Des comptes, jamais des chemins ; « non mesurable » dit avec sa raison ; date du dernier relevé du clone ; ne bloque jamais une séance. Éprouvé sur un faux dépôt et sur le cas réel connu (`7d21217` → `f1f9fb3` : 8 commits, 6 sur la série) |
| `extraire.mjs` | Le code : série de neutralisation appliquée **en 3 voies** (elle encaisse les évolutions du dépôt), migrations neutralisées, base ajoutée, export **sans historique** | Conflit réel = arrêt ; un nom propre = sortie effacée ; `--verifier` : typage, tests, build |

⚠️ **État de la série au 04/10/2026, 19 h (mesuré)** : rafraîchie sur RénoDevis
`f1f9fb3` (tête du jour, PR #274 à #281 comprises). Extraction prouvée sur
`--ref origin/main` : 495 fichiers sans nom propre, typage sans erreur nouvelle,
**979 tests verts** (931 sur `7d21217`), build vert. Les apports amont propres à
l'instance de référence (regroupement des sections du PDF, conditions de paiement
de la facture miroir) sont neutralisés comme le reste : seul le chemin générique
demeure. Un SHA nu est accepté par `--ref` depuis le dry run du 04/10.

⚠️ **État au 10/10/2026 (mesuré) : le plan et la base suivent la tête, la série
non, et c'est délibéré.** Le plan et la base neuve sont remis à jour sur la tête
du jour. Le rejeu applique les 45 migrations, et l'étalon est validé contre la
référence le 10/10. Il reste **4 écarts constatés**, tous sur `artisans`
(colonne, contrainte, index et déclencheur) : ils viennent d'une brique voisine,
que cette techno ne lit pas, et la base neuve ne les porte donc pas. La
validation a aussi trouvé un vrai défaut, corrigé dans la finition. Son `revoke`
effaçait les droits par colonne posés par une migration du 09/10, ce qui
reproduisait dans la base neuve le refus d'enregistrement du profil vu en
production ce jour-là. La série, elle, reste sur `f1f9fb3`. Une extraction à blanc rend **32
conflits réels**, dont **25** dans des fichiers où l'amont a tissé la formule de
l'instance de référence dans le chemin générique. Le prochain chantier de
RénoDevis retire justement cette formule du code pour en faire des **paramètres
du pro**, lus en base (jalon J4). Il traite donc la cause de ces conflits. La
série se rafraîchit **une fois, juste après J4**, sur un code déjà démêlé :
rafraîchie avant, elle l'aurait été deux fois sur les mêmes fichiers (arbitrage
de Paul, 10/10). D'ici là, `extraire.mjs` refuse, et c'est le signal attendu :
**aucun pro ne s'intègre en voie B avant J4**. La voie A, qui ne demande pas
d'extraction, reste ouverte.

⛔ **ZOH SHIA SE TIENT À JOUR DE LA TÊTE** *(Paul, 04/10 : « ZOH doit rester à
jour de toute façon : Ultima en porte le code et travaille toujours avec les
autres dépôts »)*. Quand RénoDevis avance sur des fichiers que la série
retouche, l'extraction refuse : c'est le signal. La série se rafraîchit alors
(fusion de la tête dans le clone neutre, apports neutralisés, `serie.mjs`,
`extraire.mjs --verifier`) — jamais en corrigeant l'arbre extrait. Le retard
ne se cherche pas : `derive.mjs` le dit à l'ouverture de chaque séance d'Ultima
et sur l'écran Finubar. Il INDIQUE quand rafraîchir ; seule l'extraction prouve.

⛔ **Ce qui reste hors de ZOH SHIA, délibérément** : la recette et la série de
neutralisation **nomment** ce qu'elles retirent ; elles vivent donc dans
`outils/zohshia/renodevis/`, hors du dossier, comme la liste des noms propres.

