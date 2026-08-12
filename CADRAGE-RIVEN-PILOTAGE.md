# CADRAGE — RIVEN : piloter, corriger, proposer

> Format 6 points exigé par la **directive EL**, appliqué aux **trois boucles**
> que Paul demande de fermer le **2026-08-12** : *« cadre pour qu'on boucle les
> 3 boucles ce jour »*.

---

## 0. Ce que la mesure a corrigé dans mon propre inventaire

J'ai annoncé à Paul que la troisième boucle — *« ce que Léo doit faire de la
donnée : les rapprochements, les relances qui dorment »* — **attendait
entièrement**. **C'est faux, et je le corrige avant de cadrer** :

| Ce que j'avais annoncé manquant | Réalité mesurée |
|---|---|
| Les relances remontées d'elles-mêmes | **Existe** — `relancesDues()` (l. 998), `rendreSectionRelances` (l. 1070), case « faite », compte des retards |
| Léo qui suggère | **Existe** — `rendreSectionSuggestions` (l. 1278), moteur `calculerSuggestions` à **quatre règles** : R1 relance en retard, R2 idée dormante (14 j), R3 contact injoignable, R4 contact sans position |
| Les rapprochements | Une section **« Où en sont mes rapprochements »** existe (l. 1139) — mais elle **suit les rapprochements DÉJÀ créés** |

**Ce qui manque réellement est bien plus étroit** : Léo ne propose jamais un
rapprochement **inédit**. R2 réveille une idée déjà saisie ; aucune règle ne dit
*« ces deux-là ne se connaissent pas, et ils devraient »*. C'est précisément la
demande du 2026-07-06 (« rapprochements potentiels entre contacts, qu'il peut
créer en base **sur validation** ») — et c'est **la seule pièce absente**.

*Sans cette vérification, j'aurais réécrit un moteur de suggestions qui existe,
et je l'aurais probablement dégradé.*

---

## 1. ① Le but — ce qui sera vrai à la fin

**A. Piloter.** Les trois champs orphelins de la migration `0003` —
`interet_qualitatif`, `effort_temps`, `effort_energie` — sont **atteignables et
modifiables** depuis la fiche. Ce que Paul a demandé le 2026-07-03 devient
enfin visible.

**B. Corriger sans détruire.** Une erreur de saisie se répare **sans supprimer
l'objet ni son journal** : le **type** et la **note** d'une relation se
modifient, le **rôle** d'une personne sur une fiche aussi.

**C. Proposer.** Léo propose un **rapprochement inédit** entre deux fiches qui
ne sont pas reliées, **en disant pourquoi**, et le geste ouvre le formulaire de
relation **pré-rempli** — Paul valide, Léo n'écrit jamais seul.

---

## 2. ② Les étapes

### Étape commune : un seul formulaire pour A et B

A et B tombent sur **la même surface** — la relation affichée dans la fiche.
Deux formulaires séparés seraient deux fois le même code. Il n'y en a donc
**qu'un** : `#form-relation` gagne un mode **édition** et trois champs de
pilotage. **On capitalise, on ne duplique pas** — c'est la règle du 2026-07-30.

1. **API** — `type` entre dans `EDGE_UPDATE_FIELDS` (`api/_lib/validate.js`).
   Il reste validé contre `EDGE_TYPES` ; **`source_id` et `target_id` restent
   gelés** (voir ⑤). Aucune migration, aucun champ neuf en base.
2. **`riven.html`** — `#form-relation` : trois champs de pilotage sous un pli
   « Pilotage » **replié** ; `#form-rattachement` : mode édition du rôle.
