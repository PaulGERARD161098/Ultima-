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

**② ⛔ CE POINT A ÉTÉ CORRIGÉ LE 22/09 DANS L'APRÈS-MIDI — il disait faux.**
Il affirmait : « les cinq `catch` de `lib/aidsApi.ts` renvoient `[]` en silence,
donc l'écran ne distingue pas *aucune aide* de *la source n'existe pas* ».

**Il n'y a pas d'écran.** Mesuré en reproduisant le build, après un déploiement
Vercel en erreur sur une PR qui ne contenait que du markdown :

```
$ npm run build → Module not found: Can't resolve '@/components/SimulatorCard'
$ find . -name "aids.ts"        → vide  (types/aids.ts n'existe NULLE PART)
$ grep -rn "aidsApi" --include=*.ts*  → personne ne l'importe
```

⛔ **LE DÉPÔT NE BUILD PAS DEPUIS LE 10/09** — douze jours. `tsconfig.json` fait
pointer `@/*` vers `./src/*`, et les composants vivent à la **racine** ;
`src/components/` n'existe pas. Et `lib/aidsApi.ts` importe un type absent, sans
que personne ne l'importe lui-même : **c'est du code mort**. Les cinq sources
d'aides ne sont donc **pas branchées**.

⚠️ **Ce qui reste VIVANT, et c'est ce qui compte** : les trois taux d'écrêtement
faux du prompt. `core_engine.py` est du **Python exécuté à part** — il ne dépend
pas du build Next, et il produit de vrais chiffres.

⛔ **La leçon, et elle est du dépôt** : *une note qui décrit un état faux coûte
plus cher qu'une note absente — on la croit.* Ce paragraphe avait été écrit le
matin même, à partir d'une lecture du code et non d'une exécution. Lire un
`catch` ne dit pas si la fonction est appelée.

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

⛔ **CE PARAGRAPHE ÉTAIT FAUX — corrigé le 29/09, voir §11.0.** Il annonçait
« **trois outils**, tous préfixés `proposer_` : `proposer_situation`,
`proposer_scenario`, `proposer_relance` ». Le catalogue en compte **DIX**, et les
dix étaient en place le **11/09** — donc onze jours avant que cette ligne ne soit
écrite. Les trois cités sont ceux d'un **seul quadrant**, pris pour le tout.
Ce qui reste vrai, et qui était le fond du propos : **le nommage EST la
doctrine** — tous préfixés `proposer_`, aucun n'exécute.

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

