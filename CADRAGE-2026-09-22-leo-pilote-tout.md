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
> comment est défini et assumé AVANT la première ligne. Aucun code n'est écrit
> tant que les arbitrages du §8 ne sont pas rendus.

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

## §1 — L'objectif final, et le critère qui dit qu'on y est

**Le cap (JL)** : Ultima est l'unique interface de travail de Paul, Léo son unique
interlocutrice. Piloter 11 dépôts n'est pas le but — c'est le moyen.

**Le but réel, en clair** : Paul ouvre Ultima, et en trois clics il conseille
juste un particulier, un pro ou une entreprise sur les aides auxquelles il a
droit, **avec des chiffres dont Léo peut citer la source et la date**.

**Les critères de sortie, chiffrés et vérifiables :**

| | Critère | Comment on le prouve |
|---|---|---|
| **C1** | Finubar voit **11/11** dépôts, `hors_seance: 0`, depuis une séance sans dépôt attaché | `node finubar/collecter.mjs` |
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

## §3 — Les aides d'État : la règle, et le patron qui existe déjà

⛔ **RÈGLE D'OR, non négociable** : **Léo ne conseille jamais sur un chiffre dont
elle ne peut pas citer la SOURCE et la DATE D'EFFET.** Directive EL appliquée au
produit — et ici la valeur n'est pas seulement crue par Paul : elle est répétée à
un client final qui va décider de travaux dessus.

**Le patron existe dans la maison, on ne le réinvente pas** :
`RenoDevis/lib/tva.ts`. Il résout exactement ce problème pour la TVA et a été
éprouvé en le cassant. Ce qu'on en reprend, ligne à ligne :

| Ce que `lib/tva.ts` fait | Transposé aux aides |
|---|---|
| une table `REGLES` **datée et sourcée** | un barème par aide, avec date d'effet et référence du texte |
| `dateDevis` **obligatoire, sans défaut** | la date du conseil est obligatoire — un dossier de juin rouvert en octobre garde SON barème |
| ⛔ **le repli va vers le HAUT** | condition inconnue → **l'aide la moins favorable**, jamais la plus généreuse « au cas où ». Se tromper en annonçant moins coûte une déception ; se tromper en annonçant plus coûte un client qui a engagé des travaux sur une aide qu'il n'aura pas |
| `null ≠ false` | une question non posée se répare ; un « non » constaté ne se répare pas. Seuls les `null` sont listés comme manquants |
| la table ne se modifie **que dans une PR** | idem — anneau rouge |
| la péremption **signale**, elle ne casse pas la CI | un barème non relu depuis N jours s'affiche « à revérifier », il ne fait pas tomber le build un lundi matin |

**Ce que ça impose à renoboost-console, avant tout branchement :**

1. **Qualifier les cinq sources.** Hors proxy : lesquelles répondent, sous quel
   contrat, avec quelle fraîcheur ? Une source qui ne résout pas sort de la liste
   — elle ne reste pas « au cas où ».
2. **Une source morte doit se voir.** `return []` devient un état typé et affiché :
   *source injoignable, dernière réponse le …*. ⛔ Ne jamais retomber en silence.
3. **Sortir les barèmes du prompt** vers une table datée et sourcée, à l'image de
   `lib/tva.ts`. Le prompt les **lit**, il ne les **porte** plus.
4. **Un seul endroit par chiffre.** `page.tsx:61` cesse de porter 50 000 €.
5. **Deux personas séparés.** Le conseil à un particulier et le montage financier
   d'un artisan ne peuvent pas sortir du même prompt « agressif ». Les garde-fous
   de `DATARENO-/CLAUDE.md` s'appliquent au premier, mot pour mot.
6. **Fusionner les deux `core_engine.py`.**

⚠️ **Et si aucune source publique fiable n'existe** — c'est une issue possible, pas
un échec : alors les barèmes sont **saisis à la main dans une table versionnée**,
avec leur source et leur date, et relus périodiquement. C'est moins brillant qu'une
API, c'est vrai, et ça reste conforme à C3. ⛔ Une API inventée est pire qu'une
table tenue à la main.

