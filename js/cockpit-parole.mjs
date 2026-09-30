// Ultima — LA PAROLE DU COCKPIT (fonctions pures).
// ---------------------------------------------------------------------------
// Ce que la parole de Léo dit d'un cap quand les agrégats sont arrivés : la
// ligne « En cours — … » et le signal « À traiter — … ». Rien d'autre.
//
// EXTRAITES de js/boussole-noyau.mjs le 2026-08-13 (étape ④a), TELLES QUELLES,
// pas une virgule changée. Motif : le ciel de navigation en a besoin, et
// importer le noyau de la boussole pour deux fonctions pures entraînerait son
// démarrage automatique — un module qui cherche un plateau, s'accroche à la
// page et enregistre ses globaux, pour deux calculs de chaînes. Un composant
// réclamé par un second appelant se DÉPLACE vers son propre module, il ne se
// recopie pas (règle du 2026-07-30, éprouvée sur la dictée vocale).
//
// Le noyau de la boussole les RÉ-EXPORTE : ses appelants et ses harnais ne
// voient rien passer. C'est le critère de réussite de l'extraction — les
// assertions doivent tourner SANS UNE RETOUCHE.
//
// Module ES PUR : aucune I/O, aucun DOM. N'accueillent QUE des entiers et du
// texte statique → sûres en innerHTML. Aucune PII n'y transite : le cockpit ne
// rapatrie que des COMPTES entiers, jamais un nom, jamais une fiche.

function n(v) { return Math.max(0, parseInt(v, 10) || 0); }
function s(compte) { return compte > 1 ? 's' : ''; }

// Le « vrai en cours » d'un cap. null s'il n'y a pas d'agrégat pour ce cap.
export function ligneVivante(id, data) {
  if (!data) return null;
  // TAO — cap agrégé (RESHIRAM + ZEKROM réunis) : le réel ET l'idéal en une ligne.
  if (id === 'tao' && (data.reshiram || data.zekrom)) {
    const rt = data.reshiram || {};
    const zt = data.zekrom || {};
    const tt = n(rt.talents);
    const it = n(zt.ideaux);
    return tt + ' talent' + s(tt) + ' réel' + s(tt) + ' · ' + n(rt.a_etayer) + ' à étayer'
      + ' — ' + it + ' ' + (it > 1 ? 'idéaux' : 'idéal') + ' · ' + n(zt.a_orienter) + ' à orienter.';
  }
  if (id === 'reshiram' && data.reshiram) {
    const r = data.reshiram;
    const t = n(r.talents);
    return t + ' talent' + s(t) + ' réel' + s(t) + ' · ' + n(r.a_etayer) + ' à étayer.';
  }
  if (id === 'zekrom' && data.zekrom) {
    const z = data.zekrom;
    const i = n(z.ideaux);
    const a = n(z.acquis);
    return i + ' ' + (i > 1 ? 'idéaux' : 'idéal') + ' · ' + n(z.a_orienter)
      + ' à orienter · ' + a + ' talent' + s(a) + ' relié' + s(a)
      + ' (acquis), ' + n(z.a_construire) + ' à construire.';
  }
  return null;
}

// Le signal « à traiter » d'un cap : un badge discret qui ne s'allume QUE quand
// un compte actionnable est > 0 (la donnée dort, s'allume quand elle compte).
export function signalDe(id, data) {
  if (!data) return null;
  const relances = n((data.riven || {}).relances_dues);
  const aEtayer = n((data.reshiram || {}).a_etayer);
  const aOrienter = n((data.zekrom || {}).a_orienter);

  function morceaux(avecRelances, avecTao) {
    const parts = [];
    if (avecRelances && relances > 0) parts.push(relances + ' relance' + s(relances) + ' due' + s(relances));
    if (avecTao && aEtayer > 0) parts.push(aEtayer + ' talent' + s(aEtayer) + ' à étayer');
    if (avecTao && aOrienter > 0) parts.push(aOrienter + ' ' + (aOrienter > 1 ? 'idéaux' : 'idéal') + ' à orienter');
    return parts.length ? parts.join(' · ') : null;
  }

  // La supra-division cumule ce que ses quadrants ont à traiter ; chaque
  // macro-projet (IMLADRIK, qui porte TAO) ne cumule que les siens.
  if (id === 'omega') return morceaux(Boolean(data.riven), Boolean(data.reshiram || data.zekrom));
  if (id === 'imladrik') return morceaux(false, Boolean(data.reshiram || data.zekrom));
  if (id === 'riven') return morceaux(Boolean(data.riven), false);
  if (id === 'tao') return morceaux(false, Boolean(data.reshiram || data.zekrom));
  if (id === 'reshiram') return aEtayer > 0 ? aEtayer + ' talent' + s(aEtayer) + ' à étayer' : null;
  if (id === 'zekrom') {
    return aOrienter > 0 ? aOrienter + ' ' + (aOrienter > 1 ? 'idéaux' : 'idéal') + ' à orienter' : null;
  }
  return null;
}

// LE CHARGEMENT DES AGRÉGATS — fail-closed, et c'est la règle qui compte.
// Sans jeton, sur erreur réseau, sur réponse non-ok ou sur JSON illisible : on
// ne dit RIEN de vivant et la parole retombe sur le texte figé du registre. Un
// cockpit qui, en tombant, laisserait paraître une erreur serveur ou un état
// à moitié rempli serait un défaut de SÉCURITÉ, pas d'ergonomie.
//
// Reprise telle quelle de js/boussole-noyau.mjs, y compris ses silences.
// `surDonnees` n'est appelé QUE sur un corps `{ ok: true }`.
export async function chargerCockpit(token, surDonnees) {
  return chargerAgregat('/api/cockpit', token, surDonnees);
}

// L'AGRÉGAT DE FINUBAR — l'état des huit dépôts, même route protégée, mêmes
// silences (02/09/2026). Il alimente la couleur d'appel du ciel et le bandeau
// de l'accueil.
//
// ⚠️ `surDonnees` n'est PAS appelé quand la route se tait. Le sans-jeton, lui,
// appelle avec `null` — c'est ce qui permet à l'appelant de distinguer « pas
// de session » de « la réponse n'est pas encore là », et de ne rien peindre
// dans les deux cas.
export async function chargerFinubar(token, surDonnees) {
  return chargerAgregat('/api/finubar', token, surDonnees);
}

// LE CHEMIN COMMUN, écrit une fois. Deux copies de cette dégradation auraient
// fini par diverger, et c'est la moitié silencieuse qui aurait divergé — celle
// qu'aucun écran ne montre. Un composant réclamé par un second appelant se
// DÉPLACE au lieu de se recopier (règle du 2026-07-30).
async function chargerAgregat(chemin, token, surDonnees) {
  if (!token) { surDonnees(null); return; }
  let rep;
  try {
    rep = await fetch(chemin, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
    });
  } catch (e) { return; } // silencieux : dégradation au texte figé
  if (!rep.ok) return;
  let corps = null;
  try { corps = await rep.json(); } catch (e) { corps = null; }
  if (corps && corps.ok === true) { surDonnees(corps.data || null); }
}
