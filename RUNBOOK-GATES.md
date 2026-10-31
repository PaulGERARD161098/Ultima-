# RUNBOOK — Gates préparées (2026-07-11, Léo, mode solo)

> Chaque gate est poussée jusqu'au dernier cran : tu n'as plus qu'à exécuter
> l'action dashboard indiquée, ou valider une PR. Rien ici n'est irréversible
> sans ton geste. Source de vérité de l'état : `CADRAGE-ULTIMA.md`.

Projet Supabase : `ultima` (`leosfqyidgsaescjbfom`, eu-west-3).
Équipe Vercel : `paggerard-boops-projects` (`team_qFI3ZaNfUfgfebcOb6jM0Pjw`).

---

## ✅ Gate ① — Migration 0006 (secteur d'activité) — DÉJÀ CLOSE

Vérifié en base le 2026-07-11 : la migration `0006_secteur_activite`
(version `20260709121710`) **est appliquée**, la colonne
`network_nodes.secteur_activite` existe (nullable, `char_length ≤ 120`).
**Aucune action.** Advisors post-application :
- Sécurité : 0 lint bloquant (un seul WARN, voir gate ⑥).
- Performance : uniquement des INFO « index inutilisés » (base à 0 ligne,
  attendu — dont l'index secteur du 0006) + stratégie connexions Auth au repos.
  Non actionnable tant que la base est vide.

---

## ⏳ Gate ② — Vercel : variable d'env + URL prod + header U6

**a) Variable `GEOCODE_USER_AGENT`** (sinon le repli committé expose ton email
de contact vers Nominatim/OSM).
1. Vercel → projet **ultima** → **Settings → Environment Variables**.
2. Ajouter : `GEOCODE_USER_AGENT` = `Ultima/1.0 (+https://<ton-domaine-prod>)`
   (Nominatim exige un identifiant + contact ; l'URL prod suffit comme
   contact, pas besoin d'exposer l'email). Portées : **Production** (+ Preview
   si tu veux tester en preview).
3. **Redeploy** le projet (les env ne s'appliquent qu'au prochain déploiement).

**b) URL de production** : à lire depuis ton dashboard Vercel (le connecteur de
Léo ne voit pas encore `ultima` — voir « Connecteur Vercel » plus bas). Note-la,
elle sert aux gates ③ et ⑤.

**c) Header `Permissions-Policy` (U6)** : **déjà dans le code**
(`middleware.js` : `microphone=(self)`, reste fermé). Rien à faire côté
dashboard — juste confirmer sa présence sur l'URL prod (gate ⑤).

---

## ⏳ Gate ③ — Supabase Auth (dashboard)

