// POST /api/leo — la voix de Léo (boucle L2) : conversation du cartouche.
// Corps : { quadrant, messages: [{ role: 'user'|'assistant', content }] }.
// Réponse : { ok: true, data: { reponse } }.
//
// Sécurité (CADRAGE-LEO-SITE §3) :
//  - requireUser fail-closed : pas de session valide → 401, jamais de dégradé.
//  - Clé API Claude en env Vercel UNIQUEMENT (ANTHROPIC_API_KEY) ; absente →
//    503 explicite « voix non branchée » (la gate coût reste à Paul).
//  - Minimisation : seul l'historique du cartouche part vers l'IA — jamais de
//    dump de données ; le prompt système ne contient aucune donnée personnelle.
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
  extraireTexte
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

  const systeme = construireSysteme(corps.quadrant);
  if (!systeme) return fail(res, 400, 'Quadrant inconnu');

  const conversation = validerConversation(corps.messages);
  if (!conversation.ok) return fail(res, 400, 'Conversation invalide');

  const client = new Anthropic({ apiKey: cle, timeout: TIMEOUT_MS, maxRetries: 1 });
  try {
    const reponse = await client.messages.create({
      model: process.env.LEO_MODELE || LEO_MODELE,
      max_tokens: MAX_TOKENS_REPONSE,
      // Le système est stable par quadrant : cacheable (≈ -90 % sur le préfixe).
      system: [{ type: 'text', text: systeme, cache_control: { type: 'ephemeral' } }],
      messages: conversation.messages
    });
    const texte = extraireTexte(reponse.content);
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
