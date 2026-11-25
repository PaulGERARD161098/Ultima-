# CADRAGE — IFULVIN, la constellation des ARMES, la constellation des DRAGONS

> Format 6 points (**directive EL**). Dicté par Paul le 2026-09-29, à la suite
> de la restructuration OMEGA. Graphie **IFULVIN**, telle que Paul l'a donnée :
> « Ifu » seul n'existe pas (correction Paul, 29/09) — on ne l'abrège jamais,
> ni dans le registre, ni dans une réponse, ni dans un libellé.
>
> ⛔ **Ce document CADRE. Il n'exécute rien** : Paul a dit « on y viendra plus
> tard, mais c'est comme ça que tu vas le cadrer déjà ». Aucune ligne de code,
> aucune migration. La boucle de code s'ouvre à son go (EB).

## 0. Ce qui existe déjà — on capitalise (EB)

| Acquis | Où |
|---|---|
| IMLADRIK est un **macro-projet** à 5 caps (MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, TAO), rendu par le noyau commun | `js/registre-lv3.mjs` (boucle OMEGA du 29/09) |
| Le réseau **en cercles concentriques** a déjà été dicté le 21/09 : idée **ADR-005 « Le Cercle »**, modèle BNI mesuré, et le point qui bloquait — **plat ou concentrique ?** | `CADRAGE-RESEAU-CERCLES.md` §1, §2, §4 |
| Un voile de nébuleuse existe déjà dans le fond du ciel (pré-rendu 256 px) | `js/ciel-fond.js` l. 76 |
| RIVEN = le réseau commercial (artisans, partenaires, leads) | `riven.html` |

⚠️ **Deux constats à ne pas perdre.**
1. Paul dit maintenant « cercles concentriques de réseau partout » : **il
   tranche §4 de CADRAGE-RESEAU-CERCLES.md en faveur du concentrique.** Ce n'est
   pas encore une règle d'admission — c'est le sens du projet. Le document du
   21/09 reste la source du modèle BNI et de ses modes de défaillance ; on ne le
   recopie pas ici.
2. IFULVIN **n'est pas une deuxième version de RIVEN**. Paul : « ça correspond un
   peu avec RIVEN, mais c'est un projet très spécial ». RIVEN gère un réseau
   commercial **existant** ; IFULVIN est un réseau **à bâtir**, par cercles.

## ① Le but — ce qui sera vrai à la fin de la boucle de structure

Dans IMLADRIK, deux **constellations** — deux nébuleuses lisibles comme telles —
regroupent des caps :

- **La constellation des ARMES.** Premier macro-projet : **IFULVIN**, l'arme
  principale de Paul pour se développer et développer ses projets. *Son réseau,
  son Magnum Opus, sa plus belle arme, son épée.* Cœur : des cercles
  concentriques de réseau, partout.
- **La constellation des DRAGONS.** MAEDRETHNIR, VRANESH, DRAUKHAIN (arbitrage
  Paul 29/09).

ADRAMELECH et TAO restent **directement** sous IMLADRIK (arbitrage Paul 29/09) ;
IMLADRIK passe donc de 5 caps à 4 entrées : les deux constellations + ADRAMELECH
+ TAO.

## ② Les étapes — dans l'ordre, une boucle chacune

1. **Boucle A — la structure, sans contenu métier.** *(30/09 — arbitrage
   Paul : « option 1, assouplis la règle pour les constellations ». Un nœud
   `constellation: true` est une boussole dès UN cap ; l'exception est un
   drapeau explicite, vérifié par `verifierRegistre`, jamais une déduction.)* Deux nœuds-constellation
   dans le registre (`constellation-armes`, `constellation-dragons`) ; les 3
   dragons y sont rangés ; `ifulvin` y entre comme **étoile d'attente** (nom,
   état « À venir », une phrase, aucune cible — modèle DOKLĚS/SYMPHO, Principe 3
   de PRODUCT.md : on ne dit que ce qui est su). Harnais transposés.
2. **Boucle B — les nébuleuses.** Rendu visuel des deux nébuleuses : un voile
   coloré par constellation derrière ses étoiles. Chaque nébuleuse a sa teinte
   (ARMES / DRAGONS), sans jamais coûter la lisibilité ni le contraste des noms.
   Cadrage visuel préalable par `graphisme` (spécifie) → `front-carto`
   (implémente) ; maquette avant le code (EL).
