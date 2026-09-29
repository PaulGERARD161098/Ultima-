"""R23 isolation witnesses: CI container only. Never skipped or run on the host."""
import errno
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import unittest


_SECRET_NAMES = {
    'GITHUB_TOKEN', 'GH_TOKEN', 'FINUBAR_GITHUB_TOKEN', 'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ACCESS_TOKEN',
    'DATABASE_URL', 'POSTGRES_URL', 'PGPASSWORD', 'VERCEL_TOKEN',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
    'GOOGLE_APPLICATION_CREDENTIALS', 'CRON_SECRET', 'RESEND_API_KEY',
    'STRIPE_SECRET_KEY', 'SLACK_BOT_TOKEN', 'NPM_TOKEN',
    'ACTIONS_RUNTIME_TOKEN', 'ACTIONS_ID_TOKEN_REQUEST_TOKEN',
}


def probe():
    if os.environ.get('LV1_ISOLATED') != '1':
        raise RuntimeError('Isolation required: refusing to execute probes outside LV1 container')
    result = {'network_blocked': False, 'write_blocked': False,
              'secrets_absent': not any(key in os.environ for key in _SECRET_NAMES),
              'tmp_writable': False}
    # TEST-NET-1 reserved documentation address, no DNS or third-party endpoint.
    # A timeout/refused service is NOT proof of network isolation.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(0.25)
        try:
            connection.connect(('192.0.2.1', 9))
        except OSError as error:
            result['network_blocked'] = error.errno in (errno.ENETUNREACH, errno.EACCES, errno.EPERM)
    try:
        descriptor = os.open('/lv1-ecriture-interdite', os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except OSError as error:
        result['write_blocked'] = error.errno in (errno.EROFS, errno.EACCES, errno.EPERM)
    else:
        os.close(descriptor)
        # Preserve the failed witness: no cleanup concealing a write violation.
    with tempfile.TemporaryFile(dir='/tmp') as writable:
        writable.write(b'fixture')
        writable.seek(0)
        result['tmp_writable'] = writable.read() == b'fixture'
    return result


class IsolationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # An absent flag is a hard failure, never a skip or a host probe.
        if os.environ.get('LV1_ISOLATED') != '1':
            raise RuntimeError('LV1_ISOLATED=1 required; runtime suite must run in its isolated CI container')

    def test_parent_isolation(self):
        self.assertEqual(probe(), dict(network_blocked=True, write_blocked=True,
                                      secrets_absent=True, tmp_writable=True))
        self.assertEqual(os.getuid(), 65534)

    def test_child_inherits_isolation(self):
        code = "import json,runpy,sys; scope=runpy.run_path(sys.argv[1]); print(json.dumps(scope['probe']()))"
        child = subprocess.run([sys.executable, '-c', code, str(Path(__file__).resolve())],
                               capture_output=True, text=True, timeout=5, check=True)
        self.assertEqual(json.loads(child.stdout), dict(network_blocked=True, write_blocked=True,
                                                       secrets_absent=True, tmp_writable=True))

    def test_missing_isolation_flag_refuses_without_probe(self):
        environment = dict(os.environ)
        environment.pop('LV1_ISOLATED', None)
        code = "import runpy,sys; scope=runpy.run_path(sys.argv[1]); scope['probe']()"
        child = subprocess.run([sys.executable, '-c', code, str(Path(__file__).resolve())],
                               env=environment, capture_output=True, text=True, timeout=5)
        self.assertNotEqual(child.returncode, 0)
        self.assertIn('Isolation required: refusing', child.stderr)


if __name__ == '__main__':
    unittest.main()
