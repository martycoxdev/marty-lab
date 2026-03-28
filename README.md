# marty-lab

Personal creative playground — experiments in GSAP animations, Three.js/WebGL, and React UI.

Live at [marty99.com](https://marty99.com).

## Stack

- **React 19** + TypeScript, built with **Vite 6**
- **GSAP 3** (`@gsap/react`) for animations
- **Three.js** + **React Three Fiber** for 3D
- **Radix UI** + **@radix-ui/react-icons** for accessible UI primitives
- **CSS Modules** + CSS custom properties for styling
- **React Router v7** for client-side routing
- Hosted on **AWS S3 + CloudFront**

## Development

Requires Node 18+ and pnpm.

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # production build → dist/
pnpm preview   # preview production build
pnpm lint      # ESLint
```

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero with Three.js background and GSAP entrance |
| `/lab` | Interactive Three.js scene (drag to orbit, scroll to zoom) |
| `/about` | Coming soon |
