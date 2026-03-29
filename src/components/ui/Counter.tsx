import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface CounterProps {
  target: number;
  suffix?: string;
  duration?: number;
}

export function Counter({ target, suffix = '', duration = 1.5 }: CounterProps) {
  const [display, setDisplay] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const counter = useRef({ val: 0 });

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(counter.current, {
            val: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => setDisplay(Math.round(counter.current.val)),
          });
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <span ref={containerRef}>
      {display}
      {suffix}
    </span>
  );
}
