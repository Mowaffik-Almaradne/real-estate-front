"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--error-bg": "color-mix(in oklab, var(--destructive) 10%, var(--background))",
          "--error-text": "var(--destructive)",
          "--error-border": "color-mix(in oklab, var(--destructive) 30%, transparent)",
          "--success-bg": "color-mix(in oklab, var(--primary) 10%, var(--background))",
          "--success-text": "var(--primary)",
          "--success-border": "color-mix(in oklab, var(--primary) 30%, transparent)",
          "--warning-bg": "color-mix(in oklab, #f59e0b 12%, var(--background))",
          "--warning-text": "#b45309",
          "--warning-border": "color-mix(in oklab, #f59e0b 35%, transparent)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast group toast group-[.toaster]:bg-[var(--normal-bg)] group-[.toaster]:text-[var(--normal-text)] group-[.toaster]:border-[var(--normal-border)] group-[.toaster]:shadow-lg group-[.toaster]:rounded-[6px] group-[.toaster]:border group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:gap-3",
          error:
            "group-[.toaster]:bg-[var(--error-bg)] group-[.toaster]:text-[var(--error-text)] group-[.toaster]:border-[var(--error-border)]",
          success:
            "group-[.toaster]:bg-[var(--success-bg)] group-[.toaster]:text-[var(--success-text)] group-[.toaster]:border-[var(--success-border)]",
          warning:
            "group-[.toaster]:bg-[var(--warning-bg)] group-[.toaster]:text-[var(--warning-text)] group-[.toaster]:border-[var(--warning-border)]",
          title: "text-sm font-semibold",
          description: "text-sm opacity-90",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
