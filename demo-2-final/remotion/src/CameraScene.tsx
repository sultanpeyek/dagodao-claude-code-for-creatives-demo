import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";
import { Ship3D } from "./Ship3D";
import { Background3D } from "./Background3D";
import { AnimatedCamera } from "./AnimatedCamera";
import type { CameraPreset } from "./cameraPresets";

// @ts-expect-error - JS module
import { SeededRandom } from "../../lib/seededRandom.js";
// @ts-expect-error - JS module
import { selectTraits } from "../../lib/shipGenerator.js";

type CameraSceneProps = {
  seed: number;
  preset: CameraPreset;
};

/**
 * CameraScene - Renders ship from a specific camera angle
 *
 * Wraps the 3D scene with an animated camera that moves
 * smoothly within the scene duration.
 */
export const CameraScene: React.FC<CameraSceneProps> = ({ seed, preset }) => {
  const { width, height } = useVideoConfig();

  // Get traits for background
  const traits = useMemo(() => {
    const rng = new SeededRandom(seed);
    return selectTraits(rng);
  }, [seed]);

  // Calculate orthographic camera frustum
  const frustumSize = 8;
  const aspect = width / height;

  return (
    <div style={{ backgroundColor: "white", width, height }}>
      <ThreeCanvas
        orthographic
        width={width}
        height={height}
        camera={{
          position: preset.position,
          left: (-frustumSize * aspect) / 2,
          right: (frustumSize * aspect) / 2,
          top: frustumSize / 2,
          bottom: -frustumSize / 2,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* Animated camera controller */}
        <AnimatedCamera preset={preset} />

        {/* Background scene based on trait */}
        <Background3D seed={seed} backgroundType={traits.background} />

        {/* Ship wireframe geometry */}
        <Ship3D seed={seed} traits={traits} />
      </ThreeCanvas>
    </div>
  );
};
