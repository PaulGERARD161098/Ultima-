# SPEC — Purge des résidus enfantins → registre antique sérieux (graphisme → front-carto)

> Auteur : graphisme, 2026-07-11. Sources relues : css/styles.css (@font-face
> Caveat L3-18, tokens `:root`, zone `--police-manuscrite` + `.panneau-bois`
> L1240-1385), js/app.js (composant « relances dues » L520-535),
> design/spec-r1-graphisme.md (source de vérité du registre antique : cartouche
> gravé, or antique, liseré inset cerne+or, sépia). Palette NON re-décidée :
> on réutilise strictement les tokens antiques déjà posés. Tous les ratios
> ci-dessous sont CALCULÉS (luminance relative WCAG), pas estimés.

## (a) Intention — 3 lignes

Purger les deux derniers résidus « livre d'enfance » du front — la police
manuscrite Caveat et les panneaux de bois à poteau et clous — sans refonte :
on ne touche que les tokens et règles concernés. La typo à l'ancienne passe à
une pile old-style **système** (zéro asset, zéro CDN) ; le panneau de bois
devient une **plaque de parchemin gravée** qui reprend le langage exact du
cartouche R1 (fond parchemin, filet cerne, liseré or inset, encre sépia).

---

## (b) Tableau « actuel → nouvelle valeur » (directement applicable)

