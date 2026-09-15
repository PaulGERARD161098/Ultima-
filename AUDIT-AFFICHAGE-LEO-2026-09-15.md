# Audit d'affichage — rendre Ultima plus net et Léo véritablement copilote

**Date :** 15 septembre 2026  
**Périmètre :** accueil, navigation stellaire, pages de travail et surfaces de Léo  
**Nature :** audit de produit et de direction d'interface — aucun comportement métier n'est modifié

## Verdict en une phrase

Ultima possède déjà une identité forte et une architecture cohérente, mais l'écran
met aujourd'hui **le monde d'Ultima avant le travail à accomplir** : Léo est
présente à trois endroits différents sans disposer d'une place stable, tandis que
la constellation, le cartouche de survol et Finubar se disputent l'attention.

La refonte ne doit donc pas « moderniser » Ultima ni ajouter un tableau de bord.
Elle doit lui donner une **colonne vertébrale** : une scène principale pour
comprendre et agir, et un unique **poste de copilote Léo**, toujours reconnaissable,
qui résume, recommande, converse et confirme les actions.

---

## 1. Ce qui existe réellement

### Une base plus solide qu'elle n'en a l'air

- L'accueil est déjà un écran plein cadre : constellation au centre, identité en
  haut, état Finubar en bas.
- Le registre visuel est assumé : nuit, parchemin, or, sceaux et typographie
  éditoriale. Il distingue utilement trois usages — explorer, travailler, lire
  des chiffres — au lieu d'appliquer le même décor partout.
- Léo est techniquement diffusée sur les 22 pages HTML applicatives auditées.
- Son cartouche sait déjà montrer un état, des travaux, des propositions, une
  conversation et une confirmation avant action.
- L'accessibilité de base est prise au sérieux : zones tactiles, focus visible,
  `aria-live`, safe areas mobiles, replis sans JavaScript et réduction des
  mouvements.

Il ne faut pas repartir de zéro. La valeur est dans ces contrats et dans ces
composants ; le problème est leur **composition à l'écran**.

### Les quatre surfaces qui composent aujourd'hui l'expérience

| Surface | Rôle actuel | Problème observé |
|---|---|---|
| En-tête flottant | nommer le lieu et poser une question | prend une place premium mais ne donne ni statut ni action |
| Constellation | naviguer dans la structure | très évocatrice, mais demande de connaître la mythologie avant de savoir quoi faire |
| Parole au survol | expliquer l'astre pointé | utile à la souris, fragile au tactile et trop éphémère pour porter un choix |
| Bandeau Finubar | signaler l'état et l'action prioritaire | devient une seconde interface de pilotage, surtout massive sur mobile |
| Bouton « Parler à Léo » | ouvrir le cartouche | visible partout, mais Léo demeure derrière une porte générique et sans contexte perceptible |

---

## 2. Diagnostic priorisé

### P0 — Léo est partout dans le code, mais nulle part dans la hiérarchie

Léo apparaît comme :

1. une parole de survol dans la constellation ;
2. une recommandation dans Finubar ;
3. un bouton flottant « Parler à Léo » ;
4. un grand cartouche modal après activation.

Ces quatre incarnations ne forment pas un même objet mental. L'utilisateur doit
comprendre seul que le texte au survol, la recommandation du bas et le bouton en
bas à droite viennent de la même copilote. Le prénom n'est pas accompagné d'un
état stable, d'une présence visuelle constante ni d'une continuité de
conversation.

**Conséquence :** Léo ressemble davantage à une fonction d'assistance qu'à la
personne qui pilote l'expérience.

**Décision proposée :** remplacer ces apparitions dispersées par un **dock Léo
unique**. Au repos il montre son identité, une phrase située et une action. Ouvert,
il devient le panneau de conversation et de confirmation existant. La parole de
survol et l'action Finubar alimentent ce dock au lieu de créer deux surfaces
concurrentes.

### P0 — La priorité du jour n'est pas le premier niveau de lecture

La question « Sur quoi est-ce qu'on travaille aujourd'hui ? » ouvre le champ des
possibles, tandis que l'action déterminée par Finubar arrive au troisième bloc du
bandeau. L'interface sait déjà calculer une priorité, mais commence par demander à
l'utilisateur de choisir.

**Conséquence :** l'accueil expose l'organisation avant de réduire la charge de
décision.

