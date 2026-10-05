"""Superviseur hôte préparatoire, sans endpoint ni commande fournie par Léo.

Un groupe POSIX permet de tuer les enfants coopérant avec ce groupe. Ce n'est
PAS un sandbox : un enfant hostile peut changer de session. L'installation
doit ajouter une enceinte noyau (conteneur/cgroup) contrôlée par FINUBAR,
des identités distinctes et une commande fixe revue hors des droits de Léo.
Les épreuves de ce module concernent seulement des processus de fixture.
"""
from dataclasses import dataclass
import math
import os
from pathlib import Path
import signal
import subprocess
import threading
import time

from finubar.leo_control import ControlLatch
from leo.runtime.policy import Refusal


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
        self._signal_group(process, signal.SIGKILL)
        try:
            process.wait(timeout=1)
        except subprocess.TimeoutExpired:
            raise Refusal('finubar_process_stop_unconfirmed') from None

    def run(self):
        if os.name != 'posix' or not hasattr(os, 'WNOWAIT'):
            raise Refusal('finubar_posix_host_required')
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
                    stderr=subprocess.DEVNULL, close_fds=True, start_new_session=True)
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
