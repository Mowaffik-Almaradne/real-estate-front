import { DashboardLayout } from "components/layout/DashboardLayout";
import { StatsCards } from "components/dashboard/StatsCards";
import { RecentActivity } from "components/dashboard/RecentActivity";

export default function Home() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div className="stagger-children-sm">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back <span className="text-gradient">!</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your real estate business.
          </p>
        </div>

        <StatsCards />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
}