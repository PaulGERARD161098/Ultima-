"""Reprise R21 isolée. La CLI vérifie des données, jamais un accord.

L'hôte authentifié conserve le SHA du paquet, le contexte, le mandat et les
preuves hors du paquet. execute est une API hôte, pas une API modèle/web.
Le répertoire restauré appartient exclusivement à cet hôte (pas de concurrence
filesystem hostile). Aucun accès GitHub, Work, Supabase ou modèle externe.
"""
import argparse
from dataclasses import asdict
import hashlib
import gzip
import io
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import sqlite3
import tarfile
import tempfile
import time
import zipfile

from . import trial
from .runtime.broker import Broker, mandate_record
from .runtime.fixture_git import FixtureGit
from .runtime.policy import Approval, Context, Evidence, Mandate, Refusal

MAX_BYTES = 8 * 1024 * 1024
MAX_FILES = 256
PROPOSAL = {'action': 'merge_fixture', 'operation_id': 'r21-merge-1', 'expected_version': 2}


def _unpack(package, digest, destination):
    """Vérifier l'archive entière avant extraction manuelle sans liens/permissions."""
    package, destination = Path(package), Path(destination).absolute()
    if not re.fullmatch('[0-9a-f]{64}', digest):
        raise Refusal('trusted_package_sha_required')
    if package.is_symlink() or not package.is_file() or package.stat().st_size > MAX_BYTES:
        raise Refusal('invalid_package')
    content = package.read_bytes()
    if hashlib.sha256(content).hexdigest() != digest:
        raise Refusal('package_sha_mismatch')
    if destination.exists() or destination.is_symlink():
        raise FileExistsError(str(destination))
    if destination.parent.resolve(strict=True) != destination.parent:
        raise Refusal('destination_symlink_denied')
    if zipfile.is_zipfile(io.BytesIO(content)):
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            items = archive.infolist()
            if len(items) != 1 or items[0].filename != 'trial.tar.gz' or items[0].file_size > MAX_BYTES:
                raise Refusal('invalid_zip_envelope')
            content = archive.read(items[0])
    # Bound decompressed headers too (PAX/long-name headers are parsed before
    # tarfile yields a member, so a per-member size check alone is insufficient).
    with gzip.GzipFile(fileobj=io.BytesIO(content)) as compressed:
        content = compressed.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise Refusal('trial_archive_too_large')
    with tempfile.TemporaryDirectory(dir=destination.parent, prefix='.r21-') as temporary:
        stage = Path(temporary)
        with tarfile.open(fileobj=io.BytesIO(content), mode='r:') as archive:
            seen, total = set(), 0
            for number, member in enumerate(archive):
                name = PurePosixPath(member.name)
                total += member.size
                if (number >= MAX_FILES or total > MAX_BYTES or member.size < 0
                        or name.is_absolute() or '..' in name.parts or not name.parts
                        or name.parts[0] != 'trial' or str(name) != member.name.rstrip('/')
                        or member.name in seen or not (member.isfile() or member.isdir())):
                    raise Refusal('unsafe_trial_archive')
                seen.add(member.name)
                path = stage.joinpath(*name.parts)
                if member.isdir():
                    path.mkdir(mode=0o700, parents=True, exist_ok=True)
                else:
                    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
                    with path.open('xb') as output, archive.extractfile(member) as source:
                        shutil.copyfileobj(source, output, length=65536)
                    path.chmod(0o600)
        if not (stage / 'trial').is_dir():
            raise Refusal('trial_missing')
        # Parent is an exclusive host capability, never writable by a model.
        (stage / 'trial').rename(destination)
    return destination


