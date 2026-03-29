import styles from './Marquee.module.css';

interface MarqueeProps {
  items: string[];
  speed?: number; // seconds for one full pass
}

export function Marquee({ items, speed = 30 }: MarqueeProps) {
  // Two copies side-by-side; CSS animation shifts left by exactly 50% so it loops seamlessly
  const all = [...items, ...items];

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <ul className={styles.track} style={{ animationDuration: `${speed}s` }}>
        {all.map((item, i) => (
          <li key={i} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