3. **Boucle C — IFULVIN prend corps.** Seulement quand Paul a tranché §⑤ : règle
   d'entrée et unité de mesure des cercles. Elle se cadre alors comme un projet à
   part entière (`CADRAGE-IFULVIN-…`), avec son schéma et sa RLS.

## ③ Les moyens

- Fichiers : `js/registre-lv3.mjs`, `imladrik.html` (repli `<noscript>`),
  `js/adaptateur-lv4.mjs` / `js/ciel-noeud.mjs` (rendu d'un étage à 4 entrées dont
  2 sont des constellations), `js/ciel-fond.js` (voile), `tests/`.
- Agents : `graphisme`, `front-carto`, `interface-ux`, `verificateur`.
- Aucune donnée en base à l'étape A/B : rien à migrer, aucun gate SQL.

## ④ Critères de réussite (vérifiables)

- A : le registre passe `unit-registre-lv3` ; IMLADRIK = 4 entrées ; les deux
  constellations ont chacune ≥ 1 enfant ; IFULVIN est atteignable **sans
  JavaScript** (repli `<noscript>` égal au registre) et `aria-disabled` (aucune
  page promise) ; la graphie IFULVIN est vérifiée par assertion (jamais « Ifu »).
- B : contraste des noms sur nébuleuse mesuré (`smoke-fond-contraste`, étendu) ;
  le clic va à l'étoile visée (`smoke-clic-exact`, étendu aux 2 constellations) ;
  zéro erreur console.
- Chaque harnais est validé par un sabotage volontaire (il doit virer au rouge).

## ⑤ Ce qu'on ne fait PAS dans cette boucle

- Aucune règle d'admission, aucune table, aucun écran de réseau IFULVIN.
- On **ne re-décide pas** plat vs concentrique (dit : concentrique) ni le modèle
  BNI (`CADRAGE-RESEAU-CERCLES.md`).
- On ne touche ni à RIVEN, ni au contenu de MAEDRETHNIR / VRANESH / DRAUKHAIN.
- Pas de nouvel outil à côté d'Ultima (directive JL).

**À trancher par Paul avant la boucle C (registre des arbitrages)** :
1. ✅ **Tranché le 30/09 : IFULVIN REMPLACE l'idée « Le Cercle »** (Paul : « oui
   remplace »). Le Cercle ne vit plus comme idée séparée : son contenu
   (`CADRAGE-RESEAU-CERCLES.md` §1–§4, modèle BNI, pre-mortem « exclusivité ET
   contrainte ») devient le matériau d'IFULVIN. ⚠️ Le numéro « ADR-005 » que lui
   donnait la capture du 21/09 est **en collision** avec ADR-005 CHAMBRE CLAIRE
   (`adramelech/IDEES.md` l. 762) : il n'est pas à saisir.
2. ⏭ Reporté (Paul, 30/09 : « on verra ») — un membre entre-t-il dans un cercle
   **par parrainage du cercle visé**, ou autrement ? (§4 du 21/09.)
3. ⏭ Reporté (Paul, 30/09 : « on verra ») — le nom des cercles / des niveaux.

## ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| On code IFULVIN comme un RIVEN bis (fiches, filtres, leads) | ⑤ : IFULVIN reste étoile d'attente jusqu'à la boucle C |
| Le nom dérive (« Ifu », « Ifulvine »…) | assertion sur la graphie exacte dans le registre et les harnais |
| Les nébuleuses embellissent mais rendent les noms illisibles | critère B mesuré, pas jugé à l'œil ; teinte plafonnée |
| Le clic « rate » une étoile dans une constellation (défaut déjà payé le 25/09) | `smoke-clic-exact` étendu ; dépliage au survol non ajouté |
| Un cap disparaît en changeant de rang (ADRAMELECH, TAO) | test « chaque cap du registre est atteignable depuis l'accueil » |
| On ouvre la boucle C par enthousiasme, sans §⑤ tranché | gate EL : elle ne s'ouvre pas tant que les 3 arbitrages ne sont pas rendus |

**Décisions attendues de Paul** : les 3 arbitrages du §⑤. **Prochaine action
unique** : finir la boucle OMEGA (tests, commit), puis boucle A.

---

