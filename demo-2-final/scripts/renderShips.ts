import { execSync } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// @ts-expect-error - JS module
import { SeededRandom } from "../lib/seededRandom.js";
// @ts-expect-error - JS module
import { selectTraits } from "../lib/shipGenerator.js";
// @ts-expect-error - JS module
import { calculateRarityScore, getRarityTier, formatTraitValue } from "../config/rarity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "output");
const IMAGES_DIR = path.join(OUTPUT_DIR, "images");
const VIDEOS_DIR = path.join(OUTPUT_DIR, "videos");
const METADATA_DIR = path.join(OUTPUT_DIR, "metadata");

interface ShipResult {
  tokenId: number;
  seed: number;
  traits: Record<string, string>;
  rarityScore: number;
}

/**
 * Generate metadata object (matching batchGenerate.js format)
 */
function generateMetadata(
  tokenId: number,
  shipData: { seed: number; traits: Record<string, string>; rarityScore: number },
  imageUri: string
) {
  const { traits, rarityScore, seed } = shipData;
  const rarityTier = getRarityTier(rarityScore);

  return {
    name: `Void Vessel #${tokenId}`,
    description: `A procedurally generated wireframe spacecraft from the Void Vessels collection. Seed: ${seed}`,
    image: imageUri,
    external_url: `https://voidvessels.io/ship/${tokenId}`,
    attributes: [
      { trait_type: "Hull Type", value: formatTraitValue(traits.hull) },
      { trait_type: "Wing Configuration", value: formatTraitValue(traits.wingConfig) },
      { trait_type: "Engine Count", value: formatTraitValue(traits.engineCount) },
      { trait_type: "Detail Density", value: formatTraitValue(traits.detailDensity) },
      { trait_type: "Special Feature", value: formatTraitValue(traits.specialFeatures) },
      { trait_type: "Background", value: formatTraitValue(traits.background) },
      { display_type: "number", trait_type: "Rarity Score", value: rarityScore },
      { trait_type: "Rarity Tier", value: rarityTier },
      { display_type: "number", trait_type: "Generation Seed", value: seed },
    ],
  };
}

async function renderShips(startId: number = 1, count: number = 3) {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Void Vessels - Remotion Renderer                        ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // Ensure output directories exist
  await mkdir(IMAGES_DIR, { recursive: true });
  await mkdir(METADATA_DIR, { recursive: true });

  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🚀 Rendering ${count} ships starting from ID ${startId}\n`);

  const results: ShipResult[] = [];

  for (let i = 0; i < count; i++) {
    const tokenId = startId + i;
    const seed = tokenId; // Use tokenId as seed for reproducibility

    process.stdout.write(`[${i + 1}/${count}] Rendering ship #${tokenId}...`);

    try {
      const outputPath = path.join(IMAGES_DIR, `${tokenId}.png`);

      // Use Remotion CLI with --gl=angle for proper WebGL support
      execSync(
        `npx remotion still remotion/src/index.ts VoidVessel "${outputPath}" --props='{"seed": ${seed}}' --gl=angle`,
        {
          cwd: PROJECT_ROOT,
          stdio: "pipe",  // Suppress output
        }
      );

      // Generate ship data for metadata
      const rng = new SeededRandom(seed);
      const traits = selectTraits(rng);
      const rarityScore = calculateRarityScore(traits);

      const shipData = { seed, traits, rarityScore };

      // Generate and save metadata
      const imageUri = `ipfs://YOUR_CID/${tokenId}.png`;
      const metadata = generateMetadata(tokenId, shipData, imageUri);
      await writeFile(
        path.join(METADATA_DIR, `${tokenId}.json`),
        JSON.stringify(metadata, null, 2)
      );

      results.push({ tokenId, seed, traits, rarityScore });
      console.log(" ✓");
    } catch (error) {
      console.log(` ✗ Error: ${(error as Error).message}`);
    }
  }

  // Generate summary
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Rendering Complete                                      ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log(`✓ Success: ${results.length}`);
  console.log(`✗ Failed: ${count - results.length}`);
  console.log(`\n📁 Images: ${IMAGES_DIR}`);
  console.log(`📁 Metadata: ${METADATA_DIR}`);

  // Rarity distribution
  if (results.length > 0) {
    console.log("\n📊 Rarity Distribution:");
    const scores = results.map((s) => s.rarityScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    console.log(`   Average Score: ${avgScore.toFixed(1)}`);
    console.log(`   Min Score: ${minScore}`);
    console.log(`   Max Score: ${maxScore}`);

    // Trait frequency
    console.log("\n📊 Hull Type Distribution:");
    const hullCounts: Record<string, number> = {};
    results.forEach((s) => {
      const hull = s.traits.hull;
      hullCounts[hull] = (hullCounts[hull] || 0) + 1;
    });
    Object.entries(hullCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([hull, cnt]) => {
        const percent = ((cnt / results.length) * 100).toFixed(1);
        console.log(`   ${hull}: ${cnt} (${percent}%)`);
      });
  }

  // Save summary
  const summaryPath = path.join(OUTPUT_DIR, "generation-summary.json");
  await writeFile(
    summaryPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        renderer: "remotion",
        startId,
        count,
        success: results.length,
        failed: count - results.length,
        ships: results,
      },
      null,
      2
    )
  );
  console.log(`\n📄 Summary saved to: ${summaryPath}\n`);
}

