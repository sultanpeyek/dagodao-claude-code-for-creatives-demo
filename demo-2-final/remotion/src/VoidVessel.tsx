import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";
import { Ship3D } from "./Ship3D";
import { Background3D } from "./Background3D";

// @ts-expect-error - JS module
import { SeededRandom } from "../../lib/seededRandom.js";
// @ts-expect-error - JS module
import { selectTraits } from "../../lib/shipGenerator.js";

type VoidVesselProps = {
  seed: number;
};

export const VoidVessel: React.FC<VoidVesselProps> = ({ seed }) => {
  const { width, height } = useVideoConfig();

  // Get traits for background (need to know background type)
  // Use fresh RNG matching original behavior
  const traits = useMemo(() => {
    const rng = new SeededRandom(seed);
    return selectTraits(rng);
  }, [seed]);

  // Calculate orthographic camera frustum (matching viewer.js lines 40-51)
  const frustumSize = 8;
  const aspect = width / height;

  return (
    <div style={{ backgroundColor: "white", width, height }}>
      <ThreeCanvas
        orthographic
        width={width}
        height={height}
        camera={{
          position: [6, 5, 6] as [number, number, number],
          left: (-frustumSize * aspect) / 2,
          right: (frustumSize * aspect) / 2,
          top: frustumSize / 2,
          bottom: -frustumSize / 2,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* Background scene based on trait */}
        <Background3D seed={seed} backgroundType={traits.background} />

        {/* Ship wireframe geometry */}
        <Ship3D seed={seed} traits={traits} />
      </ThreeCanvas>
    </div>
  );
};
