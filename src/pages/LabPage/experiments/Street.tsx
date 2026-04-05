import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Heading, Text } from '../../../components/ui/Typography';
import styles from '../LabPage.module.css';

// ─── Constants ───────────────────────────────────────────────────────────────

// Match these to the X extents of your model (check in Blender: select first/last
// house → Item panel → Location X).
const STREET_START = 10;
const STREET_END = 600;

// ─── State ───────────────────────────────────────────────────────────────────

interface State {
  eyeHeight: number;
  lookAtHeight: number;
  camDistance: number;
}

interface Ctx extends State {
  patch: (p: Partial<State>) => void;
}

const StreetCtx = createContext<Ctx>(null!);

// ─── Provider ────────────────────────────────────────────────────────────────

export function StreetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    eyeHeight: 12,
    lookAtHeight: 5,
    camDistance: 12,
  });
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);
  const value = useMemo(() => ({ ...state, patch }), [state, patch]);
  return <StreetCtx.Provider value={value}>{children}</StreetCtx.Provider>;
}

// ─── Model ───────────────────────────────────────────────────────────────────

function HousesModel() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/houses.glb`);

  useMemo(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        mat.side = THREE.DoubleSide;
        if (mat instanceof THREE.MeshStandardMaterial && mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.map.needsUpdate = true;
        }
        mat.needsUpdate = true;
      });
    });
  }, [scene]);

  return <primitive object={scene} />;
}

useGLTF.preload(`${import.meta.env.BASE_URL}models/houses.glb`);

// ─── Scene ───────────────────────────────────────────────────────────────────

export function StreetScene() {
  const { eyeHeight, lookAtHeight, camDistance } = useContext(StreetCtx);
  const { camera } = useThree();

  const cam = useRef({ x: STREET_START });

  useGSAP(
    () => {
      cam.current.x = STREET_START;

      gsap
        .timeline({
          scrollTrigger: { start: 0, end: 'max', scrub: 1 },
        })
        .to(cam.current, {
          x: STREET_END,
          duration: 4,
          ease: 'none',
        });

      // Force ScrollTrigger to remeasure end: 'max' against the current scroll
      // space height — without this it can latch onto a stale value.
      ScrollTrigger.refresh();
    },
    { dependencies: [], revertOnUpdate: false },
  );

  useEffect(() => {
    return () => {
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
    };
  }, [camera]);

  useFrame(() => {
    camera.position.set(cam.current.x, eyeHeight, camDistance);
    camera.lookAt(cam.current.x, lookAtHeight, 0);
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} />
      <directionalLight position={[-8, 6, -8]} intensity={0.4} color="#b0d0ff" />
      <Suspense fallback={null}>
        <HousesModel />
      </Suspense>
    </>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function StreetPanel() {
  const { eyeHeight, lookAtHeight, camDistance, patch } = useContext(StreetCtx);
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
          glb scene
        </Text>
        <Heading as="h2" size="3xl" data-line>
          Street
        </Heading>
        <Text size="base" muted data-line className={styles.body}>
          20 low-poly houses aligned on the X axis. Scroll drives the camera door to door
          down the street.
        </Text>
      </div>

      <div className={styles.specs}>
        <div className={styles.specGroup} data-ctrl>
          <Text size="xs" mono className={styles.specGroupLabel}>
            camera
          </Text>
          <div className={styles.specGroupGrid}>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                eye height
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {eyeHeight.toFixed(1)}
              </Text>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.1}
                value={eyeHeight}
                onChange={(e) => patch({ eyeHeight: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                distance
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {camDistance.toFixed(1)}
              </Text>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={camDistance}
                onChange={(e) => patch({ camDistance: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                look at y
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {lookAtHeight.toFixed(1)}
              </Text>
              <input
                type="range"
                min={-5}
                max={20}
                step={0.1}
                value={lookAtHeight}
                onChange={(e) => patch({ lookAtHeight: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
          </div>
        </div>
      </div>

      <p className={styles.credit}>
        model by{' '}
        <a
          href="https://www.cgtrader.com/designers/ilkhom23?utm_source=credit&utm_source=credit_item_page"
          target="_blank"
          rel="noopener noreferrer"
        >
          ilkhom23
        </a>{' '}
        on CGTrader
      </p>
    </div>
  );
}
