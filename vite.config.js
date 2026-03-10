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
            if (id.includes('/node_modules/lucide-react/')) {
              return 'lucide-icons'
            }
            if (id.includes('/node_modules/framer-motion/')) {
              return 'motion-vendor'
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
