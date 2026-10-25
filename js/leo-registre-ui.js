/* Mission Léo : données et brouillon en mémoire de cette page uniquement. */
(function () {
  'use strict';
  var session = null, client = null, epoch = 0, dirty = false;
  var listeners = new Set();
  function notify() { listeners.forEach(function (fn) { fn(client ? client.snapshot() : null); }); }
  var labels = { proposed: 'Proposée', authorized: 'Autorisée', in_progress: 'En cours', ready_for_review: 'À relire', approved_for_merge: 'Fusion approuvée', merged: 'Fusionnée', closed: 'Terminée', blocked: 'Bloquée', suspended: 'Suspendue', abandoned: 'Abandonnée' };
  function el(id) { return document.getElementById('leo-mission-' + id); }
  function message(text) { el('message').textContent = text; }
  function render() {
    notify();
    var s = client ? client.snapshot() : {}, m = s.data && s.data.mission;
    el('ouvrir').disabled = !session || !client;
    el('consulter').disabled = !client || s.busy || !!s.uncertain;
    el('id').disabled = !!s.busy || !!s.uncertain;
    el('detail').hidden = !m;
    el('relire').disabled = !s.missionId || s.busy;
    el('enregistrer').disabled = !s.canWrite || !dirty;
    el('arreter').disabled = !s.canStop;
    el('dialog').setAttribute('aria-busy', s.busy ? 'true' : 'false');
    el('edition').disabled = !m || !!s.busy;
    el('abandonner').disabled = !dirty || !!s.busy;
    if (!m) { el('courant').textContent = ''; el('budget').textContent = ''; return; }
    el('courant').textContent = (m.stopped ? 'Arrêtée' : (labels[m.state] || m.state)) + ' · Version ' + m.version;
    el('prochaine').textContent = m.next_action || 'Aucune prochaine action renseignée.';
    var b = s.data.budget;
    el('budget').textContent = b ? 'Mémoire : ' + b.used_units + ' / ' + b.max_units + ' écritures · ' + b.calls + ' / ' + b.max_calls + ' appels.' : '';
    if (!dirty) { el('etat').value = m.state; el('action').value = m.next_action || ''; }
    el('brouillon').textContent = dirty ? 'Brouillon non enregistré, conservé pendant la relecture.' : 'Modifier ce mémo ne déclenche aucune action externe.';
  }
  var errors = { busy: 'Une demande est déjà en cours.', invalid: 'Vérifie l’identifiant et les champs saisis.', auth: 'Reconnecte-toi pour consulter cette mission.', conflict: 'La mission a changé. Relis le registre, compare avec ton brouillon puis enregistre à nouveau.', denied: 'Cette opération n’est pas autorisée pour ton compte.', uncertain: 'Résultat non confirmé. Relis le registre avant toute nouvelle écriture. Aucun renvoi automatique.', unavailable: 'Registre indisponible. Réessaie la lecture plus tard.' };
  async function run(method, arg, success) {
    if (!client) { return; }
    var mine = epoch, active = client, previous = client.snapshot(), writeConfirmed = false;
    try {
      var pending = active[method](arg);
      render();
      await pending;
      if (mine !== epoch) { return; }
      if (method === 'write') {
        writeConfirmed = true;
        dirty = false;
        // Lecture de confirmation uniquement ; jamais de répétition du POST.
        await active.reconcile();
        if (mine !== epoch) { return; }
        success = 'Mémo enregistré et version confirmée.';
      }
      var s = active.snapshot();
      if (previous.uncertain && previous.uncertain.action === 'write_memory' && !s.uncertain) {
        var m = s.data && s.data.mission;
        if (!dirty || (m && el('etat').value === m.state && el('action').value === m.next_action)) {
          dirty = false;
          success = 'Écriture précédente confirmée, aucun nouvel envoi.';
        } else { success = 'Écriture précédente confirmée. Ton brouillon est conservé : compare-le à la version enregistrée.'; }
      }
      message(s.uncertain ? ((s.data && s.data.mission.stopped ? 'Mission arrêtée. ' : '') + errors.uncertain) : success);
    } catch (e) {
      if (mine !== epoch) { return; }
      message(writeConfirmed ? 'Mémo enregistré, mais lecture de confirmation indisponible. Relis le registre avant de continuer.' : (errors[e.code] || 'La demande a échoué. Relis le registre avant de continuer.'));
    } finally { if (mine === epoch) { render(); } }
  }
  function poserSession(next) {
    var oldId = session && session.user && session.user.id;
    var newId = next && next.user && next.user.id;
    if (oldId !== newId || !next) {
      epoch += 1;
      if (client && typeof client.destroy === 'function') { client.destroy(); }
      client = null; dirty = false;
      if (el('dialog').open) { el('dialog').close(); }
      el('chargement').reset(); el('edition-form').reset();
      el('prochaine').textContent = ''; message('Consulte une mission existante avec son identifiant.');
    }
    session = next && newId ? next : null;
    if (session && !client && window.UltimaLeoRegistreClient) {
      try {
        client = window.UltimaLeoRegistreClient.create({
          getToken: function () { return session && session.access_token; },
          recoveryStore: window.sessionStorage, recoveryKey: 'ultima-leo-recovery:' + newId
        });
        if (client.snapshot().uncertain) { message(errors.uncertain); el('id').value = client.snapshot().missionId || ''; }
      } catch (e) { message('La reprise sûre n’est pas disponible dans cet onglet. Autorise le stockage de session puis recharge la page.'); }
    }
    render();
  }
  function init() {
    if (!el('dialog')) { return; }
    el('ouvrir').addEventListener('click', function () { el('dialog').showModal(); });
    el('fermer').addEventListener('click', function () { el('dialog').close(); });
    el('chargement').addEventListener('submit', function (event) {
      event.preventDefault();
      if (dirty) { message('Ton brouillon est conservé. Enregistre-le ou utilise « Abandonner le brouillon » avant de changer de mission.'); return; }
      run('load', el('id').value.trim(), 'Mission consultée. Les droits sont contrôlés par le registre.');
    });
    el('edition-form').addEventListener('submit', function (event) {
      event.preventDefault();
      run('write', { state: el('etat').value, next_action: el('action').value }, 'Mémo enregistré. Relis le registre pour afficher la version confirmée.');
    });
    el('edition').addEventListener('input', function () { dirty = true; render(); });
    el('abandonner').addEventListener('click', function () { dirty = false; render(); message('Brouillon abandonné.'); });
    el('relire').addEventListener('click', function () { run('reconcile', undefined, 'Registre relu. Compare la version courante et ton brouillon avant toute écriture.'); });
    el('arreter').addEventListener('click', function () { run('stop', undefined, 'Arrêt confirmé. Les nouvelles écritures sont bloquées.'); });
    window.addEventListener('beforeunload', function (event) {
      if (dirty || (client && client.snapshot().uncertain)) { event.preventDefault(); event.returnValue = ''; }
    });
    window.UltimaLeoRegistreUI = {
      poserSession: poserSession,
      snapshot: function () { return client ? client.snapshot() : null; },
      generation: function () { return epoch; },
      subscribe: function (fn) { listeners.add(fn); return function () { listeners.delete(fn); }; },
      checkpoint: async function (missionId, expectedVersion, value, command) {
        var active = client, mine = epoch, s = active && active.snapshot();
        if (!s || s.missionId !== missionId || s.data?.mission.version !== expectedVersion
          || !s.canWriteCheckpoint) { throw new Error('Relis la mission avant de sauvegarder le suivi.'); }
        try {
          var pending = active.write({ checkpoint: value, checkpoint_command: command });
          render(); await pending;
          if (mine !== epoch || client !== active) { throw new Error('Session modifiée.'); }
          await active.reconcile();
          if (mine !== epoch || client !== active) { throw new Error('Session modifiée.'); }
          return active.snapshot();
        } finally { render(); }
      },
      relireCheckpoint: async function (missionId) {
        var active = client, mine = epoch;
        if (!active || active.snapshot().missionId !== missionId) { throw new Error('Mission indisponible.'); }
        try {
          var pending = active.reconcile(); render(); await pending;
          if (mine !== epoch || client !== active) { throw new Error('Session modifiée.'); }
          return active.snapshot();
        } finally { render(); }
      }
    };
    render();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
