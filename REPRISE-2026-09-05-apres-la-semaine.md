# Reprise — après la séance du 05/09/2026

> Écrit à la clôture de la séance, sur des faits **relus à leur source** ce
> jour-là : `git`, l'API GitHub, `node finubar/collecter.mjs`, et des requêtes
> SQL rejouées sur les trois bases. Aucune valeur de ce fichier n'est déduite.
>
> ⚠️ **Un document décrit un état à la minute où il est écrit.** Il vieillit dès
> le geste suivant. La reprise commence donc par la mesure du §5, jamais par la
> lecture de ce paragraphe.

---

## 1. L'objectif final, qui ne bouge pas

Les 4 briques tournent de bout en bout toutes seules ; **Paul contrôle, il ne
saisit pas** (Directive IA). Le jalon qui compte n'est pas technique :

**Le premier euro encaissé.** Au 05/09 : `paiements` = **0**.

---

## 2. Ce que la séance a fermé

**14 PR fusionnées · 1 fermée sur constat · 7 grains recalés · 13 champs de
grain condensés · 1 PR laissée ouverte, à toi (RenoAgenda #71).**

| | |
|---|---|
| **Le seul code livré** | **E1** — `db.js` ne recopie plus dans `kv_store` la donnée d'un autre compte. Corrigé **deux fois**, éprouvé sur les 23 lignes réelles |
| Fusions | RenoDevis #127 #128 #129 #130 · RenoAgenda #68 #69 #70 · RenoBoost #348 #351 #352 #353 #354 #356 · Ultima #192 #193 #194 #195 #196 #197 |
| **Le lot forme** | **RenoBoost #354** — le hero passe de la nuit au papier. 23 `rgba(255,255,255,…)` en dur deviennent des tokens `--hero-*`, et `tests/hero-contraste.test.mjs` **calcule** le contraste au lieu de le regarder |
| Fermée sans fusion | RenoBoost #349 — contenu déjà sur `main`, **mesuré** (diff vide après réconciliation) |
| Capture | **ADR-010 VESTA** — la reprise de Fahrenheit, avec Julien Laudy |

### Les quatre notes fausses corrigées — c'est le vrai gain

Une note fausse coûte plus cher qu'une note absente : on la croit.

1. **ACQ-2b** était annoncé « à faire ». Il est **livré** depuis `4f4733f`.
   Je l'aurais réécrit.
2. **L3 / L4** (RenoDevis) étaient annoncés « restent ». Ils sont **gelés à
   dessein** jusqu'à la mesure L5. Je les aurais codés contre ta décision.
3. **La panne RLS de RenoAgenda** était annoncée « correctif non appliqué ».
   Mesure : **0 policy** lit `auth.users`. Elle était réparée.
4. **Mon propre correctif E1** poussait la liste filtrée : sur les données
   réelles, il aurait **écrasé 109 fiches par 11**, et le pull suivant aurait
   ramené la perte en local.

⚠️ **Et deux dérives de grain, trouvées le soir par le garde-fou lui-même.**
Ultima après le squash de #196, RénoBoost après celui de #354 — dans les deux
cas `dernier_arret.commit` pointait sur un commit que le squash avait remplacé.
Aucune n'a été vue en relisant : c'est `collecter.mjs` qui les a criées. Le
recalage d'un grain ne recrée pas de dérive, les quatre fichiers de Finubar
étant exclus du décompte (vérifié dans le code, pas sur la foi du journal).

⛔ **La règle qui saute le plus souvent** : *toute séance qui modifie un dépôt
met son `FINUBAR.md` à jour DANS le commit du travail*. Trois séances l'ont
oubliée aujourd'hui, dont la mienne.

---

## 3. ⛔ Ce que la base a dit, et qui n'est pas refermé

**Mesuré le 05/09 sur `mwaryfscxgrulauwwque`** : 4 comptes ; 2 keyspaces
`kv_store` ; **249 fiches dont 238 appartiennent à d'autres comptes et aucune à
son propre propriétaire**. Recouvrement nul entre les `_owner_id` des fiches et
les owners des keyspaces. Sonde éprouvée avant d'être crue — ces `_owner_id`
sont de vrais comptes `auth.users`.

**E1 rend la situation inoffensive** (la clé n'est plus poussée du tout dès
qu'une fiche étrangère est vue, et les 3 entités concernées ont un chemin de
persistance propre via `RB_DATA`). **Il ne l'explique pas.**

⏳ **La première question de la prochaine séance** : *pourquoi ces 238 fiches
sont-elles là, et les 4 comptes sont-ils tous à Paul ?*

---

## 4. Ce qui attend Paul — par ordre d'impact, pas d'ancienneté

### 🔴 Le chemin critique du premier euro

| Depuis | Geste | Ce qu'il débloque |
|---|---|---|
| **17/08** | **Stripe en Live + KYC de SOLA** | le premier euro. Rien d'autre ne le remplace |
| 01/09 | **Un devis SOLA réel** (le gainable) + le **logo** | le catalogue consommables · l'identité du devis |
| 03/09 | **V0** — calculer UN audit PAC sur UN dossier réel | V1, V2, D4 — et **dégèle L3/L4** |
| **05/09** | **La source de `-6h`, `<24h`, `+25%`** et du « 60+ professionnels » déjà en ligne | le lot **COPY** de la landing (tes arbitrages A5/A6). Sans elle, rien ne se publie |

### 🟠 Ce qui remplit le système tout seul

| Depuis | Geste | Ce qu'il débloque |
|---|---|---|
| **11/08** | **Imprimer un lot de stickers** (`/Stickers`) | **Foresight entier** — la seule chose qui fait entrer de la donnée sans saisie |
| **04/08** | **Valider la fiche Google Business** | le cron d'avis J+7, et la visibilité locale |

### 🟡 Trois gestes courts

- `supabase functions deploy verifier-siret` puis relire le déployé
- Poser `ANTHROPIC_API_KEY` + `LEO_MODELE` en **Production** Vercel Ultima
- Traiter les **17 demandes clients** RenoAgenda en attente

### ⚪ Ménage hors de portée d'une session

- **16 branches mortes** — `git push --delete` renvoie **403**, et **aucun
  outil de suppression de branche n'existe** (create / list / update, pas
  delete). Liste prouvée dans `PLAN-2026-09-05-boucler-la-semaine.md`.
  ⚠️ `RenoDevis/matthieu-du-crest-solar-study` n'en fait **pas** partie : elle
  porte 4 lignes que `main` n'a pas.
