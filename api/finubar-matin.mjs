/**
 * api/finubar-matin.mjs — le mail du matin (cron Vercel).
 *
 * CE QU'IL FAIT : envoie à Paul, chaque matin, ce que l'écran `/finubar` lui
 * montrerait s'il l'ouvrait — ce qui appelle, la prochaine action, et les
 * gestes qui n'attendent que lui.
 *
 * CE QU'IL NE FAIT PAS : collecter. Un serverless n'a ni les huit dépôts ni
 * git ; l'agrégat est celui du dernier `node finubar/collecter.mjs` COMMITÉ.
 * Le mail le dit en tête, et le crie au-delà de deux jours (voir
 * `_lib/finubar-matin-corps.mjs`). ⛔ Ne jamais « améliorer » ce point en
 * taisant la date : un digest quotidien sur une donnée figée qui ne dit pas
 * son âge annonce chaque matin un état périmé avec l'aplomb d'un état frais —
 * c'est précisément ce que Finubar existe pour empêcher.
 *
 * Sécurité :
 *  - `Bearer CRON_SECRET` EXIGÉ. Sans le secret configuré → 503, jamais un
 *    endpoint ouvert : cette route déclenche un envoi, donc quiconque
 *    l'appellerait pourrait inonder une boîte et brûler le quota Resend.
 *  - Destinataire en variable (`FINUBAR_MAIL_A`) : aucune adresse dans le
 *    dépôt, et Paul en change sans redéploiement de code.
 *  - Appel sortant HTTPS borné (8 s), erreurs génériques, aucun log d'adresse
 *    ni de contenu — y compris dans le motif rendu par Resend, qui porte des
 *    adresses et passe par `sansAdresse` avant le log comme avant la réponse.
 *
 * ⏰ L'HEURE, et pourquoi il y a DEUX crons pour un seul mail. Les crons Vercel
 * sont en UTC : `0 5 * * *` vaut 7 h à Paris en été et 6 h en hiver — le mail
 * dériverait d'une heure deux fois par an, sans que personne ne s'en occupe.
 * Donc : deux réveils (5 h et 6 h UTC) et une GARDE ici, qui n'envoie que si
 * l'heure réelle à Paris est celle visée. Toute l'année, un seul mail, à 7 h.
 * Le réveil qui tombe à côté sort en 200 sans rien faire — c'est un no-op, pas
 * une panne, et la réponse le dit (`envoye: 0`).
 */

import macro from './_lib/finubar-macro.mjs';
import { composerMatin } from './_lib/finubar-matin-corps.mjs';

const ALLOWED = ['GET', 'POST'];

// L'heure visée, à Paris. Changer ce nombre suffit : les deux crons encadrent
// déjà les deux décalages possibles (UTC+1 l'hiver, UTC+2 l'été).
const HEURE_VISEE = 7;
const FUSEAU = 'Europe/Paris';

// L'heure qu'il est à Paris, quel que soit le fuseau du serveur. `Intl` porte
// la base des fuseaux : c'est ce qui rend la garde juste au changement d'heure,
// là où un `+2` écrit en dur serait faux la moitié de l'année.
// ⛔ On lit la PARTIE `hour`, on ne parse pas le texte formaté : en `fr-FR`,
// `format()` rend « 22 h », et `Number('22 h')` vaut NaN — la garde aurait
// alors refusé TOUS les envois, en silence et pour toujours. Éprouvé sur un cas
// dont la réponse est connue (harnais §2), parce qu'une garde qui ne s'ouvre
// jamais et une garde qui marche ont exactement la même tête en production.
export function heureA(fuseau, maintenant = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: fuseau, hour: '2-digit', hour12: false,
  }).formatToParts(maintenant);
  const h = parts.find((p) => p.type === 'hour');
  return h ? Number(h.value) : NaN;
}

// La date du jour à Paris (et non en UTC) : à 1 h du matin l'été, l'UTC est
// encore la veille, et le mail daterait l'état d'un jour de trop.
export function dateA(fuseau, maintenant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: fuseau, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(maintenant);
}

