"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Archive, FileDown, Users } from "lucide-react"
import { toast } from "sonner"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ApiClientError } from "@/lib/apiClient"

import {
  CrmSummary,
  CreateLeadDialog,
  LeadDetailDialog,
  LeadList,
} from "src/modules/crm"
import { useLeads } from "src/modules/crm/hooks/useLeads"
import { leadService } from "src/modules/crm/services/crmService"
import type { Lead, LeadFilters } from "src/modules/crm"

export default function CrmLeadsPage() {
  const t = useTranslations()
  const [showArchived, setShowArchived] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { leads, loading, error, filters, setFilters, refresh } = useLeads()

  const handleSelect = (lead: Lead) => {
    setSelectedLead(lead)
    setDetailOpen(true)
  }

  const handleArchiveToggle = async (lead: Lead) => {
    try {
      if (lead.archived_at) {
        await leadService.restore(lead.id)
        toast.success(t("crm.toast.restored") || "Lead restored")
      } else {
        await leadService.archive(lead.id)
        toast.success(t("crm.toast.archived") || "Lead archived")
      }
      void refresh()
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Action failed"
      toast.error(message)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await leadService.exportCsv()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Export failed"
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <DashboardLayout
      title={t("nav.leads") || "Leads"}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived((prev) => !prev)}
            data-testid="crm-toggle-archived"
          >
            {showArchived ? (
              <>
                <Users className="size-4" />
                {t("crm.actions.active") || "Active"}
              </>
            ) : (
              <>
                <Archive className="size-4" />
                {t("crm.actions.archived") || "Archived"}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            data-testid="crm-export"
          >
            <FileDown className="size-4" />
            {t("crm.actions.export") || "Export"}
          </Button>
          <CreateLeadDialog
            onCreated={() => {
              void refresh()
            }}
          />
        </div>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("crm.title") || "Mini CRM"}
            </CardTitle>
            <CardDescription>
              {t("crm.subtitle") ||
                "Track leads, capture contact details, and follow up to convert them into customers."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrmSummary />
          </CardContent>
        </Card>

        {showArchived ? (
          <ArchivedLeadsSection onSelect={handleSelect} />
        ) : (
          <LeadList
            leads={leads}
            loading={loading}
            error={error}
            filters={filters}
            onFiltersChange={(updater) => {
              setFilters(updater)
            }}
            onSelect={handleSelect}
            onArchiveToggle={handleArchiveToggle}
          />
        )}
      </div>

      <LeadDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        lead={selectedLead}
        onUpdated={() => {
          void refresh()
        }}
      />
    </DashboardLayout>
  )
}

function ArchivedLeadsSection({
  onSelect,
}: {
  onSelect: (lead: Lead) => void
}) {
  const t = useTranslations()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await leadService.listArchived()
      setLeads(result.data)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to load"
      setError(message)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Archive className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {t("crm.archived.title") || "Archived leads"}
        </h2>
      </div>
      <LeadList
        leads={leads}
        loading={loading}
        error={error}
        filters={{}}
        onFiltersChange={() => {
          /* archived view does not support filters in this iteration */
        }}
        showArchived
        onSelect={onSelect}
        onArchiveToggle={async (lead) => {
          await leadService.restore(lead.id)
          void refresh()
        }}
      />
    </div>
  )
}
