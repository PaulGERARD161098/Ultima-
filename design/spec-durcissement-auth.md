# Spec — Durcissement de l'authentification des endpoints API

Statut : SPEC (aucune implémentation). Gate auth : l'application reste au fil
principal (Léo), sous validation Paul, avec bascule Opus 4.8.
Origine : action humaine ④ / registre CADRAGE n°7 / ROADMAP-SECURITE §3bis.
Auteur : securite-auditeur. Date : 2026-07-11.

## 0. Constat (rappel, déjà indexé — non re-signalé comme nouveau)

`api/_lib/supabase.js:35 createUserClient(req)` vérifie SEULEMENT la présence
du Bearer (`unauthenticated` si absent). Un jeton présent mais invalide/expiré
n'est PAS rejeté à ce niveau : il n'est stoppé qu'au premier accès base, quand
la RLS renvoie PGRST301 → `isAuthError` → 401. Conséquence : sur `/api/geocode`
(qui n'ouvre AUCUNE requête base — cf. `api/geocode.js:50-51`), un jeton
invalide n'est jamais confronté à la RLS : la seule présence d'un Bearer
quelconque suffit à passer la porte et à consommer le quota Nominatim.

Objectif : défense en profondeur AU-DESSUS de la RLS — valider réellement le
jeton côté serveur (`auth.getUser()`) avant de servir tout endpoint.

## 1. Helper `requireUser` (pseudo-code précis)

Ajout dans `api/_lib/supabase.js`, à côté de `createUserClient` (conservé, voir
§1.3). Signature ASYNCHRONE.

```
// États renvoyés (identiques à createUserClient + user en cas d'ok) :
//  { status: 'unconfigured' }              → 503
//  { status: 'unauthenticated' }           → 401 (jeton absent, invalide,
//                                                  expiré, ou révoqué)
//  { status: 'ok', client, user }          → client RLS prêt + user vérifié
export async function requireUser(req) {
  // 1. Construction identique à aujourd'hui (réutilise createUserClient).
  const base = createUserClient(req);
  if (base.status !== 'ok') return base;   // unconfigured | unauthenticated

  const { client } = base;
  const token = getBearerToken(req);       // déjà validé non-null par createUserClient

  // 2. Vérification réelle du jeton auprès de Supabase Auth.
  //    getUser(token) → GET {url}/auth/v1/user, Bearer = token.
  //    Utilise global.fetch = fetchWithTimeout (5 s) : timeout sortant garanti
  //    (confirmé : AuthClient reçoit o.global.fetch dans supabase-js 2.110.2).
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data?.user) {
      return { status: 'unauthenticated' };   // jamais le détail de l'erreur
    }
    return { status: 'ok', client, user: data.user };
  } catch (err) {
    // Timeout (AbortError) ou panne réseau vers Auth : on NE sert pas.
    // Choix : 'unauthenticated' (401) plutôt que 503, pour ne pas divulguer
    //         l'état interne et rester fail-closed. (Réserve R3 §7.)
    return { status: 'unauthenticated' };
  }
}
```

Points imposés :
- `getUser(token)` reçoit le jeton EXPLICITEMENT (ne dépend pas d'une session ;
  `persistSession:false` déjà posé). Robuste et sans état.
- Aucune branche ne logge le jeton ni le message d'erreur Auth (PII / secret).
- Le timeout de 5 s est hérité de `global.fetch` déjà configuré — rien à ajouter.
- Aucun nouveau secret : `requireUser` réutilise url + clé publiable existantes.

### 1.3. `createUserClient` — conservé ou remplacé ?

CONSERVÉ. Raisons :
- `requireUser` s'appuie dessus (construction + états `unconfigured` /
  `unauthenticated` inchangés) → une seule source de vérité pour la fabrique.
- Patch minimal, style existant (directive CLAUDE.md). On n'exporte pas de
  nouveau chemin service-role ; on ajoute juste une couche de vérification.
- Après bascule, `createUserClient` n'est plus appelé directement par AUCUN
  endpoint (tous passent à `requireUser`). Il devient un helper interne ; on
  peut le laisser exporté (tests unitaires) sans risque : il n'ouvre aucun
  accès privilégié, la RLS reste la barrière de fond.

