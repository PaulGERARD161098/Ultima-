# SPEC AD-4c (front) — la carto des idées côté client après auth

> Boucle ADRAMELECH, dernier maillon (« fin du noir en prod »). Cadrage parent :
> `adramelech/CADRAGE-ADRAMELECH.md` (AD-4). Directive JL : Ultima interface
> unique — le quadrant s'ouvre DANS le site, plus d'artifact privé.

## Objectif

Le quadrant ADRAMELECH de la console devient consultable en prod : une page
authentifiée qui va chercher les idées **en base** via `GET /api/idees`
(AD-4b, `requireUser` + RLS) et rend la carto — archipels par thème, ponts —
dans le registre antique existant. Les 4 idées + 4 ponts sont déjà en base
(seed 2026-07-18).

## Décisions d'architecture (actées par Léo, consignées)

1. **Page autonome `idees.html` à la racine**, servie sur **`/idees`**
   (cleanUrls), motif `traveler.html`. **INTERDIT de toucher `middleware.js`** :
   `/adramelech/*` reste privé (garde AD-0 intact) — c'est précisément pourquoi
   la page ne s'appelle PAS adramelech.html (elle serait servie sur
   `/adramelech`, bloquée par le garde).
2. **Rendu 100 % client** : `js/idees.js` (module), fetch `/api/idees` avec le
   jeton de la session Supabase existante (même mécanique que `traveler.html` :
   vendor local, `js/config.js`, session localStorage). Pas de duplication du
   générateur Node (`adramelech/generer-carto.mjs` reste l'outil de session) :
   le rendu client est data-driven depuis la réponse API.
3. **Console** : dans `index.html`, la div `quadrant-avenir` d'ADRAMELECH
   devient un lien actif `href="idees.html"` sur le motif exact du quadrant
   TRAVELER (émblème ouroboros conservé tel quel). AUCUNE autre retouche de
   `index.html` (session parallèle en cours sur la console/L1).

## Contrat de données (réponse `GET /api/idees`)

`{ ok:true, data:{ idees:[...], liens:[...] } }`
- idee : `id` (uuid), `adr_num` (int ≥1), `nom` (≤120), `type` (≤60),
  `theme` (nullable, « a · b · c » — **1er token = thème principal**, axe de
  regroupement), `statut` (`brute` | `à raffiner` | `exploitable` | `close`),
  `partenaire` (nullable), + champs texte libres éventuels.
- lien : `source_id`, `target_id` (paire non orientée).
- 401 → proposer la connexion (overlay/lien existant) ; 503/500 → message
  générique. **Jamais** de contenu d'idée en console/logs (PII).

## Rendu attendu

- **Archipels groupés par thème principal** (thème null → « À classer »),
  une île par idée : nom, ADR-num, type, badge de statut ; **ponts** tracés
  entre îles liées (liens API). Registre antique : reprendre les tokens et
  motifs visuels de `adramelech/carto-idees.html` (encre, parchemin,
  cartouches) — SANS réseau externe, CSP intacte, thèmes clair/sombre.
- **Déterminisme** : même données → même rendu (tri par `adr_num`, layout
  calculé, pas d'aléa).
- **États** : non connecté (invite à se connecter), vide (0 idée — état vide
  gravé), erreur (générique). Accessibilité AA, tap targets ≥44px,
  `prefers-reduced-motion` respecté si animation.
- **Échappement systématique** de tout contenu (textContent / création DOM,
  jamais d'innerHTML avec des données).

## Vérification (patrimoine, obligatoire)

- Harnais `tests/` : unit du regroupement/layout (fonction pure exportée) +
  smoke navigateur avec **API stubbée** (fixtures locales, motif des harnais
  existants) : rendu des 4 idées seed, ponts, badge statut, état vide, état
  401, zéro erreur console, contraste mesuré.
- Enregistrer dans `bash tests/lancer.sh` et faire tourner TOUTE la suite.
- Le flux authentifié réel reste à prouver par Paul en prod (compte existant) —
  consigné, pas bloquant.

## Interdits (télescopage + gates)

- `middleware.js`, `api/**`, `supabase/**`, `memoire/**` : NE PAS TOUCHER.
- `adramelech/*` : lecture seule (le générateur et le registre restent).
- `js/leo-accueil.js`, `traveler.html` : NE PAS TOUCHER (session parallèle L1).
- `index.html` : uniquement le bloc quadrant ADRAMELECH.
- Zéro dépendance nouvelle, zéro CDN, zéro secret.
