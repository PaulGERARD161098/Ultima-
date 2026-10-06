"""Client du raccord préparatoire ; un appel, aucun retry ni accord inventé."""
from http.client import HTTPException
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, build_opener, ProxyHandler

from . import protocol
from ..trial_host import NoRedirect, loopback_url
from ..trial_client import valid_success


def call(host_url, proposal, token):
    proposal = protocol.validate(proposal)
    if type(token) is not str or not token or len(token) > 8192 or '\r' in token or '\n' in token:
        raise ValueError('invalid_client_request')
    request = Request(loopback_url(host_url)+'/r21',
        data=json.dumps(proposal, sort_keys=True, separators=(',', ':')).encode(),
        headers={'Authorization':'Bearer '+token, 'Content-Type':'application/json'}, method='POST')
    try:
        response = build_opener(ProxyHandler({}), NoRedirect()).open(request, timeout=30)
    except HTTPError as error:
        response = error
    except (URLError, TimeoutError, OSError, HTTPException):
        return 503, {'error':'result_unknown_reconcile_required'}
    try:
        with response:
            body = response.read(65537)
            if len(body) > 65536:
                raise ValueError('invalid_response')
            def unique(pairs):
                result = {}
                for key, value in pairs:
                    if key in result: raise ValueError('duplicate_key')
                    result[key] = value
                return result
            value = json.loads(body, object_pairs_hook=unique)
            if type(value) is not dict:
                raise ValueError('invalid_response')
            if response.status == 200:
                if (set(value) != {'request_id','state','replayed','result','environment',
                                  'publication','global_v1_accepted','agent_stopped'}
                        or value['request_id'] != proposal['request_id']
                        or type(value['replayed']) is not bool or type(value['agent_stopped']) is not bool
                        or value['environment'] != 'fixture' or value['publication'] is not False
                        or value['global_v1_accepted'] is not False):
                    raise ValueError('invalid_response')
                if value['state'] == 'unknown':
                    if value['result'] is not None: raise ValueError('invalid_response')
                elif value['state'] != 'completed' or type(value['result']) is not dict or not valid_success(proposal['command'], value['result']):
                    raise ValueError('invalid_response')
            return response.status, value
    except (ValueError, TimeoutError, OSError, HTTPException, RecursionError):
        return 503, {'error':'result_unknown_reconcile_required'}
