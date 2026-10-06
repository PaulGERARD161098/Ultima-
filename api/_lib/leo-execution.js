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
import { logError } from './http.js';

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
 * W1 (audit du 05/10) — l'interrupteur serveur des écritures automatiques.
 * FERMÉ PAR DÉFAUT (revue Codex du 06/10, critère de l'audit) : seule la
 * valeur exacte 'actives' de `LEO_ECRITURES_AUTO` laisse l'anneau vert agir
 * sans demander. Absente, vide, 'coupees' ou mal tapée : coupé, chaque
 * proposition retombe sur la carte et Paul confirme. Un garde qui s'ouvrirait
 * faute de réglage serait le pire des deux états.
 * Basculer = changer la variable dans Vercel puis redéployer ; rien d'autre.
 */
export function ecrituresAutoCoupees(env = process.env) {
  return env.LEO_ECRITURES_AUTO !== 'actives';
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
  env = process.env,
  // Injectable pour UN usage : éprouver le refus d'un orange alors que le
  // catalogue n'en compte plus aucun (§12.4 ①). La route n'en passe jamais —
  // un contrôle vérifie qu'elle appelle avec trois arguments seulement.
  garde: gardeInjectee = autoriserEcriture
} = {}) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps) ||
      !clesFermees(corps, CLES_OUVRIR)) {
    return refus(400, 'Demande invalide');
  }
  // W1 : interrupteur coupé → aucune trace, aucun acte automatique ; le front
  // retombe sur la carte de confirmation (tout refus d'`ouvrir` y mène).
  if (ecrituresAutoCoupees(env)) return refus(403, 'Écritures automatiques coupées');
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
  if (insertion.error) return insertion.error.code === 'PT429'
    ? refus(429, 'Plafond d’écritures atteint') : refus(503, 'Journal indisponible');

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

/* ═══════════════════════════════════════════════════════════════════════════
   LE DÉFAIRE — B1 ⑤, cadrage §15 (02/10/2026). Paul a tranché le §15.2 :
   l'enrichissement repasse orange (①), le bouton vit dans la bulle et sur
   l'écran « Ce que Léo a fait » (②).
   ───────────────────────────────────────────────────────────────────────────
   Défaire une création, c'est supprimer sa cible. ⛔ Sauf si quelque chose est
   né dessus depuis : une flamme sur le serment, un lien sur l'idée, un scénario
   marqué « advenu ». Le défaire deviendrait alors le geste le plus destructeur
   du système — il REFUSE, et dit pourquoi.

   ⛔ LA SUPPRESSION EST CELLE DE LA ROUTE DE L'OUTIL, PAS UNE VOIE NEUVE. Les
   huit routes suppriment toutes de la même façon (mesuré le 02/10) : le client
   de la séance de Paul, `.delete().eq('id', …)`, sous la RLS propriétaire.
   C'est exactement ce qui est fait ici, avec le même client — aucun rôle de
   service, aucun droit de plus. On le fait ICI plutôt qu'en rappelant la route
   depuis le front pour une raison : le contrôle des dépendances et la
   suppression vivent dans la même requête, et aucun front ne peut sauter le
   premier pour n'appeler que la seconde.
   ⚠️ `cible_id` n'est qu'une ADRESSE (revue S6) : lue dans le journal de Paul,
   elle ne désigne jamais que ce que la RLS laisse Paul supprimer lui-même.
   ═══════════════════════════════════════════════════════════════════════════ */

