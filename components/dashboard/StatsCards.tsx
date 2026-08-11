import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative"
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

function StatCard({ title, value, change, changeType, icon: Icon, gradient }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex size-11 items-center justify-center rounded-xl ${gradient} shadow-sm`}>
            <Icon className="size-5 text-white" />
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              changeType === "positive"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {changeType === "positive" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

const stats = [
  {
    title: "Total Properties",
    value: "248",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Building2,
    gradient: "gradient-primary",
  },
  {
    title: "Active Listings",
    value: "156",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    gradient: "gradient-success",
  },
  {
    title: "New Leads",
    value: "89",
    change: "+23.1%",
    changeType: "positive" as const,
    icon: Users,
    gradient: "gradient-warning",
  },
  {
    title: "Revenue",
    value: "$124.5K",
    change: "-2.3%",
    changeType: "negative" as const,
    icon: DollarSign,
    gradient: "gradient-destructive",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}