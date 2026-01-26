#!/usr/bin/env bash
# sync-demos.sh - Main sync script for all demos
#
# Usage: ./scripts/sync-demos.sh [--dry-run]
#
# FOR CLAUDE CODE AGENTS:
# - Syncs both Demo 1 and Demo 2 preview files
# - Demo 1: syncs base.css (base styles from demo-1-final)
# - Demo 2: syncs lib/, config/, and viewer.js (from demo-2-final)
# - Run with --dry-run to preview changes without modifying files
# - Called by GitHub Actions workflow on push to main

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Syncing Demo Previews ==="
echo ""

"$SCRIPT_DIR/sync-image-swiper-demo.sh" "$@"
echo ""
"$SCRIPT_DIR/sync-void-vessels-demo.sh" "$@"

echo ""
echo "=== All syncs complete ==="
