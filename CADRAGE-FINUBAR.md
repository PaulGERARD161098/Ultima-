# CADRAGE — FINUBAR : piloter huit dépôts sans s'y perdre

> Format 6 points (**directive EL**). Demande dictée par Paul le 21/08/2026 :
> *« Je développe beaucoup de choses en ce moment, beaucoup de projets qui
> tournent, et j'ai un peu peur de m'y perdre. »*
>
> Ce document est écrit **après** l'exécution du premier palier, pas avant : le
> cadrage a été rendu à Paul en séance, il a arbitré trois points, et le palier
> a été livré dans la foulée. Il est consigné ici parce qu'une décision qui ne
> vit que dans un fil de conversation est perdue à la séance suivante.

---

## 0. La reformulation — ce que la demande dit vraiment

La demande brute mélangeait **quatre besoins** de nature différente. Les
séparer était le premier travail, parce qu'ils n'ont ni le même coût ni le même
risque :

| | Besoin | Nature |
|---|---|---|
| **A** | Savoir, à l'ouverture d'une séance, **où on s'est arrêté** et **par quoi on reprend** | mémoire courte, par dépôt |
| **B** | Savoir, d'un coup d'œil, **où en sont TOUS les projets** | vue transverse |
| **C** | Que ça se tienne à jour **tout seul** | automatisation |
| **D** | Ne jamais perdre **l'objectif final** de vue | directive JL, à porter dans la donnée |

**Ce que la reformulation a révélé, et qui a changé le plan** : le besoin A est
**déjà servi** dans les dépôts les plus actifs — `REPRISE-*.md`, `NOTE-*.md`,
`ROADMAP-MASTER.md`, les rappels permanents des `CLAUDE.md`. RénoBoost porte à
lui seul **21 fichiers `ROADMAP-*`**. Le problème n'est donc pas l'absence de
mémoire : **c'est qu'elle est éparpillée sur huit dépôts et qu'aucune n'est lue
automatiquement**. Finubar n'est donc pas un nouveau système de roadmaps — c'en
serait un vingt-deuxième. C'est un **index**, et il ne recopie rien.

---

## 1. ① Le but — ce qui est vrai maintenant

1. **À l'ouverture de n'importe quelle séance, dans n'importe lequel des huit
   dépôts**, l'état de ce dépôt est injecté tout seul : cap, jalon, dernier
   arrêt daté et *commité*, prochaine action, gestes en attente. Zéro geste,
   zéro recherche, ~250 tokens.
2. **Un seul écran montre les huit**, rangés par ce qui appelle, avec le cap de
   chacun — le « vers quoi » (D) est un champ de la donnée, pas un commentaire.
3. **La note ne peut pas mentir en silence** : la collecte compare le commit
   noté à la tête réelle du dépôt et affiche l'écart.

## 2. ② Les étapes — ce qui a été fait, dans cet ordre

| | Palier | Pourquoi à ce rang |
|---|---|---|
| **P1** | Le moteur PUR + son harnais, éprouvé **rouge puis vert** | rien ne se branche sur un moteur non prouvé |
| **P2** | Les 8 grains, semés depuis **l'état réel mesuré** | *la proactivité sans donnée est un haut-parleur dans une pièce vide* (LV6 §0.4) |
| **P3** | Le rappel d'ouverture de séance dans les 8 dépôts | c'est **la** demande de Paul, et il ne dépend d'aucun écran |
| **P4** | La collecte + la mesure de dérive | ce qui empêche P2 de pourrir |
| **P5** | L'écran `/finubar` + son harnais | la vue d'ensemble, une fois le reste sûr |

**Reporté, et volontairement** : l'entrée des projets dans la constellation
générale (arbitrage F-3 ci-dessous). `versConstellation()` est **écrit et testé**
mais branché sur aucune page — le jour venu, c'est un branchement, pas une
réécriture.

## 3. ③ Les moyens

Node pur, zéro dépendance ajoutée, zéro migration, zéro secret, zéro cron.
Le moteur tourne à l'identique en Node et dans le navigateur, comme
`althea-progression.mjs` — et pour la même raison : ce qui décide se teste sans
navigateur et sans base.

## 4. ④ Les critères de réussite — vérifiables

