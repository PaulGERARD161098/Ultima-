# Reprise RenoDevis et ZOH — 16/10/2026

## 1. But

Fermer l'audit du 15/10 sur des résultats reçus, et conserver une technologie réutilisable dont les écarts sont mesurés. Le lot accueil est livré ; cela ne clôt pas l'audit global.

## 2. Ordre et critères de sortie

| Priorité | Travail | Preuve de clôture |
|---|---|---|
| 1 | Relire la PR concurrente RenoDevis #385 avant toute intervention. Au relevé : brouillon ouvert, tête 49c5a43cb023534d13e5bd227674ffa142b81359 ; poursuivre dans cette branche ou après sa livraison, sans dupliquer. | Description vocale réelle, reformulation complète confirmée, exclusions et références conservées, calcul selon le compte, PDF effectivement reçu et relu sur téléphone. Objectif trois messages entrants ; une ambiguïté matérielle reste bloquante. Tests simulés seuls insuffisants. |
| 1 bis | Diagnostiquer le lien direct WhatsApp ; conserver le secours application/web déjà livré. | Bonne conversation ouverte sur téléphone, avec et sans métadonnées disponibles ; les dossiers restent accessibles. |
| 2 | Reprendre la PR SQL #374 : relire son diff et mesurer le schéma réel avant préparation de migration et retour arrière. | Rejeu isolé, tests d'idempotence et concurrence, puis exécution autorisée et preuve des journaux d'envoi/relance. Les tables rd_relance_operations et rd_envoi_archives restent absentes au relevé en lecture seule du 16/10. |
| 3 | Préparer le complément HT structuré ROMEAS depuis le PDF original. | Proposition exacte HT 17 633,95 / TTC 18 603,82, identité/propriétaire et pièce recontrôlés ; correction ciblée autorisée, réattestée, sans modifier le PDF original ou l'historique d'envoi. Ne pas refaire la correction alternatives/cumul déjà reçue. |
| ZOH | Reprendre base et extraction après sélection d'un commit stable de RenoDevis. | Ordre des migrations relevé en lecture seule ; base jetable comparée à la référence ; série neutre rafraîchie puis extraction avec typage, tests et build. Une modification de BASE seule ne constitue pas une correction. |

## 3. Sources et moyens

- RenoDevis livré : dd806dcefa2efde895b0a900a9f0dc4f125a00c2 ; accueil et recherche reçus sur relance-renoboostia.com ; déploiement dpl_GSTMVZMHLjcsj6cwsosyyzhTxooq. Relire la tête et le déploiement à la reprise.
- Base du produit : projet mwaryfscxgrulauwwque ; ne pas confondre avec la base d'un autre produit. Aucun secret dans le cadrage.
- Leçons : source canonique memoire/LECONS.md d'Ultima ; copie strictement identique vers les neuf dépôts recensés dans finubar/depots.json, sans modifier leurs travaux en cours.
- ZOH : plan TECHNO.md, guide AJOUTER-UN-ARTISAN.md, inventaire.json, ETAT-REPRISE.json et badge généré api/_lib/zohshia-technos.mjs. Le miroir produit n'est pas hébergé dans Ultima.

## 4. Mesure et validation de ce lot

Inventaire sur le commit exact livré : 52 variables, 6 crons, 36 routes, 47 migrations, 11 tables lues sans création trouvée dans les migrations du seul dépôt. Cette dernière mesure ne prouve pas leur absence dans la base réelle. Deux migrations de plus que le précédent inventaire. Leur ordre a été relevé en lecture seule : messages/reprise puis vue de vente, contrairement aux noms de fichiers. Ordre complété et fausse exigence de tri corrigée ; vérifications de liste complète, unique et non vide maintenues. Rejeu réel et empreinte restent à éprouver, runtime Postgres absent de cette séance.

Série neutre liée à f1f9fb30fc03709106aa754d46524c0c3d778ef0 : 361 commits d'avance, 565 chemins de fichiers modifiés, dont 111 croisant les fichiers retouchés/retirés de la série. Mesure par comparaison API des commits et des arbres complets non tronqués. Nombre de commits touchant la série non mesuré. L'instantané Git local de collecte contient le commit officiel reconstitué depuis sa charge signée, SHA vérifié et arbre identique ; il n'offre pas l'historique complet. Aucune extraction ou base neuve n'est certifiée ici. Le verrou initial a refusé deux migrations sans place ; après correction, le contrôle pur accepte leur ordre explicite et continue de refuser omission, doublon, disparition et liste vide.

Vérifications locales ciblées : unit-zohshia, unit-zohshia-derive, unit-zohshia-pilotage, unit-zohshia-ecran, génération --verifier et sceau des leçons. Services réels non appelés par ces tests ; accès propriétaire refusé sans droits. Contre-épreuve : retrait volontaire du nouveau cron du guide, échec de couverture attendu, restauration à l'identique et vérification des données générées. Ces contrôles documentaires ne constituent pas une recette complète d'Ultima.

## 5. Périmètre et autorisations

Le mandat présent couvre cadrage, leçons et actualisation du plan ZOH. Préparation réversible et PR permises ; aucun envoi client, migration réelle, activation de canal, extension de droits ou dépense. Fusion selon le gate du CLAUDE.md : accord portant sur les versions source/cible et la preuve d'intégration actuelle. Préparer tout le lot avant de solliciter cet accord ; ne pas présenter une branche préparée comme publiée dans l'application.

ZS : conserver inventaire, badge, moteur, banque et contrôle existants ; aucun nouveau fournisseur ni abonnement. L'accueil s'adapte au canal réellement utilisé. Cette maintenance ne justifie pas une reconstruction technique.

## 6. Pré-mortem

- Faux cumul commercial : mode explicite ; choix exclusifs séparés ; récapitulatif global réservé aux blocs cumulables. Kerrien choisit la variante et le format une/trois pièces, sans somme artificielle.
- Rechiffrage d'un original : identifier l'import et préserver la pièce ; correction active ciblée seulement.
- Fausse clôture : une preuve par étape et des reliquats nommés, sans confondre lot livré et audit terminé.
- Écrasement d'un chantier concurrent : relire #385 et les têtes avant changement ; ne pas fusionner sur une ancienne autorisation.
- Export ZOH trompeur : plan, base et code portent chacun leur statut ; retard mesuré conservé tant que la recette n'est pas passée.

## Prompt de reprise

Reprends RenoDevis à partir de ce cadrage et de l'audit du 15/10. Relis les têtes GitHub, la PR #385 et le déploiement réel avant de toucher au code. Accueil et recherche sont livrés ; alternatives/cumul sont déjà corrigés. Priorité : suivre la correction de compréhension existante puis recevoir un parcours vocal → confirmation → PDF sur téléphone, en visant trois messages et en conservant les ambiguïtés bloquantes. Ensuite prépare le reliquat SQL #374 avec rejeu isolé et le HT structuré ROMEAS avec réattestation. Mets à jour les preuves au fur et à mesure, sans nouveau doublon de chantier. Pour ZOH, l'inventaire est remesuré sur dd806dc, mais base et code neutre restent à éprouver : ne certifie ni clonage ni extraction sur la seule fraîcheur du plan. N'envoie rien aux clients, n'active rien et ne migre aucune base sans le mandat correspondant.
