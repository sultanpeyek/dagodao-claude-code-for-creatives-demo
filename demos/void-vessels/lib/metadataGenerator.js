import { getRarityTier, formatTraitValue } from '../config/rarity.js';

/**
 * Generate NFT metadata following OpenSea standards
 * @param {number} tokenId - Token ID
 * @param {Object} shipData - Ship generation data
 * @param {string} imageUri - URI to the ship image
 * @returns {Object} NFT metadata object
 */
export function generateMetadata(tokenId, shipData, imageUri) {
  const { traits, rarityScore, seed } = shipData;

  const rarityTier = getRarityTier(rarityScore);

  const metadata = {
    name: `Void Vessel #${tokenId}`,
    description: `A procedurally generated wireframe spacecraft from the Void Vessels collection. Each vessel is uniquely generated from seed ${seed}, creating a one-of-a-kind experimental spacecraft design.`,
    image: imageUri,
    external_url: `https://voidvessels.io/ship/${tokenId}`,

    attributes: [
      {
        trait_type: 'Hull Type',
        value: formatTraitValue(traits.hull)
      },
      {
        trait_type: 'Wing Configuration',
        value: formatTraitValue(traits.wingConfig)
      },
      {
        trait_type: 'Engine Count',
        value: formatTraitValue(traits.engineCount)
      },
      {
        trait_type: 'Detail Density',
        value: formatTraitValue(traits.detailDensity)
      },
      {
        trait_type: 'Special Feature',
        value: formatTraitValue(traits.specialFeatures)
      },
      {
        trait_type: 'Background',
        value: formatTraitValue(traits.background)
      },
      {
        display_type: 'number',
        trait_type: 'Rarity Score',
        value: rarityScore
      },
      {
        trait_type: 'Rarity Tier',
        value: rarityTier
      },
      {
        display_type: 'number',
        trait_type: 'Generation Seed',
        value: seed
      }
    ]
  };

  return metadata;
}

/**
 * Generate metadata for batch of ships
 * @param {Array<{tokenId: number, shipData: Object, imageUri: string}>} ships - Array of ship data
 * @returns {Array<Object>} Array of metadata objects
 */
export function generateBatchMetadata(ships) {
  return ships.map(({ tokenId, shipData, imageUri }) =>
    generateMetadata(tokenId, shipData, imageUri)
  );
}

/**
 * Generate collection-level metadata
 * @param {Object} options - Collection options
 * @returns {Object} Collection metadata
 */
export function generateCollectionMetadata(options = {}) {
  const {
    name = 'Void Vessels',
    description = 'A collection of procedurally generated wireframe spacecraft. Each vessel is uniquely created from a seed, producing experimental designs with varying hull types, wing configurations, and special features.',
    image = '',
    externalLink = 'https://voidvessels.io',
    sellerFeeBasisPoints = 500, // 5%
    feeRecipient = ''
  } = options;

  return {
    name,
    description,
    image,
    external_link: externalLink,
    seller_fee_basis_points: sellerFeeBasisPoints,
    fee_recipient: feeRecipient
  };
}

/**
 * Convert metadata to JSON string with formatting
 * @param {Object} metadata - Metadata object
 * @returns {string} Formatted JSON string
 */
export function metadataToJSON(metadata) {
  return JSON.stringify(metadata, null, 2);
}
