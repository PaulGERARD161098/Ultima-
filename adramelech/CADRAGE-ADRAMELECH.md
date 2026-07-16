# CADRAGE-ADRAMELECH — mini-cadrage du quadrant « bibliothèque d'idées »

> Source de vérité de la boucle ADRAMELECH (quadrant C2+ de la console, cadrage
> plateforme : `CADRAGE-CONSOLE.md` §3.3, §5–§8). Écrit en **cadrage pur**
> (directive EB : cadrer avant de coder, une boucle à la fois). Ne re-décide
> rien de déjà acté ailleurs — il **borne** ce qu'on construit et dans quel
> ordre.

## 1. Cap (rappel, déjà acté)

Ne **jamais rater une idée**. Capturer (surtout à la voix), puis **classer par
thème**, **rapprocher** des idées déjà là, **enrichir** vers l'exécutable,
**trier** (pro / perso / business / les deux), chercher la **cohérence avec le
reste d'Ultima**. À l'échelle : l'agent `agent-idees` fait des **regroupements
automatiques par thème** (archipels cohérents), du **tri pertinent, pas de la
donnée brute**, et des **ponts entre idées** — zéro perte (vision Paul
2026-07-16).

## 2. Acquis de la boucle en cours (on part de là, rien à refaire)

- **`adramelech/IDEES.md`** — registre structuré, source de vérité des idées
  (ID `ADR-###`, nom, reformulation, enrichissement, **Thème**, liens
  inter-segments, statut). 4 idées capturées : GLANEUR, PROTÉE, INTENDANT,
  MYCÉLIUM. Le champ **Thème** est l'axe de regroupement de départ.
- **`adramelech/carto-idees.html`** — carte des idées (archipel gravé,
  registre antique, thèmes clair/sombre, zéro JS/asset externe). Socle visuel
  qui grandira ; elle est aujourd'hui écrite à la main.
