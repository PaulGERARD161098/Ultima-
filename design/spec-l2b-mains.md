# SPEC L2b — les mains de Léo (agir sur dictée)

> Boucle L2b du cadrage `CADRAGE-LEO-SITE.md` (§2.3bis, §4). Rédigée par Léo
> le 2026-07-20, consommée par l'agent implémenteur. Patch minimal, style
> existant, motif L2 reproduit (brique pure `api/_lib` + route mince +
> unitaires Node purs + smoke à API stubée).

## 0. Principe de sécurité fondateur (non négociable)

**L'IA ne fait que PROPOSER. Elle n'exécute JAMAIS.**

- Le tool use de l'appel Claude sert uniquement à produire une **proposition
  structurée** (outil + arguments validés). La route `/api/leo` n'écrit
  jamais rien en base.
- L'exécution a lieu **côté client, après confirmation explicite de Paul**,
  par un appel aux **API d'écriture existantes** (`/api/idees/items`,
  `/api/intendant/besoins`, `/api/reseau/journal`) avec **sa session**
  (Bearer → RLS mono-owner). Zéro nouvelle surface d'écriture serveur,
  zéro clé service.
- **Aucun outil de suppression** en L2b (la « double confirmation » du
  cadrage est différée : catalogue d'écritures pures, DELETE exclu).
- La **carte de confirmation est un rendu DÉTERMINISTE des arguments**
  (gabarit par outil, `textContent` uniquement) — jamais la prose du modèle.
  C'est la mitigation centrale de S-L2-2 (injection via l'historique) : ce
  que Paul confirme est exactement ce qui sera exécuté.

## 1. Catalogue d'outils (par quadrant — cohérence du cadrage §1)

Défini dans `api/_lib/leo.js` (pur, exporté, testable) :

| Outil | Quadrants | API d'exécution (front) | Arguments |
|---|---|---|---|
| `proposer_idee` | `adramelech` | `POST /api/idees/items` | `titre` (req, ≤160), `resume` (≤2000), `theme` (≤80) |
| `proposer_enrichissement_idee` | `adramelech` | `PATCH /api/idees/items` | `idee_ref` (req, ≤160 — titre ou ADR-n dicté), `ajout` (req, ≤2000) |
| `proposer_besoin` | `traveler` | `POST /api/intendant/besoins` | `chantier_ref` (req, ≤160 — nom dicté), `libelle` (req, ≤300), `quantite` (≤80), `echeance` (AAAA-MM-JJ) |
| `proposer_journal` | `traveler` | `POST /api/reseau/journal` | `cible_ref` (req, ≤160 — nom du contact dicté), `texte` (req, ≤2000) |
| `proposer_relance` | `traveler` | `POST /api/reseau/journal` (avec relance) | `cible_ref` (req, ≤160), `echeance` (req, AAAA-MM-JJ), `note` (≤500) |

- `bcp`/`imladrik` : **catalogue vide** (pas d'API de données) → l'appel
  Claude part **sans le paramètre `tools`**, comportement L2 inchangé.
- Les `*_ref` sont du **texte dicté** : la résolution vers un id se fait
  **côté front, déterministe**, sur les données déjà chargées du quadrant
  (voir §4). Le modèle ne voit jamais d'id ni de dump de données (règle de
  minimisation §3 du cadrage, inchangée).

## 2. Brique pure — `api/_lib/leo.js` (ajouts, rien de retiré)

1. `OUTILS_PAR_QUADRANT` : la table ci-dessus au format tool-use Anthropic
   (`name`, `description` en français orientée dictée vocale,
   `input_schema` strict : `type: 'object'`, `properties` bornées,
   `required`, `additionalProperties: false`).
2. `outilsPour(quadrant)` → tableau d'outils ou `null` si catalogue vide.
3. `validerProposition(nomOutil, args, quadrant)` → `{ ok:true, proposition }`
   ou `{ ok:false }`. Contrôles : outil connu ET autorisé pour ce quadrant,
   arguments tous `string` (`echeance` au motif `^\d{4}-\d{2}-\d{2}$` et
   date réelle), bornes de longueur, champs requis non vides après `trim`,
   champs surnuméraires REJETÉS (pas strippés : un outil qui invente un
   champ est suspect). Aucun contenu reproduit dans l'erreur.
4. `reformulerProposition(proposition)` → phrase française déterministe par
   gabarit, ex. « Créer l'idée « {titre} » (thème : {theme}) dans
   l'archipel. » — c'est CE texte que la carte de confirmation affiche.
5. `extraireTexte` existant : inchangé. Ajouter `extraireProposition(content)`
   → premier bloc `tool_use` ou `null`.
6. Le prompt système (`construireSysteme`) : remplacer la règle « Tu ne peux
   pas encore AGIR » par (uniquement pour les quadrants à catalogue non
   vide — signature `construireSysteme(quadrant, avecOutils)`) :
   - « Quand Paul te dicte une action couverte par un de tes outils,
     appelle l'outil avec des arguments FIDÈLES à la dictée — sans rien
     inventer ni compléter. L'action ne s'exécutera qu'après confirmation
     de Paul : annonce-la simplement. »
   - « Un seul outil par tour. Si la dictée est ambiguë (cible, date,
     contenu), pose la question au lieu d'appeler l'outil. »
   - Pour les quadrants sans outils : règle L2 actuelle conservée telle
     quelle.

