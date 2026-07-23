// /api/cockpit — les résumés vivants de la boussole (LV2-⑤), derrière auth (RLS).
//   GET → { ok:true, data:{ reshiram:{…}, zekrom:{…} } }
//         UNIQUEMENT des AGRÉGATS (des comptes), jamais de contenu ni de PII :
//         la boussole n'affiche que « N talents, M à étayer », « N idéaux… ».
//         §5 CADRAGE-CONSOLE : la couche cockpit ne sert que des agrégats
//         derrière auth ; aucune donnée introspective/finance en clair.
// Chaque compte est une requête head+count (payload minimal), filtrée par la RLS
// (owner uniquement). Les vues sont en security_invoker → comptent sous le jeton.

import { requireUser, isAuthError } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed, logError } from './_lib/http.js';

const ALLOWED = ['GET'];

// Compte exact d'une table/vue avec un filtre d'égalité optionnel. Retourne 0 en
// cas d'anomalie (le cockpit se dégrade en « rien à signaler », jamais en erreur).
async function compter(client, source, colonne, valeur) {
  let requete = client.from(source).select('*', { count: 'exact', head: true });
  if (colonne) { requete = requete.eq(colonne, valeur); }
  const { count, error } = await requete;
  if (error) { return { count: 0, error }; }
  return { count: count || 0, error: null };
}

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  const { client } = result;

  try {
    const [
      talents, talentsAEtayer,
      ideaux, ideauxAOrienter,
      liensAcquis, liensAConstruire,
    ] = await Promise.all([
      compter(client, 'talents_etat'),
      compter(client, 'talents_etat', 'a_etayer', true),
      compter(client, 'ideaux_etat'),
      compter(client, 'ideaux_etat', 'a_orienter', true),
      compter(client, 'passerelles', 'nature', 'acquis'),
      compter(client, 'passerelles', 'nature', 'a_construire'),
    ]);

    // Une seule erreur d'auth → 401 fail-closed (jamais d'agrégat partiel douteux).
    const premiere = [talents, talentsAEtayer, ideaux, ideauxAOrienter,
      liensAcquis, liensAConstruire].map((r) => r.error).find(Boolean);
    if (premiere && isAuthError(premiere)) return fail(res, 401, 'Authentification requise');
    if (premiere) { logError('cockpit:get', premiere.code); return fail(res, 500, 'Erreur interne'); }

    return ok(res, {
      reshiram: {
        talents: talents.count,
        a_etayer: talentsAEtayer.count,
        offre: Math.max(0, talents.count - talentsAEtayer.count),
      },
      zekrom: {
        ideaux: ideaux.count,
        a_orienter: ideauxAOrienter.count,
        acquis: liensAcquis.count,
        a_construire: liensAConstruire.count,
      },
    });
  } catch (err) {
    logError('cockpit:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
