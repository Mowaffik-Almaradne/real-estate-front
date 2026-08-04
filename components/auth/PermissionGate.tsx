"use client"

import type { ReactNode } from "react"
import { useAuth } from "src/context/AuthContext"
import { hasPermission, type PermissionName } from "@/lib/permissions"

interface PermissionGateProps {
  permission: PermissionName
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth()
  return hasPermission(user, permission) ? <>{children}</> : <>{fallback}</>
}
