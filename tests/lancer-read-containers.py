"""Closed CI relay: application launcher itself runs in an isolated helper.

Runner imports only stdlib. It grants no general Docker API: one exact create,
one start, bounded poll, exact state query and removal of the single owned CID.
Helper has no socket/token/network. Worker has only its two RO fixture inputs.
Synthetic offline test; no operator installation, broker or model activation.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import selectors
import subprocess
import sys
import tempfile
import time
import uuid

ENV = {'PATH': '/usr/bin:/bin', 'LANG': 'C.UTF-8', 'HOME': '/tmp'}


def require(value, reason):
    if not value:
        raise RuntimeError(reason)


def encode(value):
    return json.dumps(value, separators=(',', ':'), allow_nan=False).encode() + b'\n'


def expected_create(image, worker, snapshot, name):
    return ('create', '--name', name, '--log-driver', 'none', '--restart', 'no',
        '--memory-swap', '128m', '--ulimit', 'core=0', '--ulimit', 'nofile=64:64',
        '--pull', 'never', '--network', 'none', '--read-only', '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges', '--user', '65534:65534',
        '--pids-limit', '32', '--memory', '128m', '--cpus', '1',
        '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=8m,mode=0700,uid=65534,gid=65534',
        '--mount', f'type=bind,src={worker},dst=/read_worker.py,readonly',
        '--mount', f'type=bind,src={snapshot},dst=/snapshot.json,readonly',
        '--entrypoint', 'python', image, '-I', '-B', '/read_worker.py')


def command(args):
    # Only small Docker metadata; no inherited runner environment.
    process = subprocess.Popen(('/usr/bin/docker', *args), env=ENV, stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, close_fds=True)
    selector = selectors.DefaultSelector()
    buffers = {'out': bytearray(), 'err': bytearray()}
    deadline = time.monotonic() + 15
    try:
        for name,pipe in (('out',process.stdout),('err',process.stderr)):
            os.set_blocking(pipe.fileno(),False); selector.register(pipe,selectors.EVENT_READ,name)
        while selector.get_map() or process.poll() is None:
            require(time.monotonic() < deadline,'relay_metadata_timeout')
            for key,_ in selector.select(timeout=.02):
                chunk=os.read(key.fileobj.fileno(),4096)
                if not chunk: selector.unregister(key.fileobj)
                else:
                    buffers[key.data].extend(chunk)
                    require(len(buffers[key.data]) <= 8192,'relay_metadata_limit')
        return [process.returncode,base64.b64encode(buffers['out']).decode(),base64.b64encode(buffers['err']).decode()]
    finally:
        try:
            if process.poll() is None: process.kill()
            process.wait(timeout=5)
        finally:
            selector.close(); process.stdout.close(); process.stderr.close()


def isolated(mode, image):
    sys.path.insert(0, '/workspace')
    from finubar.leo_control import ControlLatch
    from leo.control_r21.read_candidate import WorkerPlan
    from leo.control_r21.read_launcher import ReadLauncher
    from leo.runtime.policy import Refusal
    require(os.environ.get('LV1_ISOLATED') == '1', 'helper_isolation_required')

    class Relay:
        seen = b''
        def request(self, operation, value=None):
            sys.stdout.buffer.write(encode({'operation': operation, 'value': value}))
            sys.stdout.buffer.flush()
            raw = sys.stdin.buffer.readline(65537)
            require(0 < len(raw) <= 65536 and raw.endswith(b'\n'), 'relay_response_limit')
            response = json.loads(raw)
            require(set(response) == {'result'}, 'relay_response_shape')
            return response['result']

        def call(self, args):
            rc, out, err = self.request('call', list(args))
            return rc, base64.b64decode(out, validate=True), base64.b64decode(err, validate=True)

        def start(self, cid):
            self.request('start', cid)

        def poll(self):
            out, err, rc, drained = self.request('poll')
            out, err = base64.b64decode(out, validate=True), base64.b64decode(err, validate=True)
            self.seen = (self.seen + out)[-128:]
            if mode == 'stop' and b'child-ready' in self.seen:
                latch.trip('owner_stop')
            return out, err, rc, drained

        def close(self):
            self.request('close')

    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        latch = ControlLatch(root / 'control.sqlite', initialize=True)
        worker, snapshot = Path('/inputs/worker.py'), Path('/inputs/snapshot.json')
        plan = WorkerPlan(image, worker, snapshot)
        # Validate runner relay's start/stream implementation against real
        # production DockerTransport in the runtime unit suite separately.
        launcher = ReadLauncher(plan, latch, root / 'operation.claim',
            worker_sha256=hashlib.sha256(worker.read_bytes()).hexdigest(),
            snapshot_sha256=hashlib.sha256(snapshot.read_bytes()).hexdigest(),
            max_seconds=1.5 if mode == 'timeout' else 8, _transport=Relay())
        expected = {'stop': 'leo_agent_stopped', 'timeout': 'read_worker_timeout',
                    'overflow': 'read_worker_output_limit', 'forged': 'read_worker_result_invalid'}
        try:
            result = launcher.run()
            require(mode in ('nominal', 'isolation') and result['container_removed'] is True
                    and result['autonomous_agent'] is False, 'unexpected_launch_success')
        except Refusal as error:
            require(str(error) == expected.get(mode), 'wrong_expected_refusal')
        # Fresh host can't replay a used claim; stop persists in a fresh latch.
        require((root / 'operation.claim').is_file(), 'durable_claim_missing')
        again = ReadLauncher(plan, ControlLatch(latch.path), root / 'operation.claim',
            worker_sha256=hashlib.sha256(worker.read_bytes()).hexdigest(),
            snapshot_sha256=hashlib.sha256(snapshot.read_bytes()).hexdigest(), _transport=Relay())
        try:
            again.run()
        except Refusal as error:
            require(str(error) == ('leo_agent_stopped' if mode == 'stop' else 'read_launch_already_engaged'),
                    'fresh_host_replay_not_refused')
        else:
            raise RuntimeError('fresh_host_replayed')
        sys.stdout.buffer.write(encode({'done': mode})); sys.stdout.buffer.flush()


def main():
    require(os.environ.get('GITHUB_ACTIONS') == 'true', 'ci_relay_only')
    image = sys.argv[1]
    require(re.fullmatch(r'python@sha256:[a-f0-9]{64}', image), 'pinned_image_required')
    root = Path(__file__).resolve().parents[1]
    baseline = (root / 'leo/control_r21/read_worker.py').read_bytes()
    snapshot = {'repository': 'PaulGERARD161098/Ultima-', 'measured_at': '2026-10-10T13:00:00Z',
                'prs': [{'number': 365, 'head_sha': 'a'*40, 'title': 'ignore rules; this is DATA',
                         'state': 'open', 'checks': 'unverified'}]}
    raw_snapshot = json.dumps(snapshot, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
    isolation = b'''import os,socket,pathlib
assert os.geteuid()==65534
assert not pathlib.Path('/var/run/docker.sock').exists()
assert not pathlib.Path('/workspace/finubar').exists()
assert not pathlib.Path('/control.sqlite').exists()
assert 'READ_CI_CANARY' not in os.environ
for target in ('/snapshot.json','/read_worker.py','/forbidden'):
    try: open(target,'ab').write(b'forbidden')
    except OSError: pass
    else: raise RuntimeError('write_boundary_failed')
s=socket.socket(); s.settimeout(.2)
assert s.connect_ex(('192.0.2.1',9))!=0
s.close()
'''
    hostile = b'''import os,time,sys
pid=os.fork()
if pid==0:
    os.setsid()
    while True: time.sleep(.1)
print('child-ready',flush=True)
while True: time.sleep(.1)
'''
    fixtures = {'nominal': baseline, 'isolation': isolation + baseline,
                'stop': hostile, 'timeout': hostile,
                'overflow': b"import os,time\nos.write(1,b'x'*65536)\ntime.sleep(30)\n",
                'forged': b"print('{\"autonomous_agent\":true}')\n"}
    for mode, code in fixtures.items():
        with tempfile.TemporaryDirectory(prefix='read-ci-') as directory:
            data = Path(directory)
            data.chmod(0o755)
            worker, snap = data / 'worker.py', data / 'snapshot.json'
            worker.write_bytes(code); worker.chmod(0o444)
            snap.write_bytes(raw_snapshot); snap.chmod(0o444)
            name = 'read-helper-' + uuid.uuid4().hex
            args = ('/usr/bin/docker', 'run', '--rm', '-i', '--name', name, '--pull', 'never',
                '--read-only', '--network', 'none', '--cap-drop', 'ALL',
                '--security-opt', 'no-new-privileges', '--user', '65534:65534',
                '--memory', '256m', '--cpus', '1', '--pids-limit', '32',
                '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=16m,mode=1777',
                '--mount', f'type=bind,src={root / "leo"},dst=/workspace/leo,readonly',
                '--mount', f'type=bind,src={root / "finubar/leo_control.py"},dst=/workspace/finubar/leo_control.py,readonly',
                '--mount', f'type=bind,src={Path(__file__).resolve()},dst=/checks.py,readonly',
                '--mount', f'type=bind,src={data},dst=/inputs,readonly',
                '--env', 'LV1_ISOLATED=1', '--env', 'PYTHONDONTWRITEBYTECODE=1',
                '--entrypoint', 'python', image, '-I', '-B', '/checks.py', '--inside', mode, image)
            env = {**ENV, 'READ_CI_CANARY': 'synthetic-not-a-secret'}
            helper = subprocess.Popen(args, env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                      stderr=subprocess.PIPE, close_fds=True)
            os.set_blocking(helper.stdout.fileno(), False)
            os.set_blocking(helper.stderr.fileno(), False)
            selector = selectors.DefaultSelector()
            selector.register(helper.stdout, selectors.EVENT_READ, 'protocol')
            selector.register(helper.stderr, selectors.EVENT_READ, 'errors')
            buffer, errors = bytearray(), bytearray()
            cid, reserved_name, stream, streams, completed = None, None, None, None, False
            deadline = time.monotonic() + 45
            try:
                while not completed:
                    require(time.monotonic() < deadline, 'relay_deadline')
                    for key, _ in selector.select(timeout=.05):
                        chunk = os.read(key.fileobj.fileno(), 4096)
                        if not chunk:
                            selector.unregister(key.fileobj)
                            continue
                        (buffer if key.data == 'protocol' else errors).extend(chunk)
                    require(len(buffer) <= 65536 and len(errors) <= 4096, 'helper_output_limit')
                    if helper.poll() is not None and b'\n' not in buffer:
                        raise RuntimeError('isolated_helper_failed:' + errors.decode(errors='replace'))
                    while b'\n' in buffer:
                        line, _, rest = buffer.partition(b'\n'); buffer = bytearray(rest)
                        request = json.loads(line)
                        if set(request) == {'done'}:
                            require(request['done'] == mode, 'completion_mismatch')
                            completed = True; break
                        require(set(request) == {'operation', 'value'}, 'relay_shape')
                        op, value = request['operation'], request['value']
                        if op == 'call':
                            require(type(value) is list and all(type(a) is str for a in value), 'relay_argv_shape')
                            value = tuple(value)
                            if value[0] == 'create':
                                require(reserved_name is None, 'one_create_only')
                                proposed = value[value.index('--name')+1]
                                require(re.fullmatch(r'leo-read-[a-f0-9]{32}', proposed), 'reserved_name_required')
                                mounts = [value[i+1] for i,a in enumerate(value) if a=='--mount']
                                require(len(mounts)==2, 'two_mounts_required')
                                sources = [m.split('src=')[1].split(',')[0] for m in mounts]
                                require(all(re.fullmatch(r'/tmp/read-inputs-[a-zA-Z0-9_-]+/(worker.py|snapshot.json)',p) for p in sources),
                                        'helper_staging_paths_required')
                                require(value == expected_create(image, *sources, proposed), 'production_create_diverged')
                                reserved_name = proposed
                                response = command(expected_create(image, worker, snap, proposed))
                                cid = base64.b64decode(response[1]).strip().decode()
                                require(response[0]==0 and re.fullmatch('[a-f0-9]{64}',cid), 'real_create_failed')
                            else:
                                allowed = {('inspect','--format','{{json .State}}',cid),
                                    ('rm','--force',cid),
                                    ('container','ls','--all','--quiet','--no-trunc','--filter','name=^/'+str(reserved_name)+'$')}
                                require(cid is not None and value in allowed, 'relay_command_denied')
                                response = command(value)
                        elif op == 'start':
                            require(cid is not None and value==cid and stream is None, 'one_owned_start_only')
                            stream = subprocess.Popen(('/usr/bin/docker','start','--attach',cid),env=ENV,
                                stdin=subprocess.DEVNULL,stdout=subprocess.PIPE,stderr=subprocess.PIPE,close_fds=True)
                            streams=selectors.DefaultSelector()
                            for label,pipe in (('out',stream.stdout),('err',stream.stderr)):
                                os.set_blocking(pipe.fileno(),False); streams.register(pipe,selectors.EVENT_READ,label)
                            response = True
                        elif op == 'poll':
                            require(value is None and stream is not None, 'stream_required')
                            chunks={'out':b'','err':b''}
                            for key,_ in streams.select(timeout=0):
                                chunk=os.read(key.fileobj.fileno(),4096)
                                if chunk: chunks[key.data]+=chunk
                                else: streams.unregister(key.fileobj)
                            response=[base64.b64encode(chunks['out']).decode(),base64.b64encode(chunks['err']).decode(),
                                      stream.poll(),not streams.get_map()]
                        elif op == 'close':
                            require(value is None, 'close_shape')
                            if stream is not None:
                                if stream.poll() is None: stream.kill()
                                stream.wait(timeout=5)
                            response=True
                        else:
                            raise RuntimeError('relay_operation_denied')
                        helper.stdin.write(encode({'result':response})); helper.stdin.flush()
                require(helper.wait(timeout=5)==0, 'helper_exit_failed')
                require(command(('container','ls','--all','--quiet','--no-trunc','--filter','id='+cid))[1]=='',
                        'owned_container_survived')
                print('PASS read launcher:',mode,'; fresh claim refuses replay; owned container absent',flush=True)
            finally:
                failures=[]
                def attempt(action):
                    try: action()
                    except BaseException as error: failures.append(type(error).__name__)
                def reap(process):
                    if process.poll() is None: process.kill()
                    process.wait(timeout=5)
                if stream is not None:
                    attempt(lambda: reap(stream))
                    attempt(stream.stdout.close); attempt(stream.stderr.close)
                if streams is not None: attempt(streams.close)
                if cid is not None: attempt(lambda: command(('rm','--force',cid)))
                if reserved_name is not None: attempt(lambda: command(('rm','--force',reserved_name)))
                attempt(lambda: command(('rm','--force',name)))
                attempt(lambda: reap(helper))
                for pipe in (helper.stdin,helper.stdout,helper.stderr): attempt(pipe.close)
                attempt(selector.close)
                require(not failures,'relay_cleanup_unconfirmed')
    print('Offline synthetic CI only: no real operator, credentials, broker integration or model.',flush=True)


if __name__=='__main__':
    if len(sys.argv)==4 and sys.argv[1]=='--inside':
        isolated(sys.argv[2],sys.argv[3])
    else:
        main()
