# Mémoire Léo — Journal des décisions de Paul

> Une décision consignée n'est jamais redemandée ni re-litigée.
> Format : date — décision — conséquence.

- **2026-07-02** — Ultima = carte interactive du réseau commercial, greenfield,
  Leaflet/OSM (pas de Google Maps sans décision coût), vanilla sans framework.
- **2026-07-03** — Go création projet Supabase « ultima » (10 $/mois, Paris).
- **2026-07-03** — Go application migration `0001` (RLS) puis `0002`
  (advisors : search_path + RLS initplan).
- **2026-07-03** — **Mono-utilisateur** : seul Paul se connecte (Gmail perso).
  Inscription fermée [S3]. Persona « collaborateur » hors périmètre.
- **2026-07-03** — Équipe d'agents + **Léo master agent, interlocuteur unique**
  (remplace ultima-pilote), ancré dans `CLAUDE.md`.
- **2026-07-03** — **Vision produit précisée** (annule et remplace) :
  cartographier les **individus** du réseau pro ; passerelles entre business
  via les individus ; méthode qualitatif → chiffré → pilotage ; **autarcie
  complète** du projet (pas de passerelles vers les autres projets de Paul —
  l'idée inverse était une erreur d'interprétation de Léo, supprimée) ;
  **mobile-first** (« pilotage au bout des pouces »), ordinateur ensuite ;
  autonomie de Léo en arrière-plan : sécurité + tenue des données.
