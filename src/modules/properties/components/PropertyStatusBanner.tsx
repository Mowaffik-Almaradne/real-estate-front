"use client"

import { useTranslations } from "next-intl"
import { AlertCircle, Archive, Ban, Clock, Info, ShieldAlert, Tag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { statusLabel, statusTone } from "@/lib/format"
import { PropertyStatus } from "@/types/enums"
import { cn } from "@/lib/utils"

interface PropertyStatusBannerProps {
  status: PropertyStatus
  rejectionReason?: string | null
  className?: string
}

const BANNER_CONFIG: Record<
  PropertyStatus,
  { icon: typeof Info; tone: string } | null
> = {
  [PropertyStatus.draft]: {
    icon: Info,
    tone: "bg-muted text-foreground border-border",
  },
  [PropertyStatus.pending]: {
    icon: Clock,
    tone: "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/30",
  },
  [PropertyStatus.under_inspection]: {
    icon: ShieldAlert,
    tone: "bg-blue-500/10 text-blue-900 dark:text-blue-200 border-blue-500/30",
  },
  [PropertyStatus.rejected]: {
    icon: AlertCircle,
    tone: "bg-red-500/10 text-red-900 dark:text-red-200 border-red-500/30",
  },
  [PropertyStatus.suspended]: {
    icon: Ban,
    tone: "bg-orange-500/10 text-orange-900 dark:text-orange-200 border-orange-500/30",
  },
  [PropertyStatus.sold]: {
    icon: Tag,
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  [PropertyStatus.archived]: {
    icon: Archive,
    tone: "bg-muted text-muted-foreground border-border",
  },
  [PropertyStatus.approved]: null,
}

export function PropertyStatusBanner({
  status,
  rejectionReason,
  className,
}: PropertyStatusBannerProps) {
  const t = useTranslations("property.statusBanner")
  const tStatus = useTranslations("status")
  const config = BANNER_CONFIG[status]
  if (!config) return null
  const Icon = config.icon
  return (
    <Card className={cn("border", config.tone, className)}>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
        <Icon className="size-5 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{t(`${status}.title`)}</p>
            <Badge variant="secondary" className={cn("capitalize", statusTone(status) === "muted" && "bg-background/60")}>
              {statusLabel(status, tStatus)}
            </Badge>
          </div>
          <p className="text-sm">{t(`${status}.description`)}</p>
          {status === PropertyStatus.rejected && rejectionReason && (
            <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm">
              <p className="font-medium">{t("rejectionReason")}</p>
              <p className="mt-1 text-red-700 dark:text-red-300">{rejectionReason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
