"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select"

import type { PropertyStatus } from "@/types/enums"

const STATUS_CONFIG: Record<PropertyStatus, { className: string; label: string }> = {
  draft: { className: "bg-slate-500 hover:bg-slate-600", label: "Draft" },
  pending: { className: "bg-amber-500 hover:bg-amber-600", label: "Pending" },
  under_inspection: { className: "bg-cyan-500 hover:bg-cyan-600", label: "Under inspection" },
  approved: { className: "bg-emerald-500 hover:bg-emerald-600", label: "Approved" },
  rejected: { className: "bg-red-500 hover:bg-red-600", label: "Rejected" },
  suspended: { className: "bg-orange-500 hover:bg-orange-600", label: "Suspended" },
  sold: { className: "bg-blue-500 hover:bg-blue-600", label: "Sold" },
  archived: { className: "bg-gray-500 hover:bg-gray-600", label: "Archived" },
}

interface StatusSelectProps {
  status: string
  onStatusChange: (newStatus: PropertyStatus) => Promise<void>
  disabled?: boolean
}

export function StatusSelect({ status, onStatusChange, disabled }: StatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const config = STATUS_CONFIG[status as PropertyStatus] || { className: "bg-gray-500", label: status }

  const handleValueChange = async (newStatus: string) => {
    if (newStatus === status) return
    
    setLoading(true)
    try {
      await onStatusChange(newStatus as PropertyStatus)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={status}
      onValueChange={handleValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className="w-auto h-auto px-2 py-0 border-0 bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none">
        <Badge className={`${config.className} cursor-pointer`}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : config.label}
        </Badge>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map((s) => (
          <SelectItem key={s} value={s}>
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${STATUS_CONFIG[s].className}`} />
              {STATUS_CONFIG[s].label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}