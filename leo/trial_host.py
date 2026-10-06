"""Hôte HTTP privé R21, uniquement dans le bac à sable réseau fermé.

L'intégrateur fournit Binding depuis ses autorités de confiance, jamais depuis
le paquet ou une requête. Ce service ne connecte aucun outil Work ou production.
Les commandes réseau ne portent que leur nom ; l'identité vient de GoTrue.
"""
from dataclasses import asdict, dataclass
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from pathlib import Path
import re
import sqlite3
import time
from types import MappingProxyType
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, build_opener, ProxyHandler, HTTPRedirectHandler

from . import trial, trial_resume
from .runtime.budget import BudgetError, BudgetLedger
from .runtime.policy import Approval, Context, Evidence, Mandate, Policy, Refusal
from finubar.leo_control import LeoControl, control_violation

MAX_BODY = 256
MAX_AUTH = 65536
COMMANDS = frozenset({'status', 'execute', 'reconcile', 'stop'})


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def loopback_url(value):
    url = urlsplit(value)
    if (url.scheme != 'http' or url.hostname != '127.0.0.1' or not url.port
            or url.username or url.password or url.query or url.fragment
            or url.path not in ('', '/')):
        raise ValueError('isolated_loopback_url_required')
    return value.rstrip('/')


class GoTrueIdentity:
    """Pas de décodage JWT local faisant autorité, ni cache de session."""
    def __init__(self, base_url, anon_key, *, gateway=True):
        self.url = loopback_url(base_url) + ('/auth/v1/user' if gateway else '/user')
        self.anon_key = anon_key
        self.opener = build_opener(ProxyHandler({}), NoRedirect())

    def authenticate(self, authorization):
        if (type(authorization) is not str or len(authorization) > 8192
                or not re.fullmatch(r'Bearer [A-Za-z0-9._~-]+', authorization)):
            raise Refusal('authentication_required')
        request = Request(self.url, headers={'Authorization': authorization,
                          'apikey': self.anon_key, 'Accept': 'application/json'})
        try:
            with self.opener.open(request, timeout=3) as response:
                body = response.read(MAX_AUTH + 1)
                if response.status != 200 or len(body) > MAX_AUTH:
                    raise ValueError('invalid_auth_response')
                user = json.loads(body)
            if (not isinstance(user, dict) or user.get('role') != 'authenticated'
                    or user.get('is_anonymous') is not False
                    or not isinstance(user.get('id'), str)
                    or not re.fullmatch(r'[0-9a-fA-F-]{36}', user['id'])):
                raise ValueError('invalid_auth_user')
        except (HTTPError, URLError, TimeoutError, OSError, ValueError):
            raise Refusal('authentication_required') from None
        return user['id']


@dataclass(frozen=True)
class Binding:
    root: Path
    principal: str
    mandate: Mandate
    context: Context
    evidence: tuple[Evidence, ...]
    approval: Approval | None = None


