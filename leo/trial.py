"""Préparation R21, uniquement dans le conteneur CI isolé.

`python -m leo.trial prepare --output /trial-output/mission --source-sha ...
 --target-sha ... --integration-sha ...` produit un paquet à relire.
`python -m leo.trial inspect /trial-output/mission` reprend en lecture seule,
dans le même bac à sable contrôlé, y compris après transfert du paquet.
L'archive transporte des DONNÉES, jamais une autorité. Aucune commande de merge,
aucun accord JSON, aucun accès Work, GitHub ou Supabase. La revue indépendante et
l'accord réel restent ouverts. Un hôte authentifié doit ensuite fournir lui-même
mandat, preuves et Approval à Broker, après inspection du paquet. La CLI ne sait
pas authentifier Paul : elle ne peut donc pas lever ce gate.
"""
import argparse
from dataclasses import asdict
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import time

from .runtime.broker import Broker, mandate_record
from .runtime.fixture_git import FixtureGit, SHA
from .runtime.dispatch import DispatchBroker
from .runtime.fixture_transport import FixtureInspector
from .runtime.policy import Context, Mandate, Refusal
from finubar.leo_control import ControlLatch

BAD = 'def result():\n    return 1\n'
GOOD = 'def result():\n    return 2\n'
CONFIG = '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = true\n'
ORACLE = '\nassert result() == 2, "R21: expected two fixture items"\n'
MISSION = 'r21-two-items'
ACTOR = 'leo-fixture'
OWNER = 'paul-fixture'  # Identifiant fictif ; aucune authentification de Paul.


def _isolated():
    # Le flag seul n'est pas une preuve. Le workflow de confiance impose et
    # éprouve également montages, limites et héritage des processus enfants.
    if os.environ.get('LV1_ISOLATED') != '1' or os.getuid() != 65534:
        raise Refusal('isolated_ci_required')
    status = Path('/proc/self/status').read_text()
    if not re.search(r'^CapEff:\s+0+$', status, re.M) or not re.search(
            r'^NoNewPrivs:\s+1$', status, re.M):
        raise Refusal('isolation_capabilities_missing')
    if {p.name for p in Path('/sys/class/net').iterdir()} != {'lo'}:
        raise Refusal('network_namespace_required')
    root_mount = [line.split() for line in Path('/proc/self/mountinfo').read_text().splitlines()
                  if line.split()[4] == '/']
    if len(root_mount) != 1 or 'ro' not in root_mount[0][5].split(','):
        raise Refusal('readonly_root_required')


def _json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n')


def _hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _commit(adapter, content, message, parents=()):
    blob = adapter.git('hash-object', '-w', '--stdin', stdin=content).strip()
    tree = adapter.git('mktree', stdin=f'100644 blob {blob}\tfixture.py\n').strip()
    arguments = ['commit-tree', tree, '-m', message]
    for parent in parents:
        arguments += ['-p', parent]
    command, env = adapter._command(*arguments)
    env.update(GIT_AUTHOR_NAME='R21 Fixture', GIT_AUTHOR_EMAIL='fixture@example.invalid',
               GIT_COMMITTER_NAME='R21 Fixture', GIT_COMMITTER_EMAIL='fixture@example.invalid',
               GIT_AUTHOR_DATE='2000-01-01T00:00:00+0000',
               GIT_COMMITTER_DATE='2000-01-01T00:00:00+0000')
    return subprocess.run(command, env=env, text=True, capture_output=True,
                          check=True, timeout=10).stdout.strip()