**Décision proposée :** le premier texte opérationnel de l'accueil devient :

> **Léo** — Je te propose de commencer par **[action]**.  
> *Pourquoi : [un signal court].* &nbsp; **Commencer** &nbsp; **Voir autrement**

La constellation reste dominante et exploratoire. Léo fournit seulement un
point de départ, sans transformer l'accueil en liste de tâches.

### P1 — La navigation privilégie le vocabulaire interne sur la reconnaissance

Les noms ULTIMA, ALPHA, ALTHEA, GRIMA ou NAGA portent l'univers, mais obligent à
lire leur sous-titre ou à les mémoriser. Sur une interface quotidienne, le nom
mythologique doit renforcer la reconnaissance, pas constituer son seul repère.

**Décision proposée :** adopter partout la paire :

> **GRIMA**  
> Projets personnels

Le nom fonctionnel doit rester visible sans survol, dans une taille plus petite
mais à contraste plein. Ne pas remplacer les noms : ajouter la traduction
fonctionnelle qui permet l'apprentissage progressif.

### P1 — Trop de cadres flottants se comportent comme des niveaux équivalents

L'en-tête, la parole, Finubar, le bouton Léo et les étoiles lumineuses ont chacun
leur bordure, leur contraste et leur position fixe. La scène est poétique, mais
la multiplication des surcouches dilue la lecture « où suis-je / que se
passe-t-il / que puis-je faire ? ».

**Décision proposée :** limiter chaque écran à trois plans :

1. **contexte** — fil d'Ariane et titre, volontairement calme ;
2. **travail** — ciel, formulaire, carte ou instrument ;
3. **copilote** — le dock Léo, seule surface fortement mise en avant.

Finubar reste la source de vérité, mais cesse d'être un meuble permanent : ses
trois signaux deviennent une vue secondaire « État des projets », accessible
depuis le dock ou un contrôle discret.

### P1 — Le mobile empile au lieu de recomposer

Le bandeau Finubar passe sur une colonne et place bien l'action en premier, mais
il conserve ensuite son en-tête et ses signaux. Il peut donc occuper une part
importante d'un écran de 390 × 844 px. En parallèle, la constellation, le titre
et la parole ont encore besoin de leur propre zone sûre.

**Décision proposée :** sur mobile, le dock Léo a trois hauteurs explicites :

- **compact — 64 à 76 px :** une phrase sur deux lignes maximum + bouton ;
- **aperçu — 35 à 45 % de la hauteur :** raison, trois signaux, raccourcis ;
- **conversation — plein écran :** dialogue, saisie et cartes de confirmation.

Un glissement ou un bouton explicite change d'état. Aucun panneau intermédiaire
ne doit recouvrir une action sans offrir un moyen visible de revenir à l'état
compact.

### P2 — La densité et la typographie varient trop selon l'âge des écrans

Le dépôt contient 20 feuilles CSS et plusieurs familles de coques historiques.
La direction antique est cohérente, mais les espacements, tailles, boutons,
cartouches et densités résultent encore de décisions locales. Une refonte page
par page recréerait le problème.

**Décision proposée :** constituer avant toute migration six primitives :

1. `Coque` — largeur, marges sûres, fond et registre ;
2. `EnTeteContexte` — retour, titre fonctionnel et nom mythologique ;
3. `Carte` — surface de lecture ou d'action ;
4. `Action` — primaire, secondaire, discrète, dangereuse ;
5. `Signal` — neutre, appel, attention, bloqué, accompli ;
6. `DockLeo` — compact, aperçu, conversation, confirmation.

Elles peuvent rester en HTML/CSS/JavaScript vanilla. « Design system » signifie
ici un contrat de composition, pas une migration de framework.

---

## 3. Direction visuelle recommandée

### Principe : éditorial, calme, orienté décision

La bonne synthèse des patterns de produits soignés n'est pas davantage de cartes
arrondies ou de verre dépoli. Pour Ultima :

- **une intention par écran** ;
- **une action primaire à la fois** ;
- **divulgation progressive** : résumé, détail, action ;
- **alignements francs** plutôt qu'objets flottants indépendants ;
- **contraste par rôle**, pas par décoration ;
- **microcopie située** : Léo dit ce qu'elle voit et pourquoi elle propose ;
- **densité maîtrisée** : les détails vivent dans un second niveau consultable.

