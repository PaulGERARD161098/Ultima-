"""Superviseur hôte préparatoire, sans endpoint ni commande fournie par Léo.

Un groupe POSIX permet de tuer les enfants coopérant avec ce groupe. Ce n'est
PAS un sandbox : un enfant hostile peut changer de session. L'installation
doit ajouter une enceinte noyau (conteneur/cgroup) contrôlée par FINUBAR,
des identités distinctes et une commande fixe revue hors des droits de Léo.
Les épreuves de ce module concernent seulement des processus de fixture.

Durcissements Linux (audit du 05/10, C9 C10 C13), qui NE remplacent PAS
l'enceinte noyau :
- l'hôte se déclare subreaper : tout descendant orphelin, même passé dans une
  autre session, lui revient ; à chaque fin de lancement, les orphelins issus
  d'un lancement supervisé (marque d'environnement, ou vus dans la lignée) sont
  tués et récoltés ; les autres enfants de l'hôte sont épargnés ;
- un lanceur à fil unique (pas de preexec_fn) pose PDEATHSIG — l'enfant direct
  reçoit SIGKILL si le fil lanceur meurt — puis exécute la commande fixe ;
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
import secrets
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
# Marque des lancements supervisés de cet hôte (revue Codex du 06/10) : seul ce
# qui la porte, ou a été vu dans une lignée supervisée, peut être balayé ; un
# enfant de l'hôte lancé ailleurs, même dans une autre session, est épargné.
_MARQUE = b'LV1_SUPERVISION=' + secrets.token_hex(16).encode('ascii')
_VUS = set()            # (pid, instant de démarrage) observés dans une lignée supervisée
# Lanceur à fil unique, exécuté AVANT la commande fixe (revue Codex du 06/10) :
# pas de preexec_fn dans un hôte multi-fil (risque d'interblocage entre fork et
# exec). PDEATHSIG et limites survivent à execv.
_LANCEUR = (
    "import ctypes,os,resource,signal,sys\n"
    "if ctypes.CDLL(None,use_errno=True).prctl(1,signal.SIGKILL,0,0,0)!=0 "
    "or os.getppid()!=int(sys.argv[1]): os._exit(126)\n"
    "resource.setrlimit(resource.RLIMIT_CORE,(0,0))\n"
    "s,h=resource.getrlimit(resource.RLIMIT_NOFILE)\n"
    "b=256 if h==resource.RLIM_INFINITY else min(256,h)\n"
    "resource.setrlimit(resource.RLIMIT_NOFILE,(min(s,b),b))\n"
    "os.execv(sys.argv[2],sys.argv[2:])\n")


def _process_table():
    """{pid: (ppid, sid, état, démarrage)} lu dans /proc ; un disparu est ignoré."""
    table = {}
    for entry in os.scandir('/proc'):
        if not entry.name.isdigit():
            continue
        try:
            with open(f'/proc/{entry.name}/stat', 'rb') as handle:
                fields = handle.read().rsplit(b')', 1)[1].split()
        except (OSError, IndexError):
            continue
        table[int(entry.name)] = (int(fields[1]), int(fields[3]), fields[0], int(fields[19]))
    return table


def _marque(pid):
    try:
        with open(f'/proc/{pid}/environ', 'rb') as handle:
            return _MARQUE in handle.read().split(b'\0')
    except OSError:
        return False


def _descendants(table, roots):
    children = {}
    for pid, (ppid, *_reste) in table.items():
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
    # Orphelins rattachés à l'hôte (subreaper), hors de sa session, et issus
    # d'un lancement supervisé : marque présente, ou vus dans une lignée.
    # Appelant : détient _DIRECT_LOCK, pour qu'aucun Popen ne soit entre son
    # fork et son enregistrement. Limite : un descendant hostile qui efface son
    # environnement ET s'évade entre deux sondages échappe — enceinte noyau.
    me, session = os.getpid(), os.getsid(0)
    roots = [pid for pid, (ppid, sid, _state, start) in table.items()
             if ppid == me and sid != session and pid not in _DIRECT
             and ((pid, start) in _VUS or _marque(pid))]
    return roots, _descendants(table, roots)


def _observe(pid):
    # Mémorise la lignée vivante d'un enfant supervisé (identité pid+démarrage,
    # robuste au recyclage de PID) pour reconnaître ses orphelins plus tard.
    table = _process_table()
    with _DIRECT_LOCK:
        _VUS.update((p, table[p][3]) for p in _descendants(table, [pid]) if p in table)


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
            with _DIRECT_LOCK:
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
                # Échec de lancement fermé et visible, comme Popen l'était.
                if not os.access(self._argv[0], os.X_OK):
                    raise FileNotFoundError(self._argv[0])
                with _DIRECT_LOCK:  # fork et enregistrement indivisibles pour _sweep
                    process = subprocess.Popen(
                        (sys.executable, '-I', '-S', '-c', _LANCEUR, str(os.getpid()), *self._argv),
                        cwd=self._cwd,
                        env={'PATH': '/usr/bin:/bin', 'LANG': 'C.UTF-8',
                             _MARQUE.split(b'=')[0].decode(): _MARQUE.split(b'=')[1].decode()},
                        stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL, close_fds=True, start_new_session=True)
                    _DIRECT.add(process.pid)
            while True:
                # Lecture avant poll : la sortie du processus ne masque pas un arrêt.
                try:
                    # Attente bornée à un intervalle de sondage : l'admission d'un
                    # lancement voisin sur le même verrou ne vaut pas panne du
                    # contrôle (faux arrêt d'un enfant sain, vu le 06/10) ; au-delà,
                    # échec fermé inchangé.
                    stopped = self._latch.stopped(timeout=self._poll)
                except Exception:
                    raise Refusal('finubar_process_control_unavailable') from None
                if stopped:
                    raise Refusal('leo_agent_stopped')
                if time.monotonic() >= deadline:
                    raise Refusal('finubar_process_timeout')
                _observe(process.pid)
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
