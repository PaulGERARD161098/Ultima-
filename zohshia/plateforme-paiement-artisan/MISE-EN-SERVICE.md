# Mise en service — paiement artisan

## 1. Contrat du professionnel

Identifier le vendeur contractuel, le bénéficiaire légal des fonds, le titulaire bancaire et la personne habilitée à accepter les conditions. Définir l'acompte, l'assiette de commission HT ou TTC, sa TVA, sa date d'exigibilité, les remboursements et le traitement des règlements hors circuit.

Faire confirmer ces règles dans l'instance. Aucune donnée du professionnel ne doit être copiée dans cette techno neutre.

## 2. Moyen et coût

Choisir virement direct ou plateforme. En mode direct, préciser qui constate la réception et comment la commission est réglée. En mode plateforme, obtenir le tarif complet, vérifier les capacités et les comptes autorisés, puis isoler test et production.

Vérifier que le cockpit hôte existe et que les états inconnus, désynchronisés et bloqués sont visibles. Une maquette de cockpit ne vaut pas contrôle utilisable.

## 3. Recette isolée

Lancer `node --test zohshia/plateforme-paiement-artisan/moteur.test.mjs`. Puis éprouver l'adaptateur choisi en environnement fournisseur d'essai : signature documentaire, acompte, commission, solde, double clic, interruption réseau, même notification reçue deux fois, faux reçu, autre professionnel, changement de bénéficiaire, montant partiel, remboursement et contestation.

Comparer les montants attendus, reçus par le fournisseur et enregistrés dans l'application. Une demande acceptée ou un retour navigateur ne prouve pas que l'argent est reçu. L'échec d'une lecture empêche une nouvelle instruction automatique.

## 4. Activation et reprise

Avant le réel, réunir compte fournisseur vérifié, titulaire bancaire confirmé, contrat commercial, permissions, preuve de recette, accord précis de bascule et contrôle des coûts. Aucun envoi, dépense, migration ou transaction réelle n'est autorisé par ce document.

Activer un seul professionnel d'abord. Conserver la version de configuration et les références de chaque tentative. Prévoir l'arrêt des nouvelles demandes sans supprimer les paiements en cours, la réconciliation des notifications tardives et une reprise manuelle traçable. La recette réelle et le premier versement bancaire restent à recevoir après raccordement.
