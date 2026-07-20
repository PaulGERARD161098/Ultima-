// POST /api/leo — la voix (L2) et les mains (L2b) de Léo.
// Corps : { quadrant, messages: [{ role: 'user'|'assistant', content }] }
//   → conversation : { ok:true, data:{ reponse } }
//   → proposition d'écriture : { ok:true, data:{ reponse, action:{outil,
//     arguments, resume} } } — RIEN n'est écrit à ce stade.
// Corps : { quadrant, action: { outil, arguments }, confirme: true }
//   → exécution CONFIRMÉE par Paul : { ok:true, data:{ reponse,
//     action_executee } } — chemin déterministe, AUCUN appel IA.
//
// Sécurité (CADRAGE-LEO-SITE §3 + §4-L2b) :
//  - requireUser fail-closed avant tout traitement ; RLS via le JWT de Paul.
//  - Clé API Claude en env Vercel UNIQUEMENT ; absente → 503 « voix non
//    branchée » (gate coût Paul). Garde de débit 1 appel IA / 3 s / user.
//  - Outils : lectures exécutées dans la boucle (minimisées) ; écritures
//    jamais exécutées par l'IA — proposition puis confirmation explicite,
//    revalidée par les validateurs CRUD et exécutée sous le JWT de Paul
//    (même autorité que les API directes : aucune escalade possible).
//  - Boucle IA bornée (MAX_TOURS_OUTILS) ; timeout par appel ; erreurs
//    génériques client ; logs sans contenu de conversation.

import Anthropic from '@anthropic-ai/sdk';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';
import { requireUser, isAuthError } from './_lib/supabase.js';
import {
  LEO_MODELE,
  MAX_TOKENS_REPONSE,
  construireSysteme,
  validerConversation,
  creerGardeVoix,
  extraireTexte
} from './_lib/leo.js';
import {
  DEFINITIONS_OUTILS,
  estOutilLecture,
  estOutilEcriture,
  validerAction,
  resumerAction,
  resoudreCible,
  executerLecture,
  executerEcriture
} from './_lib/leo-outils.js';

// S-L2b-3 : 3 tours × 20 s restent sous la limite d'exécution Vercel (60 s).
const TIMEOUT_MS = 20_000; // par appel IA sortant (au-dessus : 502 générique)
const MAX_TOURS_OUTILS = 3; // appels IA max par requête (coût et durée bornés)

// S-L2-1 : endpoint FACTURÉ → au plus un appel par utilisateur par 3 s
// (par-dessus le rate-limit global 60/min/IP du middleware, qui ne borne
// pas le coût). Best-effort par instance ; plafond dur = console Anthropic.
const gardeVoix = creerGardeVoix(3000);

