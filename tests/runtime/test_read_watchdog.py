"""Isolated guardian process tests. Docker removal is separately tested in CI."""
import hashlib
import json
import os
from pathlib import Path
import signal
import tempfile
import time
import unittest

from finubar.leo_control import ControlLatch
from leo.control_r21.read_candidate import WorkerPlan
from leo.control_r21.read_launcher import _create_args
from leo.control_r21.read_watchdog import GuardedTransport
from leo.runtime.policy import Refusal


class WatchdogTests(unittest.TestCase):
    def setUp(self):
        if os.environ.get('LV1_ISOLATED') != '1':
            raise RuntimeError('isolated_runtime_required')
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.latch = ControlLatch(self.root/'control.sqlite', initialize=True)
        worker, snapshot = self.root/'worker.py', self.root/'snapshot.json'
        worker.write_text('pass\n'); snapshot.write_text('{}')
        self.plan = WorkerPlan('python@sha256:'+'a'*64,worker,snapshot)
        self.name, self.cid = 'leo-read-'+'b'*32, 'c'*64
        self.claim = self.root/'operation.claim'
        self.claim.write_text(self.name+'\n'); self.claim.chmod(0o600)
        self.trace = self.root/'trace'

    def factory(self, *, close_fail=False, rm_fail=False, kill_create=False):
        trace, cid = self.trace, self.cid
        class Docker:
            def event(self, event):
                with trace.open('a') as stream: stream.write(event+'\n')
            def call(self,args):
                self.event(args[0])
                if args[0]=='create':
                    if kill_create: os.kill(os.getppid(),signal.SIGKILL)
                    return 0,cid.encode()+b'\n',b''
                if args[0]=='rm':
                    if rm_fail: raise OSError('synthetic_rm_failure')
                    return 0,b'',b''
                if args[:2]==('container','ls'): return 0,b'',b''
                raise AssertionError(args)
            def start(self,c): self.event('start')
            def poll(self): return b'',b'',None,False
            def close(self):
                self.event('close')
                if close_fail: raise OSError('synthetic_close_failure')
        return Docker

    def guardian(self, **kwargs):
        return GuardedTransport(self.plan,self.name,self.latch,self.claim,
            time.monotonic()+5,_factory=self.factory(**kwargs))

    def create(self, guard):
        return guard.call(_create_args(self.plan,self.name))

    def proof(self):
        return json.loads(Path(str(self.claim)+'.watchdog').read_bytes())

    def test_ready_create_start_cleanup_and_proof(self):
        guard=self.guardian()
        self.assertEqual(self.create(guard)[0],0)
        guard.start(self.cid)
        self.assertTrue(guard.cleanup_owned())
        self.assertEqual(self.trace.read_text().splitlines(),['create','start','close','rm','container'])
        self.assertEqual(self.proof(),{'container':self.name,'reason':'normal_cleanup','container_removed':True})
        self.assertFalse(self.latch.stopped())

    def test_close_failure_still_removes_and_observes(self):
        guard=self.guardian(close_fail=True)
        self.create(guard)
        with self.assertRaises(Refusal): guard.cleanup_owned()
        self.assertIn('rm',self.trace.read_text().splitlines())
        self.assertIn('container',self.trace.read_text().splitlines())
        self.assertFalse(self.proof()['container_removed'])
        self.assertTrue(self.latch.stopped())

    def test_rm_failure_still_attempts_observation(self):
        guard=self.guardian(rm_fail=True)
        self.create(guard)
        with self.assertRaises(Refusal): guard.cleanup_owned()
        self.assertIn('container',self.trace.read_text().splitlines())
        self.assertFalse(self.proof()['container_removed'])

    def test_arbitrary_command_is_denied_before_docker(self):
        guard=self.guardian()
        with self.assertRaises(Refusal): guard.call(('run','forbidden'))
        with self.assertRaises(Refusal): guard.cleanup_owned()
        self.assertEqual(self.trace.read_text().splitlines(),['close'])
        self.assertTrue(self.latch.stopped())

    def test_second_start_is_denied(self):
        guard=self.guardian(); self.create(guard); guard.start(self.cid)
        with self.assertRaises(Refusal): guard.start(self.cid)
        with self.assertRaises(Refusal): guard.cleanup_owned()
        self.assertEqual(self.trace.read_text().splitlines().count('start'),1)

    def test_owner_killed_during_create_never_starts(self):
        owner=os.fork()
        if owner==0:
            try:
                guard=self.guardian(kill_create=True)
                self.create(guard)
                guard.start(self.cid)
            finally: os._exit(2)
        _,status=os.waitpid(owner,0)
        self.assertTrue(os.WIFSIGNALED(status))
        self.assertEqual(os.WTERMSIG(status),signal.SIGKILL)
        until=time.monotonic()+5
        path=Path(str(self.claim)+'.watchdog')
        while not path.exists() and time.monotonic()<until: time.sleep(.01)
        self.assertTrue(self.proof()['container_removed'])
        self.assertNotIn('start',self.trace.read_text().splitlines())
        self.assertTrue(ControlLatch(self.latch.path).stopped())

    def test_deadline_is_independent_of_owner_polling(self):
        guard=GuardedTransport(self.plan,self.name,self.latch,self.claim,
            time.monotonic()+.3,_factory=self.factory())
        self.create(guard); guard.start(self.cid)
        time.sleep(.5)
        self.assertTrue(guard.cleanup_owned())
        self.assertEqual(self.proof()['reason'],'deadline')
        self.assertTrue(self.latch.stopped())

    def test_stop_cleanup_does_not_wait_for_sql_write_lock(self):
        import sqlite3
        guard=self.guardian(); self.create(guard); guard.start(self.cid)
        db=sqlite3.connect(self.latch.path,isolation_level=None)
        try:
            db.execute('BEGIN IMMEDIATE')
            self.latch._bury('owner_stop')
            began=time.monotonic()
            self.assertTrue(guard.cleanup_owned())
            self.assertLess(time.monotonic()-began,2)
        finally:
            db.rollback(); db.close()
        self.assertTrue(ControlLatch(self.latch.path).stopped())