## ⑦ BOUCLE B — les nébuleuses (cadrage 6 points, 30/09, « go solo, enchaîne sur les nébuleuses »)

> ✅ **Fait le 30/09** — fusionné avec la boucle C (#316, `4b8e2de`). Boucle A : #313. Harnais : `tests/smoke-nebuleuses.mjs` (5 sabotages mordent). Boucle C (dictée le même jour) : TAO supprimé, DRAGONS = MAEDRETHNIR, VRANESH, DRAUKHAIN, ADRAMELECH, RESHIRAM ⇄ ZEKROM, étoiles indépendantes sauf la passerelle.

**① But.** Sur l'écran IMLADRIK, la constellation des ARMES et celle des DRAGONS
se lisent comme **deux nébuleuses** : un voile coloré, propre à chacune,
enveloppe leur étoile. Quand on plonge dans l'une (`#constellation-armes`,
`#constellation-dragons`), sa nébuleuse enveloppe les étoiles qu'elle contient.
Deux teintes distinctes, dans le registre antique et nocturne d'Ultima.

**② Étapes.**
1. Spécification visuelle (agent `graphisme`) : deux teintes, rayon, éclat
   plafonné, comportement sous `prefers-reduced-motion` et à 390 px.
2. Moteur : une option **opt-in** `nebuleuses` de `UltimaCiel.rendre` —
   `[{ ids: [...], teinte }]` — peinte **par la couche de fond**
   (`js/ciel-fond.js`), avec la projection du moteur (aucune caméra propre : la
   règle de phase du LV5 tient). Sans l'option, rendu strictement identique.
