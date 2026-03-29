import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import SplitText from 'gsap/SplitText';
import styles from './CvHero.module.css';

interface CvHeroProps {
  name: string;
  descriptors: string[];
}

export function CvHero({ name, descriptors }: CvHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const titleEl = containerRef.current?.querySelector('[data-split-title]');
      if (!titleEl) return;

      // lines = overflow-hidden wrapper, words = animated child
      const split = new SplitText(titleEl, {
        type: 'lines,words',
        linesClass: 'splitLine',
        wordsClass: 'splitWord',
      });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(split.words, {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.08,
      }).from(
        '[data-descriptor]',
        {
          yPercent: 110,
          duration: 0.8,
          stagger: 0.15,
        },
        '-=0.6',
      );

      return () => split.revert();
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={styles.hero}>
      <div className={styles.titleClip}>
        <h1 data-split-title className={styles.title}>
          {name}
        </h1>
      </div>
      <div className={styles.descriptors}>
        {descriptors.map((d) => (
          <div key={d} className={styles.descriptorClip}>
            <span data-descriptor className={styles.descriptor}>
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
