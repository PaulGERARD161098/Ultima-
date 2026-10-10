"""Offline candidate worker. No model, credentials, controller imports or tools.

Input is a host-selected PR snapshot mounted read-only. Output is bounded JSON
data on stdout. The host must bound runtime/output and kill the whole container.
This deterministic report is a transport witness, not an autonomous agent.
"""
import hashlib
import json
from pathlib import Path
import sys

MAX_INPUT = 32768
MAX_OUTPUT = 49152


def _pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate_snapshot_key')
        result[key] = value
    return result


def report(raw):
    if type(raw) is not bytes or not 0 < len(raw) <= MAX_INPUT:
        raise ValueError('snapshot_size_denied')
    snapshot = json.loads(raw, object_pairs_hook=_pairs)
    if (type(snapshot) is not dict or set(snapshot) != {'repository', 'measured_at', 'prs'} or
            snapshot['repository'] != 'PaulGERARD161098/Ultima-' or
            type(snapshot['prs']) is not list or not 1 <= len(snapshot['prs']) <= 20):
        raise ValueError('snapshot_scope_denied')
    # Nothing in these fields becomes a command or authority. Host validator
    # is responsible for acquisition metadata; worker reports exactly that data.
    result = {'autonomous_agent': False, 'publication': False, 'environment': 'fixture',
              'coverage': 'selected_prs_only', 'snapshot_sha256': hashlib.sha256(raw).hexdigest(),
              'repository': snapshot['repository'], 'measured_at': snapshot['measured_at'],
              'prs': snapshot['prs'], 'next_action': 'operator_review_required'}
    encoded = json.dumps(result, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()
    if len(encoded) > MAX_OUTPUT:
        raise ValueError('report_size_denied')
    return encoded


def main():
    try:
        raw = Path('/snapshot.json').open('rb').read(MAX_INPUT + 1)
        result = report(raw)
    except Exception:
        # Never echo PR text, paths, secrets or exception details to logs.
        print('read_candidate_refused', file=sys.stderr)
        return 78
    sys.stdout.buffer.write(result + b'\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
