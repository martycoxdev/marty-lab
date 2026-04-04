import { useRef, useState, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { OrbitControls } from '@react-three/drei';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { Scene } from '../../components/three/Scene';
import { LabMenu } from './LabMenu';
import { EXPERIMENT_META, type ExperimentId } from './experiments/index';
import {
  WaveSphereProvider,
  WaveSphereScene,
  WaveSpherePanel,
} from './experiments/WaveSphere';
import {
  WireframeProvider,
  WireframeScene,
  WireframePanel,
} from './experiments/Wireframe';
import {
  TorusKnotProvider,
  TorusKnotScene,
  TorusKnotPanel,
} from './experiments/TorusKnot';
import {
  StreetProvider,
  StreetScene,
  StreetPanel,
} from './experiments/Street';
import styles from './LabPage.module.css';

export function LabPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const labTextRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  // activeId — which menu item is highlighted (updates immediately on click)
  const [activeId, setActiveId] = useState<ExperimentId>('wave-sphere');
  // displayedId — which experiment is actually rendered (updates after exit animation)
  const [displayedId, setDisplayedId] = useState<ExperimentId>('wave-sphere');

  const isMobileLayout = useMemo(() => window.innerWidth <= 768, []);
  const [panelOpen, setPanelOpen] = useState(false);

  const isMobile = useMemo(() => window.matchMedia('(hover: none)').matches, []);

  // Use displayedId so orbitControls/meta reflects the scene that's actually rendered,
  // not the one that's merely highlighted in the menu during a transition.
  const activeExp = EXPERIMENT_META.find((e) => e.id === displayedId)!;

  // ── Mount animations ──────────────────────────────────────────────────────
  useGSAP(
    () => {
      // "Lab" label entrance
      const titleEl = labTextRef.current?.querySelector('[data-lab-title]');
      if (titleEl) {
        const split = new SplitText(titleEl, {
          type: 'words',
          wordsClass: 'sw',
        });
        gsap.from(split.words, {
          yPercent: 110,
          duration: 1,
          stagger: 0.06,
          ease: 'power4.out',
          delay: 0.2,
        });
      }

      // Panel starts closed on all devices — set off-screen immediately
      if (isMobileLayout) {
        gsap.set(panelRef.current, { y: '100%' });
      } else {
        gsap.set(panelRef.current, { x: '100%' });
      }
    },
    { scope: pageRef },
  );

  // ── Panel toggle ──────────────────────────────────────────────────────────
  function togglePanel() {
    const next = !panelOpen;
    setPanelOpen(next);
    if (isMobileLayout) {
      gsap.to(panelRef.current, {
        y: next ? '0%' : '100%',
        duration: 0.55,
        ease: next ? 'power4.out' : 'power3.in',
      });
    } else {
      gsap.to(panelRef.current, {
        x: next ? '0%' : '100%',
        duration: 0.55,
        ease: next ? 'power4.out' : 'power3.in',
      });
    }
  }

  // ── Experiment switching ──────────────────────────────────────────────────
  function handleSwitch(next: ExperimentId) {
    if (next === displayedId || isTransitioning.current) return;
    isTransitioning.current = true;
    setActiveId(next); // menu highlight updates immediately

    gsap
      .timeline()
      // Exit: fade panel content + dim background
      .to(panelContentRef.current, {
        autoAlpha: 0,
        x: -24,
        duration: 0.25,
        ease: 'power2.in',
      })
      .to(
        bgRef.current,
        {
          autoAlpha: 0.3,
          duration: 0.2,
          ease: 'power2.in',
        },
        '<',
      )
      // Reset scroll first so the new experiment's ScrollTrigger sees position 0
      .add(() => {
        window.scrollTo(0, 0);
        flushSync(() => setDisplayedId(next));
        panelContentRef.current?.scrollTo({ top: 0 });
      })
      // Enter: slide content in from right + restore background
      .fromTo(
        panelContentRef.current,
        { autoAlpha: 0, x: 24 },
        { autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out' },
      )
      .to(
        bgRef.current,
        {
          autoAlpha: 1,
          duration: 0.35,
          ease: 'power2.out',
        },
        '<0.05',
      )
      .add(() => {
        ScrollTrigger.refresh();
        isTransitioning.current = false;
      });
  }

  return (
    // All experiment Providers wrap the whole page so their Scene + Panel
    // components share the same context instance. All 4 are always mounted
    // so state persists when switching back to a previous experiment.
    <WaveSphereProvider>
      <WireframeProvider>
        <TorusKnotProvider>
          <StreetProvider>
          <div ref={pageRef} className={styles.page}>
            {/* ── Three.js background ─────────────────────────────────── */}
            <div ref={bgRef} className={styles.background}>
              <Scene cameraZ={5}>
                {displayedId === 'wave-sphere' && <WaveSphereScene />}
                {displayedId === 'wireframe' && <WireframeScene />}
                {displayedId === 'torus-knot' && <TorusKnotScene />}
                {displayedId === 'street' && <StreetScene />}
                {activeExp.orbitControls && (
                  <OrbitControls
                    makeDefault
                    enablePan={false}
                    enableZoom={false}
                    enableRotate={!isMobile}
                    autoRotate={false}
                  />
                )}
              </Scene>
            </div>

            {/* Mobile touch blocker */}
            <div
              className={`${styles.canvasBlocker}${isMobile ? ` ${styles.canvasBlockerMobile}` : ''}`}
            />

            {/* ── Experiment panel ──────────────────────────────────── */}
            <div ref={panelRef} className={styles.panel}>
              {/* Scrollable content area */}
              <div ref={panelContentRef} className={styles.panelInner}>
                {displayedId === 'wave-sphere' && <WaveSpherePanel />}
                {displayedId === 'wireframe' && <WireframePanel />}
                {displayedId === 'torus-knot' && <TorusKnotPanel />}
                {displayedId === 'street' && <StreetPanel />}
              </div>

              {/* Toggle tab — always visible, floats off the right edge */}
              <button
                className={styles.panelToggle}
                onClick={togglePanel}
                aria-label={panelOpen ? 'Hide panel' : 'Show panel'}
              >
                {isMobileLayout
                  ? panelOpen ? <ChevronDownIcon /> : <ChevronUpIcon />
                  : panelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />
                }
              </button>
            </div>

            {/* ── Experiment selector menu ───────────────────────────── */}
            <LabMenu active={activeId} onChange={handleSwitch} />

            {/* ── Scroll space ──────────────────────────────────────── */}
            {/* All chrome is position:fixed, so this invisible spacer   */}
            {/* is the only thing that creates page scroll height.        */}
            {/* ScrollTrigger reads window scroll against this length.    */}
            <div
              className={styles.scrollSpace}
              style={{ height: `${EXPERIMENT_META.find(e => e.id === displayedId)?.scrollVh ?? 300}vh` }}
              aria-hidden="true"
            />
          </div>
          </StreetProvider>
        </TorusKnotProvider>
      </WireframeProvider>
    </WaveSphereProvider>
  );
}
