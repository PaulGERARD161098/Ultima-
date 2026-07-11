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

## ⏳ Gate ④ — Durcir l'auth des endpoints (`auth.getUser()`)

**C'est du code, préparé en PR draft séparée** (touche l'auth → gate + escalade
Opus signalée). Défense en profondeur : valider réellement le jeton côté serveur
avant tout accès (aujourd'hui seule la RLS rejette un jeton invalide).
→ Tu n'as qu'à **relire et merger la PR** quand elle est prête (lien ajouté au
rapport). Spec : `design/spec-durcissement-auth.md`.

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

*Rien dans ce runbook n'a été exécuté par Léo : gates dashboard = tes gestes ;
gate ④ = ta validation de PR. Une fois une gate faite, coche-la ici ou dis-le,
je mets à jour le CADRAGE.*
