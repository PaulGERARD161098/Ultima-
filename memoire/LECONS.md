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

**UN DOCUMENT DE DATES N'A AUCUN MÉCANISME DE PÉREMPTION** *(2026-09-11)*. Le
rétroplanning d'Artidispo affichait deux jalons dépassés de trois jours
exactement comme les jalons à venir. Un jalon en retard ne se signale pas tout
seul : il faut le lui faire dire, comme Finubar fait dire à un grain qu'il a
vieilli.

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

**UNE PR QUI DORT SE FAIT DOUBLER** *(2026-07-30)*. Quand un autre fil pousse
sur `main` — constat : quatre avancées en une séance — rebaser puis fusionner
**sans délai**, sinon le rebase est à refaire. Un conflit sur
`memoire/JOURNAL-DECISIONS.md`, où deux séances écrivent le même jour en fin de
fichier, se résout **toujours par concaténation** : garder les DEUX entrées,
jamais arbitrer entre elles.

**UN PROJET RENOMMÉ LAISSE DES NOMS MORTS LÀ OÙ ILS COÛTENT LE PLUS CHER**
*(2026-09-11)*. Paul a cherché « Artilib », le dossier vivait sous « Artidispo »,
et le chapitre d'architecture faisait encore créer un dépôt `RenoRDV` : trois
noms pour un produit sans une ligne de code. Ce qu'il faut chasser après un
renommage, ce ne sont pas les occurrences, ce sont les **valeurs qu'un lecteur
va exécuter** — nom de dépôt, domaine, URL. Les occurrences historiques peuvent
rester : elles racontent la décision.

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