- **2026-07-03 (go pour tout)** — ① Pivot du modèle acté : personne = seul
  nœud, rapprochement = objet pilotable (statuts + raison d'arrêt requise),
  journal avec relances → migration `0003` déposée (application = gate).
  ② Arrière-plan Léo = relances + hygiène + advisors (lecture seule,
  quotidien). ③ PWA validée (pas d'app native). ④ P2 sécu S1/S4/S5
  appliqués dans la foulée du go global.
- **2026-07-03 (clôture)** — Go application `0003` : appliquée et vérifiée
  (3 tables RLS/12 policies/index GIN, v1 supprimée). Fin de session dans la
  foulée ; prochaine boucle = implémentation v2 (API puis front, spec UX).
- **2026-07-06** — Protocole **GO SOLO** ancré dans `CLAUDE.md` (déclencheur
  « solo ») : autonomie maximale, merge/push autorisés, registre « ⏳ Actions
  humaines » ; restent bloquants : payant, suppression de données non
  vérifiées vides, secrets, choix produit ambigu.
- **2026-07-06** — ⚠️ **Conflit de cap détecté a posteriori** : la session du
  03 (PR #3, jamais fusionnée ni synchronisée Notion) avait acté le pivot v2
  et appliqué son schéma ; la session du 06, partant des docs de `main`
  (v1 seule), a purgé les tables v2 (vérifiées vides — zéro donnée perdue),
  réappliqué et durci le schéma v1 (migrations 0001-0004, advisors 0 lint),
  branché le front réel et fusionné (PR #4). **Arbitrage Paul requis :
  reprendre le pivot v2 (migration prête dans la branche de l'ex-PR #3) ou
  continuer la v1 carte réseau.** Aucune des deux voies n'est perdue.
- **2026-07-06** — Portés de l'ex-PR #3 (indépendants du cap, actés le 03) :
  mono-utilisateur (`shouldCreateUser: false`), PWA (manifest + icône),
  mémoire Léo (`memoire/`), équipe d'agents (`.claude/`), Léo ancré dans
  `CLAUDE.md`. Non portés (dépendants du cap) : PRODUIT v2, AUDIT du 03,
  migration pivot.
- **2026-07-06 (arbitrage)** — « On continue la carte réseau tout en liant
  les fonctionnalités au pivot v2 » → **hybride v1×v2** : la carte v1 reste le
  socle ; relations = rapprochements pilotables (cycle de vie v2, arrêt
  justifié obligatoire, une active par paire/type — résout U5) ; journal
  « où j'en suis » avec relances sur nœud XOR relation. Migration 0005
  appliquée. Pivot intégral archivé en branche, non supprimé.
- **2026-07-06 (interface v3)** — Cadrage dicté par Paul : app en 3 onglets —
  **Accueil « Bienvenue, Paul »** piloté par Léo (« on fait quoi
  aujourd'hui ? » : relances dues, pilotage, suggestions par règles locales),
  **Carte** (existant), **Contacts** (saisie progressive, nom seul requis,
  saisie vocale navigateur pour les champs longs ; structuration complexe =
  dicter à Léo en session). Pas de Vercel existant pour Ultima → création
  Hobby (gratuit) à la livraison de l'Accueil. IA conversationnelle DANS
  l'app = clé API + coût → gate Paul, au registre.
- **2026-07-06 (style de l'Accueil)** — Image de référence envoyée par Paul :
  carte de la Forêt des Rêves Bleus (Winnie l'Ourson, E.H. Shepard). L'Accueil
  sera une **carte de livre d'enfance** : parchemin, encre, lettrage manuscrit,
  contacts = lieux dessinés, relances = panneaux. Style inspiré, œuvre non
  reproduite. Police manuscrite libre auto-hébergée (CSP).
- **2026-07-06 (capacités de Léo élargies)** — ① Créer/mobiliser des agents
  supplémentaires si l'équipe ne suffit pas (déjà en charte, confirmé).
  ② Messagerie : « envoie cela à Godefroy » → Léo rédige et dépose ; état
  réel : Gmail = brouillon complet possible, envoi direct non branché
  (dernier geste à Paul) ; si envoi branché un jour : uniquement sur
  instruction explicite. ③ Léo peut créer des rapprochements en base et
  interroger Paul sur les rapprochements potentiels (méthode qualitatif →
  chiffré → pilotage). ④ Idée maîtresse ancrée : conseiller, aider à
  piloter, faire réfléchir, donner des idées — proactivement.
- **2026-07-06 (état d'esprit + optimisation)** — ① Principe acté : Ultima =
  sérieux ET ludique (« donne envie comme à un enfant ») — gravé dans
  CLAUDE.md et le profil. ② Retours ⚡ implantés en règles permanentes :
  harnais navigateur versionnés dans `tests/` (lancer.sh), conception/implé
  par agents avec contre-passe Léo, réutilisation systématique, économie de
  contexte.
- **2026-07-06 (solo, v3-②/③)** — v3-② Contacts livré (4 harnais verts,
  double passe ; fusion réparée après incident de branche, cf. RADAR).
  v3-③ : décision technique Léo — repli API sur URL + clé publiable (pas des
  secrets, env prioritaires) → zéro env à saisir. Limite d'outillage : la
  création du projet Vercel exige l'import Git dashboard (ou jeton CLI =
  secret) → action Paul au registre (2 min, gratuit).
- **2026-07-08 (style — antique et sérieux)** : sur revue des previews du
  pivot, Paul retire le registre enfantin/ludique (« enlevons le style
  enfantin pour un style sérieux, style antique et sérieux »). Remplace le
  principe « sérieux ET ludique / comme à un enfant » du 2026-07-06 —
  CLAUDE.md mis à jour. Conséquences : plus d'annotations manuscrites
  (Caveat) ni de clins d'œil enjoués dans les interfaces ; registre carte
  savante (gravure, parchemin, cartouches, petites capitales). Les acquis
  R1 (sépia, cartouche, voile) sont déjà dans ce registre et restent.
- **2026-07-08 (pivot entrée + arbre — dicté, arbitrages ouverts)** :
  ① Vision dictée : page de connexion « Ultima » = carte de monde
  fantastique type île-anneau (référence Ulthuan/Warhammer → œuvre non
  reproduite, création originale, règle 2026-07-06 réappliquée), sans nom
  de monde, bandeau « Ultima ». ② Connecté : **plus de carte, un arbre**
  — branche commune = secteur d'activité, ramification = contact,
  croissance à l'ajout. ③ Méthode exigée : « cadre bien avant tout » →
  REFONTE-ARBRE.md livré AVANT tout code. ④ Non re-litigé : l'auth
  invisible reste actée (la page de connexion sera belle mais vue une
  fois par appareil) ; le sort de la carte existante reste à arbitrer
  (D2) — suspension de REFONTE-ACCUEIL R2-R4 consignée, pas de
  suppression.
- **2026-07-07 (refonte accueil)** — ① Vision dictée : la carte de France
  antique devient l'entrée d'Ultima (Ptolémée / Age of Mythology), points =
  contacts, « Ultima » stylisé en cartouche, ludique et imaginaire mais
  géographie réelle. ② Direction visuelle **B « Age of Mythology »** actée
  sur 3 previews (A Ptolémée / B mythologie / C hybride) — référence :
  design/preview-accueil-mythologie.html. ③ **Auth invisible** actée :
  session persistante, une connexion par appareil ; la suppression de la
  connexion demandée à l'oral est refusée après explication sécurité (URL
  jamais secrète, réseau = PII, RLS fondée sur le compte) — Paul a validé
  l'alternative. ④ Cadrage en 4 boucles R1-R4 : REFONTE-ACCUEIL.md.
- **2026-07-09 (arbitrages pivot + go solo)** — Paul : « je suis toutes tes
  recos » → D1-D5 actés aux options recommandées : D1 session persistante +
  belle page vue 1×/appareil ; **D2a la carte reste en onglet secondaire**
  (l'arbre devient l'écran connecté, rien de jeté) ; D3 secteur = texte libre
  + suggestions ; D4 go previews ; D5 go ordre A1→A4. Puis « cadre à fond
  pour travailler tout seul » → **GO SOLO** : pivot Arbre A1→A4 déroulé en
  autonomie (agent → contre-passe sécu + verificateur → commit), PR #24.
  Migration `0006` (secteur) déposée mais **non appliquée** (gate maintenue
  même en solo : migration de feature ≠ durcissement). Fusion PR = go Paul.
  Arbitrage esthétique laissé ouvert (arbre-registre en bandes déterministe
  vs dessin peint) — consigné, non tranché seul.
- **2026-07-11 (skills, registre, gates, arbre — go solo)** — session dense :
  ① Paul : « va chercher des skills utiles… tout ce qui concerne Ultima » puis
  « récupère et installe ce qui sert à CONSTRUIRE Ultima » + « **pas de
  landing** » → 5 skills installés (frontend-design, theme-factory,
  algorithmic-art, webapp-testing, skill-creator ; anthropics/skills, Apache
  2.0), marketing/landing écarté ; charte de Léo enrichie (dispatch skills +
  recruteur de skills). ② « améliorer Léo » : agent vs skill acté (expert qui
  raisonne vs procédé réutilisable). ③ « 1 puis 2 » → boucle **antique et
  sérieux** (purge Caveat + panneaux de bois, exécution de la déc. 2026-07-08)
  puis boucle **Arbre responsive**. ④ **GO SOLO** ré-armé (« go solo »). ⑤
  « **prépare toutes les gates** » : découverte que la migration **0006 était
  DÉJÀ appliquée** (registre périmé — leçon RADAR) ; gate ④ **durcissement
  `auth.getUser()`** mergée sur go Paul avec 2 arbitrages tranchés :
  `/api/geocode` rejette un Bearer invalide (401), et **panne Auth = 401
  fail-closed** (pas 503). ⑥ « la carte grandit-elle avec les contacts ? » →
  réponse : l'Arbre grandissait déjà en hauteur ; la largeur était bloquée →
  **Arbre responsive en largeur** (paliers 3→6 col), **validé tel quel** par
  Paul (« je valide ainsi »). Reste esthétique non tranché : sous-titre du
  cartouche à 4,594:1 (AA mais marge fine) — micro-arbitrage laissé ouvert.
