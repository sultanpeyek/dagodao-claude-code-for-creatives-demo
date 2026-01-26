import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { CameraScene } from "./CameraScene";
import { CAMERA_PRESETS, VIDEO_CONFIG } from "./cameraPresets";

type VoidVesselVideoProps = {
  seed: number;
};

/**
 * VoidVesselVideo - Epic video composition with dramatic camera movements
 *
 * Features:
 * - 5 dramatic camera angles with zoom, orbit, and sweeping motion
 * - Seamless infinite loop (last frame matches first frame)
 * - Varied transitions: fade, wipe, slide for cinematic variety
 * - 4 seconds per angle for more dramatic movement
 * - Spring-based transitions for punchy feel
 */
export const VoidVesselVideo: React.FC<VoidVesselVideoProps> = ({ seed }) => {
  const { framesPerAngle, transitionDuration } = VIDEO_CONFIG;

  // Varied dramatic transitions for cinematic feel
  const transitions = [
    // Establishing to close-up: dramatic fade
    {
      presentation: fade(),
      timing: springTiming({
        config: { damping: 200, stiffness: 100 },
        durationInFrames: transitionDuration,
      }),
    },
    // Close-up to hero front: fast wipe from bottom
    {
      presentation: wipe({ direction: "from-bottom" }),
      timing: linearTiming({ durationInFrames: transitionDuration }),
    },
    // Hero front to side sweep: slide from right
    {
      presentation: slide({ direction: "from-right" }),
      timing: springTiming({
        config: { damping: 150, stiffness: 120 },
        durationInFrames: transitionDuration,
      }),
    },
    // Side sweep to loop-return: dramatic wipe from top
    {
      presentation: wipe({ direction: "from-top" }),
      timing: linearTiming({ durationInFrames: transitionDuration }),
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <TransitionSeries>
        {CAMERA_PRESETS.map((preset, index) => (
          <React.Fragment key={preset.name}>
            <TransitionSeries.Sequence durationInFrames={framesPerAngle}>
              <CameraScene seed={seed} preset={preset} />
            </TransitionSeries.Sequence>

            {/* Add transition after each scene except the last */}
            {index < CAMERA_PRESETS.length - 1 && (
              <TransitionSeries.Transition
                presentation={transitions[index].presentation}
                timing={transitions[index].timing}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
