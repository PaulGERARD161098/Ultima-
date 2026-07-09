# SPEC A2 — Secteur d'activité des contacts (données → front-carto)

> Boucle A2 du pivot (REFONTE-ARBRE §2 et §3). Décision Paul actée D3 :
> **texte libre + suggestions** (datalist alimentée par les valeurs déjà
> saisies, comme les villes), PAS de liste fermée. Regroupement par valeur
> normalisée (minuscules + accents retirés) pour éviter « Plomberie » ≠
> « plomberie ». Additif, non destructif, style existant. Socle de l'Arbre
> (A3) : chaque secteur deviendra une branche.

## 0. Périmètre — ce qui NE bouge PAS

- **Aucun nouvel endpoint.** On étend la validation des endpoints existants
  (`api/reseau/nodes.js` via `api/_lib/validate.js`). `GET /api/reseau`
  renvoie déjà `select('*')` → `secteur_activite` remontera automatiquement
  une fois la colonne appliquée, rien à changer côté lecture.
- **Aucune touche auth / RLS / middleware / CSP.** Pur ajout de champ.
- **Saisie progressive conservée** (REFONTE §5) : seul `nom` reste requis.
  Un contact sans secteur est légitime — il ira dans la branche « À classer »
  en A3 ; ici il persiste simplement avec `secteur_activite` absent/null.

## 1. Base de données (déjà déposé — GATE Paul)

- Migration `supabase/migrations/0006_secteur_activite.sql` : colonne
  `secteur_activite text` NULLABLE, `CHECK (… is null or char_length ≤ 120)`,
  index partiel `network_nodes_owner_secteur_idx (owner_id, secteur_activite)
  where secteur_activite is not null`.
- **La migration N'EST PAS appliquée** (gate). Tant qu'elle ne l'est pas, un
  `secteur_activite` envoyé à l'API sera rejeté par PostgREST (colonne
  inconnue) → l'ordre d'implémentation compte : le front peut être livré,
  mais le test de persistance ne passera qu'après application par Paul.

## 2. Validation API serveur — `api/_lib/validate.js`

Miroir strict de la contrainte SQL (défense en profondeur, jamais une seule
couche). Modifications, toutes dans `validate.js` :

1. Ajouter `'secteur_activite'` à la liste blanche `NODE_FIELDS` (const ~l.10).
   Sans cela, `rejectUnknown` renverra « Champ non autorisé : secteur_activite »
   et bloquera tout POST/PATCH portant le champ.
2. Dans `validateNode`, traiter `secteur_activite` comme les autres textes
   optionnels bornés — l'ajouter à la boucle existante avec sa longueur max :

   ```js
   for (const [field, max] of [
     ['ville', 200],
     ['adresse', 500],
     ['secteur_activite', 120],   // ← ajout, borne = CHECK SQL 0006
     ['notes', 2000],
   ]) { … }
   ```

   Cette boucle applique déjà `checkOptionalText` (type string, longueur) puis
   `if (body[field] !== undefined) out[field] = body[field]` — donc `null`
   (vidage en édition) et absence (création) sont gérés sans code
   supplémentaire, exactement comme `ville`.

- **Borne 120** = valeur du CHECK SQL. Les trois couches (DB 120, API 120,
  HTML `maxlength=120`) doivent rester égales : un secteur est un libellé
  court (« Plomberie », « Électricité générale »), 120 est large.
