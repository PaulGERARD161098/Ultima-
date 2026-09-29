# Léo LV1 — contrôleur d'épreuve

Référence métier unique : `CADRAGE-2026-09-22-leo-pilote-tout.md`, §11,
contrat 1.1. Compétence Work attendue : `leo-lv1` 1.0.

Ce composant construit les mécanismes de contrôle manquants et les éprouve dans
un conteneur sans réseau. Il n'est pas raccordé au chatbot Ultima ni à un service
permanent. Il ne contrôle pas les outils propres de Work. L'état de réception
du produit entier se trouve dans `RECETTE-LEO-LV1.md`.

## Frontière de confiance

L'hôte authentifie la personne et fournit mandat, comptes, dépôts, preuves,
accords et adaptateurs. Le modèle soumet uniquement une proposition d'action.
Le contrôleur refuse les champs supplémentaires, les droits inconnus et les
effets hors mandat avant de réserver le budget puis d'appeler l'adaptateur.
Un objet Python `Approval` ou `authority=True` n'est pas une authentification :
seul un hôte déjà authentifié peut construire ces objets. Ne jamais exposer
les constructeurs, SQLite ou une exécution Python arbitraire au modèle.

Le déploiement futur doit placer ce contrôleur hors du processus non fiable,
avec un répertoire privé et une interface authentifiée, et limiter chaque
adaptateur à ses capacités. La bibliothèque seule n'établit pas cette frontière.
Les tests CI montent uniquement `leo/` et `tests/runtime/`, sans données métier.

## Modules et garanties

- `runtime/policy.py` : droits fermés, arrêt, durée, versions, effets, quadrants
  autorisés et preuve liée au dépôt, aux commits, au compte et à l'environnement.
- `runtime/memoire.py` : missions et opérations transactionnelles, lecteurs et
  rédacteurs explicites, comparaison de version, résultat durable et reprise.
- `runtime/budget.py` : plafond global partagé, réservations atomiques avant
  dispatch, appels/tentatives/délégués/durée, arrêt et règlement idempotent.
- `runtime/broker.py` : passage imposé par l'hôte, contrôle du mandat canonique,
  écritures mémoire et fusion fictive ; aucun adaptateur de production disponible.
- `runtime/fixture_git.py` : transaction Git vérifiant source et cible pour une
  intégration exacte, dans un dépôt nu fictif sans remote ni hooks.

Le budget utilise des unités abstraites de travail : 1 par écriture mémoire,
2 par fusion fictive. Aucun tarif fournisseur, appel payant ou coût Work n'est
piloté par ce registre. Le contrôleur refuse toujours `paid_call`.

## Registre et reprise

Un seul fichier SQLite local durable par hôte pour mémoire et budget. Initialiser
avec `Broker` : **MissionStore puis BudgetLedger**, dans cet ordre. Une base
budget créée seule n'est pas un registre mémoire initialisé. Une table mémoire
manquante doit déclencher une réconciliation, jamais une recréation silencieuse.
Les fichiers nouveaux ont le mode 0600 ; l'hôte garantit le propriétaire, les
permissions du répertoire et l'absence de remplacement concurrent du chemin.
Ne pas stocker SQLite sur un partage réseau ni dans le dépôt Git.

Les décisions métier restent dans les cadrages existants : le registre technique
porte leurs références, les mandats et les opérations, pas une seconde doctrine.
Les droits et mandats ne se modifient pas par une proposition du modèle.
La conservation et la sauvegarde doivent être activées par l'hôte ; aucun
nettoyage automatique ni transfert inter-projet n'est installé.

Une opération terminée est retournée sans répéter l'effet ; son budget peut être
soldé après une interruption. Une réponse inconnue garde sa réserve. Pour une
fusion fictive, la réconciliation lit la référence réelle avant de conclure.
Une réservation orpheline ou un conflit de version avant résultat reste réservé
et visible au statut : aucune reprise aveugle, aucune libération estimée.
L'arrêt bloque les nouvelles réservations, les opérations déjà engagées peuvent
aboutir ; leur statut reste consultable et leur résultat doit être réconcilié.

## Épreuves

Le workflow `.github/workflows/leo-lv1.yml`, job `runtime`, lance les tests Python
standard dans Docker sans réseau, capacités ni écriture hors `/tmp`, avec
ressources bornées. Les canaris parent et enfant doivent échouer sur réseau et
écriture racine. Les tests locaux sans ce confinement ne sont pas autorisés.

Le cycle fictif injecte un défaut réel dans `fixture.py`, vérifie que le test
échoue avant correction puis réussit, fusionne une intégration exacte, perd
volontairement la réponse et retrouve son résultat dans un nouveau processus.
L'accord et la preuve de revue de ce scénario sont **simulés** ; ils ne valent
pas accord de Paul, revue indépendante réelle ni réception complète R21.

## Raccordement produit à Ultima

Le registre produit réutilise Vercel et Supabase d'Ultima. Le SQL a été installé
avec l'accord de Paul le 29/09/2026, migration `20260929125105` ; contrôles de
privilèges et RLS consignés dans [ACTIVATION.md](ACTIVATION.md). Les tests API,
PGlite et concurrence PostgreSQL 17 ont réussi avant cette installation.
Python/SQLite reste uniquement le banc de conformité décrit ci-dessus.

La tranche suivante ajoute l'entrée « Mission Léo » dans l'accueil existant :
consultation, état déclaré, prochaine action, arrêt, conflit et reprise. Elle
réutilise `api/leo-registre.js`, sans appel au modèle ni nouvel effet externe.
Le serveur authentifie chaque requête et le SQL reste l'autorité pour les droits,
versions et budgets ; les boutons du navigateur ne constituent pas une permission.
Un état déclaré « validé pour fusion » ne vaut aucun accord de fusion.

Avant un POST, le client journalise dans sessionStorage seulement la mission,
l'identifiant d'opération, sa nature, la version attendue et la demande d'arrêt.
Le journal est séparé par utilisateur ; il ne contient ni texte métier ni jeton.
Son indisponibilité empêche le POST. Une réponse perdue survit au rechargement
du même onglet : relecture obligatoire, reçu identifié, aucun renvoi automatique.
L'absence du reçu parmi les 100 derniers ne prouve jamais une absence d'effet.
La fermeture définitive de l'onglet, un autre onglet ou appareil ne conservent
pas ce marqueur : le contrôle de reprise inter-environnements reste à recevoir.
Les résultats enregistrés restent consultables dans le registre serveur.

Les tests de parcours composent le client, la route réelle et le SQL dans PGlite,
avec identité et transport fictifs. Le harnais navigateur couvre l'entrée réelle
dans l'accueil. Leurs résultats doivent être relevés sur le commit courant avant
de recevoir cette tranche ; leur présence ne prouve pas leur réussite.

La création d'une mission reste administrative et n'a pas été exécutée. Le
parcours de mémoire ne raccorde ni l'exécution de code, ni la délégation, ni la
fusion. Ces actions demeurent absentes du catalogue de l'API. La réception R21
et les autres gardes produit restent suivies dans `RECETTE-LEO-LV1.md`.

La publication reste distincte de la préparation : le connecteur GitHub expose
une condition sur le SHA source, sans condition sur le SHA cible ; la lecture
des protections de main est refusée. La garantie de fusion source/cible requise
n'est pas établie. Vercel montre des déploiements de production issus de main ;
ne pas supposer qu'une fusion reste sans publication. Aucun nouvel hôte ni
stockage parallèle n'est nécessaire pour ce parcours de mémoire.
