# ULTIMA — STELLAR DESIGN SYSTEM V2

Statut : **preview / expérimentation, aucune bascule production**  
Date : 2026-09-18

## North star

**Observatoire astronomique ancien × interface de commandement contemporaine × carte céleste vivante.**

Le ciel est le monde. Les instruments sont des objets posés dans ce monde. Les ateliers restent des espaces de travail. Le parchemin devient une matière ponctuelle, jamais le fond général.

## Reference lock

- **Primaire — Ultima existant** : nuit bleu-encre, or antique, crème, serif ancienne, ciel fonctionnel, données en SVG et décor en canvas.
- **Oxide** : profondeur par écarts tonals + hairlines, presque aucune ombre.
- **Active Theory** : vide immersif, luminescence rare, UI périphérique discrète.
- **Railway** : contraste serif de caractère / sans utilitaire et respiration.
- **Memotron** : graphe comme objet principal ; chrome et panneau d'inspection subordonnés.

### Rejets
Pas de cyberpunk, violet néon généralisé, gradients arc-en-ciel, glassmorphism massif, cartes partout, halos sans sens, WebGL décoratif, changement du moteur `ciel.js` pour une raison esthétique.

## Tokens V2

### Profondeur
- `space/void #02050b` : vide profond.
- `space/deep #060b14` : atmosphère générale.
- `surface/glass rgba(12,22,36,.72)` : HUD léger.
- `surface/raised rgba(18,35,58,.66)` : panneau actif.
- `line/gold rgba(216,189,130,.20)` : structure patrimoniale.
- `line/cool rgba(143,194,212,.16)` : structure technique.

### Encres et signaux
- `text/primary #f2ead6`
- `text/secondary #c8c5bd`
- `text/quiet #8f99a8`
- `accent/gold #d8bd82` : structure, cap, appel majeur.
- `accent/ice #9fc9df` : navigation/interaction.
- Les couleurs métier restent sémantiques et ne deviennent jamais décoratives.

### Forme
Rayon principal 8px. Pas de grosses ombres. Blur 12px maximum et uniquement pour HUD/dialogues au-dessus d'un ciel réellement chargé.

## Règles de composition

1. **Galaxie** : présence diffuse, grande échelle, pas de carte.
2. **Nébuleuse** : champ chromatique faible, jamais une boîte.
3. **Constellation** : proximité + relations fines ; le nom est plus important que son halo.
4. **Étoile** : cible interactive. L'étoile active gagne en lumière ; les autres reculent légèrement.
5. **Signal** : toute lueur doit avoir un sens métier. Le décor n'emprunte jamais le vocabulaire des données.
6. **HUD** : périphérique, compact, translucide seulement si nécessaire à la lecture.
7. **Instrument** : surface plus opaque et stable pour chiffres/formulaires. Le ciel est derrière, pas à travers le contenu dense.

## Typographie

Conserver la serif ancienne comme voix d'Ultima, mais réduire son usage : titres, caps, cartouches. UI, métadonnées, commandes et densité utilisent la pile sans/mono déjà disponible localement. Aucun CDN de police.

## Motion

Le ciel peut respirer ; l'interface ne flotte pas. 120–160 ms pour hover/focus, 350–500 ms pour changement de profondeur. Aucun mouvement porteur d'information sans équivalent statique. `prefers-reduced-motion` reste obligatoire.

## Accessibilité et performance

Les données restent DOM/SVG. Le canvas reste décoratif et `aria-hidden`. Cibles tactiles >=44px lorsque le contrôle est isolé sur mobile. Contraste AA. Le budget LV5 (<16,7 ms de travail/image) reste une gate : V2 n'achète aucune beauté par une régression de cadence.

## Stratégie d'implantation

P0 — preview isolée (ce commit).  
P1 — mesurer contraste, lisibilité, cadence et 390×844 / 1670×900.  
P2 — après validation visuelle, extraire les tokens V2 dans `css/stellaire.css` sans changer leurs rôles existants.  
P3 — migrer HUD/navigation.  
P4 — instruments et ateliers, écran par écran, sans transformer les formulaires en ciel.

## Critère de bascule

Aucune page de production ne charge `stellar-v2-preview.css`. La bascule exige : capture validée, tests existants verts, AA, reduced-motion, aucune perte de cible/clavier, et comparaison de performance avec LV5 actuelle.


## V2.6 — Contrat des instruments

Un **instrument** porte des données à lire exactement : formulaire, chiffres, jauges, commandes, panneau d'inspection. Il reçoit donc une plaque nocturne stable et quasi opaque. Le ciel reste visible **entre** les instruments, jamais sous une valeur critique.

Règles :
- fond instrument ≈ 94 % opaque ; pas de blur nécessaire ;
- entête plus sombre que le corps, hairline froide ;
- or = acquis/structure/valeur patrimoniale ; glace = système/interaction ;
- chiffres en tabular lining nums ;
- pas d'ombre portée lourde, pas de grosse carte flottante ;
- rayon 6–8 px, double filet intérieur uniquement très faible ;
- focus clavier glace 2 px ;
- sur mobile, l'instrument peut prendre la largeur disponible mais ne devient jamais un modal plein écran par défaut.

ALTHEA est le cas de référence : son invariant existant « qui pose des chiffres pose leur support » est conservé. Stellar V2 ne rend jamais ses blocs transparents.


## V2.7 — Freeze candidat

La couche de preview est désormais consolidée. Les doublons de cascade mobile ont été retirés et les états reduced-motion / forced-colors ont un repli explicite.

### Gates avant transplantation
1. **Visuel** : validation humaine sur 390×844 et écran large.
2. **Interaction** : hover, focus clavier et sélection restent distincts.
3. **Accessibilité** : AA, focus visible, 44 px mobile, forced-colors exploitable.
4. **Mouvement** : reduced-motion coupe transitions et déplacements décoratifs d'interface.
5. **Performance** : le profil atmosphérique V2 doit rester sous le budget LV5.
6. **Isolation** : aucune page production ne doit importer `design/stellar-v2-preview.css`.
7. **CI** : unit + browser doivent réellement démarrer et passer ; un job sans runner ne vaut pas verdict produit.

### Ordre de transplantation
- T1 tokens sémantiques vers `css/stellaire.css` ;
- T2 ciel et états d'interaction ;
- T3 HUD/navigation ;
- T4 ALTHEA comme premier instrument réel ;
- T5 autres instruments/ateliers écran par écran.

Aucune étape Tn ne doit embarquer automatiquement Tn+1.