> ⛔ **LE CRITÈRE DE CETTE SECTION A ÉTÉ REMPLACÉ — voir §12 (Paul, 29/09).**
> Ce §2 taille les anneaux sur la RÉVERSIBILITÉ de l'objet touché. Paul les
> taille sur **ce que le geste DÉTRUIT ou fait RÉGRESSER**, avec un périmètre
> par défaut large (tout ce qu'il peut faire lui-même). Les trois anneaux
> restent justes dans leur principe et leur vocabulaire ; **la répartition
> ci-dessous ne l'est plus**. Gardé pour le raisonnement, pas comme consigne.

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

> ⛔ **PÉRIMÉ — J1 EST ATTEINT. Mesuré le 29/09, la prochaine action est au §11.5.**
> Son critère de sortie est rempli : `node finubar/collecter.mjs` rend
> `total: 10 · lisibles: 10 · hors_seance: 0` (`finubar/macro.json`, `le:
> 2026-09-29`). Laisser ce §9 en tête aurait fait **rejouer un jalon fait** —
> exactement l'incident du 13/09 que le `CLAUDE.md` nomme. Ce qui suit est gardé
> pour ce qu'il a coûté, pas comme consigne.
> ⚠️ **Ce que la même mesure signale et qui, lui, reste ouvert** : 2 dépôts ont
> dérivé depuis leur note, 5 grains ne sont rattachés à aucun commit atteignable
> (fusions en squash), 6 portent un texte au-delà des 180 caractères. Ce n'est
> pas J1 qui rouvre — c'est l'entretien du registre.

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

---

## §10 — Journal de la séance du 22/09 (fin de séance, mesuré)

⚠️ **Ce paragraphe s'ajoute au cadrage plutôt que de fonder un fichier de plus**
— Directive EB : capitaliser, jamais un doc parallèle. Les chiffres ci-dessous
ont été **mesurés à leur source au moment de l'écrire**, pas résumés de mémoire.

### Ce qui est fermé

| Lot | Preuve |
|---|---|
| **J1 — Finubar couvre tout** | `node finubar/collecter.mjs` → **10 projets · 7 en cours · 3 en attente** |
| **J2a — plus aucun barème non sourcé** | 4 jeux retirés · `tests/baremes.test.mjs` · 4 sabotages rouges |
| **Garde-fou tertiaire** | `src/lib/public.ts` · 8 contrôles · 7 sabotages · PR #3 fusionnée |
| **La console parle la langue de la vitrine** | PR #4 fusionnée → `d47e4cc` · **0 texte sous AA** sur 417 nœuds × 7 états × 3 largeurs |
| **DESIGN-LANGAGE abrogé et motivé** | PR #528 fusionnée → `366302d` |

### Ce qui reste ouvert, nommément

1. ⛔ **J2b — le moteur officiel des aides.** Bloqué : le proxy des séances
   refuse tout `.gouv.fr`. **L'écran ne rend AUCUN montant depuis le 22/09** —
   c'est voulu (conseiller juste avant conseiller vite), et c'est une perte de
   service jusqu'à J2b.
2. ⚠️ **`--line` borde les champs de la VITRINE à 1,32:1** quand WCAG 1.4.11 en
   exige 3. Trouvé en mesurant pour la console, **nommé et non corrigé** : autre
   boucle. La console, elle, a `--color-trait-fort` (5,34).
3. ⚠️ **La CI de `renoboost-console` n'a pas tourné** sur les commits de
   l'après-midi — aucun run déclenché depuis 12:53, et le dispatch manuel est
   refusé à l'intégration (403). `workflow_dispatch` a été ajouté ; il ne sera
   utilisable qu'une fois sur `main`. **À vérifier en ouverture de séance.**
4. ⚠️ **Le harnais navigateur n'a jamais tourné sur un runner GitHub.** Chromium
   y est installé pour la première fois par ce lot.
5. ⚠️ **`src/app/favicon.ico` est encore celui du gabarit** — gardé parce qu'il
   sert, à remplacer par une vraie icône.
6. ⚠️ **Cinq grains Finubar ne sont rattachés à aucun commit atteignable**
   (RenoAgenda, RenoPredict, mon-dpe.fr, artisan-builder, Artidispo) et
   **RenoDevis a dérivé de 7 commits**. Aucun ne vient de cette séance.

### Ce que les instruments de cette séance NE voient pas

⛔ Écrit ici parce qu'un périmètre non écrit se lit comme une couverture
complète — c'est la faute qui a coûté le plus cher aujourd'hui.

- `tests/contraste.test.mjs` ne survole **jamais** (`:hover` non mesuré) et
  n'exerce **aucun état d'erreur de formulaire**.
- Il ne mesure qu'en **thème clair** — il n'y en a plus qu'un, mais si un thème
  sombre revient, l'instrument le déclarera sain sans l'avoir regardé.
- Aucun instrument de cette séance ne mesure le **preview Vercel** : le proxy
  refuse `*.vercel.app`. Les mesures sont locales, sur le même commit.

### §10bis — L'APRÈS-MIDI : J2b est fermé (ajouté en fin de séance)

⛔ **Le §10 ci-dessus disait « J2b bloqué par le proxy ». C'est PÉRIMÉ depuis
16 h.** Il reste tel quel — c'était vrai quand il a été écrit — mais ce qui suit
le corrige, et c'est ce paragraphe-ci qui fait foi.

**Ce qui a débloqué** : le dépôt `betagouv/reno` a été **cloné et lu**. Le proxy
bloque `.gouv.fr`, pas GitHub — la distinction n'avait pas été faite.

| Lot | Preuve |
|---|---|
| **J2b — l'API officielle des aides** | PR #6 → `c50c198` · provenance vérifiée **grise** en preview par Paul |
| **Sécurité — la dépendance retirée** | PR #8 → `df377a2` · **35 vulnérabilités → 0** |

**Trois horloges, et elles ne donnent pas la même heure** — c'est le cœur de
l'arbitrage :

| Source | S'arrête à |
|---|---|
| paquet npm `mesaidesreno` | 08/04/2025 |
| dépôt `betagouv/reno` | 18/12/2025 (+634 règles vs npm) |
| **API en ligne** | **maintenue par l'ANAH** |

⛔ **D'où l'ordre : l'API d'abord, le modèle embarqué en repli DATÉ.** Embarquer
par défaut, c'était prendre la responsabilité fiscale pour économiser un appel
réseau. Le README du projet officiel le dit lui-même : *« il est de votre
responsabilité de le maintenir à jour »*.

### Ce que cette demi-journée a appris, et qui vaut au-delà

1. ⛔ **Un test vert par le mauvais chemin est pire qu'un test absent.** Sur sept
   sabotages, un ne rougissait pas : le contrôle passait par un `catch` qui
   rendait `null` en dur, sans jamais atteindre la ligne testée. Il cochait la
   case sans rien garder — et personne ne rouvre une case cochée.
2. ⛔ **Une dépendance ne se juge pas à ce qu'on en importe.** Un fichier JSON de
   241 Ko a tiré 600 paquets et 4 vulnérabilités critiques, dans du code
   qu'aucune ligne n'exécute.
3. ⛔ **« On commite avant de muter » — rejoué, et payé une troisième fois.**
   Éprouver un garde-fou sur un fichier non encore suivi : `git checkout --` ne
   restaure rien. Il a fallu retélécharger le paquet officiel.
4. ⚠️ **Le proxy bloque `.gouv.fr`, pas GitHub.** Un blocage réputé total ne
   l'était pas : la source était lisible depuis le début.

### Pre-mortem à trois mois — « on est en décembre, ce lot a échoué : pourquoi ? »

| Cause probable | Signal précoce | Mitigation en place | Reste à faire |
|---|---|---|---|
| **J2b n'a jamais été branché** ; l'écran ne rend toujours aucun montant, et Paul a repris ses calculs à la main | la console n'est plus ouverte pour conseiller | le débranchement est explicite à l'écran, pas silencieux | **une séance hors proxy**, c'est le seul verrou |
| Les **tokens ont dérivé** : quelqu'un a reposé une couleur en dur « juste pour un cas » | une classe `bg-slate-…` en revue | `tests/tokens.test.mjs`, éprouvé par 5 sabotages | qu'il **tourne** : voir la CI ci-dessus |
| Le **harnais de contraste a été retiré** parce qu'il rend `npm test` lent (≈ 25 s) | une PR qui le désactive « temporairement » | son coût est écrit dans son en-tête | rien — c'est un arbitrage humain |
| La CI **n'a jamais été réparée** et tout le monde s'est habitué à des PR non vérifiées | des PR fusionnées sans run | le point 3 ci-dessus | **le vérifier en ouverture** |
| Le **défaut `--line` de la vitrine** est oublié parce qu'il n'a pas de test | un audit d'accessibilité le retrouve | il est écrit dans DESIGN-LANGAGE **et** ici | lui donner un test le jour où on l'ouvre |

---

## §11 — B1 · Léo AGIT : l'anneau vert, et les deux POV creusés (29/09/2026)

Paul, le 29/09, a validé les trois recommandations : **(a)** le Jarvis vit dans
**Ultima** — Léo-produit prend ses droits anneau par anneau, Léo-séance sert
d'échafaudage ; **(b)** les POV creusés sont l'**attaquant** puis le
**mainteneur futur** ; **(c)** on reste au **cadrage** — aucune ligne de code
dans cette séance.

⛔ **Et la demande initiale est refermée avant d'aller plus loin** : Paul voulait
« faire de Léo un véritable agent ». Elle en est un depuis le 16/07 — sa charte
fait 12 110 octets, son principe d'architecture est verrouillé, sept spécialistes
sont ses sous-agents. Ce qui manque n'est pas un fichier, c'est un **runtime** :
le droit d'agir (B1), une mémoire unique (B2), des bras (B3), une boucle qui
tourne sans lui (B4). **Écrire un `.claude/agents/leo.md` de plus serait même une
régression** — dans Claude Code, un sous-agent ne peut être ni le fil principal
ni un orchestrateur.

### §11.0 — ⛔ « Trois outils » : non, DIX. La correction d'abord

Le §0 de ce cadrage affirme : *« Le catalogue compte trois outils, tous préfixés
`proposer_` »*. **C'est faux, et ça l'était déjà le 22/09 au moment de l'écrire.**

```
$ node -e "import('./api/_lib/leo.js').then(m=>{for(const[q,l]of
  Object.entries(m.OUTILS_PAR_QUADRANT))console.log(q,l.length,
  l.map(o=>o.name).join(' · '))})"
riven       3  proposer_besoin · proposer_journal · proposer_relance
bcp         0
adramelech  2  proposer_idee · proposer_enrichissement_idee
imladrik    5  proposer_page_journal · proposer_serment · proposer_flamme
               · proposer_situation · proposer_scenario

$ git log -S'proposer_flamme' --format='%h %ad' --date=short -- api/_lib/leo.js | tail -1
6bac2ef 2026-09-11
```

Les dix étaient en place **onze jours avant** ce cadrage. Ce qui a été décrit,
c'étaient les trois outils **d'un seul quadrant**, pris pour le catalogue entier.

⚠️ **Ce que ça change** : B1 est **plus petit** qu'annoncé. Le chemin
*intention → proposition → validation* ne couvre pas un quadrant, il en couvre
**trois sur quatre**, avec dix gestes déjà décrits, bornés et validés côté
serveur. Il ne reste vraiment qu'un tiers du trajet : **l'exécution**.

⛔ **Et ce que ça révèle compte davantage : NICOL BOLAS n'a AUCUN outil.** Le
quadrant financier est le seul muet — Léo ne peut rien y proposer. Ce n'est pas
un manque à réparer dans B1 : le double critère du §11.1 l'en exclut de toute
façon, et le §11.2 dit pourquoi c'est une bonne nouvelle.

⛔ **La leçon, et elle dépasse le chiffre.** Ce cadrage écrit partout « mesuré,
requête à l'appui » — et il portait une valeur comptée à l'œil, qui a survécu une
semaine et a été **répétée** le 29/09 dans la réponse faite à Paul. *Un compte
qui tient dans une phrase se mesure quand même* : c'est exactement la leçon
d'Artidispo du 18/09 (« 28 fichiers » écrit avant que quiconque compte, il y en
avait 27), payée une seconde fois ici.

