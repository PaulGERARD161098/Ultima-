# CADRAGE — Surveillance des coûts GitHub et Vercel (31/10/2026)

> Source canonique de cette boucle. La règle budgétaire permanente reste dans
> `CLAUDE.md`, section « BUDGET FIXE — VERCEL ET GITHUB » : ce cadrage la
> prolonge, il ne la recopie pas. Les leviers L1 à L4 et leur inventaire du
> 21/10 y sont toujours tenus.

## 0. Décisions de Paul (31/10, rendues en séance)

| # | Question | Réponse |
|---|---|---|
| D1 | Périmètre des paliers | **Facture totale** de chaque service, tous dépôts compris (RenoBoost, mon-dpe…), pas seulement les quatre dépôts |
| D2 | Ce que couvrent les montants | **Vercel 30 $** = 20 $ d'abonnement Pro + **10 $ à la demande**. **GitHub 50 $** = montant facturé, après déduction des minutes incluses |
| D3 | Plafonds natifs | **Alerte seulement, jamais de coupure** (ni « Stop usage » GitHub, ni « pause » Vercel) |
| D4 | Comptes GitHub | **Une seule facture**, bien que les dépôts vivent sous deux propriétaires (PaulGERARD161098, paggerard-boop) |
| D3 bis (09–10/11) | Leviers et coupure | **Amende D3 et le §5** : devant la projection à ≈ 30 $ du 09/11, Paul n'attend pas le 15/11 — machine de build **Basic** pour l'équipe, previews **sur marqueur `[preview]`**, Spend Management **30 $ avec Pause activée** (10/11). La pause coupe aussi la production : assumé. |

## 1. Le but (MS)

Fin novembre, Paul sait **chaque lundi** combien il paiera à la fin du cycle et
**quel dépôt, workflow ou projet** est le premier poste, chiffre lu à la source.
Palier 1 : GitHub ≤ 50 $ facturés (cycle calendaire, 01/11 au 30/11), Vercel
≤ 30 $ (cycle 25/10 au 25/11).
MS : aucun client direct. La boucle protège la marge et la continuité de la CI.
Le 18/10, le budget épuisé a mis toutes les Actions en `startup_failure`, `main`
compris, donc plus aucun correctif de production. Indicateur : montant facturé
comparé au palier, lu sur la facture.

## 2. Les étapes (rétroplanning)

| Date | Étape | Preuve de sortie |
|---|---|---|
| 31/10 | Cadrage validé, D1 à D4 rendues | ce document |
| 01/11 | **Paul** pose les alertes natives (§3, gestes A et B) | capture des deux réglages, sans coupure |
| 01–02/11 | **Relevé de départ** : rapport d'usage GitHub *détaillé* d'octobre (CSV) + capture Usage Vercel depuis le 25/10 | tableau « qui coûte quoi » par dépôt, workflow et projet |
| 02/11 | **Étalonnage croisé** (§4) | écart < 10 % entre les deux approches, sinon on ne croit pas l'outil |
| ~05/11 | **Relevé hebdomadaire** tenu dans Finubar (pas de nouvel outil), avec projection à fin de cycle | un relevé daté chaque lundi |
| 15/11 | **Point de mi-parcours** : si la projection dépasse le palier, choix des leviers d'après les chiffres | décision de Paul |
| 25/11 · 30/11 | **Bilan du palier 1** (Vercel, puis GitHub) | les deux factures |

## 3. Les moyens (ZS)

**Alternative de l'année retenue : les budgets natifs**, gratuits, sans code et
sans exécution qui coûterait elle-même. On ne développe que ce que le natif ne
donne pas : la projection hebdomadaire et le croisement des deux approches.

