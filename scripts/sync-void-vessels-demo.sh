#!/usr/bin/env bash
# sync-void-vessels-demo.sh
# Syncs demo-2-final source files to demos/void-vessels
#
# SSOT:
#   - lib/*.js (direct copy)
#   - config/rarity.js (direct copy)
#   - viewer.js (path transformation: '/lib/' -> './lib/')
#
# FOR CLAUDE CODE AGENTS:
# - Ship generation logic is shared between full app and demo
# - Only difference is import paths (absolute vs relative)
# - Full app uses '/lib/' (served by Express)
# - Demo uses './lib/' (relative for GitHub Pages static hosting)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE_DIR="$REPO_ROOT/demo-2-final"
DEST_DIR="$REPO_ROOT/demos/void-vessels"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

log() { echo "[Void Vessels] $1"; }

# Validate sources
for path in "$SOURCE_DIR/lib" "$SOURCE_DIR/config" "$SOURCE_DIR/public/viewer.js"; do
    [[ ! -e "$path" ]] && echo "[ERROR] Not found: $path" && exit 1
done

log "Syncing Void Vessels demo..."
log "Source: $SOURCE_DIR"
log "Dest:   $DEST_DIR"

if $DRY_RUN; then
    log "DRY RUN - Would copy lib/, config/, and transform viewer.js"
    exit 0
fi

mkdir -p "$DEST_DIR/lib" "$DEST_DIR/config"

log "Copying lib/ files..."
cp "$SOURCE_DIR/lib"/*.js "$DEST_DIR/lib/"

log "Copying config/ files..."
cp "$SOURCE_DIR/config"/*.js "$DEST_DIR/config/"

log "Transforming viewer.js (absolute -> relative paths)..."
sed -e "s|from '/lib/|from './lib/|g" \
    -e "s|from '/config/|from './config/|g" \
    -e "s|// Import local modules$|// Import local modules (relative paths for GitHub Pages)|" \
    "$SOURCE_DIR/public/viewer.js" > "$DEST_DIR/viewer.js"

log "Sync complete!"
