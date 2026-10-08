"""Adverse host checks with synthetic GitHub/Docker; no real dispatch or token."""
import os
if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

from copy import deepcopy
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from leo.control_r21 import pilot_host as host, pilot_build as builder
from leo.control_r21.pilot_state import new_state, stop_state, encode_state, PilotError


SOURCE = 'a' * 40
TARGET = 'b' * 40
INTEGRATION = 'c' * 40
IMAGE = 'python@sha256:' + 'd' * 64
OWNER = 277032273


def installation():
    return {'id': 'fixture-install', 'seed': 'f' * 64, 'source_sha': SOURCE,
            'code_digest': 'e' * 64, 'image_digest': IMAGE, 'actor_id': OWNER}


class AuthAPI:
    def __init__(self):
        self.run = {'event': 'workflow_dispatch', 'run_attempt': 1,
                    'actor': {'id': OWNER}, 'triggering_actor': {'id': OWNER},
                    'repository': {'full_name': host.REPOSITORY},
                    'head_branch': 'main', 'head_sha': SOURCE,
                    'path': '.github/workflows/r21-pilot.yml'}
        self.current = SOURCE
        self.calls = []

    def call(self, method, path, data=None):
        self.calls.append((method, path, data))
        if method == 'GET' and path == '/actions/runs/42':
            return deepcopy(self.run)
        if method == 'GET' and path == '/git/ref/heads/main':
            return {'object': {'sha': self.current}}
        raise AssertionError('Unexpected API call in read-only authentication')


class PilotAuthenticationTests(unittest.TestCase):
    def setUp(self):
        self.api = AuthAPI()
        self.env = {'GITHUB_EVENT_NAME': 'workflow_dispatch',
                    'GITHUB_REPOSITORY': host.REPOSITORY, 'GITHUB_REF': 'refs/heads/main',
                    'GITHUB_RUN_ATTEMPT': '1', 'GITHUB_ACTOR_ID': str(OWNER),
                    'GITHUB_RUN_ID': '42', 'GITHUB_SHA': SOURCE}
        self.event = {'sender': {'id': OWNER},
                      'repository': {'full_name': host.REPOSITORY, 'private': True},
                      'ref': 'main', 'inputs': {'command': 'prepare'}}
        self.config = {'installation': installation(),
                       'review': {'code_digest': 'e' * 64,
                                  'location': 'https://github.com/PaulGERARD161098/Ultima-/pull/365',
                                  'reviewer': 'independent-fixture-review',
                                  'measured_at': '2026-10-08T15:00:00Z'}}

    def authenticate(self):
        return host.authenticate(self.env, self.event, self.config, self.api)

    def test_positive_control_then_environment_identity_mutations(self):
        self.assertEqual(self.authenticate(), ('prepare', '42'))
        for key, value in [('GITHUB_EVENT_NAME', 'push'), ('GITHUB_REPOSITORY', 'foreign/repo'),
                           ('GITHUB_REF', 'refs/heads/foreign'), ('GITHUB_RUN_ATTEMPT', '2'),
                           ('GITHUB_ACTOR_ID', '1'), ('GITHUB_RUN_ID', '../42')]:
            with self.subTest(key=key), patch.dict(self.env, {key: value}):
                with self.assertRaises(ValueError):
                    self.authenticate()

    def test_sender_private_repository_and_event_ref_are_independent_checks(self):
        for path, value in [(('sender', 'id'), 1), (('repository', 'private'), False),
                            (('repository', 'full_name'), 'foreign/repo'), (('ref',), 'foreign')]:
            old = deepcopy(self.event)
            with self.subTest(path=path):
                if len(path) == 1:
                    self.event[path[0]] = value
                else:
                    self.event[path[0]][path[1]] = value
                with self.assertRaises(ValueError):
                    self.authenticate()
            self.event = old

    def test_server_run_must_agree_with_envelope_and_current_installed_sha(self):
        cases = [('event', 'push'), ('run_attempt', 2), ('actor', {'id': 1}),
                 ('triggering_actor', {'id': 1}), ('head_branch', 'foreign'),
                 ('head_sha', TARGET), ('repository', {'full_name': 'foreign/repo'}),
                 ('path', '.github/workflows/foreign.yml')]
        for field, value in cases:
            with self.subTest(field=field), patch.dict(self.api.run, {field: value}):
                with self.assertRaises(ValueError):
                    self.authenticate()
        self.api.current = TARGET
        with self.assertRaisesRegex(ValueError, 'installed_code_moved'):
            self.authenticate()

    def test_stop_workflow_cannot_admit_execute_and_pilot_cannot_alias_stop(self):
        self.event['inputs']['command'] = 'stop'
        with self.assertRaises(ValueError):
            self.authenticate()
        self.api.run['path'] = '.github/workflows/r21-stop.yml'
        self.assertEqual(self.authenticate(), ('stop', '42'))
        self.event['inputs']['command'] = 'execute'
        with self.assertRaisesRegex(ValueError, 'stop_workflow_only'):
            self.authenticate()

    def test_missing_or_foreign_review_never_becomes_green(self):
        for field, value in [('location', ''), ('reviewer', ''), ('measured_at', ''),
                             ('code_digest', '0' * 64), ('location', 'https://foreign.invalid/review')]:
            with self.subTest(field=field), patch.dict(self.config['review'], {field: value}):
                with self.assertRaisesRegex(ValueError, 'external_review_required'):
                    self.authenticate()
        self.assertTrue(all(call[0] == 'GET' for call in self.api.calls))


