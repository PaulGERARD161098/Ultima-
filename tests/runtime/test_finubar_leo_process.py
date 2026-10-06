"""Processus fictifs, exclusivement dans le conteneur CI fermé LV1."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

from pathlib import Path
import signal
import sys
import tempfile
import threading
import time
import unittest
from unittest.mock import patch

from finubar.leo_control import ControlLatch
from finubar.leo_process import ProcessSupervisor
from leo.runtime.policy import Refusal


class FinubarProcessTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.latch = ControlLatch(self.root / 'control.sqlite', initialize=True)

    def tearDown(self):
        self.tmp.cleanup()

    def supervisor(self, code, **limits):
        return ProcessSupervisor(self.latch, (sys.executable, '-c', code),
            cwd=self.root, max_seconds=3, grace_seconds=0.03, **limits)

    def await_file(self, path):
        deadline = time.monotonic() + 3
        while time.monotonic() < deadline:
            if path.exists() and path.stat().st_size:
                return path.read_text()
            time.sleep(0.01)
        self.fail('fixture did not start')

    def assert_dead(self, pid):
        deadline = time.monotonic() + 2
        while time.monotonic() < deadline:
            path = Path('/proc') / str(pid) / 'stat'
            if not path.exists() or path.read_text().split()[2] == 'Z':
                return
            time.sleep(0.01)
        self.fail('fixture process still running')

    def threaded(self, supervisor):
        errors = []
        def run():
            try: supervisor.run()
            except BaseException as error: errors.append(error)
        worker = threading.Thread(target=run)
        worker.start()
        return worker, errors

    def test_receipt_is_process_only_and_no_implicit_retry(self):
        supervisor = self.supervisor('raise SystemExit(7)')
        receipt = supervisor.run()
        self.assertEqual(receipt.returncode, 7)
        self.assertEqual(receipt.effect_state, 'unknown_requires_reconciliation')
        with self.assertRaisesRegex(Refusal, 'already_engaged'): supervisor.run()

    def test_stopped_before_departure_never_starts(self):
        marker = self.root / 'forbidden'
        self.latch.trip('leo_self_control_attempt')
        with self.assertRaisesRegex(Refusal, 'leo_agent_stopped'):
            self.supervisor(f'from pathlib import Path; Path({str(marker)!r}).touch()').run()
        self.assertFalse(marker.exists())

    def test_elapsed_deadline_during_admission_never_starts(self):
        supervisor = self.supervisor('raise SystemExit(0)')
        with patch('finubar.leo_process.time.monotonic', side_effect=(10, 14)), \
             patch('finubar.leo_process.subprocess.Popen') as spawn:
            with self.assertRaisesRegex(Refusal, 'finubar_process_timeout'):
                supervisor.run()
        spawn.assert_not_called()

    def test_control_attempt_interrupts_parent_and_ignoring_child(self):
        marker = self.root / 'started'
        code = ("import os,signal,time; from pathlib import Path; "
                "signal.signal(signal.SIGTERM,signal.SIG_IGN); child=os.fork(); "
                f"Path({str(marker)!r}+str(child==0)).write_text(str(os.getpid())); "
                "time.sleep(30)")
        worker, errors = self.threaded(self.supervisor(code))
        parent = int(self.await_file(Path(str(marker)+'False')))
        child = int(self.await_file(Path(str(marker)+'True')))
        started = time.monotonic()
        ControlLatch(self.latch.path).trip('leo_self_control_attempt')
        worker.join(3)
        self.assertFalse(worker.is_alive())
        self.assertLess(time.monotonic()-started, 3)
        self.assertEqual(len(errors), 1)
        self.assertEqual(str(errors[0]), 'leo_agent_stopped')
        self.assert_dead(parent)
        self.assert_dead(child)
        self.assertTrue(ControlLatch(self.latch.path).stopped())

    def test_lost_control_interrupts_instead_of_continuing(self):
        marker = self.root / 'started'
        worker, errors = self.threaded(self.supervisor(
            f'import os,time; from pathlib import Path; Path({str(marker)!r}).write_text(str(os.getpid())); time.sleep(30)'))
        pid = int(self.await_file(marker))
        self.latch.path.unlink()
        worker.join(3)
        self.assertFalse(worker.is_alive())
        self.assertEqual(str(errors[0]), 'finubar_process_control_unavailable')
        self.assert_dead(pid)
        self.assertFalse(self.latch.path.exists())

    def test_timeout_interrupts_and_cannot_retry_same_instance(self):
        supervisor = ProcessSupervisor(self.latch, (sys.executable, '-c',
            'import signal,time; signal.signal(signal.SIGTERM,signal.SIG_IGN); time.sleep(30)'),
            cwd=self.root, max_seconds=0.1, grace_seconds=0.02)
        with self.assertRaisesRegex(Refusal, 'finubar_process_timeout'): supervisor.run()
        with self.assertRaisesRegex(Refusal, 'already_engaged'): supervisor.run()

    def test_parent_exit_still_cleans_group_children_without_reaping_pid_early(self):
        marker = self.root / 'child'
        code = ("import os,time; from pathlib import Path; child=os.fork(); "
                f"Path({str(marker)!r}).write_text(str(child)) if child else None; "
                "time.sleep(30) if child==0 else time.sleep(0.05)")
        receipt = self.supervisor(code).run()
        self.assertEqual(receipt.returncode, 0)
        self.assert_dead(int(marker.read_text()))

    def test_no_inherited_secret_environment(self):
        marker = self.root / 'env'
        with patch.dict(os.environ, {'LV1_FIXTURE_SECRET':'fiction'}):
            self.supervisor(f'import os; from pathlib import Path; Path({str(marker)!r}).write_text(str(os.environ.get("LV1_FIXTURE_SECRET")))').run()
        self.assertEqual(marker.read_text(), 'None')

    def test_invalid_host_configuration_and_spawn_failure_fail_closed(self):
        for value in (0, True, float('nan'), 301):
            with self.subTest(value=value), self.assertRaises(ValueError):
                ProcessSupervisor(self.latch, (sys.executable,), cwd=self.root, max_seconds=value)
        with self.assertRaises(ValueError):
            ProcessSupervisor(self.latch, ('python',), cwd=self.root, max_seconds=1)
        supervisor = ProcessSupervisor(self.latch, ('/missing/fixture',), cwd=self.root, max_seconds=1)
        with self.assertRaises(FileNotFoundError): supervisor.run()
        with self.assertRaisesRegex(Refusal, 'already_engaged'): supervisor.run()

    def test_guard_source_is_readonly(self):
        import errno
        import finubar.leo_process as module
        path = Path(module.__file__)
        self.assertGreater(path.stat().st_size, 100)
        try: descriptor = os.open(path, os.O_WRONLY)
        except OSError as error:
            self.assertIn(error.errno, (errno.EROFS, errno.EACCES, errno.EPERM))
        else:
            os.close(descriptor)
            self.fail('supervisor can be opened for mutation')
