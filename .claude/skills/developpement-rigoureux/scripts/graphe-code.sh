#!/usr/bin/env bash
# Graphe du code d'un dépôt (Graphify, Apache-2.0, version épinglée), en local :
# analyse syntaxique, aucun modèle, aucun envoi réseau pour le code.
# Le dépôt n'est jamais modifié : on analyse une copie de HEAD dans un dossier
# temporaire. Usage :
#   graphe-code.sh construire [dépôt]        → construit le graphe
#   graphe-code.sh expliquer "symbole"        → qui l'appelle, ce qu'il appelle
#   graphe-code.sh chemin "fichierA" "fichierB"
#   graphe-code.sh question "texte"           → parcours du graphe (2000 tokens max)
set -euo pipefail
VERSION="0.9.122"
BASE="${GRAPHE_CODE_DIR:-${TMPDIR:-/tmp}/graphe-code}"
VENV="$BASE/venv"; COPIE="$BASE/copie"; G="$VENV/bin/graphify"
installer() {
  [ -x "$G" ] && "$VENV/bin/pip" show graphifyy 2>/dev/null | grep -q "^Version: $VERSION$" && return
  python3 -m venv "$VENV" && "$VENV/bin/pip" install -q "graphifyy==$VERSION"
}
cmd="${1:-}"; shift || true
case "$cmd" in
  construire)
    depot="$(cd "${1:-.}" && git rev-parse --show-toplevel)"
    installer; rm -rf "$COPIE"; mkdir -p "$BASE"
    git -C "$depot" archive HEAD --prefix=copie/ | tar -x -C "$BASE"
    (cd "$COPIE" && "$G" update . --no-cluster) ;;
  expliquer) (cd "$COPIE" && "$G" explain "$@") ;;
  chemin)    (cd "$COPIE" && "$G" path "$@") ;;
  question)  (cd "$COPIE" && "$G" query "$@") ;;
  *) echo "usage : graphe-code.sh construire|expliquer|chemin|question" >&2; exit 2 ;;
esac
