---
name: creation-visuelle
description: Créer des visuels et des animations pour Ultima et les offres de Paul sans outil payant par défaut — dessin programmé en Python (gravure, encre, aquarelle, 83 styles, sans modèle d'image), motion graphics dans le navigateur (HTML/CSS/GSAP : opener, promo, typographie animée, vidéo explicative 16:9 ou 9:16), et scénarisation de vidéo explicative façon Vox. Déclencher sur « dessine », « illustre », « une gravure de… », « anime ce titre », « vidéo promo », « vidéo explicative », « intro animée ».
---

# Création visuelle — pour Léo

Trois procédés rangés sous `references/`, ouverts à la demande. Registre
d'Ultima à respecter (CLAUDE.md, « antique et sérieux ») : gravure à l'encre,
parchemin, cartouches — jamais au détriment de la lisibilité.

| Besoin | Procédé | Coût |
|---|---|---|
| Illustration fixe ou dessin « qui se fait » (gravure, encre, eau-forte, aquarelle, plan…) | `dessin-code/GUIDE.md` (en chinois : le lire, répondre en français) + `lib/` (un module par style) + `exemples/` | gratuit, local : `numpy` + `Pillow` |
| Animation, opener, promo, typographie animée, vidéo explicative en HTML | `motion/GUIDE.md` (en indonésien) + `references/` + gabarits `assets/starter-*.html` ; capture d'images `scripts/snap.mjs`, `scripts/export-frames.mjs` (Playwright préinstallé) | gratuit, local : GSAP est gratuit depuis son rachat par Webflow (licence propre, non libre) |
| Scénario d'une vidéo explicative (structure, rythme, voix, style Vox) | `video-explicative/references/vox-style-guide.md` | gratuit |
| Production complète de la vidéo (images, animation, voix, musique) | `video-explicative/GUIDE.md` + `references/atlas-cloud-api.md` | **payant** : Atlas Cloud, ≈ 3 à 8 $ par film d'une minute → clé + nouvelle dépense = **gate de Paul** |

## Règles
- **Éprouvé le 28/11/2026** sur accord de Paul : un tournesol et une panthère
  en linogravure (`lib/linocut.py`), scripts écrits dans un dossier temporaire,
  `sys.path` vers `lib/`, lancés avec `python3 -I`, jamais depuis le dépôt ;
  aucun appel réseau dans `lib/` (balayage du 28/11). Piège rencontré :
  `hatch(density=…)` attend une fonction `(x, y) → 0..1`, pas un nombre.
  Ordre utile : tailler le fond d'abord, laisser le sujet debout ensuite.
  **Verdict de Paul (28/11)** : tournesol validé, panthère jugée « horrible ».
  Le dessin programmé convient aux plantes, paysages, motifs, ornements et
  cartouches ; **pas aux animaux ni aux personnages** — pour ceux-là, proposer
  une image générée (Canva déjà raccordé, ou l'API image du cadrage
  avant/après, gate dépense) au lieu de dessiner à la main.
- Les images et vidéos produites ne vont **pas** dans le dépôt sauf décision
  (poids, coût de build) : dossier temporaire, puis Drive ou Canva.
- Aucun visuel ne représente une personne réelle, une marque tierce ou un
  chantier comme s'il était réel ; une vidéo commerciale ne promet que ce qui se
  promet (`marketing-vente`).
- Le passage par After Effects ou Higgsfield (`motion/references/ae-bridge-higgsfield.md`,
  scripts non copiés) est hors périmètre : logiciel et service payants.
- Pour une maquette d'écran, `frontend-design` et `theme-factory` priment ;
  pour une image IA d'une vraie photo (avant/après), voir
  `CADRAGE-2026-11-28-images-avant-apres.md`.

## Sources (licences MIT conservées dans chaque dossier)
`cloveric/claude-drawing-skill` @ `6af36dc717b6` (bibliothèque `lib/`, 4
exemples ; les 156 Mo d'images d'exemple non copiés) · `bangtutorial/bang-motion`
@ `c1aa65e921c9` v1.19.0 (sans les scripts After Effects) ·
`CK42BB/vox-explainer-skill` @ `7003225dc3ed`. Récupérés le 28/11/2026 sur
demande de Paul.
