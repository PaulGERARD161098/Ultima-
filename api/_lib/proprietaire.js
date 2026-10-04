// LE GARDE « PROPRIÉTAIRE SEULEMENT » (04/10/2026).
//
// `requireUser` dit « une personne connectée ». Ce n'est PAS « Paul » : mesuré le
// 04/10/2026, l'inscription au projet d'authentification d'Ultima est OUVERTE
// (e-mail confirmé, et Google). N'importe qui peut se créer un compte. Une route
// qui sert une donnée qui n'appartient qu'au propriétaire — la carte d'une
// techno, par exemple — ne peut donc pas s'en contenter.
//
// La liste des propriétaires vit dans une variable d'environnement,
// `ULTIMA_PROPRIETAIRES` (identifiants de comptes, séparés par des virgules).
// ⛔ FERMÉ PAR DÉFAUT : variable absente, vide ou mal formée → personne ne passe.
// Un garde qui s'ouvrirait faute de réglage serait le pire des deux états : il
// aurait l'air d'exister.
//
// Ordre des refus : l'authentification d'abord (un inconnu reçoit 401 et
// n'apprend rien du réglage), le réglage ensuite, l'appartenance enfin.
import { requireUser } from './supabase.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Les propriétaires déclarés, ou null si le réglage est absent ou mal formé. */
export function proprietaires(env = process.env) {
  const brut = String(env.ULTIMA_PROPRIETAIRES || '').trim();
  if (!brut) return null;
  const ids = brut.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!ids.length || !ids.every((x) => UUID.test(x))) return null;
  return ids;
}

/**
 * { status: 'ok', user } | 'unconfigured' | 'unauthenticated' | 'reserve_non_regle' | 'interdit'
 */
export async function requireProprietaire(req, { makeClient, env = process.env } = {}) {
  const r = await requireUser(req, makeClient);
  if (r.status !== 'ok') return r;
  const ids = proprietaires(env);
  if (!ids) return { status: 'reserve_non_regle' };
  if (!ids.includes(String(r.user.id).toLowerCase())) return { status: 'interdit' };
  return r;
}
