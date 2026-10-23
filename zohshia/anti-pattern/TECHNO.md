# Anti-pattern — approches croisées

## 1. Résultat et rétrocadrage

Toujours aborder un même sujet par au moins deux approches réellement différentes. Partir du résultat utile attendu, définir sa preuve de réussite, puis remonter aux données, hypothèses et étapes nécessaires. Chercher ce qui pourrait invalider la conclusion. Appliquer au minimum 2 points de vue pour tout sujet, 3 pour une tâche complexe et 4 pour un plan ou rétroplanning. Le seuil le plus élevé s'applique si les catégories se cumulent. Une tâche à dépendances multiples, forte incertitude, plusieurs composants ou conséquences matérielles est complexe. Garder les angles brefs pour une petite tâche.

La méthode s'applique aux calculs, diagnostics, décisions et méthodes de travail. Elle prévient les automatismes, les erreurs de dénominateur, les validations circulaires et les tentatives répétées sans information nouvelle. Elle ne remplace pas les règles métier.

## 2. Deux approches et leurs dépendances

Calcul : détail depuis les entrées puis contrôle inverse, conservation, ordre de grandeur ou rapprochement à une référence distincte. Travail : chemin depuis les moyens puis chemin remonté depuis la preuve attendue. Diagnostic : hypothèse principale puis cause concurrente et observation qui les départage. Livraison : parcours normal puis échec ou limite pertinente en environnement isolé.

Préciser ce qui change entre les approches : raisonnement, source ou observation. Une reformulation, un autre outil ou un autre modèle exécutant la même méthode ne suffit pas. Nommer les hypothèses communes : un contrôle inverse ne prouve ni le bon tarif ni la bonne convention métier. Pour un plan ou rétroplanning, examiner quatre angles par défaut : résultat et utilisateur ; exécution et moyens ; calendrier et dépendances ; risques, échecs et marges de manœuvre. Adapter les angles sans réduire le minimum.

## 3. Calculs et écarts

Définir grandeur, dénominateur, unités, période, base hors taxes ou toutes taxes comprises, formule autorisée, provenance et arrondis avant calcul. Définir la tolérance avant comparaison, la justifier et ne pas la desserrer après résultat. Ne stocker ici aucune formule ou valeur propre à un professionnel.

Comparer les résultats et leurs hypothèses. Ne pas moyenner des réponses incompatibles ni faire voter les outils. Résoudre la cause de l'écart puis refaire les contrôles affectés. Suspendre seulement la conclusion ou l'action dépendante ; poursuivre le travail indépendant autorisé. Une deuxième tentative sans information nouvelle exige un changement d'hypothèse ou de méthode.

## 4. Contrat réutilisable et limites

Le dossier de preuve précise typeSujet (tache, plan ou retroplanning) et complexe (booléen), puis décrit le résultat, le critère, les approches, leurs dépendances communes, les observations sourcées, l'écart, sa résolution et les limites. Le collecteur collecter.mjs vérifie seulement sa structure et ses déclarations ; il ne vérifie pas la vérité des sources, l'indépendance réelle du raisonnement ou la justesse métier. Un résultat structurel favorable ne constitue pas une validation du calcul ou du produit.

La fiche et son badge utilisent le mécanisme de publication existant. Aucun moteur métier, service, base, compte ou dépense supplémentaire. Les preuves propres à une instance restent dans son dossier privé, hors de cette technologie neutre. La compétence de travail applique le protocole ; le présent contrat décrit sa version réutilisable sans donnée client.

## 5. Bibliothèque de 100 points de vue

La bibliothèque points-de-vue.json contient 100 fiches identifiées de PDV-001 à PDV-100, avec alias, question directrice, preuve à chercher et limite. Dix familles : usagers, commerce, économie, preuves, causalité, systèmes, calendrier, risques, décisions et collectif. L'index BIBLIOTHEQUE.md sert à choisir sans charger les cent fiches.

Invoquer un identifiant ou alias avec bibliotheque.py --id PDV-021 ; rechercher avec --search calendrier ; sélectionner avec --pack plan ou --pack retroplanning. Les packs fournissent des points de départ conformes aux minima 2/3/4, à adapter au sujet. Une sélection ne constitue pas une analyse exécutée. Les cent fiches sont des guides, sans expertise autonome ni certitude garantie.

