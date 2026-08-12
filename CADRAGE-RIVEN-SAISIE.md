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
