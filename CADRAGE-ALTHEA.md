# CADRAGE-ALTHEA — LE SYSTÈME

> **Deux dictées de Paul, le 2026-08-06.** La première ouvre le quadrant (le
> suivi ludique des performances physiques et psychiques). La seconde en change
> la nature : ALTHEA devient **un Système**, au sens de *Solo Leveling* — un
> avatar, un titre, des quêtes, des récompenses, des rappels.
>
> **Boucle B0 : cadrer et étudier. Zéro code produit, zéro migration écrite.**
> Gate EL : le COMMENT est posé ici avant la première ligne de travail.
>
> **Décisions déjà prises par Paul** (§12) : ALTHEA vit **à part** · l'unité
> s'appelle un **SKILL** · le moteur est **cumul + élan** · la v1 livre **les
> skills, leurs noms et ce qu'il y a dedans**.
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
> nourris »). Passerelle plus tard (§11), jamais un mot commun.

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

Règle Lv3 §2.1 : **est une boussole tout nœud qui a au moins deux enfants ;
reste un outil toute feuille.** ALTHEA n'a qu'une porte → **c'est une FEUILLE**,
`althea.html`. Le cadran **ressemblera** à une rose de caps ; il ne doit pas s'y
**confondre**, sinon Paul cliquera en croyant naviguer. Parade : l'anneau de
progression et le cœur-bouton, que la boussole n'a jamais (§9).

### 1.4 Collision d'AGENT — le Système parle-t-il ? (**la question d'architecture**)

Principe verrouillé le 2026-07-16 : **l'agent unique d'Ultima est Léo.** Un
Système qui converse serait un second personnage — et casserait le principe le
plus structurant de toute la plateforme.

> **Réponse retenue, et c'est la clé de voûte de tout ce cadrage :
> le Système n'est pas un personnage, c'est un INSTRUMENT.**
>
> Il ne converse pas : il **annonce**. Ses phrases sont des **gabarits fixes**,
> composés en clair dans le code — `[ RANG ATTEINT — LA CONSTANCE ]`. Il n'a ni
> avis, ni mémoire, ni conseil. Une horloge qui sonne n'est pas quelqu'un.
>
> **Léo reste la seule qui parle**, la seule qui conseille, la seule qui
> compose. Répartition sans zone grise :
>
> | | **Léo** — l'intelligence | **Le Système** — l'instrument |
> | --- | --- | --- |
> | Compose les quêtes | ✅ elle connaît Paul | ❌ |
> | Conseille, relance, explique | ✅ | ❌ |
> | Annonce un rang, un titre, une échéance | ❌ | ✅ gabarits fixes |
> | Coût en IA | oui, borné et gaté | **zéro** |
> | Déterministe / testable au harnais | non | **oui, entièrement** |

**Ce que ça règle au passage, et qui n'est pas mince** : toutes les annonces du
Système sont **gratuites, hors-ligne et vérifiables au harnais**. Seule la
composition d'une quête coûte un appel IA — donc seule elle est à borner (§8.3).

### 1.5 Collision de PÉRIMÈTRE — « quête principale » contre ZEKROM et DRAUKHAIN ⚠️

**C'est le vrai danger du Système.** Une « quête principale », spontanément,
c'est un grand objectif de vie. Or les grands objectifs de vie ont **déjà** deux
maisons dans Ultima : **ZEKROM** (les idéaux, le cap directionnel) et
**DRAUKHAIN** (les serments, la volonté), reliés à RESHIRAM par le
**rétroplanning**. Laisser ALTHEA se remplir d'objectifs de vie, c'est
reconstruire un tiers d'Ultima **à l'intérieur d'un jeu** — et se retrouver avec
deux vérités contradictoires sur ce que Paul veut vraiment.

**La frontière, écrite :**

> **Une quête ALTHEA ne porte QUE de l'entraînement de soi** — ce qui se
> pratique, se répète, se muscle. Jamais un chantier, jamais un rendez-vous,
> jamais un objectif de vie.

**Et la passerelle qui donne au jeu sa gravité** : une **quête principale** est
*le reflet jouable* d'un idéal ZEKROM ou d'un serment DRAUKHAIN — elle le
**référence**, elle ne le recopie pas.

