<!-- lecons:empreinte v29 2026-09-19 sha256:9ec65c54080d -->
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

**UN COMMIT « HORS MAIN » N'EST PAS UN TRAVAIL HORS MAIN — ON COMPARE LES
CONTENUS, PAS LES SHA** *(2026-09-18)*. Vu RenoBoost sur une branche à sept
commits que `git rev-list origin/main..HEAD` disait absents de `main`, sans PR
ouverte, j'en ai conclu « du travail non intégré » et je l'ai rapporté à Paul
comme tel. Il a donné son GO sur ce constat. **Le travail était sur `main`
depuis trois jours** — PR #459, fusionnée en **squash** : les commits de branche
ne sont ancêtres de rien, leur contenu est pourtant là. `git diff origin/main..HEAD`
rendait **zéro ligne dans les deux sens**. Coût : un merge sans objet, un GO
obtenu sur un constat faux, et un `git push` qui a **recréé une branche distante
supprimée** — que le proxy m'empêche ensuite d'effacer. ⛔ Le dépôt portait DÉJÀ
la leçon du squash, écrite le 15/09, et je l'avais appliquée correctement à
RenoDevis **le matin même** : une leçon retenue sur le dépôt qui l'a payée ne se
transporte pas toute seule sur celui qu'on n'a pas travaillé. *Règle* : sur tout
dépôt qu'on n'a pas soi-même poussé, le premier geste est `git diff origin/main..HEAD`
— l'absence de diff prouve l'intégration, l'absence d'ancêtre ne prouve rien.
Et une référence `origin/<branche>` locale peut désigner une branche **supprimée
depuis** : un `push` la ressuscite au lieu de la mettre à jour.


**UNE VARIABLE QU'ON NE PEUT PAS LIRE NE SE DÉCLARE PAS PRÉSENTE** *(2026-09-15)*.
« `SUPABASE_URL` est déjà défini pour les leads, il sert ici aussi » — affirmé
parce que le code la LIT, jamais parce que je l'avais VUE. Elle était absente de
la production : la capture des leads retombe en silence sur `mailto:` quand elle
manque, donc son absence n'avait jamais fait de bruit. Coût : deux allers-retours
avec Paul, une variable ajoutée pour rien, un redéploiement de plus. *Règle* :
quand aucun outil ne permet de lire une valeur, on ne la suppose pas — on le DIT,
et on fabrique de quoi la mesurer. Ici, deux lignes de journal ont tranché ce que
trois hypothèses n'avaient pas tranché.

**UN REFUS QUI COUVRE PLUSIEURS CAUSES N'EN DÉSIGNE AUCUNE** *(2026-09-15)*. Un
écran « l'accès doit être configuré » recouvrait TROIS causes distinctes, dont
deux ne journalisaient rien. Le symptôme était identique, la correction non. Et
c'est le même défaut que « Origine refusée », corrigé L'AVANT-VEILLE au même
endroit du code, réintroduit ailleurs le lendemain — une leçon apprise à un
endroit ne se propage pas toute seule aux autres. *Règle* : tout refus nomme sa
cause CÔTÉ SERVEUR — le visiteur garde un message unique, on ne lui décrit pas la
configuration ; le journal, lui, dit laquelle des causes a parlé. Les noms de
variables ne sont pas des secrets, leurs valeurs si : on journalise la présence,
jamais le contenu.

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

