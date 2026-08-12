import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { SettingsSidebar } from "src/modules/settings/SettingsSidebar"

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("settings")

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <SettingsSidebar />
          </aside>
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </DashboardLayout>
  )
}
