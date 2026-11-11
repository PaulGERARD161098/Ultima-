"""Frozen service entry, offline one-shot only. Never initializes/resets state."""
import argparse
from dataclasses import fields
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time

# -I bootstrap only from this operator-installed, reviewed code tree.
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))

from finubar.leo_control import ControlLatch, assert_host_private
from leo.control_r21.pilot_build import SERVICE_FILES
from leo.control_r21.pilot_host import code_digest
from leo.control_r21.read_candidate import ReadBroker, ReadLaunchConfig, SnapshotAdapter, WorkerPlan
from leo.control_r21.read_launcher import _read_fixed
from leo.control_r21.read_reaper import ReadReaper
from leo.runtime.memoire import MissionStore
from leo.runtime.policy import Mandate, Refusal

KEYS={'kind','id','source_sha','target_sha','integration_sha','code_digest','code_paths',
      'code_root','state_root','image','worker_sha256','snapshot_sha256','principal',
      'mission','operation_id','expected_version','approved','review'}


def load_installation(path, *, _root=None):
    path=Path(path)
    if not path.is_absolute() or any(p.is_symlink() for p in path.parents):
        raise Refusal('private_service_configuration_required')
    assert_host_private(path,(path.parent,),'private_service_configuration_required')
    value=json.loads(_read_fixed(path,16384))
    root=ROOT if _root is None else Path(_root)  # trusted isolated verification seam
    if (type(value) is not dict or set(value)!=KEYS or value['kind']!='offline_read_service'
            or not re.fullmatch(r'[a-f0-9]{32}',value['id'])
            or value['code_root']!=str(root) or value['code_paths']!=sorted(SERVICE_FILES)
            or not all(type(value[k]) is str and re.fullmatch('[a-f0-9]{40}',value[k])
                       for k in ('source_sha','target_sha','integration_sha'))
            or value['code_digest']!=code_digest(root,sorted(SERVICE_FILES))
            or value['state_root']!='/var/lib/leo-read/'+value['id']
            or type(value['approved']) is not bool
            or type(value['review']) is not dict
            or set(value['review'])!={'reviewer','location','measured_at'}):
        raise Refusal('frozen_service_configuration_mismatch')
    return value


def run(value):
    # Human-owned configuration only, immutable to service under ProtectSystem.
    if (value['approved'] is not True or any(type(v) is not str or not v.strip()
            for v in value['review'].values())):
        raise Refusal('read_service_not_approved')
    if (any(type(value[k]) is not str or not re.fullmatch('[a-f0-9]{64}',value[k])
            for k in ('worker_sha256','snapshot_sha256'))
            or any(type(value[k]) is not str or not value[k] for k in ('principal','mission','operation_id'))
            or type(value['expected_version']) is not int or value['expected_version']<1):
        raise Refusal('read_service_operation_not_frozen')
    broker=existing_broker(value)
    broker.execute(value['principal'],{'action':'read_source','operation_id':value['operation_id'],
                                      'expected_version':value['expected_version']})
    # Receipt stays private in the existing journal, no public stdout.


def existing_broker(value):
    state=Path(value['state_root'])
    db=state/'mission.sqlite'
    assert_host_private(db,(state,),'private_service_state_required')
    latch=ControlLatch(state/'control.sqlite')
    # Existing canonical mission and budget must be installed by operator.
    canonical=MissionStore(db).read_mission(value['mission'],value['principal'])
    mandate=canonical['mandat']
    if set(mandate)!={f.name for f in fields(Mandate)}:
        raise Refusal('canonical_service_mandate_invalid')
    list_fields={'actors','repositories','actions','quadrants','required_checks'}
    arguments=dict(mandate)
    for key in list_fields:
        if type(arguments[key]) is not list or any(type(v) is not str for v in arguments[key]):
            raise Refusal('canonical_service_mandate_invalid')
        arguments[key]=frozenset(arguments[key])
    worker=ROOT/'leo/control_r21/read_worker.py'
    snapshot=state/'snapshot.json'
    raw=_read_fixed(snapshot,32768)
    if hashlib.sha256(raw).hexdigest()!=value['snapshot_sha256']:
        raise Refusal('read_service_snapshot_changed')
    broker=ReadBroker(db,Mandate(**arguments),snapshot_adapter=SnapshotAdapter(json.loads(raw)),
        clock=time.time,control_latch=latch,launch_config=ReadLaunchConfig(
            WorkerPlan(value['image'],worker,snapshot),value['worker_sha256'],state/'claims',max_seconds=30))
    return broker


def cleanup(value):
    state=Path(value['state_root'])
    latch=ControlLatch(state/'control.sqlite')  # absence is failure, never initialize
    return ReadReaper(state/'claims',latch).run()


def reconcile(value):
    if any(type(value[k]) is not str or not value[k] for k in ('principal','mission','operation_id')):
        raise Refusal('read_service_operation_not_frozen')
    broker=existing_broker(value)
    operation=broker.store.get_operation(value['mission'],value['principal'],value['operation_id'])
    if operation is None: raise Refusal('read_service_receipt_missing')
    if operation['status']=='completed':
        result=broker.reconcile_completed(value['principal'],value['operation_id'])
    else:
        result=broker.reconcile_interrupted(value['principal'],value['operation_id'])
    return {'status':result['status'],'replayed':False}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation',choices=('run','cleanup','reconcile'))
    parser.add_argument('--installation',type=Path,required=True)
    args=parser.parse_args()
    try:
        config=load_installation(args.installation)
        if os.geteuid()==65534:
            raise Refusal('service_host_uid_must_differ_from_worker')
        if args.operation=='run': run(config)
        elif args.operation=='cleanup': cleanup(config)
        else: print(json.dumps(reconcile(config),sort_keys=True))
    except Exception:
        # Neither configuration, proposal, private results nor raw Docker output.
        sys.stderr.write('offline_read_service_refused\n')
        return 1
    return 0


if __name__=='__main__':
    raise SystemExit(main())