**UN SIGNAL AUTOMATIQUE QU'ON RÉFUTE DEUX FOIS SE LIT À LA SOURCE** *(2026-09-14)*.
Le hook de fin de tour a annoncé « 1 commit non poussé » après chaque fusion en
squash. Quatre fois j'ai re-mesuré, constaté que tout était sur `main`, et
répondu « fausse alerte » — quatre fois le même tour, quatre fois le même coût.
La cinquième, j'ai ouvert le script : il fait `git rev-list
"origin/$branche..HEAD" --count` **sans fetch préalable**, donc il compare à sa
copie locale de la branche distante. Une fusion en squash ne déplace pas la
branche : elle reste sur le commit d'avant pendant qu'on rebase la copie locale
sur `origin/main`. Le compte de 1 est EXACT, c'est sa conclusion qui ne l'est
pas. ⛔ *Re-réfuter la conclusion d'un automate ne fait rien avancer ; lire ce
qu'il mesure prend deux minutes et remplace n dénégations par une explication —
et par le réglage qui le fait taire.* La règle vaut pour un hook comme pour un
harnais, un compteur ou un advisor : **son verdict est une opinion, sa requête
est un fait.**

**UNE ESTIMATION DE GAIN QUI N'A PAS ÉTÉ MESURÉE EST UNE OPINION** *(2026-09-15)*.
Paul trouve la maquette de la vitrine trop longue. J'annonce quatre coupes
chiffrées « de tête » : retirer une photo de la galerie, ~250 px. Mesure au
navigateur : **zéro pixel**. En mobile, la galerie est un carrousel HORIZONTAL —
retirer une figure ne change rien à la hauteur. Trois autres estimations
s'écartaient du réel d'un facteur deux à cinq. ⛔ *Un gain proposé à Paul se
mesure avant d'être annoncé, surtout quand il paraît évident : c'est justement
l'évidence qui empêche de vérifier.* Et le même passage a démenti la prémisse :
la page n'était pas longue en TEXTE (514 mots contre 2483 pour l'accueil), elle
empilait sept sections aérées — **on allait couper ce qui n'était pas le
problème**.

---

**UNE GÉOMÉTRIE N'EST PAS CE QUI EST VU** *(2026-09-18)*. Un harnais déclarait
qu'un bouton flottant recouvrait une phrase, et il avait tort depuis trois jours.
Il mesurait le texte par `Range.getClientRects()`, qui rend la géométrie du texte
**tel qu'il serait s'il n'était pas coupé** : le rognage d'un ancêtre en
`overflow:hidden` lui est invisible. Le contexte mesurait 147 caractères dans une
colonne de 430 px, s'arrêtait donc à x=743 sous son ellipsis — et son Range allait
à x=1155, croisant un bouton posé à 948. `elementFromPoint` au centre du prétendu
chevauchement rendait le bouton lui-même : **il n'y avait aucun texte là**.

⚠️ La passe précédente avait déjà corrigé ce contrôle, et avait remplacé un biais
par l'autre : la boîte du bloc était trop large, le Range est trop long. **Entre
deux mesures fausses en sens inverse, la bonne n'est aucune des deux** — c'est
leur intersection avec ce qui rogne au-dessus.

⛔ **Et le verdict dépendait d'une longueur de phrase.** L'autre page testée
passait pour la seule raison que son texte faisait 33 caractères et tenait dans
la colonne. Un contrôle dont le résultat bascule selon le contenu, et non selon
le défaut qu'il traque, ne mesure pas ce qu'il croit mesurer — il attend juste
qu'une phrase grandisse.

---

**UNE CLÉ JSON PRÉSENTE N'EST PAS UNE VALEUR PRÉSENTE** *(2026-09-19)*. Le prompt
de reprise du matin annonçait « devis avec `extra.pdf_path` = 3 ». Mesuré le soir :
**un seul**. Les trois lignes portent bien la clé — `extra ? 'pdf_path'` rend 3 —
mais deux d'entre elles contiennent `null`, et `extra->>'pdf_path' is not null`
rend 1. Les deux comptes sont exacts ; ils ne comptent pas la même chose.
⛔ *En JSON, l'existence d'une clé et l'existence de sa valeur sont deux faits
distincts, et c'est toujours le second qui intéresse.* La conséquence dépassait
le chiffre : on croyait trois PDF déposés là où il y en a un, donc les trois
gestes réels étaient encore moins faits qu'annoncé. ⚠️ Un compte qui dépasse la
réalité rassure, et c'est pour ça qu'il ne se remet pas en cause tout seul :
**quand une mesure arrange, la vérifier coûte une requête de plus.**

---

**UNE CAUSE TRANSMISE N'EST PAS UNE CAUSE MESURÉE** *(2026-09-19)*. La séance du
matin avait écrit « plafonds GitHub Actions atteints ». Je l'ai répété pendant
**quatre heures** — dans deux PR, trois commentaires et un rapport — sans le
vérifier une seule fois. Or le démenti était déjà sous mes yeux : **Paul avait
relevé le plafond, et rien n'avait changé**. Ce qui était établi, c'était la
SIGNATURE (job mort en 2-3 s, zéro étape, logs en 404, `main` rouge à
l'identique) — pas sa cause. Quand j'ai enfin cherché : workflow valide, check
run sans titre ni résumé, et `rerun` refusé en **403**. Je n'avais donc ni la
cause ni le moyen de la lever, et je l'aurais su en dix minutes.
⛔ *Un diagnostic hérité se relit comme un fait parce qu'il est écrit au même
endroit que les mesures. Il se re-mesure à la première occasion, et
immédiatement dès qu'un remède appliqué ne produit aucun effet* — un remède
sans effet réfute le diagnostic, il ne prouve pas que le mal est tenace.

---

**CE QU'ON N'A PAS PU VOIR SE DIT, SURTOUT QUAND LE RESTE EST VERT** *(2026-09-19)*.
QA complète de Stellar V2 : 38/38 unitaires, 41/41 navigateur, quatre régressions
trouvées et corrigées, captures livrées. Et **RIVEN connecté n'a jamais été vu** :
sans session, la page ne rend que son écran de connexion. ⚠️ *Un rapport dense en
verts donne à un trou la texture du reste* — le lecteur en déduit une couverture
qu'il n'a pas. L'angle mort se nomme **à côté du vert**, pas en note de bas de
page, sinon les quarante et un harnais se lisent comme quarante-deux.

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

**UN HARNAIS QUI N'EST PAS LE CLIENT DU PRODUIT NE PROUVE RIEN DE CE QUE LE
PRODUIT VIT** *(2026-09-14)*. La connexion d'`artisan-builder` était impossible
en production — pour tout le monde, pendant des heures — alors que
`artisan-builder/tests/verif-workspace-http.mjs` était vert sur cette même
garde. Il appelait `/api/session` en `fetch`, **en posant lui-même l'en-tête
`Origin`**. Or un navigateur ne pose pas cet en-tête : il le **calcule**, et sur
une page servie avec `Referrer-Policy: no-referrer` — ce que sont toutes les
pages privées du dépôt — il envoie « null ». Le harnais décrivait donc une
requête que le produit n'émet jamais, et il le faisait avec l'autorité d'un
contrôle vert. *Ce que ça a coûté* : deux correctifs livrés d'affilée sur une
cause **déduite** de sondes `curl`, dont un qui a fait tourner un secret pour
rien — là où un vrai navigateur a montré la cause en une sonde. *Règle* : quand
la panne vit dans ce que le client **calcule** — en-têtes de navigateur,
politique de cookie ou de referrer, CORS, rendu — le harnais **est** ce
client-là, pas son imitation. Un `fetch` éprouve un contrat HTTP ; il ne dit
rien de ce qu'un navigateur fera de ce contrat.

**UN CONTRÔLE PEUT ÊTRE VERT PAR ACCIDENT, ET SEUL L'ESSAI DE LE CASSER LE
DIT** *(2026-09-15)*. Un harnais de parcours vérifiait l'identité de chaque écran
en cherchant un motif dans le TEXTE ENTIER de la page. Il passait — mais pour la
mauvaise raison : la navigation commune nomme TOUS les écrans, donc « /studio
contient le mot Bibliothèque » est vrai. Le contrôle aurait laissé passer un
Studio qui rendrait l'accueil. Découvert en substituant volontairement un écran
attendu faux, et en constatant que rien ne virait au rouge. *Règle* : un contrôle
neuf se casse AVANT d'être cru — pas relu, cassé. Et un motif d'identité se
cherche dans ce qui identifie (le titre), jamais dans ce qui est partagé.

**IL N'Y A PAS DE BONNE VUE DU DOM, IL Y A LA VUE QUI RÉPOND À LA QUESTION
POSÉE** *(2026-09-15, complète la v21)*. `body.textContent` INCLUT le contenu des
`<script>` : le payload RSC de Next y écrit « $undefined » par dizaines, et un
contrôle « la page n'affiche rien d'inachevé » posé dessus invente un défaut qui
n'existe nulle part à l'écran. `innerText`, lui, cache de vrais défauts — c'est
ce que la v21 a payé. Aucune des deux n'est « la bonne » : pour « ce qu'une
personne lit », on lit les éléments RENDUS, scripts et styles retirés ; pour « ce
qu'un lecteur d'écran reçoit », c'est `textContent` du contenu seul. La question
décide de la vue, jamais l'habitude.

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

**UN GARDE-FOU ÉCRIT CONTRE DES MOTS REND ROUGE LA CORRECTION ELLE-MÊME**
*(2026-09-14)*. Après avoir retiré du site SPC toutes les promesses d'astreinte,
le harnais chargé de les empêcher de revenir a failli interdire le substrat
« dépannage » et « astreinte ». Or le texte CORRIGÉ dit, en toutes lettres,
« SPC n'est pas un service de dépannage d'urgence » et « nous n'assurons pas
d'astreinte » : la règle aurait rougi sur la phrase juste, et la séance suivante
aurait retiré **la mise au point plutôt que la promesse** — exactement l'inverse
de ce qu'on voulait. Il interdit donc des MOTIFS d'engagement (`7j/7`,
`intervenir dans la journée`, `traité en priorité`), pas un vocabulaire.
⛔ *Un contrôle d'absence se relit contre le texte corrigé, pas seulement contre
le texte fautif : s'il rougit sur la bonne version, il enseigne à supprimer la
bonne version.* Et il se double d'un contrôle POSITIF — ici « la réponse doit
toujours dire que SPC n'en est pas un » — sinon on satisfait l'absence en
effaçant aussi ce qui renseigne le visiteur.

**UN CONTRÔLE QUI REGARDE PAR LA SEULE FENÊTRE OÙ LE DÉFAUT N'EXISTE PAS EST
PIRE QU'ABSENT** *(2026-09-14)*. Le H1 de SPC est composé d'un `<span
class="block">SPC</span>` suivi du reste de la phrase. À l'œil : deux lignes.
Dans le flux de texte : **rien ne les séparait** — `textContent` rendait
« SPCvotre expert plomberie… », ce que lisent un lecteur d'écran et un robot
d'indexation. Le harnais était VERT : il lisait `innerText`, qui **fabrique** un
saut de ligne pour un enfant `block` et donc voyait « SPC\nvotre expert… ».
Il regardait la seule projection du DOM où le défaut est invisible.
⛔ *Un contrôle a toujours une fenêtre — une propriété, une API, une vue. Quand
la propriété qu'il interroge NORMALISE ce qu'on veut vérifier, il ne prouve pas
« c'est bon », il prouve « je n'ai pas regardé ».* Et le défaut n'a pas été
trouvé dans le code ni par le harnais, mais en relisant **la page réellement
servie** après la fusion : un octet de séparation manquant ne se voit ni dans
le diff, ni dans une capture, ni dans un test qui normalise. La sonde qui
corrige la classe entière : retirer le séparateur DOIT faire rougir — vérifié.

**UN TEST QUI LIT UNE CONFIGURATION ATTESTE UNE INTENTION, JAMAIS UN EFFET**
*(2026-09-15)*. `tests/preview-vitrine.test.mjs` s'appelait « la future vitrine
devient la page racine » et vérifiait qu'un rewrite `/` → `/preview-vitrine.html`
figurait bien dans `vercel.json`. Vert depuis la veille. Et pendant ce temps,
`www.renoboostia.fr/` servait toujours l'ancienne page : **sur Vercel, un
fichier statique est servi AVANT les rewrites**, et `index.html` occupe la
racine — le rewrite n'était jamais atteint. Le défaut n'a été vu que parce que
Paul a demandé « est-ce que ça a bien été mis à jour ? » et que la réponse est
allée voir l'URL publique, pas le dépôt. ⛔ *Entre la ligne de configuration et
le comportement, il y a un moteur qu'on n'a pas lu. Un garde-fou qui s'arrête à
la configuration occupe la place de celui qui aurait vu le problème — et il
rend le silence rassurant.* Le remplaçant mesure les deux : l'URL existe, ET
personne ne peut re-tenter la bascule par un rewrite tant qu'`index.html` est
là.

---

**UN HARNAIS QUI S'ARRÊTE AU PREMIER ROUGE REND AVEUGLE TOUT CE QUI SUIT**
*(2026-09-18)*. `tests/lancer.sh` passe les unitaires, puis les smoke navigateur.
Le 15/09, `unit-lecons-empreinte` est passé au rouge — le sceau de ce fichier
mentait, la PR #251 y ayant ajouté 47 lignes sans le recalculer. À partir de cette
minute, le job `browser` **mourait avant d'ouvrir un seul navigateur**. Les
soixante contrôles de `smoke-leo-partout` n'ont plus tourné pendant trois jours,
et le Dock Léo (#247, #250) est entré dans `main` sans que son propre harnais
l'ait jamais vu.

⛔ **Une panne en cache toutes les suivantes, et la CI continue de dire « rouge ».**
C'est le piège : un dépôt à la CI rouge n'a pas l'air d'un dépôt aveugle, il a
l'air d'un dépôt qu'on sait cassé. Le rouge du 15/09 et le rouge du 18/09 se
ressemblaient — le premier masquait deux défauts que le second a révélés d'un
coup, dont un faux positif qui aurait bloqué la première PR venue.

⚠️ **Le signe qu'il fallait lire** : personne n'était allé voir POURQUOI la CI
était rouge depuis trois jours. **Un rouge permanent cesse d'être une
information** — il ne se distingue plus d'un rouge nouveau, et c'est exactement
ce qu'on attend d'un garde-fou qu'il fasse.

**Ce que ça change dans le geste** : quand un harnais séquentiel tombe, la
question n'est jamais seulement « qu'est-ce qui a échoué ? » mais **« qu'est-ce
qui n'a pas été exécuté à cause de ça ? »**. Un échec en tête de chaîne se traite
en priorité, non pour le vert, mais pour **récupérer la vue**.

---

**UN HARNAIS QUI N'A JAMAIS TOURNÉ AILLEURS QUE SUR LA MACHINE QUI L'A ÉCRIT NE
GARDE RIEN** *(2026-09-18)*. RenoBoost portait **huit** harnais
`*.navigateur.mjs` — contraste, rendu, géométrie, tout ce qui ne se vérifie
qu'en ouvrant une page. Aucun n'avait jamais tourné en intégration : `node
--test` ne découvre que les `*.test.mjs`, et six d'entre eux codaient en dur le
chemin d'un binaire Chromium propre au poste de développement. La CI était
verte, et ne regardait aucune page. Le jour où ils ont tourné, **cinq défauts
sont tombés d'un coup**, dont un que seule la machine d'intégration pouvait
voir : un `const ROOT = '/home/user/RenoBoost'` — vrai ici, faux partout
ailleurs. ⛔ *Un harnais qu'on ne lance jamais et un harnais qui n'existe pas se
valent exactement — à ceci près que le premier occupe la place du second et
rassure.* **Règle** : un harnais entre dans le dépôt **avec son exécution en
intégration, dans le même commit**. Pas de « on le branchera » : c'est
précisément ce qui ne s'écrit pas.

⊕ **Et l'instrument qui devait les lancer a menti le premier.** Le lanceur que
j'ai écrit ce jour-là annonçait `sortie 0` sur un harnais qui échouait : `bash`
réinitialise `$?` en entrant dans le `else`, et je lisais le code APRÈS le test
au lieu de le **capturer avant**. Trois lignes, et le garde-fou tout neuf
validait tout. ⚠️ **Le même harnais, sous mutation, a PLANTÉ** au lieu de rendre
un verdict — `getComputedStyle(null)` sur un élément que la mutation venait de
retirer : la section suivante n'a jamais tourné, et une trace d'erreur ne se lit
pas comme un échec de contrôle. *Un garde-fou se prouve en le cassant, et la
preuve ne vaut que si le rouge attendu est bien **le rouge du contrôle**, pas une
pile d'appels.*

---

**UN CRITÈRE VRAI MAIS INSUFFISANT EST VERT EXACTEMENT QUAND IL COMPTE**
*(2026-09-18)*. Le harnais du bandeau défilant vérifiait que **la piste déborde
de l'écran**. C'est vrai, c'est mesurable, et ça ne garde rien : la propriété qui
compte est que **les séries restantes couvrent encore l'écran** une fois la
première sortie — `(N-1) × largeur_de_série ≥ largeur_d'écran`. Les deux
coïncidaient tant que le bandeau portait six items. Paul en a retiré un ; sur un
écran large, un trou pouvait s'ouvrir dans le défilé **sans que le contrôle
bouge**. ⛔ *Le défaut n'a pas été révélé par un test, mais par une décision
produit* — c'est-à-dire par hasard, et après coup.

