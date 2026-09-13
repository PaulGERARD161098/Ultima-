<!-- lecons:empreinte v18 2026-09-13 sha256:048d085d59f7 -->
# Leçons à ne pas oublier

> **Source unique des leçons de méthode, pour les huit dépôts.** Demandé par
> Paul le 2026-09-11 : *« compiler les grands points de nos sessions de travail
> pour que tu les gardes en tête dans les repos ou dans Ultima, le repo macro »*.
>
> ⛔ **Ce fichier n'est pas un journal.** Le journal des décisions vit dans
> `memoire/JOURNAL-DECISIONS.md` et raconte ce que Paul a tranché ; celui-ci
> retient ce qu'une **erreur** a appris. Une entrée n'arrive ici que lorsqu'un
> défaut est passé pour de vrai, et elle porte toujours **ce qu'il a coûté** :
> une règle sans son incident se lit comme un conseil, et un conseil s'oublie.
>
> ⛔ **Il est classé par famille, pas par date** — c'est ce qui le rend
> consultable en cours de travail. La date reste sur chaque entrée : elle dit
> quand la facture est tombée.

⛔ **SA SOURCE UNIQUE EST `Ultima-/memoire/LECONS.md`.** Il est **copié à
l'identique** dans les sept autres dépôts, parce qu'une séance ouverte sur
RenoAgenda ou artisan-builder n'a pas Ultima sous la main. Toute évolution se
fait **dans Ultima**, puis se re-copie : on ne corrige jamais une copie sur
place, sinon les huit divergent et plus personne ne sait laquelle fait foi.
*(Même motif, même raison que `finubar/rappel.mjs`. Les chemins cités dans les
leçons portent donc leur dépôt en préfixe : ils doivent se lire depuis n'importe
lequel des huit.)*

### ✍️ Le mettre à jour, depuis n'importe quel dépôt

*Posé le 2026-09-11, sur demande de Paul : « il faut pouvoir le mettre à jour
tout le temps sur tous les repos ». Huit copies d'un fichier qui bouge souvent,
c'est huit vérités qui divergent — et la divergence ne se voit pas toute seule.*

**La ligne de sceau en tête** (`<!-- lecons:empreinte v… -->`) porte une
révision, une date et le sha256 du corps. Deux dépôts se comparent d'un coup
d'œil, sans réseau : même sceau, mêmes leçons.

**La marche à suivre, dans cet ordre, et elle ne se raccourcit pas :**

1. **Écrire la leçon dans Ultima**, jamais dans une copie. Si la séance est
   ouverte sur un autre dépôt, Ultima s'écrit quand même : `add_repo` puis
   l'outil GitHub d'écriture de fichier — aucun clone n'est nécessaire.
2. **Re-sceller** : `node finubar/lecons-empreinte.mjs --sceller`. Le sceau ne
   bouge pas si le corps n'a pas changé, donc re-sceller sans raison ne
   fabrique pas de fausse divergence.
3. **Propager la copie** dans les sept autres dépôts, octet pour octet. Un
   `diff` doit revenir vide : c'est le critère de réussite, pas « ça a l'air
   pareil ».
4. **Le dire dans le commit du travail** qui a révélé la leçon — pas dans un
   commit séparé « docs » qu'on écrit un autre jour, et qu'on n'écrit donc pas.

⛔ **Le sceau se vérifie, sinon il ment.** `node finubar/lecons-empreinte.mjs
--verifier` échoue si le fichier a changé sans être re-scellé, et il tourne dans
`tests/lancer.sh`. Une empreinte oubliée est **pire** que pas d'empreinte : elle
affirme une identité fausse, et deux copies réellement différentes affichent
alors le même sceau.

⚠️ **Ce qui n'est PAS automatique, et doit être su** : rien ne compare
aujourd'hui la copie d'un dépôt à la source. Le sceau rend la divergence
**visible** au lecteur, il ne la **détecte** pas tout seul — un contrôle
croisé exigerait un jeton d'accès inter-dépôts, c'est-à-dire un secret, donc
une décision de Paul. En attendant, c'est l'étape 3 qui tient, et elle est
humaine.

**Comment il vit.**
- **Une leçon s'ajoute quand elle est payée**, en fin de séance, dans le commit
  du travail qui l'a révélée. Jamais par anticipation : une règle qui n'a rien
  coûté n'a pas encore prouvé qu'elle servait.
- **Une leçon se relit avant d'être réutilisée.** Une note vieillit comme un
  test qui nomme une couleur supposée — voir *Rouvrir une dette commence par la
  re-mesurer*, ci-dessous, qui s'applique d'abord à ce fichier.
- **Son contenu ne se redit nulle part ailleurs.** Les `CLAUDE.md` des dépôts
  **pointent** ce fichier, ils n'en reprennent aucune ligne. *(À ne pas
  confondre avec la copie du fichier entier dans les huit dépôts, ci-dessus :
  copier un fichier tel quel se vérifie d'un `diff` ; en redire le contenu
  ailleurs, non — et c'est cette seconde forme qui fabrique deux vérités.)*

---

## 1. Mesurer, et croire ce qu'on mesure

**AVANT DE CROIRE UNE MESURE, LUI DEMANDER CE QU'ELLE RÉPOND SUR UN CAS DONT ON
CONNAÎT DÉJÀ LA RÉPONSE** *(2026-08-17)*. Trois sondes fausses dans une seule
séance, avec le même signe d'alerte chaque fois : **une réponse trop uniforme**.
Un instrument de contraste qui condamnait un titre parfaitement lisible ; une
mesure de géométrie qui comparait des étoiles au cadre d'un blason attrapé par
un `querySelector('svg')` trop large ; une sonde de canvas qui répondait « blanc
pur » à toutes les options, y compris `eclat: 0`. Les trois se seraient
effondrées en une ligne sous ce test. *« Ça a l'air cohérent » ne valide pas un
instrument — seul un cas de référence le valide.*

**UNE GÉOMÉTRIE SE MESURE, ELLE NE SE VALIDE PAS À L'ŒIL** *(2026-08-01)*. Tout
élément placé dans un cadre borné voit sa `getBBox()` comparée au `viewBox`, et
s'éprouve sur un **pire cas construit**, jamais sur les seules données du jour,
qui sont un échantillon favorable. Le foyer de DRAUKHAIN débordait chez Paul
après avoir été « validé » sur un rendu regardé. *« Ça a l'air bien » n'est pas
un critère de réussite : c'est l'absence de critère.*

**UN FOND SUPPOSÉ EST UN FOND FAUX** *(2026-08-20)*. Quand un calcul et une
mesure divergent, c'est **l'hypothèse cachée du calcul** qu'il faut aller
chercher, pas l'arithmétique. Le contraste calculé d'un lien donnait 5,12:1
contre 4,36 mesuré : le lien n'était pas posé sur la nuit de la page mais sur le
sol étoilé.

**CLASSER PAR LA MESURE PLUTÔT QUE PAR LE DÉBAT** *(2026-08-17)*. Pour embarquer
sept pages sur trois registres, ne pas décider en amont : appliquer le registre
probable aux sept, puis **laisser le harnais désigner celles qui résistent**.
Cinq étaient bonnes du premier coup, une seule a demandé du travail. Débattre
page par page aurait coûté plus cher, et se serait trompé.

**ROUVRIR UNE DETTE COMMENCE PAR LA RE-MESURER, JAMAIS PAR RELIRE SA
DESCRIPTION** *(2026-08-20)*. Deux notes de registre prises en défaut dans la
même séance : « 5 textes sur 2 pages, assombrir un jeton global » était en
réalité 7 textes sur 3 pages, un jeton local, et sur une page il fallait
**éclaircir**. Une dette décrite de mémoire est un souvenir, pas une mesure.

