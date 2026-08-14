import { Card, CardContent } from "@/components/ui/card"

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
      <Card className="border-border/50 bg-card">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Connect the dashboard to real data sources to surface stats here.
        </CardContent>
      </Card>
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