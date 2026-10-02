# Leçons — la procédure

> ⛔ **Ce fichier n'est PAS injecté à l'ouverture de séance, et c'est le point.**
> Il dit **comment** tenir `memoire/LECONS.md` : le sceller, le propager, le
> vérifier. On ne le lit qu'au moment où l'on propage — quelques fois par
> semaine — alors que les leçons, elles, se lisent à chaque séance.
>
> Séparé de `memoire/LECONS.md` le 2026-09-30, sur « élague le fichier des
> leçons » : la procédure occupait de la place dans un document que dix dépôts
> injectent en entier, pour une information dont aucune séance n'a besoin tant
> qu'elle ne propage pas.
>
> ⚠️ **Les leçons que cette procédure a values, elles, ne sont pas ici** : elles
> sont restées dans `memoire/LECONS.md`, famille 5 (« Plusieurs dépôts,
> plusieurs séances »), parce qu'une leçon se lit à l'ouverture et pas au
> moment où l'on se sert de l'outil.

### ✍️ Le mettre à jour, depuis n'importe quel dépôt

*Posé le 2026-09-11, sur demande de Paul : « il faut pouvoir le mettre à jour
tout le temps sur tous les repos ». Huit copies d'un fichier qui bouge souvent,
c'est huit vérités qui divergent — et la divergence ne se voit pas toute seule.*

**La ligne de sceau en tête** (`<!-- lecons:empreinte v… -->`) porte une
révision, une date et le sha256 du corps. Deux dépôts se comparent d'un coup
d'œil, sans réseau : même sceau, mêmes leçons.

**La marche à suivre, dans cet ordre, et elle ne se raccourcit pas :**

1. **Écrire la leçon dans Ultima**, jamais dans une copie. Si la séance est
   ouverte sur un autre dépôt, Ultima s'écrit quand même : `add_repo` puis
   l'outil GitHub d'écriture de fichier — aucun clone n'est nécessaire.
2. **Re-sceller** : `node finubar/lecons-empreinte.mjs --sceller`. Le sceau ne
   bouge pas si le corps n'a pas changé, donc re-sceller sans raison ne
   fabrique pas de fausse divergence.
3. **Propager la copie** dans les neuf autres dépôts, octet pour octet. Un
   `diff` doit revenir vide : c'est le critère de réussite, pas « ça a l'air
   pareil ».
   ⛔ **Avant de propager, les chemins se mesurent** : `node
   finubar/lecons-chemins.mjs <dossier des dix clones>` doit rendre 0. Un
   chemin propre à un seul dépôt, cité sans son préfixe, se lit depuis les neuf
   autres comme un fichier local — un renvoi mort qui a l'air valide. *Payé le
   02/10 : sept chemins nus, trouvés un par un par la relecture Codex, ont coûté
   deux tours de propagation (v59 → v60 → v61) sur les dix dépôts.*
4. **Le dire dans le commit du travail** qui a révélé la leçon — pas dans un
   commit séparé « docs » qu'on écrit un autre jour, et qu'on n'écrit donc pas.

⛔ **Le sceau se vérifie, sinon il ment.** `node finubar/lecons-empreinte.mjs
--verifier` échoue si le fichier a changé sans être re-scellé, et il tourne dans
`tests/lancer.sh`. Une empreinte oubliée est **pire** que pas d'empreinte : elle
affirme une identité fausse, et deux copies réellement différentes affichent
alors le même sceau.

⚠️ **Ce qui n'est PAS automatique, et doit être su** : aucun contrôle **en
CI** ne compare la copie d'un dépôt à la source. Le sceau rend la divergence
**visible** au lecteur, il ne la **détecte** pas tout seul — un contrôle croisé
automatisé exigerait un jeton d'accès inter-dépôts, c'est-à-dire un secret,
donc une décision de Paul.

En attendant le contrôle en CI, c'est l'étape 3 qui tient, et elle est humaine.
