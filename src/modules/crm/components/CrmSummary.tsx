"use client"

import { useEffect, useState } from "react"
import { Eye, MessageSquare, Trophy, TrendingUp, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { crmDashboardService } from "../services/crmService"
import type { CrmDashboardSummary, CrmTodaySnapshot } from "../types"

interface CrmSummaryProps {
  testIdPrefix?: string
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  testId,
}: {
  title: string
  value: number
  icon: typeof Users
  testId: string
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight tabular-nums">
          {new Intl.NumberFormat().format(value)}
        </p>
      </CardContent>
    </Card>
  )
}

export function CrmSummary({ testIdPrefix = "crm-summary" }: CrmSummaryProps) {
  const [summary, setSummary] = useState<CrmDashboardSummary | null>(null)
  const [today, setToday] = useState<CrmTodaySnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const [summaryResult, todayResult] = await Promise.all([
        crmDashboardService.getSummary(),
        crmDashboardService.getToday(),
      ])
      if (cancelled) return
      setSummary(summaryResult)
      setToday(todayResult)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid={`${testIdPrefix}-loading`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-2 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary && !today) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary ? (
          <>
            <SummaryCard
              title="Total leads"
              value={summary.total_leads}
              icon={Users}
              testId={`${testIdPrefix}-total`}
            />
            <SummaryCard
              title="New"
              value={summary.new_leads}
              icon={TrendingUp}
              testId={`${testIdPrefix}-new`}
            />
            <SummaryCard
              title="Qualified"
              value={summary.qualified_leads}
              icon={MessageSquare}
              testId={`${testIdPrefix}-qualified`}
            />
            <SummaryCard
              title="Won"
              value={summary.won_leads}
              icon={Trophy}
              testId={`${testIdPrefix}-won`}
            />
          </>
        ) : today ? (
          <>
            <SummaryCard
              title="Today leads"
              value={today.today_leads}
              icon={Users}
              testId={`${testIdPrefix}-today`}
            />
            <SummaryCard
              title="New today"
              value={today.new_today}
              icon={TrendingUp}
              testId={`${testIdPrefix}-new-today`}
            />
            <SummaryCard
              title="Follow-ups due"
              value={today.follow_ups_due}
              icon={Eye}
              testId={`${testIdPrefix}-followups`}
            />
            <SummaryCard
              title="Upcoming"
              value={today.upcoming_appointments}
              icon={MessageSquare}
              testId={`${testIdPrefix}-upcoming`}
            />
          </>
        ) : null}
      </div>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Conversion rate</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.conversion_rate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leads change</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.leads_change > 0 ? "+" : ""}
                {summary.leads_change.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Won change</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.won_change > 0 ? "+" : ""}
                {summary.won_change.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