- **Geste A — GitHub (Paul)** : Billing and licensing → Budgets and alerts →
  budget Actions à **50 $**, alertes **75 / 90 / 100 %**, option « Stop usage
  when budget limit is reached » **décochée**. ⚠️ Un budget existe déjà : il est
  à l'origine du `startup_failure` du 18/10. Il faut le **relire et le modifier**,
  pas en créer un second. Un budget ne compte qu'à partir de sa date de création :
  le poser le 01/11 couvre tout le cycle.
  *Source : docs.github.com, « Budgets and alerts » (lue par recherche le 31/10 ;
  la page n'est pas joignable depuis la séance).*
- **Geste B — Vercel (Paul)** : Settings → Billing → Spend Management, montant
  **10 $** (le budget porte sur le *à la demande*, par cycle), notifications
  activées, « pause production deployments » **désactivé**. Équivalent en ligne
  de commande : `vercel budgets set --amount 10`, **sans** `--pause`.
  *Source : documentation Vercel (CLI `vercel budgets`), via le connecteur, le 31/10.*
- **Relevé GitHub** : le rapport d'usage *détaillé* (CSV, 31 jours au plus)
  porte `repository`, `workflow_path` et le montant net. C'est la source exacte
  en dollars. *Source : docs.github.com, « About usage reports ».*
- **Relevé Vercel** : capture de la page Usage par projet, faute d'accès API
  (mesuré le 31/10 : `GET /v1/billing/charges` → 404 « Plan not found »).
- **Code réutilisé** : `finubar/collecter.mjs`. Aucun workflow planifié nouveau.

## 4. Les critères de réussite, et les deux approches croisées

| Approche | Ce qu'elle donne | Sa limite |
|---|---|---|
| **Par la facture** (CSV GitHub, capture Vercel) | le montant exact en dollars | ne dit ni quel *job* ni quel *push* a coûté |
| **Par les exécutions** (API Actions : durée de chaque job × nombre d'exécutions) | quel workflow, quelle PR, combien de pushes | arrondi à la minute par job, stockage et caches invisibles |

- **Étalonnage sur un chiffre connu** : Ultima-, 1–19/10 = **≈ 37,3 $ bruts**
  (capture de Paul, consignée le 19/10). L'approche par les exécutions doit le
  retrouver à moins de 10 % près. Sinon, l'écart est expliqué avant toute conclusion.
- **Non-vacuité** : un relevé à 0 $ sur un dépôt actif est une erreur de lecture,
  pas une économie.
- Un relevé hebdomadaire daté, une projection, le premier poste nommé avec sa source.

## 5. Ce qu'on ne fait PAS dans cette boucle

- Aucun levier de réduction avant le relevé de départ et le point du 15/11.
- Aucun workflow planifié ni build supplémentaire pour surveiller.
- On ne coupe ni la sentinelle, ni la synchro GHL, ni la sauvegarde de RenoPredict.
- Aucune coupure automatique (D3).

## 6. Pre-mortem — « fin novembre, ça a échoué : pourquoi ? »

1. **L'outil mentait** (arrondis, multiplicateurs, unité « Build CPU » de Vercel
   toujours pas comprise). Parade : l'étalonnage du §4.
2. **Le dépassement venait d'un dépôt hors des quatre**. Parade : D1, on suit la
   facture totale.
3. **Les séances Claude ont poussé N commits sur une PR ouverte**, donc N CI
   complètes. Parade : le relevé compte les exécutions par PR.
4. **Le budget existant gardait sa coupure** et la CI est retombée en `startup_failure`.
   Parade : geste A, relire le budget existant.
5. **Les captures Vercel ont été oubliées**. Parade : le lundi, 30 secondes.
6. **Alertes seules et aucune coupure : la facture n'a pas de plafond dur**.
   C'est assumé (D3). Le garde est l'alerte à 75 %, lue le jour même.

## 7. Constats mesurés au cadrage (31/10)

- Workflows déclenchés sur PR : Ultima- 3 (`tests`, `leo-lv1` à 4 jobs filtré
  par chemins, `leo-auth`) · RenoDevis 5 · Artidispo 1 · RenoPredict 1, plus la
  sauvegarde quotidienne. `leo-lv1`, `leo-auth` et les 4 workflows spécialisés
  de RenoDevis ne figurent pas dans l'inventaire du 21/10 : **coûts jamais chiffrés**.
- Exemple : un push sur la PR #430 d'Ultima- (31/10, 15:27 UTC) a lancé 3
  workflows, dont `Tests` pendant ≈ 17 min entre le début et la fin.
- Tâches planifiées Vercel : RenoDevis 6 par jour, RenoPredict 3, Ultima- au moins 1.

## 8. Séance des 09–10/11 — les leviers sont posés (mesuré, pas projeté)

**Déclencheur** : capture Usage de Paul, cycle 25/10 → 25/11 lu le 09/11 : Build CPU
5 h 44 inclus (7,9 %) + **67 h 08 facturés (92,1 %)** = 72 h 52 en 15,6 jours. Au tarif
recoupé sur la facture du cycle précédent (197 h 24 → 41,45 $ = 20 $ de crédit + 21,50 $,
soit 0,0035 $ la CPU-minute, durée arrondie à la minute supérieure), ≈ 145 h ≈ **30 $
projetés pour 20 $ visés**. Première cause lue par l'API : 85 des 135 déploiements
visibles étaient des previews de branches d'agents, un build complet par commit poussé,
4 CPU-min minimum même pour un build de dix secondes.

**Ce qui est sur `main`, dépôt par dépôt (SHA relus le 10/11 à 10 h 30 UTC) :**

| Dépôt | PR | `main` | Chaîne | Particularité |
|---|---|---|---|---|
| Ultima- | #453 | e69a9f9 | 239 car., liste `.vercelignore` | règle canonique **L5** dans `CLAUDE.md` |
| RenoBoost | #636 | b5ab1a3 | 239 car. | + harnais `journal.navigateur` réparé (rouge sur `main` depuis #635) |
| RenoDevis | #503 | 9bed231 (#502 au-dessus) | 231 car., `bash -c` | — |
| Artidispo | #187 | 9d80269 | 246 car. | — |
| artisan-builder | #124 | 4f7b487 | 121 car., marqueur seul | **pas de saut documentation** : le code lit des `.md` |
| mon-dpe.fr | #276 | b4b68d8 | 253 car., `@`/`@^` | fusion en squash seulement |

**Prouvé sur la plateforme, pas seulement au harnais** : sans marqueur → « Ignored »
(renoboost-ia 33a8fd5, reno-devis-final, mon-dpe-fr 9fc0e80, renoboost-ia 54e87ec) ;
avec marqueur → « Ready » (renoboost-ia 98a44e5, artisan-builder 99b8193). `VERCEL_ENV`
est bien exposé à l'étape d'ignore, aucune chaîne ne sort en erreur ni en 127.

**Gestes de Paul, faits le 10/11 (captures)** : Basic en défaut d'équipe et sur tous les
projets (les trois visibles du connecteur relisent `basic`) ; budget 30 $ créé, Pause
activée après relecture (elle était sur Off sur la première capture). Alertes natives à
50 / 75 / 100 % du budget : 15 / 22,5 / 30 $.

**Leçon payée (scellée v123, propagée v124 le 10/11, famille 2)** : un `grep` en bout de chaîne a masqué le code de sortie
de `npm test` ; un commit est parti avec `# fail 1` affiché. Rouge local seulement (porte
ESLint sans ESLint installé), mais l'ordre des gestes était faux.

**Non fait, nommément** : les grains Finubar d'artisan-builder et de mon-dpe.fr portent le
SHA de `main` d'AVANT fusion (une PR de plus pour une ligne aurait coûté un build de
production sur artisan-builder) ; RenoBoost n'a pas L2 ; la facture Vercel ne se lit toujours pas depuis une séance.