## 3. Route — `api/leo.js` (patch minimal)

- `messages.create({ ..., tools: outilsPour(quadrant) ?? undefined })`
  (spread conditionnel : pas de champ `tools` si catalogue vide).
- Après réponse : `extraireProposition(content)`.
  - Pas de `tool_use` → comportement L2 inchangé (`{ reponse }`).
  - `tool_use` → `validerProposition(...)`. Invalide → `logError('leo.mains.invalide', nomOutil)`
    et réponse `{ reponse }` avec le seul texte (si texte vide : 502 comme
    aujourd'hui — jamais d'exécution ni de proposition douteuse au client).
    Valide → `{ reponse: texteOuChaineVide, proposition: { outil, args,
    reformulation } }` (200). **On ne renvoie JAMAIS de tool_result au
    modèle dans cette requête** — la boucle se referme au tour suivant par
    le message utilisateur d'issue (§4).
- L'historique reste **texte seul** (`validerConversation` inchangée) :
  le contrat d'API ne bouge pas, les smokes L2 restent valides.

## 4. Front — `js/leo-accueil.js` (zone voix existante)

- La réponse porte `proposition` → afficher sous la bulle de Léo une
  **carte de confirmation** (registre antique : cartouche parchemin, filet
  d'encre) : `reformulation` (du serveur, déterministe) + boutons
  **« Confirmer »** / **« Annuler »** (≥44 px, accessibles clavier,
  `aria-live` sur l'issue). Tant qu'une carte est ouverte : saisie
  désactivée (un seul fil, pas d'actions empilées).
- **Résolution des `*_ref`** (déterministe, dans le module, fonction pure
  exportée `resoudreRef(ref, candidats)`) : normalisation accents/casse,
  égalité exacte sinon inclusion unique ; 0 ou >1 candidat → la carte
  affiche « cible introuvable/ambiguë » et **seul « Annuler » reste actif**
  (aucun choix hasardeux). Candidats : les données déjà chargées du
  quadrant (idées via `/api/idees` déjà servies au cartouche ADRAMELECH ;
  chantiers/nœuds via la config du quadrant RIVEN — le module reçoit
  `config.voix.candidats` fourni par `app.js`/`adramelech.js`, tableaux
  `{ id, libelle }` minimaux).
- **Confirmer** → appel `fetch` vers l'API d'exécution (Bearer session,
  corps construit du gabarit d'outil + id résolu) → succès : toast
  existant + message utilisateur ajouté à l'historique
  « [Action exécutée : {reformulation}] » ; échec : message
  « [Action échouée, à reprendre] » + la carte se ferme (l'erreur reste
  générique). **Annuler** → « [Action annulée par Paul] ». Dans les trois
  cas la conversation continue — le modèle apprend l'issue au tour suivant.
- Fail-safe : si `proposition` est malformée côté client → ignorée,
  seule la bulle texte s'affiche (jamais de carte douteuse).

## 5. Harnais (patrimoine — enrichir, jamais de jetable)

- `tests/unit-leo-mains.mjs` (nouveau, Node pur) : catalogue par quadrant
  (bcp/imladrik → null) ; `validerProposition` (outil inconnu, outil hors
  quadrant, champ manquant/vide/trop long, champ surnuméraire rejeté,
  échéance invalide `2026-13-40`, cas nominaux) ; `reformulerProposition`
  (gabarits, pas d'injection : le texte est du `textContent`) ;
  `extraireProposition` ; `resoudreRef` (exact, accents, inclusion unique,
  ambigu, absent).
- `tests/smoke-leo-accueil.mjs` section C (API stubée) : + cas
  `proposition` → carte affichée avec la reformulation SERVEUR, confirmer
  → POST vers l'API stubée avec le bon corps + message d'issue ; annuler →
  aucun POST + message d'annulation ; ref ambiguë → confirmation
  impossible ; proposition malformée → pas de carte.
- `tests/unit-leo-voix.mjs` : compléter pour la signature
  `construireSysteme(quadrant, avecOutils)` (les 24 verdicts existants
  restent verts).
- Suite complète : `bash tests/lancer.sh` — tout vert exigé.

## 6. Hors périmètre L2b (ne pas toucher)

Middleware, RLS, migrations (aucune), auth (`requireUser` inchangé),
API d'écriture existantes (aucune modification), suppression de données,
mémoire L3, BCP/IMLADRIK. `LEO_MODELE`/clé : inchangés (sans clé, 503 —
les mains attendent la voix).

## 7. Vérification de sortie de boucle

Contre-passe `securite-auditeur` OBLIGATOIRE (ré-audit S-L2-2 acté au
RADAR : l'injection via historique devient un vrai vecteur avec des
outils) : vérifier qu'aucun chemin n'exécute sans confirmation, que la
carte est déterministe, que les bornes tiennent, qu'aucune PII ne fuit en
logs. Puis fusion = go Paul.