### Ce qui doit rester

- La nuit stellaire comme sol commun.
- Les sceaux, l'or et le parchemin comme accents identitaires.
- La constellation comme carte mentale et navigation profonde.
- Les angles peu arrondis et l'absence de « dashboard SaaS » générique.
- La confirmation explicite avant toute écriture de Léo.

### Ce qui doit évoluer

- Réserver l'or vif aux appels réellement prioritaires.
- Passer les panneaux secondaires en traits et fonds plus silencieux.
- Employer une sans-serif système pour commandes, statuts et petits textes
  denses ; conserver la sérif pour titres, noms et narration.
- Réduire l'usage des capitales espacées aux identités et surtitres ; elles
  ralentissent les actions fréquentes.
- Donner à Léo un marqueur simple et stable — sceau miniature ou monogramme —
  plutôt qu'une nouvelle illustration anthropomorphique.

---

## 4. Architecture cible

### Accueil desktop

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Ultima                                      État · Recherche · Profil│
│ Bonjour Paul                                                        │
│                                                                      │
│                         CONSTELLATION                                │
│                noms + sous-titres toujours lisibles                 │
│                                                                      │
│ ┌─ LÉO ────────────────────────────────────────────────────────────┐ │
│ │ Je te propose de reprendre [action].                             │ │
│ │ [raison courte]                     [Voir l'état] [Commencer →]  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

Le dock ne remplace pas le ciel ; il lui donne une conclusion. « Voir l'état »
ouvre les signaux Finubar dans le même panneau. « Commencer » suit la cible déjà
calculée.

### Page de travail desktop

```text
┌ Contexte ─────────────────────────────────────────── Léo · disponible ┐
│                                                                      │
│                    SURFACE DE TRAVAIL                                │
│                                                                      │
│                                             ┌─ LÉO ────────────────┐ │
│                                             │ résumé situé         │ │
│                                             │ prochaine action     │ │
│                                             │ [Parler] [Agir]      │ │
│                                             └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

Sur un grand écran, Léo peut devenir un rail droit de 320 à 380 px, ouvert sur
demande. Sur un écran étroit, le même composant devient une feuille basse. Le
contenu et les capacités ne changent pas avec le viewport ; seule leur
composition change.

### États indispensables du dock

| État | Contenu visible | Action primaire |
|---|---|---|
| repos | identité + « Je suis là » ou prochain geste | Ouvrir |
| recommandation | action + raison + fraîcheur de la donnée | Commencer |
| contexte | résumé du lieu ou de l'objet sélectionné | Approfondir |
| conversation | historique court + saisie | Envoyer |
| confirmation | reformulation, cible, effet, garde | Confirmer |
| erreur | ce qui n'a pas marché + effet réel/non-effet | Réessayer |
| données anciennes | date explicite, proposition suspendue | Actualiser |

---

## 5. Parcours cible de Léo

### Arrivée

1. L'accueil s'ouvre sur le ciel.
2. Le dock annonce une seule recommandation, calculée par la source existante.
3. Léo expose une raison courte et la fraîcheur : « d'après l'état collecté il y
   a 2 jours ».
4. Paul peut commencer, demander une autre proposition ou explorer librement.

### Exploration

1. Le focus, le survol ou le toucher d'un astre met à jour le même dock.
2. Le dock conserve le nom, le sens fonctionnel, un résumé et l'action possible.
3. Un second geste ouvre la destination ; le survol n'est jamais requis.

### Conversation et action

1. « Parler à Léo » ouvre le dock sans perdre la page ni le contexte courant.
2. La conversation indique explicitement le périmètre que Léo voit.
3. Une proposition d'écriture devient une carte de confirmation dans ce même
   fil.
4. Après exécution, Léo montre le résultat et le moyen de l'ouvrir ou de
   l'annuler lorsque le métier le permet.

---

## 6. Plan de refonte en quatre lots

### Lot 0 — Mesurer avant de déplacer (0,5 à 1 jour)

- Capturer accueil, RIVEN, FINUBAR, une page atelier et une page instrument aux
  formats 1440 × 900, 1024 × 768 et 390 × 844.
- Relever pour chaque écran : action primaire perçue en 5 secondes, nombre de
  surfaces fixes, hauteur utile restante et ordre de tabulation.
- Faire tester le libellé fonctionnel de chaque constellation sans explication.

**Sortie :** un état zéro visuel et quatre mesures de référence.

### Lot 1 — Unifier Léo sans toucher au métier (2 à 4 jours)

- Créer `DockLeo` en réemployant le contenu et les appels du cartouche existant.
- Y rediriger la parole de survol et l'action Finubar.
- Conserver l'API, les gardes d'authentification et les confirmations actuelles.
- Déployer d'abord sur l'accueil et une page de travail représentative.

**Critère de réussite :** une seule surface Léo visible à un instant donné ; la
conversation et la confirmation restent fonctionnelles au clavier et au tactile.

### Lot 2 — Nettoyer l'accueil (2 à 3 jours)

- Calmer l'en-tête et afficher les sous-titres fonctionnels des astres.
- Réduire Finubar à sa donnée source et déplacer son détail dans le dock.
- Garder une seule couleur d'appel dominante.
- Ajouter une alternative explicite à la recommandation : « Voir autrement ».

**Critère de réussite :** après 5 secondes, une personne peut dire où elle est,
ce que Léo recommande et comment explorer un autre cap.

### Lot 3 — Étendre les primitives (par familles, pas page par page)

- Migrer successivement : coques ciel, ateliers, instruments.
- À chaque famille, supprimer seulement les styles rendus réellement orphelins.
- Ajouter des tests de géométrie, contraste, clavier et chevauchement mobile aux
  tests fonctionnels existants.

**Critère de réussite :** même hiérarchie et mêmes états de Léo sur les trois
registres, sans uniformiser leur densité métier.

---

## 7. Ce qu'il ne faut pas faire

- Ne pas ajouter une colonne permanente de widgets sur l'accueil.
- Ne pas transformer tous les contenus en cartes arrondies interchangeables.
- Ne pas personnifier Léo par un grand avatar : sa valeur vient du contexte, de
  la justesse et de l'action, non d'une mascotte.
- Ne pas supprimer les noms mythologiques ; leur adjoindre une traduction.
- Ne pas faire parler Léo automatiquement à chaque navigation.
- Ne pas mélanger dans le même niveau une recommandation, trois alertes et une
  conversation.
- Ne pas migrer de technologie pour résoudre un problème de hiérarchie.
- Ne pas lancer les 22 pages ensemble : valider d'abord accueil + une page de
  travail, puis étendre par famille.

---

## 8. Mesures de succès

| Objectif | Mesure proposée | Cible initiale |
|---|---|---|
| Comprendre l'accueil | « où suis-je / que faire maintenant ? » sans aide | < 5 secondes |
| Mettre Léo en avant | utilisateurs identifiant spontanément la recommandation comme venant de Léo | 100 % sur test interne |
| Réduire le bruit | surfaces fixes simultanées sur l'accueil | 2 maximum : contexte + dock |
| Préserver le ciel | hauteur visible hors dock compact sur mobile | ≥ 75 % |
| Agir vite | gestes entre arrivée et ouverture de l'action recommandée | ≤ 2 |
| Rester sûr | écritures de Léo confirmées explicitement | 100 % |
| Rester accessible | parcours complet clavier, focus visible, aucun recouvrement à 200 % | 100 % des écrans pilotes |

---

## 9. Arbitrages à obtenir avant le premier patch visuel

1. **Place de Léo :** dock bas sur l'accueil et rail droit sur desktop de travail
   — ou dock bas partout ? Recommandation : composition adaptative, même
   composant.
2. **Finubar :** détail replié dans Léo ou bandeau conservé ? Recommandation :
   détail replié, priorité visible dans Léo.
3. **Langage :** tutoiement partout ou maintien des variations actuelles ?
   Recommandation : une seule voix, tutoiement sobre déjà employé par Léo.
4. **Sous-titres fonctionnels :** affichés sous tous les noms mythologiques ou
   seulement jusqu'à apprentissage ? Recommandation : toujours visibles ; la
   mémoire ne doit jamais être une condition d'accès.

## 10. Recommandations d'optimisation pour naviguer avec Léo

### Ordre recommandé

| Rang | Optimisation | Valeur produite | Effort estimé |
|---|---|---|---|
| 1 | Dock Léo contextuel unique | réunit orientation, dialogue et action | moyen |
| 2 | Palette « Demander ou aller à… » | atteint toute destination sans connaître l'arbre | faible à moyen |
| 3 | Vue « Mes projets » | passe de la mythologie au portefeuille concret | moyen |
| 4 | Fil de navigation persistant | permet de se situer et de remonter sans repartir à zéro | faible |
| 5 | Historique et reprises | retrouve immédiatement les derniers contextes de travail | faible |
| 6 | Modes d'affichage du ciel | conserve la constellation sans lui faire tout porter | moyen |
| 7 | Contrat de contexte de Léo | rend ses réponses prévisibles et dignes de confiance | moyen |

Les trois premiers gestes forment le **prototype prioritaire**. Les suivants
améliorent la vitesse et la confiance, mais ne doivent pas retarder ce prototype.

### 10.1 — Un dock Léo qui pilote réellement la navigation

Le dock est une interface de navigation, pas seulement une fenêtre de chat. Il
doit toujours répondre à quatre questions, dans cet ordre :

1. **Où sommes-nous ?** — « RIVEN · relations » ;
2. **Que vois-tu ?** — « 2 relances dues, dernière mise à jour hier » ;
3. **Que proposes-tu ?** — une action primaire, avec sa raison ;
4. **Où peut-on aller ?** — au plus trois destinations contextuelles.

Au repos, une seule ligne est visible. Un clic l'ouvre sans changer de page. La
conversation reste attachée au contexte courant même si Paul explore un astre,
et un changement de contexte est annoncé : « Nous passons de RIVEN à FINUBAR ».

**Commandes rapides proposées :**

- `Reprendre` — restaure le dernier contexte actif ;
- `Priorité` — explique puis ouvre l'action du jour ;
- `Où j'en suis` — résume l'écran courant sans action automatique ;
- `Mes projets` — ouvre le portefeuille ;
- `Aller à…` — cherche une destination dans tout le registre.

Léo ne doit jamais inventer une route. Les destinations viennent du registre du
ciel ; les priorités viennent de Finubar ; le contexte vient de l'écran ouvert.

### 10.2 — Une palette universelle « Demander ou aller à… »

La constellation est excellente pour **explorer**, moins pour atteindre en deux
secondes une destination déjà connue. Il lui faut un raccourci complémentaire,
accessible depuis le dock et au clavier (`⌘/Ctrl + K`).

La même saisie accepte :

- une destination : « Riven », « contacts », « projets professionnels » ;
- une intention : « reprendre mon dernier projet » ;
- une question : « qu'est-ce qui bloque ? » ;
- une action : « ajouter une idée » — soumise aux confirmations existantes.

Les résultats sont groupés en **Destinations**, **Projets**, **Actions** et
**Réponses de Léo**. Une destination exacte apparaît avant une réponse générée :
pour naviguer, le déterminisme doit gagner sur la conversation.

### 10.3 — Ajouter une vue « Mes projets » sans remplacer le ciel

La structure stellaire représente le sens et les relations ; le portefeuille
représente l'état opérationnel. Essayer de faire porter les deux entièrement par
les étoiles surcharge la carte.

Le bouton `Mes projets` ouvre donc un panneau ou une page compacte avec :

- **Actifs** — projets ayant une prochaine action ;
- **À décider** — projets bloqués ou à recaler ;
- **En veille** — aucun geste attendu ;
- **Terminés / archivés** — repliés par défaut.

Chaque ligne montre seulement : nom, appartenance dans la constellation, état,
prochaine action et fraîcheur. Elle propose `Ouvrir` et `Demander à Léo`. La
sélection d'un projet doit aussi pouvoir le révéler dans le ciel : la liste et la
constellation sont deux vues du **même registre**, jamais deux taxonomies.

### 10.4 — Rendre le fil d'Ariane persistant et actionnable

Le code possède déjà un chemin calculé depuis le registre. Il doit devenir le
repère stable de toutes les pages, pas seulement un élément lié à l'isolement
d'une branche :

> Ultima / Personnel / GRIMA / RIVEN

- chaque niveau est cliquable ;
- le niveau fonctionnel accompagne le nom mythologique au focus ;
- `Échap` remonte d'un niveau dans le ciel ;
- le retour navigateur restaure l'isolation et le zoom précédents ;
- « Accueil » ne détruit pas le contexte de conversation de Léo.

### 10.5 — Proposer « Reprendre » et un historique utile

Sur l'accueil, avant une recommandation algorithmique, Léo peut proposer la
continuité lorsque la dernière session est récente :

> Reprendre **RIVEN — préparer la relance de Camille**, ouvert hier.

Conserver localement les cinq derniers contextes suffit : destination, projet,
horodatage et libellé de la prochaine action. Ne pas stocker la conversation ni
du contenu sensible dans cet historique de navigation. Les favoris ne sont à
ajouter que si l'historique ne couvre pas le besoin après usage réel.

### 10.6 — Donner au ciel trois modes, pas trois nouveaux écrans

La constellation reste la vue par défaut. Trois filtres sobres peuvent changer
ce qu'elle met en lumière sans modifier sa géographie :

- **Structure** — toutes les constellations, lumière neutre ;
- **Appels** — intensité issue des signaux Finubar et personnels ;
- **En cours** — uniquement les branches portant une prochaine action.

Léo annonce le filtre actif et peut l'appliquer à la demande. La position des
astres ne change jamais entre les modes : une carte qui se réorganise détruit la
mémoire spatiale. La couleur seule ne suffit pas ; un halo, un motif de trait ou
un libellé porte aussi l'état.

### 10.7 — Formaliser ce que Léo voit avant d'optimiser ses réponses

Chaque page doit fournir au dock un objet de contexte court et explicite :

```text
lieu, objet sélectionné, état, prochaine action, fraîcheur,
routes autorisées, actions proposées, actions interdites
```

Le dock affiche la fraîcheur et le périmètre sur demande. Si une source est
ancienne ou absente, Léo le dit et suspend la recommandation concernée. Cette
optimisation produit plus de confiance qu'un prompt plus long : une copilote
utile sait d'abord **où elle est, ce qu'elle sait et ce qu'elle ne sait pas**.

### 10.8 — Modèle de priorité : continuité avant urgence

Pour éviter qu'Ultima devienne une machine à pression, l'accueil choisit son
action selon cet ordre :

1. reprendre une action récemment commencée et toujours valable ;
2. traiter un blocage explicite ;
3. accomplir un geste attendu de Paul ;
4. suivre une prochaine action projet ;
5. explorer librement si aucun signal n'est suffisamment fiable.

Léo explique toujours la règle retenue en une phrase. `Voir autrement` présente
deux alternatives au maximum. Une priorité rejetée plusieurs fois est mise en
veille : augmenter sa couleur ne rendrait pas la recommandation meilleure.

### 10.9 — Critères d'acceptation du prototype

Le premier prototype est validé seulement si :

- depuis l'accueil, un projet connu est atteint au clavier en moins de 10
  secondes ;
- la prochaine action recommandée est ouverte en deux gestes maximum ;
- Paul peut reprendre son dernier travail en un geste ;
- le contexte courant reste lisible dock fermé ;
- le ciel conserve au moins 75 % de la hauteur sur téléphone, dock compact ;
- une navigation reste possible sans passer par Léo ;
- aucune action d'écriture n'est exécutée sans confirmation ;
- le retour navigateur, `Échap`, le tactile et le clavier produisent le même
  chemin logique.

### Séquence concrète des deux prochaines itérations

**Itération A — navigation rapide :** prototype du dock compact, palette
universelle, fil persistant et commande `Reprendre`, uniquement sur l'accueil et
RIVEN. Ne pas déplacer Finubar ni refaire les styles des pages pendant ce test.

**Itération B — pilotage des projets :** vue `Mes projets`, intégration de la
priorité Finubar au dock, filtres Structure/Appels/En cours et états de fraîcheur.
Cette itération ne commence que si l'itération A améliore réellement le temps
d'accès et la compréhension du contexte.

## Conclusion

Le meilleur prochain geste n'est pas un grand « redesign ». C'est un prototype
très ciblé de l'accueil où **la constellation reste entière**, **Finubar nourrit
Léo sans créer un second cockpit**, et **Léo occupe une seule surface continue**
du conseil à l'action.

Cette intervention est suffisamment petite pour être comparée à l'existant, et
suffisamment structurante pour décider ensuite de la refonte du reste d'Ultima
sur des preuves plutôt que sur une préférence esthétique.
