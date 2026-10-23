# CADRAGE — RIVEN se remplit : créer une personne depuis la fiche, enchaîner les saisies

> Format 6 points exigé par la **directive EL** (le COMMENT avant le travail).
> Boucle ouverte le **2026-08-12**, à la reprise demandée par Paul :
> *« on reprend, terminons la boucle de la veille sur Riven »*.

---

## 0. Ce que la vérification a changé au cadrage

Le tableau de bord annonçait comme prochaine boucle : *« les trois boutons du
panneau de fiche (Rattacher une personne, Créer une relation, Modifier la
fiche), qui ne font encore rien »*. **C'est faux, et je l'ai vérifié avant de
m'en servir** : les trois boutons **existent et fonctionnent** dans
`js/app.js` — `ouvrirFormRattachement` (l. 3688), `ouvrirFormRelation`
(l. 3746), `ouvrirFormNoeud` (l. 3529). Ce qui ne faisait rien, c'étaient les
boutons de la **maquette** `design/preview-riven-3d.js` (l. 903-938), qui se
contentaient d'un `signaler(...)`. Le cadrage a confondu la maquette et le
produit.

*Sans ce contrôle, cette boucle aurait ré-implanté trois gestes déjà livrés.*

Deux mesures faites en production le 2026-08-12 fixent le vrai problème :

| Mesure | Valeur | Ce qu'elle implique |
|---|---|---|
| `network_nodes` | **5 fiches** | Le ciel affiche cinq étoiles. |
| `network_edges` | **1 relation** | Un seul trait. |
| `personnes` | **0** | **Aucune personne n'existe.** |
| `personne_noeuds` | **0** | Aucune orbite au ciel. |

Et c'est là qu'est le **cul-de-sac** : avec zéro personne en base,
`ouvrirFormRattachement` **refuse d'ouvrir le formulaire** et jette une erreur
(`js/app.js:3711-3714`, *« Aucune personne disponible : créez-en une depuis le
registre. »*). Le geste central de la boucle du 10/08 — la personne séparée du
nœud — est donc **inatteignable depuis une fiche** tant que le registre est
vide. La fonctionnalité est livrée, testée, et **inaccessible dans l'état réel
de la base de Paul**.

---

## 1. ① Le but — ce qui sera vrai à la fin

**RIVEN se remplit sans jamais quitter la fiche ni rouvrir un formulaire.**

1. Depuis n'importe quelle fiche, **même avec zéro personne en base**, le bouton
   « Rattacher une personne » **ouvre un formulaire** ; on y choisit une
   personne existante **ou on la crée sur place** (nom, fonction, téléphone) —
   un seul envoi crée la personne **et** son rattachement, avec son rôle.
2. La création d'une **fiche** et celle d'une **personne** peuvent
   **s'enchaîner** : « Enregistrer et suivant » sauve, garde le formulaire
   ouvert, remet le curseur sur le nom, et **conserve le contexte de la série**.
3. Le compte de ce qui a été créé à la suite est **annoncé** (`role="status"`),
   pas deviné.

---

## 2. ② Les étapes

1. `riven.html` — le formulaire de rattachement gagne un pli « nouvelle
   personne » (3 champs), replié ; les formulaires nœud et personne gagnent un
   second bouton d'envoi et une ligne de compteur.
2. `js/app.js` — `ouvrirFormRattachement` n'échoue plus sur registre vide ;
   `soumettreFormRattachement` branche le cas « créer puis rattacher » ;
   `soumettreFormNoeud` et `soumettreFormPersonne` distinguent l'envoi simple
   de l'envoi enchaîné (`evenement.submitter`).
3. `css/` — l'habillage du pli et du compteur, dans le registre existant.
4. `tests/smoke-serie.mjs` — harnais neuf, qui exerce les **vrais gestes**.
5. Patrimoine **COMPLET** (`bash tests/lancer.sh`), pas seulement les harnais
   touchés — leçon du 2026-07-22.

---

## 3. ③ Les moyens — ce qui est touché

