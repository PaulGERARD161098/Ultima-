# Mettre en service la diligence documentaire

## 1. Avant livraison

La vérification suit les étapes ci-dessous, avec une preuve propre à chaque instance. Une liste cochée sans document ou sans scénario exécuté ne constitue pas une réception.

- Manuel : identifier le professionnel, le compte, le livrable, le destinataire et le mandat.
- Manuel : qualifier les sources autorisées et leurs dates ; distinguer fait, déclaration, hypothèse et inconnu.
- Manuel : adapter les critères et pondérations au métier ; ne pas copier les valeurs d'une autre instance.
- Auto : refuser les mélanges de comptes, poids invalides, identifiants dupliqués et montants incohérents.
- Auto : dédoublonner les chantiers et classer les correspondances documentées.
- Manuel : vérifier les différences techniques, le périmètre et les conditions avant toute comparaison de prix.
- Auto : séparer le document client de la note professionnelle et conserver les contrôles du moteur métier.
- Manuel : autoriser explicitement l'envoi de la version contrôlée ; conserver son résultat avant tout rejeu.

## 2. Extraction et raccord

Le manifeste décrit un commit du dépôt de référence et les empreintes des deux fichiers neutres. Depuis un clone local contenant ce commit : `node zohshia/diligence-correspondance/collecter.mjs --depot <clone>` vérifie la source sans appeler de service externe. `--sortie <dossier-neuf>` extrait uniquement ces fichiers. Aucune extraction de base ou de donnée professionnelle.

Le raccord reçoit des caractéristiques structurées et des localisateurs de preuves, jamais une décision libre du modèle présentée comme une preuve. La fonction de classement est pure ; elle ne lit aucun compte. L'appelant serveur conserve la responsabilité de filtrer les sources avant l'appel et d'en vérifier le contenu. Les résultats peuvent être réutilisés par plusieurs agents uniquement après leur propre intégration et recette.

## 3. Recette et limites

Éprouver : scénario valide, valeur inconnue, preuve absente, aucun comparable utile, versions du même chantier, mélange de comptes, modification de note après aperçu, montant altéré, source absente, document non chiffré et tentative d'envoi sans mandat. Un scénario sauté ne passe pas. Le test structurel ne prouve pas une source vraie ou un accès de production.

Le badge est publié par le mécanisme existant ; il décrit un socle préparé, sans agent permanent activé. Le présent guide n'autorise aucune dépense, migration, fusion, publication de données professionnelles ou envoi réel.