⚠️ **Le signe à reconnaître** : un critère qui mesure une **conséquence** de la
bonne propriété au lieu de la propriété elle-même. Il passe les cas nominaux, il
est facile à écrire, et il cède exactement dans le cas limite pour lequel on
l'avait mis. **Le geste qui manquait tient en une question** : *qu'est-ce qui
rendrait ce contrôle vert alors que l'écran est faux ?* Si la réponse existe, on
ne mesure pas la bonne chose. Ici, elle s'énonçait en une ligne — et le contrôle
réécrit se vérifie désormais à six largeurs d'écran, de 390 à 2560.

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

---

**« BLOQUÉ SUR UNE RÉPONSE DE PAUL » SE RE-MESURE AVANT D'ÊTRE ANNONCÉ**
*(2026-09-19)*. J'ai écrit trois fois, sur deux séances, que la FAQ de la vitrine
« attendait trois réponses de Paul » — la granularité de zone, le mécanisme du
no-show, la liste des métiers. C'était **faux**. La maquette avait absorbé les
trois arbitrages le jour où ils avaient été pris : la zone « se définit ensemble
au premier rendez-vous », la question du no-show avait été réécrite pour promettre
le rappel et non une compensation, et « un seul partenaire par métier » ne demande
aucune liste. Trente secondes de lecture du fichier l'établissaient.

