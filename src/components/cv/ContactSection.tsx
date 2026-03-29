import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { LinkedInLogoIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import styles from './ContactSection.module.css';

interface ContactSectionProps {
  linkedin: string;
  email: string;
}

export function ContactSection({ linkedin, email }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = sectionRef.current?.querySelectorAll('[data-contact-item]');
      if (!items?.length) return;

      gsap.set(items, { y: 80, autoAlpha: 0 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        onEnter: () => {
          gsap.to(items, {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power4.out',
          });
        },
        onLeaveBack: () => {
          gsap.set(items, { y: 80, autoAlpha: 0 });
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={styles.section}>
      <div data-contact-item className={styles.label}>
        Get in touch
      </div>
      <div className={styles.links}>
        <a
          data-contact-item
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <LinkedInLogoIcon width={20} height={20} />
          <span>LinkedIn</span>
        </a>
        <a data-contact-item href={`mailto:${email}`} className={styles.link}>
          <EnvelopeClosedIcon width={20} height={20} />
          <span>{email}</span>
        </a>
      </div>
    </section>
  );
}
