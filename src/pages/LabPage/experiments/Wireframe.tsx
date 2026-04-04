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
import { IcosahedronMesh } from '../../../components/three/IcosahedronMesh';
import { LabEffects } from '../../../components/three/LabEffects';
import { Heading, Text } from '../../../components/ui/Typography';
import { HexColorInput } from '../../../components/ui/HexColorInput';
import styles from '../LabPage.module.css';

// ─── State ───────────────────────────────────────────────────────────────────

interface State {
  color: string;
  detail: number;
}

interface Ctx extends State {
  patch: (p: Partial<State>) => void;
}

const WireframeCtx = createContext<Ctx>(null!);

// ─── Provider ────────────────────────────────────────────────────────────────

export function WireframeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ color: '#6ee7b7', detail: 3 });
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);
  const value = useMemo(() => ({ ...state, patch }), [state, patch]);
  return <WireframeCtx.Provider value={value}>{children}</WireframeCtx.Provider>;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

export function WireframeScene() {
  const { color, detail } = useContext(WireframeCtx);

  const { camera } = useThree();
  // Scroll drives camera distance; OrbitControls owns the rotation angle.
  const cam = useRef({ z: 5 });

  useGSAP(() => {
    // 0–55 %  zoom in — get close enough to see individual triangle edges
    // 55–100% retreat — pull back to a wider view
    gsap
      .timeline({
        scrollTrigger: { start: 0, end: 'max', scrub: 3 },
      })
      .to(cam.current, { z: 1.8, duration: 3, ease: 'power2.inOut' })
      .to(cam.current, { z: 4.5, duration: 1.5, ease: 'power2.in' });
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
      <ambientLight intensity={0.12} />
      <pointLight position={[5, 5, 5]} intensity={3} color={color} />
      <pointLight position={[-5, -5, -5]} intensity={2} color="#f472b6" />
      <pointLight position={[0, 6, -4]} intensity={1.5} color="#a78bfa" />
      <IcosahedronMesh color={color} detail={detail} />
      <LabEffects bloomMultiplier={0.7} />
    </>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function WireframePanel() {
  const { color, detail, patch } = useContext(WireframeCtx);
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

  const triCount = 20 * Math.pow(4, detail);

  return (
    <div ref={rootRef} className={styles.panelSection}>
      <div className={styles.panelMeta}>
        <Text size="xs" mono muted data-line className={styles.overline}>
          geometry
        </Text>
        <Heading as="h2" size="3xl" data-line>
          Icosahedron
        </Heading>
        <Text size="base" muted data-line className={styles.body}>
          A geodesic wireframe built by recursively subdividing an icosahedron. Each level quadruples the triangle count.
        </Text>
      </div>

      <div className={styles.specs}>
        <div className={styles.specGroup} data-ctrl>
          <Text size="xs" mono className={styles.specGroupLabel}>
            mesh
          </Text>
          <div className={styles.specGroupGrid}>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                detail
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {detail}&nbsp;
                <span style={{ opacity: 0.45, fontSize: '0.8em' }}>
                  ({triCount.toLocaleString()} tris)
                </span>
              </Text>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={detail}
                onChange={(e) => patch({ detail: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                colour
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {color}
              </Text>
              <HexColorInput value={color} onChange={(c) => patch({ color: c })} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