⛔ **Le coût n'est pas l'erreur, c'est ce qu'elle fait faire à Paul.** Sur la foi
de cette note, je lui ai posé une question d'arbitrage qu'il n'avait pas à
trancher — il avait déjà tout tranché. Un blocage annoncé à tort ne se paie pas
en secondes : il déplace un travail vers la seule personne qui ne peut pas le
déléguer, et il peut faire reporter un lot entier.

⚠️ **La forme du piège** : une note de blocage est écrite au moment de la
DISCUSSION d'arbitrage, donc avant que le travail ne l'absorbe. Elle est vraie
quand on l'écrit et périmée quand on la relit — comme une couleur fixe, comme un
grain Finubar. *Règle* : avant d'annoncer qu'une chose attend Paul, on ouvre le
fichier qui la porte. « Ça attendait hier » n'est pas une mesure.

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

**ON COMMITE AVANT DE MUTER — TROISIÈME FOIS PAYÉE** *(2026-09-18)*. La passe
de dry run casse volontairement le code puis restaure par `git checkout -- .`.
Cette commande **écrase tout ce qui n'est pas commité**, y compris le travail
légitime de la demi-heure précédente. Le `CLAUDE.md` d'Artidispo le disait déjà,
payé deux fois le 18/09 au matin — dont une en perdant la réécriture complète
des CGV. Le soir même, j'ai lancé une passe de sept mutations sur un état non
commité : le voile du plan, le placement des libellés, le cadre calculé et le
contrôle multi-largeurs sont partis ensemble, et tout a dû être réécrit de
mémoire. ⛔ *La séquence n'est pas « écrire → tester → muter » mais
**écrire → tester → COMMITER → muter → restaurer**. Une règle qu'on a déjà lue
deux fois et qu'on enfreint quand même n'est pas oubliée : elle n'est pas
outillée. Le geste de muter doit commencer par refuser de tourner si
`git status` n'est pas propre.*

