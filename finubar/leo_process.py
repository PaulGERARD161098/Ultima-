"""Superviseur hôte préparatoire, sans endpoint ni commande fournie par Léo.

Un groupe POSIX permet de tuer les enfants coopérant avec ce groupe. Ce n'est
PAS un sandbox : un enfant hostile peut changer de session. L'installation
doit ajouter une enceinte noyau (conteneur/cgroup) contrôlée par FINUBAR,
des identités distinctes et une commande fixe revue hors des droits de Léo.
Les épreuves de ce module concernent seulement des processus de fixture.

Durcissements Linux (audit du 05/10, C9 C10 C13), qui NE remplacent PAS
l'enceinte noyau :
- l'hôte se déclare subreaper : tout descendant orphelin, même passé dans une
  autre session, lui revient ; à chaque fin de lancement, les descendants hors
  de la session de l'hôte sont tués et récoltés (aucun ne survit au lancement) ;
- l'enfant direct reçoit SIGKILL si le fil lanceur meurt (PDEATHSIG) ;
- pas de fichier core, descripteurs bornés.
Restent hors de portée de ce code : les petits-enfants quand l'hôte entier est
tué, les processus noyau non interruptibles, une course de forks plus rapide
que le balayage. Seul un cgroup tué en bloc par FINUBAR les couvre.
"""
from dataclasses import dataclass
import ctypes
import math
import os
from pathlib import Path
import resource
import signal
import subprocess
import sys
import threading
import time

from finubar.leo_control import ControlLatch
from leo.runtime.policy import Refusal


_PR_SET_PDEATHSIG = 1
_PR_SET_CHILD_SUBREAPER = 36
_LIBC = ctypes.CDLL(None, use_errno=True) if sys.platform.startswith('linux') else None
# Enfants directs vivants de TOUS les superviseurs de ce processus hôte.
_DIRECT = set()
_DIRECT_LOCK = threading.Lock()


def _process_table():
    """{pid: (ppid, sid, état)} lu dans /proc ; un processus disparu est ignoré."""
    table = {}
    for entry in os.scandir('/proc'):
        if not entry.name.isdigit():
            continue
        try:
            with open(f'/proc/{entry.name}/stat', 'rb') as handle:
                fields = handle.read().rsplit(b')', 1)[1].split()
        except (OSError, IndexError):
            continue
        table[int(entry.name)] = (int(fields[1]), int(fields[3]), fields[0])
    return table


def _descendants(table, roots):
    children = {}
    for pid, (ppid, _sid, _state) in table.items():
        children.setdefault(ppid, []).append(pid)
    seen, stack = set(), list(roots)
    while stack:
        pid = stack.pop()
        if pid in seen:
            continue
        seen.add(pid)
        stack.extend(children.get(pid, ()))
    return seen


def _escaped(table):
    # Orphans rattachés à l'hôte (subreaper) et sortis de sa session : ils ne
    # peuvent venir que d'un lancement supervisé (start_new_session=True).
    me, session = os.getpid(), os.getsid(0)
    with _DIRECT_LOCK:
        direct = set(_DIRECT)
    roots = [pid for pid, (ppid, sid, _state) in table.items()
             if ppid == me and sid != session and pid not in direct]
    return roots, _descendants(table, roots)


def _preexec(parent):
    # Exécuté dans l'enfant entre fork et exec : appels système seulement.
    if _LIBC.prctl(_PR_SET_PDEATHSIG, signal.SIGKILL, 0, 0, 0) != 0 or os.getppid() != parent:
        os._exit(126)
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
    bound = 256 if hard == resource.RLIM_INFINITY else min(256, hard)
    resource.setrlimit(resource.RLIMIT_NOFILE, (min(soft, bound), bound))


@dataclass(frozen=True)
class ProcessReceipt:
    state: str
    returncode: int
    # Ce reçu décrit le processus, jamais la réussite d'un effet métier.
    effect_state: str = 'unknown_requires_reconciliation'


