import * as THREE from 'three';

/**
 * Create Three.js scene with orthographic camera
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} Scene and camera
 */
export function createScene(width = 1024, height = 1024) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // White background

  // Orthographic camera for clean line rendering
  const aspect = width / height;
  const frustumSize = 8;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );

  // Isometric-ish viewing angle
  camera.position.set(6, 5, 6);
  camera.lookAt(0, 0, 0);

  return { scene, camera };
}

/**
 * Create wireframe mesh from ship geometry
 * @param {THREE.BufferGeometry} shipGeometry - Combined ship geometry
 * @returns {THREE.LineSegments} Wireframe mesh
 */
export function createShipMesh(shipGeometry) {
  // Create edges geometry for wireframe effect
  // threshold angle determines which edges are rendered
  const edges = new THREE.EdgesGeometry(shipGeometry, 15);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1
  });

  const lineSegments = new THREE.LineSegments(edges, lineMaterial);

  return lineSegments;
}

/**
 * Create LineSegments directly from EdgesGeometry (for pre-processed geometry)
 * @param {THREE.EdgesGeometry} edgesGeometry - Pre-computed edges geometry
 * @returns {THREE.LineSegments} Wireframe mesh
 */
export function createShipMeshFromEdges(edgesGeometry) {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1
  });

  return new THREE.LineSegments(edgesGeometry, lineMaterial);
}

/**
 * Create WebGL renderer
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {THREE.WebGLRenderer} Renderer
 */
export function createRenderer(canvas, width = 1024, height = 1024) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true, // Required for image export
    alpha: false
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(1); // Fixed for consistent output

  return renderer;
}

/**
 * Set up optimal camera position for ship viewing
 * @param {THREE.Camera} camera - Camera to position
 * @param {string} preset - Position preset name
 */
export function setCameraPreset(camera, preset = 'default') {
  const presets = {
    default: { position: [6, 5, 6], target: [0, 0, 0] },
    front: { position: [10, 2, 0], target: [0, 0, 0] },
    side: { position: [0, 2, 10], target: [0, 0, 0] },
    top: { position: [0, 12, 0.1], target: [0, 0, 0] },
    dramatic: { position: [8, 3, 4], target: [0, 0.5, 0] },
    blueprint: { position: [0, 10, 0.01], target: [0, 0, 0] }
  };

  const config = presets[preset] || presets.default;
  camera.position.set(...config.position);
  camera.lookAt(...config.target);
}

/**
 * Render scene to canvas and return data URL
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @param {THREE.Scene} scene - Scene
 * @param {THREE.Camera} camera - Camera
 * @returns {string} PNG data URL
 */
export function renderToDataURL(renderer, scene, camera) {
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}
