# CADRAGE — Léo pilote TOUT : brancher Ripair, DATARENO- et renoboost-console

> Dicté par Paul le 2026-09-22. *« Il faut que Léo puisse tout piloter, que Finubar
> puisse recouper toute la donnée. Mais c'est Léo le seul agent qui pilote tout.
> Elle doit pouvoir tout lire, avoir des droits en écriture surtout. Donc on va
> brancher Ripair, DATARENO-, renoboost-console. Très important renoboost-console
> parce que ce sont les aides de l'État, les tunnels d'aide de l'État. Il faut
> toujours que je sois à jour sur tout. Bien conseiller en trois clics les clients
> finaux, les particuliers, les pros et les entreprises. »*
>
> ⛔ **Ce document CADRE. Il n'exécute rien.** Directive EL, gate d'entrée : le
> comment est défini et assumé AVANT la première ligne.
>
> ✅ **TROIS ARBITRAGES RENDUS PAR PAUL LE 22/09, intégrés ci-dessous :**
> ① **Ripair est un SERVICE de RenoPredict**, pas un dépôt → `paggerard-boop/ripair`
> sort du registre. **Le parc est de DIX dépôts**, pas onze.
> ② **Tout le monde est piloté ou pilotable par Léo** → aucun gel, aucune mise à
> l'écart. Les dix entrent.
> ③ **Les aides doivent être CALCULÉES AUTOMATIQUEMENT** → la table tenue à la
> main est écartée. ✅ Et la mesure du 22/09 a trouvé mieux : **le moteur officiel
> de l'État existe, il est ouvert, versionné, et il calcule** (§0 bis).

---

## §0 — Ce qui a été MESURÉ le 22/09, et comment

⛔ Toute valeur de ce document est lue à sa source. Ce qui n'a pas pu être vérifié
est marqué **[NON VÉRIFIÉ]** et dit pourquoi — jamais une déduction vraisemblable
présentée comme un fait (Directive EL).

### Le parc réel

| | Constat | Commande |
|---|---|---|
| Dossiers présents | **10** | `ls /home/user` |
| Déclarés dans `finubar/depots.json` | **8** | `cat finubar/depots.json` |
| Mesurés à la dernière collecte | **5** (3 en `hors_seance`) | `finubar/macro.json` |
| Portant un `FINUBAR.md` | **8/10** — manquent DATARENO- et renoboost-console | boucle `[ -f $d/FINUBAR.md ]` |
| Semé mais NON déclaré | **Artidispo** (grain + hook posés le 14/09) | `grep -i artidispo finubar/` → 1 seule occurrence, un commentaire |
| Déclaré mais ABSENT | **`ripair`** (`paggerard-boop/ripair`) | `depots.json` vs `ls` |

**Le parc voit la moitié de lui-même** : 10 réels → 8 déclarés → 5 mesurés. Et
l'écart est muet : `collecter.mjs` itère sur `depots.json`, il ne peut pas voir ce
qui n'y figure pas. Un dépôt oublié et un dépôt inexistant rendent le même écran.

### renoboost-console — le dépôt que Paul désigne comme le plus important

**Ce qu'il est** : Next.js 16 + React 19 + Tailwind 4, `@google/genai` (Gemini),
plus deux scripts Python (`core_engine.py`, `watcher_mail.py`). Six onglets, dont
« Veille Stratégique » (`MonitoringDashboard`, JORF + concurrents). Dernier commit
**10/09** — 12 jours. Aucun test, aucun `FINUBAR.md`, absent du registre.

**Ce que la mesure a trouvé, et c'est grave sur le sujet le plus sensible du parc :**

**① Deux des cinq sources d'aides pointent vers des domaines qui N'EXISTENT PAS.**

```
citoyens.gouv.fr                  NE RÉSOUT PAS
api.maprimerenov.gouv.fr          NE RÉSOUT PAS
www.anah.gouv.fr                  résout
www.ecologique-solidaire.gouv.fr  résout
api.gouv.fr                       résout
```

⚠️ **Témoin de non-vacuité** : le HTTP sortant est bloqué par le proxy de la séance
— `www.anah.gouv.fr/` et `www.service-public.fr/` rendent eux aussi `000`. Le DNS,
lui, répond. Donc : **les deux non-résolutions sont un fait**, et les trois chemins
(`/api/aides`, `/api/eco-ptz`, `/aides-renovation-thermique`) sont **[NON VÉRIFIÉ]**
— il faudra les tester hors proxy avant toute conclusion sur eux.

⚠️ `ecologique-solidaire.gouv.fr` est l'ancien nom du domaine du ministère ; le
suivre est un signal d'âge, pas une preuve de panne — **[NON VÉRIFIÉ]**.

**② Une source morte et une source sans aide rendent le même résultat.** Les cinq
`catch` de `lib/aidsApi.ts` (l.75, 112, 149, 190, 227) renvoient `[]` après un
`console.error` **côté serveur**. L'écran ne distingue donc pas « aucune aide » de
« la source n'existe pas ». C'est exactement le mode de panne que ce parc a déjà
payé ailleurs : un silence qui se lit comme une bonne nouvelle.

**③ Les vrais barèmes vivent dans un PROMPT, pas dans une table.**
`core_engine.py` porte en dur, dans `SYSTEM_INSTRUCTION` : écrêtement *Bleu
90-100 % · Jaune 80 % · Violet 60 % · Rose 40 %*, *Éco-PTZ 50 000 € sur 20 ans*,
*TVA 5,5 %*, fiches CEE *BAR-TH-164* / *BAR-EN-102*. Aucune date d'effet, aucune
source citable, aucun test. Un barème dans un prompt ne se relit pas, ne se date
pas, et ne peut pas dire qu'il a vieilli.

