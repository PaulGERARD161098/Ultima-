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