## 2. Endpoints à basculer (fichier → changement exact)

Motif identique partout. Le bloc actuel (sync) :

```
const result = createUserClient(req);
if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
const { client } = result;
```

devient (async) :

```
const result = await requireUser(req);
if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
const { client } = result;
```

Fichier par fichier (import `createUserClient` → `requireUser` ; `isAuthError`
reste importé là où il est utilisé) :

| Fichier | Ligne du bloc auth | Changement |
|---|---|---|
| `api/reseau.js` | import L3 ; bloc L9-13 | import `requireUser`; `await requireUser(req)` |
| `api/reseau/nodes.js` | import L4 ; bloc L28-31 | idem ; garder `isAuthError` (dbFail) |
| `api/reseau/edges.js` | import L4 ; bloc L27-30 | idem ; garder `isAuthError` (dbFail) |
| `api/reseau/journal.js` | import L4 ; bloc L27-30 | idem ; garder `isAuthError` (dbFail) |
| `api/geocode.js` | import L6 ; bloc L52-54 | idem — voir §3 (arbitrage) |

Note : `isAuthError` reste utile en défense en profondeur (une révocation entre
`requireUser` et la requête base reste possible) — on ne le retire pas.
Le handler `reseau.js` n'importe pas `isAuthError` en trop : il l'utilise déjà.

Handlers restant SYNC pour le reste : seule la ligne d'auth devient `await`.
Tous les handlers concernés sont déjà `async` — aucun changement de signature.

## 3. Verdict `/api/geocode` — CHANGEMENT DE COMPORTEMENT : OUI (arbitrage)

Aujourd'hui `/api/geocode` EXIGE déjà un jeton présent (`api/geocode.js:52-54`),
mais ne le VALIDE pas (aucune requête base → la RLS ne le rattrape jamais).

Basculer vers `requireUser` change le comportement observable :
- AVANT : un appel avec un Bearer quelconque (même invalide/expiré) était servi
  et consommait le quota Nominatim global.
- APRÈS : seul un jeton réellement valide passe ; un jeton invalide/expiré →
  401. Un appel qui « marchait » avec un faux jeton CESSE de marcher.

C'est le durcissement voulu (fermer l'énumération/abus de quota Nominatim par
jeton bidon), mais c'est un vrai changement fonctionnel, à acter par Paul :
1. Coût : `/api/geocode` était le seul endpoint sans aller-retour base ; il
   gagne désormais 1 aller-retour Auth (cf. §5).
2. Aucun appelant légitime n'est cassé : le front n'appelle `/api/geocode`
   qu'authentifié (mode réel) ; en mode démo, `js/config.js` vide → l'app ne
   frappe pas l'API (cf. smoke-geocode qui force le mode démo et stube la route).
Recommandation : basculer aussi `/api/geocode` (cohérence + fermeture de l'abus
de quota). Signalé comme arbitrage, non tranché unilatéralement.

## 4. Sécurité (invariants respectés)

