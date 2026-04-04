import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EXPERIMENT_META, type ExperimentId } from './experiments/index';
import styles from './LabMenu.module.css';

export type { ExperimentId };

interface LabMenuProps {
  active: ExperimentId;
  onChange: (id: ExperimentId) => void;
}

export function LabMenu({ active, onChange }: LabMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initialized = useRef(false);

  // Stagger entrance from below
  useGSAP(
    () => {
      gsap.from(menuRef.current, {
        yPercent: 150,
        autoAlpha: 0,
        duration: 1,
        ease: 'power4.out',
        delay: 0.5,
      });
      gsap.from(itemRefs.current.filter(Boolean), {
        yPercent: 60,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.7,
      });
    },
    { scope: menuRef },
  );

  // Slide indicator to active item
  useEffect(() => {
    const idx = EXPERIMENT_META.findIndex((e) => e.id === active);
    const btn = itemRefs.current[idx];
    const indicator = indicatorRef.current;
    if (!btn || !indicator) return;

    if (!initialized.current) {
      gsap.set(indicator, { x: btn.offsetLeft, width: btn.offsetWidth });
      initialized.current = true;
    } else {
      gsap.to(indicator, {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: 0.45,
        ease: 'power3.inOut',
      });
    }
  }, [active]);

  return (
    <div ref={menuRef} className={styles.menu}>
      <div className={styles.track}>
        <div ref={indicatorRef} className={styles.indicator} />
        {EXPERIMENT_META.map(({ id, num, label }, i) => (
          <button
            key={id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`${styles.item}${active === id ? ` ${styles.itemActive}` : ''}`}
            onClick={() => onChange(id)}
            onMouseEnter={(e) => {
              if (active !== id) {
                gsap.to(e.currentTarget, { y: -1, duration: 0.2, ease: 'power2.out' });
              }
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                y: 0,
                duration: 0.55,
                ease: 'elastic.out(1, 0.4)',
              });
            }}
          >
            <span className={styles.num}>{num}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
