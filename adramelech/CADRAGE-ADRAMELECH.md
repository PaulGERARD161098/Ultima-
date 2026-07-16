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

## 3. Périmètre v1 — RECOMMANDATION Léo (à valider par Paul)

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

## 4. Sécurité — résolution du point laissé ouvert (bloquant avant diffusion)

Le contenu `adramelech/` (idées = **données personnelles**, §5 sécurité
relevée) est aujourd'hui servi **en statique sans authentification** par
Vercel. Avant toute diffusion de l'URL de production :
- **Option retenue (reco)** : protéger le quadrant derrière l'auth existante
  (session persistante déjà en place côté TRAVELER) — la page idées et son
  registre ne sont servis qu'à une session authentifiée, comme le reste de la
  console. Concrètement : ne pas exposer `adramelech/*.html` en route publique ;
  le rendre via la coque authentifiée (console C1) ou le gater au middleware.
- **En attendant** : la carto est `noindex`, l'URL prod n'est pas diffusée, et
  aucune donnée sensible (au-delà de prénoms de partenaires déjà dans le
  réseau) n'y figure. **À traiter dès l'ouverture de la construction**, avant
  d'ajouter la moindre idée à caractère confidentiel.
- Toute bascule en base relève de la **surface à risque** → escalade Opus +
  contre-passe `securite-auditeur`.

## 5. Découpage en sous-boucles (une à la fois, chacune bouclée)

- **AD-1 — générateur de carto depuis le registre** : remplacer la carte écrite
  main par un rendu déterministe depuis `IDEES.md` (parse → archipels par
  thème → SVG). Harnais patrimoine (`tests/`) : déterminisme, zéro idée perdue,
  contraste, thèmes clair/sombre. Non gaté.
- **AD-2 — `agent-idees` + bilan** : créer le sous-agent (charte dans
  `.claude/agents/`), lui faire produire regroupements/ponts/bilan ; Léo
  synthétise, Paul valide les rapprochements. Non gaté.
- **AD-3 — sécurité du quadrant** : appliquer l'option §4 (auth devant les
  idées). **Gate Paul** (touche middleware/exposition).
- **AD-4 (report, gate) — passage en base** : table `idees`, RLS mono-user,
  édition interactive. **Gate Paul** (migration + coût nul si réutilisation du
  projet `ultima`, mais sécurité relevée).

Ordre : AD-1 → AD-2 → AD-3, puis AD-4 si Paul le veut. AD-1/AD-2 avancent sans
la console C1 (le registre + la carto sont autonomes) ; l'ensemble se branchera
sur la coque authentifiée quand C1 existera.

## 6. Décisions attendues de Paul

1. **Périmètre v1** : valider « bibliothèque vivante sans base » (AD-1→AD-3,
   zéro gate) — ou vouloir directement la version en base (AD-4, gate migration).
2. **Sécurité** : valider l'option « idées derrière l'auth » (§4).
3. **Ordre vs console C1** : on avance ADRAMELECH AD-1/AD-2 maintenant (ils sont
   autonomes), la console C1 restant à faire en parallèle — OK ?

## 7. Ce que cette boucle NE fait pas (garde-fous EB)

- Pas de base de données en v1 (pas de gate déclenchée sans go).
- Pas de moteur de regroupement sémantique lourd tant que le volume est faible
  (4 idées) — le regroupement par **thème** suffit et prouve la valeur ; le
  sémantique arrive quand l'archipel « devient énorme » (mot de Paul).
- Pas de refonte de la carto : on **réutilise** son rendu antique, on branche
  juste sa source sur le registre.