// L'outil → la table que sa route écrit, et comment nommer la cible à l'écran.
//   · `retouche` : la table porte un `updated_at` tenu par déclencheur — une
//     cible retouchée à la main depuis sa création ne se défait plus (le
//     défaire effacerait la retouche de Paul). Mesuré le 02/10 : `journal`,
//     `flammes` et `scenarios` n'en ont pas — voir la limite au cadrage §15.5.
//   · `libelle` : la colonne qui la nomme, ou celle de son parent (`via`).
// ⛔ Ce n'est pas une seconde liste de ce qui est vert : la couleur reste un
// champ du catalogue. `tests/unit-leo-defaire.mjs` exige que les clés d'ici
// soient EXACTEMENT les outils verts du catalogue, et que chaque table soit
// celle que la route du plan d'exécution supprime.
export const DEFAIRES = Object.freeze({
  proposer_idee: { table: 'idees', retouche: true, libelle: { colonne: 'nom' } },
  proposer_besoin: { table: 'intendant_besoins', retouche: true, libelle: { colonne: 'designation' } },
  // `marque` : une colonne que Léo ne pose JAMAIS à la création — si elle est
  // vraie, c'est que Paul est passé par là (revue M2 du 02/10 : une relance
  // marquée faite se serait défaite avec sa marque).
  proposer_journal: { table: 'journal', retouche: false, marque: 'relance_faite',
    libelle: { via: 'node_id', table: 'network_nodes', colonne: 'nom' } },
  proposer_relance: { table: 'journal', retouche: false, marque: 'relance_faite',
    libelle: { via: 'node_id', table: 'network_nodes', colonne: 'nom' } },
  proposer_page_journal: { table: 'imladrik_entrees', retouche: true, libelle: { colonne: 'titre' } },
  proposer_serment: { table: 'serments', retouche: true, libelle: { colonne: 'intitule' } },
  proposer_flamme: { table: 'flammes', retouche: false,
    libelle: { via: 'serment_id', table: 'serments', colonne: 'intitule' } },
  proposer_situation: { table: 'situations', retouche: true, libelle: { colonne: 'intitule' } },
  proposer_scenario: { table: 'scenarios', retouche: false,
    libelle: { via: 'situation_id', table: 'situations', colonne: 'intitule' } }
});

// LE RELEVÉ DES DÉPENDANCES — toutes les clés étrangères qui pointent une table
// cible, QUELLE QUE SOIT LEUR RÈGLE. Relevé en base le 02/10 (pg_constraint,
// `supabase/releves/20261002_leo_defaire_dependances.RELEVE.sql`).
// ⛔ Pas seulement les cascades : supprimer un scénario marqué « advenu » ne
// détruit rien en cascade, mais la base REMET À VIDE le marqueur de la
// situation (`on delete set null`) et un déclencheur en efface la date. C'est
// tout aussi destructeur (dry run du 02/10, §15.4).
// ⛔ Un test relit TOUTES les migrations et exige que chaque clé étrangère vers
// ces tables figure ici : une passerelle ajoutée demain sans mise à jour de ce
// relevé fait rougir le harnais au lieu d'ouvrir une cascade silencieuse.
export const DEPENDANCES = Object.freeze({
  idees: [
    { table: 'idees_liens', colonne: 'source_id' },
    { table: 'idees_liens', colonne: 'target_id' }
  ],
  intendant_besoins: [],
  journal: [],
  imladrik_entrees: [
    { table: 'serment_liens', colonne: 'entree_id' },
    { table: 'scenario_liens', colonne: 'entree_id' }
  ],
  serments: [
    { table: 'flammes', colonne: 'serment_id' },
    { table: 'serment_liens', colonne: 'serment_id' },
    { table: 'scenario_liens', colonne: 'serment_id' }
  ],
  flammes: [],
  situations: [{ table: 'scenarios', colonne: 'situation_id' }],
  scenarios: [
    { table: 'situations', colonne: 'scenario_advenu_id' },
    { table: 'scenario_liens', colonne: 'scenario_id' }
  ]
});

const CLES_DEFAIRE = ['etape', 'traceId'];

// Les refus du défaire. ⛔ LISTE FERMÉE : le front traduit chacun pour Paul, et
// un message qui n'y est pas tombe sur le texte prudent (« rien n'a été
// retiré »). `Lié : <table>` nomme ce qui est né dessus, jamais son contenu.
export const REFUS_DEFAIRE = Object.freeze({
  rien: 'Rien à défaire',
  deja: 'Déjà défait',
  geste: 'Ce geste ne se défait pas',
  disparue: 'Cible introuvable',
  retouchee: 'Retouchée depuis',
  ancien: 'Trop ancien'
});

// Le défaire vit sept jours — la fenêtre de l'écran. Au-delà, plus aucune
// voie ne le propose, et le serveur le refuse aussi (revue F1 du 02/10 : une
// requête fabriquée défaisait une flamme de six mois).
export const DEFAIRE_MAX_MS = 7 * 24 * 3600 * 1000;
const PREFIXE_LIE = 'Lié : ';

