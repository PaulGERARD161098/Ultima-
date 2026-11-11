"""Outer FINUBAR cleanup after service scope loss. Never launches/replays.

Invoke from operator-owned service manager after its host scope was terminated.
Claims and latch belong to that installation exclusively, never to a worker.
"""
import hashlib
import json
import os
from pathlib import Path
import re

from finubar.leo_control import ControlLatch, assert_host_private
from leo.control_r21.read_launcher import DockerTransport, _read_fixed
from leo.runtime.policy import Refusal
from leo.control_r21.read_watchdog import _write_record

OWNER_LABEL = 'leo.read.owner'
IDENTITY_FORMAT = '{{.Id}}|{{.Name}}|{{index .Config.Labels "leo.read.owner"}}'
MAX_CLAIMS = 1  # one frozen operation per service installation; at most five 15s metadata calls


def owner_label(name):
    return hashlib.sha256(name.encode('ascii')).hexdigest()


def presence_args(cid):
    return ('container','ls','--all','--quiet','--no-trunc','--filter','id='+cid)


def absence_args(name):
    return ('container','ls','--all','--quiet','--no-trunc','--filter','name=^/'+name+'$')


class ReadReaper:
    def __init__(self, claims, latch, *, _transport=None):
        claims=Path(claims)
        if type(latch) is not ControlLatch or not claims.is_absolute() or not claims.is_dir():
            raise Refusal('private_reaper_scope_required')
        if (claims.is_symlink() or any(p.is_symlink() for p in claims.parents)
                or claims.stat().st_uid != os.geteuid() or claims.stat().st_mode & 0o077):
            raise Refusal('private_reaper_scope_required')
        self.claims,self.latch=claims,latch
        self.transport= DockerTransport() if _transport is None else _transport

    def run(self):
        # Durable STOP does not wait for SQLite and blocks a new guardian/start.
        self.latch._bury('owner_stop')
        claims=[]
        for index,path in enumerate(self.claims.iterdir()):
            if index>=16:
                raise Refusal('read_reaper_directory_limit')
            if path.name.endswith('.claim'):
                if len(claims)>=MAX_CLAIMS or not re.fullmatch(r'[a-f0-9]{64}\.claim',path.name):
                    raise Refusal('read_reaper_claim_limit_or_shape')
                assert_host_private(path,(self.claims,),'private_reaper_scope_required')
                claims.append(path)
        results=[]
        close_error=False
        try: self.transport.close()
        except Exception: close_error=True
        for claim in sorted(claims):
            raw=_read_fixed(claim,64)
            if not re.fullmatch(b'leo-read-[a-f0-9]{32}\n',raw):
                raise Refusal('read_reaper_claim_invalid')
            name=raw[:-1].decode('ascii')
            registration=Path(str(claim)+'.container')
            expected_cid=None
            if registration.exists():
                assert_host_private(registration,(self.claims,),'private_reaper_scope_required')
                registered=json.loads(_read_fixed(registration,1024))
                if (type(registered) is not dict or set(registered)!={'container','cid'}
                        or registered['container']!=name or type(registered['cid']) is not str
                        or not re.fullmatch('[a-f0-9]{64}',registered['cid'])):
                    raise Refusal('read_reaper_registration_invalid')
                expected_cid=registered['cid']
            rc,out,_=self.transport.call(presence_args(expected_cid) if expected_cid else absence_args(name))
            if rc != 0:
                raise Refusal('read_reaper_observation_unknown')
            if out.strip():
                if not re.fullmatch(b'[a-f0-9]{64}\n?',out):
                    raise Refusal('read_reaper_identity_unknown')
                cid=out.strip().decode('ascii')
                if expected_cid is not None and cid!=expected_cid:
                    raise Refusal('read_reaper_registered_identity_mismatch')
                code,identity,_=self.transport.call(('inspect','--format',IDENTITY_FORMAT,cid))
                expected=(cid+'|/'+name+'|'+owner_label(name)+'\n').encode('ascii')
                if code != 0 or identity != expected:
                    # Never delete a bystander merely because a claim names it.
                    raise Refusal('read_reaper_owner_mismatch')
                removed,observed,remaining=-1,-1,b'unknown'
                try: removed,_,_=self.transport.call(('rm','--force',cid))
                except Exception: pass
                try: observed,remaining,_=self.transport.call(presence_args(cid))
                except Exception: pass
                named,named_remaining=-1,b'unknown'
                try: named,named_remaining,_=self.transport.call(absence_args(name))
                except Exception: pass
                if removed != 0 or observed != 0 or remaining.strip() or named!=0 or named_remaining.strip():
                    raise Refusal('read_reaper_removal_unconfirmed')
            elif expected_cid is not None:
                named,named_remaining,_=self.transport.call(absence_args(name))
                if named!=0 or named_remaining.strip():
                    raise Refusal('read_reaper_reserved_name_unknown')
            if close_error or expected_cid is None:
                raise Refusal('read_reaper_create_or_client_unknown')
            proof={'container':name,'cid':expected_cid,'reason':'outer_cleanup','container_removed':True}
            target=Path(str(claim)+'.reaper')
            if target.exists():
                assert_host_private(target,(self.claims,),'private_reaper_scope_required')
                if json.loads(_read_fixed(target,1024)) != proof:
                    raise Refusal('read_reaper_proof_conflict')
            else:
                _write_record(target,proof)
            results.append(proof)
        if close_error:
            raise Refusal('read_reaper_client_unknown')
        return {'container_cleanup_confirmed':True,'claims':len(results),'replayed':False}