Dashboard Supabase → projet **ultima** → **Authentication**.
1. **Inviter ton compte** : Users → *Invite user* → `pag.gerard@gmail.com`
   (0 utilisateur en base aujourd'hui). Le front est en mono-utilisateur.
2. **Couper les inscriptions** : Auth → Sign In / Providers (ou Settings) →
   désactiver **Allow new signups** (complément serveur du
   `shouldCreateUser: false` déjà posé côté code).
3. **Site URL + Redirect URLs** : Auth → URL Configuration → renseigner l'URL
   prod Vercel (gate ②b) comme **Site URL**, et l'ajouter aux **Redirect
   URLs** (le lien magique doit y revenir).

---

## ✅ Gate ④ — Durcir l'auth des endpoints (`auth.getUser()`) — CLOSE

Fusionnée le 2026-07-11 (PR #32, go Paul). `requireUser` valide réellement le
jeton (`auth.getUser`) sur les 5 endpoints, fail-closed, zéro jeton en log ;
securite-auditeur + verificateur GO, patrimoine vert. Arbitrages validés par
Paul : `/api/geocode` rejette un Bearer invalide (401) ; panne Auth = 401
fail-closed (pas 503). Spec : `design/spec-durcissement-auth.md`.

---

## ⏳ Gate ⑤ — Preuves live (après déploiement, navigateur de Paul)

L'environnement de Léo n'a pas d'accès sortant vers `vercel.app` /
`tile.openstreetmap.org` : ces preuves ne peuvent se faire que depuis ton
navigateur, une fois en ligne.
1. **Login lien-magique** de bout en bout sur l'URL prod.
2. **Tuiles OSM réelles** (RA1/RA2) : sépia/voile lisibles sur la vraie carte
   (jusqu'ici prouvé sur tuile factice seulement).
3. **Nominatim réel** : « Trouver sur la carte » renvoie des résultats (amont
   exercé en stub jusqu'ici) ; User-Agent conforme (gate ②a).
4. **Headers** : `Permissions-Policy` + CSP présents sur les réponses prod.

---

## ⏳ Gate ⑥ — Micro-arbitrages (optionnels, non bloquants)

- **Protection mots de passe compromis** (advisor sécurité WARN) : Auth →
  Settings → *Leaked password protection*. **Quasi sans objet** en lien-magique
  (aucun mot de passe), mais activable sans risque si tu veux 0 WARN.
- **Sous-titre du cartouche** (`.cartouche-sous`, #6e5320) à **4,594:1** :
  passe AA (≥ 4,5) mais marge fine. Le passer à `--encre-sepia` le porterait
  > 9:1, au prix de l'aspect doré. Dis-moi si tu veux : je prépare le diff
  d'une ligne.
- **Connecteur Vercel de Léo** : il ne voit que `renoboost-ia`, `reno-agenda`,
  `artisan-builder` — **pas `ultima`**. Pour que Léo lise logs/déploiements
  d'Ultima, autorise le projet `ultima` dans le connecteur Vercel.

---

## ✅ Gate ⑦ — Migration `leo_appels` (plafond d'appels de Léo) — CLOSE le 19/10

**Où en est-on** : ✅ **appliquée par Paul le 19/10/2026 (≈ 18:45 UTC)**, SQL Editor du
dashboard, projet `ultima`, fichier identique à la tête `3077897` d'Ultima-#400. Vérifiée :
- étape 2 (`leo_appels-1-etat.sql`) : **16 lignes, toutes `ok = true`** (rapporté par Paul) ;
- étape 3 (`leo_appels-2-plafond-annule.sql`) : `ERROR: P0001: PLAFOND_OK : 100 tentatives
  acceptées, la suivante refusée (leo_calls_quota_exhausted) — transaction annulée, aucune
  ligne ne reste` (capture de Paul).
Ultima-#400 fusionnée ensuite par Paul (`d67998a`, sur `3077897`) : la migration est bien
passée AVANT le code. **Reste ouvert** : l'inscription au registre `supabase_migrations` (voir
« À savoir ») et la relecture des advisors sécurité/performance — les deux attendent un
connecteur qui voie `ultima`. La procédure ci-dessous reste la référence pour rejouer ou
vérifier.

**Quoi** : `supabase/migrations/20261019160000_leo_appels.sql` — une table de journal
(quadrant, modèle, phase, tokens : aucun contenu), RLS, écriture limitée à 6 colonnes,
une trace = une tentative + une issue, plafond atomique 100 tentatives / 24 h / compte.
Revue indépendante faite ; éprouvée sur PostgreSQL jetable (sabotages rouges) et dans la CI.

**Les 4 gestes** (≈ 5 min) — dashboard Supabase → projet **ultima** (`leosfqyidgsaescjbfom`)
→ **SQL Editor** → *New query* :
1. Coller le contenu de `supabase/migrations/20261019160000_leo_appels.sql` → **Run**.
   Attendu : « Success. No rows returned ».
2. Coller `supabase/verifs/leo_appels-1-etat.sql` → **Run**. Attendu : **16 lignes, toutes
   `ok = true`**. Une ligne à `false` nomme ce qui manque : ne rien fusionner, me la dire.
3. Coller `supabase/verifs/leo_appels-2-plafond-annule.sql` → **Run**. ⚠️ **Le signal de
   réussite est une erreur rouge** qui commence par **`PLAFOND_OK : 100 tentatives
   acceptées, la suivante refusée`** : le script pose 100 tentatives au nom d'un compte réel,
   constate le refus de la 101ᵉ, puis annule tout volontairement (aucune ligne ne reste).
   `ECHEC …` = le plafond ne se comporte pas comme prévu.
4. Me dire le résultat des étapes 2 et 3 (le texte, ou une capture) : je l'inscris ici et dans
   `FINUBAR.md`, et la fusion d'Ultima-#400 peut alors être demandée.

**À savoir** : l'éditeur SQL n'inscrit PAS la migration au registre
`supabase_migrations.schema_migrations` (les précédentes l'ont été via le connecteur). Tant
que mon connecteur ne voit pas `ultima`, l'écart base ⇄ registre reste à constater et à
corriger (voir `supabase/releves/` : le dépôt doit décrire la base).

**Retour arrière** — ⛔ destructif (perd le journal), uniquement sur ton geste, et seulement si
la migration est appliquée sans que le code de #400 soit fusionné ou s'il faut annuler :
`drop table public.leo_appels;` puis `drop function leo_private.appels_plafond();`
(la table emporte son trigger). Le code de #400 retombe de toute façon sur son repli local.

## ⏳ Gate ⑧ — Migration `supervision_decisions` (supervision et réemploi) — OUVERTE le 31/10

**Où en est-on** : ⏳ **écrite et éprouvée, NON appliquée.** Le code qui s'en sert
(`api/supervision.js`, l'outil `proposer_supervision`, le cockpit sous la table FINUBAR)
fonctionne avant elle : le cockpit dit « la migration est à appliquer », et l'outil reste
**coupé** tant que `LEO_SUPERVISION` ne vaut pas exactement `active`.

**Quoi** : `supabase/migrations/20261031150000_supervision_decisions.sql` — le registre des
propositions de Léo. RLS en lecture pour le propriétaire, **aucun droit d'écriture direct** ;
trois fonctions (`supervision_soumettre`, `supervision_arbitrer`, `supervision_retirer`),
`security definer` à `search_path` vide ; empreinte calculée en base ; 50 propositions / 24 h
/ compte. Éprouvée sur PGlite (62 vérifications, 18 sabotages rouges) ; les deux scripts
ci-dessous aussi (verts sur la migration, rouges sur ses sabotages : `tests/unit-supervision-verifs.mjs`).

**Les 5 gestes** (≈ 5 min) — dashboard Supabase → projet **ultima** → **SQL Editor** → *New query* :
1. Coller le contenu de `supabase/migrations/20261031150000_supervision_decisions.sql` → **Run**.
   Attendu : « Success. No rows returned ».
2. Coller `supabase/verifs/supervision-1-etat.sql` → **Run**. Attendu : **12 lignes, toutes
   `ok = true`**. Une ligne à `false` nomme ce qui manque : ne rien activer, me la dire.
3. Coller `supabase/verifs/supervision-2-parcours-annule.sql` → **Run**. ⚠️ **Le signal de
   réussite est une erreur rouge** qui commence par **`PARCOURS_OK`** : le script soumet,
   reconnaît le doublon, refuse, vérifie que le refus tient et qu'un faux identifiant est
   rejeté, puis annule tout (aucune ligne ne reste). `ECHEC …` = ne pas activer, me le dire.
4. Me dire le résultat des étapes 2 et 3 (le texte ou une capture).
5. **Seulement ensuite**, l'activation : Vercel → projet `ultima` → *Settings → Environment
   Variables* → `LEO_SUPERVISION` = `active` (Production), puis redéployer. C'est un geste
   distinct : la migration peut rester appliquée avec l'outil coupé.

**À savoir** : comme pour le gate ⑦, l'éditeur SQL n'inscrit pas la migration au registre
`supabase_migrations` ; advisors à relire quand un connecteur verra `ultima`. La base ne
distingue pas Paul de Léo : la séparation « Léo propose, Paul tranche » tient au code (aucun
outil d'arbitrage, corps figé côté front), gardée par `tests/unit-supervision-route.mjs`.

**Retour arrière** — ⛔ destructif (perd les propositions et leurs décisions), uniquement sur
ton geste : couper d'abord `LEO_SUPERVISION`, puis
`drop function public.supervision_soumettre(text,text,text,text[],jsonb), public.supervision_arbitrer(uuid,text,text,timestamptz), public.supervision_retirer(uuid), public.supervision_empreinte(text,text,text[]); drop table public.supervision_decisions;`

---

*Rien dans ce runbook n'a été exécuté par Léo : gates dashboard = tes gestes ;
gate ④ = ta validation de PR. Une fois une gate faite, coche-la ici ou dis-le,
je mets à jour le CADRAGE.*
