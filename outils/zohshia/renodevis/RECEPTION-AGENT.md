# Raccords de l'agent à recevoir avant implantation — 27/10/2026

Audit de lecture, hors de la technologie pure : ce document nomme les dépendances à retirer, jamais des données à copier. Source applicative : `RenoDevis@d4a3ff531d28e82c6f651e1752666a2370e6e42b`. Contrat et guide : `Ultima-@6060d262376627690925926335a8f9f1824b4c56`. Les constatations portent sur ces versions ; aucune ouverture de compte ou nouvelle infrastructure n'a été exécutée.

Résultat attendu : un autre professionnel, avec sa propre banque et ses règles, dicte un chantier, valide la synthèse et reçoit son PDF ; les mêmes opérations restent refusées depuis un compte étranger. La voie A évite l'extraction, mais ne rend pas disponibles des fonctions encore conditionnées à l'identité du pilote. La voie B ajoute extraction et base neuve reçues sur le même commit.

| Capacité | Constat dans le code lu | À fournir/raccorder | Preuve exigée |
|---|---|---|---|
| Banque et droits | `creationRenoServeur.ts` : `artisanSansClient`, `chargerBanqueArtisanReno`, lecture par `artisan_id` ; règles génériques validées, branche `verifierReglesArtisan` spécialisée | Banque et règles propres au nouveau compte, droits et révision | Ses prix/règles lus ; banque étrangère et révision changée refusées |
| Synthèse avant recherche | `whatsappAgent.ts` : entrée neuve et reprise de compréhension conditionnées à `ARTISAN_SOLA` ; `parcoursEstimation` seul ne généralise pas ce parcours | Capacité explicite du compte, sans étendre les droits par remplacement de l'identifiant | Compte fictif distinct : aucune recherche avant accord, correction fidèle conservée |
| Calcul commercial | `creationRenoServeur.ts`, `creationReno.ts` : formule/version, gabarits et traitement d'apport encore spécialisés | Stratégie de calcul choisie et validée, unités, forfaits, arrondis et réserves ; aucun prix/régime du pilote par défaut | Calcul direct et contrôle inverse avec les entrées du nouveau professionnel ; ancien compte inchangé |
| Propositions et prix indicatifs | `creationRenoServeur.ts` : trois simulations complètes ; `prixUnitaireIndicatifSola` pour les propositions uniques suivantes | Réutiliser les choix/signatures génériques, raccorder le prix indicatif à la stratégie du compte | Choix multiples non départagés par rang ; prix absent non inventé ; groupe périmé refusé |
| Sources techniques | `compatibiliteDocumentee.ts` contient un jeu de faits fabricant explicitement limité ; `banques_reno` ne suffit pas à créer une nouvelle preuve de compatibilité | Documents datés du pro, références/pages, faits validés et périmètre | Combinaison exacte acceptée ; document absent, autre gamme ou quantité incompatible gardent une réserve |
| PDF dans le canal | `documentWhatsApp.ts` : `appartient` exige `ARTISAN_SOLA` et `recette_whatsapp`, noms/mentions et métadonnées spécialisés ; assemblage `whatsappCanal.ts` recontrôle banque, apport et version | Adaptateur documentaire du compte, distinction estimation/devis final et identité ; garder les contrôles propriétaire/version | PDF du nouveau compte reçu ; mauvais propriétaire, document périmé et droits insuffisants refusés ; absence de nom du pilote |
| Livraison et exploitation | File persistante, marque `envoi_incertain`, contrôle d'arrêt existent ; le rapprochement opérateur n'a pas d'interface dédiée reçue | Canal et accès propres, limites, opérateur, procédure de rapprochement et rétention | Arrêt effectif ; panne/issue inconnue sans renvoi automatique ; autre compte continue |
| Instance indépendante | `outils/zohshia/renodevis/neutre/BASE` distant : `f1f9fb30fc03709106aa754d46524c0c3d778ef0` ; la série n'est pas à la tête applicative auditée | Rafraîchir la série après démêlage, puis extraction et base conformes au même état | `extraire.mjs --verifier` et `base/rejouer.mjs` sur dépôt complet et environnement jetable ; pas de preuve tirée du snapshot partiel |

## Ordre de réception

1. Choisir le périmètre et la voie, puis remplir le dossier privé décrit dans `zohshia/renodevis/AJOUTER-UN-ARTISAN.md` §1.9. Réutiliser ses pièces ; une seule liste des informations manquantes.
2. Raccorder les capacités effectivement demandées, avec refus explicite si une donnée ou un adaptateur manque. Ne pas demander paiement, relances, clients historiques ou domaine de mail pour un agent qui n'en a pas besoin.
3. Rejouer sur deux comptes fictifs distincts : parcours neuf, correction, références ambiguës, prix périmés, PDF ancien, panne de livraison, accès étranger. Distinguer sorties simulées et réception réelle.
4. Pour la voie B uniquement, recevoir code neutre et base neuve avant de préparer la nouvelle instance.
5. Comparer deux agents sur le même jeu d'entrées et de sources, sans donner le résultat attendu à l'un d'eux. Chronométrer le canal réel jusqu'au PDF complet et conserver les preuves de la version reçue.

État : **audit des raccords réalisé ; adaptations et implantation non reçues**. La CI structurelle du stock prouve la publication du contrat, pas la portabilité du parcours. Les 32 conflits / 25 fichiers spécialisés consignés au 10/10 restent historiques : ils n'ont pas été remesurés ici. Aucun transfert du catalogue, des règles, des secrets ou des identifiants réels du pilote vers un autre compte.

## Réception de source et conditions de passage au réel — 27/10/2026

CI complète de cette branche (`85fe59ed17c4e287ef697490f5535573e1789544`) : `40478803749` success ; contrôles Léo `40478803589` et `40478803500` success. Cela ferme la vérification de la branche documentaire, pas celle d'une implantation.

La source du projet Claude annoncé comme socle neutre n'est pas accessible via les outils de cette session. Deux recherches de fichiers n'ont rien résolu et le contexte personnel est indisponible ; cela ne prouve pas que ce projet n'existe pas. Avant adaptation, obtenir le code/contrat exact et sa version, réutiliser les tests existants, puis vérifier les raccords et la persistance. Ne pas annoncer une réception à partir du nombre historique de tests, ni reconstruire silencieusement un second socle.

Contrôle inverse depuis l'exploitation : une prévisualisation correcte et un budget historiquement configuré ne suffisent pas. Vérifier la version réellement servie par le point d'entrée du canal, l'échéance du canal ET celle du budget, le rattachement réellement employé par les messages, les réservations conservées, l'absence de réponses d'issue inconnue à rapprocher et l'arrêt effectif en fin de fenêtre. Les mesures propres au pilote restent dans son dépôt ; aucune valeur de son compte ne devient une configuration par défaut ici.
