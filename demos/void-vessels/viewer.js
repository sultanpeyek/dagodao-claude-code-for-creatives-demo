import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Import local modules (relative paths for GitHub Pages)
import { SeededRandom } from './lib/seededRandom.js';
import { RARITY_CONFIG, calculateRarityScore, getRarityTier, formatTraitValue } from './config/rarity.js';
import { createHull, getHullDimensions } from './lib/hullTypes.js';
import { generateWings } from './lib/wingConfigs.js';
import { generateEngines } from './lib/enginePods.js';
import { generateSpecialFeature } from './lib/antennaTypes.js';
import { addSurfaceDetails } from './lib/surfaceDetails.js';
import { createBackground } from './lib/backgroundTypes.js';

class ShipViewer {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.seedInput = document.getElementById('seed-input');
    this.generateBtn = document.getElementById('generate-btn');
    this.randomBtn = document.getElementById('random-btn');
    this.exportBtn = document.getElementById('export-btn');
    this.exportMetaBtn = document.getElementById('export-meta-btn');
    this.cameraPreset = document.getElementById('camera-preset');
    this.traitsContent = document.getElementById('traits-content');
    this.loadingEl = document.getElementById('loading');

    this.currentShipData = null;
    this.shipGroup = null;
    this.backgroundGroup = null;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Camera setup (orthographic for clean lines)
    const aspect = this.canvas.width / this.canvas.height;
    const frustumSize = 8;
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    this.camera.position.set(6, 5, 6);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(1);

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Handle resize
    this.handleResize = () => this.resize();
    window.addEventListener('resize', this.handleResize);
    this.resize();

    // Event listeners
    this.generateBtn.addEventListener('click', () => this.generate());
    this.randomBtn.addEventListener('click', () => this.randomSeed());
    this.exportBtn.addEventListener('click', () => this.exportImage());
    this.exportMetaBtn.addEventListener('click', () => this.exportMetadata());
    this.cameraPreset.addEventListener('change', (e) => this.setCameraPreset(e.target.value));

    // Check URL params for seed
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    if (seedParam) {
      this.seedInput.value = seedParam;
    }

    // Initial generation
    this.generate();

    // Start animation loop
    this.animate();

