// GET /api/zohshia → { ok:true, data:{ publie_le, technos:[{ badge, etat, mesure, onglets }] } }
//
// ZOH SHIA à l'écran (Paul, 04/10/2026 : « un badge par techno, et le contenu est
// dedans »). Sert le plan des technos, réservé au SEUL PROPRIÉTAIRE : ce plan est
// une carte du système (tables, routes, variables), et l'inscription au projet
// d'authentification est ouverte — « être connecté » ne suffit pas.
//
// La donnée est FIGÉE AU COMMIT (`api/_lib/zohshia-technos.mjs`, écrit par
// `node zohshia/publier.mjs`) : aucune base, aucun appel sortant. Elle ne porte
// ni nom propre, ni valeur, ni secret — le générateur refuse sinon.
//
// Import STATIQUE depuis `./_lib/` : c'est ce que le traceur de Vercel suit pour
// embarquer le fichier (même raison que /api/finubar).
import donnee from './_lib/zohshia-technos.mjs';
import { requireProprietaire } from './_lib/proprietaire.js';
import { ok, fail, methodNotAllowed } from './_lib/http.js';

const ALLOWED = ['GET'];

export default async function handler(req, res, options = {}) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const r = await requireProprietaire(req, options);
  if (r.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (r.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  if (r.status === 'reserve_non_regle') return fail(res, 503, 'Accès réservé non réglé');
  if (r.status !== 'ok') return fail(res, 403, 'Accès réservé');

  return ok(res, donnee);
}
