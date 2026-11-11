import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import subprocess
import sys

from finubar.leo_control import ControlLatch
from leo.runtime.policy import Refusal
from leo.control_r21.read_candidate import WorkerPlan, snapshot_bytes
from leo.control_r21.read_launcher import ReadLauncher, DockerTransport, OUTPUT_LIMIT
from leo.control_r21.read_worker import report


class FakeDocker:
    def __init__(self, output):
        self.output, self.calls, self.starts = output, [], 0
        self.on_create = None
        self.on_poll = None
        self.remove_fails = False
        self.hang = False
        self.cid = 'd' * 64

    def call(self, args):
        self.calls.append(args)
        if args[0] == 'create':
            if self.on_create:
                self.on_create()
            return 0, self.cid.encode() + b'\n', b''
        if args[0] == 'inspect':
            return 0, b'{"Running":false,"ExitCode":0,"OOMKilled":false,"Status":"exited"}', b''
        if args[0] == 'rm':
            return int(self.remove_fails), b'', b''
        if args[:2] == ('container', 'ls'):
            return 0, self.cid.encode() if self.remove_fails else b'', b''
        raise AssertionError(args)

    def start(self, cid):
        self.starts += 1
        assert cid == self.cid

    def poll(self):
        if self.on_poll:
            self.on_poll()
        if self.hang:
            return b'', b'', None, False
        return self.output, b'', 0, True

    def close(self):
        self.calls.append(('close',))