// ⛔ LE MOTIF DE RESEND PORTE DES ADRESSES. Son refus le plus courant — celui
// rencontré le 06/09, domaine non vérifié — répond « you can only send testing
// emails to your own email address (…@…) ». Le rendre tel quel écrit l'adresse
// de Paul dans les logs Vercel, et la règle du dépôt est sans exception :
// jamais de PII en logs. Caviardé AVANT le log et AVANT la réponse.
// ⛔ Le caviardage passe AVANT la coupe à 400 : couper d'abord laisserait
// survivre la moitié d'une adresse tranchée par la borne — un caviardage qui
// ne s'applique qu'au cas facile a exactement la tête d'un caviardage qui
// marche. Rien n'est perdu pour le diagnostic : c'est le MOTIF qui dit pourquoi
// Resend refuse, pas l'adresse.
export const sansAdresse = (s) => String(s ?? '').replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[adresse]');

function json(res, code, charge) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(charge));
}

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) {
    res.setHeader('Allow', ALLOWED.join(', '));
    return json(res, 405, { ok: false, error: 'Méthode non autorisée' });
  }

  // Fail-closed sur le secret AVANT tout le reste : pas de secret configuré,
  // pas de route. Un `if (secret && auth === …)` laisserait l'endpoint grand
  // ouvert le jour où la variable disparaît — c'est le contournement classique.
  const secret = process.env.CRON_SECRET;
  if (!secret) return json(res, 503, { ok: false, error: 'Service non configuré' });
  const auth = (req.headers && req.headers.authorization) || '';
  if (auth !== `Bearer ${secret}`) return json(res, 401, { ok: false, error: 'Authentification requise' });

  const cle = process.env.RESEND_API_KEY;
  const destinataire = process.env.FINUBAR_MAIL_A;
  if (!cle || !destinataire) {
    // On NOMME ce qui manque : c'est un message pour Paul dans les logs Vercel,
    // pas pour un visiteur — la route n'est atteignable qu'avec le secret.
    console.error('[finubar-matin] envoi impossible :'
      + (cle ? '' : ' RESEND_API_KEY absente.')
      + (destinataire ? '' : ' FINUBAR_MAIL_A absente.'));
    return json(res, 503, { ok: false, error: 'Envoi non configuré' });
  }

  // La garde d'heure. `?force=1` la lève — pour un essai à la demande, qui
  // reste protégé par le secret : elle ne s'ouvre à personne de plus.
  const forcer = /[?&]force=1(&|$)/.test(req.url || '');
  const heure = heureA(FUSEAU);
  if (!forcer && heure !== HEURE_VISEE) {
    return json(res, 200, { ok: true, data: { envoye: 0, raison: 'hors de l’heure visée', heure_paris: heure } });
  }

  const expediteur = process.env.FINUBAR_MAIL_DE || 'Finubar <finubar@renoboostia.fr>';
  // Le lien vient de l'environnement Vercel, jamais d'une URL écrite à la main.
  const hote = process.env.FINUBAR_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '';
  const lien = hote ? (hote.startsWith('http') ? `${hote}/finubar` : `https://${hote}/finubar`) : '';

  const aujourdhui = dateA(FUSEAU);
  const { sujet, texte, html, jours } = composerMatin(macro, { aujourdhui, lien });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: expediteur, to: destinataire, subject: sujet, text: texte, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      // ⛔ ON REND LE MOTIF, et ce n'est pas une fuite : cette route n'est
      // atteignable qu'avec CRON_SECRET, donc son seul lecteur est son
      // propriétaire. Un « Envoi refusé » muet a coûté une soirée d'essais à
      // l'aveugle le 06/09 — domaine non vérifié, clé d'un autre compte,
      // destinataire malformé se ressemblent tous quand on ne voit que 502.
      // Un endpoint de service est discret avec les inconnus, pas avec celui
      // qui détient son secret.
      let motif = '';
      try { motif = sansAdresse(await r.text()).slice(0, 400); } catch { motif = '(corps illisible)'; }
      console.error('[finubar-matin] Resend a refusé l’envoi :', r.status, motif);
      return json(res, 502, { ok: false, error: 'Envoi refusé', resend: { statut: r.status, motif } });
    }
  } catch (e) {
    console.error('[finubar-matin] envoi échoué :', e && e.name);
    return json(res, 502, { ok: false, error: 'Envoi impossible' });
  }

  // La réponse ne porte que des compteurs — jamais l'adresse, jamais le corps.
  return json(res, 200, { ok: true, data: { envoye: 1, etat_du: macro.le, age_jours: jours } });
}
