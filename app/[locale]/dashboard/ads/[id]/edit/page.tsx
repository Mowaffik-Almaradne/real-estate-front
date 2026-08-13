"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { Card, CardContent } from "components/ui/card"
import { DashboardLayout } from "components/layout/DashboardLayout"
import { ApiClientError } from "@/lib/apiClient"

import {
  AdFormDialog,
  AdDeleteDialog,
  adService,
  useAd,
  useAdGroups,
  useAdsTranslations,
  type CreateAdRequest,
  type UpdateAdRequest,
} from "src/modules/ads"

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t } = useAdsTranslations()
  const adId = Number(id)
  const { ad, loading, error } = useAd(Number.isFinite(adId) ? adId : 0)
  const groupsHook = useAdGroups({ perPage: 100 })

  const [formOpen, setFormOpen] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(adId) || adId <= 0) {
      router.replace("/dashboard/ads")
    }
  }, [adId, router])

  const handleSubmit = async (payload: CreateAdRequest | UpdateAdRequest) => {
    if (!ad) return
    await adService.update(ad.id, payload)
  }

  const handleDelete = async () => {
    if (!ad) return
    setDeleting(true)
    try {
      await adService.archive(ad.id)
      toast.success(t("ads.delete.success"))
      router.push("/dashboard/ads")
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t("ads.errorLoading")
      toast.error(message)
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={t("ads.editAd")}>
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

  return (
    <DashboardLayout title={t("ads.editAd")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/dashboard/ads")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("ads.backToList")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={ad.status === "archived"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("ads.actions.delete")}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">{ad.title}</h2>
            <p className="text-xs text-muted-foreground">
              {t("ads.detail.createdAt")}: {new Date(ad.created_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <AdFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) router.push("/dashboard/ads")
        }}
        editing={ad}
        groups={groupsHook.groups}
        onSubmit={async (payload) => {
          await handleSubmit(payload)
          toast.success(t("ads.update.success"))
          router.push("/dashboard/ads")
        }}
      />

      <AdDeleteDialog
        open={deleteOpen}
        submitting={deleting}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