**UN CAS À RÉPONSE CONNUE DOIT ÊTRE JOUÉ DANS L'ENVIRONNEMENT DE LA VRAIE
LECTURE** *(2026-09-11)*. Après un squash, le grain Finubar d'artisan-builder
pointait le commit de la branche, que la fusion avait fait disparaître de `main`.
Le contrôle de dérive, lancé **dans le clone de travail**, répondait
tranquillement « le dépôt a avancé de 2 commits » — parce qu'un clone qui a servi
à la branche garde ses objets après la fusion, et que `rev-list` trouvait donc
encore ce commit. Rejoué sur un **clone frais**, c'est-à-dire dans les conditions
réelles de la prochaine séance, le même contrôle annonçait « commit introuvable,
la fraîcheur de cette note n'est PAS mesurable ». *Le cas à réponse connue ne
suffit pas : il doit être joué là où la lecture aura lieu. Un environnement qui a
de la mémoire fait passer des contrôles qu'un environnement neuf recale.*

**UN IDENTIFIANT TRONQUÉ NE SE COMPLÈTE JAMAIS DE MÉMOIRE** *(2026-09-11)*.
Une fusion exigeait le sha complet de la tête ; je n'avais lu que sa forme
courte, et j'ai passé à l'API douze caractères inventés derrière les sept connus.
Refus immédiat, garde-fou tenu, coût faible — cette fois. La forme courte d'un
sha, d'un identifiant de déploiement ou de ticket **est une troncature, pas un
préfixe qu'on prolonge** : elle se relit à la source (`git rev-parse`) avant
d'être passée à quoi que ce soit qui agit.

⛔ **ET ELLE A ÉTÉ ENFREINTE DEUX FOIS LE 13/09, APRÈS AVOIR ÉTÉ ÉCRITE ICI** —
deux `409` sur deux fusions, à deux heures d'intervalle, dans la même séance, et
la seconde après que la première eut été racontée en toutes lettres dans un
compte rendu. C'est cette récidive qui compte, pas la faute : **un paragraphe de
rapport ne s'exécute pas**, et une leçon rangée dans un fichier ne désarme pas
le réflexe qui l'a causée. Ce qui change quelque chose est la forme
opérationnelle, tenue dans le geste : **la valeur est copiée d'une commande qui
vient de l'imprimer**, jamais d'un affichage antérieur de la conversation —
et l'abréger pour la relire est déjà une reconstruction.

⚠️ **Le garde-fou était DISTANT les deux fois** : c'est le serveur qui a refusé,
pas moi. Quand un contrôle distant est ce qui rattrape une déduction, c'est que
le contrôle local manquait — et un garde-fou qu'on n'a pas coûte le jour où
l'API en face n'en a pas non plus.

**UN INSTRUMENT QUI MESURE UNE PROPRIÉTÉ DÉRIVÉE MESURE TOUT CE QUI LA PRODUIT**
*(2026-09-13)*. Pour prouver qu'un hero ne noyait plus sa photo sous deux voiles,
le harnais mesurait la **variance des pixels** du haut de la section : une image
noyée tend vers l'aplat, donc vers une variance basse. Sauf que la bande mesurée
englobait le **cartouche blanc du logo**, dont le blanc suffisait à faire
exploser la variance. L'instrument affichait vert sur le hero à deux voiles,
celui-là même qu'il existait pour prendre en défaut. Remplacé par la mesure de la
**cause** : la bande est photographiée avec les voiles, puis sans — ils portent
un attribut qui les désigne — et le rapport des luminances donne le voile réel,
79-82 % avant, 32-34 % après. *Une grandeur dérivée agrège tout ce qui entre dans
le cadre. Mesurer la cause coûte un second relevé ; c'est le prix pour que le
vert veuille dire quelque chose.* Avec son corollaire, éprouvé dans la même
séance : **le correctif qui retire le défaut doit aussi retirer le moyen de le
mesurer** — sans les éléments marqués, les deux clichés sont identiques et
l'instrument annonce 0 % de voile, le meilleur résultat possible pour la pire
raison. D'où un verrou de non-vacuité sur leur présence.

**UNE RECOMMANDATION D'AUDIT N'EST PAS UNE MESURE** *(2026-09-13)*. Un audit
design nommait trois textes sous le seuil de contraste et prescrivait la couleur
qui les corrigeait. La mesure a donné **six** familles de textes fautifs, dont
une que la lecture du code ne pouvait pas voir — et surtout, la couleur
prescrite **ne passait pas** sur l'un des deux fonds du site (4,45:1 au lieu de
4,5). Appliquer la recommandation telle quelle aurait laissé le défaut en place
en le croyant réglé, avec un constat coché pour le prouver. *Un audit dit où
regarder. Ce qu'on y trouve, et ce qui le referme, se remesurent.*

**UN COMPTEUR QUI BAISSE N'EST PAS UN PROGRÈS : C'EST UNE AFFIRMATION À VÉRIFIER**
*(2026-09-13)*. La garde de publication d'artisan-builder contrôlait
`site.telephone` et ignorait `site.telephoneHref`, un champ **parallèle,
invisible à l'écran**, employé 22 fois dans le code — dont dix-neuf liens
d'appel et les données structurées. Renseigner le premier faisait passer le
compteur de 7 à 6 blocages **pendant que chaque bouton composait encore
`+33600000000`**. Le défaut n'était pas l'absence de contrôle, c'était que le
compteur BOUGEAIT : une garde qui vérifie un champ sur deux couplés est pire
qu'aucune garde, parce qu'elle récompense le geste incomplet. Trouvé par une
séance qui suivait la passation à la lettre, pas par un test. *Quand deux champs
décrivent la même chose, la garde vérifie les deux ET leur cohérence.*

**UN CHIFFRE SANS SA COMMANDE N'EST PAS UNE MESURE** *(2026-09-13)*. Le document
de passation d'artisan-builder promettait en préambule que « chaque nombre porte
la commande qui le rend », puis affirmait « 35 emplois de l'accent avant AB3 » —
un relevé ponctuel sur un état du code qui n'existait plus. La séance d'épreuve a
cherché la commande, ne l'a pas trouvée, et a eu raison de démentir le chiffre.
*Un nombre historique se date et se rend à sa source ; il ne s'aligne pas dans le
tableau des mesures du jour.*

**MESURER CONTRE LA BONNE RÉFÉRENCE, ET DIRE LAQUELLE** *(2026-09-13)*. Le
contraste typographique d'une page a d'abord été mesuré en comparant la pile
d'affichage à `FAMILLES.corps` — une constante du module — au lieu de la police
que la page emploie RÉELLEMENT pour son corps. Résultat : 445,2 px contre
445,2 px, « aucun contraste », conclusion écrite puis corrigée. Contre la vraie
police : 70 px. *Une mesure juste sur le mauvais objet est un faux, et elle a
l'air d'une mesure.*

**UN DOCUMENT QUI ANTICIPE EST PIRE QU'UN DOCUMENT ABSENT** *(2026-09-13)*. Le
§1 de la passation annonçait AB4 « fusionné » en PR #58 au moment où il ne
l'était pas encore — le lot a été fusionné vingt minutes plus tard, rendant vraie
après coup une affirmation fausse à la lecture. Une séance d'épreuve l'a mesurée
fausse et a eu raison. *Un état se mesure à la lecture, jamais à l'écriture : un
tableau d'historique porte les commandes qui font foi CONTRE lui.*

**UN RAPPORT ENTRE DEUX POINTS NON ADJACENTS N'EST PAS UN TAUX PAR INTERVALLE**
*(2026-09-13, trouvé par une revue adverse externe, pas par moi)*. J'avais donné
à Paul, dans un prompt d'analyse, « un pic de ×230 **en un mois** » sur la série
`climatiseur mobile`. Mesure refaite : 74 000 / 320 = 231,25 porte d'**avril à
juin** — deux intervalles. Avril→mai vaut 25,3, mai→juin 9,14. Le nombre était
juste, son unité était fausse, et c'est l'unité qui portait tout le sens : ×230
en un mois se raconte comme un raz-de-marée, ×9 puis ×25 se raconte comme une
saison qui monte. *Un ratio ne dit rien tant qu'on n'a pas nommé sur combien
d'intervalles il porte — et la division ne le rappelle jamais toute seule.*