- **Blason du quadrant** : le **dragon** (gardien du trésor d'idées).

## 3. Périmètre v1 — ✅ VALIDÉ PAR PAUL (2026-07-16 : « je valide tout »)

**v1 = « la bibliothèque vivante, sans base »** — maximiser l'existant, zéro
gate, zéro coût, immédiatement constructible :

1. **Le registre reste la source** (`IDEES.md`), enrichi à la voix via Léo — le
   flux de capture existe déjà (Léo reformule, dépose l'idée nommée + thème).
2. **La carto se génère depuis le registre** au lieu d'être écrite à la main :
   un petit générateur déterministe (build statique, zéro runtime) lit les
   idées + leurs thèmes et **dessine les archipels par thème** — c'est le
   premier vrai regroupement automatique. Rien à perdre : toute idée du
   registre apparaît.
3. **`agent-idees` (sous-agent de Léo)** propose, à la demande : regroupements
   thématiques, rapprochements pertinents (ponts), et le **bilan** (combien ce
   mois, X inexploitables / X à raffiner / X réutilisables). Léo synthétise ;
   Paul valide les rapprochements avant qu'ils entrent au registre.
4. **Dashboard statique** : le bilan rendu dans la page (compteurs par statut /
   par thème), au même registre visuel.

**Hors v1 (boucle suivante, derrière gate)** : édition interactive en base
(table `idees` dans le projet Supabase `ultima` existant, RLS mono-user,
CRUD, recherche plein-texte, rapprochements sémantiques persistés). Passer en
base = **gate Paul** (migration + sécurité relevée, §5) — pas nécessaire pour
prouver la valeur du quadrant, donc reporté.

## 4. Sécurité — ✅ VALIDÉE PAR PAUL, traitée EN PREMIER (« on sécurise la data »)

Le contenu `adramelech/` (idées = **données personnelles**, §5 sécurité
relevée) est aujourd'hui servi **en statique sans authentification** par
Vercel. **Décision Paul : on sécurise la data d'abord, avant de construire.**
- **Principe retenu** : `/adramelech/*` n'est **jamais** servi à une requête
  non authentifiée. En v1 sans base, la carto se consulte en **artifact privé**
  (Claude, réservé à Paul) et en rendu local ; **rien de personnel n'est publié
  sur le site public**. Elle recevra un rendu servi et gaté quand la console C1
  (coque authentifiée) existera.
- **Correctif exact** : établi par `securite-auditeur` (diagnostic en cours,
  2026-07-16) — comment `adramelech/*` est réellement exposé (routes,
  `.md` bruts, `cleanUrls`), suffisance ou non de l'auth Vercel de prod, et
  garde minimal (piste : blocage `/adramelech/*` au middleware edge). Le patch
  reste au fil principal (surface à risque → escalade Opus + contre-passe
  `securite-auditeur` + `verificateur`).
- **En attendant le patch** : carto `noindex`, URL prod non diffusée, aucune
  idée confidentielle ajoutée. → devient la sous-boucle **AD-0** (ci-dessous),
  faite AVANT AD-1.

## 5. Découpage en sous-boucles (une à la fois, chacune bouclée)

Ordre validé par Paul : **AD-0 (sécuriser) → AD-1 → AD-2**, puis AD-4 si go.

### AD-0 — sécuriser l'exposition (EN PREMIER, ✅ go Paul « on sécurise la data »)
Le diagnostic `securite-auditeur` (2026-07-16) a révélé une fuite **plus large
qu'`adramelech/`** : Vercel sert tout fichier commité en statique et `cleanUrls`
ne retire que `.html` → `/adramelech/IDEES.md`, `/memoire/PROFIL-PAUL.md` (PII de
Paul) et toute la doc `.md` interne étaient **publics**. Le `noindex` ne protège
rien ; l'auth Vercel ne suffit pas (mauvais périmètre, hors repo, non testable) ;
le middleware ne peut pas authentifier le front (session en localStorage). Donc
le seul contrôle fiable ici = **refus**. Portée d'AD-0 élargie en conséquence :
1. **Garde middleware** `estCheminPrive` : 404 générique sur `/adramelech/*`,
   `/memoire/*` et tout `*.md`, avant rate-limit/pass-through, normalisation
   défensive (décodage répété, casse, slash final ; malformé → refus).
2. **`.vercelignore`** (défense en profondeur) : ces fichiers ne sont pas
   déployés du tout — même si le garde tombait, rien de privé sur le CDN.
3. **Test de fermeture** `tests/unit-adramelech-guard.mjs` (privés → 404 sans
   contenu ; publics `index/css/js/icons/design/manifest/api` → pass-through)
   + intégré à `tests/lancer.sh`.
4. **Contre-passe** `securite-auditeur` (tentative de contournement) +
   `verificateur`.
Effet de bord assumé (stopgap) : `/adramelech/*` devient inaccessible **aussi à
Paul** — il consulte la carto par l'artifact privé en v1. Correctif durable =
servir les idées via une API `requireUser` + RLS (AD-4, gate).
Commit `fix(sec): données perso + docs hors surface publique [AD-0]`.
⏳ Action humaine consignée : confirmer par `curl` sur le domaine de prod que le
404 est bien rendu (le middleware n'a été exercé qu'en unitaire).

### AD-1 — générateur de carto depuis le registre (le cœur constructible)
Remplacer la carte écrite à la main par un **rendu déterministe** depuis
`IDEES.md`, groupé par thème. Étapes cadrées :
1. **Contrat de données** : figer le format d'une idée lue depuis `IDEES.md`
   (ID, nom, thème(s), statut, partenaire, liens) — le **Thème** est la clé de
   regroupement. Source unique : `IDEES.md` (aucune duplication de données).
2. **Parseur déterministe** (Node pur, dans `tests/` ou petit script de build,
   zéro dépendance runtime) : `IDEES.md` → structure de données. Tolérant aux
   variations de rédaction, mais échoue bruyamment si une idée est mal formée
   (jamais d'idée silencieusement perdue).
3. **Générateur de carto** : structure → SVG/HTML au **registre antique
   existant réutilisé** (on ne refait pas le style ; on branche la source).
   Regroupement : **un archipel par thème**, les idées d'un même thème
   voisines, ponts (routes de synergie) dessinés depuis le champ liens.
   Rendu **déterministe** (même registre → même image ; pas de `Math.random`/
   `Date.now`). Sortie = artifact privé + build local (pas de page publique,
   cf. AD-0).
4. **Harnais patrimoine** (`tests/`, enrichi jamais jetable) : déterminisme
   (même entrée → sortie identique), **zéro idée perdue** (toute idée du
   registre apparaît dans un archipel), **regroupement correct** (chaque idée
   dans l'archipel de son thème), contraste AA mesuré, thèmes clair/sombre,
   zéro erreur console.
5. **Contre-passe `verificateur`** (rendu réel, cas : idée sans thème → archipel
   « À classer » ; 0 idée → état vide ; N idées d'un même thème).
Dispatch : `front-carto` (implémente) + `data-ingenieur` (parseur/contrat),
Léo synthétise. Commit `feat: carto ADRAMELECH générée depuis le registre [AD-1]`.
Non gaté.

### AD-2 — `agent-idees` + bilan
Créer le sous-agent (`.claude/agents/`, appelé par Léo, ne parle jamais à
Paul) : regroupements thématiques, rapprochements pertinents (ponts), **bilan**
(combien ce mois, X inexploitables / X à raffiner / X réutilisables). Léo
synthétise ; Paul valide les rapprochements avant qu'ils entrent au registre.
Dashboard statique (compteurs par statut/par thème, registre antique). Non gaté.

### AD-4 (reporté, gate) — passage en base
Table `idees` (projet `ultima` existant), RLS mono-user, édition interactive,
recherche plein-texte. **Gate Paul** (migration + sécurité relevée). Hors v1.

AD-0/AD-1/AD-2 avancent **sans la console C1** (registre + carto autonomes) ;
l'ensemble se branchera sur la coque authentifiée quand C1 existera.

## 6. Décisions Paul — ✅ TOUTES VALIDÉES (2026-07-16)

1. **Périmètre v1** : ✅ « bibliothèque vivante sans base » (zéro gate).
2. **Sécurité** : ✅ idées jamais servies en public (« on sécurise la data »)
   — traitée en premier (AD-0).
3. **Ordre vs console C1** : ✅ on avance ADRAMELECH maintenant, console en
   parallèle.

Exécution : **AD-0 (sécuriser) → AD-1 (carto générée) → AD-2 (agent + bilan)**.

## 7. Ce que cette boucle NE fait pas (garde-fous EB)

- Pas de base de données en v1 (pas de gate déclenchée sans go).
- Pas de moteur de regroupement sémantique lourd tant que le volume est faible
  (4 idées) — le regroupement par **thème** suffit et prouve la valeur ; le
  sémantique arrive quand l'archipel « devient énorme » (mot de Paul).
- Pas de refonte de la carto : on **réutilise** son rendu antique, on branche
  juste sa source sur le registre.