- Erreurs client génériques : `401 'Authentification requise'` pour jeton
  absent ET invalide ET expiré ET timeout Auth. Jamais « token expiré » /
  « jwt malformed » côté client. (Le message Auth n'est ni renvoyé ni loggé.)
- Jamais le jeton en logs : `requireUser` ne logge rien. Si un log de contexte
  était ajouté plus tard, IDs uniquement (règle permanente).
- Timeout sortant : conservé — `getUser` hérite de `fetchWithTimeout` (5 s),
  vérifié dans le bundle (`AuthClient(..., o.global.fetch)`).
- Aucun nouveau secret : réutilise url + clé publiable. Le repli clé publiable
  reste COHÉRENT : la clé publiable est justement celle qui autorise l'appel
  `auth/v1/user` avec un jeton utilisateur ; la sécurité de fond reste la RLS,
  `requireUser` n'est qu'une couche amont. Rien à committer de sensible.

## 5. Coût (mono-utilisateur) — ACCEPTABLE

`auth.getUser()` = 1 aller-retour HTTP supplémentaire vers Supabase Auth
(`/auth/v1/user`) par requête API.
- Latence : ~50-150 ms ajoutés par requête (même région). Plafond dur : 5 s
  (timeout). Sur des endpoints déjà à 1+ aller-retour base (reseau/nodes/…),
  surcoût relatif faible ; `/api/geocode` passe de 1 à 2 sauts amont.
- Volume : usage mono-utilisateur (1 owner), interactions humaines espacées —
  pas de rafale. Aucun risque de rate-limit Auth Supabase à ce volume.
- Pas de cache proposé (complexité > bénéfice à ce volume ; un cache de jetons
  réintroduirait un état à invalider — hors périmètre « patch minimal »).
Verdict : surcoût négligeable et acceptable pour le gain défense-en-profondeur.

## 6. Preuve patrimoine — stratégie de test

### 6.1. Ce que le harnais navigateur NE prouve PAS
Les smoke-tests (`tests/smoke-*.mjs`) tournent en mode démo forcé
(`ULTIMA_CONFIG` vide) et stubent `/api/*` par interception de route Playwright.
Ils n'exécutent JAMAIS les handlers `api/` réels ni Supabase. `requireUser`
n'est donc pas exerçable par le harnais navigateur.

### 6.2. Ce qui EST exerçable : test unitaire Node pur (précédent existant)
`tests/unit-geocode.mjs` importe DÉJÀ `api/geocode.js` et l'exécute avec un
`fetchImpl` injecté et un faux `req`/`res`. Modèle directement réutilisable.

Proposition : nouveau `tests/unit-auth.mjs` (façon unit-geocode), ajouté à
`tests/lancer.sh` section « unitaires Node purs ». Il teste `requireUser` en
mockant `client.auth.getUser`. Pour mocker sans vrai backend, deux options :

Option A (recommandée, sans réseau) : injecter un faux client.
Refactor minimal : `requireUser(req, makeClient = createUserClient)` — le 2ᵉ
argument (défaut = fabrique réelle) permet au test de fournir un client dont
`auth.getUser` est un stub. Aligne sur le motif `fetchImpl` déjà utilisé dans
`api/geocode.js`. Cas couverts :

```
// jeton absent → unauthenticated (getUser jamais appelé)
requireUser(reqSansBearer)                         → status 'unauthenticated'
// env manquantes → unconfigured  (via createUserClient réel + env forcées)
// getUser renvoie { data:{user:null}, error:{...} } → unauthenticated
// getUser renvoie { data:{user:{id}}, error:null }  → ok + user.id présent
// getUser rejette (AbortError timeout)              → unauthenticated (fail-closed)
// aucun log ne contient le jeton (espion console.error, cf. unit-geocode)
```

Option B (sans refactor de signature) : test au niveau handler `/api/geocode`,
en surchargeant temporairement l'URL/clé env vers un mock local — plus lourd,
non retenu.

Test de fermeture (critère PASS) : `node tests/unit-auth.mjs` sort
`UNIT-AUTH OK` avec, en particulier, le cas « getUser error → 401 » qui
échouerait sur le code actuel (createUserClient ne valide pas) et passe après
patch. C'est la preuve directe du durcissement.

## 7. Risques / réserves

- R1 — Signature de test : l'option A ajoute un paramètre optionnel à
  `requireUser` (injection du client) uniquement pour la testabilité. Acceptable
  (même motif que `fetchImpl` de geocode) ; à valider par Léo car touche l'API
  interne du helper auth (gate auth).
- R2 — `/api/geocode` : changement de comportement (§3) — arbitrage Paul.
- R3 — Politique en cas de PANNE Auth (timeout/réseau) : le choix fail-closed
  (401) est le plus sûr mais rendrait l'app inutilisable si Auth Supabase est
  down alors que la base répond. Alternative : 503 « Service momentanément
  indisponible » pour distinguer panne d'authentification refusée. Recommandé :
  fail-closed 401 (posture adversariale), à confirmer.
- R4 — Double aller-retour : `requireUser` + requête base = 2 appels amont
  séquentiels (getUser PUIS query). Pas de parallélisation proposée (on ne veut
  pas frapper la base avec un jeton non encore validé). Coût assumé (§5).
- R5 — `isAuthError` conservé : défense en profondeur si le jeton est révoqué
  entre getUser et la requête base (fenêtre courte). Ne pas le retirer.
