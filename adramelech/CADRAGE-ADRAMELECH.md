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
**Contre-passe adversariale `securite-auditeur` = GO** (2026-07-16) : le garde
résiste à tous les contournements réellement servables (encodages %2f / double /
triple, traversal `..`, `//`, `\`, casse, query — tous bloqués), zéro faux
positif sur le site public. Trois durcissements relevés, **non exploitables
aujourd'hui** (backstoppés par `.vercelignore`), **différés à AD-4** (avant que
la base ne fasse du middleware l'unique contrôle) :
- **S1** — docs `.md` racine ne reposent que sur `endsWith('.md')` : un octet
  parasite encodé en fin (`/CLAUDE.md%20`, `.md.`, `.md%00`) le défait. Fix :
  strip des octets de fin avant le test.
- **S2** — backslash encodé `%5c` non traité comme séparateur. Fix : `\` ≡ `/`.
- **S3** — le 404 du garde (corps `Not Found`, headers maison) est distinguable
  du 404 natif Vercel → oracle de fingerprint du *namespace* (aucune PII/idée
  ne fuit). Fix optionnel : aligner sur le 404 natif.
⏳ **Actions humaines consignées** : (a) confirmer par `curl` sur le domaine de
prod que le 404 est bien rendu (middleware exercé en unitaire seulement) ;
(b) **conséquence produit à acter** : `.vercelignore` retire tout `adramelech/`
du déploiement → le quadrant est **noir en prod** en v1 (carto consultée par
l'artifact privé). Cohérent avec AD-4 (idées via API `requireUser`).

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

### AD-2 — `agent-idees` + bilan ✅ LIVRÉ (2026-07-16)
- Sous-agent `.claude/agents/agent-idees.md` créé (appelé par Léo, ne parle
  jamais à Paul, propose sans décider, source unique `IDEES.md`, zéro perte).
- **Bilan chiffré** (dashboard statique) ajouté au générateur : `calculerBilan`
  (total, par statut, par thème, ponts, archipels) + cartouche « Bilan de
  l'archipel » (3 tuiles clés + 2 planches de barres gravées), déterministe,
  responsive. Harnais +7 verdicts (16/16). Vérifié navigateur (0 erreur, AA).
- Non gaté. **La boucle ADRAMELECH v1 (AD-0 → AD-2) est complète.**

### AD-4 — passage en base (go solo Paul 2026-07-16, « boucle AD-4 en base »)
- **AD-4a ✅ APPLIQUÉE** : migration `0007_idees.sql` — tables `idees` +
  `idees_liens`, RLS mono-owner (confirmée `rls_enabled=true` en base), CHECK
  miroir du registre, unicité `(owner_id, adr_num)` + paire non orientée.
  Contre-passe `securite-auditeur` GO (fuite inter-owner inexploitable, parité
  `network_edges`). **Appliquée en solo** (additif, non destructif, tables
  vides) — signalé au registre.
- **AD-4b ✅** : API `/api/idees` (GET) + `/api/idees/items` (CRUD idée) +
  `/api/idees/liens` (ponts), `requireUser`, validation stricte
  `validateIdee`/`validateLien` (parité API↔base). Harnais unit (20 verdicts).
- **AD-4c (durcissements) ✅** : S1 (octets parasites) + S2 (backslash) fermés
  au garde middleware ; S3 (fingerprint 404, non exploitable) consigné.
- **AD-4c (front) ✅ LIVRÉ (2026-07-19, « on termine AD »)** : la carto **côté
  client après auth** — page `idees.html` servie sur `/idees` (motif traveler,
  hors préfixe privé : middleware INTOUCHÉ), module `js/idees.js` (fetch
  `/api/idees` Bearer, archipels par thème principal, ponts, états 401/vide/
  erreur/démo, DOM createElement/textContent uniquement), quadrant console
  activé. Spec : `design/spec-ad4c-front.md`. Harnais patrimoine
  `unit-idees-carto` (20) + `smoke-idees` (45, API stubbée, contrastes AA
  mesurés) ; suite complète verte ×2 (agent + contre-passe Léo). Fin du
  « noir en prod ». Reste à prouver par Paul : flux authentifié réel en prod.
- **Seed ✅ APPLIQUÉ (2026-07-18)** : la gate est tombée — le compte auth de
  Paul **existait en réalité depuis le 2026-07-09** (dernière connexion
  2026-07-17 ; le registre disait « 0 user », leçon radar : vérifier l'état
  réel). SQL généré par `importer-idees.mjs` avec l'owner_id réel, audité
  (upserts seuls, rien de destructif), appliqué : **4 idées + 4 ponts en base**,
  vérifiés (GLANEUR · PROTÉE · INTENDANT · MYCÉLIUM).

**Durcissement transversal consigné** (hors 0007, décision d'archi) : FK
composite `(owner_id, id)` sur `idees`/`network_edges`/`journal` pour sceller
l'appartenance croisée (défense en profondeur du résidu inter-owner) — migration
dédiée, escalade signalée.

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

## 8. AD-5 — VOLET 2 : analyse stratégique (vision Paul 2026-07-16)

> Deuxième volet d'ADRAMELECH, **là où est la vraie plus-value**. Le volet 1
> (carto, relations en jaune) reste intact — on n'y touche pas. Ce volet-ci
> **décortique chaque idée** jusqu'au business model, la **score**, la met en
> **concurrence mécanique** avec le cœur rémunérateur, et n'en retient que 3.

### 8.1 Cap du volet (mot de Paul)

Pousser la réflexion **le plus loin possible** sur chaque projet : points forts,
points faibles, mises en relation entre projets, prémortems ; un **business
model par idée** (besoins réels chiffrés : camion ? combien d'argent ? combien
de personnes ? extrapolations) ; un **scoring /10** ; puis, sur les 15-20 idées
à terme, **n'en retenir que 3 max** (« pas le temps pour tout faire »). Chaque
idée est **mécaniquement mise en concurrence** avec le socle rémunérateur.

### 8.2 La grille d'analyse — 7 blocs par idée (les « 5 modèles » = A→D+E)

Une idée « décortiquée » passe les 7 blocs suivants. Les **5 modèles d'analyse
moyen-long terme** demandés par Paul = **ERRC (Océan Bleu/Rouge) · Porter ·
TOWS · Lean Canvas · Prémortem** (chacun un horizon différent).

- **A. Positionnement** — Océan Bleu/Rouge via grille **ERRC** (Exclure /
  Atténuer / Renforcer / Créer) + **5 forces de Porter**. Conclut : océan bleu
  ou rouge, et où.
- **B. Diagnostic** — **SWOT croisé (TOWS)** : forces × faiblesses ×
  opportunités × menaces → 2-3 axes stratégiques. (= points forts/faibles.)
- **C. Business model** — **Lean Canvas** + **besoins réels chiffrés** :
  camion, entrepôt, ETP/personnes, **cash nécessaire** avant équilibre,
  extrapolation de revenu. Toute hypothèse marquée comme telle.
- **D. Risque** — **Prémortem** : projeter l'échec à 2-3 ans, remonter les
  causes probables + le signal avancé de chacune.
- **E. Scoring /10** — 5 critères, chacun /10 + justification :
  **Simple · Efficace · Rémunérateur · Utile · Temps** (10 = très rapide à
  lancer). **Pondération actée (Paul 2026-07-16) : Temps ×2 et Rémunérateur ×2**
  (contexte « pas le temps, 3 idées max » → vitesse + rentabilité comptent
  double) ; score global pondéré /10 sur dénominateur 7.
- **F. Benchmark obligatoire** — mise en concurrence **mécanique** de l'idée
  avec le **cœur rémunérateur** = **Renoboost IA** (chantiers + installations à
  domicile, la « vache à lait » ; libellé confirmé par Paul 2026-07-16, au
  lexique). Verdict tranché : top 3 ou satellite du socle.
- **G. Provision d'exécution** — quels **agents** (existants ou à créer) et
  quelles **automatisations** fluidifieraient le projet s'il était retenu.

**Sortie du volet** : les idées passées à la grille, triées par score →
**top 3 max** retenu. ADRAMELECH est une **bibliothèque adossée** aux projets
rémunérateurs (chantiers + installs), pas un concurrent : une idée ne « passe »
que si elle bat, complète ou renforce ce socle.

### 8.3 Stockage — ✅ décidé (Paul 2026-07-16)

L'analyse vit **dans `IDEES.md`, par idée** : un bloc `### Analyse stratégique`
sous chaque idée. Source unique (pas de duplication, pas de nouvelle surface) ;
lisible par la carto et `agent-idees`. Pas de base pour ce volet (pas de gate).

### 8.4 Découpage en sous-boucles

- **AD-5a — cadrer + fiche pilote** (✅ choix Paul 2026-07-16) : graver cette
  grille (fait) + dérouler **une fiche complète sur GLANEUR (ADR-001)** pour
  **éprouver la grille** avant de généraliser. Dispatch `agent-idees` (analyse
  lourde), Léo synthétise et intègre. Non gaté. Commit
  `feat(adramelech): grille d'analyse stratégique + fiche pilote GLANEUR [AD-5]`.
- **AD-5b — généralisation + classement ✅ LIVRÉ (2026-07-16)** : grille
  appliquée aux 3 autres idées (PROTÉE, INTENDANT, MYCÉLIUM) ; pondération actée
  (Temps ×2 + Rému ×2). Vu le volume (4 idées), le **classement top-3 a été
  produit dans la foulée** (section « Classement stratégique » en tête d'`IDEES.md`) :
  top 3 = **MYCÉLIUM 8,1 · INTENDANT 7,9 · PROTÉE 6,3**, lus **en système**
  (moteur qui se renforce) ; **GLANEUR 5,0 = satellite, hors top 3**. Séquence de
  démarrage validée par Paul : **INTENDANT → MYCÉLIUM → PROTÉE (bridée)**.
- **AD-5c — premier build d'un retenu : INTENDANT v1** : cf. §9 (choix Paul
  2026-07-16, « cadrer le build d'INTENDANT »).
- **AD-5d — tri à l'échelle** (futur) : quand le volume approche 15-20 idées,
  re-classement par score pondéré + benchmark pour re-trancher le top 3.

### 8.5 Ce que ce volet NE fait pas (garde-fous EB)

- Pas de refonte du volet visuel (carto/relations en jaune) — intact.
- Pas de base pour l'analyse (registre suffit ; gate évitée).
- Pas de généralisation aux 4 idées tant que la grille n'est pas éprouvée sur
  le pilote (une boucle à la fois).
- Pas de score complaisant : la grille est un **filtre**, elle doit éliminer.

### 8.6 Décisions Paul — ✅ validées (2026-07-16)

1. **Périmètre AD-5a** : ✅ cadrer + fiche pilote GLANEUR (grille validée par
   Paul → généralisation AD-5b lancée).
2. **Stockage** : ✅ dans `IDEES.md`, par idée.
3. **Benchmark** : ✅ ligne de base = **Renoboost IA** (socle chantiers +
   installations à domicile), libellé confirmé par Paul (au lexique).
4. **Pondération scoring** : ✅ **Temps ×2 + Rémunérateur ×2** (dénominateur 7).

## 9. AD-5c — premier build d'un retenu : INTENDANT v1 (outil interne)

> Première idée du top 3 qui passe de l'analyse à la construction (choix Paul
> 2026-07-16, séquence INTENDANT → MYCÉLIUM → PROTÉE). **Cadrage pur** : on borne
> le build, on ne code pas encore. Source : fiche stratégique ADR-003 dans
> `IDEES.md` (bloc « Analyse stratégique »).

### 9.1 Pourquoi INTENDANT en premier

Le moins cher (**3-8 j-h [hyp.]**, zéro actif), il **dérisque le socle Renoboost
IA tout de suite** (plus de chantier foiré faute d'une pièce) **et fabrique la
matière première de MYCÉLIUM** (les fins de chantier réussies). C'est le rouage
amont du moteur.

### 9.2 Périmètre v1 — la check-list, PAS l'ERP

Le risque n°1 du prémortem d'INTENDANT est la **sur-ingénierie**. La v1 est
**exactement** le noyau décrit au registre, rien de plus :
- **Matching à 3 sources au niveau de la pièce** : besoins client ⟷ commandes ⟷
  stock propre.
- **3 états par ligne** : `couvert` / `commande_en_attente` / `manquant`.
- **Cycle de vie d'une ligne** : besoin → couvert (stock/commande) → livré →
  **contrôlé en bon état** (la casse au contrôle = repasse en `manquant`).
- **Alerte J-2** : tant qu'un `manquant` subsiste à 2 jours de la pose, alerte.
- **Recalcul** : un besoin ajouté en cours de route recalcule les manquants.
- **Instrumenter la preuve dès la v1** : compteur de **manquants détectés à J-2**
  (contre le risque « valeur invisible » du prémortem — sans mesure, l'outil est
  abandonné faute de ROI ressenti).

**Hors v1, explicitement** : compta/paie/devis/RH (ce serait un ERP) ; import &
parsing des BC fournisseurs (**gate** : coût, fragilité — différé jusqu'à preuve
de valeur par la saisie manuelle/vocale) ; généralisation SaaS multi-tenant à
d'autres artisans (**après** un cycle chantier complet piloté en interne).

### 9.3 Contrat de données — ✅ proposé par `data-ingenieur` (draft `0008_intendant.sql`)

Principe non négociable : **s'accrocher à la fiche chantier TRAVELER existante**
(FK vers le chantier), **pas de silo**. RLS mono-owner en miroir de `0007`.
SQL draft dans `supabase/migrations/0008_intendant.sql` (**jamais appliqué —
gate β**).

**Deux tables neuves, additives** (aucune brique ERP) :
- **`intendant_chantiers`** — le chantier *piloté* + sa `date_pose`. Satellite
  1-1 d'un `network_nodes` de type `chantier` (l'accroche à TRAVELER, aucun
  chantier recréé). Unicité `(owner_id, node_id)` : un dossier par chantier.
- **`intendant_besoins`** — une ligne = une pièce exigée (le cœur du matching).
  `designation`, `quantite`, `mode ∈ {stock, commande, aucune}` (la couverture) ;
  volet commande dénormalisé (`commande_ref` **saisie manuelle en v1** — parsing
  BC = différé/gate, `fournisseur_node_id` opt., `livree_le`, `controle ∈
  {en_attente, conforme, casse}`).

**Les 3 états = colonne GÉNÉRÉE STORED** (jamais saisie, base = source unique) :
```
mode='stock'                          -> couvert
mode='commande' AND controle=conforme -> couvert            (livré + contrôlé)
mode='commande' AND controle=casse    -> manquant           (livré cassé = manquant)
mode='commande' (sinon)               -> commande_en_attente
mode='aucune'                         -> manquant
```
Conséquences gratuites (zéro trigger/batch) : **la casse repasse en `manquant`**
en changeant un seul champ ; **le recalcul à l'ajout d'un besoin** est automatique
(une ligne `aucune` naît `manquant`) ; « couvert » = livré **ET** contrôlé, fidèle
au registre (le cas « aile de recouvrement »).

**Alerte J-2 = une requête** (pas un état stocké) : les `manquant` dont le
chantier a `date_pose ∈ [aujourd'hui, +2j]`. La métrique « manquants détectés à
J-2 » (preuve de valeur) se lit sur la même requête.

**Sécurité** : RLS activée à la création, une policy par opération,
`owner_id = (select auth.uid())` ; CHECK d'énumération + cohérence
(`controle` interdit sans `livree_le` ; champs commande null hors `mode=commande`)
en miroir de la future validation API.

**⏳ Décision d'archi à trancher (bloc OPTION du SQL)** : le **scellement croisé**
`intendant_besoins(owner_id, chantier_id) → intendant_chantiers(owner_id, id)`
(défense en profondeur AD-4 : impossible d'accrocher un besoin au chantier d'un
autre owner même si RLS tombait) exige un **index unique additif `(owner_id, id)`
sur `network_nodes`** — le seul geste touchant une table existante (additif,
`id` déjà PK → zéro risque). Recommandé (cohérent AD-4, cheap), isolé en bloc
OPTION retirable. **À valider par Paul avec la migration.**

**Non exprimable en FK** : « `node_id` doit être de type `chantier` » se valide
côté API (un trigger serait de la sur-ingénierie v1).

### 9.4 Saisie

- **Vocale prioritaire** (registre ADRAMELECH oblige) + saisie manuelle.
- **Pas de parsing BC fournisseurs en v1** (gate).

### 9.5 Découpage en sous-boucles (une à la fois, gates respectées)

- **AD-5c-α — contrat de données + règle de matching** (ce cadrage + la proposition
  `data-ingenieur`) : SPEC figée, ébauche de migration `0008_intendant.sql`
  **draftée mais JAMAIS appliquée**. Non gaté (rédaction seule).
- **AD-5c-β — migration base ✅ APPLIQUÉE (2026-07-16)** : `0008_intendant.sql`
  appliquée sur le projet Ultima (gate Paul ouverte, « appliquer avec le
  scellement » + « Go »). **Scellement `network_nodes` inclus** (bloc OPTION).
  Post-application vérifiée : `intendant_chantiers` + `intendant_besoins` créées,
  **RLS activée** (`rls_enabled=true`), prod par ailleurs intacte. La contre-passe
  `securite-auditeur` a **confirmé la validité moteur** (FK-sur-index-unique,
  colonne générée, CHECK) mais a été **interrompue par une limite de session**
  avant les scénarios adversariaux d'isolation ; substituée par la revue Léo
  (Opus 4.8) + la vérif RLS post-apply. **✅ CLOS (2026-07-19)** : contrôles
  advisors-équivalents rejoués en SQL sur la prod (l'outil advisors MCP reste
  bloqué en approbation) — 7/7 tables RLS activée, 4 policies/table (une par
  opération), zéro fonction `search_path` mutable, zéro `security definer`,
  et les **FK de scellement croisé présentes en prod** (`…_node_scelle`,
  `…_chantier_scelle`, cible d'unicité). Dette sécurité 0008 fermée.
- **AD-5c-γ — API `requireUser` ✅ LIVRÉE (2026-07-19)** : GET agrégé
  { chantiers, besoins, alertes_j2 } + CRUD chantiers (type 'chantier' vérifié
  via client RLS-scopé) + CRUD besoins (geste contrôle réception), validateurs
  miroir des CHECK 0008, 52 verdicts unitaires, harnais complet 21 scripts
  verts (contre-passe Léo). **Contre-passe securite-auditeur GO** ; réserves
  non bloquantes consignées : R1 `fournisseur_node_id` en FK simple (sceller
  en composite si multi-tenant un jour), R2 borne haute `quantite` non mappée
  (overflow base → 500 au lieu de 400, cosmétique), R3 dérive fuseau J-2
  (UTC, documentée, négligeable pour une alerte à 2 jours).
- **AD-5c-δ — front** : saisie (vocale d'abord), vue check-list par chantier,
  **alertes J-2** lisibles, compteur de manquants détectés. Harnais patrimoine
  (`tests/`) enrichi : déterminisme du calcul d'état, zéro ligne perdue, alerte
  déclenchée au bon seuil. Contre-passe `verificateur`.

### 9.6 Garde-fous EB

- **La check-list, pas l'ERP** — si la v1 dépasse ~8-10 j-h sans avoir tourné sur
  un vrai chantier, on a sur-ingénié : stop et recentrage.
- **Boucler le besoin propre avant tout SaaS** — aucun multi-tenant tant qu'un
  cycle chantier complet de Paul n'est pas piloté par l'outil.
- **Pas de parsing fournisseurs avant preuve** de valeur par la saisie simple.
- **Migration jamais appliquée seule** (gate) ; le SQL vit dans
  `supabase/migrations/`.

### 9.7 Note d'architecture — INTENDANT « sort » de la bibliothèque

Une fois construit, l'INTENDANT est un **outil opérationnel du socle**
(pilotage d'approvisionnement de chantier) : il vit dans l'orbite **TRAVELER /
Renoboost IA**, pas dans la bibliothèque d'idées. ADRAMELECH a fait son travail
(capter → analyser → trancher) ; le build est une **diplomation hors du quadrant
idées**. Ce cadrage AD-5c reste ici par continuité, mais l'exécution et la
mémoire opérationnelle de l'INTENDANT relèvent du socle.

## 10. AD-6 — cadrage CHAMBRE CLAIRE (ADR-005) : l'outil de vente en rendez-vous

> Cadrage pur (directive EB : cadrer avant de coder — **rien n'est codé ici**,
> décision Paul 2026-07-20 « on reste sur cadrage et renseignement dans
> ADRAMELECH »). Source : fiche ADR-005 dans `IDEES.md`. **Escalade Opus 4.8
> demandée par Paul et signalée** (décision d'archi). Comme l'INTENDANT (§9.7),
> CHAMBRE CLAIRE est un outil du socle : ADRAMELECH capte et cadre, l'exécution
> relèvera de l'orbite TRAVELER / Renoboost IA.

### 10.1 Décisions déjà actées (Paul, 2026-07-20)

1. **Claude au cœur, photos en v1** — l'API Claude n'ingère pas la vidéo ;
   Gemini seulement si l'ingestion de vidéo brute devient nécessaire (brique
   isolée, jamais socle). Le « temps réel » (incrustation à l'échelle) = AR du
   téléphone (RoomPlan/ARCore), reporté en v2.
2. **Extension d'Ultima** (directive JL) — pas d'application à côté ; l'outil
   s'accroche à la fiche chantier/lead TRAVELER et Léo l'orchestre.
3. **Faisabilité via le catalogue IceStream** — le verdict de pose fait partie
   du produit dès la v1.

### 10.2 Périmètre v1 — « l'œil du rendez-vous » (photos, pas d'AR)

Depuis une fiche chantier/lead TRAVELER, en rendez-vous :
1. **Photos de la pièce** (prises ou chargées au téléphone).
2. **Analyse Claude (vision)** : lecture de la pièce — mur candidat,
   contraintes visibles (hauteur, obstacles, passage des liaisons,
   évacuation condensats, position possible de l'unité extérieure) ; les
   mesures clés sont **confirmées par Paul** (l'IA propose, Paul valide).
3. **Trois sorties, lisibles en rendez-vous** :
   - **Recommandation produit** depuis le catalogue IceStream (dimensionnement
     puissance selon volume estimé de la pièce, produits compatibles).
   - **Verdict de faisabilité** : `faisable` / `faisable sous condition` /
     `non faisable`, toujours **motivé**.
   - **Estimation** en fourchette (matériel + pose) — une estimation, PAS un
     devis contractuel.

**Hors v1, explicitement** : AR / incrustation 3D (v2, gate produit) ; vidéo
(Gemini, seulement sur preuve que les photos ne suffisent pas) ; devis signable
(v3) ; tout stockage définitif des photos (cf. §10.4).

### 10.3 Préalable P0 — le catalogue IceStream en données

Le moteur de faisabilité n'existe que si le catalogue est **structuré** :
par produit — référence, libellé, type (mono/multisplit…), dimensions unité
intérieure/extérieure, puissances froid/chaud, contraintes de pose
(dégagements, longueur et dénivelé max des liaisons, poids/support,
alimentation), prix indicatifs. Modèle : table `produits` RLS mono-owner en
miroir des motifs 0007/0008, SQL **drafté par `data-ingenieur`, jamais appliqué
seul** (gate). ⏳ **À renseigner par Paul : sous quelle forme existe le
catalogue IceStream aujourd'hui** (tableur, PDF, site fournisseur ?) — cela
décide saisie manuelle vs import.

### 10.4 Sécurité (surface relevée)

- **Photos de l'intérieur du domicile d'un client = PII sensible.** Jamais
  servies en statique public ; en v1, **analyse à la volée sans stockage**
  (recommandé) ou bucket Supabase privé sous RLS si Paul veut l'historique
  (⏳ décision). Jamais de photo ni d'adresse en logs (IDs uniquement).
- API `requireUser` comme AD-4/AD-5c-γ ; validation stricte des entrées.
- Coût : appels vision Claude = coût API variable (canal `/api/leo` existant) —
  signalé, pas de gate nouvelle tant qu'on reste sur la clé existante.

### 10.5 Découpage en sous-boucles (une à la fois, gates respectées)

- **CC-α — catalogue IceStream** : contrat de données + draft
  `supabase/migrations/` (`data-ingenieur`) ; apply = gate Paul ; puis saisie
  du catalogue réel.
- **CC-β — moteur de faisabilité + reco + estimation** : règles
  **déterministes** produit ⟷ contraintes relevées (auditables, testables en
  harnais) ; Claude lit les photos et propose, **les règles tranchent** le
  verdict. API `requireUser`.
- **CC-γ — front rendez-vous** : mobile d'abord (outil de terrain), accroché à
  la fiche chantier ; spec `interface-ux`, implémentation `front-carto`,
  registre antique.
- **CC-δ — v2 AR** (RoomPlan/ARCore + petit catalogue 3D) : hors cadrage v1,
  gate produit dédiée.

### 10.6 Garde-fous EB

- **Le build n'est PAS lancé par ce cadrage.** ADR-005 n'est pas passée à la
  grille AD-5 ; la séquence validée reste INTENDANT → MYCÉLIUM → PROTÉE.
  Lancer CC-α = décision Paul explicite (arbitrage vs top 3).
- Pas d'AR, pas de vidéo, pas de devis contractuel en v1.
- Éprouver sur **un vrai rendez-vous** avant tout élargissement.
- Estimation toujours affichée comme fourchette non contractuelle.

### 10.7 Décisions attendues de Paul

1. Forme actuelle du catalogue IceStream (tableur / PDF / site).
2. v1 avec ou sans stockage des photos (recommandation Léo : sans).
3. Go CC-α — et sa place vs la séquence INTENDANT → MYCÉLIUM → PROTÉE.