class TrialHost:
    def __init__(self, identity, bindings, *, clock=time.time,
                 protected_control_paths=(), control_latch=None):
        trial._isolated()
        if type(identity) is not GoTrueIdentity:
            raise TypeError('gotrue_identity_required')
        if any(type(b) is not Binding for b in bindings.values()):
            raise TypeError('typed_host_binding_required')
        self.identity = identity
        self.bindings = MappingProxyType(dict(bindings))
        self.clock = clock
        self.protected_control_paths = tuple(protected_control_paths)
        self.control_latch = control_latch

    def call(self, authorization, proposal):
        subject = self.identity.authenticate(authorization)
        return self._call_authenticated(subject, proposal)

    def _call_authenticated(self, subject, proposal, *, expected_version=None):
        binding = self.bindings.get(subject)
        if binding is None:
            raise Refusal('access_denied')
        if (type(proposal) is not dict or set(proposal) != {'command'}
                or type(proposal['command']) is not str or proposal['command'] not in COMMANDS):
            raise Refusal('invalid_command')
        b = binding
        if proposal['command'] == 'stop' and b.principal == b.mandate.owner:
            # Paul (propriétaire canonique) arrête sans dépendre de Léo ni d'une
            # inscription parmi les acteurs : arrêt de mission ET arrêt global.
            canonical = trial_resume._canonical(b.root, b.mandate, b.context, initial=False)
            if canonical['owner'] != b.principal or self.control_latch is None:
                raise Refusal('access_denied')
            self.control_latch.trip('owner_stop')
            ledger = BudgetLedger(Path(b.root) / 'canonical.sqlite', clock=self.clock)
            state = ledger.stop(b.mandate.mission, 'owner_stop', authority=True)
            return {'mission_id': b.mandate.mission, 'stopped': True,
                    'pending_operations': sorted(state['pending_operations']),
                    'reserved_units': state['reserved_units'], 'environment': 'fixture',
                    'publication': False, 'global_v1_accepted': False}
        Policy().authorize(b.mandate, b.principal, 'status', b.context.repository,
                           self.clock(), effects=frozenset({'read_scoped_memory'}))
        if expected_version is not None:
            canonical = trial_resume._canonical(b.root, b.mandate, b.context, initial=False)
            if b.principal not in {canonical['owner'], *json.loads(canonical['readers']),
                                   *json.loads(canonical['writers'])}:
                raise Refusal('access_denied')
            if canonical['version'] != expected_version:
                raise Refusal('mission_version_conflict')
        if proposal['command'] == 'stop':
            # L'arrêt est une réduction de droits, encore possible après expiration.
            # Aucun constructeur writable avant cohérence et habilitation d'écriture.
            def authorized():
                canonical = trial_resume._canonical(b.root, b.mandate, b.context, initial=False)
                if b.principal not in {canonical['owner'], *json.loads(canonical['writers'])}:
                    raise Refusal('access_denied')
            authorized()
            if trial.inspect(b.root)['fixture_context'] != asdict(b.context):
                raise Refusal('trial_context_mismatch')
            ledger = BudgetLedger(Path(b.root) / 'canonical.sqlite', clock=self.clock)
            with ledger._transaction() as db:
                # Le même verrou que l'admission empêche stop/exécution de se doubler.
                # La lecture séparée voit l'état engagé avant ce verrou d'écriture.
                authorized()
                if expected_version is not None:
                    version = db.execute('SELECT version FROM missions WHERE id=?',
                                         (b.mandate.mission,)).fetchone()[0]
                    if version != expected_version:
                        raise Refusal('mission_version_conflict')
                Policy().authorize(b.mandate, b.principal, 'status', b.context.repository,
                                   self.clock(), effects=frozenset({'read_scoped_memory'}))
                db.execute('UPDATE budget_missions SET stopped=1, reason=COALESCE(reason,?) '
                           'WHERE mission=?', ('authenticated_stop', b.mandate.mission))
                state = ledger._status(db, b.mandate.mission)
            return {'mission_id': b.mandate.mission, 'stopped': True,
                    'pending_operations': sorted(state['pending_operations']),
                    'reserved_units': state['reserved_units'], 'environment': 'fixture',
                    'publication': False, 'global_v1_accepted': False}
        if proposal['command'] == 'status':
            # Même contrôle de cohérence canonique que la reprise, en lecture seule.
            canonical = trial_resume._canonical(b.root, b.mandate, b.context, initial=False)
            if expected_version is not None and canonical['version'] != expected_version:
                raise Refusal('mission_version_conflict')
            if b.principal not in {canonical['owner'], *json.loads(canonical['readers']),
                                    *json.loads(canonical['writers'])}:
                raise Refusal('access_denied')
            observed = trial.inspect(b.root)
            if observed['fixture_context'] != asdict(b.context):
                raise Refusal('trial_context_mismatch')
            with sqlite3.connect((Path(b.root) / 'canonical.sqlite').as_uri() + '?mode=ro', uri=True) as db:
                db.execute('PRAGMA query_only=ON')
                used, count = db.execute('SELECT COALESCE(SUM(used_units),0),COUNT(*) FROM budget_operations').fetchone()
                stopped = db.execute('SELECT stopped FROM budget_missions').fetchone()[0]
            return {key: observed[key] for key in ('state', 'version', 'operations', 'global_v1_accepted')} | {
                'budget': {'used_units': used, 'calls': count, 'stopped': bool(stopped)},
                'environment': 'fixture', 'publication': False}
        if proposal['command'] == 'execute':
            canonical = trial_resume._canonical(b.root, b.mandate, b.context, initial=False)
            if b.principal not in {canonical['owner'], *json.loads(canonical['writers'])}:
                raise Refusal('access_denied')
            if expected_version is not None and expected_version != trial_resume.PROPOSAL['expected_version']:
                raise Refusal('mission_version_conflict')
            if control_violation('merge_fixture', b.context.repository,
                                 protected_paths=self.protected_control_paths):
                LeoControl(BudgetLedger(Path(b.root) / 'canonical.sqlite', clock=self.clock),
                           b.mandate.mission, protected_paths=self.protected_control_paths,
                           latch=self.control_latch).before_effect(
                               'merge_fixture', b.context.repository)
        return trial_resume.execute(b.root, mandate=b.mandate, context=b.context,
            evidence=b.evidence, approval=b.approval, principal=b.principal,
            reconcile=proposal['command'] == 'reconcile', clock=self.clock,
            protected_control_paths=self.protected_control_paths, control_latch=self.control_latch)


