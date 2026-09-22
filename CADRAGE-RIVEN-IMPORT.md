# CADRAGE — RIVEN se remplit d'un coup : importer les contacts de l'iPhone

> Format 6 points exigé par la **directive EL** (le COMMENT avant le travail).
> Demandé par Paul le **2026-09-22** : *« est-ce que je peux importer des contacts
> de mon iPhone dans Ultima pour Riven ? »* puis *« oui, en boucle suivante, j'ai
> environ 500 contacts — il me faut cette fonction qui dort depuis juillet »*.
>
> C'est le point 6 de `ROADMAP-SITE.md` (« Import CSV de contacts existants »),
> au vivier depuis juillet. **Ce cadrage le remplace** : l'iPhone exporte en
> vCard, pas en CSV (§0).
>
> ⛔ **Statut : BOUCLE SUIVANTE, pas la boucle en cours.** Elle s'ouvre quand
> la saisie ADRAMELECH (ADR-005, ADR-006) et VRANESH est faite (Directive EB).
> Ce qui est livré ici, c'est le cadrage et la maquette. Aucune ligne de code
> produit n'est écrite avant.

---

## 0. Ce que la mesure a changé au cadrage

Mesure faite en production le **2026-09-22** (lecture seule) :

| Table | Lignes | Ce que ça implique |
|---|---|---|
| `network_nodes` (fiches) | **6** | Il y a très peu de fiches, et chacune a un type obligatoire. |
| `personnes` | **0** | Le registre des personnes est vide. |
| `personne_noeuds` (rattachements) | **0** | — |

Trois conséquences :

1. **Un contact iPhone est une PERSONNE, pas une fiche.** Une fiche RIVEN est une
   entreprise, un chantier ou un lead, et elle exige un **type**. Une vCard décrit
   un individu : nom, poste, téléphone, e-mail, et parfois son entreprise (`ORG`).
   Depuis 0024, les personnes ont leur propre table, faite pour ça. L'import
   remplit donc **`personnes`**. Il ne crée pas de fiche.
2. **Aucune migration n'est nécessaire.** `personnes` porte déjà `nom`,
   `fonction`, `telephone`, `email` et `notes`. Il n'y a donc pas de gate SQL à
   franchir.
3. **Au premier import, les doublons viennent du fichier lui-même** (le registre
   est vide). La même personne peut y figurer deux fois, et les iPhone en sont
   pleins. Le dédoublonnage doit donc marcher à l'intérieur du fichier, et pas
   seulement contre la base.

Et un fait sur la source : **l'iPhone exporte en vCard (`.vcf`)**, soit par
iCloud.com → Contacts → sélection → « Exporter la vCard », soit par le partage
d'un contact depuis l'app. Un CSV n'arriverait qu'en passant par un outil tiers.
C'est une étape de plus pour Paul, et une donnée de plus qui transite ailleurs.

---

## 1. ① Le but — ce qui sera vrai à la fin

**Paul importe ses ~500 contacts iPhone dans RIVEN en moins de 10 minutes, et
seuls ceux qu'il a choisis entrent.**

1. Depuis RIVEN, un geste « Importer des contacts » accepte un fichier `.vcf`.
   **Le fichier est lu dans le navigateur.** Il ne part vers aucun service, et
   seules les lignes retenues sont envoyées à l'API d'Ultima.
2. Un **écran de tri** liste les contacts lus. **Aucun n'est coché par défaut** :
   Paul coche ce qui est pro. Il peut filtrer (texte, « a une entreprise »,
   « doublon ») et cocher tout ce que le filtre affiche en un geste.
3. Les **doublons** sont marqués : même téléphone normalisé ou même e-mail en
   minuscules, dans le fichier ou contre le registre. Par défaut, le doublon est
   **fusionné** en une seule personne, avec les champs du premier complétés par
   ceux du second, sans jamais écraser.
4. Si le contact a une entreprise (`ORG`) et qu'une fiche porte **exactement** ce
   nom, l'écran propose de **rattacher** la personne à cette fiche. Il ne crée
   jamais de fiche tout seul.
