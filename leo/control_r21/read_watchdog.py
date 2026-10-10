"""Independent FINUBAR process owning the offline Docker capability.

Linux only, operator-host preparation. No daemon installation or model calls.
The owner cannot issue a delayed Docker start after dying: only this guardian
owns the client. Loss of the guardian itself still requires an external service.
"""
import base64
import json
import os
from pathlib import Path
import re
import select
import socket
import threading
import time

from leo.runtime.policy import Refusal

LIMIT = 65536


def _pack(value):
    raw = json.dumps(value, separators=(',', ':'), allow_nan=False).encode()
    if len(raw) > LIMIT:
        raise Refusal('read_guard_message_limit')
    return raw


def _receive(channel):
    raw, _, flags, _ = channel.recvmsg(LIMIT)
    if not raw:
        raise EOFError('read_owner_disconnected')
    if flags & socket.MSG_TRUNC:
        raise Refusal('read_guard_message_limit')
    return json.loads(raw)


def _bytes(value):
    return base64.b64encode(value).decode('ascii')


class GuardedTransport:
    """Private socket, one fixed plan/name, one create and one start.

    Transport factory is a trusted CI seam. Never passed to a worker.
    Construction acknowledges the separate process before any Docker effect.
    """
    def __init__(self, plan, name, latch, claim, deadline, *, _factory=None):
        if threading.active_count() != 1 or not hasattr(os, 'pidfd_open'):
            raise Refusal('read_guard_linux_single_thread_required')
        if not re.fullmatch(r'leo-read-[a-f0-9]{32}', name):
            raise Refusal('read_guard_name_required')
        from leo.control_r21.read_launcher import DockerTransport, _create_args
        factory = DockerTransport if _factory is None else _factory
        expected = _create_args(plan, name)
        parent, child = socket.socketpair(socket.AF_UNIX, socket.SOCK_SEQPACKET)
        owner = os.pidfd_open(os.getpid())  # pinned identity, never a reused PID
        try:
            pid = os.fork()
        except BaseException:
            parent.close(); child.close(); os.close(owner)
            raise
        if pid == 0:
            parent.close()
            code = 1
            try:
                os.setsid()  # owner process-group termination must not kill guardian
                code = _serve(child, owner, factory(), expected, name, latch, Path(claim), deadline)
            except BaseException:
                # No uncontrolled traceback or worker output on the host protocol.
                try: latch._bury('owner_stop')
                except BaseException: pass
            finally:
                child.close(); os.close(owner)
            os._exit(code)
        child.close(); os.close(owner)
        self.channel, self.pid, self.finished = parent, pid, False
        self.evidence_path, self.name = Path(str(claim) + '.watchdog'), name
        parent.settimeout(35)
        try:
            if _receive(parent) != {'ready': True}:
                raise Refusal('read_guard_not_ready')
        except BaseException:
            parent.close()
            raise Refusal('read_guard_not_ready') from None

    def _request(self, operation, value=None):
        if self.finished:
            raise Refusal('read_guard_closed')
        try:
            self.channel.sendall(_pack({'operation': operation, 'value': value}))
            reply = _receive(self.channel)
            if type(reply) is not dict or set(reply) != {'result'}:
                raise ValueError('guard_reply')
            return reply['result']
        except (OSError, EOFError, ValueError):
            raise Refusal('read_guard_unavailable') from None

    def call(self, args):
        rc, out, err = self._request('call', list(args))
        return rc, base64.b64decode(out, validate=True), base64.b64decode(err, validate=True)

    def start(self, cid):
        self._request('start', cid)

    def poll(self):
        out, err, rc, drained = self._request('poll')
        return base64.b64decode(out, validate=True), base64.b64decode(err, validate=True), rc, drained

    def close(self):
        self._request('close')

    def cleanup_owned(self):
        # If STOP/deadline already made the guardian exit, use its durable
        # cleanup attestation only after reaping that exact child.
        try:
            self._request('finish')
        except Refusal:
            pass
        finally:
            self.finished = True
            self.channel.close()
        until = time.monotonic() + 35
        while time.monotonic() < until:
            pid, status = os.waitpid(self.pid, os.WNOHANG)
            if pid:
                if status != 0:
                    raise Refusal('read_guard_cleanup_unconfirmed')
                from leo.control_r21.read_launcher import _read_fixed
                receipt = json.loads(_read_fixed(self.evidence_path, 1024))
                if (type(receipt) is not dict or set(receipt) != {'container','reason','container_removed'}
                        or receipt['container'] != self.name or receipt['container_removed'] is not True
                        or receipt['reason'] not in {'normal_cleanup','owner_lost','owner_stopped',
                            'deadline','owner_disconnected'}):
                    raise Refusal('read_guard_cleanup_unconfirmed')
                return True
            time.sleep(.01)
        raise Refusal('read_guard_exit_unconfirmed')