| # | Emplacement (css/styles.css) | Actuel | Nouvelle valeur |
|---|---|---|---|
| 1 | L3-18 `@font-face` Caveat (×2) | 2 blocs `@font-face { font-family:"Caveat"; src: url(../fonts/caveat-*.woff2) … }` | **Supprimés** (devenus morts — voir §e) |
| 2 | L57 token police | `--police-manuscrite: "Caveat", "Segoe Script", "Bradley Hand", cursive;` | `--police-ancienne: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;` (renommé : « manuscrite » est lui-même un résidu sémantique) |
| 3 | L52 token | `--bois: #6b4a2b;` | **Supprimé** (orphelin après conversion — n'était utilisé que par `.panneau-bois`) |
| 4 | L53 token | `--bois-fonce: #5d3f23;` | **Supprimé** (orphelin après conversion) |
| 5 | L1242 `.accueil-titre` | `font-family: var(--police-manuscrite);` | `font-family: var(--police-ancienne);` |
| 6 | L1251 `.accueil-question` | `font-family: var(--police-manuscrite);` | `font-family: var(--police-ancienne);` |
| 7 | L1276 `.accueil-sous-titre` | `font-family: var(--police-manuscrite);` | `font-family: var(--police-ancienne);` |
| 8 | L1322-1385 `.panneau-bois` & Cie | Panneau de bois (`--bois`/`--bois-fonce`/`--creme`), poteau `::before`, clous `::after`, texte manuscrit 1.4rem | **Bloc complet remplacé** par la plaque de parchemin (§c) ; `::before` et `::after` supprimés |

**Tokens conservés (ne pas toucher)** : `--creme` reste utilisé hors panneau
(L181 et L349, textes sur fonds sombres `--mer-profonde`) ; tous les tokens
antiques (`--parchemin*`, `--encre-sepia*`, `--or-antique`, `--cerne-carte`)
sont réutilisés tels quels.

### Pile typo — justification (contrainte dure : zéro nouvel asset)

`"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif`

- **Old-style humaniste = registre gravure/à l'ancienne** : axe incliné,
  empattements adoucis, chiffres elzéviriens — exactement le registre « carte
  savante » voulu, là où Caveat apportait le manuscrit banni.
- **100 % système, aucun woff2 à vendorer** : *Iowan Old Style* (macOS/iOS,
  fournie), *Palatino Linotype* / *Book Antiqua* (Windows), *Palatino*
  (macOS). Chaîne robuste sur les 3 OS cibles.
- **Repli universel = Georgia**, DÉJÀ la police du cartouche R1
  (`spec-r1-graphisme.md §4`) : cohérence directe avec l'entête, chiffres
  old-style, rendu « livre » sérieux partout, avant `serif` générique.
- **Option (non recommandée)** : vendorer une old-style OFL (ex. *EB Garamond*
  woff2 auto-hébergé) pour un rendu identique cross-OS. Écartée : viole
  « patch minimal + zéro nouvel asset », gain marginal — la pile système
  couvre déjà le registre.

---

## (c) Composant `panneau-bois` → plaque de parchemin gravée : CSS cible complet

Remplace intégralement le bloc L1322-1385. La classe `.panneau-bois` (et
`-texte` / `-cible`) est **conservée** : aucun renommage JS, donc aucune
retouche de js/app.js (patch minimal). L'objet n'est plus un panneau de bois
mais une plaque gravée ; le commentaire de section le documente.

```css
/* Relances dues : plaques de parchemin gravées (registre antique).
   Langage repris du cartouche R1 : fond parchemin, filet cerne, liseré or
   inset, encre sépia. (Ancien : panneau de bois à poteau + clous — retiré.) */

.item-relance-ligne {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

/* .panneau-bois : nom de classe CONSERVÉ (patch minimal, JS inchangé).
   C'est désormais une plaque de parchemin, plus un panneau de bois. */
.panneau-bois {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 44px;
  margin-left: 0;                 /* était 18px : dégagement du poteau, supprimé */
  padding: 0.55rem 0.9rem 0.6rem 1.15rem;
  background: linear-gradient(180deg, var(--parchemin), var(--parchemin-carte));
  color: var(--encre-sepia);
  border: 1px solid var(--cerne-carte);
  border-radius: 4px;
  box-shadow:
    inset 0 0 0 3px rgba(169, 136, 74, 0.45),   /* liseré or gravé = --or-antique @45 % */
    0 1px 2px rgba(59, 47, 28, 0.18);            /* ombre portée sobre, sépia */
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}

/* ::before (poteau) et ::after (clous) : SUPPRIMÉS, aucun remplaçant. */

.panneau-bois:hover {
  border-color: var(--or-antique);
  background: linear-gradient(180deg, #fbf5e6, var(--parchemin));
}

.panneau-bois:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.panneau-bois-texte {
  font-family: var(--police-ancienne);
  font-size: 1.05rem;             /* était 1.4rem (le manuscrit lisait grand) */
  line-height: 1.25;
  font-weight: 600;
  color: var(--encre-sepia);      /* était --creme sur bois */
}

.panneau-bois-cible {
  font-size: 0.82rem;
  color: var(--encre-sepia-douce);  /* était --creme sur bois */
}
```

Notes de conception :
- **Sobriété assumée** : un seul dispositif décoratif, le liseré or inset
  (signature du cartouche R1) ; poteau et clous retirés sans les remplacer par
  un autre ornement — l'objet reste un outil, la plaque porte l'information.
- **Alignement du badge d'échéance préservé** : `.badge-echeance` garde son
  `margin-left: 18px` (L~1416) — la plaque démarre maintenant au bord du
  conteneur et son texte est inséré de `1.15rem ≈ 18.4px`, donc le badge
  reste aligné sous le texte. Aucune retouche nécessaire.
- Le `padding-left: 8px` des anciens `-texte`/`-cible` (dégagement du poteau)
  est retiré : l'inset gauche de la carte (1.15rem) suffit.

---

## (d) Emplacements exacts à modifier

**css/styles.css** (7 zones) :
1. **L3-18** — supprimer les deux blocs `@font-face` « Caveat ».
2. **L52-53** — supprimer les tokens `--bois` et `--bois-fonce`.
3. **L57** — renommer `--police-manuscrite` → `--police-ancienne` + nouvelle
   pile old-style (tableau #2).
4. **L1242** `.accueil-titre` — `var(--police-manuscrite)` → `var(--police-ancienne)`.
5. **L1251** `.accueil-question` — idem.
6. **L1276** `.accueil-sous-titre` — idem.
7. **L1322-1385** — remplacer le bloc `.panneau-bois` / `::before` / `::after`
   / `.panneau-bois-texte` / `.panneau-bois-cible` par le CSS §c (supprimer
   `::before` L1342-1351 et `::after` L1353-1364).

**js/app.js** : **AUCUNE modification.** Les classes `panneau-bois`
(L523), `panneau-bois-texte` (L525), `panneau-bois-cible` (L529) sont
conservées à l'identique — le CSS §c les recycle. (Renommage sémantique
`plaque-relance*` possible plus tard, hors périmètre de ce patch minimal.)

---

## (e) Verdict suppression des assets Caveat : **OUI, supprimables**

**Preuve.** Recherche `caveat` (insensible à la casse) sur les fichiers de
runtime (`.css`/`.js`/`.html`) : les SEULES occurrences sont, dans
css/styles.css, les deux `@font-face` (L5-6, L13-14) et la valeur du token
`--police-manuscrite` (L57). Aucun autre `font-family: "Caveat"` nulle part.
Après application de ce patch (token réécrit sans « Caveat » + `@font-face`
retirés), plus aucun fichier de runtime ne nomme la famille ni ne charge les
`.woff2`.

Donc **supprimables** :
- les 2 blocs `@font-face` (css L3-18) ;
- `fonts/caveat-latin-500-normal.woff2` (~50 Ko) ;
- `fonts/caveat-latin-700-normal.woff2` (~50 Ko).

Réserve documentaire (hors code, ne bloque pas la suppression) : Caveat/
« manuscrit » est encore cité dans des docs historiques (REFONTE-ACCUEIL.md,
ROADMAP-SITE.md, memoire/JOURNAL-DECISIONS.md, PRODUIT.md §carte). Ces fichiers
NE chargent PAS la police — ils la décrivent au passé. Dérive doc à corriger
par Léo lors du rafraîchissement mémoire/roadmap, pas par ce patch front.

---

## Preuves d'accessibilité (ratios calculés)

Fond de la plaque : dégradé `--parchemin #f6eed9` → `--parchemin-carte
#efe3c6`. Ratios calculés sur le **cas le plus défavorable** (extrémité
sombre `#efe3c6`, L=0.774).

| Élément | Couleur | vs fond | Ratio | Seuil | Verdict |
|---|---|---|---|---|---|
| Texte étape `.panneau-bois-texte` | `--encre-sepia #3b2f1c` | `#efe3c6` | **10,2:1** | 4,5:1 | ✅ |
| Texte cible `.panneau-bois-cible` (0.82rem) | `--encre-sepia-douce #6a5636` | `#efe3c6` | **5,49:1** | 4,5:1 | ✅ |
| Bordure plaque (délimitation) | `--cerne-carte #5a4118` | `--parchemin #f6eed9` (fond .cadre-dessine) | **8,23:1** | 3:1 | ✅ |
| Focus `:focus-visible` | `--accent #1e6fb8` | `#efe3c6` | **3,74:1** | 3:1 | ✅ |

- Liseré or inset (`--or-antique @45 %`) = **décoratif** : la délimitation
  essentielle est portée par la bordure `--cerne-carte` (8,23:1), pas par le
  liseré — conforme au double codage (bordure pleine + remplissage contrasté).
- Sur `:hover` le fond s'éclaircit (`#fbf5e6`) : tous les ratios texte
  **augmentent**, aucun cas ne descend sous le seuil.
- Le changement de pile typo sur `.accueil-titre/-question/-sous-titre`
  **n'altère aucun contraste** (couleurs sépia sur parchemin inchangées) —
  seule la forme des glyphes change.

---

## Ce que le `verificateur` doit constater à l'écran

1. **Aucune écriture manuscrite** nulle part sur l'Accueil : titres, question,
   sous-titres et texte des relances rendus en serif old-style (Georgia ou
   mieux selon l'OS), aspect « livre / gravure », jamais cursif.
2. **Relances dues = plaques de parchemin** : fond parchemin clair, fin filet
   brun (`--cerne-carte`) + liseré doré intérieur, texte encre sépia. **Plus
   aucun** panneau brun, poteau vertical ni « clous » ronds.
3. **Cible ≥ 44 px**, focus clavier visible (anneau bleu 2 px), survol qui
   éclaircit légèrement le parchemin sans perte de lisibilité.
4. **Réseau (onglet-clé)** : le badge d'échéance reste aligné sous le texte de
   la plaque (pas de décalage après retrait du poteau).
5. **Aucune requête réseau** vers `caveat-*.woff2` dans l'onglet Réseau du
   navigateur (police plus chargée) ; page toujours CSP-clean (aucun style
   inline introduit).
6. **Contraste** : texte des plaques nettement lisible (≥ 4,5:1 vérifié).
