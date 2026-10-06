"""Régressions d'audit 2026-10-05 : chaque test échoue sur c2835ed et passe corrigé."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

import json, shutil, signal, sqlite3, subprocess, sys, tempfile, threading, time, unittest
from pathlib import Path
from unittest.mock import patch

from finubar.leo_control import ControlLatch, LeoControl, control_violation
from finubar.leo_process import ProcessSupervisor
from leo import trial
from leo.control_r21.admission import AdmissionHost, RequestJournal
from leo.runtime.budget import BudgetLedger
from leo.runtime.policy import Context, Mandate, Refusal
from leo.trial_host import Binding, GoTrueIdentity, TrialHost


class AuditRegressions(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.d = Path(self.tmp.name)
    def tearDown(self):
        self.tmp.cleanup()

    def test_control_repository_aliases_trip(self):
        for alias in ('PaulGERARD161098/leo-control-r21.git', 'https://github.com/paulgerard161098/LEO-control-r21',
                      'PaulGERARD161098/leo-control-r21/'):
            self.assertEqual(control_violation('prepare_patch', alias), 'leo_control_write_attempt', alias)
        self.assertEqual(control_violation('prepare_patch', '../x'), 'leo_control_target_unknown')
        # Cas positif : un dépôt ordinaire reste admis.
        self.assertIsNone(control_violation('prepare_patch', 'PaulGERARD161098/Ultima-'))
        self.assertIsNone(control_violation('prepare_patch', 'owner/.github'))

    def test_relative_existing_target_inside_protected_path_trips(self):
        prot = self.d / 'installed' / 'control'; prot.mkdir(parents=True)
        old = os.getcwd(); os.chdir(self.d / 'installed'); self.addCleanup(os.chdir, old)
        self.assertEqual(control_violation('prepare_patch', 'installed/control', protected_paths=(prot,)), None)
        os.chdir(self.d)
        self.assertEqual(control_violation('prepare_patch', 'installed/control', protected_paths=(prot,)),
                         'leo_control_write_attempt')

    def test_trip_waits_for_running_admission_then_persists_both(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        ledger = BudgetLedger(self.d / 'canon.sqlite')
        ledger.create('m', dict(max_units=9, max_calls=9, max_attempts=9, max_delegates=1,
                                expires_at=time.time() + 99), authority=True)
        holder = sqlite3.connect(str(self.d / 'ctl.sqlite'), isolation_level=None, check_same_thread=False)
        holder.execute('BEGIN IMMEDIATE')
        threading.Timer(12.0, holder.rollback).start()  # au-delà de l'ancien délai de 10 s
        with self.assertRaisesRegex(Refusal, 'leo_self_control_attempt'):
            LeoControl(ledger, 'm', latch=latch).before_effect('change_control', 'x/y')
        holder.close()
        self.assertTrue(latch.stopped())
        self.assertTrue(ledger.status('m')['stopped'])

    def test_ledger_stop_recorded_even_if_latch_unavailable(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        ledger = BudgetLedger(self.d / 'canon.sqlite')
        ledger.create('m', dict(max_units=9, max_calls=9, max_attempts=9, max_delegates=1,
                                expires_at=time.time() + 99), authority=True)
        control = LeoControl(ledger, 'm', latch=latch)
        (self.d / 'ctl.sqlite').unlink()
        with self.assertRaisesRegex(Refusal, 'finubar_stop_unconfirmed'):
            control.before_effect('disable_control', 'x/y')
        self.assertTrue(ledger.status('m')['stopped'])

    def test_deleted_control_is_never_recreated_unstopped(self):
        path = self.d / 'ctl.sqlite'
        ControlLatch(path, initialize=True).trip('leo_self_control_attempt')
        path.unlink()
        with self.assertRaisesRegex(Refusal, 'control_unavailable'):
            ControlLatch(path, initialize=True)
        self.assertFalse(path.exists())

    def test_world_accessible_control_is_refused(self):
        path = self.d / 'ctl.sqlite'
        ControlLatch(path, initialize=True)
        path.chmod(0o666)
        with self.assertRaisesRegex(Refusal, 'control_permissions_unsafe'):
            ControlLatch(path)
        path.chmod(0o600); self.d.chmod(0o777)
        with self.assertRaisesRegex(Refusal, 'control_permissions_unsafe'):
            ControlLatch(path)
        self.d.chmod(0o700)
        self.assertFalse(ControlLatch(path).stopped())   # cas positif

    def test_rollback_of_control_file_never_rearms(self):
        # Audit C4 : restaurer une copie antérieure du verrou ne lève pas l'arrêt.
        path = self.d / 'ctl.sqlite'
        ControlLatch(path, initialize=True)
        shutil.copy(path, self.d / 'before-stop.sqlite')
        ControlLatch(path).trip('leo_self_control_attempt')
        shutil.copy(self.d / 'before-stop.sqlite', path)
        latch = ControlLatch(path)
        self.assertTrue(latch.stopped())
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            with latch.admission():
                pass

    def test_tombstone_can_live_outside_the_control_folder(self):
        control, anchor = self.d / 'control', self.d / 'anchor'
        control.mkdir(mode=0o700); anchor.mkdir(mode=0o700)
        latch = ControlLatch(control / 'ctl.sqlite', initialize=True, anchor_dir=anchor)
        self.assertFalse(latch.stopped())                       # cas positif
        latch.trip('owner_stop')
        self.assertTrue((anchor / 'ctl.sqlite.stopped').exists())
        shutil.rmtree(control); control.mkdir(mode=0o700)
        with self.assertRaisesRegex(Refusal, 'control_unavailable'):
            ControlLatch(control / 'ctl.sqlite', initialize=True, anchor_dir=anchor)

    def test_stop_is_acquired_even_while_an_admission_holds_the_base(self):
        path = self.d / 'ctl.sqlite'
        latch = ControlLatch(path, initialize=True, trip_timeout=0.2)
        holder = sqlite3.connect(str(path), isolation_level=None)
        holder.execute('BEGIN IMMEDIATE')
        with self.assertRaises(Exception):
            latch.trip('leo_self_control_attempt')             # base occupée : écriture SQLite impossible
        holder.rollback(); holder.close()
        self.assertTrue(latch.stopped())                       # mais la pierre tombale fait foi
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            with latch.admission():
                pass

    # --- Superviseur : C9, C10, C13 -------------------------------------------
    def _alive(self, pid):
        path = Path('/proc') / str(pid) / 'stat'
        try:
            return path.read_text().split(')')[-1].split()[0] != 'Z'
        except OSError:
            return False

    def _await(self, path):
        for _ in range(300):
            if path.exists() and path.read_text():
                return path.read_text()
            time.sleep(0.01)
        self.fail('fixture did not start')

    def _supervise(self, code, latch, seconds=5):
        return ProcessSupervisor(latch, (sys.executable, '-c', code), cwd=self.d,
                                 max_seconds=seconds, grace_seconds=0.05)

    def _assert_gone(self, pid):
        for _ in range(200):
            if not self._alive(pid):
                return
            time.sleep(0.01)
        os.kill(pid, signal.SIGKILL)
        self.fail('descendant still alive')

    def test_new_session_grandchild_dies_with_the_stop(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        mark = self.d / 'grandchild'
        code = ("import os,time\n"
                "if os.fork()==0:\n os.setsid()\n open(%r,'w').write(str(os.getpid()))\n time.sleep(30)\n"
                "time.sleep(30)\n") % str(mark)
        errors = []
        worker = threading.Thread(target=lambda: self._run(self._supervise(code, latch), errors))
        worker.start()
        grandchild = int(self._await(mark))
        latch.trip('owner_stop')
        worker.join(5)
        self.assertEqual([str(e) for e in errors], ['leo_agent_stopped'])
        self._assert_gone(grandchild)

    def test_daemonized_orphan_never_outlives_a_normal_exit(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        mark = self.d / 'daemon'
        code = ("import os,time\n"
                "if os.fork()==0:\n os.setsid()\n"
                " if os.fork()==0:\n  open(%r,'w').write(str(os.getpid()))\n  time.sleep(30)\n"
                " os._exit(0)\n"
                "time.sleep(0.3)\n") % str(mark)
        receipt = self._supervise(code, latch).run()
        self.assertEqual((receipt.state, receipt.returncode), ('exited', 0))
        self._assert_gone(int(self._await(mark)))

    def test_host_processes_outside_supervision_are_spared(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        bystander = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'])
        try:
            self._supervise('pass', latch).run()
            self.assertTrue(self._alive(bystander.pid))      # cas positif : pas de balayage aveugle
        finally:
            bystander.kill(); bystander.wait()

    def test_neighbour_sweeps_never_kill_a_supervised_child(self):
        # Cas positif de concurrence : dix lancements voisins balayent l'hôte
        # pendant qu'un enfant supervisé attend d'être libéré ; il doit finir
        # normalement (reçu exited 0 ; -9 s'il avait été tué par un balayage).
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        mark, release = self.d / 'long', self.d / 'release'
        code = ("import os,time; from pathlib import Path; open(%r,'w').write(str(os.getpid()))\n"
                "for _ in range(2000):\n"
                "    if Path(%r).exists(): raise SystemExit(0)\n"
                "    time.sleep(0.01)\n"
                "raise SystemExit(3)\n") % (str(mark), str(release))
        receipts, errors = [], []
        def run():
            try:
                receipts.append(self._supervise(code, latch, 60).run())
            except BaseException as error:
                errors.append(error)
        worker = threading.Thread(target=run)
        worker.start()
        self._await(mark)
        for _ in range(10):
            self._supervise('pass', latch).run()
        release.write_text('go')
        worker.join(30)
        self.assertEqual([repr(e) for e in errors], [])
        self.assertEqual([(r.state, r.returncode) for r in receipts], [('exited', 0)])

    def test_direct_child_dies_if_the_supervisor_is_killed(self):
        path = self.d / 'ctl.sqlite'; ControlLatch(path, initialize=True)
        mark = self.d / 'child'
        child = "import os,time; open(%r,'w').write(str(os.getpid())); time.sleep(30)" % str(mark)
        runner = ("import sys; sys.path.insert(0, %r)\n"
                  "from finubar.leo_control import ControlLatch\nfrom finubar.leo_process import ProcessSupervisor\n"
                  "ProcessSupervisor(ControlLatch(%r), (sys.executable,'-c',%r), cwd=%r, max_seconds=60).run()\n"
                  ) % (os.getcwd(), str(path), child, str(self.d))
        host = subprocess.Popen([sys.executable, '-c', runner], env=dict(os.environ))
        pid = int(self._await(mark))
        host.kill(); host.wait()
        self._assert_gone(pid)

    def test_child_runs_without_core_dump_and_bounded_descriptors(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        out = self.d / 'limits'
        code = ("import resource; open(%r,'w').write(repr((resource.getrlimit(resource.RLIMIT_CORE),"
                "resource.getrlimit(resource.RLIMIT_NOFILE)[1])))") % str(out)
        self._supervise(code, latch).run()
        core, files = eval(out.read_text())
        self.assertEqual(core, (0, 0))
        self.assertLessEqual(files, 256)

    @staticmethod
    def _run(supervisor, errors):
        try:
            supervisor.run()
        except BaseException as error:
            errors.append(error)

    # --- Revue Codex du 06/10 sur #353 -----------------------------------------
    def _owner_trial(self):
        root, ctx, mandate = self._trial()
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        ident = GoTrueIdentity('http://127.0.0.1:9999', 'fiction')
        return root, mandate, latch, ident, ctx

    def test_owner_stop_passes_through_the_six_field_channel(self):
        root, mandate, latch, ident, ctx = self._owner_trial()
        host = AdmissionHost(TrialHost(ident, {'paul': Binding(root, trial.OWNER, mandate, ctx, ())},
                                       control_latch=latch),
                             RequestJournal(self.d / 'req.sqlite', initialize=True))
        def body(cmd):
            return json.dumps(dict(protocol_version=1, request_id='r-' + cmd, mission_id=trial.MISSION,
                operation_id='r21-merge-1', command=cmd, expected_version=2)).encode()
        with patch.object(ident, 'authenticate', return_value='paul'):
            with self.assertRaisesRegex(Refusal, 'scope_denied'):
                host.call('Bearer x', body('status'))            # Paul n'est pas un acteur
            self.assertTrue(host.call('Bearer x', body('stop'))['result']['stopped'])
        self.assertTrue(latch.stopped())

    def test_owner_only_states_are_enforced_by_the_store(self):
        from leo.runtime.memoire import AccessDenied, MissionStore
        store = MissionStore(self.d / 'm.sqlite')
        store.create_mission('m', 'paul', 'p', {}, {}, [], ['leo'], authority=True)
        with self.assertRaises(AccessDenied):
            store.update_mission('m', 'leo', 1, {'state': 'merged'})
        with self.assertRaises(AccessDenied):
            store.apply_memory_operation('m', 'leo', 'op', 1, {'state': 'approved_for_merge'})
        self.assertEqual(store.update_mission('m', 'leo', 1, {'state': 'merged'},
                                              host_bookkeeping=True)['state'], 'merged')
        self.assertEqual(store.update_mission('m', 'paul', 2, {'state': 'approved_for_merge'})['state'],
                         'approved_for_merge')                   # cas positif : le propriétaire

    def test_unrelated_new_session_host_child_is_spared(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        bystander = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'],
                                     start_new_session=True)
        try:
            self._supervise('pass', latch).run()
            self.assertTrue(self._alive(bystander.pid))
        finally:
            bystander.kill(); bystander.wait()

    def test_launch_uses_no_preexec_hook(self):
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        real, calls = subprocess.Popen, []
        def spy(*args, **kwargs):
            calls.append(kwargs)
            return real(*args, **kwargs)
        with patch('finubar.leo_process.subprocess.Popen', spy):
            self._supervise('pass', latch).run()
        self.assertEqual(len(calls), 1)
        self.assertIsNone(calls[0].get('preexec_fn'))

    def test_installation_marker_precedes_the_schema(self):
        path = self.d / 'ctl.sqlite'
        with patch.object(ControlLatch, '_transaction', side_effect=RuntimeError('panne')):
            with self.assertRaises(RuntimeError):
                ControlLatch(path, initialize=True)
        self.assertTrue((self.d / 'ctl.sqlite.installed').exists())
        with self.assertRaisesRegex(Refusal, 'control_unavailable'):
            ControlLatch(path, initialize=True)                  # jamais une nouvelle installation

    def test_relative_target_under_control_trips_before_it_exists(self):
        prot = self.d / 'installed' / 'control'; prot.mkdir(parents=True)
        old = os.getcwd(); os.chdir(self.d / 'installed'); self.addCleanup(os.chdir, old)
        self.assertEqual(control_violation('prepare_patch', 'control/nouveau', protected_paths=(prot,)),
                         'leo_control_write_attempt')
        self.assertIsNone(control_violation('prepare_patch', 'autre/depot', protected_paths=(prot,)))

    def test_request_journal_refuses_shared_permissions(self):
        path = self.d / 'req.sqlite'
        RequestJournal(path, initialize=True)
        path.chmod(0o666)
        with self.assertRaisesRegex(Refusal, 'journal_permissions_unsafe'):
            RequestJournal(path)
        path.chmod(0o600)
        RequestJournal(path)                                     # cas positif

    def _trial(self):
        root = self.d / 'trial'
        prepared = trial.prepare(root, dict(source='a'*40, target='b'*40, integration='c'*40))
        ctx = Context(**prepared['fixture_context'])
        exp = json.loads((root / 'manifest.json').read_text())['mandate_expires_at']
        mandate = Mandate(trial.MISSION, trial.OWNER, 1, frozenset({trial.ACTOR, 'inspector'}),
            frozenset({ctx.repository}), frozenset({'status', 'merge_fixture', 'read_source'}),
            quadrants=frozenset({'code'}), expires_at=exp)
        return root, ctx, mandate

    def test_owner_stop_is_global_and_independent_of_leo(self):
        root, ctx, mandate = self._trial()
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        ident = GoTrueIdentity('http://127.0.0.1:9999', 'fiction')
        host = TrialHost(ident, {'paul': Binding(root, trial.OWNER, mandate, ctx, ()),
                                 'leo': Binding(root, trial.ACTOR, mandate, ctx, ())}, control_latch=latch)
        with self.assertRaisesRegex(Refusal, 'scope_denied'):
            host._call_authenticated('paul', {'command': 'execute'})   # Paul n'agit pas à la place de Léo
        self.assertTrue(host._call_authenticated('paul', {'command': 'stop'})['stopped'])
        self.assertTrue(latch.stopped())
        self.assertTrue(BudgetLedger(root / 'canonical.sqlite').status(trial.MISSION)['stopped'])
        with self.assertRaisesRegex(ValueError, 'invalid_stop_reason'):
            latch.trip('rearm')

    def test_full_journal_never_blocks_stop(self):
        root, ctx, mandate = self._trial()
        latch = ControlLatch(self.d / 'ctl.sqlite', initialize=True)
        ident = GoTrueIdentity('http://127.0.0.1:9999', 'fiction')
        host = AdmissionHost(TrialHost(ident, {'owner': Binding(root, trial.ACTOR, mandate, ctx, ())},
                                       control_latch=latch),
                             RequestJournal(self.d / 'req.sqlite', initialize=True))
        def body(rid, cmd='status'):
            return json.dumps(dict(protocol_version=1, request_id=rid, mission_id=trial.MISSION,
                operation_id='r21-merge-1', command=cmd, expected_version=2)).encode()
        with patch.object(ident, 'authenticate', return_value='owner'):
            for i in range(256):
                host.call('Bearer x', body('s%d' % i))
            with self.assertRaisesRegex(Refusal, 'request_journal_full'):
                host.call('Bearer x', body('one-more', 'execute'))  # le plafond reste effectif
            # Revue Codex du 06/10 : statut et réconciliation, sans nouvel effet,
            # restent possibles journal plein (sinon un « inconnu » est bloqué).
            self.assertFalse(host.call('Bearer x', body('status-plein'))['replayed'])
            # Aucune opération à réconcilier dans ce montage : le refus est MÉTIER,
            # preuve que la demande a franchi le journal plein.
            with self.assertRaisesRegex(Refusal, '^operation_unavailable$'):
                host.call('Bearer x', body('reconcile-plein', 'reconcile'))
            stopped = host.call('Bearer x', body('stop-now', 'stop'))
            self.assertTrue(stopped['result']['stopped'])
            self.assertFalse(stopped['replayed'])                  # exécuté, pas rejoué
        self.assertTrue(BudgetLedger(root / 'canonical.sqlite').status(trial.MISSION)['stopped'])


if __name__ == '__main__':
    unittest.main()
