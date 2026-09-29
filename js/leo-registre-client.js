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
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const version = value => Number.isSafeInteger(value) && value > 0;
  const resultValid = value => plain(value) && version(value.mission_version)
    && STATES.includes(value.state) && typeof value.next_action === 'string'
    && value.next_action.length <= 4000;
  function error(code, message) { return Object.assign(new Error(message), { code }); }
  function statusValid(data, missionId) {
    const m = data?.mission, b = data?.budget;
    return plain(data) && plain(m) && m.id === missionId && version(m.version)
      && STATES.includes(m.state) && typeof m.next_action === 'string' && m.next_action.length <= 4000
      && typeof m.stopped === 'boolean' && typeof m.scope === 'string'
      && typeof m.contract_version === 'string' && typeof m.skill_version === 'string'
      && typeof m.expires_at === 'string' && Number.isFinite(Date.parse(m.expires_at))
      && plain(b) && ['max_units', 'max_calls', 'used_units', 'calls'].every(k =>
        Number.isSafeInteger(b[k]) && b[k] >= 0 && b[k] <= 100000)
      && b.used_units <= b.max_units && b.calls <= b.max_calls
      && Array.isArray(data.operations) && data.operations.length <= 100
      && typeof data.operations_truncated === 'boolean'
      && data.operations.every(o => plain(o) && typeof o.operation_id === 'string'
        && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(o.operation_id)
        && ['completed', 'pending', 'unknown'].includes(o.status)
        && (o.status === 'completed' ? resultValid(o.result) : o.result === null));
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
      return clone({ missionId, data, busy, uncertain, needsRefresh, lastError, disposed,
        canWrite: ready && !m.stopped && m.scope === 'memory'
          && m.contract_version === '1.1' && m.skill_version === '1.0'
          && Date.parse(m.expires_at) > Date.now() && m.version < Number.MAX_SAFE_INTEGER
          && b.used_units < b.max_units && b.calls < b.max_calls,
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
    async function request(body, onDispatch) {
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
            : '/api/leo-registre?mission=' + encodeURIComponent(missionId), {
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
    function reconcileProof() {
      if (!uncertain) return;
      if (uncertain.action === 'stop') {
        if (data.mission.stopped) clearUncertain();
        return;
      }
      const op = data.operations.find(o => o.operation_id === uncertain.operation_id);
      if (op?.status === 'completed' && op.result.mission_version === uncertain.expected_version + 1
        && (!uncertain.stopRequested || data.mission.stopped)
        && (!uncertain.patch || Object.keys(uncertain.patch).every(k => op.result[k] === uncertain.patch[k])))
        clearUncertain();
      // Une absence, même sans troncature, n'est jamais une preuve de non-exécution.
    }
    async function read() {
      needsRefresh = true;
      try {
        const fresh = await request();
        if (disposed) throw error('auth', 'Session fermée');
        if (!statusValid(fresh, missionId)) throw error('unavailable', 'Registre inexploitable');
        data = fresh; needsRefresh = false; reconcileProof();
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
            || !Object.keys(body.patch).every(k => answer.result[k] === body.patch[k]))
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
          || !Object.keys(patch).every(k => ['state', 'next_action'].includes(k))
          || (Object.hasOwn(patch, 'state') && !STATES.includes(patch.state))
          || (Object.hasOwn(patch, 'next_action') && (typeof patch.next_action !== 'string'
            || patch.next_action.length > 4000))) throw error('invalid', 'Modification invalide');
        const m = data.mission, b = data.budget;
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
  window.UltimaLeoRegistreClient = Object.freeze({ create });
})();
