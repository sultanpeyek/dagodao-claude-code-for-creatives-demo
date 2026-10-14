# Claude Code for Creatives: demos

Two small apps built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), plus the GitHub Pages site that previews them. They accompany the "Claude Code for Creatives" talk at the DagoDAO peer sharing session. The slides live in the sibling repo [dagodao-claude-code-for-creatives](https://github.com/sultanpeyek/dagodao-claude-code-for-creatives) ([view slides](https://sultanpeyek.github.io/dagodao-claude-code-for-creatives/)).

Live site: https://sultanpeyek.github.io/dagodao-claude-code-for-creatives-demo/

## Demos

### Image swiper (`demo-1-final/`)

A photo organizer driven by swipe gestures. Swipe right to keep an image, left to archive it. Files move from `unorganized-files/` to `organized-files/` or `archives/`. The starting set is in `demo-1/unorganized-files/`.

```bash
cd demo-1-final
bun install
bun start
```

The server runs at http://localhost:3000. Stack: Node.js, Express, Hammer.js, vanilla JavaScript.

### Void vessels (`demo-2-final/`)

A procedural NFT ship generator. A numeric seed produces a deterministic wireframe spacecraft with a rarity tier and metadata, rendered with Three.js. Remotion renders the ships to PNG and video.

```bash
cd demo-2-final
bun install
bun dev
```

The server runs at http://localhost:3000, or at the port in `PORT`. It serves the viewer plus `/api/ship/:seed` and `/api/metadata/:id`.

Other scripts in `demo-2-final/package.json`:

| Script | Purpose |
|---|---|
| `bun start` | Run the server without file watching |
| `bun remotion:studio` | Open Remotion Studio to preview |
| `bun remotion:render` | Render ship PNGs and metadata |
| `bun remotion:render:video` | Render ship videos |
| `bun remotion:render:single-video` | Render one `VoidVesselVideo` composition as H.264 |

`demo-2-final/scripts/convert-mp4-to-webp.sh` converts rendered videos to WebP. See [demo-2-final/docs/COMMANDS.md](demo-2-final/docs/COMMANDS.md) for batch rendering, [ARCHITECTURE.md](demo-2-final/docs/ARCHITECTURE.md) and [RARITY.md](demo-2-final/docs/RARITY.md).

<p align="center">
  <img src="demo-2-final/previews/loop-test.webp" alt="Void Vessels preview" width="600">
</p>

## Project structure

```
.
├── index.html            Landing page for GitHub Pages
├── demo-1/               Unsorted sample photos for the image swiper
├── demo-1-final/         Image swiper app (Express)
├── demo-2-final/         Void Vessels app (Express, Three.js, Remotion)
├── demos/                Static previews published on GitHub Pages
│   ├── image-swiper/
│   └── void-vessels/
├── scripts/              Scripts that sync the previews from the apps
├── docs/                 SYNC.md and METADATA.md
├── assets/               Open Graph images
└── .meta.yaml            Single source for project metadata
```

## Deployment

GitHub Pages serves the repo root. The files in `demos/` are copies of source files in the apps: `demo-1-final/public/styles.css`, and `lib/`, `config/rarity.js` and `public/viewer.js` from `demo-2-final`. The workflow `.github/workflows/sync-demo-previews.yml` runs `scripts/sync-demos.sh` on pushes to `main` that touch those files, and commits the result. To run it by hand, use `./scripts/sync-demos.sh`, or add `--dry-run` to preview. See [docs/SYNC.md](docs/SYNC.md).

## Licence

MIT, as declared in `package.json`.

## Author

Built with Claude Code by [sultanpeyek](https://github.com/sultanpeyek).
