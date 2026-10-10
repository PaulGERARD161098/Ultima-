"""Host-only, single-use Docker launcher. No CLI, credentials or activation.

The trusted operator owns the latch and claim directory, outside worker rights.
This launches an offline witness, NOT the durable broker or a real model agent.
A separate FINUBAR guardian owns Docker and survives owner-process SIGKILL.
External service supervision is still required for loss of the guardian itself.
"""
import hashlib
from contextlib import contextmanager
import json
import math
import os
from pathlib import Path
import selectors
import subprocess
import tempfile
import threading
import time
import uuid

from finubar.leo_control import ControlLatch
from leo.runtime.policy import Refusal
from leo.control_r21.read_candidate import WorkerPlan, snapshot_bytes
from leo.control_r21.read_worker import report

OUTPUT_LIMIT = 49153  # bounded JSON plus its single newline
ERROR_LIMIT = 4096
ENV = {'PATH': '/usr/bin:/bin', 'LANG': 'C.UTF-8', 'HOME': '/tmp'}


class DockerTransport:
    """Host capability; never expose this object or any command to a worker."""
    def __init__(self):
        self.process = None
        self.selector = None

    def call(self, args):
        # Docker metadata only, never PR contents, with bounded capture.
        p = subprocess.Popen(('/usr/bin/docker', *args), env=ENV,
            stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            close_fds=True)
        selector = selectors.DefaultSelector()
        buffers = {'out': bytearray(), 'err': bytearray()}
        deadline = time.monotonic() + 15
        try:
            for name, stream in (('out', p.stdout), ('err', p.stderr)):
                os.set_blocking(stream.fileno(), False)
                selector.register(stream, selectors.EVENT_READ, name)
            while selector.get_map() or p.poll() is None:
                if time.monotonic() >= deadline:
                    raise Refusal('read_docker_timeout')
                for key, _ in selector.select(timeout=0.02):
                    chunk = os.read(key.fileobj.fileno(), 4096)
                    if not chunk:
                        selector.unregister(key.fileobj)
                    else:
                        buffers[key.data].extend(chunk)
                        if len(buffers[key.data]) > 8192:
                            raise Refusal('read_docker_metadata_limit')
            return p.returncode, bytes(buffers['out']), bytes(buffers['err'])
        finally:
            try:
                if p.poll() is None:
                    p.kill()
                p.wait(timeout=5)
            finally:
                selector.close(); p.stdout.close(); p.stderr.close()

    def start(self, cid):
        self.process = subprocess.Popen(('/usr/bin/docker', 'start', '--attach', cid),
            env=ENV, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, close_fds=True)
        self.selector = selectors.DefaultSelector()
        for key, stream in (('out', self.process.stdout), ('err', self.process.stderr)):
            os.set_blocking(stream.fileno(), False)
            self.selector.register(stream, selectors.EVENT_READ, key)

    def poll(self):
        chunks = {'out': b'', 'err': b''}
        for key, _ in self.selector.select(timeout=0):
            chunk = os.read(key.fileobj.fileno(), 4096)
            if chunk:
                chunks[key.data] += chunk
            else:
                self.selector.unregister(key.fileobj)
        return chunks['out'], chunks['err'], self.process.poll(), not self.selector.get_map()

    def close(self):
        # Stop the client BEFORE removing the container; it must not issue a
        # delayed start after a cleanup that merely observed 'not yet created'.
        if self.process is not None:
            if self.process.poll() is None:
                self.process.kill()
            self.process.wait(timeout=5)
            self.process.stdout.close(); self.process.stderr.close()
        if self.selector is not None:
            self.selector.close()


def _create_args(plan, name):
    argv = list(plan.argv()[1:])
    argv[0] = 'create'
    argv.remove('--rm')
    # No disk logs containing input, output, or unbounded hostile output.
    argv[1:1] = ['--name', name, '--log-driver', 'none', '--restart', 'no',
                 '--memory-swap', '128m', '--ulimit', 'core=0', '--ulimit', 'nofile=64:64']
    return tuple(argv)


def _read_fixed(path, limit):
    # WorkerPlan checks parents; O_NOFOLLOW closes the final symlink race.
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        import stat
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise Refusal('fixed_read_input_required')
        with os.fdopen(fd, 'rb', closefd=False) as stream:
            raw = stream.read(limit + 1)
        if not 0 < len(raw) <= limit:
            raise Refusal('read_input_limit')
        return raw
    finally:
        os.close(fd)


