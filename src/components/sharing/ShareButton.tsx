"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { Check, Copy, Link2, Share2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "components/ui/button"
import { cn } from "lib/utils"

interface ShareButtonProps {
  url: string
  title?: string
  text?: string
  variant?: "icon" | "full"
  className?: string
}

const RESET_DELAY_MS = 2000

export function ShareButton({
  url,
  title,
  text,
  variant = "full",
  className,
}: ShareButtonProps) {
  const t = useTranslations("share")
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = url
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      setCopied(true)
      toast.success(t("copied"))
      window.setTimeout(() => setCopied(false), RESET_DELAY_MS)
    } catch (err) {
      console.error("Failed to copy", err)
      toast.error(t("error"))
    }
  }, [url, t])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: title ?? document.title,
      text: text ?? "",
      url,
    }
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
    }
    if (typeof nav.share === "function") {
      try {
        await nav.share(shareData)
        return
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return
        console.warn("Web Share API failed, falling back to copy", err)
      }
    }
    await handleCopy()
  }, [title, text, url, handleCopy])

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        className={className}
        aria-label={copied ? t("copiedAria") : t("aria")}
      >
        {copied ? (
          <Check className="size-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Share2 className="size-4" aria-hidden="true" />
        )}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        aria-label={t("aria")}
      >
        <Share2 className="me-2 size-4 rtl:ml-2 rtl:mr-0" aria-hidden="true" />
        {t("share")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? t("copiedAria") : t("copy")}
      >
        {copied ? (
          <>
            <Check className="me-2 size-4 text-emerald-600 rtl:ml-2 rtl:mr-0" aria-hidden="true" />
            {t("copied")}
          </>
        ) : (
          <>
            <Copy className="me-2 size-4 rtl:ml-2 rtl:mr-0" aria-hidden="true" />
            {t("copy")}
          </>
        )}
      </Button>
      <Link2 className="hidden size-4 text-muted-foreground sm:inline" aria-hidden="true" />
    </div>
  )
}