def prepare(output, provenance):
    """Créer seulement dans un répertoire inexistant, sans écraser une reprise."""
    _isolated()
    if set(provenance) != {'source', 'target', 'integration'} or any(
            type(v) is not str or not SHA.fullmatch(v) for v in provenance.values()):
        raise Refusal('invalid_ultima_provenance')
    root = Path(output).absolute()
    # Le parent de sortie est une capacité de l'hôte CI, pas un argument modèle.
    root.mkdir(mode=0o700, parents=False, exist_ok=False)
    root = root.resolve(strict=True)
    repo = root / 'fixture.git'
    env = {'PATH': '/usr/bin:/bin', 'GIT_CONFIG_GLOBAL': '/dev/null',
           'GIT_CONFIG_NOSYSTEM': '1', 'GIT_TERMINAL_PROMPT': '0'}
    subprocess.run(['git', '-c', 'core.hooksPath=/dev/null', 'init', '--bare',
                    '--template=', str(repo)], env=env, check=True, capture_output=True, timeout=10)
    (repo / 'config').write_text(CONFIG)
    (repo / 'LV1_FIXTURE').write_text('isolated-fiction-only\n')
    adapter = FixtureGit(root, repo)
    target = _commit(adapter, BAD, 'Known defect: one item instead of two')
    source = _commit(adapter, GOOD, 'Return the two expected fixture items', [target])
    integration = _commit(adapter, GOOD, 'Integration for review', [target, source])
    adapter.git('update-ref', 'refs/heads/main', target)
    adapter.git('update-ref', 'refs/heads/patch', source)
    adapter.git('update-ref', 'refs/heads/integration', integration)
    context = Context(str(repo), source, target, integration, 'fixture', 'fixture-account')
    measured = datetime.now(timezone.utc).isoformat()
    checks = []
    for label, commit, expected in [('defect', target, 1), ('patch', source, 0),
                                     ('integration', integration, 0)]:
        content = adapter.git('show', commit + ':fixture.py')
        if content != (BAD if label == 'defect' else GOOD):
            raise Refusal('unexpected_fixture_content')
        result = subprocess.run([sys.executable, '-I', '-c', content + ORACLE],
                                env={'PATH': '/usr/bin:/bin'}, capture_output=True,
                                text=True, timeout=5)
        # Le témoin rouge attendu est précisément AssertionError, pas une panne.
        valid = result.returncode == expected and (label != 'defect' or
                 'AssertionError: R21: expected two fixture items' in result.stderr)
        checks.append(dict(name=label, commit=commit, returncode=result.returncode,
                           expected_returncode=expected, passed=valid,
                           stdout=result.stdout, stderr=result.stderr))
        if not valid:
            raise Refusal('trial_oracle_failed')
    (root / 'oracle.py').write_text(ORACLE.lstrip())
    (root / 'change.patch').write_text(adapter.git('diff', '--no-ext-diff', '--no-textconv', target, source, '--', 'fixture.py'))
    proof = {'measured_at': measured, 'command': 'python -I -c <fixture.py + fixed oracle>',
             'checks': checks, 'review': 'pending', 'approval': 'pending'}
    _json(root / 'proofs.json', proof)
    expires = time.time() + 86400
    mandate = Mandate(MISSION, OWNER, 1, frozenset({ACTOR, 'inspector'}), frozenset({str(repo)}),
                      frozenset({'status', 'merge_fixture', 'read_source'}),
                      quadrants=frozenset({'code'}), expires_at=expires)
    # Verrou d'épreuve hors du paquet : une archive transporte des données,
    # jamais un contrôle. Il disparaît avec la préparation.
    latch_dir = tempfile.TemporaryDirectory(prefix='.r21-control-')
    latch = ControlLatch(Path(latch_dir.name) / 'control.sqlite', initialize=True)
    broker = Broker(root / 'canonical.sqlite', mandate, str(repo), fixture_adapter=adapter,
                    context=context, control_latch=latch)
    broker.store.create_mission(MISSION, OWNER, 'fiction', mandate_record(mandate),
                               {'repository': str(repo), 'commit': integration}, [], [ACTOR], authority=True)
    broker.budget.create(MISSION, dict(max_units=4, max_calls=3, max_attempts=3,
                                      max_delegates=2, expires_at=expires), authority=True)
    receipts = root / 'inspection-receipts'
    receipts.mkdir(mode=0o700)
    # Raccord réel du contrôle avant le transport déterministe. Les deux données
    # sont des résultats d'oracle synthétiques, pas une revue indépendante.
    dispatch = DispatchBroker(root / 'canonical.sqlite', mandate,
        {'repository': str(repo), 'commit': integration},
        tasks={label: {'action': 'read_source', 'recipient': 'inspector',
                       'record_ids': [label], 'units': 1} for label in ('defect', 'patch')},
        records={'defect': {'quadrant': 'code', 'text': 'KNOWN_DEFECT oracle returncode=1 at ' + target},
                 'patch': {'quadrant': 'code', 'text': 'oracle returncode=0 at ' + source}},
        grants={'inspector': ['code']}, transport=FixtureInspector(receipts), control_latch=latch)
    inspections = []
    for label, expected in (('defect', 'failed'), ('patch', 'passed')):
        receipt = dispatch.dispatch(ACTOR, {'action': 'delegate_fixture', 'task': label,
                                   'operation_id': 'r21-inspect-' + label, 'expected_version': 1})
        if receipt['status'] != 'completed' or receipt['result']['outcome'] != expected:
            raise Refusal('controlled_inspection_failed')
        inspections.append(receipt)
    _json(root / 'controlled-inspection.json', {
        'interpretation': 'Deterministic fixture transport only; independent review remains pending.',
        'receipts': inspections, 'budget': broker.budget.status(MISSION)})
    broker.store.update_mission(MISSION, ACTOR, 1, {'state': 'ready_for_review',
                                'next_action': 'Independent review, then exact authenticated approval; no merge yet.'})
    # Ici la politique doit effectivement refuser, sans réservation ni mutation.
    try:
        broker.execute(ACTOR, {'action': 'merge_fixture', 'operation_id': 'r21-merge-1',
                               'expected_version': 2})
    except Refusal as error:
        if error.code != 'approval_missing_or_stale':
            raise
    else:
        raise Refusal('approval_gate_did_not_refuse')
    manifest = {'mission': MISSION, 'state': 'awaiting_independent_review_and_real_approval',
                'context': asdict(context), 'ultima_provenance': provenance,
                'prepared_at': measured, 'mandate_expires_at': expires,
                'expected_mission_version': 2, 'operation_id': 'r21-merge-1',
                'effects': ['update_fixture_ref'], 'publication': False,
                'approval_present': False, 'independent_review_present': False,
                'proof_files': {name: _hash(root / name) for name in
                                ('oracle.py', 'change.patch', 'proofs.json', 'controlled-inspection.json')},
                'limits': ['Fixture only; not full V1 acceptance.',
                           'No authority can be imported from this package.',
                           'Relocation changes repository context; host must revalidate before any approval.',
                           'Checksums detect accidental changes, not authentic origin. Verify CI artifact provenance.']}
    _json(root / 'manifest.json', manifest)
    latch_dir.cleanup()
    # Le paquet est exporté entier, y compris la DB durable, sans credentials.
    archive = root.parent / (root.name + '.tar.gz')
    with archive.open('xb') as stream:
        with tarfile.open(fileobj=stream, mode='w:gz') as bundle:
            bundle.add(root, arcname=root.name, recursive=True)
    archive.chmod(0o644)
    return inspect(root)


