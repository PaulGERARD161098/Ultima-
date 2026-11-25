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


## ⑧ IFULVIN, LE MACRO-RÉSEAU — cadrage de la pensée et pré-écriture (25/11/2026)

> Dicté par Paul le 25/11. **Cadrage et pré-écriture, aucun code.** L'architecture
> décrite ici est une **cible à valider**, pas un ordre de construction.
> Ce bloc **remplace la lecture du §0** : IFULVIN n'est plus un réseau « à bâtir »
> à côté de RIVEN. Il est le système qui fait travailler la donnée de RIVEN.

### 8.1 La définition, en une phrase

**IFULVIN est le macro-réseau de Paul : pour toute question ou demande, pro ou
perso, il dit comment y répondre, avec qui, et pourquoi.** C'est l'arme de
Paul, sa plus-value : *« le réseau est une force ; c'est parce qu'on connaît
bien les gens, qu'on est organisé et qu'on travaille bien qu'on récupère du
business, pas l'inverse »* (Paul, 25/11).

### 8.2 Les trois étages, une seule donnée

| Étage | Qui | Rôle |
|---|---|---|
| **Front-office** | **Léo** | La seule interlocutrice. Paul lui parle par la voix, par écrit ou en lui confiant un mail. Elle pilote dans tout Ultima et va chercher la réponse. |
| **Middle-office** | **IFULVIN** | Le système : cercles, boussole, orientation, suivi, capitalisation. |
| **Back-office** | **RIVEN** | La donnée sauvegardée : fiches, coordonnées, pièces, liens, journal. |

⛔ **La donnée est commune et unique.** Elle vit dans la base Ultima (tables de
RIVEN). IFULVIN n'en garde **aucune copie** : il lit et écrit dans RIVEN. Léo
n'a **aucune mémoire propre** du réseau : elle passe par IFULVIN. Une
information n'existe qu'à un endroit, sinon deux vérités divergent (JL, EB).

### 8.3 Les destinations d'une demande

Les **trois activités pro de Paul** sont des projets distincts d'IFULVIN, mais
elles en sont des **destinations**, au même titre que le réseau :

1. **RénoBoost** ;
2. **Sola Air Paris** ;
3. **l'AMO**, que Paul monte avec Julien LAUDY ;
4. **un membre du réseau** : artisan, fournisseur, prescripteur, partenaire ;
5. **personne**. La demande est **gardée** : elle signale un trou du réseau à
   combler.

⛔ **IFULVIN ne parle pas d'argent** : ni prix, ni commission, ni facturation.
Le commercial vit dans chaque activité. IFULVIN organise, c'est tout.

### 8.4 La méthode : cinq gestes, rien ne part à la poubelle

1. **Capter.** Un seul geste : le dire à Léo (voix, écrit, mail). Jamais un
   deuxième endroit de saisie.
2. **Qualifier.** Léo demande seulement ce qui manque pour orienter : besoin,
   zone, délai, niveau de service attendu, taille du chantier.
3. **Orienter.** Léo propose une destination (§8.3) avec la boussole (§8.5),
   et dit **pourquoi**.
4. **Suivre.** Qui a reçu quoi, quand ; qui relancer, sur quoi, à quelle date.
5. **Capitaliser.** Chaque demande enrichit le réseau, y compris celle restée
   sans réponse. **Aucune n'est supprimée** : une demande se clôt, elle ne
   s'efface pas.

### 8.5 La boussole : trois aiguilles (validée par Paul le 25/11)

- **Confiance**, ce sont les cercles :
  - cercle 1 : confiance totale ;
  - cercle 2 : on a déjà travaillé ensemble ;
  - au-delà : la personne est repérée.

  La règle d'entrée dans un cercle (parrainage ou autre) reste ouverte
  (§⑤-2 du 30/09).
- **Capacité** : la taille de chantier qu'un membre peut tenir. Ce n'est pas un
  prix, c'est un critère d'orientation. Exemple de Paul : un chantier à
  100 k€ va à Mickael (PILOS, BELKI), pas à SPC.
- **Assurance** : ce que la décennale couvre réellement, et jusqu'à quand.
  Exemple : Roger est déclaré plombier au Kbis, mais n'est assuré que pour la
  couverture.

Le métier et la zone filtrent avant la boussole. À critères égaux, le cercle 1
passe devant.

### 8.6 L'état mesuré au 25/11 (base relue après chaque écriture)

- **RIVEN : 136 fiches** (111 au début de la séance). 31 portent la marque
  `[IFULVIN]` dans leurs notes. 25 fiches ont été créées, les autres
  complétées, sur mandat de Paul, en transactions verrouillées contre les
  doublons (nom et téléphone). Un
  doublon créé à tort (« Julien LODI », dictée de Julien LAUDY, déjà en base)
  a été supprimé sur l'accord explicite de Paul, après vérification qu'aucune
  donnée n'en dépendait.
