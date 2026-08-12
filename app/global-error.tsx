"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCw } from "lucide-react"

import { Button } from "components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[global-error]", error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main
          role="alert"
          className="flex min-h-screen items-center justify-center p-6"
        >
          <div className="flex max-w-md flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-6" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            )}
            <Button onClick={reset} type="button" className="mt-2">
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
