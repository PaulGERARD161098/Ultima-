// Client de mémoire LV1, sans modèle ni délégation. Journal optionnel de session :
// identifiants/version uniquement, jamais de patch, contenu de mission ou jeton.
// Les boutons possibles ne constituent pas un droit : le serveur contrôle l'identité.
(function () {
  'use strict';
  const STATES = ['proposed', 'authorized', 'in_progress', 'ready_for_review',
    'approved_for_merge', 'merged', 'closed', 'blocked', 'suspended', 'abandoned'];
  const uuid = value => typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const court=(s,max=160)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=max&&!/[\u0000-\u001f<>]/.test(s)?s.trim():null;
const objet=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function validerPlan(brut){
  if(!objet(brut)||Object.keys(brut).some(k=>!['titre','etapes'].includes(k)))return null;
  const titre=court(brut.titre);
  if(!titre||!Array.isArray(brut.etapes)||brut.etapes.length<1||brut.etapes.length>10)return null;
  const etapes=brut.etapes.map(e=>court(e));
  if(etapes.some(e=>!e)||new Set(etapes.map(e=>e.toLowerCase())).size!==etapes.length)return null;
  return {titre,etapes};
}
const CLES_CHECKPOINT=['task_id','titre','etapes','confirmes','rappels','etat','revision'];
const UUID_CHECKPOINT=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function validerCheckpoint(brut){
  if(!objet(brut)||![Object.prototype,null].includes(Object.getPrototypeOf(brut)))return null;
  const cles=Reflect.ownKeys(brut);
  if(cles.length!==CLES_CHECKPOINT.length||cles.some(k=>!CLES_CHECKPOINT.includes(k)))return null;
  if(cles.some(k=>{const d=Object.getOwnPropertyDescriptor(brut,k);return !d.enumerable||!Object.hasOwn(d,'value');}))return null;
  if(typeof brut.task_id!=='string'||!UUID_CHECKPOINT.test(brut.task_id)
    ||!Array.isArray(brut.etapes)||!Array.isArray(brut.confirmes))return null;
  // Les copies denses refusent aussi les tableaux creux dans un appel local.
  const plan=validerPlan({titre:brut.titre,etapes:Array.from(brut.etapes)});
  const confirmes=Array.from(brut.confirmes);
  if(!plan||confirmes.some((n,i)=>!Number.isInteger(n)||n<0||n>=plan.etapes.length||(i>0&&n<=confirmes[i-1]))
    ||!Number.isInteger(brut.rappels)||brut.rappels<0||brut.rappels>2
    ||!['en_cours','suspendue'].includes(brut.etat)
    ||!Number.isSafeInteger(brut.revision)||brut.revision<1)return null;
  try{if(new TextEncoder().encode(JSON.stringify(brut)).length>10000)return null;}
  catch{return null;}
  return {task_id:brut.task_id,...plan,confirmes,rappels:brut.rappels,etat:brut.etat,revision:brut.revision};
}

  const exactKeys = (v,keys) => plain(v) && Reflect.ownKeys(v).length === keys.length
    && keys.every(k => Object.hasOwn(v,k));
  const commandValid = c => exactKeys(c,['kind','expected_task_id'])
    && (c.kind === 'adopt' ? c.expected_task_id === null
      : ['update','revise_plan'].includes(c.kind) && uuid(c.expected_task_id));
  const checkpointPairValid = v => !Object.hasOwn(v,'checkpoint') && !Object.hasOwn(v,'checkpoint_command')
    || Object.hasOwn(v,'checkpoint') && Object.hasOwn(v,'checkpoint_command')
      && !!validerCheckpoint(v.checkpoint) && commandValid(v.checkpoint_command)
      && (v.checkpoint_command.kind === 'adopt' || v.checkpoint.task_id === v.checkpoint_command.expected_task_id);
  // Objets comparés sans dépendre de l'ordre des clés ; l'ordre des tableaux compte.
  function structuralEqual(a,b) {
    if(a===b)return true;
    if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)
      &&a.length===b.length&&a.every((v,i)=>structuralEqual(v,b[i]));
    if(!plain(a)||!plain(b))return false;
    const keys=Object.keys(a);
    return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&structuralEqual(a[k],b[k]));
  }
  const patchMatches = (result,patch) => Object.keys(patch).every(k =>
    ['checkpoint','checkpoint_command'].includes(k) ? structuralEqual(result[k],patch[k]) : result[k]===patch[k]);
  const capabilityValid = d => !Object.hasOwn(d,'capabilities') ? !Object.hasOwn(d.mission,'checkpoint')
    : exactKeys(d.capabilities,['checkpoint','checkpoint_write']) && d.capabilities.checkpoint===1
      && typeof d.capabilities.checkpoint_write==='boolean' && Object.hasOwn(d.mission,'checkpoint')
      && (d.mission.checkpoint===null || !!validerCheckpoint(d.mission.checkpoint));

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const version = value => Number.isSafeInteger(value) && value > 0;
  const resultValid = value => plain(value) && version(value.mission_version)
    && STATES.includes(value.state) && typeof value.next_action === 'string'
    && value.next_action.length <= 4000 && checkpointPairValid(value);
  const operationValid = o => plain(o) && typeof o.operation_id === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(o.operation_id)
    && ['completed', 'pending', 'unknown'].includes(o.status)
    && (o.status === 'completed' ? resultValid(o.result) : o.result === null);
  function error(code, message) { return Object.assign(new Error(message), { code }); }
  function statusValid(data, missionId) {
    const m = data?.mission, b = data?.budget;
    return plain(data) && plain(m) && capabilityValid(data) && m.id === missionId && version(m.version)
      && STATES.includes(m.state) && typeof m.next_action === 'string' && m.next_action.length <= 4000
      && typeof m.stopped === 'boolean' && typeof m.scope === 'string'
      && typeof m.contract_version === 'string' && typeof m.skill_version === 'string'
      && typeof m.expires_at === 'string' && Number.isFinite(Date.parse(m.expires_at))
      && plain(b) && ['max_units', 'max_calls', 'used_units', 'calls'].every(k =>
        Number.isSafeInteger(b[k]) && b[k] >= 0 && b[k] <= 100000)
      && b.used_units <= b.max_units && b.calls <= b.max_calls
      && Array.isArray(data.operations) && data.operations.length <= 100
      && typeof data.operations_truncated === 'boolean'
      && data.operations.every(operationValid);
  }
  function create(options) {
    if (!options || typeof options.getToken !== 'function') throw error('invalid', 'Session requise');
    const fetcher = options.fetch || window.fetch.bind(window);
    let missionId = null, data = null, busy = false, uncertain = null;
    let needsRefresh = true, lastError = null, disposed = false, activeController = null;
    const recovery = options.recoveryStore;
    const recoveryKey = options.recoveryKey;
    if (recovery && (typeof recoveryKey !== 'string' || !recoveryKey
      || !['getItem', 'setItem', 'removeItem'].every(k => typeof recovery[k] === 'function')))
      throw error('invalid', 'Journal de reprise invalide');
    if (recovery) {
      let saved;
      try { saved = recovery.getItem(recoveryKey); }
      catch { throw error('unavailable', 'Journal de reprise inaccessible'); }
      if (saved !== null) {
        let marker;
        try { marker = JSON.parse(saved); } catch { /* Refus fermé ci-dessous. */ }
        if (!plain(marker) || Object.keys(marker).length !== 5 || !uuid(marker.missionId)
          || !['write_memory', 'stop'].includes(marker.kind) || !version(marker.expected_version)
          || typeof marker.stopRequested !== 'boolean'
          || (marker.kind === 'stop' && !marker.stopRequested)
          || (marker.kind === 'write_memory' ? !uuid(marker.operation_id) : marker.operation_id !== null))
          throw error('unavailable', 'Journal de reprise invalide ; vérification nécessaire');
        missionId = marker.missionId.toLowerCase();
        uncertain = { action: marker.kind, mission: missionId, operation_id: marker.operation_id,
          expected_version: marker.expected_version, stopRequested: marker.stopRequested };
      }
    }
    function clearUncertain() {
      if (recovery) {
        try { recovery.removeItem(recoveryKey); }
        catch { throw error('uncertain', 'Reçu vérifié mais journal de reprise inaccessible'); }
      }
      uncertain = null;
    }
    function persistPending(pending) {
      if (!recovery) return;
      recovery.setItem(recoveryKey, JSON.stringify({ missionId: pending.mission,
        operation_id: pending.operation_id || null, kind: pending.action,
        expected_version: pending.expected_version, stopRequested: pending.stopRequested }));
    }
    function snapshot() {
      const m = data?.mission, b = data?.budget;
      const ready = !!m && !busy && !uncertain && !needsRefresh;
      const canWrite = ready && !m.stopped && m.scope === 'memory'
          && m.contract_version === '1.1' && m.skill_version === '1.0'
          && Date.parse(m.expires_at) > Date.now() && m.version < Number.MAX_SAFE_INTEGER
          && b.used_units < b.max_units && b.calls < b.max_calls;
      return clone({ missionId, data, busy, uncertain, needsRefresh, lastError, disposed, canWrite,
        canWriteCheckpoint: !!canWrite && data?.capabilities?.checkpoint===1
          && data.capabilities.checkpoint_write===true,
        canStop: !!m && !busy && !disposed && !m.stopped });
    }
    async function exclusive(action) {
      if (disposed) throw error('auth', 'Session fermée ; ouvrez une nouvelle session');
      if (busy) throw error('busy', 'Une opération est déjà en cours');
      busy = true; lastError = null;
      try { await action(); }
      catch (e) {
        if (disposed) throw error('auth', 'Session fermée');
        lastError = { code: e.code || 'unavailable', message: e.code ? e.message : 'Service indisponible' };
        throw error(lastError.code, lastError.message);
      } finally { busy = false; }
      return snapshot();
    }
    async function request(body, onDispatch, operationId) {
      const controller = new AbortController();
      activeController = controller;
      let timer, expired = false;
      const timeout = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
          expired = true; controller.abort();
          reject(error('unavailable', 'Délai dépassé ; relisez le registre'));
        }, 15000);
      });
      try {
        return await Promise.race([timeout, (async () => {
          const token = await options.getToken();
          if (disposed) throw error('auth', 'Session fermée');
          if (expired) throw error('unavailable', 'Délai dépassé');
          if (typeof token !== 'string' || !token) throw error('auth', 'Authentification requise');
          if (onDispatch) onDispatch();
          const response = await fetcher(body ? '/api/leo-registre'
            : '/api/leo-registre?mission=' + encodeURIComponent(missionId)
              + (operationId ? '&operation_id=' + encodeURIComponent(operationId) : ''), {
            method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + token,
              ...(body ? { 'Content-Type': 'application/json' } : {}) },
            ...(body ? { body: JSON.stringify(body) } : {}),
            cache: 'no-store', credentials: 'omit', redirect: 'error', signal: controller.signal
          });
          const payload = await response.json();
          if (disposed) throw error('auth', 'Session fermée');
          if (!response.ok) {
            // Seuls les refus explicites du contrat API attestent l'absence d'effet.
            const code = response.status === 401 ? 'auth' : response.status === 403 ? 'denied'
              : response.status === 409 ? 'conflict' : response.status === 400 ? 'invalid' : 'unavailable';
            const e = error(code, code === 'auth' ? 'Authentification requise'
              : code === 'conflict' ? 'Action refusée ou version modifiée ; relisez le registre'
                : code === 'denied' ? 'Accès refusé' : 'Service indisponible');
            e.definitive = ['auth', 'denied', 'conflict', 'invalid'].includes(code)
              && plain(payload) && payload.ok === false && typeof payload.error === 'string';
            throw e;
          }
          if (!plain(payload) || payload.ok !== true || !plain(payload.data))
            throw error('unavailable', 'Réponse inexploitable ; relisez le registre');
          return payload.data;
        })()]);
      } finally { clearTimeout(timer); activeController = null; }
    }
    function reconcileProof(receipt) {
      if (!uncertain) return;
      if (uncertain.action === 'stop') {
        if (data.mission.stopped) clearUncertain();
        return;
      }
      const op = receipt || data.operations.find(o => o.operation_id === uncertain.operation_id);
      if (op?.status === 'completed' && op.result.mission_version === uncertain.expected_version + 1
        && op.result.mission_version <= data.mission.version
        && (!uncertain.stopRequested || data.mission.stopped)
        && (!uncertain.patch || patchMatches(op.result, uncertain.patch)))
        clearUncertain();
      // Une absence, même sans troncature, n'est jamais une preuve de non-exécution.
    }
    async function read() {
      needsRefresh = true;
      try {
        const fresh = await request();
        if (disposed) throw error('auth', 'Session fermée');
        if (!statusValid(fresh, missionId)) throw error('unavailable', 'Registre inexploitable');
        let receipt;
        if (uncertain?.action === 'write_memory'
          && !fresh.operations.some(o => o.operation_id === uncertain.operation_id)) {
          const found = await request(null, null, uncertain.operation_id);
          if (disposed) throw error('auth', 'Session fermée');
          if (!plain(found) || found.mission_id !== missionId
            || (found.operation !== null && (!operationValid(found.operation)
              || found.operation.operation_id !== uncertain.operation_id)))
            throw error('unavailable', 'Reçu inexploitable ; relisez le registre');
          receipt = found.operation;
        }
        data = fresh; needsRefresh = false; reconcileProof(receipt);
      } catch (e) { data = null; throw e; }
    }
    function requireMutation() {
      if (uncertain) throw error('uncertain', 'Résultat incertain ; vérifiez le reçu avant une nouvelle action');
      if (!data || needsRefresh) throw error('conflict', 'Relisez le registre avant une nouvelle action');
    }
    async function mutate(body) {
      let dispatched = false;
      const previous = clone(uncertain);
      // L'arrêt reste possible pendant la réconciliation d'une écriture.
      // Son reçu ne doit jamais effacer celui de l'écriture encore inconnue.
      const priorWrite = body.action === 'stop' && previous?.action === 'write_memory'
        ? clone(previous) : null;
      try {
        const answer = await request(body, () => {
          // Écrit avant le réseau : une fermeture de l'onglet ne transforme pas
          // un résultat inconnu en autorisation de rejouer. Pas de contenu métier.
          const pending = priorWrite ? { ...priorWrite, stopRequested: true }
            : { ...clone(body), expected_version: body.expected_version || data.mission.version,
              stopRequested: body.action === 'stop' };
          try { persistPending(pending); }
          catch { throw error('unavailable', 'Journal indisponible ; aucune commande envoyée'); }
          dispatched = true; uncertain = pending;
        });
        if (disposed) throw error('auth', 'Session fermée');
        if (body.action === 'stop') {
          if (!statusValid(answer, missionId) || !answer.mission.stopped)
            throw error('unavailable', 'Arrêt non confirmé');
          data = answer; needsRefresh = false;
        } else {
          if (answer.operation_id !== body.operation_id || answer.status !== 'completed'
            || !resultValid(answer.result) || answer.result.mission_version !== body.expected_version + 1
            || !patchMatches(answer.result, body.patch))
            throw error('unavailable', 'Écriture non confirmée');
          // Le reçu ne contient pas le budget courant : ne pas fabriquer un état complet.
          needsRefresh = true;
        }
        if (priorWrite) reconcileProof();
        else clearUncertain();
      } catch (e) {
        if (disposed) throw error('auth', 'Session fermée');
        needsRefresh = true;
        if (previous && (!dispatched || e.definitive)) {
          // Le refus de cette tentative n'annule pas une tentative antérieure.
          // Si la restauration du journal échoue, garder le verrou plus strict.
          try { persistPending(previous); uncertain = previous; }
          catch { uncertain = uncertain || previous; }
        } else if (!previous && e.definitive) clearUncertain();
        else if (!dispatched) uncertain = previous;
        if (e.code === 'auth' || e.code === 'denied') data = null;
        if (uncertain) throw error('uncertain', 'Résultat incertain ; relisez le registre sans rejouer');
        throw e;
      }
    }
    return Object.freeze({ snapshot,
      destroy: () => {
        disposed = true; activeController?.abort();
        data = null; missionId = null; uncertain = null; lastError = null; needsRefresh = true;
      },
      load: id => exclusive(async () => {
        if (!uuid(id)) throw error('invalid', 'Identifiant de mission invalide');
        id = id.toLowerCase();
        if (uncertain && id !== missionId) throw error('uncertain', 'Réconciliez la mission en cours');
        if (id !== missionId) { data = null; needsRefresh = true; }
        missionId = id; await read();
      }),
      reconcile: () => exclusive(async () => {
        if (!missionId) throw error('invalid', 'Ouvrez une mission');
        await read();
      }),
      write: patch => exclusive(async () => {
        requireMutation();
        if (!plain(patch) || !Object.keys(patch).length
          || !Object.keys(patch).every(k => ['state', 'next_action', 'checkpoint', 'checkpoint_command'].includes(k))
          || !checkpointPairValid(patch)
          || (Object.hasOwn(patch, 'state') && !STATES.includes(patch.state))
          || (Object.hasOwn(patch, 'next_action') && (typeof patch.next_action !== 'string'
            || patch.next_action.length > 4000))) throw error('invalid', 'Modification invalide');
        // Même projection pour le transport, le pending et le rapprochement du reçu.
        if(Object.hasOwn(patch,'checkpoint'))patch={...patch,checkpoint:validerCheckpoint(patch.checkpoint)};
        const m = data.mission, b = data.budget;
        if(Object.hasOwn(patch,'checkpoint')) {
          if(data.capabilities?.checkpoint!==1 || data.capabilities.checkpoint_write!==true)
            throw error('denied','Sauvegarde structurée indisponible pour cet accès');
          const c=patch.checkpoint_command;
          if(c.kind==='adopt' ? m.checkpoint!==null
            : !m.checkpoint || c.expected_task_id!==m.checkpoint.task_id || patch.checkpoint.task_id!==m.checkpoint.task_id)
            throw error('conflict','Identité de tâche divergente ; relisez le registre');
        }
        if (m.stopped || m.scope !== 'memory' || m.contract_version !== '1.1'
          || m.skill_version !== '1.0' || Date.parse(m.expires_at) <= Date.now()
          || m.version === Number.MAX_SAFE_INTEGER || b.used_units >= b.max_units || b.calls >= b.max_calls)
          throw error('denied', 'Mandat arrêté, expiré ou budget indisponible');
        if (!window.crypto?.randomUUID) throw error('unavailable', 'Identifiant sûr indisponible');
        await mutate({ action: 'write_memory', mission: missionId,
          operation_id: window.crypto.randomUUID(), expected_version: m.version, patch: clone(patch) });
      }),
      stop: () => exclusive(async () => {
        if (!missionId || !data) throw error('invalid', 'Ouvrez une mission avant de demander son arrêt');
        if (data.mission.stopped) return;
        await mutate({ action: 'stop', mission: missionId });
      })
    });
  }
  window.UltimaLeoRegistreClient = Object.freeze({ create, validateCheckpoint: validerCheckpoint });
})();