**UN CONTRÔLE QUI MESURE LA MAUVAISE GRANDEUR EST VERT SUR LE DÉFAUT QU'IL
GARDE** *(2026-09-18)*. Un garde-fou sur des pastilles SVG a été écrit trois
fois avant de voir quoi que ce soit. V1 comparait `getBoundingClientRect()` à la
bande : aveugle, un élément rogné par le cadre garde un rectangle plausible qui
tombe toujours dedans. V2 comparait `getBBox()` au `viewBox` : aveugle aussi, et
plus subtilement — en `preserveAspectRatio="slice"`, la zone **réellement
dessinée** n'est qu'un SOUS-ENSEMBLE du `viewBox`, donc « être dans le viewBox »
ne veut pas dire « être dessiné ». V3 passe par `getScreenCTM()`, la
transformation exacte qu'applique le navigateur. ⛔ *Trois mutations réelles ont
survécu aux deux premières versions en restant vertes. Quand une sonde ne
trouve rien, la question n'est pas « le code est-il sain ? » mais **« cette
sonde peut-elle seulement voir ce que je crois qu'elle garde ? »** — et la seule
réponse acceptable est une mutation qui la fait virer au rouge.*

**UNE CONSTANTE GÉOMÉTRIQUE QUI DÉCRIT UN RENDU FINIT PAR LE DÉCRIRE FAUX**
*(2026-09-18)*. Deux cadrages écrits à la main — l'emprise d'une tournée, puis
le `viewBox` « sûr » d'un plan — ont chacun rogné un libellé le jour où autre
chose a bougé : le premier quand le placeur a déplacé une étiquette, le second
dès que la fenêtre a dépassé ~1900 px de large. Les deux paraissaient
inoffensifs et étaient justes le jour où ils ont été écrits. ⛔ *Ce qui décrit
une géométrie rendue se MESURE sur le rendu (`getBBox()`, le rapport réel de
l'élément) ; une valeur en dur n'est légitime qu'en REPLI, quand la mesure est
indisponible — et elle doit le dire.*

**LE DOMAINE SE GARDE À SES DEUX BORDS, PAS AU MILIEU** *(2026-09-18)*. Le même
harnais mesurait 390 / 768 / 1280 / 1600 px et déclarait une page saine.
Ajouter **1000 px** a révélé un texte qui recouvrait la carte ; ajouter
**2200 px** en a révélé un second, de cause inverse — la colonne de contenu
reste centrée quand l'écran grandit, donc elle dérive par-dessus le dessin.
Trois défauts réels vivaient exactement entre les largeurs testées. ⛔ *Une
liste de cas choisie par habitude (« mobile, tablette, portable, grand écran »)
couvre les valeurs courantes, pas les TRANSITIONS. Chercher où le comportement
CHANGE — un seuil de media query, un rapport de forme qui bascule — et mesurer
de part et d'autre.*

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

**LE CHAMP QUE PAUL DÉSIGNE N'EST PRESQUE JAMAIS LE SEUL** *(2026-09-14)*. Il
pointait une ligne — `site.horaires` promettait « dépannage urgent 7j/7 » sur le
site d'Ezzedine — et il a tranché : « c'est un artisan, pas un dépanneur,
enlève ». Corriger ce champ prenait une minute, et **aurait été faux** : le
balayage a rendu **neuf** endroits. La FAQ d'accueil (« nous faisons le maximum
pour intervenir dans la journée »), trois pages métier (« traité en priorité »),
une réponse qui disait **« Oui »** à « intervenez-vous en urgence le week-end ? »,
un bandeau, une fiche prestation, et un bloc entier « En cas d'urgence
plomberie » devenu mort sans que personne le remarque. J'aurais rendu compte de
« c'est enlevé » pendant que quatre pages continuaient de promettre une
astreinte — et c'est le rapport, pas le site, qui aurait menti.
⛔ *Une consigne de Paul nomme le symptôme qu'il a VU : il lit une page, il ne
lance pas un `grep`. Le geste juste tient en quatre temps — balayer la famille
entière AVANT de corriger, appliquer SA règle à chaque trouvaille, agir, puis
lui rendre le constat ET l'action.* C'est « boucher un trou nommé n'est pas
fermer sa classe » (§2) vu de l'autre bout : ici la classe est nommée par
l'utilisateur, et c'est justement pour ça qu'on la croit petite.

