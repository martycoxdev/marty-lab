import { useRef } from 'react';
import { Counter } from '../ui/Counter';
import { Marquee } from '../ui/Marquee';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { Stat } from '../../data/experience';
import styles from './SkillsSection.module.css';

interface SkillsSectionProps {
  stats: Stat[];
  statement: string;
  skills: string[];
}

export function SkillsSection({ stats, statement, skills }: SkillsSectionProps) {
  const statementRef = useRef<HTMLParagraphElement>(null);
  useScrollReveal(statementRef, { direction: 'up', distance: 60, duration: 1 });

  return (
    <section className={styles.section}>
      <div className={styles.stats}>
        {stats.map(stat => (
          <div key={stat.label} className={styles.statItem}>
            <span className={styles.statValue}>
              <Counter target={stat.value} suffix={stat.suffix} />
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      <p ref={statementRef} className={styles.statement}>
        {statement}
      </p>

      <Marquee items={skills} />
    </section>
  );
}
