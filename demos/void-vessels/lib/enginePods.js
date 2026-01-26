import * as THREE from 'three';
import { getHullDimensions } from './hullTypes.js';

/**
 * Engine count configurations
 */
const ENGINE_CONFIGS = {
  single: {
    count: 1,
    positions: [{ x: 0, y: 0, z: 0, scale: 1.2 }]
  },

  dual: {
    count: 2,
    positions: [
      { x: 0, y: 0, z: 0.3, scale: 1 },
      { x: 0, y: 0, z: -0.3, scale: 1 }
    ]
  },

  quad: {
    count: 4,
    positions: [
      { x: 0, y: 0.2, z: 0.35, scale: 0.8 },
      { x: 0, y: 0.2, z: -0.35, scale: 0.8 },
      { x: 0, y: -0.2, z: 0.35, scale: 0.8 },
      { x: 0, y: -0.2, z: -0.35, scale: 0.8 }
    ]
  },

  hex: {
    count: 6,
    positions: [
      { x: 0, y: 0.25, z: 0.4, scale: 0.7 },
      { x: 0, y: 0.25, z: 0, scale: 0.7 },
      { x: 0, y: 0.25, z: -0.4, scale: 0.7 },
      { x: 0, y: -0.15, z: 0.3, scale: 0.7 },
      { x: 0, y: -0.15, z: -0.3, scale: 0.7 },
      { x: 0, y: -0.15, z: 0, scale: 0.7 }
    ]
  },

  cluster: {
    count: 9,
    positions: [
      // Center large engine
      { x: 0, y: 0, z: 0, scale: 1.1 },
      // Ring of smaller engines
      { x: 0, y: 0.35, z: 0, scale: 0.5 },
      { x: 0, y: -0.35, z: 0, scale: 0.5 },
      { x: 0, y: 0, z: 0.35, scale: 0.5 },
      { x: 0, y: 0, z: -0.35, scale: 0.5 },
      { x: 0, y: 0.25, z: 0.25, scale: 0.5 },
      { x: 0, y: 0.25, z: -0.25, scale: 0.5 },
      { x: 0, y: -0.25, z: 0.25, scale: 0.5 },
      { x: 0, y: -0.25, z: -0.25, scale: 0.5 }
    ]
  }
};

/**
 * Generate a single engine pod
 * @param {SeededRandom} rng - Random number generator
 * @param {Object} position - Engine position config
 * @returns {THREE.BufferGeometry[]} Engine geometries
 */
function generateEnginePod(rng, position) {
  const geometries = [];
  const scale = position.scale;

  // Engine housing (cylindrical approximation using box)
  const housingRadius = rng.range(0.12, 0.18) * scale;
  const housingLength = rng.range(0.3, 0.5) * scale;
  const housing = new THREE.BoxGeometry(
    housingLength,
    housingRadius * 2,
    housingRadius * 2,
    Math.ceil(housingLength * 8),
    2,
    2
  );

  // Make it more cylindrical by chamfering corners
  const positions = housing.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    const z = positions[i + 2];
    const dist = Math.sqrt(y * y + z * z);
    if (dist > housingRadius * 0.8) {
      const factor = (housingRadius * 0.95) / dist;
      positions[i + 1] *= factor;
      positions[i + 2] *= factor;
    }
  }
  housing.computeVertexNormals();
  geometries.push(housing);

  // Engine nozzle (wider at back)
  const nozzleLength = housingLength * 0.4;
  const nozzle = new THREE.BoxGeometry(
    nozzleLength,
    housingRadius * 2.2,
    housingRadius * 2.2,
    2,
    2,
    2
  );

  // Taper nozzle
  const nozzlePos = nozzle.attributes.position.array;
  for (let i = 0; i < nozzlePos.length; i += 3) {
    const x = nozzlePos[i];
    if (x < 0) {
      // Back of nozzle - expand
      nozzlePos[i + 1] *= 1.3;
      nozzlePos[i + 2] *= 1.3;
    }
  }
  nozzle.computeVertexNormals();
  nozzle.translate(-housingLength / 2 - nozzleLength / 2 + 0.02, 0, 0);
  geometries.push(nozzle);

  // Intake cone (front)
  if (rng.chance(0.7)) {
    const intakeLength = housingLength * 0.25;
    const intake = new THREE.BoxGeometry(
      intakeLength,
      housingRadius * 1.5,
      housingRadius * 1.5,
      2,
      2,
      2
    );

    // Taper intake
    const intakePos = intake.attributes.position.array;
    for (let i = 0; i < intakePos.length; i += 3) {
      const x = intakePos[i];
      if (x > 0) {
        // Front - narrow
        intakePos[i + 1] *= 0.6;
        intakePos[i + 2] *= 0.6;
      }
    }
    intake.computeVertexNormals();
    intake.translate(housingLength / 2 + intakeLength / 2 - 0.02, 0, 0);
    geometries.push(intake);
  }

  // Engine mounting struts
  if (rng.chance(0.5)) {
    const strutWidth = 0.02;
    const strutLength = housingRadius * 1.5;

    const topStrut = new THREE.BoxGeometry(housingLength * 0.3, strutLength, strutWidth, 2, 2, 1);
    topStrut.translate(0, housingRadius + strutLength / 2 - 0.02, 0);
    geometries.push(topStrut);
  }

  // Position all engine parts
  geometries.forEach((geo) => {
    geo.translate(position.x, position.y, position.z);
  });

  return geometries;
}

/**
 * Generate all engines based on configuration
 * @param {SeededRandom} rng - Random number generator
 * @param {string} configName - Engine configuration name
 * @param {string} hullType - Hull type for dimension reference
 * @returns {THREE.BufferGeometry[]} Array of engine geometries
 */
export function generateEngines(rng, configName, hullType) {
  const config = ENGINE_CONFIGS[configName];
  if (!config) {
    return [];
  }

  const hullDims = getHullDimensions(hullType);
  const geometries = [];

  // Position engines at rear of hull
  const baseX = -hullDims.width / 2 - 0.1;

  for (const position of config.positions) {
    const engineParts = generateEnginePod(rng, {
      x: baseX + position.x,
      y: position.y,
      z: position.z,
      scale: position.scale
    });
    geometries.push(...engineParts);
  }

  // Engine housing frame (connects multiple engines)
  if (config.count > 1) {
    const frameWidth = 0.03;
    const frameDepth = config.count > 2 ? 0.8 : 0.6;
    const frame = new THREE.BoxGeometry(0.1, frameWidth, frameDepth, 1, 1, Math.ceil(frameDepth * 4));
    frame.translate(baseX + 0.15, 0, 0);
    geometries.push(frame);

    // Vertical frame
    if (config.count > 2) {
      const vFrame = new THREE.BoxGeometry(0.1, 0.5, frameWidth, 1, 3, 1);
      vFrame.translate(baseX + 0.15, 0, 0);
      geometries.push(vFrame);
    }
  }

  return geometries;
}
