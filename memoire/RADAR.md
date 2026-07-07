# Mémoire Léo — Radar (anticipation + amélioration continue)

> Ce que Paul va probablement avoir besoin, avant qu'il le demande ; et les
> pistes d'amélioration que Léo doit lui proposer. Revu à chaque session :
> ce qui se confirme monte, ce qui est démenti sort (avec note).

## Besoins anticipés (à confirmer par l'usage)

1. ✅ CONFIRMÉ (go Paul 2026-07-03) — **le rapprochement objet pilotable** :
   modèle conçu et déposé en migration `0003` (statuts, intérêt qualitatif,
   efforts chiffrés, raison d'arrêt obligatoire, journal + relances).
2. **Saisie au pouce en situation** — il ajoutera des contacts après un RDV,
   depuis le téléphone : formulaire ultra-court, le reste plus tard.
3. **Relances** — « où j'en suis » implique des rappels (rapprochements sans
   nouvelle depuis X jours) dans le rapport d'arrière-plan.
4. **Champs d'affinité** — valeurs / état d'esprit devront être des données
   structurées (tags) pour que la carte suggère des passerelles.

## Pistes d'amélioration à proposer (fil continu)

- Routine d'arrière-plan (sécurité + données) : à cadrer puis activer (gate
  coût/fréquence).
- PWA installable (icône téléphone, hors-ligne minimal) plutôt qu'app native.
- Rapport de Léo consultable DANS l'interface (section dédiée) plutôt que
  par un canal externe — cohérent avec « autarcie ».

## Rétrospective (erreurs → corrections)

- 2026-07-03 — Léo a inventé des « passerelles inter-projets » non demandées
  → correction : autarcie consignée partout ; leçon : ne jamais extrapoler
  la vision produit sans la faire valider.
- 2026-07-03 — Léo a annoté l'audit « corrigé+commit » avant d'avoir corrigé
  → repris avant commit ; leçon : un statut ✅ n'existe qu'avec commit + preuve.
- 2026-07-03 (clôture) — Approbations MCP en panne toute la session pour
  certaines écritures (Notion, création de routine) alors que Supabase a fini
  par passer → leçon : toujours re-tenter en fin de session, et consigner
  dans le repo AVANT de dépendre d'un outil externe. Synchro Notion à
  rattraper à la prochaine session (rien de perdu : le repo fait foi).

## Rétrospective 2026-07-06 (session solo)

- **Confirmé** : la chaîne agents (spec → implé → contre-passe) tient la
  qualité ET préserve le contexte de Léo ; les harnais patrimoine rendent la
  contre-passe quasi gratuite.
- 2026-07-07 (v3-④) : la chaîne spec (ux ∥ graphisme) → implé → contre-passe
  reconfirmée ; la spec UX a découvert un bloquant hors périmètre (U6
  Permissions-Policy) AVANT le code — valeur des specs par agents. Ordre
  commit-puis-contre-passe imposé par le stop-hook (environnement éphémère) :
  acceptable si le vérificateur confirme que le contenu committé est
  byte-identique à ce qu'il a testé (fait ici) ; la fusion reste le vrai gate.
- 2026-07-07 (v3-⑤) : conflit de specs (déclencheur géocodage : bouton
  libellé UX vs épingle in-field graphisme) arbitré par Léo AVANT dispatch
  d'implémentation — plus propre que « l'implémenteur choisit » ; à
  reproduire : toute contradiction inter-specs remonte à Léo, pas au codeur.
- **Friction corrigée → règle** : commit parti sur le main local (branche non
  recréée en début de boucle) → PR fusionnée VIDE, travail récupéré au
  reflog. Règles : ① toujours `git checkout -B <branche> origin/main` AVANT
  toute boucle ; ② après chaque merge, vérifier les stats (un merge à
  0 fichier = alerte rouge) ; ③ le stop-hook « unverified committer » est un
  symptôme de branche/config — le traiter, pas l'ignorer.