**QUAND UN TEXTE ET LE TABLEAU QUI L'ILLUSTRE DIVERGENT, C'EST LE TEXTE QUI A
TORT — ET PERSONNE NE RELIT LE TABLEAU** *(2026-09-13)*. Le PDF de la boussole
affirmait « 33 valeurs distinctes, avec un **rapport constant** d'un barreau au
suivant », et imprimait **juste en dessous** la ligne des rapports mesurés :
1,27 · 1,21 · 1,24 · 1,24 · 1,23 · 1,22 · 1,23 · 1,23 · 1,22 · 1,22. Le
démenti était dans la même page, à deux centimètres de l'affirmation, pendant
quatorze pages et une relecture complète. ⛔ *Une phrase de synthèse posée
au-dessus d'un tableau se lit à la place du tableau. Elle doit donc être
DÉRIVÉE de lui — « des rapports resserrés entre 1,21 et 1,27 » — jamais
arrondie en une propriété qu'il ne montre pas.*

**UNE AFFIRMATION NE SE CORRIGE PAS AVEC UNE AUTRE AFFIRMATION TIRÉE DU MÊME
EXTRAIT — ELLE SE RELIT À LA SOURCE** *(2026-09-13, la correction de la
correction, dans la même soirée)*. Le PDF de la boussole affirmait une « échelle
×1,22 ». Je l'ai retirée et remplacée par « rapports entre 1,21 et 1,27 »,
mesure que je croyais honnête parce qu'elle venait du **tableau imprimé dans le
document**. Elle était fausse aussi : ce tableau est un EXTRAIT — le milieu de
l'échelle, sa seule partie régulière. Relue en base sur les 33 valeurs réelles,
l'échelle va de **×1,14 à ×2,24**, avec un bas grossier (10 · 20 · 30 · 40 · 50 ·
70 · 90) et un haut très grossier (12 100 · 22 200 · 33 100 · 74 000).

⛔ **Et la première correction a créé une erreur NEUVE** : j'en avais déduit que
« 10 → 20 ne fait pas un cran » (`log(2)/log(1,22) = 3,49`). Sur l'échelle
réelle, 10 et 20 sont deux barreaux **voisins** : un calcul juste sur une
prémisse fausse. *Corriger depuis la même source seconde reproduit son biais,
avec en plus l'autorité de la correction.* Une rétractation se fait depuis la
donnée, jamais depuis le document qu'on rétracte.

⚠️ **Ce que la vraie mesure apprenait, et que le modèle cachait** : l'incertitude
n'est pas uniforme — les GRANDS chiffres, ceux qu'on montre à un artisan, sont
les MOINS précis. Le modèle ×1,22 disait l'inverse. *Une fausse régularité ne
fait pas qu'être fausse : elle supprime le fait le plus utile.*

**UN MOTIF DE RECHERCHE SE VÉRIFIE SUR LA CHAÎNE RÉELLE, SINON IL REND UN FAUX
« ABSENT »** *(2026-09-13 — trois fois dans la même soirée)*. J'ai déclaré une
affirmation retirée du code après un `grep "1\.22"` — le code écrit `1,22`, avec
une **virgule**. Elle vivait encore dans SEPT fichiers, dont le texte affiché à
Paul et l'en-tête du CSV qui circule seul, et **trois tests l'exigeaient**.
Puis un test a cherché `/74 000/` là où `toLocaleString('fr-FR')` écrit une
**espace fine insécable** (U+202F). Puis une sonde PDF a répondu « MANQUE » sur
une phrase coupée par un saut de ligne. ⛔ *Les trois ont rendu « absent » avec
la même assurance qu'un vrai absent.* Un motif qui cherche une absence se teste
d'abord sur une chaîne dont on SAIT qu'elle contient la cible.

**UN FAIT RECOPIÉ DANS SEPT FICHIERS DIVERGE ; UN FAIT EXPORTÉ NE PEUT PAS**
*(2026-09-13)*. La même affirmation vivait dans deux commentaires, le texte de
l'écran, l'en-tête du CSV, le cadrage, le générateur du PDF et trois tests.
Retirée du document, elle est restée dans le code — c'est-à-dire dans la version
que Paul VOIT et dans le fichier qu'il ENVOIE. *Un chiffre que plusieurs endroits
doivent connaître se met dans une constante exportée et une fonction qui le met
en phrase ; les autres l'importent.* Et le garde-fou qui manquait est celui qui
cherche l'ancienne affirmation **là où elle sort** — écran et export — pas là où
elle était écrite.

**« DEUX CALCULS D'ACCORD » NE MESURE PAS L'EXACTITUDE** *(2026-09-13)*. J'avais
annoncé « 0 désaccord sur 25 898 mots-clés » comme une preuve de justesse de
l'agrégation. C'en est une — de **cohérence**, pas d'exactitude : deux calculs
concordants partagent la même zone, le même import tronqué, les mêmes zéros
fabriqués et la même absence de provenance. Ils se trompent ensemble sans jamais
diverger. *Un test de concordance prouve que le moteur ne se contredit pas ; il
ne dit rien de ce qui est entré dedans. Étiqueter séparément fidélité de
transformation, cohérence de calcul et justesse de la source.* ⚠️ Et cette
mesure-là n'avait été versionnée nulle part : citée trois fois, introuvable.

---

## 2. Les garde-fous, et leur silence

**UN GARDE-FOU SE VÉRIFIE DU CÔTÉ OÙ IL PEUT ÊTRE CONTOURNÉ** *(2026-08-21)*.
Quatre écarts de la même forme dans une séance : une donnée protégée par un
écran et pas par la donnée ; un motif d'import supposé plutôt qu'éprouvé ; une
convention de plateforme prise pour une protection ; une liste de chemins écrite
à la main prise pour une couverture. Les quatre passaient la revue et ne
tenaient qu'à une requête près. *Corollaire, et c'est lui qui coûte* : quand on
ne **peut pas** vérifier de ce côté-là, on **retire l'hypothèse** au lieu de la
documenter. Une hypothèse documentée reste une hypothèse, et c'est le lecteur
suivant qui la paie.

**UN GARDE-FOU QUI CESSE DE FONCTIONNER DOIT LE DIRE** *(2026-08-21)*. Un test
absent de la chaîne d'intégration, un filtre qui écarte en silence, une garde
jamais appelée : leur silence se lit comme une bonne nouvelle, et c'est le pire
des deux états.

**UN FILTRE QUI EXCLUT DES CAS DOIT COMPTER ET NOMMER CE QU'IL EXCLUT**
*(2026-08-17)*. Un harnais de contraste écartait sans rien dire les textes trop
fins pour avoir un pixel pleinement opaque, c'est-à-dire **exactement les plus à
risque**, et rendait un verdict vert. Un `continue` muet transforme un angle
mort en réponse rassurante. Tout cas écarté est compté, nommé au rapport, et son
nombre est borné par un verdict.

**UN VERDICT DIFFÉRENTIEL PARDONNE PAR CONSTRUCTION, IL LUI FAUT UN VERROU**
*(2026-08-20)*. Un harnais n'exigeait « aucun défaut **nouveau** » : sept textes
sous le seuil ont dormi des semaines **dans un rapport vert**, poliment listés
sous « rappels ». Un rappel n'est pas un garde-fou. Toute page dont la dette est
soldée le déclare et retrouve un seuil **absolu**.

**TOUTE RECHERCHE D'ABSENCE EXIGE UN VERROU DE NON-VACUITÉ** *(2026-07-30,
renforcé 2026-09-07)*. « X n'est pas là » est vert sur une chaîne vide, une page
non chargée, un fichier de zéro octet. Une règle de confidentialité se teste
ainsi : chercher le contenu interdit dans ce qui part, et exiger de ne pas l'y
trouver. Vérifier seulement la présence du permis ne prouve rien.

