"use client"

import { Menu, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { ThemeSwitch } from "components/ThemeSwitch"

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  let auth: { user: null; logout: () => void } | { user: any; token?: string; logout: () => void } = { user: null, logout: () => {} }
  
  try {
    const result = useAuth()
    if (result) {
      auth = result as any
    }
  } catch {
    console.log("Auth not available yet")
  }

  const user = auth?.user
  const logout = auth?.logout

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>

      <h1 className="font-heading text-lg font-semibold lg:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitch />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
        </Button>
        {!user ? (
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
        ) : (
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}