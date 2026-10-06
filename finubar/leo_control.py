"""Arrêt de Léo par FINUBAR, exécuté par l'hôte et jamais par le modèle.

Ce code préparatoire doit être figé/installé hors des droits de Léo. L'index
FINUBAR n'est pas une autorité ; le ledger canonique conserve seul l'arrêt.
Les cibles sont les cibles effectives de l'adaptateur hôte, pas celles d'un
texte libre. Une voie qui contourne ce passage n'est pas contrôlée ici.
"""
from pathlib import Path
from contextlib import contextmanager
import os
import re
import sqlite3
import stat

from leo.runtime.policy import Refusal

CONTROL_REPOSITORY = 'PaulGERARD161098/leo-control-r21'
SELF_CONTROL_ACTIONS = frozenset({'change_control', 'disable_control',
                                'self_approve', 'self_review', 'resume_control'})
READ_ACTIONS = frozenset({'status', 'read_source', 'read_memory', 'reconcile'})
REPOSITORY = re.compile(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', re.ASCII)
# Formes équivalentes d'un même dépôt GitHub : URL, suffixe .git, barre finale.
_ALIAS = re.compile(r'(?:https://github\.com/)?([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?/?', re.ASCII)
STOP_REASONS = frozenset({'leo_self_control_attempt', 'leo_control_write_attempt',
                          'leo_control_target_unknown', 'owner_stop'})


def _canonical_repository(value):
    match = _ALIAS.fullmatch(value)
    if match is None or {'.', '..'} & set(match.groups()):
        return None
    return '/'.join(match.groups()).casefold()


def _touches(target, protected):
    return any(target == p or target.is_relative_to(p) or p.is_relative_to(target)
               for p in protected)


def control_violation(action, repository, control_repository=CONTROL_REPOSITORY,
                      protected_paths=()):
    if action in SELF_CONTROL_ACTIONS:
        return 'leo_self_control_attempt'
    if action in READ_ACTIONS:
        return None
    if type(repository) is not str or not repository or '\x00' in repository:
        return 'leo_control_target_unknown'
    protected = tuple(Path(p).resolve() for p in protected_paths)
    if Path(repository).is_absolute():
        if _touches(Path(repository).resolve(), protected):
            return 'leo_control_write_attempt'
        return None
    canonical = _canonical_repository(repository)
    if canonical is None:
        return 'leo_control_target_unknown'
    if canonical == _canonical_repository(control_repository):
        return 'leo_control_write_attempt'
    # Une cible relative qui existe localement est jugée sur son chemin réel.
    if protected and Path(repository).exists() and _touches(Path(repository).resolve(), protected):
        return 'leo_control_write_attempt'
    return None


class LeoControl:
    """Capacité hôte : aucune commande de réarmement offerte à Léo.

Le ledger et les chemins protégés sont fournis par l'intégrateur de confiance.
Les chemins doivent désigner le contrôle INSTALLÉ, pas un brouillon Ultima.
L'arrêt et la dernière admission Broker utilisent le même verrou SQLite.
"""
    def __init__(self, ledger, mission, *, control_repository=CONTROL_REPOSITORY,
                 protected_paths=(), latch=None):
        if type(control_repository) is not str or not REPOSITORY.fullmatch(control_repository):
            raise ValueError('invalid_control_repository')
        self.ledger, self.mission = ledger, mission
        self.control_repository = control_repository.casefold()
        self.protected_paths = tuple(Path(p).resolve() for p in protected_paths)
        if latch is not None and type(latch) is not ControlLatch:
            raise TypeError('trusted_control_latch_required')
        self.latch = latch

    def before_effect(self, action, repository):
        # Action/repository effectifs proviennent du broker/adaptateur hôte.
        reason = control_violation(action, repository, self.control_repository,
                                   self.protected_paths)
        if reason is not None:
            return self._trip(reason)

    def _trip(self, reason):
        # Écriture persistante AVANT le refus ; échec d'arrêt = aucun dispatch.
        # Chaque registre est tenté même si l'autre échoue (verrou occupé, etc.).
        confirmed = True
        if self.latch is not None:
            try:
                self.latch.trip(reason)
            except Exception:
                confirmed = False
        try:
            confirmed = self.ledger.stop(self.mission, reason, authority=True)['stopped'] is True and confirmed
        except Exception:
            confirmed = False
        raise Refusal(reason if confirmed else 'finubar_stop_unconfirmed')


class ControlLatch:
    """Arrêt global partagé par TOUTES les missions de l'instance Léo.

Fichier hôte hors modèle, distinct du registre de missions ; aucune méthode
de reset, aucun endpoint modèle. Toute admission garde son verrou jusqu'à
l'effet borné. Un arrêt attend les admissions déjà engagées puis interdit
toute nouvelle admission. L'hôte doit tuer/borner ses processus indépendamment.
"""
    def __init__(self, path, *, initialize=False, trip_timeout=330, anchor_dir=None):
        self.path = Path(path).absolute()
        self.trip_timeout = trip_timeout
        if self.path.is_symlink() or not self.path.parent.is_dir():
            raise ValueError('trusted_control_path_required')
        # C4 — pierre tombale : fichier distinct, créé une fois, jamais effacé par
        # ce code. Restaurer une copie antérieure de la base ne réarme pas.
        # anchor_dir permet de la poser hors du dossier du verrou (autre volume,
        # stockage en ajout seul) ; seule une ancre extérieure couvre la
        # restauration du dossier entier.
        anchor = Path(anchor_dir).absolute() if anchor_dir is not None else self.path.parent
        if anchor.is_symlink() or not anchor.is_dir():
            raise ValueError('trusted_anchor_directory_required')
        self._tombstone = anchor / (self.path.name + '.stopped')
        # Marque d'installation : une fois posée, l'absence du contrôle est une
        # panne, jamais une invitation à le recréer à neuf (pas de réarmement).
        self._installed = self.path.with_name(self.path.name + '.installed')
        created = False
        if initialize is True and (self._installed.exists() or self._buried()):
            raise Refusal('control_unavailable')
        if initialize is True:
            try:
                descriptor = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o600)
            except FileExistsError:
                pass
            else:
                os.close(descriptor)
                created = True
        if not self.path.is_file():
            raise Refusal('control_unavailable')
        self._assert_private()
        with self._transaction() as db:
            objects = db.execute("SELECT type,name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").fetchall()
            application = db.execute('PRAGMA application_id').fetchone()[0]
            version = db.execute('PRAGMA user_version').fetchone()[0]
            if created:
                if objects or application != 0 or version != 0:
                    raise Refusal('control_unavailable')
                db.execute('PRAGMA application_id=1279477297')  # LCF1
                db.execute('PRAGMA user_version=1')
                db.execute('CREATE TABLE control (id INTEGER PRIMARY KEY CHECK(id=1), stopped INTEGER NOT NULL, reason TEXT)')
                db.execute('INSERT INTO control VALUES (1,0,NULL)')
            elif objects != [('table', 'control')] or application != 0x4C434631 or version != 1:
                raise Refusal('control_unavailable')
            rows = db.execute('SELECT id,stopped,reason FROM control').fetchall()
            if len(rows) != 1 or rows[0][0] != 1 or rows[0][1] not in (0,1):
                raise Refusal('control_unavailable')
        if created:
            os.close(os.open(self._installed, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o400))

    def _assert_private(self):
        # Fichier et dossiers détenus par l'UID hôte, inaccessibles aux autres
        # (donc à Léo, sous une identité distincte) : sinon reset possible.
        uid = os.geteuid()
        info = os.lstat(self.path)
        if not stat.S_ISREG(info.st_mode) or info.st_uid != uid or info.st_mode & 0o077:
            raise Refusal('control_permissions_unsafe')
        for folder in {self.path.parent, self._tombstone.parent}:
            parent = os.stat(folder)
            if parent.st_uid != uid or parent.st_mode & 0o022:
                raise Refusal('control_permissions_unsafe')

    def _buried(self):
        # Toute présence (même illisible ou altérée) vaut arrêt : échec fermé.
        return os.path.lexists(self._tombstone)

    def _bury(self, reason):
        try:
            descriptor = os.open(self._tombstone, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o400)
        except FileExistsError:
            return
        try:
            os.write(descriptor, reason.encode('ascii') + b'\n')
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
        folder = os.open(self._tombstone.parent, os.O_RDONLY)
        try:
            os.fsync(folder)
        finally:
            os.close(folder)

    @contextmanager
    def _transaction(self, *, timeout=10):
        if self.path.is_symlink() or not self.path.is_file():
            raise Refusal('control_unavailable')
        self._assert_private()
        db = sqlite3.connect(self.path.as_uri()+'?mode=rw', uri=True, timeout=timeout, isolation_level=None)
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

    def stopped(self, *, timeout=5):
        if self.path.is_symlink() or not self.path.is_file():
            raise Refusal('control_unavailable')
        self._assert_private()
        if self._buried():
            return True
        try:
            with sqlite3.connect(self.path.as_uri()+'?mode=ro', uri=True, timeout=timeout) as db:
                db.execute('PRAGMA query_only=ON')
                row = db.execute('SELECT stopped FROM control WHERE id=1').fetchone()
        except sqlite3.OperationalError:
            # Base tenue par un arrêt en cours d'écriture : la pierre tombale,
            # posée avant, dit la vérité ; sinon l'erreur remonte (échec fermé).
            if self._buried():
                return True
            raise
        if row is None or row[0] not in (0, 1):
            raise Refusal('control_unavailable')
        return bool(row[0])

    def trip(self, reason):
        if reason not in STOP_REASONS:
            raise ValueError('invalid_stop_reason')
        # La pierre tombale d'abord : elle ne dépend d'aucun verrou SQLite, donc
        # l'arrêt est acquis même si une admission longue tient la base.
        self._bury(reason)
        # Attendre au-delà de la plus longue admission bornée (superviseur ≤ 300 s).
        with self._transaction(timeout=self.trip_timeout) as db:
            db.execute('UPDATE control SET stopped=1,reason=COALESCE(reason,?) WHERE id=1', (reason,))

    @contextmanager
    def admission(self, *, timeout=10):
        with self._transaction(timeout=timeout) as db:
            row = db.execute('SELECT stopped FROM control WHERE id=1').fetchone()
            if row is None or row[0] != 0 or self._buried():
                raise Refusal('leo_agent_stopped')
            yield
