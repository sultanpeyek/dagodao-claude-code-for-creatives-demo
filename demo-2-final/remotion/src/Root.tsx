import React from "react";
import { Composition, Still } from "remotion";
import { VoidVessel } from "./VoidVessel";
import { VoidVesselVideo } from "./VoidVesselVideo";
import { VIDEO_CONFIG, calculateTotalFrames } from "./cameraPresets";

export type VoidVesselProps = {
  seed: number;
};

export const Root: React.FC = () => {
  const totalFrames = calculateTotalFrames();

  return (
    <>
      {/* Still image composition (existing) */}
      <Still
        id="VoidVessel"
        component={VoidVessel}
        width={1024}
        height={1024}
        defaultProps={{
          seed: 1,
        } satisfies VoidVesselProps}
      />

      {/* Video composition with camera transitions */}
      <Composition
        id="VoidVesselVideo"
        component={VoidVesselVideo}
        durationInFrames={totalFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{
          seed: 1,
        } satisfies VoidVesselProps}
      />
    </>
  );
};