## 9. Roadmap et pre-mortem à 3 mois (10/11 → 10/02/2027)

| Date | Étape | Preuve |
|---|---|---|
| 15/11 | Point de mi-parcours (§2), projection recalculée avec les leviers | capture Usage |
| 25/11 | **Bilan Vercel** : Build CPU du cycle, part facturée, premier projet | rappel posé dans la séance du 10/11 (9 h, Paris) ; capture de Paul |
| 30/11 | Bilan GitHub (palier 50 $) | facture |
| décembre | Si > 20 $ : prochain levier = moins de builds de **production** (fusions groupées, refresh de données RenoBoost déjà réduit à un par jour) | relevé par projet |
| continu | Propager les leçons ; poser L2 là où il manque et où une PR le vaut (RenoBoost 6 min/CI) | sceau identique dans les dix dépôts |

**Pre-mortem — « 10 février, ça a échoué : pourquoi ? »**

1. **Les agents ont oublié `[preview]` et donné des URL qui ne se construisaient pas.**
   Parade : la règle est dans chaque `CLAUDE.md` avec la consigne « sans marqueur, le
   dire » ; une URL de preview se vérifie avant d'être donnée (EL).
2. **La facture est restée au-dessus de 20 $ parce que ce sont les builds de production
   qui coûtent**, pas les previews (RenoDevis = 52,7 % du cycle précédent, un build par
   fusion). Parade : le 25/11 lit la part par projet et par environnement avant de
   décider ; levier suivant = cadence des fusions, pas une règle de plus.