*« Parler japonais couramment »* reste un idéal chez ZEKROM. Dans ALTHEA, il
devient une quête principale qui pointe vers lui. Ta quête principale n'est donc
pas inventée par un jeu : **c'est ton idéal qui entre dans l'arène.** En v1 le
lien reste facultatif, mais Léo proposera toujours de le poser.

---

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

Dicté : *« que je débloque de nouveaux skills »*, *« que les quêtes me donnent
des skills »*. Mécanique retenue :

- Un skill peut naître **verrouillé** (`verrouille = true`) : il se voit sur le
  cadran, **grisé, nommé**, avec la quête qui l'ouvre. **Voir ce qui est
  verrouillé est la moitié du plaisir** — un skill caché ne donne envie de rien.
- Achever la quête qui le porte **le déverrouille**, et le Système l'annonce :
  `[ SKILL DÉBLOQUÉ — ESPAGNOL ]`.
- Un skill déverrouillé **ne se reverrouille jamais** (règle cardinale 2).

### 6.3 Le cycle de vie d'une quête — et le refus de la pénalité

```
proposée ──(Paul accepte)──▶ acceptée ──(Paul achève)──▶ accomplie ──▶ [allongement proposé]
    │                            │
    │                            └──(échéance passée)──▶ ENDORMIE ──(Paul reprend)──▶ acceptée
    └──(Paul décline)──▶ déclinée                                └──(Paul range)───▶ rangée
```

