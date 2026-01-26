import * as THREE from 'three';
import { getHullDimensions } from './hullTypes.js';

/**
 * Detail density configurations
 */
const DETAIL_CONFIGS = {
  low: {
    panelChance: 0.08,
    panelCount: { min: 2, max: 5 },
    lineCount: { min: 1, max: 3 }
  },
  medium: {
    panelChance: 0.15,
    panelCount: { min: 4, max: 10 },
    lineCount: { min: 2, max: 5 }
  },
  high: {
    panelChance: 0.25,
    panelCount: { min: 8, max: 16 },
    lineCount: { min: 4, max: 8 }
  },
  extreme: {
    panelChance: 0.4,
    panelCount: { min: 15, max: 25 },
    lineCount: { min: 6, max: 12 }
  }
};

/**
 * Generate a detail panel
 * @param {SeededRandom} rng - Random number generator
 * @param {Object} hullDims - Hull dimensions
 * @param {string} face - Which face to add panel to
 * @returns {THREE.BufferGeometry} Panel geometry
 */
function generatePanel(rng, hullDims, face) {
  const panelWidth = rng.range(0.1, 0.3);
  const panelHeight = rng.range(0.1, 0.3);
  const panelDepth = rng.range(0.02, 0.06);

  const panel = new THREE.BoxGeometry(
    panelWidth,
    panelHeight,
    panelDepth,
    Math.ceil(panelWidth * 4),
    Math.ceil(panelHeight * 4),
    1
  );

  let x, y, z;

  switch (face) {
    case 'top':
      x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      y = hullDims.height / 2 + panelDepth / 2;
      z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      panel.rotateX(Math.PI / 2);
      break;
    case 'bottom':
      x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      y = -hullDims.height / 2 - panelDepth / 2;
      z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      panel.rotateX(-Math.PI / 2);
      break;
    case 'left':
      x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      y = rng.range(-hullDims.height * 0.3, hullDims.height * 0.3);
      z = hullDims.depth / 2 + panelDepth / 2;
      break;
    case 'right':
      x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      y = rng.range(-hullDims.height * 0.3, hullDims.height * 0.3);
      z = -hullDims.depth / 2 - panelDepth / 2;
      break;
    case 'front':
      x = hullDims.width / 2 + panelDepth / 2;
      y = rng.range(-hullDims.height * 0.3, hullDims.height * 0.3);
      z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      panel.rotateY(Math.PI / 2);
      break;
    case 'back':
      x = -hullDims.width / 2 - panelDepth / 2;
      y = rng.range(-hullDims.height * 0.3, hullDims.height * 0.3);
      z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      panel.rotateY(-Math.PI / 2);
      break;
  }

  panel.translate(x, y, z);
  return panel;
}

/**
 * Generate surface detail lines (grooves/seams)
 * @param {SeededRandom} rng - Random number generator
 * @param {Object} hullDims - Hull dimensions
 * @returns {THREE.BufferGeometry} Line geometry
 */
function generateDetailLine(rng, hullDims) {
  const isHorizontal = rng.chance(0.5);
  const lineThickness = 0.015;

  let lineWidth, lineHeight, lineDepth;
  let x, y, z;

  const face = rng.pick(['top', 'left', 'right', 'front']);

  switch (face) {
    case 'top':
      if (isHorizontal) {
        lineWidth = rng.range(0.3, hullDims.width * 0.8);
        lineHeight = lineThickness;
        lineDepth = lineThickness;
        x = rng.range(-hullDims.width * 0.3, hullDims.width * 0.3);
        y = hullDims.height / 2 + lineThickness / 2;
        z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      } else {
        lineWidth = lineThickness;
        lineHeight = lineThickness;
        lineDepth = rng.range(0.2, hullDims.depth * 0.7);
        x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
        y = hullDims.height / 2 + lineThickness / 2;
        z = rng.range(-hullDims.depth * 0.3, hullDims.depth * 0.3);
      }
      break;
    case 'left':
    case 'right':
      const zSign = face === 'left' ? 1 : -1;
      if (isHorizontal) {
        lineWidth = rng.range(0.3, hullDims.width * 0.7);
        lineHeight = lineThickness;
        lineDepth = lineThickness;
        x = rng.range(-hullDims.width * 0.3, hullDims.width * 0.3);
        y = rng.range(-hullDims.height * 0.3, hullDims.height * 0.3);
        z = zSign * (hullDims.depth / 2 + lineThickness / 2);
      } else {
        lineWidth = lineThickness;
        lineHeight = rng.range(0.1, hullDims.height * 0.6);
        lineDepth = lineThickness;
        x = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
        y = rng.range(-hullDims.height * 0.2, hullDims.height * 0.2);
        z = zSign * (hullDims.depth / 2 + lineThickness / 2);
      }
      break;
    case 'front':
      lineWidth = lineThickness;
      lineHeight = rng.range(0.1, hullDims.height * 0.5);
      lineDepth = lineThickness;
      x = hullDims.width / 2 + lineThickness / 2;
      y = rng.range(-hullDims.height * 0.2, hullDims.height * 0.2);
      z = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      break;
  }

  const line = new THREE.BoxGeometry(
    lineWidth,
    lineHeight,
    lineDepth,
    Math.ceil(lineWidth / 0.1),
    1,
    Math.ceil(lineDepth / 0.1)
  );

  line.translate(x, y, z);
  return line;
}

