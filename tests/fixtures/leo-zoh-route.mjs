// Fixture partagée : vrai handler, fournisseur et compte fictifs, aucune socket.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as leo from '../../api/_lib/leo.js';
import { validerInteraction, decrireInteraction, lireReponseInteraction } from '../../js/leo-interaction.mjs';
const routeSource = readFileSync(new URL('../../api/leo.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
assert.ok(routeSource.includes('client.messages.create'), 'handler réellement chargé');
const NOMINAL = [{ type: 'text', text: 'Une brique candidate reste à vérifier pour ce projet.' }];
export function creerRoute({ auth = 'ok', quota = true, content = NOMINAL, panne = false } = {}) {
  const journal = { sdk: [], requetes: [], ouvertures: [], clotures: [], logs: [] };
  class FournisseurFactice {
    constructor(options) {
      journal.sdk.push(options);
      this.messages = { create: async requete => {
        journal.requetes.push(requete);
        if (panne) throw Object.assign(new Error('DETAIL_FOURNISSEUR_PRIVE'), { status: 503 });
        return { content, usage: { input_tokens: 10, output_tokens: 10 } };
      } };
    }
  }
  const deps = {
    ...leo, validerInteraction, decrireInteraction, lireReponseInteraction,
    Anthropic: FournisseurFactice,
    process: { env: { ANTHROPIC_API_KEY: 'cle-fictive-sans-reseau' } },
    requireProprietaire: async () => auth === 'ok'
      ? { status: 'ok', user: { id: '11111111-2222-4333-8444-555555555555' }, client: {} }
      : { status: auth },
    ecrituresAutoCoupees: () => true,
    ouvrirAppel: async (...args) => { journal.ouvertures.push(args); return quota
      ? { ok: true, traceId: 'trace-fictive', mode: 'base' }
      : { ok: false, status: 429, message: 'Plafond', cause: 'ia plafond' }; },
    cloreAppel: async (...args) => { journal.clotures.push(args); },
    readJsonBody: async req => req.body,
    ok: (_res, data) => ({ status: 200, data }),
    fail: (_res, status, message, extra) => ({ status, message, ...extra }),
    methodNotAllowed: () => ({ status: 405 }), bodyFail: () => ({ status: 400 }),
    logError: (...args) => journal.logs.push(args)
  };
  return { handler: new Function(...Object.keys(deps), routeSource)(...Object.values(deps)), journal };
}
