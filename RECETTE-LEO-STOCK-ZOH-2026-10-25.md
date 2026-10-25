# Léo — stock ZOH au démarrage des projets

## Résultat visé

Mandats du 25/10/2026 : consulter les technos ZOH au démarrage d'un projet ; terminer le raccord et le comportement avant toute décision de fusion. La compétence personnelle Léo LV1 v1.7 est sauvegardée séparément (0cf57e4, matérialisation 016b707). Le présent lot concerne le cartouche d'Ultima.

Résultat : repérer les briques candidates, justifier réemploi/adaptation/création et préciser les guides, données, raccords et preuves manquants. Les fiches ne sont ni des services activés ni des droits supplémentaires. Le bénéfice commercial est indirect : éviter de reconstruire l'existant ; aucun temps ou revenu gagné n'est mesuré.

## Moyens et périmètre

Le système existant reçoit une projection du catalogue `api/_lib/zohshia-technos.mjs`, sans catalogue parallèle ni nouveau service. Nom, état déclaré, titres et lien sont complétés par les deux premiers paragraphes descriptifs de la fiche (900 caractères maximum par technologie). L'aperçu tronqué et l'absence d'aperçu sont explicites. La projection actuelle mesure 3 827 caractères, sous le plafond de 7 000. Le coût marginal en tokens n'est pas mesuré ; aucun appel réseau ou modèle supplémentaire n'est ajouté.

Le prompt compare les capacités au besoin, rend l'adéquation conditionnelle à la lecture des guides et distingue l'état déclaré de la disponibilité dans le nouveau projet. Le cartouche peut orienter ; il ne dispose pas d'un exécuteur des technos. La date publiée n'est pas une mesure en direct. Une couverture indisponible ou partielle ne devient pas un stock déclaré vide.

Les règles d'interaction et le suivi durable de Léo livrés dans main 1e8af7c7b2094ed1d769b5a7dfd8e214b4c1c07e sont conservés. Aucun changement d'authentification, plafond, outil, migration ou contrôle privé. Aucune donnée d'un client ou d'un professionnel transférée. Risques ciblés : sélection par nom seul, catalogue falsifié depuis le navigateur, aperçu pris pour un guide complet, fausse activation, oubli des refus et perte du comportement récent de Léo.

## Contrôles locaux isolés

Node est exécuté sans environnement de compte, avec lecture limitée au snapshot et sockets refusées par seccomp. Témoins vérifiés : socket EPERM, écriture hors snapshot refusée. Aucun SDK, compte réel ou fournisseur facturé utilisé.

- `unit-leo-zohshia` : source réelle non vide, nouvelle brique sans modification de Léo, résumé issu de la fiche, limites d'extrait et de projection, données inutiles exclues, doublons, sources absentes ou invalides, six quadrants et deux modes.
- `unit-leo-voix` : les 44 verdicts existants passent après intégration des règles d'interaction actuelles.
- `unit-leo-zohshia-route` : vrai handler avec dépendances contrôlées ; six demandes atteignent un seul appel fournisseur factice avec le stock serveur et les aperçus. Un faux catalogue client ne le remplace pas. Refus propriétaire, méthode, conversation, quadrant et plafond avant appel ; faux outil d'installation rejeté ; panne générique sans détail privé ; parseur actuel des plans conservé.
- Contre-épreuves sur copies : retirer les aperçus ou débrancher le stock du système fait échouer le test par assertion. Le code nominal reste vert.
- Relecture par une autre instance : aucun défaut matériel ou régression identifié ; réserve sur la réception du modèle réel maintenue.

## Comportement éprouvé par simulation

Une autre instance Work, sans historique de la séance, reçoit le contexte réellement construit par le handler de test et sept demandes distinctes. Sorties brutes conservées dans `tests/fixtures/leo-zoh-comportement.json` ; cette simulation n'appelle pas le modèle Anthropic de production.

| Demande | Constat dans la réponse simulée |
|---|---|
| Présentation commerciale | Présentations claires repérée ; marque, preuves et guides à vérifier ; aucune production annoncée |
| Dictée vers devis PDF | RenoDevis repérée ; raccords et chiffrage à adapter, absence de preuve sur dictée/PDF déclarée ; pas d'envoi |
| Contrôle de rentabilité | Anti-pattern proposé comme méthode, pas comme moteur de calcul reçu |
| Assistant supervisable | Pilotage proposé avant ouverture des actions réelles |
| Reconnaissance de maladie de plantes | Aucun moteur affirmé ; distinction entre méthode de contrôle et moteur spécialisé |
| Simple reformulation | Réponse courte sans passage ZOH imposé |
| Activation immédiate exigée | Refus d'annoncer une mise en service fictive ; proposition de préparation outillée |

Ces sorties repassent par le handler et le parseur réels : réponse visible non vide, balises de plan internes retirées, plans valides conservés, aucune proposition d'activation créée. Il s'agit d'une preuve de consommation des réponses, pas d'une validation des réponses futures du fournisseur réel.

## Parcours navigateur et réception

`smoke-leo-stock-zoh` utilise le cartouche, ses scripts et sa saisie réels, le vrai handler et un fournisseur factice, à 390 et 1280 pixels : saisie → POST → contexte ZOH serveur → fournisseur → réponse affichée. Il vérifie le jeton de fixture, l'unicité de l'appel, le journal d'appel et l'absence de réseau extérieur. Le code du parcours n'utilise aucun compte de production. Sa syntaxe est vérifiée localement ; Chromium local reste indisponible, résultat navigateur à lire dans la CI finale.

Les résultats de la première tête 5297f5c ne réceptionnent pas ce complément. Lire la nouvelle CI et son intégration avec main avant réception. Ne pas confondre simulation Work, fournisseur factice, parcours navigateur et modèle réel. Aucun parcours réel avec le compte propriétaire ni comportement du modèle Anthropic reçu ici. Aucune fusion, migration ou publication autorisée par ce mandat ; présenter l'état prouvé sans demander de fusion à ce stade.