def _serve(channel, owner, transport, expected, name, latch, claim, deadline):
    cid, created, started, removed, observed = None, False, False, False, False
    reason = 'guardian_failure'

    def owner_alive():
        return not select.select([owner], [], [], 0)[0]

    def check():
        if not owner_alive():
            raise Refusal('owner_lost')
        if latch.stopped(timeout=.1):
            raise Refusal('owner_stopped')
        if time.monotonic() >= deadline:
            raise Refusal('deadline')

    def cleanup():
        # Guardian owns every client, including a create that returned late.
        # No other process can start this container after its removal.
        close_error = False
        try: transport.close()
        except BaseException: close_error = True
        if not created:
            return not close_error
        rc, rc2, out = -1, -1, b'unknown'
        try: rc, _, _ = transport.call(('rm', '--force', cid or name))
        except BaseException: pass
        try:
            rc2, out, _ = transport.call(('container', 'ls', '--all', '--quiet', '--no-trunc',
                                          '--filter', 'name=^/' + name + '$'))
        except BaseException: pass
        return not close_error and cid is not None and rc == 0 and rc2 == 0 and not out.strip()

    def evidence(confirmed):
        # Companion of the permanent claim, not a second mission/budget ledger.
        raw = _pack({'container': name, 'reason': reason, 'container_removed': confirmed}) + b'\n'
        path = Path(str(claim) + '.watchdog')
        temporary = Path(str(path) + '.tmp-' + str(os.getpid()))
        fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        try:
            with os.fdopen(fd, 'wb', closefd=False) as stream:
                stream.write(raw); stream.flush(); os.fsync(fd)
        finally:
            os.close(fd)
        os.link(temporary, path, follow_symlinks=False)
        temporary.unlink()
        directory = os.open(path.parent, os.O_RDONLY)
        try: os.fsync(directory)
        finally: os.close(directory)

    try:
        check()
        channel.sendall(_pack({'ready': True}))
        while True:
            check()
            if not select.select([channel, owner], [], [], .02)[0]:
                continue
            check()
            request = _receive(channel)
            if type(request) is not dict or set(request) != {'operation', 'value'}:
                raise Refusal('read_guard_request_denied')
            op, value = request['operation'], request['value']
            if op == 'call':
                if type(value) is not list or not all(type(s) is str for s in value):
                    raise Refusal('read_guard_request_denied')
                args = tuple(value)
                if args == expected and not created:
                    created = True
                    rc, out, err = transport.call(args)
                    if rc == 0 and re.fullmatch(b'[a-f0-9]{64}\n?', out):
                        cid = out.strip().decode('ascii')
                    check()  # owner loss during create can never advance to start
                elif cid is not None and args == ('inspect', '--format', '{{json .State}}', cid):
                    rc, out, err = transport.call(args)
                elif cid is not None and args == ('rm', '--force', cid):
                    transport.close()
                    rc, out, err = transport.call(args)
                    removed = rc == 0
                elif created and args == ('container', 'ls', '--all', '--quiet', '--no-trunc',
                                           '--filter', 'name=^/' + name + '$'):
                    rc, out, err = transport.call(args)
                    observed = removed and rc == 0 and not out.strip()
                else:
                    raise Refusal('read_guard_request_denied')
                result = [rc, _bytes(out), _bytes(err)]
            elif op == 'start' and cid is not None and value == cid and not started and not removed:
                check(); started = True
                transport.start(cid)
                result = True
            elif op == 'poll' and started and value is None:
                out, err, rc, drained = transport.poll()
                result = [_bytes(out), _bytes(err), rc, drained]
            elif op == 'close' and value is None:
                transport.close(); result = True
            elif op == 'finish' and value is None:
                confirmed = cleanup()
                if not confirmed:
                    raise Refusal('read_guard_cleanup_unconfirmed')
                reason = 'normal_cleanup'
                evidence(True)
                channel.sendall(_pack({'result': True}))
                return 0
            else:
                raise Refusal('read_guard_request_denied')
            channel.sendall(_pack({'result': result}))
    except (EOFError, OSError):
        reason = 'owner_lost' if not owner_alive() else 'owner_disconnected'
    except Refusal as error:
        reason = str(error)
    finally:
        if reason != 'normal_cleanup':
            # Stop durably before cleanup; an uncertain operation stays reserved.
            try: latch._bury('owner_stop')
            finally:
                confirmed = False
                try: confirmed = cleanup()
                finally: evidence(confirmed)
    return 0 if confirmed else 1
