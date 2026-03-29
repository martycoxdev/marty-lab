import { type RefObject, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

type Direction = 'up' | 'left' | 'right';

interface UseScrollRevealOptions {
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
}

export function useScrollReveal(
  ref: RefObject<Element | null>,
  options: UseScrollRevealOptions = {},
) {
  const { direction = 'up', distance = 80, duration = 1, delay = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
    const y = direction === 'up' ? distance : 0;

    gsap.set(el, { x, y, autoAlpha: 0 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      onEnter: () => {
        gsap.to(el, { x: 0, y: 0, autoAlpha: 1, duration, delay, ease: 'power4.out' });
      },
      onLeaveBack: () => {
        gsap.set(el, { x, y, autoAlpha: 0 });
      },
    });

    return () => trigger.kill();
  }, [ref, direction, distance, duration, delay]);
}
