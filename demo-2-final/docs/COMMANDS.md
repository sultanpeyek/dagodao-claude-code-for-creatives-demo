# Void Vessels - Command Reference

Complete guide for generating PNG images, videos, and WebP files for the Void Vessels NFT collection.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Development Server](#development-server)
- [PNG Generation with Metadata](#png-generation-with-metadata)
- [Video Generation](#video-generation)
- [WebP Conversion](#webp-conversion)
- [Remotion Studio](#remotion-studio)
- [Complete Pipeline Example](#complete-pipeline-example)
- [Output Structure](#output-structure)

---

## Quick Start

```bash
# Install dependencies
bun install

# Start Remotion Studio for preview
bun remotion:studio

# Generate PNG images (ships 1-10)
bun remotion:render 1 10

# Generate MP4 videos (ships 1-10)
bun remotion:render:video 1 10

# Convert videos to WebP
./scripts/convert-mp4-to-webp.sh ./output/videos ./output/webp
```

---

## Development Server

Start the development server to preview ships interactively.

### Commands

```bash
# Start with hot reload (development)
bun dev

# Start production server
bun start
```

### Server URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Interactive viewer |
| `http://localhost:3000?seed=42` | View specific seed |
| `http://localhost:3000/api/ship/:seed` | Ship data JSON |
| `http://localhost:3000/api/metadata/:tokenId` | OpenSea metadata |

---

## PNG Generation with Metadata

Generate PNG images with OpenSea-compatible metadata JSON files using Remotion.

### Command

```bash
bun remotion:render [startId] [count]

# Or directly
bun scripts/renderShips.ts [startId] [count]
```

### Examples

```bash
# Render ships 1-5 as PNG
bun remotion:render 1 5

# Render ships 50-60 (10 ships)
bun remotion:render 50 10

# Render ships 100-199 (100 ships)
bun remotion:render 100 100
```

### Output

- `output/images/{tokenId}.png` - 1024x1024 PNG image
- `output/metadata/{tokenId}.json` - OpenSea metadata

---

## Video Generation

Generate MP4 videos with cinematic camera movements.

### Command

```bash
bun remotion:render:video [startId] [count]

# Or directly
bun scripts/renderShips.ts --video [startId] [count]
```

### Examples

```bash
# Generate videos for ships 1-5
bun remotion:render:video 1 5

# Generate videos for ships 100-110
bun remotion:render:video 100 10
```

### Video Specifications

| Property | Value |
|----------|-------|
| Resolution | 1024x1024 |
| Frame Rate | 30 FPS |
| Duration | ~5 seconds |
| Codec | H.264 |
| Format | MP4 |

### Camera Movements

Videos include 5 dramatic camera angles:
1. **Establishing Shot** - Wide view with zoom
2. **Close-up Detail** - Detail view
3. **Hero Front** - Dramatic front angle
4. **Side Sweep** - Rotation movement
5. **Loop Return** - Seamless loop end

### Output

- `output/videos/{tokenId}.mp4` - Video file
- Metadata includes `animation_url` field for NFT standards

---

## WebP Conversion

Convert MP4 videos to animated WebP format for web optimization.

### Command

```bash
./scripts/convert-mp4-to-webp.sh [options] [input_dir] [output_dir]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-q, --quality` | WebP quality (0-100) | 75 |
| `-f, --fps` | Output frames per second | 10 |
| `-s, --scale` | Resize (e.g., `480:-1`) | original |
| `-l, --loop` | Loop count (0 = infinite) | 0 |
| `-r, --recursive` | Search subdirectories | false |
| `-y, --overwrite` | Overwrite existing files | false |
| `-h, --help` | Show help | - |

### Examples

```bash
# Convert all MP4s in output/videos to WebP
./scripts/convert-mp4-to-webp.sh ./output/videos

# Convert with custom output directory
./scripts/convert-mp4-to-webp.sh ./output/videos ./output/webp

# High quality, 15 FPS
./scripts/convert-mp4-to-webp.sh -q 90 -f 15 ./output/videos

# Resize to 480px width, lower quality for smaller files
./scripts/convert-mp4-to-webp.sh -q 60 -s 480:-1 ./output/videos

# Overwrite existing and search recursively
./scripts/convert-mp4-to-webp.sh -y -r ./output/videos ./output/webp
```

### Quality Guide

| Use Case | Recommended Settings |
|----------|---------------------|
| Web preview | `-q 60 -f 10 -s 480:-1` |
| Social media | `-q 75 -f 15` |
| High quality | `-q 90 -f 24` |
| Maximum compression | `-q 50 -f 8 -s 320:-1` |

---

## Remotion Studio

Interactive visual editor for previewing and testing compositions.

```bash
bun remotion:studio
```

Opens at `http://localhost:3001` with:
- Real-time preview of ships
- Timeline controls
- Props editor for seed testing
- Export options

---

## Complete Pipeline Example

Full workflow from generation to deployment-ready assets.

```bash
# 1. Install dependencies
bun install

# 2. Generate PNG images with metadata (ships 1-100)
bun remotion:render 1 100

# 3. Generate MP4 videos (ships 1-100)
bun remotion:render:video 1 100

# 4. Convert videos to WebP
./scripts/convert-mp4-to-webp.sh -q 80 -f 15 ./output/videos ./output/webp
```

### Batch Processing Large Collections

For large collections (1000+ items), process in batches:

```bash
# Generate in batches of 100
for i in $(seq 1 100 1000); do
  echo "Generating batch starting at $i..."
  bun remotion:render $i 100
  bun remotion:render:video $i 100
done

# Convert all videos to WebP
./scripts/convert-mp4-to-webp.sh -y ./output/videos ./output/webp
```

---

## Output Structure

```
output/
├── images/
│   ├── 1.png
│   ├── 2.png
│   └── ...
├── metadata/
│   ├── 1.json
│   ├── 2.json
│   └── ...
├── videos/
│   ├── 1.mp4
│   ├── 2.mp4
│   └── ...
└── webp/
    ├── 1.webp
    ├── 2.webp
    └── ...
```

### Metadata Format (OpenSea Standard)

```json
{
  "name": "Void Vessel #1",
  "description": "A procedurally generated wireframe spacecraft...",
  "image": "ipfs://YOUR_CID/1.png",
  "animation_url": "ipfs://YOUR_CID/1.mp4",
  "external_url": "https://voidvessels.io/ship/1",
  "attributes": [
    { "trait_type": "Hull Type", "value": "Stealth" },
    { "trait_type": "Wing Configuration", "value": "Mega Wings" },
    { "trait_type": "Engine Count", "value": "Cluster" },
    { "trait_type": "Detail Density", "value": "Extreme" },
    { "trait_type": "Special Feature", "value": "Void Engine" },
    { "trait_type": "Background", "value": "Void Space" },
    { "display_type": "number", "trait_type": "Rarity Score", "value": 35 },
    { "trait_type": "Rarity Tier", "value": "Legendary" },
    { "display_type": "number", "trait_type": "Generation Seed", "value": 1 }
  ]
}
```

---

## Bun Scripts Reference

All available bun scripts in `package.json`:

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `bun server.js` | Start production server |
| `dev` | `bun --watch server.js` | Start dev server with hot reload |
| `remotion:studio` | `npx remotion studio` | Open Remotion visual editor |
| `remotion:render` | `bun scripts/renderShips.ts` | Render still images |
| `remotion:render:video` | `bun scripts/renderShips.ts --video` | Render videos |
| `remotion:render:single-video` | `npx remotion render ...` | Single video with H.264 |

---

## Troubleshooting

### FFmpeg not found or missing libwebp encoder

The WebP conversion requires ffmpeg with libwebp support. The default homebrew ffmpeg may not include it.

```bash
# Install FFmpeg with full codec support including libwebp (macOS)
brew tap homebrew-ffmpeg/ffmpeg
brew install homebrew-ffmpeg/ffmpeg/ffmpeg --with-webp

# Verify installation
ffmpeg -version
ffmpeg -encoders | grep webp  # Should show libwebp
```

If you already have ffmpeg installed without libwebp:
```bash
brew uninstall ffmpeg
brew tap homebrew-ffmpeg/ffmpeg
brew install homebrew-ffmpeg/ffmpeg/ffmpeg --with-webp
```

### Out of memory during batch generation
```bash
# Process in smaller batches
bun remotion:render 1 50
bun remotion:render 51 50
# ... continue in batches of 50
```

### Remotion rendering issues
```bash
# Try with xcodebuild GL renderer
npx remotion render remotion/src/index.ts VoidVessel --gl=angle --props='{"seed": 1}'
```
