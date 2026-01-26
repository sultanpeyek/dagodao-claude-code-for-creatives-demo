/**
 * Camera presets for Void Vessels video composition.
 * Enhanced with dramatic zoom and movement parameters.
 * Designed for seamless infinite looping.
 */

export type CameraPreset = {
  name: string;
  /** Starting camera position */
  startPosition: [number, number, number];
  /** Ending camera position */
  endPosition: [number, number, number];
  /** Camera look-at target */
  target: [number, number, number];
  /** Starting zoom level (frustum size - smaller = more zoomed in) */
  startZoom: number;
  /** Ending zoom level */
  endZoom: number;
  /** Orbital rotation in radians (around Y axis) */
  orbitAmount: number;
  /** Animation style */
  style: "smooth" | "punchy" | "dramatic" | "sweep";
};

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    name: "establishing",
    startPosition: [12, 8, 12],
    endPosition: [6, 5, 6],
    target: [0, 0, 0],
    startZoom: 12,
    endZoom: 8,
    orbitAmount: 0.3,
    style: "smooth",
  },
  {
    name: "dramatic-close",
    startPosition: [8, 3, 4],
    endPosition: [5, 2, 3],
    target: [0, 0.5, 0],
    startZoom: 8,
    endZoom: 5,
    orbitAmount: -0.2,
    style: "punchy",
  },
  {
    name: "hero-front",
    startPosition: [14, 4, 0],
    endPosition: [8, 2, 0],
    target: [0, 0, 0],
    startZoom: 10,
    endZoom: 6,
    orbitAmount: 0.15,
    style: "dramatic",
  },
  {
    name: "side-sweep",
    startPosition: [-4, 3, 12],
    endPosition: [4, 2, 10],
    target: [0, 0, 0],
    startZoom: 9,
    endZoom: 7,
    orbitAmount: 0.4,
    style: "sweep",
  },
  {
    // Loop back to starting position for seamless infinite loop
    name: "loop-return",
    startPosition: [0, 10, 6],
    endPosition: [12, 8, 12], // Matches first preset's startPosition
    target: [0, 0, 0],
    startZoom: 6,
    endZoom: 12, // Matches first preset's startZoom
    orbitAmount: 0.35,
    style: "smooth",
  },
];

/**
 * Video timing configuration
 */
export const VIDEO_CONFIG = {
  fps: 30,
  framesPerAngle: 120, // 4 seconds per angle for more dramatic movement
  transitionDuration: 25, // Slightly longer transitions
  width: 1024,
  height: 1024,
};

/**
 * Calculate total video duration in frames
 */
export function calculateTotalFrames(): number {
  const numAngles = CAMERA_PRESETS.length;
  const numTransitions = numAngles - 1;
  return numAngles * VIDEO_CONFIG.framesPerAngle - numTransitions * VIDEO_CONFIG.transitionDuration;
}
