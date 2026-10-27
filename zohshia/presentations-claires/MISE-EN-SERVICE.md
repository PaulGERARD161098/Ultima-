# Utiliser et réceptionner le socle

## 1. Avant livraison

- Une décision attendue, un public et une durée sont connus ou explicitement supposés.
- Chaque titre porte un message ; leur lecture seule raconte l'histoire.
- La marque du projet est fournie ; aucun logo, chiffre ou portrait de la référence n'est recopié.
- Chaque donnée importante a une source datée, un périmètre et une qualification.
- Chaque visuel explique le sujet ; une illustration générée est identifiable comme telle.
- Les pages sont rendues et inspectées ; les débordements sont corrigés sans réduction automatique du corps.
- Le moteur est vérifié sur une entrée valable et sur une entrée volontairement trop longue.
- L'édition native, la lecture PDF et l'envoi sont des capacités distinctes ; indiquer celles effectivement éprouvées.

## 2. Invocation et moyens

Manuel assisté : invoquer la compétence « présentations-claires » avec le public, la décision et les preuves. Lire `references/GRAMMAIRE.md`, puis adapter le storyboard au temps disponible. Réutiliser la capacité de présentation de l'environnement pour une présentation native.

Auto local : exécuter `python3 zohshia/presentations-claires/scripts/composer.py --brief zohshia/presentations-claires/assets/exemple.json --sortie /tmp/compositions-neuves`. Le dossier de sortie doit être neuf. Le rendu requiert le module de dessin PDF indiqué dans le script. Aucune API externe, aucun compte et aucun service permanent ne sont appelés.

Manuel : remplacer les textes fictifs dans une copie du brief placée hors du socle ; ne pas stocker les données clients dans le kit. Les fichiers SVG portent du texte et des objets éditables. Le PDF sert à la lecture et à la recette. L'export natif reste du ressort de la capacité de présentation disponible.

## 3. Recette et état réel

Auto : vérifier la génération des dix compositions ; les fichiers sont non vides et les entrées invalides sont refusées. Vérifier la publication du badge avec `node zohshia/publier.mjs --verifier`.

Manuel : inspecter les rendus et consigner les défauts corrigés. Chronométrer séparément la composition automatique et le travail complet à partir d'un vrai brief. Un temps de rendu n'est pas un temps de création de présentation.

La preuve détaillée est dans `outils/presentations-claires/RECETTE.md`, hors du socle neutre. La fusion exige l'accord lié à la version dans ce dépôt. La visibilité sur le site se vérifie après publication avec une session propriétaire ; elle n'est pas déduite d'une génération locale. Aucun envoi réel n'est autorisé par ce kit.