**UN RENVOI MORT SE LIT EXACTEMENT COMME UN RENVOI VALIDE** *(2026-09-07)*. Un
« §11.8 » était cité cinq fois dans les documents d'Artidispo pour une section
**jamais écrite** : le script qui devait la poser avait échoué après avoir
construit son texte. Rien ne le signalait, et c'est Paul qui l'aurait découvert
en cliquant. Corrigé par un harnais, `RenoAgenda/tests/unit/renvois-sections.test.mjs`.

**UN MÉCANISME DE CONTRÔLE POSÉ APRÈS LA PREMIÈRE COPIE LAISSE CETTE COPIE
DEHORS** *(2026-09-11)*. Ce fichier a été déposé dans RenoAgenda le matin ; le
sceau qui permet de comparer les huit copies a été posé une heure plus tard. La
première copie servie était donc déjà hors mécanisme, et son rappel d'ouverture
annonçait « cette copie n'a PAS de sceau ». Il a fallu une PR de rattrapage pour
un fichier vieux d'une heure. *Le contrôle se pose AVANT la première copie, pas
après la dernière* — et ce qui a sauvé le coup ici, c'est que le mécanisme
ANNONCE son absence : un sceau muet aurait laissé la copie passer pour à jour.

**UN DOCUMENT DE DATES N'A AUCUN MÉCANISME DE PÉREMPTION** *(2026-09-11)*. Le
rétroplanning d'Artidispo affichait deux jalons dépassés de trois jours
exactement comme les jalons à venir. Un jalon en retard ne se signale pas tout
seul : il faut le lui faire dire, comme Finubar fait dire à un grain qu'il a
vieilli.

**UN GARDE-FOU QUI LIT DU TEXTE LIT AUSSI SA PROPRE DOCUMENTATION**
*(2026-09-11)*. Une garde qui cherche un motif interdit dans un fichier trouve
aussi le commentaire qui explique pourquoi ce motif est interdit. Elle se
déclenche donc sur l'explication du correctif, pas sur le défaut. ⛔ Un contrôle
de présence se fait sur le CODE (commentaires retirés) ou sur un COMPTE attendu
— « exactement une occurrence, celle du repli voulu » — jamais sur la présence
brute d'une chaîne dans un fichier commenté. *Incident : deux assertions de
sûreté ont bloqué deux modifications correctes, parce que le commentaire que je
venais d'écrire citait le mot qu'elles interdisaient. Deux cycles perdus, et la
tentation immédiate de désarmer l'assertion — c'est-à-dire de supprimer le
garde-fou pour faire passer le correctif.*

**UN ROUGE DE COMPILATION N'EST PAS UN ROUGE D'INSTRUMENT** *(2026-09-13)*. Deux
sondes de dry run ont fait rougir un harnais navigateur — mais parce que le JSX
saboté ne compilait plus, donc la page ne chargeait pas du tout. Le harnais
sortait sur son verrou de non-vacuité, pas sur l'assertion qu'on prétendait
éprouver. Les deux sondes ont été **refaites** en cassant la propriété sans
casser la compilation (HTTP 200 vérifié avant de lire le verdict). *Une sonde
valide ne casse qu'une chose, et on vérifie que le reste tient encore.*

**UNE MAUVAISE SONDE N'EST PAS UN INSTRUMENT DÉFAILLANT — DISTINGUER LES DEUX EST
LE TRAVAIL** *(2026-09-13)*. Trois sondes sont revenues vertes dans la même
séance. Deux étaient de mauvaises sondes : elles ne cassaient pas la propriété
affirmée (insérer un bloc avant le formulaire le laissait quand même remonté ;
retirer le bouton d'appel de l'en-tête laissait neuf autres liens de contact).
La troisième révélait un vrai défaut d'instrument. Compter les trois comme
« l'instrument ne prouve rien » aurait fait réécrire deux gardes correctes ; les
compter comme « rien à signaler » aurait laissé la troisième. *Avant de conclure,
relire ce que la sonde a réellement cassé, et le comparer à ce que l'assertion
affirme.*

**UNE GARDE QUI NE PEUT PAS ÉCHOUER SE LIT COMME UNE BONNE NOUVELLE**
*(2026-09-13)*. Un harnais vérifiait qu'« il reste un chemin vers le formulaire
quelque part dans la page ». Aucune casse d'un seul composant ne pouvait la faire
rougir : le produit porte une dizaine de tels chemins. Elle a été REMPLACÉE — pas
renforcée — par une garde portant sur l'en-tête, qui n'en a qu'un, et qui rougit.
*Une assertion dont on ne sait pas fabriquer l'échec n'est pas une assertion,
c'est une phrase.*

**UN CONTRÔLE SUR UN AUTRE PORT NE TOURNE JAMAIS** *(2026-09-13)*. Neuf harnais
navigateur d'artisan-builder visaient `:3000`, le dixième `:3101`. Lancé de la
façon documentée pour tous les autres, il sortait sur `ERR_CONNECTION_REFUSED`
— qu'on lisait comme un harnais cassé, donc personne ne l'exécutait. Il était
vert. *Un réglage qu'il faut connaître pour lancer un contrôle est un contrôle
qui ne tourne pas.*

**UN OUTIL DE BUILD PEUT TUER LE SERVEUR QUE LES CONTRÔLES INTERROGENT**
*(2026-09-13)*. Après un `npx next build`, les dix harnais ont rendu dix
`ERR_CONNECTION_REFUSED` d'affilée — dix régressions apparentes, zéro réelle : le
build avait arrêté le `next dev` qu'ils interrogent. *Dix échecs identiques et
simultanés désignent l'environnement, pas le code.*

**BOUCHER UN TROU NOMMÉ N'EST PAS FERMER SA CLASSE — ET LA CORRECTION DONNE
L'ILLUSION DU CONTRAIRE** *(2026-09-13, la même journée que la correction)*. Le
matin, j'avais trouvé et corrigé le trou `Number(null) === 0` dans `formeSaine`,
le validateur de réponse du radar. Je l'ai noté comme « le contrat est fermé ».
Le soir, sept charges hostiles lui ont été présentées : **les sept sont
passées** — `volume: null`, volume négatif, volume booléen, ligne sans mot-clé,
ligne qui est une chaîne, et des totaux annonçant 9 999 mots-clés pour une seule
ligne. Le validateur vérifiait l'**enveloppe** et s'arrêtait au bord du tableau.
⛔ *Corriger un cas particulier crée le sentiment d'avoir traité le général, et
ce sentiment est plus dangereux que le trou d'origine : il retire le sujet de la
liste des choses à regarder.* La question à poser après chaque correction n'est
pas « est-ce réparé ? » mais **« de quelle famille était ce défaut, et qui
d'autre en est ? »** — puis on présente la famille entière au garde-fou.

