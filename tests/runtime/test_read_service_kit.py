import json
import os
from pathlib import Path
import tempfile
import unittest

from leo.control_r21.pilot_build import build_read_service, SERVICE_FILES
from leo.control_r21.read_service_entry import load_installation, run
from leo.runtime.policy import Refusal


class ServiceKitTests(unittest.TestCase):
    def setUp(self):
        if os.environ.get('LV1_ISOLATED')!='1': raise RuntimeError('isolated_runtime_required')
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        self.source=Path(__file__).resolve().parents[2]
        self.output=self.root/'candidate'
        self.result=build_read_service(self.source,self.output,'a'*40,'python@sha256:'+'b'*64,'c'*40,'d'*40)
        self.path=self.output/'installation.json'
        self.config=json.loads(self.path.read_bytes())
        # Private isolated fixture remaps code_root only; no service installed.
        self.config['code_root']=str(self.output/'code')
        self.path.write_text(json.dumps(self.config)); self.path.chmod(0o600)
        self.output.chmod(0o700)

    def load(self): return load_installation(self.path,_root=self.output/'code')

    def test_inert_kit_contains_exact_files_and_no_state_seed(self):
        self.assertFalse(self.result['installed']); self.assertFalse(self.result['approved'])
        self.assertEqual(self.config['code_paths'],sorted(SERVICE_FILES))
        self.assertEqual(self.load(),self.config)
        self.assertFalse((self.output/'r21-state').exists())
        self.assertFalse(list(self.output.rglob('mission.sqlite')))
        with self.assertRaisesRegex(Refusal,'read_service_not_approved'): run(self.load())

    def test_changed_frozen_code_is_rejected(self):
        target=self.output/'code/leo/control_r21/read_reaper.py'
        target.write_text(target.read_text()+'\n# mutation\n')
        with self.assertRaisesRegex(Refusal,'frozen_service_configuration_mismatch'): self.load()

    def test_unit_has_external_cleanup_and_no_replay_timer(self):
        unit=next(self.output.glob('*.service')).read_text()
        self.assertIn('ExecStopPost=',unit)
        self.assertIn('KillMode=control-group',unit)
        self.assertIn('Restart=no',unit)
        self.assertIn('ProtectSystem=strict',unit)
        self.assertNotIn('[Install]',unit)
        self.assertNotIn('PrivateTmp=yes',unit)
        self.assertNotIn('@ID@',unit)

    def test_existing_output_never_overwritten(self):
        with self.assertRaises(FileExistsError):
            build_read_service(self.source,self.output,'a'*40,'python@sha256:'+'b'*64,'c'*40,'d'*40)
