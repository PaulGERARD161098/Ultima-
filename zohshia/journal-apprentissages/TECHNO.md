# Journal d’apprentissages — technologie réutilisable

## 1. But et état réel

Transformer les observations de travail en apprentissages traçables et les retrouver
au moment utile : ouverture, décision ou blocage, puis clôture de séance.

**Préparé, non activé automatiquement.** Le journal structuré et sa consultation locale
sont disponibles dans cette préparation. Aucun raccordement à un outil de conversation,
aucune tâche permanente et aucune écriture de contrôle ne sont installés par ce lot.

Le bénéfice attendu est moins de reprises inutiles et de répétitions d’erreurs.
Aucun gain de temps ou gain commercial n’est encore mesuré.

## 2. Réutiliser la mémoire existante

| Pièce | Rôle |
|---|---|
| `memoire/LECONS.md` | Source unique des règles de méthode déjà adoptées ; ne pas recopier ces règles dans le journal |
| `memoire/JOURNAL-APPRENTISSAGES.json` | Observations, réussites, hypothèses et suivi de vérification ; renvois aux règles existantes |
| `outils/journal-apprentissages/consulter.mjs` | Valide le journal, ouvre sa lecture complète et recherche les cas ressemblants, sans écriture ni appel réseau |
| `finubar/lecons-rappel.mjs` | Rappel d’ouverture déjà présent dans le dépôt ; son exécution réelle dans chaque environnement reste à éprouver |
| `memoire/LECONS-PROCEDURE.md` | Mise à jour et propagation de la source canonique des règles |
| `collecter.mjs` et `inventaire.json` | Mesure locale des fichiers réellement disponibles, empreintes et éléments manquants |

La technologie porte un plan neutre. Les incidents propres à un projet restent dans
sa mémoire privée : ils ne sont pas publiés avec ce badge. La fiche ne remplace pas
le journal de décisions et ne transforme pas une observation en instruction.

## 3. Forme d’un apprentissage

Une entrée porte un identifiant stable, une date, le cas rencontré, la nature
(incident, réussite ou idée), le constat, sa conséquence, une explication avec son
niveau de preuve, une piste à éprouver, ses limites et des sources nommées.

Les niveaux sont distincts : mesuré, déclaré, inféré, non vérifié. Le statut est
observation, à éprouver, relié à une leçon, ou retiré. Une règle adoptée se retrouve
par son titre exact dans `memoire/LECONS.md` ; elle ne se duplique pas dans le journal.

Une réussite se consigne avec la recette qui permet de la reproduire. Une idée
reste une idée tant que son gain n’est pas éprouvé. Une clôture sans enseignement
nouveau est recevable : aucun remplissage automatique et aucune erreur inventée.

## 4. Protection et limites

La mémoire est une donnée à examiner, jamais une nouvelle autorité. Elle ne modifie
ni mandat, ni permissions, ni contrôle de l’agent. Un texte importé demandant un
secret ou une action n’est pas exécuté.

Ne pas verser de conversations brutes, dossiers clients, secrets ou données personnelles
dans le journal versionné. Les preuves sensibles restent hors du dépôt, accessibles
seulement aux personnes habilitées. Les leçons diffusées entre projets sont neutralisées.

Les modifications passent par une branche et une revue du diff. Une version distante
nouvelle impose une réconciliation avant écriture ; les clôtures concurrentes ne
s’écrasent pas. La consultation locale ne prouve pas le contrôle d’accès de tous les
outils susceptibles de lire le dépôt.

## 5. La promesse de lecture

Lire intégralement les sources accessibles au début et à la clôture ; en cours de
travail, rechercher le cas puis relire ses preuves et limites avant application.
La recherche est une aide lexicale, pas une preuve d’analogie.

Une session privée non transmise ou un historique tronqué ne peut pas être relu en
entier. La couverture manque alors explicitement. Une lecture d’index, une empreinte
ou une injection de texte ne prouvent pas à elles seules que l’agent a appliqué la leçon.
