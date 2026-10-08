"""Reviewed deterministic fixture worker. No model, credentials or production adapters.

Only the trusted, installed pilot_host may provide the stdin envelope. Its
authenticated dispatch and external journal are the authority boundary. This
module alone cannot authenticate Paul; invoking it in a test is a simulation.
"""
import base64
from dataclasses import asdict
import hashlib
import io
import json
from pathlib import Path
import sys
import tarfile
import time

from finubar.leo_control import ControlLatch
from leo import trial, trial_resume
from leo.runtime.policy import Approval, Context, Evidence, Mandate, Refusal

ROOT = Path('/trial-output/trial')
LIMIT = 12 * 1024 * 1024


def encode(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()


def digest(value):
    return hashlib.sha256(encode(value)).hexdigest()


def archive(root):
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode='w:gz') as bundle:
        bundle.add(root, arcname='trial', recursive=True)
    return stream.getvalue()


def envelope(root, provenance):
    observed = trial.inspect(root)
    manifest = json.loads((root / 'manifest.json').read_text())
    content = archive(root)
    return {'archive_b64': base64.b64encode(content).decode(),
            'archive_sha256': hashlib.sha256(content).hexdigest(),
            'context': observed['fixture_context'], 'provenance': provenance,
            'expires_at': manifest['mandate_expires_at']}


def run(command, payload, root=ROOT):
    trial._isolated()
    provenance = payload['provenance']
    if command == 'prepare':
        trial.prepare(root, provenance)
        return {'package': envelope(root, provenance), 'receipt': {'status': 'prepared'}}
    if command != 'execute':
        raise Refusal('worker_command_denied')
    package = payload['package']
    # Host anchored package and exact consent arrive outside the tar archive.
    if (payload['approval_digest'] != digest(payload['consent'])
            or payload['consent']['package_sha256'] != digest(package)
            or payload['consent']['context'] != package['context']
            or payload['consent']['operation'] != trial_resume.PROPOSAL
            or payload['consent']['expires_at'] != package['expires_at']
            or not payload['review_location']):
        raise Refusal('host_consent_mismatch')
    content = base64.b64decode(package['archive_b64'], validate=True)
    saved = root.parent / 'incoming.tar.gz'
    saved.write_bytes(content)
    checked = trial_resume.verify(saved, package['archive_sha256'], root, provenance,
                                  str(root / 'fixture.git'))
    if checked['fixture_context'] != package['context']:
        raise Refusal('host_context_mismatch')
    context = Context(**package['context'])
    expires = package['expires_at']
    if type(expires) not in (int, float) or not time.time() < expires <= time.time() + 86400:
        raise Refusal('host_mandate_expired')
    mandate = Mandate(trial.MISSION, trial.OWNER, 1,
        frozenset({trial.ACTOR, 'inspector'}), frozenset({context.repository}),
        frozenset({'status', 'merge_fixture', 'read_source'}),
        quadrants=frozenset({'code'}), expires_at=expires)
    # Re-run the fixed oracle on exact Git content; never trust green JSON alone.
    from leo.runtime.fixture_git import FixtureGit
    import subprocess
    adapter = FixtureGit(root, root / 'fixture.git')
    for commit, expected in ((context.target, 1), (context.source, 0), (context.integration, 0)):
        content = adapter.git('show', commit + ':fixture.py')
        result = subprocess.run([sys.executable, '-I', '-c', content + trial.ORACLE],
            env={'PATH': '/usr/bin:/bin'}, capture_output=True, timeout=5)
        if result.returncode != expected or (expected == 1 and b'AssertionError: R21:' not in result.stderr):
            raise Refusal('fresh_oracle_failed')
    measured = str(time.time())
    proofs = (Evidence(context, 'tests', True, 'fixed-fixture-oracle', measured, 'python -I fixed oracle'),
              Evidence(context, 'review', True, payload['review_location'], payload['review_measured_at'],
                       'operator-anchored independent review of exact deterministic recipe'))
    latch = ControlLatch(root.parent / 'control.sqlite', initialize=True)
    receipt = trial_resume.execute(root, mandate=mandate, context=context, evidence=proofs,
        approval=Approval(context, trial.OWNER, 1, expires), principal=trial.ACTOR,
        control_latch=latch)
    if receipt['status'] != 'completed':
        raise Refusal('worker_result_unknown')
    return {'package': envelope(root, provenance), 'receipt': receipt}


def main():
    raw = sys.stdin.buffer.read(LIMIT + 1)
    if len(raw) > LIMIT:
        raise Refusal('worker_input_limit')
    payload = json.loads(raw)
    result = run(sys.argv[1], payload)
    output = encode(result)
    if len(output) > LIMIT:
        raise Refusal('worker_output_limit')
    sys.stdout.buffer.write(output)


if __name__ == '__main__':
    main()
