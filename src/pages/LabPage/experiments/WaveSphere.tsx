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
import { WaveSphereMesh } from '../../../components/three/WaveSphereMesh';
import { LabEffects } from '../../../components/three/LabEffects';
import { Heading, Text } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { HexColorInput } from '../../../components/ui/HexColorInput';
import styles from '../LabPage.module.css';

// ─── State ───────────────────────────────────────────────────────────────────

const PTS_OPTIONS = [16, 32, 64, 128, 256, 512];

const rand = (min: number, max: number, step: number) =>
  Math.round((min + Math.random() * (max - min)) / step) * step;

function randomVibrantHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 35);
  const l = 50 + Math.floor(Math.random() * 25);
  const sl = s / 100,
    ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface State {
  numBands: number;
  waveFreq: number;
  waveAmp: number;
  ptsPerBand: number;
  lineWidth: number;
  lineColor: string;
  bloomMultiplier: number;
  isAuto: boolean;
}

interface Ctx extends State {
  patch: (p: Partial<State>) => void;
}

const WaveSphereCtx = createContext<Ctx>(null!);

// ─── Provider ────────────────────────────────────────────────────────────────

export function WaveSphereProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    numBands: 14,
    waveFreq: 6,
    waveAmp: 0.09,
    ptsPerBand: 256,
    lineWidth: 1,
    lineColor: '#6ee7b7',
    bloomMultiplier: 1,
    isAuto: false,
  });
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);
  const value = useMemo(() => ({ ...state, patch }), [state, patch]);
  return <WaveSphereCtx.Provider value={value}>{children}</WaveSphereCtx.Provider>;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

export function WaveSphereScene() {
  const {
    numBands,
    waveFreq,
    waveAmp,
    ptsPerBand,
    lineWidth,
    lineColor,
    bloomMultiplier,
  } = useContext(WaveSphereCtx);

  const { camera } = useThree();
  // Scroll drives camera distance; OrbitControls owns the rotation angle.
  const cam = useRef({ z: 5 });

  useGSAP(() => {
    // 0–50 %  approach — move in close to the sphere
    // 50–100% retreat — pull back wider than start for drama
    gsap
      .timeline({
        scrollTrigger: { start: 0, end: 'max', scrub: 2 },
      })
      .to(cam.current, { z: 2.4, duration: 2, ease: 'power1.inOut' })
      .to(cam.current, { z: 6, duration: 2, ease: 'power2.in' });
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
      <ambientLight intensity={0.1} />
      <pointLight position={[6, 6, 6]} intensity={4} color="#6ee7b7" />
      <pointLight position={[-6, -4, -6]} intensity={3} color="#a78bfa" />
      <pointLight position={[0, -8, 4]} intensity={2} color="#f472b6" />
      <WaveSphereMesh
        numBands={numBands}
        waveFreq={waveFreq}
        waveAmp={waveAmp}
        segments={ptsPerBand}
        lineWidth={lineWidth}
        color={lineColor}
      />
      <LabEffects bloomMultiplier={bloomMultiplier} />
    </>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function WaveSpherePanel() {
  const {
    numBands,
    waveFreq,
    waveAmp,
    ptsPerBand,
    lineWidth,
    lineColor,
    bloomMultiplier,
    isAuto,
    patch,
  } = useContext(WaveSphereCtx);

  const rootRef = useRef<HTMLDivElement>(null);
  const autoTweenRef = useRef<gsap.core.Tween | null>(null);

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

  useEffect(() => {
    if (!isAuto) {
      autoTweenRef.current?.kill();
      return;
    }
    const step = () => {
      patch({
        waveFreq: rand(2, 12, 1),
        waveAmp: Math.round((0.02 + Math.random() * 0.26) * 100) / 100,
        lineWidth: rand(0.5, 6, 0.5),
        lineColor: randomVibrantHex(),
        bloomMultiplier: Math.round((0.2 + Math.random() * 1.8) * 10) / 10,
      });
      autoTweenRef.current = gsap.delayedCall(2.5 + Math.random() * 2, step);
    };
    step();
    return () => {
      autoTweenRef.current?.kill();
    };
  }, [isAuto, patch]);

  function randomize() {
    patch({
      numBands: rand(2, 30, 1),
      waveFreq: rand(1, 16, 1),
      waveAmp: Math.round((0.01 + Math.random() * 0.39) * 100) / 100,
      ptsPerBand: PTS_OPTIONS[Math.floor(Math.random() * PTS_OPTIONS.length)],
      lineWidth: rand(0.5, 16, 0.5),
      lineColor: randomVibrantHex(),
    });
  }

  return (
    <div ref={rootRef} className={styles.panelSection}>
      <div className={styles.panelMeta}>
        <Text size="xs" mono muted data-line className={styles.overline}>
          geometry
        </Text>
        <Heading as="h2" size="3xl" data-line>
          Wave Sphere
        </Heading>
        <Text size="base" muted data-line className={styles.body}>
          Each latitude ring traces a sine curve on the sphere surface, oscillating in the
          polar direction as it travels the azimuth.
        </Text>
      </div>

      <div className={styles.specs}>
        <div className={styles.specGroup} data-ctrl>
          <Text size="xs" mono className={styles.specGroupLabel}>
            structure
          </Text>
          <div className={styles.specGroupGrid}>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                bands
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {numBands}
              </Text>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={numBands}
                onChange={(e) => patch({ numBands: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                pts / band
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {ptsPerBand}
              </Text>
              <input
                type="range"
                min={0}
                max={PTS_OPTIONS.length - 1}
                step={1}
                value={PTS_OPTIONS.indexOf(ptsPerBand)}
                onChange={(e) =>
                  patch({ ptsPerBand: PTS_OPTIONS[Number(e.target.value)] })
                }
                className={styles.slider}
              />
            </label>
          </div>
        </div>

        <div className={styles.specGroup} data-ctrl>
          <Text size="xs" mono className={styles.specGroupLabel}>
            wave{isAuto && <span className={styles.autoTag}> · auto</span>}
          </Text>
          <div className={styles.specGroupGrid}>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                freq
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {waveFreq}
              </Text>
              <input
                type="range"
                min={1}
                max={16}
                step={1}
                value={waveFreq}
                onChange={(e) => patch({ waveFreq: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                amplitude
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {waveAmp.toFixed(2)}
              </Text>
              <input
                type="range"
                min={0.01}
                max={0.4}
                step={0.01}
                value={waveAmp}
                onChange={(e) => patch({ waveAmp: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                line width
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {lineWidth}px
              </Text>
              <input
                type="range"
                min={0.5}
                max={16}
                step={0.5}
                value={lineWidth}
                onChange={(e) => patch({ lineWidth: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                colour
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {lineColor}
              </Text>
              <HexColorInput
                value={lineColor}
                onChange={(c) => patch({ lineColor: c })}
              />
            </label>
            <label className={styles.spec}>
              <Text size="xs" mono muted className={styles.specKey}>
                bloom
              </Text>
              <Text size="sm" mono className={styles.specVal}>
                {bloomMultiplier.toFixed(1)}×
              </Text>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={bloomMultiplier}
                onChange={(e) => patch({ bloomMultiplier: Number(e.target.value) })}
                className={styles.slider}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.actions} data-ctrl>
        <Button variant="outline" size="sm" onClick={randomize} disabled={isAuto}>
          Randomize
        </Button>
        <Button
          variant={isAuto ? 'primary' : 'outline'}
          size="sm"
          onClick={() => patch({ isAuto: !isAuto })}
        >
          {isAuto ? 'Stop' : 'Auto'}
        </Button>
      </div>
    </div>
  );
}
