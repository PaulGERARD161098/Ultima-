# CADRAGE — Léo seul en bas (08/10/2026)

> Paul, devant l'accueil plongé dans ALPHA : *« je vois rien : supprime le
> bandeau du bas et le bandeau sur Alpha, les descriptions je m'en fiche. Tu
> gardes que le bandeau Léo, tout en bas. Cadre ça pour tout le logiciel. »*

## 0. Ce qui a été mesuré avant d'écrire une ligne

- **Bandeau Finubar** (« RénoDevis a avancé de 24 commit(s)… ») : un seul
  conteneur, `#finubar-bandeau` dans `index.html`, rempli par
  `js/finubar-bandeau.mjs` via `js/ciel-noeud.mjs`.
- **« Bandeau sur Alpha »** : la parole `#boussole-parole` — le cartouche des
  descriptions, au repos sous isolement comme au survol. Présente sur les six
  pages qui chargent `js/ciel-noeud.mjs` : index, alpha, omega, adramelech,
  bcp, imladrik.
- **Le dock de Léo** (`js/leo-navigation.mjs`) se posait AU-DESSUS du bandeau
  (`--fb-hauteur`) ; la parole, au-dessus du dock.
- **Les autres pages** (registre, idées, écrire, Finubar, RIVEN, dragons…) :
  aucun bandeau d'information en bas, mesuré au navigateur en démonstration.

## Arbitrages de Paul (panneaux, 08/10)

| Question | Tranché |
|---|---|
| « Le bandeau sur Alpha » | la carte de description ; le titre du haut reste |
| Le survol d'une étoile | plus rien à l'écran |
| RIVEN : onglets du bas et « + Ajouter » | ils restent (navigation, pas information) |

## ① Le but

Sur tout le logiciel, le bas de l'écran ne porte plus que le dock de Léo, posé
tout en bas. Aucune description n'est peinte sur le ciel, ni au repos ni au
survol.

## ② Les étapes

1. Retirer le bandeau Finubar : conteneur, feuille, module et branchements.
2. Ne plus PEINDRE la parole — mais la garder en zone `aria-live` : un lecteur
   d'écran continue d'entendre le nom de l'étoile approchée.
3. Sortir la parole et le bandeau du calcul du socle (`margesDuMobilier`) : le
   ciel reprend la place.
4. Retirer le CSS devenu mort (`a-finubar`, `fb-deplie`, l'empilement
   bandeau/dock/parole).
5. Réécrire les harnais qui tenaient le bandeau pour qu'ils tiennent son
   ABSENCE, verrous de non-vacuité compris, et recaler les verrous de densité
   que le ciel agrandi rendait vacants.

## ③ Les moyens

`index.html` · `js/ciel-noeud.mjs` · `css/ciel-noeud.css` · `css/leo.css` ·
supprimés : `js/finubar-bandeau.mjs`, `css/finubar-bandeau.css`,
`tests/unit-finubar-age.mjs` · harnais : `smoke-accueil-finubar`,
`smoke-bandeaux`, `smoke-cibles-telephone`, `smoke-dokles-sympho`.

## ④ Critères de réussite

- Aucun `#finubar-bandeau` dans la page, avec session et agrégat livrés (verrou :
  une étoile appelle).
- La parole fait ≤ 1 px **et** reçoit le nom au survol (verrou : sans le
  second, « invisible » serait vert sur une zone vide).
- Le dock est à ≤ 24 px du bord bas, et aucune autre pièce fixe ne partage le bas.
- Chaque verdict neuf a été vu ROUGE en cassant la règle qu'il garde.

## ⑤ Ce qu'on ne fait PAS

- On ne touche ni au titre du haut, ni au fil d'Ariane, ni à la navigation de
  RIVEN, ni au ciel lui-même.
- On ne supprime pas Finubar : la page `/finubar` et les propositions du dock
  restent ; seule la vignette de l'accueil part.

## ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Prévention |
|---|---|
| La parole retirée du DOM fait planter le noyau (`parole.classList`) | elle reste dans le DOM, masquée par CSS |
| Masquée mais encore comptée dans le socle → marge fantôme au bas du ciel | retirée de `margesDuMobilier` |
| Une règle CSS plus forte la ré-affiche (`html body.a-leo-dock #boussole-parole`) | règles d'empilement retirées ; harnais ④c la mesure |
| Les harnais du bandeau supprimés sans relève → l'absence n'est plus gardée | réécrits pour tenir l'absence, prouvés rouges sur sabotage |
| Des verrous de densité deviennent vacants (ciel plus grand) | tailles plus serrées ajoutées, verrou déplacé dessus |
| Perte d'information : la date de collecte et les signaux Finubar à l'accueil | assumée par Paul (« les descriptions je m'en fiche ») ; `/finubar` les porte |
