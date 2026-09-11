#!/usr/bin/env bash
# Harnais de vérification navigateur d'Ultima — tout local, zéro CDN.
# Usage : bash tests/lancer.sh   (depuis la racine du repo ou tests/)
set -euo pipefail
cd "$(dirname "$0")"
CACHE=.cache

# 1. Préparation (une fois) : Playwright.
# La fixture Leaflet a disparu le 2026-08-13 avec la carte : plus une seule
# ressource tierce dans Ultima, donc plus rien à mettre en cache ni à stuber.
mkdir -p "$CACHE"
# Playwright à la racine du repo (résolution ESM par répertoires ancêtres).
# --no-save --no-package-lock : n'écrit JAMAIS dans package.json ni le lock
# (c'est une dépendance de test à la demande, pas une dépendance du produit).
if [ ! -d ../node_modules/playwright ]; then
  (cd .. && npm i --no-save --no-package-lock --silent playwright@1.49)
fi

# 2. Unitaires Node purs (zéro réseau, zéro navigateur).
echo "=== unit-finubar-rappel.mjs ==="
node unit-finubar-rappel.mjs
echo "=== unit-lecons-empreinte.mjs ==="
node unit-lecons-empreinte.mjs
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
echo "=== unit-intendant-api.mjs ==="
node unit-intendant-api.mjs
echo "=== unit-leo-voix.mjs ==="
node unit-leo-voix.mjs
echo "=== unit-leo-mains.mjs ==="
node unit-leo-mains.mjs
echo "=== unit-idees-carto.mjs ==="
node unit-idees-carto.mjs
echo "=== unit-abaque.mjs ==="
node unit-abaque.mjs
echo "=== unit-reshiram-validate.mjs ==="
node unit-reshiram-validate.mjs
echo "=== unit-reshiram-reseau.mjs ==="
node unit-reshiram-reseau.mjs
echo "=== unit-zekrom-validate.mjs ==="
node unit-zekrom-validate.mjs
echo "=== unit-imladrik-validate.mjs ==="
node unit-imladrik-validate.mjs
echo "=== unit-imladrik-drive.mjs ==="
node unit-imladrik-drive.mjs
echo "=== unit-draukhain-validate.mjs ==="
node unit-draukhain-validate.mjs
echo "=== unit-vranesh-validate.mjs ==="
node unit-vranesh-validate.mjs
echo "=== unit-draukhain-futurs.mjs ==="
node unit-draukhain-futurs.mjs
echo "=== unit-imladrik-passerelles.mjs ==="
node unit-imladrik-passerelles.mjs
echo "=== unit-registre-lv3.mjs ==="
node unit-registre-lv3.mjs
echo "=== unit-althea-progression.mjs ==="
node unit-althea-progression.mjs
echo "=== unit-althea-validate.mjs ==="
node unit-althea-validate.mjs
echo "=== unit-relation-pilotage.mjs ==="
node unit-relation-pilotage.mjs
echo "=== unit-riven-detail.mjs ==="
node unit-riven-detail.mjs
echo "=== unit-adaptateur-lv4.mjs ==="
node unit-adaptateur-lv4.mjs
echo "=== unit-finubar.mjs ==="
node unit-finubar.mjs
echo "=== unit-adaptateur-finubar.mjs ==="
node unit-adaptateur-finubar.mjs
echo "=== unit-leo-partout.mjs ==="
node unit-leo-partout.mjs
echo "=== unit-finubar-mesure-git.mjs ==="
node unit-finubar-mesure-git.mjs

echo "=== unit-finubar-matin.mjs ==="
node unit-finubar-matin.mjs

# 3. Serveur statique sur la racine du repo.
(cd .. && python3 -m http.server 8123 >/dev/null 2>&1) &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null || true' EXIT
sleep 1

# 4. Les harnais navigateur (chacun sort en erreur si un verdict échoue).
for h in smoke-ecrire.mjs smoke-boussole.mjs smoke-alpha.mjs smoke-tao.mjs smoke-console.mjs smoke-quadrants.mjs smoke-idees.mjs smoke-abaque.mjs smoke-reshiram.mjs smoke-zekrom.mjs smoke-imladrik.mjs smoke-imladrik-carto.mjs smoke-draukhain.mjs smoke-vranesh.mjs smoke-leo-accueil.mjs smoke-intendant.mjs smoke-flux-fiche.mjs smoke-accueil.mjs smoke-accueil-etats.mjs smoke-connexion.mjs smoke-contacts.mjs smoke-secteur.mjs smoke-dictee.mjs smoke-geocode.mjs smoke-antique.mjs smoke-csp.mjs smoke-ciel.mjs smoke-lv4-ciel.mjs smoke-lv4-coque.mjs smoke-lv5-fond.mjs smoke-lv5-plein-ecran.mjs smoke-lv5-passerelle.mjs smoke-fond-contraste.mjs smoke-stellaire.mjs smoke-serie.mjs smoke-pilotage.mjs smoke-althea.mjs smoke-finubar.mjs smoke-accueil-finubar.mjs smoke-leo-partout.mjs; do
  echo "=== $h ==="
  node "$h"
done
echo "=== TOUS LES HARNAIS VERTS ==="
