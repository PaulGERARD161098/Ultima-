# Table de marche — boucler la semaine du 31/08 au 05/09/2026

> Compilée le **05/09/2026 vers 12:00 UTC** depuis les sources, jamais de mémoire :
> `list_sessions` (13 séances créées depuis lundi), les PR ouvertes des 8 dépôts,
> `git log origin/main --since=2026-08-31` et le diff réel de chaque branche
> vivante, et le bloc JSON de `FINUBAR.md` de chacun des 5 dépôts attachés.
> Les 3 dépôts hors périmètre initial (artisan-builder, Ycome, mon-dpe.fr) ont été
> attachés en lecture pour l'inventaire.
>
> **Ce fichier est une table de marche, pas une roadmap de plus** (règle Finubar :
> indexer, ne pas recopier). Les roadmaps détaillées restent où elles vivent —
> `RenoBoost/REPRISE-2026-09-03-boucles-ete.md`, `RenoDevis` PR #127,
> `RenoAgenda` PR #68, `Ycome/REPRISE-2026-09-03-ycome-backoffice.md`,
> `artisan-builder/AUDIT-2026-09-04.md`. Il dit **dans quel ordre on les ferme**.

---

## 0. La demande, reformulée (format 6 points)

Paul, le 05/09 : *« on a beaucoup de sessions de travail ouvertes sur ces mêmes
repos, peux-tu tout compiler pour qu'on avance dans une seule session étape par
étape et tout planifier ? On a fait beaucoup cette semaine et je ne veux rien
perdre et boucler tout ce qui a été lancé depuis lundi. »*

| | |
|---|---|
| **CONTEXTE** | 13 séances Claude Code ouvertes du 01/09 au 05/09 sur 8 dépôts ; travail éclaté, plusieurs grains FINUBAR divergents, des branches qui survivent à leur squash-merge. |
| **OBJECTIF** | Une seule session qui **ferme** ce que la semaine a ouvert : PR mergées ou tranchées, branches mortes supprimées, grains recalés sur les faits, et **la liste datée des gestes qui n'attendent que Paul**. |
| **ENTRÉES / SORTIES** | Entrées : l'inventaire §1. Sorties : ce fichier + les fusions/suppressions exécutées + 5 `FINUBAR.md` recalés + une liste de décisions à trancher en une fois. |
| **CONTRAINTES** | Gates Ultima : fusion dans `main` et migration SQL = GO explicite de Paul. Ne pas toucher à la branche d'une séance encore **RUNNING** (SPC). Aucune suppression de branche dont le contenu n'est pas prouvé sur `main` (diff = 0). |
| **GESTION D'ERREURS** | Un conflit de grain FINUBAR se résout par **concaténation** (règle du 30/07), jamais par arbitrage. Une preuve « en base » se rejoue avant d'être citée (leçon RenoDevis du 03/09). |
| **STYLE** | Une étape = un geste vérifiable + son critère de sortie + qui le fait. |