def inspect(root):
    """Relecture du paquet sans exécuter ses fichiers ou modifier son registre.

    La cohérence observée ne prouve ni authenticité, ni approbation. Même un
    manifeste forgé cohérent reste incapable de déclencher un effet par cette CLI.
    """
    _isolated()
    root = Path(root).resolve(strict=True)
    for name in ('manifest.json', 'proofs.json', 'oracle.py', 'change.patch', 'controlled-inspection.json', 'canonical.sqlite'):
        path = root / name
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 1024 * 1024:
            raise Refusal('invalid_trial_file')
    manifest = json.loads((root / 'manifest.json').read_text())
    if set(manifest['proof_files']) != {'oracle.py', 'change.patch', 'proofs.json', 'controlled-inspection.json'} or any(
            _hash(root / name) != digest for name, digest in manifest['proof_files'].items()):
        raise Refusal('trial_proof_changed')
    repo = root / 'fixture.git'
    if repo.is_symlink() or any(path.is_symlink() for path in repo.rglob('*')):
        raise Refusal('trial_symlink_denied')
    if (repo / 'config').read_text() != CONFIG:
        raise Refusal('trial_git_config_changed')
    adapter = FixtureGit(root, repo)
    c = Context(**manifest['context'])
    if any(not SHA.fullmatch(value) for value in (c.source, c.target, c.integration)):
        raise Refusal('invalid_trial_commit')
    if adapter.git('show', '-s', '--format=%P', c.integration).strip().split() != [c.target, c.source]:
        raise Refusal('trial_parents_changed')
    for commit, expected in ((c.target, BAD), (c.source, GOOD), (c.integration, GOOD)):
        if adapter.git('show', commit + ':fixture.py') != expected:
            raise Refusal('trial_content_changed')
    if (root / 'oracle.py').read_text() != ORACLE.lstrip() or (
            root / 'change.patch').read_text() != adapter.git('diff', '--no-ext-diff', '--no-textconv', c.target, c.source, '--', 'fixture.py'):
        raise Refusal('trial_oracle_or_patch_changed')
    proof = json.loads((root / 'proofs.json').read_text())
    if [(p['name'], p['commit'], p['returncode'], p['passed']) for p in proof['checks']] != [
            ('defect', c.target, 1, True), ('patch', c.source, 0, True),
            ('integration', c.integration, 0, True)]:
        raise Refusal('trial_proof_inconsistent')
    # mode=ro empêche qu'une « reprise » crée le fichier ou initialise des tables.
    with sqlite3.connect((root / 'canonical.sqlite').as_uri() + '?mode=ro', uri=True) as db:
        db.execute('PRAGMA query_only=ON')
        mission = db.execute('SELECT state,version,next_action FROM missions WHERE id=?', (MISSION,)).fetchone()
        operations = db.execute('SELECT operation_id,status,result FROM operations WHERE mission_id=?',
                                (MISSION,)).fetchall()
    if mission is None:
        raise Refusal('trial_mission_missing')
    return {'mission': MISSION, 'fixture_context': manifest['context'],
            'ultima_provenance': manifest['ultima_provenance'],
            'state': mission[0], 'version': mission[1], 'next_action': mission[2],
            'target_observed': adapter.git('rev-parse', 'refs/heads/main').strip(),
            'source_observed': adapter.git('rev-parse', 'refs/heads/patch').strip(),
            'operations': [{'id': row[0], 'status': row[1], 'result': json.loads(row[2]) if row[2] else None}
                           for row in operations],
            'relocated': c.repository != str(root / 'fixture.git'),
            'merge_available': False, 'global_v1_accepted': False,
            'interpretation': 'Package consistency only. Review and approval must come from the authenticated host.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    p = commands.add_parser('prepare')
    p.add_argument('--output', required=True)
    for name in ('source', 'target', 'integration'):
        p.add_argument('--' + name + '-sha', required=True)
    p = commands.add_parser('inspect')
    p.add_argument('directory')
    args = parser.parse_args()
    if args.command == 'prepare':
        result = prepare(args.output, {name: getattr(args, name + '_sha')
                                       for name in ('source', 'target', 'integration')})
    else:
        result = inspect(args.directory)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))


if __name__ == '__main__':
    main()
