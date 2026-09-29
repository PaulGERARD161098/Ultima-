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

## Activation encore nécessaire

**Décision actualisée : réutiliser Vercel et Supabase d'Ultima.** La proposition
`proposals/registre-postgres.sql` et `api/leo-registre.js` préparent la mémoire
transactionnelle du produit. Voir [ACTIVATION.md](ACTIVATION.md) : préflight réel
en lecture seule, périmètre, changement exact et autorisations restantes.
Le Python/SQLite ci-dessus reste un banc d'épreuve ; aucune deuxième mémoire
active n'est prévue. L'API proposée doit encore passer ses tests isolés.

L'hypothèse ci-dessous d'un hôte Python dédié est donc historique et remplacée
pour la mémoire/budget par ce raccord aux services existants. L'orchestration
des effets externes et du moteur CI reste à raccorder et à recevoir.

Il reste à choisir et installer l'hôte persistant authentifié, raccorder son
interface à Ultima, intégrer un exécuteur isolé à cet hôte, vérifier les preuves
réelles et l'adaptateur de fusion réel, puis exécuter la recette produit complète.
Une fusion qui publie Ultima et toute activation facturée restent hors du mandat
LV1 actuel. Les livrables sont préparés sur une branche privée sans activation.

La capacité Sites MCP de Work a été examinée le 29/09 : elle fournit un endpoint
HTTP authentifié et un stockage D1/R2 sous Worker ESM. Elle ne constitue pas un
hébergement direct de ce contrôleur Python avec processus Git et conteneurs de
test. L'utiliser exigerait un portage du registre et un exécuteur distinct avec
les mêmes garanties ; aucun site ni second stockage n'a été créé pour contourner
cette limite. Un service privé avec processus isolés et volume durable reste
à raccorder, ou une architecture équivalente doit être construite et éprouvée.
