import React, { useMemo } from "react";
import * as THREE from "three";

// @ts-expect-error - JS module
import { SeededRandom } from "../../lib/seededRandom.js";
// @ts-expect-error - JS module
import { createBackground } from "../../lib/backgroundTypes.js";

type Background3DProps = {
  seed: number;
  backgroundType: string;
};

export const Background3D: React.FC<Background3DProps> = ({
  seed,
  backgroundType,
}) => {
  // Create background group using existing module
  // Original viewer.js line 198: const bgRng = new SeededRandom(seed);
  // Background uses a fresh RNG with the same seed
  const backgroundGroup = useMemo((): THREE.Group => {
    const rng = new SeededRandom(seed);
    return createBackground(rng, backgroundType);
  }, [seed, backgroundType]);

  return <primitive object={backgroundGroup} />;
};
