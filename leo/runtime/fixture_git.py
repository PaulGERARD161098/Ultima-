"""Adaptateur limité aux dépôts Git nus d'épreuve, sans remote ni hooks.

La transaction Git vérifie source ET cible lors de la mise à jour. Aucun adapter
GitHub de fusion réelle n'est offert : ses garanties atomiques doivent être
établies séparément avant activation.
"""
import os
from pathlib import Path
import re
import selectors
import subprocess
import time
from .policy import Refusal

SHA = re.compile(r'^[0-9a-f]{40}$')
REF = re.compile(r'^refs/heads/[A-Za-z0-9][A-Za-z0-9_/-]{0,100}$')


class FixtureGit:
    effects = frozenset({'update_fixture_ref'})
    atomic = True

    def __init__(self, root, repository):
        self.root = Path(root).resolve(strict=True)
        raw = Path(repository)
        self.repository = raw.resolve(strict=True)
        if raw.is_symlink() or self.repository == self.root or self.root not in self.repository.parents:
            raise Refusal('fixture_path_denied')
        if (self.repository / 'LV1_FIXTURE').read_text() != 'isolated-fiction-only\n':
            raise Refusal('fixture_marker_missing')
        if self.git('rev-parse', '--is-bare-repository').strip() != 'true':
            raise Refusal('bare_fixture_required')
        if self.git('remote').strip():
            raise Refusal('remote_forbidden')

    def _command(self, *arguments):
        # Aucun environnement Git/credential du parent transmis.
        env = {'PATH': '/usr/bin:/bin', 'LC_ALL': 'C', 'GIT_CONFIG_NOSYSTEM': '1',
               'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_TERMINAL_PROMPT': '0'}
        command = ['git', '--no-replace-objects', '-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false',
                            '-c', 'log.showSignature=false',
                            '--git-dir', str(self.repository), *arguments]
        return command, env

    def git(self, *arguments, stdin=None):
        command, env = self._command(*arguments)
        r = subprocess.run(command,
                           input=stdin, text=True, capture_output=True, timeout=10, env=env)
        if r.returncode:
            # Aucun contenu de repo ou de stderr injecté dans une réponse du contrôleur.
            raise Refusal('git_operation_refused')
        return r.stdout

    def _merge_transaction(self, context):
        # --no-deref alone can replace a symbolic ref. Inspect its type AFTER
        # prepare locks both named refs, before commit releases either lock.
        command, env = self._command('update-ref', '--no-deref', '--stdin')
        with subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                              stderr=subprocess.DEVNULL, env=env) as process:
            try:
                process.stdin.write((
                    'start\n'
                    f'verify {context.source_ref} {context.source}\n'
                    f'update {context.target_ref} {context.integration} {context.target}\n'
                    'prepare\n').encode('ascii'))
                process.stdin.flush()
                deadline = time.monotonic() + 10
                output = b''
                with selectors.DefaultSelector() as selector:
                    selector.register(process.stdout, selectors.EVENT_READ)
                    while output != b'start: ok\nprepare: ok\n':
                        remaining = deadline - time.monotonic()
                        if remaining <= 0 or not selector.select(remaining):
                            raise Refusal('git_transaction_timeout')
                        chunk = os.read(process.stdout.fileno(), 4096)
                        if not chunk or len(output) + len(chunk) > 4096:
                            raise Refusal('git_operation_refused')
                        output += chunk
                for ref in (context.source_ref, context.target_ref):
                    observed = self.git('for-each-ref', '--format=%(refname) %(symref)', ref)
                    if observed != ref + ' \n':
                        raise Refusal('symbolic_or_missing_ref')
                output, _ = process.communicate(b'commit\n', timeout=10)
                if process.returncode or output != b'commit: ok\n':
                    raise Refusal('git_operation_refused')
            finally:
                if process.poll() is None:
                    # Git's normal termination handler releases its lock files.
                    # A stuck process is killed; leftover locks fail closed.
                    process.terminate()
                    try:
                        process.communicate(timeout=2)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.communicate()

    def merge(self, context, *, pre_transaction=None):
        if context.repository != str(self.repository) or context.environment != 'fixture':
            raise Refusal('fixture_context_mismatch')
        if context.mode != 'integration_commit':
            raise Refusal('merge_mode_denied')
        if any(not SHA.fullmatch(v) for v in (context.source, context.target, context.integration)):
            raise Refusal('invalid_commit')
        if any(not REF.fullmatch(v) or '..' in v or '//' in v or v.endswith('/')
               for v in (context.source_ref, context.target_ref)) or context.source_ref == context.target_ref:
            raise Refusal('invalid_ref')
        # Le commit d'intégration lui-même doit relier exactement les deux têtes éprouvées.
        parents = self.git('show', '-s', '--format=%P', context.integration).strip().split()
        if parents != [context.target, context.source]:
            raise Refusal('integration_parents_mismatch')
        if pre_transaction is not None:
            # Injection de course exclusivement par le harnais hôte de confiance.
            pre_transaction()
        self._merge_transaction(context)
        observed = self.git('rev-parse', context.target_ref).strip()
        if observed != context.integration:
            raise Refusal('post_merge_divergence')
        return {'commit': observed, 'environment': 'fixture', 'publication': False}

    def lookup(self, context):
        if context.repository != str(self.repository) or not REF.fullmatch(context.target_ref):
            raise Refusal('invalid_context')
        head = self.git('rev-parse', context.target_ref).strip()
        return {'status': 'completed' if head == context.integration else 'unknown', 'commit': head}
