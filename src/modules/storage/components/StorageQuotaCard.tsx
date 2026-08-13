"use client"

import { useMemo } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import {
  STORAGE_PACKAGE_TYPES,
  type StoragePackage,
  type StorageStatus,
} from "../types"
import { useStorageTranslations } from "../locales/useStorageTranslations"

interface StorageQuotaCardProps {
  status: StorageStatus | null
  packages: StoragePackage[]
  loading: boolean
  onUpgrade?: (packageType: StorageStatus["package_type"]) => Promise<unknown>
  upgrading?: StoragePackageType | null
}

const PACKAGE_LABELS: Record<StorageStatus["package_type"], string> = {
  free: "storage.free",
  small: "storage.small",
  medium: "storage.medium",
  large: "storage.large",
  max: "storage.max",
}

export function StorageQuotaCard({
  status,
  packages,
  loading,
  onUpgrade,
  upgrading,
}: StorageQuotaCardProps) {
  const { t } = useStorageTranslations()

  const percent = useMemo(() => {
    if (!status) return 0
    return Math.min(100, Math.max(0, status.used_percentage))
  }, [status])

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("storage.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("storage.title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t("storageError")}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="storage-quota-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {t("storage.title")}
          <Badge variant="outline">
            {t(`storage.${status.package_type}` as "storage.free")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>
              {t("storage.used")} {status.used_readable} {t("storage.of")}{" "}
              {status.quota_readable}
            </span>
            <span>{percent.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${
                status.is_exceeded
                  ? "bg-destructive"
                  : status.is_near_limit
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("storage.remaining")}: {status.remaining_bytes != null
              ? formatBytes(status.remaining_bytes)
              : "—"}
          </p>
        </div>

        {status.is_exceeded && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="size-4" />
            <p>{t("storage.exceeded")}</p>
          </div>
        )}
        {!status.is_exceeded && status.is_near_limit && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/5 p-3 text-xs text-amber-700">
            <AlertTriangle className="size-4" />
            <p>{t("storage.nearLimit")}</p>
          </div>
        )}

        {packages.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STORAGE_PACKAGE_TYPES.map((type) => {
              const pkg = packages.find((p) => p.type === type)
              if (!pkg) return null
              const isCurrent = pkg.type === status.package_type
              return (
                <div
                  key={type}
                  className={`rounded-md border p-3 text-xs ${
                    isCurrent ? "border-primary" : "border-border"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {t(PACKAGE_LABELS[type] as "storage.free")}
                  </p>
                  <p className="text-muted-foreground">
                    {pkg.quota_readable}
                  </p>
                  {pkg.price != null && (
                    <p className="text-muted-foreground">
                      {pkg.currency} {pkg.price}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    className="mt-2 w-full"
                    disabled={isCurrent || upgrading === type}
                    onClick={() => onUpgrade?.(type)}
                    data-testid={`storage-upgrade-${type}`}
                  >
                    {upgrading === type && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    {isCurrent ? t("storage.currentPackage") : t("storage.upgrade")}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

type StoragePackageType = StorageStatus["package_type"]
