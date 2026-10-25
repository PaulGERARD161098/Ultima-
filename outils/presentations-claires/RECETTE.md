# Recette — présentations claires — 25/10/2026

## Version et périmètre

Base de travail mesurée : `Ultima-` main `2ef85d53c761000320627bac697de1fc4c189f49`. Copie locale isolée des seuls fichiers requis, sans variable d'environnement métier ni appel réseau des tests. Le clone Git direct étant indisponible, les fichiers ont été lus à ce SHA par le connecteur ; les commits sont préparés par l'API Git. Aucun test applicatif sur une instance réelle.

## Preuves exécutées

- PDF source : 19 pages rendues et examinées, mesures du texte et de la géométrie ; analyse dans `ANALYSE.md`.
- `python3 outils/presentations-claires/verifier.py` : 11 contrôles réussis. Dix pages non vides, format 16:9, dix SVG contenant du texte éditable, refus d'écrasement, titre trop long, mot hors zone, composition inconnue, champ inattendu et liste vide ; balise hostile échappée comme texte ; aucune présentation native prétendue.
- Composition des dix pages mesurée à environ 0,11 seconde sur cet environnement. Ce chiffre ne couvre ni brief, rédaction, visuels personnalisés ni recette et n'est pas une promesse de création complète.
- Les dix pages d'exemple ont été inspectées en montage ; couverture, chaîne et décision également à leur résolution nominale. Aucun texte coupé ou recouvrement observé. Le contraste calculé de l'accent textuel sur blanc vaut 6,82:1.
- `node tests/unit-zohshia-presentations.mjs` : contrat, dix compositions, invocation et trois onglets non vides vérifiés.
- `node tests/unit-zohshia.mjs` : les 28 verdicts passent, notamment neutralité, absence de secrets et exclusion des sources du déploiement.
- `node tests/unit-zohshia-pilotage.mjs` : 14 assertions passent.
- `node tests/unit-zohshia-anti-pattern.mjs` : 19 cas structurels et 3 onglets non vides vérifiés.
- `node zohshia/publier.mjs --verifier` : publication générée conforme, quatre fiches. Comparaison structurelle à la publication de base : les trois fiches préexistantes et leurs empreintes de sources restent identiques ; un seul badge ajouté.
- Validation de la compétence personnelle par `quick_validate.py` : réussie.
- Essai dans un fil distinct avec la compétence, sans l'historique d'analyse : un brief d'artisan et une décision d'essai de deux semaines produisent storyboard, PDF et quatre SVG. Lecture du storyboard et du rapport, sortie inspectée par l'exécutant. Aucun produit, résultat, tarif ou gratuité inventé ; conditions à convenir avant l'essai. Le test n'a utilisé ni réseau ni dépôt. La provenance embarquée était alors absente et a été ajoutée avant la sauvegarde finale.

## Incidents corrigés et limites

L'instrument d'échappement concaténait les lignes sans espace : un texte sûr passé sur deux lignes donnait un faux échec. Le contrôle lit maintenant le texte XML en conservant les séparations. La balise reste du texte, sans attribut exécutable.

La récupération textuelle initiale ajoutait un saut de ligne final aux sources de référence : les empreintes le détectaient. Les copies de contrôle ont été rétablies à l'octet textuel attendu et les empreintes préexistantes revalidées. Aucun changement des sources anciennes n'est inclus dans la proposition, sauf l'index et l'invocation explicitement étendus.

Le test existant `unit-zohshia-ecran.mjs` n'a pas pu charger le paquet `@supabase/supabase-js` absent du conteneur isolé. Aucun résultat vert revendiqué pour ce test. Les routes et règles d'accès ne sont pas modifiées. Suite complète du dépôt et navigateur authentifié non exécutés ici ; vérifier la CI et l'écran avec une session propriétaire avant de déclarer la livraison en production.

Le moteur de composition local n'importe pas d'image ni de capture : ses illustrations vectorielles sont des exemples originaux. Les images et captures propres à une vraie présentation se composent via la capacité de présentation et de génération d'images de l'environnement. La qualité photographique de la couverture de référence n'est pas reproduite par ces schémas.

Les SVG contiennent du texte et des objets vectoriels éditables ; leur édition dans un logiciel tiers n'a pas été éprouvée. Export PowerPoint natif non réalisé. Durée complète d'un vrai pitch non mesurée. Aucun envoi, migration, fusion ni affichage réel en production validé par cette recette.

## Lecture et reprise

Le badge et la compétence renvoient au même socle neutre. Le PDF d'aperçu est enregistré séparément : `libfile_9f2b89ce6ef8819180295fc288eed7f0`. Il montre les compositions, pas une présentation commerciale finale.

Après accord de fusion lié à la version, relire les contrôles d'intégration puis vérifier le badge avec la session propriétaire. Premier vrai usage : fournir le brief de la future présentation, ses preuves et sa marque ; mesurer séparément rédaction, visuels, composition et recette.

