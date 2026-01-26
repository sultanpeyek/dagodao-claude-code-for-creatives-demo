/**
 * Rarity Configuration for NFT Traits
 * Defines weights and tiers for all ship components
 */

export const RARITY_CONFIG = {
  hull: {
    carrier: { weight: 35, tier: 'common' },
    fighter: { weight: 30, tier: 'common' },
    cruiser: { weight: 20, tier: 'uncommon' },
    dreadnought: { weight: 10, tier: 'rare' },
    stealth: { weight: 5, tier: 'legendary' }
  },

  wingConfig: {
    none: { weight: 5, tier: 'uncommon' },
    single_pair: { weight: 25, tier: 'common' },
    double_pair: { weight: 30, tier: 'common' },
    asymmetric: { weight: 15, tier: 'uncommon' },
    triple_pair: { weight: 10, tier: 'uncommon' },
    quad_array: { weight: 8, tier: 'rare' },
    mega_wings: { weight: 5, tier: 'rare' },
    crystal_formation: { weight: 2, tier: 'legendary' }
  },

  detailDensity: {
    low: { weight: 20, tier: 'common' },
    medium: { weight: 50, tier: 'common' },
    high: { weight: 25, tier: 'uncommon' },
    extreme: { weight: 5, tier: 'rare' }
  },

  engineCount: {
    single: { weight: 15, tier: 'common' },
    dual: { weight: 40, tier: 'common' },
    quad: { weight: 30, tier: 'uncommon' },
    hex: { weight: 12, tier: 'rare' },
    cluster: { weight: 3, tier: 'legendary' }
  },

  specialFeatures: {
    none: { weight: 60, tier: 'common' },
    antenna_array: { weight: 15, tier: 'uncommon' },
    sensor_dome: { weight: 10, tier: 'uncommon' },
    crystal_core: { weight: 5, tier: 'rare' },
    plasma_vents: { weight: 5, tier: 'rare' },
    void_engine: { weight: 3, tier: 'legendary' },
    quantum_sail: { weight: 2, tier: 'legendary' }
  },

  background: {
    minimal: { weight: 30, tier: 'common' },
    grid_floor: { weight: 25, tier: 'common' },
    mountain_terrain: { weight: 20, tier: 'uncommon' },
    nebula_field: { weight: 15, tier: 'uncommon' },
    asteroid_field: { weight: 7, tier: 'rare' },
    void_space: { weight: 3, tier: 'legendary' }
  }
};

/**
 * Tier score values for rarity calculation
 */
export const TIER_SCORES = {
  common: 1,
  uncommon: 2,
  rare: 4,
  legendary: 10
};

/**
 * Calculate total rarity score from traits
 * @param {Object} traits - Ship traits object
 * @returns {number} Total rarity score
 */
export function calculateRarityScore(traits) {
  let score = 0;

  for (const [category, value] of Object.entries(traits)) {
    const config = RARITY_CONFIG[category]?.[value];
    if (config) {
      score += TIER_SCORES[config.tier];
    }
  }

  return score;
}

/**
 * Get rarity tier label from score
 * @param {number} score - Rarity score
 * @returns {string} Tier label
 */
export function getRarityTier(score) {
  if (score >= 30) return 'Legendary';
  if (score >= 20) return 'Epic';
  if (score >= 12) return 'Rare';
  if (score >= 6) return 'Uncommon';
  return 'Common';
}

/**
 * Format trait value for display
 * @param {string} value - Raw trait value
 * @returns {string} Formatted value
 */
export function formatTraitValue(value) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
