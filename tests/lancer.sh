#!/usr/bin/env bash
# Harnais de vérification navigateur d'Ultima — tout local, zéro CDN.
# Usage : bash tests/lancer.sh   (depuis la racine du repo ou tests/)
set -euo pipefail
cd "$(dirname "$0")"
CACHE=.cache

# Dépendances verrouillées dans package-lock.json ; npm ci à la racine.
if [ ! -d ../node_modules/playwright ]; then
  (cd .. && npm ci --ignore-scripts)
fi
mkdir -p "$CACHE"
# Le navigateur installé par Playwright, ou le chemin fourni par l'environnement.
export PW_CHROMIUM="${PW_CHROMIUM:-$(node --input-type=module -e 'import {chromium} from "playwright"; process.stdout.write(chromium.executablePath())')}"

# Découverte automatique : ajouter un test suffit pour qu'il soit exécuté.
node run-unit.mjs

# 3. Serveur statique sur la racine du repo.
(cd .. && exec python3 -m http.server 8123 --bind 127.0.0.1 >/dev/null 2>&1) &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null || true' EXIT
sleep 1
if ! kill -0 "$SERVEUR" 2>/dev/null; then
  echo "Impossible de démarrer le serveur de test (port 8123 occupé ?)" >&2
  exit 1
fi

# 4. Les harnais navigateur (chacun sort en erreur si un verdict échoue).
# Répartition déterministe et exhaustive ; chaque groupe CI a son propre conteneur.
groupe=${SMOKE_SHARD_INDEX:-0}
groupes=${SMOKE_SHARD_COUNT:-1}
if [[ ! "$groupe" =~ ^[0-9]$ || ! "$groupes" =~ ^[1-8]$ ]] || (( groupe >= groupes )); then
  echo 'Groupe navigateur invalide.' >&2; exit 2
fi
shopt -s nullglob
harnais=(smoke-*.mjs)
if (( ${#harnais[@]} < groupes )); then
  echo 'Couverture navigateur vide ou groupes trop nombreux.' >&2; exit 2
fi
executes=0
for i in "${!harnais[@]}"; do
  if (( i % groupes != groupe )); then continue; fi
  h=${harnais[$i]}
  echo "=== $h ==="
  node "$h"
  executes=$((executes + 1))
done
echo "=== GROUPE $groupe/$groupes VERT : $executes harnais sur ${#harnais[@]} au total ==="
