"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  AdFormDialog,
  AdDeleteDialog,
  AdLinkPropertyDialog,
  AdsFiltersBar,
  AdsGridView,
  useAds,
  useAdGroups,
  useAdsTranslations,
  type AdDto,
  type AdsPaginationInfo,
  type CreateAdRequest,
  type UpdateAdRequest,
} from "src/modules/ads"
import { AdStatus } from "@/types/enums"

export default function AdsPage() {
  const router = useRouter()
  const { t } = useAdsTranslations()
  const adsHook = useAds()
  const groupsHook = useAdGroups({ perPage: 100 })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdDto | null>(null)
  const [deleteId, setDeleteId] = useState<AdDto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [linkTarget, setLinkTarget] = useState<AdDto | null>(null)

  const pagination = useMemo<AdsPaginationInfo>(() => {
    return {
      total: adsHook.ads.length,
      per_page: 15,
      current_page: adsHook.page,
      last_page: 1,
      from: adsHook.ads.length ? (adsHook.page - 1) * 15 + 1 : 0,
      to: adsHook.ads.length ? (adsHook.page - 1) * 15 + adsHook.ads.length : 0,
    }
  }, [adsHook.ads, adsHook.page])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: CreateAdRequest | UpdateAdRequest) => {
    if (editing) {
      await adsHook.update(editing.id, payload)
      toast.success(t("ads.update.success"))
    } else {
      await adsHook.create(payload as CreateAdRequest)
      toast.success(t("ads.create.success"))
    }
  }

  const handleArchive = useCallback((ad: AdDto) => {
    setDeleteId(ad)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await adsHook.archive(deleteId.id)
      toast.success(t("ads.delete.success"))
      setDeleteId(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (ad: AdDto, status: AdStatus) => {
    try {
      await adsHook.setStatus(ad.id, { status })
      toast.success(t("ads.statusChange.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleRestore = async (ad: AdDto) => {
    try {
      await adsHook.restore(ad.id)
      toast.success(t("ads.restore.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleLinkProperty = async (propertyId: number) => {
    if (!linkTarget) return
    try {
      await adsHook.linkProperty(linkTarget.id, { property_id: propertyId })
      toast.success(t("ads.linkProperty.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
      throw err
    }
  }

  const handleUnlinkProperty = async (ad: AdDto) => {
    try {
      await adsHook.unlinkProperty(ad.id)
      toast.success(t("ads.unlinkProperty.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  return (
    <DashboardLayout title={t("ads.title")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("ads.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ads.subtitle")}</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-1.5 size-4" />
            {t("ads.newAd")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <AdsFiltersBar
              filters={adsHook.filters}
              onChange={adsHook.setFilters}
              groups={groupsHook.groups}
              loading={adsHook.loading || groupsHook.loading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AdsGridView
              ads={adsHook.ads}
              loading={adsHook.loading}
              pagination={pagination}
              page={adsHook.page}
              emptyMessage={t("ads.empty")}
              onPageChange={adsHook.setPage}
              onEdit={(ad) => {
                router.push(`/dashboard/ads/${ad.id}/edit`)
              }}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onSetStatus={handleStatusChange}
              onLinkProperty={(ad) => setLinkTarget(ad)}
              onUnlinkProperty={handleUnlinkProperty}
            />
          </CardContent>
        </Card>
      </div>

      <AdFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        groups={groupsHook.groups}
        onSubmit={handleSubmit}
      />

      <AdDeleteDialog
        open={Boolean(deleteId)}
        submitting={deleting}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <AdLinkPropertyDialog
        open={Boolean(linkTarget)}
        onOpenChange={(open) => !open && setLinkTarget(null)}
        currentPropertyId={linkTarget?.property_id ?? null}
        onConfirm={handleLinkProperty}
      />
    </DashboardLayout>
  )
}
