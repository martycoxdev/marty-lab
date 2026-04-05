import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self' blob:",
  "worker-src blob:",
  "object-src 'none'",
].join('; ')

function cspPlugin(): Plugin {
  return {
    name: 'csp-meta',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (ctx.server) return html // dev: skip
        return html.replace(
          '</head>',
          `  <meta http-equiv="Content-Security-Policy" content="${CSP}">\n  </head>`
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/gsap') || id.includes('@gsap')) {
            return 'vendor-gsap';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/radix-ui') || id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
        },
      },
    },
  },
})
