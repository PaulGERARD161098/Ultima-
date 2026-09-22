// /api/reseau/import — import par lots de PERSONNES (RIVEN, CADRAGE-RIVEN-IMPORT.md).
// POST uniquement. { personnes: [ { nom, fonction?, telephone?, email?, notes?, node_id? } ] }
// ≤ 100 lignes par appel. La logique vit dans _lib/import-personnes.js ; ce
// handler ne fait qu'authentifier, lire le corps et traduire le verdict.
// Logs : un contexte et un code d'erreur, jamais une ligne importée.

import { requireUser, isAuthError } from '../_lib/supabase.js';
import { ok, fail, bodyFail, methodNotAllowed, logError, readJsonBody } from '../_lib/http.js';
import { importerPersonnes } from '../_lib/import-personnes.js';

const ALLOWED = ['POST'];

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  try {
    const body = await readJsonBody(req);
    if (body === null || typeof body !== 'object') return bodyFail(res, body);

    const verdict = await importerPersonnes(result.client, body);
    if (verdict.status === 200) return ok(res, verdict.data);
    if (verdict.dbError) {
      if (isAuthError(verdict.dbError)) return fail(res, 401, 'Authentification requise');
      logError(verdict.context, verdict.dbError.code);
    }
    return fail(res, verdict.status, verdict.error);
  } catch (err) {
    logError('import:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
