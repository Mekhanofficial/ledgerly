import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const devProxyTarget = String(env.VITE_DEV_PROXY_TARGET || 'http://localhost:7000').trim()

  return {
    plugins: [react()],
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