/**
 * Render video files with camera transitions
 */
async function renderVideos(startId: number = 1, count: number = 3) {
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Void Vessels - Video Renderer                           ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  // Ensure output directories exist
  await mkdir(VIDEOS_DIR, { recursive: true });
  await mkdir(METADATA_DIR, { recursive: true });

  console.log(`📁 Output directory: ${VIDEOS_DIR}`);
  console.log(`🎬 Rendering ${count} videos starting from ID ${startId}\n`);

  const results: ShipResult[] = [];

  for (let i = 0; i < count; i++) {
    const tokenId = startId + i;
    const seed = tokenId;

    process.stdout.write(`[${i + 1}/${count}] Rendering video #${tokenId}...`);

    try {
      const outputPath = path.join(VIDEOS_DIR, `${tokenId}.mp4`);

      // Use Remotion CLI for video rendering with H.264 codec
      execSync(
        `npx remotion render remotion/src/index.ts VoidVesselVideo "${outputPath}" --props='{"seed": ${seed}}' --gl=angle --codec=h264`,
        {
          cwd: PROJECT_ROOT,
          stdio: "pipe",
        }
      );

      // Generate ship data for metadata
      const rng = new SeededRandom(seed);
      const traits = selectTraits(rng);
      const rarityScore = calculateRarityScore(traits);

      const shipData = { seed, traits, rarityScore };

      // Generate and save metadata (with video URI)
      const videoUri = `ipfs://YOUR_CID/${tokenId}.mp4`;
      const metadata = generateMetadata(tokenId, shipData, videoUri);
      metadata.animation_url = videoUri; // Add animation_url for video
      await writeFile(
        path.join(METADATA_DIR, `${tokenId}-video.json`),
        JSON.stringify(metadata, null, 2)
      );

      results.push({ tokenId, seed, traits, rarityScore });
      console.log(" ✓");
    } catch (error) {
      console.log(` ✗ Error: ${(error as Error).message}`);
    }
  }

  // Generate summary
  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Video Rendering Complete                                ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");

  console.log(`✓ Success: ${results.length}`);
  console.log(`✗ Failed: ${count - results.length}`);
  console.log(`\n📁 Videos: ${VIDEOS_DIR}`);
  console.log(`📁 Metadata: ${METADATA_DIR}`);

  // Save summary
  const summaryPath = path.join(OUTPUT_DIR, "video-generation-summary.json");
  await writeFile(
    summaryPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        renderer: "remotion-video",
        startId,
        count,
        success: results.length,
        failed: count - results.length,
        ships: results,
      },
      null,
      2
    )
  );
  console.log(`\n📄 Summary saved to: ${summaryPath}\n`);
}

// CLI interface
const args = process.argv.slice(2);
const isVideoMode = args.includes("--video");
const filteredArgs = args.filter((arg) => arg !== "--video");
const startId = parseInt(filteredArgs[0]) || 1;
const count = parseInt(filteredArgs[1]) || 3;

if (isVideoMode) {
  console.log("Starting Remotion video rendering...\n");
  renderVideos(startId, count).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} else {
  console.log("Starting Remotion image rendering...\n");
  renderShips(startId, count).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