def server(host, port=0):
    """Un seul traitement simultané ; file bornée, lecture et Auth avec délai.

L'hôte CI borne aussi mémoire, CPU, processus et durée du conteneur. Ni CORS,
ni cookies, ni autorité importée. bind reste exclusivement sur loopback.
"""
    trial._isolated()
    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            super().setup()
            self.connection.settimeout(5)

        def log_message(self, *args):
            pass  # Aucun jeton, sujet, corps ou chemin dans les logs HTTP.

        def reply(self, status, value):
            data = json.dumps(value, sort_keys=True).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'private, no-store')
            self.send_header('Connection', 'close')
            self.end_headers()
            self.wfile.write(data)

        def do_POST(self):
            if (self.path != '/r21' or self.headers.get('Content-Type') != 'application/json'
                    or self.headers.get('Transfer-Encoding') or self.headers.get('Origin')
                    or len(self.headers.get_all('Authorization', [])) != 1
                    or len(self.headers.get_all('Content-Length', [])) != 1):
                return self.reply(400, {'error': 'invalid_request'})
            try:
                size = int(self.headers['Content-Length'])
                limit = 16 * 1024 if getattr(host, 'wire_body_bytes', False) else MAX_BODY
                if not 0 < size <= limit:
                    raise ValueError('body_size')
                raw = self.rfile.read(size)
                if len(raw) != size:
                    raise ValueError('short_body')
                # Les champs dupliqués sont invalides, pas "dernier gagnant".
                def unique(pairs):
                    result = {}
                    for key, value in pairs:
                        if key in result:
                            raise ValueError('duplicate_key')
                        result[key] = value
                    return result
                proposal = raw if getattr(host, 'wire_body_bytes', False) else json.loads(raw, object_pairs_hook=unique)
            except (ValueError, TimeoutError, OSError):
                return self.reply(400, {'error': 'invalid_request'})
            try:
                value = host.call(self.headers['Authorization'], proposal)
                return self.reply(200, value)
            except Refusal as error:
                status = 401 if error.code == 'authentication_required' else 403 if error.code == 'access_denied' else 400 if error.code == 'invalid_command' else 409
                return self.reply(status, {'error': error.code})
            except BudgetError as error:
                if error.code in ('mission_stopped', 'mission_expired'):
                    return self.reply(409, {'error': error.code})
                return self.reply(503, {'error': 'result_unknown_reconcile_required'})
            except Exception:
                # Échec possiblement après effet : le client doit réconcilier,
                # jamais rejouer automatiquement une exécution.
                return self.reply(503, {'error': 'result_unknown_reconcile_required'})

    class PrivateServer(HTTPServer):
        request_queue_size = 4
    return PrivateServer(('127.0.0.1', port), Handler)