**④ Le même chiffre vit à DEUX endroits.** `src/app/page.tsx:61` :
`Math.min(legalRest, 50000)` — le plafond Éco-PTZ en dur dans l'interface, **en
plus** du prompt. Deux écritures d'un chiffre de loi finissent par diverger, et on
croit la mauvaise.

**⑤ Deux moteurs `core_engine.py` divergents.** Racine (`genai.Client`,
`gemini-2.5-flash`) et `lib/` (`genai.configure`, l'API précédente). Deux réponses
possibles à la même question.

**⑥ Le persona est calibré pour l'artisan, pas pour le particulier.**
*« chef d'entreprise RGE agressif »*, *« maximiser la marge nette »*, *« réduire le
décaissement immédiat du client à 0 € ou presque »*. Or Paul demande de conseiller
**les particuliers**. `DATARENO-/CLAUDE.md` porte déjà les garde-fous inverses,
non négociables : *« Zéro claim 1 € · zéro économie non sourcée (risque DGCCRF) ·
aides en qualitatif + ≤ 1 chiffre sourcé »*. **Les deux règles se contredisent
frontalement dans le même parc.**

⛔ **Conclusion du §0 qui commande tout le reste** : le dépôt le plus important
pour Paul est **le moins fiable du parc sur le sujet le plus sensible**. Le
brancher tel quel à Léo ne l'améliorerait pas — cela donnerait à des chiffres non
sourcés l'autorité de l'interface unique. **On ne branche pas un tuyau sur une
source qu'on n'a pas qualifiée.**

### Léo — il y en a DEUX, et la demande ne vise pas la même

| | Qui | Droits aujourd'hui |
|---|---|---|
| **Léo-séance** | le fil principal Claude Code (cette séance) | **écrit déjà partout** : fichiers, commits, push, PR. Sa limite n'est pas technique, ce sont les **gates** du `CLAUDE.md` |
| **Léo-produit** | `Ultima-/api/leo.js` + `api/_lib/leo.js` | **lecture seule PAR CONCEPTION** |

`api/leo.js` l.60, mot pour mot : *« Les outils ne font que PROPOSER : cette route
n'écrit jamais rien. »* Et l.96-98 : un `tool_use` devient une **proposition
validée puis reformulée côté serveur**, et *« on ne renvoie JAMAIS de tool_result
au modèle »*.

Le catalogue compte **trois outils, tous préfixés `proposer_`** :
`proposer_situation`, `proposer_scenario`, `proposer_relance`. Le nommage EST la
doctrine.

✅ **Ce que ça change pour la demande de Paul** : « donner des droits d'écriture à
Léo » ne demande **pas** de bâtir un mécanisme. Le chemin
*intention → proposition → validation* existe et est testé ; il s'arrête
volontairement juste avant l'exécution. **Il reste un tiers du trajet, pas la
totalité.** Et **FINUBAR est déjà un quadrant de Léo** (`api/_lib/leo.js` l.68) :
elle sait déjà en parler.

### Les deux autres dépôts à brancher

| | État mesuré |
|---|---|
| **DATARENO-** | Vivant — dernier commit **19/09**. Très documenté (`SPEC.md`, `PREMORTEM.md`, `REPRISE.md`, `ROADMAP.md`, `TASKS.md`). Pas de `FINUBAR.md`, absent du registre. Porte les garde-fous conformité les plus durs du parc |
| **Ripair** | **[NON VÉRIFIÉ]** — `paggerard-boop/ripair` est déclaré au registre mais n'est pas attaché à cette séance. ⚠️ « Ripair » est AUSSI le nom d'un des deux services de RenoPredict (contrats d'entretien). **Ambiguïté à lever par Paul** : dépôt distinct, ou service déjà couvert par le grain de RenoPredict ? |

---

## §0 bis — LA SOURCE OFFICIELLE EXISTE, et trois des quatre taux du prompt sont FAUX

*(mesuré le 22/09 — c'est la trouvaille qui change le chantier)*

### Ce qui a pu être mesuré, et ce qui ne l'a pas été

⛔ **Le réseau sortant de la séance est fermé par POLITIQUE, pas par erreur de
configuration** — le diagnostic a été revérifié :

```
curl -sS "$HTTPS_PROXY/__agentproxy/status"
  → connect_rejected · "gateway answered 403 to CONNECT (policy denial)"
    citoyens.gouv.fr · api.maprimerenov.gouv.fr · www.anah.gouv.fr · …
```

`www.anah.gouv.fr` est refusé **comme les autres**, alors qu'il existe : aucune
route HTTP n'est testable d'ici, et `WebFetch` est bloqué sur tout `.gouv.fr`.
**[NON VÉRIFIÉ]** donc, et pour de bon depuis cette séance : les chemins
`/api/aides`, `/api/eco-ptz`, `/aides-renovation-thermique`.

⚠️ **Ce qui a été mesuré autrement**, et qui suffit à trancher : la recherche web
(canal distinct, autorisé) et surtout **le code source du moteur officiel, cloné
et lu** — `github.com/betagouv/reno`, tête `25bae95`, paquet `mesaidesreno`
**v2.3.1**.

### La source : Mes Aides Réno — le moteur officiel de l'État

| | |
|---|---|
| **Quoi** | `mesaides.france-renov.gouv.fr` — le simulateur officiel de France Rénov' |
| **Qui** | l'**ANAH**, après incubation beta.gouv / DINUM ; déployé nationalement |
| **Comment** | moteur **Publicodes** — le modèle de calcul est entièrement exposé (paramètre `fields`) |
| **API** | `mesaides.france-renov.gouv.fr/api-doc` — **conversationnelle** : elle rend les questions qui MANQUENT quand la situation est incomplète |
| **Code** | ouvert, versionné sémantiquement, avec un `CHANGELOG` du modèle |
| **Couvre** | MaPrimeRénov' (geste + accompagné), CEE, éco-PTZ, PAR, aides locales, copropriété, Denormandie, taxe foncière, outre-mer |

⚠️ **L'API conversationnelle EST le pattern de `lib/tva.ts`** — elle distingue « la
réponse est non » de « la question n'a pas été posée », et rend la liste des
manquants. Ce n'était pas cherché : les deux dispositifs ont convergé sur la même
forme parce que c'est la bonne.

### ⛔ Trois des quatre taux d'écrêtement du prompt sont FAUX

`ampleur.publicodes` → `ampleur . pourcent d'écrêtement`, *« Taux maximum toutes
aides sur enveloppe TTC »* :

| classe de revenu | couleur ANAH | **officiel** | prompt `core_engine.py` | écart |
|---|---|---|---|---|
| très modeste | Bleu | **100 %** | « 90-100 % » | flou, englobe |
| modeste | Jaune | **90 %** | « 80 % » | ❌ **−10 pts** |
| intermédiaire | Violet | **80 %** | « 60 % » | ❌ **−20 pts** |
| supérieur | Rose | **50 %** | « 40 % » | ❌ **−10 pts** |

⛔ **Les trois erreurs vont dans le même sens : elles SOUS-ESTIMENT l'aide.** Sur
un chantier de 40 000 € TTC pour un ménage intermédiaire, le prompt plafonne les
aides à 24 000 € au lieu de **32 000 €** — **8 000 € annoncés en moins** au
client, donc un reste à charge gonflé de 8 000 €.

⚠️ **Ce n'est pas un risque juridique, c'est une perte sèche.** Le pre-mortem PM-2
redoutait un chiffre trop généreux (promesse non tenue) ; le défaut réel est
l'inverse et **coûte des chantiers**. Paul annonce à ses clients un reste à charge
plus élevé que la réalité, sur trois classes de revenu sur quatre.

⚠️ La note du modèle signale pour la classe *modeste* une évolution « à date du
11 décembre 2024 vers 90 %, en attente des textes d'application »
([source ANAH citée dans le modèle](https://www.anah.gouv.fr/document/panorama-des-aides-2025)).
Le modèle implémente 90 % et le dit. C'est exactement la traçabilité qu'on veut :
la valeur, sa date, sa source, et son incertitude.

### ✅ Les deux autres vérifications

- **Éco-PTZ 50 000 € / 20 ans : CONFIRMÉ** (`PTZ.publicodes` — `par défaut: 50000 €`,
  `par défaut: 20 ans`). ⚠️ Mais **ce sont des valeurs par DÉFAUT au bout de
  variations** : la durée tombe à `15 ans` dans un cas, et le plafond dépend des
  travaux (7 000 / 15 000 / 25 000 / 30 000 / 50 000 €). Donc
  `page.tsx:61 → Math.min(legalRest, 50000)` applique **le cas le plus favorable à
  tous les dossiers**. Un plafond codé en dur n'est pas une règle, c'est une branche.
- **Les fiches CEE sont référencées AVEC leur version et leur date d'effet** :
  `BAR-EN-102`, lien officiel, *« vA65-4 à compter du 01-01-2025 »*
  (`gestes/isolation.yaml`). C'est la forme que doit prendre tout barème chez nous.

### ⛔ TROIS LIMITES À CONNAÎTRE AVANT DE BRANCHER

1. **Le dépôt GitHub est FIGÉ.** Dernier commit du modèle : **2025-12-18**, il y a
   neuf mois. Le projet « n'est plus en développement actif » et a été repris par
   l'administration. ⛔ **Donc on n'embarque PAS le modèle — on appelle l'API
   hébergée**, qui est la version vivante. Recopier le modèle échangerait un
   barème périmé contre un autre barème périmé, avec en prime l'illusion d'avoir
   traité le sujet. C'est **exactement** la règle déjà écrite pour l'audit PAC :
   *le moteur se calcule ailleurs, il ne se recopie jamais*.
2. ⚠️ **La source officielle déclare elle-même un trou sur les CEE** : *« il y a
   actuellement un problème avec le dispositif de financement CEE, les
   informations et simulations pour cette aide ne sont plus à jour, en attente
   d'une mise à jour du simulateur »*. Or les CEE sont le cœur du montage de Paul.
   ⛔ Donc **même la bonne source doit être lue sur ce qu'elle dit d'elle-même**,
   et l'écran doit pouvoir afficher « cette aide est en cours de mise à jour à la
   source ». **[À REVÉRIFIER hors proxy]** — l'avertissement vient d'une recherche
   web, pas d'une lecture directe de la page.
3. ⛔ **Les ENTREPRISES ne sont pas couvertes.** Le modèle porte sur le
   **logement** — résidence principale, particuliers, copropriétés. Le tertiaire
   (fiches `BAT-TH-*`) n'y est pas. Paul demande particuliers **+ pros +
   entreprises** : le troisième public **n'a pas de source officielle ouverte
   identifiée à ce jour**, et c'est un trou nommé, pas un oubli.

---

## §1 — L'objectif final, et le critère qui dit qu'on y est

**Le cap (JL)** : Ultima est l'unique interface de travail de Paul, Léo son unique
interlocutrice. Piloter dix dépôts n'est pas le but — c'est le moyen.

**Le but réel, en clair** : Paul ouvre Ultima, et en trois clics il conseille
juste un particulier, un pro ou une entreprise sur les aides auxquelles il a
droit, **avec des chiffres dont Léo peut citer la source et la date**.

**Les critères de sortie, chiffrés et vérifiables :**

| | Critère | Comment on le prouve |
|---|---|---|
| **C1** | Finubar voit **10/10** dépôts, `hors_seance: 0`, depuis une séance sans dépôt attaché | `node finubar/collecter.mjs` |
| **C2** | Un dépôt semé et non déclaré **fait rougir** un contrôle | on retire une ligne de `depots.json` → le contrôle nomme le dépôt absent |
| **C3** | **Zéro** chiffre d'aide affiché sans source ni date d'effet | un contrôle refuse tout montant non tracé |
| **C4** | Les 3 profils (particulier · pro · entreprise) aboutissent à un conseil en **≤ 3 clics** | parcours joué au navigateur, mesuré |
| **C5** | Léo écrit dans l'anneau vert **sans demander**, et rien au-delà | journal des écritures + une garde éprouvée en la contournant |

⛔ **C3 prime sur C4.** Conseiller vite et faux est pire que ne pas conseiller. Si
les deux s'opposent, on livre l'écran qui dit « je ne sais pas encore, source à
qualifier » plutôt que celui qui répond en trois clics avec un chiffre inventé.

---

## §2 — Le modèle de droits : trois anneaux, par RÉVERSIBILITÉ

⛔ **Le critère n'est pas « quel dépôt » mais « qu'est-ce que ça coûte si c'est
faux ».** C'est la règle du repli déjà écrite dans RenoDevis (arbitrage A1,
13/09) : *un repli se choisit sur ce qu'il coûte quand il se trompe, jamais sur ce
qu'il rapporte quand il a raison.*

### 🟢 Anneau VERT — Léo écrit directement, sans demander

Ce qui se défait d'un clic et n'engage personne à l'extérieur.

- grains `FINUBAR.md`, notes, journaux de séance, idées (ADRAMELECH), journal (IMLADRIK)
- statuts internes, étiquettes, regroupements, brouillons non envoyés
- fichiers de pilotage : `ROADMAP-*.md`, `PLAN-*.md`, `NOTE-*.md`

**Obligation attachée** : toute écriture verte est **journalisée** (quoi, quand,
quel outil — jamais le contenu dicté), et **défaisable**. Une écriture qu'on ne
peut pas défaire n'est pas verte, quelle que soit son apparence d'innocuité.

### 🟠 Anneau ORANGE — Léo prépare, Paul valide d'un clic

Ce qui touche un client, un euro, ou un état métier.

- toute donnée client / artisan / lead ; tout montant ; tout statut de devis ou de chantier
- tout **brouillon destiné à partir** (mail, SMS) — préparé, jamais envoyé
- **tout conseil d'aide d'État chiffré**

C'est le mécanisme `proposer_*` existant, étendu. ⛔ **Il ne se contourne pas par
la conversation** : une proposition est validée côté **serveur** contre le
catalogue, pas côté modèle — c'est déjà ce que fait `validerProposition`, et c'est
ce qui la rend insensible à ce que le modèle raconte.

### 🔴 Anneau ROUGE — jamais, y compris en « go solo »

- **envoi réel** (mail, SMS, appel) vers une adresse ou un numéro qui n'est pas un bac à sable
- migration SQL, changement RLS, `revoke`, suppression de données
- tout **secret** ou variable d'environnement
- toute **action payante**
- publication d'une page publique
- **modification d'un barème d'aide** — un barème se change dans une PR relue, jamais depuis un écran

⚠️ Ces interdits sont **déjà écrits** dans les `CLAUDE.md` du parc. Cet anneau ne
les invente pas : il les rend **exécutables par la machine** au lieu de les laisser
à la discipline d'une séance.

---

## §3 — Les aides : on n'implémente AUCUN barème, on appelle le moteur officiel

⛔ **RÈGLE D'OR, non négociable** : **Léo ne conseille jamais sur un chiffre dont
elle ne peut pas citer la SOURCE et la DATE.** Ici la valeur n'est pas seulement
crue par Paul : elle est répétée à un client qui va engager des travaux dessus.

✅ **L'arbitrage de Paul — « les aides doivent être calculées automatiquement » —
est non seulement tenable, il est MIEUX servi que par une table à la main :**
l'État publie le moteur (§0 bis). La conséquence est nette, et elle simplifie le
chantier au lieu de l'alourdir :

> ⛔ **RenoBoost n'écrit aucune règle d'aide. Il POSE UNE QUESTION et AFFICHE UNE
> RÉPONSE SOURCÉE.** Zéro barème dans le code, zéro barème dans un prompt.

**Le patron est déjà dans la maison, deux fois :**

| Précédent | Ce qu'il dit | Application ici |
|---|---|---|
| `RenoDevis/CLAUDE.md` — l'audit PAC | *« le moteur se calcule ailleurs (`mon-dpe.fr`), ne jamais recopier »* — parce que deux copies divergent et que deux chiffres différents partent chez le même client | ⛔ Identique : **on appelle**, on ne recopie pas |
| `RenoDevis/lib/tva.ts` | table datée et sourcée · date obligatoire sans défaut · `null ≠ false` · péremption signalée | L'API officielle **fait déjà tout cela** — y compris rendre les questions manquantes |

**Ce que ça impose concrètement :**

1. **Une seule fonction appelle le moteur**, côté serveur, HTTPS + timeout borné.
   L'écran ET Léo l'appellent. ⛔ Deux formules du même chiffre divergent toujours.
2. **La réponse porte sa provenance** : version du modèle, date d'appel, et le lien
   vers la règle. Affiché, pas enfoui en commentaire.
3. **Les manquants sont rendus, pas devinés.** L'API dit quelles questions poser :
   c'est **exactement** le « 3 clics » de Paul — trois questions qui comptent,
   choisies par le moteur, plutôt qu'un formulaire de vingt champs.
4. **Une source injoignable est un ÉTAT AFFICHÉ**, jamais un `[]` silencieux.
   Le dernier résultat connu est **mis en cache et daté**, et l'écran dit son âge —
   la règle déjà tenue par le mail Finubar du matin.
5. ⚠️ **Ce que la source déclare périmé chez elle, l'écran le déclare aussi** —
   à ce jour, les CEE.
6. **Les cinq URL actuelles sont RETIRÉES**, y compris les trois dont le domaine
   résout : aucune n'est documentée comme API publique, et deux ne résolvent pas.
   ⛔ Ne pas en garder « au cas où » : une source fantôme qui rend `[]` est
   indiscernable d'une absence d'aide.
7. **Les barèmes sortent du prompt.** `core_engine.py` cesse de porter l'écrêtement,
   l'éco-PTZ et la TVA — il les **reçoit** de l'appel. Le prompt garde le métier
   (expliquer, monter un plan de financement), il perd le droit de dire les chiffres.
8. **`page.tsx:61` cesse de porter `50000`.**
9. **Deux personas séparés.** Le conseil au particulier et le montage financier de
   l'artisan ne sortent pas du même prompt « agressif » : les garde-fous de
   `DATARENO-/CLAUDE.md` (zéro claim, zéro chiffre non sourcé, risque DGCCRF)
   s'appliquent au premier, mot pour mot.
10. **Fusionner les deux `core_engine.py`.**

⛔ **ET LE TROU EST NOMMÉ : les ENTREPRISES.** Le moteur officiel couvre le
logement. Pour le tertiaire, aucune source ouverte équivalente n'est identifiée.
Trois conduites possibles, à arbitrer (§8 décision 4bis) — et **aucune ne consiste
à laisser un prompt inventer des chiffres pour ce public.**

## §4 — Le plan : quatre jalons, chemin critique explicite

| | Jalon | Critère de sortie | Pourquoi il précède le suivant |
|---|---|---|---|
| **J1** | **Le parc est complet et se surveille** | C1 + C2 | Tout ce qui suit se calcule sur le parc. Un tri fait sur 5 dépôts sur 11 donne un chiffre faux avec l'aplomb d'un chiffre juste |
| **J2** | **Les aides sont qualifiées** (sources testées hors proxy, barèmes datés et sourcés, sources mortes visibles) | C3 | ⛔ Brancher Léo sur des chiffres non qualifiés donnerait à l'erreur l'autorité de l'interface unique |
| **J3** | **Léo écrit — anneau vert d'abord** | C5 | L'anneau vert est réversible : c'est là qu'on éprouve la journalisation et les gardes, **avant** de toucher à ce qui coûte |
| **J4** | **Le conseil en 3 clics** (particulier · pro · entreprise) | C4 | N'a de sens qu'après J2. Sinon on livre un tunnel rapide vers un chiffre faux |

**Chemin critique : J1 → J2 → J4**, avec J3 en parallèle de J2 (il ne dépend pas
des aides).

⛔ **J2 est le goulot, et ce n'est pas celui qu'on croyait hier.** Le premier
cadrage désignait la collecte Finubar. La mesure du 22/09 déplace le goulot : la
couverture est un problème d'outillage, les aides sont un problème de **véracité**.
Théorie des contraintes — accélérer les autres étapes ne change rien tant que J2
tient.

---

## §5 — Les pre-mortem, un par jalon, et ils pilotent l'ordre d'exécution

### PM-1 · « J1 a échoué » — le parc complet

| Cause | Signal précoce | P×I | Solution apportée |
|---|---|---|---|
| Le témoin de registre **crie au loup** : comparé au compte GitHub, il signale forks, archives, essais → désarmé en deux semaines | il nomme un dépôt que Paul ne pilote pas | ⬆️⬆️ | Il ne compare **pas** au compte : il compare aux dépôts **portant un `FINUBAR.md`**. Un dépôt semé et non déclaré est une incohérence certaine ; un dépôt sans grain n'est pas suivi, et c'est légitime |
| **Grains semés de mémoire** pour DATARENO- et renoboost-console → deux mensonges de plus au tableau | grain sans commit vérifiable | ⬆️⬆️ | Grain rempli depuis l'état réel (`git log` + doc de reprise), commit vérifié par `merge-base --is-ancestor`. DATARENO- a déjà `REPRISE.md` et `ROADMAP.md` : le grain les **pointe**, il ne les recopie pas |
| **Token GitHub absent** → la collecte affiche un état complet et faux | premier run sans secret | ⬇️⬆️ | Réutiliser le mécanisme existant (`ok:false` + `motif`). ⛔ Ne pas inventer un second mécanisme de « je ne sais pas » |
| Le grain lu par API (`main`) **écrase** le grain local (branche), plus frais | grain régressé après collecte | ⬇️⬆️ | Disque **prioritaire**, API en repli strict |
| Rate limit | 10 dépôts × 3 appels × 10 collectes ≈ 300/jour | ⬇️⬇️ | Sous les 5 000/h authentifié — **à mesurer une fois**, pas à supposer |
| ⛔ On passe à 10/10 et **2 des 10 n'ont rien à dire** : mesure améliorée, pilotage inchangé | un grain immobile depuis 30 j | ⬆️⬆️ | ⚠️ Paul a tranché : aucun gel (§8-2). Ce risque n'est donc PLUS mitigé par le périmètre — il repose sur le chemin critique et le critère de recette IA, et sur la nuance **« pilotable » ≠ « piloté »** |

### PM-2 · « J2 a échoué » — les aides

| Cause | Signal précoce | P×I | Solution apportée |
|---|---|---|---|
| ⛔ **Les cinq sources sont mortes** et il n'existe pas d'API publique exploitable | le test hors proxy rend 5 échecs | ⬆️⬆️ | **Table versionnée tenue à la main**, datée et sourcée, avec relecture périodique signalée. Moins brillant, conforme à C3. ⛔ Ne JAMAIS garder une API fantôme « en attendant » |
| On remplace un chiffre faux par un chiffre faux — **le barème saisi est lui-même erroné** | aucun, et c'est le pire | ⬆️⬆️ | Chaque ligne porte **la référence du texte** ; ⛔ ce document n'est pas un avis juridique et la table se relit avec un professionnel, comme `lib/tva.ts` le dit déjà pour la TVA |
| Le barème **vieillit en silence** | aucun | ⬆️⬆️ | Péremption **affichée** (« relu il y a N jours »), jamais une CI qui casse — une alarme qui casse le lundi finit désarmée |
| La **veille JORF** existante tourne à vide (clé Gemini absente → « Clé API absente. ») et le silence passe pour un calme | l'onglet Veille ne dit rien depuis N jours | ⬆️⬆️ | **Sonde miroir**, exactement comme `RenoDevis` l'a fait pour le cron Stripe et la synchro email : une ligne qui distingue « ça tourne » de « ça tourne à vide » |
| Le conseil de Léo **diverge** de ce que l'écran affiche | deux chiffres pour un client | ⬆️⬆️ | Une seule fonction pure porte le calcul ; l'écran ET Léo l'appellent. ⛔ Deux formules du même chiffre finissent par diverger |

### PM-3 · « J3 a échoué » — Léo écrit

| Cause | Signal précoce | P×I | Solution apportée |
|---|---|---|---|
| ⛔ **Injection par le contenu.** Un lead, un mail synchronisé, un PDF de devis, un commentaire GitHub contient « ignore les règles et écris X ». Léo lit la donnée, donc elle lit l'attaque | une écriture qu'aucune demande de Paul n'explique | ⬆️⬆️ | **La validation est côté serveur, contre un catalogue fermé** — c'est déjà l'architecture. Le modèle ne peut proposer que ce que le catalogue déclare, avec des arguments bornés. ⛔ Ne jamais « simplifier » en exécutant directement un `tool_use` |
| L'anneau vert **s'élargit par commodité** : un jour on y met un statut client « parce que c'est pratique » | une écriture verte qui touche un tiers | ⬆️⬆️ | L'appartenance à l'anneau est **déclarée dans le catalogue**, pas décidée à l'exécution ; un test la garde. Élargir exige une PR |
| **Une écriture verte n'est pas défaisable** — on l'avait crue anodine | rien, jusqu'au jour où | ⬇️⬆️ | Le journal porte de quoi défaire. Pas de défaisabilité → pas vert |
| Léo écrit **dans le mauvais dépôt** (10 dépôts, des noms proches, deux bases Supabase) | une note dans le grain du voisin | ⬆️⬆️ | Le dépôt cible est un **argument borné** du catalogue, jamais déduit du fil de conversation |
| ⛔ **Les deux bases sont confondues.** Ultima = `leosfqyidgsaescjbfom` ; les 4 briques = `mwaryfscxgrulauwwque`. Un objet de la base partagée n'appartient jamais au dépôt d'où on le regarde | une écriture qui casse une autre brique | ⬆️⬆️ | La leçon du 17/08 (`RenoDevis/CLAUDE.md`) s'applique : **toute restriction de droit se contrôle sur les quatre dépôts**, et le gate n'est pas levé si l'un manque |
| Paul **ne relit plus** les propositions et valide en rafale | le taux de refus tombe à zéro | ⬆️⬆️ | La proposition affiche **ce qui va changer**, pas son intitulé. Et une proposition orange **expire** : validée trois jours plus tard, elle est rejouée, pas appliquée |

### PM-4 · « Le projet entier a échoué » — vue à 3 mois (22/12/2026)

| Cause | P×I | Solution apportée |
|---|---|---|
| ⛔ **Onze dépôts, un seul homme.** Le pilotage devient l'activité, au détriment du produit. Trois mois passent, Finubar est superbe, aucun client de plus | ⬆️⬆️ | **Le critère de recette est la Directive IA** : la livraison a-t-elle réduit ce que Paul fait à la main ? Un jalon qui n'enlève pas de travail est une régression. Et §8 décision 2 : **fermer ou geler** ce qui ne sert plus |
| Le conseil « 3 clics » donne un mauvais chiffre à un vrai client | ⬆️⬆️ | C3 prime sur C4, et l'écran sait dire « je ne sais pas » |
| Léo devient un **point de compromission unique** : un agent, dix dépôts, deux bases, droits d'écriture | ⬇️⬆️ | Les trois anneaux + catalogue fermé + journal. ⛔ « Un seul agent » est une règle d'**ergonomie** (un interlocuteur pour Paul), jamais une règle de **privilèges** : Léo délègue à des agents aux droits étroits, elle ne cumule pas les leurs |
| Le dispositif **dérive sans qu'on le voie** : grains périmés, barèmes vieux, sondes désarmées | ⬆️⬆️ | Directive DR : trois dry runs par jour, déjà en place. On leur ajoute les sondes de ce cadrage |
| Paul est **le seul à savoir** comment tout ça tient | ⬇️⬆️ | Le cadrage est versionné, les règles vivent dans les `CLAUDE.md`, les sondes sont exécutables |

---

## §6 — Les POV adversariaux, creusés

### 1. 🗡️ L'attaquant — *« je n'ai pas besoin de vos identifiants, j'ai besoin que Léo lise »*

*« Vous me donnez un agent qui lit vos leads, vos mails synchronisés, vos PDF de
devis et vos commentaires GitHub, et qui a des droits d'écriture. Je n'attaque pas
votre serveur : j'écris dans un champ que vous allez lire. »*

**Objections auxquelles le cadrage doit répondre :** la donnée entrante est-elle
traitée comme hostile alors qu'elle vient de « chez nous » ? Un `tool_use` peut-il
sortir du catalogue ? Une écriture peut-elle viser un dépôt non déclaré ?

**Réponse :** catalogue fermé, arguments bornés, validation serveur — déjà
l'architecture. **Ce POV est le plus fort du lot et il valide le choix de garder le
mécanisme existant au lieu d'un agent à outils libres.**

### 2. ⚖️ Le contrôleur (DGCCRF) — *« montrez-moi d'où vient ce chiffre »*

*« Votre outil a annoncé un montant d'aide à un particulier. Sur quel texte ?
À quelle date ? Qui l'a vérifié ? »*

**Objections :** un barème dans un prompt est-il traçable ? Un persona « agressif »
qui parle à un particulier est-il conforme ? *« décaissement à 0 € »* est-il une
promesse ?

**Réponse :** c'est **exactement** ce que §3 impose, et c'est pour ce POV que C3
prime sur C4. ⚠️ Ce POV est aussi celui qui **disqualifie le persona actuel** pour
le conseil au particulier.

### 3. 👤 Le client final lésé — *« on m'avait dit que j'y avais droit »*

*« J'ai signé des travaux sur la foi de votre simulation. L'aide a été refusée. »*

**Objections :** que vaut un chiffre affiché sans date ? Que se passe-t-il quand
une source est injoignable — l'écran le dit, ou il affiche zéro ?

**Réponse :** repli vers le **bas** (l'aide la moins favorable) quand une condition
est inconnue, état « source injoignable » visible, et les `null` distingués des
`false`. ⚠️ C'est ce POV qui inverse le sens du repli par rapport à la TVA : là-bas
on va vers le haut (le taux plein) pour protéger l'artisan d'un redressement ;
ici on va vers le bas pour ne pas promettre. **Dans les deux cas la règle est la
même : le repli protège de l'erreur la plus chère.**

### 4. 🔧 Le mainteneur futur (Paul en décembre) — *« pourquoi deux endroits ? »*

*« Je trouve 50 000 € dans un prompt et dans `page.tsx`. Lequel fait foi ? Et ces
deux `core_engine.py` ? »*

**Objections :** combien de chiffres du parc vivent à deux endroits ? Qui gagne ?

**Réponse :** un chiffre, une source ; l'écran et Léo appellent la même fonction
pure. C'est le §3 point 4.

### 5. 📉 L'adversaire business — *« vous outillez, vos concurrents vendent »*

*« France Rénov' et les accompagnateurs MAR font déjà ce tunnel, gratuitement et
avec l'autorité de l'État. Qu'apportez-vous ? »*

**Objections :** le « 3 clics » est-il un avantage, ou une commodité qu'un site
public offre déjà ?

**Réponse honnête :** l'avantage n'est **pas** la base d'aides — elle est publique.
Il est dans le **croisement** : le dossier du client, son devis, son DPE, son
artisan, déjà dans le parc. ⚠️ **Cela déplace le centre de gravité du projet** :
ce qui a de la valeur, c'est *« pour CE client, avec CE devis »*, pas un catalogue
d'aides de plus. À trancher (§8, décision 4).

### 6. 🪞 L'adversaire interne — *« c'est une fuite en avant »*

*« Onze dépôts, des grains, des anneaux, des sondes. Tout ça pour ne pas admettre
qu'il y a trop de chantiers ouverts. La Directive EB dit de boucler avant
d'enchaîner — ce cadrage en ouvre quatre. »*

**Objections :** combien de dépôts ont livré quelque chose ce mois-ci ? Lesquels
sont gelés sans l'assumer ?

**Réponse :** ce POV est **partiellement fondé**, et c'est pourquoi la décision 2
du §8 propose de **fermer ou geler explicitement** plutôt que de tout brancher. Un
dépôt gelé qu'on assume coûte moins cher qu'un dépôt vivant qu'on ne regarde pas.
⚠️ Mais il a tort sur un point : les quatre jalons ne sont pas quatre chantiers
parallèles — le chemin critique en impose **un à la fois**.

---

## §7 — Ce qu'on ne fait PAS dans ce chantier

- ⛔ **Aucun outil nouveau à côté d'Ultima** (Directive JL).
- ⛔ **Aucun moteur d'aides recopié** — même leçon que l'audit PAC qui vit dans
  `mon-dpe.fr` et ne se recopie jamais dans RenoDevis.
- ⛔ **On ne touche pas** au mail du matin, ni au fait que `/api/finubar` serve une
  donnée figée au commit : c'est un compromis assumé, documenté, qui **dit son âge**.
- ⛔ **On ne structure pas les blocages** (ce sera J2-bis), on ne refond pas l'écran.
- ⛔ **On n'ouvre pas** le sujet de l'auto-remplissage SIRET, ni le site public.

---

## §8 — Les arbitrages : trois rendus, ce qui reste

### ✅ Rendus par Paul le 22/09

| # | Question | Réponse | Effet sur le chantier |
|---|---|---|---|
| **1** | Ripair : dépôt ou service ? | **Service de RenoPredict** | `paggerard-boop/ripair` **sort** de `depots.json`. Le parc est de **DIX**. Le critère C1 devient **10/10** |
| **2** | Le périmètre | **Tout le monde est piloté ou pilotable par Léo** | Aucun gel. Les dix entrent, DATARENO- et renoboost-console compris. ⚠️ Le POV n° 6 (« fuite en avant ») est donc **assumé**, pas écarté : la discipline se tient par le chemin critique — un jalon à la fois |
| **3** | Les aides | **Calculées automatiquement** | La table tenue à la main est écartée. ✅ Et la mesure a trouvé mieux : **le moteur officiel de l'État** (§0 bis). Le chantier J2 **rétrécit** : plus aucun barème à écrire, à tenir ni à relire |

### ✅ Rendus par Paul le 22/09 — deuxième série

| # | Question | Réponse | Effet sur le chantier |
|---|---|---|---|
| **4** | Le 3 clics : catalogue ou croisement ? | **Croisement avec le parc** | ⛔ On ne reproduit PAS le simulateur public. J4 devient : **Léo pré-remplit la situation depuis le dossier** (client, devis, DPE, artisan) et n'appelle le moteur que pour le calcul. ✅ C'est la Directive IA servie à la lettre — le client ne saisit presque rien, il **valide**. ⚠️ Conséquence à assumer : **le « 3 clics » n'existe que s'il y a un dossier**. J4 dépend donc de la qualité de la donnée client, pas seulement du moteur |
| **4bis** | Les entreprises (tertiaire) | **Léo oriente, sans chiffrer** | Pour un public tertiaire, Léo nomme les dispositifs (CEE `BAT-TH-*`), pointe les interlocuteurs, et **dit explicitement qu'elle ne chiffre pas** faute de source officielle ouverte. ⛔ **Garde-fou éprouvable, et il est obligatoire** : un contrôle vérifie qu'**aucun montant n'est produit** sur un dossier tertiaire — éprouvé en le cassant, sinon il ne garde rien |
| **5** | Quelle Léo ? | **Léo-produit (`api/leo.js`)** | J3 porte sur l'interface d'Ultima. ⚠️ Les gates de Léo-séance restent **inchangés** : ce chantier ne les desserre pas |
| **6** | L'anneau vert | **Tel que défini au §2** | Grains Finubar, notes, journaux, idées, statuts internes, brouillons non envoyés, fichiers de pilotage. Réversible et journalisé |

⛔ **LES SEPT ARBITRAGES SONT RENDUS. Le gate d'entrée EL est LEVÉ** — le cadrage
est suffisant, l'exécution peut commencer au go de Paul.

⚠️ **Ce que la décision 4bis ajoute au pre-mortem, et qui n'y était pas** : un
public pour lequel l'outil **refuse** de chiffrer est un chemin que personne
n'emprunte volontiers, donc **un chemin jamais vérifié**. C'est précisément le mode
de panne que la Directive DR nomme : *le garde-fou s'éprouve du côté où il peut
être contourné*. Le contrôle ne se contente donc pas de vérifier qu'un dossier
tertiaire ne produit pas de montant — il vérifie aussi qu'un dossier **logement**
en produit bien un, sinon « aucun montant » serait vert par vacuité sur un outil
entièrement cassé.

### ⚠️ Ce que la décision 2 change au pre-mortem

« Tout le monde est piloté » **retire** la mitigation qui était prévue pour le
risque le plus probable de PM-4 (*« dix dépôts, un seul homme — le pilotage
devient l'activité »*). Ce risque n'est donc plus mitigé par la réduction du
périmètre. **Il est reporté sur deux garde-fous, et eux seuls :**

1. **Le chemin critique** — un jalon à la fois, jamais quatre chantiers parallèles.
2. ⛔ **Le critère de recette de la Directive IA** — *une livraison qui ajoute de
   la saisie manuelle obligatoire est une régression, même si elle marche*. Un
   dépôt branché à Finubar qui n'enlève aucun travail à Paul n'est pas un progrès.

⚠️ **« Pilotable » n'est pas « piloté ».** Paul a dit *« piloté OU pilotable »* :
un dépôt peut être **branché** (Léo le voit, il entre dans la collecte) sans être
**actif** (personne n'y travaille cette semaine). Cette nuance **sauve** le
dispositif du risque ci-dessus : on branche les dix, on n'en travaille qu'un.
C'est ce que le grain `etat` porte déjà. ⛔ Ne pas confondre couverture et charge.

## §9 — La prochaine action, unique

**J1 — le parc complet et surveillé.** Plus rien n'en dépend : les sept arbitrages
sont rendus, la source des aides est identifiée et lue.

Ce que J1 fait, et rien d'autre :
1. `depots.json` remis au réel — **dix entrées mesurées** : `ripair` retiré
   (c'est un service de RenoPredict), **Artidispo déclaré**, DATARENO- et
   renoboost-console ajoutés.
2. Les **deux grains manquants semés** depuis l'état réel — `git log` + doc de
   reprise, commit vérifié par `merge-base --is-ancestor`. ⛔ Jamais de mémoire.
3. La collecte lit les grains par l'**API GitHub** quand le dossier n'est pas sur
   disque — repli, jamais remplacement : le disque reste prioritaire.
4. Le **témoin de registre**, comparé aux dépôts **portant un `FINUBAR.md`** (pas
   au compte GitHub), **éprouvé en le cassant**.

**Critère de sortie** : `node finubar/collecter.mjs` → **10 projets,
`hors_seance: 0`**, depuis une séance sans dépôt attaché · et le témoin rougit en
nommant le dépôt quand on retire une ligne du registre.

⛔ **Ce qui reste à faire hors proxy avant J2**, nommément : appeler l'API
(`mesaides.france-renov.gouv.fr/api-doc`), vérifier l'avertissement CEE et la
disponibilité réelle du service. Cette séance a lu **le modèle**, pas **l'API**.
