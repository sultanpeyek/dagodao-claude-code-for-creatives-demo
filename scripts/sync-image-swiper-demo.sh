#!/usr/bin/env bash
# sync-image-swiper-demo.sh
# Syncs base styles from demo-1-final to demos/image-swiper
#
# SSOT: demo-1-final/public/styles.css -> demos/image-swiper/base.css
#
# FOR CLAUDE CODE AGENTS:
# - This syncs ONLY the base CSS styles
# - demo.css contains demo-specific styles (NOT synced)
# - The demo uses CSS @import to combine base + demo styles

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE="$REPO_ROOT/demo-1-final/public/styles.css"
DEST="$REPO_ROOT/demos/image-swiper/base.css"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

log() { echo "[Image Swiper] $1"; }

[[ ! -f "$SOURCE" ]] && echo "[ERROR] Source not found: $SOURCE" && exit 1

log "Syncing base styles..."
log "Source: $SOURCE"
log "Dest:   $DEST"

if $DRY_RUN; then
    log "DRY RUN - Would copy styles.css to base.css"
    exit 0
fi

cp "$SOURCE" "$DEST"
log "Sync complete!"