    // Mark export mode
    if (urlParams.get('export') === 'true') {
      // For headless export, mark when complete
      setTimeout(() => {
        document.getElementById('render-complete').style.display = 'block';
        window.shipData = this.currentShipData;
      }, 100);
    }
  }

  selectTraits(rng) {
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

  generateShip(seed) {
    const rng = new SeededRandom(seed);
    const traits = this.selectTraits(rng);
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

    // 6. Merge geometries
    const validGeometries = geometries.filter(
      (geo) => geo && geo.attributes && geo.attributes.position
    );

    let mergedGeometry;
    if (validGeometries.length > 0) {
      mergedGeometry = mergeGeometries(validGeometries, false);
    } else {
      mergedGeometry = new THREE.BoxGeometry(2, 1, 1, 4, 2, 2);
    }

    // 7. Create edges geometry
    const edgesGeometry = new THREE.EdgesGeometry(mergedGeometry, 15);

    // Calculate rarity
    const rarityScore = calculateRarityScore(traits);

    return {
      geometry: edgesGeometry,
      traits,
      rarityScore,
      seed
    };
  }

  generate() {
    this.showLoading(true);

    // Clear previous ship
    if (this.shipGroup) {
      this.scene.remove(this.shipGroup);
    }
    if (this.backgroundGroup) {
      this.scene.remove(this.backgroundGroup);
    }

    const seed = parseInt(this.seedInput.value) || Date.now();
    this.seedInput.value = seed;

    // Generate ship
    setTimeout(() => {
      try {
        const shipData = this.generateShip(seed);
        this.currentShipData = shipData;

        // Create ship mesh
        this.shipGroup = new THREE.Group();
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x000000,
          linewidth: 1
        });
        const shipMesh = new THREE.LineSegments(shipData.geometry, lineMaterial);
        this.shipGroup.add(shipMesh);
        this.scene.add(this.shipGroup);

        // Create background
        const bgRng = new SeededRandom(seed);
        this.backgroundGroup = createBackground(bgRng, shipData.traits.background);
        this.scene.add(this.backgroundGroup);

        // Update traits display
        this.updateTraitsDisplay(shipData);

        // Store for export
        window.shipData = {
          seed: shipData.seed,
          traits: shipData.traits,
          rarityScore: shipData.rarityScore
        };

      } catch (error) {
        console.error('Error generating ship:', error);
      }

      this.showLoading(false);
    }, 50);
  }

  updateTraitsDisplay(shipData) {
    const { traits, rarityScore } = shipData;
    const rarityTier = getRarityTier(rarityScore);

    let html = '';

    // Traits
    const traitOrder = ['hull', 'wingConfig', 'engineCount', 'detailDensity', 'specialFeatures', 'background'];
    const traitLabels = {
      hull: 'Hull Type',
      wingConfig: 'Wing Config',
      engineCount: 'Engines',
      detailDensity: 'Detail Density',
      specialFeatures: 'Special Feature',
      background: 'Background'
    };

    for (const key of traitOrder) {
      const value = traits[key];
      const config = RARITY_CONFIG[key]?.[value];
      const tier = config?.tier || 'common';

      html += `
        <div class="trait-item">
          <span class="trait-label">${traitLabels[key]}</span>
          <span class="trait-value ${tier}">${formatTraitValue(value)}</span>
        </div>
      `;
    }

    // Rarity score
    html += `
      <div class="rarity-score">
        <div class="score">${rarityScore}</div>
        <div class="tier">${rarityTier}</div>
      </div>
    `;

    this.traitsContent.innerHTML = html;
  }

  resize() {
    const container = this.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer.setSize(width, height);

    const aspect = width / height;
    const frustumSize = 8;
    this.camera.left = (frustumSize * aspect) / -2;
    this.camera.right = (frustumSize * aspect) / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();
  }

  setCameraPreset(preset) {
    const presets = {
      default: { position: [6, 5, 6], target: [0, 0, 0] },
      front: { position: [10, 2, 0], target: [0, 0, 0] },
      side: { position: [0, 2, 10], target: [0, 0, 0] },
      top: { position: [0, 12, 0.1], target: [0, 0, 0] },
      dramatic: { position: [8, 3, 4], target: [0, 0.5, 0] }
    };

    const config = presets[preset] || presets.default;
    this.camera.position.set(...config.position);
    this.camera.lookAt(...config.target);
    this.controls.target.set(...config.target);
  }

  randomSeed() {
    this.seedInput.value = Math.floor(Math.random() * 1000000);
    this.generate();
  }

  exportImage() {
    this.renderer.render(this.scene, this.camera);

    this.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `void-vessel-${this.seedInput.value}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  exportMetadata() {
    if (!this.currentShipData) return;

    const { traits, rarityScore, seed } = this.currentShipData;
    const rarityTier = getRarityTier(rarityScore);

    const metadata = {
      name: `Void Vessel #${seed}`,
      description: `A procedurally generated wireframe spacecraft from the Void Vessels collection. Seed: ${seed}`,
      image: `ipfs://YOUR_CID/${seed}.png`,
      external_url: `https://voidvessels.io/ship/${seed}`,
      attributes: [
        { trait_type: 'Hull Type', value: formatTraitValue(traits.hull) },
        { trait_type: 'Wing Configuration', value: formatTraitValue(traits.wingConfig) },
        { trait_type: 'Engine Count', value: formatTraitValue(traits.engineCount) },
        { trait_type: 'Detail Density', value: formatTraitValue(traits.detailDensity) },
        { trait_type: 'Special Feature', value: formatTraitValue(traits.specialFeatures) },
        { trait_type: 'Background', value: formatTraitValue(traits.background) },
        { display_type: 'number', trait_type: 'Rarity Score', value: rarityScore },
        { trait_type: 'Rarity Tier', value: rarityTier },
        { display_type: 'number', trait_type: 'Generation Seed', value: seed }
      ]
    };

    const json = JSON.stringify(metadata, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `void-vessel-${seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  showLoading(show) {
    this.loadingEl.classList.toggle('active', show);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize viewer
new ShipViewer();
