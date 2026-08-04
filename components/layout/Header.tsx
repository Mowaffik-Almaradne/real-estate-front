"use client"

import { Menu, Bell, LogOut, Search } from "lucide-react"
import Link from "next/link"
import { useAuth } from "src/context/AuthContext"
import { Button } from "components/ui/button"
import { ThemeSwitch } from "components/ThemeSwitch"

interface HeaderProps {
  onMenuClick: () => void
  title?: string
  actions?: React.ReactNode
}

export function Header({ onMenuClick, title = "Dashboard", actions }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 glass px-5 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden hover:bg-accent transition-colors"
        onClick={onMenuClick}
      >
        <Menu className="size-[18px]" />
      </Button>

      <h1 className="font-heading text-lg font-bold tracking-tight">
        {title}
      </h1>

      {actions && <div className="ml-4 flex items-center gap-2">{actions}</div>}

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Search className="size-[18px]" />
        </Button>
        
        <ThemeSwitch />
        
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full gradient-primary ring-2 ring-background" />
        </Button>
        
        {!user ? (
          <Link href="/login">
            <Button size="sm" className="rounded-lg">Login</Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            onClick={logout}
          >
            <LogOut className="size-4" />
          </Button>
        )}
      </div>
    </header>
  )
}
