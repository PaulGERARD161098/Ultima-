// POST /api/leo — la voix de Léo (boucle L2) : conversation du cartouche.
// Corps : { quadrant, messages: [{ role: 'user'|'assistant', content }],
//           etat? } — `etat` (les yeux de Léo) = comptes et intitulés bornés,
// calculés par le front sur les données déjà chargées ; jamais de contenu.
// Réponse : { ok: true, data: { reponse } }.
//
// Sécurité (CADRAGE-LEO-SITE §3) :
//  - requireProprietaire fail-closed (W2, audit du 05/10) : route FACTURÉE,
//    réservée aux comptes de ULTIMA_PROPRIETAIRES ; session absente → 401,
//    réglage absent → 503, autre compte → 403, AVANT tout appel Anthropic.
//  - W1 : interrupteur LEO_ECRITURES_AUTO, fermé par défaut — sauf la valeur
//    exacte 'actives', toute proposition est servie en orange (carte de
//    confirmation), jamais en exécution directe.
//  - Clé API Claude en env Vercel UNIQUEMENT (ANTHROPIC_API_KEY) ; absente →
//    503 explicite « voix non branchée » (la gate coût reste à Paul).
//  - Minimisation : l'historique du cartouche et, si le front l'envoie, l'ÉTAT
//    borné du quadrant (comptes + intitulés, validés ici) — jamais de dump, ni
//    d'identifiant, ni le contenu d'une page, d'une flamme ou d'un scénario.
//  - Timeout sortant borné, AUCUNE relance (chaque relance serait une requête
//    facturée hors plafond) ; erreurs génériques client, détail (statut/nom
//    d'erreur seulement, jamais le contenu) en logs serveur.
//  - Bornes par appel + PLAFOND D'APPELS par 24 h (`_lib/leo-appels.js`).

import Anthropic from '@anthropic-ai/sdk';
import { ok, fail, methodNotAllowed, logError, readJsonBody, bodyFail } from './_lib/http.js';
import { requireProprietaire } from './_lib/proprietaire.js';
import { ecrituresAutoCoupees } from './_lib/leo-execution.js';
import { ouvrirAppel, cloreAppel } from './_lib/leo-appels.js';
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
  anneauInterface,
  causeEchecIA,
  joindreEtatConversation
} from './_lib/leo.js';

const TIMEOUT_MS = 30_000; // appel IA sortant borné (au-dessus : 502 générique)

// S-L2-1 : endpoint FACTURÉ → au plus un appel par utilisateur par 3 s
// (par-dessus le rate-limit global 60/min/IP du middleware, qui ne borne
// pas le coût). Best-effort par instance ; plafond dur = console Anthropic.
const gardeVoix = creerGardeVoix(3000);

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const auth = await requireProprietaire(req);
  if (auth.status === 'unconfigured') return fail(res, 503, 'Service non configuré');
  if (auth.status === 'unauthenticated') return fail(res, 401, 'Authentification requise');
  if (auth.status === 'reserve_non_regle') return fail(res, 503, 'Accès réservé non réglé');
  if (auth.status !== 'ok') return fail(res, 403, 'Accès réservé');

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
  const messages = joindreEtatConversation(conversation.messages, verdictEtat.etat);

  // LE PLAFOND D'APPELS (19/10) : la ligne 'tentee' est posée AVANT le coût, et
  // c'est elle qui compte (cf. `leo-appels.js`, migration `leo_appels`).
  // ⛔ Après TOUTES les validations : une requête invalide ne consomme pas le
  // plafond. Seul le refus du plafond arrête Léo (429) ; toute autre panne du
  // journal dégrade vers un plafond local, dit en log.
  const modele = process.env.LEO_MODELE || LEO_MODELE;
  const appel = await ouvrirAppel(auth.client, { quadrant, modele, proprietaire: auth.user.id });
  if (!appel.ok) return fail(res, appel.status, appel.message, { cause: appel.cause });
  // Repli local (journal injoignable) : dit dans la réponse, pour que le front
  // puisse l'afficher — un plafond plus bas que celui de la base ne se subit pas en silence.
  const journal = appel.mode === 'local' ? { journal: 'local' } : {};

  // ⛔ maxRetries 0 : une relance du SDK est une REQUÊTE FACTURÉE de plus que la
  // ligne 'tentee' ne compte pas. Un échec se rejoue par un nouvel appel de
  // Paul, donc par un nouveau passage au plafond.
  const client = new Anthropic({ apiKey: cle, timeout: TIMEOUT_MS, maxRetries: 0 });
  try {
    const reponse = await client.messages.create({
      model: modele,
      max_tokens: MAX_TOKENS_REPONSE,
      // Seules les règles écrites côté serveur ont autorité système.
      system: [
        { type: 'text', text: systeme, cache_control: { type: 'ephemeral' } }
      ],
      // Spread conditionnel : pas de champ tools quand le catalogue est vide.
      ...(outils ? { tools: outils } : {}),
      messages
    });
    // L'appel est payé : son issue et ses tokens sont posés, best-effort (un
    // échec du journal ne change rien pour Paul). Les tokens, jamais le contenu.
    await cloreAppel(auth.client, appel.traceId, {
      phase: 'reussie', usage: reponse.usage, quadrant, modele
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
          ...journal,
          proposition: {
            outil: verdict.proposition.outil,
            args: verdict.proposition.args,
            reformulation: reformulerProposition(verdict.proposition),
            // B1 ④ : information d'INTERFACE (carte ou exécution directe),
            // jamais une autorité — /api/leo/ecritures re-décide depuis le
            // catalogue avant de rendre la moindre trace. Orange dès qu'une
            // cible n'a pas été nommée par Paul lui-même (S2).
            anneau: ecrituresAutoCoupees() ? 'orange'
              : anneauInterface(verdict.anneau, verdict.proposition,
                conversation.messages[conversation.messages.length - 1].content)
          }
        });
      }
      // Proposition douteuse : jamais servie au client — repli sur le texte
      // seul (nom d'outil en log, JAMAIS les arguments : zéro contenu dicté).
      logError('leo.mains.invalide', typeof blocOutil.name === 'string' ? blocOutil.name : 'inconnu');
    }
    if (!texte) {
      logError('leo.voix.vide', reponse.stop_reason || '');
      return fail(res, 502, "Léo n'a pas pu répondre", { cause: 'ia vide' });
    }
    return ok(res, { reponse: texte, ...journal });
  } catch (erreur) {
    await cloreAppel(auth.client, appel.traceId, { phase: 'echouee', quadrant, modele });
    // Jamais le contenu ni le message brut : statut HTTP ou nom d'erreur.
    logError('leo.voix', erreur?.status || erreur?.name || 'erreur');
    // La cause, en mots fermés, pour que Paul la voie (diagnostic du 02/10).
    return fail(res, 502, "Léo n'a pas pu répondre", { cause: causeEchecIA(erreur) });
  }
}
