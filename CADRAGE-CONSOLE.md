# CADRAGE-CONSOLE — Ultima, la plateforme-console à 4 quadrants

> Cadrage du pivot majeur dicté par Paul le 2026-07-12. Même méthode que
> REFONTE-ACCUEIL.md / REFONTE-ARBRE.md : on cadre AVANT tout code. Source de
> vérité du pilotage : CADRAGE-ULTIMA.md (ÉTAT). Ce fichier détaille la vision
> plateforme ; il ne double aucun autre doc.

## 1. Vision — d'un outil unique à une plateforme

**Ultima** cesse d'être un outil unique (carte/arbre du réseau) pour devenir
la **plateforme personnelle de Paul**, organisée en **console** — même structure
que la console de Rennes Boost. Un seul pilote : **Léo**. Un seul repo. Une
**mémoire inter-segment** (Léo relie ce qui se répond d'un quadrant à l'autre).

La carte/arbre du réseau déjà construite n'est **pas jetée** : elle **devient le
premier quadrant** (TRAVELER). Capitaliser sur l'existant, comme toujours.

## 2. La console d'accueil

Page d'accueil = **console de sélection** :

- **Bandeau haut** : « Bienvenue sur Ultima ».
- **Invite** : « Sur quoi est-ce qu'on travaille aujourd'hui ? ».
- **Délimitation en 4 quadrants** (badges/cartouches cliquables), un par outil.
- **Registre visuel** : antique et sérieux (décision 2026-07-08, maintenue) —
  carte savante, parchemin, cartouches, typographie old-style. Rien d'enfantin.
- Chaque quadrant ouvre son outil ; Léo reste l'interlocuteur unique partout.

## 3. Les 4 quadrants (noms de code confirmés par Paul, 2026-07-12)

### 3.1 TRAVELER — le réseau (existant, absorbé)
Outil de réseau commercial : **arbre des contacts**, **carte**, **contacts**,
**relations** (rapprochements pilotables), **journal « où j'en suis »** +
**relances**. C'est tout l'acquis v1→A4 renommé et rangé sous ce quadrant.
Ajout dicté : un **agent de liaison de contacts productif** — repère et propose
les rapprochements à valeur (« lui peut bosser avec lui »), méthode de Paul
obligatoire (qualitatif → chiffré → pilotage). Rôle déjà amorcé chez Léo
(entremetteur, charte §5) — à outiller ici.

