# AUDIT 2026-10-05 — Léo LV1 / FINUBAR (auditeur Claude, source c2835ed)

> Tableau de bord des constats, tenu à jour dans la PR353. Le rapport d'audit
> d'origine suit, inchangé hors annexes ; il a été rédigé avant toute lecture du verdict
> Gemini. Les exécutions citées ont eu lieu dans une isolation établie
> (réseau coupé, uid 65534, aucune capacité, racine ro, env vide), en Python
> 3.11 : **la CI 3.12 de la PR fait foi**.

## État des constats C après la séance du 06/10/2026 (branche `codex/r21-protocole-20261005`)

| Constat | Statut | Commit | Preuve |
|---|---|---|---|
| C1 alias du dépôt de contrôle | ✅ corrigé | 2d217ae | 2 régressions, rouges sur c2835ed |
| C2 arrêt non écrit si verrou tenu > 10 s | ✅ corrigé (+ pierre tombale) | 2d217ae, 9043fa0 | 3 régressions |
| C3 suppression + initialize = réarmement | ✅ corrigé | 2d217ae | 1 régression |
| C4 rollback du verrou | ✅ corrigé pour le fichier ; ⏭ dossier entier → ancre extérieure (Paul) | 9043fa0 | 3 régressions |
| C5 propriétaire/modes non vérifiés | ✅ corrigé | 2d217ae | 1 régression + cas positif |
| C6 Broker sans verrou global | ✅ corrigé | ee7ce1b | 1 régression, mutant rouge |
| C7 Paul ne peut pas arrêter ; aucun arrêt humain global | ✅ corrigé (`owner_stop`) | 2d217ae | 1 régression |
| C8 journal plein bloque le stop | ✅ corrigé | 2d217ae | 1 régression |
| C9 petit-enfant `setsid` survit | ✅ corrigé tant que l'hôte vit (subreaper + balayage) ; ⏭ cgroup | d9aa449 | 2 régressions + cas positif |
| C10 superviseur tué, enfant survit | ✅ enfant direct (PDEATHSIG) ; ⏭ petits-enfants → cgroup | d9aa449 | 1 régression |
| C11 états « approuvé/fusionné » écrits par l'acteur | ✅ runtime ; ⏭ SQL proposé non appliqué (porte rouge) | ee7ce1b + `leo/proposals/registre-etats-proprietaire.sql` | 1 régression + mutant |
| C12 délégation ignore l'arrêt global | ✅ corrigé | ee7ce1b | 2 régressions, mutant rouge |
| C13 aucune limite de ressources | ✅ core=0, descripteurs ≤ 256 ; ⏭ mémoire/CPU/réseau → enceinte | d9aa449 | 1 régression |

