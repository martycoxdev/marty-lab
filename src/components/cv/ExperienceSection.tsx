import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import type { Job } from '../../data/experience';
import { JobCard } from './JobCard';
import styles from './ExperienceSection.module.css';

const LETTERS = 'EXPERIENCE'.split('');

interface ExperienceSectionProps {
  jobs: Job[];
}

export function ExperienceSection({ jobs }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const trackWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      const scrollDistance = trackWidth - viewportWidth;

      // Horizontal scroll pin
      gsap.to(track, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${scrollDistance}`,
          invalidateOnRefresh: true,
        },
      });

      // Letter stagger on enter / reset on leaveBack
      const letters = section.querySelectorAll('[data-letter]');
      gsap.set(letters, { y: 100, autoAlpha: 0 });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        onEnter: () => {
          gsap.to(letters, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.04,
            ease: 'power4.out',
          });
        },
        onLeaveBack: () => {
          gsap.set(letters, { y: 100, autoAlpha: 0 });
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.heading}>
        {LETTERS.map((letter, i) => (
          <span key={i} data-letter className={styles.headingLetter}>
            {letter}
          </span>
        ))}
      </div>
      <div ref={trackRef} className={styles.track}>
        {jobs.map((job, i) => (
          <JobCard key={job.id} job={job} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}