3. **`js/app.js`** —
   - `ouvrirFormRelation(idSource, idEdition)` + bouton « Modifier » sur chaque
     relation de la fiche ;
   - `majRattachement(id, valeurs)` (l'API `PATCH` existe déjà, le front ne
     l'appelle nulle part) + bouton « Rôle » sur chaque personne rattachée ;
   - **R5** dans `calculerSuggestions` : le rapprochement inédit.
4. **`css/styles.css`** — l'habillage du pli et des deux boutons.
5. **Tests** — `tests/unit-relation-pilotage.mjs` (Node pur : le contrat de
   `validateEdge` en mode update) et `tests/smoke-pilotage.mjs` (les trois
   boucles exercées au doigt).
6. **Patrimoine COMPLET**, pas seulement les harnais touchés.

### La règle R5, en clair

Une paire est proposée si **les quatre conditions** tiennent :
1. les deux fiches **ne sont reliées par aucune relation** (dans un sens ni
   dans l'autre) ;
2. leurs **métiers se répondent** — le `secteur_activite` de l'une figure dans
   le `secteur_activite` **ou** les `metiers_secondaires` de l'autre ;
3. l'une **demande** (`lead` ou `chantier`, et elle nomme un métier) et l'autre
   **fournit** (`artisan` qui exerce ce métier) ;
   > *Amendé pendant l'implantation* : j'avais aussi prévu « ou bien un
   > `partenaire` rencontre un `artisan` ». **Écarté** — sans critère de
   > correspondance, ce serait *tous* les partenaires × *tous* les artisans.
   > Du bruit présenté comme un conseil ; on ne propose que ce dont on peut
   > **dire la raison**.
4. aucune des deux n'est **close** (`statut` `termine` ou `inactif`).

Départage **déterministe** : la meilleure `fiabilite` d'abord, puis la même
ville, puis l'ordre alphabétique. **Une seule paire proposée à la fois** — le
moteur existant plafonne à trois suggestions, et une liste de rapprochements
n'est pas une suggestion, c'est un catalogue.

---

## 3. ③ Les moyens — ce qui est touché

| Fichier | Nature |
|---|---|
| `api/_lib/validate.js` | 1 constante + 1 branche de validation |
| `riven.html` | 3 champs + 1 pli + 2 boutons |
| `js/app.js` | 4 fonctions modifiées, 2 ajoutées |
| `css/styles.css` | 2 règles |
| `tests/unit-relation-pilotage.mjs` | **neuf** |
| `tests/smoke-pilotage.mjs` | **neuf** |
| `tests/lancer.sh` | 2 lignes |

**Intouchés, et c'est un critère** : `js/ciel.js`, `js/arbre.js`, `js/carte.js`,
`supabase/migrations/**`. **Aucune migration** — les trois champs existent
depuis `0003`, le rôle depuis `0024`.

---

## 4. ④ Les critères de réussite — vérifiables

- **C1 (A)** — sur une relation, saisir intérêt + efforts, recharger l'état :
  les trois valeurs sont **relues depuis la source de vérité** et réaffichées.
  Un effort hors bornes (0, 6, « abc ») est **refusé côté API** — prouvé en
  Node, pas seulement à l'écran.
- **C2 (B)** — changer le **type** et la **note** d'une relation : **son `id`
  ne change pas** et **l'entrée de journal qui lui est adossée est toujours
  là**. C'est la définition de « corriger sans détruire », et elle se mesure.
- **C3 (B)** — changer le **rôle** d'une personne sur une fiche : le
  rattachement garde son `id`, la personne n'est ni détachée ni recréée, et le
  registre compte **toujours le même nombre de personnes**.
- **C4 (B)** — le **statut** et la **raison d'arrêt** d'une relation
  **survivent** à une édition de type/note (on ne réinitialise pas ce qu'on
  ne touche pas).
- **C5 (C)** — dans un réseau où deux fiches se répondent sans être reliées, la
  suggestion **paraît**, **nomme les deux** et **dit pourquoi** ; le geste
  ouvre le formulaire **pré-rempli** sur la bonne paire. Et **rien n'est écrit
  en base tant que Paul n'a pas validé** — testé par l'**ABSENCE** d'une
  relation neuve après affichage de la suggestion.
- **C6 (C)** — la règle ne propose **jamais** une paire déjà reliée : preuve
  par l'ABSENCE, sur un réseau où la paire évidente existe déjà.
- **C7** — `js/ciel.js`, `js/arbre.js`, `js/carte.js` : **zéro ligne de diff**.
- **C8** — accessibilité : labels, pli au clavier, cible tactile **mesurée**
  ≥ 24 px à 390 px.
- **C9** — patrimoine COMPLET vert, assertions neuves comptées.

---

## 5. ⑤ Ce qu'on ne fait PAS

- **Changer la SOURCE ou la CIBLE d'une relation.** Elles **définissent** la
  relation : en changer une ne corrige pas cet objet, elle en désigne un autre.
  Le journal adossé deviendrait un faux témoignage. Elles restent **gelées**,
  et c'est la raison pour laquelle dégeler le `type` est sans danger : le type
  **décrit** un lien, il ne l'**identifie** pas.
- **Écrire un rapprochement en base sans validation.** Léo pré-remplit, Paul
  valide. C'est la charte, et c'est le point 3 de l'idée maîtresse.
- **Une liste de rapprochements.** Une paire à la fois (voir ②).
- **Toucher au moteur de suggestions existant** (R1–R4) ni à la section
  « Où en sont mes rapprochements ». R5 **s'ajoute** ; on ne réécrit pas ce qui
  marche — c'est ce que la vérification du §0 vient d'éviter.
- **Le géocodage, la carte, le ciel, l'arbre.** Rien à y faire ici.

---

## 6. ⑥ Pre-mortem — la boucle a échoué, pourquoi ?

| # | Mode de défaillance | Ce qui le prévient |
|---|---|---|
| **P1** | **L'édition écrase ce qu'elle ne touche pas** : rouvrir une relation pour corriger sa note remet son statut à « idée » et perd la raison d'arrêt. | Le `PATCH` n'envoie **que les champs du formulaire** ; statut et raison ne sont pas dans le formulaire d'édition, donc jamais transmis. **C4 le mesure**, il ne l'espère pas. |
| **P2** | **Dégeler le `type` ouvre une brèche** : un client écrit n'importe quoi. | `type` reste validé contre `EDGE_TYPES` par le **même code** qu'à la création. `source_id`/`target_id` restent hors de la liste blanche. Aucun changement de RLS, aucun changement de portée `owner`. Prouvé en Node par `unit-relation-pilotage`. |
| **P3** | **Corriger détruit quand même** : l'implémentation la plus simple serait supprimer + recréer. Le journal adossé à la relation partirait avec elle. | **C2 exige l'`id` STABLE et l'entrée de journal encore présente.** Un supprimer/recréer échoue le critère par construction. |
| **P4** | **R5 propose du bruit** sur un petit réseau, ou pire, propose une paire déjà reliée. | Quatre conditions cumulatives, dont l'absence de relation existante. **C6 le teste par l'ABSENCE.** Et zéro paire éligible est un état **normal**, pas une erreur : le moteur retombe simplement sur R1–R4. |
| **P5** | **R5 écrit tout seul.** | L'action **ouvre un formulaire pré-rempli**, elle n'appelle aucune API d'écriture. **C5 le teste par l'ABSENCE** d'une relation neuve. |
| **P6** | **Le formulaire d'édition sert de formulaire de création** et propose de changer la cible d'une relation existante. | En édition, le select de cible est **rempli de la seule cible actuelle et désactivé**, avec la raison écrite à l'écran. |
| **P7** | **Trois boucles en une session = trois bâclages** (« pas dix lièvres à la fois »). | A et B partagent **un seul formulaire** — ce n'est pas deux chantiers mais un. C est **une règle** ajoutée à un moteur existant, pas un moteur. Le patrimoine COMPLET tranche à la fin : vert ou rien. |
| **P8** | **Le harnais prouve dans la démo ce qui n'existe pas en prod.** | Les fixtures de démo contiennent déjà une paire éligible (lead Toiture ↔ aucun couvreur) — **on la construit explicitement** dans le harnais plutôt que d'espérer qu'elle s'y trouve. |
| **P9** | **Une session parallèle nous double.** | Rebase et fusion sans délai ; conflit sur `JOURNAL-DECISIONS.md` résolu **par concaténation**. |
