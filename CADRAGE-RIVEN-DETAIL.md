# CADRAGE — RIVEN en détail : la personne, le métier, la capacité

> Auteur : Léo, 2026-08-10, sur dictée vocale de Paul et **ses trois réponses
> au gate EL**. Format 6 points (directive EL §3). Sources relues avant
> d'écrire une ligne : `0001` (schéma `network_nodes`/`network_edges`), `0005`
> (rapprochement pilotable), `0006` (secteur d'activité + **décision D3**),
> `0008`/`0013` (motif du **double scellement** AD-4 et de l'index unique
> `network_nodes_owner_id_uniq`), `js/arbre.js` (le secteur EST la branche),
> `traveler.html` (`#form-noeud`), `api/_lib/validate.js`, `memoire/RADAR.md`.

---

## 0. Ce que Paul a dicté, et ce qu'il a tranché

Dictée : *« les catégorisations des contacts ne sont pas assez précises […]
que je puisse renseigner plus ce qu'ils font […] que je puisse renseigner des
contacts sans forcément créer des nœuds, que je puisse également créer
plusieurs nœuds […] l'affichage est un peu sommaire, ce serait pas mal de
pouvoir créer des archipels ou des arbres un peu différents, mais pour
l'instant ce n'est plutôt pas mal. Donc implantons ça déjà. »*

Trois ambiguïtés levées **par question directe**, jamais par supposition
(leçon de la session du 2026-08-10 : une journée perdue pour une ambiguïté
levable en une question) :

| Question | Réponse de Paul |
|---|---|
| « contacts sans nœuds / plusieurs nœuds » | **Séparer la PERSONNE du NŒUD** — une personne vit seule, rattachable à 0, 1 ou N nœuds, avec un rôle par rattachement. |
| « renseigner plus ce qu'ils font » | **Les quatre axes** : métiers multiples, nature affinée, capacités concrètes, qualité de la relation. |
| plusieurs métiers → quelle branche ? | **Le métier principal fait la branche.** Les autres sont des étiquettes. |

---

## 1. ① Le but — ce qui sera vrai à la fin

1. **Une personne n'est plus un nœud.** Paul peut enregistrer *Godefroy,
   conducteur de travaux, 06…* **sans créer aucune fiche** au réseau ; et
   rattacher cette même personne à **plusieurs** fiches, chacune avec son rôle
   (*gérant* chez l'une, *apporteur d'affaires* chez l'autre).
2. **Une fiche dit ce qu'elle fait.** Onze champs neufs sur `network_nodes`,
   rangés en quatre axes : nature affinée, métiers multiples, capacités
   concrètes, qualité de la relation.
3. **L'arbre ne bouge pas d'un pixel.** Le métier principal reste
   `secteur_activite` : `js/arbre.js` n'est pas touché, aucune assertion de
   géométrie ne tombe.
4. **Rien n'est perdu ni migré.** Additif pur : aucune colonne renommée,
   aucune donnée déplacée, aucun `check` existant durci.

## 2. ② Les étapes

1. `supabase/migrations/0024_riven_detail.sql` — **déposé, jamais appliqué**
   (gate migrations). Les onze colonnes, les deux tables neuves, leurs RLS.
2. `api/_lib/validate.js` — les onze champs, `validatePersonne`,
   `validateRattachement`. La base contraint ce que l'API valide, à l'identique.
3. `api/reseau.js` (GET : `personnes` + `rattachements`),
   `api/reseau/personnes.js`, `api/reseau/rattachements.js`.
4. `traveler.html` + `js/app.js` + `css/styles.css` — formulaire de fiche
   enrichi, formulaire de personne, rattachement depuis la fiche, registre
   « Personnes » dans l'onglet Contacts.
5. `tests/unit-riven-detail.mjs` (neuf) + `tests/smoke-contacts.mjs` (enrichi),
   branchés dans `tests/lancer.sh`, puis **patrimoine COMPLET**.

## 3. ③ Les moyens — ce qui est touché

| Fichier | Geste |
|---|---|
| `supabase/migrations/0024_riven_detail.sql` | **neuf** — SQL déposé, non appliqué |
| `api/_lib/validate.js` | étendu (NODE_FIELDS + 2 validateurs neufs) |
| `api/reseau.js` | GET renvoie deux collections de plus |
| `api/reseau/personnes.js`, `api/reseau/rattachements.js` | **neufs**, calqués sur `nodes.js` |
| `traveler.html`, `js/app.js`, `css/styles.css` | étendus |
| `tests/unit-riven-detail.mjs` | **neuf** |
| `tests/smoke-contacts.mjs`, `tests/lancer.sh` | enrichis |
| `js/arbre.js`, `js/carte.js` | **INTOUCHÉS** — c'est un critère, pas un hasard |

## 4. ④ Les critères de réussite — vérifiables, pas « ça a l'air bien »

- **C1** — `node tests/unit-riven-detail.mjs` vert : les onze champs acceptent
  le licite et **refusent** le hors-bornes (tableau de 13 métiers, note à 6,
  rayon négatif, champ inconnu, personne sans nom, rattachement à un id non-uuid).
- **C2** — dans `smoke-contacts.mjs` : une personne créée **sans aucun nœud**
  apparaît au registre, et `etat.noeuds.length` **n'a pas bougé**.
- **C3** — dans `smoke-contacts.mjs` : la même personne rattachée à **deux**
  fiches apparaît dans les deux, avec **deux rôles distincts**.
- **C4** — `smoke-arbre.mjs` et `smoke-secteur.mjs` passent **sans retouche** :
  la preuve que l'arbre n'a pas été touché.
- **C5** — patrimoine COMPLET (`bash tests/lancer.sh`) vert de bout en bout.
  *Mesuré le 2026-08-10 : **2 068 assertions vertes**, aucune rouge — 1 310 au
  format `✅` (inchangées, aucune de ce style n'a été ajoutée) et 758 au format
  `"verdict": true`, dont **52 neuves** (24 en unitaire, 28 en navigateur).*
- **C6** — la migration `0024` porte son bloc `rollback`, ses policies **une par
  opération** en `(select auth.uid())`, son **double scellement** AD-4, et
  aucun `security definer`.

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **Les archipels et les arbres différents.** Paul les a nommés puis écartés
  lui-même (« pour l'instant ce n'est plutôt pas mal »). L'affichage reste
  strictement celui d'aujourd'hui. **Aucune ligne de `js/arbre.js`.**
- **Une feuille par métier** : écarté par la réponse ③ de Paul.
- **Appliquer la migration** : gate. Le SQL vit dans `supabase/migrations/`.
- **Renommer « contact » en « fiche »** dans toute l'interface. Le mot juste
  serait « fiche » pour le nœud et « contact » pour la personne — mais un
  renommage large est exactement ce qui a laissé `smoke-quadrants` rouge le
  2026-07-22. La notion neuve s'appelle donc **« personne »** : zéro ambiguïté,
  zéro renommage. *Choix délibéré, réversible, à rouvrir si Paul le veut.*
- **Filtrer l'arbre ou la carte par les champs neufs** : la recherche les
  couvre, les cases à cocher restent type + statut.
- **Listes fermées** pour la nature, les métiers, les certifications : **D3
  tient** (texte libre + suggestions). Les mondes de Paul évoluent.

## 6. ⑥ Pre-mortem — la boucle a échoué, pourquoi ?

| # | Mode de défaillance | Ce qui le prévient |
|---|---|---|
| P1 | **La `CHECK` sur un tableau exige une sous-requête** — interdit par Postgres. Migration refusée à l'application, gate rouverte pour rien. | Fonction `public.riven_tags_valides(...)` **`immutable`**, `search_path` épinglé (motif `0002`), appelée par la `CHECK`. Aucune sous-requête dans la contrainte. |
| P2 | **Le double scellement échoue** : `personne_noeuds` pointe vers `network_nodes (owner_id, id)` sans cible unique. | La cible existe déjà — index unique `network_nodes_owner_id_uniq` créé par `0008`. On ne le **recrée pas** (42P07, constat de `0013`). Côté personnes, on crée notre propre `personnes_owner_id_uniq`. |
| P3 | **L'arbre casse** : un champ neuf mal branché change le regroupement. | `js/arbre.js` intouché, et **C4** l'exige comme preuve, pas comme espoir. |
| P4 | **Une personne fuit d'un owner à l'autre** — la faute grave, c'est de la PII. | RLS dès la création, une policy par opération, `owner_id = (select auth.uid())`, `owner_id` jamais accepté du client (motif `nodes.js`), **et** le double scellement qui rend le lien cross-owner impossible même RLS mal configurée. |
| P5 | **Le formulaire devient un mur** : onze champs de plus, saisie au pouce ruinée (RADAR n°2 : « saisie au pouce en situation »). | Les quatre axes sont dans un `<details>` **replié** — « Détail » —, sous les champs d'aujourd'hui. Le flux court existant est **inchangé** : nom + type + statut, on enregistre. |
| P6 | **Le tableau vide vs `null`** : `metiers_secondaires = []` et `null` divergent entre base, API et front. | Une seule règle, écrite une fois et testée : le vide **normalise vers `null`** côté API. `unit-riven-detail.mjs` l'assert dans les deux sens. |
| P7 | **La démo ment** : le harnais teste des personnes que la vraie API ne renverrait pas. | `donneesDemo()` livre personnes **et** rattachements dans la forme **exacte** du GET `/api/reseau` (mêmes clés, mêmes types). |
| P8 | **On se fait doubler par une session parallèle** (constat 2026-07-30 : 4 avancées de `main` en une session). | Rebase et fusion sans délai ; conflit sur `JOURNAL-DECISIONS.md` résolu **par concaténation**, jamais par arbitrage. |

---

## 7. Le modèle, en une image

```
  personnes                personne_noeuds              network_nodes
  ─────────                ───────────────              ─────────────
  Godefroy      ──┐        (personne, nœud, rôle)   ┌── Plomberie Roux & Fils
  Mme Vasseur     ├──────► gérant                   │   métier principal : Plomberie
  (0 nœud : OK)   │        apporteur d'affaires ────┤   autres métiers : Chauffage, PAC
                  └──────► conducteur de travaux ───┴── Réhabilitation Voltaire
```

- Une personne **sans** rattachement est licite — c'est la demande n°2 de Paul.
- Une personne avec **N** rattachements est licite — c'est la demande n°3.
- Supprimer une fiche retire ses rattachements, **jamais la personne** : elle
  reste au registre, elle a une existence propre.

## 8. Les onze champs, et pourquoi chacun

**Axe A — nature affinée** (`type` reste, il porte la couleur et le filtre) :
- `nature` — *entreprise, artisan indépendant, fournisseur, bureau d'études,
  distributeur, apporteur d'affaires, institution, particulier*. Texte libre +
  `datalist` (D3), 80 car.

**Axe B — métiers multiples** :
- `secteur_activite` — **inchangé**, devient explicitement le *métier
  principal*. C'est lui, et lui seul, qui fait la branche.
- `metiers_secondaires text[]` — jusqu'à 12, 120 car. chacun.

**Axe C — capacités concrètes** :
- `prestations` (2000) — ce qu'ils savent faire, en clair.
- `zone_intervention` (200) — départements, secteur géographique.
- `rayon_km` (0–2000) — jusqu'où ils se déplacent.
- `effectif` (0–100 000) — la taille réelle.
- `certifications text[]` — RGE, Qualibat… jusqu'à 12, 80 car.

**Axe D — qualité de la relation** (ce qui sert à *choisir qui appeler*) :
- `fiabilite`, `reactivite`, `niveau_prix` — échelles 1–5, mêmes bornes que les
  efforts de `0005` (`effort_temps`/`effort_energie`) : une seule grammaire de
  notation dans tout RIVEN.
- `disponibilite` (120) — texte, pas échelle : « sous 48 h », « chargé jusqu'en
  septembre » est une information, « 3/5 » n'en est pas une.
