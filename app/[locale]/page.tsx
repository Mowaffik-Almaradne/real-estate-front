import dynamic from "next/dynamic"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { StatsCardsSkeleton } from "components/dashboard/StatsCards"

const StatsCards = dynamic(
  () => import("components/dashboard/StatsCards").then((m) => m.StatsCards),
  {
    loading: () => <StatsCardsSkeleton />,
  }
)

const RecentActivity = dynamic(
  () => import("components/dashboard/RecentActivity").then((m) => m.RecentActivity),
  {
    loading: () => (
      <div className="rounded-lg border bg-card p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    ),
  }
)

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("home")
  const tNav = await getTranslations("nav")

  return (
    <DashboardLayout title={tNav("dashboard")}>
      <div className="space-y-8">
        <div className="stagger-children-sm">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("title")} <span className="text-gradient">!</span>
          </h2>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  )
}
