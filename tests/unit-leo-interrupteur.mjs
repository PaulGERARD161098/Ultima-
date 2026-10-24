// W1 + W2 (audit du 05/10) : l'interrupteur serveur des écritures automatiques
// et la route facturée réservée au propriétaire. Aucun réseau, SDK ou compte réel.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as leo from '../api/_lib/leo.js';
import { validerInteraction, decrireInteraction, lireReponseInteraction } from '../js/leo-interaction.mjs';
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
let reponseTexte = false; // false : le modèle propose un outil ; true : il répond en texte seul.
class AnthropicFactice {
  constructor() {
    construits++;
    this.messages = { create: async () => ({ content: reponseTexte
      ? [{ type: 'text', text: 'Bonjour Paul.' }]
      : [{ type: 'tool_use', name: 'proposer_idee', input: { ...IDEE.args } }] }) };
  }
}
const routeSource = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?;\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
function route({ auth = 'ok', coupees = false, appel = null } = {}) {
  const deps = {
    ...leo,
    // Dépendances pures réelles de la route après suppression des imports.
    validerInteraction, decrireInteraction, lireReponseInteraction,
    Anthropic: AnthropicFactice,
    process: { env: { ANTHROPIC_API_KEY: 'fixture-sans-reseau' } },
    requireProprietaire: async () => auth === 'ok'
      ? { status: 'ok', user: { id: PAUL } } : { status: auth },
    ecrituresAutoCoupees: () => coupees,
    readJsonBody: async (req) => req.body,
    // Le plafond d'appels (19/10) a ses propres harnais ; ici il laisse passer, sauf si
    // le cas fournit `appel` { appels, resultat } pour l'espionner ou le faire refuser.
    ouvrirAppel: async (...args) => {
      if (!appel) return { ok: true, traceId: null, mode: 'base' };
      appel.appels.push(args);
      return appel.resultat;
    },
    cloreAppel: async () => ({ ok: false }),
    ok: (_res, data) => ({ status: 200, data }),
    fail: (_res, status, _message, extra) => ({ status, ...(extra || {}) }),
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

// ---------- Le plafond d'appels côté route (19/10, revue S7) ----------
const espion = (resultat) => ({ appels: [], resultat });
// Refus du plafond → 429 + cause en mot fermé, et le modèle n'est JAMAIS construit ni appelé.
{
  construits = 0;
  const e = espion({ ok: false, status: 429, message: 'Plafond', cause: 'ia plafond' });
  const r = await route({ appel: e })({ method: 'POST', body: corps }, {});
  assert.equal(r.status, 429);
  assert.equal(r.cause, 'ia plafond');
  assert.equal(construits, 0, 'un plafond atteint ne construit aucun client Anthropic');
  assert.equal(e.appels.length, 1);
}
// Une requête INVALIDE ne consomme pas le plafond : le compteur n'est jamais ouvert.
for (const [nom, mauvais] of [
  ['quadrant inconnu', { ...corps, quadrant: 'nimporte-quoi' }],
  ['conversation vide', { ...corps, messages: [] }],
  ['état invalide', { ...corps, etat: 'pas-un-objet' }],
  ['suivi invalide', { ...corps, interaction: { rappels_focus: 3 } }]
]) {
  construits = 0;
  const e = espion({ ok: true, traceId: null, mode: 'base' });
  const r = await route({ appel: e })({ method: 'POST', body: mauvais }, {});
  assert.equal(r.status, 400, nom);
  assert.equal(e.appels.length, 0, `${nom} : le plafond n'est pas consommé`);
  assert.equal(construits, 0, nom);
}
// Une requête valide ouvre UN appel, pour le bon propriétaire et le modèle effectivement utilisé.
{
  const e = espion({ ok: true, traceId: null, mode: 'base' });
  const r = await route({ appel: e })({ method: 'POST', body: corps }, {});
  assert.equal(r.status, 200);
  assert.equal(e.appels.length, 1);
  assert.equal(e.appels[0][1].proprietaire, PAUL);
  assert.equal(e.appels[0][1].quadrant, 'adramelech');
  assert.equal(typeof e.appels[0][1].modele, 'string');
  assert.equal('journal' in r.data, false, 'mode base : aucune mention du repli');
}
// Repli local : la réponse le DIT (les deux sorties de succès : texte seul et proposition).
{
  const e = espion({ ok: true, traceId: null, mode: 'local' });
  const avecProposition = await route({ appel: e })({ method: 'POST', body: corps }, {});
  assert.ok(avecProposition.data.proposition, 'non-vacuité : la sortie « proposition » est bien celle qu\'on lit');
  assert.equal(avecProposition.data.journal, 'local');
  reponseTexte = true;
  const texteSeul = await route({ appel: e })({ method: 'POST', body: corps }, {});
  reponseTexte = false;
  assert.equal(texteSeul.data.reponse, 'Bonjour Paul.');
  assert.ok(!texteSeul.data.proposition, 'non-vacuité : la sortie « texte seul » est bien celle qu\'on lit');
  assert.equal(texteSeul.data.journal, 'local');
}

// La route réelle appelle bien le garde propriétaire et plus requireUser.
const source = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8');
assert.ok(/await requireProprietaire\(req\)/.test(source));
assert.ok(!/requireUser\(/.test(source));

console.log('UNIT-LEO-INTERRUPTEUR OK');

