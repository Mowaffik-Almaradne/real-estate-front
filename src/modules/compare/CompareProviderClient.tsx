"use client"

import { useParams } from "next/navigation"

import { CompareProvider } from "./CompareProvider"
import { CompareFloatingBar } from "./CompareFloatingBar"
import type { ReactNode } from "react"

export function CompareProviderClient({ children }: { children: ReactNode }) {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? "en"
  return (
    <CompareProvider>
      {children}
      <CompareFloatingBar locale={locale} />
    </CompareProvider>
  )
}