3. **La pause à 30 $ a coupé la production un mois chargé.** Parade assumée par Paul :
   l'alerte à 22,5 $ se lit le jour même ; relever le budget est un clic conscient.
4. **Une chaîne a été modifiée au-dessus de 256 caractères ou `VERCEL_ENV` a changé de
   sémantique** : la règle s'éteint en silence et les previews reviennent. Parade : les
   harnais tiennent la longueur et le marqueur ; la courbe Build CPU le montre.
5. **Basic a doublé la durée des builds lents** (Next.js : RenoDevis, mon-dpe.fr) sans
   diviser le coût par deux. Parade : mesurer la durée des builds de production avant /
   après sur les deux projets au 25/11.
6. **Une leçon suivante n'a pas été propagée** et une copie a divergé (propagation v124 faite le 10/11). Parade : le rappel
   Finubar de chaque dépôt compare les sceaux ; la propagation est la première action de
   la prochaine séance Ultima.

## 10. Prompt de reprise (mesuré le 10/11, 10 h 30 UTC)

```
Reprise budget Vercel/GitHub — Ultima fil rouge (CADRAGE-2026-10-31-couts-github-vercel.md §8–§10).
Cap : Vercel ≤ 20 $/mois, GitHub ≤ 50 $ facturés ; Paul contrôle, les leviers tournent seuls.
État mesuré le 10/11 : règle L5 « preview sur demande » sur main des six dépôts (Ultima- e69a9f9,
RenoBoost b5ab1a3, RenoDevis 9bed231, Artidispo 9d80269, artisan-builder 4f7b487, mon-dpe.fr b4b68d8),
prouvée Ignored/Ready sur Vercel ; Basic pour l'équipe ; Spend Management 30 $, Pause activée.
Prochaine action UNIQUE : au 15/11 (point de mi-parcours, rappel posé) puis au 25/11 (rappel posé), lire la capture Usage Vercel du cycle 25/10 → 25/11,
part facturée et premier projet, et la comparer à 72 h 52 / ≈ 30 $ projetés le 09/11.
Bloqué par : la facture ne se lit pas depuis une séance (capture de Paul).
Gates : aucune coupure de cron de surveillance ; aucun levier sans chiffre lu à la source.
Pièges : ne pas réécrire une chaîne ignoreCommand au-dessus de 256 caractères ; ne pas pousser une
branche dont le dernier commit porte « [preview] » dans le titre sans vouloir un build ; les grains
Finubar d'artisan-builder et mon-dpe.fr portent le SHA d'avant fusion (attendu) ; leçons v124
propagées le 10/11, dix copies identiques ; un grep derrière npm test ne garde rien.
```

