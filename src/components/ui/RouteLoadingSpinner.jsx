import React from 'react'
import logo from '../../assets/icons/ledgerly-logo.webp'

const RouteLoadingSpinner = ({ show }) => {
  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-50/30 dark:bg-slate-950/35 backdrop-blur-[1px]" />
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute h-16 w-16 rounded-full border-2 border-slate-300/80 dark:border-slate-700/80" />
        <span className="absolute h-16 w-16 rounded-full border-2 border-transparent border-t-cyan-500 dark:border-t-cyan-300 animate-spin" />
        <img loading="eager" decoding="sync"
          src={logo}
          alt="Ledgerly logo"
          className="h-9 w-9 rounded-lg object-contain shadow-sm"
        />
      </div>
    </div>
  )
}

export default RouteLoadingSpinner

