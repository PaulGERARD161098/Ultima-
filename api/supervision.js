// /api/supervision — le registre des propositions de supervision de Léo (31/10/2026).
//   GET                                  → les propositions du propriétaire (cockpit)
//   POST { action:'soumettre', args }    → la chaîne serveur, puis supervision_soumettre
//   POST { action:'arbitrer', id, decision, notes? } → supervision_arbitrer (Paul, cockpit)
//   POST { action:'retirer', id }        → supervision_retirer (en attente → OBSOLETE)
//
// Réservé au SEUL PROPRIÉTAIRE (même garde que /api/finubar et /api/zohshia) :
// l'inscription au projet d'auth est ouverte, « être connecté » ne suffit pas.
// Toute écriture passe par une fonction SQL sous le jeton de Paul (RLS) ;
// aucune clé de service. Cadrage : zohshia/supervision-valeur/TECHNO.md.
//
// ⛔ Léo n'a AUCUN outil qui mène à `arbitrer` ou `retirer` : son seul outil
// (proposer_supervision, orange) fabrique le corps `soumettre` côté front, et
// ce corps est figé (js/leo-accueil.js). La base ne distingue pas Paul de Léo :
// c'est cette séparation de code qui tient, et un test la garde.
//
// ⛔ `soumettre` est fermé tant que LEO_SUPERVISION ne vaut pas 'active'. La
// lecture et l'arbitrage, eux, restent ouverts : le cockpit précède l'outil.
//
// Erreurs : génériques pour le client ; les refus de contrôle rendent le CHEMIN
// et la RAISON (jamais une valeur reçue) — Léo doit savoir quoi compléter.
// Imports STATIQUES depuis `./_lib/` (traceur Vercel).
import zoh from './_lib/zohshia-technos.mjs';
import finubar from './_lib/finubar-macro.mjs';
import { OUTILS_PAR_QUADRANT } from './_lib/leo.js';
import { indexerCatalogues } from './_lib/supervision-preuves.mjs';
import { preparerSoumission, supervisionActive } from './_lib/supervision.mjs';
import { requireProprietaire } from './_lib/proprietaire.js';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';