class ChainAPI:
    def __init__(self, install):
        self.install = install
        self.states, self.parents = {}, {}
        self.head = None
        self.calls = []

    def add(self, sha, state, parents):
        self.states[sha] = deepcopy(state)
        self.parents[sha] = parents
        self.head = sha

    def call(self, method, path, data=None):
        self.calls.append((method, path, deepcopy(data)))
        if path == '/git/ref/' + host.STATE_REF:
            return {'ref': 'refs/' + host.STATE_REF,
                    'object': {'type': 'commit', 'sha': self.head}}
        if path.startswith('/git/commits/'):
            sha = path.rsplit('/', 1)[-1]
            return {'tree': {'sha': sha}, 'parents': [{'sha': p} for p in self.parents[sha]]}
        if path.startswith('/git/trees/'):
            sha = path.rsplit('/', 1)[-1]
            return {'truncated': False, 'tree': [{'path': 'state.json', 'mode': '100644',
                                                 'type': 'blob', 'sha': sha}]}
        raise AssertionError('Unexpected synthetic chain request')

    def blob(self, sha):
        return encode_state(self.states[sha], self.install)


class PilotRemoteStateTests(unittest.TestCase):
    def setUp(self):
        self.install = installation()
        self.api = ChainAPI(self.install)
        self.seed = new_state(self.install)
        self.api.add(SOURCE, self.seed, [])
        self.stopped = stop_state(self.seed)
        self.stopped.update(sequence=1, previous_sha=SOURCE, mutation_id='1' * 32)
        self.api.add(TARGET, self.stopped, [SOURCE])
        self.store = host.GitState(self.api, self.install, SOURCE)

    def test_current_ref_is_reread_and_stopped_state_survives_fresh_host(self):
        sha, state = self.store.read()
        self.assertEqual(sha, TARGET)
        self.assertTrue(state['stopped'])
        self.assertTrue(host.GitState(self.api, self.install, SOURCE).read()[1]['stopped'])
        self.assertTrue(all(call[0] == 'GET' for call in self.api.calls))

    def test_ancestor_cache_cannot_admit_old_copy_in_new_commit(self):
        self.store.read()  # Establish a valid cached ancestor first.
        self.api.add(INTEGRATION, self.seed, [TARGET])
        with self.assertRaises((ValueError, PilotError)):
            self.store.read()

    def test_stop_cannot_be_rearmed_even_with_fresh_sequence_and_parent(self):
        forged = deepcopy(self.seed)
        forged.update(sequence=2, previous_sha=TARGET, mutation_id='2' * 32)
        self.api.add(INTEGRATION, forged, [TARGET])
        with self.assertRaises((ValueError, PilotError)):
            self.store.read()

    def test_wrong_parent_and_sequence_are_rejected_with_valid_seed_ancestry(self):
        for field, value in [('previous_sha', INTEGRATION), ('sequence', 8)]:
            with self.subTest(field=field):
                wrong = deepcopy(self.stopped)
                wrong[field] = value
                self.api.states[TARGET] = wrong
                with self.assertRaises((ValueError, PilotError)):
                    host.GitState(self.api, self.install, SOURCE).read()

    def test_git_mutation_is_single_parent_and_never_forced(self):
        calls = []
        api = SimpleNamespace(put_blob=lambda raw: 'd' * 40)
        def call(method, path, data):
            calls.append((method, path, deepcopy(data)))
            if path == '/git/trees':
                return {'sha': 'e' * 40}
            if path == '/git/commits':
                return {'sha': INTEGRATION}
            if path == '/git/refs/' + host.STATE_REF:
                return {'object': {'sha': INTEGRATION}}
            raise AssertionError('Unexpected state mutation')
        api.call = call
        store = host.GitState(api, self.install, SOURCE)
        self.assertEqual(store.cas(SOURCE, self.stopped), INTEGRATION)
        self.assertEqual(calls[1][2]['parents'], [SOURCE])
        self.assertIs(calls[2][2]['force'], False)
        self.assertFalse(any('/git/refs' == path for _, path, _ in calls))


