import * as THREE from 'three';
import { SeededRandom } from './seededRandom.js';

/**
 * Create background scene elements
 * @param {SeededRandom} rng - Random number generator
 * @param {string} type - Background type
 * @returns {THREE.Group} Background group
 */
export function createBackground(rng, type) {
  const group = new THREE.Group();

  switch (type) {
    case 'minimal':
      // Just white background, no additional geometry
      break;

    case 'grid_floor':
      group.add(createGridFloor(rng));
      break;

    case 'mountain_terrain':
      group.add(createWireframeTerrain(rng));
      break;

    case 'nebula_field':
      group.add(createNebulaLines(rng));
      break;

    case 'asteroid_field':
      group.add(createAsteroidWireframes(rng));
      break;

    case 'void_space':
      group.add(createVoidPattern(rng));
      break;
  }

  return group;
}

/**
 * Create a wireframe grid floor
 */
function createGridFloor(rng) {
  const group = new THREE.Group();
  const size = 16;
  const divisions = 16;

  // Horizontal lines
  for (let i = 0; i <= divisions; i++) {
    const geometry = new THREE.BufferGeometry();
    const y = -3;
    const z = (i / divisions - 0.5) * size;

    const positions = new Float32Array([
      -size / 2, y, z,
      size / 2, y, z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    group.add(line);
  }

  // Vertical lines
  for (let i = 0; i <= divisions; i++) {
    const geometry = new THREE.BufferGeometry();
    const y = -3;
    const x = (i / divisions - 0.5) * size;

    const positions = new Float32Array([
      x, y, -size / 2,
      x, y, size / 2
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    group.add(line);
  }

  return group;
}

/**
 * Create wireframe mountain terrain
 */
function createWireframeTerrain(rng) {
  const width = 20;
  const depth = 20;
  const segments = 20;

  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -4, 0);

  // Displace vertices for mountain effect
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    // Procedural height using multiple noise-like functions
    const height =
      Math.sin(x * 0.4 + rng.next() * 0.5) *
      Math.cos(z * 0.3 + rng.next() * 0.5) *
      rng.range(0.8, 2.5);
    positions[i + 1] += height;
  }
  geometry.computeVertexNormals();

  const edges = new THREE.EdgesGeometry(geometry, 1);
  const material = new THREE.LineBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.4
  });

  return new THREE.LineSegments(edges, material);
}

/**
 * Create abstract nebula-like line patterns
 */
function createNebulaLines(rng) {
  const group = new THREE.Group();
  const lineCount = rng.int(15, 25);

  for (let i = 0; i < lineCount; i++) {
    const points = [];
    const segmentCount = rng.int(8, 15);
    const baseRadius = rng.range(4, 8);
    const baseAngle = rng.next() * Math.PI * 2;

    for (let j = 0; j < segmentCount; j++) {
      const t = j / segmentCount;
      const angle = baseAngle + t * Math.PI * rng.range(0.5, 2);
      const radius = baseRadius + rng.range(-2, 2);
      const y = rng.range(-3, 3);

      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: rng.range(0.15, 0.35)
      })
    );
    group.add(line);
  }

  return group;
}

/**
 * Create wireframe asteroid shapes
 */
function createAsteroidWireframes(rng) {
  const group = new THREE.Group();
  const asteroidCount = rng.int(8, 15);

  for (let i = 0; i < asteroidCount; i++) {
    // Create irregular asteroid shape
    const size = rng.range(0.3, 1.2);
    const geometry = new THREE.IcosahedronGeometry(size, 0);

    // Displace vertices for irregular shape
    const positions = geometry.attributes.position.array;
    for (let j = 0; j < positions.length; j += 3) {
      const displacement = rng.range(0.7, 1.3);
      positions[j] *= displacement;
      positions[j + 1] *= displacement;
      positions[j + 2] *= displacement;
    }
    geometry.computeVertexNormals();

    const edges = new THREE.EdgesGeometry(geometry, 20);
    const asteroid = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: rng.range(0.3, 0.6)
      })
    );

    // Position asteroid around the scene
    const angle = rng.next() * Math.PI * 2;
    const radius = rng.range(5, 10);
    const y = rng.range(-4, 4);

    asteroid.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );

    asteroid.rotation.set(
      rng.next() * Math.PI,
      rng.next() * Math.PI,
      rng.next() * Math.PI
    );

    group.add(asteroid);
  }

  return group;
}

/**
 * Create void space pattern with geometric shapes
 */
function createVoidPattern(rng) {
  const group = new THREE.Group();

  // Large geometric frame
  const frameSize = 12;
  const frameGeometry = new THREE.BoxGeometry(frameSize, frameSize, frameSize, 2, 2, 2);
  const frameEdges = new THREE.EdgesGeometry(frameGeometry);
  const frame = new THREE.LineSegments(
    frameEdges,
    new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2
    })
  );
  frame.rotation.set(Math.PI * 0.1, Math.PI * 0.15, 0);
  group.add(frame);

  // Inner geometric shapes
  const shapeCount = rng.int(3, 6);
  for (let i = 0; i < shapeCount; i++) {
    const shapeType = rng.pick(['tetrahedron', 'octahedron', 'dodecahedron']);
    const size = rng.range(0.5, 2);

    let geometry;
    switch (shapeType) {
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(size);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(size);
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(size);
        break;
    }

    const edges = new THREE.EdgesGeometry(geometry);
    const shape = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: rng.range(0.2, 0.4)
      })
    );

    shape.position.set(
      rng.range(-4, 4),
      rng.range(-4, 4),
      rng.range(-4, 4)
    );

    shape.rotation.set(
      rng.next() * Math.PI,
      rng.next() * Math.PI,
      rng.next() * Math.PI
    );

    group.add(shape);
  }

  // Radial lines from center
  const lineCount = rng.int(6, 12);
  for (let i = 0; i < lineCount; i++) {
    const angle1 = (i / lineCount) * Math.PI * 2;
    const angle2 = rng.next() * Math.PI - Math.PI / 2;
    const length = rng.range(6, 10);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0,
      Math.cos(angle1) * Math.cos(angle2) * length,
      Math.sin(angle2) * length,
      Math.sin(angle1) * Math.cos(angle2) * length
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.15
      })
    );
    group.add(line);
  }

  return group;
}
