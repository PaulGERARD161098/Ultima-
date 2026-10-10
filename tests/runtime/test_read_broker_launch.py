"""Broker + real launcher logic in the existing isolated runtime container.

Only Docker syscalls are synthetic here; closed CI relay separately exercises
the same broker/launcher with actual offline worker containers.
"""
from dataclasses import replace
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

from finubar.leo_control import ControlLatch
from leo.control_r21.read_candidate import ReadBroker, ReadLaunchConfig, SnapshotAdapter, WorkerPlan, snapshot_bytes
from leo.control_r21.read_launcher import ReadLauncher
from leo.control_r21.read_worker import report
from leo.runtime.broker import mandate_record
from leo.runtime.memoire import AccessDenied
from leo.runtime.policy import Mandate, Refusal
from test_read_launcher import FakeDocker


class ReadBrokerLaunchTests(unittest.TestCase):
    def setUp(self):
        self.assertEqual(os.environ.get('LV1_ISOLATED'), '1')
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.claims = self.root / 'claims'; self.claims.mkdir(mode=0o700)
        self.latch = ControlLatch(self.root / 'control.sqlite', initialize=True)
        self.now = 100
        self.mandate = Mandate('read-launch', 'paul', 1, frozenset({'root'}),
            frozenset({'PaulGERARD161098/Ultima-'}), frozenset({'read_source', 'status'}), expires_at=200)
        self.value = {'repository':'PaulGERARD161098/Ultima-', 'measured_at':'2026-10-10T13:00:00Z',
            'prs':[{'number':365,'head_sha':'a'*40,'title':'fixture','state':'open','checks':'unverified'}]}
        self.adapter = SnapshotAdapter(self.value)
        self.worker = self.root / 'worker.py'; self.worker.write_bytes(b'print("fixture")\n')
        self.snapshot = self.root / 'snapshot.json'; self.snapshot.write_bytes(snapshot_bytes(self.value))
        self.config = ReadLaunchConfig(WorkerPlan('python@sha256:'+'c'*64,self.worker,self.snapshot),
            hashlib.sha256(self.worker.read_bytes()).hexdigest(),self.claims,max_seconds=2)
        self.db = self.root / 'mission.sqlite'
        self.broker = self.fresh()
        self.broker.store.create_mission('read-launch','paul','ultima',mandate_record(self.mandate),
            {'repository':'PaulGERARD161098/Ultima-'},[],['root'],authority=True)
        self.broker.budget.create('read-launch',{'max_units':2,'max_calls':2,'max_attempts':2,
            'max_delegates':0,'expires_at':200},authority=True)
        self.proposal = {'action':'read_source','operation_id':'operation','expected_version':1}
        self.fake = FakeDocker(report(self.snapshot.read_bytes())+b'\n')
        self.patcher = patch('leo.control_r21.read_watchdog.GuardedTransport',return_value=self.fake)
        self.patcher.start(); self.addCleanup(self.patcher.stop)

    def interrupted_fixture(self, reason='owner_lost', name_matches=True):
        payload=self.broker._launch_payload(self.proposal)
        self.broker.budget.reserve('read-launch','operation','root',1)
        self.broker.store.begin_operation('read-launch','root','operation',payload,1)
        claim_id=hashlib.sha256(json.dumps(['read-launch','operation'],separators=(',',':')).encode()).hexdigest()
        claim=self.claims/(claim_id+'.claim')
        name='leo-read-'+'a'*32
        claim.write_text(name+'\n'); claim.chmod(0o600)
        proof=Path(str(claim)+'.watchdog')
        proof.write_text(json.dumps({'container':name if name_matches else 'leo-read-'+'b'*32,
            'reason':reason,'container_removed':True})); proof.chmod(0o600)
        self.latch.trip('owner_stop')
        return proof

    def test_interrupted_reconciliation_keeps_budget_and_never_launches(self):
        self.interrupted_fixture()
        result=self.fresh().reconcile_interrupted('root','operation')
        self.assertEqual(result['status'],'unknown')
        self.assertIsNone(result['result'])
        self.assertEqual(self.fresh().reconcile_interrupted('root','operation'),result)
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)
        self.assertEqual(self.fake.starts,0)

    def test_interrupted_reconciliation_rejects_other_container_proof(self):
        self.interrupted_fixture(name_matches=False)
        with self.assertRaisesRegex(Refusal,'interrupted_cleanup_proof_required'):
            self.fresh().reconcile_interrupted('root','operation')
        self.assertEqual(self.operation()['status'],'pending')

    def test_interrupted_reconciliation_rejects_normal_cleanup_as_completion(self):
        self.interrupted_fixture(reason='normal_cleanup')
        with self.assertRaisesRegex(Refusal,'interrupted_cleanup_proof_required'):
            self.fresh().reconcile_interrupted('root','operation')

    def test_interrupted_reconciliation_requires_habilitated_writer(self):
        self.interrupted_fixture()
        with self.assertRaises(AccessDenied):
            self.fresh().reconcile_interrupted('untrusted','operation')
        self.assertEqual(self.operation()['status'],'pending')

    def fresh(self, **changes):
        return ReadBroker(self.db,changes.get('mandate',self.mandate),snapshot_adapter=changes.get('adapter',self.adapter),
            clock=lambda:self.now,control_latch=self.latch,launch_config=changes.get('config',self.config))

    def read(self, proposal=None):
        return self.broker.execute('root',proposal or self.proposal)

    def operation(self):
        return self.broker.store.get_operation('read-launch','root','operation')

    def test_single_launch_durable_completed_receipt_and_fresh_host(self):
        first=self.read()
        self.assertEqual(first['status'],'completed')
        self.assertTrue(first['result']['container_removed'])
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            self.assertEqual(self.fresh().execute('root',self.proposal),first)
        state=self.broker.budget.status('read-launch')
        self.assertEqual((state['calls'],state['used_units'],state['reserved_units']),(1,1,0))
        self.assertEqual(self.fake.starts,1)
        self.assertEqual(len(list(self.claims.glob('*.claim'))),1)

    def test_completed_response_lost_recovered_after_stop(self):
        original=self.broker.store.complete_operation
        def commit_then_lose(*args,**kwargs):
            original(*args,**kwargs)
            raise OSError('fixture_response_lost')
        with patch.object(self.broker.store,'complete_operation',side_effect=commit_then_lose):
            with self.assertRaises(OSError): self.read()
        self.assertEqual(self.operation()['status'],'completed')
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)
        self.latch.trip('owner_stop')
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            result=self.fresh().reconcile_completed('root','operation')
        self.assertEqual(result['status'],'completed')
        self.assertEqual(self.broker.budget.status('read-launch')['used_units'],1)
        self.assertEqual(self.fake.starts,1)

    def test_lost_result_before_checkpoint_is_unknown_never_replayed(self):
        with patch.object(self.broker.store,'complete_operation',side_effect=OSError('fixture_checkpoint_lost')):
            with self.assertRaises(OSError): self.read()
        self.assertEqual(self.operation()['status'],'unknown')
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            self.assertEqual(self.fresh().execute('root',self.proposal)['status'],'unknown')
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)
        with self.assertRaisesRegex(Refusal,'completed_receipt_required'):
            self.fresh().reconcile_completed('root','operation')

    def test_settlement_lost_completed_receipt_survives(self):
        with patch.object(self.broker.budget,'settle',side_effect=OSError('fixture_settlement_lost')):
            with self.assertRaises(OSError): self.read()
        self.latch.trip('owner_stop')
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            self.fresh().reconcile_completed('root','operation')
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],0)

    def test_host_interrupt_is_unknown_and_not_launched_again(self):
        with patch.object(ReadLauncher,'run',side_effect=SystemExit('fixture_interrupted')):
            with self.assertRaises(SystemExit): self.read()
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            self.assertEqual(self.fresh().execute('root',self.proposal)['status'],'unknown')
        self.assertEqual(self.fake.starts,0)

    def test_pending_checkpoint_never_dispatches_on_fresh_host(self):
        self.broker.budget.reserve('read-launch','operation','root',1)
        self.broker.store.begin_operation('read-launch','root','operation',
            self.broker._launch_payload(self.proposal),1)
        with patch.object(ReadLauncher,'run',side_effect=AssertionError('no replay')):
            self.assertEqual(self.fresh().execute('root',self.proposal)['status'],'pending')
        self.assertEqual(self.fake.starts,0)
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)

    def test_second_host_during_poll_observes_pending_without_second_start(self):
        observed=[]
        self.fake.on_poll=lambda:observed.append(self.fresh().execute('root',self.proposal))
        first=self.read()
        self.assertEqual(first['status'],'completed')
        self.assertEqual([op['status'] for op in observed],['pending'])
        self.assertEqual(self.fake.starts,1)
        self.assertEqual(self.broker.budget.status('read-launch')['calls'],1)

    def test_reservation_without_operation_never_dispatches(self):
        self.broker.budget.reserve('read-launch','operation','root',1)
        self.assertEqual(self.read()['reason'],'read_reservation_without_receipt')
        self.assertEqual(self.fake.starts,0)

    def test_zero_budget_denies_before_claim_and_start(self):
        with self.broker.budget._transaction() as db:
            db.execute('UPDATE budget_missions SET max_units=0 WHERE mission=?',('read-launch',))
        with self.assertRaisesRegex(RuntimeError,'units_exhausted'): self.read()
        self.assertEqual(self.fake.calls,[])
        self.assertEqual(list(self.claims.iterdir()),[])

    def test_exhausted_budget_denies_third_launch(self):
        self.read()
        self.read({**self.proposal,'operation_id':'second'})
        with self.assertRaisesRegex(RuntimeError,'units_exhausted'):
            self.read({**self.proposal,'operation_id':'third'})
        self.assertEqual(self.fake.starts,2)

    def test_global_stop_before_execute_leaves_no_reservation(self):
        self.latch.trip('owner_stop')
        with self.assertRaisesRegex(Refusal,'leo_agent_stopped'): self.read()
        self.assertEqual(self.broker.budget.status('read-launch')['calls'],0)
        self.assertEqual(self.fake.starts,0)

    def test_global_stop_after_create_prevents_start(self):
        self.fake.on_create=lambda:self.latch._bury('owner_stop')
        with self.assertRaisesRegex(Refusal,'leo_agent_stopped'): self.read()
        self.assertEqual(self.fake.starts,0)
        self.assertEqual(self.operation()['status'],'unknown')
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)

    def test_mission_stop_during_worker_cleans_and_retains_reservation(self):
        self.fake.hang=True
        self.fake.on_poll=lambda:self.broker.budget.stop('read-launch','fixture_stop',authority=True)
        with self.assertRaisesRegex(Refusal,'read_stopped_or_expired'): self.read()
        self.assertIn(('rm','--force',self.fake.cid),self.fake.calls)
        self.assertEqual(self.operation()['status'],'unknown')
        self.assertEqual(self.broker.budget.status('read-launch')['reserved_units'],1)

    def test_mandate_expiry_during_worker_cleans_up(self):
        self.fake.hang=True
        self.fake.on_poll=lambda:setattr(self,'now',201)
        with self.assertRaisesRegex(Refusal,'expired'): self.read()
        self.assertIn(('rm','--force',self.fake.cid),self.fake.calls)

    def test_mission_version_change_during_worker_cleans_up(self):
        self.fake.hang=True
        self.fake.on_poll=lambda:self.broker.store.update_mission('read-launch','root',1,{'next_action':'changed'})
        with self.assertRaisesRegex(RuntimeError,'Version changed'): self.read()
        self.assertIn(('rm','--force',self.fake.cid),self.fake.calls)

    def test_start_admission_holds_shared_stop_transaction(self):
        original_start=self.fake.start
        def attempt_concurrent_stop(cid):
            with sqlite3.connect(self.db,timeout=0) as second:
                with self.assertRaisesRegex(sqlite3.OperationalError,'locked'):
                    second.execute('UPDATE budget_missions SET stopped=1 WHERE mission=?',('read-launch',))
            original_start(cid)
        self.fake.start=attempt_concurrent_stop
        self.read()

    def test_forged_report_never_records_completed_or_settles(self):
        self.fake.output=b'{"autonomous_agent":true}\n'
        with self.assertRaisesRegex(Refusal,'read_worker_result_invalid'): self.read()
        self.assertEqual(self.operation()['status'],'unknown')
        self.assertEqual(self.broker.budget.status('read-launch')['used_units'],0)

    def test_changed_image_or_worker_context_cannot_reuse_receipt(self):
        self.read()
        for config in (replace(self.config,worker_sha256='b'*64),
                       replace(self.config,plan=replace(self.config.plan,image='python@sha256:'+'b'*64))):
            with self.assertRaisesRegex(Refusal,'operation_conflict'):
                self.fresh(config=config).execute('root',self.proposal)
            with self.assertRaisesRegex(Refusal,'operation_context_mismatch'):
                self.fresh(config=config).reconcile_completed('root','operation')

    def test_scope_and_untrusted_authority_fields_denied_without_docker(self):
        for key in ('repository','authority','claim','worker_sha256','image','principal'):
            with self.assertRaisesRegex(Refusal,'unexpected_argument'):
                self.read({**self.proposal,key:'untrusted'})
        with self.assertRaises(AccessDenied): self.broker.execute('outsider',self.proposal)
        self.assertEqual(self.fake.calls,[])

    def test_wrong_skill_version_denied_before_reservation(self):
        wrong=replace(self.mandate,skill_version='1.4')
        with self.broker.store._transaction() as db:
            db.execute('UPDATE missions SET mandat=? WHERE id=?',(json.dumps(mandate_record(wrong)),'read-launch'))
        with self.assertRaisesRegex(Refusal,'version_mismatch'):
            self.fresh(mandate=wrong).execute('root',self.proposal)
        self.assertEqual(self.broker.budget.status('read-launch')['calls'],0)

    def test_durable_claim_alone_never_becomes_completed_proof(self):
        original_run=ReadLauncher.run
        def lose_result(launcher):
            original_run(launcher)
            raise OSError('fixture_return_lost')
        with patch.object(ReadLauncher,'run',side_effect=lose_result,autospec=True):
            with self.assertRaises(OSError): self.read()
        self.assertTrue(list(self.claims.glob('*.claim')))
        self.assertEqual(self.operation()['status'],'unknown')
        with self.assertRaisesRegex(Refusal,'completed_receipt_required'):
            self.fresh().reconcile_completed('root','operation')
        self.assertEqual(self.fake.starts,1)


if __name__=='__main__':
    unittest.main()
