import * as THREE from 'three';
import { getHullDimensions } from './hullTypes.js';

/**
 * Wing configuration definitions
 */
const WING_CONFIGS = {
  none: {
    count: 0,
    positions: []
  },

  single_pair: {
    count: 2,
    positions: [
      { side: 'left', y: 0, scale: 1 },
      { side: 'right', y: 0, scale: 1 }
    ]
  },

  double_pair: {
    count: 4,
    positions: [
      { side: 'left', y: 0.2, scale: 0.9 },
      { side: 'left', y: -0.2, scale: 0.9 },
      { side: 'right', y: 0.2, scale: 0.9 },
      { side: 'right', y: -0.2, scale: 0.9 }
    ]
  },

  asymmetric: {
    count: 3,
    positions: [
      { side: 'left', y: 0, scale: 1.2 },
      { side: 'right', y: 0.15, scale: 0.8 },
      { side: 'right', y: -0.15, scale: 0.8 }
    ]
  },

  triple_pair: {
    count: 6,
    positions: [
      { side: 'left', y: 0.3, scale: 0.7 },
      { side: 'left', y: 0, scale: 1 },
      { side: 'left', y: -0.3, scale: 0.7 },
      { side: 'right', y: 0.3, scale: 0.7 },
      { side: 'right', y: 0, scale: 1 },
      { side: 'right', y: -0.3, scale: 0.7 }
    ]
  },

  quad_array: {
    count: 8,
    positions: [
      { side: 'left', y: 0.3, scale: 0.6, x: 0.3 },
      { side: 'left', y: 0.3, scale: 0.6, x: -0.3 },
      { side: 'left', y: -0.3, scale: 0.6, x: 0.3 },
      { side: 'left', y: -0.3, scale: 0.6, x: -0.3 },
      { side: 'right', y: 0.3, scale: 0.6, x: 0.3 },
      { side: 'right', y: 0.3, scale: 0.6, x: -0.3 },
      { side: 'right', y: -0.3, scale: 0.6, x: 0.3 },
      { side: 'right', y: -0.3, scale: 0.6, x: -0.3 }
    ]
  },

  mega_wings: {
    count: 2,
    positions: [
      { side: 'left', y: 0, scale: 2.2 },
      { side: 'right', y: 0, scale: 2.2 }
    ]
  },

  crystal_formation: {
    count: 5,
    positions: [
      { side: 'left', y: 0, scale: 1, angle: 0.1 },
      { side: 'right', y: 0, scale: 1, angle: -0.1 },
      { side: 'left', y: 0.4, scale: 0.6, angle: 0.3 },
      { side: 'right', y: 0.4, scale: 0.6, angle: -0.3 },
      { side: 'top', y: 0.5, scale: 0.8, angle: 0 }
    ]
  }
};

/**
 * Generate a single wing geometry
 * @param {SeededRandom} rng - Random number generator
 * @param {Object} position - Wing position config
 * @param {Object} hullDims - Hull dimensions
 * @returns {THREE.BufferGeometry} Wing geometry
 */
function generateSingleWing(rng, position, hullDims) {
  const baseLength = rng.range(0.8, 1.5) * position.scale;
  const baseWidth = rng.range(0.4, 0.7);
  const baseDepth = rng.range(0.04, 0.1);

  // Subdivided for wireframe detail
  const segX = Math.ceil(baseLength * 4);
  const segY = 1;
  const segZ = Math.ceil(baseWidth * 3);

  const wing = new THREE.BoxGeometry(
    baseLength,
    baseDepth,
    baseWidth,
    segX,
    segY,
    segZ
  );

  // Taper the wing tip
  const positions = wing.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    if (x > 0) {
      // Outer edge - taper
      const taperFactor = 1 - (x / baseLength) * 0.4;
      positions[i + 2] *= taperFactor; // Taper width
      positions[i + 1] *= taperFactor; // Taper thickness
    }
  }
  wing.computeVertexNormals();

  // Position the wing
  const xOffset = position.x || 0;
  const yOffset = position.y || 0;
  const zOffset = position.side === 'left' ? hullDims.depth / 2 + baseLength / 2 :
                  position.side === 'right' ? -(hullDims.depth / 2 + baseLength / 2) :
                  0;

  // Rotate for side attachment
  if (position.side === 'left') {
    wing.rotateZ(Math.PI / 2);
    wing.rotateY(position.angle || 0);
  } else if (position.side === 'right') {
    wing.rotateZ(-Math.PI / 2);
    wing.rotateY(position.angle || 0);
  } else if (position.side === 'top') {
    wing.rotateX(Math.PI / 2);
  }

  wing.translate(xOffset, yOffset, zOffset);

  return wing;
}

/**
 * Generate wing tip detail
 * @param {SeededRandom} rng - Random number generator
 * @param {THREE.BufferGeometry} wing - Base wing geometry
 * @param {Object} position - Wing position config
 * @returns {THREE.BufferGeometry[]} Wing tip geometries
 */
function generateWingTips(rng, position, hullDims) {
  const tips = [];

  if (rng.chance(0.6)) {
    const tipSize = rng.range(0.08, 0.15) * position.scale;
    const tip = new THREE.BoxGeometry(tipSize, tipSize, tipSize * 2, 1, 1, 2);

    const zOffset = position.side === 'left' ? hullDims.depth / 2 + position.scale * 1.3 :
                    position.side === 'right' ? -(hullDims.depth / 2 + position.scale * 1.3) :
                    0;

    tip.translate(position.x || 0, position.y || 0, zOffset);
    tips.push(tip);
  }

  return tips;
}

/**
 * Generate all wings based on configuration
 * @param {SeededRandom} rng - Random number generator
 * @param {string} configName - Wing configuration name
 * @param {string} hullType - Hull type for dimension reference
 * @returns {THREE.BufferGeometry[]} Array of wing geometries
 */
export function generateWings(rng, configName, hullType) {
  const config = WING_CONFIGS[configName];
  if (!config || config.count === 0) {
    return [];
  }

  const hullDims = getHullDimensions(hullType);
  const geometries = [];

  for (const position of config.positions) {
    // Main wing
    const wing = generateSingleWing(rng, position, hullDims);
    geometries.push(wing);

    // Wing tips
    const tips = generateWingTips(rng, position, hullDims);
    geometries.push(...tips);

    // Wing struts (random chance)
    if (rng.chance(0.3)) {
      const strutLength = rng.range(0.2, 0.4);
      const strut = new THREE.BoxGeometry(0.03, strutLength, 0.03, 1, 2, 1);

      const zOffset = position.side === 'left' ? hullDims.depth / 2 + position.scale * 0.5 :
                      position.side === 'right' ? -(hullDims.depth / 2 + position.scale * 0.5) :
                      0;

      strut.translate(position.x || 0, (position.y || 0) - strutLength / 2, zOffset);
      geometries.push(strut);
    }
  }

  return geometries;
}