### §11.1 — 🗡️ L'attaquant : « je n'ai pas besoin de vos identifiants »

Son scénario n'est pas de voler une clé. C'est d'**écrire un texte que Léo va
lire** — un mail, un formulaire de lead, un intitulé de contact importé — et qui
la pilote. Le jour où Léo écrit, ce texte devient une commande.

**A1 · La ligne de défense est déjà la bonne, et il faut savoir pourquoi.**
Le modèle n'exécute **rien** : il émet un `tool_use`, que le serveur valide
contre un **catalogue fermé** (`validerProposition`, `api/_lib/leo.js` l.301),
puis **reformule** côté serveur. Une injection ne peut pas inventer un outil,
ni élargir un argument — les schémas sont en `additionalProperties: false` avec
`maxLength` et `enum`. ⇒ **Le danger n'est donc jamais « Léo désobéit ». Il est
exactement égal à ce que le catalogue autorise.** D'où la règle qui gouverne
tout B1 : **un outil vert ne doit rien pouvoir faire qu'une injection rendrait
grave.** On ne durcit pas le modèle — on taille le catalogue.

**A2 · ⛔ Réversible ne suffit pas : il faut réversible ET VISIBLE.**
*(⚠️ Reformulée au §12.2 : sous le critère de Paul, une erreur invisible EST
une régression — simplement une régression qu'on ne découvre pas. Le fond
tient, le classement change : elle entre dans l'exception par la régression,
pas par « c'est une écriture ».)*
Le §2 taille l'anneau vert sur la seule réversibilité. Contre-exemple immédiat :
un montant faux dans NICOL BOLAS **se défait d'un clic** — et personne ne le
voit. Il alimente une prévision d'impôts, et l'erreur se découvre au tiers
provisionnel. **Une erreur réversible mais silencieuse coûte plus cher qu'une
erreur bruyante et durable**, parce qu'on ne la défait jamais : on ne sait pas
qu'elle est là. ⇒ **Le critère de l'anneau vert devient DOUBLE — réversible
*et* visible.** Conséquence directe : NICOL BOLAS ne reçoit aucun outil vert
dans B1, et son catalogue vide cesse d'être un manque.

**A3 · ⛔ FAUSSE — CORRIGÉE AU §12.2 LE 29/09. Ne pas l'appliquer.**
Elle interdisait à Léo tout ce qui « sort de la machine ». Or **Paul pousse des
branches et ouvre des PR**, et ni l'une ni l'autre ne détruit : une branche se
supprime, une PR se ferme. Ce qui engage, c'est **la fusion dans `main` et le
déploiement**. Le raisonnement d'origine, gardé pour mémoire :

~~**Un vert qui SORT de la machine est une publication.**~~
Le §2 range « les grains `FINUBAR.md` » et « les fichiers de pilotage » en vert.
Or un grain se **commite et se pousse** : historique, dépôt, lecteurs. Une
écriture qui quitte la machine ne se *défait* pas — elle se **rattrape par un
second commit**, ce qui n'est pas la même chose. ⇒ **Aucun outil vert de
Léo-produit n'écrit dans une surface qui sort de la machine.** Les grains restent
écrits par **Léo-séance**, qui passe par une PR et un œil humain. C'est un
resserrement du §2, assumé.

**A4 · Le journal est une cible, donc il s'écrit AVANT l'acte.**
Journalisé *après*, une interruption entre l'écriture et sa trace laisse une
action sans preuve — et **le silence d'une garde se lit comme une bonne
nouvelle**, ce qui est le pire des deux états. ⇒ Le journal enregistre
l'**intention** avant exécution, puis se complète par l'issue (`réussi` /
`échoué`). ⛔ Et **aucune entrée du catalogue n'écrit dans le journal** : il est
hors de la surface que Léo peut toucher, en ajout seul.

**A5 · Le plafond de VOLUME, qui n'est pas le plafond de COÛT.**
`creerGardeVoix` borne déjà les appels à la route — **un par utilisateur toutes
les 3 s** (`api/leo.js` l.39). C'est un plafond de **coût**. Il ne borne pas le
nombre d'**écritures** : dix mille idées versées dans ADRAMELECH noient les
vraies, sans qu'aucun droit particulier n'ait été obtenu — un déni de service sur
la mémoire de Paul. ⇒ Plafond d'écritures vertes **par séance**, et **un vert
ajoute, il n'écrase jamais** : écraser détruit la valeur d'avant, donc n'est pas
défaisable, donc n'est pas vert.

### §11.2 — 🔧 Paul en janvier : « elle a écrit 400 fois, comment je vérifie ? »

**M1 · L'anneau est un CHAMP du catalogue, jamais une seconde liste.**
`CATALOGUE` (`api/_lib/leo.js` l.109) est déjà la source unique : `outilsPour`,
`validerProposition` et `reformulerProposition` en dérivent tous. Poser ailleurs
une liste « ce qui est vert » créerait **deux vérités sur le même outil**, et le
jour où elles divergent on croit la mauvaise. ⇒ `anneau: 'vert' | 'orange'` sur
chaque entrée, lu par `validerProposition`. ⛔ **Un outil sans anneau est
orange** — le repli va vers le plus contraint (règle du repli, RenoDevis A1 du
13/09 : un repli se choisit sur ce qu'il coûte quand il se **trompe**).

**M2 · Le journal se PRÉSENTE, il ne s'ouvre pas.**
Un journal qu'il faut penser à consulter n'est pas consulté — et l'anneau vert
devient alors un trou, pas une délégation. ⇒ « Ce que Léo a fait depuis hier »
arrive **dans le grain du matin**, sans demande. Le porteur existe déjà :
`api/finubar-matin.mjs`. ⛔ Ne pas en créer un second.

**M3 · Le « défaire » se prouve en le jouant.**
Un défaire jamais joué n'est pas un défaire, c'est un bouton. ⇒ Il est éprouvé
sur **chaque type** d'écriture verte, et un contrôle rougit si un type de
l'anneau vert n'a pas le sien. Un type d'écriture sans défaire éprouvé **n'entre
pas dans l'anneau vert**, quelle que soit son innocuité apparente.

**M4 · La dérive se MESURE : le taux de défaites.**
Si Paul défait souvent, l'anneau est mal taillé. C'est un **chiffre**, pas une
impression — et c'est le seul signal qui dise « retirer cet outil du vert ».
⛔ **Le seuil ne se pose pas maintenant.** Il se pose après la première semaine
de mesure : inventer un seuil aujourd'hui, c'est l'**étalon inventé** du 21/09
(RenoDevis — un instrument a déclaré sept écrans sains invalides parce que sa
valeur attendue venait d'un souvenir).

**M5 · Une ligne par écriture, ou le journal ne sera pas lu.**
Contrainte de conception, pas de confort : **verbe + objet + heure + défaire**,
une ligne. Un journal de trois écrans ne se lit pas, donc ne contrôle rien — et
un contrôle qu'on ne fait pas est pire qu'un contrôle absent, parce qu'on croit
l'avoir.

### §11.3 — B1 en six points (format EL)

**① Le but — ce qui sera vrai à la fin.** Léo-produit **écrit sans demander**
dans l'anneau vert, et rien au-delà ; chaque écriture est **journalisée avant
d'être faite** et **défaisable d'un clic** ; Paul voit au matin ce qu'elle a
fait, en une ligne par geste.

**② Les étapes, dans l'ordre du dé-risquage.**
1. `anneau` devient un **champ du catalogue** ; défaut = `orange` ; lu par
   `validerProposition` (M1).
2. **Tailler l'anneau vert au double critère** (A2) : réversible ET visible, et
   qui ne sort pas de la machine (A3). Candidats à instruire :
   `proposer_idee`, `proposer_enrichissement_idee`, `proposer_page_journal`.
   ⛔ **Aucun outil de RIVEN** (`proposer_relance` touche un client) ni de
   NICOL BOLAS.
3. Le **journal** : table en ajout seul, écrite **avant** l'acte (A4),
   RLS mono-user, **aucun contenu dicté** — verbe, objet, horodatage, issue.
4. L'**exécution** des verts — aujourd'hui la route n'écrit jamais
   (`api/leo.js` l.60). C'est le seul vrai morceau neuf.
5. L'écran **« ce que Léo a fait »** + le défaire, posé dans le grain du matin
   (M2, M5).
6. Les gardes **éprouvées en les contournant** : un orange appelé comme un vert,
   un outil sans anneau, un défaire manquant, le plafond de volume.

**③ Les moyens.** `api/_lib/leo.js` (CATALOGUE, `validerProposition`),
`api/leo.js`, `api/finubar-matin.mjs`, une table Supabase `leo_ecritures`.
⚠️ **La migration SQL est un gate Paul** — le SQL vit dans `supabase/migrations/`,
jamais appliqué seul.

**④ Les critères de réussite, vérifiables.** Ils déclinent **C5** du §1.

| | Critère | La preuve |
|---|---|---|
| **B1-a** | Un outil vert écrit **sans validation** | l'écriture est en base, aucun clic |
| **B1-b** | Un outil orange **refuse** d'écrire même appelé comme un vert | la garde est contournée exprès, elle tient |
| **B1-c** | Un outil **sans anneau** est traité en orange | on en fabrique un, il ne passe pas |
| **B1-d** | **Chaque** type vert a son défaire, **joué** | l'état d'avant est restauré, mesuré |
| **B1-e** | Le journal contient **zéro contenu dicté** | une sonde le cherche et ne trouve rien |
| **B1-f** | Le plafond de volume **mord** | N+1 écritures : la N+1 est refusée |

⛔ **B1-b prime sur B1-a.** Une Léo qui n'écrit pas encore est un chantier en
cours ; une Léo qui écrit hors de son anneau est un incident.

**⑤ Ce qu'on ne fait PAS dans B1.** L'anneau orange (il marche déjà, en
proposition) · l'anneau rouge (jamais) · NICOL BOLAS (A2) · les grains FINUBAR
depuis le produit (A3) · Gmail, Calendar, tout bras extérieur (c'est B3) · la
boucle autonome (B4) · le seuil de dérive (M4).

**⑥ Le pre-mortem — « B1 a échoué : pourquoi ? »**

| Cause probable | Signal précoce | Ce qui la prévient |
|---|---|---|
| L'anneau vert a été taillé **large** « pour que ça serve à quelque chose », et une écriture silencieuse est passée | un outil de NICOL BOLAS ou de RIVEN apparaît en vert dans une PR | le double critère A2 est écrit **dans le catalogue**, pas dans un document |
| Le journal existe et **personne ne le lit** | Paul ne parle jamais d'une écriture de Léo | M2 (il se présente) + M5 (une ligne) |
| Le **défaire** est un bouton non joué ; le jour où il sert, il échoue | aucun test ne restaure un état | B1-d, un contrôle par type |
| Une **deuxième liste d'anneaux** apparaît pour « aller plus vite » | une constante `VERTS = [...]` quelque part | M1 — l'anneau est un champ, le contrôle le vérifie |
| B1 **n'est jamais commencé** parce que le parc réclame ailleurs | le cadrage grossit, le code ne bouge pas | ⚠️ c'est le risque **réel** : dix dépôts en vol. B1 se fait en **une** séance dédiée, ou pas |
| Le journal se met à porter du **contenu dicté** « pour le contexte » | une colonne `texte` dans la migration | B1-e, sonde de PII — la migration passe par un gate |

### §11.4 — Ce que la semaine écoulée confirme

L'export de la méthode vers ChatGPT (`EXPORT-METHODE-CHATGPT-v2.md`, #304-305 du
28/09) porte les quatre directives, le cadrage, la mesure, la clôture — **la
méthode**. Elle voyage, et elle a voyagé. **L'agent, lui, n'a pas suivi** : ce
qui ne se duplique pas d'un outil à l'autre, c'est précisément le runtime —
le catalogue, la validation côté serveur, la mémoire, le droit d'écrire.
⇒ C'est une confirmation de plus que **Léo-agent est un runtime, pas un
document**, et que B1 est le premier morceau qui existe vraiment.

### §11.5 — ✅ B1 ①② est LIVRÉ (29/09, go solo) — la prochaine action a bougé

**Ce qui était écrit ici** : « B1, étapes ① et ② seulement — l'`anneau` devient
un champ du catalogue, l'anneau vert est taillé au double critère. Critère de
sortie : B1-b et B1-c passent. » **C'est fait, et mesuré** (commit `1eba0e9`).

| preuve | constat |
|---|---|
| `anneau` sur les dix entrées, explicite | 10/10 |
| les verts | **3** — `proposer_idee`, `proposer_enrichissement_idee`, `proposer_page_journal` |
| **B1-b** — un orange refuse, la proposition étant valide par ailleurs | ✅ `validation de Paul requise` |
| **B1-c** — anneau absent / inconnu / mauvaise casse → orange | ✅ 11 formes éprouvées |
| `tests/unit-leo-anneau.mjs` | **19 contrôles**, 2 verrous de non-vacuité |

⛔ **Le harnais a été éprouvé EN LE CASSANT — six fois, six rouges**, chacun sur
le contrôle attendu : un quatrième vert · `normaliserAnneau` laxiste · la garde
qui ignore l'anneau · la garde qui **croit son appelant** · un champ `anneau`
retiré · une **seconde liste** posée dans `js/`. Un harnais qui ne sait pas
échouer ne prouve rien.

⚠️ **Ce qui n'est PAS acquis, nommément** : Léo n'écrit toujours rien.
`autoriserEcriture` n'a **aucun appelant** — l'exécution est l'étape ④. C'est
écrit dans le code lui-même, parce qu'un outil que personne n'appelle se lit
comme un outil qui marche.

### §11.6 — La prochaine action — ⚠️ toujours valable, mais SON SENS A GRANDI (voir §12.6)

**B1 étape ③ — le journal des écritures.** Il précède ④ : sans lui, une
exécution verte serait une écriture sans trace, et A4 dit que le journal
s'écrit **avant** l'acte.

⛔ **Il commence par une action de Paul, pas par du code** : la table
`leo_ecritures` est une **migration SQL sur une base de production**, donc un
gate — et le mode solo ne le lève pas (il n'autorise que les migrations
**correctives non destructives** ; créer une table n'en est pas une).

⚠️ **Et on n'écrit pas le module avant la table.** `autoriserEcriture` est déjà
sans appelant ; empiler une seconde couche inerte par-dessus, c'est fabriquer
du code qui a l'air de marcher. ③ commence quand le gate est levé.

---

## §12 — L'OBJECTIF FINAL, scellé par Paul le 29/09/2026

> *« Léo a une capacité de lecture, d'écriture et de modification de projet au
> même niveau que les miennes, mais toute action destructrice ou de régression
> doit être approuvée par moi. Elle travaille, elle propose, elle synthétise,
> elle prend tout en compte, elle cadre, elle joue le cadrage — comme ce qu'on
> fait nous. Au moment de passer à l'action, on me demande. »*

⛔ **CE §12 PRIME SUR LE §2 ET SUR LE §11.1.** Ils ne sont pas supprimés — ils
portent le raisonnement qui a mené ici — mais **le critère qui fait foi est
celui-ci**, et les deux sections ci-dessus renvoient désormais à celle-là.

### §12.1 — Le critère, et ce qu'il déplace

| | Ce que je proposais (§2, §11.1) | Ce que Paul tranche |
|---|---|---|
| **la question** | « qu'est-ce que ça touche ? » (une idée, un montant, un client) | **« qu'est-ce que ça casse si c'est faux ? »** |
| **le défaut** | rien n'est permis, on ouvre outil par outil | **tout ce que Paul peut faire lui-même** |
| **l'exception** | longue, à réécrire à chaque outil | **courte et nommée** : détruire, écraser, envoyer, dépenser, fusionner, déployer, migrer |

⚠️ **Pourquoi sa version tient mieux, et ce n'est pas une politesse** : la
mienne se périme à chaque outil ajouté — il faut rouvrir le cadrage pour
décider du onzième. La sienne ne bouge pas : un outil nouveau est vert s'il ne
casse rien, et le défaut `orange` attrape celui qu'on n'a pas instruit.

### §12.2 — ⛔ Ce que son arbitrage RÉVÈLE de faux dans le mien

**A3 était fausse.** J'avais écrit : *« aucun outil vert n'écrit dans une
surface qui sort de la machine »*, au motif qu'un commit poussé ne se défait
pas. **Paul pousse des branches et ouvre des PR** — ni l'une ni l'autre ne
détruit : une branche se supprime, une PR se ferme. Ce qui engage vraiment,
c'est **la fusion dans `main` et ce qu'elle déploie**. A3 se resserre donc sur
la fusion et le déploiement, pas sur « quitter le disque ».

**A2 survit, mais reformulée — et elle SERT son critère au lieu de le
concurrencer.** Je disais « réversible ne suffit pas, il faut visible ». Sous
son critère c'est plus juste encore : **une erreur invisible EST une
régression**, simplement une régression qu'on ne découvre pas. Un montant faux
se défait d'un clic et se paie au tiers provisionnel. Elle reste donc dans
l'exception — non parce que c'est une écriture, mais parce que c'est une
régression silencieuse.

**Et l'ambiguïté de sa phrase a été levée, pas devinée.** « Toute action
destructrice doit être approuvée » et « au moment de passer à l'action, on me
demande » ne tracent pas la même ligne. Lecture retenue, proposée et validée :
**Léo écrit librement ce qui est additif et réversible ; elle demande pour le
destructeur et le régressif.** ⚠️ L'autre lecture — toute écriture passe par
Paul — ferait de lui un **valideur de clics** : cinquante approbations par
jour, et au bout d'une semaine il ne lirait plus ce qu'il approuve. *Un tampon
n'est pas un contrôle* — c'est le POV « Paul fatigué » du §11.

### §12.3 — Le retaillage : les DIX outils sont verts, et c'est MESURÉ

```
$ grep -oE "methode: '[A-Z]+'" js/leo-accueil.js | sort | uniq -c
      1 methode: 'PATCH'      ← et il CONCATÈNE : existante + '\n\n' + ajout
      9 methode: 'POST'
$ grep -rn "relance_at" api/ js/ | grep -v node_modules
  → api/cockpit.js uniquement : AFFICHER les relances échues. Aucun cron.
$ grep -rniE "commande|achat|fournisseur|mail|sms|envoi" api/intendant.js
  → (vide)
```

Zéro DELETE, zéro PUT, zéro appel sortant, zéro paiement. ⛔ **Et la raison
de fond n'est pas l'anneau, c'est le principe fondateur du catalogue : AUCUN
outil de suppression, jamais** — tenu par un test depuis la boucle L2b. C'est
lui qui rend les dix verts ; **le jour où il tombe, l'anneau vert entier est à
réinstruire.**

⚠️ **Les sept anneaux ont été retournés UN PAR UN, avec leur constat.** Un
remplacement global a été refusé — et il devait l'être : *une commande qui
desserre sept gardes d'un coup est exactement ce que ce dépôt interdit.*
Le plus instructif est `proposer_relance` : **le seul dont le nom faisait
peur, et la peur était infondée.** Il ne relance personne — il pose un rappel
sur l'écran de Paul.

### §12.4 — ⚠️ Les deux conséquences du retaillage, traitées dans le même lot

**① Un contrôle allait devenir vert par vacuité.** Plus aucun outil n'étant
orange, « un orange refuse » n'avait plus rien à exercer — la façon exacte
dont un garde-fou cesse de garder sans qu'on le voie. La décision est donc
extraite en fonction **pure** (`decisionAnneau`), éprouvable quand plus aucune
donnée ne l'exerce. ⛔ Elle reste l'**unique** endroit où l'anneau décide.

**② Le plafond de VOLUME devient la garde principale.** L'anneau ne borne plus
rien sur ces dix : dix mille idées versées dans ADRAMELECH noient les vraies,
**sans qu'aucun droit particulier n'ait été obtenu**. Ce qui était une
précaution (A5) est désormais ce qui tient le dispositif — avec le journal.

⚠️ **Et la PII entre dans l'anneau vert.** `proposer_journal` et
`proposer_relance` écrivent dans le réseau commercial ; `proposer_page_journal`
dans le journal intime. Ce n'est ni destructeur ni régressif, donc vert — mais
ce n'est plus l'anneau qui les garde : ce sont le plafond de volume, l'absence
de contenu dicté dans les logs, et la RLS mono-utilisateur.

### §12.5 — Ce qui exige Paul, et rien d'autre

| | Le geste | Pourquoi |
|---|---|---|
| 🔴 | **fusionner** dans `main`, **déployer** | ça engage ce qui tourne |
| 🔴 | **envoyer** (mail, SMS, appel) hors bac à sable | ça sort et ne revient pas |
| 🔴 | **dépenser**, créer une ressource facturée | irréversible par nature |
| 🔴 | **supprimer**, **écraser** une valeur saisie à la main | la valeur d'avant est perdue |
| 🔴 | **migration SQL**, changement RLS, `revoke` | régression possible sur tout le système |
| 🔴 | **secret** ou variable d'environnement | ne se relit pas, ne se teste pas |
| 🔴 | **barème**, règle métier, taux | une régression silencieuse chez un client |
| 🟠 | l'outil **non instruit** — le onzième | `ANNEAU_PAR_DEFAUT` le tient |

### §12.6 — ✅ B1 ③ est écrit — ce qui reste est le GATE, puis ④

L'étape ③ devait commencer par le gate. **Elle a pu commencer avant**, et c'est
le `CLAUDE.md` qui le dit : *« le SQL vit dans `supabase/migrations/`, jamais
appliqué seul »*. **Écrire** la migration n'est pas un gate — seule son
**application** l'est. Ce qui est livré le 29/09 :

| | livré | preuve |
|---|---|---|
| la migration | `supabase/migrations/20260929220000_leo_ecritures.sql` | **écrite, NON appliquée** |
| les décisions | `api/_lib/leo-journal.js` — fonctions **pures** | 22 contrôles, sans base |
| le plafond | `creerPlafondEcritures` | éprouvé des deux côtés |

⛔ **APPEND-ONLY STRICT, et c'est ce qui résout la contradiction d'A4.** Le
journal doit s'écrire AVANT l'acte ; mais « écrire puis compléter » demanderait
une policy UPDATE, donc de quoi réécrire une ligne posée. On pose donc
plusieurs lignes reliées par `trace_id` — `tentee` → `reussie` | `echouee` →
`defaite` — et aucune ne se modifie. ⚠️ **Une `tentee` restée SEULE est
elle-même une information** : l'écriture s'est interrompue en vol. Une table
modifiable l'aurait effacée. Aucune policy UPDATE ni DELETE, plus un `revoke`
au niveau table : une policy ajoutée par inadvertance ne rouvrirait pas la porte.

⛔ **Aucun contenu dicté ne PEUT entrer** — tenu par la forme, pas par la
discipline : liste de clés **fermée** (un `texte` fait refuser l'entrée), cible
vérifiée comme **UUID** (« Racheter le local » est refusé), et un `motif` qui
**se refuse** au-delà de 200 caractères au lieu de se tronquer — tronquer
laisserait entrer les 200 premiers caractères d'une page de journal intime. La
borne est une sonde, et une sonde ne rattrape pas.

⛔ **L'anneau est DÉRIVÉ du catalogue, jamais reçu.** Le laisser passer par
l'appelant permettrait de journaliser « vert » une écriture faite sous un autre
régime : le journal mentirait, ce qu'il n'a pas le droit de faire.

⚠️ **UN CONTRÔLE DE CE LOT NE PROUVAIT PAS CE QU'IL ANNONÇAIT**, et il a été
trouvé en cassant, dans le passage même qui l'a écrit. Il s'appelait
`anneauLuPasRecu` et ne testait que ce que la liste fermée tient déjà : un
sabotage rendant l'anneau recevable laissait le harnais **vert**. Le sabotage
était neutre — il n'y avait pas de faille — mais *un test vert par le mauvais
chemin est pire qu'un test absent*, parce qu'on le cite en revue. Remplacé par
deux contrôles qui mordent, dont l'un vérifie dans la source qu'`anneau` n'est
pas une clé acceptée.

⚠️ **Le plafond est à 40 écritures par heure, et c'est une valeur de DÉPART.**
L'ordre de grandeur se justifie (un seul outil par tour, et Paul dicte) ; le
chiffre exact non. Il se re-règle sur une semaine de journal. ⛔ Ne pas le
durcir avant : un seuil posé au jugé bloque du travail réel et finit désarmé.

### §12.7 — ✅ LE GATE EST FRANCHI — la table existe (30/09, GO de Paul)

`20260929220000_leo_ecritures.sql` est **appliquée** sur le projet Ultima
(`leosfqyidgsaescjbfom`, eu-west-3 — sa base PROPRE, pas la base partagée des
quatre briques : vérifié avant, la leçon du 17/08 ne s'applique pas ici).

**Éprouvée du côté où le garde-fou peut être contourné**, pas du côté qu'on
emprunte :

| sonde | constat |
|---|---|
| `anon` INSERT | **refusé** — `42501 violates row-level security policy` |
| `authenticated` UPDATE / DELETE | privilège **absent** |
| phase inventée | **refusée** — `23514 leo_ecritures_phase_check` |
| **miroir** : la voie serveur écrit | **2 lignes**, un seul `trace_id` |
| RLS · policies · index | active · **2** (aucune UPDATE/DELETE) · 3 |

⚠️ **Le dry run a trouvé quelque chose** : `anon` gardait le privilège INSERT
(défaut Supabase sur `public`). **Ce n'était pas une faille** — la RLS refusait
déjà, et le dire importe autant que le corriger. Mais un droit accordé sans
usage est un droit qu'une policy mal réécrite un jour suffirait à rendre
exploitable : retiré par `20260930080500_leo_ecritures_ferme_anon.sql`. Deux
barrières, pas une.

⚠️ **Et un contrôle que j'avais écrit était CREUX** : « phase inventée refusée »
passait par un `case when` qui rendait toujours « refusée ». Refait en tentant
l'insert pour de vrai. *C'est le même défaut que celui trouvé la veille sur
l'anneau, deux fois dans la même séance* — un contrôle qui ne peut pas échouer
se lit exactement comme un contrôle qui a réussi.

### §12.8 — ⛔ DEUX TABLES ORPHELINES, trouvées en appliquant

En vérifiant l'état de la base avant d'écrire, deux tables sont apparues —
**`leo_missions` (18 colonnes) et `leo_operations` (7)** — qui portent un
dispositif très proche de celui qu'on vient de concevoir : `state` à
`'proposed'`, `max_calls` / `max_units` / `used_units` / `calls` (un plafond),
`stopped` (un coupe-circuit), `scope`, `readers` / `writers`, `version` (un
verrou de concurrence), et un journal à `operation_id` / `base_version` /
`status` / `result`.

**Mesuré le 30/09 :**

| | constat |
|---|---|
| lignes | **0** dans les deux |
| référencées dans ce dépôt (`.js`, `.mjs`, `.ts`, `.sql`, `.md`) | **aucune** |
| migration correspondante dans `supabase/migrations/` | **aucune** |

⛔ **CETTE PHRASE ÉTAIT FAUSSE — corrigée le 30/09.** Elle disait : « elles
ont été posées par autre chose que ce dépôt ». Le registre des migrations le
démentait, et il suffisait de le lire :

```sql
select version, name from supabase_migrations.schema_migrations;
-- → 20260929125105 · leo_lv1_registre_transactionnel
```

Appliquée le **29/09 à 12:51 UTC — pendant notre séance**. « LV1 » est le
vocabulaire d'Ultima (LV2 à LV6 courent dans tous les cadrages). ⇒ Ce n'est
pas « autre chose », c'est **un chantier Ultima mené dans une séance
parallèle**, dont la migration n'a jamais été commitée.

⚠️ **Et c'est le vrai problème, plus grave que deux tables inconnues : LE DÉPÔT
NE DÉCRIT PLUS LA BASE.** Une séance qui lit `supabase/migrations/` pour savoir
ce qui existe conclut que ces tables n'existent pas — c'est exactement l'erreur
que j'ai commise le 29/09 en concevant `leo_ecritures` sans les voir. Relevé
rapatrié dans `20260929125105_leo_lv1_registre_transactionnel.RELEVE.sql`
(un CONSTAT, pas l'original — le suffixe le dit).

### §12.8 bis — ⛔ ET LE RELEVÉ A TROUVÉ UNE FAILLE RÉELLE

`leo_operations_read` ne vérifiait **que l'existence** de la mission, jamais son
propriétaire :

```sql
EXISTS (SELECT 1 FROM leo_missions m WHERE m.id = leo_operations.mission_id)
```

Tout compte authentifié pouvait lire les `payload` et `result` (16 Ko de jsonb
chacun) des opérations de **n'importe quelle** mission. Sa policy sœur,
`leo_missions_read`, faisait le contrôle correctement — **l'écart entre les deux
est ce qui l'a rendue visible** : une table cloisonnée, sa fille ouverte.

⚠️ **Portée mesurée avant de corriger** : 1 seul compte, 0 ligne dans les deux
tables. **Rien ne fuyait à cet instant.** Mais `readers`/`writers` existent par
conception : c'était une bombe à retardement, pas un détail théorique.

✅ **Corrigé et éprouvé des deux côtés sur un cas FABRIQUÉ** — les tables étant
vides, « rien ne fuit » aurait été vrai par vacuité :

| sonde | constat |
|---|---|
| verrou de non-vacuité (la ligne existe) | **1** |
| intrus authentifié → opérations · missions | **0 · 0** |
| propriétaire → opérations · missions | **1 · 1** |

⛔ Le miroir compte autant que le refus : sans lui, un cloisonnement parfait et
une table illisible rendraient le même zéro.

⛔ **POURQUOI `leo_ecritures` A QUAND MÊME ÉTÉ CRÉÉE**, et ce n'est pas un
passage en force : `leo_operations.payload` est un **jsonb libre**. Il PEUT
donc porter du contenu dicté — précisément ce que `leo_ecritures` interdit par
construction. Il dépend en plus d'une `mission_id`, alors qu'on journalise une
écriture, pas une mission ; et il n'a ni `owner_id`, ni outil, ni quadrant, ni
anneau. Voisin conceptuellement, incompatible structurellement.

⏳ **CE QUI RESTE À PAUL — une décision, pas une action.** Ma recommandation a
CHANGÉ avec la mesure : je disais « les supprimer », croyant qu'elles venaient
d'ailleurs. Elles viennent d'Ultima et portent le moteur de l'étape ④.
⇒ **Les GARDER**, et écrire la frontière entre les deux journaux :

| | son rôle | ce qu'il porte |
|---|---|---|
| `leo_operations` | le **registre du moteur** | idempotence, quotas, verrou de version, `payload` libre |
| `leo_ecritures` | le **journal lisible par Paul** | outil · quadrant · anneau · phase, **zéro contenu dicté** |

### §12.8 ter — La frontière, expliquée (Paul, 30/09 : « explique »)

⛔ **CE NE SONT PAS DEUX JOURNAUX CONCURRENTS — CE SONT DEUX FONCTIONS.** L'un
**régule** (il empêche), l'autre **rend compte** (il montre). Le risque de
« deux vérités » n'existe que si les deux prétendent répondre à la MÊME
question ; il suffit donc de leur en assigner une chacune.

| | ce qu'il sait faire | ce qu'il ne sait PAS faire |
|---|---|---|
| **`leo_operations`** | **empêcher un doublon** (PK `mission_id, operation_id`) · **refuser sur état périmé** (`base_version`) · **compter les quotas** et **couper** (`max_calls`, `stopped`, `expires_at`) | dire quel **outil**, quel **quadrant**, sous quel **anneau**. Il ne connaît que des missions et des `payload` |
| **`leo_ecritures`** | dire **quoi**, **où**, **sous quel régime**, **avec quelle issue** · garantir **zéro contenu dicté** par la forme des colonnes · distinguer une écriture **interrompue en vol** d'une écriture aboutie | empêcher un doublon · verrouiller la concurrence · compter un quota. **Il raconte, il ne régule pas** |

⚠️ **Et leur défaut respectif est exactement la force de l'autre.** Le `payload`
de `leo_operations` est un jsonb libre de 16 Ko : c'est ce qui le rend générique,
et c'est ce qui l'empêche de promettre l'absence de PII. Les colonnes de
`leo_ecritures` sont fermées : c'est ce qui tient la promesse, et c'est ce qui
l'empêche de servir de registre générique.

**La règle, ARBITRÉE par Paul le 30/09** — un seul chemin, deux enregistrements :

> Une écriture passe par **`leo_operations`** pour être **autorisée et
> dédoublonnée**, et laisse sa trace lisible dans **`leo_ecritures`**.
> · « cette opération a-t-elle déjà été faite ? » → `leo_operations`
> · « qu'est-ce que Léo a fait hier ? » → `leo_ecritures`

⛔ **ET LE GARDE-FOU QUI EMPÊCHE LA DIVERGENCE, qui est le vrai sujet :**
`leo_ecritures.trace_id` **=** `leo_operations.operation_id`. Alors une ligne de
l'un se retrouve dans l'autre, et un contrôle peut exiger qu'**aucune écriture
n'existe d'un seul côté**. *Sans cette clé partagée, la frontière ne tient que
par une bonne intention — et une bonne intention n'est pas un garde-fou.*
⚠️ `operation_id` est un `text` borné par un motif, `trace_id` un `uuid` : la
forme d'`operation_id` accepte un UUID, donc le lien se fait sans toucher au
schéma de la séance parallèle.

**L'alternative écartée — fusionner** : ajouter outil/quadrant/anneau/phase à
`leo_operations` et supprimer `leo_ecritures`. Deux raisons de ne pas le faire :
le `payload` resterait libre, donc la promesse « zéro contenu dicté » tomberait ;
et il faudrait modifier la table d'un chantier mené ailleurs — c'est précisément
ce qui a coûté la journée.

✅ **ARBITRÉ — Paul, le 30/09 : « garde les deux avec la clé ».** Voir
§12.8 quater pour ce que la décision a coûté en mesures avant d'être tenable.
⛔ Les tables n'ont PAS été touchées — la clé se pose dans le CODE, pas dans le
schéma, et c'est précisément ce qui rend l'arbitrage applicable sans rouvrir le
chantier de la séance parallèle.

### §12.8 quater — ✅ LA DÉCISION, ET CE QU'ELLE A COÛTÉ AVANT D'ÊTRE TENABLE

**Paul, le 30/09 : « garde les deux avec la clé ».** Les deux registres vivent,
et `leo_ecritures.trace_id` **===** `leo_operations.operation_id` est ce qui les
empêche de diverger.

⛔ **L'ARGUMENT QUI A PORTÉ SA DÉCISION ÉTAIT UNE AFFIRMATION NON VÉRIFIÉE — et
je l'ai mesurée après coup, avant d'écrire une ligne de code.** §12.8 ter disait
« la forme d'`operation_id` accepte un UUID, donc le lien se fait sans toucher au
schéma ». Je ne l'avais pas lue en base : je l'avais déduite du motif. Si elle
avait été fausse, l'arbitrage de Paul portait sur une frontière irréalisable, et
il l'aurait appris en la mettant en œuvre. C'est la Directive EL : rien de ce
qui est donné à Paul n'est déduit — **surtout pas la prémisse d'un choix qu'on
lui demande de trancher.**

| mesuré en base le 30/09 | constat |
|---|---|
| UUID minuscule / MAJUSCULE / tout-zéros comme `operation_id` | **acceptés** — la clé partagée est possible |
| tiret initial · 129 caractères | **refusés** — le motif reste discriminant, il n'accepte pas n'importe quoi |
| INSERT réel des deux côtés, transaction annulée — jointure sur la clé | **2** |
| les deux sondes de divergence sur cet état sain | **0** et **0** |
| verrou de non-vacuité (la jointure porte bien sur quelque chose) | **2** |
| ⚠️ les mêmes sondes sur des orphelins **fabriqués exprès** | **1** et **1** |

⚠️ **La dernière ligne est celle qui compte.** Deux sondes à zéro sur un état
sain ne prouvent rien : « aucune écriture n'existe d'un seul côté » est vert sur
deux tables vides. Il a fallu fabriquer un journal sans opération et une
opération sans journal pour les voir crier.

**Où vit la clé, et pourquoi là** : `ouvrirTrace()` dans `api/_lib/leo-journal.js`
est **la** façon de fabriquer la paire, et la seule. Deux endroits qui
fabriquent l'identifiant finissent par en fabriquer deux différents, et alors
les registres ne se rejoignent plus — sans que rien ne le dise au moment où ça
arrive. Même principe que l'anneau : un CHAMP du catalogue, jamais une seconde
liste.

⛔ **ET LE HARNAIS A ATTRAPÉ UNE CORRECTION SILENCIEUSE DANS MON PROPRE CODE.**
La première version rendait une trace **valide** sur `ouvrirTrace('')`,
`ouvrirTrace(null)` et `ouvrirTrace(42)` : elle générait un UUID par-dessus
l'argument absurde. Un appelant qui se trompe obtenait donc une clé au lieu d'un
refus — exactement ce que ce dépôt interdit partout ailleurs (les énumérations
d'arguments, la casse des anneaux, le vocabulaire des postes du corpus). Corrigé
en séparant les deux sens de l'appel sur `args.length`, pas sur la valeur :
`ouvrirTrace()` fabrique, `ouvrirTrace(x)` vérifie ou refuse.
⚠️ Et son miroir compte autant : sans `sansArgumentGenere`, « fail-closed »
pourrait vouloir dire « refuse tout », et la clé ne servirait jamais.

⛔ **DOUBLE VÉRITÉ ASSUMÉE, DONC GARDÉE** : le motif d'`operation_id` vit dans le
code ET en contrainte SQL — une contrainte ne s'importe pas. Un contrôle lit le
motif dans le fichier de migration et exige que les deux coïncident, avec son
verrou de non-vacuité (sur une regex qui ne matche pas, « les deux coïncident »
serait vrai à vide). Même dispositif que pour `PHASES`.

⚠️ **Ce que ce lot NE fait pas** : aucune migration, aucune écriture réelle.
`ouvrirTrace` n'a **aucun appelant**, comme `autoriserEcriture` — à dessein. Les
deux se branchent à l'étape ④.

### §12.9 — La prochaine action, unique

**④ — l'exécution.** Brancher `autoriserEcriture` (qui n'a toujours aucun
appelant, à dessein) sur une écriture réelle : entrée de journal posée AVANT
l'acte, plafond consulté, issue posée après. C'est là, et seulement là, que Léo
écrira. **Plus aucun gate ne l'attend.**
