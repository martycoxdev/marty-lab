import { useRef } from 'react';
import { NavLink } from 'react-router';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import logoSrc from '../../../assets/logo.png';
import { useTheme } from '../../../context/ThemeContext';
import { Text } from '../../ui/Typography';
import styles from './Nav.module.css';

function getLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? styles.linkActive : styles.link;
}

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const { theme, toggle } = useTheme();

  useGSAP(
    () => {
      gsap.from(navRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.1,
      });
    },
    { scope: navRef },
  );

  return (
    <nav ref={navRef} className={styles.nav}>
      <NavLink to="/" className={styles.logo}>
        <img src={logoSrc} alt="" className={styles.logoIcon} aria-hidden="true" />
        <Text as="span" size="lg" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
          marty-lab
        </Text>
      </NavLink>
      <ul className={styles.links}>
        <li>
          <NavLink to="/" className={getLinkClass} end>
            home
          </NavLink>
        </li>
        <li>
          <NavLink to="/lab" className={getLinkClass}>
            lab
          </NavLink>
        </li>
        {/* <li>
          <NavLink to="/cv" className={getLinkClass}>
            cv
          </NavLink>
        </li> TEMPORARILY HIDDEN */}
      </ul>
      <button
        onClick={toggle}
        className={styles.themeToggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </nav>
  );
}
