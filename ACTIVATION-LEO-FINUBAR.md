# Appeler Léo et FINUBAR

Sur [Ultima](https://ultima-plum.vercel.app), connecte-toi puis ouvre le
cartouche **Parler à Léo** dans le quadrant voulu. Exemple : « Crée une idée
Atelier bois ». Un contenu ou une cible qui ne sont pas explicitement dictés
restent soumis à confirmation. Les actions automatiques sont journalisées
avant l’écriture et limitées à 40 tentatives par compte et par heure.
Un résultat incertain ne déclenche aucun renvoi automatique.

[FINUBAR](https://ultima-plum.vercel.app/finubar) affiche la table de marche des
dix dépôts déclarés dans `finubar/depots.json`, avec la date des preuves.
Son cartouche Léo répond sur cet état. La collecte publiée reste un instantané ;
un dépôt non examiné ou une lecture ancienne sont signalés.

Dans Claude Code, ouvert sur ce dépôt à jour :

- `/leo` ou `/léo` : état des lieux de Léo ; `/leo <demande>` pour une tâche.
- `/finubar` : état transverse ; `/finubar <projet ou question>` pour cibler.

Le skill FINUBAR et la charte Léo restent leurs sources canoniques.
Ces commandes ne sont pas des chemins du site. Le panneau **Mission Léo**
consulte un mandat mémoire existant par son identifiant ; il ne crée pas de
mandat ni ne lance un contrôleur autonome externe. La réception LV1/R21 et
l’installation d’un hôte Work restent distinctes de cette activation du site.