/**
 * Generate greeble (small mechanical detail)
 * @param {SeededRandom} rng - Random number generator
 * @param {Object} hullDims - Hull dimensions
 * @returns {THREE.BufferGeometry[]} Greeble geometries
 */
function generateGreeble(rng, hullDims) {
  const geometries = [];
  const greebleType = rng.pick(['box', 'stack', 'pipe']);

  const face = rng.pick(['top', 'left', 'right']);
  let baseX, baseY, baseZ;

  switch (face) {
    case 'top':
      baseX = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      baseY = hullDims.height / 2;
      baseZ = rng.range(-hullDims.depth * 0.4, hullDims.depth * 0.4);
      break;
    case 'left':
      baseX = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      baseY = rng.range(-hullDims.height * 0.2, hullDims.height * 0.3);
      baseZ = hullDims.depth / 2;
      break;
    case 'right':
      baseX = rng.range(-hullDims.width * 0.4, hullDims.width * 0.4);
      baseY = rng.range(-hullDims.height * 0.2, hullDims.height * 0.3);
      baseZ = -hullDims.depth / 2;
      break;
  }

  switch (greebleType) {
    case 'box':
      const boxSize = rng.range(0.05, 0.12);
      const box = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 2, 2, 2);
      if (face === 'top') {
        box.translate(baseX, baseY + boxSize / 2, baseZ);
      } else {
        const zOffset = face === 'left' ? boxSize / 2 : -boxSize / 2;
        box.translate(baseX, baseY, baseZ + zOffset);
      }
      geometries.push(box);
      break;

    case 'stack':
      const stackCount = rng.int(2, 4);
      for (let i = 0; i < stackCount; i++) {
        const size = rng.range(0.04, 0.08) * (1 - i * 0.15);
        const stackBox = new THREE.BoxGeometry(size, size * 0.5, size, 1, 1, 1);
        if (face === 'top') {
          stackBox.translate(baseX, baseY + (i + 0.5) * size * 0.5, baseZ);
        } else {
          const zOffset = face === 'left' ? (i + 0.5) * size * 0.5 : -(i + 0.5) * size * 0.5;
          stackBox.translate(baseX, baseY, baseZ + zOffset);
        }
        geometries.push(stackBox);
      }
      break;

    case 'pipe':
      const pipeLength = rng.range(0.1, 0.2);
      const pipeRadius = rng.range(0.02, 0.04);
      const pipe = new THREE.BoxGeometry(pipeRadius * 2, pipeLength, pipeRadius * 2, 2, 3, 2);
      if (face === 'top') {
        pipe.translate(baseX, baseY + pipeLength / 2, baseZ);
      } else {
        pipe.rotateX(Math.PI / 2);
        const zOffset = face === 'left' ? pipeLength / 2 : -pipeLength / 2;
        pipe.translate(baseX, baseY, baseZ + zOffset);
      }
      geometries.push(pipe);
      break;
  }

  return geometries;
}

/**
 * Add surface details to ship
 * @param {SeededRandom} rng - Random number generator
 * @param {string} densityLevel - Detail density level
 * @param {string} hullType - Hull type for dimension reference
 * @returns {THREE.BufferGeometry[]} Array of detail geometries
 */
export function addSurfaceDetails(rng, densityLevel, hullType) {
  const config = DETAIL_CONFIGS[densityLevel];
  if (!config) {
    return [];
  }

  const hullDims = getHullDimensions(hullType);
  const geometries = [];

  // Generate panels
  const panelCount = rng.int(config.panelCount.min, config.panelCount.max);
  const faces = ['top', 'left', 'right', 'front'];

  for (let i = 0; i < panelCount; i++) {
    if (rng.chance(config.panelChance * 2)) {
      const face = rng.pick(faces);
      geometries.push(generatePanel(rng, hullDims, face));
    }
  }

  // Generate detail lines
  const lineCount = rng.int(config.lineCount.min, config.lineCount.max);
  for (let i = 0; i < lineCount; i++) {
    geometries.push(generateDetailLine(rng, hullDims));
  }

  // Generate greebles
  const greebleCount = rng.int(
    Math.floor(config.panelCount.min / 2),
    Math.floor(config.panelCount.max / 2)
  );
  for (let i = 0; i < greebleCount; i++) {
    if (rng.chance(config.panelChance * 1.5)) {
      geometries.push(...generateGreeble(rng, hullDims));
    }
  }

  return geometries;
}
