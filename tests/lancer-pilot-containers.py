"""CI launcher: stdlib/Docker only on the runner; application code stays isolated.

This is a synthetic fixture test, never a dispatch or authenticated Paul approval.
The closed helper compares the complete argv with the production factory before
the runner launches it. No Docker socket, token or host environment enters a box.
"""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import time
import uuid

LIMIT = 12 * 1024 * 1024
PRIVATE = '/trial-output:rw,nosuid,nodev,noexec,size=128m,mode=0700,uid=65534,gid=65534'
OLD = '/trial-output:rw,nosuid,nodev,noexec,size=128m,mode=1777'


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def arguments(root, image, name, command):
    # Closed runner policy, compared in full with container_command INSIDE a box.
    return ['docker', 'run', '--rm', '-i', '--name', name, '--pull=never',
        '--read-only', '--network', 'none', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
        '--user', '65534:65534', '--memory', '512m', '--cpus', '1', '--pids-limit', '128',
        '--tmpfs', '/tmp:rw,nosuid,nodev,noexec,size=128m,mode=1777',
        '--tmpfs', PRIVATE,
        '--mount', 'type=bind,src=' + str(root / 'leo') + ',dst=/workspace/leo,readonly',
        '--mount', 'type=bind,src=' + str(root / 'finubar') + ',dst=/workspace/finubar,readonly',
        '--workdir', '/workspace', '--env', 'LV1_ISOLATED=1', '--env', 'PYTHONDONTWRITEBYTECODE=1',
        '--env', 'GIT_CONFIG_GLOBAL=/dev/null', '--env', 'GIT_CONFIG_NOSYSTEM=1',
        image, 'timeout', '--signal=TERM', '--kill-after=2s', '115s',
        'python', '-m', 'leo.control_r21.pilot_worker', command]


def launch(args, payload, *, expected_failure=False):
    raw = json.dumps(payload, allow_nan=False).encode()
    require(len(raw) <= LIMIT, 'input_limit')
    name = args[args.index('--name') + 1]
    env = {'PATH': '/usr/bin:/bin', 'HOME': '/tmp', 'LANG': 'C.UTF-8'}
    with tempfile.TemporaryFile() as source, tempfile.TemporaryFile() as output, tempfile.TemporaryFile() as errors:
        source.write(raw)
        source.seek(0)
        process = subprocess.Popen(args, env=env, stdin=source, stdout=output, stderr=errors)
        deadline = time.monotonic() + 125
        try:
            while process.poll() is None:
                require(time.monotonic() < deadline, 'container_deadline')
                require(output.tell() <= LIMIT and errors.tell() <= LIMIT, 'output_limit')
                time.sleep(0.1)
            output.seek(0)
            errors.seek(0)
            result, diagnostic = output.read(LIMIT + 1), errors.read(LIMIT + 1)
            require(len(result) <= LIMIT and len(diagnostic) <= LIMIT, 'output_limit')
            if expected_failure:
                require(process.returncode != 0 and not result
                        and diagnostic.rstrip().splitlines()[-1:]
                        == [b'leo.runtime.policy.Refusal: control_permissions_unsafe'],
                        'old_mount_did_not_reproduce_control_permissions_unsafe')
                return None
            if process.returncode != 0:
                # Only closed, synthetic fixtures enter this harness.
                sys.stderr.write(diagnostic.decode('utf-8', errors='replace'))
                raise RuntimeError('fixture_container_failed')
            return json.loads(result)
        finally:
            try:
                subprocess.run(['docker', 'rm', '-f', name], env=env,
                               capture_output=True, timeout=15, check=False)
            finally:
                if process.poll() is None:
                    process.kill()
                process.wait(timeout=5)


