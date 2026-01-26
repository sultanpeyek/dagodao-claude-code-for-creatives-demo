# Architecture

## Generation Pipeline

Ships are generated through a modular pipeline in `lib/`:

1. **SeededRandom** - Mulberry32 PRNG ensures deterministic generation from any seed
2. **Trait Selection** - Weighted random selection determines hull, wings, engines, details, special features, and background
3. **Geometry Generation** - Each trait type has its own generator (hulls, wings, engines, antennas, surface details, backgrounds)
4. **Geometry Merge** - All parts merged using Three.js BufferGeometryUtils
5. **Edge Extraction** - EdgesGeometry creates wireframe from merged mesh

## Key Patterns

- Hull dimensions accessed via `getHullDimensions()` for attachment positioning
- Server dynamically imports lib modules to avoid bundling Three.js

## Web Viewer

`public/viewer.js` handles:
- Three.js scene with orthographic camera and OrbitControls
- Real-time ship generation in browser
- PNG/JSON export
- URL parameter support for headless rendering

## Batch Generation

`scripts/batchGenerate.js` uses Puppeteer to:
- Render each ship in headless Chrome
- Wait for `#render-complete` element
- Capture PNG screenshots at 1024x1024
- Generate OpenSea-compatible metadata JSON
- Output to `output/images/` and `output/metadata/`
