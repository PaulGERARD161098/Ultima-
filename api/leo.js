// POST /api/leo — la voix de Léo (boucle L2) : conversation du cartouche.
// Corps : { quadrant, messages: [{ role: 'user'|'assistant', content }],
//           etat? } — `etat` (les yeux de Léo) = comptes et intitulés bornés,
// calculés par le front sur les données déjà chargées ; jamais de contenu.
// Réponse : { ok: true, data: { reponse } }.
//
// Sécurité (CADRAGE-LEO-SITE §3) :
//  - requireUser fail-closed : pas de session valide → 401, jamais de dégradé.
//  - Clé API Claude en env Vercel UNIQUEMENT (ANTHROPIC_API_KEY) ; absente →
//    503 explicite « voix non branchée » (la gate coût reste à Paul).
//  - Minimisation : l'historique du cartouche et, si le front l'envoie, l'ÉTAT
//    borné du quadrant (comptes + intitulés, validés ici) — jamais de dump, ni
//    d'identifiant, ni le contenu d'une page, d'une flamme ou d'un scénario.
//  - Timeout sortant borné, une seule relance ; erreurs génériques client,
//    détail (statut/nom d'erreur seulement, jamais le contenu) en logs serveur.
//  - Plafond de coût par appel : MAX_TOKENS_REPONSE + bornes d'historique.

import Anthropic from '@anthropic-ai/sdk';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';
import { requireUser } from './_lib/supabase.js';
import {
  LEO_MODELE,
  MAX_TOKENS_REPONSE,
  construireSysteme,
  validerConversation,
  creerGardeVoix,
  extraireTexte,
  outilsPour,
  normaliserQuadrant,
  extraireProposition,
  validerProposition,
  reformulerProposition,
  validerEtatQuadrant,
  decrireEtat
} from './_lib/leo.js';

const TIMEOUT_MS = 30_000; // appel IA sortant borné (au-dessus : 502 générique)

// S-L2-1 : endpoint FACTURÉ → au plus un appel par utilisateur par 3 s
// (par-dessus le rate-limit global 60/min/IP du middleware, qui ne borne
// pas le coût). Best-effort par instance ; plafond dur = console Anthropic.
const gardeVoix = creerGardeVoix(3000);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const auth = await requireUser(req);
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');

  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return fail(res, 503, "La voix de Léo n'est pas encore branchée");

  if (!gardeVoix(auth.user.id)) return fail(res, 429, 'Trop de requêtes');

  const corps = await readJsonBody(req);
  if (corps === null || corps === 'too_large') return bodyFail(res, corps);

  // L2b : catalogue d'outils du quadrant (null si vide → appel L2 inchangé).
  // Les outils ne font que PROPOSER : cette route n'écrit jamais rien.
  // Un seul point de normalisation : tout ce qui suit raisonne sur l'identifiant
  // courant, jamais sur l'alias — sinon validerProposition rejetterait un outil
  // de RIVEN venu d'un front qui dit encore « traveler ».
  const quadrant = normaliserQuadrant(corps.quadrant);
  const outils = outilsPour(quadrant);
  const systeme = construireSysteme(quadrant, outils !== null);
  if (!systeme) return fail(res, 400, 'Quadrant inconnu');

  const conversation = validerConversation(corps.messages);
  if (!conversation.ok) return fail(res, 400, 'Conversation invalide');

  // Les yeux de Léo : l'état du quadrant, calculé et borné par le front.
  // Fail-closed : une forme inattendue fait échouer l'appel, jamais un
  // rattrapage silencieux. Absent → l'appel repart exactement comme avant.
  const verdictEtat = validerEtatQuadrant(corps.etat);
  if (!verdictEtat.ok) return fail(res, 400, 'État de quadrant invalide');
  const texteEtat = decrireEtat(verdictEtat.etat);

  const client = new Anthropic({ apiKey: cle, timeout: TIMEOUT_MS, maxRetries: 1 });
  try {
    const reponse = await client.messages.create({
      model: process.env.LEO_MODELE || LEO_MODELE,
      max_tokens: MAX_TOKENS_REPONSE,
      // Le système est stable par quadrant : cacheable (≈ -90 % sur le préfixe).
      // L'état, lui, change à chaque tour : second bloc, HORS cache, pour ne
      // pas invalider le préfixe stable.
      system: [
        { type: 'text', text: systeme, cache_control: { type: 'ephemeral' } },
        ...(texteEtat ? [{ type: 'text', text: texteEtat }] : [])
      ],
      // Spread conditionnel : pas de champ tools quand le catalogue est vide.
      ...(outils ? { tools: outils } : {}),
      messages: conversation.messages
    });
    const texte = extraireTexte(reponse.content);
    // L2b : un tool_use devient une PROPOSITION validée + reformulée côté
    // serveur (rendu déterministe de la carte de confirmation — jamais la
    // prose du modèle). On ne renvoie JAMAIS de tool_result au modèle ici :
    // la boucle se referme au tour suivant par le message d'issue du front.
    const blocOutil = extraireProposition(reponse.content);
    if (blocOutil) {
      const verdict = validerProposition(blocOutil.name, blocOutil.input, quadrant);
      if (verdict.ok) {
        return ok(res, {
          reponse: texte,
          proposition: {
            outil: verdict.proposition.outil,
            args: verdict.proposition.args,
            reformulation: reformulerProposition(verdict.proposition),
            // B1 ④ : information d'INTERFACE (carte ou exécution directe),
            // jamais une autorité — /api/leo/ecritures re-décide depuis le
            // catalogue avant de rendre la moindre trace.
            anneau: verdict.anneau
          }
        });
      }
      // Proposition douteuse : jamais servie au client — repli sur le texte
      // seul (nom d'outil en log, JAMAIS les arguments : zéro contenu dicté).
      logError('leo.mains.invalide', typeof blocOutil.name === 'string' ? blocOutil.name : 'inconnu');
    }
    if (!texte) {
      logError('leo.voix.vide', reponse.stop_reason || '');
      return fail(res, 502, "Léo n'a pas pu répondre");
    }
    return ok(res, { reponse: texte });
  } catch (erreur) {
    // Jamais le contenu ni le message brut : statut HTTP ou nom d'erreur.
    logError('leo.voix', erreur?.status || erreur?.name || 'erreur');
    return fail(res, 502, "Léo n'a pas pu répondre");
  }
}