5. L'envoi est annoncé : « 212 personnes créées, 9 rattachées, 3 refusées ».
   Pour chaque refus, la ligne et la raison sont données, sans le contenu.

**Correspondance des champs** (vCard → `personnes`) :

| vCard | `personnes` | Règle |
|---|---|---|
| `FN` (sinon `N` recomposé, sinon `ORG`) | `nom` | 1 à 200 caractères. Sans nom, la ligne est refusée. |
| `TITLE` | `fonction` | ≤ 120, tronqué avec « … » signalé |
| premier `TEL` (préférence `CELL`, puis `WORK`) | `telephone` | ≤ 30, normalisé `+33…` quand il est français |
| premier `EMAIL` (préférence `WORK`) | `email` | forme validée par `EMAIL_RE`, sinon le champ reste vide et c'est signalé |
| `ORG` | `notes` : « Entreprise : X » | + proposition de rattachement (point 4) |
| `PHOTO`, `ADR`, `BDAY`, `NOTE`, `URL`, `X-*`, … | — | **Ignorés** (minimisation RGPD) |

---

## 2. ② Les étapes

0. **Maquette validée par Paul** : `design/preview-riven-import.html` (livrée avec
   ce cadrage). On ne code pas avant son « c'est ça ».
1. **`js/vcard.js`, le lecteur**, pur et sans DOM : il déplie les lignes (RFC
   6350 §3.2), désespace (`\,` `\;` `\n`), décode le `QUOTED-PRINTABLE` des vieux
   exports 2.1, et **saute `PHOTO` sans la stocker**. Il renvoie
   `{ contacts, rejets }` et ne lève jamais d'exception sur un fichier mal formé.
2. **`js/import-dedoublon.js`** : normalise le téléphone et l'e-mail, puis
   regroupe les doublons (fichier + registre).
3. **`api/reseau/import.js`** : un `POST` par lots de **100 personnes au plus**,
   chaque ligne passée par le **`validatePersonne` existant**. Le client est
   celui de l'utilisateur (`requireUser`, RLS), **jamais `service_role`**.
   L'insertion se fait par lot, plus les rattachements demandés (validés par
   `validateRattachement`, sur des `node_id` appartenant à Paul). La réponse
   donne les comptes et les index refusés.
   *Pourquoi une route et pas 500 appels à `/api/reseau/personnes` : 500 allers-
   retours donnent un import de plusieurs minutes, fragile à la moindre coupure,
   et impossible à annoncer proprement.*
4. **`riven.html` + `js/app.js`** : le bouton, le sélecteur de fichier et l'écran
   de tri, dans le registre existant (formulaires de `CADRAGE-RIVEN-SAISIE.md`).
5. **Harnais** : `tests/unit-vcard.mjs` (lecteur), `tests/unit-import-api.mjs`
   (route) et `tests/smoke-import.mjs` (le vrai geste dans Chromium), branchés
   dans `tests/lancer.sh`. Le patrimoine **complet** doit tourner.
6. **Dry run adverse** (Directive DR), puis `/securite-max`, parce que la route
   écrit en base.

---

## 3. ③ Les moyens — ce qui est touché

| Fichier | Nature |
|---|---|
| `js/vcard.js` | neuf (lecteur pur) |
| `js/import-dedoublon.js` | neuf (normalisation + regroupement) |
| `api/reseau/import.js` | neuf (route par lots) — **touche aux données → escalade signalée** |
| `riven.html`, `js/app.js`, `css/` | bouton + écran de tri |
| `tests/unit-vcard.mjs`, `tests/unit-import-api.mjs`, `tests/smoke-import.mjs` + `tests/fixtures/*.vcf` | neufs, fixtures **inventées** |
| `supabase/migrations/` | **rien** |

Les fixtures `.vcf` sont écrites à la main, avec des noms inventés. **Le fichier
réel de Paul ne transite jamais par le dépôt ni par une séance** : il le dépose
lui-même dans son navigateur.

---

## 4. ④ Les critères de réussite — vérifiables

