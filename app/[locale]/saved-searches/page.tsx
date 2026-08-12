"use client"

import { Suspense, useState } from "react"
import { useTranslations } from "next-intl"
import { BookmarkPlus } from "lucide-react"

import { Button } from "components/ui/button"
import { DashboardLayout } from "components/layout/DashboardLayout"

import { SavedSearchesList } from "src/modules/saved-searches/components/SavedSearchesList"
import { SaveSearchDialog } from "src/modules/saved-searches/components/SaveSearchDialog"
import {
  useCurrentSearchCandidate,
} from "src/modules/saved-searches/hooks/useCurrentSearchCandidate"

function SavedSearchesPageInner() {
  const t = useTranslations("savedSearches")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const { filters } = useCurrentSearchCandidate()

  return (
    <DashboardLayout
      title={t("title")}
      actions={
        <Button
          type="button"
          onClick={() => setSaveDialogOpen(true)}
          size="sm"
          data-testid="open-save-search-dialog"
        >
          <BookmarkPlus className="size-4" aria-hidden />
          {t("saveThisSearch")}
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <SavedSearchesList onCreateClick={() => setSaveDialogOpen(true)} />
      </div>

      <SaveSearchDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        filters={filters}
      />
    </DashboardLayout>
  )
}

export default function SavedSearchesPage() {
  return (
    <Suspense fallback={null}>
      <SavedSearchesPageInner />
    </Suspense>
  )
}