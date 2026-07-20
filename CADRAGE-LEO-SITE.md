# CADRAGE-LEO-SITE — Léo dans le site (l'agent actif d'Ultima)

> Vision dictée par Paul le 2026-07-18. Même méthode que les autres boucles :
> **cadrer avant tout code**. Ce document borne ce qu'est « Léo dans le site »,
> ce qu'il faut construire pour qu'elle soit « la plus étendue, puissante,
> pertinente, intéressante possible » (mots de Paul), et dans quel ordre.
> Il complète `CADRAGE-CONSOLE.md` §6 (Léo pilote) sans le re-décider.

## 1. Vision (Paul, 2026-07-18 — reformulée et validée au fil)

- **Un agent ACTIF, force de proposition, à l'initiative** — pas un chatbot
  passif qui attend une question.
- **Rien sur la page d'accueil** : la console (4 quadrants) reste muette.
- **Au moment où Paul entre dans un quadrant** : un **pop-up d'accueil de Léo**
  qui récapitule **où on en est** et **les travaux en cours** s'il y en a.
  - **TRAVELER et BALTHAZAR GELD** : registre **opérationnel** — relances qui dorment,
    leads chauds, échéances fiscales, chantiers en cours. C'est là que le
    récapitulatif a le plus de valeur immédiate.
  - **ADRAMELECH et IMLADRIK** : registre **réflexif** (quadrants personnels) —
    idées à raffiner, bilan de l'archipel, rappels de valeurs et d'objectifs.
- **L'initiative reste COHÉRENTE** avec le projet et les objectifs du quadrant
  où l'on est : Léo ne propose pas n'importe quoi n'importe où.
- **État d'esprit : conversationnel, type Jarvis (Iron Man)** — un majordome
  d'ingénieur : précis, complice, jamais obséquieux, toujours au service du
  cap. **Et qui s'adapte et apprend au fur et à mesure.**
- **Léo AGIT sur dictée (complément Paul, 2026-07-18)** : parler à Léo dans
  Ultima **fait avancer le travail** — une idée dictée entre au registre, une
  relance se planifie, un besoin de chantier s'ajoute, le journal s'écrit.
  **Elle tourne sur Claude** (le moteur) : pas un simple chatbot, un agent
  outillé. Le geste cible : *ouvrir Ultima → parler → c'est fait*.
- **Différé (à cadrer plus tard, décision Paul)** : la présence visuelle de
  Léo (cartouche, signature, incarnation graphique) et le détail de son
  fonctionnement étendu.

## 2. Ce que « Jarvis » exige — l'architecture nécessaire

Pour être étendue/puissante/pertinente, Léo-au-site a besoin de **quatre
étages**, chacun inutile sans le précédent :

