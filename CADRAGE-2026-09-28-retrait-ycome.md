# CADRAGE — retirer YCOME de partout (28/09/2026)

> Paul, le 28/09 : *« Abandonné YCOME, d'ailleurs il est possible qu'on le
> supprime entièrement de partout car je ne travaille plus pour lui — cadre
> cette possibilité. »*
>
> ⛔ **Cadrage seulement.** Rien n'est retiré avant le go de Paul. Les gestes
> destructifs hors dépôt (dépôt GitHub, projet Vercel) sont les siens.

## 0. L'inventaire — mesuré le 28/09, pas supposé

Balayage `grep -ril ycome` sur les **douze** clones de la séance (hors
`node_modules`, `.git`), et balayage texte de **toutes** les tables `public`
des deux bases (instrument validé : il compte bien 71 lignes sur 18 tables
quand on lui demande tout).

### A. Le produit vivant — Ultima (ce que Paul VOIT)

| Fichier | Ce qui y vit |
|---|---|
| `js/registre-lv3.mjs` | le nœud `ycome` (étoile d'attente, `cible: null`) ; `alpha.enfants` ; la phrase d'ALPHA « YCOME dès que tu me donnes son adresse » |
| `alpha.html` | la `meta description` et la puce « YCOME — à venir » |
| `js/blasons.mjs` | l'étiquette du blason `portail` : « le portail d'YCOME » |
| `FINUBAR.md` → `finubar/macro.json`, `api/_lib/finubar-macro.mjs` | le bloqueur « L'URL d'YCOME et la précision sur « mon dpe.fr » (VITRUVE) » |

⚠️ **Le blason `portail` NE PART PAS avec YCOME** : DOKLĚS et SYMPHO le portent
aussi (`registre-lv3.mjs`), et `adaptateur-finubar.mjs` s'en sert en repli. Seule
son étiquette change.
⚠️ **Le bloqueur FINUBAR est DOUBLE** : sa seconde moitié (« mon dpe.fr » /
VITRUVE) n'a rien à voir avec YCOME et doit survivre.

### B. Les harnais — ce qui GARDE le produit

| Fichier | Ce qu'il prouve aujourd'hui avec YCOME |
|---|---|
| `tests/smoke-alpha.mjs` (16 mentions) | qu'une étoile **sans cible** est inerte (pas une ancre), `aria-disabled`, atteignable au clavier, qu'Entrée ne navigue pas, et qu'elle **parle** au focus — dont la régression « Focus YCOME retournait le texte de RENOBOOST IA » |
| `tests/unit-registre-lv3.mjs` | `ycomeSousAlpha`, `ycomeSansCible` |
| `tests/smoke-boussole.mjs` | `ycome` dans la liste des caps parcourus |
| `tests/smoke-dokles-sympho.mjs` | un commentaire (« au rang de YCOME ») |

⛔ **Le vrai enjeu du retrait est ici.** YCOME était la PREMIÈRE étoile
d'attente ; les contrôles qui garantissent qu'une étoile sans cible reste
inerte et parlante sont écrits sur elle. Supprimer ces verdicts avec elle
retirerait la garantie à DOKLĚS et SYMPHO, qui sont exactement dans le même
cas. **Ils se RECIBLENT, ils ne se suppriment pas.**

### C. La mémoire et les archives — ce qui RACONTE

`memoire/LEXIQUE-VOCAL.md` (2 entrées : « Ikom, Ycom », « i comme moi-même ») ·
`memoire/RADAR.md` · `memoire/JOURNAL-DECISIONS.md` (5) · `CADRAGE-ULTIMA.md` ·
`CADRAGE-LV3.md` · `CADRAGE-CONSOLE.md` · `CADRAGE-2026-09-25-carte-celeste.md` ·
`CADRAGE-LV4-CIEL-DEPLIE.md` · `CADRAGE-RESHIRAM-ZEKROM.md` ·
`CADRAGE-2026-09-07-reprise-depots.md` · `PLAN-2026-09-05-boucler-la-semaine.md` ·
`design/preview-lv3-boussoles.html`.

### D. Hors d'Ultima

| Où | Constat |
|---|---|
| Neuf autres dépôts | **0 occurrence**, sauf `RenoDevis/releve/schemas/modele.schema.js` : un **commentaire** qui illustre la notion d'Enseigne (« Renoboostia en direct, YCOME en sous-traitance »). Aucune donnée, aucun code. |
| Base Ultima (`leosfqyidgsaescjbfom`, 28 tables) | **0 ligne** |
| Base Réno partagée (`mwaryfscxgrulauwwque`) | **1 ligne** : `kv_store` clé `rb_agenda_events` (l'agenda RenoBoost, 220 ko), une occurrence dans la valeur ; + 3 dans `kv_store_snapshot_20260903` |
| GitHub | le dépôt `PaulGERARD161098/Ycome` existe |
| Vercel | un projet `ycome` existe (équipe de Paul) |

## 1. Le but (ce qui sera vrai à la fin)

Aucun écran, aucune phrase de Léo, aucun bloqueur ne parle plus d'YCOME ;
ALPHA compte trois caps (RENOBOOST IA, DOKLĚS, SYMPHO) ; les garanties
d'« étoile d'attente » tiennent toujours, portées par DOKLĚS et SYMPHO.

## 2. Les étapes (lot unique, une PR)

1. **Harnais d'abord, rouge** : `unit-registre-lv3` exige `!NOEUDS.ycome` et
   `alpha.enfants` = les trois caps ; `smoke-alpha` recible ses verdicts
   d'étoile inerte/parlante sur **DOKLĚS** (et SYMPHO en témoin), avec la
   même régression « le focus parle de SA propre étoile ».
2. **Registre** : retirer le nœud, l'enfant, et réécrire la phrase d'ALPHA
   (« Renoboost IA aujourd'hui, et deux caps à cadrer — DOKLĚS… et SYMPHO »).
3. **`alpha.html`** : meta et liste. **`blasons.mjs`** : étiquette neutre du
   `portail` (« le portail d'un cap à venir »).
4. **FINUBAR** : ne garder du bloqueur double que la moitié VITRUVE, puis
   `node finubar/collecter.mjs` (régénère `macro.json` et le module).
5. **Mémoire** : décision datée au `JOURNAL-DECISIONS.md` ; au LEXIQUE,
   marquer les deux entrées « abandonné le 28/09 » plutôt que les effacer
   (sinon une dictée « Ikom » ne se comprend plus).
6. **`npm test` + `bash tests/lancer.sh`** au complet, puis PR.

## 3. Les moyens

Fichiers des sections A et B, plus `memoire/JOURNAL-DECISIONS.md` et
`LEXIQUE-VOCAL.md`. Aucun SQL, aucune migration, aucun appel externe.

## 4. Les critères de réussite (vérifiables)

- `grep -ril ycome js/ alpha.html api/ finubar/ FINUBAR.md tests/` → **vide**,
  précédé de son verrou de non-vacuité (le même `grep` trouve `dokles`).
- `smoke-alpha` : les verdicts d'étoile d'attente passent **sur DOKLĚS** ; et
  virent au **rouge** si on donne une `cible` à DOKLĚS (sabotage joué).
- `unit-registre-lv3` : rouge avant le retrait, vert après.
- Les 44 suites unitaires et les 52 harnais verts.

## 5. Ce qu'on ne fait PAS dans cette boucle

- **Pas de réécriture des archives** (section C hors lexique et journal) : un
  cadrage daté vaut par son exactitude — même règle que les UUID de devis
  clos dans RenoDevis. Ils disent ce qui était vrai à leur date.
- **Pas de toucher à `kv_store` Réno** : c'est l'historique de l'agenda de
  Paul, une base partagée par quatre briques, et une ligne de 220 ko dont on
  ne réécrit pas un morceau. Un rendez-vous passé reste un fait.
- **Le commentaire de RenoDevis** : hors lot. S'il est retouché, ce sera dans
  une séance RenoDevis (« sous-traitance » reste un cas réel de la notion
  d'Enseigne ; seul l'exemple nommé change).
- **Dépôt GitHub et projet Vercel** : action de Paul (ci-dessous).

## 6. Pre-mortem — « le retrait a échoué : pourquoi ? »

| Mode de défaillance | Ce qui le prévient |
|---|---|
| Les verdicts d'étoile d'attente partent avec YCOME ; DOKLĚS devient cliquable un jour sans qu'aucun test ne rougisse | étape 1 : recibler, jamais supprimer ; sabotage `cible` sur DOKLĚS |
| Le blason `portail` est supprimé « par symétrie » ; DOKLĚS et SYMPHO perdent leur emblème | constat A : seule l'étiquette change |
| Le bloqueur FINUBAR part entier, la question VITRUVE disparaît avec | constat A : bloqueur double, on garde sa moitié |
| La mise en page d'ALPHA change avec une étoile de moins (recouvrements, 44 px) | harnais socle / tao / mobile au complet, pas seulement `smoke-alpha` |
| Le lexique vocal perd « Ikom » : Paul dicte YCOME, Léo ne comprend plus | entrée marquée « abandonné », pas effacée |
| Le dépôt GitHub est supprimé alors qu'il porte du travail livré au client | recommandation : **archiver**, pas supprimer (réversible) |

## 7. ⏳ Décisions et gestes de Paul

1. **Go du lot Ultima** (étapes 1 à 6) — reco : oui, une PR.
2. **Dépôt `PaulGERARD161098/Ycome`** — reco : **Archiver** (Settings → Danger
   Zone → Archive) : lecture seule, réversible, rien de perdu. Le supprimer
   n'ajoute rien, sauf s'il porte du code qui appartient au client.
3. **Projet Vercel `ycome`** — lu le 28/09 : Next.js, dernier déploiement du
   03/09, **aucun domaine propre** (trois adresses `*.vercel.app` seulement),
   protégé par SSO. Aucun domaine du client n'en dépend donc. Reco : le
   **supprimer** après avoir archivé le dépôt GitHub (le code reste lisible
   là) ; à défaut, le mettre en pause.
