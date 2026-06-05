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
}

function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  return (
    <Card className="shadow-sm bg-card transition-all duration-200 ease-in-out hover:scale-[1.01]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 dark:bg-primary/20">
            <Icon className="size-4 text-primary" />
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              changeType === "positive"
                ? "text-success"
                : "text-destructive"
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
          <p className="text-xl font-semibold tracking-tight">{value}</p>
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
  },
  {
    title: "Active Listings",
    value: "156",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "New Leads",
    value: "89",
    change: "+23.1%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Revenue",
    value: "$124.5K",
    change: "-2.3%",
    changeType: "negative" as const,
    icon: DollarSign,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-children pb-2">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}