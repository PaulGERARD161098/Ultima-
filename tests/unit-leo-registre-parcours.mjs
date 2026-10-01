// Parcours composé : client, route et SQL réels. Identité et HTTP sont factices.
// PostgreSQL PGlite en mémoire, sans Supabase ni réseau. Ce n'est pas une recette
// navigateur/production ni une preuve de concurrence entre connexions PostgreSQL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { isUuid } from '../api/_lib/validate.js';
import * as http from '../api/_lib/http.js';

const fixtureWindow = { crypto: { randomUUID } };
new Function('window', readFileSync(new URL('../js/leo-registre-client.js', import.meta.url), 'utf8'))(fixtureWindow);
const createLeoRegistryClient = fixtureWindow.UltimaLeoRegistreClient.create;

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const owner = id(1), writer = id(2), reader = id(3), stranger = id(4), mission = id(10);
const db = new PGlite();
const sql = readFileSync(new URL('../leo/proposals/registre-postgres.sql', import.meta.url), 'utf8');
const routeSource = readFileSync(new URL('../api/leo-registre.js', import.meta.url), 'utf8')
  .replace(/^import[^\n]*\n/gm, '')
  .replace('export default async function handler', 'return async function handler');
let rpcCount = 0;
let serial = Promise.resolve();
// La simulation ne laisse jamais changer l'identité au milieu d'une RPC.
function rpc(uid, name, args) {
  const task = serial.then(async () => {
    rpcCount++;
    await db.exec('reset role; set role authenticated');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid]);
    try {
      let query, values;
      if (name === 'leo_status' || name === 'leo_stop') {
        query = `select public.${name}($1) as value`; values = [args.p_mission];
      } else {
        assert.equal(name, 'leo_write_memory');
        query = 'select public.leo_write_memory($1,$2,$3,$4::jsonb) as value';
        values = [args.p_mission, args.p_operation, args.p_expected_version, JSON.stringify(args.p_patch)];
      }
      return { data: (await db.query(query, values)).rows[0].value, error: null };
    } catch (error) { return { data: null, error }; }
  });
  serial = task.catch(() => {});
  return task;
}
const deps = { ...http, isUuid, logError: () => {}, isAuthError: () => false,
  requireUser: async req => ({ status: 'ok', client: {
    rpc: (name, args) => rpc(req.fixtureUser, name, args),
    from: table => {
      assert.equal(table, 'leo_operations');
      const filters = {};
      const builder = {
        select: columns => { assert.equal(columns, 'operation_id,status,result'); return builder; },
        eq: (key, value) => { assert.ok(['mission_id', 'operation_id'].includes(key)); filters[key] = value; return builder; },
        maybeSingle: () => {
          const task = serial.then(async () => {
            await db.exec('reset role; set role authenticated');
            await db.query("select set_config('request.jwt.claim.sub',$1,false)", [req.fixtureUser]);
            try {
              // SELECT sous le vrai rôle : les policies SQL du registre s'appliquent.
              const result = await db.query(`select operation_id,status,result from public.leo_operations
                where mission_id=$1 and operation_id=$2`, [filters.mission_id, filters.operation_id]);
              assert.ok(result.rows.length <= 1);
              return { data: result.rows[0] || null, error: null };
            } catch (error) { return { data: null, error }; }
          });
          serial = task.catch(() => {}); return task;
        },
      };
      return builder;
    },
  } }),
};
const route = new Function(...Object.keys(deps), routeSource)(...Object.values(deps));
function transport(uid) {
  const state = { requests: [], loseNextWrite: false, corruptNextWrite: false, loseNextStopBeforeRoute: false };
  state.fetch = async (url, init = {}) => {
    const parsed = new URL(url, 'https://fixture.invalid');
    assert.equal(parsed.origin, 'https://fixture.invalid');
    assert.equal(parsed.pathname, '/api/leo-registre');
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : undefined;
    state.requests.push({ method, body });
    if (state.loseNextStopBeforeRoute && body?.action === 'stop') {
      state.loseNextStopBeforeRoute = false;
      throw new TypeError('Arrêt perdu avant route — fixture');
    }
    let status, payload;
    await route({ method, query: Object.fromEntries(parsed.searchParams), body,
      fixtureUser: uid }, {
      set statusCode(value) { status = value; }, setHeader() {},
      end(value) { payload = JSON.parse(value); },
    });
    assert.ok(Number.isInteger(status), 'la route réelle a répondu');
    if (state.loseNextWrite && body?.action === 'write_memory' && status === 200) {
      state.loseNextWrite = false;
      throw new TypeError('Réponse perdue après commit SQL — fixture');
    }
    if (state.corruptNextWrite && body?.action === 'write_memory' && status === 200) {
      state.corruptNextWrite = false;
      payload.data.operation_id = 'foreign-operation';
    }
    return { ok: status >= 200 && status < 300, status, json: async () => structuredClone(payload) };
  };
  return state;
}
async function canonical() {
  const result = await rpc(owner, 'leo_status', { p_mission: mission });
  assert.equal(result.error, null);
  return result.data;
}

