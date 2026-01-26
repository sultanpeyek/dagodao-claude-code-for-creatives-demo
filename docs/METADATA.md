# Metadata Configuration

All metadata is defined in `.meta.yaml` as the single source of truth.

## Commands

| Command | Description |
|---------|-------------|
| `/apply-metadata` | Sync metadata values to target files |
| `/apply-metadata --init` | Initialize metadata for a new project |
| `/apply-metadata --check` | Audit metadata consistency |
| `/apply-metadata --show` | Display current configuration |

## Target Files

The metadata sync updates:
- `package.json` fields (name, version, description, author)
- HTML meta tags
- Manifest files
- OG images and favicons (generated if missing)
