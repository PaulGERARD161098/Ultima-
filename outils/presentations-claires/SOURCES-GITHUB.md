# Compétences GitHub — présentations claires — 25/10/2026

## Mandat et destination

Paul demande d'implanter depuis GitHub les compétences nécessaires à un rendu de présentation professionnel. Le socle déjà préparé dans la PR #420 est conservé. L'intégration est faite dans les compétences du dépôt Ultima sur la même branche, sans fusion ni modification des compétences personnelles déjà sauvegardées.

## Sélection et provenance

| Module | Source | Licence | Rôle et état |
|---|---|---|---|
| composition-editoriale | anthropics/skills, canvas-design, dbd4588f9e1033efb41dad4bef2f7947c8993d44 | Apache-2.0 | Adaptation française, direction artistique et images explicatives |
| pitch-source | SlideSpeak/slide-design-skill, pitch et consulting, 5e87d8ae71f6306e0c88f4910e6c09114581d91b | MIT | Adaptation française, titres-message, preuves et récit |
| theme-factory | Déjà présent dans Ultima | Licence locale conservée | Réutilisé ; aucun nouvel import ni changement de thème automatique |
| frontend-design | Déjà présent dans Ultima | Licence locale conservée | Réutilisé uniquement lorsque le format HTML ou une maquette le justifie |

Les fichiers modifiés portent un avis d'adaptation, le copyright et la licence ; les sources sont épinglées par commit. Aucun binaire, moteur ou police amont n'est redistribué. Les notices tierces du dépôt artistique ont été examinées ; les composants multimédias et leurs bibliothèques ne sont pas importés.

## Choix de moyen

Réutiliser les deux compétences existantes et ajouter deux petits modules d'instructions évite un moteur parallèle, une nouvelle interface, un service d'images externe et des dépendances à maintenir. Les instructions issues de canvas-design sont recentrées sur l'information et la référence choisie, sans imposer un manifeste artistique, des polices absentes ou une sortie limitée à un poster.

Les modèles pitch/consulting sont adaptés plutôt qu'installés avec leur moteur HTML. Leur palette et leur style ne remplacent pas la référence Hémicycle. Les exemples de chiffres ne sont pas repris ; les graphiques exacts restent déterministes. Aucune clé FAL ni compte tiers n'est nécessaire.

Le dépôt openai/skills se déclare désormais obsolète et renvoie vers openai/plugins : aucun import aveugle de l'ancien catalogue. Le module PPTX d'anthropics/skills comporte des conditions qui interdisent sa copie externe : il n'est pas importé. Les workflows actuels creative-production et design-qa dépendent de leur application et portent un autre périmètre ; ils ne sont pas installés comme de fausses capacités autonomes.

## Vérifications et limites

Les sources et licences ont été lues aux versions indiquées. Contrôles structurels : noms et descriptions des deux compétences, quatre fichiers par module, licences conservées, sources.lock valides, références de l'orchestrateur présentes. Aucun script amont exécuté.

L'environnement de calcul est indisponible dans cette passe. Aucun init_skill.py, quick_validate.py, rendu ou essai d'application des deux nouveaux modules n'a donc été exécuté. L'ajout documentaire dans le dépôt ne prouve pas leur chargement dans ChatGPT, leur présence dans les compétences personnelles, ni un rendu professionnel obtenu.

À la reprise avec l'environnement disponible : valider les compétences, les sauvegarder dans l'espace personnel si souhaité dans ce périmètre, puis produire et inspecter couverture, page de preuve et page produit avec les visuels propres au vrai projet. Mesurer le résultat, pas le nombre de compétences installées.

Les fichiers de publication ZOH et les règles d'accès ne sont pas modifiés par ce complément : le badge existant pointe déjà vers la compétence de conduite qui charge les nouveaux modules. Visibilité après fusion et chargement réel à vérifier séparément.