**UN INVARIANT VRAI ET NON GARDÉ SE CASSE EN SILENCE** *(2026-09-13)*. Deux
invariants du radar étaient parfaitement respectés et **absolument pas testés** :
la garde `requireAdmin` (correcte — elle interroge `is_admin` avec le JWT de
l'utilisateur, et seul `true` passe) n'avait aucun test de 401/403 sur les routes
du radar ; et la séparation entre le simulateur public et les routes privées
tenait, sans qu'aucun harnais ne l'exige. *Un invariant qu'on a vérifié à l'œil
est vrai aujourd'hui ; un invariant qu'un harnais exige est vrai demain. Entre
les deux il n'y a pas une nuance de rigueur, il y a la personne qui modifiera
le fichier dans six mois sans connaître la règle.*

**UN HARNAIS PEUT ÉCHOUER POUR UNE RAISON QUI N'EST PAS CELLE QU'IL ANNONCE**
*(2026-09-13)*. La recette de forme SPC rendait `EncodingError: The source image
cannot be decoded` sur le logo du pied de page — donc, à la lettre, « le fichier
du client est illisible ». Le fichier était intact : son empreinte git était
exacte, et la recette elle-même venait de l'affirmer six lignes plus haut. Le
défaut était dans l'instrument : il appelait `image.decode()` juste après
`scrollIntoViewIfNeeded()`, sur une image différée qui était encore **en vol**.
Trois passages ont rendu le même rouge — donc pas un aléa, un faux positif
**systématique**, celui qu'on croit le plus volontiers. Coût : une boucle
complète de diagnostic sur un défaut qui n'existait pas. ⛔ *Un rouge se relit
avant d'être cru : ce que le message NOMME (« image indécodable ») et ce que
l'assertion PROUVE (« le logo est déformé ») sont deux choses, et seule la
seconde accuse le code.* Et le correctif ne se paie pas en aveuglement : un
contrôle qui dépend d'un chargement asynchrone **attend** l'état au lieu de le
supposer — l'attente ne masque rien tant qu'elle expire, une image qui ne charge
jamais fait toujours rougir la recette. Vérifié ici par deux sondes : logo
délibérément déformé et activité prioritaire retirée virent toutes deux au
rouge, et la recette repasse au vert une fois l'état restauré.

---

## 3. Ce qu'on donne à Paul

**RIEN DE CE QUI EST DONNÉ À PAUL N'EST DÉDUIT** *(2026-09-02, directive EL)*.
Toute valeur qu'il va cliquer, taper ou croire — URL, chemin, identifiant,
chiffre, nom de fichier, état d'un service — est **lue à sa source**, et sa
provenance peut être citée. ⛔ Une déduction vraisemblable présentée comme un
fait est pire qu'une invention : elle se lit exactement comme le reste, donc
rien ne la signale. Trois conduites, sans exception : je l'ai lue, je la donne ;
je ne **peux** pas la vérifier, je le dis **avant** la valeur ; je ne la sais
pas, je cherche. *Incident fondateur : un nom de projet Vercel transformé en URL
de production et donné comme vérifié, alors que le vrai domaine était écrit à
quatre endroits du dépôt.*

**TOUJOURS LES LIENS DE CE QU'IL Y A À VÉRIFIER** *(2026-08-17)*. Dès qu'un
travail est poussé, donner **la liste des liens cliquables** de tout ce que Paul
peut aller voir, **et ce qu'il faut regarder sur chacun**. Un lien par page
concernée, pas un lien générique vers la prévisualisation. *Une prévisualisation
sans adresse précise l'oblige à chercher lui-même ce qu'on vient de modifier :
c'est du travail rendu à moitié.* Quand une page n'est pas encore vérifiable, le
dire au lieu de donner un lien qui ne montrera rien.

**UNE QUESTION REMONTÉE À PAUL DOIT ÊTRE UN CHOIX, PAS UNE ENQUÊTE NON TERMINÉE**
*(2026-08-17)*. Un arbitrage produit avait été annoncé ; c'était un diagnostic
arrêté trop tôt, et un seul geste l'a réglé. Un arbitrage se pose quand **deux
options tiennent également debout**. Sinon c'est du travail à finir, et le
déléguer à Paul lui coûte une décision qui n'existe pas.

**UNE CONSIGNE CONDITIONNELLE EST UN MANDAT, PAS UNE QUESTION** *(2026-08-04)*.
Quand Paul formule une consigne qui contient déjà sa règle de décision — « si ce
n'est pas nécessaire, supprime » — il délègue la **vérification**, pas
l'arbitrage. Vérifier factuellement, appliquer sa règle au constat, agir, rendre
compte du constat **et** de l'action. Lui renvoyer une question à choix multiples
lui redemande ce qu'il vient de trancher. *Incident : deux PR à évaluer, une
question posée au lieu de vérifier et agir ; Paul n'a pas répondu, temps perdu.*

**UN OUTIL QUI RÉPOND « INTROUVABLE » NE PROUVE PAS QUE LA CHOSE N'EXISTE PAS**
*(2026-09-11)*. « Je ne l'ai pas trouvé » et « ce n'est pas là » sont deux
constats différents, et le second ne se déduit jamais du premier. Un droit
manquant, un jeton à portée trop étroite, un proxy qui refuse : tous rendent le
même silence qu'une absence réelle. ⛔ Rapporter une absence exige d'avoir
éliminé l'aveuglement, sinon on livre un diagnostic inversé — et il se lit comme
un fait. *Incident : l'identifiant du projet Vercel écrit dans la roadmap
répondait 404 ; je l'ai rapporté en laissant entendre que le projet avait
disparu. Le bot Vercel a donné la vérité une heure plus tard : le projet était
vivant, avec exactement cet identifiant, dans exactement l'équipe interrogée —
mon jeton n'avait pas de portée dessus. La roadmap avait raison depuis le début,
et j'avais jeté le doute sur elle.* La formulation juste existe et ne coûte rien :
« je ne peux pas le vérifier avec mes accès », avant la valeur.

**UN CHEMIN CRITIQUE SE MESURE, IL NE SE RAISONNE PAS** *(2026-09-13)*. Dire à
Paul « fais X d'abord » est un livrable au même titre qu'une URL ou un chiffre :
c'est une valeur qu'il va **croire et exécuter**, donc elle se lit à la source.
⛔ Un ordre de priorités déduit de ce qu'on vient de coder est un biais, pas une
analyse — on met en tête ce qu'on a en tête. *Incident : j'ai donné deux fois
« poser les variables Gmail » comme priorité n°1 du chemin critique, parce que
le lot que je venais de livrer portait dessus. Une requête sur les 13 devis a
montré l'inverse : les 10 devis de la voie email n'ont ni montant ni lien, donc
Gmail alimente la RELANCE et pas l'ENCAISSEMENT ; le jalon « premier euro » ne
tenait qu'à deux gestes Stripe, sur un devis déjà signé à 4 572,70 €. Paul
n'avait pas encore agi — la facture aurait été un geste inutile posé en premier.*
Le geste juste tient en une requête : **avant d'ordonner des priorités, demander
à la base où est réellement le blocage.**

**UNE AFFIRMATION SUR UNE CIBLE QUI BOUGE PÉRIME ENTRE L'ÉCRITURE ET LA LECTURE**
*(2026-09-11)*. Écrire « CI verte » dans un corps de PR le rend vrai pour la tête
de ce moment-là, pas pour celle que Paul lira. Le document survit à la mesure.
⛔ Ce qui se dit d'un objet mouvant se DATE ou se rattache à son identifiant :
« verte sur `50aa0a4` », pas « verte ». *Incident : la mention est restée exacte
pour la tête de code et fausse deux minutes pour la tête courante, le temps d'un
commit de documentation. Repéré et dit avant que Paul ne le lise — mais c'est le
hasard du calendrier qui l'a permis, pas la méthode.*

**UN LIEN REMIS À UN TIERS DOIT SURVIVRE À CE QU'ON S'APPRÊTE À FAIRE DU DÉPÔT**
*(2026-09-11)*. Paul voulait envoyer le site SPC à un avis extérieur. Je lui ai
donné l'**alias de branche** de la préversion Vercel — vérifié vert à l'instant
où je le donnais, et condamné à mourir à la fusion de la PR, que Paul a demandée
au message suivant. Rattrapé de moi-même avant l'envoi, mais de justesse : entre
les deux messages, le lien pouvait déjà être parti chez son destinataire. Ce qui
se remet est l'**URL immuable du déploiement**, qui ne dépend d'aucune branche ;
l'alias de branche ne sert qu'en interne. *Un lien vert à l'instant du contrôle
n'est pas un lien qui tiendra : ce qui s'éprouve, c'est sa durée de vie face aux
gestes DÉJÀ PRÉVUS sur le dépôt — c'est la famille du garde-fou qu'on n'éprouve
que du côté qu'on emprunte tous les jours.*

**UNE AUTORITÉ QUI NOMME LE CHAMP SANS NOMMER LE FICHIER FAIT CHERCHER — ET ON
TROUVE UN LEURRE** *(2026-09-13)*. La garde de publication d'artisan-builder
nommait `legal.assureur` et les deux champs de décennale ; le document de
passation la désignait comme l'autorité (« demandez à la garde, pas à un
document ») ; et aucun des deux ne disait dans quel fichier les poser. Une séance
d'épreuve a ouvert `mentions-legales/page.tsx` — réflexe naturel — qui AFFICHE
les trois champs sans être l'endroit où on les écrit, puis a dû lancer un `grep`
pour trouver `content.ts`. *Un diagnostic qui n'indique pas l'endroit n'est pas
terminé, et le premier endroit qu'on ouvre est souvent celui qui affiche, pas
celui qui définit.*