| # | Critère | Comment on le prouve |
|---|---|---|
| C1 | Un export iCloud réel de 500 contacts (≈ 20 Mo avec photos) est lu en **< 2 s** | smoke avec une fixture générée de 500 cartes + photos factices |
| C2 | Les pièges vCard sont lus juste : ligne pliée, `\,`, `QUOTED-PRINTABLE`, `item1.TEL`, carte sans `FN`, `END` manquant | un cas de `unit-vcard.mjs` par piège |
| C3 | **Rien n'est coché par défaut** ; rien n'est envoyé sans clic sur « Importer » | smoke : zéro requête réseau avant le clic |
| C4 | Deux cartes avec le même mobile écrit différemment (`06 12…` / `+33 6 12…`) forment **une** personne | unit + smoke |
| C5 | Une ligne invalide ne fait pas tomber le lot : les 99 autres entrent, la ligne est rapportée | `unit-import-api.mjs` |
| C6 | Un lot de 101 lignes, un champ inconnu ou un `node_id` d'un autre propriétaire → **400**, rien n'est écrit | `unit-import-api.mjs`, côté attaque |
| C7 | `PHOTO`, `ADR`, `NOTE` et `BDAY` n'atteignent **ni** la requête **ni** la base | smoke qui inspecte le corps envoyé (verrou de non-vacuité : le corps n'est pas vide) |
| C8 | Aucun nom, téléphone ou e-mail dans les logs serveur | revue de `logError` + test |

---

## 5. ⑤ Ce qu'on ne fait PAS dans cette boucle

- **Pas de synchronisation continue** avec l'iPhone (CardDAV) : c'est un import ponctuel.
- **Pas de création automatique de fiches** depuis `ORG` : une fiche exige un type,
  et Paul le décide fiche par fiche avec les outils existants.
- **Pas d'import CSV** : il reste au vivier, à ouvrir si une autre source l'exige.
- **Pas de mise à jour des personnes déjà en base** : un doublon avec le registre
  est signalé et écarté, pas fusionné dans la base.
- **Pas de géocodage** (les personnes n'ont pas de coordonnées).
- **Pas d'annulation d'import en un clic** (voir pre-mortem n°4 : la parade est ailleurs).

---

## 6. ⑥ Pre-mortem — « la boucle a échoué : pourquoi ? »

| # | Mode de défaillance | Ce qui le prévient |
|---|---|---|
| 1 | **RIVEN noyé** : 500 contacts perso entrent, le registre devient illisible | rien n'est coché par défaut ; le compteur « X cochés » reste visible ; confirmation « Importer 212 personnes ? » |
| 2 | **Le fichier réel casse le lecteur** (export exotique, 2.1, encodage) | le lecteur ne lève jamais d'exception ; chaque carte illisible est comptée et affichée (« 4 cartes illisibles »), jamais écartée en silence |
| 3 | **Fichier hostile** : 200 Mo, 100 000 cartes, `<script>` dans un nom | limite de 50 Mo et de 5 000 cartes, refusée avec un message ; tout rendu en `textContent` ; validation serveur identique à la saisie manuelle |
| 4 | **Import raté à moitié** (coupure au lot 3/5) → doublons au second essai | lots indépendants, chacun annoncé ; au second essai, le dédoublonnage contre le registre écarte ce qui est déjà entré |
| 5 | **Fuite de PII** : le fichier ou les noms partent dans un log, une fixture, une séance | parsing local ; fixtures inventées ; logs = comptes et index uniquement (C8) |
| 6 | **Bon code, mauvais geste** : Paul ne sait pas exporter depuis l'iPhone | l'écran d'accueil de l'import donne les 4 étapes iCloud, et le tri accepte aussi une vCard partagée depuis l'app Contacts |
| 7 | **Harnais vert par accident** : le smoke ne voit aucun contact et « rien n'est envoyé » passe | verrou de non-vacuité : le smoke exige d'abord N contacts affichés, puis teste l'absence |

---

## 7. Gates et modèle

- **Pas de migration** → pas de gate SQL.
- `api/reseau/import.js` **écrit en base** → escalade modèle signalée sur cette
  étape (règle permanente) et `/securite-max` avant fusion.
- **La fusion dans `main` reste au go de Paul** (sauf « go solo »).