/** Les lignes d'une trace, rangées. Pur. */
function resumerTrace(lignes) {
  const tentees = lignes.filter((l) => l.phase === 'tentee');
  const issues = lignes.filter((l) => ISSUES.includes(l.phase));
  const defaites = lignes.filter((l) => l.phase === 'defaite');
  return { tentees, issues, defaites };
}

/** Ce qui est né sur la cible. → { ok: true, lie: null | table } | { ok: false } */
async function chercherDependance(client, table, cibleId) {
  for (const dep of DEPENDANCES[table] || []) {
    const r = await client.from(dep.table).select(dep.colonne).eq(dep.colonne, cibleId).limit(1);
    // ⛔ FAIL-CLOSED : ne pas savoir s'il y a une flamme, c'est ne pas pouvoir
    // dire que le défaire est sans perte. Une lecture en échec REFUSE.
    if (r.error || !Array.isArray(r.data)) return { ok: false };
    if (r.data.length > 0) return { ok: true, lie: dep.table };
  }
  return { ok: true, lie: null };
}

/** Les colonnes à lire sur une cible pour la juger. */
function colonnesCible(defaire, extra = []) {
  return ['id', 'created_at', ...(defaire.retouche ? ['updated_at'] : []),
    ...(defaire.marque ? [defaire.marque] : []), ...extra].join(', ');
}

/**
 * Le jugement d'une cible vivante, PUR — le même pour le défaire et l'écran.
 * → 'ok' | 'etrangere' | 'retouchee'
 *
 * ⛔ 'etrangere' (revue M1 du 02/10) : la cible doit être NÉE DE CE GESTE, entre
 * la tentative et sa réussite. Sans ce contrôle, une clôture forgée (un `cibleId`
 * pris au hasard parmi les serments de Paul) faisait proposer « Défaire » sur un
 * serment écrit à la main il y a trois mois. Les trois instants viennent de la
 * même horloge, celle de la base : la tentative (déclencheur), la création
 * (`now()` de son insertion) et la réussite (`now()` de la sienne) se suivent
 * strictement, puisque chaque requête attend la réponse de la précédente.
 * ⛔ Tout instant illisible juge vers le refus.
 */
export function jugerCible(defaire, ligne, tenteeLe, reussieLe) {
  const cree = Date.parse(ligne && ligne.created_at);
  const debut = Date.parse(tenteeLe);
  const fin = Date.parse(reussieLe);
  if (![cree, debut, fin].every(Number.isFinite) || cree < debut || cree > fin) return 'etrangere';
  if (defaire.retouche) {
    const touche = Date.parse(ligne.updated_at);
    if (!Number.isFinite(touche) || touche > cree) return 'retouchee';
  }
  if (defaire.marque && ligne[defaire.marque] !== false && ligne[defaire.marque] !== null) return 'retouchee';
  return 'ok';
}

/**
 * Défait une écriture de Léo : relit la trace DU PROPRIÉTAIRE, vérifie que
 * rien n'est né sur la cible, la supprime, pose la ligne 'defaite'.
 * → { status: 200, data: { traceId, defaite: true, journalise } } | { status, message }
 *
 * ⛔ Chaque refus survient AVANT la suppression. L'ordre n'est pas cosmétique.
 */
