#!/bin/bash

# =============================================================================
# Convert MP4 to WebP
# =============================================================================
# A reusable script to convert MP4 video files to animated WebP format.
#
# Usage:
#   ./convert-mp4-to-webp.sh [options] [input_dir] [output_dir]
#
# Examples:
#   ./convert-mp4-to-webp.sh                    # Convert all MP4s in current dir
#   ./convert-mp4-to-webp.sh ./videos           # Convert MP4s in ./videos
#   ./convert-mp4-to-webp.sh ./videos ./webp    # Output to ./webp directory
#   ./convert-mp4-to-webp.sh -q 80 -f 15        # Custom quality and fps
#   ./convert-mp4-to-webp.sh -s 480:-1          # Resize to 480px width
# =============================================================================

set -e

# Default settings
QUALITY=75          # WebP quality (0-100, higher = better quality, larger file)
FPS=10              # Output frames per second
SCALE=""            # Scale filter (empty = keep original size)
LOOP=0              # Loop count (0 = infinite)
INPUT_DIR="."       # Default to current directory
OUTPUT_DIR=""       # Default to same as input
RECURSIVE=false     # Search recursively
OVERWRITE=false     # Overwrite existing files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print usage
usage() {
    echo "Usage: $0 [options] [input_dir] [output_dir]"
    echo ""
    echo "Options:"
    echo "  -q, --quality NUM    WebP quality 0-100 (default: $QUALITY)"
    echo "  -f, --fps NUM        Output FPS (default: $FPS)"
    echo "  -s, --scale WxH      Scale video (e.g., 480:-1 for 480px width)"
    echo "  -l, --loop NUM       Loop count, 0=infinite (default: $LOOP)"
    echo "  -r, --recursive      Search directories recursively"
    echo "  -y, --overwrite      Overwrite existing files"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Convert all MP4s in current dir"
    echo "  $0 ./videos                  # Convert MP4s in ./videos"
    echo "  $0 ./videos ./webp           # Output to ./webp directory"
    echo "  $0 -q 80 -f 15 -s 640:-1     # Custom settings"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -q|--quality)
            QUALITY="$2"
            shift 2
            ;;
        -f|--fps)
            FPS="$2"
            shift 2
            ;;
        -s|--scale)
            SCALE="$2"
            shift 2
            ;;
        -l|--loop)
            LOOP="$2"
            shift 2
            ;;
        -r|--recursive)
            RECURSIVE=true
            shift
            ;;
        -y|--overwrite)
            OVERWRITE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
        *)
            if [[ -z "$INPUT_DIR" || "$INPUT_DIR" == "." ]]; then
                INPUT_DIR="$1"
            elif [[ -z "$OUTPUT_DIR" ]]; then
                OUTPUT_DIR="$1"
            fi
            shift
            ;;
    esac
done

# Set output dir to input dir if not specified
if [[ -z "$OUTPUT_DIR" ]]; then
    OUTPUT_DIR="$INPUT_DIR"
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed.${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Check if input directory exists
if [[ ! -d "$INPUT_DIR" ]]; then
    echo -e "${RED}Error: Input directory '$INPUT_DIR' does not exist.${NC}"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Build video filter string
VF_FILTERS="fps=$FPS"
if [[ -n "$SCALE" ]]; then
    VF_FILTERS="$VF_FILTERS,scale=$SCALE"
fi

# Find MP4 files (portable approach for older Bash versions)
MP4_FILES=()
if [[ "$RECURSIVE" == true ]]; then
    while IFS= read -r -d '' file; do
        MP4_FILES+=("$file")
    done < <(find "$INPUT_DIR" -type f -iname "*.mp4" -print0 2>/dev/null)
else
    while IFS= read -r -d '' file; do
        MP4_FILES+=("$file")
    done < <(find "$INPUT_DIR" -maxdepth 1 -type f -iname "*.mp4" -print0 2>/dev/null)
fi

# Check if any MP4 files were found
if [[ ${#MP4_FILES[@]} -eq 0 ]]; then
    echo -e "${YELLOW}No MP4 files found in '$INPUT_DIR'${NC}"
    exit 0
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Converting MP4 to WebP${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Input:   ${GREEN}$INPUT_DIR${NC}"
echo -e "Output:  ${GREEN}$OUTPUT_DIR${NC}"
echo -e "Quality: ${GREEN}$QUALITY${NC}"
echo -e "FPS:     ${GREEN}$FPS${NC}"
if [[ -n "$SCALE" ]]; then
    echo -e "Scale:   ${GREEN}$SCALE${NC}"
fi
echo -e "Files:   ${GREEN}${#MP4_FILES[@]}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Counter for tracking progress
CONVERTED=0
SKIPPED=0
FAILED=0

# Convert each MP4 file
for INPUT_FILE in "${MP4_FILES[@]}"; do
    # Get filename without path and extension
    BASENAME=$(basename "$INPUT_FILE" .mp4)
    BASENAME=$(basename "$BASENAME" .MP4)

    # Determine output path
    if [[ "$OUTPUT_DIR" == "$INPUT_DIR" ]]; then
        OUTPUT_FILE="$(dirname "$INPUT_FILE")/${BASENAME}.webp"
    else
        OUTPUT_FILE="${OUTPUT_DIR}/${BASENAME}.webp"
    fi

    # Check if output file exists
    if [[ -f "$OUTPUT_FILE" && "$OVERWRITE" != true ]]; then
        echo -e "${YELLOW}Skipping:${NC} $BASENAME.mp4 (output exists, use -y to overwrite)"
        ((SKIPPED++))
        continue
    fi

    echo -e "${BLUE}Converting:${NC} $BASENAME.mp4 -> $BASENAME.webp"

    # Run ffmpeg conversion
    if ffmpeg -y -i "$INPUT_FILE" \
        -vf "$VF_FILTERS" \
        -vcodec libwebp \
        -lossless 0 \
        -compression_level 6 \
        -q:v "$QUALITY" \
        -loop "$LOOP" \
        -preset default \
        -an \
        "$OUTPUT_FILE" \
        -hide_banner -loglevel warning; then

        # Get file sizes for comparison
        INPUT_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
        OUTPUT_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

        echo -e "${GREEN}  ✓ Done${NC} ($INPUT_SIZE -> $OUTPUT_SIZE)"
        ((CONVERTED++))
    else
        echo -e "${RED}  ✗ Failed${NC}"
        ((FAILED++))
    fi
done

# Print summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Converted: $CONVERTED${NC}"
if [[ $SKIPPED -gt 0 ]]; then
    echo -e "${YELLOW}Skipped:   $SKIPPED${NC}"
fi
if [[ $FAILED -gt 0 ]]; then
    echo -e "${RED}Failed:    $FAILED${NC}"
fi
echo -e "${BLUE}========================================${NC}"
