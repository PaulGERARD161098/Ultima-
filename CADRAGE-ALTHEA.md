# CADRAGE-ALTHEA — LE SYSTÈME

> **Deux dictées de Paul, le 2026-08-06.** La première ouvre le quadrant (le
> suivi ludique des performances physiques et psychiques). La seconde en change
> la nature : ALTHEA devient **un Système**, au sens de *Solo Leveling* — un
> avatar, un titre, des quêtes, des récompenses, des rappels.
>
> **Boucle B0 : cadrer et étudier. Zéro code produit, zéro migration écrite.**
> Gate EL : le COMMENT est posé ici avant la première ligne de travail.
>
> **Décisions prises par Paul** (§12) : l'unité s'appelle un **SKILL** · le
> moteur est **cumul + élan** · la v1 livre **les skills et ce qu'il y a
> dedans** · **forme B**, le Système spectral · **Léo pilote le Système** ·
> **ALTHEA est autonome** — pas de liens imposés avec le reste d'Ultima ·
> une quête endormie s'accompagne d'une **sévérité** · ALTHEA est le
> **3ᵉ cadran d'ULTIMA Lv3**.
>
> Sources amont — `CADRAGE-LV3.md` (l'arbre, la règle nœud/feuille),
> `CADRAGE-IMLADRIK.md` (DRAUKHAIN : serments et flammes),
> `CADRAGE-RESHIRAM-ZEKROM.md` (RESHIRAM : les talents prouvés),
> `CADRAGE-LEO-SITE.md` (la voix et les mains de Léo).

---

# PARTIE I — LE QUADRANT

## 0. Ce que Paul a dicté — première dictée

1. **Un nouveau quadrant d'Ultima Lv3, nommé ALTHEA.**
2. Objet : le **suivi des performances physiques et psychiques**.
3. Forme : **un cadran unique portant des « talents »**. Exemple : *peak
   performance*.
4. Remplissage **quotidien ou hebdomadaire**, explicitement **non obligatoire**,
   et qui doit être **rigolo à remplir**. Exemple : « aujourd'hui je n'ai pas
   fumé, je n'ai pas bu d'alcool ».
5. Le suivi porte aussi la **pratique quotidienne** : japonais, espagnol, sport.
6. Mécanique : **progression par paliers**, **récompenses**, système **ludique**.
7. Finalité : **améliorer réellement ses skills**. Le jeu est le moyen.

## 0bis. Ce que Paul a dicté — seconde dictée (le Système)

1. **« Mon Système »**, dans le style de **Solo Leveling**.
2. **Un titre**, qui compte — *« j'ai un titre important »* — porté par **une
   sorte de personnage, une sorte d'avatar**.
3. Des **quêtes principales** et des **quêtes secondaires**.
4. **Le Système génère** les quêtes secondaires, et des **allongements de
   quête** — « toujours les choses au fur et à mesure ».
5. Les **récompenses** également.
6. **Renseigner tous ses skills**, et en **débloquer de nouveaux**.
7. **Démarrer de nouvelles quêtes**, et **les quêtes donnent des skills**.
8. **Des rappels automatiques pour les entraînements.**
9. **Des widgets sur l'écran d'accueil**, qui rappellent l'état — « avant
   c'était tel, 4 secondaires ou 4 de fond à continuer ».
10. **Un système complet, à la fois proactif et passif.**
11. Consigne de méthode : *« fais un travail d'étude, analyse et cadre bien tout
    ça »*, et *« va chercher loin »* — sur le graphique comme sur le système.

**Trois passages restés incertains, non devinés** : *« je vais finir ok, ça
vient rigolo »* · *« le budget du style »* lu **le widget** · *« quatre de
fond »* lu **quatre quêtes de fond**. Et, de la première dictée : *« une arme de
capacité »* lu **arbre de capacités**, *« ma science de sport »* lu **ma
pratique du sport**. À confirmer.

---

## 1. Les collisions — ce qui existe déjà et qu'on ne doublera pas

Question EB avant toute construction : **est-ce que l'existant le fait déjà ?**
Non — mais cinq objets d'Ultima s'en approchent assez pour qu'on trace la
frontière **par écrit**. Quatre venaient de la première dictée ; **la cinquième
naît du Système, et c'est la plus dangereuse.**

### 1.1 Collision de MOT — « talent » est déjà pris (RESHIRAM)

`talents` est une **table en base** depuis la migration `0009`. Un talent
RESHIRAM, c'est *un savoir-faire réel adossé à une preuve* : trois crans
(`notion` / `pratique` / `maitrise`), aucune progression automatique, et une
**règle cardinale — rien d'idéalisé, un talent sans preuve est « à étayer »**.

**✅ Tranché par Paul : dans ALTHEA, l'unité s'appelle un SKILL.** Le mot est de
Paul, tiré de sa dictée d'ouverture, et il tranche la collision par le registre :
*skill* appartient au **jeu**, *talent* appartient au **prouvé**. La table
`talents` de RESHIRAM n'est pas touchée. **Conséquence de langue actée** :
ALTHEA est le seul endroit d'Ultima où l'anglais est admis — parce que c'est le
seul endroit qui est un jeu.

> **Ce n'est pas un conflit, c'est une articulation.** Un talent RESHIRAM
> réclame une preuve ; ALTHEA **fabrique** de la preuve (« 214 jours de japonais
> nourris »). Un jour, peut-être, une passerelle — mais **facultative** :
> Paul a tranché l'autonomie d'ALTHEA (§1.5). Jamais un mot commun, en revanche.

### 1.2 Collision d'OBJET — « je n'ai pas fumé » ressemble à DRAUKHAIN

| | DRAUKHAIN | ALTHEA |
| --- | --- | --- |
| Nature | **la volonté** | **la mesure** |
| Objet | le serment — un engagement moral, rare, solennel | le skill — un geste répété, ordinaire, qui monte |
| Ce qu'on y écrit | *pourquoi je tiens* (un récit, une flamme) | *combien de fois j'ai tenu* (une marque) |
| Rythme | quand ça arrive | tous les jours, ou pas |
| Ton | des rappels, jamais du jugement | un jeu, jamais du jugement |

« Ne plus fumer » est un **serment** DRAUKHAIN ; « pas de tabac » est le
**geste** ALTHEA qui le compte. Une passerelle, pas une copie.

### 1.3 Collision de FORME — un cadran n'est pas une boussole

**✅ Tranché par Paul : ALTHEA est le 3ᵉ cadran d'ULTIMA Lv3**, aux côtés de
**GRIMA** (« ce qui est utile ») et **NAGA** (« ce qui fait grandir »). Il n'est
rangé sous aucune des deux devises — c'est le « tout seul » qu'il avait dicté.
Concrètement : `ultima-perso.enfants = ['grima', 'naga', 'althea']`, chemin
*accueil → ULTIMA → ALTHEA*.

Règle Lv3 §2.1 : **est une boussole tout nœud qui a au moins deux enfants ;
reste un outil toute feuille.** ALTHEA n'a qu'une porte → **c'est une FEUILLE**,
`althea.html`. Le cadran **ressemblera** à une rose de caps ; il ne doit pas s'y
**confondre**, sinon Paul cliquera en croyant naviguer. Parade : l'anneau de
progression et le cœur-bouton, que la boussole n'a jamais (§9).

### 1.4 Collision d'AGENT — le Système parle-t-il ? (**la question d'architecture**)

Principe verrouillé le 2026-07-16 : **l'agent unique d'Ultima est Léo.** Un
Système qui converse serait un second personnage — et casserait le principe le
plus structurant de toute la plateforme.

> **✅ Tranché par Paul (2026-08-06) : « on garde Léo dans le Système, c'est
> Léo qui pilote le Système, c'est important ».**
>
> **Le Système, c'est Léo en tenue de jeu.** Ce n'est pas une seconde entité :
> c'est la façon dont Léo se manifeste dans ALTHEA. Paul l'écrit lui-même —
> *« Léo (le système) »*. Le principe de l'agent unique n'est donc pas
> contourné, il est **habillé**.
>
> Ce qui reste vrai de l'analyse : **deux registres de parole, une seule
> voix.** Léo **parle** (elle guide, elle compose, elle explique, dans son
> cartouche comme partout ailleurs dans Ultima) ; le Système **annonce** — des
> **gabarits fixes** en clair dans le code, `[ RANG ATTEINT — LA CONSTANCE ]`.
> L'annonce est **le ton de cérémonie que Léo prend** quand quelque chose se
> franchit, pas quelqu'un d'autre qui prendrait la parole.
>
> **Conséquence pratique — Léo est PRÉSENTE à l'écran d'ALTHEA**, son cartouche
> compris. Un ALTHEA où l'on n'entendrait que des crochets serait un ALTHEA sans
> Léo, et ce n'est pas ce que Paul a demandé. Répartition sans zone grise :
>
> | | **Léo qui parle** — le cartouche | **Le Système qui annonce** — les crochets |
> | --- | --- | --- |
> | Compose les quêtes et les skills | ✅ elle connaît Paul | ❌ |
> | Conseille, relance, explique | ✅ | ❌ |
> | Annonce un rang, un titre, un gel | ❌ | ✅ gabarits fixes |
> | Coût en IA | oui, borné et gaté | **zéro** |
> | Déterministe / testable au harnais | non | **oui, entièrement** |
>
> C'est **la même personne dans deux registres** — comme on hausse la voix pour
> proclamer et qu'on la baisse pour conseiller.

**Ce que ça règle au passage, et qui n'est pas mince** : toutes les annonces
sont **gratuites, hors-ligne et vérifiables au harnais**. Seule la composition
d'une quête ou d'un skill coûte un appel IA — donc seule elle est à borner
(§8.3). ALTHEA reste donc entièrement utilisable **sans un centime d'IA** : le
jeu tourne, seule la proposition de nouveauté s'arrête.

### 1.5 Collision de PÉRIMÈTRE — « quête principale » contre ZEKROM et DRAUKHAIN

**C'était le vrai danger du Système.** Une « quête principale », spontanément,
c'est un grand objectif de vie. Or les grands objectifs de vie ont **déjà** deux
maisons dans Ultima : **ZEKROM** (les idéaux, le cap directionnel) et
**DRAUKHAIN** (les serments, la volonté). Laisser ALTHEA s'en remplir, c'est
reconstruire un tiers d'Ultima **à l'intérieur d'un jeu** — et se retrouver avec
deux vérités contradictoires sur ce que Paul veut vraiment.

J'avais proposé de résoudre ça **par un lien** : la quête principale aurait
*référencé* un idéal ZEKROM. **Paul a tranché autrement, et c'est mieux :**

> **✅ « Attention, je ne veux pas forcément de liens avec le reste d'Ultima :
> ALTHEA est davantage un jeu pour la vie quotidienne, donc très réel et
> concret. »**

**ALTHEA est AUTONOME.** Aucune passerelle imposée, aucun objet d'un autre
quadrant requis pour jouer. La frontière ne tient plus par un **lien** — elle
tient par la **nature de ce qu'on y met**, ce qui est plus simple et plus
solide :

| | ZEKROM / DRAUKHAIN | ALTHEA |
| --- | --- | --- |
| Registre | l'**idéal**, le **serment** — ce qui oriente une vie | le **quotidien concret** — ce qui se fait aujourd'hui |
| Horizon | des années | un jour, une semaine |
| Ce qu'on y écrit | *ce que je veux devenir* | *ce que j'ai fait, et ce que j'entreprends de faire* |
| Test d'appartenance | ça se médite | **ça se coche** |

**Le test d'appartenance d'ALTHEA, en une question** : *est-ce que ça se coche
un soir ?* Si oui, c'est ici. Sinon, c'est ailleurs.

Une **quête principale** ALTHEA reste donc un arc long — mais un arc long
**concret** : *« marcher 200 km cette année »*, *« tenir une conversation de dix
minutes en japonais »*. Elle vit **entièrement dans ALTHEA**, sans dépendre de
rien.

**Ce que la décision de Paul supprime, concrètement** : les colonnes `ideal_id`
et `serment_id` des quêtes (§8.2) et toute lecture croisée vers ZEKROM ou
DRAUKHAIN. Une passerelle restera **possible un jour** — mais elle sera
**facultative, tardive, et jamais nécessaire pour jouer**. Bénéfice qui n'était
pas cherché : ALTHEA devient **livrable seul**, sans qu'aucun autre quadrant
n'ait à bouger.

## 2. Ce qu'est ALTHEA, en une phrase

> **ALTHEA est le Système où les gestes répétés de Paul font monter son
> personnage** — le corps et l'esprit, la langue et le sport, la garde et la
> pratique. Léo y compose et y conseille. Le Système y annonce. Ni l'une ni
> l'autre n'y juge jamais.

**Et c'est un jeu, pas un tableau de bord.** Paul l'a tranché en refusant de le
ranger sous GRIMA (« ce qui est utile ») ou NAGA (« ce qui fait grandir ») :
*« tout seul : c'est un autre système, c'est plutôt un jeu qu'autre chose »*.
Conséquence non décorative : **ALTHEA n'obéit pas aux mêmes lois que le reste
d'Ultima** — l'anglais y est admis, le registre visuel y prend une liberté
(§10), et sa mesure de réussite n'est pas « la donnée est juste » mais **« Paul
a envie de l'ouvrir »**.

---

## 3. La constitution d'ALTHEA — six règles cardinales

Chacune, si on l'oublie, tue le quadrant en trois semaines. Ce sont les critères
de réussite autant que les garde-fous. **La sixième est née du Système.**

1. **Un jour non renseigné n'est pas un échec.** Trois états et trois seulement :
   *nourri* · *manqué (déclaré par Paul)* · *non renseigné*. Le troisième ne
   s'infère jamais dans les deux autres. Paul a dit « ce n'est pas obligatoire » :
   un système qui transforme le silence en faute contredit sa dictée.
2. **Un rang acquis ne se perd jamais.** La gravure reste. Seul **l'élan**
   respire — il redescend, il ne détruit rien. Le contraire exact du *streak*
   qu'on abandonne après le premier trou.
3. **Aucun jugement.** Héritage de DRAUKHAIN (« des rappels, pas du jugement »).
   Le Système dit *« il te manque trois jours pour La Constance »*, jamais
   *« tu as encore raté »*. **Une quête non tenue ne échoue pas : elle
   s'endort** (§6.3).
4. **Le compteur ne ment pas.** Un jour = une ligne, unicité en base ; jamais de
   jour futur ; le rattrapage d'une semaine passée est permis mais reste **un
   geste explicite**.
5. **ALTHEA porte la donnée la plus intime d'Ultima.** Tabac, alcool, corps,
   psychisme : de la donnée de santé. Elle ne sort pas du quadrant (§8).
6. **Le Système ne prend jamais la main tout seul.** Il **propose**, Paul
   **accepte** — c'est le motif « les mains de Léo » (2026-07-30), appliqué au
   jeu. Aucune quête ne s'inscrit dans le dos de Paul, aucune récompense ne se
   décide à sa place, aucun rappel ne part sans qu'il l'ait armé.

---

# PARTIE II — LE SYSTÈME

## 4. L'étude — de quoi un « Système » est-il fait ?

Décomposition de ce que la dictée demande, avant de décider quoi que ce soit.
La grammaire de *Solo Leveling* tient en **six organes**. Paul les a tous
nommés — ce qui est le signe que le modèle mental est complet chez lui.

| # | Organe | Ce que ça fait | Dicté par Paul |
| --- | --- | --- | --- |
| ① | **Le personnage** | une identité qui progresse : niveau, **titre**, état | *« un titre important, une sorte d'avatar »* |
| ② | **Les skills** | ce qu'on entraîne, ce qui monte, ce qu'on **débloque** | *« renseigner tous mes skills, débloquer de nouveaux skills »* |
| ③ | **Les quêtes** | ce qu'on entreprend : principales, secondaires, **de fond** | *« quêtes principales, quêtes secondaires »* |
| ④ | **La génération** | le Système qui **propose** la suite, au fur et à mesure | *« qu'il me génère des quêtes secondaires, des allongements »* |
| ⑤ | **Les récompenses** | ce qu'on gagne, symbolique et réel | *« les récompenses également »* |
| ⑥ | **L'interpellation** | rappels, widget, badge — le Système qui **vient à toi** | *« des rappels automatiques, des widgets »* |

### 4.1 La boucle de jeu — ce qui fait que c'est « complet »

Paul demande **un système complet**. Un système est complet quand **sa boucle se
referme** : chaque organe alimente le suivant, et le dernier relance le premier.

```
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   ▼                                                          │
UNE QUÊTE  ──donne──▶  UN SKILL  ──se nourrit de──▶  DES GESTES
(entreprise)           (débloqué)                    (quotidiens)
                                                          │
                                                          ▼
   ┌──────────────────────────────────────────────  UN RANG
   │                                                (jours nourris)
   │                                                     │
   ▼                                                     ▼
DE NOUVELLES QUÊTES  ◀──ouvre──  UN TITRE  ◀──débloque──┘
(proposées par Léo)              (porté par l'avatar)
```

**Cette boucle est le cœur du cadrage.** Elle dit, en une image, pourquoi
ALTHEA n'est pas un tracker d'habitudes de plus : *une quête donne un skill, le
skill se nourrit de gestes, les gestes font un rang, le rang débloque un titre,
le titre ouvre de nouvelles quêtes.* Tout ce qui n'entre pas dans cette boucle
n'entre pas dans ALTHEA — c'est le test d'appartenance du quadrant.

### 4.2 Passif et proactif — la définition exacte

Paul demande *« à la fois proactif et passif »*. Les deux mots ont un sens
précis ici, et ils ne sont pas symétriques.

- **PASSIF** — le Système **enregistre et attend**. Il compte, il cumule, il
  grave. Tu ouvres quand tu veux, tu vois où tu en es, tu ne dois rien. C'est
  l'état par défaut, et **c'est celui qui doit rester agréable sans effort** :
  un ALTHEA qu'on n'ouvre pas pendant deux semaines doit être **beau à
  retrouver**, pas accusateur.
- **PROACTIF** — le Système **vient à toi** : un rappel d'entraînement, une
  quête proposée, un rang à trois jours, un titre débloqué. C'est là que tout
  se gagne ou se perd, parce que c'est là qu'on désinstalle.

**La loi des interpellations** (elle se décide maintenant, pas à l'usage) :

1. **Une seule interpellation par jour**, au maximum. Deux notifications, c'est
   une application qu'on éteint.
2. **Toujours actionnable** : une interpellation propose **un geste précis**,
   jamais un constat (« nourris JAPONAIS » et pas « tu n'as rien fait »).
3. **Jamais culpabilisante** (règle cardinale 3). Le Système annonce ce qui
   **s'ouvre**, jamais ce qui **manque**.
4. **Toujours coupable** — au sens propre : un réglage éteint tout, en un geste,
   sans négociation et sans « es-tu sûr ? ».
5. **Le silence est une réponse valide.** Aucune relance de relance.

---

## 5. ① Le personnage — l'avatar et le titre

Paul insiste : *« j'ai un titre important »*. Le titre est **l'identité du
personnage**, pas un badge parmi d'autres.

- **Un seul titre porté à la fois**, choisi par Paul **parmi ceux qu'il a
  débloqués**. C'est un choix, donc c'est une expression de soi — et c'est ce
  qui rend un titre désirable.
- **Le titre se grave en tête d'ALTHEA**, sous le nom du personnage.
- **Le niveau** est **dérivé, jamais stocké** : il se recalcule des jours
  nourris et des quêtes accomplies. Une donnée dérivée qu'on stocke finit
  toujours par mentir (leçon déjà payée sur les paliers).

### 5.1 Le catalogue des titres — en code, pas en base

Les titres et **leurs conditions de déblocage** vivent dans un **module ES pur**
(`js/althea-titres.mjs`), au même motif que `js/blasons.mjs` et
`js/registre-lv3.mjs`. La base ne garde que **le fait** : « ce titre a été
obtenu, ce jour-là ». Trois bénéfices, et ce sont des bénéfices réels :
les conditions sont **testables sans navigateur ni base**, un titre s'ajoute
**sans migration**, et aucune règle de jeu ne dort dans une colonne.

**Premiers titres proposés** (le catalogue s'étoffera — c'est le principe) :

| Titre | Se débloque quand… |
| --- | --- |
| *Sans titre* | l'état de départ. Il n'est pas vide : il est **à remplir**. |
| **L'Éveillé** | un premier skill atteint le rang I. |
| **Celui qui revient** | une garde reprise **après avoir été rompue**. |
| **Le Constant** | un élan de 30 jours sur n'importe quel skill. |
| **Le Polyglotte** | deux langues au rang II. |
| **L'Infatigable** | trois skills nourris le même jour, sept jours de suite. |
| **Celui qui ne rompt pas** | un élan de 100 jours. |

> **« Celui qui revient » n'est pas un titre de consolation — c'est le titre le
> plus important du catalogue.** Il récompense exactement ce que tout système de
> série punit : le retour après la rupture. Il inscrit la règle cardinale 2 dans
> la mécanique de jeu au lieu de la laisser dans un document. Un système qui
> récompense le retour est un système qu'on ne quitte pas.

---

## 6. ③ Les quêtes

### 6.1 Trois types, trois natures — dictés par Paul

| Type | Ce que c'est | Durée | Exemple |
| --- | --- | --- | --- |
| **Principale** | l'arc long. Reflet jouable d'un idéal ZEKROM / serment DRAUKHAIN (§1.5). **Une à trois actives**, pas plus. | mois | *« Tenir une conversation en japonais »* |
| **Secondaire** | bornée, concrète, **récompensée**. Créée par Paul **ou proposée** par Léo. | jours / semaines | *« 5 séances de japonais cette semaine »* |
| **De fond** | la récurrente : elle ne s'achève pas, elle **se poursuit**. C'est le lien direct avec les skills. | continue | *« nourrir PEAK PERFORMANCE »* |

Les « **4 secondaires ou 4 de fond à continuer** » de la dictée sont exactement
les deux compteurs que le widget affichera (§7.4).

### 6.2 Une quête donne un skill — le déblocage

> **✅ Tranché par Paul : « les skills, je les détermine — ou Léo (le Système)
> en détermine, en récompense à des quêtes ».**
>
> **Deux origines, jamais une seule.** Paul **crée** ses skills quand il sait ce
> qu'il veut travailler ; **Léo en compose** quand elle voit une quête mériter
> mieux qu'un merci. Un skill offert en récompense est **la plus forte
> récompense du jeu** — elle ne se consomme pas, elle **ouvre**.
>
> Conséquence sur la v1 : **la liste de départ n'a pas à être complète.** Trois
> ou quatre skills suffisent à commencer, le reste **se gagne**. C'est ce qui
> lève le bloquant que je croyais avoir (§13).

Mécanique retenue :

- Un skill peut naître **verrouillé** (`verrouille = true`) : il se voit sur le
  cadran, **grisé, nommé**, avec la quête qui l'ouvre. **Voir ce qui est
  verrouillé est la moitié du plaisir** — un skill caché ne donne envie de rien.
- Achever la quête qui le porte **le déverrouille**, et le Système l'annonce :
  `[ SKILL DÉBLOQUÉ — ESPAGNOL ]`.
- Un skill déverrouillé **ne se reverrouille jamais** (règle cardinale 2).

### 6.3 Le cycle de vie d'une quête

```
proposée ──(Paul accepte)──▶ acceptée ──(Paul achève)──▶ accomplie ──▶ [allongement proposé]
    │                            │
    │                            └──(échéance passée)──▶ ENDORMIE ──(Paul reprend)──▶ acceptée
    └──(Paul décline)──▶ déclinée                                └──(Paul range)───▶ rangée
```

**Il n'y a pas d'état « échouée ».** Une quête dépassée **s'endort**, et le
Système le nomme sans reproche : `[ QUÊTE ENDORMIE DEPUIS 12 JOURS ]`. **Ranger
une quête n'est pas un échec** — c'est une décision, et c'est même le geste
sain : on ne garde pas dix engagements morts pour se donner l'illusion d'en
avoir dix.

### 6.3bis La sévérité — LE GEL DU SYSTÈME ⚠️

> **✅ Tranché par Paul : « ok pour l'endormissement, mais aussi un peu de
> sévérité si je rate trop souvent ».**

Le défi est réel : ajouter une morsure **sans** violer la règle cardinale 1
(le silence n'est pas une faute) ni la 3 (aucun jugement). La ligne qui rend les
deux compatibles :

> **La sévérité ne vient JAMAIS du Système. Elle vient d'un engagement que Paul
> a pris lui-même.**
>
> On ne peut manquer que ce qu'on a **accepté**. Un jour non renseigné ne
> déclenche rien, jamais. Une **quête acceptée** puis laissée à l'abandon,
> plusieurs fois, oui — parce que c'est Paul qui a dit oui.

**Le mécanisme — le gel.**

- **La dette** = le nombre de quêtes **acceptées** et laissées **endormies** sans
  être ni reprises ni rangées. Elle ne compte que des engagements.
- **Le seuil : trois.** À la troisième, **le Système gèle**, et il l'annonce
  franchement : `[ SYSTÈME EN SOMMEIL — TROIS ENGAGEMENTS LAISSÉS ]`.
- **Trois effets, et pas un de plus :**
  1. **Le flux se coupe.** Plus aucune quête proposée, plus aucun allongement.
     Ce n'est pas une punition arbitraire, c'est logique : **on ne charge pas
     une table déjà pleine.**
  2. **Le titre est suspendu.** L'avatar ne porte plus son titre mais
     **« En dette »**. Les titres gagnés ne sont **pas perdus** — ils sont
     **inaccessibles** le temps du gel.
  3. **La lumière tombe.** Le cadran se désature, le bleu du Système se ternit.
     En forme B (spectrale), c'est spectaculaire — et c'est **une seule classe
     CSS**, donc gratuit.
- **La sortie tient en un geste par quête** : *reprendre* ou *ranger*. Dès que
  la dette repasse sous trois, le gel se lève et le Système le dit :
  `[ SYSTÈME RÉVEILLÉ ]`.

**Ce que le gel ne touche JAMAIS** : les rangs, les jours nourris, l'élan, les
skills débloqués, les titres obtenus. **Il touche l'ornement et le flux, jamais
l'acquis** — sinon il violerait la règle cardinale 2, et un rang qu'on peut
perdre est un rang qu'on n'ose plus viser.

**Le second cran, si Paul veut que rater un entraînement morde aussi** : une
**quête de fond peut porter une exigence** — *« nourrir SOUFFLE au moins 4 jours
sur 7 »*. La manquer alimente alors la dette. Mais remarque bien ce qui se
passe : **c'est toujours Paul qui a armé la sévérité**, en acceptant une quête
qui la contenait. Le Système n'invente aucune exigence. → **Décision D12 (§12).**

> **Pourquoi le gel est la bonne sévérité, et pas la perte de niveau** :
> il fait mal **sur-le-champ** (le titre tombe, la couleur meurt, le jeu se
> tait), il se répare **en trois clics**, et il ne détruit **rien** de ce qui a
> été gagné. Une sanction dont on ne peut pas sortir n'est pas une sanction :
> c'est une raison d'arrêter de jouer.

### 6.4 ④ La génération et les allongements

Dicté : *« qu'il me génère des quêtes secondaires, des allongements de quête,
toujours les choses au fur et à mesure »*.

- **C'est Léo qui compose** (elle connaît Paul, ses skills, son élan, ses
  idéaux), **le Système qui annonce** (§1.4).
- **Elle propose, Paul accepte** (règle cardinale 6) — d'un seul geste, pour ne
  pas casser la sensation.
- **L'allongement** est une quête **enfant** (`parent_id`) : achever *« 5 séances
  cette semaine »* fait proposer *« 10 séances ce mois-ci »*. C'est le « au fur
  et à mesure » — la chaîne ne se voit **jamais d'avance**, elle se déroule.
- **Ce que Léo reçoit pour composer** : des **comptes et des intitulés de
  quêtes**, jamais un geste sensible, jamais un contenu (§8.2).
- **Bornage** : au plus **une composition par jour**, déclenchée à l'ouverture du
  quadrant ou par un geste explicite de Paul. **Jamais de boucle de fond** — le
  proactif ne doit pas devenir un robinet ouvert sur un compte payant (§8.3).

### 6.5 ⑤ Les récompenses

- **Symbolique, automatique** : le rang, le titre, le sceau qui s'allume,
  l'annonce du Système. Gratuit, immédiat, et déjà une récompense.
- **Réelle, déclarée par Paul** : *« au rang III de japonais, je m'offre X »*.
  Un texte que **Paul** pose ; le Système l'annonce au franchissement ; Paul la
  marque *réclamée*. **Ultima ne décide jamais d'une récompense à sa place** —
  ce serait à la fois présomptueux et le meilleur moyen de rendre la récompense
  sans valeur.

---

## 7. ⑥ L'interpellation — ce que la plateforme permet VRAIMENT

**C'est ici que l'étude doit être honnête plutôt qu'enthousiaste.** Paul demande
des rappels automatiques et des widgets d'écran d'accueil. J'ai vérifié l'état
réel du repo et les contraintes iOS avant d'écrire une ligne de promesse.

**État constaté du repo** : `manifest.webmanifest` existe (`display: standalone`,
une icône SVG) · **aucun service worker** · `vercel.json` ne contient que
`cleanUrls` (**aucun cron**) · CSP `script-src 'self' https://unpkg.com`.

### 7.1 Le verdict, sans enrobage

| Ce que Paul demande | Faisable ? | Ce que ça exige réellement |
| --- | --- | --- |
| **Rappel automatique** (notification) | ✅ **oui** | PWA **installée sur l'écran d'accueil** (obligatoire sur iOS) + **service worker** + Web Push VAPID + un déclencheur horaire. Rien de tout ça n'existe aujourd'hui. |
| **Badge chiffré sur l'icône** — « 4 » | ✅ **oui**, et c'est le plus proche de ce qu'il décrit | même PWA installée + `navigator.setAppBadge`. **Un seul chiffre**, pas de texte. |
| **Vrai widget iOS** (tuile sur l'écran d'accueil) | ❌ **non** depuis une PWA | iOS **n'autorise aucun widget** à une application web. Il faudrait une app native (App Store, compte développeur payant) **ou** passer par l'app tierce **Scriptable** (§7.4). |

> **Je ne vais pas te vendre un widget que la plateforme n'autorise pas.** Ce
> qu'iOS te donne réellement sur l'écran d'accueil, c'est **l'icône d'Ultima avec
> un chiffre dessus** — et c'est déjà, presque mot pour mot, ce que tu décris :
> le rappel muet de ce qui reste à continuer.

### 7.2 Le déclencheur horaire — et sa gate

Un rappel « automatique » suppose que **quelque chose s'exécute sans Paul**.
Deux voies, et une seule est propre :

- **Vercel Cron** (`crons` dans `vercel.json`) : une route serveur appelée à
  heure fixe, qui envoie les push dues. C'est la voie juste. ⚠️ **La fréquence
  autorisée dépend du plan Vercel du projet — c'est une gate coût, donc une
  décision de Paul, jamais une initiative de Léo.**
- **Une planification côté client** (le service worker qui se réveille) : iOS ne
  la garantit pas. **Écartée** — un rappel qui arrive « peut-être » est pire
  qu'aucun rappel.

### 7.3 Ce que le rappel a le droit de dire

Un rappel push s'affiche **sur l'écran verrouillé**, potentiellement devant
quelqu'un. Or ALTHEA porte du tabac, de l'alcool, du psychisme.

> **Règle absolue : une notification ALTHEA ne nomme JAMAIS un geste.**
> Elle dit `[ SYSTÈME — un entraînement t'attend ]`. Elle ne dit jamais
> *« tu n'as pas coché "pas d'alcool" »*. Le détail vit **derrière la session**,
> jamais sur l'écran verrouillé. Cette règle s'éprouve **par l'ABSENCE** au
> harnais, exactement comme pour l'IA et le cockpit.

### 7.4 Le widget, si Paul le veut vraiment — et son prix

Il existe une voie réelle : **Scriptable** (app iOS gratuite) affiche un widget
qui lit un JSON. Il faudrait donc une route **en lecture seule, signée par un
jeton porté par le téléphone**.

**Le prix, dit franchement** : ce jeton est **un identifiant permanent stocké
dans une app tierce**. C'est la première fois qu'Ultima poserait une clé hors de
sa propre session. Si Paul le veut, les conditions ne sont pas négociables :
**jeton distinct, révocable en un geste, portée en lecture seule, et ne
renvoyant QUE des entiers** — `{ secondaires: 4, fond: 4 }`, jamais un nom de
quête, jamais un nom de skill. → **Décision D10 (§12).**

---

# PARTIE III — LA MÉCANIQUE

## 8. Le modèle de données (esquisse — **aucune migration écrite en B0**)

Motif standard du schéma : RLS dès la création, une policy **par opération**,
`owner_id` NOT NULL default `auth.uid()`, condition `(select auth.uid())` pour
l'advisor initplan, CHECK d'énumération miroir de la validation API, FK
**composites scellées** `(owner_id, id)` au motif AD-4 de `0008`/`0009` — rien ne
peut se raccrocher à l'objet d'un autre propriétaire.

### 8.1 Les deux étages du skill (acquis de la première dictée)

Paul a répondu, sur le périmètre v1 : **« on livre les skills : leurs noms, et
ce qu'il y a dedans »**. Ce *« ce qu'il y a dedans »* a corrigé le modèle avant
la première ligne de code. Relecture de la dictée d'ouverture à sa lumière :
*« le talent, ce sera peak performance […] je n'ai pas fumé, je n'ai pas bu »*.
**Peak performance n'est pas un compteur, c'est un contenant.**

> - **Le SKILL** — ce qui porte un nom, un blason, un rang et des paliers.
>   *Peak performance. Japonais. Espagnol. Sport.*
> - **Le GESTE** — ce qu'on coche dans une journée. *Pas de tabac. Pas
>   d'alcool. 30 min de japonais.* **Un geste n'a pas de rang** : il nourrit.

**Deux natures de geste** : `pratique` (« j'ai pratiqué », + minutes
facultatives) et `garde` (« j'ai tenu »). La nature vit sur le **geste**, pas
sur le skill — rien n'interdit un skill mixte.

**Ce qui compte : le jour nourri, pas le point.** Un point est arbitraire et se
gonfle ; un jour est un fait. Les minutes **ornent** (« 42 h de japonais »),
elles ne font pas monter le rang — sinon on récompense qui *déclare* des heures.

**Règle de nourriture d'un skill**, deux valeurs et pas trois : `tous` (défaut —
le jour compte si **tous** les gestes sont tenus ; le bon réglage pour *peak
performance* : une journée sans tabac mais arrosée n'en est pas une) ou `un`
(au moins un geste ; le bon pour *sport*, qui a plusieurs portes).

**Les cinq rangs** — seuils **par skill**, modifiables ; noms communs, c'est ce
qui fait la langue du quadrant :

| Rang | Nom | Seuil par défaut (jours nourris) |
| --- | --- | --- |
| I | **L'Éveil** | 7 |
| II | **La Constance** | 30 |
| III | **L'Endurance** | 90 |
| IV | **La Maîtrise** | 180 |
| V | **Le Renom** | 365 |

**L'élan** = la série de jours nourris en cours, au niveau du skill. Il
s'affiche, il motive, **il ne détruit rien** quand il retombe. Le **meilleur
élan** reste gravé comme un record.

### 8.2 Les tables

| Table | Ce qu'elle porte |
| --- | --- |
| **`althea_avatar`** | une ligne par propriétaire : `nom`, `titre_code` (le titre **porté**), `reglages` (rappels on/off, heure). **Pas de niveau, pas de dette** — les deux sont **dérivés** (§8.3-1). |
| **`althea_titres_obtenus`** | `code`, `obtenu_le`. **Le fait seulement** ; les conditions vivent en code (§5.1). |
| **`althea_skills`** | `nom`, `blason`, `seuils` (5 entiers croissants), `nourriture` (`tous`\|`un`), `verrouille`, `actif`. **L'étage qui progresse.** |
| **`althea_gestes`** | `skill_id`, `libelle`, `nature` (`pratique`\|`garde`), `mesure` (`presence`\|`duree`), `rang_affichage`, `actif`. **Aucun compteur ici.** |
| **`althea_paliers`** | `skill_id`, `rang` (1..5), `recompense` (texte), `reclame_le`. On ne stocke **pas** « atteint » : c'est dérivé. |
| **`althea_releves`** | `geste_id`, `jour`, `tenu`, `minutes`, `mot` (court). **Unicité (owner, geste, jour)** ; `jour <= current_date` ; **pas de ligne = non renseigné** (règle 1 exprimée dans le schéma, pas seulement dans l'UI). |
| **`althea_quetes`** | `type` (`principale`\|`secondaire`\|`fond`), `titre`, `intention`, `etat` (`proposee`\|`acceptee`\|`accomplie`\|`endormie`\|`rangee`\|`declinee`), `origine` (`paul`\|`leo`), `echeance`, `exigence` (le second cran de sévérité, facultatif), `parent_id` (l'allongement), `debloque_skill_id`, `recompense`. **Aucune colonne vers un autre quadrant** — ALTHEA est autonome (§1.5). |
| **`althea_aptitudes`** | `code`, `nom`, `siege` (tête, poitrine, cœur, ventre, membres), `skill_id` (celui qui la nourrit). **Aucune valeur stockée** : le niveau d'une aptitude est **dérivé** du skill qui la nourrit (§13ter). Comme le niveau, comme la dette : *une donnée dérivée qu'on stocke finit toujours par mentir.* |
| **`althea_interpellations`** | le journal de ce que le Système a envoyé : `jour`, `motif`. **Sa raison d'être : faire respecter la loi des interpellations** (une par jour, jamais deux fois la même) — une règle qu'on n'écrit nulle part est une règle qu'on n'applique pas. |
| **`althea_abonnements_push`** | (boucle rappels) l'abonnement Web Push du téléphone. |

Une **vue dérivée** `althea_progression` en `security_invoker`, **par skill** :
jours (ou semaines) tenus au sens des cadences, élan courant, meilleur élan,
rang atteint, **et l'état du jour — `tenu` / `en sommeil`**.

> **La distinction qui sort des skills réels : ACQUIS ≠ TENU.**
> *« Le joueur court au moins 10 km par semaine »* est vrai ou faux **cette
> semaine**. Le skill peut donc **dormir** — et pourtant **rien n'est perdu** :
> son rang, ses semaines tenues, son meilleur élan restent gravés. La règle
> cardinale 2 s'énonce donc plus précisément qu'avant : **l'ACQUIS ne se perd
> jamais ; l'ÉTAT, lui, respire.** Un skill en sommeil n'est pas une faute :
> c'est une phrase qui n'est pas vraie aujourd'hui, et qui peut le redevenir
> demain.

### 8.3 Les pièges déjà identifiés — trouvés en écrivant le modèle

1. **Un rang qui bougerait tout seul.** Désactiver un geste change
   rétroactivement le sens du passé (un jour jadis « à moitié tenu » devient
   « tenu ») — le rang pourrait **monter sans que Paul ait rien fait**, ce qui
   viole la règle 2 dans l'autre sens. **Parade** : `actif=false` ne vaut qu'à
   partir du jour de la désactivation ; le calcul ne considère que les gestes
   actifs **à la date du jour considéré**. *On ne voit ce piège qu'en écrivant
   le modèle, jamais en écrivant l'écran.*
2. **Le fuseau.** « Aujourd'hui » est une date locale (Europe/Paris), décidée
   côté client et **validée serveur** — sinon un relevé de 23 h 40 se range la
   veille selon l'humeur d'UTC, et le compteur ment (règle 4).
3. **Les CHECK conditionnels** (`etat`, `parent_id`, `echeance`) se testent
   **par le REFUS et sur le cas NULL d'abord** : la logique ternaire SQL laisse
   passer en silence ce qu'on croit interdire (leçon `0020`/`0021`).
4. **Le robinet IA.** Une génération quotidienne non bornée est un coût qui
   court sans surveillance. **Parade** : au plus une composition par jour, sur
   ouverture ou geste explicite ; jamais de boucle de fond ; le compteur de
   générations vit en base et le refus est **serveur**, pas client.
5. **Les cadences se calculent sur une FENÊTRE, pas sur une date.** « Tous les
   2 jours » et « 10 km par semaine » se lisent sur une fenêtre glissante — et
   une fenêtre glissante mal bornée compte deux fois le même relevé ou en oublie
   un au changement de semaine. **Parade** : la fenêtre est **fermée à gauche,
   ouverte à droite**, en date locale, et le harnais l'éprouve **sur un
   changement de semaine et sur un changement d'heure d'été** — pas sur une
   semaine ordinaire, qui ne prouve rien.
6. **La dette ne se stocke pas.** Tentation immédiate : une colonne `dette` sur
   l'avatar. Ce serait un compteur **désynchronisable** — il suffirait qu'une
   quête change d'état sans passer par le bon chemin pour que Paul soit gelé
   sans raison, ou dégelé à tort. **Parade** : la dette et le gel sont
   **entièrement dérivés** de l'état des quêtes, calculés en vue. Même règle que
   pour le niveau et les paliers : *une donnée dérivée qu'on stocke finit
   toujours par mentir* — et ici, elle mentirait en punissant.

---

## 9. La sécurité — le quadrant le plus sensible d'Ultima

RIVEN est de la PII. ALTHEA est de la **donnée de santé** : consommation de
tabac et d'alcool, état psychique. Et le Système lui **ajoute trois surfaces**
qu'aucun autre quadrant n'a : une notification qui s'affiche **hors session**,
un appel IA **qui compose**, et peut-être un jeton **hors de l'application**.

- **RLS** partout, sans exception. Le libellé d'un geste (« pas de tabac ») est
  aussi sensible que le nom du skill qui le porte : les deux étages sont
  protégés à l'identique, aucun n'est « juste une étiquette ».
- **Cockpit** : ALTHEA n'expose que des **entiers**. Jamais un intitulé —
  l'intitulé *est* l'information.
- **Les yeux de Léo** (`/api/leo`, champ `etat`) transportent aujourd'hui
  « comptes **et intitulés** bornés ». **Pour ALTHEA, les intitulés de gestes
  sont exclus.** Les **titres de quêtes** peuvent partir (Léo en a besoin pour
  composer un allongement cohérent) ; **les gestes, jamais**. Exception à écrire
  dans `validerEtatQuadrant` — pas une consigne de prudence, une règle de code.
- **Notifications** : ne nomment jamais un geste (§7.3).
- **Widget** : jeton distinct, révocable, lecture seule, **entiers uniquement**
  (§7.4).
- **Preuve par l'ABSENCE** (règle 2026-07-30) : le harnais cherche le libellé
  d'un geste sensible dans **tout ce qui sort** — charge `/api/leo`, réponse
  `/api/cockpit`, corps de notification, réponse widget, HTML servi, logs — et
  **exige de ne pas l'y trouver**. Vérifier la présence du permis ne prouve rien.
- **Zéro donnée dans le HTML servi** : `althea.html` est muette (invariant Lv3).

---

# PARTIE IV — LE GRAPHISME

## 10. « Va chercher loin » — l'antique vu de nuit

### 10.1 Le problème, posé franchement

*Solo Leveling* a une signature visuelle immédiatement reconnaissable :
**fenêtres bleu spectral, hologrammes, angles nets, nuit**. Ultima a une
signature exactement inverse, **actée par Paul le 2026-07-08** : gravure à
l'encre, parchemin noble, cartouches, or antique — et le registre « ludique »
avait alors été **explicitement retiré**.

Les copier l'un sur l'autre donnerait soit un Solo Leveling au rabais, soit un
Ultima trahi. **Il faut une troisième réponse.**

### 10.2 Ce que les deux univers ont déjà en commun (et personne ne l'avait vu)

En regardant la **grammaire** plutôt que la palette, le pont est court :

| La fenêtre de Système | Ultima possède déjà… |
| --- | --- |
| capitales espacées, solennelles | les **surlignes** de tous les bandeaux |
| un cadre net qui encadre une annonce | le **cartouche** (la parole de Léo) |
| une voix impersonnelle et rituelle | la **légende gravée** sous les médaillons |
| des blocs de statistiques alignés | le **cockpit** |
| l'apparition — la fenêtre qui **surgit** | *rien : c'est ce qui manque* |
| le froid, la nuit | *rien : Ultima est diurne* |

**Il ne manque que deux choses : l'apparition et la nuit.**

### 10.3 La thèse — « le Système s'éveille la nuit »

> **ALTHEA est la seule page d'Ultima sur fond nocturne.** Le parchemin est
> retourné : l'encre y devient lumière. L'or reste l'or — les rangs, les titres,
> les sceaux gardent la couleur de toute la maison. Mais **le Système, lui,
> parle dans une unique couleur froide — un bleu spectral pâle** — et cette
> couleur n'existe **nulle part ailleurs dans Ultima**. C'est sa voix. Quand
> elle apparaît, on sait que ce n'est ni Paul ni Léo qui parle.

Ce n'est **ni une copie ni une trahison** : c'est l'antique **vu de nuit**. Et
c'est défendable en une phrase — *le Système est un instrument qui s'éveille
quand la maison dort*, ce qui est exactement ce qu'il est (§1.4).

**Les six gestes graphiques qui en découlent** — chacun justifiable, aucun
décoratif :

1. **L'apparition** — la fenêtre du Système ne s'affiche pas, elle **surgit** :
   un trait de lumière qui s'ouvre, puis le cadre, puis le texte. ⚠️ Respecte
   `prefers-reduced-motion` : sans animation, la fenêtre est simplement là.
2. **Les crochets** — la voix du Système est **toujours entre crochets** :
   `[ RANG ATTEINT — LA CONSTANCE ]`. C'est sa ponctuation, jamais celle de Léo.
3. **Les angles marqués** — le cartouche du Système a les coins **coupés**, pas
   arrondis. Un instrument n'est pas tendre.
4. **La colonne de stats** — le personnage se lit comme une fiche : NIVEAU,
   TITRE, ÉLAN, alignés, en capitales espacées.
5. **L'or pour l'acquis, le bleu pour la voix** — règle de couleur sans
   exception : ce qui est **gagné** est or ; ce qui est **annoncé** est bleu.
   Un rang ne devient jamais bleu, une annonce ne devient jamais or.
6. **Le cadran garde sa rose** — les skills restent des médaillons gravés en
   cercle, avec leur anneau de progression et leur rang en chiffres romains.
   La nuit change la lumière, pas la forme (§1.3).

**Contrainte non négociable** : contraste **AA** vérifié au harnais sur fond
nocturne — le bleu spectral pâle sur nuit est précisément le couple qui échoue
si on le choisit à l'œil. `smoke-antique` teste déjà les contrastes ailleurs.

### 10.4 La forme retenue

Les deux formes ont été maquettées et comparées sur l'image (méthode VRANESH /
DRAUKHAIN : Paul tranche sur le dessin, jamais sur une description).

> **✅ Tranché par Paul : FORME B — le Système spectral.**
> Bleu et nuit profonde dominants, l'or en accent seul. ALTHEA cesse
> visiblement d'appartenir à Ultima — cohérent avec « c'est un autre système »
> et avec l'autonomie tranchée en §1.5. **La forme A est abandonnée** ; la
> maquette de référence ne porte plus qu'une seule forme.

**Ce qui ne bouge pas malgré le choix de B** : la **règle de couleur** (l'or
pour ce qui est **gagné**, le bleu pour ce qui est **annoncé**). C'est elle qui
empêche B de devenir un dégradé bleu indifférencié où plus rien ne se distingue.
Et **le gel** (§6.3bis) s'y lit mieux que partout : quand le Système dort, la
lumière tombe.

---

# PARTIE V — LA LIVRAISON

## 11. Séquencement — une boucle à la fois (directive EB)

Le Système complet est **cinq boucles**, pas une. Les vouloir ensemble, c'est la
garantie de n'en finir aucune — et Paul a lui-même posé la règle « une boucle à
la fois, bouclée avant la suivante ».

| # | Boucle | Contenu | Pourquoi cet ordre |
| --- | --- | --- | --- |
| **B1** | **Le personnage et ses skills** | avatar + titre porté + le cadran + le relevé du jour/semaine + les paliers. **Les skills réels de Paul, posés.** | Rien n'existe sans les skills : une quête « donne un skill », un titre récompense un rang. On ne peut pas commencer ailleurs. |
| **B2** | **Le journal des quêtes** | les 3 types, le cycle de vie, le déblocage de skill, les récompenses. Quêtes **créées par Paul**. | La mécanique se prouve à la main avant qu'une IA ne s'en mêle. |
| **B3** | **La composition par Léo** | propositions de secondaires et d'allongements, bornées, acceptées d'un geste. | Elle a besoin de B1+B2 pour avoir de quoi composer. |
| **B4** | **L'interpellation** | PWA installable + service worker + badge chiffré + rappels push. **Gate coût sur le cron.** | C'est la boucle qui touche à l'extérieur : elle vient quand l'intérieur est juste. |
| **B5** | **Le widget signé** *(si Paul le veut)* | route lecture seule, jeton révocable, entiers uniquement. | Optionnelle, et la seule qui pose une clé hors d'Ultima. |

**Les passerelles ne sont plus au programme.** Paul a tranché l'autonomie
d'ALTHEA (§1.5) : le jeu se joue entier sans qu'aucun autre quadrant n'existe.
Si un pont vers RESHIRAM naît un jour (un skill mûr qui **étaye** un talent
prouvé), il sera **facultatif, en lecture seule et à sens unique** — jamais une
condition pour jouer. **Effet de bord précieux : ALTHEA est livrable seul.**

## 12. Décisions

### 12.1 Prises par Paul le 2026-08-06

| # | Question | ✅ Décision |
| --- | --- | --- |
| **D1** | Où ALTHEA s'accroche | *« Tout seul »*, puis précisé : **3ᵉ cadran d'ULTIMA Lv3**, à côté de GRIMA et NAGA (§1.3). |
| **D2** | Le mot de l'unité | **Un SKILL.** Tranche la collision avec RESHIRAM par le registre. |
| **D3** | Le moteur | **Cumul + élan.** Le rang ne se reperd jamais. |
| **D4** | Périmètre v1 | **« Les skills : leurs noms, et ce qu'il y a dedans. »** A révélé les deux étages (§8.1). |
| **D5** | L'origine des skills | **Paul les détermine, OU Léo en offre en récompense de quête** (§6.2). La liste de départ n'a donc pas à être complète. |
| **D6** | La forme visuelle | **Forme B — le Système spectral** (§10.4). La forme A est abandonnée. |
| **D7** | Léo dans le Système | **« Léo pilote le Système, c'est important. »** Le Système, c'est **Léo en tenue de jeu** ; elle reste présente et visible à l'écran (§1.4). |
| **D8** | Les liens avec Ultima | **ALTHEA est AUTONOME** — *« je ne veux pas forcément de liens : c'est un jeu pour la vie quotidienne, très réel et concret »*. Colonnes vers ZEKROM/DRAUKHAIN supprimées (§1.5). |
| **D9** | La sévérité | **Endormissement + un peu de sévérité si Paul rate trop souvent** → **le gel du Système** (§6.3bis), déclenché par les **engagements pris**, jamais par le silence. |

### 12.2 Ce qui reste à trancher

| # | Question | Recommandation de Léo |
| --- | --- | --- |
| **D10** | ~~Les skills de départ~~ | ✅ **Dictés le 2026-08-06** — les cinq du §13. |
| **D11** | ~~Le nom du personnage~~ | ✅ **Paul Gerard, niveau 48, titre *Farsight — celui qui voit loin*** (§13bis). |
| **D15** | **Le rang II s'appelle « La Constance »**, or c'est aussi le nom d'un skill de Paul. Comment renommer le rang ? | **L'ASSIDUITÉ** → L'Éveil · L'Assiduité · L'Endurance · La Maîtrise · Le Renom. *(Ou : La Régularité.)* Le skill garde son nom — c'est le tien. |
| **D16** | **Le niveau 48 est-il un socle déclaré** (ta vie compte déjà) **ou le jeu part-il de 1** ? | **Un socle déclaré.** Tu n'entres pas dans ta propre vie au niveau 1, et *Farsight* est un titre déjà gagné. |
| **D17** | **Les aptitudes** — les cinq proposées (Esprit, Souffle, Volonté, Racine, Vigueur) conviennent-elles ? | **Oui, cinq pour cinq skills** (§13ter.1). Un skill se tient, une aptitude se dérive. |
| **D20** | **L'avatar** : A (Vitruve fidèle), B (épuré) ou **C (des aptitudes)** ? | **C.** C'est le seul qui fasse du sceau un instrument de lecture au lieu d'une illustration. |
| **D21** | **La formule d'une aptitude**, et a-t-elle le droit de **descendre** ? | **Oui, lentement.** La seule chose d'ALTHEA qui puisse baisser : le rang dit ce que tu as **fait**, l'aptitude ce que tu **vaux aujourd'hui**. |
| **D18** | **Le sport apparaît deux fois** (condition de *Peak performance* tous les 2 jours, et cœur de *Pieds légers* 10 km/semaine). Voulu ? | **Probablement voulu** — deux exigences différentes sur la même activité. Mais si tu préfères, *Pieds légers* absorbe le sport et *Peak performance* n'en parle plus. |
| **D19** | **« Alimentation ok »** (condition de *Peak performance*) et **Omnivore** se recouvrent. | *Omnivore* **est** la définition d'« alimentation ok » → on retire la condition de *Peak performance* et on la remplace par « *Omnivore* est tenu ». Un second méta-lien, comme *Constance*. |
| **D12** | **Le second cran de sévérité** : une quête de fond peut-elle porter une exigence (« 4 jours sur 7 ») qui alimente la dette ? | **Oui, mais facultative.** C'est toi qui l'armes en acceptant la quête. |
| **D13** | **Le widget Scriptable** (§7.4) : on le fait, avec son jeton hors d'Ultima ? | **Le badge chiffré d'abord** (natif, sans clé, sans app tierce). |
| **D14** | **Le cron des rappels** — gate coût sur le plan Vercel. | Décision de Paul. À poser en B4, pas avant. |

## 13. Les skills de Paul — dictés le 2026-08-06

**Ce ne sont pas des compteurs. Ce sont des ÉNONCÉS.** C'est la révélation de
cette dictée, et elle change le quadrant en profondeur : Paul n'écrit pas
« japonais : 30 min », il écrit **« le joueur sait parler au moins 2 langues à
haut niveau »**. Un skill est **une phrase au présent, sur le joueur** — vraie
ou non, aujourd'hui. Le compteur n'est plus le but : il est **la preuve** que
l'énoncé tient.

### 13.1 Les cinq skills, tels que dictés

| Skill | Énoncé | Conditions | Cadence |
| --- | --- | --- | --- |
| **PEAK PERFORMANCE** | *« Le joueur est au top de sa forme ! »* | pas de recours à substance externe · sommeil en ordre · stop écran tard · alimentation ok | chaque jour |
| | | sport | **tous les 2 jours** |
| **PIEDS LÉGERS** | *« Le joueur court au moins 10 km par semaine. »* | course | **10 km / semaine** |
| **TRADUCTEUR** | *« Le joueur sait parler au moins 2 langues à haut niveau. »* | italien **OU** espagnol **OU** japonais | **30 min / jour**, l'une des trois suffit |
| **OMNIVORE** | *« Le joueur peut manger de tout. »* | des légumes · quatre repas | chaque jour |
| **CONSTANCE** | *« Le joueur se relève toujours après avoir chuté, il ne reste pas au sol. »* | **se lit sur les autres skills** | à chaque rupture |

**Évolution dictée** : **TRADUCTEUR → TRADUCTEUR UNIVERSEL** — *« savoir parler
3 langues »*. C'est le premier maillon de **l'arbre de capacités** que Paul
nommait dès sa première dictée.

### 13.2 Ce que ces cinq skills obligent à changer dans le modèle

Cinq exemples réels ont fait apparaître ce qu'aucune spéculation n'avait vu.

1. **L'ÉNONCÉ devient un champ de premier rang.** `enonce` sur le skill —
   la phrase que le Système affiche et que Léo reprend. Sans elle, ALTHEA n'est
   qu'un tableau de cases ; avec elle, c'est **une déclaration sur soi**.
2. **La CADENCE remplace « une case par jour ».** Mon modèle ne savait dire que
   *quotidien*. Les cinq skills en exigent quatre de plus :

   | Cadence | Exemple de Paul | Comment ça se compte |
   | --- | --- | --- |
   | `quotidien` | légumes, sommeil | une case par jour |
   | `tous_les_n_jours` | sport tous les 2 jours | tenu si le dernier remonte à ≤ N jours |
   | `volume_semaine` | 10 km / semaine | somme glissante sur 7 jours ≥ seuil |
   | `duree_jour` | 30 min de langue | minutes du jour ≥ seuil |
   | `n_par_jour` | 4 repas | compte du jour ≥ seuil |

3. **Les conditions peuvent être en OU.** *Italien ou espagnol ou japonais* :
   un **groupe** de conditions dont une seule suffit. Ma règle `un` / `tous`
   monte donc **d'un cran** : elle s'applique à un **groupe** de conditions, pas
   seulement au skill entier.
4. **Un skill ÉVOLUE.** `evolue_en` → un skill supérieur, débloqué quand une
   condition renforcée est atteinte. C'est l'arbre. Sur le cadran, un **chevron
   spectral** signale un skill qui peut monter.
5. **CONSTANCE est un MÉTA-SKILL.** Ses conditions ne lisent aucun geste : elles
   lisent **l'état des autres skills** (« après une rupture, reprendre »). C'est
   une catégorie neuve, et elle est précieuse — elle récompense exactement ce
   que tout système de série punit.

### 13.3 Deux points d'attention, l'un est une collision

⚠️ **« CONSTANCE » est déjà le nom du rang II** (L'Éveil · **La Constance** ·
L'Endurance · La Maîtrise · Le Renom). Un skill nommé *Constance* qui atteint
*La Constance* est une phrase que personne ne peut lire. **Le skill de Paul
gagne** — c'est le sien. Le rang II doit être renommé.
→ **Proposition : L'ASSIDUITÉ.** L'échelle devient : L'Éveil · **L'Assiduité** ·
L'Endurance · La Maîtrise · Le Renom. *(Autre option : La Régularité.)*
→ **Décision D15.**

✅ **Convergence heureuse** : *Constance* — « se relever après avoir chuté » —
**est exactement** le titre que j'avais proposé au §5.1, **« Celui qui
revient »**. Les deux disent la même chose. Ils fusionnent : **tenir le skill
CONSTANCE débloque le titre « Celui qui revient »**. Le catalogue de titres et
la liste de skills se répondent au lieu de se doubler.

### 13.4 Ce qui reste ouvert sur les skills

1. **Les seuils de rang.** 7 / 30 / 90 / 180 / 365 jours tenus, pour tous les
   skills ? *Pieds légers* se compte en semaines, pas en jours — son échelle
   devrait sans doute être **en semaines tenues** (4 / 12 / 26 / 52 / 104).
2. **Le sport apparaît deux fois** : condition de *Peak performance* (tous les
   2 jours) et cœur de *Pieds légers* (10 km/semaine). Est-ce voulu — deux
   exigences distinctes sur la même activité — ou faut-il n'en garder qu'une ?
3. **« Alimentation ok »** et *Omnivore* se recouvrent partiellement. *Omnivore*
   est-il la définition de « alimentation ok », ou deux choses différentes ?

## 13bis. Le personnage — dicté le 2026-08-06

| | |
| --- | --- |
| **Nom** | Paul Gerard |
| **Niveau** | 48 |
| **Titre porté** | **Farsight** — *« celui qui voit loin »* |
| **Sceau** | un homme de profil, tourné vers un horizon lointain (le titre fait le dessin) |

**Le titre de départ n'est donc pas *Sans titre*.** Paul entre dans le jeu avec
un titre déjà gagné — ce qui est juste : il a quarante-huit ans de vie derrière
lui, pas zéro. Le niveau 48 dit la même chose. **Conséquence de modèle** : le
niveau n'est pas seulement dérivé du jeu ; il **part d'un socle** que Paul
déclare. À confirmer (**D16**).

## 13ter. Les aptitudes — proposition (dictée « ajoute les aptitudes »)

Paul a annoncé un second registre après les skills, puis demandé de l'ajouter.
Voici la proposition ; elle n'est pas encore une décision.

> **Un skill se TIENT. Une aptitude se DÉRIVE.**
>
> On ne coche jamais une aptitude et elle n'a ni condition, ni cadence, ni
> quête. Elle **monte toute seule**, à mesure que les skills qui la nourrissent
> sont tenus. C'est **ce que le corps et l'esprit valent** — pas ce qui a été
> fait hier.

### 13ter.1 Les cinq aptitudes proposées

| Aptitude | Où elle siège | Nourrie par |
| --- | --- | --- |
| **ESPRIT** | la tête | TRADUCTEUR |
| **SOUFFLE** | la poitrine | PIEDS LÉGERS |
| **VOLONTÉ** | le cœur | CONSTANCE |
| **RACINE** | le ventre | OMNIVORE |
| **VIGUEUR** | les membres | PEAK PERFORMANCE |

**Cinq skills, cinq aptitudes, cinq points du corps.** Ce n'est pas une
coïncidence arrangée : c'est ce qui a fait choisir la forme de l'avatar (§13ter.2).

### 13ter.2 Ce que Vitruve rend possible — et qu'il ne faut pas manquer

Paul a demandé un avatar « **modèle homme de Vitruve, mais schématisé** ». Or
Vitruve **est** un corps découpé en proportions. D'où l'idée qui unifie les deux
demandes de la même dictée :

> **L'avatar EST la carte des aptitudes.** La figure porte cinq **nœuds de
> lumière** — tête, poitrine, cœur, ventre, membres — et chacun brille à la
> mesure de l'aptitude qui y siège. Le sceau du personnage cesse d'être une
> illustration : il devient **un instrument de lecture**.

**Trois propositions maquettées** (`design/preview-althea-systeme.html`), chacune
montrée **à sa taille réelle et agrandie** — *un sceau se juge à la taille où il
sera vu, pas à celle où il est beau* :

- **A — le Vitruve fidèle** : les deux poses superposées, comme chez Léonard.
  Le plus savant, le plus chargé — et c'est là son risque à 66 px.
- **B — le Vitruve épuré** : une seule pose, trait épais, presque un
  pictogramme. Le plus lisible en petit, le moins reconnaissable comme Vitruve.
- **C — le Vitruve des aptitudes** : la figure porte les cinq nœuds.
  **Recommandation de Léo**, pour la raison ci-dessus.

Dans les trois : **le cercle et le carré sont en bleu spectral** (ce sont des
tracés du Système) et **le corps reste en or** (c'est ce qui est gagné) — la
règle de couleur du §10.3 tient jusque dans le sceau.

> **Défaut trouvé à la mesure, et instructif** : la version C portait d'abord ses
> libellés **dans** le médaillon. Ils se posaient sur le carré et sur le corps —
> illisibles — et « SOUFFLE » **sortait du cadre de 21 px**. Les libellés sont
> sortis du dessin : **un médaillon de 66 px ne porte pas de texte**, et l'avatar
> réel n'en portera jamais. La légende est du HTML, à côté.

### 13ter.3 Ce qui reste à trancher sur les aptitudes

1. **La formule.** Comment un skill tenu fait-il monter son aptitude ? Piste :
   l'aptitude vaut le **rang du skill**, lissé sur la durée où il a été tenu —
   ce qui la rend lente à monter et **lente à descendre**. À trancher (**D21**).
2. **Une aptitude peut-elle DESCENDRE ?** Position de Léo : **oui, lentement.**
   C'est la seule chose d'ALTHEA qui ait le droit de baisser, et c'est
   cohérent — *le rang dit ce que tu as fait* (acquis, jamais perdu), *l'aptitude
   dit ce que tu vaux aujourd'hui*. Un corps qui ne court plus perd son souffle ;
   il ne perd pas les kilomètres déjà courus.
3. **Cinq suffisent-elles ?** Le corps de Vitruve en accueillerait deux de plus
   (les mains, les yeux). Mais **cinq skills, cinq aptitudes** est une symétrie
   qui se lit d'un coup d'œil — on n'en ajoute que si un besoin l'exige.

### 13ter.4 Deux ajustements de la fiche (dictés)

- **Les élans quittent la fiche du personnage** (« enlève les élans »). Ils ne
  disparaissent pas du jeu — l'élan reste au niveau du **skill**, là où il a un
  sens. En tête d'écran, il ne restait qu'un chiffre de plus à lire.
  La fiche porte désormais : **Niveau · Skills tenus · Aptitudes**.
- **Le titre est étiqueté** (« le titre avant Farsight ») : la ligne porte
  maintenant la clé **TITRE** au-dessus du nom du titre, comme les autres
  champs de la fiche. *Lecture retenue faute de certitude : si Paul voulait
  autre chose — un titre porté avant Farsight, par exemple — c'est à corriger.*

## 14. Le format 6 points de B1

**① But** — le personnage existe et **les skills réels de Paul y sont posés** :
nom, blason, gestes, paliers. Paul les nourrit pour aujourd'hui et pour la
semaine écoulée, voit son rang, son élan et son titre.

**② Étapes** — (a) **Paul valide les skills de départ** (§13) ; (b) la maquette
de référence est **passée en forme B** ✅ ; (c) place dans l'arbre ✅ tranchée —
entrée au registre Lv3 (`ultima-perso.enfants` + `althea`) + coque
`althea.html` ; (d) migration `0022` écrite,
**non appliquée** (gate) ; (e) `api/althea.js` + validation miroir ; (f) le
cadran, le relevé, la fiche du personnage ; (g) harnais ; (h) seed paramétré par
`owner_id` (motif RESHIRAM/ZEKROM : idempotent, jamais d'`owner_id` en dur).

**③ Moyens** — `js/registre-lv3.mjs`, `js/blasons.mjs`, `js/althea-titres.mjs`,
`js/althea-progression.mjs`, `althea.html`, `css/althea.css`, `api/althea.js`,
`api/_lib/validate.js`, `api/_lib/leo.js` (l'exception d'intitulés §9),
`supabase/migrations/0022_althea_skills.sql`, `supabase/seed-althea-paul.sql`,
`middleware.js` (chemin privé), `tests/smoke-althea.mjs`,
`tests/unit-althea-validate.mjs`, `tests/unit-althea-progression.mjs`,
`tests/unit-althea-titres.mjs`.

**④ Critères de réussite (vérifiables)** — patrimoine COMPLET vert ;
`unit-althea-progression` prouve les **six** règles cardinales **et** les deux
règles de nourriture, dont **l'absence de punition du silence** et **le passé
qu'une désactivation de geste ne réécrit pas** ; `unit-althea-titres` prouve que
**« Celui qui revient » se débloque bien sur une reprise après rupture** (le
titre qui encode la règle 2) ; géométrie du cadran mesurée contre son `viewBox`
sur **douze skills dont un à six gestes** ; contrastes **AA sur fond nocturne** ;
preuve par l'ABSENCE sur `/api/leo` et `/api/cockpit` ; un relevé pris à 23 h 40
se range au bon jour ; **nourrir un skill coûte moins de cinq secondes**, mesuré
en nombre de gestes d'interface, pas à l'œil.

**⑤ Ce qu'on ne fait PAS en B1** — les quêtes (B2), donc **ni le gel ni la
dette** (ils n'ont de sens qu'avec des quêtes), la composition par Léo (B3), les
rappels/badge/PWA (B4), le widget (B5), les jauges physique/psychique,
l'application de la migration (gate Paul). Un skill **verrouillé** s'affiche
pourtant dès B1 : c'est ce qui donne envie de la suite.

**⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »**

| Mode de défaillance | Ce qui le prévient |
| --- | --- |
| **Le Système meurt en trois semaines** — le risque n°1 de tout jeu de suivi. | Une case par geste, zéro formulaire, aucun zéro punitif, rang jamais perdu, **un titre qui récompense le retour**. Nourrir en moins de 5 s est un critère mesuré. |
| **On livre un écran vide** — la forme est prête, les skills de Paul n'y sont pas. | Étape (a) **avant** tout. Un ALTHEA sans les skills de Paul n'est pas livré. |
| **On construit les cinq boucles à la fois** et aucune n'aboutit. | Le §11, et la discipline EB. B1 ne contient **aucune** quête. |
| **Les deux étages s'écrasent** (un skill par geste, ou un skill flou). | Le §8.1 + une assertion : *peak performance* porte **plusieurs** gestes et **un seul** rang. |
| **Le Système devient un second Léo** (deux voix, principe verrouillé cassé). | §1.4 : gabarits fixes, zéro IA dans l'annonce ; assertion de harnais sur la forme `[ … ]`. |
| **ALTHEA avale ZEKROM et DRAUKHAIN** (les objectifs de vie migrent dans le jeu). | §1.5, test d'appartenance : **est-ce que ça se coche un soir ?** Si ça se médite, c'est ailleurs. ALTHEA est autonome, il n'emprunte rien. |
| **La sévérité blesse au lieu de mordre** — Paul se fait geler pour du silence et n'ouvre plus le jeu. | §6.3bis : la dette ne compte que des **engagements acceptés** ; le gel se lève en un geste par quête ; il ne touche **aucun acquis**. Assertion dédiée : *aucun jour non renseigné n'incrémente jamais la dette*. |
| **Un rang qui bouge tout seul** quand un geste est désactivé. | §8.3-1, cas de test dédié. |
| **La donnée de santé fuit** — cockpit, IA, **écran verrouillé**, widget, log. | Comptes seuls, intitulés de gestes exclus partout, **notification qui ne nomme jamais un geste**, preuve par l'ABSENCE aux six sorties. |
| **Le robinet IA coule.** | §8.3-4 : une composition par jour, refus **serveur**, jamais de boucle de fond. |
| **On promet un widget qu'iOS n'autorise pas.** | §7.1 : le verdict est écrit **avant** la promesse. Le badge est la vraie réponse ; le widget a un prix, il est dit. |
| **Le bleu spectral sur nuit échoue au contraste.** | AA vérifié au harnais, pas à l'œil (leçon « une géométrie se mesure », étendue à la couleur). |
| **On construit sur une dictée mal entendue** (« widget », « quêtes de fond », « arbre de capacités »). | Signalés au §0/§0bis, confirmés par Paul avant B1. |

## 15. État de la boucle

- **B0 — cadrage et étude** : ✅ **CLOS.** Deux dictées de fond absorbées, cinq
  collisions écrites, la boucle de jeu fermée, la réalité technique des rappels
  et du widget **vérifiée avant d'être promise**, la forme tranchée sur maquette,
  **les cinq skills réels de Paul recueillis**, le personnage nommé.
  **Zéro code d'application, zéro migration.**
- **Le cadrage a été corrigé TROIS fois par les réponses de Paul**, jamais par
  une relecture : ① *« ce qu'il y a dedans »* a révélé les deux étages ;
  ② *« pas de liens »* a rendu ALTHEA autonome ; ③ **les skills réels ont fait
  apparaître l'ÉNONCÉ, les CADENCES, l'ÉVOLUTION et le MÉTA-SKILL** — quatre
  mécaniques qu'aucune spéculation n'avait vues. *La leçon se répète : le
  cadrage ne se valide pas, il se confronte au réel de Paul.*
- **Reste avant d'ouvrir B1** : **D20** (quel Vitruve), **D15** (renommer le
  rang II), **D21** (la formule d'une aptitude), et les deux recouvrements
  **D18 / D19**. Seul D20 bloque la forme ; les autres bloquent le schéma.
- **Prochaine action unique** : Paul choisit son Vitruve (D20) et tranche D15,
  puis **B1 s'ouvre** — le personnage, le cadran, la liste des skills, les
  aptitudes, le relevé. Sans aucune quête.
