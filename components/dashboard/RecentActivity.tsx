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
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

export function RecentActivity() {
  return (
    <Card className="bg-card">
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold tracking-tight">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border pb-4">
          {activities.map((activity) => {
            const Icon = typeIcons[activity.type]
            const status = statusConfig[activity.status]

            return (
              <div
                key={activity.id}
                className="group flex items-start gap-4 px-4 py-4 transition-all duration-200 ease-in-out hover:bg-accent"
              >
                <div className="flex shrink-0 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20 size-9">
                  <Icon className="size-[16px] text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-tight text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                </div>
                <Badge
                  className={`shrink-0 border font-medium text-xs ${status.className}`}
                >
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