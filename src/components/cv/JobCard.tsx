import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { Job } from '../../data/experience';
import styles from './JobCard.module.css';

interface JobCardProps {
  job: Job;
  defaultOpen?: boolean;
}

export function JobCard({ job, defaultOpen = false }: JobCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const details = detailsRef.current;
      if (!details) return;
      if (isOpen) {
        gsap.to(details, {
          height: 'auto',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        gsap.to(details, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
      }
    },
    { scope: cardRef, dependencies: [isOpen] },
  );

  return (
    <div ref={cardRef} className={styles.card}>
      <button
        className={styles.header}
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.headerLeft}>
          <span className={styles.company}>{job.company}</span>
          <span className={styles.role}>{job.role}</span>
          <span className={styles.dates}>{job.dates}</span>
        </div>
        <ChevronDownIcon
          className={styles.chevron}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        ref={detailsRef}
        className={styles.details}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
        <div className={styles.blurbs}>
          {job.blurbs.map((blurb, i) => (
            <div key={i} className={styles.blurb}>
              <p className={styles.blurbTitle}>{blurb.title}</p>
              <p className={styles.blurbText}>{blurb.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
