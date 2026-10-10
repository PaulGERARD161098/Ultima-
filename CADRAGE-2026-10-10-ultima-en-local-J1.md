# CADRAGE — Ultima en local, jalon J1 (10/10/2026)

> **Objectif final, posé par Paul le 10/10** : *« faire vivre Léo et Finubar en
> local, dans mes machines, pour ne pas dépendre de personne »*.
> Arbitrages du même jour : intelligence = **Claude par défaut + modèle local en
> secours** · données = **locales + copie chiffrée hors site** · machines = PC
> Windows actuel, puis une machine dédiée (choix Mac mini / mini-PC **après J1**,
> sur mesures), et le téléphone par accès privé.

## Rétroplanning (l'achat en dernier, ce qui dé-risque d'abord)

| Jalon | Contenu | Gate |
|---|---|---|
| **J1** | Ultima tourne sur le PC de Paul, **Vercel coupé** | aucun (zéro dépense) |
| J2 | Secours de l'intelligence : un point d'appel unique, modèle local si Claude ne répond pas | — |
| J3 | Données rapatriées : Supabase → Postgres local + sauvegarde chiffrée hors site | ⛔ données métier / RLS / auth |
| J4 | Machine dédiée 24/7 + accès privé téléphone | ⛔ dépense |
| J5 | Hôte LV1/R21 installé (cgroup + identité distincte, cf. `leo/ACTIVATION.md`) | ⛔ contrat LV1 |

Ce fichier ne cadre **que J1**. Les suivants auront chacun le leur.

## État mesuré au moment du cadrage (lu dans le code, 10/10)

- `package.json` : deux dépendances seulement (`@anthropic-ai/sdk`, `@supabase/supabase-js`), Node ≥ 22.
- `api/` : 30 entrées, toutes au format `handler(req, res)` Node — rien de propre à Vercel dans les routes.
- Ce qui EST propre à Vercel et doit être reproduit : `middleware.js` (en-têtes de sécurité, CSP, rate-limit 60/min) · `vercel.json` (12 redirections, `cleanUrls`, cron `/api/finubar-matin`).
- Le harnais actuel (`tests/lancer.sh`) sert le **statique seul** (`python3 -m http.server`) : il n'existe pas encore de serveur local qui porte les API.
- Finubar sait déjà mesurer sans GitHub : `finubar/mesure-git.mjs`, réseau GitHub en opt-in (`--github`).
- Léo : `api/leo.js`, Opus 4.8, cache de prompt, **pas de streaming**.
- L'hôte LV1 (`finubar/leo_process.py`) est **propre à Linux** — hors J1, il concerne J5.

## ① Le but — ce qui sera vrai à la fin de J1

Sur le PC Windows de Paul, une commande lance Ultima. Paul ouvre `http://localhost:<port>`,
se connecte, **parle à Léo** et voit **Finubar** avec ses dix dépôts mesurés **depuis les
clones locaux**, sans qu'aucune requête ne passe par Vercel.

## ② Les étapes

1. **Serveur local** `outils/local/serveur.mjs` (Node natif, zéro dépendance) :
   statique + routage `api/**` vers les handlers existants + `cleanUrls` + les 12
   redirections **lues depuis `vercel.json`** (jamais recopiées).
2. **Middleware rejoué** : le serveur appelle `middleware.js` tel quel (en-têtes, CSP,
   rate-limit) — une seule source, pas de seconde CSP.
3. **Environnement** : `.env.local` lu au démarrage (non versionné, déjà couvert par
   `.gitignore` à vérifier), variables documentées sans valeur.
4. **Finubar local** : collecte sur les clones de Paul (`mesure-git.mjs`), cron du matin
   remplacé par une tâche planifiée Windows documentée (pas de démon maison).
5. **Streaming de Léo** (cadrage du 10/10, repris ici) : opt-in, contrat JSON inchangé
   sans en-tête ; la proposition d'outil n'est émise qu'à la fin, validée serveur.
6. **Guide d'installation** Windows en une page, éprouvé pas à pas.

## ③ Les moyens

Fichiers neufs : `outils/local/serveur.mjs`, son test, le guide. Modifiés : `api/leo.js`,
`js/leo-accueil.js` (étape 5), `.gitignore` si besoin. Aucune dépendance ajoutée.

**Ligne ZS** — alternative de l'année considérée : `vercel dev` (émulation officielle).
**Écartée** : elle exige la CLI Vercel et une session Vercel, c'est-à-dire la dépendance
qu'on veut couper. Le serveur Node natif est le plus simple (aucun paquet), le plus rapide
à poser (les handlers sont déjà au format Node), gratuit. Verdict : ✅ sur les quatre.

## ④ Critères de réussite (vérifiables)

- Toutes les pages HTML servies en 200, les 12 redirections rendent leur 308, une route
  inconnue rend 404 — test automatisé.
- Les en-têtes de `middleware.js` (CSP comprise) sont présents en local — **éprouvé en
  cassant** : middleware débranché → test rouge.
- Les harnais existants passent contre le serveur local (`npm test`, `bash tests/lancer.sh`).
- `/api/leo` sans session → 401, comme en production (la garde passe avant tout appel IA).
- Mesure de dépendance : pendant une séance d'usage, **0 requête vers `*.vercel.app`**.
- Streaming : premier mot affiché < 1 s, mesuré avant/après.

## ⑤ Ce qu'on ne fait PAS dans J1

Rapatrier les données (Supabase reste la base et l'authentification jusqu'à J3) ·
modèle local (J2) · achat de machine, accès téléphone (J4) · installation LV1 (J5) ·
désactiver le déploiement Vercel (il reste le filet tant que J3 n'est pas fait).

## ⑥ Pre-mortem — « J1 a échoué : pourquoi ? »

| Cause | Signal précoce | Prévention |
|---|---|---|
| Le serveur local diverge de Vercel (redirections, en-têtes) | une page marche en local, casse en prod | redirections et middleware **lus** depuis leurs fichiers, jamais recopiés ; test qui compare |
| Un handler dépend d'un comportement Vercel implicite (`req.body` pré-parsé, `res.status().json()`) | 500 sur une route au premier appel | balayage des 30 entrées par le test ; aide `req`/`res` minimale documentée |
| Secret committé en passant à `.env.local` | `git status` montre le fichier | `.gitignore` vérifié **avant** de créer le fichier ; secret-scan avant push |
| Le serveur écoute sur le réseau, pas seulement sur la machine | accessible depuis un autre appareil du Wi-Fi | écoute sur `127.0.0.1` par défaut, test qui le vérifie |
| Windows : chemins, fins de ligne, `git` absent | Finubar vide | guide éprouvé pas à pas ; Finubar signale un dépôt non mesuré au lieu de se taire |
| Le streaming fait passer une proposition non validée | carte affichée sans validation serveur | proposition émise uniquement à la fin, après `validerProposition` ; test |

## Ce qui reste à Paul pour J1

Rien d'autre que d'exécuter le guide sur son PC et de dire ce qu'il voit. Node 22 et Git
pour Windows sont les seuls prérequis — le guide le vérifie en première étape.