| Critère | Preuve |
|---|---|
| Le moteur ne se trompe pas sur des cas connus d'avance | `tests/unit-finubar.mjs` — 7 sections, dont 4 de cas de référence |
| Le harnais **sait être rouge** | trois fautes injectées (date absente → 0 · mot de reproche · grain écarté), rouges puis vertes |
| Le rappel s'injecte vraiment | exécuté dans les 8 dépôts, sortie relue |
| L'écran rend l'agrégat **tel quel** | `tests/smoke-finubar.mjs` §2 — l'ordre est comparé caractère par caractère |
| Les textes **authentifiés** sont AA | `smoke-finubar.mjs` §3, session stubée, sonde éprouvée à 1,76:1 sur un cas mauvais |
| Le patrimoine ne régresse pas | `bash tests/lancer.sh` en entier |

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- Aucun cron, aucune notification, aucun e-mail (arbitrage F-2).
- Aucune modification de `js/ciel.js` ni de la navigation (arbitrage F-3).
- Aucune roadmap réécrite, aucun `REPRISE-*.md` touché.
- Aucun appel à l'API GitHub depuis le produit : la collecte lit **git en local**.

## 6. ⑥ Le pre-mortem — « dans trois mois, Finubar ne sert plus »

| # | Cause probable | Signal précoce | P × I | Mitigation — et où elle est **dans le code** |
|---|---|---|---|---|
| **1** | **Les grains ne sont plus tenus à jour.** Le dispositif devient huit fichiers périmés qu'on croit | un grain dont `maj` a plus de deux semaines | 🔴 Forte × 🔴 Fort | La note **dit qu'elle a vieilli** : `collecter.mjs` compare `dernier_arret.commit` à la tête, `rangDe()` remonte le dérivé **avant tout le reste**, et le rappel de séance l'écrit en clair. On ne peut pas empêcher un fichier de vieillir — on peut l'obliger à le dire |
| **2** | **Finubar devient une 22ᵉ roadmap** — on y recopie les jalons, les deux divergent, on croit la mauvaise | un grain qui grossit, des détails qui n'existent que là | Moyenne × 🔴 Fort | Le champ `rattache_a` **pointe** au lieu de recopier ; les textes sont **bornés à 400 caractères** par `lireGrain` — un grain ne PEUT pas devenir une roadmap |
| **3** | **Le rappel devient du bruit** : trop long, lu en diagonale, puis plus lu | — | Moyenne × Moyen | ≤ 3 signaux, **1** action, ~250 tokens, borné par le harnais |
| **4** | **Le ton culpabilise** et Paul évite d'ouvrir l'écran | un libellé qui reproche | Faible × 🔴 Fort | `MOTS_INTERDITS` asserté par le harnais. *Finubar compte, il ne reproche pas* |
| **5** | **Un dépôt disparaît du radar** — grain cassé, lu comme « rien à signaler » | un dépôt qui n'apparaît plus | Faible × 🔴 Fort | Un grain illisible **remonte avec son motif** ; `§5` du harnais l'exige, et l'écran l'affiche |
| **6** | **L'ordre affiché n'est pas l'ordre juste** — on suit un tri alphabétique en croyant suivre une priorité | — | *déjà survenu, le 21/08* | Le tri retombait sur l'alphabet et plaçait `artisan-builder` devant RénoBoost. Corrigé par `en_attente_depuis` : à rang égal, c'est une **ancienneté** qui départage, jamais un nom |
| **7** | **On code au lieu d'amorcer** — Finubar affiche joliment des compteurs à zéro | une PR qui n'aide ni le jalon 0 ni le jalon 1 | Moyenne × 🔴 Fort | Le cartouche propose **le geste de Paul** quand le projet de tête l'attend, pas sa prochaine tâche de code. C'est la directive EB câblée dans le produit |

**Ce que le pre-mortem dit de l'ordre d'exécution** : la cause n° 1 domine, et
elle ne se traite pas par plus de fonctionnalités. D'où le rang de P4 (la mesure
de dérive) **avant** l'écran.

---

## 7. Les arbitrages rendus par Paul le 21/08 — ne pas les reposer

| # | Question | Réponse |
|---|---|---|
| **F-1** | Quel périmètre ? | **Les 8 dépôts de code.** Les quadrants perso d'Ultima (IMLADRIK, NICOL BOLAS, ADRAMELECH) restent hors Finubar pour l'instant |
| **F-2** | Le rappel arrive par où ? | **À l'ouverture d'une séance**, et rien d'autre : ni cron matinal, ni notification, ni e-mail. Ce qui tourne les jours où Paul ne travaille pas, il ne le lit pas |
| **F-3** | Quelle forme dans Ultima ? | **Page + cartouche maintenant**, et *« à terme, tout projet d'ampleur doit être dans la constellation générale — on en reparle »*. D'où `versConstellation()`, écrit et testé, branché sur rien |

**Trois choses à ne jamais défaire :**

1. **Le grain se met à jour en FIN de séance, dans le commit du travail.** Écrit
   au début, il décrit une intention et se lit comme un fait.
2. **`dernier_arret.commit` est renseigné avec le commit réellement poussé.**
   C'est le seul garde-fou contre une note qui ment. Le vider revient à éteindre
   la mitigation n° 1 du pre-mortem.
