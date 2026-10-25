---
name: presentations-claires
description: Créer une présentation professionnelle, un pitch ou des slides très clairs et épurés à partir d'un brief, avec narration, compositions réutilisables, visuels explicatifs, preuves sourcées et recette. Utiliser pour une nouvelle présentation de Paul ou pour appliquer son modèle visuel ; adapter le contenu et la marque à chaque projet.
---

# Présentations claires

## Résultat attendu

Produire un support qui permet une décision, avec une histoire lisible dans ses titres, un système graphique sobre et des visuels qui expliquent. Mobiliser ensemble six capacités : synthèse et narration ; direction artistique ; composition ; conception des visuels ; représentation des preuves ; recette visuelle et éditoriale.

## Résoudre les ressources

Dans le dépôt Ultima, utiliser le socle canonique `zohshia/presentations-claires/` depuis la racine du dépôt. Dans la compétence personnelle, utiliser `references/GRAMMAIRE.md`, `assets/theme.json`, `assets/exemple.json` et `scripts/composer.py` sous le dossier de cette compétence. Lire `references/PROVENANCE.md` si présent pour connaître la version embarquée. Ne pas prétendre qu'une copie est synchronisée avec une version distante sans comparer.

Lire la grammaire avant de composer. Charger aussi la compétence de présentation de l'environnement pour choisir le support natif et ses outils. Le moteur local sert de preuve de composition et de point de départ PDF/SVG ; il ne remplace pas un export natif.

## Charger les compétences complémentaires

Dans Ultima, charger les modules locaux selon le besoin :
- `.claude/skills/composition-editoriale/SKILL.md` : direction artistique, images explicatives et finition de la couverture.
- `.claude/skills/pitch-source/SKILL.md` : narration, preuves, objections et décision finale.
- `.claude/skills/theme-factory/SKILL.md` : variables de thème et cohérence, déjà présentes ; conserver la référence validée sans rouvrir le menu de thèmes.
- `.claude/skills/frontend-design/SKILL.md` : principes de hiérarchie et de précision, seulement pour les supports HTML ou les maquettes concernés ; ne pas changer le format du livrable.

Les deux nouveaux modules sont adaptés de sources GitHub épinglées, avec licences et `sources.lock.json`. Leur périmètre est documentaire ; aucun moteur, police ou service externe amont n'est installé. La liste et la provenance vivent dans `outils/presentations-claires/SOURCES-GITHUB.md`.

Dans ChatGPT sans accès à ces fichiers, lire les modules avec le connecteur GitHub sur la branche de livraison indiquée par le projet. Ne pas les déclarer installés dans les compétences personnelles ou éprouvés sur la machine avant une sauvegarde et une exécution réelles.

## Préparer sans répéter les questions

1. Réutiliser le contexte connu. Identifier public, décision, durée, marque, sources et diffusion. Demander seulement les informations indispensables manquantes. Si le destinataire et le but restent inconnus, préparer une trame explicitement hypothétique.
2. Distinguer support projeté et support envoyé. Choisir les pages qui servent la décision ; ne pas reproduire un nombre de pages fixe.
3. Écrire d'abord le synopsis et les titres-message. Lire les titres seuls comme un raisonnement. Préserver le vocabulaire du métier et retirer les superlatifs sans preuve.
4. Pour chaque page, noter message, preuve, composition et visuel. Employer la grille commune ; varier les compositions selon le sens.

## Créer les visuels et la présentation

Choisir une photo réelle pour une équipe ou un événement, une capture réelle pour un produit existant, un schéma éditable pour un mécanisme précis, une image générée pour une métaphore désignée comme telle. Ne pas attribuer à une image de référence un mode de production non démontré.

Utiliser l'outil de génération d'images disponible lorsque l'illustration en bénéficie. Définir sujet du métier, transformation à montrer, cadrage, matière, lumière, palette et espace pour le texte. Garder titres et chiffres en objets éditables, hors de l'image. Voir les prompts de la grammaire. Ne pas réutiliser automatiquement les illustrations vectorielles de démonstration sur toutes les pages d'un vrai pitch.

Adapter les couleurs à la marque du projet en conservant contraste, blancs et hiérarchie. Les valeurs du thème sont modifiables. Ne pas recopier logos, portraits, chiffres, clients ou captures d'une autre organisation.

Pour une composition locale : copier `assets/exemple.json` hors de la compétence, remplacer les données fictives, puis exécuter `python3 scripts/composer.py --brief /chemin/brief.json --sortie /chemin/dossier-neuf` depuis le dossier des ressources. Le moteur exige Python, reportlab et les polices système explicitement indiquées ; aucun appel réseau. Si l'outil manque, utiliser la capacité de présentation disponible, en conservant la grille ; ne pas annoncer la génération locale comme réussie.

Pour une livraison native, suivre les instructions de la compétence de présentation. Le PDF ne prouve pas l'édition native ; les SVG du moteur conservent texte et objets vectoriels éditables.

## Réceptionner avant de livrer

- Lecteur : vérifier que la décision et le message de chaque page sont compris.
- Opérateur : vérifier que le support se régénère à partir du brief et des ressources.
- Contradicteur : chercher une promesse sans preuve, une unité trompeuse ou un statut trop favorable.
- Pour les chiffres, conserver source, date, périmètre et qualification : mesuré, déclaré, hypothèse ou non vérifié. Distinguer pipeline, signé et encaissé.
- Rendre et inspecter toutes les pages et le montage global. Vérifier lisibilité, alignements, marges, contraste, crops, glyphes et recouvrements. Corriger et rendre à nouveau les pages affectées.
- Réduire le texte ou scinder la page avant de réduire la police. Le moteur refuse les débordements et ne corrige pas le fond.
- Chronométrer séparément la composition automatique et le travail complet. Ne pas promettre une durée totale non mesurée.

Livrer le support, ses sources et les limites matérielles. Une compétence enregistrée, un badge publié, une présentation générée et un envoi réel sont des états distincts. Respecter les autorisations du projet pour fusion, publication et envoi.