La recherche publique et les rapprochements conceptuels sont documentés dans sources-pdv.md. Les fiches françaises sont une synthèse originale : aucun installateur ni code tiers n'est exécuté ou embarqué. La copie distribuée dans la compétence de travail conserve exactement le même catalogue JSON ; comparer les empreintes lors d'une mise à jour. Les sources et le catalogue restent exclus du déploiement statique par le dossier privé existant.

## 6. Invocation par l'interlocutrice de pilotage

L'interlocutrice choisit les angles selon le résultat recherché, les contraintes et les incertitudes, puis applique leurs questions et confronte les constats. Les angles demandés sont respectés ; une analyse globale est complétée jusqu'au minimum 2/3/4. Une invocation isolée reste possible sans prétendre couvrir toute la méthode. Les packs sont adaptés à l'idée ou au plan, sans sélection aveugle par mots-clés.

Le lecteur local donne les fiches détaillées dans un environnement autorisé. Pour une conversation qui ne peut pas lire le dépôt, publier-leo.mjs génère un index compact de 100 IDs, alias et questions pour le prompt serveur. Ce module est une projection du même catalogue, liée par empreinte ; le contrôle --verifier refuse une version périmée. Mettre à jour cette projection lors d'un changement du catalogue. Elle ne crée aucun outil, accès externe ou exécution autonome ; une preuve absente reste non vérifiée.

## 7. Grille de contre-épreuve d'un projet calculé et sauvegardé

Réutiliser trois angles : utilisateur qui édite pendant une requête ; serveur confronté à une entrée forgée ; calcul contrôlé par ses dépendances et sa décomposition. Adapter les cas au risque. Cette grille guide une recette ; sa présence ne prouve pas son exécution.

| Risque | Contre-épreuve | Preuve attendue |
|---|---|---|
| Résultat ou champ protégé fourni par le client | Modifier directement la requête, sans passer par l'interface | Refus avant écriture ou reconstruction serveur ; identité et révision contrôlées séparément |
| Saisie perdue pendant une sauvegarde ou un calcul | Retarder la réponse, éditer à nouveau, puis laisser arriver la réponse ancienne | Dernière saisie conservée, révision de base actualisée et état encore modifié si nécessaire |
| Diagnostic ou export périmé | Modifier séparément chaque entrée thermique, sa provenance, puis besoins et montants | Empreinte couvrant les dépendances effectives ; résultat périmé ou appréciation reconstruite selon son contrat ; version du moteur identifiable |
| Valeur absente assimilée à zéro | Comparer absent, inconnu et zéro explicite | Calcul partiel et donnée manquante visibles ; total complet seulement quand les entrées nécessaires sont connues |
| Poste énergétique compté deux fois | Décomposer l'existant et la cible par usage avant de totaliser | Chaque consommation comptée une seule fois ; hypothèses d'eau chaude et de chauffage explicites |
| Tests verts trop faibles | Exécuter la régression sur l'ancienne version dans une copie isolée | Échec pour le défaut visé, puis réussite sur le correctif ; un échec d'environnement ne vaut pas détection du défaut |

## 8. Portée des preuves et arrêt de séance

Une preuve porte date, version et environnement. Distinguer code préparé, tests locaux, contrôle continu, préversion disponible, recette utilisateur et publication effective. Pour une évolution de base : migration préparée, simulation exécutée, simulation réussie et application effective sont quatre états distincts. Une base simulée ne valide pas une base réelle ; un contrôle continu vert ne prouve ni une migration appliquée ni un parcours utilisateur validé. Qualifier aussi la relecture : une passe du même auteur n'est pas une revue indépendante.

Avant de compiler, identifier les sorties réseau des extensions de construction, même si la télémétrie du framework est désactivée. L'absence de configuration d'exécution ne prouve pas l'absence de télémétrie de compilation. Un refus de la plateforme arrête l'action concernée : ne pas contourner, poursuivre les vérifications indépendantes autorisées et nommer la couverture manquante.

À l'arrêt demandé, clôturer le périmètre réellement prouvé et reporter nommément les validations restantes. Ne pas transformer une correction terminée en produit entièrement validé. Les incidents et leurs preuves restent dans le fichier canonique des leçons, hors de la technologie neutre ; cette grille n'active aucun contrôle permanent et n'élargit aucun droit.

