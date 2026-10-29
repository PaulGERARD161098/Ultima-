# ZOH SHIA — le dragon de la technologie

> Créé par Paul le 04/10/2026, étoile de la constellation des DRAGONS
> d'IMLADRIK : *« Dans ZOH SHIA je regroupe toute ma techno »* — puis : *« on
> garde uniquement la technologie en pur — pas de données techniques, pas de nom
> d'artisan : la technologie elle-même, avec tout ce qu'elle fait, ce qu'elle
> comporte »*.

## Ce qu'il contient

| Élément | Ce qu'on y trouve |
|---|---|
| `renodevis/` | Le plan de la techno RénoDevis (`TECHNO.md`), le guide et la check-list pour la mettre en service chez un pro (`AJOUTER-UN-ARTISAN.md`), l'inventaire mesuré (`inventaire.json`), l'extraction du code neutre (`extraire.mjs`) et la base neuve prouvée (`base/`) |
| `pilotage-back-office/` | Règle transversale : chaque système a un cockpit ou un moyen de pilotage utilisable ; contrat neutre, couverture par fonction, guide de recette et contrôle des attestations privées |

## Présentations claires

`presentations-claires/` porte un socle de narration et de composition : six capacités coordonnées, dix compositions, variables graphiques, moteur local PDF/SVG et recette. La compétence `presentations-claires` guide la création ; les données et rendus propres à chaque projet restent hors du socle. Le badge utilise la publication existante ; aucun nouveau bouton de génération en ligne.

## Approches croisées

`anti-pattern/` porte la méthode neutre de calcul et de travail : rétrocadrage, deux approches différentes, traitement des écarts, guide de réception et collecteur structurel de déclarations. Son badge réutilise la publication existante. Les preuves et valeurs propres aux instances restent hors du dossier neutre.

## Pitch commercial

`pitch-commercial/` conserve la méthode AIDA, les variantes appel/mail, les questions de qualification et les règles d’adaptation par cible et service. Le prospect reste au centre ; preuves et offres inconnues restent à compléter. Les discours et données de campagne vivent dans l’outil de prospection, hors du socle neutre. Le badge suit la publication existante ; sa présence ne prouve pas encore l’intégration métier.

## Comment on l'invoque

Par la compétence **`zohshia`** (`.claude/skills/zohshia/SKILL.md`) : remesurer,
prouver la couverture, dérouler le guide, s'arrêter à chaque gate.

## Les cinq règles du dossier, et ce qu'elles préviennent

| Règle | Le danger qu'elle écarte |
|---|---|
| **La techno pure** — aucun nom d'artisan, de client, de fournisseur ni de marque ; aucune valeur propre à un pro. La liste des noms à bannir vit HORS du dossier (`outils/zohshia/noms-propres.json`) ; testé | Une instance particulière prise pour la techno |
| **Mesurer, ne pas recopier** — les listes viennent de `collecter.mjs`, avec le commit d'origine ; un nom technique qui porte un nom propre devient `[nom propre]` | Un plan écrit de mémoire, qui diverge du code sans que rien ne le dise |
| **Le plan nomme tout ce qui est mesuré** — `tests/unit-zohshia.mjs` rougit sinon | Une pièce oubliée le jour de la mise en service |
| **Des noms, jamais des valeurs** — ni secret, ni identifiant, ni adresse ; testé | Le plan devient la carte d'attaque du système |
| **Les sources ni déployées ni servies ; l'écran au seul propriétaire** — `.vercelignore` exclut `zohshia/` et `outils/` ; la page `/zohshia` est une coque sans donnée ; le plan publié (`node zohshia/publier.mjs` → `api/_lib/zohshia-technos.mjs`) ne sort que par `/api/zohshia`, réservée au propriétaire (`ULTIMA_PROPRIETAIRES`, fermé par défaut) — l'inscription au projet d'authentification est ouverte, « connecté » ne suffit pas | La carte publiée sur le site public, ou lue par un compte créé par n'importe qui |

## À l'écran

Un **badge par techno** (Paul, 04/10/2026), son contenu dedans : *Ce que fait
la techno*, *Check-list du pro*, *Mise en service*. Chaque techno déclare son
badge dans `zohshia/<techno>/badge.json` ; une techno nouvelle = un dossier de
plus, la page ne change pas. Après toute modification d'un fichier pointé :
`node zohshia/publier.mjs`, puis commiter — un test rougit sinon.

⚠️ **Ce qui n'est pas là, nommément** : le code neutre lui-même, qui ne se
STOCKE pas — il s'EXTRAIT à la demande d'un commit du dépôt de référence, pour
être toujours à jour (`renodevis/extraire.mjs`) ; et aucun bouton n'agit depuis
l'écran (pas d'« extraire » en ligne).




## Diligence et correspondance documentaire

`diligence-correspondance/` porte la recherche sourcée, le classement explicite de précédents, la comparaison financière séparée et la livraison avec note professionnelle. Le code neutre s'extrait d'un commit et d'empreintes vérifiés ; les paramètres et dossiers restent dans chaque instance. Le badge décrit un socle à raccorder, sans activation automatique des agents.
