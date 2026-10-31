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
