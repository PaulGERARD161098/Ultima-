<!-- lecons:empreinte v9 2026-09-13 sha256:b9bbba0a3d18 -->
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
