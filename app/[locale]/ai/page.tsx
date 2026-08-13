"use client"

import { useState } from "react"
import { useLocale } from "next-intl"

import { DashboardLayout } from "components/layout/DashboardLayout"

import { getAiLabel } from "src/modules/ai/labels"
import { AiSearchPanel } from "src/modules/ai/components/AiSearchPanel"
import { DescriptionAssistantPanel } from "src/modules/ai/components/DescriptionAssistantPanel"

type Tab = "search" | "assistant"

export default function AiPage() {
  const locale = useLocale()
  const label = (key: string, vars: Record<string, string | number> = {}) =>
    getAiLabel(locale, key, vars)
  const [tab, setTab] = useState<Tab>("search")

  return (
    <DashboardLayout title={label("ai.title")}>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{label("ai.subtitle")}</p>

        <div className="flex items-center gap-1 rounded-md border p-0.5 w-fit">
          <button
            type="button"
            className={
              "px-3 py-1.5 text-sm rounded-sm transition-colors " +
              (tab === "search"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-accent")
            }
            onClick={() => setTab("search")}
          >
            {label("ai.tab.search")}
          </button>
          <button
            type="button"
            className={
              "px-3 py-1.5 text-sm rounded-sm transition-colors " +
              (tab === "assistant"
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-accent")
            }
            onClick={() => setTab("assistant")}
          >
            {label("ai.tab.assistant")}
          </button>
        </div>

        {tab === "search" ? <AiSearchPanel /> : <DescriptionAssistantPanel />}
      </div>
    </DashboardLayout>
  )
}
