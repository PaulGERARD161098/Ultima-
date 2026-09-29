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
from leo.runtime.budget import BudgetLedger
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
            print('PASS accord exact, effet fixture confirmé, réponse perdue explicitement inconnue, budget partagé', flush=True)
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)

        # Nouvel hôte sans accord : seule réconciliation, après arrêt canonique.
        BudgetLedger(root / 'canonical.sqlite').stop(trial.MISSION, 'fixture-host-stop', authority=True)
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
            print('PASS nouvel hôte + nouveau processus client : reçu réconcilié après arrêt, sans doublon', flush=True)
            print('R21 HOST AUTH PASS — fixture et accords simulés ; réception globale ouverte', flush=True)
        finally:
            http.shutdown()
            http.server_close()
            worker.join(timeout=5)


if __name__ == '__main__':
    main()
