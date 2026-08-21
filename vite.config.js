import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const plugins = [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ]

  // Add bundle visualizer when ANALYZE env var is set
  if (process.env.ANALYZE) {
    plugins.push(
      // Generates dist/bundle-analysis.html
      visualizer({ filename: 'dist/bundle-analysis.html', open: false, gzipSize: true })
    )
  }

  return {
    plugins,
    server: {
      host: true,
    },
  }
})