- **Réseau d'accompagnement** (libellé Gmail « 02 - Réseau ») : Maël FLEURET
  (CCI Paris), Vincent OLIVEIRA (WEBYN), Valérie DUVAL (conseillère CCI),
  Jean-Luc PRADAL (Association Suzanne Michaux), Jean PAYS (Compétences &
  Stratégie), Thibault GONNET (Nortrade / Sonupac, lié à IceStream).
- **Cercle 1** : Mickael BENICI (PILOS, BELKI ; identité à confirmer), Romin
  (dicté « Roman »), Matthieu DUCREST et SOLA GROUPE, Fayçal (maître d'œuvre),
  Nourdine (BRAVO TRAVAUX), Julien LAUDY, Slavie.
- **Cercle 2** : Aïtem CHAFFAR (MY DELIHOME, dicté « My Daily Home »), Esdine
  (SPC ; interlocutrice Asmaa), et 9 artisans du tableau Leroy Merlin de Paul :
  SUN CLIMAT, PRO CLIMAT, Stefan STAVILA, MAUGINO VINCENT, GAZTHERM, ILIA'SOLS,
  LES ARTISANS PARISIENS, BIVOL VALERIU, REBAC FENÊTRES.
- **Repérés, sans cercle** (Paul ne les connaît pas) : SOCIÉTÉ DATA PHONE, LJN
  MENUISERIE ET AGENCEMENT, LES MAÎTRES BÂTISSEURS. **Non recommandé, gardé** :
  FCR JP. BRAVOTRAVO du tableau est rapproché de Nourdine (BRAVO TRAVAUX).
- **Repéré, sans cercle** : Roger GOURDIN (GIAGO, couvreur). **Cercle 2** :
  Jérémy CABIEU (KLIMA, fournisseur).
- **Trous mesurés** :
  - prestations renseignées sur 3 fiches sur 111 avant la séance ;
  - fiabilité et capacité : 0 fiche ;
  - aucune fiche métal, acier, serrurerie ou ferronnerie ;
  - un seul lien entre fiches (un apport d'affaires).
- **Constat décisif** : la Léo d'Ultima ne reçoit qu'un état borné (comptes et
  intitulés, `api/leo.js`). Elle **ne peut pas** aujourd'hui répondre « qui
  j'appelle ». Ce choix de minimisation est délibéré : il se rouvre sous revue
  de sécurité, il ne se contourne pas.
- **Source mail du réseau** : la boîte pro est lisible en séance (libellés
  « 02 - Réseau », 20 fils, et « 02 - Réseau/Consortium artisans »). La Léo
  d'Ultima, elle, ne lit aucune boîte mail.

### 8.7 L'architecture cible (pré-écriture, à valider, aucun code)

**Données, dans RIVEN.** On réutilise d'abord l'existant :

| Besoin d'IFULVIN | Déjà là | À ajouter, plus tard |
|---|---|---|
| Qui existe, ce qu'il fait, ses coordonnées | `network_nodes` | — |
| Confiance, capacité, assurance | — (provisoire : notes `[IFULVIN]`) | trois informations sur la fiche : cercle, capacité, périmètre assuré avec sa date de fin |
| Qui a été mis en relation avec qui | `network_edges` (apport d'affaires, sous-traitance, chantier commun ; statut de l'idée au fructueux) | — |
| Relances datées | `journal` (`relance_at`) | — |
| Les demandes reçues | — | une **demande** : reçue le, apportée par qui, sphère pro ou perso, besoin, destination, statut, jamais supprimable |
| Les trois activités comme destinations | SOLA GROUPE existe comme fiche | une fiche par activité (RénoBoost, Sola Air Paris, AMO), pour qu'une demande pointe vers une activité **comme** vers un artisan : une seule mécanique |

**Système, IFULVIN.** Un seul module côté serveur porte les cinq gestes :
capter, qualifier, chercher avec la boussole, orienter, suivre. Léo et l'écran
IFULVIN appellent **le même** module. Il n'y a pas de logique en double.

**Invocable, par trois portes, sur le même système :**
1. **Léo, depuis n'importe quelle page d'Ultima** (« Léo partout ») : « qui
   j'appelle pour… », « note cette demande », « qui je relance ? ». Ses
   écritures suivent le régime existant des cartes de Léo (orange par défaut,
   journalisées dans `leo_ecritures`, défaisables).
2. **L'écran IFULVIN**, sur l'étoile qui existe déjà dans la constellation des
   ARMES : le cockpit de pilotage (demandes par statut, relances dues, trous du
   réseau). C'est la règle « pilotage en back-office », sans copie de données.
3. **En séance Claude Code**, une compétence `ifulvin` (sur le modèle de
   `finubar` et `zohshia`) interroge la même base. C'est ce qui a été fait à la
   main le 25/11.

**ZS** :
- Alternative de l'année : un CRM du marché. Écartée : nouveau service, nouvelle
  dépense, donnée en double, et Léo est déjà le front.
- Alternative interne : réutiliser `network_nodes.type = 'lead'` pour les
  demandes (0 ligne). Écartée : une demande n'est pas une personne.

On garde Supabase, Vercel et Léo, déjà payés. Les appels de Léo restent sous
le plafond existant (100 par 24 h).

### 8.8 Sécurité et RGPD

- On stocke des données de **tiers**. Les notes écrivent des **faits**
  (« pièces à vérifier »), pas des jugements sur les personnes. Une note
  existante sur la maîtrise du français d'un membre est à reformuler, sur
  accord de Paul.
- Les téléphones ne partent vers l'API Anthropic que bornés (quelques fiches par
  réponse), après revue de `securite-auditeur` et accord de Paul.
- Aucun envoi réel : Léo dépose des brouillons, Paul envoie.
- Rien de supprimable. Les journaux ne contiennent que des identifiants.

### 8.9 Critères de réussite (vérifiables, le jour de la construction)

1. **« Qui j'appelle pour une toiture à Paris ? »** → Roger, son téléphone, son
   périmètre assuré, son cercle.
2. **Roger → Benjamin (Mon Chasseur Immo)** → Léo propose la mise en relation,
   limitée à la couverture, et dépose le brouillon.
3. **Les poteaux en acier en T de 3 m (demande perso)** → « personne dans le
   réseau » ; la demande est gardée et apparaît comme un trou à combler.
4. **Restaurant P17** → Léo sait qu'il faut relancer le client, puis confirmer
   à Jérémy (KLIMA).
5. **Une clim chez un particulier** → destination Sola Air Paris.
6. **Aucune demande ne peut être supprimée**, même par le propriétaire. La
   preuve est un test qui vire au rouge si on l'autorise.

### 8.10 Ce qu'on ne fait PAS

Pas de code, pas de migration, pas de push avant la fin de séance. Pas de prix
dans IFULVIN. Pas d'envoi réel. Pas de lecture automatique des mails par la Léo
d'Ultima à ce stade. Pas de nouvel outil hors d'Ultima. RénoBoost, Sola Air
Paris et l'AMO gardent leurs propres outils.

### 8.11 Pre-mortem — « IFULVIN a échoué dans trois mois : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| Capter coûte trop : Paul arrête de dire ses demandes à Léo | un seul geste, une phrase suffit ; Léo complète, Paul dit oui |
| La donnée reste pauvre (prestations, capacité, assurance vides) : la boussole tourne à vide | chaque demande et chaque mail du réseau enrichit une fiche ; les trous sont affichés |
| Deux vérités (une copie dans IFULVIN ou chez Léo) | §8.2 : une seule donnée, dans RIVEN |
| Léo recommande hors assurance ou après l'échéance de la décennale | aiguille « assurance » avec date de fin |
| Un membre de cercle 1 n'est plus fiable | cercle révisable ; réserve montrée avec la recommandation |
| On construit une grosse architecture avant d'avoir la pensée | ce bloc : la pensée d'abord, la construction par petits pas ensuite |
| Les coûts montent (CI, Vercel, appels) | une PR par séance ; documentation seule = build Vercel sauté ; plafond d'appels de Léo |

### 8.12 Ordre de construction proposé (quand Paul dira go, pas avant)

1. **La donnée** : cercle, capacité, assurance ; la demande ; les trois
   activités comme fiches.
2. **Léo lit** : « qui j'appelle », sous revue de sécurité.
3. **Léo capte** : enregistrer une demande et l'orienter.
4. **Le cockpit** IFULVIN.
5. **Le mail** : Léo reçoit un mail confié.

Chaque étape se cadre en 6 points avant la première ligne (EL).

### 8.13 Décisions rendues par Paul le 25/11

- **RIVEN fait référence.** Le Google Sheet « Vivier artisans 93 connus » devient
  une archive. Les nouveaux contacts passent par Léo (ou par une séance) et vont
  dans RIVEN, pour qu'il n'y ait qu'une seule vérité.
- **Mickael BENICI (PILOS, BELKI) reste en cercle 1.** Il est concurrent comme
  prospect RénoBoost, mais c'est un partenaire de toute confiance : les deux
  axes sont distincts.
- Les mails du tableau Leroy Merlin sont complétés (capture non tronquée).
- **Roger GOURDIN** : repéré, sans cercle (pièces vérifiées, jamais travaillé
  ensemble). **Jérémy CABIEU (KLIMA)** : cercle 2 (déjà travaillé ensemble).
  Orthographe : **Fayçal**.

### 8.14 Décisions ouvertes (Paul)

1. Le sens de « CCDI » dans la fiche de Fayçal.
2. La règle d'entrée dans un cercle (reportée le 30/09).
