// Parcours HTTP avec route, requireUser, SDK, GoTrue, PostgREST et SQL réels.
// Seuls comptes/mandats et passerelle locale sont propres à l'épreuve.
// Ne pas découvrir via run-unit : nécessite le job registre-auth isolé.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { writeFileSync, readFileSync, cpSync, mkdtempSync, symlinkSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

assert.equal(process.env.LV1_AUTH_ISOLATED, '1', 'lanceur isolé obligatoire');
for (const key of ['ANTHROPIC_API_KEY','OPENAI_API_KEY','SUPABASE_SERVICE_ROLE_KEY','GITHUB_TOKEN'])
  assert.equal(process.env[key], undefined, 'aucun accès réel : ' + key);
assert.equal(process.env.SUPABASE_URL, 'http://127.0.0.1:8765');
assert.equal(process.env.SUPABASE_ANON_KEY, 'fixture-publishable-key');
assert.ok(Object.values(networkInterfaces()).flat().every(address => address.internal),
  'aucune interface réseau extérieure, pas seulement un timeout de sonde');
const fixtureSecret = 'fixture-jwt-secret-only-32-characters-minimum';
const encode = x => Buffer.from(JSON.stringify(x)).toString('base64url');
function jwt(payload) {
  const message = encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode(payload);
  return message + '.' + createHmac('sha256', fixtureSecret).update(message).digest('base64url');
}
// Clé anon legacy uniquement pour la pile locale, jamais service_role.
process.env.SUPABASE_ANON_KEY = jwt({ role: 'anon', iss: 'fixture', exp: Math.floor(Date.now() / 1000) + 3600 });
assert.throws(() => writeFileSync('/leo-auth-forbidden', 'probe'));
await assert.rejects(fetch('http://198.51.100.1', { signal: AbortSignal.timeout(1500) }),
  'réseau extérieur refusé ; seul loopback partagé entre conteneurs');

