"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { toast } from "sonner"

import { DashboardLayout } from "components/layout/DashboardLayout"
import { userService } from "@/services/user-service"
import { chatService } from "@/services/chat-service"
import { PublisherHero } from "src/modules/publishers/components/PublisherHero"
import { PublisherStatsGrid } from "src/modules/publishers/components/PublisherStatsGrid"
import { PublisherAbout } from "src/modules/publishers/components/PublisherAbout"
import { PublisherPropertiesGrid } from "src/modules/publishers/components/PublisherPropertiesGrid"
import { ReviewsSection } from "src/modules/reviews/components/ReviewsSection"
import { ApiClientError } from "@/lib/apiClient"
import { cn } from "@/lib/utils"
import type { PropertyDto } from "@/types/dto"
import type { PublisherProfileDto } from "@/types/publisher"

type Tab = "properties" | "reviews" | "about"

function PublisherProfileInner() {
  const params = useParams<{ id: string; locale: string }>()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("publisher")
  const id = Number(params.id)
  const [publisher, setPublisher] = useState<PublisherProfileDto | null>(null)
  const [properties, setProperties] = useState<PropertyDto[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("properties")
  const [creatingChat, setCreatingChat] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(id)) return
    let active = true
    void (async () => {
      if (active) setLoadingProfile(true)
      try {
        const data = await userService.getById(id)
        if (active) setPublisher(data)
      } catch (err) {
        if (!active) return
        const message = err instanceof ApiClientError ? err.message : "Failed to load publisher"
        setError(message)
      } finally {
        if (active) setLoadingProfile(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!Number.isFinite(id)) return
    let active = true
    void (async () => {
      if (active) setLoadingProperties(true)
      try {
        const res = await userService.getProperties(id, { perPage: 12 })
        if (active) setProperties(res.data)
      } catch {
        if (active) setProperties([])
      } finally {
        if (active) setLoadingProperties(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const handleContact = useCallback(async () => {
    if (!publisher || creatingChat) return
    setCreatingChat(true)
    try {
      const room = await chatService.createRoom({
        type: "private",
        recipient_id: publisher.id,
      })
      router.push(`/${locale}/chat?room=${room.id}`)
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Failed to start chat"
      toast.error(message)
    } finally {
      setCreatingChat(false)
    }
  }, [creatingChat, locale, publisher, router])

  if (!Number.isFinite(id)) {
    return (
      <DashboardLayout title={t("title")}>
        <p className="text-sm text-muted-foreground">Invalid user ID.</p>
      </DashboardLayout>
    )
  }

  if (loadingProfile) {
    return (
      <DashboardLayout title={t("title")}>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !publisher) {
    return (
      <DashboardLayout title={t("title")}>
        <p className="text-sm text-destructive">{error ?? "Publisher not found"}</p>
      </DashboardLayout>
    )
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "properties", label: t("tabs.properties"), count: publisher.properties_count },
    { id: "reviews", label: t("tabs.reviews"), count: publisher.reviews_count },
    { id: "about", label: t("tabs.about") },
  ]

  return (
    <DashboardLayout title={t("title")}>
      <div className="space-y-6">
        <PublisherHero publisher={publisher} onContact={handleContact} />
        <PublisherStatsGrid publisher={publisher} />

        <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
          {tabs.map(({ id: tabId, label, count }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setTab(tabId)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === tabId
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-pressed={tab === tabId}
            >
              {label}
              {typeof count === "number" && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    tab === tabId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "properties" && (
          <PublisherPropertiesGrid
            properties={properties}
            isLoading={loadingProperties}
          />
        )}

        {tab === "reviews" && (
          <ReviewsSection
            propertyId={-1}
            initialAverage={publisher.average_rating}
            initialCount={publisher.reviews_count}
          />
        )}

        {tab === "about" && <PublisherAbout publisher={publisher} />}
      </div>
    </DashboardLayout>
  )
}

export default function PublisherProfilePage() {
  return (
    <Suspense fallback={null}>
      <PublisherProfileInner />
    </Suspense>
  )
}