**UNE LISTE DE « CE QU'IL RESTE À OBTENIR » SE PÉRIME ; UNE MESURE NON**
*(2026-09-13)*. Le README de SPC réclamait sept champs légaux dont **quatre
étaient déjà renseignés depuis six jours**, par un NB situé deux paragraphes plus
haut dans le même fichier. Une séance qui la suivait s'est vue renvoyée collecter
une information déjà collectée — exactement la dérive dont ce README se plaignait
lui-même. *Remplacer la liste par la commande qui la rend, et dater ce qui reste
écrit.*

**FAIRE RELIRE SON TRAVAIL PAR UNE IA ADVERSE MARCHE — À CONDITION DE RE-LOCALISER
CHAQUE CONSTAT AVANT D'AGIR** *(2026-09-13, première fois que le dispositif est
éprouvé)*. Paul a fait tourner chez ChatGPT le prompt adverse que j'avais écrit
contre le PDF de la boussole. Le retour — 17 exigences ancrées page par page —
a trouvé **quatre défauts réels que je n'avais pas vus**, dont deux dans du code
en production : `Number(m.monthlySearches)` fabriquait un zéro depuis `null`, et
`generateKeywordIdeas` n'était pas paginé (une page courte se lisait comme la
fin d'une collecte). Il a aussi corrigé une arithmétique que je venais de
publier. ⇒ **Le dispositif vaut d'être refait.**

⛔ **Mais une revue qui n'a pas exécuté le code décrit le DOCUMENT, pas le
SYSTÈME.** Sa toute première exigence demandait de « supprimer ce modèle
×1,22 **dans le moteur** » : il n'y était pas — il ne vivait que dans le
générateur du PDF et dans le cadrage. Appliquer le constat là où il le disait
aurait fait chercher, puis modifier, du code qui n'existait pas. De même, cinq
de ses dix-sept exigences portaient sur un outil **non encore écrit** : ce sont
des spécifications, pas des correctifs, et les traiter comme des bugs aurait
ouvert un chantier de plusieurs semaines sous l'étiquette « corriger ».

*Le geste qui rend une revue externe exploitable tient en trois colonnes, et il
se fait AVANT la première ligne de code :* **où est-ce vraiment** (grep, pas
mémoire) · **est-ce un défaut actif, une spec, ou déjà résolu** · **qu'est-ce
que ça casse concrètement**. Sans ce tri, on hérite du plan de quelqu'un qui
n'a pas ouvert le dépôt. ⚠️ Et ce tri ne dévalue pas la revue : c'est parce
qu'elle ignore le dépôt qu'elle attaque ce que l'auteur ne peut plus voir.

