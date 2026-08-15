"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { Pagination } from "components/ui/pagination"
import { ApiClientError } from "@/lib/apiClient"

import {
  AdGroupDeleteDialog,
  AdGroupFormDialog,
  AdGroupsFiltersBar,
  AdGroupsGrid,
  SetDefaultAdDialog,
  useAdGroups,
  useAdsTranslations,
  type AdGroupDto,
  type CreateAdGroupRequest,
  type UpdateAdGroupRequest,
} from "src/modules/ads"

export default function AdGroupsPage() {
  const { t } = useAdsTranslations()
  const groupsHook = useAdGroups()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdGroupDto | null>(null)
  const [deleteId, setDeleteId] = useState<AdGroupDto | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [defaultTarget, setDefaultTarget] = useState<AdGroupDto | null>(null)

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (group: AdGroupDto) => {
    setEditing(group)
    setFormOpen(true)
  }

  const handleSubmit = async (
    payload: CreateAdGroupRequest | UpdateAdGroupRequest
  ) => {
    if (editing) {
      await groupsHook.update(editing.id, payload)
      toast.success(t("ads.groups.update.success"))
    } else {
      await groupsHook.create(payload as CreateAdGroupRequest)
      toast.success(t("ads.groups.create.success"))
    }
  }

  const handleArchive = useCallback((group: AdGroupDto) => {
    setDeleteId(group)
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await groupsHook.archive(deleteId.id)
      toast.success(t("ads.groups.archive.success"))
      setDeleteId(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  const handleRestore = async (group: AdGroupDto) => {
    try {
      await groupsHook.restore(group.id)
      toast.success(t("ads.groups.restore.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleSetDefault = (group: AdGroupDto) => {
    setDefaultTarget(group)
  }

  const handleDefaultConfirm = async (adId: number) => {
    if (!defaultTarget) return
    try {
      await groupsHook.setDefault(defaultTarget.id, {
        ad_group_id: defaultTarget.id,
        ad_id: adId,
      })
      toast.success(t("ads.setDefault.success"))
      setDefaultTarget(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleRemoveDefault = async (group: AdGroupDto) => {
    try {
      await groupsHook.removeDefault(group.id)
      toast.success(t("ads.removeDefault.success"))
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  return (
    <DashboardLayout title={t("ads.groups.title")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("ads.groups.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ads.groups.subtitle")}</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="mr-1.5 size-4" />
            {t("ads.groups.newGroup")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <AdGroupsFiltersBar
              filters={groupsHook.filters}
              onChange={groupsHook.setFilters}
              loading={groupsHook.loading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <AdGroupsGrid
              groups={groupsHook.groups}
              loading={groupsHook.loading}
              pagination={{
                ...groupsHook.pagination,
                from: groupsHook.pagination.from ?? 0,
                to: groupsHook.pagination.to ?? 0,
              }}
              page={groupsHook.page}
              emptyMessage={t("ads.groups.empty")}
              onPageChange={groupsHook.setPage}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onSetDefault={handleSetDefault}
              onRemoveDefault={handleRemoveDefault}
            />
            <div className="mt-4">
              <Pagination
                currentPage={groupsHook.pagination.current_page || groupsHook.page}
                totalPages={groupsHook.pagination.last_page}
                total={groupsHook.pagination.total}
                perPage={groupsHook.pagination.per_page || 15}
                disabled={groupsHook.loading}
                onPageChange={groupsHook.setPage}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AdGroupFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />

      <AdGroupDeleteDialog
        open={Boolean(deleteId)}
        submitting={deleting}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />

      <SetDefaultAdDialog
        open={Boolean(defaultTarget)}
        groupId={defaultTarget?.id ?? null}
        currentDefaultId={defaultTarget?.default_ad_id ?? null}
        onOpenChange={(open) => !open && setDefaultTarget(null)}
        onConfirm={handleDefaultConfirm}
      />
    </DashboardLayout>
  )
}
