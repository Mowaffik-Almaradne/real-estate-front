"use client"

import { useCallback, use, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Star,
  StarOff,
  Trash2,
} from "lucide-react"

import { Button } from "components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  AdDashboardCard,
  AdDeleteDialog,
  AdFormDialog,
  AdGroupDeleteDialog,
  AdGroupFormDialog,
  AdLinkPropertyDialog,
  SetDefaultAdDialog,
  adGroupService,
  useAdGroup,
  useAds,
  useAdsTranslations,
  type AdDto,
  type AdGroupDto,
  type CreateAdRequest,
  type UpdateAdRequest,
} from "src/modules/ads"
import { AdStatus } from "@/types/enums"

export default function AdGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useAdsTranslations()
  const groupId = Number(id)
  const { group, loading, error, refresh } = useAdGroup(
    Number.isFinite(groupId) ? groupId : 0
  )

  const [adFormOpen, setAdFormOpen] = useState(false)
  const [adEditing, setAdEditing] = useState<AdDto | null>(null)
  const [adDelete, setAdDelete] = useState<AdDto | null>(null)
  const [adDeleting, setAdDeleting] = useState(false)
  const [linkTarget, setLinkTarget] = useState<AdDto | null>(null)
  const [groupEditOpen, setGroupEditOpen] = useState(false)
  const [groupDeleteOpen, setGroupDeleteOpen] = useState(false)
  const [groupDeleting, setGroupDeleting] = useState(false)
  const [defaultPicker, setDefaultPicker] = useState(false)

  const adsHook = useAds({
    ad_group_id: Number.isFinite(groupId) ? groupId : undefined,
    perPage: 100,
  })

  useEffect(() => {
    if (!Number.isFinite(groupId) || groupId <= 0) {
      router.replace("/dashboard/ad-groups")
    }
  }, [groupId, router])

  const refreshGroupAds = async () => {
    await Promise.all([refresh(), adsHook.refresh()])
  }

  const handleAdSubmit = async (payload: CreateAdRequest | UpdateAdRequest) => {
    const next = { ...payload, ad_group_id: groupId }
    if (adEditing) {
      await adsHook.update(adEditing.id, next)
      toast.success(t("ads.update.success"))
    } else {
      await adsHook.create(next as CreateAdRequest)
      toast.success(t("ads.create.success"))
    }
    await refreshGroupAds()
  }

  const handleArchive = useCallback((ad: AdDto) => {
    setAdDelete(ad)
  }, [])

  const handleArchiveConfirm = async () => {
    if (!adDelete) return
    setAdDeleting(true)
    try {
      await adsHook.archive(adDelete.id)
      toast.success(t("ads.delete.success"))
      setAdDelete(null)
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setAdDeleting(false)
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

  const handleSetStatus = async (ad: AdDto, status: AdStatus) => {
    try {
      await adsHook.setStatus(ad.id, { status })
      toast.success(t("ads.statusChange.success"))
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

  const handleSetDefault = async (adId: number) => {
    if (!group) return
    try {
      await adGroupService.setDefault(group.id, {
        ad_group_id: group.id,
        ad_id: adId,
      })
      toast.success(t("ads.setDefault.success"))
      await refreshGroupAds()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleRemoveDefault = async (group: AdGroupDto) => {
    try {
      await adGroupService.removeDefault(group.id)
      toast.success(t("ads.removeDefault.success"))
      await refresh()
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    }
  }

  const handleGroupUpdate = async (
    payload: Parameters<typeof adGroupService.update>[1]
  ) => {
    if (!group) return
    await adGroupService.update(group.id, payload)
    toast.success(t("ads.groups.update.success"))
    await refresh()
  }

  const handleGroupArchive = async () => {
    if (!group) return
    setGroupDeleting(true)
    try {
      await adGroupService.archive(group.id)
      toast.success(t("ads.groups.archive.success"))
      router.push("/dashboard/ad-groups")
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setGroupDeleting(false)
      setGroupDeleteOpen(false)
    }
  }

  const defaultAd = useMemo(() => {
    if (!group?.default_ad) return null
    return group.default_ad
  }, [group?.default_ad])

  if (loading) {
    return (
      <DashboardLayout title={t("ads.groups.detail.notFound")}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !group) {
    return (
      <DashboardLayout title={t("ads.groups.detail.notFound")}>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted-foreground">
              {error ?? t("ads.groups.detail.notFound")}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/ad-groups")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("ads.groups.detail.backToGroups")}
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={group.name}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/ad-groups")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("ads.groups.detail.backToGroups")}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setGroupEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("ads.groups.actions.edit")}
            </Button>
            {group.is_archived ? (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await adGroupService.restore(group.id)
                    toast.success(t("ads.groups.restore.success"))
                    await refresh()
                  } catch (err) {
                    const message =
                      err instanceof ApiClientError
                        ? err.message
                        : t("ads.errorLoading")
                    toast.error(message)
                  }
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("ads.groups.actions.restore")}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setGroupDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("ads.groups.actions.archive")}
              </Button>
            )}
            {!group.is_archived && !group.default_ad_id && adsHook.ads.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setDefaultPicker(true)}
              >
                <Star className="mr-2 h-4 w-4" />
                {t("ads.groups.actions.setDefault")}
              </Button>
            )}
            {!group.is_archived && group.default_ad_id && (
              <Button
                variant="outline"
                onClick={() => handleRemoveDefault(group)}
              >
                <StarOff className="mr-2 h-4 w-4" />
                {t("ads.groups.actions.removeDefault")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("ads.groups.detail.descriptionLabel")}
                </p>
                <p className="mt-1">
                  {group.description ?? t("ads.groups.detail.noDescription")}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("ads.groups.columns.status")}
                </span>
                <span className="font-medium capitalize">{group.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("ads.groups.columns.defaultAd")}
                </span>
                <span className="font-medium">
                  {defaultAd?.title ?? t("ads.groups.detail.noDefaultAd")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("ads.groups.columns.adsCount")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {adsHook.ads.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t("ads.groups.detail.adsSectionTitle")}</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setAdEditing(null)
                setAdFormOpen(true)
              }}
              disabled={group.is_archived === true}
            >
              <Plus className="mr-1.5 size-4" />
              {t("ads.newAd")}
            </Button>
          </CardHeader>
          <CardContent>
            {adsHook.loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : adsHook.ads.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
                {t("ads.groups.detail.adsEmpty")}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {adsHook.ads.map((ad) => (
                  <AdDashboardCard
                    key={ad.id}
                    ad={ad}
                    isDefaultAd={
                      ad.id === group.default_ad_id || ad.is_default === true
                    }
                    onEdit={(item) => {
                      setAdEditing(item)
                      setAdFormOpen(true)
                    }}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onSetStatus={handleSetStatus}
                    onLinkProperty={(item) => setLinkTarget(item)}
                    onUnlinkProperty={handleUnlinkProperty}
                    onSetDefault={(item) => {
                      void handleSetDefault(item.id)
                    }}
                    onRemoveDefault={async (item) => {
                      if (
                        group.default_ad_id != null &&
                        group.default_ad_id === item.id
                      ) {
                        await handleRemoveDefault(group)
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="sr-only">
          <AdStatusBadge status={AdStatus.draft} />
        </div>
      </div>

      <AdFormDialog
        open={adFormOpen}
        onOpenChange={(open) => {
          setAdFormOpen(open)
          if (!open) setAdEditing(null)
        }}
        editing={adEditing}
        groups={group ? [group] : []}
        defaultGroupId={group.id}
        onSubmit={handleAdSubmit}
      />

      <AdDeleteDialog
        open={Boolean(adDelete)}
        submitting={adDeleting}
        onOpenChange={(open) => !open && setAdDelete(null)}
        onConfirm={handleArchiveConfirm}
      />

      <AdLinkPropertyDialog
        open={Boolean(linkTarget)}
        onOpenChange={(open) => !open && setLinkTarget(null)}
        currentPropertyId={linkTarget?.property_id ?? null}
        onConfirm={handleLinkProperty}
      />

      <AdGroupFormDialog
        open={groupEditOpen}
        onOpenChange={setGroupEditOpen}
        editing={group}
        onSubmit={async (payload) => {
          await handleGroupUpdate(payload)
          setGroupEditOpen(false)
        }}
      />

      <AdGroupDeleteDialog
        open={groupDeleteOpen}
        submitting={groupDeleting}
        onOpenChange={setGroupDeleteOpen}
        onConfirm={handleGroupArchive}
      />

      <SetDefaultAdDialog
        open={defaultPicker}
        groupId={group.id}
        currentDefaultId={group.default_ad_id ?? null}
        onOpenChange={setDefaultPicker}
        onConfirm={async (adId) => {
          await handleSetDefault(adId)
          setDefaultPicker(false)
        }}
      />
    </DashboardLayout>
  )
}
