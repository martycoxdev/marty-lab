import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import styles from './Typography.module.css';

const HEADING_SIZES = {
  '2xl': 'var(--font-2xl)',
  '3xl': 'var(--font-3xl)',
  '4xl': 'var(--font-4xl)',
  '5xl': 'var(--font-5xl)',
  '6xl': 'var(--font-6xl)',
} as const;

const TEXT_SIZES = {
  xs: 'var(--font-xs)',
  sm: 'var(--font-sm)',
  base: 'var(--font-base)',
  lg: 'var(--font-lg)',
  xl: 'var(--font-xl)',
} as const;

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';
// Narrow union so TypeScript can infer JSX props without any type cast.
// ElementType is too broad (includes ComponentType<any>) and breaks JSX inference.
type TextTag = 'p' | 'span' | 'div' | 'li' | 'label' | 'small';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: keyof typeof HEADING_SIZES;
  muted?: boolean;
  children: ReactNode;
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextTag;
  size?: keyof typeof TEXT_SIZES;
  muted?: boolean;
  mono?: boolean;
  children: ReactNode;
}

export function Heading({
  as: Tag = 'h2',
  size = '3xl',
  muted = false,
  style,
  className,
  children,
  ...props
}: HeadingProps) {
  const combined: CSSProperties = { fontSize: HEADING_SIZES[size], ...style };
  return (
    <Tag
      className={[styles.heading, muted ? styles.muted : '', className]
        .filter(Boolean)
        .join(' ')}
      style={combined}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Text({
  as: Tag = 'p',
  size = 'base',
  muted = false,
  mono = false,
  style,
  className,
  children,
  ...props
}: TextProps) {
  const combined: CSSProperties = { fontSize: TEXT_SIZES[size], ...style };
  return (
    <Tag
      className={[
        styles.text,
        muted ? styles.muted : '',
        mono ? styles.mono : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={combined}
      {...props}
    >
      {children}
    </Tag>
  );
}