class PilotIsolationAndBuildTests(unittest.TestCase):
    def test_container_has_no_network_socket_or_credentials_and_independent_deadline(self):
        args = host.container_command(Path('/fixture-code'), IMAGE, 'r21-42', 'execute')
        for flag, value in [('--network', 'none'), ('--user', '65534:65534'),
                            ('--cap-drop', 'ALL'), ('--memory', '512m'),
                            ('--cpus', '1'), ('--pids-limit', '128')]:
            self.assertEqual(args[args.index(flag) + 1], value)
        self.assertIn('--read-only', args)
        self.assertIn('no-new-privileges', args)
        self.assertIn('timeout', args)
        self.assertIn('--kill-after=2s', args)
        mounts = [args[i + 1] for i, arg in enumerate(args) if arg == '--mount']
        self.assertEqual(len(mounts), 2)
        self.assertTrue(all(mount.endswith(',readonly') for mount in mounts))
        self.assertNotIn('docker.sock', ' '.join(args))
        self.assertFalse(any('TOKEN' in arg or 'SECRET' in arg for arg in args))
        for bad_image in ['python:latest', 'foreign@sha256:' + 'd' * 64]:
            with self.assertRaises(ValueError):
                host.container_command(Path('/fixture-code'), bad_image, 'r21-42', 'execute')

    def test_host_environment_token_is_not_inherited_by_docker(self):
        observed = []
        class Process:
            returncode = 0
            def poll(self): return 0
            def wait(self, timeout=None): return 0
        def start(args, **kwargs):
            observed.append(kwargs['env'])
            kwargs['stdout'].write(b'{"fixture":true}')
            return Process()
        def run(args, **kwargs):
            observed.append(kwargs['env'])
            return SimpleNamespace(returncode=0)
        coordinator = SimpleNamespace(status=lambda: SimpleNamespace(state={'stopped': False}))
        with patch.dict(os.environ, {'R21_HOST_TOKEN': 'SYNTHETIC-MUST-NOT-CROSS'}), \
                patch.object(host.subprocess, 'Popen', side_effect=start), \
                patch.object(host.subprocess, 'run', side_effect=run):
            self.assertEqual(host.run_worker(Path('/fixture-code'), IMAGE, '42', 'prepare',
                                              {}, coordinator), {'fixture': True})
        self.assertTrue(observed)
        for env in observed:
            self.assertEqual(set(env), {'PATH', 'HOME', 'LANG'})
            self.assertNotIn('SYNTHETIC-MUST-NOT-CROSS', env.values())

    def test_builder_outputs_inert_candidate_with_explicit_provenance(self):
        source = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / 'candidate'
            report = builder.build(source, output, SOURCE, IMAGE, TARGET, INTEGRATION)
            config = json.loads((output / 'main/pilot-installation.json').read_text())
            self.assertFalse(report['installed'])
            self.assertFalse(report['autonomous_agent'])
            self.assertEqual(config['provenance'], {'source': SOURCE, 'target': TARGET,
                                                    'integration': INTEGRATION})
            self.assertEqual([config['review'][k] for k in ('location', 'reviewer', 'measured_at')],
                             ['', '', ''])
            self.assertEqual(len(config['installation']['seed']), 64)
            self.assertIs(type(config['installation']['actor_id']), int)
            self.assertNotIn('token', json.dumps(config).lower())
            self.assertIn('CANDIDATE ONLY', (output / 'INERT.txt').read_text())
            self.assertTrue((output / 'r21-state/state.json').is_file())
            self.assertFalse((output / '.git').exists())
            with self.assertRaises(FileExistsError):
                builder.build(source, output, SOURCE, IMAGE, TARGET, INTEGRATION)


if __name__ == '__main__':
    unittest.main()
