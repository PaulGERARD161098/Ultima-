// GET /api/finubar → { ok:true, data:{ le, projets, macro, cartouche, constellation } }
//
// Sert l'état agrégé des huit dépôts, DERRIÈRE AUTH. Ce n'est pas de la PII,
// mais c'est la feuille de route complète du business : les jalons, les
// blocages, ce qui n'a jamais tourné. Ça ne se sert pas en public — et le
// middleware ne peut pas authentifier un fichier statique (la session Supabase
// vit en localStorage, invisible de l'edge). D'où : une route, `requireProprietaire`,
// et AUCUN fichier de Finubar servi en statique.
//
// La donnée est FIGÉE AU COMMIT : elle vient de `api/_lib/finubar-macro.mjs`,
// écrit par `node finubar/collecter.mjs` et versionné (jumeau lisible :
// `finubar/macro.json`). Aucune base, aucun secret, aucun
// appel sortant — donc rien à surveiller, rien à faire tourner, et un coût nul.
// Le prix de ce choix est assumé et affiché à l'écran : la page dit la DATE de
// la collecte. Un pilotage qui ne dit pas de quand il date est un piège.
//
// ⚠️ Import statique depuis `./_lib/` — et les deux comptent.
// STATIQUE (et non `readFileSync`) : c'est ce que le traceur de fichiers de
// Vercel suit pour embarquer un fichier dans le paquet de la fonction.
// DEPUIS `./_lib/` : c'est le motif qu'utilisent les dix autres routes de ce
// dépôt, éprouvé en production. Un import qui sort de l'arbre `api/` passe la
// revue locale et peut rendre 500 une fois déployé — on ne prend pas ce pari
// sur la seule pièce qu'aucun harnais local ne peut vérifier.

import macro from './_lib/finubar-macro.mjs';
import { requireProprietaire } from './_lib/proprietaire.js';
import { ok, fail, methodNotAllowed } from './_lib/http.js';

const ALLOWED = ['GET'];

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  // ⛔ PROPRIÉTAIRE SEULEMENT depuis le 04/10/2026. Mesuré ce jour-là :
  // l'inscription au projet d'authentification est OUVERTE (e-mail, Google).
  // `requireUser` laissait donc n'importe quel compte fraîchement créé lire la
  // feuille de route de toute l'activité. Fermé par défaut sans réglage.
  const result = await requireProprietaire(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  if (result.status === 'reserve_non_regle') return fail(res, 503, 'Accès réservé non réglé');
  if (result.status !== 'ok') return fail(res, 403, 'Accès réservé');

  return ok(res, macro);
}