def _canonical(root, mandate, context, *, initial):
    if type(mandate) is not Mandate or type(context) is not Context:
        raise Refusal('typed_host_authority_required')
    path = Path(root).resolve(strict=True) / 'canonical.sqlite'
    if path.is_symlink() or not path.is_file() or path.stat().st_size > 1024 * 1024:
        raise Refusal('invalid_trial_database')
    with sqlite3.connect(path.as_uri() + '?mode=ro', uri=True) as db:
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA query_only=ON')
        db.execute('PRAGMA trusted_schema=OFF')
        objects = db.execute("SELECT type,name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").fetchall()
        allowed = {'missions', 'operations', 'budget_missions', 'budget_operations'}
        if ({r['name'] for r in objects if r['type'] == 'table'} != allowed
                or any(r['type'] != 'table' for r in objects)
                or db.execute('PRAGMA application_id').fetchone()[0] != 0x4C454F31
                or db.execute('PRAGMA user_version').fetchone()[0] != 1):
            raise Refusal('trial_schema_changed')
        missions = db.execute('SELECT * FROM missions').fetchall()
        if len(missions) != 1:
            raise Refusal('trial_mission_changed')
        mission = dict(missions[0])
        source = {'repository': context.repository, 'commit': context.integration}
        if (mission['id'] != trial.MISSION or mission['owner'] != mandate.owner
                or mission['project'] != 'fiction' or json.loads(mission['mandat']) != mandate_record(mandate)
                or json.loads(mission['source']) != source or json.loads(mission['readers']) != []
                or json.loads(mission['writers']) != [trial.ACTOR]):
            raise Refusal('trial_authority_mismatch')
        budgets = db.execute('SELECT * FROM budget_missions').fetchall()
        expected = dict(mission=trial.MISSION, max_units=4, max_calls=3, max_attempts=3,
                        max_delegates=2, expires_at=mandate.expires_at, stopped=0, reason=None)
        if not initial and len(budgets) == 1 and budgets[0]['stopped'] in (0, 1):
            expected.update(stopped=budgets[0]['stopped'], reason=budgets[0]['reason'])
        if len(budgets) != 1 or dict(budgets[0]) != expected:
            raise Refusal('trial_budget_changed')
        operations = db.execute('SELECT * FROM operations').fetchall()
        reserved = db.execute('SELECT * FROM budget_operations').fetchall()
        ids = {'r21-inspect-defect', 'r21-inspect-patch'}
        if initial and (mission['version'] != 2 or mission['state'] != 'ready_for_review'
                        or {r['operation_id'] for r in operations} != ids
                        or len(operations) != 2 or len(reserved) != 2):
            raise Refusal('trial_initial_state_changed')
        if {r['operation_id'] for r in operations} - ids - {PROPOSAL['operation_id']}:
            raise Refusal('trial_operations_changed')
        for operation in operations:
            if operation['mission_id'] != trial.MISSION:
                raise Refusal('trial_operations_changed')
            if operation['operation_id'] in ids:
                payload, result = json.loads(operation['payload']), json.loads(operation['result'])
                label = operation['operation_id'].removeprefix('r21-inspect-')
                if (operation['status'] != 'completed' or operation['base_version'] != 1
                        or payload.get('kind') != 'delegate_fixture' or payload.get('source') != source
                        or payload.get('units') != 1 or result.get('source') != source
                        or result.get('outcome') != ('failed' if label == 'defect' else 'passed')):
                    raise Refusal('trial_inspection_changed')
        for reservation in reserved:
            if reservation['mission'] != trial.MISSION or reservation['operation'] not in ids | {PROPOSAL['operation_id']}:
                raise Refusal('trial_reservation_changed')
            if reservation['operation'] in ids and (reservation['actor'] != 'inspector'
                    or reservation['reserved_units'] != 1 or reservation['used_units'] != 1):
                raise Refusal('trial_reservation_changed')
    return mission


def verify(package, trusted_sha256, destination, provenance, expected_repository='/trial-output/trial/fixture.git'):
    """Les arguments trusted/provenance viennent de la CI hôte, pas du paquet."""
    trial._isolated()
    root = _unpack(package, trusted_sha256, destination)
    observed = trial.inspect(root)
    manifest = json.loads((root / 'manifest.json').read_text())
    if observed['ultima_provenance'] != provenance:
        raise Refusal('trial_provenance_mismatch')
    context = Context(**observed['fixture_context'])
    if context.repository != expected_repository or context.environment != 'fixture' or context.account != 'fixture-account':
        raise Refusal('trial_context_mismatch')
    # A candidate reconstructed for consistency checks only, NEVER execution authority.
    mandate = Mandate(trial.MISSION, trial.OWNER, 1, frozenset({trial.ACTOR, 'inspector'}),
        frozenset({expected_repository}), frozenset({'status', 'merge_fixture', 'read_source'}),
        quadrants=frozenset({'code'}), expires_at=manifest['mandate_expires_at'])
    _canonical(root, mandate, context, initial=True)
    if observed['target_observed'] != context.target or observed['source_observed'] != context.source:
        raise Refusal('trial_refs_changed')
    return {**observed, 'package_sha256': trusted_sha256, 'proposal': dict(PROPOSAL),
            'mandate_candidate_data_only': mandate_record(mandate),
            'missing': ['independent_host_evidence', 'exact_authenticated_approval'],
            'effects': ['update_fixture_ref'], 'publication': False}


def execute(root, *, mandate, context, evidence, approval, principal, reconcile=False, clock=time.time):
    """Trusted-host ONLY. No deserialization of authority and no automatic grant.

    Host has independently authenticated this archive and exclusively owns root.
    Simulation callers cannot authenticate Paul. Reconcile reads an existing
    effect without repeating it; a fresh process uses the same canonical DB.
    """
    trial._isolated()
    evidence = tuple(evidence)
    if (type(mandate) is not Mandate or type(context) is not Context
            or (approval is not None and type(approval) is not Approval)
            or any(type(item) is not Evidence for item in evidence)):
        raise Refusal('typed_host_authority_required')
    root = Path(root).resolve(strict=True)
    if context.repository != str(root / 'fixture.git'):
        raise Refusal('trial_relocation_requires_revalidation')
    observed = trial.inspect(root)
    if observed['fixture_context'] != asdict(context):
        raise Refusal('trial_context_mismatch')
    _canonical(root, mandate, context, initial=False)
    broker = Broker(root / 'canonical.sqlite', mandate, context.repository, clock=clock,
        fixture_adapter=FixtureGit(root, root / 'fixture.git'), context=context,
        evidence=evidence, approval=approval)
    if reconcile:
        return broker.reconcile_fixture(principal, PROPOSAL['operation_id'])
    return broker.execute(principal, dict(PROPOSAL))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    command = parser.add_subparsers(dest='command', required=True).add_parser('verify')
    command.add_argument('package')
    command.add_argument('--sha256', required=True)
    command.add_argument('--destination', required=True)
    command.add_argument('--expected-repository', default='/trial-output/trial/fixture.git')
    for name in ('source', 'target', 'integration'):
        command.add_argument('--' + name + '-sha', required=True)
    args = parser.parse_args()
    result = verify(args.package, args.sha256, args.destination,
                    {name: getattr(args, name + '_sha') for name in ('source', 'target', 'integration')},
                    args.expected_repository)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == '__main__':
    main()
