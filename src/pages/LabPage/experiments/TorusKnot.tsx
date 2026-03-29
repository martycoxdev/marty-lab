import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useFrame, useThree } from '@react-three/fiber';
import { FloatingMesh } from '../../../components/three/FloatingMesh';
import { LabEffects } from '../../../components/three/LabEffects';
import { Heading, Text } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { HexColorInput } from '../../../components/ui/HexColorInput';
import styles from '../LabPage.module.css';

// ─── State ───────────────────────────────────────────────────────────────────

interface State {
  color: string;
  wireframe: boolean;
}

interface Ctx extends State {
  patch: (p: Partial<State>) => void;
}

const TorusKnotCtx = createContext<Ctx>(null!);

// ─── Provider ────────────────────────────────────────────────────────────────

export function TorusKnotProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ color: '#a78bfa', wireframe: false });
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);
  const value = useMemo(() => ({ ...state, patch }), [state, patch]);
  return <TorusKnotCtx.Provider value={value}>{children}</TorusKnotCtx.Provider>;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

export function TorusKnotScene() {
  const { color, wireframe } = useContext(TorusKnotCtx);

  const { camera } = useThree();
  // FloatingMesh geometry: torusKnot radius=1, tube radius=0.3.
  // Scroll drives camera distance; OrbitControls owns the rotation angle.
  const cam = useRef({ z: 5 });

  useGSAP(() => {
    gsap
      .timeline({
        scrollTrigger: { start: 0, end: 'max', scrub: 2 },
      })
      // Phase 1 — approach (0–25 %): pull into the knot's personal space
      .to(cam.current, { z: 2.2, duration: 1, ease: 'power1.inOut' })
      // Phase 2–3 — deep dive (25–75 %): camera inside the knot geometry
      .to(cam.current, { z: 0.4, duration: 2, ease: 'power2.inOut' })
      // Phase 4 — pull out (75–100 %): dramatic retreat to wide view
      .to(cam.current, { z: 4.5, duration: 1, ease: 'power3.in' });
  });

  useEffect(() => {
    return () => {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
    };
  }, [camera]);

  // Priority 1 runs after OrbitControls (priority 0).
  // Preserve the orbit rotation by normalising position, then scale to scroll distance.
  useFrame(() => {
    const len = camera.position.length();
    if (len > 0.01) camera.position.multiplyScalar(cam.current.z / len);
  }, 1);

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 6]} intensity={4} color={color} />
      <pointLight position={[-6, -4, -4]} intensity={3} color="#f472b6" />
      <pointLight position={[0, -6, 6]} intensity={2} color="#6ee7b7" />
      <FloatingMesh color={color} wireframe={wireframe} />
      <LabEffects bloomMultiplier={1.2} />
    </>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function TorusKnotPanel() {
  const { color, wireframe, patch } = useContext(TorusKnotCtx);
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('[data-line]', {
        x: -40,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.05,
      });
      gsap.from('[data-ctrl]', {
        y: 18,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.3,
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={styles.panelSection}>
      <div className={styles.panelMeta}>
        <Text size="xs" mono muted data-line className={styles.overline}>
          geometry
        </Text>
        <Heading as="h2" size="3xl" data-line>
          Torus Knot
        </Heading>
        <Text size="base" muted data-line className={styles.body}>
          A (2,3) torus knot — the trefoil. One of the simplest non-trivial knots, it
          winds around the tube twice and the axis three times before closing. The camera
          orbits freely; drag to explore the grooves.
        </Text>
      </div>

      <div className={styles.specs}>
        <div className={styles.specGroup} data-ctrl>
          <Text size="xs" mono muted className={styles.specGroupLabel}>
            material
          </Text>
          <div className={styles.specGroupGrid}>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                colour
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {color}
              </Text>
              <HexColorInput value={color} onChange={(c) => patch({ color: c })} />
            </label>
            <div className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                wireframe
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {wireframe ? 'on' : 'off'}
              </Text>
              <Button
                variant={wireframe ? 'primary' : 'outline'}
                size="sm"
                onClick={() => patch({ wireframe: !wireframe })}
              >
                Toggle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
