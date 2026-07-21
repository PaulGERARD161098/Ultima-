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

**Directive JL (Paul, 2026-07-18 — l'horizon de cette vision).** À terme,
Ultima est **l'unique interface de travail de Paul** (travail au sens large) :
dès qu'il faut bosser sur quelque chose, il ouvre Ultima et Léo l'oriente sur
**toute sa data**. Un outil unique, sécurisé, propre, qui absorbe toute la data
(projets pro et perso, tout), la dispatche et navigue tout ; un seul
interlocuteur (Léo) ; un outil souple, capable de tout faire ou d'apprendre et
s'adapter. **Rien d'autre ne sera créé** : tout nouveau besoin devient une
extension d'Ultima (un quadrant qui grandit, ou un nouveau segment cadré),
jamais un outil à côté. Tous les travaux doivent être conformes à cette
directive ; la directive EB (§4) reste la discipline pour y aller.

## 2. La console d'accueil

Page d'accueil = **console de sélection** :

- **Bandeau haut** : « Bienvenue sur Ultima ».
- **Invite** : « Sur quoi est-ce qu'on travaille aujourd'hui ? ».
- **Délimitation en 4 quadrants** (badges/cartouches cliquables), un par outil.
- **Registre visuel** : antique et sérieux (décision 2026-07-08, maintenue) —
  carte savante, parchemin, cartouches, typographie old-style. Rien d'enfantin.
- Chaque quadrant ouvre son outil ; Léo reste l'interlocuteur unique partout.
- **MàJ LV2 (2026-07-21)** : cette console à 4 quadrants n'est plus la page
  d'accueil racine — elle est devenue le macro-projet « Ultima » (`/ultima`),
  atteint depuis la **boussole** LV2 (cf. §2bis). Bandeau et invite conservés.

## 2bis. LV2 — la boussole des macro-projets (couche méta, cadrée 2026-07-21)

Le travail de Paul dépasse Ultima seul : d'autres macro-projets existent
(**Renoboost IA**, **YCOME**, et d'autres à venir). LV2 pose une **couche
au-dessus des quadrants** : l'accueil racine `/` devient une **boussole** (rose
des vents, registre carte savante) où **chaque cap = un macro-projet**. Ultima
(les 4 quadrants) n'est qu'un cap parmi d'autres. Coque livrée = LV2-① (cf.
`CADRAGE-ULTIMA.md`). Ce §2bis cadre la **suite** — ce que la boussole doit
devenir.

