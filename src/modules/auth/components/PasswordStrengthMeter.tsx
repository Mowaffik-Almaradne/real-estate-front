"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
}

const STRENGTH_LEVELS: readonly { score: 0 | 1 | 2 | 3 | 4; label: string; color: string }[] = [
  { score: 0, label: "veryWeak", color: "bg-red-500" },
  { score: 1, label: "weak", color: "bg-orange-500" },
  { score: 2, label: "fair", color: "bg-yellow-500" },
  { score: 3, label: "good", color: "bg-emerald-500" },
  { score: 4, label: "strong", color: "bg-emerald-600" },
] as const

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return { ...STRENGTH_LEVELS[0] }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password) && password.length >= 12) score++
  const level = STRENGTH_LEVELS[score] ?? STRENGTH_LEVELS[0]
  return { score: level.score, label: level.label, color: level.color }
}

export interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const t = useTranslations("settings.security.password")
  const strength = calculatePasswordStrength(password)

  if (!password) return null

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex h-1.5 w-full gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-all",
              i <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{t(`strength.${strength.label}`)}</span>
        {password.length >= 8 && (
          <span className="flex items-center gap-1 text-emerald-600">
            <X className="size-3 rotate-45" />
            {t("requirementsMet", { count: 4 })}
          </span>
        )}
      </div>
    </div>
  )
}
