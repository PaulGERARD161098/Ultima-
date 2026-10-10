"""Build an INERT installation candidate offline. Never import, authorize or dispatch.

Candidate lacks operator review attestation and external seed. Installation
requires a separate, exact approval; no token is required by this builder.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import uuid

from .pilot_host import code_digest
from .pilot_state import new_state, encode_state

FILES = ['leo/__init__.py', 'leo/trial.py', 'leo/trial_resume.py',
    'leo/runtime/__init__.py', 'leo/runtime/policy.py', 'leo/runtime/broker.py',
    'leo/runtime/budget.py', 'leo/runtime/memoire.py', 'leo/runtime/dispatch.py',
    'leo/runtime/fixture_git.py', 'leo/runtime/fixture_transport.py',
    'finubar/leo_control.py', 'finubar/leo_process.py',
    'leo/control_r21/pilot_host.py', 'leo/control_r21/pilot_worker.py',
    'leo/control_r21/pilot_state.py']


def build(source, output, source_sha, image, target_sha, integration_sha):
    if not re.fullmatch('[0-9a-f]{40}', source_sha) or not re.fullmatch('python@sha256:[0-9a-f]{64}', image):
        raise ValueError('exact_source_and_image_required')
    if not all(re.fullmatch('[0-9a-f]{40}', value) for value in (target_sha, integration_sha)):
        raise ValueError('exact_provenance_required')
    output.mkdir(parents=False, exist_ok=False)
    code = output / 'main'
    code.mkdir()
    for name in FILES:
        original = source / name
        if original.is_symlink() or not original.is_file():
            raise ValueError('source_file_missing')
        target = code / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(original.read_bytes())
    paths = list(FILES)
    for name in ('r21-pilot', 'r21-stop'):
        target = code / '.github/workflows' / (name + '.yml')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((source / 'leo/control_r21/pilot' / (name + '.yml.in')).read_bytes())
        paths.append(str(target.relative_to(code)))
    installation = {'id': uuid.uuid4().hex, 'seed': uuid.uuid4().hex + uuid.uuid4().hex,
                    'source_sha': source_sha, 'code_digest': code_digest(code, paths),
                    'image_digest': image, 'actor_id': 277032273}
    config = {'installation': installation, 'code_paths': sorted(paths),
              'provenance': {'source': source_sha, 'target': target_sha, 'integration': integration_sha},
              'review': {'code_digest': installation['code_digest'],
                         'location': '', 'reviewer': '', 'measured_at': ''}}
    (code / 'pilot-installation.json').write_text(json.dumps(config, indent=2) + '\n')
    state = output / 'r21-state'
    state.mkdir()
    (state / 'state.json').write_bytes(encode_state(new_state(installation), installation))
    (output / 'INERT.txt').write_text(
        'CANDIDATE ONLY. No installation, activation or human approval.\n'
        'main/ -> future code branch, r21-state/ -> future state branch.\n'
        'Operator must anchor the independent review and initial state SHA.\n'
        'No Work access to the private control repository.\n'
        'Legacy deterministic fixture: contract 1.1, runtime skill 1.0; NOT Leo skill 1.4.\n')
    return {'source_sha': source_sha, 'code_digest': installation['code_digest'],
            'image': image, 'autonomous_agent': False, 'installed': False}


SERVICE_FILES = FILES + ['leo/control_r21/pilot_build.py',
    'leo/control_r21/read_candidate.py','leo/control_r21/read_launcher.py',
    'leo/control_r21/read_watchdog.py','leo/control_r21/read_worker.py',
    'leo/control_r21/read_reaper.py','leo/control_r21/read_service_entry.py',
    'leo/control_r21/service/leo-read.service.in']


def build_read_service(source, output, source_sha, image, target_sha, integration_sha):
    """Reuse frozen-file builder conventions; separate inert candidate, no seed."""
    if (not all(type(v) is str and re.fullmatch('[a-f0-9]{40}',v)
            for v in (source_sha,target_sha,integration_sha))
            or not re.fullmatch('python@sha256:[a-f0-9]{64}',image)):
        raise ValueError('exact_service_provenance_required')
    output.mkdir(parents=False,exist_ok=False)
    code=output/'code'; code.mkdir()
    for name in SERVICE_FILES:
        original=source/name
        if (original.is_symlink() or not original.is_file()
                or not original.resolve().is_relative_to(source.resolve())):
            raise ValueError('source_file_missing')
        target=code/name; target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(original.read_bytes())
    installation_id=uuid.uuid4().hex
    config={'kind':'offline_read_service','id':installation_id,
        'source_sha':source_sha,'target_sha':target_sha,'integration_sha':integration_sha,
        'code_paths':sorted(SERVICE_FILES),'code_digest':code_digest(code,sorted(SERVICE_FILES)),
        'code_root':'/opt/leo-read/'+installation_id+'/code',
        'state_root':'/var/lib/leo-read/'+installation_id,'image':image,
        'worker_sha256':hashlib.sha256((code/'leo/control_r21/read_worker.py').read_bytes()).hexdigest(),
        'snapshot_sha256':'','principal':'','mission':'','operation_id':'','expected_version':None,
        'approved':False,'review':{'reviewer':'','location':'','measured_at':''}}
    (output/'installation.json').write_text(json.dumps(config,sort_keys=True,indent=2)+'\n')
    unit=(code/'leo/control_r21/service/leo-read.service.in').read_text().replace('@ID@',installation_id)
    (output/('leo-read-'+installation_id+'.service')).write_text(unit)
    (output/'INERT.txt').write_text(
        'OFFLINE ONE-SHOT CANDIDATE ONLY. NOT INSTALLED OR APPROVED.\n'
        'No initial/reset state, live acquisition, model, credentials or paid calls.\n'
        'Existing canonical mission/budget/latch required outside worker rights.\n'
        'One claim per installation. Restart=no; no timer or enable instructions.\n'
        'Operator must verify Linux/systemd/pidfd/Python/Docker and UID separation.\n'
        'ProtectSystem=strict protects frozen code/config; state remains private.\n'
        'Host Docker access is powerful and must never be granted to worker.\n'
        'ExecStopPost cleanup must be tested with real manager on chosen host.\n')
    return {'source_sha':source_sha,'code_digest':config['code_digest'],'id':installation_id,
            'installed':False,'approved':False,'autonomous_agent':False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--read-service',action='store_true')
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--source-sha', required=True)
    parser.add_argument('--image', required=True)
    parser.add_argument('--target-sha', required=True)
    parser.add_argument('--integration-sha', required=True)
    args = parser.parse_args()
    builder=build_read_service if args.read_service else build
    print(json.dumps(builder(args.source, args.output, args.source_sha, args.image,
                           args.target_sha, args.integration_sha), sort_keys=True))


if __name__ == '__main__':
    main()
