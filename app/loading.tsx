import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
    </div>
  )
}
