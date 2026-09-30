# CADRAGE-RESEAU-CERCLES.md — le réseau en cercles, et le rachat

> Dicté par Paul le 2026-09-21. Deux projets distincts, rangés dans **deux
> quadrants différents** parce qu'ils ne sont pas de même nature.

## ⛔ CE N'EST PAS ENCORE UN CADRAGE AU SENS EL — le gate d'entrée est FERMÉ

Le format 6 points exige ① le but ② les étapes ③ les moyens ④ les critères de
réussite vérifiables ⑤ le hors-périmètre ⑥ le pre-mortem. **Trois de ces six
points sont impossibles à écrire aujourd'hui**, et pas par paresse : une
décision de structure n'est pas prise (voir §4). Ce fichier est donc une
**capture** — ce que Paul a dit, ce qui est mesuré, ce qui manque. Il devient un
cadrage le jour où §4 est tranché, pas avant.

Le nommer `CADRAGE-*` suit la convention du dépôt ; le présent avertissement
existe pour qu'on ne le lise pas comme un feu vert. Un document qui a l'air d'un
cadrage et n'en est pas coûte plus cher qu'un document absent : on exécute
dessus.

## ⛔ Pourquoi ce fichier existe alors que les idées vivent en BASE

ADRAMELECH range ses idées dans `public.idees`, VRANESH ses futurs dans
`public.situations` / `public.scenarios`. **Les deux tables sont mono-utilisateur
avec `owner_id default auth.uid()` et RLS par opération** : une séance Claude
n'a pas de jeton de Paul, elle ne peut donc pas y écrire. Écrire en
`service_role` contournerait la RLS sur des **données intimes** (IMLADRIK §5 =
gate + escalade) : exclu.

Ce fichier porte donc **la charge prête à saisir**, à la forme exacte du schéma,
plus le raisonnement qui ne tient pas dans un enregistrement. ⚠️ **Il ne se
substitue pas à la base** : le jour où les lignes y sont, la base gagne, et ce
fichier redevient ce qu'il est — l'archive d'une dictée.

---

## 1. Le modèle de référence — BNI, mesuré et non supposé

Relevé le 2026-09-21 (sources en fin de fichier). Quatre mécanismes :

| Mécanisme | Ce qui est constaté |
|---|---|
| **Exclusivité sectorielle** | un seul professionnel par catégorie d'activité et par chapitre ; deux du même secteur seulement sur des sous-spécialités distinctes (droit social / droit des affaires) |
| **Rythme** | réunion **hebdomadaire**, tôt le matin (7 h – 9 h 30), en présentiel, toute l'année |
| **Barrière à l'entrée** | ≈ **1 500 € HT/an** — droit d'entrée 250–500 €, cotisation 1 000–2 000 €, repas 12–20 € par réunion |
| **Gouvernance** | chapitres **autonomes**, instances dirigeantes propres, adaptation locale |

⛔ **CE QUE LA DESCRIPTION SPONTANÉE LAISSE TOMBER, ET C'EST LE CŒUR.** La valeur
ne vient pas de l'exclusivité seule : elle vient de **l'exclusivité ET de la
contrainte**. Cotisation payée, présence obligatoire, recommandations comptées.
**L'exclusivité crée l'envie d'entrer ; la contrainte crée le devoir de donner.**
Un cercle sans coût d'entrée ni obligation de présence se vide : chacun vient
quand il a besoin, personne n'apporte. C'est le premier mode de défaillance à
inscrire au pre-mortem le jour où il s'écrira.

---

## 2. ⓐ LE CERCLE — ADRAMELECH, idée **ADR-005**

Mesuré avant d'attribuer le numéro (`select max(adr_num) from idees` → **4**,
4 idées en base au 2026-09-21) : les deux idées de cette capture sont donc
**ADR-005** et **ADR-006**. ⚠️ À remesurer avant saisie si d'autres idées sont
entrées entre-temps — un `adr_num` est unique par owner, un doublon est refusé.

**Charge prête à saisir** (colonnes de `public.idees`) :

- `adr_num` : 5
- `nom` : Le Cercle — réseau local à exclusivité profession × zone
- `type` : Structure de réseau
- `theme` : réseau · business local · recommandation
- `statut` : `à raffiner`
- `partenaire` : Julien *(plus tard — voir la séquence ci-dessous)*
- `epigraphe` : Un seul par métier, un seul par zone, et chacun doit donner.
- `essence` : Recréer à l'échelle de Paul un groupe d'affaires sur le modèle BNI —
  exclusivité d'un professionnel par métier ET par zone, recommandations
  mutuelles, ressources partagées. Fondé sur les logiques de réseau étudiées dans
  son mémoire de Master 2. Topologie voulue : des cercles concentriques, pas le
  chapitre plat et répliqué de BNI. Séquence assumée par Paul : créer de zéro,
  observer ce que ça donne, et n'ouvrir à Julien qu'une fois qu'il y a du
  résultat — « une fois qu'on a fait du blé », pour arriver avec des billes.

## 3. ⓑ LE RACHAT — ADRAMELECH, idée **ADR-006**