**LE SECOND APPELANT RAMÈNE LA DIVERGENCE PAR LA PORTE DE SERVICE**
*(2026-09-15)*. Deux écrans importaient des devis et n'écrivaient pas au même
endroit ; la correction consistait à faire DÉMÉNAGER la logique dans un rail
unique. Fait — puis, trois fonctions plus bas, le versement des anciens devis
appelait `saveDevisCloud` directement. La divergence qu'on venait de supprimer
revenait dans le même commit, écrite par la même main. Elle a été attrapée par
un test d'assemblage qui interdit à tout écran d'enregistrer un devis lui-même.
⛔ *Quand on unifie deux chemins, le test qui compte n'est pas « le rail
marche » mais « personne n'écrit à côté du rail » — et il se pose dans le même
commit, sinon la deuxième porte s'ouvre pendant qu'on admire la première.*

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


**UN OUTIL LANCÉ PAR `npx` SANS INSTALLATION N'EST PAS L'OUTIL DU PROJET**
*(2026-09-15)*. `npx eslint .` a rendu « rien à signaler » deux fois avant que
je remarque l'absence de `node_modules` : npx téléchargeait une autre version,
qui plantait sur la configuration du dépôt (`Cannot find package 'globals'`) et
dont je ne lisais que la dernière ligne. Un lint qui ne prouve rien coûte plus
cher qu'un lint absent : il rassure. ⛔ *Avant de citer le résultat d'un outil
de projet, vérifier qu'on a lancé CELUI du projet — `npm install` d'abord, et
lire la sortie entière, pas son `tail`.*
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
