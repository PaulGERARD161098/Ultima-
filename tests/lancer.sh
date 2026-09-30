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

# En CI, le job navigateur est découpé en lots parallèles (LOT=i/N, voir
# .github/workflows/tests.yml) ; les tests unitaires y ont leur propre job.
# Sans LOT, en local, tout tourne, comme avant.
# `node lots.mjs` sort en erreur sur un LOT invalide ou un lot vide, et
# `set -e` arrête alors le lanceur au lieu de jouer zéro harnais en vert.
if [ -n "${LOT:-}" ]; then
  HARNAIS=$(node lots.mjs "$LOT")
else
  # Découverte automatique : ajouter un test suffit pour qu'il soit exécuté.
  node run-unit.mjs
  HARNAIS=$(node lots.mjs 1/1)
fi

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
for h in $HARNAIS; do
  echo "=== $h ==="
  node "$h"
done
echo "=== TOUS LES HARNAIS VERTS${LOT:+ (lot $LOT)} ==="
