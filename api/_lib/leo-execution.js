// L'EXÉCUTION DES ÉCRITURES DE LÉO — B1 étape ④, cadrage §13 (30/09/2026).
//
// Deux temps, et l'acte vit ENTRE les deux, côté front, par les API
// d'écriture existantes (la résolution des cibles dictées se fait sur les
// données que la page a déjà chargées — la refaire ici serait une seconde
// vérité) :
//   · `ouvrirEcriture` — la garde, le plafond, la ligne 'tentee'. Rend une
//     trace, ou refuse. ⛔ SANS TRACE, PAS D'ACTE AUTOMATIQUE : le front
//     retombe alors sur la carte de confirmation, jamais sur une écriture
//     silencieuse.
//   · `cloreEcriture` — l'issue ('reussie' | 'echouee'), recopiée sur la
//     'tentee' : l'outil et le quadrant ne sont JAMAIS reçus à ce moment-là.
//
// ⛔ LE CLIENT EST INJECTÉ : c'est ce qui rend le module éprouvable sans base,
// avec un client factice qui enregistre ce qui aurait été écrit (même
// dispositif que `import-personnes.js`).
//
// ⚠️ `leo_operations` N'EST PAS ÉCRIT ICI, et ce n'est pas un oubli : le
// produit n'en a pas le droit (SELECT seul, aucune fonction ne crée de
// mission — mesuré le 30/09, cadrage §13.0). La clé fabriquée par
// `ouvrirTrace()` est donc prête pour le jour où ce gate sera levé.
import { autoriserEcriture, normaliserQuadrant } from './leo.js';
import {
  ouvrirTrace,
  construireEntreeJournal,
  creerPlafondEcritures,
  PLAFOND_PAR_DEFAUT,
  FENETRE_PAR_DEFAUT_MS
} from './leo-journal.js';

// Les seules clés que chaque étape accepte. Liste FERMÉE, même règle que
// `construireEntreeJournal` : un `outil` glissé dans le corps d'une clôture
// ferait refuser la clôture entière — c'est ce qui empêche d'écrire une issue
// sous un autre nom que celui de la tentative.
const CLES_OUVRIR = ['etape', 'outil', 'args', 'quadrant'];
const CLES_CLORE = ['etape', 'traceId', 'issue', 'cibleId', 'motif'];

export const ISSUES = ['reussie', 'echouee'];

// ⛔ LE MOTIF D'ÉCHEC EST UNE LISTE FERMÉE, pas seulement une borne. La borne
// de 200 caractères (`construireEntreeJournal`) arrête une page de journal ;
// elle n'arrête pas « Racheter le local ». Un motif technique a trois formes,
// et rien d'autre n'entre.
export const MOTIF_TECHNIQUE = /^(statut [1-5][0-9]{2}|reseau|reponse illisible)$/;

// Une clôture n'a de sens que pour une tentative récente : au-delà de la
// fenêtre du plafond, la 'tentee' seule est l'information (« interrompue en
// vol »), et la compléter après coup réécrirait l'histoire.
export const CLOTURE_MAX_MS = FENETRE_PAR_DEFAUT_MS;

const plafondParDefaut = creerPlafondEcritures();

function refus(status, message) {
  return { status, message };
}

function clesFermees(corps, permises) {
  return Object.keys(corps).every((cle) => permises.includes(cle));
}

/**
 * Ouvre une écriture de Léo : garde, plafond, ligne 'tentee'.
 * → { status: 200, data: { traceId, restant } } | { status, message }
 *
 * ⛔ Chaque refus survient AVANT toute insertion. L'ordre n'est pas
 * cosmétique : une 'tentee' posée puis refusée serait une ligne qui ment.
 */
