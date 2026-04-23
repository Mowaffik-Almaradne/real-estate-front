"use client"

import { Menu, Bell, LogOut, Search } from "lucide-react"
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden hover:bg-muted transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="size-[18px]" />
      </Button>

      <h1 className="font-heading text-base font-semibold tracking-tight lg:text-lg">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Search className="size-[18px]" />
        </Button>
        
        <ThemeSwitch />
        
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent-primary" />
        </Button>
        
        {!user ? (
          <Link href="/login">
            <Button size="sm" className="rounded-[4px]">Login</Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={logout}
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}