"use client"

import { Wifi, WifiOff } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-1.5 text-green-600">
        <Wifi className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Live</span>
        <span className="w-2 h-2 bg-green-500 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-amber-600">
      <WifiOff className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">Reconnecting...</span>
      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
    </div>
  )
}