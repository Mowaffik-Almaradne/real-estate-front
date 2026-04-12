import {
  Building2,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityItem {
  id: string
  type: "property" | "lead" | "report" | "approval"
  title: string
  description: string
  time: string
  status: "completed" | "pending" | "rejected"
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "property",
    title: "New property listed",
    description: "Luxury penthouse in Downtown added",
    time: "5 minutes ago",
    status: "completed",
  },
  {
    id: "2",
    type: "lead",
    title: "New lead assigned",
    description: "John Smith assigned to Agent Sarah",
    time: "23 minutes ago",
    status: "pending",
  },
  {
    id: "3",
    type: "report",
    title: "Monthly report generated",
    description: "March 2026 analytics report ready",
    time: "1 hour ago",
    status: "completed",
  },
  {
    id: "4",
    type: "approval",
    title: "Listing pending approval",
    description: "Villa listing awaiting review",
    time: "2 hours ago",
    status: "pending",
  },
  {
    id: "5",
    type: "lead",
    title: "Lead conversion",
    description: "Emily Davis converted to client",
    time: "3 hours ago",
    status: "completed",
  },
  {
    id: "6",
    type: "property",
    title: "Listing rejected",
    description: "Commercial space requires more details",
    time: "5 hours ago",
    status: "rejected",
  },
]

const typeIcons = {
  property: Building2,
  lead: UserPlus,
  report: FileText,
  approval: CheckCircle,
}

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle,
    variant: "default" as const,
  },
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
  },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = typeIcons[activity.type]
            const status = statusConfig[activity.status]

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant={status.variant} className="shrink-0">
                  <status.icon className="mr-1 size-3" />
                  {status.label}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
