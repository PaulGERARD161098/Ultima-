# SPEC A1 — Page de connexion « Ultima » (habillage, zéro touche auth)

> Boucle A1 du pivot (REFONTE-ARBRE §3). Décisions actées Paul 2026-07-09 :
> D1 (session persistante, belle page vue 1×/appareil), D4 (go preview),
> D5 (ordre A1→A4). Style : antique et sérieux (CLAUDE.md).

## Objectif

Transformer l'écran de connexion actuel (bloc inline `#form-connexion` dans
`#zone-auth`, carte visible derrière) en **page de connexion plein écran**
au registre antique : décor carte-anneau ORIGINALE (SVG inline), cartouche
doré « ULTIMA », formulaire lien-magique existant **rebranché à l'identique**
dans un cartouche parchemin flottant.

Référence visuelle à suivre : `design/preview-connexion-ultima.html`
(déjà validée par Paul, D4). Reprendre son SVG monde-anneau, son cartouche
et ses tokens ; l'adapter au markup réel de l'app.

## Règle d'or — CE QUI NE DOIT PAS BOUGER (RB5, gate auth)

- **Aucune** modification de `signInWithOtp`, `getSession`,
  `onAuthStateChange`, `signOut`, `shouldCreateUser:false`,
  `emailRedirectTo`, du header `Authorization`, de la RLS, du middleware,
  de la CSP. C'est un **habillage de présentation**, rien d'autre.
- Le `<form id="form-connexion">`, l'`<input id="champ-email">` et le
  `<button type="submit">` existants sont **réutilisés** (mêmes id, mêmes
  handlers déjà branchés). On peut les envelopper/déplacer dans le DOM et
  les restyler, jamais les recréer ni renommer.
- `#bouton-deconnexion` reste où il est fonctionnellement (dans l'app
  connectée) — il n'appartient PAS à la page de connexion.

## Comportement d'affichage

- La page de connexion est un **overlay plein écran** (nouvel élément,
  ex. `#ecran-connexion`) affiché **uniquement** quand
  `!etat.modeDemo && !etat.session`.
- `majAuthUi()` (js/app.js ~2383) est le seul point de bascule : y ajouter
  le pilotage `hidden` de `#ecran-connexion` (visible si pas de session),
  en cohérence avec la logique existante `#form-connexion.hidden =
  Boolean(etat.session)`. Ne pas dupliquer la logique ailleurs.
- **Mode démo** (config Supabase absente) : PAS de page de connexion —
  l'app reste visible avec les données de démo (non-régression stricte).
- Connecté : l'overlay n'existe pas à l'écran, arrivée directe dans l'app
  (T1, session persistante). Vu une fois par appareil.

## Contraintes techniques

- **SVG 100 % inline**, aucune requête externe nouvelle (CSP inchangée,
  vérifiable : zéro entrée réseau au chargement de l'écran). Construction
  DOM par `createElementNS` si généré en JS (cohérent avec le décor accueil
  existant js/app.js ~410), OU balisage statique dans index.html — au choix
  de l'implémenteur, du moment que c'est local et échappé.
- Aucun toponyme sur la carte-anneau (voulu : « sans le nom du monde »).
- Décor `aria-hidden="true"` ; la carte-anneau est décorative. Le contenu
  utile (titre ULTIMA, label e-mail, bouton) reste dans l'ordre de
  tabulation et lisible par lecteur d'écran.
- **Contraste ≥ 4,5:1** sur le formulaire (label, input, bouton) — mesuré
  sur capture dans le harnais.
- Responsive : plein écran mobile, formulaire centré, tap targets ≥ 44 px,
  pas de scroll horizontal. Le SVG `preserveAspectRatio` cadre proprement
  en portrait comme en paysage.
- Zéro dépendance nouvelle, zéro CDN, vanilla only.

## Vérification (harnais patrimoine — enrichir, jamais jeter)

Nouveau harnais `tests/smoke-connexion.mjs` (ou enrichir l'existant le plus
proche) prouvant :
1. Déconnecté (session nulle, config présente) → `#ecran-connexion` visible,
   cartouche « ULTIMA » présent, SVG décor présent, `#champ-email` focusable.
2. Le flux lien-magique fonctionne à l'identique : soumettre appelle bien le
   handler existant (stub `signInWithOtp`), toast « Lien … envoyé ».
3. Connecté (session simulée) → `#ecran-connexion` masqué, app visible.
4. Mode démo → PAS d'écran de connexion, carte visible.
5. Contraste formulaire ≥ 4,5:1 (mesuré sur capture).
6. Zéro requête réseau externe nouvelle à l'affichage de l'écran.
7. Non-régression : `bash tests/lancer.sh` — tous les harnais existants
   restent verts.

## Critères d'acceptation (verificateur, REFONTE-ARBRE §3-A1)

Déconnecté → écran connexion = carte sans toponyme avec cartouche ; flux
lien-magique inchangé (harnais) ; connecté → écran absent ; contraste ≥
4,5:1 ; zéro requête externe nouvelle ; non-régression smoke verte.