- **`kv_store_snapshot_20260903`** — 65 lignes de PII, destructif, attend un GO
  explicite. Toujours en base au 05/09.

### 🔵 Les décisions, à trancher en un bloc

**MKT-A4** (qui est partie au contrat d'entretien — *la fenêtre se referme*) ·
**migration des données RenoPredict** (posée le **12/07**, jamais tranchée) ·
**V-A1 / V-A2 / V-A3** · les **3 bloqueurs SATEP** · **GO migration
`radar_releves`** · le nom **VESTA** · le **rôle de Fahrenheit** ·
**`collecter.mjs` : option `--dry` ou geste qui se committe ?**

⏳ **Non résolu, hors git** : le post LinkedIn du 04/09 est-il parti ?

---

## 5. ⛔ Par où on commence — la mesure, pas ce fichier

```bash
# 1. Ce que les dépôts disent d'eux-mêmes (et la dérive éventuelle de ce doc)
cd Ultima- && node finubar/collecter.mjs

# 2. Une séance concurrente écrit-elle en ce moment ?  (leçon du 05/09 :
#    main a bougé PENDANT l'inventaire)
#    → list_sessions, puis git fetch sur le dépôt visé avant tout geste
```

```sql
-- 3. Les 4 jalons, en une requête. Sur mwaryfscxgrulauwwque.
select 'premier euro (paiements)'        as jalon, count(*)::text from paiements
union all select 'keyspaces kv_store',    (select count(distinct owner_id)::text from kv_store)
union all select 'snapshot de PII encore là', (select count(*)::text from information_schema.tables
       where table_schema='public' and table_name='kv_store_snapshot_20260903')
union all select 'devis signables par UUID (0 = coupure possible)',
       (select count(*)::text from devis where signature_uuid_ouverte);
-- Sur bzblvmmunflxtzamusol : select count(*) from stickers;   -- 0 au 05/09
-- Sur poskdialgzwxmcfyklvk : select count(*) from artisans;   -- 0 au 05/09
```

---

## 6. Pre-mortem à 3 mois — on est le 05/12/2026, rien n'a bougé

| Cause probable | Signal précoce | P × I | Mitigation |
|---|---|---|---|
| **① Le code avance, les jalons restent à zéro** — c'est le scénario le plus probable, et il est déjà à l'œuvre : trois gestes ouverts depuis août, quatre jalons à zéro, pendant qu'on livre du logiciel correct | à J+7, `stickers` = 0 et Stripe encore en Test | **Élevé × Élevé** | **Ne pas ouvrir de séance de code tant qu'un des 3 gestes du chemin critique n'est pas fait.** Une séance qui produit du code sans toucher un jalon est une séance qui creuse l'écart |
| **② Une note fausse fait refaire du travail** | quelqu'un « rouvre » une dette déjà soldée | Élevé × Moyen | **Rouvrir une dette commence par la RE-MESURER.** Quatre notes fausses trouvées le 05/09 sur une seule séance — le taux n'est pas anecdotique |
| **③ Les 238 fiches étrangères deviennent un incident RGPD** | un second compte se plaint, ou un export révèle la copie | Faible × **Élevé** | La cause est fermée (E1), mais **l'origine reste inexpliquée** — c'est le §3, et il ne se règle pas tout seul |
| **④ Les 16 branches et le snapshot pourrissent** | la liste s'allonge, plus personne ne sait laquelle est morte | Moyen × Faible | 10 minutes sur la machine de Paul, une fois. La liste est prouvée et écrite |
| **⑤ Une mesure fausse oriente une décision** | une sortie « trop uniforme », un chiffre annoncé sans être relu | Moyen × Élevé | **Éprouver toute sonde sur un cas dont on connaît la réponse.** Trois fois le 05/09 : un script de purge qui comparait deux pointes, un « 168 caractères » qui en faisait 198, un fichier local pris pour la branche distante |

---

## 7. Prompt de reprise

> **Objectif final** : les 4 briques tournent seules, Paul contrôle. Le jalon
> est **le premier euro** — `paiements` = 0 au 05/09.
>
> **Avant tout geste** : `node finubar/collecter.mjs`, `list_sessions` (une
> séance concurrente ?), `git fetch` sur le dépôt visé. `main` a bougé pendant
> l'inventaire du 05/09 — ça se reproduira.
>
> **Ce qui attend Paul** : §4, par ordre d'impact. Ne pas redemander ce qui y
> est déjà tranché ; les reports décidés sont dans les `CLAUDE.md`.
>
> **La première question technique** : d'où viennent les 238 fiches étrangères
> du `kv_store`, et les 4 comptes sont-ils tous à Paul ? (§3)
>
> **Ce qu'il ne faut PAS refaire** : coder L3/L4 (gelés à dessein), réécrire
> ACQ-2b (livré), re-livrer le correctif RLS de RenoAgenda (appliqué), retenter
> `git push --delete` (403, établi et mesuré).
>
> **Discipline** (EB) : ne pas ouvrir une séance de code tant qu'un geste du
> chemin critique n'a pas bougé. Le pre-mortem ① dit que c'est le risque n°1,
> et il est déjà réalisé à moitié.
