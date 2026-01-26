import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// @ts-expect-error - JS module
import { SeededRandom } from "../../lib/seededRandom.js";
// @ts-expect-error - JS module
import { RARITY_CONFIG } from "../../config/rarity.js";
// @ts-expect-error - JS module
import { createHull } from "../../lib/hullTypes.js";
// @ts-expect-error - JS module
import { generateWings } from "../../lib/wingConfigs.js";
// @ts-expect-error - JS module
import { generateEngines } from "../../lib/enginePods.js";
// @ts-expect-error - JS module
import { generateSpecialFeature } from "../../lib/antennaTypes.js";
// @ts-expect-error - JS module
import { addSurfaceDetails } from "../../lib/surfaceDetails.js";

type Ship3DProps = {
  seed: number;
  traits: {
    hull: string;
    wingConfig: string;
    engineCount: string;
    detailDensity: string;
    specialFeatures: string;
    background: string;
  };
};

// Helper to select traits with RNG (matches viewer.js selectTraits)
function selectTraitsWithRng(rng: InstanceType<typeof SeededRandom>) {
  const traits: Record<string, string> = {};
  for (const [category, options] of Object.entries(RARITY_CONFIG)) {
    const weighted = Object.entries(options as Record<string, { weight: number }>).map(
      ([value, config]) => ({
        value,
        weight: config.weight,
      })
    );
    traits[category] = rng.weighted(weighted);
  }
  return traits;
}

export const Ship3D: React.FC<Ship3DProps> = ({ seed }) => {
  // Generate ship geometry using existing modules
  // Match exact behavior from viewer.js generateShip()
  const edgesGeometry = useMemo(() => {
    // Create fresh RNG - matches viewer.js line 115
    const rng = new SeededRandom(seed);

    // Select traits - this advances the RNG state (matches viewer.js line 116)
    const traits = selectTraitsWithRng(rng);

    const geometries: THREE.BufferGeometry[] = [];

    // 1. Generate hull (viewer.js line 120)
    const hullGeos = createHull(rng, traits.hull);
    geometries.push(...hullGeos);

    // 2. Generate wings (viewer.js line 124)
    const wingGeos = generateWings(rng, traits.wingConfig, traits.hull);
    geometries.push(...wingGeos);

    // 3. Generate engines (viewer.js line 128)
    const engineGeos = generateEngines(rng, traits.engineCount, traits.hull);
    geometries.push(...engineGeos);

    // 4. Generate special features (viewer.js line 132-135)
    if (traits.specialFeatures !== "none") {
      const featureGeos = generateSpecialFeature(
        rng,
        traits.specialFeatures,
        traits.hull
      );
      geometries.push(...featureGeos);
    }

    // 5. Add surface details (viewer.js line 138)
    const detailGeos = addSurfaceDetails(rng, traits.detailDensity, traits.hull);
    geometries.push(...detailGeos);

    // 6. Merge all geometries (viewer.js line 142-151)
    const validGeometries = geometries.filter(
      (geo): geo is THREE.BufferGeometry =>
        geo !== null &&
        geo !== undefined &&
        geo.attributes !== undefined &&
        geo.attributes.position !== undefined
    );

    let mergedGeometry: THREE.BufferGeometry;
    if (validGeometries.length > 0) {
      mergedGeometry = mergeGeometries(validGeometries, false);
    } else {
      mergedGeometry = new THREE.BoxGeometry(2, 1, 1, 4, 2, 2);
    }

    // 7. Create edges for wireframe rendering (viewer.js line 154)
    return new THREE.EdgesGeometry(mergedGeometry, 15);
  }, [seed]);

  return (
    <lineSegments geometry={edgesGeometry}>
      <lineBasicMaterial color={0x000000} linewidth={1} />
    </lineSegments>
  );
};