try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth,public to authenticated,anon,service_role;
    grant execute on function auth.uid() to authenticated,anon,service_role;`);
  await db.exec(sql);
  for (const uid of [owner, writer, reader, stranger]) await db.query('insert into auth.users values ($1)', [uid]);
  await db.query(`insert into public.leo_missions(id,owner,readers,writers,expires_at,max_units,max_calls)
    values($1,$2,array[$3::uuid],array[$4::uuid],clock_timestamp()+interval '1 day',10,10)`,
    [mission, owner, reader, writer]);
  const clients = [];
  function client(uid, options = {}) {
    const wire = transport(uid);
    const api = createLeoRegistryClient({ getToken: async () => 'fixture-not-a-real-token', fetch: wire.fetch, ...options });
    clients.push(api);
    return { api, wire };
  }
  const a = client(owner), b = client(writer);
  const loaded = await a.api.load(mission);
  assert.equal(loaded.data.mission.version, 1);
  assert.equal(loaded.canWrite, true);
  await b.api.load(mission);
  await a.api.write({ state: 'in_progress', next_action: 'Relire le correctif' });
  assert.equal(a.api.snapshot().needsRefresh, true, 'un reçu ne simule pas un budget courant');
  let observed = await canonical();
  assert.equal(observed.mission.version, 2);
  assert.equal(observed.mission.next_action, 'Relire le correctif');
  assert.equal(observed.budget.calls, 1);
  assert.equal(observed.budget.used_units, 1);
  assert.equal(observed.operations.length, 1);

  // Deux clients ont lu v1 : le deuxième est refusé, sans écraser le premier.
  await assert.rejects(() => b.api.write({ next_action: 'Version périmée' }), { code: 'conflict' });
  assert.equal(b.api.snapshot().uncertain, null, '409 contractuel = refus certain');
  assert.equal(b.api.snapshot().needsRefresh, true);
  const requestsBefore = b.wire.requests.length;
  await assert.rejects(() => b.api.write({ next_action: 'Rejeu interdit' }), { code: 'conflict' });
  assert.equal(b.wire.requests.length, requestsBefore, 'aucun rejeu automatique ni aveugle');
  assert.equal((await canonical()).budget.calls, 1);
  const reconciled = await b.api.reconcile();
  assert.equal(reconciled.data.mission.version, 2);
  await b.api.write({ next_action: 'Relecture explicite terminée' });
  assert.equal((await canonical()).budget.calls, 2);

  // Effet SQL validé, réponse HTTP perdue : on lit le reçu, jamais de second POST.
  await a.api.reconcile();
  a.wire.loseNextWrite = true;
  await assert.rejects(() => a.api.write({ state: 'ready_for_review' }), { code: 'uncertain' });
  const pending = a.api.snapshot().uncertain;
  assert.equal(pending.action, 'write_memory');
  assert.equal(pending.expected_version, 3);
  const postCount = a.wire.requests.filter(r => r.method === 'POST').length;
  await assert.rejects(() => a.api.write({ next_action: 'Ne doit pas partir' }), { code: 'uncertain' });
  const receipt = await a.api.reconcile();
  assert.equal(receipt.uncertain, null);
  assert.equal(receipt.data.mission.version, 4);
  assert.equal(receipt.data.mission.state, 'ready_for_review');
  assert.equal(receipt.data.budget.calls, 3);
  assert.equal(receipt.data.budget.used_units, 3);
  assert.equal(receipt.data.operations.length, 3);
  assert.equal(receipt.data.operations.filter(o => o.operation_id === pending.operation_id).length, 1);
  assert.equal(a.wire.requests.filter(r => r.method === 'POST').length, postCount);

  const fresh = client(owner);
  const resumed = await fresh.api.load(mission);
  assert.deepEqual(resumed.data, receipt.data, 'nouvelle instance = état durable SQL, pas mémoire navigateur');
  const r = client(reader), s = client(stranger);
  assert.equal((await r.api.load(mission)).data.mission.version, 4);
  await assert.rejects(() => r.api.write({ next_action: 'Interdit au lecteur' }), { code: 'denied' });
  await r.api.reconcile();
  await assert.rejects(() => r.api.stop(), { code: 'denied' });
  await assert.rejects(() => s.api.load(mission), { code: 'denied' });
  assert.equal(s.api.snapshot().data, null);
  assert.equal((await canonical()).budget.calls, 3);

  // Les commandes externes sont refusées par la vraie route avant toute RPC.
  const externalWire = transport(owner);
  for (const action of ['delegate', 'send_mail', 'paid_call', 'merge_fixture', 'create_mission', 'execute_shell']) {
    const before = rpcCount;
    const response = await externalWire.fetch('/api/leo-registre', {
      method: 'POST', body: JSON.stringify({ action, mission }),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, false);
    assert.equal(rpcCount, before, `${action} n'atteint pas la base`);
  }
  const stopped = await fresh.api.stop();
  assert.equal(stopped.data.mission.stopped, true);
  assert.equal(stopped.data.mission.version, 5);
  assert.equal(stopped.canWrite, false);
  await assert.rejects(() => fresh.api.write({ next_action: 'Après arrêt' }), { code: 'denied' });
  // Client ayant encore v4 : le serveur doit aussi refuser, malgré son cache.
  await assert.rejects(() => a.api.write({ next_action: 'Cache avant arrêt' }), { code: 'conflict' });
  observed = await canonical();
  assert.equal(observed.mission.version, 5);
  assert.equal(observed.budget.calls, 3);
  assert.equal(observed.budget.used_units, 3);
  assert.equal(observed.operations.length, 3);
  assert.ok(rpcCount >= 15, 'preuve non vide : plusieurs chemins ont réellement atteint PostgreSQL');

  // La reprise du navigateur conserve l'identifiant d'une écriture incertaine.
  const recoveryMission = id(11), saved = new Map();
  const recoveryStore = { getItem: key => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
  await db.exec('reset role');
  await db.query(`insert into public.leo_missions(id,owner,expires_at,max_units,max_calls)
    values($1,$2,clock_timestamp()+interval '1 day',10,10)`, [recoveryMission, owner]);
  const recoveryOptions = { recoveryStore, recoveryKey: 'fixture-recovery' };
  const interrupted = client(owner, recoveryOptions);
  await interrupted.api.load(recoveryMission);
  interrupted.wire.loseNextWrite = true;
  await assert.rejects(() => interrupted.api.write({ state: 'in_progress' }), { code: 'uncertain' });
  const marker = JSON.parse(saved.get('fixture-recovery'));
  assert.equal(marker.missionId, recoveryMission);
  assert.equal(marker.expected_version, 1);
  assert.equal(marker.kind, 'write_memory');
  assert.ok(Object.keys(marker).every(k =>
    ['expected_version', 'kind', 'missionId', 'operation_id', 'stopRequested'].includes(k)));
  assert.equal(Object.hasOwn(marker, 'patch'), false, 'aucun contenu métier dans le journal navigateur');
  interrupted.api.destroy();
  const recovered = client(owner, recoveryOptions);
  assert.equal(recovered.api.snapshot().uncertain.operation_id, marker.operation_id);
  await assert.rejects(() => recovered.api.write({ next_action: 'Pas de rejeu' }), { code: 'uncertain' });
  assert.equal(recovered.wire.requests.length, 0);
  const recoveryReceipt = await recovered.api.reconcile();
  assert.equal(recoveryReceipt.uncertain, null);
  assert.equal(recoveryReceipt.data.budget.calls, 1);
  assert.equal(recoveryReceipt.data.operations.length, 1);
  assert.equal(saved.has('fixture-recovery'), false);
  assert.equal(recovered.wire.requests.filter(r => r.method === 'POST').length, 0);

  const storageFail = client(owner, { recoveryKey: 'fixture-unavailable', recoveryStore: {
    getItem: () => null, setItem: () => { throw new Error('stockage indisponible'); }, removeItem() {},
  } });
  await storageFail.api.load(recoveryMission);
  const countBeforeStorageFail = rpcCount;
  await assert.rejects(() => storageFail.api.write({ next_action: 'Jamais envoyé' }), { code: 'unavailable' });
  assert.equal(storageFail.wire.requests.filter(r => r.method === 'POST').length, 0);
  assert.equal(rpcCount, countBeforeStorageFail);

  // Un HTTP 200 avec reçu étranger ne vaut pas succès : arrêt reste accessible.
  recovered.wire.corruptNextWrite = true;
  await assert.rejects(() => recovered.api.write({ next_action: 'Reçu à vérifier' }), { code: 'uncertain' });
  assert.ok(recovered.api.snapshot().uncertain);
  const stoppedUnknown = await recovered.api.stop();
  assert.equal(stoppedUnknown.data.mission.stopped, true);
  assert.equal(stoppedUnknown.data.mission.version, 4);
  assert.equal(stoppedUnknown.uncertain, null, 'le statut rendu par stop contient le reçu réel');
  assert.equal(stoppedUnknown.data.budget.calls, 2);
  assert.equal(stoppedUnknown.data.operations.length, 2);
  assert.equal(recovered.wire.requests.filter(r => r.method === 'POST').length, 2, 'une écriture puis arrêt, aucun rejeu');

  // Écriture confirmée en base + arrêt dont le transport est perdu : le reçu
  // d'écriture ne prouve pas l'arrêt, même après recréation du client.
  const stopMission = id(12);
  await db.exec('reset role');
  await db.query(`insert into public.leo_missions(id,owner,expires_at,max_units,max_calls)
    values($1,$2,clock_timestamp()+interval '1 day',10,10)`, [stopMission, owner]);
  const stopOptions = { recoveryStore, recoveryKey: 'fixture-stop-recovery' };
  const stopping = client(owner, stopOptions);
  await stopping.api.load(stopMission);
  stopping.wire.loseNextWrite = true;
  await assert.rejects(() => stopping.api.write({ state: 'in_progress' }), { code: 'uncertain' });
  stopping.wire.loseNextStopBeforeRoute = true;
  await assert.rejects(() => stopping.api.stop(), { code: 'uncertain' });
  stopping.api.destroy();
  const resumedStop = client(owner, stopOptions);
  const stopStillUnknown = await resumedStop.api.reconcile();
  assert.equal(stopStillUnknown.data.mission.stopped, false);
  assert.equal(stopStillUnknown.data.operations.length, 1);
  assert.equal(stopStillUnknown.data.budget.calls, 1);
  assert.ok(stopStillUnknown.uncertain, 'le reçu écriture seul ne solde pas un arrêt incertain');
  assert.equal(stopStillUnknown.canWrite, false);
  assert.ok(saved.has('fixture-stop-recovery'), 'preuve encore manquante conservée après lecture');
  await assert.rejects(() => resumedStop.api.write({ next_action: 'Interdit tant que arrêt incertain' }), { code: 'uncertain' });
  assert.equal(resumedStop.wire.requests.filter(r => r.method === 'POST').length, 0);
  const stopFinallyConfirmed = await resumedStop.api.stop();
  assert.equal(stopFinallyConfirmed.data.mission.stopped, true);
  assert.equal(stopFinallyConfirmed.uncertain, null);
  assert.equal(stopFinallyConfirmed.data.budget.calls, 1);
  assert.equal(stopFinallyConfirmed.data.operations.length, 1);
  assert.equal(saved.has('fixture-stop-recovery'), false);

  // Arrêt seul incertain : un second essai refusé avant réseau ne doit pas
  // supprimer la preuve encore attendue du premier arrêt.
  const loneStopMission = id(13);
  await db.exec('reset role');
  await db.query(`insert into public.leo_missions(id,owner,expires_at,max_units,max_calls)
    values($1,$2,clock_timestamp()+interval '1 day',10,10)`, [loneStopMission, owner]);
  let fixtureToken = 'fixture-not-a-real-token';
  const loneStop = client(owner, { recoveryStore, recoveryKey: 'fixture-lone-stop',
    getToken: async () => fixtureToken });
  await loneStop.api.load(loneStopMission);
  loneStop.wire.loseNextStopBeforeRoute = true;
  await assert.rejects(() => loneStop.api.stop(), { code: 'uncertain' });
  assert.equal(loneStop.api.snapshot().uncertain.action, 'stop');
  const loneStopPosts = loneStop.wire.requests.filter(r => r.method === 'POST').length;
  fixtureToken = null;
  await assert.rejects(() => loneStop.api.stop(), { code: 'uncertain' });
  assert.equal(loneStop.wire.requests.filter(r => r.method === 'POST').length, loneStopPosts,
    'échec token avant réseau : aucun POST supplémentaire');
  assert.equal(loneStop.api.snapshot().uncertain.action, 'stop');
  fixtureToken = 'fixture-not-a-real-token';
  const loneStopUnknown = await loneStop.api.reconcile();
  assert.equal(loneStopUnknown.data.mission.stopped, false);
  assert.ok(loneStopUnknown.uncertain, 'le second échec ne solde pas le premier arrêt');
  assert.equal(loneStopUnknown.canWrite, false);
  assert.equal(loneStopUnknown.data.budget.calls, 0);
  assert.equal(JSON.parse(saved.get('fixture-lone-stop')).kind, 'stop');
  await assert.rejects(() => loneStop.api.write({ state: 'in_progress' }), { code: 'uncertain' });
  const loneStopConfirmed = await loneStop.api.stop();
  assert.equal(loneStopConfirmed.data.mission.stopped, true);
  assert.equal(loneStopConfirmed.uncertain, null);
  assert.equal(loneStopConfirmed.data.operations.length, 0);
  assert.equal(loneStopConfirmed.data.budget.calls, 0);
  assert.equal(saved.has('fixture-lone-stop'), false);
  // R25 : reçu perdu sorti des 100 derniers, retrouvé sans aucune réécriture.
  const archiveMission = id(14), archiveOptions = { recoveryStore, recoveryKey: 'fixture-archive' };
  await db.exec('reset role');
  await db.query(`insert into public.leo_missions(id,owner,readers,expires_at,max_units,max_calls)
    values($1,$2,array[$3::uuid],clock_timestamp()+interval '1 day',1000,1000)`, [archiveMission, owner, reader]);
  const archived = client(owner, archiveOptions);
  await archived.api.load(archiveMission); archived.wire.loseNextWrite = true;
  await assert.rejects(() => archived.api.write({ next_action: 'Écriture ancienne' }), { code: 'uncertain' });
  const archiveMarker = saved.get('fixture-archive'), archiveOp = JSON.parse(archiveMarker).operation_id;
  archived.api.destroy();
  for (let i = 0; i < 100; i++) {
    const result = await rpc(owner, 'leo_write_memory', { p_mission: archiveMission,
      p_operation: 'later-' + i, p_expected_version: i + 2, p_patch: { next_action: 'Courante ' + i } });
    assert.equal(result.error, null);
  }
  const archiveStatus = (await rpc(owner, 'leo_status', { p_mission: archiveMission })).data;
  assert.equal(archiveStatus.operations.length, 100); assert.equal(archiveStatus.operations_truncated, true);
  assert.equal(archiveStatus.operations.some(o => o.operation_id === archiveOp), false, 'reçu réellement évincé');
  const resumeArchive = client(owner, archiveOptions), recoveredArchive = await resumeArchive.api.reconcile();
  assert.equal(recoveredArchive.uncertain, null); assert.equal(saved.has('fixture-archive'), false);
  assert.equal(recoveredArchive.data.mission.version, 102);
  assert.equal(recoveredArchive.data.mission.next_action, 'Courante 99');
  assert.equal(recoveredArchive.data.budget.calls, 101);
  assert.equal(resumeArchive.wire.requests.length, 2, 'statut puis reçu ciblé');
  assert.ok(resumeArchive.wire.requests.every(r => r.method === 'GET'));
  assert.deepEqual((await rpc(owner, 'leo_status', { p_mission: archiveMission })).data, archiveStatus,
    'reprise sans effet, nouveau budget ou version');
  for (const [uid, expected] of [[owner, true], [reader, true], [stranger, false]]) {
    const wire = transport(uid);
    const reply = await wire.fetch('/api/leo-registre?mission=' + archiveMission + '&operation_id=' + archiveOp,
      { method: 'GET' });
    assert.equal(reply.status, 200);
    const found = (await reply.json()).data.operation;
    assert.equal(found !== null, expected, 'RLS du reçu selon identité');
    if (found) assert.deepEqual(Object.keys(found).sort(), ['operation_id', 'result', 'status']);
  }
  const wrongMission = await transport(owner).fetch('/api/leo-registre?mission=' + mission + '&operation_id=' + archiveOp,
    { method: 'GET' });
  assert.equal((await wrongMission.json()).data.operation, null, 'aucun reçu inter-missions');
  // Un arrêt demandé ne se solde pas avec la seule preuve d'écriture ancienne.
  saved.set('fixture-archive', JSON.stringify({ ...JSON.parse(archiveMarker), stopRequested: true }));
  const archiveStop = client(owner, archiveOptions);
  assert.ok((await archiveStop.api.reconcile()).uncertain);
  await rpc(owner, 'leo_stop', { p_mission: archiveMission });
  assert.equal((await archiveStop.api.reconcile()).uncertain, null);
  assert.ok(archiveStop.wire.requests.every(r => r.method === 'GET'));
  console.log('Reçu ancien : 101 écritures SQL, reprise ciblée sans doublon, ACL/inter-missions et arrêt éprouvés.');
  for (const api of clients) api.destroy();
  console.log('Parcours composé client→route→PostgreSQL : écriture, CAS, refus, réponse perdue, reçu, reprise et arrêt vérifiés ; auth/HTTP fictifs.');
} finally { await db.close(); }
