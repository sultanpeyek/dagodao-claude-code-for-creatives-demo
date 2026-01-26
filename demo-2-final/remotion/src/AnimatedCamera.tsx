import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useCurrentFrame, interpolate } from "remotion";
import * as THREE from "three";
import type { CameraPreset } from "./cameraPresets";
import { VIDEO_CONFIG } from "./cameraPresets";

type AnimatedCameraProps = {
  preset: CameraPreset;
};

// Custom easing functions
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Get easing function based on animation style
 */
function getEasing(style: CameraPreset["style"]): (t: number) => number {
  switch (style) {
    case "punchy":
      return easeOutBack;
    case "dramatic":
      return easeInOutCubic;
    case "sweep":
      return easeInOutQuad;
    case "smooth":
    default:
      return easeOutCubic;
  }
}

/**
 * AnimatedCamera - Epic camera movements with zoom, orbit, and dramatic motion
 * Uses useFrame for smooth, synchronous updates
 */
export const AnimatedCamera: React.FC<AnimatedCameraProps> = ({ preset }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());

  // Use useFrame for synchronous camera updates (no stuttering)
  useFrame(() => {
    const cam = camera as THREE.OrthographicCamera;
    const totalFrames = VIDEO_CONFIG.framesPerAngle;
    const easing = getEasing(preset.style);

    // Main animation progress (0 to 1)
    const mainProgress = interpolate(
      frame,
      [0, totalFrames * 0.85],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing,
      }
    );

    // Zoom animation with custom easing
    const zoomEasing = preset.style === "punchy" ? easeOutBack : easeInOutCubic;
    const zoomProgress = interpolate(
      frame,
      [0, totalFrames * 0.7],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: zoomEasing,
      }
    );

    // Orbital rotation progress
    const orbitProgress = interpolate(
      frame,
      [0, totalFrames],
      [0, preset.orbitAmount],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easeInOutSine,
      }
    );

    // Calculate base position interpolation
    const baseX = preset.startPosition[0] + (preset.endPosition[0] - preset.startPosition[0]) * mainProgress;
    const baseY = preset.startPosition[1] + (preset.endPosition[1] - preset.startPosition[1]) * mainProgress;
    const baseZ = preset.startPosition[2] + (preset.endPosition[2] - preset.startPosition[2]) * mainProgress;

    // Apply orbital rotation around Y axis
    const distance = Math.sqrt(baseX * baseX + baseZ * baseZ);
    const angle = Math.atan2(baseZ, baseX) + orbitProgress;
    const orbitalX = Math.cos(angle) * distance;
    const orbitalZ = Math.sin(angle) * distance;

    // Add subtle breathing motion for extra dynamism
    const breathingPhase = interpolate(
      frame,
      [0, totalFrames],
      [0, Math.PI * 2],
      { extrapolateRight: "extend" }
    );
    const breathingAmplitude = 0.15;
    const breathing = Math.sin(breathingPhase) * breathingAmplitude;

    // Set camera position with breathing
    cam.position.set(
      orbitalX + breathing * 0.5,
      baseY + breathing * 0.3,
      orbitalZ + breathing * 0.5
    );

    // Calculate zoom (frustum size)
    const currentZoom = preset.startZoom + (preset.endZoom - preset.startZoom) * zoomProgress;

    // Add zoom pulse for dramatic effect (only for punchy style)
    const zoomPulse = preset.style === "punchy"
      ? Math.sin(frame * 0.1) * 0.2
      : 0;
    const finalZoom = currentZoom + zoomPulse;

    // Update orthographic camera frustum
    const aspect = 1; // Square aspect ratio (1024x1024)
    cam.left = (-finalZoom * aspect) / 2;
    cam.right = (finalZoom * aspect) / 2;
    cam.top = finalZoom / 2;
    cam.bottom = -finalZoom / 2;

    // Look at target with slight drift for organic feel
    const targetDrift = Math.sin(frame * 0.05) * 0.1;
    targetRef.current.set(
      preset.target[0] + targetDrift,
      preset.target[1],
      preset.target[2] + targetDrift * 0.5
    );
    cam.lookAt(targetRef.current);
    cam.updateProjectionMatrix();
  });

  return null;
};