| Fichier | Nature de la retouche |
|---|---|
| `riven.html` | 3 champs + 2 boutons + 2 lignes de compteur |
| `js/app.js` | 4 fonctions modifiées, 0 fonction supprimée |
| `css/riven.css` (ou l'équivalent en place) | 2 règles |
| `tests/smoke-serie.mjs` | **neuf** |
| `tests/lancer.sh` | 1 ligne (enregistrement du harnais) |

**Intouchés, et c'est un critère, pas un espoir** : `js/ciel.js`, `js/arbre.js`,
`js/carte.js`, `api/**`, `supabase/migrations/**`. Cette boucle **n'ajoute
aucun champ en base** : elle n'utilise que `personnes` et `personne_noeuds`,
livrées par la migration 0024 et **déjà appliquées**.

---

## 4. ④ Les critères de réussite — vérifiables, pas « ça a l'air bien »

- **C1 — le cul-de-sac est fermé.** Registre vidé de **toutes** ses personnes,
  puis « Rattacher une personne » sur une fiche : le formulaire **s'ouvre**
  (assertion par l'**absence** du toast d'erreur), et un seul envoi produit
  **1 personne** au registre **et** **1 rattachement** portant son rôle.
- **C2 — l'enchaînement enchaîne vraiment.** Deux fiches créées à la suite sans
  jamais retoucher « + Ajouter » : après le premier envoi, `#form-noeud` est
  **toujours visible**, `#noeud-nom` est **vide et focusé**, et `type`,
  `statut`, `secteur_activite`, `ville` ont **gardé leur valeur**.
- **C3 — le compteur dit le vrai.** Après deux enchaînements, la ligne annonce
  « 2 fiches créées à la suite » **et** la liste des contacts en compte
  exactement deux de plus.
- **C4 — l'affichage n'a pas bougé.** `git diff` sur `js/ciel.js`,
  `js/arbre.js`, `js/carte.js` = **zéro ligne**, et `smoke-ciel`, `smoke-arbre`,
  `smoke-secteur` verts **sans retouche**.
- **C5 — le flux court n'est pas allongé.** Le pli « nouvelle personne » est
  **fermé** quand une personne existe : le geste d'hier (choisir + rôle +
  Rattacher) se fait avec **le même nombre de touchers qu'avant**.
- **C6 — accessibilité.** Chaque champ neuf porte son `<label for>`, le
  compteur est un `role="status"`, et le second bouton est atteignable au
  clavier. Cible tactile **mesurée** ≥ 24 px à 390 px de large.
- **C7 — patrimoine COMPLET vert**, assertions neuves comptées.

---

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **L'ingestion d'une source externe** (voie ① du 10/08). **Dépendance
  bloquante non levée : Paul n'a pas dit QUELLE source il apporte.** La
  question lui est posée en fin de boucle ; sans réponse, ① n'existe pas.
- **L'édition d'une relation existante.** Constat neuf et documenté :
  `interet_qualitatif`, `effort_temps` et `effort_energie` existent en base
  depuis la migration `0003`, sont validés par l'API
  (`api/_lib/validate.js:221-241`) et ne sont **atteignables depuis aucune
  interface** — zéro occurrence dans le front, zéro dans les harnais. Le
  `type` d'une relation est en outre **gelé après création** par choix
  délibéré (`validate.js:47`). C'est **une boucle à soi seule**, pas un
  ajout à celle-ci.
- **Créer un nœud depuis le formulaire de relation.** Même motif : autre geste.
- **La CSP dans `tests/lancer.sh`.** La règle née hier (*« un harnais qui ne
  reproduit pas les en-têtes de production ne prouve rien »*) n'a été appliquée
  qu'au harnais des maquettes ; le patrimoine sert toujours sous
  `python3 -m http.server`, sans en-tête. **Vérifié : aucune page produit ne
  porte de script en ligne** (21 pages, 0 `<script>` sans `src`), donc le
  risque est une **régression future**, pas un défaut présent. Consigné au
  registre, pas traité ici : ce n'est pas RIVEN.