// API gateway minimal sans SQL/identité inventés : transmet les octets aux
// deux serveurs réels. Aucun proxy générique, URL externe ou redirection.
let authRequests = 0, restRequests = 0, outage = false;
const gateway = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:8765');
    const isAuth = url.pathname.startsWith('/auth/v1/');
    const isRest = url.pathname.startsWith('/rest/v1/');
    if ((!isAuth && !isRest) || req.headers.apikey !== process.env.SUPABASE_ANON_KEY) {
      res.writeHead(403); return res.end();
    }
    if (isAuth) authRequests++; else restRequests++;
    if (outage && isAuth) { res.writeHead(503); return res.end('{}'); }
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length; assert.ok(size < 100000); chunks.push(chunk);
    }
    const headers = { 'Content-Type': req.headers['content-type'] || 'application/json' };
    if (req.headers.authorization) headers.Authorization = req.headers.authorization;
    for (const key of ['prefer','accept','x-supabase-api-version'])
      if (req.headers[key]) headers[key] = req.headers[key];
    const upstream = 'http://127.0.0.1:' + (isAuth ? '9999' : '3000')
      + url.pathname.slice(8) + url.search;
    const response = await fetch(upstream, { method: req.method, headers,
      ...(['GET','HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }),
      redirect: 'error', signal: AbortSignal.timeout(5000) });
    res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/json' });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(502); res.end('{}'); }
});
gateway.listen(8765, '127.0.0.1'); await once(gateway, 'listening');
let api;
const client = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const password = 'Fixture-password-only-0930!';
const mission = '00000000-0000-4000-8000-000000000101';
const outsideScope = '00000000-0000-4000-8000-000000000102';
try {
  if (process.argv[2] === 'setup') {
    for (const role of ['owner','reader','stranger']) {
      const { data, error } = await client().auth.signUp({ email: role + '@fixture.invalid', password });
      assert.equal(error, null, 'inscription fictive réelle ' + role);
      assert.ok(data.user?.id && data.session?.access_token, 'session émise par GoTrue');
    }
    console.log('PASS préparation : 3 comptes fictifs créés par GoTrue, aucune identité injectée.');
  } else {
    assert.ok(['test','test-mutant'].includes(process.argv[2]));
    for (let i = 0; i < 40; i++) {
      try { const r = await fetch('http://127.0.0.1:3000/', { signal: AbortSignal.timeout(1000) }); if (r.ok) break; }
      catch {}
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const sessions = {};
    for (const role of ['owner','reader','stranger']) {
      const { data, error } = await client().auth.signInWithPassword({ email: role + '@fixture.invalid', password });
      assert.equal(error, null); assert.ok(data.session?.access_token);
      sessions[role] = data.session.access_token;
    }
    // Import de la route intacte APRES les gardes d'environnement : pas de new Function,
    // d'injection makeClient ni de remplacement de requireUser/fetch/SDK/RPC.
    let routeUrl = new URL('../api/leo-registre.js', import.meta.url);
    if (process.argv[2] === 'test-mutant') {
      // Témoin rouge : copie jetable dans tmpfs, la route produit montée reste
      // intacte. Suppression volontaire de la vérification Auth, jamais livrée.
      const root = mkdtempSync('/tmp/leo-auth-mutant-');
      cpSync(new URL('../api/', import.meta.url), root + '/api', { recursive: true });
      symlinkSync('/travail/node_modules', root + '/node_modules', 'dir');
      writeFileSync(root + '/package.json', '{"type":"module"}');
      const file = root + '/api/_lib/supabase.js', source = readFileSync(file, 'utf8');
      const needle = '  const { client } = base;';
      assert.equal(source.split(needle).length, 2, 'mutation exacte du contrôle');
      writeFileSync(file, source.replace(needle, '  return base; // défaut témoin : Auth contourné\n' + needle));
      routeUrl = pathToFileURL(root + '/api/leo-registre.js');
    }
    const { default: handler } = await import(routeUrl);
    api = createServer(async (req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1:8766');
      if (url.pathname !== '/api/leo-registre') { res.writeHead(404); return res.end(); }
      req.query = Object.fromEntries(url.searchParams);
      try { await handler(req, res); } catch { res.writeHead(500); res.end('{}'); }
    });
    api.listen(8766, '127.0.0.1'); await once(api, 'listening');
    async function request(token, body, query = '?mission=' + mission) {
      const response = await fetch('http://127.0.0.1:8766/api/leo-registre' + (body ? '' : query), {
        method: body ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const json = await response.json();
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      return { status: response.status, json };
    }
    const get = async () => {
      const r = await request(sessions.owner); assert.equal(r.status, 200);
      assert.equal(r.json.ok, true); return r.json.data;
    };
    const before = await get();
    assert.equal(before.mission.id, mission); assert.equal(before.mission.version, 1);
    assert.equal(before.budget.calls, 0); assert.equal(before.operations.length, 0);
    const authBefore = authRequests, restBefore = restRequests;
    assert.equal((await request(sessions.reader)).status, 200);
    assert.equal(authRequests, authBefore + 1, 'AUTH_GETUSER_REQUIRED');
    assert.equal(restRequests, restBefore + 1);
    console.log('PASS positif : HTTP produit → requireUser → SDK → GoTrue → PostgREST → SQL/RLS.');

    // JWT expiré signé seulement avec la clé fictive de ce job.
    const claims = JSON.parse(Buffer.from(sessions.owner.split('.')[1], 'base64url'));
    const expired = jwt({ ...claims, exp: 1 });
    const corrupt = sessions.owner.split('.'); corrupt[1] = encode({ ...claims, sub: '00000000-0000-4000-8000-000000000999' });
    const anonymous = await client().auth.signInAnonymously();
    assert.equal(anonymous.error, null); assert.ok(anonymous.data.user.is_anonymous);
    for (const [label, token] of [['absent',null],['altéré',corrupt.join('.')],['expiré',expired],
      ['anonyme',anonymous.data.session.access_token]]) {
      const calls = restRequests;
      assert.equal((await request(token)).status, 401, label);
      assert.equal(restRequests, calls, label + ' : zéro accès au registre');
    }
    outage = true;
    const restOnOutage = restRequests;
    assert.equal((await request(sessions.owner)).status, 401);
    assert.equal(restRequests, restOnOutage); outage = false;
    console.log('PASS Auth : absent, altéré, expiré, anonyme et panne refusés avant toute requête registre.');

    const write = { action: 'write_memory', mission, operation_id: 'auth-real-1', expected_version: 1,
      patch: { next_action: 'Mémo fictif confirmé' } };
    assert.equal((await request(sessions.stranger)).status, 403);
    assert.equal((await request(sessions.reader, write)).status, 403);
    assert.equal((await request(sessions.stranger, write)).status, 403);
    assert.equal((await request(sessions.reader, { action: 'stop', mission })).status, 403);
    assert.equal((await request(sessions.owner, { ...write, mission: outsideScope })).status, 409);
    for (const action of ['merge','delegate','run_shell','paid_call']) {
      const calls = restRequests;
      assert.equal((await request(sessions.owner, { action, mission })).status, 400);
      assert.equal(restRequests, calls, 'action hors catalogue : zéro RPC');
    }
    assert.deepEqual(await get(), before, 'refus : aucun budget, version ou reçu changé');
    const scoped = await request(sessions.owner, null, '?mission=' + outsideScope);
    assert.equal(scoped.status, 200); assert.equal(scoped.json.data.budget.calls, 0);
    console.log('PASS mandat : lecteur/étranger, arrêt non propriétaire, portée et actions externes refusés sans effet.');

    const first = await request(sessions.owner, write); assert.equal(first.status, 200);
    assert.equal(first.json.data.replayed, false);
    const replay = await request(sessions.owner, write); assert.equal(replay.status, 200);
    assert.equal(replay.json.data.replayed, true);
    const after = await get(); assert.equal(after.mission.version, 2);
    assert.equal(after.budget.calls, 1); assert.equal(after.operations.length, 1);
    assert.equal(after.mission.next_action, 'Mémo fictif confirmé');
    const receiptQuery = '?mission=' + mission + '&operation_id=auth-real-1';
    assert.equal((await request(sessions.reader, null, receiptQuery)).json.data.operation.status, 'completed');
    assert.equal((await request(sessions.stranger, null, receiptQuery)).json.data.operation, null);
    assert.equal((await request(sessions.owner, { ...write, operation_id: 'stale' })).status, 409);
    assert.deepEqual(await get(), after);
    assert.equal((await request(sessions.owner, { action: 'stop', mission })).status, 200);
    const stopped = await get(); assert.equal(stopped.mission.stopped, true);
    assert.equal((await request(sessions.owner, { ...write, operation_id: 'after-stop', expected_version: 3 })).status, 409);
    assert.deepEqual(await get(), stopped);
    assert.equal((await request(sessions.owner, write)).json.data.replayed, true);
    console.log('PASS effets : écriture confirmée, reçu ciblé sous RLS, rejeu idempotent, conflit et arrêt sans doublon.');
    console.log('AUTH RÉEL ISOLÉ VERT — pas de production, ni contrôle des outils Work, ni recette V1 complète.');
  }
} finally {
  if (api) { api.closeAllConnections(); await new Promise(resolve => api.close(resolve)); }
  gateway.closeAllConnections(); await new Promise(resolve => gateway.close(resolve));
}
