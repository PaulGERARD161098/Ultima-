"""Raccord six champs -> hôte R21 de fixture, sans nouvelle autorité.

Le journal hôte porte seulement l'anti-rejeu du transport. Mission, budget,
opération et arrêt restent dans le registre canonique existant. Aucun réseau
ou accord réel n'est installé par ce module. Le lanceur et le répertoire du
journal doivent être hors des droits du modèle ; aucune archive n'en fait foi.
"""
from contextlib import contextmanager
import json
import os
from pathlib import Path
import sqlite3

from . import protocol
from .. import trial_resume
from ..trial_host import TrialHost
from ..runtime.policy import Refusal
from finubar.leo_control import ControlLatch, assert_host_private


NO_NEW_EFFECT = frozenset({'stop', 'reconcile', 'status'})


class RequestJournal:
    """Réserver durablement avant appel ; inconnu => réconcilier, jamais rejouer."""
    def __init__(self, path, *, initialize=False):
        self.path = Path(path).absolute()
        if self.path.is_symlink() or not self.path.parent.is_dir():
            raise ValueError('trusted_journal_path_required')
        created = False
        if initialize is True:
            try:
                descriptor = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o600)
            except FileExistsError:
                pass
            else:
                os.close(descriptor)
                created = True
        if not self.path.is_file():
            raise Refusal('journal_unavailable')
        self._assert_private()
        with self._transaction() as db:
            tables = db.execute("SELECT type,name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").fetchall()
            application = db.execute('PRAGMA application_id').fetchone()[0]
            version = db.execute('PRAGMA user_version').fetchone()[0]
            if created:
                if tables or application != 0 or version != 0:
                    raise Refusal('journal_unavailable')
                db.execute('PRAGMA application_id=1280461361')  # LRJ1, transport seulement.
                db.execute('PRAGMA user_version=1')
                db.execute('''CREATE TABLE requests (
                    subject TEXT NOT NULL, mission TEXT NOT NULL, request TEXT NOT NULL,
                    digest TEXT NOT NULL, state TEXT NOT NULL, result TEXT,
                    PRIMARY KEY(subject, mission, request))''')
            elif tables != [('table', 'requests')] or application != 0x4C524A31 or version != 1:
                raise Refusal('journal_unavailable')

    def _assert_private(self):
        # Revue Codex du 06/10 : un journal modifiable par un autre UID permet
        # d'effacer une ligne et de faire réadmettre une opération déjà faite.
        assert_host_private(self.path, (self.path.parent,), 'journal_permissions_unsafe')

    @contextmanager
    def _transaction(self):
        if self.path.is_symlink() or not self.path.is_file():
            raise Refusal('journal_unavailable')
        self._assert_private()
        db = sqlite3.connect(self.path.as_uri()+'?mode=rw', uri=True, timeout=5, isolation_level=None)
        try:
            db.execute('PRAGMA trusted_schema=OFF')
            db.execute('PRAGMA synchronous=FULL')
            db.execute('BEGIN IMMEDIATE')
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()

    def reserve(self, subject, proposal):
        key = (subject, proposal['mission_id'], proposal['request_id'])
        digest = protocol.canonical_digest(proposal)
        with self._transaction() as db:
            prior = db.execute('SELECT digest,state,result FROM requests WHERE subject=? AND mission=? AND request=?', key).fetchone()
            if prior is not None:
                if prior[0] != digest:
                    raise Refusal('request_conflict')
                return False, prior[1], json.loads(prior[2]) if prior[2] is not None else None
            if db.execute('SELECT COUNT(*) FROM requests').fetchone()[0] >= 256:
                raise Refusal('request_journal_full')
            db.execute('INSERT INTO requests VALUES (?,?,?,?,?,NULL)', (*key, digest, 'unknown'))
        return True, 'unknown', None

    def complete(self, subject, proposal, result):
        encoded = json.dumps(result, sort_keys=True, separators=(',', ':'), allow_nan=False)
        if len(encoded.encode()) > 65536:
            raise Refusal('result_unknown_reconcile_required')
        with self._transaction() as db:
            changed = db.execute("UPDATE requests SET state='completed',result=? WHERE subject=? AND mission=? AND request=? AND digest=? AND state='unknown'",
                (encoded, subject, proposal['mission_id'], proposal['request_id'], protocol.canonical_digest(proposal))).rowcount
            if changed != 1:
                raise Refusal('request_completion_conflict')


class AdmissionHost:
    """Pas d'accord dans le JSON ; réutilise identité, ACL et refus TrialHost."""
    wire_body_bytes = True

    def __init__(self, host, journal):
        if type(host) is not TrialHost or type(journal) is not RequestJournal:
            raise TypeError('trusted_host_and_journal_required')
        if type(host.control_latch) is not ControlLatch:
            raise TypeError('global_control_latch_required')
        if journal.path == host.control_latch.path:
            raise ValueError('separate_transport_journal_required')
        if any(journal.path == (Path(b.root) / 'canonical.sqlite').absolute()
               for b in host.bindings.values()):
            raise ValueError('separate_transport_journal_required')
        self.host, self.journal = host, journal

    def call(self, authorization, body):
        subject = self.host.identity.authenticate(authorization)
        binding = self.host.bindings.get(subject)
        if binding is None:
            raise Refusal('access_denied')
        try:
            proposal = protocol.decode(body)
        except protocol.ProtocolError:
            raise Refusal('invalid_command') from None
        # ACL vérifiée avant tout journal ou résultat conservé. Le statut lit
        # également mandat et contexte canonique ; pas d'identité dans le corps.
        # Exception (revue Codex du 06/10) : l'arrêt du propriétaire, qui n'est
        # pas un acteur ; sa branche vérifie elle-même le propriétaire canonique.
        if not (proposal['command'] == 'stop' and binding.principal == binding.mandate.owner):
            self.host._call_authenticated(subject, {'command': 'status'})
        if (proposal['mission_id'] != binding.mandate.mission or
                proposal['operation_id'] != trial_resume.PROPOSAL['operation_id']):
            raise Refusal('request_context_mismatch')
        try:
            fresh, state, result = self.journal.reserve(subject, proposal)
        except Refusal as error:
            if error.code != 'request_journal_full' or proposal['command'] not in NO_NEW_EFFECT:
                raise
            # Arrêt, réconciliation et statut ne créent aucun effet : jamais
            # bloqués par la capacité du journal anti-rejeu (revue Codex du
            # 06/10 : sinon un « inconnu » devient irréconciliable). Exécutés,
            # non journalisés ; seule `execute` reste plafonnée.
            version = None if proposal['command'] == 'stop' else proposal['expected_version']
            return {'request_id': proposal['request_id'], 'state': 'completed',
                    'replayed': False,
                    'result': self.host._call_authenticated(subject, {'command': proposal['command']},
                                                            expected_version=version),
                    'environment': 'fixture', 'publication': False,
                    'global_v1_accepted': False, 'agent_stopped': self.host.control_latch.stopped()}
        if fresh:
            result = self.host._call_authenticated(subject, {'command': proposal['command']},
                                                   expected_version=proposal['expected_version'])
            self.journal.complete(subject, proposal, result)
            state = 'completed'
        return {'request_id': proposal['request_id'], 'state': state,
                'replayed': not fresh, 'result': result,
                'environment': 'fixture', 'publication': False,
                'global_v1_accepted': False, 'agent_stopped': self.host.control_latch.stopped()}
