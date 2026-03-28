import { useRef } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { Scene } from '../../components/three/Scene';
import { FloatingMesh } from '../../components/three/FloatingMesh';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Heading, Text } from '../../components/ui/Typography';
import styles from './HomePage.module.css';

function HeroScene() {
  return (
    <Scene className={styles.canvas} cameraZ={4}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6ee7b7" />
      <FloatingMesh />
    </Scene>
  );
}

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-hero-tag]',    { y: 20, opacity: 0, duration: 0.5 })
        .from('[data-hero-title]',  { y: 40, opacity: 0, duration: 0.7 }, '-=0.2')
        .from('[data-hero-sub]',    { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('[data-hero-actions]',{ y: 20, opacity: 0, duration: 0.5 }, '-=0.3');
    },
    { scope: heroRef },
  );

  return (
    <main>
      <section ref={heroRef} className={styles.hero}>
        <HeroScene />

        <div className={styles.heroContent}>
          <Text size="sm" mono data-hero-tag className={styles.tag}>
            creative playground
          </Text>

          <Heading as="h1" size="6xl" data-hero-title className={styles.heroTitle}>
            marty-lab
          </Heading>

          <Text size="lg" muted data-hero-sub className={styles.heroSub}>
            Experiments in GSAP&nbsp;·&nbsp;Three.js&nbsp;·&nbsp;React
          </Text>

          <div data-hero-actions className={styles.heroActions}>
            <Button size="lg" onClick={() => navigate('/lab')}>
              Open the lab
              <ArrowRightIcon width={18} height={18} />
            </Button>

            <Dialog
              trigger={<Button variant="outline" size="lg">What&apos;s this?</Button>}
              title="marty-lab"
              description="A personal creative playground built with React, GSAP, and Three.js."
            >
              <Text muted size="sm">
                This site is a space to experiment with web animations, 3D graphics, and UI
                interactions. Built with Vite, React 19, GSAP 3, React Three Fiber, Radix UI
                primitives, and CSS Modules.
              </Text>
              <Text muted size="sm" style={{ marginTop: '0.75rem' }}>
                Eventually it might grow into a portfolio or CV. For now — just for fun.
              </Text>
            </Dialog>
          </div>
        </div>
      </section>
    </main>
  );
}