3. **Finubar indexe, il ne recopie pas.** Le jour où un jalon détaillé est
   recopié dans un grain, on a fabriqué la 22ᵉ roadmap et la cause n° 2.

---

## 7 bis. Le diagnostic du 21/08 — dix écarts trouvés, dix corrigés

Demande de Paul, le jour même de la pose : *« dry run + diag, pas de trou, pas de
faille, pas de bug, pas de carence — implante les patchs au fur et à mesure. »*
**Dry run : 19 parcours réels, 19 conformes.** Le diagnostic, lui, a trouvé ceci :

| # | Nature | Écart | Correctif |
|---|---|---|---|
| **①** | 🔴 **Faille** | `finubar/macro.json` était **publiquement lisible** — Vercel sert tout fichier commité en statique, et `/finubar` n'était pas un préfixe privé. La feuille de route du business, en lecture libre, à côté d'une API soigneusement placée derrière `requireUser` | `/finubar` ajouté à `PREFIXES_PRIVES` **et** à `CHEMINS_ANTICHAMBRE` (le chemin exact reste public, tout ce qui vit dessous est 404). 12 verdicts dans `unit-adramelech-guard` |
| **②** | 🟠 Bug | Le rappel de séance **n'avait aucune borne** alors que le moteur borne à 400 : deux lecteurs du même grain, deux vérités. Un `cap` de 5 000 caractères inondait le contexte des huit dépôts | même borne, sur 9 champs. Éprouvé avec un `cap` de 5 000 caractères |
| **③** | 🟠 Carence | Le hook pouvait **faire échouer une ouverture de séance** si le répertoire courant n'était pas la racine du dépôt | `node "${CLAUDE_PROJECT_DIR:-.}/…" 2>/dev/null \|\| true` — éprouvé depuis `/tmp`, sans la variable, sans le fichier |
| **④** | 🟠 Bug | La date par défaut était **UTC** : toute collecte entre minuit et 2 h en France rendait la veille, et tous les « ouvert depuis N j » étaient faux d'un jour, silencieusement | date **locale**, comme `dateLocaleIso()` ailleurs dans Ultima |
| **⑤** | 🟠 Carence | Le mode d'emploi interdisait de corriger une copie du rappel — **rien ne le vérifiait**. Une règle que rien ne vérifie est un vœu | la collecte compare les 8 copies à leur source et nomme les divergentes et les absentes |
| **⑥** | 🟡 Faille | `depots.json` s'édite à la main : un `dossier` valant `../..` faisait sortir la collecte de l'arborescence | nom de dossier validé, entrée rejetée **et nommée** |
| **⑦** | 🟡 Bug | Une réponse d'API malformée (`cartouche` sans `signaux`) faisait lever `.length` et **emportait toute la page** — écran blanc, sans message | la forme est vérifiée, pas seulement la présence |
| **⑧** | 🔴 **Carence** | `api/finubar.js` était le **seul import de tout `api/` à sortir de l'arbre `api/`**. Les dix autres routes importent depuis `./_lib/`. Un motif non éprouvé passe la revue locale et rend **500 en production** — et aucun harnais local ne peut voir ce 500 | le module généré vit désormais dans `api/_lib/finubar-macro.mjs`, motif éprouvé du dépôt. Deux verdicts le verrouillent |
| **⑨** | 🟡 Carence | Rien ne garantissait que les deux formes de l'agrégat disent la même chose | verdict d'égalité, éprouvé rouge en éditant `macro.json` à la main |
| **⑩** | 🟢 Rendu | Un signal long renvoyait le nom du projet à la ligne, dans le bloc le plus lu de la page | repli du texte dans sa ligne |

**Ce que ce diagnostic dit de la méthode.** Les deux écarts rouges (① et ⑧) ont
la même forme : *un contrôle qui a l'air structurel et ne l'est qu'à une requête
près*. C'est exactement la leçon du 17/08 côté RénoDevis, où le prix d'achat du
catalogue était protégé par un écran et pas par la donnée. Un garde-fou se
vérifie du côté où il peut être contourné, pas du côté où il a été écrit.

## 8. Ce qui reste ouvert

- **La constellation** (F-3) — reporté, décidé, prêt côté moteur.
- **Le champ `en_attente_depuis` se tient à la main.** C'est le seul champ de
  priorité, et il n'est pas dérivable : personne n'écrit en machine le jour où
  un geste physique est devenu nécessaire. Il est daté à la main, une fois, et
  ne bouge plus tant que le geste n'est pas fait.
- **`ripair`** — le grain de ce dépôt pose une question à Paul plutôt qu'un
  état : dernier commit le 12/07/2026, le jour même de la décision « 2 logiciels,
  2 repos ». Archiver, ou nommer ce qu'il porte encore.