**Hypothèses prises (faute d'info, plutôt que de bloquer)** : « depuis lundi » =
depuis le **31/08** ; « boucler » = fermer ce qui peut l'être par Claude et
**nommer** ce qui ne peut l'être que par Paul — pas le faire à sa place.

---

## 1. Inventaire vérifié — 13 séances, ce qu'elles ont laissé

| # | Séance (créée) | Dépôt | Trace git vérifiée | État | Reste | Qui |
|---|---|---|---|---|---|---|
| 1 | Composant RenoBooster (01/09) | RenoAgenda | branche `reno-booster-component` **ahead = 0** | ✅ fermée | — | — |
| 2 | Back-office YCOME (02–03/09) | Ycome | PR #2 → #5 **mergées** ; `REPRISE-2026-09-03-ycome-backoffice.md` | ✅ code fermé | « contenant prêt, **base vide**, deux entrées automatiques éteintes » (message du #5 — la REPRISE n'a pas été lue ici) | Paul (alimenter) |
| 3 | Mail Matthieu du Crest — étude solaire (02/09) | RenoDevis | branche `matthieu-du-crest-solar-study` : **dépassée par main** (#121 a réécrit le cadrage) | ✅ contenu sur main | supprimer la branche | Claude |
| 4 | MAJ du matin RenoAgenda + Supabase (03/09) | RenoAgenda | PR #65 **mergée** (ENERGY_FACTS sept. + sonde) ; branche identique à main | ✅ fermée | supprimer la branche | Claude |
| 5 | Audit énergétique modélisé (03/09 → 05/09) | mon-dpe.fr · RenoDevis | mon-dpe.fr #195 #196 #197 **mergées** ; RenoDevis #122 #124 #126 **mergées** ; **PR #127 OUVERTE** (roadmap + procédure V0, CI verte, à jour sur main, doc seule) | ⏳ | merger #127 · puis **V0 : Paul calcule UN audit sur UN dossier réel** (0 audit au 03/09 11:41 UTC) · 3 arbitrages V-A1/A2/A3 · `AUDIT_PAC_API_SECRET` posé en prod (pre-mortem ② de la roadmap) | Claude puis Paul |
| 6 | Boucles ouvertes de l'été (03/09 → 05/09) | RenoBoost · RenoDevis · RenoAgenda | RenoBoost #344 #345 #347, RenoDevis #125, RenoAgenda #67 **mergées** ; **PR #349 OUVERTE** (RenoBoost, `FINUBAR.md` seul — mais **grain du 04–05/09, plus récent que main** : jeton du récap réparé, purge qui avait éteint la veille, mail unique éprouvé) ; branches RenoDevis/RenoAgenda identiques à main | ⏳ | **réconcilier** le grain #349 avec celui du radar (#346, mergé 11:48) puis fusionner · supprimer les 2 branches sœurs · les gestes A1 → E1 de `REPRISE-2026-09-03-boucles-ete.md` | Claude puis Paul |
| 7 | Lancer Ultima et Finubar le matin (03/09) | Ultima (+3) | Ultima #182 → #191 **mergées** ; branches `ultima-finubar-morning-launch` sur RenoDevis/RenoAgenda/RenoPredict = grain **plus ancien** que main (10:32 vs 13:xx) | ✅ fermée | supprimer les 3 branches | Claude |
| 8 | Site SPC — cadrage photos (03/09, **ENCORE RUNNING** à 11:47 le 05/09) | artisan-builder | **PR #15 OUVERTE**, 8 commits : inventaire 119 photos, outillage de préparation, audit 04/09 (3 fix sécu : PII hors logs, en-têtes, JSON-LD) | ⏳ **séance vivante** | ⛔ ne pas toucher à sa branche depuis ici. Bloqué par l'**egress** (photos Drive non rapatriables) + 3 décisions **R2/R3/R4** + la décennale de SPC | Paul (décisions) · sa séance |
| 9 | Simulateur de demandes pro → radar BTP (03/09 → 05/09) | RenoBoost | **#346 mergée par Paul le 05/09 à 11:48** (15 fichiers, 1006/1006 tests) | ✅ code fermé | GO migration `radar_releves.sql` (⛔ non appliquée) · jeton Google Ads Basic (Google) · CLIENT_ID/SECRET/REFRESH (`ACTIONS-PAUL.md` §5) · 6 codes NAF · liste des 8 intentions | Paul · Google |
| 10 | Plateforme RDV artisans — RénoRDV (03/09 → 04/09) | RenoAgenda | **PR #68 OUVERTE**, 16 commits, docs seuls (cadrage omnicanal + rapport pour Henri), CI verte, à jour | ⏳ | merger · envoyer le rapport à Henri · ses 5 questions | Claude puis Paul |
| 11 | Site redesign + stats clients — SATEP (03/09) | RenoBoost | **PR #348 OUVERTE**, 1 fichier (cadrage), « gate non levé, 3 bloqueurs Paul » | ⏳ | merger le cadrage · Paul lève les 3 bloqueurs (dans le cadrage) | Claude puis Paul |
| 12 | Agent LinkedIn — post nouvelle activité (04/09) | — | **aucune branche dans aucun des 8 dépôts** | ❓ | livrable texte hors git : le post est-il parti ? | Paul (confirmer) |
| 13 | Classification Fahrenheit → ADR-010 VESTA (05/09, cette séance) | Ultima | **PR #192 OUVERTE**, 2 commits, CI verte, à jour | ⏳ | acter le nom · merger · recaler le grain | Paul puis Claude |

**Branches mortes en plus** (diff vs main = 0 sur leurs fichiers, vérifié) :
RenoDevis `quote-creation-tool`, `stripe-solar-group-integration` ·
RenoAgenda `inventaire-notes-cadrage`, `quote-creation-tool` ·
RenoPredict `quote-creation-tool`.

**Hors semaine, signalé pour ne pas l'oublier** : mon-dpe.fr porte **14 PR
ouvertes** de juin à août (dependabot + 4 drafts Claude). Aucune n'est de cette
semaine ; à trier dans une boucle propre, pas ici.

### Les gestes qui n'attendent que Paul (consolidés depuis les 5 grains)

| Depuis | Geste | Ce qu'il débloque | Où |
|---|---|---|---|
| 04/08 | Valider la fiche **Google Business** | le cron d'avis J+7 (RenoPredict) | panneau Google |
| 11/08 | Générer + **imprimer un lot de stickers QR** | **Foresight entier** — la seule chose qui remplit le système tout seul | RenoPredict `/Stickers` |
| 17/08 | **Stripe en Live** + KYC de SOLA | le premier euro (RenoDevis jalon 1) | Stripe |
| 20/08 | Poser `ANTHROPIC_API_KEY` (+ `LEO_MODELE`) en Production Vercel Ultima | la voix de Léo sur les 22 pages (503 aujourd'hui) | Vercel |
| 03/09 | `supabase functions deploy verifier-siret` puis relire le déployé | la vérification d'entreprise (RenoAgenda) | CLI Supabase |
| 03/09 | **V0** — calculer UN audit PAC sur UN dossier réel (procédure PR #127 §7) | V1, V2, D4 | RenoDevis prod |
| 01/09 | Le **logo SOLA** + **un devis SOLA réel** (le gainable) | identité du devis · catalogue consommables | fichiers |
| 03/09 | Le jeton **Google Ads** Basic | R-3 → R-5 du radar | attente Google |

### Les décisions à trancher — en une fois, pas une par séance

MKT-A4 (qui est partie au contrat d'entretien — *la fenêtre se referme*) ·
migration des données RenoPredict (posée le **12/07**, jamais tranchée) ·
V-A1 / V-A2 / V-A3 (audit en visite) · R2 / R3 / R4 (SPC : auth des endpoints
LLM, secours si un lead se perd, hébergement des sites exportés) · les 3
bloqueurs SATEP (#348) · GO migration `radar_releves` · le nom **VESTA** · le
rôle exact de **Fahrenheit**.

---

## 2. Les trois POV — avant d'exécuter

**🗡️ L'adversaire** — *« Ce plan ferme des PR, pas des boucles. »* Merger quatre
cadrages ne livre rien à personne. Les quatre jalons produit sont **à zéro**
depuis août — stickers, Google Business, Stripe — et rien dans une session
Claude ne les fera bouger. Le risque est de confondre **propreté git et
avancement**, et de sortir de la session content avec le même business qu'en
entrant. → *Objection à tenir : la propreté est le préalable, pas le but ; le
livrable qui compte est le tableau des gestes Paul, daté, et la première chose
faite APRÈS cette session.*

**🔧 Le mainteneur futur** — *« Cinq squash-merges d'affilée = cinq grains à
recaler, et un grain réconcilié à la main est la première source d'erreur. »*
`dernier_arret.commit` a déjà été faux deux fois cette semaine (32a816b sur
Ultima, e1d8a01 sur RenoBoost). Qui garantit que les cinq seront justes ? →
*Mitigation : un seul geste, toujours le même, après chaque squash — lire le
SHA de main, l'écrire, pousser ; et `node finubar/collecter.mjs` en fin de
session comme juge de paix.*

**🧭 Le mentor (JL)** — *« Rattache chaque étape à l'objectif final, sinon tu
ranges. »* Quel est le chemin critique vers **le premier euro** ? Stripe Live +
un devis SOLA réel + V0. Tout le reste est de la maintenance. → *Conséquence :
l'ordre des gestes Paul (§3, étape 6) suit ce chemin critique, pas
l'ancienneté des boucles.*

⏳ Paul arbitre lesquels creuser. Sans arbitrage, le plan applique les trois
mitigations telles qu'écrites.

---

## 3. La table de marche

Chaque étape : geste · critère de sortie · qui · gate.

| Étape | Geste | Critère de sortie | Qui | Gate |
|---|---|---|---|---|
| **0** | Ce fichier commité sur la branche de la séance, `FINUBAR.md` d'Ultima le pointe | le plan survit à la session | Claude | — |
| **1 · Nettoyage sans perte** | Supprimer les **12 branches** dont le contenu est prouvé sur main (§1) : RenoDevis ×5 (`matthieu-du-crest…`, `boucles-ouvertes…`, `quote-creation…`, `stripe-solar…`, `ultima-finubar…`), RenoAgenda ×5 (`boucles-ouvertes…`, `inventaire-notes…`, `maj-matin…`, `quote-creation…`, `ultima-finubar…`), RenoPredict ×2 (`quote-creation…`, `ultima-finubar…`) — 9 « identiques à main » + 3 « dépassées par main » | `git branch -r` ne montre plus que main + les branches des PR ouvertes | Claude | **GO Paul** (suppression) |
| **2 · Fusions doc-only, CI verte** | Merger **#127** (RenoDevis), **#68** (RenoAgenda), **#348** (RenoBoost), **#192** (Ultima, après le nom acté ou en « nom proposé ») — puis **recaler le grain** de chaque dépôt sur le SHA du squash | 4 PR fermées, 4 grains justes (`git cat-file` trouve le commit) | Claude | **GO Paul** (fusion) |
| **3 · Le grain de RenoBoost** | Fusionner `main` (post-#346) dans la branche de **#349**, **concaténer** les deux grains (radar 04/09 + contrôle 05/09) en un seul, fusionner, recaler | un seul `FINUBAR.md` qui porte les deux séances, aucune ligne perdue | Claude | **GO Paul** (fusion) |
| **4 · La base dit vrai** | Rejouer en SELECT ce que les docs affirment : `stickers` = 0 ? audits PAC calculés = 0 ? les 6 policies RLS de RenoAgenda lisent-elles encore `auth.users` ? battements sentinelle < 26 h ? — et **corriger les grains** si la base contredit | chaque « constaté en base » du plan porte sa requête rejouée le 05/09 | Claude | — (lecture seule) |
| **5 · SPC** | Ne rien faire sur #15 tant que sa séance est RUNNING ; la fermer **dans sa séance** quand elle passe idle (le grain artisan-builder a été recalé à 11:47, elle est en bonne voie) | #15 mergée ou explicitement mise en attente d'egress | sa séance | — |
| **6 · Les gestes Paul, dans l'ordre du chemin critique** | ① Stripe Live + KYC SOLA → ② un devis SOLA réel + le logo → ③ V0 (un audit réel) → ④ stickers → ⑤ Google Business → ⑥ clé Vercel Ultima → ⑦ deploy `verifier-siret` | chaque geste daté dans le grain du dépôt concerné, avec son lien | **Paul** | — |
| **7 · Les décisions, en une fois** | Trancher la liste de §1 « décisions » en une seule réponse ; Claude les grave dans les cadrages concernés | 0 arbitrage « en attente depuis » dans les 5 grains | **Paul** | — |
| **8 · Clôture** | `node finubar/collecter.mjs` (Ultima) ; 5 grains recalés ; fiche Notion ; prompt de reprise ci-dessous rafraîchi | la collecte n'annonce **aucune dérive** | Claude | — |

**Critère de sortie global** : 0 PR ouverte née cette semaine (hors #15 si sa
séance vit encore) · 0 branche morte · 5 grains recalés sur `main` · chaque
geste Paul daté avec son lien · les décisions posées en un seul bloc.

---

## 4. Pre-mortem — on est le 05/12/2026, la semaine n'a jamais été bouclée

| Risque | Cause probable | Signal précoce | P × I | Mitigation | Reco |
|---|---|---|---|---|---|
| **① Les fusions ont été faites, les gestes Paul jamais** | le plan a été lu comme une liste de PR ; le tableau des gestes Paul est resté un tableau | à J+7, `stickers` vaut encore 0 et Stripe est en Test | **Élevé × Élevé** | l'étape 6 est **la première chose** du prochain début de session — le rappel Finubar la porte en `prochaine_action` de RenoPredict et RenoDevis | mettre le premier geste (Stripe Live) en `prochaine_action` de RenoDevis dès l'étape 2 |
| **② Un grain faux après un squash** | recalage oublié ou fait avant le squash | `node finubar/collecter.mjs` annonce « a avancé de N commits » | Moyen × Moyen | un geste, toujours le même, après **chaque** fusion ; collecte en clôture | ne pas enchaîner deux fusions sans recaler entre les deux |
| **③ La suppression d'une branche a perdu du travail** | un diff « identique » lu sur les mauvais fichiers | quelqu'un cherche un fichier « qui était sur la branche » | Faible × Élevé | le diff est **deux-points, restreint aux fichiers de la branche**, déjà exécuté (§1) ; refaire le contrôle juste avant chaque `push --delete` | supprimer en dernier, jamais en premier |
| **④ Le grain RenoBoost réconcilié perd une séance** | on a « choisi » entre le grain radar et le grain contrôle | une boucle ouverte du 04/09 disparaît | Moyen × Élevé | **concaténation**, jamais arbitrage ; relecture des deux `boucles_ouvertes` côte à côte | faire l'étape 3 **seule**, pas en lot avec l'étape 2 |
| **⑤ Deux séances écrivent sur le même dépôt en même temps** | SPC (RUNNING) ou le radar encore ouvert ailleurs | un push rejeté, ou une PR qui apparaît pendant l'étape 2 | Moyen × Moyen | vérifier `list_sessions` avant chaque fusion ; ne toucher qu'aux dépôts sans séance RUNNING | RenoBoost : refaire `git fetch` juste avant l'étape 3 — #346 vient d'être mergé « pendant » l'inventaire, ça peut se reproduire |
| **⑥ Transverse — les décisions ne sont jamais tranchées en bloc** | posées une par une, elles repartent en « en attente depuis » | la liste §1 « décisions » est identique dans trois semaines | Élevé × Moyen | une seule question, un seul message, avec la reco à côté de chaque item | poser le bloc **en fin de session**, quand tout le reste est propre |

---

## 5. Prompt de reprise

> **Objectif final** : les 4 briques tournent toutes seules et Paul contrôle
> (Directive IA) ; **premier euro** = Stripe Live + un devis SOLA réel + V0.
> **Cette table** : `Ultima-/PLAN-2026-09-05-boucler-la-semaine.md`.
> **Prochaine étape** : celle qui n'est pas cochée dans §3, dans l'ordre.
> **Avant tout geste** : `list_sessions` (séances RUNNING ?) et `git fetch`
> sur le dépôt visé — main a bougé pendant l'inventaire, ça se reproduira.
> **Ce qui attend Paul** : §1, deux tableaux. **Ne pas redemander** ce qui y est
> déjà tranché.