**Il n'y a pas d'état « échouée ».** *Solo Leveling* inflige des pénalités quand
la quête quotidienne n'est pas tenue — c'est son ressort dramatique. **Je le
déconseille ici**, et c'est un choix, pas une timidité : une pénalité punit le
silence, et Paul a posé « ce n'est pas obligatoire » comme condition d'existence
du quadrant. Une quête dépassée **s'endort**, et le Système le nomme sans
reproche : `[ QUÊTE ENDORMIE DEPUIS 12 JOURS — reprendre ? ranger ? ]`.
→ **Décision D9 (§12) si Paul veut la morsure de la pénalité malgré tout.**

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
| **`althea_avatar`** | une ligne par propriétaire : `titre_code` (le titre **porté**), `reglages` (rappels on/off, heure). **Pas de niveau** — il est dérivé. |
| **`althea_titres_obtenus`** | `code`, `obtenu_le`. **Le fait seulement** ; les conditions vivent en code (§5.1). |
| **`althea_skills`** | `nom`, `blason`, `seuils` (5 entiers croissants), `nourriture` (`tous`\|`un`), `verrouille`, `actif`. **L'étage qui progresse.** |
| **`althea_gestes`** | `skill_id`, `libelle`, `nature` (`pratique`\|`garde`), `mesure` (`presence`\|`duree`), `rang_affichage`, `actif`. **Aucun compteur ici.** |
| **`althea_paliers`** | `skill_id`, `rang` (1..5), `recompense` (texte), `reclame_le`. On ne stocke **pas** « atteint » : c'est dérivé. |
| **`althea_releves`** | `geste_id`, `jour`, `tenu`, `minutes`, `mot` (court). **Unicité (owner, geste, jour)** ; `jour <= current_date` ; **pas de ligne = non renseigné** (règle 1 exprimée dans le schéma, pas seulement dans l'UI). |
| **`althea_quetes`** | `type` (`principale`\|`secondaire`\|`fond`), `titre`, `intention`, `etat` (`proposee`\|`acceptee`\|`accomplie`\|`endormie`\|`rangee`\|`declinee`), `origine` (`paul`\|`leo`), `echeance`, `parent_id` (l'allongement), `debloque_skill_id`, `recompense`, `ideal_id`/`serment_id` (le lien §1.5, facultatif). |
| **`althea_interpellations`** | le journal de ce que le Système a envoyé : `jour`, `motif`. **Sa raison d'être : faire respecter la loi des interpellations** (une par jour, jamais deux fois la même) — une règle qu'on n'écrit nulle part est une règle qu'on n'applique pas. |
| **`althea_abonnements_push`** | (boucle rappels) l'abonnement Web Push du téléphone. |

Une **vue dérivée** `althea_progression` en `security_invoker`, **par skill** :
jours nourris (au sens de la règle `nourriture`), élan courant, meilleur élan,
rang atteint.

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

### 10.4 Les deux formes à trancher sur l'image

Comme sur VRANESH et DRAUKHAIN : **maquette d'abord, Paul choisit sur le
dessin**, jamais sur ma description.

- **Forme A — le Système gravé.** Nuit et or dominants, le bleu **réservé** à la
  voix du Système. Continuité assumée avec Ultima : ALTHEA en est une pièce, de
  nuit. *Recommandation de Léo.*
- **Forme B — le Système spectral.** Rupture franche : bleu et noir dominants,
  l'or en accent seul. ALTHEA devient visiblement **un corps étranger** dans
  Ultima — ce qui est peut-être exactement ce que « c'est un autre système »
  voulait dire.

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

**Les passerelles** (ALTHEA → RESHIRAM : un skill mûr **étaye** un talent
prouvé ; quête principale ↔ idéal ZEKROM / serment DRAUKHAIN) viennent **après**,
en lecture seule et à sens unique, sur le motif `talent_refs_reseau` (`0013`).

## 12. Décisions

### 12.1 Prises par Paul le 2026-08-06

| # | Question | ✅ Décision |
| --- | --- | --- |
| **D1** | Où ALTHEA s'accroche | **« Tout seul : c'est un autre système, car c'est plutôt un jeu qu'autre chose. »** Ni GRIMA, ni NAGA, ni IMLADRIK. Précision encore due (D7). |
| **D2** | Le mot de l'unité | **Un SKILL.** Tranche la collision avec RESHIRAM par le registre. |
| **D3** | Le moteur | **Cumul + élan.** Le rang ne se reperd jamais. |
| **D4** | Périmètre v1 | **« Les skills : leurs noms, et ce qu'il y a dedans. »** A révélé les deux étages (§8.1). |

### 12.2 Ce qui reste à trancher

| # | Question | Recommandation de Léo |
| --- | --- | --- |
| **D5** | **Les skills de Paul** — leurs noms et leur contenu (§13). | *À dicter.* C'est le bloquant n°1 : sans eux, B1 livre un écran vide. |
| **D6** | **La forme visuelle** : A (le Système gravé) ou B (le Système spectral) ? | **A**, sur maquette. Mais B est légitime si « autre système » veut dire « visiblement étranger ». |
| **D7** | **La place exacte** : troisième cap de la **racine** (1 clic) ou troisième cadran d'**ULTIMA** (2 clics) ? | **La racine.** Un jeu qu'on ouvre tous les jours doit être à un clic. |
| **D8** | **Le titre de départ** et le nom du personnage. | *Sans titre* au départ — un titre se gagne. Le nom : celui de Paul, ou un nom de jeu ? |
| **D9** | **La pénalité** : une quête dépassée s'endort (reco) ou inflige une sanction façon Solo Leveling ? | **Elle s'endort.** Une pénalité punit le silence, que tu as posé comme non punissable. Mais c'est ton jeu — si tu veux la morsure, je la construis. |
| **D10** | **Le widget Scriptable** (§7.4) : on le fait, avec son jeton hors d'Ultima ? | **Le badge chiffré d'abord** (natif, sans clé, sans app tierce). Le widget seulement si le badge ne te suffit pas. |
| **D11** | **Le cron des rappels** — gate coût sur le plan Vercel. | Décision de Paul, jamais une initiative de Léo. À poser en B4, pas avant. |

## 13. Ce que Léo attend pour ouvrir B1 — tes skills

**Un skill = un nom + ce qu'il y a dedans.** Ce qui est déjà connu de ta dictée,
à confirmer et compléter :

| Skill | Ce qu'il y a dedans (les gestes) | Nature |
| --- | --- | --- |
| **PEAK PERFORMANCE** | « pas fumé » · « pas bu d'alcool » · *(à compléter : sommeil ? sport ?)* | garde |
| **JAPONAIS** | « pratiqué le japonais » *(+ minutes)* | pratique |
| **ESPAGNOL** | « pratiqué l'espagnol » *(+ minutes)* | pratique |
| **SPORT** | *(une seule case, ou plusieurs portes — course / salle / vélo ?)* | pratique |

Trois questions ouvertes sur ce tableau :

1. **Peak performance** — quels gestes exactement, et faut-il **tous** les tenir
   pour que le jour compte (règle `tous`) ? C'est ce qui décide si le skill est
   exigeant ou complaisant.
2. **Sport** — un seul geste, ou plusieurs portes en règle `un` ?
3. **Le rythme des paliers** — 7 / 30 / 90 / 180 / 365 jours nourris. Trop lents
   pour le japonais ? Trop rapides pour la garde ?

## 14. Le format 6 points de B1

**① But** — le personnage existe et **les skills réels de Paul y sont posés** :
nom, blason, gestes, paliers. Paul les nourrit pour aujourd'hui et pour la
semaine écoulée, voit son rang, son élan et son titre.

**② Étapes** — (a) **Paul dicte ses skills** (§13) ; (b) maquette comparative
**forme A / forme B**, Paul tranche sur l'image ; (c) place dans l'arbre (D7) :
entrée au registre Lv3 + coque `althea.html` ; (d) migration `0022` écrite,
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

**⑤ Ce qu'on ne fait PAS en B1** — les quêtes (B2), la composition par Léo (B3),
les rappels/badge/PWA (B4), le widget (B5), les passerelles, les jauges
physique/psychique, l'application de la migration (gate Paul).

**⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »**

| Mode de défaillance | Ce qui le prévient |
| --- | --- |
| **Le Système meurt en trois semaines** — le risque n°1 de tout jeu de suivi. | Une case par geste, zéro formulaire, aucun zéro punitif, rang jamais perdu, **un titre qui récompense le retour**. Nourrir en moins de 5 s est un critère mesuré. |
| **On livre un écran vide** — la forme est prête, les skills de Paul n'y sont pas. | Étape (a) **avant** tout. Un ALTHEA sans les skills de Paul n'est pas livré. |
| **On construit les cinq boucles à la fois** et aucune n'aboutit. | Le §11, et la discipline EB. B1 ne contient **aucune** quête. |
| **Les deux étages s'écrasent** (un skill par geste, ou un skill flou). | Le §8.1 + une assertion : *peak performance* porte **plusieurs** gestes et **un seul** rang. |
| **Le Système devient un second Léo** (deux voix, principe verrouillé cassé). | §1.4 : gabarits fixes, zéro IA dans l'annonce ; assertion de harnais sur la forme `[ … ]`. |
| **ALTHEA avale ZEKROM et DRAUKHAIN** (les objectifs de vie migrent dans le jeu). | §1.5 : une quête ne porte que de l'entraînement de soi ; la principale **référence** un idéal, ne le recopie pas. |
| **Un rang qui bouge tout seul** quand un geste est désactivé. | §8.3-1, cas de test dédié. |
| **La donnée de santé fuit** — cockpit, IA, **écran verrouillé**, widget, log. | Comptes seuls, intitulés de gestes exclus partout, **notification qui ne nomme jamais un geste**, preuve par l'ABSENCE aux six sorties. |
| **Le robinet IA coule.** | §8.3-4 : une composition par jour, refus **serveur**, jamais de boucle de fond. |
| **On promet un widget qu'iOS n'autorise pas.** | §7.1 : le verdict est écrit **avant** la promesse. Le badge est la vraie réponse ; le widget a un prix, il est dit. |
| **Le bleu spectral sur nuit échoue au contraste.** | AA vérifié au harnais, pas à l'œil (leçon « une géométrie se mesure », étendue à la couleur). |
| **On construit sur une dictée mal entendue** (« widget », « quêtes de fond », « arbre de capacités »). | Signalés au §0/§0bis, confirmés par Paul avant B1. |

## 15. État de la boucle

- **B0 — cadrage et étude** : ce document. ✅ livré le 2026-08-06. **Zéro code,
  zéro migration.** Deux dictées absorbées, cinq collisions écrites, la boucle de
  jeu fermée, la réalité technique des rappels et du widget **vérifiée avant
  d'être promise**.
- **Bloquants pour ouvrir B1** : **D5** (les skills de Paul, dictés) · **D6** (la
  forme, sur maquette) · **D7** (la place exacte).
- **Prochaine action unique** : la **maquette comparative** du Système
  (`design/preview-althea-systeme.html`) — la fiche du personnage, le cadran, le
  journal des quêtes et la fenêtre du Système, en **forme A et forme B côte à
  côte**. **Sans `<script>` inline** (CSP `script-src 'self'` — cinq maquettes
  antérieures sont muettes en preview pour cette raison exacte).
