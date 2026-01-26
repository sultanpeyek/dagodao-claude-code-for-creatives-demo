import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SeededRandom } from './seededRandom.js';
import { RARITY_CONFIG, calculateRarityScore } from '../config/rarity.js';
import { createHull } from './hullTypes.js';
import { generateWings } from './wingConfigs.js';
import { generateEngines } from './enginePods.js';
import { generateSpecialFeature } from './antennaTypes.js';
import { addSurfaceDetails } from './surfaceDetails.js';

/**
 * Select traits using weighted random selection
 * @param {SeededRandom} rng - Random number generator
 * @returns {Object} Selected traits
 */
export function selectTraits(rng) {
  const traits = {};

  for (const [category, options] of Object.entries(RARITY_CONFIG)) {
    const weighted = Object.entries(options).map(([value, config]) => ({
      value,
      weight: config.weight
    }));
    traits[category] = rng.weighted(weighted);
  }

  return traits;
}

/**
 * Generate a complete ship from a seed
 * @param {number} seed - Seed for reproducible generation
 * @returns {Object} Ship data including geometry and traits
 */
export function generateShip(seed) {
  const rng = new SeededRandom(seed);
  const traits = selectTraits(rng);

  // Collect all geometries
  const geometries = [];

  // 1. Generate hull
  const hullGeos = createHull(rng, traits.hull);
  geometries.push(...hullGeos);

  // 2. Generate wings
  const wingGeos = generateWings(rng, traits.wingConfig, traits.hull);
  geometries.push(...wingGeos);

  // 3. Generate engines
  const engineGeos = generateEngines(rng, traits.engineCount, traits.hull);
  geometries.push(...engineGeos);

  // 4. Generate special features
  if (traits.specialFeatures !== 'none') {
    const featureGeos = generateSpecialFeature(rng, traits.specialFeatures, traits.hull);
    geometries.push(...featureGeos);
  }

  // 5. Add surface details
  const detailGeos = addSurfaceDetails(rng, traits.detailDensity, traits.hull);
  geometries.push(...detailGeos);

  // 6. Merge all geometries
  let mergedGeometry;
  try {
    // Filter out any invalid geometries
    const validGeometries = geometries.filter(
      (geo) => geo && geo.attributes && geo.attributes.position
    );

    if (validGeometries.length === 0) {
      throw new Error('No valid geometries to merge');
    }

    mergedGeometry = mergeGeometries(validGeometries, false);
  } catch (error) {
    console.error('Error merging geometries:', error);
    // Fallback to simple box
    mergedGeometry = new THREE.BoxGeometry(2, 1, 1, 4, 2, 2);
  }

  // 7. Create edges for wireframe rendering
  const edgesGeometry = new THREE.EdgesGeometry(mergedGeometry, 15);

  // Calculate rarity score
  const rarityScore = calculateRarityScore(traits);

  return {
    geometry: edgesGeometry,
    mergedGeometry,
    traits,
    rarityScore,
    seed
  };
}

/**
 * Generate ship and return serializable data (for web viewer)
 * @param {number} seed - Seed for reproducible generation
 * @returns {Object} Ship data without Three.js objects
 */
export function generateShipData(seed) {
  const rng = new SeededRandom(seed);
  const traits = selectTraits(rng);
  const rarityScore = calculateRarityScore(traits);

  return {
    seed,
    traits,
    rarityScore
  };
}

/**
 * Validate a seed number
 * @param {*} seed - Seed to validate
 * @returns {number} Valid seed number
 */
export function validateSeed(seed) {
  const numSeed = parseInt(seed, 10);
  if (isNaN(numSeed) || numSeed < 0) {
    return Date.now();
  }
  return numSeed;
}