- **Les index manquants** sur les deux clés étrangères de `personne_noeuds`
  (INFO des advisors). Tables à **0 ligne** : la migration serait du bruit.
  Consigné, à faire quand le volume existera.

---

## 6. ⑥ Pre-mortem — la boucle a échoué, pourquoi ?

| # | Mode de défaillance | Ce qui le prévient |
|---|---|---|
| **P1** | **« Enregistrer et suivant » masque un échec** : l'envoi rate, le formulaire se vide quand même, Paul croit avoir saisi et n'a rien. | Le vidage et l'incrément du compteur sont **dans le `try`, après l'`await`**. Un échec laisse **les valeurs en place** et affiche le toast d'erreur — la saisie n'est jamais perdue. |
| **P2** | **La création depuis la fiche fabrique des doublons** : Paul recrée « Karim Roux » qui existe déjà. | Le select des personnes existantes reste **premier et sélectionné par défaut** ; « ➕ Créer une nouvelle personne » est visible en tête de liste mais demande un **choix conscient**. Quand le registre est vide, c'est la seule option — donc elle est justement le seul chemin. |
| **P3** | **Le flux court est ruiné** (RADAR n°2, « saisie au pouce ») : trois champs de plus imposés à tous. | Le pli est **caché** tant que « nouvelle personne » n'est pas choisi (C5 le mesure). Le second bouton est **secondaire**, il ne remplace pas « Enregistrer ». |
| **P4** | **Le harnais prouve dans un état qui n'est pas celui de Paul** : la démo livre 3 personnes, donc le cul-de-sac ne s'y produit jamais. | **C1 vide d'abord le registre par les vrais gestes de l'interface**, puis exerce le bouton. La règle du 2026-07-30 s'applique : *une règle se teste par l'ABSENCE* — ici, l'absence du toast d'erreur. |
| **P5** | **La personne est créée, le rattachement échoue** : orpheline silencieuse. | Séquence explicite : créer, puis rattacher. Si le second appel échoue, le toast **le dit** — « Personne créée, mais rattachement impossible : elle est au registre. » Jamais un échec muet, jamais un rollback qui perdrait la saisie. |
| **P6** | **`evenement.submitter` est absent** et tout envoi devient un enchaînement (ou l'inverse). | Lecture défensive : l'enchaînement n'est vrai que si `submitter` **existe et porte l'identifiant attendu**. En cas de doute, comportement d'avant — le formulaire se ferme sur la fiche. |
| **P7** | **Le compteur ment** après un échec ou une annulation. | Le compteur est remis à zéro à **chaque ouverture** du formulaire par « + Ajouter », et n'est incrémenté qu'après une création **confirmée par l'API**. |
| **P8** | **Une session parallèle nous double** (4 avancées de `main` en une session, 2026-07-30). | Rebase et fusion sans délai ; conflit sur `JOURNAL-DECISIONS.md` résolu **par concaténation**. |
| **P9** | **Un renommage ou un déplacement casse un harnais lointain** (leçon du 2026-07-22). | Aucun renommage dans cette boucle, et **patrimoine COMPLET** avant fusion — pas seulement les harnais des fichiers touchés. |

---

## 7. La forme du geste, en une image

```
FICHE « Plomberie Roux & Fils »
   └─ [ Rattacher une personne ]
         │
         ▼
   ┌─────────────────────────────────────────┐
   │ Sur : Plomberie Roux & Fils             │
   │ Personne *  [ Karim Roux            ▾ ] │  ← existantes d'abord
   │             ( ➕ Créer une nouvelle… )   │  ← choix conscient
   │ ┌ replié tant qu'on n'a pas choisi ───┐ │
   │ │ Nom *        [                    ] │ │
   │ │ Fonction     [                    ] │ │
   │ │ Téléphone    [                    ] │ │
   │ └─────────────────────────────────────┘ │
   │ Rôle         [ conducteur de travaux  ] │
   │ [ Rattacher ]  [ Annuler ]              │
   └─────────────────────────────────────────┘
         │  un seul envoi
         ▼
   personne créée  ─────►  rattachement créé (avec rôle)
                            └─► l'orbite paraît au CIEL
```

Registre **vide** : le select ne contient que « ➕ Créer une nouvelle
personne », déjà sélectionné, pli **ouvert**. Le cul-de-sac n'existe plus.

---

## 8. La saisie par la voix de Léo — `proposer_contact` (cadré le 2026-10-23, à valider par Paul)

**L'incident qui l'ouvre.** Le 23/10, Paul dicte : *« ajoute ce gars à RIVEN,
contact obtenu par Hugo, rappel lundi »*. Léo n'a pas de main pour créer une
fiche réseau — l'anneau vert (§12 de `CADRAGE-2026-09-22-leo-pilote-tout.md`)
sait noter au journal d'un contact et programmer une relance, pas faire naître
le contact. La fiche (Soli / Brice Papon) est passée par le **SQL Editor**, preuve
lue dans le résultat ; le rappel par Google Calendar, posé par la séance et non par
Léo. C'est le chemin de 2010 (Directive ZS). Cette extension le ferme.

### ① Le but — ce qui sera vrai à la fin

Depuis RIVEN, Paul dicte *« ajoute Brice Papon, partenaire, 06 72 15 77 51,
brice@soli-energie.com, contact obtenu par Hugo »* → Léo propose la fiche, dans
une reformulation **déterministe** (ce que Paul lit est ce qui sera écrit) ; la
fiche naît par la route existante, **journalisée avant l'acte, défaisable d'un
clic** ; au tour suivant, *« rappelle-le lundi »* vise cette fiche par
`proposer_relance`, sans recharger la page.

*Ligne MS.* Chaque contact dicté est un prochain client ou partenaire saisi
**dans l'instant où il arrive**, là où il arrive (en voiture, après un échange).
Cas réel du jour : Brice Papon, directeur commercial de Soli, apporté par Hugo
(Symphonics). Indicateur, lu à sa source : les lignes de `leo_ecritures` dont
l'outil est `proposer_contact`, et les relances posées sur ces fiches. Première
cible : **le prochain contact reçu entre dans RIVEN par la voix, sans SQL.**

### ② Les étapes

a) **Le catalogue** (`api/_lib/leo.js`) : l'outil, sa main (regex
   « ajoute/crée/enregistre un contact|un artisan|un partenaire|un lead »), sa
   reformulation, et `validerProposition` **miroir de `validateNode`** (bornes
   lues dans `api/_lib/validate.js`, jamais recopiées de mémoire).
