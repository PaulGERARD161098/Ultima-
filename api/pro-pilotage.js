// /api/pro-pilotage — pilotage multi-structures (Option A — Boucle 1).
//   GET  ?scope=direction               → synthèse consolidée des 3 structures
//   GET  ?scope=renoboost-ia|sola-air-paris|amo → vue strictement cloisonnée
//   POST { ressource, structure_id, … } → création dans UNE structure explicite
//   PATCH { ressource, id, structure_id, … } → mise à jour scopée à la structure
//
// Pas de DELETE : suppression réelle = rouge (gate).
// Cloisonnement strict : jamais d'écriture en scope `direction`, jamais de
// lecture croisée en vue structure (double filtre SQL + garde serveur).

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';
import {
  STRUCTURES_PRO,
  VUE_DIRECTION,
  normaliserScopePro,
  validerCreationTache,
  validerMajTache,
  validerCreationDossier,
  validerMajDossier,
  validerCreationDocument,
  validerFilLeo,
  filtrerParStructure,
  synthetiserDirection
} from './_lib/structures-pro.mjs';

const TABLE_ABSENTE = new Set(['PGRST205', '42P01']);

const COL_TACHES = 'id, structure_id, titre, type, priorite, statut, echeance, contact_ref, notes, created_at, updated_at';
const COL_DOSSIERS = 'id, structure_id, titre, statut, synthese, prochaine_action, created_at, updated_at';
const COL_DOCUMENTS = 'id, structure_id, dossier_id, type, titre, contenu, created_at, updated_at';

function erreurBase(res, contexte, error) {
  if (isAuthError(error)) return fail(res, 401, 'Authentification requise');
  if (TABLE_ABSENTE.has(error?.code)) {
    logError(`${contexte}:table-absente`, error.code);
    return fail(res, 503, 'Service non configuré', { cause: 'pilotage pro non installé' });
  }
  if (error?.code === '23503') {
    return fail(res, 400, 'Dossier inexistant ou hors de cette structure');
  }
  logError(contexte, error?.code);
  return fail(res, 500, 'Erreur interne');
}

