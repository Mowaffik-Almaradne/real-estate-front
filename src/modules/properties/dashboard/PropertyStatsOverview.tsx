"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"

export interface PropertyStatistics {
  pending: number
  approved: number
  rejected: number
  suspended: number
  sold: number
  archived: number
  all: number
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; gradient: string }
> = {
  approved: {
    label: "Approved",
    color: "bg-emerald-500",
    gradient: "from-emerald-500/10 to-emerald-500/5",
  },
  pending: {
    label: "Pending",
    color: "bg-amber-500",
    gradient: "from-amber-500/10 to-amber-500/5",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500",
    gradient: "from-red-500/10 to-red-500/5",
  },
  suspended: {
    label: "Suspended",
    color: "bg-orange-500",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  sold: {
    label: "Sold",
    color: "bg-primary",
    gradient: "from-primary/10 to-primary/5",
  },
  archived: {
    label: "Archived",
    color: "bg-gray-500",
    gradient: "from-gray-500/10 to-gray-500/5",
  },
  all: {
    label: "All",
    color: "bg-primary",
    gradient: "from-primary/10 to-primary/5",
  },
}

interface StatusCardProps {
  status: string
  count: number
  isActive: boolean
  onClick: () => void
}

function StatusCard({ status, count, isActive, onClick }: StatusCardProps) {
  const { label, color, gradient } = STATUS_CONFIG[status]

  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border transition-all duration-200 text-left ${
        isActive
          ? "border-primary/30 ring-2 ring-primary/20 bg-gradient-to-br " + gradient
          : "border-border/50 hover:border-primary/20 hover:bg-accent/50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`size-2.5 rounded-full ${color} ${
            isActive ? "ring-2 ring-offset-2 ring-offset-background ring-current" : ""
          }`}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold">{count}</p>
    </button>
  )
}

interface PropertyStatsOverviewProps {
  statistics: PropertyStatistics
  activeStatus: string
  onStatusClick: (status: string) => void
}

const STATUS_ORDER: Array<keyof PropertyStatistics> = [
  "all",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "sold",
  "archived",
]

export function PropertyStatsOverview({
  statistics,
  activeStatus,
  onStatusClick,
}: PropertyStatsOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties Overview</CardTitle>
        <CardDescription>Manage and filter your property listings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {STATUS_ORDER.map((status) => (
            <StatusCard
              key={status}
              status={status}
              count={statistics[status]}
              isActive={activeStatus === (status === "all" ? "" : status)}
              onClick={() =>
                onStatusClick(status === "all" ? "" : status)
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}