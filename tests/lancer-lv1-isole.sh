#!/usr/bin/env bash
# Lanceur de confiance : aucune variante « sans sandbox ».
# Image déjà disponible, identifiée par son ID immuable ; aucun téléchargement ici.
set -euo pipefail
if ! command -v docker >/dev/null; then
  echo 'BLOQUÉ : Docker indisponible ; aucun test exécuté.' >&2; exit 78
fi
image="${LV1_NODE_IMAGE:-}"
if [[ ! "$image" =~ ^sha256:[a-f0-9]{64}$ ]]; then
  echo 'BLOQUÉ : LV1_NODE_IMAGE doit désigner une image locale par son ID sha256.' >&2; exit 78
fi
docker image inspect "$image" >/dev/null
racine="$(cd "$(dirname "$0")/.." && pwd)"
# Sous-répertoires explicites ; pas de .git, .env, mémoire, home, socket ou secrets.
montages=()
for dossier in api js tests finubar; do
  [[ -d "$racine/$dossier" && ! -L "$racine/$dossier" ]] || exit 78
  montages+=(--mount "type=bind,src=$racine/$dossier,dst=/travail/$dossier,readonly")
done
exec docker run --rm --pull never --network none --read-only \
  --cap-drop ALL --security-opt no-new-privileges --pids-limit 64 \
  --memory 512m --cpus 1 --user 65534:65534 \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m --workdir /travail \
  "${montages[@]}" \
  --mount "type=bind,src=$racine/package.json,dst=/travail/package.json,readonly" \
  --entrypoint node "$image" tests/run-lv1.mjs
