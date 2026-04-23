"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Home,
  Users,
  BarChart3,
  Settings,
  FileText,
  MapPin,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "components/ui/button"

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { href: "/dashboard/cities", label: "Cities", icon: MapPin },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:inset-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading font-semibold text-sm tracking-tight transition-opacity hover:opacity-80"
          >
            <div className="flex items-center justify-center size-7 rounded-[4px] bg-primary text-primary-foreground">
              <Building2 className="size-3.5" />
            </div>
            <span>RealEstate</span>
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

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[4px] px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={onClose}
              >
                <item.icon
                  className={cn(
                    "size-[18px] transition-transform duration-200",
                    !isActive && "group-hover:scale-110"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="rounded-[6px] bg-muted/50 p-3 border border-border/40">
            <p className="text-xs font-medium text-foreground">
              Need help?
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Check our documentation for more information.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full rounded-[4px] border border-input hover:bg-muted"
            >
              View Docs
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}