"""Preuves du seul schéma préparatoire ; uniquement dans l'isolation CI."""
import os

if os.environ.get('LV1_ISOLATED') != '1':
    raise RuntimeError('LV1_ISOLATED=1 required')

import hashlib
import json
import unittest
from unittest.mock import patch

from leo.control_r21 import protocol


class ControlR21ProtocolTests(unittest.TestCase):
    def proposal(self, **changes):
        return {'protocol_version': 1, 'request_id': 'request-1',
                'mission_id': 'mission_1', 'operation_id': 'operation-1',
                'command': 'status', 'expected_version': 1} | changes

    def body(self, **changes):
        return json.dumps(self.proposal(**changes)).encode('utf-8')

    def refused(self, body, code):
        with self.assertRaises(protocol.ProtocolError) as caught:
            protocol.decode(body)
        self.assertEqual(caught.exception.code, code)
        self.assertEqual(str(caught.exception), code)

    def test_four_commands_are_data_only(self):
        for command in ('status', 'execute', 'reconcile', 'stop'):
            with self.subTest(command=command):
                proposal = self.proposal(command=command)
                self.assertEqual(protocol.decode(self.body(command=command)), proposal)
                self.assertIsNot(protocol.validate(proposal), proposal)

    def test_byte_budget_and_utf8_are_strict(self):
        body = self.body()
        exact = body + b' ' * (protocol.MAX_BODY_BYTES - len(body))
        self.assertEqual(protocol.decode(exact), self.proposal())
        for value, code in ((exact + b' ', 'body_size'), (b'', 'body_size'),
                            (body.decode(), 'bytes_required'),
                            (bytearray(body), 'bytes_required'),
                            (b'\xff', 'utf8_required')):
            with self.subTest(code=code, kind=type(value).__name__):
                self.refused(value, code)
        unicode_body = self.body(request_id='é').replace(b'\\u00e9', 'é'.encode())
        self.refused(unicode_body, 'invalid_identifier')
        self.refused(unicode_body + b' ' * (protocol.MAX_BODY_BYTES - len(unicode_body) + 1),
                     'body_size')

    def test_duplicate_keys_include_escaped_aliases(self):
        for key in (b'command', b'comm\\u0061nd'):
            self.refused(self.body()[:-1] + b', "' + key + b'": "stop"}', 'duplicate_key')

    def test_exact_fields_refuse_authority_and_nested_values(self):
        for key in ('approved', 'approval', 'principal', 'mandate', 'secret',
                    'root', 'url', 'effects', 'schema_version'):
            with self.subTest(field=key):
                self.refused(self.body(**{key: 'untrusted'}), 'unexpected_fields')
        missing = self.proposal()
        del missing['operation_id']
        self.refused(json.dumps(missing).encode(), 'unexpected_fields')
        for value in ({'nested': True}, ['nested']):
            self.refused(self.body(request_id=value), 'nested_value')
        self.refused(b'[' * 4000 + b'0' + b']' * 4000, 'nested_value')
        self.refused(b'[]', 'object_required')

    def test_strict_versions_and_command_types(self):
        for value in (True, False, 0, 2, 1.0, '1', None):
            self.refused(self.body(protocol_version=value), 'invalid_protocol_version')
        for value in (True, False, 0, -1, 1.0, '1', None, protocol.MAX_VERSION + 1):
            self.refused(self.body(expected_version=value), 'invalid_expected_version')
        self.assertEqual(protocol.decode(self.body(expected_version=protocol.MAX_VERSION))
                         ['expected_version'], protocol.MAX_VERSION)
        for value in ('publish', 'STATUS', True, 1, None):
            self.refused(self.body(command=value), 'invalid_command')

    def test_identifier_bounds_and_controls(self):
        for name in ('request_id', 'mission_id', 'operation_id'):
            self.assertEqual(protocol.decode(self.body(**{name: 'A' * 128}))[name], 'A' * 128)
            for value in ('', 'A' * 129, '-a', 'a/b', 'a.b', 'a b', 'é',
                          'a\n', 'a\x00', '\ud800', True, 1, None):
                with self.subTest(name=name, value=repr(value)):
                    self.refused(self.body(**{name: value}), 'invalid_identifier')

    def test_malformed_json_and_nonfinite_numbers_are_refused(self):
        for body in (b'{', b'{"command":"raw\ncontrol"}', b'{} {}',
                     self.body().replace(b'"expected_version": 1', b'"expected_version": NaN')):
            self.refused(body, 'invalid_json')
        # Escaped syntax inside strings is scanned as data, then refused as identifier.
        self.refused(self.body(request_id='a"\\{['), 'invalid_identifier')

    def test_canonical_digest_is_order_independent_and_validated(self):
        proposal = self.proposal()
        canonical = (b'{"command":"status","expected_version":1,"mission_id":"mission_1",'
                     b'"operation_id":"operation-1","protocol_version":1,"request_id":"request-1"}')
        expected = hashlib.sha256(canonical).hexdigest()
        self.assertEqual(protocol.canonical_digest(proposal), expected)
        self.assertEqual(protocol.canonical_digest(dict(reversed(list(proposal.items())))), expected)
        self.assertNotEqual(protocol.canonical_digest(self.proposal(expected_version=2)), expected)
        with self.assertRaises(protocol.ProtocolError):
            protocol.canonical_digest(self.proposal(approved=True))

    def test_refusal_witness_detects_a_command_guard_mutant_in_memory(self):
        body = self.body(command='publish')
        self.refused(body, 'invalid_command')
        # Mutant borné en mémoire, restauré par mock ; aucun fichier/effet distant.
        with patch.object(protocol, 'COMMANDS', protocol.COMMANDS | {'publish'}):
            with self.assertRaises(AssertionError):
                self.refused(body, 'invalid_command')
        self.refused(body, 'invalid_command')
