import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { initClientMonitoring } from './utils/monitoring'

const scheduleMonitoringInit = () => {
  if (typeof window === 'undefined') return

  const startMonitoring = () => {
    void initClientMonitoring()
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(startMonitoring, { timeout: 3000 })
    return
  }

  window.setTimeout(startMonitoring, 1800)
}

scheduleMonitoringInit()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