- `adr_num` : 6
- `nom` : Rachat d'une entreprise bâtiment / isolation / PAC
- `type` : Opération de croissance externe
- `theme` : rachat · bâtiment · financement
- `statut` : `à raffiner`
- `partenaire` : Julien
- `epigraphe` : Quelques millions, douze à dix-huit mois, un secteur déjà connu.
- `essence` : Rachat d'une entreprise de bâtiment / isolation / pompe à chaleur
  et installation, financé par le groupe Fahrenheit à hauteur de quelques
  millions, dans une optique de 12 à 18 mois. Porté avec Julien.
  ⚠️ Le rôle exact de Julien vis-à-vis de Fahrenheit n'est PAS établi : « aller
  voir Julien pour avoir des billes » et « financée par Fahrenheit » ne disent
  pas s'il est la porte vers le groupe ou un porteur à côté. Ce lien n'est pas
  déduit ici.

**Le pont entre ⓐ et ⓑ**, qui justifie qu'ils vivent dans le même quadrant :
ⓐ produit la preuve et le carnet, ⓑ est le coup de capital. Et ⓑ vise le **même
secteur** que RénoBoost / RénoDevis — le réseau d'artisans déjà constitué est le
terrain de sourcing naturel d'une cible. Le même actif, exploité deux fois.
⚠️ C'est une **observation**, pas une décision : rien ne dit encore que le
sourcing passera par là.

---

## 4. ⛔ LA DÉCISION QUI BLOQUE LE CADRAGE — plat ou concentrique ?

BNI est **plat et répliqué** : des chapitres de vingt à quarante membres, tous
équivalents ; on grandit en **ouvrant un chapitre de plus**.
Paul décrit **concentrique** : des couches de proximité décroissante ; on
grandit en **admettant vers le centre**.

**Ce ne sont pas deux habillages du même objet.** Ils n'ont ni la même règle
d'entrée, ni la même unité de mesure, ni la même façon de scaler :

| | plat (BNI) | concentrique (dit par Paul) |
|---|---|---|
| croissance | dupliquer le groupe | promouvoir vers l'intérieur |
| règle d'entrée | une place libre dans la catégorie | une place libre **et** un parrainage du cercle visé |
| ce qui se mesure | recommandations par membre | passages d'un cercle au suivant |
| risque propre | chapitres qui se cannibalisent aux frontières de zone | cercle extérieur qui ne sert à rien et se vide |

⛔ **Tant que ce point n'est pas tranché, aucune règle d'admission ne peut
s'écrire** — donc ni ② les étapes, ni ④ les critères, ni ⑥ le pre-mortem. C'est
la raison exacte pour laquelle le gate EL reste fermé.

### ✅ TRANCHÉ PAR PAUL LE 28/09 : **CONCENTRIQUE** — pour ⓐ Le Cercle seulement