3. Registre : `nebuleuse: 'armes' | 'dragons'` sur les deux constellations ;
   `js/ciel-noeud.mjs` en déduit les groupes (étoile de la constellation à
   l'écran parent ; ses enfants quand elle est isolée).
4. Harnais : mesure de pixels sous chaque nébuleuse (teinte présente, et
   différente entre les deux) ; contraste des noms inchangé ; phase tenue ;
   aucun autre écran touché.

**③ Moyens.** `js/ciel.js` (option, transmission des positions projetées),
`js/ciel-fond.js` (voile ancré), `js/registre-lv3.mjs`, `js/ciel-noeud.mjs`,
`tests/`. Aucune donnée, aucun SQL, aucune dépendance.

**④ Critères de réussite (vérifiables).**
- Sur `imladrik.html` : la moyenne de couleur d'un disque autour de l'étoile
  ARMES diffère mesurablement de celle autour de DRAGONS, et de la même zone
  **sans** l'option (témoin).
- La nébuleuse suit son étoile : écart de phase ≤ 1 px (même méthode que
  `smoke-lv5-fond`).
- Contraste des noms : `smoke-fond-contraste` et `smoke-noms-lisibles` verts,
  étendus à `imladrik.html` et ses deux isolements.
- Tous les autres écrans (accueil, ALPHA, OMEGA, TAO, BCP, ADRAMELECH, RIVEN) :
  aucun pixel de nébuleuse (l'option n'y est pas passée).
- Zéro erreur console ; coût de peinture sous le budget de `smoke-lv5-fond`.

**⑤ Hors périmètre.** Aucune armoirie nouvelle (blasons provisoires gardés) ;
aucune animation propre aux nébuleuses ; pas de contenu IFULVIN ; RIVEN
intouché.

**⑥ Pre-mortem.**

| Mode de défaillance | Ce qui le prévient |
|---|---|
| La nébuleuse glisse sous l'étoile (deux repères) | peinte par le fond avec la projection du moteur ; test de phase |
| Elle écrase les noms (contraste) | éclat plafonné, mesuré par `smoke-fond-contraste` |
| Elle déborde sur les autres écrans | option opt-in, passée seulement si un nœud visible porte `nebuleuse` ; test négatif |
| Test vert par le mauvais chemin (mesure sur fond déjà coloré) | témoin sans l'option, sabotage (teinte identique ⇒ rouge) |
| Le rendu « embellit » au détriment du sérieux antique | teintes spécifiées par `graphisme`, capture relue avant commit |

---

## ⑧ IFULVIN DEVIENT LE BACK-OFFICE DU RÉSEAU — séance du 25/11/2026

> Dicté par Paul le 25/11. **Ce bloc précise le §0** : IFULVIN n'est plus un
> réseau « à bâtir » à côté de RIVEN. **RIVEN est la donnée brute, IFULVIN en
> est l'exécution** : cercles de confiance, demandes entrantes, orientation,
> mises en relation, relances. Léo est le front-office ; IFULVIN est le
> back-office. Le §⑤ « aucune table » du 29/09 est levé pour la boucle D, et
> pour elle seule.
>
> Paul, 25/11 : *« rien ne part à la poubelle […] tout doit être cartographié,
> recensé, avec les dates : qui fait quoi, comment ; si je donne le lead, qui
> fait quoi ; qui je relance, quoi et comment. »* Et : *« on fait de
> l'installation, des travaux à domicile : il ne faut pas se tromper de
> combat. »*

### Ce qui a été fait en séance (base relue après écriture)

- **12 fiches RIVEN** portent la marque `[IFULVIN]` dans leurs notes (cercle,
  rôle, réserve). 7 fiches créées, 5 complétées ; total 111 → 118. Les
  écritures ont été faites sur mandat explicite de Paul, en transaction
  verrouillée (refus si doublon ou second passage).
- **Cercle 1** : Mickael BENICI (PILOS, BELKI ; identité à confirmer), Romin
  (dicté « Roman »), Matthieu DUCREST / SOLA GROUPE, Faycal (maître d'œuvre),
  Nourdine (BRAVO TRAVAUX), Julien LODI, Slavie. **Cercle 2** : Aïtem CHAFFAR
  (MY DAILY HOME), Esdine (SPC). **Sans cercle** : Roger GOURDIN (GIAGO,
  couvreur), Jérémy CABIEU (KLIMA, fournisseur).
- ⚠️ **Provisoire** : le cercle vit dans les notes tant que la colonne n'existe
  pas (D1). La marque `[IFULVIN]` sert de clé pour le reprendre.
- **Constat qui fonde la boucle D** : la Léo d'Ultima **ne peut pas** répondre
  « qui j'appelle ». `api/leo.js` ne lui transmet qu'un état borné (comptes et
  intitulés), jamais une fiche, une note ou un téléphone. C'est un choix de
  minimisation, à rouvrir sous revue de sécurité, pas à contourner.

### Les trois cas qui servent de critère de réussite

1. **Roger → Benjamin (Mon Chasseur Immo)**. Un couvreur cherche des clients,
   un partenaire a des acheteurs qui rénovent. Léo propose la mise en relation,
   **dans le périmètre assuré** (décennale = couverture seule), avec Paul en
   intermédiaire, et dépose le brouillon.
2. **Les poteaux en acier en T de 3 m (demande perso)**. Personne dans le
   réseau ne fait du métal (mesuré le 25/11 : 0 fiche métal, acier,
   serrurerie, ferronnerie). Léo le dit, **la demande est gardée** comme
   « non servie », et elle devient une piste pour enrichir le réseau.
3. **Restaurant P17 (chiffrage Midea, KLIMA)**. Une affaire en suspens : Léo
   sait qui relancer (le client, puis Jérémy), sur quoi, et à quelle date.

### ① Le but

Toute demande, pro ou perso, est **enregistrée, qualifiée, orientée et suivie
jusqu'à son issue**. Aucune n'est supprimée. À chaque question, Léo répond par
un nom du réseau, ce qu'il fait, son téléphone et la raison du choix, ou
« personne », et la demande reste. **MS** : rapproche du prochain chantier
confié ou vendu. Indicateur lu en base : demandes reçues, orientées, gagnées
(en propre ou par apport), et délai entre réception et orientation.

### ② Les étapes — une boucle chacune

- **D1 — le schéma.** Une migration rédigée par `data-ingenieur` et
  **appliquée par Paul**. Elle ajoute à `network_nodes` le `cercle` (1 à 3) et
  le montant de chantier au-delà duquel on oriente ailleurs. Elle crée la table
  `demandes` : reçue le, qui l'apporte (fiche RIVEN), canal, sphère pro ou
  perso, besoin, catégorie, budget estimé, qualité, exigence de service,
  décision, destinataire, statut, prochaine relance. Pas de politique
  `DELETE` : une demande se clôt (« sans suite »), elle ne s'efface pas. Les
  relances réutilisent `journal` (`relance_at` existe déjà). Reprise des
  marques `[IFULVIN]` dans la colonne `cercle`, puis retrait des marques.
- **D2 — Léo enregistre et qualifie.** Sur une demande dictée, Léo pose trois
  questions au plus (budget, délai, niveau de service attendu) et propose la
  décision :
  - en propre (clim par Sola) ;
  - sous-traitance (Romin : salle de bain, travaux généraux) ;
  - AMO ;
  - partenaire du réseau ;
  - personne.

  L'écriture suit le régime des cartes de Léo (orange par défaut).
- **D3 — Léo cherche dans le réseau.** Un outil de lecture borné : métier,
  zone, cercle, montant → cinq fiches au plus, chacune avec la raison du choix.
  Il exclut ce qui sort du périmètre assuré quand il est connu. **Gate** : revue
  `securite-auditeur` (téléphones envoyés à l'API Anthropic) et accord de Paul.
- **D4 — le pilotage.** La vue back-office d'IFULVIN : demandes par statut,
  relances dues, qui a reçu quoi et quand. Elle vit dans IFULVIN, pas dans un
  outil à côté (JL, et la règle « pilotage en back-office »).

### ③ Les moyens

`supabase/migrations/` (nouvelle migration), `api/_lib/leo.js` (outils),
`api/reseau/` (lecture et écriture des demandes), une page IFULVIN branchée sur
l'étoile qui existe déjà, `tests/`. Agents : `data-ingenieur`,
`securite-auditeur`, `front-carto`, `verificateur`.

**ZS** : l'alternative de l'année est un CRM du marché ou un tableur partagé.
Elle est écartée : la donnée est déjà dans RIVEN, et Léo est déjà le front. Un
second outil créerait deux vérités (JL). On garde Supabase et Léo, et on ne
crée qu'une table. L'alternative interne serait de réutiliser
`network_nodes.type = 'lead'` (0 ligne à ce jour). Elle est écartée aussi : une
demande n'est pas une personne, et ses champs (décision, qualité, relance)
pollueraient la fiche.

### ④ Critères de réussite (vérifiables)

- Les trois cas ci-dessus passent de bout en bout, joués en production, avec la
  base relue.
- Aucune demande ne peut être supprimée. Une tentative `DELETE` sous le rôle du
  propriétaire est refusée par la RLS ; harnais avec sabotage.
- Une fiche de cercle 1 ressort avant une de cercle 2 à critères égaux. Un
  chantier au-delà du montant d'un artisan ne lui est pas proposé.
- Léo ne propose jamais Roger pour de la plomberie (périmètre assuré).
- Chaque harnais vire au rouge quand on casse ce qu'il garde.

### ⑤ Ce qu'on ne fait PAS

Aucun envoi réel : Léo dépose des brouillons, Paul envoie. Pas de lecture
automatique de la boîte mail pour créer des demandes (boucle ultérieure). Pas
de scraping, pas de notation publique des artisans, pas de nouvel outil hors
d'Ultima. RenoBoost et RenoDevis ne sont pas touchés.

### ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| La saisie est trop lourde, Paul arrête de dicter | trois questions au plus ; Léo propose, Paul dit oui |
| Une demande « sans intérêt » est effacée, la mémoire du réseau se perd | pas de `DELETE` en RLS ; statut « sans suite » |
| Léo recommande quelqu'un hors de son assurance ou à la décennale expirée | périmètre assuré et date de fin stockés ; filtre dans l'outil |
| Un membre de cercle 1 n'est plus fiable (ex. Romin : « attention aux papiers ») | réserve affichée avec la recommandation ; cercle révisable |
| Fuite de téléphones vers l'extérieur | outil borné à cinq fiches, revue de sécurité, journal des lectures |
| Les demandes perso polluent le pilotage pro | champ « sphère », filtres séparés |
| Doublons de fiches (la même personne dictée deux fois) | verrou d'existence à l'écriture, comme le 25/11 |

**Décisions attendues de Paul avant D1** :
1. La grille de qualité d'une demande (proposition : budget, délai, exigence
   de service, zone).
2. La règle d'orientation : à partir de quand Sola en propre, Romin ou l'AMO ?
3. Le cercle de Roger et de Jérémy.
4. Les artisans de Laura Merlin (cercle 2) : leurs noms.

**Prochaine action unique** : D1 — `data-ingenieur` rédige la migration ; Paul
l'applique.
