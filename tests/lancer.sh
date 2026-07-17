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
# Playwright à la racine du repo (résolution ESM par répertoires ancêtres).
# --no-save --no-package-lock : n'écrit JAMAIS dans package.json ni le lock
# (c'est une dépendance de test à la demande, pas une dépendance du produit).
if [ ! -d ../node_modules/playwright ]; then
  (cd .. && npm i --no-save --no-package-lock --silent playwright@1.49)
fi

# 2. Unitaires Node purs (zéro réseau, zéro navigateur).
echo "=== unit-geocode.mjs ==="
node unit-geocode.mjs
echo "=== unit-secteur.mjs ==="
node unit-secteur.mjs
echo "=== unit-auth.mjs ==="
node unit-auth.mjs
echo "=== unit-adramelech-guard.mjs ==="
node unit-adramelech-guard.mjs
echo "=== unit-carto-generee.mjs ==="
node unit-carto-generee.mjs
echo "=== unit-idees-validate.mjs ==="
node unit-idees-validate.mjs

# 3. Serveur statique sur la racine du repo.
(cd .. && python3 -m http.server 8123 >/dev/null 2>&1) &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null || true' EXIT
sleep 1

# 4. Les harnais navigateur (chacun sort en erreur si un verdict échoue).
for h in smoke-console.mjs smoke-flux-fiche.mjs smoke-accueil.mjs smoke-accueil-etats.mjs smoke-connexion.mjs smoke-contacts.mjs smoke-secteur.mjs smoke-dictee.mjs smoke-geocode.mjs smoke-recherche.mjs smoke-antique.mjs smoke-arbre.mjs; do
  echo "=== $h ==="
  node "$h"
done
echo "=== TOUS LES HARNAIS VERTS ==="