*Reporté ici le 30/09. Source : la description de la PR
[Ultima-#302](https://github.com/PaulGERARD161098/Ultima-/pull/302), seul
endroit où la décision était écrite — aucun fichier du dépôt ne la portait, ni
sur la branche de #302 ni sur `main` (vérifié par `git log --all -S`).*

⛔ **Le gate reste FERMÉ pour ⓑ Le Rachat** : le rôle de Julien vis-à-vis de
Fahrenheit n'est pas établi.

Trois règles découlent du choix, et aucune ne se déduisait du mot :

| | Règle | Pourquoi elle est forcée |
|---|---|---|
| ① | l'exclusivité ne mord **qu'au centre** | un cercle extérieur est un cercle d'**observation** : l'y rendre exclusif obligerait à refuser le second plombier **avant** de savoir lequel des deux donne |
| ② | la monnaie de promotion est ce qu'on **donne** | le passager clandestin ne monte jamais et reste dehors, où il ne coûte rien — **aucune exclusion à prononcer** |
| ③ | contrainte et coût **ne décroissent jamais** vers le centre | l'inverse viderait le centre. Le nombre de cercles, la cadence et les montants restent à Paul |

- **Pre-mortem, mode n°1** (le cercle extérieur est une salle d'attente qui se
  vide) : il invalide tout le reste, donc **mesurer le vivier dans RIVEN passe
  avant toute invitation**.
- **Mode n°5, non prévenu** : si Paul capte de la valeur sur les affaires de ses
  membres, il cesse d'être neutre. Le modèle de rémunération n'est pas tranché.
- **Prochaine étape** (grain du 28/09) : nommer les cercles — nombre, cadence,
  coût. Décision de Paul, zéro ligne de code ; la règle ③ n'est pas applicable
  sans ces valeurs.

⚠️ **Ce qui n'a PAS survécu** : la PR annonçait « les six points d'EL sont
écrits pour ⓐ ». Ce texte n'est dans aucun commit. Il est à réécrire, pas à
reconstituer de mémoire.

---

## 5. VRANESH — le futur à anticiper (quadrant IMLADRIK)

⛔ **VRANESH n'héberge pas le projet, il héberge le FUTUR.** Sa migration le dit :
*« partir d'un cas donné et dérouler ce qui PEUT arriver, jamais ce que Paul
VEUT — ça, c'est DRAUKHAIN »*. Ce qui va dans VRANESH n'est donc pas « monter le
cercle », c'est **« Paul bascule vers une activité de réseautage pure »**, qu'il
a lui-même qualifié de *futur probable*.

**`situations`** — une ligne :

- `intitule` : Bascule vers une activité de réseautage pure
- `contexte` : Paul envisage d'orienter son activité vers le réseautage
  lui-même — animer des cercles d'affaires en propre — plutôt que vers les
  produits qu'il construit aujourd'hui (RénoBoost, RénoDevis, Artidispo). Le
  déclencheur serait le succès du premier cercle. Fondement intellectuel : son
  mémoire de M2 sur les logiques de réseau.

**`scenarios`** — trois futurs, `vraisemblance` dans {faible, moyenne, forte} :

| # | `deroule` | `vraisemblance` | `signaux` | `parade` |
|---|---|---|---|---|
| 1 | Le premier cercle prend. Les recommandations circulent, les membres paient sans discuter, un deuxième cercle se demande de lui-même. Le réseautage devient l'activité principale et les produits passent au second plan. | `moyenne` | Des membres amènent des candidats sans qu'on leur demande. Le renouvellement de cotisation se fait sans relance. | Décider À L'AVANCE ce que deviennent RénoDevis et Artidispo dans ce cas — vendus, mis en pilote automatique, ou abandonnés. Ne pas laisser la question se poser au moment où le cercle marche. |
| 2 | Le cercle ne décolle pas : cinq membres, personne ne recommande, les réunions s'espacent. Six mois consommés, aucun revenu. | `moyenne` | Deux réunions d'affilée sans une seule recommandation échangée. Un membre qui « ne peut pas venir » deux fois de suite. | Fixer dès le départ un critère d'arrêt chiffré et daté — nombre de recommandations à N mois — et l'écrire avant d'avoir envie de le déplacer. |
| 3 | Le cercle marche, mais il rend Paul indispensable : il anime, il arbitre, il relance. L'activité tourne et ne tient que par sa présence — l'exact contraire du passif visé sur Artidispo. | `faible` | Une réunion annulée parce que Paul n'est pas là. Un différend entre membres qui remonte à lui. | Nommer des rôles dès le deuxième cercle (BNI le fait : instances dirigeantes par chapitre). Le fondateur qui reste le seul animateur n'a pas créé un réseau, il a créé un emploi. |

⚠️ **Le scénario 3 est le plus dangereux parce qu'il ressemble à une réussite.**
C'est aussi celui dont la vraisemblance est la plus discutable : mise à `faible`
faute d'élément mesuré, à réviser par Paul — un cran de vraisemblance posé sans
preuve n'engage que celui qui l'écrit.

---

## 6. Ce qui n'est PAS tranché — à ne pas deviner

1. **Plat ou concentrique** (§4) — bloque tout le reste.
2. **Le rôle de Julien vis-à-vis de Fahrenheit** (§3).
3. **L'orthographe de « Fahrenheit »** — jamais vue écrite, transcrite d'une dictée.
4. **Le modèle de rémunération du cercle** : cotisation, commission sur les
   affaires, ou sourcing pour ⓑ. ⚠️ Si Paul capte de la valeur sur les affaires
   des membres, il cesse d'être l'animateur neutre — c'est une question de
   structure, pas de tarif.
5. **Le coût d'entrée**, qui découle de 4 et conditionne le mode de défaillance
   n°1 du §1.

## 7. Les trois POV proposés, non creusés

Proposés à Paul le 2026-09-21, **en attente de son arbitrage** — la règle du
dépôt est qu'on ne creuse pas un POV sans validation :

- **L'adversaire — le membre qui prend et ne donne pas.** Quel mécanisme
  d'exclusion, actionné par qui ? Que coûte l'entrée, en argent ou en autre chose ?
- **Le premier membre — celui qui rejoint un cercle vide.** Que lui vend-on le
  jour 1 ? Combien de membres avant la première recommandation ?
- **Paul dans deux ans — celui qui vit du réseautage.** Qu'est-ce qui le
  rémunère, et reste-t-il neutre ?

## 8. ⚠️ Ce que ce fichier NE fait PAS

- Il **n'écrit rien en base** (§ en-tête) — ni `idees`, ni `situations`, ni `scenarios`.
- Il **n'ouvre aucun chantier**. Directive EB : Artidispo porte une cible datée
  (20 abonnements actifs au 30/11/2026) et RénoDevis attend deux décisions de
  Paul. Capturer est permis ; exécuter ouvrirait deux boucles de plus.
- Il **ne crée pas de doc parallèle** : les idées restent la propriété
  d'ADRAMELECH, les futurs celle de VRANESH. Ce fichier est un sas, pas une
  source de vérité concurrente.

---

**Sources du §1** (relevées le 2026-09-21) :
lemanagerefficace.fr/bni-avis-et-fonctionnement ·
annuaire-des-entreprises.fr/comprendre-le-fonctionnement-de-business-network-international ·
linkeat.club/bni-prix · plateya.fr/blog/detail/avis-bni-le-vrai-cout-et-pourquoi-ne-pas-y-aller-2026
