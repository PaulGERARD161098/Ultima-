"""Operator-installed host for one deterministic fixture, never a model agent.

The GitHub token remains on this trusted host. The worker gets only a bounded
JSON envelope on stdin, read-only reviewed code and a private tmpfs. No network
request is performed on import. No command initializes or resets remote state.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

from .pilot_state import (Coordinator, CasConflict, AmbiguousWrite, decode_state,
                          encode_state, validate_transition)
from .pilot_worker import digest, encode, LIMIT
from leo.trial_resume import PROPOSAL

SHA = re.compile(r'[0-9a-f]{40}')
HEX = re.compile(r'[0-9a-f]{64}')
REPOSITORY = 'PaulGERARD161098/leo-control-r21'
STATE_REF = 'heads/r21-state'


def require(condition, code):
    if not condition:
        raise ValueError(code)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('api_redirect_denied')


class GitHub:
    def __init__(self, token, repository=REPOSITORY):
        require(repository == REPOSITORY, 'control_repository_required')
        self.token, self.repository = token, repository
        self.opener = urllib.request.build_opener(NoRedirect)

    def call(self, method, path, data=None):
        require(path.startswith('/') and '?' not in path and '..' not in path, 'api_path_denied')
        url = 'https://api.github.com/repos/' + self.repository + path
        request = urllib.request.Request(url, data=None if data is None else encode(data), method=method,
            headers={'Authorization': 'Bearer ' + self.token,
                     'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json',
                     'X-GitHub-Api-Version': '2022-11-28'})
        try:
            with self.opener.open(request, timeout=3) as response:
                content = response.read(2 * LIMIT + 1)
            require(len(content) <= 2 * LIMIT, 'api_response_limit')
            return json.loads(content)
        except urllib.error.HTTPError as error:
            # Never print server bodies, URLs, request headers or credentials.
            if method == 'PATCH' and error.code in (409, 422):
                raise CasConflict() from None
            if method != 'GET':
                raise AmbiguousWrite() from None
            raise ValueError('api_read_failed_' + str(error.code)) from None
        except (OSError, TimeoutError):
            if method != 'GET':
                raise AmbiguousWrite() from None
            raise ValueError('api_read_unavailable') from None

    def blob(self, sha):
        require(SHA.fullmatch(sha), 'blob_sha_required')
        result = self.call('GET', '/git/blobs/' + sha)
        require(result['encoding'] == 'base64' and result['size'] <= LIMIT, 'blob_limit')
        content = base64.b64decode(result['content'].replace('\n', ''), validate=True)
        actual = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
        require(actual == sha and len(content) == result['size'], 'blob_hash_mismatch')
        return content

    def put_blob(self, content):
        require(len(content) <= LIMIT, 'blob_limit')
        result = self.call('POST', '/git/blobs', {'encoding': 'base64',
                           'content': base64.b64encode(content).decode()})
        expected = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
        require(result['sha'] == expected, 'created_blob_mismatch')
        return expected


class GitState:
    def __init__(self, api, installation, seed_sha):
        require(SHA.fullmatch(seed_sha), 'external_seed_required')
        self.api, self.installation, self.seed = api, installation, seed_sha
        self.verified = {}

    def read(self):
        ref = self.api.call('GET', '/git/ref/' + STATE_REF)
        require(ref['ref'] == 'refs/' + STATE_REF and ref['object']['type'] == 'commit', 'state_ref_invalid')
        sha = ref['object']['sha']
        require(SHA.fullmatch(sha), 'state_sha_invalid')
        # A short one-shot pilot: bound history and validate every ancestor.
        # A forced rollback by the operator remains outside this trust model.
        cursor, current, child = sha, None, None
        for _ in range(32):
            if cursor in self.verified:
                state = self.verified[cursor]
                if child is not None:
                    validate_transition(cursor, state, child)
                current = current if current is not None else state
                self.verified[sha] = current
                return sha, current
            commit = self.api.call('GET', '/git/commits/' + cursor)
            tree = self.api.call('GET', '/git/trees/' + commit['tree']['sha'])
            require(not tree.get('truncated') and 1 <= len(tree['tree']) <= 3, 'state_tree_invalid')
            entries = {entry['path']: entry for entry in tree['tree']}
            require(len(entries) == len(tree['tree']) and 'state.json' in entries, 'state_tree_invalid')
            entry = entries['state.json']
            require(entry['path'] == 'state.json' and entry['mode'] == '100644'
                    and entry['type'] == 'blob', 'state_tree_invalid')
            state = decode_state(self.api.blob(entry['sha']), self.installation)
            expected = {'state.json': entry['sha'], **package_links(state)}
            require(set(entries) == set(expected) and all(
                entries[name]['sha'] == digest and entries[name]['mode'] == '100644'
                and entries[name]['type'] == 'blob' for name, digest in expected.items()), 'package_links_invalid')
            if child is not None:
                validate_transition(cursor, state, child)
            if current is None:
                current = state
            if cursor == self.seed:
                require(state['sequence'] == 0 and state['previous_sha'] is None
                        and state['phase'] == 'empty' and not state['stopped'], 'seed_not_empty')
                self.verified[sha] = current
                return sha, current
            require(len(commit['parents']) == 1, 'state_parent_invalid')
            child = state
            cursor = commit['parents'][0]['sha']
        raise ValueError('state_seed_not_ancestor')

    def cas(self, expected_sha, state):
        blob = self.api.put_blob(encode_state(state, self.installation))
        links = {'state.json': blob, **package_links(state)}
        tree = self.api.call('POST', '/git/trees', {'tree': [
            {'path': path, 'mode': '100644', 'type': 'blob', 'sha': sha}
            for path, sha in sorted(links.items())]})
        commit = self.api.call('POST', '/git/commits', {'message': 'R21 durable checkpoint',
            'parents': [expected_sha], 'tree': tree['sha']})
        require(SHA.fullmatch(commit['sha']), 'checkpoint_sha_invalid')
        result = self.api.call('PATCH', '/git/refs/' + STATE_REF,
                               {'sha': commit['sha'], 'force': False})
        require(result['object']['sha'] == commit['sha'], 'checkpoint_not_confirmed')
        return commit['sha']


def package_links(state):
    links = {}
    if state['package'] is not None:
        links['package.json'] = state['package']['blob_sha']
    operation = state['operations']['execute']
    if operation is not None:
        links['approved-package.json'] = operation['input_package']['blob_sha']
    return links


def code_digest(root, paths):
    require(type(paths) is list and paths and len(paths) < 100 and len(set(paths)) == len(paths), 'code_paths_invalid')
    hashes = {}
    for name in sorted(paths):
        require(type(name) is str and not Path(name).is_absolute() and '..' not in Path(name).parts,
                'code_path_invalid')
        path = root / name
        require(path.is_file() and not path.is_symlink() and path.resolve().is_relative_to(root.resolve()),
                'code_file_invalid')
        hashes[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    return digest(hashes)


def authenticate(env, event, config, api):
    install = config['installation']
    require(env.get('GITHUB_EVENT_NAME') == 'workflow_dispatch'
            and env.get('GITHUB_REPOSITORY') == REPOSITORY
            and env.get('GITHUB_REF') == 'refs/heads/main'
            and env.get('GITHUB_RUN_ATTEMPT') == '1'
            and env.get('GITHUB_ACTOR_ID') == str(install['actor_id']), 'dispatch_identity_denied')
    require(event['sender']['id'] == int(install['actor_id'])
            and event['repository']['full_name'] == REPOSITORY
            and event['repository']['private'] is True
            and event['ref'] in ('main', 'refs/heads/main'), 'dispatch_event_denied')
    run_id = env.get('GITHUB_RUN_ID', '')
    require(re.fullmatch('[1-9][0-9]{0,19}', run_id), 'run_id_invalid')
    run = api.call('GET', '/actions/runs/' + run_id)
    require(run['event'] == 'workflow_dispatch' and run['run_attempt'] == 1
            and run['actor']['id'] == int(install['actor_id'])
            and run['triggering_actor']['id'] == int(install['actor_id'])
            and run['repository']['full_name'] == REPOSITORY
            and run['head_branch'] == 'main' and run['head_sha'] == env.get('GITHUB_SHA')
            and run['path'] in ('.github/workflows/r21-pilot.yml', '.github/workflows/r21-stop.yml'),
            'dispatch_run_denied')
    current = api.call('GET', '/git/ref/heads/main')['object']['sha']
    require(current == env['GITHUB_SHA'], 'installed_code_moved')
    command = event['inputs'].get('command', '')
    if run['path'].endswith('r21-stop.yml'):
        require(command == 'stop', 'stop_workflow_only')
    else:
        require(command in ('prepare', 'status', 'execute', 'reconcile'), 'pilot_command_denied')
    require(config['review']['code_digest'] == install['code_digest']
            and config['review']['location'].startswith('https://github.com/PaulGERARD161098/Ultima-/')
            and config['review']['reviewer'] and config['review']['measured_at'], 'external_review_required')
    return command, run_id


def container_command(root, image, name, command):
    require(re.fullmatch(r'python@sha256:[0-9a-f]{64}', image), 'pinned_python_image_required')
    require(command in ('prepare', 'execute'), 'worker_command_denied')
    return ['docker', 'run', '--rm', '-i', '--name', name, '--pull=never',
        '--read-only', '--network', 'none', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
        '--user', '65534:65534', '--memory', '512m', '--cpus', '1', '--pids-limit', '128',
        '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=128m,mode=1777',
        '--tmpfs', '/trial-output:rw,nosuid,nodev,noexec,size=128m,mode=0700,uid=65534,gid=65534',
        '--mount', 'type=bind,src=' + str(root / 'leo') + ',dst=/workspace/leo,readonly',
        '--mount', 'type=bind,src=' + str(root / 'finubar') + ',dst=/workspace/finubar,readonly',
        '--workdir', '/workspace', '--env', 'LV1_ISOLATED=1', '--env', 'PYTHONDONTWRITEBYTECODE=1',
        '--env', 'GIT_CONFIG_GLOBAL=/dev/null', '--env', 'GIT_CONFIG_NOSYSTEM=1',
        image, 'timeout', '--signal=TERM', '--kill-after=2s', '115s',
        'python', '-m', 'leo.control_r21.pilot_worker', command]


def run_worker(root, image, run_id, command, payload, coordinator):
    name = 'r21-' + run_id
    # env is intentionally rebuilt; the host token is never inherited by Docker.
    env = {'PATH': '/usr/bin:/bin', 'HOME': '/tmp', 'LANG': 'C.UTF-8'}
    deadline = time.monotonic() + 120
    subprocess.run(['docker', 'pull', image], env=env, capture_output=True, timeout=60, check=True)
    require(not coordinator.status().state['stopped'], 'stopped_before_launch')
    with tempfile.TemporaryFile() as source, tempfile.TemporaryFile() as output, tempfile.TemporaryFile() as errors:
        source.write(encode(payload)); source.seek(0)
        process = subprocess.Popen(container_command(root, image, name, command), env=env,
            stdin=source, stdout=output, stderr=errors)
        try:
            while process.poll() is None:
                require(time.monotonic() < deadline, 'worker_deadline')
                require(output.tell() <= LIMIT and errors.tell() <= LIMIT, 'worker_output_limit')
                require(not coordinator.status().state['stopped'], 'worker_stopped')
                time.sleep(1)
            require(process.returncode == 0, 'worker_failed_result_unknown')
            output.seek(0)
            raw = output.read(LIMIT + 1)
            require(len(raw) <= LIMIT, 'worker_output_limit')
            return json.loads(raw)
        finally:
            # Docker kill removes the whole container's PID namespace, including
            # detached descendants. No claim that it reverses a committed effect.
            subprocess.run(['docker', 'rm', '-f', name], env=env, capture_output=True, timeout=15)
            if process.poll() is None:
                process.kill()
            process.wait(timeout=5)


def package_read(api, metadata):
    content = api.blob(metadata['blob_sha'])
    require(hashlib.sha256(content).hexdigest() == metadata['sha256'], 'package_anchor_mismatch')
    return json.loads(content)


def consent_for(package, config):
    return {'package_sha256': digest(package), 'context': package['context'],
            'expires_at': package['expires_at'], 'operation': PROPOSAL,
            'installation': config['installation'], 'review': config['review']}


def main():
    def interrupted(signum, frame):
        raise RuntimeError('host_interrupted')
    signal.signal(signal.SIGTERM, interrupted)
    signal.signal(signal.SIGINT, interrupted)
    root = Path.cwd().resolve()
    config = json.loads((root / 'pilot-installation.json').read_bytes())
    install = config['installation']
    require(code_digest(root, config['code_paths']) == install['code_digest'], 'installed_code_changed')
    api = GitHub(os.environ['R21_HOST_TOKEN'])
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_bytes())
    command, run_id = authenticate(os.environ, event, config, api)
    store = GitState(api, install, os.environ['R21_STATE_SEED'])
    coordinator = Coordinator(store, install)
    if command == 'stop':
        decision = coordinator.stop()
    elif command in ('status', 'reconcile'):
        # Read only: a running/unknown effect is never relaunched. A lost result
        # before durable completion is explicitly unrecoverable in this pilot.
        decision = coordinator.status()
    else:
        approval = event['inputs'].get('approval_digest', '')
        before = coordinator.status().state
        request_digest = digest({'command': command, 'run_id': run_id, 'approval': approval})
        payload = {'provenance': config['provenance']}
        if command == 'execute':
            original = before['operations']['execute']
            package = package_read(api, original['input_package'] if original else before['package'])
            consent = consent_for(package, config)
            require(approval == digest(consent), 'exact_human_consent_required')
            payload.update(package=package, consent=consent, approval_digest=approval,
                           review_location=config['review']['location'],
                           review_measured_at=config['review']['measured_at'])
            decision = coordinator.execute(run_id, run_id, request_digest, approval, time.time())
        else:
            decision = coordinator.prepare(run_id, run_id, request_digest)
        if decision.launch:
            try:
                result = run_worker(root, install['image_digest'], run_id, command, payload, coordinator)
                package = result['package']
                require(package['provenance'] == payload['provenance'], 'worker_provenance_changed')
                consent_digest = digest(consent_for(package, config)) if command == 'prepare' else approval
                metadata = {'blob_sha': api.put_blob(encode(package)), 'sha256': digest(package),
                    'context_digest': consent_digest, 'expires_at': package['expires_at']}
                decision = coordinator.finish(decision.reservation, result['receipt'], package=metadata)
            except Exception:
                coordinator.unknown(decision.reservation)
                raise
    # No archive or token is printed. Private Actions log is an operator report.
    print(json.dumps({'environment': 'deterministic_fixture', 'autonomous_agent': False,
        'global_v1_accepted': False, 'contract_version': '1.1', 'runtime_skill_version': '1.0',
        'state_sha': decision.state_sha, 'state': decision.state}, sort_keys=True))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('R21 refused: ' + type(error).__name__, file=sys.stderr)
        raise SystemExit(1)