b) **Le défaire** (`api/_lib/leo-execution.js`) : `DEFAIRES.proposer_contact`
   → table `network_nodes`, `retouche: true` (la table a `updated_at` : une fiche
   retouchée par Paul ne se défait plus), libellé `nom` ; `DEPENDANCES.network_nodes`
   → **toutes** les clés étrangères qui la visent, telles que le harnais les relit
   dans les migrations (relevé du 23/10 : `network_edges.source_id`,
   `network_edges.target_id`, `journal.node_id`, `intendant_chantiers.node_id`,
   `intendant_besoins.fournisseur_node_id`, `talent_refs_reseau.node_id`,
   `personne_noeuds.node_id` — le harnais est juge, pas cette liste).
c) **Le gabarit front** (`js/leo-accueil.js`) : `POST /api/reseau/nodes`, corps
   exact `{ type, nom, statut: 'prospect', telephone?, email?, ville?, notes }` ;
   `apresEcriture` ajoute `{ id, libelle: nom }` à `candidats.cibles`,
   `apresDefaire` l'en retire — c'est ce qui rend la relance possible au tour
   suivant.
d) **Le prompt** : type manquant → Léo le demande **en un mot** (artisan,
   partenaire ou lead) ; jamais un numéro ni un mail qui ne soit pas dans le
   message de Paul ; nom déjà dans `candidats.cibles` → pas de fiche, Léo propose
   `proposer_journal` sur l'existante.
