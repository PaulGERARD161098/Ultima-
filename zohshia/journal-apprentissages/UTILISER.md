# Début, travail et clôture

## 1. À l’ouverture — lecture explicite

Lire les consignes du projet, puis les règles canoniques et le journal complet.
Depuis la racine du dépôt : `node outils/journal-apprentissages/consulter.mjs`.
La sortie identifie la version, le nombre d’entrées et les limites de couverture.
Lire également `memoire/LECONS.md` en entier : le journal ne le remplace pas.

Relier les leçons pertinentes au mandat actuel. Si une source est absente, périmée
ou tronquée, nommer le manque et acquérir ce qui est nécessaire au travail concerné.
Ne pas transformer une absence de lecture en absence de leçon.

## 2. Pendant le travail — retrouver un cas

Sur un blocage, une décision substantielle, un échec ou une meilleure exécution,
consulter spontanément la mémoire. Exemple neutre :
`node outils/journal-apprentissages/consulter.mjs --cas "accès lecture fichier"`.

La consultation cherche dans le journal et les entrées de la mémoire canonique.
Elle rend les textes complets des entrées trouvées et la provenance des fichiers.
Une recherche sans résultat n’est pas une preuve qu’aucun cas analogue existe.

Pour chaque correspondance, vérifier la cause commune, les différences, la date,
les preuves et le coût d’application. Noter la leçon effectivement utilisée et
son effet observé ; ne pas ajouter de règle à chaque consultation.

## 3. À la clôture — rétrospective et écriture maîtrisée

Relire toute la session accessible, les demandes, le diff et les preuves produites.
Comparer attendu et livré, essais concluants, incidents, corrections et restes.
Lister les sources réellement relues et les passages indisponibles ; ne jamais
annoncer une relecture intégrale d’un historique non accessible.

Rechercher les doublons dans le journal et dans `memoire/LECONS.md`. Ajouter une
observation utile, enrichir une entrée existante ou constater aucune nouveauté.
Un apprentissage issu d’une erreur réelle peut enrichir la mémoire canonique selon
`memoire/LECONS-PROCEDURE.md`. Le journal conserve alors un renvoi au titre exact.

Valider : `node outils/journal-apprentissages/consulter.mjs --verifier`.
Relire le diff, conserver les versions et committer sur la branche du travail.
La validation du format ne remplace pas la vérification des affirmations.

## 4. Qui agit et ce qui est automatique

| Moment | Mode de cette version | Qui agit |
|---|---|---|
| Ouverture | Manuel ; rappel canonique existant à vérifier séparément | L’agent de séance avec accès à la mémoire |
| Recherche pendant le travail | Consultation locale à l’initiative de l’agent | L’agent, dans le mandat courant |
| Clôture et ajout | Écriture sur branche, revue et vérification des sources | L’agent de séance |
| Propagation des règles | Procédure canonique existante | La séance habilitée qui dispose des dépôts |
| Injection dans chaque outil | Non raccordée par ce lot | Futur raccordement avec preuve de lecture |

Le journal n’est pas un agent permanent. Aucune surveillance en arrière-plan
ni récupération implicite des conversations d’autres outils n’est promise.