def inside(mode):
    # This branch is executed ONLY in the closed helper container.
    sys.path.insert(0, '/workspace')
    from leo import trial, trial_resume
    from leo.control_r21.pilot_host import container_command, consent_for
    from leo.control_r21.pilot_worker import digest
    trial._isolated()
    raw = sys.stdin.buffer.read(LIMIT + 1)
    require(len(raw) <= LIMIT, 'helper_input_limit')
    data = json.loads(raw)
    if mode == 'plan':
        for command in ('prepare', 'execute'):
            args = data['commands'][command]
            name = args[args.index('--name') + 1]
            require(args == container_command(Path(data['root']), data['image'], name, command),
                    'harness_diverged_from_production_argv')
        result = {'provenance': {'source': 'a' * 40, 'target': 'b' * 40, 'integration': 'c' * 40}}
    elif mode == 'consent':
        require(data['receipt'] == {'status': 'prepared'}, 'prepare_receipt_missing')
        package = data['package']
        require(package['context']['repository'] == '/trial-output/trial/fixture.git', 'wrong_fixture_path')
        config = {'installation': {'id': 'synthetic-ci-only'},
                  'review': {'location': 'fixture://synthetic-review', 'measured_at': '2000-01-01'}}
        consent = consent_for(package, config)
        result = {'provenance': package['provenance'], 'package': package, 'consent': consent,
                  'approval_digest': digest(consent), 'review_location': config['review']['location'],
                  'review_measured_at': config['review']['measured_at']}
    elif mode == 'verify':
        import base64
        receipt, package = data['result']['receipt'], data['result']['package']
        original = data['approved']['package']
        require(receipt['status'] == 'completed', 'execute_receipt_missing')
        require(receipt['result'] == {'commit': original['context']['integration'],
                'environment': 'fixture', 'publication': False}, 'wrong_effect_receipt')
        require(package['context'] == original['context']
                and package['provenance'] == original['provenance']
                and package['expires_at'] == original['expires_at'], 'result_context_changed')
        archive = Path('/trial-output/result.tar.gz')
        archive.write_bytes(base64.b64decode(package['archive_b64'], validate=True))
        root = trial_resume._unpack(archive, package['archive_sha256'], Path('/trial-output/trial'))
        observed = trial.inspect(root)
        merges = [op for op in observed['operations'] if op['id'] == trial_resume.PROPOSAL['operation_id']]
        require(observed['state'] == 'merged' and observed['target_observed'] == original['context']['integration']
                and observed['global_v1_accepted'] is False and len(merges) == 1
                and merges[0]['status'] == 'completed' and merges[0]['result'] == receipt['result'],
                'checkpoint_did_not_preserve_single_completed_effect')
        result = {'status': 'completed', 'fresh_container_checkpoint': True,
                  'autonomous_agent': False, 'global_v1_accepted': False}
    else:
        raise RuntimeError('unknown_helper_mode')
    encoded = json.dumps(result, allow_nan=False).encode()
    require(len(encoded) <= LIMIT, 'helper_output_limit')
    sys.stdout.buffer.write(encoded)


def main():
    require(os.environ.get('GITHUB_ACTIONS') == 'true', 'ci_launcher_only')
    image = sys.argv[1]
    require(re.fullmatch(r'python@sha256:[0-9a-f]{64}', image), 'pinned_image_required')
    root = Path(__file__).resolve().parents[1]
    prefix = 'r21-ci-' + uuid.uuid4().hex
    commands = {command: arguments(root, image, prefix + '-' + command, command)
                for command in ('prepare', 'execute')}

    def helper(mode, data):
        args = arguments(root, image, prefix + '-' + mode, 'prepare')
        i = args.index(image)
        args[i:i] = ['--mount', 'type=bind,src=' + str(Path(__file__).resolve()) + ',dst=/checks.py,readonly']
        args[-4:] = ['python', '-I', '/checks.py', '--inside', mode]
        return launch(args, data)

    prepare_input = helper('plan', {'root': str(root), 'image': image, 'commands': commands})
    prepared = launch(commands['prepare'], prepare_input)
    execute_input = helper('consent', prepared)
    old_args = list(commands['execute'])
    old_args[old_args.index('--name') + 1] = prefix + '-negative'
    old_args[old_args.index(PRIVATE)] = OLD
    launch(old_args, execute_input, expected_failure=True)
    print('PASS: old mode1777 reproduces control_permissions_unsafe without a completed receipt', flush=True)
    result = launch(commands['execute'], execute_input)
    verified = helper('verify', {'approved': execute_input, 'result': result})
    require(verified['status'] == 'completed' and verified['fresh_container_checkpoint'] is True
            and verified['autonomous_agent'] is False and verified['global_v1_accepted'] is False,
            'verification_missing')
    print('PASS: exact production argv; prepare -> fresh execute -> fresh checkpoint inspection; one completed fixture effect', flush=True)
    print('Synthetic CI only: no operator authentication, GitHub state or autonomous agent tested.', flush=True)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--inside':
        inside(sys.argv[2])
    else:
        main()