export async function ouvrirEcriture(client, userId, corps, {
  maintenant = Date.now(),
  plafond = plafondParDefaut,
  // Injectable pour UN usage : éprouver le refus d'un orange alors que le
  // catalogue n'en compte plus aucun (§12.4 ①). La route n'en passe jamais —
  // un contrôle vérifie qu'elle appelle avec trois arguments seulement.
  garde: gardeInjectee = autoriserEcriture
} = {}) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps) ||
      !clesFermees(corps, CLES_OUVRIR)) {
    return refus(400, 'Demande invalide');
  }
  const quadrant = normaliserQuadrant(corps.quadrant);

  // LA GARDE — son premier appelant. Elle refait tout le chemin
  // (catalogue, quadrant, arguments) : elle ne croit ni le front, ni l'anneau
  // que `/api/leo` lui a renvoyé à titre d'information.
  const garde = gardeInjectee(corps.outil, corps.args, quadrant);
  if (!garde.ok) {
    return garde.motif === 'validation de Paul requise'
      ? refus(403, 'Validation de Paul requise')
      : refus(400, 'Proposition invalide');
  }

  // LE PLAFOND, lu sur les tentatives de la fenêtre. ⛔ Les tentatives, pas les
  // réussites : un emballement qui échoue en boucle doit mordre aussi.
  // ⛔ Une lecture en échec REFUSE : ne pas savoir combien on a écrit, c'est
  // ne pas pouvoir dire que le plafond tient (repli vers le plus contraint).
  const depuis = new Date(maintenant - FENETRE_PAR_DEFAUT_MS).toISOString();
  const lecture = await client
    .from('leo_ecritures')
    .select('le')
    .eq('owner_id', userId)
    .eq('phase', 'tentee')
    .gte('le', depuis)
    .limit(PLAFOND_PAR_DEFAUT + 1);
  if (lecture.error || !Array.isArray(lecture.data)) {
    return refus(503, 'Journal indisponible');
  }
  const verdict = plafond(lecture.data.map((l) => l.le), maintenant);
  if (!verdict.ok) return refus(429, 'Plafond d’écritures atteint');

  const trace = ouvrirTrace();
  if (!trace.ok) return refus(503, 'Journal indisponible');

  const entree = construireEntreeJournal({
    traceId: trace.traceId,
    outil: garde.proposition.outil,
    quadrant,
    phase: 'tentee'
  });
  if (!entree.ok) return refus(500, 'Erreur interne');

  const insertion = await client.from('leo_ecritures').insert(entree.entree);
  // ⛔ FAIL-CLOSED : pas de ligne 'tentee', pas de trace rendue — donc pas
  // d'acte automatique. Le journal s'écrit AVANT l'acte ou l'acte n'a pas lieu.
  if (insertion.error) return refus(503, 'Journal indisponible');

  return { status: 200, data: { traceId: trace.traceId, restant: verdict.restant - 1 } };
}

/**
 * Clôt une écriture : pose son issue, recopiée sur la 'tentee'.
 * → { status: 200, data: { traceId, issue } } | { status, message }
 */
export async function cloreEcriture(client, userId, corps, { maintenant = Date.now() } = {}) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps) ||
      !clesFermees(corps, CLES_CLORE)) {
    return refus(400, 'Demande invalide');
  }
  // `ouvrirTrace(x)` : la voie qui VÉRIFIE — elle refuse ce que l'un des deux
  // registres refuserait. Jamais de trace fabriquée par-dessus un argument.
  if (corps.traceId === undefined) return refus(400, 'Demande invalide');
  const trace = ouvrirTrace(corps.traceId);
  if (!trace.ok) return refus(400, 'Demande invalide');

  // Aucune correction silencieuse : 'Reussie' n'est pas 'reussie'.
  if (!ISSUES.includes(corps.issue)) return refus(400, 'Demande invalide');
  if (corps.motif !== undefined && corps.motif !== null &&
      (typeof corps.motif !== 'string' || !MOTIF_TECHNIQUE.test(corps.motif))) {
    return refus(400, 'Demande invalide');
  }

  const lecture = await client
    .from('leo_ecritures')
    .select('outil, quadrant, phase, le')
    .eq('owner_id', userId)
    .eq('trace_id', trace.traceId);
  if (lecture.error || !Array.isArray(lecture.data)) {
    return refus(503, 'Journal indisponible');
  }
  const tentees = lecture.data.filter((l) => l.phase === 'tentee');
  if (tentees.length !== 1) return refus(404, 'Trace inconnue');
  if (lecture.data.some((l) => ISSUES.includes(l.phase))) {
    return refus(409, 'Issue déjà posée');
  }
  const tentee = tentees[0];
  const ouverteLe = Date.parse(tentee.le);
  // Un instant illisible est traité comme expiré : le repli ne rouvre rien.
  if (!Number.isFinite(ouverteLe) || maintenant - ouverteLe > CLOTURE_MAX_MS) {
    return refus(409, 'Trace expirée');
  }

  const entree = construireEntreeJournal({
    traceId: trace.traceId,
    // Recopiés, jamais reçus : l'issue ne peut pas changer de nom en route.
    outil: tentee.outil,
    quadrant: tentee.quadrant,
    phase: corps.issue,
    ...(corps.cibleId !== undefined && corps.cibleId !== null ? { cibleId: corps.cibleId } : {}),
    ...(corps.motif !== undefined && corps.motif !== null ? { motif: corps.motif } : {})
  });
  if (!entree.ok) return refus(400, 'Demande invalide');

  const insertion = await client.from('leo_ecritures').insert(entree.entree);
  // S5 (revue du 30/09) : lire puis insérer n'est pas atomique — deux
  // clôtures concurrentes passeraient toutes deux la lecture. L'index unique
  // `leo_ecritures_une_issue` tranche en base ; son refus est un 409, pas une panne.
  if (insertion.error) {
    return insertion.error.code === '23505'
      ? refus(409, 'Issue déjà posée') : refus(503, 'Journal indisponible');
  }
  return { status: 200, data: { traceId: trace.traceId, issue: corps.issue } };
}