e) **Les harnais** : verrous **refixés à la main** (douze outils, onze verts,
   quatorze mains — RIVEN en sert cinq —, onze défaires joués) ; exhaustivité de
   `DEPENDANCES.network_nodes` ; chaîne navigateur (proposition → carte au texte
   serveur → rien d'écrit avant le clic → un POST au corps exact, avec le Bearer →
   défaire → la fiche disparaît, la trace est `defaite`).
f) **La preuve réelle**, après fusion sur le go de Paul : un contact dicté par
   lui, visible dans RIVEN, puis une relance posée dessus au tour suivant.

**Aucune migration, aucune route nouvelle** : la table et `POST /api/reseau/nodes`
existent et sont validées côté serveur depuis `0001`.

### ③ Les moyens — ligne ZS

Trois voies pour faire naître un contact, comparées le 23/10 sur ce qui existe :

| Voie | Simplicité | Mise en place | Coût | Verdict |
|---|---|---|---|---|
| Formulaire RIVEN (§1–7 de ce cadrage) | 2 écrans, clavier | déjà là | 0 | reste la voie de la fiche complète |
| SQL Editor (chemin du 23/10) | un bloc à coller, hors séance | 0 | 0 | so 2010 ; injoignable par Léo |
| **La voix à Léo — retenue** | une phrase | ½ journée | 0 ressource ; **une PR de code ≈ 29 min de CI** | tool-use déjà en service, zéro table, zéro route |

Fichiers touchés : `api/_lib/leo.js` · `api/_lib/leo-execution.js` ·
`js/leo-accueil.js` · `tests/unit-leo-anneau.mjs` · `tests/unit-leo-mains.mjs` ·
`tests/unit-leo-defaire.mjs` · un `§` de `tests/smoke-ecrire.mjs`. Sources : le
catalogue, la route et le validateur **lus dans le dépôt le 23/10**.

**Les arguments** (bornes = `validateNode`) : `nom` requis (≤ 200) · `type`
requis, **artisan | partenaire | lead** (`chantier` exclu : un chantier naît par
l'intendant) · `telephone` (≤ 30) · `email` (≤ 200) · `ville` · `apporteur`
(≤ 160, « par Hugo » → `notes` = « Contact obtenu par Hugo. ») · `note` (≤ 2000,
provenance comprise). Le statut est posé par le gabarit : `prospect`.

**L'anneau : vert, sous le double critère** (réversible : une fiche neuve se
supprime sans cascade ; visible : journal + bulle « Fait sans demander »). Même
régime que `proposer_journal` et `proposer_relance`, qui écrivent déjà de la PII
dans le réseau (§12, « la PII entre dans l'anneau vert »). ⚠️ **En pratique la carte
jouera presque toujours** : le vert « sans demander » exige chaque valeur mot pour
mot dans le dernier message de Paul, et un numéro dicté sort rarement tel quel —
alors la fiche s'écrit **sur son clic**, avec le numéro tel qu'il sera stocké.
*Alternative nommée et écartée* : l'orange, qui donnerait au mécanisme « demander
puis agir » son premier outil (FINUBAR : non prouvé) — mais la carte tient déjà ce
rôle ici ; Paul tranche.

### ④ Les critères de réussite — vérifiables

1. `npm test` vert avec les verrous **refixés** (12 / 11 / 14 / 11) — un treizième
   outil entré en silence fait rougir `unit-leo-anneau`.
2. `unit-leo-defaire` prouve que `DEPENDANCES.network_nodes` couvre **chaque** clé
   étrangère des migrations ; sabotage joué : une clé retirée du relevé → rouge.
3. `unit-leo-mains` : « ajoute Brice Papon, partenaire, 06 72 15 77 51 » → une
   proposition `proposer_contact` au corps exact ; « ajoute Brice » (type absent)
   → refus, pas d'invention ; nom déjà en cible → refus `doublon`.
4. Chaîne navigateur : **rien d'écrit avant le clic** (verrou de non-vacuité :
   le POST est compté), corps exact, Bearer présent ; défaire → trace `defaite`,
   fiche absente ; relance au tour suivant sur la fiche née au tour précédent.