- Ne PAS normaliser côté serveur : la base stocke la valeur telle que saisie
  (fidélité d'affichage). La normalisation est un concept d'affichage/
  regroupement, traité côté client (§5).

## 3. Formulaire de contact — `index.html` (`#form-noeud`)

Ajouter un champ `secteur` dans le formulaire `#form-noeud`. Emplacement
recommandé : **juste après le bloc `#noeud-statut`** (l.476) et avant
`#noeud-ville` — le secteur qualifie le contact (proche du type/statut),
au-dessus des coordonnées. Markup aligné sur les champs existants :

```html
<div class="champ">
  <label for="noeud-secteur">Secteur d'activité</label>
  <input id="noeud-secteur" type="text" maxlength="120"
         list="liste-secteurs" autocomplete="off">
  <datalist id="liste-secteurs"></datalist>
</div>
```

- Label sans `*` (optionnel), cohérent avec Ville/Adresse.
- `maxlength="120"` = borne API/DB.
- `list="liste-secteurs"` branche la datalist des suggestions (§4). La
  `<datalist>` est peuplée dynamiquement en JS ; la laisser vide dans le HTML.
- `autocomplete="off"` pour ne pas superposer l'autofill navigateur aux
  suggestions métier (même intention que `#noeud-email`).

## 4. Datalist de suggestions — `js/app.js`

Source des suggestions = **valeurs `secteur_activite` distinctes déjà
présentes dans `etat.noeuds`** (données déjà chargées via `GET /api/reseau`,
aucun appel réseau supplémentaire). Nouveau helper, à placer près de
`normaliserTexte` (~l.872) :

```js
// Secteurs déjà saisis, dédoublonnés par forme normalisée (minuscules +
// accents retirés), triés alpha fr. Première graphie rencontrée conservée
// pour l'affichage (comme on regroupera les contacts par secteur en A3).
function secteursConnus() {
  var vus = Object.create(null);
  etat.noeuds.forEach(function (n) {
    var brut = (n.secteur_activite || '').trim();
    if (!brut) { return; }
    var cle = normaliserTexte(brut);
    if (!vus[cle]) { vus[cle] = brut; }
  });
  return Object.keys(vus).map(function (cle) { return vus[cle]; })
    .sort(function (a, b) { return a.localeCompare(b, 'fr'); });
}

function majDatalistSecteurs() {
  var dl = $('#liste-secteurs');
  if (!dl) { return; }
  dl.textContent = '';
  secteursConnus().forEach(function (valeur) {
    var opt = document.createElement('option');
    opt.value = valeur;
    dl.appendChild(opt);
  });
}
```

- Appeler `majDatalistSecteurs()` dans `ouvrirFormNoeud()` (avant
  `ouvrirPanneau`), pour que la liste reflète toujours l'état courant.
- **Dédoublonnage explicite par clé métier** (forme normalisée), pas de
  fuzzy silencieux : « Plomberie » et « plomberie » → une seule suggestion.
  La normalisation réutilise `normaliserTexte` déjà en place (NFD + strip
  diacritiques + lowercase) — même règle que la recherche nom/ville.

## 5. Lecture / écriture du champ dans le flux existant — `js/app.js`

- **Pré-remplissage édition** — `ouvrirFormNoeud()` (~l.2216) : ajouter
  ```js
  $('#noeud-secteur').value = noeud ? (noeud.secteur_activite || '') : '';
  ```
  à côté des autres `$('#noeud-…').value = …`.
- **Soumission** — `soumettreFormNoeud()` (~l.2258) : ajouter
  `'secteur_activite'` à la liste des champs optionnels balayés :
  ```js
  ['ville', 'adresse', 'secteur_activite', 'telephone', 'email', 'notes']
    .forEach(function (champ) { … });
  ```
  ⚠️ l'id DOM est `#noeud-secteur` mais la clé API/DB est `secteur_activite`.
  La boucle actuelle fait `$('#noeud-' + champ)` : `#noeud-secteur_activite`
  n'existe pas. Deux options propres :
  - **(recommandé)** nommer l'input `id="noeud-secteur_activite"` dans le
    HTML (§3) et le label `for="noeud-secteur_activite"` → la boucle marche
    telle quelle, clé = id sans préfixe, zéro cas particulier ;
  - sinon, sortir `secteur_activite` de la boucle et le traiter à part
    (`$('#noeud-secteur').value.trim()`).

  Choisir l'option 1 (id `noeud-secteur_activite`) : cohérence 1 champ = 1
  clé, pas d'exception dans la boucle. Mettre à jour §3 en conséquence.
- Ce mécanisme donne gratuitement le bon comportement optionnel : vide en
  **création** → champ omis (pas de chaîne vide envoyée) ; vide en **édition**
  → `null` (vidage effectif). Identique à `ville`.

## 6. Fiche contact — `js/app.js` (~l.1089)

Afficher le secteur dans la fiche, via le helper `ligneDetail` existant qui
n'affiche rien si la valeur est vide (contact sans secteur → ligne masquée,
rien d'imposé). L'ajouter en tête des détails, avant Ville :

```js
ligneDetail(dl, "Secteur d'activité", noeud.secteur_activite);
```

## 7. Points de vérification (harnais `tests/`, à enrichir — jamais jetable)

Cas à couvrir, dans l'esprit des critères REFONTE §3 boucle A2 :

1. **Persistance création** : créer un contact avec
   `secteur_activite = "Plomberie"` → after refresh, la fiche affiche
   « Secteur d'activité : Plomberie » et `etat.noeuds` porte la valeur.
   (Nécessite migration 0006 appliquée — sinon 400/erreur DB attendue :
   documenter comme dépendance de gate.)
2. **Persistance édition** : ouvrir un contact existant, renseigner puis
   modifier le secteur → valeur mise à jour ; vider le champ en édition →
   `secteur_activite` repasse à null (ligne fiche disparaît).
3. **Validation longueur (client)** : `maxlength=120` empêche la saisie
   au-delà ; (serveur) un POST direct avec 121 caractères renvoie
   « secteur_activite trop long » (400), pas 500 — prouve le miroir API/DB.
4. **Suggestions reflètent l'existant** : avec des contacts « Plomberie » et
   « Toiture » en base, `#liste-secteurs` contient exactement ces deux
   `<option>` après `ouvrirFormNoeud` ; créer un 3ᵉ secteur l'ajoute à la
   liste à l'ouverture suivante.
5. **Normalisation / dédoublonnage** : contacts « Plomberie » et
   « plomberie » → la datalist ne propose qu'**une** entrée (première graphie
   conservée) ; aucune valeur en double. Prouve `secteursConnus`.
6. **Champ optionnel** : créer un contact avec le nom seul (secteur vide) →
   succès, aucune ligne secteur en fiche, contact présent dans `etat.noeuds`
   (futur « À classer » A3). Non-régression du flux nom-seul.

## 8. Rappels

- **GATE migration** : `0006_secteur_activite.sql` est déposé mais NON
  appliqué. Application = go Paul. Les tests de persistance (1, 2, 3-serveur)
  ne verdissent qu'après. Le front (3-client, 4, 5, 6-UI) est vérifiable
  avant, en mode démo / avec fixtures.
- **Advisors** : passer `get_advisors` (lint) après application (critère A2) —
  attendu 0 nouveau lint (la colonne est nullable, l'index est standard, RLS
  inchangée).
- **Zéro PII en dur / en logs** : le secteur n'est pas de la PII sensible mais
  reste une donnée réseau — ne jamais le logguer côté API (les endpoints
  existants ne loggent que des codes, à préserver).
