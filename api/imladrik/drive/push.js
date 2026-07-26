// POST /api/imladrik/drive/push — sauvegarde le journal vers le Drive de l'owner
// (sous-boucle ②, UN SEUL SENS Ultima → Drive, à la demande). Un Google Doc par
// page dans le dossier dédié ; idempotent (saute les pages inchangées via un hash
// de contenu). Server-side uniquement, jetons jamais exposés, aucun contenu en log.

import { requireUser, isAuthError } from '../../_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from '../../_lib/http.js';
import {
  driveConfig, decryptToken, refreshAccessToken,
  createDriveFolder, driveCreateDoc, driveUpdateDoc,
  buildEntryFileName, renderEntryText, contentHash,
} from '../../_lib/drive.js';

const NOM_DOSSIER = 'Ultima — Journal IMLADRIK';
const MAX_PAR_RUN = 200; // garde-fou quota : un bug de boucle ne brûle pas le quota

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  const cfg = driveConfig();
  if (!cfg.ok) return fail(res, 503, 'Connexion Drive non configurée');

  try {
    // 1. Jeton Drive de l'utilisateur (RLS → sa propre ligne).
    const { data: tok, error: tokErr } = await client
      .from('imladrik_drive_tokens')
      .select('refresh_token_chiffre, drive_folder_id')
      .maybeSingle();
    if (tokErr) {
      if (isAuthError(tokErr)) return fail(res, 401, 'Authentification requise');
      logError('imladrik:drive:push:tok', tokErr.code);
      return fail(res, 500, 'Erreur interne');
    }
    if (!tok) return fail(res, 400, 'Connecte d’abord ton Google Drive.');

    // 2. access_token frais depuis le refresh_token chiffré.
    let accessToken;
    try {
      accessToken = await refreshAccessToken(cfg, decryptToken(tok.refresh_token_chiffre, cfg.encKey));
    } catch (e) {
      logError('imladrik:drive:push:refresh', e?.name);
      return fail(res, 502, 'Connexion Google expirée. Reconnecte ton Drive.');
    }

    // 3. Dossier dédié (créé au besoin, mémorisé).
    let folderId = tok.drive_folder_id;
    if (!folderId) {
      folderId = await createDriveFolder(accessToken, NOM_DOSSIER);
      await client.from('imladrik_drive_tokens').update({ drive_folder_id: folderId }).not('owner_id', 'is', null);
    }

    // 4. Pages du journal (RLS → les siennes).
    const { data: entrees, error: entErr } = await client
      .from('imladrik_entrees')
      .select('id, titre, contenu, created_at, drive_file_id, drive_content_hash')
      .order('created_at', { ascending: true });
    if (entErr) {
      if (isAuthError(entErr)) return fail(res, 401, 'Authentification requise');
      logError('imladrik:drive:push:list', entErr.code);
      return fail(res, 500, 'Erreur interne');
    }

    const liste = (entrees || []).slice(0, MAX_PAR_RUN);
    const tronque = (entrees || []).length > MAX_PAR_RUN;
    let pousses = 0, inchanges = 0, echoues = 0;

    // 5. Séquentiel (respect du quota / pas de course). Un échec n'arrête pas le run.
    for (const e of liste) {
      const texte = renderEntryText(e);
      const hash = contentHash(texte);
      if (e.drive_file_id && e.drive_content_hash === hash) { inchanges += 1; continue; }
      try {
        let fileId = e.drive_file_id;
        if (fileId) {
          await driveUpdateDoc(accessToken, fileId, texte);
        } else {
          fileId = await driveCreateDoc(accessToken, {
            name: buildEntryFileName(e), text: texte, folderId,
          });
        }
        const { error: upErr } = await client
          .from('imladrik_entrees')
          .update({ drive_file_id: fileId, drive_content_hash: hash, drive_synced_at: new Date().toISOString() })
          .eq('id', e.id);
        if (upErr) { echoues += 1; logError('imladrik:drive:push:anchor', upErr.code); continue; }
        pousses += 1;
      } catch (err) {
        echoues += 1;
        logError('imladrik:drive:push:doc', err?.name); // jamais de contenu
      }
    }

    return ok(res, { pousses, inchanges, echoues, total: (entrees || []).length, tronque });
  } catch (err) {
    logError('imladrik:drive:push:exception', err?.name);
    return fail(res, 502, 'La sauvegarde vers Drive a échoué. Réessaie dans un instant.');
  }
}
