// LE COMPTEUR D'APPELS DE LÉO AU MODÈLE — plafond et mesure (19/10/2026).
//
// Pourquoi : Paul, 19/10 — « ça ne doit pas tout exploser en termes de prix ».
// `api/leo.js` appelait le modèle sans compteur : « un appel par 3 s » en mémoire
// d'instance, soit un pire cas théorique de plusieurs milliers de dollars par jour,
// et un plafond dur — la limite de dépense de la console Anthropic — que le code
// ne voit pas. Ce module pose (1) un PLAFOND partagé entre instances, atomique
// côté base, (2) une MESURE : combien d'appels, quels tokens, par jour.
//
// Même dispositif que `leo-execution.js` : le client Supabase est INJECTÉ (donc
// éprouvable sans base), la décision d'un plafond local réutilise la fonction
// pure `creerPlafondEcritures`, la migration `20261019160000_leo_appels.sql` est
// un gate de Paul.
//
// ⛔ ZÉRO CONTENU : ni message, ni réponse, ni intitulé n'entre ici — le
// quadrant, le nom du modèle, deux compteurs de tokens. Et un échec n'écrit
// jamais le message du fournisseur : le code de l'erreur seulement.
//
// ⛔ DEUX VALEURS DOUBLÉES avec la migration (une fonction SQL ne s'importe pas) :
// `PLAFOND_APPELS` / `PLAFOND_LIGNES` / `FENETRE_APPELS_MS` et `PHASES_APPEL`.
// `tests/unit-leo-appels.mjs` lit la migration et exige qu'elles coïncident.
import { creerPlafondEcritures, ouvrirTrace } from './leo-journal.js';
import { logError } from './http.js';

export const PHASES_APPEL = ['tentee', 'reussie', 'echouee'];
export const PLAFOND_APPELS = 100;
export const PLAFOND_LIGNES = 400;
export const FENETRE_APPELS_MS = 24 * 60 * 60 * 1000;
export const MAX_QUADRANT = 40;
export const MAX_MODELE = 80;
export const MAX_TOKENS_COMPTES = 10_000_000;

// Les délais bornent l'attente de la base : un journal lent ne doit pas tenir la
// voix de Léo en otage, ni faire dépasser le délai de la plateforme.
export const DELAI_OUVERTURE_MS = 3000;
export const DELAI_CLOTURE_MS = 2000;

/** Le cause-mot fermé que le front sait dire (cf. `MOTIF_CAUSE_IA`). */
export const CAUSE_PLAFOND = 'ia plafond';

// ── Repli local ─────────────────────────────────────────────────────────────
// ⚠️ MODE DÉGRADÉ, DIT EN LOG ET DANS LA RÉPONSE (`journal: 'local'`) : si le
// journal est injoignable (migration pas encore appliquée, panne, délai), Léo ne
// s'arrête pas — il retombe sur un plafond tenu en MÉMOIRE D'INSTANCE.
// ⛔ Ce n'est PAS le plafond de la base : chaque instance serverless a le sien et
// l'oublie à son recyclage, donc le total réel peut dépasser `PLAFOND_APPELS`
// (jusqu'à PLAFOND_LOCAL × nombre d'instances). D'où une valeur locale PLUS BASSE
// que celle de la base — le repli penche vers le refus, pas vers le laisser-passer.
// Le vrai plafond dur reste la limite de dépense de la console Anthropic.
export const PLAFOND_LOCAL = 25;
const plafondLocal = creerPlafondEcritures(PLAFOND_LOCAL, FENETRE_APPELS_MS);
export const ETAT_LOCAL = { horodatages: [] };

// Un état par propriétaire : un compte ne consomme pas le repli d'un autre.
// Table bornée — au-delà, on repart de zéro plutôt que de grossir sans fin.
const ETATS_LOCAUX = new Map();
const MAX_ETATS_LOCAUX = 50;

/** Taille de la table des états locaux — pour les harnais, jamais pour le métier. */
export const nombreEtatsLocaux = () => ETATS_LOCAUX.size;

function etatLocalDe(proprietaire) {
  if (typeof proprietaire !== 'string' || !proprietaire) return ETAT_LOCAL;
  if (!ETATS_LOCAUX.has(proprietaire)) {
    if (ETATS_LOCAUX.size >= MAX_ETATS_LOCAUX) ETATS_LOCAUX.clear();
    ETATS_LOCAUX.set(proprietaire, { horodatages: [] });
  }
  return ETATS_LOCAUX.get(proprietaire);
}

function elaguer(etat, maintenant) {
  const depuis = maintenant - FENETRE_APPELS_MS;
  etat.horodatages = etat.horodatages.filter((t) => t >= depuis).slice(-(PLAFOND_LOCAL + 1));
}

/** Rejette après `ms` : la valeur `{ delai: true }` plutôt qu'une exception. */
function avecDelai(promesse, ms) {
  let minuteur;
  const delai = new Promise((resoudre) => {
    minuteur = setTimeout(() => resoudre({ delai: true }), ms);
  });
  return Promise.race([promesse, delai]).finally(() => clearTimeout(minuteur));
}

