"""Recette HTTP/Auth réelle, comptes et accords uniquement fictifs.

À lancer dans le conteneur LV1 isolé partageant le loopback de GoTrue.
--mutant enlève intentionnellement le contrôle d'identité dans CE processus.
"""
from dataclasses import replace
from http.server import BaseHTTPRequestHandler, HTTPServer
import hashlib
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import threading
from urllib.request import Request, build_opener, ProxyHandler

from leo import trial
from leo.trial_host import Binding, GoTrueIdentity, TrialHost, server
from leo.trial_client import call
from leo.runtime.policy import Approval, Context, Evidence, Mandate


def session(email):
    req = Request('http://127.0.0.1:9999/token?grant_type=password',
        data=json.dumps({'email': email, 'password': 'Fixture-password-only-0930!'}).encode(),
        headers={'Content-Type': 'application/json'}, method='POST')
    with build_opener(ProxyHandler({})).open(req, timeout=3) as response:
        return json.load(response)


def anonymous_session():
    req = Request('http://127.0.0.1:9999/signup', data=b'{}',
                  headers={'Content-Type': 'application/json'}, method='POST')
    with build_opener(ProxyHandler({})).open(req, timeout=3) as response:
        return json.load(response)


def main():
    trial._isolated()
    try:
        with socket.create_connection(('198.51.100.1', 443), timeout=1):
            raise AssertionError('external_network_not_isolated')
    except OSError:
        pass
    try:
        Path('/leo-host-write-probe').write_text('isolation probe')
    except OSError:
        pass
    else:
        raise AssertionError('root_not_readonly')
    owner, stranger = session('owner@fixture.invalid'), session('stranger@fixture.invalid')
    anonymous = anonymous_session()
    token, subject = owner['access_token'], owner['user']['id']
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary) / 'trial'
        prepared = trial.prepare(root, {key: os.environ['LV1_' + key.upper() + '_SHA']
                                       for key in ('source', 'target', 'integration')})
        context = Context(**prepared['fixture_context'])
        expires = json.loads((root / 'manifest.json').read_text())['mandate_expires_at']
        mandate = Mandate(trial.MISSION, trial.OWNER, 1, frozenset({trial.ACTOR, 'inspector'}),
            frozenset({context.repository}), frozenset({'status', 'merge_fixture', 'read_source'}),
            quadrants=frozenset({'code'}), expires_at=expires)
        evidence = tuple(Evidence(context, kind, True, 'fixture://simulated/' + kind,
                        '2000-01-01', 'explicitly-simulated-host-authority') for kind in ('tests', 'review'))
        binding = Binding(root, trial.ACTOR, mandate, context, evidence)
        identity = GoTrueIdentity('http://127.0.0.1:9999', 'unused-direct-auth-key', gateway=False)
        if '--mutant' in sys.argv:
            identity.authenticate = lambda authorization: subject
        host = TrialHost(identity, {subject: binding})
        if '--mutant-stop' in sys.argv:
            original_call = host.call
            def false_stop(authorization, proposal):
                if proposal == {'command': 'stop'}:
                    # Identité et ACL restent contrôlées ; seule la persistance
                    # de l'arrêt est volontairement neutralisée dans ce mutant.
                    original_call(authorization, {'command': 'status'})
                    if host.bindings[subject].principal != trial.ACTOR:
                        from leo.runtime.policy import Refusal
                        raise Refusal('access_denied')
                    return {'mission_id': trial.MISSION, 'stopped': True,
                        'reserved_units': 0, 'pending_operations': [],
                        'environment': 'fixture', 'publication': False,
                        'global_v1_accepted': False}
                return original_call(authorization, proposal)
            host.call = false_stop
        http = server(host)
        worker = threading.Thread(target=http.serve_forever, daemon=True)
        worker.start()
        url = 'http://127.0.0.1:' + str(http.server_port)
        try:
            before = hashlib.sha256((root / 'canonical.sqlite').read_bytes()).hexdigest()
            assert call(url, 'status', token)[0] == 200
            assert call(url, 'status', 'invalid-token')[0] == 401, 'HOST_AUTH_REQUIRED'
            assert call(url, 'status', stranger['access_token'])[0] == 403
            assert call(url, 'status', anonymous['access_token'])[0] == 401
            unavailable = GoTrueIdentity('http://127.0.0.1:1', 'fixture', gateway=False)
            host.identity = unavailable
            assert call(url, 'execute', token)[0] == 401
            host.identity = identity
            assert call(url, 'execute', token) == (409, {'error': 'approval_missing_or_stale'})
            assert hashlib.sha256((root / 'canonical.sqlite').read_bytes()).hexdigest() == before
            print('PASS identité réelle et refus sans autorité : aucune mutation SQLite', flush=True)

            # Arrêt par le même canal authentifié, sur une fixture distincte.
            # Même un accord fictif valide ne doit permettre un départ ensuite.
            stop_root = Path(temporary) / 'stop-trial'
            stop_prepared = trial.prepare(stop_root, {key: os.environ['LV1_' + key.upper() + '_SHA']
                                         for key in ('source', 'target', 'integration')})
            stop_context = Context(**stop_prepared['fixture_context'])
            stop_expiry = json.loads((stop_root / 'manifest.json').read_text())['mandate_expires_at']
            stop_mandate = replace(mandate, repositories=frozenset({stop_context.repository}), expires_at=stop_expiry)
            stop_binding = Binding(stop_root, trial.ACTOR, stop_mandate, stop_context,
                tuple(replace(item, context=stop_context) for item in evidence),
                Approval(stop_context, trial.OWNER, 1, stop_expiry))
            host.bindings = {subject: stop_binding}
            stop_before = hashlib.sha256((stop_root / 'canonical.sqlite').read_bytes()).hexdigest()
            assert call(url, 'stop', 'invalid-token')[0] == 401
            assert call(url, 'stop', stranger['access_token'])[0] == 403
            host.bindings = {subject: replace(stop_binding, principal='inspector')}
            assert call(url, 'stop', token)[0] == 403
            assert hashlib.sha256((stop_root / 'canonical.sqlite').read_bytes()).hexdigest() == stop_before
            host.bindings = {subject: stop_binding}
            code, stopped = call(url, 'stop', token)
            assert code == 200 and stopped['stopped'] is True
            assert call(url, 'stop', token) == (200, stopped)
            assert call(url, 'status', token)[1]['budget']['stopped'] is True, 'HOST_STOP_REQUIRED'
            assert call(url, 'execute', token) == (409, {'error': 'mission_stopped'})
            # Constructeur writable peut toucher l'en-tête ; mesurer les effets réels.
            observed = trial.inspect(stop_root)
            assert observed['state'] == 'ready_for_review' and observed['version'] == 2
            assert len(observed['operations']) == 2
            assert call(url, 'status', token)[1]['budget'] == {'calls': 2, 'used_units': 2, 'stopped': True}
            assert subprocess.check_output(['git', '--git-dir', str(stop_root / 'fixture.git'),
                'rev-parse', 'refs/heads/main'], text=True).strip() == stop_context.target
            print('PASS arrêt HTTP authentifié : refus sans mutation, idempotence et zéro départ avec accord valide', flush=True)
            host.bindings = {subject: binding}

            # L'accord de cette recette est explicitement FICTIF, créé par son hôte.
            approval = Approval(context, trial.OWNER, 1, expires)
            approved = replace(binding, approval=approval)
            host.bindings = {subject: replace(approved, evidence=evidence[:1])}
            assert call(url, 'execute', token) == (409, {'error': 'proof_missing_or_inapplicable'})
            host.bindings = {subject: replace(approved, approval=replace(approval, context=replace(context, source='d' * 40)))}
            assert call(url, 'execute', token) == (409, {'error': 'approval_missing_or_stale'})
            assert hashlib.sha256((root / 'canonical.sqlite').read_bytes()).hexdigest() == before
            host.bindings = {subject: approved}
            # Proxy de panne local : l'effet a lieu via le vrai hôte/auth, mais
            # sa réponse est corrompue avant d'atteindre le client réutilisable.
            class LostResponse(BaseHTTPRequestHandler):
                def log_message(self, *args):
                    pass
                def do_POST(self):
                    self.rfile.read(int(self.headers['Content-Length']))
                    status, receipt = call(url, 'execute', self.headers['Authorization'].removeprefix('Bearer '))
                    assert status == 200 and receipt['status'] == 'completed'
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'broken-json-response')
            proxy = HTTPServer(('127.0.0.1', 0), LostResponse)
            proxy_thread = threading.Thread(target=proxy.handle_request, daemon=True)
            proxy_thread.start()
            try:
                assert call('http://127.0.0.1:' + str(proxy.server_port), 'execute', token) == (
                    503, {'error': 'result_unknown_reconcile_required'})
            finally:
                proxy_thread.join(timeout=65)
                proxy.server_close()
            status, observed = call(url, 'status', token)
            assert status == 200 and observed['state'] == 'merged' and observed['version'] == 3
            assert observed['budget'] == {'calls': 3, 'used_units': 4, 'stopped': False}
            assert call(url, 'stop', token)[0] == 200
            print('PASS accord exact, effet fixture confirmé, réponse perdue explicitement inconnue, budget partagé', flush=True)
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)

        # Nouvel hôte sans accord : seule réconciliation, après arrêt canonique.
        http = server(TrialHost(identity, {subject: binding}))
        worker = threading.Thread(target=http.serve_forever, daemon=True)
        worker.start()
        url = 'http://127.0.0.1:' + str(http.server_port)
        try:
            child = subprocess.run([sys.executable, '-m', 'leo.trial_client', 'reconcile', '--host', url],
                input=token + '\n', text=True, capture_output=True, timeout=60)
            receipt = json.loads(child.stdout)
            assert child.returncode == 0 and receipt['status'] == 'completed'
            assert receipt['result']['commit'] == context.integration
            assert call(url, 'reconcile', token) == (200, receipt)
            assert token not in child.stdout + child.stderr
            status, observed = call(url, 'status', token)
            assert status == 200 and observed['budget'] == {'calls': 3, 'used_units': 4, 'stopped': True}
            assert observed['global_v1_accepted'] is False
            child_stop = subprocess.run([sys.executable, '-m', 'leo.trial_client', 'stop', '--host', url],
                input=token + '\n', text=True, capture_output=True, timeout=60)
            assert child_stop.returncode == 0 and json.loads(child_stop.stdout)['stopped'] is True
            assert token not in child_stop.stdout + child_stop.stderr
            print('PASS nouvel hôte + nouveau processus client : reçu réconcilié après arrêt, sans doublon', flush=True)
            print('R21 HOST AUTH PASS — fixture et accords simulés ; réception globale ouverte', flush=True)
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)


if __name__ == '__main__':
    main()