class ReadLauncher:
    """One launcher/claim = at most one start, including failure and restart.

_transport is an internal TRUSTED-HOST test seam, never a worker argument.
The normal operator uses DockerTransport; CI uses a closed runner relay so
this application code can itself execute inside an isolated helper container.
"""
    def __init__(self, plan, latch, claim, *, worker_sha256, snapshot_sha256,
                 max_seconds=30, _transport=None, _host_admission=None, _host_check=None):
        import re
        if type(plan) is not WorkerPlan or type(latch) is not ControlLatch:
            raise TypeError('trusted_read_host_required')
        plan.argv()
        if any(type(s) is not str or not re.fullmatch('[a-f0-9]{64}', s)
               for s in (worker_sha256, snapshot_sha256)):
            raise Refusal('reviewed_input_hashes_required')
        if type(max_seconds) not in (int, float) or not math.isfinite(max_seconds) or not 0 < max_seconds <= 120:
            raise Refusal('bounded_read_deadline_required')
        claim = Path(claim)
        if (not claim.is_absolute() or not claim.parent.is_dir() or claim.parent.is_symlink()
                or any(p.is_symlink() for p in claim.parents)
                or claim.parent.stat().st_uid != os.geteuid() or claim.parent.stat().st_mode & 0o077):
            raise Refusal('private_read_claim_required')
        self.plan, self.latch, self.claim = plan, latch, claim
        self.hashes = worker_sha256, snapshot_sha256
        self.maximum = max_seconds
        self.transport = _transport
        # Host-owned broker callbacks only; never part of a worker proposal.
        self._host_admission, self._host_check = _host_admission, _host_check
        self.lock = threading.Lock()
        self.used = False

    def _check(self, deadline, *, host=True):
        if self.latch.stopped(timeout=0.1):
            raise Refusal('leo_agent_stopped')
        if time.monotonic() >= deadline:
            raise Refusal('read_worker_timeout')
        if host and self._host_check is not None:
            self._host_check()

    @contextmanager
    def _admission(self):
        with self.latch.admission(timeout=0.1):
            if self._host_admission is None:
                yield
            else:
                with self._host_admission():
                    yield

    def _cleanup(self, name, cid, creation_unknown=False):
        if self.transport is None:
            return
        cleanup_owned = getattr(self.transport, 'cleanup_owned', None)
        if cleanup_owned is not None:
            if cleanup_owned() is not True or creation_unknown:
                raise Refusal('read_container_stop_unconfirmed')
            return
        client_error = None
        try:
            self.transport.close()
        except BaseException as error:
            client_error = error
        # A create timeout may have created a container without returning its
        # id. The pre-reserved unique name also covers that uncertain outcome.
        rc, _, _ = self.transport.call(('rm', '--force', cid or name))
        rc2, out, _ = self.transport.call(('container', 'ls', '--all', '--quiet', '--no-trunc',
                                          '--filter', 'name=^/' + name + '$'))
        if creation_unknown or client_error is not None or rc2 != 0 or out.strip() or (cid is not None and rc != 0):
            raise Refusal('read_container_stop_unconfirmed')
        finish = getattr(self.transport, 'finish', None)
        if finish is not None:
            finish()

    def run(self):
        with self.lock:
            if self.used:
                raise Refusal('read_launch_already_engaged')
            self.used = True
        deadline = time.monotonic() + self.maximum
        name, cid = 'leo-read-' + uuid.uuid4().hex, None
        self._check(deadline)
        # Claim survives a fresh host. Never remove/reset it, even on failure.
        with self.latch.admission(timeout=0.1):
            try:
                fd = os.open(self.claim, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
            except FileExistsError:
                raise Refusal('read_launch_already_engaged') from None
            try:
                os.write(fd, (name + '\n').encode('ascii')); os.fsync(fd)
            finally:
                os.close(fd)
            folder = os.open(self.claim.parent, os.O_RDONLY)
            try:
                os.fsync(folder)
            finally:
                os.close(folder)
        with tempfile.TemporaryDirectory(prefix='read-inputs-') as directory:
            creation_started = False
            try:
                raw_worker = _read_fixed(self.plan.worker_file, 16384)
                raw_snapshot = _read_fixed(self.plan.snapshot_file, 32768)
                actual = tuple(hashlib.sha256(raw).hexdigest() for raw in (raw_worker, raw_snapshot))
                if actual != self.hashes:
                    raise Refusal('read_inputs_changed')
                if snapshot_bytes(json.loads(raw_snapshot)) != raw_snapshot:
                    raise Refusal('canonical_read_snapshot_required')
                expected = report(raw_snapshot) + b'\n'
                root = Path(directory)
                worker, snapshot = root / 'worker.py', root / 'snapshot.json'
                for path, raw in ((worker, raw_worker), (snapshot, raw_snapshot)):
                    path.write_bytes(raw); path.chmod(0o444)
                staged = WorkerPlan(self.plan.image, worker, snapshot)
                self._check(deadline)
                if self.transport is None:
                    from leo.control_r21.read_watchdog import GuardedTransport
                    self.transport = GuardedTransport(staged, name, self.latch, self.claim, deadline)
                with self._admission():
                    creation_started = True
                    rc, out, _ = self.transport.call(_create_args(staged, name))
                import re
                if rc != 0 or not re.fullmatch(b'[a-f0-9]{64}\n?', out):
                    raise Refusal('read_container_create_unknown')
                cid = out.strip().decode('ascii')
                self._check(deadline)
                with self._admission():
                    self._check(deadline, host=False)
                    self.transport.start(cid)
                output, errors = bytearray(), bytearray()
                while True:
                    self._check(deadline)
                    out, err, rc, drained = self.transport.poll()
                    output.extend(out); errors.extend(err)
                    if len(output) > OUTPUT_LIMIT or len(errors) > ERROR_LIMIT:
                        raise Refusal('read_worker_output_limit')
                    if rc is not None and drained:
                        if rc != 0 or errors or bytes(output) != expected:
                            raise Refusal('read_worker_result_invalid')
                        # A Docker client exit alone is not a worker exit proof.
                        code, state, _ = self.transport.call(('inspect', '--format', '{{json .State}}', cid))
                        try:
                            state = json.loads(state)
                        except (ValueError, UnicodeError):
                            raise Refusal('read_worker_state_invalid') from None
                        if (code != 0 or state.get('Running') is not False or state.get('ExitCode') != 0
                                or state.get('OOMKilled') is not False or state.get('Status') != 'exited'):
                            raise Refusal('read_worker_state_invalid')
                        self._check(deadline)
                        result = json.loads(output)
                        break
                    time.sleep(0.02)
            finally:
                try:
                    self._cleanup(name, cid, creation_started and cid is None)
                except BaseException:
                    # A failed cleanup permanently stops the installation.
                    try:
                        self.latch.trip('owner_stop')
                    finally:
                        raise Refusal('read_container_stop_unconfirmed') from None
        return {'report': result, 'container_removed': True, 'autonomous_agent': False,
                'worker_sha256': actual[0], 'snapshot_sha256': actual[1]}