export function creerHandler({ authentifier = requireUser } = {}) {
  return async function handler(req, res) {
    if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
      return methodNotAllowed(res, ['GET', 'POST', 'PATCH']);
    }

    const auth = await authentifier(req);
    if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
    if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');
    const { client } = auth;

    try {
      if (req.method === 'GET') {
        const scopeBrut = req.query?.scope ?? VUE_DIRECTION;
        const scope = normaliserScopePro(scopeBrut);
        if (!scope) return fail(res, 400, 'Périmètre professionnel inconnu');

        if (req.query?.ressource === 'fil') {
          const { data, error } = await client.from('pro_fils_leo')
            .select('scope, messages, updated_at')
            .eq('scope', scope)
            .maybeSingle();
          if (error) return erreurBase(res, 'pro-pilotage:fil:lire', error);
          const messages = data && data.scope === scope && Array.isArray(data.messages) ? data.messages : [];
          return ok(res, { scope, messages, updated_at: data?.updated_at || null });
        }

        if (scope === VUE_DIRECTION) {
          const [rTaches, rDossiers, rDocs] = await Promise.all([
            client.from('pro_taches').select('id, structure_id, titre, type, priorite, statut, echeance'),
            client.from('pro_dossiers').select('id, structure_id, statut'),
            client.from('pro_documents').select('id, structure_id')
          ]);
          if (rTaches.error) return erreurBase(res, 'pro-pilotage:direction:taches', rTaches.error);
          if (rDossiers.error) return erreurBase(res, 'pro-pilotage:direction:dossiers', rDossiers.error);
          if (rDocs.error) return erreurBase(res, 'pro-pilotage:direction:documents', rDocs.error);
          return ok(res, synthetiserDirection({
            taches: rTaches.data || [],
            dossiers: rDossiers.data || [],
            documents: rDocs.data || []
          }));
        }

        // Vue structure strictement cloisonnée : filtre SQL + garde défensive serveur.
        const [rTaches, rDossiers, rDocs] = await Promise.all([
          client.from('pro_taches').select(COL_TACHES).eq('structure_id', scope)
            .order('echeance', { ascending: true, nullsFirst: false }),
          client.from('pro_dossiers').select(COL_DOSSIERS).eq('structure_id', scope)
            .order('updated_at', { ascending: false }),
          client.from('pro_documents').select(COL_DOCUMENTS).eq('structure_id', scope)
            .order('created_at', { ascending: false })
        ]);
        if (rTaches.error) return erreurBase(res, 'pro-pilotage:structure:taches', rTaches.error);
        if (rDossiers.error) return erreurBase(res, 'pro-pilotage:structure:dossiers', rDossiers.error);
        if (rDocs.error) return erreurBase(res, 'pro-pilotage:structure:documents', rDocs.error);

        return ok(res, {
          scope,
          structure: STRUCTURES_PRO[scope],
          taches: filtrerParStructure(rTaches.data || [], scope),
          dossiers: filtrerParStructure(rDossiers.data || [], scope),
          documents: filtrerParStructure(rDocs.data || [], scope)
        });
      }

      const corps = await readJsonBody(req);
      if (corps === null || corps === 'too_large' || typeof corps !== 'object' || Array.isArray(corps)) {
        return bodyFail(res, corps);
      }

      if (req.method === 'POST') {
        if (corps.ressource === 'tache') {
          const v = validerCreationTache(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_taches')
            .insert(v.donnees).select(COL_TACHES).single();
          if (error) return erreurBase(res, 'pro-pilotage:creer-tache', error);
          return ok(res, { tache: data });
        }
        if (corps.ressource === 'dossier') {
          const v = validerCreationDossier(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_dossiers')
            .insert(v.donnees).select(COL_DOSSIERS).single();
          if (error) return erreurBase(res, 'pro-pilotage:creer-dossier', error);
          return ok(res, { dossier: data });
        }
        if (corps.ressource === 'document') {
          const v = validerCreationDocument(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_documents')
            .insert(v.donnees).select(COL_DOCUMENTS).single();
          if (error) return erreurBase(res, 'pro-pilotage:creer-document', error);
          return ok(res, { document: data });
        }
        if (corps.ressource === 'fil') {
          const v = validerFilLeo(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_fils_leo')
            .upsert(v.donnees, { onConflict: 'owner_id,scope' })
            .select('scope, messages, updated_at')
            .single();
          if (error) return erreurBase(res, 'pro-pilotage:sauver-fil', error);
          return ok(res, { fil: data });
        }
        return fail(res, 400, 'Ressource inconnue');
      }

      if (req.method === 'PATCH') {
        if (corps.ressource === 'tache') {
          const v = validerMajTache(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_taches')
            .update(v.patch).eq('id', v.id).eq('structure_id', v.structure_id)
            .select(COL_TACHES);
          if (error) return erreurBase(res, 'pro-pilotage:maj-tache', error);
          if (!Array.isArray(data) || data.length !== 1) return fail(res, 404, 'Tâche introuvable dans cette structure');
          return ok(res, { tache: data[0] });
        }
        if (corps.ressource === 'dossier') {
          const v = validerMajDossier(corps);
          if (v.erreur) return fail(res, 400, v.erreur);
          const { data, error } = await client.from('pro_dossiers')
            .update(v.patch).eq('id', v.id).eq('structure_id', v.structure_id)
            .select(COL_DOSSIERS);
          if (error) return erreurBase(res, 'pro-pilotage:maj-dossier', error);
          if (!Array.isArray(data) || data.length !== 1) return fail(res, 404, 'Dossier introuvable dans cette structure');
          return ok(res, { dossier: data[0] });
        }
        return fail(res, 400, 'Ressource non modifiable');
      }
    } catch (err) {
      logError('pro-pilotage:exception', err?.name);
      return fail(res, 500, 'Erreur interne');
    }
  };
}

export default creerHandler();
