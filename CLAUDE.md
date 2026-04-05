# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # TypeScript check + Vite production build → dist/
pnpm preview      # Preview the production build locally
pnpm lint         # Run ESLint
pnpm format       # Prettier format src/**/*.{ts,tsx,css}
```

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 6 (Node 18 max; Vite 7 requires Node 20+) |
| Framework | React 19 + TypeScript |
| Animations | GSAP 3 + `@gsap/react` |
| 3D | Three.js + `@react-three/fiber` v9 + `@react-three/drei` + `@react-three/postprocessing` |
| UI primitives | `radix-ui` (unified pkg) + `@radix-ui/react-icons` |
| Styling | CSS Modules + CSS variables |
| Routing | React Router v7 (`BrowserRouter`) |
| Package manager | pnpm |

## Architecture

```
src/
├── context/ThemeContext.tsx     # Theme state (dark/light), localStorage persistence
├── lib/gsap.ts                  # Side-effect: registers GSAP plugins (useGSAP, ScrollTrigger, SplitText)
├── data/experience.ts           # CV / work experience data
├── hooks/useScrollReveal.ts     # Scroll-triggered reveal hook
├── styles/
│   ├── tokens.css               # All CSS custom properties (colors, spacing, etc.)
│   ├── reset.css                # CSS reset
│   └── global.css               # Imports reset + tokens; sets body defaults
├── components/
│   ├── layout/Nav/              # Sticky nav, theme toggle, NavLinks
│   ├── ui/
│   │   ├── Button.tsx           # variant (primary | ghost | outline), size (sm | md | lg)
│   │   ├── Typography.tsx       # Heading + Text components, size via inline style lookup
│   │   ├── Dialog.tsx           # Wraps Radix Dialog primitive with CSS Module styles
│   │   ├── Counter.tsx          # Animated counter
│   │   ├── HexColorInput.tsx    # Hex colour picker input
│   │   └── Marquee.tsx          # Scrolling ticker/marquee
│   ├── three/
│   │   ├── Scene.tsx            # R3F <Canvas> wrapper (camera, dpr, antialias)
│   │   ├── FloatingMesh.tsx     # Torus knot; demonstrates GSAP + R3F integration pattern
│   │   ├── WaveSphereMesh.tsx   # Animated wave sphere
│   │   ├── IcosahedronMesh.tsx  # Icosahedron geometry
│   │   └── LabEffects.tsx       # R3F post-processing effects
│   └── cv/
│       ├── CvHero.tsx           # Hero block (name, descriptor)
│       ├── ExperienceSection.tsx # Job history list
│       ├── JobCard.tsx          # Individual job card
│       └── ContactSection.tsx   # Contact info
├── pages/
│   ├── HomePage/                # Hero with Three.js background + GSAP entrance animation
│   ├── LabPage/                 # Interactive R3F scene with OrbitControls + experiment switcher
│   │   └── experiments/         # Individual experiment modules (WaveSphere, Wireframe, TorusKnot, Street)
│   └── CvPage/                  # CV / résumé page (route temporarily hidden)
├── App.tsx                      # Routes + Nav layout shell
└── main.tsx                     # Entry: side-effect imports, BrowserRouter, ThemeProvider
```

## Code Conventions

**No type casts** — never use `as unknown as X`, `as any`, or `as SomeType` to force type compatibility. Fix the root type instead. For polymorphic components, narrow the `as` prop to a concrete union of HTML tag strings (e.g. `'p' | 'span' | 'div'`) rather than the broad `ElementType`, which breaks JSX inference.

---

## Key Patterns

### GSAP in React components
Always import from `@gsap/react`, never from `react` directly. The `lib/gsap.ts` side-effect in `main.tsx` ensures all plugins are registered.

```tsx
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('[data-animate]', { y: 30, opacity: 0, stagger: 0.1 });
  }, { scope: containerRef }); // scope prevents selector leaking outside component

  return <div ref={containerRef}><span data-animate>Hello</span></div>;
}
```

Event-handler animations need `contextSafe()`:
```tsx
const { contextSafe } = useGSAP({ scope: containerRef });
const handleClick = contextSafe(() => gsap.to('.box', { x: 100 }));
```

### GSAP + React Three Fiber
GSAP must not fight R3F's render loop. Pattern: GSAP mutates a plain `ref` object; `useFrame` reads it every tick.

```tsx
const anim = useRef({ value: 0 });
useGSAP(() => { gsap.to(anim.current, { value: 1, duration: 2, repeat: -1, yoyo: true }); });
useFrame(() => { if (meshRef.current) meshRef.current.rotation.y = anim.current.value * Math.PI * 2; });
```

### Radix UI components
Import from the unified `radix-ui` package. Style by passing your CSS Module class to `className`.

```tsx
import { Dialog } from 'radix-ui';
import { Cross2Icon } from '@radix-ui/react-icons';

<Dialog.Root>
  <Dialog.Trigger asChild><button>Open</button></Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className={styles.overlay} />
    <Dialog.Content className={styles.content}>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Close><Cross2Icon /></Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Theming
Tokens live in `src/styles/tokens.css`. Dark theme is `:root`, light theme is `[data-theme="light"]`. The `ThemeProvider` in `context/ThemeContext.tsx` sets `document.documentElement.dataset.theme` and persists to `localStorage`. Access via `useTheme()` hook.

### CSS Modules
Files end in `.module.css`. Vite is configured with `localsConvention: 'camelCaseOnly'` so CSS class `.myClass` is accessed as `styles.myClass`. Don't use leading-digit class names (`.2xl`) — use a lookup object instead (see `Typography.tsx`).

## Routing

React Router v7. Routes defined in `App.tsx`. Active routes: `/`, `/lab`. `/cv` is defined but temporarily commented out.

CloudFront must redirect 403/404 → `/index.html` (200) for SPA routing on direct URL loads.

## AWS Deploy

```bash
pnpm build
aws s3 sync dist/ s3://YOUR_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/index.html"
```

**Cache strategy** (set via S3 metadata or CloudFront response headers policy):
- `index.html` → `Cache-Control: no-cache, no-store`
- `dist/assets/*` → `Cache-Control: max-age=31536000, immutable` (Vite hashes filenames)

Architecture: private S3 bucket + Origin Access Control → CloudFront → ACM cert (us-east-1) → Route 53 → marty99.com
