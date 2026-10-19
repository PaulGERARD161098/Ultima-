// W1 + W2 (audit du 05/10) : l'interrupteur serveur des écritures automatiques
// et la route facturée réservée au propriétaire. Aucun réseau, SDK ou compte réel.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as leo from '../api/_lib/leo.js';
import { ecrituresAutoCoupees, ouvrirEcriture } from '../api/_lib/leo-execution.js';

const PAUL = '11111111-2222-4333-8444-555555555555';
const IDEE = { etape: 'ouvrir', outil: 'proposer_idee', quadrant: 'adramelech',
  args: { titre: 'Racheter le local', resume: 'Un atelier partagé' } };

// ---------- W1, l'interrupteur : fermé par défaut, seule la valeur exacte 'actives' ouvre ----------
assert.equal(ecrituresAutoCoupees({}), true);                                  // réglage absent : coupé
assert.equal(ecrituresAutoCoupees({ LEO_ECRITURES_AUTO: '' }), true);
assert.equal(ecrituresAutoCoupees({ LEO_ECRITURES_AUTO: 'Actives' }), true);
assert.equal(ecrituresAutoCoupees({ LEO_ECRITURES_AUTO: 'actives' }), false);  // seule ouverture
assert.equal(ecrituresAutoCoupees({ LEO_ECRITURES_AUTO: 'coupees' }), true);
assert.equal(ecrituresAutoCoupees({ LEO_ECRITURES_AUTO: 'activse' }), true);   // faute de frappe : coupé

// Coupé : refus AVANT toute lecture ou insertion (aucune trace, aucun acte).
function clientEspion() {
  const appels = [];
  const requete = { eq() { return requete; }, gte() { return requete; }, limit() { return requete; },
    then(ok) { return Promise.resolve({ data: [], error: null }).then(ok); } };
  return { appels, from(nom) { appels.push(nom);
    return { select() { return requete; }, insert() { appels.push('insert'); return Promise.resolve({ error: null }); } }; } };
}
const coupe = clientEspion();
const refuse = await ouvrirEcriture(coupe, PAUL, IDEE, { env: { LEO_ECRITURES_AUTO: 'coupees' } });
assert.equal(refuse.status, 403);
assert.deepEqual(coupe.appels, []);
// Cas positif (non-vacuité) : actif, le même corps pose bien sa 'tentee'.
const actif = clientEspion();
const admis = await ouvrirEcriture(actif, PAUL, IDEE, { env: { LEO_ECRITURES_AUTO: 'actives' } });
// Réglage absent : coupé aussi, sans lecture ni insertion.
const absent = clientEspion();
assert.equal((await ouvrirEcriture(absent, PAUL, IDEE, { env: {} })).status, 403);
assert.deepEqual(absent.appels, []);
assert.equal(admis.status, 200);
assert.ok(actif.appels.includes('insert'));

// ---------- La route /api/leo, reconstruite avec ses dépendances injectées ----------
let construits = 0;
class AnthropicFactice {
  constructor() {
    construits++;
    this.messages = { create: async () => ({ content: [
      { type: 'tool_use', name: 'proposer_idee', input: { ...IDEE.args } }
    ] }) };
  }
}
const routeSource = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
function route({ auth = 'ok', coupees = false } = {}) {
  const deps = {
    ...leo,
    Anthropic: AnthropicFactice,
    process: { env: { ANTHROPIC_API_KEY: 'fixture-sans-reseau' } },
    requireProprietaire: async () => auth === 'ok'
      ? { status: 'ok', user: { id: PAUL } } : { status: auth },
    ecrituresAutoCoupees: () => coupees,
    readJsonBody: async (req) => req.body,
    // Le plafond d'appels (19/10) a ses propres harnais ; ici il laisse passer.
    ouvrirAppel: async () => ({ ok: true, traceId: null, mode: 'local' }), cloreAppel: async () => ({ ok: false }),
    ok: (_res, data) => ({ status: 200, data }),
    fail: (_res, status) => ({ status }),
    methodNotAllowed: () => ({ status: 405 }),
    logError: () => {}, bodyFail: () => ({ status: 400 })
  };
  return new Function(...Object.keys(deps), routeSource)(...Object.values(deps));
}
// Paul dicte l'idée lui-même : verbe attendu et chaque argument présents (S2).
const corps = { quadrant: 'adramelech', messages: [{ role: 'user',
  content: 'Crée une idée Racheter le local : Un atelier partagé' }] };

// W2 : seuls les propriétaires atteignent le modèle facturé.
for (const [statut, attendu] of [['unauthenticated', 401], ['unconfigured', 503],
                                 ['reserve_non_regle', 503], ['interdit', 403]]) {
  construits = 0;
  const r = await route({ auth: statut })({ method: 'POST', body: corps }, {});
  assert.equal(r.status, attendu, statut);
  assert.equal(construits, 0, 'aucun client Anthropic avant le garde : ' + statut);
}

// W1 côté conversation : actif → vert (non-vacuité) ; coupé → orange.
const vert = await route()({ method: 'POST', body: corps }, {});
assert.equal(vert.status, 200);
assert.equal(vert.data.proposition.anneau, 'vert');
const orange = await route({ coupees: true })({ method: 'POST', body: corps }, {});
assert.equal(orange.status, 200);
assert.equal(orange.data.proposition.anneau, 'orange');

// La route réelle appelle bien le garde propriétaire et plus requireUser.
const source = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8');
assert.ok(/await requireProprietaire\(req\)/.test(source));
assert.ok(!/requireUser\(/.test(source));

console.log('UNIT-LEO-INTERRUPTEUR OK');
