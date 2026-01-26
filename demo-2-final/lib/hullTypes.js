import * as THREE from 'three';

/**
 * Hull type definitions with dimensions, segments, and modifiers
 */
const HULL_DEFINITIONS = {
  carrier: {
    dimensions: [4, 1, 1.5],
    segments: [8, 2, 3],
    modifiers: (rng) => {
      const parts = [];

      // Main hull
      const hull = new THREE.BoxGeometry(4, 1, 1.5, 8, 2, 3);
      parts.push(hull);

      // Bridge section
      const bridge = new THREE.BoxGeometry(0.8, 0.6, 0.6, 2, 2, 2);
      bridge.translate(1, 0.8, 0);
      parts.push(bridge);

      // Flight deck
      const deck = new THREE.BoxGeometry(2.5, 0.15, 1.2, 5, 1, 3);
      deck.translate(-0.5, 0.55, 0);
      parts.push(deck);

      // Hangar bay
      const hangar = new THREE.BoxGeometry(1.5, 0.4, 0.8, 3, 1, 2);
      hangar.translate(-1, -0.3, 0);
      parts.push(hangar);

      return parts;
    }
  },

  fighter: {
    dimensions: [2, 0.8, 1],
    segments: [4, 2, 2],
    modifiers: (rng) => {
      const parts = [];

      // Main fuselage
      const fuselage = new THREE.BoxGeometry(2, 0.6, 0.8, 4, 2, 2);
      parts.push(fuselage);

      // Cockpit canopy
      const cockpit = new THREE.BoxGeometry(0.6, 0.35, 0.5, 2, 1, 2);
      cockpit.translate(0.5, 0.45, 0);
      parts.push(cockpit);

      // Nose cone
      const nose = new THREE.BoxGeometry(0.8, 0.4, 0.5, 2, 1, 2);
      nose.translate(1.3, 0, 0);
      parts.push(nose);

      // Tail fin
      const tailFin = new THREE.BoxGeometry(0.1, 0.5, 0.3, 1, 2, 1);
      tailFin.translate(-0.9, 0.5, 0);
      parts.push(tailFin);

      return parts;
    }
  },

  cruiser: {
    dimensions: [3, 1.2, 1],
    segments: [6, 3, 2],
    modifiers: (rng) => {
      const parts = [];

      // Main hull
      const hull = new THREE.BoxGeometry(3, 1, 1, 6, 2, 2);
      parts.push(hull);

      // Command deck sections
      for (let i = 0; i < 3; i++) {
        const deck = new THREE.BoxGeometry(0.5, 0.3, 0.7, 2, 1, 2);
        deck.translate(-0.6 + i * 0.6, 0.65, 0);
        parts.push(deck);
      }

      // Side sponsons
      const leftSponson = new THREE.BoxGeometry(1, 0.4, 0.25, 2, 1, 1);
      leftSponson.translate(0, 0, 0.625);
      parts.push(leftSponson);

      const rightSponson = new THREE.BoxGeometry(1, 0.4, 0.25, 2, 1, 1);
      rightSponson.translate(0, 0, -0.625);
      parts.push(rightSponson);

      return parts;
    }
  },

  dreadnought: {
    dimensions: [5, 1.5, 2],
    segments: [10, 3, 4],
    modifiers: (rng) => {
      const parts = [];

      // Massive main hull
      const hull = new THREE.BoxGeometry(5, 1.2, 2, 10, 3, 4);
      parts.push(hull);

      // Command tower
      const tower = new THREE.BoxGeometry(1.2, 1.4, 0.9, 3, 4, 2);
      tower.translate(0.5, 1.3, 0);
      parts.push(tower);

      // Left sponson
      const leftSponson = new THREE.BoxGeometry(1.8, 0.7, 0.5, 4, 2, 1);
      leftSponson.translate(-0.5, 0, 1.25);
      parts.push(leftSponson);

      // Right sponson
      const rightSponson = new THREE.BoxGeometry(1.8, 0.7, 0.5, 4, 2, 1);
      rightSponson.translate(-0.5, 0, -1.25);
      parts.push(rightSponson);

      // Weapon batteries
      for (let i = 0; i < 4; i++) {
        const battery = new THREE.BoxGeometry(0.4, 0.3, 0.4, 1, 1, 1);
        battery.translate(-1.5 + i * 0.8, 0.75, rng.chance() ? 0.6 : -0.6);
        parts.push(battery);
      }

      // Armored prow
      const prow = new THREE.BoxGeometry(0.8, 0.8, 1.4, 2, 2, 3);
      prow.translate(2.8, 0, 0);
      parts.push(prow);

      return parts;
    }
  },

  stealth: {
    dimensions: [3, 0.4, 2],
    segments: [6, 1, 4],
    modifiers: (rng) => {
      const parts = [];

      // Flat angular main body
      const body = new THREE.BoxGeometry(3, 0.35, 2, 6, 1, 4);

      // Apply angular displacement for stealth look
      const positions = body.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        // Create angular facets
        positions[i + 1] *= 1 + Math.abs(x) * 0.15 - Math.abs(z) * 0.1;
      }
      body.computeVertexNormals();
      parts.push(body);

      // Angular cockpit
      const cockpit = new THREE.BoxGeometry(0.6, 0.25, 0.5, 2, 1, 2);
      cockpit.translate(0.8, 0.3, 0);
      parts.push(cockpit);

      // Swept fins
      const leftFin = new THREE.BoxGeometry(1.2, 0.08, 0.4, 3, 1, 1);
      leftFin.rotateY(Math.PI * 0.15);
      leftFin.translate(-0.8, 0.1, 0.8);
      parts.push(leftFin);

      const rightFin = new THREE.BoxGeometry(1.2, 0.08, 0.4, 3, 1, 1);
      rightFin.rotateY(-Math.PI * 0.15);
      rightFin.translate(-0.8, 0.1, -0.8);
      parts.push(rightFin);

      return parts;
    }
  }
};

/**
 * Create hull geometry based on type
 * @param {SeededRandom} rng - Random number generator
 * @param {string} hullType - Hull type name
 * @returns {THREE.BufferGeometry[]} Array of hull geometries
 */
export function createHull(rng, hullType) {
  const def = HULL_DEFINITIONS[hullType];
  if (!def) {
    throw new Error(`Unknown hull type: ${hullType}`);
  }

  const parts = def.modifiers(rng);

  // Apply slight random variations
  parts.forEach((part) => {
    const scale = rng.range(0.97, 1.03);
    part.scale(scale, scale, scale);
  });

  return parts;
}

/**
 * Get hull dimensions for attachment calculations
 * @param {string} hullType - Hull type name
 * @returns {Object} Hull dimensions
 */
export function getHullDimensions(hullType) {
  const def = HULL_DEFINITIONS[hullType];
  const [width, height, depth] = def.dimensions;
  return { width, height, depth };
}