## Complément — compétences depuis GitHub

La suite de la même séance ajoute deux modules adaptés, leur licence et leur provenance, raccordés à l'orchestrateur. Voir `SOURCES-GITHUB.md` pour le périmètre exact. Les preuves précédentes ne deviennent pas des tests d'exécution de ces modules : environnement indisponible, rendu non exécuté dans cette passe. La compétence personnelle de la première livraison reste à sa version précédente.

## Intégration dans ZOH et étoile — phase suivante du 25/10

Mandat : « implante les skills dans zoh et crée bien l'étoile correspondante ». L'environnement d'exécution est de nouveau disponible pour cette phase. La limitation d'environnement de la phase précédente reste une trace historique, pas l'état de cette phase.

Le registre porte maintenant quatre enfants sous ZOH SHIA, un par technologie existante. L'étoile PRÉSENTATIONS CLAIRES ouvre `zohshia.html#presentations-claires`. Les trois autres étoiles conservent l'accès aux technologies préexistantes. La page de catalogue reste disponible à son adresse directe et son retour mène à `imladrik.html#zohshia`.

Le badge publie cinq onglets, dont Composition éditoriale et Pitch sourcé. Ces deux onglets pointent directement vers les sections de méthode des compétences du dépôt : aucun contenu de méthode copié en parallèle. Leurs fichiers complets restent accompagnés des licences et sources.lock. Les empreintes de publication suivent les fichiers de compétences ; les sections d'attribution ne font pas partie du texte neutre publié.

Contrôles exécutés : `unit-registre-lv3.mjs`, `unit-adaptateur-lv4.mjs`, `unit-zohshia.mjs`, `unit-zohshia-navigation.mjs`, `unit-zohshia-presentations.mjs` et `publier.mjs --verifier` passent. Le contrôleur d'arbre est également éprouvé sur un rattachement volontairement supprimé, qu'il refuse. La navigation directe est exécutée sur le code réel avec un DOM simulé : ouverture, focus, défilement, idempotence, ancre inconnue/malformée/hostile et fiche non chargée. Aucun de ces contrôles ne constitue un rendu navigateur.

Les scénarios du harnais navigateur existant sont étendus : ancre sans session, refus 403 avec ancre, cinq onglets, contenu des deux compétences à 1280 et 390 pixels, changement d'ancre et retour à ZOH. Leur syntaxe a été vérifiée ; ils n'ont pas été exécutés localement. L'installation du navigateur Chromium a échoué (archive distante invalide/tronquée), puis l'accès du navigateur distant au serveur local a été refusé. La comparaison visuelle reste donc non vérifiée, ainsi que l'affichage réel avec une session propriétaire.

Les deux compétences personnelles et l'orchestrateur sont validés par quick_validate.py. Leur sauvegarde se prouve par le push du dépôt des compétences, séparément de la proposition d'intégration Ultima. Leur présence ne prouve ni génération d'images ni rendu d'une vraie présentation.

Les mises à jour des tests de navigation conservent les contrôles existants : ZOH devient une tête de rang 1 ; les quatre étoiles ouvrent des fiches publiées ; les cibles HTML avec fragment sont vérifiées sur leur vrai fichier. Aucun changement d'authentification, de droits ou d'API métier.

Première CI de cette phase : les suites unitaires, runtime, registre et authentification passent. Le navigateur groupe 0 signale une seule attente devenue obsolète dans smoke-carte-celeste : le test exigeait encore une seule tête sous DRAGONS. Le rendu observé comporte correctement les deux têtes ADRAMELECH et ZOH SHIA ; les autres contrôles de ce harnais passent. L'attente est mise à jour à deux têtes et six feuilles, sans retirer les contrôles de rang ni d'isolement. Le même harnais est étendu à ZOH SHIA à 390 et 1280 pixels. La syntaxe est vérifiée ; les résultats de la CI de cette nouvelle version doivent encore être lus.

La prévisualisation de l'application est déployée ; sa visite dans le navigateur distant redirige vers la connexion Vercel. Ce blocage ne constitue pas une panne de l'application ni une validation visuelle. Aucune authentification n'est contournée.

## Vérification avant fusion — retour mobile

La CI de 9c45f2a passe les suites unitaires, runtime, registre, authentification et navigateur groupe 1. Le groupe 0 révèle une autre attente historique : smoke-retour-feuilles exige encore le retour du catalogue ZOH vers DRAGONS. Le comportement voulu est le retour vers son propre ciel. Le harnais conserve les sept parcours vers DRAGONS et ajoute le parcours complet ZOH : lien visible et libellé, absence des anciens retours, clic au doigt, adresse d'arrivée et présence exacte des quatre étoiles. Aucun fichier applicatif n'est modifié par ce correctif. Syntaxe et unit-zohshia-navigation vérifiés localement ; rendu de ce correctif à confirmer par la CI.
