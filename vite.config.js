import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devProxyTarget = String(env.VITE_DEV_PROXY_TARGET || 'http://localhost:7000').trim()
  const shouldAnalyze = String(env.ANALYZE || env.VITE_ANALYZE || '').toLowerCase() === 'true'

  return {
    plugins: [
      react(),
      shouldAnalyze &&
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
    ].filter(Boolean),
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
                return 'jspdf-vendor'
              }
              if (id.includes('html2canvas')) {
                return 'html2canvas-vendor'
              }
              if (id.includes('recharts')) {
                return 'charts-vendor'
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'ui-vendor'
              }
              if (
                id.includes('react-router') ||
                id.includes('react-dom') ||
                id.includes('/react/')
              ) {
                return 'react-vendor'
              }
            }
            if (id.includes('/src/routes/')) {
              const routeMatch = id.match(/\/src\/routes\/([^/]+)/)
              if (routeMatch?.[1]) {
                return `route-${routeMatch[1]}`
              }
            }
            return undefined
          }
        }
      }
    },
    server: {
      proxy: {
        '/api/v1': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: true
        },
        '/uploads': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: true
        }
      }
    }
  }
})