5. Preuve réelle en production, lue dans RIVEN et dans `leo_ecritures`.

### ⑤ Ce qu'on ne fait PAS dans cette boucle

- La **personne** et son **rattachement** (trois lignes, §1–7) : v2,
  `proposer_interlocuteur`, quand la fiche société existe.
- La **relation** « apport d'affaires » (arête) : v2, `proposer_relation` ; la
  provenance vit dans `notes`.
- **Google Calendar** : hors Ultima (JL). La relance est le rappel natif, vue au
  cockpit.
- Lire une **capture d'écran** : Léo du site ne reçoit que du texte.
- Modifier ou supprimer une fiche (orange / rouge), NICOL BOLAS, l'import en
  masse (`CADRAGE-RIVEN-IMPORT.md`).

### ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

(a) *Un numéro mal transcrit par la dictée est écrit tel quel* ⇒ la règle mot
pour mot le renvoie à la carte, qui affiche le numéro **tel qu'il sera stocké** ;
(b) *doublon : « ajoute Brice » alors que Brice est déjà là* ⇒ résolution locale
sur `candidats.cibles`, refus `doublon`, Léo propose le journal ; (c) *Léo invente
le type* ⇒ requis côté schéma ET validation, le prompt dit « demande en un mot » ;
(d) *l'anneau vert s'élargit sans verrou* ⇒ les comptes sont nommés à la main dans
trois harnais ; (e) *le défaire efface la relance posée depuis* ⇒ `journal.node_id`
est au relevé → refus « Lié : … », la fiche se retire alors par RIVEN ; (f) *la
relance du tour suivant ne trouve pas la fiche* ⇒ `apresEcriture` l'ajoute aux
cibles, et la chaîne navigateur le prouve ; (g) *une valeur dictée finit en log* ⇒
règle existante (jamais de contenu dicté en log), relue sur la route ; (h) *la PR
coûte 29 min de CI à chaque poussée* ⇒ une seule PR, en fin de séance, tests en
local avant.

### Trois points de vue à arbitrer avant d'exécuter

- **L'adversaire** — *la dictée empoisonnée* : une `note` dictée qui contient une
  consigne, stockée puis relue par Léo. Question : les `notes` des fiches
  remontent-elles au modèle ? (`validerEtatQuadrant` ne reçoit que des libellés
  bornés à 120 — à vérifier sur ce que RIVEN envoie.) Et l'inondation : cent
  fiches en un jour = le plafond de `leo_appels`, pas une garde de plus.