**Registre des caps (macro-projets) — en cours :**
- **Ultima** — les 4 quadrants (livré, cap ouvert → `/ultima`).
- **Renoboost IA** — console réelle branchée (`www.renoboostia.fr`).
- **YCOME** — plateforme externe (URL à fournir par Paul).
- **RESHIRAM & ZEKROM — le doublet réel ↔ idéal** (dicté Paul 2026-07-21, à
  construire). Deux caps liés, empruntés à la symbolique vérité/idéaux :
  - **RESHIRAM — « le travail de la réalité ».** Cartographier et travailler la
    **réalité concrète des talents et capacités de Paul** : ce qu'il sait/peut
    réellement faire, proposer ; ses **plus-values réelles** ; son **réseau
    réel** (ex. BTP : les artisans qu'il connaît → **lien direct avec
    TRAVELER**). **Règle d'or : uniquement du concret — faits, chiffres, data ;
    rien d'imaginé, rien d'idéalisé.**
  - **ZEKROM — « la quête de l'idéal ».** Les **volontés, idées hautes,
    idéaux** de Paul → le **cap directionnel** (motivation, pensée,
    conceptualisation des projets). Projet **« pour faire rêver »**, à ne pas
    oublier.
  - **Relation (cœur du doublet)** : les deux **en concurrence, pas en
    opposition** — l'un **nourrit** l'autre. **Passerelle de data
    bidirectionnelle** : au survol de RESHIRAM, Léo montre ce qu'un élément de
    ZEKROM peut enrichir, et inversement (« qu'est-ce qui peut nourrir quoi »).
    Permet le **rétroplanning** : partir de l'idéal (ZEKROM) → le décliner en
    réel (RESHIRAM) : de quoi j'ai besoin, à quoi ça correspond, comment on le
    fait, **combien ça coûte** (analyse de besoin réelle, long terme).
  - **Forme (décidée Paul 2026-07-21)** : **deux caps AUTONOMES** de la boussole
    — liés par la passerelle data, mais **jamais fusionnés en une seule
    division** (ni sous-caps d'un même macro-projet, ni rangés sous IMLADRIK).
    RESHIRAM garde un **lien fort avec TRAVELER** (réseau réel) sans y être
    absorbé.
  - **Cadrage des consoles** : `CADRAGE-RESHIRAM-ZEKROM.md` (but de chaque
    console, objets, passerelle réel↔idéal, articulation anti-duplication avec
    les quadrants, arbitrages). Cadrage seul, pas encore de code.

**Principe directeur — la boussole n'est pas un menu, c'est un cockpit.** Pour un
solo, la valeur n'est pas de *naviguer* mais de *savoir en 5 secondes où mettre
son énergie aujourd'hui*. La boussole reste sobre (zéro surcharge : la donnée
n'apparaît qu'au survol/focus), mais elle **agrège du sens** au-dessus des
projets.

**Ce que LV2 ajoute (par ordre de valeur) :**
1. **Signaux au survol/sur le cap** — badges discrets par macro-projet
   (« 3 relances dues », « échéance URSSAF J-6 », « 1 facture impayée »). La
   donnée dort, s'allume quand elle compte.
2. **Cap du jour** — Léo **désigne** le cap prioritaire (data-driven : ce qui
   coûte de l'argent ou du temps si non traité), au lieu d'une invite passive.
3. **État du jour transversal** — une ligne consolidée **tous macro-projets
   confondus** (trésorerie, prochaine échéance, top action).
4. **Capture-dispatch** — une note dictée depuis la boussole est **rangée par
   Léo dans le bon quadrant/projet** (directive JL : absorber → dispatcher).
5. **Résumés vivants** (LV2-③) — le survol montre le vrai « en cours » du
   projet, pas un texte figé.

**Léo — l'évolution que LV2 appelle :**
- **Ingestion de la vraie data** via les connecteurs déjà disponibles (Gmail,
  Google Calendar, Drive, Notion, Supabase) — piloter sur du réel, pas de la
  saisie manuelle.
- **Briefing quotidien** (tréso, échéances, RDV, relances, top-3 actions),
  **pilote fiscal & trésorerie** (= activation d'`agent-finances`, cf. §7),
  **détection de signaux faibles**, **rédaction assistée** (brouillons ;
  envoi sur ordre explicite seulement).

**Sécurité** : les KPIs remontés sur la boussole peuvent agréger de la donnée
**finance = ultra-sensible** (RC2). Le §5 s'applique intégralement à cette
couche (RLS, gates, jamais de finance en logs, chiffrement au repos à évaluer).
La boussole n'affiche que des **agrégats derrière auth**, jamais de PII/finance
en clair dans le HTML servi.

**Séquencement proposé (une boucle à la fois, à valider hors cadrage) :**
LV2-② (auth) ou la boucle **NICOL BOLAS** (pilote fiscal + tréso) qui
**alimente les 2 premiers KPIs de la boussole** — c'est le plus fort levier
auto-entrepreneur et il transforme la boussole en cockpit dès la 1ʳᵉ brique.

**Arbitrages ouverts (reportés en §10) :** périmètre du cockpit (2 KPIs vs
bandeau complet) ; statut fiscal réel (micro-BIC/BNC, TVA) ; data réelle vs
saisie manuelle au démarrage ; niveau de chiffrement finance.

## 3. Les 4 quadrants (noms de code confirmés par Paul, 2026-07-12)

### 3.1 TRAVELER — le réseau (existant, absorbé)
Outil de réseau commercial : **arbre des contacts**, **carte**, **contacts**,
**relations** (rapprochements pilotables), **journal « où j'en suis »** +
**relances**. C'est tout l'acquis v1→A4 renommé et rangé sous ce quadrant.
Ajout dicté : un **agent de liaison de contacts productif** — repère et propose
les rapprochements à valeur (« lui peut bosser avec lui »), méthode de Paul
obligatoire (qualitatif → chiffré → pilotage). Rôle déjà amorcé chez Léo
(entremetteur, charte §5) — à outiller ici.

### 3.2 NICOL BOLAS — pilotage financier (long terme)
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
  y compris inter-segments (une idée ↔ un contact TRAVELER, ↔ une dépense NICOL BOLAS).
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
  TRAVELER, un objectif d'IMLADRIK peut cadrer une dépense de NICOL BOLAS — Léo fait
  les liens. La mémoire `memoire/` s'étend aux 4 domaines.
- **Un dashboard par quadrant** : Paul est très créatif et change souvent de cap
  → il a besoin de **cadre**. Chaque outil rend son pilotage lisible
  (semaine/mois), comme demandé explicitement.
- **Directive EB (macro-directive, prioritaire)** appliquée partout :
  ① **boucler** une chose avant de passer à la suivante ; ② **capitaliser sur
  l'existant** avant de créer du neuf. C'est le garde-fou n°1 d'une plateforme
  à 4 fronts.
- **Rappels/échéanciers** : motif récurrent (NICOL BOLAS fiscal, ADRAMELECH bilan
  mensuel, IMLADRIK quart d'heure quotidien) → brique transverse à mutualiser.
- **Registre antique et sérieux** partout, jamais au prix de la lisibilité,
  l'accessibilité ou la sécurité.

## 5. Sécurité — le niveau d'exigence monte d'un cran

Le périmètre de données devient **beaucoup plus sensible** que le seul réseau :

- **NICOL BOLAS** = données financières (bulletins de salaire, factures, impôts) —
  ultra-sensibles.
- **IMLADRIK** = journal intime, valeurs, prises de recul — intimes.

Conséquences (à tenir à chaque boucle) :
- **Mono-utilisateur strict** (seul Paul, décision 2026-07-03) → RLS par compte,
  fail-closed, comme durci en PR #32.
- **Uploads de fichiers** (bulletins, factures) = nouvelle surface d'attaque :
  validation stricte type/taille, stockage privé, **aucune exécution**, pas de
  chemin devinal ; à cadrer avec `securite-auditeur` avant tout code.
- **Chiffrement au repos** de NICOL BOLAS/IMLADRIK : à évaluer (Supabase au repos vs
  chiffrement applicatif) — arbitrage sécurité, gate Paul.
- **Scraping externe** (IMLADRIK) : timeout sortant, validation, aucune fuite de
  données Paul vers l'amont, User-Agent dédié (motif geocode déjà éprouvé).
- **Jamais de PII/finance/intime en logs** (règle CLAUDE.md étendue : IDs seuls).
- Tout ce qui touche RLS/auth/stockage de ces données = **gate + escalade Opus**.

## 6. Léo étendue

> **Léo dans le site** (agent actif, pop-up par quadrant, ton Jarvis,
> apprentissage) : vision dictée par Paul le 2026-07-18, cadrée dans
> **`CADRAGE-LEO-SITE.md`** — boucles L0→L3. Ce §6 décrit Léo-en-session
> (le pilote) ; le produit Léo-au-site vit dans son cadrage dédié.

- **Léo est féminine** (une femme) — décision Paul 2026-07-12. Charte et profil
  mis à jour (accords au féminin).
- **Mandat élargi aux 4 domaines** : Léo pilote TRAVELER, NICOL BOLAS, ADRAMELECH et
  IMLADRIK, avec la même discipline et les mêmes gates.
- **UN SEUL agent, verrouillé (Paul, 2026-07-16)** : Léo est le seul agent qui
  agit en cross-plateforme et le seul interlocuteur de Paul — une seule mémoire
  qui garde tout. Les autres `.claude/agents/` sont **ses sous-agents**
  (mono-tâche, sorties synthétisées par Léo, jamais lues brutes par Paul), pas
  des agents concurrents. Léo peut les appeler pour maximiser l'existant, mais
  ne recrute que si aucune expertise ne couvre le besoin — « ne pas bosser pour
  rien ». Détail dans la charte (`.claude/agents/leo.md`, principe verrouillé).
- **Déclinaison par sigle de quadrant** : Léo reste le même agent et **reprend
  le sigle du quadrant courant** — un seul agent, plusieurs blasons.
  Correspondance **figée (Paul, 2026-07-16 ; IMLADRIK re-figé 2026-07-17)** :
  TRAVELER = boussole · ADRAMELECH = dragon · NICOL BOLAS = balance · IMLADRIK =
  **épée au soleil** (décision antérieure de Paul dont la trace écrite avait été
  perdue — session non poussée ; re-confirmée oralement le 2026-07-17, remplace
  l'étoile) · Console = sceau ULTIMA. Les emblèmes gravés sont en ligne (C1).
- **Recrutement au fil des boucles** (charte §3) : Léo crée les agents/skills
  manquants **quand la boucle du quadrant s'ouvre**, pas tous d'un coup
  (discipline « pas dix lièvres »).

## 7. Carte des agents & skills à prévoir (aplanissement)

Ce dont on aura besoin par quadrant — **créé boucle par boucle**, pas maintenant.
**Ce sont tous des sous-agents de Léo** (voir §6, principe verrouillé) : Léo les
appelle et garde tout, ils ne parlent jamais à Paul. L'équipe actuelle
(`securite-auditeur`, `data-ingenieur`, `front-carto`, `interface-ux`,
`graphisme`, `verificateur`) et les skills installés (`frontend-design`,
`theme-factory`, `algorithmic-art`, `webapp-testing`, `skill-creator`)
servent les 4.

| Quadrant | Sous-agents à prévoir (appelés par Léo) | Skills à prévoir |
|---|---|---|
| Console | (équipe front existante) | `frontend-design`, `theme-factory` |
| TRAVELER | existant + **agent-liaison** (entremetteur outillé) | existants |
| NICOL BOLAS | **agent-finances** (compta perso, fiscalité FR, échéances) + data-ingenieur | parsing/OCR bulletins = **externe/coût → gate** |
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
- **RC3 — dépendances externes/coût** : OCR bulletins (NICOL BOLAS), scraping culturel
  (IMLADRIK), éventuelle IA conversationnelle intégrée → **gates Paul**, jamais
  engagées seules.
- **RC4 — re-scope vs « autarcie »** : la décision 2026-07-03 (« autarcie »)
  visait l'isolement d'Ultima **vis-à-vis des AUTRES systèmes de Paul** — elle
  tient. Ce qui change : **à l'intérieur** d'Ultima, on passe d'un domaine à
  quatre, avec mémoire inter-segment. Pas de contradiction, re-scope assumé.
- **RC5 — nommage** : Traveler / NICOL BOLAS / Adramelech / Imladrik confirmés **par
  écrit** par Paul → figés (lexique vocal mis à jour pour les variantes
  entendues).

## 10. Arbitrages ouverts — décisions attendues de Paul

1. **Ordre des quadrants** après la console (C2 en premier ?). Reco Léo :
   commencer par le quadrant le **moins dépendant d'un service externe/coût** —
   ADRAMELECH ou IMLADRIK (données pures, pas d'OCR ni de fiscalité) — pour
   boucler vite et capitaliser, NICOL BOLAS (OCR bulletins + échéances fiscales) ensuite.
2. **Niveau de stockage sécurisé** pour NICOL BOLAS/IMLADRIK : chiffrement au repos
   applicatif exigé, ou RLS + repos Supabase suffisant en v1 ? (sécurité).
3. **Périmètre v1 de chaque quadrant** : tranché au mini-cadrage de sa boucle,
   pas maintenant (pas de spéculation).
4. **LV2 cockpit (cf. §2bis, ajoutés 2026-07-21)** :
   a. **Périmètre du cockpit** : 2 KPIs sobres sur la boussole, ou bandeau
      « état du jour » complet ?
   b. **Statut fiscal réel** de Paul (micro-BIC/BNC, TVA franchise ou assujetti)
      — nécessaire pour caler les calculs NICOL BOLAS.
   c. **Data réelle vs saisie manuelle** au démarrage (brancher Gmail/Drive/
      Notion, ou saisir le temps de valider le modèle).
   d. **URL de YCOME** (plateforme externe) pour brancher son cap.

   *(Résolu 2026-07-21 : RESHIRAM & ZEKROM = deux caps AUTONOMES liés par
   passerelle, hors IMLADRIK ; lecture « projets idéaux » confirmée.)*

> Prochaine action après validation de ce cadrage : ouvrir **C1 — la console**
> (coque réutilisant l'existant), ou d'abord le mini-cadrage du quadrant que
> Paul veut voir en premier.