export async function defaireEcriture(client, userId, corps, { maintenant = Date.now() } = {}) {
  if (!corps || typeof corps !== 'object' || Array.isArray(corps) ||
      !clesFermees(corps, CLES_DEFAIRE)) {
    return refus(400, 'Demande invalide');
  }
  if (corps.traceId === undefined) return refus(400, 'Demande invalide');
  const trace = ouvrirTrace(corps.traceId);
  if (!trace.ok) return refus(400, 'Demande invalide');

  const lecture = await client
    .from('leo_ecritures')
    .select('outil, quadrant, phase, cible_id, le')
    .eq('owner_id', userId)
    .eq('trace_id', trace.traceId);
  if (lecture.error || !Array.isArray(lecture.data)) {
    logError('leo.defaire', lecture.error?.code || 'lecture');
    return refus(503, 'Journal indisponible');
  }
  const { tentees, issues, defaites } = resumerTrace(lecture.data);
  if (tentees.length !== 1) return refus(404, 'Trace inconnue');
  if (defaites.length > 0) return refus(409, REFUS_DEFAIRE.deja);
  const ouverteLe = Date.parse(tentees[0].le);
  if (!Number.isFinite(ouverteLe) || maintenant - ouverteLe > DEFAIRE_MAX_MS) {
    return refus(409, REFUS_DEFAIRE.ancien);
  }
  const reussie = issues.length === 1 && issues[0].phase === 'reussie' ? issues[0] : null;
  if (!reussie || typeof reussie.cible_id !== 'string') return refus(409, REFUS_DEFAIRE.rien);

  // L'outil est celui de la TENTATIVE, recopié — jamais reçu. Un outil qui
  // n'a pas de défaire (l'enrichissement, vert avant le 02/10) ne se défait
  // pas : sa cible est une idée de Paul, la supprimer serait une catastrophe.
  const outil = tentees[0].outil;
  const defaire = Object.prototype.hasOwnProperty.call(DEFAIRES, outil) ? DEFAIRES[outil] : null;
  if (!defaire || reussie.outil !== outil) return refus(409, REFUS_DEFAIRE.geste);
  const cibleId = reussie.cible_id;

  const lue = await client.from(defaire.table).select(colonnesCible(defaire)).eq('id', cibleId).maybeSingle();
  if (lue.error) {
    logError('leo.defaire', lue.error.code || 'cible');
    return refus(503, 'Données indisponibles');
  }
  if (!lue.data) return refus(404, REFUS_DEFAIRE.disparue);
  const jugement = jugerCible(defaire, lue.data, tentees[0].le, reussie.le);
  if (jugement === 'etrangere') return refus(409, REFUS_DEFAIRE.geste);
  if (jugement === 'retouchee') return refus(409, REFUS_DEFAIRE.retouchee);

  const dependance = await chercherDependance(client, defaire.table, cibleId);
  if (!dependance.ok) {
    logError('leo.defaire', 'dependances');
    return refus(503, 'Données indisponibles');
  }
  if (dependance.lie) return refus(409, PREFIXE_LIE + dependance.lie);

  // LA SUPPRESSION — celle de la route de l'outil, au filtre près. Sur une
  // table qui porte `updated_at`, le filtre exige AUSSI l'instant lu : une
  // retouche de Paul tombée pendant nos lectures fait échouer la suppression
  // au lieu de l'emporter (revue F2 du 02/10). La course sur une dépendance
  // née pendant ces lectures, elle, demande une fonction SQL (gate, §15.5).
  let requete = client.from(defaire.table).delete().eq('id', cibleId);
  if (defaire.retouche) requete = requete.eq('updated_at', lue.data.updated_at);
  const suppression = await requete.select('id').maybeSingle();
  if (suppression.error) {
    logError('leo.defaire', suppression.error.code || 'suppression');
    return refus(503, 'Données indisponibles');
  }
  // Rien supprimé : retouchée entre-temps, ou supprimée par une autre requête.
  // ⛔ Seule la requête qui a RÉELLEMENT supprimé pose la 'defaite' — c'est ce
  // qui garantit, sans index de plus, qu'une trace n'en porte jamais deux.
  if (!suppression.data) {
    const encore = await client.from(defaire.table).select('id').eq('id', cibleId).maybeSingle();
    return encore.data ? refus(409, REFUS_DEFAIRE.retouchee) : refus(404, REFUS_DEFAIRE.disparue);
  }

  const entree = construireEntreeJournal({
    traceId: trace.traceId,
    outil,
    quadrant: tentees[0].quadrant,
    phase: 'defaite',
    cibleId
  });
  const insertion = entree.ok
    ? await client.from('leo_ecritures').insert(entree.entree)
    : { error: { code: 'entree' } };
  // ⚠️ La cible EST supprimée : la réponse le dit, même si le journal n'a pas
  // pu le noter. Mentir à Paul (« échec ») le pousserait à recommencer sur une
  // cible qui n'existe plus. `journalise: false` est rendu tel quel.
  return { status: 200, data: { traceId: trace.traceId, defaite: true, journalise: !insertion.error } };
}

/* ═══════════════════════════════════════════════════════════════════════════
   « CE QUE LÉO A FAIT » — l'écran `leo.html` (choix ② de Paul).
   Une ligne par geste : verbe (l'outil), heure, état, et la cible nommée TANT
   QU'ELLE EXISTE — le journal ne porte aucun contenu, le nom se lit dans la
   table vivante, sous la RLS de Paul. Une cible défaite ne se nomme plus.
   ═══════════════════════════════════════════════════════════════════════════ */
