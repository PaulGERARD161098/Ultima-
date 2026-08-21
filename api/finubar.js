// GET /api/finubar → { ok:true, data:{ le, projets, macro, cartouche, constellation } }
//
// Sert l'état agrégé des huit dépôts, DERRIÈRE AUTH. Ce n'est pas de la PII,
// mais c'est la feuille de route complète du business : les jalons, les
// blocages, ce qui n'a jamais tourné. Ça ne se sert pas en public — et le
// middleware ne peut pas authentifier un fichier statique (la session Supabase
// vit en localStorage, invisible de l'edge). D'où : une route, `requireUser`,
// et AUCUN fichier de Finubar servi en statique.
//
// La donnée est FIGÉE AU COMMIT : elle vient de `finubar/macro.mjs`, écrit par
// `node finubar/collecter.mjs` et versionné. Aucune base, aucun secret, aucun
// appel sortant — donc rien à surveiller, rien à faire tourner, et un coût nul.
// Le prix de ce choix est assumé et affiché à l'écran : la page dit la DATE de
// la collecte. Un pilotage qui ne dit pas de quand il date est un piège.
//
// ⚠️ Import statique (et non `readFileSync`) : c'est le seul motif que le
// traceur de fichiers de Vercel suit à coup sûr. Un `readFileSync` sur un
// chemin calculé passe la revue locale et rend 500 en production, parce que le
// fichier n'est pas embarqué dans le paquet de la fonction.

import macro from '../finubar/macro.mjs';
import { requireUser } from './_lib/supabase.js';
import { ok, fail, methodNotAllowed } from './_lib/http.js';

const ALLOWED = ['GET'];

export default async function handler(req, res) {
  if (!ALLOWED.includes(req.method)) return methodNotAllowed(res, ALLOWED);

  const result = await requireUser(req);
  if (result.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (result.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');

  return ok(res, macro);
}
