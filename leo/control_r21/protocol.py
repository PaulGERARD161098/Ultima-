"""Propositions R21 préparatoires : données fermées, jamais une autorité.

La validation ne contrôle ni identité, accord, version courante, arrêt ou rejeu.
Ces contrôles appartiennent au futur hôte. Aucun transport n'est raccordé ici.
"""
import hashlib
import json
import re

MAX_BODY_BYTES = 16 * 1024
MAX_VERSION = (1 << 63) - 1
COMMANDS = frozenset({'status', 'execute', 'reconcile', 'stop'})
FIELDS = frozenset({'protocol_version', 'request_id', 'mission_id',
                    'operation_id', 'command', 'expected_version'})
# 1..128 caractères ASCII ; pas de séparateur de chemin, point ou espace.
IDENTIFIER = re.compile(r'[A-Za-z0-9][A-Za-z0-9_-]{0,127}', re.ASCII)


class ProtocolError(ValueError):
    """Code constant ; aucune donnée reçue n'est reproduite dans l'erreur."""
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def validate(proposal):
    """Valider une proposition fermée et retourner une copie des scalaires."""
    if type(proposal) is not dict:
        raise ProtocolError('object_required')
    if any(type(key) is not str for key in proposal) or set(proposal) != FIELDS:
        raise ProtocolError('unexpected_fields')
    if type(proposal['protocol_version']) is not int or proposal['protocol_version'] != 1:
        raise ProtocolError('invalid_protocol_version')
    if type(proposal['command']) is not str or proposal['command'] not in COMMANDS:
        raise ProtocolError('invalid_command')
    for name in ('request_id', 'mission_id', 'operation_id'):
        if type(proposal[name]) is not str or not IDENTIFIER.fullmatch(proposal[name]):
            raise ProtocolError('invalid_identifier')
    version = proposal['expected_version']
    if type(version) is not int or not 1 <= version <= MAX_VERSION:
        raise ProtocolError('invalid_expected_version')
    return dict(proposal)


def _flat_json(text):
    # Refuser l'imbrication avant le parseur, même pour une profondeur extrême.
    depth, quoted, escaped = 0, False, False
    for char in text:
        if quoted:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                quoted = False
        elif char == '"':
            quoted = True
        elif char in '{[':
            depth += 1
            if depth > 1:
                raise ProtocolError('nested_value')
        elif char in '}]':
            depth -= 1


def _unique(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ProtocolError('duplicate_key')
        result[key] = value
    return result


def _constant(_value):
    raise ProtocolError('invalid_json')


def decode(body):
    """Accepter uniquement des octets UTF-8 stricts, bornés à 16 Kio."""
    if type(body) is not bytes:
        raise ProtocolError('bytes_required')
    if not 0 < len(body) <= MAX_BODY_BYTES:
        raise ProtocolError('body_size')
    try:
        text = body.decode('utf-8', errors='strict')
    except UnicodeDecodeError:
        raise ProtocolError('utf8_required') from None
    _flat_json(text)
    try:
        proposal = json.loads(text, object_pairs_hook=_unique, parse_constant=_constant)
    except ProtocolError:
        raise
    except (ValueError, RecursionError):
        raise ProtocolError('invalid_json') from None
    return validate(proposal)


def canonical_digest(proposal):
    """SHA-256 du JSON canonique validé ; empreinte de données, pas reçu."""
    data = json.dumps(validate(proposal), sort_keys=True, separators=(',', ':'),
                      ensure_ascii=True, allow_nan=False).encode('ascii')
    return hashlib.sha256(data).hexdigest()