**ON FAIT RELIRE CE QUI A ÉTÉ ÉCRIT AVEC INTENTION, PAS CE QU'ON DOUTE**
*(2026-09-13, corollaire du précédent)*. Les trois cibles que j'avais moi-même
désignées comme les plus faibles dans le prompt adverse (les fragments de
dictée, l'ordre du pre-mortem, la veille indéfinie) ont donné des retours
**justes mais attendus** — je les avais déjà nommées. Les quatre vraies
trouvailles sont venues d'endroits que je n'avais pas signalés, parce que je les
croyais bons. *Désigner ses points faibles à un relecteur oriente son attention
vers ce qu'on sait déjà ; la valeur est dans ce qu'on ne pense pas à lui
montrer. Le prochain prompt adverse ne nommera donc pas mes doutes : il exigera
une passe exhaustive sur ce que j'affirme le plus tranquillement.*

---

## 4. Conduire une boucle

**LE COMMENT AVANT LE TRAVAIL** *(directive EL)*. Étapes, moyens, critères de
réussite explicités avant d'exécuter. En pratique : **la maquette avant le
code**, éprouvée le 2026-08-01 sur VRANESH et DRAUKHAIN.

**UNE SEULE BOUCLE À LA FOIS, ET ON CAPITALISE** *(directive EB)*. Ne jamais
passer à autre chose sans avoir bouclé : livrée, vérifiée, committée, annotée.
Les documents de cadrage sont la source unique ; ne jamais re-scanner ni
re-décider ce qui y est déjà consigné, ne jamais créer de document parallèle.

**RÉ-ÉPROUVER CE QUI VIENT D'ÊTRE LIVRÉ** *(directive DR, 2026-09-06)*. Un test
qui passait passe encore ; le relancer n'apprend rien. Un dry run **attaque** :
il casse volontairement le code et exige que le harnais vire au rouge. ⛔ Les
failles trouvées se corrigent **dans le même passage**. Et **un dry run qui ne
trouve rien se dit aussi** : sans cette ligne, il ne se distingue pas d'un dry
run non fait.

**UNE CONSIGNE DE SÉANCE NE SE PÉRIME PAS À L'OBJET SUIVANT** *(2026-09-13)*.
Paul dit « coupe l'abonnement » sur une PR ; la consigne porte sur la SÉANCE, pas
sur cette PR-là. ⛔ Un réflexe d'outil — ici « après avoir créé une PR, s'y
abonner » — n'a pas autorité sur une instruction explicite, et il se rejoue
d'autant plus facilement qu'il est automatique : personne ne le décide, donc
personne ne le rattache à ce que Paul vient de dire. *Incident : trois
réabonnements dans la même séance après « coupe l'abonnement aussi », sur #155,
#156, #226 et #227 — treize notifications lues pour rien, quatre désabonnements,
et à chaque fois Paul a vu passer du bruit qu'il avait explicitement refusé.* Le
geste juste : quand une consigne contredit un réflexe, c'est le réflexe qui
cède, et il cède **pour toute la séance** — se redemander « est-ce qu'il me l'a
déjà interdit ? » avant l'automatisme, pas après.

⛔ **ET CETTE LEÇON A ÉTÉ REJOUÉE DANS L'HEURE QUI A SUIVI SON ÉCRITURE**, sur
les deux PR qui la portaient. C'est la partie qui compte : **écrire une leçon ne
désarme pas le réflexe qui l'a causée.** Un automatisme ne se corrige pas en le
décrivant — il se corrige en plaçant la vérification **dans le geste lui-même**.
Ici : l'abonnement se décide au moment de créer la PR, donc c'est là, dans la
même respiration que l'appel, qu'il faut se demander si Paul l'a interdit. Toute
leçon portant sur un réflexe doit nommer **le geste exact où la question se
pose**, sinon elle décrit une faute au lieu de l'empêcher.

**FERMER UNE DÉCISION NE CHIFFRE PAS CE QU'ELLE COÛTE** *(2026-09-11)*. D10 a
été validée — un numéro de téléphone dédié par artisan — alors que son prix
mensuel n'avait jamais été lu à la source. L'architecture était actée, la marge
toujours inconnue. Le risque est de lire « toutes les décisions sont fermées »
comme « plus rien ne pend ».

**EXTRAIRE PLUTÔT QUE DUPLIQUER, QUAND UN HARNAIS COUVRE** *(2026-07-30)*. Un
composant réclamé par un second appelant se **déplace** vers son propre module,
il ne se recopie pas. Le harnais dédié rend l'opération sûre : il doit passer
**sans retouche**, c'est le critère de réussite de l'extraction.

**RÉUTILISER AVANT DE REFAIRE.** Modèles déjà conçus, fixtures en cache, une
seule fusion par boucle. Conception et implémentation lourdes partent en agents,
pour préserver le contexte du fil principal ; les synthèses seules remontent.

**`git checkout --` NE RESTAURE PAS UN FICHIER NON SUIVI** *(2026-09-13)*. Une
boucle de sondes de dry run annulait chaque sabotage par `git checkout -- <fichier>`.
Sur les fichiers **non suivis** — ceux que la séance venait de créer — la commande
échoue sans rien restaurer : trois sabotages sont restés en place, et le même
`checkout` a par ailleurs **annulé du travail légitime** sur un fichier suivi
qu'il fallait garder, qu'il a fallu réécrire entièrement. Coût : une dizaine de
minutes et une réapplication complète. *Une sonde se restaure depuis une copie
prise avant, jamais depuis git : git ne connaît pas ce qu'on vient d'écrire.*

**UN CHAMP DONT LE REFUS EST VALIDÉ EN CONTINU ENFERME CELUI QUI SAISIT**
*(2026-09-13)*. `renommerActivite` refusait un libellé vide — règle d'apparence
saine. Le champ étant piloté par l'offre validée, la **dernière lettre devenait
ineffaçable** : impossible de vider pour retaper. Le nom vide est un ÉTAT DE
SAISIE ; c'est la validation d'étape qui refuse le passage, et le schéma qui reste
le second verrou. Trouvé en relisant le diff en adversaire, pas par un clic.
*Distinguer ce qui est interdit de ce qui est simplement pas encore fini.*

**UNE RÈGLE ABSOLUE QUE LE DÉPÔT CONTREDIT DÉJÀ N'EST PAS UNE RÈGLE**
*(2026-09-13)*. « Tout champ nouveau se pose avec `.optional()`, jamais
`.default()` » — trois contre-exemples légitimes dans les fichiers que la règle
désignait, dont un posé par le chantier même qui l'énonçait. Le critère réel est
l'**omissibilité en entrée** : `.default()` est permis imbriqué dans un
`.optional()`, ou sous un parent déjà obligatoire. Relevé par une séance
d'épreuve. *Une règle qu'on ne peut pas appliquer sans exception non écrite
n'apprend rien à qui ajoute un champ.*

**LA COHÉRENCE GÉOGRAPHIQUE SE VÉRIFIE AVANT DE MESURER, PAS APRÈS** *(Paul,
2026-09-13 : « toujours avoir une cohérence géographique dans nos travaux — et
une cohérence générale aussi bien sûr »)*. Tout relevé, tout référentiel, tout
chiffre montré porte un **territoire**, et ce territoire doit être celui où la
valeur se trouve — pas celui qui était à portée de main. La question se pose
**avant** de choisir le périmètre, et elle se lit **en base**, jamais de
mémoire : *où sont les clients, les données, la valeur ?*

*Incident : le premier import Google Ads a relevé l'**Oise** — 337 284 lignes,
12 mois, une journée de travail, six défauts trouvés et fermés — alors que les
clients de Paul sont **106 dans le Rhône**, 15 dans l'Ain, 11 en Isère… et
**0 dans l'Oise**. La mesure était juste, l'outil solide, et il ne servait
personne. Le contrôle coûtait une requête de trente secondes, posée après coup.*

⛔ **Corollaire, et c'est lui qui porte** : la cohérence ne vaut pas que pour la
géographie. Un périmètre — zone, période, métier, population, échantillon —
hérité d'un exemple de documentation, d'une valeur par défaut ou de la première
chose testable est un périmètre **non choisi**. Et rien ne le signale, parce que
le résultat, lui, a l'air parfaitement propre.

**CE QUI REND INTÉGRABLE UN PAQUET DE CODE ÉCRIT HORS DU DÉPÔT** *(2026-09-13,
première fois que l'exercice ne coûte rien — à retenir pour le refaire)*. Paul a
fait produire chez ChatGPT une passe de forme complète sur le site SPC : onze
fichiers, appliqués ici **sans un seul conflit**, vérifiés et committés dans la
foulée. Ce n'est pas de la chance, et les raisons se recopient :
① **le commit de base est nommé** (`717a8a1`), pas « la dernière version » — un
`git apply --check` répond alors oui ou non, au lieu d'une fusion à la main ;
② **le patch ET les fichiers complets** sont livrés, avec la consigne de n'en
utiliser **qu'un seul** : les copies servent à comparer, jamais à écraser ;
③ **un manifeste d'empreintes** base + résultat pour chaque fichier — l'intégration
se prouve d'un `sha256sum`, elle ne s'affirme pas ;
④ **les limites sont écrites d'avance** : ce qui n'a pas été exécuté (une recette
sans sa fixture), ce qui n'est pas mesuré (« une amélioration visuelle n'est pas
une preuve de conversion »), ce qui reste interdit (schéma, registre, garde,
migrations). Une livraison qui liste ce qu'elle ne prouve PAS est la seule qu'on
puisse croire sur ce qu'elle prouve ;
⑤ **la publication reste distincte de l'intégration** : le paquet dit lui-même
que la garde affiche toujours ses huit blocages et qu'un retour 0 hors production
n'autorise rien.
⛔ *Ce qu'il faut quand même faire soi-même, et qui n'est pas facultatif* : relire
le diff en adversaire et **rejouer tout le harnais dans SON environnement**. Ici
c'est ce geste qui a trouvé le faux positif ci-dessus (§2), un logo d'en-tête qui
pointait sur le lien d'évitement au lieu de l'accueil, et une donnée devenue
morte qui portait un engagement jamais validé par le client. *Un paquet qui
s'applique proprement n'est pas un paquet vérifié.*

---

## 5. Plusieurs dépôts, plusieurs séances

**LE PATRIMOINE COMPLET AVANT FUSION** *(2026-07-22)*. Avant toute fusion
touchant le front, le routage ou un renommage large, lancer les harnais **en
entier**, pas seulement ceux du fichier modifié. Un changement de liens a laissé
un harnais rouge, invisible car seuls deux autres avaient été relancés ;
rattrapé bien plus tard.

**REPRENDRE LA BRANCHE DE `origin/main` APRÈS CHAQUE SQUASH-MERGE**
*(2026-07-22, complétée le 2026-09-11)*.
`git fetch origin main && git checkout -B <branche> origin/main` **avant** tout
nouveau commit. Ne jamais empiler sur l'historique pré-squash : source de
conflits de merge récurrents.
⊕ **Et le distant, lui, porte encore l'ancienne tête** : le push suivant est
refusé (« non-fast-forward »). Le geste est alors un `--force-with-lease`, mais
**seulement après avoir prouvé qu'il ne détruit rien** :
`git diff --stat origin/main origin/<branche>` doit être **vide** — le contenu
de la branche distante est déjà dans `main`, seuls ses commits pré-squash
subsistent. Un diff non vide veut dire qu'un travail non fusionné y dort : on le
rebase, on ne force pas. *(Rejoué le 2026-09-11 : la leçon disait quoi faire du
local et rien du distant, donc elle s'arrêtait juste avant le geste qui bloque.)*

**UN CLONE SUPERFICIEL NE SUIT QUE `main`, ET `--force-with-lease` REFUSE ALORS
TOUT** *(2026-09-11)*. `git clone --depth 1 -b main` écrit un refspec réduit :
`+refs/heads/main:refs/remotes/origin/main`. Un `git fetch origin <branche>`
ne crée donc **aucune** référence de suivi pour cette branche — et le bail de
`--force-with-lease`, qui se compare à cette référence absente, échoue sur
« stale info » **quelle que soit** la réalité du distant. Le réflexe dangereux
est de tomber dans `--force` : il écraserait sans rien avoir vérifié. Les deux
gestes justes, dans cet ordre :
1. fetcher en NOMMANT la destination —
   `git fetch origin <branche>:refs/remotes/origin/<branche>` ;
2. ou mieux, **nommer le commit qu'on accepte de remplacer** —
   `--force-with-lease=<branche>:<sha lu par git ls-remote>`. Le sha se lit à la
   source, jamais de mémoire.

⛔ **Et ce qui a failli passer, ce jour-là, vaut plus que la manœuvre** : ma
garde disait « `git diff --stat origin/main origin/<branche>` est vide, donc
rien à perdre » — alors que la commande **plantait** sur une référence
inconnue, et que `wc -l` comptait ses zéro ligne de sortie. *Une recherche
d'absence est verte sur une commande qui échoue.* Le verrou : exiger que la
commande **réussisse** avant d'interpréter son silence, et lui adjoindre un
témoin positif — ici, la même comparaison contre ma propre tête, qui doit,
elle, rendre un écart non nul.

**UNE PR QUI DORT SE FAIT DOUBLER** *(2026-07-30)*. Quand un autre fil pousse
sur `main` — constat : quatre avancées en une séance — rebaser puis fusionner
**sans délai**, sinon le rebase est à refaire. Un conflit sur
`memoire/JOURNAL-DECISIONS.md`, où deux séances écrivent le même jour en fin de
fichier, se résout **toujours par concaténation** : garder les DEUX entrées,
jamais arbitrer entre elles.

**RÉSOUDRE UN CONFLIT NE SE VÉRIFIE PAS AVEC `git diff --check`** *(2026-09-11)*.
Un merge peut porter PLUSIEURS zones de conflit dans le même fichier. J'en ai
résolu une, committé, poussé — et les marqueurs de la seconde sont partis avec.
`FINUBAR.md` n'était plus du JSON, et la suite est restée VERTE : aucun test ne
lit ce fichier. Mesuré ce jour-là, et c'est le point qui compte :

| Commande | Voit les marqueurs ? |
|---|---|
| `git diff --check` (après `git add`) | **non** — l'index les a absorbés |
| `git diff --cached --check` | **oui**, ligne par ligne |
| `git commit` | **non**, il passe sans rien dire |

⛔ Donc : après un `git add` de résolution, c'est `git diff --cached --check` qui
garde, et lui seul. Et quand le fichier résolu a une FORME (JSON, YAML), on la
reparse avant de committer.

⛔⛔ **ET LE REPARSE DOIT ARRÊTER LE COMMIT, PAS L'ACCOMPAGNER.** Une heure plus
tard, même journée, la faute s'est rejouée **en pire** : `--cached --check`
était vide, `JSON.parse` ÉCHOUAIT, et le commit est parti quand même — le parse
tournait en bout d'enchaînement, dans un `node -e` dont le code de sortie ne
gardait rien. *Un contrôle qui n'ARRÊTE pas n'est pas un garde-fou : c'est une
ligne de sortie qu'on peut ne pas lire.* La forme qui garde :

```
node -e "JSON.parse(...)" && git add F && git diff --cached --check && git commit
```

Le parse en TÊTE du `&&`, avant `git add` : son échec empêche le commit.
*Corollaire, de la même famille que « un garde-fou qui cesse de fonctionner doit
le dire » : un fichier qu'aucun harnais ne lit n'a pas de garde-fou du tout, et
sa corruption se présente comme une CI verte.*

**UN PROJET RENOMMÉ LAISSE DES NOMS MORTS LÀ OÙ ILS COÛTENT LE PLUS CHER**
*(2026-09-11)*. Paul a cherché « Artilib », le dossier vivait sous « Artidispo »,
et le chapitre d'architecture faisait encore créer un dépôt `RenoRDV` : trois
noms pour un produit sans une ligne de code. Ce qu'il faut chasser après un
renommage, ce ne sont pas les occurrences, ce sont les **valeurs qu'un lecteur
va exécuter** — nom de dépôt, domaine, URL. Les occurrences historiques peuvent
rester : elles racontent la décision.

**UNE SÉANCE NE PEUT PAS ATTACHER UN DÉPÔT D'UN AUTRE PROPRIÉTAIRE**
*(2026-09-11)*. Sept dépôts sur huit ont reçu les leçons en une passe ; le
huitième, `paggerard-boop/ripair`, a été refusé — une séance déjà ouverte sur
des dépôts de `PaulGERARD161098` ne peut pas en attacher un d'un autre compte.
Ce n'est pas contournable depuis la séance : il faut en ouvrir une sur ce dépôt.
*À savoir AVANT d'annoncer « tous les dépôts », pas après.*

**UNE ANTÉRIORITÉ SE CHERCHE SUR LE NOM, JAMAIS SUR LE MÉTIER** *(2026-09-06)*.
Une mesure disait « aucune plateforme de rendez-vous nommée Artilib n'apparaît
en recherche ». Exact, et sans valeur : l'homonyme n'était pas une plateforme de
rendez-vous, c'était une société de logiciel du même département. Le nom est
tombé le jour même de sa validation.

**UN FICHIER PARTAGÉ SE RECONSTRUIT SUR LA BASE OÙ ON POUSSE, PAS SUR CELLE QU'ON A
LUE** *(2026-09-13)*. `memoire/LECONS.md` a été lu au sceau **v9**, enrichi de
quatorze entrées, scellé **v10** — et pendant ce temps une AUTRE séance avait
fusionné sa propre leçon et scellé **v11**. Pousser le fichier tel quel aurait
**effacé sa leçon**, silencieusement, dans le fichier même qui existe pour ne
rien perdre. C'est la ligne d'empreinte en tête qui l'a montré, au moment du
`git checkout` : v11 sur la base, v10 dans la main. Le geste juste a été de
réappliquer les quatorze entrées SUR la v11, puis de re-sceller en v12 — et de
vérifier par `grep` que les deux apports survivaient. *Sur tout fichier à copies
multiples : relire la base juste avant de pousser, comparer les sceaux, et
reconstruire — jamais écraser. Et la vérification se fait sur le CONTENU des deux
apports, pas sur le fait que le sceau a changé.*

---

## 6. Économie

**ÉCONOMIE DE CONTEXTE.** Sous-agents pour les gros volumes de lecture,
synthèses seulement dans le fil principal. Tiers de modèle économe par défaut ;
escalade **signalée** uniquement sur les sujets à risque — droits d'accès en
base, authentification, middleware, décision d'architecture.

**ON NE RAPATRIE PAS UN FICHIER ENTIER POUR EN LIRE UNE LIGNE** *(2026-09-11)*.
Mesurer l'état des huit copies de CE fichier demandait exactement **une ligne
par dépôt** : le sceau, en tête. J'ai rapatrié **cinq fichiers entiers** par
l'outil de lecture GitHub, qui ne sait pas tronquer — environ 110 Ko pour cinq
lignes utiles, dans une séance où le reste du travail avait encore besoin de
place. Le même constat s'obtenait pour rien :
`git show origin/main:<chemin> | head -1` sur un clone déjà là, ou un clone
superficiel là où il n'y en avait pas.
⛔ **Le réflexe qui manquait est une question, pas un outil** : *quelle fraction
du fichier répond à ma question ?* Si c'est une ligne, c'est `git` qui répond —
jamais l'outil qui rend le document complet.

⊕ **Et son corollaire, qui a bien tenu le même jour : ce qu'on DÉPLACE ne doit
pas traverser le contexte.** La propagation du fichier aux sept dépôts s'est
faite par clone, copie, commit, push — le contenu n'est jamais passé en
paramètre d'outil. L'écrire par un outil d'écriture distante aurait fait
transiter 22 Ko **sept fois**, pour un fichier qu'aucun de nous n'avait besoin
de relire. *Un octet qui passe par le fil coûte ; un octet que `git` déplace de
disque à disque ne coûte rien.*
