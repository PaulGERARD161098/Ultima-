// POST /api/leo/ecritures — le journal des écritures de Léo, B1 ④ (cadrage §13).
// Corps : { etape: 'ouvrir', outil, args, quadrant }
//       | { etape: 'clore', traceId, issue, cibleId?, motif? }
// Réponse : { ok: true, data: { traceId, … } } | { ok: false, error }.
//
// Handler MINCE : il authentifie, lit le corps et traduit le verdict. Toute
// décision vit dans `api/_lib/leo-execution.js`, éprouvé sans base.
//
// Sécurité :
//  - requireUser fail-closed (jeton vérifié auprès d'Auth, pas seulement présent).
//  - L'owner_id n'est jamais reçu : défaut `auth.uid()` + RLS propriétaire.
//  - Aucun contenu dicté n'est journalisé ni loggé : les arguments servent à
//    la garde, puis sont oubliés. Logs = nom d'erreur seulement.
//  - Pas d'appel facturé ici : le plafond de coût (`creerGardeVoix`) reste sur
//    /api/leo ; celui-ci borne le VOLUME d'écritures (`creerPlafondEcritures`).

import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from '../_lib/http.js';
import { requireUser } from '../_lib/supabase.js';
import { ouvrirEcriture, cloreEcriture } from '../_lib/leo-execution.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const auth = await requireUser(req);
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');

  const corps = await readJsonBody(req);
  if (corps === null || corps === 'too_large') return bodyFail(res, corps);
  if (typeof corps !== 'object' || Array.isArray(corps)) return fail(res, 400, 'Demande invalide');

  try {
    const verdict = corps.etape === 'ouvrir'
      ? await ouvrirEcriture(auth.client, auth.user.id, corps)
      : corps.etape === 'clore'
        ? await cloreEcriture(auth.client, auth.user.id, corps)
        : { status: 400, message: 'Demande invalide' };
    if (verdict.status === 200) return ok(res, verdict.data);
    return fail(res, verdict.status, verdict.message);
  } catch (erreur) {
    logError('leo.ecritures', erreur?.name || 'erreur');
    return fail(res, 503, 'Journal indisponible');
  }
}