const ALLOWED = ['GET', 'POST'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CLES = {
  soumettre: ['action', 'args'],
  arbitrer: ['action', 'id', 'decision', 'notes', 'reexamen_le'],
  retirer: ['action', 'id'],
};
const DECISIONS = ['ACCEPTEE', 'REFUSEE'];
const COLONNES = 'id, objet_id, recommandation, statut, preuves_ids, proposition, cree_le, tranche_le, decision_notes, prochain_reexamen_le';
const MAX_LIGNES = 100;
const JOUR = /^(\d{4})-(\d{2})-(\d{2})$/;

// 'AAAA-MM-JJ' réel (pas de 30 février) et postérieur à aujourd'hui (UTC) → ISO minuit UTC.
export function dateReexamen(v, maintenant = Date.now()) {
  const m = typeof v === 'string' ? JOUR.exec(v) : null;
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  if (t <= maintenant || t > maintenant + 5 * 366 * 86_400_000) return null;
  return d.toISOString();
}

export function indexActuel() {
  const outils = [...new Set(Object.values(OUTILS_PAR_QUADRANT).flat().map((o) => o.name))];
  return indexerCatalogues(zoh, finubar, outils);
}

// SQLSTATE de la base → statut HTTP et message fermé.
function echecBase(res, error, contexte) {
  const code = error?.code || '';
  logError(`supervision.${contexte}`, code || 'erreur');
  if (code === '42501') return fail(res, 401, 'Authentification requise');
  if (code === 'PT429') return fail(res, 429, 'Plafond de propositions atteint');
  if (code === '22023' || code === '22P05') return fail(res, 422, 'Dossier refusé par la base');
  // Registre absent (migration non appliquée) : table ou fonction inconnues, en SQL ou PostgREST.
  if (['42P01', '42883', 'PGRST202', 'PGRST205'].includes(code)) return fail(res, 503, 'Registre absent');
  if (code === 'P0002') return fail(res, 404, 'Proposition introuvable');
  if (code === 'P0001') return fail(res, 409, 'Proposition déjà tranchée');
  return fail(res, 503, 'Registre indisponible');
}

export default async function handler(req, res, options = {}) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);
  const env = options.env || process.env;

  const auth = await requireProprietaire(req, { makeClient: options.makeClient, env });
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  if (auth.status === 'reserve_non_regle') return fail(res, 503, 'Accès réservé non réglé');
  if (auth.status !== 'ok') return fail(res, 403, 'Accès réservé');
  const client = auth.client;

  if (req.method === 'GET') {
    const r = await client.from('supervision_decisions').select(COLONNES)
      .order('cree_le', { ascending: false }).limit(MAX_LIGNES);
    if (r.error || !Array.isArray(r.data)) return echecBase(res, r.error, 'lecture');
    // S2 (revue du 31/10) : la base n'impose que le FORMAT des preuves — une ligne peut y
    // entrer par la RPC directe, sas sautés. Le cockpit ne dit donc « ces preuves existent »
    // que si le serveur les retrouve AUJOURD'HUI au catalogue ; index indisponible → null
    // (rien n'est affirmé).
    let index = null;
    try { index = (options.index || indexActuel)(); } catch { index = null; }
    const propositions = r.data.map((l) => ({
      ...l,
      preuves_connues: index && Array.isArray(l.preuves_ids)
        ? l.preuves_ids.length > 0 && l.preuves_ids.every((id) => index.has(id)) && index.has(l.objet_id)
        : null,
    }));
    return ok(res, { propositions, soumission_active: supervisionActive(env) });
  }

  const corps = await readJsonBody(req);
  if (corps === null || corps === 'too_large') return bodyFail(res, corps);
  const action = typeof corps.action === 'string' && Object.hasOwn(CLES, corps.action) ? corps.action : null;
  if (!action || !Object.keys(corps).every((k) => CLES[action].includes(k))) return fail(res, 400, 'Demande invalide');

  if (action === 'soumettre') {
    if (!supervisionActive(env)) return fail(res, 403, 'Supervision non activée');
    let index;
    try { index = (options.index || indexActuel)(); }
    catch { logError('supervision.index', 'catalogues'); return fail(res, 503, 'Catalogues indisponibles'); }
    const prep = preparerSoumission(corps.args, { index, maintenant: options.maintenant ?? Date.now() });
    if (!prep.ok) {
      return fail(res, 422, 'Dossier incomplet', {
        etape: prep.etape, ...(prep.statut ? { examen: prep.statut } : {}),
        erreurs: prep.erreurs, reserves: prep.reserves,
      });
    }
    const r = await client.rpc('supervision_soumettre', prep.rpc);
    if (r.error || !r.data || typeof r.data !== 'object') return echecBase(res, r.error, 'soumettre');
    return ok(res, { resultat: r.data.resultat, id: r.data.id, statut: r.data.statut });
  }

  if (typeof corps.id !== 'string' || !UUID.test(corps.id)) return fail(res, 400, 'Demande invalide');

  if (action === 'arbitrer') {
    if (!DECISIONS.includes(corps.decision)) return fail(res, 400, 'Demande invalide');
    if (corps.notes !== undefined && corps.notes !== null &&
        (typeof corps.notes !== 'string' || corps.notes.length > 2000)) return fail(res, 400, 'Demande invalide');
    const notes = typeof corps.notes === 'string' && corps.notes.trim() ? corps.notes.trim() : null;
    // La date de réexamen borne la durée d'un REFUS (Paul, 31/10) : sans elle, il tient
    // indéfiniment. Future, réelle, à cinq ans au plus.
    let reexamen = null;
    if (corps.reexamen_le !== undefined && corps.reexamen_le !== null && corps.reexamen_le !== '') {
      reexamen = dateReexamen(corps.reexamen_le, options.maintenant ?? Date.now());
      if (!reexamen) return fail(res, 400, 'Demande invalide');
    }
    const r = await client.rpc('supervision_arbitrer', { p_id: corps.id, p_decision: corps.decision, p_notes: notes,
      p_prochain_reexamen: reexamen });
    if (r.error || !r.data) return echecBase(res, r.error, 'arbitrer');
    return ok(res, { id: r.data.id, statut: r.data.statut });
  }

  const r = await client.rpc('supervision_retirer', { p_id: corps.id });
  if (r.error || !r.data) return echecBase(res, r.error, 'retirer');
  return ok(res, { id: r.data.id, statut: r.data.statut });
}