---

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
| Rate limit | 11 dépôts × 3 appels × 10 collectes ≈ 330/jour | ⬇️⬇️ | Sous les 5 000/h authentifié — **à mesurer une fois**, pas à supposer |
| ⛔ On passe à 11/11 et **2 des 11 n'ont rien à dire** : mesure améliorée, pilotage inchangé | un grain immobile depuis 30 j | ⬆️⬆️ | **Trancher le périmètre AVANT** (§8, décisions 1-2) |

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
| Léo écrit **dans le mauvais dépôt** (11 dépôts, des noms proches, deux bases Supabase) | une note dans le grain du voisin | ⬆️⬆️ | Le dépôt cible est un **argument borné** du catalogue, jamais déduit du fil de conversation |
| ⛔ **Les deux bases sont confondues.** Ultima = `leosfqyidgsaescjbfom` ; les 4 briques = `mwaryfscxgrulauwwque`. Un objet de la base partagée n'appartient jamais au dépôt d'où on le regarde | une écriture qui casse une autre brique | ⬆️⬆️ | La leçon du 17/08 (`RenoDevis/CLAUDE.md`) s'applique : **toute restriction de droit se contrôle sur les quatre dépôts**, et le gate n'est pas levé si l'un manque |
| Paul **ne relit plus** les propositions et valide en rafale | le taux de refus tombe à zéro | ⬆️⬆️ | La proposition affiche **ce qui va changer**, pas son intitulé. Et une proposition orange **expire** : validée trois jours plus tard, elle est rejouée, pas appliquée |

### PM-4 · « Le projet entier a échoué » — vue à 3 mois (22/12/2026)

| Cause | P×I | Solution apportée |
|---|---|---|
| ⛔ **Onze dépôts, un seul homme.** Le pilotage devient l'activité, au détriment du produit. Trois mois passent, Finubar est superbe, aucun client de plus | ⬆️⬆️ | **Le critère de recette est la Directive IA** : la livraison a-t-elle réduit ce que Paul fait à la main ? Un jalon qui n'enlève pas de travail est une régression. Et §8 décision 2 : **fermer ou geler** ce qui ne sert plus |
| Le conseil « 3 clics » donne un mauvais chiffre à un vrai client | ⬆️⬆️ | C3 prime sur C4, et l'écran sait dire « je ne sais pas » |
| Léo devient un **point de compromission unique** : un agent, onze dépôts, deux bases, droits d'écriture | ⬇️⬆️ | Les trois anneaux + catalogue fermé + journal. ⛔ « Un seul agent » est une règle d'**ergonomie** (un interlocuteur pour Paul), jamais une règle de **privilèges** : Léo délègue à des agents aux droits étroits, elle ne cumule pas les leurs |
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

## §8 — Les arbitrages de Paul — rien ne se code avant

| # | Question | Ce qui en dépend |
|---|---|---|
| **1** | **Ripair** : dépôt distinct `paggerard-boop/ripair` à attacher, ou service déjà couvert par le grain de **RenoPredict** ? Le registre le déclare, la séance ne le voit pas | Le parc est à 10 ou 11. Change J1 |
| **2** | **Le périmètre franc.** Les 11 sont-ils tous pilotés, ou certains sont-ils **gelés** (artisan-builder ? DATARENO- ?) ? Un gel assumé est une réponse, pas un renoncement | Volume de J1 × 2. C'est la réponse au POV n° 6 |
| **3** | **Les aides : qui fait foi ?** Si aucune API publique n'est exploitable, accepte-t-on une **table versionnée tenue à la main**, relue périodiquement ? | Débloque J2, donc tout le reste |
| **4** | **Le conseil en 3 clics : catalogue ou croisement ?** Un simulateur d'aides générique (que France Rénov' fait déjà), ou *« pour CE client, avec CE devis, dans CE dossier »* ? | Change la nature de J4 — et c'est la réponse au POV n° 5 |
| **5** | **Quelle Léo ?** Les droits d'écriture visent Léo-**produit** (`api/leo.js`, celle de l'interface). Confirmé ? | Léo-séance écrit déjà ; seuls les gates la bornent |
| **6** | **L'anneau vert te convient-il tel qu'il est défini** (§2), ou veux-tu y ajouter / retirer quelque chose ? | Détermine J3 |

---

## §9 — La prochaine action, unique

**L'arbitrage du §8.** Les décisions 1, 2 et 3 changent le volume du chantier d'un
facteur trois et son ordre d'exécution. Le pre-mortem PM-1 les désigne comme
dé-risquantes : tant qu'elles ne sont pas rendues, toute ligne écrite risque
d'être écrite pour rien — Directive EB, ne pas travailler pour travailler.

⚠️ **Une chose ne dépend d'aucun arbitrage et peut partir dès le go** : tester les
cinq sources d'aides **hors proxy**. C'est la mesure qui conditionne J2, elle ne
coûte rien, et elle tranche la décision 3 au lieu de la faire deviner.
