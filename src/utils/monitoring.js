let monitoringInitialized = false

const getSampleRate = () => {
  const parsed = Number.parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.05')
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.05
}

export const initClientMonitoring = async () => {
  if (monitoringInitialized) return

  const dsn = String(import.meta.env.VITE_SENTRY_DSN || '').trim()
  if (!dsn) return

  const Sentry = await import('@sentry/react')
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'development',
    tracesSampleRate: getSampleRate()
  })

  monitoringInitialized = true
}