/** Tokens lus sur `reponse.usage` : des entiers bornés, ou null. Jamais de NaN en base. */
export function jetonsDe(usage) {
  const borne = (n) => (Number.isInteger(n) && n >= 0 ? Math.min(n, MAX_TOKENS_COMPTES) : null);
  if (!usage || typeof usage !== 'object') return { entree: null, sortie: null };
  const parts = [usage.input_tokens, usage.cache_creation_input_tokens, usage.cache_read_input_tokens]
    .filter((n) => n !== undefined && n !== null);
  const entree = parts.length && parts.every((n) => Number.isInteger(n) && n >= 0)
    ? borne(parts.reduce((s, n) => s + n, 0)) : null;
  return { entree, sortie: borne(usage.output_tokens) };
}

function modeleSur(modele) {
  const m = typeof modele === 'string' ? modele.trim().slice(0, MAX_MODELE) : '';
  return m || 'inconnu';
}

function codeSeul(erreur) {
  const c = erreur && typeof erreur === 'object' ? erreur.code : undefined;
  return typeof c === 'string' && /^[A-Za-z0-9_]{1,16}$/.test(c) ? c : 'erreur';
}

function refusPlafond() {
  return { ok: false, status: 429, message: 'Plafond d’appels de Léo atteint (24 h)', cause: CAUSE_PLAFOND };
}

/**
 * Ouvre un appel : pose la ligne 'tentee' AVANT le coût.
 * → { ok: true, traceId, mode: 'base' | 'local' } | { ok: false, status: 429, message, cause }
 *
 * ⛔ Seul le refus du plafond (PT429) arrête Léo. Toute autre panne du journal
 * dégrade vers le plafond LOCAL, plus bas que celui de la base (dit en log par
 * code seul, et `mode: 'local'` remonte à la route) : le journal est un
 * garde-fou de coût, pas une condition de service.
 */
export async function ouvrirAppel(client, {
  quadrant, modele, proprietaire, maintenant = Date.now(), local, delaiMs = DELAI_OUVERTURE_MS
} = {}) {
  const q = typeof quadrant === 'string' ? quadrant.slice(0, MAX_QUADRANT) : '';
  const m = modeleSur(modele);
  const etat = local || etatLocalDe(proprietaire);

  const degrader = (raison) => {
    logError('leo.appels.degrade', raison);
    elaguer(etat, maintenant);
    if (!plafondLocal(etat.horodatages, maintenant).ok) return refusPlafond();
    etat.horodatages.push(maintenant);
    return { ok: true, traceId: null, mode: 'local' };
  };

  const trace = ouvrirTrace();
  if (!trace.ok || !q) return degrader('trace');

  let insertion;
  try {
    insertion = await avecDelai(
      Promise.resolve(client.from('leo_appels')
        .insert({ trace_id: trace.traceId, quadrant: q, modele: m, phase: 'tentee' })),
      delaiMs
    );
  } catch (erreur) {
    return degrader(codeSeul(erreur));
  }
  if (insertion && insertion.delai) return degrader('delai');
  if (insertion && insertion.error) {
    // Le refus du plafond arrive en PT429 ; un 429 HTTP d'où qu'il vienne se lit
    // de la même façon — pour un garde-fou de coût, le doute penche vers le refus.
    if (insertion.error.code === 'PT429' || insertion.status === 429) {
      logError('leo.appels.plafond', 'PT429');
      return refusPlafond();
    }
    return degrader(codeSeul(insertion.error));
  }
  return { ok: true, traceId: trace.traceId, mode: 'base' };
}

/**
 * Clôt un appel : pose l'issue ('reussie' | 'echouee') avec les tokens.
 * ⛔ BEST-EFFORT : l'appel est déjà compté (la 'tentee'), la réponse est déjà
 * payée — un échec ici ne change rien pour l'utilisateur et ne remonte jamais.
 * Sans trace (mode local), rien à clore.
 */
export async function cloreAppel(client, traceId, {
  phase, usage, quadrant, modele, delaiMs = DELAI_CLOTURE_MS
} = {}) {
  if (!traceId || !['reussie', 'echouee'].includes(phase)) return { ok: false };
  const q = typeof quadrant === 'string' ? quadrant.slice(0, MAX_QUADRANT) : '';
  if (!q) return { ok: false };
  const { entree, sortie } = jetonsDe(usage);
  try {
    const r = await avecDelai(
      Promise.resolve(client.from('leo_appels').insert({
        trace_id: traceId, quadrant: q, modele: modeleSur(modele), phase,
        tokens_entree: entree, tokens_sortie: sortie
      })),
      delaiMs
    );
    if (r && (r.delai || r.error)) {
      logError('leo.appels.cloture', r.delai ? 'delai' : codeSeul(r.error));
      return { ok: false };
    }
    return { ok: true };
  } catch (erreur) {
    logError('leo.appels.cloture', codeSeul(erreur));
    return { ok: false };
  }
}
