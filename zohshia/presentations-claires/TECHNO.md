# Présentations claires — socle réutilisable

## 1. Résultat et périmètre

Transformer un brief en présentation claire, sobre et vérifiable, avec un titre-message par page, une composition adaptée et des visuels qui expliquent. Le bénéfice commercial est indirect : préparer plus vite un rendez-vous, une proposition ou un pitch crédible. Aucun gain de conversion n'est établi.

Le socle comporte six compétences coordonnées : narration et synthèse ; direction artistique ; composition et typographie ; conception de visuels ; représentation des preuves et données ; recette éditoriale et visuelle. Une compétence de conduite les applique ensemble ; six agents distincts ne sont pas nécessaires.

Les règles complètes vivent dans `references/GRAMMAIRE.md`, les dix compositions dans `assets/exemple.json`, les variables graphiques dans `assets/theme.json`, le moteur dans `scripts/composer.py`. La compétence de conduite est `.claude/skills/presentations-claires/SKILL.md`. La provenance et l'analyse du document de référence restent hors du socle neutre, dans `outils/presentations-claires/ANALYSE.md`.

## 2. Entrées et sorties

Entrées : public, décision attendue, durée, objectif, preuves disponibles, identité visuelle et contraintes de diffusion. Demander seulement les manques qui changent réellement le résultat. Préserver les informations connues et marquer les inconnues.

Sorties : synopsis, storyboard, présentation via la capacité d'édition disponible, export de lecture, contrôle qualité et sources. Le moteur local de ce kit produit un PDF de composition et des pages SVG éditables ; il ne produit pas de présentation native ni de fichier de diapositives natif. Utiliser la compétence de présentation de l'environnement pour une livraison native.

## 3. Parcours rapide

1. Manuel assisté : préciser la décision et sélectionner les seules preuves utiles.
2. Manuel assisté : écrire les titres comme une histoire lisible sans les corps de texte.
3. Auto : repartir des compositions et des variables communes ; ne pas reconstruire la grille.
4. Manuel assisté : créer ou sélectionner les visuels, puis les adapter à la marque du projet.
5. Auto puis manuel : contrôler les débordements, les données et les rendus page par page.
6. Manuel : relire comme destinataire et livrer avec les limites ; tout envoi exige son mandat.

## 4. Choix de moyen

Le kit local ne demande ni abonnement supplémentaire, ni service permanent. Le coût de génération d'images dépend de l'outil utilisé et doit être vérifié au moment de l'usage. Le temps complet reste à mesurer sur un vrai brief.

| Voie | Simplicité et rapidité | Coût et pertinence |
|---|---|---|
| Socle versionné et capacité de présentation disponible | Réutilise la grille et les consignes ; conserve l'édition native lorsque disponible | Pas de nouvelle interface à maintenir ; compromis retenu |
| Reconstruction de chaque présentation | Répète les décisions de composition | Effort récurrent ; garder pour une direction artistique différente |
| Application dédiée de génération | Intégration et maintenance supplémentaires | Non justifiée pour ce besoin ; ne pas la construire dans cette boucle |

## 5. Garde-fous et preuve

Ne pas reprendre les chiffres, logos, portraits, captures ou données d'une autre organisation. Les exemples sont explicitement fictifs. Une image décorative ne devient pas une preuve produit. Une projection ne devient pas un résultat. La beauté d'un support ne valide pas ses affirmations.

Le moteur refuse une composition inconnue, un champ inattendu, une entrée vide, du texte trop long ou un débordement mesuré. Il conserve une taille lisible au lieu de réduire automatiquement les caractères. Les sorties existantes sont refusées ; utiliser un dossier neuf.

Le badge expose la méthode et sa recette au même endroit que les autres technologies. Le moteur est un outil local, pas un bouton de génération dans l'écran. Présence dans le dépôt, publication générée et affichage réel sont trois états à distinguer.