export const FENETRE_ECRAN_JOURS = 7;

// LE VERBE DE CHAQUE GESTE — une seule source, pour l'écran ET le mail du
// matin (M5 : verbe + objet + heure). Au passé quand c'est fait, à l'infinitif
// quand c'est tenté. ⛔ Jamais le nom technique de l'outil : un outil inconnu
// « a agi ».
const VERBES = Object.freeze({
  proposer_idee: ['A créé une idée', 'créer une idée'],
  proposer_enrichissement_idee: ['A enrichi une idée', 'enrichir une idée'],
  proposer_besoin: ['A ajouté un besoin', 'ajouter un besoin'],
  proposer_journal: ['A noté au journal', 'noter au journal'],
  proposer_relance: ['A programmé une relance', 'programmer une relance'],
  proposer_page_journal: ['A écrit une page du journal', 'écrire une page du journal'],
  proposer_serment: ['A scellé un serment', 'sceller un serment'],
  proposer_flamme: ['A allumé une flamme', 'allumer une flamme'],
  proposer_situation: ['A posé une situation', 'poser une situation'],
  proposer_scenario: ['A imaginé un scénario', 'imaginer un scénario']
});
export function phraseGeste(outil, etat) {
  const v = Object.prototype.hasOwnProperty.call(VERBES, outil) ? VERBES[outil] : ['A agi', 'agir'];
  if (etat !== 'echec' && etat !== 'interrompu') return v[0];
  // L'élision : « a tenté d’ajouter », pas « de ajouter ».
  return 'A tenté ' + (/^[aeéèêiîouy]/i.test(v[1]) ? 'd’' : 'de ') + v[1];
}
const MAX_LIGNES_ECRAN = 600;
const MAX_LIBELLE = 120;

// ⛔ Les identifiants partent par LOTS : un `in.(…)` de six cents UUID ferait
// une URL de plus de 20 Ko, que PostgREST ou le proxy refusent — et le refus
// retirerait tous les boutons de l'écran sans dire pourquoi.
const LOT_IDS = 100;
async function lireParLots(client, table, colonnes, colonneFiltre, ids) {
  const lignes = [];
  for (let i = 0; i < ids.length; i += LOT_IDS) {
    const r = await client.from(table).select(colonnes).in(colonneFiltre, ids.slice(i, i + LOT_IDS));
    if (r.error || !Array.isArray(r.data)) throw new Error('lecture');
    lignes.push(...r.data);
  }
  return lignes;
}

function libelleBorne(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > MAX_LIBELLE ? t.slice(0, MAX_LIBELLE - 1) + '…' : t;
}

/**
 * → { status: 200, data: { gestes: [...] } } | { status, message }
 * geste = { traceId, outil, quadrant, le, etat, cible?, defaitLe?, lie?, defaisable }
 * etat ∈ 'fait' | 'defait' | 'echec' | 'interrompu' | 'disparu' | 'lie' | 'retouche'
 */
