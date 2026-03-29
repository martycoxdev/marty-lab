import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import type { Group } from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useTheme } from "../../context/ThemeContext";

interface WaveSphereMeshProps {
  radius?: number;
  numBands?: number;
  waveFreq?: number;
  /** Angular amplitude of each band's sine wave, in radians */
  waveAmp?: number;
  segments?: number;
  /** Overrides the theme-derived line width (px) */
  lineWidth?: number;
  /** Overrides the theme-derived line colour */
  color?: string;
}

/**
 * Each band is a closed curve on the sphere surface:
 *   θ(φ) = θ_centre + waveAmp * sin(waveFreq * φ)
 */
function buildBandFlat(
  thetaCentre: number,
  radius: number,
  waveAmp: number,
  waveFreq: number,
  segments: number,
): number[] {
  // waveFreq must be an integer so the band closes cleanly (sin(n·2π)=0).
  // Rounding here means the curve is always seamless even mid-tween.
  const freq = Math.round(waveFreq);
  const flat: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    const theta = thetaCentre + waveAmp * Math.sin(freq * phi);
    flat.push(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi),
    );
  }
  return flat;
}

// drei's Line wraps Line2 but forwards the ref as the Line2 instance.
// We only need enough of its type to access geometry and material.
type Line2Like = {
  geometry: THREE.BufferGeometry & { setPositions(arr: number[]): void };
  material: THREE.ShaderMaterial & { linewidth: number; color: THREE.Color };
};

export function WaveSphereMesh({
  radius = 1.2,
  numBands = 14,
  waveFreq = 6,
  waveAmp = 0.09,
  segments = 256,
  lineWidth: lineWidthProp,
  color: colorProp,
}: WaveSphereMeshProps) {
  const groupRef = useRef<Group>(null);
  const lineRefs = useRef<(Line2Like | null)[]>([]);
  const scrollScale = useRef(1);
  const { theme } = useTheme();

  const resolvedColor =
    colorProp ?? (theme === "light" ? "#047857" : "#6ee7b7");
  const resolvedLineWidth = lineWidthProp ?? (theme === "light" ? 2 : 1);

  // ── Animated wave params ─────────────────────────────────────────────────
  // GSAP tweens this ref; useFrame reads it each tick — no React re-renders.
  const wave = useRef({ waveAmp, waveFreq, lineWidth: resolvedLineWidth });
  const waveTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    // waveFreq must be an integer for the band to close (sin(n·2π) = 0).
    // Tweening through non-integers creates an open-ended seam, so snap it.
    wave.current.waveFreq = waveFreq;

    // waveAmp and lineWidth CAN tween smoothly — kill the old tween so it
    // continues from its current position rather than snapping back.
    waveTweenRef.current?.kill();
    waveTweenRef.current = gsap.to(wave.current, {
      waveAmp,
      lineWidth: resolvedLineWidth,
      duration: 2,
      ease: "power2.inOut",
    });
    return () => {
      waveTweenRef.current?.kill();
    };
  }, [waveAmp, waveFreq, resolvedLineWidth]);

  // ── Animated colour ──────────────────────────────────────────────────────
  const currentColor = useRef(new THREE.Color(resolvedColor));
  const targetColor = useRef(new THREE.Color(resolvedColor));

  useEffect(() => {
    targetColor.current.set(resolvedColor);
  }, [resolvedColor]);

  // ── Initial geometry (structural only — numBands, segments, radius) ──────
  // waveAmp/waveFreq are NOT deps here; useFrame owns those updates.
  const initialPoints = useMemo(
    () =>
      Array.from({ length: numBands }, (_, i) => {
        const thetaCentre = ((i + 1) / (numBands + 1)) * Math.PI;
        // Use current animated values so the first frame is already correct.
        return buildBandFlat(
          thetaCentre,
          radius,
          wave.current.waveAmp,
          wave.current.waveFreq,
          segments,
        );
      }),
    [numBands, radius, segments],
  );

  // ── Per-frame ─────────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();

    // Scroll-driven scale
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    scrollScale.current += (1 + progress * 2 - scrollScale.current) * 0.08;

    groupRef.current.rotation.y = (t / 14) * Math.PI * 1.3;
    groupRef.current.rotation.x = Math.sin(t * (Math.PI / 4)) * Math.PI * 0.05;
    groupRef.current.scale.setScalar(
      (1 + 0.02 * (1 - Math.cos(t * (Math.PI / 4)))) * scrollScale.current,
    );

    // Lerp colour (cheap — only mutates a cached THREE.Color)
    currentColor.current.lerp(targetColor.current, 0.08);

    const { waveAmp: amp, waveFreq: freq, lineWidth: lw } = wave.current;

    lineRefs.current.forEach((line, i) => {
      if (!line || i >= numBands) return;
      const thetaCentre = ((i + 1) / (numBands + 1)) * Math.PI;
      line.geometry.setPositions(
        buildBandFlat(thetaCentre, radius, amp, freq, segments),
      );
      line.material.linewidth = lw;
      line.material.color.copy(currentColor.current);
    });
  });

  return (
    <group ref={groupRef}>
      {initialPoints.map((pts, i) => (
        <Line
          key={`${numBands}-${i}`}
          ref={(el: unknown) => {
            lineRefs.current[i] = el as Line2Like | null;
          }}
          points={pts}
          color={resolvedColor}
          lineWidth={resolvedLineWidth}
        />
      ))}
    </group>
  );
}
