"""Vérification hors effet de la fondation destinée au dépôt de contrôle R21.

Ce module ne déclenche aucun workflow et ne fabrique aucune approbation. Les
empreintes attendues sont fournies par l'hôte de confiance : le manifeste
transféré reste une donnée non autoritative.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat


SHA256 = re.compile(r"[0-9a-f]{64}")
REQUIRED_FILES = frozenset({"control-r21.yml", "runner.py"})
ALLOWED_ENTRIES = REQUIRED_FILES | {"manifest.json"}
MAX_FILE_SIZE = 1024 * 1024


class FoundationError(ValueError):
    """La préparation ne correspond pas aux ancres détenues par l'hôte."""


def _sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def _read_file(root_fd: int, name: str) -> bytes:
    """Lire une seule fois un fichier régulier, relativement à la racine figée."""

    if not hasattr(os, "O_NOFOLLOW"):
        raise FoundationError("nofollow_unavailable")
    flags = os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0)
    try:
        fd = os.open(name, flags, dir_fd=root_fd)
    except OSError as error:
        raise FoundationError("foundation_file_unreadable") from error
    try:
        details = os.fstat(fd)
        if not stat.S_ISREG(details.st_mode):
            raise FoundationError("foundation_file_not_regular")
        if details.st_size > MAX_FILE_SIZE:
            raise FoundationError("foundation_file_too_large")
        with os.fdopen(fd, "rb", closefd=False) as stream:
            content = stream.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise FoundationError("foundation_file_too_large")
        return content
    finally:
        os.close(fd)


def _digest(value: object, label: str) -> str:
    if not isinstance(value, str) or SHA256.fullmatch(value) is None:
        raise FoundationError(f"invalid_{label}")
    return value


def verify_foundation(
    root: str | Path,
    *,
    expected_manifest_sha: str,
    expected_workflow_sha: str,
) -> dict[str, object]:
    """Relit la préparation sans l'exécuter et sans suivre de lien symbolique.

    ``expected_manifest_sha`` et ``expected_workflow_sha`` doivent être ancrés
    hors du paquet transféré. Les recopier depuis ``manifest.json`` annulerait
    précisément la séparation de confiance recherchée.
    """

    expected_manifest_sha = _digest(expected_manifest_sha, "manifest_sha")
    expected_workflow_sha = _digest(expected_workflow_sha, "workflow_sha")
    if not hasattr(os, "O_DIRECTORY") or not hasattr(os, "O_NOFOLLOW"):
        raise FoundationError("secure_directory_open_unavailable")
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0)
    try:
        root_fd = os.open(os.fspath(root), flags)
    except OSError as error:
        raise FoundationError("foundation_root_invalid") from error
    try:
        if set(os.listdir(root_fd)) != ALLOWED_ENTRIES:
            raise FoundationError("foundation_entries_mismatch")
        manifest_bytes = _read_file(root_fd, "manifest.json")
        if _sha256(manifest_bytes) != expected_manifest_sha:
            raise FoundationError("manifest_anchor_mismatch")
        try:
            manifest = json.loads(manifest_bytes)
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise FoundationError("manifest_invalid_json") from error
        if not isinstance(manifest, dict):
            raise FoundationError("manifest_invalid_shape")
        if manifest.get("contract_version") != "1.1":
            raise FoundationError("contract_version_mismatch")
        if manifest.get("destination_repository") != "leo-control-r21":
            raise FoundationError("destination_repository_mismatch")
        if manifest.get("authority") != "none-preparation-only":
            raise FoundationError("unexpected_authority")
        if manifest.get("expected_workflow_sha") != expected_workflow_sha:
            raise FoundationError("workflow_anchor_mismatch")

        files = manifest.get("files")
        if not isinstance(files, dict) or set(files) != REQUIRED_FILES:
            raise FoundationError("file_inventory_mismatch")
        contents = {}
        for name, digest in files.items():
            path_name = PurePosixPath(name)
            if path_name.is_absolute() or ".." in path_name.parts:
                raise FoundationError("unsafe_file_name")
            expected = _digest(digest, "file_sha")
            contents[name] = _read_file(root_fd, name)
            if _sha256(contents[name]) != expected:
                raise FoundationError("file_digest_mismatch")
        if _sha256(contents["control-r21.yml"]) != expected_workflow_sha:
            raise FoundationError("workflow_digest_mismatch")
    finally:
        os.close(root_fd)
    return {
        "contract_version": "1.1",
        "destination_repository": "leo-control-r21",
        "workflow_sha": expected_workflow_sha,
        "authority": False,
        "ready_to_import": False,
    }
