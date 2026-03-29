import { useRef, useState, useMemo, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { Button } from "../../components/ui/Button";
import { HexColorInput } from "../../components/ui/HexColorInput";
import { Scene } from "../../components/three/Scene";
import { WaveSphereMesh } from "../../components/three/WaveSphereMesh";
import { LabEffects } from "../../components/three/LabEffects";
import { Text, Heading } from "../../components/ui/Typography";
import styles from "./LabPage.module.css";

const STACK = [
  { label: "Three.js", detail: "WebGL renderer" },
  { label: "React Three Fiber", detail: "Declarative R3F scene graph" },
  { label: "GSAP", detail: "Animation engine + ScrollTrigger" },
  { label: "React 19", detail: "Component framework" },
  { label: "TypeScript", detail: "Type safety throughout" },
  { label: "Vite", detail: "Build tooling" },
];

const PTS_OPTIONS = [16, 32, 64, 128, 256, 512];

const rand = (min: number, max: number, step: number) =>
  Math.round((min + Math.random() * (max - min)) / step) * step;

function randomVibrantHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 35); // 65–100 %
  const l = 50 + Math.floor(Math.random() * 25); // 50–75 % — always bright enough to bloom
  // HSL → hex
  const sl = s / 100,
    ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function LabPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  const [numBands, setNumBands] = useState(14);
  const [waveFreq, setWaveFreq] = useState(6);
  const [waveAmp, setWaveAmp] = useState(0.09);
  const [ptsPerBand, setPtsPerBand] = useState(256);
  const [lineWidth, setLineWidth] = useState(1);
  const [lineColor, setLineColor] = useState("#6ee7b7");
  const [bloomMultiplier, setBloomMultiplier] = useState(1);

  const isMobile = useMemo(
    () => window.matchMedia("(hover: none)").matches,
    [],
  );

  function randomize() {
    setNumBands(rand(2, 30, 1));
    setWaveFreq(rand(1, 16, 1));
    setWaveAmp(Math.round((0.01 + Math.random() * 0.39) * 100) / 100);
    setPtsPerBand(PTS_OPTIONS[Math.floor(Math.random() * PTS_OPTIONS.length)]);
    setLineWidth(rand(0.5, 16, 0.5));
    setLineColor(randomVibrantHex());
  }

  const [isAuto, setIsAuto] = useState(false);
  const autoCallRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!isAuto) {
      autoCallRef.current?.kill();
      return;
    }

    const step = () => {
      setWaveFreq(rand(2, 12, 1));
      setWaveAmp(Math.round((0.02 + Math.random() * 0.26) * 100) / 100);
      setLineWidth(rand(0.5, 6, 0.5));
      setLineColor(randomVibrantHex());
      setBloomMultiplier(Math.round((0.2 + Math.random() * 1.8) * 10) / 10);
      // Vary interval slightly so it feels organic rather than metronomic
      autoCallRef.current = gsap.delayedCall(2.5 + Math.random() * 2, step);
    };

    // Kick off immediately then loop
    step();
    return () => {
      autoCallRef.current?.kill();
    };
  }, [isAuto]);

  useGSAP(
    () => {
      const titleEl = pageRef.current?.querySelector("[data-lab-title]");
      if (titleEl) {
        const split = new SplitText(titleEl, {
          type: "lines,words",
          linesClass: "splitLine",
          wordsClass: "splitWord",
        });
        gsap.from(split.words, {
          yPercent: 110,
          duration: 1,
          stagger: 0.06,
          ease: "power4.out",
          delay: 0.2,
        });
      }

      gsap.from("[data-hero-sub]", {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.7,
      });

      gsap.from("[data-scene-line]", {
        x: -60,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-scene-section]",
          start: "top 65%",
        },
      });

      gsap.from("[data-spec]", {
        y: 30,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-specs]",
          start: "top 70%",
        },
      });

      gsap.from("[data-stack-heading]", {
        yPercent: 110,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: {
          trigger: "[data-stack-section]",
          start: "top 65%",
        },
      });

      gsap.from("[data-stack-item]", {
        x: 40,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-stack-section]",
          start: "top 55%",
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: pageRef },
  );

  return (
    <div ref={pageRef} className={styles.page}>
      <div className={styles.background}>
        <Scene cameraZ={5}>
          <ambientLight intensity={0.1} />
          {/* Coloured point lights illuminate the inner sphere for depth */}
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
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={!isMobile}
            minDistance={0.1}
            maxDistance={12}
            autoRotate={false}
          />
        </Scene>
      </div>

      {/* Intercepts touches on mobile so the canvas never sees them */}
      <div
        className={`${styles.canvasBlocker}${isMobile ? ` ${styles.canvasBlockerMobile}` : ""}`}
      />

      <div className={styles.content}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.titleClip}>
              <Heading
                as="h1"
                size="6xl"
                data-lab-title
                className={styles.title}
              >
                Lab
              </Heading>
            </div>
            <div className={styles.heroSubs}>
              <div className={styles.subClip}>
                <Text size="lg" muted data-hero-sub>
                  An experimental space for GSAP + Three.js
                </Text>
              </div>
              <div className={styles.subClip}>
                <Text
                  size="xs"
                  mono
                  muted
                  data-hero-sub
                  className={styles.hint}
                >
                  drag to orbit · scroll to zoom
                </Text>
              </div>
            </div>
          </div>
        </section>

        {/* ── Scene ── */}
        <section className={styles.section} data-scene-section>
          <div className={styles.sectionInner}>
            <div className={styles.sceneLines}>
              <Text
                size="xs"
                mono
                muted
                data-scene-line
                className={styles.overline}
              >
                geometry
              </Text>
              <Heading as="h2" size="3xl" data-scene-line>
                Wave sphere
              </Heading>
              <Text size="base" muted data-scene-line className={styles.body}>
                A sphere where each latitude ring traces a sine curve on the
                surface — oscillating in the polar direction as it travels
                around the azimuth. Rotation makes the waves appear to travel.
              </Text>
            </div>

            <div className={styles.specs} data-specs>
              {/* Structure — fixed; not affected by Auto */}
              <div className={styles.specGroup} data-spec>
                <Text size="xs" mono muted className={styles.specGroupLabel}>
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
                      onChange={(e) => setNumBands(Number(e.target.value))}
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
                        setPtsPerBand(PTS_OPTIONS[Number(e.target.value)])
                      }
                      className={styles.slider}
                    />
                  </label>
                </div>
              </div>

              {/* Wave — cycled by Auto */}
              <div className={styles.specGroup} data-spec>
                <Text size="xs" mono muted className={styles.specGroupLabel}>
                  wave
                  {isAuto && <span className={styles.autoTag}> · auto</span>}
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
                      onChange={(e) => setWaveFreq(Number(e.target.value))}
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
                      onChange={(e) => setWaveAmp(Number(e.target.value))}
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
                      onChange={(e) => setLineWidth(Number(e.target.value))}
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
                    <HexColorInput value={lineColor} onChange={setLineColor} />
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
                      onChange={(e) =>
                        setBloomMultiplier(Number(e.target.value))
                      }
                      className={styles.slider}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                variant="outline"
                size="sm"
                onClick={randomize}
                disabled={isAuto}
              >
                Randomize
              </Button>
              <Button
                variant={isAuto ? "primary" : "outline"}
                size="sm"
                onClick={() => setIsAuto((v) => !v)}
              >
                {isAuto ? "Stop" : "Auto"}
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stack ── */}
        <section className={styles.section} data-stack-section>
          <div className={styles.sectionInner}>
            <div className={styles.titleClip}>
              <Heading as="h2" size="3xl" data-stack-heading>
                Stack
              </Heading>
            </div>
            <ul className={styles.stackList}>
              {STACK.map(({ label, detail }) => (
                <li key={label} className={styles.stackItem} data-stack-item>
                  <Text size="base" className={styles.stackLabel}>
                    {label}
                  </Text>
                  <Text size="sm" muted className={styles.stackDetail}>
                    {detail}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
