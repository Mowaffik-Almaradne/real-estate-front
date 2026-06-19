"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Home,
  Globe,
  Settings,
  MapPin,
  X,
  MessageCircle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "components/ui/button"

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/properties", label: "Public Properties", icon: Globe },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/cities", label: "Cities", icon: MapPin },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out lg:static lg:inset-auto",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex items-center justify-center size-8 rounded-lg gradient-primary shadow-md shadow-primary/25 text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <span className="font-heading font-bold text-base tracking-tight">
              RealEstate
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon-xs"
            className="lg:hidden hover:bg-muted"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
                onClick={onClose}
              >
                <item.icon
                  className={cn(
                    "size-[18px] transition-transform duration-200",
                    !isActive && "group-hover:translate-x-0.5"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 via-accent/50 to-primary/5 p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Need help?
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Check our documentation for more information.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              View Docs
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}