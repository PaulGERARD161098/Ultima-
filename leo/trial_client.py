"""Client privé R21. Le Bearer vient de stdin ; jamais d'un argument CLI.

Exemple : fournisseur-de-session | python -m leo.trial_client status --host URL
Le client n'invente ni accord ni preuve et ne réessaie jamais une exécution.
"""
import argparse
from http.client import HTTPException
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, build_opener, ProxyHandler

from .trial_host import COMMANDS, NoRedirect, loopback_url
from .trial import MISSION
from .trial_resume import PROPOSAL


def valid_success(command, value):
    if 'error' in value:
        return False
    if command == 'stop':
        pending = value.get('pending_operations')
        return (set(value) == {'mission_id', 'stopped', 'pending_operations', 'reserved_units',
                              'environment', 'publication', 'global_v1_accepted'}
            and value.get('mission_id') == MISSION and value.get('stopped') is True
            and isinstance(pending, list)
            and all(type(item) is str and 0 < len(item) <= 200 for item in pending)
            and len(set(pending)) == len(pending)
            and type(value.get('reserved_units')) is int and 0 <= value['reserved_units'] <= 4
            and value.get('environment') == 'fixture' and value.get('publication') is False
            and value.get('global_v1_accepted') is False)
    if command == 'status':
        budget = value.get('budget')
        return (isinstance(value.get('state'), str) and bool(value['state'])
            and type(value.get('version')) is int and value['version'] >= 1
            and isinstance(value.get('operations'), list)
            and all(isinstance(item, dict) and isinstance(item.get('id'), str)
                    and item.get('status') in ('pending', 'completed', 'unknown')
                    for item in value['operations'])
            and isinstance(budget, dict)
            and all(type(budget.get(key)) is int and budget[key] >= 0 for key in ('calls', 'used_units'))
            and type(budget.get('stopped')) is bool
            and value.get('environment') == 'fixture' and value.get('publication') is False
            and value.get('global_v1_accepted') is False)
    if (value.get('mission_id') != MISSION or value.get('operation_id') != PROPOSAL['operation_id']
            or value.get('status') not in ('pending', 'completed', 'unknown')):
        return False
    if value['status'] == 'completed':
        result = value.get('result')
        return (isinstance(result, dict) and result.get('environment') == 'fixture'
                and result.get('publication') is False and isinstance(result.get('commit'), str)
                and re.fullmatch('[0-9a-f]{40}', result['commit']) is not None)
    return value.get('result') is None


def call(host_url, command, token):
    if command not in COMMANDS or not token or len(token) > 8192:
        raise ValueError('invalid_client_request')
    endpoint = loopback_url(host_url) + '/r21'
    request = Request(endpoint, data=json.dumps({'command': command}).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method='POST')
    try:
        response = build_opener(ProxyHandler({}), NoRedirect()).open(request, timeout=60)
    except HTTPError as error:
        response = error
    except (URLError, TimeoutError, OSError, HTTPException):
        return 503, {'error': 'result_unknown_reconcile_required'}
    try:
        with response:
            body = response.read(65537)
            if len(body) > 65536:
                raise ValueError('invalid_host_response')
            value = json.loads(body)
            if not isinstance(value, dict):
                raise ValueError('invalid_host_response')
            if response.status == 200 and not valid_success(command, value):
                raise ValueError('invalid_host_response')
            return response.status, value
    except (ValueError, TimeoutError, OSError, HTTPException):
        return 503, {'error': 'result_unknown_reconcile_required'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=sorted(COMMANDS))
    parser.add_argument('--host', required=True)
    args = parser.parse_args()
    token = sys.stdin.readline(8194).strip()
    try:
        status, value = call(args.host, args.command, token)
    except (ValueError, OSError):
        status, value = 400, {'error': 'invalid_client_request'}
    print(json.dumps(value, ensure_ascii=False, sort_keys=True))
    return 0 if status == 200 and valid_success(args.command, value) and (
        args.command in ('status', 'stop') or value.get('status') == 'completed') else 1


if __name__ == '__main__':
    sys.exit(main())
