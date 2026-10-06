"""Régressions d'audit 2026-10-05 : chaque test échoue sur c2835ed et passe corrigé."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

import json, shutil, sqlite3, tempfile, threading, time, unittest
from pathlib import Path
from unittest.mock import patch

from finubar.leo_control import ControlLatch, LeoControl, control_violation
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
                host.call('Bearer x', body('one-more'))           # le plafond reste effectif
            self.assertTrue(host.call('Bearer x', body('stop-now', 'stop'))['result']['stopped'])
        self.assertTrue(BudgetLedger(root / 'canonical.sqlite').status(trial.MISSION)['stopped'])


if __name__ == '__main__':
    unittest.main()