- **Le mainteneur futur** — douzième outil, cinq fichiers par outil. Le catalogue
  mérite-t-il un gabarit « une ligne dans une table » ? Question à poser, pas une
  refonte (ZS n'autorise pas de réécrire ce qui marche).
- **Paul au volant** — un numéro arrive en chiffres séparés, un mail épelé. Un
  seul champ `coordonnees` vaudrait-il mieux que `telephone` + `email` ? Et « pas
  Hugo » : la consigne négative doit rester lisible dans la reformulation.

**Décision attendue de Paul** : go sur ce cadrage (vert ou orange ; `type`
requis), le POV à creuser, et le moment — maintenant (la chaîne RB attend le
battement du 24/10 06:30 UTC, rien n'est à faire avant) ou après A6b.

### L'exécution — 23/10, le soir même

**Décision de Paul (23/10, 18 h 50 UTC) : « go, vert, type requis, construis
maintenant ».** Les trois POV n'ont pas été creusés : le cadrage les laisse
ouverts pour une séance ultérieure (l'adversaire — les `notes` relues par Léo —
reste la question à instruire avant tout élargissement).

Ce qui est posé, sans migration ni route nouvelle :
- `api/_lib/leo.js` — l'outil `proposer_contact` (RIVEN, vert, `type` requis et
  borné à `artisan | partenaire | lead`, bornes de `validateNode`), sa main
  (« ajoute / crée / enregistre un contact | un artisan | un partenaire | un
  lead | une fiche … », et la forme dictée le 23/10 : « ajoute X à RIVEN »), la
  reformulation déterministe, la règle du prompt (type manquant → demandé en un
  mot ; ni numéro ni mail inventés ; l'apporteur n'est pas une fiche à créer).
- `api/_lib/leo-execution.js` — `DEFAIRES.proposer_contact` (`network_nodes`,
  retouche vraie, libellé `nom`), `DEPENDANCES.network_nodes` (sept clés) et le
  verbe d'écran « A ajouté un contact ».
- `js/leo-accueil.js` — le gabarit (`POST /api/reseau/nodes`, statut `prospect`
  posé, provenance composée dans `notes`), le refus `doublon` (nom déjà porté
  par une cible chargée, règle de `resoudreRef`) et son message, la fiche née
  ajoutée à `candidats.cibles` (retirée au défaire).
- `supabase/releves/20261002_leo_defaire_dependances.RELEVE.sql` — les sept
  clés de `network_nodes`, **relevées dans les migrations, pas en base** (la
  séance n'avait pas d'accès au projet Ultima) ; la requête du relevé, rejouée
  avec `network_nodes`, doit rendre exactement ces sept lignes.
- Harnais : verrous refixés (**12 outils, 11 verts nommés, 14 mains, 11
  défaires joués**) ; `unit-leo-mains` (quadrant, type, bornes, reformulation,
  plan exact, doublon) ; `unit-leo-execution` (vert mot pour mot, numéro réécrit
  → orange, type non dit → orange, question ou négation → orange) ;
  `smoke-leo-accueil` §C7-bis (carte au texte serveur → rien avant le clic → un
  POST au corps exact avec le Bearer → la fiche née est la cible de la relance
  du tour suivant → doublon bloqué).
- Sabotages joués, tous rouges : une clé retirée de `DEPENDANCES` ; le refus
  `doublon` retiré ; la forme « à riven » retirée de la main ; l'outil passé
  orange.

**Reste à prouver (④ 5)** : la preuve réelle en production, après fusion — un
contact dicté par Paul, lu dans RIVEN et dans `leo_ecritures`, puis une relance
posée dessus au tour suivant.

**Relecture Codex du 23/10 (six constats, `bf0703a`) et ce qu'il en est fait :**
- *P1 — « garder la création de contact en orange »* : la ligne Orange du §11
  (« changement touchant un client, un euro ou un état métier réel ») et le §12
  (« la PII entre dans l'anneau vert » : journal et relance écrivent déjà dans
  le réseau commercial, sous le double critère réversible + visible) se lisent
  ensemble. Une fiche `prospect` née par la voix est réversible (suppression
  sans cascade tant qu'elle est neuve) et visible (journal + bulle + défaire) :
  elle relève du §12, comme la relance. **La couleur est la décision de Paul du
  23/10 (« go, vert »), prise avec l'alternative orange nommée.** Ce paragraphe
  est la réconciliation écrite que le contrat exige ; le fil Codex reste ouvert
  tant que Paul ne l'a pas lu.
- *P2 — mail malformé accepté puis refusé en 400* : corrigé, `EMAIL_RE` de la
  route appliqué dans `validerProposition` et dans le gabarit.
- *P2 — la requête du relevé ne rend pas « sept lignes »* : exact ; la requête
  juste (appariement par rang, colonne `id`, distinct) est dans le relevé, et
  `unit-audit-database` la joue désormais sur PGlite contre `DEPENDANCES`.
- *P2 — doublon jugé sur l'instantané chargé* : non corrigé. Le même instantané
  sert déjà toutes les `*_ref` ; une fiche doublée par un autre onglet est
  visible et se retire dans RIVEN ; une unicité serveur changerait le contrat
  du formulaire RIVEN, hors de cette boucle. À trancher par Paul.
- *P2 — la fiche née n'apparaît pas dans RIVEN avant rechargement* : corrigé,
  l'hôte reçoit `surEcriture` / `surDefaire` et recharge comme le formulaire.
- *P2 — « Lié : journal » sans phrase* : corrigé, les sept dépendances de
  `network_nodes` ont leur phrase, avec le renvoi vers RIVEN.

