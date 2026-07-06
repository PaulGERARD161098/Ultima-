#!/usr/bin/env bash
# Harnais de vérification navigateur d'Ultima — tout local, zéro CDN.
# Usage : bash tests/lancer.sh   (depuis la racine du repo ou tests/)
set -euo pipefail
cd "$(dirname "$0")"
CACHE=.cache

# 1. Préparation (une fois) : fixture Leaflet depuis npm + Playwright.
mkdir -p "$CACHE"
if [ ! -f "$CACHE/package/dist/leaflet.js" ]; then
  (cd "$CACHE" && npm pack leaflet@1.9.4 --silent && tar -xzf leaflet-1.9.4.tgz package/dist/leaflet.js package/dist/leaflet.css)
fi
if [ ! -d "$CACHE/node_modules/playwright" ]; then
  (cd "$CACHE" && npm i --silent playwright@1.49)
fi
export NODE_PATH="$PWD/$CACHE/node_modules"

# 2. Serveur statique sur la racine du repo.
(cd .. && python3 -m http.server 8123 >/dev/null 2>&1) &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null || true' EXIT
sleep 1

# 3. Les harnais (chacun sort en erreur si un verdict échoue).
for h in smoke-flux-fiche.mjs smoke-accueil.mjs smoke-accueil-etats.mjs smoke-contacts.mjs; do
  echo "=== $h ==="
  node "$h"
done
echo "=== TOUS LES HARNAIS VERTS ==="
