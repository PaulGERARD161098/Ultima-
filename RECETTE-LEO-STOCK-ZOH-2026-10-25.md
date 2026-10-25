# Léo — consulter le stock ZOH au démarrage

Mandat du 25/10/2026 : au démarrage d'un projet, Léo regarde les technologies en stock dans ZOH et les réemploie lorsqu'elles conviennent.

## Cadrage

But : repérer l'existant avant une création, expliquer ce qui est réutilisable, à adapter ou à créer, puis vérifier les guides et prérequis de l'instance. Le gain commercial est indirect : éviter de reconstruire les briques de chaque nouveau projet ; aucun délai ni revenu gagné n'est mesuré.

Moyens : compétence personnelle Léo LV1, charte `.claude/agents/leo.md`, contexte système existant et catalogue publié `api/_lib/zohshia-technos.mjs`. Réemploi de ce catalogue plutôt qu'un nouveau service de recherche ou une liste maintenue à la main : aucune dépendance, aucun appel réseau ni appel IA supplémentaire. L'index actuel occupe 1 160 caractères ; son plafond est 7 000. Le coût marginal en tokens du prompt complet n'est pas mesuré.

Réussite vérifiable : toutes les technologies publiées atteignent les six quadrants ; une nouvelle brique entre sans modifier Léo ; un catalogue incomplet ne devient pas un stock déclaré vide ; les guides complets et champs supplémentaires n'entrent pas dans cette projection. La sélection reste conditionnelle tant que capacités, limites et prérequis ne sont pas lus.

Hors périmètre : nouveaux outils d'exécution, activation d'une techno, recherche GitHub dans le cartouche, migration, coûts, envois ou modification de permissions. Les accès propriétaire et plafonds ne changent pas. Risques : catalogue périmé pris pour une lecture actuelle, état « en service » pris pour une instance prête, transfert de données métier, faux chargement d'un guide. Les instructions précisent ces limites ; elles ne constituent pas un verrou hors modèle.

## Implémentation

`api/_lib/leo-zohshia.mjs` projette uniquement id, nom, état déclaré, titres d'onglets et lien de fiche depuis la publication existante. La provenance et la date sont explicites ; le nombre déclaré et la couverture rendent visibles doublons, formes invalides ou dépassement de taille. Aucun catalogue parallèle n'est ajouté.

`construireSysteme` reçoit ce stock et les règles de choix, de réemploi conditionnel et de limite d'exécution. L'agent de développement consulte les guides réels ; le cartouche oriente vers une session outillée et ne prétend pas les invoquer.

## Preuves locales

- Validation de la compétence personnelle par le script officiel quick_validate.py : réussie. Sauvegarde Git confirmée, commit `0cf57e4`.
- Essai dans un fil sans historique : brief fictif de présentation de huit pages, seul catalogue local accessible. La réponse repère Présentations claires, propose le réemploi et explicite guides, outils et preuves manquants ; aucun appel réseau ni production d'artefact. Cet essai ne réceptionne pas le modèle Anthropic de production.
- Tests Node sous environnement minimal, droits de lecture limités au snapshot et sockets refusées par seccomp. Témoins : création de socket refusée EPERM et écriture hors snapshot refusée. Aucun SDK, secret, modèle facturé ou service métier utilisé.
- `unit-leo-zohshia.mjs` : projection réelle, ajout fictif d'une cinquième brique, omission des blocs et champs supplémentaires, doublons, catalogue indisponible ou invalide, borne de taille, six quadrants avec/sans outils et quadrant inconnu : passe.
- `unit-leo-voix.mjs` : 44 verdicts vrais, règles, minimisation et plafonds conservés.
- Relecture par une autre instance : aucun défaut bloquant ; limite d'adéquation des métadonnées explicitée dans le prompt et contrôlée par le test.

## Limites et reprise

La compétence personnelle est sauvegardée séparément de ce raccord applicatif. La CI de la tête proposée doit encore être lue. Pas de génération de réponse payante depuis le cartouche ni de réception du modèle réel, aucune fusion ni publication revendiquée ici. Le catalogue est le snapshot livré avec l'application, pas une recherche en direct dans les branches en attente. Après réception du code et accord lié aux versions, vérifier le déploiement puis observer un démarrage de projet réel.
