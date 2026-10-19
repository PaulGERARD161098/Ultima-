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

## ⏳ Gate ⑦ — Migration `leo_appels` (plafond d'appels de Léo) — go de Paul le 19/10

**Où en est-on** : Paul a donné son go le 19/10/2026. **Non appliquée à ce jour** : le
connecteur Supabase de la séance ne voit pas le projet `ultima` (lecture refusée ;
il liste seulement Artidispo et RenoDevis, qui sont d'AUTRES bases — jamais ici). Il reste
donc ton geste dashboard, **avant la fusion d'Ultima-#400** (sinon Léo tourne sur son repli
local, 25 appels par instance).

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

---

*Rien dans ce runbook n'a été exécuté par Léo : gates dashboard = tes gestes ;
gate ④ = ta validation de PR. Une fois une gate faite, coche-la ici ou dis-le,
je mets à jour le CADRAGE.*
