"use client"

import { LayoutGrid, List, Map } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewMode = "grid" | "list" | "map"

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (value: ViewMode) => void
  className?: string
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md border p-0.5", className)}>
      <Button
        type="button"
        size="icon-sm"
        variant={value === "grid" ? "secondary" : "ghost"}
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={value === "grid"}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={value === "list" ? "secondary" : "ghost"}
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={value === "list"}
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={value === "map" ? "secondary" : "ghost"}
        onClick={() => onChange("map")}
        aria-label="Map view"
        aria-pressed={value === "map"}
      >
        <Map className="size-4" />
      </Button>
    </div>
  )
}
