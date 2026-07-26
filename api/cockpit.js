// /api/cockpit — les résumés vivants de la boussole (LV2-⑤), derrière auth (RLS).
//   GET → { ok:true, data:{ reshiram:{…}, zekrom:{…}, riven:{…} } }
//         UNIQUEMENT des AGRÉGATS (des comptes), jamais de contenu ni de PII :
//         la boussole n'affiche que « N talents, M à étayer », « N relances dues ».
//         §5 CADRAGE-CONSOLE : la couche cockpit ne sert que des agrégats
//         derrière auth ; aucune donnée introspective/finance en clair.
// Chaque compte est une requête head+count (payload minimal), filtrée par la RLS
// (owner uniquement). Les vues sont en security_invoker → comptent sous le jeton.
// v2 palier A (§2bis.1) : signaux sur la donnée DÉJÀ en base (aucune gate) —
//   riven.relances_dues alimente le badge du cap Ultima ; reshiram.a_etayer et
//   zekrom.a_orienter (déjà comptés) sont promus en badges côté boussole.

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

  // RIVEN — relances dues (v2 palier A) : entrées `journal` avec une date de
  // relance échue (relance_at <= aujourd'hui) et non encore traitée. Filtre
  // date → pas exprimable via `compter` (qui ne fait que .eq) : requête dédiée,
  // même forme head+count minimale, sous la RLS (owner only). Les entrées sans
  // relance_at (NULL) sont naturellement exclues (NULL n'est <= à rien).
  async function compterRelancesDues() {
    const aujourdhui = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ (UTC)
    const { count, error } = await client
      .from('journal')
      .select('*', { count: 'exact', head: true })
      .lte('relance_at', aujourdhui)
      .eq('relance_faite', false);
    if (error) { return { count: 0, error }; }
    return { count: count || 0, error: null };
  }

  try {
    const [
      talents, talentsAEtayer,
      ideaux, ideauxAOrienter,
      liensAcquis, liensAConstruire,
      relancesDues,
    ] = await Promise.all([
      compter(client, 'talents_etat'),
      compter(client, 'talents_etat', 'a_etayer', true),
      compter(client, 'ideaux_etat'),
      compter(client, 'ideaux_etat', 'a_orienter', true),
      compter(client, 'passerelles', 'nature', 'acquis'),
      compter(client, 'passerelles', 'nature', 'a_construire'),
      compterRelancesDues(),
    ]);

    // Une seule erreur d'auth → 401 fail-closed (jamais d'agrégat partiel douteux).
    const premiere = [talents, talentsAEtayer, ideaux, ideauxAOrienter,
      liensAcquis, liensAConstruire, relancesDues].map((r) => r.error).find(Boolean);
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
      riven: {
        relances_dues: relancesDues.count,
      },
    });
  } catch (err) {
    logError('cockpit:exception', err?.name);
    return fail(res, 500, 'Erreur interne');
  }
}
