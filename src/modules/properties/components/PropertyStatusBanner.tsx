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
  { icon: typeof Info; tone: string; title: string; description: string } | null
> = {
  [PropertyStatus.draft]: {
    icon: Info,
    tone: "bg-muted text-foreground border-border",
    title: "Draft",
    description: "This listing is a draft and isn't visible to the public yet.",
  },
  [PropertyStatus.pending]: {
    icon: Clock,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    title: "Awaiting review",
    description: "Your listing is in the moderation queue. We'll notify you once it's approved.",
  },
  [PropertyStatus.under_inspection]: {
    icon: ShieldAlert,
    tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    title: "Under inspection",
    description: "An inspector is reviewing this listing.",
  },
  [PropertyStatus.rejected]: {
    icon: AlertCircle,
    tone: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
    title: "Listing rejected",
    description: "Update the listing based on the feedback and resubmit.",
  },
  [PropertyStatus.suspended]: {
    icon: Ban,
    tone: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    title: "Listing suspended",
    description: "This listing has been temporarily hidden from the public.",
  },
  [PropertyStatus.sold]: {
    icon: Tag,
    tone: "bg-primary/10 text-primary border-primary/30",
    title: "Sold",
    description: "This property has been marked as sold.",
  },
  [PropertyStatus.archived]: {
    icon: Archive,
    tone: "bg-muted text-muted-foreground border-border",
    title: "Archived",
    description: "This listing is archived and hidden from the public.",
  },
  [PropertyStatus.approved]: null,
}

export function PropertyStatusBanner({
  status,
  rejectionReason,
  className,
}: PropertyStatusBannerProps) {
  const config = BANNER_CONFIG[status]
  if (!config) return null
  const Icon = config.icon
  return (
    <Card className={cn("border", config.tone, className)}>
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
        <Icon className="size-5 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{config.title}</p>
            <Badge variant="secondary" className={cn("capitalize", statusTone(status) === "muted" && "bg-background/60")}>
              {statusLabel(status)}
            </Badge>
          </div>
          <p className="text-sm opacity-90">{config.description}</p>
          {status === PropertyStatus.rejected && rejectionReason && (
            <div className="mt-2 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm">
              <p className="font-medium">Reason from the reviewer</p>
              <p className="mt-1 text-red-700 dark:text-red-300">{rejectionReason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
