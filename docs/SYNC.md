# Demo Preview Sync (SSOT)

GitHub Pages demos are automatically synced from source apps to ensure consistency.

## How It Works

| Source (SSOT) | Destination | Sync |
|---------------|-------------|------|
| `demo-1-final/public/styles.css` | `demos/image-swiper/base.css` | Direct copy |
| `demo-2-final/lib/*.js` | `demos/void-vessels/lib/` | Direct copy |
| `demo-2-final/config/rarity.js` | `demos/void-vessels/config/` | Direct copy |
| `demo-2-final/public/viewer.js` | `demos/void-vessels/viewer.js` | Path transform |

## Automatic Sync

Push to `main` triggers GitHub Actions when SSOT files change. The workflow:
1. Runs `./scripts/sync-demos.sh`
2. Commits changes with `[skip ci]`
3. Demos stay in sync automatically

## Manual Sync

```bash
# Preview changes
./scripts/sync-demos.sh --dry-run

# Apply sync
./scripts/sync-demos.sh
```

## Repository Structure

```
├── demos/
│   ├── image-swiper/           # Static demo preview
│   │   ├── base.css            # Synced from demo-1-final
│   │   └── demo.css            # Demo-specific styles
│   └── void-vessels/           # Live 3D demo (CDN)
│       ├── lib/                # Synced from demo-2-final
│       └── config/             # Synced from demo-2-final
├── scripts/
│   ├── sync-demos.sh           # Main entry point
│   ├── sync-image-swiper-demo.sh
│   └── sync-void-vessels-demo.sh
└── .github/workflows/
    └── sync-demo-previews.yml  # Auto-sync on push
```
