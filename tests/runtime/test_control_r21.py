"""Régressions de la fondation R21, exécutables uniquement dans la CI isolée."""

import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

from leo.control_r21 import FoundationError, verify_foundation


ROOT = Path(__file__).parents[2]
FOUNDATION = ROOT / "leo" / "control_r21" / "foundation"
EXPECTED_MANIFEST_SHA = "6a540ee3574c3f65c45523da4722ce8710c6cf6ac142fafcc9d2184d6d2968b2"
EXPECTED_WORKFLOW_SHA = "5eb0a047388f5f2ec8967f51e487d7deea18f80c3cce66d11691abba4bf3b44f"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class ControlR21FoundationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.environ.get("LV1_ISOLATED") != "1":
            raise RuntimeError("test_control_r21.py requires the isolated LV1 CI")
        cls.manifest_sha = EXPECTED_MANIFEST_SHA
        cls.workflow_sha = EXPECTED_WORKFLOW_SHA

    def test_exact_foundation_is_read_only_and_has_no_authority(self):
        result = verify_foundation(
            FOUNDATION,
            expected_manifest_sha=self.manifest_sha,
            expected_workflow_sha=self.workflow_sha,
        )
        self.assertFalse(result["authority"])
        self.assertFalse(result["ready_to_import"])
        self.assertEqual(result["workflow_sha"], self.workflow_sha)

    def test_expected_workflow_sha_mutation_turns_harness_red(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            manifest = json.loads((candidate / "manifest.json").read_text())
            manifest["expected_workflow_sha"] = "0" * 64
            (candidate / "manifest.json").write_text(
                json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
            )
            mutated_manifest_sha = digest(candidate / "manifest.json")
            with self.assertRaisesRegex(FoundationError, "workflow_anchor_mismatch"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=mutated_manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

    def test_workflow_bytes_cannot_change_under_a_valid_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            with (candidate / "control-r21.yml").open("a") as stream:
                stream.write("# hostile mutation\n")
            with self.assertRaisesRegex(FoundationError, "file_digest_mismatch"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

    def test_unexpected_file_and_symlinked_root_are_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            (candidate / "unreviewed.txt").write_text("not in manifest\n")
            with self.assertRaisesRegex(FoundationError, "foundation_entries_mismatch"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

            link = Path(tmp) / "foundation-link"
            link.symlink_to(FOUNDATION, target_is_directory=True)
            with self.assertRaisesRegex(FoundationError, "foundation_root_invalid"):
                verify_foundation(
                    link,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

    def test_symlinked_member_and_oversized_file_are_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            workflow = candidate / "control-r21.yml"
            workflow.unlink()
            workflow.symlink_to(FOUNDATION / "control-r21.yml")
            with self.assertRaisesRegex(FoundationError, "foundation_file_unreadable"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

            shutil.rmtree(candidate)
            shutil.copytree(FOUNDATION, candidate)
            (candidate / "runner.py").write_bytes(b"x" * (1024 * 1024 + 1))
            with self.assertRaisesRegex(FoundationError, "foundation_file_too_large"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )

    def test_non_object_manifest_is_a_bounded_refusal(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            manifest = candidate / "manifest.json"
            manifest.write_text("[]\n")
            with self.assertRaisesRegex(FoundationError, "manifest_invalid_shape"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=digest(manifest),
                    expected_workflow_sha=self.workflow_sha,
                )

    def test_coordinated_package_mutation_cannot_replace_host_anchors(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = Path(tmp) / "foundation"
            shutil.copytree(FOUNDATION, candidate)
            workflow = candidate / "control-r21.yml"
            with workflow.open("a") as stream:
                stream.write("# coordinated hostile mutation\n")
            manifest = json.loads((candidate / "manifest.json").read_text())
            manifest["expected_workflow_sha"] = digest(workflow)
            manifest["files"]["control-r21.yml"] = digest(workflow)
            (candidate / "manifest.json").write_text(
                json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
            )
            with self.assertRaisesRegex(FoundationError, "manifest_anchor_mismatch"):
                verify_foundation(
                    candidate,
                    expected_manifest_sha=self.manifest_sha,
                    expected_workflow_sha=self.workflow_sha,
                )
