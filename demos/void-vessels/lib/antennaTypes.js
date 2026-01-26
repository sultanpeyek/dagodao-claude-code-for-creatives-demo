import * as THREE from 'three';
import { getHullDimensions } from './hullTypes.js';

/**
 * Special feature configurations
 */
const FEATURE_GENERATORS = {
  none: () => [],

  antenna_array: (rng, hullDims) => {
    const geometries = [];
    const antennaCount = rng.int(3, 6);

    for (let i = 0; i < antennaCount; i++) {
      // Antenna mast
      const height = rng.range(0.3, 0.7);
      const mast = new THREE.BoxGeometry(0.02, height, 0.02, 1, Math.ceil(height * 6), 1);

      const xPos = rng.range(-hullDims.width * 0.3, hullDims.width * 0.3);
      const zPos = rng.range(-hullDims.depth * 0.3, hullDims.depth * 0.3);

      mast.translate(xPos, hullDims.height / 2 + height / 2, zPos);
      geometries.push(mast);

      // Antenna dish or tip
      if (rng.chance(0.6)) {
        const dishSize = rng.range(0.08, 0.15);
        const dish = new THREE.BoxGeometry(dishSize, 0.02, dishSize, 2, 1, 2);
        dish.translate(xPos, hullDims.height / 2 + height + 0.02, zPos);
        geometries.push(dish);
      } else {
        // Cross antenna
        const crossSize = rng.range(0.1, 0.2);
        const crossH = new THREE.BoxGeometry(crossSize, 0.015, 0.015, 2, 1, 1);
        const crossV = new THREE.BoxGeometry(0.015, 0.015, crossSize, 1, 1, 2);
        crossH.translate(xPos, hullDims.height / 2 + height + 0.02, zPos);
        crossV.translate(xPos, hullDims.height / 2 + height + 0.02, zPos);
        geometries.push(crossH, crossV);
      }
    }

    // Connecting wires between antennas
    if (antennaCount > 2 && rng.chance(0.5)) {
      const wire = new THREE.BoxGeometry(hullDims.width * 0.5, 0.01, 0.01, 4, 1, 1);
      wire.translate(0, hullDims.height / 2 + 0.5, 0);
      geometries.push(wire);
    }

    return geometries;
  },

  sensor_dome: (rng, hullDims) => {
    const geometries = [];

    // Main dome (approximated with box)
    const domeRadius = rng.range(0.2, 0.35);
    const dome = new THREE.BoxGeometry(
      domeRadius * 2,
      domeRadius,
      domeRadius * 2,
      4,
      2,
      4
    );

    // Round the dome
    const positions = dome.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      if (y > 0) {
        const x = positions[i];
        const z = positions[i + 2];
        const dist = Math.sqrt(x * x + z * z);
        const maxRadius = domeRadius * Math.cos(Math.asin(Math.min(y / domeRadius, 1)));
        if (dist > maxRadius * 0.9) {
          const factor = maxRadius * 0.9 / dist;
          positions[i] *= factor;
          positions[i + 2] *= factor;
        }
      }
    }
    dome.computeVertexNormals();

    const xPos = rng.range(-hullDims.width * 0.2, hullDims.width * 0.2);
    dome.translate(xPos, hullDims.height / 2 + domeRadius / 2, 0);
    geometries.push(dome);

    // Dome base ring
    const baseRing = new THREE.BoxGeometry(
      domeRadius * 2.2,
      0.04,
      domeRadius * 2.2,
      4,
      1,
      4
    );
    baseRing.translate(xPos, hullDims.height / 2 + 0.02, 0);
    geometries.push(baseRing);

    // Sensor array panels
    for (let i = 0; i < 4; i++) {
      const panel = new THREE.BoxGeometry(0.06, 0.1, 0.02, 1, 2, 1);
      const angle = (i / 4) * Math.PI * 2;
      panel.translate(
        xPos + Math.cos(angle) * domeRadius * 1.3,
        hullDims.height / 2 + 0.15,
        Math.sin(angle) * domeRadius * 1.3
      );
      geometries.push(panel);
    }

    return geometries;
  },

  crystal_core: (rng, hullDims) => {
    const geometries = [];

    // Central crystal spire
    const spireHeight = rng.range(0.5, 0.8);
    const spireBase = rng.range(0.15, 0.25);
    const spire = new THREE.BoxGeometry(spireBase, spireHeight, spireBase, 2, 4, 2);

    // Taper to point
    const positions = spire.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      const taperFactor = 1 - (y / spireHeight) * 0.8;
      if (y > 0) {
        positions[i] *= taperFactor;
        positions[i + 2] *= taperFactor;
      }
    }
    spire.computeVertexNormals();
    spire.rotateY(Math.PI / 4);
    spire.translate(0, hullDims.height / 2 + spireHeight / 2, 0);
    geometries.push(spire);

    // Surrounding smaller crystals
    const crystalCount = rng.int(4, 8);
    for (let i = 0; i < crystalCount; i++) {
      const smallHeight = rng.range(0.15, 0.35);
      const smallBase = rng.range(0.05, 0.1);
      const crystal = new THREE.BoxGeometry(smallBase, smallHeight, smallBase, 1, 3, 1);

      // Taper
      const cPositions = crystal.attributes.position.array;
      for (let j = 0; j < cPositions.length; j += 3) {
        const y = cPositions[j + 1];
        if (y > 0) {
          const taperFactor = 1 - (y / smallHeight) * 0.9;
          cPositions[j] *= taperFactor;
          cPositions[j + 2] *= taperFactor;
        }
      }
      crystal.computeVertexNormals();

      const angle = (i / crystalCount) * Math.PI * 2 + rng.range(-0.2, 0.2);
      const radius = rng.range(0.25, 0.4);
      crystal.rotateY(rng.range(0, Math.PI));
      crystal.rotateZ(rng.range(-0.3, 0.3));
      crystal.translate(
        Math.cos(angle) * radius,
        hullDims.height / 2 + smallHeight / 2,
        Math.sin(angle) * radius
      );
      geometries.push(crystal);
    }

    return geometries;
  },

  plasma_vents: (rng, hullDims) => {
    const geometries = [];
    const ventCount = rng.int(2, 4);

    for (let side = 0; side < 2; side++) {
      const zSign = side === 0 ? 1 : -1;

      for (let i = 0; i < ventCount; i++) {
        // Vent housing
        const ventWidth = rng.range(0.15, 0.25);
        const ventHeight = rng.range(0.08, 0.12);
        const vent = new THREE.BoxGeometry(ventWidth, ventHeight, 0.1, 3, 2, 2);

        const xPos = rng.range(-hullDims.width * 0.3, hullDims.width * 0.2);
        vent.translate(xPos, hullDims.height / 2 + ventHeight / 2, zSign * (hullDims.depth / 2 + 0.05));
        geometries.push(vent);

        // Vent fins
        const finCount = rng.int(2, 4);
        for (let f = 0; f < finCount; f++) {
          const fin = new THREE.BoxGeometry(ventWidth / finCount * 0.8, ventHeight * 0.8, 0.02, 1, 2, 1);
          fin.translate(
            xPos - ventWidth / 2 + (f + 0.5) * (ventWidth / finCount),
            hullDims.height / 2 + ventHeight / 2,
            zSign * (hullDims.depth / 2 + 0.12)
          );
          geometries.push(fin);
        }
      }
    }

    return geometries;
  },

  void_engine: (rng, hullDims) => {
    const geometries = [];

    // Large ring structure
    const ringRadius = rng.range(0.4, 0.6);
    const ringThickness = 0.06;

    // Create ring from segments
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;

      const segLength = ringRadius * Math.PI * 2 / segments;
      const segment = new THREE.BoxGeometry(segLength, ringThickness, ringThickness, 2, 1, 1);

      const midAngle = (angle1 + angle2) / 2;
      segment.rotateY(-midAngle + Math.PI / 2);
      segment.translate(
        Math.cos(midAngle) * ringRadius - hullDims.width / 2 - 0.3,
        0,
        Math.sin(midAngle) * ringRadius
      );
      geometries.push(segment);
    }

    // Inner ring
    const innerRadius = ringRadius * 0.6;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const segLength = innerRadius * Math.PI * 2 / segments;
      const segment = new THREE.BoxGeometry(segLength, ringThickness * 0.5, ringThickness * 0.5, 1, 1, 1);

      const midAngle = angle + Math.PI / segments;
      segment.rotateY(-midAngle + Math.PI / 2);
      segment.translate(
        Math.cos(midAngle) * innerRadius - hullDims.width / 2 - 0.3,
        0,
        Math.sin(midAngle) * innerRadius
      );
      geometries.push(segment);
    }

    // Spokes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spoke = new THREE.BoxGeometry(ringRadius - innerRadius, ringThickness * 0.4, ringThickness * 0.4, 2, 1, 1);
      spoke.rotateY(-angle + Math.PI / 2);
      spoke.translate(
        Math.cos(angle) * (innerRadius + ringRadius) / 2 - hullDims.width / 2 - 0.3,
        0,
        Math.sin(angle) * (innerRadius + ringRadius) / 2
      );
      geometries.push(spoke);
    }

    return geometries;
  },

  quantum_sail: (rng, hullDims) => {
    const geometries = [];

    // Large sail structure
    const sailWidth = rng.range(1.5, 2.5);
    const sailHeight = rng.range(1.2, 1.8);
    const sail = new THREE.BoxGeometry(0.02, sailHeight, sailWidth, 1, 6, 8);

    // Wave the sail slightly
    const positions = sail.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      const z = positions[i + 2];
      positions[i] += Math.sin(y * 3) * 0.05 + Math.sin(z * 2) * 0.03;
    }
    sail.computeVertexNormals();
    sail.translate(0, hullDims.height / 2 + sailHeight / 2 + 0.1, 0);
    geometries.push(sail);

    // Sail mast
    const mast = new THREE.BoxGeometry(0.04, sailHeight + 0.3, 0.04, 1, 4, 1);
    mast.translate(0, hullDims.height / 2 + sailHeight / 2, 0);
    geometries.push(mast);

    // Cross beams
    const beam1 = new THREE.BoxGeometry(0.03, 0.03, sailWidth * 0.9, 1, 1, 6);
    beam1.translate(0, hullDims.height / 2 + sailHeight * 0.3, 0);
    geometries.push(beam1);

    const beam2 = new THREE.BoxGeometry(0.03, 0.03, sailWidth * 0.7, 1, 1, 4);
    beam2.translate(0, hullDims.height / 2 + sailHeight * 0.7, 0);
    geometries.push(beam2);

    // Rigging lines
    for (let side = 0; side < 2; side++) {
      const zSign = side === 0 ? 1 : -1;
      const line = new THREE.BoxGeometry(0.01, sailHeight * 1.2, 0.01, 1, 6, 1);
      line.rotateX(zSign * 0.3);
      line.translate(0, hullDims.height / 2 + sailHeight / 2, zSign * sailWidth * 0.4);
      geometries.push(line);
    }

    return geometries;
  }
};

/**
 * Generate special feature geometries
 * @param {SeededRandom} rng - Random number generator
 * @param {string} featureType - Feature type name
 * @param {string} hullType - Hull type for dimension reference
 * @returns {THREE.BufferGeometry[]} Array of feature geometries
 */
export function generateSpecialFeature(rng, featureType, hullType) {
  const generator = FEATURE_GENERATORS[featureType];
  if (!generator) {
    return [];
  }

  const hullDims = getHullDimensions(hullType);
  return generator(rng, hullDims);
}