class ReadLauncherTests(unittest.TestCase):
    def setUp(self):
        if os.environ.get('LV1_ISOLATED') != '1':
            raise RuntimeError('isolated_runtime_required')
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.latch = ControlLatch(self.root / 'control.sqlite', initialize=True)
        self.worker = self.root / 'worker.py'
        self.worker.write_bytes(b'print("fixture")\n')
        self.snapshot = self.root / 'snapshot.json'
        self.raw = snapshot_bytes({'repository': 'PaulGERARD161098/Ultima-',
            'measured_at': '2026-10-10T13:00:00Z', 'prs': [{'number': 365,
            'head_sha': 'a'*40, 'title': 'fixture', 'state': 'open', 'checks': 'unverified'}]})
        self.snapshot.write_bytes(self.raw)
        self.plan = WorkerPlan('python@sha256:' + 'c'*64, self.worker, self.snapshot)
        self.fake = FakeDocker(report(self.raw) + b'\n')

    def launcher(self, **kwargs):
        return ReadLauncher(self.plan, self.latch, self.root / 'operation.claim',
            worker_sha256=hashlib.sha256(self.worker.read_bytes()).hexdigest(),
            snapshot_sha256=hashlib.sha256(self.raw).hexdigest(),
            _transport=self.fake, **kwargs)

    def test_exact_report_cleanup_and_fresh_host_no_replay(self):
        first = self.launcher()
        result = first.run()
        self.assertTrue(result['container_removed'])
        self.assertFalse(result['autonomous_agent'])
        self.assertEqual(result['report'], json.loads(report(self.raw)))
        for launcher in (first, self.launcher()):
            with self.assertRaisesRegex(Refusal, 'read_launch_already_engaged'):
                launcher.run()
        self.assertEqual(self.fake.starts, 1)
        self.assertLess(self.fake.calls.index(('close',)),
                        next(i for i,a in enumerate(self.fake.calls) if a[0] == 'rm'))

    def test_stop_before_claim_has_no_docker_effect(self):
        self.latch.trip('owner_stop')
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            self.launcher().run()
        self.assertEqual(self.fake.calls, [])
        self.assertFalse((self.root / 'operation.claim').exists())

    def test_stop_after_create_never_starts_and_removes_known_id(self):
        # Tombstone first, without blocking on admission's SQLite transaction.
        self.fake.on_create = lambda: self.latch._bury('owner_stop')
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            self.launcher().run()
        self.assertEqual(self.fake.starts, 0)
        self.assertIn(('rm', '--force', self.fake.cid), self.fake.calls)

    def test_stop_while_active_removes_then_refuses_new_host(self):
        self.fake.hang = True
        self.fake.on_poll = lambda: self.latch.trip('owner_stop')
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            self.launcher().run()
        self.assertIn(('rm', '--force', self.fake.cid), self.fake.calls)
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            self.launcher().run()
        self.assertEqual(self.fake.starts, 1)

    def test_timeout_consumes_claim_and_cleans_up(self):
        self.fake.hang = True
        with self.assertRaisesRegex(Refusal, 'read_worker_timeout'):
            self.launcher(max_seconds=0.15).run()
        self.assertIn(('rm', '--force', self.fake.cid), self.fake.calls)
        with self.assertRaisesRegex(Refusal, 'read_launch_already_engaged'):
            self.launcher().run()

    def test_output_overflow_refused(self):
        self.fake.output = b'x' * (OUTPUT_LIMIT + 1)
        with self.assertRaisesRegex(Refusal, 'read_worker_output_limit'):
            self.launcher().run()
        self.assertIn(('rm', '--force', self.fake.cid), self.fake.calls)

    def test_forged_success_report_refused(self):
        self.fake.output = b'{"autonomous_agent":true}\n'
        with self.assertRaisesRegex(Refusal, 'read_worker_result_invalid'):
            self.launcher().run()

    def test_cleanup_failure_trips_persistent_stop(self):
        self.fake.remove_fails = True
        with self.assertRaisesRegex(Refusal, 'read_container_stop_unconfirmed'):
            self.launcher().run()
        self.assertTrue(ControlLatch(self.latch.path).stopped())

    def test_client_close_failure_still_attempts_container_removal(self):
        def fail_close():
            raise OSError('fixture_close_failed')
        self.fake.close = fail_close
        with self.assertRaisesRegex(Refusal, 'read_container_stop_unconfirmed'):
            self.launcher().run()
        self.assertIn(('rm', '--force', self.fake.cid), self.fake.calls)
        self.assertTrue(self.latch.stopped())

    def test_changed_reviewed_worker_never_created(self):
        launcher = self.launcher()
        self.worker.write_bytes(b'changed')
        with self.assertRaisesRegex(Refusal, 'read_inputs_changed'):
            launcher.run()
        self.assertEqual(self.fake.starts, 0)
        self.assertFalse(any(a[0] == 'create' for a in self.fake.calls))

    def test_frozen_private_staging_and_closed_flags(self):
        def inspect_staging():
            create = self.fake.calls[-1]
            mounts = [create[i+1] for i,x in enumerate(create) if x == '--mount']
            self.assertEqual(len(mounts), 2)
            for mount in mounts:
                path = Path(mount.split('src=')[1].split(',')[0])
                self.assertEqual(path.stat().st_mode & 0o777, 0o444)
                self.assertEqual(path.parent.stat().st_mode & 0o777, 0o700)
                self.assertTrue(mount.endswith(',readonly'))
            self.assertEqual(create[create.index('--log-driver')+1], 'none')
            self.assertEqual(create[create.index('--restart')+1], 'no')
            self.assertNotIn('--rm', create)
        self.fake.on_create = inspect_staging
        self.launcher().run()

    def test_uncertain_create_removes_reserved_name_without_start(self):
        original = self.fake.call
        def unknown(args):
            if args[0] == 'create':
                self.fake.calls.append(args)
                raise TimeoutError('response_lost')
            return original(args)
        self.fake.call = unknown
        with self.assertRaisesRegex(Refusal, 'read_container_stop_unconfirmed'):
            self.launcher().run()
        self.assertEqual(self.fake.starts, 0)
        self.assertTrue(self.latch.stopped())
        self.assertTrue(any(a[0] == 'rm' and a[-1].startswith('leo-read-') for a in self.fake.calls))

    def test_bad_bounds_hashes_and_claim_parent_refused(self):
        for bound in (0, float('nan'), 121, True):
            with self.assertRaises(Refusal):
                self.launcher(max_seconds=bound)
        self.root.chmod(0o755)
        with self.assertRaisesRegex(Refusal, 'private_read_claim_required'):
            self.launcher()

    def fixture_popen(self, code):
        real = subprocess.Popen
        def spawn(argv, **kwargs):
            # Fixed Python fixture remains inside this isolated runtime box.
            self.assertEqual(argv[0], '/usr/bin/docker')
            return real((sys.executable, '-I', '-c', code), **kwargs)
        return patch('leo.control_r21.read_launcher.subprocess.Popen', side_effect=spawn)

    def test_real_transport_bounded_metadata_pipes(self):
        with self.fixture_popen("import os; os.write(1,b'x'*9000)"):
            with self.assertRaisesRegex(Refusal, 'read_docker_metadata_limit'):
                DockerTransport().call(('inspect', 'fixture'))

    def test_real_transport_metadata_success(self):
        with self.fixture_popen("import sys; print('metadata'); sys.stderr.write('fixture')"):
            rc, out, err = DockerTransport().call(('inspect', 'fixture'))
        self.assertEqual((rc, out, err), (0, b'metadata\n', b'fixture'))

    def test_real_transport_drains_large_stream_through_client_exit(self):
        import time
        transport = DockerTransport()
        received = bytearray()
        try:
            with self.fixture_popen("import os; os.write(1,b'x'*12000)"):
                transport.start('d'*64)
            deadline = time.monotonic() + 3
            while True:
                out, err, rc, drained = transport.poll()
                received.extend(out)
                self.assertFalse(err)
                if rc is not None and drained:
                    self.assertEqual(rc, 0)
                    break
                self.assertLess(time.monotonic(), deadline)
                time.sleep(.01)
            self.assertEqual(received, b'x'*12000)
        finally:
            transport.close()

    def test_real_transport_close_reaps_client(self):
        transport = DockerTransport()
        with self.fixture_popen("import time; time.sleep(30)"):
            transport.start('d'*64)
        transport.close()
        self.assertIsNotNone(transport.process.returncode)


if __name__ == '__main__':
    unittest.main()
