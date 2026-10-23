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
