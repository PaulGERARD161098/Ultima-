"""Closed, deterministic local inspector for the isolated acceptance fixture.

No network, model, shell, subprocess or caller callback. Bounded JSON input is
scanned for the known synthetic marker KNOWN_DEFECT. The durable receipt stores
only identifiers/digest/outcome, never record text. This is an instrument for
transport gates, not an independent human/code review. The host owns the
explicit receipt directory and must prevent its replacement by other users.
"""
import hashlib
import json
import os
from pathlib import Path

from .memoire import _json
from .policy import Refusal


class FixtureInspector:
    def __init__(self, receipt_directory, *, lose_response=False):
        self.directory = Path(receipt_directory).absolute()
        if self.directory.is_symlink() or not self.directory.is_dir():
            raise Refusal('fixture_receipt_directory_required')
        if type(lose_response) is not bool:
            raise Refusal('invalid_fixture_failpoint')
        self.lose_response = lose_response

    def _path(self, envelope):
        key = _json({'mission': envelope['mission'], 'operation_id': envelope['operation_id']})
        return self.directory / (hashlib.sha256(key.encode()).hexdigest() + '.json')

    def send(self, request):
        request = json.loads(_json(request))
        envelope = {k: v for k, v in request.items() if k != 'records'}
        result = {**envelope, 'outcome': 'failed' if any(
            'KNOWN_DEFECT' in value['text'] for value in request['records'].values()) else 'passed'}
        path = self._path(envelope)
        # Different dispatchers cannot both own the same durable reservation.
        # Exclusive receipt creation additionally refuses any unexpected reuse.
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(_json(result))
            stream.flush()
            os.fsync(stream.fileno())
        descriptor = os.open(self.directory, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
        if self.lose_response:
            raise Refusal('fixture_lost_response')
        return result

    def lookup(self, envelope):
        path = self._path(envelope)
        if not path.exists():
            return None
        if path.is_symlink() or not path.is_file() or path.stat().st_size > 65536:
            raise Refusal('invalid_fixture_receipt')
        try:
            return json.loads(path.read_text(encoding='utf-8'))
        except (ValueError, UnicodeError):
            raise Refusal('invalid_fixture_receipt') from None