class ProcessSupervisor:
    """Configuration et instance détenues uniquement par le lanceur hôte.

run() n'accepte aucun argument du modèle. Un superviseur = une commande fixe,
un lancement maximum, sans relance implicite, même après réponse perdue.
Le contrôle n'est verrouillé que pendant Popen, pas pendant le processus :
FINUBAR doit pouvoir inscrire l'arrêt pendant l'exécution.
"""
    def __init__(self, latch, argv, *, cwd, max_seconds, grace_seconds=0.2,
                 poll_seconds=0.02):
        if type(latch) is not ControlLatch:
            raise TypeError('trusted_control_latch_required')
        if (type(argv) is not tuple or not argv or
            any(type(arg) is not str or not arg or '\x00' in arg for arg in argv) or
            not Path(argv[0]).is_absolute()):
            raise ValueError('fixed_host_argv_required')
        if not Path(cwd).is_absolute() or not Path(cwd).is_dir():
            raise ValueError('fixed_host_directory_required')
        for value, bound in ((max_seconds, 300), (grace_seconds, 1), (poll_seconds, 0.1)):
            if type(value) not in (int, float) or not math.isfinite(value) or not 0 < value <= bound:
                raise ValueError('bounded_process_limits_required')
        self._latch, self._argv, self._cwd = latch, argv, str(cwd)
        self._max, self._grace, self._poll = max_seconds, grace_seconds, poll_seconds
        self._used = False
        self._lock = threading.Lock()

    @staticmethod
    def _signal_group(process, sig):
        try:
            os.killpg(process.pid, sig)
        except ProcessLookupError:
            pass

    def _terminate(self, process):
        # Toujours nettoyer le groupe, même si son premier processus est sorti.
        self._signal_group(process, signal.SIGTERM)
        time.sleep(self._grace)
        # Descendants encore rattachés à l'enfant, quelle que soit leur session.
        for pid in _descendants(_process_table(), [process.pid]) - {process.pid}:
            self._kill(pid)
        self._signal_group(process, signal.SIGKILL)
        try:
            process.wait(timeout=1)
        except subprocess.TimeoutExpired:
            raise Refusal('finubar_process_stop_unconfirmed') from None
        finally:
            with _DIRECT_LOCK:
                _DIRECT.discard(process.pid)
        self._sweep()

    @staticmethod
    def _kill(pid):
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass

    def _sweep(self):
        # C9 : un descendant passé dans une autre session revient à l'hôte
        # (subreaper) à la mort de son parent ; il est tué et récolté ici.
        deadline = time.monotonic() + 1
        while True:
            table = _process_table()
            roots, targets = _escaped(table)
            for pid in targets:
                self._kill(pid)
            for pid in roots:
                try:
                    os.waitpid(pid, os.WNOHANG)
                except ChildProcessError:
                    pass
            if not any(table[pid][2] != b'Z' for pid in targets if pid in table):
                if not roots:
                    return
            if time.monotonic() >= deadline:
                raise Refusal('finubar_process_stop_unconfirmed')
            time.sleep(0.01)

    def run(self):
        if os.name != 'posix' or not hasattr(os, 'WNOWAIT') or _LIBC is None:
            raise Refusal('finubar_posix_host_required')
        if _LIBC.prctl(_PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0) != 0:
            raise Refusal('finubar_subreaper_required')
        with self._lock:
            if self._used:
                raise Refusal('finubar_process_already_engaged')
            self._used = True
        process = None
        deadline = time.monotonic() + self._max
        try:
            with self._latch.admission(timeout=min(self._max, 0.1)):
                if time.monotonic() >= deadline:
                    raise Refusal('finubar_process_timeout')
                process = subprocess.Popen(self._argv, cwd=self._cwd,
                    env={'PATH': '/usr/bin:/bin', 'LANG': 'C.UTF-8'},
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL, close_fds=True, start_new_session=True,
                    preexec_fn=lambda parent=os.getpid(): _preexec(parent))
                with _DIRECT_LOCK:
                    _DIRECT.add(process.pid)
            while True:
                # Lecture avant poll : la sortie du processus ne masque pas un arrêt.
                try:
                    stopped = self._latch.stopped(timeout=0)
                except Exception:
                    raise Refusal('finubar_process_control_unavailable') from None
                if stopped:
                    raise Refusal('leo_agent_stopped')
                if time.monotonic() >= deadline:
                    raise Refusal('finubar_process_timeout')
                # Ne pas réapprêter le PID avant le dernier signal au groupe :
                # un PID recyclé pourrait sinon désigner un processus étranger.
                event = os.waitid(os.P_PID, process.pid,
                                  os.WEXITED | os.WNOHANG | os.WNOWAIT)
                if event is not None:
                    result = event.si_status if event.si_code == os.CLD_EXITED else -event.si_status
                    return ProcessReceipt('exited', result)
                time.sleep(self._poll)
        finally:
            if process is not None:
                self._terminate(process)