export async function listerEcritures(client, userId, { maintenant = Date.now() } = {}) {
  const depuis = new Date(maintenant - FENETRE_ECRAN_JOURS * 24 * 3600 * 1000).toISOString();
  const lecture = await client
    .from('leo_ecritures')
    .select('trace_id, outil, quadrant, phase, cible_id, le')
    .eq('owner_id', userId)
    .gte('le', depuis)
    .order('le', { ascending: false })
    .limit(MAX_LIGNES_ECRAN);
  if (lecture.error || !Array.isArray(lecture.data)) return refus(503, 'Journal indisponible');

  const parTrace = new Map();
  for (const l of lecture.data) {
    if (!parTrace.has(l.trace_id)) parTrace.set(l.trace_id, []);
    parTrace.get(l.trace_id).push(l);
  }
  const gestes = [];
  for (const [traceId, lignes] of parTrace) {
    const { tentees, issues, defaites } = resumerTrace(lignes);
    // Une trace dont la tentative est hors fenêtre n'est pas montrée à moitié.
    if (tentees.length !== 1) continue;
    const t = tentees[0];
    const issue = issues.length === 1 ? issues[0] : null;
    const geste = { traceId, outil: t.outil, quadrant: t.quadrant, le: t.le, defaisable: false };
    if (defaites.length > 0) { geste.etat = 'defait'; geste.defaitLe = defaites[0].le; }
    else if (!issue) geste.etat = 'interrompu';
    else if (issue.phase === 'echouee') geste.etat = 'echec';
    else {
      geste.etat = 'fait';
      if (typeof issue.cible_id === 'string') { geste.cibleId = issue.cible_id; geste.reussieLe = issue.le; }
    }
    gestes.push(geste);
  }
  gestes.sort((a, b) => String(b.le).localeCompare(String(a.le)));

  // Les cibles vivantes, lues PAR TABLE (une requête par table et par
  // dépendance, jamais une par ligne).
  const aLire = new Map();
  for (const g of gestes) {
    if (g.etat !== 'fait' || !g.cibleId) continue;
    const d = Object.prototype.hasOwnProperty.call(DEFAIRES, g.outil) ? DEFAIRES[g.outil] : null;
    if (!d) continue; // l'enrichissement : fait, mais sans défaire ni nom
    if (!aLire.has(d.table)) aLire.set(d.table, { defaire: d, gestes: [] });
    aLire.get(d.table).gestes.push(g);
  }
  // ⛔ CHAQUE TABLE A SON PROPRE ÉCHEC. Une première version entourait le tout
  // d'un seul try : la première lecture en échec rejetait `Promise.all`, le
  // repli s'exécutait — pendant que les autres tables, encore en vol, posaient
  // leurs boutons APRÈS lui (sabotage du 02/10 : le harnais restait vert).
  // Ici, rien n'est écrit sur une ligne avant que TOUTES ses lectures aient
  // abouti : une table illisible laisse ses lignes sans nom ni bouton, et
  // n'éteint pas celles des autres.
  await Promise.all([...aLire.values()].map(async ({ defaire, gestes: gs }) => {
    try {
      const ids = [...new Set(gs.map((g) => g.cibleId))];
      const lib = defaire.libelle;
      const colonnes = colonnesCible(defaire, [lib.via || lib.colonne]);
      const cibles = await lireParLots(client, defaire.table, colonnes, 'id', ids);
      const vivantes = new Map(cibles.map((x) => [x.id, x]));
      let noms = null;
      if (lib.via) {
        const parents = [...new Set(cibles.map((x) => x[lib.via]).filter((v) => typeof v === 'string'))];
        noms = new Map();
        for (const x of await lireParLots(client, lib.table, 'id, ' + lib.colonne, 'id', parents)) {
          noms.set(x.id, x[lib.colonne]);
        }
      }
      const lies = new Map();
      for (const dep of DEPENDANCES[defaire.table] || []) {
        for (const x of await lireParLots(client, dep.table, dep.colonne, dep.colonne, ids)) {
          if (!lies.has(x[dep.colonne])) lies.set(x[dep.colonne], dep.table);
        }
      }
      for (const g of gs) {
        const v = vivantes.get(g.cibleId);
        if (!v) { g.etat = 'disparu'; continue; }
        const jugement = jugerCible(defaire, v, g.le, g.reussieLe);
        // Une cible qui n'est pas née de ce geste n'est ni nommée ni défaisable :
        // la trace qui la désigne ne dit pas la vérité (revue M1).
        if (jugement === 'etrangere') continue;
        g.cible = libelleBorne(lib.via ? noms.get(v[lib.via]) : v[lib.colonne]);
        if (jugement === 'retouchee') { g.etat = 'retouche'; continue; }
        if (lies.has(g.cibleId)) { g.etat = 'lie'; g.lie = lies.get(g.cibleId); continue; }
        g.defaisable = true;
      }
    } catch {
      // Lecture en échec : ces lignes restent « fait », sans nom ni bouton.
      // ⛔ Jamais « Défaire » sur une ligne dont on n'a pas lu les dépendances.
    }
  }));
  for (const g of gestes) {
    delete g.cibleId;
    delete g.reussieLe;
    // La même fenêtre que le serveur : passé sept jours, plus de bouton.
    if (g.defaisable && !(maintenant - Date.parse(g.le) <= DEFAIRE_MAX_MS)) g.defaisable = false;
    g.quoi = phraseGeste(g.outil, g.etat);
  }
  return { status: 200, data: { gestes } };
}