Mesures locales en isolation : runtime 158/158 (137 d'origine + 21 nouveaux) ;
unitaires JS 64/64 ; suite runtime complète 20/20 sous charge parallèle.
C9-bis (défaut antérieur révélé ici) : un lancement voisin faisait tuer un
enfant sain par lecture du verrou sans attente — corrigé. Un seul test
existant a vu une assertion resserrée (`leo_agent_stopped`, plus strict).

**Restent ouverts, hors code :** E1 (identité GitHub distincte), E2 (hôte
installé, cgroup, UID propre), A1 (canal d'accord humain), ancre extérieure
(C4 dossier entier). **Web, suite du 06/10 (branche `claude/relaxed-wright-y6zak5`) :**
W1 ✅ commit c3cd2cd — interrupteur `LEO_ECRITURES_AUTO` (absente ou `actives` =
comportement inchangé ; toute autre valeur coupe l'anneau vert, échec fermé ;
bascule = variable Vercel + redéploiement — un drapeau en base sans redéploiement
demanderait une migration, porte rouge). W2 ✅ même commit — `/api/leo` en
`requireProprietaire` ; ⏭ fusion conditionnée à `ULTIMA_PROPRIETAIRES` posée en
Production (sinon 503 voulu). Journal et registre restent `requireUser` + RLS
(aucun coût). **C11 SQL ⏭ reportée jusqu'à E1** (Paul, 06/10 : sans identité
distincte, la garde ne sépare pas Léo de Paul). Restent ouverts : W4, W5, W10,
W3/W6/W8/W11.

**Revue Codex de #353 (06/10, après fusion) — 9 remarques, toutes vérifiées.**
Huit fondées et corrigées sur la même branche, chacune avec une régression
rouge sur `main` (560ad78) : arrêt de Paul par le canal six champs ; états
« approuvée/fusionnée » gardés par `MissionStore` (l'hôte seul consigne un reçu
vérifié) ; balayage limité aux lancements marqués ou observés (un enfant de
l'hôte en autre session est épargné) ; lanceur à fil unique sans `preexec_fn` ;
marqueur `.installed` posé avant le schéma ; cible relative jugée avant
d'exister ; statut et réconciliation possibles journal plein ; journal de
transport soumis aux mêmes permissions que le verrou. La neuvième (SQL C11 non
éprouvé) suit le report de C11 : l'en-tête de la proposition le dit.

---

# Audit indépendant de Léo LV1 et de FINUBAR, côté Claude

Ce rapport a été rédigé **avant toute lecture du verdict de Gemini**.

## Objet de l'audit

| Élément | Valeur |
|---|---|
| Dépôt | `PaulGERARD161098/Ultima-` |
| PR | 353, brouillon |
| Commit source | `c2835edb9f0590045ae1a823e5ff4fa4ecf9fd41` |
| Commit de base | `9a261c5fb1ac1a77bdf53e5b3f98444297b2599b` |
| Date | 05/10/2026 |

## Ce que j'ai fait, et ce que je n'ai pas fait

**Lecture.** J'ai lu le code, les tests et les documents. Pour couvrir plus large, deux lectures ont été confiées à des sous-agents, dont j'ai recoupé les constats importants :
- les voies web et SQL ;
- le contrat et les documents.

**Exécution.** J'ai exécuté du code **uniquement** dans une isolation que j'ai montée et vérifiée moi-même (détail au §1.3).

**Ce que je n'ai pas fait :**
- aucune fusion, aucun déploiement, aucun envoi, aucune activation ;
- aucun accès à `leo-control-r21` ;
- aucune lecture de secret ;
- aucune écriture dans le dépôt.

**Statut des correctifs.** Ils sont fournis sous forme de diff. Ils ne sont appliqués nulle part ailleurs que dans une copie jetable.

---

## Verdict, sur le périmètre effectivement couvert

**Utilisable comme préparation.** Le noyau Python est sérieux : politique fermée, broker, registre, budget, journal anti-rejeu et protocole six champs. La suite runtime de c2835ed passe en isolation : 137 tests sur 137, dont les dix nouvelles épreuves du superviseur. La plupart des contournements classiques que j'ai tentés sont refusés.

**Pas prêt pour un pilote borné, en l'état.** Cinq défauts du code préparatoire, reproduits, cassent l'exigence centrale, à savoir un arrêt persistant, global, impossible à lever seul et accessible à Paul.
- **C2** : un arrêt peut ne pas être écrit.
- **C3** : une suppression suivie d'une réinitialisation réarme le contrôle.
- **C5** : un fichier de contrôle en accès trop large est accepté.
- **C7** : Paul ne peut pas arrêter, et aucun arrêt global humain n'existe.
- **C8** : quand le journal est plein, le stop est refusé.

Un correctif testé ferme ces cinq points, ainsi que C1 (les alias du dépôt de contrôle). Une fois ce correctif reçu en CI, un pilote borné **sur fixture** devient possible.

**Activation réelle bloquée.** Le contrôle demandé (« Léo ne peut pas modifier, désactiver, réarmer, remplacer ni auto-approuver son contrôle installé ») **n'existe pas aujourd'hui**. Il n'existe que sous forme de bibliothèque appelée par un hôte qui n'est pas installé.
- La Léo réellement active ne passe pas par ce contrôle :
  - **Léo-séance** agit via Claude Code et les connecteurs GitHub, sous l'identité administrateur de Paul ;
  - **Léo-produit** écrit dans l'anneau vert en production.
- Ce qui l'arrête aujourd'hui relève de l'extérieur du code : la portée des connecteurs et le catalogue fermé du web. FINUBAR n'y joue aucun rôle.

Je ne donne aucun pourcentage d'autonomie. Les critères mesurables sont au §6.

---

## 1. Frontières de confiance et couverture

### 1.1 Cartographie concise

| Composant | Lit | Écrit | Approuve | Lance | Arrête | Réarme |
|---|---|---|---|---|---|---|
| **Paul** | tout (propriétaire) | tout, via l'interface et les connecteurs | seul habilité (doctrine) | — | dans le code : **non** (C7) ; dans les faits : en retirant des accès | à la main, hors code |
| **Modèle Léo, séance Work ou Claude Code** | dépôts du connecteur, fichiers | branches, PR et brouillons sous l'identité de Paul (ACT:339) | peut APPROVE sous la même identité (ACT:632-637) | sessions, Routines (non vérifié) | rien ne l'arrête en code | — |
| **Modèle Léo, produit (`/api/leo`)** | contexte fourni | **rien directement** : il propose seulement | — | — | — | — |
| **Front Ultima** (`js/leo-accueil.js`) | API | **exécute l'acte vert** sur les routes CRUD génériques (W1) | clic orange, non prouvé côté serveur (W4) | — | — | — |
| **API Vercel** | Supabase sous RLS, avec le jeton de l'utilisateur | journal `leo_ecritures` et tables métier | — | appel Anthropic facturé | plafond de 40 tentatives par heure ; **aucun arrêt FINUBAR** | — |
| **Supabase** (RLS, fonctions `leo_*` en SECURITY DEFINER) | par propriétaire | par propriétaire, et registre via RPC | — | — | `leo_stop` : mission du registre mémoire seulement | aucune RPC de réarmement (bien) |
| **Runtime Python** (`leo/`, `finubar/leo_*.py`) | fixtures | SQLite local | `Approval` **injecté en configuration** (A1) | `ProcessSupervisor` | `ControlLatch` et `BudgetLedger.stop` | aucune méthode (bien), mais le réarmement par fichier est possible (C3, C4, C5) |
| **Hôte R21** (`TrialHost`, `AdmissionHost`) | GoTrue, sur boucle locale | registre et journal | — | `trial_resume.execute` | commande `stop`, **mission seulement**, réservée aux acteurs (C7) | — |
| **FINUBAR, index** (`finubar/*.mjs`, `api/finubar*`) | grains des dépôts | `finubar-macro.mjs` par commit ; mail Resend par cron | — | cron 05:00 et 06:00 UTC | — | — |
| **GitHub / CI** | dépôt | `contents: read` ; artefacts | — | workflows de PR | — | — |
| **Hôte de contrôle futur, `leo-control-r21`** | — | — | — | — | — | **absent du paquet ; existence non attestée** (ACT:196-198) |

Le runtime Python est exclu du déploiement (`.vercelignore`). **Aucune route web ne l'importe.**

### 1.2 Couverture

**Intégrité du paquet.** J'ai vérifié les 374 fichiers de `source/` : 374 conformes en SHA-1 Git, en SHA-256 et en taille. Les 61 fichiers du fichier texte « cœur » sont identiques à ceux du ZIP. Par rapport à la base, la PR change 18 fichiers, dont 9 nouveaux (`finubar/leo_control.py`, `finubar/leo_process.py`, `leo/control_r21/*` et 4 tests).

**Lus en entier par moi :**
- `finubar/leo_control.py`, `finubar/leo_process.py` ;
- `leo/runtime/{policy,broker,budget,memoire,fixture_git}.py` ;
- `leo/trial.py`, `leo/trial_host.py`, `leo/trial_resume.py`, `leo/control_r21/{admission,client,protocol}.py` ;
- `.github/workflows/leo-lv1.yml` ;
- les en-têtes des 4 nouveaux tests ;
- `LIRE-AVANT-AUDIT.md`, `ETAT-CI.json`, `MANIFESTE.json`.

**Lus en partie par moi :**
- `leo/runtime/dispatch.py` (constructeur, `dispatch`, recherche de l'arrêt) ;
- `tests/runtime/test_control_r21_admission.py`, `test_finubar_leo_process.py`.

**Lus par le sous-agent web, puis vérifiés par moi sur W1 et W2 :**
- en entier : `api/leo.js`, `api/leo/ecritures.js`, `api/leo-registre.js`, `api/finubar*.{js,mjs}`, `api/_lib/{leo,leo-execution,leo-journal,proprietaire,supabase,http,fetch,read-all}`, `api/reseau/journal.js`, `api/idees/items.js`, 8 migrations Léo, `vercel.json`, `.vercelignore` ;
- en partie : `js/leo-accueil.js`, `js/leo-registre-client.js`, les pages HTML, `finubar/collecter.mjs`, `finubar/agreger.mjs`.

**Lus par le sous-agent documentaire :**
- en entier : `ACTIVATION.md`, `REPRISE-2026-09-29`, `CADRAGE-FINUBAR`, `AGENTS.md`, `RECETTE-*`, `leo/README.md`, les compétences Work, `.claude/agents/leo.md`, `.claude/commands/leo.md` ;
- en partie : `CADRAGE-2026-09-22` (le §11 en entier, les §13 et §15 en partie ; les lignes 1-273, 353-568, 621-754, 1103-1326 et suivantes n'ont pas été lues) et `CLAUDE.md`.

**Non examinés :**
- `api/_lib/validate.js`, `drive.js`, `geocode.js`, `import-personnes.js`, `intendant.js`, `zohshia-technos.mjs` ;
- `js/app.js`, `registre-lv3.mjs`, `adaptateur-lv4.mjs`, les CSS ;
- 26 des 34 migrations (seulement parcourues par recherche) ;
- `tests/*.mjs` hors runtime ;
- `.github/workflows/leo-auth.yml` et `tests.yml` (en partie) ;
- `finubar/lecons-*`, `export-chatgpt-empreinte.mjs`.

**Absents du paquet :**
- `middleware.js`, qui porte la CSP, le rate-limit et les chemins privés : **le web n'est donc pas couvert sur ces points** ;
- `leo/control_r21/checkpoint.py`, annoncé mais inexistant ;
- `memoire/`, les données métier, l'état Supabase et Vercel réel, le dépôt de contrôle.

### 1.3 Exécutions et isolation

**Comment l'isolation est montée** (`isolation-lv1.sh`, fourni) :
- `unshare` réseau, montage et PID ;
- interface `lo` seule, montée par ioctl ;
- racine remontée en lecture seule dans l'espace de montage ;
- `tmpfs` sur `/tmp` et `/root` ;
- `setpriv` en uid et gid 65534, avec `--no-new-privs`, sans capacités ni bounding set ;
- `env -i`.

**Ce que j'ai vérifié dans cette isolation :**
- `CapEff` vaut 0 et `NoNewPrivs` vaut 1 ;
- `/sys/class/net` ne contient que `lo` ;
- la racine est montée en `ro` ;
- `connect(1.1.1.1:443)` échoue avec `ENETUNREACH` ;
- les variables secrètes de ma session sont absentes ;
- `/root` est illisible.

Ce sont les conditions exactes que vérifie `trial._isolated()`.

**Écart avec la CI :** Python 3.11.15 et git 2.43, alors que la CI utilise l'image `python:3.12-bookworm`. **Ce résultat ne remplace pas le job `runtime` de la CI.** Au moment de l'export, ce job était en file d'attente (`ETAT-CI.json`) ; une file d'attente n'est pas un succès.

**Résultats sur c2835ed :**

| Jeu | Résultat |
|---|---|
| `python -m unittest discover -s tests/runtime` | **137 tests sur 137 OK** |
| 11 reproductions d'attaque (`repro-audit-c2835ed.py`) | **11 sur 11 reproduites.** C9 a échoué une fois sur 7 essais, cause non établie. |
| 8 régressions (`test_audit_regressions.py`) | **8 sur 8 rouges** : le témoin négatif est valide |

**Résultats sur la copie corrigée (diff A) :** 145 tests sur 145 OK, soit les 137 existants plus les 8 régressions. **Aucun test existant n'a été modifié.**

---

## 2. Constats

Légende :
- **R** : reproduit en isolation ;
- **S** : confirmé statiquement ;
- **D** : documentaire ;
- **NV** : non vérifié ;
- **Bloq.** : bloque l'activation.

### Sécurité et indépendance du contrôle

| ID | Grav. | Où | Scénario causal | Impact | Statut | Correction minimale | Test de régression et cas positif | Bloq. |
|---|---|---|---|---|---|---|---|---|
| **E1** | P0 | Hors code (ACT:339, 632-637) | Léo-séance et Paul partagent l'identité GitHub `paggerard-boop`, administrateur. Elle peut APPROVE, pousser, et créer ou modifier un dépôt de contrôle situé sur ce compte. | Aucune séparation d'autorité : une revue native ou un accord GitHub ne prouve rien. | D, NV par moi | Donner à Léo une identité distincte (compte ou App) sans droit d'administration ni droit sur le contrôle. Placer le contrôle sous un propriétaire où Léo est exclu. | Avec l'identité de Léo : écriture sur le contrôle → 403. Cas positif : écriture sur une branche d'Ultima → OK. | **Oui** |
| **E2** | P0 | Hors code | Le « contrôleur installé hors des droits de Léo » n'existe pas. `leo_control.py` est une bibliothèque, et ses appelants (`Broker`, `TrialHost`) ne servent qu'aux fixtures. Léo-séance et Léo-produit n'y passent jamais. | La garantie demandée est nulle sur les voies réelles. | S | Installer l'hôte FINUBAR (au minimum : conteneur, UID distinct propriétaire du verrou, commande fixe) et faire passer **toute** voie d'effet par lui. | Voir le pilote du §6. | **Oui** |
| **C2** | P1 | `leo_control.py:68-75` (`_trip`), `:148` | Une admission tient le verrou plus de 10 s : effet long, autre mission, ou `BEGIN IMMEDIATE` concurrent. Pendant ce temps, Léo propose `change_control`. `latch.trip` lève `OperationalError: database is locked`, et `ledger.stop` **n'est jamais appelé**. | La tentative est refusée, mais **aucun arrêt n'est écrit**, ni global ni de mission. Léo poursuit dès que le verrou se libère. | **R** (`test_C2`) | Attendre au-delà de la plus longue admission bornée (330 s, contre 300 pour le superviseur). Tenter l'arrêt de mission même si le verrou global échoue. Refuser avec `finubar_stop_unconfirmed` si l'un des deux n'est pas confirmé. | `test_trip_waits_for_running_admission_then_persists_both` (verrou tenu 12 s) et `test_ledger_stop_recorded_even_if_latch_unavailable`. Cas positif : un `write_memory` normal reste admis. | Oui |
| **C3** | P1 | `leo_control.py:86-98` (`initialize=True`) | Le verrou est arrêté ; le fichier est supprimé, ou le volume recréé ; le lanceur rappelle `ControlLatch(path, initialize=True)`, comme le fait chaque test. Résultat : un contrôle **neuf, non arrêté**. | Réarmement implicite. | **R** (`test_C3`) | Poser un marqueur d'installation `<verrou>.installed` en `0400`. Une fois ce marqueur présent, `initialize=True` refuse avec `control_unavailable`. | `test_deleted_control_is_never_recreated_unstopped`. Cas positif : première installation. | Oui |
| **C4** | P1 | `leo_control.py` (tout) ; `trial_resume.py:118-119` | Restaurer une copie antérieure du verrou ou de `canonical.sqlite` remet `stopped=0`. `_canonical` accepte `stopped` à 0 comme à 1. Aucune ancre monotone n'existe. | Rollback silencieux de l'arrêt. | **R** (`test_C4`) | **Extérieur** : ancre monotone hors de portée de Léo (séquence signée chaînée, ACT:146-152). En code, l'hôte compare le verrou à l'ancre au démarrage. | Restaurer une copie antérieure → refus `anchor_regression`. | Oui |
| **C5** | P1 | `leo_control.py:120-122`, `135-138` | Le code ne vérifie ni le propriétaire (UID) ni le mode du verrou ou de son dossier. Un verrou en `0666`, ou un dossier en `0777`, est accepté, et n'importe quel UID fait `UPDATE control SET stopped=0`. Cela vaut aussi pour les fichiers `-journal` (journal chaud) si le dossier est inscriptible. | Réarmement par quiconque peut écrire le fichier. | **R** (`test_C5`) | `_assert_private()` : fichier régulier ; UID égal à celui de l'hôte ; aucun accès groupe ni autre ; dossier détenu par l'hôte et non inscriptible par d'autres. | `test_world_accessible_control_is_refused`, avec cas positif en `0600`/`0700`. | Oui |
| **C7** | P1 | `trial_host.py:108-109` et `117-145` ; `leo_control.py:146` | Une binding de Paul (`principal=OWNER`) appelle `stop` : `Policy.authorize` exige `principal ∈ actors`, ce qui donne `scope_denied`. Seuls les acteurs de Léo peuvent arrêter. De plus, `stop` n'arrête que la mission : `ControlLatch.trip` refuse tout motif humain. | **Aucun arrêt global n'est disponible à Paul sans dépendre de Léo.** | **R** (`test_C7`) | Avant la politique, le propriétaire canonique peut faire `stop`, ce qui donne l'arrêt de mission plus le verrou global avec le motif `owner_stop`. Paul ne peut toujours pas exécuter. | `test_owner_stop_is_global_and_independent_of_leo`. Cas positif : Paul → `execute` reste `scope_denied` ; `trip('rearm')` reste refusé. | Oui |
| **C8** | P1 | `admission.py:80` | Le journal anti-rejeu est global, limité à 256 lignes, partagé par tous les sujets, et les refus y laissent aussi une ligne `unknown`. Après 256 requêtes, quel que soit leur auteur, **`stop` renvoie `request_journal_full`**. | Une Léo qui boucle bloque l'arrêt par le raccord six champs. | **R** (`test_C8`) | Un `stop` refusé pour journal plein est exécuté sans journal : c'est une réduction de droits, idempotente. Le plafond reste effectif pour les autres commandes. | `test_full_journal_never_blocks_stop`, avec cas positif sur le plafond conservé. | Oui |
| **C1** | P1 | `leo_control.py:31`, `38` | `PaulGERARD161098/leo-control-r21.git`, ou un chemin **relatif** (`installed/control`, `../x`) qui correspond à la regex `owner/repo`, renvoie `None` : admis, sans arrêt. Une URL `https://github.com/...` renvoie `target_unknown` (arrêt, correct). | Une tentative non détectée, donc aucun arrêt. La vraie barrière reste les droits GitHub (E1). | **R** (`test_C1`) | Canonicaliser (URL, `.git`, `/` final, casse). Rejeter `.` et `..`. Une cible relative existante est jugée sur son chemin réel. | `test_control_repository_aliases_trip` et `test_relative_existing_target_inside_protected_path_trips`. Cas positif : `PaulGERARD161098/Ultima-` et `owner/.github` restent admis. | Oui |
| **C6** | P1 | `broker.py:183` ; `leo_control.py:57` | `Broker(..., control_latch=None)` est accepté : `execute` saute alors toute admission globale. `trial.prepare` et la majorité des tests construisent le broker ainsi. | Un hôte mal câblé : arrêt par mission seulement, jamais global. | **R** (`test_C6`) | Pour toute action autre que `status`, exiger le verrou (`global_control_latch_required`). Diff B, **non exécuté** : il faut adapter `trial.prepare` et les montages de tests pour qu'ils passent un verrou. | Broker sans verrou, puis `write_memory` → refus. Cas positif : avec verrou → OK. | Oui |
| **C12** | P1 | `dispatch.py:132-170` | `DispatchBroker.dispatch` ne consulte que l'arrêt de **sa** mission (`budget_missions.stopped`), jamais `ControlLatch`. | Un arrêt global n'empêche pas une délégation à un spécialiste. | S | Prendre `control_latch` et tenir `latch.admission()` autour de la transaction finale. Diff B, non exécuté. | Verrou arrêté, puis `dispatch` → `leo_agent_stopped`. Cas positif : délégation autorisée. | Oui |
| **C9** | P1 | `leo_process.py:89`, `63-71` | L'enfant fait un double fork puis `setsid()`. `killpg` ne l'atteint plus et **le petit-enfant survit à l'arrêt**. | Un processus hostile continue après l'arrêt. Déclaré « pas un sandbox ». | **R** 6 fois sur 7 (`test_C9`) | **Extérieur** : cgroup ou conteneur tué en bloc par FINUBAR, avec `pids.max`. | Petit-enfant `setsid` : mort après l'arrêt. | Oui |
| **C10** | P1 | `leo_process.py:89` (`start_new_session`) | Le superviseur est tué (SIGKILL, OOM, panne d'hôte). L'enfant, dans sa propre session, n'est ni signalé ni surveillé, et poursuit même si le verrou est arrêté. | Un arrêt sans effet sur ce qui tourne. | **R** (`test_C10`) | Extérieur : même cgroup. Palliatif en code : `PR_SET_PDEATHSIG` dans l'enfant, ce qui ne couvre ni les petits-enfants ni `setsid`. | Superviseur tué : enfant mort en moins de 1 s. | Oui |
| **A1** | P1 | `trial_host.py:72-79` (`Binding.approval`) ; `policy.py:108` | L'`Approval` est une **donnée de configuration** de la binding de l'acteur Léo, fixée à la construction de l'hôte. Elle n'est pas le résultat d'un geste authentifié de Paul au moment de la décision. `approver` est une simple chaîne égale à `mandate.owner`. | Une fois installée ainsi, l'approbation est pré-accordée jusqu'à son expiration. « Accords simulés » est déclaré, mais aucun canal réel n'est préparé. | S | Un canal d'accord : un événement authentifié **du sujet de Paul**, à usage unique, lié au contexte (SHA source, cible, intégration), frais (TTL court), consommé sous le verrou d'admission. | Accord rejoué → refus ; accord d'un autre SHA → refus. Cas positif : accord frais et exact → fusion fixture. | Oui |
| **C11 / W7** | P2 | `memoire.py:62-65`, `117-127` ; SQL `20261001070311:46-62` ; `index.html:184` | L'acteur Léo (un writer) peut écrire `state='approved_for_merge'` ou `merged`, et l'interface l'affiche. | Aucun consommateur ne le traite aujourd'hui comme une autorisation, mais **une note se lit comme un accord**. | **R** (Python), S (SQL) | En Python comme en SQL, réserver ces deux états au propriétaire et à l'hôte. | Writer → `approved_for_merge` refusé (42501). Cas positif : le propriétaire passe. | Non |
| **C13** | P3 | `leo_process.py` | Aucune limite de ressources (`RLIMIT_*`) ni changement d'UID. Le réseau est hérité. | Déclaré. | S | Fournir par l'enceinte (E2). | — | Non |

### Voies web et SQL

Ces constats viennent du sous-agent. J'ai revérifié W1 et W2.

| ID | Grav. | Où | Scénario causal | Impact | Statut | Correction minimale | Test de régression et cas positif | Bloq. |
|---|---|---|---|---|---|---|---|---|
| **W1** | P1 | `api/_lib/leo-execution.js:69-129` ; `js/leo-accueil.js:1132-1191` ; routes CRUD (`api/idees/items.js` n'a aucune référence à `leo_ecritures`) | La route `ouvrir` ne conditionne qu'une ligne de journal. **L'acte vert est exécuté par le front** sur des routes génériques qui ne vérifient ni trace, ni anneau, ni arrêt. Aucune voie web ne lit le verrou FINUBAR ni `leo_missions.stopped`. | **Léo-produit écrit en production sans aucun interrupteur d'arrêt**, en dehors d'un redéploiement. « Journal avant l'acte » ne vaut que si le front est honnête. | S, vérifié | Un interrupteur serveur fermé par défaut, en tête d'`ouvrirEcriture` et dans `api/leo.js` (qui ne sert plus `anneau:'vert'`) : un drapeau en base, propriétaire seul, lu en échec fermé. Variante minimale : la variable d'environnement `LEO_ECRITURES=actif`. | Drapeau absent → 403, le front retombe sur la carte orange. Cas positif : `actif` → ligne `tentee`. | Oui, pour l'anneau vert |
| **W2** | P1 | `api/leo.js:49`, `leo/ecritures.js:28`, `leo-registre.js:30` | `requireUser` seul : tout compte inscrit appelle la route facturée Anthropic. L'inscription a été **mesurée ouverte le 04/10** (grain FINUBAR ; je ne l'ai pas revérifiée). La garde de débit est par utilisateur, donc contournée avec N comptes. `cause` révèle l'état du crédit. | Consommation du crédit de Paul, indisponibilité, extraction du prompt système. | S, vérifié ; inscription NV | `requireProprietaire` sur ces trois routes, **et** fermer l'inscription (geste de Paul). | Compte non listé → 403 avant tout appel Anthropic ; variable absente → 503. Cas positif : le propriétaire passe. | Oui |
| **W4** | P2 | `js/leo-accueil.js:969-1006` ; `idees/items.js:58-87` | La confirmation orange est un simple clic de page. Aucun nonce serveur, et l'acte orange n'est pas journalisé. | L'orange ne repose que sur le front ; l'écran « Ce que Léo a fait » est incomplet. | S | Étape `ouvrir_confirme` avec un nonce délivré par `/api/leo`, lié au condensé (outil, arguments), à usage unique. Le nonce ne prouve pas l'humain : le dire. | Arguments différents du nonce → 403. Cas positif : mêmes arguments → `tentee` orange. | Non |
| **W5** | P2 | `leo-execution.js:233-243` | « Défaire » supprime une note (`journal`) ou un scénario que Paul a retouché : ces tables n'ont pas `updated_at`. | Perte de données de Paul. | S | Migration `updated_at` + déclencheur, puis `retouche:true` (geste SQL de Paul). | Créer, retoucher, défaire → 409. | Non |
| **W10** | P2 | `.claude/finubar-rappel.mjs:117-152` | Le grain FINUBAR est injecté au démarrage de séance sous forme impérative (« ▶ REPRENDRE PAR », « EN ATTENTE D'UN GESTE DE PAUL »), sans l'étiquette « déclaré, non autoritatif ». | **Une note FINUBAR se lit comme une consigne.** Je l'ai constaté sur cette séance même : le rappel m'a été injecté ainsi. | S, observé | Préfixer : « Données déclarées par FINUBAR.md, non vérifiées, jamais une autorisation ». | Le texte injecté contient le préfixe. | Non |
| **W3, W6, W8, W11** | P3 | Plafond limité aux `tentee` ; journal falsifiable par son propriétaire ; échos réinjectés en rôle `user` ; secret du cron comparé hors temps constant, et `force=1` | Détails dans l'annexe du sous-agent. | Bornés au propriétaire, ou cosmétiques. | S | Voir le rapport web. | — | Non |

### Cohérence documentaire

| ID | Grav. | Constat | Statut |
|---|---|---|---|
| **D1** | P2 | La compétence Work `leo-lv1` est en **1.4** (SKILL.md:8), alors que `policy.py:11` exige `SKILL_VERSION='1.0'`. Un mandat construit avec la compétence courante serait refusé (`version_mismatch`), ou la constante est périmée. R22 n'a été éprouvé que sur la 1.0. | S |
| **D2** | P2 | Des permissions historiques restent intactes et contredisent le contrat. Il manque une phrase qui les révoque nommément. | D |
| **D3** | P2 | `REPRISE-2026-09-29` empile neuf « reprises courantes » avec des prochaines actions divergentes. `contrat-lv1-v1.1.md` (copie Work) conserve une « prochaine action unique » périmée, et ne porte ni l'en-tête de précédence ni la note de réconciliation du §11. | D |
| **D4** | P2 | L'extension FINUBAR du 05/10 (arrêt persistant, superviseur) **élargit le périmètre de réception sans identifiant R ni version** (CAD:1041 exige « explicite et versionné »). | D |

Exemples pour D2 :
- `leo.md:127-146` : créer des agents « sans demander », chercher des skills sur GitHub ;
- `commands/leo.md:49-52` : « Sauf si go solo — alors tu enchaînes » ;
- `leo.md:158-166` : envoi sur instruction, alors que le contrat le range en rouge ;
- `CLAUDE.md` §DR : rituels « sans que Paul les demande », puis « objectifs historiques » dans le même fichier.

**Trace exacte des critiques reproduites.** Le fichier `repro-audit-c2835ed.py` est exécutable dans l'isolation. Chaque test PASSE quand la faiblesse est présente :

```
test_C1 … test_C11  →  Ran 11 tests  OK   (sur c2835ed)
test_audit_regressions (8)  →  FAILED (failures=5, errors=3)   (sur c2835ed)
test_audit_regressions + 137 existants  →  Ran 145 tests  OK  (copie corrigée, diff A)
```

---

## 3. Matrice des capacités

Légende :
- **Doc** : règle écrite ;
- **Code** : implémenté ;
- **Raccordé** : appelé par une voie réelle ;
- **Testé** : éprouvé, en fixture sauf mention ;
- **Installé** : actif hors fixture.

| Capacité (R) | Doc | Code | Raccordé | Testé | Installé | Manque principal |
|---|---|---|---|---|---|---|
| Arrêt persistant global (extension 05/10, R17) | oui | oui, avec C2, C3, C5, C7, C8 | non | oui, fixture ; mes régressions | **non** | Hôte installé (E2) ; arrêt par Paul (C7) ; voie web (W1) |
| Anti-auto-contrôle (détection et arrêt) | oui | oui (`control_violation`), avec C1 | Broker et TrialHost seulement | oui | non | Voies séance et web non interceptées (E1, E2) |
| Accord exact (R14, R15, R21) | oui | `Policy` (contexte, version, preuves) | non | oui, accord simulé | non | Canal d'accord humain (A1) ; identités distinctes (E1) |
| Reprise sans doublon (R17, R25) | oui | oui (`operation_id`, journal, `reconcile`) | registre web (RPC) et fixture | oui | **registre web en production** (mission administrative) | Reprise en « session Work neuve » ; ancre (C4) |
| Budget (R27) | oui | `BudgetLedger` par mission, unités fictives | fixture | oui | non | Plafond global multi-missions ; coût Anthropic et Work réel |
| Délégation à un spécialiste (R24) | oui | `DispatchBroker` (quadrants, grants) | transport fictif seul | oui | non | Arrêt global (C12) ; spécialistes Work non contrôlés |
| Injection (R10) | oui | protocole fermé, JSON strict, échos étiquetés | web : partiel (W8) | partiel | partiel | Canaux réels (PR, notes, sorties d'outils) non éprouvés ; W10 |
| Isolation des processus (R23) | oui | superviseur POSIX | non | 10 épreuves ; mes C9 et C10 | non | cgroup ou conteneur (C9, C10) |
| Écriture verte en production (anneau B1) | oui | oui | **oui** | prouvé le 04/10 (`proposer_idee`) | **oui** | Interrupteur d'arrêt (W1) ; restriction propriétaire (W2) |
| Geste orange (R13 positif) | oui | un seul outil orange (`proposer_enrichissement_idee`) | front seulement | non | non | Nonce (W4) ; **aucun outil financier, donc R13 n'a pas de chemin produit** |
| R13, conseil chiffré sourcé | oui | non | non | fixture documentaire (`RECETTE-R13.md`) | non | Acquisition et validation de sources ; voie orange |
| R21, cycle complet | oui | fixture (`trial*`, `control_r21`) | non | en fixture, sauf accord réel et session neuve | non | A1, E1, E2, C4, et `checkpoint.py` absent |
| Fraîcheur des dépôts, index FINUBAR (R01, R02) | oui | `collecter.mjs`, dérive mesurée au démarrage | hook de séance, macro web | partiel | collecte manuelle, cron mail | Collecte autonome non autorisée ; surveillance de la surveillance absente |
| Mémoire fiable, leçons (R20) | oui | registre et `lecons-*` | oui | partiel | oui | Lien incident → preuve ; ne doit pas élargir de droits (non technique) |
| Cadrage, pré-mortem, horizon, avant/après, code mort (R05-R07, R19) | oui | **non** | — | texte fictif | — | Règles seules : aucun outil, aucune trace vérifiable |
| Liens pro/perso et provenance (R03, R04) | oui | ACL par mission et quadrant | partiel | non | — | Magasin de relations avec statut (établi, hypothèse, piste) et provenance |

**Trou de parcours utilisateur.** Aujourd'hui, Paul ne dispose d'**aucun bouton d'arrêt** qui coupe à la fois l'écriture web de Léo, ses délégations et ses sessions. Il ne dispose pas non plus d'un écran qui lui dise *si* Léo est arrêtée. `agent_stopped` n'existe que dans la réponse du raccord de fixture.

---

## 4. Scénarios

### 4.1 Scénario hostile prioritaire : « Léo tente de changer son contrôle »

| Voie empruntée | Qu'est-ce qui arrête Léo ? | Depuis quelle autorité ? | Résultat |
|---|---|---|---|
| a. Proposition `change_control`, `disable_control`, `self_approve` ou `resume_control` au **Broker** | `LeoControl.before_effect`, puis `ControlLatch.trip` et `BudgetLedger.stop`, puis `Refusal`. Toute admission suivante est refusée avec `leo_agent_stopped`, sans méthode de réarmement. | Le code hôte. Le modèle n'a que le champ `action`. | **Résiste** (tests existants et mon exécution). **Cède** si le verrou est occupé (C2), si le verrou est absent (C6), en passant par une délégation (C12), ou par suppression suivie d'une réinitialisation, par rollback ou par permissions larges (C3, C4, C5). |
| b. Écriture vers la cible de contrôle par un alias (`…/leo-control-r21.git`, chemin relatif) | Rien, en c2835ed. | — | **Cède** (C1). Corrigé par le diff A. |
| c. Léo-**séance** (Claude Code ou Work) avec le connecteur GitHub sous `paggerard-boop` | **Aucun code.** Seulement l'absence du dépôt de contrôle dans la portée du connecteur (révocation du 05/10, ACT:99-121 ; exclusion globale non attestée). | GitHub, sous l'identité de Paul. | **Non contrôlé par FINUBAR.** Aucune détection, donc aucun arrêt. Cela dépend entièrement de E1. |
| d. Léo-**produit** (web) | Le catalogue fermé ne contient aucun outil sur un dépôt ou sur la configuration. Le modèle ne peut que proposer. | Le serveur (`validerProposition`). | **Résiste**, par absence de capacité et non par contrôle. Aucun arrêt n'est déclenché. |
| e. Processus enfant hostile lancé par le superviseur | `killpg` (TERM puis KILL). | Le superviseur hôte. | **Cède** par `setsid` ou par la mort du superviseur (C9, C10). |

**Ce qui reste récupérable après interruption :**
- les opérations engagées passent en `pending` ou `unknown` et gardent leur réservation ;
- `reconcile_fixture` lit l'effet réel par `adapter.lookup` et solde sans rejouer ;
- le journal de transport garde le résultat, et un rejeu renvoie le même reçu ;
- ce qui **ne se récupère pas** : un effet déjà admis, car l'arrêt n'annule rien ; et, sur la voie web, les créations faites sans `request_id` (doublon possible si on rejoue à la main).

### 4.2 Parcours nominal d'une mission autorisée (fixture, état c2835ed)

1. **L'hôte** prépare la mission : `create_mission(authority=True)` et `budget.create`. Il fixe le mandat, le contexte et les preuves, et **l'Approval, statique**.
2. **Paul** (son sujet GoTrue) : **aucun geste requis**. C'est le défaut A1 : l'accord est déjà dans la binding.
3. **Léo** envoie le corps six champs (`execute`, `expected_version=2`).
4. Le chemin de la requête est alors le suivant :
   - `AdmissionHost` : authentification, binding, décodage strict, statut ACL, réservation dans le journal ;
   - `TrialHost` : canonique, `control_violation` ;
   - `trial_resume.execute` : `Policy` ;
   - `Broker.execute` : verrou d'admission, réservation budget, CAS de la mission sous transaction, `FixtureGit.merge` (`update-ref` atomique, vérification source et cible) ;
   - reçu `completed`, puis `settle`, puis passage de la mission à `merged`.
5. **Restitution** : réponse HTTP avec `agent_stopped`.

Ce qu'il manque pour que ce parcours soit reçu :
- un accord humain frais (A1) ;
- des identités distinctes (E1) ;
- une ancre (C4) ;
- une reprise en session Work neuve ;
- un **écran Paul**, qui n'existe pas.

---

## 5. Correctifs

### 5.A Sécurité bloquante : exécuté et validé (`correctifs-securite-controle.diff`, 333 lignes)

Ce diff touche `finubar/leo_control.py`, `leo/trial_host.py` et `leo/control_r21/admission.py`, et ajoute `tests/runtime/test_audit_regressions.py`.

| Correctif | Ce qu'il fait | Ferme |
|---|---|---|
| Canonicalisation des cibles | URL, `.git`, `/` final, casse ; `.` et `..` rejetés ; cible relative existante jugée sur son chemin réel | C1 |
| `_trip` | Tente les deux registres ; `finubar_stop_unconfirmed` si l'un échoue ; délai de `trip` à 330 s | C2 |
| Marqueur `.installed` | Aucune réinitialisation possible après installation | C3 |
| `_assert_private()` | Vérifie UID et modes du fichier et du dossier | C5 |
| Arrêt par Paul | `owner_stop` : mission plus verrou global ; Paul ne peut toujours pas exécuter | C7 |
| Stop prioritaire | Le stop passe même journal plein | C8 |

Validation :
- copie corrigée : 145 tests sur 145 ;
- sur c2835ed : les 8 régressions sont rouges ;
- les attaques C1, C3, C5, C7 et C8 ne passent plus ; C2 est couvert par sa régression.

**Aucun test existant n'a été modifié ni désactivé.**

⚠️ **Conséquence d'installation.** `_assert_private` exige que l'hôte détienne le verrou en `0600`, dans un dossier qu'il possède et que seul lui peut modifier. La CI actuelle remplit cette condition : tmpfs, uid 65534. Un hôte mal monté échouera **fermé**, et c'est voulu.

### 5.B Sécurité bloquante : proposé, non exécuté

```diff
--- a/leo/runtime/broker.py
+++ b/leo/runtime/broker.py
@@ def execute(self, principal, proposal):
         self.control.before_effect(proposal['action'], self.repository)
-        if proposal['action'] == 'status' or self.control.latch is None:
+        if proposal['action'] == 'status':
             return self._execute(principal, proposal)
+        if self.control.latch is None:
+            raise Refusal('global_control_latch_required')   # C6 : pas d'effet sans arrêt global
         with self.control.latch.admission():
             return self._execute(principal, proposal)
--- a/leo/runtime/dispatch.py
+++ b/leo/runtime/dispatch.py
@@ class DispatchBroker:
-    def __init__(self, db_path, mandate, source, *, tasks, records, grants,
-                 transport, clock=time.time):
+    def __init__(self, db_path, mandate, source, *, tasks, records, grants,
+                 transport, clock=time.time, control_latch=None):
+        from finubar.leo_control import ControlLatch
+        if type(control_latch) is not ControlLatch:
+            raise TypeError('global_control_latch_required')          # C12
+        self.latch = control_latch
@@ def dispatch(self, principal, proposal):
-        with self.store._transaction() as db:
+        with self.latch.admission(), self.store._transaction() as db:
```

Ces deux correctifs imposent d'adapter `trial.prepare` et les montages de `test_dispatch`, `test_broker` et `test_trial*` pour qu'ils passent un verrou. Le travail reste mécanique, mais il n'a **pas été exécuté**.

Pour W2 (route facturée réservée au propriétaire), proposé et non exécuté :

```diff
--- a/api/leo.js
-import { requireUser } from './_lib/supabase.js';
+import { requireProprietaire } from './_lib/proprietaire.js';
@@
-  const auth = await requireUser(req);
+  const auth = await requireProprietaire(req);   // W2 : route facturée, propriétaire seul
```

Faire de même dans `api/leo/ecritures.js` et `api/leo-registre.js`, en reprenant les statuts `reserve_non_regle` (503) et `interdit` (403) que traite déjà `api/finubar.js`.

Pour W1 (interrupteur serveur fermé par défaut), en tête d'`ouvrirEcriture` et avant l'anneau servi dans `api/leo.js` :

```js
if (process.env.LEO_ECRITURES !== 'actif') return refus(403, 'Validation de Paul requise');
```

La cible est un drapeau en base, réservé au propriétaire et lu en échec fermé, pour qu'un « stop » ne demande pas de redéploiement.

Pour C11 et W7, en SQL dans `leo_private.write_memory_impl` :

```sql
if p_patch->>'state' in ('approved_for_merge','merged') and v_m.owner <> v_uid then
  raise exception using errcode='42501', message='owner_required';
end if;
```

Il faut le miroir Python dans `_patch`, sous la forme d'un paramètre `host=True` réservé à `trial_resume`.

### 5.C Autonomie manquante

Ces changements de code sont à concevoir. Aucun diff n'est fourni.

| Correctif | Contenu |
|---|---|
| A1, canal d'accord | Table `leo_accords` : sujet de Paul, condensé du contexte, `expires_at`, `consumed_at`. Écrite par une RPC propriétaire seul ; consommée sous le verrou d'admission. |
| Écran « État de Léo » | Arrêt global, missions arrêtées, opérations `unknown`. Le bouton d'arrêt appelle `owner_stop`, plus le drapeau W1. |
| Surveillance de la surveillance | FINUBAR relève l'âge du dernier battement de l'hôte et des collectes. Un âge dépassé produit une alerte, jamais un réarmement. |

### 5.D Améliorations utiles

- Préfixe non autoritatif pour le rappel (W10).
- Aligner `SKILL_VERSION` sur la compétence Work, ou geler la compétence en 1.0 (D1).
- Une phrase de révocation nommée des permissions historiques (D2).
- Consolider `REPRISE` en une seule reprise courante (D3).
- Donner un identifiant R versionné à l'extension FINUBAR (D4).
- `updated_at` sur `journal` et `scenarios` (W5).

---

## 6. Plan par dépendances

| # | Étape | Type | Responsable | Dépend de | Critère de preuve |
|---|---|---|---|---|---|
| 1 | Appliquer le diff 5.A sur PR353 | Code | Léo, sur branche | — | Job `runtime` **vert en CI sur le nouveau SHA**. Les 8 régressions sont rouges si on remet `leo_control.py` de c2835ed (témoin négatif). |
| 2 | Diff 5.B (C6, C12, C11) avec adaptation des montages | Code | Léo, sur branche | 1 | CI verte ; aucun test supprimé ; un `Broker` ou un `DispatchBroker` sans verrou est refusé. |
| 3 | W1 et W2 (interrupteur, `requireProprietaire`) | Code | Léo, sur branche | — | Tests unitaires 403/503 ; preview : un compte tiers reçoit 403. |
| 4 | Fermer l'inscription Supabase ; poser `ULTIMA_PROPRIETAIRES` | **Extérieur** | **Paul** | — | Une tentative d'inscription est refusée (mesurée) ; `/api/finubar` répond 200 pour Paul. |
| 5 | Identité GitHub distincte pour Léo ; contrôle sous un autre propriétaire | **Extérieur** | **Paul** | — | Avec l'identité de Léo : écriture sur le contrôle → 403 ; APPROVE impossible sur `main`. |
| 6 | Hôte FINUBAR : conteneur ou cgroup, UID distinct propriétaire du verrou, commande fixe | **Extérieur**, puis code | Paul (machine), Léo (code) | 1, 2, 5 | C9 et C10 rejoués et **rouges** : petit-enfant et enfant orphelin tués. |
| 7 | Ancre monotone : checkpoint signé et chaîné, ancre posée par Paul | Code, puis geste de Paul | Léo, Paul | 6 | C4 rejoué : un rollback est refusé avec `anchor_regression`. |
| 8 | Canal d'accord A1 et écran « État de Léo » | Code | Léo | 3, 5 | Accord rejoué ou d'un autre SHA refusé ; Paul arrête depuis l'écran, et la page reflète l'arrêt. |
| 9 | **Pilote borné sur fixture** | Épreuve | Léo, observé par Paul | 1 à 3 ; 6 à 8 pour la version réelle | Voir ci-dessous. |
| 10 | Autorisation d'activation | **Accord** | **Paul** | 9 | Accord exact sur SHA, cible et preuve d'intégration (gate de fusion). |

**Critères de sortie du pilote (étape 9).** Ce sont des critères futurs, **pas une preuve actuelle** :
- deux cycles R21 tracés de bout en bout : réservation, admission, effet fixture, reçu, solde ;
- une panne fictive (adaptateur qui lève) visible en `unknown`, puis réconciliée sans second effet ;
- `owner_stop` donné par Paul, durable après redémarrage de l'hôte, et refus de toute admission suivante ;
- une reprise depuis un processus neuf, sans doublon ;
- un budget et un périmètre égaux au mandat ;
- zéro dépense, zéro envoi, zéro publication (vérifié par absence de réseau et par le journal).

**Accès et accords réellement manquants :**
- de Paul : fermeture de l'inscription, identité GitHub distincte, une machine ou un conteneur hôte, une clé d'ancre, et les accords de fusion ;
- aucun nouvel abonnement n'est nécessaire : l'existant suffit (GitHub, Supabase, Vercel, conteneur CI).

### Les trois prochaines actions les plus utiles

1. **Appliquer le diff 5.A sur PR353** et attendre le job `runtime` vert sur le nouveau SHA. Ce sont des correctifs préparatoires, déjà prouvés en isolation.
2. **Paul : fermer l'inscription Supabase.** C'est la fermeture la plus rapide d'un risque **réel et actif**, le coût Anthropic ouvert à des tiers (W2). Ensuite, séparer l'identité GitHub de Léo (E1).
3. **Interrupteur serveur W1 pour l'anneau vert.** C'est le seul moyen d'arrêter Léo-produit en production sans redéployer.

---

### Annexes

Les régressions vivent dans `tests/runtime/test_audit_regressions.py` (job
`runtime` de la CI). Les reproductions d'attaque et le script d'isolation ont
été remis à Paul hors dépôt.
