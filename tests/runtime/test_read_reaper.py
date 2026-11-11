import hashlib
import json
import os
from pathlib import Path
import tempfile
import unittest

from finubar.leo_control import ControlLatch
from leo.control_r21.read_reaper import ReadReaper, owner_label, IDENTITY_FORMAT
from leo.runtime.policy import Refusal


class ReaperTests(unittest.TestCase):
    def setUp(self):
        if os.environ.get('LV1_ISOLATED')!='1': raise RuntimeError('isolated_runtime_required')
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.claims=self.root/'claims'; self.claims.mkdir(mode=0o700)
        self.latch=ControlLatch(self.root/'control.sqlite',initialize=True)
        self.name='leo-read-'+'a'*32; self.cid='b'*64
        self.claim=self.claims/('c'*64+'.claim')
        self.claim.write_text(self.name+'\n'); self.claim.chmod(0o600)
        registration=Path(str(self.claim)+'.container')
        registration.write_text(json.dumps({'container':self.name,'cid':self.cid})); registration.chmod(0o600)
        owner=self
        class Docker:
            active=True
            wrong_owner=False
            missing_observation=False
            rm_raises=False
            close_raises=False
            calls=[]
            def close(self):
                if self.close_raises: raise OSError('synthetic_close_failure')
            def call(self,args):
                self.calls.append(args)
                if args[:2]==('container','ls'):
                    if self.missing_observation: return 1,b'',b''
                    return 0,(owner.cid+'\n').encode() if self.active else b'',b''
                if args[0]=='inspect':
                    label='d'*64 if self.wrong_owner else owner_label(owner.name)
                    return 0,(owner.cid+'|/'+owner.name+'|'+label+'\n').encode(),b''
                if args[0]=='rm':
                    if self.rm_raises: raise OSError('synthetic_rm_failure')
                    self.active=False
                    return 0,b'',b''
                raise AssertionError(args)
        self.fake=Docker()

    def run_reaper(self): return ReadReaper(self.claims,self.latch,_transport=self.fake).run()

    def test_stops_removes_exact_owner_and_preserves_claim(self):
        result=self.run_reaper()
        self.assertTrue(result['container_cleanup_confirmed'])
        self.assertFalse(result['replayed'])
        self.assertTrue(self.claim.exists())
        self.assertTrue(self.latch.stopped())
        self.assertIn(('rm','--force',self.cid),self.fake.calls)
        proof=json.loads(Path(str(self.claim)+'.reaper').read_bytes())
        self.assertEqual(proof['reason'],'outer_cleanup')
        self.assertEqual(self.run_reaper(),result)
        self.assertEqual(sum(c[0]=='rm' for c in self.fake.calls),1)

    def test_unrelated_container_label_never_removed(self):
        self.fake.wrong_owner=True
        with self.assertRaisesRegex(Refusal,'read_reaper_owner_mismatch'): self.run_reaper()
        self.assertFalse(any(c[0]=='rm' for c in self.fake.calls))
        self.assertFalse(Path(str(self.claim)+'.reaper').exists())

    def test_renamed_registered_cid_never_looks_like_absence(self):
        self.name='leo-read-'+'e'*32
        with self.assertRaisesRegex(Refusal,'read_reaper_owner_mismatch'): self.run_reaper()
        self.assertFalse(any(c[0]=='rm' for c in self.fake.calls))
        self.assertFalse(Path(str(self.claim)+'.reaper').exists())

    def test_observation_failure_is_not_absence(self):
        self.fake.missing_observation=True
        with self.assertRaisesRegex(Refusal,'read_reaper_observation_unknown'): self.run_reaper()
        self.assertFalse(any(c[0]=='rm' for c in self.fake.calls))

    def test_remove_exception_still_observes_and_never_confirms(self):
        self.fake.rm_raises=True
        with self.assertRaisesRegex(Refusal,'read_reaper_removal_unconfirmed'): self.run_reaper()
        self.assertEqual(sum(c[:2]==('container','ls') for c in self.fake.calls),3)
        self.assertFalse(Path(str(self.claim)+'.reaper').exists())

    def test_close_failure_still_removes_without_positive_proof(self):
        self.fake.close_raises=True
        with self.assertRaisesRegex(Refusal,'read_reaper_create_or_client_unknown'): self.run_reaper()
        self.assertIn(('rm','--force',self.cid),self.fake.calls)
        self.assertFalse(Path(str(self.claim)+'.reaper').exists())

    def test_unknown_create_never_attests_absence_as_success(self):
        Path(str(self.claim)+'.container').unlink()
        self.fake.active=False
        with self.assertRaisesRegex(Refusal,'read_reaper_create_or_client_unknown'): self.run_reaper()
        self.assertFalse(Path(str(self.claim)+'.reaper').exists())

    def test_symlink_claim_is_refused(self):
        self.claim.unlink(); self.claim.symlink_to(self.root/'secret')
        with self.assertRaises(Refusal): self.run_reaper()
        self.assertFalse(self.fake.calls)

    def test_one_frozen_operation_limit_prevents_unbounded_cleanup(self):
        other=self.claims/('d'*64+'.claim')
        other.write_text(self.name+'\n'); other.chmod(0o600)
        with self.assertRaisesRegex(Refusal,'read_reaper_claim_limit_or_shape'): self.run_reaper()
        self.assertFalse(self.fake.calls)

    def test_corrupt_claim_does_not_choose_docker_target(self):
        self.claim.write_text('other-container\n')
        with self.assertRaisesRegex(Refusal,'read_reaper_claim_invalid'): self.run_reaper()
        self.assertFalse(self.fake.calls)
