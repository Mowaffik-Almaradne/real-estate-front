"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import {
  ArrowLeft,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Link2,
  Link2Off,
  Loader2,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
  Star,
  Calendar,
} from "lucide-react"

import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  AdDeleteDialog,
  AdLinkPropertyDialog,
  AdStatusBadge,
  adService,
  useAd,
  useAdsTranslations,
} from "src/modules/ads"
import { AdStatus } from "@/types/enums"

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useAdsTranslations()
  const adId = Number(id)
  const { ad, loading, error, refresh } = useAd(Number.isFinite(adId) ? adId : 0)

  const [linkOpen, setLinkOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(adId) || adId <= 0) {
      router.replace("/dashboard/ads")
    }
  }, [adId, router])

  const run = async (key: string, action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(key)
    try {
      await action()
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  const handleArchive = async () => {
    if (!ad) return
    try {
      await adService.archive(ad.id)
      toast.success(t("ads.delete.success"))
      router.push("/dashboard/ads")
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setDeleteOpen(false)
    }
  }

  const handleLinkProperty = async (propertyId: number) => {
    if (!ad) return
    await adService.linkProperty(ad.id, { property_id: propertyId })
    toast.success(t("ads.linkProperty.success"))
  }

  if (loading) {
    return (
      <DashboardLayout title={t("ads.detail.notFound")}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !ad) {
    return (
      <DashboardLayout title={t("ads.notFoundTitle")}>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted-foreground">
              {error ?? t("ads.detail.notFound")}
            </p>
            <Button variant="outline" onClick={() => router.push("/dashboard/ads")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("ads.backToList")}
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const isArchived = ad.status === AdStatus.archived
  const firstMedia = ad.media?.[0]
  const preview = firstMedia?.thumb_url ?? firstMedia?.url ?? null

  return (
    <DashboardLayout title={ad.title}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={() => router.push("/dashboard/ads")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("ads.backToList")}
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/ads/${ad.id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("ads.actions.edit")}
            </Button>
            {isArchived ? (
              <Button
                variant="outline"
                onClick={() => void run("restore", () => adService.restore(ad.id).then(() => toast.success(t("ads.restore.success"))))}
                disabled={Boolean(busy)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("ads.actions.restore")}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={Boolean(busy)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("ads.actions.delete")}
              </Button>
            )}
            {!isArchived && ad.status === AdStatus.paused && (
              <Button
                variant="outline"
                onClick={() =>
                  void run("resume", () =>
                    adService.setStatus(ad.id, { status: AdStatus.active }).then(() =>
                      toast.success(t("ads.statusChange.success"))
                    )
                  )
                }
                disabled={Boolean(busy)}
              >
                <Power className="mr-2 h-4 w-4" />
                {t("ads.actions.resume")}
              </Button>
            )}
            {!isArchived && ad.status === AdStatus.active && (
              <Button
                variant="outline"
                onClick={() =>
                  void run("pause", () =>
                    adService.setStatus(ad.id, { status: AdStatus.paused }).then(() =>
                      toast.success(t("ads.statusChange.success"))
                    )
                  )
                }
                disabled={Boolean(busy)}
              >
                <Power className="mr-2 h-4 w-4" />
                {t("ads.actions.pause")}
              </Button>
            )}
            {!isArchived && (
              <Button
                variant="outline"
                onClick={() => setLinkOpen(true)}
                disabled={Boolean(busy)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {t("ads.actions.linkProperty")}
              </Button>
            )}
            {ad.property_id ? (
              <Button
                variant="outline"
                onClick={() =>
                  void run("unlink", () =>
                    adService.unlinkProperty(ad.id).then(() =>
                      toast.success(t("ads.unlinkProperty.success"))
                    )
                  )
                }
                disabled={Boolean(busy)}
              >
                <Link2Off className="mr-2 h-4 w-4" />
                {t("ads.actions.unlinkProperty")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{ad.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <AdStatusBadge status={ad.status} />
                  {ad.is_default && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="size-3" />
                      {t("ads.detail.defaultBadge")}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {preview ? (
                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                  <Image
                    src={preview}
                    alt={ad.title}
                    width={1280}
                    height={720}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {ad.media_type === "video" ? (
                    <Film className="size-10" />
                  ) : (
                    <ImageIcon className="size-10" />
                  )}
                </div>
              )}

              {ad.description && (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {ad.description}
                </p>
              )}

              {ad.external_url && (
                <a
                  href={ad.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="size-4" />
                  {t("ads.detail.externalLink")}
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("ads.columns.group")}</span>
                <span className="font-medium">
                  {ad.ad_group?.name ?? t("ads.noGroup")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("ads.detail.propertyLabel")}</span>
                <span className="font-medium">
                  {ad.property?.name ?? t("ads.detail.noProperty")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("ads.detail.schedule")}</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Calendar className="size-4 text-muted-foreground" />
                  {ad.start_date || ad.end_date
                    ? `${formatDate(ad.start_date)} → ${formatDate(ad.end_date)}`
                    : t("ads.detail.notScheduled")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("ads.detail.createdAt")}</span>
                <span>{formatDate(ad.created_at)}</span>
              </div>
              {ad.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("ads.detail.updatedAt")}</span>
                  <span>{formatDate(ad.updated_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AdLinkPropertyDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        currentPropertyId={ad.property_id ?? null}
        onConfirm={async (propertyId) => {
          await handleLinkProperty(propertyId)
          setLinkOpen(false)
        }}
      />

      <AdDeleteDialog
        open={deleteOpen}
        submitting={Boolean(busy)}
        onOpenChange={setDeleteOpen}
        onConfirm={handleArchive}
      />
    </DashboardLayout>
  )
}