1. **L'identité (préalable absolu)** — le **compte auth de Paul** en base
   (aujourd'hui : 0 user). Sans session authentifiée, aucune donnée
   personnelle ne peut nourrir le pop-up (RLS mono-owner partout). C'est LE
   bloquant n°1, déjà consigné aux boucles AD-4/AD-5. → **action Paul**.
2. **Le contexte (les yeux de Léo)** — le pop-up est nourri par les **données
   réelles** du quadrant via les API `requireUser` existantes et à venir :
   - TRAVELER : journal « où j'en suis », relances dues, leads, relations.
   - BALTHAZAR GELD : échéancier fiscal, charges/revenus du mois (quand le quadrant
     existera).
   - ADRAMELECH : `/api/idees` (statuts, bilan de l'archipel, top 3 stratégique).
   - IMLADRIK : objectifs, journal, quart d'heure du jour (quand il existera).
3. **La voix (le conversationnel)** — un **service IA côté serveur** :
   route API Vercel → **API Claude** (« elle tourne sur Claude », Paul),
   **clé en env Vercel uniquement** (jamais côté client), erreurs génériques
   client, timeout sortant, aucune PII en logs. **Création de clé /
   facturation = action payante → GATE Paul.**
   **3bis. Les mains (l'action sur dictée)** — le même appel Claude reçoit des
   **outils** (tool use) qui sont les **API existantes du site** : créer/
   enrichir une idée, ajouter un besoin INTENDANT, écrire au journal, planifier
   une relance. Règles non négociables : (a) chaque outil exécute **avec la
   session authentifiée de Paul** (son JWT → RLS ; jamais de clé service pour
   agir) ; (b) **reformulation avant action** — Léo répète ce qu'elle a compris
   de la dictée et l'action s'exécute sur confirmation (protocole vocal, comme
   en session) ; les lectures et brouillons sont libres, **toute écriture est
   confirmée, toute suppression est doublement confirmée** ; (c) Léo-au-site
   agit sur les **données** des quadrants, pas sur le code d'Ultima (le dev
   reste à Léo-en-session).
4. **La mémoire (l'apprentissage)** — une **mémoire de Léo en base** (table
   `leo_memoire`, RLS mono-owner, migration → gate) : préférences apprises
   (ce que Paul valide/refuse/reformule), décisions actées, résumé du dernier
   passage par quadrant. C'est elle qui fait que Léo « s'adapte et apprend »
   — et qu'à chaque retour, le pop-up sait où on en est.

**Principe moteur (règle d'or de la proactivité)** : les suggestions naissent
de **règles déterministes sur les données** (relance qui dort > N jours,
manquant à J-2, bilan mensuel d'idées, échéance fiscale qui approche), et
l'IA **formule, priorise et converse** par-dessus. Jamais d'initiative
« hallucinée » sans donnée qui la fonde — c'est la cohérence exigée par Paul.

## 3. Sécurité (surface maximale — les 4 quadrants réunis)

Le pop-up touche à terme PII réseau + finance + intime (§5 CADRAGE-CONSOLE) :
- Tout endpoint Léo = `requireUser` + RLS ; **fail-closed** (pas de session →
  pas de pop-up, jamais de dégradé anonyme).
- Les données envoyées au service IA sont **minimisées** (le nécessaire du
  quadrant courant, jamais un dump) ; IDs plutôt que noms quand possible.
- Clé API serveur seulement ; quota/coût plafonné ; timeout sortant ;
  aucune PII/finance/intime en logs.
- Toute brique (migration mémoire, route IA) = **gate + escalade Opus** +
  contre-passe `securite-auditeur`.

## 4. Découpage en boucles (une à la fois, directive EB)

- **L0 — le compte auth de Paul ✅ DÉJÀ FAIT (constaté 2026-07-18)** : le
  compte `pag.gerard@gmail.com` existe depuis le 2026-07-09 (e-mail confirmé,
  dernière connexion 2026-07-17) — le registre le croyait absent. Conséquence
  immédiate : **seed des 4 idées appliqué** dans la foulée. La voie est libre
  pour L1.
- **L1 — le pop-up « majordome » SANS IA ✅ LIVRÉ ET DIFFUSÉ (2026-07-18)** :
  pilote TRAVELER fusionné (PR #52) puis **diffusion aux 4 quadrants** sur
  ordre de Paul (PR #55) : module `js/leo-accueil.js` généralisé
  (`accueillirQuadrant`), antichambre ADRAMELECH derrière auth (registre
  d'idées via /api/idees, cartouche réflexif, fail-closed prouvé), BALTHAZAR GELD/IMLADRIK
  en majordome de chantier, console à 4 portes actives. Middleware : allowlist
  du chemin exact `/adramelech` — **contre-passe securite-auditeur GO** (29
  attaques, zéro contournement) + réserves figées au harnais (2026-07-19).
  Harnais 20/20 verts.
- **L2 — la voix (Jarvis conversationnel) ✅ FUSIONNÉE (2026-07-20, PR #60,
  rebase de réconciliation + squash `1fbd00f`), gate clé restante** :
  route `POST /api/leo` (requireUser fail-closed → API
  Claude, clé `ANTHROPIC_API_KEY` en env Vercel uniquement, timeout 30 s,
  max_tokens 1024, historique borné 30×4000, prompt système Jarvis par
  quadrant SANS donnée personnelle, modèle serveur seulement — `LEO_MODELE`
  en env pour en changer) + zone « Parler à Léo » dans le cartouche
  (TRAVELER et ADRAMELECH, session réelle uniquement ; 503 = « voix pas
  encore branchée », la zone se retire proprement). Briques pures dans
  `api/_lib/leo.js`, harnais `unit-leo-voix.mjs` + smoke section C (API
  stubée : contrat Bearer/historique, gate, panne). **GATE coût** : la voix
  ne parle qu'une fois la clé posée par Paul en env Vercel (+ plafond de
  dépense côté console Anthropic). Antichambres BALTHAZAR GELD/IMLADRIK :
  muettes tant qu'elles n'ont pas d'auth (fail-closed voulu).
- **L2b — les mains (agir sur dictée) ✅ LIVRÉE ET FUSIONNÉE (2026-07-20,
  PR #61, go Paul)** : tool use sur `/api/leo` → l'IA ne fait que PROPOSER
  (proposition validée fail-closed + reformulation déterministe serveur) ;
  carte de confirmation qui NOMME la cible résolue ; Confirmer → le front
  exécute via les API existantes (Bearer session, RLS mono-owner) ; aucun
  outil de suppression. Spec `design/spec-l2b-mains.md`. Contre-passe
  securite-auditeur GO (S-L2b-1/2/3 fermés avec tests, S-L2b-4 info en
  vivier) ; ré-audit S-L2-2 : résiduel clos. Cadrage d'origine : tool use
  branché sur les API du site (idées, INTENDANT, journal, relances),
  session de Paul uniquement,
  reformulation + confirmation avant toute écriture. C'est la marche qui
  transforme le majordome en **agent qui fait avancer le travail**.
- **L3 — la mémoire apprenante** : table `leo_memoire` (gate migration),
  boucle d'apprentissage (valide/refuse → préférences), résumé par quadrant
  re-servi au retour. C'est L3 qui fait de L1+L2 un vrai Jarvis.
- **Différé** : présence visuelle de Léo, fonctionnement étendu (voix parlée,
  commande vocale in-app, notifications) — cadrage ultérieur sur go Paul.

## 5. Décisions actées / en attente

**Actées (Paul, 2026-07-18)** : agent actif à l'initiative ; rien sur
l'accueil ; pop-up récapitulatif à l'entrée de chaque quadrant ; opérationnel
sur TRAVELER/BALTHAZAR GELD, réflexif sur ADRAMELECH/IMLADRIK ; cohérence quadrant ;
ton Jarvis ; adaptation/apprentissage ; **Léo agit sur dictée** (« ouvrir
Ultima, parler à Léo, ça fait avancer les choses ») et **tourne sur Claude** ;
visuel + fonctionnement différés.

**⏳ En attente (registre Actions humaines)** :
1. ~~Compte auth de Paul (L0)~~ ✅ existait déjà (constaté 2026-07-18).
2. **Gate coût IA** (L2) — la route est construite ; il reste à Paul :
   créer une clé API Claude (console.anthropic.com), poser un **plafond de
   dépense mensuel** dans la console, puis saisir la clé en env Vercel
   `ANTHROPIC_API_KEY` (jamais dans le repo). Optionnel : `LEO_MODELE` pour
   choisir le modèle (défaut serveur : Opus — qualité Jarvis ; un modèle
   plus économe se règle sans toucher au code).
3. ~~Périmètre du pilote L1~~ ✅ tranché (TRAVELER) puis diffusé aux 4.