// Erreur d'exécution d'écriture → réponse générique (jamais le détail SQL).
function ecritureFail(res, erreur, contexte) {
  if (isAuthError(erreur)) return fail(res, 401, 'Authentification requise');
  const code = erreur?.code || '';
  logError(contexte, code || erreur?.name || 'erreur');
  // FK inexistante/non possédée, CHECK, doublon : la cible n'est pas bonne.
  if (code === '23503' || code === '23514' || code === '23505') {
    return fail(res, 400, "L'action ne peut pas s'appliquer");
  }
  return fail(res, 500, 'Erreur interne');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const auth = await requireUser(req);
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status !== 'ok') return fail(res, 401, 'Authentification requise');

  const corps = await readJsonBody(req);
  if (corps === null || corps === 'too_large') return bodyFail(res, corps);

  const systeme = construireSysteme(corps.quadrant);
  if (!systeme) return fail(res, 400, 'Quadrant inconnu');

  // ---- Chemin CONFIRMATION (L2b) : déterministe, zéro IA, zéro clé requise.
  // Paul a validé la plaque : on revalide l'action (parité CRUD) et on
  // exécute sous son JWT. Un `action` non confirmé n'exécute jamais rien.
  if (corps.action !== undefined) {
    if (corps.confirme !== true) return fail(res, 400, 'Action non confirmée');
    const outil = corps.action && corps.action.outil;
    if (!estOutilEcriture(outil)) return fail(res, 400, 'Action inconnue');
    const validation = validerAction(outil, corps.action.arguments);
    if (!validation.ok) return fail(res, 400, 'Action invalide');
    try {
      const resultat = await executerEcriture(outil, validation.valeurs, auth.client);
      // Réponse NEUTRE (sans cible résolue) : ce texte entre dans l'historique
      // de conversation et repartira vers l'IA — les noms du réseau, jamais.
      return ok(res, {
        reponse: 'C’est fait. ' + resumerAction(outil, validation.valeurs),
        action_executee: { outil, resultat }
      });
    } catch (erreur) {
      return ecritureFail(res, erreur, 'leo.action.' + outil);
    }
  }

  // ---- Chemin CONVERSATION (L2 + boucle d'outils L2b).
  const cle = process.env.ANTHROPIC_API_KEY;
  if (!cle) return fail(res, 503, "La voix de Léo n'est pas encore branchée");

  if (!gardeVoix(auth.user.id)) return fail(res, 429, 'Trop de requêtes');

  const conversation = validerConversation(corps.messages);
  if (!conversation.ok) return fail(res, 400, 'Conversation invalide');

  const client = new Anthropic({ apiKey: cle, timeout: TIMEOUT_MS, maxRetries: 1 });
  // L'historique du client est TEXTE seulement ; les échanges d'outils
  // vivent le temps de cette requête (l'API est sans état, rien n'est gardé).
  const messagesIA = conversation.messages.slice();

  try {
    for (let tour = 0; tour < MAX_TOURS_OUTILS; tour++) {
      const reponse = await client.messages.create({
        model: process.env.LEO_MODELE || LEO_MODELE,
        max_tokens: MAX_TOKENS_REPONSE,
        // Le système est stable par quadrant : cacheable (≈ -90 % sur le préfixe).
        system: [{ type: 'text', text: systeme, cache_control: { type: 'ephemeral' } }],
        tools: DEFINITIONS_OUTILS,
        messages: messagesIA
      });

      const appels = (reponse.content || []).filter((b) => b && b.type === 'tool_use');
      const texte = extraireTexte(reponse.content);

      // Pas d'outil : la réponse est le texte (fin normale).
      if (appels.length === 0) {
        if (!texte) {
          logError('leo.voix.vide', reponse.stop_reason || '');
          return fail(res, 502, "Léo n'a pas pu répondre");
        }
        return ok(res, { reponse: texte });
      }

      // Une écriture demandée : on S'ARRÊTE et on propose (jamais exécutée ici).
      const ecriture = appels.find((a) => estOutilEcriture(a.name));
      if (ecriture) {
        const validation = validerAction(ecriture.name, ecriture.input);
        // S-L2b-1 : la cible est résolue SOUS RLS en libellé humain — la
        // plaque montre à Paul SUR QUOI l'action s'applique (et prouve dès
        // la proposition que la cible existe et lui appartient).
        const resolution = validation.ok
          ? await resoudreCible(ecriture.name, validation.valeurs, auth.client)
          : null;
        if (validation.ok && resolution.ok) {
          const resume = resumerAction(ecriture.name, validation.valeurs, resolution.cibles);
          return ok(res, {
            reponse: texte || 'Je te propose ceci — à confirmer.',
            action: { outil: ecriture.name, arguments: validation.valeurs, resume }
          });
        }
        // Arguments invalides ou cible introuvable : renvoyés à l'IA pour
        // correction (un tour de plus, jamais d'action proposée à l'aveugle).
        const motif = validation.ok
          ? 'Cible introuvable : relis les données avec un outil de lecture'
          : 'Arguments invalides : ' + validation.erreur;
        messagesIA.push({ role: 'assistant', content: reponse.content });
        messagesIA.push({
          role: 'user',
          content: appels.map((a) => ({
            type: 'tool_result',
            tool_use_id: a.id,
            content: a.id === ecriture.id
              ? motif
              : 'Appel non traité (une action à la fois)',
            is_error: true
          }))
        });
        continue;
      }

      // Lectures seulement : exécutées sous RLS, résultats renvoyés à l'IA.
      const resultats = [];
      for (const appel of appels) {
        if (!estOutilLecture(appel.name)) {
          resultats.push({
            type: 'tool_result', tool_use_id: appel.id,
            content: 'Outil inconnu', is_error: true
          });
          continue;
        }
        try {
          const donnees = await executerLecture(appel.name, auth.client);
          resultats.push({
            type: 'tool_result', tool_use_id: appel.id,
            content: JSON.stringify(donnees)
          });
        } catch (erreur) {
          if (isAuthError(erreur)) return fail(res, 401, 'Authentification requise');
          logError('leo.lecture.' + appel.name, erreur?.code || erreur?.name || 'erreur');
          resultats.push({
            type: 'tool_result', tool_use_id: appel.id,
            content: 'Lecture indisponible', is_error: true
          });
        }
      }
      messagesIA.push({ role: 'assistant', content: reponse.content });
      messagesIA.push({ role: 'user', content: resultats });
    }

    // Plafond de tours atteint : réponse sincère, sans détail interne.
    logError('leo.voix.tours', 'plafond');
    return ok(res, {
      reponse: 'Je n’ai pas réussi à conclure ce tour-ci — redis-le moi plus simplement.'
    });
  } catch (erreur) {
    // Jamais le contenu ni le message brut : statut HTTP ou nom d'erreur.
    logError('leo.voix', erreur?.status || erreur?.name || 'erreur');
    return fail(res, 502, "Léo n'a pas pu répondre");
  }
}