### 3.2 BCP — pilotage financier (long terme)
Outil « expert-comptable personnel » : centraliser **tous les revenus** (upload
bulletins de salaire de l'année, autres entrées) **et toutes les charges**
(factures payées, taxes). Fonctions visées : **pilotage mois par mois**,
distinction revenus/charges, **prévision d'impôts**, **échéancier avec rappels**
(« bientôt les impôts », « payer la taxe d'habitation »). Dashboard de pilotage.

### 3.3 ADRAMELECH — bibliothèque d'idées
Ne **jamais rater une idée**. Capture immédiate (surtout vocale), puis la
bibliothèque **classe par thème**, **rapproche** des idées déjà là, **enrichit**
pour rendre l'idée **concrète et exécutable**, **trie** pro / perso / business /
les deux, et cherche la **cohérence avec le reste d'Ultima** (de près ou de
loin). **Dashboard hebdo/mensuel** : combien d'idées ce mois, X inexploitables /
X à raffiner / X réutilisables. Cap : rien perdre, tout enrichir.

**Cartographie & regroupements automatiques (vision Paul, 2026-07-16 — à
provisionner pour la boucle ADRAMELECH).** La carte des idées
(`adramelech/carto-idees.html`, livrée en statique) est le socle visuel ;
elle grandira à chaque idée. À l'échelle, l'affichage brut ne suffit plus :
c'est **l'agent (`agent-idees`) qui doit faire le tri**, pas l'interface qui
déverse la donnée. Exigences actées :
- **Regroupement thématique automatique** : l'agent rassemble les idées
  communes en **archipels cohérents par thème** (un archipel = une famille
  d'idées), au lieu d'une liste plate qui enfle.
- **Tri pertinent, pas brut** : la valeur est dans la qualité du
  rapprochement (pertinent, cohérent, intéressant), pas dans le volume
  affiché. L'agent propose les regroupements ; Paul valide.
- **Ponts entre idées** : l'interface matérialise les liens (comme les
  routes de synergie déjà dessinées entre GLANEUR/INTENDANT/MYCÉLIUM/PROTÉE),
  y compris inter-segments (une idée ↔ un contact TRAVELER, ↔ une dépense BCP).
- **Zéro perte** : tout est cartographié, rien ne tombe hors carte — le tri
  réorganise, il n'écarte jamais.
Implémentation différée (pas de code produit tant que la boucle ADRAMELECH
n'est pas ouverte) ; le champ **Thème** déjà présent dans `adramelech/IDEES.md`
est l'axe de regroupement de départ.

### 3.4 IMLADRIK — développement personnel
Outil intime de progression (héritier du Starlog de « Claude Normal ») :
**objectifs de vie**, **journal**, **valeurs et principes**, **prise de recul**
(« tel un pointilliste qui recule pour voir le portrait »), **rappels** de ce que
Paul veut vivre — des rappels, **pas du jugement**. Aide à rester **fidèle à ses
principes** et à ne pas « faire n'importe quoi ». Enrichi de **citations**
(philosophiques, chevaleresques, guerrières, spirituelles), d'un **quart d'heure
quotidien** sur un thème (culture générale, religions comparées — charité dans le
christianisme / islam / judaïsme…), et de **suggestions culturelles** issues du
web (musées à Paris cette semaine, lectures, extraits). Beaucoup de commande
vocale. Dashboard de suivi comme les autres.

## 4. Principes transverses (les 4 quadrants les partagent)

- **Un seul pilote** : Léo, sur tous les quadrants. Paul ne parle qu'à Léo.
- **Mémoire inter-segment** : une idée d'ADRAMELECH peut toucher un contact de
  TRAVELER, un objectif d'IMLADRIK peut cadrer une dépense de BCP — Léo fait
  les liens. La mémoire `memoire/` s'étend aux 4 domaines.
- **Un dashboard par quadrant** : Paul est très créatif et change souvent de cap
  → il a besoin de **cadre**. Chaque outil rend son pilotage lisible
  (semaine/mois), comme demandé explicitement.
- **Directive EB (macro-directive, prioritaire)** appliquée partout :
  ① **boucler** une chose avant de passer à la suivante ; ② **capitaliser sur
  l'existant** avant de créer du neuf. C'est le garde-fou n°1 d'une plateforme
  à 4 fronts.
- **Rappels/échéanciers** : motif récurrent (BCP fiscal, ADRAMELECH bilan
  mensuel, IMLADRIK quart d'heure quotidien) → brique transverse à mutualiser.
- **Registre antique et sérieux** partout, jamais au prix de la lisibilité,
  l'accessibilité ou la sécurité.

## 5. Sécurité — le niveau d'exigence monte d'un cran

Le périmètre de données devient **beaucoup plus sensible** que le seul réseau :

- **BCP** = données financières (bulletins de salaire, factures, impôts) —
  ultra-sensibles.
- **IMLADRIK** = journal intime, valeurs, prises de recul — intimes.

Conséquences (à tenir à chaque boucle) :
- **Mono-utilisateur strict** (seul Paul, décision 2026-07-03) → RLS par compte,
  fail-closed, comme durci en PR #32.
- **Uploads de fichiers** (bulletins, factures) = nouvelle surface d'attaque :
  validation stricte type/taille, stockage privé, **aucune exécution**, pas de
  chemin devinal ; à cadrer avec `securite-auditeur` avant tout code.
- **Chiffrement au repos** de BCP/IMLADRIK : à évaluer (Supabase au repos vs
  chiffrement applicatif) — arbitrage sécurité, gate Paul.
- **Scraping externe** (IMLADRIK) : timeout sortant, validation, aucune fuite de
  données Paul vers l'amont, User-Agent dédié (motif geocode déjà éprouvé).
- **Jamais de PII/finance/intime en logs** (règle CLAUDE.md étendue : IDs seuls).
- Tout ce qui touche RLS/auth/stockage de ces données = **gate + escalade Opus**.

## 6. Léo étendue

- **Léo est féminine** (une femme) — décision Paul 2026-07-12. Charte et profil
  mis à jour (accords au féminin).
- **Mandat élargi aux 4 domaines** : Léo pilote TRAVELER, BCP, ADRAMELECH et
  IMLADRIK, avec la même discipline et les mêmes gates.
- **Recrutement au fil des boucles** (charte §3) : Léo crée les agents/skills
  manquants **quand la boucle du quadrant s'ouvre**, pas tous d'un coup
  (discipline « pas dix lièvres »).

## 7. Carte des agents & skills à prévoir (aplanissement)

Ce dont on aura besoin par quadrant — **créé boucle par boucle**, pas maintenant.
L'équipe actuelle (`securite-auditeur`, `data-ingenieur`, `front-carto`,
`interface-ux`, `graphisme`, `verificateur`) et les skills installés
(`frontend-design`, `theme-factory`, `algorithmic-art`, `webapp-testing`,
`skill-creator`) servent les 4.

| Quadrant | Agents à prévoir | Skills à prévoir |
|---|---|---|
| Console | (équipe front existante) | `frontend-design`, `theme-factory` |
| TRAVELER | existant + **agent-liaison** (entremetteur outillé) | existants |
| BCP | **agent-finances** (compta perso, fiscalité FR, échéances) + data-ingenieur | parsing/OCR bulletins = **externe/coût → gate** |
| ADRAMELECH | **agent-idees** (classement, rapprochements sémantiques) + data-ingenieur | (à évaluer) |
| IMLADRIK | **agent-devperso** (coach fidèle aux valeurs de Paul, curation) | scraping culturel = **externe/coût → gate** |

## 8. Roadmap squelette (une boucle à la fois)

- **C0 — cadrage + mémoire** (cette session) : ce document + implantation
  mémoire + charte Léo + CLAUDE.md. ✅ en cours.
- **C1 — la console** : coque d'accueil (bandeau, invite, 4 quadrants,
  routing), en **réutilisant l'existant** — TRAVELER = l'app actuelle rangée
  sous son quadrant, zéro régression. Reste antique et sérieux.
- **C2…C5 — un quadrant à la fois** : chacun **cadré avant d'être construit**
  (mini-cadrage + previews si visuel), puis livré en boucles A#-style
  (agent → contre-passe sécu + verificateur → commit → gate/merge Paul).
- **Ordre après la console = arbitrage Paul** (voir §10).

## 9. Risques (RC#)

- **RC1 — dispersion** : 4 fronts contredisent « une seule boucle ». Mitigation :
  console d'abord (capitalise), puis **strictement un quadrant à la fois**,
  chacun bouclé avant le suivant (directive EB).
- **RC2 — données ultra-sensibles** (finance + intime) : sécurité de premier
  ordre (§5), gates, escalade Opus sur la surface à risque.
- **RC3 — dépendances externes/coût** : OCR bulletins (BCP), scraping culturel
  (IMLADRIK), éventuelle IA conversationnelle intégrée → **gates Paul**, jamais
  engagées seules.
- **RC4 — re-scope vs « autarcie »** : la décision 2026-07-03 (« autarcie »)
  visait l'isolement d'Ultima **vis-à-vis des AUTRES systèmes de Paul** — elle
  tient. Ce qui change : **à l'intérieur** d'Ultima, on passe d'un domaine à
  quatre, avec mémoire inter-segment. Pas de contradiction, re-scope assumé.
- **RC5 — nommage** : Traveler / BCP / Adramelech / Imladrik confirmés **par
  écrit** par Paul → figés (lexique vocal mis à jour pour les variantes
  entendues).

## 10. Arbitrages ouverts — décisions attendues de Paul

1. **Ordre des quadrants** après la console (C2 en premier ?). Reco Léo :
   commencer par le quadrant le **moins dépendant d'un service externe/coût** —
   ADRAMELECH ou IMLADRIK (données pures, pas d'OCR ni de fiscalité) — pour
   boucler vite et capitaliser, BCP (OCR bulletins + échéances fiscales) ensuite.
2. **Niveau de stockage sécurisé** pour BCP/IMLADRIK : chiffrement au repos
   applicatif exigé, ou RLS + repos Supabase suffisant en v1 ? (sécurité).
3. **Périmètre v1 de chaque quadrant** : tranché au mini-cadrage de sa boucle,
   pas maintenant (pas de spéculation).

> Prochaine action après validation de ce cadrage : ouvrir **C1 — la console**
> (coque réutilisant l'existant), ou d'abord le mini-cadrage du quadrant que
> Paul veut voir en premier.
