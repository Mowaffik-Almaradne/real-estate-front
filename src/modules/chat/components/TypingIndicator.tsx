"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

export interface TypingIndicatorProps {
  users: string[]
  className?: string
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  const t = useTranslations("chat.typing")
  if (users.length === 0) return null

  let label: string
  if (users.length === 1) {
    label = t("isTyping", { name: users[0] })
  } else {
    label = t("multipleTyping", { count: users.length })
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground",
        className
      )}
      aria-live="polite"
    >
      <span className="flex gap-0.5" aria-hidden>
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
        <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
      </span>
      <Loader2 className="size-3 animate-spin opacity-0" aria-hidden />
      <span>{label}</span>
    </div>
  )
}